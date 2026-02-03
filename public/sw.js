// Service Worker for YanYu Cloud Quant Analysis Trading System (YYC-QATS)
// Purpose: Offline caching, Market data sync, Web Push Notifications, and Risk Monitoring Stress Test

const CACHE_NAME = 'yanyu-cloud-cache-v1.1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
];

// Stress Test Parameters
const STRESS_TEST_MODE = true; 
const RISK_THRESHOLD_STRESS = 0.05; // 5% fluctuation trigger

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[YYC-SW] Initializing Cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[YYC-SW] Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Mock Risk Monitor Stress Test Logic
// In real scenario, this would listen to periodic syncs or push streams
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'START_RISK_STRESS_TEST') {
    console.log('[YYC-SW] Starting Risk Warning Stress Test...');
    simulateRiskCycle();
  }
});

function simulateRiskCycle() {
  setTimeout(() => {
    const mockVolatility = Math.random() * 0.1;
    if (mockVolatility > RISK_THRESHOLD_STRESS) {
      showRiskNotification('言语云离线风控预警', `检测到极端波动 (${(mockVolatility * 100).toFixed(2)}%)，SW压力测试触发自动熔断。`);
    }
    if (STRESS_TEST_MODE) simulateRiskCycle();
  }, 30000); // Check every 30s for stress test
}

function showRiskNotification(title, body) {
  const options = {
    body,
    icon: '/logo192.png', // Fallback to generic icon if specific not found
    badge: '/favicon.ico',
    vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40], // SOS pattern
    data: {
      timestamp: Date.now(),
      type: 'RISK_MELTDOWN'
    },
    actions: [
      { action: 'emergency_stop', title: '一键紧急撤单' },
      { action: 'view_details', title: '查看风控报告' }
    ],
    tag: 'risk-warning-stress-test',
    renotify: true
  };

  self.registration.showNotification(title, options);
}

// Handle push notifications
self.addEventListener('push', (event) => {
  let data = { title: '言语云系统预警', body: '数据同步异常，请检查网络连接。' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(showRiskNotification(data.title, data.body));
});

// Handle notification actions
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'emergency_stop') {
    // In real scenario, send message to client to execute emergency stop
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'EMERGENCY_STOP_EXECUTED' }));
      })
    );
  } else {
    event.waitUntil(self.clients.openWindow('/'));
  }
});

// Intelligent fetch strategy with offline market support
self.addEventListener('fetch', (event) => {
  // Market data should be Network-First with Cache Fallback for offline viewing
  if (event.request.url.includes('market') || event.request.url.includes('api/quotes')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Assets are Stale-While-Revalidate
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
          }
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      })
    );
  }
});
