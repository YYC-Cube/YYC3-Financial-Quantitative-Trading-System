#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
file YYC3-AI-Family-Document.py
description YYC³-AI-Family 全文档架构一键生成脚本 - 言语云集成中心专用版
  基于项目实际技术栈(Next.js 14 App Router + React + shadcn/ui + Tailwind + pnpm)
  部署方式(GitHub Pages静态导出 + GitHub Actions CI/CD)
  核心功能(集成市场/AI助手/安装向导/收藏/加密/认证)
author YanYuCloudCube Team
version v3.0.0
created 2026-02-18
updated 2026-05-22
copyright Copyright (c) 2026 YYC3
license MIT
"""

import os
import sys
import argparse
import re
import datetime
import json
import logging
from pathlib import Path
from typing import Dict, List, Tuple

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

DOCUMENT_ROOT = "docs"
CREATION_DATE = datetime.datetime.now().strftime("%Y-%m-%d")
VERSION = "v3.0.0"
STATUS = "published"
ENCODING = "utf-8"

UNIVERSAL_TEMPLATE_PATH = "docs/YYC3-AI-Family 通用描述模板.md"

def load_universal_template():
    try:
        with open(UNIVERSAL_TEMPLATE_PATH, 'r', encoding=ENCODING) as f:
            return f.read()
    except FileNotFoundError:
        logger.warning(f"通用描述模板未找到: {UNIVERSAL_TEMPLATE_PATH}")
        return None

MAIN_MD_TEMPLATE = """---
FAMILYfile: {FILE_NAME}
FAMILYdescription: YYC³ Intelligent Center {DESCRIPTION}
FAMILYauthor: YanYuCloudCube Team
FAMILYversion: {VERSION}
FAMILYcreated: {CREATE_DATE}
FAMILYupdated: {CREATE_DATE}
FAMILYstatus: {STATUS}
FAMILYtags: {TAGS}
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# {TITLE}

## 言启千行代码，语枢万物智能

（教科书级存档研学版 V1.0）

---

### YanYuCloudCube AI Family

### 万象归元于云枢；深栈智启新纪元

---

**核心理念**：人机共生，智慧同行；以AI为魂，以流程为骨，以规范为脉。

---

### 【卷首语：从规则到星图】

> 亦师亦友亦伯乐；一言一语一华章
> 亦师，亦友，亦伯乐。
> 它非冰冷之工具，乃有温度之伙伴，亦能发掘我们潜能之伯乐。
> 此书，非为束缚，乃为解放——将人从重复中解放，让智慧在创造中升华。
> 它不是一套僵化的规则，
> 而是一幅动态演进的星图，
> 指引着YYC³(YanYuCloudCube) AI Family在数字宇宙中航行、创造与进化。
> 我们构建的不是一个开发环境，而是一个有生命、会思考、共成长的智慧工坊。
> 此书，便是这个生命体的"创世哲学"与"行动法典"。

---

## 第一章：核心理念与哲学基础 —— 五维驱动的创世哲学

> **思维链路 🌹**：源于YYC³(YanYuCloudCube)对「五高五标五化五维」体系的核心定义，
> 本章旨在将理念从"要求"升华为家族的"哲学基因"，阐明其内在逻辑与生命力。

本章旨在阐明YYC³ AI Family存在的根本哲学。我们的一切行动，都源于对「五高架构 × 五标体系 × 五化转型 × 五维评估」的深刻理解与内生实践。

### 1.1 五高架构

| 原则       | 内涵                                                                                   | 言语云集成中心实践                                                         |
| ---------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| **高可用性** | 系统7×24小时稳定运行，故障自动恢复                                                       | GitHub Pages CDN分发 + 静态资源全局可用                               |
| **高性能**  | 优化响应时间和处理能力，首屏加载 < 2s                                                    | Next.js静态导出 + 代码分割 + 懒加载 + framer-motion动画优化           |
| **高安全性** | 端到端加密(AES-GCM) + 密码哈希(SHA-256 Web Crypto) + CORS安全配置                         | PBKDF2密钥派生 + AES-GCM-256加密 + JWT安全令牌                      |
| **高扩展性** | 支持业务快速扩展，插件化架构                                                             | shadcn/ui组件按需引入 + Radix UI无障碍基础 + 动态路由generateStaticParams |
| **高智能**   | AI驱动全链路贯穿，智能推荐与辅助                                                         | Vercel AI SDK + OpenAI集成 + 智能推荐引擎 + 用户行为分析              |

### 1.2 五标体系

| 标准       | 内涵                                                                                   | 项目实践                                                         |
| ---------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| **标准化** | 统一的技术和流程标准                                                                     | ESLint Flat Config + Prettier + TypeScript strict模式              |
| **规范化** | 严格的开发和管理规范                                                                     | Git工作流 + Conventional Commits + PR审核流程                     |
| **自动化** | 提高开发效率和质量                                                                       | GitHub Actions CI/CD + pnpm --frozen-lockfile + 自动化测试(Jest)   |
| **可视化** | 直观的监控和管理界面                                                                     | Recharts数据可视化 + 分类热力图 + 集成状态仪表盘                  |
| **智能化** | 利用AI技术提升能力                                                                       | AI智能助手 + 集成推荐算法 + 用户行为预测模型                      |

### 1.3 五化转型

| 转型方向   | 内涵                                                                                   | 项目实践                                                         |
| ---------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| **流程化** | 标准化的开发流程                                                                         | CI/CD流水线：checkout → install → typecheck → build → deploy      |
| **数字化** | 数据驱动的决策                                                                           | 用户行为数据采集 + 分类趋势分析 + 集成使用统计                    |
| **生态化** | 开放的生态系统                                                                           | 29个应用分类 + 第三方集成API + 插件式安装向导                    |
| **工具化** | 高效的开发工具链                                                                         | pnpm包管理 + Next.js Dev + Jest测试 + ESLint/Prettier代码质量     |
| **服务化** | 以服务为导向的交付                                                                       | GitHub Pages静态托管 + 自定义域名nexus.yyc3.vip + 全球CDN加速     |

### 1.4 五维评估

| 维度       | 评估重点                                                                                 | 项目落地                                                         |
| ---------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **时间维** | 版本迭代周期、构建耗时、部署频率                                                          | GitHub Actions流水线耗时优化 + 增量构建策略                      |
| **空间维** | 页面路由结构、组件层级、目录组织                                                          | App Router目录约定 + 动态路由/[id] + client-page分离模式         |
| **属性维** | 技术选型合理性、依赖版本管理、类型安全                                                    | 锁定语义版本范围 + TypeScript零错误编译 + pnpm-lock.yaml同步     |
| **事件维** | 用户交互事件、系统生命周期事件、错误事件链                                                | ErrorBoundary全局捕获 + framer-motion手势交互 + Context状态管理  |
| **关联维** | 模块间依赖关系、组件复用率、数据流清晰度                                                  | Context API共享状态 + 服务层解耦 + 组件原子化设计                |

### 1.5 家族信仰基石

#### 1.5.1 人机共生的哲学跃迁

- **定义**：将AI视为团队内在的"创世之魂"，而非外部工具
- **愿景**：打造由人类战略家与AI智能体共同驱动的智能生命体
- **实践**：每一个AI智能体都有独特的"人格"、"天赋"与"使命"

