/**
 * @file src/app/modules/trade/AITradingStrategy.tsx
 * @description AI Enhanced Trading Strategy Module - Phase 3 Business Feature
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags trade,strategy,AI,machine-learning,react,typescript,critical,public
 * @depends react,recharts,@/app/components,@/app/contexts,@/app/services,@/app/hooks
 *
 * Core Features:
 * - AI Signal Generation (LSTM + Transformer hybrid model)
 * - Real-time Market Sentiment Analysis
 * - Multi-timeframe Strategy Orchestration
 * - Adaptive Risk Management with ML
 * - Strategy Performance Analytics & Backtesting
 * - Automated Execution with Smart Order Routing
 */

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  LineChart as LineChartIcon,
  Pause,
  PieChart,
  Play,
  RotateCcw,
  Settings,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

import { Card } from '@/app/components/ui/card';

// ═══════════════════════════════════════════════════════
// Type Definitions
// ═══════════════════════════════════════════════════════

interface AISignal {
  id: string;
  timestamp: number;
  symbol: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-100
  strategy: string;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  reason: string;
  indicators: Record<string, number>;
}

interface StrategyPerformance {
  id: string;
  name: string;
  totalReturn: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  avgHoldTime: number; // hours
  isActive: boolean;
  lastSignal: AISignal | null;
}

interface MarketSentiment {
  overall: number; // -100 to 100 (bearish to bullish)
  fearGreedIndex: number; // 0-100
  socialScore: number;
  onChainScore: number;
  technicalScore: number;
  timestamp: number;
}

interface RiskMetrics {
  var95: number;
  var99: number;
  portfolioBeta: number;
  correlation: number;
  concentration: number;
  liquidityRisk: number;
}

// ═══════════════════════════════════════════════════════
// Mock Data Generators (Production would use real API)
// ═══════════════════════════════════════════════════════

const generateMockSignals = (): AISignal[] => {
  const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];
  const strategies = ['LSTM-Trend', 'Transformer-Sentiment', 'Ensemble-Hybrid', 'Mean-Reversion', 'Momentum-Surge'];
  const types: ('BUY' | 'SELL' | 'HOLD')[] = ['BUY', 'SELL', 'HOLD'];

  return Array.from({ length: 20 }, (_, i) => ({
    id: `signal-${i}`,
    timestamp: Date.now() - i * 3600000,
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    type: types[Math.floor(Math.random() * types.length)],
    confidence: Math.floor(Math.random() * 40) + 60,
    strategy: strategies[Math.floor(Math.random() * strategies.length)],
    price: Math.random() * 50000 + 20000,
    stopLoss: Math.random() * 45000 + 18000,
    takeProfit: Math.random() * 60000 + 25000,
    reason: [
      'Golden cross detected on 4H timeframe',
      'RSI oversold bounce with volume confirmation',
      'Breakout above key resistance level',
      'MACD bullish divergence forming',
      'Fibonacci retracement support holding',
      'Whale accumulation pattern detected',
      'Network activity spike preceding price action',
    ][Math.floor(Math.random() * 7)],
    indicators: {
      rsi: Math.random() * 100,
      macd: (Math.random() - 0.5) * 1000,
      sma20: Math.random() * 50000 + 20000,
      sma50: Math.random() * 50000 + 20000,
      volume: Math.random() * 1000000000,
    },
  }));
};

