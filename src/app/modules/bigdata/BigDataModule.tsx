import React from 'react';
import { DataSourceManager } from './DataSourceManager';
import { DataCollection } from './DataCollection';
import { StorageManager } from './StorageManager';
import { DataProcessing } from './DataProcessing';
import { QualityMonitor } from './QualityMonitor';
import { DataSharing } from './DataSharing';
import { Layers } from 'lucide-react';

interface BigDataModuleProps {
  activeSub: string;
}

export const BigDataModule = ({ activeSub }: BigDataModuleProps) => {
  switch (activeSub) {
    case 'data_source':
      return <DataSourceManager />;
    case 'collection':
      return <DataCollection />;
    case 'storage':
      return <StorageManager />;
    case 'process':
      return <DataProcessing />;
    case 'quality':
      return <QualityMonitor />;
    case 'share':
      return <DataSharing />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-[#8892B0]">
          <Layers className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-xl font-medium">大数据管理平台</h3>
          <p className="text-sm mt-2">当前子模块: {activeSub}</p>
        </div>
      );
  }
};