import React from 'react';
// import { 
//   Search, Bell, User, Activity, Menu 
// } from '@/app/components/SafeIcons';
import { useTranslation } from '@/app/i18n/mock';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MODULES } from '@/app/data/navigation';
// import { AlertCenter } from './AlertCenter';
import logoImg from "figma:asset/40025af4b8baa344842bf5c8553025808daf7909.png";

// Inline icons to prevent import issues
const Search = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const Bell = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const User = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const Activity = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const Menu = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Navbar = ({ activeModule, setActiveModule }: any) => {
  const { t } = useTranslation();
  
  return (
    <nav className="h-16 bg-[#0A192F] border-b border-[#233554] flex items-center px-4 lg:px-6 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-2 lg:gap-3 mr-4 lg:mr-12 shrink-0 cursor-pointer" onClick={() => setActiveModule('market')}>
        <img src={logoImg} alt="言语云 Logo" className="w-8 h-8 object-contain" />
        <span className="text-lg lg:text-xl font-bold text-white tracking-wider">言语云量化</span>
      </div>
      
      {/* Desktop Navigation Modules */}
      <div className="hidden lg:flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveModule(m.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md transition-all whitespace-nowrap",
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
      <div className="flex items-center gap-2 lg:gap-4 ml-auto lg:ml-6">
        <div className="hidden md:relative md:group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892B0]" />
          <input 
            type="text" 
            placeholder="搜索行情/策略/功能..." 
            className="bg-[#071425] border border-[#233554] rounded-full py-1.5 pl-9 pr-4 text-xs lg:text-sm text-[#CCD6F6] focus:outline-none focus:border-[#4299E1] w-32 lg:w-48 transition-all focus:w-64"
          />
        </div>
        
        {/* <AlertCenter /> */}
        <button className="relative p-2 text-[#8892B0] hover:text-[#CCD6F6] transition-colors rounded-full hover:bg-[#112240]">
          <Bell className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2 pl-2 lg:pl-4 border-l border-[#233554]">
          <div className="w-7 h-7 lg:w-8 h-8 bg-[#112240] rounded-full border border-[#233554] flex items-center justify-center overflow-hidden">
            <User className="w-4 h-4 text-[#CCD6F6]" />
          </div>
          <span className="text-sm text-[#CCD6F6] font-medium hidden lg:block">管理员</span>
        </div>
      </div>
    </nav>
  );
};