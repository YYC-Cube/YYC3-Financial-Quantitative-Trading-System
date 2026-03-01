import React, { useState, useCallback } from 'react';
import { Card } from '@/app/components/ui/Card';
import { useSettings } from '@/app/contexts/SettingsContext';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';
import { runBacktest, STRATEGY_TYPES, type BacktestResult, type BacktestConfig } from '@/app/services/BacktestEngine';
import { getAnalytics } from '@/app/services/AnalyticsService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, ComposedChart, Scatter, LineChart, Line } from 'recharts';
import { toast } from 'sonner';

type IconProps = React.SVGProps<SVGSVGElement>;

// Inline icons
const Code = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6" strokeWidth={2} /><polyline points="8 6 2 12 8 18" strokeWidth={2} /></svg>;
const Play = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" strokeWidth={2} /></svg>;
const SettingsIcon = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0" /></svg>;
const TrendingUp = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const BarChart2 = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const Zap = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const CheckCircle = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Clock = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Copy = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;
const Search = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const Star = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const Plus = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const Download = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" strokeWidth={2} /><line x1="12" y1="15" x2="12" y2="3" strokeWidth={2} /></svg>;
const GitBranch = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="6" y1="3" x2="6" y2="15" strokeWidth={2} /><circle cx="18" cy="6" r="3" strokeWidth={2} /><circle cx="6" cy="18" r="3" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9a9 9 0 01-9 9" /></svg>;
const Shield = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const AlertTriangle = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const STRATEGY_CODE = `# 双均线交叉策略 (Moving Average Crossover)
# ============================================

import numpy as np
from strategy_engine import Strategy, Signal

class MACrossStrategy(Strategy):
    """基于快慢均线交叉的趋势跟踪策略"""
    
    def __init__(self):
        self.fast_period = 10   # 快线周期
        self.slow_period = 30   # 慢线周期
        self.stop_loss = 0.02   # 止损比例 2%
        self.take_profit = 0.05 # 止盈比例 5%
    
    def on_bar(self, bar):
        fast_ma = self.sma(bar.close, self.fast_period)
        slow_ma = self.sma(bar.close, self.slow_period)
        
        # 金叉买入信号
        if fast_ma > slow_ma and self.prev_fast <= self.prev_slow:
            self.buy(price=bar.close, quantity=self.calc_position())
            
        # 死叉卖出信号
        elif fast_ma < slow_ma and self.prev_fast >= self.prev_slow:
            self.sell(price=bar.close, quantity=self.position)
            
        self.prev_fast = fast_ma
        self.prev_slow = slow_ma`;

const TEMPLATES = [
  { name: '趋势追踪模板', desc: 'EMA/SMA交叉策略基础框架', rating: 4.8, downloads: 1250 },
  { name: '波动率套利模板', desc: '基于隐含波动率的期权策略', rating: 4.5, downloads: 890 },
  { name: '量价关系模板', desc: '成交量与价格联动分析框架', rating: 4.3, downloads: 720 },
  { name: '多因子选股模板', desc: '融合基本面技术面的选股模型', rating: 4.7, downloads: 1580 },
  { name: '统计套利模板', desc: '配对交易与协整分析框架', rating: 4.6, downloads: 960 },
  { name: 'AI信号生成模板', desc: 'LSTM预测信号生成器', rating: 4.9, downloads: 2100 },
];

