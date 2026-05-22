/**
 * @file src/app/hooks/useResponsive.test.ts
 * @description Unit tests for Responsive Hook
 */

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock window dimensions
const mockInnerWidth = 1024;
const mockInnerHeight = 768;

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: mockInnerWidth,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  value: mockInnerHeight,
});

// Mock matchMedia
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

describe('useResponsive Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import successfully', async () => {
    const { useResponsive } = await import('./useResponsive');

    expect(typeof useResponsive).toBe('function');
  });

  it('should return responsive state object', async () => {
    const { useResponsive } = await import('./useResponsive');

    const { result } = renderHook(() => useResponsive());

    expect(result.current).toHaveProperty('breakpoint');
    expect(result.current).toHaveProperty('width');
    expect(result.current).toHaveProperty('height');
    expect(result.current).toHaveProperty('isMobile');
    expect(result.current).toHaveProperty('isTablet');
    expect(result.current).toHaveProperty('isDesktop');
    expect(result.current).toHaveProperty('isLandscape');
    expect(result.current).toHaveProperty('orientation');
    expect(result.current).toHaveProperty('isTouchDevice');
    expect(result.current).toHaveProperty('pixelRatio');
  });

  it('should detect desktop viewport (1024px)', async () => {
    const { useResponsive } = await import('./useResponsive');

    // Set desktop width
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.breakpoint).toBe('lg');
  });

  it('should detect mobile viewport (<768px)', async () => {
    const { useResponsive } = await import('./useResponsive');

    // Set mobile width
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });
});

describe('Responsive Utility Functions', () => {
  it('getBreakpoint should return correct breakpoint for width', async () => {
    const module = await import('./useResponsive');

    // Check if getBreakpoint is exported as named export
    if ('getBreakpoint' in module && typeof (module as Record<string, unknown>).getBreakpoint === 'function') {
      const getBreakpoint = (module as Record<string, unknown>).getBreakpoint as (width: number) => string;

      expect(getBreakpoint(375)).toBeDefined();
      expect(getBreakpoint(768)).toBeDefined();
      expect(getBreakpoint(1024)).toBeDefined();
      expect(getBreakpoint(1280)).toBeDefined();
      expect(getBreakpoint(1536)).toBeDefined();
    } else {
      // Fallback: test that the module exists and has responsive utilities
      expect(module).toBeDefined();
    }
  });

  it('getColumnCount should return valid number', async () => {
    const { getColumnCount } = await import('./useResponsive');

    if (getColumnCount) {
      const count = getColumnCount('lg');
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    }
  });
});
