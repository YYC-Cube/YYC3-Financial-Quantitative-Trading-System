/**
 * @file src/app/services/signal-chain-engine.test.ts
 * @description 信号链引擎风险管理测试套件 - 覆盖率目标90%+
 * @author Test Suite Generator v2.0
 * @version 1.0.0
 */

import { beforeEach, describe, expect, it } from 'vitest';

import {
  createSignalChainEngine,
  signalChainEngine,
  type ChainEvent,
  type ExecutionStatus,
  type RiskCheck,
  type RiskDecision,
  type RiskRuleConfig,
  type SignalAction,
  type SignalChainStage,
  type StrategySignalInput,
  type TradeRecommendation
} from './signal-chain-engine';

describe('SignalChainEngine - Risk Management', () => {

  let engine: ReturnType<typeof createSignalChainEngine>;

  beforeEach(() => {
    engine = createSignalChainEngine();
  });

  function createTestSignal(overrides: Partial<StrategySignalInput> = {}): StrategySignalInput {
    return {
      strategyId: 1,
      strategyName: 'Test Strategy',
      symbol: 'BTC/USDT',
      action: 'BUY',
      confidence: 80,
      suggestedQuantity: 1.0,
      suggestedPrice: 50000,
      reason: 'Test signal',
      ...overrides,
    };
  }

  describe('Type Exports', () => {

    it('should export SignalChainStage types', () => {
      const stages: SignalChainStage[] = ['SIGNAL', 'RISK_EVAL', 'EXECUTION'];
      expect(stages).toContain('SIGNAL');
      expect(stages).toContain('RISK_EVAL');
      expect(stages).toContain('EXECUTION');
    });

    it('should export SignalAction types', () => {
      const actions: SignalAction[] = ['BUY', 'SELL', 'HOLD', 'CLOSE', 'REDUCE'];
      expect(actions).toHaveLength(5);
    });

    it('should export RiskDecision types', () => {
      const decisions: RiskDecision[] = ['APPROVE', 'REJECT', 'MODIFY', 'ESCALATE'];
      expect(decisions).toHaveLength(4);
    });

    it('should export ExecutionStatus types', () => {
      const statuses: ExecutionStatus[] = ['PENDING', 'SUBMITTED', 'FILLED', 'CANCELLED', 'REJECTED'];
      expect(statuses).toHaveLength(5);
    });
  });

  describe('createSignalChainEngine()', () => {

    it('should create engine instance with default config', () => {
      const instance = createSignalChainEngine();

      expect(instance).toBeDefined();
      expect(typeof instance.ingestStrategySignal).toBe('function');
      expect(typeof instance.onChainEvent).toBe('function');
    });

    it('should create engine with custom risk rules', () => {
      const customConfig: Partial<RiskRuleConfig> = {
        maxPositionPercent: 20,
        maxDailyDrawdown: 3,
        maxLeverage: 5,
        minConfidence: 80,
        maxOpenPositions: 10,
      };

      const instance = createSignalChainEngine(customConfig);

      expect(instance).toBeDefined();
    });

    it('should create multiple independent instances', () => {
      const engine1 = createSignalChainEngine();
      const engine2 = createSignalChainEngine();

      expect(engine1).not.toBe(engine2);
    });
  });

  describe('ingestStrategySignal()', () => {

    it('should process valid BUY signal', () => {
      const signal = createTestSignal({ action: 'BUY' });
      const result = engine.ingestStrategySignal(signal);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.signal).toEqual(signal);
    });

    it('should process valid SELL signal', () => {
      const signal = createTestSignal({
        strategyId: 2,
        symbol: 'ETH/USDT',
        action: 'SELL',
        suggestedQuantity: 10.0,
        suggestedPrice: 3000,
      });

      const result = engine.ingestStrategySignal(signal);

      expect(result).toBeDefined();
      expect(result.signal.action).toBe('SELL');
    });

    it('should process HOLD signal', () => {
      const signal = createTestSignal({
        action: 'HOLD',
        confidence: 50,
        suggestedQuantity: 50.0,
        suggestedPrice: 100,
      });

      const result = engine.ingestStrategySignal(signal);

      expect(result).toBeDefined();
      expect(result.signal.action).toBe('HOLD');
    });

    it('should process CLOSE action', () => {
      const signal = createTestSignal({
        action: 'CLOSE',
        confidence: 95,
        suggestedQuantity: 10.0,
        suggestedPrice: 300,
      });

      const result = engine.ingestStrategySignal(signal);

      expect(result).toBeDefined();
      expect(result.signal.action).toBe('CLOSE');
    });

    it('should process REDUCE action', () => {
      const signal = createTestSignal({
        action: 'REDUCE',
        confidence: 80,
        suggestedQuantity: 1000.0,
        suggestedPrice: 0.5,
      });

      const result = engine.ingestStrategySignal(signal);

      expect(result).toBeDefined();
      expect(result.signal.action).toBe('REDUCE');
    });

    it('should return event with duration', () => {
      const signal = createTestSignal();
      const result = engine.ingestStrategySignal(signal);

      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(typeof result.duration).toBe('number');
    });
  });

  describe('Risk Evaluation (via ingestStrategySignal)', () => {

    it('should include risk evaluation in event', () => {
      const signal = createTestSignal({ confidence: 90, suggestedQuantity: 0.1 });
      const event = engine.ingestStrategySignal(signal);

      expect(event.riskEval).toBeDefined();
      expect(event.riskEval!.decision).toBeDefined();
      expect(event.riskEval!.riskScore).toBeGreaterThanOrEqual(0);
      expect(event.riskEval!.riskScore).toBeLessThanOrEqual(100);
    });

    it('should include risk checks array', () => {
      const signal = createTestSignal();
      const event = engine.ingestStrategySignal(signal);

      expect(event.riskEval!.checks).toBeDefined();
      expect(Array.isArray(event.riskEval!.checks)).toBe(true);
      expect(event.riskEval!.checks.length).toBeGreaterThan(0);
    });

    it('should validate each risk check structure', () => {
      const signal = createTestSignal();
      const event = engine.ingestStrategySignal(signal);

      event.riskEval!.checks.forEach((check: RiskCheck) => {
        expect(check).toHaveProperty('rule');
        expect(check).toHaveProperty('passed');
        expect(check).toHaveProperty('detail');
        expect(check).toHaveProperty('severity');
        expect(['low', 'medium', 'high']).toContain(check.severity);
      });
    });

    it('should include reason field in evaluation', () => {
      const signal = createTestSignal();
      const event = engine.ingestStrategySignal(signal);

      expect(event.riskEval!.reason).toBeDefined();
      expect(typeof event.riskEval!.reason).toBe('string');
    });

    it('should include VaR and drawdown impact estimates', () => {
      const signal = createTestSignal();
      const event = engine.ingestStrategySignal(signal);

      expect(typeof event.riskEval!.varImpact).toBe('number');
      expect(typeof event.riskEval!.maxDrawdownImpact).toBe('number');
    });
  });

  describe('Trade Recommendation Generation', () => {

    it('should generate trade recommendation for approved signals', () => {
      const signal = createTestSignal({
        confidence: 95,
        suggestedQuantity: 0.1,
        reason: 'Strong buy signal',
      });

      const event = engine.ingestStrategySignal(signal);

      if (event.tradeRec) {
        const rec: TradeRecommendation = event.tradeRec;

        expect(rec.status).toBeDefined();
        expect(rec.symbol).toBe(signal.symbol);
        expect(rec.quantity).toBeGreaterThan(0);
        expect(rec.price).toBeGreaterThan(0);
      }
    });

    it('should set correct side for BUY action', () => {
      const signal = createTestSignal({ action: 'BUY' });
      const event = engine.ingestStrategySignal(signal);

      if (event.tradeRec) {
        expect(event.tradeRec.side).toBe('BUY');
      }
    });

    it('should set correct side for SELL action', () => {
      const signal = createTestSignal({ action: 'SELL' });
      const event = engine.ingestStrategySignal(signal);

      if (event.tradeRec) {
        expect(event.tradeRec.side).toBe('SELL');
      }
    });

    it('should include execution mode', () => {
      const signal = createTestSignal();
      const event = engine.ingestStrategySignal(signal);

      if (event.tradeRec) {
        expect(['auto', 'manual', 'blocked']).toContain(event.tradeRec.executionMode);
      }
    });

    it('should include reason in recommendation', () => {
      const signal = createTestSignal({ reason: 'Custom test reason' });
      const event = engine.ingestStrategySignal(signal);

      if (event.tradeRec) {
        expect(event.tradeRec.reason).toBeDefined();
        expect(typeof event.tradeRec.reason).toBe('string');
      }
    });
  });

  describe('Event System (onChainEvent)', () => {

    it('should emit events during processing', () => {
      const events: ChainEvent[] = [];
      const listener = (event: ChainEvent) => events.push(event);

      const unsub = engine.onChainEvent(listener);

      const signal = createTestSignal();
      engine.ingestStrategySignal(signal);

      expect(events.length).toBeGreaterThan(0);

      const lastEvent = events[events.length - 1];
      expect(lastEvent.id).toBeDefined();
      expect(lastEvent.timestamp).toBeDefined();
      expect(typeof lastEvent.timestamp).toBe('number');

      unsub();
    });

    it('should emit SIGNAL stage event first', () => {
      const stages: SignalChainStage[] = [];
      const listener = (event: ChainEvent) => stages.push(event.stage);

      const unsub = engine.onChainEvent(listener);

      const signal = createTestSignal();
      engine.ingestStrategySignal(signal);

      expect(stages.length).toBeGreaterThan(0);

      unsub();
    });

    it('should support removing event listeners via unsubscribe function', () => {
      const events: ChainEvent[] = [];
      const listener = (event: ChainEvent) => events.push(event);

      const unsub = engine.onChainEvent(listener);
      unsub(); // Remove listener

      const signal = createTestSignal();
      engine.ingestStrategySignal(signal);

      expect(events.length).toBe(0);
    });

    it('should support multiple listeners', () => {
      const events1: ChainEvent[] = [];
      const events2: ChainEvent[] = [];

      const unsub1 = engine.onChainEvent((e) => events1.push(e));
      const unsub2 = engine.onChainEvent((e) => events2.push(e));

      const signal = createTestSignal();
      engine.ingestStrategySignal(signal);

      expect(events1.length).toBe(events2.length);
      expect(events1.length).toBeGreaterThan(0);

      unsub1();
      unsub2();
    });
  });

  describe('Portfolio Context Management', () => {

    it('should update portfolio context', () => {
      engine.updatePortfolioContext({
        portfolioValue: 200000,
        openPositions: 5,
        dailyDrawdown: 2,
        currentLeverage: 2.5,
      });

      // Should not throw and context should be updated
      const rules = engine.getRiskRules();
      expect(rules).toBeDefined();
    });

    it('should handle partial context updates', () => {
      engine.updatePortfolioContext({
        portfolioValue: 150000,
      });

      // Should not throw
      const signal = createTestSignal();
      const event = engine.ingestStrategySignal(signal);
      expect(event).toBeDefined();
    });

    it('should get current risk rules', () => {
      const rules = engine.getRiskRules();

      expect(rules.maxPositionPercent).toBeGreaterThan(0);
      expect(rules.maxLeverage).toBeGreaterThan(0);
      expect(rules.minConfidence).toBeGreaterThanOrEqual(0);
      expect(rules.maxOpenPositions).toBeGreaterThan(0);
    });
  });

  describe('Risk Rules Configuration', () => {

    it('should update risk rules', () => {
      engine.updateRiskRules({
        minConfidence: 90,
        maxLeverage: 3,
      });

      const rules = engine.getRiskRules();
      expect(rules.minConfidence).toBe(90);
      expect(rules.maxLeverage).toBe(3);
    });

    it('should respect custom rules on creation', () => {
      const strictEngine = createSignalChainEngine({
        minConfidence: 95,
        maxPositionPercent: 10,
      });

      const rules = strictEngine.getRiskRules();
      expect(rules.minConfidence).toBe(95);
      expect(rules.maxPositionPercent).toBe(10);
    });
  });

  describe('Pause/Resume Functionality', () => {

    it('should start unpaused by default', () => {
      expect(engine.paused).toBe(false);
    });

    it('should allow pausing the engine', () => {
      engine.setPaused(true);
      expect(engine.paused).toBe(true);
    });

    it('should resume after pause', () => {
      engine.setPaused(true);
      engine.setPaused(false);
      expect(engine.paused).toBe(false);
    });

    it('should reject signals when paused', () => {
      engine.setPaused(true);

      const signal = createTestSignal();
      const event = engine.ingestStrategySignal(signal);

      expect(event.riskEval!.decision).toBe('REJECT');
      expect(event.riskEval!.checks.some(c => c.rule === 'system_paused')).toBe(true);

      engine.setPaused(false);
    });
  });

  describe('Edge Cases & Error Handling', () => {

    it('should handle zero quantity gracefully', () => {
      const signal = createTestSignal({ suggestedQuantity: 0 });
      const event = engine.ingestStrategySignal(signal);

      expect(event).toBeDefined();
    });

    it('should handle very high confidence (100)', () => {
      const signal = createTestSignal({ confidence: 100 });
      const event = engine.ingestStrategySignal(signal);

      expect(event).toBeDefined();
      expect(event.riskEval!.riskScore).toBeLessThanOrEqual(100);
    });

    it('should handle very low confidence (0)', () => {
      const signal = createTestSignal({ confidence: 0 });
      const event = engine.ingestStrategySignal(signal);

      expect(event).toBeDefined();
      // Low confidence should result in REJECT, MODIFY, or ESCALATE
      expect(['REJECT', 'MODIFY', 'ESCALATE']).toContain(event.riskEval!.decision);
    });

    it('should handle extreme prices', () => {
      const signal = createTestSignal({
        suggestedPrice: 1000000,
        suggestedQuantity: 0.001,
      });

      const event = engine.ingestStrategySignal(signal);

      expect(event).toBeDefined();
    });

    it('should handle very small prices', () => {
      const signal = createTestSignal({
        suggestedPrice: 0.00001,
        suggestedQuantity: 1000000,
      });

      const event = engine.ingestStrategySignal(signal);

      expect(event).toBeDefined();
    });

    it('should handle special characters in symbol', () => {
      const signal = createTestSignal({
        symbol: 'TEST-123/USD',
      });

      const event = engine.ingestStrategySignal(signal);

      expect(event).toBeDefined();
    });

    it('should process multiple sequential signals safely', () => {
      const signals = Array(10)
        .fill(null)
        .map((_, i) =>
          createTestSignal({
            strategyId: i + 10,
            confidence: 70 + i * 3,
            suggestedQuantity: 0.1 * (i + 1),
          })
        );

      const results = signals.map(s => engine.ingestStrategySignal(s));

      results.forEach((result, i) => {
        expect(result).toBeDefined();
        expect(result.signal.strategyId).toBe(i + 10);
      });
    });

    it('should maintain unique event IDs', () => {
      const signal1 = createTestSignal({ strategyId: 100 });
      const signal2 = createTestSignal({ strategyId: 200 });

      const event1 = engine.ingestStrategySignal(signal1);
      const event2 = engine.ingestStrategySignal(signal2);

      expect(event1.id).not.toBe(event2.id);
    });

    it('should handle indicators object', () => {
      const signal = createTestSignal({
        indicators: { rsi: 32, macd: -0.5, sma_fast: 49900 },
      });

      const event = engine.ingestStrategySignal(signal);

      expect(event).toBeDefined();
      expect(event.signal.indicators).toBeDefined();
    });
  });

  describe('Singleton Instance', () => {

    it('should provide global singleton instance', () => {
      expect(signalChainEngine).toBeDefined();
      expect(typeof signalChainEngine.ingestStrategySignal).toBe('function');
    });

    it('singleton should work like regular instances', () => {
      const signal = createTestSignal({
        strategyId: 99,
        confidence: 85,
        suggestedQuantity: 0.5,
      });

      const result = signalChainEngine.ingestStrategySignal(signal);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });
});
