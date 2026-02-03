import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const RISK_RADAR = [
  { subject: '市场风险', A: 120, B: 110, fullMark: 150 },
  { subject: '流动性风险', A: 98, B: 130, fullMark: 150 },
  { subject: '信用风险', A: 86, B: 130, fullMark: 150 },
  { subject: '操作风险', A: 99, B: 100, fullMark: 150 },
  { subject: '模型风险', A: 85, B: 90, fullMark: 150 },
];

export const RiskView = () => (
  <div className="grid grid-cols-12 gap-6">
    <div className="col-span-12 lg:col-span-4">
      <Card className="p-6 h-full">
        <h4 className="text-[#FFFFFF] mb-6">风险多维分析</h4>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RISK_RADAR}>
              <PolarGrid stroke="#233554" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#8892B0', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
              <Radar name="当前风险" dataKey="A" stroke="#4299E1" fill="#4299E1" fillOpacity={0.6} />
              <Radar name="阈值警戒" dataKey="B" stroke="#F56565" fill="#F56565" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center p-3 bg-[#071425] rounded border border-[#233554]">
            <span className="text-xs text-[#8892B0]">VaR (95% 置信度)</span>
            <span className="text-sm font-bold text-[#F56565]">-$12,450.00</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-[#071425] rounded border border-[#233554]">
            <span className="text-xs text-[#8892B0]">夏普比率 (Sharpe)</span>
            <span className="text-sm font-bold text-[#38B2AC]">2.45</span>
          </div>
        </div>
      </Card>
    </div>
    <div className="col-span-12 lg:col-span-8 space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: '最大回撤', value: '12.4%', sub: 'Max Drawdown', color: '#F56565' },
          { label: '波动率', value: '18.2%', sub: 'Volatility', color: '#ECC94B' },
          { label: 'Beta 系数', value: '0.92', sub: 'Beta Index', color: '#4299E1' },
        ].map(stat => (
          <Card key={stat.label} className="p-6">
            <p className="text-xs text-[#8892B0] mb-1">{stat.sub}</p>
            <h3 className="text-2xl font-bold text-[#FFFFFF]">{stat.value}</h3>
            <p className="text-xs font-medium mt-2" style={{ color: stat.color }}>{stat.label}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h4 className="text-[#FFFFFF] mb-6">风控规则触发日志</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] text-[#8892B0] border-b border-[#233554]">
                <th className="pb-3 font-medium">触发时间</th>
                <th className="pb-3 font-medium">风险类别</th>
                <th className="pb-3 font-medium">触发规则</th>
                <th className="pb-3 font-medium">当前数值</th>
                <th className="pb-3 font-medium">处理状态</th>
              </tr>
            </thead>
            <tbody className="text-xs text-[#CCD6F6]">
              {[
                { time: '14:20:11', type: '行情风险', rule: '波动率 > 20%', val: '22.4%', status: '已拦截', sColor: '#F56565' },
                { time: '14:15:05', type: '合规风险', rule: '单笔限额 > 50W', val: '62.0W', status: '待审核', sColor: '#ECC94B' },
                { time: '13:58:22', type: '流动性风险', rule: '滑点预期 > 1%', val: '1.2%', status: '自动调整', sColor: '#38B2AC' },
                { time: '13:40:45', type: '技术风险', rule: 'API 延迟 > 200ms', val: '312ms', status: '已重连', sColor: '#4299E1' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-[#233554]/50 group hover:bg-[#1A2B47]/30">
                  <td className="py-4 text-[#8892B0]">{row.time}</td>
                  <td className="py-4 font-medium">{row.type}</td>
                  <td className="py-4">{row.rule}</td>
                  <td className="py-4">{row.val}</td>
                  <td className="py-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] border" style={{ borderColor: row.sColor, color: row.sColor }}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  </div>
);