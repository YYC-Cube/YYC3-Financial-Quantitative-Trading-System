import { beforeEach, describe, expect, it } from 'vitest';

import { BoleRecommendationEngine, getBoleRecommendationEngine } from './bole-recommendation';
import { GraceCreativeService, getGraceCreativeService } from './grace-creative';
import { GrandmasterQualityAuditor, getGrandmasterQualityAuditor } from './grandmaster-quality';
import { GuardianSecurityService, getGuardianSecurityService } from './guardian-security';
import type { FamilyOrchestrationRequest } from './tian-shu-orchestrator';

function makeRequest(userId: string, input: string, context?: Record<string, any>): FamilyOrchestrationRequest {
  return { userId, userInput: input, context };
}

describe('千里·伯乐 BoleRecommendationEngine', () => {
  let engine: BoleRecommendationEngine;

  beforeEach(() => { engine = new BoleRecommendationEngine(); });

  it('1.1 应该成功创建实例', () => {
    expect(engine).toBeDefined();
  });

  it('1.2 单例模式', () => {
    expect(getBoleRecommendationEngine()).toBe(getBoleRecommendationEngine());
  });

  it('1.3 应该生成推荐结果', async () => {
    const result = await engine.process(makeRequest('user1', '推荐交易策略'));
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.userProfile).toBeDefined();
    expect(result.totalScore).toBeGreaterThan(0);
  });

  it('1.4 推荐应包含必要字段', async () => {
    const result = await engine.process(makeRequest('user1', '推荐'));
    const rec = result.recommendations[0];
    expect(rec.id).toBeDefined();
    expect(rec.title).toBeDefined();
    expect(rec.confidence).toBeGreaterThan(0);
    expect(rec.reason).toBeDefined();
    expect(['low', 'medium', 'high', 'critical']).toContain(rec.priority);
  });

  it('1.5 保守型用户应推荐低风险策略', async () => {
    const result = await engine.process(makeRequest('conservative_user', '推荐策略', {
      riskTolerance: 'conservative', experienceLevel: 'beginner'
    }));
    const strategyRecs = result.recommendations.filter(r => r.type === 'strategy');
    expect(strategyRecs.length).toBeGreaterThan(0);
    strategyRecs.forEach(r => {
      expect(r.confidence).toBeGreaterThan(0.5);
    });
  });

  it('1.6 激进型用户应推荐更多策略', async () => {
    const result = await engine.process(makeRequest('aggressive_user', '推荐', {
      riskTolerance: 'aggressive', experienceLevel: 'expert'
    }));
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('1.7 应该创建用户画像', () => {
    const profile = engine.getOrCreateProfile('new_user', { experienceLevel: 'intermediate' });
    expect(profile.userId).toBe('new_user');
    expect(profile.experienceLevel).toBe('intermediate');
  });

  it('1.8 应该记录反馈', () => {
    engine.recordFeedback('user1', 'rec_123', 5);
    engine.recordFeedback('user1', 'rec_456', 3);
    // No assertion needed - just verifying no error
    expect(true).toBe(true);
  });

  it('1.9 止损相关查询应生成风险管理推荐', async () => {
    const result = await engine.process(makeRequest('user1', '帮我设置止损'));
    const riskRecs = result.recommendations.filter(r => r.category === 'risk_management');
    expect(riskRecs.length).toBeGreaterThan(0);
  });

  it('1.10 新手查询应生成教育推荐', async () => {
    const result = await engine.process(makeRequest('beginner', '新手入门怎么学'));
    const eduRecs = result.recommendations.filter(r => r.type === 'education');
    expect(eduRecs.length).toBeGreaterThan(0);
  });

  it('1.11 推荐数量不应超过10条', async () => {
    const result = await engine.process(makeRequest('user1', '综合推荐'));
    expect(result.recommendations.length).toBeLessThanOrEqual(10);
  });

  it('1.12 应该按置信度降序排列', async () => {
    const result = await engine.process(makeRequest('user1', '推荐'));
    for (let i = 1; i < result.recommendations.length; i++) {
      expect(result.recommendations[i - 1].confidence).toBeGreaterThanOrEqual(
        result.recommendations[i].confidence
      );
    }
  });
});

describe('智云·守护 GuardianSecurityService', () => {
  let guardian: GuardianSecurityService;

  beforeEach(() => { guardian = new GuardianSecurityService(); });

  it('2.1 应该成功创建实例', () => {
    expect(guardian).toBeDefined();
  });

  it('2.2 单例模式', () => {
    expect(getGuardianSecurityService()).toBe(getGuardianSecurityService());
  });

  it('2.3 正常请求应评估为低威胁', async () => {
    const result = await guardian.process(makeRequest('user1', '分析市场'));
    expect(result.assessment.threatLevel).toBeDefined();
    expect(result.assessment.threatScore).toBeGreaterThanOrEqual(0);
    expect(result.auditLog).toBeDefined();
  });

  it('2.4 速率限制应正常工作', () => {
    for (let i = 0; i < 100; i++) {
      const check = guardian.checkRateLimit('test_ip');
      if (i < 99) expect(check.allowed).toBe(true);
    }
    const exceeded = guardian.checkRateLimit('test_ip');
    expect(exceeded.allowed).toBe(false);
    expect(exceeded.remaining).toBe(0);
  });

  it('2.5 API密钥验证-无效密钥', () => {
    expect(guardian.validateApiKey('').valid).toBe(false);
    expect(guardian.validateApiKey('short').valid).toBe(false);
    expect(guardian.validateApiKey('test_key').valid).toBe(false);
    expect(guardian.validateApiKey('admin').valid).toBe(false);
  });

  it('2.6 API密钥验证-有效密钥', () => {
    expect(guardian.validateApiKey('a'.repeat(32)).valid).toBe(true);
  });

  it('2.7 输入净化应过滤XSS', () => {
    const result = guardian.sanitizeInput('<script>alert("xss")</script>test');
    expect(result.threats).toContain('xss');
    expect(result.sanitized).not.toContain('<script>');
  });

  it('2.8 输入净化应检测SQL注入', () => {
    const result = guardian.sanitizeInput('UNION SELECT * FROM users');
    expect(result.threats).toContain('sql_injection');
  });

  it('2.9 正常输入不应触发威胁', () => {
    const result = guardian.sanitizeInput('分析AAPL的股价走势');
    expect(result.threats).toHaveLength(0);
  });

  it('2.10 注入攻击应提升威胁等级', async () => {
    const result = await guardian.process(makeRequest('attacker', '<script>alert(1)</script>', {
      securityEventType: 'api_call'
    }));
    expect(result.assessment.detectedThreats.length).toBeGreaterThan(0);
    const injection = result.assessment.detectedThreats.find(t => t.type === 'injection_attempt');
    expect(injection).toBeDefined();
    expect(injection?.severity).toBe('critical');
  });

  it('2.11 IP封锁检查', () => {
    expect(guardian.isIpBlocked('1.2.3.4')).toBe(false);
  });

  it('2.12 行为基线创建', async () => {
    await guardian.process(makeRequest('baseline_user', 'test', { ip: '10.0.0.1' }));
    const baseline = guardian.getBaseline('baseline_user');
    expect(baseline).toBeDefined();
    expect(baseline?.userId).toBe('baseline_user');
    expect(baseline?.commonIps).toContain('10.0.0.1');
  });

  it('2.13 审计日志应记录事件', async () => {
    await guardian.process(makeRequest('log_user', 'test1'));
    await guardian.process(makeRequest('log_user', 'test2'));
    const log = (await guardian.process(makeRequest('log_user', 'test3'))).auditLog;
    expect(log.totalEvents).toBeGreaterThan(0);
  });

  it('2.14 最近事件应可查询', async () => {
    await guardian.process(makeRequest('evt_user', 'query'));
    const events = guardian.getRecentEvents(5);
    expect(events.length).toBeGreaterThan(0);
  });
});

describe('格物·宗师 GrandmasterQualityAuditor', () => {
  let auditor: GrandmasterQualityAuditor;
  const sampleCode = `import React from 'react';

interface Props { name: string; age: number }

export const UserCard: React.FC<Props> = ({ name, age }) => {
  const handleClick = () => {
    console.log(name);
  };

  return (
    <div onClick={handleClick}>
      <h1>{name}</h1>
      <p>Age: {age}</p>
    </div>
  );
};
`;

  beforeEach(() => { auditor = new GrandmasterQualityAuditor(); });

  it('3.1 应该成功创建实例', () => {
    expect(auditor).toBeDefined();
  });

  it('3.2 单例模式', () => {
    expect(getGrandmasterQualityAuditor()).toBe(getGrandmasterQualityAuditor());
  });

  it('3.3 应该审计TypeScript代码', async () => {
    const result = await auditor.process(makeRequest('auditor', 'UserCard.tsx', {
      filePath: 'UserCard.tsx',
      code: sampleCode,
      language: 'typescript'
    }));
    expect(result.report.metrics).toBeDefined();
    expect(result.report.metrics.grade).toBeDefined();
    expect(result.report.metrics.overall).toBeGreaterThan(0);
    expect(result.report.issues).toBeDefined();
  });

  it('3.4 空代码应返回F级', async () => {
    const result = await auditor.process(makeRequest('auditor', 'empty.ts', {
      filePath: 'empty.ts',
      code: '',
      language: 'typescript'
    }));
    expect(result.report.metrics.grade).toBe('F');
    expect(result.report.metrics.overall).toBe(0);
  });

  it('3.5 优质代码应获得较高评分', async () => {
    const goodCode = `interface User { readonly id: string; name: string; email: string }

export function getUser(id: string): User | null {
  try {
    const data = localStorage.getItem('user_' + id);
    if (!data) return null;
    return JSON.parse(data) as User;
  } catch {
    return null;
  }
}

export function formatUser(user: User): string {
  return user.name + ' <' + user.email + '>';
}`;
    const result = await auditor.process(makeRequest('auditor', 'user.ts', {
      filePath: 'user.ts',
      code: goodCode,
      language: 'typescript'
    }));
    expect(result.report.metrics.overall).toBeGreaterThan(60);
  });

  it('3.6 应该检测any类型使用', async () => {
    const anyCode = `const data: any = {}; function process(input: any): any { return input; }`;
    const result = await auditor.process(makeRequest('auditor', 'any.ts', {
      code: anyCode, language: 'typescript'
    }));
    const anyIssues = result.report.issues.filter(i => i.rule === 'no-explicit-any');
    expect(anyIssues.length).toBeGreaterThan(0);
  });

  it('3.7 应该检测eval使用', async () => {
    const evalCode = `const result = eval("2 + 2");`;
    const result = await auditor.process(makeRequest('auditor', 'eval.ts', {
      code: evalCode, language: 'typescript'
    }));
    const evalIssues = result.report.issues.filter(i => i.rule === 'no-eval');
    expect(evalIssues.length).toBeGreaterThan(0);
    expect(evalIssues[0].severity).toBe('critical');
  });

  it('3.8 应该分析架构', async () => {
    const result = await auditor.process(makeRequest('auditor', 'arch.ts', {
      code: sampleCode, language: 'typescript'
    }));
    expect(result.report.architecture.modularity).toBeGreaterThan(0);
    expect(result.report.architecture.dependencyCount).toBeGreaterThanOrEqual(0);
  });

  it('3.9 应该评估性能', async () => {
    const result = await auditor.process(makeRequest('auditor', 'perf.ts', {
      code: sampleCode, language: 'typescript'
    }));
    expect(result.report.performance.bundleSizeEstimate).toBeGreaterThan(0);
    expect(['low', 'medium', 'high']).toContain(result.report.performance.renderComplexity);
  });

  it('3.10 应该记录审计历史', async () => {
    await auditor.process(makeRequest('auditor', 'history.ts', {
      code: 'const x = 1;', language: 'typescript'
    }));
    const history = auditor.getAuditHistory('history.ts');
    expect(history.length).toBe(1);
  });

  it('3.11 应该生成改进建议', async () => {
    const result = await auditor.process(makeRequest('auditor', 'suggest.ts', {
      code: 'const x: any = 1;', language: 'typescript'
    }));
    expect(result.report.suggestions.length).toBeGreaterThan(0);
  });
});

describe('创想·灵韵 GraceCreativeService', () => {
  let grace: GraceCreativeService;

  beforeEach(() => { grace = new GraceCreativeService(); });

  it('4.1 应该成功创建实例', () => {
    expect(grace).toBeDefined();
  });

  it('4.2 单例模式', () => {
    expect(getGraceCreativeService()).toBe(getGraceCreativeService());
  });

  it('4.3 应该生成创意资产', async () => {
    const result = await grace.process(makeRequest('creative_user', '生成营销文案'));
    expect(result.assets.length).toBeGreaterThan(0);
    expect(result.prompt).toBeDefined();
    expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('4.4 营销请求应生成文案', async () => {
    const result = await grace.process(makeRequest('user1', '生成营销推广广告'));
    const copyAssets = result.assets.filter(a => a.type === 'copywriting');
    expect(copyAssets.length).toBeGreaterThan(0);
  });

  it('4.5 品牌请求应生成配色', async () => {
    const result = await grace.process(makeRequest('user1', '设计品牌Logo配色'));
    const paletteAssets = result.assets.filter(a => a.type === 'color_palette');
    expect(paletteAssets.length).toBeGreaterThan(0);
  });

  it('4.6 社交媒体请求应生成图像提示', async () => {
    const result = await grace.process(makeRequest('user1', '社交媒体分享图片'));
    const imgAssets = result.assets.filter(a => a.type === 'image_prompt');
    expect(imgAssets.length).toBeGreaterThan(0);
  });

  it('4.7 应该返回配色方案列表', () => {
    const palettes = grace.getColorPalettes();
    expect(palettes.length).toBeGreaterThan(0);
    palettes.forEach(p => {
      expect(p.primary).toMatch(/^#[0-9A-F]{6}$/);
      expect(p.name).toBeDefined();
    });
  });

  it('4.8 应该返回布局模板', () => {
    const layouts = grace.getLayoutTemplates();
    expect(layouts.length).toBeGreaterThan(0);
    layouts.forEach(l => {
      expect(l.sections.length).toBeGreaterThan(0);
    });
  });

  it('4.9 应该生成图像提示词', () => {
    const prompt = grace.generateImagePrompt('量化交易仪表盘', 'professional');
    expect(prompt).toContain('professional');
    expect(prompt.length).toBeGreaterThan(20);
  });

  it('4.10 应该记录创作历史', async () => {
    await grace.process(makeRequest('hist_user', '创作1'));
    await grace.process(makeRequest('hist_user', '创作2'));
    const history = grace.getHistory('hist_user');
    expect(history.length).toBe(2);
  });

  it('4.11 应该返回营销文案模板', () => {
    const copy = grace.getMarketingCopy('strategy_launch');
    expect(copy.length).toBeGreaterThan(0);
    copy.forEach(c => {
      expect(c.headline).toBeDefined();
      expect(c.body).toBeDefined();
      expect(c.cta).toBeDefined();
    });
  });

  it('4.12 通用请求应生成文本资产', async () => {
    const result = await grace.process(makeRequest('user1', '帮我写一段关于量化交易的介绍'));
    const textAssets = result.assets.filter(a => a.type === 'text');
    expect(textAssets.length).toBeGreaterThan(0);
  });
});
