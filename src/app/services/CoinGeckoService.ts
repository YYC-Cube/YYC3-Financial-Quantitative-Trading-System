// ================================================================
// CoinGecko REST API Service
// ================================================================
// Fetches top 50+ cryptocurrencies by market cap
// Public API (no key needed, rate limit: 10-30 req/min)
// Includes memory cache + localStorage fallback + rich simulation
// ================================================================

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

// Map CoinGecko data to our MarketAsset format
export interface NormalizedAsset {
  symbol: string;     // e.g. "DOGE/USDT"
  name: string;       // e.g. "Dogecoin"
  price: number;
  change: number;
  volume: string;
  high24h: number;
  low24h: number;
  marketCap: string;
  category: '加密货币';
}

const CACHE_KEY = 'yyc_coingecko_cache';
const CACHE_TTL = 120_000; // 2 minutes (avoid rate limit)
const FETCH_TIMEOUT = 8000;

// Binance-tracked symbols (already handled by WebSocket, we keep them for reference)
const BINANCE_TRACKED = new Set(['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA']);

// Expanded coin list for simulation fallback (50+ coins)
const SIMULATED_COINS: Array<{ id: string; symbol: string; name: string; price: number; mcap: number }> = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 96231, mcap: 1910000 },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 2451, mcap: 294000 },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 582, mcap: 87000 },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 142, mcap: 65000 },
  { id: 'ripple', symbol: 'XRP', name: 'Ripple', price: 1.05, mcap: 58000 },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0.128, mcap: 18200 },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.45, mcap: 16000 },
  { id: 'tron', symbol: 'TRX', name: 'TRON', price: 0.128, mcap: 11200 },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', price: 28.5, mcap: 10800 },
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu', price: 0.0000125, mcap: 7400 },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', price: 15.2, mcap: 9500 },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', price: 5.8, mcap: 8200 },
  { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash', price: 380, mcap: 7500 },
  { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol', price: 4.2, mcap: 4800 },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', price: 82, mcap: 6100 },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', price: 9.5, mcap: 5700 },
  { id: 'internet-computer', symbol: 'ICP', name: 'Internet Computer', price: 8.2, mcap: 3800 },
  { id: 'ethereum-classic', symbol: 'ETC', name: 'Ethereum Classic', price: 22.5, mcap: 3300 },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar', price: 0.112, mcap: 3200 },
  { id: 'aptos', symbol: 'APT', name: 'Aptos', price: 7.8, mcap: 3500 },
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos', price: 7.5, mcap: 2900 },
  { id: 'filecoin', symbol: 'FIL', name: 'Filecoin', price: 4.8, mcap: 2700 },
  { id: 'hedera-hashgraph', symbol: 'HBAR', name: 'Hedera', price: 0.072, mcap: 2600 },
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum', price: 0.95, mcap: 3200 },
  { id: 'mantle', symbol: 'MNT', name: 'Mantle', price: 0.78, mcap: 2500 },
  { id: 'vechain', symbol: 'VET', name: 'VeChain', price: 0.028, mcap: 2200 },
  { id: 'maker', symbol: 'MKR', name: 'Maker', price: 1520, mcap: 1400 },
  { id: 'optimism', symbol: 'OP', name: 'Optimism', price: 1.85, mcap: 2100 },
  { id: 'injective-protocol', symbol: 'INJ', name: 'Injective', price: 18.5, mcap: 1800 },
  { id: 'the-graph', symbol: 'GRT', name: 'The Graph', price: 0.185, mcap: 1750 },
  { id: 'aave', symbol: 'AAVE', name: 'Aave', price: 145, mcap: 2200 },
  { id: 'theta-token', symbol: 'THETA', name: 'Theta Network', price: 1.45, mcap: 1450 },
  { id: 'fantom', symbol: 'FTM', name: 'Fantom', price: 0.52, mcap: 1400 },
  { id: 'algorand', symbol: 'ALGO', name: 'Algorand', price: 0.22, mcap: 1800 },
  { id: 'sei-network', symbol: 'SEI', name: 'Sei', price: 0.38, mcap: 1200 },
  { id: 'stacks', symbol: 'STX', name: 'Stacks', price: 1.65, mcap: 2400 },
  { id: 'render-token', symbol: 'RNDR', name: 'Render', price: 5.8, mcap: 2300 },
  { id: 'flow', symbol: 'FLOW', name: 'Flow', price: 0.72, mcap: 1100 },
  { id: 'celestia', symbol: 'TIA', name: 'Celestia', price: 6.5, mcap: 1600 },
  { id: 'axie-infinity', symbol: 'AXS', name: 'Axie Infinity', price: 6.2, mcap: 950 },
  { id: 'decentraland', symbol: 'MANA', name: 'Decentraland', price: 0.38, mcap: 720 },
  { id: 'the-sandbox', symbol: 'SAND', name: 'The Sandbox', price: 0.42, mcap: 950 },
  { id: 'gala', symbol: 'GALA', name: 'Gala', price: 0.032, mcap: 1100 },
  { id: 'eos', symbol: 'EOS', name: 'EOS', price: 0.78, mcap: 900 },
  { id: 'iota', symbol: 'IOTA', name: 'IOTA', price: 0.22, mcap: 760 },
  { id: 'neo', symbol: 'NEO', name: 'Neo', price: 11.5, mcap: 810 },
  { id: 'lido-dao', symbol: 'LDO', name: 'Lido DAO', price: 2.1, mcap: 1900 },
  { id: 'sui', symbol: 'SUI', name: 'Sui', price: 1.25, mcap: 3600 },
  { id: 'pepe', symbol: 'PEPE', name: 'Pepe', price: 0.0000082, mcap: 3400 },
  { id: 'worldcoin-wld', symbol: 'WLD', name: 'Worldcoin', price: 2.35, mcap: 1400 },
  { id: 'fetch-ai', symbol: 'FET', name: 'Fetch.ai', price: 1.45, mcap: 1200 },
  { id: 'jupiter-ag', symbol: 'JUP', name: 'Jupiter', price: 0.82, mcap: 1100 },
];

