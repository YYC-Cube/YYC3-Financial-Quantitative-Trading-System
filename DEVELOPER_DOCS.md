# YYC-QATS 开发者文档 (Architecture Documentation)

## 项目概述
言语云量化分析交易系统 (YYC-QATS) 是一套高性能、深空蓝主题的专业级数字资产量化交易平台。系统采用 React + D3.js + Tailwind CSS 构建，强调极速响应与深度数据可视化。

## 核心架构原则
1. **状态驱动导航**: 弃用传统路由，采用自定义 State 驱动的模块切换机制。
2. **严禁依赖第三方 UI**: 不允许使用 `forwardRef` 相关组件及 Radix UI 等库，确保底层可控性。
3. **全局数据总线**: 通过 `GlobalDataContext` 实现跨模块通讯，利用 `globalThis` 缓存 Context 引用解决 HMR 导致的引用丢失问题。
4. **内联渲染分发**: 业务模块子页面通过主模块内的 `switch` 逻辑进行渲染分发。

## 目录结构
- `/src/app/App.tsx`: 核心入口与模块分发器。
- `/src/app/modules/`: 业务模块 (市场、策略、风险、量化、大数据、模型、交易、管理)。
- `/src/app/contexts/`: 全局上下文管理。
- `/src/app/components/`: 公共 UI 组件与布局。
- `/src/app/api/`: 接口定义与 Mock 服务。

## 技术细节
- **图标系统**: 采用自定义 SVG 图标，规避 Lucide-React 等库在特定环境下产生的 ForwardRef 兼容性问题。
- **性能优化**: 针对 D3.js 图表采用 RequestAnimationFrame 进行频率控制。
- **PWA 支持**: 动态注入 Web Manifest，支持离线图标与通知。

## 故障排查 (Troubleshooting)
若遇到 `Failed to fetch dynamically imported module`，请检查：
1. `App.tsx` 中的 import 路径是否准确。
2. 是否存在循环引用。
3. 检查控制台网络面板确认具体的 404 文件。
