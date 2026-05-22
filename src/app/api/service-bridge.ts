/**
 * @file src/app/api/service-bridge.ts
 * @description YYC3 服务桥接层,提供从Mock API到真实API的渐进式切换
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-20
 * @updated 2026-03-20
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags api,typescript,bridge,public
 * @depends
 */

/**
 * YYC-QATS Service Bridge Layer
 * ─────────────────────────────
 * Provides a unified facade that progressively switches from
 * MockApiService → Real API (yyc-api.ts) on a per-service basis.
 *
 * Strategy:
 *   1. Try real API endpoint
 *   2. If real fails or is unavailable, fall back to mock
 *   3. Log which path was used (dev mode only)
 *
 * Currently bridged:
 *   - ISystemService  (via /health, /api/v1/status, /api/v1/devices)
 *   - ITradeService   (via /api/v1/trade/*)
 *   - IAccountService (via /api/v1/account/*)
 *   - IStrategyService(via /api/v1/strategy/*)
 *   - IMarketService  (via /api/v1/market/*)
 *   - IRiskService    (via /api/v1/risk/*)
 *   - IAlertService   (via /api/v1/alert/*)
 *   - IArbitrageService (via /api/v1/arbitrage/*)
 *
 * Usage:
 *   import { serviceBridge } from '@/app/api/service-bridge';
 *   const metrics = await serviceBridge.system.getSystemMetrics();
 *   const positions = await serviceBridge.trade.getPositions();
 *   const assets = await serviceBridge.market.getAssets();
 *   const risk = await serviceBridge.risk.getRiskMetrics();
 *   const alerts = await serviceBridge.alert.getAlerts();
 *   const signals = await serviceBridge.arbitrage.getSignals();
 */

import type {
  SystemMetrics,
  ModelMetrics,
  DataPipelineMetrics,
  CrossModuleSummary,
  Position,
  AccountInfo,
  MultiAccountSummary,
  StrategyItem,
  TradeRecord,
  BacktestConfig,
  BacktestResult,
  MarketAsset,
  CandleData,
  KLineInterval,
  OrderBookSnapshot,
  AggregatedQuote,
  RiskMetrics,
  Alert,
  AlertThreshold,
  ArbitrageSignal,
} from '../types/global';

import { authManager, type AuthState } from './auth';
import { getCircuitBreaker, getAllCircuitBreakerMetrics, resetAllCircuitBreakers, restoreCircuitBreakerStates, type CircuitBreakerMetrics } from './circuit-breaker';
import { currentEnv } from './config';
import type {
  ApiResponse,
  PaginatedResponse,
  ISystemService,
  ITradeService,
  IAccountService,
  IStrategyService,
  IMarketService,
  IRiskService,
  IAlertService,
  IArbitrageService,
  OrderRequest,
  OrderResult,
} from './interfaces';
import { MockApiService } from './interfaces';
import { perfMonitor } from './performance-monitor';
import { retryWithBackoff, getRetryPolicy, requestCache } from './retry-cache';
import { wsChannelManager, type WSChannelStats } from './ws-channels';
import { yycApi, quickHealthCheck } from './yyc-api';


// ═══════════════════════════════════════
// §0  WS Message Types (Device / AI)
// ═══════════════════════════════════════

/** WebSocket message payload for device status updates (IoT / edge nodes) */
export interface WSDeviceUpdate {
  deviceId: string;
  status: 'online' | 'offline' | 'degraded';
  cpuUsage?: number;
  memoryUsage?: number;
  lastHeartbeat: number;
  firmware?: string;
  region?: string;
}

