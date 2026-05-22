# 开发手册 (Development Guide)

本手册为 **YYC³-QATS** 项目的开发者提供完整的开发环境配置、工具使用和最佳实践指南。

---

## 📋 目录

- [🛠️ 环境配置](#-环境配置)
- [📁 项目结构](#-项目结构)
- [⚙️ 配置文件详解](#-配置文件详解)
- [🔧 开发工具](#-开发工具)
- [💡 最佳实践](#-最佳实践)
- [🚀 性能优化](#-性能优化)
- [🐛 调试技巧](#-调试技巧)

---

## 🛠️ 环境配置

### 系统要求

| 工具 | 最低版本 | 推荐版本 | 用途 |
|------|----------|----------|------|
| **Node.js** | >= 18.x | >= 20.x LTS | 运行时环境 |
| **pnpm** | >= 8.x | >= 9.x | 包管理器 |
| **Git** | >= 2.x | 最新版 | 版本控制 |
| **VS Code** | >= 1.80 | 最新版 | IDE (推荐) |

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/YYC-Cube/YYC3-Financial-Quantitative-Trading-System.git
cd YYC3-Financial-Quantitative-Trading-System

# 2. 安装依赖
pnpm install

# 3. 验证安装
pnpm dev          # 启动开发服务器
pnpm test         # 运行测试
pnpm typecheck    # 类型检查
```

### VS Code插件推荐

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ZixuanChen.vitest-explorer",
    "ms-python.vscode-pylance",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

保存到 `.vscode/extensions.json`

---

## 📁 项目结构

### 核心目录说明

```
YYC3-Financial-Quantitative-Trading-System/
├── src/app/                    # 源代码根目录
│   ├── App.tsx                 # 应用入口
│   ├── components/             # 可复用组件 (~50个)
│   │   ├── ui/                # shadcn/ui基础组件
│   │   └── layout/            # 布局组件
│   ├── contexts/               # React Context (4个)
│   ├── services/               # 业务服务层 (12+)
│   ├── utils/                  # 工具函数库
│   ├── hooks/                  # 自定义Hooks (11个)
│   └── modules/                # 业务模块 (8大模块)
├── public/                     # 静态资源
├── scripts/                    # CI/CD脚本
├── docs/                       # 项目文档
├── tests/                      # 测试文件 (37个)
├── coverage/                   # 测试覆盖率报告
└── .baseline/                  # 性能基线数据
```

### 文件命名约定

```
组件:        PascalCase.tsx       → KLineChart.tsx
服务:        camelCase.ts         → binanceService.ts
工具:        kebab-case.ts        → date-formatter.ts
Hook:        use*.ts             → useUserData.ts
类型:        *.types.ts           → user.types.ts
常量:        constants.ts         → market.constants.ts
测试:        *.test.ts(x)        → BinanceService.test.ts
配置:        *.config.*           → vite.config.ts
```

---

## ⚙️ 配置文件详解

### TypeScript分层配置

项目采用**生产/测试双层TypeScript配置**：

#### tsconfig.json (生产代码 - 严格)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": false,      // 允许调试变量
    "noUnusedParameters": false,  // 允许未使用参数
    "noImplicitAny": true,        // 禁止隐式any
    "strictNullChecks": true      // 严格null检查
  }
}
```

**适用范围**: 所有非测试文件（`.ts`, `.tsx`）

#### tsconfig.test.json (测试代码 - 宽松)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitReturns": false,
    "strictNullChecks": false,
    "types": ["node", "jsdom", "vitest/globals"]
  },
  "include": ["src/**/*.test.{ts,tsx}"]
}
```

**适用范围**: 测试文件（`*.test.ts`, `*.test.tsx`）

### ESLint分层规则

#### 生产代码规则 (严格)

```javascript
// eslint.config.js
{
  '@typescript-eslint/no-unused-vars': ['error', {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_'
  }],
  '@typescript-eslint/no-explicit-any': 'warn',      // 警告any使用
  '@typescript-eslint/no-non-null-assertion': 'warn' // 警告!操作符
}
```

#### 测试代码规则 (宽松)

```javascript
// eslint.config.js
{
  files: ['src/**/*.test.{ts,tsx}'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',           // 关闭
    '@typescript-eslint/no-explicit-any': 'off',          // 关闭
    '@typescript-eslint/no-non-null-assertion': 'off',    // 关闭
    'no-console': 'off'                                   // 允许console
  },
  globals: { describe, test, expect, it, vi, ... }        // Vitest全局变量
}
```

### Vitest配置

```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,                          // 全局API
    environment: 'jsdom',                   // DOM环境
    setupFiles: ['./src/vitest.d.ts'],     // 类型声明
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      thresholds: {
        statements: 10,                     // 最低10%语句覆盖
        branches: 8,
        functions: 8,
        lines: 10
      }
    }
  }
})
```

---

## 🔧 开发工具

### 常用命令速查

```bash
# 开发相关
pnpm dev              # 启动开发服务器 (localhost:3188)
pnpm build            # 构建生产版本
pnpm preview          # 预览生产构建

# 质量检查
pnpm typecheck        # TypeScript类型检查
pnpm lint             # ESLint检查
pnpm lint:fix         # 自动修复ESLint问题
pnpm test             # 运行所有测试
pnpm test:watch       # 监听模式运行测试
pnpm test:coverage    # 运行测试并生成覆盖率报告

# CI/CD
./scripts/ci-typescript-quality-gate.sh  # 完整质量门禁
./scripts/ci-baseline-monitor.sh         # 性能基线监控

# 代码质量审计
pnpm vitest run src/app/utils/code-quality-auditor.test.ts
```

### VS Code快捷键

| 操作 | macOS | Windows/Linux |
|------|-------|---------------|
| **格式化文档** | `Shift + Option + F` | `Shift + Alt + F` |
| **快速修复** | `Cmd + .` | `Ctrl + .` |
| **转到定义** | `F12` / `Cmd + Click` | `F12` / `Ctrl + Click` |
| **重命名符号** | `F2` | `F2` |
| **终端** | `` Ctrl + ` `` | `` Ctrl + ` `` |
| **命令面板** | `Shift + Cmd + P` | `Shift + Ctrl + P` |
| **重启TS Server** | Cmd+Shift+P → "TS: Restart" | 同左 |

---

## 💡 最佳实践

### TypeScript最佳实践

#### ✅ 推荐：明确类型定义

```typescript
// 接口定义
interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  timestamp: Date;
}

