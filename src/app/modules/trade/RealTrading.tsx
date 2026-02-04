import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/app/components/ui/Card';
import { 
  Wallet, TrendingUp, TrendingDown, DollarSign, 
  Activity, RefreshCw, Play, Pause, Settings, 
  Power, ShieldAlert, XCircle, Info, ChevronRight,
  Zap, AlertTriangle, ArrowRight, ShieldCheck, MonitorSmartphone,
  Cpu, Lock, Globe, BarChart3, Rocket, Terminal, Flame,
  Wifi, WifiOff, Clock, Database, Shield, Fingerprint, PieChart, Layers,
  Mic, MicOff, Keyboard, Bot, ShoppingBag
} from '@/app/components/SafeIcons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useIsMobile } from '@/app/components/ui/use-mobile';
import { motion, AnimatePresence } from '@/app/components/SafeMotion';
import { toast } from 'sonner';
import { useQuantSync } from '@/app/hooks/useQuantSync';
import { useCTPProtocol } from '@/app/hooks/useCTPProtocol';
import { PipelineAutomation } from './PipelineAutomation';
import { PortfolioTreemap } from '@/app/components/PortfolioTreemap';
import { RiskCouplingGraph } from '@/app/components/RiskCouplingGraph';
import { StrategyBacktest } from '@/app/components/StrategyBacktest';
import { useVoiceControl } from '@/app/hooks/useVoiceControl';
import { useMultiScreenSync } from '@/app/hooks/useMultiScreenSync';
import { useWebHID, HIDAction } from '@/app/hooks/useWebHID';
import { useHaptics } from '@/app/hooks/useHaptics';
import { AITraderAssistant } from '@/app/components/AITraderAssistant';
import { StrategyMarketplace } from '@/app/components/StrategyMarketplace';
import { Layer2Settlement } from '@/app/components/Layer2Settlement';
import { getPendingOrders, savePendingOrder, clearPendingOrders, PendingOrder } from '@/app/utils/db';

