import React, { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Tabs } from '@/app/components/ui/Tabs';
import { TrendingUp, TrendingDown, Star, Activity, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MARKETS = [
  { id: 'stock', label: '股票 (Stock)' },
  { id: 'futures', label: '期货 (Futures)' },
  { id: 'forex', label: '外汇 (Forex)' },
  { id: 'crypto', label: '加密资产 (Crypto)' },
];

const MOCK_DATA: Record<string, any[]> = {
  crypto: [
    { s: 'BTC/USDT', p: 96231.50, c: 2.45, v: '12.5B' },
    { s: 'ETH/USDT', p: 2451.20, c: -0.12, v: '5.2B' },
    { s: 'SOL/USDT', p: 142.85, c: 5.10, v: '1.8B' },
    { s: 'BNB/USDT', p: 582.40, c: 1.15, v: '800M' },
    { s: 'XRP/USDT', p: 1.05, c: -2.30, v: '650M' },
    { s: 'ADA/USDT', p: 0.45, c: 0.85, v: '200M' },
    { s: 'DOGE/USDT', p: 0.12, c: 3.20, v: '300M' },
    { s: 'AVAX/USDT', p: 35.60, c: -1.50, v: '150M' },
    { s: 'DOT/USDT', p: 7.20, c: 0.50, v: '120M' },
    { s: 'LINK/USDT', p: 14.50, c: 1.20, v: '100M' },
  ],
  stock: [
    { s: 'AAPL', p: 182.50, c: 1.20, v: '5.2B' },
    { s: 'MSFT', p: 402.10, c: 0.85, v: '4.8B' },
    { s: 'GOOGL', p: 165.20, c: -0.50, v: '3.2B' },
    { s: 'AMZN', p: 175.40, c: 1.50, v: '3.5B' },
    { s: 'TSLA', p: 178.90, c: 2.10, v: '4.1B' },
    { s: 'NVDA', p: 850.00, c: 3.50, v: '6.5B' },
    { s: 'META', p: 485.50, c: 1.10, v: '3.8B' },
  ],
  futures: [
    { s: 'CL (Crude Oil)', p: 78.50, c: -1.20, v: '500k' },
    { s: 'GC (Gold)', p: 2050.10, c: 0.50, v: '300k' },
    { s: 'SI (Silver)', p: 23.50, c: 0.80, v: '150k' },
    { s: 'ES (S&P 500)', p: 5100.25, c: 0.40, v: '1.2M' },
    { s: 'NQ (Nasdaq)', p: 18200.50, c: 0.60, v: '800k' },
  ],
  forex: [
    { s: 'EUR/USD', p: 1.0850, c: 0.10, v: '—' },
    { s: 'GBP/USD', p: 1.2650, c: -0.05, v: '—' },
    { s: 'USD/JPY', p: 150.20, c: 0.20, v: '—' },
    { s: 'USD/CHF', p: 0.8850, c: 0.15, v: '—' },
    { s: 'AUD/USD', p: 0.6550, c: -0.10, v: '—' },
  ]
};

export const GlobalQuotes = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [activeTab, setActiveTab] = useState('crypto');
  const [data, setData] = useState(MOCK_DATA[activeTab]);

  // Simulate real-time update
  useEffect(() => {
    setData(MOCK_DATA[activeTab]);
    
    const interval = setInterval(() => {
      setData(prev => prev.map(item => ({
        ...item,
        p: item.p * (1 + (Math.random() - 0.5) * 0.001),
        c: item.c + (Math.random() - 0.5) * 0.1
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs 
          tabs={MARKETS} 
          activeTab={activeTab} 
          onChange={setActiveTab}
          className="w-full max-w-2xl"
        />
        <div className="flex gap-2">
           <button className="px-3 py-1.5 text-xs text-[#8892B0] bg-[#112240] border border-[#233554] rounded hover:text-white transition-colors">
             编辑标签页
           </button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0A192F]/50 border-b border-[#233554] text-xs text-[#8892B0] text-left">
                <th className="py-3 px-6 font-medium">品种名称</th>
                <th className="py-3 px-6 font-medium text-right">最新价</th>
                <th className="py-3 px-6 font-medium text-right">涨跌幅</th>
                <th className="py-3 px-6 font-medium text-right">24H成交额</th>
                <th className="py-3 px-6 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <AnimatePresence mode="popLayout">
                {data.map((item) => (
                  <motion.tr 
                    key={item.s}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-[#233554]/50 hover:bg-[#1A2B47]/30 transition-colors cursor-pointer group"
                    onClick={() => onNavigate('analysis')}
                  >
                    <td className="py-4 px-6 font-bold text-[#CCD6F6] flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#233554] group-hover:text-[#ECC94B] transition-colors" />
                      {item.s}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-[#FFFFFF]">
                      {item.p.toFixed(item.p > 100 ? 2 : 4)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${item.c >= 0 ? 'bg-[#38B2AC]/10 text-[#38B2AC]' : 'bg-[#F56565]/10 text-[#F56565]'}`}>
                        {item.c >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span className="font-medium">{item.c > 0 ? '+' : ''}{item.c.toFixed(2)}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-[#8892B0]">{item.v}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-[#233554] rounded text-[#4299E1]">
                          <Activity className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-[#233554] rounded text-[#8892B0]">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};