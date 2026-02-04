import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/app/components/ui/Card';
import { KLineChart } from '@/app/components/KLineChart';
import { 
  Play, RotateCcw, Download, TrendingUp, TrendingDown, 
  Activity, DollarSign, List, BarChart2, ShieldCheck, 
  Zap, AlertTriangle, CheckCircle2, Globe, Cpu
} from '@/app/components/SafeIcons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Badge } from "@/app/components/ui/badge";
import { toast } from 'sonner';

// --- Mock Data Generators ---
const generateBacktestData = (days = 100) => {
  let basePrice = 10000;
  const data = [];
  const equity = [];
  let currentEquity = 100000;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const dateStr = date.toISOString().split('T')[0];
    const change = (Math.random() - 0.48) * 200; 
    basePrice += change;
    const open = basePrice;
    const close = basePrice + (Math.random() - 0.5) * 50;
    const high = Math.max(open, close) + Math.random() * 30;
    const low = Math.min(open, close) - Math.random() * 30;
    data.push({ time: dateStr, open, high, low, close });
    currentEquity += change * 5 + (Math.random() - 0.5) * 500; 
    equity.push({ date: dateStr, value: currentEquity });
  }
  return { market: data, equity };
};

const generateAuditData = () => [
  { metric: '价格滑点一致性', backtest: '0.01%', real: '0.012%', status: 'optimal', diff: '<0.002%' },
  { metric: '撮合延时偏差', backtest: '2ms', real: '2.4ms', status: 'optimal', diff: '0.4ms' },
  { metric: '手续费计算误差', backtest: '0.04%', real: '0.04%', status: 'perfect', diff: '0.00%' },
  { metric: '信号触发时机', backtest: 'T+0', real: 'T+0', status: 'perfect', diff: '0ms' },
  { metric: '深度流转模拟', backtest: '98.5%', real: '97.2%', status: 'warning', diff: '-1.3%' },
];

const MOCK_DATA = generateBacktestData(150);
const AUDIT_DATA = generateAuditData();

