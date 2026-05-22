<p align="center">
  <img src="public/Financial-Quantitative.png" alt="YYC³ — AI-driven Quantitative Trading System" width="100%" />
</p>

---

> ***YanYuCloudCube™***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

<p align="center">
  <a href="#-项目概述">概述</a> •
  <a href="#-核心特性">特性</a> •
  <a href="#-技术栈">技术栈</a> •
  <a href="#-系统架构">架构</a> •
  <a href="#-快速开始">开始</a> •
  <a href="#-五维驱动">方法论</a> •
  <a href="#-许可证">许可</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB.svg?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6.svg?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.3.5-646CFF.svg?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PWA-Custom-FF6B6B.svg?style=flat-square" alt="PWA" />
  <a href="https://trading.yyc3.vip">
    <img src="https://img.shields.io/badge/Deploy-trading.yyc3.vip-071425.svg?style=flat-square&logo=github-pages&logoColor=white" alt="Deployment" />
  </a>
</p>

---

## 🎯 项目概述

**YYC3-QATS** (YanYu Cloud Quantitative Analysis Trading System) 是一款面向**专业量化交易者**的全功能 Web 应用，采用**深空蓝 (#071425)** 视觉主题，涵盖从市场数据分析到策略回测、风险管控、量子计算辅助、大数据管理、模型训练部署、实盘交易到系统管理的**完整业务链条**。

### 核心定位

| 维度 | 描述 |
|------|------|
| **目标用户** | 专业量化交易者 / 机构投资者 / 算法交易团队 |
| **应用形态** | SPA + PWA (响应式桌面端 + 移动端) |
| **视觉主题** | 深空蓝 #071425 (Deep Space Blue) |
| **架构范式** | 净启动架构 Clean Boot Architecture |
| **部署方式** | GitHub Pages → trading.yyc3.vip |

### 架构亮点

系统为解决 `fginspector` 运行时环境下 `ForwardRef` 报错问题，采用**净启动架构 (Clean Boot Architecture)**：

- ✅ 彻底移除 `radix-ui`、`lucide-react` 等 ForwardRef 依赖
- ✅ 所有组件均为**纯函数组件**
- ✅ 所有 `React.Fragment` 替换为 `<span className="contents">`
- ✅ **131 个 SafeIcons** 纯函数 SVG 图标库
- ✅ 全局 ErrorBoundary 错误边界保护

---

## ⚡ 核心特性

### 五高架构 (5-High Architecture)

| 高度 | 实现方式 | 关键指标 |
|------|----------|----------|
| **🟢 高可用** | ErrorBoundary + Service Worker 离线降级 | 99.9% 可用性目标 |
| **🔵 高性能** | React.lazy + Suspense 懒加载 + Vite 构建优化 | 首屏 < 2s |
| **🔴 高安全** | CSP 安全策略 + 后量子加密 PQC | OWASP Top 10 合规 |
| **🟡 高扩展** | EventBus 事件总线 + 8 模块插件化 | 支持 N+ 模块扩展 |
| **🟣 高智能** | LLM 多模型服务 + TaskInference AI 引擎 | 15 种 QuickAction |

### 五标体系 (5-Standard System)

```
标准化 ━━━━┓
规范化 ━━━━┫ 自动化 ━━━━┓
          ┃              ┣━━━━ 智能化
可视化 ━━━━┛              ┃
                        工具化 ━━━━┛
```

### 八大业务模块

| 模块 | 子模块数 | 核心功能 |
|------|----------|----------|
| **📊 市场数据** | 5 | 实时行情 / 历史数据 / 智能洞察 / 自主看板 / 数据收藏 |
| **🧠 智能策略** | 5 | 策略编辑 / 智能回测 / 策略优化 / 模拟交易 / 策略管理 |
| **⚠️ 风险管控** | 6 | 量子风险 / 大数据风控 / 实时风控 / 风险预警 / 对冲工具 |
| **⚛️ 量子计算** | 6 | 资源监控 / 算法配置 / 量化应用 / 结果分析 / 加密安全 |
| **🗄️ 数据管理** | 6 | 数据源接入 / 采集清洗 / 存储管理 / 数据处理 / 质量监控 |
| **🤖 量化工坊** | 6 | 模型库 / 智能训练 / 模型评估 / 部署监控 / 自主开发 |
| **💰 交易中心** | 5 | 实盘交易 / 模拟交易 / 交易计划 / 日志统计 / 交易配置 |
| **⚙️ 管理后台** | 6 | 系统配置 / 权限管理 / 日志监控 / 数据备份 / 大屏监控 |

---

## 🛠️ 技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **框架** | React | 18.3.1 | UI 渲染引擎 |
| **语言** | TypeScript | Strict (ES2020) | 类型安全开发 |
| **构建** | Vite | 6.3.5 | 开发服务器 + 生产构建 |
| **样式** | Tailwind CSS | 4.1.12 | 原子化 CSS 框架 |
| **图表** | Recharts | 2.15.2 | 数据可视化 |
| **K线图** | lightweight-charts | 5.1.0+ | 专业金融图表 |
| **3D** | Three.js | 0.182.0 | 三维可视化 |
| **动画** | Motion | 12.23.24 | Framer Motion 封装 |
| **拖拽** | react-dnd | 16.0.1 | 拖放交互 |
| **持久化** | IndexedDB (idb) | 8.0.3 | 本地数据库 |
| **PWA** | Service Worker | 原生 | 离线支持 |

### 依赖统计

```bash
# 核心依赖
dependencies: ~50 packages
devDependencies: ~20 packages

# 总文件数
Source files: ~161 (.ts/.tsx)
Business modules: 8
Sub-menus: 45
Feature pages: ~185
SafeIcons: 131
Context Providers: 4 (Settings → Alert → GlobalData → ModelRegistry)
Custom Hooks: 11
Assets: 12 (6 crypto + 3 stocks + 2 futures + 1 forex)
Pre-built strategies: 6
Default alert rules: 10
Languages: zh-CN / en-US
```

---

## 🏗️ 系统架构

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
│   ├── KLineChart.tsx          # K线图表组件
│   ├── PortfolioTreemap.tsx    # 投资组合矩形树图 (D3)
│   ├── SafeIcons.tsx           # 131个纯函数 SVG 图标
│   ├── SafeMotion.tsx          # Motion 安全封装
│   ├── layout/
│   │   ├── AlertCenter.tsx     # 告警中心面板
│   │   ├── MobileNavigation.tsx # 移动端导航 (Tabbar + Drawer)
│   │   ├── Navbar.tsx          # 顶部导航栏
│   │   ├── SettingsDialog.tsx  # 设置对话框
│   │   └── Sidebar.tsx         # 左侧边栏 (桌面端)
│   └── ui/                     # shadcn/ui 组件库 (~50 组件)
├── contexts/
│   ├── AlertContext.tsx         # 告警引擎 (9种指标阈值)
│   ├── GlobalDataContext.tsx    # 全局数据中枢 (12资产实时模拟)
│   ├── ModelRegistryContext.tsx # AI 模型注册中心
│   └── SettingsContext.tsx      # 设置中心 (语言/颜色方案)
├── services/
│   ├── EventBus.ts             # 全局事件总线 (13 事件类型)
│   ├── LLMService.ts           # AI 多模型统一服务层
│   ├── TaskInferenceService.ts  # 任务推理引擎
│   └── QuickActionsService.ts  # 15 种快捷操作
├── hooks/                       # 自定义 Hooks (11个)
├── modules/                     # 8 大业务模块
│   ├── market/                 # 市场数据
│   ├── strategy/               # 智能策略
│   ├── risk/                   # 风险管控
│   ├── quantum/                # 量子计算
│   ├── bigdata/                # 数据管理
│   ├── model/                  # 量化工坊
│   ├── trade/                  # 交易中心
│   └── admin/                  # 管理后台
├── workers/
│   └── pqc.worker.ts           # 后量子加密 Web Worker
└── data/
    └── navigation.tsx          # 导航配置 (8模块 + 45子菜单)
```

### Provider 嵌套顺序

```
ErrorBoundary (全局错误捕获)
  └── SettingsProvider (语言/主题设置)
      └── AlertProvider (告警引擎)
          └── GlobalDataProvider (数据中枢)
              └── ModelRegistryProvider (AI 模型注册)
                  └── AppContent (应用主体)
```

### 数据流架构

```
┌─────────────────────────────────────────────────────────────┐
│                    EventBus (13 Events)                      │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐        │
│  │Market│Strategy│Risk │Quantum│BigData│Model │Trade │Admin │       │
│  └──┬──┴──┬──┴──┬──┴──┬──┴───┬──┬──┴──┬──┴──┬──┘        │
│     │     │     │     │      │     │     │               │
│     ▼     ▼     ▼     ▼      ▼     ▼     ▼               │
│  ┌─────────────────────────────────────────────┐          │
│  │         CrossModuleBar (跨模块联动)           │          │
│  └──────────────────┬──────────────────────────┘          │
│                     ▼                                     │
│  ┌─────────────────────────────────────────────┐          │
│  │     DataAlertBridge (数据→告警桥接)          │          │
│  └──────────────────┬──────────────────────────┘          │
│                     ▼                                     │
│  ┌─────────────────────────────────────────────┐          │
│  │  AlertCenter (多通道通知)                    │          │
│  │  · 应用内弹窗 · 声音通知 · 振动反馈 · SW推送  │          │
│  └─────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 快速开始

### 前置要求

- **Node.js** >= 18.x
- **pnpm** >= 8.x (推荐包管理器)
- **Git** 最新版

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/YYC-Cube/YYC3-Financial-Quantitative-Trading-System.git
cd YYC3-Financial-Quantitative-Trading-System

# 安装依赖
pnpm install

# 启动开发服务器 (端口: 3188)
pnpm dev

# 构建生产版本
pnpm build

# 运行测试套件 (6 suites, 48 tests)
pnpm test

# 类型检查
pnpm typecheck

# 代码规范检查
pnpm lint
```

### 访问地址

| 环境 | URL | 说明 |
|------|-----|------|
| **本地开发** | <http://localhost:3188> | Vite Dev Server |
| **生产环境** | <https://trading.yyc3.vip> | GitHub Pages |
| **GitHub Pages** | <https://yyc-cube.github.io/>... | 备用域名 |

---

## 🧠 五维驱动方法论 (5-Dimension Framework)

YYC³ 采用**五维评估体系**驱动**五高架构**实现**五标五化**：

| 维度 | 评估维度 | 优化方向 |
|------|----------|----------|
| **⏱️ 时间维** | 开发效率 / 构建性能 / 加载速度 | CI/CD 自动化 + 懒加载优化 |
| **📍 空间维** | 代码组织 / 组件架构 / 资源利用 | 模块化设计 + 手动分包 |
| **🏷️ 属性维** | 性能 / 安全性 / 可维护性 | TypeScript Strict + CSP |
| **🎪 事件维** | 用户交互 / 错误处理 / 状态管理 | EventBus + ErrorBoundary |
| **🔗 关联维** | 组件依赖 / API 集成 / 生态连接 | Provider 层 + 服务抽象 |

### 五化转型路径

```
流程化 ━━━━ 数字化 ━━━━ 生态化 ━━━━ 工具化 ━━━━ 服务化
   ↓           ↓           ↓           ↓           ↓
 规范执行    数据驱动    开放协作    效率提升    价值交付
```

---

## 📊 数据统计

### 代码规模

| 指标 | 数值 |
|------|------|
| 源文件总数 | ~161 (.ts/.tsx) |
| 业务模块 | 8 个 |
| 二级子菜单 | 45 个 |
| 三级功能页 | ~185 个 |
| SafeIcons 图标 | 131 个 |
| Context Provider | 4 个 |
| 自定义 Hook | 11 个 |
| 资产品种 | 12 个 (6 加密 + 3 股票 + 2 期货 + 1 外汇) |
| 预置策略 | 6 个 |
| 默认告警规则 | 10 条 |
| 支持语言 | 2 (中文 / 英文) |

### 测试覆盖

| 套件 | 测试数 | 状态 |
|------|--------|------|
| Theme Colors | 5 | ✅ Passing |
| Constants Validation | 8 | ✅ Passing |
| Circuit Breaker | 12 | ✅ Passing |
| WebSocket Channels | 8 | ✅ Passing |
| API Client Unit | 10 | ✅ Passing |
| API Integration | 5 | ✅ Passing |
| **总计** | **48** | **✅ All Passing** |

---

## 🔒 安全措施

### Content Security Policy

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' blob:;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https://assets.coingecko.com;
  connect-src 'self'
    wss://stream.binance.com:9443
    wss://stream.binance.com:443
    https://api.coingecko.com
    https://api.0379.world
    ws://localhost:3188;
  worker-src 'self' blob:;
```

### 安全头

```html
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
```

---

## 📱 PWA 支持

| 特性 | 实现 |
|------|------|
| **动态 Manifest** | JavaScript 运行时注入 `injectPWAManifest()` |
| **Service Worker** | Stale-While-Revalidate (静态) + Network-First (API) |
| **推送通知** | critical 告警 → SW → `showNotification()` |
| **离线降级** | 缓存静态资源 + 最后数据快照 |
| **安装提示** | `display: standalone`, `orientation: any` |
| **Apple 适配** | apple-mobile-web-app-capable, apple-touch-icon |

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. **Fork** 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 **Pull Request**

### 开发规范

请严格遵守 [YYC³ 团队统一开发标准](docs/1001-团队规范-001-开发标准.md)：

- ✅ YAML Front Matter 元数据
- ✅ TypeScript Strict 模式
- ✅ ESLint + Prettier 代码风格
- ✅ Vitest 单元测试
- ✅ 净启动架构约束 (无 ForwardRef)

---

## 📚 文档索引

| 文档 | 路径 | 描述 |
|------|------|------|
| **开发标准** | [docs/1001-团队规范-001-开发标准.md](docs/1001-团队规范-001-开发标准.md) | YYC³ 团队统一开发标准 |
| **TypeScript 审计** | [docs/TypeScript-Audit-Report.md](docs/TypeScript-Audit-Report.md) | 161 文件全局类型检测 |
| **核心测试用例** | [docs/Core-Test-Cases.md](docs/Core-Test-Cases.md) | 56 个测试用例全覆盖 |
| **功能 API 文档** | [docs/Functional-API-Documentation.md](docs/Functional-API-Documentation.md) | Context API / 组件接口 |
| **拓展规划** | [docs/Expansion-Roadmap.md](docs/Expansion-Roadmap.md) | 6 阶段路线图 + 里程碑 |

---

## 📜 变更日志

### v1.0.0 (2026-05-22) — Production Release

#### Phase A-L 完成

- ✅ **Phase A**: Git 仓库初始化 + 开发标准建立
- ✅ **Phase B**: 项目结构搭建 + 技术栈锁定
- ✅ **Phase C**: 核心架构实现 (Context + Hooks + Services)
- ✅ **Phase D**: 8 大业务模块完整实现
- ✅ **Phase E**: AI 服务集成 (LLM + ModelRegistry + TaskInference)
- ✅ **Phase F**: EventBus 事件总线 + 跨模块联动
- ✅ **Phase G**: 测试体系建设 (Vitest 6 Suites 48 Tests)
- ✅ **Phase H**: CI/CD 流水线 (GitHub Actions 4 Gates)
- ✅ **Phase I**: 生态系统测试 + 覆盖率验证
- ✅ **Phase J**: 文档归档 + 执行日志完善
- ✅ **Phase K**: TypeScript 升级 5.9 → 6.0.3
- ✅ **Phase L**: 生产质量优化 (Build + SEO + Metadata)

#### Phase M: 仓库同步

- ✅ 切换 Remote 到正确仓库 `YYC-Cube/YYC3-Financial-Quantitative-Trading-System`
- ✅ Force Push 覆盖远程仓库
- ✅ 专业化 README 生成 (品牌对齐 + 徽章 + 架构图)

---

## 📄 许可证

本项目采用 **MIT 许可证** - 详见 [LICENSE](LICENSE) 文档。

```
MIT License

Copyright (c) 2026 YanYuCloudCube™ Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

### **「YanYuCloudCube™」**

**言启千行代码，语枢万物智能**

*Words inspire thousands of lines of code, language pivots the intelligence of all things*

**🌐 [trading.yyc3.vip](https://trading.yyc3.vip)** • **📧 <admin@0379.email>** • **🏠 [0379.world](https://0379.world)**

<br>

<p align="center">
  <sub>Built with ❤️ by <strong>YanYuCloudCube™ Team</strong> | Powered by <strong>YYC³ Five-Dimension Framework</strong></sub>
</p>

<p align="center">
  <img src="public/yyc3-icons/favicon/favicon-96x96.png" alt="YYC³ Logo" width="48" height="48" />
</p>

**YYC³-QATS v1.0.0 | © 2026 YanYuCloudCube™ | All Rights Reserved**

</div>
