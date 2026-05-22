/**
 * @file src/app/api/canary-validator.ts
 * @description YYC3 金丝雀验证器,验证服务降级路径和回退机制
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-20
 * @updated 2026-03-20
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags api,typescript,validation,public
 * @depends ./service-bridge,./config,./yyc-api,@/app/constants/storage-keys
 */

/**
 * YYC-QATS Canary Validator
 * ─────────────────────────
 * Validates serviceBridge degradation paths across environments.
 * Used for production canary testing — verifies that when the real
 * backend is unavailable, every service falls back to mock gracefully.
 *
 * Usage (browser console):
 *   await runCanaryValidation();               // test current env
 *   await runCanaryValidation('production');    // test production degradation
 *   await runCanaryValidation('test');          // test test env
 */

import { currentEnv, type ApiEnv, allEnvConfigs } from './config';
import { serviceBridge } from './service-bridge';
import { quickHealthCheck } from './yyc-api';

import { STORAGE_KEYS } from '@/app/constants/storage-keys';

// ═══════════════════════════════════════
// §1  Types
// ═══════════════════════════════════════

export interface CanaryResult {
  service: string;
  method: string;
  status: 'real' | 'mock' | 'error' | 'timeout';
  passed: boolean;
  degraded?: boolean;
  latency: number;
  details?: string;
}

export interface CanaryReport {
  environment: ApiEnv;
  timestamp: number;
  backendOnline: boolean;
  backendLatency: number | null;
  results: CanaryResult[];
  summary: {
    total: number;
    real: number;
    mock: number;
    error: number;
    timeout: number;
    degradationHealthy: boolean;
  };
}

// ═══════════════════════════════════════
// §2  Probe Helpers
// ═══════════════════════════════════════

async function probeService(
  serviceName: string,
  method: string,
  fn: () => Promise<unknown>,
  timeoutMs = 10_000,
): Promise<CanaryResult> {
  const start = performance.now();
  try {
    const result = await Promise.race([
      fn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('CANARY_TIMEOUT')), timeoutMs)
      ),
    ]) as any;

    const latency = performance.now() - start;

    // Determine if result came from real or mock based on requestId pattern
    const requestId = result?.requestId || '';
    const isMock = requestId.startsWith('bridge_') || requestId.startsWith('mock_');
    const isReal = !isMock && result?.code === 200;

    return {
      service: serviceName,
      method,
      status: isReal ? 'real' : 'mock',
      passed: isReal,
      latency: +latency.toFixed(1),
      details: `code=${result?.code}, requestId=${requestId.slice(0, 20)}`,
    };
  } catch (err: unknown) {
    const latency = performance.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    return {
      service: serviceName,
      method,
      status: msg === 'CANARY_TIMEOUT' ? 'timeout' : 'error',
      passed: false,
      latency: +latency.toFixed(1),
      details: msg,
    };
  }
}

// ═══════════════════════════════════════
// §3  Full Validation Suite
// ═══════════════════════════════════════

