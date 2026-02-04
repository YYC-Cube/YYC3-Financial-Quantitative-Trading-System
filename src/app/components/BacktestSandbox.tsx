import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Play, Pause, RefreshCw, Cpu, Activity, TrendingUp, AlertOctagon, Terminal, BarChart2 } from '@/app/components/SafeIcons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mocking a WASM interface since we can't load real .wasm files here
// In a real app, this would be: import init, { run_backtest } from '@/wasm/strategy_engine';

interface BacktestResult {
  time: string;
  equity: number;
  drawdown: number;
}

export const BacktestSandbox = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [metrics, setMetrics] = useState({ totalReturn: '0%', maxDrawdown: '0%', sharpRatio: '0.00' });
  
  const workerRef = useRef<Worker | null>(null);

  const startBacktest = () => {
    setIsRunning(true);
    setProgress(0);
    setLogs(['[WASM] Initializing memory...', '[WASM] Loading historical data (10GB)...']);
    setResults([]);
    
    // Simulate WASM Processing
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      
      // Generate some dummy logs and data
      if (p % 10 === 0) {
        setLogs(prev => [...prev.slice(-4), `[Strategy] Processing Tick Block #${p * 1542}...`]);
        
        // Add chart data point
        setResults(prev => {
            const lastEquity = prev.length > 0 ? prev[prev.length-1].equity : 10000;
            const change = (Math.random() - 0.45) * 200; // Slight upward bias
            return [...prev, {
                time: `T+${p}`,
                equity: lastEquity + change,
                drawdown: Math.min(0, (Math.random() * -5))
            }];
        });
      }

      if (p >= 100) {
        clearInterval(interval);
        setIsRunning(false);
        setLogs(prev => [...prev, '[WASM] Execution Complete.', '[Report] Generating performance metrics...']);
        setMetrics({
            totalReturn: '+24.5%',
            maxDrawdown: '-4.2%',
            sharpRatio: '2.84'
        });
      }
    }, 50);
  };

  return (
    <Card className="p-0 overflow-hidden flex flex-col h-[500px] bg-[#0A192F] border-[#233554]">
      {/* Header */}
      <div className="p-4 border-b border-[#233554] flex justify-between items-center bg-[#112240]">
        <div>
           <h4 className="text-white font-bold flex items-center gap-2">
             <Cpu className="w-5 h-5 text-[#ECC94B]" /> 
             WASM 策略回测沙箱
           </h4>
           <p className="text-xs text-[#8892B0]">Browser-side High Performance Computing</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={startBacktest}
             disabled={isRunning}
             className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${isRunning ? 'bg-[#233554] text-[#8892B0]' : 'bg-[#38B2AC] text-white hover:bg-[#319795]'}`}
           >
             {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
             {isRunning ? '计算中...' : '启动回测'}
           </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12">
         {/* Chart Area */}
         <div className="col-span-8 p-4 flex flex-col">
            <div className="flex-1 w-full min-h-0">
               {results.length > 0 ? (
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
                     <YAxis domain={['auto', 'auto']} tick={{fontSize: 10, fill: '#8892B0'}} axisLine={false} tickLine={false} />
                     <Tooltip 
                        contentStyle={{backgroundColor: '#112240', borderColor: '#233554', color: '#fff'}}
                        itemStyle={{color: '#38B2AC'}}
                     />
                     <Area type="monotone" dataKey="equity" stroke="#38B2AC" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={2} />
                   </AreaChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-[#8892B0] opacity-30">
                    <BarChart2 className="w-16 h-16 mb-2" />
                    <p className="text-xs">等待回测数据...</p>
                 </div>
               )}
            </div>
            
            {/* Metrics */}
            <div className="h-16 mt-4 grid grid-cols-3 gap-4 border-t border-[#233554] pt-4">
                <div>
                   <p className="text-[10px] text-[#8892B0]">总回报 (Total Return)</p>
                   <p className="text-lg font-mono font-bold text-[#38B2AC]">{metrics.totalReturn}</p>
                </div>
                <div>
                   <p className="text-[10px] text-[#8892B0]">最大回撤 (Max DD)</p>
                   <p className="text-lg font-mono font-bold text-[#F56565]">{metrics.maxDrawdown}</p>
                </div>
                <div>
                   <p className="text-[10px] text-[#8892B0]">夏普比率 (Sharpe)</p>
                   <p className="text-lg font-mono font-bold text-[#ECC94B]">{metrics.sharpRatio}</p>
                </div>
            </div>
         </div>

         {/* Console Area */}
         <div className="col-span-4 bg-[#071425] border-l border-[#233554] p-0 flex flex-col font-mono text-xs">
            <div className="p-2 border-b border-[#233554] text-[#8892B0] flex items-center gap-2">
               <Terminal className="w-3 h-3" /> Console Output
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
               {logs.map((log, i) => (
                 <div key={i} className="text-[#8892B0] break-all">
                    <span className="text-[#233554] select-none mr-2">{i+1}</span>
                    {log.startsWith('[WASM]') ? <span className="text-[#4299E1]">{log}</span> : log}
                 </div>
               ))}
               {isRunning && (
                 <div className="animate-pulse text-[#38B2AC]">_</div>
               )}
            </div>
            {isRunning && (
               <div className="h-1 bg-[#233554]">
                  <div className="h-full bg-[#38B2AC] transition-all duration-100" style={{ width: `${progress}%` }} />
               </div>
            )}
         </div>
      </div>
    </Card>
  );
};
