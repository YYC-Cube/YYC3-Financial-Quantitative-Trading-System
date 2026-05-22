import { beforeEach, describe, expect, it, vi } from 'vitest';

import { eventBus, EventTypes } from '@/app/services/EventBus';

describe('EventBus', () => {
  beforeEach(() => {
    eventBus.clearHistory();
  });

  it('should emit and receive events', () => {
    const handler = vi.fn();
    eventBus.on('test:event', handler);

    const evt = eventBus.emit('test:event', 'market', { price: 50000 });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'test:event',
        source: 'market',
        payload: { price: 50000 },
      }),
    );
    expect(evt.id).toMatch(/^evt_/);
    expect(evt.timestamp).toBeGreaterThan(0);
  });

  it('should support wildcard handler', () => {
    const handler = vi.fn();
    eventBus.on('*', handler);

    eventBus.emit('any:type', 'strategy', { signal: 'BUY' });
    eventBus.emit('another:type', 'risk', { level: 'high' });

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('should unsubscribe via returned function', () => {
    const handler = vi.fn();
    const unsub = eventBus.on('test:unsub', handler);

    eventBus.emit('test:unsub', 'trade', {});
    expect(handler).toHaveBeenCalledTimes(1);

    unsub();
    eventBus.emit('test:unsub', 'trade', {});
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should handle once subscriptions', () => {
    const handler = vi.fn();
    eventBus.once('test:once', handler);

    eventBus.emit('test:once', 'model', {});
    eventBus.emit('test:once', 'model', {});

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should record event history', () => {
    eventBus.clearHistory();
    eventBus.emit('history:test', 'bigdata', { a: 1 });
    eventBus.emit('history:test', 'quantum', { b: 2 });

    const history = eventBus.getHistory('history:test');
    expect(history).toHaveLength(2);
    expect(history[0].source).toBe('bigdata');
    expect(history[1].source).toBe('quantum');
  });

  it('should filter history by source', () => {
    eventBus.clearHistory();
    eventBus.emit('filter:test', 'market', {});
    eventBus.emit('filter:test', 'strategy', {});

    const marketEvents = eventBus.getHistory('filter:test', 'market');
    expect(marketEvents).toHaveLength(1);
    expect(marketEvents[0].source).toBe('market');
  });

  it('should limit history to 200 events', () => {
    eventBus.clearHistory();
    for (let i = 0; i < 250; i++) {
      eventBus.emit('overflow:test', 'admin', { i });
    }
    const history = eventBus.getHistory('overflow:test');
    expect(history.length).toBeLessThanOrEqual(200);
  });

  it('should track handler count', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    const unsub1 = eventBus.on('count:test', h1);
    eventBus.on('count:test', h2);

    expect(eventBus.handlerCount('count:test')).toBe(2);
    unsub1();
    expect(eventBus.handlerCount('count:test')).toBe(1);
  });

  it('should not break when handler throws', () => {
    const badHandler = () => { throw new Error('oops'); };
    const goodHandler = vi.fn();

    eventBus.on('error:test', badHandler);
    eventBus.on('error:test', goodHandler);

    eventBus.emit('error:test', 'trade', {});
    expect(goodHandler).toHaveBeenCalled();
  });

  it('should have correct EventTypes constants', () => {
    expect(EventTypes.MARKET_TICK).toBe('market:tick');
    expect(EventTypes.SIGNAL_GENERATED).toBe('strategy:signal-generated');
    expect(EventTypes.RISK_SIGNAL).toBe('risk:signal');
    expect(EventTypes.TRADE_EXECUTED).toBe('trade:executed');
    expect(EventTypes.MODEL_PREDICTION).toBe('model:prediction');
    expect(Object.keys(EventTypes)).toHaveLength(13);
  });

  // 新增边界场景测试
  describe('boundary scenarios', () => {
    it('should handle target parameter correctly', () => {
      const handler = vi.fn();
      eventBus.on('target:test', handler);

      const evt = eventBus.emit('target:test', 'market', { data: 1 }, 'strategy');

      expect(evt.target).toBe('strategy');
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].target).toBe('strategy');
    });

    it('should default target to wildcard when not specified', () => {
      const handler = vi.fn();
      eventBus.on('default-target:test', handler);

      const evt = eventBus.emit('default-target:test', 'admin', {});

      expect(evt.target).toBe('*');
    });

    it('should generate unique IDs for each event', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const evt = eventBus.emit('unique-id:test', 'market', { i });
        ids.add(evt.id);
      }
      expect(ids.size).toBe(100); // All unique
    });

    it('should handle empty payload', () => {
      const handler = vi.fn();
      eventBus.on('empty-payload:test', handler);

      eventBus.emit('empty-payload:test', 'trade', null);

      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].payload).toBeNull();
    });

    it('should handle undefined payload', () => {
      const handler = vi.fn();
      eventBus.on('undefined-payload:test', handler);

      eventBus.emit('undefined-payload:test', 'model', undefined as any);

      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].payload).toBeUndefined();
    });

    it('should return total handler count when no type specified', () => {
      const baseCount = eventBus.handlerCount(); // Get current count

      eventBus.on('type-a:test', vi.fn());
      eventBus.on('type-a:test', vi.fn());
      eventBus.on('type-b:test', vi.fn());

      const totalCount = eventBus.handlerCount();
      expect(totalCount).toBe(baseCount + 3); // Previous + 3 new
    });

    it('should return 0 for non-existent event type count', () => {
      const count = eventBus.handlerCount('nonexistent:type');
      expect(count).toBe(0);
    });

    it('should allow multiple unsubscribe calls safely', () => {
      const handler = vi.fn();
      const unsub = eventBus.on('multi-unsub:test', handler);

      unsub(); // First unsubscribe
      unsub(); // Second unsubscribe (should be safe)

      eventBus.emit('multi-unsub:test', 'admin', {});
      expect(handler).not.toHaveBeenCalled(); // Still unsubscribed
    });

    it('should preserve event order in history', () => {
      eventBus.clearHistory();

      eventBus.emit('order:test', 'market', { seq: 1 });
      eventBus.emit('order:test', 'strategy', { seq: 2 });
      eventBus.emit('order:test', 'risk', { seq: 3 });

      const history = eventBus.getHistory('order:test');
      expect(history[0].payload).toEqual({ seq: 1 });
      expect(history[1].payload).toEqual({ seq: 2 });
      expect(history[2].payload).toEqual({ seq: 3 });
    });

    it('should return all events when getHistory called without filters', () => {
      eventBus.clearHistory();

      eventBus.emit('type-a', 'market', {});
      eventBus.emit('type-b', 'strategy', {});
      eventBus.emit('type-c', 'risk', {});

      const allEvents = eventBus.getHistory();
      expect(allEvents.length).toBe(3);
    });

    it('should handle rapid successive emits', () => {
      const handler = vi.fn();
      eventBus.on('rapid:test', handler);

      for (let i = 0; i < 1000; i++) {
        eventBus.emit('rapid:test', 'bigdata', { i });
      }

      expect(handler).toHaveBeenCalledTimes(1000);
    });

    it('should work with special characters in event type', () => {
      const handler = vi.fn();
      eventBus.on('special/event:type.with-dots', handler);

      eventBus.emit('special/event:type.with-dots', 'quantum', { data: 'test' });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle once subscription that throws on first call', () => {
      const throwingHandler = () => { throw new Error('First call error'); };
      const spyHandler = vi.fn();

      eventBus.once('throw-once:test', throwingHandler);
      eventBus.on('throw-once:test', spyHandler);

      eventBus.emit('throw-once:test', 'trade', {});
      eventBus.emit('throw-once:test', 'trade', {});

      expect(spyHandler).toHaveBeenCalledTimes(2); // Both emits reach spyHandler
    });

    it('should clear all handlers for specific type after multiple unsubs', () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      const h3 = vi.fn();

      const unsub1 = eventBus.on('clear-all:test', h1);
      const unsub2 = eventBus.on('clear-all:test', h2);
      const unsub3 = eventBus.on('clear-all:test', h3);

      unsub1();
      unsub2();
      unsub3();

      expect(eventBus.handlerCount('clear-all:test')).toBe(0);

      eventBus.emit('clear-all:test', 'admin', {});
      expect(h1).not.toHaveBeenCalled();
      expect(h2).not.toHaveBeenCalled();
      expect(h3).not.toHaveBeenCalled();
    });
  });
});
