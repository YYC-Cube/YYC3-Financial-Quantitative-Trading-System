import React, { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/Card';
import { motion, AnimatePresence } from '@/app/components/SafeMotion';
import { 
  Layers, CheckCircle2, Clock, ArrowRight, Box, 
  Database, Server, ShieldCheck, Zap, RefreshCw 
} from '@/app/components/SafeIcons';
import { useHaptics } from '@/app/hooks/useHaptics';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'SETTLE';
  amount: string;
  asset: string;
  status: 'L1_PENDING' | 'SEQUENCER' | 'BATCHED' | 'L1_FINALIZED';
  timestamp: number;
  hash: string;
}

export const Layer2Settlement = () => {
  const [activeTab, setActiveTab] = useState<'ARBITRUM' | 'ZKSYNC'>('ARBITRUM');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { triggerHaptic } = useHaptics();

  // Simulate incoming transactions
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newTx: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          type: Math.random() > 0.5 ? 'SETTLE' : 'DEPOSIT',
          amount: (Math.random() * 2).toFixed(4),
          asset: 'ETH',
          status: 'L1_PENDING',
          timestamp: Date.now(),
          hash: '0x' + Math.random().toString(36).substr(2, 40)
        };
        setTransactions(prev => [newTx, ...prev].slice(0, 5));
        triggerHaptic('selection');
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [triggerHaptic]);

  // Simulate state progression
  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions(prev => prev.map(tx => {
        if (tx.status === 'L1_PENDING') return { ...tx, status: 'SEQUENCER' };
        if (tx.status === 'SEQUENCER') return { ...tx, status: 'BATCHED' };
        if (tx.status === 'BATCHED' && Math.random() > 0.5) {
            if (Math.random() > 0.8) triggerHaptic('success');
            return { ...tx, status: 'L1_FINALIZED' };
        }
        return tx;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [triggerHaptic]);

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'L1_PENDING': return 'text-[#8892B0]';
      case 'SEQUENCER': return 'text-[#ECC94B]';
      case 'BATCHED': return 'text-[#4299E1]';
      case 'L1_FINALIZED': return 'text-[#38B2AC]';
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'L1_PENDING': return <Clock className="w-4 h-4" />;
      case 'SEQUENCER': return <Server className="w-4 h-4" />;
      case 'BATCHED': return <Box className="w-4 h-4" />;
      case 'L1_FINALIZED': return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-6 bg-[#0A192F] border border-[#233554] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#38B2AC]" />
            Layer 2 结算通道
          </h3>
          <p className="text-xs text-[#8892B0] mt-1">Rollup Bridge & Sequencer Status</p>
        </div>
        <div className="flex bg-[#112240] p-1 rounded-lg">
          <button
            onClick={() => { setActiveTab('ARBITRUM'); triggerHaptic('selection'); }}
            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-2 transition-all ${
              activeTab === 'ARBITRUM' ? 'bg-[#2D3748] text-[#4299E1] shadow-lg' : 'text-[#8892B0] hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3" /> Arbitrum
          </button>
          <button
            onClick={() => { setActiveTab('ZKSYNC'); triggerHaptic('selection'); }}
            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-2 transition-all ${
              activeTab === 'ZKSYNC' ? 'bg-[#2D3748] text-[#805AD5] shadow-lg' : 'text-[#8892B0] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3" /> zkSync
          </button>
        </div>
      </div>

      {/* Visual Pipeline */}
      <div className="mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#233554] -translate-y-1/2 rounded-full" />
        <div className="flex justify-between relative z-10">
           {['提交 L1', 'Sequencer', 'Batch 打包', 'L1 终局性'].map((step, i) => (
             <div key={i} className="flex flex-col items-center gap-2 bg-[#0A192F] px-2">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  i === 3 ? 'border-[#38B2AC] bg-[#38B2AC]/20 text-[#38B2AC]' : 
                  i === 1 ? 'border-[#ECC94B] bg-[#ECC94B]/20 text-[#ECC94B] animate-pulse' :
                  'border-[#233554] bg-[#112240] text-[#8892B0]'
                }`}>
                   {i === 0 && <Clock className="w-4 h-4" />}
                   {i === 1 && <Server className="w-4 h-4" />}
                   {i === 2 && <Database className="w-4 h-4" />}
                   {i === 3 && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <span className="text-[10px] text-[#8892B0] font-mono">{step}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-2 text-[10px] text-[#8892B0] px-2">
           <span>TX HASH</span>
           <span>STATE</span>
        </div>
        <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
           <AnimatePresence initial={false}>
             {transactions.map((tx) => (
               <motion.div
                 key={tx.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="p-3 bg-[#112240] rounded border border-[#233554] flex items-center justify-between group hover:border-[#38B2AC]/50 transition-colors"
               >
                 <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded bg-[#233554] ${getStatusColor(tx.status)}`}>
                       {getStatusIcon(tx.status)}
                    </div>
                    <div>
                       <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-xs font-bold">{tx.type}</span>
                          <span className="text-[10px] text-[#8892B0]">{tx.hash.substring(0, 6)}...{tx.hash.substring(38)}</span>
                       </div>
                       <p className="text-[10px] text-[#8892B0] mt-0.5">
                          {tx.amount} {tx.asset} • {new Date(tx.timestamp).toLocaleTimeString()}
                       </p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2">
                    {tx.status === 'SEQUENCER' && <RefreshCw className="w-3 h-3 text-[#ECC94B] animate-spin" />}
                    <span className={`text-[10px] font-mono font-bold ${getStatusColor(tx.status)}`}>
                       {tx.status.replace('_', ' ')}
                    </span>
                 </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-[#233554] flex items-center justify-between">
         <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[#38B2AC] animate-pulse"></div>
             <span className="text-[10px] text-[#8892B0]">
               {activeTab} Mainnet Alpha
             </span>
         </div>
         <div className="text-[10px] text-[#8892B0] font-mono">
            Gas: <span className="text-white">0.00004 ETH</span> ($0.12)
         </div>
      </div>
    </Card>
  );
};
