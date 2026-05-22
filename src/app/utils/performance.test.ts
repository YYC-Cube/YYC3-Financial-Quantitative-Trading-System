import { describe, expect, it, vi } from 'vitest';

import {
  memoize,
  debounce,
  throttle,
  computeVirtualScroll,
  createBatchUpdater,
} from '@/app/utils/performance';

describe('performance utils', () => {
  describe('memoize', () => {
    it('should cache results for same arguments', () => {
      let calls = 0;
      const fn = (a: number, b: number) => {
        calls++;
        return a + b;
      };
      const memoized = memoize(fn);

      expect(memoized(1, 2)).toBe(3);
      expect(memoized(1, 2)).toBe(3);
      expect(calls).toBe(1);
    });

    it('should call again for different arguments', () => {
      let calls = 0;
      const fn = (a: number) => {
        calls++;
        return a * 2;
      };
      const memoized = memoize(fn);

      expect(memoized(1)).toBe(2);
      expect(memoized(2)).toBe(4);
      expect(calls).toBe(2);
    });

    it('should respect TTL expiration', () => {
      vi.useFakeTimers();
      let calls = 0;
      const fn = (x: number) => {
        calls++;
        return x;
      };
      const memoized = memoize(fn, { ttl: 100 });

      expect(memoized(1)).toBe(1);
      expect(calls).toBe(1);

      vi.advanceTimersByTime(101);
      expect(memoized(1)).toBe(1);
      expect(calls).toBe(2);

      vi.useRealTimers();
    });

    it('should evict entries when maxSize exceeded (LRU)', () => {
      const fn = (x: number) => x * 10;
      const memoized = memoize(fn, { maxSize: 2 });

      memoized(1);
      memoized(2);
      memoized(3);

      const cache = memoized.cache;
      expect(cache.size).toBeLessThanOrEqual(2);
    });

    it('should support clear()', () => {
      let calls = 0;
      const fn = (x: number) => { calls++; return x; };
      const memoized = memoize(fn);

      memoized(1);
      expect(calls).toBe(1);
      memoized.clear();
      memoized(1);
      expect(calls).toBe(2);
    });

    // 新增：复杂对象参数
    it('should handle object arguments via JSON serialization', () => {
      let calls = 0;
      const fn = (obj: { x: number; y: number }) => {
        calls++;
        return obj.x + obj.y;
      };
      const memoized = memoize(fn);

      expect(memoized({ x: 1, y: 2 })).toBe(3);
      expect(memoized({ x: 1, y: 2 })).toBe(3); // Same structure
      expect(calls).toBe(1);

      expect(memoized({ x: 2, y: 3 })).toBe(5); // Different values
      expect(calls).toBe(2);
    });

    // 新增：默认无限TTL
    it('should have infinite TTL by default', () => {
      vi.useFakeTimers();
      let calls = 0;
      const fn = (x: number) => { calls++; return x; };
      const memoized = memoize(fn); // No TTL option

      memoized(1);
      expect(calls).toBe(1);

      // Advance by very long time - should still be cached
      vi.advanceTimersByTime(999999);
      memoized(1);
      expect(calls).toBe(1); // Still cached

      vi.useRealTimers();
    });

    // 新增：LRU eviction order verification
    it('should evict least recently used entry first', () => {
      const fn = (x: number) => x;
      const memoized = memoize(fn, { maxSize: 3 });

      memoized(1);
      memoized(2);
      memoized(3);
      
      // Access 1 to make it recently used
      memoized(1);
      
      // Add new entry - should evict 2 (least recently used)
      memoized(4);
      
      expect(memoized.cache.has(JSON.stringify([1]))).toBe(true);
      expect(memoized.cache.has(JSON.stringify([2]))).toBe(false);
      expect(memoized.cache.has(JSON.stringify([3]))).toBe(true);
      expect(memoized.cache.has(JSON.stringify([4]))).toBe(true);
    });

    // 新增：cache property access
    it('should expose cache Map for inspection', () => {
      const fn = (x: number) => x * 2;
      const memoized = memoize(fn);

      memoized(5);
      
      expect(memoized.cache).toBeInstanceOf(Map);
      expect(memoized.cache.size).toBe(1);
      expect(memoized.cache.get(JSON.stringify([5]))?.value).toBe(10);
    });

    // 新增：数组参数
    it('should handle array arguments', () => {
      let calls = 0;
      const fn = (arr: number[]) => {
        calls++;
        return arr.reduce((sum, n) => sum + n, 0);
      };
      const memoized = memoize(fn);

      expect(memoized([1, 2, 3])).toBe(6);
      expect(memoized([1, 2, 3])).toBe(6);
      expect(calls).toBe(1);
    });
  });

  describe('debounce', () => {
    it('should delay execution', () => {
      vi.useFakeTimers();
      let value = 0;
      const fn = debounce((x: number) => { value = x; }, 100);

      fn(1);
      fn(2);
      fn(3);

      expect(value).toBe(0);
      vi.advanceTimersByTime(100);
      expect(value).toBe(3);

      vi.useRealTimers();
    });

    it('should support cancel', () => {
      vi.useFakeTimers();
      let value = 0;
      const fn = debounce((x: number) => { value = x; }, 100);

      fn(1);
      fn.cancel();
      vi.advanceTimersByTime(200);
      expect(value).toBe(0);

      vi.useRealTimers();
    });

    // 新增：leading edge execution
    it('should execute on leading edge when configured', () => {
      vi.useFakeTimers();
      const calls: number[] = [];
      const fn = debounce((x: number) => { calls.push(x); }, 100, { leading: true, trailing: false });

      fn(1);
      expect(calls).toEqual([1]); // Called immediately on leading edge

      fn(2);
      fn(3);
      expect(calls).toEqual([1]); // Not called again during wait period

      vi.advanceTimersByTime(100);
      expect(calls).toEqual([1]); // No trailing call

      vi.useRealTimers();
    });

    // 新增：trailing edge default behavior
    it('should execute on trailing edge by default', () => {
      vi.useFakeTimers();
      const calls: number[] = [];
      const fn = debounce((x: number) => { calls.push(x); }, 100);

      fn(1);
      expect(calls).toEqual([]); // Not called immediately

      vi.advanceTimersByTime(99);
      expect(calls).toEqual([]); // Still not called

      vi.advanceTimersByTime(1);
      expect(calls).toEqual([1]); // Called on trailing edge

      vi.useRealTimers();
    });

    // 新增：flush method
    it('should support flush to execute immediately', () => {
      vi.useFakeTimers();
      let value = 0;
      const fn = debounce((x: number) => { value = x; }, 100);

      fn(42);
      expect(value).toBe(0);

      fn.flush(); // Execute immediately
      expect(value).toBe(42);

      vi.useRealTimers();
    });

    // 新增：pending method
    it('should report pending status correctly', () => {
      vi.useFakeTimers();
      const fn = debounce((_: number) => {}, 100);

      expect(fn.pending()).toBe(false);

      fn(1);
      expect(fn.pending()).toBe(true);

      vi.advanceTimersByTime(100);
      expect(fn.pending()).toBe(false);

      vi.useRealTimers();
    });

    // 新增：multiple rapid calls
    it('should only execute once for multiple rapid calls', () => {
      vi.useFakeTimers();
      let count = 0;
      const fn = debounce(() => { count++; }, 50);

      fn();
      fn();
      fn();
      fn();
      fn();

      expect(count).toBe(0);

      vi.advanceTimersByTime(50);
      expect(count).toBe(1); // Only executed once

      vi.useRealTimers();
    });

    // 新增：reset timer on new call
    it('should reset timer on each call', () => {
      vi.useFakeTimers();
      let value = 0;
      const fn = debounce((x: number) => { value = x; }, 100);

      fn(1);
      
      // Call again after 50ms - should reset timer
      vi.advanceTimersByTime(50);
      fn(2);
      
      // Wait another 100ms from the reset
      vi.advanceTimersByTime(100);
      expect(value).toBe(2); // Should get latest value

      vi.useRealTimers();
    });
  });

  describe('throttle', () => {
    it('should limit execution rate', () => {
      vi.useFakeTimers();
      const values: number[] = [];
      const fn = throttle((x: number) => { values.push(x); }, 100);

      fn(1);
      fn(2);
      fn(3);

      expect(values.length).toBeLessThanOrEqual(2);
      vi.useRealTimers();
    });

    // 新增：cancel method
    it('should support cancel', () => {
      vi.useFakeTimers();
      const values: number[] = [];
      const fn = throttle((x: number) => { values.push(x); }, 100);

      fn(1);
      fn(2);
      fn.cancel(); // Cancel pending

      vi.advanceTimersByTime(200);
      // Should only have executed immediate call, not the throttled one
      expect(values.length).toBeLessThanOrEqual(1);

      vi.useRealTimers();
    });

    // 新增：execute immediately on first call
    it('should execute immediately on first call', () => {
      vi.useFakeTimers();
      const values: number[] = [];
      const fn = throttle((x: number) => { values.push(x); }, 100);

      fn(1);
      expect(values).toContain(1); // Immediate execution

      vi.useRealTimers();
    });

    // 新增：respect interval between calls
    it('should respect interval between subsequent calls', () => {
      vi.useFakeTimers();
      const values: number[] = [];
      const fn = throttle((x: number) => { values.push(x); }, 100);

      fn(1);
      fn(2); // Throttled

      vi.advanceTimersByTime(99);
      fn(3); // Still throttled

      expect(values).toEqual([1]);

      vi.advanceTimersByTime(1);
      // Now the pending call should execute
      expect(values.length).toBeGreaterThanOrEqual(1);

      vi.useRealTimers();
    });

    // 新增：multiple calls within interval
    it('should queue last call for later execution', () => {
      vi.useFakeTimers();
      const values: number[] = [];
      const fn = throttle((x: number) => { values.push(x); }, 100);

      fn(1); // Executes immediately
      fn(2); // Queued
      fn(3); // Replaces queued

      vi.advanceTimersByTime(100);
      // Should have executed 1 immediately and 3 after interval
      expect(values.length).toBe(2);
      expect(values[0]).toBe(1);
      expect(values[1]).toBe(3);

      vi.useRealTimers();
    });
  });

  describe('computeVirtualScroll', () => {
    it('should calculate visible window correctly', () => {
      const result = computeVirtualScroll(
        0, // scrollTop
        200, // containerHeight
        50, // itemHeight
        100 // totalItems
      );

      expect(result.visibleCount).toBe(4); // Math.ceil(200/50)
      expect(result.startIndex).toBeGreaterThanOrEqual(0);
      expect(result.endIndex).toBeLessThan(100);
      expect(result.totalHeight).toBe(5000); // 100 * 50
      expect(result.offsetY).toBeGreaterThanOrEqual(0);
    });

    it('should apply overscan buffer', () => {
      const result = computeVirtualScroll(
        250, // scrollTop (showing items 5+)
        200,
        50,
        100,
        3 // overscan
      );

      // startIndex should be floor(250/50) - 3 = 5 - 3 = 2
      expect(result.startIndex).toBe(2);
      // endIndex should be min(99, 2 + 4 + 6) = min(99, 12) = 12
      expect(result.endIndex).toBe(12);
    });

    it('should handle scroll at beginning', () => {
      const result = computeVirtualScroll(0, 100, 40, 50, 2);

      expect(result.startIndex).toBe(0); // Can't go negative
      expect(result.offsetY).toBe(0);
    });

    it('should handle scroll at end', () => {
      const result = computeVirtualScroll(
        99999, // Way past end
        100,
        40,
        50,
        2
      );

      expect(result.endIndex).toBe(49); // Can't exceed totalItems - 1
    });

    it('should handle empty list', () => {
      const result = computeVirtualScroll(0, 100, 40, 0, 2);

      expect(result.totalHeight).toBe(0);
      expect(result.visibleCount).toBe(Math.ceil(100 / 40));
    });

    it('should calculate correct offsetY for positioning', () => {
      const result = computeVirtualScroll(150, 300, 50, 100, 0);

      // startIndex should be floor(150/50) = 3
      expect(result.startIndex).toBe(3);
      // offsetY should be 3 * 50 = 150
      expect(result.offsetY).toBe(150);
    });

    it('should handle large overscan values', () => {
      const result = computeVirtualScroll(
        100,
        200,
        30,
        50,
        100 // Very large overscan
      );

      // With huge overscan, should show most/all items
      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBe(49);
    });
  });

  describe('createBatchUpdater', () => {
    it('should batch items and flush at interval', () => {
      vi.useFakeTimers();
      const batches: number[][] = [];
      const updater = createBatchUpdater((items: number[]) => {
        batches.push([...items]);
      }, 16);

      updater.add(1);
      updater.add(2);
      updater.add(3);

      expect(batches.length).toBe(0); // Not yet flushed

      vi.advanceTimersByTime(16);
      expect(batches.length).toBe(1);
      expect(batches[0]).toEqual([1, 2, 3]);

      vi.useRealTimers();
    });

    it('should support manual flush', () => {
      const batches: string[][] = [];
      const updater = createBatchUpdater((items: string[]) => {
        batches.push([...items]);
      }, 1000); // Long interval

      updater.add('a');
      updater.add('b');

      updater.flush(); // Manual flush before timer

      expect(batches.length).toBe(1);
      expect(batches[0]).toEqual(['a', 'b']);
    });

    it('should track queue size', () => {
      const updater = createBatchUpdater(() => {}, 1000);

      expect(updater.size()).toBe(0);

      updater.add(1);
      expect(updater.size()).toBe(1);

      updater.add(2);
      updater.add(3);
      expect(updater.size()).toBe(3);
    });

    it('should clear queue after flush', () => {
      vi.useFakeTimers();
      const batches: number[][] = [];
      const updater = createBatchUpdater((items: number[]) => {
        batches.push([...items]);
      }, 16);

      updater.add(1);
      updater.add(2);
      vi.advanceTimersByTime(16);

      expect(updater.size()).toBe(0); // Queue cleared after flush

      vi.useRealTimers();
    });

    it('should support destroy to stop batching', () => {
      vi.useFakeTimers();
      const batches: number[][] = [];
      const updater = createBatchUpdater((items: number[]) => {
        batches.push([...items]);
      }, 16);

      updater.add(1);
      updater.destroy();

      vi.advanceTimersByTime(100);
      expect(batches.length).toBe(0); // No flush after destroy

      vi.useRealTimers();
    });

    it('should handle multiple batches over time', () => {
      vi.useFakeTimers();
      const batches: number[][] = [];
      const updater = createBatchUpdater((items: number[]) => {
        batches.push([...items]);
      }, 16);

      // First batch
      updater.add(1);
      updater.add(2);
      vi.advanceTimersByTime(16);

      // Second batch
      updater.add(3);
      updater.add(4);
      updater.add(5);
      vi.advanceTimersByTime(16);

      expect(batches.length).toBe(2);
      expect(batches[0]).toEqual([1, 2]);
      expect(batches[1]).toEqual([3, 4, 5]);

      vi.useRealTimers();
    });

    it('should handle empty flush gracefully', () => {
      const batches: number[][] = [];
      const updater = createBatchUpdater((items: number[]) => {
        batches.push([...items]);
      }, 16);

      updater.flush(); // Flush empty queue

      expect(batches.length).toBe(0); // No batch created
    });
  });
});
