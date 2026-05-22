/**
 * @file src/app/api/performance-monitor.ts
 * @description YYC3 性能监控组件,收集API请求指标、Web Vitals和内存使用情况
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-20
 * @updated 2026-03-20
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags api,typescript,monitoring,public
 * @depends
 */

/**
 * YYC-QATS Performance Monitor
 * ─────────────────────────────
 * Collects and reports:
 *   1. API request metrics (latency, success/failure rate, throughput)
 *   2. Web Vitals (FCP, LCP, CLS, FID, TTFB — if available)
 *   3. Memory usage snapshots
 *   4. Request log ring buffer (last N requests for debugging)
 *
 * Usage:
 *   import { perfMonitor } from '@/app/api/performance-monitor';
 *   perfMonitor.recordRequest({ ... });
 *   const snapshot = perfMonitor.getSnapshot();
 *   const log = perfMonitor.getRequestLog();
 */

// ═══════════════════════════════════════
// §1  Types
// ═══════════════════════════════════════

export interface RequestLogEntry {
  id: string;
  timestamp: number;
  endpoint: string;
  service: string;
  method: string;
  source: 'real' | 'mock' | 'circuit-open';
  latency: number;
  success: boolean;
  error?: string;
}

export interface WebVitals {
  fcp: number | null;   // First Contentful Paint
  lcp: number | null;   // Largest Contentful Paint
  cls: number | null;   // Cumulative Layout Shift
  fid: number | null;   // First Input Delay
  ttfb: number | null;  // Time to First Byte
}

export interface PerformanceSnapshot {
  /** App uptime in ms */
  uptime: number;
  /** Total API requests made */
  totalRequests: number;
  /** Requests in last 60s */
  requestsPerMinute: number;
  /** Average request latency (last 100 requests) */
  avgLatency: number;
  /** P95 request latency */
  p95Latency: number;
  /** P99 request latency */
  p99Latency: number;
  /** Success rate (0–100) */
  successRate: number;
  /** Real vs Mock breakdown */
  realCount: number;
  mockCount: number;
  circuitOpenCount: number;
  /** Memory usage (if available) */
  memoryUsedMB: number | null;
  memoryTotalMB: number | null;
  /** Web Vitals */
  webVitals: WebVitals;
  /** Per-service latency */
  serviceLatencies: Record<string, { avg: number; count: number; errorRate: number }>;
}

// ═══════════════════════════════════════
// §2  Performance Monitor Class
// ═══════════════════════════════════════

const MAX_LOG_ENTRIES = 200;
const MAX_LATENCY_SAMPLES = 500;

class PerformanceMonitor {
  private startTime = Date.now();
  private requestLog: RequestLogEntry[] = [];
  private latencies: number[] = [];
  private totalRequests = 0;
  private successCount = 0;
  private realCount = 0;
  private mockCount = 0;
  private circuitOpenCount = 0;
  private _requestCounter = 0;

  // Per-service tracking
  private serviceStats = new Map<string, { latencies: number[]; errors: number; total: number }>();

  // Web Vitals (collected once)
  private webVitals: WebVitals = {
    fcp: null, lcp: null, cls: null, fid: null, ttfb: null,
  };

  constructor() {
    // Collect Web Vitals once the page is loaded
    if (typeof window !== 'undefined') {
      this.collectWebVitals();
    }
  }

  // ── Request Recording ──

  recordRequest(entry: Omit<RequestLogEntry, 'id' | 'timestamp'>): void {
    const logEntry: RequestLogEntry = {
      ...entry,
      id: `req_${Date.now()}_${(++this._requestCounter).toString(36)}`,
      timestamp: Date.now(),
    };

    // Ring buffer
    this.requestLog.push(logEntry);
    if (this.requestLog.length > MAX_LOG_ENTRIES) {
      this.requestLog.shift();
    }

    // Metrics
    this.totalRequests++;
    this.latencies.push(entry.latency);
    if (this.latencies.length > MAX_LATENCY_SAMPLES) {
      this.latencies.shift();
    }

    if (entry.success) this.successCount++;
    if (entry.source === 'real') this.realCount++;
    else if (entry.source === 'mock') this.mockCount++;
    else if (entry.source === 'circuit-open') this.circuitOpenCount++;

    // Per-service
    const svc = this.getServiceStats(entry.service);
    svc.total++;
    svc.latencies.push(entry.latency);
    if (svc.latencies.length > 100) svc.latencies.shift();
    if (!entry.success) svc.errors++;
  }

