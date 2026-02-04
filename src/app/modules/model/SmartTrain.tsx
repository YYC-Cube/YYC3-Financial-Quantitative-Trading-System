import React, { useState } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Zap, Play, Pause, RotateCcw } from '@/app/components/SafeIcons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TRAIN_DATA = Array.from({ length: 50 }, (_, i) => ({
  epoch: i,
  loss: Math.exp(-0.1 * i) * 0.8 + Math.random() * 0.05,
  val_loss: Math.exp(-0.1 * i) * 0.9 + Math.random() * 0.1,
  acc: 1 - Math.exp(-0.1 * i) * 0.5 + Math.random() * 0.02
}));

export const SmartTrain = () => {
  const [quantumMode, setQuantumMode] = useState(false);
  const [training, setTraining] = useState(false);

  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <Card className="col-span-4 p-6 flex flex-col gap-6">
        <div>
          <h4 className="text-white font-bold mb-4">训练配置</h4>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#8892B0] block mb-1">训练数据集</label>
              <select className="w-full bg-[#0A192F] border border-[#233554] text-white text-xs p-2 rounded outline-none">
                <option>Global Market Tick Data (2020-2023)</option>
                <option>Custom Factor Set A</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#8892B0] block mb-1">模型架构</label>
              <select className="w-full bg-[#0A192F] border border-[#233554] text-white text-xs p-2 rounded outline-none">
                <option>LSTM (Long Short-Term Memory)</option>
                <option>Transformer Encoder</option>
                <option>CNN-1D</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-xs text-[#8892B0] block mb-1">Epochs</label>
                 <input type="number" defaultValue={100} className="w-full bg-[#0A192F] border border-[#233554] text-white text-xs p-2 rounded" />
               </div>
               <div>
                 <label className="text-xs text-[#8892B0] block mb-1">Learning Rate</label>
                 <input type="text" defaultValue="0.001" className="w-full bg-[#0A192F] border border-[#233554] text-white text-xs p-2 rounded" />
               </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#0A192F] rounded border border-[#233554] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={`w-5 h-5 ${quantumMode ? 'text-[#ECC94B]' : 'text-[#8892B0]'}`} />
            <div>
              <p className="text-sm text-white font-bold">量子加速训练</p>
              <p className="text-[10px] text-[#8892B0]">利用 QPU 加速梯度下降</p>
            </div>
          </div>
          <div 
            onClick={() => setQuantumMode(!quantumMode)}
            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${quantumMode ? 'bg-[#ECC94B]' : 'bg-[#233554]'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${quantumMode ? 'left-5.5' : 'left-0.5'}`} />
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-4">
           {training ? (
             <button onClick={() => setTraining(false)} className="py-2 bg-[#ECC94B] text-[#0A192F] font-bold rounded flex items-center justify-center gap-2 hover:brightness-110">
               <Pause className="w-4 h-4" /> 暂停
             </button>
           ) : (
             <button onClick={() => setTraining(true)} className="py-2 bg-[#38B2AC] text-[#0A192F] font-bold rounded flex items-center justify-center gap-2 hover:brightness-110">
               <Play className="w-4 h-4" /> 开始训练
             </button>
           )}
           <button className="py-2 bg-[#233554] text-[#CCD6F6] rounded flex items-center justify-center gap-2 hover:text-white">
             <RotateCcw className="w-4 h-4" /> 重置
           </button>
        </div>
      </Card>

      <Card className="col-span-8 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-white font-bold">训练进度监控</h4>
          <div className="flex gap-4 text-xs text-[#8892B0]">
            <span>当前 Epoch: <span className="text-white">45/100</span></span>
            <span>耗时: <span className="text-white">12m 30s</span></span>
            <span>预计剩余: <span className="text-white">15m</span></span>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TRAIN_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#233554" vertical={false} />
              <XAxis dataKey="epoch" stroke="#8892B0" fontSize={10} tickLine={false} />
              <YAxis stroke="#8892B0" fontSize={10} tickLine={false} domain={[0, 1]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#071425', borderColor: '#233554', color: '#CCD6F6' }}
              />
              <Legend />
              <Line type="monotone" dataKey="loss" stroke="#F56565" dot={false} strokeWidth={2} name="Train Loss" />
              <Line type="monotone" dataKey="val_loss" stroke="#ECC94B" dot={false} strokeWidth={2} name="Val Loss" />
              <Line type="monotone" dataKey="acc" stroke="#38B2AC" dot={false} strokeWidth={2} name="Accuracy" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};