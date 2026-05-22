/**
 * @file src/app/services/APIService.ts
 * @description Unified API Integration & Real-time Data System - Phase 3.2
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags api,websocket,real-time,typescript,singleton,critical,public
 * @depends @/app/types,@/app/utils
 *
 * Core Capabilities:
 * - RESTful API Client (unified request/response handling)
 * - WebSocket Manager (real-time market data streaming)
 * - Data Cache Layer (intelligent caching with TTL)
 * - Rate Limiter (API quota management)
 * - Error Handler (retry logic + circuit breaker)
 * - Request Queue (priority-based execution)
 */

// ═══════════════════════════════════════════════════════
// Type Definitions
// ═══════════════════════════════════════════════════════

interface ApiConfig {
  baseURL: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  timestamp: number;
  duration: number; // ms
}

interface ApiError {
  message: string;
  code: string;
  status?: number;
  details?: any;
  retryable: boolean;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: HttpMethod;
  body?: any;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean | number; // false or TTL in seconds
  priority?: 'high' | 'normal' | 'low';
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

interface WsMessage {
  type: 'data' | 'error' | 'status' | 'heartbeat';
  channel: string;
  payload: any;
  timestamp: number;
}

type WsMessageHandler = (message: WsMessage) => void;

interface RateLimitConfig {
  requestsPerSecond: number;
  burstSize: number;
  queueSize: number;
}

// ═══════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateRequestId = (): string =>
  `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const isRetryableError = (status: number): boolean => {
  return status >= 500 || status === 429; // Server errors or rate limited
};

// ═══════════════════════════════════════════════════════
// Error Handler Class
// ═══════════════════════════════════════════════════════

class ErrorHandler {
  private errorLog: ApiError[] = [];
  private maxLogSize: number = 100;
  private listeners: ((error: ApiError) => void)[] = [];

  log(error: ApiError): void {
    this.errorLog.push(error);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }
    this.listeners.forEach(listener => listener(error));
  }

  subscribe(listener: (error: ApiError) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getRecentErrors(count: number = 10): ApiError[] {
    return this.errorLog.slice(-count);
  }

  clear(): void {
    this.errorLog = [];
  }

  createError(message: string, code: string, options?: Partial<ApiError>): ApiError {
    return {
      message,
      code,
      retryable: options?.retryable ?? true,
      ...options,
    };
  }
}

// ═══════════════════════════════════════════════════════
// Cache Manager Class
// ═══════════════════════════════════════════════════════

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number = 1000;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl: number = 60): void {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Evict least recently used entry
      let lruKey: string | null = null;
      let lruTime = Infinity;
      for (const [k, v] of this.cache.entries()) {
        if (v.timestamp < lruTime) {
          lruTime = v.timestamp;
          lruKey = k;
        }
      }
      if (lruKey) this.cache.delete(lruKey);
    }

    this.cache.set(key, { data, timestamp: Date.now(), ttl, hits: 0 });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { size: number; totalHits: number } {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }
    return { size: this.cache.size, totalHits };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// ═══════════════════════════════════════════════════════
// Rate Limiter Class (Token Bucket Algorithm)
// ═══════════════════════════════════════════════════════

class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private config: RateLimitConfig;
  private queue: Array<{ resolve: () => void; reject: (error: Error) => void }> = [];

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.tokens = config.burstSize;
    this.lastRefill = Date.now();
  }

  async acquire(priority: 'high' | 'normal' | 'low' = 'normal'): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens--;
      return;
    }

    // Queue the request
    return new Promise((resolve, reject) => {
      const item = { resolve, reject };

      if (priority === 'high') {
        this.queue.unshift(item);
      } else if (priority === 'low') {
        this.queue.push(item);
      } else {
        // Normal priority: insert at middle
        const mid = Math.floor(this.queue.length / 2);
        this.queue.splice(mid, 0, item);
      }

      if (this.queue.length > this.config.queueSize) {
        // Reject oldest low-priority request
        const rejected = this.queue.find((_, i) =>
          i < this.queue.length - 1 &&
          this.queue[i] === this.queue[this.queue.length - 1]
        );
        if (rejected) {
          rejected.reject(new Error('Rate limit queue full'));
          this.queue = this.queue.filter(r => r !== rejected);
        }
      }
    });
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * this.config.requestsPerSecond;
    this.tokens = Math.min(this.config.burstSize, this.tokens + tokensToAdd);
    this.lastRefill = now;

    // Process queued requests
    while (this.queue.length > 0 && this.tokens >= 1) {
      this.tokens--;
      const next = this.queue.shift();
      if (next) next.resolve();
    }
  }

  getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}

// ═══════════════════════════════════════════════════════
// Circuit Breaker Pattern
// ═══════════════════════════════════════════════════════

enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN', // Testing recovery
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly threshold: number;
  private readonly resetTimeout: number;
  private readonly halfOpenMaxTests: number;

  constructor(
    threshold: number = 5,
    resetTimeout: number = 30000,
    halfOpenMaxTests: number = 3
  ) {
    this.threshold = threshold;
    this.resetTimeout = resetTimeout;
    this.halfOpenMaxTests = halfOpenMaxTests;
  }

  canExecute(): boolean {
    if (this.state === CircuitState.CLOSED) return true;

    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        return true;
      }
      return false;
    }

    // HALF_OPEN: allow limited test requests
    return this.successCount < this.halfOpenMaxTests;
  }

  recordSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.halfOpenMaxTests) {
        this.state = CircuitState.CLOSED;
      }
    }
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
    } else if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }

  getState(): CircuitState {
    // Auto-transition from OPEN to HALF_OPEN
    if (
      this.state === CircuitState.OPEN &&
      Date.now() - this.lastFailureTime > this.resetTimeout
    ) {
      this.state = CircuitState.HALF_OPEN;
      this.successCount = 0;
    }
    return this.state;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
  }
}

// ═══════════════════════════════════════════════════════
// Main APIService Class (Singleton)
// ═══════════════════════════════════════════════════════

class APIService {
  private static instance: APIService | null = null;
  private config: ApiConfig;
  private errorHandler: ErrorHandler;
  private cacheManager: CacheManager;
  private rateLimiter: RateLimiter;
  private circuitBreaker: CircuitBreaker;
  private abortControllers: Map<string, AbortController> = new Map();

  private constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseURL: config.baseURL || '/api/v1',
      timeout: config.timeout || 15000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    };

    this.errorHandler = new ErrorHandler();
    this.cacheManager = new CacheManager();
    this.rateLimiter = new RateLimiter({
      requestsPerSecond: 10,
      burstSize: 20,
      queueSize: 50,
    });
    this.circuitBreaker = new CircuitBreaker(5, 30000, 3);
  }

  static getInstance(config?: Partial<ApiConfig>): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService(config);
    }
    return APIService.instance;
  }

  // ─── Public API Methods ───

  async get<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body, options);
  }

  async put<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body, options);
  }

  async delete<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  async patch<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, body, options);
  }

  // ─── Core Request Method with Retry Logic ───

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    body?: any,
    options?: RequestOptions,
    attempt: number = 0
  ): Promise<ApiResponse<T>> {
    const requestId = generateRequestId();
    const startTime = Date.now();

    try {
      // Check circuit breaker
      if (!this.circuitBreaker.canExecute()) {
        throw this.errorHandler.createError(
          'Circuit breaker is open',
          'CIRCUIT_BREAKER_OPEN',
          { retryable: false }
        );
      }

      // Acquire rate limit token
      await this.rateLimiter.acquire(options?.priority);

      // Check cache for GET requests
      if (method === 'GET' && options?.cache !== false) {
        const cacheKey = this.buildCacheKey(method, endpoint, options?.params);
        const cached = this.cacheManager.get<T>(cacheKey);
        if (cached) {
          return {
            data: cached,
            status: 200,
            statusText: 'OK (cached)',
            headers: new Headers(),
            timestamp: Date.now(),
            duration: 0,
          };
        }
      }

      // Build URL with query parameters
      let url = `${this.config.baseURL}${endpoint}`;
      if (options?.params && Object.keys(options.params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          searchParams.append(key, String(value));
        });
        url += `?${searchParams.toString()}`;
      }

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        options?.timeout || this.config.timeout
      );
      this.abortControllers.set(requestId, controller);

      // Make fetch request
      const response = await fetch(url, {
        method,
        headers: {
          ...this.config.headers,
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);

      // Parse response
      const data = await response.json();
      const duration = Date.now() - startTime;

      // Handle errors
      if (!response.ok) {
        const error = this.errorHandler.createError(
          `HTTP ${response.status}: ${response.statusText}`,
          `HTTP_${response.status}`,
          {
            status: response.status,
            details: data,
            retryable: isRetryableError(response.status),
          }
        );

        this.errorHandler.log(error);
        this.circuitBreaker.recordFailure();

        // Retry logic
        if (error.retryable && attempt < (options?.retries ?? this.config.maxRetries)) {
          const delay = this.config.retryDelay * Math.pow(2, attempt); // Exponential backoff
          await sleep(delay);
          return this.request(method, endpoint, body, options, attempt + 1);
        }

        throw error;
      }

      // Success
      this.circuitBreaker.recordSuccess();

      // Cache GET responses
      if (method === 'GET' && options?.cache !== false) {
        const cacheKey = this.buildCacheKey(method, endpoint, options?.params);
        const ttl = typeof options?.cache === 'number' ? options.cache : 60;
        this.cacheManager.set(cacheKey, data, ttl);
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        timestamp: Date.now(),
        duration,
      };
    } catch (error: any) {
      // Handle specific errors
      if (error.name === 'AbortError') {
        const apiError = this.errorHandler.createError(
          `Request timeout after ${options?.timeout || this.config.timeout}ms`,
          'TIMEOUT_ERROR',
          { retryable: true }
        );
        this.errorHandler.log(apiError);

        if (attempt < (options?.retries ?? this.config.maxRetries)) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          await sleep(delay);
          return this.request(method, endpoint, body, options, attempt + 1);
        }

        throw apiError;
      }

      // Generic error
      const apiError = this.errorHandler.createError(
        error.message || 'Unknown error occurred',
        'UNKNOWN_ERROR',
        { retryable: true, details: error }
      );
      this.errorHandler.log(apiError);
      throw apiError;
    }
  }

  // ─── Utility Methods ───

  private buildCacheKey(
    method: string,
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): string {
    return `${method}:${endpoint}${params ? ':' + JSON.stringify(params) : ''}`;
  }

  cancelRequest(requestId: string): boolean {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
      return true;
    }
    return false;
  }

  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  clearCache(pattern?: string): void {
    this.cacheManager.invalidate(pattern);
  }

  // ─── Getters for Sub-systems ───

  getErrorHandler(): ErrorHandler {
    return this.errorHandler;
  }

  getCacheManager(): CacheManager {
    return this.cacheManager;
  }

  getRateLimiter(): RateLimiter {
    return this.rateLimiter;
  }

  getCircuitBreaker(): CircuitBreaker {
    return this.circuitBreaker;
  }

  getStatus(): {
    circuitState: CircuitState;
    availableTokens: number;
    queueLength: number;
    cacheStats: { size: number; totalHits: number };
    activeRequests: number;
  } {
    return {
      circuitState: this.circuitBreaker.getState(),
      availableTokens: this.rateLimiter.getAvailableTokens(),
      queueLength: this.rateLimiter.getQueueLength(),
      cacheStats: this.cacheManager.getStats(),
      activeRequests: this.abortControllers.size,
    };
  }

  destroy(): void {
    this.cancelAllRequests();
    this.cacheManager.destroy();
    this.circuitBreaker.reset();
    APIService.instance = null;
  }
}

// ═══════════════════════════════════════════════════════
// WebSocket Manager Class
// ═══════════════════════════════════════════════════════

class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private handlers: Map<string, Set<WsMessageHandler>> = new Map();
  private reconnectAttempts: number = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnected: boolean = false;

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || 'wss://stream.binance.com:9443/ws/btcusdt@trade',
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WsMessage = JSON.parse(event.data);
            this.routeMessage(message);
          } catch (e) {
            console.error('[WebSocket] Failed to parse message:', e);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log(`[WebSocket] Disconnected: ${event.code} - ${event.reason}`);
          this.isConnected = false;
          this.stopHeartbeat();
          this.scheduleReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnected = false;
  }

  subscribe(channel: string, handler: WsMessageHandler): () => void {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel)!.add(handler);

    // Send subscription message to server
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        channel,
      }));
    }

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(channel);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(channel);
          // Send unsubscribe message
          if (this.isConnected && this.ws) {
            this.ws.send(JSON.stringify({ type: 'unsubscribe', channel }));
          }
        }
      }
    };
  }

  send(data: any): void {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send: not connected');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  private routeMessage(message: WsMessage): void {
    const handlers = this.handlers.get(message.channel);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }

    // Also route to wildcard handlers
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => handler(message));
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`[WebSocket] Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect().catch(console.error);
    }, this.config.reconnectInterval);
  }
}

// ═══════════════════════════════════════════════════════
// Export Singleton Instance & Classes
// ═══════════════════════════════════════════════════════

export const apiService = APIService.getInstance();

export const wsManager = new WebSocketManager();

export {
  APIService, CacheManager, CircuitBreaker,
  CircuitState, ErrorHandler, RateLimiter, WebSocketManager
};

export type {
  ApiConfig, ApiError, ApiResponse, CacheEntry, RateLimitConfig, RequestOptions, WebSocketConfig,
  WsMessage,
  WsMessageHandler
};
