import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card } from '@/app/components/ui/Card';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getDepthService, destroyDepthService } from '@/app/services/BinanceDepthService';
import type { OrderBookSnapshot, DepthLevel } from '@/app/services/BinanceDepthService';
import {
  getAggregatedQuote, getExchangeStatuses, getLiquidationEngine,
  getArbitrageSignals, recordArbitrageSignal, executeArbitrage,
  getMultiAccountSummary, getHedgeEngine, routeOrder,
  type AggregatedQuote, type LiquidationRule, type LiquidationEvent,
  type ArbitrageSignal, type HedgeRule, type HedgeExecution,
  type MultiAccountSummary,
} from '@/app/services/ExchangeAggregator';
import type { PositionFillEvent } from '@/app/contexts/GlobalDataContext';

type IconProps = React.SVGProps<SVGSVGElement>;

// Inline icons
const AlertTriangle = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const Download = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" strokeWidth={2} /><line x1="12" y1="15" x2="12" y2="3" strokeWidth={2} /></svg>;
const Shield = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const Link2 = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>;

// ── Extended Order Types ──
type BasicOrderType = 'limit' | 'market';
type AdvancedOrderType = 'oco' | 'trailing_stop' | 'stop_limit' | 'take_profit';

interface OrderEntry {
  id: string;
  time: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: BasicOrderType;
  advancedType?: AdvancedOrderType;
  price: number;
  quantity: number;
  filled: number;
  status: 'pending' | 'partial' | 'filled' | 'cancelled' | 'rejected';
  total: number;
  // Advanced fields
  stopPrice?: number;          // Stop-loss trigger price
  takeProfitPrice?: number;    // Take-profit price
  trailingDelta?: number;      // Trailing stop: delta in % from peak
  trailingHighPrice?: number;  // Trailing stop: tracked high water mark
  ocoGroupId?: string;         // OCO pair group ID
  exchange?: string;           // Multi-exchange routing
}

// ── Depth chart data builder ──
function buildDepthData(asks: DepthLevel[], bids: DepthLevel[]) {
  const data: { price: number; bidDepth?: number; askDepth?: number }[] = [];
  for (let i = bids.length - 1; i >= 0; i--) {
    data.push({ price: bids[i].price, bidDepth: bids[i].total });
  }
  for (let i = 0; i < asks.length; i++) {
    data.push({ price: asks[i].price, askDepth: asks[i].total });
  }
  return data;
}

// ── Recent trades generator ──
function generateRecentTrades(midPrice: number): { time: string; price: number; size: number; side: string }[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const t = new Date(now.getTime() - i * 800 - Math.random() * 400);
    return {
      time: `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}.${t.getMilliseconds().toString().padStart(3, '0')}`,
      price: +(midPrice + (Math.random() - 0.5) * midPrice * 0.001).toFixed(2),
      size: +(0.01 + Math.random() * 1.5).toFixed(3),
      side: Math.random() > 0.5 ? 'buy' : 'sell',
    };
  });
}

