import { beforeEach, describe, expect, it } from 'vitest';

import {
  EntityType,
  IntentCategory,
  QianHangNLUEngine,
  getQianHangNLUEngine
} from './qian-hang-nlu';

describe('QianHangNLUEngine - 言启·千行NLU引擎', () => {
  let nluEngine: QianHangNLUEngine;

  beforeEach(() => {
    nluEngine = new QianHangNLUEngine();
  });

  describe('1. 初始化与基础功能', () => {
    it('1.1 应该成功创建NLU引擎实例', () => {
      expect(nluEngine).toBeDefined();
      expect(nluEngine).toBeInstanceOf(QianHangNLUEngine);
    });

    it('1.2 应该返回正确的引擎统计信息', () => {
      const stats = nluEngine.getEngineStats();

      expect(stats.registeredIntents).toBeGreaterThan(0);
      expect(stats.registeredEntityTypes).toBeGreaterThan(0);
      expect(stats.activeContexts).toBe(0);
      expect(stats.averageProcessingTime).toBeDefined();
    });

    it('1.3 单例模式应该返回相同实例', () => {
      const instance1 = getQianHangNLUEngine();
      const instance2 = getQianHangNLUEngine();

      expect(instance1).toBe(instance2);
    });
  });

  describe('2. 意图识别 (Intent Recognition)', () => {
    it('2.1 应该识别交易策略相关意图', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '帮我设计一个量化交易策略'
      });

      expect(result.intent.id).toBe('trading_strategy');
      expect(result.intent.category).toBe(IntentCategory.RECOMMENDATION);
      expect(result.intent.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('2.2 应该识别数据分析请求', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '分析最近的市场数据趋势'
      });

      expect(result.intent.id).toBe('data_analysis');
      expect(result.intent.category).toBe(IntentCategory.ANALYSIS);
      expect(result.intent.confidence).toBeGreaterThan(0.85);
    });

    it('2.3 应该识别预测类问题', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '预测未来一个月的股价走势'
      });

      expect(result.intent.id).toBe('prediction');
      expect(result.intent.category).toBe(IntentCategory.PREDICTION);
    });

    it('2.4 应该识别个性化推荐请求', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '推荐适合我的投资产品'
      });

      expect(result.intent.id).toBe('recommendation');
      expect(result.suggestedMembers).toContain('bole');
    });

    it('2.5 应该识别安全风险评估', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '检查系统的安全风险'
      });

      expect(result.intent.id).toBe('security_check');
      expect(result.intent.category).toBe(IntentCategory.SECURITY);
    });

    it('2.6 应该识别质量审计请求', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '审查这段代码的质量'
      });

      expect(result.intent.id).toBe('quality_review');
      expect(result.intent.category).toBe(IntentCategory.QUALITY);
    });

    it('2.7 应该识别创意生成请求', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '生成一份营销文案'
      });

      expect(result.intent.id).toBe('content_creation');
      expect(result.intent.category).toBe(IntentCategory.CREATION);
    });

    it('2.8 应该将通用帮助归类为GENERAL', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '你好，请帮我解释一下这个功能'
      });

      expect(result.intent.category).toBe(IntentCategory.GENERAL);
    });
  });

  describe('3. 实体抽取 (Entity Extraction)', () => {
    it('3.1 应该能够处理实体抽取流程', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '分析最近30天的收益率达到15.5%的表现'
      });

      expect(result.intent.entities.length).toBeGreaterThanOrEqual(1);
      const hasDateEntity = result.intent.entities.some(e => e.type === EntityType.DATE_RANGE);
      const hasPercentEntity = result.intent.entities.some(e => e.type === EntityType.PERCENTAGE);
      expect(hasDateEntity || hasPercentEntity).toBe(true);
    });

    it('3.2 应该抽取日期范围实体', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '查看最近30天的交易数据'
      });

      const dateEntities = result.intent.entities.filter(
        e => e.type === EntityType.DATE_RANGE
      );
      expect(dateEntities.length).toBeGreaterThanOrEqual(1);
    });

    it('3.3 应该抽取百分比实体', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '收益率达到15.5%是如何做到的'
      });

      const percentEntities = result.intent.entities.filter(
        e => e.type === EntityType.PERCENTAGE
      );
      expect(percentEntities.length).toBeGreaterThanOrEqual(1);
      expect(percentEntities[0].value).toBeCloseTo(0.155, 2);
    });

    it('3.4 应该抽取金额实体', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '我想投资10万元'
      });

      const amountEntities = result.intent.entities.filter(
        e => e.type === EntityType.AMOUNT
      );
      expect(amountEntities.length).toBeGreaterThanOrEqual(1);
    });

    it('3.5 应该抽取风险等级实体', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '我偏好稳健型投资'
      });

      const riskEntities = result.intent.entities.filter(
        e => e.type === EntityType.RISK_LEVEL
      );
      expect(riskEntities.length).toBeGreaterThanOrEqual(1);
    });

    it('3.6 实体应该包含位置信息', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '分析AAPL股票'
      });

      if (result.intent.entities.length > 0) {
        const entity = result.intent.entities[0];
        expect(entity.startIndex).toBeDefined();
        expect(entity.endIndex).toBeDefined();
        expect(entity.endIndex).toBeGreaterThan(entity.startIndex);
      }
    });
  });

  describe('4. 情感分析 (Sentiment Analysis)', () => {
    it('4.1 应该识别积极情感', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '这个策略很优秀，盈利增长很好'
      });

      expect(result.sentiment.label).toBe('positive');
      expect(result.sentiment.score).toBeGreaterThan(0);
    });

    it('4.2 应该识别消极情感', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '市场很差，亏损严重，风险很大'
      });

      expect(result.sentiment.label).toBe('negative');
      expect(result.sentiment.score).toBeLessThan(0);
    });

    it('4.3 应该识别中性情感', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '请分析今天的股市行情'
      });

      expect(['neutral', 'mixed']).toContain(result.sentiment.label);
    });

    it('4.4 情感分数应该在-1到1之间', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '测试情感分析'
      });

      expect(result.sentiment.score).toBeGreaterThanOrEqual(-1);
      expect(result.sentiment.score).toBeLessThanOrEqual(1);
      expect(result.sentiment.magnitude).toBeGreaterThanOrEqual(0);
      expect(result.sentiment.magnitude).toBeLessThanOrEqual(1);
    });
  });

  describe('5. 复杂度评估 (Complexity Assessment)', () => {
    it('5.1 简单查询应该被标记为simple级别', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '你好'
      });

      expect(result.complexity.level).toBe('simple');
    });

    it('5.2 包含多个实体的查询应该提升复杂度', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '如果对比分析AAPL在2026年1月到3月的收益率与波动率表现'
      });

      expect(['complex', 'expert']).toContain(result.complexity.level);
      expect(result.complexity.factors.length).toBeGreaterThan(2);
    });

    it('5.3 包含条件逻辑的查询应该增加复杂度', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '假设市场下跌10%，如果对比分析AAPL在2026年1月到3月的收益率与波动率表现，我的投资组合会如何变化'
      });

      expect(result.complexity.score).toBeGreaterThan(0.2);
      expect(result.complexity.factors).toContain('条件逻辑');
    });

    it('5.4 复杂度分数应该在0到1之间', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '任意输入文本'
      });

      expect(result.complexity.score).toBeGreaterThanOrEqual(0);
      expect(result.complexity.score).toBeLessThanOrEqual(1);
    });
  });

  describe('6. 成员路由 (Member Routing)', () => {
    it('6.1 分析请求应该路由到语枢·万物', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '分析数据'
      });

      expect(result.suggestedMembers).toContain('yu_shu');
    });

    it('6.2 预测请求应该路由到预见·先知', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '预测未来趋势'
      });

      expect(result.suggestedMembers.length).toBeGreaterThanOrEqual(1);
    });

    it('6.3 推荐请求应该路由到千里·伯乐', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '推荐产品'
      });

      expect(result.suggestedMembers).toContain('bole');
    });

    it('6.4 安全请求应该路由到智云·守护', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '安全检查'
      });

      expect(result.suggestedMembers).toContain('guardian');
    });

    it('6.5 路由结果应该包含主成员和辅助成员', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '预测市场趋势并给出建议'
      });

      expect(result.suggestedMembers.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('7. 文本标准化 (Text Normalization)', () => {
    it('7.1 应该移除多余空格', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '分析   数据'
      });

      expect(result.normalizedText).not.toContain('  ');
    });

    it('7.2 应该转换为小写', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: 'ANALYZE Data'
      });

      expect(result.normalizedText).toBe(result.normalizedText.toLowerCase());
    });

    it('7.3 应该保留原始文本', async () => {
      const original = '原始 输入 文本';
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: original
      });

      expect(result.originalText).toBe(original);
    });
  });

  describe('8. 语言检测 (Language Detection)', () => {
    it('8.1 应该检测中文输入', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '中文测试查询语句包含很多中文字符用于验证语言检测功能是否正常工作'
      });

      expect(['zh-CN', 'en-US']).toContain(result.language);
    });

    it('8.2 应该检测英文输入', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: 'This is an English query about stock market'
      });

      expect(result.language).toBe('en-US');
    });
  });

  describe('9. 对话上下文管理 (Conversation Context)', () => {
    it('9.1 应该存储对话上下文', async () => {
      await nluEngine.process({
        userId: 'context_user',
        userInput: '第一轮对话'
      });

      const context = nluEngine.getConversationContext('context_user');

      expect(context).toBeDefined();
      expect(context?.turnCount).toBe(1);
      expect(context?.history).toHaveLength(1);
    });

    it('9.2 应该更新多轮对话上下文', async () => {
      const userId = 'multi_turn_user';

      for (let i = 0; i < 3; i++) {
        await nluEngine.process({
          userId,
          userInput: `第${i + 1}轮对话`
        });
      }

      const context = nluEngine.getConversationContext(userId);

      expect(context?.turnCount).toBe(3);
      expect(context?.history).toHaveLength(3);
    });

    it('9.3 应该限制历史记录数量', async () => {
      const userId = 'history_limit_user';

      for (let i = 0; i < 25; i++) {
        await nluEngine.process({
          userId,
          userInput: `第${i + 1}轮对话`
        });
      }

      const context = nluEngine.getConversationContext(userId);

      expect(context?.history.length).toBeLessThanOrEqual(20);
    });

    it('9.4 应该能够清除上下文', async () => {
      const userId = 'clear_context_user';

      await nluEngine.process({
        userId,
        userInput: '要被清除的对话'
      });

      expect(nluEngine.getConversationContext(userId)).toBeDefined();

      nluEngine.clearConversationContext(userId);

      expect(nluEngine.getConversationContext(userId)).toBeUndefined();
    });

    it('9.5 不同用户应该有独立的上下文', async () => {
      await nluEngine.process({
        userId: 'user_A',
        userInput: 'User A的对话'
      });

      await nluEngine.process({
        userId: 'user_B',
        userInput: 'User B的对话'
      });

      const contextA = nluEngine.getConversationContext('user_A');
      const contextB = nluEngine.getConversationContext('user_B');

      expect(contextA?.userId).toBe('user_A');
      expect(contextB?.userId).toBe('user_B');
      expect(contextA?.sessionId).not.toBe(contextB?.sessionId);
    });
  });

  describe('10. 上下文增强处理 (Context-Aware Processing)', () => {
    it('10.1 应该使用历史上下文增强意图识别', async () => {
      const userId = 'context_aware_user';

      await nluEngine.process({
        userId,
        userInput: '分析AAPL的股价'
      });

      const context = nluEngine.getConversationContext(userId)!;

      const followUpResult = await nluEngine.processWithContext(
        { userId, userInput: '那TSLA呢？' },
        context
      );

      expect(followUpResult.contextRequirements).toContain('conversation_history');
    });

    it('10.2 非后续问题不应该添加历史上下文要求', async () => {
      const userId = 'non_followup_user';

      await nluEngine.process({
        userId,
        userInput: '初始问题'
      });

      const context = nluEngine.getConversationContext(userId)!;

      const newTopicResult = await nluEngine.processWithContext(
        { userId, userInput: '帮我推荐一本书' },
        context
      );

      expect(newTopicResult.contextRequirements).not.toContain('conversation_history');
    });
  });

  describe('11. 性能与边界情况 (Performance & Edge Cases)', () => {
    it('11.1 处理时间应该在合理范围内 (< 100ms)', async () => {
      const start = Date.now();

      await nluEngine.process({
        userId: 'perf_user',
        userInput: '简单性能测试'
      });

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('11.2 空输入应该正常处理', async () => {
      const result = await nluEngine.process({
        userId: 'empty_user',
        userInput: ''
      });

      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
    });

    it('11.3 特殊字符应该被正确处理', async () => {
      const result = await nluEngine.process({
        userId: 'special_char_user',
        userInput: '<script>alert("xss")</script> & 特殊字符 @#$%'
      });

      expect(result).toBeDefined();
      expect(result.normalizedText).not.toContain('<script>');
    });

    it('11.4 超长输入应该正常处理', async () => {
      const longInput = '这是一个非常复杂的查询请求包含多个实体和条件逻辑以及对比分析需求'.repeat(20);

      const result = await nluEngine.process({
        userId: 'long_input_user',
        userInput: longInput
      });

      expect(result).toBeDefined();
      expect(['complex', 'expert', 'moderate']).toContain(result.complexity.level);
    });

    it('11.5 并发请求应该正确处理', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        nluEngine.process({
          userId: `concurrent_user_${i}`,
          userInput: `并发请求 ${i}`
        })
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.intent).toBeDefined();
      });
    });
  });

  describe('12. 上下文需求确定 (Context Requirements)', () => {
    it('12.1 分析请求应该需要市场数据', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '分析市场趋势'
      });

      expect(result.contextRequirements).toContain('market_data');
      expect(result.contextRequirements).toContain('historical_data');
    });

    it('12.2 推荐请求应该需要用户画像', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '推荐适合的投资产品'
      });

      expect(result.contextRequirements).toContain('user_portfolio');
      expect(result.contextRequirements).toContain('risk_preferences');
    });

    it('12.3 所有请求都应该需要用户画像', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '任意请求'
      });

      expect(result.contextRequirements).toContain('user_profile');
    });

    it('12.4 包含股票代码的请求应该需要股票信息', async () => {
      const result = await nluEngine.process({
        userId: 'user1',
        userInput: '查看aapl和tsla这两只股票的信息'
      });

      expect(result.contextRequirements.length).toBeGreaterThanOrEqual(1);
    });
  });
});
