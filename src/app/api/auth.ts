/**
 * @file src/app/api/auth.ts
 * @description YYC3 认证和授权管理器,提供基于JWT的身份验证和基于角色的访问控制
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-20
 * @updated 2026-03-20
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags api,typescript,auth,public
 * @depends
 */

/**
 * YYC-QATS Authentication & Authorization Manager
 * ─────────────────────────────────────────────────
 * Phase 12: JWT-based auth with role-based access control (RBAC).
 *
 * Features:
 *   1. JWT token management (access + refresh tokens)
 *   2. Login/logout flow with mock fallback
 *   3. Token refresh & expiry handling
 *   4. Role-based access control (RBAC) for modules
 *   5. Auth state persistence (localStorage)
 *   6. Automatic auth header injection for serviceBridge
 *
 * Usage:
 *   import { authManager } from './auth';
 *   await authManager.login('admin', 'password');
 *   authManager.getAuthHeaders();  // { Authorization: 'Bearer ...' }
 *   authManager.hasPermission('trade', 'write');
 *   authManager.logout();
 *
 * Security Note:
 *   In this client-side implementation, tokens are stored in localStorage
 *   for simplicity. A production system should use httpOnly cookies for
 *   access tokens and implement CSRF protection. This is a MOCK auth
 *   layer suitable for development/demo — NOT for real PII or credentials.
 */

// ═══════════════════════════════════════
// §1  Types
// ═══════════════════════════════════════

export type UserRole = 'admin' | 'trader' | 'analyst' | 'viewer';

export type ModulePermission = 'read' | 'write' | 'admin';

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  lastLoginAt: number;
  createdAt: string;
}

export interface JWTPayload {
  sub: string;       // user id
  username: string;
  role: UserRole;
  iat: number;       // issued at
  exp: number;       // expiry
  iss: string;       // issuer
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;    // seconds
  tokenType: 'Bearer';
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user: AuthUser;
  tokens: AuthTokens;
  message?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  lastRefreshAt: number | null;
}

export type AuthEventType = 'login' | 'logout' | 'token-refresh' | 'session-expired' | 'permission-denied';

export interface AuthEvent {
  type: AuthEventType;
  timestamp: number;
  user?: AuthUser;
  detail?: string;
}

// ═══════════════════════════════════════
// §2  RBAC Permission Matrix
// ═══════════════════════════════════════

/**
 * Module permission matrix by role.
 * Each module has read/write/admin granularity.
 */
const RBAC_MATRIX: Record<UserRole, Record<string, Set<ModulePermission>>> = {
  admin: {
    market:   new Set(['read', 'write', 'admin']),
    strategy: new Set(['read', 'write', 'admin']),
    risk:     new Set(['read', 'write', 'admin']),
    quantum:  new Set(['read', 'write', 'admin']),
    bigdata:  new Set(['read', 'write', 'admin']),
    model:    new Set(['read', 'write', 'admin']),
    trade:    new Set(['read', 'write', 'admin']),
    admin:    new Set(['read', 'write', 'admin']),
  },
  trader: {
    market:   new Set(['read']),
    strategy: new Set(['read', 'write']),
    risk:     new Set(['read']),
    quantum:  new Set(['read']),
    bigdata:  new Set(['read']),
    model:    new Set(['read']),
    trade:    new Set(['read', 'write']),
    admin:    new Set(['read']),
  },
  analyst: {
    market:   new Set(['read', 'write']),
    strategy: new Set(['read', 'write']),
    risk:     new Set(['read', 'write']),
    quantum:  new Set(['read', 'write']),
    bigdata:  new Set(['read', 'write']),
    model:    new Set(['read', 'write']),
    trade:    new Set(['read']),
    admin:    new Set(['read']),
  },
  viewer: {
    market:   new Set(['read']),
    strategy: new Set(['read']),
    risk:     new Set(['read']),
    quantum:  new Set(['read']),
    bigdata:  new Set(['read']),
    model:    new Set(['read']),
    trade:    new Set(['read']),
    admin:    new Set([]),
  },
};

