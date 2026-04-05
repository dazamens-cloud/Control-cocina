const CACHE_NAME = 'divina-italia-v6'; // ✅ Subimos versión para forzar actualización
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

// Instalación: Guardar archivos esenciales
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activación: Limpiar versiones viejas
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

// ✅ Estrategia: Cache First con Network fallback corregido
self.addEventListener('fetch', e => {
  // Solo cacheamos peticiones GET
  if (e.request.method !== 'GET') return;

  // No cachear peticiones al Google Apps Script
  if (e.request.url.includes('script.google.com')) return;

  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) {
        // ✅ Actualizar caché en background sin bloquear
        e.waitUntil(
          fetch(e.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              return caches.open(CACHE_NAME).then(cache => {
                return cache.put(e.request, networkResponse);
              });
            }
          }).catch(() => {})
        );
        return cachedResponse;
      }

      // No hay caché, intentar red
      return fetch(e.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // ✅ Clonar ANTES de usar la respuesta
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Sin red y sin caché → página offline
        if (e.request.destination === 'document') {
          return caches.match('./offline.html');
        }
      });
    })
  );
});
