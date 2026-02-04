import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Filter, Play, Pause, Settings } from '@/app/components/SafeIcons';

export const DataCollection = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <Card className="col-span-8 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-white font-bold">活跃采集任务</h4>
          <button className="px-3 py-1.5 bg-[#4299E1] text-white text-xs rounded hover:brightness-110">
            + 新建任务
          </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-[#0A192F] text-xs text-[#8892B0]">
              <tr>
                <th className="py-3 px-4 text-left">任务名称</th>
                <th className="py-3 px-4 text-left">数据源</th>
                <th className="py-3 px-4 text-left">频率</th>
                <th className="py-3 px-4 text-left">清洗规则</th>
                <th className="py-3 px-4 text-left">状态</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { name: 'Global FX Tick', source: 'Reuters', freq: 'Tick', rule: 'Std-FX-V1', status: 'Running' },
                { name: 'Crypto Orderbook', source: 'Binance', freq: '100ms', rule: 'Crypto-L2', status: 'Running' },
                { name: 'Macro Indicators', source: 'Fred', freq: 'Daily', rule: 'Macro-Clean', status: 'Paused' },
              ].map((task, i) => (
                <tr key={i} className="border-b border-[#233554]/50">
                  <td className="py-3 px-4 font-medium text-white">{task.name}</td>
                  <td className="py-3 px-4 text-[#CCD6F6]">{task.source}</td>
                  <td className="py-3 px-4 text-[#8892B0]">{task.freq}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-[#233554] rounded text-xs text-[#4299E1]">{task.rule}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1.5 text-xs ${
                      task.status === 'Running' ? 'text-[#38B2AC]' : 'text-[#ECC94B]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        task.status === 'Running' ? 'bg-[#38B2AC] animate-pulse' : 'bg-[#ECC94B]'
                      }`} />
                      {task.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right flex justify-end gap-2">
                    {task.status === 'Running' ? (
                      <button className="p-1.5 hover:bg-[#233554] rounded text-[#F56565]"><Pause className="w-3 h-3" /></button>
                    ) : (
                      <button className="p-1.5 hover:bg-[#233554] rounded text-[#38B2AC]"><Play className="w-3 h-3" /></button>
                    )}
                    <button className="p-1.5 hover:bg-[#233554] rounded text-[#8892B0]"><Settings className="w-3 h-3" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="col-span-4 flex flex-col gap-6">
        <Card className="p-6">
          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#ECC94B]" /> 清洗规则库
          </h4>
          <div className="space-y-3">
            {[
              { name: '异常值剔除 (3σ)', active: true },
              { name: '缺失值线性插值', active: true },
              { name: '时间戳标准化 (UTC)', active: true },
              { name: '重复数据去重', active: false },
            ].map((rule, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#0A192F] rounded border border-[#233554]">
                <span className="text-sm text-[#CCD6F6]">{rule.name}</span>
                <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${rule.active ? 'bg-[#38B2AC]' : 'bg-[#233554]'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${rule.active ? 'left-4.5' : 'left-0.5'}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="flex-1 p-6 bg-[#0A192F] border-dashed border-2 border-[#233554] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#233554] flex items-center justify-center mb-3">
            <Filter className="w-6 h-6 text-[#8892B0]" />
          </div>
          <p className="text-sm text-[#CCD6F6]">拖拽规则组件到此处</p>
          <p className="text-xs text-[#8892B0]">构建新的数据清洗流程</p>
        </Card>
      </div>
    </div>
  );
};