// ═══════════════════════════════════════
// §3  Mock Users (Development Only)
// ═══════════════════════════════════════

const IS_DEV = import.meta.env?.DEV ?? false;

const DEV_MOCK_PASSWORDS: Record<string, string> = IS_DEV
  ? {
      admin: import.meta.env.VITE_YYC_MOCK_ADMIN_PW || 'dev_admin_2026',
      trader: import.meta.env.VITE_YYC_MOCK_TRADER_PW || 'dev_trader_2026',
      analyst: import.meta.env.VITE_YYC_MOCK_ANALYST_PW || 'dev_analyst_2026',
      viewer: import.meta.env.VITE_YYC_MOCK_VIEWER_PW || 'dev_viewer_2026',
    }
  : {};

const MOCK_USER_TEMPLATES: Record<string, Omit<AuthUser, 'lastLoginAt'>> = {
  admin: {
    id: 'usr_001',
    username: 'admin',
    displayName: '系统管理员',
    email: 'admin@yyc-qats.io',
    role: 'admin',
    createdAt: '2025-01-01T00:00:00Z',
  },
  trader: {
    id: 'usr_002',
    username: 'trader',
    displayName: '交易员',
    email: 'trader@yyc-qats.io',
    role: 'trader',
    createdAt: '2025-03-15T00:00:00Z',
  },
  analyst: {
    id: 'usr_003',
    username: 'analyst',
    displayName: '分析师',
    email: 'analyst@yyc-qats.io',
    role: 'analyst',
    createdAt: '2025-06-01T00:00:00Z',
  },
  viewer: {
    id: 'usr_004',
    username: 'viewer',
    displayName: '观察者',
    email: 'viewer@yyc-qats.io',
    role: 'viewer',
    createdAt: '2025-09-01T00:00:00Z',
  },
};

function getMockUsers(): Record<string, { password: string; user: AuthUser }> {
  if (!IS_DEV) return {};
  const users: Record<string, { password: string; user: AuthUser }> = {};
  for (const [username, template] of Object.entries(MOCK_USER_TEMPLATES)) {
    users[username] = {
      password: DEV_MOCK_PASSWORDS[username],
      user: { ...template, lastLoginAt: Date.now() },
    };
  }
  return users;
}

const MOCK_USERS = getMockUsers();

// ═══════════════════════════════════════
// §4  JWT Utilities (Mock)
// ═══════════════════════════════════════

/**
 * Generate a mock JWT token.
 * In production, this would be done server-side.
 * The format mimics real JWT structure (header.payload.signature)
 * but uses base64 encoding instead of real cryptographic signing.
 */
function generateMockJWT(payload: JWTPayload): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  // Include ms-precision timestamp + random nonce for uniqueness even within same second
  const nonce = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const signature = btoa(`mock_sig_${payload.sub}_${nonce}`);
  return `${header}.${body}.${signature}`;
}

/** Decode a mock JWT payload (no signature verification — mock only) */
export function decodeMockJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

/** Check if a JWT token is expired */
export function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  const payload = decodeMockJWT(token);
  if (!payload) return true;
  return Date.now() / 1000 > payload.exp - bufferSeconds;
}

// ═══════════════════════════════════════
// §5  Auth Manager
// ═══════════════════════════════════════

const AUTH_STORAGE_KEY = 'yyc_auth_state';
const TOKEN_REFRESH_BUFFER = 5 * 60; // Refresh 5 minutes before expiry

