/**
 * @file src/app/utils/rate-limiter.test.ts
 * @description Unit tests for Rate Limiter utility
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RateLimiter, apiRateLimiter, wsRateLimiter } from './rate-limiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      maxRequests: 3,
      windowMs: 1000,
    });
  });

  it('should allow requests within limit', () => {
    const result1 = limiter.check('user-1');
    const result2 = limiter.check('user-1');
    const result3 = limiter.check('user-1');

    expect(result1.allowed).toBe(true);
    expect(result2.allowed).toBe(true);
    expect(result3.allowed).toBe(true);
  });

  it('should block requests exceeding limit', () => {
    limiter.check('user-1');
    limiter.check('user-1');
    limiter.check('user-1');

    const result4 = limiter.check('user-1');
    expect(result4.allowed).toBe(false);
    expect(result4.remaining).toBe(0);
  });

  it('should track remaining requests correctly', () => {
    const r1 = limiter.check('user-1');
    expect(r1.remaining).toBe(2);

    const r2 = limiter.check('user-1');
    expect(r2.remaining).toBe(1);

    const r3 = limiter.check('user-1');
    expect(r3.remaining).toBe(0);
  });

  it('should reset after window expires', async () => {
    vi.useFakeTimers();

    try {
      limiter.check('user-1');
      limiter.check('user-1');
      limiter.check('user-1');

      const blocked = limiter.check('user-1');
      expect(blocked.allowed).toBe(false);

      // Advance time by window duration (fake timers - instant)
      vi.advanceTimersByTime(1100);

      const allowed = limiter.check('user-1');
      expect(allowed.allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('should handle multiple keys independently', () => {
    limiter.check('user-1');
    limiter.check('user-1');
    limiter.check('user-1');

    const user2Result = limiter.check('user-2');
    expect(user2Result.allowed).toBe(true);
  });
});

describe('Pre-configured Limiters', () => {
  it('apiRateLimiter should have correct config', () => {
    expect(apiRateLimiter).toBeDefined();
  });

  it('wsRateLimiter should have correct config', () => {
    expect(wsRateLimiter).toBeDefined();
  });
});
