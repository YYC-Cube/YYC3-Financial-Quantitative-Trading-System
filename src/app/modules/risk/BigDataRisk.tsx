import React, { useState } from 'react';
import { Card } from '@/app/components/ui/Card';
import { AlertTriangle, CheckCircle, Flame } from 'lucide-react';

const SCENARIOS = [
  { id: '2008', name: '2008 金融危机', desc: 'S&P 500 下跌 50%, 波动率飙升', severity: 'high' },
  { id: '2020', name: '2020 美股熔断', desc: '流动性枯竭, 资产相关性趋向 1', severity: 'critical' },
  { id: 'custom', name: '自定义压力场景', desc: '手动配置各项风险因子冲击', severity: 'medium' },
];

export const BigDataRisk = () => {
  const [activeScenario, setActiveScenario] = useState('2008');
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = (id: string) => {
    setActiveScenario(id);
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 1500);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Scenario Selection */}
      <div className="grid grid-cols-3 gap-6">
        {SCENARIOS.map((s) => (
          <Card 
            key={s.id} 
            className={`p-6 cursor-pointer border-2 transition-all ${
              activeScenario === s.id ? 'border-[#4299E1] bg-[#1A2B47]' : 'border-transparent hover:bg-[#112240]'
            }`}
            onClick={() => handleAnalyze(s.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-white font-bold">{s.name}</h4>
              {s.severity === 'critical' ? <Flame className="text-[#F56565] w-5 h-5" /> : 
               s.severity === 'high' ? <AlertTriangle className="text-[#ECC94B] w-5 h-5" /> :
               <CheckCircle className="text-[#38B2AC] w-5 h-5" />}
            </div>
            <p className="text-xs text-[#8892B0]">{s.desc}</p>
          </Card>
        ))}
      </div>

      {/* Analysis Result */}
      <Card className="flex-1 p-6 relative overflow-hidden flex flex-col items-center justify-center">
        {analyzing ? (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#4299E1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#CCD6F6]">正在进行大数据压力测试...</p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                测试结果评估: 
                <span className={`px-3 py-1 rounded text-sm ${
                  activeScenario === '2020' ? 'bg-[#F56565]/20 text-[#F56565]' : 
                  activeScenario === '2008' ? 'bg-[#ECC94B]/20 text-[#ECC94B]' : 'bg-[#38B2AC]/20 text-[#38B2AC]'
                }`}>
                  {activeScenario === '2020' ? '极高风险 (CRITICAL)' : activeScenario === '2008' ? '高风险 (HIGH)' : '中等风险 (MEDIUM)'}
                </span>
              </h3>
              <button className="px-4 py-2 bg-[#233554] text-[#CCD6F6] rounded hover:text-white">导出详细报告</button>
            </div>

            <div className="grid grid-cols-4 gap-4 w-full">
              {[
                { label: '预期最大亏损', val: '-45.2%', color: '#F56565' },
                { label: '保证金追加', val: '$2.5M', color: '#ECC94B' },
                { label: '流动性折价', val: '15%', color: '#8892B0' },
                { label: '恢复周期', val: '180 Days', color: '#8892B0' },
              ].map(item => (
                <div key={item.label} className="bg-[#071425] p-4 rounded border border-[#233554] text-center">
                  <p className="text-xs text-[#8892B0] mb-2">{item.label}</p>
                  <h4 className="text-xl font-bold" style={{ color: item.color }}>{item.val}</h4>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex-1 bg-[#0A192F] rounded border border-[#233554] relative p-4">
               <p className="text-xs text-[#8892B0] mb-4">资产净值走势模拟</p>
               {/* Simple CSS Chart for visual */}
               <div className="flex items-end h-32 gap-1">
                 {Array.from({ length: 50 }).map((_, i) => (
                   <div 
                     key={i} 
                     className={`flex-1 rounded-t ${i > 30 ? 'bg-[#F56565]' : 'bg-[#38B2AC]'}`}
                     style={{ height: `${Math.max(10, 50 + Math.random() * 50 - (i > 30 ? (i-30)*2 : 0))}%` }}
                   />
                 ))}
               </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};