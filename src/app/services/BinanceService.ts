// ================================================================
// Binance Public WebSocket Service
// ================================================================
// Connects to Binance's free public WebSocket API (no API key needed)
// Provides real-time 24hr ticker data for crypto trading pairs
// Gracefully falls back to simulation if WebSocket connection fails
// ================================================================

export interface BinanceTicker {
  symbol: string;       // e.g. "BTCUSDT"
  lastPrice: number;    // current price
  priceChangePercent: number; // 24h change %
  highPrice: number;    // 24h high
  lowPrice: number;     // 24h low
  volume: number;       // 24h base asset volume
  quoteVolume: number;  // 24h quote asset volume
}

// Mapping from Binance symbols to our display format
const SYMBOL_MAP: Record<string, { display: string; name: string }> = {
  'BTCUSDT':  { display: 'BTC/USDT',  name: 'Bitcoin' },
  'ETHUSDT':  { display: 'ETH/USDT',  name: 'Ethereum' },
  'SOLUSDT':  { display: 'SOL/USDT',  name: 'Solana' },
  'BNBUSDT':  { display: 'BNB/USDT',  name: 'BNB' },
  'XRPUSDT':  { display: 'XRP/USDT',  name: 'Ripple' },
  'ADAUSDT':  { display: 'ADA/USDT',  name: 'Cardano' },
};

const TRACKED_SYMBOLS = Object.keys(SYMBOL_MAP).map(s => s.toLowerCase());

type TickerCallback = (tickers: Map<string, BinanceTicker>) => void;
type StatusCallback = (status: ConnectionStatus) => void;

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'simulated';

export class BinanceService {
  private ws: WebSocket | null = null;
  private tickers = new Map<string, BinanceTicker>();
  private onUpdate: TickerCallback | null = null;
  private onStatusChange: StatusCallback | null = null;
  private status: ConnectionStatus = 'disconnected';
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private connectTimeout: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private hasEverConnected = false;    // tracks if WS has ever reached OPEN state
  private initialErrored = false;      // tracks if onerror fired before onopen

  // Build combined stream URL for all tracked symbols
  private get streamUrl(): string {
    const streams = TRACKED_SYMBOLS.map(s => `${s}@ticker`).join('/');
    return `wss://stream.binance.com:9443/stream?streams=${streams}`;
  }

  subscribe(onUpdate: TickerCallback, onStatusChange?: StatusCallback): void {
    this.onUpdate = onUpdate;
    this.onStatusChange = onStatusChange || null;
    this.connect();
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.onStatusChange?.(status);
  }

  private connect(): void {
    if (this.destroyed) return;

    // Clean up previous connection
    this.cleanup();
    this.setStatus('connecting');
    this.initialErrored = false;

    try {
      this.ws = new WebSocket(this.streamUrl);

      // Connection timeout: if not open within 5s, treat as failed
      this.connectTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          console.debug('[BinanceService] Connection timeout, falling back to simulation');
          this.ws.close();
          this.fallbackToSimulation();
        }
      }, 5000);

      this.ws.onopen = () => {
        if (this.connectTimeout) {
          clearTimeout(this.connectTimeout);
          this.connectTimeout = null;
        }
        this.reconnectAttempts = 0;
        this.hasEverConnected = true;
        this.setStatus('connected');
        console.info('[BinanceService] WebSocket connected to Binance');
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const wrapper = JSON.parse(event.data);
          // Combined stream wraps data in { stream, data } format
          const data = wrapper.data || wrapper;
          
          if (data.e === '24hrTicker' && data.s) {
            const symbol = data.s as string;
            if (SYMBOL_MAP[symbol]) {
              const ticker: BinanceTicker = {
                symbol,
                lastPrice: parseFloat(data.c),
                priceChangePercent: parseFloat(data.P),
                highPrice: parseFloat(data.h),
                lowPrice: parseFloat(data.l),
                volume: parseFloat(data.v),
                quoteVolume: parseFloat(data.q),
              };
              this.tickers.set(symbol, ticker);
              this.onUpdate?.(new Map(this.tickers));
            }
          }
        } catch (e) {
          // Silently ignore parse errors
        }
      };

      this.ws.onerror = () => {
        // Mark that onerror fired before onopen — this is an initial connection failure
        if (!this.hasEverConnected) {
          this.initialErrored = true;
        }
        console.debug('[BinanceService] WebSocket error (environment may block external WS)');
      };

      this.ws.onclose = () => {
        if (this.connectTimeout) {
          clearTimeout(this.connectTimeout);
          this.connectTimeout = null;
        }
        
        if (this.destroyed) return;

        // If we've never connected and the initial attempt errored,
        // skip retries entirely — the environment likely blocks external WS
        if (!this.hasEverConnected && this.initialErrored) {
          this.fallbackToSimulation();
          return;
        }

        if (this.hasEverConnected && this.status === 'connected') {
          // Was connected, try to reconnect
          this.attemptReconnect();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          // Max retries reached, fall back
          this.fallbackToSimulation();
        } else {
          this.attemptReconnect();
        }
      };
    } catch (e) {
      console.debug('[BinanceService] Failed to create WebSocket:', e);
      this.fallbackToSimulation();
    }
  }

  private attemptReconnect(): void {
    if (this.destroyed) return;
    this.reconnectAttempts++;

    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      this.fallbackToSimulation();
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 10000);
    console.info(`[BinanceService] Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    this.setStatus('connecting');
    
    this.reconnectTimer = setTimeout(() => {
      if (!this.destroyed) {
        this.connect();
      }
    }, delay);
  }

  private fallbackToSimulation(): void {
    if (this.destroyed) return;
    if (this.status === 'simulated') return;    // already in simulation, skip duplicate calls
    console.info('[BinanceService] Using simulated market data');
    this.setStatus('simulated');
    // Clear any tickers so the consumer knows to use simulation
    this.tickers.clear();
    this.onUpdate?.(new Map());
  }

  private cleanup(): void {
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }
  }

  destroy(): void {
    this.destroyed = true;
    this.cleanup();
    this.tickers.clear();
    this.onUpdate = null;
    this.onStatusChange = null;
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  // Static helper: convert BinanceTicker map to volume display string
  static formatVolume(quoteVolume: number): string {
    if (quoteVolume >= 1e12) return (quoteVolume / 1e12).toFixed(2) + 'T';
    if (quoteVolume >= 1e9) return (quoteVolume / 1e9).toFixed(1) + 'B';
    if (quoteVolume >= 1e6) return (quoteVolume / 1e6).toFixed(1) + 'M';
    if (quoteVolume >= 1e3) return (quoteVolume / 1e3).toFixed(1) + 'K';
    return quoteVolume.toFixed(0);
  }

  // Static helper: get display info for a Binance symbol
  static getDisplayInfo(binanceSymbol: string): { display: string; name: string } | undefined {
    return SYMBOL_MAP[binanceSymbol];
  }
}

// Singleton for app-wide use
let _instance: BinanceService | null = null;

export function getBinanceService(): BinanceService {
  if (!_instance) {
    _instance = new BinanceService();
  }
  return _instance;
}

export function destroyBinanceService(): void {
  if (_instance) {
    _instance.destroy();
    _instance = null;
  }
}