import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { TrendingUp, Activity, BarChart2 } from '@/app/components/SafeIcons';

const APPS = [
  { id: 1, title: '对接实盘策略', icon: Activity, desc: '将训练好的模型信号直接输出到交易引擎', status: 'Running', metric: 'Signal: Strong Buy' },
  { id: 2, title: '行情预测仪表盘', icon: TrendingUp, desc: '实时预测未来 1h 的价格走势并可视化', status: 'Active', metric: 'Pred: +1.2%' },
  { id: 3, title: '投资组合归因', icon: BarChart2, desc: '分析当前持仓的风险因子暴露', status: 'Idle', metric: 'Last run: 2h ago' },
];

export const ModelApplication = () => {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col justify-center">
      <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto w-full">
        {APPS.map((app) => (
          <Card key={app.id} className="p-8 group hover:border-[#CCD6F6] cursor-pointer transition-all hover:-translate-y-1 bg-[#0A192F]">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[#112240] border border-[#233554] group-hover:bg-[#4299E1] group-hover:text-white transition-colors text-[#4299E1]">
                <app.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{app.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  app.status === 'Running' || app.status === 'Active' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#233554] text-[#8892B0]'
                }`}>
                  {app.status}
                </span>
              </div>
            </div>
            
            <p className="text-[#8892B0] mb-8 h-12">{app.desc}</p>
            
            <div className="p-4 bg-[#112240] rounded border border-[#233554] mb-6">
               <p className="text-xs text-[#8892B0] mb-1">关键指标</p>
               <p className="text-lg font-bold text-[#CCD6F6] font-mono">{app.metric}</p>
            </div>

            <button className="w-full py-2 bg-[#233554] text-white rounded text-sm group-hover:bg-[#4299E1] transition-colors font-medium">
              配置应用
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};