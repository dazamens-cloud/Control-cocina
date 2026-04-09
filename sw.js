// ─────────────────────────────────────────────
// sw.js - Divina Italia El Charco
// Estrategia: Network-first para app (siempre
// sirve la versión más reciente), cache-first
// solo para imágenes y fuentes.
// Incrementa CACHE_VERSION con cada deploy.
// ─────────────────────────────────────────────

const CACHE_VERSION = 'v10';
const CACHE_APP     = 'divina-app-'   + CACHE_VERSION;
const CACHE_STATIC  = 'divina-static-' + CACHE_VERSION;

// Archivos de la app (se sirven siempre desde la red si hay conexión)
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './offline.html'
];

// Archivos estáticos pesados (cache-first, cambian poco)
const STATIC_ASSETS = [
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/logo-hero.png'
];

// ── INSTALL: precachear todo ─────────────────
self.addEventListener('install', function(e) {
  e.waitUntil(
    Promise.all([
      caches.open(CACHE_APP).then(function(cache) {
        return cache.addAll(APP_SHELL);
      }),
      caches.open(CACHE_STATIC).then(function(cache) {
        return cache.addAll(STATIC_ASSETS);
      })
    ])
  );
  // Activar inmediatamente sin esperar a que cierren las pestañas
  self.skipWaiting();
});

// ── ACTIVATE: borrar caches antiguas ─────────
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          // Eliminar cualquier cache que no sea de esta versión
          if (key !== CACHE_APP && key !== CACHE_STATIC) {
            console.log('[SW] Borrando cache antigua:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Tomar control de todas las pestañas abiertas inmediatamente
  self.clients.claim();
});

// ── FETCH ─────────────────────────────────────
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // No interceptar POST ni llamadas externas
  if (e.request.method !== 'GET')              return;
  if (url.includes('script.google.com'))       return;
  if (url.includes('fonts.googleapis.com'))    return;
  if (url.includes('fonts.gstatic.com'))       return;
  if (url.includes('transparenttextures.com')) return;

  // IMÁGENES y fuentes locales → cache-first
  if (
    url.match(/\.(png|jpg|jpeg|webp|gif|svg|woff2?)$/) ||
    url.includes('/icons/')
  ) {
    e.respondWith(cacheFirst(e.request, CACHE_STATIC));
    return;
  }

  // APP SHELL (html, css, js) → network-first
  // Intenta la red; si falla usa la cache; si no hay cache usa offline.html
  e.respondWith(networkFirst(e.request));
});

// ── ESTRATEGIA: Network-first ─────────────────
function networkFirst(request) {
  return fetch(request)
    .then(function(networkResponse) {
      // Respuesta válida → actualizar cache y devolver
      if (networkResponse && networkResponse.status === 200) {
        var clone = networkResponse.clone();
        caches.open(CACHE_APP).then(function(cache) {
          cache.put(request, clone);
        });
      }
      return networkResponse;
    })
    .catch(function() {
      // Sin red → usar cache
      return caches.match(request).then(function(cached) {
        if (cached) return cached;
        // Sin cache y sin red → página offline
        if (request.destination === 'document') {
          return caches.match('./offline.html');
        }
      });
    });
}

// ── ESTRATEGIA: Cache-first ───────────────────
function cacheFirst(request, cacheName) {
  return caches.match(request).then(function(cached) {
    if (cached) return cached;
    // No está en cache → buscar en red y guardar
    return fetch(request).then(function(networkResponse) {
      if (networkResponse && networkResponse.status === 200) {
        var clone = networkResponse.clone();
        caches.open(cacheName).then(function(cache) {
          cache.put(request, clone);
        });
      }
      return networkResponse;
    });
  });
}
