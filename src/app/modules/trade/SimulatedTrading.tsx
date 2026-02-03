import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Gamepad2, RotateCcw, Save } from 'lucide-react';
import { RealTrading } from './RealTrading';

export const SimulatedTrading = () => {
  return (
    <div className="relative">
      <div className="absolute top-[-50px] right-0 flex gap-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#ECC94B]/10 border border-[#ECC94B] text-[#ECC94B] rounded text-sm hover:bg-[#ECC94B]/20">
          <Gamepad2 className="w-4 h-4" /> 模拟环境
        </button>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-6">
         <Card className="p-4 bg-[#0A192F] border-dashed border-[#ECC94B]/50 flex items-center justify-between">
            <div>
               <p className="text-[10px] text-[#8892B0]">模拟初始资金</p>
               <input type="number" defaultValue={1000000} className="bg-transparent text-white font-mono font-bold text-lg outline-none w-32" />
            </div>
            <RotateCcw className="w-4 h-4 text-[#8892B0] cursor-pointer hover:text-white" />
         </Card>
         <Card className="p-4 bg-[#0A192F] border-dashed border-[#ECC94B]/50 flex items-center justify-between">
            <div>
               <p className="text-[10px] text-[#8892B0]">手续费率</p>
               <div className="flex items-center">
                 <input type="number" defaultValue={0.0005} className="bg-transparent text-white font-mono font-bold text-lg outline-none w-20" />
               </div>
            </div>
            <Save className="w-4 h-4 text-[#8892B0] cursor-pointer hover:text-white" />
         </Card>
         <Card className="p-4 bg-[#0A192F] border-dashed border-[#ECC94B]/50 flex items-center justify-between">
            <div>
               <p className="text-[10px] text-[#8892B0]">滑点模型</p>
               <select className="bg-[#0A192F] text-white text-sm font-bold outline-none border-none -ml-1">
                 <option>Fixed (0.1%)</option>
                 <option>Random (0-0.2%)</option>
                 <option>None</option>
               </select>
            </div>
         </Card>
         <button className="bg-[#ECC94B] text-[#0A192F] font-bold rounded hover:brightness-110 shadow-[0_0_15px_rgba(236,201,75,0.3)]">
            重置模拟账户
         </button>
      </div>

      {/* Reuse the RealTrading component layout but with simulated context implied by the wrapper */}
      <RealTrading subView="asset" />
    </div>
  );
};