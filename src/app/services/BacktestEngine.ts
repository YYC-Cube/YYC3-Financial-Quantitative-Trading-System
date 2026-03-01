// ================================================================
// BacktestEngine - Strategy Backtesting Service
// ================================================================
// Runs strategy logic against historical K-line data from BinanceKLineService
// Supports: MA Crossover, RSI Bounce, MACD Divergence, Bollinger Breakout
// Outputs: equity curve, trade log, comprehensive stats
// ================================================================

import { getKLineService, type CandleData, type KLineInterval } from './BinanceKLineService';

// ── Types ──

export interface StrategyParams {
  type: 'ma_cross' | 'rsi_bounce' | 'macd_divergence' | 'bollinger_breakout';
  // MA Crossover
  fastPeriod?: number;
  slowPeriod?: number;
  // RSI
  rsiPeriod?: number;
  rsiOversold?: number;
  rsiOverbought?: number;
  // Bollinger
  bollPeriod?: number;
  bollStdDev?: number;
  // Common
  stopLoss?: number;     // percent, e.g. 2 = 2%
  takeProfit?: number;   // percent
  positionSize?: number; // fraction of capital, e.g. 0.1 = 10%
}

export interface BacktestConfig {
  symbol: string;
  interval: KLineInterval;
  candleCount: number;
  initialCapital: number;
  strategy: StrategyParams;
}

export interface BacktestTrade {
  id: number;
  entryTime: number;
  exitTime: number;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  reason: 'signal' | 'stop_loss' | 'take_profit' | 'end_of_data';
}

export interface EquityPoint {
  time: number;
  equity: number;
  drawdown: number;
  benchmark: number;
}

export interface BacktestResult {
  // Config
  symbol: string;
  strategyType: string;
  period: string;
  candleCount: number;
  dataSource: 'binance' | 'cache' | 'simulated';

  // Equity curve
  equityCurve: EquityPoint[];

  // Trades
  trades: BacktestTrade[];

  // Stats
  stats: {
    totalReturn: number;       // percent
    annualizedReturn: number;  // percent
    maxDrawdown: number;       // percent (negative)
    sharpeRatio: number;
    sortinoRatio: number;
    winRate: number;           // percent
    profitFactor: number;
    totalTrades: number;
    avgWin: number;
    avgLoss: number;
    avgHoldingPeriod: string;
    bestTrade: number;
    worstTrade: number;
    calmarRatio: number;
    benchmarkReturn: number;   // percent (buy-and-hold)
    alpha: number;             // excess return over benchmark
  };
}

// ── Indicator Helpers ──

function sma(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(NaN); continue; }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j];
    result.push(sum / period);
  }
  return result;
}

function ema(data: number[], period: number): number[] {
  const result: number[] = [];
  const k = 2 / (period + 1);
  for (let i = 0; i < data.length; i++) {
    if (i === 0) { result.push(data[0]); continue; }
    if (i < period - 1) { result.push(NaN); continue; }
    if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[j];
      result.push(sum / period);
      continue;
    }
    result.push(data[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

function rsi(closes: number[], period: number = 14): number[] {
  const result: number[] = new Array(closes.length).fill(NaN);
  if (closes.length <= period) return result;

  let gainSum = 0, lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gainSum += diff; else lossSum += Math.abs(diff);
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  result[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(0, diff)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(0, -diff)) / period;
    result[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
  }
  return result;
}

function macd(closes: number[]): { macdLine: number[]; signal: number[]; histogram: number[] } {
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macdLine = ema12.map((v, i) => (isNaN(v) || isNaN(ema26[i])) ? NaN : v - ema26[i]);
  const validMacd = macdLine.filter(v => !isNaN(v));
  const signalRaw = ema(validMacd, 9);

  const signal: number[] = [];
  let signalIdx = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (isNaN(macdLine[i])) { signal.push(NaN); continue; }
    signal.push(signalIdx < signalRaw.length ? signalRaw[signalIdx++] : NaN);
  }

  const histogram = macdLine.map((v, i) => (isNaN(v) || isNaN(signal[i])) ? NaN : v - signal[i]);
  return { macdLine, signal, histogram };
}

function bollinger(closes: number[], period: number = 20, stdDevMult: number = 2): { upper: number[]; middle: number[]; lower: number[] } {
  const middle = sma(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) { upper.push(NaN); lower.push(NaN); continue; }
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) sumSq += (closes[j] - middle[i]) ** 2;
    const std = Math.sqrt(sumSq / period);
    upper.push(middle[i] + stdDevMult * std);
    lower.push(middle[i] - stdDevMult * std);
  }

  return { upper, middle, lower };
}

// ── Engine ──

