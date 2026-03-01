import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  getBinanceService, destroyBinanceService, BinanceService,
  type BinanceTicker, type ConnectionStatus 
} from '@/app/services/BinanceService';
import { getCoinGeckoService } from '@/app/services/CoinGeckoService';

// ==============================
// Shared Types
// ==============================
export interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;      // percentage
  volume: string;
  high24h: number;
  low24h: number;
  marketCap: string;
  category: '加密货币' | '股票' | '期货' | '外汇';
}

export interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  pnlPercent: number;
  strategy: string;
  exchange?: string;       // originating exchange
  openTime?: number;       // timestamp of position open
  leverage?: number;       // leverage ratio
}

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

export interface AccountInfo {
  totalAssets: number;
  availableBalance: number;
  positionValue: number;
  todayPnl: number;
  todayPnlPercent: number;
  totalPnl: number;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  activeConnections: number;
  dataFreshness: number; // seconds
  quantumQubits: number;
  quantumFidelity: number;
  quantumTasks: number;
}

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
  dataQuality: number; // percentage
}

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

// Cross-module risk signal channel
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

// Position fill event — used by TradeModule to update positions
export interface PositionFillEvent {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  fillPrice: number;
  exchange?: string;
  strategy?: string;
}

// ==============================
// Initial Data
// ==============================
const INITIAL_MARKET: MarketAsset[] = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', price: 96231.50, change: 2.45, volume: '28.5B', high24h: 96580, low24h: 94920, marketCap: '1.91T', category: '加密货币' },
  { symbol: 'ETH/USDT', name: 'Ethereum', price: 2451.20, change: -0.12, volume: '12.8B', high24h: 2480, low24h: 2420, marketCap: '294B', category: '加密货币' },
  { symbol: 'SOL/USDT', name: 'Solana', price: 142.85, change: 5.10, volume: '4.2B', high24h: 145, low24h: 135.50, marketCap: '65B', category: '加密货币' },
  { symbol: 'BNB/USDT', name: 'BNB', price: 582.40, change: 1.15, volume: '1.8B', high24h: 588, low24h: 575, marketCap: '87B', category: '加密货币' },
  { symbol: 'XRP/USDT', name: 'Ripple', price: 1.05, change: -2.30, volume: '2.1B', high24h: 1.09, low24h: 1.02, marketCap: '58B', category: '加密货币' },
  { symbol: 'ADA/USDT', name: 'Cardano', price: 0.45, change: 0.85, volume: '850M', high24h: 0.46, low24h: 0.44, marketCap: '16B', category: '加密货币' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 1.25, volume: '52M', high24h: 187.50, low24h: 184.20, marketCap: '2.87T', category: '股票' },
  { symbol: 'MSFT', name: 'Microsoft', price: 402.56, change: 0.85, volume: '28M', high24h: 405, low24h: 400, marketCap: '3.01T', category: '股票' },
  { symbol: 'NVDA', name: 'NVIDIA', price: 610.35, change: 2.45, volume: '45M', high24h: 618, low24h: 598, marketCap: '1.52T', category: '股票' },
  { symbol: 'GC', name: 'Gold Futures', price: 2045.30, change: 0.15, volume: '320K', high24h: 2052, low24h: 2038, marketCap: '-', category: '期货' },
  { symbol: 'CL', name: 'Crude Oil', price: 76.85, change: -0.25, volume: '450K', high24h: 77.50, low24h: 76.10, marketCap: '-', category: '期货' },
  { symbol: 'EUR/USD', name: 'Euro/Dollar', price: 1.0842, change: 0.08, volume: '180B', high24h: 1.0855, low24h: 1.0825, marketCap: '-', category: '外汇' },
];

const INITIAL_POSITIONS: Position[] = [
  { symbol: 'BTC/USDT', side: 'LONG', quantity: 0.52, entryPrice: 94580, currentPrice: 96231.50, unrealizedPnl: 858.78, pnlPercent: 1.75, strategy: '双均线交叉策略' },
  { symbol: 'ETH/USDT', side: 'LONG', quantity: 14.5, entryPrice: 2380, currentPrice: 2451.20, unrealizedPnl: 1032.40, pnlPercent: 2.99, strategy: 'RSI超卖反弹策略' },
  { symbol: 'SOL/USDT', side: 'LONG', quantity: 150, entryPrice: 138.50, currentPrice: 142.85, unrealizedPnl: 652.50, pnlPercent: 3.14, strategy: 'MACD背离策略' },
];

