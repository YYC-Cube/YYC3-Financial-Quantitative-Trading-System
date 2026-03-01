import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Settings, X, GripVertical, Save, Plus, Star } from '@/app/components/SafeIcons';
import { useIsMobile } from '@/app/components/ui/use-mobile';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';
import { getKLineService, type CandleData } from '@/app/services/BinanceKLineService';
import { getAnalytics } from '@/app/services/AnalyticsService';
import { toast } from 'sonner';

type IconProps = React.SVGProps<SVGSVGElement>;
const Eye = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" strokeWidth={2} /></svg>;
const SearchIcon = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ArrowUp = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
const ArrowDown = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;

// Storage key
const STORAGE_KEY = 'yyc_custom_panel';

interface PanelWidget {
  id: string;
  title: string;
  type: 'chart' | 'list' | 'watchlist';
  symbol?: string;
}

const WIDGET_TEMPLATES: PanelWidget[] = [
  { id: 'tpl_btc_chart', title: 'BTC/USDT 实时图', type: 'chart', symbol: 'BTC/USDT' },
  { id: 'tpl_eth_chart', title: 'ETH/USDT 深度图', type: 'chart', symbol: 'ETH/USDT' },
  { id: 'tpl_sol_chart', title: 'SOL/USDT K线', type: 'chart', symbol: 'SOL/USDT' },
  { id: 'tpl_watchlist', title: '自选列表', type: 'watchlist' },
  { id: 'tpl_orders', title: '委托单监控', type: 'list' },
  { id: 'tpl_funding', title: '资金费率', type: 'chart' },
  { id: 'tpl_vol_surface', title: '波动率曲面', type: 'chart' },
  { id: 'tpl_risk_delta', title: '组合风险 (Delta)', type: 'chart' },
];

function loadLayout(): PanelWidget[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* fallback */ }
  return [
    { id: 'a', title: 'BTC/USDT 15m', type: 'chart', symbol: 'BTC/USDT' },
    { id: 'b', title: 'ETH/USDT 15m', type: 'chart', symbol: 'ETH/USDT' },
    { id: 'c', title: '自选列表', type: 'watchlist' },
    { id: 'd', title: '组合风险 (Delta)', type: 'chart' },
  ];
}

