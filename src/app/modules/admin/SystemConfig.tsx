import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Save, RotateCcw } from 'lucide-react';

export const SystemConfig = () => {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <Card className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-6 border-b border-[#233554] w-full">
             {['基础配置', '量子配置', '数据配置'].map((tab, i) => (
               <button key={i} className={`pb-3 text-sm font-medium ${i === 0 ? 'text-[#38B2AC] border-b-2 border-[#38B2AC]' : 'text-[#8892B0] hover:text-[#CCD6F6]'}`}>
                 {tab}
               </button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 max-w-4xl">
          <div className="space-y-6">
             <h4 className="text-white font-bold mb-4">系统基础设置</h4>
             
             <div>
               <label className="text-xs text-[#8892B0] block mb-2">系统名称 (中文)</label>
               <input type="text" defaultValue="言语云量化分析交易系统" className="w-full bg-[#0A192F] border border-[#233554] text-white p-2.5 rounded text-sm focus:border-[#4299E1] outline-none" />
             </div>

             <div>
               <label className="text-xs text-[#8892B0] block mb-2">访问域名</label>
               <input type="text" defaultValue="quant.yanyuyun.io" className="w-full bg-[#0A192F] border border-[#233554] text-white p-2.5 rounded text-sm focus:border-[#4299E1] outline-none" />
             </div>

             <div>
               <label className="text-xs text-[#8892B0] block mb-2">默认运行中心时区</label>
               <select className="w-full bg-[#0A192F] border border-[#233554] text-white p-2.5 rounded text-sm focus:border-[#4299E1] outline-none">
                 <option>UTC (Coordinated Universal Time)</option>
                 <option>Asia/Shanghai (UTC+8)</option>
                 <option>America/New_York (UTC-5)</option>
               </select>
             </div>

             <div>
               <label className="text-xs text-[#8892B0] block mb-2">全局行情刷新频率</label>
               <div className="flex items-center gap-4">
                 <input type="range" min="1" max="10" defaultValue="3" className="flex-1 accent-[#38B2AC]" />
                 <span className="text-white font-mono text-sm">3s</span>
               </div>
             </div>
          </div>

          <div className="space-y-6">
             <h4 className="text-white font-bold mb-4">通知与外观</h4>
             
             <div className="flex items-center justify-between p-3 bg-[#0A192F] rounded border border-[#233554]">
               <div>
                 <p className="text-sm text-white">系统维护通知</p>
                 <p className="text-[10px] text-[#8892B0]">提前24小时通知全员</p>
               </div>
               <div className="w-10 h-5 bg-[#38B2AC] rounded-full relative cursor-pointer">
                 <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
               </div>
             </div>

             <div className="flex items-center justify-between p-3 bg-[#0A192F] rounded border border-[#233554]">
               <div>
                 <p className="text-sm text-white">强制深色模式</p>
                 <p className="text-[10px] text-[#8892B0]">Deep Space Blue 主题</p>
               </div>
               <div className="w-10 h-5 bg-[#38B2AC] rounded-full relative cursor-pointer">
                 <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
               </div>
             </div>
             
             <div>
               <label className="text-xs text-[#8892B0] block mb-2">LOGO 上传</label>
               <div className="border-2 border-dashed border-[#233554] rounded p-6 flex flex-col items-center justify-center text-[#8892B0] hover:border-[#4299E1] transition-colors cursor-pointer">
                 <span className="text-sm">Click to upload</span>
                 <span className="text-[10px] mt-1">PNG, SVG (Max 2MB)</span>
               </div>
             </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-[#233554] flex gap-4">
          <button className="px-6 py-2.5 bg-[#4299E1] text-white text-sm font-bold rounded flex items-center gap-2 hover:brightness-110">
            <Save className="w-4 h-4" /> 保存配置
          </button>
          <button className="px-6 py-2.5 bg-[#233554] text-[#CCD6F6] text-sm font-bold rounded flex items-center gap-2 hover:text-white">
            <RotateCcw className="w-4 h-4" /> 重置默认
          </button>
        </div>
      </Card>
    </div>
  );
};