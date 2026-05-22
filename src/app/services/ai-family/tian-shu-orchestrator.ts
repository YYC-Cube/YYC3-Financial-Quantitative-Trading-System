import PersonalizedAIAssistant from '../personalized-ai-assistant';

export type AIFamilyMemberId =
  | 'tian_shu'      // 元启·天枢 - 总指挥
  | 'qian_hang'     // 言启·千行 - 导航员 (NLU)
  | 'yu_shu'        // 语枢·万物 - 思考者 (分析)
  | 'prophet'       // 预见·先知 - 预言家 (预测)
  | 'bole'          // 千里·伯乐 - 推荐官 (个性化)
  | 'guardian'      // 智云·守护 - 安全部
  | 'grandmaster'   // 格物·宗师 - 质量官
  | 'grace';        // 创想·灵韵 - 创意官

export interface AIFamilyMember {
  id: AIFamilyMemberId;
  name: string;
  nameCN: string;
  description: string;
  capabilities: string[];
  version: string;
}

export interface FamilyOrchestrationRequest {
  userId: string;
  sessionId?: string;
  userInput: string;
  context?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  metadata?: {
    source?: string;
    timestamp?: Date;
    userAgent?: string;
  };
}

export interface FamilyOrchestrationResponse {
  success: boolean;
  requestId: string;
  response: any;
  participants: AIFamilyMemberId[];
  processingTimeMs: number;
  confidence: number;
  metadata: {
    routingDecision: RoutingDecision;
    fallbackUsed: boolean;
    cacheHit: boolean;
  };
}

export interface RoutingDecision {
  primaryMember: AIFamilyMemberId;
  secondaryMembers: AIFamilyMemberId[];
  reasoning: string;
  confidence: number;
}

const AI_FAMILY_MEMBERS: AIFamilyMember[] = [
  {
    id: 'tian_shu',
    name: 'TianShu',
    nameCN: '元启·天枢',
    description: '总指挥 · 决策中枢 · 编排调度',
    capabilities: ['orchestration', 'routing', 'scheduling', 'optimization'],
    version: '2.1.0'
  },
  {
    id: 'qian_hang',
    name: 'QianHang',
    nameCN: '言启·千行',
    description: '导航员 · 自然语言理解引擎',
    capabilities: ['nlu', 'intent_recognition', 'entity_extraction', 'context_management'],
    version: '2.1.0'
  },
  {
    id: 'yu_shu',
    name: 'YuShu',
    nameCN: '语枢·万物',
    description: '思考者 · 数据洞察分析师',
    capabilities: ['data_analysis', 'insight_generation', 'document_intelligence', 'hypothesis_testing'],
    version: '2.1.0'
  },
  {
    id: 'prophet',
    name: 'Prophet',
    nameCN: '预见·先知',
    description: '预言家 · 时间序列预测专家',
    capabilities: ['time_series_prediction', 'anomaly_detection', 'forecasting', 'risk_prediction'],
    version: '2.1.0'
  },
  {
    id: 'bole',
    name: 'Bole',
    nameCN: '千里·伯乐',
    description: '推荐官 · 个性化推荐引擎',
    capabilities: ['user_profiling', 'personalization', 'recommendation', 'potential_discovery'],
    version: '2.1.0'
  },
  {
    id: 'guardian',
    name: 'Guardian',
    nameCN: '智云·守护',
    description: '安全部 · 行为审计与威胁检测',
    capabilities: ['security_audit', 'threat_detection', 'behavioral_baseline', 'auto_response'],
    version: '2.1.0'
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    nameCN: '格物·宗师',
    description: '质量官 · 代码质量与性能监控',
    capabilities: ['code_quality', 'performance_monitoring', 'architecture_review', 'standard_evolution'],
    version: '2.1.0'
  },
  {
    id: 'grace',
    name: 'Grace',
    nameCN: '创想·灵韵',
    description: '创意官 · 多模态内容创作引擎',
    capabilities: ['creative_generation', 'content_creation', 'design_assistance', 'multimodal_production'],
    version: '2.1.0'
  }
];

export class TianShuOrchestrator {
  private members: Map<AIFamilyMemberId, any> = new Map();
  private personalAssistant: PersonalizedAIAssistant;
  private requestHistory: Map<string, FamilyOrchestrationResponse[]> = new Map();

  constructor() {
    this.personalAssistant = new PersonalizedAIAssistant();
    console.log('🧠 元启·天枢 TianShu Orchestrator initialized');
  }

