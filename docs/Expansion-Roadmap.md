# YYC-QATS 完善拓展规划方案

> 版本: v1.0  
> 日期: 2026-02-16  
> 基于: 净启动状态 + 五轮迭代后的当前系统现状  
> 规划周期: 6 个阶段 (Q1-Q2 2026)

---

## 一、当前系统能力基线

### 已完成能力矩阵

| 维度 | 能力 | 成熟度 |
|------|------|--------|
| 前端架构 | 8 模块 SPA + 状态导航 + 3 Context | ★★★★☆ |
| 数据模拟 | 12 资产实时报价 + 系统指标 + 模型指标 | ★★★★☆ |
| 告警引擎 | 9 种指标阈值 + 冷却 + 声音/振动/推送 | ★★★★☆ |
| 跨模块通信 | CrossModuleBar + navigateTo + DataAlertBridge | ★★★★☆ |
| 移动端适配 | isMobile 布局 + MobileTabbar + MobileDrawer + 响应式 grid | ★★★☆☆ |
| 可视化 | Canvas DataFlowMini + D3 TreeMap + Recharts 图表 | ★★★☆☆ |
| PWA | Manifest + Service Worker + 离线缓存 + 推送通知 | ★★★☆☆ |
| AI 辅助 | AITraderAssistant 对话面板 (模拟) | ★★☆☆☆ |
| 国际化 | Mock i18n (zh/en 基础键) | ★★☆☆☆ |
| 类型安全 | 核心 Context 完全泛型化，170 处 any 待优化 | ★★★☆☆ |

### 当前技术债务

1. `/ui/` 目录 20+ 休眠 Radix 组件 (未使用但未清理)
2. 170 处 `props: any` 图标类型
3. 9 处 `as any` 类型断言 (4 处合理，5 处需修复)
4. 8 个未使用的 npm 依赖
5. 6 处非响应式 grid (Backtest, RealTrading, SimulatedTrading, SystemDashboard)
6. Mock 数据未与后端 API Schema 对齐

---

## 二、六阶段规划总览

```
阶段1: 稳固基座 (2周)
  ↓
阶段2: 数据真实化 (3周)
  ↓
阶段3: 智能增强 (3周)
  ↓
阶段4: 协作与安全 (2周)
  ↓
阶段5: 性能与体验 (2周)
  ↓
阶段6: 生态扩展 (持续)
```

---

## 三、阶段详细规划

### 阶段 1: 稳固基座 — TypeScript 严格化 + 技术债清理

**时间**: 第 1-2 周  
**目标**: 将代码库提升至工程化生产标准

#### 1.1 TypeScript 严格化

| 任务 | 描述 | 影响文件数 | 优先级 |
|------|------|-----------|--------|
| 定义 `IconProps` 共享类型 | `React.SVGProps<SVGSVGElement>` 替换所有 `props: any` | ~40 文件 | P0 |
| `MENUS` 类型化 | 定义 `MenuItem` 接口替换 `Record<string, any[]>` | 1 文件 + 消费方 | P0 |
| 修复 5 处不合理 `as any` | tickerCoins.cny 类型、AdminModule.tertiary、PortfolioTreemap D3 泛型 | 4 文件 | P1 |
| 启用 `tsc --noEmit` CI 检测 | 配置 tsconfig.json strict 模式 + CI/CD 管线集成 | 配置文件 | P1 |

#### 1.2 技术债清理

| 任务 | 描述 | 预期结果 |
|------|------|---------|
| 休眠 UI 组件归档 | 将 `/ui/` 中未使用的 Radix 组件移至 `_legacy/` | 消除混淆，减少 ~20 个无用导入 |
| 未使用依赖清理 | 移除 react-router-dom, i18next, next-themes, cmdk, vaul 等 | `node_modules` 体积减少 ~15MB |
| package.json 异常修复 | 移除 `"react@12.23.24"` 残留条目 | 消除潜在包管理冲突 |
| 剩余非响应式 grid 修复 | 修复 Backtest, RealTrading, SimulatedTrading, SystemDashboard 共 6 处 | 移动端全模块无水平溢出 |

#### 预期结果
- `tsc --noEmit` 零错误
- `any` 使用降至 <20 处 (仅保留 WebKit API 等必要断言)
- bundle size 减少 10-15%
- 技术债清零

---

### 阶段 2: 数据真实化 — 后端 API 对接层

**时间**: 第 3-5 周  
**目标**: 将模拟数据替换为可切换的真实数据源，建立 API 抽象层

#### 2.1 API 抽象层设计

