/**
 * @file src/app/api/yyc-api.ts
 * @description YYC3 API v3.0服务层,提供所有后端端点的类型化封装,包括健康检查、设备管理、LLM聊天和WebSocket实时通道
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-20
 * @updated 2026-03-20
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags api,typescript,service,critical,public
 * @depends @/app/api/client
 */

/**
 * YYC³ API v3.0 Service Layer
 * ────────────────────────────
 * Maps to deployed backend (一主二备 architecture).
 * Provides typed wrappers around all v3.0 endpoints:
 *   - Health & System Status
 *   - Device Management (3 nodes)
 *   - LLM Chat (7 providers)
 *   - WebSocket real-time channels
 *
 * Usage:
 *   import { yycApi } from '@/app/api/yyc-api';
 *   const health = await yycApi.health.check();
 *   const devices = await yycApi.devices.list();
 */

import { httpGet, httpPost, httpRequest, type HttpResponse } from './client';

// ═══════════════════════════════════════
// §1  Response Types
// ═══════════════════════════════════════

export interface HealthResponse {
  status: 'ok' | 'error';
  service: string;
  server: string;
  version: string;
  port: string;
  websocket: string;
  email: string;
}

export interface SystemStatusResponse {
  status: string;
  uptime: number;
  memory: { total: number; used: number; free: number };
  cpu: { usage: number; cores: number };
  connections: number;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'storage' | 'compute';
  host: string;
  port: number;
  status: 'online' | 'offline' | 'maintenance';
}

export interface DeviceListResponse {
  success: boolean;
  data: DeviceInfo[];
}

export interface DeviceControlResponse {
  success: boolean;
  result: {
    deviceId: string;
    action: string;
    status: string;
    message: string;
  };
}

export interface DeviceStatusResponse {
  success: boolean;
  data: {
    id: string;
    status: string;
    cpu?: number;
    memory?: number;
    uptime?: number;
    lastCheck: number;
  };
}

export interface LLMProvider {
  id: string;
  name: string;
  status: 'active' | 'placeholder' | 'auto';
  models?: string[];
}

export interface LLMProvidersResponse {
  success: boolean;
  providers: LLMProvider[];
}

export interface LLMChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMChatRequest {
  messages: LLMChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface LLMChatResponse {
  success: boolean;
  provider: string;
  model: string;
  message: {
    role: 'assistant';
    content: string;
  };
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OllamaModel {
  name: string;
  size: string;
  modified_at: string;
}

export interface OllamaModelsResponse {
  success: boolean;
  models: OllamaModel[];
}

export interface WSClientsResponse {
  success: boolean;
  count: number;
  clients: Array<{
    id: string;
    ip: string;
    connectedAt: number;
    channels: string[];
  }>;
}

export interface ModelListResponse {
  success: boolean;
  models: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
  }>;
}

// ─── Trade API Types ───

export interface TradeOrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'limit' | 'market' | 'stop_limit' | 'oco' | 'trailing_stop';
  price?: number;
  stopPrice?: number;
  quantity: number;
  leverage?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

export interface TradeOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    type: string;
    status: 'NEW' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED';
    price: number;
    quantity: number;
    filledQuantity: number;
    avgFillPrice: number;
    timestamp: number;
  };
}

export interface TradeOpenOrdersResponse {
  success: boolean;
  data: Array<{
    orderId: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    type: string;
    status: 'NEW' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED';
    price: number;
    quantity: number;
    filledQuantity: number;
    avgFillPrice: number;
    timestamp: number;
  }>;
}

export interface TradePositionsResponse {
  success: boolean;
  data: Array<{
    symbol: string;
    side: 'LONG' | 'SHORT';
    quantity: number;
    entryPrice: number;
    currentPrice: number;
    unrealizedPnl: number;
    pnlPercent: number;
    strategy: string;
    exchange?: string;
    openTime?: number;
    leverage?: number;
  }>;
}

