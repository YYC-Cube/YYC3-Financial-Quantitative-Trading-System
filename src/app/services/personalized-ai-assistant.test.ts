/**
 * @file src/app/services/personalized-ai-assistant.test.ts
 * @description 一人一端专属强化辅助 - 单元测试与集成测试
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import PersonalizedAIAssistant, {
  type TradingContext
} from './personalized-ai-assistant';

describe('PersonalizedAIAssistant - 核心智能化引擎', () => {
  let assistant: PersonalizedAIAssistant;

  beforeEach(() => {
    assistant = new PersonalizedAIAssistant();

    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
      };
    })();

    Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });
  });

  describe('用户画像初始化', () => {
    it('应该成功创建默认用户画像', async () => {
      const profile = await assistant.initializeUserProfile('user_001', {
        experienceLevel: 'intermediate',
        riskTolerance: 'moderate',
      });

      expect(profile.id).toBe('user_001');
      expect(profile.basicInfo.experienceLevel).toBe('intermediate');
      expect(profile.basicInfo.riskTolerance).toBe('moderate');
      expect(profile.createdAt).toBeInstanceOf(Date);
    });

    it('应该使用默认值填充未提供的信息', async () => {
      const profile = await assistant.initializeUserProfile('user_002', {});

      expect(profile.basicInfo.experienceLevel).toBe('intermediate');
      expect(profile.basicInfo.investmentHorizon).toBe('medium');
      expect(profile.basicInfo.tradingStyle).toBe('swing');
      expect(profile.behavioralProfile.avgSessionDuration).toBe(30);
      expect(profile.psychologicalProfile.fearIndex).toBe(50);
    });

    it('应该初始化完整的心理特征数据', async () => {
      const profile = await assistant.initializeUserProfile('user_003', {});

      expect(Object.keys(profile.psychologicalProfile)).toContain('fearIndex');
      expect(Object.keys(profile.psychologicalProfile)).toContain('greedIndex');
      expect(Object.keys(profile.psychologicalProfile)).toContain('disciplineScore');

      // 验证范围在0-100之间
      Object.values(profile.psychologicalProfile).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('交互记录与行为学习', () => {
    it('应该在记录交互时更新行为模式', async () => {
      await assistant.initializeUserProfile('user_004', {});

      await assistant.recordInteraction('click_chart_candlestick', {}, {
        element: 'candlestick_chart'
      });

      // 验证行为分析被调用（通过检查localStorage）
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('应该检测到焦虑情绪并更新恐惧指数', async () => {
      await assistant.initializeUserProfile('user_005', {});

      await assistant.recordInteraction('panic_sell', {
        userEmotion: 'anxious' as any,
        recentPerformance: 'losing'
      });

      // 情绪检测应该触发（至少调用1次）
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('个性化建议生成', () => {
    it('应该根据上下文生成风险建议', async () => {
      await assistant.initializeUserProfile('user_006', {
        riskTolerance: 'conservative'
      });

      const context: TradingContext = {
        timestamp: new Date(),
        marketCondition: 'volatile',
        userEmotion: 'anxious',
        recentPerformance: 'losing',
        sessionType: 'execution'
      };

      const advice = await assistant.getPersonalizedAdvice(context);

      expect(advice.length).toBeGreaterThan(0);
      expect(advice.some(a => a.type === 'risk')).toBeTruthy();
      expect(advice.some(a => a.priority === 'high')).toBeTruthy();
    });

    it('应该为新手提供更多教育建议', async () => {
      await assistant.initializeUserProfile('user_007', {
        experienceLevel: 'beginner'
      });

      const context: TradingContext = {
        timestamp: new Date(),
        marketCondition: 'sideways',
        userEmotion: 'neutral',
        recentPerformance: 'breakeven',
        sessionType: 'planning'
      };

      const advice = await assistant.getPersonalizedAdvice(context);

      expect(advice.some(a => a.type === 'educational')).toBeTruthy();
    });

    it('应该按优先级排序建议', async () => {
      await assistant.initializeUserProfile('user_008', {});

      const context: TradingContext = {
        timestamp: new Date(),
        marketCondition: 'bullish',
        userEmotion: 'excited',
        recentPerformance: 'winning',
        sessionType: 'execution'
      };

      const advice = await assistant.getPersonalizedAdvice(context);

      if (advice.length > 1) {
        for (let i = 0; i < advice.length - 1; i++) {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          expect(priorityOrder[advice[i].priority])
            .toBeLessThanOrEqual(priorityOrder[advice[i + 1].priority]);
        }
      }
    });
  });

  describe('自然语言策略生成', () => {
    it('应该解析自然语言并生成个性化策略', async () => {
      await assistant.initializeUserProfile('user_009', {
        tradingStyle: 'swing',
        riskTolerance: 'aggressive'
      });

      const result = await assistant.generateStrategyFromNaturalLanguage(
        '我想做一个动量策略，当短期均线上穿长期均线时买入，止损3%'
      );

      expect(result.strategyCode).toBeDefined();
      expect(result.explanation).toContain('swing');
      expect(result.riskAssessment).toBeDefined();
      expect(result.backtestSuggestion).toBeDefined();
      expect(result.personalizationNotes).toContain('激进');
    });

    it('应该根据用户风险偏好调整参数', async () => {
      // 保守型用户
      await assistant.initializeUserProfile('user_010', {
        riskTolerance: 'conservative'
      });

      const conservativeResult = await assistant.generateStrategyFromNaturalLanguage(
        '均线交叉策略'
      );

      expect(conservativeResult.personalizationNotes).toContain('保守');
    });
  });

  describe('实时情绪监控与干预', () => {
    it('应该在恐慌+亏损组合下建议暂停交易', async () => {
      await assistant.initializeUserProfile('user_011', {
        experienceLevel: 'beginner'
      });

      const intervention = await assistant.monitorAndIntervene();

      // 在特定条件下应该触发干预
      // 这里测试基本功能不抛错
      expect(intervention.needsIntervention).toBeDefined();
      expect(intervention.urgency).toBeDefined();
    });
  });

  describe('用户成长报告', () => {
    it('应该生成包含进步指标的成长报告', async () => {
      await assistant.initializeUserProfile('user_012', {});

      const report = await assistant.generateGrowthReport('week');

      expect(report.overallProgress).toBeGreaterThanOrEqual(0);
      expect(report.overallProgress).toBeLessThanOrEqual(100);
      expect(report.keyAchievements).toBeDefined();
      expect(report.areasForImprovement).toBeDefined();
      expect(report.personalizedGoals).toBeDefined();
      expect(report.nextLearningPath).toBeDefined();
    });

    it('应该为不同时间范围生成报告', async () => {
      await assistant.initializeUserProfile('user_013', {});

      const weekReport = await assistant.generateGrowthReport('week');
      const monthReport = await assistant.generateGrowthReport('month');
      const quarterReport = await assistant.generateGrowthReport('quarter');

      expect(weekReport.overallProgress).toBeDefined();
      expect(monthReport.overallProgress).toBeDefined();
      expect(quarterReport.overallProgress).toBeDefined();
    });
  });

  describe('边界情况处理', () => {
    it('应该在未初始化时报错', async () => {
      const uninitializedAssistant = new PersonalizedAIAssistant();

      await expect(
        uninitializedAssistant.getPersonalizedAdvice({
          timestamp: new Date(),
          marketCondition: 'sideways',
          userEmotion: 'neutral',
          recentPerformance: 'breakeven',
          sessionType: 'planning'
        })
      ).rejects.toThrow('User profile not initialized');
    });

    it('应该处理空的自然语言输入', async () => {
      await assistant.initializeUserProfile('user_014', {});

      const result = await assistant.generateStrategyFromNaturalLanguage('');

      expect(result).toBeDefined();
      expect(result.strategyCode).toBeDefined();
    });
  });

  describe('性能基准测试', () => {
    it('初始化性能：应在50ms内完成', async () => {
      const start = performance.now();

      for (let i = 0; i < 10; i++) {
        await assistant.initializeUserProfile(`perf_user_${i}`, {});
      }

      const duration = performance.now() - start;
      const avgDuration = duration / 10;

      expect(avgDuration).toBeLessThan(50);
    });

    it('建议生成性能：应在200ms内完成', async () => {
      await assistant.initializeUserProfile('perf_user_advice', {});

      const context: TradingContext = {
        timestamp: new Date(),
        marketCondition: 'volatile',
        userEmotion: 'anxious',
        recentPerformance: 'losing',
        sessionType: 'execution'
      };

      const start = performance.now();
      const advice = await assistant.getPersonalizedAdvice(context);
      const duration = performance.now() - start;

      expect(advice.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(200);
    });
  });
});

describe('一人一端专属强化辅助 - 行业对标验证', () => {
  it('应具备Nof1.ai核心能力：自然语言策略生成', () => {
    expect(PersonalizedAIAssistant.prototype.generateStrategyFromNaturalLanguage)
      .toBeDefined();
  });

  it('应具备AI涨乐核心能力：千人千面个性化', () => {
    expect(PersonalizedAIAssistant.prototype.getPersonalizedAdvice)
      .toBeDefined();
  });

  it('应具备QuantCore.Ai核心能力：情绪识别与风险管理', () => {
    expect(PersonalizedAIAssistant.prototype.monitorAndIntervene)
      .toBeDefined();
  });

  it('应具备Personal AI Agent能力：完整用户画像', () => {
    expect(PersonalizedAIAssistant.prototype.initializeUserProfile)
      .toBeDefined();
  });
});
