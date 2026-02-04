import React from 'react';
import { GlobalQuotes } from './components/GlobalQuotes';
import { CustomPanel } from './components/CustomPanel';
import { KLineAnalysis } from './components/KLineAnalysis';
// import { Layers } from '@/app/components/SafeIcons';

const Layers = ({ className = "w-4 h-4", ...props }: any) => (
  <svg className={className} {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

interface MarketModuleProps {
  activeSub: string;
  activeTertiary?: string;
  onNavigate: (page: string) => void;
}

export const MarketModule = ({ activeSub, activeTertiary, onNavigate }: MarketModuleProps) => {
  if (activeSub === 'live') {
    switch (activeTertiary) {
      case '全球行情':
        return <GlobalQuotes />;
      case '自定义面板':
        return <CustomPanel />;
      case 'K线分析':
        return <KLineAnalysis />;
      case '行情联动':
        return (
          <div className="flex flex-col items-center justify-center h-full text-[#8892B0] bg-[#112240]/20 rounded border border-[#233554] border-dashed">
            <Layers className="w-16 h-16 mb-4 opacity-50 text-[#38B2AC]" />
            <h3 className="text-xl font-bold text-white">多屏行情联动</h3>
            <p className="text-sm mt-2 max-w-md text-center">
              连接多个显示器或浏览器窗口，在所有活动图表中同步股票选择和时间周期。
            </p>
            <button className="mt-6 px-6 py-2 bg-[#38B2AC] text-white font-bold rounded hover:brightness-110">
              开启联动会话
            </button>
          </div>
        );
      default:
        return <GlobalQuotes />;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-[#8892B0]">
      <Layers className="w-16 h-16 mb-4 opacity-20" />
      <h3 className="text-xl font-medium">市场模块 - {activeSub}</h3>
      <p className="text-sm mt-2">子模块正在开发中</p>
    </div>
  );
};

export default MarketModule;