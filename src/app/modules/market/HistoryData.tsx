import React, { useState } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Search, Filter, Download, Calendar } from '@/app/components/SafeIcons';
import { KLineChart } from '@/app/components/KLineChart';

const MOCK_HISTORY = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  date: `2024-03-${String(i % 30 + 1).padStart(2, '0')}`,
  open: 65000 + Math.random() * 1000,
  high: 66000 + Math.random() * 1000,
  low: 64000 + Math.random() * 1000,
  close: 65500 + Math.random() * 1000,
  volume: Math.floor(Math.random() * 10000),
  change: (Math.random() - 0.5) * 5
}));

export const HistoryData = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Format data for chart
  const chartData = MOCK_HISTORY.map(d => ({
    time: d.date,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close
  })).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
      {/* Filter Bar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-[#071425] border border-[#233554] rounded px-3 py-1.5">
            <Filter className="w-4 h-4 text-[#8892B0]" />
            <select className="bg-transparent text-sm text-[#CCD6F6] outline-none border-none">
              <option>全部市场</option>
              <option>加密货币</option>
              <option>股票</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-[#071425] border border-[#233554] rounded px-3 py-1.5">
            <Search className="w-4 h-4 text-[#8892B0]" />
            <input 
              type="text" 
              placeholder="搜索品种..." 
              className="bg-transparent text-sm text-[#CCD6F6] outline-none w-32 placeholder:text-[#233554]"
            />
          </div>
          <div className="flex items-center gap-2 bg-[#071425] border border-[#233554] rounded px-3 py-1.5 text-[#8892B0] text-sm">
            <Calendar className="w-4 h-4" />
            <span>2024-01-01 ~ 2024-03-31</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-1.5 bg-[#4299E1]/10 text-[#4299E1] rounded hover:bg-[#4299E1]/20 transition-colors text-sm font-medium">
          <Download className="w-4 h-4" /> 导出数据
        </button>
      </Card>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        {/* Table */}
        <Card className="col-span-7 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#233554] bg-[#0A192F]/50">
            <h3 className="text-white font-bold text-sm">历史行情明细</h3>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#112240] z-10 text-[#8892B0] text-xs">
                <tr>
                  <th className="p-3 text-left">日期</th>
                  <th className="p-3 text-right">开盘</th>
                  <th className="p-3 text-right">最高</th>
                  <th className="p-3 text-right">最低</th>
                  <th className="p-3 text-right">收盘</th>
                  <th className="p-3 text-right">涨跌%</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_HISTORY.map((row) => (
                  <tr 
                    key={row.id} 
                    onClick={() => setSelectedId(row.id)}
                    className={`border-b border-[#233554]/30 cursor-pointer transition-colors ${
                      selectedId === row.id ? 'bg-[#4299E1]/20' : 'hover:bg-[#1A2B47]/30'
                    }`}
                  >
                    <td className="p-3 text-[#CCD6F6]">{row.date}</td>
                    <td className="p-3 text-right font-mono text-[#8892B0]">{row.open.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-[#8892B0]">{row.high.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-[#8892B0]">{row.low.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-[#FFFFFF] font-medium">{row.close.toFixed(2)}</td>
                    <td className={`p-3 text-right ${row.change >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
                      {row.change >= 0 ? '+' : ''}{row.change.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Chart */}
        <Card className="col-span-5 flex flex-col p-0 overflow-hidden bg-[#071425]">
          <div className="p-4 border-b border-[#233554] flex justify-between items-center">
            <h3 className="text-white font-bold text-sm">趋势预览</h3>
            <span className="text-xs text-[#8892B0]">日线 (Daily)</span>
          </div>
          <div className="flex-1 relative">
             <div className="absolute inset-0">
               <KLineChart data={chartData} colors={{ backgroundColor: '#071425' }} />
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
};