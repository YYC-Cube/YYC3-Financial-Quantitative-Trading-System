/**
 * @file src/app/utils/test-helpers.ts
 * @description 类型安全测试辅助工具 - 提供安全的私有属性访问和测试工具函数
 * @author Phase3D Optimization
 * @version 1.0.0
 */

/**
 * 类型安全地访问对象的私有属性（用于测试）
 * 使用方法: getPrivateProperty(instance, 'propertyName')
 */
export function getPrivateProperty<T, K extends keyof T>(
  instance: T,
  property: K
): T[K] {
  return (instance as any)[property] as T[K];
}

/**
 * 类型安全地设置对象的私有属性（用于测试）
 * 使用方法: setPrivateProperty(instance, 'propertyName', value)
 */
export function setPrivateProperty<T, K extends keyof T>(
  instance: T,
  property: K,
  value: T[K]
): void {
  (instance as any)[property] = value;
}

/**
 * 类型安全地调用对象的私有方法（用于测试）
 * 使用方法: callPrivateMethod(instance, 'methodName', ...args)
 */
export function callPrivateMethod<T, K extends keyof T, R = any>(
  instance: T,
  method: K,
  ...args: any[]
): R {
  const fn = (instance as any)[method];
  if (typeof fn !== 'function') {
    throw new Error(`${String(method)} is not a function`);
  }
  return fn.call(instance, ...args);
}

/**
 * CoinGeckoService测试辅助接口
 */
export interface CoinGeckoServiceTestAPI {
  getCache(): { data: any[]; fetchedAt: number } | null;
  setCache(cache: { data: any[]; fetchedAt: number } | null): void;
}

/**
 * 创建CoinGeckoService的测试辅助API
 */
export function createCoinGeckoTestHelper(service: any): CoinGeckoServiceTestAPI {
  return {
    getCache: () => getPrivateProperty(service, 'cache'),
    setCache: (cache) => setPrivateProperty(service, 'cache', cache),
  };
}

/**
 * BinanceService测试辅助接口
 */
export interface BinanceServiceTestAPI {
  getTickers(): Map<string, any>;
  getStatus(): string;
  getDestroyed(): boolean;
  getOnUpdate(): any;
  getOnStatusChange(): any;
  setTickers(tickers: Map<string, any>): void;
  getWebSocket(): any;
  getReconnectAttempts(): number;
  getHasEverConnected(): boolean;
  getConnectTimeout(): any;
  getInitialErrored(): boolean;
  getReconnectTimer(): any;
  fallbackToSimulation(): void;
}

/**
 * 创建BinanceService的测试辅助API
 */
export function createBinanceTestHelper(service: any): BinanceServiceTestAPI {
  return {
    getTickers: () => getPrivateProperty(service, 'tickers'),
    getStatus: () => getPrivateProperty(service, 'status'),
    getDestroyed: () => getPrivateProperty(service, 'destroyed'),
    getOnUpdate: () => getPrivateProperty(service, 'onUpdate'),
    getOnStatusChange: () => getPrivateProperty(service, 'onStatusChange'),
    setTickers: (tickers) => setPrivateProperty(service, 'tickers', tickers),
    getWebSocket: () => getPrivateProperty(service, 'ws'),
    getReconnectAttempts: () => getPrivateProperty(service, 'reconnectAttempts'),
    getHasEverConnected: () => getPrivateProperty(service, 'hasEverConnected'),
    getConnectTimeout: () => getPrivateProperty(service, 'connectTimeout'),
    getInitialErrored: () => getPrivateProperty(service, 'initialErrored'),
    getReconnectTimer: () => getPrivateProperty(service, 'reconnectTimer'),
    fallbackToSimulation: () => callPrivateMethod(service, 'fallbackToSimulation'),
  };
}

/**
 * WebSocket客户端测试辅助接口
 */
export interface WebSocketTestAPI {
  getMessageHandlers(): any[];
  setStatus(status: string): void;
  setSubscribedChannels(channels: string[]): void;
}

/**
 * 创建WebSocket客户端的测试辅助API
 */
export function createWebSocketTestHelper(ws: any): WebSocketTestAPI {
  return {
    getMessageHandlers: () => getPrivateProperty(ws, 'messageHandlers') || [],
    setStatus: (status) => setPrivateProperty(ws, 'status', status),
    setSubscribedChannels: (channels) => setPrivateProperty(ws, 'subscribedChannels', channels),
  };
}

/**
 * 性能测量工具
 */
export class PerformanceTimer {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = performance.now();
  }

  stop(): number {
    const duration = performance.now() - this.startTime;
    console.log(`⏱️ [${this.label}] ${duration.toFixed(2)}ms`);
    return duration;
  }

  static measure<T>(label: string, fn: () => T): { result: T; duration: number } {
    const timer = new PerformanceTimer(label);
    const result = fn();
    const duration = timer.stop();
    return { result, duration };
  }
}

/**
 * 异步等待工具
 */
export async function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 等待条件满足（带超时）
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeoutMs = 5000,
  intervalMs = 100
): Promise<boolean> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (await condition()) {
      return true;
    }
    await waitFor(intervalMs);
  }

  return false;
}
