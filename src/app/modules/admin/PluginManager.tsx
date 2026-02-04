import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Box, Plug, Key, Settings, Trash2, Power } from '@/app/components/SafeIcons';

export const PluginManager = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <div className="col-span-8 flex flex-col gap-6">
        <Card className="flex-1 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-white font-bold flex items-center gap-2">
              <Box className="text-[#4299E1]" /> 模块微前端管理
            </h4>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-[#4299E1] text-white text-xs rounded hover:brightness-110">
                + 注册新模块
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Market Data Module', ver: '2.1.0', status: 'Active', port: 3001 },
              { name: 'Trade Execution Module', ver: '1.5.2', status: 'Active', port: 3002 },
              { name: 'Risk Engine Module', ver: '3.0.1', status: 'Maintenance', port: 3003 },
              { name: 'Quantum Lab Module', ver: '0.9.5-beta', status: 'Active', port: 3004 },
            ].map((mod, i) => (
              <div key={i} className="p-4 bg-[#0A192F] rounded border border-[#233554] flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-[#112240] rounded text-[#CCD6F6]"><Box className="w-5 h-5" /></div>
                   <div>
                     <h5 className="text-white font-bold text-sm">{mod.name}</h5>
                     <p className="text-[10px] text-[#8892B0]">v{mod.ver} • Port: {mod.port}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className={`px-2 py-0.5 rounded text-[10px] ${
                     mod.status === 'Active' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#ECC94B]/20 text-[#ECC94B]'
                   }`}>{mod.status}</span>
                   <Settings className="w-4 h-4 text-[#8892B0] cursor-pointer hover:text-white" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex-1 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h4 className="text-white font-bold flex items-center gap-2">
               <Plug className="text-[#ECC94B]" /> 插件生态
             </h4>
             <input type="text" placeholder="Search plugins..." className="bg-[#0A192F] border border-[#233554] rounded px-3 py-1.5 text-xs text-white outline-none" />
          </div>
          
          <div className="space-y-3 overflow-auto">
             {[
               { name: 'Binance Connector', author: 'CloudHub Official', desc: 'Official connector for Binance Spot/Futures API', active: true },
               { name: 'Talib Technical Indicators', author: 'OpenSource', desc: 'Standard library for technical analysis (RSI, MACD...)', active: true },
               { name: 'Slack Notifier', author: 'Community', desc: 'Send alerts to Slack channels', active: false },
             ].map((plug, i) => (
               <div key={i} className="flex items-center justify-between p-3 border-b border-[#233554]/50 hover:bg-[#112240] transition-colors rounded">
                 <div className="flex items-center gap-3">
                    <Plug className="w-5 h-5 text-[#8892B0]" />
                    <div>
                      <h5 className="text-white font-bold text-sm">{plug.name}</h5>
                      <p className="text-[10px] text-[#8892B0]">{plug.desc}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button className={`w-8 h-4 rounded-full relative transition-colors ${plug.active ? 'bg-[#38B2AC]' : 'bg-[#233554]'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${plug.active ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                    <Trash2 className="w-4 h-4 text-[#F56565] cursor-pointer" />
                 </div>
               </div>
             ))}
          </div>
        </Card>
      </div>

      <div className="col-span-4 flex flex-col gap-6">
        <Card className="p-6 h-full flex flex-col">
          <h4 className="text-white font-bold mb-6 flex items-center gap-2">
            <Key className="text-[#F56565]" /> 接口 API 管理
          </h4>
          
          <div className="space-y-6 flex-1 overflow-auto">
            <div className="p-4 bg-[#0A192F] rounded border border-[#233554]">
               <h5 className="text-white text-sm font-bold mb-2">Internal API (Gateway)</h5>
               <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8892B0]">Status</span>
                    <span className="text-[#38B2AC]">Healthy</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8892B0]">Uptime</span>
                    <span className="text-[#CCD6F6]">14d 2h 15m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8892B0]">Requests/s</span>
                    <span className="text-[#CCD6F6]">12,450</span>
                  </div>
               </div>
            </div>

            <div className="p-4 bg-[#0A192F] rounded border border-[#233554]">
               <h5 className="text-white text-sm font-bold mb-2">External Open API</h5>
               <p className="text-[10px] text-[#8892B0] mb-3">Provide data access for 3rd party clients.</p>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-xs text-[#CCD6F6]">Enable API</span>
                 <div className="w-8 h-4 bg-[#233554] rounded-full relative cursor-pointer">
                    <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                 </div>
               </div>
               <button className="w-full py-1.5 border border-[#233554] text-[#8892B0] text-xs rounded hover:text-white">
                 Manage Keys
               </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};