import React, { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Star, TrendingUp, TrendingDown, ArrowRight, Activity, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MARKETS = ['Stocks', 'Futures', 'Forex', 'Crypto'];

const MOCK_DATA = {
  Stocks: [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 1.25, vol: '52M' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 402.56, change: 0.85, vol: '28M' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 610.35, change: 2.45, vol: '45M' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 215.40, change: -1.50, vol: '105M' },
    { symbol: 'AMZN', name: 'Amazon.com', price: 155.30, change: 0.95, vol: '38M' },
  ],
  Futures: [
    { symbol: 'ES', name: 'E-Mini S&P 500', price: 4925.50, change: 0.45, vol: '1.2M' },
    { symbol: 'NQ', name: 'E-Mini Nasdaq', price: 17550.25, change: 0.80, vol: '850K' },
    { symbol: 'CL', name: 'Crude Oil', price: 76.85, change: -0.25, vol: '450K' },
    { symbol: 'GC', name: 'Gold', price: 2045.30, change: 0.15, vol: '320K' },
  ],
  Forex: [
    { symbol: 'EUR/USD', name: 'Euro', price: 1.0850, change: -0.12, vol: '---' },
    { symbol: 'USD/JPY', name: 'Yen', price: 147.85, change: 0.25, vol: '---' },
    { symbol: 'GBP/USD', name: 'Pound', price: 1.2680, change: -0.05, vol: '---' },
  ],
  Crypto: [
    { symbol: 'BTC/USDT', name: 'Bitcoin', price: 43250.00, change: 1.85, vol: '28B' },
    { symbol: 'ETH/USDT', name: 'Ethereum', price: 2315.50, change: 1.20, vol: '12B' },
    { symbol: 'SOL/USDT', name: 'Solana', price: 98.45, change: 4.50, vol: '3.5B' },
    { symbol: 'BNB/USDT', name: 'Binance Coin', price: 305.20, change: 0.55, vol: '1.2B' },
  ]
};

export const GlobalQuotes = () => {
  const [activeTab, setActiveTab] = useState('Stocks');
  const [data, setData] = useState<any[]>(MOCK_DATA['Stocks']);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Simulate real-time data updates
  useEffect(() => {
    setData(MOCK_DATA[activeTab as keyof typeof MOCK_DATA]);
    
    const interval = setInterval(() => {
      setData(prev => prev.map(item => ({
        ...item,
        price: item.price * (1 + (Math.random() - 0.5) * 0.002), // Small fluctuation
        change: item.change + (Math.random() - 0.5) * 0.1
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const toggleFavorite = (symbol: string) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(symbol)) newFavs.delete(symbol);
    else newFavs.add(symbol);
    setFavorites(newFavs);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        {['S&P 500', 'Nasdaq', 'Dow Jones', 'VIX'].map((idx, i) => (
          <Card key={i} className="p-4 flex flex-col justify-between bg-gradient-to-br from-[#112240] to-[#0A192F] hover:border-[#38B2AC]/50 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[#8892B0] text-xs font-bold uppercase">{idx}</p>
                <h3 className="text-xl font-bold text-white mt-1 group-hover:text-[#38B2AC] transition-colors">4,925.50</h3>
              </div>
              <div className={`p-2 rounded-full ${i === 3 ? 'bg-[#38B2AC]/10 text-[#38B2AC]' : 'bg-[#F56565]/10 text-[#F56565]'}`}>
                {i === 3 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-xs font-mono ${i === 3 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
                {i === 3 ? '-2.45%' : '+1.25%'}
              </span>
              <Activity className="w-8 h-4 text-[#233554] group-hover:text-[#38B2AC]/30 transition-colors" />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Quote Table Panel */}
      <Card className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Tabs Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#233554] bg-[#0A192F]">
          <div className="flex items-center gap-1">
            {MARKETS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-t-sm text-sm font-bold transition-all relative ${
                  activeTab === tab 
                    ? 'text-[#38B2AC] bg-[#112240]' 
                    : 'text-[#8892B0] hover:text-[#CCD6F6] hover:bg-[#112240]/50'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#38B2AC]" 
                  />
                )}
              </button>
            ))}
            <button className="ml-2 p-1.5 text-[#8892B0] hover:text-[#38B2AC] rounded hover:bg-[#112240]">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs text-[#8892B0]">
               <span className="w-2 h-2 rounded-full bg-[#38B2AC] animate-pulse" />
               Real-time (3s)
             </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4 bg-[#112240]/30">
          <table className="w-full border-collapse">
            <thead className="text-xs text-[#8892B0] uppercase sticky top-0 bg-[#0A192F] z-10">
              <tr>
                <th className="py-3 px-4 text-left w-12"></th>
                <th className="py-3 px-4 text-left">Symbol</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">Change %</th>
                <th className="py-3 px-4 text-right">Volume</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <AnimatePresence mode='popLayout'>
                {data.map((item) => (
                  <motion.tr 
                    key={item.symbol}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-[#233554]/50 hover:bg-[#112240] group cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(item.symbol); }}
                        className={`transition-colors ${favorites.has(item.symbol) ? 'text-[#ECC94B]' : 'text-[#233554] group-hover:text-[#8892B0]'}`}
                      >
                        <Star className="w-4 h-4" fill={favorites.has(item.symbol) ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{item.symbol}</td>
                    <td className="py-3 px-4 text-[#CCD6F6]">{item.name}</td>
                    <td className="py-3 px-4 text-right font-mono text-white transition-all duration-300">
                      {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className={`px-2 py-1 rounded text-xs ${item.change >= 0 ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#F56565]/20 text-[#F56565]'}`}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#8892B0] font-mono">{item.vol}</td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1.5 text-[#4299E1] hover:bg-[#4299E1]/20 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4" />
                      </button>
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