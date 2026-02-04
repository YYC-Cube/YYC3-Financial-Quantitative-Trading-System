import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Share2, Lock, Globe, Users } from '@/app/components/SafeIcons';

export const DataSharing = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <Card className="col-span-8 p-6 flex flex-col">
        <h4 className="text-white font-bold mb-6 flex items-center gap-2">
          <Share2 className="text-[#38B2AC]" /> 数据资源库 (Shared Resources)
        </h4>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          {['Alpha Factor V2', 'L2 Orderbook History', 'Macro Econ Data', 'Sentiment Analysis', 'User Behavior Logs'].map((item, i) => (
            <div key={i} className="p-4 bg-[#0A192F] border border-[#233554] rounded hover:border-[#4299E1] cursor-pointer transition-colors">
              <div className="flex justify-between mb-2">
                 <div className="p-1.5 bg-[#112240] rounded text-[#4299E1]"><Globe className="w-4 h-4"/></div>
                 <span className="text-[10px] text-[#38B2AC] bg-[#38B2AC]/10 px-1.5 py-0.5 rounded">Public</span>
              </div>
              <h5 className="text-sm font-bold text-white mb-1">{item}</h5>
              <p className="text-xs text-[#8892B0]">Last updated: 2h ago</p>
            </div>
          ))}
          <div className="p-4 border-2 border-dashed border-[#233554] rounded flex items-center justify-center text-[#8892B0] hover:text-[#CCD6F6] hover:border-[#CCD6F6] cursor-pointer">
            + 发布新资源
          </div>
        </div>

        <h4 className="text-white font-bold mb-4 mt-auto">API 接口管理</h4>
        <div className="overflow-auto max-h-48">
          <table className="w-full">
            <thead className="text-xs text-[#8892B0] border-b border-[#233554]">
              <tr>
                 <th className="py-2 text-left">Endpoint</th>
                 <th className="py-2 text-left">Method</th>
                 <th className="py-2 text-left">Calls (24h)</th>
                 <th className="py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-[#233554]/50">
                <td className="py-3 font-mono text-[#CCD6F6]">/api/v1/market/tick</td>
                <td className="py-3"><span className="text-[#38B2AC]">GET</span></td>
                <td className="py-3">1,240,500</td>
                <td className="py-3"><span className="w-2 h-2 bg-[#38B2AC] rounded-full inline-block"/> Normal</td>
              </tr>
              <tr className="border-b border-[#233554]/50">
                <td className="py-3 font-mono text-[#CCD6F6]">/api/v1/trade/execute</td>
                <td className="py-3"><span className="text-[#ECC94B]">POST</span></td>
                <td className="py-3">450</td>
                <td className="py-3"><span className="w-2 h-2 bg-[#38B2AC] rounded-full inline-block"/> Normal</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="col-span-4 p-6">
        <h4 className="text-white font-bold mb-6 flex items-center gap-2">
          <Lock className="text-[#ECC94B]" /> 权限控制
        </h4>
        <div className="space-y-4">
          {[
            { role: 'Quant Researcher', users: 12, access: ['Read Only', 'Download'] },
            { role: 'Data Engineer', users: 4, access: ['Full Access', 'Write', 'Delete'] },
            { role: 'Trader', users: 8, access: ['Read Only', 'Real-time API'] },
          ].map((role, i) => (
            <div key={i} className="p-4 bg-[#0A192F] rounded border border-[#233554]">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-bold text-white text-sm">{role.role}</h5>
                <span className="flex items-center gap-1 text-xs text-[#8892B0]"><Users className="w-3 h-3"/> {role.users}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {role.access.map(a => (
                  <span key={a} className="px-2 py-0.5 bg-[#233554] text-[#CCD6F6] text-[10px] rounded">{a}</span>
                ))}
              </div>
            </div>
          ))}
          <button className="w-full py-2 border border-[#233554] text-[#8892B0] rounded text-sm hover:text-white hover:bg-[#233554] transition-colors">
            Manage Roles
          </button>
        </div>
      </Card>
    </div>
  );
};