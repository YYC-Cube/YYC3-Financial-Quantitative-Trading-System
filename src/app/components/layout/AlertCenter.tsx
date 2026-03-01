import React, { useState, useRef, useEffect } from 'react';
import { useAlerts, Alert, AlertThreshold, ThresholdMetric, METRIC_LABELS } from '@/app/contexts/AlertContext';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';
import { cn } from '@/app/components/ui/utils';

// Inline icons - pure function components, no forwardRef
type IconProps = React.SVGProps<SVGSVGElement>;

const Bell = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const AlertTriangle = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const Info = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01" /></svg>;
const ShieldAlert = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>;
const Trash2 = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="3 6 5 6 21 6" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>;
const Settings2 = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>;
const Plus = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" /></svg>;
const ChevronLeft = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const CheckCircle = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Eye = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" strokeWidth={2} /></svg>;
const EyeOff = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" strokeWidth={2} /></svg>;

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Available symbols for threshold configuration
const SYMBOL_OPTIONS = [
  { value: 'BTC/USDT', label: 'BTC/USDT' },
  { value: 'ETH/USDT', label: 'ETH/USDT' },
  { value: 'SOL/USDT', label: 'SOL/USDT' },
  { value: 'BNB/USDT', label: 'BNB/USDT' },
  { value: 'XRP/USDT', label: 'XRP/USDT' },
  { value: 'ADA/USDT', label: 'ADA/USDT' },
  { value: 'AAPL', label: 'AAPL' },
  { value: 'NVDA', label: 'NVDA' },
  { value: '__system__', label: '系统指标' },
];

const METRIC_OPTIONS: ThresholdMetric[] = ['price', 'change', 'volume_spike', 'rsi', 'drawdown', 'var', 'cpu', 'latency', 'accuracy'];

