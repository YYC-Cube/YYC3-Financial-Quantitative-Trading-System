import type { AIFamilyMemberId, FamilyOrchestrationRequest } from './tian-shu-orchestrator';

export interface NLUIntent {
  id: string;
  label: string;
  confidence: number;
  category: IntentCategory;
  entities: Entity[];
  action?: string;
}

export interface Entity {
  text: string;
  type: EntityType;
  value: any;
  startIndex: number;
  endIndex: number;
}

export enum IntentCategory {
  ANALYSIS = 'analysis',
  PREDICTION = 'prediction',
  RECOMMENDATION = 'recommendation',
  CREATION = 'creation',
  SECURITY = 'security',
  QUALITY = 'quality',
  GENERAL = 'general'
}

export enum EntityType {
  STOCK_SYMBOL = 'stock_symbol',
  DATE_RANGE = 'date_range',
  METRIC = 'metric',
  STRATEGY_TYPE = 'strategy_type',
  RISK_LEVEL = 'risk_level',
  AMOUNT = 'amount',
  PERCENTAGE = 'percentage',
  TIME_PERIOD = 'time_period',
  CUSTOM_ENTITY = 'custom_entity'
}

export interface NLUParsingResult {
  intent: NLUIntent;
  originalText: string;
  normalizedText: string;
  language: string;
  sentiment: SentimentScore;
  complexity: ComplexityScore;
  contextRequirements: string[];
  suggestedMembers: AIFamilyMemberId[];
  processingTimeMs: number;
}

export interface SentimentScore {
  score: number;
  magnitude: number;
  label: 'positive' | 'negative' | 'neutral' | 'mixed';
}

export interface ComplexityScore {
  level: 'simple' | 'moderate' | 'complex' | 'expert';
  score: number;
  factors: string[];
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  turnCount: number;
  history: ConversationTurn[];
  userPreferences: UserLanguagePreferences;
  currentTopic?: string;
  pendingTasks?: string[];
}

export interface ConversationTurn {
  turnId: string;
  timestamp: Date;
  userInput: string;
  systemResponse: string;
  intent: NLUIntent;
  metadata: Record<string, any>;
}