export interface TradeHistoryResponse {
  success: boolean;
  data: Array<{
    id: string;
    time: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    price: string;
    quantity: string;
    pnl: string;
    strategy: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface TradeCancelResponse {
  success: boolean;
  data: { orderId: string; cancelled: boolean };
}

export interface TradeClosePositionResponse {
  success: boolean;
  data: { symbol: string; side: string; closed: boolean };
}

// ─── Account API Types ───

export interface AccountInfoResponse {
  success: boolean;
  data: {
    totalAssets: number;
    availableBalance: number;
    positionValue: number;
    todayPnl: number;
    todayPnlPercent: number;
    totalPnl: number;
  };
}

export interface MultiAccountResponse {
  success: boolean;
  data: {
    accounts: Array<{
      exchange: string;
      totalBalance: number;
      availableBalance: number;
      unrealizedPnl: number;
      marginUsage: number;
      positions: number;
    }>;
    totalValue: number;
    totalPnl: number;
  };
}

// ─── Strategy API Types ───

export interface StrategyListResponse {
  success: boolean;
  data: Array<{
    id: number;
    name: string;
    type: string;
    status: 'active' | 'paused' | 'testing';
    winRate: number;
    pnl: string;
    sharpe: number;
    maxDD: string;
    trades: number;
    version: string;
    linkedModel?: string;
  }>;
}

export interface StrategyDetailResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    type: string;
    status: 'active' | 'paused' | 'testing';
    winRate: number;
    pnl: string;
    sharpe: number;
    maxDD: string;
    trades: number;
    version: string;
    linkedModel?: string;
  };
}

export interface StrategyActionResponse {
  success: boolean;
  data: { id: number; action: string; result: boolean };
}

export interface BacktestRunResponse {
  success: boolean;
  data: {
    trades: Array<{
      entryTime: number;
      exitTime: number;
      side: 'LONG' | 'SHORT';
      entryPrice: number;
      exitPrice: number;
      quantity: number;
      pnl: number;
      pnlPercent: number;
      reason: string;
    }>;
    equityCurve: Array<{ time: number; equity: number }>;
    stats: {
      totalReturn: number;
      annualizedReturn: number;
      sharpeRatio: number;
      maxDrawdown: number;
      winRate: number;
      profitFactor: number;
      totalTrades: number;
      avgWin: number;
      avgLoss: number;
      bestTrade: number;
      worstTrade: number;
      avgHoldingPeriod: string;
    };
  };
}

// ─── Market API Types ───

export interface MarketTickerResponse {
  success: boolean;
  data: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    volume: string;
    high24h: number;
    low24h: number;
    marketCap: string;
    category: string;
  };
}

export interface MarketAssetsResponse {
  success: boolean;
  data: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    volume: string;
    high24h: number;
    low24h: number;
    marketCap: string;
    category: string;
  }>;
}

export interface MarketKlinesResponse {
  success: boolean;
  data: Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    quoteVolume: number;
  }>;
}

export interface MarketDepthResponse {
  success: boolean;
  data: {
    symbol: string;
    exchange: string;
    asks: Array<{ price: number; size: number; total: number }>;
    bids: Array<{ price: number; size: number; total: number }>;
    lastUpdateId: number;
    timestamp: number;
    mode: string;
  };
}

export interface MarketAggQuoteResponse {
  success: boolean;
  data: {
    symbol: string;
    bestBid: { price: number; exchange: string; size: number };
    bestAsk: { price: number; exchange: string; size: number };
    spread: number;
    spreadBps: number;
    exchanges: Array<{
      exchange: string;
      bestBid: number;
      bestAsk: number;
      bidSize: number;
      askSize: number;
      latency: number;
      status: string;
      lastUpdate: number;
      fee: number;
    }>;
  };
}

// ─── Risk API Types ───

export interface RiskMetricsResponse {
  success: boolean;
  data: {
    portfolioVaR95: number;
    portfolioVaR99: number;
    totalExposure: number;
    maxDrawdown: number;
    sharpeRatio: number;
    betaToMarket: number;
    correlationBTC: number;
    leverageRatio: number;
  };
}

export interface RiskStressTestResponse {
  success: boolean;
  data: {
    scenarioName: string;
    impact: number;
    details: string;
  };
}

export interface RiskVaRHistoryResponse {
  success: boolean;
  data: Array<{
    date: string;
    var95: number;
    var99: number;
  }>;
}

// ─── Alert API Types ───

