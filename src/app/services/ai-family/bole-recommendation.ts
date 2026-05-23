import type { FamilyOrchestrationRequest } from './tian-shu-orchestrator';

export interface UserProfile {
  userId: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  tradingStyle: 'day_trading' | 'swing' | 'position' | 'scalping' | 'algorithmic';
  preferredMarkets: string[];
  preferredTimeframes: string[];
  interests: string[];
  behaviorHistory: BehaviorEvent[];
  portfolioSnapshot: PortfolioSnapshot;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface BehaviorEvent {
  eventType: 'view' | 'trade' | 'search' | 'click' | 'feedback';
  target: string;
  category: string;
  value?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PortfolioSnapshot {
  totalValue: number;
  positions: { symbol: string; allocation: number; pnl: number }[];
  cashRatio: number;
  diversificationScore: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notificationLevel: 'all' | 'important' | 'minimal' | 'none';
  dashboardLayout: string[];
  maxDailyRisk: number;
  preferredIndicators: string[];
}

export interface Recommendation {
  id: string;
  type: 'strategy' | 'asset' | 'tool' | 'education' | 'alert' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  reason: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface RecommendationResult {
  recommendations: Recommendation[];
  userProfile: UserProfile;
  totalScore: number;
  processingTimeMs: number;
}

interface StrategyTemplate {
  id: string;
  name: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  markets: string[];
  timeframes: string[];
  tags: string[];
  expectedReturn: number;
  maxDrawdown: number;
}

const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  { id: 'strat_ma_cross', name: '均线交叉策略', category: 'trend_following', riskLevel: 'medium', complexity: 'beginner', markets: ['crypto', 'stock'], timeframes: ['1h', '4h', '1d'], tags: ['均线', '趋势', '入门'], expectedReturn: 0.15, maxDrawdown: 0.12 },
  { id: 'strat_mean_rev', name: '均值回归策略', category: 'mean_reversion', riskLevel: 'medium', complexity: 'intermediate', markets: ['crypto', 'stock', 'forex'], timeframes: ['15m', '1h'], tags: ['统计', '回归', '震荡'], expectedReturn: 0.20, maxDrawdown: 0.10 },
  { id: 'strat_momentum', name: '动量突破策略', category: 'momentum', riskLevel: 'high', complexity: 'intermediate', markets: ['crypto', 'stock'], timeframes: ['1h', '4h'], tags: ['突破', '动量', '趋势'], expectedReturn: 0.30, maxDrawdown: 0.20 },
  { id: 'strat_grid', name: '网格交易策略', category: 'range_trading', riskLevel: 'medium', complexity: 'beginner', markets: ['crypto'], timeframes: ['5m', '15m', '1h'], tags: ['网格', '震荡', '自动化'], expectedReturn: 0.12, maxDrawdown: 0.15 },
  { id: 'strat_arbitrage', name: '跨所套利策略', category: 'arbitrage', riskLevel: 'low', complexity: 'advanced', markets: ['crypto'], timeframes: ['1m', '5m'], tags: ['套利', '低风险', '高频'], expectedReturn: 0.08, maxDrawdown: 0.03 },
  { id: 'strat_scalping', name: '超短线剥头皮', category: 'scalping', riskLevel: 'high', complexity: 'expert', markets: ['crypto', 'forex'], timeframes: ['1m', '5m'], tags: ['高频', '短线', '快进快出'], expectedReturn: 0.25, maxDrawdown: 0.18 },
  { id: 'strat_dca', name: '定投策略', category: 'passive', riskLevel: 'low', complexity: 'beginner', markets: ['crypto', 'stock'], timeframes: ['1d', '1w'], tags: ['定投', '长期', '被动'], expectedReturn: 0.10, maxDrawdown: 0.25 },
  { id: 'strat_pairs', name: '配对交易策略', category: 'statistical', riskLevel: 'medium', complexity: 'advanced', markets: ['stock', 'forex'], timeframes: ['1h', '4h', '1d'], tags: ['统计', '对冲', '市场中性'], expectedReturn: 0.18, maxDrawdown: 0.08 }
];

export class BoleRecommendationEngine {
  private userProfiles: Map<string, UserProfile> = new Map();
  private feedbackStore: Map<string, { recommendationId: string; rating: number }[]> = new Map();

  constructor() {
    console.log('🎯 千里·伯乐 Bole Recommendation Engine initialized');
  }

  async process(request: FamilyOrchestrationRequest): Promise<RecommendationResult> {
    const startTime = Date.now();
    const userId = request.userId;
    const profile = this.getOrCreateProfile(userId, request.context);
    this.updateBehaviorHistory(userId, request);

    const recommendations = this.generateRecommendations(profile, request.userInput);

    const result: RecommendationResult = {
      recommendations,
      userProfile: profile,
      totalScore: this.calculateTotalScore(recommendations),
      processingTimeMs: Date.now() - startTime
    };

    console.log(`🎯 [Bole] Generated ${recommendations.length} recommendations for ${userId}`);
    return result;
  }

  getOrCreateProfile(userId: string, context?: Record<string, any>): UserProfile {
    let profile = this.userProfiles.get(userId);
    if (!profile) {
      profile = this.buildProfileFromContext(userId, context);
      this.userProfiles.set(userId, profile);
    }
    return profile;
  }

  recordFeedback(userId: string, recommendationId: string, rating: number): void {
    if (!this.feedbackStore.has(userId)) {
      this.feedbackStore.set(userId, []);
    }
    this.feedbackStore.get(userId)!.push({ recommendationId, rating });
  }

  getUserProfile(userId: string): UserProfile | undefined {
    return this.userProfiles.get(userId);
  }

  private buildProfileFromContext(userId: string, context?: Record<string, any>): UserProfile {
    return {
      userId,
      experienceLevel: context?.experienceLevel || 'intermediate',
      riskTolerance: context?.riskTolerance || 'moderate',
      tradingStyle: context?.tradingStyle || 'swing',
      preferredMarkets: context?.preferredMarkets || ['crypto', 'stock'],
      preferredTimeframes: context?.preferredTimeframes || ['1h', '4h'],
      interests: context?.interests || ['趋势分析', '风险管理'],
      behaviorHistory: [],
      portfolioSnapshot: {
        totalValue: context?.portfolioValue || 100000,
        positions: context?.positions || [],
        cashRatio: 0.3,
        diversificationScore: 0.5
      },
      preferences: {
        theme: 'dark',
        language: 'zh-CN',
        notificationLevel: 'important',
        dashboardLayout: ['chart', 'positions', 'signals'],
        maxDailyRisk: 0.02,
        preferredIndicators: ['MA', 'RSI', 'MACD']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generateRecommendations(profile: UserProfile, userInput: string): Recommendation[] {
    const recommendations: Recommendation[] = [];

    const strategyRecs = this.recommendStrategies(profile);
    recommendations.push(...strategyRecs);

    const educationRecs = this.recommendEducation(profile);
    recommendations.push(...educationRecs);

    const optimizationRecs = this.recommendOptimizations(profile);
    recommendations.push(...optimizationRecs);

    if (userInput) {
      const contextRecs = this.generateContextRecommendations(profile, userInput);
      recommendations.push(...contextRecs);
    }

    recommendations.sort((a, b) => b.confidence - a.confidence);

    return recommendations.slice(0, 10);
  }

  private recommendStrategies(profile: UserProfile): Recommendation[] {
    const riskMap = { conservative: ['low'], moderate: ['low', 'medium'], aggressive: ['low', 'medium', 'high'] };
    const compatibleRisk = riskMap[profile.riskTolerance];

    return STRATEGY_TEMPLATES
      .filter(s => {
        const riskOk = compatibleRisk.includes(s.riskLevel);
        const complexityOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
        const userLevel = complexityOrder.indexOf(profile.experienceLevel);
        const stratLevel = complexityOrder.indexOf(s.complexity);
        const levelOk = stratLevel <= userLevel + 1;
        return riskOk && levelOk;
      })
      .slice(0, 3)
      .map((s, i) => ({
        id: `rec_strat_${s.id}_${Date.now()}`,
        type: 'strategy' as const,
        title: s.name,
        description: `推荐理由：适合${profile.riskTolerance === 'conservative' ? '保守型' : profile.riskTolerance === 'aggressive' ? '激进型' : '稳健型'}投资者，预期年化${(s.expectedReturn * 100).toFixed(0)}%`,
        confidence: 0.9 - i * 0.05,
        reason: `匹配风险偏好(${s.riskLevel})和能力等级(${s.complexity})`,
        category: s.category,
        priority: i === 0 ? 'high' as const : 'medium' as const,
        metadata: { strategyId: s.id, expectedReturn: s.expectedReturn, maxDrawdown: s.maxDrawdown }
      }));
  }

  private recommendEducation(profile: UserProfile): Recommendation[] {
    const recs: Recommendation[] = [];
    const levelMap: Record<string, string[]> = {
      beginner: ['基础K线形态识别', '技术指标入门(MA/RSI)', '仓位管理基础'],
      intermediate: ['MACD高级应用', '波浪理论实战', '资金管理进阶'],
      advanced: ['量化策略开发', '机器学习选股', '高频交易原理'],
      expert: ['算法交易优化', '市场微观结构', '统计套利模型']
    };

    const topics = levelMap[profile.experienceLevel] || levelMap.intermediate;
    topics.slice(0, 2).forEach((topic, i) => {
      recs.push({
        id: `rec_edu_${i}_${Date.now()}`,
        type: 'education',
        title: topic,
        description: `根据您当前的经验等级推荐学习`,
        confidence: 0.85 - i * 0.05,
        reason: `提升${profile.experienceLevel}等级所需知识`,
        category: 'education',
        priority: 'medium'
      });
    });

    return recs;
  }

  private recommendOptimizations(profile: UserProfile): Recommendation[] {
    const recs: Recommendation[] = [];

    if (profile.portfolioSnapshot.cashRatio > 0.5) {
      recs.push({
        id: `rec_opt_cash_${Date.now()}`,
        type: 'optimization',
        title: '提高资金利用率',
        description: `当前现金占比${(profile.portfolioSnapshot.cashRatio * 100).toFixed(0)}%，建议适当增加仓位`,
        confidence: 0.8,
        reason: '现金比例过高，存在资金闲置',
        category: 'portfolio_optimization',
        priority: 'medium'
      });
    }

    if (profile.portfolioSnapshot.diversificationScore < 0.4) {
      recs.push({
        id: `rec_opt_div_${Date.now()}`,
        type: 'optimization',
        title: '优化投资组合多样性',
        description: '当前组合集中度较高，建议分散到不同资产类别',
        confidence: 0.75,
        reason: '分散化不足，系统性风险偏高',
        category: 'risk_management',
        priority: 'high'
      });
    }

    if (recs.length === 0) {
      recs.push({
        id: `rec_opt_gen_${Date.now()}`,
        type: 'optimization',
        title: '策略参数定期优化',
        description: '建议每两周对现有策略参数进行一次回测优化',
        confidence: 0.7,
        reason: '持续优化是量化交易的关键',
        category: 'strategy_optimization',
        priority: 'low'
      });
    }

    return recs;
  }

  private generateContextRecommendations(profile: UserProfile, input: string): Recommendation[] {
    const recs: Recommendation[] = [];

    if (/止损|风险|保护/.test(input)) {
      recs.push({
        id: `rec_ctx_risk_${Date.now()}`,
        type: 'alert',
        title: '智能止损方案',
        description: '基于ATR动态止损 + 时间止损 + 移动止损三重保护',
        confidence: 0.88,
        reason: '用户关注风险控制',
        category: 'risk_management',
        priority: 'high'
      });
    }

    if (/新手|入门|学习/.test(input)) {
      recs.push({
        id: `rec_ctx_learn_${Date.now()}`,
        type: 'education',
        title: '量化交易入门路线图',
        description: '从基础概念到实战策略的完整学习路径',
        confidence: 0.92,
        reason: '用户处于学习阶段',
        category: 'education',
        priority: 'high'
      });
    }

    return recs;
  }

  private updateBehaviorHistory(userId: string, request: FamilyOrchestrationRequest): void {
    const profile = this.userProfiles.get(userId);
    if (profile) {
      profile.behaviorHistory.push({
        eventType: 'search',
        target: request.userInput,
        category: 'recommendation_query',
        timestamp: new Date()
      });
      if (profile.behaviorHistory.length > 100) {
        profile.behaviorHistory = profile.behaviorHistory.slice(-50);
      }
      profile.updatedAt = new Date();
    }
  }

  private calculateTotalScore(recs: Recommendation[]): number {
    if (recs.length === 0) return 0;
    return recs.reduce((sum, r) => sum + r.confidence, 0) / recs.length;
  }
}

let boleInstance: BoleRecommendationEngine | null = null;

export function getBoleRecommendationEngine(): BoleRecommendationEngine {
  if (!boleInstance) {
    boleInstance = new BoleRecommendationEngine();
  }
  return boleInstance;
}
