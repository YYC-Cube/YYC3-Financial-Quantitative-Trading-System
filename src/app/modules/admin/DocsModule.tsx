import React, { useState } from 'react';
import { Card } from '@/app/components/ui/Card';

type IconProps = React.SVGProps<SVGSVGElement>;

const BookOpen = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const Layers = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>;
const Server = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="8" x="2" y="2" rx="2" strokeWidth={2} /><rect width="20" height="8" x="2" y="14" rx="2" strokeWidth={2} /><circle cx="6" cy="6" r="1" fill="currentColor" /><circle cx="6" cy="18" r="1" fill="currentColor" /></svg>;
const GitBranch = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="6" y1="3" x2="6" y2="15" strokeWidth={2} /><circle cx="18" cy="6" r="3" strokeWidth={2} /><circle cx="6" cy="18" r="3" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9a9 9 0 01-9 9" /></svg>;
const Shield = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const AlertTriangle = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const CheckCircle = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Clock = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2} /><path strokeLinecap="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>;
const Code = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><polyline points="8 6 2 12 8 18" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Database = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
const Cpu = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>;
const FileText = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" strokeWidth={2} /><line x1="16" y1="13" x2="8" y2="13" strokeWidth={2} /><line x1="16" y1="17" x2="8" y2="17" strokeWidth={2} /><polyline points="10 9 9 9 8 9" strokeWidth={2} /></svg>;
const Zap = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const ArrowRight = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;
const Globe = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2} /><line x1="2" y1="12" x2="22" y2="12" strokeWidth={2} /><path strokeWidth={2} d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>;
const Copy = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;

