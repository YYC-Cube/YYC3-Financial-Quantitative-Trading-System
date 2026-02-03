import React, { useState } from 'react';
import { Card } from '@/app/components/ui/Card';
import { KLineChart } from '@/app/components/KLineChart';
import { Settings, Maximize2, Share2, PlusCircle, Layers } from 'lucide-react';

const PERIODS = ['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W'];

// Mock Data Generator
const generateData = (count = 500) => {
  const data = [];
  let time = new Date().getTime();
  let base = 1000;
  for (let i = 0; i < count; i++) {
    time -= 60000 * 60; // 1h steps
    const open = base;
    const change = (Math.random() - 0.5) * 20;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 10;
    const low = Math.min(open, close) - Math.random() * 10;
    data.push({
      time: new Date(time).toISOString().split('T')[0], // Simplified date for now
      open, high, low, close
    });
    base = close;
  }
  return data.reverse();
};

const KLINE_DATA = generateData();

export const KLineAnalysis = () => {
  const [period, setPeriod] = useState('1h');

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
      <Card className="flex-1 flex flex-col p-0 overflow-hidden relative">
        {/* Toolbar */}
        <div className="h-12 border-b border-[#233554] bg-[#0A192F] px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold">BTC/USDT</h2>
              <span className="text-xs text-[#38B2AC] bg-[#38B2AC]/10 px-1.5 py-0.5 rounded">现货</span>
            </div>
            <div className="h-6 w-[1px] bg-[#233554]" />
            <div className="flex bg-[#112240] rounded p-0.5">
              {PERIODS.map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                    period === p 
                      ? 'bg-[#38B2AC] text-white' 
                      : 'text-[#8892B0] hover:text-[#CCD6F6]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="h-6 w-[1px] bg-[#233554]" />
            <button className="flex items-center gap-1.5 text-xs text-[#8892B0] hover:text-[#4299E1] px-2 py-1 rounded hover:bg-[#112240]">
              <Layers className="w-3.5 h-3.5" />
              <span>指标</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
             <button className="p-2 text-[#8892B0] hover:text-white hover:bg-[#112240] rounded">
               <Settings className="w-4 h-4" />
             </button>
             <button className="p-2 text-[#8892B0] hover:text-white hover:bg-[#112240] rounded">
               <Maximize2 className="w-4 h-4" />
             </button>
             <button className="p-2 text-[#8892B0] hover:text-white hover:bg-[#112240] rounded">
               <Share2 className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 bg-[#071425] relative">
          <KLineChart data={KLINE_DATA} />
          
          {/* Floating Info */}
          <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
            <div className="flex gap-4 text-xs">
              <span className="text-[#8892B0]">MA(7): <span className="text-[#F56565]">42,150.2</span></span>
              <span className="text-[#8892B0]">MA(25): <span className="text-[#ECC94B]">41,800.5</span></span>
              <span className="text-[#8892B0]">MA(99): <span className="text-[#38B2AC]">40,500.0</span></span>
            </div>
            <div className="flex gap-4 text-xs mt-1">
              <span className="text-[#8892B0]">VOL: <span className="text-[#CCD6F6]">1,205.45</span></span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};