# YYC-QATS 核心功能测试用例

> 版本: v1.0 (对齐净启动状态)  
> 日期: 2026-02-16  
> 测试框架建议: Vitest + React Testing Library + @testing-library/user-event  
> 覆盖范围: 3 个 Context、8 大业务模块、告警引擎、跨模块导航、PWA、移动端适配

---

## 目录

1. [AlertContext 告警引擎](#1-alertcontext-告警引擎)
2. [GlobalDataContext 数据中枢](#2-globaldatacontext-数据中枢)
3. [SettingsContext 设置中心](#3-settingscontext-设置中心)
4. [DataAlertBridge 数据-告警桥接](#4-dataalertbridge-数据-告警桥接)
5. [CrossModuleBar 跨模块联动](#5-crossmodulebar-跨模块联动)
6. [App.tsx 主应用导航](#6-apptsx-主应用导航)
7. [移动端适配 (MobileNavigation)](#7-移动端适配)
8. [DataFlowMini Canvas 动画](#8-dataflowmini-canvas-动画)
9. [AITraderAssistant AI助手](#9-aitraderassistant-ai助手)
10. [业务模块渲染](#10-业务模块渲染)
11. [PWA & Service Worker](#11-pwa--service-worker)
12. [SafeIcons 图标系统](#12-safeicons-图标系统)

---

## 1. AlertContext 告警引擎

### TC-ALERT-001: 默认阈值初始化

**前置条件**: localStorage 中无 `yyc_alert_thresholds` 键  
**操作**: 挂载 `AlertProvider`  
**预期结果**:
- `thresholds` 数组长度为 10
- 包含 `th_default_1` ~ `th_default_10`
- 含 RSI 规则: BTC/USDT RSI > 70 (th_default_6)、BTC/USDT RSI < 30 (th_default_7)、SOL/USDT RSI > 75 (th_default_10)
- 含量能规则: BTC/USDT volume_spike > 3 (th_default_8)、ETH/USDT volume_spike > 3 (th_default_9)
- 所有规则 `enabled: true`

```typescript
test('should initialize with 10 default thresholds including RSI and volume_spike', () => {
  localStorage.removeItem('yyc_alert_thresholds');
  const { result } = renderHook(() => useAlerts(), { wrapper: AlertProvider });
  expect(result.current.thresholds).toHaveLength(10);
  const rsiRules = result.current.thresholds.filter(t => t.metric === 'rsi');
  expect(rsiRules).toHaveLength(3);
  const volRules = result.current.thresholds.filter(t => t.metric === 'volume_spike');
  expect(volRules).toHaveLength(2);
});
```

### TC-ALERT-002: localStorage 持久化恢复

**前置条件**: localStorage 写入自定义阈值 JSON  
**操作**: 挂载 `AlertProvider`  
**预期结果**: 恢复自定义阈值而非默认值

### TC-ALERT-003: 阈值 CRUD 操作

**操作**: 依次调用 `addThreshold`, `updateThreshold`, `toggleThreshold`, `removeThreshold`  
**预期结果**:
- `addThreshold` → 数组长度 +1，新项有唯一 `th_` 前缀 ID
- `updateThreshold` → 指定 ID 项字段被更新
- `toggleThreshold` → `enabled` 翻转
- `removeThreshold` → 数组长度 -1

### TC-ALERT-004: checkAndTrigger — 价格突破上限

**操作**: 设置 BTC/USDT price > 100000 阈值，调用 `checkAndTrigger({ marketPrices: { 'BTC/USDT': 100500 }, ... })`  
**预期结果**:
- alerts 数组新增一条 severity='warning', type='price' 的告警
- message 包含 "价格" 和 "突破上限"

### TC-ALERT-005: checkAndTrigger — RSI 超买触发

**操作**: 阈值 BTC/USDT RSI > 70，调用 `checkAndTrigger({ marketRSI: { 'BTC/USDT': 72.5 }, ... })`  
**预期结果**:
- 新增一条 type='technical', severity='info' 的告警
- message 包含 "RSI指标" 和 "突破上限"
- source 为 'market'

### TC-ALERT-006: checkAndTrigger — 量能异动触发

**操作**: 阈值 BTC/USDT volume_spike > 3，调用 `checkAndTrigger({ marketVolumeSpikes: { 'BTC/USDT': 3.5 }, ... })`  
**预期结果**:
- 新增一条 type='technical', severity='warning' 的告警
- message 包含 "量能异动" 和 "突破上限"

### TC-ALERT-007: 冷却机制 (Cooldown)

**操作**: 连续两次调用 `checkAndTrigger` 触发同一阈值 (间隔 < cooldownMs)  
**预期结果**: 仅第一次触发告警，第二次因冷却被忽略

### TC-ALERT-008: 禁用阈值不触发

**操作**: 将阈值 `enabled` 设为 false，调用 `checkAndTrigger` 使数据满足触发条件  
**预期结果**: 无新告警产生

### TC-ALERT-009: 告警音效触发

**操作**: `addAlert` 添加 severity='critical' 的告警  
**预期结果**: 调用 `AudioContext.createOscillator()` (可 mock 验证)

### TC-ALERT-010: 告警振动触发

**操作**: `addAlert` 添加 severity='critical' 的告警，且 `navigator.vibrate` 可用  
**预期结果**: 调用 `navigator.vibrate([200, 100, 200, 100, 300])`

### TC-ALERT-011: 告警上限 100 条

**操作**: 连续 `addAlert` 110 次  
**预期结果**: alerts 数组长度始终 <= 100，最旧的被丢弃

### TC-ALERT-012: markAsRead / markAllAsRead / clearAlerts

**操作**: 添加 3 条告警 → `markAsRead(id1)` → `markAllAsRead()` → `clearAlerts()`  
**预期结果**: read 状态正确更新，clearAlerts 后数组为空

---

## 2. GlobalDataContext 数据中枢

### TC-GDATA-001: 初始市场数据完整性

**操作**: 挂载 `GlobalDataProvider`，读取 `marketData`  
**预期结果**:
- 包含 12 个资产 (6 加密货币 + 3 股票 + 2 期货 + 1 外汇)
- 每个资产有 symbol, name, price, change, volume, high24h, low24h, marketCap, category

### TC-GDATA-002: 市场数据实时模拟 (4s 更新)

**操作**: 挂载后等待 4.5 秒  
**预期结果**: `marketData` 中至少一个资产的 `price` 发生变化

### TC-GDATA-003: 持仓跟随市场价格联动

**操作**: 市场数据 BTC/USDT 价格变化后  
**预期结果**:
- `positions` 中 BTC/USDT 的 `currentPrice` 同步更新
- `unrealizedPnl` 和 `pnlPercent` 自动重算

### TC-GDATA-004: 账户汇总自动更新

**操作**: positions 变化后  
**预期结果**:
- `account.positionValue` = sum(currentPrice * quantity)
- `account.totalAssets` = availableBalance + positionValue
- `account.todayPnl` = sum(unrealizedPnl)

### TC-GDATA-005: 系统指标模拟更新

**操作**: 等待系统指标更新周期  
**预期结果**: `systemMetrics.cpuUsage`, `memoryUsage`, `networkLatency` 在合理范围内波动

### TC-GDATA-006: 跨模块摘要 (crossModuleSummary)

**操作**: 读取 `crossModuleSummary`  
**预期结果**:
- `.market.topMover` 返回涨幅最大的资产 symbol
- `.strategy.activeCount` = 策略中 status='active' 的数量
- `.risk.riskLevel` 基于组合 VaR 动态计算
- `.trade.openPositions` = positions.length

### TC-GDATA-007: 导航函数 navigateTo

**操作**: 调用 `navigateTo('risk', 'live_risk', '资产监控')`  
**预期结果**: `pendingNavigation` 设为 `{ module: 'risk', sub: 'live_risk', tertiary: '资产监控' }`

### TC-GDATA-008: Ticker 数据格式化

**操作**: 读取 `tickerCoins`  
**预期结果**:
- 每项有 `label`, `price`, `change`, `cny` 字段
- `price` 格式化为带逗号的字符串
- `change` 格式化为带 +/- 百分号的字符串

### TC-GDATA-009: 格式化工具函数

**操作**: 调用 `formatPrice(96231.50)`, `formatUSD(2850.80)`, `formatPercent(2.45)`  
**预期结果**:
- `formatPrice` → "$96,231.50" 或类似格式
- `formatUSD` → 带 +/- 和 $ 符号
- `formatPercent` → "+2.45%"

---

## 3. SettingsContext 设置中心

### TC-SET-001: 默认颜色方案

**操作**: 挂载 SettingsProvider  
**预期结果**: `colorScheme` 为 'china'

### TC-SET-002: 涨跌颜色 — 中国模式

**操作**: colorScheme='china', 调用 `getChangeColorClass(2.5)`  
**预期结果**: 返回 'text-[#F56565]' (红色 = 上涨)

### TC-SET-003: 涨跌颜色 — 国际模式

**操作**: `setColorScheme('standard')`, 调用 `getChangeColorClass(2.5)`  
**预期结果**: 返回 'text-[#38B2AC]' (绿色 = 上涨)

### TC-SET-004: 零涨跌

**操作**: 调用 `getChangeColorClass(0)`  
**预期结果**: 返回 'text-[#8892B0]' (灰色)

### TC-SET-005: 字符串涨跌输入

**操作**: 调用 `getChangeColorClass('+2.5%')`  
**预期结果**: 正确解析正数并返回涨色

---

## 4. DataAlertBridge 数据-告警桥接

### TC-BRIDGE-001: 5 秒节流

**操作**: 快速连续触发 marketData 更新 (< 5s 内)  
**预期结果**: `checkAndTrigger` 仅在首次和 5 秒后再次被调用

### TC-BRIDGE-002: RSI 均值回归模拟

**操作**: 多次更新后读取模拟 RSI 值  
**预期结果**:
- RSI 值在 5~95 范围内
- 长期趋向 50 (均值回归)

### TC-BRIDGE-003: 量能异动模拟

**操作**: 多次更新后读取 volume spike 值  
**预期结果**:
- 常态下在 0.3~2.0 附近
- 偶有 >3.0 的尖峰 (约 5% 概率)

### TC-BRIDGE-004: 未读告警数同步到 GlobalData

**操作**: 新增 3 条未读告警  
**预期结果**: `useGlobalData().alertCount` 更新为 3

### TC-BRIDGE-005: Service Worker 推送 (后台通知)

**前置条件**: `document.hidden = true`, Notification permission = 'granted'  
**操作**: 新增 severity='critical' 的告警  
**预期结果**: `navigator.serviceWorker.controller.postMessage` 被调用

---

## 5. CrossModuleBar 跨模块联动

### TC-CROSS-001: 模块关联正确性

**操作**: 渲染 `<CrossModuleBar currentModule="market" />`  
**预期结果**: 显示 strategy, risk, trade, bigdata 四个 chip

### TC-CROSS-002: Chip 数据实时性

**操作**: 渲染后读取 market chip 内容  
**预期结果**: 显示当前涨幅最大品种及其涨跌数值

### TC-CROSS-003: Chip 点击导航

**操作**: 点击 "风控" chip  
**预期结果**: `navigateTo('risk', 'live_risk')` 被调用

### TC-CROSS-004: 移动端紧凑布局

**前置条件**: viewport width < 768px  
**操作**: 渲染 CrossModuleBar  
**预期结果**:
- 使用 flex-wrap 布局而非水平滚动
- 字体为 9px
- 无箭头图标
- 显示 "X模块" 统计

### TC-CROSS-005: 高风险脉冲指示

**操作**: risk.riskLevel = 'high' 时渲染  
**预期结果**: 风控 chip 前显示红色 animate-pulse 圆点

---

## 6. App.tsx 主应用导航

### TC-NAV-001: 模块切换重置子菜单

**操作**: 从 market/live 切换到 strategy  
**预期结果**: `activeSub` 重置为 strategy 模块的第一个子菜单 ('edit'), `activeTertiary` 重置

### TC-NAV-002: 面包屑正确显示

**操作**: 设置 activeModule='risk', activeSub='warning'  
**预期结果**: 面包屑显示 "言语云系统 > 风险管控 > 风险预警控制"

### TC-NAV-003: 跨模块导航消费

**操作**: GlobalData 触发 `navigateTo('quantum', 'resource')`  
**预期结果**: `pendingNavigation` 被消费，`activeModule` 变为 'quantum', `activeSub` 变为 'resource'

### TC-NAV-004: Ticker 滚动

**操作**: 渲染完成后  
**预期结果**: Ticker Bar 可见，包含所有 tickerCoins 数据，有无限滚动动画

### TC-NAV-005: 移动端布局差异

**前置条件**: isMobile = true  
**预期结果**:
- Sidebar 不渲染
- MobileTabbar 渲染
- 主内容区 padding 缩小为 p-3
- 页面底部留白增大 (pb-28)
- 标题字号降级为 text-lg
- 按钮文案缩短 ("报告" vs "节点报告")

### TC-NAV-006: PWA Manifest 注入

**操作**: App 首次挂载  
**预期结果**:
- `<link rel="manifest">` 被注入 head
- `<meta name="theme-color">` 为 #0A192F
- `<meta name="apple-mobile-web-app-capable">` 为 yes

### TC-NAV-007: fginspector 错误抑制

**操作**: console.error 被调用且包含 'ForwardRef' 字符串  
**预期结果**: 错误被转为 console.warn，不影响渲染

---

## 7. 移动端适配

### TC-MOB-001: MobileTabbar 模块切换

**操作**: 点击 Tabbar 中的 "策略" 图标  
**预期结果**: `onModuleChange('strategy')` 被调用，高亮状态变化

### TC-MOB-002: MobileDrawer 开关

**操作**: 触发 `toggleMobileDrawer` 自定义事件  
**预期结果**: Drawer 切换显示/隐藏，有滑入/滑出动画

### TC-MOB-003: MobileDrawer 子菜单导航

**操作**: 在 Drawer 中展开 "市场数据" → 点击 "K线分析"  
**预期结果**: sub 变为 'live', tertiary 变为 'K线分析', Drawer 关闭

---

## 8. DataFlowMini Canvas 动画

### TC-FLOW-001: Canvas 初始化

**操作**: 渲染 DataFlowMini with currentModule='market'  
**预期结果**: Canvas 存在且大小与容器匹配

### TC-FLOW-002: 模块切换节点动画

**操作**: 从 market 切换到 strategy  
**预期结果**:
- Canvas 层节点从中心向新位置 lerp 展开 (LERP_SPEED=0.08)
- HTML Chip 有 0.5s cubic-bezier 过渡动画
- 最终显示 strategy 关联的 4 个节点: market, model, quantum, trade

### TC-FLOW-003: ResizeObserver 响应

**操作**: 调整容器大小  
**预期结果**:
- Canvas 分辨率自动更新 (DPR 感知)
- 节点位置平滑过渡到新布局
- sizeRef 缓存防止无变化时重复设置

### TC-FLOW-004: 节点点击导航

**操作**: 点击外围 "风控" 芯片  
**预期结果**: `onNavigate('risk')` 被调用

### TC-FLOW-005: 粒子动画持续运行

**操作**: 渲染 5 秒后  
**预期结果**: 连接线上有持续运动的发光粒子

---

## 9. AITraderAssistant AI助手

### TC-AI-001: 开关控制

**操作**: 设置 visible=true / false  
**预期结果**: 面板显示/隐藏，有过渡动画

### TC-AI-002: 消息发送

**操作**: 输入 "分析BTC走势" 并回车  
**预期结果**: 用户消息出现在聊天区，随后出现 AI 模拟回复

### TC-AI-003: overrideText 参数

**操作**: 通过 handleSend('快速分析') 传入 overrideText  
**预期结果**: 使用 overrideText 而非输入框内容，不再误传 MouseEvent

---

## 10. 业务模块渲染

### TC-MOD-001: 全部 8 模块可渲染

**操作**: 依次设置 activeModule 为 market/strategy/risk/quantum/bigdata/model/trade/admin  
**预期结果**: 每个模块渲染无错误 (ErrorBoundary 不触发)

### TC-MOD-002: 市场模块子菜单切换

**操作**: 设置 activeSub 为 live/history/insight/board/fav  
**预期结果**: 对应子模块内容正确渲染

### TC-MOD-003: 策略模块回测子页

**操作**: 设置 activeSub='backtest'  
**预期结果**: 显示回测配置界面，含参数设置、收益曲线、统计指标

### TC-MOD-004: 风控模块风险等级显示

**操作**: riskMetrics 中 VaR95 为高值  
**预期结果**: risk.riskLevel 显示为 "高风险" (红色)

### TC-MOD-005: 管理后台大屏监控

**操作**: 设置 activeModule='admin', activeSub='screen'  
**预期结果**: 显示全局监控面板，含各模块实时数据卡片

---

## 11. PWA & Service Worker

### TC-PWA-001: Service Worker 注册

**前置条件**: 浏览器支持 ServiceWorker  
**操作**: 页面加载  
**预期结果**: console 输出 "[YYC-PWA] SW registered"

### TC-PWA-002: 通知权限请求

**操作**: 页面加载后 5 秒  
**预期结果**: 调用 `Notification.requestPermission()`

### TC-PWA-003: 离线缓存

**操作**: 首次加载后模拟离线  
**预期结果**: 缓存的静态资源可用

### TC-PWA-004: 告警推送到 SW

**操作**: 页面后台时 (document.hidden=true) 触发 critical 告警  
**预期结果**: Service Worker 收到 SHOW_NOTIFICATION 消息

---

## 12. SafeIcons 图标系统

### TC-ICON-001: 导出数量

**操作**: import * from SafeIcons  
**预期结果**: 导出 131 个命名组件

### TC-ICON-002: 纯函数组件 (无 forwardRef)

**操作**: 检查任意导出组件  
**预期结果**: typeof component === 'function' (非 forwardRef 对象)

### TC-ICON-003: SVG Props 透传

**操作**: `<SafeIcons.Zap className="w-5 h-5 text-red-500" />`  
**预期结果**: 渲染的 SVG 元素有 class="w-5 h-5 text-red-500"

---

## 测试优先级矩阵

| 优先级 | 测试用例 | 数量 |
|--------|---------|------|
| P0 (关键路径) | TC-ALERT-001~006, TC-GDATA-001~004, TC-NAV-001~003 | 13 |
| P1 (核心功能) | TC-ALERT-007~012, TC-BRIDGE-001~005, TC-CROSS-001~005 | 15 |
| P2 (交互体验) | TC-FLOW-001~005, TC-MOB-001~003, TC-AI-001~003 | 11 |
| P3 (健壮性) | TC-SET-001~005, TC-MOD-001~005, TC-PWA-001~004, TC-ICON-001~003 | 17 |
| **合计** | | **56** |

---

*建议覆盖率目标: 核心 Contexts/Hooks ≥90%, 模块渲染 ≥80%, 动画/PWA ≥60%*
