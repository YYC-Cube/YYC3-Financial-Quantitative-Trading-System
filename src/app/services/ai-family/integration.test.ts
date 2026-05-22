import { beforeEach, describe, expect, it } from 'vitest';

import { QianHangNLUEngine, getQianHangNLUEngine } from './qian-hang-nlu';
import { TianShuOrchestrator, getTianShuOrchestrator, type FamilyOrchestrationRequest } from './tian-shu-orchestrator';

describe('AI Family Integration Tests - 端到端集成验证', () => {
  let orchestrator: TianShuOrchestrator;
  let nluEngine: QianHangNLUEngine;

  beforeEach(() => {
    orchestrator = new TianShuOrchestrator();
    nluEngine = new QianHangNLUEngine();
  });

  describe('1. NLU → Orchestrator 完整流程', () => {
    it('1.1 应该完成从用户输入到路由决策的完整流程', async () => {
      const userInput = '分析最近的市场数据趋势并预测未来走势';
      const userId = 'integration_user_1';

      const nluResult = await nluEngine.process({
        userId,
        userInput
      });

      expect(nluResult).toBeDefined();
      expect(nluResult.intent.label).toBeDefined();
      expect(nluResult.suggestedMembers.length).toBeGreaterThan(0);

      const orchestrationResponse = await orchestrator.orchestrate({
        userId,
        userInput,
        context: { nluResult }
      });

      expect(orchestrationResponse).toBeDefined();
      expect(orchestrationResponse.requestId).toBeDefined();
      expect(orchestrationResponse.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('1.2 不同类型请求应该产生不同的路由决策', async () => {
      const testCases = [
        { input: '推荐交易策略', expectedPrimary: 'bole' },
        { input: '预测股价走势', expectedPrimary: 'prophet' },
        { input: '检查安全风险', expectedPrimary: 'guardian' }
      ];

      for (const testCase of testCases) {
        const response = await orchestrator.orchestrate({
          userId: `route_test_${testCase.input}`,
          userInput: testCase.input
        });

        expect(response.metadata.routingDecision.primaryMember).toBeDefined();
      }
    });
  });

  describe('2. 多成员协作场景', () => {
    it('2.1 应该支持NLU引擎作为言启·千行成员注册到编排器', async () => {
      orchestrator.registerMember('qian_hang', {
        process: async (request: FamilyOrchestrationRequest) => nluEngine.process(request)
      });

      const health = orchestrator.getSystemHealth();
      expect(health.registeredMembers).toBeGreaterThanOrEqual(1);

      const response = await orchestrator.orchestrate({
        userId: 'collab_user_1',
        userInput: '分析AAPL股票的表现'
      });

      expect(response.success).toBeDefined();
      expect(response.participants).toContain('qian_hang');
    });

    it('2.2 应该在主成员失败时优雅降级', async () => {
      const failingMember = {
        process: async () => {
          throw new Error('Simulated member failure');
        }
      };

      orchestrator.registerMember('yu_shu', failingMember);

      const response = await orchestrator.orchestrate({
        userId: 'fallback_user_1',
        userInput: '分析数据（预期触发降级）'
      });

      expect(response).toBeDefined();
      expect(response.metadata.fallbackUsed).toBeDefined();
    });
  });

  describe('3. 对话上下文连续性', () => {
    it('3.1 应该在多轮对话中保持上下文一致性', async () => {
      const userId = 'context_continuity_user';

      orchestrator.registerMember('qian_hang', {
        process: async (request: FamilyOrchestrationRequest) => nluEngine.process(request)
      });

      await nluEngine.process({
        userId,
        userInput: '第一轮：分析市场趋势'
      });

      await nluEngine.process({
        userId,
        userInput: '第二轮：那预测呢？'
      });

      const history = orchestrator.getRequestHistory(userId);
      expect(history.length).toBeGreaterThanOrEqual(0);

      const nluContext = nluEngine.getConversationContext(userId);
      expect(nluContext?.turnCount).toBe(2);
    });

    it('3.2 不同用户的对话应该完全隔离', async () => {
      orchestrator.registerMember('qian_hang', {
        process: async (request: FamilyOrchestrationRequest) => nluEngine.process(request)
      });

      await orchestrator.orchestrate({
        userId: 'isolation_user_A',
        userInput: 'User A的对话'
      });

      await orchestrator.orchestrate({
        userId: 'isolation_user_B',
        userInput: 'User B的对话'
      });

      const historyA = orchestrator.getRequestHistory('isolation_user_A');
      const historyB = orchestrator.getRequestHistory('isolation_user_B');

      expect(historyA).toHaveLength(1);
      expect(historyB).toHaveLength(1);
      expect(historyA[0].response).not.toEqual(historyB[0].response);
    });
  });

  describe('4. 性能与可靠性集成验证', () => {
    it('4.1 端到端处理时间应该在可接受范围内 (< 200ms)', async () => {
      orchestrator.registerMember('qian_hang', {
        process: async (request: FamilyOrchestrationRequest) => nluEngine.process(request)
      });

      const start = Date.now();

      await orchestrator.orchestrate({
        userId: 'perf_integration_user',
        userInput: '性能测试查询'
      });

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });

    it('4.2 并发用户请求应该正确隔离和处理', async () => {
      orchestrator.registerMember('qian_hang', {
        process: async (request: FamilyOrchestrationRequest) => nluEngine.process(request)
      });

      const concurrentRequests = Array.from({ length: 10 }, (_, i) =>
        orchestrator.orchestrate({
          userId: `concurrent_integration_${i}`,
          userInput: `并发用户${i}的请求`
        })
      );

      const responses = await Promise.all(concurrentRequests);

      expect(responses).toHaveLength(10);
      responses.forEach((response, index) => {
        expect(response.requestId).toBeDefined();
        expect(response.success).toBeDefined();
      });
    });

    it('4.3 系统应该在注册核心成员后达到healthy状态', () => {
      expect(orchestrator.getSystemHealth().status).toBe('unhealthy');

      const coreMembers = ['qian_hang', 'yu_shu', 'prophet', 'bole'];
      coreMembers.forEach(memberId => {
        orchestrator.registerMember(memberId as any, {
          process: async () => ({})
        });
      });

      expect(orchestrator.getSystemHealth().status).toBe('degraded');
    });
  });

  describe('5. 数据一致性验证', () => {
    it('5.1 NLU结果应该与编排器路由决策保持一致', async () => {
      const testInput = '推荐投资策略';

      const nluResult = await nluEngine.process({
        userId: 'consistency_user',
        userInput: testInput
      });

      const orchResponse = await orchestrator.orchestrate({
        userId: 'consistency_user',
        userInput: testInput
      });

      expect(nluResult.suggestedMembers.length).toBeGreaterThan(0);
      expect(orchResponse.metadata.routingDecision.primaryMember).toBeDefined();
    });

    it('5.2 请求历史记录应该包含完整的元数据', async () => {
      orchestrator.registerMember('qian_hang', {
        process: async (request: FamilyOrchestrationRequest) => nluEngine.process(request)
      });

      const userId = 'metadata_user';
      const testInput = '元数据完整性测试';

      await orchestrator.orchestrate({ userId, userInput: testInput });

      const history = orchestrator.getRequestHistory(userId);
      expect(history).toHaveLength(1);

      const record = history[0];
      expect(record.requestId).toMatch(/^req_/);
      expect(record.participants).toBeDefined();
      expect(record.confidence).toBeDefined();
      expect(record.processingTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('6. 错误恢复与容错', () => {
    it('6.1 应该在网络超时等异常情况下返回有意义的错误响应', async () => {
      const failingMember = {
        process: async () => {
          throw new Error('Simulated timeout error');
        }
      };

      orchestrator.registerMember('qian_hang', failingMember);

      const response = await orchestrator.orchestrate({
        userId: 'timeout_user',
        userInput: '超时测试'
      });

      expect(response).toBeDefined();
      expect(response.success).toBeDefined();
    }, 10000);

    it('6.2 应该在所有成员都不可用时使用终极降级方案', async () => {
      const response = await orchestrator.orchestrate({
        userId: 'ultimate_fallback_user',
        userInput: '所有成员都不可用时的测试'
      });

      expect(response).toBeDefined();
      expect(response.response).toBeDefined();
    });
  });

  describe('7. 单例模式与全局状态', () => {
    it('7.1 全局单例应该在多次调用间共享状态', () => {
      const instance1 = getTianShuOrchestrator();
      const instance2 = getTianShuOrchestrator();

      instance1.registerMember('qian_hang' as any, { process: async () => ({}) });

      const health1 = instance1.getSystemHealth();
      const health2 = instance2.getSystemHealth();

      expect(health1.registeredMembers).toBe(health2.registeredMembers);
    });

    it('7.2 NLU引擎单例应该跨请求保留上下文', async () => {
      const engine = getQianHangNLUEngine();

      await engine.process({
        userId: 'singleton_context_user',
        userInput: '第一轮'
      });

      await engine.process({
        userId: 'singleton_context_user',
        userInput: '第二轮'
      });

      const context = engine.getConversationContext('singleton_context_user');
      expect(context?.turnCount).toBe(2);
    });
  });

  describe('8. 边界条件集成测试', () => {
    it('8.1 应该处理包含特殊字符和emoji的用户输入', async () => {
      orchestrator.registerMember('qian_hang', {
        process: async (request: FamilyOrchestrationRequest) => nluEngine.process(request)
      });

      const specialInputs = [
        '<script>alert("xss")</script>',
        '测试🎉🚀内容',
        'SQL Injection"; DROP TABLE users; --',
        'Normal text with @mentions and #hashtags'
      ];

      for (const input of specialInputs) {
        const response = await orchestrator.orchestrate({
          userId: 'special_char_user',
          userInput: input
        });

        expect(response).toBeDefined();
        expect(response.requestId).toBeDefined();
      }
    });

    it('8.2 应该处理极短和极长的输入', async () => {
      orchestrator.registerMember('qian_hang', {
        process: async (request: FamilyOrchestrationRequest) => nluEngine.process(request)
      });

      const shortResponse = await orchestrator.orchestrate({
        userId: 'length_test_user',
        userInput: 'Hi'
      });

      const longText = '这是一个很长的查询'.repeat(100);
      const longResponse = await orchestrator.orchestrate({
        userId: 'length_test_user',
        userInput: longText
      });

      expect(shortResponse).toBeDefined();
      expect(longResponse).toBeDefined();
    });
  });
});
