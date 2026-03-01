// ================================================================
// Multi-Exchange Unified Aggregator, Arbitrage Detector,
// Multi-Account Manager & Auto-Hedge Engine — Phase 2
// ================================================================
// Aggregates order books from Binance, OKX, Bybit via real API
// adapter structures (sandbox: simulated fallback)
// Provides unified best-price routing, cross-exchange arbitrage
// signal detection, multi-account aggregation, and risk-control
// linked auto-liquidation + auto-hedge capability
// ================================================================

export interface ExchangeQuote {
  exchange: string;
  bestBid: number;
  bestAsk: number;
  bidSize: number;
  askSize: number;
  latency: number; // ms
  status: 'online' | 'degraded' | 'offline';
  lastUpdate: number;
  fee: number; // taker fee rate
}

export interface AggregatedQuote {
  symbol: string;
  bestBid: { price: number; exchange: string; size: number };
  bestAsk: { price: number; exchange: string; size: number };
  spread: number;
  spreadBps: number; // basis points
  exchanges: ExchangeQuote[];
  timestamp: number;
  arbitrageOpportunity?: ArbitrageSignal | null;
}

export interface LiquidationRule {
  id: string;
  name: string;
  enabled: boolean;
  triggerType: 'max_loss_pct' | 'max_loss_usd' | 'var_breach' | 'drawdown' | 'margin_call' | 'correlation_spike';
  threshold: number;
  action: 'close_all' | 'close_losing' | 'reduce_50' | 'hedge' | 'alert_only';
  cooldownMs: number;
  lastTriggered: number | null;
  triggerCount: number;
  symbol?: string; // optional: apply to specific symbol only
}

export interface LiquidationEvent {
  id: string;
  timestamp: number;
  ruleId: string;
  ruleName: string;
  triggerType: string;
  action: string;
  symbols: string[];
  totalValue: number;
  reason: string;
  status: 'triggered' | 'executing' | 'completed' | 'failed';
}

// ── Arbitrage Signal Types ──
export interface ArbitrageSignal {
  id: string;
  timestamp: number;
  symbol: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spreadBps: number;
  netProfitBps: number; // after fees
  estimatedProfit: number; // in USD for 1 unit
  confidence: 'high' | 'medium' | 'low';
  status: 'detected' | 'executing' | 'expired' | 'filled';
  expiresAt: number;
  maxQuantity: number; // limited by order book depth
}

// ── Multi-Account Types ──
export interface ExchangeAccount {
  id: string;
  exchange: string;
  label: string;
  apiKeyMasked: string;
  status: 'connected' | 'disconnected' | 'error';
  permissions: ('spot' | 'futures' | 'margin' | 'withdraw')[];
  balances: { asset: string; free: number; locked: number }[];
  totalUSD: number;
  lastSync: number;
  rateLimit: { used: number; max: number };
}

export interface MultiAccountSummary {
  accounts: ExchangeAccount[];
  totalAssetsUSD: number;
  totalPositionValue: number;
  aggregatedPnl: number;
  crossExchangeExposure: { symbol: string; netPosition: number; exchanges: { name: string; position: number }[] }[];
}

// ── Auto-Hedge Types ──
export interface HedgeRule {
  id: string;
  name: string;
  enabled: boolean;
  triggerType: 'delta_threshold' | 'correlation_break' | 'volatility_spike' | 'exposure_limit';
  threshold: number;
  hedgeAction: 'open_opposite' | 'reduce_delta' | 'cross_exchange_hedge' | 'options_hedge';
  hedgeRatio: number; // 0-1
  symbol?: string;
  cooldownMs: number;
  lastTriggered: number | null;
  triggerCount: number;
}

export interface HedgeExecution {
  id: string;
  timestamp: number;
  ruleId: string;
  ruleName: string;
  hedgeAction: string;
  symbol: string;
  exchange: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: 'pending' | 'executing' | 'filled' | 'failed';
  reason: string;
}

// ══════════════════════════════════════════════════════
// Exchange Adapter Interface (Production-Ready Structure)
// ══════════════════════════════════════════════════════

interface ExchangeAdapter {
  name: string;
  getQuote(symbol: string, midPrice: number): Promise<ExchangeQuote>;
  getOrderBook(symbol: string): Promise<{ asks: [number, number][]; bids: [number, number][] } | null>;
  placeOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number, price?: number): Promise<{ orderId: string; status: string }>;
  getBalances(): Promise<{ asset: string; free: number; locked: number }[]>;
  getStatus(): 'online' | 'degraded' | 'offline';
}

// ── Binance Adapter (Real structure, simulated data in sandbox) ──
class BinanceAdapter implements ExchangeAdapter {
  name = 'Binance';
  private baseUrl = 'https://api.binance.com';
  private wsUrl = 'wss://stream.binance.com:9443';
  private apiKey: string;
  private latencyMs = 0;
  private _status: 'online' | 'degraded' | 'offline' = 'online';

  constructor(apiKey = 'BINANCE_API_KEY_PLACEHOLDER') {
    this.apiKey = apiKey;
    // In sandbox, simulate connectivity check
    this.checkConnectivity();
  }

