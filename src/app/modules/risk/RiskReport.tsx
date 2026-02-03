import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { FileText, Download, Share2, Printer } from 'lucide-react';

const REPORTS = [
  { id: 1, title: '2024-03-28 风控日报', type: '日报', status: '已生成', risk: 'Low' },
  { id: 2, title: '2024-03-27 风控日报', type: '日报', status: '已生成', risk: 'Medium' },
  { id: 3, title: '2024-03 W4 周报', type: '周报', status: '已生成', risk: 'Low' },
  { id: 4, title: '2024-02 月度总结', type: '月报', status: '已生成', risk: 'High' },
];

export const RiskReport = () => {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold">风控报告中心</h3>
        <button className="px-4 py-2 bg-[#4299E1] text-white rounded text-sm hover:brightness-110">
          生成新报告
        </button>
      </div>

      <Card className="flex-1 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0A192F] text-xs text-[#8892B0] border-b border-[#233554]">
            <tr>
              <th className="py-3 px-6 text-left">报告名称</th>
              <th className="py-3 px-6 text-left">类型</th>
              <th className="py-3 px-6 text-left">整体风险评级</th>
              <th className="py-3 px-6 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {REPORTS.map((r) => (
              <tr key={r.id} className="border-b border-[#233554]/50 hover:bg-[#1A2B47]/30 transition-colors">
                <td className="py-4 px-6 flex items-center gap-3 text-white">
                  <FileText className="w-4 h-4 text-[#4299E1]" />
                  {r.title}
                </td>
                <td className="py-4 px-6 text-[#CCD6F6]">
                  <span className="px-2 py-1 bg-[#233554] rounded text-xs">{r.type}</span>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    r.risk === 'High' ? 'bg-[#F56565]/20 text-[#F56565]' : 
                    r.risk === 'Medium' ? 'bg-[#ECC94B]/20 text-[#ECC94B]' : 'bg-[#38B2AC]/20 text-[#38B2AC]'
                  }`}>
                    {r.risk}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-2 text-[#8892B0]">
                    <button className="p-2 hover:text-white hover:bg-[#233554] rounded"><Download className="w-4 h-4" /></button>
                    <button className="p-2 hover:text-white hover:bg-[#233554] rounded"><Share2 className="w-4 h-4" /></button>
                    <button className="p-2 hover:text-white hover:bg-[#233554] rounded"><Printer className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};