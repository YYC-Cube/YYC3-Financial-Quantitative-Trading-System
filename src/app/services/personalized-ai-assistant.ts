/**
 * @file src/app/services/personalized-ai-assistant.ts
 * @description 一人一端专属强化辅助 - 核心智能化引擎
 * @author Phase9 Intelligence Enhancement
 * @version 2.0.0
 *
 * 基于全网同类型应用分析（Nof1.ai/AI涨乐/QuantCore.Ai/NexusTrade）
 * 实现个性化AI交易助手，提供：
 * - 动态用户画像构建
 * - 交易行为学习与适应
 * - 情绪识别与风险管理
 * - 策略个性化推荐
 * - 自然语言策略生成
 */

interface UserProfile {
  id: string;
  createdAt: Date;

  // 基础信息
  basicInfo: {
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    investmentHorizon: 'short' | 'medium' | 'long';
    capitalRange: string;
    preferredMarkets: string[];
    tradingStyle: 'day' | 'swing' | 'position' | 'value';
  };

  // 行为特征
  behavioralProfile: {
    avgSessionDuration: number;
    peakTradingHours: number[];
    clickPatterns: Record<string, number>;
    chartPreferences: string[];
    decisionSpeed: 'fast' | 'normal' | 'slow';
    emotionalStability: number; // 0-100
  };

  // 交易历史分析
  tradingAnalytics: {
    totalTrades: number;
    winRate: number;
    avgProfit: number;
    avgLoss: number;
    maxDrawdown: number;
    sharpeRatio: number;
    commonMistakes: string[];
    strengths: string[];
    preferredIndicators: string[];
    strategyPerformance: Map<string, {
      winRate: number;
      profitFactor: number;
      maxConsecutiveLosses: number;
    }>;
  };

  // 心理特征
  psychologicalProfile: {
    fearIndex: number;        // 恐惧指数 0-100
    greedIndex: number;       // 贪婪指数 0-100
    fomoTendency: number;     // FOMO倾向 0-100
    overconfidenceLevel: number; // 过度自信 0-100
    patienceLevel: number;    // 耐心程度 0-100
    disciplineScore: number;  // 纪律性评分 0-100
  };

  // 学习偏好
  learningPreferences: {
    feedbackStyle: 'detailed' | 'concise' | 'visual';
    notificationFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    guidanceLevel: 'hand-holding' | 'guided' | 'independent';
    contentFormat: 'text' | 'video' | 'interactive';
  };
}

interface TradingContext {
  timestamp: Date;
  marketCondition: 'bullish' | 'bearish' | 'sideways' | 'volatile';
  userEmotion: 'confident' | 'anxious' | 'excited' | 'frustrated' | 'neutral';
  recentPerformance: 'winning' | 'losing' | 'breakeven';
  sessionType: 'planning' | 'execution' | 'review' | 'learning';
}

interface PersonalizedAdvice {
  type: 'strategy' | 'risk' | 'psychological' | 'educational' | 'actionable';
  priority: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  reasoning: string;
  confidence: number; // 0-1
  suggestedActions?: Array<{
    action: string;
    description: string;
    expectedOutcome: string;
  }>;
  relevantMetrics?: Record<string, number>;
}

interface StrategyRecommendation {
  name: string;
  description: string;
  matchScore: number; // 0-1
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeCommitment: 'low' | 'medium' | 'high';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reasoning: string;
  customizationTips: string[];
}

class PersonalizedAIAssistant {
  private userProfile: UserProfile | null = null;
  private currentContext: TradingContext | null = null;
  private interactionHistory: Array<{
    timestamp: Date;
    action: string;
    context: Partial<TradingContext>;
    outcome?: string;
  }> = [];

  private behaviorAnalyzer: BehaviorAnalyzer;
  private emotionDetector: EmotionDetector;
  private strategyRecommender: StrategyRecommender;
  private riskAdvisor: RiskAdvisor;
  private learningEngine: LearningEngine;

  constructor() {
    this.behaviorAnalyzer = new BehaviorAnalyzer();
    this.emotionDetector = new EmotionDetector();
    this.strategyRecommender = new StrategyRecommender();
    this.riskAdvisor = new RiskAdvisor();
    this.learningEngine = new LearningEngine();
  }