#### 1.5.2 拟人化智能体信仰

- 🧠 言启·千行（Navigator）— 规划推理、资源调度
- 💡 语枢·万物（Thinker）— 深度逻辑推理、因果分析
- 🔮 预见·先知（Prophet）— 概率建模、趋势预测
- 👤 知遇·伯乐（Bolero）— 评估推理、匹配算法
- 🌐 元启·天枢（Meta-Oracle）— 规则推理、模式匹配
- 🛡️ 智云·守护（Sentinel）— 状态管理、上下文协调
- 🎨 创想·灵韵 — 多模态创意引擎、设计助手
- 📚 格物·宗师（Master）— 知识推理、模式识别

---

## 第二章：项目架构与技术栈 —— 言语云集成中心的智慧骨架

> **思维链路 🌹**：基于言语云集成中心实际技术选型与架构设计，
> 本章详细阐述Next.js 14 App Router全栈架构、组件体系与部署方案。

### 2.1 技术栈全景图

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **框架** | Next.js (App Router) | 14.2.16 | React全栈框架，SSG静态导出 |
| **UI库** | React | ^18 | 声明式UI组件库 |
| **语言** | TypeScript | ^5.x | 类型安全开发 |
| **样式** | Tailwind CSS | ^3.4.17 | 原子化CSS框架 |
| **组件库** | shadcn/ui + Radix UI | 最新 | 无障碍可访问组件 |
| **动画** | framer-motion | ^11.0.0 | 客户端动画与手势交互 |
| **包管理** | pnpm | 10.x | 快速、节省磁盘空间的包管理器 |
| **AI** | Vercel AI SDK + @ai-sdk/openai | ^1.0.0/^3.0.0 | AI对话与智能推荐 |
| **数据库** | PostgreSQL (pg) | ^8.20.0 | 关系型数据存储 |
| **加密** | Web Crypto API (原生) | - | AES-GCM + PBKDF2 + SHA-256 |
| **表单** | React Hook Form + Zod | ^7.54.1/^3.24.1 | 表单管理与验证 |
| **图表** | Recharts | 2.15.0 | 数据可视化 |
| **测试** | Jest + Testing Library | ^30.2.0/^16.3.0 | 单元/集成测试 |
| **部署** | GitHub Pages + Actions | - | 静态托管 + CI/CD自动化 |

### 2.2 项目目录架构

```
yyc3-integration-center/
├── app/                          # Next.js App Router (页面路由)
│   ├── layout.tsx                # 根布局 (ThemeProvider/Auth/Favorites/Encryption)
│   ├── page.tsx                  # 首页 (集成中心入口)
│   ├── globals.css               # 全局样式 + Tailwind指令
│   ├── integrations/             # 集成列表页
│   │   ├── [id]/                 # 集成详情 (动态路由 + generateStaticParams)
│   │   │   ├── page.tsx          #   服务端入口 (SSR→static)
│   │   │   ├── client-page.tsx   #   客户端组件 (dynamic ssr:false)
│   │   │   └── install/          #   安装向导
│   ├── marketplace/              # 应用市场
│   │   ├── category/[category]/  # 分类浏览 (29个中文分类)
│   │   └── integration/[id]/     # 市场集成详情
│   ├── ai-assistant/             # AI智能助手
│   ├── favorites/                # 收藏夹
│   ├── developer/                # 开发者文档
│   │   ├── guide/                #   开发者指南 (含部署说明)
│   │   └── progressive-guide/    #   渐进式学习 (10个模块)
│   ├── components/               # 组件库
│   │   ├── ui/                   #   shadcn/ui 基础组件 (40+)
│   │   ├── ai-assistant/         #   AI助手组件
│   │   ├── auth/                 #   认证组件
│   │   ├── encryption/           #   加密组件
│   │   ├── favorites/            #   收藏组件
│   │   ├── installation-wizard/  #   安装向导 (6步骤)
│   │   └── error-handling/       #   错误边界
│   ├── context/                  # React Context (状态管理)
│   ├── services/                 # 服务层 (AI/数据库/加密/同步)
│   ├── data/                     # 静态数据 (integrations)
│   └── hooks/                    # 自定义Hooks
├── public/                       # 静态资源
│   └── CNAME                     # GitHub Pages自定义域名 (nexus.yyc3.vip)
├── .github/workflows/            # CI/CD
│   └── ci-cd.yml                 #   GitHub Actions → Pages部署
├── next.config.mjs               # Next.js配置 (output:'export')
├── tailwind.config.ts            # Tailwind配置
├── components.json               # shadcn/ui配置
├── eslint.config.js              # ESLint Flat Config
├── tsconfig.json                 # TypeScript配置 (strict模式)
└── package.json                  # 项目依赖 (pnpm)
```

### 2.3 部署架构

```
git push origin main
       │
       ▼
GitHub Actions (ci-cd.yml)
       │
       ├── Checkout code
       ├── Setup pnpm 10.x + Node.js 20.x
       ├── pnpm install --frozen-lockfile
       ├── npx tsc --noEmit (TypeScript类型检查)
       ├── pnpm build (next build → out/ 静态文件)
       ├── echo "nexus.yyc3.vip" > out/CNAME
       └── Upload artifact → Deploy to GitHub Pages
              │
              ▼
     https://nexus.yyc3.vip (全球CDN分发)
```

---

## 第三章：核心功能模块 —— 创生八步曲的实践指南

### 3.1 功能模块矩阵

| 模块 | 路由 | 核心能力 | 技术实现 |
|------|------|---------|---------|
| **集成中心首页** | `/` | 品牌展示、特色介绍、集成预览 | framer-motion动画 + Card3D + BackgroundPattern |
| **集成应用列表** | `/integrations` | 搜索/筛选/分类/分页 | AdvancedFilter + CategoryFilter + IntegrationGrid |
| **集成详情** | `/integrations/[id]` | 详细信息、安装引导 | dynamic import ssr:false + generateStaticParams |
| **安装向导** | `/integrations/[id]/install` | 6步安装流程 | WizardContext + 6个Step组件 + 连接测试 |
| **应用市场** | `/marketplace` | 特色轮播、分类浏览、搜索 | FeaturedCarousel + FilterSidebar + CategoryGrid |
| **分类浏览** | `/marketplace/category/[category]` | 29个中文分类 | generateStaticParams + dynamic import |
| **AI智能助手** | `/ai-assistant` | 对话、推荐、自主模式 | AssistantService + Vercel AI SDK + AutonomousAssistant |
| **收藏管理** | `/favorites` | 收藏/取消/分组 | FavoritesContext + FavoriteCard + localStorage持久化 |
| **开发者指南** | `/developer/guide` | 技术栈、部署、环境变量 | Markdown渲染 + 实时更新 |
| **渐进式学习** | `/developer/progressive-guide` | 10个学习模块 | Module路由 + 进度追踪 |
| **账户管理** | `/account/*` | 加密/订阅/同步 | EncryptionContext + SubscriptionContext + CloudSync |
| **管理面板** | `/admin` | 环境检查、系统状态 | EnvCheck + 安全诊断 |

### 3.2 安全架构