function formatVolume(vol: number): string {
  if (vol >= 1e12) return (vol / 1e12).toFixed(1) + 'T';
  if (vol >= 1e9) return (vol / 1e9).toFixed(1) + 'B';
  if (vol >= 1e6) return (vol / 1e6).toFixed(0) + 'M';
  if (vol >= 1e3) return (vol / 1e3).toFixed(0) + 'K';
  return vol.toFixed(0);
}

function formatMcap(mcap: number): string {
  if (mcap >= 1e12) return (mcap / 1e12).toFixed(2) + 'T';
  if (mcap >= 1e9) return (mcap / 1e9).toFixed(0) + 'B';
  if (mcap >= 1e6) return (mcap / 1e6).toFixed(0) + 'M';
  return mcap.toFixed(0);
}

function priceDec(price: number): number {
  if (price > 1000) return 2;
  if (price > 1) return 4;
  if (price > 0.001) return 6;
  return 10;
}

class CoinGeckoServiceImpl {
  private cache: { data: CoinGeckoAsset[]; fetchedAt: number } | null = null;

  /**
   * Fetch top 50 cryptocurrencies from CoinGecko
   * Returns normalized MarketAsset format
   */
  async getTopCoins(count: number = 50): Promise<{ assets: NormalizedAsset[]; source: 'coingecko' | 'cache' | 'simulated' }> {
    // Check memory cache
    if (this.cache && (Date.now() - this.cache.fetchedAt) < CACHE_TTL) {
      return { assets: this.normalize(this.cache.data), source: 'cache' };
    }

    try {
      const data = await this.fetchFromAPI(count);
      this.cache = { data, fetchedAt: Date.now() };
      this.persistToStorage(data);
      return { assets: this.normalize(data), source: 'coingecko' };
    } catch (err) {
      console.debug('[CoinGecko] API unavailable, using fallback data');
      const stored = this.loadFromStorage();
      if (stored.length > 0) {
        return { assets: this.normalize(stored), source: 'cache' };
      }
      return { assets: this.generateSimulated(), source: 'simulated' };
    }
  }