const INITIAL_STRATEGIES: StrategyItem[] = [
  { id: 1, name: '双均线交叉策略', type: '趋势跟踪', status: 'active', winRate: 62.5, pnl: '+18.4%', sharpe: 1.85, maxDD: '-8.2%', trades: 156, version: 'v3.2', linkedModel: 'LSTM价格预测' },
  { id: 2, name: 'RSI超卖反弹策略', type: '均值回归', status: 'active', winRate: 58.3, pnl: '+12.1%', sharpe: 1.42, maxDD: '-6.5%', trades: 89, version: 'v2.1', linkedModel: 'GRU情绪分析' },
  { id: 3, name: '布林带突破策略', type: '波动率', status: 'paused', winRate: 55.8, pnl: '+8.7%', sharpe: 1.15, maxDD: '-11.3%', trades: 234, version: 'v1.8' },
  { id: 4, name: 'MACD背离策略', type: '趋势跟踪', status: 'active', winRate: 61.2, pnl: '+15.6%', sharpe: 1.68, maxDD: '-7.1%', trades: 112, version: 'v2.5', linkedModel: 'Transformer多因子' },
  { id: 5, name: '量子增强Alpha策略', type: 'AI增强', status: 'testing', winRate: 67.8, pnl: '+24.2%', sharpe: 2.15, maxDD: '-5.8%', trades: 45, version: 'v1.0', linkedModel: '量子-经典混合模型' },
  { id: 6, name: '网格交易策略', type: '套利', status: 'active', winRate: 72.1, pnl: '+9.5%', sharpe: 1.92, maxDD: '-3.2%', trades: 523, version: 'v4.0' },
];

const INITIAL_ACCOUNT: AccountInfo = {
  totalAssets: 142580.50,
  availableBalance: 78120.30,
  positionValue: 64460.20,
  todayPnl: 2850.80,
  todayPnlPercent: 1.8,
  totalPnl: 26360,
};

const INITIAL_RISK: RiskMetrics = {
  portfolioVaR95: -8120,
  portfolioVaR99: -12060,
  totalExposure: 64460.20,
  maxDrawdown: -8.2,
  sharpeRatio: 1.85,
  betaToMarket: 1.12,
  correlationBTC: 0.85,
  leverageRatio: 1.0,
};

const INITIAL_SYSTEM: SystemMetrics = {
  cpuUsage: 42,
  memoryUsage: 68,
  networkLatency: 12,
  activeConnections: 3,
  dataFreshness: 0,
  quantumQubits: 72,
  quantumFidelity: 99.2,
  quantumTasks: 5,
};

const INITIAL_MODEL_METRICS: ModelMetrics = {
  totalModels: 6,
  deployedModels: 4,
  trainingModels: 1,
  avgAccuracy: 80.8,
  bestSharpe: 2.12,
  lastTrainTime: '2小时前',
};

const INITIAL_PIPELINE_METRICS: DataPipelineMetrics = {
  activeSources: 4,
  totalSources: 5,
  dailyRecords: '26.7M',
  totalStorage: '2.8 TB',
  avgLatency: '< 150ms',
  dataQuality: 97.5,
};

const INITIAL_TRADES: TradeRecord[] = [
  { id: 't1', time: '14:32:15', symbol: 'BTC/USDT', side: 'BUY', price: '96,200.00', quantity: '0.05', pnl: '+$245.80', strategy: '双均线交叉策略' },
  { id: 't2', time: '14:28:05', symbol: 'ETH/USDT', side: 'SELL', price: '2,460.00', quantity: '2.0', pnl: '+$182.30', strategy: 'RSI超卖反弹策略' },
  { id: 't3', time: '14:15:22', symbol: 'SOL/USDT', side: 'BUY', price: '140.00', quantity: '50', pnl: '-$95.60', strategy: 'MACD背离策略' },
  { id: 't4', time: '13:58:40', symbol: 'BNB/USDT', side: 'BUY', price: '580.00', quantity: '5', pnl: '+$512.40', strategy: '网格交易策略' },
  { id: 't5', time: '13:42:18', symbol: 'BTC/USDT', side: 'SELL', price: '97,000.00', quantity: '0.02', pnl: '+$328.90', strategy: '双均线交策略' },
];

