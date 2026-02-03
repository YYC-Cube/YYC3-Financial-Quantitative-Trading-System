import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Settings, Layers, Star, Activity, ChevronRight, Menu } from 'lucide-react';

import { Navbar } from '@/app/components/layout/Navbar';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { MobileTabbar, MobileDrawer } from '@/app/components/layout/MobileNavigation';
import { FeasibilityReport } from '@/app/components/FeasibilityReport';
import { MarketModule } from '@/app/modules/market/MarketModule';
import { StrategyModule } from '@/app/modules/strategy/StrategyModule';
import { RiskModule } from '@/app/modules/risk/RiskModule';
import { QuantumModule } from '@/app/modules/quantum/QuantumModule';
import { BigDataModule } from '@/app/modules/bigdata/BigDataModule';
import { ModelModule } from '@/app/modules/model/ModelModule';
import { TradeModule } from '@/app/modules/trade/TradeModule';
import { AdminModule } from '@/app/modules/admin/AdminModule';
import { MODULES, MENUS } from '@/app/data/navigation';
import { useIsMobile } from '@/app/components/ui/use-mobile';
import logoImg from "figma:asset/40025af4b8baa344842bf5c8553025808daf7909.png";

const COINS = [
  { label: 'BTC/USDT', price: '96,231.50', change: '+2.45%', cny: '≈¥692,866' },
  { label: 'ETH/USDT', price: '2,451.20', change: '-0.12%', cny: '≈¥17,648' },
  { label: 'SOL/USDT', price: '142.85', change: '+5.10%', cny: '≈¥1,028' },
  { label: 'BNB/USDT', price: '582.40', change: '+1.15%', cny: '≈¥4,193' },
  { label: 'XRP/USDT', price: '1.05', change: '-2.30%', cny: '≈¥7.56' },
  { label: 'ADA/USDT', price: '0.45', change: '+0.85%', cny: '≈¥3.24' },
];

