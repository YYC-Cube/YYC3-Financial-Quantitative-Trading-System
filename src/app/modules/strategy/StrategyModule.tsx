import React from 'react';
import { StrategyEditor } from './components/StrategyEditor';
import { Backtest } from './Backtest';

interface StrategyModuleProps {
  activeSub: string;
  onNavigate: (page: string) => void;
}

export const StrategyModule = ({ activeSub, onNavigate }: StrategyModuleProps) => {
  const renderContent = () => {
    switch (activeSub) {
      case 'edit':
        return <StrategyEditor />;
      case 'backtest':
        return <Backtest />;
      case 'optimize':
        return (
          <div className="flex flex-col items-center justify-center h-full text-[#8892B0]">
            <BrainCircuit className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-medium">Strategy Optimization</h3>
            <p className="text-sm mt-2">AI-driven parameter optimization.</p>
          </div>
        );
      case 'simulation':
        return (
          <div className="flex flex-col items-center justify-center h-full text-[#8892B0]">
            <TestTube2 className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-medium">Paper Trading</h3>
            <p className="text-sm mt-2">Monitor real-time simulation performance.</p>
          </div>
        );
      case 'library':
        return (
          <div className="flex flex-col items-center justify-center h-full text-[#8892B0]">
            <Library className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-medium">Strategy Library</h3>
            <p className="text-sm mt-2">Manage versioning and sharing.</p>
          </div>
        );
      default:
        return <StrategyEditor />;
    }
  };

  return (
    <div className="h-full p-6">
      {renderContent()}
    </div>
  );
};

export default StrategyModule;