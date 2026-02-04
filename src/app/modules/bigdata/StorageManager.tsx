import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { HardDrive, Server, Archive, RefreshCw } from '@/app/components/SafeIcons';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const STORAGE_DATA = [
  { name: 'Tick Data', value: 450, color: '#4299E1' },
  { name: 'K-Line (1m)', value: 300, color: '#38B2AC' },
  { name: 'Factor Data', value: 150, color: '#ECC94B' },
  { name: 'Logs & backups', value: 100, color: '#8892B0' },
];

export const StorageManager = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <div className="col-span-8 flex flex-col gap-6">
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-2">
              <HardDrive className="text-[#4299E1] w-6 h-6" />
              <span className="text-xs text-[#38B2AC] bg-[#38B2AC]/10 px-2 py-1 rounded">Healthy</span>
            </div>
            <p className="text-xs text-[#8892B0]">总存储容量 (PB)</p>
            <h3 className="text-2xl font-bold text-white">1.2 / 5.0</h3>
            <div className="w-full h-1.5 bg-[#233554] rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-[#4299E1] w-[24%]" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex justify-between items-start mb-2">
              <Server className="text-[#ECC94B] w-6 h-6" />
              <span className="text-xs text-[#38B2AC] bg-[#38B2AC]/10 px-2 py-1 rounded">24/24 Online</span>
            </div>
            <p className="text-xs text-[#8892B0]">分布式节点</p>
            <h3 className="text-2xl font-bold text-white">24 Nodes</h3>
            <p className="text-[10px] text-[#8892B0] mt-1">Replication Factor: 3</p>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-start mb-2">
              <Archive className="text-[#F56565] w-6 h-6" />
              <span className="text-xs text-[#8892B0]">Last: 2h ago</span>
            </div>
            <p className="text-xs text-[#8892B0]">冷存储归档</p>
            <h3 className="text-2xl font-bold text-white">450 TB</h3>
            <button className="text-[10px] text-[#4299E1] mt-1 hover:underline">查看归档策略</button>
          </Card>
        </div>

        <Card className="flex-1 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-white font-bold">存储分布分析</h4>
            <div className="flex gap-2 text-xs">
               <button className="px-3 py-1 bg-[#112240] text-[#CCD6F6] rounded">按类型</button>
               <button className="px-3 py-1 bg-[#0A192F] text-[#8892B0] rounded hover:text-[#CCD6F6]">按时间</button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
             <div className="w-full h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={STORAGE_DATA}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={100}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {STORAGE_DATA.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#071425', borderColor: '#233554', color: '#CCD6F6' }}
                     itemStyle={{ color: '#CCD6F6' }}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="space-y-4 ml-8">
               {STORAGE_DATA.map((item) => (
                 <div key={item.name} className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                   <div>
                     <p className="text-sm text-white font-medium">{item.name}</p>
                     <p className="text-xs text-[#8892B0]">{item.value} TB</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </Card>
      </div>

      <Card className="col-span-4 p-6">
        <h4 className="text-white font-bold mb-6 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-[#38B2AC]" /> 备份与恢复
        </h4>
        <div className="space-y-6">
          <div className="p-4 bg-[#0A192F] rounded border border-[#233554]">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[#CCD6F6]">每日增量备份</span>
              <span className="text-xs text-[#38B2AC]">已启用</span>
            </div>
            <p className="text-xs text-[#8892B0] mb-3">每日 02:00 UTC 执行，保留30天</p>
            <div className="flex justify-between text-xs text-[#8892B0]">
              <span>上次成功: Today 02:00</span>
              <span>大小: 12.5 GB</span>
            </div>
          </div>
          
          <div className="p-4 bg-[#0A192F] rounded border border-[#233554]">
             <div className="flex justify-between mb-2">
              <span className="text-sm text-[#CCD6F6]">每周全量备份</span>
              <span className="text-xs text-[#38B2AC]">已启用</span>
            </div>
            <p className="text-xs text-[#8892B0] mb-3">每周日 04:00 UTC 执行，保留1年</p>
            <div className="flex justify-between text-xs text-[#8892B0]">
              <span>上次成功: Sun 04:00</span>
              <span>大小: 8.2 TB</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#233554]">
            <button className="w-full py-2 bg-[#233554] text-[#CCD6F6] text-sm rounded hover:bg-[#F56565]/20 hover:text-[#F56565] transition-colors">
              立即执行手动备份
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};