// ════════════════════════════════════════════════════════
// Section: Badge / Tag helpers
// ════════════════════════════════════════════════════════
const StatusBadge = ({ status, label }: { status: 'done' | 'active' | 'planned' | 'warning' | 'dead'; label: string }) => {
  const colors: Record<string, string> = {
    done: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    planned: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    warning: 'bg-red-500/20 text-red-400 border-red-500/30',
    dead: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] border ${colors[status]}`}>{label}</span>;
};

const SectionTitle = ({ icon: Icon, title, subtitle }: { icon: React.FC<IconProps>; title: string; subtitle?: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="p-2 bg-[#4299E1]/10 rounded-lg">
      <Icon className="w-5 h-5 text-[#4299E1]" />
    </div>
    <div>
      <h3 className="text-[#CCD6F6]">{title}</h3>
      {subtitle && <p className="text-[11px] text-[#8892B0]">{subtitle}</p>}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════
// Page 1: 系统概述
// ════════════════════════════════════════════════════════
const SystemOverviewPage = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('arch');
  const toggle = (id: string) => setExpandedSection(prev => prev === id ? null : id);

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <Card className="bg-gradient-to-br from-[#112240] via-[#0d1b2a] to-[#1a1a2e] border-[#233554] p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-[#4299E1]/15 rounded-xl">
                <Zap className="w-7 h-7 text-[#4299E1]" />
              </div>
              <div>
                <h1 className="text-[#FFFFFF] text-xl">YYC-QATS 言语云量化分析交易系统</h1>
                <p className="text-[11px] text-[#8892B0]">Quantitative Analysis & Trading System</p>
              </div>
            </div>
            <p className="text-[#8892B0] text-sm max-w-2xl leading-relaxed">
              基于 React 18 + TypeScript + D3.js + Tailwind CSS v4 构建的全栈量化交易前端平台，
              涵盖市场数据、智能策略、风险管控、量子计算、数据管理、量化工坊、交易中心、管理后台八大业务模块，
              采用自定义状态导航机制（非 React Router），通过 GlobalDataContext 实现全局跨模块数据互通。
            </p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-[10px] text-[#8892B0]">当前版本</div>
            <div className="text-[#4299E1] font-mono">v0.8.0-alpha</div>
            <div className="text-[10px] text-[#8892B0] mt-1">更新日期</div>
            <div className="text-[#CCD6F6] font-mono text-sm">2026-02-25</div>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '业务模块', value: '8', sub: '一级模块', color: 'text-[#4299E1]' },
          { label: '子页面', value: '44', sub: '二级菜单', color: 'text-emerald-400' },
          { label: '三级页面', value: '178', sub: '功能页面', color: 'text-amber-400' },
          { label: '类型定义', value: '19', sub: '分区 (global.ts)', color: 'text-purple-400' },
        ].map(m => (
          <Card key={m.label} className="bg-[#112240] border-[#233554] p-4 text-center">
            <div className={`text-2xl font-mono ${m.color}`}>{m.value}</div>
            <div className="text-[#CCD6F6] text-xs mt-1">{m.label}</div>
            <div className="text-[10px] text-[#8892B0]">{m.sub}</div>
          </Card>
        ))}
      </div>

      {/* Architecture Collapsible */}
      <Card className="bg-[#112240] border-[#233554] overflow-hidden">
        <button onClick={() => toggle('arch')} className="w-full flex items-center justify-between p-4 hover:bg-[#1A2B47] transition-colors text-left">
          <SectionTitle icon={Layers} title="系统架构总览" subtitle="State-Navigation + Context + Inline-Switch 三层架构" />
          <ArrowRight className={`w-4 h-4 text-[#8892B0] transition-transform ${expandedSection === 'arch' ? 'rotate-90' : ''}`} />
        </button>
        {expandedSection === 'arch' && (
          <div className="px-4 pb-4 space-y-4">
            {/* Architecture Diagram (text-based) */}
            <div className="bg-[#0A192F] rounded-lg p-4 font-mono text-[11px] text-[#8892B0] overflow-x-auto">
              <pre className="whitespace-pre">{`
  +─────────────────────────────────────────────────────────────+
  |                      App.tsx (Root)                         |
  |  ErrorBoundary > SettingsProvider > AlertProvider            |
  |  > GlobalDataProvider > AppContent                          |
  +─────────────┬───────────────────────────────────────────────+
                |
  +─────────────┴──────────────────────────────────────────────+
  |  Layout Layer                                                |
  |  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────────┐  |
  |  │  Navbar  │ │  Sidebar   │ │TickerBar │ │MobileTabbar  │  |
  |  │(top nav) │ │(left menu) │ │(realtime)│ │(bottom tabs) │  |
  |  └──────────┘ └────────────┘ └──────────┘ └──────────────┘  |
  +────────────────────────┬───────────────────────────────────+
                           |
  +────────────────────────┴──────────────────────────────────+
  |  Content Router (switch on activeModule)                    |
  |                                                              |
  |  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐          |
  |  │ Market  │ │ Strategy │ │  Risk  │ │ Quantum │          |
  |  │ Module  │ │  Module  │ │ Module │ │  Module │          |
  |  └─────────┘ └──────────┘ └────────┘ └─────────┘          |
  |  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐          |
  |  │BigData  │ │  Model   │ │ Trade  │ │  Admin  │          |
  |  │ Module  │ │  Module  │ │ Module │ │  Module │          |
  |  └─────────┘ └──────────┘ └────────┘ └─────────┘          |
  +────────────────────────────────────────────────────────────+
                           |
  +────────────────────────┴──────────────────────────────────+
  |  Cross-Module Infrastructure                                |
  |  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐  |
  |  │CrossModuleBar  │ │DataAlertBridge │ │AITraderAssist  │  |
  |  │(data flow bar) │ │(threshold eng.)│ │(AI chat panel) │  |
  |  └────────────────┘ └────────────────┘ └────────────────┘  |
  +────────────────────────────────────────────────────────────+
              `}</pre>
            </div>

            {/* Architecture Key Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#0A192F] rounded-lg p-3">
                <h4 className="text-[#4299E1] text-xs mb-2">状态导航机制</h4>
                <ul className="text-[11px] text-[#8892B0] space-y-1">
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" /> activeModule / activeSub / activeTertiary 三级状态</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" /> Inline switch 分发渲染（无 React Router）</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" /> URL 不参与路由（SPA 单页模式）</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" /> 跨模块导航通过 GlobalDataContext.navigateTo()</li>
                </ul>
              </div>
              <div className="bg-[#0A192F] rounded-lg p-3">
                <h4 className="text-[#4299E1] text-xs mb-2">Context 数据架构</h4>
                <ul className="text-[11px] text-[#8892B0] space-y-1">
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" /> GlobalDataContext — 市场/持仓/策略/风控/系统全局数据</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" /> AlertContext — 阈值引擎 + 预警通知系统</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" /> SettingsContext — 语言/涨跌配色等用户偏好</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" /> globalThis 缓存 Context 引用避免 HMR 错误</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Design Constraints & Decisions */}
      <Card className="bg-[#112240] border-[#233554] overflow-hidden">
        <button onClick={() => toggle('constraints')} className="w-full flex items-center justify-between p-4 hover:bg-[#1A2B47] transition-colors text-left">
          <SectionTitle icon={Shield} title="设计约束与技术决策" subtitle="核心架构约束与已解决的技术障碍" />
          <ArrowRight className={`w-4 h-4 text-[#8892B0] transition-transform ${expandedSection === 'constraints' ? 'rotate-90' : ''}`} />
        </button>
        {expandedSection === 'constraints' && (
          <div className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {[
                { rule: '严禁 forwardRef', reason: 'fginspector 注入层不支持 ForwardRef 组件，所有图标均内联 SVG 函数', status: 'done' as const },
                { rule: '严禁 @radix-ui', reason: 'shadcn/ui 保护文件引入 @radix-ui 但未安装，通过 Vite 正则别名重定向至 empty-module.ts', status: 'done' as const },
                { rule: '严禁 React Router', reason: '采用自定义 state-driven navigation，三级页面通过 inline switch 分发', status: 'done' as const },
                { rule: '严禁动态 import()', reason: '无 React.lazy()、无 import()，所有模块静态导入避免 SW 缓存冲突', status: 'done' as const },
                { rule: 'Service Worker 已卸载', reason: 'SW 拦截 Vite ESM 模块 fetch 导致 stale-while-revalidate 错误，App.tsx 中主动注销残留 SW', status: 'done' as const },
                { rule: 'globalThis Context 缓存', reason: 'Vite HMR 导致 createContext 重复执行，通过 globalThis 缓存 Context 引用规避运行时错误', status: 'done' as const },
                { rule: '大小写文件冲突', reason: 'Card.tsx/card.tsx, Tabs.tsx/tabs.tsx, Badge.tsx/badge.tsx 共存，活跃代码仅用大写版本', status: 'warning' as const },
                { rule: '死代码隔离', reason: '/hooks/ 11个文件、/utils/db.ts、/workers/ 均为死代码，已通过 Vite alias 中和', status: 'dead' as const },
              ].map((item, i) => (
                <div key={i} className="bg-[#0A192F] rounded-lg p-3 flex items-start gap-3">
                  <StatusBadge status={item.status} label={item.status === 'done' ? '已解决' : item.status === 'warning' ? '注意' : '死代码'} />
                  <div className="flex-1">
                    <div className="text-[#CCD6F6] text-xs">{item.rule}</div>
                    <div className="text-[10px] text-[#8892B0] mt-0.5">{item.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// Page 2: 模块清单
// ════════════════════════════════════════════════════════
const ModuleInventoryPage = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>('market');

  const modules = [
    {
      id: 'market', name: '市场数据', icon: Globe, color: '#4299E1',
      desc: '多源实时行情、历史数据回溯、智能洞察分析、自主看板、数据收藏',
      subs: [
        { id: 'live', name: '实时行情', pages: ['全球行情', '自选面板', 'K线分析', '行情联动'], status: 'done' as const },
        { id: 'history', name: '历史数据', pages: ['多维筛选', '双模展示', '指标对比', '批量导出'], status: 'done' as const },
        { id: 'insight', name: '智能洞察', pages: ['趋势分析', '异常检测', '关联分析', '数据预警'], status: 'done' as const },
        { id: 'board', name: '自主看板', pages: ['组件中心', '布局设计', '保存分享', '多屏适配'], status: 'done' as const },
        { id: 'fav', name: '数据收藏', pages: ['数据收藏', '跨端同步', '数据订阅'], status: 'done' as const },
      ],
      services: ['BinanceService (WebSocket)', 'CoinGeckoService (REST)', 'BinanceKLineService', 'BinanceDepthService'],
      components: ['MarketModule.tsx', 'GlobalQuotes.tsx', 'KLineAnalysis.tsx', 'CustomPanel.tsx'],
    },
    {
      id: 'strategy', name: '智能策略', icon: Cpu, color: '#38B2AC',
      desc: '图形/代码双模策略编辑、智能回测引擎、参数优化、模拟交易、版本管理',
      subs: [
        { id: 'edit', name: '策略编辑', pages: ['图形编辑', '代码编辑', '智能生成', '组件中心', '模板工具'], status: 'done' as const },
        { id: 'backtest', name: '智能回测', pages: ['回测设置', '数据回测', '报告生成', '结果对比'], status: 'done' as const },
        { id: 'optimize', name: '策略优化', pages: ['参数优化', 'AI优化', '量子优化', '历史记录'], status: 'done' as const },
        { id: 'sim', name: '模拟交易', pages: ['模拟设置', '执行监控', '交易分析', '实盘切换'], status: 'done' as const },
        { id: 'manage', name: '策略管理', pages: ['分类搜索', '版本管理', '分享导入', '权限设置'], status: 'done' as const },
      ],
      services: ['BacktestEngine', 'ExchangeAggregator'],
      components: ['StrategyModule.tsx'],
    },
    {
      id: 'risk', name: '风险管控', icon: Shield, color: '#E53E3E',
      desc: '量子风险计算、大数据风控、实时风控监控、预警控制、风控报告、对冲工具库',
      subs: [
        { id: 'quantum_risk', name: '量子风险计算', pages: ['VaR计算', '组合优化', '参数设置', '结果可视'], status: 'done' as const },
        { id: 'bigdata_risk', name: '大数据风控', pages: ['组合分析', '压力测试', '情景分析', '指标监控'], status: 'done' as const },
        { id: 'live_risk', name: '实时风控', pages: ['资产监控', '策略监控', '交易监控', '全局看板'], status: 'done' as const },
        { id: 'warning', name: '风险预警控制', pages: ['预警设置', '通知方式', '自动风控', '手动操作'], status: 'done' as const },
        { id: 'report', name: '风控报告', pages: ['实时报告', '历史分析', '优化建议', '导出分享'], status: 'done' as const },
        { id: 'hedging', name: '对冲工具库', pages: ['传统对冲', 'AI对冲', '效果监控'], status: 'done' as const },
      ],
      services: ['IRiskService (interfaces.ts)'],
      components: ['RiskModule.tsx'],
    },
    {
      id: 'quantum', name: '量子计算', icon: Cpu, color: '#9F7AEA',
      desc: '量子算力监控、算法配置、量化应用、结果分析、PQC加密安全、实验工坊',
      subs: [
        { id: 'resource', name: '资源监控', pages: ['算力监控', '任务队列', '性能指标', '资源调度'], status: 'done' as const },
        { id: 'algo', name: '算法配置', pages: ['算法库', '参数设置', '融合配置', '任务提交'], status: 'done' as const },
        { id: 'app', name: '量化应用', pages: ['策略优化', '风险计算', '行情预测', '模型训练'], status: 'done' as const },
        { id: 'analysis', name: '结果分析', pages: ['结果可视', '算法对比', '性能分析', '结果应用'], status: 'done' as const },
        { id: 'security', name: '加密安全', pages: ['密钥管理', '数据加密', '安全监控', '强度分析'], status: 'done' as const },
        { id: 'workshop', name: '实验工坊', pages: ['自定义任务', '算法调试', '实验记录', '应用案例'], status: 'done' as const },
      ],
      services: ['pqc.worker.ts (Web Worker)'],
      components: ['QuantumModule.tsx'],
    },
    {
      id: 'bigdata', name: '数据管理', icon: Database, color: '#DD6B20',
      desc: '多源数据接入、采集清洗、存储管理、数据处理、质量监控、数据共享',
      subs: [
        { id: 'manage', name: '数据管理', pages: ['主流源', '配置测试', '状态监控', '自定义接入'], status: 'done' as const },
        { id: 'collection', name: '采集清洗', pages: ['实时采集', '数据清洗', '格式转换', '任务监控'], status: 'done' as const },
        { id: 'storage', name: '存储管理', pages: ['状态监控', '存储分析', '数据归档', '备份恢复'], status: 'done' as const },
        { id: 'process', name: '数据处理', pages: ['任务调度', '流程设计', '资源监控', '结果缓存'], status: 'done' as const },
        { id: 'quality', name: '质量监控', pages: ['质量指标', '异常检测', '质量报告', '优化建议'], status: 'done' as const },
        { id: 'share', name: '数据共享', pages: ['资源库', '权限控制', '接口管理', '使用统计'], status: 'done' as const },
      ],
      services: ['IMarketService.getAssets()', 'DataPipelineMetrics'],
      components: ['BigDataModule.tsx'],
    },
    {
      id: 'model', name: '量化工坊', icon: Code, color: '#D69E2E',
      desc: '模型库管理、智能训练、模型评估、部署监控、自主开发、模型应用',
      subs: [
        { id: 'library', name: '模型库', pages: ['经典模型', 'AI模型', '量子模型', '分类搜索'], status: 'done' as const },
        { id: 'train', name: '智能训练', pages: ['数据选择', '参数设置', '量子加速', '进度监控'], status: 'done' as const },
        { id: 'eval', name: '模型评估', pages: ['指标评估', '回测评估', '模型对比', '鲁棒测试'], status: 'done' as const },
        { id: 'deploy', name: '部署监控', pages: ['在线部署', '性能监控', '版本管理', '失效预警'], status: 'done' as const },
        { id: 'dev', name: '自主开发', pages: ['开发框架', '组件库', '调试测试', '导入导出'], status: 'done' as const },
        { id: 'app', name: '模型应用', pages: ['对接策略', '行情分析', '对接风控', '效果统计'], status: 'done' as const },
      ],
      services: ['ModelMetrics', 'ISystemService.getModelMetrics()'],
      components: ['ModelModule.tsx'],
    },
    {
      id: 'trade', name: '交易中心', icon: Zap, color: '#48BB78',
      desc: '实盘交易、模拟交易、交易计划、日志统计、交易配置、多交易所聚合',
      subs: [
        { id: 'real', name: '实盘交易', pages: ['资产监控', '手动交易', '自动交易', '委托记录', '资产穿透'], status: 'done' as const },
        { id: 'sim', name: '模拟交易', pages: ['账户配置', '交易监控', '记录分析', '实盘切换'], status: 'done' as const },
        { id: 'plan', name: '交易计划', pages: ['计划设置', '条件挂单', '挂单管理', '执行监控'], status: 'done' as const },
        { id: 'logs', name: '日志统计', pages: ['操作日志', '交易统计', '报告生成', '记录备份'], status: 'done' as const },
        { id: 'config', name: '交易配置', pages: ['接口配置', '参数设置', '风控设置', '异常处理'], status: 'done' as const },
      ],
      services: ['ITradeService', 'ExchangeAggregator', 'IAccountService'],
      components: ['TradeModule.tsx'],
    },
    {
      id: 'admin', name: '管理后台', icon: Server, color: '#A0AEC0',
      desc: '系统配置、权限管理、日志监控、项目规划、使用分析、数据备份、插件管理、大屏监控',
      subs: [
        { id: 'sys', name: '系统配置', pages: ['基础配置', '数据配置', '通知配置', '量子配置'], status: 'done' as const },
        { id: 'auth', name: '权限管理', pages: ['用户管理', '角色管理', '权限分配', '团队管理'], status: 'done' as const },
        { id: 'monitor', name: '日志监控', pages: ['操作日志', '错误日志', '性能日志', '日志管理'], status: 'done' as const },
        { id: 'plan', name: '项目规划', pages: ['里程碑', '模型配置', 'API对接', '发布计划'], status: 'done' as const },
        { id: 'analytics', name: '使用分析', pages: ['模块热力图', '转化路径', '会话统计', '数据导出'], status: 'done' as const },
        { id: 'docs', name: '项目文档', pages: ['系统概述', '模块清单', '技术栈', '文件地图', '开发规划'], status: 'active' as const },
        { id: 'backup', name: '数据备份', pages: ['全局备份', '数据恢复', '数据清理', '幂等审核'], status: 'done' as const },
        { id: 'plugin', name: '模块插件', pages: ['模块管理', '插件管理', '接口管理', '系统更新'], status: 'done' as const },
        { id: 'screen', name: '大屏监控', pages: ['全局监控', '实时监控', '预警大屏', '多屏联动'], status: 'done' as const },
      ],
      services: ['ISystemService', 'AnalyticsService'],
      components: ['AdminModule.tsx', 'DocsModule.tsx'],
    },
  ];

  const selected = modules.find(m => m.id === selectedModule);

  return (
    <div className="space-y-4">
      <SectionTitle icon={Layers} title="八大业务模块清单" subtitle="点击模块查看详细子页面与服务依赖" />

      {/* Module Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {modules.map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedModule(m.id)}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedModule === m.id
                ? 'bg-[#1A2B47] border-[#4299E1]/50'
                : 'bg-[#112240] border-[#233554] hover:border-[#4299E1]/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <m.icon className="w-4 h-4" style={{ color: m.color }} />
              <span className="text-xs text-[#CCD6F6]">{m.name}</span>
            </div>
            <div className="text-[10px] text-[#8892B0]">{m.subs.length} 子模块 / {m.subs.reduce((a, s) => a + s.pages.length, 0)} 页面</div>
          </button>
        ))}
      </div>

      {/* Module Detail */}
      {selected && (
        <Card className="bg-[#112240] border-[#233554] p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${selected.color}20` }}>
              <selected.icon className="w-5 h-5" style={{ color: selected.color }} />
            </div>
            <div>
              <h3 className="text-[#CCD6F6]">{selected.name}</h3>
              <p className="text-[10px] text-[#8892B0]">{selected.desc}</p>
            </div>
          </div>

          {/* Sub-modules table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-[#8892B0] border-b border-[#233554]">
                  <th className="text-left py-2 px-2">子模块 ID</th>
                  <th className="text-left py-2 px-2">名称</th>
                  <th className="text-left py-2 px-2">三级页面</th>
                  <th className="text-left py-2 px-2">状态</th>
                </tr>
              </thead>
              <tbody>
                {selected.subs.map(sub => (
                  <tr key={sub.id} className="border-b border-[#233554]/50 hover:bg-[#0A192F]">
                    <td className="py-2 px-2 font-mono text-[#4299E1]">{sub.id}</td>
                    <td className="py-2 px-2 text-[#CCD6F6]">{sub.name}</td>
                    <td className="py-2 px-2">
                      <div className="flex flex-wrap gap-1">
                        {sub.pages.map(p => (
                          <span key={p} className="px-1.5 py-0.5 bg-[#0A192F] rounded text-[#8892B0] text-[10px]">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <StatusBadge status={sub.status} label={sub.status === 'done' ? '完成' : sub.status === 'active' ? '开发中' : '规划中'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Services & Components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="bg-[#0A192F] rounded-lg p-3">
              <h4 className="text-[#4299E1] text-[11px] mb-2">依赖服务</h4>
              {selected.services.map(s => (
                <div key={s} className="text-[10px] text-[#8892B0] flex items-center gap-1 py-0.5">
                  <Server className="w-3 h-3 text-[#233554]" /> {s}
                </div>
              ))}
            </div>
            <div className="bg-[#0A192F] rounded-lg p-3">
              <h4 className="text-[#4299E1] text-[11px] mb-2">源码文件</h4>
              {selected.components.map(c => (
                <div key={c} className="text-[10px] text-[#8892B0] flex items-center gap-1 py-0.5">
                  <FileText className="w-3 h-3 text-[#233554]" /> {c}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════
// Page 3: 技术栈
// ════════════════════════════════════════════════════════
const TechStackPage = () => {
  const categories = [
    {
      title: '核心框架',
      items: [
        { name: 'React', version: '18.3.1', desc: 'UI 组件框架（peerDep）', role: '视图层' },
        { name: 'TypeScript', version: '5.x', desc: '类型安全（由 Vite 内置）', role: '类型系统' },
        { name: 'Vite', version: '6.3.5', desc: '构建工具 + HMR + ESM', role: '开发/构建' },
        { name: 'Tailwind CSS', version: '4.1.12', desc: 'v4 JIT + @tailwindcss/vite 插件', role: '样式系统' },
      ],
    },
    {
      title: '可视化 & 图表',
      items: [
        { name: 'D3.js', version: '7.9.0', desc: '底层数据可视化引擎', role: '核心图表' },
        { name: 'Recharts', version: '2.15.2', desc: 'React 声明式图表库', role: '仪表盘图表' },
        { name: 'Lightweight Charts', version: '5.1.0', desc: 'TradingView K线图引擎', role: 'K线渲染' },
        { name: 'Three.js', version: '0.182.0', desc: '3D 可视化引擎', role: '3D场景' },
        { name: 'ReactFlow', version: '11.11.4', desc: '节点编辑器（策略图形编辑）', role: '流程图' },
      ],
    },
    {
      title: '交互 & 动画',
      items: [
        { name: 'Motion', version: '12.23.24', desc: 'Framer Motion 动画库', role: '过渡动画' },
        { name: 'React DnD', version: '16.0.1', desc: '拖拽交互', role: '拖放排序' },
        { name: 'React Grid Layout', version: '2.2.2', desc: '可拖拽网格布局', role: '看板布局' },
        { name: 'Embla Carousel', version: '8.6.0', desc: '轮播组件', role: '内容轮播' },
        { name: 'React Resizable Panels', version: '2.1.7', desc: '可调整尺寸面板', role: '分屏布局' },
      ],
    },
    {
      title: '数据 & 状态',
      items: [
        { name: 'Sonner', version: '2.0.3', desc: 'Toast 通知系统', role: '通知' },
        { name: 'React Hook Form', version: '7.55.0', desc: '表单状态管理', role: '表单' },
        { name: 'date-fns', version: '3.6.0', desc: '日期工具库', role: '时间处理' },
        { name: 'idb', version: '8.0.3', desc: 'IndexedDB Promise 包装', role: '本地存储' },
        { name: 'cmdk', version: '1.1.1', desc: '命令面板组件', role: '快捷搜索' },
      ],
    },
    {
      title: 'UI 组件库',
      items: [
        { name: '@mui/material', version: '7.3.5', desc: 'Material UI（含 @emotion）', role: '补充组件' },
        { name: 'class-variance-authority', version: '0.7.1', desc: '变体样式工具', role: '样式变体' },
        { name: 'clsx', version: '2.1.1', desc: '条件类名合并', role: '类名工具' },
        { name: 'tailwind-merge', version: '3.2.0', desc: 'Tailwind 类名冲突解决', role: '类名合并' },
        { name: 'Prism.js', version: '1.30.0', desc: '代码语法高亮', role: '代码展示' },
      ],
    },
    {
      title: '国际化 & 多语言',
      items: [
        { name: 'i18next', version: '25.8.0', desc: '国际化框架（已安装未启用）', role: '多语言' },
        { name: 'react-i18next', version: '16.5.4', desc: 'React i18n 绑定（已安装未启用）', role: 'React集成' },
        { name: 'Mock i18n', version: '-', desc: '自定义 mock 实现（当前使用）', role: '临时方案' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <SectionTitle icon={Code} title="技术栈全景" subtitle="依赖版本清单与职责分工" />
      
      {categories.map(cat => (
        <Card key={cat.title} className="bg-[#112240] border-[#233554] p-4">
          <h4 className="text-[#4299E1] text-xs mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4299E1]" />
            {cat.title}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-[#8892B0] border-b border-[#233554]">
                  <th className="text-left py-1.5 px-2 w-36">包名</th>
                  <th className="text-left py-1.5 px-2 w-24">版本</th>
                  <th className="text-left py-1.5 px-2">说明</th>
                  <th className="text-left py-1.5 px-2 w-24">职责</th>
                </tr>
              </thead>
              <tbody>
                {cat.items.map(item => (
                  <tr key={item.name} className="border-b border-[#233554]/30 hover:bg-[#0A192F]">
                    <td className="py-1.5 px-2 font-mono text-[#CCD6F6]">{item.name}</td>
                    <td className="py-1.5 px-2 font-mono text-emerald-400">{item.version}</td>
                    <td className="py-1.5 px-2 text-[#8892B0]">{item.desc}</td>
                    <td className="py-1.5 px-2">
                      <span className="px-1.5 py-0.5 bg-[#4299E1]/10 text-[#4299E1] rounded text-[10px]">{item.role}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════
// Page 4: 文件地图
// ════════════════════════════════════════════════════════
const FileMapPage = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'dead' | 'protected'>('all');

  const fileGroups = [
    {
      group: '入口 & 配置',
      files: [
        { path: '/src/app/App.tsx', role: '应用根组件，Provider 嵌套、三级导航状态、模块 switch 分发', status: 'active' as const, lines: '~455' },
        { path: '/vite.config.ts', role: 'Vite 配置，含 @radix-ui / next-themes / three 别名重定向', status: 'active' as const, lines: '~34' },
        { path: '/src/app/data/navigation.tsx', role: '八大模块定义 (MODULES) + 44 个子菜单 (MENUS) + 内联图标', status: 'active' as const, lines: '~119' },
      ],
    },
    {
      group: '类型 & 接口',
      files: [
        { path: '/src/app/types/global.ts', role: '权威类型源 — 19 个分区，覆盖所有跨模块类型定义', status: 'active' as const, lines: '~637' },
        { path: '/src/app/api/interfaces.ts', role: '8 个服务接口 (IMarketService 等) + MockApiService 完整 Mock', status: 'active' as const, lines: '~316' },
      ],
    },
    {
      group: 'Context 层',
      files: [
        { path: '/src/app/contexts/GlobalDataContext.tsx', role: '全局数据上下文 — 市场/持仓/策略/风控/系统/导航/风险信号', status: 'active' as const, lines: '~500+' },
        { path: '/src/app/contexts/AlertContext.tsx', role: '阈值引擎 — 预警规则管理 + 自动触发 + 通知', status: 'active' as const, lines: '~300+' },
        { path: '/src/app/contexts/SettingsContext.tsx', role: '用户偏好 — 语言/涨跌配色/主题', status: 'active' as const, lines: '~100+' },
      ],
    },
    {
      group: '业务模块 (8 个)',
      files: [
        { path: '/src/app/modules/market/MarketModule.tsx', role: '市场数据模块 — 5 个二级子页面', status: 'active' as const, lines: '大型' },
        { path: '/src/app/modules/strategy/StrategyModule.tsx', role: '智能策略模块 — 5 个二级子页面', status: 'active' as const, lines: '大型' },
        { path: '/src/app/modules/risk/RiskModule.tsx', role: '风险管控模块 — 6 个二级子页面', status: 'active' as const, lines: '大型' },
        { path: '/src/app/modules/quantum/QuantumModule.tsx', role: '量子计算模块 — 6 个二级子页面', status: 'active' as const, lines: '大型' },
        { path: '/src/app/modules/bigdata/BigDataModule.tsx', role: '数据管理模块 — 6 个二级子页面', status: 'active' as const, lines: '大型' },
        { path: '/src/app/modules/model/ModelModule.tsx', role: '量化工坊模块 — 6 个二级子页面', status: 'active' as const, lines: '大型' },
        { path: '/src/app/modules/trade/TradeModule.tsx', role: '交易中心模块 — 5 个二级子页面', status: 'active' as const, lines: '大型' },
        { path: '/src/app/modules/admin/AdminModule.tsx', role: '管理后台模块 — 9 个二级子页面（含 plan/analytics）', status: 'active' as const, lines: '~1267' },
      ],
    },
    {
      group: '市场模块子组件',
      files: [
        { path: '/src/app/modules/market/components/GlobalQuotes.tsx', role: '全球行情展示组件', status: 'active' as const, lines: '-' },
        { path: '/src/app/modules/market/components/KLineAnalysis.tsx', role: 'K线分析组件（Lightweight Charts）', status: 'active' as const, lines: '-' },
        { path: '/src/app/modules/market/components/CustomPanel.tsx', role: '自定义面板组件', status: 'active' as const, lines: '-' },
      ],
    },
    {
      group: '布局组件',
      files: [
        { path: '/src/app/components/layout/Navbar.tsx', role: '顶部导航栏 — 模块切换 + 预警中心入口', status: 'active' as const, lines: '-' },
        { path: '/src/app/components/layout/Sidebar.tsx', role: '左侧边栏 — 二级/三级菜单导航', status: 'active' as const, lines: '-' },
        { path: '/src/app/components/layout/MobileNavigation.tsx', role: '移动端底部 Tabbar + 抽屉菜单', status: 'active' as const, lines: '-' },
        { path: '/src/app/components/layout/AlertCenter.tsx', role: '预警中心面板', status: 'active' as const, lines: '-' },
        { path: '/src/app/components/layout/SettingsDialog.tsx', role: '设置对话框', status: 'active' as const, lines: '-' },
      ],
    },
    {
      group: '跨模块组件',
      files: [
        { path: '/src/app/components/CrossModuleBar.tsx', role: '跨模块数据流快捷导航条', status: 'active' as const, lines: '-' },
        { path: '/src/app/components/DataAlertBridge.tsx', role: '数据-预警桥接器（renderless 组件）', status: 'active' as const, lines: '-' },
        { path: '/src/app/components/AITraderAssistant.tsx', role: 'AI 交易助理面板', status: 'active' as const, lines: '-' },
        { path: '/src/app/components/FeasibilityReport.tsx', role: '可行性节点报告弹窗', status: 'active' as const, lines: '-' },
        { path: '/src/app/components/DataFlowMap.tsx', role: '模块数据流向图（Canvas/D3）', status: 'active' as const, lines: '-' },
        { path: '/src/app/components/ErrorBoundary.tsx', role: 'React 错误边界', status: 'active' as const, lines: '-' },
        { path: '/src/app/components/SafeIcons.tsx', role: '安全图标包装（避免 ForwardRef）', status: 'active' as const, lines: '-' },
        { path: '/src/app/components/SafeMotion.tsx', role: '安全 Motion 包装', status: 'active' as const, lines: '-' },
      ],
    },
    {
      group: '服务层',
      files: [
        { path: '/src/app/services/BinanceService.ts', role: 'Binance WebSocket 24hr ticker 实时行情', status: 'active' as const, lines: '-' },
        { path: '/src/app/services/BinanceKLineService.ts', role: 'Binance REST K线历史数据', status: 'active' as const, lines: '-' },
        { path: '/src/app/services/BinanceDepthService.ts', role: '多交易所深度 WebSocket（Binance/OKX/Bybit）', status: 'active' as const, lines: '-' },
        { path: '/src/app/services/CoinGeckoService.ts', role: 'CoinGecko REST 行情（50+ 币种）', status: 'active' as const, lines: '-' },
        { path: '/src/app/services/ExchangeAggregator.ts', role: '多交易所聚合 + 套利检测 + 多账户管理', status: 'active' as const, lines: '-' },
        { path: '/src/app/services/BacktestEngine.ts', role: '策略回测引擎（MA/RSI/MACD/Bollinger）', status: 'active' as const, lines: '-' },
        { path: '/src/app/services/AnalyticsService.ts', role: '前端使用分析（localStorage 存储，无 PII）', status: 'active' as const, lines: '-' },
      ],
    },
    {
      group: '工具 & 测试',
      files: [
        { path: '/src/app/utils/empty-module.ts', role: 'Vite 别名 stub — 中和 @radix-ui / next-themes 等', status: 'active' as const, lines: '~58' },
        { path: '/src/app/utils/tests.ts', role: '47 个测试用例（8 模块 + 基础设施）', status: 'active' as const, lines: '~500+' },
        { path: '/src/app/i18n/mock.ts', role: 'Mock 国际化实现（中英双语）', status: 'active' as const, lines: '~119' },
      ],
    },
    {
      group: '死代码 (未删除)',
      files: [
        { path: '/src/app/hooks/useBroadcastSync.ts', role: '跨标签页同步（未使用）', status: 'dead' as const, lines: '-' },
        { path: '/src/app/hooks/useCTPProtocol.ts', role: 'CTP 协议 hook（未使用）', status: 'dead' as const, lines: '-' },
        { path: '/src/app/hooks/useHaptics.ts', role: '触觉反馈 hook（未使用）', status: 'dead' as const, lines: '-' },
        { path: '/src/app/hooks/useMultiScreenSync.ts', role: '多屏同步 hook（未使用）', status: 'dead' as const, lines: '-' },
        { path: '/src/app/hooks/useQuantSync.ts', role: '量子同步 hook（未使用）', status: 'dead' as const, lines: '-' },
        { path: '/src/app/hooks/useSafeTranslation.ts', role: '安全翻译 hook（未使用）', status: 'dead' as const, lines: '-' },
        { path: '/src/app/hooks/useTradeProtocol.ts', role: '交易协议 hook（未使用）', status: 'dead' as const, lines: '-' },
        { path: '/src/app/hooks/useVoiceCommand.ts', role: '语音命令 hook（未使用）', status: 'dead' as const, lines: '-' },
        { path: '/src/app/hooks/useVoiceCommands.ts', role: '语音命令 hook v2（未使用）', status: 'dead' as const, lines: '-' },
        { path: '/src/app/hooks/useVoiceControl.ts', role: '语音控制 hook（未使用）', status: 'dead' as const, lines: '-' },
        { path: '/src/app/hooks/useWebHID.ts', role: 'WebHID 硬件设备 hook（未使用）', status: 'dead' as const, lines: '-' },
        { path: '/src/app/utils/db.ts', role: 'IndexedDB 工具（未使用）', status: 'dead' as const, lines: '-' },
        { path: '/src/app/workers/pqc.worker.ts', role: 'PQC Web Worker（未在活跃代码中引用）', status: 'dead' as const, lines: '-' },
      ],
    },
    {
      group: 'shadcn/ui 保护文件 (30+)',
      files: [
        { path: '/src/app/components/ui/*.tsx (小写)', role: '导入 @radix-ui（已通过 Vite alias stub 中和），不可删除', status: 'protected' as const, lines: '30+ 文件' },
        { path: '/src/app/components/ui/Card.tsx', role: '活跃使用的 Card 组件（大写版本）', status: 'active' as const, lines: '-' },
        { path: '/src/app/components/ui/Tabs.tsx', role: '活跃使用的 Tabs 组件（大写版本）', status: 'active' as const, lines: '-' },
        { path: '/src/app/components/ui/Badge.tsx', role: '活跃使用的 Badge 组件（大写版本）', status: 'active' as const, lines: '-' },
        { path: '/src/app/components/ui/use-mobile.ts', role: '移动端检测 hook（活跃使用）', status: 'active' as const, lines: '-' },
        { path: '/src/app/components/ui/utils.ts', role: 'cn() 类名合并工具（活跃使用）', status: 'active' as const, lines: '-' },
      ],
    },
  ];

  const filteredGroups = fileGroups.map(g => ({
    ...g,
    files: filter === 'all' ? g.files : g.files.filter(f => f.status === filter),
  })).filter(g => g.files.length > 0);

  const statusMap: Record<string, string> = { active: '活跃', dead: '死代码', protected: '保护文件' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle icon={FileText} title="源码文件地图" subtitle="全项目文件清单与状态标注" />
        <div className="flex gap-1">
          {(['all', 'active', 'dead', 'protected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded text-[10px] transition-colors ${
                filter === f ? 'bg-[#4299E1]/20 text-[#4299E1]' : 'bg-[#0A192F] text-[#8892B0] hover:text-[#CCD6F6]'
              }`}
            >
              {f === 'all' ? '全部' : statusMap[f]}
            </button>
          ))}
        </div>
      </div>

      {filteredGroups.map(g => (
        <Card key={g.group} className="bg-[#112240] border-[#233554] p-3">
          <h4 className="text-[#4299E1] text-[11px] mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4299E1]" /> {g.group}
            <span className="text-[#8892B0]">({g.files.length})</span>
          </h4>
          <div className="space-y-1">
            {g.files.map(f => (
              <div key={f.path} className="flex items-start gap-2 py-1 px-2 rounded hover:bg-[#0A192F] text-[11px]">
                <StatusBadge
                  status={f.status === 'protected' ? 'warning' : f.status === 'dead' ? 'dead' : 'done'}
                  label={f.status === 'active' ? '活跃' : f.status === 'dead' ? '死码' : '保护'}
                />
                <code className="text-[#CCD6F6] font-mono shrink-0">{f.path}</code>
                <span className="text-[#8892B0] flex-1">{f.role}</span>
                {f.lines !== '-' && <span className="text-[#233554] font-mono shrink-0">{f.lines}</span>}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════
// Page 5: 开发规划
// ════════════════════════════════════════════════════════
const DevelopmentPlanPage = () => {
  const [activePhase, setActivePhase] = useState(2);

  const phases = [
    {
      id: 1, name: 'Phase 1 — 基础架构', period: '2025.11 → 2026.01', status: 'done' as const,
      progress: 100,
      goals: [
        { task: 'global.ts 类型权威源重写（19 个分区）', done: true },
        { task: 'interfaces.ts 8 个服务接口 + MockApiService', done: true },
        { task: 'tests.ts 47 个测试用例', done: true },
        { task: 'GlobalDataContext 跨模块数据互通', done: true },
        { task: 'AlertContext 阈值引擎', done: true },
        { task: 'SettingsContext 用户偏好', done: true },
        { task: 'BinanceService WebSocket 实时行情', done: true },
        { task: 'CoinGeckoService REST 行情', done: true },
        { task: 'BinanceKLineService K线历史数据', done: true },
        { task: 'BinanceDepthService 多交易所深度', done: true },
        { task: 'ExchangeAggregator 多交易所聚合', done: true },
        { task: 'BacktestEngine 策略回测引擎', done: true },
      ],
    },
    {
      id: 2, name: 'Phase 2 — 八大模块实现', period: '2025.12 → 2026.02', status: 'active' as const,
      progress: 85,
      goals: [
        { task: '市场数据模块 — 5 子页面 + K线/深度图组件', done: true },
        { task: '智能策略模块 — 5 子页面 + ReactFlow 图形编辑器', done: true },
        { task: '风险管控模块 — 6 子页面 + VaR/压力测试/对冲工具', done: true },
        { task: '量子计算模块 — 6 子页面 + PQC 加密 + 实验工坊', done: true },
        { task: '数据管理模块 — 6 子页面 + 多源采集清洗', done: true },
        { task: '量化工坊模块 — 6 子页面 + 模型训练/评估/部署', done: true },
        { task: '交易中心模块 — 5 子页面 + 实盘/模拟/多交易所', done: true },
        { task: '管理后台模块 — 9 子页面（含 plan/analytics/docs）', done: true },
        { task: '布局系统 — Navbar/Sidebar/MobileNav/TickerBar', done: true },
        { task: 'CrossModuleBar 跨模块数据流', done: true },
        { task: 'DataAlertBridge 数据-预警桥接', done: true },
        { task: 'AI 交易助理面板', done: true },
        { task: 'AnalyticsService 前端使用分析', done: true },
        { task: 'Vite 别名 + empty-module.ts 解决 @radix-ui 依赖', done: true },
        { task: 'Service Worker 卸载 + 模块 fetch 修复', done: true },
        { task: 'fginspector ForwardRef 错误抑制', done: true },
        { task: '大小写冲突文件清理 (Card/Tabs/Badge)', done: false },
        { task: '死代码文件清理 (hooks/11文件 + db.ts + worker)', done: false },
        { task: '所有三级页面 E2E 运行时验证', done: false },
      ],
    },
    {
      id: 3, name: 'Phase 3 — 功能增强', period: '2026.03 → 2026.05', status: 'planned' as const,
      progress: 0,
      goals: [
        { task: '真实 API 接入 — Mock→Real 迁移（8 个服务接口）', done: false },
        { task: 'Supabase 后端集成 — 用户认证/数据持久化', done: false },
        { task: 'i18next 正式启用 — 多语言切换（中/英/日）', done: false },
        { task: 'PWA 离线支持 — Service Worker 重新接入（生产环境）', done: false },
        { task: '性能优化 — React.memo / useMemo / 虚拟滚动', done: false },
        { task: '无障碍 (a11y) — ARIA 标签 / 键盘导航 / 屏幕阅读器', done: false },
        { task: '单元测试 — Jest/Vitest + RTL 覆盖率 > 60%', done: false },
        { task: 'E2E 测试 — Playwright 关键路径覆盖', done: false },
      ],
    },
    {
      id: 4, name: 'Phase 4 — 生产部署', period: '2026.06 → 2026.08', status: 'planned' as const,
      progress: 0,
      goals: [
        { task: 'CI/CD 管线 — GitHub Actions / 自动部署', done: false },
        { task: '监控告警 — Sentry 错误追踪 / Grafana 面板', done: false },
        { task: '安全审计 — CSP / XSS / CSRF / API 鉴权', done: false },
        { task: '性能基线 — Lighthouse 90+ / LCP < 2.5s', done: false },
        { task: '文档站点 — Storybook 组件文档 / OpenAPI 文档', done: false },
        { task: '用户反馈 — A/B 测试框架 / 功能开关', done: false },
        { task: '正式发布 v1.0 — 生产环境上线', done: false },
      ],
    },
  ];

  const current = phases.find(p => p.id === activePhase)!;

  // Technical debt items
  const techDebt = [
    { severity: 'high' as const, item: '大小写文件冲突 (Card.tsx/card.tsx 等)', impact: '不同 OS 行为不一致，CI 可能失败', effort: '低' },
    { severity: 'high' as const, item: '死代码未清理 (13 个文件)', impact: '增加 bundle 体积、降低可维护性', effort: '低' },
    { severity: 'medium' as const, item: 'i18next 已安装但使用 mock 实现', impact: '切换正式 i18n 时需全局替换', effort: '中' },
    { severity: 'medium' as const, item: '所有图标内联 SVG（无 tree-shaking）', impact: '每个模块文件体积较大', effort: '中' },
    { severity: 'medium' as const, item: '类型定义双重声明（global.ts vs 各服务文件）', impact: '可能出现类型不一致', effort: '中' },
    { severity: 'low' as const, item: 'console.error 全局拦截（fginspector 抑制）', impact: '可能遮蔽真实错误', effort: '低' },
    { severity: 'low' as const, item: 'react-router-dom 已安装但未使用', impact: '增加 node_modules 体积', effort: '极低' },
  ];

  return (
    <div className="space-y-4">
      {/* Phase Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {phases.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePhase(p.id)}
            className={`px-3 py-2 rounded-lg border text-xs whitespace-nowrap transition-all ${
              activePhase === p.id
                ? 'bg-[#1A2B47] border-[#4299E1]/50 text-[#CCD6F6]'
                : 'bg-[#112240] border-[#233554] text-[#8892B0] hover:border-[#4299E1]/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <StatusBadge status={p.status === 'done' ? 'done' : p.status === 'active' ? 'active' : 'planned'} label={p.status === 'done' ? '完成' : p.status === 'active' ? '进行中' : '规划中'} />
              <span>{p.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Phase Detail */}
      <Card className="bg-[#112240] border-[#233554] p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[#CCD6F6]">{current.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-[#8892B0]" />
              <span className="text-[11px] text-[#8892B0]">{current.period}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono text-[#4299E1]">{current.progress}%</div>
            <div className="text-[10px] text-[#8892B0]">
              {current.goals.filter(g => g.done).length}/{current.goals.length} 完成
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#0A192F] rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all ${
              current.progress === 100 ? 'bg-emerald-500' : 'bg-[#4299E1]'
            }`}
            style={{ width: `${current.progress}%` }}
          />
        </div>

        {/* Task List */}
        <div className="space-y-1.5">
          {current.goals.map((g, i) => (
            <div key={i} className="flex items-start gap-2 py-1 px-2 rounded hover:bg-[#0A192F] text-[11px]">
              {g.done ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-[#233554] mt-0.5 shrink-0" />
              )}
              <span className={g.done ? 'text-[#8892B0] line-through' : 'text-[#CCD6F6]'}>{g.task}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Technical Debt */}
      <Card className="bg-[#112240] border-[#233554] p-4">
        <SectionTitle icon={AlertTriangle} title="技术债务清单" subtitle="按优先级排序的已知问题与改进项" />
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-[#8892B0] border-b border-[#233554]">
                <th className="text-left py-2 px-2 w-16">优先级</th>
                <th className="text-left py-2 px-2">问题描述</th>
                <th className="text-left py-2 px-2">影响范围</th>
                <th className="text-left py-2 px-2 w-16">修复成本</th>
              </tr>
            </thead>
            <tbody>
              {techDebt.map((d, i) => (
                <tr key={i} className="border-b border-[#233554]/30 hover:bg-[#0A192F]">
                  <td className="py-2 px-2">
                    <StatusBadge
                      status={d.severity === 'high' ? 'warning' : d.severity === 'medium' ? 'active' : 'done'}
                      label={d.severity === 'high' ? '高' : d.severity === 'medium' ? '中' : '低'}
                    />
                  </td>
                  <td className="py-2 px-2 text-[#CCD6F6]">{d.item}</td>
                  <td className="py-2 px-2 text-[#8892B0]">{d.impact}</td>
                  <td className="py-2 px-2 text-[#8892B0]">{d.effort}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* API Migration Plan Summary */}
      <Card className="bg-[#112240] border-[#233554] p-4">
        <SectionTitle icon={GitBranch} title="Mock → Real API 迁移路线图" subtitle="8 个服务接口的后端对接优先级" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { svc: 'IMarketService', endpoints: 5, priority: 'P0', reason: '核心行情数据，已有 Binance/CoinGecko 实时源' },
            { svc: 'ITradeService', endpoints: 6, priority: 'P0', reason: '交易执行核心，需要交易所 API 密钥' },
            { svc: 'IAccountService', endpoints: 2, priority: 'P0', reason: '账户资产查询，与交易服务耦合' },
            { svc: 'IRiskService', endpoints: 3, priority: 'P1', reason: '风控计算引擎，依赖市场数据输入' },
            { svc: 'IStrategyService', endpoints: 7, priority: 'P1', reason: '策略 CRUD + 回测，需要后端持久化' },
            { svc: 'ISystemService', endpoints: 4, priority: 'P1', reason: '系统监控指标，需要服务端采集' },
            { svc: 'IAlertService', endpoints: 6, priority: 'P2', reason: '预警规则持久化，当前 localStorage 可用' },
            { svc: 'IArbitrageService', endpoints: 2, priority: 'P2', reason: '套利信号，依赖多交易所实时行情' },
          ].map(s => (
            <div key={s.svc} className="bg-[#0A192F] rounded-lg p-3 flex items-start gap-3">
              <StatusBadge
                status={s.priority === 'P0' ? 'warning' : s.priority === 'P1' ? 'active' : 'planned'}
                label={s.priority}
              />
              <div className="flex-1">
                <div className="text-[#CCD6F6] text-xs font-mono">{s.svc}</div>
                <div className="text-[10px] text-[#8892B0] mt-0.5">{s.endpoints} 端点 — {s.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// Main Export: DocsModule
// ════════════════════════════════════════════════════════
export const DocsModule = ({ activeTertiary }: { activeTertiary: string }) => {
  switch (activeTertiary) {
    case '系统概述': return <SystemOverviewPage />;
    case '模块清单': return <ModuleInventoryPage />;
    case '技术栈': return <TechStackPage />;
    case '文件地图': return <FileMapPage />;
    case '开发规划': return <DevelopmentPlanPage />;
    default: return <SystemOverviewPage />;
  }
};
