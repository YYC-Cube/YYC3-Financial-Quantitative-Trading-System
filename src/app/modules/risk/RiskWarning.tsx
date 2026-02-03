import React, { useState } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Bell, Mail, Smartphone, Shield, AlertTriangle } from 'lucide-react';

export const RiskWarning = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
          <Shield className="text-[#38B2AC]" /> 自动风控规则
        </h3>
        
        <div className="space-y-4">
          {[
            { title: '强制平仓线', desc: '当账户权益 < 维持保证金 110% 时触发', active: true },
            { title: '单笔最大亏损', desc: '单笔交易亏损 > $5,000 时自动止损', active: true },
            { title: '日内回撤限制', desc: '当日回撤 > 5% 时停止开新仓', active: false },
            { title: '流动性保护', desc: '盘口价差 > 0.5% 时暂停市价单', active: true },
          ].map((rule, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#071425] border border-[#233554] rounded">
              <div>
                <h4 className="text-sm font-bold text-white">{rule.title}</h4>
                <p className="text-xs text-[#8892B0] mt-1">{rule.desc}</p>
              </div>
              <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${rule.active ? 'bg-[#38B2AC]' : 'bg-[#233554]'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${rule.active ? 'left-6' : 'left-1'}`} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="text-[#ECC94B]" /> 预警阈值配置
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#8892B0] block mb-1">价格波动预警 (%)</label>
                <input type="number" className="w-full bg-[#071425] border border-[#233554] p-2 rounded text-white text-sm" defaultValue={2.5} />
              </div>
              <div>
                <label className="text-xs text-[#8892B0] block mb-1">持仓集中度 (%)</label>
                <input type="number" className="w-full bg-[#071425] border border-[#233554] p-2 rounded text-white text-sm" defaultValue={40} />
              </div>
            </div>
            <button className="w-full py-2 bg-[#233554] text-[#CCD6F6] hover:text-white rounded text-sm">
              保存配置
            </button>
          </div>
        </Card>

        <Card className="p-6 flex-1">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <Bell className="text-[#4299E1]" /> 通知渠道
          </h3>
          <div className="space-y-3">
            {[
              { icon: Bell, name: '系统弹窗', sub: '实时推送', on: true },
              { icon: Mail, name: '邮件通知', sub: 'risk@quant.com', on: true },
              { icon: Smartphone, name: '短信/电话', sub: '+86 138****0000', on: false },
            ].map((ch, i) => (
              <div key={i} className="flex items-center gap-3 p-3 hover:bg-[#1A2B47] rounded transition-colors cursor-pointer">
                <div className={`p-2 rounded ${ch.on ? 'bg-[#4299E1]/20 text-[#4299E1]' : 'bg-[#233554] text-[#8892B0]'}`}>
                  <ch.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white">{ch.name}</h4>
                  <p className="text-xs text-[#8892B0]">{ch.sub}</p>
                </div>
                <div className={`w-3 h-3 rounded-full border ${ch.on ? 'bg-[#38B2AC] border-[#38B2AC]' : 'border-[#8892B0]'}`} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};