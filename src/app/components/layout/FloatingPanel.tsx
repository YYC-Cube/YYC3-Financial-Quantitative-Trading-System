import React, { useState } from 'react';
import { Zap, RefreshCw, Shield, Power, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import { toast } from 'sonner';

export default function FloatingPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Zap, label: '快速交易', color: 'text-accent-blue', action: () => toast.success('Quick Trade Panel Opened') },
    { icon: RefreshCw, label: '刷新数据', color: 'text-accent-green', action: () => toast.info('Refreshing Market Data...') },
    { icon: Power, label: '紧急停机', color: 'text-accent-red', action: () => toast.error('Emergency Stop Initiated!') },
    { icon: Shield, label: '风控扫描', color: 'text-accent-yellow', action: () => toast.info('Risk Scan Started') },
  ];

  return (
    <motion.div 
      initial={{ x: 0 }}
      animate={{ width: isOpen ? 180 : 48 }}
      className="fixed right-0 top-1/3 z-50 bg-bg-card border-l border-y border-border rounded-l-lg shadow-floating overflow-hidden flex flex-col transition-all duration-300"
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-8 bg-primary-lighter flex items-center justify-center text-text-muted hover:text-white"
      >
        {isOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="flex flex-col py-2">
        {actions.map((item, idx) => (
          <button 
            key={idx}
            onClick={item.action}
            className="flex items-center h-10 px-3 hover:bg-bg-hover transition-colors group relative"
          >
            <item.icon size={20} className={clsx(item.color, "shrink-0")} />
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-3 text-sm text-text-sub whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
            {!isOpen && (
               <div className="absolute right-full mr-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                 {item.label}
               </div>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
