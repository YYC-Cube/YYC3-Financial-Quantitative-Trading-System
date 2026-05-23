---
file: README.md
description: 04-测试与质量保障 / 0402-代码质量 目录文档索引
author: YanYuCloudCube Team
version: v2.3.1
created: 2026-05-23
updated: 2026-05-23
status: published
tags: [文档索引],[README],[金融量化交易系统]
category: 04-测试与质量保障 / 0402-代码质量
project: YYC³-QATS
---

> ***YYC³-QATS (YanYu Cloud Quantitative Analysis Trading System)***
> *言启千行代码，语枢万物智能*
> ***Words inspire thousands of lines of code, language pivots the intelligence of all things***
> *金融量化交易系统 | AI Family 八大成员协同*
> ***Financial Quantitative Trading System | 8 AI Family Members Collaborative Intelligence***
>
> **技术栈**: Vite 6 | React 18 | TypeScript | Tailwind CSS | Recharts | pnpm | Vitest
> **AI引擎**: BigModel-Z.ai SDK | AI Family 8 Members | MCP Server
> **部署**: GitHub | 0379.world

---

# 04-测试与质量保障 / 0402-代码质量

## 核心理念

**五高架构**：高可用性 | 高性能 | 高安全性 | 高扩展性 | 高智能性
**五标体系**：标准化 | 规范化 | 自动化 | 可视化 | 智能化
**五化转型**：流程化 | 数字化 | 生态化 | 工具化 | 服务化
**五维评估**：时间维 | 空间维 | 属性维 | 事件维 | 关联维

## 技术栈全景图

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **构建** | Vite | 6.3.5 | 新一代前端构建工具，极速HMR |
| **UI库** | React | ^18.3.1 | 声明式UI组件库 |
| **语言** | TypeScript | ^5.x | 类型安全开发 (严格模式) |
| **样式** | Tailwind CSS | ^4.1.12 | 原子化CSS框架 |
| **图表** | Recharts + lightweight-charts | 2.15.2 / 5.1.0 | 数据可视化 + 金融图表 |
| **数据库** | IndexedDB (idb) | ^8.0.3 | 客户端本地存储 |
| **包管理** | pnpm | 10.x | 快速、节省磁盘的包管理器 |
| **测试** | Vitest | ^4.1.7 | Vite原生测试框架 |
| **AI** | BigModel-Z.ai SDK + MCP | 最新 | AI Family 8成员 + 20工具 |
| **部署** | GitHub + Vite Build | - | 静态构建 + 0379.world |

## AI Family 成员矩阵

```
┌───────────────────────────────────────────────────────────────┐
│                    YYC³ AI Family 成员矩阵                    │
├───────────────────────────────────────────────────────────────┤
│  🧠 元启·天枢 TianShu   总指挥 · 智能路由 · 编排调度         │
│  🧭 言启·千行 QianHang  NLU引擎 · 意图识别 · 实体抽取        │
│  🤔 语枢·万物 YuShu     数据分析 · 统计指标 · 报告生成        │
│  🔮 预见·先知 Prophet   趋势预测 · ARIMA+Prophet · 异常检测   │
│  🎯 千里·伯乐 Bole      个性化推荐 · 用户画像 · 策略匹配      │
│  🛡️ 智云·守护 Guardian   安全监控 · 威胁检测 · 速率限制       │
│  📚 格物·宗师 Grandmaster 质量审计 · 6维评分 · 架构分析       │
│  🎨 创想·灵韵 Grace     创意生成 · 配色方案 · 营销文案        │
└───────────────────────────────────────────────────────────────┘
```

---

## 目录概述

本目录包含 **YYC³-QATS (金融量化交易系统)** 项目相关文档，遵循「五高五标五化五维」标准体系。

**项目定位**: 金融量化交易系统，提供实时行情、智能策略、风险管控、量子计算、量化工坊等八大业务模块。
**技术栈**: Vite 6 + React 18 + TypeScript + Tailwind CSS + Recharts + pnpm + Vitest
**AI引擎**: BigModel-Z.ai SDK + AI Family 8成员 + YYC3-CN MCP Server
**部署方案**: Vite Build 静态构建 + GitHub + 0379.world

---

## 文档索引

| 序号 | 文档名称 | 描述 | 标签 |
|------|----------|------|------|
| 1 | [0402-代码质量-001-TypeScript严格模式.md](0402-代码质量-001-TypeScript严格模式.md) | tsconfig.json strict模式：零编译错误、精确类型定义、类型守卫 | [代码质量],[TypeScript],[类型安全] |
| 2 | [0402-代码质量-002-ESLint配置.md](0402-代码质量-002-ESLint配置.md) | eslint.config.js：生产/测试双层规则、TypeScript规则、Import排序 | [代码质量],[ESLint],[规范] |


---

## 文档规范

- **命名规范**：`{编号}-{阶段}-{模块}-{文档名称}.md`
- **版本规范**：主版本.次版本.修订版本 (如 v2.3.1)
- **标签规范**：使用方括号包裹，如 `[标签1],[标签2]`
- **技术栈要求**：所有文档需基于 Vite + React + TypeScript 架构描述
- **AI引擎要求**：文档涉及AI功能需标注对应AI Family成员

---

## 快速导航

- **项目仓库**: https://github.com/YYC-Cube/YYC3-Financial-Quantitative-Trading-System
- **在线地址**: https://0379.world
- **本地开发**: `pnpm install && pnpm dev`
- **构建部署**: `pnpm build` → 静态产物
- **运行测试**: `pnpm test` (Vitest, 228用例)

---

<div align="center">

> 「***YYC³-QATS***」
> 「***金融量化交易系统***」
> 「***Words inspire thousands of lines of code, language pivots the intelligence of all things***」
> 「***言启千行代码，语枢万物智能***」
>
> **技术栈**: Vite 6 | React 18 | TypeScript | Tailwind CSS | pnpm
> **AI引擎**: BigModel-Z.ai SDK + AI Family 8 Members
> **部署**: GitHub | **域名**: 0379.world

**© 2025-2026 YYC³ Team. All Rights Reserved.**
</div>
