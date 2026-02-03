import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Terminal, Bug, Play, Save } from 'lucide-react';

export const ExperimentWorkshop = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <Card className="col-span-8 bg-[#071425] border border-[#233554] flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 p-4 opacity-20 pointer-events-none grid grid-cols-[40px_1fr] gap-4">
           <div className="border-r border-[#CCD6F6]"></div>
           <div className="grid grid-rows-[repeat(20,40px)] w-full">
             {Array.from({length:20}).map((_, i) => <div key={i} className="border-b border-[#CCD6F6]"></div>)}
           </div>
        </div>
        <div className="p-4 z-10 flex justify-between items-center bg-[#112240] border-b border-[#233554]">
          <h4 className="text-white font-bold flex items-center gap-2">
            <Bug className="text-[#F56565]" /> 算法调试画布
          </h4>
          <div className="flex gap-2">
            <button className="p-1.5 bg-[#38B2AC] text-white rounded"><Play className="w-4 h-4" /></button>
            <button className="p-1.5 bg-[#233554] text-[#CCD6F6] rounded"><Save className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex-1 z-10 p-8 flex items-center justify-center">
          <div className="border-2 border-[#4299E1] bg-[#112240] p-4 rounded w-64 h-32 flex items-center justify-center text-[#4299E1] shadow-lg">
            Hadamard Gate (H)
          </div>
          <div className="w-16 h-0.5 bg-[#CCD6F6]"></div>
          <div className="border-2 border-[#ECC94B] bg-[#112240] p-4 rounded w-64 h-32 flex items-center justify-center text-[#ECC94B] shadow-lg">
            CNOT Gate
          </div>
        </div>
      </Card>

      <Card className="col-span-4 flex flex-col bg-[#0A192F] font-mono text-xs">
        <div className="p-3 border-b border-[#233554] flex items-center gap-2 text-[#8892B0]">
          <Terminal className="w-4 h-4" /> 调试日志
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-2 text-[#CCD6F6]">
          <p><span className="text-[#38B2AC]">[INFO]</span> Initializing QVM...</p>
          <p><span className="text-[#38B2AC]">[INFO]</span> Circuit depth: 12</p>
          <p><span className="text-[#ECC94B]">[WARN]</span> Coherence time near limit</p>
          <p><span className="text-[#38B2AC]">[INFO]</span> Applying H gate on q[0]</p>
          <p><span className="text-[#38B2AC]">[INFO]</span> Applying CNOT on q[0], q[1]</p>
          <p><span className="text-[#F56565]">[ERR ]</span> Measurement error rate &gt; 1e-3</p>
          <p className="animate-pulse">_</p>
        </div>
      </Card>
    </div>
  );
};