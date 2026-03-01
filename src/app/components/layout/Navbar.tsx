import React, { useState, useRef, useEffect } from 'react';
// import { 
//   Search, Bell, User, Activity, Menu 
// } from '@/app/components/SafeIcons';
import { useTranslation } from '@/app/i18n/mock';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MODULES } from '@/app/data/navigation';
import { AlertCenter } from './AlertCenter';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';
import logoImg from "figma:asset/40025af4b8baa344842bf5c8553025808daf7909.png";

// Inline icons to prevent import issues
type IconProps = React.SVGProps<SVGSVGElement>;

const Search = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const User = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const Activity = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const Menu = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const BotIcon = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7v1H3v-1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zM7 17h.01M17 17h.01M7 21h10" /><circle cx="9" cy="13" r="1" fill="currentColor" /><circle cx="15" cy="13" r="1" fill="currentColor" /></svg>;
const SignalIcon = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 20V4" /></svg>;
const Settings = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ChevronDown = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" /></svg>;
const FileText = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" strokeWidth={2} /><line x1="16" y1="17" x2="8" y2="17" strokeWidth={2} /></svg>;
const LogOut = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Admin dropdown with integrated settings
function AdminDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 0);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick); };
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-2 lg:pl-3 border-l border-[#233554] hover:bg-[#112240]/50 rounded-r-lg py-1.5 pr-2 transition-colors"
      >
        <div className="w-7 h-7 lg:w-8 lg:h-8 bg-[#112240] rounded-full border border-[#233554] flex items-center justify-center overflow-hidden">
          <User className="w-4 h-4 text-[#CCD6F6]" />
        </div>
        <span className="text-sm text-[#CCD6F6] font-medium hidden lg:block">管理员</span>
        <ChevronDown className={cn("w-3 h-3 text-[#8892B0] transition-transform hidden lg:block", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-52 bg-[#0A192F] border border-[#233554] rounded-xl shadow-2xl z-[100] overflow-hidden py-1"
          style={{ animation: 'fadeSlideDown 0.15s ease-out' }}
        >
          <style>{`
            @keyframes fadeSlideDown {
              from { opacity: 0; transform: translateY(-6px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div className="px-4 py-3 border-b border-[#233554]">
            <div className="text-xs font-bold text-white">Admin</div>
            <div className="text-[10px] text-[#8892B0]">admin@yanyucloud.com</div>
          </div>
          <button
            onClick={() => { setIsOpen(false); document.dispatchEvent(new CustomEvent('showSettings')); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#CCD6F6] hover:bg-[#112240] transition-colors"
          >
            <Settings className="w-4 h-4 text-[#8892B0]" />
            系统设置
          </button>
          <button
            onClick={() => { setIsOpen(false); document.dispatchEvent(new CustomEvent('showFeasibilityReport')); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#CCD6F6] hover:bg-[#112240] transition-colors"
          >
            <FileText className="w-4 h-4 text-[#8892B0]" />
            节点可行性报告
          </button>
          <div className="border-t border-[#233554] mt-1 pt-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#F56565]/70 hover:bg-[#F56565]/5 transition-colors">
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Signal strength indicator
function SignalIndicator() {
  const { systemMetrics } = useGlobalData();
  const latency = systemMetrics.networkLatency;
  const signalLevel = latency < 15 ? 4 : latency < 25 ? 3 : latency < 35 ? 2 : 1;
  const signalColor = signalLevel >= 3 ? '#38B2AC' : signalLevel === 2 ? '#ECC94B' : '#F56565';

  return (
    <button
      className="relative p-2 text-[#8892B0] hover:text-[#CCD6F6] transition-colors rounded-full hover:bg-[#112240] group"
      title={`网络信号: ${Math.round(latency)}ms | ${signalLevel >= 3 ? '优良' : signalLevel === 2 ? '一般' : '较差'}`}
    >
      <SignalIcon className="w-5 h-5" style={{ color: signalColor }} />
      <span
        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0A192F]"
        style={{ backgroundColor: signalColor }}
      />
      {/* Tooltip */}
      <div className="absolute top-full right-0 mt-1 px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-lg shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[#8892B0]">延迟</span>
          <span className="font-mono" style={{ color: signalColor }}>{Math.round(latency)}ms</span>
          <span className="text-[#233554]">|</span>
          <span className="text-[#8892B0]">连接</span>
          <span className="text-[#38B2AC] font-mono">{systemMetrics.activeConnections}</span>
        </div>
      </div>
    </button>
  );
}

export const Navbar = ({ activeModule, setActiveModule }: { activeModule: string; setActiveModule: (mod: string) => void }) => {
  const { t } = useTranslation();
  const { alertCount, systemMetrics, account, formatUSD, dataSource } = useGlobalData();
  
  return (
    <nav className="h-16 bg-[#0A192F] border-b border-[#233554] flex items-center px-4 lg:px-6 fixed top-0 left-0 right-0 z-50">
      {/* Logo + AI Button */}
      <div className="flex items-center gap-2 lg:gap-3 mr-4 lg:mr-12 shrink-0 relative">
        <div
          className="relative cursor-pointer group"
          onClick={() => setActiveModule('market')}
        >
          <img src={logoImg} alt="言语云 Logo" className="w-8 h-8 object-contain" />
          {/* AI floating badge on logo */}
          <button
            onClick={(e) => { e.stopPropagation(); document.dispatchEvent(new CustomEvent('toggleAIAssistant')); }}
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-[#9F7AEA] to-[#4299E1] rounded-full flex items-center justify-center shadow-lg border border-[#0A192F] hover:scale-125 transition-transform z-10"
            title="AI 交易助手"
            style={{ animation: 'aiBadgePulse 2s ease-in-out infinite' }}
          >
            <style>{`
              @keyframes aiBadgePulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(159,122,234,0.5); }
                50% { box-shadow: 0 0 6px 3px rgba(66,153,225,0.4); }
              }
            `}</style>
            <span className="text-[7px] font-bold text-white leading-none">AI</span>
          </button>
        </div>
        <span className="text-lg lg:text-xl font-bold text-white tracking-wider">言语云量化</span>
      </div>
      
      {/* Desktop Navigation Modules */}
      <div className="hidden lg:flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveModule(m.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md transition-all whitespace-nowrap relative",
              activeModule === m.id 
                ? "bg-[#112240] text-white shadow-sm border border-[#233554]" 
                : "text-[#8892B0] hover:text-[#CCD6F6] hover:bg-[#112240]/50"
            )}
          >
            {m.icon ? <m.icon className="w-4 h-4" /> : <Activity className="w-4 h-4 text-red-500" />}
            <span className="text-sm font-medium">{t(`nav.${m.id}`)}</span>
          </button>
        ))}
      </div>

      {/* Mobile Indicator */}
      <div className="lg:hidden flex-1 flex items-center justify-center">
        <div className="px-3 py-1 bg-[#112240] border border-[#233554] rounded-full text-[10px] text-[#38B2AC] font-bold uppercase tracking-widest">
           {MODULES.find(m => m.id === activeModule)?.name}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 lg:gap-3 ml-auto lg:ml-6">
        {/* Live PnL indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-[#071425] border border-[#233554] rounded-full">
          <span className="text-[10px] text-[#8892B0]">今日</span>
          <span className={`text-xs font-mono ${account.todayPnl >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
            {formatUSD(account.todayPnl)}
          </span>
        </div>

        {/* Data Source Badge: LIVE (green) / SIM (yellow) / ... (connecting) */}
        <div
          className={cn(
            "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold tracking-wider cursor-default",
            dataSource === 'connected'
              ? "bg-[#38B2AC]/10 border-[#38B2AC]/40 text-[#38B2AC]"
              : dataSource === 'connecting'
              ? "bg-[#4299E1]/10 border-[#4299E1]/40 text-[#4299E1]"
              : "bg-[#ECC94B]/10 border-[#ECC94B]/40 text-[#ECC94B]"
          )}
          title={
            dataSource === 'connected' ? 'Binance WebSocket 实时数据'
            : dataSource === 'connecting' ? '正在连接 Binance...'
            : '模拟数据 (Binance 连接不可用时自动降级)'
          }
        >
          <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            dataSource === 'connected' ? "bg-[#38B2AC] animate-pulse" : dataSource === 'connecting' ? "bg-[#4299E1] animate-pulse" : "bg-[#ECC94B]"
          )} />
          {dataSource === 'connected' ? 'LIVE' : dataSource === 'connecting' ? '...' : 'SIM'}
        </div>

        {/* System health dot */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#071425] border border-[#233554]" title={`CPU ${Math.round(systemMetrics.cpuUsage)}% | 延迟 ${Math.round(systemMetrics.networkLatency)}ms`}>
          <span className={`w-1.5 h-1.5 rounded-full ${systemMetrics.cpuUsage > 70 ? 'bg-[#F56565] animate-pulse' : systemMetrics.cpuUsage > 50 ? 'bg-[#ECC94B]' : 'bg-[#38B2AC]'}`} />
          <span className="text-[10px] text-[#8892B0] font-mono">{Math.round(systemMetrics.networkLatency)}ms</span>
        </div>

        <div className="hidden md:block relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892B0]" />
          <input 
            type="text" 
            placeholder="搜索行情/策略/功能..." 
            className="bg-[#071425] border border-[#233554] rounded-full py-1.5 pl-9 pr-4 text-xs lg:text-sm text-[#CCD6F6] focus:outline-none focus:border-[#4299E1] w-32 lg:w-48 transition-all focus:w-64"
          />
        </div>
        
        {/* Alert bell with badge - AlertCenter dropdown */}
        <AlertCenter />

        {/* Signal Indicator - between alerts and admin */}
        <SignalIndicator />

        {/* Quick Settings Button */}
        <button
          onClick={() => document.dispatchEvent(new CustomEvent('showSettings'))}
          className="p-2 text-[#8892B0] hover:text-[#CCD6F6] transition-colors rounded-full hover:bg-[#112240] hidden sm:flex"
          title="系统设置"
        >
          <Settings className="w-5 h-5" />
        </button>
        
        {/* Admin dropdown with integrated settings */}
        <AdminDropdown />
      </div>
    </nav>
  );
};