// 类型别名
type OrderSide = 'buy' | 'sell';
type OrderStatus = 'pending' | 'filled' | 'cancelled';

// 泛型函数
function fetchData<T>(url: string): Promise<T> {
  return fetch(url).then(res => res.json());
}

const data = await fetchData<MarketData>('/api/market');
```

#### ❌ 避免：类型不安全写法

```typescript
// 不要这样做
let data: any = {};              // ❌ any滥用
let user = {};                   // ❌ 隐式any
let items = [];                  // ❌ 缺少泛型参数
let config = undefined;          // ❌ 未初始化
```

### React最佳实践

#### 组件设计原则

```tsx
// ✅ 单一职责原则
interface Props {
  title: string;
  value: number;
  onChange?: (value: number) => void;
}

export function MetricCard({ title, value, onChange }: Props) {
  return (
    <div className="bg-slate-800 p-4 rounded-lg">
      <h3 className="text-sm text-gray-400">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
      {onChange && (
        <button onClick={() => onChange(value)}>Edit</button>
      )}
    </div>
  );
}
```

#### Hooks使用模式

```typescript
// 自定义Hook封装业务逻辑
function useMarketData(symbol: string) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetch() {
      try {
        setLoading(true);
        const result = await marketService.fetchData(symbol);
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError(err as Error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetch();
    
    return () => { isMounted = false; }; // 清理函数
  }, [symbol]);

  return { data, loading, error };
}
```

### 错误处理最佳实践

```tsx
// ErrorBoundary使用
export default function StrategyPage() {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-500">策略加载失败</h2>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => window.location.reload()}
            >
              重试
            </button>
          </div>
        </div>
      }
    >
      <StrategyModule />
    </ErrorBoundary>
  );
}
```

---

## 🚀 性能优化

### 代码分割与懒加载

```tsx
import React, { lazy, Suspense } from 'react';

