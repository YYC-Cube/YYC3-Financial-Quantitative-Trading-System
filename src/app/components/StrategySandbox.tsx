import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Play, Pause, RotateCcw, Cpu, BarChart2, CheckCircle2, AlertOctagon } from '@/app/components/SafeIcons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BacktestResult {
  time: string;
  equity: number;
  drawdown: number;
}

export const StrategySandbox = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [metrics, setMetrics] = useState({ return: '0%', sharpe: '0.00', maxDD: '0%' });
  const [logs, setLogs] = useState<string[]>([]);
  
  // Simulate WASM loading state
  const [wasmReady, setWasmReady] = useState(false);

  useEffect(() => {
    // Simulate loading a WASM module
    const timer = setTimeout(() => {
      setWasmReady(true);
      setLogs(prev => [...prev, '[System] WASM Module (strat_engine_v1.wasm) loaded successfully.', '[System] Engine initialized: 128-bit float precision mode.']);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const runBacktest = async () => {
    if (!wasmReady || isRunning) return;
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    setLogs(prev => [...prev, '[Engine] Starting historical simulation (Period: 2023-2024)...']);

    // Simulate high-speed WASM execution
    let currentEquity = 10000;
    let dataPoints: BacktestResult[] = [];
    
    for (let i = 0; i <= 100; i++) {
      await new Promise(r => setTimeout(r, 20)); // Simulate computation tick
      
      const change = (Math.random() - 0.45) * 200; // Slight upward drift
      currentEquity += change;
      const drawdown = Math.min(0, (currentEquity - 10000) / 10000 * 100); // Simple DD logic
      
      dataPoints.push({
        time: `Day ${i}`,
        equity: currentEquity,
        drawdown: Math.abs(drawdown)
      });

      if (i % 10 === 0) {
        setProgress(i);
        setResults([...dataPoints]); // Update chart incrementally
      }
    }

    setMetrics({
      return: `${((currentEquity - 10000) / 100).toFixed(2)}%`,
      sharpe: (1.5 + Math.random()).toFixed(2),
      maxDD: `${(Math.max(...dataPoints.map(d => d.drawdown))).toFixed(2)}%`
    });

    setLogs(prev => [...prev, '[Engine] Simulation complete. Generating report...']);
    setIsRunning(false);
  };

  return (
    <Card className="p-0 bg-[#0A192F] border border-[#233554] overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-[#233554] flex justify-between items-center bg-[#112240]">
        <div>
           <h4 className="text-white font-bold flex items-center gap-2">
             <Cpu className="w-5 h-5 text-[#ECC94B]" /> 策略回测沙箱 (WASM)
           </h4>
           <p className="text-xs text-[#8892B0] mt-1">
             Client-side High Frequency Simulation
           </p>
        </div>
        <div className="flex gap-2">
           <button 
             disabled={!wasmReady || isRunning}
             onClick={runBacktest}
             className={`px-4 py-2 rounded font-bold text-xs flex items-center gap-2 transition-all ${
               isRunning 
                 ? 'bg-[#ECC94B]/20 text-[#ECC94B] cursor-wait' 
                 : wasmReady 
                    ? 'bg-[#38B2AC] text-white hover:bg-[#319795]' 
                    : 'bg-[#233554] text-[#8892B0] cursor-not-allowed'
             }`}
           >
             {isRunning ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
             {isRunning ? 'Running...' : wasmReady ? '执行回测' : 'Loading WASM...'}
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
         {/* Chart Area */}
         <div className="flex-1 p-4 flex flex-col">
            <div className="flex justify-between mb-4">
               <div className="p-3 bg-[#071425] rounded border border-[#233554] w-24">
                  <p className="text-[10px] text-[#8892B0]">总回报</p>
                  <p className={`text-sm font-bold ${parseFloat(metrics.return) >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
                    {metrics.return}
                  </p>
               </div>
               <div className="p-3 bg-[#071425] rounded border border-[#233554] w-24">
                  <p className="text-[10px] text-[#8892B0]">Sharpe</p>
                  <p className="text-sm font-bold text-white">{metrics.sharpe}</p>
               </div>
               <div className="p-3 bg-[#071425] rounded border border-[#233554] w-24">
                  <p className="text-[10px] text-[#8892B0]">Max DD</p>
                  <p className="text-sm font-bold text-[#F56565]">{metrics.maxDD}</p>
               </div>
            </div>
            
            <div className="flex-1 min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results}>
                     <defs>
                        <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#38B2AC" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#38B2AC" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#233554" vertical={false} />
                     <XAxis dataKey="time" hide />
                     <YAxis hide domain={['auto', 'auto']} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#112240', borderColor: '#233554', color: '#fff' }}
                        itemStyle={{ color: '#38B2AC' }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="equity" 
                        stroke="#38B2AC" 
                        fillOpacity={1} 
                        fill="url(#colorEquity)" 
                        isAnimationActive={false}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Console / Log Area */}
         <div className="h-40 lg:h-full lg:w-64 bg-[#020c1b] border-t lg:border-t-0 lg:border-l border-[#233554] p-2 font-mono text-[10px] overflow-y-auto custom-scrollbar flex flex-col">
            <div className="text-[#8892B0] mb-2 sticky top-0 bg-[#020c1b] py-1 border-b border-[#233554] flex items-center gap-1">
               <AlertOctagon className="w-3 h-3" /> Console Output
            </div>
            {logs.map((log, i) => (
               <div key={i} className={`mb-1 break-words ${log.includes('[System]') ? 'text-[#4299E1]' : log.includes('Error') ? 'text-[#F56565]' : 'text-[#8892B0]'}`}>
                  <span className="opacity-50 mr-2">{new Date().toLocaleTimeString().split(' ')[0]}</span>
                  {log}
               </div>
            ))}
            <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
         </div>
      </div>
    </Card>
  );
};