  private async checkConnectivity(): Promise<void> {
    try {
      // Real: fetch(`${this.baseUrl}/api/v3/ping`)
      // Sandbox: simulate
      this.latencyMs = Math.round(8 + Math.random() * 6);
      this._status = Math.random() > 0.02 ? 'online' : 'degraded';
    } catch {
      this._status = 'offline';
    }
  }

  async getQuote(symbol: string, midPrice: number): Promise<ExchangeQuote> {
    // Real: GET /api/v3/ticker/bookTicker?symbol=${symbol.replace('/', '')}
    // Sandbox: simulated
    const spread = midPrice * (0.0001 + Math.random() * 0.0002);
    this.latencyMs = Math.round(8 + Math.random() * 6);
    this._status = Math.random() > 0.02 ? 'online' : 'degraded';
    return {
      exchange: this.name,
      bestBid: +(midPrice - spread / 2 + (Math.random() - 0.5) * midPrice * 0.00005).toFixed(2),
      bestAsk: +(midPrice + spread / 2 + (Math.random() - 0.5) * midPrice * 0.00005).toFixed(2),
      bidSize: +(0.5 + Math.random() * 5).toFixed(3),
      askSize: +(0.5 + Math.random() * 5).toFixed(3),
      latency: this.latencyMs,
      status: this._status,
      lastUpdate: Date.now(),
      fee: 0.001,
    };
  }

  async getOrderBook(symbol: string): Promise<{ asks: [number, number][]; bids: [number, number][] } | null> {
    // Real: GET /api/v3/depth?symbol=${symbol.replace('/', '')}&limit=20
    // Sandbox: null (use BinanceDepthService WS instead)
    void symbol;
    return null;
  }

  async placeOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number, price?: number): Promise<{ orderId: string; status: string }> {
    // Real: POST /api/v3/order with HMAC-SHA256 signature
    // Sandbox: simulated fill
    void this.apiKey;
    console.debug(`[BinanceAdapter] Simulated ${side} ${quantity} ${symbol} @ ${price || 'MARKET'}`);
    return { orderId: `BIN-${Date.now().toString(36)}`, status: 'FILLED' };
  }

  async getBalances(): Promise<{ asset: string; free: number; locked: number }[]> {
    // Real: GET /api/v3/account with signature
    return [
      { asset: 'USDT', free: 45000, locked: 5000 },
      { asset: 'BTC', free: 0.25, locked: 0.05 },
      { asset: 'ETH', free: 8.5, locked: 1.0 },
    ];
  }

  getStatus() { return this._status; }
}

// ── OKX Adapter (Real endpoint structure) ──
class OKXAdapter implements ExchangeAdapter {
  name = 'OKX';
  private baseUrl = 'https://www.okx.com';
  private wsUrl = 'wss://ws.okx.com:8443/ws/v5';
  private apiKey: string;
  private passphrase: string;
  private latencyMs = 0;
  private _status: 'online' | 'degraded' | 'offline' = 'online';

  constructor(apiKey = 'OKX_API_KEY_PLACEHOLDER', passphrase = 'OKX_PASSPHRASE') {
    this.apiKey = apiKey;
    this.passphrase = passphrase;
    this.checkConnectivity();
  }

  private async checkConnectivity(): Promise<void> {
    try {
      // Real: GET /api/v5/public/time
      this.latencyMs = Math.round(15 + Math.random() * 10);
      this._status = Math.random() > 0.05 ? 'online' : 'degraded';
    } catch {
      this._status = 'offline';
    }
  }

  async getQuote(symbol: string, midPrice: number): Promise<ExchangeQuote> {
    // Real: GET /api/v5/market/ticker?instId=${symbol.replace('/', '-')}
    const spread = midPrice * (0.00015 + Math.random() * 0.00015);
    const offset = midPrice * 0.00005;
    this.latencyMs = Math.round(15 + Math.random() * 10);
    this._status = Math.random() > 0.05 ? 'online' : 'degraded';
    return {
      exchange: this.name,
      bestBid: +(midPrice - spread / 2 + offset + (Math.random() - 0.5) * midPrice * 0.00005).toFixed(2),
      bestAsk: +(midPrice + spread / 2 + offset + (Math.random() - 0.5) * midPrice * 0.00005).toFixed(2),
      bidSize: +(0.5 + Math.random() * 5).toFixed(3),
      askSize: +(0.5 + Math.random() * 5).toFixed(3),
      latency: this.latencyMs,
      status: this._status,
      lastUpdate: Date.now(),
      fee: 0.0008,
    };
  }

  async getOrderBook(_symbol: string): Promise<{ asks: [number, number][]; bids: [number, number][] } | null> {
    // Real: GET /api/v5/market/books?instId=${instId}&sz=20
    return null;
  }

