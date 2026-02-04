import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Globe, Server, Activity, AlertTriangle, Shield, Cpu, Database } from '@/app/components/SafeIcons';


// Note: Leaflet requires some CSS and potentially dynamic import in SSR, but here it's client side. 
// However, since we might not have 'react-leaflet' fully set up with tiles in this sandbox, I will simulate the map with a visual placeholder or simple div if the package isn't guaranteed. 
// Given the environment, I'll use a stylized SVG map placeholder to be safe and look "high-tech".

const WorldMapPlaceholder = () => (
  <div className="w-full h-full bg-[#0A192F] rounded relative overflow-hidden flex items-center justify-center opacity-50">
    <Globe className="w-64 h-64 text-[#233554] animate-pulse" strokeWidth={0.5} />
    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#38B2AC] rounded-full animate-ping" style={{ transform: 'translate(-20px, -40px)' }} />
    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#4299E1] rounded-full animate-ping" style={{ transform: 'translate(60px, 20px)' }} />
    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#F56565] rounded-full animate-ping" style={{ transform: 'translate(-80px, 50px)' }} />
    <div className="absolute bottom-4 right-4 text-xs text-[#8892B0] font-mono">
      Global Nodes: 24 | Active: 24 | Latency: 45ms
    </div>
  </div>
);

export const SystemDashboard = () => {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-5 gap-6">
        <Card className="p-4 flex items-center gap-4 bg-gradient-to-r from-[#0A192F] to-[#112240]">
           <div className="p-3 rounded-full bg-[#38B2AC]/10 text-[#38B2AC]"><Server className="w-6 h-6"/></div>
           <div>
             <p className="text-[10px] text-[#8892B0] uppercase">System Status</p>
             <h3 className="text-lg font-bold text-white">HEALTHY</h3>
           </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-gradient-to-r from-[#0A192F] to-[#112240]">
           <div className="p-3 rounded-full bg-[#4299E1]/10 text-[#4299E1]"><Activity className="w-6 h-6"/></div>
           <div>
             <p className="text-[10px] text-[#8892B0] uppercase">QPS (Real-time)</p>
             <h3 className="text-lg font-bold text-white">45,210</h3>
           </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-gradient-to-r from-[#0A192F] to-[#112240]">
           <div className="p-3 rounded-full bg-[#ECC94B]/10 text-[#ECC94B]"><Cpu className="w-6 h-6"/></div>
           <div>
             <p className="text-[10px] text-[#8892B0] uppercase">Quantum Usage</p>
             <h3 className="text-lg font-bold text-white">82%</h3>
           </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-gradient-to-r from-[#0A192F] to-[#112240]">
           <div className="p-3 rounded-full bg-[#F56565]/10 text-[#F56565]"><AlertTriangle className="w-6 h-6"/></div>
           <div>
             <p className="text-[10px] text-[#8892B0] uppercase">Active Alerts</p>
             <h3 className="text-lg font-bold text-white">3</h3>
           </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-gradient-to-r from-[#0A192F] to-[#112240]">
           <div className="p-3 rounded-full bg-[#CCD6F6]/10 text-[#CCD6F6]"><Shield className="w-6 h-6"/></div>
           <div>
             <p className="text-[10px] text-[#8892B0] uppercase">Security Level</p>
             <h3 className="text-lg font-bold text-white">Level 5</h3>
           </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
         {/* Map & Global Status */}
         <div className="col-span-8 flex flex-col gap-6">
            <Card className="flex-1 p-1 relative border-[#38B2AC]/30 shadow-[0_0_20px_rgba(56,178,172,0.1)]">
               <div className="absolute top-4 left-4 z-10">
                 <h4 className="text-white font-bold flex items-center gap-2">
                   <Globe className="text-[#38B2AC]" /> 全球节点监控大屏
                 </h4>
               </div>
               <WorldMapPlaceholder />
            </Card>
            
            <div className="h-1/3 grid grid-cols-3 gap-6">
               <Card className="p-4">
                  <h5 className="text-xs text-[#8892B0] font-bold mb-3 uppercase flex items-center gap-2"><Database className="w-4 h-4" /> Storage Usage</h5>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold text-white">1.4</span>
                    <span className="text-sm text-[#8892B0] mb-1">PB / 5.0 PB</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#233554] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4299E1] w-[28%]" />
                  </div>
               </Card>
               <Card className="p-4">
                  <h5 className="text-xs text-[#8892B0] font-bold mb-3 uppercase flex items-center gap-2"><Activity className="w-4 h-4" /> Network I/O</h5>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold text-white">4.5</span>
                    <span className="text-sm text-[#8892B0] mb-1">GB/s</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#233554] rounded-full overflow-hidden">
                    <div className="h-full bg-[#38B2AC] w-[65%]" />
                  </div>
               </Card>
               <Card className="p-4">
                  <h5 className="text-xs text-[#8892B0] font-bold mb-3 uppercase flex items-center gap-2"><Cpu className="w-4 h-4" /> Cluster CPU</h5>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold text-white">62</span>
                    <span className="text-sm text-[#8892B0] mb-1">% Avg</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#233554] rounded-full overflow-hidden">
                    <div className="h-full bg-[#ECC94B] w-[62%]" />
                  </div>
               </Card>
            </div>
         </div>

         {/* Alerts & Events Side Panel */}
         <Card className="col-span-4 p-0 overflow-hidden flex flex-col border-red-500/20">
            <div className="p-4 bg-[#F56565]/10 border-b border-[#F56565]/20 flex justify-between items-center">
               <h4 className="text-[#F56565] font-bold flex items-center gap-2">
                 <AlertTriangle className="animate-pulse" /> 实时预警中心
               </h4>
               <span className="px-2 py-0.5 bg-[#F56565] text-white text-[10px] rounded font-bold">LIVE</span>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-3">
               {[
                 { time: '10:25:32', level: 'Critical', msg: 'Node US-East-04 connection lost', code: 'NET-004' },
                 { time: '10:24:15', level: 'High', msg: 'Trading Latency spike > 500ms', code: 'MKT-LAT' },
                 { time: '10:20:00', level: 'Medium', msg: 'Disk usage warning on DB-02 (>85%)', code: 'SYS-DSK' },
                 { time: '10:15:30', level: 'Medium', msg: 'API Rate limit approaching (90%)', code: 'API-LIM' },
               ].map((alert, i) => (
                 <div key={i} className="p-3 bg-[#0A192F] border-l-2 border-l-[#F56565] rounded-r border-y border-r border-[#233554]">
                    <div className="flex justify-between text-[10px] text-[#8892B0] mb-1">
                      <span className="font-mono">{alert.time}</span>
                      <span>{alert.code}</span>
                    </div>
                    <p className="text-sm text-white font-medium">{alert.msg}</p>
                 </div>
               ))}
               
               {/* Filler items for visual density */}
               {Array.from({length: 5}).map((_, i) => (
                  <div key={`fill-${i}`} className="p-2 bg-[#0A192F]/50 border border-[#233554]/30 rounded opacity-50">
                     <div className="h-2 w-1/3 bg-[#233554] rounded mb-1" />
                     <div className="h-3 w-3/4 bg-[#233554] rounded" />
                  </div>
               ))}
            </div>
         </Card>
      </div>
    </div>
  );
};