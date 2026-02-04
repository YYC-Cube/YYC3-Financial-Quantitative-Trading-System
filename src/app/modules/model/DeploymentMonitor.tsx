import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Server, Activity, Power, AlertTriangle } from '@/app/components/SafeIcons';

export const DeploymentMonitor = () => {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-6">
        {[
          { id: 'node-01', name: 'Inference Node A', status: 'Running', load: '45%', lat: '12ms' },
          { id: 'node-02', name: 'Inference Node B', status: 'Running', load: '62%', lat: '15ms' },
          { id: 'node-03', name: 'Quantum Bridge', status: 'Warning', load: '92%', lat: '450ms' },
        ].map((node) => (
          <Card key={node.id} className="p-6 border-l-4 border-l-[#38B2AC] hover:bg-[#112240] transition-colors">
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3">
                 <Server className="w-8 h-8 text-[#CCD6F6]" />
                 <div>
                   <h4 className="text-white font-bold">{node.name}</h4>
                   <p className="text-xs text-[#8892B0] font-mono">{node.id}</p>
                 </div>
               </div>
               <span className={`px-2 py-1 rounded text-xs ${
                 node.status === 'Running' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#ECC94B]/20 text-[#ECC94B]'
               }`}>
                 {node.status}
               </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#233554]">
               <div>
                 <p className="text-[10px] text-[#8892B0]">CPU Load</p>
                 <div className="flex items-center gap-2">
                   <div className="flex-1 h-1.5 bg-[#0A192F] rounded-full overflow-hidden">
                     <div className="h-full bg-[#4299E1]" style={{ width: node.load }} />
                   </div>
                   <span className="text-xs text-white">{node.load}</span>
                 </div>
               </div>
               <div>
                 <p className="text-[10px] text-[#8892B0]">Avg Latency</p>
                 <span className="text-xs text-white flex items-center gap-1">
                   <Activity className="w-3 h-3 text-[#38B2AC]" /> {node.lat}
                 </span>
               </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex-1 p-6 flex flex-col">
        <h4 className="text-white font-bold mb-6">已部署模型列表</h4>
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-[#0A192F] text-xs text-[#8892B0]">
              <tr>
                <th className="py-3 px-4 text-left">模型名称</th>
                <th className="py-3 px-4 text-left">版本</th>
                <th className="py-3 px-4 text-left">运行环境</th>
                <th className="py-3 px-4 text-left">调用次数 (24h)</th>
                <th className="py-3 px-4 text-left">健康度</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { name: 'BTC-Alpha-Pred', ver: 'v2.1.0', env: 'GPU Cluster', calls: '2.4M', health: '100%' },
                { name: 'Sentiment-Analyzer', ver: 'v1.0.5', env: 'CPU Node', calls: '450k', health: '98%' },
                { name: 'Risk-VaR-Calc', ver: 'v3.2.1', env: 'Quantum Cloud', calls: '12k', health: '95%' },
              ].map((m, i) => (
                <tr key={i} className="border-b border-[#233554]/50">
                  <td className="py-3 px-4 text-white font-medium">{m.name}</td>
                  <td className="py-3 px-4 text-[#8892B0]">{m.ver}</td>
                  <td className="py-3 px-4 text-[#CCD6F6]">{m.env}</td>
                  <td className="py-3 px-4 text-[#CCD6F6] font-mono">{m.calls}</td>
                  <td className="py-3 px-4 text-[#38B2AC]">{m.health}</td>
                  <td className="py-3 px-4 text-right flex justify-end gap-2">
                     <button className="p-1.5 hover:bg-[#233554] rounded text-[#F56565]" title="Stop"><Power className="w-4 h-4" /></button>
                     <button className="p-1.5 hover:bg-[#233554] rounded text-[#ECC94B]" title="Restart"><Activity className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};