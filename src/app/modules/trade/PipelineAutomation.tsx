import React, { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/Card';
import { 
  Zap, ArrowRight, CheckCircle2, 
  Activity, Play, Loader2, 
  ShieldCheck, Globe, Database,
  Cpu, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const PIPELINE_STEPS = [
  { id: 'insight', label: '智能洞察 (Smart Insight)', icon: Globe, color: 'text-[#4299E1]', desc: '多源异构数据采集与因子挖掘' },
  { id: 'gen', label: '策略生成 (Gen-Strategy)', icon: Cpu, color: 'text-[#A78BFA]', desc: '基于 LLM 的自动代码合成与参数调优' },
  { id: 'backtest', label: '云端回测 (Cloud Backtest)', icon: Database, color: 'text-[#38B2AC]', desc: '分布式高性能历史行情仿真' },
  { id: 'audit', label: '零偏差审计 (Audit)', icon: ShieldCheck, color: 'text-[#F6AD55]', desc: '实盘迁移兼容性与 SPE 协议预检' },
];

export const PipelineAutomation = () => {
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const runPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    addLog('启动言语云全流水线集成测试...');

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setActiveStep(i);
      addLog(`正在执行: ${PIPELINE_STEPS[i].label}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog(`${PIPELINE_STEPS[i].label} 已通过验证`);
    }

    setActiveStep(PIPELINE_STEPS.length);
    setIsRunning(false);
    toast.success('全流水线集成测试完成: 闭环验证通过');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h3 className="text-sm font-bold text-white flex items-center gap-2">
             <Zap className="w-4 h-4 text-[#38B2AC]" />
             全流水线集成监控 (CI/CD Pipeline)
           </h3>
           <p className="text-[10px] text-[#8892B0]">从数据采集到策略实盘的 100% 自动化流转验证</p>
        </div>
        <button 
          onClick={runPipeline}
          disabled={isRunning}
          className="px-3 py-1.5 bg-[#38B2AC] hover:brightness-110 text-white rounded text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#38B2AC]/20"
        >
          {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
          启动集成测试
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PIPELINE_STEPS.map((step, idx) => (
          <div key={step.id} className="relative">
             <Card className={`p-4 border-2 transition-all duration-500 bg-[#112240] ${
               activeStep === idx ? 'border-[#38B2AC] shadow-[0_0_15px_rgba(56,178,172,0.3)]' : 
               activeStep > idx ? 'border-[#38B2AC]/40 opacity-70' : 'border-[#233554]'
             }`}>
                <div className={`p-2 rounded-lg bg-[#0A192F] w-fit mb-3 ${step.color}`}>
                   <step.icon className="w-4 h-4" />
                </div>
                <h4 className="text-white text-[10px] font-bold mb-1">{step.label}</h4>
                <p className="text-[9px] text-[#8892B0] leading-relaxed line-clamp-2">{step.desc}</p>
                
                {activeStep === idx && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2 }}
                    className="absolute bottom-0 left-0 h-1 bg-[#38B2AC] rounded-b-lg"
                  />
                )}
                {activeStep > idx && (
                   <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-3 h-3 text-[#38B2AC]" />
                   </div>
                )}
             </Card>
             {idx < PIPELINE_STEPS.length - 1 && (
               <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className={`w-3 h-3 ${activeStep > idx ? 'text-[#38B2AC]' : 'text-[#233554]'}`} />
               </div>
             )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
         <Card className="col-span-12 md:col-span-8 bg-black/40 border-[#233554] p-4 font-mono">
            <div className="flex items-center gap-2 mb-3 border-b border-[#233554] pb-2">
               <Terminal className="w-3 h-3 text-[#8892B0]" />
               <span className="text-[9px] text-[#8892B0] uppercase tracking-widest">Automation Logs</span>
            </div>
            <div className="space-y-1 h-[80px] overflow-y-auto custom-scrollbar">
               {logs.length === 0 && <p className="text-[#233554] text-[10px]">Waiting for trigger...</p>}
               {logs.map((log, i) => (
                 <motion.p 
                   initial={{ opacity: 0, x: -5 }}
                   animate={{ opacity: 1, x: 0 }}
                   key={i} 
                   className="text-[10px] text-[#38B2AC]/80"
                 >
                   {log}
                 </motion.p>
               ))}
            </div>
         </Card>

         <Card className="col-span-12 md:col-span-4 bg-[#112240] border-[#233554] p-4">
            <h4 className="text-white text-[10px] font-bold mb-4 flex items-center gap-2">
               <Activity className="w-3 h-3 text-[#4299E1]" />
               系统健康度
            </h4>
            <div className="flex items-center justify-center py-2">
               <div className="relative w-16 h-16">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-[#233554]" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-[#38B2AC]" strokeDasharray={`${isRunning ? 85 : 99}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-white">{isRunning ? '85' : '99'}</span>
                  </div>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
};
