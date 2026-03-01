/**
 * YYC-QATS API Route Interfaces & Mock Services
 * ─────────────────────────────────────────────
 * Defines all service interfaces used by the 8 business modules.
 * Each interface has a matching mock implementation that returns
 * realistic data for frontend development & testing without a backend.
 *
 * Architecture:
 *   App  →  interfaces.ts (contract)
 *        →  MockApiService  (sandbox data)
 *        →  Real services when backend is ready
 */

import type {
  MarketAsset,
  StrategyItem,
  Position,
  AccountInfo,
  RiskMetrics,
  SystemMetrics,
  ModelMetrics,
  DataPipelineMetrics,
  TradeRecord,
  Alert,
  AlertThreshold,
  CrossModuleSummary,
  BacktestConfig,
  BacktestResult,
  CandleData,
  KLineInterval,
  AggregatedQuote,
  ArbitrageSignal,
  MultiAccountSummary,
  OrderBookSnapshot,
} from '../types/global';

// ═══════════════════════════════════════
// Generic API Response Envelope
// ═══════════════════════════════════════

export interface ApiResponse<T> {
  code: number;           // HTTP-like status code
  data: T;
  message: string;
  timestamp: number;
  requestId?: string;     // for traceability
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ═══════════════════════════════════════
// §1  Market Service
// ═══════════════════════════════════════

export interface IMarketService {
  /** Get all market assets (or filter by category) */
  getAssets(category?: string): Promise<ApiResponse<MarketAsset[]>>;
  /** Get single ticker for a symbol */
  getTicker(symbol: string): Promise<ApiResponse<MarketAsset>>;
  /** Get historical K-line data */
  getKlines(symbol: string, interval: KLineInterval, limit?: number): Promise<ApiResponse<CandleData[]>>;
  /** Get order book depth */
  getDepth(symbol: string): Promise<ApiResponse<OrderBookSnapshot>>;
  /** Get aggregated multi-exchange quote */
  getAggregatedQuote(symbol: string): Promise<ApiResponse<AggregatedQuote>>;
}

// ═══════════════════════════════════════
// §2  Strategy Service
// ═══════════════════════════════════════

export interface IStrategyService {
  listStrategies(): Promise<ApiResponse<StrategyItem[]>>;
  getStrategy(id: number): Promise<ApiResponse<StrategyItem>>;
  createStrategy(data: Omit<StrategyItem, 'id'>): Promise<ApiResponse<StrategyItem>>;
  updateStrategy(id: number, updates: Partial<StrategyItem>): Promise<ApiResponse<StrategyItem>>;
  deleteStrategy(id: number): Promise<ApiResponse<boolean>>;
  startStrategy(id: number): Promise<ApiResponse<boolean>>;
  pauseStrategy(id: number): Promise<ApiResponse<boolean>>;
  runBacktest(config: BacktestConfig): Promise<ApiResponse<BacktestResult>>;
}

// ═══════════════════════════════════════
// §3  Trade Service
// ═══════════════════════════════════════

export interface OrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'limit' | 'market' | 'stop_limit' | 'oco' | 'trailing_stop';
  price?: number;
  stopPrice?: number;
  quantity: number;
  leverage?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

export interface OrderResult {
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
}

export interface ITradeService {
  placeOrder(order: OrderRequest): Promise<ApiResponse<OrderResult>>;
  cancelOrder(orderId: string): Promise<ApiResponse<boolean>>;
  getOpenOrders(): Promise<ApiResponse<OrderResult[]>>;
  getPositions(): Promise<ApiResponse<Position[]>>;
  closePosition(symbol: string, side: 'LONG' | 'SHORT'): Promise<ApiResponse<boolean>>;
  getTradeHistory(page?: number, pageSize?: number): Promise<PaginatedResponse<TradeRecord>>;
}

// ═══════════════════════════════════════
// §4  Account Service
// ═══════════════════════════════════════

export interface IAccountService {
  getAccountInfo(): Promise<ApiResponse<AccountInfo>>;
  getMultiAccountSummary(): Promise<ApiResponse<MultiAccountSummary>>;
}

// ═══════════════════════════════════════
// §5  Risk Service
// ═══════════════════════════════════════

export interface IRiskService {
  getRiskMetrics(): Promise<ApiResponse<RiskMetrics>>;
  runStressTest(scenario: string): Promise<ApiResponse<{ scenarioName: string; impact: number; details: string }>>;
  getVaRHistory(days?: number): Promise<ApiResponse<Array<{ date: string; var95: number; var99: number }>>>;
}

// ═══════════════════════════════════════
// §6  System / Admin Service
// ═══════════════════════════════════════

export interface ISystemService {
  getSystemMetrics(): Promise<ApiResponse<SystemMetrics>>;
  getCrossModuleSummary(): Promise<ApiResponse<CrossModuleSummary>>;
  getModelMetrics(): Promise<ApiResponse<ModelMetrics>>;
  getPipelineMetrics(): Promise<ApiResponse<DataPipelineMetrics>>;
}

// ═══════════════════════════════════════
// §7  Alert Service
// ═══════════════════════════════════════

export interface IAlertService {
  getAlerts(unreadOnly?: boolean): Promise<ApiResponse<Alert[]>>;
  getThresholds(): Promise<ApiResponse<AlertThreshold[]>>;
  addThreshold(threshold: Omit<AlertThreshold, 'id'>): Promise<ApiResponse<AlertThreshold>>;
  removeThreshold(id: string): Promise<ApiResponse<boolean>>;
  markAsRead(id: string): Promise<ApiResponse<boolean>>;
  markAllAsRead(): Promise<ApiResponse<boolean>>;
}

// ═══════════════════════════════════════
// §8  Arbitrage Service
// ═══════════════════════════════════════

export interface IArbitrageService {
  getSignals(): Promise<ApiResponse<ArbitrageSignal[]>>;
  executeArbitrage(signalId: string): Promise<ApiResponse<{ executed: boolean; pnl: number }>>;
}

// ═══════════════════════════════════════
// Mock Implementation
// ═══════════════════════════════════════

function ok<T>(data: T, message = 'success'): ApiResponse<T> {
  return { code: 200, data, message, timestamp: Date.now(), requestId: `req_${Date.now()}` };
}

const MOCK_ASSET: MarketAsset = {
  symbol: 'BTC/USDT',
  name: 'Bitcoin',
  price: 96231.50,
  change: 2.45,
  volume: '28.5B',
  high24h: 96580,
  low24h: 94920,
  marketCap: '1.91T',
  category: '加密货币',
};

const MOCK_STRATEGY: StrategyItem = {
  id: 1,
  name: '双均线交叉策略',
  type: '趋势跟踪',
  status: 'active',
  winRate: 62.5,
  pnl: '+18.4%',
  sharpe: 1.85,
  maxDD: '-8.2%',
  trades: 156,
  version: 'v3.2',
  linkedModel: 'LSTM价格预测',
};

const MOCK_POSITION: Position = {
  symbol: 'BTC/USDT',
  side: 'LONG',
  quantity: 0.52,
  entryPrice: 94580,
  currentPrice: 96231.50,
  unrealizedPnl: 858.78,
  pnlPercent: 1.75,
  strategy: '双均线交叉策略',
};

const MOCK_ACCOUNT: AccountInfo = {
  totalAssets: 142580.50,
  availableBalance: 78120.30,
  positionValue: 64460.20,
  todayPnl: 2850.80,
  todayPnlPercent: 1.8,
  totalPnl: 26360,
};

const MOCK_RISK: RiskMetrics = {
  portfolioVaR95: -8120,
  portfolioVaR99: -12060,
  totalExposure: 64460.20,
  maxDrawdown: -8.2,
  sharpeRatio: 1.85,
  betaToMarket: 1.12,
  correlationBTC: 0.85,
  leverageRatio: 1.0,
};

const MOCK_SYSTEM: SystemMetrics = {
  cpuUsage: 42,
  memoryUsage: 68,
  networkLatency: 12,
  activeConnections: 3,
  dataFreshness: 0,
  quantumQubits: 72,
  quantumFidelity: 99.2,
  quantumTasks: 5,
};

export const MockApiService = {
  market: {
    getAssets: async (): Promise<ApiResponse<MarketAsset[]>> => ok([MOCK_ASSET]),
    getTicker: async (symbol: string): Promise<ApiResponse<MarketAsset>> =>
      ok({ ...MOCK_ASSET, symbol }),
    getKlines: async (): Promise<ApiResponse<CandleData[]>> =>
      ok(Array.from({ length: 100 }, (_, i) => ({
        time: Date.now() - (100 - i) * 3600000,
        open: 95000 + Math.random() * 2000,
        high: 96000 + Math.random() * 1500,
        low: 94000 + Math.random() * 1500,
        close: 95500 + Math.random() * 2000,
        volume: 100 + Math.random() * 500,
        quoteVolume: 10000000 + Math.random() * 50000000,
      }))),
    getDepth: async (): Promise<ApiResponse<OrderBookSnapshot>> =>
      ok({
        symbol: 'BTC/USDT',
        exchange: 'binance',
        asks: Array.from({ length: 20 }, (_, i) => ({ price: 96300 + i * 10, size: Math.random() * 5, total: 0 })),
        bids: Array.from({ length: 20 }, (_, i) => ({ price: 96200 - i * 10, size: Math.random() * 5, total: 0 })),
        lastUpdateId: Date.now(),
        timestamp: Date.now(),
        mode: 'simulated',
      }),
  } satisfies Partial<IMarketService>,

  strategy: {
    listStrategies: async (): Promise<ApiResponse<StrategyItem[]>> => ok([MOCK_STRATEGY]),
    startStrategy: async (): Promise<ApiResponse<boolean>> => ok(true),
    pauseStrategy: async (): Promise<ApiResponse<boolean>> => ok(true),
  } satisfies Partial<IStrategyService>,

  trade: {
    placeOrder: async (order: OrderRequest): Promise<ApiResponse<OrderResult>> =>
      ok({
        orderId: `ord_${Date.now()}`,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        status: 'FILLED',
        price: order.price || 96200,
        quantity: order.quantity,
        filledQuantity: order.quantity,
        avgFillPrice: order.price || 96200,
        timestamp: Date.now(),
      }),
    getPositions: async (): Promise<ApiResponse<Position[]>> => ok([MOCK_POSITION]),
    getOpenOrders: async (): Promise<ApiResponse<OrderResult[]>> => ok([]),
  } satisfies Partial<ITradeService>,

  account: {
    getAccountInfo: async (): Promise<ApiResponse<AccountInfo>> => ok(MOCK_ACCOUNT),
  } satisfies Partial<IAccountService>,

  risk: {
    getRiskMetrics: async (): Promise<ApiResponse<RiskMetrics>> => ok(MOCK_RISK),
  } satisfies Partial<IRiskService>,

  system: {
    getSystemMetrics: async (): Promise<ApiResponse<SystemMetrics>> => ok(MOCK_SYSTEM),
  } satisfies Partial<ISystemService>,
};