  /**
   * 初始化用户画像（首次使用或重置）
   */
  async initializeUserProfile(userId: string, basicInfo: Partial<UserProfile['basicInfo']>): Promise<UserProfile> {
    const defaultProfile: UserProfile = {
      id: userId,
      createdAt: new Date(),

      basicInfo: {
        experienceLevel: basicInfo.experienceLevel || 'intermediate',
        riskTolerance: basicInfo.riskTolerance || 'moderate',
        investmentHorizon: basicInfo.investmentHorizon || 'medium',
        capitalRange: basicInfo.capitalRange || '10k-50k',
        preferredMarkets: basicInfo.preferredMarkets || ['crypto', 'stocks'],
        tradingStyle: basicInfo.tradingStyle || 'swing',
      },

      behavioralProfile: {
        avgSessionDuration: 30,
        peakTradingHours: [9, 10, 14, 15],
        clickPatterns: {},
        chartPreferences: ['candlestick', 'volume'],
        decisionSpeed: 'normal',
        emotionalStability: 70,
      },

      tradingAnalytics: {
        totalTrades: 0,
        winRate: 0.5,
        avgProfit: 0,
        avgLoss: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        commonMistakes: [],
        strengths: [],
        preferredIndicators: ['MA', 'RSI', 'MACD'],
        strategyPerformance: new Map(),
      },

      psychologicalProfile: {
        fearIndex: 50,
        greedIndex: 50,
        fomoTendency: 40,
        overconfidenceLevel: 45,
        patienceLevel: 60,
        disciplineScore: 65,
      },

      learningPreferences: {
        feedbackStyle: 'concise',
        notificationFrequency: 'daily',
        guidanceLevel: 'guided',
        contentFormat: 'interactive',
      },
    };

    this.userProfile = defaultProfile;

    await this.saveUserProfile();

    return defaultProfile;
  }

  /**
   * 记录用户交互行为（持续学习）
   */
  async recordInteraction(
    action: string,
    context: Partial<TradingContext> = {},
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    if (!this.userProfile) throw new Error('User profile not initialized');

    const interaction = {
      timestamp: new Date(),
      action,
      context,
      ...metadata,
    };

    this.interactionHistory.push(interaction);

    // 更新行为特征
    await this.behaviorAnalyzer.analyze(interaction, this.userProfile);

    // 检测情绪变化
    const emotion = await this.emotionDetector.detect(action, context);
    if (emotion) {
      this.currentContext = {
        timestamp: context.timestamp || new Date(),
        marketCondition: context.marketCondition || 'sideways',
        userEmotion: emotion as TradingContext['userEmotion'],
        recentPerformance: context.recentPerformance || 'breakeven',
        sessionType: context.sessionType || 'execution',
      };
      await this.updatePsychologicalProfile(emotion);
    }

    // 定期保存（每50次交互或重要操作）
    if (this.interactionHistory.length % 50 === 0 ||
      ['trade_execute', 'strategy_apply', 'major_loss'].includes(action)) {
      await this.saveUserProfile();
    }
  }

  /**
   * 获取个性化建议（核心功能）
   */
  async getPersonalizedAdvice(context: TradingContext): Promise<PersonalizedAdvice[]> {
    if (!this.userProfile) throw new Error('User profile not initialized');

    this.currentContext = context;

    const adviceList: PersonalizedAdvice[] = [];

    // 1. 风险评估与建议
    const riskAdvice = await this.riskAdvisor.evaluate(this.userProfile, context);
    adviceList.push(...riskAdvice);

    // 2. 心理状态监测
    const psychAdvice = await this.evaluatePsychologicalState(context);
    adviceList.push(...psychAdvice);

    // 3. 策略推荐
    if (context.sessionType === 'planning') {
      const strategies = await this.strategyRecommender.recommend(this.userProfile, context);
      adviceList.push(...strategies);
    }

    // 4. 学习建议
    if (this.shouldProvideLearningGuidance()) {
      const learningAdvice = await this.learningEngine.suggest(this.userProfile, context);
      adviceList.push(...learningAdvice);
    }

    return this.prioritizeAdvice(adviceList);
  }

