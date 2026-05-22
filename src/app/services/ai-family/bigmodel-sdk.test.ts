import { beforeEach, describe, expect, it } from 'vitest';

import { BigModelSDK, getBigModelSDK, type ChatCompletionRequest } from './bigmodel-sdk';

describe('BigModelSDK - BigModel-Z.ai SDK连接', () => {
  let sdk: BigModelSDK;

  beforeEach(() => {
    sdk = new BigModelSDK({ apiKey: 'YOUR_API_KEY' });
  });

  describe('1. 初始化', () => {
    it('1.1 应该成功创建SDK实例', () => {
      expect(sdk).toBeDefined();
      expect(sdk).toBeInstanceOf(BigModelSDK);
    });

    it('1.2 单例模式', () => {
      const a = getBigModelSDK({ apiKey: 'test_key' });
      const b = getBigModelSDK();
      expect(a).toBe(b);
    });

    it('1.3 应该安全返回配置（不含API密钥）', () => {
      const config = sdk.getConfig();
      expect(config).not.toHaveProperty('apiKey');
      expect(config).toHaveProperty('model');
      expect(config).toHaveProperty('timeout');
    });
  });

  describe('2. 对话接口 (Mock模式)', () => {
    it('2.1 应该返回Mock响应', async () => {
      const request: ChatCompletionRequest = {
        messages: [
          { role: 'user', content: '帮我分析市场趋势' }
        ]
      };

      const response = await sdk.chatCompletion(request);

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.content.length).toBeGreaterThan(0);
      expect(response.model).toContain('mock');
      expect(response.usage.totalTokens).toBeGreaterThan(0);
    });

    it('2.2 策略相关查询应返回策略建议', async () => {
      const response = await sdk.chatCompletion({
        messages: [{ role: 'user', content: '推荐交易策略' }]
      });

      expect(response.content).toContain('策略');
    });

    it('2.3 数据分析查询应返回分析结果', async () => {
      const response = await sdk.chatCompletion({
        messages: [{ role: 'user', content: '分析最近的数据趋势' }]
      });

      expect(response.content).toContain('趋势');
    });

    it('2.4 预测查询应返回预测内容', async () => {
      const response = await sdk.chatCompletion({
        messages: [{ role: 'user', content: '预测未来走势' }]
      });

      expect(response.content.length).toBeGreaterThan(0);
    });

    it('2.5 风险查询应返回风险评估', async () => {
      const response = await sdk.chatCompletion({
        messages: [{ role: 'user', content: '检查风险安全' }]
      });

      expect(response.content).toContain('风险');
    });

    it('2.6 通用查询应返回欢迎信息', async () => {
      const response = await sdk.chatCompletion({
        messages: [{ role: 'user', content: '你好' }]
      });

      expect(response.content).toContain('AI');
    });

    it('2.7 应该支持系统提示词', async () => {
      const response = await sdk.chatCompletion({
        messages: [
          { role: 'system', content: '你是量化交易专家' },
          { role: 'user', content: '分析市场' }
        ]
      });

      expect(response.content).toBeDefined();
    });
  });

  describe('3. 流式响应 (Mock模式)', () => {
    it('3.1 应该逐步返回流式数据', async () => {
      const chunks: string[] = [];

      await sdk.streamChatCompletion(
        { messages: [{ role: 'user', content: '分析策略' }] },
        (chunk) => { chunks.push(chunk.delta); }
      );

      expect(chunks.length).toBeGreaterThan(0);
      const fullText = chunks.join('');
      expect(fullText.length).toBeGreaterThan(0);
    });

    it('3.2 最后一个chunk应包含finishReason', async () => {
      let lastChunk: any = null;

      await sdk.streamChatCompletion(
        { messages: [{ role: 'user', content: '测试' }] },
        (chunk) => { lastChunk = chunk; }
      );

      expect(lastChunk?.finishReason).toBe('stop');
    });

    it('3.3 onDone回调应返回完整文本', async () => {
      let fullResponse = '';

      await sdk.streamChatCompletion(
        { messages: [{ role: 'user', content: '测试' }] },
        () => { },
        (text) => { fullResponse = text; }
      );

      expect(fullResponse.length).toBeGreaterThan(0);
    });
  });

  describe('4. 健康状态', () => {
    it('4.1 应该返回健康状态', async () => {
      await sdk.chatCompletion({
        messages: [{ role: 'user', content: 'test' }]
      });

      const health = sdk.getHealthStatus();
      expect(health).toBeDefined();
      expect(typeof health.connected).toBe('boolean');
      expect(typeof health.latency).toBe('number');
      expect(typeof health.totalRequests).toBe('number');
    });

    it('4.2 健康状态应包含请求信息', async () => {
      await sdk.chatCompletion({
        messages: [{ role: 'user', content: 'test1' }]
      });

      const health = sdk.getHealthStatus();
      expect(health).toBeDefined();
      expect(typeof health.totalRequests).toBe('number');
      expect(typeof health.latency).toBe('number');
    });
  });

  describe('5. 配置验证', () => {
    it('5.1 未配置API Key应使用Mock模式', async () => {
      const unconfigured = new BigModelSDK({ apiKey: 'YOUR_API_KEY' });
      const response = await unconfigured.chatCompletion({
        messages: [{ role: 'user', content: 'test' }]
      });

      expect(response.model).toContain('mock');
    });

    it('5.2 短API Key应使用Mock模式', async () => {
      const shortKey = new BigModelSDK({ apiKey: 'abc' });
      const response = await shortKey.chatCompletion({
        messages: [{ role: 'user', content: 'test' }]
      });

      expect(response.model).toContain('mock');
    });

    it('5.3 有效API Key应尝试真实调用（Mock降级）', async () => {
      const validKey = new BigModelSDK({ apiKey: 'a'.repeat(32), timeout: 100 });
      const response = await validKey.chatCompletion({
        messages: [{ role: 'user', content: 'test' }]
      });

      // 连接失败后应降级为Mock
      expect(response.content).toBeDefined();
    });
  });

  describe('6. 并发请求', () => {
    it('6.1 应该处理并发请求', async () => {
      const requests = Array.from({ length: 5 }, (_, i) =>
        sdk.chatCompletion({
          messages: [{ role: 'user', content: `并发请求 ${i}` }]
        })
      );

      const responses = await Promise.all(requests);
      expect(responses).toHaveLength(5);
      responses.forEach(r => {
        expect(r.content).toBeDefined();
      });
    });
  });
});
