import React from 'react';
import { RealTrading } from './RealTrading';
import { SimulatedTrading } from './SimulatedTrading';
import { TradePlan } from './TradePlan';
import { TradeLogs } from './TradeLogs';
import { Layers } from 'lucide-react';

interface TradeModuleProps {
  activeSub: string;
  activeTertiary?: string;
}

export const TradeModule = ({ activeSub, activeTertiary }: TradeModuleProps) => {
  switch (activeSub) {
    case 'real':
      return <RealTrading subView={activeTertiary || 'asset'} />;
    case 'auto':
      return <RealTrading subView="自动交易" />;
    case 'sim':
      return <SimulatedTrading />;
    case 'plan':
      return <TradePlan />;
    case 'logs':
      return <TradeLogs />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-[#8892B0]">
          <Layers className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-xl font-medium">交易执行中心</h3>
          <p className="text-sm mt-2">当前子模块: {activeSub}</p>
        </div>
      );
  }
};