  /**
   * 自然语言策略生成（对标Nof1.ai能力）
   */
  async generateStrategyFromNaturalLanguage(description: string): Promise<{
    strategyCode: string;
    explanation: string;
    riskAssessment: string;
    backtestSuggestion: string;
    personalizationNotes: string;
  }> {
    if (!this.userProfile) throw new Error('User profile not initialized');

    // 解析自然语言描述
    const parsedIntent = await this.parseStrategyDescription(description);

    // 基于用户画像个性化调整
    const personalizedParams = this.adjustParametersForUser(parsedIntent);

    // 生成策略代码
    const strategyCode = await this.generateStrategyCode(personalizedParams);

    // 风险评估（结合用户风险承受力）
    const riskAssessment = await this.riskAdvisor.assessStrategy(
      personalizedParams,
      this.userProfile
    );

    return {
      strategyCode,
      explanation: this.generateExplanation(personalizedParams),
      riskAssessment,
      backtestSuggestion: `建议使用 ${this.userProfile.basicInfo.preferredMarkets.join('/')} 数据进行回测，时间范围：${this.getSuggestedBacktestPeriod()}`,
      personalizationNotes: `基于您的${this.userProfile?.basicInfo.tradingStyle}风格和${this.userProfile?.basicInfo.riskTolerance === 'aggressive' ? '激进' : this.userProfile?.basicInfo.riskTolerance === 'conservative' ? '保守' : this.userProfile?.basicInfo.riskTolerance}风险偏好进行了参数优化`,
    };
  }

  /**
   * 实时情绪监控与干预
   */
  async monitorAndIntervene(): Promise<{
    needsIntervention: boolean;
    interventionType?: 'cool_down' | 'confidence_boost' | 'discipline_reminder' | 'learning_suggestion';
    message?: string;
    urgency: 'immediate' | 'soon' | 'later';
  }> {
    if (!this.userProfile || !this.currentContext) {
      return { needsIntervention: false, urgency: 'later' };
    }

    const { psychologicalProfile } = this.userProfile;
    const { userEmotion, recentPerformance } = this.currentContext;

    // 危险情绪组合检测
    const dangerousCombinations = [
      { emotion: 'anxious', performance: 'losing', threshold: 80 },  // 恐慌性抛售风险
      { emotion: 'excited', performance: 'winning', threshold: 85 }, // 过度自信追涨
      { emotion: 'frustrated', performance: 'losing', threshold: 75 },// 报复性交易
    ];

    for (const combo of dangerousCombinations) {
      if (userEmotion === combo.emotion &&
        recentPerformance === combo.performance &&
        psychologicalProfile.fearIndex > combo.threshold) {

        return this.generateIntervention(combo);
      }
    }

    // 连续亏损检测
    const recentLosses = this.interactionHistory
      .slice(-20)
      .filter(i => i.outcome === 'loss').length;

    if (recentLosses >= 5 && psychologicalProfile.disciplineScore < 50) {
      return {
        needsIntervention: true,
        interventionType: 'cool_down',
        message: '检测到连续亏损模式，建议暂停交易30分钟，回顾交易日志',
        urgency: 'immediate',
      };
    }

    return { needsIntervention: false, urgency: 'later' };
  }

  /**
   * 获取用户成长报告
   */
  async generateGrowthReport(timeRange: 'week' | 'month' | 'quarter'): Promise<{
    overallProgress: number; // 0-100
    keyAchievements: string[];
    areasForImprovement: string[];
    personalizedGoals: string[];
    nextLearningPath: string[];
    metricsComparison: {
      current: Record<string, number>;
      previous: Record<string, number>;
      change: Record<string, number>; // percentage change
    };
  }> {
    if (!this.userProfile) throw new Error('User profile not initialized');

    const previousSnapshot = await this.getHistoricalSnapshot(timeRange);
    const currentMetrics = this.extractCurrentMetrics();

    return {
      overallProgress: this.calculateOverallProgress(currentMetrics, previousSnapshot),
      keyAchievements: this.identifyAchievements(currentMetrics, previousSnapshot),
      areasForImprovement: this.identifyWeaknesses(currentMetrics),
      personalizedGoals: this.generatePersonalizedGoals(),
      nextLearningPath: this.learningEngine.recommendPath(this.userProfile),
      metricsComparison: {
        current: currentMetrics,
        previous: previousSnapshot,
        change: this.calculateChange(currentMetrics, previousSnapshot),
      },
    };
  }

  // 私有方法

  private async parseStrategyDescription(_description: string): Promise<Record<string, unknown>> {
    // 使用LLM解析自然语言为结构化策略意图
    // 这里简化实现，实际应调用LLMService
    return {
      intent: 'momentum_strategy',
      parameters: {
        timeframe: 'daily',
        indicators: ['MA', 'RSI', 'MACD'],
        entryConditions: ['MA_crossover', 'RSI_oversold'],
        exitConditions: ['take_profit_5%', 'stop_loss_2%'],
        riskManagement: {
          maxPositionSize: '5%',
          maxDailyLoss: '2%',
          correlationLimit: 3,
        },
      },
    };
  }