export interface UserLanguagePreferences {
  primaryLanguage: string;
  formalityLevel: 'formal' | 'casual' | 'technical';
  detailPreference: 'brief' | 'moderate' | 'detailed';
  domainExpertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export class QianHangNLUEngine {
  private intentPatterns: Map<RegExp, Partial<NLUIntent>> = new Map();
  private entityExtractors: Map<EntityType, RegExp> = new Map();
  private contextStore: Map<string, ConversationContext> = new Map();

  constructor() {
    this.initializeIntentPatterns();
    this.initializeEntityExtractors();
    console.log('🧭 言启·千行 QianHang NLU Engine initialized');
  }

  async process(request: FamilyOrchestrationRequest): Promise<NLUParsingResult> {
    const startTime = Date.now();

    console.log(`🔍 [QianHang] Processing input: "${request.userInput.substring(0, 50)}..."`);

    const normalizedText = this.normalizeText(request.userInput);
    const intent = await this.identifyIntent(normalizedText);
    const entities = await this.extractEntities(normalizedText, intent);
    const sentiment = this.analyzeSentiment(normalizedText);
    const complexity = this.assessComplexity(normalizedText, intent, entities);

    intent.entities = entities;

    const suggestedMembers = this.routeToFamilyMembers(intent);
    const contextRequirements = this.determineContextRequirements(intent);

    const result: NLUParsingResult = {
      intent,
      originalText: request.userInput,
      normalizedText,
      language: this.detectLanguage(request.userInput),
      sentiment,
      complexity,
      contextRequirements,
      suggestedMembers,
      processingTimeMs: Date.now() - startTime
    };

    this.updateConversationContext(request.userId, request, result);

    console.log(`✅ [QianHang] Intent identified: ${intent.label} (${(intent.confidence * 100).toFixed(1)}%)`);

    return result;
  }

  async processWithContext(
    request: FamilyOrchestrationRequest,
    context: ConversationContext
  ): Promise<NLUParsingResult> {
    const baseResult = await this.process(request);

    if (context.history.length > 0) {
      const lastTurn = context.history[context.history.length - 1];

      if (this.isFollowUpQuestion(request.userInput, lastTurn)) {
        baseResult.intent = this.enrichIntentWithContext(baseResult.intent, lastTurn);
        baseResult.contextRequirements.push('conversation_history');
      }

      if (context.currentTopic && !baseResult.intent.action) {
        baseResult.contextRequirements.push(`topic:${context.currentTopic}`);
      }
    }

    return baseResult;
  }

  getConversationContext(userId: string): ConversationContext | undefined {
    return this.contextStore.get(userId);
  }

  clearConversationContext(userId: string): void {
    this.contextStore.delete(userId);
    console.log(`🗑️ [QianHang] Cleared context for user: ${userId}`);
  }

  private initializeIntentPatterns(): void {
    this.intentPatterns.set(/策略|量化|交易|回测|信号|入场|出场|止盈|止损/, {
      id: 'trading_strategy',
      label: '交易策略咨询',
      confidence: 0.92,
      category: IntentCategory.RECOMMENDATION,
      action: 'recommend_strategy'
    });

    this.intentPatterns.set(/分析|洞察|趋势|数据|报表|图表|统计/, {
      id: 'data_analysis',
      label: '数据分析请求',
      confidence: 0.90,
      category: IntentCategory.ANALYSIS,
      action: 'analyze_data'
    });

    this.intentPatterns.set(/预测|预报|未来|走势|预期|前景|展望/, {
      id: 'prediction',
      label: '趋势预测请求',
      confidence: 0.88,
      category: IntentCategory.PREDICTION,
      action: 'predict_trend'
    });

    this.intentPatterns.set(/推荐|建议|适合|最佳|优选|选择/, {
      id: 'recommendation',
      label: '个性化推荐',
      confidence: 0.87,
      category: IntentCategory.RECOMMENDATION,
      action: 'provide_recommendation'
    });

    this.intentPatterns.set(/安全|风险|威胁|漏洞|攻击|防护|合规/, {
      id: 'security_check',
      label: '安全风险评估',
      confidence: 0.91,
      category: IntentCategory.SECURITY,
      action: 'assess_security'
    });

    this.intentPatterns.set(/质量|审查|优化|重构|性能|代码|测试/, {
      id: 'quality_review',
      label: '质量审计请求',
      confidence: 0.89,
      category: IntentCategory.QUALITY,
      action: 'review_quality'
    });

    this.intentPatterns.set(/生成|创作|设计|文案|内容|创意|灵感/, {
      id: 'content_creation',
      label: '创意生成请求',
      confidence: 0.86,
      category: IntentCategory.CREATION,
      action: 'create_content'
    });

    this.intentPatterns.set(/帮助|说明|解释|教程|指南|如何|怎么/, {
      id: 'general_help',
      label: '通用帮助',
      confidence: 0.75,
      category: IntentCategory.GENERAL,
      action: 'provide_help'
    });
  }

  private initializeEntityExtractors(): void {
    this.entityExtractors.set(EntityType.STOCK_SYMBOL, /\b[A-Z]{2,5}\b/g);
    this.entityExtractors.set(EntityType.DATE_RANGE, /(\d{4}[-年]\d{1,2}[-月]\d{1,2}[日]?|\d{1,2}月\d{1,2}日|最近\d+[天周月年]|过去\d+[天周月年])/g);
    this.entityExtractors.set(EntityType.METRIC, /(收益率|波动率|夏普比率|最大回撤|成交量|市值|市盈率)/g);
    this.entityExtractors.set(EntityType.STRATEGY_TYPE, /(均线|动量|均值回归|套利|网格|马丁格尔|趋势跟踪)/g);
    this.entityExtractors.set(EntityType.RISK_LEVEL, /(保守|稳健|激进|高风险|低风险|中性)/g);
    this.entityExtractors.set(EntityType.AMOUNT, /[￥$€£]?\d+(?:,\d{3})*(?:\.\d+)?(?:万|亿)?/g);
    this.entityExtractors.set(EntityType.PERCENTAGE, /\d+(?:\.\d+)?%/g);
    this.entityExtractors.set(EntityType.TIME_PERIOD, /(短期|中期|长期|日内|周线|月线|季线|年线)/g);
  }

  private normalizeText(text: string): string {
    let normalized = text.trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\u4e00-\u9fa5\s.,!?;:()（）【】，。！？；：""''%￥$]/g, '');

    normalized = normalized.toLowerCase();

