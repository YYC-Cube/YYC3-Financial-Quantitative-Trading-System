import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { FileText, AlertTriangle, Cpu, Search, Trash2, Download } from '@/app/components/SafeIcons';

const LOGS = [
  { id: 1024, time: '2024-01-29 10:25:00', level: 'INFO', module: 'Auth', msg: 'User Alex login successful from 192.168.1.5', duration: '45ms' },
  { id: 1023, time: '2024-01-29 10:24:45', level: 'WARN', module: 'Market', msg: 'Binance WebSocket latency > 200ms detected', duration: '-' },
  { id: 1022, time: '2024-01-29 10:24:30', level: 'ERROR', module: 'Order', msg: 'Order #9921 failed: Insufficient margin', duration: '120ms' },
  { id: 1021, time: '2024-01-29 10:24:15', level: 'INFO', module: 'Risk', msg: 'VaR calculation completed for Portfolio A', duration: '1.2s' },
  { id: 1020, time: '2024-01-29 10:24:00', level: 'INFO', module: 'System', msg: 'Hourly backup started', duration: '-' },
];

export const LogMonitor = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <div className="col-span-3 flex flex-col gap-6">
        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-[#38B2AC]">
           <div className="p-3 bg-[#38B2AC]/10 rounded text-[#38B2AC]"><FileText className="w-6 h-6" /></div>
           <div>
             <p className="text-xs text-[#8892B0]">今日日志总量</p>
             <h3 className="text-xl font-bold text-white">245,892</h3>
           </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-[#F56565]">
           <div className="p-3 bg-[#F56565]/10 rounded text-[#F56565]"><AlertTriangle className="w-6 h-6" /></div>
           <div>
             <p className="text-xs text-[#8892B0]">错误警告</p>
             <h3 className="text-xl font-bold text-white">42</h3>
           </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-[#4299E1]">
           <div className="p-3 bg-[#4299E1]/10 rounded text-[#4299E1]"><Cpu className="w-6 h-6" /></div>
           <div>
             <p className="text-xs text-[#8892B0]">平均响应耗时</p>
             <h3 className="text-xl font-bold text-white">48ms</h3>
           </div>
        </Card>
        
        <div className="flex-1 bg-[#0A192F] rounded border border-[#233554] p-4">
           <h4 className="text-white font-bold mb-4 text-sm">日志筛选</h4>
           <div className="space-y-4">
             <div>
               <label className="text-xs text-[#8892B0] block mb-1">日志级别</label>
               <select className="w-full bg-[#112240] text-white text-xs p-2 rounded border border-[#233554]">
                 <option>ALL</option>
                 <option>INFO</option>
                 <option>WARN</option>
                 <option>ERROR</option>
               </select>
             </div>
             <div>
               <label className="text-xs text-[#8892B0] block mb-1">模块</label>
               <select className="w-full bg-[#112240] text-white text-xs p-2 rounded border border-[#233554]">
                 <option>ALL</option>
                 <option>Market</option>
                 <option>Trade</option>
                 <option>Risk</option>
                 <option>System</option>
               </select>
             </div>
             <div>
               <label className="text-xs text-[#8892B0] block mb-1">关键词</label>
               <div className="relative">
                 <input type="text" className="w-full bg-[#112240] text-white text-xs p-2 rounded border border-[#233554]" placeholder="Search..." />
                 <Search className="w-3 h-3 absolute right-2 top-2.5 text-[#8892B0]" />
               </div>
             </div>
           </div>
        </div>
      </div>

      <Card className="col-span-9 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-white font-bold">系统实时日志流</h4>
          <div className="flex gap-2">
             <button className="px-3 py-1.5 bg-[#233554] text-[#F56565] text-xs rounded hover:bg-[#F56565]/20 flex items-center gap-2">
               <Trash2 className="w-3 h-3" /> 清理旧日志
             </button>
             <button className="px-3 py-1.5 bg-[#233554] text-[#CCD6F6] text-xs rounded hover:text-white flex items-center gap-2">
               <Download className="w-3 h-3" /> 导出日志
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#071425] rounded border border-[#233554] font-mono text-xs p-2">
           <table className="w-full">
              <thead className="text-[#8892B0] border-b border-[#233554]">
                <tr>
                   <th className="py-2 text-left w-20">Level</th>
                   <th className="py-2 text-left w-32">Time</th>
                   <th className="py-2 text-left w-24">Module</th>
                   <th className="py-2 text-left">Message</th>
                   <th className="py-2 text-right w-20">Duration</th>
                </tr>
              </thead>
              <tbody className="text-[#CCD6F6]">
                {LOGS.map((log) => (
                  <tr key={log.id} className="border-b border-[#233554]/30 hover:bg-[#112240] transition-colors">
                    <td className={`py-2 px-2 font-bold ${
                      log.level === 'INFO' ? 'text-[#38B2AC]' :
                      log.level === 'WARN' ? 'text-[#ECC94B]' : 'text-[#F56565]'
                    }`}>{log.level}</td>
                    <td className="py-2 px-2 text-[#8892B0]">{log.time.split(' ')[1]}</td>
                    <td className="py-2 px-2 text-[#4299E1]">{log.module}</td>
                    <td className="py-2 px-2">{log.msg}</td>
                    <td className="py-2 px-2 text-right text-[#8892B0]">{log.duration}</td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      </Card>
    </div>
  );
};