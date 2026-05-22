/**
 * @file src/app/utils/performance-helpers.ts
 * @description Performance Optimization Utilities - Phase 2 UX Enhancement
 * @author YanYuCloudCube Team
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 *
 * Core Web Vitals Optimization Helpers:
 * - Debounce/Throttle for INP improvement
 * - RequestIdleCallback wrapper for non-critical work
 * - Preloading utilities for LCP optimization
 * - Layout stability helpers for CLS prevention
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function requestIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }

  const timeoutId = setTimeout(() => {
    const start = Date.now();
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1);

  return timeoutId as unknown as number;
}

export function cancelIdleCallback(handle: number): void {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle);
  } else {
    clearTimeout(handle as unknown as ReturnType<typeof setTimeout>);
  }
}

export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function preloadFonts(fonts: string[]): Promise<void[]> {
  return Promise.all(
    fonts.map(
      (font) =>
        new Promise<void>((resolve) => {
          document.fonts.ready.then(() => resolve());
          try {
            document.fonts.load(`16px "${font}"`).then(() => resolve());
          } catch {
            resolve();
          }
        })
    )
  );
}

export function reserveSpace(target: HTMLElement, dimensions: { width?: number; height?: number }): () => void {
  if (dimensions.width) target.style.width = `${dimensions.width}px`;
  if (dimensions.height) target.style.height = `${dimensions.height}px`;

  return () => {
    if (dimensions.width) target.style.width = '';
    if (dimensions.height) target.style.height = '';
  };
}

export function measurePerformance<T>(label: string, fn: () => T): T {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const startMark = `${label}-start`;
    const endMark = `${label}-end`;

    performance.mark(startMark);
    const result = fn();
    performance.mark(endMark);
    performance.measure(label, startMark, endMark);

    const measures = performance.getEntriesByName(label);
    const lastMeasure = measures[measures.length - 1];
    console.log(`[Performance] ${label}: ${lastMeasure?.duration?.toFixed(2)}ms`);

    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(label);

    return result;
  }

  return fn();
}

export function scheduleNonCriticalWork(callback: () => void, timeout = 2000): void {
  const timeoutId = setTimeout(() => {
    callback();
  }, timeout);

  requestIdleCallback(
    () => {
      clearTimeout(timeoutId);
      callback();
    },
    { timeout }
  );
}