class AuthManager {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    tokens: null,
    lastRefreshAt: null,
  };

  private eventListeners: Array<(event: AuthEvent) => void> = [];
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.restoreSession();
  }

  // ── Login ──

  async login(username: string, password: string, rememberMe = true): Promise<LoginResponse> {
    // Mock authentication
    const mockEntry = MOCK_USERS[username];
    if (!mockEntry || mockEntry.password !== password) {
      return {
        success: false,
        user: null as any,
        tokens: null as any,
        message: '用户名或密码错误',
      };
    }

    const user = { ...mockEntry.user, lastLoginAt: Date.now() };
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 3600; // 1 hour

    const payload: JWTPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      iat: now,
      exp: now + expiresIn,
      iss: 'yyc-qats-auth',
    };

    const refreshPayload: JWTPayload = {
      ...payload,
      exp: now + 7 * 24 * 3600, // Refresh token: 7 days
    };

    const tokens: AuthTokens = {
      accessToken: generateMockJWT(payload),
      refreshToken: generateMockJWT(refreshPayload),
      expiresIn,
      tokenType: 'Bearer',
    };

    this.state = {
      isAuthenticated: true,
      user,
      tokens,
      lastRefreshAt: Date.now(),
    };

    if (rememberMe) {
      this.persistSession();
    }

    this.scheduleRefresh(expiresIn);
    this.emit({ type: 'login', timestamp: Date.now(), user });

    console.log(
      `%c[Auth] Login success: ${user.displayName} (${user.role})`,
      'color: #38B2AC'
    );

    return { success: true, user, tokens };
  }

  // ── Logout ──

  logout(): void {
    const user = this.state.user;
    this.state = {
      isAuthenticated: false,
      user: null,
      tokens: null,
      lastRefreshAt: null,
    };
    this.clearSession();
    this.cancelRefresh();
    this.emit({ type: 'logout', timestamp: Date.now(), user: user ?? undefined });
    console.log('%c[Auth] Logged out', 'color: #F56565');
  }

  // ── Token Refresh ──

  async refreshTokens(): Promise<boolean> {
    if (!this.state.tokens?.refreshToken) return false;

    const refreshPayload = decodeMockJWT(this.state.tokens.refreshToken);
    if (!refreshPayload || Date.now() / 1000 > refreshPayload.exp) {
      // Refresh token expired — session expired
      this.emit({ type: 'session-expired', timestamp: Date.now(), user: this.state.user ?? undefined });
      this.logout();
      return false;
    }

    // Mock refresh: generate new access token
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 3600;
    const newPayload: JWTPayload = {
      sub: refreshPayload.sub,
      username: refreshPayload.username,
      role: refreshPayload.role,
      iat: now,
      exp: now + expiresIn,
      iss: 'yyc-qats-auth',
    };

    this.state.tokens = {
      ...this.state.tokens,
      accessToken: generateMockJWT(newPayload),
      expiresIn,
    };
    this.state.lastRefreshAt = Date.now();
    this.persistSession();
    this.scheduleRefresh(expiresIn);
    this.emit({ type: 'token-refresh', timestamp: Date.now(), user: this.state.user ?? undefined });

    console.log('%c[Auth] Token refreshed', 'color: #4299E1');
    return true;
  }

  // ── Authorization ──

  /**
   * Check if the current user has a specific permission on a module.
   */
  hasPermission(module: string, permission: ModulePermission = 'read'): boolean {
    if (!this.state.isAuthenticated || !this.state.user) return false;
    const rolePerms = RBAC_MATRIX[this.state.user.role];
    if (!rolePerms) return false;
    const modulePerms = rolePerms[module];
    if (!modulePerms) return false;
    return modulePerms.has(permission);
  }

  /**
   * Get all permissions for the current user on a specific module.
   */
  getModulePermissions(module: string): ModulePermission[] {
    if (!this.state.isAuthenticated || !this.state.user) return [];
    const rolePerms = RBAC_MATRIX[this.state.user.role];
    if (!rolePerms) return [];
    const modulePerms = rolePerms[module];
    if (!modulePerms) return [];
    return Array.from(modulePerms);
  }

  /**
   * Get accessible modules for the current user.
   */
  getAccessibleModules(): string[] {
    if (!this.state.isAuthenticated || !this.state.user) return [];
    const rolePerms = RBAC_MATRIX[this.state.user.role];
    if (!rolePerms) return [];
    return Object.entries(rolePerms)
      .filter(([, perms]) => perms.size > 0)
      .map(([module]) => module);
  }

  /**
   * Assert permission, throw if denied.
   */
  requirePermission(module: string, permission: ModulePermission = 'read'): void {
    if (!this.hasPermission(module, permission)) {
      this.emit({
        type: 'permission-denied',
        timestamp: Date.now(),
        user: this.state.user ?? undefined,
        detail: `${module}:${permission}`,
      });
      throw new Error(`Permission denied: ${this.state.user?.role ?? 'guest'} cannot ${permission} ${module}`);
    }
  }

  // ── Auth Headers ──

  /**
   * Get authorization headers for API requests.
   * Returns empty object if not authenticated or token expired.
   */
  getAuthHeaders(): Record<string, string> {
    if (!this.state.tokens?.accessToken) return {};
    if (isTokenExpired(this.state.tokens.accessToken)) {
      // Trigger async refresh, but return empty for this request
      this.refreshTokens();
      return {};
    }
    return {
      Authorization: `${this.state.tokens.tokenType} ${this.state.tokens.accessToken}`,
    };
  }

  // ── State Getters ──

  get isAuthenticated(): boolean { return this.state.isAuthenticated; }
  get currentUser(): AuthUser | null { return this.state.user; }
  get currentRole(): UserRole | null { return this.state.user?.role ?? null; }
  get authState(): Readonly<AuthState> { return { ...this.state }; }

  // ── Event System ──

  onAuthEvent(listener: (event: AuthEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      this.eventListeners = this.eventListeners.filter(l => l !== listener);
    };
  }

  private emit(event: AuthEvent): void {
    this.eventListeners.forEach(fn => { try { fn(event); } catch { /* */ } });
  }

  // ── Session Persistence ──

  private persistSession(): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        user: this.state.user,
        tokens: this.state.tokens,
        savedAt: Date.now(),
      }));
    } catch { /* */ }
  }

  private restoreSession(): void {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved.tokens?.accessToken || !saved.user) return;

      // Check if refresh token is still valid
      if (isTokenExpired(saved.tokens.refreshToken, 0)) {
        this.clearSession();
        return;
      }

      this.state = {
        isAuthenticated: true,
        user: saved.user,
        tokens: saved.tokens,
        lastRefreshAt: saved.savedAt,
      };

      // If access token expired but refresh token valid, refresh
      if (isTokenExpired(saved.tokens.accessToken)) {
        this.refreshTokens();
      } else {
        const payload = decodeMockJWT(saved.tokens.accessToken);
        if (payload) {
          const remainingSec = payload.exp - Date.now() / 1000;
          this.scheduleRefresh(remainingSec);
        }
      }

      console.log(
        `%c[Auth] Session restored: ${this.state.user?.displayName}`,
        'color: #4299E1'
      );
    } catch {
      this.clearSession();
    }
  }

  private clearSession(): void {
    try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch { /* */ }
  }

  // ── Refresh Scheduling ──

  private scheduleRefresh(expiresInSec: number): void {
    this.cancelRefresh();
    const refreshInMs = Math.max(0, (expiresInSec - TOKEN_REFRESH_BUFFER) * 1000);
    this.refreshTimer = setTimeout(() => {
      this.refreshTokens();
    }, refreshInMs);
  }

  private cancelRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // ── Static RBAC Query ──

  static getRBAC(): typeof RBAC_MATRIX { return RBAC_MATRIX; }
  static getMockUsers(): string[] { return Object.keys(MOCK_USERS); }
}

// ═══════════════════════════════════════
// §6  Singleton & Console Exposure
// ═══════════════════════════════════════

export const authManager = new AuthManager();

if (typeof globalThis !== 'undefined') {
  (globalThis as any).authManager = authManager;
  (globalThis as any).AuthManager = AuthManager;
}