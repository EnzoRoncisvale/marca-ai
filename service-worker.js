const CACHE_NAME = 'marca-ai-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './login.html',
  './app.css',
  './app.js',
  './manifest.json',
  './assets/img/marca-ai-logo.svg',
  './assets/img/marca-ai-short.svg',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './assets/vendor/leaflet/leaflet.css',
  './assets/vendor/leaflet/leaflet.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Cache addAll warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Não intercepta chamadas de API do backend (sempre frescas na rede)
  if (requestUrl.pathname.startsWith('/api/')) {
    return;
  }

  // Network First, fallback to cache para os assets da interface
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