export interface AlertListResponse {
  success: boolean;
  data: Array<{
    id: string;
    type: string;
    symbol: string;
    message: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'critical';
    read: boolean;
    source?: string;
  }>;
}

export interface AlertThresholdListResponse {
  success: boolean;
  data: Array<{
    id: string;
    symbol: string;
    metric: string;
    condition: 'above' | 'below';
    value: number;
    enabled: boolean;
    cooldownMs: number;
    lastTriggered?: number;
  }>;
}

export interface AlertThresholdResponse {
  success: boolean;
  data: {
    id: string;
    symbol: string;
    metric: string;
    condition: 'above' | 'below';
    value: number;
    enabled: boolean;
    cooldownMs: number;
  };
}

export interface AlertActionResponse {
  success: boolean;
  data: { result: boolean };
}

// ─── Arbitrage API Types ───

export interface ArbitrageSignalsResponse {
  success: boolean;
  data: Array<{
    id: string;
    timestamp: number;
    symbol: string;
    buyExchange: string;
    sellExchange: string;
    buyPrice: number;
    sellPrice: number;
    spreadBps: number;
    estimatedProfit: number;
    status: 'detected' | 'executing' | 'completed' | 'expired';
  }>;
}

export interface ArbitrageExecuteResponse {
  success: boolean;
  data: {
    executed: boolean;
    pnl: number;
  };
}

// ═══════════════════════════════════════
// §2  API Service Object
// ═══════════════════════════════════════