  async placeOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number, price?: number): Promise<{ orderId: string; status: string }> {
    // Real: POST /api/v5/trade/order with OK-ACCESS-KEY / OK-ACCESS-PASSPHRASE headers
    void this.apiKey; void this.passphrase;
    console.debug(`[OKXAdapter] Simulated ${side} ${quantity} ${symbol} @ ${price || 'MARKET'}`);
    return { orderId: `OKX-${Date.now().toString(36)}`, status: 'FILLED' };
  }

  async getBalances(): Promise<{ asset: string; free: number; locked: number }[]> {
    // Real: GET /api/v5/account/balance
    return [
      { asset: 'USDT', free: 32000, locked: 3000 },
      { asset: 'BTC', free: 0.15, locked: 0 },
      { asset: 'ETH', free: 5.0, locked: 0.5 },
    ];
  }

  getStatus() { return this._status; }
}

// ── Bybit Adapter (Real endpoint structure) ──
class BybitAdapter implements ExchangeAdapter {
  name = 'Bybit';
  private baseUrl = 'https://api.bybit.com';
  private wsUrl = 'wss://stream.bybit.com/v5';
  private apiKey: string;
  private latencyMs = 0;
  private _status: 'online' | 'degraded' | 'offline' = 'online';

  constructor(apiKey = 'BYBIT_API_KEY_PLACEHOLDER') {
    this.apiKey = apiKey;
    this.checkConnectivity();
  }

  private async checkConnectivity(): Promise<void> {
    try {
      // Real: GET /v5/market/time
      this.latencyMs = Math.round(12 + Math.random() * 8);
      this._status = Math.random() > 0.04 ? 'online' : 'degraded';
    } catch {
      this._status = 'offline';
    }
  }

  async getQuote(symbol: string, midPrice: number): Promise<ExchangeQuote> {
    // Real: GET /v5/market/tickers?category=spot&symbol=${symbol.replace('/', '')}
    const spread = midPrice * (0.00012 + Math.random() * 0.00018);
    const offset = midPrice * -0.00003;
    this.latencyMs = Math.round(12 + Math.random() * 8);
    this._status = Math.random() > 0.04 ? 'online' : 'degraded';
    return {
      exchange: this.name,
      bestBid: +(midPrice - spread / 2 + offset + (Math.random() - 0.5) * midPrice * 0.00005).toFixed(2),
      bestAsk: +(midPrice + spread / 2 + offset + (Math.random() - 0.5) * midPrice * 0.00005).toFixed(2),
      bidSize: +(0.5 + Math.random() * 5).toFixed(3),
      askSize: +(0.5 + Math.random() * 5).toFixed(3),
      latency: this.latencyMs,
      status: this._status,
      lastUpdate: Date.now(),
      fee: 0.001,
    };
  }

  async getOrderBook(_symbol: string): Promise<{ asks: [number, number][]; bids: [number, number][] } | null> {
    // Real: GET /v5/market/orderbook?category=spot&symbol=${symbol}&limit=25
    return null;
  }

  async placeOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number, price?: number): Promise<{ orderId: string; status: string }> {
    // Real: POST /v5/order/create with X-BAPI-API-KEY header + HMAC
    void this.apiKey;
    console.debug(`[BybitAdapter] Simulated ${side} ${quantity} ${symbol} @ ${price || 'MARKET'}`);
    return { orderId: `BYBIT-${Date.now().toString(36)}`, status: 'FILLED' };
  }

  async getBalances(): Promise<{ asset: string; free: number; locked: number }[]> {
    // Real: GET /v5/account/wallet-balance?accountType=UNIFIED
    return [
      { asset: 'USDT', free: 28000, locked: 2000 },
      { asset: 'BTC', free: 0.10, locked: 0.02 },
      { asset: 'SOL', free: 50, locked: 10 },
    ];
  }

  getStatus() { return this._status; }
}

// ══════════════════════════════════════════════════════
// Exchange Aggregator (upgraded with adapters)
// ══════════════════════════════════════════════════════

const adapters: ExchangeAdapter[] = [
  new BinanceAdapter(),
  new OKXAdapter(),
  new BybitAdapter(),
];

export function getAggregatedQuote(symbol: string, midPrice: number): AggregatedQuote {
  // Use adapters but synchronously for backward compat (simulated data)
  const exchanges = adapters.map(adapter => {
    // Synchronous simulation — real async calls handled by getAggregatedQuoteAsync
    const spread = midPrice * (0.0001 + Math.random() * 0.0002);
    const cfg = adapter.name === 'Binance' ? { offset: 0, fee: 0.001, lat: [8, 6] }
      : adapter.name === 'OKX' ? { offset: 0.00005, fee: 0.0008, lat: [15, 10] }
      : { offset: -0.00003, fee: 0.001, lat: [12, 8] };
    const isOnline = Math.random() < 0.96;
    return {
      exchange: adapter.name,
      bestBid: +(midPrice - spread / 2 + midPrice * cfg.offset + (Math.random() - 0.5) * midPrice * 0.00005).toFixed(2),
      bestAsk: +(midPrice + spread / 2 + midPrice * cfg.offset + (Math.random() - 0.5) * midPrice * 0.00005).toFixed(2),
      bidSize: +(0.5 + Math.random() * 5).toFixed(3),
      askSize: +(0.5 + Math.random() * 5).toFixed(3),
      latency: Math.round(cfg.lat[0] + Math.random() * cfg.lat[1]),
      status: isOnline ? (Math.random() > 0.1 ? 'online' as const : 'degraded' as const) : 'offline' as const,
      lastUpdate: Date.now(),
      fee: cfg.fee,
    };
  });

  const onlineExchanges = exchanges.filter(e => e.status !== 'offline');

  const bestBidEx = onlineExchanges.length > 0
    ? onlineExchanges.reduce((best, e) => e.bestBid > best.bestBid ? e : best)
    : exchanges[0];

  const bestAskEx = onlineExchanges.length > 0
    ? onlineExchanges.reduce((best, e) => e.bestAsk < best.bestAsk ? e : best)
    : exchanges[0];

  const spread = bestAskEx.bestAsk - bestBidEx.bestBid;

  // Check for arbitrage opportunity
  let arbitrageOpportunity: ArbitrageSignal | null = null;
  if (bestBidEx.exchange !== bestAskEx.exchange) {
    const arb = detectArbitrage(symbol, exchanges);
    if (arb) arbitrageOpportunity = arb;
  }

  return {
    symbol,
    bestBid: { price: bestBidEx.bestBid, exchange: bestBidEx.exchange, size: bestBidEx.bidSize },
    bestAsk: { price: bestAskEx.bestAsk, exchange: bestAskEx.exchange, size: bestAskEx.askSize },
    spread: +spread.toFixed(2),
    spreadBps: +((spread / midPrice) * 10000).toFixed(2),
    exchanges,
    timestamp: Date.now(),
    arbitrageOpportunity,
  };
}

