import React, { useState } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Play, Download, Save, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DIST_DATA = Array.from({ length: 50 }, (_, i) => {
  const x = -0.1 + (i / 50) * 0.2;
  // Normal distribution curve
  const y = (1 / Math.sqrt(2 * Math.PI * 0.01)) * Math.exp(-0.5 * Math.pow(x / 0.01, 2));
  return { x: x.toFixed(3), y, isVaR: x < -0.05 };
});

export const QuantumRisk = () => {
  const [progress, setProgress] = useState(0);
  const [computing, setComputing] = useState(false);

  const startCompute = () => {
    setComputing(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setComputing(false);
          return 100;
        }
        return p + 2;
      });
    }, 50);
  };

  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      {/* Configuration */}
      <Card className="col-span-12 lg:col-span-3 p-4 flex flex-col gap-4">
        <h3 className="text-white font-bold text-sm border-b border-[#233554] pb-2">量子参数配置</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#8892B0] block mb-1">置信水平 (Confidence)</label>
            <select className="w-full bg-[#071425] border border-[#233554] text-xs text-white p-2 rounded outline-none focus:border-[#38B2AC]">
              <option>99%</option>
              <option>95%</option>
              <option>90%</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#8892B0] block mb-1">持有期 (Horizon)</label>
            <select className="w-full bg-[#071425] border border-[#233554] text-xs text-white p-2 rounded outline-none focus:border-[#38B2AC]">
              <option>1 天 (Daily)</option>
              <option>10 天 (10-Day)</option>
              <option>30 天 (Monthly)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#8892B0] block mb-1">模拟路径数 (Simulations)</label>
            <input type="number" className="w-full bg-[#071425] border border-[#233554] text-xs text-white p-2 rounded" defaultValue={10000} />
          </div>
          
          <div className="pt-4">
            {computing ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#CCD6F6]">
                  <span>QPU 计算中...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-[#233554] rounded-full overflow-hidden">
                  <div className="h-full bg-[#38B2AC] transition-all duration-100" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <button 
                onClick={startCompute}
                className="w-full py-2 bg-[#38B2AC] text-white rounded text-sm font-medium hover:brightness-110 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> 开始计算
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-4 border-l-4 border-l-[#F56565]">
            <p className="text-xs text-[#8892B0]">VaR (Value at Risk)</p>
            <h3 className="text-2xl font-bold text-white mt-1">-$12,450.20</h3>
            <p className="text-[10px] text-[#F56565] mt-1">占比 2.45%</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-[#ECC94B]">
            <p className="text-xs text-[#8892B0]">CVaR (Expected Shortfall)</p>
            <h3 className="text-2xl font-bold text-white mt-1">-$18,200.50</h3>
            <p className="text-[10px] text-[#ECC94B] mt-1">尾部风险显著</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-[#4299E1]">
            <p className="text-xs text-[#8892B0]">计算耗时 (Quantum)</p>
            <h3 className="text-2xl font-bold text-white mt-1">0.045s</h3>
            <p className="text-[10px] text-[#4299E1] mt-1">较经典算法快 1200x</p>
          </Card>
        </div>

        <Card className="flex-1 p-6 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-white font-bold">损益分布预测 (P&L Distribution)</h4>
            <div className="flex gap-2">
              <button className="p-2 text-[#8892B0] hover:text-white hover:bg-[#233554] rounded"><Save className="w-4 h-4" /></button>
              <button className="p-2 text-[#8892B0] hover:text-white hover:bg-[#233554] rounded"><Download className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DIST_DATA}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F56565" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F56565" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38B2AC" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38B2AC" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#233554" vertical={false} />
                <XAxis dataKey="x" stroke="#8892B0" fontSize={10} tickLine={false} />
                <YAxis stroke="#8892B0" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#112240', borderColor: '#233554' }}
                  itemStyle={{ color: '#CCD6F6' }}
                />
                <Area type="monotone" dataKey="y" stroke="#38B2AC" fill="url(#colorSafe)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};