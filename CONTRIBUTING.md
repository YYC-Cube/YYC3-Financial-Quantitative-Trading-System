# 贡献指南 (Contributing Guide)

感谢您对 **YYC³-QATS** 项目的关注！本文档将指导您如何为项目做出贡献。

---

## 📋 目录

- [🎯 行为准则](#-行为准则)
- [🚀 开始贡献](#-开始贡献)
- [💻 开发流程](#-开发流程)
- [📝 代码规范](#-代码规范)
- [🧪 测试要求](#-测试要求)
- [📤 提交PR](#-提交pr)
- [❓ 常见问题](#-常见问题)

---

## 🎯 行为准则

### 我们的承诺

- ✅ 尊重所有贡献者，无论经验水平
- ✅ 接受建设性批评，保持开放心态
- ✅ 关注对社区最有利的事情
- ✅ 对其他社区成员表示同理心

### 不可接受的行为

- ❌ 使用性化语言或图像
- ❌ 人身攻击或政治攻击
- ❌ 公开或私下骚扰
- ❌ 未经许可发布他人的私人信息

---

## 🚀 开始贡献

### 前置条件

```bash
# 确保已安装以下工具
node --version    # >= 18.x
pnpm --version    # >= 8.x
git --version     # 最新版
```

### Fork与克隆

```bash
# 1. Fork本仓库 (点击GitHub页面右上角Fork按钮)

# 2. 克隆您的fork仓库
git clone https://github.com/YOUR_USERNAME/YYC3-Financial-Quantitative-Trading-System.git
cd YYC3-Financial-Quantitative-Trading-System

# 3. 添加上游远程仓库
git remote add upstream https://github.com/YYC-Cube/YYC3-Financial-Quantitative-Trading-System.git

# 4. 安装依赖
pnpm install
```

### 创建分支

```bash
# 创建功能分支 (使用规范的分支命名)
git checkout -b feature/amazing-feature      # 新功能
git checkout -b fix/fix-bug-description       # Bug修复
git checkout -b docs/update-readme            # 文档更新
git checkout -chore/refactor-module-name      # 重构/优化
```

---

## 💻 开发流程

### 本地开发

```bash
# 启动开发服务器 (端口: 3188)
pnpm dev

# 运行类型检查
pnpm typecheck

# 运行ESLint检查
pnpm lint

# 运行测试套件
pnpm test

# 运行完整质量门禁 (推荐在提交前执行)
./scripts/ci-typescript-quality-gate.sh
```

### 分支策略

```
main (生产分支)
├── develop (开发分支)
│   ├── feature/* (新功能)
│   ├── fix/* (Bug修复)
│   ├── docs/* (文档更新)
│   └── chore/* (重构/工具)
```

### Commit消息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 类型

| 类型 | 描述 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(market): add real-time price chart` |
| `fix` | Bug修复 | `fix(strategy): correct backtest calculation` |
| `docs` | 文档更新 | `docs(readme): update installation guide` |
| `style` | 代码格式 | `style(lint): fix indentation issues` |
| `refactor` | 代码重构 | `refactor(service): simplify API client` |
| `perf` | 性能优化 | `perf(chart): improve rendering speed` |
| `test` | 测试相关 | `test(utils): add coverage for debounce` |
| `chore` | 构建/工具 | `chore(deps): update dependencies` |

#### 示例

```bash
# 正确的commit message
git commit -m "feat(market): add K-line chart with candlestick pattern"

# 带详细说明的commit
git commit -m "fix(risk): resolve memory leak in risk calculator

- Add proper cleanup in useEffect
- Remove unused event listeners
- Optimize array operations

Closes #123"
```

---

## 📝 代码规范

### TypeScript规范

#### 严格模式

项目采用 **TypeScript Strict Mode**：

```typescript
// ✅ 推荐: 明确类型定义
interface User {
  name: string;
  age: number;
}

const user: User = { name: 'Alice', age: 25 };

// ❌ 避免: 隐式any
const user = { name: 'Alice', age: 25 }; // 类型推断可能不准确
```

#### 类型安全最佳实践

```typescript
// ✅ 使用unknown代替any处理用户输入
function processData(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  throw new Error('Invalid input');
}

// ❌ 避免使用as any (除非必要且添加注释)
const result = someFunction() as any; // 仅在测试文件中允许
```

#### 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| **接口** | PascalCase + I前缀 | `IUserService`, `IMarketData` |
| **类型** | PascalCase | `UserType`, `MarketConfig` |
| **组件** | PascalCase | `KLineChart`, `ErrorBoundary` |
| **函数** | camelCase | `fetchData`, `calculateRisk` |
| **变量** | camelCase | `userName`, `isLoading` |
| **常量** | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| **文件名** | kebab-case | `k-line-chart.tsx`, `api-client.ts` |

### React组件规范

#### 函数组件 (必须)

```tsx
// ✅ 正确: 纯函数组件 (净启动架构)
interface Props {
  title: string;
  onClick?: () => void;
}

export function MyComponent({ title, onClick }: Props) {
  return (
    <div className="p-4">
      <h1>{title}</h1>
      {onClick && <button onClick={onClick}>Click me</button>}
    </div>
  );
}
```

#### 错误边界

```tsx
// 所有页面级组件必须包裹ErrorBoundary
export default function MarketPage() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <MarketModule />
    </ErrorBoundary>
  );
}
```

#### Hooks使用

```tsx
// ✅ 自定义Hook命名以use开头
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  return user;
}
```

### 样式规范 (Tailwind CSS)

```tsx
// ✅ 使用Tailwind原子类
<div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">

// ❌ 避免内联样式 (除非动态值)
<div style={{ color: 'red' }}> // 改用 className="text-red-500"
```

---

## 🧪 测试要求

### 测试分层策略

项目采用**分层测试配置**：

| 层级 | 配置文件 | 严格度 | 适用场景 |
|------|----------|--------|----------|
| **生产代码** | `tsconfig.json` | 严格 | 业务逻辑、组件 |
| **测试代码** | `tsconfig.test.json` | 宽松 | 测试文件、Mock数据 |

### 测试编写规范

#### 单元测试示例

```typescript
import { describe, expect, it, vi } from 'vitest';
import { calculateRisk } from './risk-calculator';

describe('calculateRisk', () => {
  it('should calculate risk correctly for valid input', () => {
    const result = calculateRisk({ amount: 1000, volatility: 0.2 });
    
    expect(result.riskScore).toBeGreaterThan(0);
    expect(result.riskLevel).toBeDefined();
  });

  it('should handle edge cases', () => {
    expect(() => calculateRisk({ amount: -100, volatility: 0.5 }))
      .toThrow('Invalid amount');
  });
});
```

#### 组件测试示例

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary', () => {
  it('should render fallback UI when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });
});
```

### 覆盖率目标

| 指标 | 当前 | 目标 | 说明 |
|------|------|------|------|
| **语句覆盖率** | 13.66% | 20%+ | 持续提升中 |
| **分支覆盖率** | 12.36% | 18%+ | 条件判断覆盖 |
| **函数覆盖率** | 9.25% | 15%+ | 公共函数优先 |

### 测试文件位置

```
src/
├── app/
│   ├── services/
│   │   ├── BinanceService.ts
│   │   └── BinanceService.test.ts      # 服务层测试
│   ├── components/
│   │   ├── ErrorBoundary.tsx
│   │   └── ErrorBoundary.test.tsx      # 组件测试
│   └── utils/
│       ├── performance.ts
│       └── performance.test.ts         # 工具函数测试
```

---

## 📤 提交PR

### PR清单

在提交PR前，请确保完成以下检查：

- [ ] 代码通过所有测试 (`pnpm test`)
- [ ] 无TypeScript错误 (`pnpm typecheck`)
- [ ] 无ESLint错误 (`pnpm lint`)
- [ ] 通过质量门禁 (`./scripts/ci-typescript-quality-gate.sh`)
- [ ] 新增功能有对应测试
- [ ] Commit消息符合规范
- [ ] 文档已更新（如需要）

### PR模板

```markdown
## 📝 变更描述
简要描述本次变更的内容和目的

## 🔧 变更类型
- [ ] Bug修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化

## 🧪 测试
- [ ] 已添加单元测试
- [ ] 已添加集成测试
- [ ] 手动测试通过

## 📸 截图 (如适用)
[UI变更请提供截图]

## 🔗 关联Issue
Closes #123
```

### Review流程

1. **自动化检查**: CI/CD自动运行质量门禁
2. **Code Review**: 至少1位维护者审核
3. **修改反馈**: 根据review意见修改
4. **合并**: 通过后由维护者合并到develop/main

---

## ❓ 常见问题

### Q: 如何处理TypeScript strict模式报错？

**A:** 项目区分生产和测试配置：
- 生产代码：严格模式，必须明确类型
- 测试代码：宽松模式，允许灵活性

### Q: 可以使用`as any`吗？

**A:** 
- 生产代码：尽量避免，使用类型断言或类型守卫
- 测试文件：允许但需控制数量（当前目标<12处）

### Q: 如何运行单个测试文件？

```bash
pnpm vitest run src/app/services/BinanceService.test.ts
```

### Q: 如何调试测试？

```bash
# 使用--watch模式
pnpm vitest watch src/app/services/BinanceService.test.ts

# 或者在VS Code中使用Vitest扩展
```

---

## 📞 联系方式

- **Issues**: [GitHub Issues](https://github.com/YYC-Cube/YYC3-Financial-Quantitative-Trading-System/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YYC-Cube/YYC3-Financial-Quantitative-Trading-System/discussions)
- **Email**: admin@0379.email

---

<div align="center">

**感谢您的贡献！🎉**

*YYC³-QATS v1.1.0 | © 2026 YanYuCloudCube™*

</div>
