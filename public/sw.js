// Service Worker for YanYu Cloud Quant Analysis Trading System (YYC-QATS)
// PWA v2.0 — Stable Production Build
// Purpose: Offline caching, Market data sync, Web Push Notifications, Risk Monitoring

const CACHE_NAME = 'yanyu-cloud-cache-v2.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Install: Pre-cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[YYC-SW v2] Pre-caching static assets...');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.log('[YYC-SW v2] Pre-cache partial failure (expected in dev):', err);
      });
    })
  );
  // Activate immediately without waiting
  self.skipWaiting();
});

// Activate: Clean old caches, claim all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[YYC-SW v2] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[YYC-SW v2] Activated and claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch: Intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith('http')) return;

  // API/market data: Network-First with cache fallback
  if (url.pathname.includes('/api/') || url.pathname.includes('market') || url.pathname.includes('quotes')) {
    event.respondWith(
      fetch(request).then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            try { cache.put(request, copy); } catch (e) { /* ignore */ }
          });
        }
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            try { cache.put(request, copy); } catch (e) { /* ignore */ }
          });
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});

// Push Notifications
self.addEventListener('push', (event) => {
  let data = { title: '言语云系统预警', body: '数据同步异常，请检查网络连接。', severity: 'warning' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/favicon.ico',
    vibrate: data.severity === 'critical'
      ? [200, 100, 200, 100, 300]  // SOS pattern for critical
      : [150, 50, 150],             // Double tap for warning
    data: {
      timestamp: Date.now(),
      severity: data.severity || 'warning',
      url: data.url || '/',
    },
    actions: [
      { action: 'view', title: '查看详情' },
      { action: 'dismiss', title: '忽略' },
    ],
    tag: `yyc-alert-${Date.now()}`,
    requireInteraction: data.severity === 'critical',
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            severity: event.notification.data?.severity,
            url: targetUrl,
          });
          return;
        }
      }
      // Open new window
      return self.clients.openWindow(targetUrl);
    })
  );
});

// Message handler from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Handle alert push from main thread
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, severity } = event.data;
    self.registration.showNotification(title || '言语云预警', {
      body: body || '',
      icon: '/logo192.png',
      vibrate: severity === 'critical' ? [200, 100, 200, 100, 300] : [150, 50, 150],
      tag: `yyc-alert-${Date.now()}`,
      requireInteraction: severity === 'critical',
    });
  }
});

console.log('[YYC-SW v2] Service Worker loaded');