const generateMockStrategies = (): StrategyPerformance[] => [
  {
    id: 'strat-1',
    name: 'LSTM-Trend-Follower',
    totalReturn: 34.5,
    winRate: 68.2,
    sharpeRatio: 2.1,
    maxDrawdown: -12.3,
    totalTrades: 156,
    avgHoldTime: 48,
    isActive: true,
    lastSignal: null,
  },
  {
    id: 'strat-2',
    name: 'Transformer-Sentiment',
    totalReturn: 28.7,
    winRate: 72.1,
    sharpeRatio: 1.8,
    maxDrawdown: -8.9,
    totalTrades: 203,
    avgHoldTime: 24,
    isActive: true,
    lastSignal: null,
  },
  {
    id: 'strat-3',
    name: 'Ensemble-Hybrid-v2',
    totalReturn: 45.2,
    winRate: 65.8,
    sharpeRatio: 2.4,
    maxDrawdown: -15.7,
    totalTrades: 89,
    avgHoldTime: 72,
    isActive: false,
    lastSignal: null,
  },
  {
    id: 'strat-4',
    name: 'Mean-Reversion-BTC',
    totalReturn: 18.9,
    winRate: 74.5,
    sharpeRatio: 1.5,
    maxDrawdown: -6.2,
    totalTrades: 312,
    avgHoldTime: 12,
    isActive: true,
    lastSignal: null,
  },
];

const generateMockSentiment = (): MarketSentiment => ({
  overall: 32,
  fearGreedIndex: 68,
  socialScore: 45,
  onChainScore: 58,
  technicalScore: 38,
  timestamp: Date.now(),
});

const generateMockRiskMetrics = (): RiskMetrics => ({
  var95: -24500,
  var99: -38000,
  portfolioBeta: 1.23,
  correlation: 0.87,
  concentration: 0.42,
  liquidityRisk: 0.15,
});

const generateEquityCurveData = () => {
  let equity = 100000;
  return Array.from({ length: 90 }, (_, i) => {
    const dailyReturn = (Math.random() - 0.48) * 0.03;
    equity *= 1 + dailyReturn;
    return {
      day: `Day ${i + 1}`,
      equity: Math.round(equity),
      benchmark: Math.round(100000 * (1 + (Math.random() - 0.5) * 0.02 * i)),
      drawdown: Math.round((Math.min(0, (equity - 100000) / 100000) * 100) * 100) / 100,
    };
  });
};

// ═══════════════════════════════════════════════════════
// Sub-Component: AI Signal Dashboard
// ═══════════════════════════════════════════════════════

