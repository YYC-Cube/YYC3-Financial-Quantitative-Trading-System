import React, { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Star, TrendingUp, TrendingDown, ArrowRight, Activity, Plus, ShieldAlert, BellRing } from '@/app/components/SafeIcons';
import { useTranslation } from '@/app/i18n/mock';
import { useSettings } from '@/app/contexts/SettingsContext';
import { useAlerts } from '@/app/contexts/AlertContext';

const MOCK_DATA = {
  '股票': [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 1.25, vol: '52M' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 402.56, change: 0.85, vol: '28M' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 610.35, change: 2.45, vol: '45M' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 215.40, change: -1.50, vol: '105M' },
    { symbol: 'AMZN', name: 'Amazon.com', price: 155.30, change: 0.95, vol: '38M' },
  ],
  '期货': [
    { symbol: 'ES', name: 'E-Mini S&P 500', price: 4925.50, change: 0.45, vol: '1.2M' },
    { symbol: 'NQ', name: 'E-Mini Nasdaq', price: 17550.25, change: 0.80, vol: '850K' },
    { symbol: 'CL', name: 'Crude Oil', price: 76.85, change: -0.25, vol: '450K' },
    { symbol: 'GC', name: 'Gold', price: 2045.30, change: 0.15, vol: '320K' },
  ],
  '外汇': [
    { symbol: 'EUR/USD', name: 'Euro', price: 1.0850, change: -0.12, vol: '---' },
    { symbol: 'USD/JPY', name: 'Yen', price: 147.85, change: 0.25, vol: '---' },
    { symbol: 'GBP/USD', name: 'Pound', price: 1.2680, change: -0.05, vol: '---' },
  ],
  '加密货币': [
    { symbol: 'BTC/USDT', name: 'Bitcoin', price: 43250.00, change: 1.85, vol: '28B' },
    { symbol: 'ETH/USDT', name: 'Ethereum', price: 2315.50, change: 1.20, vol: '12B' },
    { symbol: 'SOL/USDT', name: 'Solana', price: 98.45, change: 4.50, vol: '3.5B' },
    { symbol: 'BNB/USDT', name: 'Binance Coin', price: 305.20, change: 0.55, vol: '1.2B' },
  ]
};

export const GlobalQuotes = () => {
  const [activeTab, setActiveTab] = useState('股票');
  const [data, setData] = useState<any[]>(MOCK_DATA['股票']);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { t } = useTranslation();
  const { getChangeColorClass, getChangeBgClass } = useSettings();
  const { thresholds } = useAlerts();

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

  const MARKETS_LIST = [
    { id: '股票', label: t('market.stocks') },
    { id: '期货', label: t('market.futures') },
    { id: '外汇', label: t('market.forex') },
    { id: '加密货币', label: t('market.crypto') },
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { name: '标普500', id: 'S&P 500', price: '4,925.50', change: 1.25 },
          { name: '纳斯达克', id: 'Nasdaq', price: '17,550.25', change: 0.80 },
          { name: '道琼斯', id: 'Dow Jones', price: '38,239.10', change: 0.45 },
          { name: '恐慌指数', id: 'VIX', price: '14.25', change: -2.45 }
        ].map((item, i) => (
          <Card key={i} className="p-4 flex flex-col justify-between bg-gradient-to-br from-[#112240] to-[#0A192F] hover:border-[#38B2AC]/50 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[#8892B0] text-xs font-bold uppercase">{item.name}</p>
                <h3 className="text-xl font-bold text-white mt-1 group-hover:text-[#38B2AC] transition-colors">{item.price}</h3>
              </div>
              <div className={`p-2 rounded-full ${getChangeBgClass(item.change)} bg-opacity-10`}>
                {item.change >= 0 ? <TrendingUp className={`w-4 h-4 ${getChangeColorClass(1)}`} /> : <TrendingDown className={`w-4 h-4 ${getChangeColorClass(-1)}`} />}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-xs font-mono ${getChangeColorClass(item.change)}`}>
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </span>
              <Activity className="w-8 h-4 text-[#233554] group-hover:text-[#38B2AC]/30 transition-colors" />
            </div>
          </Card>
        ))}
      </div>

      {/* Market Sentinel Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2 p-4 bg-[#112240]/40 border-dashed border-[#233554] flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#38B2AC]/10 rounded-full flex items-center justify-center">
                 <ShieldAlert className="w-5 h-5 text-[#38B2AC]" />
              </div>
              <div>
                 <h4 className="text-sm font-bold text-white uppercase tracking-tight">智能哨兵系统 (Sentinel)</h4>
                 <p className="text-[10px] text-[#8892B0]">基于实时 WebSocket 流的自定义指标阈值监控已开启</p>
              </div>
           </div>
           <div className="flex gap-4">
              {thresholds.map((t, idx) => (
                <div key={idx} className="px-3 py-1.5 bg-[#071425] border border-[#233554] rounded flex flex-col gap-0.5 min-w-[100px]">
                   <span className="text-[9px] text-[#8892B0] font-bold uppercase">{t.symbol} 监控</span>
                   <span className="text-xs text-[#CCD6F6] font-mono">
                      {t.type === 'above' ? '≥' : '≤'} {t.value.toLocaleString()}
                   </span>
                </div>
              ))}
              <button className="flex items-center justify-center w-8 h-8 bg-[#112240] border border-[#233554] rounded-full text-[#38B2AC] hover:bg-[#233554] transition-all">
                 <Plus className="w-4 h-4" />
              </button>
           </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-[#112240] to-[#1A365D] border-[#4299E1]/30 flex items-center gap-4">
           <div className="relative">
              <BellRing className="w-6 h-6 text-[#4299E1] animate-bounce" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#F56565] rounded-full" />
           </div>
           <div>
              <h4 className="text-xs font-bold text-white">WebSocket 实时推送中</h4>
              <p className="text-[9px] text-[#8892B0] mt-0.5">所有异常波动均已同步至“智能预警中心”</p>
           </div>
        </Card>
      </div>

      {/* Main Quote Table Panel */}
      <Card className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Tabs Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#233554] bg-[#0A192F]">
          <div className="flex items-center gap-1">
            {MARKETS_LIST.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-sm text-sm font-bold transition-all relative ${
                  activeTab === tab.id 
                    ? 'text-[#38B2AC] bg-[#112240]' 
                    : 'text-[#8892B0] hover:text-[#CCD6F6] hover:bg-[#112240]/50'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div 
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
               {t('market.realtime')} (3s)
             </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4 bg-[#112240]/30">
          <table className="w-full border-collapse">
            <thead className="text-xs text-[#8892B0] uppercase sticky top-0 bg-[#0A192F] z-10">
              <tr>
                <th className="py-3 px-4 text-left w-12"></th>
                <th className="py-3 px-4 text-left">{t('market.symbol')}</th>
                <th className="py-3 px-4 text-left">{t('market.name')}</th>
                <th className="py-3 px-4 text-right">{t('market.price')}</th>
                <th className="py-3 px-4 text-right">{t('market.change')}</th>
                <th className="py-3 px-4 text-right">{t('market.volume')}</th>
                <th className="py-3 px-4 text-right">{t('market.action')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
                {data.map((item) => (
                  <tr 
                    key={item.symbol}
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
                      <span className={`px-2 py-1 rounded text-xs ${getChangeBgClass(item.change)}`}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#8892B0] font-mono">{item.vol}</td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1.5 text-[#4299E1] hover:bg-[#4299E1]/20 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4" />
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