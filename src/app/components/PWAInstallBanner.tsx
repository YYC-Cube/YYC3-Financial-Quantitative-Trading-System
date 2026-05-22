/**
 * @file src/app/components/PWAInstallBanner.tsx
 * @description PWA安装提示横幅 - 首次访问显示，使用usePWA()触发安装
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 * @tags pwa,install-banner,component,critical,public
 */

'use client';

import { Download, Monitor, Smartphone, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import { usePWA } from '@/app/hooks/usePWA';

// ═══════════════════════════════════════════════════════
// Type Definitions
// ═══════════════════════════════════════════════════════

export interface PWAInstallBannerProps {
  className?: string;
  showAfterDays?: number; // 多少天后再次提示（默认7天）
  position?: 'top' | 'bottom'; // 横幅位置
  autoShow?: boolean; // 自动显示（默认true）
}

type BannerState = 'hidden' | 'showing' | 'dismissing' | 'installed';

// ═══════════════════════════════════════════════════════
// LocalStorage Keys
// ═══════════════════════════════════════════════════════

const STORAGE_KEYS = {
  DISMISSED_AT: 'yyc3-pwa-dismissed-at',
  INSTALLED: 'yyc3-pwa-installed',
  LAST_PROMPT: 'yyc3-pwa-last-prompt',
};

// ═══════════════════════════════════════════════════════
// PWAInstallBanner Component
// ═══════════════════════════════════════════════════════

export function PWAInstallBanner({
  className,
  showAfterDays = 7,
  position = 'bottom',
  autoShow = true,
}: PWAInstallBannerProps) {
  const [bannerState, setBannerState] = useState<BannerState>('hidden');
  const [isAnimating, setIsAnimating] = useState(false);

  const {
    isInstallable,
    isInstalled,
    isOffline,
    promptInstall,
  } = usePWA();

  // ─── Check if banner should be shown ───

  const shouldShowBanner = useCallback((): boolean => {
    if (!autoShow || !isInstallable) return false;

    const dismissedAt = localStorage.getItem(STORAGE_KEYS.DISMISSED_AT);
    const installed = localStorage.getItem(STORAGE_KEYS.INSTALLED);

    // Already installed - never show again
    if (installed === 'true' || isInstalled) return false;

    // Never dismissed - show it!
    if (!dismissedAt) return true;

    // Dismissed recently - check if enough time passed
    const dismissedTime = new Date(dismissedAt).getTime();
    const now = Date.now();
    const daysSinceDismissal = (now - dismissedTime) / (1000 * 60 * 60 * 24);

    return daysSinceDismissal >= showAfterDays;
  }, [autoShow, isInstallable, isInstalled, showAfterDays]);

  // ─── Show/Hide Logic ───

  useEffect(() => {
    if (shouldShowBanner()) {
      // Small delay to allow page to render first
      const timer = setTimeout(() => {
        setBannerState('showing');
        setIsAnimating(true);
      }, 1500); // Show after 1.5s

      return () => clearTimeout(timer);
    }
  }, [shouldShowBanner]);

  useEffect(() => {
    if (isInstalled) {
      localStorage.setItem(STORAGE_KEYS.INSTALLED, 'true');
      setBannerState('installed');
    }
  }, [isInstalled]);

  // ─── Action Handlers ───

  const handleInstall = async () => {
    try {
      const success = await promptInstall();

      if (success) {
        localStorage.setItem(STORAGE_KEYS.INSTALLED, 'true');
        localStorage.setItem(STORAGE_KEYS.LAST_PROMPT, new Date().toISOString());
        handleDismiss(true); // Immediate dismiss with animation
      } else {
        // User cancelled - don't dismiss, let them try again or manually dismiss
        console.log('[PWA-Banner] User cancelled install prompt');
      }
    } catch (error) {
      console.error('[PWA-Banner] Install error:', error);
    }
  };

  const handleDismiss = useCallback((immediate = false) => {
    if (immediate) {
      setBannerState('hidden');
      setIsAnimating(false);
      return;
    }

    setIsAnimating(false);
    setBannerState('dismissing');

    setTimeout(() => {
      setBannerState('hidden');
      localStorage.setItem(STORAGE_KEYS.DISMISSED_AT, new Date().toISOString());
    }, 300); // Wait for animation to complete
  }, []);

  // ─── Don't render if hidden ───

  if (bannerState === 'hidden' || bannerState === 'installed') return null;

  // ─── Render ───

  return (
    <div
      className={cn(
        'fixed left-4 right-4 z-[9999] max-w-lg mx-auto transition-all duration-300 ease-out',
        position === 'bottom' ? 'bottom-4' : 'top-4',
        isAnimating
          ? 'translate-y-0 opacity-100'
          : position === 'bottom'
            ? 'translate-y-full opacity-0'
            : '-translate-y-full opacity-0',
        className
      )}
      role="banner"
      aria-label="PWA installation prompt"
    >
      <div className="bg-gradient-to-r from-[#112240] via-[#1A2D4D] to-[#112240] border border-[#38B2AC]/30 rounded-xl shadow-2xl shadow-black/50 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 p-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-[#38B2AC]/20 rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-[#38B2AC]" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#E2E8F0] mb-1">
              安装 YYC³-QATS 应用
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              将应用添加到主屏幕，获得更快的启动速度和离线访问能力。
              无需下载应用商店。
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => handleDismiss()}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
            aria-label="关闭安装提示"
          >
            <X className="w-4 h-4 text-[#8892B0]" />
          </button>
        </div>

        {/* Features List */}
        <div className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '⚡', label: '秒开启动' },
              { icon: '📱', label: '全屏体验' },
              { icon: '🔄', label: '离线可用' },
            ].map((feature) => (
              <div
                key={feature.label}
                className="bg-[#0A192F]/60 rounded-md py-1.5 px-2 text-center"
              >
                <span className="text-sm">{feature.icon}</span>
                <p className="text-[10px] font-medium text-[#8892B0] mt-0.5">
                  {feature.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 pt-2 bg-[#0A192F]/40">
          <Button
            onClick={handleInstall}
            disabled={isOffline}
            className="flex-1 bg-[#38B2AC] hover:bg-[#319795] text-white text-xs font-medium h-9 shadow-lg shadow-[#38B2AC]/20 transition-all duration-200 hover:scale-[1.02]"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            立即安装
          </Button>

          <Button
            variant="ghost"
            onClick={() => handleDismiss()}
            className="px-4 text-[#8892B0] hover:text-[#E2E8F0] hover:bg-white/5 text-xs font-medium h-9"
          >
            稍后提醒
          </Button>
        </div>

        {/* Device Compatibility Badge */}
        <div className="px-4 pb-3 pt-0">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8892B0]/70">
            <Monitor className="w-3 h-3" />
            <span>支持桌面端和移动端</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Export Utilities
// ═══════════════════════════════════════════════════════

/**
 * Reset PWA install banner state (for testing or user preference reset)
 */
export function resetPWABannerState(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Check if PWA install banner has been shown before
 */
export function hasBeenPromptedBefore(): boolean {
  return !!localStorage.getItem(STORAGE_KEYS.LAST_PROMPT);
}

/**
 * Force show PWA install banner (for testing)
 */
export function forceShowPWABanner(): void {
  localStorage.removeItem(STORAGE_KEYS.DISMISSED_AT);
  window.dispatchEvent(new CustomEvent('pwa-show-banner'));
}

export default PWAInstallBanner;