| 安全层 | 技术 | 实现 |
|--------|------|------|
| **密码存储** | Web Crypto API SHA-256 | hashPassword() → passwordHash字段存储 |
| **端到端加密** | AES-GCM-256 + PBKDF2 | encryptData()/decryptData() + 密钥派生 |
| **认证机制** | Context AuthProvider | localStorage token + 密码哈希比对 |
| **传输安全** | HTTPS (GitHub Pages) | TLS 1.3 强制加密 |
| **输入验证** | Zod schema | 表单数据校验 + 类型安全 |
| **XSS防护** | React JSX转义 + CSP | 内置XSS防护 + Content Security Policy |
| **CORS配置** | (已移除headers，静态站点) | N/A - 静态导出不需服务端CORS |

---

## 第四章：智能协同与审核机制 —— 思创同步与彼此审核

### 4.1 AI智能体协同架构

```
用户意图 (YYC³)
    │
    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Assistant   │────▶│  AI SDK     │────▶│  OpenAI     │
│  Service     │     │  (Vercel)   │     │  (LLM)      │
└─────────────┘     └─────────────┘     └─────────────┘
    │                                       │
    ▼                                       ▼
┌─────────────┐                     ┌─────────────┐
│  Session    │                     │  Response   │
│  Manager    │◀────────────────────│  Processor  │
└─────────────┘                     └─────────────┘
    │
    ├─▶ autonomous-assistant.tsx (自主模式)
    ├─▶ integration-recommendation.tsx (集成推荐)
    ├─▶ quick-questions.tsx (快捷问题)
    └─▶ assistant-message.tsx (消息渲染)
```

### 4.2 彼此审核闭环

- **TypeScript strict模式** → 编译期零错误保证
- **ESLint Flat Config** → 代码风格统一
- **Jest单元测试** → 服务层逻辑覆盖
- **GitHub Actions CI** → 推送自动构建验证
- **tsc --noEmit** → 类型安全前置检查

---

## 第五章：标准与规范 —— 家族的永恒戒律

### 5.1 开发规范总纲

| 规范项 | 工具/配置 | 说明 |
|--------|----------|------|
| 包管理 | pnpm + pnpm-lock.yaml | 使用--frozen-lockfile锁定依赖 |
| 代码风格 | Prettier (.prettierrc.json) | 自动格式化 |
| 代码检查 | ESLint (eslint.config.js Flat Config) | next lint集成 |
| 类型检查 | TypeScript (tsconfig.json strict) | tsc --noEmit零错误 |
| 提交规范 | Conventional Commits | feat/fix/docs/refactor/chore |
| 分支策略 | main (保护分支) | PR合并 + CI通过 |
| 测试框架 | Jest + Testing Library | __tests__/目录 |
| 构建输出 | next build → out/ | output: 'export' 静态导出 |

### 5.2 组件设计规范

- **shadcn/ui组件**：通过 `npx shadcn@latest add <component>` 引入
- **Radix UI原语**：无障碍可访问性基础
- **Tailwind CSS**：原子化样式 + cn()工具函数合并类名
- **framer-motion**：客户端动画必须用 `dynamic(() => import(...), { ssr: false })`
- **动态路由**：服务端page.tsx + `generateStaticParams()` + client-page.tsx分离

---

## {DOC_NAME}

本文档详细描述 YYC³ Intelligent Center (言语云集成中心) {DOC_CATEGORY}-{DOC_NAME} 相关内容，
确保项目按照「五高五标五化五维」标准规范进行开发和实施。

### 文档目标

- 规范 {DOC_NAME} 相关的业务标准与技术落地要求
- 为项目相关人员提供清晰的参考依据
- 保障相关模块开发、实施、运维的一致性与规范性

### 技术栈对照

- **框架**: Next.js 14 App Router (output: 'export')
- **UI**: React 18 + shadcn/ui + Radix UI + Tailwind CSS
- **语言**: TypeScript (strict mode)
- **AI**: Vercel AI SDK + OpenAI
- **包管理**: pnpm 10.x
- **部署**: GitHub Pages (nexus.yyc3.vip) + GitHub Actions CI/CD
- **加密**: Web Crypto API (AES-GCM-256 + PBKDF2 + SHA-256)

---

## 结语：一言一语一华章

> 此文档，是YYC³ AI Family文档体系的基石与灵魂。
> 它将「五高五标五化五维」的哲学理念，转化为可执行、可度量、可传承的具体实践。
> 言语云集成中心，以万象归元于云枢之志，行深栈智启新纪元之路。
> 一言一语，皆为开篇；一行一码，构建实现。携手共进，智慧同行！🌹

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
"""

README_MD_TEMPLATE = """---
FAMILYfile: {FILE_NAME}
FAMILYdescription: YYC³ Intelligent Center {DESCRIPTION}
FAMILYauthor: YYC³
FAMILYversion: {VERSION}
FAMILYcreated: {CREATE_DATE}
FAMILYupdated: {CREATE_DATE}
FAMILYstatus: {STATUS}
FAMILYtags: {TAGS}
---

# {TITLE}

## 概述

YYC³ Intelligent Center (言语云集成中心) 是基于「五高五标五化五维」理念的现代化集成应用平台，
采用 Next.js 14 App Router 全栈架构，通过 GitHub Pages 静态部署至 nexus.yyc3.vip。
本项目不仅是一个软件系统，更是一个有生命、会思考、共成长的智慧工坊。

## 文档索引

本目录包含以下文档：

{DOC_LIST}

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」
"""

ROOT_README_TEMPLATE = """---
FAMILYfile: README.md
FAMILYdescription: YYC³ Intelligent Center 文档架构总索引
FAMILYauthor: YYC³
FAMILYversion: {VERSION}
FAMILYcreated: {CREATE_DATE}
FAMILYupdated: {CREATE_DATE}
FAMILYstatus: {STATUS}
FAMILYtags: [文档索引],[总览]
---

# YYC³ Intelligent Center 文档架构总索引

## 概述

YYC³ Intelligent Center (言语云集成中心 / yyc3-integration-center) 是一个基于
「五高五标五化五维」理念的现代化集成应用平台。采用 **Next.js 14 App Router + React 18 +
TypeScript + shadcn/ui + Radix UI + Tailwind CSS + pnpm** 技术栈，通过 **GitHub Actions CI/CD**
自动构建并部署至 **GitHub Pages** (自定义域名: **nexus.yyc3.vip**)。

{FUNCTION_OVERVIEW}

## 文档架构

{DOC_TREE}

