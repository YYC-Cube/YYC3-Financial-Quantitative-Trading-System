// ================================================================
// Binance K-Line (Candlestick) Historical Data Service
// ================================================================
// Fetches historical OHLCV data from Binance public REST API (no key needed)
// Supports multiple timeframes: 1m, 5m, 15m, 1h, 4h, 1d, 1w
// Includes memory cache + localStorage fallback + simulation generator
// ================================================================

export interface CandleData {
  time: number;     // Unix timestamp ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;   // Base asset volume
  quoteVolume: number; // Quote asset volume (USDT)
}

export type KLineInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

// Binance interval mapping
const INTERVAL_MS: Record<KLineInterval, number> = {
  '1m': 60_000,
  '5m': 300_000,
  '15m': 900_000,
  '1h': 3_600_000,
  '4h': 14_400_000,
  '1d': 86_400_000,
  '1w': 604_800_000,
};

// Symbol mapping: our display format → Binance symbol
const SYMBOL_TO_BINANCE: Record<string, string> = {
  'BTC/USDT': 'BTCUSDT',
  'ETH/USDT': 'ETHUSDT',
  'SOL/USDT': 'SOLUSDT',
  'BNB/USDT': 'BNBUSDT',
  'XRP/USDT': 'XRPUSDT',
  'ADA/USDT': 'ADAUSDT',
};

// Base prices for simulation fallback
const BASE_PRICES: Record<string, number> = {
  'BTCUSDT': 96000,
  'ETHUSDT': 2450,
  'SOLUSDT': 140,
  'BNBUSDT': 580,
  'XRPUSDT': 0.62,
  'ADAUSDT': 0.45,
};

interface CacheEntry {
  data: CandleData[];
  fetchedAt: number;
  symbol: string;
  interval: KLineInterval;
}

// Cache TTL based on interval
function getCacheTTL(interval: KLineInterval): number {
  switch (interval) {
    case '1m': return 30_000;       // 30s for 1m candles
    case '5m': return 60_000;       // 1min
    case '15m': return 120_000;     // 2min
    case '1h': return 300_000;      // 5min
    case '4h': return 600_000;      // 10min
    case '1d': return 3_600_000;    // 1hr
    case '1w': return 14_400_000;   // 4hr
  }
}

class BinanceKLineServiceImpl {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Promise<CandleData[]>>();

  private cacheKey(symbol: string, interval: KLineInterval, limit: number): string {
    return `${symbol}_${interval}_${limit}`;
  }

