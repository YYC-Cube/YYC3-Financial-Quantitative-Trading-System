import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { AlertTriangle, TrendingUp, Zap } from '@/app/components/SafeIcons';

const INSIGHT_DATA = Array.from({ length: 30 }, (_, i) => {
  const val = 100 + i * 2 + Math.random() * 20;
  const isAnomaly = Math.random() > 0.9;
  return {
    day: `D${i + 1}`,
    value: isAnomaly ? val + 50 : val,
    isAnomaly
  };
});

export const Insight = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-[#112240] to-[#0A192F]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[#8892B0] text-xs uppercase">未来7天趋势预测</p>
              <h3 className="text-2xl font-bold text-white mt-1">看涨 (Bullish)</h3>
            </div>
            <div className="p-2 bg-[#38B2AC]/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#38B2AC]" />
            </div>
          </div>
          <p className="text-xs text-[#8892B0]">基于 LSTM-Attention 模型预测，置信度 87%</p>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-[#112240] to-[#0A192F]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[#8892B0] text-xs uppercase">今日异常波动</p>
              <h3 className="text-2xl font-bold text-[#F56565] mt-1">3 次</h3>
            </div>
            <div className="p-2 bg-[#F56565]/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-[#F56565]" />
            </div>
          </div>
          <p className="text-xs text-[#8892B0]">主要集中在 14:00 - 15:00 时段</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#112240] to-[#0A192F]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[#8892B0] text-xs uppercase">市场情绪指数</p>
              <h3 className="text-2xl font-bold text-[#ECC94B] mt-1">65 (贪婪)</h3>
            </div>
            <div className="p-2 bg-[#ECC94B]/20 rounded-lg">
              <Zap className="w-6 h-6 text-[#ECC94B]" />
            </div>
          </div>
          <p className="text-xs text-[#8892B0]">较昨日上升 12 点</p>
        </Card>
      </div>

      <Card className="p-6 h-[500px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-bold text-lg">全市场波动异常检测</h3>
          <div className="flex gap-2">
            <span className="flex items-center gap-2 text-xs text-[#8892B0]">
              <span className="w-3 h-3 rounded-full bg-[#F56565]" /> 异常点
            </span>
            <span className="flex items-center gap-2 text-xs text-[#8892B0]">
              <span className="w-3 h-3 rounded-full bg-[#4299E1]" /> 正常波动
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={INSIGHT_DATA}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4299E1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4299E1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#233554" vertical={false} />
              <XAxis dataKey="day" stroke="#8892B0" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#8892B0" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#112240', borderColor: '#233554', color: '#CCD6F6' }}
                itemStyle={{ color: '#CCD6F6' }}
              />
              <Area type="monotone" dataKey="value" stroke="#4299E1" fillOpacity={1} fill="url(#colorVal)" />
              {INSIGHT_DATA.map((entry, index) => (
                entry.isAnomaly && (
                  <ReferenceDot 
                    key={index} 
                    x={entry.day} 
                    y={entry.value} 
                    r={6} 
                    fill="#F56565" 
                    stroke="#fff"
                    strokeWidth={2}
                  />
                )
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};