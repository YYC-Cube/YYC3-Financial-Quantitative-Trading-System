import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Settings, Play, RefreshCcw } from 'lucide-react';

export const AlgoConfig = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <Card className="col-span-3 p-4">
        <h4 className="text-white font-bold mb-4">算法库</h4>
        <div className="space-y-2">
          {['VQE (变分量子求解)', 'QAOA (近似优化)', 'Grover (搜索)', 'Shor (因子分解)', 'HHL (线性方程)'].map((a, i) => (
            <div key={i} className={`p-3 rounded cursor-pointer ${i === 1 ? 'bg-[#4299E1] text-white' : 'hover:bg-[#112240] text-[#8892B0]'}`}>
              {a}
            </div>
          ))}
        </div>
      </Card>

      <Card className="col-span-9 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Settings className="text-[#ECC94B]" /> 参数配置: QAOA
          </h3>
          <button className="flex items-center gap-2 text-xs text-[#8892B0] hover:text-white">
            <RefreshCcw className="w-3 h-3" /> 重置参数
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 flex-1">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#8892B0] block mb-1">层数 (p)</label>
              <input type="range" min="1" max="10" className="w-full h-1 bg-[#233554] rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-[10px] text-[#8892B0]"><span>1</span><span>5</span><span>10</span></div>
            </div>
            <div>
              <label className="text-xs text-[#8892B0] block mb-1">初始 Beta</label>
              <input type="text" className="w-full bg-[#071425] border border-[#233554] rounded p-2 text-white" defaultValue="0.5" />
            </div>
            <div>
              <label className="text-xs text-[#8892B0] block mb-1">初始 Gamma</label>
              <input type="text" className="w-full bg-[#071425] border border-[#233554] rounded p-2 text-white" defaultValue="0.8" />
            </div>
          </div>
          
          <div className="bg-[#0A192F] border border-[#233554] rounded p-4">
            <h5 className="text-xs font-bold text-[#FFFFFF] mb-2">电路预览</h5>
            <div className="flex items-center justify-center h-full text-[#8892B0] text-xs">
              [Quantum Circuit Diagram Placeholder]
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="px-6 py-2 bg-[#38B2AC] text-white rounded font-bold flex items-center gap-2 hover:brightness-110">
            <Play className="w-4 h-4" /> 提交任务
          </button>
        </div>
      </Card>
    </div>
  );
};