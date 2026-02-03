import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Database, Wifi, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const DATA_SOURCES = [
  { id: 1, name: 'Binance API', type: 'WebSocket', freq: '实时', status: 'Online', latency: '45ms' },
  { id: 2, name: 'Bloomberg Terminal', type: 'REST API', freq: '1s', status: 'Online', latency: '120ms' },
  { id: 3, name: 'NSE Data Feed', type: 'Socket', freq: '实时', status: 'Offline', latency: '-' },
  { id: 4, name: 'Custom Alpha Factors', type: 'CSV Upload', freq: 'Daily', status: 'Online', latency: '-' },
];

export const DataSourceManager = () => {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Database className="text-[#38B2AC] w-5 h-5" /> 数据源列表
        </h3>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-[#112240] border border-[#233554] text-[#CCD6F6] text-xs rounded hover:text-white flex items-center gap-2">
            <RefreshCw className="w-3 h-3" /> 刷新状态
          </button>
          <button className="px-4 py-2 bg-[#4299E1] text-white text-xs rounded hover:brightness-110">
            + 接入新数据源
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {DATA_SOURCES.map((source) => (
          <Card key={source.id} className="p-4 border-t-4 border-t-[#233554] hover:border-t-[#4299E1] transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#0A192F] rounded">
                <Database className="w-6 h-6 text-[#4299E1]" />
              </div>
              <span className={`px-2 py-1 rounded text-[10px] ${
                source.status === 'Online' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#F56565]/20 text-[#F56565]'
              }`}>
                {source.status}
              </span>
            </div>
            <h4 className="text-white font-bold mb-1">{source.name}</h4>
            <p className="text-xs text-[#8892B0] mb-4">{source.type} • {source.freq}</p>
            
            <div className="flex justify-between items-center text-xs border-t border-[#233554] pt-3">
              <span className="text-[#8892B0] flex items-center gap-1">
                <Wifi className="w-3 h-3" /> {source.latency}
              </span>
              <button className="text-[#4299E1] hover:underline">配置</button>
            </div>
          </Card>
        ))}
        
        <button className="border-2 border-dashed border-[#233554] rounded-lg flex flex-col items-center justify-center text-[#8892B0] hover:text-[#CCD6F6] hover:border-[#4299E1] transition-all min-h-[160px]">
          <span className="text-2xl mb-2">+</span>
          <span className="text-sm">自定义数据接入</span>
        </button>
      </div>

      <Card className="flex-1 p-6">
        <h4 className="text-white font-bold mb-4">连接日志</h4>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex gap-4 text-[#8892B0]">
            <span>10:24:55</span>
            <span className="text-[#38B2AC]">[INFO]</span>
            <span>Connected to Binance WebSocket stream wss://stream.binance.com:9443</span>
          </div>
          <div className="flex gap-4 text-[#8892B0]">
            <span>10:24:56</span>
            <span className="text-[#ECC94B]">[WARN]</span>
            <span>NSE Data Feed connection timeout (Attempt 2/3)</span>
          </div>
          <div className="flex gap-4 text-[#8892B0]">
            <span>10:24:58</span>
            <span className="text-[#F56565]">[ERR ]</span>
            <span>NSE Data Feed unreachable. Switching to backup node.</span>
          </div>
        </div>
      </Card>
    </div>
  );
};