  registerMember(memberId: AIFamilyMemberId, instance: any): void {
    const memberDef = AI_FAMILY_MEMBERS.find(m => m.id === memberId);
    if (!memberDef) {
      throw new Error(`Unknown AI Family member: ${memberId}`);
    }

    this.members.set(memberId, instance);
    console.log(`✅ Registered ${memberDef.nameCN} (${memberId})`);
  }

  getMember(memberId: AIFamilyMemberId): any {
    return this.members.get(memberId);
  }

  listRegisteredMembers(): AIFamilyMember[] {
    return Array.from(this.members.keys())
      .map(id => AI_FAMILY_MEMBERS.find(m => m.id === id)!);
  }

  async orchestrate(request: FamilyOrchestrationRequest): Promise<FamilyOrchestrationResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      console.log(`🎯 [${requestId}] Orchestration started for user: ${request.userId}`);

      const routingDecision = await this.makeRoutingDecision(request);

      console.log(`📍 [${requestId}] Routing decision:`, routingDecision);

      let response: any;
      let fallbackUsed = false;

      if (this.members.has(routingDecision.primaryMember)) {
        const primaryInstance = this.members.get(routingDecision.primaryMember);

        if (typeof primaryInstance.process === 'function') {
          response = await primaryInstance.process(request);
        } else if (typeof primaryInstance.execute === 'function') {
          response = await primaryInstance.execute(request);
        } else {
          throw new Error(`Primary member ${routingDecision.primaryMember} has no process/execute method`);
        }

        for (const secondaryId of routingDecision.secondaryMembers) {
          if (this.members.has(secondaryId)) {
            const secondaryInstance = this.members.get(secondaryId);
            try {
              const secondaryResult = await this.callSecondaryMember(secondaryInstance, request, response);
              response = this.mergeResults(response, secondaryResult);
            } catch (error: unknown) {
              const err = error as Error;
              console.warn(`⚠️ [${requestId}] Secondary member ${secondaryId} failed:`, err.message);
            }
          }
        }
      } else {
        console.warn(`⚠️ [${requestId}] Primary member ${routingDecision.primaryMember} not registered, using fallback`);
        response = await this.executeFallback(request);
        fallbackUsed = true;
      }

      const processingTimeMs = Date.now() - startTime;

      const result: FamilyOrchestrationResponse = {
        success: true,
        requestId,
        response,
        participants: [routingDecision.primaryMember, ...routingDecision.secondaryMembers],
        processingTimeMs,
        confidence: routingDecision.confidence,
        metadata: {
          routingDecision,
          fallbackUsed,
          cacheHit: false
        }
      };

      this.recordRequestHistory(request.userId, result);

      console.log(`✅ [${requestId}] Orchestration completed in ${processingTimeMs}ms`);