```typescript
// /src/app/services/api-layer.ts
interface MarketDataProvider {
  subscribe(symbols: string[], callback: (data: MarketTick[]) => void): () => void;
  getHistory(symbol: string, interval: string, from: Date, to: Date): Promise<OHLCV[]>;
  getOrderBook(symbol: string, depth: number): Promise<OrderBook>;
}

interface TradeExecutor {
  placeOrder(order: OrderRequest): Promise<OrderResult>;
  cancelOrder(orderId: string): Promise<void>;
  getOpenOrders(): Promise<Order[]>;
  getBalances(): Promise<Balance[]>;
}

// 工厂模式: mock / binance / okx / custom
function createProvider(type: 'mock' | 'binance' | 'okx'): MarketDataProvider;
```

#### 2.2 WebSocket 实时数据流

| 任务 | 描述 | 技术选型 |
|------|------|---------|
| WebSocket 管理器 | 自动重连 + 心跳 + 消息队列 | 原生 WebSocket + 指数退避 |
| 行情数据流 | Binance/OKX WS 标准化 | 适配器模式 |
| 订单簿深度 | Level2 深度数据实时更新 | 增量更新协议 |
| K 线数据流 | 历史 + 实时拼接 | REST (历史) + WS (实时) |

#### 2.3 数据缓存与降级

```
实时数据 → WebSocket ─┐
                       ├─→ 标准化层 → GlobalDataContext → UI
历史数据 → REST API ──┘
                       │
               ┌───────┘
               ↓
        IndexedDB 缓存 (idb 库)
               ↓
        离线降级: 最后缓存数据 + "数据已过期" 标识
```

#### 预期结果
- 支持 mock / Binance / OKX 三种数据源切换
- WebSocket 连接中断后 30s 内自动恢复
- 行情延迟 < 200ms (WS 模式)
- IndexedDB 缓存最近 7 天 K 线数据
- GlobalDataContext 接口不变，下游模块零改动

---

### 阶段 3: 智能增强 — AI 集成 + 高级分析

**时间**: 第 6-8 周  
**目标**: 将 AI 助手从模拟升级为可用工具，增加深度分析能力

#### 3.1 AI 助手真实化

| 任务 | 描述 | 技术方案 |
|------|------|---------|
| LLM API 集成 | 对接 OpenAI / Claude / 本地模型 | `/src/app/services/ai-service.ts` |
| 上下文注入 | 将当前持仓、策略、风控数据注入 prompt | System prompt + JSON 上下文 |
| 流式响应 | Server-Sent Events 实时输出 | `EventSource` + token-by-token 渲染 |
| 工具调用 | AI 可触发 navigateTo、修改阈值、下单建议 | Function calling schema |
| 对话记忆 | 会话级上下文保持 | 本地 state + 可选 Supabase 持久化 |

**AI 可用工具定义**:
```typescript
const AI_TOOLS = [
  { name: 'navigate', desc: '导航到指定模块页面', params: { module: string, sub?: string } },
  { name: 'set_alert', desc: '设置价格/指标告警', params: { symbol: string, metric: ThresholdMetric, condition: string, value: number } },
  { name: 'analyze_position', desc: '分析当前持仓风险', params: {} },
  { name: 'backtest_quick', desc: '快速回测策略', params: { strategy: string, period: string } },
  { name: 'market_scan', desc: '扫描市场异常', params: { category?: string } },
];
```

#### 3.2 高级技术指标引擎

| 指标 | 计算方式 | 用途 |
|------|---------|------|
| 真实 RSI (14周期) | Wilder 平滑 | 替代当前随机模拟 |
| MACD (12,26,9) | 指数移动平均 | 策略信号生成 |
| 布林带 (20,2) | 标准差通道 | 波动率分析 |
| ATR (14) | 真实波动幅度均值 | 止损计算 |
| 资金费率 | 期货 API 获取 | 市场情绪指标 |
| 链上指标 | Glassnode / CryptoQuant API | 基本面分析 |

#### 3.3 策略回测引擎增强

```
当前: 静态模拟数据 + UI 展示
目标: 
  ├── Web Worker 驱动的真实回测计算
  ├── 支持自定义策略代码 (Monaco Editor)
  ├── 多时间框架回测 (1m/5m/1h/1d)
  ├── 蒙特卡洛模拟 (1000次随机重采样)
  └── 滑点 + 手续费真实建模
```