// ==============================
// Context Type
// ==============================
interface GlobalDataContextType {
  // Market
  marketData: MarketAsset[];
  dataSource: ConnectionStatus; // 'connected' = Binance live | 'simulated' = fallback
  getAsset: (symbol: string) => MarketAsset | undefined;
  getAssetsByCategory: (cat: string) => MarketAsset[];
  tickerCoins: { label: string; price: string; change: string; cny: string }[];

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
  pendingNavigation: { module: string; sub?: string; tertiary?: string } | null;
  clearNavigation: () => void;

  // Cross-module risk signal channel
  riskSignals: RiskSignal[];
  emitRiskSignal: (signal: Omit<RiskSignal, 'id' | 'timestamp' | 'acknowledged'>) => void;
  acknowledgeSignal: (id: string) => void;
  clearResolvedSignals: () => void;

  // Position mutation functions (for order fill → position sync)
  applyFill: (fill: PositionFillEvent) => void;
  closePosition: (symbol: string, side: 'LONG' | 'SHORT') => void;
  reducePosition: (symbol: string, side: 'LONG' | 'SHORT', percent: number) => void;
  appendTradeRecord: (record: Omit<TradeRecord, 'id'>) => void;
}

// Preserve context identity across HMR to prevent
// "useGlobalData must be used within GlobalDataProvider" errors.
// During Vite hot-reload, createContext() would produce a NEW object,
// but the already-mounted Provider still references the OLD one.
const HMR_CTX_KEY = '__YYC_GlobalDataContext__';
const GlobalDataContext: React.Context<GlobalDataContextType | undefined> =
  (globalThis as any)[HMR_CTX_KEY] ||
  ((globalThis as any)[HMR_CTX_KEY] = createContext<GlobalDataContextType | undefined>(undefined));