  private getServiceStats(service: string) {
    let stats = this.serviceStats.get(service);
    if (!stats) {
      stats = { latencies: [], errors: 0, total: 0 };
      this.serviceStats.set(service, stats);
    }
    return stats;
  }

  // ── Snapshot ──

  getSnapshot(): PerformanceSnapshot {
    const now = Date.now();
    const oneMinAgo = now - 60_000;
    const recentRequests = this.requestLog.filter(r => r.timestamp >= oneMinAgo);

    const sorted = [...this.latencies].sort((a, b) => a - b);
    const p95Idx = Math.floor(sorted.length * 0.95);
    const p99Idx = Math.floor(sorted.length * 0.99);

    const serviceLatencies: Record<string, { avg: number; count: number; errorRate: number }> = {};
    this.serviceStats.forEach((stats, name) => {
      const avg = stats.latencies.length > 0
        ? stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length
        : 0;
      serviceLatencies[name] = {
        avg: +avg.toFixed(1),
        count: stats.total,
        errorRate: stats.total > 0 ? +((stats.errors / stats.total) * 100).toFixed(1) : 0,
      };
    });

    // Memory (Chrome only)
    let memoryUsedMB: number | null = null;
    let memoryTotalMB: number | null = null;
    if ((performance as any).memory) {
      memoryUsedMB = +((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
      memoryTotalMB = +((performance as any).memory.totalJSHeapSize / 1024 / 1024).toFixed(1);
    }

    return {
      uptime: now - this.startTime,
      totalRequests: this.totalRequests,
      requestsPerMinute: recentRequests.length,
      avgLatency: sorted.length > 0
        ? +(sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(1)
        : 0,
      p95Latency: sorted.length > 0 ? +(sorted[p95Idx] ?? 0).toFixed(1) : 0,
      p99Latency: sorted.length > 0 ? +(sorted[p99Idx] ?? 0).toFixed(1) : 0,
      successRate: this.totalRequests > 0
        ? +((this.successCount / this.totalRequests) * 100).toFixed(1)
        : 100,
      realCount: this.realCount,
      mockCount: this.mockCount,
      circuitOpenCount: this.circuitOpenCount,
      memoryUsedMB,
      memoryTotalMB,
      webVitals: { ...this.webVitals },
      serviceLatencies,
    };
  }

  // ── Request Log ──

  getRequestLog(limit = 50): RequestLogEntry[] {
    return this.requestLog.slice(-limit).reverse();
  }

  clearLog(): void {
    this.requestLog = [];
  }

  // ── Web Vitals ──

  private collectWebVitals(): void {
    // TTFB
    try {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (nav) {
        this.webVitals.ttfb = +(nav.responseStart - nav.requestStart).toFixed(1);
      }
    } catch { /* */ }

    // FCP via PerformanceObserver
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.webVitals.fcp = +entry.startTime.toFixed(1);
          }
        }
        observer.disconnect();
      });
      observer.observe({ type: 'paint', buffered: true });
    } catch { /* */ }

    // LCP via PerformanceObserver
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          this.webVitals.lcp = +entries[entries.length - 1].startTime.toFixed(1);
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      // Disconnect after 10s (LCP finalization)
      setTimeout(() => observer.disconnect(), 10_000);
    } catch { /* */ }

    // CLS via PerformanceObserver
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value ?? 0;
            this.webVitals.cls = +clsValue.toFixed(4);
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch { /* */ }

    // FID via PerformanceObserver
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.webVitals.fid = +((entry as any).processingStart - entry.startTime).toFixed(1);
        }
        observer.disconnect();
      });
      observer.observe({ type: 'first-input', buffered: true });
    } catch { /* */ }
  }

  // ── Reset ──

  reset(): void {
    this.requestLog = [];
    this.latencies = [];
    this.totalRequests = 0;
    this.successCount = 0;
    this.realCount = 0;
    this.mockCount = 0;
    this.circuitOpenCount = 0;
    this.serviceStats.clear();
    this.startTime = Date.now();
  }
}

// ═══════════════════════════════════════
// §3  Singleton
// ═══════════════════════════════════════

export const perfMonitor = new PerformanceMonitor();

// ═══════════════════════════════════════
// §4  Expose to Console
// ═══════════════════════════════════════

if (typeof globalThis !== 'undefined') {
  (globalThis as any).perfMonitor = perfMonitor;
  (globalThis as any).getPerformanceSnapshot = () => perfMonitor.getSnapshot();
  (globalThis as any).getRequestLog = (limit?: number) => perfMonitor.getRequestLog(limit);
}