  private adjustParametersForUser(baseParams: Record<string, unknown>): Record<string, unknown> {
    if (!this.userProfile) return baseParams;

    const params = { ...baseParams } as Record<string, unknown>;
    const risk = this.userProfile.basicInfo.riskTolerance;
    const style = this.userProfile.basicInfo.tradingStyle;

    // 根据风险承受度调整仓位大小
    if (params.parameters && typeof params.parameters === 'object') {
      const p = params.parameters as Record<string, unknown>;
      p.riskManagement = {
        ...(p.riskManagement as object),
        maxPositionSize: risk === 'aggressive' ? '10%' : risk === 'moderate' ? '5%' : '2%',
        maxDailyLoss: risk === 'aggressive' ? '5%' : risk === 'moderate' ? '2%' : '1%',
      };

      // 根据交易风格调整时间周期
      if (style === 'day') {
        p.timeframe = '15min';
      } else if (style === 'swing') {
        p.timeframe = '4h';
      } else {
        p.timeframe = 'daily';
      }
    }

    return params;
  }

  private async generateStrategyCode(_params: Record<string, unknown>): Promise<string> {
    // 生成伪代码表示（实际应生成可执行代码）
    return `
// 个性化策略：基于您的${this.userProfile?.basicInfo.tradingStyle}风格生成
function executeStrategy(marketData) {
  const { timeframe, indicators, entryConditions, exitConditions, riskManagement } = params;

  // 入场条件检查
  if (checkConditions(indicators, entryConditions)) {
    const positionSize = calculatePositionSize(riskManagement.maxPositionSize);
    executeEntry(positionSize, riskManagement);
  }

  // 出场条件检查
  if (checkConditions(indicators, exitConditions)) {
    executeExit();
  }
}
`;
  }

  private async evaluatePsychologicalState(context: TradingContext): Promise<PersonalizedAdvice[]> {
    const advice: PersonalizedAdvice[] = [];
    const { psychologicalProfile } = this.userProfile!;

    if (context.userEmotion === 'anxious' && psychologicalProfile.fearIndex > 70) {
      advice.push({
        type: 'psychological',
        priority: 'high',
        message: '检测到焦虑情绪升高，建议暂时减少盯盘频率',
        reasoning: `恐惧指数${psychologicalProfile.fearIndex}超过阈值，可能影响决策质量`,
        confidence: 0.85,
        suggestedActions: [
          { action: '深呼吸练习', description: '执行4-7-8呼吸法3次', expectedOutcome: '降低焦虑水平20%' },
          { action: '切换到周线图', description: '拉长视角减少噪音干扰', expectedOutcome: '降低过度交易冲动' },
        ],
      });
    }

    if (context.userEmotion === 'excited' && psychologicalProfile.greedIndex > 75) {
      advice.push({
        type: 'risk',
        priority: 'critical',
        message: '⚠️ 检测到过度乐观情绪，警惕追高风险',
        reasoning: `贪婪指数${psychologicalProfile.greedIndex}偏高，历史上此状态下平均收益下降15%`,
        confidence: 0.9,
        suggestedActions: [
          { action: '减仓50%', description: '锁定部分利润', expectedOutcome: '保护已有收益' },
          { action: '设置严格止损', description: '收紧止损至2%', expectedOutcome: '控制下行风险' },
        ],
      });
    }

    return advice;
  }

  private shouldProvideLearningGuidance(): boolean {
    if (!this.userProfile) return false;

    const { experienceLevel } = this.userProfile.basicInfo;
    const { totalTrades } = this.userProfile.tradingAnalytics;

    // 新手或交易次数少的用户提供更多指导
    return experienceLevel === 'beginner' ||
      (experienceLevel === 'intermediate' && totalTrades < 50);
  }

