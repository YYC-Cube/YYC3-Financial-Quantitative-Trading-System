import React, { useState, useMemo, useCallback } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Star, TrendingUp, TrendingDown, ArrowRight, Activity, Plus, ShieldAlert, BellRing } from '@/app/components/SafeIcons';
import { useTranslation } from '@/app/i18n/mock';
import { useSettings } from '@/app/contexts/SettingsContext';
import { useAlerts } from '@/app/contexts/AlertContext';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';
import { getAnalytics } from '@/app/services/AnalyticsService';
import { toast } from 'sonner';

type IconProps = React.SVGProps<SVGSVGElement>;
const SearchIcon = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ChevronLeft = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRight = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const SortAsc = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h5m8-4v12m0 0l-4-4m4 4l4-4" /></svg>;

type SortField = 'symbol' | 'price' | 'change' | 'volume' | 'marketCap';
type SortDir = 'asc' | 'desc';

const ROWS_PER_PAGE = 15;

// Parse volume string to number for sorting
function parseVolume(v: string): number {
  const clean = v.replace(/,/g, '');
  if (clean.endsWith('T')) return parseFloat(clean) * 1e12;
  if (clean.endsWith('B')) return parseFloat(clean) * 1e9;
  if (clean.endsWith('M')) return parseFloat(clean) * 1e6;
  if (clean.endsWith('K')) return parseFloat(clean) * 1e3;
  return parseFloat(clean) || 0;
}

function parseMcap(v: string): number {
  if (v === '-') return 0;
  const clean = v.replace(/,/g, '');
  if (clean.endsWith('T')) return parseFloat(clean) * 1e12;
  if (clean.endsWith('B')) return parseFloat(clean) * 1e9;
  if (clean.endsWith('M')) return parseFloat(clean) * 1e6;
  return parseFloat(clean) || 0;
}