export const Backtest = () => {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("equity");
  const [isStressTesting, setIsStressTesting] = useState(false);

  const startBacktest = () => {
    if (running) return;
    setRunning(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setRunning(false);
          toast.success('策略回测完成：言语云零偏差审计通过');
          return 100;
        }
        return p + 2;
      });
    }, 50);
  };

  const triggerSWStressTest = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      setIsStressTesting(true);
      navigator.serviceWorker.controller.postMessage({ type: 'START_RISK_STRESS_TEST' });
      toast.info('PWA离线风控 Service Worker 压力测试已启动...');
      setTimeout(() => setIsStressTesting(false), 5000);
    } else {
      toast.error('Service Worker 未就绪');
    }
  }, []);

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
        {/* Header Section */}
        <div className="flex justify-between items-center shrink-0">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  策略回测与零偏差审计
                  <Badge className="bg-[#38B2AC]/10 text-[#38B2AC] border-[#38B2AC]/20">Pro</Badge>
                </h2>
                <p className="text-sm text-[#8892B0]">言语云 (YanYu Cloud) 全链路历史性能仿真与实盘迁移验证</p>
            </div>
            <div className="flex gap-2">
                 <button 
                  onClick={triggerSWStressTest}
                  disabled={isStressTesting}
                  className={`px-3 py-1.5 rounded text-xs border flex items-center gap-2 transition-all ${
                    isStressTesting 
                    ? 'bg-[#F56565]/10 border-[#F56565]/30 text-[#F56565]' 
                    : 'bg-[#112240] border-[#233554] text-[#8892B0] hover:text-white'
                  }`}
                 >
                    <Zap className={`w-3.5 h-3.5 ${isStressTesting ? 'animate-pulse' : ''}`} /> 
                    {isStressTesting ? 'SW 压测中...' : 'SW 离线压测'}
                 </button>
                 <button className="px-3 py-1.5 bg-[#4299E1] text-white text-xs rounded hover:brightness-110 flex items-center gap-2 font-bold shadow-lg shadow-[#4299E1]/20">
                    <Download className="w-3.5 h-3.5" /> 导出审计报告
                 </button>
            </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
            {/* LEFT: Configuration Panel */}
            <Card className="col-span-3 p-0 flex flex-col bg-[#112240] border-[#233554] overflow-hidden">
                <div className="p-4 border-b border-[#233554] bg-[#1A2B47]/30">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-[#38B2AC]" />
                        参数配置
                    </h3>
                </div>
                
                <div className="p-4 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-[#CCD6F6]">回测时间跨度</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input type="date" defaultValue="2025-01-01" className="w-full bg-[#0A192F] border border-[#233554] text-[10px] text-white p-2 rounded focus:border-[#4299E1] outline-none" />
                            <input type="date" defaultValue="2026-02-02" className="w-full bg-[#0A192F] border border-[#233554] text-[10px] text-white p-2 rounded focus:border-[#4299E1] outline-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-[#CCD6F6]">初始保证金 (USDT)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8892B0] text-xs">¥</span>
                            <input type="number" defaultValue={100000} className="w-full bg-[#0A192F] pl-6 border border-[#233554] text-xs text-white p-2 rounded focus:border-[#4299E1] outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                             <label className="text-xs font-medium text-[#CCD6F6]">手续费率 (%)</label>
                             <input type="number" step="0.01" defaultValue={0.04} className="w-full bg-[#0A192F] border border-[#233554] text-xs text-white p-2 rounded focus:border-[#4299E1] outline-none" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs font-medium text-[#CCD6F6]">最大滑点</label>
                             <input type="number" defaultValue={1} className="w-full bg-[#0A192F] border border-[#233554] text-xs text-white p-2 rounded focus:border-[#4299E1] outline-none" />
                        </div>
                    </div>

                    <div className="border-t border-[#233554] pt-4">
                         <h4 className="text-xs font-bold text-[#CCD6F6] mb-3 flex items-center gap-2">
                           <Globe className="w-3 h-3 text-[#38B2AC]" /> 中国区接口预设 (CTP/SEC)
                         </h4>
                         <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 bg-[#0A192F] rounded border border-[#233554]/50">
                               <span className="text-[10px] text-[#8892B0]">全链路加密协议</span>
                               <CheckCircle2 className="w-3 h-3 text-[#38B2AC]" />
                            </div>
                            <div className="flex items-center justify-between p-2 bg-[#0A192F] rounded border border-[#233554]/50">
                               <span className="text-[10px] text-[#8892B0]">模拟实盘撮合引擎</span>
                               <CheckCircle2 className="w-3 h-3 text-[#38B2AC]" />
                            </div>
                         </div>
                    </div>
                </div>

                <div className="p-4 border-t border-[#233554] bg-[#0A192F]/50">
                    {running ? (
                         <div className="space-y-2">
                            <div className="flex justify-between text-xs text-[#38B2AC]">
                                <span className="animate-pulse">正在回测...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 bg-[#233554] rounded-full overflow-hidden">
                                <div className="h-full bg-[#38B2AC] transition-all duration-100 shadow-[0_0_8px_rgba(56,178,172,0.5)]" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={startBacktest}
                            className="w-full py-2.5 bg-[#38B2AC] text-white hover:brightness-110 transition-all rounded text-sm font-bold flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg shadow-[#38B2AC]/20"
                        >
                            <Play className="w-4 h-4 fill-current" /> 开始历史回测
                        </button>
                    )}
                </div>
            </Card>

            {/* RIGHT: Visualization Panel */}
            <div className="col-span-9 flex flex-col gap-4 min-h-0">
                {/* 1. KPI Cards */}
                <div className="grid grid-cols-4 gap-4 shrink-0">
                    <KPICard title="累计收益" value="+124.5%" subValue="言语云最优期望" trend="up" icon={TrendingUp} color="text-[#38B2AC]" />
                    <KPICard title="最大回撤" value="-15.2%" subValue="符合风险容忍" trend="down" icon={TrendingDown} color="text-[#F56565]" />
                    <KPICard title="夏普比率" value="2.14" subValue="行业前 5%" trend="neutral" icon={Activity} color="text-[#4299E1]" />
                    <KPICard title="零偏差指数" value="99.2%" subValue="高度接近实盘" trend="up" icon={ShieldCheck} color="text-[#F6AD55]" />
                </div>

                {/* 2. Main Chart Area */}
                <Card className="flex-1 flex flex-col min-h-0 bg-[#112240] border-[#233554]">
                    <div className="px-4 py-3 border-b border-[#233554] flex justify-between items-center shrink-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                            <TabsList className="bg-[#0A192F]">
                                <TabsTrigger value="equity" className="text-xs">收益曲线</TabsTrigger>
                                <TabsTrigger value="market" className="text-xs">行情回放</TabsTrigger>
                                <TabsTrigger value="audit" className="text-xs">
                                  <ShieldCheck className="w-3 h-3 mr-1 text-[#38B2AC]" /> 零偏差审计
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="text-[10px] text-[#8892B0]">
                            节点验证状态: <span className="text-[#38B2AC] font-bold">已同步 (Verified)</span>
                        </div>
                    </div>

                    <div className="flex-1 relative min-h-0 overflow-hidden">
                        {activeTab === 'equity' && (
                             <div className="absolute inset-0 p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={MOCK_DATA.equity}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#38B2AC" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#38B2AC" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#233554" vertical={false} />
                                        <XAxis dataKey="date" tick={{fontSize: 10, fill: '#8892B0'}} stroke="#233554" minTickGap={30} />
                                        <YAxis tick={{fontSize: 10, fill: '#8892B0'}} stroke="#233554" domain={['auto', 'auto']} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#112240', borderColor: '#233554', color: '#CCD6F6', fontSize: '12px' }} 
                                            itemStyle={{ color: '#38B2AC' }}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#38B2AC" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                             </div>
                        )}
                        {activeTab === 'market' && (
                            <div className="absolute inset-0">
                                <KLineChart data={MOCK_DATA.market} colors={{ backgroundColor: '#112240', textColor: '#8892B0' }} />
                            </div>
                        )}
                        {activeTab === 'audit' && (
                          <div className="absolute inset-0 p-6 flex flex-col gap-6">
                             <div className="bg-[#38B2AC]/5 border border-[#38B2AC]/20 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-full bg-[#38B2AC]/20 flex items-center justify-center">
                                      <ShieldCheck className="w-6 h-6 text-[#38B2AC]" />
                                   </div>
                                   <div>
                                      <h4 className="text-white font-bold">零偏差迁移验证通过</h4>
                                      <p className="text-xs text-[#8892B0]">言语云 (YanYu Cloud) 实盘迁移偏差指数: 0.8% (阈值 2.0%)</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-xs text-[#8892B0]">验证时间</p>
                                   <p className="text-sm text-[#CCD6F6] font-mono">2026-02-02 14:30:15</p>
                                </div>
                             </div>

                             <div className="flex-1 border border-[#233554] rounded-xl overflow-hidden bg-[#0A192F]/30">
                               <Table>
                                 <TableHeader>
                                   <TableRow className="border-b-[#233554] hover:bg-transparent">
                                      <TableHead className="text-[#8892B0]">验证指标 (Audit Metric)</TableHead>
                                      <TableHead className="text-[#8892B0]">回测环境 (Sandbox)</TableHead>
                                      <TableHead className="text-[#8892B0]">模拟实盘 (Staging)</TableHead>
                                      <TableHead className="text-[#8892B0]">偏差值 (Delta)</TableHead>
                                      <TableHead className="text-[#8892B0] text-center">状态</TableHead>
                                   </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                   {AUDIT_DATA.map((row, idx) => (
                                     <TableRow key={idx} className="border-b-[#233554]/50 hover:bg-[#112240]">
                                       <TableCell className="text-white text-xs font-medium">{row.metric}</TableCell>
                                       <TableCell className="text-[#8892B0] text-xs font-mono">{row.backtest}</TableCell>
                                       <TableCell className="text-[#CCD6F6] text-xs font-mono">{row.real}</TableCell>
                                       <TableCell className="text-[#38B2AC] text-xs font-mono">{row.diff}</TableCell>
                                       <TableCell className="text-center">
                                          <Badge className={row.status === 'warning' ? 'bg-[#F6AD55]/10 text-[#F6AD55]' : 'bg-[#38B2AC]/10 text-[#38B2AC]'}>
                                            {row.status === 'optimal' || row.status === 'perfect' ? '符合' : '注意'}
                                          </Badge>
                                       </TableCell>
                                     </TableRow>
                                   ))}
                                 </TableBody>
                               </Table>
                             </div>
                          </div>
                        )}
                    </div>
                </Card>

                {/* 3. Simple Log / Summary Footer */}
                <div className="h-10 shrink-0 flex items-center justify-between px-2">
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-[#38B2AC] animate-pulse" />
                         <span className="text-[10px] text-[#8892B0]">行情源: 言语云实时节点 (Delay 0.2ms)</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <ShieldCheck className="w-3 h-3 text-[#38B2AC]" />
                         <span className="text-[10px] text-[#8892B0]">SPE 协议保护已开启</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 text-[10px] text-[#8892B0]">
                      <AlertTriangle className="w-3 h-3 text-[#F6AD55]" />
                      提示: 回测结果不代表未来收益，请谨慎评估风控指标。
                   </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const KPICard = ({ title, value, subValue, trend, icon: Icon, color }: any) => (
  <Card className="p-4 bg-[#112240] border-[#233554] flex items-start justify-between hover:border-[#38B2AC]/50 transition-all duration-300 group cursor-default">
    <div>
        <p className="text-[#8892B0] text-[10px] font-medium mb-1 group-hover:text-[#CCD6F6] transition-colors uppercase tracking-wider">{title}</p>
        <h4 className={`text-xl font-bold ${color}`}>{value}</h4>
        <p className="text-[#8892B0] text-[9px] mt-1 opacity-80">{subValue}</p>
    </div>
    <div className={`p-2 rounded bg-[#0A192F] border border-[#233554] ${trend === 'up' ? 'text-[#38B2AC]' : trend === 'down' ? 'text-[#F56565]' : 'text-[#4299E1]'}`}>
        <Icon className="w-4 h-4" />
    </div>
  </Card>
);