  /**
   * Get only non-Binance-tracked coins (to supplement existing 6 pairs)
   */
  async getSupplementaryCoins(): Promise<{ assets: NormalizedAsset[]; source: 'coingecko' | 'cache' | 'simulated' }> {
    const result = await this.getTopCoins(60);
    const filtered = result.assets.filter(a => {
      const sym = a.symbol.split('/')[0];
      return !BINANCE_TRACKED.has(sym);
    });
    return { assets: filtered, source: result.source };
  }

  private async fetchFromAPI(count: number): Promise<CoinGeckoAsset[]> {
    const perPage = Math.min(count, 100);
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=false&price_change_percentage=24h`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const raw: Array<Record<string, unknown>> = await response.json();

      return raw
        .filter((coin) => coin.id && coin.symbol && coin.current_price)
        .map((coin, i) => ({
          id: coin.id as string,
          symbol: (coin.symbol as string).toUpperCase(),
          name: coin.name as string,
          price: coin.current_price as number,
          change24h: (coin.price_change_percentage_24h as number) || 0,
          volume24h: (coin.total_volume as number) || 0,
          marketCap: (coin.market_cap as number) || 0,
          high24h: (coin.high_24h as number) || 0,
          low24h: (coin.low_24h as number) || 0,
          rank: (coin.market_cap_rank as number) || i + 1,
          image: (coin.image as string) || '',
        }));
    } finally {
      clearTimeout(timeout);
    }
  }

  private normalize(coins: CoinGeckoAsset[]): NormalizedAsset[] {
    return coins.map(coin => ({
      symbol: `${coin.symbol}/USDT`,
      name: coin.name,
      price: +coin.price.toFixed(priceDec(coin.price)),
      change: +coin.change24h.toFixed(2),
      volume: formatVolume(coin.volume24h),
      high24h: coin.high24h,
      low24h: coin.low24h,
      marketCap: formatMcap(coin.marketCap),
      category: '加密货币' as const,
    }));
  }

  private generateSimulated(): NormalizedAsset[] {
    return SIMULATED_COINS.map((coin, i) => {
      const change = +(((Math.random() - 0.45) * 10).toFixed(2));
      const vol = coin.mcap * (0.02 + Math.random() * 0.08);
      return {
        symbol: `${coin.symbol}/USDT`,
        name: coin.name,
        price: +(coin.price * (0.98 + Math.random() * 0.04)).toFixed(priceDec(coin.price)),
        change,
        volume: formatVolume(vol * 1e6),
        high24h: +(coin.price * 1.03).toFixed(priceDec(coin.price)),
        low24h: +(coin.price * 0.97).toFixed(priceDec(coin.price)),
        marketCap: formatMcap(coin.mcap * 1e6),
        category: '加密货币',
      };
    });
  }

  private persistToStorage(data: CoinGeckoAsset[]): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, savedAt: Date.now() }));
    } catch { /* storage full */ }
  }

  private loadFromStorage(): CoinGeckoAsset[] {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.savedAt > 3_600_000) return []; // 1hr expiry
      return parsed.data || [];
    } catch { return []; }
  }

  clearCache(): void {
    this.cache = null;
    localStorage.removeItem(CACHE_KEY);
  }
}

// Singleton
let _instance: CoinGeckoServiceImpl | null = null;

export function getCoinGeckoService(): CoinGeckoServiceImpl {
  if (!_instance) _instance = new CoinGeckoServiceImpl();
  return _instance;
}