export const yycApi = {
  // ─── Health & System ───
  health: {
    /** GET /health */
    check: () => httpGet<HealthResponse>('/health'),

    /** GET /api/v1/status */
    systemStatus: () => httpGet<SystemStatusResponse>('/api/v1/status'),

    /** GET /api/v1/models */
    modelList: () => httpGet<ModelListResponse>('/api/v1/models'),
  },

  // ─── Device Management ───
  devices: {
    /** GET /api/v1/devices */
    list: () => httpGet<DeviceListResponse>('/api/v1/devices'),

    /** GET /api/v1/devices/:id */
    detail: (id: string) => httpGet<DeviceInfo>(`/api/v1/devices/${id}`),

    /** POST /api/v1/devices/:id/control */
    control: (id: string, action: string, params: Record<string, unknown> = {}) =>
      httpPost<DeviceControlResponse>(`/api/v1/devices/${id}/control`, { action, params }),

    /** GET /api/v1/devices/:id/status */
    status: (id: string) => httpGet<DeviceStatusResponse>(`/api/v1/devices/${id}/status`),
  },

  // ─── LLM API ───
  llm: {
    /** GET /api/v1/llm/providers */
    providers: () => httpGet<LLMProvidersResponse>('/api/v1/llm/providers'),

    /** GET /api/v1/llm/ollama/models */
    ollamaModels: () => httpGet<OllamaModelsResponse>('/api/v1/llm/ollama/models'),

    /** POST /api/v1/llm/:provider/chat */
    chat: (provider: string, request: LLMChatRequest) =>
      httpPost<LLMChatResponse>(`/api/v1/llm/${provider}/chat`, request),
  },

  // ─── WebSocket Clients ───
  ws: {
    /** GET /api/v1/ws/clients */
    clients: () => httpGet<WSClientsResponse>('/api/v1/ws/clients'),
  },

  // ─── Trade API ───
  trade: {
    /** POST /api/v1/trade/order — 提交订单 */
    placeOrder: (order: TradeOrderRequest) =>
      httpPost<TradeOrderResponse>('/api/v1/trade/order', order),

    /** DELETE /api/v1/trade/order/:id — 取消订单 */
    cancelOrder: (orderId: string) =>
      httpRequest<TradeCancelResponse>(`/api/v1/trade/order/${orderId}`, { method: 'DELETE' }),

    /** GET /api/v1/trade/orders/open — 当前挂单 */
    getOpenOrders: () => httpGet<TradeOpenOrdersResponse>('/api/v1/trade/orders/open'),

    /** GET /api/v1/trade/positions — 持仓列表 */
    getPositions: () => httpGet<TradePositionsResponse>('/api/v1/trade/positions'),

    /** POST /api/v1/trade/position/close — 平仓 */
    closePosition: (symbol: string, side: 'LONG' | 'SHORT') =>
      httpPost<TradeClosePositionResponse>('/api/v1/trade/position/close', { symbol, side }),

    /** GET /api/v1/trade/history — 交易历史 */
    getHistory: (page = 1, pageSize = 20) =>
      httpGet<TradeHistoryResponse>(`/api/v1/trade/history?page=${page}&pageSize=${pageSize}`),
  },

  // ─── Account API ───
  account: {
    /** GET /api/v1/account/info — 账户概览 */
    getInfo: () => httpGet<AccountInfoResponse>('/api/v1/account/info'),

    /** GET /api/v1/account/multi — 多账户汇总 */
    getMultiSummary: () => httpGet<MultiAccountResponse>('/api/v1/account/multi'),
  },

  // ─── Strategy API ───
  strategy: {
    /** GET /api/v1/strategy/list — 策略列表 */
    list: () => httpGet<StrategyListResponse>('/api/v1/strategy/list'),

    /** GET /api/v1/strategy/:id — 策略详情 */
    detail: (id: number) => httpGet<StrategyDetailResponse>(`/api/v1/strategy/${id}`),

    /** POST /api/v1/strategy — 创建策略 */
    create: (data: Record<string, unknown>) =>
      httpPost<StrategyDetailResponse>('/api/v1/strategy', data),

    /** PUT /api/v1/strategy/:id — 更新策略 */
    update: (id: number, updates: Record<string, unknown>) =>
      httpRequest<StrategyDetailResponse>(`/api/v1/strategy/${id}`, { method: 'PUT', body: updates }),

    /** DELETE /api/v1/strategy/:id — 删除策略 */
    remove: (id: number) =>
      httpRequest<StrategyActionResponse>(`/api/v1/strategy/${id}`, { method: 'DELETE' }),

    /** POST /api/v1/strategy/:id/start — 启动策略 */
    start: (id: number) =>
      httpPost<StrategyActionResponse>(`/api/v1/strategy/${id}/start`),

    /** POST /api/v1/strategy/:id/pause — 暂停策略 */
    pause: (id: number) =>
      httpPost<StrategyActionResponse>(`/api/v1/strategy/${id}/pause`),

    /** POST /api/v1/strategy/backtest — 运行回测 */
    runBacktest: (config: Record<string, unknown>) =>
      httpPost<BacktestRunResponse>('/api/v1/strategy/backtest', config),
  },

  // ─── Market API ───
  market: {
    /** GET /api/v1/market/assets — 获取所有市场资产 */
    getAssets: (category?: string) =>
      httpGet<MarketAssetsResponse>(category ? `/api/v1/market/assets?category=${encodeURIComponent(category)}` : '/api/v1/market/assets'),

    /** GET /api/v1/market/ticker/:symbol — 获取单个行情 */
    getTicker: (symbol: string) =>
      httpGet<MarketTickerResponse>(`/api/v1/market/ticker/${encodeURIComponent(symbol)}`),

    /** GET /api/v1/market/klines — 获取K线数据 */
    getKlines: (symbol: string, interval: string, limit = 200) =>
      httpGet<MarketKlinesResponse>(`/api/v1/market/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`),

    /** GET /api/v1/market/depth/:symbol — 获取深度数据 */
    getDepth: (symbol: string) =>
      httpGet<MarketDepthResponse>(`/api/v1/market/depth/${encodeURIComponent(symbol)}`),

    /** GET /api/v1/market/quote/:symbol — 获取聚合报价 */
    getAggregatedQuote: (symbol: string) =>
      httpGet<MarketAggQuoteResponse>(`/api/v1/market/quote/${encodeURIComponent(symbol)}`),
  },

  // ─── Risk API ───
  risk: {
    /** GET /api/v1/risk/metrics — 风控指标 */
    getMetrics: () => httpGet<RiskMetricsResponse>('/api/v1/risk/metrics'),

    /** POST /api/v1/risk/stress-test — 压力测试 */
    runStressTest: (scenario: string) =>
      httpPost<RiskStressTestResponse>('/api/v1/risk/stress-test', { scenario }),

    /** GET /api/v1/risk/var-history — VaR历史 */
    getVaRHistory: (days = 30) =>
      httpGet<RiskVaRHistoryResponse>(`/api/v1/risk/var-history?days=${days}`),
  },

  // ─── Alert API ───
  alert: {
    /** GET /api/v1/alert/list — 获取告警列表 */
    getAlerts: (unreadOnly = false) =>
      httpGet<AlertListResponse>(`/api/v1/alert/list?unreadOnly=${unreadOnly}`),

    /** GET /api/v1/alert/thresholds — 获取阈值列表 */
    getThresholds: () => httpGet<AlertThresholdListResponse>('/api/v1/alert/thresholds'),

    /** POST /api/v1/alert/threshold — 添加阈值 */
    addThreshold: (threshold: Record<string, unknown>) =>
      httpPost<AlertThresholdResponse>('/api/v1/alert/threshold', threshold),

    /** DELETE /api/v1/alert/threshold/:id — 删除阈值 */
    removeThreshold: (id: string) =>
      httpRequest<AlertActionResponse>(`/api/v1/alert/threshold/${id}`, { method: 'DELETE' }),

    /** POST /api/v1/alert/:id/read — 标记已读 */
    markAsRead: (id: string) =>
      httpPost<AlertActionResponse>(`/api/v1/alert/${id}/read`),

    /** POST /api/v1/alert/read-all — 全部标记已读 */
    markAllAsRead: () =>
      httpPost<AlertActionResponse>('/api/v1/alert/read-all'),
  },

  // ─── Arbitrage API ───
  arbitrage: {
    /** GET /api/v1/arbitrage/signals — 获取套利信号 */
    getSignals: () => httpGet<ArbitrageSignalsResponse>('/api/v1/arbitrage/signals'),

    /** POST /api/v1/arbitrage/execute — 执行套利 */
    execute: (signalId: string) =>
      httpPost<ArbitrageExecuteResponse>('/api/v1/arbitrage/execute', { signalId }),
  },
};

