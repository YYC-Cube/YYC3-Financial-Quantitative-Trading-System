import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { Card } from '@/app/components/ui/Card';
import { Settings, BarChart2, Layers } from 'lucide-react';

// Generate sample data
const generateData = () => {
  const data = [];
  let time = new Date('2023-01-01').getTime() / 1000;
  let value = 42000;
  for (let i = 0; i < 1000; i++) {
    time += 3600;
    const change = (Math.random() - 0.5) * 200;
    const open = value;
    const close = value + change;
    const high = Math.max(open, close) + Math.random() * 50;
    const low = Math.min(open, close) - Math.random() * 50;
    value = close;
    data.push({ time, open, high, low, close });
  }
  return data;
};

const DATA = generateData();

export const KLineAnalysis = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [timeframe, setTimeframe] = useState('1h');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#071425' },
        textColor: '#8892B0',
      },
      grid: {
        vertLines: { color: '#233554' },
        horzLines: { color: '#233554' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#233554',
      },
      timeScale: {
        borderColor: '#233554',
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#38B2AC',
      downColor: '#F56565',
      borderVisible: false,
      wickUpColor: '#38B2AC',
      wickDownColor: '#F56565',
    });

    candleSeries.setData(DATA);

    // Add MA Line
    const maSeries = chart.addSeries(LineSeries, {
      color: '#ECC94B',
      lineWidth: 1,
    });
    
    // Simple MA calculation
    const maData = DATA.map((d, i, arr) => {
      if (i < 20) return { time: d.time, value: d.close };
      const sum = arr.slice(i - 20, i).reduce((acc, val) => acc + val.close, 0);
      return { time: d.time, value: sum / 20 };
    });
    
    maSeries.setData(maData);

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      <Card className="flex items-center justify-between p-2">
         <div className="flex items-center gap-2">
            <div className="flex bg-[#112240] rounded p-1">
              {['1m', '5m', '15m', '1h', '4h', '1d', '1w'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs rounded font-bold transition-colors ${
                    timeframe === tf ? 'bg-[#38B2AC] text-white' : 'text-[#8892B0] hover:text-[#CCD6F6]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-[#233554]" />
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#CCD6F6] hover:bg-[#112240] rounded">
               <BarChart2 className="w-4 h-4" /> Indicators
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#CCD6F6] hover:bg-[#112240] rounded">
               <Layers className="w-4 h-4" /> Compare
            </button>
         </div>
         <div className="flex items-center gap-2">
            <button className="p-1.5 text-[#8892B0] hover:text-white rounded hover:bg-[#112240]">
               <Settings className="w-4 h-4" />
            </button>
         </div>
      </Card>

      {/* Chart Area */}
      <Card className="flex-1 p-0 overflow-hidden relative border border-[#233554]">
         <div className="absolute top-4 left-4 z-10 flex flex-col">
            <h2 className="text-xl font-bold text-white">BTC/USDT</h2>
            <div className="flex items-center gap-2">
               <span className="text-[#38B2AC] text-sm font-bold">42,150.00</span>
               <span className="text-[#8892B0] text-xs">Vol: 245M</span>
            </div>
         </div>
         <div ref={chartContainerRef} className="w-full h-full" />
      </Card>
    </div>
  );
};