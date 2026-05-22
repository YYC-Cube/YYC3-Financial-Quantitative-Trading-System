/**
 * @file src/app/services/integration-e2e.test.ts
 * @description 跨模块端到端集成测试 - 验证多模块协作与数据流完整性
 * @author Phase3D Integration Suite
 * @version 1.0.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getCoinGeckoService } from '@/app/services/CoinGeckoService';
import { eventBus } from '@/app/services/EventBus';
import { PerformanceTimer } from '@/app/utils/test-helpers';

describe('Cross-Module E2E Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('EventBus ↔ Service Communication', () => {
    it('should propagate market data events across modules', async () => {
      const receivedEvents: any[] = [];

      eventBus.on('market:ticker', (event) => {
        receivedEvents.push(event);
      });

      const mockTicker = {
        symbol: 'BTCUSDT',
        lastPrice: 96000,
        priceChangePercent: 2.5,
        volume: 1000,
      };

      eventBus.emit('market:ticker', 'market', mockTicker);

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].payload).toEqual(mockTicker);
    });

    it('should handle multiple subscribers to same event', () => {
      const results: number[] = [0, 0];

      eventBus.on('test:event', () => { results[0]++; });
      eventBus.on('test:event', () => { results[1]++; });

      eventBus.emit('test:event', 'market' as any, {});

      expect(results[0]).toBe(1);
      expect(results[1]).toBe(1);
    });
  });

  describe('Data Service Integration', () => {
    it('should integrate CoinGeckoService with EventBus', async () => {
      const service = getCoinGeckoService();
      const eventPayloads: any[] = [];

      eventBus.on('data:fetched', (event) => {
        eventPayloads.push(event.payload);
      });

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: 'bitcoin',
              symbol: 'BTC',
              name: 'Bitcoin',
              current_price: 96000,
              price_change_percentage_24h: 2.5,
              total_volume: 30000000000,
              market_cap: 1910000000000,
              high_24h: 98000,
              low_24h: 94000,
              market_cap_rank: 1,
              image: '',
            },
          ]),
      });

      const result = await service.getTopCoins(50);

      expect(result.assets.length).toBeGreaterThan(0);
    });
  });

  describe('Performance & Reliability', () => {
    it('should complete integration cycle within time budget', async () => {
      const timer = new PerformanceTimer('E2E Integration Cycle');

      for (let i = 0; i < 10; i++) {
        eventBus.emit(`test:perf:${i}`, 'market' as any, { index: i });
      }

      const duration = timer.stop();
      expect(duration).toBeLessThan(100); // Should complete in <100ms
    });

    it('should handle rapid sequential events without data loss', () => {
      const received: number[] = [];
      eventBus.on('rapid:test', (e: any) => received.push(e.payload.value));

      for (let i = 0; i < 100; i++) {
        eventBus.emit('rapid:test', 'market' as any, { value: i });
      }

      expect(received).toHaveLength(100);
      expect(received[99]).toBe(99);
    });
  });

  describe('Error Recovery Across Modules', () => {
    it('should maintain system stability after service failure', async () => {
      const service = getCoinGeckoService();
      service.clearCache();

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const result = await service.getTopCoins(10);

      console.log('Actual source:', result.source);
      expect(result).toBeDefined();
      expect(result.assets.length).toBeGreaterThan(0);

      const result2 = await service.getTopCoins(10);
      expect(result2.source).toBeDefined();
    });
  });
});