// 懒加载重型组件
const KLineChart = lazy(() => import('./components/KLineChart'));
const PortfolioTreemap = lazy(() => import('./components/PortfolioTreemap'));

function Dashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <KLineChart symbol="BTCUSDT" />
      <PortfolioTreemap data={portfolioData} />
    </Suspense>
  );
}
```

### Memoization优化

```typescript
// 使用useMemo缓存计算结果
const sortedItems = useMemo(
  () => [...items].sort((a, b) => b.value - a.value),
  [items]
);

// 使用useCallback稳定回调函数
const handleClick = useCallback(
  (id: string) => {
    setSelectedId(id);
  },
  [] // 空依赖，不会重建
);
```

### 列表渲染优化

```tsx
// 使用虚拟列表处理大数据量
import { FixedSizeList as List } from 'react-window';

function VirtualizedList({ items }: { items: Item[] }) {
  const Row = ({ index, style }: ListChildComponentProps) => (
    <div style={style} className="flex items-center px-4 border-b">
      <span>{items[index].name}</span>
      <span className="ml-auto">{items[index].value}</span>
    </div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

---

## 🐛 调试技巧

### React DevTools

1. **安装**: Chrome/Firefox扩展 [React Developer Tools](https://react.dev/learn/react-developer-tools)
2. **Components标签页**: 查看组件树和Props/State
3. **Profiler标签页**: 分析渲染性能

### Console调试

```tsx
// 开发环境日志
if (process.env.NODE_ENV === 'development') {
  console.log('[MarketData]', data);           // 数据检查
  console.log('[RenderCount]', renderCount);   // 渲染次数
  console.time('FetchTime');                   // 性能计时
  // ... fetch操作 ...
  console.timeEnd('FetchTime');
}
```

### Vitest调试

```bash
# 运行单个测试文件并进入debug模式
pnpm vitest debug src/app/services/BinanceService.test.ts

# 在VS Code中设置断点后运行
pnpm vitest run --inspect-brk src/app/services/BinanceService.test.ts
```

### 性能分析

```tsx
// 使用React Profiler API
<Profiler id="MarketModule" onRender={(id, phase, actualDuration) => {
  console.log(`[Profiler] ${id} ${phase}: ${actualDuration.toFixed(2)}ms`);
}}>
  <MarketModule />
</Profiler>
```

---

## 📊 当前项目指标

| 指标 | 数值 | 说明 |
|------|------|------|
| **源文件总数** | ~208 (.ts/.tsx) | 包含测试文件 |
| **测试文件数** | 37 | 覆盖率13.66% |
| **测试用例数** | 613 | 全部通过 |
| **执行时间** | 3.41s | 目标<3.5s |
| **as any使用** | 12处 | 较v1.0减少67.6% |
| **TypeScript错误** | 0 | IDE显示0个Error |

---

## 🔗 相关文档

- [README.md](README.md) - 项目概述与快速开始
- [CONTRIBUTING.md](CONTRIBUTING.md) - 贡献指南
- [TESTING.md](TESTING.md) - 测试最佳实践
- [docs/1001-团队规范-001-开发标准.md](docs/1001-团队规范-001-开发标准.md) - 团队规范

---

<div align="center">

**🚀 Happy Coding!**

*YYC³-QATS v1.1.0 Development Guide*

</div>
