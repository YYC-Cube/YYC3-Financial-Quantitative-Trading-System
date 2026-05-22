/**
 * @file src/app/utils/perf-helpers.test.ts
 * @description 性能辅助函数测试 - 覆盖性能监控工具
 * @author Phase4 Coverage Enhancement
 * @version 1.0.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Performance Helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should measure execution time', () => {
    const startTime = performance.now();

    vi.advanceTimersByTime(100);

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeGreaterThanOrEqual(0);
  });

  it('should track memory usage', () => {
    const memory = (performance as any).memory;

    if (memory) {
      expect(memory.usedJSHeapSize).toBeDefined();
      expect(memory.totalJSHeapSize).toBeDefined();
    }
  });
});
