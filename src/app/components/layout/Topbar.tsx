import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Settings, User, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function Topbar() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const getBreadcrumbName = (segment: string) => {
    const map: Record<string, string> = {
      market: '市场数据中心',
      strategy: '智能策略引擎',
      risk: '风险管控中台',
      quantum: '量子计算实验室',
      bigdata: '大数据管理平台',
      model: '量化模型工坊',
      trading: '交易执行中心',
      system: '系统管理后台',
    };
    return map[segment] || segment;
  };

  return (
    <div className="h-16 bg-primary border-b border-border flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
      <div className="flex items-center text-sm text-text-muted">
        <span className="hover:text-text-sub cursor-pointer">首页</span>
        {pathSegments.map((segment, index) => (
          <React.Fragment key={segment}>
            <ChevronRight size={14} className="mx-2" />
            <span className={clsx(
              index === pathSegments.length - 1 ? "text-text-main font-medium" : "hover:text-text-sub cursor-pointer"
            )}>
              {getBreadcrumbName(segment)}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-text-muted group-focus-within:text-accent-blue" />
          </div>
          <input 
            type="text" 
            placeholder="全站搜索 (Ctrl+K)" 
            className="bg-primary-light border border-border text-text-main text-sm rounded-md py-1.5 pl-10 pr-4 w-64 focus:outline-none focus:border-accent-blue transition-colors placeholder:text-text-muted/50"
          />
        </div>

        <button className="relative p-2 text-text-muted hover:text-text-main hover:bg-bg-hover rounded-md transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-red rounded-full ring-2 ring-primary"></span>
        </button>

        <button className="p-2 text-text-muted hover:text-text-main hover:bg-bg-hover rounded-md transition-colors">
          <Settings size={20} />
        </button>

        <div className="h-6 w-px bg-border mx-1"></div>

        <div className="flex items-center gap-3 cursor-pointer hover:bg-bg-hover p-1.5 rounded-md transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-blue to-accent-green flex items-center justify-center text-white font-bold text-xs shadow-md">
            AD
          </div>
          <div className="hidden md:block">
            <div className="text-sm text-text-main leading-none">Admin User</div>
            <div className="text-xs text-text-muted mt-0.5">超级管理员</div>
          </div>
        </div>
      </div>
    </div>
  );
}