const LayersIcon = Layers;

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
  
  const { sendMessage, lastMessage, rtt, fecCorrectedCount, keyRotationId, pqcStatus, hotspotRoute, routingBias, deviceFingerprint } = useQuantSync();
  const { initiateCTPHandshake, connectionStatus } = useCTPProtocol();
  const [isHandshaking, setIsHandshaking] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [viewMode, setViewMode] = useState<'treemap' | 'graph'>('treemap');
  const [activeModule, setActiveModule] = useState<'DASHBOARD' | 'MARKETPLACE' | 'SETTLEMENT'>('DASHBOARD');
  const [selectedAssetNode, setSelectedAssetNode] = useState<any>(null);
  const { triggerHaptic } = useHaptics();
  
  // Backtest & Sync State
  const [showBacktest, setShowBacktest] = useState(false);
  const [backtestParams, setBacktestParams] = useState({ assetId: '', strategyId: 'MACD_V2' });

  // Multi-screen Synchronization
  const { broadcast } = useMultiScreenSync('YYC_TRADING_SYNC', (data: any) => {
    if (data.type === 'ASSET_SELECT') {
       // Only update if different to avoid loops
       if (data.payload?.id !== selectedAssetNode?.id) {
          setSelectedAssetNode(data.payload);
          toast("多屏联动: 资产视图已同步", { icon: <MonitorSmartphone className="w-4 h-4" /> });
       }
    } else if (data.type === 'VIEW_MODE') {
       setViewMode(data.payload);
    }
  });

  // Voice Command Configuration
  const voiceCommands = {
    '切换视图': () => {
      const newMode = viewMode === 'treemap' ? 'graph' : 'treemap';
      setViewMode(newMode);
      broadcast('VIEW_MODE', newMode);
    },
    '锁定风险': () => {
       toast.warning("声控指令: 正在锁定高风险资产仓位...");
       // Logic to lock risk would go here
    },
    '开启回测': () => {
       if (selectedAssetNode) {
          setBacktestParams({ assetId: selectedAssetNode.id, strategyId: 'VOICE_TRIGGERED_V1' });
          setShowBacktest(true);
       } else {
          toast.error("请先选择一个资产进行回测");
       }
    },
    '全屏模式': () => {
       if (!document.fullscreenElement) {
           document.documentElement.requestFullscreen();
       } else {
           document.exitFullscreen();
       }
    },
    '打开市场': () => { setActiveModule('MARKETPLACE'); triggerHaptic('success'); },
    '查看结算': () => { setActiveModule('SETTLEMENT'); triggerHaptic('success'); },
    '返回主页': () => { setActiveModule('DASHBOARD'); triggerHaptic('success'); },
    '打开助理': () => setShowAIAssistant(true),
    '关闭助理': () => setShowAIAssistant(false),
  };

  const { isListening, toggleListening, isSupported: voiceSupported } = useVoiceControl(voiceCommands);

  // Wrapper for selection to include broadcast
  const handleNodeSelect = (node: any) => {
    setSelectedAssetNode(node);
    if (node) {
        broadcast('ASSET_SELECT', node);
    }
  };

  // AI Assistant State
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // WebHID Integration
  const handleHIDAction = useCallback((action: HIDAction) => {
    switch (action) {
      case 'BUY_MARKET':
        toast.info("HID 指令: 市价买入 (模拟)");
        break;
      case 'SELL_MARKET':
        toast.info("HID 指令: 市价卖出 (模拟)");
        break;
      case 'CANCEL_ALL':
        performCancellation('LOCAL');
        break;
      case 'TOGGLE_RISK_VIEW':
        setViewMode(prev => prev === 'treemap' ? 'graph' : 'treemap');
        break;
      case 'ACTIVATE_AI':
        setShowAIAssistant(prev => !prev);
        break;
    }
  }, [performCancellation]);

  const { isConnected: isHIDConnected, connectDevice: connectHID, simulateKeyPress } = useWebHID(handleHIDAction);

  
  // IndexedDB persistence for pending instructions
  const [pendingList, setPendingList] = useState<PendingOrder[]>([]);
  const pendingCount = pendingList.length;
  
  const isSyncingRef = useRef(false);
  const currentSeq = useRef(Date.now());

  // Load pending orders from IndexedDB on mount
  useEffect(() => {
    const loadPending = async () => {
      const saved = await getPendingOrders();
      setPendingList(saved);
    };
    loadPending();
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.info('网络已恢复，启动离线指令补偿同步', {
        icon: <RefreshCw className="w-4 h-4 animate-spin" />
      });
      syncPendingOrders();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingList]);

  const syncPendingOrders = useCallback(async () => {
    if (pendingList.length === 0) return;
    
    // Simulate syncing process
    for (const order of pendingList) {
      await new Promise(resolve => setTimeout(resolve, 500));
      sendMessage({
        type: 'SYNC_COMPENSATION',
        payload: order.payload,
        source: 'PWA_OFFLINE_STACK',
        sequenceNumber: order.sequenceNumber
      });
    }
    
    await clearPendingOrders();
    setPendingList([]);
    toast.success('离线指令集同步完成', {
      description: `成功补偿 ${pendingList.length} 条幂等性指令`
    });
  }, [pendingList, sendMessage]);

  const addPendingOrder = useCallback(async (type: string, payload: any) => {
    const newOrder: PendingOrder = {
      sequenceNumber: currentSeq.current++,
      type,
      payload,
      source: isMobile ? 'MOBILE_PWA' : 'DESKTOP_PRO',
      timestamp: Date.now(),
      ttl: 300000, // 5 minutes
      fingerprint: deviceFingerprint,
      status: 'PENDING'
    };
    
    await savePendingOrder(newOrder);
    setPendingList(prev => [...prev, newOrder]);
    
    if (!isOnline) {
      toast.warning('处于离线模式', {
        description: '指令已存入 IndexedDB 离线堆栈，待重连后自动补偿'
      });
    }
  }, [isMobile, deviceFingerprint, isOnline]);

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

    const currentSeqSnapshot = sourceType === 'LOCAL' ? currentSeq.current : seq;

    toast.error(sourceType === 'LOCAL' ? '紧急全撤：所有挂单已清理' : '收到外部 SOS 指令', {
      description: sourceType === 'LOCAL' 
        ? `多因子加签已发送 | DFP: ${deviceFingerprint?.substring(0, 8)}` 
        : `来自 ${sourceName} 的指令通过 DFP 校验 (Seq: ${seq})`,
      position: isMobile ? 'top-center' : 'bottom-right',
      className: 'bg-[#F56565] text-white font-bold',
    });

    setSlideProgress(0);
    
    if (sourceType === 'LOCAL') {
      const payload = { timestamp: Date.now(), reason: 'EMERGENCY_SOS' };
      
      if (!isOnline) {
        await addPendingOrder('ORDER_CANCELLED', payload);
      } else {
        await sendMessage({
          type: 'ORDER_CANCELLED',
          payload,
          source: isMobile ? 'MOBILE_PWA' : 'DESKTOP_PRO'
        });
        currentSeq.current++;
        simulateCTPAck(currentSeqSnapshot!);
      }
    }
  }, [isMobile, sendMessage, currentSeq, simulateCTPAck, isOnline, deviceFingerprint]);

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
        loading: '执行多因混合加签验证...',
        success: '测试通过：备指纹 (DFP) 校验成功',
        error: '集成测试失败',
        finally: () => setIsTesting(false)
      }
    );
  };

  const MobileEmergencyActions = () => (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] text-[#F56565] font-bold uppercase tracking-widest flex items-center gap-1">
           <ShieldAlert className="w-3 h-3" /> 极端行情工具 (SOS)
        </span>
        <div className="flex items-center gap-1.5">
          <Fingerprint className="w-3 h-3 text-[#38B2AC]" />
          <span className="text-[10px] text-[#8892B0] font-mono">{deviceFingerprint?.substring(0, 8)}</span>
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
    </div>
  );

  if (subView === 'asset') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-2">
           {/* Voice Control Indicator */}
           <div className="flex items-center gap-2">
              {voiceSupported && (
                  <button 
                    onClick={() => { toggleListening(); triggerHaptic('impact'); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isListening ? 'bg-[#F56565]/20 border-[#F56565] text-[#F56565] animate-pulse' : 'bg-[#112240] border-[#233554] text-[#8892B0] hover:text-white'}`}
                  >
                    {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    <span className="text-xs font-medium">{isListening ? '正在聆听指令...' : '语音控制'}</span>
                  </button>
              )}
              
              {/* HID Connect Button */}
              <button
                onClick={() => { if (!isHIDConnected) connectHID(); triggerHaptic('impact'); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                  isHIDConnected 
                    ? 'bg-[#38B2AC]/20 border-[#38B2AC] text-[#38B2AC]' 
                    : 'bg-[#112240] border-[#233554] text-[#8892B0] hover:text-white'
                }`}
                title="模拟连接专用交易键盘"
              >
                 <Keyboard className="w-4 h-4" />
                 <span className="text-xs font-medium">{isHIDConnected ? 'Elgato Connected' : '连接 HID 设备'}</span>
              </button>

              {/* AI Assistant Toggle */}
              <button
                onClick={() => { setShowAIAssistant(!showAIAssistant); triggerHaptic('impact'); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                  showAIAssistant 
                    ? 'bg-[#4299E1]/20 border-[#4299E1] text-[#4299E1]' 
                    : 'bg-[#112240] border-[#233554] text-[#8892B0] hover:text-white'
                }`}
              >
                 <Bot className="w-4 h-4" />
                 <span className="text-xs font-medium">Alpha-GPT</span>
              </button>
           </div>

           <div className="bg-[#112240] p-1 rounded-lg border border-[#233554] flex gap-1">
              <button 
                onClick={() => { setActiveModule('DASHBOARD'); triggerHaptic('selection'); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeModule === 'DASHBOARD' ? 'bg-[#38B2AC] text-white' : 'text-[#8892B0] hover:text-white'}`}
              >
                主控台
              </button>
              <button 
                onClick={() => { setActiveModule('MARKETPLACE'); triggerHaptic('selection'); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${activeModule === 'MARKETPLACE' ? 'bg-[#38B2AC] text-white' : 'text-[#8892B0] hover:text-white'}`}
              >
                <ShoppingBag className="w-3 h-3" /> 策略市场
              </button>
              <button 
                onClick={() => { setActiveModule('SETTLEMENT'); triggerHaptic('selection'); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${activeModule === 'SETTLEMENT' ? 'bg-[#38B2AC] text-white' : 'text-[#8892B0] hover:text-white'}`}
              >
                <LayersIcon className="w-3 h-3" /> L2 结算
              </button>
           </div>
        </div>

        {activeModule === 'DASHBOARD' && (
          <div className="space-y-6">
             <div className="flex justify-end mb-[-40px] relative z-10 pointer-events-none">
                <div className="pointer-events-auto bg-[#112240] p-1 rounded-lg border border-[#233554] flex gap-1">
                   <button 
                     onClick={() => { setViewMode('treemap'); triggerHaptic('selection'); }}
                     className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'treemap' ? 'bg-[#2D3748] text-[#38B2AC]' : 'text-[#8892B0] hover:text-white'}`}
                   >
                     矩形树图
                   </button>
                   <button 
                     onClick={() => { setViewMode('graph'); triggerHaptic('selection'); }}
                     className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'graph' ? 'bg-[#2D3748] text-[#38B2AC]' : 'text-[#8892B0] hover:text-white'}`}
                   >
                     动力学拓扑
                   </button>
                </div>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                 {viewMode === 'treemap' ? <PortfolioTreemap /> : <RiskCouplingGraph onNodeSelect={handleNodeSelect} />}
              </div>
              <div className="lg:col-span-4">
                 {selectedAssetNode ? (
                    <Card className="p-6 h-full flex flex-col bg-gradient-to-br from-[#112240] to-[#0A192F]">
                       <div className="flex justify-between items-start mb-4">
                         <div>
                           <h4 className="text-white font-bold flex items-center gap-2 text-xl">
                             <span className="w-8 h-8 rounded-full bg-[#38B2AC]/20 flex items-center justify-center text-[#38B2AC] text-sm">
                               {selectedAssetNode.id.substring(0,1)}
                             </span>
                             {selectedAssetNode.id}
                           </h4>
                           <p className="text-xs text-[#8892B0] ml-10">风险穿透详情</p>
                         </div>
                         <button 
                           onClick={() => { handleNodeSelect(null); triggerHaptic('impact'); }}
                           className="p-1 hover:bg-[#233554] rounded text-[#8892B0]"
                         >
                           <XCircle className="w-5 h-5" />
                         </button>
                       </div>
                       
                       <div className="space-y-6 flex-1">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-3 bg-[#071425] rounded border border-[#233554]">
                                <p className="text-[10px] text-[#8892B0] mb-1">风险评分 (Risk)</p>
                                <p className={`text-xl font-bold font-mono ${selectedAssetNode.risk > 80 ? 'text-[#F56565]' : selectedAssetNode.risk > 50 ? 'text-[#ECC94B]' : 'text-[#38B2AC]'}`}>
                                  {Math.round(selectedAssetNode.risk)}
                                </p>
                             </div>
                             <div className="p-3 bg-[#071425] rounded border border-[#233554]">
                                <p className="text-[10px] text-[#8892B0] mb-1">持仓权重 (Val)</p>
                                <p className="text-xl font-bold font-mono text-white">
                                  {selectedAssetNode.val}%
                                </p>
                             </div>
                          </div>
    
                          <div>
                             <div className="flex justify-between items-center mb-2">
                                 <h5 className="text-xs font-bold text-white flex items-center gap-2">
                                   <Activity className="w-3 h-3 text-[#4299E1]" /> 实时关联性因子
                                 </h5>
                                 <button 
                                    onClick={() => {
                                        setBacktestParams({ assetId: selectedAssetNode.id, strategyId: 'MANUAL_HEDGE_V1' });
                                        setShowBacktest(true);
                                        triggerHaptic('selection');
                                    }}
                                    className="text-[10px] text-[#38B2AC] hover:underline flex items-center gap-1"
                                 >
                                    <Terminal className="w-3 h-3" /> 历史回测
                                 </button>
                             </div>
                             <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-[#8892B0]">
                                   <span>BTC Correlation</span>
                                   <span className="text-[#F56565]">0.85 (High)</span>
                                </div>
                                <div className="h-1 bg-[#233554] rounded-full overflow-hidden">
                                   <div className="h-full bg-[#F56565]" style={{ width: '85%' }}></div>
                                </div>
                                
                                <div className="flex justify-between text-[10px] text-[#8892B0] mt-1">
                                   <span>ETH Beta</span>
                                   <span className="text-[#ECC94B]">0.62 (Med)</span>
                                </div>
                                <div className="h-1 bg-[#233554] rounded-full overflow-hidden">
                                   <div className="h-full bg-[#ECC94B]" style={{ width: '62%' }}></div>
                                </div>
                             </div>
                          </div>
    
                          <div className="p-3 bg-[#F56565]/10 border border-[#F56565]/20 rounded text-xs text-[#F56565] flex gap-2">
                             <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                             <div>
                                <span className="font-bold block mb-1">Q-VaR 压力测试警告</span>
                                模拟显示该资产在 Dilithium 攻击情景下的流动性枯竭风险较高。建议对冲。
                             </div>
                          </div>
                       </div>
    
                       <button 
                          onClick={() => {
                            triggerHaptic('success');
                            toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
                              loading: `正在计算 ${selectedAssetNode?.id} 动态对冲比率 (Delta Neutral)...`,
                              success: () => {
                                 const hedgeRatio = (selectedAssetNode?.risk || 50) / 100;
                                 const direction = 'Short'; 
                                 return `已生成智能对冲策略: ${direction} ${selectedAssetNode?.id}-PERP (${(hedgeRatio * 10).toFixed(1)}x Lev) - 订单已路由至 CTP 柜台`;
                              },
                              error: '对冲计算失败'
                            });
                          }}
                          className="w-full mt-4 py-2 bg-[#38B2AC] text-white font-bold text-xs rounded hover:bg-[#319795] transition-all flex items-center justify-center gap-2"
                       >
                          <Zap className="w-3 h-3" /> 执行针对性对冲
                       </button>
                    </Card>
                 ) : (
                 <Card className="p-6 h-full flex flex-col justify-between bg-gradient-to-br from-[#112240] to-[#0A192F]">
                    <div>
                       <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                         <PieChart className="w-5 h-5 text-[#4299E1]" /> 集中度分析
                       </h4>
                       <p className="text-xs text-[#8892B0] mb-6">基于 D3.js TreeMap 的多维持仓穿透分析</p>
                       
                       <div className="space-y-4">
                          <div className="flex justify-between items-center text-xs">
                             <span className="text-[#8892B0]">最大仓位: BTC/USDT</span>
                             <span className="text-[#38B2AC] font-mono">24.5%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#071425] rounded-full overflow-hidden">
                             <div className="h-full bg-[#38B2AC]" style={{ width: '24.5%' }} />
                          </div>
    
                          <div className="flex justify-between items-center text-xs">
                             <span className="text-[#8892B0]">加密货币占比</span>
                             <span className="text-[#4299E1] font-mono">42.8%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#071425] rounded-full overflow-hidden">
                             <div className="h-full bg-[#4299E1]" style={{ width: '42.8%' }} />
                          </div>
                       </div>
                    </div>
    
                    <div className="pt-6 border-t border-[#233554] mt-6">
                       <div className="flex items-center gap-3 p-3 bg-[#4299E1]/5 border border-[#4299E1]/20 rounded-lg">
                          <ShieldCheck className="w-4 h-4 text-[#4299E1]" />
                          <p className="text-[10px] text-[#8892B0]">已通过量子抗性签名校验，确保资产穿透报告的真实性与不可篡改。</p>
                       </div>
                    </div>
                 </Card>
                 )}
              </div>
             </div>
             
             <Card className="p-6">
               <h4 className="text-white font-bold mb-4">资产细分明细</h4>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: '现货余额', val: '¥ 124,500', chg: '+0.5%' },
                    { label: '衍生品权益', val: '¥ 540,200', chg: '+3.2%' },
                    { label: '锁定保证金', val: '¥ 45,000', chg: '-1.2%' },
                    { label: '理财收益', val: '¥ 25,720', chg: '+0.2%' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-[#071425] rounded-lg border border-[#233554]">
                       <p className="text-[10px] text-[#8892B0] mb-1">{item.label}</p>
                       <p className="text-lg font-bold text-white font-mono">{item.val}</p>
                       <p className={`text-[10px] mt-1 ${item.chg.startsWith('+') ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{item.chg} (24h)</p>
                    </div>
                  ))}
               </div>
            </Card>
          </div>
        )}

        {activeModule === 'MARKETPLACE' && (
           <div>
              <StrategyMarketplace />
           </div>
        )}

        {activeModule === 'SETTLEMENT' && (
           <div className="h-[600px]">
              <Layer2Settlement />
           </div>
        )}
        
        {/* Backtest Modal */}
        {showBacktest && (
            <StrategyBacktest 
                assetId={backtestParams.assetId} 
                strategyId={backtestParams.strategyId} 
                onClose={() => setShowBacktest(false)} 
            />
        )}
        
        {/* AI Assistant Floating Window */}
        <AITraderAssistant 
           visible={showAIAssistant} 
           onClose={() => setShowAIAssistant(false)}
           contextData={{ selectedAssetNode }}
        />
        
        {/* HID Simulation Panel (Dev Only) */}
        {isHIDConnected && (
           <div className="fixed bottom-4 left-4 z-50 bg-[#0A192F]/90 backdrop-blur p-2 rounded border border-[#233554] shadow-lg">
              <p className="text-[10px] text-[#8892B0] mb-2 font-mono text-center">WEB HID SIMULATOR</p>
              <div className="grid grid-cols-5 gap-1">
                 {/* Row 0 */}
                 <button onClick={() => simulateKeyPress('0,0')} className="w-8 h-8 bg-[#233554] hover:bg-[#38B2AC] rounded text-[8px] text-white flex items-center justify-center">VIEW</button>
                 <div className="w-8 h-8"></div>
                 <div className="w-8 h-8"></div>
                 <div className="w-8 h-8"></div>
                 <button onClick={() => simulateKeyPress('0,4')} className="w-8 h-8 bg-[#233554] hover:bg-[#4299E1] rounded text-[8px] text-white flex items-center justify-center">AI</button>
                 
                 {/* Row 1 */}
                 <button onClick={() => simulateKeyPress('1,0')} className="w-8 h-8 bg-[#38B2AC]/20 hover:bg-[#38B2AC] border border-[#38B2AC] rounded text-[8px] text-[#38B2AC] hover:text-white flex items-center justify-center font-bold">BUY</button>
                 <button onClick={() => simulateKeyPress('1,1')} className="w-8 h-8 bg-[#F56565]/20 hover:bg-[#F56565] border border-[#F56565] rounded text-[8px] text-[#F56565] hover:text-white flex items-center justify-center font-bold">SELL</button>
                 <div className="w-8 h-8"></div>
                 <div className="w-8 h-8"></div>
                 <div className="w-8 h-8"></div>
                 
                 {/* Row 2 */}
                 <button onClick={() => simulateKeyPress('2,0')} className="w-8 h-8 bg-[#F56565] hover:bg-red-600 rounded text-[8px] text-white flex items-center justify-center font-bold animate-pulse">SOS</button>
              </div>
           </div>
        )}
      </div>
    );
  }

  if (subView === '自动交易') {
    return (
      <div className="space-y-6">
        <PipelineAutomation />
        
        <div className={`h-full ${isMobile ? 'flex flex-col' : 'grid grid-cols-12'} gap-6`}>
          <div className={`${isMobile ? 'order-1' : 'col-span-8'} flex flex-col gap-6`}>
            <Card className="p-6 bg-gradient-to-br from-[#112240] to-[#0A192F] border-[#233554] overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Fingerprint className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-bold flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#38B2AC]" />
                      多因子混合加签模组
                    </h4>
                    <p className="text-xs text-[#8892B0] mt-1">集成 Web Crypto HSM 与设备指纹 (DFP) 的双重认证体系</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-[#38B2AC]/10 border border-[#38B2AC]/30 rounded text-[9px] text-[#38B2AC] font-mono flex items-center gap-1">
                      <Fingerprint className="w-3 h-3" /> ID: {deviceFingerprint}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="p-3 bg-[#071425] rounded border border-[#233554]">
                    <p className="text-[10px] text-[#8892B0] mb-1">指令热点分析</p>
                    <p className={`text-xs font-mono flex items-center gap-1 ${hotspotRoute === 'OPTIMIZED' ? 'text-[#38B2AC]' : 'text-[#ECC94B]'}`}>
                      <Activity className={`w-3 h-3 ${hotspotRoute === 'ANALYZING' ? 'animate-pulse' : ''}`} /> {hotspotRoute}
                    </p>
                  </div>
                  <div className="p-3 bg-[#071425] rounded border border-[#233554]">
                    <p className="text-[10px] text-[#8892B0] mb-1">量子抗性签名 (PQC)</p>
                    <p className="text-xs font-mono text-[#38B2AC] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Dilithium-Sim
                    </p>
                  </div>
                  <div className="p-3 bg-[#071425] rounded border border-[#233554]">
                    <p className="text-[10px] text-[#8892B0] mb-1">全链路加签</p>
                    <p className="text-xs font-mono text-[#ECC94B] flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} /> {keyRotationId}
                    </p>
                  </div>
                  <div className="p-3 bg-[#071425] rounded border border-[#233554]">
                    <p className="text-[10px] text-[#8892B0] mb-1">动态路由偏置</p>
                    <p className={`text-xs font-mono flex items-center gap-1 ${routingBias > 0 ? 'text-[#38B2AC]' : 'text-[#8892B0]'}`}>
                      <Layers className="w-3 h-3" /> {routingBias > 0 ? 'MP-BIAS' : 'DEFAULT'}
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
                    执行 MFA 混合加签测试
                  </button>
                  <div className="flex-1 bg-[#071425] rounded border border-[#233554] px-3 flex items-center justify-between text-[10px]">
                    <span className="text-[#8892B0]">指令流控策略:</span>
                    <span className="text-[#38B2AC] font-mono">Differential Sync v2.1</span>
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
                   <span className="text-sm text-white font-medium">{!isOnline ? '离线待补偿' : connectionStatus === 'CONNECTED' ? '已连接 (Mainnet)' : '未连接'}</span>
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
                      <p className="text-[10px] text-[#8892B0]">所有指令已通过 DFP 校验并同步</p>
                    </div>
                  ) : (
                    pendingList.map((cmd) => {
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
                            <div className="flex flex-col items-end gap-1">
                               <span className="px-1.5 py-0.5 bg-[#ECC94B]/10 text-[#ECC94B] text-[8px] rounded border border-[#ECC94B]/20">HSM SIGNED</span>
                               <span className="text-[8px] text-[#38B2AC] font-mono">DFP: {cmd.fingerprint?.substring(0, 8)}</span>
                            </div>
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
                   <p className="text-[9px] text-center text-[#8892B0] mt-3 flex items-center justify-center gap-1">
                     <Zap className="w-3 h-3 text-[#ECC94B]" /> 差分同步已开启：重复指令将自动合并
                   </p>
                </div>
              </Card>

              <Card className="h-64 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#38B2AC]" /> MFA 安全日志
                  </h4>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar text-[10px] font-mono space-y-1">
                  {lastMessage && (
                    <div className="text-[#38B2AC] opacity-80">
                      [{new Date().toLocaleTimeString()}] AUTH_SUCCESS: {lastMessage.fingerprint?.substring(0, 10)}...
                    </div>
                  )}
                  <div className="text-[#8892B0]">[10:05:22] DFP_GENERATED: {deviceFingerprint}</div>
                  <div className="text-[#8892B0]">[10:05:22] MFA_MODULE_STANDBY</div>
                  <div className="text-[#8892B0]">[10:05:25] SYNC_OPTIMIZER_ACTIVE</div>
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
               <div className="px-2 py-1 bg-[#112240] border border-[#233554] rounded text-[10px] text-[#8892B0] flex items-center gap-1">
                 <ShieldCheck className="w-3 h-3 text-[#38B2AC]" /> MFA Active
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
              确认下单 (MFA 加签)
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