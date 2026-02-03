import React from 'react';
import { SystemConfig } from './SystemConfig';
import { AuthManager } from './AuthManager';
import { LogMonitor } from './LogMonitor';
import { BackupManager } from './BackupManager';
import { PluginManager } from './PluginManager';
import { SystemDashboard } from './SystemDashboard';
import { Layers } from 'lucide-react';

interface AdminModuleProps {
  activeSub: string;
}

export const AdminModule = ({ activeSub }: AdminModuleProps) => {
  switch (activeSub) {
    case 'sys':
      return <SystemConfig />;
    case 'auth':
      return <AuthManager />;
    case 'monitor':
      return <LogMonitor />;
    case 'backup':
      return <BackupManager />;
    case 'plugin':
      return <PluginManager />;
    case 'screen':
      return <SystemDashboard />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-[#8892B0]">
          <Layers className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-xl font-medium">系统管理后台</h3>
          <p className="text-sm mt-2">当前子模块: {activeSub}</p>
        </div>
      );
  }
};