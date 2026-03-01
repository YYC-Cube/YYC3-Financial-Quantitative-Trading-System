# YYC-QATS 功能逻辑 API 文档

> 版本: v1.0 (对齐净启动状态)  
> 日期: 2026-02-16  
> 架构: React 18 SPA + Context API + Canvas + Web API  
> 导航模式: 状态驱动 (activeModule/activeSub/activeTertiary)，非 React Router

---

## 目录

1. [架构总览](#1-架构总览)
2. [Context API — 全局状态层](#2-context-api--全局状态层)
3. [核心组件 API](#3-核心组件-api)
4. [自定义 Hooks](#4-自定义-hooks)
5. [业务模块接口](#5-业务模块接口)
6. [数据模型 (TypeScript 接口)](#6-数据模型)
7. [事件系统](#7-事件系统)
8. [PWA & Service Worker API](#8-pwa--service-worker-api)
9. [i18n 国际化](#9-i18n-国际化)

---

## 1. 架构总览

```
App (default export)
├── ErrorBoundary
│   └── SettingsProvider
│       └── AlertProvider
│           └── GlobalDataProvider
│               └── AppContent
│                   ├── DataAlertBridge (renderless)
│                   ├── Navbar
│                   ├── Ticker Bar
│                   ├── Sidebar (desktop only)
│                   ├── Main Content Area
│                   │   ├── CrossModuleBar
│                   │   └── [ActiveModule] (8 modules)
│                   ├── MobileTabbar (mobile only)
│                   ├── MobileDrawer (mobile only)
│                   ├── FeasibilityReport (modal)
│                   ├── SettingsDialog (modal)
│                   └── AITraderAssistant (panel)
```

**Provider 嵌套顺序** (外→内):
`ErrorBoundary` → `SettingsProvider` → `AlertProvider` → `GlobalDataProvider`

**数据流**:
- `GlobalDataProvider` 生成实时市场/系统数据
- `DataAlertBridge` 每 5s 将数据注入 `AlertContext.checkAndTrigger()`
- `CrossModuleBar` 消费 `crossModuleSummary` 并触发跨模块导航
- 各业务模块通过 `useGlobalData()` 读取共享数据

---

## 2. Context API — 全局状态层

### 2.1 GlobalDataContext

**文件**: `/src/app/contexts/GlobalDataContext.tsx`  
**Provider**: `<GlobalDataProvider>`  
**Hook**: `useGlobalData()`

#### 接口定义

```typescript
interface GlobalDataContextType {
  // === 市场数据 ===
  marketData: MarketAsset[];
  getAsset: (symbol: string) => MarketAsset | undefined;
  getAssetsByCategory: (cat: string) => MarketAsset[];
  tickerCoins: { label: string; price: string; change: string; cny: string }[];

  // === 投资组合 ===
  positions: Position[];
  account: AccountInfo;

  // === 策略 ===
  strategies: StrategyItem[];
  activeStrategies: StrategyItem[];

  // === 风控 ===
  riskMetrics: RiskMetrics;

  // === 系统 ===
  systemMetrics: SystemMetrics;

  // === 模型 & 数据管道 ===
  modelMetrics: ModelMetrics;
  pipelineMetrics: DataPipelineMetrics;

  // === 跨模块摘要 ===
  crossModuleSummary: CrossModuleSummary;

  // === 交易记录 ===
  recentTrades: TradeRecord[];

  // === 告警徽章 ===
  alertCount: number;
  setAlertCount: (n: number) => void;

  // === 格式化工具 ===
  formatPrice: (val: number) => string;
  formatUSD: (val: number) => string;
  formatPercent: (val: number) => string;

  // === 跨模块导航 ===
  navigateTo: (module: string, sub?: string, tertiary?: string) => void;
  pendingNavigation: { module: string; sub?: string; tertiary?: string } | null;
  clearNavigation: () => void;
}
```

#### 数据更新周期

| 数据 | 更新间隔 | 更新方式 |
|------|---------|---------|
| `marketData` | 4s | `setInterval` + 随机波动 (crypto ±0.3%, 传统 ±0.1%) |
| `positions` | 实时 | 由 `marketData` 变化触发 `useEffect` |
| `account` | 实时 | 由 `positions` 变化触发 `useEffect` |
| `riskMetrics` | 实时 | 由 `positions` + `marketData` 变化触发 |
| `systemMetrics` | 5s | `setInterval` + CPU/内存/延迟/量子抖动 |
| `modelMetrics` | 5s | 与 systemMetrics 同周期 |
| `pipelineMetrics` | 5s | 与 systemMetrics 同周期 |
| `crossModuleSummary` | 每次 render | 从上述数据派生计算 (非 state) |

#### 关键方法

##### `navigateTo(module, sub?, tertiary?)`
设置 `pendingNavigation` 状态，由 `App.tsx` 中的 `useEffect` 消费:
```typescript
// App.tsx 中的消费逻辑
useEffect(() => {
  if (pendingNavigation) {
    handleModuleChange(pendingNavigation.module);
    if (pendingNavigation.sub) {
      setTimeout(() => {
        setActiveSub(pendingNavigation.sub!);
        if (pendingNavigation.tertiary) {
          setActiveTertiary(pendingNavigation.tertiary!);
        }
      }, 50); // 50ms 延迟确保模块切换完成
    }
    clearNavigation();
  }
}, [pendingNavigation]);
```

##### `formatPrice(val: number): string`
- `val >= 1000` → 逗号分隔 + 2 位小数 (如 "96,231.50")
- `val >= 1` → 2 位小数 (如 "1.08")
- `val < 1` → 4 位小数 (如 "0.4500")

##### `formatUSD(val: number): string`
- 正数 → "+$2,850.80"
- 负数 → "-$1,234.56"

##### `crossModuleSummary` 派生逻辑

| 字段 | 计算方式 |
|------|---------|
| `market.topMover` | `marketData.reduce` 绝对涨跌幅最大资产 |
| `strategy.activeCount` | `strategies.filter(s => s.status === 'active').length` |
| `strategy.avgWinRate` | 活跃策略平均胜率 |
| `risk.riskLevel` | leverageRatio > 0.8 → 'high', > 0.5 → 'medium', else 'low' |
| `trade.openPositions` | `positions.length` |
| `admin.uptime` | 固定 '99.97%' (模拟) |

---

### 2.2 AlertContext

**文件**: `/src/app/contexts/AlertContext.tsx`  
**Provider**: `<AlertProvider>`  
**Hook**: `useAlerts()`

#### 接口定义

```typescript
interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAlerts: () => void;
  thresholds: AlertThreshold[];
  addThreshold: (t: Omit<AlertThreshold, 'id'>) => void;
  updateThreshold: (id: string, updates: Partial<AlertThreshold>) => void;
  removeThreshold: (id: string) => void;
  toggleThreshold: (id: string) => void;
  checkAndTrigger: (data: ThresholdCheckData) => void;
}
```

#### 阈值检测引擎 `checkAndTrigger(data)`

**输入**: `ThresholdCheckData`
```typescript
interface ThresholdCheckData {
  marketPrices: Record<string, number>;
  marketChanges: Record<string, number>;
  marketVolumeSpikes: Record<string, number>;  // 1.0 = 正常, >2.0 = 异动
  marketRSI: Record<string, number>;           // 0-100
  systemCpu: number;
  systemLatency: number;
  riskDrawdown: number;
  riskVar95: number;
  modelAccuracy: number;
}
```

**9 种指标处理逻辑**:

| Metric | 数据来源 | 严重级别 | 告警类型 |
|--------|---------|---------|---------|
| `price` | `marketPrices[symbol]` | warning | price |
| `change` | `marketChanges[symbol]` | warning | price |
| `volume_spike` | `marketVolumeSpikes[symbol]` | warning | technical |
| `rsi` | `marketRSI[symbol]` | info | technical |
| `cpu` | `systemCpu` | warning | system |
| `latency` | `systemLatency` | warning | system |
| `drawdown` | `riskDrawdown` | critical | risk |
| `var` | `abs(riskVar95)` | critical | risk |
| `accuracy` | `modelAccuracy` | warning | technical |

**冷却机制**: 通过 `useRef<Record<string, number>>` 记录每个阈值最后触发时间，`now - lastFired < cooldownMs` 则跳过。

#### 告警多通道通知

| 通道 | 触发条件 | 实现 |
|------|---------|------|
| 状态更新 | 所有告警 | `setAlerts(prev => [alert, ...prev])` |
| 声音通知 | warning + critical | Web Audio API (`createOscillator`) |
| 振动通知 | warning + critical | `Navigator.vibrate()` |
| 推送通知 | critical + warning (后台) | Service Worker postMessage |

#### 默认阈值规则 (10 条)

| ID | 符号 | 指标 | 条件 | 值 | 冷却 |
|----|------|------|------|-----|------|
| th_default_1 | BTC/USDT | price | above | 100,000 | 60s |
| th_default_2 | BTC/USDT | change | above | 5% | 120s |
| th_default_3 | __system__ | cpu | above | 80% | 30s |
| th_default_4 | ETH/USDT | price | below | 2,000 | 60s |
| th_default_5 | __system__ | latency | above | 40ms | 30s |
| th_default_6 | BTC/USDT | rsi | above | 70 | 120s |
| th_default_7 | BTC/USDT | rsi | below | 30 | 120s |
| th_default_8 | BTC/USDT | volume_spike | above | 3x | 90s |
| th_default_9 | ETH/USDT | volume_spike | above | 3x | 90s |
| th_default_10 | SOL/USDT | rsi | above | 75 | 120s |

#### localStorage 持久化

- **Key**: `yyc_alert_thresholds`
- **读取**: Provider 初始化时 `useState(() => { ... })` 延迟初始化
- **写入**: `useEffect(() => { localStorage.setItem(...) }, [thresholds])`
- **降级**: 解析失败或为空时回退到默认 10 条规则

---

### 2.3 SettingsContext

**文件**: `/src/app/contexts/SettingsContext.tsx`  
**Provider**: `<SettingsProvider>`  
**Hook**: `useSettings()`

```typescript
interface SettingsContextType {
  language: string;                    // 'zh' | 'en'
  setLanguage: (lang: string) => void;
  colorScheme: ColorScheme;            // 'standard' | 'china'
  setColorScheme: (scheme: ColorScheme) => void;
  getUpColor: () => string;            // '#F56565' (china) | '#38B2AC' (standard)
  getDownColor: () => string;          // '#38B2AC' (china) | '#F56565' (standard)
  getChangeColorClass: (change: number | string) => string;
  getChangeBgClass: (change: number | string) => string;
}
```

**颜色方案**:
| 方案 | 涨色 | 跌色 | 说明 |
|------|------|------|------|
| `china` (默认) | 红 `#F56565` | 绿 `#38B2AC` | 中国市场习惯 |
| `standard` | 绿 `#38B2AC` | 红 `#F56565` | 国际标准 |

---

## 3. 核心组件 API

### 3.1 CrossModuleBar

**文件**: `/src/app/components/CrossModuleBar.tsx`

```typescript
interface Props {
  currentModule: string;  // 当前激活的模块 ID
}
```

**行为**:
- 根据 `MODULE_DATA_FLOWS[currentModule]` 获取关联模块列表
- 每个关联模块生成一个数据 chip，显示该模块核心指标的实时摘要
- 点击 chip 触发 `navigateTo(module, sub, tertiary)`
- isMobile 模式下使用 flex-wrap 紧凑布局

**模块关联图**:
```
market   → [strategy, risk, trade, bigdata]
strategy → [market, model, quantum, trade]
risk     → [market, strategy, trade, quantum]
quantum  → [strategy, risk, model, bigdata]
bigdata  → [market, model, quantum, admin]
model    → [strategy, quantum, bigdata, risk]
trade    → [market, strategy, risk, model]
admin    → [market, strategy, risk, quantum, bigdata, model, trade]
```

### 3.2 DataAlertBridge

**文件**: `/src/app/components/DataAlertBridge.tsx`  
**渲染**: `null` (renderless component)

**职责**:
1. 每 5s 从 `useGlobalData()` 收集最新数据
2. 构建 `ThresholdCheckData` 对象 (含模拟的 RSI 和 volume spike)
3. 调用 `checkAndTrigger(data)` 驱动告警引擎
4. 同步未读告警数到 `GlobalData.alertCount`
5. 新 critical/warning 告警推送到 Service Worker

**RSI 模拟算法**:
```
prevRSI ← rsiStateRef[symbol] ?? (45 + random * 20)
drift ← (random - 0.5) * 4 + (50 - prevRSI) * 0.05  // 均值回归项
newRSI ← clamp(5, 95, prevRSI + drift)
```

**量能异动模拟算法**:
```
prevSpike ← volSpikeStateRef[symbol] ?? 1.0
drift ← (random - 0.48) * 0.15
spikeJump ← random > 0.95 ? (random * 2.5) : 0  // 5% 概率大尖峰
newSpike ← clamp(0.3, 5.0, prevSpike + drift + spikeJump)
```

### 3.3 DataFlowMini (MobileNavigation 内部)

**文件**: `/src/app/components/layout/MobileNavigation.tsx` (内部组件)

```typescript
interface Props {
  currentModule: string;
  onNavigate: (mod: string) => void;
}
```

**动画系统**:
- **Canvas 层**: `requestAnimationFrame` 驱动，绘制连接线 + 粒子 + 发光环 + 中心脉冲
- **Lerp 平滑**: 模块切换或尺寸变化时，节点位置以 `LERP_SPEED=0.08` 线性插值趋近目标
- **HTML 覆盖层**: CSS `transition: left 0.5s cubic-bezier(0.4,0,0.2,1), top 0.5s` 平滑定位
- **ResizeObserver**: 监听容器尺寸变化，自动 setupSize + DPR 处理

### 3.4 AITraderAssistant

**文件**: `/src/app/components/AITraderAssistant.tsx`

```typescript
interface Props {
  visible: boolean;
  onClose: () => void;
}
```

**关键修复**: `handleSend(overrideText?: string)` 参数区分:
- 按钮点击: 传入 MouseEvent → 被忽略，使用输入框值
- 快速命令: 传入 string → 使用 overrideText

### 3.5 ErrorBoundary

**文件**: `/src/app/components/ErrorBoundary.tsx`  
**类型**: Class Component (React 要求)

```typescript
interface Props { children: React.ReactNode }
interface State { hasError: boolean; error?: Error }
```

**恢复机制**: 点击 "尝试恢复" 按钮 → `setState({ hasError: false })`

### 3.6 SafeIcons

**文件**: `/src/app/components/SafeIcons.tsx`  
**导出**: 131 个命名导出的纯函数 SVG 图标组件  
**规范**: 全部 `(props: any) => <svg>` 模式，无 forwardRef

---

## 4. 自定义 Hooks

### 4.1 useIsMobile

**文件**: `/src/app/components/ui/use-mobile.tsx`

```typescript
function useIsMobile(): boolean
```

- 断点: 768px
- 实现: `window.matchMedia` + `change` 事件监听
- 初始值: `undefined` → `!!isMobile` 确保 boolean 返回

### 4.2 useBroadcastSync

**文件**: `/src/app/hooks/useBroadcastSync.ts`

```typescript
function useBroadcastSync<T>(channelName: string, initialState: T): readonly [T, (newState: T) => void]
```

- 基于 BroadcastChannel API 的跨标签页状态同步
- 发送 `{ type: 'STATE_UPDATE', payload }` 消息

### 4.3 useMultiScreenSync

**文件**: `/src/app/hooks/useMultiScreenSync.ts`
- 多屏幕联动同步 hook
- 基于 BroadcastChannel

### 4.4 useVoiceCommand / useVoiceCommands / useVoiceControl

**文件**: `/src/app/hooks/useVoiceCommand.ts`, `useVoiceCommands.ts`, `useVoiceControl.ts`
- 基于 Web Speech API 的语音控制
- 使用 `(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition`

### 4.5 useHaptics

**文件**: `/src/app/hooks/useHaptics.ts`
- 触觉反馈 hook
- 基于 `Navigator.vibrate()` API

### 4.6 useQuantSync

**文件**: `/src/app/hooks/useQuantSync.ts`
- 量子计算资源同步 hook
- 延迟日志 + 心跳监控

### 4.7 useCTPProtocol / useTradeProtocol

**文件**: `/src/app/hooks/useCTPProtocol.ts`, `useTradeProtocol.ts`
- 交易协议接口 hooks (CTP 期货协议模拟)

### 4.8 useWebHID

**文件**: `/src/app/hooks/useWebHID.ts`
- WebHID API 硬件设备接入 hook

### 4.9 useSafeTranslation

**文件**: `/src/app/hooks/useSafeTranslation.ts`
- 安全国际化 wrapper hook

---

## 5. 业务模块接口

### 通用 Props 模式

```typescript
// 所有模块均接受 activeSub 参数控制子页面
interface ModuleProps {
  activeSub: string;
  activeTertiary?: string;
  onNavigate?: (page: string) => void;
}
```

### 5.1 MarketModule

**文件**: `/src/app/modules/market/MarketModule.tsx`  
**子页面**: live → GlobalQuotes / CustomPanel / KLineAnalysis  
            history → HistoryModule  
            insight → InsightModule  
            board → BoardModule  
            fav → FavModule

### 5.2 StrategyModule

**文件**: `/src/app/modules/strategy/StrategyModule.tsx`  
**子页面**: edit → StrategyEditor (GraphicalEditor / CodeEditor)  
            backtest → Backtest  
            optimize → OptimizerModule  
            sim → SimModule  
            manage → ManageModule

### 5.3 RiskModule

**文件**: `/src/app/modules/risk/RiskModule.tsx`  
**子页面**: quantum_risk → QuantumRisk  
            bigdata_risk → BigDataRisk  
            live_risk → RiskView  
            warning → RiskWarning  
            report → RiskReport  
            hedging → HedgingTools

### 5.4 QuantumModule

**文件**: `/src/app/modules/quantum/QuantumModule.tsx`  
**子页面**: resource → ResourceMonitor  
            algo → AlgoConfig  
            app → QuantApps  
            analysis → ResultAnalysis  
            security → Security  
            workshop → ExperimentWorkshop

### 5.5 BigDataModule

**文件**: `/src/app/modules/bigdata/BigDataModule.tsx`  
**子页面**: manage → DataSourceManager  
            collection → DataCollection  
            storage → StorageManager  
            process → DataProcessing  
            quality → QualityMonitor  
            share → DataSharing

### 5.6 ModelModule

**文件**: `/src/app/modules/model/ModelModule.tsx`  
**子页面**: library → ModelLibrary  
            train → TrainModule  
            eval → ModelEvaluation  
            deploy → DeploymentMonitor  
            dev → CustomDev  
            app → ModelApplication

### 5.7 TradeModule

**文件**: `/src/app/modules/trade/TradeModule.tsx`  
**子页面**: real → RealTrading  
            sim → SimulatedTrading  
            plan → TradePlan  
            logs → TradeLogs  
            config → PipelineAutomation

### 5.8 AdminModule

**文件**: `/src/app/modules/admin/AdminModule.tsx`  
**子页面**: sys → SystemConfig  
            auth → AuthManager  
            monitor → LogMonitor  
            backup → BackupManager  
            plugin → PluginManager  
            screen → SystemDashboard (全局大屏)

---

## 6. 数据模型

### MarketAsset
```typescript
interface MarketAsset {
  symbol: string;        // 'BTC/USDT', 'AAPL', 'GC', 'EUR/USD'
  name: string;
  price: number;
  change: number;        // 百分比
  volume: string;
  high24h: number;
  low24h: number;
  marketCap: string;
  category: '加密货币' | '股票' | '期货' | '外汇';
}
```

### Position
```typescript
interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  currentPrice: number;    // 自动从 marketData 更新
  unrealizedPnl: number;   // 自动计算
  pnlPercent: number;      // 自动计算
  strategy: string;
}
```

### Alert
```typescript
interface Alert {
  id: string;              // 'alert_{timestamp}_{counter}'
  type: 'price' | 'volume' | 'technical' | 'system' | 'risk' | 'model';
  symbol: string;
  message: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  source?: string;         // 来源模块 ID
}
```

### AlertThreshold
```typescript
interface AlertThreshold {
  id: string;
  symbol: string;          // '__system__' 用于系统指标
  metric: ThresholdMetric;
  condition: 'above' | 'below';
  value: number;
  enabled: boolean;
  cooldownMs: number;
  lastTriggered?: number;
}

type ThresholdMetric = 'price' | 'change' | 'volume_spike' | 'rsi' | 
                       'drawdown' | 'var' | 'cpu' | 'latency' | 'accuracy';
```

### CrossModuleSummary
```typescript
interface CrossModuleSummary {
  market:   { assetCount: number; topMover: string; topMoveChange: number };
  strategy: { activeCount: number; avgWinRate: number; bestPnl: string };
  risk:     { riskLevel: 'low' | 'medium' | 'high'; var95: number; alertCount: number };
  quantum:  { qubits: number; fidelity: number; activeTasks: number };
  bigdata:  { sources: number; quality: number; storage: string };
  model:    { deployed: number; training: number; bestAccuracy: number };
  trade:    { totalAssets: number; todayPnl: number; openPositions: number };
  admin:    { cpuUsage: number; memUsage: number; uptime: string };
}
```

---

## 7. 事件系统

应用使用 DOM CustomEvent 进行跨组件通信 (避免 prop drilling):

| 事件名 | 触发源 | 监听位置 | 效果 |
|--------|-------|---------|------|
| `toggleMobileDrawer` | MobileTabbar 汉堡按钮 | AppContent | 切换 Drawer 开关 |
| `showFeasibilityReport` | Navbar 按钮 | AppContent | 打开节点报告模态框 |
| `showSettings` | Navbar 设置按钮 | AppContent | 打开设置对话框 |
| `toggleAIAssistant` | Navbar AI 按钮 | AppContent | 切换 AI 助手面板 |

```typescript
// 触发示例
document.dispatchEvent(new CustomEvent('toggleMobileDrawer'));

// 监听示例 (App.tsx)
document.addEventListener('toggleMobileDrawer', handleToggleDrawer);
```

---

## 8. PWA & Service Worker API

### Manifest (动态注入)
```json
{
  "name": "言语云量化分析交易系统",
  "short_name": "言语云量化",
  "display": "standalone",
  "background_color": "#071425",
  "theme_color": "#0A192F",
  "orientation": "any"
}
```

### Service Worker 消息协议

**主线程 → SW**:
```typescript
navigator.serviceWorker.controller.postMessage({
  type: 'SHOW_NOTIFICATION',
  title: '[BTC/USDT] 紧急预警',
  body: '价格突破上限: 当前 100,500.00，阈值 100,000',
  severity: 'critical'
});
```

**SW → 主线程** (通知点击):
```typescript
client.postMessage({
  type: 'NOTIFICATION_CLICK',
  severity: 'critical',
  url: '/'
});
```

### 缓存策略

| 资源类型 | 策略 | 说明 |
|---------|------|------|
| API / market / quotes | Network First | 优先网络，缓存降级 |
| 静态资源 | Stale While Revalidate | 先显示缓存，后台更新 |

---

## 9. i18n 国际化

**当前实现**: Mock i18n (`/src/app/i18n/mock.ts`)

```typescript
function useTranslation(): {
  t: (key: string) => string;
  i18n: {
    language: string;
    changeLanguage: (lng: string) => Promise<void>;
  };
  ready: boolean;
}
```

**支持语言**: `zh` (中文), `en` (English)  
**翻译键**: `nav.*`, `market.*`, `settings.*`

---

## 附录: 导航数据结构

**MODULES** (8 个顶级模块):
```typescript
const MODULES = [
  { id: 'market',   name: '市场数据', icon: TrendingUp },
  { id: 'strategy', name: '智能策略', icon: Cpu },
  { id: 'risk',     name: '风险管控', icon: ShieldAlert },
  { id: 'quantum',  name: '量子计算', icon: Atom },
  { id: 'bigdata',  name: '数据管理', icon: Database },
  { id: 'model',    name: '量化工坊', icon: BrainCircuit },
  { id: 'trade',    name: '交易中心', icon: Zap },
  { id: 'admin',    name: '管理后台', icon: Settings },
];
```

**MENUS** (每模块 4-7 个子菜单，每子菜单 3-5 个三级页):
- 总计 **45 个二级子菜单**
- 总计 **约 185 个三级页面**
