/**
 * @file src/app/hooks/useResponsive.ts
 * @description 响应式断点检测 + 触摸手势 + 移动端优化 Hook
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 * @tags responsive,mobile,touch,typescript,hooks,critical,public
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ═══════════════════════════════════════════════════════
// Type Definitions
// ═══════════════════════════════════════════════════════

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface Breakpoints {
  xs: number;  // 0 - 639px   (Mobile portrait)
  sm: number;  // 640 - 767px (Mobile landscape)
  md: number;  // 768 - 1023px (Tablet)
  lg: number;  // 1024 - 1279px (Desktop)
  xl: number;  // 1280 - 1535px (Large desktop)
  '2xl': number; // 1536px+    (Ultra-wide)
}

export interface ResponsiveState {
  breakpoint: Breakpoint;
  width: number;
  height: number;
  isMobile: boolean;      // xs | sm
  isTablet: boolean;      // md
  isDesktop: boolean;     // lg | xl | 2xl
  isLandscape: boolean;
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
  pixelRatio: number;
}

export interface TouchGesture {
  type: 'tap' | 'swipe' | 'pinch' | 'longPress';
  direction?: 'left' | 'right' | 'up' | 'down' | 'in' | 'out';
  distance?: number;
  velocity?: { x: number; y: number };
  center?: { x: number; y: number };
  timestamp: number;
}

export interface TouchHandlers {
  onTap?: (e: TouchGesture) => void;
  onSwipeLeft?: (e: TouchGesture) => void;
  onSwipeRight?: (e: TouchGesture) => void;
  onSwipeUp?: (e: TouchGesture) => void;
  onSwipeDown?: (e: TouchGesture) => void;
  onPinchIn?: (e: TouchGesture) => void;
  onPinchOut?: (e: TouchGesture) => void;
  onLongPress?: (e: TouchGesture) => void;
}

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════

const DEFAULT_BREAKPOINTS: Breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

const SWIPE_THRESHOLD = 50;       // Minimum distance for swipe (px)
const SWIPE_VELOCITY = 0.3;       // Minimum velocity for swipe (px/ms)
const LONG_PRESS_DELAY = 500;     // Long press threshold (ms)
const PINCH_THRESHOLD = 10;        // Pinch detection threshold (px)

// ═══════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════

function getBreakpoint(width: number, breakpoints: Breakpoints): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

function getDistance(touch1: React.Touch | Touch, touch2: React.Touch | Touch): number {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getCenter(touch1: React.Touch | Touch, touch2: React.Touch | Touch): { x: number; y: number } {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
}

function getVelocity(
  start: { x: number; y: number; time: number },
  end: { x: number; y: number; time: number }
): { x: number; y: number } {
  const dt = end.time - start.time;
  if (dt === 0) return { x: 0, y: 0 };
  return {
    x: (end.x - start.x) / dt,
    y: (end.y - start.y) / dt,
  };
}

// ═══════════════════════════════════════════════════════
// useResponsive Hook
// ═══════════════════════════════════════════════════════

export function useResponsive(breakpoints?: Partial<Breakpoints>): ResponsiveState {
  const config = { ...DEFAULT_BREAKPOINTS, ...breakpoints };

  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        breakpoint: 'lg',
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLandscape: true,
        orientation: 'landscape',
        isTouchDevice: false,
        pixelRatio: 1,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      breakpoint: getBreakpoint(width, config),
      width,
      height,
      isMobile: width < config.md,
      isTablet: width >= config.md && width < config.lg,
      isDesktop: width >= config.lg,
      isLandscape: width > height,
      orientation: width > height ? 'landscape' : 'portrait',
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      pixelRatio: window.devicePixelRatio || 1,
    };
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        setState({
          breakpoint: getBreakpoint(width, config),
          width,
          height,
          isMobile: width < config.md,
          isTablet: width >= config.md && width < config.lg,
          isDesktop: width >= config.lg,
          isLandscape: width > height,
          orientation: width > height ? 'landscape' : 'portrait',
          isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
          pixelRatio: window.devicePixelRatio || 1,
        });
      }, 100); // Debounce 100ms
    };

    const handleOrientationChange = () => {
      handleResize();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [config]);

  return state;
}

// ═══════════════════════════════════════════════════════
// useTouchGestures Hook
// ═══════════════════════════════════════════════════════

export function useTouchGestures(handlers?: TouchHandlers) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const initialPinchRef = useRef<{ distance: number; center: { x: number; y: number } } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    // Record single touch start
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    // Setup long press timer
    if (handlers?.onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        handlers.onLongPress?.({
          type: 'longPress',
          center: { x: touch.clientX, y: touch.clientY },
          timestamp: Date.now(),
        });
      }, LONG_PRESS_DELAY);
    }

    // Record pinch start (two touches)
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialPinchRef.current = {
        distance: getDistance(touch1, touch2),
        center: getCenter(touch1, touch2),
      };
    }
  }, [handlers]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Cancel long press on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && initialPinchRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = getDistance(touch1, touch2);

      if (Math.abs(currentDistance - initialPinchRef.current.distance) > PINCH_THRESHOLD) {
        const isPinchOut = currentDistance > initialPinchRef.current.distance;

        if (isPinchOut && handlers?.onPinchOut) {
          handlers.onPinchOut({
            type: 'pinch',
            direction: 'out',
            distance: currentDistance - initialPinchRef.current.distance,
            center: getCenter(touch1, touch2),
            timestamp: Date.now(),
          });
        } else if (!isPinchOut && handlers?.onPinchIn) {
          handlers.onPinchIn({
            type: 'pinch',
            direction: 'in',
            distance: initialPinchRef.current.distance - currentDistance,
            center: getCenter(touch1, touch2),
            timestamp: Date.now(),
          });
        }

        initialPinchRef.current = { distance: currentDistance, center: getCenter(touch1, touch2) };
      }
    }
  }, [handlers]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Cancel long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle swipe/tap (single touch end)
    if (touchStartRef.current && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();

      const dx = endX - touchStartRef.current.x;
      const dy = endY - touchStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const velocity = getVelocity(touchStartRef.current, { x: endX, y: endY, time: endTime });

      if (distance < 10) {
        // Tap gesture
        handlers?.onTap?.({
          type: 'tap',
          center: { x: endX, y: endY },
          timestamp: endTime,
        });
      } else if (distance >= SWIPE_THRESHOLD || Math.abs(velocity.x) > SWIPE_VELOCITY || Math.abs(velocity.y) > SWIPE_VELOCITY) {
        // Swipe gesture
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const gesture: TouchGesture = {
          type: 'swipe',
          distance,
          velocity,
          center: { x: endX, y: endY },
          timestamp: endTime,
        };

        if (absDx > absDy) {
          // Horizontal swipe
          gesture.direction = dx > 0 ? 'right' : 'left';
          if (dx > 0) {
            handlers?.onSwipeRight?.(gesture);
          } else {
            handlers?.onSwipeLeft?.(gesture);
          }
        } else {
          // Vertical swipe
          gesture.direction = dy > 0 ? 'down' : 'up';
          if (dy > 0) {
            handlers?.onSwipeDown?.(gesture);
          } else {
            handlers?.onSwipeUp?.(gesture);
          }
        }
      }

      touchStartRef.current = null;
    }

    // Reset pinch state
    if (e.touches.length === 0) {
      initialPinchRef.current = null;
    }
  }, [handlers]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

// ═══════════════════════════════════════════════════════
// useMediaQuery Hook
// ═══════════════════════════════════════════════════════

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ═══════════════════════════════════════════════════════
// Responsive Utility Functions
// ═══════════════════════════════════════════════════════

export function getResponsiveValue<T>(
  breakpoint: Breakpoint,
  values: Partial<Record<Breakpoint, T>>,
  defaultValue: T
): T {
  const order: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const idx = order.indexOf(breakpoint);

  for (let i = idx; i >= 0; i--) {
    const bp = order[i];
    if (values[bp] !== undefined) {
      return values[bp]!;
    }
  }

  return defaultValue;
}

export function getColumnCount(breakpoint: Breakpoint): number {
  const columns: Record<Breakpoint, number> = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    '2xl': 6,
  };
  return columns[breakpoint];
}

export function getSpacing(breakpoint: Breakpoint): number {
  const spacing: Record<Breakpoint, number> = {
    xs: 1,   // 4px
    sm: 2,   // 8px
    md: 3,   // 12px
    lg: 4,   // 16px
    xl: 5,   // 20px
    '2xl': 6, // 24px
  };
  return spacing[breakpoint];
}

export function getFontSize(breakpoint: Breakpoint): string {
  const sizes: Record<Breakpoint, string> = {
    xs: '14px',
    sm: '14px',
    md: '15px',
    lg: '16px',
    xl: '16px',
    '2xl': '17px',
  };
  return sizes[breakpoint];
}
