import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Box, Brain, Zap, Star, MoreHorizontal } from '@/app/components/SafeIcons';

const MODELS = [
  { id: 1, name: 'LSTM Price Predictor', type: 'AI', acc: '89.2%', roi: '+12.5%', status: 'Deployed', color: '#4299E1' },
  { id: 2, name: 'Quantum SVM Classifier', type: 'Quantum', acc: '94.5%', roi: '+18.2%', status: 'Training', color: '#ECC94B' },
  { id: 3, name: 'Mean Reversion Classic', type: 'Classic', acc: '65.0%', roi: '+5.4%', status: 'Inactive', color: '#8892B0' },
  { id: 4, name: 'Transformer Alpha V3', type: 'AI', acc: '91.8%', roi: '+22.1%', status: 'Deployed', color: '#4299E1' },
  { id: 5, name: 'HHL Arbitrage Finder', type: 'Quantum', acc: '88.0%', roi: '+15.6%', status: 'Deployed', color: '#ECC94B' },
  { id: 6, name: 'Random Forest Risk', type: 'AI', acc: '87.4%', roi: '-', status: 'Inactive', color: '#4299E1' },
];

export const ModelLibrary = () => {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          {['全部', '经典模型', 'AI 模型', '量子模型'].map((tab, i) => (
            <button key={i} className={`text-sm ${i === 0 ? 'text-white font-bold border-b-2 border-[#38B2AC]' : 'text-[#8892B0] hover:text-[#CCD6F6]'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
           <input type="text" placeholder="搜索模型..." className="bg-[#0A192F] border border-[#233554] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#4299E1]" />
           <button className="px-3 py-1.5 bg-[#4299E1] text-white text-xs rounded hover:brightness-110">+ 导入模型</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 overflow-y-auto pb-4">
        {MODELS.map((m) => (
          <Card key={m.id} className="p-5 group hover:border-[#CCD6F6] transition-all cursor-pointer flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded bg-[${m.color}]/10`}>
                  {m.type === 'Quantum' ? <Zap className="w-6 h-6" style={{ color: m.color }} /> : 
                   m.type === 'AI' ? <Brain className="w-6 h-6" style={{ color: m.color }} /> :
                   <Box className="w-6 h-6" style={{ color: m.color }} />}
                </div>
                <div>
                  <h4 className="text-white font-bold">{m.name}</h4>
                  <p className="text-xs text-[#8892B0]">{m.type} Model • V1.2</p>
                </div>
              </div>
              <button className="text-[#8892B0] hover:text-[#CCD6F6]"><Star className="w-4 h-4" /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#0A192F] p-2 rounded">
                <p className="text-[10px] text-[#8892B0]">准确率 (Accuracy)</p>
                <p className="text-sm font-mono text-white">{m.acc}</p>
              </div>
              <div className="bg-[#0A192F] p-2 rounded">
                <p className="text-[10px] text-[#8892B0]">历史年化 (ROI)</p>
                <p className={`text-sm font-mono ${m.roi.startsWith('+') ? 'text-[#38B2AC]' : 'text-[#8892B0]'}`}>{m.roi}</p>
              </div>
            </div>

            <div className="mt-auto flex justify-between items-center pt-3 border-t border-[#233554]">
               <span className={`flex items-center gap-1.5 text-xs ${
                  m.status === 'Deployed' ? 'text-[#38B2AC]' : 
                  m.status === 'Training' ? 'text-[#ECC94B]' : 'text-[#8892B0]'
               }`}>
                 <span className={`w-1.5 h-1.5 rounded-full ${
                   m.status === 'Training' ? 'bg-[#ECC94B] animate-pulse' : 
                   m.status === 'Deployed' ? 'bg-[#38B2AC]' : 'bg-[#8892B0]'
                 }`} />
                 {m.status}
               </span>
               <button className="text-[#8892B0] hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};