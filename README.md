# YanYu Cloud Quantitative Analysis Trading System

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 项目概述

YYC3-QATS 是一款面向专业量化交易者的全功能 Web 应用，采用深空蓝 (#071425) 视觉主题，涵盖从市场数据分析到策略回测、风险管控、量子计算辅助、大数据管理、模型训练部署、实盘交易到系统管理的完整业务链条。

系统为解决 `fginspector` 运行时环境下 `ForwardRef` 报错问题，采用**净启动架构 (Clean Boot Architecture)**，彻底移除了 `radix-ui`、`lucide-react` 等依赖 ForwardRef 的第三方 UI 库，所有组件均为纯函数组件，所有 `React.Fragment` 均替换为 `<span className="contents">` 或 `<div className="contents">`。

---

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | React | 18.3.1 |
| 语言 | TypeScript | (Vite 内置) |
| 构建 | Vite | 6.3.5 |
| 样式 | Tailwind CSS | 4.1.12 |
| 图表 | Recharts | 2.15.2 |
| 可视化 | D3.js | 7.9.0+ |
| K线图 | lightweight-charts | 5.1.0+ |
| 动画 | Motion (Framer Motion) | 12.23.24 |
| 拖拽 | react-dnd | 16.0.1 |
| 3D | Three.js | 0.182.0 |
| 持久化 | IndexedDB (idb) | 8.0.3 |
| PWA | Service Worker | 原生 |

---

## 项目架构

### 目录结构

```
src/app/
├── App.tsx                     # 主应用入口 (SPA)
├── components/
│   ├── AITraderAssistant.tsx    # AI 交易助手面板
│   ├── CrossModuleBar.tsx      # 跨模块数据联动条
│   ├── DataAlertBridge.tsx     # 数据-告警桥接 (renderless)
│   ├── DataFlowMap.tsx         # 数据流拓扑图 (Canvas)
│   ├── ErrorBoundary.tsx       # 全局错误边界
│   ├── FeasibilityReport.tsx   # 节点可行性报告
│   ├── KLineChart.tsx          # K线图表组件
│   ├── PortfolioTreemap.tsx    # 投资组合矩形树图 (D3)
│   ├── SafeIcons.tsx           # 131个纯函数 SVG 图标
│   ├── SafeMotion.tsx          # Motion 安全封装
│   ├── layout/
│   │   ├── AlertCenter.tsx     # 告警中心面板
│   │   ├── MobileNavigation.tsx # 移动端导航 (Tabbar + Drawer + DataFlowMini)
│   │   ├── Navbar.tsx          # 顶部导航栏
│   │   ├── SettingsDialog.tsx  # 设置对话框
│   │   └── Sidebar.tsx         # 左侧边栏 (桌面端)
│   └── ui/
│       ├── Card.tsx            # 卡片组件
│       ├── Badge.tsx           # 徽章组件
│       ├── Tabs.tsx            # 选项卡组件
│       └── use-mobile.tsx      # useIsMobile Hook
├── contexts/
│   ├── AlertContext.tsx         # 告警引擎 (9种指标阈值)
│   ├── GlobalDataContext.tsx    # 全局数据中枢 (12资产实时模拟)
│   └── SettingsContext.tsx      # 设置中心 (语言/颜色方案)
├── hooks/                       # 自定义 Hooks (11个)
├── i18n/
│   └── mock.ts                 # Mock 国际化 (zh/en)
├── modules/
│   ├── market/                 # 市场数据 (5个子模块)
│   ├── strategy/               # 智能策略 (5个子模块)
│   ├── risk/                   # 风险管控 (6个子模块)
│   ├── quantum/                # 量子计算 (6个子模块)
│   ├── bigdata/                # 数据管理 (6个子模块)
│   ├── model/                  # 量化工坊 (6个子模块)
│   ├── trade/                  # 交易中心 (5个子模块)
│   └── admin/                  # 管理后台 (6个子模块)
├── data/
│   └── navigation.tsx          # 导航配置 (8模块 + 45子菜单 + ~185三级页)
├── utils/
│   ├── db.ts                   # IndexedDB 工具
│   └── empty-module.ts         # 空模块 stub (react-force-graph-3d 拦截)
└── workers/
    └── pqc.worker.ts           # 后量子加密 Web Worker
```

### Provider 嵌套顺序

```
ErrorBoundary
  └── SettingsProvider
      └── AlertProvider
          └── GlobalDataProvider
              └── AppContent
```

### 导航架构

本系统不使用 React Router，而是采用**基于状态的内部导航机制**:

```typescript
// 三层导航状态
const [activeModule, setActiveModule] = useState('market');      // 一级: 模块
const [activeSub, setActiveSub] = useState('live');              // 二级: 子菜单
const [activeTertiary, setActiveTertiary] = useState('全球行情'); // 三级: 功能页
```

跨模块导航通过 `GlobalDataContext.navigateTo()` 触发，由 App.tsx 消费 `pendingNavigation` 状态完成切换。

---

## 八大业务模块

### 1. 市场数据 (market)
- **实时行情**: 全球行情面板、自选面板、K线分析、行情联动
- **历史数据**: 多维筛选、双模展示、指标对比、批量导出
- **智能洞察**: 趋势分析、异常检测、关联分析、数据预警
- **自主看板**: 组件中心、布局设计、保存分享
- **数据收藏**: 跨端同步、数据订阅

### 2. 智能策略 (strategy)
- **策略编辑**: 图形编辑器、代码编辑器、智能生成、组件中心
- **智能回测**: 回测设置、数据回测、报告生成、结果对比
- **策略优化**: 参数优化、AI优化、量子优化
- **模拟交易**: 模拟设置、执行监控、交易分析
- **策略管理**: 分类搜索、版本管理、分享导入

### 3. 风险管控 (risk)
- **量子风险计算**: VaR计算、组合优化
- **大数据风控**: 压力测试、情景分析
- **实时风控**: 资产监控、策略监控、全局看板
- **风险预警**: 预警设置、通知方式、自动风控
- **风控报告**: 实时报告、历史分析、优化建议
- **对冲工具库**: 传统对冲、AI对冲

### 4. 量子计算 (quantum)
- **资源监控**: 算力监控、任务队列、性能指标
- **算法配置**: 算法库、参数设置、融合配置
- **量化应用**: 策略优化、风险计算、行情预测
- **结果分析**: 结果可视、算法对比
- **加密安全**: 密钥管理、数据加密
- **实验工坊**: 自定义任务、算法调试

### 5. 数据管理 (bigdata)
- **数据管理**: 数据源接入、配置测试
- **采集清洗**: 实时采集、数据清洗
- **存储管理**: 状态监控、存储分析
- **数据处理**: 任务调度、流程设计
- **质量监控**: 质量指标、异常检测
- **数据共享**: 资源库、权限控制

### 6. 量化工坊 (model)
- **模型库**: 经典模型、AI模型、量子模型
- **智能训练**: 数据选择、量子加速、进度监控
- **模型评估**: 指标评估、回测评估、鲁棒测试
- **部署监控**: 在线部署、性能监控、版本管理
- **自主开发**: 开发框架、组件库、调试测试
- **模型应用**: 对接策略、行情分析

### 7. 交易中心 (trade)
- **实盘交易**: 资产监控、手动交易、自动交易、委托记录
- **模拟交易**: 账户配置、交易监控
- **交易计划**: 计划设置、条件挂单
- **日志统计**: 操作日志、交易统计
- **交易配置**: 接口配置、风控设置

### 8. 管理后台 (admin)
- **系统配置**: 基础配置、数据配置、通知配置
- **权限管理**: 用户管理、角色管理
- **日志监控**: 操作日志、错误日志、性能日志
- **数据备份**: 全局备份、数据恢复
- **模块插件**: 模块管理、插件管理
- **大屏监控**: 全局监控、实时监控、预警大屏

---

## 核心系统

### 告警引擎 (AlertContext)

支持 **9 种指标类型**的阈值告警:

| 指标 | 标签 | 类型 |
|------|------|------|
| price | 价格 | 市场 |
| change | 涨跌幅 | 市场 |
| volume_spike | 量能异动 | 技术 |
| rsi | RSI指标 | 技术 |
| drawdown | 回撤 | 风控 |
| var | VaR风险值 | 风控 |
| cpu | CPU使用率 | 系统 |
| latency | 网络延迟 | 系统 |
| accuracy | 模型精度 | 模型 |

**通知渠道**:
- 应用内弹窗 (AlertCenter)
- Web Audio API 声音通知 (critical: 双响, warning: 单响)
- Navigator.vibrate 振动反馈 (critical: SOS 模式)
- Service Worker 推送通知 (后台时)

**持久化**: localStorage (`yyc_alert_thresholds`)  
**默认规则**: 10 条预置规则 (含 BTC/ETH RSI + 量能异动)

### 数据中枢 (GlobalDataContext)

- **12 种资产**实时报价模拟 (4s 更新周期)
- 自动化持仓损益计算链: marketData → positions → account → riskMetrics
- **跨模块摘要** (crossModuleSummary): 8 模块核心指标一体聚合
- 3 个格式化工具: `formatPrice`, `formatUSD`, `formatPercent`

### 数据-告警桥接 (DataAlertBridge)

- 5 秒节流的 renderless 组件
- 为每个资产生成**均值回归 RSI 随机游走** (趋向 50)
- 为每个资产生成**量能异动倍率** (常态 ~1.0, 5% 概率尖峰)
- Service Worker 推送集成 (document.hidden 时触发)

---

## 移动端适配

### 响应式策略

| 组件 | 桌面端 | 移动端 |
|------|--------|--------|
| Sidebar | 固定左侧 256px | 不渲染 |
| MobileTabbar | 不渲染 | 底部 Tab 导航 |
| MobileDrawer | 不渲染 | 上滑抽屉 (子菜单) |
| CrossModuleBar | 水平滚动 chips | flex-wrap 紧凑布局 |
| Ticker Bar | left: 256px | left: 0 |
| 主内容区 | p-4 lg:p-6 | p-3, pb-28 |
| 标题 | text-xl lg:text-2xl | text-lg |
| 按钮文案 | "节点报告" | "报告" |
| Grid 网格 | md:grid-cols-4, lg:grid-cols-6 | grid-cols-1 / grid-cols-2 |

### DataFlowMini 动画

移动端专属的数据流拓扑图:
- Canvas 层: requestAnimationFrame 驱动粒子 + 发光环动画
- Lerp 平滑过渡: 模块切换/横竖屏旋转时节点位置平滑动画 (speed=0.08)
- HTML 覆盖层: CSS transition 定位过渡 (0.5s cubic-bezier)
- ResizeObserver 自适应容器尺寸变化

---

## PWA 支持

- **动态 Manifest**: JavaScript 运行时注入 (`injectPWAManifest()`)
- **Service Worker**: Stale-While-Revalidate (静态) + Network-First (API)
- **推送通知**: critical 告警 → SW → `showNotification()`
- **离线降级**: 缓存的静态资源 + 最后数据快照
- **安装提示**: `display: standalone`, `orientation: any`
- **Apple 适配**: `apple-mobile-web-app-capable`, `apple-touch-icon`

---

## 环境配置

### Vite 配置

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'three': path.resolve(__dirname, './node_modules/three'),
      'react-force-graph-3d': path.resolve(__dirname, './src/app/utils/empty-module.ts'),
    },
  },
});
```

### 路径别名
- `@/` → `/src/` (用于所有 import 路径)
- `react-force-graph-3d` → 空模块 stub (阻止运行时加载)

---

## 净启动约束 (Clean Boot Constraints)

本项目在 fginspector 环境中运行，必须严格遵守以下约束:

### 禁止使用
- `React.forwardRef` — 所有 ref 转发改为 prop 透传或 callback ref
- `React.Fragment` / `<>...</>` — 改用 `<span className="contents">` 或 `<div className="contents">`
- `@radix-ui/*` — 所有 Radix 原语组件 (forwardRef 依赖)
- `lucide-react` — 改用 SafeIcons.tsx 纯函数组件 (131 个图标)
- 任何内部使用 forwardRef 的第三方 UI 组件库

### 安全措施
- `App.tsx` 全局 console.error 拦截，抑制 fginspector/ForwardRef/Fragment 相关错误
- `ErrorBoundary` 包裹整个应用树，捕获渲染异常并提供恢复按钮
- 每个模块内联定义所需图标，避免 SafeIcons 的集中导入风险

---

## 开发迭代历史

### 已完成的功能开发 (5 轮)

1. **基础架构搭建**: 8 模块框架 + 导航系统 + 深空蓝主题
2. **数据中枢**: GlobalDataContext 12 资产实时模拟 + 联动计算链
3. **告警引擎**: AlertContext 9 种指标阈值 + 多通道通知
4. **跨模块通信**: CrossModuleBar + DataAlertBridge + navigateTo
5. **PWA & 移动端**: Service Worker + MobileNavigation + isMobile 适配

### 已修复的 Bug (4 个)

1. AITraderAssistant `handleSend` 的 overrideText 参数与 MouseEvent 误传
2. DataFlowMini Canvas 依赖数组精简 (移除不必要依赖)
3. Navbar AI 浮动按钮 aiBadgePulse 动画缺失
4. Navbar 布局重构 (响应式优化)

### 最近完成的改进 (本轮 + 上轮)

1. **volume_spike + RSI 阈值逻辑**: AlertContext checkAndTrigger 完整处理 + DataAlertBridge 均值回归 RSI 和量能模拟
2. **DataFlowMini ResizeObserver**: 容器尺寸监听 + 动态布局
3. **isMobile 全面优化**: Ticker/padding/字号/按钮/Sidebar/网格
4. **默认阈值扩展**: 新增 5 条 RSI + volume_spike 预置规则
5. **DataFlowMini 平滑动画**: Canvas lerp + CSS transition
6. **CrossModuleBar 移动端**: flex-wrap 紧凑布局
7. **全模块响应式 Grid 修复**: 12 个文件 grid-cols 补充响应式前缀

---

## 数据统计

| 指标 | 数值 |
|------|------|
| 源文件总数 | ~161 个 (.ts/.tsx) |
| 业务模块 | 8 个 |
| 二级子菜单 | 45 个 |
| 三级功能页 | ~185 个 |
| SafeIcons 图标 | 131 个 |
| Context Provider | 3 个 |
| 自定义 Hook | 11 个 |
| 资产品种 | 12 个 (6 加密 + 3 股票 + 2 期货 + 1 外汇) |
| 预置策略 | 6 个 |
| 默认告警规则 | 10 个 |
| 支持语言 | 2 (中文/英文) |

---

## 文档索引

| 文档 | 路径 | 描述 |
|------|------|------|
| TypeScript 审计报告 | `/docs/TypeScript-Audit-Report.md` | 161 文件全局类型检测，合规性验证 |
| 核心测试用例 | `/docs/Core-Test-Cases.md` | 56 个测试用例，覆盖全部核心功能 |
| 功能逻辑 API 文档 | `/docs/Functional-API-Documentation.md` | Context API、组件接口、数据模型 |
| 拓展规划方案 | `/docs/Expansion-Roadmap.md` | 6 阶段路线图，含里程碑与度量指标 |
| 本文档 (README) | `/docs/README.md` | 项目完整说明 |

---

## 许可证

本项目为专有软件，仅限授权用户使用。

---
---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

*YYC-QATS v1.0 | 言语云量化分析交易系统 | 2026*
