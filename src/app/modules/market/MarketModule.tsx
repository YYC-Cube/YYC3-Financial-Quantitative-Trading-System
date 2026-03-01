import React, { useState, useCallback } from 'react';
import { GlobalQuotes } from './components/GlobalQuotes';
import { CustomPanel } from './components/CustomPanel';
import { KLineAnalysis } from './components/KLineAnalysis';
import { Card } from '@/app/components/ui/Card';
import { useSettings } from '@/app/contexts/SettingsContext';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';
import { useIsMobile } from '@/app/components/ui/use-mobile';
import { toast } from 'sonner';

type IconProps = React.SVGProps<SVGSVGElement>;

const Layers = ({ className = "w-4 h-4", ...props }: IconProps) => (
  <svg className={className} {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);
const Search = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const Download = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" strokeWidth={2} /><line x1="12" y1="15" x2="12" y2="3" strokeWidth={2} /></svg>;
const Star = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const TrendingUp = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const AlertTriangle = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const Zap = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const Plus = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const Trash2 = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const Share2 = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>;
const Edit3 = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>;
const Eye = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const RefreshCw = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 4v6h-6M1 20v-6h6" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>;
const Copy = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;
const Monitor = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth={2} /><line x1="8" y1="21" x2="16" y2="21" strokeWidth={2} /><line x1="12" y1="17" x2="12" y2="21" strokeWidth={2} /></svg>;

// =============================================
// History Data Module
// =============================================
const HistoryModule = () => {
  const { getChangeColorClass } = useSettings();
  const { navigateTo } = useGlobalData();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [selectedInterval, setSelectedInterval] = useState('日线');
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2026-02-15');

  const mockData = [
    { date: '2026-02-15', open: '95,800', high: '96,580', low: '94,920', close: '96,231', change: '+0.45%', vol: '28.5B' },
    { date: '2026-02-14', open: '96,120', high: '97,250', low: '95,100', close: '95,800', change: '-0.33%', vol: '32.1B' },
    { date: '2026-02-13', open: '94,500', high: '96,800', low: '93,800', close: '96,120', change: '+1.71%', vol: '45.2B' },
    { date: '2026-02-12', open: '95,200', high: '95,900', low: '93,500', close: '94,500', change: '-0.74%', vol: '38.8B' },
    { date: '2026-02-11', open: '93,800', high: '95,500', low: '92,100', close: '95,200', change: '+1.49%', vol: '41.5B' },
    { date: '2026-02-10', open: '94,600', high: '95,200', low: '93,000', close: '93,800', change: '-0.85%', vol: '35.2B' },
  ];

  const handleQuery = useCallback(() => {
    setLoading(true);
    toast.info(`正在查询 ${selectedSymbol} ${selectedInterval} 数据...`);
    setTimeout(() => {
      setLoading(false);
      toast.success(`${selectedSymbol} ${selectedInterval} 数据已加载 (${mockData.length} 条记录)`);
    }, 800);
  }, [selectedSymbol, selectedInterval]);

  const handleExport = useCallback(() => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1200)),
      {
        loading: `正在导出 ${selectedSymbol} 历史数据...`,
        success: `${selectedSymbol}_${selectedInterval}_${startDate}_${endDate}.csv 导出完成`,
        error: '导出失败',
      }
    );
  }, [selectedSymbol, selectedInterval, startDate, endDate]);

  const handleRowClick = useCallback((date: string) => {
    toast(`查看 ${selectedSymbol} ${date} 详情`, { description: '正在跳转至K线分析...' });
    setTimeout(() => navigateTo('market', 'live', 'K线分析'), 600);
  }, [selectedSymbol, navigateTo]);

  const handleCopyRow = useCallback((d: typeof mockData[0]) => {
    const text = `${d.date} O:${d.open} H:${d.high} L:${d.low} C:${d.close} ${d.change} Vol:${d.vol}`;
    navigator.clipboard?.writeText(text).then(() => {
      toast.success('行数据已复制到剪贴板');
    }).catch(() => {
      toast.success('行数据已复制到剪贴板');
    });
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-wrap items-center justify-between'} mb-4 gap-2`}>
          <h3 className="text-white text-sm">历史数据查询</h3>
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-wrap items-center'} gap-2`}>
            <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)} className="bg-[#071425] border border-[#233554] rounded px-3 py-1.5 text-xs text-[#CCD6F6]">
              <option>BTC/USDT</option><option>ETH/USDT</option><option>SOL/USDT</option><option>AAPL</option><option>GC</option>
            </select>
            <select value={selectedInterval} onChange={e => setSelectedInterval(e.target.value)} className="bg-[#071425] border border-[#233554] rounded px-3 py-1.5 text-xs text-[#CCD6F6]">
              <option>1分钟</option><option>5分钟</option><option>15分钟</option><option>1小时</option><option>日线</option><option>周线</option><option>月线</option>
            </select>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-[#071425] border border-[#233554] rounded px-3 py-1.5 text-xs text-[#CCD6F6]" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-[#071425] border border-[#233554] rounded px-3 py-1.5 text-xs text-[#CCD6F6]" />
            <div className="flex gap-2">
              <button onClick={handleQuery} disabled={loading} className="px-3 py-1.5 bg-[#38B2AC] text-white text-xs rounded hover:brightness-110 flex items-center gap-1 disabled:opacity-50">
                {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />} 查询
              </button>
              <button onClick={handleExport} className="px-3 py-1.5 bg-[#112240] border border-[#233554] text-xs text-[#CCD6F6] rounded hover:bg-[#1A2B47] flex items-center gap-1">
                <Download className="w-3 h-3" /> 导出CSV
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[#8892B0] uppercase border-b border-[#233554]">
              <tr>
                <th className="py-2 px-3 text-left">日期</th>
                <th className="py-2 px-3 text-right">开盘</th>
                <th className="py-2 px-3 text-right">最高</th>
                <th className="py-2 px-3 text-right">最低</th>
                <th className="py-2 px-3 text-right">收盘</th>
                <th className="py-2 px-3 text-right">涨跌幅</th>
                <th className="py-2 px-3 text-right">成交量</th>
                {!isMobile && <th className="py-2 px-3 text-right">操作</th>}
              </tr>
            </thead>
            <tbody>
              {mockData.map((d, i) => (
                <tr key={d.date} className="border-b border-[#233554]/30 hover:bg-[#112240] cursor-pointer transition-colors" onClick={() => handleRowClick(d.date)}>
                  <td className="py-2 px-3 text-[#CCD6F6]">{d.date}</td>
                  <td className="py-2 px-3 text-right font-mono text-[#CCD6F6]">{d.open}</td>
                  <td className="py-2 px-3 text-right font-mono text-[#38B2AC]">{d.high}</td>
                  <td className="py-2 px-3 text-right font-mono text-[#F56565]">{d.low}</td>
                  <td className="py-2 px-3 text-right font-mono text-white">{d.close}</td>
                  <td className={`py-2 px-3 text-right font-mono ${getChangeColorClass(d.change)}`}>{d.change}</td>
                  <td className="py-2 px-3 text-right font-mono text-[#8892B0]">{d.vol}</td>
                  {!isMobile && (
                    <td className="py-2 px-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); handleCopyRow(d); }} className="p-1 text-[#8892B0] hover:text-[#38B2AC] rounded hover:bg-[#233554]/50" title="复制行数据">
                        <Copy className="w-3 h-3" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] text-[#8892B0]">
          <span>共 {mockData.length} 条记录 · {selectedSymbol} · {selectedInterval}</span>
          <span>数据更新于 2026-02-17 14:30:00</span>
        </div>
      </Card>
    </div>
  );
};

// =============================================
// Insight Module
// =============================================
const InsightModule = () => {
  const { navigateTo } = useGlobalData();
  const isMobile = useIsMobile();
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const insightCards = [
    { title: '趋势分析', desc: '基于多时间框架的趋势强度评估', icon: <TrendingUp className="w-5 h-5 text-[#38B2AC]" />, signal: '看多', confidence: '72%', detail: 'BTC在4H/1D/1W三个时间框架均呈上升趋势，MACD多头排列，RSI(14)=62.4未超买，建议顺势做多。' },
    { title: '异常检测', desc: '实时检测价格和成交量异常波动', icon: <AlertTriangle className="w-5 h-5 text-[#ECC94B]" />, signal: '2个异常', confidence: '85%', detail: 'ETH/BTC 1H成交量激增+320%，SOL永续合约出现大额做空单(>$5M)，需关注级联清算风险。' },
    { title: '关联分析', desc: 'BTC与传统资产的关联性分析', icon: <Zap className="w-5 h-5 text-[#4299E1]" />, signal: '正相关', confidence: '0.65', detail: 'BTC与纳斯达克100相关系数=0.65(30日滚动)，与黄金相关系数=-0.12，美元指数走弱利好风险资产。' },
  ];

  const insightReports = [
    { time: '14:30', title: 'BTC突破96,000关键阻力位', type: '技术信号', severity: 'high' as const },
    { time: '14:15', title: 'ETH/BTC汇率创30日新低', type: '关联信号', severity: 'medium' as const },
    { time: '13:55', title: 'SOL链上活跃地址数激增 +45%', type: '基本面', severity: 'high' as const },
    { time: '13:20', title: 'BTC永续合约资金费率转正', type: '市场情绪', severity: 'low' as const },
    { time: '12:45', title: '美元指数 (DXY) 跌破104关口', type: '宏观', severity: 'medium' as const },
  ];

  const handleCardClick = useCallback((card: typeof insightCards[0], idx: number) => {
    setExpandedInsight(prev => prev === idx ? null : idx);
    toast(`${card.title} - 置信度 ${card.confidence}`, { description: card.signal });
  }, []);

  const handleInsightClick = useCallback((insight: typeof insightReports[0]) => {
    toast(`${insight.title}`, {
      description: `${insight.type} · ${insight.severity === 'high' ? '高优先' : insight.severity === 'medium' ? '中优先级' : '低优先级'}`,
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: '正在刷新智能洞察...',
        success: '洞察数据已更新 (5条新报告)',
        error: '刷新失败',
      }
    );
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleNavigateToStrategy = useCallback(() => {
    toast('正在跳转至策略模块...', { description: '基于洞察信号生成交易策略' });
    setTimeout(() => navigateTo('strategy', 'create'), 600);
  }, [navigateTo]);

  return (
    <div className="space-y-6">
      <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-4`}>
        {insightCards.map((card, i) => (
          <Card key={i} className={`p-4 hover:border-[#38B2AC]/30 transition-colors cursor-pointer ${expandedInsight === i ? 'border-[#38B2AC]/50' : ''}`} onClick={() => handleCardClick(card, i)}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#071425] rounded-lg flex items-center justify-center border border-[#233554]">{card.icon}</div>
              <div>
                <h4 className="text-white text-sm">{card.title}</h4>
                <p className="text-[10px] text-[#8892B0]">{card.desc}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#38B2AC]">{card.signal}</span>
              <span className="text-[#8892B0]">置信度: {card.confidence}</span>
            </div>
            {expandedInsight === i && (
              <div className="mt-3 pt-3 border-t border-[#233554]/50">
                <p className="text-[11px] text-[#CCD6F6] leading-relaxed">{card.detail}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNavigateToStrategy(); }}
                  className="mt-2 text-[10px] text-[#4299E1] hover:underline"
                >
                  基于此信号创建策略 →
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-sm">智能洞察报告</h3>
          <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-1 px-3 py-1.5 bg-[#112240] border border-[#233554] text-xs text-[#CCD6F6] rounded hover:bg-[#1A2B47] disabled:opacity-50">
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> 刷新
          </button>
        </div>
        <div className="space-y-3">
          {insightReports.map((insight, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[#0A192F] rounded border border-[#233554]/50 hover:border-[#233554] transition-colors cursor-pointer" onClick={() => handleInsightClick(insight)}>
              <div className={`flex items-center gap-3 ${isMobile ? 'flex-1 min-w-0' : ''}`}>
                <span className="text-[10px] text-[#8892B0] shrink-0 w-12">{insight.time}</span>
                <div className={isMobile ? 'min-w-0' : ''}>
                  <span className={`text-[#CCD6F6] text-xs ${isMobile ? 'block truncate' : ''}`}>{insight.title}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#4299E1]/10 text-[#4299E1] rounded ml-2">{insight.type}</span>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded shrink-0 ml-2 ${
                insight.severity === 'high' ? 'bg-[#F56565]/20 text-[#F56565]' :
                insight.severity === 'medium' ? 'bg-[#ECC94B]/20 text-[#ECC94B]' :
                'bg-[#38B2AC]/20 text-[#38B2AC]'
              }`}>{insight.severity}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// =============================================
// Board (Custom Dashboard)
// =============================================
const BoardModule = () => {
  const { navigateTo } = useGlobalData();
  const isMobile = useIsMobile();
  const [boards, setBoards] = useState([
    { id: 'b1', name: '加密货币全局看板', widgets: 8, lastEdit: '2小时前', shared: true },
    { id: 'b2', name: 'BTC深度分析面板', widgets: 6, lastEdit: '昨天', shared: false },
    { id: 'b3', name: '多品种对比面板', widgets: 4, lastEdit: '3天前', shared: true },
    { id: 'b4', name: '宏观经济仪表盘', widgets: 10, lastEdit: '5天前', shared: false },
  ]);
  const [creatingBoard, setCreatingBoard] = useState(false);

  const handleCreateBoard = useCallback(() => {
    setCreatingBoard(true);
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1000)),
      {
        loading: '正在创建新看板...',
        success: () => {
          const newBoard = {
            id: `b${Date.now()}`,
            name: `自定义看板 #${boards.length + 1}`,
            widgets: 0,
            lastEdit: '刚刚',
            shared: false,
          };
          setBoards(prev => [newBoard, ...prev]);
          setCreatingBoard(false);
          return `看板 "${newBoard.name}" 创建成功`;
        },
        error: '创建失败',
      }
    );
  }, [boards.length]);

  const handleOpenBoard = useCallback((board: typeof boards[0]) => {
    toast(`正在打开 "${board.name}"`, { description: `${board.widgets}个组件 · 上次编辑: ${board.lastEdit}` });
    setTimeout(() => navigateTo('market', 'live', '自选面板'), 600);
  }, [navigateTo]);

  const handleShareBoard = useCallback((e: React.MouseEvent, board: typeof boards[0]) => {
    e.stopPropagation();
    setBoards(prev => prev.map(b => b.id === board.id ? { ...b, shared: !b.shared } : b));
    toast.success(board.shared ? `"${board.name}" 已取消分享` : `"${board.name}" 分享链接已生成`);
  }, []);

  const handleDeleteBoard = useCallback((e: React.MouseEvent, board: typeof boards[0]) => {
    e.stopPropagation();
    setBoards(prev => prev.filter(b => b.id !== board.id));
    toast.success(`看板 "${board.name}" 已删除`, {
      action: {
        label: '撤销',
        onClick: () => setBoards(prev => [...prev, board]),
      },
    });
  }, []);

  const handleDuplicateBoard = useCallback((e: React.MouseEvent, board: typeof boards[0]) => {
    e.stopPropagation();
    const dup = { ...board, id: `b${Date.now()}`, name: `${board.name} (副本)`, lastEdit: '刚刚', shared: false };
    setBoards(prev => [...prev, dup]);
    toast.success(`已复制 "${board.name}"`);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-sm">自主看板</h3>
        <button onClick={handleCreateBoard} disabled={creatingBoard} className="flex items-center gap-2 px-3 py-1.5 bg-[#38B2AC] text-white text-xs rounded hover:brightness-110 disabled:opacity-50">
          <Plus className="w-3 h-3" /> 新建看板
        </button>
      </div>
      <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
        {boards.map((board) => (
          <Card key={board.id} className="p-4 hover:border-[#38B2AC]/50 transition-colors cursor-pointer group" onClick={() => handleOpenBoard(board)}>
            <div className="flex items-start justify-between">
              <h4 className="text-white text-sm mb-2">{board.name}</h4>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => handleDuplicateBoard(e, board)} className="p-1 text-[#8892B0] hover:text-[#4299E1] rounded hover:bg-[#233554]/50" title="复制看板">
                  <Copy className="w-3 h-3" />
                </button>
                <button onClick={(e) => handleShareBoard(e, board)} className="p-1 text-[#8892B0] hover:text-[#38B2AC] rounded hover:bg-[#233554]/50" title={board.shared ? '取消分享' : '分享'}>
                  <Share2 className="w-3 h-3" />
                </button>
                <button onClick={(e) => handleDeleteBoard(e, board)} className="p-1 text-[#8892B0] hover:text-[#F56565] rounded hover:bg-[#233554]/50" title="删除看板">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#8892B0]">
              <span>{board.widgets}个组件</span>
              <span>{board.lastEdit}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              {board.shared ? <span className="text-[10px] px-2 py-0.5 bg-[#4299E1]/10 text-[#4299E1] rounded">已分享</span> : <span />}
              <span className="text-[10px] text-[#38B2AC] group-hover:underline">打开 →</span>
            </div>
          </Card>
        ))}
      </div>
      {boards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-[#8892B0]">
          <Layers className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">暂无看板，点击上方按钮创建</p>
        </div>
      )}
    </div>
  );
};

// =============================================
// Favorites Module
// =============================================
const FavModule = () => {
  const { getChangeColorClass } = useSettings();
  const { navigateTo } = useGlobalData();
  const isMobile = useIsMobile();

  const [favorites, setFavorites] = useState([
    { id: 'f1', symbol: 'BTC/USDT', name: 'Bitcoin', price: '96,231.50', change: '+2.45%', note: '主要持仓' },
    { id: 'f2', symbol: 'ETH/USDT', name: 'Ethereum', price: '2,451.20', change: '-0.12%', note: '均线金叉' },
    { id: 'f3', symbol: 'SOL/USDT', name: 'Solana', price: '142.85', change: '+5.10%', note: '突破阻力位' },
    { id: 'f4', symbol: 'AAPL', name: 'Apple Inc.', price: '185.92', change: '+1.25%', note: '财报前布局' },
    { id: 'f5', symbol: 'GC', name: 'Gold Futures', price: '2,045.30', change: '+0.15%', note: '避险资产' },
  ]);
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const handleAddFavorite = useCallback(() => {
    const symbols = ['DOGE/USDT', 'ADA/USDT', 'AVAX/USDT', 'LINK/USDT', 'DOT/USDT'];
    const names = ['Dogecoin', 'Cardano', 'Avalanche', 'Chainlink', 'Polkadot'];
    const idx = Math.floor(Math.random() * symbols.length);
    if (favorites.find(f => f.symbol === symbols[idx])) {
      toast.warning(`${symbols[idx]} 已在收藏列表中`);
      return;
    }
    const newFav = {
      id: `f${Date.now()}`,
      symbol: symbols[idx],
      name: names[idx],
      price: (Math.random() * 500 + 1).toFixed(2),
      change: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 10).toFixed(2)}%`,
      note: '新添加',
    };
    setFavorites(prev => [...prev, newFav]);
    toast.success(`${newFav.symbol} 已添加到收藏`);
  }, [favorites]);

  const handleRemoveFavorite = useCallback((fav: typeof favorites[0]) => {
    setFavorites(prev => prev.filter(f => f.id !== fav.id));
    toast.success(`${fav.symbol} 已从收藏移除`, {
      action: {
        label: '撤销',
        onClick: () => setFavorites(prev => [...prev, fav]),
      },
    });
  }, []);

  const handleFavClick = useCallback((fav: typeof favorites[0]) => {
    toast(`${fav.symbol} · ${fav.name}`, { description: `当前价格: ${fav.price} (${fav.change})` });
    setTimeout(() => navigateTo('market', 'live', 'K线分析'), 600);
  }, [navigateTo]);

  const handleEditNote = useCallback((fav: typeof favorites[0], note: string) => {
    setFavorites(prev => prev.map(f => f.id === fav.id ? { ...f, note } : f));
    setEditingNote(null);
    toast.success(`${fav.symbol} 备注已更新`);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm">我的收藏 ({favorites.length})</h3>
          <button onClick={handleAddFavorite} className="flex items-center gap-2 px-3 py-1.5 bg-[#112240] border border-[#233554] text-xs text-[#CCD6F6] rounded hover:bg-[#1A2B47]">
            <Plus className="w-3 h-3" /> 添加
          </button>
        </div>
        <div className="grid gap-3">
          {favorites.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-3 bg-[#0A192F] rounded border border-[#233554]/50 hover:border-[#233554] transition-colors cursor-pointer group" onClick={() => handleFavClick(f)}>
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-[#ECC94B] shrink-0" fill="currentColor" />
                <div>
                  <span className="text-white text-xs">{f.symbol}</span>
                  <span className="text-[10px] text-[#8892B0] block">{f.name}</span>
                </div>
              </div>
              <div className={`flex items-center gap-2 ${isMobile ? 'gap-2' : 'gap-4'}`}>
                {editingNote === f.id ? (
                  <input
                    autoFocus
                    className="bg-[#071425] border border-[#233554] rounded px-2 py-0.5 text-[10px] text-[#CCD6F6] w-24"
                    defaultValue={f.note}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => handleEditNote(f, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleEditNote(f, (e.target as HTMLInputElement).value); }}
                  />
                ) : (
                  <span className="text-[10px] text-[#8892B0] italic cursor-pointer hover:text-[#CCD6F6]" onClick={(e) => { e.stopPropagation(); setEditingNote(f.id); }} title="点击编辑备注">
                    {f.note}
                  </span>
                )}
                {!isMobile && <span className="text-sm font-mono text-white">{f.price}</span>}
                <span className={`text-xs font-mono ${getChangeColorClass(f.change)}`}>{f.change}</span>
                <button onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(f); }} className="p-1 text-[#8892B0] hover:text-[#F56565] rounded opacity-0 group-hover:opacity-100 transition-opacity" title="移除收藏">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {favorites.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-[#8892B0]">
              <Star className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">暂无收藏，点击上方按钮添加</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// =============================================
// 行情联动 (Multi-Screen Sync)
// =============================================
const MarketLinkModule = () => {
  const isMobile = useIsMobile();
  const { navigateTo } = useGlobalData();
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleStartSession = useCallback(() => {
    const id = `LS-${Date.now().toString(36).toUpperCase()}`;
    setSessionActive(true);
    setSessionId(id);
    toast.success(`联动会话已开启`, { description: `会话ID: ${id} · 在其他窗口输入此ID即可同步` });
  }, []);

  const handleStopSession = useCallback(() => {
    setSessionActive(false);
    toast.success('联动会话已关闭');
    setSessionId(null);
  }, []);

  const handleCopySessionId = useCallback(() => {
    if (sessionId) {
      navigator.clipboard?.writeText(sessionId).then(() => toast.success('会话ID已复制'));
    }
  }, [sessionId]);

  if (sessionActive) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#38B2AC]/20 rounded-full flex items-center justify-center">
                <Monitor className="w-5 h-5 text-[#38B2AC]" />
              </div>
              <div>
                <h3 className="text-white text-sm">联动会话进行中</h3>
                <p className="text-[10px] text-[#8892B0]">会话ID: <span className="text-[#38B2AC] font-mono cursor-pointer hover:underline" onClick={handleCopySessionId}>{sessionId}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#38B2AC] rounded-full animate-pulse" />
              <span className="text-[10px] text-[#38B2AC]">已连接</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {['BTC/USDT 1H K线', 'ETH/USDT 15m K线', '订单簿深度'].map((screen, i) => (
              <div key={i} className="bg-[#071425] border border-[#233554] rounded p-3 text-center">
                <Monitor className="w-6 h-6 text-[#4299E1] mx-auto mb-2" />
                <p className="text-[10px] text-[#CCD6F6]">窗口 {i + 1}</p>
                <p className="text-[10px] text-[#8892B0]">{screen}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleStopSession} className="px-4 py-2 bg-[#F56565]/20 text-[#F56565] text-xs rounded hover:bg-[#F56565]/30">
              关闭联动会话
            </button>
            <button onClick={handleCopySessionId} className="px-4 py-2 bg-[#112240] border border-[#233554] text-xs text-[#CCD6F6] rounded hover:bg-[#1A2B47]">
              <Copy className="w-3 h-3 inline mr-1" /> 复制会话ID
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-[#8892B0] bg-[#112240]/20 rounded border border-[#233554] border-dashed">
      <Monitor className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} mb-4 opacity-50 text-[#38B2AC]`} />
      <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} text-white`}>多屏行情联动</h3>
      <p className={`text-sm mt-2 ${isMobile ? 'px-4' : 'max-w-md'} text-center`}>
        连接多个显示器或浏览器窗口，在所有活动图表中同步股票选择和时间周期。
      </p>
      <button onClick={handleStartSession} className="mt-6 px-6 py-2 bg-[#38B2AC] text-white rounded hover:brightness-110">
        开启联动会话
      </button>
    </div>
  );
};

// =============================================
// Main MarketModule
// =============================================
interface MarketModuleProps {
  activeSub: string;
  activeTertiary?: string;
  onNavigate: (page: string) => void;
}

export const MarketModule = ({ activeSub, activeTertiary, onNavigate }: MarketModuleProps) => {
  if (activeSub === 'live') {
    switch (activeTertiary) {
      case '全球行情': return <GlobalQuotes />;
      case '自选面板': return <CustomPanel />;
      case 'K线分析': return <KLineAnalysis />;
      case '行情联动': return <MarketLinkModule />;
      default: return <GlobalQuotes />;
    }
  }

  if (activeSub === 'history') return <HistoryModule />;
  if (activeSub === 'insight') return <InsightModule />;
  if (activeSub === 'board') return <BoardModule />;
  if (activeSub === 'fav') return <FavModule />;

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-[#8892B0]">
      <Layers className="w-16 h-16 mb-4 opacity-20" />
      <h3 className="text-xl">市场模块 - {activeSub}</h3>
      <p className="text-sm mt-2">子模块正在开发中</p>
    </div>
  );
};

export default MarketModule;