#### 预期结果
- AI 助手可回答 "BTC 当前技术面如何?" 并引用真实指标数据
- AI 可执行 "帮我设置 BTC RSI>70 的告警" 并调用 addThreshold
- 回测引擎支持 10 万条 K 线数据 < 3s 计算完成
- 真实 RSI/MACD/ATR 替代随机模拟

---

### 阶段 4: 协作与安全 — 多用户 + 权限 + 数据安全

**时间**: 第 9-10 周  
**目标**: 从单用户本地应用升级为安全的多用户协作平台

#### 4.1 用户认证 (Supabase Auth)

| 功能 | 实现 |
|------|------|
| 邮箱密码注册/登录 | Supabase Auth |
| OAuth 社交登录 | Google / GitHub |
| 两步验证 (2FA) | TOTP (Authenticator App) |
| 会话管理 | JWT + refresh token |
| 角色权限 | admin / trader / analyst / viewer |

#### 4.2 数据持久化 (Supabase Database)

```sql
-- 用户策略配置
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  code TEXT,
  config JSONB,
  version TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 告警阈值 (替代 localStorage)
CREATE TABLE alert_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  symbol TEXT NOT NULL,
  metric TEXT NOT NULL,
  condition TEXT NOT NULL,
  value NUMERIC NOT NULL,
  enabled BOOLEAN DEFAULT true,
  cooldown_ms INTEGER DEFAULT 60000
);

-- 交易记录
CREATE TABLE trade_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  strategy TEXT,
  executed_at TIMESTAMPTZ DEFAULT now()
);

-- 看板配置
CREATE TABLE dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  layout JSONB NOT NULL,
  shared BOOLEAN DEFAULT false
);
```

#### 4.3 安全加固

| 安全域 | 措施 |
|--------|------|
| API Key 保护 | 环境变量 + Supabase Edge Function 代理 |
| XSS 防护 | CSP Header + DOMPurify 消毒 |
| 敏感数据 | AES-256 客户端加密 API Key 存储 |
| 通信安全 | HTTPS Only + HSTS |
| Rate Limiting | Supabase RLS + Edge Function 限流 |

#### 预期结果
- 用户可注册登录，配置在云端持久化
- 策略、阈值、看板跨设备同步
- RLS 确保用户只能访问自己的数据
- API Key 不在前端暴露

---

### 阶段 5: 性能与体验 — 极致优化

**时间**: 第 11-12 周  
**目标**: 首屏 < 1.5s，交互响应 < 50ms，内存 < 150MB

#### 5.1 代码分割与懒加载

```typescript
// 路由级懒加载 (替换当前 switch/case)
const MarketModule = React.lazy(() => import('./modules/market/MarketModule'));
const StrategyModule = React.lazy(() => import('./modules/strategy/StrategyModule'));
// ... 8 个模块全部懒加载

// Suspense 包裹
<React.Suspense fallback={<ModuleSkeleton />}>
  {renderContent()}
</React.Suspense>
```

#### 5.2 渲染优化

| 优化项 | 方案 | 预期提升 |
|--------|------|---------|
| 重渲染控制 | `React.memo` + `useMemo` 包裹重计算组件 | 减少 30% 不必要渲染 |
| 虚拟列表 | `react-window` 用于 GlobalQuotes 等长列表 | 大数据量页面 FPS +40% |
| Canvas 离屏渲染 | DataFlowMini 使用 OffscreenCanvas | 主线程释放 |
| Web Worker 计算 | 回测、指标计算移至 Worker | 主线程 0 阻塞 |
| 状态颗粒化 | 将 GlobalDataContext 拆分为 MarketContext + AccountContext + SystemContext | 减少跨模块无关重渲染 |

#### 5.3 资源优化

| 优化项 | 当前 | 目标 |
|--------|------|------|
| 首屏 JS bundle | ~500KB (估算) | < 200KB (gzip) |
| 首屏渲染时间 | ~3s (估算) | < 1.5s |
| 内存占用 | ~200MB (估算) | < 150MB |
| 最大内容绘制 (LCP) | ~2.5s | < 1.2s |

#### 5.4 交互体验增强

| 功能 | 描述 |
|------|------|
| 骨架屏 | 模块切换时显示内容骨架而非空白 |
| 乐观更新 | 操作先显示结果，后台确认 |
| 快捷键系统 | `Ctrl+K` 全局搜索, `Ctrl+1-8` 模块切换, `Ctrl+/` AI 助手 |
| 拖拽看板 | 自主看板支持拖拽重排 (react-dnd) |
| 主题系统 | 支持深空蓝 / 暗夜黑 / 极简白三套主题 |

