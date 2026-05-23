import type { FamilyOrchestrationRequest } from './tian-shu-orchestrator';

export interface SecurityEvent {
  id: string;
  type: 'login' | 'api_call' | 'data_access' | 'trade' | 'config_change' | 'export';
  userId: string;
  ip?: string;
  resource: string;
  action: string;
  result: 'success' | 'failure' | 'blocked';
  riskScore: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface BehaviorBaseline {
  userId: string;
  avgDailyActions: number;
  avgTradeSize: number;
  preferredHours: number[];
  commonIps: string[];
  typicalPatterns: Record<string, number>;
  lastUpdated: Date;
}

export interface ThreatAssessment {
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  threatScore: number;
  detectedThreats: ThreatDetail[];
  recommendations: string[];
  autoActions: AutoAction[];
  assessedAt: Date;
}

export interface ThreatDetail {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  evidence: string[];
  affectedResources: string[];
}

export interface AutoAction {
  action: 'alert' | 'rate_limit' | 'block' | 'mfa_challenge' | 'session_invalidate';
  target: string;
  reason: string;
  duration?: number;
}

export interface SecurityAuditLog {
  totalEvents: number;
  threatsDetected: number;
  actionsBlocked: number;
  topThreatTypes: { type: string; count: number }[];
  riskTrend: 'improving' | 'stable' | 'degrading';
  period: { start: Date; end: Date };
}

export class GuardianSecurityService {
  private events: SecurityEvent[] = [];
  private baselines: Map<string, BehaviorBaseline> = new Map();
  private blockedIps: Set<string> = new Set();
  private rateLimitCounters: Map<string, { count: number; resetAt: number }> = new Map();
  private readonly MAX_EVENTS = 10000;
  private readonly RATE_LIMIT_WINDOW = 60000;
  private readonly RATE_LIMIT_MAX = 100;

  constructor() {
    console.log('🛡️ 智云·守护 Guardian Security Service initialized');
  }

  async process(request: FamilyOrchestrationRequest): Promise<{
    assessment: ThreatAssessment;
    auditLog: SecurityAuditLog;
    processingTimeMs: number;
  }> {
    const startTime = Date.now();
    const userId = request.userId;

    const event: SecurityEvent = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      type: request.context?.securityEventType || 'api_call',
      userId,
      ip: request.context?.ip,
      resource: request.userInput,
      action: 'process',
      result: 'success',
      riskScore: 0,
      timestamp: new Date(),
      metadata: request.context
    };

    event.riskScore = this.calculateEventRisk(event);
    this.recordEvent(event);

    const baseline = this.getOrCreateBaseline(userId);
    this.updateBaseline(baseline, event);

    const assessment = this.assessThreats(userId, event, baseline);
    const auditLog = this.generateAuditLog();

    if (assessment.autoActions.length > 0) {
      this.executeAutoActions(assessment.autoActions);
    }

    return {
      assessment,
      auditLog,
      processingTimeMs: Date.now() - startTime
    };
  }

  checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    let counter = this.rateLimitCounters.get(identifier);

    if (!counter || now > counter.resetAt) {
      counter = { count: 0, resetAt: now + this.RATE_LIMIT_WINDOW };
      this.rateLimitCounters.set(identifier, counter);
    }

