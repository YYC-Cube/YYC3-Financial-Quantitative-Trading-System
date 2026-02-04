import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Database, Archive, RefreshCw, CheckCircle, Clock } from '@/app/components/SafeIcons';

export const BackupManager = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <div className="col-span-8 flex flex-col gap-6">
        <Card className="p-6">
          <h4 className="text-white font-bold mb-6 flex items-center gap-2">
            <Archive className="text-[#38B2AC]" /> 备份策略配置
          </h4>
          <div className="grid grid-cols-2 gap-6">
             <div className="p-4 bg-[#0A192F] rounded border border-[#233554]">
                <div className="flex justify-between mb-2">
                   <h5 className="text-white font-bold text-sm">自动定时备份</h5>
                   <div className="w-8 h-4 bg-[#38B2AC] rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                   </div>
                </div>
                <p className="text-xs text-[#8892B0] mb-4">系统将在每天闲时自动执行全量备份</p>
                
                <div className="space-y-3">
                   <div>
                      <label className="text-[10px] text-[#8892B0] block mb-1">备份时间</label>
                      <input type="time" defaultValue="02:00" className="w-full bg-[#112240] text-white text-xs p-2 rounded border border-[#233554]" />
                   </div>
                   <div>
                      <label className="text-[10px] text-[#8892B0] block mb-1">保留策略</label>
                      <select className="w-full bg-[#112240] text-white text-xs p-2 rounded border border-[#233554]">
                        <option>保留最近 7 天</option>
                        <option>保留最近 30 天</option>
                        <option>永久保留</option>
                      </select>
                   </div>
                </div>
             </div>

             <div className="p-4 bg-[#0A192F] rounded border border-[#233554] flex flex-col">
                <h5 className="text-white font-bold text-sm mb-2">手动备份</h5>
                <p className="text-xs text-[#8892B0] mb-auto">立即创建一个当前系统状态的快照备份，不影响自动备份计划。</p>
                
                <div className="mt-4">
                   <label className="text-[10px] text-[#8892B0] block mb-1">备份备注</label>
                   <input type="text" placeholder="e.g. Pre-upgrade backup" className="w-full bg-[#112240] text-white text-xs p-2 rounded border border-[#233554] mb-3" />
                   <button className="w-full py-2 bg-[#4299E1] text-white text-sm font-bold rounded hover:brightness-110">
                     立即执行备份
                   </button>
                </div>
             </div>
          </div>
        </Card>

        <Card className="flex-1 p-6 flex flex-col">
          <h4 className="text-white font-bold mb-4">备份历史记录</h4>
          <div className="flex-1 overflow-auto">
            <table className="w-full">
               <thead className="text-xs text-[#8892B0] bg-[#0A192F]">
                 <tr>
                   <th className="py-3 px-4 text-left">备份ID</th>
                   <th className="py-3 px-4 text-left">时间</th>
                   <th className="py-3 px-4 text-left">类型</th>
                   <th className="py-3 px-4 text-left">大小</th>
                   <th className="py-3 px-4 text-left">状态</th>
                   <th className="py-3 px-4 text-right">操作</th>
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {[
                   { id: 'BK-20240129-01', time: '2024-01-29 02:00', type: 'Auto', size: '12.5 GB', status: 'Success' },
                   { id: 'BK-20240128-01', time: '2024-01-28 02:00', type: 'Auto', size: '12.4 GB', status: 'Success' },
                   { id: 'BK-20240127-02', time: '2024-01-27 15:30', type: 'Manual', size: '12.3 GB', status: 'Success' },
                 ].map((bk, i) => (
                   <tr key={i} className="border-b border-[#233554]/50">
                     <td className="py-3 px-4 text-[#CCD6F6] font-mono">{bk.id}</td>
                     <td className="py-3 px-4 text-[#8892B0]">{bk.time}</td>
                     <td className="py-3 px-4 text-white">{bk.type}</td>
                     <td className="py-3 px-4 text-[#CCD6F6]">{bk.size}</td>
                     <td className="py-3 px-4 text-[#38B2AC] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {bk.status}</td>
                     <td className="py-3 px-4 text-right">
                       <button className="text-[#4299E1] hover:underline text-xs">恢复</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="col-span-4 flex flex-col gap-6">
        <Card className="p-6">
           <h4 className="text-white font-bold mb-4">存储概览</h4>
           <div className="space-y-4">
              <div>
                 <div className="flex justify-between text-xs text-[#8892B0] mb-1">
                   <span>Local Storage</span>
                   <span>450GB / 1TB</span>
                 </div>
                 <div className="w-full h-2 bg-[#233554] rounded-full overflow-hidden">
                   <div className="h-full bg-[#38B2AC] w-[45%]" />
                 </div>
              </div>
              <div>
                 <div className="flex justify-between text-xs text-[#8892B0] mb-1">
                   <span>Cloud Archive (S3)</span>
                   <span>12.5 TB</span>
                 </div>
                 <div className="w-full h-2 bg-[#233554] rounded-full overflow-hidden">
                   <div className="h-full bg-[#4299E1] w-[100%]" />
                 </div>
              </div>
           </div>
        </Card>

        <Card className="flex-1 p-6 bg-[#0A192F] border border-[#233554] flex flex-col">
           <h4 className="text-white font-bold mb-4 flex items-center gap-2">
             <RefreshCw className="text-[#ECC94B]" /> 数据一致性检查
           </h4>
           <div className="space-y-4 flex-1 overflow-auto">
             {[
               { table: 'market_ticks', status: 'Consistent', time: '10:00 AM' },
               { table: 'user_accounts', status: 'Consistent', time: '10:05 AM' },
               { table: 'trade_history', status: 'Consistent', time: '10:10 AM' },
               { table: 'strategy_logs', status: 'Checking...', time: 'Now' },
             ].map((check, i) => (
               <div key={i} className="flex justify-between items-center p-3 bg-[#112240] rounded border border-[#233554]">
                 <span className="text-sm text-[#CCD6F6] font-mono">{check.table}</span>
                 <div className="flex items-center gap-2">
                   {check.status === 'Checking...' ? (
                     <RefreshCw className="w-3 h-3 animate-spin text-[#ECC94B]" />
                   ) : (
                     <CheckCircle className="w-3 h-3 text-[#38B2AC]" />
                   )}
                   <span className={`text-xs ${check.status === 'Checking...' ? 'text-[#ECC94B]' : 'text-[#38B2AC]'}`}>{check.status}</span>
                 </div>
               </div>
             ))}
           </div>
           <button className="w-full mt-4 py-2 border border-[#233554] text-[#8892B0] rounded text-sm hover:text-white hover:bg-[#233554]">
             运行全量检查
           </button>
        </Card>
      </div>
    </div>
  );
};