/**
 * YYC-QATS (言语云量化分析交易系统) — Authoritative Global Type Definitions
 * ─────────────────────────────────────────────────────────────────────────
 * This file is the SINGLE SOURCE OF TRUTH for all cross-module types.
 * Every interface here mirrors the actual runtime implementation in:
 *   - GlobalDataContext.tsx
 *   - AlertContext.tsx
 *   - SettingsContext.tsx
 *   - navigation.tsx
 *   - BinanceService.ts / CoinGeckoService.ts
 *   - BacktestEngine.ts / ExchangeAggregator.ts / BinanceDepthService.ts
 * ─────────────────────────────────────────────────────────────────────────
 */

// ═══════════════════════════════════════
// §1  Navigation & Module System
// ═══════════════════════════════════════

/** All eight primary modules — used for type-safe routing */
export type ModuleId =
  | 'market'
  | 'strategy'
  | 'risk'
  | 'quantum'
  | 'bigdata'
  | 'model'
  | 'trade'
  | 'admin';

export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface MenuItem {
  id: string;
  name: string;
  sub?: string[];
}

/** Pending cross-module navigation payload */
export interface NavigationState {
  module: string;
  sub?: string;
  tertiary?: string;
}

// ═══════════════════════════════════════
// §2  Market Data
// ═══════════════════════════════════════

export type AssetCategory = '加密货币' | '股票' | '期货' | '外汇';

export interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;        // 24h change percent
  volume: string;        // formatted, e.g. "28.5B"
  high24h: number;
  low24h: number;
  marketCap: string;     // formatted, e.g. "1.91T"
  category: AssetCategory;
}

export interface TickerCoin {
  label: string;
  price: string;
  change: string;
  cny: string;
}

/** Raw Binance 24hr ticker data shape */
export interface BinanceTicker {
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'simulated';

// ═══════════════════════════════════════
// §3  Portfolio & Positions
// ═══════════════════════════════════════

export interface Position {
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
}

export interface AccountInfo {
  totalAssets: number;
  availableBalance: number;
  positionValue: number;
  todayPnl: number;
  todayPnlPercent: number;
  totalPnl: number;
}

/** Position fill event — used by TradeModule to create/update positions */
export interface PositionFillEvent {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  fillPrice: number;
  exchange?: string;
  strategy?: string;
}

// ═══════════════════════════════════════
// §4  Strategies
// ═══════════════════════════════════════

export interface StrategyItem {
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
}

// ═══════════════════════════════════════
// §5  Risk Management
// ═══════════════════════════════════════

export interface RiskMetrics {
  portfolioVaR95: number;
  portfolioVaR99: number;
  totalExposure: number;
  maxDrawdown: number;
  sharpeRatio: number;
  betaToMarket: number;
  correlationBTC: number;
  leverageRatio: number;
}

/** Cross-module risk signal (real-time risk channel) */
export type RiskSignalSeverity = 'info' | 'warning' | 'critical';
export type RiskSignalSource = 'strategy' | 'risk' | 'trade' | 'market' | 'system';

export interface RiskSignal {
  id: string;
  timestamp: number;
  source: RiskSignalSource;
  severity: RiskSignalSeverity;
  title: string;
  detail: string;
  symbol?: string;
  value?: number;
  acknowledged: boolean;
}

// ═══════════════════════════════════════
// §6  System & Infrastructure
// ═══════════════════════════════════════

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  activeConnections: number;
  dataFreshness: number;      // seconds since last data update
  quantumQubits: number;
  quantumFidelity: number;
  quantumTasks: number;
}

// ═══════════════════════════════════════
// §7  Model & Data Pipeline
// ═══════════════════════════════════════

export interface ModelMetrics {
  totalModels: number;
  deployedModels: number;
  trainingModels: number;
  avgAccuracy: number;
  bestSharpe: number;
  lastTrainTime: string;
}

export interface DataPipelineMetrics {
  activeSources: number;
  totalSources: number;
  dailyRecords: string;
  totalStorage: string;
  avgLatency: string;
  dataQuality: number;       // percentage 0-100
}

// ═══════════════════════════════════════
// §8  Cross-Module Summary
// ═══════════════════════════════════════

