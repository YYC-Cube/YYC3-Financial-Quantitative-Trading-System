import React, { useState, useEffect, useRef } from 'react';
import { MODULES, MENUS, type MenuItem } from '@/app/data/navigation';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';
import { useAlerts } from '@/app/contexts/AlertContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import logoImg from "figma:asset/40025af4b8baa344842bf5c8553025808daf7909.png";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type IconProps = React.SVGProps<SVGSVGElement>;

// Inline icons — pure function components, no forwardRef
const TrendingUp = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const Cpu = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>;
const Zap = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const ShieldAlert = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" /></svg>;
const Menu = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const X = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const ChevronRight = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const ArrowRight = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;
const Bell = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const Settings = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const Link2 = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>;
const Wallet = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M9 18h6M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>;
const BarChart3 = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V10M18 20V4M6 20v-4" /></svg>;

// Haptic-style visual feedback
const useTapFeedback = () => {
  const [tapped, setTapped] = useState<string | null>(null);
  const tap = (id: string) => {
    setTapped(id);
    setTimeout(() => setTapped(null), 150);
  };
  return { tapped, tap };
};

// ================================
// Mobile Bottom Tab Bar
// ================================
export const MobileTabbar = ({ activeModule, onModuleChange }: {
  activeModule: string;
  onModuleChange: (mod: string) => void;
}) => {
  const { account, positions, formatUSD } = useGlobalData();
  const { alerts } = useAlerts();
  const unreadAlerts = alerts.filter(a => !a.read).length;
  const { tapped, tap } = useTapFeedback();

  const tabs = [
    { id: 'market', name: '行情', icon: TrendingUp, badge: null },
    { id: 'strategy', name: '策略', icon: Cpu, badge: null },
    { id: 'trade', name: '交易', icon: Zap, badge: positions.length > 0 ? `${positions.length}` : null },
    { id: 'risk', name: '风控', icon: ShieldAlert, badge: unreadAlerts > 0 ? `${unreadAlerts}` : null },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Quick summary strip above tabs */}
      <div className="bg-[#071425]/95 backdrop-blur-md border-t border-[#233554]/50 px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-3 h-3 text-[#8892B0]" />
          <span className="text-[10px] text-[#8892B0]">资产</span>
          <span className="text-[10px] font-mono text-[#CCD6F6]">
            ${account.totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3 h-3 text-[#8892B0]" />
          <span className="text-[10px] text-[#8892B0]">今日</span>
          <span className={cn(
            "text-[10px] font-mono",
            account.todayPnl >= 0 ? "text-[#38B2AC]" : "text-[#F56565]"
          )}>
            {formatUSD(account.todayPnl)}
          </span>
        </div>
      </div>

      {/* Main tab bar */}
      <div className="bg-[#0A192F]/95 backdrop-blur-lg border-t border-[#233554] h-16 flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id;
          const isTapped = tapped === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                tap(tab.id);
                onModuleChange(tab.id);
              }}
              className={cn(
                "flex flex-col items-center gap-0.5 transition-all duration-200 relative py-1 px-3",
                isActive ? "text-[#38B2AC]" : "text-[#8892B0]",
                isTapped && "scale-90"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all relative",
                isActive && "bg-[#38B2AC]/10"
              )}>
                <Icon className="w-5 h-5" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-[#F56565] text-white text-[8px] flex items-center justify-center rounded-full font-bold px-0.5 border border-[#0A192F]">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.name}</span>
              {isActive && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#38B2AC] rounded-full" />
              )}
            </button>
          );
        })}
        <button
          onClick={() => document.dispatchEvent(new CustomEvent('toggleMobileDrawer'))}
          className="flex flex-col items-center gap-0.5 text-[#8892B0] py-1 px-3 active:scale-90 transition-transform"
        >
          <div className="p-1.5 relative">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">更多</span>
        </button>
      </div>
    </div>
  );
};