export const GlobalQuotes = () => {
  const [activeTab, setActiveTab] = useState('加密货币');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const { t } = useTranslation();
  const { getChangeColorClass, getChangeBgClass } = useSettings();
  const { thresholds } = useAlerts();
  const { marketData, getAssetsByCategory, account, activeStrategies, riskMetrics, formatPrice, navigateTo, favorites, toggleFavorite } = useGlobalData();

  const rawData = getAssetsByCategory(activeTab);

  // Filter + search + sort pipeline
  const processedData = useMemo(() => {
    let filtered = rawData;

    // Favorites filter
    if (showFavOnly) {
      filtered = filtered.filter(a => favorites.has(a.symbol));
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(a =>
        a.symbol.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'symbol': cmp = a.symbol.localeCompare(b.symbol); break;
        case 'price': cmp = a.price - b.price; break;
        case 'change': cmp = a.change - b.change; break;
        case 'volume': cmp = parseVolume(a.volume) - parseVolume(b.volume); break;
        case 'marketCap': cmp = parseMcap(a.marketCap) - parseMcap(b.marketCap); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [rawData, searchQuery, sortField, sortDir, showFavOnly, favorites]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processedData.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageData = processedData.slice(safePage * ROWS_PER_PAGE, (safePage + 1) * ROWS_PER_PAGE);

  // Reset page when filters change
  const handleTabChange = (tab: string) => { setActiveTab(tab); setPage(0); setSearchQuery(''); };
  const handleSearch = (q: string) => { setSearchQuery(q); setPage(0); getAnalytics().trackWatchlistAction('search'); };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIndicator = ({ field }: { field: SortField }) => (
    <span className={`ml-1 inline-block transition-transform ${sortField === field ? 'text-[#38B2AC]' : 'text-[#233554]'} ${sortField === field && sortDir === 'asc' ? 'rotate-180' : ''}`}>
      ▾
    </span>
  );

  const MARKETS_LIST = [
    { id: '加密货币', label: t('market.crypto') },
    { id: '股票', label: t('market.stocks') },
    { id: '期货', label: t('market.futures') },
    { id: '外汇', label: t('market.forex') },
  ];

  const btc = marketData.find(a => a.symbol === 'BTC/USDT');
  const summaryCards = [
    { name: '总资产', id: 'account', price: `$${account.totalAssets.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`, change: account.todayPnlPercent, link: () => navigateTo('trade', 'real', '资产监控') },
    { name: 'BTC', id: 'BTC', price: btc ? formatPrice(btc.price) : '--', change: btc?.change || 0, link: null },
    { name: '活跃策略', id: 'strategies', price: `${activeStrategies.length}个`, change: activeStrategies.reduce((s, st) => s + parseFloat(st.pnl), 0), link: () => navigateTo('strategy', 'manage') },
    { name: '风险VaR95', id: 'risk', price: `$${Math.abs(riskMetrics.portfolioVaR95).toLocaleString()}`, change: riskMetrics.maxDrawdown, link: () => navigateTo('risk', 'quantum_risk') },
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {summaryCards.map((item, i) => (
          <Card
            key={i}
            className="p-4 flex flex-col justify-between bg-gradient-to-br from-[#112240] to-[#0A192F] hover:border-[#38B2AC]/50 transition-colors cursor-pointer group"
            onClick={() => item.link?.()}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[#8892B0] text-xs font-bold uppercase">{item.name}</p>
                <h3 className="text-xl font-bold text-white mt-1 group-hover:text-[#38B2AC] transition-colors">{item.price}</h3>
              </div>
              <div className={`p-2 rounded-full ${getChangeBgClass(item.change)} bg-opacity-10`}>
                {item.change >= 0 ? <TrendingUp className={`w-4 h-4 ${getChangeColorClass(1)}`} /> : <TrendingDown className={`w-4 h-4 ${getChangeColorClass(-1)}`} />}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-xs font-mono ${getChangeColorClass(item.change)}`}>
                {item.change >= 0 ? '+' : ''}{typeof item.change === 'number' ? item.change.toFixed(2) : item.change}%
              </span>
              {item.link && <span className="text-[10px] text-[#4299E1] opacity-0 group-hover:opacity-100 transition-opacity">查看详情 &rarr;</span>}
              {!item.link && <Activity className="w-8 h-4 text-[#233554] group-hover:text-[#38B2AC]/30 transition-colors" />}
            </div>
          </Card>
        ))}
      </div>

      {/* Sentinel Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <Card className="col-span-1 md:col-span-2 p-4 bg-[#112240]/40 border-dashed border-[#233554] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#38B2AC]/10 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-[#38B2AC]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-tight">智能哨兵系统 (Sentinel)</h4>
              <p className="text-[10px] text-[#8892B0]">基于实时 WebSocket 流的自定义指标阈值监控已开启</p>
            </div>
          </div>
          <div className="flex gap-4">
            {thresholds.filter(t => t.enabled && t.symbol !== '__system__').slice(0, 4).map((t) => (
              <div key={t.id} className="px-3 py-1.5 bg-[#071425] border border-[#233554] rounded flex flex-col gap-0.5 min-w-[100px]">
                <span className="text-[9px] text-[#8892B0] font-bold uppercase">{t.symbol} 监控</span>
                <span className="text-xs text-[#CCD6F6] font-mono">
                  {t.condition === 'above' ? '≥' : '≤'} {t.value.toLocaleString()}
                </span>
              </div>
            ))}
            <button
              onClick={() => {
                toast('新增监控规则', { description: '请前往预警中心配置自定义阈值监控' });
                navigateTo('admin', 'alert');
              }}
              className="flex items-center justify-center w-8 h-8 bg-[#112240] border border-[#233554] rounded-full text-[#38B2AC] hover:bg-[#233554] transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-[#112240] to-[#1A365D] border-[#4299E1]/30 flex items-center gap-4">
          <div className="relative">
            <BellRing className="w-6 h-6 text-[#4299E1] animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#F56565] rounded-full" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">WebSocket 实时推送中</h4>
            <p className="text-[9px] text-[#8892B0] mt-0.5">所有异常波动均已同步至"智能预警中心"</p>
          </div>
        </Card>
      </div>

      {/* Main Quote Table */}
      <Card className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Header: Tabs + Search + Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 lg:px-6 py-3 border-b border-[#233554] bg-[#0A192F] gap-2">
          <div className="flex items-center gap-1">
            {MARKETS_LIST.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 lg:px-4 py-2 rounded-t-sm text-sm font-bold transition-all relative ${
                  activeTab === tab.id
                    ? 'text-[#38B2AC] bg-[#112240]'
                    : 'text-[#8892B0] hover:text-[#CCD6F6] hover:bg-[#112240]/50'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#38B2AC]" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Favorites toggle */}
            <button
              onClick={() => { setShowFavOnly(f => !f); setPage(0); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
                showFavOnly ? 'bg-[#ECC94B]/20 text-[#ECC94B] border border-[#ECC94B]/40' : 'text-[#8892B0] hover:text-[#CCD6F6] border border-[#233554]'
              }`}
            >
              <Star className="w-3 h-3" fill={showFavOnly ? 'currentColor' : 'none'} />
              收藏 ({favorites.size})
            </button>

            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8892B0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜索代码/名称..."
                className="bg-[#071425] border border-[#233554] rounded pl-8 pr-3 py-1.5 text-xs text-[#CCD6F6] focus:outline-none focus:border-[#4299E1] w-40 lg:w-52 placeholder-[#8892B0]/50"
              />
            </div>

            {/* Count + Realtime indicator */}
            <div className="flex items-center gap-2 text-[10px] text-[#8892B0]">
              <span>{processedData.length} 条</span>
              <span className="w-px h-3 bg-[#233554]" />
              <span className="w-2 h-2 rounded-full bg-[#38B2AC] animate-pulse" />
              {t('market.realtime')}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-[#112240]/30">
          <table className="w-full border-collapse">
            <thead className="text-xs text-[#8892B0] uppercase sticky top-0 bg-[#0A192F] z-10">
              <tr>
                <th className="py-3 px-4 text-left w-12"></th>
                <th className="py-3 px-4 text-left cursor-pointer select-none hover:text-[#CCD6F6]" onClick={() => handleSort('symbol')}>
                  {t('market.symbol')}<SortIndicator field="symbol" />
                </th>
                <th className="py-3 px-4 text-left">{t('market.name')}</th>
                <th className="py-3 px-4 text-right cursor-pointer select-none hover:text-[#CCD6F6]" onClick={() => handleSort('price')}>
                  {t('market.price')}<SortIndicator field="price" />
                </th>
                <th className="py-3 px-4 text-right cursor-pointer select-none hover:text-[#CCD6F6]" onClick={() => handleSort('change')}>
                  {t('market.change')}<SortIndicator field="change" />
                </th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">24h高</th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">24h低</th>
                <th className="py-3 px-4 text-right cursor-pointer select-none hover:text-[#CCD6F6] hidden md:table-cell" onClick={() => handleSort('volume')}>
                  {t('market.volume')}<SortIndicator field="volume" />
                </th>
                <th className="py-3 px-4 text-right cursor-pointer select-none hover:text-[#CCD6F6] hidden md:table-cell" onClick={() => handleSort('marketCap')}>
                  市值<SortIndicator field="marketCap" />
                </th>
                <th className="py-3 px-4 text-right w-12">{t('market.action')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {pageData.map((item) => (
                <tr
                  key={item.symbol}
                  className="border-b border-[#233554]/50 hover:bg-[#112240] group cursor-pointer"
                >
                  <td className="py-2.5 px-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(item.symbol); }}
                      className={`transition-colors ${favorites.has(item.symbol) ? 'text-[#ECC94B]' : 'text-[#233554] group-hover:text-[#8892B0]'}`}
                    >
                      <Star className="w-4 h-4" fill={favorites.has(item.symbol) ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-white text-xs">{item.symbol}</td>
                  <td className="py-2.5 px-4 text-[#CCD6F6] text-xs">{item.name}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-white text-xs transition-all duration-300">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${getChangeBgClass(item.change)}`}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#38B2AC] text-[10px] hidden lg:table-cell">{formatPrice(item.high24h)}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#F56565] text-[10px] hidden lg:table-cell">{formatPrice(item.low24h)}</td>
                  <td className="py-2.5 px-4 text-right text-[#8892B0] font-mono text-[10px] hidden md:table-cell">{item.volume}</td>
                  <td className="py-2.5 px-4 text-right text-[#8892B0] font-mono text-[10px] hidden md:table-cell">{item.marketCap}</td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => navigateTo('trade', 'real', '手动交易')}
                      className="p-1.5 text-[#4299E1] hover:bg-[#4299E1]/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-[#8892B0]">
              {searchQuery ? (
                <div className="text-center">
                  <SearchIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">未找到匹配 "{searchQuery}" 的结果</p>
                  <button onClick={() => setSearchQuery('')} className="text-xs text-[#4299E1] mt-2 hover:underline">清除搜索</button>
                </div>
              ) : showFavOnly ? (
                <div className="text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">该分类暂无收藏资产</p>
                  <button onClick={() => setShowFavOnly(false)} className="text-xs text-[#4299E1] mt-2 hover:underline">查看全部</button>
                </div>
              ) : (
                <p className="text-sm">该分类暂无数据</p>
              )}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 lg:px-6 py-2.5 border-t border-[#233554] bg-[#0A192F]">
            <span className="text-[10px] text-[#8892B0]">
              显示 {safePage * ROWS_PER_PAGE + 1}-{Math.min((safePage + 1) * ROWS_PER_PAGE, processedData.length)} / 共 {processedData.length} 条
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(0)}
                disabled={safePage === 0}
                className="px-2 py-1 text-[10px] text-[#8892B0] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                首��
              </button>
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="p-1 text-[#8892B0] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (safePage < 3) {
                  pageNum = i;
                } else if (safePage > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = safePage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 text-[10px] rounded ${
                      safePage === pageNum
                        ? 'bg-[#38B2AC] text-white'
                        : 'text-[#8892B0] hover:text-[#CCD6F6] hover:bg-[#112240]'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                className="p-1 text-[#8892B0] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={safePage >= totalPages - 1}
                className="px-2 py-1 text-[10px] text-[#8892B0] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                末页
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};