// Async version for real API calls
export async function getAggregatedQuoteAsync(symbol: string, midPrice: number): Promise<AggregatedQuote> {
  const exchanges = await Promise.all(
    adapters.map(adapter => adapter.getQuote(symbol, midPrice).catch((): ExchangeQuote => ({
      exchange: adapter.name,
      bestBid: 0, bestAsk: 0, bidSize: 0, askSize: 0,
      latency: -1, status: 'offline', lastUpdate: Date.now(), fee: 0,
    })))
  );

  const onlineExchanges = exchanges.filter(e => e.status !== 'offline' && e.bestBid > 0);

  const bestBidEx = onlineExchanges.length > 0
    ? onlineExchanges.reduce((best, e) => e.bestBid > best.bestBid ? e : best)
    : exchanges[0];

  const bestAskEx = onlineExchanges.length > 0
    ? onlineExchanges.reduce((best, e) => e.bestAsk < best.bestAsk ? e : best)
    : exchanges[0];

  const spread = bestAskEx.bestAsk - bestBidEx.bestBid;
  const arbitrageOpportunity = detectArbitrage(symbol, exchanges);

  return {
    symbol,
    bestBid: { price: bestBidEx.bestBid, exchange: bestBidEx.exchange, size: bestBidEx.bidSize },
    bestAsk: { price: bestAskEx.bestAsk, exchange: bestAskEx.exchange, size: bestAskEx.askSize },
    spread: +spread.toFixed(2),
    spreadBps: +((spread / (bestBidEx.bestBid || 1)) * 10000).toFixed(2),
    exchanges,
    timestamp: Date.now(),
    arbitrageOpportunity,
  };
}

// ══════════════════════════════════════════════════════
// Cross-Exchange Arbitrage Detector
// ══════════════════════════════════════════════════════