function saveLayout(items: PanelWidget[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}

// ── SVG Mini Sparkline from candle data ──
const MiniSparkline = ({ candles, width = 60, height = 16 }: { candles: CandleData[]; width?: number; height?: number }) => {
  if (candles.length < 2) return null;
  const closes = candles.map(c => c.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const isUp = closes[closes.length - 1] >= closes[0];

  const points = closes.map((v, i) => {
    const x = (i / (closes.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        fill="none"
        stroke={isUp ? '#38B2AC' : '#F56565'}
        strokeWidth="1.2"
        points={points}
      />
    </svg>
  );
};

// ── Watchlist Widget (live data + sparklines from K-line service) ──
const WatchlistWidget = () => {
  const { marketData, formatPrice, navigateTo, favorites, toggleFavorite } = useGlobalData();
  const [searchQ, setSearchQ] = useState('');
  const [sparklines, setSparklines] = useState<Record<string, CandleData[]>>({});

  // Load sparkline data for watched symbols
  useEffect(() => {
    let cancelled = false;
    const loadSparklines = async () => {
      const svc = getKLineService();
      const supportedSymbols = svc.getSupportedSymbols().map(s => s.display);
      const toLoad = [...favorites].filter(s => supportedSymbols.includes(s));

      const results: Record<string, CandleData[]> = {};
      await Promise.all(
        toLoad.map(async (symbol) => {
          try {
            const { data } = await svc.getKLines(symbol, '1h', 20);
            if (!cancelled) results[symbol] = data;
          } catch { /* skip */ }
        })
      );
      if (!cancelled) setSparklines(prev => ({ ...prev, ...results }));
    };
    loadSparklines();
    const interval = setInterval(loadSparklines, 300_000); // refresh every 5 min
    return () => { cancelled = true; clearInterval(interval); };
  }, [favorites]);

  const cryptoAssets = marketData.filter(a => a.category === '加密货币');
  const displayAssets = searchQ.trim()
    ? cryptoAssets.filter(a => a.symbol.toLowerCase().includes(searchQ.toLowerCase()) || a.name.toLowerCase().includes(searchQ.toLowerCase())).slice(0, 12)
    : cryptoAssets.filter(a => favorites.has(a.symbol));

  return (
    <div className="flex flex-col h-full">
      <div className="px-2 pt-1 pb-1">
        <div className="relative">
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8892B0]" />
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="搜索添加..."
            className="w-full bg-[#071425] border border-[#233554] rounded pl-7 pr-2 py-1 text-[10px] text-[#CCD6F6] focus:outline-none focus:border-[#4299E1] placeholder-[#8892B0]/50"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto px-1">
        {displayAssets.length === 0 ? (
          <p className="text-[10px] text-[#8892B0] text-center py-4">
            {searchQ ? '无匹配结果' : '自选列表为空 — 在全球行情中点击星标添加'}
          </p>
        ) : (
          displayAssets.map(asset => {
            const isWatched = favorites.has(asset.symbol);
            const candles = sparklines[asset.symbol];
            return (
              <div
                key={asset.symbol}
                className="flex items-center justify-between px-2 py-1.5 hover:bg-[#112240] rounded cursor-pointer group"
                onClick={() => navigateTo('market', 'live', 'K线分析')}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(asset.symbol); }}
                    className={`shrink-0 ${isWatched ? 'text-[#ECC94B]' : 'text-[#233554] group-hover:text-[#8892B0]'}`}
                  >
                    <Star className="w-3 h-3" fill={isWatched ? 'currentColor' : 'none'} />
                  </button>
                  <span className="text-[10px] text-white font-bold truncate">{asset.symbol}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {candles && candles.length > 1 && (
                    <MiniSparkline candles={candles} width={48} height={14} />
                  )}
                  <span className="text-[10px] font-mono text-[#CCD6F6] w-16 text-right">{formatPrice(asset.price)}</span>
                  <span className={`text-[9px] font-mono w-14 text-right ${asset.change >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
                    {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="px-2 py-1 border-t border-[#233554]/30 flex items-center justify-between">
        <span className="text-[9px] text-[#8892B0]">{favorites.size} 个自选 (跨组件同步)</span>
        <span className="text-[9px] text-[#8892B0]">1h K线 · {cryptoAssets.length} 资产</span>
      </div>
    </div>
  );
};

// ── Chart Widget (shows live price + sparkline) ──
const ChartWidget = ({ symbol }: { symbol?: string }) => {
  const { getAsset, formatPrice } = useGlobalData();
  const [candles, setCandles] = useState<CandleData[]>([]);
  const asset = symbol ? getAsset(symbol) : null;

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await getKLineService().getKLines(symbol, '1h', 20);
        if (!cancelled) setCandles(data);
      } catch { /* skip */ }
    };
    load();
    const interval = setInterval(load, 300_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [symbol]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      {asset ? (
        <div className="text-center w-full px-2">
          <div className="w-full h-20 bg-[#071425] rounded mb-2 flex items-center justify-center border border-[#233554]/30 relative overflow-hidden">
            {candles.length > 1 ? (
              <MiniSparkline candles={candles} width={180} height={56} />
            ) : (
              <svg className="w-full h-full absolute inset-0 opacity-20" viewBox="0 0 100 40" preserveAspectRatio="none">
                <polyline fill="none" stroke={asset.change >= 0 ? '#38B2AC' : '#F56565'} strokeWidth="1"
                  points="0,30 10,25 20,28 30,18 40,22 50,15 60,20 70,12 80,16 90,8 100,10" />
              </svg>
            )}
            <div className="z-10 flex flex-col items-center absolute">
              <span className="text-xs text-white font-mono bg-[#071425]/70 px-1 rounded">{formatPrice(asset.price)}</span>
              <span className={`text-[9px] font-mono ${asset.change >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
                {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
              </span>
            </div>
          </div>
          <p className="text-[9px] text-[#8892B0]">1h K线 · 点击进入 K 线分析</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-full h-16 bg-[#071425] rounded mb-2 flex items-center justify-center border border-[#233554]/30">
            <svg className="w-8 h-8 text-[#233554]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <p className="text-[10px] text-[#8892B0]">图表组件</p>
        </div>
      )}
    </div>
  );
};

// ── List Widget ──
const ListWidget = () => {
  const { positions, formatPrice } = useGlobalData();
  return (
    <div className="flex flex-col gap-1 h-full overflow-auto text-[10px] w-full px-1">
      {positions.map((pos, i) => (
        <div key={i} className="flex justify-between items-center p-1.5 border-b border-[#233554]/30">
          <div className="flex items-center gap-1.5">
            <span className={`w-1 h-1 rounded-full ${pos.unrealizedPnl >= 0 ? 'bg-[#38B2AC]' : 'bg-[#F56565]'}`} />
            <span className="text-[#CCD6F6]">{pos.symbol}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#8892B0]">{formatPrice(pos.currentPrice)}</span>
            <span className={`font-mono ${pos.unrealizedPnl >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
              {pos.unrealizedPnl >= 0 ? '+' : ''}{pos.unrealizedPnl.toFixed(2)}
            </span>
          </div>
        </div>
      ))}
      {positions.length === 0 && <p className="text-[#8892B0] text-center py-4">暂无持仓</p>}
    </div>
  );
};

// ── Widget Container ──
const WidgetContainer = ({
  widget, onRemove, onSettings, onMoveUp, onMoveDown, isFirst, isLast, dragHandlers,
}: {
  widget: PanelWidget; onRemove: () => void; onSettings: () => void;
  onMoveUp: () => void; onMoveDown: () => void; isFirst: boolean; isLast: boolean;
  dragHandlers: { onDragStart: (e: React.DragEvent) => void; onDragOver: (e: React.DragEvent) => void; onDrop: (e: React.DragEvent) => void; onDragEnd: () => void; };
}) => (
  <div draggable onDragStart={dragHandlers.onDragStart} onDragOver={dragHandlers.onDragOver} onDrop={dragHandlers.onDrop} onDragEnd={dragHandlers.onDragEnd} className="h-full">
    <Card className="h-full flex flex-col overflow-hidden bg-[#112240] border border-[#233554] shadow-lg group min-h-[200px]">
      <div className="flex items-center justify-between p-2 bg-[#0A192F] border-b border-[#233554] cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-[#8892B0]" />
          <span className="text-xs font-bold text-white">{widget.title}</span>
          <span className="text-[8px] px-1 py-0.5 bg-[#071425] border border-[#233554] rounded text-[#8892B0]">
            {widget.type === 'chart' ? '图表' : widget.type === 'watchlist' ? '自选' : '列表'}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isFirst && <button onClick={onMoveUp} className="p-0.5 hover:bg-[#233554]/50 rounded" title="上移"><ArrowUp className="w-3 h-3 text-[#8892B0] hover:text-white" /></button>}
          {!isLast && <button onClick={onMoveDown} className="p-0.5 hover:bg-[#233554]/50 rounded" title="下移"><ArrowDown className="w-3 h-3 text-[#8892B0] hover:text-white" /></button>}
          <button onClick={onSettings} className="p-0.5 hover:bg-[#233554]/50 rounded" title="设置"><Settings className="w-3 h-3 text-[#8892B0] hover:text-white" /></button>
          <button onClick={onRemove} className="p-0.5 hover:bg-[#F56565]/20 rounded" title="移除"><X className="w-3 h-3 text-[#F56565] hover:text-white" /></button>
        </div>
      </div>
      <div className="flex-1 p-2 relative h-full">
        {widget.type === 'watchlist' ? <WatchlistWidget /> : widget.type === 'chart' ? <ChartWidget symbol={widget.symbol} /> : <ListWidget />}
      </div>
    </Card>
  </div>
);

// ── Main CustomPanel ──
export const CustomPanel = () => {
  const isMobile = useIsMobile();
  const [items, setItems] = useState<PanelWidget[]>(loadLayout);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => { saveLayout(items); }, [items]);

  const removeItem = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    setItems(prev => prev.filter(i => i.id !== id));
    if (item) {
      getAnalytics().trackWatchlistAction('remove', item.title);
      toast.success(`"${item.title}" 已移除`, { action: { label: '撤销', onClick: () => setItems(prev => [...prev, item]) } });
    }
  }, [items]);

  const handleAddWidget = useCallback((template: PanelWidget) => {
    const newWidget: PanelWidget = { id: `w${Date.now()}`, title: template.title, type: template.type, symbol: template.symbol };
    setItems(prev => [...prev, newWidget]);
    setShowAddMenu(false);
    getAnalytics().trackWatchlistAction('add', template.title);
    toast.success(`"${template.title}" 组件已添加`);
  }, []);

  const handleSaveLayout = useCallback(() => {
    setSaving(true);
    saveLayout(items);
    getAnalytics().trackFeatureUse('save_layout', { widgetCount: items.length });
    toast.promise(new Promise(resolve => setTimeout(resolve, 600)), {
      loading: '正在保存面板布局...',
      success: () => { setSaving(false); return `布局已保存 (${items.length}个组件) → localStorage`; },
      error: '保存失败',
    });
  }, [items]);

  const handleWidgetSettings = useCallback((item: PanelWidget) => {
    toast(`"${item.title}" 组件设置`, { description: `类型: ${item.type === 'chart' ? '图表' : item.type === 'watchlist' ? '自选列表' : '列表'} · 可配置时间周期、指标叠加` });
  }, []);

  const handlePreviewAll = useCallback(() => {
    toast(`全屏预览模式`, { description: `共 ${items.length} 个组件` });
  }, [items.length]);

  const moveItem = useCallback((index: number, direction: -1 | 1) => {
    setItems(prev => {
      const next = [...prev];
      const targetIdx = index + direction;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      [next[index], next[targetIdx]] = [next[targetIdx], next[index]];
      return next;
    });
  }, []);

  const handleDragStart = useCallback((index: number) => (e: React.DragEvent) => {
    dragItem.current = index;
    setDragIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverItem.current = index;
  }, []);

  const handleDrop = useCallback((_index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) return;
    setItems(prev => {
      const next = [...prev];
      const dragged = next[dragItem.current!];
      next.splice(dragItem.current!, 1);
      next.splice(dragOverItem.current!, 0, dragged);
      return next;
    });
    dragItem.current = null;
    dragOverItem.current = null;
    setDragIdx(null);
  }, []);

  const handleDragEnd = useCallback(() => { dragItem.current = null; dragOverItem.current = null; setDragIdx(null); }, []);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'} px-4 py-2 bg-[#112240] rounded border border-[#233554]`}>
        <div className="flex gap-4 relative">
          <button onClick={() => setShowAddMenu(!showAddMenu)} className="flex items-center gap-2 text-xs text-[#38B2AC] font-bold hover:brightness-110">
            <Plus className="w-4 h-4" /> 添加组件
          </button>
          {showAddMenu && (
            <div className="absolute top-8 left-0 z-20 bg-[#0A192F] border border-[#233554] rounded shadow-lg p-2 min-w-[220px]">
              {WIDGET_TEMPLATES.map((tmpl) => (
                <button key={tmpl.id} onClick={() => handleAddWidget(tmpl)} className="w-full text-left px-3 py-2 text-xs text-[#CCD6F6] hover:bg-[#112240] rounded flex items-center justify-between">
                  <span>{tmpl.title}</span>
                  <span className="text-[9px] text-[#8892B0]">{tmpl.type === 'chart' ? '图表' : tmpl.type === 'watchlist' ? '自选' : '列表'}</span>
                </button>
              ))}
            </div>
          )}
          <button onClick={handlePreviewAll} className="flex items-center gap-2 text-xs text-[#8892B0] hover:text-[#CCD6F6]">
            <Eye className="w-4 h-4" /> 预览
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#8892B0]">{items.length}个组件</span>
          <span className="text-[10px] text-[#38B2AC]/60">拖拽排序</span>
          <button onClick={handleSaveLayout} disabled={saving} className="flex items-center gap-2 px-3 py-1.5 bg-[#4299E1] text-white text-xs rounded font-bold hover:brightness-110 disabled:opacity-50">
            <Save className="w-3 h-3" /> 保存布局
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#0A192F] border border-[#233554] rounded overflow-auto relative p-4">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, index) => (
              <div key={item.id} className={`transition-opacity duration-200 ${dragIdx !== null && dragIdx === index ? 'opacity-40' : ''}`}>
                <WidgetContainer
                  widget={item} onRemove={() => removeItem(item.id)} onSettings={() => handleWidgetSettings(item)}
                  onMoveUp={() => moveItem(index, -1)} onMoveDown={() => moveItem(index, 1)}
                  isFirst={index === 0} isLast={index === items.length - 1}
                  dragHandlers={{ onDragStart: handleDragStart(index), onDragOver: handleDragOver(index), onDrop: handleDrop(index), onDragEnd: handleDragEnd }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[#8892B0] py-16">
            <Plus className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">面板为空，请添加组件</p>
            <button onClick={() => setShowAddMenu(true)} className="mt-3 px-4 py-1.5 bg-[#38B2AC] text-white text-xs rounded hover:brightness-110">添加第一个组件</button>
          </div>
        )}
      </div>

      {showAddMenu && <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />}
    </div>
  );
};
