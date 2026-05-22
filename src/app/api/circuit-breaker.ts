/**
 * @file src/app/api/circuit-breaker.ts
 * @description YYC3 断路器模式实现,防止级联失败并提供快速失败机制
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-20
 * @updated 2026-03-20
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags api,typescript,circuit-breaker,public
 * @depends ./retry-cache
 */

/**
 * YYC-QATS Circuit Breaker
 * ────────────────────────
 * Implements the circuit breaker pattern to prevent cascading failures
 * when backend services are unavailable.
 *
 * States:
 *   CLOSED   → Normal operation; requests pass through
 *   OPEN     → Backend failing; requests fail-fast to mock
 *   HALF_OPEN→ Probe mode; single request tests recovery
 *
 * Usage:
 *   const breaker = new CircuitBreaker('system', { failureThreshold: 3 });
 *   const result = await breaker.execute(
 *     () => realCall(),   // primary
 *     () => mockCall(),   // fallback
 *   );
 */

import { persistCBStates, restoreCBStates, clearPersistedCBStates, type PersistedCBState } from './retry-cache';

// ═══════════════════════════════════════
// §1  Types
// ═══════════════════════════════════════

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  /** Number of consecutive failures before opening circuit (default: 3) */
  failureThreshold?: number;
  /** Time in ms before transitioning from OPEN → HALF_OPEN (default: 30_000) */
  resetTimeout?: number;
  /** Time window in ms to count failures (default: 60_000) */
  failureWindow?: number;
  /** Max concurrent requests in HALF_OPEN (default: 1) */
  halfOpenMax?: number;
}

export interface CircuitBreakerMetrics {
  name: string;
  serviceName: string;
  state: CircuitState;
  consecutiveFailures: number;
  totalRequests: number;
  totalFailures: number;
  totalFallbacks: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  stateChangedAt: number;
  avgLatency: number;
}

// ═══════════════════════════════════════
// §2  CircuitBreaker Class
// ═══════════════════════════════════════

export class CircuitBreaker {
  private _state: CircuitState = 'CLOSED';
  private consecutiveFailures = 0;
  private totalRequests = 0;
  private totalFailures = 0;
  private totalFallbacks = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private stateChangedAt = Date.now();
  private halfOpenInFlight = 0;
  private latencies: number[] = [];
  /** Listeners for state changes */
  private _onStateChange: Array<(prev: CircuitState, next: CircuitState) => void> = [];

  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly halfOpenMax: number;

  constructor(
    public readonly serviceName: string,
    options: CircuitBreakerOptions = {},
  ) {
    this.failureThreshold = options.failureThreshold ?? 3;
    this.resetTimeout = options.resetTimeout ?? 30_000;
    this.halfOpenMax = options.halfOpenMax ?? 1;
  }

  get state(): CircuitState {
    // Auto-transition OPEN → HALF_OPEN after resetTimeout
    if (this._state === 'OPEN' && Date.now() - this.stateChangedAt >= this.resetTimeout) {
      this.transitionTo('HALF_OPEN');
    }
    return this._state;
  }

  get metrics(): CircuitBreakerMetrics {
    const recentLatencies = this.latencies.slice(-50);
    const avgLatency = recentLatencies.length > 0
      ? recentLatencies.reduce((a, b) => a + b, 0) / recentLatencies.length
      : 0;

    return {
      name: this.serviceName,
      serviceName: this.serviceName,
      state: this.state,
      consecutiveFailures: this.consecutiveFailures,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalFallbacks: this.totalFallbacks,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      stateChangedAt: this.stateChangedAt,
      avgLatency: +avgLatency.toFixed(1),
    };
  }

  /**
   * Execute a request through the circuit breaker.
   * @param primary  The real API call
   * @param fallback The mock/fallback call
   */
  async execute<T>(primary: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    this.totalRequests++;
    const currentState = this.state;

    // OPEN → fail-fast to fallback
    if (currentState === 'OPEN') {
      this.totalFallbacks++;
      return fallback();
    }

    // HALF_OPEN → allow limited probes
    if (currentState === 'HALF_OPEN') {
      if (this.halfOpenInFlight >= this.halfOpenMax) {
        this.totalFallbacks++;
        return fallback();
      }
      this.halfOpenInFlight++;
    }

    // CLOSED or HALF_OPEN probe → try primary
    const start = performance.now();
    try {
      const result = await primary();
      const latency = performance.now() - start;
      this.latencies.push(latency);
      if (this.latencies.length > 100) this.latencies.shift();

      this.onSuccess();
      return result;
    } catch (_err) {
      this.onFailure();
      this.totalFallbacks++;
      return fallback();
    } finally {
      if (currentState === 'HALF_OPEN') {
        this.halfOpenInFlight--;
      }
    }
  }