function detectArbitrage(symbol: string, exchanges: ExchangeQuote[]): ArbitrageSignal | null {
  const online = exchanges.filter(e => e.status !== 'offline' && e.bestBid > 0 && e.bestAsk > 0);
  if (online.length < 2) return null;

  let bestSignal: ArbitrageSignal | null = null;
  let bestNetProfit = 0;

  for (let i = 0; i < online.length; i++) {
    for (let j = 0; j < online.length; j++) {
      if (i === j) continue;
      const buyEx = online[j];  // buy at lowest ask
      const sellEx = online[i]; // sell at highest bid

      if (sellEx.bestBid > buyEx.bestAsk) {
        const grossSpread = sellEx.bestBid - buyEx.bestAsk;
        const grossBps = (grossSpread / buyEx.bestAsk) * 10000;
        const totalFee = (buyEx.fee + sellEx.fee) * buyEx.bestAsk;
        const netProfit = grossSpread - totalFee;
        const netBps = (netProfit / buyEx.bestAsk) * 10000;

        if (netBps > bestNetProfit && netBps > 0.5) { // minimum 0.5 bps net profit
          bestNetProfit = netBps;
          const maxQty = Math.min(buyEx.askSize, sellEx.bidSize);
          bestSignal = {
            id: `arb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            timestamp: Date.now(),
            symbol,
            buyExchange: buyEx.exchange,
            sellExchange: sellEx.exchange,
            buyPrice: buyEx.bestAsk,
            sellPrice: sellEx.bestBid,
            spreadBps: +grossBps.toFixed(2),
            netProfitBps: +netBps.toFixed(2),
            estimatedProfit: +(netProfit * maxQty).toFixed(2),
            confidence: netBps > 5 ? 'high' : netBps > 2 ? 'medium' : 'low',
            status: 'detected',
            expiresAt: Date.now() + 3000, // 3s expiry
            maxQuantity: +maxQty.toFixed(6),
          };
        }
      }
    }
  }

  return bestSignal;
}

// ── Arbitrage Signal History ──
let _arbSignals: ArbitrageSignal[] = [];

export function getArbitrageSignals(): ArbitrageSignal[] {
  // Expire old signals
  const now = Date.now();
  _arbSignals = _arbSignals.map(s =>
    s.status === 'detected' && now > s.expiresAt ? { ...s, status: 'expired' as const } : s
  ).slice(0, 100);
  return _arbSignals;
}

export function recordArbitrageSignal(signal: ArbitrageSignal): void {
  _arbSignals = [signal, ..._arbSignals].slice(0, 100);
}

export function executeArbitrage(signalId: string): ArbitrageSignal | null {
  const idx = _arbSignals.findIndex(s => s.id === signalId);
  if (idx === -1) return null;
  _arbSignals[idx] = { ..._arbSignals[idx], status: 'executing' };
  // Simulate execution delay
  setTimeout(() => {
    const i = _arbSignals.findIndex(s => s.id === signalId);
    if (i !== -1) {
      _arbSignals[i] = { ..._arbSignals[i], status: Math.random() > 0.15 ? 'filled' : 'expired' };
    }
  }, 500 + Math.random() * 1000);
  return _arbSignals[idx];
}

// ══════════════════════════════════════════════════════
// Multi-Account Manager
// ══════════════════════════════════════════════════════

const SIMULATED_ACCOUNTS: ExchangeAccount[] = [
  {
    id: 'acc_binance_main', exchange: 'Binance', label: '主账户',
    apiKeyMasked: 'Abc...xyz', status: 'connected',
    permissions: ['spot', 'futures', 'margin'],
    balances: [
      { asset: 'USDT', free: 45000, locked: 5000 },
      { asset: 'BTC', free: 0.25, locked: 0.05 },
      { asset: 'ETH', free: 8.5, locked: 1.0 },
    ],
    totalUSD: 78350, lastSync: Date.now() - 30000,
    rateLimit: { used: 120, max: 1200 },
  },
  {
    id: 'acc_okx_main', exchange: 'OKX', label: '套利账户',
    apiKeyMasked: 'Def...uvw', status: 'connected',
    permissions: ['spot', 'futures'],
    balances: [
      { asset: 'USDT', free: 32000, locked: 3000 },
      { asset: 'BTC', free: 0.15, locked: 0 },
      { asset: 'ETH', free: 5.0, locked: 0.5 },
    ],
    totalUSD: 52180, lastSync: Date.now() - 45000,
    rateLimit: { used: 85, max: 600 },
  },
  {
    id: 'acc_bybit_main', exchange: 'Bybit', label: '对冲账户',
    apiKeyMasked: 'Ghi...rst', status: 'connected',
    permissions: ['spot', 'futures'],
    balances: [
      { asset: 'USDT', free: 28000, locked: 2000 },
      { asset: 'BTC', free: 0.10, locked: 0.02 },
      { asset: 'SOL', free: 50, locked: 10 },
    ],
    totalUSD: 41250, lastSync: Date.now() - 60000,
    rateLimit: { used: 45, max: 600 },
  },
];

export function getMultiAccountSummary(): MultiAccountSummary {
  const accounts = SIMULATED_ACCOUNTS.map(acc => ({
    ...acc,
    totalUSD: acc.totalUSD + (Math.random() - 0.5) * 200,
    lastSync: Date.now() - Math.random() * 60000,
    rateLimit: { ...acc.rateLimit, used: Math.round(acc.rateLimit.used + (Math.random() - 0.5) * 20) },
  }));

  const totalAssetsUSD = accounts.reduce((s, a) => s + a.totalUSD, 0);

  return {
    accounts,
    totalAssetsUSD: +totalAssetsUSD.toFixed(2),
    totalPositionValue: +(totalAssetsUSD * 0.45).toFixed(2),
    aggregatedPnl: +(totalAssetsUSD * 0.018).toFixed(2),
    crossExchangeExposure: [
      {
        symbol: 'BTC/USDT', netPosition: 0.50,
        exchanges: [
          { name: 'Binance', position: 0.25 },
          { name: 'OKX', position: 0.15 },
          { name: 'Bybit', position: 0.10 },
        ],
      },
      {
        symbol: 'ETH/USDT', netPosition: 13.5,
        exchanges: [
          { name: 'Binance', position: 8.5 },
          { name: 'OKX', position: 5.0 },
          { name: 'Bybit', position: 0 },
        ],
      },
    ],
  };
}

// ══════════════════════════════════════════════════════
// Auto-Hedge Engine
// ══════════════════════════════════════════════════════

export const DEFAULT_HEDGE_RULES: HedgeRule[] = [
  {
    id: 'hedge_delta', name: 'Delta 中性对冲', enabled: true,
    triggerType: 'delta_threshold', threshold: 0.3,
    hedgeAction: 'reduce_delta', hedgeRatio: 0.8,
    cooldownMs: 120_000, lastTriggered: null, triggerCount: 0,
  },
  {
    id: 'hedge_corr', name: '相关性断裂对冲', enabled: true,
    triggerType: 'correlation_break', threshold: -0.5,
    hedgeAction: 'cross_exchange_hedge', hedgeRatio: 0.5,
    cooldownMs: 300_000, lastTriggered: null, triggerCount: 0,
  },
  {
    id: 'hedge_vol', name: '波动率激增防护', enabled: false,
    triggerType: 'volatility_spike', threshold: 80, // VIX equivalent
    hedgeAction: 'open_opposite', hedgeRatio: 0.3,
    cooldownMs: 600_000, lastTriggered: null, triggerCount: 0,
  },
  {
    id: 'hedge_exposure', name: '敞口限额保护', enabled: true,
    triggerType: 'exposure_limit', threshold: 100000, // USD
    hedgeAction: 'reduce_delta', hedgeRatio: 0.5,
    cooldownMs: 60_000, lastTriggered: null, triggerCount: 0,
  },
];

export class AutoHedgeEngine {
  private rules: HedgeRule[];
  private executions: HedgeExecution[] = [];
  private onExecution: ((exec: HedgeExecution) => void) | null = null;

  constructor(rules?: HedgeRule[]) {
    this.rules = rules || [...DEFAULT_HEDGE_RULES];
  }

  setExecutionHandler(handler: (exec: HedgeExecution) => void): void {
    this.onExecution = handler;
  }

  getRules(): HedgeRule[] { return this.rules; }
  getExecutions(): HedgeExecution[] { return this.executions; }

  toggleRule(ruleId: string): void {
    this.rules = this.rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
  }

  updateRule(ruleId: string, updates: Partial<HedgeRule>): void {
    this.rules = this.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r);
  }

  evaluate(context: {
    positions: Array<{ symbol: string; side: 'LONG' | 'SHORT'; quantity: number; currentPrice: number }>;
    riskMetrics: { correlationBTC: number; leverageRatio: number; totalExposure: number };
    volatilityIndex: number; // simulated VIX-like metric
  }): HedgeExecution[] {
    const now = Date.now();
    const triggered: HedgeExecution[] = [];

    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      if (rule.lastTriggered && (now - rule.lastTriggered) < rule.cooldownMs) continue;

      let shouldTrigger = false;
      let reason = '';
      let targetSymbol = 'BTC/USDT';
      let targetExchange = 'Binance';
      let targetSide: 'BUY' | 'SELL' = 'SELL';
      let targetQuantity = 0;
      let targetPrice = 0;

      switch (rule.triggerType) {
        case 'delta_threshold': {
          // Check net delta across all positions
          const netDelta = context.positions.reduce((s, p) => {
            const val = p.currentPrice * p.quantity;
            return s + (p.side === 'LONG' ? val : -val);
          }, 0);
          const totalValue = context.positions.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
          const deltaRatio = totalValue > 0 ? Math.abs(netDelta) / totalValue : 0;
          if (deltaRatio > rule.threshold) {
            shouldTrigger = true;
            reason = `组合 Delta 比率 ${(deltaRatio * 100).toFixed(1)}% 超过阈值 ${(rule.threshold * 100).toFixed(0)}%`;
            const largestPos = context.positions.reduce((b, p) => p.currentPrice * p.quantity > b.currentPrice * b.quantity ? p : b);
            targetSymbol = largestPos.symbol;
            targetSide = netDelta > 0 ? 'SELL' : 'BUY';
            targetQuantity = +(largestPos.quantity * rule.hedgeRatio * (1 - rule.threshold)).toFixed(6);
            targetPrice = largestPos.currentPrice;
          }
          break;
        }
        case 'correlation_break': {
          if (context.riskMetrics.correlationBTC < rule.threshold) {
            shouldTrigger = true;
            reason = `BTC 相关性断裂: ${context.riskMetrics.correlationBTC.toFixed(2)} < ${rule.threshold}`;
            targetExchange = 'OKX';
          }
          break;
        }
        case 'volatility_spike': {
          if (context.volatilityIndex > rule.threshold) {
            shouldTrigger = true;
            reason = `波动率指数 ${context.volatilityIndex.toFixed(1)} 超过阈值 ${rule.threshold}`;
          }
          break;
        }
        case 'exposure_limit': {
          if (context.riskMetrics.totalExposure > rule.threshold) {
            shouldTrigger = true;
            reason = `总敞口 $${context.riskMetrics.totalExposure.toLocaleString()} 超过限额 $${rule.threshold.toLocaleString()}`;
            const largestPos = context.positions.reduce((b, p) => p.currentPrice * p.quantity > b.currentPrice * b.quantity ? p : b, context.positions[0]);
            if (largestPos) {
              targetSymbol = largestPos.symbol;
              targetSide = largestPos.side === 'LONG' ? 'SELL' : 'BUY';
              targetQuantity = +(largestPos.quantity * rule.hedgeRatio).toFixed(6);
              targetPrice = largestPos.currentPrice;
            }
          }
          break;
        }
      }

      if (shouldTrigger) {
        const exec: HedgeExecution = {
          id: `hedge_${now}_${rule.id}`,
          timestamp: now,
          ruleId: rule.id,
          ruleName: rule.name,
          hedgeAction: rule.hedgeAction,
          symbol: targetSymbol,
          exchange: targetExchange,
          side: targetSide,
          quantity: targetQuantity,
          price: targetPrice,
          status: 'pending',
          reason,
        };
        triggered.push(exec);
        this.executions = [exec, ...this.executions].slice(0, 100);
        rule.lastTriggered = now;
        rule.triggerCount++;
        this.onExecution?.(exec);
      }
    }

    return triggered;
  }

  clearExecutions(): void {
    this.executions = [];
  }
}

let _hedgeEngine: AutoHedgeEngine | null = null;
export function getHedgeEngine(): AutoHedgeEngine {
  if (!_hedgeEngine) _hedgeEngine = new AutoHedgeEngine();
  return _hedgeEngine;
}

// ── Default Liquidation Rules ──
export const DEFAULT_LIQUIDATION_RULES: LiquidationRule[] = [
  {
    id: 'rule_max_loss_pct',
    name: '单笔最大亏损',
    enabled: true,
    triggerType: 'max_loss_pct',
    threshold: -5, // -5%
    action: 'close_losing',
    cooldownMs: 60_000,
    lastTriggered: null,
    triggerCount: 0,
  },
  {
    id: 'rule_max_loss_usd',
    name: '日内最大亏损额',
    enabled: true,
    triggerType: 'max_loss_usd',
    threshold: -5000, // -$5000
    action: 'close_all',
    cooldownMs: 300_000,
    lastTriggered: null,
    triggerCount: 0,
  },
  {
    id: 'rule_var_breach',
    name: 'VaR 突破限额',
    enabled: true,
    triggerType: 'var_breach',
    threshold: 90, // VaR reaches 90% of daily limit
    action: 'reduce_50',
    cooldownMs: 120_000,
    lastTriggered: null,
    triggerCount: 0,
  },
  {
    id: 'rule_drawdown',
    name: '最大回撤保护',
    enabled: true,
    triggerType: 'drawdown',
    threshold: -12, // -12%
    action: 'close_all',
    cooldownMs: 600_000,
    lastTriggered: null,
    triggerCount: 0,
  },
  {
    id: 'rule_margin_call',
    name: '保证金不足',
    enabled: true,
    triggerType: 'margin_call',
    threshold: 80, // margin utilization > 80%
    action: 'reduce_50',
    cooldownMs: 30_000,
    lastTriggered: null,
    triggerCount: 0,
  },
  {
    id: 'rule_correlation',
    name: '相关性异常激增',
    enabled: false,
    triggerType: 'correlation_spike',
    threshold: 0.95, // cross-asset correlation > 0.95
    action: 'hedge',
    cooldownMs: 180_000,
    lastTriggered: null,
    triggerCount: 0,
  },
];

// ── Auto-Liquidation Engine ──
export class AutoLiquidationEngine {
  private rules: LiquidationRule[];
  private events: LiquidationEvent[] = [];
  private onEvent: ((event: LiquidationEvent) => void) | null = null;

  constructor(rules?: LiquidationRule[]) {
    this.rules = rules || [...DEFAULT_LIQUIDATION_RULES];
  }

  setEventHandler(handler: (event: LiquidationEvent) => void): void {
    this.onEvent = handler;
  }

  getRules(): LiquidationRule[] { return this.rules; }
  getEvents(): LiquidationEvent[] { return this.events; }

  updateRule(ruleId: string, updates: Partial<LiquidationRule>): void {
    this.rules = this.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r);
  }

  toggleRule(ruleId: string): void {
    this.rules = this.rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
  }

  // Evaluate positions against rules; returns triggered events
  evaluate(context: {
    positions: Array<{ symbol: string; pnlPercent: number; unrealizedPnl: number; currentPrice: number; quantity: number }>;
    account: { totalAssets: number; availableBalance: number; todayPnl: number; todayPnlPercent: number };
    riskMetrics: { portfolioVaR95: number; maxDrawdown: number; leverageRatio: number; correlationBTC: number };
    varDailyLimit: number;
  }): LiquidationEvent[] {
    const now = Date.now();
    const triggered: LiquidationEvent[] = [];

    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      if (rule.lastTriggered && (now - rule.lastTriggered) < rule.cooldownMs) continue;

      let shouldTrigger = false;
      let reason = '';
      let affectedSymbols: string[] = [];
      let totalValue = 0;

      switch (rule.triggerType) {
        case 'max_loss_pct': {
          const losingPositions = context.positions.filter(p => p.pnlPercent <= rule.threshold);
          if (losingPositions.length > 0) {
            shouldTrigger = true;
            affectedSymbols = losingPositions.map(p => p.symbol);
            totalValue = losingPositions.reduce((s, p) => s + Math.abs(p.unrealizedPnl), 0);
            reason = `持仓亏损超过阈值 ${rule.threshold}%: ${affectedSymbols.join(', ')}`;
          }
          break;
        }
        case 'max_loss_usd': {
          if (context.account.todayPnl <= rule.threshold) {
            shouldTrigger = true;
            affectedSymbols = context.positions.map(p => p.symbol);
            totalValue = Math.abs(context.account.todayPnl);
            reason = `日内亏损 $${Math.abs(context.account.todayPnl).toFixed(0)} 超过限额 $${Math.abs(rule.threshold)}`;
          }
          break;
        }
        case 'var_breach': {
          const varPct = (Math.abs(context.riskMetrics.portfolioVaR95) / context.varDailyLimit) * 100;
          if (varPct >= rule.threshold) {
            shouldTrigger = true;
            affectedSymbols = context.positions.map(p => p.symbol);
            totalValue = Math.abs(context.riskMetrics.portfolioVaR95);
            reason = `VaR(95%) 达到日度限额的 ${varPct.toFixed(1)}%，超过阈值 ${rule.threshold}%`;
          }
          break;
        }
        case 'drawdown': {
          if (context.riskMetrics.maxDrawdown <= rule.threshold) {
            shouldTrigger = true;
            affectedSymbols = context.positions.map(p => p.symbol);
            totalValue = context.account.totalAssets * Math.abs(context.riskMetrics.maxDrawdown) / 100;
            reason = `最大回撤 ${context.riskMetrics.maxDrawdown.toFixed(1)}% 超过阈值 ${rule.threshold}%`;
          }
          break;
        }
        case 'margin_call': {
          const marginUtil = context.riskMetrics.leverageRatio * 100;
          if (marginUtil >= rule.threshold) {
            shouldTrigger = true;
            affectedSymbols = context.positions.map(p => p.symbol);
            totalValue = context.account.totalAssets * context.riskMetrics.leverageRatio;
            reason = `保证金使用率 ${marginUtil.toFixed(1)}% 超过阈值 ${rule.threshold}%`;
          }
          break;
        }
        case 'correlation_spike': {
          if (context.riskMetrics.correlationBTC >= rule.threshold) {
            shouldTrigger = true;
            affectedSymbols = context.positions.map(p => p.symbol);
            totalValue = context.account.totalAssets * 0.5;
            reason = `跨资产相关性 ${context.riskMetrics.correlationBTC.toFixed(2)} 超过阈值 ${rule.threshold}`;
          }
          break;
        }
      }

      if (shouldTrigger) {
        const event: LiquidationEvent = {
          id: `liq_${now}_${rule.id}`,
          timestamp: now,
          ruleId: rule.id,
          ruleName: rule.name,
          triggerType: rule.triggerType,
          action: rule.action,
          symbols: affectedSymbols,
          totalValue,
          reason,
          status: 'triggered',
        };
        triggered.push(event);
        this.events = [event, ...this.events].slice(0, 100);

        // Update rule state
        rule.lastTriggered = now;
        rule.triggerCount++;

        this.onEvent?.(event);
      }
    }

    return triggered;
  }

  // Clear event history
  clearEvents(): void {
    this.events = [];
  }
}

// ── Singleton ──
let _engine: AutoLiquidationEngine | null = null;
export function getLiquidationEngine(): AutoLiquidationEngine {
  if (!_engine) _engine = new AutoLiquidationEngine();
  return _engine;
}

// ── Exchange status summary for config display ──
export function getExchangeStatuses(): Array<{ name: string; status: 'online' | 'degraded' | 'offline'; latency: number; fee: string; pairs: number }> {
  return [
    { name: 'Binance', status: 'online', latency: Math.round(8 + Math.random() * 6), fee: '0.10%', pairs: 52 },
    { name: 'OKX', status: Math.random() > 0.05 ? 'online' : 'degraded', latency: Math.round(15 + Math.random() * 10), fee: '0.08%', pairs: 48 },
    { name: 'Bybit', status: Math.random() > 0.08 ? 'online' : 'degraded', latency: Math.round(12 + Math.random() * 8), fee: '0.10%', pairs: 45 },
  ];
}

// ── Smart Order Router ──
export function routeOrder(
  symbol: string,
  side: 'BUY' | 'SELL',
  quantity: number,
  exchanges: ExchangeQuote[],
): { exchange: string; price: number; estimatedFee: number; estimatedSlippage: number } {
  const online = exchanges.filter(e => e.status !== 'offline');
  if (online.length === 0) {
    return { exchange: 'Binance', price: 0, estimatedFee: 0, estimatedSlippage: 0 };
  }

  // For BUY: find lowest ask with sufficient size
  // For SELL: find highest bid with sufficient size
  let best: ExchangeQuote;
  if (side === 'BUY') {
    best = online.reduce((b, e) => {
      const score = e.bestAsk - e.fee * e.bestAsk; // effective price after fees
      const bScore = b.bestAsk - b.fee * b.bestAsk;
      return score < bScore ? e : b;
    });
  } else {
    best = online.reduce((b, e) => {
      const score = e.bestBid - e.fee * e.bestBid;
      const bScore = b.bestBid - b.fee * b.bestBid;
      return score > bScore ? e : b;
    });
  }

  const price = side === 'BUY' ? best.bestAsk : best.bestBid;
  const slippage = quantity > (side === 'BUY' ? best.askSize : best.bidSize)
    ? price * 0.001 // estimated slippage for large orders
    : price * 0.0001;

  return {
    exchange: best.exchange,
    price,
    estimatedFee: +(price * quantity * best.fee).toFixed(4),
    estimatedSlippage: +slippage.toFixed(4),
  };
}
