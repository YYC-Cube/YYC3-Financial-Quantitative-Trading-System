import React from 'react';
// import { Layers } from '@/app/components/SafeIcons';

const Layers = ({ className = "w-4 h-4", ...props }: any) => (
  <svg className={className} {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export const ModelModule = ({ activeSub }: { activeSub: string }) => {
  const renderContent = () => {
    switch (activeSub) {
      case 'library':
      case 'train':
      case 'eval':
      case 'deploy':
      case 'dev':
      case 'app':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-[#8892B0]">
            <Layers className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-medium">Model Workshop: {activeSub}</h3>
            <p className="text-sm mt-2">Module is under development.</p>
          </div>
        );
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

  return <div className="p-6">{renderContent()}</div>;
};