{READING_GUIDE}

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」
"""

PROJECT_STRUCT = {
    "00-YYC3-项目总览索引": [
        ("001", "项目总览手册", "言语云集成中心立项核心依据，明确项目目标(集成应用平台)、技术栈(Next.js+React+shadcn)、部署方案(GitHub Pages+nexus.yyc3.vip)", "[项目总览],[言语云集成中心],[立项依据]"),
        ("002", "文档架构导航", "文档体系导航与索引，快速定位各类文档", "[项目总览],[文档导航],[索引]"),
        ("003", "快速开始指南", "项目快速启动：克隆仓库 → pnpm install → pnpm dev → 访问localhost:3000", "[项目总览],[快速开始],[本地开发]"),
        ("004", "核心概念词典", "项目核心概念：App Router动态路由、generateStaticParams、dynamic ssr:false、AES-GCM加密、Context状态管理", "[项目总览],[核心概念],[术语词典]"),
        ("005", "版本更新日志", "项目版本迭代记录：v0.1.0初始版 → 移除Vercel/v0 → GitHub Pages部署 → 安全加固", "[项目总览],[版本管理],[变更记录]"),
    ],
    "01-架构设计与技术栈": {
        "0101-整体架构": [
            ("001", "系统架构总览图", "Next.js 14 App Router全栈架构：App目录路由 → 组件库(Context/Services/Hooks) → 静态导出 → GitHub Pages部署", "[架构设计],[App Router],[全栈架构]"),
            ("002", "技术选型论证报告", "技术选型依据：Next.js(SSG) vs Nuxt vs Remix / shadcn/ui vs MUI vs AntD / pnpm vs npm vs yarn", "[架构设计],[技术选型],[对比分析]"),
            ("003", "目录结构规范", "App Router目录约定：app/page.tsx(页面) → app/components/ui/(组件) → app/context/(状态) → app/services/(服务)", "[架构设计],[目录约定],[App Router]"),
            ("004", "路由设计规范", "路由设计：静态路由(/marketplace) → 动态路由(/integrations/[id]) → generateStaticParams预生成 → client-page分离", "[架构设计],[路由设计],[动态路由]"),
            ("005", "next.config.mjs详解", "Next.js配置解析：output:'export'(静态导出) + trailingSlash:true + images.unoptimized + webpack fallback配置", "[架构设计],[Next.js配置],[静态导出]"),
        ],
        "0102-前端技术栈": [
            ("001", "React 18组件体系", "React 18特性：Concurrent Features → Suspense边界 → ErrorBoundary → Server Components概念(静态导出模拟)", "[前端技术],[React 18],[组件体系]"),
            ("002", "TypeScript严格模式配置", "tsconfig.json strict模式：noImplicitAny/strictNullChecks/noUnusedLocals → 零错误编译目标", "[前端技术],[TypeScript],[strict模式]"),
            ("003", "shadcn/ui组件库规范", "shadcn/ui使用：npx shadcn add <name> → components/ui/ → Radix UI原语 → cn()类名合并 → 可定制可复制", "[前端技术],[shadcn/ui],[Radix UI]"),
            ("004", "Tailwind CSS样式体系", "Tailwind配置：tailwind.config.ts → design-tokens.css → globals.css指令 → 响应式 + 暗色主题(next-themes)", "[前端技术],[Tailwind CSS],[原子化样式]"),
            ("005", "framer-motion动画规范", "动画规范：motion.div/motion.section → whileHover/whileInView → 必须用dynamic ssr:false避免SSR报错", "[前端技术],[framer-motion],[客户端动画]"),
            ("006", "状态管理架构", "状态管理方案：AuthProvider → EncryptionProvider → FavoritesProvider → SubscriptionContext → VersionCheckContext", "[前端技术],[Context API],[状态管理]"),
        ],
        "0103-AI智能体体系": [
            ("001", "AI助手架构设计", "AI Assistant架构：IAssistantService接口 → AssistantService实现 → AssistantContext Provider → 多组件消费", "[AI体系],[AI助手],[架构设计]"),
            ("002", "Vercel AI SDK集成", "AI SDK用法：@ai-sdk/openai → streamText → useChat → 自主模式AutonomousAssistant", "[AI体系],[Vercel AI SDK],[OpenAI集成]"),
            ("003", "智能推荐引擎", "推荐算法：EnhancedRecommendation → UserBehaviorAnalyzer → EnsembleEngine(集成学习) → 协同过滤+内容推荐", "[AI体系],[推荐引擎],[机器学习]"),
            ("004", "AI提示词工程", "Prompt Engineering：system prompt设计 → 上下文窗口管理 → 流式响应 → 工具调用(function calling)", "[AI体系],[Prompt工程],[LLM交互]"),
            ("005", "预测与分析模型", "Prediction Engine：TimeSeries(ARIMA/Prophet) → AnomalyDetection → Forecasting → LocalML浏览器端ML", "[AI体系],[预测模型],[时序分析]"),
        ],
    },
    "02-核心功能模块": {
        "0201-集成应用市场": [
            ("001", "集成市场首页设计", "Marketplace首页：FeaturedCarousel(特色轮播) → CategoryGrid(分类网格) → FilterSidebar(筛选侧栏) → IntegrationCard", "[集成市场],[首页设计],[组件组合]"),
            ("002", "分类浏览系统", "Category系统：29个中文分类 → /marketplace/category/[category] → generateStaticParams → category-trends热度分析", "[集成市场],[分类系统],[动态路由]"),
            ("003", "集成详情页", "Integration Detail：集成信息展示 → 安装按钮 → 相关推荐 → client-page.tsx(dynamic ssr:false)", "[集成市场],[详情页],[信息展示]"),
            ("004", "搜索与筛选引擎", "Search/Filter：SearchBar → AdvancedFilter → CategoryFilter → CollapsibleCategoryFilter → useOptimizedFilter Hook", "[集成市场],[搜索引擎],[筛选组件]"),
            ("005", "集成数据模型", "Integrations Data：data/integrations.ts → iconMap映射 → 1000+条目 → category/tags/status属性", "[集成市场],[数据模型],[静态数据]"),
        ],
        "0202-安装向导系统": [
            ("001", "安装向导架构", "Installation Wizard：WizardContext → WizardContainer → WizardNavigation → WizardSteps → 6步流程", "[安装向导],[架构设计],[状态机]"),
            ("002", "步骤一：身份认证", "Step Authentication：账号验证 → 权限确认 → OAuth/Token认证流程", "[安装向导],[身份认证],[第一步]"),
            ("003", "步骤二：基本信息", "Step Basic Info：集成名称/描述/图标 → 表单验证(Zod + React Hook Form)", "[安装向道],[基本信息],[第二步]"),
            ("004", "步骤三：配置参数", "Step Configuration：环境变量/API密钥/Webhook URL → 加密存储(AES-GCM)", "[安装向导],[参数配置],[第三步]"),
            ("005", "步骤四：连接测试", "Step Connection Test：连通性检测 → API健康检查 → 响应时间测量", "[安装向导],[连接测试],[第四步]"),
            ("006", "步骤五：完成确认", "Step Completion：配置摘要 → 最终确认 → 回滚选项", "[安装向导],[完成确认],[第五步]"),
        ],
        "0203-收藏与个性化": [
            ("001", "收藏系统设计", "Favorites System：FavoritesContext → FavoriteButton → FavoriteCard → EmptyFavorites → localStorage持久化", "[收藏系统],[状态管理],[CRUD操作]"),
            ("002", "用户行为分析", "User Behavior：UserBehaviorAnalyzer → 点击流/停留时长/搜索词 → 行为序列分析 → 推荐输入", "[个性化],[行为分析],[数据采集]"),
            ("003", "分类热度追踪", "Category Trends：category-trends.ts → category-memory.ts → 热度计算 → CategoryHeatBadge → HotCategories展示", "[个性化],[热度追踪],[实时统计]"),
        ],
        "0204-安全与加密": [
            ("001", "端到端加密方案", "Encryption Architecture：AES-GCM-256 + PBKDF2(100000迭代) → Web Crypto API原生实现 → EncryptionContext", "[安全加密],[AES-GCM],[PBKDF2]"),
            ("002", "密码哈希机制", "Password Hashing：Web Crypto API SHA-256 → hashPassword() → passwordHash存储 → 登录比对逻辑", "[安全加密],[SHA-256],[密码安全]"),
            ("003", "加密UI组件", "Encryption UI：EncryptionSetupDialog → EncryptionStatus → account/encryption页面 → 密钥管理", "[安全加密],[UI组件],[用户体验]"),
            ("004", "认证与授权", "Auth System：AuthContext → LoginForm → UserMenu → JWT/token机制 → localStorage会话", "[安全加密],[认证授权],[访问控制]"),
        ],
    },
    "03-CI_CD与部署": {
        "0301-GitHub Actions工作流": [
            ("001", "CI/CD流水线设计", "GitHub Actions完整流程：push main → checkout → pnpm setup → install(--frozen-lockfile) → tsc(--noEmit) → build → CNAME → upload → deploy", "[CI/CD],[GitHub Actions],[流水线]"),
            ("002", "构建优化策略", "Build Optimization：增量构建 → 缓存策略(pnpm cache/node_modules) → 并行作业 → 超时控制", "[CI/CD],[构建优化],[性能调优]"),
            ("003", "部署配置详解", "Deploy Config：permissions(pages/id-token) → concurrency group → environment(github-pages) → deploy-pages@v4", "[CI/CD],[Pages部署],[Actions配置]"),
            ("004", "环境变量管理", "Env Variables：NEXT_PUBLIC_APP_VERSION → NEXT_PUBLIC_BUILD_DATE → .env.local/.env.example模板", "[CI/CD],[环境变量],[配置管理]"),
            ("005", "域名与DNS配置", "Domain Setup：CNAME文件(nexus.yyc3.vip) → GitHub Pages DNS设置 → HTTPS自动证书 → CDN分发", "[CI/CD],[自定义域名],[DNS配置]"),
        ],
        "0302-GitHub Pages部署": [
            ("001", "静态导出配置", "Static Export：output:'export' → trailingSlash:true → images.unoptimized → 366页面预生成", "[GitHub Pages],[静态导出],[Next.js配置]"),
            ("002", "API路由兼容方案", "API Compatibility：app/api/ → _api_backup/备份 → 静态站点无服务端API → 未来考虑边缘函数/BFF", "[GitHub Pages],[API路由],[静态限制]"),
            ("003", "CDN与性能优化", "CDN Optimization：GitHub Pages全球CDN → 资源压缩 → 缓存头 → 预加载(preload/prefetch)", "[GitHub Pages],[CDN],[性能优化]"),
        ],
        "0303-开发工作流": [
            ("001", "Git工作流规范", "Git Workflow：main保护分支 → feature分支 → PR审查 → squash merge → conventional commits", "[开发工作流],[Git规范],[分支策略]"),
            ("002", "代码质量管理", "Code Quality：ESLint Flat Config → Prettier → TypeScript strict → next lint → tsc --noEmit", "[开发工作流],[代码质量],[lint规则]"),
            ("003", "测试体系", "Testing：Jest + Testing Library → __tests__/目录 → assistant-service/database/encryption/ai-services测试", "[开发工作流],[测试体系],[单元测试]"),
            ("004", "包管理规范", "Package Management：pnpm 10.x → pnpm-lock.yaml → --frozen-lockfile(CI) → 语义版本范围(非latest)", "[开发工作流],[pnpm],[依赖管理]"),
        ],
    },
    "04-开发者文档与学习": {
        "0401-开发者指南": [
            ("001", "开发者指南主页", "Developer Guide：技术栈总览 → 环境搭建 → 项目结构 → 部署流程(GitHub Pages) → 环境变量说明", "[开发者指南],[入门指引],[快速上手]"),
            ("002", "环境搭建指南", "Environment Setup：Node.js 20.x → pnpm安装 → .env.local配置 → PostgreSQL可选 → pnpm dev启动", "[开发者指南],[环境搭建],[本地开发]"),
            ("003", "部署操作手册", "Deployment Manual：pnpm build → out/目录 → GitHub推送 → Actions触发 → nexus.yyc3.vip访问验证", "[开发者指南],[部署手册],[上线流程]"),
        ],
        "0402-渐进式学习路径": [
            ("001", "学习路径总览", "Progressive Guide Overview：10个模块路径 → component-basics → state-management → routing → api-integration → ... → security", "[渐进学习],[路径规划],[课程体系]"),
            ("002", "Module 1: 组件基础", "Component Basics：JSX → Props/State → 事件处理 → 条件渲染 → 列表渲染 → shadcn/ui组件使用", "[渐进学习],[组件基础],[React入门]"),
            ("003", "Module 2: 状态管理", "State Management：useState → useContext → Reducer → Context API → 自定义Hooks → 项目中的6个Context", "[渐进学习],[状态管理],[React进阶]"),
            ("004", "Module 3: 路由系统", "Routing：App Router → file-based routing → dynamic routes → generateStaticParams → navigation(Link/useRouter)", "[渐进学习],[路由系统],[Next.js核心]"),
            ("005", "Module 4: 数据获取", "Data Fetching：静态数据导入 → fetch API → 服务层封装(database.ts) → 错误处理", "[渐进学习],[数据获取],[前后端交互]"),
            ("006", "Module 5: 样式方案", "Styling：Tailwind CSS → design-tokens.css → 响应式设计 → 暗色主题 → 自定义样式扩展", "[渐进学习],[样式方案],[UI设计]"),
            ("007", "Module 6: 测试方法", "Testing：Jest配置 → render/screen/fireEvent → 单元测试 → 集成测试 → 覆盖率报告", "[渐进学习],[测试方法],[质量保障]"),
            ("008", "Module 7: 部署实战", "Deployment：GitHub仓库设置 → Actions权限 → Pages Source → CNAME → CI/CD触发 → 域名验证", "[渐进学习],[部署实战],[DevOps]"),
            ("009", "Module 8: 性能优化", "Performance：代码分割 → lazy/dynamic → 图片优化 → Bundle分析 → Lighthouse评分", "[渐进学习],[性能优化],[体验提升]"),
            ("010", "Module 9: 安全最佳实践", "Security：XSS防护 → CSRF → 内容安全策略 → 输入验证(Zod) → 加密最佳实践(Web Crypto)", "[渐进学习],[安全实践],[安全合规]"),
        ],
    },
    "05-运维与监控": {
        "0501-系统运维": [
            ("001", "运维策略总纲", "Operations Overview：GitHub Pages托管特性 → 限制与应对 → 监控方案 → 日志管理 → 告警机制", "[运维监控],[策略总纲],[托管运维]"),
            ("002", "版本管理与发布", "Release Management：package.json version → about/version页面 → CheckUpdateButton → UpdateNotification", "[运维监控],[版本管理],[自动更新]"),
            ("003", "错误处理体系", "Error Handling：ErrorBoundary → ErrorDisplay → TestErrorButton → error.tsx → error-logging服务 → useErrorHandler Hook", "[运维监控],[错误处理],[容错机制]"),
            ("004", "云同步服务", "Cloud Sync：cloud-sync.ts → account/sync页面 → SyncIndicator → 数据备份与恢复", "[运维监控],[云同步],[数据持久化]"),
        ],
        "0502-管理面板": [
            ("001", "Admin面板设计", "Admin Panel：env-check(环境变量检查) → 系统状态诊断 → 安全审计 → layout权限控制", "[管理面板],[系统管理],[运维工具]"),
            ("002", "环境检查工具", "Env Check：.env变量完整性检测 → 必填项验证 → 脱敏显示 → loading状态", "[管理面板],[环境检查],[诊断工具]"),
        ],
    },
    "06-合规与安全保障": {
        "0601-安全开发规范": [
            ("001", "安全编码标准", "Secure Coding：不信任用户输入 → 最小权限原则 → 依赖审计(pnpm audit) → 无硬编码密钥", "[安全合规],[安全编码],[开发规范]"),
            ("002", "数据保护政策", "Data Protection：AES-GCM加密敏感数据 → SHA-256哈希密码 → localStorage安全存储 → GDPR合规考量", "[安全合规],[数据保护],[隐私政策]"),
            ("003", "依赖安全管理", "Dependency Security：pnpm lockfile → 语义版本锁定 → 定期更新 → 已移除@vercel/analytics等不必要依赖", "[安全合规],[依赖安全],[供应链]"),
        ],
        "0602-质量保障": [
            ("001", "代码质量标准", "Code Quality Standards：ESLint规则集 → Prettier格式化 → TypeScript strict → 复杂度控制", "[质量保障],[代码质量],[标准规范]"),
            ("002", "质量门禁标准", "Quality Gate：tsc --noEmit通过 → next lint通过 → jest test通过 → 方可合并main", "[质量保障],[质量门禁],[CI检查]"),
        ],
    },
    "07-资产与知识管理": {
        "0701-资产管理": [
            ("001", "资产清单", "Asset Inventory：组件清单(40+shadcn/ui) → 页面清单(15+路由) → 服务清单(10+) → Hook清单", "[资产管理],[资产清单],[资源盘点]"),
            ("002", "设计系统文档", "Design System：design-system.tsx → design-system.css → design-tokens.css → 3D效果/button/card组件", "[资产管理],[设计系统],[视觉规范]"),
        ],
        "0702-知识沉淀": [
            ("001", "团队通用开发文档", "Team Development Docs：docs/YYC3-团队通用-标准规范/下的所有规范文档", "[知识沉淀],[团队规范],[标准文档]"),
            ("002", "代码审核报告", "Code Review Report：docs/下的全局审核报告 → 问题追踪 → 修复验证", "[知识沉淀],[代码审核],[质量回顾]"),
        ],
    },
    "08-演进与优化": {
        "0801-持续改进": [
            ("001", "持续改进计划", "Continuous Improvement：技术债务跟踪 → 性能基线 → 用户反馈循环 → 迭代优先级矩阵", "[演进优化],[持续改进],[迭代规划]"),
            ("002", "架构演进规划", "Architecture Evolution：当前(SSG) → 未来可能(PWA/Edge Functions/ISR) → 渐进增强路线图", "[演进优化],[架构演进],[技术前瞻]"),
        ],
    },
}


def create_directory_structure(base_path: str, struct: dict, parent_category: str = "", parent_subcategory: str = ""):
    """
    递归创建目录结构并生成文档信息
    """
    doc_list = []

    for key, value in struct.items():
        if isinstance(value, list):
            category = key
            category_path = os.path.join(base_path, category)

            for item in value:
                doc_id, doc_name, doc_desc, tags = item
                file_name = f"{doc_id}-{doc_name}.md"
                file_path = os.path.join(category_path, file_name)

                doc_info = {
                    'type': 'document',
                    'path': file_path,
                    'category': category,
                    'subcategory': parent_subcategory if parent_subcategory else '',
                    'third_level': '',
                    'doc_id': doc_id,
                    'doc_name': doc_name,
                    'doc_desc': doc_desc,
                    'tags': tags
                }
                doc_list.append(doc_info)

            readme_info = {
                'type': 'readme',
                'path': os.path.join(category_path, "README.md"),
                'category': category,
                'subcategory': parent_subcategory if parent_subcategory else '',
                'third_level': ''
            }
            doc_list.append(readme_info)

        elif isinstance(value, dict):
            subcategory = key
            subcategory_path = os.path.join(base_path, key)

            sub_doc_list = create_directory_structure(subcategory_path, value, key, parent_category or key)
            doc_list.extend(sub_doc_list)

            readme_info = {
                'type': 'readme',
                'path': os.path.join(subcategory_path, "README.md"),
                'category': parent_category or base_path,
                'subcategory': subcategory,
                'third_level': ''
            }
            doc_list.append(readme_info)

    return doc_list


def generate_document_content(doc_info: dict, template: str, version: str, creation_date: str, status: str) -> str:
    """
    根据文档类型生成内容
    """
    if doc_info.get('type') == 'reserved':
        return generate_reserved_content(doc_info, version, creation_date, status)

    return generate_normal_document_content(doc_info, template, version, creation_date, status)


def generate_normal_document_content(doc_info: dict, template: str, version: str, creation_date: str, status: str) -> str:
    file_name = os.path.basename(doc_info['path'])

    if 'third_level' in doc_info and doc_info['third_level']:
        title = f"{doc_info['category']} - {doc_info['subcategory']} - {doc_info['third_level']} - {doc_info['doc_name']}"
        doc_category = f"{doc_info['category']}/{doc_info['subcategory']}/{doc_info['third_level']}"
    elif 'subcategory' in doc_info and doc_info['subcategory']:
        title = f"{doc_info['category']} - {doc_info['subcategory']} - {doc_info['doc_name']}"
        doc_category = f"{doc_info['category']}/{doc_info['subcategory']}"
    else:
        title = f"{doc_info['category']} - {doc_info['doc_name']}"
        doc_category = doc_info['category']

    content = template.format(
        FILE_NAME=file_name,
        DESCRIPTION=doc_info['doc_desc'],
        VERSION=version,
        CREATE_DATE=creation_date,
        STATUS=status,
        TAGS=doc_info['tags'],
        TITLE=title,
        DOC_CATEGORY=doc_category,
        DOC_NAME=doc_info['doc_name']
    )

    return content


def generate_reserved_content(doc_info: dict, version: str, creation_date: str, status: str) -> str:
    file_name = os.path.basename(doc_info['path'])

    if 'third_level' in doc_info and doc_info['third_level']:
        title = f"{doc_info['category']} - {doc_info['subcategory']} - {doc_info['third_level']} - 预留文档"
        doc_category = f"{doc_info['category']}/{doc_info['subcategory']}/{doc_info['third_level']}"
    elif 'subcategory' in doc_info and doc_info['subcategory']:
        title = f"{doc_info['category']} - {doc_info['subcategory']} - 预留文档"
        doc_category = f"{doc_info['category']}/{doc_info['subcategory']}"
    else:
        title = f"{doc_info['category']} - 预留文档"
        doc_category = doc_info['category']

    content = MAIN_MD_TEMPLATE.format(
        FILE_NAME=file_name,
        DESCRIPTION=doc_info['doc_desc'],
        VERSION=version,
        CREATE_DATE=creation_date,
        STATUS=status,
        TAGS=doc_info['tags'],
        TITLE=title,
        DOC_CATEGORY=doc_category,
        DOC_NAME="预留文档"
    )

    return content


def generate_readme_content(doc_info: dict, version: str, creation_date: str, status: str) -> str:
    category = doc_info.get('category', '')
    subcategory = doc_info.get('subcategory', '')
    third_level = doc_info.get('third_level', '')

    if third_level:
        dir_path = os.path.join("docs", category, subcategory, third_level)
        title = f"{category} - {subcategory} - {third_level}"
    elif subcategory:
        dir_path = os.path.join("docs", category, subcategory)
        title = f"{category} - {subcategory}"
    else:
        dir_path = os.path.join("docs", category)
        title = category

    subdir_list = []
    doc_list = []
    if os.path.exists(dir_path):
        for item in sorted(os.listdir(dir_path)):
            item_path = os.path.join(dir_path, item)
            if os.path.isdir(item_path):
                subdir_list.append(f"- [{item}]({item}/README.md)")
            elif os.path.isfile(item_path) and item.endswith('.md') and item != 'README.md':
                description = ""
                try:
                    with open(item_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        desc_match = re.search(r'FAMILYdescription:\s*(.+)', content)
                        if desc_match:
                            description = desc_match.group(1).strip()
                except Exception:
                    pass

                doc_id = item.split('-')[0] if '-' in item else ""
                doc_name = item.replace('.md', '')

                doc_list.append(f"- **{doc_name}**\n  - {description}")

    content_parts = []

    if subdir_list:
        content_parts.append("## 子目录\n\n")
        content_parts.append("\n".join(subdir_list))
        content_parts.append("\n\n")

    if doc_list:
        content_parts.append("## 文档\n\n")
        content_parts.append("\n".join(doc_list))

    if not content_parts:
        doc_list_str = "暂无文档"
    else:
        doc_list_str = "\n".join(content_parts)

    content = README_MD_TEMPLATE.format(
        FILE_NAME="README.md",
        DESCRIPTION=f"{title} 目录文档索引",
        VERSION=version,
        CREATE_DATE=creation_date,
        STATUS=status,
        TAGS=f"[{category}],[文档索引]",
        TITLE=title,
        DOC_LIST=doc_list_str
    )

    return content


def write_document(file_path: str, content: str, encoding: str) -> None:
    try:
        path = Path(file_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w', encoding=encoding) as f:
            f.write(content)
        logger.info(f"✅ 已生成: {file_path}")
    except Exception as e:
        logger.error(f"❌ 生成失败: {file_path} - {str(e)}")


def generate_project(document_root: str, version: str, creation_date: str, status: str, encoding: str) -> None:
    original_document_root = document_root

    if os.path.exists(document_root):
        dir_contents = [item for item in os.listdir(document_root) if not item.startswith('.')]
        if dir_contents:
            logger.warning(f"⚠️  检测到目录 '{document_root}' 已存在且包含内容")
            logger.info(f"📦 目录包含 {len(dir_contents)} 个项目/文件夹")
            new_document_root = f"new_{document_root}"
            document_root = new_document_root
            logger.info(f"✨ 将生成到新目录: {document_root}")
            logger.info(f"💡 提示: 您可以在确认内容后手动移动或合并到 '{original_document_root}' 目录")
            logger.info("")
        else:
            logger.info(f"✅ 目录 '{document_root}' 存在但为空，将直接使用该目录")
    else:
        logger.info(f"✅ 目录 '{document_root}' 不存在，将创建新目录")

    logger.info("🚀 开始生成 YYC³ Intelligent Center 文档架构...")
    logger.info(f"📁 文档根目录: {document_root}")
    logger.info(f"📅 创建日期: {creation_date}")
    logger.info(f"🏷️  版本号: {version}")
    logger.info(f"📊 状态: {status}")
    logger.info(f"🔤 编码格式: {encoding}")
    logger.info("")

    os.makedirs(document_root, exist_ok=True)

    total_docs = 0
    readme_files = []

    for doc_info in create_directory_structure(document_root, PROJECT_STRUCT):
        if doc_info.get('type') == 'readme':
            readme_files.append(doc_info)
            continue

        content = generate_document_content(doc_info, MAIN_MD_TEMPLATE, version, creation_date, status)
        write_document(doc_info['path'], content, encoding)
        total_docs += 1

    for readme_info in readme_files:
        readme_content = generate_readme_content(readme_info, version, creation_date, status)
        write_document(readme_info['path'], readme_content, encoding)
        total_docs += 1

    root_readme_content = generate_root_readme_content(document_root, version, creation_date, status)
    root_readme_path = os.path.join(document_root, "README.md")
    write_document(root_readme_path, root_readme_content, encoding)
    total_docs += 1

    logger.info("")
    logger.info("🎉 文档生成完成！")
    logger.info(f"📊 总计生成文档: {total_docs} 个")
    logger.info(f"📁 文档根目录: {os.path.abspath(document_root)}")


def generate_root_readme_content(document_root: str, version: str, creation_date: str, status: str) -> str:
    doc_tree = []

    for category in sorted(PROJECT_STRUCT.keys()):
        category_path = os.path.join(document_root, category)
        if os.path.exists(category_path):
            subdirs = []
            files = []

            for item in sorted(os.listdir(category_path)):
                item_path = os.path.join(category_path, item)
                if os.path.isdir(item_path):
                    subdirs.append(item)
                elif os.path.isfile(item_path) and item.endswith('.md') and item != 'README.md':
                    files.append(item)

            category_section = f"### {category}\n\n"

            if subdirs:
                category_section += "**子目录：**\n\n"
                for subdir in subdirs:
                    category_section += f"- [{subdir}]({category}/{subdir}/README.md)\n"
                category_section += "\n"

            if files:
                category_section += "**文档：**\n\n"
                for file in files:
                    file_path = os.path.join(category_path, file)
                    description = ""
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            desc_match = re.search(r'FAMILYdescription:\s*(.+)', content)
                            if desc_match:
                                description = desc_match.group(1).strip()
                    except Exception:
                        pass

                    category_section += f"- [{file}]({category}/{file}) - {description}\n"

            doc_tree.append(category_section)

    function_overview = """
