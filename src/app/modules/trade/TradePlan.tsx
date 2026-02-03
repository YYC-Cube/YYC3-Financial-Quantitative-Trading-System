import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Calendar, Clock, ArrowRight, Trash2, Edit } from 'lucide-react';

export const TradePlan = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <Card className="col-span-4 p-6 flex flex-col gap-6">
        <h4 className="text-white font-bold mb-2">新建交易计划</h4>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#8892B0] block mb-1">计划名称</label>
            <input type="text" placeholder="e.g. BTC Breakout Buy" className="w-full bg-[#0A192F] border border-[#233554] text-white p-2 rounded text-sm" />
          </div>

          <div className="p-4 bg-[#0A192F] rounded border border-[#233554]">
            <h5 className="text-xs text-[#38B2AC] font-bold mb-3 uppercase">触发条件 (Trigger)</h5>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                 <select className="bg-[#112240] text-white text-xs p-1.5 rounded border border-[#233554]">
                   <option>Price</option>
                   <option>RSI(14)</option>
                   <option>Time</option>
                 </select>
                 <select className="bg-[#112240] text-white text-xs p-1.5 rounded border border-[#233554]">
                   <option>{'>='}</option>
                   <option>{'<='}</option>
                   <option>{'=='}</option>
                 </select>
                 <input type="text" placeholder="Value" className="flex-1 bg-[#112240] text-white text-xs p-1.5 rounded border border-[#233554]" />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="text-[#8892B0] w-5 h-5" />
          </div>

          <div className="p-4 bg-[#0A192F] rounded border border-[#233554]">
            <h5 className="text-xs text-[#F56565] font-bold mb-3 uppercase">执行动作 (Action)</h5>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                 <div>
                   <label className="text-[10px] text-[#8892B0]">Side</label>
                   <select className="w-full bg-[#112240] text-white text-xs p-1.5 rounded border border-[#233554]">
                     <option>Buy Long</option>
                     <option>Sell Short</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-[10px] text-[#8892B0]">Type</label>
                   <select className="w-full bg-[#112240] text-white text-xs p-1.5 rounded border border-[#233554]">
                     <option>Market</option>
                     <option>Limit</option>
                   </select>
                 </div>
              </div>
              <div>
                 <label className="text-[10px] text-[#8892B0]">Size</label>
                 <input type="text" placeholder="Amount" className="w-full bg-[#112240] text-white text-xs p-1.5 rounded border border-[#233554]" />
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex gap-3">
             <button className="flex-1 py-2 bg-[#4299E1] text-white rounded font-bold hover:brightness-110">保存计划</button>
             <button className="flex-1 py-2 bg-[#233554] text-[#CCD6F6] rounded font-bold hover:text-white">重置</button>
          </div>
        </div>
      </Card>

      <Card className="col-span-8 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-white font-bold">活跃计划列表</h4>
          <div className="flex gap-2">
             <button className="px-3 py-1 bg-[#233554] text-[#8892B0] text-xs rounded hover:text-white">已触发历史</button>
          </div>
        </div>

        <div className="flex-1 overflow-auto space-y-3">
          {[
            { name: 'ETH Dump Protection', condition: 'Price <= 2150', action: 'Sell 10 ETH (Market)', status: 'Active', created: '2024-01-28 10:00' },
            { name: 'Morning Breakout', condition: 'Time == 09:30 AND Price >= 43500', action: 'Buy 0.5 BTC (Limit 43550)', status: 'Active', created: '2024-01-29 08:00' },
            { name: 'RSI Oversold Scalp', condition: 'RSI(14) <= 30', action: 'Buy 100 SOL', status: 'Paused', created: '2024-01-25 15:30' },
          ].map((plan, i) => (
            <div key={i} className="p-4 bg-[#0A192F] border border-[#233554] rounded hover:border-[#4299E1] transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${plan.status === 'Active' ? 'bg-[#38B2AC] animate-pulse' : 'bg-[#ECC94B]'}`} />
                  <h5 className="text-white font-bold text-sm">{plan.name}</h5>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 bg-[#112240] text-[#4299E1] rounded"><Edit className="w-3 h-3" /></button>
                  <button className="p-1.5 bg-[#112240] text-[#F56565] rounded"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2">
                   <span className="text-[#8892B0] bg-[#233554] px-2 py-0.5 rounded">IF</span>
                   <span className="text-[#ECC94B] font-mono">{plan.condition}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[#8892B0] bg-[#233554] px-2 py-0.5 rounded">THEN</span>
                   <span className="text-[#38B2AC] font-mono">{plan.action}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-[#233554]/50 flex justify-between items-center text-[10px] text-[#8892B0]">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {plan.created}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Expires: Never</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};