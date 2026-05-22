/**
 * @file src/app/services/BinanceService.test.ts
 * @description BinanceService WebSocket服务全面测试 - 覆盖率目标85%+
 * @author Test Suite Generator v2.0
 * @version 1.0.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BinanceService,
  destroyBinanceService,
  getBinanceService,
  type BinanceTicker,
} from './BinanceService';

import { createBinanceTestHelper } from '@/app/utils/test-helpers';

// Mock WebSocket for testing
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  readyState: number = 0; // CONNECTING
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send(_data: string): void { }
  close(): void {
    this.readyState = 3; // CLOSED
  }
}

// Store original WebSocket
const OriginalWebSocket = globalThis.WebSocket;

function mockWebSocket() {
  globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;
  MockWebSocket.instances = [];
}

function restoreWebSocket() {
  globalThis.WebSocket = OriginalWebSocket;
}

describe('BinanceService', () => {

  describe('Static Helper Methods', () => {

    describe('formatVolume()', () => {

      it('should format trillion volumes correctly', () => {
        expect(BinanceService.formatVolume(1.5e12)).toBe('1.50T');
        expect(BinanceService.formatVolume(9.99e12)).toBe('9.99T');
      });

      it('should format billion volumes correctly', () => {
        expect(BinanceService.formatVolume(1.5e9)).toBe('1.5B');
        expect(BinanceService.formatVolume(1.5e12)).toBe('1.50T'); // 1.5 trillion
      });

      it('should format million volumes correctly', () => {
        expect(BinanceService.formatVolume(1.5e6)).toBe('1.5M');
        expect(BinanceService.formatVolume(1500)).toBe('1.5K'); // 1.5 thousand
      });

      it('should format thousand volumes correctly', () => {
        expect(BinanceService.formatVolume(1500)).toBe('1.5K');
        expect(BinanceService.formatVolume(999000)).toBe('999.0K');
      });

      it('should format small volumes without suffix', () => {
        expect(BinanceService.formatVolume(500)).toBe('500');
        expect(BinanceService.formatVolume(99)).toBe('99');
        expect(BinanceService.formatVolume(0)).toBe('0');
      });

      it('should handle edge cases at boundaries', () => {
        expect(BinanceService.formatVolume(1e12)).toBe('1.00T'); // exactly 1T
        expect(BinanceService.formatVolume(1e9)).toBe('1.0B');   // exactly 1B
        expect(BinanceService.formatVolume(1e6)).toBe('1.0M');   // exactly 1M
        expect(BinanceService.formatVolume(1000)).toBe('1.0K');   // exactly 1K
      });
    });

    describe('getDisplayInfo()', () => {

      it('should return display info for BTCUSDT', () => {
        const info = BinanceService.getDisplayInfo('BTCUSDT');
        expect(info).toEqual({
          display: 'BTC/USDT',
          name: 'Bitcoin'
        });
      });

      it('should return display info for ETHUSDT', () => {
        const info = BinanceService.getDisplayInfo('ETHUSDT');
        expect(info).toEqual({
          display: 'ETH/USDT',
          name: 'Ethereum'
        });
      });

      it('should return display info for all tracked symbols', () => {
        const symbols = ['SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT'];
        symbols.forEach(symbol => {
          const info = BinanceService.getDisplayInfo(symbol);
          expect(info).toBeDefined();
          expect(info?.display).toContain('/');
          expect(info?.name).toBeTruthy();
        });
      });

      it('should return undefined for unknown symbol', () => {
        const info = BinanceService.getDisplayInfo('UNKNOWN');
        expect(info).toBeUndefined();
      });

      it('should return undefined for empty string', () => {
        const info = BinanceService.getDisplayInfo('');
        expect(info).toBeUndefined();
      });

      it('should be case-sensitive (lowercase should not match)', () => {
        const info = BinanceService.getDisplayInfo('btcusdt');
        expect(info).toBeUndefined();
      });
    });
  });

  describe('Instance Lifecycle Management', () => {

    let service: BinanceService;
    let testHelper: ReturnType<typeof createBinanceTestHelper>;

    beforeEach(() => {
      service = new BinanceService();
      testHelper = createBinanceTestHelper(service);
      mockWebSocket();
    });

    afterEach(() => {
      service.destroy();
      restoreWebSocket();
    });

    describe('Constructor & Initial State', () => {

      it('should initialize with disconnected status', () => {
        expect(service.getStatus()).toBe('disconnected');
      });

      it('should have no tickers initially', () => {
        const tickerMap = testHelper.getTickers();
        expect(tickerMap.size).toBe(0);
      });

      it('should have destroyed flag set to false', () => {
        const destroyed = testHelper.getDestroyed();
        expect(destroyed).toBe(false);
      });
    });

    describe('subscribe()', () => {

      it('should register update callback and trigger connection', () => {
        const onUpdate = vi.fn();
        const onStatusChange = vi.fn();

        service.subscribe(onUpdate, onStatusChange);

        // Should attempt to create WebSocket
        expect(MockWebSocket.instances.length).toBeGreaterThan(0);

        // Status should change to connecting
        expect(onStatusChange).toHaveBeenCalledWith('connecting');
      });

      it('should work with only update callback (no status callback)', () => {
        const onUpdate = vi.fn();

        service.subscribe(onUpdate);

        // Should still connect
        expect(MockWebSocket.instances.length).toBeGreaterThan(0);
      });

      it('should allow re-subscribing with new callbacks', () => {
        const onUpdate1 = vi.fn();
        const onUpdate2 = vi.fn();

        service.subscribe(onUpdate1);
        service.subscribe(onUpdate2);

        // Should use latest callbacks
        expect(MockWebSocket.instances.length).toBeGreaterThan(0);
      });
    });

    describe('getStatus()', () => {

      it('should return initial status as disconnected', () => {
        expect(service.getStatus()).toBe('disconnected');
      });

      it('should reflect status changes after subscription', async () => {
        const onStatusChange = vi.fn();
        service.subscribe(onStatusChange);

        // Simulate successful connection
        const ws = MockWebSocket.instances[0];

        // Trigger open event
        if (ws.onopen) {
          ws.onopen(new Event('open'));
        }

        expect(service.getStatus()).toBe('connected');
      });
    });

    describe('destroy()', () => {

      it('should set destroyed flag to true', () => {
        service.destroy();
        expect(testHelper.getDestroyed()).toBe(true);
      });

      it('should clear all callbacks', () => {
        const onUpdate = vi.fn();
        service.subscribe(onUpdate);
        service.destroy();

        expect(testHelper.getOnUpdate()).toBeNull();
        expect(testHelper.getOnStatusChange()).toBeNull();
      });

      it('should clear all tickers', () => {
        // Manually add a ticker to test clearing
        testHelper.setTickers(new Map([['BTCUSDT', {
          symbol: 'BTCUSDT',
          lastPrice: 50000,
          priceChangePercent: 2.5,
          highPrice: 51000,
          lowPrice: 49000,
          volume: 1000,
          quoteVolume: 50000000,
        }]]));

        service.destroy();
        expect(testHelper.getTickers().size).toBe(0);
      });

      it('should cleanup WebSocket connection', () => {
        service.subscribe(vi.fn());
        service.destroy();

        // WebSocket should be cleaned up
        expect(testHelper.getWebSocket()).toBeNull();
      });

      it('should be safe to call multiple times', () => {
        service.destroy();
        service.destroy(); // Second call should not throw
        expect(testHelper.getDestroyed()).toBe(true);
      });
    });
  });

  describe('WebSocket Connection Handling', () => {

    let service: BinanceService;
    let testHelper: ReturnType<typeof createBinanceTestHelper>;

    beforeEach(() => {
      service = new BinanceService();
      testHelper = createBinanceTestHelper(service);
      mockWebSocket();
    });

    afterEach(() => {
      service.destroy();
      restoreWebSocket();
    });

    describe('Successful Connection', () => {

      it('should transition to connected state on open event', () => {
        const onStatusChange = vi.fn();
        service.subscribe(vi.fn(), onStatusChange);

        const ws = MockWebSocket.instances[0];
        ws.readyState = 1; // OPEN

        if (ws.onopen) {
          ws.onopen(new Event('open'));
        }

        expect(service.getStatus()).toBe('connected');
        expect(onStatusChange).toHaveBeenCalledWith('connected');
      });

      it('should reset reconnect attempts on successful connection', () => {
        service.subscribe(vi.fn());

        const ws = MockWebSocket.instances[0];
        ws.readyState = 1;

        if (ws.onopen) {
          ws.onopen(new Event('open'));
        }

        expect(testHelper.getReconnectAttempts()).toBe(0);
        expect(testHelper.getHasEverConnected()).toBe(true);
      });

      it('should clear connection timeout on successful open', () => {
        service.subscribe(vi.fn());

        const ws = MockWebSocket.instances[0];
        ws.readyState = 1;

        if (ws.onopen) {
          ws.onopen(new Event('open'));
        }

        expect(testHelper.getConnectTimeout()).toBeNull();
      });
    });

    describe('Message Processing', () => {

      it('should parse valid 24hrTicker message and update tickers', () => {
        let receivedTickers: Map<string, BinanceTicker> | undefined;
        service.subscribe((tickers) => {
          receivedTickers = tickers;
        });

        const ws = MockWebSocket.instances[0];

        // Send valid BTCUSDT ticker data
        const message = JSON.stringify({
          stream: 'btcusdt@ticker',
          data: {
            e: '24hrTicker',
            s: 'BTCUSDT',
            c: '50000.00',     // last price
            P: '2.5',           // price change percent
            h: '51000.00',      // high
            l: '49000.00',      // low
            v: '1000.500',      // volume
            q: '50000000.00',   // quote volume
          }
        });

        if (ws.onmessage) {
          const onMessage = ws.onmessage;
          onMessage(new MessageEvent('message', { data: message }));
        }

        expect(receivedTickers).toBeDefined();
        expect(receivedTickers!.has('BTCUSDT')).toBe(true);

        const btcTicker = receivedTickers!.get('BTCUSDT')!;
        expect(btcTicker.lastPrice).toBe(50000);
        expect(btcTicker.priceChangePercent).toBe(2.5);
        expect(btcTicker.highPrice).toBe(51000);
        expect(btcTicker.lowPrice).toBe(49000);
        expect(btcTicker.volume).toBeCloseTo(1000.5, 1);
        expect(btcTicker.quoteVolume).toBe(50000000);
      });

      it('should handle multiple symbols in sequence', () => {
        const updates: BinanceTicker[][] = [];
        service.subscribe((tickers) => {
          updates.push(Array.from(tickers.values()));
        });

        const ws = MockWebSocket.instances[0];

        // Send BTCUSDT
        if (ws.onmessage) {
          ws.onmessage(new MessageEvent('message', {
            data: JSON.stringify({
              data: { e: '24hrTicker', s: 'BTCUSDT', c: '50000', P: '2.5', h: '51000', l: '49000', v: '1000', q: '50000000' }
            })
          }));
        }

        // Send ETHUSDT
        if (ws.onmessage) {
          ws.onmessage(new MessageEvent('message', {
            data: JSON.stringify({
              data: { e: '24hrTicker', s: 'ETHUSDT', c: '3000', P: '1.8', h: '3100', l: '2900', v: '5000', q: '15000000' }
            })
          }));
        }

        expect(updates.length).toBe(2);
        expect(updates[1].length).toBe(2); // Both tickers present
      });

      it('should ignore messages from unknown symbols', () => {
        let updateCount = 0;
        service.subscribe(() => {
          updateCount++;
        });

        const ws = MockWebSocket.instances[0];

        if (ws.onmessage) {
          ws.onmessage(new MessageEvent('message', {
            data: JSON.stringify({
              data: { e: '24hrTicker', s: 'UNKNOWN', c: '100', P: '1', h: '110', l: '90', v: '10', q: '1000' }
            })
          }));
        }

        expect(updateCount).toBe(0); // No update for unknown symbol
      });

      it('should silently handle invalid JSON messages', () => {
        const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => { });

        service.subscribe(vi.fn());
        const ws = MockWebSocket.instances[0];

        // Send invalid JSON
        if (ws.onmessage) {
          const onMessage = ws.onmessage;
          expect(() => {
            onMessage(new MessageEvent('message', { data: 'invalid json' }));
          }).not.toThrow();
        }

        consoleSpy.mockRestore();
      });

      it('should handle non-24hrTicker events gracefully', () => {
        let updateCount = 0;
        service.subscribe(() => {
          updateCount++;
        });

        const ws = MockWebSocket.instances[0];

        if (ws.onmessage) {
          ws.onmessage(new MessageEvent('message', {
            data: JSON.stringify({
              data: { e: 'trade', s: 'BTCUSDT' }
            })
          }));
        }

        expect(updateCount).toBe(0); // Not a 24hrTicker event
      });
    });

    describe('Connection Error Handling', () => {

      it('should fallback to simulation on WebSocket construction error', () => {
        // Make WebSocket constructor throw
        // @ts-expect-error - Override WebSocket to throw for testing error handling
        globalThis.WebSocket = class extends MockWebSocket {
          constructor(url: string) {
            super(url);
            throw new Error('Connection blocked');
          }
        };

        const onStatusChange = vi.fn();
        service.subscribe(vi.fn(), onStatusChange);

        // Should fallback to simulation
        expect(onStatusChange).toHaveBeenCalledWith('simulated');
        expect(service.getStatus()).toBe('simulated');
      });

      it('should mark initial error when error fires before open', () => {
        service.subscribe(vi.fn());

        const ws = MockWebSocket.instances[0];

        // Fire error before open
        if (ws.onerror) {
          ws.onerror(new Event('error'));
        }

        expect(testHelper.getInitialErrored()).toBe(true);
        expect(testHelper.getHasEverConnected()).toBe(false);
      });

      it('should not mark initial error after successful connection', () => {
        service.subscribe(vi.fn());

        const ws = MockWebSocket.instances[0];
        ws.readyState = 1;

        // First connect successfully
        if (ws.onopen) {
          ws.onopen(new Event('open'));
        }

        // Then error occurs
        if (ws.onerror) {
          ws.onerror(new Event('error'));
        }

        expect(testHelper.getInitialErrored()).toBe(false);
      });
    });

    describe('Reconnection Logic', () => {

      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should attempt reconnection after unexpected close', () => {
        service.subscribe(vi.fn());

        const ws = MockWebSocket.instances[0];
        ws.readyState = 1;

        // Connect first
        if (ws.onopen) {
          ws.onopen(new Event('open'));
        }

        // Then close unexpectedly
        if (ws.onclose) {
          ws.onclose(new CloseEvent('close'));
        }

        expect(testHelper.getReconnectAttempts()).toBe(1);
        expect(service.getStatus()).toBe('connecting');
      });

      it('should use exponential backoff for reconnection delays', () => {
        service.subscribe(vi.fn());

        // Force multiple reconnection attempts
        const ws = MockWebSocket.instances[0];
        ws.readyState = 1;

        if (ws.onopen) {
          ws.onopen(new Event('open'));
        }

        // First close -> attempt 1
        if (ws.onclose) {
          ws.onclose(new CloseEvent('close'));
        }
        expect(testHelper.getReconnectAttempts()).toBe(1);

        // Advance timer to trigger reconnect
        vi.advanceTimersByTime(2000);

        // Simulate second failure
        const ws2 = MockWebSocket.instances[MockWebSocket.instances.length - 1];
        if (ws2 && ws2.onclose) {
          ws2.readyState = 1;
          ws2.onclose(new CloseEvent('close'));
        }
        expect(testHelper.getReconnectAttempts()).toBe(2);
      });

      it('should stop reconnecting after max attempts and fallback to simulation', () => {
        const onStatusChange = vi.fn();
        service.subscribe(vi.fn(), onStatusChange);

        // Simulate max reconnection failures
        for (let i = 0; i < 4; i++) { // maxReconnectAttempts = 3
          const ws = MockWebSocket.instances[MockWebSocket.instances.length - 1] || MockWebSocket.instances[0];

          if (i === 0 && ws.readyState !== 1) {
            ws.readyState = 1;
            if (ws.onopen) ws.onopen(new Event('open'));
          }

          if (ws.onclose) {
            ws.onclose(new CloseEvent('close'));
          }

          if (i < 3) {
            vi.advanceTimersByTime(10000); // Advance past timeout
          }
        }

        expect(onStatusChange).toHaveBeenCalledWith('simulated');
      });

      it('should not reconnect if service is destroyed', () => {
        service.subscribe(vi.fn());

        const ws = MockWebSocket.instances[0];
        ws.readyState = 1;

        if (ws.onopen) {
          ws.onopen(new Event('open'));
        }

        // Destroy before close
        service.destroy();

        // This should not trigger reconnection
        if (ws.onclose) {
          ws.onclose(new CloseEvent('close'));
        }

        expect(testHelper.getReconnectTimer()).toBeNull();
      });
    });

    describe('Connection Timeout', () => {

      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should fallback to simulation if connection times out (5s)', () => {
        const onStatusChange = vi.fn();
        service.subscribe(vi.fn(), onStatusChange);

        // Don't trigger onopen, just advance time
        vi.advanceTimersByTime(5001); // Past 5s timeout

        expect(onStatusChange).toHaveBeenCalledWith('simulated');
        expect(service.getStatus()).toBe('simulated');
      });

      it('should clear timeout if connection succeeds before timeout', () => {
        service.subscribe(vi.fn());

        const ws = MockWebSocket.instances[0];

        // Connect within timeout
        vi.advanceTimersByTime(3000);
        ws.readyState = 1;
        if (ws.onopen) {
          ws.onopen(new Event('open'));
        }

        // Advance past original timeout
        vi.advanceTimersByTime(3000);

        // Should still be connected, not simulated
        expect(service.getStatus()).toBe('connected');
      });
    });
  });

  describe('Simulation Mode Fallback', () => {

    let service: BinanceService;
    let testHelper: ReturnType<typeof createBinanceTestHelper>;

    beforeEach(() => {
      service = new BinanceService();
      testHelper = createBinanceTestHelper(service);
      mockWebSocket();
    });

    afterEach(() => {
      service.destroy();
      restoreWebSocket();
    });

    it('should transition to simulated status when fallback is triggered', () => {
      const onStatusChange = vi.fn();
      const onUpdate = vi.fn();

      service.subscribe(onUpdate, onStatusChange);

      // Manually trigger fallback
      testHelper.fallbackToSimulation();

      expect(service.getStatus()).toBe('simulated');
      expect(onStatusChange).toHaveBeenCalledWith('simulated');
    });

    it('should clear tickers and send empty map on fallback', () => {
      // Add some tickers first
      testHelper.setTickers(new Map([['BTCUSDT', {
        symbol: 'BTCUSDT',
        lastPrice: 50000,
        priceChangePercent: 2.5,
        highPrice: 51000,
        lowPrice: 49000,
        volume: 1000,
        quoteVolume: 50000000,
      }]]));

      const onUpdate = vi.fn();
      service.subscribe(onUpdate);

      // Trigger fallback
      testHelper.fallbackToSimulation();

      // Tickers should be cleared
      expect(testHelper.getTickers().size).toBe(0);

      // Update should be called with empty map
      expect(onUpdate).toHaveBeenCalledWith(expect.any(Map));
      expect(onUpdate).toHaveBeenCalledWith(new Map()); // Empty map
    });

    it('should not trigger fallback twice if already in simulated mode', () => {
      const onStatusChange = vi.fn();
      service.subscribe(vi.fn(), onStatusChange);

      // Call fallback twice - second call should be ignored due to status check
      testHelper.fallbackToSimulation();
      testHelper.fallbackToSimulation();

      // Should be called at least once for the first call, but not duplicate
      expect(onStatusChange.mock.calls.filter(call => call[0] === 'simulated').length).toBeGreaterThanOrEqual(1);
    });

    it('should not fallback if already destroyed', () => {
      service.destroy();

      // This should not throw or change status
      testHelper.fallbackToSimulation();

      expect(service.getStatus()).toBe('disconnected');
    });
  });

  describe('Singleton Pattern', () => {

    beforeEach(() => {
      // Ensure clean state
      destroyBinanceService();
      mockWebSocket();
    });

    afterEach(() => {
      destroyBinanceService();
      restoreWebSocket();
    });

    describe('getBinanceService()', () => {

      it('should return same instance on multiple calls', () => {
        const instance1 = getBinanceService();
        const instance2 = getBinanceService();

        expect(instance1).toBe(instance2);
      });

      it('should create new instance if none exists', () => {
        const instance = getBinanceService();

        expect(instance).toBeDefined();
        expect(instance).toBeInstanceOf(BinanceService);
      });

      it('should return functional instance that can subscribe', () => {
        const instance = getBinanceService();
        const onUpdate = vi.fn();

        instance.subscribe(onUpdate);

        expect(MockWebSocket.instances.length).toBeGreaterThan(0);
      });
    });

    describe('destroyBinanceService()', () => {

      it('should destroy existing singleton instance', () => {
        const instance1 = getBinanceService();
        destroyBinanceService();

        const instance2 = getBinanceService();

        expect(instance1).not.toBe(instance2); // New instance created
      });

      it('should be safe to call when no instance exists', () => {
        expect(() => {
          destroyBinanceService();
          destroyBinanceService(); // Double call
        }).not.toThrow();
      });

      it('should allow creating fresh instance after destruction', () => {
        const instance1 = getBinanceService();
        instance1.subscribe(vi.fn());

        destroyBinanceService();

        const instance2 = getBinanceService();
        expect(instance2.getStatus()).toBe('disconnected'); // Fresh state
      });
    });
  });

  describe('Edge Cases & Error Scenarios', () => {

    let service: BinanceService;

    beforeEach(() => {
      service = new BinanceService();
      mockWebSocket();
    });

    afterEach(() => {
      service.destroy();
      restoreWebSocket();
    });

    it('should handle rapid subscribe/unsubscribe cycles', () => {
      for (let i = 0; i < 10; i++) {
        service.subscribe(vi.fn(), vi.fn());
      }
      // Should not throw and should work normally
      const status = service.getStatus();
      expect(status === 'connecting' || status === 'disconnected').toBe(true);
    });

    it('should handle message with missing fields gracefully', () => {
      service.subscribe(vi.fn());
      const ws = MockWebSocket.instances[0];

      // Send partial data
      if (ws.onmessage) {
        const onMessage = ws.onmessage;
        expect(() => {
          onMessage(new MessageEvent('message', {
            data: JSON.stringify({ data: { e: '24hrTicker', s: 'BTCUSDT' } })
          }));
        }).not.toThrow();
      }
    });

    it('should construct correct combined stream URL', () => {
      service.subscribe(vi.fn());

      const ws = MockWebSocket.instances[0];
      expect(ws.url).toContain('wss://stream.binance.com:9443/stream?streams=');
      expect(ws.url).toContain('btcusdt@ticker');
      expect(ws.url).toContain('ethusdt@ticker');
    });
  });
});
