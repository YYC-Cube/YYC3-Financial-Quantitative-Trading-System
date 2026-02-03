import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/app/components/ui/Card';
import { 
  Wallet, TrendingUp, TrendingDown, DollarSign, 
  Activity, RefreshCw, Play, Pause, Settings, 
  Power, ShieldAlert, XCircle, Info, ChevronRight,
  Zap, AlertTriangle, ArrowRight, ShieldCheck, MonitorSmartphone,
  Cpu, Lock, Globe, BarChart3, Rocket, Terminal, Flame,
  Wifi, WifiOff, Clock, Database, Shield
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useIsMobile } from '@/app/components/ui/use-mobile';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useQuantSync } from '@/app/hooks/useQuantSync';
import { useCTPProtocol } from '@/app/hooks/useCTPProtocol';
import { PipelineAutomation } from './PipelineAutomation';

const ASSET_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  value: 100000 + Math.random() * 5000 - 2500,
}));

const STRATEGIES = [
  { id: 1, name: 'Dual Moving Average', status: 'Running', return: '+12.5%', trades: 145, drawdown: '-2.4%' },
  { id: 2, name: 'Grid Trading V2', status: 'Paused', return: '+5.2%', trades: 42, drawdown: '-0.8%' },
  { id: 3, name: 'Sentiment Alpha', status: 'Stopped', return: '0.0%', trades: 0, drawdown: '0.0%' },
];

const POSITIONS = [
  { id: 1, symbol: 'BTC/USDT', side: 'Long', amount: 0.5, entry: 42500, current: 43200, pnl: '+350.00', pnlPercent: '+1.65%' },
  { id: 2, symbol: 'ETH/USDT', side: 'Short', amount: 10, entry: 2300, current: 2280, pnl: '+200.00', pnlPercent: '+0.87%' },
  { id: 3, symbol: 'SOL/USDT', side: 'Long', amount: 100, entry: 95, current: 92, pnl: '-300.00', pnlPercent: '-3.15%' },
];

