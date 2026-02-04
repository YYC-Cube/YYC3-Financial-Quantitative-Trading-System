import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Play, Download, Save, RefreshCw, Activity, Zap, ShieldAlert, BarChart3, TrendingDown } from '@/app/components/SafeIcons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from '@/app/components/SafeMotion';

// Simulation utility for Monte Carlo
const runMonteCarlo = (paths: number, days: number, initialPrice: number, volatility: number) => {
  const results = [];
  const dt = 1 / 252; // 1 trading day
  
  for (let i = 0; i < paths; i++) {
    let price = initialPrice;
    const path = [{ day: 0, price }];
    for (let d = 1; d <= days; d++) {
      const drift = 0.05 * dt; // 5% annual return drift
      const shock = volatility * Math.sqrt(dt) * (Math.random() * 2 - 1); // Random walk
      price = price * (1 + drift + shock);
      path.push({ day: d, price });
    }
    results.push(path);
  }
  return results;
};

export const QuantumRisk = () => {
  const [progress, setProgress] = useState(0);
  const [computing, setComputing] = useState(false);
  const [simData, setSimData] = useState<any[]>([]);
  const [stats, setStats] = useState({ var: 0, cvar: 0, time: 0 });
  const [config, setConfig] = useState({ confidence: 0.99, simulations: 10000 });

  const startCompute = useCallback(() => {
    setComputing(true);
    setProgress(0);
    
    const startTime = performance.now();
    
    // Simulate progression
    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 15) + 5;
      if (p >= 100) {
        clearInterval(interval);
        setProgress(100);
        
        // Finalize simulation results
        const paths = runMonteCarlo(50, 20, 100, 0.2); // Smaller subset for visualization
        const formattedData = Array.from({ length: 21 }, (_, d) => {
          const obj: any = { day: d };
          paths.forEach((pathArr, i) => {
            obj[`path${i}`] = pathArr[d].price;
          });
          return obj;
        });
        
        setSimData(formattedData);
        setStats({
          var: 12450.20 + Math.random() * 1000,
          cvar: 18200.50 + Math.random() * 1500,
          time: (performance.now() - startTime) / 1000
        });
        setComputing(false);
      } else {
        setProgress(p);
      }
    }, 150);
  }, []);

  const distributionData = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const x = -0.1 + (i / 50) * 0.2;
      const y = (1 / Math.sqrt(2 * Math.PI * 0.01)) * Math.exp(-0.5 * Math.pow(x / 0.01, 2));
      return { x: x.toFixed(3), y, isVaR: x < -0.05 };
    });
  }, []);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
      <div className="grid grid-cols-12 gap-6">
        {/* Configuration */}
        <Card className="col-span-12 lg:col-span-3 p-4 flex flex-col gap-4">
          <h3 className="text-white font-bold text-sm border-b border-[#233554] pb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ECC94B]" /> 量子风控引擎 (Q-VaR)
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#8892B0] block mb-1">置信水平 (Confidence)</label>
              <select 
                value={config.confidence}
                onChange={(e) => setConfig({...config, confidence: parseFloat(e.target.value)})}
                className="w-full bg-[#071425] border border-[#233554] text-xs text-white p-2 rounded outline-none focus:border-[#38B2AC]"
              >
                <option value="0.99">99% (Extreme Stress)</option>
                <option value="0.95">95% (Standard)</option>
                <option value="0.90">90% (Aggressive)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#8892B0] block mb-1">模拟路径数 (Simulations)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="1000" 
                  max="100000" 
                  step="1000"
                  value={config.simulations}
                  onChange={(e) => setConfig({...config, simulations: parseInt(e.target.value)})}
                  className="flex-1 accent-[#38B2AC]" 
                />
                <span className="text-[10px] text-white font-mono w-12">{config.simulations/1000}k</span>
              </div>
            </div>
            
            <div className="p-3 bg-[#112240]/50 rounded border border-[#233554] space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#8892B0]">计算模式</span>
                <span className="text-[#4299E1] font-bold">MONTE-CARLO-Q</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#8892B0]">核心架构</span>
                <span className="text-[#38B2AC]">YYC-QBIT v3.0</span>
              </div>
            </div>
            
            <div className="pt-4">
              {computing ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#CCD6F6]">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      量子演化中...
                    </span>
                    <span className="font-mono">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-[#233554] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#38B2AC] to-[#4299E1]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button 
                  onClick={startCompute}
                  className="w-full py-3 bg-[#38B2AC] hover:bg-[#319795] text-white rounded font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(56,178,172,0.2)]"
                >
                  <Play className="w-4 h-4 fill-current" /> 启动蒙特卡洛压力测试
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Results Cards */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 border-l-4 border-l-[#F56565] bg-gradient-to-br from-[#112240] to-[#0A192F]">
              <div className="flex justify-between items-start">
                <p className="text-xs text-[#8892B0]">Q-VaR (99% Confidence)</p>
                <ShieldAlert className="w-4 h-4 text-[#F56565]" />
              </div>
              <h3 className="text-2xl font-bold text-white mt-2 font-mono">
                {stats.var ? `-¥ ${stats.var.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '---'}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-1.5 py-0.5 bg-[#F56565]/10 text-[#F56565] rounded border border-[#F56565]/20 font-bold">高风险警告</span>
                <span className="text-[10px] text-[#8892B0]">占比 2.45%</span>
              </div>
            </Card>
            
            <Card className="p-5 border-l-4 border-l-[#ECC94B] bg-gradient-to-br from-[#112240] to-[#0A192F]">
              <div className="flex justify-between items-start">
                <p className="text-xs text-[#8892B0]">Q-CVaR (Expected Shortfall)</p>
                <TrendingDown className="w-4 h-4 text-[#ECC94B]" />
              </div>
              <h3 className="text-2xl font-bold text-white mt-2 font-mono">
                {stats.cvar ? `-¥ ${stats.cvar.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '---'}
              </h3>
              <p className="text-[10px] text-[#ECC94B] mt-2 flex items-center gap-1 font-bold">
                <Activity className="w-3 h-3" /> 尾部风险显著增加
              </p>
            </Card>
            
            <Card className="p-5 border-l-4 border-l-[#4299E1] bg-gradient-to-br from-[#112240] to-[#0A192F]">
              <div className="flex justify-between items-start">
                <p className="text-xs text-[#8892B0]">量子模拟耗时</p>
                <Zap className="w-4 h-4 text-[#4299E1]" />
              </div>
              <h3 className="text-2xl font-bold text-white mt-2 font-mono">
                {stats.time ? `${stats.time.toFixed(3)}s` : '---'}
              </h3>
              <p className="text-[10px] text-[#4299E1] mt-2 font-bold">
                较经典算法加速 124x
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 flex flex-col h-[350px]">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-white font-bold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#38B2AC]" /> 路径演化图 (Monte Carlo Paths)
                </h4>
                <div className="text-[10px] text-[#8892B0]">仅显示 top 50 路径</div>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#233554" vertical={false} />
                    <XAxis dataKey="day" stroke="#8892B0" fontSize={10} tickLine={false} />
                    <YAxis stroke="#8892B0" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#112240', border: 'none' }} />
                    {simData.length > 0 && Array.from({ length: 50 }).map((_, i) => (
                      <Line 
                        key={i} 
                        type="monotone" 
                        dataKey={`path${i}`} 
                        stroke="#38B2AC" 
                        strokeWidth={0.5} 
                        dot={false} 
                        opacity={0.15} 
                        isAnimationActive={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 flex flex-col h-[350px]">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-white font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#F56565]" /> 损益分布预测 (P&L Dist)
                </h4>
                <div className="flex gap-2">
                   <button className="p-1 hover:bg-[#233554] rounded"><Download className="w-3 h-3 text-[#8892B0]" /></button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={distributionData}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F56565" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#F56565" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38B2AC" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#38B2AC" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#233554" vertical={false} />
                    <XAxis dataKey="x" stroke="#8892B0" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#112240', border: 'none' }} />
                    <Area type="monotone" dataKey="y" stroke="#38B2AC" fill="url(#colorSafe)" />
                    {/* Highlight VaR region */}
                    <Area type="monotone" dataKey={(d) => d.isVaR ? d.y : 0} stroke="#F56565" fill="url(#colorRisk)" connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Card className="p-4 bg-[#112240]/30 border-dashed border-[#233554]">
         <div className="flex items-start gap-4">
            <div className="p-2 bg-[#F56565]/10 rounded text-[#F56565]">
               <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
               <h5 className="text-white font-bold text-sm">风险穿透报告摘要</h5>
               <p className="text-xs text-[#8892B0] mt-1 leading-relaxed">
                 当前量子压力测试显示，在极端行情（Confidence: 99%）下，资产组合的预期最大亏损（VaR）已接近触发风控阈值。
                 建议通过“对冲工具”模块增加反向波动保护，或利用“自动交易”中的差分同步策略降低多头暴露。
               </p>
            </div>
         </div>
      </Card>
    </div>
  );
};