  /**
   * Fetch K-line data. Tries Binance REST first, falls back to simulation.
   * Results are cached in memory with TTL.
   */
  async getKLines(
    displaySymbol: string,
    interval: KLineInterval = '1h',
    limit: number = 100,
  ): Promise<{ data: CandleData[]; source: 'binance' | 'cache' | 'simulated' }> {
    const binanceSymbol = SYMBOL_TO_BINANCE[displaySymbol];
    if (!binanceSymbol) {
      return { data: this.generateSimulated(displaySymbol, interval, limit), source: 'simulated' };
    }

    const key = this.cacheKey(binanceSymbol, interval, limit);

    // Check memory cache
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.fetchedAt) < getCacheTTL(interval)) {
      return { data: cached.data, source: 'cache' };
    }

    // De-duplicate concurrent requests for the same key
    const pending = this.pendingRequests.get(key);
    if (pending) {
      const data = await pending;
      return { data, source: 'binance' };
    }

    const request = this.fetchFromBinance(binanceSymbol, interval, limit);
    this.pendingRequests.set(key, request);

    try {
      const data = await request;
      this.cache.set(key, { data, fetchedAt: Date.now(), symbol: binanceSymbol, interval });
      this.persistToStorage(key, data);
      return { data, source: 'binance' };
    } catch (err) {
      console.warn('[BinanceKLine] REST fetch failed, trying localStorage cache:', err);
      // Try localStorage fallback
      const stored = this.loadFromStorage(key);
      if (stored.length > 0) {
        return { data: stored, source: 'cache' };
      }
      // Final fallback: simulated data
      return { data: this.generateSimulated(displaySymbol, interval, limit), source: 'simulated' };
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Fetch from Binance public REST API
   * Endpoint: GET /api/v3/klines
   */
  private async fetchFromBinance(
    symbol: string,
    interval: KLineInterval,
    limit: number,
  ): Promise<CandleData[]> {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const raw: unknown[][] = await response.json();

      // Binance kline response format:
      // [openTime, open, high, low, close, volume, closeTime, quoteVol, trades, ...]
      return raw.map((k) => ({
        time: k[0] as number,
        open: parseFloat(k[1] as string),
        high: parseFloat(k[2] as string),
        low: parseFloat(k[3] as string),
        close: parseFloat(k[4] as string),
        volume: parseFloat(k[5] as string),
        quoteVolume: parseFloat(k[7] as string),
      }));
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Generate realistic simulated candlestick data as fallback
   */
  private generateSimulated(
    displaySymbol: string,
    interval: KLineInterval,
    count: number,
  ): CandleData[] {
    const binSymbol = SYMBOL_TO_BINANCE[displaySymbol] || 'BTCUSDT';
    const basePrice = BASE_PRICES[binSymbol] || 100;
    const data: CandleData[] = [];
    let price = basePrice * (0.95 + Math.random() * 0.1);
    const now = Date.now();
    const intervalMs = INTERVAL_MS[interval];

    for (let i = count - 1; i >= 0; i--) {
      const volatility = price * (0.003 + Math.random() * 0.012);
      const direction = Math.random() > 0.48 ? 1 : -1;
      const open = price;
      const close = open + direction * volatility * (0.3 + Math.random() * 0.7);
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      const volume = (100 + Math.random() * 2000) * (basePrice > 1000 ? 0.1 : basePrice > 10 ? 10 : 1000);
      const quoteVolume = volume * ((open + close) / 2);

      data.push({
        time: now - i * intervalMs,
        open: +open.toFixed(basePrice > 100 ? 2 : basePrice > 1 ? 4 : 6),
        high: +high.toFixed(basePrice > 100 ? 2 : basePrice > 1 ? 4 : 6),
        low: +low.toFixed(basePrice > 100 ? 2 : basePrice > 1 ? 4 : 6),
        close: +close.toFixed(basePrice > 100 ? 2 : basePrice > 1 ? 4 : 6),
        volume: +volume.toFixed(2),
        quoteVolume: +quoteVolume.toFixed(2),
      });

      price = close;
    }
    return data;
  }

  // ── localStorage persistence ──
  private storageKey(cacheKey: string): string {
    return `yyc_kline_${cacheKey}`;
  }

  private persistToStorage(key: string, data: CandleData[]): void {
    try {
      // Only store the latest 200 candles to save space
      const trimmed = data.slice(-200);
      localStorage.setItem(this.storageKey(key), JSON.stringify({
        data: trimmed,
        savedAt: Date.now(),
      }));
    } catch {
      // Storage full — skip
    }
  }

  private loadFromStorage(key: string): CandleData[] {
    try {
      const raw = localStorage.getItem(this.storageKey(key));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      // Only use if saved within 24h
      if (Date.now() - parsed.savedAt > 86_400_000) return [];
      return parsed.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Clear all K-line cache (memory + localStorage)
   */
  clearCache(): void {
    this.cache.clear();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith('yyc_kline_')) localStorage.removeItem(k);
    }
  }

  /**
   * Get list of supported symbols
   */
  getSupportedSymbols(): { display: string; binance: string }[] {
    return Object.entries(SYMBOL_TO_BINANCE).map(([display, binance]) => ({ display, binance }));
  }
}

// ── Singleton ──
let _klineInstance: BinanceKLineServiceImpl | null = null;

export function getKLineService(): BinanceKLineServiceImpl {
  if (!_klineInstance) {
    _klineInstance = new BinanceKLineServiceImpl();
  }
  return _klineInstance;
}

export type { BinanceKLineServiceImpl as BinanceKLineService };
