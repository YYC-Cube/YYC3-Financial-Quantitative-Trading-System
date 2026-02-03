import React from 'react';
import { ModelLibrary } from './ModelLibrary';
import { SmartTrain } from './SmartTrain';
import { ModelEvaluation } from './ModelEvaluation';
import { DeploymentMonitor } from './DeploymentMonitor';
import { CustomDev } from './CustomDev';
import { ModelApplication } from './ModelApplication';
import { Layers } from 'lucide-react';

interface ModelModuleProps {
  activeSub: string;
}

export const ModelModule = ({ activeSub }: ModelModuleProps) => {
  switch (activeSub) {
    case 'library':
      return <ModelLibrary />;
    case 'train':
      return <SmartTrain />;
    case 'eval':
      return <ModelEvaluation />;
    case 'deploy':
      return <DeploymentMonitor />;
    case 'dev':
      return <CustomDev />;
    case 'app':
      return <ModelApplication />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-[#8892B0]">
          <Layers className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-xl font-medium">量化模型工坊</h3>
          <p className="text-sm mt-2">当前子模块: {activeSub}</p>
        </div>
      );
  }
};