/** WebSocket message payload for AI model inference responses */
export interface WSAIResponse {
  requestId: string;
  model: string;
  prediction: number | string;
  confidence: number;
  latencyMs: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════
// §1  Helper
// ═══════════════════════════════════════

function ok<T>(data: T, message = 'success'): ApiResponse<T> {
  return { code: 200, data, message, timestamp: Date.now(), requestId: `bridge_${Date.now()}` };
}

function logBridge(service: string, method: string, source: 'real' | 'mock' | 'circuit-open', latencyMs = 0) {
  if (currentEnv === 'development') {
    console.log(`[ServiceBridge] ${service}.${method} → ${source} (${latencyMs.toFixed(0)}ms)`);
  }
  // Record to performance monitor
  perfMonitor.recordRequest({
    service,
    method,
    source: source === 'circuit-open' ? 'circuit-open' : source,
    latency: latencyMs,
    success: true,
    endpoint: ''
  });
}

/**
 * Phase 11 Core: Circuit Breaker + Retry + PerfMonitor integration.
 * Wraps any service method with:
 *   1. Circuit breaker (per-service, fail-fast when OPEN)
 *   2. Retry with exponential backoff (per-service configurable)
 *   3. Performance recording (real/mock/circuit-open)
 *
 * This is the single entry point for all bridged API calls.
 */
async function withCB<T>(
  serviceName: string,
  methodName: string,
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  const cb = getCircuitBreaker(serviceName);
  const policy = getRetryPolicy(serviceName);
  const start = performance.now();

  return cb.execute(
    // Primary path: retry with backoff, then log as 'real'
    async () => {
      const result = await retryWithBackoff(primary, policy);
      const latency = performance.now() - start;
      logBridge(serviceName, methodName, 'real', latency);
      return result;
    },
    // Fallback path: log as 'circuit-open' or 'mock' based on CB state
    async () => {
      const latency = performance.now() - start;
      const source: 'mock' | 'circuit-open' = cb.state === 'OPEN' ? 'circuit-open' : 'mock';
      logBridge(serviceName, methodName, source, latency);
      return fallback();
    },
  );
}

/**
 * Cached variant of withCB for read-only GET-like methods.
 * Deduplicates concurrent identical requests and caches results briefly.
 */
async function withCBCached<T>(
  serviceName: string,
  methodName: string,
  cacheKey: string,
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  return requestCache.getOrFetch(cacheKey, () =>
    withCB(serviceName, methodName, primary, fallback),
  );
}

// ═══════════════════════════════════════
// §2  Real ISystemService (partial)
// ═══════════════════════════════════════

/**
 * Phase 11: All methods routed through withCB (circuit breaker + retry + perf recording).
 * getSystemMetrics uses special dual-call pattern (health + status), kept as-is but wrapped.
 */
const realSystemService: ISystemService = {
  async getSystemMetrics(): Promise<ApiResponse<SystemMetrics>> {
    return withCBCached('system', 'getSystemMetrics', 'system.getSystemMetrics',
      async () => {
        const [healthResult, statusResp] = await Promise.allSettled([
          quickHealthCheck(),
          yycApi.health.systemStatus(),
        ]);

        const health = healthResult.status === 'fulfilled' ? healthResult.value : null;
        const status = statusResp.status === 'fulfilled' ? statusResp.value.data : null;

        if (status && typeof status === 'object' && 'cpu' in status) {
          return ok<SystemMetrics>({
            cpuUsage: (status as any).cpu?.usage ?? 42,
            memoryUsage: (status as any).memory
              ? ((status as any).memory.used / (status as any).memory.total) * 100
              : 68,
            networkLatency: health?.latency ?? 12,
            activeConnections: (status as any).connections ?? 3,
            dataFreshness: 0,
            quantumQubits: 72,
            quantumFidelity: 99.2,
            quantumTasks: 5,
          });
        }

        if (health?.online) {
          return ok<SystemMetrics>({
            cpuUsage: 42,
            memoryUsage: 68,
            networkLatency: health.latency,
            activeConnections: 3,
            dataFreshness: 0,
            quantumQubits: 72,
            quantumFidelity: 99.2,
            quantumTasks: 5,
          });
        }

        throw new Error('Backend unreachable');
      },
      () => MockApiService.system.getSystemMetrics(),
    );
  },

  async getCrossModuleSummary(): Promise<ApiResponse<CrossModuleSummary>> {
    // CrossModuleSummary is computed client-side — always local, no CB needed
    logBridge('system', 'getCrossModuleSummary', 'mock');
    return ok<CrossModuleSummary>({
      market: { assetCount: 12, topMover: 'SOL/USDT', topMoveChange: 5.1 },
      strategy: { activeCount: 4, avgWinRate: 63.4, bestPnl: '+24.2%' },
      risk: { riskLevel: 'low', var95: -8120, alertCount: 2 },
      quantum: { qubits: 72, fidelity: 99.2, activeTasks: 5 },
      bigdata: { sources: 4, quality: 97.5, storage: '2.8 TB' },
      model: { deployed: 4, training: 1, bestAccuracy: 85.1 },
      trade: { totalAssets: 142580.5, todayPnl: 2850.8, openPositions: 3 },
      admin: { cpuUsage: 42, memUsage: 68, uptime: '99.97%' },
    });
  },

  async getModelMetrics(): Promise<ApiResponse<ModelMetrics>> {
    return withCBCached('system', 'getModelMetrics', 'system.getModelMetrics',
      async () => {
        const resp = await yycApi.health.modelList();
        if (resp.data?.success && resp.data.models) {
          const models = resp.data.models;
          const deployed = models.filter((m: any) => m.status === 'deployed').length;
          const training = models.filter((m: any) => m.status === 'training').length;
          return ok<ModelMetrics>({
            totalModels: models.length || 6,
            deployedModels: deployed || 4,
            trainingModels: training || 1,
            avgAccuracy: 80.8,
            bestSharpe: 2.12,
            lastTrainTime: '2小时前',
          });
        }
        throw new Error('No model data');
      },
      async () => ok<ModelMetrics>({
        totalModels: 6, deployedModels: 4, trainingModels: 1,
        avgAccuracy: 80.8, bestSharpe: 2.12, lastTrainTime: '2小时前',
      }),
    );
  },

  async getPipelineMetrics(): Promise<ApiResponse<DataPipelineMetrics>> {
    // Pipeline metrics local/mock — no backend endpoint yet
    logBridge('system', 'getPipelineMetrics', 'mock');
    return ok<DataPipelineMetrics>({
      activeSources: 4, totalSources: 5, dailyRecords: '26.7M',
      totalStorage: '2.8 TB', avgLatency: '< 150ms', dataQuality: 97.5,
    });
  },
};

// ═══════════════════════════════════════
// §3  Real ITradeService (CB-wrapped)
// ═══════════════════════════════════════

const realTradeService: ITradeService = {
  async placeOrder(order: OrderRequest): Promise<ApiResponse<OrderResult>> {
    return withCB('trade', 'placeOrder',
      async () => {
        const resp = await yycApi.trade.placeOrder(order);
        if (resp.data?.success && resp.data.data) return ok(resp.data.data);
        throw new Error('Invalid response');
      },
      () => MockApiService.trade.placeOrder(order),
    );
  },

  async cancelOrder(orderId: string): Promise<ApiResponse<boolean>> {
    return withCB('trade', 'cancelOrder',
      async () => {
        const resp = await yycApi.trade.cancelOrder(orderId);
        if (resp.data?.success) return ok(resp.data.data?.cancelled ?? true);
        throw new Error('Cancel failed');
      },
      () => MockApiService.trade.cancelOrder(orderId),
    );
  },

  async getOpenOrders(): Promise<ApiResponse<OrderResult[]>> {
    return withCBCached('trade', 'getOpenOrders', 'trade.getOpenOrders',
      async () => {
        const resp = await yycApi.trade.getOpenOrders();
        if (resp.data?.success && Array.isArray(resp.data.data)) return ok(resp.data.data);
        throw new Error('Invalid response');
      },
      () => MockApiService.trade.getOpenOrders(),
    );
  },

  async getPositions(): Promise<ApiResponse<Position[]>> {
    return withCBCached('trade', 'getPositions', 'trade.getPositions',
      async () => {
        const resp = await yycApi.trade.getPositions();
        if (resp.data?.success && Array.isArray(resp.data.data)) return ok(resp.data.data);
        throw new Error('Invalid response');
      },
      () => MockApiService.trade.getPositions(),
    );
  },

  async closePosition(symbol: string, side: 'LONG' | 'SHORT'): Promise<ApiResponse<boolean>> {
    return withCB('trade', 'closePosition',
      async () => {
        const resp = await yycApi.trade.closePosition(symbol, side);
        if (resp.data?.success) return ok(resp.data.data?.closed ?? true);
        throw new Error('Close failed');
      },
      () => MockApiService.trade.closePosition(symbol, side),
    );
  },

  async getTradeHistory(page = 1, pageSize = 20): Promise<PaginatedResponse<TradeRecord>> {
    return withCBCached('trade', 'getTradeHistory', `trade.getTradeHistory.${page}.${pageSize}`,
      async () => {
        const resp = await yycApi.trade.getHistory(page, pageSize);
        if (resp.data?.success && Array.isArray(resp.data.data)) {
          return {
            code: 200,
            data: resp.data.data as unknown as TradeRecord[],
            message: 'success',
            timestamp: Date.now(),
            requestId: `bridge_${Date.now()}`,
            total: resp.data.total,
            page: resp.data.page,
            pageSize: resp.data.pageSize,
            hasMore: resp.data.hasMore,
          };
        }
        throw new Error('Invalid response');
      },
      () => MockApiService.trade.getTradeHistory(page, pageSize),
    );
  },
};

// ═══════════════════════════════════════
// §4  Real IAccountService (CB-wrapped)
// ═══════════════════════════════════════

const realAccountService: IAccountService = {
  async getAccountInfo(): Promise<ApiResponse<AccountInfo>> {
    return withCBCached('account', 'getAccountInfo', 'account.getAccountInfo',
      async () => {
        const resp = await yycApi.account.getInfo();
        if (resp.data?.success && resp.data.data) return ok(resp.data.data);
        throw new Error('Invalid response');
      },
      () => MockApiService.account.getAccountInfo(),
    );
  },

  async getMultiAccountSummary(): Promise<ApiResponse<MultiAccountSummary>> {
    return withCBCached('account', 'getMultiAccountSummary', 'account.getMultiAccountSummary',
      async () => {
        const resp = await yycApi.account.getMultiSummary();
        if (resp.data?.success && resp.data.data) return ok(resp.data.data);
        throw new Error('Invalid response');
      },
      () => MockApiService.account.getMultiAccountSummary(),
    );
  },
};

// ═══════════════════════════════════════
// §5  Real IStrategyService (CB-wrapped)
// ═══════════════════════════════════════

const realStrategyService: IStrategyService = {
  async listStrategies(): Promise<ApiResponse<StrategyItem[]>> {
    return withCBCached('strategy', 'listStrategies', 'strategy.listStrategies',
      async () => {
        const resp = await yycApi.strategy.list();
        if (resp.data?.success && Array.isArray(resp.data.data)) return ok(resp.data.data as unknown as StrategyItem[]);
        throw new Error('Invalid response');
      },
      () => MockApiService.strategy.listStrategies(),
    );
  },

  async getStrategy(id: number): Promise<ApiResponse<StrategyItem>> {
    return withCBCached('strategy', 'getStrategy', `strategy.getStrategy.${id}`,
      async () => {
        const resp = await yycApi.strategy.detail(id);
        if (resp.data?.success && resp.data.data) return ok(resp.data.data as unknown as StrategyItem);
        throw new Error('Invalid response');
      },
      () => MockApiService.strategy.getStrategy(id),
    );
  },

  async createStrategy(data: Omit<StrategyItem, 'id'>): Promise<ApiResponse<StrategyItem>> {
    requestCache.invalidatePrefix('strategy.');
    return withCB('strategy', 'createStrategy',
      async () => {
        const resp = await yycApi.strategy.create(data as unknown as Record<string, unknown>);
        if (resp.data?.success && resp.data.data) return ok(resp.data.data as unknown as StrategyItem);
        throw new Error('Invalid response');
      },
      () => MockApiService.strategy.createStrategy(data),
    );
  },

  async updateStrategy(id: number, updates: Partial<StrategyItem>): Promise<ApiResponse<StrategyItem>> {
    requestCache.invalidatePrefix('strategy.');
    return withCB('strategy', 'updateStrategy',
      async () => {
        const resp = await yycApi.strategy.update(id, updates as unknown as Record<string, unknown>);
        if (resp.data?.success && resp.data.data) return ok(resp.data.data as unknown as StrategyItem);
        throw new Error('Invalid response');
      },
      () => MockApiService.strategy.updateStrategy(id, updates),
    );
  },

  async deleteStrategy(id: number): Promise<ApiResponse<boolean>> {
    requestCache.invalidatePrefix('strategy.');
    return withCB('strategy', 'deleteStrategy',
      async () => {
        const resp = await yycApi.strategy.remove(id);
        if (resp.data?.success) return ok(resp.data.data?.result ?? true);
        throw new Error('Delete failed');
      },
      () => MockApiService.strategy.deleteStrategy(id),
    );
  },

  async startStrategy(id: number): Promise<ApiResponse<boolean>> {
    requestCache.invalidatePrefix('strategy.');
    return withCB('strategy', 'startStrategy',
      async () => {
        const resp = await yycApi.strategy.start(id);
        if (resp.data?.success) return ok(resp.data.data?.result ?? true);
        throw new Error('Start failed');
      },
      () => MockApiService.strategy.startStrategy(id),
    );
  },

  async pauseStrategy(id: number): Promise<ApiResponse<boolean>> {
    requestCache.invalidatePrefix('strategy.');
    return withCB('strategy', 'pauseStrategy',
      async () => {
        const resp = await yycApi.strategy.pause(id);
        if (resp.data?.success) return ok(resp.data.data?.result ?? true);
        throw new Error('Pause failed');
      },
      () => MockApiService.strategy.pauseStrategy(id),
    );
  },

  async runBacktest(config: BacktestConfig): Promise<ApiResponse<BacktestResult>> {
    return withCB('strategy', 'runBacktest',
      async () => {
        const resp = await yycApi.strategy.runBacktest(config as unknown as Record<string, unknown>);
        if (resp.data?.success && resp.data.data) return ok({ config, ...resp.data.data } as unknown as BacktestResult);
        throw new Error('Invalid response');
      },
      () => MockApiService.strategy.runBacktest(config),
    );
  },
};

// ═══════════════════════════════════════
// §6  Real IMarketService (CB-wrapped)
// ═══════════════════════════════════════

const realMarketService: IMarketService = {
  async getAssets(category?: string): Promise<ApiResponse<MarketAsset[]>> {
    return withCBCached('market', 'getAssets', `market.getAssets.${category ?? 'all'}`,
      async () => {
        const resp = await yycApi.market.getAssets(category);
        if (resp.data?.success && Array.isArray(resp.data.data)) return ok(resp.data.data as unknown as MarketAsset[]);
        throw new Error('Invalid response');
      },
      () => MockApiService.market.getAssets(category),
    );
  },

  async getTicker(symbol: string): Promise<ApiResponse<MarketAsset>> {
    return withCBCached('market', 'getTicker', `market.getTicker.${symbol}`,
      async () => {
        const resp = await yycApi.market.getTicker(symbol);
        if (resp.data?.success && resp.data.data) return ok(resp.data.data as unknown as MarketAsset);
        throw new Error('Invalid response');
      },
      () => MockApiService.market.getTicker(symbol),
    );
  },

  async getKlines(symbol: string, interval: KLineInterval, limit?: number): Promise<ApiResponse<CandleData[]>> {
    return withCBCached('market', 'getKlines', `market.getKlines.${symbol}.${interval}.${limit ?? 100}`,
      async () => {
        const resp = await yycApi.market.getKlines(symbol, interval, limit);
        if (resp.data?.success && Array.isArray(resp.data.data)) return ok(resp.data.data as unknown as CandleData[]);
        throw new Error('Invalid response');
      },
      () => MockApiService.market.getKlines(symbol, interval, limit),
    );
  },

  async getDepth(symbol: string): Promise<ApiResponse<OrderBookSnapshot>> {
    return withCBCached('market', 'getDepth', `market.getDepth.${symbol}`,
      async () => {
        const resp = await yycApi.market.getDepth(symbol);
        if (resp.data?.success && resp.data.data) return ok(resp.data.data as unknown as OrderBookSnapshot);
        throw new Error('Invalid response');
      },
      () => MockApiService.market.getDepth(symbol),
    );
  },

  async getAggregatedQuote(symbol: string): Promise<ApiResponse<AggregatedQuote>> {
    return withCBCached('market', 'getAggregatedQuote', `market.getAggregatedQuote.${symbol}`,
      async () => {
        const resp = await yycApi.market.getAggregatedQuote(symbol);
        if (resp.data?.success && resp.data.data) return ok(resp.data.data as unknown as AggregatedQuote);
        throw new Error('Invalid response');
      },
      () => MockApiService.market.getAggregatedQuote(symbol),
    );
  },
};

// ═══════════════════════════════════════
// §7  Real IRiskService (CB-wrapped)
// ═══════════════════════════════════════

const realRiskService: IRiskService = {
  async getRiskMetrics(): Promise<ApiResponse<RiskMetrics>> {
    return withCBCached('risk', 'getRiskMetrics', 'risk.getRiskMetrics',
      async () => {
        const resp = await yycApi.risk.getMetrics();
        if (resp.data?.success && resp.data.data) return ok(resp.data.data as unknown as RiskMetrics);
        throw new Error('Invalid response');
      },
      () => MockApiService.risk.getRiskMetrics(),
    );
  },

  async runStressTest(scenario: string): Promise<ApiResponse<{ scenarioName: string; impact: number; details: string }>> {
    return withCB('risk', 'runStressTest',
      async () => {
        const resp = await yycApi.risk.runStressTest(scenario);
        if (resp.data?.success && resp.data.data) return ok(resp.data.data);
        throw new Error('Invalid response');
      },
      () => MockApiService.risk.runStressTest(scenario),
    );
  },

  async getVaRHistory(days?: number): Promise<ApiResponse<Array<{ date: string; var95: number; var99: number }>>> {
    return withCBCached('risk', 'getVaRHistory', `risk.getVaRHistory.${days ?? 30}`,
      async () => {
        const resp = await yycApi.risk.getVaRHistory(days);
        if (resp.data?.success && Array.isArray(resp.data.data)) return ok(resp.data.data);
        throw new Error('Invalid response');
      },
      () => MockApiService.risk.getVaRHistory(days),
    );
  },
};

// ═══════════════════════════════════════
// §8  Real IAlertService (CB-wrapped)
// ═══════════════════════════════════════

const realAlertService: IAlertService = {
  async getAlerts(unreadOnly = false): Promise<ApiResponse<Alert[]>> {
    return withCBCached('alert', 'getAlerts', `alert.getAlerts.${unreadOnly}`,
      async () => {
        const resp = await yycApi.alert.getAlerts(unreadOnly);
        if (resp.data?.success && Array.isArray(resp.data.data)) return ok(resp.data.data as unknown as Alert[]);
        throw new Error('Invalid response');
      },
      () => MockApiService.alert.getAlerts(unreadOnly),
    );
  },

  async getThresholds(): Promise<ApiResponse<AlertThreshold[]>> {
    return withCBCached('alert', 'getThresholds', 'alert.getThresholds',
      async () => {
        const resp = await yycApi.alert.getThresholds();
        if (resp.data?.success && Array.isArray(resp.data.data)) return ok(resp.data.data as unknown as AlertThreshold[]);
        throw new Error('Invalid response');
      },
      () => MockApiService.alert.getThresholds(),
    );
  },

  async addThreshold(threshold: Omit<AlertThreshold, 'id'>): Promise<ApiResponse<AlertThreshold>> {
    requestCache.invalidatePrefix('alert.');
    return withCB('alert', 'addThreshold',
      async () => {
        const resp = await yycApi.alert.addThreshold(threshold as unknown as Record<string, unknown>);
        if (resp.data?.success && resp.data.data) return ok(resp.data.data as unknown as AlertThreshold);
        throw new Error('Invalid response');
      },
      () => MockApiService.alert.addThreshold(threshold),
    );
  },

  async removeThreshold(id: string): Promise<ApiResponse<boolean>> {
    requestCache.invalidatePrefix('alert.');
    return withCB('alert', 'removeThreshold',
      async () => {
        const resp = await yycApi.alert.removeThreshold(id);
        if (resp.data?.success) return ok(resp.data.data?.result ?? true);
        throw new Error('Remove failed');
      },
      () => MockApiService.alert.removeThreshold(id),
    );
  },

  async markAsRead(id: string): Promise<ApiResponse<boolean>> {
    requestCache.invalidatePrefix('alert.');
    return withCB('alert', 'markAsRead',
      async () => {
        const resp = await yycApi.alert.markAsRead(id);
        if (resp.data?.success) return ok(resp.data.data?.result ?? true);
        throw new Error('Mark failed');
      },
      () => MockApiService.alert.markAsRead(id),
    );
  },

  async markAllAsRead(): Promise<ApiResponse<boolean>> {
    requestCache.invalidatePrefix('alert.');
    return withCB('alert', 'markAllAsRead',
      async () => {
        const resp = await yycApi.alert.markAllAsRead();
        if (resp.data?.success) return ok(resp.data.data?.result ?? true);
        throw new Error('Mark all failed');
      },
      () => MockApiService.alert.markAllAsRead(),
    );
  },
};

// ═══════════════════════════════════════
// §9  Real IArbitrageService (CB-wrapped)
// ═══════════════════════════════════════

const realArbitrageService: IArbitrageService = {
  async getSignals(): Promise<ApiResponse<ArbitrageSignal[]>> {
    return withCBCached('arbitrage', 'getSignals', 'arbitrage.getSignals',
      async () => {
        const resp = await yycApi.arbitrage.getSignals();
        if (resp.data?.success && Array.isArray(resp.data.data)) return ok(resp.data.data as unknown as ArbitrageSignal[]);
        throw new Error('Invalid response');
      },
      () => MockApiService.arbitrage.getSignals(),
    );
  },

  async executeArbitrage(signalId: string): Promise<ApiResponse<{ executed: boolean; pnl: number }>> {
    return withCB('arbitrage', 'executeArbitrage',
      async () => {
        const resp = await yycApi.arbitrage.execute(signalId);
        if (resp.data?.success && resp.data.data) return ok(resp.data.data);
        throw new Error('Execute failed');
      },
      () => MockApiService.arbitrage.executeArbitrage(signalId),
    );
  },
};

// ═══════════════════════════════════════
// §10  Bridge Facade
// ═══════════════════════════════════════

export interface ServiceBridge {
  system: ISystemService;
  trade: ITradeService;
  account: IAccountService;
  strategy: IStrategyService;
  market: IMarketService;
  risk: IRiskService;
  alert: IAlertService;
  arbitrage: IArbitrageService;
  /** Check if real backend is reachable */
  isBackendOnline: () => Promise<boolean>;
  /** Get circuit breaker metrics for all services */
  getCircuitBreakerMetrics: () => CircuitBreakerMetrics[];
  /** Reset all circuit breakers to CLOSED */
  resetCircuitBreakers: () => void;
  /** Get performance snapshot */
  getPerformanceSnapshot: () => ReturnType<typeof perfMonitor.getSnapshot>;
  /** Get request log */
  getRequestLog: (limit?: number) => ReturnType<typeof perfMonitor.getRequestLog>;
  /** Phase 11: Get request cache stats */
  getCacheStats: () => { size: number; keys: string[] };
  /** Phase 11: Clear request cache */
  clearCache: () => void;
  /** Phase 11: Restore CB states from localStorage */
  restoreCBStates: () => number;
  /** Phase 11: withCB exposed for testing */
  _withCB: typeof withCB;
  /** Phase 12: Get auth state */
  getAuthState: () => AuthState;
  /** Phase 12: Get WS channel stats */
  getWSChannelStats: () => WSChannelStats;
}

export const serviceBridge: ServiceBridge = {
  system: realSystemService,
  trade: realTradeService,
  account: realAccountService,
  strategy: realStrategyService,
  market: realMarketService,
  risk: realRiskService,
  alert: realAlertService,
  arbitrage: realArbitrageService,
  async isBackendOnline() {
    try {
      const h = await quickHealthCheck();
      return h.online;
    } catch {
      return false;
    }
  },
  getCircuitBreakerMetrics: getAllCircuitBreakerMetrics,
  resetCircuitBreakers: resetAllCircuitBreakers,
  getPerformanceSnapshot: () => perfMonitor.getSnapshot(),
  getRequestLog: (limit?: number) => perfMonitor.getRequestLog(limit),
  getCacheStats: () => requestCache.getStats(),
  clearCache: () => requestCache.clear(),
  restoreCBStates: restoreCircuitBreakerStates,
  _withCB: withCB,
  getAuthState: () => authManager.authState,
  getWSChannelStats: () => wsChannelManager.stats,
};

// Initialize per-service circuit breakers eagerly so they appear in metrics
const CB_SERVICE_NAMES = ['system', 'trade', 'account', 'strategy', 'market', 'risk', 'alert', 'arbitrage'] as const;
CB_SERVICE_NAMES.forEach(name => getCircuitBreaker(name));

// Restore CB states from localStorage on module load
try { restoreCircuitBreakerStates(); } catch { /* */ }
