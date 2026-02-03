import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COMPARE_DATA = [
  { metric: '求解速度 (ms)', quantum: 45, classic: 12000 },
  { metric: '解的精度 (%)', quantum: 99.2, classic: 98.5 },
  { metric: '能量消耗 (J)', quantum: 120, classic: 8500 },
];

export const ResultAnalysis = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <Card className="col-span-8 p-6 flex flex-col">
        <h4 className="text-white font-bold mb-6">量子 vs 经典 性能对比</h4>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={COMPARE_DATA} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#233554" horizontal={false} />
              <XAxis type="number" stroke="#8892B0" fontSize={10} />
              <YAxis dataKey="metric" type="category" width={100} stroke="#CCD6F6" fontSize={12} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#112240' }}
                contentStyle={{ backgroundColor: '#071425', borderColor: '#233554', color: '#CCD6F6' }}
              />
              <Legend />
              <Bar dataKey="quantum" name="量子算法 (Quantum)" fill="#4299E1" radius={[0, 4, 4, 0]} />
              <Bar dataKey="classic" name="经典算法 (Classical)" fill="#8892B0" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="col-span-4 p-6">
        <h4 className="text-white font-bold mb-6">分析报告摘要</h4>
        <div className="space-y-4 text-sm text-[#CCD6F6]">
          <div className="p-3 bg-[#38B2AC]/10 border border-[#38B2AC]/30 rounded">
            <p className="font-bold text-[#38B2AC] mb-1">速度优势显著</p>
            <p className="text-xs">在组合优化问题上，量子算法实现了 <span className="font-mono font-bold">266x</span> 的加速比。</p>
          </div>
          <div className="p-3 bg-[#ECC94B]/10 border border-[#ECC94B]/30 rounded">
            <p className="font-bold text-[#ECC94B] mb-1">精度仍有提升空间</p>
            <p className="text-xs">当前 NISQ 设备噪声导致精度略有波动，建议增加纠错码。</p>
          </div>
          <div className="p-3 bg-[#0A192F] border border-[#233554] rounded">
            <p className="text-[#8892B0] text-xs mb-2">建议下一步：</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>增加测量次数 (Shots) 至 100,000</li>
              <li>尝试 VQE 优化器切换为 COBYLA</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};