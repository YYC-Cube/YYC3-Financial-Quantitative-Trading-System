import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Layers, ArrowRight, PlayCircle, StopCircle, RotateCcw } from 'lucide-react';

export const DataProcessing = () => {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold">数据处理流程编排</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-[#233554] text-[#CCD6F6] text-xs rounded hover:text-white flex items-center gap-2">
            <RotateCcw className="w-3 h-3" /> 重置画布
          </button>
          <button className="px-3 py-1.5 bg-[#38B2AC] text-white text-xs rounded hover:brightness-110 flex items-center gap-2">
            <PlayCircle className="w-3 h-3" /> 运行流程
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <Card className="col-span-2 p-4 flex flex-col gap-4">
          <h4 className="text-xs font-bold text-[#8892B0] uppercase">组件库</h4>
          {['数据读取', '清洗转换', '特征工程', '数据聚合', '模型推理', '结果写入'].map((item) => (
             <div key={item} className="p-3 bg-[#0A192F] border border-[#233554] rounded text-sm text-[#CCD6F6] cursor-grab active:cursor-grabbing hover:border-[#4299E1] transition-colors flex items-center gap-2">
               <Layers className="w-4 h-4 text-[#8892B0]" />
               {item}
             </div>
          ))}
        </Card>
        
        <Card className="col-span-10 relative overflow-hidden bg-[#0A192F] border-2 border-dashed border-[#233554] flex items-center justify-center">
           {/* Mock Visual Flow */}
           <div className="flex items-center gap-8">
             <div className="w-32 h-16 bg-[#112240] border border-[#4299E1] rounded flex items-center justify-center text-sm text-[#4299E1] font-medium shadow-lg shadow-[#4299E1]/20">
               PostgreSQL读取
             </div>
             <ArrowRight className="w-6 h-6 text-[#8892B0]" />
             <div className="w-32 h-16 bg-[#112240] border border-[#38B2AC] rounded flex items-center justify-center text-sm text-[#38B2AC] font-medium shadow-lg shadow-[#38B2AC]/20 relative">
               异常值过滤
               <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#38B2AC] rounded-full flex items-center justify-center text-[8px] text-[#0A192F] animate-pulse">Running</div>
             </div>
             <ArrowRight className="w-6 h-6 text-[#8892B0]" />
             <div className="w-32 h-16 bg-[#112240] border border-[#ECC94B] rounded flex items-center justify-center text-sm text-[#ECC94B] font-medium shadow-lg shadow-[#ECC94B]/20">
               时序聚合
             </div>
             <ArrowRight className="w-6 h-6 text-[#8892B0]" />
             <div className="w-32 h-16 bg-[#112240] border border-[#CCD6F6] rounded flex items-center justify-center text-sm text-[#CCD6F6] font-medium">
               HDFS 写入
             </div>
           </div>
           
           <div className="absolute bottom-4 left-4 p-3 bg-[#112240]/80 backdrop-blur border border-[#233554] rounded text-xs text-[#CCD6F6]">
             <p className="mb-1"><span className="text-[#38B2AC]">●</span> 节点状态: Running</p>
             <p><span className="text-[#8892B0]">●</span> 处理速率: 45k ops/s</p>
           </div>
        </Card>
      </div>
    </div>
  );
};