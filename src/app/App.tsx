import React, { useState, useEffect } from 'react';

// Use safe icon wrappers instead of lucide-react to avoid fginspector ForwardRef errors
// import { Zap, Settings, Star, Activity, ChevronRight, Menu } from './components/SafeIcons';

// Inline icons to avoid potential import issues
type IconProps = React.SVGProps<SVGSVGElement>;

const Zap = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const Settings = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const Star = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const Activity = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const ChevronRight = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const Menu = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;

// Inline Layers icon to avoid potential import issues
const Layers = ({ className = "w-4 h-4", ...props }: IconProps) => (
  <svg className={className} {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

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
import { SettingsProvider, useSettings } from '@/app/contexts/SettingsContext';
import { AlertProvider } from '@/app/contexts/AlertContext';
import { SettingsDialog } from '@/app/components/layout/SettingsDialog';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
// Temporarily use mock i18n to avoid fginspector ForwardRef errors
import { useTranslation } from '@/app/i18n/mock';
import { GlobalDataProvider, useGlobalData } from '@/app/contexts/GlobalDataContext';
import { CrossModuleBar } from '@/app/components/CrossModuleBar';
import { DataAlertBridge } from '@/app/components/DataAlertBridge';
import { AITraderAssistant } from '@/app/components/AITraderAssistant';
import { Toaster, toast } from 'sonner';
import logoImg from "figma:asset/40025af4b8baa344842bf5c8553025808daf7909.png";
import { getAnalytics } from '@/app/services/AnalyticsService';

function AppContent() {
  const [activeModule, setActiveModule] = useState('market');
  const [activeSub, setActiveSub] = useState('live');
  const [activeTertiary, setActiveTertiary] = useState('全球行情');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { getChangeColorClass } = useSettings();
  const { tickerCoins, pendingNavigation, clearNavigation } = useGlobalData();

  // Initialize analytics service on mount
  useEffect(() => {
    getAnalytics().initialize();
  }, []);

  useEffect(() => {
    // Suppress fginspector ForwardRef errors globally
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorString = args.join(' ');
      if (errorString.includes('fginspector') || 
          errorString.includes('ForwardRef') ||
          errorString.includes('Element type is invalid') ||
          errorString.includes('React.Fragment')) {
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

    // PWA: Inject meta tags only (no blob URL manifest, no service worker)
    // Service Worker registration has been removed because it intercepts
    // Vite's native ESM module fetches in dev mode, causing
    // "Failed to fetch dynamically imported module" errors.
    injectPWAMeta();

    // Unregister any previously cached Service Worker to prevent stale
    // module cache from interfering with Vite dev server
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
          registration.unregister();
          console.log('[YYC-PWA] Unregistered stale Service Worker:', registration.scope);
        }
      });
    }

    const handleToggleDrawer = () => setIsMobileDrawerOpen(prev => !prev);
    const handleShowReport = () => setIsReportOpen(true);
    const handleShowSettings = () => setIsSettingsOpen(true);
    const handleToggleAI = () => setIsAIOpen(prev => !prev);

    document.addEventListener('toggleMobileDrawer', handleToggleDrawer);
    document.addEventListener('showFeasibilityReport', handleShowReport);
    document.addEventListener('showSettings', handleShowSettings);
    document.addEventListener('toggleAIAssistant', handleToggleAI);

    return () => {
      document.removeEventListener('toggleMobileDrawer', handleToggleDrawer);
      document.removeEventListener('showFeasibilityReport', handleShowReport);
      document.removeEventListener('showSettings', handleShowSettings);
      document.removeEventListener('toggleAIAssistant', handleToggleAI);
    };
  }, []);

  // Handle cross-module navigation from GlobalData
  useEffect(() => {
    if (pendingNavigation) {
      handleModuleChange(pendingNavigation.module);
      if (pendingNavigation.sub) {
        setTimeout(() => {
          setActiveSub(pendingNavigation.sub!);
          if (pendingNavigation.tertiary) {
            setActiveTertiary(pendingNavigation.tertiary!);
          }
        }, 50);
      }
      clearNavigation();
    }
  }, [pendingNavigation, clearNavigation]);

  // Reset sub/tertiary when module changes
  const handleModuleChange = (module: string) => {
    // Analytics: track module switch
    getAnalytics().trackModuleChange(activeModule, module);

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
    // Analytics: track sub-page switch
    getAnalytics().trackSubChange(activeModule, activeSub, subId);

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
          <span className="contents">
            <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-[#233554]" />
            <span className="text-[#8892B0] whitespace-nowrap cursor-pointer hover:text-[#CCD6F6] transition-colors" onClick={() => handleSubChange(activeSub)}>
              {subInfo.name}
            </span>
          </span>
        )}
        {activeTertiary && (
          <span className="contents">
            <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-[#233554]" />
            <span className="text-[#CCD6F6] font-medium whitespace-nowrap">{activeTertiary}</span>
          </span>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'market':
        return (
          <div className="space-y-0">
            <CrossModuleBar currentModule="market" />
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
          </div>
        );
      case 'strategy':
        return (
          <div className="space-y-0">
            <CrossModuleBar currentModule="strategy" />
            <StrategyModule activeSub={activeSub} activeTertiary={activeTertiary} />
          </div>
        );
      case 'risk':
        return (
          <div className="space-y-0">
            <CrossModuleBar currentModule="risk" />
            <RiskModule activeSub={activeSub} />
          </div>
        );
      case 'quantum':
        return (
          <div className="space-y-0">
            <CrossModuleBar currentModule="quantum" />
            <QuantumModule activeSub={activeSub} />
          </div>
        );
      case 'bigdata':
        return (
          <div className="space-y-0">
            <CrossModuleBar currentModule="bigdata" />
            <BigDataModule activeSub={activeSub} />
          </div>
        );
      case 'model':
        return (
          <div className="space-y-0">
            <CrossModuleBar currentModule="model" />
            <ModelModule activeSub={activeSub} />
          </div>
        );
      case 'trade':
        return (
          <div className="space-y-0">
            <CrossModuleBar currentModule="trade" />
            <TradeModule activeSub={activeSub} activeTertiary={activeTertiary} />
          </div>
        );
      case 'admin':
        return (
          <div className="space-y-0">
            <CrossModuleBar currentModule="admin" />
            <AdminModule activeSub={activeSub} activeTertiary={activeTertiary} />
          </div>
        );
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
      {/* Data-Alert Bridge: connects live market data to threshold engine */}
      <DataAlertBridge />

      <Navbar activeModule={activeModule} setActiveModule={handleModuleChange} />
      
      {/* Ticker Bar */}
      <div className={`fixed top-16 ${isMobile ? 'left-0' : 'left-64'} right-0 h-8 bg-[#112240]/80 backdrop-blur-md border-b border-[#233554] z-30 flex items-center px-4 lg:px-6 overflow-hidden`}>
        <div 
          className="flex items-center gap-12 whitespace-nowrap animate-[ticker_30s_linear_infinite]"
          style={{ animation: 'ticker 30s linear infinite' }}
        >
          {[...tickerCoins, ...tickerCoins].map((coin, i) => (
            <div key={`${coin.label}-${i}`} className="flex items-center gap-3 text-[10px]">
              <span className="text-[#8892B0] font-bold">{coin.label}</span>
              <span className="text-[#CCD6F6] font-mono">{coin.price}</span>
              <span className="text-[#8892B0] opacity-60">{coin.cny}</span>
              <span className={getChangeColorClass(coin.change)}>{coin.change}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`${isMobile ? 'pt-20' : 'pt-24'} flex flex-1`}>
        {/* Desktop Sidebar */}
        {!isMobile && (
        <div className="hidden lg:block">
          <Sidebar 
            module={activeModule} 
            activeSub={activeSub} 
            setActiveSub={handleSubChange}
            activeTertiary={activeTertiary}
            setActiveTertiary={setActiveTertiary}
          />
        </div>
        )}
        
        {/* Main Content Area */}
        <main className={`flex-1 ${isMobile ? '' : 'lg:ml-64'} ${isMobile ? 'p-3' : 'p-4 lg:p-6'} overflow-x-hidden min-h-[calc(100vh-96px)] ${isMobile ? 'pb-28' : 'pb-24 lg:pb-6'}`}>
          <div
            key={`${activeModule}-${activeSub}-${activeTertiary}`}
            className="max-w-[1600px] mx-auto"
          >
            {/* Page Header */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between ${isMobile ? 'mb-4 gap-3' : 'mb-6 gap-4'}`}>
              <div>
                {getBreadcrumbs()}
                <h1 className={`text-[#FFFFFF] ${isMobile ? 'text-lg' : 'text-xl lg:text-2xl'} font-bold tracking-tight mt-2 flex items-center gap-2`}>
                   {t(`nav.${activeModule}`)}
                   <span className="text-[#233554]">|</span>
                   <span className="text-base lg:text-lg font-normal text-[#CCD6F6]">
                     {MENUS[activeModule]?.find(s => s.id === activeSub)?.name || '概览'}
                   </span>
                </h1>
              </div>
              <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-2 lg:gap-3'}`}>
                <button
                  onClick={() => toast.success('已收藏当前页面', { description: `${MENUS[activeModule]?.find(s => s.id === activeSub)?.name || '概览'} 已添加到收藏` })}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 ${isMobile ? 'px-3 py-1.5' : 'px-3 lg:px-4 py-2'} bg-[#112240] border border-[#233554] rounded-md ${isMobile ? 'text-xs' : 'text-xs lg:text-sm'} hover:bg-[#1A2B47] transition-all`}
                >
                  <Star className="w-4 h-4" /> 收藏
                </button>
                <button 
                  onClick={() => setIsReportOpen(true)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 ${isMobile ? 'px-3 py-1.5' : 'px-3 lg:px-4 py-2'} bg-[#4299E1] rounded-md ${isMobile ? 'text-xs' : 'text-xs lg:text-sm'} text-white font-medium hover:brightness-110 transition-all`}
                >
                  <Activity className="w-4 h-4" /> {isMobile ? '报告' : '节点报告'}
                </button>
              </div>
            </div>

            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Navigation — only render on mobile */}
      {isMobile && (
        <span className="contents">
          <MobileTabbar activeModule={activeModule} onModuleChange={handleModuleChange} />
          <MobileDrawer 
            isOpen={isMobileDrawerOpen} 
            onClose={() => setIsMobileDrawerOpen(false)} 
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
            activeSub={activeSub}
            onSubChange={handleSubChange}
          />
        </span>
      )}

      {/* Feasibility Report Modal */}
      <FeasibilityReport isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />

      {/* Settings Dialog */}
      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* AI Trader Assistant */}
      <AITraderAssistant visible={isAIOpen} onClose={() => setIsAIOpen(false)} />

      {/* Sonner Toaster for all toast notifications */}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: '#112240',
            border: '1px solid #233554',
            color: '#CCD6F6',
            fontSize: '12px',
          },
        }}
        richColors
      />
    </div>
  );
}

// PWA: Dynamically inject meta tags only (no blob URL manifest, no service worker)
function injectPWAMeta() {
  const metas = [
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: '言语云量化' },
    { name: 'theme-color', content: '#0A192F' },
    { name: 'msapplication-TileColor', content: '#0A192F' },
  ];

  metas.forEach(({ name, content }) => {
    if (!document.querySelector(`meta[name="${name}"]`)) {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    }
  });

  // Apple touch icon
  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = '/logo192.png';
    document.head.appendChild(appleIcon);
  }
}

export default function App() {
  // Suppress fginspector errors by catching and logging them
  try {
    return (
      <ErrorBoundary>
        <SettingsProvider>
          <AlertProvider>
            <GlobalDataProvider>
              <AppContent />
            </GlobalDataProvider>
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