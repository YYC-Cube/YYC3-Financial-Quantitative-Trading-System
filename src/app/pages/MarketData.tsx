import React, { useState } from 'react';
import { Card, CardHeader } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Clock, Filter, MoreHorizontal, Maximize2 } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'motion/react';

// Mock Data
const kLineData = Array.from({ length: 50 }, (_, i) => ({
  time: `${9 + Math.floor(i/12)}:${(i%12)*5}`.replace(/:0$/, ':00').replace(/:5$/, ':05'),
  value: 4200 + Math.random() * 100 - 50,
  volume: Math.floor(Math.random() * 1000)
}));

const orderBookAsks = Array.from({ length: 8 }, (_, i) => ({
  price: (4250.5 + i * 0.5).toFixed(2),
  amount: (Math.random() * 2).toFixed(4),
  total: (Math.random() * 10).toFixed(4)
})).reverse();

const orderBookBids = Array.from({ length: 8 }, (_, i) => ({
  price: (4250.0 - i * 0.5).toFixed(2),
  amount: (Math.random() * 2).toFixed(4),
  total: (Math.random() * 10).toFixed(4)
}));

const markets = [
  { symbol: 'BTC/USDT', price: '64,231.50', change: '+2.45%', high: '65,100', low: '62,900', vol: '1.2B' },
  { symbol: 'ETH/USDT', price: '3,452.10', change: '-1.12%', high: '3,510', low: '3,380', vol: '840M' },
  { symbol: 'SOL/USDT', price: '145.20', change: '+5.67%', high: '148.50', low: '139.00', vol: '320M' },
  { symbol: 'AAPL', price: '182.50', change: '+0.89%', high: '183.10', low: '181.20', vol: '45M' },
  { symbol: 'TSLA', price: '178.90', change: '-2.34%', high: '184.00', low: '177.50', vol: '89M' },
  { symbol: 'NVDA', price: '945.30', change: '+1.56%', high: '950.00', low: '935.00', vol: '67M' },
];