#### 预期结果
- Lighthouse Performance Score > 90
- 8 个模块全部懒加载，首屏只加载当前模块
- GlobalQuotes 1000+ 行数据流畅滚动
- Ctrl+K 搜索 < 200ms 响应

---

### 阶段 6: 生态扩展 — 开放平台

**时间**: 第 13 周起 (持续迭代)  
**目标**: 从工具进化为平台

#### 6.1 插件系统

```typescript
// 插件接口定义
interface YYCPlugin {
  id: string;
  name: string;
  version: string;
  hooks: {
    onMarketData?: (data: MarketAsset[]) => void;
    onAlertTriggered?: (alert: Alert) => void;
    onModuleActivated?: (moduleId: string) => void;
    registerWidget?: () => WidgetDefinition;
    registerStrategy?: () => StrategyDefinition;
  };
}
```

#### 6.2 策略市场

| 功能 | 描述 |
|------|------|
| 策略发布 | 用户可将自己的策略发布到市场 |
| 策略订阅 | 按月/按次付费使用他人策略 |
| 业绩认证 | 链上验证的策略历史业绩 |
| 评价系统 | 用户评分 + 评论 |

#### 6.3 多端扩展

| 平台 | 技术方案 |
|------|---------|
| iOS / Android | Capacitor 封装 PWA |
| 桌面应用 | Tauri (Rust 后端 + Web 前端) |
| CLI 工具 | Node.js 命令行策略回测 |
| API 开放 | RESTful + WebSocket 供第三方接入 |

#### 6.4 量子计算真实化

| 任务 | 描述 |
|------|------|
| IBM Quantum 接入 | Qiskit Runtime API |
| 量子优化器 | VQE / QAOA 组合优化 |
| 量子随机数 | 真量子随机数用于蒙特卡洛模拟 |
| 后量子加密 | CRYSTALS-Kyber / Dilithium 密钥交换 |

#### 预期结果
- 支持第三方插件动态加载
- 策略市场 MVP 上线
- iOS/Android 原生应用发布
- 量子计算从模拟转为真实 IBM Quantum 调用

---

## 四、里程碑与度量指标

| 里程碑 | 阶段 | 关键度量 | 目标值 |
|--------|------|---------|--------|
| M1: 工程化基座 | 1 | tsc 零错误, any < 20, 技术债清零 | 100% |
| M2: 实时数据 | 2 | 行情延迟 < 200ms, 重连 < 30s | 99.9% 可用 |
| M3: AI 可用 | 3 | AI 回答准确率 > 80%, 回测 < 3s | 首版上线 |
| M4: 多用户 | 4 | 注册→使用转化 > 60%, 数据同步 < 1s | 安全审计通过 |
| M5: 极致性能 | 5 | LCP < 1.2s, FPS > 55, 内存 < 150MB | Lighthouse > 90 |
| M6: 生态 MVP | 6 | 插件 API 稳定, 策略市场 10+ 策略 | 开放 Beta |

---

## 五、技术栈演进路线

```
当前 (净启动)                    目标 (成熟平台)
─────────────────────────────────────────────────
React 18                    →    React 19 (Server Components)
Vite 6.3                    →    Vite 7+ (Module Federation)
Mock Data                   →    WebSocket + REST API
localStorage                →    Supabase + IndexedDB
Mock i18n                   →    i18next (完整版)
Canvas 2D                   →    Canvas 2D + WebGL (Three.js 大屏)
单线程计算                   →    Web Worker + WASM (回测)
PWA (基础)                  →    PWA (完整离线 + 后台同步)
单用户                      →    Supabase Auth + RLS
手动测试                    →    Vitest + Playwright E2E
```

---

## 六、风险评估与缓解

| 风险 | 概率 | 影响 | 缓解策略 |
|------|------|------|---------|
| fginspector 环境新限制 | 中 | 高 | 维护 ForwardRef/Fragment 禁用清单，持续回归测试 |
| WebSocket 数据源不稳定 | 中 | 中 | 多源降级 + IndexedDB 缓存 + 模拟数据回退 |
| AI API 成本增长 | 中 | 中 | 本地模型 (Ollama) 备选 + Token 预算控制 |
| 移动端性能瓶颈 | 低 | 中 | Canvas 降级策略 + 虚拟列表 + 懒加载 |
| 量子 API 可用性 | 高 | 低 | 量子模拟器降级 + 经典算法兜底 |
| 安全漏洞 | 低 | 高 | 定期安全审计 + CSP + RLS + 最小权限原则 |

---

*本规划文档将随项目演进按月更新，每阶段完成后进行回顾与调整。*
