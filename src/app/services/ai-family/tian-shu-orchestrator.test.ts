import { beforeEach, describe, expect, it } from 'vitest';

import {
  TianShuOrchestrator,
  getTianShuOrchestrator,
  type AIFamilyMemberId,
  type FamilyOrchestrationRequest,
  type RoutingDecision
} from './tian-shu-orchestrator';

describe('TianShuOrchestrator', () => {
  let orchestrator: TianShuOrchestrator;

  beforeEach(() => {
    orchestrator = new TianShuOrchestrator();
  });

  describe('1. 初始化与基础功能', () => {
    it('1.1 应该成功创建编排器实例', () => {
      expect(orchestrator).toBeDefined();
      expect(orchestrator).toBeInstanceOf(TianShuOrchestrator);
    });

    it('1.2 应该返回正确的系统健康状态', () => {
      const health = orchestrator.getSystemHealth();

      expect(health.status).toBe('unhealthy');
      expect(health.registeredMembers).toBe(0);
      expect(health.totalMembersAvailable).toBe(8);
      expect(health.uptime).toBeDefined();
    });

    it('1.3 应该返回完整的AI Family成员定义', () => {
      const members = TianShuOrchestrator.getAIFamilyDefinition();

      expect(members).toHaveLength(8);
      expect(members.map(m => m.id)).toEqual([
        'tian_shu',
        'qian_hang',
        'yu_shu',
        'prophet',
        'bole',
        'guardian',
        'grandmaster',
        'grace'
      ]);
    });

    it('1.4 单例模式应该返回相同实例', () => {
      const instance1 = getTianShuOrchestrator();
      const instance2 = getTianShuOrchestrator();

      expect(instance1).toBe(instance2);
    });
  });

  describe('2. 成员注册与管理', () => {
    it('2.1 应该成功注册AI Family成员', () => {
      const mockMember = {
        process: vi.fn().mockResolvedValue({ result: 'test' })
      };

      expect(() => {
        orchestrator.registerMember('qian_hang', mockMember);
      }).not.toThrow();

      const health = orchestrator.getSystemHealth();
      expect(health.registeredMembers).toBe(1);
    });

    it('2.2 应该能够获取已注册成员', () => {
      const mockMember = { process: vi.fn() };
      orchestrator.registerMember('bole', mockMember);

      const retrieved = orchestrator.getMember('bole');
      expect(retrieved).toBe(mockMember);
    });

    it('2.3 应该列出所有已注册成员', () => {
      orchestrator.registerMember('qian_hang', { process: vi.fn() });
      orchestrator.registerMember('yu_shu', { process: vi.fn() });
      orchestrator.registerMember('bole', { process: vi.fn() });

      const registered = orchestrator.listRegisteredMembers();
      expect(registered).toHaveLength(3);
      expect(registered.map(m => m.id)).toContain('qian_hang');
      expect(registered.map(m => m.id)).toContain('yu_shu');
      expect(registered.map(m => m.id)).toContain('bole');
    });

    it('2.4 注册未知成员ID应该抛出错误', () => {
      expect(() => {
        orchestrator.registerMember('unknown_member' as AIFamilyMemberId, {});
      }).toThrow('Unknown AI Family member: unknown_member');
    });

    it('2.5 获取未注册成员应该返回undefined', () => {
      const member = orchestrator.getMember('guardian');
      expect(member).toBeUndefined();
    });
  });

  describe('3. 智能路由决策', () => {
    let makeRoutingDecision: (request: FamilyOrchestrationRequest) => Promise<RoutingDecision>;

    beforeEach(() => {
      makeRoutingDecision = (request) =>
        (orchestrator as any).makeRoutingDecision(request);
    });

    it('3.1 策略相关查询应该路由到千里·伯乐', async () => {
      const decision = await makeRoutingDecision({
        userId: 'user1',
        userInput: '帮我设计一个量化交易策略'
      });

      expect(decision.primaryMember).toBe('bole');
      expect(decision.secondaryMembers).toContain('yu_shu');
      expect(decision.secondaryMembers).toContain('prophet');
      expect(decision.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('3.2 数据分析请求应该路由到语枢·万物', async () => {
      const decision = await makeRoutingDecision({
        userId: 'user1',
        userInput: '分析一下最近的市场数据趋势'
      });

      expect(decision.primaryMember).toBe('yu_shu');
      expect(decision.secondaryMembers).toContain('qian_hang');
    });

    it('3.3 预测类问题应该路由到预见·先知', async () => {
      const decision = await makeRoutingDecision({
        userId: 'user1',
        userInput: '预测未来一个月的股价走势'
      });

      expect(decision.primaryMember).toBe('prophet');
      expect(decision.secondaryMembers).toContain('yu_shu');
    });

    it('3.4 个性化推荐应该路由到千里·伯乐', async () => {
      const decision = await makeRoutingDecision({
        userId: 'user1',
        userInput: '推荐适合我的投资产品'
      });

      expect(decision.primaryMember).toBe('bole');
      expect(decision.confidence).toBeGreaterThan(0.85);
    });

    it('3.5 安全风险询问应该路由到智云·守护', async () => {
      const decision = await makeRoutingDecision({
        userId: 'user1',
        userInput: '检查我的账户安全状态'
      });

      expect(decision.primaryMember).toBe('guardian');
    });

    it('3.6 质量性能问题应该路由到格物·宗师', async () => {
      const decision = await makeRoutingDecision({
        userId: 'user1',
        userInput: '审查这段代码的质量'
      });

      expect(decision.primaryMember).toBe('grandmaster');
    });

    it('3.7 创意生成请求应该路由到创想·灵韵', async () => {
      const decision = await makeRoutingDecision({
        userId: 'user1',
        userInput: '生成一份创意营销文案'
      });

      expect(decision.primaryMember).toBe('grace');
    });

    it('3.8 通用帮助请求应该路由到言启·千行（默认）', async () => {
      const decision = await makeRoutingDecision({
        userId: 'user1',
        userInput: '你好，请帮我解释一下这个功能'
      });

      expect(decision.primaryMember).toBe('qian_hang');
      expect(decision.confidence).toBeLessThanOrEqual(0.8);
    });

    it('3.9 未匹配意图应该使用默认NLU处理', async () => {
      const decision = await makeRoutingDecision({
        userId: 'user1',
        userInput: 'xyz随机输入abc'
      });

      expect(decision.primaryMember).toBe('qian_hang');
      expect(decision.reasoning).toContain('默认NLU处理');
    });

    it('3.10 路由决策应包含推理说明', async () => {
      const decision = await makeRoutingDecision({
        userId: 'user1',
        userInput: '分析市场数据'
      });

      expect(decision.reasoning).toBeDefined();
      expect(decision.reasoning.length).toBeGreaterThan(0);
    });
  });

  describe('4. 编排执行流程', () => {
    it('4.1 应该成功执行已注册成员的处理请求', async () => {
      const mockQianHang = {
        process: vi.fn().mockResolvedValue({
          intent: 'general_query',
          response: '您好！有什么可以帮助您的？'
        })
      };

      orchestrator.registerMember('qian_hang', mockQianHang);

      const request: FamilyOrchestrationRequest = {
        userId: 'user1',
        userInput: '你好'
      };

      const response = await orchestrator.orchestrate(request);

      expect(response.success).toBe(true);
      expect(response.requestId).toBeDefined();
      expect(response.participants).toContain('qian_hang');
      expect(response.processingTimeMs).toBeGreaterThanOrEqual(0);
      expect(response.metadata.fallbackUsed).toBe(false);
    });

    it('4.2 应该调用主成员的process方法', async () => {
      const mockProcess = vi.fn().mockResolvedValue({ data: 'test' });
      orchestrator.registerMember('bole', { process: mockProcess });

      await orchestrator.orchestrate({
        userId: 'user1',
        userInput: '推荐策略'
      });

      expect(mockProcess).toHaveBeenCalledTimes(1);
      expect(mockProcess).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user1',
          userInput: '推荐策略'
        })
      );
    });

    it('4.3 主成员未注册时应该使用降级处理', async () => {
      const request: FamilyOrchestrationRequest = {
        userId: 'user1',
        userInput: '分析数据'
      };

      const response = await orchestrator.orchestrate(request);

      expect(response.success).toBe(true);
      expect(response.metadata.fallbackUsed).toBe(true);
      expect(response.response.source).toContain('fallback');
    });

    it('4.4 执行失败时应该返回错误响应', async () => {
      const failingMember = {
        process: vi.fn().mockRejectedValue(new Error('Processing failed'))
      };
      orchestrator.registerMember('qian_hang', failingMember);

      const response = await orchestrator.orchestrate({
        userId: 'user1',
        userInput: 'test error handling'
      });

      expect(response.success).toBe(false);
      expect(response.response.error).toBeDefined();
    });

    it('4.5 响应应该包含置信度评分', async () => {
      orchestrator.registerMember('qian_hang', {
        process: vi.fn().mockResolvedValue({})
      });

      const response = await orchestrator.orchestrate({
        userId: 'user1',
        userInput: 'test confidence'
      });

      expect(response.confidence).toBeDefined();
      expect(typeof response.confidence).toBe('number');
      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
    });

    it('4.6 高优先级请求应该正常处理', async () => {
      orchestrator.registerMember('guardian', {
        process: vi.fn().mockResolvedValue({ securityStatus: 'safe' })
      });

      const response = await orchestrator.orchestrate({
        userId: 'user1',
        userInput: '紧急：检测到异常登录',
        priority: 'critical'
      });

      expect(response.success).toBe(true);
    });
  });

  describe('5. 辅助成员协作', () => {
    it('5.1 应该调用辅助成员增强结果', async () => {
      const primaryResult = { analysis: 'market is bullish' };

      const primaryMember = {
        process: vi.fn().mockResolvedValue(primaryResult)
      };

      const secondaryMember = {
        enhance: vi.fn().mockResolvedValue({
          riskAssessment: 'medium risk',
          sentiment: 'positive'
        })
      };

      orchestrator.registerMember('yu_shu', primaryMember);
      orchestrator.registerMember('qian_hang', secondaryMember);

      const response = await orchestrator.orchestrate({
        userId: 'user1',
        userInput: '分析市场趋势'
      });

      expect(response.success).toBe(true);
      expect(secondaryMember.enhance).toHaveBeenCalled();
    });

    it('5.2 辅助成员失败不应该影响主结果', async () => {
      const primaryMember = {
        process: vi.fn().mockResolvedValue({ mainData: 'result' })
      };

      const failingSecondary = {
        enhance: vi.fn().mockRejectedValue(new Error('Secondary failed'))
      };

      orchestrator.registerMember('yu_shu', primaryMember);
      orchestrator.registerMember('qian_hang', failingSecondary);

      const response = await orchestrator.orchestrate({
        userId: 'user1',
        userInput: '测试辅助失败'
      });

      expect(response).toBeDefined();
      expect(response.requestId).toBeDefined();
      expect(response.metadata.fallbackUsed).toBeDefined();
    });

    it('5.3 结果合并应该保留两个来源的数据', async () => {
      const primaryMember = {
        process: vi.fn().mockResolvedValue({
          source: 'primary',
          data: 'main result'
        })
      };

      const secondaryMember = {
        enhance: vi.fn().mockResolvedValue({
          source: 'secondary',
          extra: 'additional info'
        })
      };

      orchestrator.registerMember('bole', primaryMember);
      orchestrator.registerMember('yu_shu', secondaryMember);

      const response = await orchestrator.orchestrate({
        userId: 'user1',
        userInput: '测试结果合并'
      });

      expect(response).toBeDefined();
      expect(response.response).toBeDefined();
    });
  });

  describe('6. 请求历史记录', () => {
    it('6.1 应该记录成功的请求历史', async () => {
      orchestrator.registerMember('qian_hang', {
        process: vi.fn().mockResolvedValue({})
      });

      await orchestrator.orchestrate({
        userId: 'user1',
        userInput: 'first request'
      });

      await orchestrator.orchestrate({
        userId: 'user1',
        userInput: 'second request'
      });

      const history = orchestrator.getRequestHistory('user1');
      expect(history).toHaveLength(2);
    });

    it('6.2 也应该记录失败的请求', async () => {
      await orchestrator.orchestrate({
        userId: 'user2',
        userInput: 'will fail - no member registered'
      });

      const history = orchestrator.getRequestHistory('user2');
      expect(history).toHaveLength(1);
      expect(history[0]).toBeDefined();
    });

    it('6.3 历史记录应该限制最大数量（100条）', async () => {
      orchestrator.registerMember('qian_hang', {
        process: vi.fn().mockResolvedValue({})
      });

      for (let i = 0; i < 105; i++) {
        await orchestrator.orchestrate({
          userId: 'user3',
          userInput: `request ${i}`
        });
      }

      const history = orchestrator.getRequestHistory('user3');
      expect(history.length).toBeLessThanOrEqual(100);
    });

    it('6.4 不同用户的历史应该独立存储', async () => {
      orchestrator.registerMember('qian_hang', {
        process: vi.fn().mockResolvedValue({})
      });

      await orchestrator.orchestrate({
        userId: 'userA',
        userInput: 'request from user A'
      });

      await orchestrator.orchestrate({
        userId: 'userB',
        userInput: 'request from user B'
      });

      const historyA = orchestrator.getRequestHistory('userA');
      const historyB = orchestrator.getRequestHistory('userB');

      expect(historyA).toHaveLength(1);
      expect(historyB).toHaveLength(1);
      expect(historyA[0].requestId).not.toEqual(historyB[0].requestId);
    });

    it('6.5 应该支持限制返回的历史数量', async () => {
      orchestrator.registerMember('qian_hang', {
        process: vi.fn().mockResolvedValue({})
      });

      for (let i = 0; i < 10; i++) {
        await orchestrator.orchestrate({
          userId: 'user4',
          userInput: `request ${i}`
        });
      }

      const last3 = orchestrator.getRequestHistory('user4', 3);
      expect(last3).toHaveLength(3);
    });
  });

  describe('7. 边界情况与错误处理', () => {
    it('7.1 空用户输入应该正常处理', async () => {
      const response = await orchestrator.orchestrate({
        userId: 'user1',
        userInput: ''
      });

      expect(response.success).toBeDefined();
      expect(response.requestId).toBeDefined();
    });

    it('7.2 特殊字符输入应该正常处理', async () => {
      const response = await orchestrator.orchestrate({
        userId: 'user1',
        userInput: '<script>alert("xss")</script> & 特殊字符 🎉'
      });

      expect(response.success).toBeDefined();
    });

    it('7.3 超长输入应该正常处理', async () => {
      const longInput = '测试'.repeat(1000);

      const response = await orchestrator.orchestrate({
        userId: 'user1',
        userInput: longInput
      });

      expect(response.success).toBeDefined();
    });

    it('7.4 并发请求应该正确处理', async () => {
      orchestrator.registerMember('qian_hang', {
        process: vi.fn(async ({ userInput }: { userInput: string }) => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return { processed: userInput };
        })
      });

      const requests = Array.from({ length: 5 }, (_, i) =>
        orchestrator.orchestrate({
          userId: `user${i}`,
          userInput: `concurrent request ${i}`
        })
      );

      const responses = await Promise.all(requests);

      expect(responses).toHaveLength(5);
      responses.forEach(response => {
        expect(response.success).toBe(true);
      });
    });

    it('7.5 未提供userId应该仍然工作', async () => {
      const response = await orchestrator.orchestrate({
        userId: '',
        userInput: 'no user id'
      });

      expect(response).toBeDefined();
    });

    it('7.6 包含上下文信息的请求应该正确传递', async () => {
      const memberWithContext = {
        process: vi.fn().mockResolvedValue({})
      };
      orchestrator.registerMember('bole', memberWithContext);

      const contextData = {
        marketCondition: 'bullish',
        userPortfolio: { value: 100000 },
        timestamp: new Date()
      };

      await orchestrator.orchestrate({
        userId: 'user1',
        userInput: '基于当前持仓给出建议',
        context: contextData
      });

      expect(memberWithContext.process).toHaveBeenCalledWith(
        expect.objectContaining({
          context: contextData
        })
      );
    });
  });

  describe('8. 性能与可靠性', () => {
    it('8.1 处理时间应该在合理范围内 (< 100ms for simple cases)', async () => {
      orchestrator.registerMember('qian_hang', {
        process: vi.fn().mockResolvedValue({ fast: true })
      });

      const start = Date.now();
      await orchestrator.orchestrate({
        userId: 'perf_user',
        userInput: 'quick test'
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('8.2 多次连续调用应该保持稳定', async () => {
      orchestrator.registerMember('qian_hang', {
        process: vi.fn().mockResolvedValue({ stable: true })
      });

      const results = [];
      for (let i = 0; i < 20; i++) {
        const response = await orchestrator.orchestrate({
          userId: 'stability_user',
          userInput: `iteration ${i}`
        });
        results.push(response.success);
      }

      expect(results.every(success => success === true)).toBe(true);
    });

    it('8.3 系统应该在注册足够成员后变为healthy状态', () => {
      expect(orchestrator.getSystemHealth().status).toBe('unhealthy');

      const membersToRegister = ['qian_hang', 'yu_shu', 'prophet', 'bole', 'guardian'];
      membersToRegister.forEach(memberId => {
        orchestrator.registerMember(memberId as AIFamilyMemberId, {
          process: vi.fn()
        });
      });

      expect(orchestrator.getSystemHealth().status).toBe('healthy');
    });

    it('8.4 注册3-4个成员应该是degraded状态', () => {
      ['qian_hang', 'yu_shu', 'bole'].forEach(memberId => {
        orchestrator.registerMember(memberId as AIFamilyMemberId, {
          process: vi.fn()
        });
      });

      expect(orchestrator.getSystemHealth().status).toBe('degraded');
    });
  });

  describe('9. Request ID 唯一性', () => {
    it('9.1 每次请求应该生成唯一的requestId', async () => {
      orchestrator.registerMember('qian_hang', {
        process: vi.fn().mockResolvedValue({})
      });

      const ids = new Set();
      for (let i = 0; i < 50; i++) {
        const response = await orchestrator.orchestrate({
          userId: 'unique_id_test',
          userInput: `request ${i}`
        });
        ids.add(response.requestId);
      }

      expect(ids.size).toBe(50);
    });

    it('9.2 requestId格式应该符合规范', async () => {
      orchestrator.registerMember('qian_hang', {
        process: vi.fn().mockResolvedValue({})
      });

      const response = await orchestrator.orchestrate({
        userId: 'format_test',
        userInput: 'check format'
      });

      expect(response.requestId).toMatch(/^req_\d+_[a-z0-9]{9}$/);
    });
  });
});