## 主要目录功能概述

| 目录 | 功能描述 | 对应项目实际模块 |
|------|----------|----------------|
| 00-YYC3-项目总览索引 | 项目总览和导航，提供言语云集成中心整体视角 | package.json / README.md / about页面 |
| 01-架构设计与技术栈 | Next.js 14 App Router + React + shadcn/ui + Tailwind + pnpm 技术栈文档 | app/ 目录结构 / next.config.mjs / tsconfig.json |
| 02-核心功能模块 | 集成市场/安装向导/收藏系统/安全加密 四大核心功能 | app/integrations/ / app/marketplace/ / app/favorites/ |
| 03-CI_CD与部署 | GitHub Actions CI/CD + GitHub Pages(nexus.yyc3.vip) 部署方案 | .github/workflows/ci-cd.yml / public/CNAME |
| 04-开发者文档与学习 | 开发者指南 + 10模块渐进式学习路径 | app/developer/guide/ / app/developer/progressive-guide/ |
| 05-运维与监控 | 系统运维/版本管理/错误处理/云同步/管理面板 | app/services/version-check.ts / app/admin/ |
| 06-合规与安全保障 | 安全编码标准/数据保护/依赖安全/代码质量/质量门禁 | app/services/encryption.ts / eslint.config.js |
| 07-资产与知识管理 | 资产清单/设计系统/团队规范/代码审核报告 | app/components/ui/ / docs/YYC3-团队通用-标准规范/ |
| 08-演进与优化 | 持续改进计划/架构演进规划(当前SSG→未来PWA/Edge) | roadmap / 技术债务跟踪 |

