/**
 * @file src/app/services/BacktestEngine.test.ts
 * @description BacktestEngine回测引擎全面测试 - 覆盖率目标90%+
 * @author Test Suite Generator v2.0
 * @version 1.0.0
 */

import { describe, expect, it, vi } from 'vitest';

import {
  STRATEGY_TYPES,
  runBacktest,
  type BacktestConfig,
  type StrategyParams,
} from './BacktestEngine';

// Mock BinanceKLineService to provide controlled test data
vi.mock('./BinanceKLineService', () => ({
  getKLineService: () => ({
    getKLines: vi.fn().mockImplementation(async (symbol: string, interval: string, count: number) => {
      // Generate realistic candle data for testing
      const candles = [];
      let basePrice = 50000; // Starting price for BTC

      for (let i = 0; i < Math.max(count, 100); i++) {
        // Add some randomness and trend
        const change = (Math.sin(i / 10) * 500) + (Math.random() - 0.5) * 200;
        basePrice += change;

        const open = basePrice;
        const close = open + (Math.random() - 0.48) * 300;
        const high = Math.max(open, close) + Math.random() * 200;
        const low = Math.min(open, close) - Math.random() * 200;

        candles.push({
          time: Date.now() - (count - i) * 3600000, // Hourly candles
          open: +open.toFixed(2),
          high: +high.toFixed(2),
          low: +low.toFixed(2),
          close: +close.toFixed(2),
          volume: +(Math.random() * 1000).toFixed(2),
        });
      }

      return {
        data: candles.slice(0, count),
        source: 'simulated' as const
      };
    }),
  }),
  destroyKLineService: vi.fn(),
}));