export async function runCanaryValidation(targetEnv?: ApiEnv): Promise<CanaryReport> {
  const env = targetEnv || currentEnv;
  const envConfig = allEnvConfigs[env];

  console.group(
    `%c[Canary] 灰度验证 — ${envConfig.label} (${env})`,
    'color: #ECC94B; font-weight: bold; font-size: 13px'
  );
  console.log(`Target: ${envConfig.apiBase}`);
  console.log(`WS: ${envConfig.wsUrl}`);
  console.log(`Time: ${new Date().toISOString()}`);

  // Step 1: Health check
  let backendOnline = false;
  let backendLatency: number | null = null;
  try {
    const health = await Promise.race([
      quickHealthCheck(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Health timeout')), 5000)
      ),
    ]);
    backendOnline = health.online;
    backendLatency = health.latency;
    console.log(
      `%c  Backend: ${backendOnline ? 'ONLINE' : 'OFFLINE'} (${backendLatency}ms)`,
      backendOnline ? 'color: #38B2AC' : 'color: #F56565'
    );
  } catch {
    console.log('%c  Backend: UNREACHABLE', 'color: #F56565');
  }

  // Step 2: Probe all 8 services
  const probes: Array<() => Promise<CanaryResult>> = [
    () => probeService('system', 'getSystemMetrics', () => serviceBridge.system.getSystemMetrics()),
    () => probeService('system', 'getModelMetrics', () => serviceBridge.system.getModelMetrics()),
    () => probeService('system', 'getPipelineMetrics', () => serviceBridge.system.getPipelineMetrics()),
    () => probeService('system', 'getCrossModuleSummary', () => serviceBridge.system.getCrossModuleSummary()),
    () => probeService('trade', 'getPositions', () => serviceBridge.trade.getPositions()),
    () => probeService('trade', 'getOpenOrders', () => serviceBridge.trade.getOpenOrders()),
    () => probeService('trade', 'getTradeHistory', () => serviceBridge.trade.getTradeHistory(1, 5)),
    () => probeService('account', 'getAccountInfo', () => serviceBridge.account.getAccountInfo()),
    () => probeService('account', 'getMultiAccountSummary', () => serviceBridge.account.getMultiAccountSummary()),
    () => probeService('strategy', 'listStrategies', () => serviceBridge.strategy.listStrategies()),
    () => probeService('market', 'getAssets', () => serviceBridge.market.getAssets()),
    () => probeService('market', 'getTicker', () => serviceBridge.market.getTicker('BTC/USDT')),
    () => probeService('market', 'getKlines', () => serviceBridge.market.getKlines('BTC/USDT', '1h', 10)),
    () => probeService('market', 'getDepth', () => serviceBridge.market.getDepth('BTC/USDT')),
    () => probeService('risk', 'getRiskMetrics', () => serviceBridge.risk.getRiskMetrics()),
    () => probeService('risk', 'getVaRHistory', () => serviceBridge.risk.getVaRHistory(7)),
    () => probeService('alert', 'getAlerts', () => serviceBridge.alert.getAlerts()),
    () => probeService('alert', 'getThresholds', () => serviceBridge.alert.getThresholds()),
    () => probeService('arbitrage', 'getSignals', () => serviceBridge.arbitrage.getSignals()),
  ];

  // Execute all probes (sequential to avoid overwhelming backend)
  const results: CanaryResult[] = [];
  for (const probe of probes) {
    const result = await probe();
    results.push(result);
    const icon = result.status === 'real' ? '🟢' : result.status === 'mock' ? '🟡' : '🔴';
    console.log(
      `  ${icon} ${result.service}.${result.method} → ${result.status} (${result.latency}ms)`
    );
  }

  // Step 3: Compute summary
  const summary = {
    total: results.length,
    real: results.filter(r => r.status === 'real').length,
    mock: results.filter(r => r.status === 'mock').length,
    error: results.filter(r => r.status === 'error').length,
    timeout: results.filter(r => r.status === 'timeout').length,
    degradationHealthy: results.every(r => r.status === 'real' || r.status === 'mock'),
  };

  console.log('\n%c── Summary ──', 'color: #4299E1; font-weight: bold');
  console.log(
    `  Total: ${summary.total} | Real: ${summary.real} | Mock: ${summary.mock} | Error: ${summary.error} | Timeout: ${summary.timeout}`
  );
  console.log(
    `  Degradation: %c${summary.degradationHealthy ? 'HEALTHY ✓' : 'UNHEALTHY ✗'}`,
    summary.degradationHealthy ? 'color: #38B2AC; font-weight: bold' : 'color: #F56565; font-weight: bold'
  );
  console.groupEnd();

  const report: CanaryReport = {
    environment: env,
    timestamp: Date.now(),
    backendOnline,
    backendLatency,
    results,
    summary,
  };

  // Cache report for debugging
  try {
    localStorage.setItem(STORAGE_KEYS.CANARY_LAST, JSON.stringify(report));
  } catch { /* */ }

  return report;
}

// ═══════════════════════════════════════
// §4  Quick Degradation Test
// ═══════════════════════════════════════

/**
 * Quick test: verify all 8 service facades resolve (real or mock).
 * Returns true if all services respond without error/timeout.
 */
export async function quickDegradationTest(): Promise<boolean> {
  try {
    const calls = await Promise.allSettled([
      serviceBridge.system.getSystemMetrics(),
      serviceBridge.trade.getPositions(),
      serviceBridge.account.getAccountInfo(),
      serviceBridge.strategy.listStrategies(),
      serviceBridge.market.getAssets(),
      serviceBridge.risk.getRiskMetrics(),
      serviceBridge.alert.getAlerts(),
      serviceBridge.arbitrage.getSignals(),
    ]);
    return calls.every(r => r.status === 'fulfilled');
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════
// §5  Expose to Console
// ═══════════════════════════════════════

if (typeof globalThis !== 'undefined') {
  (globalThis as any).runCanaryValidation = runCanaryValidation;
  (globalThis as any).quickDegradationTest = quickDegradationTest;
}