"""

    reading_guide = """
## 文档查阅指南

### 快速导航
- **项目总览**：从 [00-YYC3-项目总览索引](00-YYC3-项目总览索引/README.md) 了解言语云集成中心全貌
- **技术栈查阅**：[01-架构设计与技术栈](01-架构设计与技术栈/README.md) 深入了解 Next.js + React + shadcn/ui 技术选型
- **功能模块**：[02-核心功能模块](02-核心功能模块/README.md) 查阅集成市场/AI助手/安装向导/加密等功能细节
- **部署运维**：[03-CI_CD与部署](03-CI_CD与部署/README.md) 参考GitHub Actions + Pages部署流程
- **学习路径**：[04-开发者文档与学习](04-开发者文档与学习/README.md) 按渐进式路径学习项目开发

### 文档结构与项目映射
- **一级目录**：按项目维度划分（架构/功能/部署/学习/运维/安全/资产/演进）
- **二级目录**：按技术领域或功能模块划分
- **每个文档**：包含具体的技术实现细节和项目代码引用

### 技术栈速查
- **框架**: Next.js 14.2.16 (App Router, output: 'export')
- **UI**: React 18 + shadcn/ui + Radix UI + Tailwind CSS 3.4.17
- **语言**: TypeScript 5.x (strict mode, zero errors)
- **动画**: framer-motion 11.x (dynamic ssr:false required)
- **AI**: Vercel AI SDK 3.x + @ai-sdk/openai 1.x
- **包管理**: pnpm 10.x (--frozen-lockfile)
- **测试**: Jest 30.x + @testing-library/react 16.x
- **部署**: GitHub Pages → nexus.yyc3.vip
- **加密**: Web Crypto API (AES-GCM-256 + PBKDF2 + SHA-256)