      return result;

    } catch (error: unknown) {
      const err = error as Error;
      console.error(`❌ [${requestId}] Orchestration failed:`, error);

      return {
        success: false,
        requestId,
        response: { error: err.message },
        participants: [],
        processingTimeMs: Date.now() - startTime,
        confidence: 0,
        metadata: {
          routingDecision: { primaryMember: 'tian_shu' as AIFamilyMemberId, secondaryMembers: [] as AIFamilyMemberId[], reasoning: 'Error fallback', confidence: 0 },
          fallbackUsed: true,
          cacheHit: false
        }
      };
    }
  }

  private async makeRoutingDecision(request: FamilyOrchestrationRequest): Promise<RoutingDecision> {
    const input = request.userInput.toLowerCase();
    const _context = request.context || {};

    const intentPatterns: { pattern: RegExp; primary: AIFamilyMemberId; secondary: AIFamilyMemberId[]; reasoning: string; confidence: number }[] = [
      {
        pattern: /策略|量化|交易|回测|信号|入场|出场|止盈|止损/,
        primary: 'bole',
        secondary: ['yu_shu', 'prophet'],
        reasoning: '用户询问交易策略相关内容，需要推荐+分析+预测',
        confidence: 0.92
      },
      {
        pattern: /分析|报表|数据|统计|趋势|对比|洞察|解读/,
        primary: 'yu_shu',
        secondary: ['qian_hang'],
        reasoning: '用户要求数据分析和洞察生成',
        confidence: 0.88
      },
      {
        pattern: /预测|预报|未来|预期|前景|走势| forecast|predict/,
        primary: 'prophet',
        secondary: ['yu_shu'],
        reasoning: '用户要求预测未来趋势',
        confidence: 0.90
      },
      {
        pattern: /推荐|适合我|个性化|定制|建议| recommend|suggest/,
        primary: 'bole',
        secondary: ['qian_hang'],
        reasoning: '用户寻求个性化推荐',
        confidence: 0.89
      },
      {
        pattern: /安全|风险|威胁|异常|防护|audit|security|risk/,
        primary: 'guardian',
        secondary: ['prophet'],
        reasoning: '用户关注安全或风险问题',
        confidence: 0.91
      },
      {
        pattern: /质量|性能|优化|重构|审查|review|quality|performance/,
        primary: 'grandmaster',
        secondary: [],
        reasoning: '用户询问质量或性能相关问题',
        confidence: 0.87
      },
      {
        pattern: /创意|设计|文案|内容|生成|创作|creative|design|generate/,
        primary: 'grace',
        secondary: ['yu_shu'],
        reasoning: '用户要求创意或内容生成',
        confidence: 0.86
      },
      {
        pattern: /帮助|怎么|如何|what|how|explain|解释/,
        primary: 'qian_hang',
        secondary: [],
        reasoning: '通用查询或帮助请求',
        confidence: 0.75
      }
    ];

    for (const { pattern, primary, secondary, reasoning, confidence } of intentPatterns) {
      if (pattern.test(input)) {
        return {
          primaryMember: primary,
          secondaryMembers: secondary,
          reasoning,
          confidence
        };
      }
    }

    return {
      primaryMember: 'qian_hang',
      secondaryMembers: [] as AIFamilyMemberId[],
      reasoning: '未匹配到特定意图，使用默认NLU处理',
      confidence: 0.60
    };
  }

  private async callSecondaryMember(instance: any, request: FamilyOrchestrationRequest, primaryResult: any): Promise<any> {
    if (typeof instance.enhance === 'function') {
      return await instance.enhance(request, primaryResult);
    } else if (typeof instance.process === 'function') {
      return await instance.process({ ...request, context: { ...request.context, primaryResult } });
    } else if (typeof instance.analyze === 'function') {
      return await instance.analyze(primaryResult);
    }
    throw new Error('Secondary member has no compatible method');
  }

  private mergeResults(primary: any, secondary: any): any {
    if (typeof primary === 'object' && typeof secondary === 'object') {
      return {
        ...primary,
        ...secondary,
        _enriched: true,
        _sources: [primary._source || 'primary', secondary._source || 'secondary']
      };
    }
    return { primary, secondary, _merged: true };
  }

  private async executeFallback(request: FamilyOrchestrationRequest): Promise<any> {
    console.log('🔄 Executing fallback with PersonalizedAIAssistant');

    try {
      const userProfile = await this.personalAssistant.initializeUserProfile(
        request.userId,
        request.context || {}
      );

      const strategy = await this.personalAssistant.generateStrategyFromNaturalLanguage(
        request.userInput
      );

      return {
        source: 'fallback_personalized_assistant',
        strategy,
        userProfile: {
          experienceLevel: userProfile.basicInfo.experienceLevel,
          riskTolerance: userProfile.basicInfo.riskTolerance,
          tradingStyle: userProfile.basicInfo.tradingStyle
        },
        message: 'Processed via fallback mechanism (PersonalizedAIAssistant)'
      };

    } catch (error: unknown) {
      const err = error as Error;
      return {
        source: 'error_fallback',
        error: err.message,
        message: 'All processing methods failed'
      };
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private recordRequestHistory(userId: string, response: FamilyOrchestrationResponse): void {
    if (!this.requestHistory.has(userId)) {
      this.requestHistory.set(userId, []);
    }

    const history = this.requestHistory.get(userId)!;
    history.push(response);

    if (history.length > 100) {
      history.shift(); // Keep only last 100 requests
    }
  }

  getRequestHistory(userId: string, limit: number = 20): FamilyOrchestrationResponse[] {
    const history = this.requestHistory.get(userId) || [];
    return history.slice(-limit);
  }

  getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    registeredMembers: number;
    totalMembersAvailable: number;
    uptime: number;
  } {
    return {
      status: this.members.size >= 5 ? 'healthy' : this.members.size >= 3 ? 'degraded' : 'unhealthy',
      registeredMembers: this.members.size,
      totalMembersAvailable: AI_FAMILY_MEMBERS.length,
      uptime: process.uptime()
    };
  }

  static getAIFamilyDefinition(): AIFamilyMember[] {
    return [...AI_FAMILY_MEMBERS];
  }
}

let orchestratorInstance: TianShuOrchestrator | null = null;

export function getTianShuOrchestrator(): TianShuOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new TianShuOrchestrator();
  }
  return orchestratorInstance;
}
