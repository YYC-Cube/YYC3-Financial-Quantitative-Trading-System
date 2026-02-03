import React from 'react';
import { ResourceMonitor } from './ResourceMonitor';
import { AlgoConfig } from './AlgoConfig';
import { QuantApps } from './QuantApps';
import { ResultAnalysis } from './ResultAnalysis';
import { Security } from './Security';
import { ExperimentWorkshop } from './ExperimentWorkshop';
import { Layers } from 'lucide-react';

interface QuantumModuleProps {
  activeSub: string;
}

export const QuantumModule = ({ activeSub }: QuantumModuleProps) => {
  switch (activeSub) {
    case 'resource':
      return <ResourceMonitor />;
    case 'algo':
      return <AlgoConfig />;
    case 'apps':
      return <QuantApps />;
    case 'analysis':
      return <ResultAnalysis />;
    case 'security':
      return <Security />;
    case 'workshop':
      return <ExperimentWorkshop />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-[#8892B0]">
          <Layers className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-xl font-medium">量子实验室模块</h3>
          <p className="text-sm mt-2">当前子模块: {activeSub}</p>
        </div>
      );
  }
};