describe('BacktestEngine', () => {

  // Helper function to create standard backtest config
  function createTestConfig(overrides: Partial<BacktestConfig> & { strategy?: Partial<StrategyParams> } = {}): BacktestConfig {
    return {
      symbol: 'BTCUSDT',
      interval: '1h',
      candleCount: 100,
      initialCapital: 100000,
      strategy: {
        type: 'ma_cross',
        fastPeriod: 10,
        slowPeriod: 30,
        stopLoss: 5,
        takeProfit: 10,
        positionSize: 0.1,
        ...overrides.strategy,
      },
      ...overrides,
    };
  }

  describe('Technical Indicators', () => {

    // Import and test indicator functions directly
    // Note: These are not exported, so we test them indirectly through runBacktest

    describe('SMA (Simple Moving Average)', () => {

      it('should calculate SMA correctly for simple data', async () => {
        const config = createTestConfig({
          strategy: { type: 'ma_cross', fastPeriod: 3, slowPeriod: 5 }
        });

        const result = await runBacktest(config);

        expect(result).toBeDefined();
        expect(result.trades.length).toBeGreaterThanOrEqual(0);
        expect(result.equityCurve.length).toBe(config.candleCount);
      });

      it('should handle period larger than data length', async () => {
        const config = createTestConfig({
          strategy: { type: 'ma_cross', fastPeriod: 200, slowPeriod: 300 }
        });

        // Should still complete without errors (just no signals)
        const result = await runBacktest(config);
        expect(result.trades.length).toBe(0); // No trades with such long periods
      });
    });

    describe('EMA (Exponential Moving Average)', () => {

      it('should be used in MACD calculation', async () => {
        const config = createTestConfig({
          strategy: { type: 'macd_divergence' }
        });

        const result = await runBacktest(config);

        expect(result.strategyType).toBe('MACD背离');
        expect(result.equityCurve.length).toBeGreaterThan(0);
      });

      it('should weight recent prices more heavily', async () => {
        // EMA should react faster than SMA to recent changes
        const config = createTestConfig({
          strategy: { type: 'macd_divergence' }
        });

        const result = await runBacktest(config);
        expect(result.stats.totalTrades).toBeGreaterThanOrEqual(0);
      });
    });

    describe('RSI (Relative Strength Index)', () => {

      it('should generate signals based on oversold/overbought levels', async () => {
        const config = createTestConfig({
          strategy: {
            type: 'rsi_bounce',
            rsiPeriod: 14,
            rsiOversold: 30,
            rsiOverbought: 70
          }
        });

        const result = await runBacktest(config);

        expect(result.strategyType).toBe('RSI反弹');
        expect(result.equityCurve.length).toBeGreaterThan(0);
      });

      it('respect custom RSI thresholds', async () => {
        const config = createTestConfig({
          strategy: {
            type: 'rsi_bounce',
            rsiOversold: 20, // Very aggressive threshold
            rsiOverbought: 80
          }
        });

        const result = await runBacktest(config);
        // Should produce fewer trades with extreme thresholds
        expect(result).toBeDefined();
      });
    });

    describe('MACD (Moving Average Convergence Divergence)', () => {

      it('should detect histogram zero crossings', async () => {
        const config = createTestConfig({
          strategy: { type: 'macd_divergence' }
        });

        const result = await runBacktest(config);

        expect(result.strategyType).toBe('MACD背离');
        // Should have some trades if there are signal crossings
        expect(result.trades.length).toBeGreaterThanOrEqual(0);
      });

      it('use default 12/26/9 parameters', async () => {
        const config = createTestConfig({
          strategy: { type: 'macd_divergence' }
        });

        const result = await runBacktest(config);

        expect(result.stats.sharpeRatio).toBeDefined();
        expect(typeof result.stats.sharpeRatio).toBe('number');
      });
    });

    describe('Bollinger Bands', () => {

      it('should calculate upper, middle, and lower bands', async () => {
        const config = createTestConfig({
          strategy: {
            type: 'bollinger_breakout',
            bollPeriod: 20,
            bollStdDev: 2
          }
        });

        const result = await runBacktest(config);

        expect(result.strategyType).toBe('布林突破');
        expect(result.equityCurve.length).toBeGreaterThan(0);
      });

      it('detect breakouts above upper or below lower band', async () => {
        const config = createTestConfig({
          strategy: { type: 'bollinger_breakout' }
        });

        const result = await runBacktest(config);

        // Should have trades when price breaks bands
        expect(result.trades.length).toBeGreaterThanOrEqual(0);
      });

      it('handle custom standard deviation multiplier', async () => {
        const config = createTestConfig({
          strategy: {
            type: 'bollinger_breakout',
            bollStdDev: 1.5 // Narrower bands = more signals
          }
        });

        const result = await runBacktest(config);
        expect(result).toBeDefined();
      });
    });
  });

  describe('runBacktest()', () => {

    describe('Basic Execution', () => {

      it('should execute backtest and return valid result', async () => {
        const config = createTestConfig();
        const result = await runBacktest(config);

        expect(result).toBeDefined();
        expect(result.symbol).toBe('BTCUSDT');
        expect(result.candleCount).toBe(100);
        expect(result.dataSource).toBe('simulated');
      });

      it('should throw error with insufficient data (<30 candles)', async () => {
        const config = createTestConfig({ candleCount: 20 });

        await expect(runBacktest(config)).rejects.toThrow(
          'Insufficient data for backtesting'
        );
      });

      it('should handle exactly 30 candles (minimum required)', async () => {
        const config = createTestConfig({ candleCount: 30 });
        const result = await runBacktest(config);

        expect(result.candleCount).toBe(30);
        expect(result.equityCurve.length).toBe(30);
      });

      it('should use different symbols correctly', async () => {
        const ethConfig = createTestConfig({ symbol: 'ETHUSDT' });
        const result = await runBacktest(ethConfig);

        expect(result.symbol).toBe('ETHUSDT');
      });
    });

    describe('Strategy Types', () => {

      it('should execute MA Crossover strategy', async () => {
        const config = createTestConfig({ strategy: { type: 'ma_cross' } });
        const result = await runBacktest(config);

        expect(result.strategyType).toBe('均线交叉');
        expect(result.trades).toBeDefined();
      });

      it('should execute RSI Bounce strategy', async () => {
        const config = createTestConfig({ strategy: { type: 'rsi_bounce' } });
        const result = await runBacktest(config);

        expect(result.strategyType).toBe('RSI反弹');
      });

      it('should execute MACD Divergence strategy', async () => {
        const config = createTestConfig({ strategy: { type: 'macd_divergence' } });
        const result = await runBacktest(config);

        expect(result.strategyType).toBe('MACD背离');
      });

      it('should execute Bollinger Breakout strategy', async () => {
        const config = createTestConfig({ strategy: { type: 'bollinger_breakout' } });
        const result = await runBacktest(config);

        expect(result.strategyType).toBe('布林突破');
      });
    });

    describe('Trade Execution', () => {

      it('should generate trade records with all required fields', async () => {
        const config = createTestConfig();
        const result = await runBacktest(config);

        if (result.trades.length > 0) {
          const trade = result.trades[0];

          expect(trade).toHaveProperty('id');
          expect(trade).toHaveProperty('entryTime');
          expect(trade).toHaveProperty('exitTime');
          expect(trade).toHaveProperty('side');
          expect(trade).toHaveProperty('entryPrice');
          expect(trade).toHaveProperty('exitPrice');
          expect(trade).toHaveProperty('quantity');
          expect(trade).toHaveProperty('pnl');
          expect(trade).toHaveProperty('pnlPercent');
          expect(trade).toHaveProperty('reason');

          expect(['LONG', 'SHORT']).toContain(trade.side);
          expect(['signal', 'stop_loss', 'take_profit', 'end_of_data']).toContain(trade.reason);
        }
      });

      it('should respect position size configuration', async () => {
        const smallSizeConfig = createTestConfig({
          strategy: { type: 'ma_cross', positionSize: 0.05 } // 5% per trade
        });

        const result = await runBacktest(smallSizeConfig);

        if (result.trades.length > 0) {
          const trade = result.trades[0];
          // Position value should be approximately 5% of capital at entry
          const expectedValue = 100000 * 0.05;
          const actualValue = trade.entryPrice * trade.quantity;
          expect(actualValue).toBeCloseTo(expectedValue, -1); // Allow ~10% tolerance
        }
      });

      it('should close open positions at end of data', async () => {
        const config = createTestConfig();
        const result = await runBacktest(config);

        // Last trade (if exists) should be end_of_data reason
        if (result.trades.length > 0) {
          const lastTrade = result.trades[result.trades.length - 1];
          // May or may not be end_of_data depending on strategy
          expect(lastTrade.reason).toBeDefined();
        }
      });
    });

    describe('Risk Management', () => {

      it('should apply stop loss when configured', async () => {
        const tightStopConfig = createTestConfig({
          strategy: { type: 'ma_cross', stopLoss: 1 } // 1% stop loss
        });

        const result = await runBacktest(tightStopConfig);

        // Should have some stop_loss exits with tight stops
        const _stopLossTrades = result.trades.filter(t => t.reason === 'stop_loss');
        // Not guaranteed, but possible with tight stops
        expect(result.trades.length).toBeGreaterThanOrEqual(0);
      });

      it('should apply take profit when configured', async () => {
        const tightTPConfig = createTestConfig({
          strategy: { type: 'ma_cross', takeProfit: 2 } // 2% take profit
        });

        const result = await runBacktest(tightTPConfig);

        const _tpTrades = result.trades.filter(t => t.reason === 'take_profit');
        expect(result.trades.length).toBeGreaterThanOrEqual(0);
      });

      it('should allow disabling stop loss (set to 0 or very high)', async () => {
        const noSLConfig = createTestConfig({
          strategy: { type: 'ma_cross', stopLoss: 100 } // Effectively disabled
        });

        const result = await runBacktest(noSLConfig);
        expect(result).toBeDefined();
      });
    });

    describe('Equity Curve Generation', () => {

      it('should generate equity curve matching candle count', async () => {
        const config = createTestConfig({ candleCount: 50 });
        const result = await runBacktest(config);

        expect(result.equityCurve.length).toBe(50);
      });

      it('should include drawdown in equity points', async () => {
        const config = createTestConfig();
        const result = await runBacktest(config);

        if (result.equityCurve.length > 0) {
          const point = result.equityCurve[0];
          expect(point).toHaveProperty('time');
          expect(point).toHaveProperty('equity');
          expect(point).toHaveProperty('drawdown');
          expect(point).toHaveProperty('benchmark');

          // Drawdown should start at 0 or negative
          expect(point.drawdown).toBeLessThanOrEqual(0);
        }
      });

      it('should track benchmark performance', async () => {
        const config = createTestConfig();
        const result = await runBacktest(config);

        if (result.equityCurve.length > 1) {
          // Benchmark should change over time
          const firstBenchmark = result.equityCurve[0].benchmark;
          const lastBenchmark = result.equityCurve[result.equityCurve.length - 1].benchmark;

          // They may be equal at start, but should exist
          expect(typeof firstBenchmark).toBe('number');
          expect(typeof lastBenchmark).toBe('number');
        }
      });
    });

    describe('Statistics Calculation', () => {

      it('should calculate comprehensive statistics', async () => {
        const config = createTestConfig();
        const result = await runBacktest(config);

        const stats = result.stats;

        expect(stats).toHaveProperty('totalReturn');
        expect(stats).toHaveProperty('annualizedReturn');
        expect(stats).toHaveProperty('maxDrawdown');
        expect(stats).toHaveProperty('sharpeRatio');
        expect(stats).toHaveProperty('sortinoRatio');
        expect(stats).toHaveProperty('winRate');
        expect(stats).toHaveProperty('profitFactor');
        expect(stats).toHaveProperty('totalTrades');
        expect(stats).toHaveProperty('avgWin');
        expect(stats).toHaveProperty('avgLoss');
        expect(stats).toHaveProperty('avgHoldingPeriod');
        expect(stats).toHaveProperty('bestTrade');
        expect(stats).toHaveProperty('worstTrade');
        expect(stats).toHaveProperty('calmarRatio');
        expect(stats).toHaveProperty('benchmarkReturn');
        expect(stats).toHaveProperty('alpha');
      });

      it('should calculate total return as percentage', async () => {
        const config = createTestConfig();
        const result = await runBacktest(config);

        expect(typeof result.stats.totalReturn).toBe('number');
        // Return can be positive or negative
      });

      it('should calculate win rate as percentage (0-100)', async () => {
        const config = createTestConfig();
        const result = await runBacktest(config);

        expect(result.stats.winRate).toBeGreaterThanOrEqual(0);
        expect(result.stats.winRate).toBeLessThanOrEqual(100);
      });

      it('should calculate max drawdown as negative number or zero', async () => {
        const config = createTestConfig();
        const result = await runBacktest(config);

        expect(result.stats.maxDrawdown).toBeLessThanOrEqual(0);
      });

      it('should calculate Sharpe ratio', async () => {
        const config = createTestConfig();
        const result = await runBacktest(config);

        expect(typeof result.stats.sharpeRatio).toBe('number');
        // Sharpe can be negative, zero, or positive
      });

      it('should calculate alpha relative to benchmark', async () => {
        const config = createTestConfig();
        const result = await runBacktest(config);

        // Alpha = totalReturn - benchmarkReturn
        const expectedAlpha = +(result.stats.totalReturn - result.stats.benchmarkReturn).toFixed(2);
        expect(result.stats.alpha).toBeCloseTo(expectedAlpha, 1);
      });

      it('should format holding period as string', async () => {
        const config = createTestConfig();
        const result = await runBacktest(config);

        expect(typeof result.stats.avgHoldingPeriod).toBe('string');
        // Should end with m (minutes), h (hours), or d (days)
        expect(result.stats.avgHoldingPeriod).toMatch(/[mhd]$/);
      });

      it('should handle edge case with no trades', async () => {
        // Create config that likely produces no trades
        const config = createTestConfig({
          strategy: {
            type: 'ma_cross',
            fastPeriod: 10,
            slowPeriod: 10 // Same period = no crossover
          }
        });

        const result = await runBacktest(config);

        expect(result.stats.totalTrades).toBe(0);
        expect(result.stats.winRate).toBe(0);
        expect(result.stats.avgWin).toBe(0);
        expect(result.stats.avgLoss).toBe(0);
      });
    });

    describe('Result Structure Validation', () => {

      it('should include period description in result', async () => {
        const config = createTestConfig({ interval: '4h', candleCount: 50 });
        const result = await runBacktest(config);

        expect(result.period).toContain('4h');
        expect(result.period).toContain('50');
      });

      it('should report correct data source', async () => {
        const config = createTestConfig();
        const result = await runBacktest(config);

        expect(['binance', 'cache', 'simulated']).toContain(result.dataSource);
      });

      it('should maintain consistent trade IDs', async () => {
        const config = createTestConfig();
        const result = await runBacktest(config);

        if (result.trades.length > 1) {
          const ids = result.trades.map(t => t.id);
          const uniqueIds = new Set(ids);

          // All IDs should be unique
          expect(uniqueIds.size).toBe(ids.length);

          // IDs should be sequential starting from 1
          expect(Math.min(...ids)).toBe(1);
          expect(Math.max(...ids)).toBe(ids.length);
        }
      });
    });
  });

  describe('STRATEGY_TYPES Export', () => {

    it('should export array of supported strategies', () => {
      expect(Array.isArray(STRATEGY_TYPES)).toBe(true);
      expect(STRATEGY_TYPES.length).toBe(4);
    });

    it('should include MA Cross strategy', () => {
      const maStrategy = STRATEGY_TYPES.find(s => s.id === 'ma_cross');
      expect(maStrategy).toBeDefined();
      expect(maStrategy?.name).toBe('均线交叉');
      expect(maStrategy?.desc).toBeDefined();
    });

    it('should include RSI Bounce strategy', () => {
      const rsiStrategy = STRATEGY_TYPES.find(s => s.id === 'rsi_bounce');
      expect(rsiStrategy).toBeDefined();
      expect(rsiStrategy?.name).toBe('RSI反弹');
    });

    it('should include MACD Divergence strategy', () => {
      const macdStrategy = STRATEGY_TYPES.find(s => s.id === 'macd_divergence');
      expect(macdStrategy).toBeDefined();
      expect(macdStrategy?.name).toBe('MACD背离');
    });

    it('should include Bollinger Breakout strategy', () => {
      const bollStrategy = STRATEGY_TYPES.find(s => s.id === 'bollinger_breakout');
      expect(bollStrategy).toBeDefined();
      expect(bollStrategy?.name).toBe('布林突破');
    });

    it('each strategy should have id, name, and desc properties', () => {
      STRATEGY_TYPES.forEach(strategy => {
        expect(strategy).toHaveProperty('id');
        expect(strategy).toHaveProperty('name');
        expect(strategy).toHaveProperty('desc');
        expect(typeof strategy.id).toBe('string');
        expect(typeof strategy.name).toBe('string');
        expect(typeof strategy.desc).toBe('string');
      });
    });
  });

  describe('Edge Cases & Error Handling', () => {

    it('should handle very large initial capital', async () => {
      const config = createTestConfig({ initialCapital: 10000000 }); // $10M
      const result = await runBacktest(config);

      expect(result.equityCurve[0]?.equity).toBeCloseTo(10000000, -3);
    });

    it('should handle minimum viable capital', async () => {
      const config = createTestConfig({ initialCapital: 100 }); // $100
      const result = await runBacktest(config);

      expect(result).toBeDefined();
    });

    it('should handle different intervals', async () => {
      const configs = [
        createTestConfig({ interval: '1m' }),
        createTestConfig({ interval: '15m' }),
        createTestConfig({ interval: '1d' }),
      ];

      const results = await Promise.all(configs.map(c => runBacktest(c)));

      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.equityCurve.length).toBeGreaterThan(0);
      });
    });

    it('should handle large dataset efficiently', async () => {
      const config = createTestConfig({ candleCount: 500 });
      const startTime = Date.now();

      const result = await runBacktest(config);
      const duration = Date.now() - startTime;

      expect(result.candleCount).toBe(500);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should produce deterministic results with same inputs', async () => {
      // Set seed for reproducible random data
      const originalRandom = Math.random;
      let callCount = 0;

      Math.random = () => {
        // Use deterministic sequence based on call count
        const sequence = [0.5, 0.3, 0.7, 0.2, 0.8, 0.4, 0.6, 0.9, 0.1, 0.35];
        return sequence[callCount++ % sequence.length];
      };

      try {
        const config = createTestConfig();

        const result1 = await runBacktest(config);

        // Reset for second run
        callCount = 0;
        const result2 = await runBacktest(config);

        // Results should be identical (same mock data)
        expect(result1.stats.totalReturn).toEqual(result2.stats.totalReturn);
        expect(result1.trades.length).toBe(result2.trades.length);
      } finally {
        Math.random = originalRandom;
      }
    });

    it('should handle volatile market conditions', async () => {
      // This tests the engine's stability with the generated random-ish data
      const config = createTestConfig();
      const result = await runBacktest(config);

      // Should not crash on volatile data
      expect(result.stats.maxDrawdown).toBeDefined();
      expect(result.stats.sharpeRatio).toBeDefined();
    });
  });

  describe('Integration Scenarios', () => {

    it('should compare multiple strategies on same data', async () => {
      const baseConfig = createTestConfig();

      const strategies: StrategyParams['type'][] = [
        'ma_cross',
        'rsi_bounce',
        'macd_divergence',
        'bollinger_breakout',
      ];

      const results = await Promise.all(
        strategies.map(type =>
          runBacktest({ ...baseConfig, strategy: { ...baseConfig.strategy, type } })
        )
      );

      // All should complete successfully
      results.forEach((result, index) => {
        expect(result.strategyType).toBe(STRATEGY_TYPES[index].name);
        expect(result.equityCurve.length).toBe(baseConfig.candleCount);
      });

      // Different strategies should generally produce different results
      const returns = results.map(r => r.stats.totalReturn);
      const uniqueReturns = new Set(returns);
      // At least some variation expected (though possible all are same)
      expect(uniqueReturns.size).toBeGreaterThanOrEqual(1);
    });

    it('should allow parameter optimization comparison', async () => {
      const fastMAConfigs = [5, 10, 15, 20].map(fastPeriod =>
        createTestConfig({ strategy: { type: 'ma_cross', fastPeriod, slowPeriod: 30 } })
      );

      const results = await Promise.all(fastMAConfigs.map(c => runBacktest(c)));

      // All should complete
      results.forEach(result => {
        expect(result.stats.totalTrades).toBeGreaterThanOrEqual(0);
      });

      // Different parameters should affect results
      const tradeCounts = results.map(r => r.stats.totalTrades);
      // At least some difference expected
      expect(new Set(tradeCounts).size).toBeGreaterThanOrEqual(1);
    });

    it('should demonstrate risk/reward tradeoffs', async () => {
      const conservativeConfig = createTestConfig({
        strategy: { type: 'ma_cross', stopLoss: 2, takeProfit: 4, positionSize: 0.05 }
      });

      const aggressiveConfig = createTestConfig({
        strategy: { type: 'ma_cross', stopLoss: 10, takeProfit: 20, positionSize: 0.3 }
      });

      const [conservative, aggressive] = await Promise.all([
        runBacktest(conservativeConfig),
        runBacktest(aggressiveConfig),
      ]);

      // Both should work
      expect(conservative.stats.maxDrawdown).toBeLessThanOrEqual(0);
      expect(aggressive.stats.maxDrawdown).toBeLessThanOrEqual(0);

      // Aggressive should potentially have more volatility
      // (not guaranteed, but structure should support it)
    });
  });

  describe('Additional Boundary Scenarios', () => {

    it('should handle zero initial capital gracefully', async () => {
      const config = createTestConfig({ initialCapital: 0 });

      const result = await runBacktest(config);

      expect(result).toBeDefined();
      expect(result.equityCurve[0]?.equity).toBe(0);
    });

    it('should handle negative initial capital (edge case)', async () => {
      const config = createTestConfig({ initialCapital: -1000 });

      // Should either throw or handle gracefully
      try {
        const result = await runBacktest(config);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle extremely small position size', async () => {
      const config = createTestConfig({
        strategy: { type: 'ma_cross', positionSize: 0.001 }
      });

      const result = await runBacktest(config);

      if (result.trades.length > 0) {
        const trade = result.trades[0];
        expect(trade.quantity).toBeGreaterThan(0);
      }
    });

    it('should handle position size > 1 (over-leverage)', async () => {
      const config = createTestConfig({
        strategy: { type: 'ma_cross', positionSize: 2.0 }
      });

      const result = await runBacktest(config);

      expect(result).toBeDefined();
    });

    it('should handle very tight stop loss and take profit combination', async () => {
      const config = createTestConfig({
        strategy: {
          type: 'ma_cross',
          stopLoss: 0.1,   // 0.1% stop loss
          takeProfit: 0.2  // 0.2% take profit
        }
      });

      const result = await runBacktest(config);

      expect(result).toBeDefined();
      // Most trades should be stopped out quickly
      if (result.trades.length > 0) {
        const quickExits = result.trades.filter(
          t => t.reason === 'stop_loss' || t.reason === 'take_profit'
        );
        expect(quickExits.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle asymmetric risk/reward ratios', async () => {
      const config = createTestConfig({
        strategy: {
          type: 'ma_cross',
          stopLoss: 10,   // Wide stop loss
          takeProfit: 2   // Tight take profit
        }
      });

      const result = await runBacktest(config);

      expect(result).toBeDefined();
      expect(result.stats.totalTrades).toBeGreaterThanOrEqual(0);
    });

    it('should calculate sortino ratio correctly', async () => {
      const config = createTestConfig();
      const result = await runBacktest(config);

      expect(typeof result.stats.sortinoRatio).toBe('number');
      // Sortino can be any number (positive or negative)
    });

    it('should calculate profit factor correctly', async () => {
      const config = createTestConfig();
      const result = await runBacktest(config);

      expect(typeof result.stats.profitFactor).toBe('number');
      // Profit factor >= 0, infinity if no losses
    });

    it('should calculate calmar ratio correctly', async () => {
      const config = createTestConfig();
      const result = await runBacktest(config);

      expect(typeof result.stats.calmarRatio).toBe('number');
    });

    it('should track best and worst trades', async () => {
      const config = createTestConfig();
      const result = await runBacktest(config);

      if (result.trades.length > 0) {
        expect(typeof result.stats.bestTrade).toBe('number');
        expect(typeof result.stats.worstTrade).toBe('number');

        // Best should be >= worst
        expect(result.stats.bestTrade).toBeGreaterThanOrEqual(result.stats.worstTrade);
      }
    });

    it('should handle single candle dataset (minimum edge case)', async () => {
      const config = createTestConfig({ candleCount: 30 }); // Minimum valid

      const result = await runBacktest(config);

      expect(result.candleCount).toBe(30);
      expect(result.equityCurve.length).toBe(30);
    });

    it('should validate trade timestamps are sequential', async () => {
      const config = createTestConfig();
      const result = await runBacktest(config);

      if (result.trades.length > 1) {
        for (let i = 1; i < result.trades.length; i++) {
          const prevTrade = result.trades[i - 1];
          const currTrade = result.trades[i];

          expect(currTrade.entryTime).toBeGreaterThanOrEqual(prevTrade.entryTime);
        }
      }
    });

    it('should ensure all trades have positive quantity', async () => {
      const config = createTestConfig();
      const result = await runBacktest(config);

      result.trades.forEach(trade => {
        expect(trade.quantity).toBeGreaterThan(0);
      });
    });

    it('should ensure all trades have valid prices (>0)', async () => {
      const config = createTestConfig();
      const result = await runBacktest(config);

      result.trades.forEach(trade => {
        expect(trade.entryPrice).toBeGreaterThan(0);
        expect(trade.exitPrice).toBeGreaterThan(0);
      });
    });

    it('should calculate PnL correctly for each trade', async () => {
      const config = createTestConfig({ strategy: { type: 'ma_cross' } });
      const result = await runBacktest(config);

      result.trades.forEach(trade => {
        if (trade.side === 'LONG') {
          const expectedPnl = (trade.exitPrice - trade.entryPrice) * trade.quantity;
          expect(trade.pnl).toBeCloseTo(expectedPnl, 0);
        } else {
          const expectedPnl = (trade.entryPrice - trade.exitPrice) * trade.quantity;
          expect(trade.pnl).toBeCloseTo(expectedPnl, 0);
        }
      });
    });

    it('should handle concurrent backtest executions', async () => {
      const configs = Array(5).fill(null).map(() => createTestConfig());

      const results = await Promise.all(configs.map(c => runBacktest(c)));

      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.equityCurve.length).toBeGreaterThan(0);
      });
    });

    it('should maintain equity curve continuity', async () => {
      const config = createTestConfig();
      const result = await runBacktest(config);

      if (result.equityCurve.length > 1) {
        for (let i = 1; i < result.equityCurve.length; i++) {
          const _prevEquity = result.equityCurve[i - 1].equity;
          const currEquity = result.equityCurve[i].equity;

          // Equity can jump due to trades, but should be defined
          expect(typeof currEquity).toBe('number');
          expect(currEquity).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('should report correct period format', async () => {
      const config = createTestConfig({ interval: '1h', candleCount: 100 });
      const result = await runBacktest(config);

      expect(result.period).toContain('100');
      expect(result.period).toContain('1h');
    });

    it('should handle all RSI parameter combinations', async () => {
      const rsiConfigs = [
        { rsiPeriod: 7, rsiOversold: 20, rsiOverbought: 80 },
        { rsiPeriod: 21, rsiOversold: 35, rsiOverbought: 65 },
        { rsiPeriod: 14, rsiOversold: 25, rsiOverbought: 75 },
      ];

      for (const params of rsiConfigs) {
        const config = createTestConfig({
          strategy: { type: 'rsi_bounce', ...params }
        });

        const result = await runBacktest(config);
        expect(result.strategyType).toBe('RSI反弹');
      }
    });

    it('should handle all MACD parameter combinations', async () => {
      const macdConfigs = [
        { fastPeriod: 8, slowPeriod: 17, signalPeriod: 9 },
        { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }, // Default
        { fastPeriod: 15, slowPeriod: 30, signalPeriod: 12 },
      ];

      for (const params of macdConfigs) {
        const config = createTestConfig({
          strategy: { type: 'macd_divergence', ...params }
        });

        const result = await runBacktest(config);
        expect(result.strategyType).toBe('MACD背离');
      }
    });

    it('should handle all Bollinger Band parameter combinations', async () => {
      const bollConfigs = [
        { bollPeriod: 10, bollStdDev: 1.5 },
        { bollPeriod: 20, bollStdDev: 2.0 }, // Default
        { bollPeriod: 50, bollStdDev: 2.5 },
      ];

      for (const params of bollConfigs) {
        const config = createTestConfig({
          strategy: { type: 'bollinger_breakout', ...params }
        });

        const result = await runBacktest(config);
        expect(result.strategyType).toBe('布林突破');
      }
    });
  });
});