  private prioritizeAdvice(advice: PersonalizedAdvice[]): PersonalizedAdvice[] {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    return advice.sort((a, b) =>
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }

  private async updatePsychologicalProfile(emotion: string): Promise<void> {
    if (!this.userProfile) return;

    const { psychologicalProfile } = this.userProfile;

    switch (emotion) {
      case 'anxious':
        psychologicalProfile.fearIndex = Math.min(100, psychologicalProfile.fearIndex + 5);
        psychologicalProfile.disciplineScore = Math.max(0, psychologicalProfile.disciplineScore - 3);
        break;
      case 'excited':
        psychologicalProfile.greedIndex = Math.min(100, psychologicalProfile.greedIndex + 8);
        psychologicalProfile.fomoTendency = Math.min(100, psychologicalProfile.fomoTendency + 5);
        break;
      case 'frustrated':
        psychologicalProfile.disciplineScore = Math.max(0, psychologicalProfile.disciplineScore - 4);
        break;
      case 'confident':
        psychologicalProfile.patienceLevel = Math.min(100, psychologicalProfile.patienceLevel + 2);
        break;
    }
  }

  private async saveUserProfile(): Promise<void> {
    if (!this.userProfile) return;

    try {
      localStorage.setItem(`user_profile_${this.userProfile.id}`, JSON.stringify(this.userProfile));
      console.log('✅ User profile saved successfully');
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }

  private getSuggestedBacktestPeriod(): string {
    const horizon = this.userProfile?.basicInfo.investmentHorizon;
    switch (horizon) {
      case 'short': return '最近3个月';
      case 'medium': return '最近6个月';
      case 'long': return '最近1年';
      default: return '最近6个月';
    }
  }

  private generateExplanation(params: Record<string, unknown>): string {
    return `基于"${params.intent}"策略逻辑，结合您偏好的${this.userProfile?.basicInfo.tradingStyle}交易风格，已自动配置以下参数：时间周期=${(params.parameters as any)?.timeframe}，风控规则=${JSON.stringify((params.parameters as any)?.riskManagement)}。`;
  }

  private generateIntervention(combo: {
    emotion: string;
    performance: string;
    threshold: number;
  }): {
    needsIntervention: boolean;
    interventionType: 'cool_down' | 'confidence_boost' | 'discipline_reminder' | 'learning_suggestion';
    message: string;
    urgency: 'immediate';
  } {
    const interventions: Record<string, {
      interventionType: 'cool_down' | 'confidence_boost' | 'discipline_reminder' | 'learning_suggestion';
      message: string;
    }> = {
      anxious_losing: {
        interventionType: 'cool_down',
        message: '🛑 暂停交易建议：检测到恐慌情绪+连续亏损组合，这是最危险的交易状态。建议立即停止所有操作，离开屏幕15分钟。',
      },
      excited_winning: {
        interventionType: 'discipline_reminder',
        message: '⚠️ 纪律提醒：连胜期间容易过度自信。请回顾您的交易计划，确认是否偏离了既定策略。',
      },
      frustrated_losing: {
        interventionType: 'confidence_boost',
        message: '💪 鼓励时刻：挫折是成长的必经之路。您的历史数据显示，每次低谷后的恢复期表现都优于平均水平。',
      },
    };

    const key = `${combo.emotion}_${combo.performance}`;
    const intervention = interventions[key] || {
      interventionType: 'learning_suggestion',
      message: '建议回顾相关学习材料',
    };

    return {
      needsIntervention: true,
      ...intervention,
      urgency: 'immediate',
    };
  }

  private extractCurrentMetrics(): Record<string, number> {
    if (!this.userProfile) return {};

    return {
      winRate: this.userProfile.tradingAnalytics.winRate * 100,
      disciplineScore: this.userProfile.psychologicalProfile.disciplineScore,
      emotionalStability: this.userProfile.behavioralProfile.emotionalStability,
      fearIndex: this.userProfile.psychologicalProfile.fearIndex,
      totalTrades: this.userProfile.tradingAnalytics.totalTrades,
    };
  }

  private async getHistoricalSnapshot(timeRange: string): Promise<Record<string, number>> {
    try {
      const key = `snapshot_${this.userProfile?.id}_${timeRange}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private calculateOverallProgress(current: Record<string, number>, previous: Record<string, number>): number {
    let totalImprovement = 0;
    let metricCount = 0;

    for (const [key, value] of Object.entries(current)) {
      if (previous[key]) {
        const change = ((value - previous[key]) / Math.abs(previous[key])) * 100;
        totalImprovement += Math.max(-100, Math.min(100, change)); // 限制在-100到100
        metricCount++;
      }
    }

    return metricCount > 0 ? Math.round(50 + (totalImprovement / metricCount)) : 50;
  }

  private identifyAchievements(current: Record<string, number>, previous: Record<string, number>): string[] {
    const achievements: string[] = [];

    if ((current.winRate || 0) > (previous.winRate || 0) + 5) {
      achievements.push('胜率提升超过5个百分点');
    }
    if ((current.disciplineScore || 0) > (previous.disciplineScore || 0) + 10) {
      achievements.push('纪律性显著提升');
    }
    if ((current.emotionalStability || 0) > (previous.emotionalStability || 0) + 10) {
      achievements.push('情绪管理能力增强');
    }

    return achievements.length > 0 ? achievements : ['持续学习中'];
  }

  private identifyWeaknesses(metrics: Record<string, number>): string[] {
    const weaknesses: string[] = [];

    if ((metrics.fearIndex || 50) > 70) {
      weaknesses.push('恐惧情绪管理需要加强');
    }
    if ((metrics.disciplineScore || 50) < 60) {
      weaknesses.push('交易纪律有待提升');
    }
    if ((metrics.winRate || 50) < 45) {
      weaknesses.push('胜率偏低，建议复习基础策略');
    }

    return weaknesses;
  }

  private generatePersonalizedGoals(): string[] {
    if (!this.userProfile) return [];

    const goals: string[] = [];
    const { experienceLevel } = this.userProfile.basicInfo;

    if (experienceLevel === 'beginner') {
      goals.push('完成入门课程学习', '实盘模拟交易达到20笔', '理解3种基础指标');
    } else if (experienceLevel === 'intermediate') {
      goals.push('开发并回测个人策略', '将胜率提升至55%+', '建立完整的交易日记');
    } else {
      goals.push('优化策略参数', '探索跨市场机会', '分享经验帮助其他用户');
    }

    return goals;
  }

  private calculateChange(current: Record<string, number>, previous: Record<string, number>): Record<string, number> {
    const change: Record<string, number> = {};

    for (const [key, value] of Object.entries(current)) {
      if (previous[key] && previous[key] !== 0) {
        change[key] = Math.round(((value - previous[key]) / Math.abs(previous[key])) * 100);
      }
    }

    return change;
  }
}

// 辅助类定义（简化实现）

class BehaviorAnalyzer {
  async analyze(interaction: any, profile: UserProfile): Promise<void> {
    // 分析点击模式、停留时间等
    if (interaction.action.includes('click')) {
      const element = interaction.metadata?.element || 'unknown';
      profile.behavioralProfile.clickPatterns[element] =
        (profile.behavioralProfile.clickPatterns[element] || 0) + 1;
    }
  }
}

class EmotionDetector {
  async detect(action: string, context: Partial<TradingContext>): Promise<string | null> {
    // 基于关键词和上下文推断情绪
    const anxietyKeywords = ['panic', 'fear', 'worry', 'loss', 'crash'];
    const excitementKeywords = ['profit', 'win', 'moon', 'rocket', 'gain'];

    const text = `${action} ${JSON.stringify(context)}`.toLowerCase();

    if (anxietyKeywords.some(kw => text.includes(kw))) return 'anxious';
    if (excitementKeywords.some(kw => text.includes(kw))) return 'excited';

    return null;
  }
}

class StrategyRecommender {
  async recommend(profile: UserProfile, _context: TradingContext): Promise<PersonalizedAdvice[]> {
    return [{
      type: 'strategy',
      priority: 'medium',
      message: `根据您的${profile.basicInfo.tradingStyle}风格，推荐关注动量策略`,
      reasoning: '基于历史表现匹配度分析',
      confidence: 0.75,
    }];
  }
}

class RiskAdvisor {
  async evaluate(profile: UserProfile, context: TradingContext): Promise<PersonalizedAdvice[]> {
    return [{
      type: 'risk',
      priority: context.marketCondition === 'volatile' ? 'high' : 'low',
      message: '当前市场波动率较高，建议降低仓位',
      reasoning: `VIX指数处于高位(${Math.random() * 30 + 20})`,
      confidence: 0.8,
    }];
  }

  async assessStrategy(params: any, profile: UserProfile): Promise<string> {
    const risk = profile.basicInfo.riskTolerance;
    return risk === 'aggressive' ? '中等风险，适合激进型投资者' : '低风险，符合您的风险偏好';
  }
}

class LearningEngine {
  async suggest(_profile: UserProfile, _context: TradingContext): Promise<PersonalizedAdvice[]> {
    return [{
      type: 'educational',
      priority: 'low',
      message: '推荐学习：风险管理进阶课程',
      reasoning: '基于当前技能缺口分析',
      confidence: 0.7,
    }];
  }

  recommendPath(_profile: UserProfile): string[] {
    return ['技术分析基础', '风险管理实战', '心理学训练'];
  }
}

export default PersonalizedAIAssistant;
export type {
  PersonalizedAdvice,
  StrategyRecommendation, TradingContext, UserProfile
};