// ==============================
// Provider
// ==============================
export const GlobalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [marketData, setMarketData] = useState<MarketAsset[]>(INITIAL_MARKET);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [account, setAccount] = useState<AccountInfo>(INITIAL_ACCOUNT);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>(INITIAL_RISK);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>(INITIAL_SYSTEM);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics>(INITIAL_MODEL_METRICS);
  const [pipelineMetrics, setPipelineMetrics] = useState<DataPipelineMetrics>(INITIAL_PIPELINE_METRICS);
  const [strategies] = useState<StrategyItem[]>(INITIAL_STRATEGIES);
  const [recentTrades, setRecentTrades] = useState<TradeRecord[]>(INITIAL_TRADES);
  const [pendingNavigation, setPendingNavigation] = useState<{ module: string; sub?: string; tertiary?: string } | null>(null);
  const [alertCount, setAlertCount] = useState(2);
  const [dataSource, setDataSource] = useState<ConnectionStatus>('connecting');
  const binanceLiveRef = useRef<Map<string, BinanceTicker>>(new Map());

  // ── Cross-module Risk Signal Channel ──
  const [riskSignals, setRiskSignals] = useState<RiskSignal[]>([
    { id: 'init_1', timestamp: Date.now() - 120_000, source: 'risk', severity: 'warning', title: '组合VaR接近阈值', detail: 'VaR(95%) 已达到日度限额的 85%', acknowledged: false },
    { id: 'init_2', timestamp: Date.now() - 300_000, source: 'strategy', severity: 'info', title: '策略回测完成', detail: '双均线交叉策略 v3.2 回测结果: +18.4%', acknowledged: true },
  ]);
  const emitRiskSignal = useCallback((signal: Omit<RiskSignal, 'id' | 'timestamp' | 'acknowledged'>) => {
    const newSignal: RiskSignal = { ...signal, id: `rs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, timestamp: Date.now(), acknowledged: false };
    setRiskSignals(prev => [newSignal, ...prev].slice(0, 50)); // keep latest 50
  }, []);
  const acknowledgeSignal = useCallback((id: string) => {
    setRiskSignals(prev => prev.map(s => s.id === id ? { ...s, acknowledged: true } : s));
  }, []);
  const clearResolvedSignals = useCallback(() => {
    setRiskSignals(prev => prev.filter(s => !s.acknowledged));
  }, []);

  // ── Unified Favorites (cross-component) ──
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('yyc_favorites');
      return stored ? new Set(JSON.parse(stored)) : new Set(['BTC/USDT', 'ETH/USDT', 'SOL/USDT']);
    } catch { return new Set(['BTC/USDT', 'ETH/USDT', 'SOL/USDT']); }
  });

  const toggleFavorite = useCallback((symbol: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(symbol)) { next.delete(symbol); } else { next.add(symbol); }
      try { localStorage.setItem('yyc_favorites', JSON.stringify([...next])); } catch { /* */ }
      return next;
    });
  }, []);

  // ── Binance WebSocket: subscribe on mount ──
  useEffect(() => {
    const svc = getBinanceService();
    svc.subscribe(
      // onUpdate: merge live crypto prices into marketData
      (tickers) => {
        binanceLiveRef.current = tickers;
        if (tickers.size > 0) {
          setMarketData(prev => prev.map(asset => {
            if (asset.category !== '加密货币') return asset;
            // Convert our display symbol to Binance key: "BTC/USDT" → "BTCUSDT"
            const binKey = asset.symbol.replace('/', '');
            const live = tickers.get(binKey);
            if (!live) return asset;
            return {
              ...asset,
              price: live.lastPrice,
              change: +live.priceChangePercent.toFixed(2),
              high24h: live.highPrice,
              low24h: live.lowPrice,
              volume: BinanceService.formatVolume(live.quoteVolume),
            };
          }));
        }
      },
      // onStatusChange
      (status) => setDataSource(status),
    );
    return () => { destroyBinanceService(); };
  }, []);

  // ── CoinGecko: load 50+ crypto assets on mount, refresh every 2 min ──
  useEffect(() => {
    let cancelled = false;
    const loadCoins = async () => {
      try {
        const svc = getCoinGeckoService();
        const { assets, source } = await svc.getSupplementaryCoins();
        if (cancelled || assets.length === 0) return;
        console.info(`[CoinGecko] Loaded ${assets.length} supplementary coins (source: ${source})`);
        setMarketData(prev => {
          const existingSymbols = new Set(prev.map(a => a.symbol));
          const newAssets: MarketAsset[] = assets
            .filter(a => !existingSymbols.has(a.symbol))
            .map(a => ({ ...a }));
          if (newAssets.length === 0) return prev;
          return [...prev, ...newAssets];
        });
      } catch (err) {
        console.warn('[CoinGecko] Failed to load supplementary coins:', err);
      }
    };
    loadCoins();
    const interval = setInterval(loadCoins, 120_000); // refresh every 2 min
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // ── Simulation fallback: only jitter assets NOT covered by live data ──
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(asset => {
        // If Binance is live and this is a crypto asset, skip simulation (live WS drives it)
        if (dataSource === 'connected' && asset.category === '加密货币') {
          return asset;
        }
        const volatility = asset.category === '加密货币' ? 0.003 : 0.001;
        const delta = (Math.random() - 0.48) * asset.price * volatility;
        const newPrice = Math.max(asset.price * 0.95, asset.price + delta);
        const newChange = asset.change + (Math.random() - 0.48) * 0.1;
        return { ...asset, price: +newPrice.toFixed(asset.price > 100 ? 2 : asset.price > 1 ? 4 : 6), change: +newChange.toFixed(2) };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, [dataSource]);

  // Update positions from market data
  useEffect(() => {
    setPositions(prev => prev.map(pos => {
      const asset = marketData.find(a => a.symbol === pos.symbol);
      if (!asset) return pos;
      const currentPrice = asset.price;
      const pnl = pos.side === 'LONG'
        ? (currentPrice - pos.entryPrice) * pos.quantity
        : (pos.entryPrice - currentPrice) * pos.quantity;
      const pnlPct = ((currentPrice - pos.entryPrice) / pos.entryPrice) * 100 * (pos.side === 'LONG' ? 1 : -1);
      return { ...pos, currentPrice, unrealizedPnl: +pnl.toFixed(2), pnlPercent: +pnlPct.toFixed(2) };
    }));
  }, [marketData]);

  // Update account from positions
  useEffect(() => {
    const positionValue = positions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0);
    const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
    setAccount(prev => ({
      ...prev,
      positionValue: +positionValue.toFixed(2),
      totalAssets: +(prev.availableBalance + positionValue).toFixed(2),
      todayPnl: +totalPnl.toFixed(2),
      todayPnlPercent: +((totalPnl / (prev.availableBalance + positionValue)) * 100).toFixed(2),
    }));
  }, [positions]);

  // Update risk metrics from positions and market
  useEffect(() => {
    const exposure = positions.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
    const btcAsset = marketData.find(a => a.symbol === 'BTC/USDT');
    setRiskMetrics(prev => ({
      ...prev,
      totalExposure: +exposure.toFixed(2),
      portfolioVaR95: +(-exposure * 0.056).toFixed(0),
      portfolioVaR99: +(-exposure * 0.084).toFixed(0),
      leverageRatio: +(exposure / (account.availableBalance + exposure)).toFixed(2),
      correlationBTC: btcAsset ? +(0.82 + Math.random() * 0.06).toFixed(2) : prev.correlationBTC,
    }));
  }, [positions, marketData, account.availableBalance]);

  // Simulate system metrics jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(15, Math.min(85, prev.cpuUsage + (Math.random() - 0.5) * 6)),
        memoryUsage: Math.max(40, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 3)),
        networkLatency: Math.max(5, Math.min(50, prev.networkLatency + (Math.random() - 0.5) * 4)),
        dataFreshness: 0,
        quantumQubits: Math.max(48, Math.min(128, prev.quantumQubits + Math.floor((Math.random() - 0.4) * 4))),
        quantumFidelity: Math.max(95, Math.min(99.9, prev.quantumFidelity + (Math.random() - 0.5) * 0.3)),
      }));
      // Jitter model metrics
      setModelMetrics(prev => ({
        ...prev,
        avgAccuracy: Math.max(70, Math.min(95, prev.avgAccuracy + (Math.random() - 0.5) * 0.5)),
      }));
      // Jitter pipeline metrics
      setPipelineMetrics(prev => ({
        ...prev,
        dataQuality: Math.max(90, Math.min(99.9, prev.dataQuality + (Math.random() - 0.5) * 0.3)),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getAsset = useCallback((symbol: string) => marketData.find(a => a.symbol === symbol), [marketData]);
  const getAssetsByCategory = useCallback((cat: string) => marketData.filter(a => a.category === cat), [marketData]);
  const activeStrategies = strategies.filter(s => s.status === 'active');

  const tickerCoins = marketData.filter(a => a.category === '加密货币').slice(0, 12).map(a => ({
    label: a.symbol,
    price: formatPriceStatic(a.price),
    change: (a.change >= 0 ? '+' : '') + a.change.toFixed(2) + '%',
    cny: '≈¥' + (a.price * 7.2).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
  }));

  // Compute cross-module summary
  const topMover = marketData.reduce((best, a) => Math.abs(a.change) > Math.abs(best.change) ? a : best, marketData[0]);
  const crossModuleSummary: CrossModuleSummary = {
    market: { assetCount: marketData.length, topMover: topMover?.symbol || '--', topMoveChange: topMover?.change || 0 },
    strategy: { activeCount: activeStrategies.length, avgWinRate: activeStrategies.length > 0 ? +(activeStrategies.reduce((s, st) => s + st.winRate, 0) / activeStrategies.length).toFixed(1) : 0, bestPnl: strategies.length > 0 ? strategies.reduce((b, s) => parseFloat(s.pnl) > parseFloat(b.pnl) ? s : b).pnl : '--' },
    risk: { riskLevel: riskMetrics.leverageRatio > 0.8 ? 'high' : riskMetrics.leverageRatio > 0.5 ? 'medium' : 'low', var95: riskMetrics.portfolioVaR95, alertCount },
    quantum: { qubits: systemMetrics.quantumQubits, fidelity: systemMetrics.quantumFidelity, activeTasks: systemMetrics.quantumTasks },
    bigdata: { sources: pipelineMetrics.activeSources, quality: pipelineMetrics.dataQuality, storage: pipelineMetrics.totalStorage },
    model: { deployed: modelMetrics.deployedModels, training: modelMetrics.trainingModels, bestAccuracy: modelMetrics.avgAccuracy },
    trade: { totalAssets: account.totalAssets, todayPnl: account.todayPnl, openPositions: positions.length },
    admin: { cpuUsage: systemMetrics.cpuUsage, memUsage: systemMetrics.memoryUsage, uptime: '99.97%' },
  };

  const navigateTo = useCallback((module: string, sub?: string, tertiary?: string) => {
    setPendingNavigation({ module, sub, tertiary });
  }, []);
  const clearNavigation = useCallback(() => setPendingNavigation(null), []);

  // Position mutation functions
  const applyFill = useCallback((fill: PositionFillEvent) => {
    setPositions(prev => {
      // Map BUY → LONG, SELL → SHORT for position side
      const posSide: 'LONG' | 'SHORT' = fill.side === 'BUY' ? 'LONG' : 'SHORT';
      const existing = prev.find(p => p.symbol === fill.symbol && p.side === posSide);
      if (!existing) {
        return [...prev, {
          symbol: fill.symbol,
          side: posSide,
          quantity: fill.quantity,
          entryPrice: fill.fillPrice,
          currentPrice: fill.fillPrice,
          unrealizedPnl: 0,
          pnlPercent: 0,
          strategy: fill.strategy || '未知策略',
          exchange: fill.exchange,
          openTime: Date.now(),
        }];
      }
      return prev.map(p => {
        if (p.symbol !== fill.symbol || p.side !== posSide) return p;
        const newQuantity = p.quantity + fill.quantity;
        const newEntryPrice = (p.entryPrice * p.quantity + fill.fillPrice * fill.quantity) / newQuantity;
        return {
          ...p,
          quantity: newQuantity,
          entryPrice: newEntryPrice,
          currentPrice: fill.fillPrice,
          unrealizedPnl: 0,
          pnlPercent: 0,
        };
      });
    });
  }, []);

  const closePosition = useCallback((symbol: string, side: 'LONG' | 'SHORT') => {
    setPositions(prev => prev.filter(p => !(p.symbol === symbol && p.side === side)));
  }, []);

  const reducePosition = useCallback((symbol: string, side: 'LONG' | 'SHORT', percent: number) => {
    setPositions(prev => prev.map(p => {
      if (p.symbol !== symbol || p.side !== side) return p;
      const newQuantity = p.quantity * (1 - percent / 100);
      return {
        ...p,
        quantity: newQuantity,
        unrealizedPnl: 0,
        pnlPercent: 0,
      };
    }));
  }, []);

  const appendTradeRecord = useCallback((record: Omit<TradeRecord, 'id'>) => {
    setRecentTrades(prev => {
      const newRecord: TradeRecord = { ...record, id: `tr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
      return [newRecord, ...prev].slice(0, 50); // keep latest 50
    });
  }, []);

  return (
    <GlobalDataContext.Provider value={{
      marketData,
      dataSource,
      getAsset,
      getAssetsByCategory,
      tickerCoins,
      positions,
      account,
      strategies,
      activeStrategies,
      riskMetrics,
      systemMetrics,
      modelMetrics,
      pipelineMetrics,
      crossModuleSummary,
      recentTrades,
      alertCount,
      setAlertCount,
      formatPrice: (v) => formatPriceStatic(v),
      formatUSD: (v) => (v >= 0 ? '+$' : '-$') + Math.abs(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      formatPercent: (v) => (v >= 0 ? '+' : '') + v.toFixed(2) + '%',
      navigateTo,
      pendingNavigation,
      clearNavigation,
      favorites,
      toggleFavorite,
      riskSignals,
      emitRiskSignal,
      acknowledgeSignal,
      clearResolvedSignals,
      applyFill,
      closePosition,
      reducePosition,
      appendTradeRecord,
    }}>
      {children}
    </GlobalDataContext.Provider>
  );
};

function formatPriceStatic(v: number): string {
  if (v >= 1000) return v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (v >= 1) return v.toFixed(2);
  return v.toFixed(4);
}

export const useGlobalData = () => {
  const ctx = useContext(GlobalDataContext);
  if (!ctx) throw new Error('useGlobalData must be used within GlobalDataProvider');
  return ctx;
};