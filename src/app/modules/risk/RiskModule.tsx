import React from 'react';
import { QuantumRisk } from './QuantumRisk';
import { BigDataRisk } from './BigDataRisk';
import { RiskView } from './RiskView'; // Reusing LiveRisk view
import { RiskWarning } from './RiskWarning';
import { RiskReport } from './RiskReport';
import { HedgingTools } from './HedgingTools';
import { Layers } from 'lucide-react';

interface RiskModuleProps {
  activeSub: string;
}

export const RiskModule = ({ activeSub }: RiskModuleProps) => {
  switch (activeSub) {
    case 'quantum_risk':
      return <QuantumRisk />;
    case 'bigdata_risk':
      return <BigDataRisk />;
    case 'live_risk':
      return <RiskView />;
    case 'warning':
      return <RiskWarning />;
    case 'report':
      return <RiskReport />;
    case 'hedging':
      return <HedgingTools />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-[#8892B0]">
          <Layers className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-xl font-medium">功能模块加载中...</h3>
          <p className="text-sm mt-2">当前模块: {activeSub}</p>
        </div>
      );
  }
};