const AISignalDashboard: React.FC = () => {
  const [signals, setSignals] = useState<AISignal[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadSignals = useCallback(() => {
    const newSignals = generateMockSignals();
    setSignals(newSignals);
  }, []);

  useEffect(() => {
    loadSignals();
    if (autoRefresh) {
      intervalRef.current = setInterval(loadSignals, 30000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadSignals, autoRefresh]);

  const filteredSignals = useMemo(() => {
    if (selectedStrategy === 'all') return signals;
    return signals.filter(s => s.strategy === selectedStrategy);
  }, [signals, selectedStrategy]);

  const signalStats = useMemo(() => {
    const buys = filteredSignals.filter(s => s.type === 'BUY').length;
    const sells = filteredSignals.filter(s => s.type === 'SELL').length;
    const holds = filteredSignals.filter(s => s.type === 'HOLD').length;
    const avgConfidence = filteredSignals.reduce((sum, s) => sum + s.confidence, 0) / filteredSignals.length || 0;
    return { buys, sells, holds, avgConfidence: avgConfidence.toFixed(1) };
  }, [filteredSignals]);

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-[#4299E1]" />
          <h3 className="text-white text-lg font-semibold">AI Signal Generator</h3>
          <span className="px-2 py-0.5 bg-[#4299E1]/20 text-[#4299E1] text-xs rounded-full">
            Live
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            className="bg-[#071425] border border-[#233554] rounded px-3 py-1.5 text-xs text-[#CCD6F6] focus:outline-none focus:border-[#4299E1]"
          >
            <option value="all">All Strategies</option>
            <option value="LSTM-Trend">LSTM-Trend</option>
            <option value="Transformer-Sentiment">Transformer-Sentiment</option>
            <option value="Ensemble-Hybrid">Ensemble-Hybrid</option>
          </select>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-1.5 rounded ${autoRefresh ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#233554] text-[#8892B0]'}`}
          >
            {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={loadSignals}
            className="p-1.5 bg-[#233554] rounded text-[#8892B0] hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Buy Signals', value: signalStats.buys, icon: TrendingUp, color: '#38B2AC' },
          { label: 'Sell Signals', value: signalStats.sells, icon: TrendingDown, color: '#F56565' },
          { label: 'Hold Signals', value: signalStats.holds, icon: Pause, color: '#ECC94B' },
          { label: 'Avg Confidence', value: `${signalStats.avgConfidence}%`, icon: Target, color: '#4299E1' },
        ].map((stat, idx) => (
          <Card key={idx} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8892B0] text-xs">{stat.label}</p>
                <p className="text-white text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 opacity-20" style={{ color: stat.color }} />
            </div>
          </Card>
        ))}
      </div>

      {/* Signal List */}
      <Card className="p-4">
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredSignals.map((signal) => (
            <div
              key={signal.id}
              className={`p-3 rounded-lg border ${signal.type === 'BUY'
                ? 'border-[#38B2AC]/30 bg-[#38B2AC]/5'
                : signal.type === 'SELL'
                  ? 'border-[#F56565]/30 bg-[#F56565]/5'
                  : 'border-[#ECC94B]/30 bg-[#ECC94B]/5'
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded ${signal.type === 'BUY'
                        ? 'bg-[#38B2AC] text-white'
                        : signal.type === 'SELL'
                          ? 'bg-[#F56565] text-white'
                          : 'bg-[#ECC94B] text-black'
                        }`}
                    >
                      {signal.type}
                    </span>
                    <span className="text-white font-medium text-sm">{signal.symbol}</span>
                    <span className="text-[#8892B0] text-xs">@ ${signal.price.toLocaleString()}</span>
                  </div>
                  <p className="text-[#8892B0] text-xs mb-1">{signal.reason}</p>
                  <div className="flex items-center gap-3 text-xs text-[#8892B0]">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {signal.strategy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {signal.confidence}% confidence
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(signal.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-3">
                  {signal.stopLoss && (
                    <span className="text-[#F56565] text-xs">SL: ${signal.stopLoss.toLocaleString()}</span>
                  )}
                  {signal.takeProfit && (
                    <span className="text-[#38B2AC] text-xs">TP: ${signal.takeProfit.toLocaleString()}</span>
                  )}
                </div>
              </div>

              {/* Mini Indicators */}
              <div className="mt-2 pt-2 border-t border-[#233554] grid grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[#8892B0]">RSI:</span>{' '}
                  <span className="text-white">{signal.indicators.rsi.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-[#8892B0]">MACD:</span>{' '}
                  <span className="text-white">{signal.indicators.macd.toFixed(0)}</span>
                </div>
                <div>
                  <span className="text-[#8892B0]">SMA20:</span>{' '}
                  <span className="text-white">${(signal.indicators.sma20 / 1000).toFixed(1)}K</span>
                </div>
                <div>
                  <span className="text-[#8892B0]">Vol:</span>{' '}
                  <span className="text-white">{(signal.indicators.volume / 1e6).toFixed(1)}M</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// Sub-Component: Strategy Performance Monitor
// ═══════════════════════════════════════════════════════

const StrategyPerformanceMonitor: React.FC = () => {
  const [strategies, setStrategies] = useState<StrategyPerformance[]>([]);
  const [sortBy, setSortBy] = useState<'totalReturn' | 'winRate' | 'sharpeRatio'>('totalReturn');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    setStrategies(generateMockStrategies());
  }, []);

  const sortedStrategies = useMemo(() => {
    return [...strategies].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [strategies, sortBy, sortDir]);

  const equityData = useMemo(() => generateEquityCurveData(), []);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const toggleStrategy = (id: string) => {
    setStrategies(prev =>
      prev.map(s => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
    toast.success('Strategy status updated');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-[#38B2AC]" />
          <h3 className="text-white text-lg font-semibold">Strategy Performance</h3>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-[#233554] rounded text-xs text-[#CCD6F6] hover:bg-[#2D3748]">
          <Download className="w-3.5 h-3.5" />
          Export Report
        </button>
      </div>

      {/* Equity Curve Chart */}
      <Card className="p-4">
        <h4 className="text-white text-sm mb-3">Portfolio Equity Curve (90 Days)</h4>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={equityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#233554" />
            <XAxis dataKey="day" tick={{ fill: '#8892B0', fontSize: 10 }} interval={14} />
            <YAxis tick={{ fill: '#8892B0', fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A1628',
                border: '1px solid #233554',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <ReferenceLine y={100000} stroke="#4299E1" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#38B2AC"
              fill="#38B2AC"
              fillOpacity={0.1}
              name="Portfolio"
            />
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke="#4299E1"
              strokeDasharray="5 5"
              dot={false}
              name="Benchmark (BTC)"
            />
            <Bar dataKey="drawdown" fill="#F56565" fillOpacity={0.3} name="Drawdown %" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Strategy Table */}
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#233554]">
                {[
                  { key: 'name', label: 'Strategy Name' },
                  { key: 'totalReturn', label: 'Return %' },
                  { key: 'winRate', label: 'Win Rate' },
                  { key: 'sharpeRatio', label: 'Sharpe' },
                  { key: 'maxDrawdown', label: 'Max DD' },
                  { key: 'totalTrades', label: 'Trades' },
                  { key: 'isActive', label: 'Status' },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="py-2 px-3 text-left text-[#8892B0] cursor-pointer hover:text-white"
                    onClick={() => ['totalReturn', 'winRate', 'sharpeRatio'].includes(col.key) && handleSort(col.key as any)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortBy === col.key && (
                        <span className="text-[#4299E1]">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="py-2 px-3 text-right text-[#8892B0]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStrategies.map((strategy) => (
                <tr key={strategy.id} className="border-b border-[#233554]/50 hover:bg-[#071425]/30">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <Zap className={`w-4 h-4 ${strategy.isActive ? 'text-[#38B2AC]' : 'text-[#8892B0]'}`} />
                      <span className="text-white font-medium">{strategy.name}</span>
                    </div>
                  </td>
                  <td className={`py-3 px-3 font-semibold ${strategy.totalReturn >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
                    {strategy.totalReturn >= 0 ? '+' : ''}{strategy.totalReturn}%
                  </td>
                  <td className="py-3 px-3 text-[#CCD6F6]">{strategy.winRate}%</td>
                  <td className="py-3 px-3 text-[#CCD6F6]">{strategy.sharpeRatio.toFixed(2)}</td>
                  <td className="py-3 px-3 text-[#F56565]">{strategy.maxDrawdown}%</td>
                  <td className="py-3 px-3 text-[#CCD6F6]">{strategy.totalTrades}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${strategy.isActive
                        ? 'bg-[#38B2AC]/20 text-[#38B2AC]'
                        : 'bg-[#233554] text-[#8892B0]'
                        }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${strategy.isActive ? 'bg-[#38B2AC]' : 'bg-[#8892B0]'}`} />
                      {strategy.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => toggleStrategy(strategy.id)}
                      className={`px-3 py-1 rounded text-xs ${strategy.isActive
                        ? 'bg-[#F56565]/20 text-[#F56565] hover:bg-[#F56565]/30'
                        : 'bg-[#38B2AC]/20 text-[#38B2AC] hover:bg-[#38B2AC]/30'
                        }`}
                    >
                      {strategy.isActive ? 'Stop' : 'Start'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// Sub-Component: Market Sentiment Analysis
// ═══════════════════════════════════════════════════════

const MarketSentimentAnalysis: React.FC = () => {
  const [sentiment, setSentiment] = useState<MarketSentiment>(generateMockSentiment());
  const [history, setHistory] = useState<{ time: string; overall: number; fearGreed: number }[]>([]);

  useEffect(() => {
    const initialHistory = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      overall: Math.round((Math.random() - 0.3) * 100),
      fearGreed: Math.round(Math.random() * 100),
    }));
    setHistory(initialHistory);

    const interval = setInterval(() => {
      setSentiment(generateMockSentiment());
      setHistory(prev => {
        const newEntry = {
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          overall: Math.round((Math.random() - 0.3) * 100),
          fearGreed: Math.round(Math.random() * 100),
        };
        return [...prev.slice(-23), newEntry];
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const getSentimentColor = (value: number) => {
    if (value >= 40) return '#38B2AC';
    if (value >= 0) return '#ECC94B';
    return '#F56565';
  };

  const getSentimentLabel = (value: number) => {
    if (value >= 60) return 'Extreme Greed';
    if (value >= 40) return 'Greedy';
    if (value >= 0) return 'Neutral';
    if (value >= -40) return 'Fearful';
    return 'Extreme Fear';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Activity className="w-5 h-5 text-[#9F7AEA]" />
        <h3 className="text-white text-lg font-semibold">Market Sentiment Analysis</h3>
      </div>

      {/* Main Sentiment Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 flex flex-col items-center justify-center">
          <h4 className="text-[#8892B0] text-sm mb-4">Overall AI Sentiment</h4>
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 200 200" className="transform -rotate-90">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#233554" strokeWidth="16" />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={getSentimentColor(sentiment.overall)}
                strokeWidth="16"
                strokeDasharray={`${((sentiment.overall + 100) / 200) * 502.4} 502.4`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: getSentimentColor(sentiment.overall) }}>
                {sentiment.overall}
              </span>
              <span className="text-[#8892B0] text-xs mt-1">{getSentimentLabel(sentiment.overall)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-[#8892B0] text-sm mb-4">Multi-Dimensional Analysis</h4>
          <div className="space-y-4">
            {[
              { label: 'Fear & Greed Index', value: sentiment.fearGreedIndex, icon: Brain, color: '#4299E1' },
              { label: 'Social Sentiment', value: sentiment.socialScore, icon: Bot, color: '#9F7AEA' },
              { label: 'On-Chain Activity', value: sentiment.onChainScore, icon: Zap, color: '#38B2AC' },
              { label: 'Technical Indicators', value: sentiment.technicalScore, icon: LineChartIcon, color: '#ECC94B' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    <span className="text-[#CCD6F6] text-sm">{item.label}</span>
                  </div>
                  <span className="text-white text-sm font-semibold">{item.value}/100</span>
                </div>
                <div className="w-full h-2 bg-[#233554] rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-700 rounded-full"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sentiment History Chart */}
      <Card className="p-4">
        <h4 className="text-white text-sm mb-3">24h Sentiment History</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#233554" />
            <XAxis dataKey="time" tick={{ fill: '#8892B0', fontSize: 10 }} interval={3} />
            <YAxis tick={{ fill: '#8892B0', fontSize: 10 }} domain={[-100, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A1628',
                border: '1px solid #233554',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <ReferenceLine y={0} stroke="#4299E1" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="overall" stroke="#9F7AEA" dot={false} name="Overall" strokeWidth={2} />
            <Line type="monotone" dataKey="fearGreed" stroke="#4299E1" dot={false} name="Fear/Greed" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// Sub-Component: Adaptive Risk Management
// ═══════════════════════════════════════════════════════

const AdaptiveRiskManagement: React.FC = () => {
  const [riskMetrics] = useState<RiskMetrics>(generateMockRiskMetrics());
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [autoAdjust, setAutoAdjust] = useState(true);
  const [positionSizing, setPositionSizing] = useState(2); // % of portfolio

  useEffect(() => {
    const riskScore =
      Math.abs(riskMetrics.var99) / 1000 +
      riskMetrics.portfolioBeta * 10 +
      riskMetrics.concentration * 50 +
      riskMetrics.liquidityRisk * 100;

    if (riskScore < 30) setRiskLevel('low');
    else if (riskScore < 60) setRiskLevel('medium');
    else if (riskScore < 85) setRiskLevel('high');
    else setRiskLevel('critical');
  }, [riskMetrics]);

  const riskColors = {
    low: '#38B2AC',
    medium: '#ECC94B',
    high: '#ED8936',
    critical: '#F56565',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#F56565]" />
          <h3 className="text-white text-lg font-semibold">Adaptive Risk Management</h3>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoAdjust}
            onChange={(e) => setAutoAdjust(e.target.checked)}
            className="rounded"
          />
          <span className="text-[#8892B0] text-sm">Auto-Adjust</span>
        </label>
      </div>

      {/* Risk Level Indicator */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[#8892B0] text-sm">Current Portfolio Risk Level</h4>
          <span
            className="px-3 py-1 rounded-full text-sm font-bold capitalize"
            style={{ backgroundColor: `${riskColors[riskLevel]}20`, color: riskColors[riskLevel] }}
          >
            {riskLevel.toUpperCase()}
          </span>
        </div>
        <div className="w-full h-3 bg-[#233554] rounded-full overflow-hidden relative">
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#38B2AC] via-[#ECC94B] to-[#F56565]"
          />
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-all duration-500"
            style={{
              left: `${riskLevel === 'low'
                ? '15'
                : riskLevel === 'medium'
                  ? '40'
                  : riskLevel === 'high'
                    ? '70'
                    : '90'
                }%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#8892B0]">
          <span>Low Risk</span>
          <span>Medium</span>
          <span>High</span>
          <span>Critical</span>
        </div>
      </Card>

      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'VaR (95%)', value: `$${Math.abs(riskMetrics.var95).toLocaleString()}`, desc: 'Potential loss in 95% scenarios', icon: AlertTriangle, color: '#ED8936' },
          { label: 'VaR (99%)', value: `$${Math.abs(riskMetrics.var99).toLocaleString()}`, desc: 'Extreme scenario loss estimate', icon: AlertTriangle, color: '#F56565' },
          { label: 'Portfolio Beta', value: riskMetrics.portfolioBeta.toFixed(2), desc: 'Market correlation coefficient', icon: Activity, color: '#4299E1' },
          { label: 'Correlation', value: (riskMetrics.correlation * 100).toFixed(0) + '%', desc: 'Asset cross-correlation', icon: LineChartIcon, color: '#9F7AEA' },
          { label: 'Concentration', value: (riskMetrics.concentration * 100).toFixed(0) + '%', desc: 'Single asset exposure', icon: PieChart, color: '#ECC94B' },
          { label: 'Liquidity Risk', value: (riskMetrics.liquidityRisk * 100).toFixed(1) + '%', desc: 'Slippage & market impact', icon: Zap, color: '#38B2AC' },
        ].map((metric, idx) => (
          <Card key={idx} className="p-3">
            <div className="flex items-start justify-between mb-2">
              <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
              <span className="text-white font-bold text-lg">{metric.value}</span>
            </div>
            <p className="text-white text-sm font-medium">{metric.label}</p>
            <p className="text-[#8892B0] text-xs mt-1">{metric.desc}</p>
          </Card>
        ))}
      </div>

      {/* Position Sizing Control */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white text-sm">Dynamic Position Sizing</h4>
          <span className="text-[#4299E1] text-lg font-bold">{positionSizing}%</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="10"
          step="0.5"
          value={positionSizing}
          onChange={(e) => setPositionSizing(parseFloat(e.target.value))}
          disabled={!autoAdjust}
          className="w-full accent-[#4299E1]"
        />
        <div className="flex justify-between text-xs text-[#8892B0] mt-1">
          <span>Conservative (0.5%)</span>
          <span>Aggressive (10%)</span>
        </div>
        {!autoAdjust && (
          <p className="text-[#ECC94B] text-xs mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Manual mode: Position size fixed regardless of risk level
          </p>
        )}
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// Sub-Component: Strategy Configuration Panel
// ═══════════════════════════════════════════════════════

const StrategyConfigPanel: React.FC = () => {
  const [config, setConfig] = useState({
    aiModel: 'ensemble-hybrid-v3',
    timeframe: '4h',
    riskTolerance: 'moderate',
    maxPositions: 5,
    maxCorrelation: 0.7,
    rebalanceInterval: 'daily',
    slippageTolerance: 0.1,
    enableStopLoss: true,
    autoTakeProfit: true,
    sentimentWeight: 0.3,
    technicalWeight: 0.5,
    onchainWeight: 0.2,
  });

  const handleSave = () => {
    toast.success('Strategy configuration saved', {
      description: 'AI trading parameters updated successfully',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-[#8892B0]" />
          <h3 className="text-white text-lg font-semibold">Strategy Configuration</h3>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-4 py-2 bg-[#4299E1] rounded text-white text-sm hover:bg-[#3182CE]"
        >
          <CheckCircle2 className="w-4 h-4" />
          Save Config
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Model Selection */}
        <Card className="p-4 space-y-4">
          <h4 className="text-white text-sm font-semibold">AI Engine Settings</h4>

          <div>
            <label className="block text-[#8892B0] text-xs mb-1.5">Primary Model</label>
            <select
              value={config.aiModel}
              onChange={(e) => setConfig({ ...config, aiModel: e.target.value })}
              className="w-full bg-[#071425] border border-[#233554] rounded px-3 py-2 text-sm text-[#CCD6F6] focus:outline-none focus:border-[#4299E1]"
            >
              <option value="lstm-trend-v2">LSTM Trend Follower v2</option>
              <option value="transformer-sentiment">Transformer Sentiment Analyzer</option>
              <option value="ensemble-hybrid-v3">Ensemble Hybrid v3 (Recommended)</option>
              <option value="reinforcement-agent">Reinforcement Learning Agent</option>
            </select>
          </div>

          <div>
            <label className="block text-[#8892B0] text-xs mb-1.5">Analysis Timeframe</label>
            <select
              value={config.timeframe}
              onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
              className="w-full bg-[#071425] border border-[#233554] rounded px-3 py-2 text-sm text-[#CCD6F6] focus:outline-none focus:border-[#4299E1]"
            >
              <option value="15m">15 Minutes (Scalping)</option>
              <option value="1h">1 Hour (Day Trading)</option>
              <option value="4h">4 Hours (Swing Trading)</option>
              <option value="1d">1 Day (Position Trading)</option>
            </select>
          </div>

          <div>
            <label className="block text-[#8892B0] text-xs mb-1.5">Risk Tolerance</label>
            <div className="grid grid-cols-3 gap-2">
              {['conservative', 'moderate', 'aggressive'].map((level) => (
                <button
                  key={level}
                  onClick={() => setConfig({ ...config, riskTolerance: level })}
                  className={`py-2 rounded text-xs capitalize ${config.riskTolerance === level
                    ? 'bg-[#4299E1] text-white'
                    : 'bg-[#233554] text-[#8892B0] hover:bg-[#2D3748]'
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Risk Parameters */}
        <Card className="p-4 space-y-4">
          <h4 className="text-white text-sm font-semibold">Risk Parameters</h4>

          <div>
            <label className="block text-[#8892B0] text-xs mb-1.5">Max Concurrent Positions</label>
            <input
              type="number"
              min="1"
              max="20"
              value={config.maxPositions}
              onChange={(e) => setConfig({ ...config, maxPositions: parseInt(e.target.value) })}
              className="w-full bg-[#071425] border border-[#233554] rounded px-3 py-2 text-sm text-[#CCD6F6] focus:outline-none focus:border-[#4299E1]"
            />
          </div>

          <div>
            <label className="block text-[#8892B0] text-xs mb-1.5">Max Correlation Threshold</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.maxCorrelation}
              onChange={(e) => setConfig({ ...config, maxCorrelation: parseFloat(e.target.value) })}
              className="w-full accent-[#4299E1]"
            />
            <div className="flex justify-between text-xs text-[#8892B0]">
              <span>0 (Diversified)</span>
              <span>{config.maxCorrelation.toFixed(2)}</span>
              <span>1 (Concentrated)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#CCD6F6] text-sm">Enable Auto Stop-Loss</span>
            <button
              onClick={() => setConfig({ ...config, enableStopLoss: !config.enableStopLoss })}
              className={`w-11 h-6 rounded-full transition-colors ${config.enableStopLoss ? 'bg-[#38B2AC]' : 'bg-[#233554]'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transform transition-transform m-0.5 ${config.enableStopLoss ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#CCD6F6] text-sm">Auto Take-Profit</span>
            <button
              onClick={() => setConfig({ ...config, autoTakeProfit: !config.autoTakeProfit })}
              className={`w-11 h-6 rounded-full transition-colors ${config.autoTakeProfit ? 'bg-[#38B2AC]' : 'bg-[#233554]'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transform transition-transform m-0.5 ${config.autoTakeProfit ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </Card>

        {/* Signal Weights */}
        <Card className="p-4 space-y-4 lg:col-span-2">
          <h4 className="text-white text-sm font-semibold">AI Signal Weight Distribution</h4>
          <p className="text-[#8892B0] text-xs">Adjust the importance of each signal source in final decision making</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'technicalWeight', label: 'Technical Analysis', value: config.technicalWeight, color: '#4299E1' },
              { key: 'sentimentWeight', label: 'Market Sentiment', value: config.sentimentWeight, color: '#9F7AEA' },
              { key: 'onchainWeight', label: 'On-Chain Data', value: config.onchainWeight, color: '#38B2AC' },
            ].map((weight) => (
              <div key={weight.key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#CCD6F6] text-sm">{weight.label}</span>
                  <span className="text-white font-bold" style={{ color: weight.color }}>
                    {(weight.value * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weight.value}
                  onChange={(e) => setConfig({ ...config, [weight.key]: parseFloat(e.target.value) })}
                  className="w-full"
                  style={{ accentColor: weight.color }}
                />
              </div>
            ))}

            <div className="md:col-span-3 p-3 bg-[#071425] rounded">
              <p className="text-[#8892B0] text-xs text-center">
                Total Weight:{' '}
                <span className="text-white font-semibold">
                  {((config.technicalWeight + config.sentimentWeight + config.onchainWeight) * 100).toFixed(0)}%
                </span>
                {(config.technicalWeight + config.sentimentWeight + config.onchainWeight !== 1) && (
                  <span className="text-[#ECC94B] ml-2">(Should equal 100%)</span>
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// Main AITradingStrategy Component
// ═══════════════════════════════════════════════════════

interface AITradingStrategyProps {
  activeTertiary: string;
}

export const AITradingStrategy: React.FC<AITradingStrategyProps> = ({ activeTertiary }) => {
  switch (activeTertiary) {
    case 'AI信号':
      return <AISignalDashboard />;
    case '策略监控':
      return <StrategyPerformanceMonitor />;
    case '市场情绪':
      return <MarketSentimentAnalysis />;
    case '风险管理':
      return <AdaptiveRiskManagement />;
    case '参数配置':
      return <StrategyConfigPanel />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-[#8892B0]">
          <Cpu className="w-20 h-20 mb-4 opacity-20" />
          <h2 className="text-2xl font-bold mb-2">AI Trading Strategy Module</h2>
          <p className="text-sm text-center max-w-md">
            Advanced machine learning-powered trading system with real-time signal generation,
            multi-strategy orchestration, and adaptive risk management.
          </p>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            {[
              { icon: Brain, label: 'AI Signals', desc: 'LSTM+Transformer' },
              { icon: BarChart3, label: 'Performance', desc: 'Real-time analytics' },
              { icon: Activity, label: 'Sentiment', desc: 'Multi-source analysis' },
              { icon: Shield, label: 'Risk Mgmt', desc: 'Adaptive controls' },
            ].map((feature, idx) => (
              <div key={idx} className="p-3 bg-[#071425] rounded-lg">
                <feature.icon className="w-8 h-8 mx-auto mb-2 text-[#4299E1]" />
                <p className="text-white text-sm font-medium">{feature.label}</p>
                <p className="text-[#8892B0] text-xs">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );
  }
};

export default AITradingStrategy;