export default function MarketData() {
  const [activeTab, setActiveTab] = useState('Crypto');
  const [timeframe, setTimeframe] = useState('1H');

  return (
    <div className="space-y-6 fade-in">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'S&P 500', val: '5,245.12', chg: '+0.56%', up: true },
          { name: 'BTC/USD', val: '64,231.50', chg: '+2.45%', up: true },
          { name: 'Gold', val: '2,341.80', chg: '-0.12%', up: false },
          { name: 'EUR/USD', val: '1.0845', chg: '-0.05%', up: false },
        ].map((item, idx) => (
          <Card key={idx} className="flex items-center justify-between" noPadding>
            <div className="p-5 flex-1">
              <div className="text-text-muted text-sm font-medium mb-1">{item.name}</div>
              <div className="text-2xl font-bold text-text-main tracking-tight">{item.val}</div>
              <div className={clsx("text-sm flex items-center mt-1", item.up ? "text-accent-green" : "text-accent-red")}>
                {item.up ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {item.chg}
              </div>
            </div>
            <div className="h-full w-24 pr-2 py-4">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={kLineData.slice(0, 10)}>
                   <Area 
                     type="monotone" 
                     dataKey="value" 
                     stroke={item.up ? "#38B2AC" : "#F56565"} 
                     fill={item.up ? "rgba(56, 178, 172, 0.1)" : "rgba(245, 101, 101, 0.1)"} 
                     strokeWidth={2}
                   />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-12 gap-6 h-[600px]">
        {/* Left: Chart */}
        <div className="col-span-12 lg:col-span-8 h-full flex flex-col gap-4">
          <Card className="flex-1 flex flex-col h-full overflow-hidden" noPadding>
             {/* Chart Header */}
             <div className="border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                    BTC/USDT 
                    <Badge variant="success" className="ml-2">+2.45%</Badge>
                  </h2>
                  <div className="h-4 w-px bg-border"></div>
                  <div className="flex gap-1 bg-primary-lighter p-1 rounded">
                    {['1m', '5m', '15m', '1H', '4H', '1D', '1W'].map(tf => (
                      <button 
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={clsx(
                          "px-2 py-0.5 text-xs font-medium rounded transition-colors",
                          timeframe === tf ? "bg-accent-blue text-white" : "text-text-muted hover:text-text-sub"
                        )}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-text-muted hover:text-text-main rounded hover:bg-bg-hover">
                    <Filter size={18} />
                  </button>
                  <button className="p-1.5 text-text-muted hover:text-text-main rounded hover:bg-bg-hover">
                    <Maximize2 size={18} />
                  </button>
                </div>
             </div>

             {/* Chart Body */}
             <div className="flex-1 relative w-full bg-bg-main/30">
               {/* Custom Grid Background Pattern (CSS) would go here, mimicking TradingView */}
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={kLineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38B2AC" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#38B2AC" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#8892B0" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis domain={['dataMin - 50', 'dataMax + 50']} orientation="right" stroke="#8892B0" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#112240', borderColor: '#233554', color: '#CCD6F6' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#38B2AC" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
             
             {/* Volume Indicator (Mock) */}
             <div className="h-32 border-t border-border p-2 bg-bg-main/30">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={kLineData}>
                   <Bar dataKey="volume" fill="#233554" />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </Card>
        </div>

        {/* Right: Order Book */}
        <div className="col-span-12 lg:col-span-4 h-full flex flex-col gap-4">
          <Card className="h-full flex flex-col" noPadding>
            <CardHeader title="Order Book" className="p-4 border-b border-border mb-0" action={<MoreHorizontal size={16} className="text-text-muted" />} />
            
            <div className="flex-1 flex flex-col text-xs">
              <div className="grid grid-cols-3 px-4 py-2 text-text-muted font-medium border-b border-border/50">
                <span>Price(USDT)</span>
                <span className="text-right">Amount(BTC)</span>
                <span className="text-right">Total</span>
              </div>
              
              <div className="flex-1 overflow-auto py-2">
                {/* Asks */}
                <div className="flex flex-col-reverse">
                  {orderBookAsks.map((item, i) => (
                    <div key={`ask-${i}`} className="grid grid-cols-3 px-4 py-1 hover:bg-bg-hover cursor-pointer relative group">
                      <span className="text-accent-red relative z-10">{item.price}</span>
                      <span className="text-right text-text-sub relative z-10">{item.amount}</span>
                      <span className="text-right text-text-muted relative z-10">{item.total}</span>
                      <div className="absolute right-0 top-0 bottom-0 bg-accent-red/10" style={{ width: `${Math.random() * 80}%` }}></div>
                    </div>
                  ))}
                </div>

                <div className="py-3 px-4 flex items-center justify-between bg-primary-light my-1 border-y border-border/50">
                   <span className="text-lg font-bold text-accent-green">64,231.50</span>
                   <span className="text-text-muted">≈ $64,231.50</span>
                </div>

                {/* Bids */}
                <div>
                  {orderBookBids.map((item, i) => (
                    <div key={`bid-${i}`} className="grid grid-cols-3 px-4 py-1 hover:bg-bg-hover cursor-pointer relative group">
                      <span className="text-accent-green relative z-10">{item.price}</span>
                      <span className="text-right text-text-sub relative z-10">{item.amount}</span>
                      <span className="text-right text-text-muted relative z-10">{item.total}</span>
                      <div className="absolute right-0 top-0 bottom-0 bg-accent-green/10" style={{ width: `${Math.random() * 80}%` }}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Quick Trade Panel (Bottom of Order Book) */}
            <div className="p-4 border-t border-border bg-bg-hover/30">
               <div className="flex gap-2 mb-2">
                 <button className="flex-1 bg-accent-green text-white py-2 rounded font-medium hover:bg-accent-green/90 transition-colors">Buy</button>
                 <button className="flex-1 bg-accent-red text-white py-2 rounded font-medium hover:bg-accent-red/90 transition-colors">Sell</button>
               </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom: Markets Table */}
      <Card title="Market Overview" noPadding>
        <div className="flex items-center gap-6 px-5 pt-5 pb-2 border-b border-border">
          {['Favorites', 'Crypto', 'Stocks', 'Forex', 'Futures'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "pb-3 text-sm font-medium border-b-2 transition-all",
                activeTab === tab 
                  ? "text-accent-blue border-accent-blue" 
                  : "text-text-muted border-transparent hover:text-text-sub"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="px-5 py-4 font-medium">Symbol</th>
                <th className="px-5 py-4 font-medium">Last Price</th>
                <th className="px-5 py-4 font-medium">24h Change</th>
                <th className="px-5 py-4 font-medium">High</th>
                <th className="px-5 py-4 font-medium">Low</th>
                <th className="px-5 py-4 font-medium">Volume</th>
                <th className="px-5 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((m, i) => (
                <motion.tr 
                  key={m.symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/50 hover:bg-bg-hover/50 transition-colors"
                >
                  <td className="px-5 py-4 font-medium text-text-main">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent-blue"></span>
                      {m.symbol}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono">{m.price}</td>
                  <td className={clsx("px-5 py-4 font-medium", m.change.startsWith('+') ? "text-accent-green" : "text-accent-red")}>
                    {m.change}
                  </td>
                  <td className="px-5 py-4 text-text-muted">{m.high}</td>
                  <td className="px-5 py-4 text-text-muted">{m.low}</td>
                  <td className="px-5 py-4 text-text-main">{m.vol}</td>
                  <td className="px-5 py-4 text-right">
                    <button className="text-accent-blue hover:text-accent-blue/80 text-xs font-medium border border-accent-blue/30 px-3 py-1 rounded hover:bg-accent-blue/10 transition-all">
                      Trade
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
