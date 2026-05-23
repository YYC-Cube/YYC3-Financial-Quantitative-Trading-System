#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
file YYC3-docs.py
description YYC³-QATS 文档模版引擎 - 金融量化交易系统专用文档闭环生成系统
author YanYuCloudCube Team
familyversion v2.3.1
created 2026-03-27
updated 2026-05-23
copyright Copyright (c) 2026 YYC³ Financial Quantitative Trading System
license MIT
"""

import os
import sys
import json
import yaml
import hashlib
import datetime
import argparse
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, field
from enum import Enum
import re

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class DocumentType(Enum):
    MAIN = "main"
    README = "readme"
    ROOT_README = "root_readme"
    RESERVED = "reserved"
    TEMPLATE = "template"
    TECHNICAL = "technical"
    API_DOC = "api_doc"
    DEPLOYMENT = "deployment"
    SECURITY = "security"
    AI_FAMILY = "ai_family"
    TEST = "test"

@dataclass
class DocumentMetadata:
    file_name: str
    description: str
    author: str = "YanYuCloudCube Team"
    familyversion: str = "v2.3.1"
    created: str = field(default_factory=lambda: datetime.datetime.now().strftime("%Y-%m-%d"))
    updated: str = field(default_factory=lambda: datetime.datetime.now().strftime("%Y-%m-%d"))
    status: str = "published"
    tags: List[str] = field(default_factory=list)
    checksum: str = ""
    parent_doc: str = ""
    related_docs: List[str] = field(default_factory=list)

@dataclass
class TemplateConfig:
    template_id: str
    template_name: str
    template_version: str
    template_type: DocumentType
    content_template: str
    variables: Dict[str, Any] = field(default_factory=dict)
    validation_rules: Dict[str, Any] = field(default_factory=dict)

class YYC3TemplateEngine:
    """YYC³-QATS 文档模版引擎 - 金融量化交易系统专用"""

    BRAND_HEADER = """> ***YYC³-QATS (YanYu Cloud Quantitative Analysis Trading System)***
> *言启千行代码，语枢万物智能*
> ***Words inspire thousands of lines of code, language pivots the intelligence of all things***
> *金融量化交易系统 | AI Family 八大成员协同*
> ***Financial Quantitative Trading System | 8 AI Family Members Collaborative Intelligence***
>
> **技术栈**: Vite 6 | React 18 | TypeScript | Tailwind CSS | Recharts | pnpm | Vitest
> **AI引擎**: BigModel-Z.ai SDK | AI Family 8 Members | MCP Server
> **部署**: GitHub | 0379.world"""

    BRAND_FOOTER = """<div align="center">

> 「***YYC³-QATS***」
> 「***金融量化交易系统***」
> 「***Words inspire thousands of lines of code, language pivots the intelligence of all things***」
> 「***言启千行代码，语枢万物智能***」
>
> **技术栈**: Vite 6 | React 18 | TypeScript | Tailwind CSS | pnpm
> **AI引擎**: BigModel-Z.ai SDK + AI Family 8 Members
> **部署**: GitHub | **域名**: 0379.world

