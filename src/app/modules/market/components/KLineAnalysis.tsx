import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Settings, BarChart2, Layers } from '@/app/components/SafeIcons';
import { useSettings } from '@/app/contexts/SettingsContext';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';
import { getKLineService, type CandleData, type KLineInterval } from '@/app/services/BinanceKLineService';
import { getAnalytics } from '@/app/services/AnalyticsService';
import { toast } from 'sonner';

// Technical indicator calculations
function calcSMA(data: CandleData[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
    return sum / period;
  });
}

function calcEMA(data: CandleData[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const result: (number | null)[] = [];
  let ema: number | null = null;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (ema === null) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
      ema = sum / period;
      result.push(ema);
    } else {
      ema = data[i].close * k + ema * (1 - k);
      result.push(ema);
    }
  }
  return result;
}

function calcBOLL(data: CandleData[], period: number = 20, mult: number = 2): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } {
  const middle = calcSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (middle[i] === null) { upper.push(null); lower.push(null); continue; }
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) sumSq += Math.pow(data[j].close - middle[i]!, 2);
    const std = Math.sqrt(sumSq / period);
    upper.push(middle[i]! + mult * std);
    lower.push(middle[i]! - mult * std);
  }
  return { upper, middle, lower };
}

const TIMEFRAMES: KLineInterval[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
const SYMBOLS = [
  { display: 'BTC/USDT', short: 'BTC' },
  { display: 'ETH/USDT', short: 'ETH' },
  { display: 'SOL/USDT', short: 'SOL' },
  { display: 'BNB/USDT', short: 'BNB' },
  { display: 'XRP/USDT', short: 'XRP' },
  { display: 'ADA/USDT', short: 'ADA' },
];

type IndicatorType = 'ma' | 'ema' | 'boll' | 'none';

export const KLineAnalysis = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeframe, setTimeframe] = useState<KLineInterval>('1h');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [indicator, setIndicator] = useState<IndicatorType>('ma');
  const [showVolume, setShowVolume] = useState(true);
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [dataSource, setDataSource] = useState<'binance' | 'cache' | 'simulated'>('simulated');
  const [loading, setLoading] = useState(false);
  const { getUpColor, getDownColor } = useSettings();
  const { marketData, formatPrice, dataSource: wsStatus } = useGlobalData();

  const selectedAsset = marketData.find(a => a.symbol === selectedSymbol);
  const currentPrice = selectedAsset?.price || 0;
  const currentChange = selectedAsset?.change || 0;

  const upColor = getUpColor();
  const downColor = getDownColor();

  // Fetch K-line data when symbol or timeframe changes
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getKLineService().getKLines(selectedSymbol, timeframe, 100);
        if (!cancelled) {
          setCandleData(result.data);
          setDataSource(result.source);
        }
      } catch {
        // fallback handled inside service
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [selectedSymbol, timeframe]);

  // Auto-refresh: append latest candle from live price
  useEffect(() => {
    if (candleData.length === 0 || !selectedAsset) return;
    const last = candleData[candleData.length - 1];
    // Only update if price has changed meaningfully
    if (Math.abs(last.close - selectedAsset.price) / last.close > 0.0001) {
      setCandleData(prev => {
        const updated = [...prev];
        const lastCandle = { ...updated[updated.length - 1] };
        lastCandle.close = selectedAsset.price;
        lastCandle.high = Math.max(lastCandle.high, selectedAsset.price);
        lastCandle.low = Math.min(lastCandle.low, selectedAsset.price);
        updated[updated.length - 1] = lastCandle;
        return updated;
      });
    }
  }, [selectedAsset?.price]);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const padding = { top: 60, right: 80, bottom: showVolume ? 100 : 40, left: 10 };
    const chartW = W - padding.left - padding.right;
    const mainChartH = H - padding.top - padding.bottom;
    const volumeH = showVolume ? 60 : 0;
    const priceChartH = mainChartH - volumeH;

    // Clear
    ctx.fillStyle = '#071425';
    ctx.fillRect(0, 0, W, H);

    const data = candleData;
    if (data.length === 0) {
      ctx.fillStyle = '#8892B0';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(loading ? '正在加载K线数据...' : '暂无数据', W / 2, H / 2);
      return;
    }

    // Price range
    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices) * 0.999;
    const maxPrice = Math.max(...prices) * 1.001;
    const priceRange = maxPrice - minPrice;

    // Volume range
    const maxVol = Math.max(...data.map(d => d.volume));

    const candleW = Math.max(1, (chartW / data.length) * 0.65);
    const gap = chartW / data.length;

    // Map functions
    const xMap = (i: number) => padding.left + i * gap + gap / 2;
    const yMap = (price: number) => padding.top + (1 - (price - minPrice) / priceRange) * priceChartH;
    const volYMap = (vol: number) => padding.top + priceChartH + volumeH * (1 - vol / maxVol);

    // Grid lines
    ctx.strokeStyle = '#233554';
    ctx.lineWidth = 0.5;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (priceChartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(W - padding.right, y);
      ctx.stroke();

      const priceLabel = maxPrice - (priceRange / gridLines) * i;
      ctx.fillStyle = '#8892B0';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(priceLabel.toFixed(currentPrice > 100 ? 2 : currentPrice > 1 ? 4 : 6), W - padding.right + 6, y + 3);
    }

    // Time labels
    ctx.fillStyle = '#8892B0';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    const timeStep = Math.max(1, Math.floor(data.length / 8));
    for (let i = 0; i < data.length; i += timeStep) {
      const x = xMap(i);
      const date = new Date(data[i].time);
      const label = timeframe === '1d' || timeframe === '1w'
        ? `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`
        : `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      ctx.fillText(label, x, H - padding.bottom + volumeH + 14);
    }

    // Draw volume bars
    if (showVolume) {
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        const x = xMap(i) - candleW / 2;
        const isUp = d.close >= d.open;
        ctx.fillStyle = isUp ? upColor + '40' : downColor + '40';
        const volTop = volYMap(d.volume);
        const volBottom = padding.top + priceChartH + volumeH;
        ctx.fillRect(x, volTop, candleW, volBottom - volTop);
      }
    }

    // Draw indicators
    const drawLine = (values: (number | null)[], color: string, width: number = 1) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < data.length; i++) {
        if (values[i] === null) continue;
        const x = xMap(i);
        const y = yMap(values[i]!);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    if (indicator === 'ma') {
      const ma10 = calcSMA(data, 10);
      const ma30 = calcSMA(data, 30);
      drawLine(ma10, '#ECC94B');
      drawLine(ma30, '#4299E1');
    } else if (indicator === 'ema') {
      const ema12 = calcEMA(data, 12);
      const ema26 = calcEMA(data, 26);
      drawLine(ema12, '#9F7AEA');
      drawLine(ema26, '#F56565');
    } else if (indicator === 'boll') {
      const boll = calcBOLL(data, 20, 2);
      drawLine(boll.upper, '#38B2AC', 0.8);
      drawLine(boll.middle, '#ECC94B', 0.8);
      drawLine(boll.lower, '#F56565', 0.8);
      // Fill band
      ctx.fillStyle = '#38B2AC08';
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < data.length; i++) {
        if (boll.upper[i] === null) continue;
        const x = xMap(i);
        if (!started) { ctx.moveTo(x, yMap(boll.upper[i]!)); started = true; }
        else ctx.lineTo(x, yMap(boll.upper[i]!));
      }
      for (let i = data.length - 1; i >= 0; i--) {
        if (boll.lower[i] === null) continue;
        ctx.lineTo(xMap(i), yMap(boll.lower[i]!));
      }
      ctx.closePath();
      ctx.fill();
    }

    // Draw candlesticks
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const x = xMap(i);
      const isUp = d.close >= d.open;

      // Wick
      ctx.strokeStyle = isUp ? upColor : downColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, yMap(d.high));
      ctx.lineTo(x, yMap(d.low));
      ctx.stroke();

      // Body
      const bodyTop = yMap(Math.max(d.open, d.close));
      const bodyBottom = yMap(Math.min(d.open, d.close));
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);

      if (isUp) {
        ctx.fillStyle = '#071425';
        ctx.strokeStyle = upColor;
        ctx.lineWidth = 1;
        ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyHeight);
        ctx.strokeRect(x - candleW / 2, bodyTop, candleW, bodyHeight);
      } else {
        ctx.fillStyle = downColor;
        ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyHeight);
      }
    }

    // Crosshair
    if (mousePos) {
      const mx = mousePos.x;
      const my = mousePos.y;

      if (mx > padding.left && mx < W - padding.right && my > padding.top && my < padding.top + priceChartH) {
        ctx.strokeStyle = '#8892B050';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padding.left, my);
        ctx.lineTo(W - padding.right, my);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mx, padding.top);
        ctx.lineTo(mx, padding.top + priceChartH + volumeH);
        ctx.stroke();
        ctx.setLineDash([]);

        const hoverPrice = maxPrice - ((my - padding.top) / priceChartH) * priceRange;
        ctx.fillStyle = '#4299E1';
        ctx.fillRect(W - padding.right, my - 8, padding.right, 16);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(hoverPrice.toFixed(currentPrice > 100 ? 2 : 4), W - padding.right + 4, my + 3);
      }
    }

    // Current price line
    const lastCandle = data[data.length - 1];
    const currentY = yMap(lastCandle.close);
    ctx.strokeStyle = lastCandle.close >= lastCandle.open ? upColor : downColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padding.left, currentY);
    ctx.lineTo(W - padding.right, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    const labelBg = lastCandle.close >= lastCandle.open ? upColor : downColor;
    ctx.fillStyle = labelBg;
    ctx.fillRect(W - padding.right, currentY - 9, padding.right, 18);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(lastCandle.close.toFixed(currentPrice > 100 ? 2 : 4), W - padding.right + 4, currentY + 4);

    // Indicator legend
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    if (indicator === 'ma') {
      ctx.fillStyle = '#ECC94B';
      ctx.fillText('MA10', padding.left + 8, padding.top - 8);
      ctx.fillStyle = '#4299E1';
      ctx.fillText('MA30', padding.left + 58, padding.top - 8);
    } else if (indicator === 'ema') {
      ctx.fillStyle = '#9F7AEA';
      ctx.fillText('EMA12', padding.left + 8, padding.top - 8);
      ctx.fillStyle = '#F56565';
      ctx.fillText('EMA26', padding.left + 68, padding.top - 8);
    } else if (indicator === 'boll') {
      ctx.fillStyle = '#38B2AC';
      ctx.fillText('BOLL(20,2)', padding.left + 8, padding.top - 8);
    }

    // Data source badge
    ctx.fillStyle = dataSource === 'binance' ? '#38B2AC' : dataSource === 'cache' ? '#4299E1' : '#ECC94B';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(
      dataSource === 'binance' ? 'BINANCE' : dataSource === 'cache' ? 'CACHED' : 'SIMULATED',
      W - padding.right - 4, padding.top - 8
    );

  }, [candleData, mousePos, indicator, showVolume, upColor, downColor, loading, dataSource, currentPrice]);

  useEffect(() => {
    drawChart();
    const handleResize = () => drawChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawChart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const data = candleData;
    if (data.length === 0) return;
    const padding = { left: 10, right: 80, top: 60 };
    const chartW = rect.width - padding.left - padding.right;
    const gap = chartW / data.length;
    const idx = Math.round((x - padding.left - gap / 2) / gap);
    if (idx >= 0 && idx < data.length) {
      setHoveredCandle(data[idx]);
    } else {
      setHoveredCandle(null);
    }
  }, [candleData]);

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
    setHoveredCandle(null);
  }, []);

  const handleTimeframeChange = (tf: KLineInterval) => {
    setTimeframe(tf);
    getAnalytics().trackKLineInteraction('timeframe', tf);
  };

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    getAnalytics().trackKLineInteraction('symbol', symbol);
  };

  const handleIndicatorChange = (ind: IndicatorType) => {
    setIndicator(ind);
    getAnalytics().trackKLineInteraction('indicator', ind);
  };

  const lastCandle = candleData.length > 0 ? candleData[candleData.length - 1] : null;
  const displayCandle = hoveredCandle || lastCandle;
  const isUp = displayCandle ? displayCandle.close >= displayCandle.open : true;
  const decimals = currentPrice > 100 ? 2 : currentPrice > 1 ? 4 : 6;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      <Card className="flex flex-wrap items-center justify-between p-2 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Symbol Selector */}
          <div className="flex bg-[#0A192F] rounded p-0.5 border border-[#233554]">
            {SYMBOLS.map(s => (
              <button
                key={s.display}
                onClick={() => handleSymbolChange(s.display)}
                className={`px-2.5 py-1 text-[10px] rounded transition-colors ${
                  selectedSymbol === s.display ? 'bg-[#4299E1] text-white' : 'text-[#8892B0] hover:text-[#CCD6F6]'
                }`}
              >
                {s.short}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-[#233554]" />

          {/* Timeframe Selector */}
          <div className="flex bg-[#112240] rounded p-1">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  timeframe === tf ? 'bg-[#38B2AC] text-white' : 'text-[#8892B0] hover:text-[#CCD6F6]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-[#233554]" />

          {/* Indicator Selector */}
          {(['ma', 'ema', 'boll', 'none'] as IndicatorType[]).map(ind => (
            <button
              key={ind}
              onClick={() => handleIndicatorChange(ind)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#CCD6F6] rounded transition-colors ${indicator === ind ? 'bg-[#233554]' : 'hover:bg-[#112240]'}`}
            >
              {ind === 'ma' ? 'MA' : ind === 'ema' ? 'EMA' : ind === 'boll' ? 'BOLL' : 'OFF'}
            </button>
          ))}

          <button
            onClick={() => { setShowVolume(!showVolume); getAnalytics().trackKLineInteraction('volume', String(!showVolume)); }}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs text-[#CCD6F6] rounded transition-colors ${showVolume ? 'bg-[#233554]' : 'hover:bg-[#112240]'}`}
          >
            <Layers className="w-4 h-4" /> VOL
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Data source indicator */}
          <div className={`flex items-center gap-1.5 text-[10px] ${
            dataSource === 'binance' ? 'text-[#38B2AC]' : dataSource === 'cache' ? 'text-[#4299E1]' : 'text-[#ECC94B]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              dataSource === 'binance' ? 'bg-[#38B2AC] animate-pulse' : dataSource === 'cache' ? 'bg-[#4299E1]' : 'bg-[#ECC94B]'
            }`} />
            {loading ? '加载中...' : dataSource === 'binance' ? 'Binance' : dataSource === 'cache' ? '缓存' : '模拟'}
          </div>
          <button className="p-1.5 text-[#8892B0] hover:text-white rounded hover:bg-[#112240]" onClick={() => toast('图表设置', { description: '可配置: K线样式、网格、指标参数、配色方案' })}>
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Chart Area */}
      <Card className="flex-1 p-0 overflow-hidden relative border border-[#233554] min-h-[400px]">
        {/* OHLCV Info Overlay */}
        <div className="absolute top-3 left-4 z-10 flex flex-col">
          <div className="flex items-center gap-3">
            <h2 className="text-white">{selectedSymbol}</h2>
            <span className="text-xs text-[#8892B0] bg-[#112240] px-2 py-0.5 rounded">{timeframe}</span>
          </div>
          {displayCandle && (
            <div className="flex items-center gap-4 mt-1">
              <span className="text-[10px] text-[#8892B0]">O <span className="text-[#CCD6F6] font-mono">{displayCandle.open.toFixed(decimals)}</span></span>
              <span className="text-[10px] text-[#8892B0]">H <span className="text-[#38B2AC] font-mono">{displayCandle.high.toFixed(decimals)}</span></span>
              <span className="text-[10px] text-[#8892B0]">L <span className="text-[#F56565] font-mono">{displayCandle.low.toFixed(decimals)}</span></span>
              <span className="text-[10px] text-[#8892B0]">C <span className={`font-mono ${isUp ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{displayCandle.close.toFixed(decimals)}</span></span>
              <span className="text-[10px] text-[#8892B0]">Vol <span className="text-[#CCD6F6] font-mono">{displayCandle.volume.toFixed(0)}</span></span>
            </div>
          )}
        </div>

        {/* Live Price Badge */}
        <div className="absolute top-3 right-20 z-10 flex items-center gap-2">
          <span className={`text-sm font-mono ${currentChange >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
            {currentPrice > 0 ? formatPrice(currentPrice) : '--'}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${currentChange >= 0 ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#F56565]/20 text-[#F56565]'}`}>
            {currentChange >= 0 ? '+' : ''}{currentChange.toFixed(2)}%
          </span>
        </div>

        <div
          ref={containerRef}
          className="w-full h-full bg-[#071425]"
          style={{ minHeight: '400px' }}
        >
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="block w-full h-full cursor-crosshair"
          />
        </div>
      </Card>
    </div>
  );
};