export default function App() {
  const [activeModule, setActiveModule] = useState('market');
  const [activeSub, setActiveSub] = useState('live');
  const [activeTertiary, setActiveTertiary] = useState('全球行情');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Set Title and Favicon
    document.title = "言语云量化分析交易系统";
    const link = (document.querySelector("link[rel*='icon']") || document.createElement('link')) as HTMLLinkElement;
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = logoImg;
    document.getElementsByTagName('head')[0].appendChild(link);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('SW registered: ', registration);
            // Check for notification permission
            if (Notification.permission === 'default') {
              setTimeout(() => {
                Notification.requestPermission();
              }, 5000);
            }
          },
          (error) => console.log('SW registration failed: ', error)
        );
      });
    }

    const handleToggleDrawer = () => setIsMobileDrawerOpen(prev => !prev);
    const handleShowReport = () => setIsReportOpen(true);

    document.addEventListener('toggleMobileDrawer', handleToggleDrawer);
    document.addEventListener('showFeasibilityReport', handleShowReport);

    // Register Service Worker for PWA/Offline Support
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }

    return () => {
      document.removeEventListener('toggleMobileDrawer', handleToggleDrawer);
      document.removeEventListener('showFeasibilityReport', handleShowReport);
    };
  }, []);

  // Reset sub/tertiary when module changes
  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    const defaultSub = MENUS[module]?.[0];
    if (defaultSub) {
      setActiveSub(defaultSub.id);
      setActiveTertiary(defaultSub.sub?.[0] || '');
    } else {
      setActiveSub('');
      setActiveTertiary('');
    }
    // Close drawer if open
    setIsMobileDrawerOpen(false);
  };

  const handleSubChange = (subId: string) => {
    setActiveSub(subId);
    const subMenu = MENUS[activeModule]?.find(m => m.id === subId);
    if (subMenu && subMenu.sub && subMenu.sub.length > 0) {
      setActiveTertiary(subMenu.sub[0]);
    } else {
      setActiveTertiary('');
    }
  };

  const getBreadcrumbs = () => {
    const moduleInfo = MODULES.find(m => m.id === activeModule);
    const subInfo = MENUS[activeModule]?.find(s => s.id === activeSub);
    
    return (
      <div className="flex items-center gap-2 text-sm overflow-hidden">
        <span className="text-[#8892B0] whitespace-nowrap hidden sm:inline">言语云系统</span>
        <ChevronRight className="w-4 h-4 text-[#233554] hidden sm:inline" />
        <span className="text-[#CCD6F6] font-medium whitespace-nowrap">{moduleInfo?.name}</span>
        {subInfo && (
          <>
            <ChevronRight className="w-4 h-4 text-[#233554]" />
            <span className="text-[#CCD6F6] font-medium whitespace-nowrap">{subInfo.name}</span>
          </>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'market':
        return (
          <MarketModule 
            activeSub={activeSub} 
            activeTertiary={activeTertiary}
            onNavigate={(page) => {
              if (page === 'analysis') {
                setActiveSub('live');
                setActiveTertiary('K线分析');
              }
            }} 
          />
        );
      case 'strategy':
        return <StrategyModule activeSub={activeSub} activeTertiary={activeTertiary} />;
      case 'risk':
        return <RiskModule activeSub={activeSub} />;
      case 'quantum':
        return <QuantumModule activeSub={activeSub} />;
      case 'bigdata':
        return <BigDataModule activeSub={activeSub} />;
      case 'model':
        return <ModelModule activeSub={activeSub} />;
      case 'trade':
        return <TradeModule activeSub={activeSub} activeTertiary={activeTertiary} />;
      case 'admin':
        return <AdminModule activeSub={activeSub} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-[#8892B0]">
            <Layers className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-medium">模块建设中...</h3>
            <p className="text-sm mt-2">正在接入{activeModule}相关的实时数据与逻辑接口</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#071425] text-[#CCD6F6] font-sans selection:bg-[#4299E1]/30 flex flex-col">
      {/* PWA / App Meta Visual Cues */}
      <title>言语云量化分析交易系统</title>
      <meta name="theme-color" content="#0A192F" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      <Navbar activeModule={activeModule} setActiveModule={handleModuleChange} />
      
      {/* Ticker Bar */}
      <div className="fixed top-16 left-0 lg:left-64 right-0 h-8 bg-[#112240]/80 backdrop-blur-md border-b border-[#233554] z-30 flex items-center px-4 lg:px-6 overflow-hidden">
        <motion.div 
          animate={{ x: [0, -400] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex items-center gap-12 whitespace-nowrap"
        >
          {[...COINS, ...COINS].map((coin, i) => (
            <div key={`${coin.label}-${i}`} className="flex items-center gap-3 text-[10px]">
              <span className="text-[#8892B0] font-bold">{coin.label}</span>
              <span className="text-[#CCD6F6] font-mono">{coin.price}</span>
              <span className="text-[#8892B0] opacity-60">{(coin as any).cny}</span>
              <span className={coin.change.startsWith('+') ? 'text-[#38B2AC]' : 'text-[#F56565]'}>{coin.change}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="pt-24 flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar 
            module={activeModule} 
            activeSub={activeSub} 
            setActiveSub={handleSubChange}
            activeTertiary={activeTertiary}
            setActiveTertiary={setActiveTertiary}
          />
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 p-4 lg:p-6 overflow-x-hidden min-h-[calc(100vh-96px)] pb-24 lg:pb-6">
          <motion.div
            key={`${activeModule}-${activeSub}-${activeTertiary}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-[1600px] mx-auto"
          >
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                {getBreadcrumbs()}
                <h1 className="text-[#FFFFFF] text-xl lg:text-2xl font-bold tracking-tight mt-2 flex items-center gap-2">
                   {MODULES.find(m => m.id === activeModule)?.name}
                   <span className="text-[#233554]">|</span>
                   <span className="text-base lg:text-lg font-normal text-[#CCD6F6]">
                     {MENUS[activeModule]?.find(s => s.id === activeSub)?.name || '概览'}
                   </span>
                </h1>
              </div>
              <div className="flex items-center gap-2 lg:gap-3">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 lg:px-4 py-2 bg-[#112240] border border-[#233554] rounded-md text-xs lg:text-sm hover:bg-[#1A2B47] transition-all">
                  <Star className="w-4 h-4" /> 收藏
                </button>
                <button 
                  onClick={() => setIsReportOpen(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 lg:px-4 py-2 bg-[#4299E1] rounded-md text-xs lg:text-sm text-white font-medium hover:brightness-110 transition-all"
                >
                  <Activity className="w-4 h-4" /> 节点报告
                </button>
              </div>
            </div>

            {renderContent()}
          </motion.div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileTabbar activeModule={activeModule} onModuleChange={handleModuleChange} />
      <MobileDrawer 
        isOpen={isMobileDrawerOpen} 
        onClose={() => setIsMobileDrawerOpen(false)} 
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        activeSub={activeSub}
        onSubChange={handleSubChange}
      />

      {/* Feasibility Report Modal */}
      <FeasibilityReport isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />

      {/* Desktop Floating Action Menu */}
      <div className="hidden lg:flex fixed bottom-6 right-6 flex-col gap-3 z-50">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsReportOpen(true)}
          className="w-12 h-12 bg-[#38B2AC] rounded-full shadow-[0_8px_24px_0_rgba(0,0,0,0.2)] flex items-center justify-center text-white"
        >
          <Activity className="w-6 h-6" />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 bg-[#112240] border border-[#233554] rounded-full shadow-[0_8px_24px_0_rgba(0,0,0,0.2)] flex items-center justify-center text-[#CCD6F6]"
        >
          <Settings className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
}
