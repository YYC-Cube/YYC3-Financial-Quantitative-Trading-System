import React from 'react';
// import { ChevronRight } from '@/app/components/SafeIcons';
import { MODULES, MENUS } from '@/app/data/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';

// Inline ChevronRight to avoid import issues
type IconProps = React.SVGProps<SVGSVGElement>;

const ChevronRight = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar = ({ module, activeSub, setActiveSub, activeTertiary, setActiveTertiary }: {
  module: string;
  activeSub: string;
  setActiveSub: (sub: string) => void;
  activeTertiary: string;
  setActiveTertiary: (tertiary: string) => void;
}) => {
  const activeMenus = MENUS[module] || MENUS.market;

  return (
    <aside className="w-64 bg-[#0A192F] border-r border-[#233554] fixed left-0 top-16 bottom-0 flex flex-col z-40">
      <div className="p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {activeMenus.map((menu) => (
          <div key={menu.id} className="mb-2">
            <button
              onClick={() => setActiveSub(menu.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md transition-all group",
                activeSub === menu.id ? "bg-[#112240] text-white border-l-2 border-[#38B2AC]" : "text-[#8892B0] hover:bg-[#112240]/50 hover:text-[#CCD6F6]"
              )}
            >
              <span className="text-sm font-semibold">{menu.name}</span>
              <ChevronRight className={cn("w-4 h-4 transition-transform", activeSub === menu.id && "rotate-90")} />
            </button>
            {activeSub === menu.id && (
              <div 
                className="mt-1 ml-4 space-y-1 border-l border-[#233554]"
              >
                {menu.sub?.map((s: string) => (
                  <button 
                    key={s} 
                    onClick={() => setActiveTertiary && setActiveTertiary(s)}
                    className={cn(
                      "w-full text-left px-4 py-1.5 text-xs transition-colors rounded-r-sm",
                      activeTertiary === s ? "text-[#38B2AC] font-medium bg-[#38B2AC]/10" : "text-[#8892B0] hover:text-[#4299E1] hover:bg-[#112240]/30"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-auto p-4 border-t border-[#233554] bg-[#071425]/50 backdrop-blur-sm">
        <SidebarSystemStatus />
      </div>
    </aside>
  );
};

// Extracted to a separate component so it can use hooks
function SidebarSystemStatus() {
  const { systemMetrics } = useGlobalData();
  return (
    <div className="contents">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] text-[#8892B0] uppercase tracking-wider">系统资源状态</span>
        <span className="text-[10px] text-[#38B2AC] flex items-center gap-1">
           <span className="w-1.5 h-1.5 rounded-full bg-[#38B2AC] animate-pulse"/> 正常
        </span>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-[10px] text-[#CCD6F6] mb-1">
            <span>核心算力 (CPU)</span>
            <span>{Math.round(systemMetrics.cpuUsage)}%</span>
          </div>
          <div className="h-1 bg-[#233554] rounded-full overflow-hidden">
            <div className="h-full bg-[#4299E1] transition-all duration-500" style={{ width: `${systemMetrics.cpuUsage}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-[#CCD6F6] mb-1">
            <span>系统内存 (RAM)</span>
            <span>{Math.round(systemMetrics.memoryUsage)}%</span>
          </div>
          <div className="h-1 bg-[#233554] rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${systemMetrics.memoryUsage > 75 ? 'bg-[#F56565]' : 'bg-[#ECC94B]'}`} style={{ width: `${systemMetrics.memoryUsage}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-[#CCD6F6] mb-1">
            <span>网络延迟</span>
            <span>{Math.round(systemMetrics.networkLatency)}ms</span>
          </div>
          <div className="h-1 bg-[#233554] rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${systemMetrics.networkLatency > 30 ? 'bg-[#ECC94B]' : 'bg-[#38B2AC]'}`} style={{ width: `${Math.min(100, systemMetrics.networkLatency * 2)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}