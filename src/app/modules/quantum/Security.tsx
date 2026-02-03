import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Lock, Key, RefreshCw, ShieldCheck } from 'lucide-react';

export const Security = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <Card className="col-span-4 p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#112240] to-[#0A192F]">
        <div className="w-24 h-24 rounded-full bg-[#38B2AC]/10 flex items-center justify-center mb-4 relative">
          <ShieldCheck className="w-12 h-12 text-[#38B2AC]" />
          <div className="absolute inset-0 border-2 border-[#38B2AC] rounded-full animate-ping opacity-20" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">QKD 加密保护中</h3>
        <p className="text-[#8892B0] text-sm">当前链路安全强度: <span className="text-[#38B2AC]">极高</span></p>
        <p className="text-[#8892B0] text-xs mt-4">密钥更新频率: 10s</p>
      </Card>

      <Card className="col-span-8 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-white font-bold flex items-center gap-2">
            <Key className="text-[#ECC94B]" /> 量子密钥管理
          </h4>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#233554] text-[#CCD6F6] text-xs rounded hover:text-white">
            <RefreshCw className="w-3 h-3" /> 手动轮换
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="text-xs text-[#8892B0] border-b border-[#233554]">
              <tr>
                <th className="py-3 text-left">密钥ID</th>
                <th className="py-3 text-left">生成时间</th>
                <th className="py-3 text-left">过期时间</th>
                <th className="py-3 text-left">状态</th>
                <th className="py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { id: 'K-9928-XA', gen: '14:25:10', exp: '14:25:20', status: 'Active' },
                { id: 'K-9928-WZ', gen: '14:25:00', exp: '14:25:10', status: 'Expired' },
                { id: 'K-9928-VY', gen: '14:24:50', exp: '14:25:00', status: 'Expired' },
                { id: 'K-9928-UX', gen: '14:24:40', exp: '14:24:50', status: 'Expired' },
              ].map((k) => (
                <tr key={k.id} className="border-b border-[#233554]/50">
                  <td className="py-3 font-mono text-[#CCD6F6]">{k.id}</td>
                  <td className="py-3 text-[#8892B0]">{k.gen}</td>
                  <td className="py-3 text-[#8892B0]">{k.exp}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      k.status === 'Active' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#233554] text-[#8892B0]'
                    }`}>{k.status}</span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-[#F56565] hover:underline text-xs">作废</button>
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