    return normalized;
  }

  private async identifyIntent(text: string): Promise<NLUIntent> {
    let bestMatch: Partial<NLUIntent> = {
      id: 'unknown',
      label: '未识别意图',
      confidence: 0.30,
      category: IntentCategory.GENERAL
    };

    for (const [pattern, intent] of this.intentPatterns) {
      if (pattern.test(text)) {
        if ((intent.confidence || 0) > (bestMatch.confidence || 0)) {
          bestMatch = { ...intent };
        }
      }
    }

    return {
      id: bestMatch.id || 'unknown',
      label: bestMatch.label || '未识别意图',
      confidence: bestMatch.confidence || 0.30,
      category: bestMatch.category || IntentCategory.GENERAL,
      action: bestMatch.action,
      entities: []
    };
  }

  private async extractEntities(text: string, intent: NLUIntent): Promise<Entity[]> {
    const entities: Entity[] = [];

    for (const [entityType, pattern] of this.entityExtractors) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        entities.push({
          text: match[0],
          type: entityType,
          value: this.parseEntityValue(entityType, match[0]),
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
      }
    }

    if (intent.category === IntentCategory.ANALYSIS) {
      const analysisEntities = this.extractAnalysisSpecificEntities(text);
      entities.push(...analysisEntities);
    }

    return entities;
  }

  private parseEntityValue(type: EntityType, raw: string): any {
    switch (type) {
      case EntityType.PERCENTAGE:
        return parseFloat(raw.replace('%', '')) / 100;
      case EntityType.AMOUNT:
        return parseFloat(raw.replace(/[^0-9.]/g, ''));
      case EntityType.DATE_RANGE:
        return this.parseDateRange(raw);
      default:
        return raw;
    }
  }

  private parseDateRange(raw: string): { start: Date; end: Date } | string {
    const now = new Date();
    if (raw.includes('天')) {
      const days = parseInt(raw.match(/\d+/)?.[0] || '7');
      return {
        start: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
        end: now
      };
    }
    return raw;
  }

  private extractAnalysisSpecificEntities(text: string): Entity[] {
    const entities: Entity[] = [];

    const comparisonWords = ['对比', '比较', 'vs', 'versus', '差异'];
    for (const word of comparisonWords) {
      const index = text.indexOf(word);
      if (index !== -1) {
        entities.push({
          text: word,
          type: EntityType.CUSTOM_ENTITY,
          value: 'comparison',
          startIndex: index,
          endIndex: index + word.length
        });
      }
    }

    return entities;
  }

  private analyzeSentiment(text: string): SentimentScore {
    const positiveWords = ['好', '优秀', '棒', '上涨', '盈利', '增长', '看好', '推荐', '乐观'];
    const negativeWords = ['差', '糟糕', '下跌', '亏损', '下降', '担忧', '风险', '悲观', '危险'];

    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const matches = text.match(regex);
      if (matches) positiveCount += matches.length;
    });

    negativeWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const matches = text.match(regex);
      if (matches) negativeCount += matches.length;
    });

    const total = positiveCount + negativeCount;
    const score = total === 0 ? 0 : (positiveCount - negativeCount) / total;
    const magnitude = Math.min(total / 10, 1);

    let label: SentimentScore['label'] = 'neutral';
    if (score > 0.3) label = 'positive';
    else if (score < -0.3) label = 'negative';
    else if (Math.abs(score) <= 0.3 && magnitude > 0.3) label = 'mixed';

    return { score, magnitude, label };
  }

  private assessComplexity(
    text: string,
    _intent: NLUIntent,
    entities: Entity[]
  ): ComplexityScore {
    let score = 0;
    const factors: string[] = [];

    if (text.length > 50) { score += 1; factors.push('长文本'); }
    if (entities.length >= 3) { score += 2; factors.push('多实体'); }
    if (/[（(][^）)]*[）)]/.test(text)) { score += 1; factors.push('嵌套结构'); }
    if (/如果|假设|假如/.test(text)) { score += 2; factors.push('条件逻辑'); }
    if (/对比|比较|差异/.test(text)) { score += 1; factors.push('对比分析'); }
    if (/\d{4}.*\d{1,2}.*\d{1,2}/.test(text)) { score += 1; factors.push('精确日期'); }

    let level: ComplexityScore['level'] = 'simple';
    if (score >= 6) level = 'expert';
    else if (score >= 4) level = 'complex';
    else if (score >= 2) level = 'moderate';

    return { level, score: Math.min(score / 8, 1), factors };
  }

  private routeToFamilyMembers(intent: NLUIntent): AIFamilyMemberId[] {
    const primaryMap: Record<IntentCategory, AIFamilyMemberId> = {
      [IntentCategory.ANALYSIS]: 'yu_shu',
      [IntentCategory.PREDICTION]: 'prophet',
      [IntentCategory.RECOMMENDATION]: 'bole',
      [IntentCategory.CREATION]: 'grace',
      [IntentCategory.SECURITY]: 'guardian',
      [IntentCategory.QUALITY]: 'grandmaster',
      [IntentCategory.GENERAL]: 'qian_hang'
    };

    const secondaryMap: Record<IntentCategory, AIFamilyMemberId[]> = {
      [IntentCategory.ANALYSIS]: ['qian_hang'],
      [IntentCategory.PREDICTION]: ['yu_shu', 'bole'],
      [IntentCategory.RECOMMENDATION]: ['yu_shu', 'prophet'],
      [IntentCategory.CREATION]: ['qian_hang'],
      [IntentCategory.SECURITY]: ['tian_shu'],
      [IntentCategory.QUALITY]: ['tian_shu'],
      [IntentCategory.GENERAL]: []
    };

    const primary = primaryMap[intent.category];
    const secondary = secondaryMap[intent.category] || [];

    return [primary, ...secondary];
  }

  private determineContextRequirements(intent: NLUIntent): string[] {
    const requirements: string[] = [];

    requirements.push('user_profile');

    if ([IntentCategory.ANALYSIS, IntentCategory.PREDICTION].includes(intent.category)) {
      requirements.push('market_data', 'historical_data');
    }

    if (intent.category === IntentCategory.RECOMMENDATION) {
      requirements.push('user_portfolio', 'risk_preferences');
    }

    if (intent.entities.some(e => e.type === EntityType.STOCK_SYMBOL)) {
      requirements.push('stock_info');
    }

    if (intent.entities.some(e => e.type === EntityType.DATE_RANGE)) {
      requirements.push('time_series_data');
    }

    return requirements;
  }

  private detectLanguage(text: string): string {
    const chineseRegex = /[\u4e00-\u9fa5]/;
    const chineseMatches = text.match(chineseRegex);

    if (chineseMatches && chineseMatches.length > text.length * 0.3) {
      return 'zh-CN';
    }

    return 'en-US';
  }

  private updateConversationContext(
    userId: string,
    request: FamilyOrchestrationRequest,
    result: NLUParsingResult
  ): void {
    let context = this.contextStore.get(userId);

    if (!context) {
      context = {
        userId,
        sessionId: this.generateSessionId(),
        turnCount: 0,
        history: [],
        userPreferences: {
          primaryLanguage: result.language,
          formalityLevel: 'casual',
          detailPreference: 'moderate',
          domainExpertise: result.complexity.level === 'simple' ? 'beginner' :
            result.complexity.level === 'expert' ? 'advanced' : 'intermediate'
        }
      };
    }

    const turn: ConversationTurn = {
      turnId: this.generateTurnId(),
      timestamp: new Date(),
      userInput: request.userInput,
      systemResponse: '',
      intent: result.intent,
      metadata: {
        processingTimeMs: result.processingTimeMs,
        suggestedMembers: result.suggestedMembers
      }
    };

    context.history.push(turn);
    context.turnCount++;
    context.currentTopic = result.intent.label;

    if (context.history.length > 20) {
      context.history = context.history.slice(-15);
    }

    this.contextStore.set(userId, context);
  }

  private isFollowUpQuestion(currentInput: string, _lastTurn: ConversationTurn): boolean {
    const followUpIndicators = [
      '呢', '吗', '那', '然后', '接下来', '还有', '其他',
      '如何', '怎么样', '为什么', '多少', '具体',
      'what about', 'how about', 'then', 'else', 'why', 'how many'
    ];

    const lowerInput = currentInput.toLowerCase();
    return followUpIndicators.some(indicator => lowerInput.includes(indicator));
  }

  private enrichIntentWithContext(currentIntent: NLUIntent, _lastTurn: ConversationTurn): NLUIntent {
    return {
      ...currentIntent,
      confidence: Math.min(currentIntent.confidence + 0.1, 1.0)
    };
  }

  private generateSessionId(): string {
    return `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateTurnId(): string {
    return `turn_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
  }

  getEngineStats(): {
    registeredIntents: number;
    registeredEntityTypes: number;
    activeContexts: number;
    averageProcessingTime: number;
  } {
    return {
      registeredIntents: this.intentPatterns.size,
      registeredEntityTypes: this.entityExtractors.size,
      activeContexts: this.contextStore.size,
      averageProcessingTime: 45
    };
  }
}

let nluEngineInstance: QianHangNLUEngine | null = null;

export function getQianHangNLUEngine(): QianHangNLUEngine {
  if (!nluEngineInstance) {
    nluEngineInstance = new QianHangNLUEngine();
  }
  return nluEngineInstance;
}
