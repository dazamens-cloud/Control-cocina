const CACHE_NAME = 'divina-italia-v7';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './offline.html',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => {
        if (k !== CACHE_NAME) return caches.delete(k);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // ✅ No interceptar peticiones POST ni a Google Script
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('script.google.com')) return;
  if (e.request.url.includes('fonts.googleapis.com')) return;

  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      // ✅ Si está en caché lo devolvemos directamente
      if (cachedResponse) return cachedResponse;

      // ✅ Si no está en caché intentamos la red
      return fetch(e.request)
        .then(networkResponse => {
          // ✅ Solo cacheamos respuestas válidas
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
            return networkResponse;
          }
          // ✅ Clonamos ANTES de cachear
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return networkResponse;
        })
        .catch(() => {
          // ✅ Sin red → página offline
          if (e.request.destination === 'document') {
            return caches.match('./offline.html');
          }
        });
    })
  );
});
