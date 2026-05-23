/**
 * @file src/app/hooks/usePWA.ts
 * @description PWA管理Hook - Install Prompt + Push Notification + Offline Status
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 * @tags pwa,install,push-notification,offline,hooks,critical,public
 */

import { useCallback, useEffect, useState } from 'react';

// ═══════════════════════════════════════════════════════
// Type Definitions
// ═══════════════════════════════════════════════════════

export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  swRegistration: ServiceWorkerRegistration | null;
  pushSupported: boolean;
  pushEnabled: boolean;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

type BeforeInstallPromptEvent = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

// ═══════════════════════════════════════════════════════
// usePWA Hook
// ═══════════════════════════════════════════════════════

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: !navigator.onLine,
    installPrompt: null,
    swRegistration: null,
    pushSupported: false,
    pushEnabled: false,
  });

  // ─── Install Prompt Detection ───

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;

      setState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: promptEvent,
      }));
    };

    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setState(prev => ({ ...prev, isInstalled: true }));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // ─── Online/Offline Detection ───

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOffline: false }));
      // Sync cached data when back online
      if ('serviceWorker' in navigator && state.swRegistration) {
        const swReg = state.swRegistration as unknown as { sync?: (tag: string) => Promise<void> };
        if (swReg.sync) {
          swReg.sync('sync-data').catch(async () => {
            // Background sync not supported
          });
        }
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOffline: true }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.swRegistration]);

  // ─── Service Worker Registration ───

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[PWA] Service Worker registered:', registration.scope);

        setState(prev => ({
          ...prev,
          swRegistration: registration,
          pushSupported: 'PushManager' in window,
        }));

        // Check existing push subscription
        if ('PushManager' in window) {
          const subscription = await registration.pushManager.getSubscription();
          setState(prev => ({
            ...prev,
            pushEnabled: !!subscription,
          }));
        }

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                // New SW activated, prompt user to refresh
                window.dispatchEvent(new CustomEvent('sw-update-available'));
              }
            });
          }
        });
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    };

    registerSW();
  }, []);

  // ─── Action Methods ───

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!state.installPrompt || !state.isInstallable) {
      return false;
    }

    try {
      await state.installPrompt.prompt();
      const { outcome } = await state.installPrompt.userChoice;

      if (outcome === 'accepted') {
        setState(prev => ({ ...prev, isInstalled: true }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('[PWA] Install prompt error:', error);
      return false;
    }
  }, [state.installPrompt, state.isInstallable]);

  const enablePushNotifications = useCallback(async (): Promise<boolean> => {
    if (!state.swRegistration || !state.pushSupported) {
      return false;
    }

    try {
      // Request permission first
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        console.log('[PWA] Push notification permission denied');
        return false;
      }

      // Subscribe to push service
      // Note: In production, replace with actual VAPID public key
      const subscription = await state.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUYgUivxIkvkyVtw91Wiun3H411WpI03SbbGsfM7qRrJcQFi8boRF6ryAkLqY3' +
          '2yG5nPuAHfgc8CrXPfTxDgHZ3kVa'
        ) as BufferSource,
      });

      console.log('[PWA] Push notification enabled:', subscription);
      setState(prev => ({ ...prev, pushEnabled: true }));

      // Send subscription to server (implement your API call here)
      // await sendSubscriptionToServer(subscription);

      return true;
    } catch (error) {
      console.error('[PWA] Enable push notifications error:', error);
      return false;
    }
  }, [state.swRegistration, state.pushSupported]);

  const disablePushNotifications = useCallback(async (): Promise<boolean> => {
    if (!state.swRegistration) return false;

    try {
      const subscription = await state.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('[PWA] Push notification disabled');
        setState(prev => ({ ...prev, pushEnabled: false }));

        // Remove subscription from server (implement your API call here)
        // await removeSubscriptionFromServer(subscription);
      }

      return true;
    } catch (error) {
      console.error('[PWA] Disable push notifications error:', error);
      return false;
    }
  }, [state.swRegistration]);

  const showLocalNotification = useCallback(
    async (options: NotificationOptions): Promise<boolean> => {
      if (!state.swRegistration) return false;

      try {
        // Use service worker to show notification
        state.swRegistration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/yyc3-icons/pwa/icon-192x192.png',
          badge: options.badge || '/yyc3-icons/favicon/favicon-96x96.png',
          tag: options.tag || `yyc-${Date.now()}`,
          requireInteraction: options.requireInteraction || false,
          data: options.data || {},
          ...(options.actions ? { actions: options.actions } : {}),
        });

        return true;
      } catch (error) {
        console.error('[PWA] Show local notification error:', error);
        return false;
      }
    },
    [state.swRegistration]
  );

  const updateServiceWorker = useCallback(async (): Promise<boolean> => {
    if (!state.swRegistration) return false;

    try {
      // Send message to skip waiting and activate new SW
      const swReg = state.swRegistration as unknown as { postMessage: (data: unknown) => void };
      swReg.postMessage({ type: 'SKIP_WAITING' });

      // Reload page after short delay to allow activation
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      return true;
    } catch (error) {
      console.error('[PWA] Update service worker error:', error);
      return false;
    }
  }, [state.swRegistration]);

  const clearCache = useCallback(async (): Promise<boolean> => {
    if (!('caches' in window)) return false;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[PWA] All caches cleared');
      return true;
    } catch (error) {
      console.error('[PWA] Clear cache error:', error);
      return false;
    }
  }, []);

  return {
    ...state,
    promptInstall,
    enablePushNotifications,
    disablePushNotifications,
    showLocalNotification,
    updateServiceWorker,
    clearCache,
  };
}

// ═══════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
