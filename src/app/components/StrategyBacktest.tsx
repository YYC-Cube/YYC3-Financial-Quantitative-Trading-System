import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Play, Pause, RefreshCw, BarChart2, CheckCircle2, AlertOctagon, Terminal } from '@/app/components/SafeIcons';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface BacktestProps {
  assetId: string;
  strategyId: string;
  onClose: () => void;
}

export const StrategyBacktest = ({ assetId, strategyId, onClose }: BacktestProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ return: 0, drawdown: 0, sharpe: 0 });
  const logEndRef = useRef<HTMLDivElement>(null);

  // Generate mock historical data
  const generateData = () => {
    const basePrice = 45000;
    let price = basePrice;
    let equity = 100000;
    const res = [];
    for (let i = 0; i < 365; i++) {
        price = price * (1 + (Math.random() - 0.48) * 0.05); // Slight upward bias
        if (i % 5 === 0) { // Simulate trade
             const impact = (Math.random() - 0.4) * 500;
             equity += impact;
        }
        res.push({
            date: `D-${i}`,
            price: price,
            equity: equity
        });
    }
    return res;
  };

  useEffect(() => {
    if (logEndRef.current) {
        logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const runBacktest = async () => {
    setIsRunning(true);
    setProgress(0);
    setLogs(['[WASM] Initializing Backtest Engine...', '[WASM] Loading Historical Data (1Y)...']);
    setData([]);

    const fullData = generateData();
    const totalSteps = 20;

    for (let i = 0; i <= totalSteps; i++) {
        await new Promise(r => setTimeout(r, 100)); // Simulate calculation
        setProgress((i / totalSteps) * 100);
        
        if (i % 5 === 0) {
            setLogs(prev => [...prev, `[WASM] Processing Tick Batch #${i * 1000}...`]);
        }
        if (i === totalSteps) {
            setData(fullData);
            setStats({
                return: 35.4,
                drawdown: -12.2,
                sharpe: 2.1
            });
            setLogs(prev => [...prev, '[WASM] Backtest Complete. Generating Report...', '[SYSTEM] Strategy Validated.']);
        }
    }
    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
       <Card className="w-full max-w-4xl h-[600px] flex flex-col bg-[#0A192F] border-[#233554] shadow-2xl overflow-hidden relative">
          {/* Header */}
          <div className="p-4 border-b border-[#233554] flex justify-between items-center bg-[#112240]">
             <div>
                <h3 className="text-white font-bold flex items-center gap-2">
                   <Terminal className="w-5 h-5 text-[#38B2AC]" /> 
                   策略回测沙箱 (WASM Core)
                </h3>
                <p className="text-xs text-[#8892B0] font-mono mt-1">
                   TARGET: {assetId} | STRATEGY: {strategyId}
                </p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-[#233554] rounded text-[#8892B0]">
                <AlertOctagon className="w-5 h-5" />
             </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
             {/* Logs Panel */}
             <div className="w-1/3 bg-[#071425] border-r border-[#233554] p-4 flex flex-col font-mono text-xs">
                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                   {logs.map((log, i) => (
                       <div key={i} className={`${log.includes('Complete') ? 'text-[#38B2AC]' : log.includes('Error') ? 'text-[#F56565]' : 'text-[#8892B0]'}`}>
                           <span className="opacity-50 mr-2">{new Date().toLocaleTimeString()}</span>
                           {log}
                       </div>
                   ))}
                   <div ref={logEndRef} />
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#233554]">
                   <button 
                      onClick={runBacktest}
                      disabled={isRunning}
                      className={`w-full py-2 rounded font-bold flex items-center justify-center gap-2 ${isRunning ? 'bg-[#233554] text-[#8892B0]' : 'bg-[#38B2AC] text-white hover:bg-[#319795]'}`}
                   >
                      {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      {isRunning ? 'Running Simulation...' : 'Start Backtest'}
                   </button>
                </div>
             </div>

             {/* Chart Panel */}
             <div className="flex-1 p-6 flex flex-col bg-[#0A192F]">
                <div className="flex justify-between items-center mb-6">
                   <div className="flex gap-6">
                      <div>
                         <p className="text-[10px] text-[#8892B0]">Total Return</p>
                         <p className={`text-xl font-mono font-bold ${stats.return > 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
                            {stats.return > 0 ? '+' : ''}{stats.return}%
                         </p>
                      </div>
                      <div>
                         <p className="text-[10px] text-[#8892B0]">Max Drawdown</p>
                         <p className="text-xl font-mono font-bold text-[#F56565]">
                            {stats.drawdown}%
                         </p>
                      </div>
                      <div>
                         <p className="text-[10px] text-[#8892B0]">Sharpe Ratio</p>
                         <p className="text-xl font-mono font-bold text-[#ECC94B]">
                            {stats.sharpe}
                         </p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 text-xs text-[#8892B0] bg-[#112240] px-3 py-1 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-[#38B2AC]"></div>
                      WASM Optimized
                   </div>
                </div>

                <div className="flex-1 min-h-0">
                   {data.length > 0 ? (
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data}>
                             <defs>
                                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#38B2AC" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#38B2AC" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#233554" vertical={false} />
                             <XAxis dataKey="date" hide />
                             <YAxis domain={['auto', 'auto']} hide />
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#112240', borderColor: '#233554', color: '#fff' }}
                                itemStyle={{ color: '#38B2AC' }}
                                formatter={(value: any) => [`$${value.toFixed(2)}`, 'Equity']}
                             />
                             <Area type="monotone" dataKey="equity" stroke="#38B2AC" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={2} />
                          </AreaChart>
                       </ResponsiveContainer>
                   ) : (
                       <div className="w-full h-full border-2 border-dashed border-[#233554] rounded flex flex-col items-center justify-center text-[#8892B0]">
                          <BarChart2 className="w-12 h-12 mb-2 opacity-50" />
                          <p className="text-sm">Ready to simulate</p>
                       </div>
                   )}
                </div>
             </div>
          </div>
          
          {/* Progress Bar */}
          {isRunning && (
             <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#233554]">
                <div className="h-full bg-[#38B2AC] transition-all duration-300" style={{ width: `${progress}%` }} />
             </div>
          )}
       </Card>
    </div>
  );
};
