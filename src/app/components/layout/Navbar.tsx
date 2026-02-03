import React from 'react';
import { 
  Search, Bell, User, Activity, Menu 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MODULES } from '@/app/data/navigation';
import logoImg from "figma:asset/40025af4b8baa344842bf5c8553025808daf7909.png";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Navbar = ({ activeModule, setActiveModule }: any) => {
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
            <m.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{m.name}</span>
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
        
        <button className="text-[#8892B0] hover:text-white p-2 relative">
          <Bell className="w-4 h-4 lg:w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F56565] rounded-full animate-pulse" />
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