  private onSuccess(): void {
    this.consecutiveFailures = 0;
    this.lastSuccessTime = Date.now();
    if (this._state === 'HALF_OPEN') {
      this.transitionTo('CLOSED');
    }
  }

  private onFailure(): void {
    this.consecutiveFailures++;
    this.totalFailures++;
    this.lastFailureTime = Date.now();

    if (this.consecutiveFailures >= this.failureThreshold) {
      this.transitionTo('OPEN');
    }
  }

  private transitionTo(newState: CircuitState): void {
    if (this._state === newState) return;
    const prev = this._state;
    this._state = newState;
    this.stateChangedAt = Date.now();

    if (newState === 'CLOSED') {
      this.consecutiveFailures = 0;
    }

    console.log(
      `%c[CircuitBreaker] ${this.serviceName}: ${prev} → ${newState}`,
      newState === 'OPEN' ? 'color: #F56565' :
      newState === 'HALF_OPEN' ? 'color: #ECC94B' : 'color: #38B2AC'
    );

    // Notify listeners
    this._onStateChange.forEach(fn => { try { fn(prev, newState); } catch { /* */ } });
    // Persist all CB states on any state change
    _persistAllStates();
  }

  /** Register a state change listener */
  onStateChange(fn: (prev: CircuitState, next: CircuitState) => void): void {
    this._onStateChange.push(fn);
  }

  /** Force reset to CLOSED (admin override) */
  reset(): void {
    this.transitionTo('CLOSED');
    this.consecutiveFailures = 0;
    this.halfOpenInFlight = 0;
  }

  /** Restore state from persistence (used on page reload) */
  restoreState(persisted: PersistedCBState): void {
    if (persisted.state === 'OPEN' || persisted.state === 'HALF_OPEN') {
      this._state = persisted.state;
      this.consecutiveFailures = persisted.consecutiveFailures;
      this.stateChangedAt = persisted.stateChangedAt;
      console.log(
        `%c[CircuitBreaker] ${this.serviceName}: restored to ${persisted.state}`,
        'color: #ECC94B'
      );
    }
  }
}

// ═══════════════════════════════════════
// §3  Registry
// ═══════════════════════════════════════

const _breakers = new Map<string, CircuitBreaker>();

/** Internal: persist all breaker states to localStorage */
function _persistAllStates(): void {
  const states: PersistedCBState[] = Array.from(_breakers.values()).map(b => ({
    serviceName: b.serviceName,
    state: b.state,
    consecutiveFailures: b.metrics.consecutiveFailures,
    stateChangedAt: b.metrics.stateChangedAt,
  }));
  persistCBStates(states);
}

/**
 * Get or create a circuit breaker for a service.
 */
export function getCircuitBreaker(serviceName: string, options?: CircuitBreakerOptions): CircuitBreaker {
  let breaker = _breakers.get(serviceName);
  if (!breaker) {
    breaker = new CircuitBreaker(serviceName, options);
    _breakers.set(serviceName, breaker);
  }
  return breaker;
}

/**
 * Get metrics for all circuit breakers.
 */
export function getAllCircuitBreakerMetrics(): CircuitBreakerMetrics[] {
  return Array.from(_breakers.values()).map(b => b.metrics);
}

/**
 * Reset all circuit breakers (admin override).
 */
export function resetAllCircuitBreakers(): void {
  _breakers.forEach(b => b.reset());
  clearPersistedCBStates();
  console.log('%c[CircuitBreaker] All breakers reset to CLOSED', 'color: #38B2AC');
}

/**
 * Restore circuit breaker states from localStorage (called on app init).
 */
export function restoreCircuitBreakerStates(): number {
  const persisted = restoreCBStates();
  if (!persisted) return 0;
  let restored = 0;
  for (const ps of persisted) {
    const breaker = _breakers.get(ps.serviceName);
    if (breaker) {
      breaker.restoreState(ps);
      restored++;
    }
  }
  return restored;
}

// ═══════════════════════════════════════
// §4  Expose to Console
// ═══════════════════════════════════════

if (typeof globalThis !== 'undefined') {
  (globalThis as any).getCircuitBreakerMetrics = getAllCircuitBreakerMetrics;
  (globalThis as any).resetCircuitBreakers = resetAllCircuitBreakers;
  (globalThis as any).restoreCircuitBreakerStates = restoreCircuitBreakerStates;
}