// ================================
// Mobile Navigation Drawer
// ================================
export const MobileDrawer = ({
  isOpen,
  onClose,
  activeModule,
  onModuleChange,
  activeSub,
  onSubChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeModule: string;
  onModuleChange: (mod: string) => void;
  activeSub: string;
  onSubChange: (sub: string) => void;
}) => {
  const { account, positions, crossModuleSummary, navigateTo, formatUSD, riskMetrics, systemMetrics } = useGlobalData();
  const { alerts } = useAlerts();
  const unreadAlerts = alerts.filter(a => !a.read).length;
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'modules' | 'data' | 'quick'>('modules');
  const drawerRef = useRef<HTMLDivElement>(null);

  // Reset expanded sub when module changes
  useEffect(() => {
    setExpandedSub(null);
  }, [activeModule]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalPnl = positions.reduce((s, p) => s + p.unrealizedPnl, 0);
  const riskLevel = crossModuleSummary.risk.riskLevel;
  const riskColor = riskLevel === 'high' ? 'text-[#F56565]' : riskLevel === 'medium' ? 'text-[#ECC94B]' : 'text-[#38B2AC]';
  const riskBg = riskLevel === 'high' ? 'bg-[#F56565]/10' : riskLevel === 'medium' ? 'bg-[#ECC94B]/10' : 'bg-[#38B2AC]/10';

  const handleModuleSelect = (moduleId: string) => {
    onModuleChange(moduleId);
    setExpandedSub(null);
  };

  const handleSubSelect = (subId: string) => {
    onSubChange(subId);
    onClose();
  };

  // Cross-module data cards
  const dataCards = [
    { label: '总资产', value: `$${account.totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-[#CCD6F6]', module: 'trade', sub: 'real' },
    { label: '今日盈亏', value: formatUSD(account.todayPnl), color: account.todayPnl >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]', module: 'trade', sub: 'real' },
    { label: '持仓数', value: `${positions.length}`, color: 'text-[#4299E1]', module: 'trade', sub: 'real' },
    { label: '风控', value: riskLevel === 'high' ? '高风险' : riskLevel === 'medium' ? '中风险' : '低风险', color: riskColor, module: 'risk', sub: 'live_risk' },
    { label: 'VaR(95%)', value: `$${Math.abs(riskMetrics.portfolioVaR95).toLocaleString()}`, color: 'text-[#ECC94B]', module: 'risk', sub: 'quantum_risk' },
    { label: 'CPU', value: `${Math.round(systemMetrics.cpuUsage)}%`, color: systemMetrics.cpuUsage > 70 ? 'text-[#F56565]' : 'text-[#38B2AC]', module: 'admin', sub: 'monitor' },
    { label: '延迟', value: `${Math.round(systemMetrics.networkLatency)}ms`, color: systemMetrics.networkLatency > 30 ? 'text-[#ECC94B]' : 'text-[#38B2AC]', module: 'admin', sub: 'screen' },
    { label: '策略', value: `${crossModuleSummary.strategy.activeCount}活跃`, color: 'text-[#4299E1]', module: 'strategy', sub: 'manage' },
  ];

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute top-0 left-0 bottom-0 w-[88%] max-w-sm bg-[#0A192F] border-r border-[#233554] flex flex-col animate-in slide-in-from-left duration-300"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#233554] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="言语云 Logo" className="w-8 h-8 object-contain" />
            <div>
              <span className="text-white font-bold tracking-tight block">言语云量化系统</span>
              <span className="text-[10px] text-[#38B2AC] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38B2AC] animate-pulse inline-block" />
                系统运行中
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#8892B0] hover:text-white rounded-lg hover:bg-[#112240] transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Summary Card */}
        <div className="mx-4 mt-4 p-4 bg-gradient-to-br from-[#112240] to-[#0A192F] rounded-xl border border-[#233554]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-[#8892B0] uppercase tracking-widest">账户概览</span>
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full", riskBg, riskColor)}>
              {riskLevel === 'high' ? '高风险' : riskLevel === 'medium' ? '中风险' : '低风险'}
            </span>
          </div>
          <div className="text-xl font-bold text-white font-mono mb-1">
            ${account.totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className={cn("font-mono", account.todayPnl >= 0 ? "text-[#38B2AC]" : "text-[#F56565]")}>
              {formatUSD(account.todayPnl)}
            </span>
            <span className="text-[#233554]">|</span>
            <span className="text-[#8892B0]">{positions.length} 持仓</span>
            {unreadAlerts > 0 && (
              <span className="text-[#8892B0]">
                <span className="text-[#233554]">|</span>
                <span className="text-[#F56565] ml-1.5">{unreadAlerts} 预警</span>
              </span>
            )}
          </div>
        </div>

        {/* Drawer tabs */}
        <div className="flex mx-4 mt-4 bg-[#071425] rounded-lg border border-[#233554] p-0.5">
          {([
            { id: 'modules' as const, label: '功能模块' },
            { id: 'data' as const, label: '数据互通' },
            { id: 'quick' as const, label: '快捷操作' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveDrawerTab(tab.id)}
              className={cn(
                "flex-1 py-2 text-[11px] rounded-md transition-all",
                activeDrawerTab === tab.id
                  ? "bg-[#112240] text-[#38B2AC] font-bold"
                  : "text-[#8892B0]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'none' }}>
          {activeDrawerTab === 'modules' && (
            <div className="space-y-4">
              {/* Module Grid */}
              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-[#8892B0] font-bold px-1 mb-3">
                  核心功能模块
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {MODULES.map((mod) => {
                    const Icon = mod.icon;
                    const isActive = activeModule === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => handleModuleSelect(mod.id)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all active:scale-95",
                          isActive
                            ? "bg-[#112240] border-[#38B2AC]/50 text-[#38B2AC]"
                            : "bg-[#112240]/30 border-transparent text-[#8892B0] active:bg-[#112240]"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{mod.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-menus for active module */}
              {activeModule && MENUS[activeModule] && (
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-[#8892B0] font-bold px-1 mb-3 flex items-center justify-between">
                    <span>{MODULES.find(m => m.id === activeModule)?.name} - 子模块</span>
                    <span className="text-[#38B2AC] text-[8px] border border-[#38B2AC]/30 px-1.5 rounded">
                      {MENUS[activeModule].length} 
                    </span>
                  </h3>
                  <div className="space-y-1.5">
                    {MENUS[activeModule]?.map((menu: MenuItem) => (
                      <div key={menu.id}>
                        <button
                          onClick={() => {
                            if (expandedSub === menu.id) {
                              setExpandedSub(null);
                            } else {
                              setExpandedSub(menu.id);
                              onSubChange(menu.id);
                            }
                          }}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-lg transition-all active:scale-[0.98]",
                            activeSub === menu.id
                              ? "bg-[#38B2AC]/10 text-white border border-[#38B2AC]/20"
                              : "text-[#8892B0] hover:bg-[#112240] border border-transparent"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full transition-colors",
                              activeSub === menu.id ? "bg-[#38B2AC]" : "bg-[#233554]"
                            )} />
                            <span className="text-sm font-medium">{menu.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#233554]">{menu.sub?.length || 0}</span>
                            <ChevronRight className={cn(
                              "w-4 h-4 transition-transform",
                              expandedSub === menu.id && "rotate-90"
                            )} />
                          </div>
                        </button>

                        {/* Tertiary items */}
                        {expandedSub === menu.id && menu.sub && (
                          <div className="ml-5 mt-1 border-l border-[#233554] space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                            {menu.sub.map((s: string) => (
                              <button
                                key={s}
                                className="w-full text-left p-2 pl-4 text-xs text-[#8892B0] hover:text-[#38B2AC] transition-colors flex items-center gap-2 rounded-r-md hover:bg-[#38B2AC]/5 active:scale-[0.98]"
                                onClick={() => {
                                  handleSubSelect(menu.id);
                                }}
                              >
                                <div className="w-1 h-1 rounded-full bg-[#233554]" />
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeDrawerTab === 'data' && (
            <div className="space-y-4">
              {/* Cross-module data overview */}
              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-[#8892B0] font-bold px-1 mb-3 flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-[#38B2AC]" />
                  跨模块数据互通
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {dataCards.map((card, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        navigateTo(card.module, card.sub);
                        onClose();
                      }}
                      className="p-3 bg-[#112240]/50 rounded-xl border border-[#233554]/50 hover:border-[#38B2AC]/30 transition-all active:scale-[0.97] text-left"
                    >
                      <div className="text-[10px] text-[#8892B0] mb-1">{card.label}</div>
                      <div className={cn("text-sm font-mono font-bold", card.color)}>{card.value}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data flow diagram (simplified) */}
              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-[#8892B0] font-bold px-1 mb-3">
                  数据流向关系
                </h3>
                <DataFlowMini currentModule={activeModule} onNavigate={(mod) => { navigateTo(mod); onClose(); }} />
              </div>

              {/* Top mover */}
              <div className="p-3 bg-[#112240]/50 rounded-xl border border-[#233554]/50">
                <div className="text-[10px] text-[#8892B0] mb-2">市场领涨/领跌</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{crossModuleSummary.market.topMover}</span>
                  <span className={cn(
                    "text-xs font-mono font-bold",
                    crossModuleSummary.market.topMoveChange >= 0 ? "text-[#38B2AC]" : "text-[#F56565]"
                  )}>
                    {crossModuleSummary.market.topMoveChange >= 0 ? '+' : ''}{crossModuleSummary.market.topMoveChange.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeDrawerTab === 'quick' && (
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-widest text-[#8892B0] font-bold px-1 mb-3">
                快捷操作
              </h3>

              {/* Quick actions */}
              <div className="space-y-2">
                <QuickActionButton
                  icon={<Bell className="w-4 h-4" />}
                  label="智能预警中心"
                  desc={`${unreadAlerts} 条未读预警`}
                  color="text-[#F56565]"
                  onClick={() => {
                    onClose();
                    // AlertCenter is in Navbar; on mobile we might want to scroll up
                  }}
                />
                <QuickActionButton
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="快速查看行情"
                  desc="K线分析与自选面板"
                  color="text-[#4299E1]"
                  onClick={() => { navigateTo('market', 'live', 'K线分析'); onClose(); }}
                />
                <QuickActionButton
                  icon={<Zap className="w-4 h-4" />}
                  label="交易快捷下单"
                  desc="手动交易 / 委托管理"
                  color="text-[#ECC94B]"
                  onClick={() => { navigateTo('trade', 'real', '手动交易'); onClose(); }}
                />
                <QuickActionButton
                  icon={<ShieldAlert className="w-4 h-4" />}
                  label="风控实时看板"
                  desc={`风控等级: ${riskLevel === 'high' ? '高' : riskLevel === 'medium' ? '中' : '低'}`}
                  color={riskColor}
                  onClick={() => { navigateTo('risk', 'live_risk'); onClose(); }}
                />
                <QuickActionButton
                  icon={<Settings className="w-4 h-4" />}
                  label="系统设置"
                  desc="主题 / 语言 / 涨跌色"
                  color="text-[#8892B0]"
                  onClick={() => {
                    onClose();
                    document.dispatchEvent(new CustomEvent('showSettings'));
                  }}
                />
              </div>

              {/* Positions summary */}
              {positions.length > 0 && (
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-[#8892B0] font-bold px-1 mb-3">
                    当前持仓
                  </h3>
                  <div className="space-y-2">
                    {positions.map(pos => (
                      <div
                        key={pos.symbol}
                        className="p-3 bg-[#112240]/50 rounded-xl border border-[#233554]/50 flex items-center justify-between"
                        onClick={() => { navigateTo('trade', 'real', '资产监控'); onClose(); }}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{pos.symbol}</span>
                            <span className={cn(
                              "text-[8px] px-1 py-0.5 rounded",
                              pos.side === 'LONG' ? "bg-[#38B2AC]/10 text-[#38B2AC]" : "bg-[#F56565]/10 text-[#F56565]"
                            )}>
                              {pos.side}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#8892B0]">{pos.strategy}</span>
                        </div>
                        <div className="text-right">
                          <div className={cn(
                            "text-xs font-mono font-bold",
                            pos.unrealizedPnl >= 0 ? "text-[#38B2AC]" : "text-[#F56565]"
                          )}>
                            {pos.unrealizedPnl >= 0 ? '+' : ''}{pos.unrealizedPnl.toFixed(2)}
                          </div>
                          <div className={cn(
                            "text-[10px] font-mono",
                            pos.pnlPercent >= 0 ? "text-[#38B2AC]" : "text-[#F56565]"
                          )}>
                            {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#071425] border-t border-[#233554] shrink-0 space-y-2">
          <button
            onClick={() => {
              onClose();
              document.dispatchEvent(new CustomEvent('showFeasibilityReport'));
            }}
            className="w-full bg-gradient-to-r from-[#38B2AC] to-[#4299E1] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#38B2AC]/20 active:scale-[0.98] transition-transform"
          >
            查看节点可行性报告 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Quick action button component
function QuickActionButton({ icon, label, desc, color, onClick }: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 bg-[#112240]/50 rounded-xl border border-[#233554]/50 hover:border-[#38B2AC]/30 transition-all active:scale-[0.98] text-left"
    >
      <div className={cn("p-2 rounded-lg bg-[#071425]", color)}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-xs font-bold text-white">{label}</div>
        <div className="text-[10px] text-[#8892B0]">{desc}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-[#233554]" />
    </button>
  );
}

// Mini data flow diagram for mobile — canvas-based animated version
function DataFlowMini({ currentModule, onNavigate }: { currentModule: string; onNavigate: (mod: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef(0);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  // Interpolated node positions for smooth transitions
  const lerpCenterRef = useRef<{ x: number; y: number } | null>(null);
  const lerpOuterRef = useRef<{ x: number; y: number }[]>([]);
  const LERP_SPEED = 0.08; // 0..1, higher = faster convergence

  const MODULE_DATA_FLOWS: Record<string, string[]> = {
    market: ['strategy', 'risk', 'trade', 'bigdata'],
    strategy: ['market', 'model', 'quantum', 'trade'],
    risk: ['market', 'strategy', 'trade', 'quantum'],
    quantum: ['strategy', 'risk', 'model', 'bigdata'],
    bigdata: ['market', 'model', 'quantum', 'admin'],
    model: ['strategy', 'quantum', 'bigdata', 'risk'],
    trade: ['market', 'strategy', 'risk', 'model'],
    admin: ['market', 'strategy', 'risk', 'quantum', 'bigdata', 'model', 'trade'],
  };

  const MODULE_COLORS: Record<string, string> = {
    market: '#38B2AC', strategy: '#4299E1', risk: '#F56565',
    quantum: '#38B2AC', bigdata: '#4299E1', model: '#ECC94B',
    trade: '#38B2AC', admin: '#8892B0',
  };

  const connected = MODULE_DATA_FLOWS[currentModule] || [];
  const currentModuleName = MODULES.find(m => m.id === currentModule)?.name || currentModule;

  // Track HTML overlay chip positions via state for CSS-transitioned smooth movement
  const [chipPositions, setChipPositions] = useState<{ left: number; top: number }[]>([]);

  // Update chip positions whenever connected modules or container aspect changes
  useEffect(() => {
    setChipPositions(connected.map((_, i) => {
      const angle = (i / connected.length) * Math.PI * 2 - Math.PI / 2;
      const r = 34;
      return { left: 50 + Math.cos(angle) * r, top: 50 + Math.sin(angle) * r };
    }));
    // Reset lerp refs so canvas nodes animate from current position
    lerpCenterRef.current = null;
    lerpOuterRef.current = [];
  }, [currentModule, connected.length]);

  // Canvas animation — only restart when the selected module changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setupSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      if (W === sizeRef.current.w && H === sizeRef.current.h) return;
      sizeRef.current = { w: W, h: H };
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setupSize();

    // Compute target positions from current size
    const getTargets = () => {
      const W = sizeRef.current.w;
      const H = sizeRef.current.h;
      const cx = W / 2;
      const cy = H / 2;
      const radius = Math.min(W, H) * 0.34;
      const center = { x: cx, y: cy };
      const outer = connected.map((modId, i) => {
        const angle = (i / connected.length) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
      });
      return { center, outer, W, H };
    };

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    const animate = () => {
      phaseRef.current += 0.6;
      const { center: targetCenter, outer: targetOuter, W, H } = getTargets();

      // Initialize lerp positions if needed
      if (!lerpCenterRef.current) {
        lerpCenterRef.current = { ...targetCenter };
      }
      if (lerpOuterRef.current.length !== targetOuter.length) {
        // Fade-in from center for new nodes
        lerpOuterRef.current = targetOuter.map(() => ({ ...targetCenter }));
      }

      // Lerp center toward target
      lerpCenterRef.current.x = lerp(lerpCenterRef.current.x, targetCenter.x, LERP_SPEED);
      lerpCenterRef.current.y = lerp(lerpCenterRef.current.y, targetCenter.y, LERP_SPEED);

      // Lerp each outer node toward its target
      for (let i = 0; i < targetOuter.length; i++) {
        lerpOuterRef.current[i].x = lerp(lerpOuterRef.current[i].x, targetOuter[i].x, LERP_SPEED);
        lerpOuterRef.current[i].y = lerp(lerpOuterRef.current[i].y, targetOuter[i].y, LERP_SPEED);
      }

      const centerNode = lerpCenterRef.current;
      const outerNodes = lerpOuterRef.current;

      ctx.clearRect(0, 0, W, H);

      // Draw connection lines + animated particles
      outerNodes.forEach((node, idx) => {
        // Line
        ctx.beginPath();
        ctx.moveTo(centerNode.x, centerNode.y);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = 'rgba(56, 178, 172, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Animated particles along each edge
        const numParticles = 2;
        for (let p = 0; p < numParticles; p++) {
          const t = ((phaseRef.current + idx * 35 + p * 50) % 100) / 100;
          const px = centerNode.x + (node.x - centerNode.x) * t;
          const py = centerNode.y + (node.y - centerNode.y) * t;
          const alpha = Math.sin(t * Math.PI);
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 178, 172, ${0.6 * alpha})`;
          ctx.fill();
        }

        // Outer glow ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        const glowAlpha = 0.05 + 0.03 * Math.sin((phaseRef.current + idx * 20) * 0.05);
        ctx.fillStyle = `rgba(56, 178, 172, ${glowAlpha})`;
        ctx.fill();
      });

      // Center node pulsing glow
      const pulseR = 22 + 3 * Math.sin(phaseRef.current * 0.04);
      ctx.beginPath();
      ctx.arc(centerNode.x, centerNode.y, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 178, 172, 0.08)';
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // ResizeObserver to handle container size changes
    const container = containerRef.current;
    let ro: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        setupSize();
      });
      ro.observe(container);
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (ro) ro.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModule]);

  return (
    <div ref={containerRef} className="bg-[#112240]/50 rounded-xl border border-[#233554]/50 p-4 relative" style={{ minHeight: 220 }}>
      {/* Canvas layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Overlay: center node chip */}
      <div className="relative z-10 flex flex-col items-center" style={{ paddingTop: '30%' }}>
        <div className="px-4 py-2 bg-[#38B2AC]/10 border border-[#38B2AC]/50 rounded-lg text-[#38B2AC] text-xs font-bold shadow-lg shadow-[#38B2AC]/10 transition-transform duration-500">
          {currentModuleName}
        </div>
      </div>

      {/* Overlay: outer node chips with CSS transition for smooth position changes */}
      {connected.map((modId, i) => {
        const pos = chipPositions[i] || { left: 50, top: 50 };
        const modName = MODULES.find(m => m.id === modId)?.name || modId;
        return (
          <button
            key={modId}
            onClick={() => onNavigate(modId)}
            className="absolute z-10 px-2 py-1 bg-[#071425]/90 border border-[#233554] rounded-lg text-[9px] text-[#8892B0] hover:text-[#38B2AC] hover:border-[#38B2AC]/30 active:scale-95 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              transition: 'left 0.5s cubic-bezier(0.4,0,0.2,1), top 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease',
              opacity: chipPositions.length > 0 ? 1 : 0,
            }}
          >
            {modName}
          </button>
        );
      })}
    </div>
  );
}