export interface CrossModuleSummary {
  market: { assetCount: number; topMover: string; topMoveChange: number };
  strategy: { activeCount: number; avgWinRate: number; bestPnl: string };
  risk: { riskLevel: 'low' | 'medium' | 'high'; var95: number; alertCount: number };
  quantum: { qubits: number; fidelity: number; activeTasks: number };
  bigdata: { sources: number; quality: number; storage: string };
  model: { deployed: number; training: number; bestAccuracy: number };
  trade: { totalAssets: number; todayPnl: number; openPositions: number };
  admin: { cpuUsage: number; memUsage: number; uptime: string };
}

// ═══════════════════════════════════════
// §9  Trade Records
// ═══════════════════════════════════════

export interface TradeRecord {
  id: string;
  time: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: string;
  quantity: string;
  pnl: string;
  strategy: string;
}

// ═══════════════════════════════════════
// §10  Alert System (AlertContext)
// ═══════════════════════════════════════

export interface Alert {
  id: string;
  type: 'price' | 'volume' | 'technical' | 'system' | 'risk' | 'model';
  symbol: string;
  message: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  source?: string;
}

export type ThresholdMetric =
  | 'price'
  | 'change'
  | 'volume_spike'
  | 'rsi'
  | 'drawdown'
  | 'var'
  | 'cpu'
  | 'latency'
  | 'accuracy';

export interface AlertThreshold {
  id: string;
  symbol: string;
  metric: ThresholdMetric;
  condition: 'above' | 'below';
  value: number;
  enabled: boolean;
  cooldownMs: number;
  lastTriggered?: number;
}

export interface ThresholdCheckData {
  marketPrices: Record<string, number>;
  marketChanges: Record<string, number>;
  marketVolumeSpikes: Record<string, number>;
  marketRSI: Record<string, number>;
  systemCpu: number;
  systemLatency: number;
  riskDrawdown: number;
  riskVar95: number;
  modelAccuracy: number;
}

// ═══════════════════════════════════════
// §11  GlobalDataContext Shape
// ═══════════════════════════════════════

export interface GlobalDataContextType {
  // Market
  marketData: MarketAsset[];
  dataSource: ConnectionStatus;
  getAsset: (symbol: string) => MarketAsset | undefined;
  getAssetsByCategory: (cat: string) => MarketAsset[];
  tickerCoins: TickerCoin[];

  // Unified Favorites / Watchlist (cross-component sync)
  favorites: Set<string>;
  toggleFavorite: (symbol: string) => void;

  // Portfolio & Account
  positions: Position[];
  account: AccountInfo;

  // Strategies
  strategies: StrategyItem[];
  activeStrategies: StrategyItem[];

  // Risk
  riskMetrics: RiskMetrics;

  // System
  systemMetrics: SystemMetrics;

  // Model & Data Pipeline
  modelMetrics: ModelMetrics;
  pipelineMetrics: DataPipelineMetrics;

  // Cross-Module Summary
  crossModuleSummary: CrossModuleSummary;

  // Trade History
  recentTrades: TradeRecord[];

  // Alert counts
  alertCount: number;
  setAlertCount: (n: number) => void;

  // Format Helpers
  formatPrice: (val: number) => string;
  formatUSD: (val: number) => string;
  formatPercent: (val: number) => string;

  // Cross-module navigation hints
  navigateTo: (module: string, sub?: string, tertiary?: string) => void;
  pendingNavigation: NavigationState | null;
  clearNavigation: () => void;

  // Cross-module risk signal channel
  riskSignals: RiskSignal[];
  emitRiskSignal: (signal: Omit<RiskSignal, 'id' | 'timestamp' | 'acknowledged'>) => void;
  acknowledgeSignal: (id: string) => void;
  clearResolvedSignals: () => void;

  // Position mutation functions (order fill → position sync)
  applyFill: (fill: PositionFillEvent) => void;
  closePosition: (symbol: string, side: 'LONG' | 'SHORT') => void;
  reducePosition: (symbol: string, side: 'LONG' | 'SHORT', percent: number) => void;
  appendTradeRecord: (record: Omit<TradeRecord, 'id'>) => void;
}

// ═══════════════════════════════════════
// §12  AlertContext Shape
// ═══════════════════════════════════════

export interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAlerts: () => void;
  thresholds: AlertThreshold[];
  addThreshold: (t: Omit<AlertThreshold, 'id'>) => void;
  updateThreshold: (id: string, updates: Partial<AlertThreshold>) => void;
  removeThreshold: (id: string) => void;
  toggleThreshold: (id: string) => void;
  checkAndTrigger: (data: ThresholdCheckData) => void;
}

