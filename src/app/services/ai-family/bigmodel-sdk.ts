export interface BigModelConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  timeout: number;
  maxRetries: number;
  temperature: number;
  topP: number;
  maxTokens: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stream?: boolean;
  requestId?: string;
}

export interface ChatCompletionResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
  createdAt: number;
}

export interface StreamChunk {
  id: string;
  delta: string;
  finishReason: string | null;
  index: number;
}

export type StreamCallback = (chunk: StreamChunk) => void;

export interface BigModelHealthStatus {
  connected: boolean;
  latency: number;
  lastError?: string;
  totalRequests: number;
  totalTokens: number;
  rateLimitRemaining: number;
}

const DEFAULT_CONFIG: Partial<BigModelConfig> = {
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  model: 'glm-4-flash',
  timeout: 30000,
  maxRetries: 3,
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 4096
};

export class BigModelSDK {
  private config: BigModelConfig;
  private requestCount = 0;
  private totalTokensUsed = 0;
  private lastHealthCheck: BigModelHealthStatus = {
    connected: false,
    latency: 0,
    totalRequests: 0,
    totalTokens: 0,
    rateLimitRemaining: 100
  };

  constructor(config: Partial<BigModelConfig> & { apiKey: string }) {
    this.config = { ...DEFAULT_CONFIG, ...config } as BigModelConfig;

    if (!this.config.apiKey || this.config.apiKey === 'YOUR_API_KEY') {
      console.warn('⚠️ [BigModel] API key not configured. Using mock mode.');
    }

    console.log('🤖 [BigModel] SDK initialized with model:', this.config.model);
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const startTime = Date.now();
    const requestId = request.requestId || this.generateId();

    if (!this.isConfigured()) {
      return this.mockResponse(request, requestId);
    }

    const url = `${this.config.baseURL}/chat/completions`;
    const body = {
      model: request.model || this.config.model,
      messages: request.messages,
      temperature: request.temperature ?? this.config.temperature,
      top_p: request.topP ?? this.config.topP,
      max_tokens: request.maxTokens ?? this.config.maxTokens,
      stream: false,
      request_id: requestId
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(this.config.timeout)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const latency = Date.now() - startTime;

        const result: ChatCompletionResponse = {
          id: data.id || requestId,
          content: data.choices?.[0]?.message?.content || '',
          model: data.model || this.config.model,
          usage: {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0
          },
          finishReason: data.choices?.[0]?.finish_reason || 'stop',
          createdAt: data.created || Date.now()
        };

        this.requestCount++;
        this.totalTokensUsed += result.usage.totalTokens;
        this.updateHealthStatus(true, latency);

        return result;
      } catch (error: unknown) {
        const err = error as Error;
        lastError = err;
        console.warn(`⚠️ [BigModel] Attempt ${attempt + 1} failed:`, err.message);

        if (attempt < this.config.maxRetries - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    const latency = Date.now() - startTime;
    this.updateHealthStatus(false, latency, lastError?.message);

    console.warn('🔄 [BigModel] All retries exhausted, using mock fallback');
    return this.mockResponse(request, requestId);
  }

  async streamChatCompletion(
    request: ChatCompletionRequest,
    onChunk: StreamCallback,
    onDone?: (fullResponse: string) => void
  ): Promise<void> {
    const startTime = Date.now();

    if (!this.isConfigured()) {
      await this.mockStreamResponse(request, onChunk, onDone);
      return;
    }

    const url = `${this.config.baseURL}/chat/completions`;
    const body = {
      model: request.model || this.config.model,
      messages: request.messages,
      temperature: request.temperature ?? this.config.temperature,
      top_p: request.topP ?? this.config.topP,
      max_tokens: request.maxTokens ?? this.config.maxTokens,
      stream: true
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.config.timeout * 2)
      });

      if (!response.ok) {
        throw new Error(`Stream API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream');

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullResponse += delta;
              onChunk({
                id: parsed.id || '',
                delta,
                finishReason: parsed.choices?.[0]?.finish_reason || null,
                index: 0
              });
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      this.requestCount++;
      const latency = Date.now() - startTime;
      this.updateHealthStatus(true, latency);
      onDone?.(fullResponse);

    } catch (error: unknown) {
      const err = error as Error;
      console.warn('⚠️ [BigModel] Stream failed:', err.message);
      this.updateHealthStatus(false, Date.now() - startTime, err.message);
      await this.mockStreamResponse(request, onChunk, onDone);
    }
  }

  getHealthStatus(): BigModelHealthStatus {
    return { ...this.lastHealthCheck };
  }

  getConfig(): Omit<BigModelConfig, 'apiKey'> {
    const { apiKey: _, ...safe } = this.config;
    return safe;
  }

  private isConfigured(): boolean {
    return !!this.config.apiKey
      && this.config.apiKey !== 'YOUR_API_KEY'
      && this.config.apiKey.length > 10;
  }

  private mockResponse(request: ChatCompletionRequest, requestId: string): ChatCompletionResponse {
    const lastUserMsg = request.messages.filter(m => m.role === 'user').pop();
    const input = lastUserMsg?.content || '';

    const mockContent = this.generateMockReply(input);

    return {
      id: `mock_${requestId}`,
      content: mockContent,
      model: 'mock-glm-4',
      usage: {
        promptTokens: input.length,
        completionTokens: mockContent.length,
        totalTokens: input.length + mockContent.length
      },
      finishReason: 'stop',
      createdAt: Date.now()
    };
  }

  private async mockStreamResponse(
    request: ChatCompletionRequest,
    onChunk: StreamCallback,
    onDone?: (fullResponse: string) => void
  ): Promise<void> {
    const lastUserMsg = request.messages.filter(m => m.role === 'user').pop();
    const input = lastUserMsg?.content || '';
    const fullResponse = this.generateMockReply(input);

    const words = fullResponse.split('');
    for (let i = 0; i < words.length; i++) {
      onChunk({
        id: `mock_stream_${i}`,
        delta: words[i],
        finishReason: i === words.length - 1 ? 'stop' : null,
        index: 0
      });
      await this.delay(20);
    }

    onDone?.(fullResponse);
  }

  private generateMockReply(input: string): string {
    if (/策略|交易|量化/.test(input)) {
      return '根据当前市场数据分析，建议采用均值回归策略，结合动量因子进行信号过滤。建议设置止损在2%以内，止盈目标为5-8%。当前市场波动率适中，适合执行该策略。';
    }
    if (/分析|数据|趋势/.test(input)) {
      return '数据显示当前处于温和上升趋势中。关键支撑位在当前价格下方约3%处，阻力位在上方约5%处。成交量呈现逐步放大态势，表明市场参与度提升。';
    }
    if (/预测|未来|走势/.test(input)) {
      return '基于历史数据和当前市场环境，预计未来30天市场将呈现震荡上行格局。乐观情景下可能上涨5-8%，悲观情景下可能下跌2-3%，中性预期上涨2-4%。';
    }
    if (/风险|安全/.test(input)) {
      return '当前风险评估结果：综合风险等级为"中等"。主要风险因素包括市场波动率上升和流动性收紧。建议保持谨慎，控制仓位在总资金的30%以内。';
    }
    return '感谢您的查询。作为YYC³ AI Family的智能助手，我可以为您提供量化交易策略分析、市场趋势预测、风险评估等专业服务。请问您需要哪方面的帮助？';
  }

  private updateHealthStatus(connected: boolean, latency: number, error?: string): void {
    this.lastHealthCheck = {
      connected,
      latency,
      lastError: error,
      totalRequests: this.requestCount,
      totalTokens: this.totalTokensUsed,
      rateLimitRemaining: Math.max(0, 100 - this.requestCount)
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

let sdkInstance: BigModelSDK | null = null;

export function getBigModelSDK(config?: Partial<BigModelConfig> & { apiKey: string }): BigModelSDK {
  if (!sdkInstance) {
    sdkInstance = new BigModelSDK(
      config || {
        apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_YYC_BIGMODEL_API_KEY) || 'YOUR_API_KEY'
      }
    );
  }
  return sdkInstance;
}