// ═══════════════════════════════════════
// §3  Connection Test Utility
// ═══════════════════════════════════════

export interface ConnectionTestResult {
  name: string;
  endpoint: string;
  success: boolean;
  status: string;
  latency: number;
  error?: string;
  data?: unknown;
}

/**
 * Run connectivity tests against all major endpoints.
 * Returns results for each test — useful for the admin diagnostics panel.
 */
export async function runConnectionTests(): Promise<ConnectionTestResult[]> {
  const tests: Array<{ name: string; fn: () => Promise<HttpResponse> }> = [
    { name: '/health', fn: () => yycApi.health.check() },
    { name: '/api/v1/status', fn: () => yycApi.health.systemStatus() },
    { name: '/api/v1/devices', fn: () => yycApi.devices.list() },
    { name: '/api/v1/llm/providers', fn: () => yycApi.llm.providers() },
    { name: '/api/v1/ws/clients', fn: () => yycApi.ws.clients() },
  ];

  const results: ConnectionTestResult[] = [];

  for (const test of tests) {
    const start = performance.now();
    try {
      const resp = await test.fn();
      results.push({
        name: test.name,
        endpoint: test.name,
        success: true,
        status: 'OK',
        latency: resp.latency,
        data: resp.data,
      });
    } catch (err: any) {
      results.push({
        name: test.name,
        endpoint: test.name,
        success: false,
        status: 'FAILED',
        latency: Math.round(performance.now() - start),
        error: err?.message || String(err),
      });
    }
  }

  return results;
}

// ═══════════════════════════════════════
// §4  Quick Health Check (for status bar)
// ═══════════════════════════════════════

export interface QuickHealthResult {
  online: boolean;
  server: string;
  version: string;
  latency: number;
  wsEnabled: boolean;
}

export async function quickHealthCheck(): Promise<QuickHealthResult> {
  try {
    const resp = await yycApi.health.check();
    const d = resp.data;
    return {
      online: d.status === 'ok',
      server: d.server || 'unknown',
      version: d.version || 'unknown',
      latency: resp.latency,
      wsEnabled: d.websocket === 'enabled',
    };
  } catch {
    return {
      online: false,
      server: 'unreachable',
      version: '-',
      latency: -1,
      wsEnabled: false,
    };
  }
}