**© 2025-2026 YYC³ Team. All Rights Reserved.**
</div>"""

    CORE_PHILOSOPHY = """## 核心理念

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
```"""

    def __init__(self, output_dir: str = "docs"):
        self.output_dir = Path(output_dir)
        self.templates: Dict[str, TemplateConfig] = {}
        self.document_registry: Dict[str, DocumentMetadata] = {}
        self.traceability_chain: List[Dict] = []

    def generate_checksum(self, content: str) -> str:
        return hashlib.sha256(content.encode('utf-8')).hexdigest()[:16]

    def load_template_config(self, config_path: str) -> None:
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config_data = yaml.safe_load(f)
                for template_id, config in config_data.get('templates', {}).items():
                    self.templates[template_id] = TemplateConfig(
                        template_id=template_id,
                        template_name=config.get('name', ''),
                        template_version=config.get('version', 'v1.0.0'),
                        template_type=DocumentType(config.get('type', 'main')),
                        content_template=config.get('content', ''),
                        variables=config.get('variables', {}),
                        validation_rules=config.get('validation', {})
                    )
            logger.info(f"已加载 {len(self.templates)} 个模版配置")
        except FileNotFoundError:
            logger.warning(f"模版配置文件未找到: {config_path}")

    def render_template(self, template_id: str, variables: Dict[str, Any]) -> str:
        if template_id not in self.templates:
            raise ValueError(f"模版不存在: {template_id}")

        template = self.templates[template_id]
        content = template.content_template

        merged_vars = {**template.variables, **variables}

        for key, value in merged_vars.items():
            placeholder = f"{{{{{key}}}}}"
            content = content.replace(placeholder, str(value))

        return content

    def generate_main_document(self, metadata: DocumentMetadata, content_sections: Dict[str, str]) -> str:
        doc_content = f"""---
file: {metadata.file_name}
description: {metadata.description}
author: {metadata.author}
version: {metadata.familyversion}
created: {metadata.created}
updated: {metadata.updated}
status: {metadata.status}
tags: {','.join(metadata.tags)}
category: {metadata.file_name.replace('.md', '').replace('-', ' ')}
language: zh-CN
project: YYC³-QATS (YanYu Cloud Quantitative Analysis Trading System)
tech_stack: Vite 6 | React 18 | TypeScript | Tailwind CSS | pnpm | Vitest
ai_engine: BigModel-Z.ai SDK + AI Family 8 Members + MCP Server
deployment: GitHub + 0379.world
---

{self.BRAND_HEADER}

---

# {metadata.file_name.replace('.md', '').replace('-', ' ')}

{self.CORE_PHILOSOPHY}

---

## 文档概述

{metadata.description}

---

"""
        for section_name, section_content in content_sections.items():
            doc_content += f"## {section_name}\n\n{section_content}\n\n---\n\n"

        doc_content += f"""
## 文档追溯信息

| 属性 | 值 |
|------|-----|
| 文档版本 | {metadata.familyversion} |
| 创建日期 | {metadata.created} |
| 更新日期 | {metadata.updated} |
| 内容校验 | {metadata.checksum} |
| 关联文档 | {', '.join(metadata.related_docs) if metadata.related_docs else '无'} |
| 所属项目 | YYC³-QATS (金融量化交易系统) |
| 技术栈 | Vite 6 | React 18 | TypeScript | Tailwind CSS | pnpm |
| AI引擎 | BigModel-Z.ai SDK + AI Family 8 Members |
| 部署环境 | GitHub + 0379.world |

---

{self.BRAND_FOOTER}
"""
        return doc_content

    def generate_readme_document(self, dir_name: str, doc_list: List[Dict]) -> str:
        doc_table = "| 序号 | 文档名称 | 描述 | 标签 |\n|------|----------|------|------|\n"
        for idx, doc in enumerate(doc_list, 1):
            doc_table += f"| {idx} | [{doc['name']}]({doc['name']}) | {doc['description']} | {doc['tags']} |\n"

        return f"""---
file: README.md
description: {dir_name} 目录文档索引
author: YanYuCloudCube Team
version: v2.3.1
created: {datetime.datetime.now().strftime("%Y-%m-%d")}
updated: {datetime.datetime.now().strftime("%Y-%m-%d")}
status: published
tags: [文档索引],[README],[金融量化交易系统]
category: {dir_name}
project: YYC³-QATS
---

{self.BRAND_HEADER}

---

# {dir_name}

{self.CORE_PHILOSOPHY}

---

## 目录概述

本目录包含 **YYC³-QATS (金融量化交易系统)** 项目相关文档，遵循「五高五标五化五维」标准体系。

**项目定位**: 金融量化交易系统，提供实时行情、智能策略、风险管控、量子计算、量化工坊等八大业务模块。
**技术栈**: Vite 6 + React 18 + TypeScript + Tailwind CSS + Recharts + pnpm + Vitest
**AI引擎**: BigModel-Z.ai SDK + AI Family 8成员 + YYC3-CN MCP Server
**部署方案**: Vite Build 静态构建 + GitHub + 0379.world

---

## 文档索引

{doc_table}

---

## 文档规范

- **命名规范**：`{{编号}}-{{阶段}}-{{模块}}-{{文档名称}}.md`
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

{self.BRAND_FOOTER}
"""

    def generate_traceability_record(self, doc_metadata: DocumentMetadata, action: str) -> Dict:
        return {
            "timestamp": datetime.datetime.now().isoformat(),
            "document": doc_metadata.file_name,
            "action": action,
            "version": doc_metadata.familyversion,
            "checksum": doc_metadata.checksum,
            "author": doc_metadata.author,
            "project": "YYC³-QATS (金融量化交易系统)",
            "tech_stack": "Vite 6 | React 18 | TypeScript | Tailwind CSS | pnpm | Vitest",
            "ai_engine": "BigModel-Z.ai SDK + AI Family 8 Members + MCP Server",
            "deployment": "GitHub + 0379.world"
        }

    def save_document(self, content: str, output_path: str) -> bool:
        try:
            path = Path(output_path)
            path.parent.mkdir(parents=True, exist_ok=True)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            logger.info(f"文档已保存: {output_path}")
            return True
        except Exception as e:
            logger.error(f"保存文档失败: {e}")
            return False

    def validate_document(self, content: str, rules: Dict[str, Any]) -> Tuple[bool, List[str]]:
        errors = []

        if rules.get('require_brand_header', True):
            if 'YYC³' not in content and 'YanYuCloudCube' not in content:
                errors.append("缺少品牌标识头 (YYC³ 或 YanYuCloudCube)")

        if rules.get('require_brand_footer', True):
            if '0379.world' not in content and 'YanYuCloudCube' not in content:
                errors.append("缺少品牌标识尾或部署域名")

        if rules.get('require_metadata', True):
            if not content.startswith('---'):
                errors.append("缺少元数据块")

        if rules.get('min_length', 0) > 0:
            if len(content) < rules['min_length']:
                errors.append(f"文档长度不足: {len(content)} < {rules['min_length']}")

        if rules.get('require_tech_stack', False):
            required_tech = ['React', 'TypeScript', 'Tailwind CSS', 'pnpm']
            missing_tech = [tech for tech in required_tech if tech not in content]
            if missing_tech:
                errors.append(f"缺少必要技术栈关键词: {', '.join(missing_tech)}")

        if rules.get('require_deployment_info', False):
            if '0379.world' not in content and 'GitHub' not in content:
                errors.append("缺少部署信息 (GitHub 或 0379.world)")

        if rules.get('require_ai_family', False):
            ai_keywords = ['AI Family', 'BigModel', '天枢', '千行', '万物', '先知']
            found_any = any(keyword in content for keyword in ai_keywords)
            if not found_any:
                errors.append("缺少AI Family相关信息")

        return len(errors) == 0, errors

    def export_registry(self, output_path: str) -> None:
        registry_data = {
            "export_time": datetime.datetime.now().isoformat(),
            "project_name": "YYC³-QATS (YanYu Cloud Quantitative Analysis Trading System)",
            "project_description": "金融量化交易系统 - 实时行情、智能策略、风险管控、AI Family协同",
            "tech_stack": {
                "build_tool": "Vite 6.3.5",
                "ui_library": "React 18.3.1",
                "language": "TypeScript ^5.x (Strict Mode)",
                "styling": "Tailwind CSS 4.1.12",
                "charts": "Recharts 2.15.2 + lightweight-charts 5.1.0",
                "database": "IndexedDB (idb 8.0.3)",
                "package_manager": "pnpm 10.x",
                "testing": "Vitest 4.1.7 (228 test cases)",
                "ai_engine": "BigModel-Z.ai SDK + AI Family 8 Members + YYC3-CN MCP Server",
                "deployment": "GitHub + 0379.world"
            },
            "ai_family": {
                "total_members": 8,
                "members": [
                    {"id": "tian_shu", "name_cn": "元启·天枢", "name_en": "TianShu", "role": "总指挥", "file": "tian-shu-orchestrator.ts", "lines": 424},
                    {"id": "qian_hang", "name_cn": "言启·千行", "name_en": "QianHang", "role": "NLU引擎", "file": "qian-hang-nlu.ts", "lines": 561},
                    {"id": "yu_shu", "name_cn": "语枢·万物", "name_en": "YuShu", "role": "数据分析", "file": "yu-shu-analysis.ts", "lines": 743},
                    {"id": "prophet", "name_cn": "预见·先知", "name_en": "Prophet", "role": "趋势预测", "file": "prophet-predictor.ts", "lines": 568},
                    {"id": "bole", "name_cn": "千里·伯乐", "name_en": "Bole", "role": "个性化推荐", "file": "bole-recommendation.ts", "lines": 344},
                    {"id": "guardian", "name_cn": "智云·守护", "name_en": "Guardian", "role": "安全监控", "file": "guardian-security.ts", "lines": 379},
                    {"id": "grandmaster", "name_cn": "格物·宗师", "name_en": "Grandmaster", "role": "质量审计", "file": "grandmaster-quality.ts", "lines": 381},
                    {"id": "grace", "name_cn": "创想·灵韵", "name_en": "Grace", "role": "创意生成", "file": "grace-creative.ts", "lines": 287}
                ],
                "sdk": {"name": "BigModel-Z.ai SDK", "file": "bigmodel-sdk.ts", "lines": 359}
            },
            "total_documents": len(self.document_registry),
            "documents": {
                doc_id: {
                    "file_name": meta.file_name,
                    "description": meta.description,
                    "version": meta.familyversion,
                    "checksum": meta.checksum,
                    "tags": meta.tags,
                    "related_docs": meta.related_docs
                }
                for doc_id, meta in self.document_registry.items()
            },
            "traceability_chain": self.traceability_chain
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(registry_data, f, ensure_ascii=False, indent=2)
        logger.info(f"文档注册表已导出: {output_path}")


class DocumentProjectStructure:
    """文档项目结构定义 - 金融量化交易系统专用"""

    PROJECT_STRUCTURE = {
        "00-项目总览索引": {
            "description": "YYC³-QATS 全局视图与导航",
            "documents": [
                {"id": "001", "name": "项目总览手册", "desc": "金融量化交易系统立项核心依据，八大业务模块(行情/策略/风控/量子/数据/工坊/交易/管理)，技术栈(Vite+React+TypeScript+Tailwind+pnpm)", "tags": "[项目总览],[金融量化],[立项依据]"},
                {"id": "002", "name": "文档架构导航", "desc": "文档体系导航与索引，快速定位各类文档", "tags": "[项目总览],[文档导航],[索引]"},
                {"id": "003", "name": "快速开始指南", "desc": "项目快速启动：克隆仓库 → pnpm install → pnpm dev → 访问localhost:5173", "tags": "[项目总览],[快速开始],[本地开发]"},
                {"id": "004", "name": "核心概念词典", "desc": "项目核心概念：AI Family 8成员、BigModel-Z.ai SDK、MCP Server、五高架构、量化交易策略", "tags": "[项目总览],[核心概念],[术语词典]"},
                {"id": "005", "name": "版本更新日志", "desc": "项目版本迭代记录：v1.0.0八大业务模块 → v1.1.0质量体系+658测试 → v2.1.0 AI Family架构 → v2.3.0全员就绪", "tags": "[项目总览],[版本管理],[变更记录]"},
            ]
        },
        "01-架构设计与技术栈": {
            "description": "Vite + React + TypeScript 全栈架构设计",
            "subcategories": {
                "0101-整体架构": {
                    "documents": [
                        {"id": "001", "name": "系统架构总览图", "desc": "Vite+React全栈架构：Vite构建 → React组件库 → AI Family服务层 → BigModel SDK → 静态部署", "tags": "[架构设计],[Vite],[全栈架构]"},
                        {"id": "002", "name": "技术选型论证报告", "desc": "技术选型依据：Vite vs Webpack / React vs Vue / Tailwind vs CSS-in-JS / pnpm vs npm", "tags": "[架构设计],[技术选型],[对比分析]"},
                        {"id": "003", "name": "目录结构规范", "desc": "项目目录约定：src/app/(页面) → src/app/components/(组件) → src/app/services/(服务) → src/app/utils/(工具)", "tags": "[架构设计],[目录约定],[项目结构]"},
                        {"id": "004", "name": "AI Family架构设计", "desc": "8大AI成员矩阵：天枢(编排) + 千行(NLU) + 万物(分析) + 先知(预测) + 伯乐(推荐) + 守护(安全) + 宗师(质量) + 灵韵(创意)", "tags": "[架构设计],[AI Family],[智能体]"},
                        {"id": "005", "name": "Vite配置详解", "desc": "Vite构建配置：React插件、路径别名、环境变量、构建优化、依赖预构建", "tags": "[架构设计],[Vite配置],[构建优化]"},
                    ]
                },
                "0102-前端架构": {
                    "documents": [
                        {"id": "001", "name": "React组件体系设计", "desc": "组件分层：页面组件(Page) → 业务组件(Business) → 通用组件(Common) → 图标组件(SafeIcons 131个纯函数SVG)", "tags": "[前端架构],[React],[组件设计]"},
                        {"id": "002", "name": "Tailwind CSS样式规范", "desc": "Tailwind CSS原子化样式约定：自定义主题、响应式设计、暗色模式、组件样式封装", "tags": "[前端架构],[Tailwind CSS],[样式规范]"},
                        {"id": "003", "name": "图表组件体系", "desc": "Recharts数据可视化 + lightweight-charts金融图表：K线图、分时图、深度图、技术指标图", "tags": "[前端架构],[Recharts],[数据可视化]"},
                        {"id": "004", "name": "状态管理架构", "desc": "React Hooks状态管理：自定义Hooks + Context + IndexedDB本地持久化", "tags": "[前端架构],[React Hooks],[状态管理]"},
                    ]
                },
                "0103-数据层架构": {
                    "documents": [
                        {"id": "001", "name": "IndexedDB数据管理", "desc": "IndexedDB(idb 8.0.3)本地存储方案：交易数据缓存、用户偏好持久化、离线数据支持", "tags": "[数据层],[IndexedDB],[本地存储]"},
                        {"id": "002", "name": "Service Worker PWA架构", "desc": "PWA支持：离线访问、资源缓存策略、后台同步、推送通知", "tags": "[数据层],[PWA],[Service Worker]"},
                    ]
                }
            }
        },
        "02-AI-Family智能引擎": {
            "description": "AI Family八大成员 + BigModel SDK + MCP Server",
            "subcategories": {
                "0201-核心编排层": {
                    "documents": [
                        {"id": "001", "name": "元启·天枢编排器", "desc": "TianShuOrchestrator：智能路由(8种意图)、成员注册、并行执行、降级容错、请求历史监控(424行)", "tags": "[AI Family],[编排器],[天枢]"},
                        {"id": "002", "name": "言启·千行NLU引擎", "desc": "QianHangNLUEngine：8大意图类别、9种实体类型、情感分析、复杂度评估、对话上下文管理(561行)", "tags": "[AI Family],[NLU],[千行]"},
                    ]
                },
                "0202-数据分析层": {
                    "documents": [
                        {"id": "001", "name": "语枢·万物分析引擎", "desc": "YuShuAnalysisEngine：统计指标(15+)、金融指标(Sharpe/Sortino/VaR)、MACD趋势、风险评估、报告生成(743行)", "tags": "[AI Family],[数据分析],[万物]"},
                        {"id": "002", "name": "预见·先知预测服务", "desc": "ProphetPredictorService：Prophet+ARIMA集成预测、ZScore/MA/LevelShift异常检测、精度回测(568行)", "tags": "[AI Family],[预测],[先知]"},
                    ]
                },
                "0203-服务支撑层": {
                    "documents": [
                        {"id": "001", "name": "千里·伯乐推荐引擎", "desc": "BoleRecommendationEngine：用户画像、8种策略模板、教育推荐、组合优化建议(344行)", "tags": "[AI Family],[推荐],[伯乐]"},
                        {"id": "002", "name": "智云·守护安全服务", "desc": "GuardianSecurityService：威胁检测(暴力破解/注入/异常IP)、速率限制、输入净化、行为基线(379行)", "tags": "[AI Family],[安全],[守护]"},
                        {"id": "003", "name": "格物·宗师质量审计", "desc": "GrandmasterQualityAuditor：6维质量评分、代码问题检测、架构分析、性能评估(381行)", "tags": "[AI Family],[质量],[宗师]"},
                        {"id": "004", "name": "创想·灵韵创意服务", "desc": "GraceCreativeService：营销文案(3类)、5套配色方案、布局模板、图像提示词(287行)", "tags": "[AI Family],[创意],[灵韵]"},
                    ]
                },
                "0204-LLM基座": {
                    "documents": [
                        {"id": "001", "name": "BigModel-Z.ai SDK集成", "desc": "BigModelSDK：对话API(chatCompletion)、流式响应(streamChatCompletion)、Mock降级、重试机制、健康监控(359行)", "tags": "[AI引擎],[BigModel],[SDK]"},
                        {"id": "002", "name": "MCP Server工具对接", "desc": "YYC3-CN MCP Server：20个工具映射(代码审查/提示词优化/UI分析/协同编程等)", "tags": "[AI引擎],[MCP],[工具集]"},
                    ]
                }
            }
        },
        "03-八大业务模块": {
            "description": "金融量化交易核心业务功能",
            "subcategories": {
                "0301-市场数据": {
                    "documents": [
                        {"id": "001", "name": "实时行情模块", "desc": "实时行情展示：多交易所数据源(Binance/CoinGecko等)、WebSocket推送、深度图", "tags": "[业务模块],[行情],[实时数据]"},
                        {"id": "002", "name": "历史数据分析", "desc": "历史K线数据、技术指标计算、图表可视化(Recharts + lightweight-charts)", "tags": "[业务模块],[历史数据],[图表]"},
                    ]
                },
                "0302-智能策略": {
                    "documents": [
                        {"id": "001", "name": "AI交易策略", "desc": "AI增强型智能交易策略模块：策略编辑器、智能回测、模拟交易、信号生成", "tags": "[业务模块],[策略],[AI交易]"},
                        {"id": "002", "name": "回测引擎", "desc": "量化策略回测系统：历史数据回放、策略性能评估、风险指标计算", "tags": "[业务模块],[回测],[量化]"},
                    ]
                },
                "0303-风险管控": {
                    "documents": [
                        {"id": "001", "name": "量子风险评估", "desc": "多维风险评估：VaR计算、压力测试、情景分析、风险仪表盘", "tags": "[业务模块],[风险],[评估]"},
                        {"id": "002", "name": "实时风控系统", "desc": "实时监控：止损触发、仓位控制、异常检测、自动告警", "tags": "[业务模块],[风控],[实时监控]"},
                    ]
                }
            }
        },
        "04-测试与质量保障": {
            "description": "Vitest测试框架与228用例体系",
            "subcategories": {
                "0401-测试架构": {
                    "documents": [
                        {"id": "001", "name": "测试架构设计", "desc": "测试分层：单元测试(Vitest) → 集成测试 → 端到端测试，7个测试文件228用例", "tags": "[测试],[Vitest],[架构]"},
                        {"id": "002", "name": "AI Family测试套件", "desc": "228个测试用例覆盖：编排器45 + NLU51 + 集成17 + 分析34 + 预测23 + SDK9 + 成员49", "tags": "[测试],[AI Family],[228用例]"},
                    ]
                },
                "0402-代码质量": {
                    "documents": [
                        {"id": "001", "name": "TypeScript严格模式", "desc": "tsconfig.json strict模式：零编译错误、精确类型定义、类型守卫", "tags": "[代码质量],[TypeScript],[类型安全]"},
                        {"id": "002", "name": "ESLint配置", "desc": "eslint.config.js：生产/测试双层规则、TypeScript规则、Import排序", "tags": "[代码质量],[ESLint],[规范]"},
                    ]
                }
            }
        },
        "05-部署与运维": {
            "description": "构建部署与运维监控",
            "subcategories": {
                "0501-构建部署": {
                    "documents": [
                        {"id": "001", "name": "Vite构建配置", "desc": "Vite生产构建：代码分割、Tree Shaking、资源压缩、静态产物输出", "tags": "[部署],[Vite],[构建]"},
                        {"id": "002", "name": "部署流程", "desc": "部署方案：pnpm build → 静态产物 → GitHub → 0379.world", "tags": "[部署],[GitHub],[0379.world]"},
                    ]
                }
            }
        }
    }


def generate_docs_structure(output_dir: str):
    """根据 DocumentProjectStructure 生成完整文档架构"""
    engine = YYC3TemplateEngine(output_dir)
    structure = DocumentProjectStructure.PROJECT_STRUCTURE
    generated_files: List[str] = []
    all_doc_list: List[Dict] = []

    for section_key, section_data in structure.items():
        section_dir = os.path.join(output_dir, section_key)
        os.makedirs(section_dir, exist_ok=True)

        doc_list = []

        if "documents" in section_data:
            for doc in section_data["documents"]:
                doc_name = f"{section_key.split('-')[0]}-{doc['id']}-{doc['name']}.md"
                doc_path = os.path.join(section_dir, doc_name)
                meta = DocumentMetadata(
                    file_name=doc_name,
                    description=doc['desc'],
                    tags=doc['tags'].replace('[', '').replace(']', '').split(',')
                )
                sections = {
                    "概述": f"本节描述：{doc['desc']}",
                    "详细内容": "> 待补充具体内容（由对应模块负责人完善）",
                    "关联资源": f"- 标签: {doc['tags']}\n- 所属模块: {section_key}"
                }
                content = engine.generate_main_document(meta, sections)
                engine.save_document(content, doc_path)
                doc_list.append({"name": doc_name, "description": doc['desc'], "tags": doc['tags']})
                all_doc_list.append({"name": os.path.join(section_key, doc_name), "description": doc['desc'], "tags": doc['tags']})
                generated_files.append(doc_path)

        if "subcategories" in section_data:
            for sub_key, sub_data in section_data["subcategories"].items():
                sub_dir = os.path.join(section_dir, sub_key)
                os.makedirs(sub_dir, exist_ok=True)

                sub_doc_list = []
                for doc in sub_data.get("documents", []):
                    doc_name = f"{sub_key}-{doc['id']}-{doc['name']}.md"
                    doc_path = os.path.join(sub_dir, doc_name)
                    meta = DocumentMetadata(
                        file_name=doc_name,
                        description=doc['desc'],
                        tags=doc['tags'].replace('[', '').replace(']', '').split(',')
                    )
                    sections = {
                        "概述": f"本节描述：{doc['desc']}",
                        "详细内容": "> 待补充具体内容（由对应模块负责人完善）",
                        "关联资源": f"- 标签: {doc['tags']}\n- 所属模块: {section_key} / {sub_key}"
                    }
                    content = engine.generate_main_document(meta, sections)
                    engine.save_document(content, doc_path)
                    sub_doc_list.append({"name": doc_name, "description": doc['desc'], "tags": doc['tags']})
                    all_doc_list.append({"name": os.path.join(section_key, sub_key, doc_name), "description": doc['desc'], "tags": doc['tags']})
                    generated_files.append(doc_path)

                if sub_doc_list:
                    readme_content = engine.generate_readme_document(f"{section_key} / {sub_key}", sub_doc_list)
                    engine.save_document(readme_content, os.path.join(sub_dir, "README.md"))
                    generated_files.append(os.path.join(sub_dir, "README.md"))

        if doc_list:
            readme_content = engine.generate_readme_document(section_key, doc_list)
            engine.save_document(readme_content, os.path.join(section_dir, "README.md"))
            generated_files.append(os.path.join(section_dir, "README.md"))

    root_readme = engine.generate_readme_document("YYC³-QATS 文档架构", all_doc_list)
    engine.save_document(root_readme, os.path.join(output_dir, "README.md"))
    generated_files.append(os.path.join(output_dir, "README.md"))

    return generated_files


def main():
    parser = argparse.ArgumentParser(description='YYC³-QATS 文档模版引擎 - 金融量化交易系统专用')
    parser.add_argument('--output', '-o', default='docs', help='输出目录')
    parser.add_argument('--config', '-c', default='template_config.yaml', help='模版配置文件')
    parser.add_argument('--validate', '-v', action='store_true', help='验证模式')
    parser.add_argument('--export-registry', '-e', action='store_true', help='导出注册表')
    parser.add_argument('--generate', '-g', action='store_true', help='生成文档架构')
    parser.add_argument('--project', '-p', default='YYC3-Financial-Quantitative-Trading-System', help='项目标识')

    args = parser.parse_args()

    engine = YYC3TemplateEngine(args.output)

    if args.config and os.path.exists(args.config):
        engine.load_template_config(args.config)

    if args.generate:
        logger.info("🏗️ 开始生成文档架构...")
        files = generate_docs_structure(args.output)
        logger.info(f"✅ 已生成 {len(files)} 个文档文件")

    if args.export_registry:
        engine.export_registry(os.path.join(args.output, 'document_registry.json'))

    if args.validate:
        logger.info(f"验证模式已启用 - 项目: {args.project}")

    logger.info("YYC³-QATS 文档模版引擎执行完成 - 金融量化交易系统专用")


if __name__ == '__main__':
    main()