    counter.count++;
    const allowed = counter.count <= this.RATE_LIMIT_MAX;
    return {
      allowed,
      remaining: Math.max(0, this.RATE_LIMIT_MAX - counter.count),
      resetIn: Math.max(0, counter.resetAt - now)
    };
  }

  validateApiKey(key: string): { valid: boolean; reason?: string } {
    if (!key || key.length < 16) return { valid: false, reason: 'API密钥长度不足' };
    if (key === 'test_key' || key === 'admin') return { valid: false, reason: '禁止使用测试密钥' };
    return { valid: true };
  }

  sanitizeInput(input: string): { sanitized: string; threats: string[] } {
    const threats: string[] = [];
    let sanitized = input;

    const sqlPatterns = [/(\bUNION\b.*\bSELECT\b)/i, /(\bDROP\b.*\bTABLE\b)/i, /(;|\-\-).*$/];
    const xssPatterns = [/<script\b[^>]*>/i, /javascript:/i, /on\w+\s*=/i];

    sqlPatterns.forEach(p => { if (p.test(sanitized)) threats.push('sql_injection'); });
    xssPatterns.forEach(p => { if (p.test(sanitized)) threats.push('xss'); });

    sanitized = sanitized
      .replace(/<script\b[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/['";]/g, '');

    return { sanitized, threats };
  }

  isIpBlocked(ip: string): boolean {
    return this.blockedIps.has(ip);
  }

  getBaseline(userId: string): BehaviorBaseline | undefined {
    return this.baselines.get(userId);
  }

  getRecentEvents(count = 50): SecurityEvent[] {
    return this.events.slice(-count);
  }

  private calculateEventRisk(event: SecurityEvent): number {
    let risk = 0;

    if (event.result === 'failure') risk += 0.3;
    if (event.type === 'config_change') risk += 0.2;
    if (event.type === 'export') risk += 0.15;

    const now = new Date();
    const hour = now.getHours();
    if (hour < 6 || hour > 23) risk += 0.2;

    if (event.ip && this.isNewIp(event.userId, event.ip)) risk += 0.25;

    if (event.type === 'login' && event.result === 'failure') risk += 0.4;

    return Math.min(risk, 1);
  }

  private assessThreats(userId: string, event: SecurityEvent, baseline: BehaviorBaseline): ThreatAssessment {
    const threats: ThreatDetail[] = [];
    let threatScore = 0;

    const recentFailures = this.getRecentFailures(userId, 300000);
    if (recentFailures >= 5) {
      threats.push({
        type: 'brute_force',
        description: `检测到${recentFailures}次失败尝试(5分钟内)`,
        severity: 'high',
        confidence: 0.9,
        evidence: [`最近5分钟${recentFailures}次失败`],
        affectedResources: [userId]
      });
      threatScore += 0.4;
    }

    if (event.ip && this.isNewIp(userId, event.ip)) {
      threats.push({
        type: 'unusual_ip',
        description: '检测到来自新IP地址的访问',
        severity: 'low',
        confidence: 0.6,
        evidence: [`IP: ${event.ip}`],
        affectedResources: [userId]
      });
      threatScore += 0.15;
    }

    const dailyActions = this.getTodayActions(userId);
    if (dailyActions > baseline.avgDailyActions * 3 && baseline.avgDailyActions > 0) {
      threats.push({
        type: 'anomalous_activity',
        description: `今日操作量(${dailyActions})异常高于基线(${baseline.avgDailyActions.toFixed(0)})`,
        severity: 'medium',
        confidence: 0.75,
        evidence: [`操作量: ${dailyActions}, 基线: ${baseline.avgDailyActions.toFixed(0)}`],
        affectedResources: [userId]
      });
      threatScore += 0.3;
    }

    const { sanitized, threats: inputThreats } = this.sanitizeInput(event.resource);
    if (inputThreats.length > 0) {
      threats.push({
        type: 'injection_attempt',
        description: `检测到潜在的${inputThreats.join('/')}攻击`,
        severity: 'critical',
        confidence: 0.85,
        evidence: [`输入包含: ${inputThreats.join(', ')}`],
        affectedResources: [userId]
      });
      threatScore += 0.5;
    }

    const autoActions: AutoAction[] = [];
    if (threatScore >= 0.7) {
      autoActions.push({ action: 'block', target: userId, reason: '高威胁分数触发自动阻断' });
    } else if (threatScore >= 0.4) {
      autoActions.push({ action: 'mfa_challenge', target: userId, reason: '中等威胁触发二次验证' });
    } else if (threatScore >= 0.2) {
      autoActions.push({ action: 'alert', target: userId, reason: '低威胁触发告警' });
    }

    const recommendations: string[] = [];
    if (threats.length > 0) recommendations.push('建议检查最近的账户活动');
    if (threatScore >= 0.3) recommendations.push('建议启用双因素认证');
    if (inputThreats.length > 0) recommendations.push('检测到恶意输入，已被自动过滤');
    if (recommendations.length === 0) recommendations.push('当前安全状态正常');

    let threatLevel: ThreatAssessment['threatLevel'] = 'none';
    if (threatScore >= 0.7) threatLevel = 'critical';
    else if (threatScore >= 0.5) threatLevel = 'high';
    else if (threatScore >= 0.3) threatLevel = 'medium';
    else if (threatScore >= 0.1) threatLevel = 'low';

    return {
      threatLevel,
      threatScore: Math.min(threatScore, 1),
      detectedThreats: threats,
      recommendations,
      autoActions,
      assessedAt: new Date()
    };
  }

  private recordEvent(event: SecurityEvent): void {
    this.events.push(event);
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-5000);
    }
  }

  private getOrCreateBaseline(userId: string): BehaviorBaseline {
    let baseline = this.baselines.get(userId);
    if (!baseline) {
      baseline = {
        userId,
        avgDailyActions: 20,
        avgTradeSize: 1000,
        preferredHours: [9, 10, 11, 14, 15],
        commonIps: [],
        typicalPatterns: {},
        lastUpdated: new Date()
      };
      this.baselines.set(userId, baseline);
    }
    return baseline;
  }

  private updateBaseline(baseline: BehaviorBaseline, event: SecurityEvent): void {
    if (event.ip && !baseline.commonIps.includes(event.ip)) {
      baseline.commonIps.push(event.ip);
      if (baseline.commonIps.length > 10) baseline.commonIps.shift();
    }
    baseline.lastUpdated = new Date();
  }

  private isNewIp(userId: string, ip: string): boolean {
    const baseline = this.baselines.get(userId);
    return baseline ? !baseline.commonIps.includes(ip) : true;
  }

  private getRecentFailures(userId: string, windowMs: number): number {
    const cutoff = Date.now() - windowMs;
    return this.events.filter(e =>
      e.userId === userId && e.result === 'failure' && e.timestamp.getTime() > cutoff
    ).length;
  }

  private getTodayActions(userId: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.events.filter(e => e.userId === userId && e.timestamp >= today).length;
  }

  private generateAuditLog(): SecurityAuditLog {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 86400000);
    const recent = this.events.filter(e => e.timestamp >= dayAgo);

    const threatCount = recent.filter(e => e.riskScore > 0.3).length;
    const blocked = recent.filter(e => e.result === 'blocked').length;

    const typeCounts: Record<string, number> = {};
    recent.filter(e => e.riskScore > 0.3).forEach(e => {
      typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    });
    const topThreatTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEvents: recent.length,
      threatsDetected: threatCount,
      actionsBlocked: blocked,
      topThreatTypes,
      riskTrend: threatCount > 5 ? 'degrading' : threatCount > 2 ? 'stable' : 'improving',
      period: { start: dayAgo, end: now }
    };
  }

  private executeAutoActions(actions: AutoAction[]): void {
    for (const action of actions) {
      switch (action.action) {
        case 'block':
          console.warn(`🚫 [Guardian] Blocked: ${action.target} - ${action.reason}`);
          break;
        case 'rate_limit':
          console.warn(`⏱️ [Guardian] Rate limited: ${action.target}`);
          break;
        case 'alert':
          console.warn(`⚠️ [Guardian] Alert: ${action.target} - ${action.reason}`);
          break;
        case 'mfa_challenge':
          console.warn(`🔐 [Guardian] MFA challenge: ${action.target}`);
          break;
        default:
          break;
      }
    }
  }
}

let guardianInstance: GuardianSecurityService | null = null;

export function getGuardianSecurityService(): GuardianSecurityService {
  if (!guardianInstance) {
    guardianInstance = new GuardianSecurityService();
  }
  return guardianInstance;
}
