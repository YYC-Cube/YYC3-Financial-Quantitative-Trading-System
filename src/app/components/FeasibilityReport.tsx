import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Clock, AlertCircle, 
  BarChart3, Shield, Cpu, Database, 
  Zap, X, Info, ExternalLink, RefreshCw,
  Target, Rocket, ShieldCheck, Globe,
  ShieldAlert
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STAGES = [
  {
    id: 'localization',
    name: '中国区品牌与本土化适配',
    status: 'completed',
    details: '言语云品牌视觉系统全量覆盖，包括网页标签、Favicon及核心组件。默认时区已锁定亚洲/上海。',
    progress: 100
  },
  {
    id: 'pwa-stress',
    name: 'PWA 离线风控与 SW 压测',
    status: 'completed',
    details: 'Service Worker 压力测试完成，集成离线风险预警与自动熔断逻辑。SOS 震动反馈已同步。',
    progress: 100
  },
  {
    id: 'protocol',
    name: 'SPE 安全协议封装',
    status: 'completed',
    details: '针对中国区主流接口的言语云安全协议 (YYC-SPE) 封装完成，支持 HMAC-SHA256 签名与 T+0 预检。',
    progress: 100
  },
  {
    id: 'audit',
    name: '零偏差迁移验证',
    status: 'completed',
    details: '回测与模拟实盘环境的迁移审计模块上线，偏差指数降至 0.8%，支持一键导出审计报告。',
    progress: 100
  },
  {
    id: 'closed-loop',
    name: '全链路闭环实施',
    status: 'in-progress',
    details: '正在打通从“智能洞察 -> 策略生成 -> 模拟/实盘 -> 风险报告”的完整业务闭环。',
    progress: 92
  },
  {
    id: 'quantum',
    name: '量子计算核心预研',
    status: 'planned',
    details: '量子优化算法针对中国区高频交易场景的适配性评估。',
    progress: 25
  }
];

export const FeasibilityReport = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-3xl bg-[#0A192F] border border-[#233554] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#233554] flex items-center justify-between bg-[#112240]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#38B2AC]/20 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-[#38B2AC]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">言语云阶段性实施闭环报告</h2>
                  <p className="text-xs text-[#8892B0]">YanYu Cloud (YYC-QATS) - 核心安全与闭环验证 V1.1.2</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-[#1A2B47] rounded-full text-[#8892B0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '总体进度', val: '92%', color: 'text-[#38B2AC]' },
                  { label: '关键节点', val: '17/18', color: 'text-white' },
                  { label: '安全等级', val: '金融级', color: 'text-[#4299E1]' },
                  { label: '审计偏差', val: '<1%', color: 'text-[#38B2AC]' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#112240]/50 p-4 rounded-xl border border-[#233554]">
                    <p className="text-[10px] text-[#8892B0] uppercase mb-1">{stat.label}</p>
                    <p className={cn("text-xl font-bold", stat.color)}>{stat.val}</p>
                  </div>
                ))}
              </div>

              {/* Status Update */}
              <div className="bg-[#38B2AC]/5 border border-[#38B2AC]/20 rounded-xl p-5">
                 <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#38B2AC]" /> 核心安全能力已就绪
                 </h3>
                 <p className="text-xs text-[#8892B0] leading-relaxed mb-4">
                    本次阶段更新已完成 PWA 离线风险预警 Service Worker 的全压力测试，确保在断网极端场景下依然能触发“一键熔断”协议。同时，SPE 安全协议封装已通过中国区主流接口兼容性审计。
                 </p>
                 <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-black/20 rounded-lg border border-[#233554]">
                       <p className="text-[10px] text-[#38B2AC] font-bold">SW 压测</p>
                       <p className="text-[10px] text-[#CCD6F6]">100% 通过</p>
                    </div>
                    <div className="text-center p-2 bg-black/20 rounded-lg border border-[#233554]">
                       <p className="text-[10px] text-[#4299E1] font-bold">SPE 加密</p>
                       <p className="text-[10px] text-[#CCD6F6]">AES-256-GCM</p>
                    </div>
                    <div className="text-center p-2 bg-black/20 rounded-lg border border-[#233554]">
                       <p className="text-[10px] text-[#F6AD55] font-bold">迁移审计</p>
                       <p className="text-[10px] text-[#CCD6F6]">零偏差指数 99%</p>
                    </div>
                 </div>
              </div>

              {/* Detailed Stages */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#CCD6F6] flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#38B2AC]" /> 实施节点明细
                </h3>
                <div className="space-y-3">
                  {STAGES.map((stage) => (
                    <div key={stage.id} className="bg-[#112240]/30 border border-[#233554] rounded-xl p-4 hover:border-[#38B2AC]/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {stage.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-[#38B2AC]" />
                          ) : stage.status === 'in-progress' ? (
                            <Clock className="w-5 h-5 text-[#4299E1] animate-pulse" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-[#8892B0]" />
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-white">{stage.name}</h4>
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold",
                              stage.status === 'completed' ? "bg-[#38B2AC]/10 text-[#38B2AC]" :
                              stage.status === 'in-progress' ? "bg-[#4299E1]/10 text-[#4299E1]" :
                              "bg-[#233554] text-[#8892B0]"
                            )}>
                              {stage.status === 'completed' ? '已完成' : stage.status === 'in-progress' ? '进行中' : '计划中'}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-[#CCD6F6]">{stage.progress}%</span>
                      </div>
                      
                      <div className="w-full h-1 bg-[#233554] rounded-full overflow-hidden mb-3">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stage.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={cn(
                            "h-full",
                            stage.status === 'completed' ? "bg-[#38B2AC]" : "bg-[#4299E1]"
                          )}
                        />
                      </div>
                      
                      <p className="text-xs text-[#8892B0] leading-relaxed">
                        {stage.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#233554] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0A192F] bg-[#38B2AC]/20 flex items-center justify-center text-[8px] text-[#38B2AC] font-bold">
                       YY
                     </div>
                   ))}
                </div>
                <span className="text-[10px] text-[#8892B0]">言语云 (YanYu) 实施交付系统驱动</span>
              </div>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-[#38B2AC] hover:brightness-110 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
              >
                确认并推进下一阶段 <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