// ═══════════════════════════════════════
// §13  SettingsContext Shape
// ═══════════════════════════════════════

export type ColorScheme = 'standard' | 'china';

export interface SettingsContextType {
  language: string;
  setLanguage: (lang: string) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  getUpColor: () => string;
  getDownColor: () => string;
  getChangeColorClass: (change: number | string) => string;
  getChangeBgClass: (change: number | string) => string;
}

// ═══════════════════════════════════════
// §14  Backtest Engine Types
// ═══════════════════════════════════════

export type StrategyType = 'ma_cross' | 'rsi_bounce' | 'macd_divergence' | 'bollinger_breakout';

export interface StrategyParams {
  type: StrategyType;
  fastPeriod?: number;
  slowPeriod?: number;
  rsiPeriod?: number;
  rsiOversold?: number;
  rsiOverbought?: number;
  bollPeriod?: number;
  bollStdDev?: number;
  stopLoss?: number;
  takeProfit?: number;
  positionSize?: number;
}

export interface BacktestConfig {
  symbol: string;
  interval: string;
  lookbackDays: number;
  initialCapital: number;
  strategy: StrategyParams;
  commission?: number;
  slippage?: number;
}

export interface BacktestTrade {
  entryTime: number;
  exitTime: number;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  reason: string;
}

export interface BacktestResult {
  config: BacktestConfig;
  trades: BacktestTrade[];
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
}

// ═══════════════════════════════════════
// §15  Exchange Aggregator Types
// ═══════════════════════════════════════

export interface ExchangeQuote {
  exchange: string;
  bestBid: number;
  bestAsk: number;
  bidSize: number;
  askSize: number;
  latency: number;
  status: 'online' | 'degraded' | 'offline';
  lastUpdate: number;
  fee: number;
}

export interface AggregatedQuote {
  symbol: string;
  bestBid: { price: number; exchange: string; size: number };
  bestAsk: { price: number; exchange: string; size: number };
  spread: number;
  spreadBps: number;
  exchanges: ExchangeQuote[];
}

export interface ArbitrageSignal {
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
}

export interface LiquidationRule {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  triggerCondition: 'pnl_percent' | 'price_level' | 'drawdown';
  triggerValue: number;
  action: 'close_full' | 'close_partial' | 'hedge';
  partialPercent?: number;
  enabled: boolean;
}

export interface LiquidationEvent {
  id: string;
  timestamp: number;
  ruleId: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  action: string;
  quantity: number;
  price: number;
  pnl: number;
}

export interface HedgeRule {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  hedgeSymbol: string;
  hedgeRatio: number;
  triggerDrawdown: number;
  enabled: boolean;
}

export interface HedgeExecution {
  id: string;
  timestamp: number;
  ruleId: string;
  hedgeSymbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
}

export interface MultiAccountSummary {
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
}

// ═══════════════════════════════════════
// §16  Depth (Order Book) Types
// ═══════════════════════════════════════

export interface DepthLevel {
  price: number;
  size: number;
  total: number;
}

export interface OrderBookSnapshot {
  symbol: string;
  exchange: string;
  asks: DepthLevel[];
  bids: DepthLevel[];
  lastUpdateId: number;
  timestamp: number;
  mode: 'snapshot' | 'incremental' | 'simulated';
}

export type DepthConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'simulated' | 'error';

// ═══════════════════════════════════════
// §17  K-Line / Candlestick Types
// ═══════════════════════════════════════

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  quoteVolume: number;
}

export type KLineInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

// ═══════════════════════════════════════
// §18  Analytics Types
// ═══════════════════════════════════════

export type AnalyticsEventType =
  | 'module_view'
  | 'sub_view'
  | 'tertiary_view'
  | 'cross_nav'
  | 'feature_use'
  | 'kline_interact'
  | 'watchlist_action'
  | 'alert_trigger'
  | 'data_source';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  module?: string;
  detail?: string;
  timestamp: number;
  sessionId: string;
}

// ═══════════════════════════════════════
// §19  CoinGecko Service Types
// ═══════════════════════════════════════

export interface CoinGeckoAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  rank: number;
  image: string;
}

export interface NormalizedAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  high24h: number;
  low24h: number;
  marketCap: string;
  category: '加密货币';
}