export const RealTrading = ({ subView }: { subView: string }) => {
  const [side, setSide] = useState('buy');
  const isMobile = useIsMobile();
  const [slideProgress, setSlideProgress] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [isExtremeMarket, setIsExtremeMarket] = useState(false);
  
  const { sendMessage, lastMessage, currentSeq, activePeersCount, isOnline, pendingCount, pendingList } = useQuantSync();
  const { initiateCTPHandshake, connectionStatus } = useCTPProtocol();
  const [isHandshaking, setIsHandshaking] = useState(false);
  
  const isSyncingRef = useRef(false);

  // Simulation of CTP Acknowledgement
  const simulateCTPAck = useCallback((seq: number) => {
    setTimeout(() => {
      sendMessage({
        type: 'ORDER_ACK',
        payload: { status: 'CONFIRMED', ctp_id: `CTP-${Math.random().toString(36).substr(2, 5).toUpperCase()}` },
        source: 'CTP_GATEWAY',
        sequenceNumber: seq 
      });
    }, 800);
  }, [sendMessage]);

  const performCancellation = useCallback(async (sourceType: 'LOCAL' | 'REMOTE', sourceName?: string, seq?: number) => {
    if ('vibrate' in navigator && sourceType === 'LOCAL') {
      navigator.vibrate([100, 50, 200]);
    }

    const currentSeqSnapshot = sourceType === 'LOCAL' ? currentSeq : seq;

    toast.error(sourceType === 'LOCAL' ? '紧急全撤：所有挂单已清理' : '收到外部 SOS 指令', {
      description: sourceType === 'LOCAL' 
        ? `已通过 HSM 签名发送 (Seq: ${currentSeqSnapshot})` 
        : `来自 ${sourceName} 的指令通过安全校验 (Seq: ${seq})`,
      position: isMobile ? 'top-center' : 'bottom-right',
      className: 'bg-[#F56565] text-white font-bold',
    });

    setSlideProgress(0);
    
    if (sourceType === 'LOCAL') {
      await sendMessage({
        type: 'ORDER_CANCELLED',
        payload: { timestamp: Date.now() },
        source: isMobile ? 'MOBILE_PWA' : 'DESKTOP_PRO'
      });
      if (isOnline) {
        simulateCTPAck(currentSeqSnapshot);
      }
    }
  }, [isMobile, sendMessage, currentSeq, simulateCTPAck, isOnline]);

  useEffect(() => {
    if (lastMessage?.type === 'ORDER_CANCELLED' || lastMessage?.type === 'SYNC_COMPENSATION') {
      isSyncingRef.current = true;
      setSlideProgress(100);
      performCancellation('REMOTE', lastMessage.source, lastMessage.sequenceNumber);
      
      const timer = setTimeout(() => {
        setSlideProgress(0);
        isSyncingRef.current = false;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastMessage, performCancellation]);

  useEffect(() => {
    if (slideProgress >= 100 && !isSyncingRef.current && !isTesting) {
      performCancellation('LOCAL');
    }
  }, [slideProgress, isTesting, performCancellation]);

  const handleCTPConnect = async () => {
    setIsHandshaking(true);
    await initiateCTPHandshake('9999', 'YYC-USER-001');
    setIsHandshaking(false);
  };

  const handleStartIntegrationTest = () => {
    if (connectionStatus !== 'CONNECTED') {
      toast.warning('CTP 柜台未就绪', { description: '请先完成实盘握手校验' });
      return;
    }
    setIsTesting(true);
    setTestProgress(0);
    toast.promise(
      new Promise((resolve) => {
        let p = 0;
        const interval = setInterval(() => {
          p += 5;
          setTestProgress(p);
          if (p >= 100) {
            clearInterval(interval);
            resolve(true);
          }
        }, 100);
      }),
      {
        loading: '正在执行 HSM 增强型穿透测试...',
        success: '集成测试通过：Web Crypto 指令签名验证一致',
        error: '集成测试失败',
        finally: () => setIsTesting(false)
      }
    );
  };

  const MobileEmergencyActions = () => (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] text-[#F56565] font-bold uppercase tracking-widest flex items-center gap-1">
           <ShieldAlert className="w-3 h-3" /> 极端行情工具 (PWA 模式)
        </span>
        <div className="flex items-center gap-1.5">
          <MonitorSmartphone className="w-3 h-3 text-[#38B2AC]" />
          <span className="text-[10px] text-[#8892B0]">HSM: 有效</span>
          {isOnline ? <Wifi className="w-3 h-3 text-[#38B2AC]" /> : <WifiOff className="w-3 h-3 text-[#F56565]" />}
        </div>
      </div>
      
      <div className="relative h-14 bg-[#F56565]/10 border border-[#F56565]/30 rounded-xl overflow-hidden flex items-center group">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#F56565] to-[#E53E3E] flex items-center justify-end px-3 transition-all duration-75"
          style={{ width: `${Math.max(slideProgress, 18)}%` }}
        >
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <input 
          type="range"
          min="0"
          max="100"
          value={slideProgress}
          onChange={(e) => setSlideProgress(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex-1 text-center pointer-events-none">
          <span className="text-sm font-bold text-[#F56565] flex items-center justify-center gap-2">
            {slideProgress === 0 ? (
              <>右滑紧急全撤 (SOS) <ArrowRight className="w-4 h-4 animate-pulse" /></>
            ) : slideProgress >= 90 ? (
              "松手确认!"
            ) : (
              "继续滑动..."
            )}
          </span>
        </div>
      </div>
      {pendingCount > 0 && (
        <div className="bg-[#ECC94B]/10 border border-[#ECC94B]/30 p-2 rounded-lg flex items-center justify-between">
          <span className="text-[10px] text-[#ECC94B] font-bold flex items-center gap-1">
            <Database className="w-3 h-3" /> 离线待同步指令: {pendingCount}
          </span>
          <Clock className="w-3 h-3 text-[#ECC94B] animate-pulse" />
        </div>
      )}
    </div>
  );

  if (subView === '自动交易') {
    return (
      <div className="space-y-6">
        <PipelineAutomation />
        
        <div className={`h-full ${isMobile ? 'flex flex-col' : 'grid grid-cols-12'} gap-6`}>
          <div className={`${isMobile ? 'order-1' : 'col-span-8'} flex flex-col gap-6`}>
            <Card className="p-6 bg-gradient-to-br from-[#112240] to-[#0A192F] border-[#233554] overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Shield className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-bold flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#38B2AC]" />
                      HSM 硬件加密模组仿真 (Web Crypto)
                    </h4>
                    <p className="text-xs text-[#8892B0] mt-1">基于 HMAC-SHA256 的指令加签，模拟 TEE 隔离环境</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-[#38B2AC]/10 border border-[#38B2AC]/30 rounded text-[9px] text-[#38B2AC] font-mono">
                      ALG: SHA-256
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="p-3 bg-[#071425] rounded border border-[#233554]">
                    <p className="text-[10px] text-[#8892B0] mb-1">指令序列</p>
                    <p className="text-xs font-mono text-[#38B2AC]">Seq: {currentSeq}</p>
                  </div>
                  <div className="p-3 bg-[#071425] rounded border border-[#233554]">
                    <p className="text-[10px] text-[#8892B0] mb-1">网络状态</p>
                    <p className={`text-xs font-mono ${isOnline ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{isOnline ? 'Online' : 'Offline'}</p>
                  </div>
                  <div className="p-3 bg-[#071425] rounded border border-[#233554]">
                    <p className="text-[10px] text-[#8892B0] mb-1">离线缓存</p>
                    <p className="text-xs font-mono text-[#ECC94B]">{pendingCount} Pending</p>
                  </div>
                  <div className="p-3 bg-[#071425] rounded border border-[#233554]">
                    <p className="text-[10px] text-[#8892B0] mb-1">安全状态</p>
                    <p className="text-xs font-mono text-[#38B2AC] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Secure
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={handleStartIntegrationTest}
                    disabled={isTesting}
                    className="px-4 py-2 bg-[#4299E1] text-white rounded font-bold text-sm flex items-center gap-2 hover:bg-[#3182CE]"
                  >
                    {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    启动 HSM 穿透测试
                  </button>
                  <div className="flex-1 bg-[#071425] rounded border border-[#233554] px-3 flex items-center justify-between text-[10px]">
                    <span className="text-[#8892B0]">指令 TTL 熔断阀值:</span>
                    <span className="text-[#38B2AC] font-mono">300,000 ms (5 Min)</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-white font-bold">运行中策略</h4>
                  <Activity className="text-[#38B2AC] animate-pulse w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">3 <span className="text-sm text-[#8892B0] font-normal">/ 5</span></div>
                <p className="text-xs text-[#8892B0]">Total PnL (24h): <span className="text-[#38B2AC]">+ $1,240.50</span></p>
              </Card>
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4 text-[#A78BFA]">
                   <h4 className="text-white font-bold">CTP 实盘柜台</h4>
                   <Lock className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full ${isOnline && connectionStatus === 'CONNECTED' ? 'bg-[#38B2AC] shadow-[0_0_8px_#38B2AC]' : 'bg-[#F56565]'}`} />
                   <span className="text-sm text-white font-medium">{!isOnline ? '离线 (本地队列托管)' : connectionStatus === 'CONNECTED' ? '已连接 (Mainnet)' : '未连接'}</span>
                </div>
                <button onClick={handleCTPConnect} className="mt-3 text-[10px] text-[#4299E1] hover:underline">
                  {connectionStatus === 'CONNECTED' ? '重新校验协议' : '启动 CTP 实盘握手'}
                </button>
              </Card>
            </div>

            <Card className="flex-1 p-4 lg:p-6 flex flex-col overflow-hidden">
              <h4 className="text-white font-bold mb-4 lg:mb-6">策略对接管理</h4>
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="text-[10px] lg:text-xs text-[#8892B0] border-b border-[#233554]">
                    <tr>
                      <th className="text-left py-3 px-2 lg:px-4">名称</th>
                      <th className="text-left py-3 px-2 lg:px-4">状态</th>
                      <th className="text-left py-3 px-2 lg:px-4">收益</th>
                      <th className="text-right py-3 px-2 lg:px-4">操作</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs lg:text-sm">
                    {STRATEGIES.map((s) => (
                      <tr key={s.id} className="border-b border-[#233554]/50">
                        <td className="py-3 px-2 lg:px-4 text-white font-medium">{s.name}</td>
                        <td className="py-3 px-2 lg:px-4">
                          <span className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold ${
                            s.status === 'Running' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#233554] text-[#8892B0]'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 lg:px-4 text-[#38B2AC] font-mono">{s.return}</td>
                        <td className="py-3 px-2 lg:px-4 text-right flex justify-end gap-1 lg:gap-2">
                           <button className="p-1.5 hover:bg-[#233554] rounded text-[#8892B0]"><Settings className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
          
          {!isMobile && (
            <div className="col-span-4 flex flex-col gap-6">
              {/* Pipeline Visualization: Offline Queue Window */}
              <Card className="flex-1 p-6 flex flex-col border-[#ECC94B]/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-bold flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#ECC94B]" /> 离线指令流水线
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${pendingCount > 0 ? 'bg-[#ECC94B] animate-pulse' : 'bg-[#38B2AC]'}`} />
                    <span className="text-[10px] text-[#8892B0]">{pendingCount} Pending</span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                  {pendingList.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 py-10">
                      <ShieldCheck className="w-12 h-12 text-[#38B2AC] mb-2" />
                      <p className="text-[10px] text-[#8892B0]">队列空闲，所有指令已完成同步</p>
                    </div>
                  ) : (
                    pendingList.map((cmd, i) => {
                      const timeLeft = Math.max(0, cmd.ttl - (Date.now() - cmd.timestamp));
                      const progress = (timeLeft / cmd.ttl) * 100;
                      return (
                        <div key={cmd.sequenceNumber} className="p-3 bg-[#0A192F] border border-[#233554] rounded-lg relative overflow-hidden">
                          <div className="absolute top-0 left-0 h-0.5 bg-[#ECC94B]/40" style={{ width: `${progress}%` }} />
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-[10px] text-[#ECC94B] font-mono font-bold">Seq: {cmd.sequenceNumber}</span>
                              <h5 className="text-xs text-white font-bold mt-0.5">{cmd.type}</h5>
                            </div>
                            <span className="px-1.5 py-0.5 bg-[#ECC94B]/10 text-[#ECC94B] text-[8px] rounded border border-[#ECC94B]/20">HSM SIGNED</span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-[#8892B0]">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> TTL: {Math.ceil(timeLeft/1000)}s</span>
                            <span>Source: {cmd.source}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-[#233554]">
                   <button 
                    onClick={() => performCancellation('LOCAL')} 
                    className="w-full bg-[#F56565]/10 border border-[#F56565]/30 text-[#F56565] py-3 rounded text-sm font-bold hover:bg-[#F56565]/20 transition-all flex items-center justify-center gap-2"
                   >
                     <ShieldAlert className="w-5 h-5" /> 一键撤单 (SOS)
                   </button>
                   <p className="text-[9px] text-center text-[#8892B0] mt-3">
                     * 极端行情下，指令将优先进入本地受保护队列
                   </p>
                </div>
              </Card>

              <Card className="h-64 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#38B2AC]" /> 实时日志
                  </h4>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar text-[10px] font-mono space-y-1">
                  {lastMessage && (
                    <div className="text-[#38B2AC] opacity-80">
                      [{new Date().toLocaleTimeString()}] RECEIVED_{lastMessage.type}_SEQ_{lastMessage.sequenceNumber}
                    </div>
                  )}
                  <div className="text-[#8892B0]">[09:30:00] SYSTEM_BOOT_COMPLETE</div>
                  <div className="text-[#8892B0]">[09:30:01] HSM_MODULE_INITIALIZED</div>
                  <div className="text-[#8892B0]">[09:30:05] CTP_FRONTEND_CONNECTED</div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full ${isMobile ? 'flex flex-col' : 'grid grid-cols-12'} gap-6`}>
      <div className={`${isMobile ? 'order-1' : 'col-span-8'} flex flex-col gap-6`}>
        {isMobile && <MobileEmergencyActions />}
        
        <Card className="p-4 lg:p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[#8892B0] text-xs lg:text-sm mb-1">总资产估值 (CNY 估值同步)</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                ¥ 735,420.85
                <span className="text-[10px] lg:text-sm px-2 py-1 bg-[#38B2AC]/20 text-[#38B2AC] rounded flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +2.45%
                </span>
              </h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#8892B0] uppercase tracking-widest">Local Time</p>
              <p className="text-sm font-mono text-[#CCD6F6]">UTC+8 15:24:45</p>
            </div>
          </div>
          
          <div className={`${isMobile ? 'h-32' : 'h-48'} w-full`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ASSET_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38B2AC" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38B2AC" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#233554" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#8892B0" fontSize={8} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#071425', border: 'none', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="value" stroke="#38B2AC" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex-1 p-4 lg:p-6 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-white font-bold">当前持仓</h4>
            <div className="flex gap-2">
               <div className="px-2 py-1 bg-[#112240] border border-[#233554] rounded text-[10px] text-[#8892B0]">
                 Security: HSM Active
               </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="text-[10px] text-[#8892B0] bg-[#0A192F]">
                <tr>
                  <th className="py-3 px-4 text-left">合约</th>
                  <th className="py-3 px-4 text-left">方向</th>
                  <th className="py-3 px-4 text-right">盈亏</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {POSITIONS.map((p, i) => (
                  <tr key={i} className="border-b border-[#233554]/50 hover:bg-[#112240] transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{p.symbol}</td>
                    <td className={`py-3 px-4 ${p.side === 'Long' ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{p.side}</td>
                    <td className="py-3 px-4 text-right font-mono">
                      <div className={p.pnl.startsWith('+') ? 'text-[#38B2AC]' : 'text-[#F56565]'}>{p.pnl}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {!isMobile && (
        <div className="col-span-4 flex flex-col gap-6">
          <Card className="flex-1 p-6 flex flex-col">
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
               <Globe className="w-4 h-4 text-[#4299E1]" /> 交易执行面板
            </h4>

            <div className="mb-6 space-y-4">
               <div className="flex bg-[#0A192F] p-1 rounded">
                <button onClick={() => setSide('buy')} className={`flex-1 py-1.5 text-xs font-bold rounded ${side === 'buy' ? 'bg-[#38B2AC] text-white' : 'text-[#8892B0]'}`}>买入</button>
                <button onClick={() => setSide('sell')} className={`flex-1 py-1.5 text-xs font-bold rounded ${side === 'sell' ? 'bg-[#F56565] text-white' : 'text-[#8892B0]'}`}>卖出</button>
              </div>
              <div>
                <label className="text-xs text-[#8892B0] block mb-1">价格 (CNY 挂单)</label>
                <input type="number" className="w-full bg-[#0A192F] border border-[#233554] text-white p-2 rounded text-sm" placeholder="295,430.00" />
              </div>
            </div>

            <button className={`w-full py-3 rounded font-bold text-white transition-all ${side === 'buy' ? 'bg-[#38B2AC]' : 'bg-[#F56565]'}`}>
              确认下单 (已加签)
            </button>
            
            <div className="mt-auto space-y-3 pt-6">
               <div className="p-3 bg-[#ECC94B]/5 border border-[#ECC94B]/20 rounded-lg">
                  <p className="text-[10px] text-[#ECC94B] font-bold flex items-center gap-1">
                     <AlertTriangle className="w-3 h-3" /> T+0 协议合规检查
                  </p>
                  <p className="text-[9px] text-[#8892B0] mt-1">检测到今日已完成 12 笔反向交易，注意过度交易风险。</p>
               </div>
               <button onClick={() => performCancellation('LOCAL')} className="w-full bg-[#F56565]/10 border border-[#F56565]/30 text-[#F56565] py-2 rounded text-xs font-bold hover:bg-[#F56565]/20 transition-all flex items-center justify-center gap-2">
                 <ShieldAlert className="w-4 h-4" /> 一键撤单 (SOS)
               </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
