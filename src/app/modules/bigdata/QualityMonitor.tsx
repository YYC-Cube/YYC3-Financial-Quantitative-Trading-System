import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { CheckCircle, AlertTriangle, XCircle, FileText } from '@/app/components/SafeIcons';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const QUALITY_DATA = [
  { name: '完整性', uv: 98.5, fill: '#38B2AC' },
  { name: '准确性', uv: 99.2, fill: '#4299E1' },
  { name: '一致性', uv: 95.8, fill: '#ECC94B' },
  { name: '时效性', uv: 92.4, fill: '#F56565' },
];

export const QualityMonitor = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <div className="col-span-4 flex flex-col gap-6">
        <Card className="p-6 flex-1 flex flex-col">
          <h4 className="text-white font-bold mb-4">整体质量评分</h4>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={15} data={QUALITY_DATA}>
                <RadialBar
                  label={{ position: 'insideStart', fill: '#fff' }}
                  background
                  dataKey="uv"
                />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, fontSize: '12px', color: '#8892B0' }} />
                <Tooltip contentStyle={{ backgroundColor: '#071425', borderColor: '#233554', color: '#CCD6F6' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center mt-4 mr-16">
                 <h2 className="text-3xl font-bold text-white">96.8</h2>
                 <p className="text-xs text-[#8892B0]">优秀</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
           <div className="flex justify-between items-center mb-4">
             <h4 className="text-white font-bold">质量日报</h4>
             <button className="text-[#4299E1] hover:underline text-xs">查看全部</button>
           </div>
           <div className="flex items-center gap-3 p-3 bg-[#0A192F] rounded border border-[#233554]">
             <FileText className="w-8 h-8 text-[#38B2AC]" />
             <div>
               <p className="text-sm text-white font-medium">2024-03-28 质量报告</p>
               <p className="text-xs text-[#8892B0]">发现 23 条异常数据，已自动修复 20 条</p>
             </div>
           </div>
        </Card>
      </div>

      <Card className="col-span-8 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-white font-bold flex items-center gap-2">
            <AlertTriangle className="text-[#F56565]" /> 异常数据检测
          </h4>
          <div className="flex gap-2">
             <button className="px-3 py-1 bg-[#233554] text-[#CCD6F6] text-xs rounded">全部忽略</button>
             <button className="px-3 py-1 bg-[#4299E1] text-white text-xs rounded">一键修复</button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-[#0A192F] text-xs text-[#8892B0]">
              <tr>
                <th className="py-3 px-4 text-left">时间</th>
                <th className="py-3 px-4 text-left">数据表</th>
                <th className="py-3 px-4 text-left">异常类型</th>
                <th className="py-3 px-4 text-left">详情</th>
                <th className="py-3 px-4 text-right">状态</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { time: '10:24:05', table: 'market_ticks', type: 'Null Value', detail: 'price is null', status: 'Pending' },
                { time: '10:23:55', table: 'users', type: 'Format Error', detail: 'invalid email', status: 'Fixed' },
                { time: '10:22:10', table: 'orders', type: 'Outlier', detail: 'qty > 3sigma', status: 'Ignored' },
                { time: '10:20:00', table: 'market_kline', type: 'Duplicate', detail: 'pk conflict', status: 'Pending' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-[#233554]/50">
                  <td className="py-3 px-4 text-[#8892B0] text-xs">{row.time}</td>
                  <td className="py-3 px-4 text-white font-medium">{row.table}</td>
                  <td className="py-3 px-4 text-[#ECC94B]">{row.type}</td>
                  <td className="py-3 px-4 text-[#CCD6F6] text-xs font-mono">{row.detail}</td>
                  <td className="py-3 px-4 text-right">
                    {row.status === 'Fixed' ? (
                      <span className="flex items-center justify-end gap-1 text-[#38B2AC] text-xs"><CheckCircle className="w-3 h-3"/> 已修复</span>
                    ) : row.status === 'Ignored' ? (
                       <span className="flex items-center justify-end gap-1 text-[#8892B0] text-xs"><XCircle className="w-3 h-3"/> 已忽略</span>
                    ) : (
                      <span className="flex items-center justify-end gap-1 text-[#F56565] text-xs"><AlertTriangle className="w-3 h-3"/> 待处理</span>
                    )}
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