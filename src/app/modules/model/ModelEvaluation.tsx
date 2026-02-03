import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COMPARE_DATA = [
  { metric: '年化收益 (Annual Return)', modelA: 45, modelB: 32 },
  { metric: '最大回撤 (Max Drawdown)', modelA: -12, modelB: -8 },
  { metric: '夏普比率 (Sharpe)', modelA: 2.8, modelB: 3.1 },
  { metric: '胜率 (Win Rate)', modelA: 58, modelB: 62 },
];

export const ModelEvaluation = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <Card className="col-span-8 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-white font-bold">模型对比评估</h4>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 bg-[#4299E1] rounded-sm" /> 
              <span className="text-white">Model A: LSTM-V1</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 bg-[#ECC94B] rounded-sm" />
              <span className="text-white">Model B: Quantum-SVM</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={COMPARE_DATA} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#233554" horizontal={false} />
              <XAxis type="number" stroke="#8892B0" fontSize={10} />
              <YAxis dataKey="metric" type="category" width={140} stroke="#CCD6F6" fontSize={12} tickLine={false} />
              <Tooltip cursor={{ fill: '#112240' }} contentStyle={{ backgroundColor: '#071425', borderColor: '#233554', color: '#CCD6F6' }} />
              <Legend />
              <Bar dataKey="modelA" name="Model A" fill="#4299E1" radius={[0, 4, 4, 0]} />
              <Bar dataKey="modelB" name="Model B" fill="#ECC94B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="col-span-4 flex flex-col gap-6">
        <Card className="p-6">
          <h4 className="text-white font-bold mb-4">回测摘要 (Model B)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[#0A192F] rounded border border-[#233554]">
              <p className="text-[10px] text-[#8892B0]">总收益</p>
              <p className="text-lg font-bold text-[#38B2AC]">+124.5%</p>
            </div>
            <div className="p-3 bg-[#0A192F] rounded border border-[#233554]">
              <p className="text-[10px] text-[#8892B0]">盈亏比</p>
              <p className="text-lg font-bold text-white">2.45</p>
            </div>
            <div className="p-3 bg-[#0A192F] rounded border border-[#233554]">
              <p className="text-[10px] text-[#8892B0]">交易次数</p>
              <p className="text-lg font-bold text-white">1,250</p>
            </div>
            <div className="p-3 bg-[#0A192F] rounded border border-[#233554]">
              <p className="text-[10px] text-[#8892B0]">Alpha</p>
              <p className="text-lg font-bold text-[#ECC94B]">0.12</p>
            </div>
          </div>
        </Card>

        <Card className="flex-1 p-6">
          <h4 className="text-white font-bold mb-4">压力测试通过率</h4>
          <div className="space-y-3">
             {[
               { name: '2008 金融危机场景', pass: true },
               { name: '2020 熔断场景', pass: true },
               { name: '高频震荡市场', pass: false },
               { name: '低流动性市场', pass: true },
             ].map((test, i) => (
               <div key={i} className="flex justify-between items-center p-3 bg-[#0A192F] rounded border border-[#233554]">
                 <span className="text-sm text-[#CCD6F6]">{test.name}</span>
                 {test.pass ? (
                   <CheckCircle className="w-4 h-4 text-[#38B2AC]" />
                 ) : (
                   <XCircle className="w-4 h-4 text-[#F56565]" />
                 )}
               </div>
             ))}
          </div>
        </Card>
      </div>
    </div>
  );
};