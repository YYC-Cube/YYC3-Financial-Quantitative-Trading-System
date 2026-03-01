import React, { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/Card';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';
import { DataFlowMap } from '@/app/components/DataFlowMap';
import { getAnalytics } from '@/app/services/AnalyticsService';
import { toast } from 'sonner';
import { DocsModule } from './DocsModule';

type IconProps = React.SVGProps<SVGSVGElement>;

// Inline icons
const Settings = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0" /></svg>;
const User = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const Shield = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const Database = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
const Download = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" strokeWidth={2} /><line x1="12" y1="15" x2="12" y2="3" strokeWidth={2} /></svg>;
const Monitor = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="3" rx="2" strokeWidth={2} /><line x1="8" y1="21" x2="16" y2="21" strokeWidth={2} /><line x1="12" y1="17" x2="12" y2="21" strokeWidth={2} /></svg>;
const AlertTriangle = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const CheckCircle = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Search = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const Plus = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const Calendar = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4M8 2v4M3 10h18" /></svg>;
const Flag = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" strokeWidth={2} /></svg>;
const Link2 = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7h3a5 5 0 010 10h-3m-6 0H6A5 5 0 016 7h3" /><line x1="8" y1="12" x2="16" y2="12" strokeWidth={2} /></svg>;
const Rocket = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>;
const BarChart3 = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 17V9M13 17V5M8 17v-3" /></svg>;

// System Config
const SysModule = () => {
  const [notifications, setNotifications] = useState([
    { name: '邮件通知', desc: '系统��警/日报推送', enabled: true },
    { name: 'WebSocket推送', desc: '实时行情/预警通知', enabled: true },
    { name: '钉钉机器人', desc: '团队协作通知', enabled: false },
    { name: '短信通知', desc: '紧急风控预警', enabled: true },
    { name: '语音通知', desc: '极端风险事件', enabled: false },
  ]);

  const toggleNotification = (index: number) => {
    setNotifications(prev => {
      const next = [...prev];
      next[index] = { ...next[index], enabled: !next[index].enabled };
      toast.success(`${next[index].name} 已${next[index].enabled ? '开启' : '关闭'}`);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-white text-sm mb-4">基础配置</h3>
          <div className="space-y-3">
            {[
              { label: '系统名称', value: '言语云量化分析交易系统', type: 'text' },
              { label: '系统版本', value: 'v2.8.5', type: 'text' },
              { label: '默认语言', value: 'zh-CN', type: 'select' },
              { label: '时区', value: 'Asia/Shanghai (UTC+8)', type: 'select' },
              { label: '数据更新频率', value: '3秒', type: 'select' },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[#0A192F] rounded">
                <span className="text-[#8892B0] text-xs">{c.label}</span>
                <input className="bg-[#071425] border border-[#233554] rounded px-3 py-1 text-xs text-right text-[#CCD6F6] focus:outline-none focus:border-[#4299E1] w-48" defaultValue={c.value} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-white text-sm mb-4">通知配置</h3>
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[#0A192F] rounded">
                <div>
                  <span className="text-[#CCD6F6] text-xs">{n.name}</span>
                  <span className="text-[10px] text-[#8892B0] block">{n.desc}</span>
                </div>
                <button 
                  onClick={() => toggleNotification(i)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${n.enabled ? 'bg-[#38B2AC]' : 'bg-[#233554]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${n.enabled ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Auth Module
const AuthModule = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892B0]" />
        <input className="bg-[#071425] border border-[#233554] rounded-lg pl-9 pr-4 py-2 text-xs text-[#CCD6F6] focus:outline-none focus:border-[#4299E1] w-64" placeholder="搜索用户..." />
      </div>
      <button className="flex items-center gap-2 px-3 py-2 bg-[#38B2AC] text-white text-xs rounded hover:brightness-110">
        <Plus className="w-3 h-3" /> 新用户
      </button>
    </div>

    <Card className="p-4">
      <h3 className="text-white text-sm mb-4">用户管理</h3>
      <table className="w-full text-xs">
        <thead className="text-[#8892B0] uppercase border-b border-[#233554]">
          <tr>
            <th className="py-2 px-3 text-left">用户</th>
            <th className="py-2 px-3 text-left">角色</th>
            <th className="py-2 px-3 text-left">团队</th>
            <th className="py-2 px-3 text-right">最后登录</th>
            <th className="py-2 px-3 text-left">状态</th>
          </tr>
        </thead>
        <tbody>
          {[
            { name: '张管理员', email: 'admin@yanyu.ai', role: '超级管理员', team: '系统组', lastLogin: '在线', status: '活跃' },
            { name: '李策略师', email: 'strategy@yanyu.ai', role: '策略研究员', team: '策略组', lastLogin: '1小时前', status: '活跃' },
            { name: '王交易员', email: 'trader@yanyu.ai', role: '交易员', team: '交易组', lastLogin: '30分钟前', status: '活跃' },
            { name: '赵风控', email: 'risk@yanyu.ai', role: '风控经理', team: '风控组', lastLogin: '2小时前', status: '活跃' },
            { name: '陈数据', email: 'data@yanyu.ai', role: '数据工程师', team: '数据组', lastLogin: '3天前', status: '离线' },
          ].map((u, i) => (
            <tr key={i} className="border-b border-[#233554]/30 hover:bg-[#112240]">
              <td className="py-2 px-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#112240] rounded-full border border-[#233554] flex items-center justify-center">
                    <User className="w-3 h-3 text-[#CCD6F6]" />
                  </div>
                  <div>
                    <span className="text-white">{u.name}</span>
                    <span className="text-[10px] text-[#8892B0] block">{u.email}</span>
                  </div>
                </div>
              </td>
              <td className="py-2 px-3">
                <span className={`px-2 py-0.5 rounded text-[10px] ${u.role === '超级管理员' ? 'bg-[#F56565]/20 text-[#F56565]' : 'bg-[#4299E1]/20 text-[#4299E1]'}`}>{u.role}</span>
              </td>
              <td className="py-2 px-3 text-[#8892B0]">{u.team}</td>
              <td className="py-2 px-3 text-right text-[#8892B0]">{u.lastLogin}</td>
              <td className="py-2 px-3">
                <span className={`text-[10px] ${u.status === '活跃' ? 'text-[#38B2AC]' : 'text-[#8892B0]'}`}>{u.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

// Monitor & Logs
const MonitorModule = () => (
  <div className="space-y-6">
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm">系统日志</h3>
        <div className="flex items-center gap-2">
          {['全部', '操作', '错误', '性能'].map(tab => (
            <button key={tab} className="px-3 py-1 text-xs text-[#8892B0] hover:text-[#CCD6F6] hover:bg-[#112240] rounded">{tab}</button>
          ))}
        </div>
      </div>
      <div className="space-y-1 font-mono text-[10px] bg-[#071425] rounded p-3 max-h-[400px] overflow-auto">
        {[
          { time: '14:32:15.245', level: 'INFO', msg: '[Trade] BTC/USDT 买入订单已成交 @ 96,231.50 (0.05 BTC)' },
          { time: '14:32:14.892', level: 'INFO', msg: '[WebSocket] Binance 行情数据已同步 (延迟: 12ms)' },
          { time: '14:28:05.150', level: 'WARN', msg: '[Risk] SOL/USDT 杠杆率接近上限 (8x / 10x)' },
          { time: '14:15:22.820', level: 'INFO', msg: '[Strategy] 双均线交叉策略 触发买入信号 (BTC/USDT)' },
          { time: '14:12:10.440', level: 'ERROR', msg: '[API] CoinGecko 请求超时 (timeout: 5000ms) - 已自动重试' },
          { time: '14:10:09.120', level: 'INFO', msg: '[Model] LSTM预测模型输出: BTC 未来1h 上涨概率 72.5%' },
          { time: '14:08:45.680', level: 'INFO', msg: '[System] 数据备份任已完成 (增量: 2.3GB)' },
          { time: '14:05:22.350', level: 'WARN', msg: '[Alert] VIX 指数突破 20 阈值 (当前: 20.45)' },
          { time: '14:02:15.190', level: 'INFO', msg: '[Auth] 用户 张管理员 登录系统 (IP: 192.168.1.100)' },
          { time: '14:00:00.001', level: 'INFO', msg: '[Scheduler] 定时任务调度器已启动 (8个任务)' },
        ].map((log, i) => (
          <div key={i} className={`flex gap-2 py-1 ${log.level === 'ERROR' ? 'text-[#F56565]' : log.level === 'WARN' ? 'text-[#ECC94B]' : 'text-[#8892B0]'}`}>
            <span className="text-[#233554] shrink-0">{log.time}</span>
            <span className={`w-12 shrink-0 ${log.level === 'ERROR' ? 'text-[#F56565]' : log.level === 'WARN' ? 'text-[#ECC94B]' : 'text-[#38B2AC]'}`}>[{log.level}]</span>
            <span className="text-[#CCD6F6]">{log.msg}</span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// Backup Module
const BackupModule = () => {
  const handleExportBacktestHistory = (format: 'csv' | 'json') => {
    try {
      const raw = localStorage.getItem('yyc_bt_history');
      if (!raw) { toast.info('暂无回测历史数据'); return; }
      const history = JSON.parse(raw);
      if (!Array.isArray(history) || history.length === 0) { toast.info('暂无回测历史数据'); return; }

      if (format === 'json') {
        const blob = new Blob([JSON.stringify({ exportTime: new Date().toISOString(), type: 'backtest_history', count: history.length, entries: history }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `yyc-backtest-history-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
        toast.success(`���导出 ${history.length} 条回测记录 (JSON)`);
      } else {
        const header = '时间,策略类型,品种,收益%,夏普比率,最大回撤%,胜率%,Alpha%,总交易数';
        const rows = history.map((h: { time: number; strategyType: string; symbol: string; stats: { totalReturn: number; sharpeRatio: number; maxDrawdown: number; winRate: number; alpha: number; totalTrades: number } }) =>
          `${new Date(h.time).toISOString()},${h.strategyType},${h.symbol},${h.stats.totalReturn},${h.stats.sharpeRatio},${h.stats.maxDrawdown},${h.stats.winRate},${h.stats.alpha},${h.stats.totalTrades}`
        );
        const csv = [header, ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `yyc-backtest-history-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
        toast.success(`已导出 ${history.length} 条回测记录 (CSV)`);
      }
    } catch { toast.error('导出失败'); }
  };

  const handleExportPresets = () => {
    try {
      const raw = localStorage.getItem('yyc_bt_presets');
      if (!raw) { toast.info('暂无策略预设'); return; }
      const presets = JSON.parse(raw);
      const blob = new Blob([JSON.stringify({ exportTime: new Date().toISOString(), type: 'strategy_presets', presets }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `yyc-strategy-presets-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
      toast.success(`已导出 ${presets.length} 个策略预设`);
    } catch { toast.error('导出失败'); }
  };

  const handleExportFavorites = () => {
    try {
      const raw = localStorage.getItem('yyc_favorites');
      if (!raw) { toast.info('暂无自选列表'); return; }
      const blob = new Blob([JSON.stringify({ exportTime: new Date().toISOString(), type: 'favorites', data: JSON.parse(raw) }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `yyc-favorites-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
      toast.success('自选列表已导出');
    } catch { toast.error('导出失败'); }
  };

  // Count localStorage items
  const btHistoryCount = (() => { try { const s = localStorage.getItem('yyc_bt_history'); return s ? JSON.parse(s).length : 0; } catch { return 0; } })();
  const btPresetCount = (() => { try { const s = localStorage.getItem('yyc_bt_presets'); return s ? JSON.parse(s).length : 0; } catch { return 0; } })();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '最近备份', value: '2小时前', color: 'text-[#38B2AC]' },
          { label: '备份总量', value: '128 GB', color: 'text-[#4299E1]' },
          { label: '备份数量', value: '45 个', color: 'text-white' },
          { label: '下次备份', value: '22:00', color: 'text-[#ECC94B]' },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <p className="text-[10px] text-[#8892B0] uppercase">{s.label}</p>
            <p className={`text-xl font-mono ${s.color} mt-1`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Data Export Center */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm">数据导出中心</h3>
          <span className="text-[10px] text-[#8892B0]">支持 CSV / JSON 格式</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-[#0A192F] rounded border border-[#233554]/50">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[#CCD6F6] text-xs">回测交易历史</span>
                <span className="text-[10px] text-[#8892B0] block mt-0.5">{btHistoryCount} 条记录 · 含策略参数和统计指标</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleExportBacktestHistory('csv')} className="flex items-center gap-1 px-3 py-1.5 bg-[#112240] border border-[#233554] text-[#4299E1] text-[10px] rounded hover:bg-[#1A2B47]">
                <Download className="w-3 h-3" /> CSV
              </button>
              <button onClick={() => handleExportBacktestHistory('json')} className="flex items-center gap-1 px-3 py-1.5 bg-[#112240] border border-[#233554] text-[#38B2AC] text-[10px] rounded hover:bg-[#1A2B47]">
                <Download className="w-3 h-3" /> JSON
              </button>
            </div>
          </div>
          <div className="p-3 bg-[#0A192F] rounded border border-[#233554]/50">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[#CCD6F6] text-xs">策略预设配置</span>
                <span className="text-[10px] text-[#8892B0] block mt-0.5">{btPresetCount} 个预设 · 含完整策略参数</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleExportPresets} className="flex items-center gap-1 px-3 py-1.5 bg-[#112240] border border-[#233554] text-[#38B2AC] text-[10px] rounded hover:bg-[#1A2B47]">
                <Download className="w-3 h-3" /> JSON
              </button>
            </div>
          </div>
          <div className="p-3 bg-[#0A192F] rounded border border-[#233554]/50">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[#CCD6F6] text-xs">自选列表</span>
                <span className="text-[10px] text-[#8892B0] block mt-0.5">收藏品种列表 · 跨组件同步</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleExportFavorites} className="flex items-center gap-1 px-3 py-1.5 bg-[#112240] border border-[#233554] text-[#4299E1] text-[10px] rounded hover:bg-[#1A2B47]">
                <Download className="w-3 h-3" /> JSON
              </button>
            </div>
          </div>
          <div className="p-3 bg-[#0A192F] rounded border border-[#233554]/50">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[#CCD6F6] text-xs">使用分析数据</span>
                <span className="text-[10px] text-[#8892B0] block mt-0.5">前端埋点 · AnalyticsService</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { getAnalytics().downloadExport(); toast.success('分析数据已导出 (JSON)'); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#112240] border border-[#233554] text-[#ECC94B] text-[10px] rounded hover:bg-[#1A2B47]">
                <Download className="w-3 h-3" /> JSON
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Backup History */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm">备份历史</h3>
          <button className="px-3 py-1.5 bg-[#38B2AC] text-white text-xs rounded hover:brightness-110 flex items-center gap-2">
            <Database className="w-3 h-3" /> 立即备份
          </button>
        </div>
        <div className="space-y-2">
          {[
            { time: '2026-02-18 12:00', type: '增量备份', size: '2.3 GB', duration: '45s', status: '成功' },
            { time: '2026-02-18 00:00', type: '全量备份', size: '18.5 GB', duration: '12m', status: '成功' },
            { time: '2026-02-17 12:00', type: '增量备份', size: '1.8 GB', duration: '38s', status: '成功' },
            { time: '2026-02-17 00:00', type: '全量备份', size: '18.2 GB', duration: '11m', status: '成功' },
            { time: '2026-02-16 12:00', type: '增量备份', size: '3.1 GB', duration: '52s', status: '成功' },
          ].map((b, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[#0A192F] rounded border border-[#233554]/50">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#38B2AC]" />
                <div>
                  <span className="text-[#CCD6F6] text-xs">{b.time}</span>
                  <span className="text-[10px] text-[#8892B0] block">{b.type} | {b.size} | {b.duration}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#38B2AC]">{b.status}</span>
                <button className="text-[10px] text-[#4299E1] hover:underline">恢复</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Plugin Module
const PluginModule = () => (
  <div className="space-y-6">
    <Card className="p-4">
      <h3 className="text-white text-sm mb-4">模块管理</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { name: '市场数据模块', status: '已启用', version: 'v2.8', health: '正常' },
          { name: '智能策略模块', status: '已启用', version: 'v2.5', health: '正常' },
          { name: '风险管控模块', status: '已启用', version: 'v2.3', health: '正常' },
          { name: '量子计算模块', status: '已启用', version: 'v1.5', health: '正常' },
          { name: '数据管理模块', status: '已启用', version: 'v3.0', health: '正常' },
          { name: '量化工坊模块', status: '已启用', version: 'v2.1', health: '正常' },
          { name: '交易中心模块', status: '已启用', version: 'v2.8', health: '正常' },
          { name: '管理后台模块', status: '已启用', version: 'v2.0', health: '正常' },
        ].map((mod, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-[#0A192F] rounded border border-[#233554]/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#38B2AC]" />
              <span className="text-[#CCD6F6] text-xs">{mod.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-[#071425] border border-[#233554] rounded text-[#8892B0]">{mod.version}</span>
            </div>
            <span className="text-[10px] text-[#38B2AC]">{mod.health}</span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// Big Screen Monitor - Cross-Module Data Dashboard
const ScreenModule = () => {
  const { marketData, positions, account, strategies, activeStrategies, riskMetrics, systemMetrics, recentTrades, formatPrice, formatUSD, formatPercent, navigateTo } = useGlobalData();

  const btcAsset = marketData.find(a => a.symbol === 'BTC/USDT');
  const ethAsset = marketData.find(a => a.symbol === 'ETH/USDT');
  const totalUnrealizedPnl = positions.reduce((s, p) => s + p.unrealizedPnl, 0);

  return (
    <div className="space-y-4">
      {/* Data Flow Map */}
      <DataFlowMap onNavigate={(module) => navigateTo(module)} />

      {/* Row 1: Key Metrics from All Modules */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: '总资产', value: `$${account.totalAssets.toLocaleString(undefined, {maximumFractionDigits:0})}`, color: 'text-white', module: 'trade', sub: 'real', tertiary: '资产监控' },
          { label: '今日盈亏', value: formatUSD(account.todayPnl), color: account.todayPnl >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]', module: 'trade', sub: 'logs' },
          { label: 'BTC', value: btcAsset ? formatPrice(btcAsset.price) : '--', color: 'text-white', module: 'market', sub: 'live' },
          { label: '活跃策略', value: `${activeStrategies.length}个`, color: 'text-[#4299E1]', module: 'strategy', sub: 'manage' },
          { label: 'VaR(95%)', value: `$${Math.abs(riskMetrics.portfolioVaR95).toLocaleString()}`, color: 'text-[#F56565]', module: 'risk', sub: 'quantum_risk' },
          { label: '量子算力', value: `${systemMetrics.quantumQubits} Qb`, color: 'text-[#38B2AC]', module: 'quantum', sub: 'resource' },
        ].map((s, i) => (
          <Card 
            key={i} 
            className="p-3 cursor-pointer hover:border-[#38B2AC]/50 transition-colors"
            onClick={() => navigateTo(s.module, s.sub)}
          >
            <p className="text-[10px] text-[#8892B0] uppercase">{s.label}</p>
            <p className={`text-lg font-mono ${s.color} mt-1`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Live Positions from Trade */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm">实时持仓</h3>
            <button onClick={() => navigateTo('trade', 'real', '资产监控')} className="text-[10px] text-[#4299E1] hover:underline">详情 &rarr;</button>
          </div>
          <div className="space-y-2">
            {positions.map((pos, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[#0A192F] rounded border border-[#233554]/50">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${pos.unrealizedPnl >= 0 ? 'bg-[#38B2AC]' : 'bg-[#F56565]'}`} />
                  <div>
                    <span className="text-[#CCD6F6] text-xs">{pos.symbol}</span>
                    <span className="text-[10px] text-[#8892B0] block">{pos.strategy}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-[#CCD6F6] block">{formatPrice(pos.currentPrice)}</span>
                  <span className={`text-[10px] font-mono ${pos.unrealizedPnl >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
                    {formatUSD(pos.unrealizedPnl)}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-[#233554]">
              <span className="text-[10px] text-[#8892B0]">未实现盈亏合计</span>
              <span className={`text-sm font-mono ${totalUnrealizedPnl >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{formatUSD(totalUnrealizedPnl)}</span>
            </div>
          </div>
        </Card>

        {/* Center: Strategy Performance */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm">策略概览</h3>
            <button onClick={() => navigateTo('strategy', 'manage')} className="text-[10px] text-[#4299E1] hover:underline">管理 &rarr;</button>
          </div>
          <div className="space-y-2">
            {strategies.map((strat, i) => (
              <div key={strat.id} className="flex items-center justify-between p-2 bg-[#0A192F] rounded border border-[#233554]/50">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${strat.status === 'active' ? 'bg-[#38B2AC]' : strat.status === 'testing' ? 'bg-[#ECC94B] animate-pulse' : 'bg-[#8892B0]'}`} />
                  <div>
                    <span className="text-[#CCD6F6] text-xs">{strat.name}</span>
                    <span className="text-[10px] text-[#8892B0] block">{strat.type} | 夏普 {strat.sharpe}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-mono ${strat.pnl.startsWith('+') ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{strat.pnl}</span>
                  <span className="text-[10px] text-[#8892B0] block">胜率 {strat.winRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Risk & System */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm">系统 & 风控</h3>
            <button onClick={() => navigateTo('risk', 'live_risk')} className="text-[10px] text-[#4299E1] hover:underline">风控中心 &rarr;</button>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] text-[#8892B0] mb-1">
                <span>CPU</span><span>{Math.round(systemMetrics.cpuUsage)}%</span>
              </div>
              <div className="h-2 bg-[#071425] rounded overflow-hidden">
                <div className={`h-full rounded transition-all duration-1000 ${systemMetrics.cpuUsage > 70 ? 'bg-[#F56565]' : 'bg-[#38B2AC]'}`} style={{ width: `${systemMetrics.cpuUsage}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-[#8892B0] mb-1">
                <span>内存</span><span>{Math.round(systemMetrics.memoryUsage)}%</span>
              </div>
              <div className="h-2 bg-[#071425] rounded overflow-hidden">
                <div className={`h-full rounded transition-all duration-1000 ${systemMetrics.memoryUsage > 80 ? 'bg-[#F56565]' : 'bg-[#ECC94B]'}`} style={{ width: `${systemMetrics.memoryUsage}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-[#8892B0] mb-1">
                <span>网络延迟</span><span>{Math.round(systemMetrics.networkLatency)}ms</span>
              </div>
              <div className="h-2 bg-[#071425] rounded overflow-hidden">
                <div className={`h-full rounded transition-all duration-1000 ${systemMetrics.networkLatency > 30 ? 'bg-[#ECC94B]' : 'bg-[#38B2AC]'}`} style={{ width: `${Math.min(100, systemMetrics.networkLatency * 2)}%` }} />
              </div>
            </div>
            <div className="pt-2 border-t border-[#233554] space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#8892B0]">量子保真度</span>
                <span className="text-[#38B2AC] font-mono">{systemMetrics.quantumFidelity.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#8892B0]">夏普比率</span>
                <span className="text-[#4299E1] font-mono">{riskMetrics.sharpeRatio}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#8892B0]">最大回撤</span>
                <span className="text-[#F56565] font-mono">{riskMetrics.maxDrawdown}%</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#8892B0]">BTC相关性</span>
                <span className="text-[#CCD6F6] font-mono">{riskMetrics.correlationBTC}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Recent Trades & Market Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm">最近交易</h3>
            <button onClick={() => navigateTo('trade', 'logs')} className="text-[10px] text-[#4299E1] hover:underline">全部日志 &rarr;</button>
          </div>
          <div className="space-y-1">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-2 bg-[#0A192F] rounded text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="text-[#8892B0]">{trade.time}</span>
                  <span className="text-white">{trade.symbol}</span>
                  <span className={`px-1.5 py-0.5 rounded ${trade.side === 'BUY' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#F56565]/20 text-[#F56565]'}`}>{trade.side}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#CCD6F6]">{trade.price}</span>
                  <span className={`font-mono ${trade.pnl.startsWith('+') ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{trade.pnl}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm">市场行情</h3>
            <button onClick={() => navigateTo('market', 'live', '全球行情')} className="text-[10px] text-[#4299E1] hover:underline">全部行情 &rarr;</button>
          </div>
          <div className="space-y-1">
            {marketData.slice(0, 8).map((asset, i) => (
              <div key={asset.symbol} className="flex items-center justify-between p-2 bg-[#0A192F] rounded text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs">{asset.symbol}</span>
                  <span className="text-[#8892B0]">{asset.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#CCD6F6]">{formatPrice(asset.price)}</span>
                  <span className={`font-mono ${asset.change >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
                    {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Service Status */}
      <Card className="p-4">
        <h3 className="text-white text-sm mb-3">模块服务态</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { name: '市场数据', status: 'UP', latency: `${Math.round(systemMetrics.networkLatency)}ms` },
            { name: '策略引擎', status: 'UP', latency: '8ms' },
            { name: '风控计算', status: 'UP', latency: '15ms' },
            { name: '量子桥接', status: 'UP', latency: '45ms' },
            { name: '数据管道', status: 'UP', latency: '12ms' },
            { name: '模型服务', status: 'UP', latency: '15ms' },
            { name: '交易执行', status: 'UP', latency: '3ms' },
            { name: 'API网关', status: 'UP', latency: '5ms' },
          ].map((svc, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-[#0A192F] rounded border border-[#233554]/50">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38B2AC]" />
                <span className="text-[#CCD6F6] text-xs">{svc.name}</span>
              </div>
              <span className="text-[10px] text-[#38B2AC] font-mono">{svc.latency}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// Project Planning Module (项目规划)
// ════════════════════════════════════════════════════════

// Re-use Calendar, Link2, BarChart3 from top-level icon declarations
const FlagIcon = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" strokeWidth={2} /></svg>;
const RocketIcon = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" /></svg>;

type MilestoneStatus = 'completed' | 'in-progress' | 'planned' | 'blocked';

const MILESTONES = [
  {
    id: 'M1', phase: 'Phase 1', name: '基础架构与类型系统',
    description: '完成全局类型权威源(global.ts 19个分区)、服务接口定义(interfaces.ts 8个服务)、测试框架(tests.ts 47用例)',
    status: 'completed' as MilestoneStatus, progress: 100,
    startDate: '2025-11-01', endDate: '2026-01-15', owner: '架构组',
    dependencies: [] as string[],
    deliverables: ['global.ts 类型权威源', 'interfaces.ts + MockApiService', 'tests.ts 47 用例', 'GlobalDataContext 跨模块互通'],
    risks: [] as string[],
  },
  {
    id: 'M2', phase: 'Phase 1', name: '八大业务模块框架',
    description: '完成market/strategy/risk/quantum/bigdata/model/trade/admin 8个一级模块的骨架渲染及导航分发',
    status: 'completed' as MilestoneStatus, progress: 100,
    startDate: '2025-12-01', endDate: '2026-02-01', owner: '前端组',
    dependencies: ['M1'],
    deliverables: ['8个Module组件', 'navigation.tsx 导航定义', 'Sidebar/Navbar/MobileNav 布局', '状态导航 switch 机制'],
    risks: [] as string[],
  },
  {
    id: 'M3', phase: 'Phase 2', name: '运行时稳定性修复',
    description: 'Vite HMR错误根因排查与修复：radix-ui别名重定向、SW卸载、empty-module Proxy、大小写冲突消解',
    status: 'completed' as MilestoneStatus, progress: 100,
    startDate: '2026-02-10', endDate: '2026-02-25', owner: '架构组',
    dependencies: ['M2'],
    deliverables: ['vite.config.ts 别名数组', 'empty-module.ts Proxy模式', 'SW反注册逻辑', 'injectPWAMeta 安全方案'],
    risks: [] as string[],
  },
  {
    id: 'M4', phase: 'Phase 2', name: '实时数据管道',
    description: 'Binance WebSocket 接入、CoinGecko REST 轮询、ExchangeAggregator 多交易所聚合、BinanceDepthService 深度数据',
    status: 'in-progress' as MilestoneStatus, progress: 78,
    startDate: '2026-02-01', endDate: '2026-03-15', owner: '数据组',
    dependencies: ['M1', 'M3'],
    deliverables: ['BinanceService WebSocket', 'CoinGeckoService REST', 'ExchangeAggregator 聚合引擎', 'BinanceDepthService 深度流'],
    risks: ['WebSocket连接不稳定需重连机制', '交易所API限流'],
  },
  {
    id: 'M5', phase: 'Phase 3', name: '模型配置与训练管道',
    description: '量化模型选型(LSTM/Transformer/XGBoost/量子混合)、超参数配置、训练监控、评估指标体系',
    status: 'in-progress' as MilestoneStatus, progress: 55,
    startDate: '2026-02-15', endDate: '2026-04-01', owner: '算法组',
    dependencies: ['M4'],
    deliverables: ['6个预置模型架构', '超参数配置面板', '训练进度监控', '评估报告生成'],
    risks: ['GPU资源不足影响训练速度', '模型过拟合风险'],
  },
  {
    id: 'M6', phase: 'Phase 3', name: 'API网关与服务对接',
    description: '8个服务接口从Mock切换到真实后端：MarketService/StrategyService/TradeService等',
    status: 'planned' as MilestoneStatus, progress: 15,
    startDate: '2026-03-01', endDate: '2026-05-01', owner: '后端组',
    dependencies: ['M4', 'M5'],
    deliverables: ['API Gateway 配置', '8个Service实现', '鉴权中间件', '限流熔断机制'],
    risks: ['后端服务延迟超标', 'Mock→Real切换回归风险'],
  },
  {
    id: 'M7', phase: 'Phase 4', name: '量子计算桥接层',
    description: '量子-经典混合计算框架、QAOA/VQE算法封装、量子风险计算、量子组合优化',
    status: 'planned' as MilestoneStatus, progress: 10,
    startDate: '2026-04-01', endDate: '2026-06-15', owner: '量子组',
    dependencies: ['M5', 'M6'],
    deliverables: ['Quantum Bridge SDK', 'QAOA算法封装', 'VQE求解器', '量子资源调度器'],
    risks: ['量子硬件可用性不确定', '量子噪声影响计算精度'],
  },
  {
    id: 'M8', phase: 'Phase 4', name: '生产环境部署与监控',
    description: '容器化部署、CI/CD流水线、APM监控、全链路追踪、灾备方案',
    status: 'planned' as MilestoneStatus, progress: 5,
    startDate: '2026-05-01', endDate: '2026-07-01', owner: '运维组',
    dependencies: ['M6', 'M7'],
    deliverables: ['Docker/K8s编排', 'CI/CD Pipeline', 'APM + Grafana面板', '全链路TraceId'],
    risks: ['容器镜像体积控制', '多区域部署网络延迟'],
  },
];

const MilestoneView = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const statusConfig: Record<MilestoneStatus, { color: string; bg: string; label: string }> = {
    'completed': { color: 'text-[#38B2AC]', bg: 'bg-[#38B2AC]', label: '已完成' },
    'in-progress': { color: 'text-[#4299E1]', bg: 'bg-[#4299E1]', label: '进行中' },
    'planned': { color: 'text-[#8892B0]', bg: 'bg-[#8892B0]', label: '计划中' },
    'blocked': { color: 'text-[#F56565]', bg: 'bg-[#F56565]', label: '阻塞' },
  };
  const totalProgress = Math.round(MILESTONES.reduce((s, m) => s + m.progress, 0) / MILESTONES.length);
  const completedCount = MILESTONES.filter(m => m.status === 'completed').length;
  const inProgressCount = MILESTONES.filter(m => m.status === 'in-progress').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-[10px] text-[#8892B0] uppercase">总体进度</p>
          <p className="text-2xl font-mono text-white mt-1">{totalProgress}%</p>
          <div className="h-1.5 bg-[#071425] rounded mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#38B2AC] to-[#4299E1] rounded" style={{ width: `${totalProgress}%` }} />
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] text-[#8892B0] uppercase">已完成</p>
          <p className="text-2xl font-mono text-[#38B2AC] mt-1">{completedCount}/{MILESTONES.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] text-[#8892B0] uppercase">进行中</p>
          <p className="text-2xl font-mono text-[#4299E1] mt-1">{inProgressCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] text-[#8892B0] uppercase">预计完成</p>
          <p className="text-2xl font-mono text-[#ECC94B] mt-1">2026-07</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm flex items-center gap-2"><FlagIcon className="w-4 h-4 text-[#4299E1]" /> 里程碑时间线</h3>
          <span className="text-[10px] text-[#8892B0]">Phase 1-4 · 8个关键节点</span>
        </div>
        <div className="space-y-3">
          {MILESTONES.map((ms) => {
            const sc = statusConfig[ms.status];
            const isExpanded = expandedId === ms.id;
            return (
              <div key={ms.id}>
                <div className={`p-4 bg-[#0A192F] rounded border transition-all cursor-pointer hover:border-[#4299E1]/30 ${isExpanded ? 'border-[#4299E1]/50' : 'border-[#233554]/50'}`} onClick={() => setExpandedId(isExpanded ? null : ms.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sc.bg}/20`}>
                        <span className={`text-xs font-mono ${sc.color}`}>{ms.id}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 bg-[#071425] border border-[#233554] rounded text-[#8892B0]">{ms.phase}</span>
                          <h4 className="text-[#CCD6F6] text-xs">{ms.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded ${sc.bg}/20 ${sc.color}`}>{sc.label}</span>
                        </div>
                        <p className="text-[10px] text-[#8892B0] mt-1 line-clamp-1">{ms.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-[10px] text-[#8892B0] flex-wrap">
                          <span><Calendar className="w-3 h-3 inline mr-1" />{ms.startDate} → {ms.endDate}</span>
                          <span>负责: <span className="text-[#CCD6F6]">{ms.owner}</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className={`text-sm font-mono ${sc.color}`}>{ms.progress}%</span>
                        <div className="w-20 h-1.5 bg-[#071425] rounded mt-1 overflow-hidden">
                          <div className={`h-full rounded ${sc.bg}`} style={{ width: `${ms.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[#233554]/50 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h5 className="text-[10px] text-[#8892B0] uppercase mb-2">交付物</h5>
                        {ms.deliverables.map((d, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] mb-1">
                            <CheckCircle className="w-3 h-3 text-[#38B2AC] shrink-0" />
                            <span className="text-[#CCD6F6]">{d}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h5 className="text-[10px] text-[#8892B0] uppercase mb-2">依赖关系</h5>
                        {ms.dependencies.length > 0 ? ms.dependencies.map((dep, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] mb-1">
                            <Link2 className="w-3 h-3 text-[#4299E1] shrink-0" />
                            <span className="text-[#CCD6F6]">{dep} — {MILESTONES.find(m => m.id === dep)?.name || dep}</span>
                          </div>
                        )) : <span className="text-[10px] text-[#8892B0]">无依赖</span>}
                      </div>
                      <div>
                        <h5 className="text-[10px] text-[#8892B0] uppercase mb-2">风险项</h5>
                        {ms.risks.length > 0 ? ms.risks.map((r, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] mb-1">
                            <AlertTriangle className="w-3 h-3 text-[#ECC94B] shrink-0" />
                            <span className="text-[#CCD6F6]">{r}</span>
                          </div>
                        )) : <span className="text-[10px] text-[#38B2AC]">无已知风险</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

const ModelConfigView = () => {
  const [selectedModel, setSelectedModel] = useState(0);
  const modelConfigs = [
    {
      id: 0, name: 'LSTM价格预测', type: 'AI · 深度学习', version: 'v3.1', status: '已部署',
      architecture: { layers: 3, hiddenSize: 256, dropout: 0.2, bidirectional: true, attention: true },
      hyperparams: { learningRate: '1e-4', batchSize: 64, epochs: 100, optimizer: 'AdamW', scheduler: 'CosineAnnealing', warmupEpochs: 5, weightDecay: 0.01, earlyStoppingPatience: 10, gradientClipping: 1.0 },
      data: { inputFeatures: ['close', 'volume', 'SMA_20', 'RSI_14', 'MACD', 'BB_upper', 'BB_lower', 'ATR_14', 'OBV', 'VWAP'], targetVariable: 'close_1h_return', lookback: 60, horizon: 1, trainRatio: 0.7, valRatio: 0.15, testRatio: 0.15, normalization: 'MinMaxScaler', augmentation: '时间窗口滑动' },
      performance: { accuracy: '78.5%', sharpe: 1.62, maxDD: '-9.1%', latency: '8ms', qps: '12,500/min' },
      apiEndpoint: '/api/v1/model/lstm-predict',
    },
    {
      id: 1, name: 'Transformer多因子', type: 'AI · Attention', version: 'v2.0', status: '已部署',
      architecture: { layers: 6, heads: 8, dModel: 512, ffnDim: 2048, dropout: 0.1, posEncoding: 'learnable' },
      hyperparams: { learningRate: '3e-5', batchSize: 32, epochs: 80, optimizer: 'AdamW', scheduler: 'WarmupLinearDecay', warmupEpochs: 8, weightDecay: 0.05, earlyStoppingPatience: 15, gradientClipping: 0.5 },
      data: { inputFeatures: ['price_momentum', 'vol_ratio', 'funding_rate', 'oi_change', 'whale_flow', 'sentiment_score', 'macro_index', 'sector_rotation'], targetVariable: 'multi_factor_alpha', lookback: 120, horizon: 4, trainRatio: 0.65, valRatio: 0.15, testRatio: 0.20, normalization: 'StandardScaler', augmentation: '因子旋转增强' },
      performance: { accuracy: '82.3%', sharpe: 1.95, maxDD: '-6.8%', latency: '15ms', qps: '8,200/min' },
      apiEndpoint: '/api/v1/model/transformer-multi-factor',
    },
    {
      id: 2, name: 'XGBoost波动率', type: '经典ML · 集成', version: 'v1.5', status: '训练中',
      architecture: { nEstimators: 500, maxDepth: 8, minChildWeight: 3, subsample: 0.8, colsampleBytree: 0.8 },
      hyperparams: { learningRate: '0.05', booster: 'gbtree', objective: 'reg:squarederror', evalMetric: 'rmse', gamma: 0.1, regAlpha: 0.1, regLambda: 1.0, earlyStoppingPatience: 20, nFold: 5 },
      data: { inputFeatures: ['realized_vol', 'implied_vol', 'vol_skew', 'put_call_ratio', 'vix_proxy', 'garch_forecast'], targetVariable: 'realized_vol_1d', lookback: 30, horizon: 1, trainRatio: 0.7, valRatio: 0.15, testRatio: 0.15, normalization: 'RobustScaler', augmentation: 'SMOTE过采样' },
      performance: { accuracy: '75.8%', sharpe: 1.38, maxDD: '-11.5%', latency: '3ms', qps: '25,000/min' },
      apiEndpoint: '/api/v1/model/xgboost-vol',
    },
    {
      id: 3, name: '量子-经典混合模型', type: '量子 · VQE/QAOA', version: 'v1.0', status: '测试中',
      architecture: { classicalLayers: 2, quantumCircuitDepth: 4, qubits: 12, entanglement: 'full', ansatz: 'EfficientSU2' },
      hyperparams: { learningRate: '0.01', optimizer: 'COBYLA', maxIter: 200, shots: 8192, backend: 'ibm_brisbane', errorMitigation: 'ZNE', classicalOptimizer: 'Adam', hybridIterations: 50 },
      data: { inputFeatures: ['return_matrix', 'correlation_matrix', 'constraint_vector'], targetVariable: 'optimal_weights', lookback: 60, horizon: 5, trainRatio: 0.6, valRatio: 0.2, testRatio: 0.2, normalization: 'QuantumEncode', augmentation: '噪声注入增强' },
      performance: { accuracy: '85.1%', sharpe: 2.12, maxDD: '-5.2%', latency: '120ms', qps: '500/min' },
      apiEndpoint: '/api/v1/model/quantum-hybrid',
    },
    {
      id: 4, name: 'GRU情绪分析', type: 'AI · NLP', version: 'v2.3', status: '已部署',
      architecture: { gruLayers: 2, hiddenSize: 128, embeddingDim: 768, vocabSize: 50000, pretrainedEmbedding: 'BERT-base-chinese' },
      hyperparams: { learningRate: '2e-5', batchSize: 128, epochs: 50, optimizer: 'Adam', scheduler: 'ReduceLROnPlateau', warmupEpochs: 3, weightDecay: 0.001, earlyStoppingPatience: 8, gradientClipping: 1.0 },
      data: { inputFeatures: ['news_text', 'social_media', 'analyst_reports', 'forum_posts'], targetVariable: 'sentiment_score', lookback: 24, horizon: 6, trainRatio: 0.7, valRatio: 0.15, testRatio: 0.15, normalization: 'TokenizerBERT', augmentation: '回译数据增强' },
      performance: { accuracy: '71.2%', sharpe: 1.15, maxDD: '-14.2%', latency: '12ms', qps: '3,800/min' },
      apiEndpoint: '/api/v1/model/gru-sentiment',
    },
    {
      id: 5, name: 'Black-Scholes扩展', type: '经典 · 解析', version: 'v5.0', status: '已部署',
      architecture: { method: 'Monte Carlo + Analytical', simulations: 100000, timeSteps: 252, varianceReduction: 'Antithetic + Control' },
      hyperparams: { riskFreeRate: '0.045', dividendYield: '0.0', volatilityModel: 'Heston', meanReversion: 0.5, longRunVariance: 0.04, volOfVol: 0.3, correlation: -0.7, jumpIntensity: 0.1 },
      data: { inputFeatures: ['spot_price', 'strike', 'maturity', 'implied_vol_surface', 'interest_rate_curve'], targetVariable: 'option_fair_value', lookback: 1, horizon: 1, trainRatio: 0, valRatio: 0, testRatio: 1, normalization: 'N/A (解析模型)', augmentation: 'N/A' },
      performance: { accuracy: '92.1%', sharpe: 0, maxDD: 'N/A', latency: '2ms', qps: '50,000/min' },
      apiEndpoint: '/api/v1/model/bs-extended',
    },
  ];
  const sel = modelConfigs[selectedModel];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        {modelConfigs.map((mc, i) => (
          <button key={mc.id} onClick={() => setSelectedModel(i)} className={`px-3 py-1.5 text-xs rounded transition-all ${selectedModel === i ? 'bg-[#4299E1] text-white' : 'bg-[#112240] text-[#8892B0] hover:text-[#CCD6F6] border border-[#233554]'}`}>{mc.name}</button>
        ))}
      </div>
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#4299E1]/10 border border-[#233554] flex items-center justify-center"><Settings className="w-6 h-6 text-[#4299E1]" /></div>
            <div>
              <h3 className="text-white text-sm flex items-center gap-2">
                {sel.name}
                <span className="text-[10px] px-2 py-0.5 bg-[#071425] border border-[#233554] rounded text-[#8892B0]">{sel.version}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${sel.status === '已部署' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : sel.status === '训练中' ? 'bg-[#ECC94B]/20 text-[#ECC94B]' : 'bg-[#4299E1]/20 text-[#4299E1]'}`}>{sel.status}</span>
              </h3>
              <p className="text-[10px] text-[#8892B0] mt-0.5">{sel.type} · 端点: <span className="font-mono text-[#CCD6F6]">{sel.apiEndpoint}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <div className="text-center px-3"><span className="text-[#8892B0] block">准确率</span><span className="text-[#38B2AC] font-mono text-sm">{sel.performance.accuracy}</span></div>
            <div className="text-center px-3 border-l border-[#233554]"><span className="text-[#8892B0] block">夏普</span><span className="text-[#4299E1] font-mono text-sm">{sel.performance.sharpe}</span></div>
            <div className="text-center px-3 border-l border-[#233554]"><span className="text-[#8892B0] block">QPS</span><span className="text-[#CCD6F6] font-mono text-sm">{sel.performance.qps}</span></div>
            <div className="text-center px-3 border-l border-[#233554]"><span className="text-[#8892B0] block">延迟</span><span className="text-[#CCD6F6] font-mono text-sm">{sel.performance.latency}</span></div>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="text-[#8892B0] text-xs uppercase mb-3">模型架构</h4>
          <div className="space-y-2">{Object.entries(sel.architecture).map(([k, v]) => (<div key={k} className="flex items-center justify-between p-2 bg-[#0A192F] rounded text-xs"><span className="text-[#8892B0]">{k}</span><span className="text-[#CCD6F6] font-mono">{String(v)}</span></div>))}</div>
        </Card>
        <Card className="p-4">
          <h4 className="text-[#8892B0] text-xs uppercase mb-3">超参数配置</h4>
          <div className="space-y-2">{Object.entries(sel.hyperparams).map(([k, v]) => (<div key={k} className="flex items-center justify-between p-2 bg-[#0A192F] rounded text-xs"><span className="text-[#8892B0]">{k}</span><span className="text-[#CCD6F6] font-mono">{String(v)}</span></div>))}</div>
        </Card>
        <Card className="p-4 lg:col-span-2">
          <h4 className="text-[#8892B0] text-xs uppercase mb-3">数据管道配置</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="p-2 bg-[#0A192F] rounded text-xs flex justify-between"><span className="text-[#8892B0]">目标变量</span><span className="text-[#38B2AC] font-mono">{sel.data.targetVariable}</span></div>
              <div className="p-2 bg-[#0A192F] rounded text-xs flex justify-between"><span className="text-[#8892B0]">回溯窗口</span><span className="text-[#CCD6F6] font-mono">{sel.data.lookback} 周期</span></div>
              <div className="p-2 bg-[#0A192F] rounded text-xs flex justify-between"><span className="text-[#8892B0]">预测跨度</span><span className="text-[#CCD6F6] font-mono">{sel.data.horizon} 周期</span></div>
              <div className="p-2 bg-[#0A192F] rounded text-xs flex justify-between"><span className="text-[#8892B0]">数据划分</span><span className="text-[#CCD6F6] font-mono">Train {sel.data.trainRatio*100}% / Val {sel.data.valRatio*100}% / Test {sel.data.testRatio*100}%</span></div>
              <div className="p-2 bg-[#0A192F] rounded text-xs flex justify-between"><span className="text-[#8892B0]">标准化</span><span className="text-[#CCD6F6] font-mono">{sel.data.normalization}</span></div>
              <div className="p-2 bg-[#0A192F] rounded text-xs flex justify-between"><span className="text-[#8892B0]">数据增强</span><span className="text-[#CCD6F6] font-mono">{sel.data.augmentation}</span></div>
            </div>
            <div>
              <h5 className="text-[10px] text-[#8892B0] uppercase mb-2">输入特征 ({sel.data.inputFeatures.length}个)</h5>
              <div className="flex flex-wrap gap-1.5">{sel.data.inputFeatures.map((f, i) => (<span key={i} className="text-[10px] px-2 py-1 bg-[#071425] border border-[#233554] rounded text-[#4299E1] font-mono">{f}</span>))}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const ApiIntegrationView = () => {
  const apiServices = [
    { name: 'IMarketService', module: '市场数据', status: 'partial', endpoints: [
      { method: 'GET', path: '/api/v1/market/assets', desc: '全量行情资产', impl: 'mock', latency: '~50ms' },
      { method: 'GET', path: '/api/v1/market/ticker/:symbol', desc: '单品种Ticker', impl: 'live', latency: '~8ms' },
      { method: 'GET', path: '/api/v1/market/klines', desc: 'K线历史', impl: 'live', latency: '~120ms' },
      { method: 'GET', path: '/api/v1/market/depth/:symbol', desc: '深度数据', impl: 'live', latency: '~15ms' },
      { method: 'GET', path: '/api/v1/market/aggregated/:symbol', desc: '多交易所聚合报价', impl: 'mock', latency: '~200ms' },
    ]},
    { name: 'IStrategyService', module: '智能策略', status: 'mock', endpoints: [
      { method: 'GET', path: '/api/v1/strategy/list', desc: '策略列表', impl: 'mock', latency: '~30ms' },
      { method: 'POST', path: '/api/v1/strategy', desc: '创建策略', impl: 'mock', latency: '~100ms' },
      { method: 'POST', path: '/api/v1/strategy/:id/start', desc: '启动策略', impl: 'mock', latency: '~50ms' },
      { method: 'POST', path: '/api/v1/backtest/run', desc: '回测执行', impl: 'local', latency: '~3s' },
    ]},
    { name: 'ITradeService', module: '交易中心', status: 'mock', endpoints: [
      { method: 'POST', path: '/api/v1/trade/order', desc: '下单', impl: 'mock', latency: '~50ms' },
      { method: 'DELETE', path: '/api/v1/trade/order/:id', desc: '撤单', impl: 'mock', latency: '~30ms' },
      { method: 'GET', path: '/api/v1/trade/positions', desc: '持仓查询', impl: 'mock', latency: '~20ms' },
      { method: 'GET', path: '/api/v1/trade/history', desc: '交易记录(分页)', impl: 'mock', latency: '~80ms' },
    ]},
    { name: 'IRiskService', module: '风险管控', status: 'mock', endpoints: [
      { method: 'GET', path: '/api/v1/risk/metrics', desc: '风险指标', impl: 'mock', latency: '~30ms' },
      { method: 'POST', path: '/api/v1/risk/stress-test', desc: '压力测试', impl: 'mock', latency: '~2s' },
      { method: 'GET', path: '/api/v1/risk/var-history', desc: 'VaR历史', impl: 'mock', latency: '~100ms' },
    ]},
    { name: 'IAlertService', module: '预警系统', status: 'local', endpoints: [
      { method: 'GET', path: '/api/v1/alerts', desc: '预警列表', impl: 'local', latency: '~5ms' },
      { method: 'POST', path: '/api/v1/alerts/threshold', desc: '添加阈值', impl: 'local', latency: '~5ms' },
      { method: 'PUT', path: '/api/v1/alerts/:id/read', desc: '标记已读', impl: 'local', latency: '~5ms' },
    ]},
    { name: 'ISystemService', module: '系统管理', status: 'partial', endpoints: [
      { method: 'GET', path: '/api/v1/system/metrics', desc: '系统指标', impl: 'local', latency: '~5ms' },
      { method: 'GET', path: '/api/v1/system/cross-module', desc: '跨模块摘要', impl: 'local', latency: '~10ms' },
      { method: 'GET', path: '/api/v1/system/model-metrics', desc: '模型指标', impl: 'mock', latency: '~20ms' },
    ]},
    { name: 'IArbitrageService', module: '套利引擎', status: 'mock', endpoints: [
      { method: 'GET', path: '/api/v1/arbitrage/signals', desc: '套利信号', impl: 'mock', latency: '~50ms' },
      { method: 'POST', path: '/api/v1/arbitrage/execute/:id', desc: '执行套利', impl: 'mock', latency: '~200ms' },
    ]},
    { name: 'IAccountService', module: '账户管理', status: 'mock', endpoints: [
      { method: 'GET', path: '/api/v1/account/info', desc: '账户概览', impl: 'mock', latency: '~20ms' },
      { method: 'GET', path: '/api/v1/account/multi', desc: '多账户汇总', impl: 'mock', latency: '~50ms' },
    ]},
  ];
  const implColor: Record<string, string> = { 'live': 'text-[#38B2AC] bg-[#38B2AC]/10', 'local': 'text-[#4299E1] bg-[#4299E1]/10', 'mock': 'text-[#ECC94B] bg-[#ECC94B]/10' };
  const statusLabel: Record<string, { text: string; color: string }> = { 'live': { text: '已对接', color: 'text-[#38B2AC]' }, 'partial': { text: '部分对接', color: 'text-[#4299E1]' }, 'local': { text: '本地实现', color: 'text-[#4299E1]' }, 'mock': { text: 'Mock模式', color: 'text-[#ECC94B]' } };
  const totalEndpoints = apiServices.reduce((s, svc) => s + svc.endpoints.length, 0);
  const liveCount = apiServices.reduce((s, svc) => s + svc.endpoints.filter(e => e.impl === 'live').length, 0);
  const localCount = apiServices.reduce((s, svc) => s + svc.endpoints.filter(e => e.impl === 'local').length, 0);
  const mockCount = totalEndpoints - liveCount - localCount;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-[10px] text-[#8892B0] uppercase">服务接口</p><p className="text-2xl font-mono text-white mt-1">{apiServices.length}</p></Card>
        <Card className="p-4"><p className="text-[10px] text-[#8892B0] uppercase">端点总数</p><p className="text-2xl font-mono text-[#4299E1] mt-1">{totalEndpoints}</p></Card>
        <Card className="p-4">
          <p className="text-[10px] text-[#8892B0] uppercase">已对接 (Live/Local)</p>
          <p className="text-2xl font-mono text-[#38B2AC] mt-1">{liveCount + localCount}</p>
          <div className="h-1.5 bg-[#071425] rounded mt-2 overflow-hidden"><div className="h-full bg-[#38B2AC] rounded" style={{ width: `${((liveCount + localCount) / totalEndpoints) * 100}%` }} /></div>
        </Card>
        <Card className="p-4"><p className="text-[10px] text-[#8892B0] uppercase">Mock待替换</p><p className="text-2xl font-mono text-[#ECC94B] mt-1">{mockCount}</p></Card>
      </div>
      <div className="space-y-4">
        {apiServices.map((svc) => {
          const sl = statusLabel[svc.status];
          return (
            <Card key={svc.name} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3"><Link2 className="w-4 h-4 text-[#4299E1]" /><h4 className="text-[#CCD6F6] text-xs font-mono">{svc.name}</h4><span className="text-[10px] px-2 py-0.5 bg-[#071425] border border-[#233554] rounded text-[#8892B0]">{svc.module}</span></div>
                <span className={`text-[10px] ${sl.color}`}>{sl.text}</span>
              </div>
              <div className="space-y-1">
                {svc.endpoints.map((ep, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-[#0A192F] rounded text-[10px]">
                    <div className="flex items-center gap-3">
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${ep.method === 'GET' ? 'bg-[#38B2AC]/10 text-[#38B2AC]' : ep.method === 'POST' ? 'bg-[#4299E1]/10 text-[#4299E1]' : ep.method === 'PUT' ? 'bg-[#ECC94B]/10 text-[#ECC94B]' : 'bg-[#F56565]/10 text-[#F56565]'}`}>{ep.method}</span>
                      <span className="text-[#CCD6F6] font-mono">{ep.path}</span>
                      <span className="text-[#8892B0] hidden md:inline">{ep.desc}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#8892B0] font-mono">{ep.latency}</span>
                      <span className={`px-2 py-0.5 rounded ${implColor[ep.impl] || ''}`}>{ep.impl}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
      <Card className="p-4 border-dashed border-[#4299E1]/30">
        <h4 className="text-white text-sm mb-3 flex items-center gap-2"><RocketIcon className="w-4 h-4 text-[#4299E1]" /> Mock → Real 迁移计划</h4>
        <div className="space-y-2">
          {[
            { phase: 'Phase 1 (2026-Q1)', items: 'MarketService 全量对接（Binance WS + CoinGecko REST）', status: '进行中', progress: 78 },
            { phase: 'Phase 2 (2026-Q2)', items: 'TradeService + AccountService + StrategyService 对接', status: '计划中', progress: 0 },
            { phase: 'Phase 3 (2026-Q2)', items: 'RiskService + ArbitrageService 对接', status: '计划中', progress: 0 },
            { phase: 'Phase 4 (2026-Q3)', items: 'SystemService 全量 + API Gateway + 鉴权中间件', status: '计划中', progress: 0 },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[#0A192F] rounded border border-[#233554]/50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-[#4299E1] font-mono">{p.phase}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${p.status === '进行中' ? 'bg-[#4299E1]/20 text-[#4299E1]' : 'bg-[#8892B0]/10 text-[#8892B0]'}`}>{p.status}</span>
                </div>
                <p className="text-[#CCD6F6] text-xs mt-1">{p.items}</p>
              </div>
              {p.progress > 0 && <div className="w-16 text-right"><span className="text-[10px] text-[#38B2AC] font-mono">{p.progress}%</span><div className="h-1 bg-[#071425] rounded mt-1 overflow-hidden"><div className="h-full bg-[#38B2AC] rounded" style={{ width: `${p.progress}%` }} /></div></div>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const ReleasePlanView = () => {
  const releases = [
    { version: 'v2.8.5', date: '2026-02-25', status: 'current', type: 'Patch', changes: [
      { type: 'fix', desc: 'Vite HMR "Failed to fetch dynamically imported module" 根因修复' },
      { type: 'fix', desc: '@radix-ui 别名重定向至 empty-module.ts Proxy' },
      { type: 'fix', desc: 'Service Worker 反注册，消除 stale-while-revalidate 缓存干扰' },
      { type: 'feat', desc: '项目规划模块上线（里程碑/模型配置/API对接/发布计划）' },
      { type: 'feat', desc: '使用分析模块上线（热力图/转化路径/会话统计）' },
    ]},
    { version: 'v2.9.0', date: '2026-03-15', status: 'planned', type: 'Minor', changes: [
      { type: 'feat', desc: 'Binance WebSocket 深度数据服务完整接入' },
      { type: 'feat', desc: 'ExchangeAggregator 多交易所聚合报价' },
      { type: 'improve', desc: 'GlobalDataContext 性能优化（selector模式减少re-render）' },
    ]},
    { version: 'v3.0.0', date: '2026-05-01', status: 'planned', type: 'Major', changes: [
      { type: 'feat', desc: 'API Gateway 上线，8个服务接口从 Mock 切换到 Real' },
      { type: 'feat', desc: '用户鉴权与多租户支持' },
      { type: 'feat', desc: '量子-经典混合模型 v1.0 正式部署' },
      { type: 'breaking', desc: 'MockApiService 标记为 deprecated' },
    ]},
    { version: 'v3.1.0', date: '2026-07-01', status: 'planned', type: 'Minor', changes: [
      { type: 'feat', desc: '量子加密安全���块 QKD 协议支持' },
      { type: 'feat', desc: 'Docker/K8s 容器化部署方案' },
      { type: 'feat', desc: 'APM 全链路追踪 (OpenTelemetry)' },
    ]},
  ];
  const typeColor: Record<string, string> = { 'feat': 'text-[#38B2AC] bg-[#38B2AC]/10', 'fix': 'text-[#4299E1] bg-[#4299E1]/10', 'improve': 'text-[#ECC94B] bg-[#ECC94B]/10', 'breaking': 'text-[#F56565] bg-[#F56565]/10' };
  const typeLabel: Record<string, string> = { feat: '新功能', fix: '修复', improve: '优化', breaking: '破坏性' };

  return (
    <div className="space-y-4">
      {releases.map((rel) => (
        <Card key={rel.version} className={`p-4 ${rel.status === 'current' ? 'border-[#38B2AC]/50' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <RocketIcon className={`w-5 h-5 ${rel.status === 'current' ? 'text-[#38B2AC]' : 'text-[#8892B0]'}`} />
              <div>
                <h4 className="text-white text-sm flex items-center gap-2">
                  {rel.version}
                  <span className={`text-[10px] px-2 py-0.5 rounded ${rel.status === 'current' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#8892B0]/10 text-[#8892B0]'}`}>{rel.status === 'current' ? '当前版本' : '计划中'}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#071425] border border-[#233554] rounded text-[#8892B0]">{rel.type}</span>
                </h4>
                <p className="text-[10px] text-[#8892B0] mt-0.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> {rel.date}</p>
              </div>
            </div>
            <span className="text-[10px] text-[#8892B0]">{rel.changes.length} 项变更</span>
          </div>
          <div className="space-y-1.5">
            {rel.changes.map((ch, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-[#0A192F] rounded text-[10px]">
                <span className={`px-2 py-0.5 rounded shrink-0 ${typeColor[ch.type] || ''}`}>{typeLabel[ch.type] || ch.type}</span>
                <span className="text-[#CCD6F6]">{ch.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

const PlanModule = ({ activeTertiary }: { activeTertiary: string }) => {
  switch (activeTertiary) {
    case '模型配置': return <ModelConfigView />;
    case 'API对接': return <ApiIntegrationView />;
    case '发布计划': return <ReleasePlanView />;
    case '里程碑':
    default: return <MilestoneView />;
  }
};

// ════════════════════════════════════════════════════════
// Analytics Module (使用分析)
// ═══���════════════════════════════════════════════════════

const AnalyticsPageModule = ({ activeTertiary }: { activeTertiary: string }) => {
  const [dateRange, setDateRange] = useState('7d');
  const moduleHeat = [
    { name: '市场数据', visits: 12840, duration: '4m 32s', bounceRate: '12%', heat: 95 },
    { name: '交易中心', visits: 8920, duration: '6m 15s', bounceRate: '8%', heat: 82 },
    { name: '智能策略', visits: 6530, duration: '8m 45s', bounceRate: '15%', heat: 68 },
    { name: '风险管控', visits: 4210, duration: '5m 20s', bounceRate: '18%', heat: 55 },
    { name: '量化工坊', visits: 3680, duration: '12m 10s', bounceRate: '10%', heat: 48 },
    { name: '数据管理', visits: 2950, duration: '3m 50s', bounceRate: '22%', heat: 38 },
    { name: '量子计算', visits: 1820, duration: '7m 30s', bounceRate: '25%', heat: 24 },
    { name: '管理后台', visits: 1240, duration: '9m 05s', bounceRate: '5%', heat: 16 },
  ];

  const renderHeatmap = () => (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[#4299E1]" /> 模块访问热力图</h3>
        <div className="flex items-center gap-2">{['24h', '7d', '30d'].map(r => (<button key={r} onClick={() => setDateRange(r)} className={`px-2 py-1 text-[10px] rounded ${dateRange === r ? 'bg-[#4299E1] text-white' : 'text-[#8892B0] hover:text-[#CCD6F6]'}`}>{r}</button>))}</div>
      </div>
      <div className="space-y-2">
        {moduleHeat.map((m) => (
          <div key={m.name} className="flex items-center gap-4 p-3 bg-[#0A192F] rounded border border-[#233554]/50">
            <div className="w-24 shrink-0"><span className="text-[#CCD6F6] text-xs">{m.name}</span></div>
            <div className="flex-1">
              <div className="h-6 bg-[#071425] rounded overflow-hidden relative">
                <div className="h-full rounded transition-all duration-700" style={{ width: `${m.heat}%`, background: `linear-gradient(90deg, rgba(56,178,172,0.3) 0%, rgba(66,153,225,${0.3 + m.heat * 0.007}) ${m.heat}%)` }} />
                <span className="absolute inset-0 flex items-center px-3 text-[10px] text-[#CCD6F6] font-mono">{m.visits.toLocaleString()} 次</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-[#8892B0] shrink-0">
              <span>时长 <span className="text-[#CCD6F6]">{m.duration}</span></span>
              <span>跳出 <span className="text-[#CCD6F6]">{m.bounceRate}</span></span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderConversion = () => (
    <Card className="p-4">
      <h3 className="text-white text-sm mb-4">核心转化路径</h3>
      <div className="space-y-3">
        {[
          { path: '市场数据 → 策略编辑 → 回测 → 模拟交易 → 实盘', rate: '8.5%', users: 342, time: '2.3天' },
          { path: '市场数据 → K线分析 → 手动交易', rate: '22.1%', users: 891, time: '15分钟' },
          { path: '量化工坊 → 模型训练 → 模型评估 → 策略对接', rate: '12.3%', users: 156, time: '3.5天' },
          { path: '风险管控 → 压力测试 → 对冲工具 → 交易执行', rate: '6.8%', users: 89, time: '45分钟' },
          { path: '大屏监控 → 异常检测 → 风险预警 → 手动操作', rate: '15.2%', users: 215, time: '8分钟' },
        ].map((cp, i) => (
          <div key={i} className="p-3 bg-[#0A192F] rounded border border-[#233554]/50">
            <div className="flex flex-wrap gap-1 mb-2">
              {cp.path.split(' → ').map((step, j, arr) => (
                <span key={j} className="contents"><span className="text-[10px] px-2 py-0.5 bg-[#4299E1]/10 text-[#4299E1] rounded">{step}</span>{j < arr.length - 1 && <span className="text-[#233554] text-[10px]">→</span>}</span>
              ))}
            </div>
            <div className="flex items-center gap-6 text-[10px] text-[#8892B0]">
              <span>转化率: <span className="text-[#38B2AC] font-mono">{cp.rate}</span></span>
              <span>用户数: <span className="text-[#CCD6F6] font-mono">{cp.users}</span></span>
              <span>平均耗时: <span className="text-[#CCD6F6] font-mono">{cp.time}</span></span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderSession = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { metric: '日活用户 (DAU)', value: '1,248', change: '+5.2%', up: true },
          { metric: '月活用户 (MAU)', value: '4,832', change: '+12.8%', up: true },
          { metric: '平均会话时长', value: '18m 42s', change: '+3.1%', up: true },
          { metric: '平均页面深度', value: '6.8 页', change: '-1.2%', up: false },
          { metric: '跳出率', value: '14.5%', change: '-2.3%', up: true },
          { metric: '日均操作数', value: '42.6', change: '+8.5%', up: true },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <p className="text-[10px] text-[#8892B0] uppercase">{s.metric}</p>
            <p className="text-xl font-mono text-white mt-1">{s.value}</p>
            <span className={`text-[10px] font-mono ${s.up ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{s.change}</span>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="text-white text-sm mb-4">活跃时段分布 (24h)</h3>
        <div className="grid grid-cols-24 gap-0.5">
          {Array.from({ length: 24 }, (_, h) => {
            const act = h >= 9 && h <= 17 ? 60 + Math.random() * 40 : h >= 21 || h <= 2 ? 20 + Math.random() * 30 : 10 + Math.random() * 20;
            return (
              <div key={h} className="text-center">
                <div className="h-16 flex items-end justify-center mb-1"><div className="w-full rounded-t min-w-[6px]" style={{ height: `${act}%`, background: act > 70 ? '#38B2AC' : act > 40 ? '#4299E1' : '#233554' }} /></div>
                <span className="text-[7px] text-[#8892B0]">{h}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const renderExport = () => (
    <Card className="p-4">
      <h3 className="text-white text-sm mb-4">分析数据导出</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { name: '模块访问统计', desc: '各模块PV/UV/停留时长', format: 'CSV / JSON' },
          { name: '用户行为路径', desc: '完整的页面跳转序列', format: 'JSON' },
          { name: '转化漏斗数据', desc: '各核心路径转化率明细', format: 'CSV / JSON' },
          { name: 'AnalyticsService 原始数据', desc: '前端埋点全量事件', format: 'JSON' },
        ].map((item, i) => (
          <div key={i} className="p-3 bg-[#0A192F] rounded border border-[#233554]/50">
            <h4 className="text-[#CCD6F6] text-xs mb-1">{item.name}</h4>
            <p className="text-[10px] text-[#8892B0] mb-2">{item.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#8892B0]">{item.format}</span>
              <button onClick={() => { getAnalytics().downloadExport(); toast.success(`${item.name} 已导出`); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#112240] border border-[#233554] text-[#4299E1] text-[10px] rounded hover:bg-[#1A2B47]"><Download className="w-3 h-3" /> 导出</button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  switch (activeTertiary) {
    case '转化路径': return renderConversion();
    case '会话统计': return renderSession();
    case '数据导出': return renderExport();
    case '模块热力图':
    default: return renderHeatmap();
  }
};

export const AdminModule = ({ activeSub, activeTertiary }: { activeSub: string; activeTertiary?: string }) => {
  const renderContent = () => {
    switch (activeSub) {
      case 'sys': return <SysModule />;
      case 'auth': return <AuthModule />;
      case 'monitor': return <MonitorModule />;
      case 'plan': return <PlanModule activeTertiary={activeTertiary || '里程碑'} />;
      case 'analytics': return <AnalyticsPageModule activeTertiary={activeTertiary || '模块热力图'} />;
      case 'docs': return <DocsModule activeTertiary={activeTertiary || '系统概述'} />;
      case 'backup': return <BackupModule />;
      case 'plugin': return <PluginModule />;
      case 'screen': return <ScreenModule />;
      default: return <SysModule />;
    }
  };

  return <div className="space-y-4">{renderContent()}</div>;
};