// Threshold config sub-panel
function ThresholdConfigPanel({ onBack }: { onBack: () => void }) {
  const { thresholds, addThreshold, removeThreshold, toggleThreshold } = useAlerts();
  const { marketData } = useGlobalData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSymbol, setNewSymbol] = useState('BTC/USDT');
  const [newMetric, setNewMetric] = useState<ThresholdMetric>('price');
  const [newCondition, setNewCondition] = useState<'above' | 'below'>('above');
  const [newValue, setNewValue] = useState('');

  // Get current price for the selected symbol to show as reference
  const selectedAsset = marketData.find(a => a.symbol === newSymbol);
  const refPrice = selectedAsset ? selectedAsset.price : null;

  // Filter metrics based on symbol type
  const availableMetrics = newSymbol === '__system__'
    ? (['cpu', 'latency', 'accuracy'] as ThresholdMetric[])
    : (['price', 'change', 'volume_spike', 'rsi', 'drawdown', 'var'] as ThresholdMetric[]);

  const handleAdd = () => {
    const val = parseFloat(newValue);
    if (isNaN(val)) return;
    addThreshold({
      symbol: newSymbol,
      metric: newMetric,
      condition: newCondition,
      value: val,
      enabled: true,
      cooldownMs: 60000,
    });
    setNewValue('');
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-[#233554]">
        <button
          onClick={onBack}
          className="p-1 hover:bg-[#112240] rounded transition-colors text-[#8892B0] hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-bold text-white flex-1">阈值与告警配置</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={cn(
            "p-1.5 rounded-lg transition-all",
            showAddForm
              ? "bg-[#F56565]/20 text-[#F56565]"
              : "bg-[#38B2AC]/10 text-[#38B2AC] hover:bg-[#38B2AC]/20"
          )}
        >
          <Plus className={cn("w-4 h-4 transition-transform", showAddForm && "rotate-45")} />
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div
          className="p-4 border-b border-[#233554] bg-[#112240]/50 space-y-3"
          style={{ animation: 'fadeSlideDown 0.2s ease-out' }}
        >
          <div className="text-[10px] uppercase text-[#38B2AC] font-bold tracking-widest mb-2">新增阈值监控</div>

          {/* Symbol */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#8892B0]">监控标的</label>
            <select
              value={newSymbol}
              onChange={e => {
                setNewSymbol(e.target.value);
                // Reset metric if changing to/from system
                if (e.target.value === '__system__' && !['cpu', 'latency', 'accuracy'].includes(newMetric)) {
                  setNewMetric('cpu');
                } else if (e.target.value !== '__system__' && ['cpu', 'latency', 'accuracy'].includes(newMetric)) {
                  setNewMetric('price');
                }
              }}
              className="w-full bg-[#071425] border border-[#233554] rounded-lg px-3 py-2 text-xs text-[#CCD6F6] focus:outline-none focus:border-[#38B2AC] transition-colors"
            >
              {SYMBOL_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {refPrice && (
              <div className="text-[10px] text-[#8892B0]">
                当前价格: <span className="text-[#38B2AC] font-mono">${refPrice.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Metric */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#8892B0]">监控指标</label>
            <div className="grid grid-cols-3 gap-1.5">
              {availableMetrics.map(m => (
                <button
                  key={m}
                  onClick={() => setNewMetric(m)}
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-[10px] border transition-all",
                    newMetric === m
                      ? "bg-[#38B2AC]/10 border-[#38B2AC]/50 text-[#38B2AC]"
                      : "bg-[#071425] border-[#233554] text-[#8892B0] hover:border-[#38B2AC]/30"
                  )}
                >
                  {METRIC_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          {/* Condition + Value */}
          <div className="flex gap-2">
            <div className="space-y-1 w-24">
              <label className="text-[10px] text-[#8892B0]">条件</label>
              <div className="flex rounded-lg overflow-hidden border border-[#233554]">
                <button
                  onClick={() => setNewCondition('above')}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] transition-all",
                    newCondition === 'above'
                      ? "bg-[#F56565]/20 text-[#F56565]"
                      : "bg-[#071425] text-[#8892B0]"
                  )}
                >
                  高于
                </button>
                <button
                  onClick={() => setNewCondition('below')}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] transition-all",
                    newCondition === 'below'
                      ? "bg-[#38B2AC]/20 text-[#38B2AC]"
                      : "bg-[#071425] text-[#8892B0]"
                  )}
                >
                  低于
                </button>
              </div>
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-[10px] text-[#8892B0]">阈值</label>
              <input
                type="number"
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                placeholder="输入数值..."
                className="w-full bg-[#071425] border border-[#233554] rounded-lg px-3 py-1.5 text-xs text-[#CCD6F6] font-mono focus:outline-none focus:border-[#38B2AC] transition-colors"
              />
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!newValue || isNaN(parseFloat(newValue))}
            className="w-full py-2 bg-gradient-to-r from-[#38B2AC] to-[#4299E1] text-white text-xs rounded-lg font-bold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            添加监控阈值
          </button>
        </div>
      )}

      {/* Thresholds List */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {thresholds.length === 0 ? (
          <div className="py-12 text-center text-[#8892B0] flex flex-col items-center gap-2">
            <Settings2 className="w-8 h-8 opacity-20" />
            <p className="text-xs">暂无监控阈值</p>
            <p className="text-[10px]">点击右上角 + 添加新的监控规则</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {thresholds.map((th) => (
              <ThresholdItem key={th.id} threshold={th} onRemove={removeThreshold} onToggle={toggleThreshold} />
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-3 border-t border-[#233554] bg-[#112240]/50">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#8892B0]">
            共 {thresholds.length} 条规则，{thresholds.filter(t => t.enabled).length} 条启用中
          </span>
          <div className="flex items-center gap-1 text-[10px] text-[#38B2AC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38B2AC] animate-pulse" />
            实时监控中
          </div>
        </div>
      </div>
    </div>
  );
}

function ThresholdItem({ threshold: th, onRemove, onToggle }: { threshold: AlertThreshold; onRemove: (id: string) => void; onToggle: (id: string) => void }) {
  const condColor = th.condition === 'above' ? 'text-[#F56565]' : 'text-[#38B2AC]';
  const condSymbol = th.condition === 'above' ? '↑' : '↓';

  return (
    <div className={cn(
      "p-3 border-b border-[#233554]/50 hover:bg-[#112240]/50 transition-colors group",
      !th.enabled && "opacity-40"
    )}>
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-white tracking-wide">
              {th.symbol === '__system__' ? '系统' : th.symbol}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#112240] text-[#8892B0] border border-[#233554]/50">
              {METRIC_LABELS[th.metric]}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className={condColor}>{condSymbol} {th.condition === 'above' ? '高于' : '低于'}</span>
            <span className="text-[#CCD6F6] font-mono">{th.value.toLocaleString()}</span>
            <span className="text-[#233554]">|</span>
            <span className="text-[#8892B0]">冷却 {th.cooldownMs / 1000}s</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(th.id); }}
            className="p-1.5 rounded-lg hover:bg-[#112240] transition-colors"
            title={th.enabled ? '暂停' : '启用'}
          >
            {th.enabled
              ? <Eye className="w-3.5 h-3.5 text-[#38B2AC]" />
              : <EyeOff className="w-3.5 h-3.5 text-[#8892B0]" />
            }
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(th.id); }}
            className="p-1.5 rounded-lg hover:bg-[#F56565]/10 transition-colors"
            title="删除"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#F56565]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const AlertCenter = () => {
  const { alerts, markAsRead, markAllAsRead, clearAlerts, thresholds } = useAlerts();
  const unreadCount = alerts.filter(a => !a.read).length;
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'alerts' | 'config'>('alerts');
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // Reset to alerts view on close
        setTimeout(() => setView('alerts'), 300);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (view === 'config') {
          setView('alerts');
        } else {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, view]);

  const getIcon = (type: Alert['type'], severity: Alert['severity']) => {
    if (severity === 'critical') return <ShieldAlert className="w-4 h-4 text-[#F56565]" />;
    if (severity === 'warning') return <AlertTriangle className="w-4 h-4 text-[#ECC94B]" />;
    switch (type) {
      case 'price': return <Bell className="w-4 h-4 text-[#4299E1]" />;
      case 'risk': return <ShieldAlert className="w-4 h-4 text-[#ECC94B]" />;
      case 'system': return <Info className="w-4 h-4 text-[#38B2AC]" />;
      case 'technical': return <Info className="w-4 h-4 text-[#38B2AC]" />;
      default: return <Bell className="w-4 h-4 text-[#8892B0]" />;
    }
  };

  const getSourceBadge = (source?: string) => {
    if (!source) return null;
    const colors: Record<string, string> = {
      market: 'bg-[#4299E1]/10 text-[#4299E1]',
      risk: 'bg-[#F56565]/10 text-[#F56565]',
      admin: 'bg-[#ECC94B]/10 text-[#ECC94B]',
      quantum: 'bg-[#38B2AC]/10 text-[#38B2AC]',
      strategy: 'bg-[#9F7AEA]/10 text-[#9F7AEA]',
    };
    const labels: Record<string, string> = {
      market: '行情', risk: '风控', admin: '系统', quantum: '量子', strategy: '策略',
    };
    return (
      <span className={cn("text-[8px] px-1 py-0.5 rounded", colors[source] || 'bg-[#112240] text-[#8892B0]')}>
        {labels[source] || source}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#8892B0] hover:text-[#CCD6F6] transition-colors rounded-full hover:bg-[#112240]"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#F56565] text-white text-[8px] flex items-center justify-center rounded-full font-bold animate-pulse border-2 border-[#0A192F]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-[340px] bg-[#0A192F] border border-[#233554] rounded-xl shadow-2xl z-[100] overflow-hidden flex flex-col"
          style={{ animation: 'fadeSlideDown 0.2s ease-out', maxHeight: '520px' }}
        >
          <style>{`
            @keyframes fadeSlideDown {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {view === 'config' ? (
            <ThresholdConfigPanel onBack={() => setView('alerts')} />
          ) : (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#233554]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  智能预警中心
                  <span className="text-[10px] bg-[#112240] px-1.5 py-0.5 rounded text-[#8892B0]">
                    {thresholds.filter(t => t.enabled).length} 监控中
                  </span>
                </h3>
                <div className="flex gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                      className="text-[#8892B0] hover:text-[#38B2AC] transition-colors p-1"
                      title="全部已读"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); clearAlerts(); }}
                    className="text-[#8892B0] hover:text-[#F56565] transition-colors p-1"
                    title="清空全部"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Alert List */}
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', maxHeight: '380px' }}>
                {alerts.length === 0 ? (
                  <div className="py-12 text-center text-[#8892B0] flex flex-col items-center gap-2">
                    <Bell className="w-8 h-8 opacity-20" />
                    <p className="text-xs">暂无未处理预警</p>
                    <p className="text-[10px]">系统将自动监控已配置的阈值</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={cn(
                          "p-3.5 border-b border-[#233554]/50 hover:bg-[#112240]/50 transition-colors cursor-pointer relative group",
                          !alert.read && "bg-[#112240]/30"
                        )}
                        onClick={() => markAsRead(alert.id)}
                      >
                        <div className="flex gap-3">
                          <div className="mt-0.5 shrink-0">
                            {getIcon(alert.type, alert.severity)}
                          </div>
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white tracking-wide">
                                  {alert.symbol}
                                </span>
                                {getSourceBadge(alert.source)}
                              </div>
                              <span className="text-[10px] text-[#8892B0] whitespace-nowrap shrink-0">
                                {formatTime(alert.timestamp)}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#CCD6F6] leading-relaxed">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                        {!alert.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#4299E1]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-[#233554] bg-[#112240]/50 flex justify-center">
                <button
                  onClick={() => setView('config')}
                  className="text-[10px] text-[#38B2AC] hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-[#38B2AC]/10"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  配置阈值与指标告警
                  <span className="text-[#233554]">|</span>
                  <span className="text-[#8892B0]">{thresholds.length} 规则</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};