// ══════════════════════════════════════════════════════
// Real Trading Module (Main)
// ══════════════════════════════════════════════════════
const RealTradeModule = ({ activeTertiary }: { activeTertiary: string }) => {
  const { positions, account, formatPrice, formatUSD, formatPercent, getAsset, navigateTo, emitRiskSignal, riskMetrics, applyFill, closePosition, appendTradeRecord } = useGlobalData();

  // ── Basic state ──
  const [orderType, setOrderType] = useState<BasicOrderType>('limit');
  const [advancedType, setAdvancedType] = useState<AdvancedOrderType | ''>('');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderTab, setOrderTab] = useState('全部');
  const [tradingMode, setTradingMode] = useState<'live' | 'sim'>('sim');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const btcAsset = getAsset(selectedSymbol);
  const midPrice = btcAsset?.price || 96231.50;
  const [price, setPrice] = useState(btcAsset ? formatPrice(btcAsset.price) : '96,231.50');
  const [amount, setAmount] = useState('0.01');
  const [showDepth, setShowDepth] = useState(false);
  const [showAggregated, setShowAggregated] = useState(false);

  // ── Advanced order fields ──
  const [stopPrice, setStopPrice] = useState('');
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [trailingDelta, setTrailingDelta] = useState('1.5'); // percent

  // ── Order state machine ──
  const [orders, setOrders] = useState<OrderEntry[]>([]);
  const orderIdRef = useRef(0);

  // ── WebSocket Order Book ──
  const [orderBook, setOrderBook] = useState<{ asks: DepthLevel[]; bids: DepthLevel[] }>({ asks: [], bids: [] });
  const [depthStatus, setDepthStatus] = useState<'connecting' | 'connected' | 'simulated'>('connecting');
  const [recentTradesList, setRecentTradesList] = useState(() => generateRecentTrades(midPrice));

  // ── Multi-exchange aggregated quotes ──
  const [aggQuote, setAggQuote] = useState<AggregatedQuote | null>(null);

  // Track which orders have already been applied as position fills
  const appliedFillsRef = useRef<Set<string>>(new Set());

  // Subscribe to Binance depth WS
  useEffect(() => {
    const svc = getDepthService();
    svc.subscribe(
      selectedSymbol,
      midPrice,
      (snapshot: OrderBookSnapshot) => {
        setOrderBook({ asks: snapshot.asks, bids: snapshot.bids });
      },
      (status) => setDepthStatus(status),
    );
    return () => { destroyDepthService(); };
  }, [selectedSymbol]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep depth service updated with latest midPrice
  useEffect(() => {
    const svc = getDepthService();
    svc.updateMidPrice(midPrice);
  }, [midPrice]);

  // Refresh recent trades + order fill simulation + aggregated quotes
  useEffect(() => {
    const iv = setInterval(() => {
      const mp = btcAsset?.price || midPrice;
      setRecentTradesList(generateRecentTrades(mp));

      // Multi-exchange aggregated quote
      setAggQuote(getAggregatedQuote(selectedSymbol, mp));

      // ── Order fill simulation + advanced order logic ──
      setOrders(prev => {
        let updated = prev.map(o => {
          if (o.status !== 'pending' && o.status !== 'partial') return o;

          // ── Trailing Stop: update high water mark ──
          if (o.advancedType === 'trailing_stop' && o.trailingDelta && o.trailingHighPrice !== undefined) {
            const newHigh = Math.max(o.trailingHighPrice, mp);
            const trailingStop = newHigh * (1 - o.trailingDelta / 100);
            if (mp <= trailingStop) {
              // Trailing stop triggered
              return { ...o, trailingHighPrice: newHigh, status: 'filled' as const, filled: o.quantity, stopPrice: trailingStop };
            }
            return { ...o, trailingHighPrice: newHigh };
          }

          // ── Stop-Limit: trigger when price reaches stop price ──
          if (o.advancedType === 'stop_limit' && o.stopPrice) {
            if ((o.side === 'SELL' && mp <= o.stopPrice) || (o.side === 'BUY' && mp >= o.stopPrice)) {
              return { ...o, status: 'filled' as const, filled: o.quantity };
            }
            return o;
          }

          // ── Take-Profit: trigger when price reaches TP ──
          if (o.advancedType === 'take_profit' && o.takeProfitPrice) {
            if ((o.side === 'SELL' && mp >= o.takeProfitPrice) || (o.side === 'BUY' && mp <= o.takeProfitPrice)) {
              return { ...o, status: 'filled' as const, filled: o.quantity };
            }
            return o;
          }

          // ── Normal limit/market fill ──
          if (o.type === 'market' || (o.side === 'BUY' && o.price >= mp) || (o.side === 'SELL' && o.price <= mp)) {
            const fillIncrement = Math.min(o.quantity - o.filled, o.quantity * (0.3 + Math.random() * 0.7));
            const newFilled = +(o.filled + fillIncrement).toFixed(6);
            const newStatus = newFilled >= o.quantity * 0.999 ? 'filled' as const : 'partial' as const;
            if (newStatus === 'filled') {
              toast.success(`订单已成交: ${o.side} ${o.quantity} ${o.symbol.split('/')[0]} @ ${o.price.toLocaleString()}`, { description: `模式: ${tradingMode === 'live' ? '实盘' : '模拟'}` });
            }
            return { ...o, filled: newStatus === 'filled' ? o.quantity : newFilled, status: newStatus };
          }
          return o;
        });

        // ── OCO: if one side fills, cancel the other ──
        const filledOcoGroups = new Set(
          updated.filter(o => o.ocoGroupId && o.status === 'filled').map(o => o.ocoGroupId!)
        );
        if (filledOcoGroups.size > 0) {
          updated = updated.map(o => {
            if (o.ocoGroupId && filledOcoGroups.has(o.ocoGroupId) && o.status === 'pending') {
              toast.info(`OCO 联动取消: ${o.id}`, { description: `关联订单已成交，自动取消对向订单` });
              return { ...o, status: 'cancelled' as const };
            }
            return o;
          });
        }

        return updated;
      });
    }, 2000);
    return () => clearInterval(iv);
  }, [btcAsset, midPrice, tradingMode, selectedSymbol]);

  // ── Apply fills to GlobalDataContext positions ──
  useEffect(() => {
    const newlyFilled = orders.filter(
      o => o.status === 'filled' && !appliedFillsRef.current.has(o.id)
    );
    for (const order of newlyFilled) {
      appliedFillsRef.current.add(order.id);
      // Determine position effect: BUY opens/adds LONG, SELL opens/adds SHORT
      // If SELL and we have a matching LONG, it's a close/reduce; vice versa
      const matchingPos = positions.find(
        p => p.symbol === order.symbol &&
          ((order.side === 'SELL' && p.side === 'LONG') || (order.side === 'BUY' && p.side === 'SHORT'))
      );

      if (matchingPos) {
        // Close or reduce existing position
        if (order.quantity >= matchingPos.quantity * 0.95) {
          // Full close
          closePosition(matchingPos.symbol, matchingPos.side);
          toast.success(`持仓已平仓: ${matchingPos.symbol} ${matchingPos.side}`, {
            description: `数量: ${matchingPos.quantity} @ $${order.price.toLocaleString()}`,
          });
        } else {
          // Partial reduce — close then re-open with remaining quantity
          // Use applyFill logic: reduce from existing position
          closePosition(matchingPos.symbol, matchingPos.side);
          // Re-open with reduced quantity
          const remainQty = matchingPos.quantity - order.quantity;
          if (remainQty > 0.000001) {
            const fill: PositionFillEvent = {
              symbol: matchingPos.symbol,
              side: matchingPos.side === 'LONG' ? 'BUY' : 'SELL',
              quantity: remainQty,
              fillPrice: matchingPos.entryPrice,
              exchange: order.exchange,
              strategy: matchingPos.strategy,
            };
            applyFill(fill);
          }
        }
      } else {
        // Open new position or add to same-direction position
        const fill: PositionFillEvent = {
          symbol: order.symbol,
          side: order.side,
          quantity: order.quantity,
          fillPrice: order.price,
          exchange: order.exchange,
          strategy: '手动交易',
        };
        applyFill(fill);
      }

      // Record trade in global history
      const now = new Date();
      appendTradeRecord({
        time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`,
        symbol: order.symbol,
        side: order.side,
        price: order.price.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        quantity: order.quantity.toString(),
        pnl: matchingPos ? formatUSD(matchingPos.unrealizedPnl) : '--',
        strategy: '手动交易',
      });
    }
  }, [orders, positions, applyFill, closePosition, appendTradeRecord, formatUSD]);

  // Sync price with live data
  useEffect(() => {
    if (btcAsset && orderType === 'market') setPrice(formatPrice(btcAsset.price));
  }, [btcAsset, orderType, formatPrice]);

  // ── Derived values ──
  const numPrice = parseFloat(price.replace(/,/g, '')) || 0;
  const numAmount = parseFloat(amount) || 0;
  const totalValue = numPrice * numAmount;
  const fee = totalValue * 0.001;

  const handleQuickPercent = (pct: number) => {
    if (btcAsset) {
      const maxBuyable = account.availableBalance / btcAsset.price;
      setAmount((maxBuyable * pct / 100).toFixed(6));
    }
  };

  // ── Order Submission (supports all types) ──
  const handleSubmitOrder = useCallback(() => {
    if (totalValue <= 0) { toast.error('请输入有效数量'); return; }
    if (tradingMode === 'live') {
      if (!confirm(`确认实盘${side === 'buy' ? '买入' : '卖出'} ${amount} ${selectedSymbol.split('/')[0]} @ ${orderType === 'limit' ? price : '市价'}?\n总计 ≈ ${totalValue.toFixed(2)} USDT`)) return;
    }

    const baseOrder: Omit<OrderEntry, 'id'> = {
      time: Date.now(),
      symbol: selectedSymbol,
      side: side === 'buy' ? 'BUY' : 'SELL',
      type: orderType,
      price: orderType === 'market' ? midPrice : numPrice,
      quantity: numAmount,
      filled: 0,
      status: 'pending',
      total: totalValue,
      exchange: aggQuote ? (side === 'buy' ? aggQuote.bestAsk.exchange : aggQuote.bestBid.exchange) : 'Binance',
    };

    const newOrders: OrderEntry[] = [];

    if (advancedType === 'oco') {
      // OCO: create paired stop-loss and take-profit orders
      const spVal = parseFloat(stopPrice.replace(/,/g, '')) || 0;
      const tpVal = parseFloat(takeProfitPrice.replace(/,/g, '')) || 0;
      if (spVal <= 0 || tpVal <= 0) { toast.error('OCO 订单需要同时设置止损价和止盈价'); return; }
      const groupId = `OCO-${Date.now().toString(36)}`;
      const slOrder: OrderEntry = {
        ...baseOrder,
        id: `ORD-${(++orderIdRef.current).toString().padStart(5, '0')}`,
        advancedType: 'stop_limit',
        stopPrice: spVal,
        ocoGroupId: groupId,
        side: side === 'buy' ? 'SELL' : 'BUY', // SL is opposite direction
      };
      const tpOrder: OrderEntry = {
        ...baseOrder,
        id: `ORD-${(++orderIdRef.current).toString().padStart(5, '0')}`,
        advancedType: 'take_profit',
        takeProfitPrice: tpVal,
        ocoGroupId: groupId,
        side: side === 'buy' ? 'SELL' : 'BUY', // TP is opposite direction
      };
      newOrders.push(slOrder, tpOrder);
      toast.info(`OCO 订单组已提交 (${groupId})`, { description: `止损: $${spVal.toLocaleString()} | 止盈: $${tpVal.toLocaleString()}` });
    } else if (advancedType === 'trailing_stop') {
      const delta = parseFloat(trailingDelta) || 1.5;
      const order: OrderEntry = {
        ...baseOrder,
        id: `ORD-${(++orderIdRef.current).toString().padStart(5, '0')}`,
        advancedType: 'trailing_stop',
        trailingDelta: delta,
        trailingHighPrice: midPrice,
      };
      newOrders.push(order);
      toast.info(`追踪止损已设置: 回撤 ${delta}%`, { description: `当前追踪价 $${midPrice.toLocaleString()}` });
    } else if (advancedType === 'stop_limit') {
      const spVal = parseFloat(stopPrice.replace(/,/g, '')) || 0;
      if (spVal <= 0) { toast.error('请设置止损触发价格'); return; }
      const order: OrderEntry = {
        ...baseOrder,
        id: `ORD-${(++orderIdRef.current).toString().padStart(5, '0')}`,
        advancedType: 'stop_limit',
        stopPrice: spVal,
      };
      newOrders.push(order);
    } else if (advancedType === 'take_profit') {
      const tpVal = parseFloat(takeProfitPrice.replace(/,/g, '')) || 0;
      if (tpVal <= 0) { toast.error('请设置止盈价格'); return; }
      const order: OrderEntry = {
        ...baseOrder,
        id: `ORD-${(++orderIdRef.current).toString().padStart(5, '0')}`,
        advancedType: 'take_profit',
        takeProfitPrice: tpVal,
      };
      newOrders.push(order);
    } else {
      // Standard limit/market order with optional SL/TP
      const mainOrder: OrderEntry = {
        ...baseOrder,
        id: `ORD-${(++orderIdRef.current).toString().padStart(5, '0')}`,
      };
      // Attach SL/TP if provided
      const spVal = parseFloat(stopPrice.replace(/,/g, ''));
      const tpVal = parseFloat(takeProfitPrice.replace(/,/g, ''));
      if (spVal > 0) mainOrder.stopPrice = spVal;
      if (tpVal > 0) mainOrder.takeProfitPrice = tpVal;
      newOrders.push(mainOrder);

      toast.info(`${tradingMode === 'live' ? '实盘' : '模拟'}订单已提交`, {
        description: `${mainOrder.side} ${mainOrder.quantity} ${selectedSymbol.split('/')[0]} @ ${orderType === 'limit' ? price : '市价'} — ${mainOrder.id}${mainOrder.exchange ? ` via ${mainOrder.exchange}` : ''}`,
      });
    }

    setOrders(prev => [...newOrders, ...prev].slice(0, 100));

    // Emit risk signal for large orders
    if (totalValue > account.totalAssets * 0.1) {
      emitRiskSignal({
        source: 'trade', severity: 'warning', title: '大额订单提交',
        detail: `${baseOrder.side} ${selectedSymbol} 金额 $${totalValue.toFixed(0)} (占总资产 ${((totalValue / account.totalAssets) * 100).toFixed(1)}%)`,
        symbol: selectedSymbol, value: totalValue,
      });
    }
  }, [totalValue, side, amount, price, orderType, advancedType, selectedSymbol, midPrice, numPrice, numAmount, tradingMode, account, emitRiskSignal, stopPrice, takeProfitPrice, trailingDelta, aggQuote, formatPrice]);

  const handleCancelOrder = useCallback((orderId: string) => {
    setOrders(prev => {
      const target = prev.find(o => o.id === orderId);
      if (!target) return prev;
      // Also cancel OCO pair
      const updatedOrders = prev.map(o => {
        if (o.id === orderId && (o.status === 'pending' || o.status === 'partial')) {
          return { ...o, status: 'cancelled' as const };
        }
        if (target.ocoGroupId && o.ocoGroupId === target.ocoGroupId && o.id !== orderId && o.status === 'pending') {
          toast.info(`OCO 联动取消: ${o.id}`);
          return { ...o, status: 'cancelled' as const };
        }
        return o;
      });
      return updatedOrders;
    });
    toast.success(`订单 ${orderId} 已取消`);
  }, []);

  // Depth chart data
  const depthData = useMemo(() => buildDepthData(orderBook.asks, orderBook.bids), [orderBook]);

  // ── 资产监控 ──
  if (activeTertiary === '资产监控') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '总资产', value: formatUSD(account.totalAssets).replace('+', ''), change: formatPercent(account.todayPnlPercent), up: account.todayPnl >= 0 },
            { label: '可用余额', value: formatUSD(account.availableBalance).replace('+', '').replace('-', ''), change: '', up: true },
            { label: '持仓价值', value: formatUSD(account.positionValue).replace('+', '').replace('-', ''), change: formatPercent((account.positionValue / account.totalAssets) * 100), up: true },
            { label: '今日盈亏', value: formatUSD(account.todayPnl), change: formatPercent(account.todayPnlPercent), up: account.todayPnl >= 0 },
          ].map((s, i) => (
            <Card key={i} className="p-4">
              <p className="text-[10px] text-[#8892B0] uppercase">{s.label}</p>
              <p className={`text-xl font-mono mt-1 ${s.up ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{s.value}</p>
              {s.change && <p className={`text-[10px] mt-0.5 ${s.up ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{s.change}</p>}
            </Card>
          ))}
        </div>

        <Card className="p-4">
          <h3 className="text-white text-sm mb-3">资产分布</h3>
          <div className="space-y-3">
            {positions.map((pos, i) => {
              const val = pos.currentPrice * pos.quantity;
              const pct = (val / account.totalAssets) * 100;
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-16 text-xs text-white">{pos.symbol.split('/')[0]}</span>
                  <div className="flex-1">
                    <div className="h-3 bg-[#071425] rounded overflow-hidden">
                      <div className="h-full bg-[#4299E1]/60 rounded transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="w-24 text-right text-xs font-mono text-[#CCD6F6]">${val.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                  <span className="w-10 text-right text-[10px] text-[#8892B0]">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
            <div className="flex items-center gap-4">
              <span className="w-16 text-xs text-white">USDT</span>
              <div className="flex-1">
                <div className="h-3 bg-[#071425] rounded overflow-hidden">
                  <div className="h-full bg-[#38B2AC]/40 rounded transition-all" style={{ width: `${(account.availableBalance / account.totalAssets) * 100}%` }} />
                </div>
              </div>
              <span className="w-24 text-right text-xs font-mono text-[#CCD6F6]">${account.availableBalance.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
              <span className="w-10 text-right text-[10px] text-[#8892B0]">{((account.availableBalance / account.totalAssets) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── 委托记录 ──
  if (activeTertiary === '委托记录') {
    const statusLabel = (s: string) => s === 'filled' ? '已成交' : s === 'partial' ? '部分成交' : s === 'pending' ? '待成交' : s === 'rejected' ? '已拒绝' : '已取消';
    const typeLabel = (o: OrderEntry) => {
      if (o.advancedType === 'oco') return 'OCO';
      if (o.advancedType === 'trailing_stop') return `追踪止损 (${o.trailingDelta}%)`;
      if (o.advancedType === 'stop_limit') return `止损限价 @${o.stopPrice?.toLocaleString()}`;
      if (o.advancedType === 'take_profit') return `止盈 @${o.takeProfitPrice?.toLocaleString()}`;
      let label = o.type === 'limit' ? '限价' : '市价';
      if (o.stopPrice) label += ` SL:${o.stopPrice.toLocaleString()}`;
      if (o.takeProfitPrice) label += ` TP:${o.takeProfitPrice.toLocaleString()}`;
      return label;
    };
    const filtered = orderTab === '全部' ? orders :
      orderTab === '活跃' ? orders.filter(o => o.status === 'pending' || o.status === 'partial') :
      orderTab === '已成交' ? orders.filter(o => o.status === 'filled') :
      orders.filter(o => o.status === 'cancelled' || o.status === 'rejected');

    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm">委托记录 ({orders.length})</h3>
          <div className="flex items-center gap-2">
            {['全部', '活跃', '已成交', '已取消'].map((tab) => (
              <button key={tab} onClick={() => setOrderTab(tab)} className={`px-3 py-1 text-xs rounded ${orderTab === tab ? 'bg-[#38B2AC] text-white' : 'text-[#8892B0] hover:text-[#CCD6F6] hover:bg-[#112240]'}`}>{tab}</button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="text-[#8892B0] text-xs text-center py-8">暂无{orderTab === '全部' ? '' : orderTab}订单 — 请在交易面板中提交订单</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="text-[#8892B0] uppercase border-b border-[#233554]">
                <tr>
                  <th className="py-2 px-3 text-left">ID</th>
                  <th className="py-2 px-3 text-left">时间</th>
                  <th className="py-2 px-3 text-left">品种</th>
                  <th className="py-2 px-3 text-left">方向</th>
                  <th className="py-2 px-3 text-left">类型</th>
                  <th className="py-2 px-3 text-right">价格</th>
                  <th className="py-2 px-3 text-right">数量</th>
                  <th className="py-2 px-3 text-right">已成交</th>
                  <th className="py-2 px-3 text-left">状态</th>
                  <th className="py-2 px-3 text-left">路由</th>
                  <th className="py-2 px-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-[#233554]/30 hover:bg-[#112240]">
                    <td className="py-2 px-3 text-[#8892B0] font-mono">{o.id}{o.ocoGroupId && <span className="ml-1 text-[9px] text-[#ECC94B]">OCO</span>}</td>
                    <td className="py-2 px-3 text-[#8892B0]">{new Date(o.time).toLocaleTimeString()}</td>
                    <td className="py-2 px-3 text-white">{o.symbol}</td>
                    <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-[10px] ${o.side === 'BUY' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#F56565]/20 text-[#F56565]'}`}>{o.side}</span></td>
                    <td className="py-2 px-3 text-[#CCD6F6] text-[10px]">{typeLabel(o)}</td>
                    <td className="py-2 px-3 text-right font-mono text-[#CCD6F6]">{o.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 px-3 text-right font-mono text-[#CCD6F6]">{o.quantity}</td>
                    <td className="py-2 px-3 text-right font-mono text-[#CCD6F6]">{o.filled.toFixed(6)}</td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] ${o.status === 'filled' ? 'text-[#38B2AC]' : o.status === 'partial' ? 'text-[#ECC94B]' : o.status === 'pending' ? 'text-[#4299E1]' : 'text-[#8892B0]'}`}>{statusLabel(o.status)}</span>
                      {o.advancedType === 'trailing_stop' && o.status === 'pending' && <div className="text-[9px] text-[#8892B0] mt-0.5">HWM: ${o.trailingHighPrice?.toLocaleString()}</div>}
                    </td>
                    <td className="py-2 px-3 text-[10px] text-[#8892B0]">{o.exchange || '-'}</td>
                    <td className="py-2 px-3 text-right">
                      {(o.status === 'pending' || o.status === 'partial') && (
                        <button onClick={() => handleCancelOrder(o.id)} className="text-[9px] px-2 py-0.5 bg-[#F56565]/10 text-[#F56565] rounded hover:bg-[#F56565]/20">撤单</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    );
  }

  // ══════════════════════════════════════════════════════
  // Default: Trading interface
  // ══════════════════════════════════════════════════════
  return (
    <div className="space-y-4">
      {/* Mode + Symbol selector bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex bg-[#071425] rounded p-0.5">
            <button onClick={() => setTradingMode('sim')} className={`px-3 py-1.5 text-xs rounded ${tradingMode === 'sim' ? 'bg-[#38B2AC] text-white' : 'text-[#8892B0]'}`}>模拟</button>
            <button onClick={() => setTradingMode('live')} className={`px-3 py-1.5 text-xs rounded ${tradingMode === 'live' ? 'bg-[#F56565] text-white' : 'text-[#8892B0]'}`}>实盘</button>
          </div>
          <select value={selectedSymbol} onChange={(e) => { setSelectedSymbol(e.target.value); const a = getAsset(e.target.value); if (a) setPrice(formatPrice(a.price)); }} className="bg-[#071425] border border-[#233554] rounded px-3 py-1.5 text-xs text-[#CCD6F6]">
            {['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          {tradingMode === 'live' && <span className="px-2 py-0.5 bg-[#F56565]/20 text-[#F56565] rounded animate-pulse">实盘模式</span>}
          <span className={`px-2 py-0.5 rounded ${depthStatus === 'connected' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : depthStatus === 'simulated' ? 'bg-[#ECC94B]/20 text-[#ECC94B]' : 'bg-[#4299E1]/20 text-[#4299E1]'}`}>
            Depth: {depthStatus === 'connected' ? 'WS LIVE' : depthStatus === 'simulated' ? 'SIM' : 'Connecting...'}
          </span>
          <span className="text-[#8892B0]">挂单: {orders.filter(o => o.status === 'pending' || o.status === 'partial').length}</span>
          <span className="text-[#38B2AC]">成交: {orders.filter(o => o.status === 'filled').length}</span>
        </div>
      </div>

      {/* Multi-exchange aggregated bar */}
      {aggQuote && (
        <div className="flex items-center gap-2 text-[10px] px-3 py-2 bg-[#0A192F] rounded border border-[#233554]/50">
          <Link2 className="w-3 h-3 text-[#4299E1]" />
          <span className="text-[#8892B0]">聚合报价:</span>
          <span className="text-[#38B2AC] font-mono">Bid ${aggQuote.bestBid.price.toLocaleString()} <span className="text-[#8892B0]">({aggQuote.bestBid.exchange})</span></span>
          <span className="text-[#8892B0]">|</span>
          <span className="text-[#F56565] font-mono">Ask ${aggQuote.bestAsk.price.toLocaleString()} <span className="text-[#8892B0]">({aggQuote.bestAsk.exchange})</span></span>
          <span className="text-[#8892B0]">|</span>
          <span className="text-[#CCD6F6] font-mono">Spread: {aggQuote.spreadBps}bps</span>
          {aggQuote.exchanges.map(e => (
            <span key={e.exchange} className="ml-2">
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-0.5 ${e.status === 'online' ? 'bg-[#38B2AC]' : e.status === 'degraded' ? 'bg-[#ECC94B]' : 'bg-[#F56565]'}`} />
              <span className="text-[#8892B0]">{e.exchange} {e.latency}ms</span>
            </span>
          ))}
          <button onClick={() => setShowAggregated(!showAggregated)} className="ml-auto text-[#4299E1] hover:underline">{showAggregated ? '收起' : '展开'}</button>
        </div>
      )}

      {/* Aggregated Exchange Detail */}
      {showAggregated && aggQuote && (
        <Card className="p-3">
          <h4 className="text-white text-xs mb-2">多交易所聚合订单簿</h4>
          <div className="grid grid-cols-3 gap-3">
            {aggQuote.exchanges.map(e => (
              <div key={e.exchange} className="p-2 bg-[#0A192F] rounded border border-[#233554]/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white">{e.exchange}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${e.status === 'online' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : e.status === 'degraded' ? 'bg-[#ECC94B]/20 text-[#ECC94B]' : 'bg-[#F56565]/20 text-[#F56565]'}`}>{e.status}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#38B2AC] font-mono">B: {e.bestBid.toLocaleString()}</span>
                  <span className="text-[#F56565] font-mono">A: {e.bestAsk.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[9px] text-[#8892B0] mt-0.5">
                  <span>延迟: {e.latency}ms</span>
                  <span>费率: {(e.fee * 100).toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Book + Depth Chart (WS) */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-2 bg-[#0A192F] border-b border-[#233554] flex items-center justify-between">
            <h3 className="text-white text-xs">
              订单簿 {selectedSymbol}
              <span className={`text-[9px] ml-1 ${depthStatus === 'connected' ? 'text-[#38B2AC]' : 'text-[#ECC94B]'}`}>
                {depthStatus === 'connected' ? '● WS' : '● SIM'}
              </span>
            </h3>
            <button onClick={() => setShowDepth(!showDepth)} className="text-[10px] text-[#4299E1] hover:underline">{showDepth ? '列表' : '深度图'}</button>
          </div>
          {showDepth ? (
            <div className="p-2 h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={depthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#233554" />
                  <XAxis dataKey="price" tick={{ fill: '#8892B0', fontSize: 8 }} tickFormatter={(v: number) => v.toFixed(0)} />
                  <YAxis tick={{ fill: '#8892B0', fontSize: 8 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0A192F', border: '1px solid #233554', borderRadius: 8, fontSize: 10 }} />
                  <Area type="stepAfter" dataKey="bidDepth" stroke="#38B2AC" fill="#38B2AC" fillOpacity={0.2} strokeWidth={1.5} name="买盘深度" />
                  <Area type="stepAfter" dataKey="askDepth" stroke="#F56565" fill="#F56565" fillOpacity={0.2} strokeWidth={1.5} name="卖盘深度" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-2">
              <div className="space-y-0.5 mb-2">
                {orderBook.asks.slice().reverse().slice(0, 10).map((ask, i) => (
                  <div key={`ask-${i}`} className="flex items-center text-[10px] font-mono relative px-2 py-0.5 cursor-pointer hover:bg-[#F56565]/5" onClick={() => setPrice(ask.price.toFixed(2))}>
                    <div className="absolute right-0 top-0 bottom-0 bg-[#F56565]/10" style={{ width: `${Math.min(100, ask.total / (orderBook.asks[orderBook.asks.length - 1]?.total || 1) * 100)}%` }} />
                    <span className="flex-1 text-[#F56565] relative z-10">{ask.price.toFixed(2)}</span>
                    <span className="flex-1 text-right text-[#CCD6F6] relative z-10">{ask.size.toFixed(4)}</span>
                    <span className="flex-1 text-right text-[#8892B0] relative z-10">{ask.total.toFixed(4)}</span>
                  </div>
                ))}
              </div>
              <div className="text-center py-2 border-y border-[#233554]">
                <span className={`text-lg font-mono ${(btcAsset?.change || 0) >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{midPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-[10px] text-[#8892B0] ml-2">≈ ¥{(midPrice * 7.2).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
              </div>
              <div className="space-y-0.5 mt-2">
                {orderBook.bids.slice(0, 10).map((bid, i) => (
                  <div key={`bid-${i}`} className="flex items-center text-[10px] font-mono relative px-2 py-0.5 cursor-pointer hover:bg-[#38B2AC]/5" onClick={() => setPrice(bid.price.toFixed(2))}>
                    <div className="absolute left-0 top-0 bottom-0 bg-[#38B2AC]/10" style={{ width: `${Math.min(100, bid.total / (orderBook.bids[orderBook.bids.length - 1]?.total || 1) * 100)}%` }} />
                    <span className="flex-1 text-[#38B2AC] relative z-10">{bid.price.toFixed(2)}</span>
                    <span className="flex-1 text-right text-[#CCD6F6] relative z-10">{bid.size.toFixed(4)}</span>
                    <span className="flex-1 text-right text-[#8892B0] relative z-10">{bid.total.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Order Entry — Enhanced */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-xs">下单面板</h3>
            <span className={`text-[9px] px-2 py-0.5 rounded ${tradingMode === 'live' ? 'bg-[#F56565]/20 text-[#F56565]' : 'bg-[#38B2AC]/20 text-[#38B2AC]'}`}>{tradingMode === 'live' ? '实盘' : '模拟'}</span>
          </div>

          {/* Basic type */}
          <div className="flex bg-[#071425] rounded p-0.5 mb-3">
            <button onClick={() => setOrderType('limit')} className={`flex-1 py-1.5 text-xs rounded ${orderType === 'limit' ? 'bg-[#112240] text-white' : 'text-[#8892B0]'}`}>限价单</button>
            <button onClick={() => setOrderType('market')} className={`flex-1 py-1.5 text-xs rounded ${orderType === 'market' ? 'bg-[#112240] text-white' : 'text-[#8892B0]'}`}>市价单</button>
          </div>

          {/* Advanced type selector */}
          <div className="flex flex-wrap gap-1 mb-3">
            {([
              { key: '', label: '普通' },
              { key: 'oco', label: 'OCO' },
              { key: 'trailing_stop', label: '追踪止损' },
              { key: 'stop_limit', label: '止损限价' },
              { key: 'take_profit', label: '止盈' },
            ] as { key: AdvancedOrderType | ''; label: string }[]).map(t => (
              <button key={t.key} onClick={() => setAdvancedType(t.key)} className={`px-2 py-1 text-[10px] rounded border ${advancedType === t.key ? 'border-[#4299E1] bg-[#4299E1]/10 text-[#4299E1]' : 'border-[#233554] text-[#8892B0] hover:text-[#CCD6F6]'}`}>{t.label}</button>
            ))}
          </div>

          {/* Buy / Sell */}
          <div className="flex gap-2 mb-3">
            <button onClick={() => setSide('buy')} className={`flex-1 py-2 text-xs rounded transition-colors ${side === 'buy' ? 'bg-[#38B2AC] text-white' : 'bg-[#071425] text-[#8892B0] border border-[#233554]'}`}>买入/做多</button>
            <button onClick={() => setSide('sell')} className={`flex-1 py-2 text-xs rounded transition-colors ${side === 'sell' ? 'bg-[#F56565] text-white' : 'bg-[#071425] text-[#8892B0] border border-[#233554]'}`}>卖出/做空</button>
          </div>

          {/* Price (for limit orders) */}
          {orderType === 'limit' && (
            <div className="mb-2">
              <label className="text-[10px] text-[#8892B0] uppercase mb-1 block">价格 (USDT)</label>
              <input className="w-full bg-[#071425] border border-[#233554] rounded px-3 py-2 text-sm text-[#CCD6F6] font-mono focus:outline-none focus:border-[#4299E1]" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          )}

          {/* Quantity */}
          <div className="mb-2">
            <label className="text-[10px] text-[#8892B0] uppercase mb-1 block">数量 ({selectedSymbol.split('/')[0]})</label>
            <input className="w-full bg-[#071425] border border-[#233554] rounded px-3 py-2 text-sm text-[#CCD6F6] font-mono focus:outline-none focus:border-[#4299E1]" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <div className="flex gap-2 mt-1">
              {['25%', '50%', '75%', '100%'].map(pct => (
                <button key={pct} onClick={() => handleQuickPercent(parseFloat(pct))} className="flex-1 py-1 text-[10px] bg-[#071425] border border-[#233554] rounded text-[#8892B0] hover:text-[#CCD6F6] hover:border-[#4299E1]">{pct}</button>
              ))}
            </div>
          </div>

          {/* Stop-Loss / Take-Profit fields */}
          {(advancedType === '' || advancedType === 'oco' || advancedType === 'stop_limit') && (
            <div className="mb-2">
              <label className="text-[10px] text-[#8892B0] uppercase mb-1 block">
                {advancedType === 'oco' ? '止损价 (OCO)' : '止损价 (可选)'}
              </label>
              <input className="w-full bg-[#071425] border border-[#233554] rounded px-3 py-1.5 text-xs text-[#CCD6F6] font-mono focus:outline-none focus:border-[#F56565]" placeholder="触发止损的价格" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} />
            </div>
          )}
          {(advancedType === '' || advancedType === 'oco' || advancedType === 'take_profit') && (
            <div className="mb-2">
              <label className="text-[10px] text-[#8892B0] uppercase mb-1 block">
                {advancedType === 'oco' ? '止盈价 (OCO)' : '止盈价 (可选)'}
              </label>
              <input className="w-full bg-[#071425] border border-[#233554] rounded px-3 py-1.5 text-xs text-[#CCD6F6] font-mono focus:outline-none focus:border-[#38B2AC]" placeholder="触发止盈的价格" value={takeProfitPrice} onChange={(e) => setTakeProfitPrice(e.target.value)} />
            </div>
          )}

          {/* Trailing stop delta */}
          {advancedType === 'trailing_stop' && (
            <div className="mb-2">
              <label className="text-[10px] text-[#8892B0] uppercase mb-1 block">追踪回撤幅度 (%)</label>
              <input className="w-full bg-[#071425] border border-[#233554] rounded px-3 py-1.5 text-xs text-[#CCD6F6] font-mono focus:outline-none focus:border-[#ECC94B]" value={trailingDelta} onChange={(e) => setTrailingDelta(e.target.value)} />
              <p className="text-[9px] text-[#8892B0] mt-1">价格从最高点回撤 {trailingDelta}% 时自动触发止损。当前追踪价: ${midPrice.toLocaleString()}</p>
            </div>
          )}

          {/* Cost summary */}
          <div className="mb-3 p-2 bg-[#071425] rounded border border-[#233554]">
            <div className="flex justify-between text-xs">
              <span className="text-[#8892B0]">交易金额</span>
              <span className="text-white font-mono">≈ {totalValue.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between text-[10px] mt-1">
              <span className="text-[#8892B0]">手续费 (0.1%)</span>
              <span className="text-[#8892B0] font-mono">≈ {fee.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between text-[10px] mt-1">
              <span className="text-[#8892B0]">可用余额</span>
              <span className="text-[#CCD6F6] font-mono">${account.availableBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            {aggQuote && (
              <div className="flex justify-between text-[10px] mt-1">
                <span className="text-[#8892B0]">最优路由</span>
                <span className="text-[#4299E1] font-mono">{side === 'buy' ? aggQuote.bestAsk.exchange : aggQuote.bestBid.exchange}</span>
              </div>
            )}
          </div>

          <button onClick={handleSubmitOrder} className={`w-full py-3 rounded text-sm text-white transition-all ${side === 'buy' ? 'bg-[#38B2AC] hover:brightness-110' : 'bg-[#F56565] hover:brightness-110'}`}>
            {advancedType === 'oco' ? 'OCO ' : advancedType === 'trailing_stop' ? '追踪 ' : ''}{side === 'buy' ? '买入' : '卖出'} {selectedSymbol.split('/')[0]}
          </button>
        </Card>

        {/* Recent Trades */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-2 bg-[#0A192F] border-b border-[#233554]">
            <h3 className="text-white text-xs">最新成交 <span className="text-[9px] text-[#38B2AC] ml-1">● LIVE</span></h3>
          </div>
          <div className="p-2">
            <div className="flex items-center text-[10px] text-[#8892B0] uppercase px-2 py-1 border-b border-[#233554]">
              <span className="flex-1">时间</span>
              <span className="flex-1 text-right">价格</span>
              <span className="flex-1 text-right">数量</span>
            </div>
            <div className="space-y-0.5 mt-1">
              {recentTradesList.map((t, i) => (
                <div key={`trade-${i}`} className="flex items-center text-[10px] font-mono px-2 py-0.5 hover:bg-[#112240]/50">
                  <span className="flex-1 text-[#8892B0]">{t.time}</span>
                  <span className={`flex-1 text-right ${t.side === 'buy' ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{t.price.toFixed(2)}</span>
                  <span className="flex-1 text-right text-[#CCD6F6]">{t.size.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Active Orders */}
      {orders.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-xs">订单管理 ({orders.length})</h3>
            <div className="flex items-center gap-2">
              {['全部', '活跃', '已成交', '已取消'].map(tab => (
                <button key={tab} onClick={() => setOrderTab(tab)} className={`px-3 py-1 text-[10px] rounded ${orderTab === tab ? 'bg-[#38B2AC] text-white' : 'text-[#8892B0] hover:text-[#CCD6F6] hover:bg-[#112240]'}`}>{tab}</button>
              ))}
            </div>
          </div>
          <div className="overflow-auto max-h-[250px]">
            <table className="w-full text-xs">
              <thead className="text-[#8892B0] uppercase border-b border-[#233554] sticky top-0 bg-[#112240]">
                <tr>
                  <th className="py-2 px-2 text-left">ID</th>
                  <th className="py-2 px-2 text-left">时间</th>
                  <th className="py-2 px-2 text-left">品种</th>
                  <th className="py-2 px-2 text-left">方向</th>
                  <th className="py-2 px-2 text-left">类型</th>
                  <th className="py-2 px-2 text-right">价格</th>
                  <th className="py-2 px-2 text-right">数量</th>
                  <th className="py-2 px-2 text-right">已成交</th>
                  <th className="py-2 px-2 text-left">状态</th>
                  <th className="py-2 px-2 text-left">路由</th>
                  <th className="py-2 px-2 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter(o => orderTab === '全部' || (orderTab === '活跃' && (o.status === 'pending' || o.status === 'partial')) || (orderTab === '已成交' && o.status === 'filled') || (orderTab === '已取消' && (o.status === 'cancelled' || o.status === 'rejected')))
                  .map(o => (
                  <tr key={o.id} className="border-b border-[#233554]/30 hover:bg-[#112240]">
                    <td className="py-1.5 px-2 text-[#8892B0] font-mono">{o.id}{o.ocoGroupId && <span className="ml-1 text-[9px] text-[#ECC94B]">OCO</span>}</td>
                    <td className="py-1.5 px-2 text-[#8892B0]">{new Date(o.time).toLocaleTimeString()}</td>
                    <td className="py-1.5 px-2 text-[#CCD6F6]">{o.symbol}</td>
                    <td className="py-1.5 px-2"><span className={`px-1.5 py-0.5 rounded text-[9px] ${o.side === 'BUY' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#F56565]/20 text-[#F56565]'}`}>{o.side}</span></td>
                    <td className="py-1.5 px-2 text-[#8892B0] text-[10px]">
                      {o.advancedType === 'trailing_stop' ? `追踪 ${o.trailingDelta}%` : o.advancedType === 'stop_limit' ? '止损' : o.advancedType === 'take_profit' ? '止盈' : o.type === 'limit' ? '限价' : '市价'}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-[#CCD6F6]">{o.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-[#CCD6F6]">{o.quantity}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-[#CCD6F6]">{o.filled.toFixed(6)}</td>
                    <td className="py-1.5 px-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                        o.status === 'filled' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' :
                        o.status === 'partial' ? 'bg-[#ECC94B]/20 text-[#ECC94B]' :
                        o.status === 'pending' ? 'bg-[#4299E1]/20 text-[#4299E1]' :
                        'bg-[#8892B0]/20 text-[#8892B0]'
                      }`}>{o.status === 'filled' ? '已成交' : o.status === 'partial' ? '部分成交' : o.status === 'pending' ? '待成交' : '已取消'}</span>
                      {o.status === 'partial' && <div className="w-full h-1 bg-[#071425] rounded mt-1"><div className="h-full bg-[#ECC94B] rounded" style={{ width: `${(o.filled / o.quantity) * 100}%` }} /></div>}
                      {o.advancedType === 'trailing_stop' && o.status === 'pending' && <div className="text-[8px] text-[#8892B0] mt-0.5">HWM: ${o.trailingHighPrice?.toLocaleString()}</div>}
                    </td>
                    <td className="py-1.5 px-2 text-[10px] text-[#8892B0]">{o.exchange || '-'}</td>
                    <td className="py-1.5 px-2 text-right">
                      {(o.status === 'pending' || o.status === 'partial') && (
                        <button onClick={() => handleCancelOrder(o.id)} className="text-[9px] px-2 py-0.5 bg-[#F56565]/10 text-[#F56565] rounded hover:bg-[#F56565]/20">撤单</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Current Positions */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-xs">当前持仓</h3>
          <button onClick={() => navigateTo('risk', 'live_risk')} className="text-[10px] text-[#4299E1] hover:underline">风控监控 &rarr;</button>
        </div>
        <table className="w-full text-xs">
          <thead className="text-[#8892B0] uppercase border-b border-[#233554]">
            <tr>
              <th className="py-2 px-3 text-left">品种</th>
              <th className="py-2 px-3 text-left">方向</th>
              <th className="py-2 px-3 text-right">数量</th>
              <th className="py-2 px-3 text-right">开仓均价</th>
              <th className="py-2 px-3 text-right">现价</th>
              <th className="py-2 px-3 text-right">未实现盈亏</th>
              <th className="py-2 px-3 text-right">收益率</th>
              <th className="py-2 px-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos, i) => (
              <tr key={i} className="border-b border-[#233554]/30 hover:bg-[#112240]">
                <td className="py-2 px-3 text-white">{pos.symbol}</td>
                <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-[10px] ${pos.side === 'LONG' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#F56565]/20 text-[#F56565]'}`}>{pos.side}</span></td>
                <td className="py-2 px-3 text-right font-mono text-[#CCD6F6]">{pos.quantity}</td>
                <td className="py-2 px-3 text-right font-mono text-[#8892B0]">{formatPrice(pos.entryPrice)}</td>
                <td className="py-2 px-3 text-right font-mono text-[#CCD6F6]">{formatPrice(pos.currentPrice)}</td>
                <td className={`py-2 px-3 text-right font-mono ${pos.unrealizedPnl >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{formatUSD(pos.unrealizedPnl)}</td>
                <td className={`py-2 px-3 text-right font-mono ${pos.pnlPercent >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{formatPercent(pos.pnlPercent)}</td>
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        if (tradingMode === 'live' && !confirm(`确认平仓 ${pos.symbol} ${pos.side} ${pos.quantity}?`)) return;
                        const now = new Date();
                        appendTradeRecord({
                          time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`,
                          symbol: pos.symbol,
                          side: pos.side === 'LONG' ? 'SELL' : 'BUY',
                          price: formatPrice(pos.currentPrice),
                          quantity: pos.quantity.toString(),
                          pnl: formatUSD(pos.unrealizedPnl),
                          strategy: pos.strategy,
                        });
                        closePosition(pos.symbol, pos.side);
                        toast.success(`${pos.symbol} ${pos.side} 已平仓`, {
                          description: `已实现盈亏: ${formatUSD(pos.unrealizedPnl)} (${formatPercent(pos.pnlPercent)})`,
                        });
                      }}
                      className="text-[9px] px-2 py-0.5 bg-[#F56565]/10 text-[#F56565] rounded hover:bg-[#F56565]/20"
                    >
                      平仓
                    </button>
                    <button
                      onClick={() => {
                        closePosition(pos.symbol, pos.side);
                        // Re-open with half quantity
                        applyFill({
                          symbol: pos.symbol,
                          side: pos.side === 'LONG' ? 'BUY' : 'SELL',
                          quantity: +(pos.quantity * 0.5).toFixed(6),
                          fillPrice: pos.entryPrice,
                          exchange: pos.exchange,
                          strategy: pos.strategy,
                        });
                        toast.info(`${pos.symbol} 已减仓50%`, { description: `剩余: ${(pos.quantity * 0.5).toFixed(6)}` });
                      }}
                      className="text-[9px] px-2 py-0.5 bg-[#ECC94B]/10 text-[#ECC94B] rounded hover:bg-[#ECC94B]/20"
                    >
                      减半
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {positions.length === 0 && (
          <p className="text-[#8892B0] text-xs text-center py-6">暂无持仓 — 订单成交后将自动更新此处</p>
        )}
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// Simulation Trade Module
// ══════════════════════════════════════════════════════
const SimTradeModule = () => {
  const { navigateTo, positions } = useGlobalData();
  const simBalance = 500000;
  const simPosValue = positions.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
  const simProfit = simPosValue - positions.reduce((s, p) => s + p.entryPrice * p.quantity, 0);
  const simPct = simPosValue > 0 ? (simProfit / simBalance) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '模拟余额', value: `${simBalance.toLocaleString()} USDT`, color: 'text-white' },
          { label: '持仓市值', value: `${simPosValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} USDT`, color: 'text-[#4299E1]' },
          { label: '累计收益', value: `${simProfit >= 0 ? '+' : ''}${simProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} USDT`, color: simProfit >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]' },
          { label: '收益率', value: `${simPct >= 0 ? '+' : ''}${simPct.toFixed(2)}%`, color: simPct >= 0 ? 'text-[#38B2AC]' : 'text-[#F56565]' },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <p className="text-[10px] text-[#8892B0] uppercase">{s.label}</p>
            <p className={`text-lg font-mono ${s.color} mt-1`}>{s.value}</p>
          </Card>
        ))}
      </div>
      <Card className="p-4 border-dashed border-[#4299E1]/30">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-[#ECC94B]" />
          <p className="text-xs text-[#CCD6F6]">模拟交易使用虚拟资金，与实盘行情数据完全同步。适合策略验证和风险评估。订单簿和成交数据均为模拟生成。</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigateTo('trade', 'real', '手动交易')} className="px-4 py-2 bg-[#38B2AC] text-white text-xs rounded hover:brightness-110">进入模拟交易面板</button>
          <button onClick={() => navigateTo('strategy', 'backtest')} className="px-4 py-2 bg-[#4299E1] text-white text-xs rounded hover:brightness-110">策略回测</button>
        </div>
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// Trade Plan Module
// ══════════════════════════════════════════════════════
const PlanModule = () => {
  const [plans, setPlans] = useState([
    { name: 'BTC逢低建仓计划', symbol: 'BTC/USDT', condition: '价格 ≤ $92,000', action: '买入 0.1 BTC', status: '监控中' },
    { name: 'ETH止盈计划', symbol: 'ETH/USDT', condition: '价格 ≥ $2,800', action: '卖出全部仓位', status: '监控中' },
    { name: 'SOL网格计划', symbol: 'SOL/USDT', condition: '每下跌5%', action: '买入 10 SOL', status: '执行中' },
  ]);

  const handleNewPlan = () => {
    const newPlan = { name: `新交易计划 #${plans.length + 1}`, symbol: 'BTC/USDT', condition: '自定义条件', action: '待设置', status: '监控中' };
    setPlans(prev => [...prev, newPlan]);
    toast.success('新交易计划已创建', { description: '请编辑计划的触发条件和执行动作' });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm">交易计划</h3>
          <button onClick={handleNewPlan} className="px-3 py-1.5 bg-[#38B2AC] text-white text-xs rounded hover:brightness-110">+ 新建计划</button>
        </div>
        <div className="space-y-3">
          {plans.map((p, i) => (
            <div key={i} className="p-3 bg-[#0A192F] rounded border border-[#233554]/50 hover:border-[#233554] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[#CCD6F6] text-xs">{p.name}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded ${p.status === '执行中' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#4299E1]/20 text-[#4299E1]'}`}>{p.status}</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-[#8892B0]">
                <span>品种: <span className="text-[#CCD6F6]">{p.symbol}</span></span>
                <span>条件: <span className="text-[#ECC94B]">{p.condition}</span></span>
                <span>动作: <span className="text-[#38B2AC]">{p.action}</span></span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// Trade Logs Module
// ══════════════════════════════════════════════════════
const LogsModule = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: '总交易次数', value: '1,256', color: 'text-white' },
        { label: '总盈利', value: '$45,280', color: 'text-[#38B2AC]' },
        { label: '总亏损', value: '-$18,920', color: 'text-[#F56565]' },
        { label: '净盈亏', value: '+$26,360', color: 'text-[#38B2AC]' },
      ].map((s, i) => (
        <Card key={i} className="p-4">
          <p className="text-[10px] text-[#8892B0] uppercase">{s.label}</p>
          <p className={`text-xl font-mono ${s.color} mt-1`}>{s.value}</p>
        </Card>
      ))}
    </div>
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm">交易日志</h3>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-[#112240] border border-[#233554] text-xs text-[#CCD6F6] rounded hover:bg-[#1A2B47]">
          <Download className="w-3 h-3" /> 导出报告
        </button>
      </div>
      <table className="w-full text-xs">
        <thead className="text-[#8892B0] uppercase border-b border-[#233554]">
          <tr>
            <th className="py-2 px-3 text-left">日期</th>
            <th className="py-2 px-3 text-right">交易次数</th>
            <th className="py-2 px-3 text-right">盈利</th>
            <th className="py-2 px-3 text-right">亏损</th>
            <th className="py-2 px-3 text-right">净盈亏</th>
            <th className="py-2 px-3 text-right">胜率</th>
          </tr>
        </thead>
        <tbody>
          {[
            { date: '2026-02-15', trades: 8, profit: '$1,250', loss: '-$320', net: '+$930', winRate: '75%' },
            { date: '2026-02-14', trades: 12, profit: '$2,180', loss: '-$890', net: '+$1,290', winRate: '67%' },
            { date: '2026-02-13', trades: 6, profit: '$580', loss: '-$1,250', net: '-$670', winRate: '33%' },
            { date: '2026-02-12', trades: 15, profit: '$3,420', loss: '-$1,080', net: '+$2,340', winRate: '73%' },
            { date: '2026-02-11', trades: 10, profit: '$1,890', loss: '-$650', net: '+$1,240', winRate: '70%' },
          ].map((d, i) => (
            <tr key={i} className="border-b border-[#233554]/30 hover:bg-[#112240]">
              <td className="py-2 px-3 text-[#CCD6F6]">{d.date}</td>
              <td className="py-2 px-3 text-right font-mono text-[#CCD6F6]">{d.trades}</td>
              <td className="py-2 px-3 text-right font-mono text-[#38B2AC]">{d.profit}</td>
              <td className="py-2 px-3 text-right font-mono text-[#F56565]">{d.loss}</td>
              <td className={`py-2 px-3 text-right font-mono ${d.net.startsWith('+') ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>{d.net}</td>
              <td className="py-2 px-3 text-right font-mono text-[#ECC94B]">{d.winRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

// ══════════════════════════════════════════════════════
// Config Module — Phase 2 Enhanced: Multi-Exchange + Auto-Liquidation
// + Arbitrage Detection + Multi-Account + Auto-Hedge
// ══════════════════════════════════════════════════════
const ConfigModule = () => {
  const { riskMetrics, positions, account, emitRiskSignal } = useGlobalData();
  const [exchangeStatuses, setExchangeStatuses] = useState(() => getExchangeStatuses());
  const [liqEngine] = useState(() => getLiquidationEngine());
  const [liqRules, setLiqRules] = useState<LiquidationRule[]>(() => liqEngine.getRules());
  const [liqEvents, setLiqEvents] = useState<LiquidationEvent[]>([]);
  const [autoLiqEnabled, setAutoLiqEnabled] = useState(true);

  // Phase 2 new state
  const [arbSignals, setArbSignals] = useState<ArbitrageSignal[]>([]);
  const [multiAcctSummary, setMultiAcctSummary] = useState<MultiAccountSummary | null>(null);
  const [hedgeEngine] = useState(() => getHedgeEngine());
  const [hedgeRules, setHedgeRules] = useState<HedgeRule[]>(() => hedgeEngine.getRules());
  const [hedgeExecutions, setHedgeExecutions] = useState<HedgeExecution[]>([]);
  const [autoHedgeEnabled, setAutoHedgeEnabled] = useState(false);
  const [configTab, setConfigTab] = useState<'exchanges' | 'arbitrage' | 'accounts' | 'hedge'>('exchanges');

  // Refresh exchange statuses
  useEffect(() => {
    const iv = setInterval(() => setExchangeStatuses(getExchangeStatuses()), 5000);
    return () => clearInterval(iv);
  }, []);

  // Set up liquidation engine event handler
  useEffect(() => {
    liqEngine.setEventHandler((event) => {
      setLiqEvents(prev => [event, ...prev].slice(0, 50));
      const actionLabel: Record<string, string> = {
        close_all: '平仓所有持仓',
        close_losing: '平仓亏损持仓',
        reduce_50: '减仓50%',
        hedge: '自动对冲',
        alert_only: '仅告警',
      };
      toast.error(`风控自动平仓触发: ${event.ruleName}`, {
        description: `${event.reason} | 动作: ${actionLabel[event.action] || event.action}`,
      });
      emitRiskSignal({
        source: 'risk',
        severity: 'critical',
        title: `自动平仓: ${event.ruleName}`,
        detail: event.reason,
        value: event.totalValue,
      });
    });
  }, [liqEngine, emitRiskSignal]);

  // Periodic evaluation of liquidation rules
  useEffect(() => {
    if (!autoLiqEnabled) return;
    const iv = setInterval(() => {
      liqEngine.evaluate({
        positions: positions.map(p => ({
          symbol: p.symbol,
          pnlPercent: p.pnlPercent,
          unrealizedPnl: p.unrealizedPnl,
          currentPrice: p.currentPrice,
          quantity: p.quantity,
        })),
        account: {
          totalAssets: account.totalAssets,
          availableBalance: account.availableBalance,
          todayPnl: account.todayPnl,
          todayPnlPercent: account.todayPnlPercent,
        },
        riskMetrics: {
          portfolioVaR95: riskMetrics.portfolioVaR95,
          maxDrawdown: riskMetrics.maxDrawdown,
          leverageRatio: riskMetrics.leverageRatio,
          correlationBTC: riskMetrics.correlationBTC,
        },
        varDailyLimit: 15000,
      });
    }, 10_000);
    return () => clearInterval(iv);
  }, [autoLiqEnabled, liqEngine, positions, account, riskMetrics]);

  // ── Phase 2: Arbitrage monitoring ──
  useEffect(() => {
    const iv = setInterval(() => {
      setArbSignals(getArbitrageSignals());
      setMultiAcctSummary(getMultiAccountSummary());
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  // ── Phase 2: Auto-Hedge engine ──
  useEffect(() => {
    hedgeEngine.setExecutionHandler((exec) => {
      setHedgeExecutions(prev => [exec, ...prev].slice(0, 50));
      emitRiskSignal({
        source: 'trade', severity: 'warning',
        title: `自动对冲触发: ${exec.ruleName}`,
        detail: exec.reason,
        symbol: exec.symbol,
        value: exec.price * exec.quantity,
      });
    });
  }, [hedgeEngine, emitRiskSignal]);

  useEffect(() => {
    if (!autoHedgeEnabled) return;
    const iv = setInterval(() => {
      hedgeEngine.evaluate({
        positions: positions.map(p => ({
          symbol: p.symbol, side: p.side, quantity: p.quantity, currentPrice: p.currentPrice,
        })),
        riskMetrics: {
          correlationBTC: riskMetrics.correlationBTC,
          leverageRatio: riskMetrics.leverageRatio,
          totalExposure: riskMetrics.totalExposure,
        },
        volatilityIndex: 25 + Math.random() * 30,
      });
    }, 15_000);
    return () => clearInterval(iv);
  }, [autoHedgeEnabled, hedgeEngine, positions, riskMetrics]);

  const handleToggleRule = (ruleId: string) => {
    liqEngine.toggleRule(ruleId);
    setLiqRules([...liqEngine.getRules()]);
  };

  const triggerTypeLabel: Record<string, string> = {
    max_loss_pct: '单笔亏损%',
    max_loss_usd: '日内亏损额',
    var_breach: 'VaR突破',
    drawdown: '最大回撤',
    margin_call: '保证金不足',
    correlation_spike: '相关性异常',
  };

  const actionLabel: Record<string, string> = {
    close_all: '全部平仓',
    close_losing: '平仓亏损',
    reduce_50: '减仓50%',
    hedge: '自动对冲',
    alert_only: '仅告警',
  };

  const handleToggleHedgeRule = (ruleId: string) => {
    hedgeEngine.toggleRule(ruleId);
    setHedgeRules([...hedgeEngine.getRules()]);
  };

  const hedgeActionLabel: Record<string, string> = {
    open_opposite: '开反向仓',
    reduce_delta: '减少Delta',
    cross_exchange_hedge: '跨所对冲',
    options_hedge: '期权对冲',
  };

  return (
    <div className="space-y-6">
      {/* Config Tab Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {([
          { key: 'exchanges', label: '交易所配置' },
          { key: 'arbitrage', label: '套利检测' },
          { key: 'accounts', label: '多账户管理' },
          { key: 'hedge', label: '自动对冲' },
        ] as { key: typeof configTab; label: string }[]).map(tab => (
          <button key={tab.key} onClick={() => setConfigTab(tab.key)}
            className={`px-4 py-1.5 text-xs rounded transition-colors ${configTab === tab.key
              ? 'bg-[#4299E1] text-white' : 'bg-[#112240] text-[#8892B0] border border-[#233554] hover:text-[#CCD6F6]'}`}>
            {tab.label}
            {tab.key === 'arbitrage' && arbSignals.filter(s => s.status === 'detected').length > 0 && (
              <span className="ml-1 px-1 py-0.5 text-[8px] bg-[#38B2AC] text-white rounded-full">{arbSignals.filter(s => s.status === 'detected').length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Arbitrage Detection Tab ── */}
      {configTab === 'arbitrage' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-sm">跨交易所套利信号检测</h3>
              <span className="text-[10px] px-2 py-0.5 bg-[#38B2AC]/20 text-[#38B2AC] rounded">实时扫描中</span>
            </div>
            {arbSignals.filter(s => s.status === 'detected' || s.status === 'executing').length === 0 ? (
              <p className="text-[#8892B0] text-xs text-center py-6">暂无套利机会 — 系统每 3 秒扫描跨交易所价差</p>
            ) : (
              <div className="space-y-2">
                {arbSignals.filter(s => s.status === 'detected' || s.status === 'executing').map(sig => (
                  <div key={sig.id} className={`p-3 rounded border-l-2 ${sig.confidence === 'high' ? 'border-[#38B2AC] bg-[#38B2AC]/5' : sig.confidence === 'medium' ? 'border-[#ECC94B] bg-[#ECC94B]/5' : 'border-[#8892B0] bg-[#0A192F]'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white">{sig.symbol}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${sig.confidence === 'high' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : sig.confidence === 'medium' ? 'bg-[#ECC94B]/20 text-[#ECC94B]' : 'bg-[#8892B0]/20 text-[#8892B0]'}`}>
                          {sig.confidence === 'high' ? '高置信' : sig.confidence === 'medium' ? '中置信' : '低置信'}
                        </span>
                      </div>
                      {sig.status === 'detected' && (
                        <button onClick={() => {
                          executeArbitrage(sig.id);
                          setArbSignals(getArbitrageSignals());
                          toast.info('套利执行中...', { description: `${sig.buyExchange} 买入 / ${sig.sellExchange} 卖出` });
                        }} className="text-[9px] px-2 py-0.5 bg-[#38B2AC] text-white rounded hover:brightness-110">
                          执行套利
                        </button>
                      )}
                      {sig.status === 'executing' && <span className="text-[9px] text-[#ECC94B] animate-pulse">执行中...</span>}
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2 text-[10px]">
                      <div><span className="text-[#8892B0]">买入:</span> <span className="text-[#38B2AC] font-mono">{sig.buyExchange} ${sig.buyPrice.toLocaleString()}</span></div>
                      <div><span className="text-[#8892B0]">卖出:</span> <span className="text-[#F56565] font-mono">{sig.sellExchange} ${sig.sellPrice.toLocaleString()}</span></div>
                      <div><span className="text-[#8892B0]">净利:</span> <span className="text-[#38B2AC] font-mono">{sig.netProfitBps}bps (${sig.estimatedProfit})</span></div>
                      <div><span className="text-[#8892B0]">数量:</span> <span className="text-[#CCD6F6] font-mono">{sig.maxQuantity}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Arbitrage history */}
          {arbSignals.filter(s => s.status === 'filled' || s.status === 'expired').length > 0 && (
            <Card className="p-4">
              <h3 className="text-white text-xs mb-3">套利历史</h3>
              <div className="space-y-1 max-h-[200px] overflow-auto">
                {arbSignals.filter(s => s.status === 'filled' || s.status === 'expired').slice(0, 20).map(sig => (
                  <div key={sig.id} className="flex items-center justify-between text-[10px] py-1 border-b border-[#233554]/30">
                    <span className="text-[#8892B0]">{new Date(sig.timestamp).toLocaleTimeString()}</span>
                    <span className="text-[#CCD6F6]">{sig.symbol}</span>
                    <span className="text-[#8892B0]">{sig.buyExchange} → {sig.sellExchange}</span>
                    <span className="text-[#CCD6F6] font-mono">{sig.netProfitBps}bps</span>
                    <span className={sig.status === 'filled' ? 'text-[#38B2AC]' : 'text-[#8892B0]'}>{sig.status === 'filled' ? '已成交' : '已过期'}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Multi-Account Management Tab ── */}
      {configTab === 'accounts' && (
        <div className="space-y-4">
          {multiAcctSummary && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '聚合总资产', value: `$${multiAcctSummary.totalAssetsUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-white' },
                  { label: '总持仓价值', value: `$${multiAcctSummary.totalPositionValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-[#4299E1]' },
                  { label: '聚合盈亏', value: `+$${multiAcctSummary.aggregatedPnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-[#38B2AC]' },
                  { label: '已连接账户', value: `${multiAcctSummary.accounts.filter(a => a.status === 'connected').length}/${multiAcctSummary.accounts.length}`, color: 'text-[#38B2AC]' },
                ].map((s, i) => (
                  <Card key={i} className="p-4">
                    <p className="text-[10px] text-[#8892B0] uppercase">{s.label}</p>
                    <p className={`text-lg font-mono ${s.color} mt-1`}>{s.value}</p>
                  </Card>
                ))}
              </div>

              <Card className="p-4">
                <h3 className="text-white text-sm mb-3">交易所账户</h3>
                <div className="space-y-3">
                  {multiAcctSummary.accounts.map(acc => (
                    <div key={acc.id} className="p-3 bg-[#0A192F] rounded border border-[#233554]/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${acc.status === 'connected' ? 'bg-[#38B2AC]' : 'bg-[#F56565]'}`} />
                          <span className="text-xs text-white">{acc.exchange}</span>
                          <span className="text-[10px] text-[#8892B0]">{acc.label}</span>
                        </div>
                        <span className="text-xs font-mono text-[#CCD6F6]">${acc.totalUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[10px]">
                        <span className="text-[#8892B0]">API: <span className="text-[#CCD6F6] font-mono">{acc.apiKeyMasked}</span></span>
                        <span className="text-[#8892B0]">权限: {acc.permissions.map(p => <span key={p} className="ml-1 px-1 py-0.5 bg-[#112240] rounded text-[#4299E1]">{p}</span>)}</span>
                        <span className="text-[#8892B0]">Rate: {acc.rateLimit.used}/{acc.rateLimit.max}</span>
                        <span className="text-[#8892B0]">同步: {Math.round((Date.now() - acc.lastSync) / 1000)}s 前</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {acc.balances.map(b => (
                          <span key={b.asset} className="text-[9px] px-1.5 py-0.5 bg-[#112240] rounded">
                            <span className="text-[#CCD6F6]">{b.asset}</span>: <span className="text-[#8892B0] font-mono">{b.free}{b.locked > 0 ? ` (+${b.locked} locked)` : ''}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Cross-exchange exposure */}
              <Card className="p-4">
                <h3 className="text-white text-xs mb-3">跨交易所敞口</h3>
                <div className="space-y-2">
                  {multiAcctSummary.crossExchangeExposure.map(exp => (
                    <div key={exp.symbol} className="flex items-center gap-4 text-[10px]">
                      <span className="w-20 text-[#CCD6F6]">{exp.symbol}</span>
                      <span className="w-20 text-right font-mono text-white">{exp.netPosition}</span>
                      <div className="flex-1 flex gap-2">
                        {exp.exchanges.map(e => (
                          <span key={e.name} className="px-1.5 py-0.5 bg-[#112240] rounded text-[#8892B0]">
                            {e.name}: <span className="text-[#CCD6F6] font-mono">{e.position}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ── Auto-Hedge Tab ── */}
      {configTab === 'hedge' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-[#4299E1]" />
                <h3 className="text-white text-sm">自动对冲引擎</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#8892B0]">执行次数: {hedgeExecutions.length}</span>
                <button onClick={() => { setAutoHedgeEnabled(!autoHedgeEnabled); toast.info(autoHedgeEnabled ? '自动对冲已停止' : '自动对冲已启动'); }}
                  className={`px-3 py-1 text-xs rounded ${autoHedgeEnabled ? 'bg-[#4299E1] text-white' : 'bg-[#112240] text-[#8892B0] border border-[#233554]'}`}>
                  {autoHedgeEnabled ? '引擎运行中' : '已停止'}
                </button>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead className="text-[#8892B0] uppercase border-b border-[#233554]">
                  <tr>
                    <th className="py-2 px-3 text-left">规则名称</th>
                    <th className="py-2 px-3 text-left">触发类型</th>
                    <th className="py-2 px-3 text-right">阈值</th>
                    <th className="py-2 px-3 text-left">对冲动作</th>
                    <th className="py-2 px-3 text-right">对冲比例</th>
                    <th className="py-2 px-3 text-right">触发次数</th>
                    <th className="py-2 px-3 text-center">启用</th>
                  </tr>
                </thead>
                <tbody>
                  {hedgeRules.map(rule => (
                    <tr key={rule.id} className="border-b border-[#233554]/30 hover:bg-[#112240]">
                      <td className="py-2 px-3 text-[#CCD6F6]">{rule.name}</td>
                      <td className="py-2 px-3 text-[#8892B0]">{rule.triggerType}</td>
                      <td className="py-2 px-3 text-right font-mono text-[#ECC94B]">{rule.threshold}</td>
                      <td className="py-2 px-3"><span className="text-[10px] px-1.5 py-0.5 bg-[#4299E1]/10 text-[#4299E1] rounded">{hedgeActionLabel[rule.hedgeAction] || rule.hedgeAction}</span></td>
                      <td className="py-2 px-3 text-right font-mono text-[#CCD6F6]">{(rule.hedgeRatio * 100).toFixed(0)}%</td>
                      <td className="py-2 px-3 text-right font-mono text-[#CCD6F6]">{rule.triggerCount}</td>
                      <td className="py-2 px-3 text-center">
                        <button onClick={() => handleToggleHedgeRule(rule.id)} className={`w-8 h-4 rounded-full relative transition-colors ${rule.enabled ? 'bg-[#4299E1]' : 'bg-[#233554]'}`}>
                          <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${rule.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Hedge execution history */}
          {hedgeExecutions.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-xs">对冲执行记录</h3>
                <button onClick={() => { hedgeEngine.clearExecutions(); setHedgeExecutions([]); }} className="text-[10px] text-[#8892B0] hover:text-[#CCD6F6]">清除记录</button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-auto">
                {hedgeExecutions.map(exec => (
                  <div key={exec.id} className="p-2 bg-[#0A192F] rounded border-l-2 border-[#4299E1]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#4299E1]">{exec.ruleName}</span>
                      <span className="text-[9px] text-[#8892B0]">{new Date(exec.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[10px] text-[#CCD6F6] mt-1">{exec.reason}</p>
                    <div className="flex items-center gap-3 mt-1 text-[9px]">
                      <span className="text-[#8892B0]">{exec.symbol} {exec.side} {exec.quantity}</span>
                      <span className="text-[#8892B0]">@ {exec.exchange}</span>
                      <span className={exec.status === 'filled' ? 'text-[#38B2AC]' : exec.status === 'failed' ? 'text-[#F56565]' : 'text-[#ECC94B]'}>
                        {exec.status === 'filled' ? '已执行' : exec.status === 'failed' ? '失败' : '执行中'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Exchanges Tab (original config content) ── */}
      {configTab === 'exchanges' && (<div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Multi-Exchange Configuration */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm">多交易所接口 (Phase 2)</h3>
            <span className="text-[9px] px-2 py-0.5 bg-[#38B2AC]/20 text-[#38B2AC] rounded">聚合路由</span>
          </div>
          <div className="space-y-3">
            {exchangeStatuses.map((ex, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#0A192F] rounded border border-[#233554]/50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${ex.status === 'online' ? 'bg-[#38B2AC]' : ex.status === 'degraded' ? 'bg-[#ECC94B]' : 'bg-[#F56565]'}`} />
                  <span className="text-[#CCD6F6] text-xs">{ex.name}</span>
                  <span className="text-[9px] text-[#8892B0]">{ex.pairs} pairs</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#8892B0]">{ex.latency}ms</span>
                  <span className="text-[10px] text-[#8892B0]">Fee: {ex.fee}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${ex.status === 'online' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : ex.status === 'degraded' ? 'bg-[#ECC94B]/20 text-[#ECC94B]' : 'bg-[#F56565]/20 text-[#F56565]'}`}>{ex.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-[#071425] rounded text-[10px] text-[#8892B0]">
            <p>智能路由: 自动选择最优价格的交易所执行下单。支持跨交易所套利检测。</p>
          </div>
        </Card>

        {/* Risk Control Parameters */}
        <Card className="p-4">
          <h3 className="text-white text-sm mb-4">风控参数</h3>
          <div className="space-y-3">
            {[
              { name: '单笔最大亏损', value: '2%' },
              { name: '日内最大亏损', value: '5%' },
              { name: '最大持仓比例', value: '80%' },
              { name: '最大杠杆倍数', value: '10x' },
              { name: '滑点保护', value: '0.5%' },
              { name: 'VaR日度限额', value: '$15,000' },
            ].map((param, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[#0A192F] rounded">
                <span className="text-[#8892B0] text-xs">{param.name}</span>
                <input className="w-24 bg-[#071425] border border-[#233554] rounded px-2 py-1 text-xs text-right font-mono text-[#CCD6F6] focus:outline-none focus:border-[#4299E1]" defaultValue={param.value} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Auto-Liquidation Rules */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-[#F56565]" />
            <h3 className="text-white text-sm">风控联动自动平仓引擎</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#8892B0]">触发次数: {liqEvents.length}</span>
            <button onClick={() => setAutoLiqEnabled(!autoLiqEnabled)} className={`px-3 py-1 text-xs rounded ${autoLiqEnabled ? 'bg-[#F56565] text-white' : 'bg-[#112240] text-[#8892B0] border border-[#233554]'}`}>
              {autoLiqEnabled ? '引擎运行中' : '已停止'}
            </button>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="text-[#8892B0] uppercase border-b border-[#233554]">
              <tr>
                <th className="py-2 px-3 text-left">规则名称</th>
                <th className="py-2 px-3 text-left">触发类型</th>
                <th className="py-2 px-3 text-right">阈值</th>
                <th className="py-2 px-3 text-left">动作</th>
                <th className="py-2 px-3 text-right">冷却</th>
                <th className="py-2 px-3 text-right">触发次数</th>
                <th className="py-2 px-3 text-center">启用</th>
              </tr>
            </thead>
            <tbody>
              {liqRules.map(rule => (
                <tr key={rule.id} className="border-b border-[#233554]/30 hover:bg-[#112240]">
                  <td className="py-2 px-3 text-[#CCD6F6]">{rule.name}</td>
                  <td className="py-2 px-3 text-[#8892B0]">{triggerTypeLabel[rule.triggerType] || rule.triggerType}</td>
                  <td className="py-2 px-3 text-right font-mono text-[#ECC94B]">{rule.threshold}{rule.triggerType === 'max_loss_pct' || rule.triggerType === 'drawdown' || rule.triggerType === 'var_breach' || rule.triggerType === 'margin_call' ? '%' : rule.triggerType === 'max_loss_usd' ? ' USD' : ''}</td>
                  <td className="py-2 px-3"><span className="text-[10px] px-1.5 py-0.5 bg-[#F56565]/10 text-[#F56565] rounded">{actionLabel[rule.action] || rule.action}</span></td>
                  <td className="py-2 px-3 text-right text-[#8892B0] font-mono">{(rule.cooldownMs / 1000).toFixed(0)}s</td>
                  <td className="py-2 px-3 text-right font-mono text-[#CCD6F6]">{rule.triggerCount}</td>
                  <td className="py-2 px-3 text-center">
                    <button onClick={() => handleToggleRule(rule.id)} className={`w-8 h-4 rounded-full relative transition-colors ${rule.enabled ? 'bg-[#38B2AC]' : 'bg-[#233554]'}`}>
                      <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${rule.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Liquidation Event History */}
      {liqEvents.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm">平仓事件记录</h3>
            <button onClick={() => { liqEngine.clearEvents(); setLiqEvents([]); }} className="text-[10px] text-[#8892B0] hover:text-[#CCD6F6]">清除记录</button>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-auto">
            {liqEvents.map(ev => (
              <div key={ev.id} className="p-2 bg-[#0A192F] rounded border-l-2 border-[#F56565]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#F56565]">{ev.ruleName}</span>
                  <span className="text-[9px] text-[#8892B0]">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[10px] text-[#CCD6F6] mt-1">{ev.reason}</p>
                <div className="flex items-center gap-3 mt-1 text-[9px]">
                  <span className="text-[#8892B0]">品种: {ev.symbols.join(', ')}</span>
                  <span className="text-[#ECC94B]">动作: {actionLabel[ev.action]}</span>
                  <span className="text-[#F56565]">金额: ${ev.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      </div>)}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// Main Export
// ══════════════════════════════════════════════════════
export const TradeModule = ({ activeSub, activeTertiary }: { activeSub: string; activeTertiary?: string }) => {
  const renderContent = () => {
    switch (activeSub) {
      case 'real': return <RealTradeModule activeTertiary={activeTertiary || '手动交易'} />;
      case 'sim': return <SimTradeModule />;
      case 'plan': return <PlanModule />;
      case 'logs': return <LogsModule />;
      case 'config': return <ConfigModule />;
      default: return <RealTradeModule activeTertiary={activeTertiary || '手动交易'} />;
    }
  };

  return <div className="space-y-4">{renderContent()}</div>;
};