// ══════════════════════════════════════
// Strategy Editor Sub-module
// ══════════════════════════════════════
const StrategyEditor = ({ activeTertiary }: { activeTertiary: string }) => {
  const [mode, setMode] = useState<'code' | 'visual'>('code');
  const [templateSearch, setTemplateSearch] = useState('');
  const [stratParams, setStratParams] = useState({ fastPeriod: 10, slowPeriod: 30, stopLoss: 2, takeProfit: 5 });
  
  if (activeTertiary === '模板工具') {
    const filteredTemplates = TEMPLATES.filter(t =>
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.desc.toLowerCase().includes(templateSearch.toLowerCase())
    );
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-lg">策略模板库</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892B0]" />
            <input className="bg-[#071425] border border-[#233554] rounded pl-9 pr-4 py-1.5 text-xs text-[#CCD6F6] focus:outline-none focus:border-[#4299E1] w-48" placeholder="搜索模板..." value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)} />
          </div>
        </div>
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-[#8892B0]">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">未找到匹配的模板</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((t, i) => (
              <Card key={i} className="p-4 hover:border-[#38B2AC]/50 transition-colors cursor-pointer group" onClick={() => toast(`${t.name}`, { description: `${t.desc} · 评分: ${t.rating}` })}>
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-white text-sm">{t.name}</h4>
                  <div className="flex items-center gap-1 text-[#ECC94B]"><Star className="w-3 h-3" fill="currentColor" /><span className="text-[10px]">{t.rating}</span></div>
                </div>
                <p className="text-[#8892B0] text-xs mb-4">{t.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#8892B0]"><Download className="w-3 h-3 inline mr-1" />{t.downloads}</span>
                  <button onClick={() => toast.success(`已应用模板: ${t.name}`)} className="px-3 py-1 bg-[#38B2AC]/20 text-[#38B2AC] text-xs rounded hover:bg-[#38B2AC]/30">使用模板</button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeTertiary === '智能生成') {
    return (
      <div className="space-y-6">
        <Card className="p-6 border-dashed border-[#38B2AC]/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#38B2AC]/10 rounded-full flex items-center justify-center"><Zap className="w-5 h-5 text-[#38B2AC]" /></div>
            <div>
              <h3 className="text-white text-sm">AI 策略生成器</h3>
              <p className="text-[#8892B0] text-[10px]">描述您的交易逻辑，AI将自动生成可执行的策略代码</p>
            </div>
          </div>
          <textarea className="w-full h-32 bg-[#071425] border border-[#233554] rounded-lg p-4 text-sm text-[#CCD6F6] resize-none focus:outline-none focus:border-[#4299E1]" placeholder="例如：当BTC的RSI低于30且MACD出现金叉时买入，当RSI超过70或价格下跌超过3%时卖出..." />
          <div className="flex justify-end mt-3">
            <button onClick={() => toast.info('AI 策略生成中...', { description: '正在分析您的交易逻辑，约需15秒' })} className="px-4 py-2 bg-[#38B2AC] text-white text-xs rounded hover:brightness-110 flex items-center gap-2"><Zap className="w-3 h-3" /> 生成策略</button>
          </div>
        </Card>
        <Card className="p-4">
          <h4 className="text-white text-sm mb-3">最近生成</h4>
          <div className="space-y-2">
            {['RSI反转 + MACD确认策略', '布林带收窄突破策略', '多时间框架趋势策略'].map((name, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#0A192F] rounded border border-[#233554]/50 hover:border-[#233554]">
                <div className="flex items-center gap-3"><Code className="w-4 h-4 text-[#4299E1]" /><span className="text-[#CCD6F6] text-xs">{name}</span></div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8892B0]">{i === 0 ? '2分钟前' : i === 1 ? '1小时前' : '昨天'}</span>
                  <button onClick={() => toast.info(`正在打开: ${name}`)} className="text-[#4299E1] text-xs hover:underline">编辑</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Visual / Code editor
  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <div className="flex bg-[#071425] rounded p-0.5">
            <button onClick={() => setMode('code')} className={`px-3 py-1 text-xs rounded ${mode === 'code' ? 'bg-[#38B2AC] text-white' : 'text-[#8892B0]'}`}><Code className="w-3 h-3 inline mr-1" />代码编辑</button>
            <button onClick={() => setMode('visual')} className={`px-3 py-1 text-xs rounded ${mode === 'visual' ? 'bg-[#38B2AC] text-white' : 'text-[#8892B0]'}`}>图形编辑</button>
          </div>
          <span className="text-[10px] text-[#8892B0] px-2 py-1 bg-[#071425] rounded">双均线交叉策略.py</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => toast.info('运行回测', { description: '正在提交回测任务到计算引擎...' })} className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#38B2AC] bg-[#38B2AC]/10 rounded hover:bg-[#38B2AC]/20"><Play className="w-3 h-3" /> 运行回测</button>
          <button onClick={() => toast.info('参数面板', { description: `快线: ${stratParams.fastPeriod} | 慢线: ${stratParams.slowPeriod} | 止损: ${stratParams.stopLoss}% | 止盈: ${stratParams.takeProfit}%` })} className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#CCD6F6] bg-[#112240] rounded hover:bg-[#1A2B47]"><SettingsIcon className="w-3 h-3" /> 参数</button>
        </div>
      </Card>

      {mode === 'visual' ? (
        <Card className="flex-1 p-4 overflow-auto">
          <h4 className="text-white text-sm mb-4">可视化策略编辑器</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Parameters */}
            <Card className="p-3 bg-[#0A192F] border-[#233554]">
              <h5 className="text-[#4299E1] text-xs mb-3 font-bold">策略参数</h5>
              <div className="space-y-3">
                {[
                  { label: '快线周期', key: 'fastPeriod' as const, min: 3, max: 50 },
                  { label: '慢线周期', key: 'slowPeriod' as const, min: 10, max: 200 },
                  { label: '止损 (%)', key: 'stopLoss' as const, min: 0.5, max: 20 },
                  { label: '止盈 (%)', key: 'takeProfit' as const, min: 1, max: 50 },
                ].map(p => (
                  <div key={p.key}>
                    <div className="flex justify-between text-[10px] text-[#8892B0] mb-1">
                      <span>{p.label}</span>
                      <span className="text-[#CCD6F6] font-mono">{stratParams[p.key]}</span>
                    </div>
                    <input type="range" min={p.min} max={p.max} step={p.key === 'stopLoss' || p.key === 'takeProfit' ? 0.5 : 1}
                      value={stratParams[p.key]}
                      onChange={(e) => setStratParams(prev => ({ ...prev, [p.key]: parseFloat(e.target.value) }))}
                      className="w-full h-1 bg-[#233554] rounded appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#38B2AC]"
                    />
                  </div>
                ))}
              </div>
            </Card>
            {/* Signal Logic */}
            <Card className="p-3 bg-[#0A192F] border-[#233554]">
              <h5 className="text-[#38B2AC] text-xs mb-3 font-bold">信号逻辑</h5>
              <div className="space-y-2">
                <div className="p-2 bg-[#071425] rounded border border-[#38B2AC]/30">
                  <span className="text-[10px] text-[#38B2AC]">买入条件</span>
                  <p className="text-[10px] text-[#CCD6F6] mt-1">SMA({stratParams.fastPeriod}) ↑穿 SMA({stratParams.slowPeriod})</p>
                </div>
                <div className="p-2 bg-[#071425] rounded border border-[#F56565]/30">
                  <span className="text-[10px] text-[#F56565]">卖出条件</span>
                  <p className="text-[10px] text-[#CCD6F6] mt-1">SMA({stratParams.fastPeriod}) ↓穿 SMA({stratParams.slowPeriod})</p>
                </div>
                <div className="p-2 bg-[#071425] rounded border border-[#ECC94B]/30">
                  <span className="text-[10px] text-[#ECC94B]">风控</span>
                  <p className="text-[10px] text-[#CCD6F6] mt-1">止损 {stratParams.stopLoss}% | 止盈 {stratParams.takeProfit}%</p>
                </div>
              </div>
            </Card>
            {/* Preview */}
            <Card className="p-3 bg-[#0A192F] border-[#233554]">
              <h5 className="text-[#ECC94B] text-xs mb-3 font-bold">代码预览</h5>
              <pre className="text-[9px] font-mono text-[#8892B0] whitespace-pre-wrap leading-relaxed">
{`class MACross(Strategy):
  fast = ${stratParams.fastPeriod}
  slow = ${stratParams.slowPeriod}
  stop_loss = ${stratParams.stopLoss / 100}
  take_profit = ${stratParams.takeProfit / 100}

  def on_bar(self, bar):
    f = sma(close, ${stratParams.fastPeriod})
    s = sma(close, ${stratParams.slowPeriod})
    if f > s and prev_f <= prev_s:
      buy(size=calc_pos())
    elif f < s and prev_f >= prev_s:
      sell(size=position)`}
              </pre>
            </Card>
          </div>
        </Card>
      ) : (
        <Card className="flex-1 p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[#0A192F] border-b border-[#233554]">
            <div className="flex items-center gap-2 text-[10px] text-[#8892B0]">
              <span className="px-2 py-0.5 bg-[#112240] rounded text-[#4299E1]">Python</span>
              <span>strategy_v3.2.py</span>
            </div>
            <Copy onClick={() => { navigator.clipboard.writeText(STRATEGY_CODE); toast.success('代码已复制到剪贴板'); }} className="w-3 h-3 text-[#8892B0] cursor-pointer hover:text-[#CCD6F6]" />
          </div>
          <div className="p-4 overflow-auto h-[calc(100%-36px)] bg-[#071425]">
            <pre className="text-xs font-mono text-[#CCD6F6] leading-relaxed whitespace-pre-wrap">
              {STRATEGY_CODE.split('\n').map((line, i) => (
                <div key={i} className="flex hover:bg-[#112240]/30">
                  <span className="w-8 text-right text-[#233554] mr-4 select-none shrink-0">{i + 1}</span>
                  <span className={
                    line.startsWith('#') || line.startsWith('    #') ? 'text-[#8892B0]' :
                    line.includes('def ') || line.includes('class ') || line.includes('import ') || line.includes('from ') ? 'text-[#4299E1]' :
                    line.includes('self.') ? 'text-[#38B2AC]' : ''
                  }>{line || '\u00A0'}</span>
                </div>
              ))}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
};

// ── Backtest localStorage helpers ──
const BT_PRESETS_KEY = 'yyc_bt_presets';
const BT_HISTORY_KEY = 'yyc_bt_history';
function loadPresets(): { name: string; config: BacktestConfig }[] {
  try { const s = localStorage.getItem(BT_PRESETS_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
function savePresets(p: { name: string; config: BacktestConfig }[]): void {
  try { localStorage.setItem(BT_PRESETS_KEY, JSON.stringify(p)); } catch { /* */ }
}
function loadHistory(): { config: BacktestConfig; stats: BacktestResult['stats']; strategyType: string; symbol: string; time: number }[] {
  try { const s = localStorage.getItem(BT_HISTORY_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveHistory(h: { config: BacktestConfig; stats: BacktestResult['stats']; strategyType: string; symbol: string; time: number }[]): void {
  try { localStorage.setItem(BT_HISTORY_KEY, JSON.stringify(h.slice(0, 20))); } catch { /* */ }
}

// ── Backtest export helpers ──
function exportTradesCSV(trades: BacktestResult['trades'], symbol: string, strategy: string): void {
  const header = '#,入场时间,出场时间,方向,入场价,出场价,数量,盈亏$,盈亏%,原因';
  const rows = trades.map(t => {
    const fmt = (ts: number) => new Date(ts).toISOString().replace('T', ' ').slice(0, 19);
    return `${t.id},${fmt(t.entryTime)},${fmt(t.exitTime)},${t.side},${t.entryPrice.toFixed(2)},${t.exitPrice.toFixed(2)},${t.quantity.toFixed(6)},${t.pnl.toFixed(2)},${t.pnlPercent.toFixed(2)},${t.reason}`;
  });
  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `yyc-backtest-${symbol.replace('/', '')}-${strategy}-${Date.now()}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

function exportTradesJSON(result: BacktestResult): void {
  const payload = { symbol: result.symbol, strategy: result.strategyType, period: result.period, dataSource: result.dataSource, stats: result.stats, trades: result.trades, exportTime: new Date().toISOString() };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `yyc-backtest-${result.symbol.replace('/', '')}-${result.strategyType}-${Date.now()}.json`;
  a.click(); URL.revokeObjectURL(url);
}

// Comparison entry type including equity curve for overlaid chart
interface ComparisonEntry {
  label: string;
  stats: BacktestResult['stats'];
  color: string;
  equityCurve: { time: string; equity: number }[];
}

// Custom dot for trade markers on chart
const BuyMarker = (props: { cx?: number; cy?: number }) => {
  if (!props.cx || !props.cy) return null;
  return <polygon points={`${props.cx},${props.cy - 5} ${props.cx - 4},${props.cy + 3} ${props.cx + 4},${props.cy + 3}`} fill="#38B2AC" stroke="#0A192F" strokeWidth={0.5} />;
};
const SellMarker = (props: { cx?: number; cy?: number }) => {
  if (!props.cx || !props.cy) return null;
  return <polygon points={`${props.cx},${props.cy + 5} ${props.cx - 4},${props.cy - 3} ${props.cx + 4},${props.cy - 3}`} fill="#F56565" stroke="#0A192F" strokeWidth={0.5} />;
};

// ══════════════════════════════════════
// Backtest Sub-module (Real Engine + Charts + Trade Markers + Multi-Comparison)
// ══════════════════════════════════════
const BacktestModule = ({ activeTertiary }: { activeTertiary: string }) => {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [comparison, setComparison] = useState<ComparisonEntry[]>([]);
  const [presets, setPresets] = useState(loadPresets);
  const [history, setHistory] = useState(loadHistory);
  const [showPresets, setShowPresets] = useState(false);
  const { emitRiskSignal } = useGlobalData();
  const [config, setConfig] = useState<BacktestConfig>(() => {
    try {
      const s = localStorage.getItem('yyc_bt_last_config');
      if (s) { const parsed = JSON.parse(s); if (parsed && parsed.symbol) return parsed; }
    } catch { /* ignore */ }
    return {
      symbol: 'BTC/USDT', interval: '1h' as const, candleCount: 200, initialCapital: 100000,
      strategy: { type: 'ma_cross' as const, fastPeriod: 10, slowPeriod: 30, stopLoss: 5, takeProfit: 10, positionSize: 0.2 },
    };
  });

  // Persist config on every change
  React.useEffect(() => {
    try { localStorage.setItem('yyc_bt_last_config', JSON.stringify(config)); } catch { /* */ }
  }, [config]);

  const handleRunBacktest = useCallback(async () => {
    setRunning(true);
    getAnalytics().trackFeatureUse('run_backtest', { symbol: config.symbol, strategy: config.strategy.type });
    try {
      const res = await runBacktest(config);
      setResult(res);

      // Save to history
      const entry = { config, stats: res.stats, strategyType: res.strategyType, symbol: res.symbol, time: Date.now() };
      const newHistory = [entry, ...history].slice(0, 20);
      setHistory(newHistory);
      saveHistory(newHistory);

      // Emit risk signals based on results
      if (res.stats.maxDrawdown < -10) {
        emitRiskSignal({ source: 'strategy', severity: 'critical', title: '回测最大回撤超 10%', detail: `${res.strategyType} 在 ${res.symbol} 回测回撤 ${res.stats.maxDrawdown}%`, symbol: res.symbol, value: res.stats.maxDrawdown });
      } else if (res.stats.sharpeRatio < 0.5) {
        emitRiskSignal({ source: 'strategy', severity: 'warning', title: '回测夏普比率偏低', detail: `${res.strategyType} 夏普 ${res.stats.sharpeRatio}，建议调参`, symbol: res.symbol, value: res.stats.sharpeRatio });
      } else {
        emitRiskSignal({ source: 'strategy', severity: 'info', title: '策略回测完成', detail: `${res.strategyType} ${res.symbol}: ${res.stats.totalReturn >= 0 ? '+' : ''}${res.stats.totalReturn}%`, symbol: res.symbol, value: res.stats.totalReturn });
      }

      toast.success(`回测完成: ${res.stats.totalReturn >= 0 ? '+' : ''}${res.stats.totalReturn}%`, { description: `${res.trades.length} 笔交易 | 数据源: ${res.dataSource}` });
    } catch (err) {
      toast.error('回测失败', { description: String(err) });
    } finally {
      setRunning(false);
    }
  }, [config, history, emitRiskSignal]);

  const addToComparison = useCallback(() => {
    if (!result) return;
    const colors = ['#38B2AC', '#4299E1', '#ECC94B', '#F56565', '#9F7AEA', '#ED8936'];
    const label = `${result.strategyType} (${result.symbol})`;
    if (comparison.find(c => c.label === label)) { toast.info('该策略已在对比列表中'); return; }
    // Downsample equity curve to 60 points for overlay
    const step = Math.max(1, Math.floor(result.equityCurve.length / 60));
    const curve = result.equityCurve.filter((_, i) => i % step === 0).map(e => ({
      time: formatTime(e.time),
      equity: +((e.equity / config.initialCapital - 1) * 100).toFixed(2),
    }));
    setComparison(prev => [...prev, { label, stats: result.stats, color: colors[prev.length % colors.length], equityCurve: curve }]);
    toast.success(`已添加到对比: ${label}`);
  }, [result, comparison, config.initialCapital]);

  const handleSavePreset = useCallback(() => {
    const name = `${STRATEGY_TYPES.find(s => s.id === config.strategy.type)?.name || config.strategy.type} · ${config.symbol} · ${config.interval}`;
    const newPresets = [{ name, config }, ...presets.filter(p => p.name !== name)].slice(0, 10);
    setPresets(newPresets);
    savePresets(newPresets);
    toast.success(`预设已保存: ${name}`);
  }, [config, presets]);

  const updateStrategy = (key: string, value: number | string) => {
    setConfig(prev => ({ ...prev, strategy: { ...prev.strategy, [key]: value } }));
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // Chart data with trade markers
  const sampleStep = result ? Math.max(1, Math.floor(result.equityCurve.length / 100)) : 1;
  const sampledTimes = result ? result.equityCurve.filter((_, i) => i % sampleStep === 0).map(e => e.time) : [];
  const chartData = result ? result.equityCurve.filter((_, i) => i % sampleStep === 0).map((e, idx) => {
    const time = formatTime(e.time);
    const equity = +((e.equity / config.initialCapital - 1) * 100).toFixed(2);
    const benchmark = +e.benchmark.toFixed(2);
    const drawdown = +e.drawdown.toFixed(2);
    // Find buy/sell trades near this time point
    const tStart = e.time;
    const tEnd = idx + 1 < sampledTimes.length ? sampledTimes[idx + 1] : e.time + 999999;
    const buys = result.trades.filter(t => t.entryTime >= tStart && t.entryTime < tEnd);
    const sells = result.trades.filter(t => t.exitTime >= tStart && t.exitTime < tEnd);
    return {
      time, equity, benchmark, drawdown,
      buyMarker: buys.length > 0 ? equity : undefined,
      sellMarker: sells.length > 0 ? equity : undefined,
    };
  }) : [];

  return (
    <div className="space-y-6">
      {/* Config Panel */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm">回测配置</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowPresets(!showPresets)} className="px-3 py-2 bg-[#112240] border border-[#233554] text-[#8892B0] text-xs rounded hover:text-[#CCD6F6]">
                预设 ({presets.length})
              </button>
              {showPresets && (
                <div className="absolute top-9 right-0 z-20 bg-[#0A192F] border border-[#233554] rounded shadow-lg p-2 min-w-[240px]">
                  {presets.length === 0 ? <p className="text-[10px] text-[#8892B0] p-2">暂无预设</p> : presets.map((p, i) => (
                    <button key={i} onClick={() => { setConfig(p.config); setShowPresets(false); toast.info(`已加载预设: ${p.name}`); }} className="w-full text-left px-3 py-2 text-xs text-[#CCD6F6] hover:bg-[#112240] rounded">{p.name}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleSavePreset} className="px-3 py-2 bg-[#112240] border border-[#233554] text-[#4299E1] text-xs rounded hover:text-white">保存预设</button>
            <button onClick={handleRunBacktest} disabled={running} className="flex items-center gap-2 px-4 py-2 bg-[#38B2AC] text-white text-xs rounded hover:brightness-110 disabled:opacity-50">
              <Play className={`w-3 h-3 ${running ? 'animate-spin' : ''}`} /> {running ? '计算中...' : '开始回测'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-[10px] text-[#8892B0] uppercase mb-1 block">策略类型</label>
            <select value={config.strategy.type} onChange={(e) => updateStrategy('type', e.target.value)} className="w-full bg-[#071425] border border-[#233554] rounded px-2 py-1.5 text-xs text-[#CCD6F6]">
              {STRATEGY_TYPES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[#8892B0] uppercase mb-1 block">品种</label>
            <select value={config.symbol} onChange={(e) => setConfig(prev => ({ ...prev, symbol: e.target.value }))} className="w-full bg-[#071425] border border-[#233554] rounded px-2 py-1.5 text-xs text-[#CCD6F6]">
              {['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[#8892B0] uppercase mb-1 block">周期</label>
            <select value={config.interval} onChange={(e) => setConfig(prev => ({ ...prev, interval: e.target.value as BacktestConfig['interval'] }))} className="w-full bg-[#071425] border border-[#233554] rounded px-2 py-1.5 text-xs text-[#CCD6F6]">
              {['5m', '15m', '1h', '4h', '1d'].map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[#8892B0] uppercase mb-1 block">K线数</label>
            <input type="number" value={config.candleCount} min={50} max={500} onChange={(e) => setConfig(prev => ({ ...prev, candleCount: parseInt(e.target.value) || 200 }))} className="w-full bg-[#071425] border border-[#233554] rounded px-2 py-1.5 text-xs text-[#CCD6F6]" />
          </div>
          <div>
            <label className="text-[10px] text-[#8892B0] uppercase mb-1 block">初始资金</label>
            <input type="number" value={config.initialCapital} onChange={(e) => setConfig(prev => ({ ...prev, initialCapital: parseInt(e.target.value) || 100000 }))} className="w-full bg-[#071425] border border-[#233554] rounded px-2 py-1.5 text-xs text-[#CCD6F6]" />
          </div>
          <div>
            <label className="text-[10px] text-[#8892B0] uppercase mb-1 block">仓位比例</label>
            <input type="number" value={config.strategy.positionSize} min={0.05} max={1} step={0.05} onChange={(e) => updateStrategy('positionSize', parseFloat(e.target.value) || 0.2)} className="w-full bg-[#071425] border border-[#233554] rounded px-2 py-1.5 text-xs text-[#CCD6F6]" />
          </div>
        </div>
        {/* Strategy-specific params */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-[#233554]/50">
          {config.strategy.type === 'ma_cross' && (<>
            <div><label className="text-[10px] text-[#8892B0] mb-1 block">快线</label><input type="number" value={config.strategy.fastPeriod} min={2} max={50} onChange={(e) => updateStrategy('fastPeriod', parseInt(e.target.value))} className="w-full bg-[#071425] border border-[#233554] rounded px-2 py-1.5 text-xs text-[#CCD6F6]" /></div>
            <div><label className="text-[10px] text-[#8892B0] mb-1 block">慢线</label><input type="number" value={config.strategy.slowPeriod} min={10} max={200} onChange={(e) => updateStrategy('slowPeriod', parseInt(e.target.value))} className="w-full bg-[#071425] border border-[#233554] rounded px-2 py-1.5 text-xs text-[#CCD6F6]" /></div>
          </>)}
          {config.strategy.type === 'rsi_bounce' && (<>
            <div><label className="text-[10px] text-[#8892B0] mb-1 block">RSI周期</label><input type="number" value={config.strategy.rsiPeriod || 14} min={5} max={50} onChange={(e) => updateStrategy('rsiPeriod', parseInt(e.target.value))} className="w-full bg-[#071425] border border-[#233554] rounded px-2 py-1.5 text-xs text-[#CCD6F6]" /></div>
            <div><label className="text-[10px] text-[#8892B0] mb-1 block">超卖线</label><input type="number" value={config.strategy.rsiOversold || 30} min={10} max={40} onChange={(e) => updateStrategy('rsiOversold', parseInt(e.target.value))} className="w-full bg-[#071425] border border-[#233554] rounded px-2 py-1.5 text-xs text-[#CCD6F6]" /></div>
          </>)}
          {config.strategy.type === 'bollinger_breakout' && (<>
            <div><label className="text-[10px] text-[#8892B0] mb-1 block">BOLL周期</label><input type="number" value={config.strategy.bollPeriod || 20} min={10} max={50} onChange={(e) => updateStrategy('bollPeriod', parseInt(e.target.value))} className="w-full bg-[#071425] border border-[#233554] rounded px-2 py-1.5 text-xs text-[#CCD6F6]" /></div>
            <div><label className="text-[10px] text-[#8892B0] mb-1 block">标准差倍数</label><input type="number" value={config.strategy.bollStdDev || 2} min={1} max={4} step={0.5} onChange={(e) => updateStrategy('bollStdDev', parseFloat(e.target.value))} className="w-full bg-[#071425] border border-[#233554] rounded px-2 py-1.5 text-xs text-[#CCD6F6]" /></div>
          </>)}
          <div><label className="text-[10px] text-[#8892B0] mb-1 block">止损%</label><input type="number" value={config.strategy.stopLoss} min={0.5} max={20} step={0.5} onChange={(e) => updateStrategy('stopLoss', parseFloat(e.target.value))} className="w-full bg-[#071425] border border-[#233554] rounded px-2 py-1.5 text-xs text-[#CCD6F6]" /></div>
          <div><label className="text-[10px] text-[#8892B0] mb-1 block">止盈%</label><input type="number" value={config.strategy.takeProfit} min={1} max={50} step={0.5} onChange={(e) => updateStrategy('takeProfit', parseFloat(e.target.value))} className="w-full bg-[#071425] border border-[#233554] rounded px-2 py-1.5 text-xs text-[#CCD6F6]" /></div>
        </div>
      </Card>

      {result ? (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { label: '累计收益', value: `${result.stats.totalReturn >= 0 ? '+' : ''}${result.stats.totalReturn}%`, color: result.stats.totalReturn >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]' },
              { label: '年化收益', value: `${result.stats.annualizedReturn >= 0 ? '+' : ''}${result.stats.annualizedReturn}%`, color: result.stats.annualizedReturn >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]' },
              { label: '夏普比率', value: result.stats.sharpeRatio.toFixed(2), color: result.stats.sharpeRatio > 1 ? 'text-[#38B2AC]' : 'text-[#ECC94B]' },
              { label: '最大回撤', value: `${result.stats.maxDrawdown}%`, color: 'text-[#F56565]' },
              { label: '胜率', value: `${result.stats.winRate}%`, color: result.stats.winRate > 50 ? 'text-[#38B2AC]' : 'text-[#ECC94B]' },
              { label: '盈亏比', value: result.stats.profitFactor.toFixed(2), color: result.stats.profitFactor > 1 ? 'text-[#38B2AC]' : 'text-[#F56565]' },
              { label: '总交易', value: `${result.stats.totalTrades}笔`, color: 'text-[#4299E1]' },
              { label: 'Alpha', value: `${result.stats.alpha >= 0 ? '+' : ''}${result.stats.alpha}%`, color: result.stats.alpha >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]' },
            ].map((s, i) => (
              <Card key={i} className="p-2.5 text-center">
                <p className="text-[9px] text-[#8892B0] uppercase">{s.label}</p>
                <p className={`text-sm font-mono ${s.color} mt-0.5`}>{s.value}</p>
              </Card>
            ))}
          </div>

          {/* Equity Curve with Trade Markers */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm">收益曲线 vs 基准</h3>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#38B2AC] inline-block" /> 策略</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#8892B0] inline-block" /> Buy&Hold</span>
                <span className="flex items-center gap-1"><span className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#38B2AC] inline-block" /> 买入</span>
                <span className="flex items-center gap-1"><span className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#F56565] inline-block" /> 卖出</span>
                <span className="text-[#8892B0]">{result.dataSource === 'binance' ? '实盘数据' : result.dataSource === 'cache' ? '缓存数据' : '模拟数据'}</span>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#233554" />
                  <XAxis dataKey="time" tick={{ fill: '#8892B0', fontSize: 9 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#8892B0', fontSize: 9 }} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0A192F', border: '1px solid #233554', borderRadius: 8, fontSize: 11 }} labelStyle={{ color: '#8892B0' }} />
                  <ReferenceLine y={0} stroke="#233554" />
                  <Area type="monotone" dataKey="benchmark" stroke="#8892B0" fill="#8892B0" fillOpacity={0.05} strokeWidth={1} name="基准" />
                  <Area type="monotone" dataKey="equity" stroke="#38B2AC" fill="#38B2AC" fillOpacity={0.1} strokeWidth={1.5} name="策略" />
                  <Scatter dataKey="buyMarker" name="买入" shape={<BuyMarker />} />
                  <Scatter dataKey="sellMarker" name="卖出" shape={<SellMarker />} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex justify-end">
              <button onClick={addToComparison} className="text-[10px] text-[#4299E1] hover:underline">+ 添加到策略对比</button>
            </div>
          </Card>

          {/* Drawdown Chart */}
          <Card className="p-4">
            <h3 className="text-white text-sm mb-3">回撤曲线</h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#233554" />
                  <XAxis dataKey="time" tick={{ fill: '#8892B0', fontSize: 9 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#8892B0', fontSize: 9 }} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0A192F', border: '1px solid #233554', borderRadius: 8, fontSize: 11 }} />
                  <ReferenceLine y={0} stroke="#233554" />
                  <Area type="monotone" dataKey="drawdown" stroke="#F56565" fill="#F56565" fillOpacity={0.15} strokeWidth={1} name="回撤" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Trade Log */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm">交易记录 ({result.trades.length} 笔)</h3>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-[#8892B0]">平均持仓: {result.stats.avgHoldingPeriod}</span>
                <span className="text-[#38B2AC]">最佳: +{result.stats.bestTrade}%</span>
                <span className="text-[#F56565]">最差: {result.stats.worstTrade}%</span>
                <button onClick={() => { exportTradesCSV(result.trades, result.symbol, result.strategyType); toast.success('CSV 已导出'); }} className="px-2 py-0.5 bg-[#112240] border border-[#233554] text-[#4299E1] rounded hover:bg-[#1A2B47]">导出 CSV</button>
                <button onClick={() => { exportTradesJSON(result); toast.success('JSON 已导出'); }} className="px-2 py-0.5 bg-[#112240] border border-[#233554] text-[#38B2AC] rounded hover:bg-[#1A2B47]">导出 JSON</button>
              </div>
            </div>
            <div className="overflow-auto max-h-[250px]">
              <table className="w-full text-xs">
                <thead className="text-[#8892B0] uppercase border-b border-[#233554] sticky top-0 bg-[#112240]">
                  <tr>
                    <th className="py-2 px-2 text-left">#</th>
                    <th className="py-2 px-2 text-left">入场时间</th>
                    <th className="py-2 px-2 text-right">入场价</th>
                    <th className="py-2 px-2 text-right">出场价</th>
                    <th className="py-2 px-2 text-right">盈亏</th>
                    <th className="py-2 px-2 text-right">盈亏%</th>
                    <th className="py-2 px-2 text-left">平仓原因</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades.map((t) => (
                    <tr key={t.id} className="border-b border-[#233554]/30 hover:bg-[#112240]">
                      <td className="py-1.5 px-2 text-[#8892B0]">{t.id}</td>
                      <td className="py-1.5 px-2 text-[#8892B0] font-mono">{formatTime(t.entryTime)}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-[#CCD6F6]">{t.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-[#CCD6F6]">{t.exitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className={`py-1.5 px-2 text-right font-mono ${t.pnl >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
                        {t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(2)}
                      </td>
                      <td className={`py-1.5 px-2 text-right font-mono ${t.pnlPercent >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
                        {t.pnlPercent >= 0 ? '+' : ''}{t.pnlPercent.toFixed(2)}%
                      </td>
                      <td className="py-1.5 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                          t.reason === 'stop_loss' ? 'bg-[#F56565]/20 text-[#F56565]' :
                          t.reason === 'take_profit' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' :
                          t.reason === 'signal' ? 'bg-[#4299E1]/20 text-[#4299E1]' :
                          'bg-[#8892B0]/20 text-[#8892B0]'
                        }`}>
                          {t.reason === 'stop_loss' ? '止损' : t.reason === 'take_profit' ? '止盈' : t.reason === 'signal' ? '信号' : '结束'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Multi-Strategy Comparison */}
          {comparison.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm">策略对比 ({comparison.length})</h3>
                <button onClick={() => setComparison([])} className="text-[10px] text-[#F56565] hover:underline">清空对比</button>
              </div>

              {/* Overlaid equity curves chart */}
              {(() => {
                // Merge all equity curves into unified time-axis data
                const maxLen = Math.max(...comparison.map(c => c.equityCurve.length));
                const merged = Array.from({ length: maxLen }, (_, idx) => {
                  const point: Record<string, string | number | undefined> = { time: comparison[0]?.equityCurve[idx]?.time || '' };
                  comparison.forEach((c, ci) => { point[`s${ci}`] = c.equityCurve[idx]?.equity; });
                  return point;
                });
                return (
                  <div className="h-48 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={merged}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#233554" />
                        <XAxis dataKey="time" tick={{ fill: '#8892B0', fontSize: 9 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fill: '#8892B0', fontSize: 9 }} tickFormatter={(v: number) => `${v}%`} />
                        <Tooltip contentStyle={{ backgroundColor: '#0A192F', border: '1px solid #233554', borderRadius: 8, fontSize: 11 }} labelStyle={{ color: '#8892B0' }} />
                        <ReferenceLine y={0} stroke="#233554" />
                        {comparison.map((c, ci) => (
                          <Line key={ci} type="monotone" dataKey={`s${ci}`} stroke={c.color} strokeWidth={1.5} dot={false} name={c.label} connectNulls />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}

              <div className="overflow-auto">
                <table className="w-full text-xs">
                  <thead className="text-[#8892B0] uppercase border-b border-[#233554]">
                    <tr>
                      <th className="py-2 px-2 text-left">策略</th>
                      <th className="py-2 px-2 text-right">收益</th>
                      <th className="py-2 px-2 text-right">夏普</th>
                      <th className="py-2 px-2 text-right">回撤</th>
                      <th className="py-2 px-2 text-right">胜率</th>
                      <th className="py-2 px-2 text-right">盈亏比</th>
                      <th className="py-2 px-2 text-right">Alpha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((c, i) => (
                      <tr key={i} className="border-b border-[#233554]/30 hover:bg-[#112240]">
                        <td className="py-2 px-2"><span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: c.color }} /><span className="text-[#CCD6F6]">{c.label}</span></td>
                        <td className={`py-2 px-2 text-right font-mono ${c.stats.totalReturn >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{c.stats.totalReturn >= 0 ? '+' : ''}{c.stats.totalReturn}%</td>
                        <td className="py-2 px-2 text-right font-mono text-[#CCD6F6]">{c.stats.sharpeRatio}</td>
                        <td className="py-2 px-2 text-right font-mono text-[#F56565]">{c.stats.maxDrawdown}%</td>
                        <td className="py-2 px-2 text-right font-mono text-[#CCD6F6]">{c.stats.winRate}%</td>
                        <td className="py-2 px-2 text-right font-mono text-[#CCD6F6]">{c.stats.profitFactor}</td>
                        <td className={`py-2 px-2 text-right font-mono ${c.stats.alpha >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{c.stats.alpha >= 0 ? '+' : ''}{c.stats.alpha}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Backtest History */}
          {history.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm">回测历史 (最近 {history.length} 次)</h3>
                <button onClick={() => { setHistory([]); saveHistory([]); toast.success('历史已清空'); }} className="text-[10px] text-[#8892B0] hover:text-[#F56565]">清空</button>
              </div>
              <div className="space-y-1 max-h-[150px] overflow-auto">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-[#0A192F] rounded text-[10px] hover:bg-[#112240] cursor-pointer" onClick={() => { setConfig(h.config); toast.info(`已加载配置: ${h.strategyType} · ${h.symbol}`); }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[#CCD6F6]">{h.strategyType}</span>
                      <span className="text-[#8892B0]">{h.symbol}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono ${h.stats.totalReturn >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{h.stats.totalReturn >= 0 ? '+' : ''}{h.stats.totalReturn}%</span>
                      <span className="text-[#8892B0]">{new Date(h.time).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <BarChart2 className="w-12 h-12 text-[#233554] mx-auto mb-4" />
          <p className="text-[#8892B0] text-sm mb-2">配置策略参数后点击「开始回测」</p>
          <p className="text-[#8892B0] text-[10px]">回测引擎将从 Binance 获取历史 K 线数据（含模拟降级）</p>
          <p className="text-[#8892B0] text-[10px]">支持 4 种策略类型 · 自动止损止盈 · 完整统计报告 · localStorage 预设持久化</p>
          {presets.length > 0 && <p className="text-[#4299E1] text-[10px] mt-2">{presets.length} 个已保存预设可用</p>}
        </Card>
      )}
      {showPresets && <div className="fixed inset-0 z-10" onClick={() => setShowPresets(false)} />}
    </div>
  );
};

// ══════════════════════════════════════
// Optimization Sub-module
// ══════════════════════════════════════
const OptimizeModule = () => {
  const [runningTask, setRunningTask] = useState<string | null>(null);
  const { navigateTo } = useGlobalData();

  const handleRunOptimization = (type: string, label: string, estimatedTime: string) => {
    if (runningTask) { toast.warning('已有优化任务正在执行，请等待完成'); return; }
    setRunningTask(type);
    getAnalytics().trackFeatureUse('run_optimization', { type });
    toast.promise(new Promise(resolve => setTimeout(resolve, 3000)), {
      loading: `${label}运行中... (预计${estimatedTime})`,
      success: () => { setRunningTask(null); return `${label}完成 · 策略收益提升 +${(Math.random() * 5 + 1).toFixed(1)}%`; },
      error: () => { setRunningTask(null); return `${label}失败`; },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { type: 'grid', label: '参数优化', icon: <SettingsIcon className={`w-4 h-4 text-[#4299E1] ${runningTask === 'grid' ? 'animate-spin' : ''}`} />, desc: '网格搜索和贝叶斯优化', time: '5分钟', color: '#4299E1' },
          { type: 'ai', label: 'AI 优化', icon: <Zap className={`w-4 h-4 text-[#38B2AC] ${runningTask === 'ai' ? 'animate-pulse' : ''}`} />, desc: '深度强化学习自动优化', time: '15分钟', color: '#38B2AC' },
          { type: 'quantum', label: '量子优化', icon: <Zap className="w-4 h-4 text-[#ECC94B]" />, desc: '量子退火算法全局寻优', time: '需量子资源', color: '#ECC94B' },
        ].map(opt => (
          <Card key={opt.type} className={`p-4 hover:border-[#38B2AC]/50 transition-colors cursor-pointer ${runningTask === opt.type ? `border-[${opt.color}]/50` : ''}`}
            onClick={() => opt.type === 'quantum' ? (() => { toast('量子优化需要连接量子计算资源'); setTimeout(() => navigateTo('quantum', 'engine'), 800); })() : handleRunOptimization(opt.type, opt.label, opt.time)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `${opt.color}15` }}>{opt.icon}</div>
              <h4 className="text-white text-sm">{opt.label}</h4>
            </div>
            <p className="text-[#8892B0] text-xs mb-3">{opt.desc}</p>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#8892B0]">{opt.type === 'quantum' ? '需量子资源' : `预计: ${opt.time}`}</span>
              <span className={runningTask === opt.type ? 'text-[#38B2AC] animate-pulse' : 'text-[#8892B0]'}>{runningTask === opt.type ? '运行中...' : '就绪'}</span>
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="text-white text-sm mb-4">优化历史记录</h3>
        <div className="space-y-2">
          {[
            { name: '参数网格搜索 #12', time: '2小时前', improvement: '+3.2%', params: 'fast=8, slow=26' },
            { name: 'AI强化学习 #5', time: '昨天', improvement: '+5.8%', params: '自适应参数组' },
            { name: '参数网格搜索 #11', time: '3天前', improvement: '+1.5%', params: 'fast=10, slow=30' },
            { name: '量子退火优化 #2', time: '5天前', improvement: '+8.1%', params: '多维参数空间' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[#0A192F] rounded border border-[#233554]/50 hover:border-[#233554] cursor-pointer" onClick={() => toast(`${item.name}`, { description: `最优参数: ${item.params} · 收益提升: ${item.improvement}` })}>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#38B2AC]" />
                <div><span className="text-[#CCD6F6] text-xs">{item.name}</span><span className="text-[#8892B0] text-[10px] block">{item.params}</span></div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[#38B2AC] text-xs font-mono">{item.improvement}</span>
                <span className="text-[#8892B0] text-[10px]">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ══════════════════════════════════════
// Simulation Sub-module
// ══════════════════════════════════════
const SimulationModule = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: '模拟余额', value: '125,680 USDT', icon: <BarChart2 className="w-4 h-4" />, color: 'text-white' },
        { label: '持仓盈亏', value: '+2,580 USDT', icon: <TrendingUp className="w-4 h-4" />, color: 'text-[#38B2AC]' },
        { label: '今日交易', value: '12 笔', icon: <Clock className="w-4 h-4" />, color: 'text-[#4299E1]' },
        { label: '胜率', value: '66.7%', icon: <CheckCircle className="w-4 h-4" />, color: 'text-[#ECC94B]' },
      ].map((s, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between mb-2"><span className="text-[10px] text-[#8892B0] uppercase">{s.label}</span><span className="text-[#233554]">{s.icon}</span></div>
          <p className={`text-lg font-mono ${s.color}`}>{s.value}</p>
        </Card>
      ))}
    </div>
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm">模拟持仓</h3>
        <span className="text-[10px] text-[#38B2AC] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#38B2AC] animate-pulse" /> 运行中</span>
      </div>
      <table className="w-full text-xs">
        <thead className="text-[#8892B0] uppercase border-b border-[#233554]"><tr><th className="py-2 px-3 text-left">品种</th><th className="py-2 px-3 text-left">策略</th><th className="py-2 px-3 text-right">方向</th><th className="py-2 px-3 text-right">数量</th><th className="py-2 px-3 text-right">成本</th><th className="py-2 px-3 text-right">现价</th><th className="py-2 px-3 text-right">盈亏</th></tr></thead>
        <tbody>
          {[
            { symbol: 'BTC/USDT', strategy: '双均线交叉', side: 'LONG', qty: '0.05', cost: '95,200', current: '96,231', pnl: '+$51.55' },
            { symbol: 'ETH/USDT', strategy: 'RSI反弹', side: 'LONG', qty: '2.0', cost: '2,380', current: '2,451', pnl: '+$142.00' },
            { symbol: 'SOL/USDT', strategy: 'MACD背离', side: 'SHORT', qty: '50', cost: '148.50', current: '142.85', pnl: '+$282.50' },
          ].map((p, i) => (
            <tr key={i} className="border-b border-[#233554]/30 hover:bg-[#112240]">
              <td className="py-2 px-3 text-white">{p.symbol}</td>
              <td className="py-2 px-3 text-[#8892B0]">{p.strategy}</td>
              <td className="py-2 px-3 text-right"><span className={`px-2 py-0.5 rounded text-[10px] ${p.side === 'LONG' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#F56565]/20 text-[#F56565]'}`}>{p.side}</span></td>
              <td className="py-2 px-3 text-right font-mono text-[#CCD6F6]">{p.qty}</td>
              <td className="py-2 px-3 text-right font-mono text-[#8892B0]">{p.cost}</td>
              <td className="py-2 px-3 text-right font-mono text-[#CCD6F6]">{p.current}</td>
              <td className={`py-2 px-3 text-right font-mono ${p.pnl.startsWith('+') ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{p.pnl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

// ══════════════════════════════════════
// Strategy Management
// ══════════════════════════════════════
const ManageModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { strategies, navigateTo } = useGlobalData();
  const filtered = strategies.filter(s => s.name.includes(searchTerm) || s.type.includes(searchTerm));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892B0]" />
          <input className="bg-[#071425] border border-[#233554] rounded-lg pl-9 pr-4 py-2 text-xs text-[#CCD6F6] focus:outline-none focus:border-[#4299E1] w-64" placeholder="搜索策略名称/类型..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateTo('risk', 'live_risk')} className="flex items-center gap-2 px-3 py-2 bg-[#112240] border border-[#233554] text-xs text-[#ECC94B] rounded hover:bg-[#1A2B47]"><Shield className="w-3 h-3" /> 风控联动</button>
          <button onClick={() => navigateTo('model', 'app')} className="flex items-center gap-2 px-3 py-2 bg-[#112240] border border-[#233554] text-xs text-[#4299E1] rounded hover:bg-[#1A2B47]"><Zap className="w-3 h-3" /> 模型对接</button>
          <button onClick={() => toast.success('新建策略')} className="flex items-center gap-2 px-3 py-2 bg-[#38B2AC] text-white text-xs rounded hover:brightness-110"><Plus className="w-3 h-3" /> 新建策略</button>
          <button onClick={() => toast.info('导入策略', { description: '支持 .py / .json / .yaml 格式' })} className="flex items-center gap-2 px-3 py-2 bg-[#112240] border border-[#233554] text-xs text-[#CCD6F6] rounded hover:bg-[#1A2B47]"><Download className="w-3 h-3" /> 导入</button>
        </div>
      </div>
      <div className="grid gap-3">
        {filtered.map((s) => (
          <Card key={s.id} className="p-4 hover:border-[#38B2AC]/30 transition-colors cursor-pointer" onClick={() => toast(`${s.name}`, { description: `收益: ${s.pnl} · 胜率: ${s.winRate}%` })}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-[#38B2AC]' : s.status === 'testing' ? 'bg-[#ECC94B] animate-pulse' : 'bg-[#8892B0]'}`} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-white text-sm">{s.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 bg-[#071425] border border-[#233554] rounded text-[#8892B0]">{s.version}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-[#4299E1]/10 text-[#4299E1] rounded">{s.type}</span>
                    {s.linkedModel && <button onClick={() => navigateTo('model', 'library')} className="text-[10px] px-2 py-0.5 bg-[#38B2AC]/10 text-[#38B2AC] rounded hover:bg-[#38B2AC]/20">模型: {s.linkedModel}</button>}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-[10px] text-[#8892B0]">
                    <span>胜率: <span className="text-[#CCD6F6]">{s.winRate}%</span></span>
                    <span>夏普: <span className="text-[#CCD6F6]">{s.sharpe}</span></span>
                    <span>交易: <span className="text-[#CCD6F6]">{s.trades}笔</span></span>
                    <span>最大回撤: <span className="text-[#F56565]">{s.maxDD}</span></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-mono ${s.pnl.startsWith('+') ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{s.pnl}</span>
                <div className="flex items-center gap-1">
                  <GitBranch onClick={() => toast.info(`${s.name} 版本历史`)} className="w-3 h-3 text-[#8892B0] cursor-pointer hover:text-[#CCD6F6]" />
                  <Copy onClick={() => toast.success(`已克隆: ${s.name}`)} className="w-3 h-3 text-[#8892B0] cursor-pointer hover:text-[#CCD6F6]" />
                  <Shield onClick={() => toast.info(`${s.name} 风控设置`)} className="w-3 h-3 text-[#8892B0] cursor-pointer hover:text-[#CCD6F6]" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════
// Module Router
// ══════════════════════════════════════
export const StrategyModule = ({ activeSub, activeTertiary }: { activeSub: string; activeTertiary?: string }) => {
  const renderContent = () => {
    switch (activeSub) {
      case 'edit': return <StrategyEditor activeTertiary={activeTertiary || '代码编辑'} />;
      case 'backtest': return <BacktestModule activeTertiary={activeTertiary || '回测设置'} />;
      case 'optimize': return <OptimizeModule />;
      case 'sim': return <SimulationModule />;
      case 'manage': return <ManageModule />;
      default: return <StrategyEditor activeTertiary={activeTertiary || '代码编辑'} />;
    }
  };

  return <div className="space-y-4">{renderContent()}</div>;
};