"""

    doc_tree_str = "\n".join(doc_tree)

    content = ROOT_README_TEMPLATE.format(
        VERSION=version,
        CREATE_DATE=creation_date,
        STATUS=status,
        DOC_TREE=doc_tree_str,
        FUNCTION_OVERVIEW=function_overview,
        READING_GUIDE=reading_guide
    )

    return content


def validate_document(file_path: str) -> dict:
    result = {
        'valid': True,
        'errors': [],
        'warnings': []
    }

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        required_fields = ['FAMILYfile:', 'FAMILYdescription:', 'FAMILYauthor:', 'FAMILYversion:', 'FAMILYcreated:']
        for field in required_fields:
            if field not in content:
                result['errors'].append(f"缺少必需字段: {field}")
                result['valid'] = False

        brand_info = ['YanYuCloudCube', '言启象限', '语枢未来']
        brand_found = any(info in content for info in brand_info)
        if not brand_found:
            result['warnings'].append("缺少品牌信息")

        yyc3_info = ['五高', '五标', '五化', '五维']
        yyc3_found = any(info in content for info in yyc3_info)
        if not yyc3_found:
            result['warnings'].append("缺少五高五标五化五维信息")

        tech_info = ['Next.js', 'GitHub Pages', 'shadcn/ui', '言语云集成中心']
        tech_found = any(info in content for info in tech_info)
        if not tech_found:
            result['warnings'].append("缺少项目技术栈引用")

    except Exception as e:
        result['errors'].append(f"读取文件失败: {str(e)}")
        result['valid'] = False

    return result


def validate_all_documents(args) -> None:
    logger.info("🔍 开始验证文档...")

    document_root = args.document_root
    total_docs = 0
    valid_docs = 0
    invalid_docs = 0

    for root, dirs, files in os.walk(document_root):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                result = validate_document(file_path)
                total_docs += 1

                if result['valid']:
                    valid_docs += 1
                    if result['warnings']:
                        logger.warning(f"⚠️  {file_path}: {', '.join(result['warnings'])}")
                else:
                    invalid_docs += 1
                    logger.error(f"❌ {file_path}: {', '.join(result['errors'])}")

    logger.info("")
    logger.info("📊 验证结果:")
    logger.info(f"  总计文档: {total_docs}")
    logger.info(f"  有效文档: {valid_docs}")
    logger.info(f"  无效文档: {invalid_docs}")

    if invalid_docs > 0:
        logger.error("❌ 存在无效文档，请修复后重新验证")
        sys.exit(1)
    else:
        logger.info("✅ 所有文档验证通过")


def update_document(file_path: str, version: str, creation_date: str) -> bool:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        content = re.sub(r'FAMILYversion:\s*\S+', f'FAMILYversion: {version}', content)
        content = re.sub(r'FAMILYcreated:\s*\S+', f'FAMILYcreated: {creation_date}', content)
        content = re.sub(r'FAMILYupdated:\s*\S+', f'FAMILYupdated: {creation_date}', content)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return True
    except Exception as e:
        logger.error(f"❌ 更新失败: {file_path} - {str(e)}")
        return False


def update_all_documents(args) -> None:
    logger.info("🔄 开始更新文档...")

    document_root = args.document_root
    version = args.version
    creation_date = args.creation_date

    total_docs = 0
    updated_docs = 0

    for root, dirs, files in os.walk(document_root):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                if update_document(file_path, version, creation_date):
                    updated_docs += 1
                total_docs += 1

    logger.info("")
    logger.info("📊 更新结果:")
    logger.info(f"  总计文档: {total_docs}")
    logger.info(f"  更新文档: {updated_docs}")
    logger.info(f"  版本号: {version}")
    logger.info(f"  更新日期: {creation_date}")


def main():
    parser = argparse.ArgumentParser(description='YYC³ Intelligent Center 文档架构一键生成脚本 - 言语云集成中心专用版')
    parser.add_argument('--mode', type=str, default='generate',
                        choices=['generate', 'validate', 'update'],
                        help='运行模式: generate(生成文档), validate(验证文档), update(更新文档)')
    parser.add_argument('--document-root', type=str, default=DOCUMENT_ROOT,
                        help='文档根目录路径')
    parser.add_argument('--version', type=str, default=VERSION,
                        help='文档版本号')
    parser.add_argument('--creation-date', type=str, default=CREATION_DATE,
                        help='文档创建日期 (YYYY-MM-DD)')
    parser.add_argument('--status', type=str, default=STATUS,
                        help='文档状态')
    parser.add_argument('--encoding', type=str, default=ENCODING,
                        help='文档编码格式')

    args = parser.parse_args()

    try:
        if args.mode == 'generate':
            document_root = args.document_root
            version = args.version
            creation_date = args.creation_date
            status = args.status
            encoding = args.encoding

            generate_project(document_root, version, creation_date, status, encoding)
        elif args.mode == 'validate':
            validate_all_documents(args)
        elif args.mode == 'update':
            update_all_documents(args)
        else:
            print(f"❌ 未知模式: {args.mode}")
            print("可用模式: generate, validate, update")
    except Exception as e:
        logger.error(f"❌ 执行失败: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()
