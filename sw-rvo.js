/* Rent vs Own — Service Worker
   Caches the app shell + CDN scripts so it loads offline/on spotty LTE.
   Version bump CACHE_NAME to force refresh after major updates. */

const CACHE_NAME = 'rvo-v16';
const SHELL = [
  './rent-vs-own.html',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// Install: pre-cache the app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first for shell assets, network-first for API calls
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Never intercept Supabase or Apps Script (lead submission must be live)
  if (url.includes('supabase.co') || url.includes('script.google.com')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache successful GET responses for CDN scripts
        if (e.request.method === 'GET' && response.ok && (
          url.includes('jsdelivr.net') || url.includes('cdnjs.cloudflare.com')
        )) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: return cached HTML for navigation requests
        if (e.request.mode === 'navigate') {
          return caches.match('./rent-vs-own.html');
        }
      });
    })
  );
});
