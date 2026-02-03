import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ShieldCheck, Activity } from 'lucide-react';

const HEDGE_DATA = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  original: 100 + Math.random() * 20 - 10,
  hedged: 100 + Math.random() * 5 - 2.5
}));

export const HedgingTools = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <div className="col-span-4 flex flex-col gap-4">
        {['跨期套利对冲', '期权 Delta 对冲', '做空股指期货', '一篮子货币对冲'].map((tool, i) => (
          <Card key={i} className="p-4 cursor-pointer hover:border-[#38B2AC] transition-colors group">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-white font-bold">{tool}</h4>
              <ShieldCheck className="w-4 h-4 text-[#38B2AC] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex justify-between text-xs text-[#8892B0]">
              <span>对冲成本: <span className="text-[#CCD6F6]">0.05%</span></span>
              <span>风险降低: <span className="text-[#38B2AC]">45%</span></span>
            </div>
          </Card>
        ))}
        
        <Card className="mt-auto p-4 bg-[#38B2AC]/10 border-[#38B2AC]/30">
          <h4 className="text-[#38B2AC] font-bold mb-2">AI 智能推荐</h4>
          <p className="text-xs text-[#CCD6F6]">检测到您当前持仓 BTC 风险敞口过大，建议买入 BTC-29MAR-60000-P 看跌期权进行保护。</p>
          <button className="mt-3 w-full py-1.5 bg-[#38B2AC] text-white text-xs rounded font-medium">一键执行</button>
        </Card>
      </div>

      <Card className="col-span-8 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Activity className="text-[#4299E1]" /> 对冲效果模拟
          </h3>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-2 text-[#8892B0]">
              <span className="w-3 h-3 bg-[#F56565] rounded-full" /> 原始波动
            </span>
            <span className="flex items-center gap-2 text-[#8892B0]">
              <span className="w-3 h-3 bg-[#38B2AC] rounded-full" /> 对冲后波动
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={HEDGE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#233554" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis domain={['auto', 'auto']} stroke="#8892B0" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#112240', borderColor: '#233554' }}
                itemStyle={{ color: '#CCD6F6' }}
              />
              <Line type="monotone" dataKey="original" stroke="#F56565" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="hedged" stroke="#38B2AC" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};