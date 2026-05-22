# 测试指南 (Testing Guide)

本指南提供 **YYC³-QATS** 项目的完整测试策略、最佳实践和质量保障体系。

---

## 📋 目录

- [🧪 测试架构](#-测试架构)
- [📊 测试分层](#-测试分层)
- [🔧 测试工具链](#-测试工具链)
- [💡 测试编写规范](#-测试编写规范)
- [🎯 覆盖率目标](#-覆盖率目标)
- [⚙️ CI/CD质量门禁](#-cicd质量门禁)
- 📈 性能基准
- ❌ 常见问题

---

## 🧪 测试架构

### 测试金字塔

```
        /\
       /  \     E2E Tests (端到端)
      /────\    少量 (~5%)
     /      \
    /────────\  Integration Tests (集成)
   /          \ 中等 (~25%)
  /────────────\
 /              \
/────────────────\ Unit Tests (单元)
                大量 (~70%)
```

### 当前项目分布

| 类型 | 文件数 | 测试数 | 占比 | 覆盖率 |
|------|--------|--------|------|--------|
| **Unit Tests** | ~20 | ~400 | 65% | 15-30% |
| **Integration Tests** | ~12 | ~180 | 29% | 8-15% |
| **Component Tests** | ~5 | ~33 | 6% | 10-20% |
| **总计** | **37** | **613** | **100%** | **13.66%** |

---

## 📊 测试分层

### 1️⃣ 单元测试 (Unit Tests)

**目标**: 验证独立函数/方法的正确性

#### 示例：工具函数测试

```typescript
// src/app/utils/performance.test.ts
import { describe, expect, it, vi } from 'vitest';
import { debounce, memoize } from './performance';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce function calls', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn(1);
    debouncedFn(2);
    debouncedFn(3);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3); // 只调用最后一次
  });
});

describe('memoize', () => {
  it('should cache results', () => {
    const expensiveFn = vi.fn((x: number) => x * 2);
    const memoized = memoize(expensiveFn);

    expect(memoized(5)).toBe(10);
    expect(memoized(5)).toBe(10);
    expect(expensiveFn).toHaveBeenCalledTimes(1); // 只计算一次
  });
});
```

### 2️⃣ 集成测试 (Integration Tests)

**目标**: 验证模块间协作的正确性

#### 示例：服务层集成测试

```typescript
// src/app/services/integration-e2e.test.ts
import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';
import { BinanceService } from './BinanceService';
import { CoinGeckoService } from './CoinGeckoService';

describe('Market Data Integration', () => {
  let binance: BinanceService;
  let coingecko: CoinGeckoService;

  beforeAll(() => {
    binance = new BinanceService({ apiKey: 'test-key' });
    coingecko = new CoinGeckoService();
  });

  afterAll(async () => {
    await binance.disconnect();
  });

  it('should fetch and merge data from multiple sources', async () => {
    const [binanceData, coingeckoData] = await Promise.all([
      binance.fetchTicker('BTCUSDT'),
      coingecko.getCoinMarketData(['bitcoin'])
    ]);

    expect(binanceData).toHaveProperty('price');
    expect(coingeckoData[0]).toHaveProperty('current_price');

    // 验证数据一致性（价格差异在合理范围内）
    const priceDiff = Math.abs(
      binanceData.price - coingeckoData[0].current_price
    ) / coingeckoData[0].current_price;
    
    expect(priceDiff).toBeLessThan(0.01); // 差异<1%
  });
});
```

### 3️⃣ 组件测试 (Component Tests)

**目标**: 验证UI组件渲染和交互

#### 示例：ErrorBoundary组件测试

```tsx
// src/app/components/ErrorBoundary.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    consoleError.mockClear();
  });

  it('should render children when no error', () => {
    render(
      <ErrorBoundary fallback={<div>Error</div>}>
        <div>Normal Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal Content')).toBeInTheDocument();
  });

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
    expect(consoleError).toHaveBeenCalled(); // 错误被捕获
  });
});
```

---

## 🔧 测试工具链

### 核心技术栈

| 工具 | 版本 | 用途 |
|------|------|------|
| **Vitest** | latest | 测试运行器 |
| **@testing-library/react** | ^14.x | React组件测试 |
| **jsdom** | latest | DOM环境模拟 |
| **vi (Vitest)** | - | Mock/Stub/Spy |

### 配置文件

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/vitest.d.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      exclude: [
        'src/app/**/*.test.{ts,tsx}',
        'src/app/HANDOFF_*.ts',
        'src/app/types/**'
      ]
    }
  }
});
```

### 全局类型声明

```typescript
// src/vitest.d.ts
/// <reference types="vitest/globals" />

declare global {
  var fetch: typeof globalThis.fetch;
  function setTimeout(callback: (...args: any[]) => void, ms: number): NodeJS.Timeout;
}

export {};
```

---

## 💡 测试编写规范

### 命名约定

#### 测试描述格式

```typescript
// ✅ 推荐: 清晰的描述性命名
describe('BinanceService.fetchOrderBook', () => {
  it('should return order book with bids and asks', () => {});
  it('should handle network errors gracefully', () => {});
  it('should retry on rate limit (429)', () => {});
});

// ❌ 避免: 模糊或过于简单的描述
describe('BinanceService', () => {
  it('works', () => {});           // 太模糊
  it('should work correctly', () => {}); // 不具体
});
```

#### 测试用例结构 (AAA模式)

```typescript
it('should calculate risk score based on volatility', () => {
  // Arrange (准备)
  const input = {
    amount: 10000,
    volatility: 0.3, // 高波动性
    timeframe: '1d'
  };
  
  // Act (执行)
  const result = calculateRisk(input);
  
  // Assert (断言)
  expect(result.riskScore).toBeGreaterThan(7); // 高风险
  expect(result.riskLevel).toBe('HIGH');
  expect(result.recommendations).toContain('reduce_position');
});
```

### Mock最佳实践

#### API Mock示例

```typescript
// ✅ 推荐: 使用vi.mock()模块级Mock
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

it('should call API with correct parameters', async () => {
  api.get.mockResolvedValueOnce({ data: { price: 50000 } });
  
  await fetchBitcoinPrice();
  
  expect(api.get).toHaveBeenCalledWith('/api/bitcoin/price');
});
```

#### 全局变量Mock

```typescript
// Mock fetch (浏览器环境)
beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((url) => {
    if (url.includes('/api/market')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMarketData)
      });
    }
    return Promise.reject(new Error('Not found'));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

### 异步测试处理

```typescript
// Promise方式
it('should fetch data asynchronously', async () => {
  const result = await fetchData('/api/data');
  
  expect(result).toBeDefined();
});

// Callbacks + done
it('should handle callbacks', (done) => {
  fetchDataWithCallback('/api/data', (error, data) => {
    expect(error).toBeNull();
    expect(data).toBeDefined();
    done();
  });
});

// Timer Mocking
it('should debounce user input', () => {
  vi.useFakeTimers();
  
  const handler = vi.fn();
  const debounced = debounce(handler, 300);
  
  debounced('input1');
  debounced('input2'); // 快速连续输入
  
  expect(handler).not.toHaveBeenCalled();
  
  vi.advanceTimersByTime(300);
  
  expect(handler).toHaveBeenCalledTimes(1);
  expect(handler).toHaveBeenCalledWith('input2');
  
  vi.useRealTimers();
});
```

---

## 🎯 覆盖率目标

### 当前状态 (v1.1.0)

| 指标 | 当前值 | 目标值 | 状态 |
|------|--------|--------|------|
| **Statements** | 13.66% | 20%+ | ⏳ 进行中 |
| **Branches** | 12.36% | 18%+ | ⏳ 进行中 |
| **Functions** | 9.25% | 15%+ | ⏳ 进行中 |
| **Lines** | 14.02% | 20%+ | ⏳ 进行中 |

### 优先覆盖模块

按业务重要性排序：

| 优先级 | 模块 | 当前覆盖 | 目标 | 原因 |
|--------|------|----------|------|------|
| **P0** | Services (12个) | 25%+ | 40%+ | 核心业务逻辑 |
| **P0** | Utils (工具函数) | 30%+ | 50%+ | 高复用性 |
| **P1** | Components (关键) | 15%+ | 30%+ | 用户交互 |
| **P2** | Hooks (11个) | 10%+ | 25%+ | 状态管理 |
| **P3** | Modules (8个) | 5%+ | 15%+ | 页面功能 |

### 提升覆盖率策略

```bash
# 1. 生成覆盖率报告
pnpm test:coverage

# 2. 查看未覆盖文件
open coverage/index.html

# 3. 针对低覆盖模块添加测试
pnpm vitest run --coverage src/app/services/BinanceService.test.ts

# 4. 监控覆盖率变化趋势
./scripts/ci-baseline-monitor.sh
```

---

## ⚙️ CI/CD质量门禁

### 五步质量检查流程

```
┌─────────────────────────────────────────────────────────┐
│                  TypeScript Quality Gate                 │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ Step 1   │ Step 2   │ Step 3   │ Step 4   │ Step 5      │
│ Prod     │ Test     │ ESLint   │ Tests    │ Coverage    │
│ Type     │ Type     │ Check    │ Run      │ Check       │
│ Check    │ Check    │          │          │             │
├──────────┼──────────┼──────────┼──────────┼─────────────┤
│ 🔴Block  │ 🟡Warn   │ 🔴Block  │ 🔴Block  │ 🟡Warn      │
│ Strict   │ Relaxed  │ Layered  │ 613 Pass │ ≥12%        │
└──────────┴──────────┴──────────┴──────────┴─────────────┘
```

### 执行质量门禁

```bash
# 完整质量门禁
./scripts/ci-typescript-quality-gate.sh

# 输出示例:
# ✅ Production Type Check: PASS (0 errors)
# ✅ Test Type Check: PASS (0 errors)  
# ✅ ESLint Check: PASS (0 errors)
# ✅ Test Execution: PASS (613/0)
# ✅ Coverage: PASS (13.66% ≥ 12%)
#
# Overall: ✅ SUCCESS
```

### GitHub Actions集成

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run quality gate
        run: ./scripts/ci-typescript-quality-gate.sh
      
      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: coverage-report
          path: coverage/
```

---

## 📈 性能基准

### 执行时间基线

| 场景 | 基线时间 | 当前时间 | 状态 |
|------|----------|----------|------|
| **全量测试** | < 4.0s | 3.41s | ✅ 优秀 |
| **TypeCheck** | < 10s | ~8s | ✅ 通过 |
| **ESLint** | < 15s | ~12s | ✅ 通过 |
| **Build** | < 60s | ~45s | ✅ 优秀 |

### 监控脚本

```bash
# 运行性能监控
./scripts/ci-baseline-monitor.sh

# 输出JSON报告到 .baseline/report_TIMESTAMP.json
```

---

## ❌ 常见问题

### Q: `global is not defined` 错误？

**A**: 已通过 `src/vitest.d.ts` 解决，确保vitest.config.ts包含：
```javascript
setupFiles: ['./src/vitest.d.ts']
```

### Q: 如何处理`as any`类型断言？

**A**: 
- 生产代码：避免使用，使用类型守卫或明确接口
- 测试代码：允许但控制数量（当前12处）

### Q: 测试太慢怎么办？

**优化建议**:
1. 使用 `vi.mock()` 替代真实API调用
2. 并行运行独立测试 (`--threads`)
3. 使用 `vi.useFakeTimers()` 加速定时器测试
4. 减少不必要的DOM操作

### Q: 覆盖率报告在哪里？

```bash
# 生成HTML报告
pnpm test:coverage

# 打开报告
open coverage/index.html
```

---

## 🔗 相关文档

- [CONTRIBUTING.md](CONTRIBUTING.md) - 贡献指南中的测试要求
- [DEVELOPMENT.md](DEVELOPMENT.md) - 开发手册中的调试技巧
- [README.md](README.md) - 项目概述与快速开始

---

<div align="center">

**🧪 Testing is not about finding bugs, it's about preventing them!**

*YYC³-QATS v1.1.0 Testing Guide*

</div>
