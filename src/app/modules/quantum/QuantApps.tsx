import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { TrendingUp, Shield, Zap, Search } from '@/app/components/SafeIcons';

const APPS = [
  { id: 'opt', title: '投资组合优化', icon: Zap, desc: '使用 QAOA 寻找最佳夏普比率组合', color: '#ECC94B' },
  { id: 'pred', title: '高频行情预测', icon: TrendingUp, desc: '基于量子神经网络 (QNN) 的价格预测', color: '#38B2AC' },
  { id: 'risk', title: '极速风控计算', icon: Shield, desc: '蒙特卡洛加速算法计算 VaR', color: '#F56565' },
  { id: 'arb', title: '套利机会搜索', icon: Search, desc: 'Grover 算法全市场扫描', color: '#4299E1' },
];

export const QuantApps = () => {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col justify-center">
      <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
        {APPS.map((app) => (
          <Card key={app.id} className="p-8 group hover:border-[#CCD6F6] cursor-pointer transition-all hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-[#071425] border border-[#233554]">
                <app.icon className="w-8 h-8" style={{ color: app.color }} />
              </div>
              <h3 className="text-xl font-bold text-white">{app.title}</h3>
            </div>
            <p className="text-[#8892B0] mb-6">{app.desc}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#8892B0]">状态: <span className="text-[#38B2AC]">就绪</span></span>
              <button className="px-4 py-2 bg-[#233554] text-white rounded text-sm group-hover:bg-[#4299E1] transition-colors">
                进入应用
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};