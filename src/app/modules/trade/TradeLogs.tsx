import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Calendar, Download, Filter, FileText } from '@/app/components/SafeIcons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STATS_DATA = [
  { day: 'Mon', profit: 4500, loss: -1200 },
  { day: 'Tue', profit: 3200, loss: -800 },
  { day: 'Wed', profit: 5600, loss: -2100 },
  { day: 'Thu', profit: 2800, loss: -500 },
  { day: 'Fri', profit: 6100, loss: -1500 },
  { day: 'Sat', profit: 1200, loss: -300 },
  { day: 'Sun', profit: 900, loss: -100 },
];

export const TradeLogs = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <div className="col-span-8 flex flex-col gap-6">
        <Card className="flex-1 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              {['全部日志', '交易记录', '操作记录', '系统错误'].map((tab, i) => (
                <button key={i} className={`text-sm ${i === 1 ? 'text-white font-bold border-b-2 border-[#38B2AC]' : 'text-[#8892B0] hover:text-[#CCD6F6]'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
               <button className="px-3 py-1.5 bg-[#233554] text-[#CCD6F6] text-xs rounded hover:text-white flex items-center gap-2">
                 <Filter className="w-3 h-3" /> 筛选
               </button>
               <button className="px-3 py-1.5 bg-[#233554] text-[#CCD6F6] text-xs rounded hover:text-white flex items-center gap-2">
                 <Download className="w-3 h-3" /> 导出CSV
               </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="text-xs text-[#8892B0] bg-[#0A192F]">
                <tr>
                  <th className="py-3 px-4 text-left">时间 (UTC)</th>
                  <th className="py-3 px-4 text-left">类型</th>
                  <th className="py-3 px-4 text-left">品种</th>
                  <th className="py-3 px-4 text-left">方向/动作</th>
                  <th className="py-3 px-4 text-right">价格/详情</th>
                  <th className="py-3 px-4 text-right">数量/状态</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { time: '2024-01-29 10:24:55', type: 'Trade', symbol: 'BTC/USDT', side: 'Buy', price: '43,200.50', qty: '0.05 BTC' },
                  { time: '2024-01-29 10:20:12', type: 'Order', symbol: 'ETH/USDT', side: 'Cancel', price: 'Order #8821', qty: 'Success' },
                  { time: '2024-01-29 09:45:30', type: 'Trade', symbol: 'SOL/USDT', side: 'Sell', price: '94.50', qty: '150 SOL' },
                  { time: '2024-01-29 09:30:00', type: 'System', symbol: '-', side: 'Login', price: 'IP: 192.168.1.1', qty: 'Success' },
                  { time: '2024-01-29 08:15:22', type: 'Error', symbol: 'API', side: 'Timeout', price: 'Binance Feed', qty: 'Retry 3' },
                ].map((log, i) => (
                  <tr key={i} className="border-b border-[#233554]/50 hover:bg-[#112240]">
                    <td className="py-3 px-4 text-[#8892B0] text-xs font-mono">{log.time}</td>
                    <td className="py-3 px-4 text-white">{log.type}</td>
                    <td className="py-3 px-4 text-[#CCD6F6]">{log.symbol}</td>
                    <td className={`py-3 px-4 ${
                      log.side === 'Buy' ? 'text-[#38B2AC]' : 
                      log.side === 'Sell' ? 'text-[#F56565]' : 
                      log.side === 'Timeout' ? 'text-[#ECC94B]' : 'text-[#8892B0]'
                    }`}>{log.side}</td>
                    <td className="py-3 px-4 text-right text-[#CCD6F6] font-mono">{log.price}</td>
                    <td className="py-3 px-4 text-right text-[#8892B0] text-xs">{log.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="col-span-4 flex flex-col gap-6">
        <Card className="h-1/2 p-6 flex flex-col">
           <h4 className="text-white font-bold mb-4">本周盈亏统计</h4>
           <div className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={STATS_DATA} stackOffset="sign">
                 <CartesianGrid strokeDasharray="3 3" stroke="#233554" vertical={false} />
                 <XAxis dataKey="day" stroke="#8892B0" fontSize={10} tickLine={false} />
                 <YAxis stroke="#8892B0" fontSize={10} tickLine={false} />
                 <Tooltip cursor={{ fill: '#112240' }} contentStyle={{ backgroundColor: '#071425', borderColor: '#233554', color: '#CCD6F6' }} />
                 <Bar dataKey="profit" fill="#38B2AC" stackId="stack" name="Profit" />
                 <Bar dataKey="loss" fill="#F56565" stackId="stack" name="Loss" />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </Card>

        <Card className="h-1/2 p-6 flex flex-col justify-center">
           <h4 className="text-white font-bold mb-6">交易概览</h4>
           <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-[#0A192F] rounded border border-[#233554]">
               <p className="text-xs text-[#8892B0]">胜率 (Win Rate)</p>
               <p className="text-2xl font-bold text-[#38B2AC]">62.5%</p>
             </div>
             <div className="p-4 bg-[#0A192F] rounded border border-[#233554]">
               <p className="text-xs text-[#8892B0]">盈亏比 (P/L Ratio)</p>
               <p className="text-2xl font-bold text-white">1.85</p>
             </div>
             <div className="p-4 bg-[#0A192F] rounded border border-[#233554]">
               <p className="text-xs text-[#8892B0]">总交易数</p>
               <p className="text-2xl font-bold text-[#CCD6F6]">145</p>
             </div>
             <div className="p-4 bg-[#0A192F] rounded border border-[#233554]">
               <p className="text-xs text-[#8892B0]">夏普比率</p>
               <p className="text-2xl font-bold text-[#ECC94B]">2.1</p>
             </div>
           </div>
        </Card>
      </div>
    </div>
  );
};