export async function runBacktest(config: BacktestConfig): Promise<BacktestResult> {
  const svc = getKLineService();
  const { data: candles, source } = await svc.getKLines(config.symbol, config.interval, config.candleCount);

  if (candles.length < 30) {
    throw new Error('Insufficient data for backtesting (need at least 30 candles)');
  }

  const closes = candles.map(c => c.close);
  const trades: BacktestTrade[] = [];
  let capital = config.initialCapital;
  let position: { side: 'LONG'; entryPrice: number; entryTime: number; quantity: number } | null = null;
  let tradeId = 0;
  const posSize = config.strategy.positionSize || 0.1;
  const stopLossPct = (config.strategy.stopLoss || 5) / 100;
  const takeProfitPct = (config.strategy.takeProfit || 10) / 100;

  // Generate signals based on strategy type
  const signals: ('buy' | 'sell' | 'hold')[] = new Array(candles.length).fill('hold');

  switch (config.strategy.type) {
    case 'ma_cross': {
      const fast = sma(closes, config.strategy.fastPeriod || 10);
      const slow = sma(closes, config.strategy.slowPeriod || 30);
      for (let i = 1; i < candles.length; i++) {
        if (isNaN(fast[i]) || isNaN(slow[i]) || isNaN(fast[i - 1]) || isNaN(slow[i - 1])) continue;
        if (fast[i] > slow[i] && fast[i - 1] <= slow[i - 1]) signals[i] = 'buy';
        if (fast[i] < slow[i] && fast[i - 1] >= slow[i - 1]) signals[i] = 'sell';
      }
      break;
    }
    case 'rsi_bounce': {
      const rsiVals = rsi(closes, config.strategy.rsiPeriod || 14);
      const oversold = config.strategy.rsiOversold || 30;
      const overbought = config.strategy.rsiOverbought || 70;
      for (let i = 1; i < candles.length; i++) {
        if (isNaN(rsiVals[i]) || isNaN(rsiVals[i - 1])) continue;
        if (rsiVals[i - 1] < oversold && rsiVals[i] >= oversold) signals[i] = 'buy';
        if (rsiVals[i - 1] > overbought && rsiVals[i] <= overbought) signals[i] = 'sell';
      }
      break;
    }
    case 'macd_divergence': {
      const { histogram } = macd(closes);
      for (let i = 1; i < candles.length; i++) {
        if (isNaN(histogram[i]) || isNaN(histogram[i - 1])) continue;
        if (histogram[i] > 0 && histogram[i - 1] <= 0) signals[i] = 'buy';
        if (histogram[i] < 0 && histogram[i - 1] >= 0) signals[i] = 'sell';
      }
      break;
    }
    case 'bollinger_breakout': {
      const boll = bollinger(closes, config.strategy.bollPeriod || 20, config.strategy.bollStdDev || 2);
      for (let i = 1; i < candles.length; i++) {
        if (isNaN(boll.upper[i]) || isNaN(boll.lower[i])) continue;
        if (closes[i] > boll.upper[i] && closes[i - 1] <= boll.upper[i - 1]) signals[i] = 'buy';
        if (closes[i] < boll.lower[i] && closes[i - 1] >= boll.lower[i - 1]) signals[i] = 'sell';
      }
      break;
    }
  }

  // Execute trades
  const equityCurve: EquityPoint[] = [];
  let peak = capital;
  const benchmarkStart = closes[0];

  for (let i = 0; i < candles.length; i++) {
    const price = closes[i];
    const time = candles[i].time;

    // Check stop loss / take profit
    if (position) {
      const pnlPct = (price - position.entryPrice) / position.entryPrice;
      if (pnlPct <= -stopLossPct) {
        const pnl = (price - position.entryPrice) * position.quantity;
        capital += position.entryPrice * position.quantity + pnl;
        trades.push({
          id: ++tradeId, entryTime: position.entryTime, exitTime: time, side: 'LONG',
          entryPrice: position.entryPrice, exitPrice: price, quantity: position.quantity,
          pnl, pnlPercent: pnlPct * 100, reason: 'stop_loss',
        });
        position = null;
      } else if (pnlPct >= takeProfitPct) {
        const pnl = (price - position.entryPrice) * position.quantity;
        capital += position.entryPrice * position.quantity + pnl;
        trades.push({
          id: ++tradeId, entryTime: position.entryTime, exitTime: time, side: 'LONG',
          entryPrice: position.entryPrice, exitPrice: price, quantity: position.quantity,
          pnl, pnlPercent: pnlPct * 100, reason: 'take_profit',
        });
        position = null;
      }
    }

    // Process signal
    if (signals[i] === 'buy' && !position) {
      const investAmount = capital * posSize;
      const qty = investAmount / price;
      capital -= investAmount;
      position = { side: 'LONG', entryPrice: price, entryTime: time, quantity: qty };
    } else if (signals[i] === 'sell' && position) {
      const pnl = (price - position.entryPrice) * position.quantity;
      capital += position.entryPrice * position.quantity + pnl;
      const pnlPct = (price - position.entryPrice) / position.entryPrice;
      trades.push({
        id: ++tradeId, entryTime: position.entryTime, exitTime: time, side: 'LONG',
        entryPrice: position.entryPrice, exitPrice: price, quantity: position.quantity,
        pnl, pnlPercent: pnlPct * 100, reason: 'signal',
      });
      position = null;
    }

    // Compute equity
    const posValue = position ? position.quantity * price : 0;
    const equity = capital + posValue;
    peak = Math.max(peak, equity);
    const drawdown = ((equity - peak) / peak) * 100;
    const benchmark = ((price - benchmarkStart) / benchmarkStart) * 100;

    equityCurve.push({ time, equity, drawdown, benchmark });
  }

  // Close open position at end
  if (position) {
    const lastPrice = closes[closes.length - 1];
    const pnl = (lastPrice - position.entryPrice) * position.quantity;
    const pnlPct = (lastPrice - position.entryPrice) / position.entryPrice;
    capital += position.entryPrice * position.quantity + pnl;
    trades.push({
      id: ++tradeId, entryTime: position.entryTime, exitTime: candles[candles.length - 1].time,
      side: 'LONG', entryPrice: position.entryPrice, exitPrice: lastPrice,
      quantity: position.quantity, pnl, pnlPercent: pnlPct * 100, reason: 'end_of_data',
    });
  }

  // Compute stats
  const finalEquity = equityCurve[equityCurve.length - 1]?.equity || config.initialCapital;
  const totalReturn = ((finalEquity - config.initialCapital) / config.initialCapital) * 100;
  const benchmarkReturn = ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100;
  const maxDrawdown = Math.min(0, ...equityCurve.map(e => e.drawdown));

  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnlPercent, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + t.pnlPercent, 0) / losses.length : 0;
  const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Estimate annualized from time span
  const timeSpanMs = candles.length > 1 ? candles[candles.length - 1].time - candles[0].time : 1;
  const yearsSpan = timeSpanMs / (365.25 * 24 * 3600 * 1000);
  const annualizedReturn = yearsSpan > 0 ? ((1 + totalReturn / 100) ** (1 / yearsSpan) - 1) * 100 : totalReturn;

  // Simplified Sharpe (using equity curve returns)
  const returns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    returns.push((equityCurve[i].equity - equityCurve[i - 1].equity) / equityCurve[i - 1].equity);
  }
  const avgReturn = returns.length > 0 ? returns.reduce((s, r) => s + r, 0) / returns.length : 0;
  const stdDev = returns.length > 1 ? Math.sqrt(returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / (returns.length - 1)) : 1;
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // annualized

  const downReturns = returns.filter(r => r < 0);
  const downStd = downReturns.length > 1 ? Math.sqrt(downReturns.reduce((s, r) => s + r ** 2, 0) / downReturns.length) : 1;
  const sortinoRatio = downStd > 0 ? (avgReturn / downStd) * Math.sqrt(252) : 0;

  const calmarRatio = maxDrawdown !== 0 ? annualizedReturn / Math.abs(maxDrawdown) : 0;

  const avgHoldMs = trades.length > 0 ? trades.reduce((s, t) => s + (t.exitTime - t.entryTime), 0) / trades.length : 0;
  const avgHoldHours = avgHoldMs / 3_600_000;
  const avgHoldingPeriod = avgHoldHours < 1 ? `${(avgHoldHours * 60).toFixed(0)}m` : avgHoldHours < 24 ? `${avgHoldHours.toFixed(1)}h` : `${(avgHoldHours / 24).toFixed(1)}d`;

  const STRAT_NAMES: Record<string, string> = {
    ma_cross: '均线交叉', rsi_bounce: 'RSI反弹',
    macd_divergence: 'MACD背离', bollinger_breakout: '布林突破',
  };

  return {
    symbol: config.symbol,
    strategyType: STRAT_NAMES[config.strategy.type] || config.strategy.type,
    period: `${config.interval} × ${candles.length}`,
    candleCount: candles.length,
    dataSource: source,
    equityCurve,
    trades,
    stats: {
      totalReturn: +totalReturn.toFixed(2),
      annualizedReturn: +annualizedReturn.toFixed(2),
      maxDrawdown: +maxDrawdown.toFixed(2),
      sharpeRatio: +sharpeRatio.toFixed(2),
      sortinoRatio: +sortinoRatio.toFixed(2),
      winRate: +winRate.toFixed(1),
      profitFactor: profitFactor === Infinity ? 999 : +profitFactor.toFixed(2),
      totalTrades: trades.length,
      avgWin: +avgWin.toFixed(2),
      avgLoss: +avgLoss.toFixed(2),
      avgHoldingPeriod,
      bestTrade: trades.length > 0 ? +Math.max(...trades.map(t => t.pnlPercent)).toFixed(2) : 0,
      worstTrade: trades.length > 0 ? +Math.min(...trades.map(t => t.pnlPercent)).toFixed(2) : 0,
      calmarRatio: +calmarRatio.toFixed(2),
      benchmarkReturn: +benchmarkReturn.toFixed(2),
      alpha: +(totalReturn - benchmarkReturn).toFixed(2),
    },
  };
}

// Strategy type labels
export const STRATEGY_TYPES = [
  { id: 'ma_cross' as const, name: '均线交叉', desc: '快慢均线金叉/死叉' },
  { id: 'rsi_bounce' as const, name: 'RSI反弹', desc: 'RSI超买超卖反转' },
  { id: 'macd_divergence' as const, name: 'MACD背离', desc: 'MACD柱状图零轴交叉' },
  { id: 'bollinger_breakout' as const, name: '布林突破', desc: '布林带上下轨突破' },
];
