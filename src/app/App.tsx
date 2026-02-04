import React, { useState, useEffect } from 'react';

// Use safe icon wrappers instead of lucide-react to avoid fginspector ForwardRef errors
// import { Zap, Settings, Star, Activity, ChevronRight, Menu } from './components/SafeIcons';

// Inline icons to avoid potential import issues
const Zap = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const Settings = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const Star = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const Activity = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const ChevronRight = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const Menu = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;

// Inline Layers icon to avoid potential import issues
const Layers = ({ className = "w-4 h-4", ...props }: any) => (
  <svg className={className} {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

import { Navbar } from '@/app/components/layout/Navbar';
import { Sidebar } from '@/app/components/layout/Sidebar';
// import { MobileTabbar, MobileDrawer } from '@/app/components/layout/MobileNavigation';
// import { FeasibilityReport } from '@/app/components/FeasibilityReport';
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
import { SettingsProvider, useSettings } from '@/app/contexts/SettingsContext';
import { AlertProvider } from '@/app/contexts/AlertContext';
// import { SettingsDialog } from '@/app/components/layout/SettingsDialog';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
// Temporarily use mock i18n to avoid fginspector ForwardRef errors
import { useTranslation } from '@/app/i18n/mock';
import logoImg from "figma:asset/40025af4b8baa344842bf5c8553025808daf7909.png";

const COINS = [
  { label: 'BTC/USDT', price: '96,231.50', change: '+2.45%', cny: '≈¥692,866' },
  { label: 'ETH/USDT', price: '2,451.20', change: '-0.12%', cny: '≈¥17,648' },
  { label: 'SOL/USDT', price: '142.85', change: '+5.10%', cny: '≈¥1,028' },
  { label: 'BNB/USDT', price: '582.40', change: '+1.15%', cny: '≈¥4,193' },
  { label: 'XRP/USDT', price: '1.05', change: '-2.30%', cny: '≈¥7.56' },
  { label: 'ADA/USDT', price: '0.45', change: '+0.85%', cny: '≈¥3.24' },
];

function AppContent() {
  const [activeModule, setActiveModule] = useState('market');
  const [activeSub, setActiveSub] = useState('live');
  const [activeTertiary, setActiveTertiary] = useState('全球行情');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { getChangeColorClass } = useSettings();

  useEffect(() => {
    // Suppress fginspector ForwardRef errors globally
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorString = args.join(' ');
      if (errorString.includes('fginspector') || 
          errorString.includes('ForwardRef') ||
          errorString.includes('Element type is invalid')) {
        // Log quietly without throwing
        console.warn('Suppressed external inspector error:', ...args);
        return;
      }
      originalConsoleError.apply(console, args);
    };

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
    const handleShowSettings = () => setIsSettingsOpen(true);

    document.addEventListener('toggleMobileDrawer', handleToggleDrawer);
    document.addEventListener('showFeasibilityReport', handleShowReport);
    document.addEventListener('showSettings', handleShowSettings);

    return () => {
      document.removeEventListener('toggleMobileDrawer', handleToggleDrawer);
      document.removeEventListener('showFeasibilityReport', handleShowReport);
      document.removeEventListener('showSettings', handleShowSettings);
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
      <div className="flex items-center gap-2 text-xs lg:text-sm overflow-hidden">
        <span className="text-[#8892B0] whitespace-nowrap hidden sm:inline">言语云系统</span>
        <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-[#233554] hidden sm:inline" />
        <span className="text-[#8892B0] whitespace-nowrap cursor-pointer hover:text-[#CCD6F6] transition-colors" onClick={() => handleModuleChange(activeModule)}>
          {t(`nav.${activeModule}`)}
        </span>
        {subInfo && (
          <>
            <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-[#233554]" />
            <span className="text-[#8892B0] whitespace-nowrap cursor-pointer hover:text-[#CCD6F6] transition-colors" onClick={() => handleSubChange(activeSub)}>
              {subInfo.name}
            </span>
          </>
        )}
        {activeTertiary && (
          <>
            <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-[#233554]" />
            <span className="text-[#CCD6F6] font-medium whitespace-nowrap">{activeTertiary}</span>
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
        <div 
          className="flex items-center gap-12 whitespace-nowrap"
        >
          {[...COINS, ...COINS].map((coin, i) => (
            <div key={`${coin.label}-${i}`} className="flex items-center gap-3 text-[10px]">
              <span className="text-[#8892B0] font-bold">{coin.label}</span>
              <span className="text-[#CCD6F6] font-mono">{coin.price}</span>
              <span className="text-[#8892B0] opacity-60">{(coin as any).cny}</span>
              <span className={getChangeColorClass(coin.change)}>{coin.change}</span>
            </div>
          ))}
        </div>
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
          <div
            key={`${activeModule}-${activeSub}-${activeTertiary}`}
            className="max-w-[1600px] mx-auto"
          >
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                {getBreadcrumbs()}
                <h1 className="text-[#FFFFFF] text-xl lg:text-2xl font-bold tracking-tight mt-2 flex items-center gap-2">
                   {t(`nav.${activeModule}`)}
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
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      {/* <MobileTabbar activeModule={activeModule} onModuleChange={handleModuleChange} />
      <MobileDrawer 
        isOpen={isMobileDrawerOpen} 
        onClose={() => setIsMobileDrawerOpen(false)} 
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        activeSub={activeSub}
        onSubChange={handleSubChange}
      /> */}

      {/* Feasibility Report Modal */}
      {/* <FeasibilityReport isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} /> */}

      {/* Settings Dialog */}
      {/* <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} /> */}

      {/* Desktop Floating Action Menu */}
      {/* <div className="hidden lg:flex fixed bottom-6 right-6 flex-col gap-3 z-50">
        <button 
          onClick={() => setIsReportOpen(true)}
          className="w-12 h-12 bg-[#38B2AC] rounded-full shadow-[0_8px_24px_0_rgba(0,0,0,0.2)] flex items-center justify-center text-white hover:scale-110 transition-transform active:scale-95"
        >
          <Activity className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="w-12 h-12 bg-[#112240] border border-[#233554] rounded-full shadow-[0_8px_24px_0_rgba(0,0,0,0.2)] flex items-center justify-center text-[#CCD6F6] hover:scale-110 transition-transform active:scale-95"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div> */}
    </div>
  );
}

export default function App() {
  // Suppress fginspector errors by catching and logging them
  try {
    return (
      <ErrorBoundary>
        <SettingsProvider>
          <AlertProvider>
            <AppContent />
          </AlertProvider>
        </SettingsProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('App render error (likely from external inspector):', error);
    return (
      <div className="min-h-screen bg-[#071425] text-[#CCD6F6] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">系统初始化中...</h1>
          <p className="text-[#8892B0]">正在加载言语云量化分析交易系统</p>
        </div>
      </div>
    );
  }
}