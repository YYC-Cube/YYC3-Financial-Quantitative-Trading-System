/**
 * @file src/app/hooks/usePWA.test.ts
 * @description Unit tests for PWA management Hook
 */

import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { usePWA } from './usePWA';

// Mock navigator.serviceWorker
const mockRegister = vi.fn(() => Promise.resolve({
  scope: '/',
  showNotification: vi.fn(),
  pushManager: {
    getSubscription: vi.fn(() => Promise.resolve(null)),
    subscribe: vi.fn(() => Promise.resolve({ endpoint: 'test' })),
  },
  addEventListener: vi.fn(),
  sync: vi.fn(),
  postMessage: vi.fn(),
}));

const mockGetRegistration = vi.fn(() => Promise.resolve(null));

Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: mockRegister,
    getRegistration: mockGetRegistration,
  },
  writable: true,
});

// Mock window.addEventListener for beforeinstallprompt
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true,
});

Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true,
});

// Mock matchMedia (required by usePWA hook)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

describe('usePWA Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isOffline).toBe(!navigator.onLine);
    expect(result.current.installPrompt).toBeNull();
    expect(result.current.pushSupported).toBe(false);
    expect(result.current.pushEnabled).toBe(false);
  });

  it('should detect online/offline status', () => {
    const { result } = renderHook(() => usePWA());

    // Initial state
    expect(result.current.isOffline).toBe(!navigator.onLine);

    // Simulate offline event (would need more complex setup)
    // This is a basic structure test
  });

  it('should have all required methods available', () => {
    const { result } = renderHook(() => usePWA());

    expect(typeof result.current.promptInstall).toBe('function');
    expect(typeof result.current.enablePushNotifications).toBe('function');
    expect(typeof result.current.disablePushNotifications).toBe('function');
    expect(typeof result.current.showLocalNotification).toBe('function');
    expect(typeof result.current.updateServiceWorker).toBe('function');
    expect(typeof result.current.clearCache).toBe('function');
  });

  it('promptInstall should return false when not installable', async () => {
    const { result } = renderHook(() => usePWA());

    const success = await act(async () => {
      return await result.current.promptInstall();
    });

    expect(success).toBe(false);
  });

  it('enablePushNotifications should return false when SW not registered', async () => {
    const { result } = renderHook(() => usePWA());

    const success = await act(async () => {
      return await result.current.enablePushNotifications();
    });

    expect(success).toBe(false);
  });

  it('showLocalNotification should return false when SW not registered', async () => {
    const { result } = renderHook(() => usePWA());

    const success = await act(async () => {
      return await result.current.showLocalNotification({
        title: 'Test',
        body: 'Test notification',
      });
    });

    expect(success).toBe(false);
  });

  it('clearCache should return true (caches API mock)', async () => {
    const { result } = renderHook(() => usePWA());

    // Mock caches API
    const mockCacheKeys = vi.fn(() => Promise.resolve([]));
    const mockCacheDelete = vi.fn(() => Promise.resolve(true));

    globalThis.caches = {
      keys: mockCacheKeys,
      delete: mockCacheDelete,
    } as unknown as CacheStorage;

    const success = await act(async () => {
      return await result.current.clearCache();
    });

    expect(success).toBe(true);
  });
});
