import React from 'react';
import { 
  TrendingUp, Cpu, Zap, ShieldAlert, 
  Menu, X, Home, Search, Star, User,
  ChevronRight, ArrowRight
} from '@/app/components/SafeIcons';
import { MODULES, MENUS } from '@/app/data/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import logoImg from "figma:asset/40025af4b8baa344842bf5c8553025808daf7909.png";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mobile Bottom Tab Bar
export const MobileTabbar = ({ activeModule, onModuleChange }: any) => {
  const tabs = [
    { id: 'market', name: '行情', icon: TrendingUp },
    { id: 'strategy', name: '策略', icon: Cpu },
    { id: 'trade', name: '交易', icon: Zap },
    { id: 'risk', name: '风控', icon: ShieldAlert },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0A192F]/95 backdrop-blur-lg border-t border-[#233554] h-16 flex items-center justify-around px-2 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeModule === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onModuleChange(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 relative",
              isActive ? "text-[#38B2AC]" : "text-[#8892B0]"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-xl transition-all",
              isActive && "bg-[#38B2AC]/10"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">{tab.name}</span>
            {isActive && (
              <div 
                className="absolute -top-px w-8 h-0.5 bg-[#38B2AC] rounded-full"
              />
            )}
          </button>
        );
      })}
      <button 
        onClick={() => document.dispatchEvent(new CustomEvent('toggleMobileDrawer'))}
        className="flex flex-col items-center gap-1 text-[#8892B0]"
      >
        <div className="p-1.5">
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-medium">更多</span>
      </button>
    </div>
  );
};

// Mobile Navigation Drawer
export const MobileDrawer = ({ 
  isOpen, 
  onClose, 
  activeModule, 
  onModuleChange,
  activeSub,
  onSubChange 
}: any) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-200"
      />
      <div
        className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[#0A192F] z-[70] lg:hidden border-r border-[#233554] flex flex-col animate-in slide-in-from-left duration-300"
      >
        <div className="p-6 border-b border-[#233554] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="言语云 Logo" className="w-8 h-8 object-contain" />
            <span className="text-white font-bold tracking-tight">言语云量化系统</span>
          </div>
          <button onClick={onClose} className="p-2 text-[#8892B0] hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-[#8892B0] font-bold px-3 mb-3">
              核心功能模块
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {MODULES.map((mod) => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      onModuleChange(mod.id);
                      // Don't close immediately if we want to show submenus
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                      isActive 
                        ? "bg-[#112240] border-[#38B2AC] text-[#38B2AC]" 
                        : "bg-[#112240]/30 border-transparent text-[#8892B0]"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{mod.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeModule && (
            <div
              key={activeModule}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <h3 className="text-[10px] uppercase tracking-widest text-[#8892B0] font-bold px-3 mb-3 flex items-center justify-between">
                <span>{MODULES.find(m => m.id === activeModule)?.name} - 详细菜单</span>
                <span className="text-[#38B2AC] text-[8px] border border-[#38B2AC]/30 px-1 rounded">2级导航</span>
              </h3>
              <div className="space-y-2">
                {MENUS[activeModule]?.map((menu) => (
                  <div key={menu.id} className="space-y-1">
                    <button
                      onClick={() => onSubChange(menu.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg transition-all",
                        activeSub === menu.id 
                          ? "bg-[#38B2AC]/10 text-white" 
                          : "text-[#8892B0] hover:bg-[#112240]"
                      )}
                    >
                      <span className="text-sm font-medium">{menu.name}</span>
                      <ChevronRight className={cn("w-4 h-4 transition-transform", activeSub === menu.id && "rotate-90")} />
                    </button>
                    
                    {activeSub === menu.id && (
                      <div
                        className="overflow-hidden ml-4 border-l border-[#233554] animate-in slide-in-from-top-2 duration-200"
                      >
                        {menu.sub.map((s: string) => (
                          <button
                            key={s}
                            className="w-full text-left p-2 text-xs text-[#8892B0] hover:text-[#38B2AC] transition-colors flex items-center gap-2"
                            onClick={onClose}
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

        <div className="p-4 bg-[#071425] border-t border-[#233554]">
           <button 
             onClick={() => {
               onClose();
               document.dispatchEvent(new CustomEvent('showFeasibilityReport'));
             }}
             className="w-full bg-gradient-to-r from-[#38B2AC] to-[#4299E1] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#38B2AC]/20"
           >
             查看节点可行性报告 <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </>
  );
};