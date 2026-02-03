import React, { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/Card';
import { 
  Cpu, Zap, BarChart3, 
  Activity, ShieldAlert, 
  Binary, Layers, Timer,
  FlaskConical, RefreshCw,
  TrendingDown, AlertCircle,
  BrainCircuit, Gauge
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const generateVaRData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    time: i,
    classic: 15 + Math.random() * 5,
    quantum: 15 + Math.random() * 2,
    riskLevel: Math.random() * 10,
  }));
};

function StatItem({ label, value, sub, icon: Icon, color = "text-[#8892B0]" }: any) {
  return (
    <Card className="p-4 bg-[#112240] border-[#233554] flex flex-col items-center text-center group hover:border-[#A78BFA]/50 transition-all">
      <Icon className={`w-5 h-5 mb-2 ${color} group-hover:scale-110 transition-transform`} />
      <p className="text-[10px] text-[#8892B0] uppercase mb-1 font-bold tracking-tighter">{label}</p>
      <p className="text-lg font-bold text-white font-mono">{value}</p>
      <p className="text-[10px] text-[#8892B0] mt-1 opacity-60">{sub}</p>
    </Card>
  );
}

export const ResourceMonitor = () => {
  const [data, setData] = useState(generateVaRData());
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [currentVaR, setCurrentVaR] = useState(12.5);
  const [classicVaR, setClassicVaR] = useState(14.8);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1];
        const nextClassic = 15 + Math.random() * 8;
        const nextQuantum = isAccelerating ? (12 + Math.random() * 1.5) : (15 + Math.random() * 3);
        
        setClassicVaR(Number(nextClassic.toFixed(2)));
        setCurrentVaR(Number(nextQuantum.toFixed(2)));

        const next = [...prev.slice(1), {
          time: last.time + 1,
          classic: nextClassic,
          quantum: nextQuantum,
          riskLevel: nextQuantum * 0.8 + Math.random() * 2
        }];
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isAccelerating]);

  const toggleAcceleration = () => {
    setIsAccelerating(!isAccelerating);
    if (!isAccelerating) {
      toast.success('量子增强核心已成功切入 VaR 计算管线', {
        description: '算力提升 400x，置信度区间已优化至 99.99%',
        icon: <Zap className="w-4 h-4 text-[#A78BFA]" />
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h3 className="text-lg font-bold text-white flex items-center gap-2">
             <BrainCircuit className="w-5 h-5 text-[#A78BFA]" />
             量子实验室：资源监控与 VaR 算力
           </h3>
           <p className="text-xs text-[#8892B0]">基于言语云量子纠缠算力的实时风险价值 (Value at Risk) 演练</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#071425] border border-[#233554] rounded text-[10px] text-[#8892B0]">
            <Gauge className="w-3.5 h-3.5" />
            系统置信度: <span className="text-[#38B2AC] font-bold">99.99%</span>
          </div>
          <button 
            onClick={toggleAcceleration}
            className={`px-4 py-2 rounded text-sm font-bold transition-all flex items-center gap-2 shadow-lg ${
              isAccelerating 
              ? 'bg-[#A78BFA] text-white shadow-[#A78BFA]/20' 
              : 'bg-[#112240] border border-[#233554] text-[#8892B0] hover:text-white'
            }`}
          >
            <Zap className={`w-4 h-4 ${isAccelerating ? 'fill-current animate-pulse' : ''}`} />
            {isAccelerating ? '量子增强运行中' : '开启量子算力增强'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatItem label="VaR (99% CI)" value={`${currentVaR}%`} sub={`Classic: ${classicVaR}%`} icon={TrendingDown} color="text-[#F56565]" />
        <StatItem label="计算时延 (Latency)" value={isAccelerating ? "1.2ms" : "450ms"} sub={isAccelerating ? "QPU Parallel" : "CPU Monte Carlo"} icon={Timer} color="text-[#38B2AC]" />
        <StatItem label="量子比特冗余度" value="98.5%" sub="Q-Gates Active" icon={Layers} color="text-[#A78BFA]" />
        <StatItem label="SOS 热备状态" value="READY" sub="PWA Circuit Breaker" icon={ShieldAlert} color="text-[#ECC94B]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 p-6 bg-[#0A192F]/50 border-[#233554] relative">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#A78BFA]" />
              VaR 风险收敛曲线 (量子增强对比)
            </h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#8892B0]" />
                <span className="text-[10px] text-[#8892B0]">传统 CPU 算力</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#A78BFA]" />
                <span className="text-[10px] text-[#A78BFA]">量子增强算力</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorQuantum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClassic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8892B0" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8892B0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#233554" vertical={false} strokeOpacity={0.5} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#8892B0" fontSize={10} tickLine={false} axisLine={false} domain={[5, 25]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#112240', border: '1px solid #233554', borderRadius: '4px', fontSize: '11px' }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Area 
                  type="stepAfter" 
                  dataKey="classic" 
                  stroke="#8892B0" 
                  strokeWidth={1} 
                  strokeDasharray="5 5"
                  fill="url(#colorClassic)" 
                  name="传统 Monte Carlo"
                />
                <Area 
                  type="monotone" 
                  dataKey="quantum" 
                  stroke="#A78BFA" 
                  strokeWidth={2} 
                  fill="url(#colorQuantum)" 
                  name="言语云量子加速"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="flex-1 p-6 border-[#233554] bg-[#0A192F]/80">
            <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#38B2AC]" />
              算力管线监控 (CTP 对接)
            </h4>
            <div className="space-y-5">
               {[
                 { label: '数据摄取 (Ingestion)', status: 'Active', value: '1.2 GB/s', icon: RefreshCw },
                 { label: 'HMAC 指令加签', status: 'OK', value: '0.05ms', icon: ShieldAlert },
                 { label: '流水线熔断自检', status: 'Healthy', value: 'Pass', icon: Activity },
                 { label: 'T+0 合规引擎', status: 'Watch', value: 'No Violations', icon: AlertCircle },
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#112240] flex items-center justify-center">
                      <item.icon className={`w-4 h-4 ${item.status === 'OK' || item.status === 'Healthy' || item.status === 'Active' ? 'text-[#38B2AC]' : 'text-[#ECC94B]'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white font-medium">{item.label}</span>
                        <span className="text-[10px] text-[#8892B0] font-mono">{item.value}</span>
                      </div>
                      <div className="h-1 bg-[#112240] rounded-full mt-1 overflow-hidden">
                        <div className={`h-full ${item.status === 'OK' || item.status === 'Healthy' || item.status === 'Active' ? 'bg-[#38B2AC]' : 'bg-[#ECC94B]'} w-[100%]`} />
                      </div>
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="mt-8 p-3 bg-[#F56565]/5 border border-[#F56565]/20 rounded-lg">
               <div className="flex items-center gap-2 mb-2">
                 <ShieldAlert className="w-4 h-4 text-[#F56565]" />
                 <span className="text-[10px] text-white font-bold uppercase tracking-wider">极端风险感知预警</span>
               </div>
               <p className="text-[10px] text-[#8892B0] leading-relaxed">
                 量子算力当前检测到指数级波动风险。PWA 离线熔断协议已进入热备状态，一旦 VaR 偏离度超过 15% 将自动触发 SOS。
               </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
