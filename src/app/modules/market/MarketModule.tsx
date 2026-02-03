import React from 'react';
import { GlobalQuotes } from './components/GlobalQuotes';
import { CustomPanel } from './components/CustomPanel';
import { KLineAnalysis } from './components/KLineAnalysis';
import { Layers } from 'lucide-react';

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
            <h3 className="text-xl font-bold text-white">Multi-Screen Linkage</h3>
            <p className="text-sm mt-2 max-w-md text-center">
              Connect multiple monitors or browser windows to synchronize ticker selection and timeframes across all active charts.
            </p>
            <button className="mt-6 px-6 py-2 bg-[#38B2AC] text-white font-bold rounded hover:brightness-110">
              Start Linkage Session
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
      <h3 className="text-xl font-medium">Market Module - {activeSub}</h3>
      <p className="text-sm mt-2">Sub-module under construction</p>
    </div>
  );
};

export default MarketModule;