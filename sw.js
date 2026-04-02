const CACHE_NAME = 'divina-italia-v5'; // Nueva versión para forzar actualización
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
const FALLBACK_PAGE = './offline.html';  // Página offline que debes añadir a tu proyecto

// Instalación: Precaching de assets + página offline
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([...ASSETS, FALLBACK_PAGE])
    )
  );
  self.skipWaiting();
});

// Activación: Limpieza de cachés antiguas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

// Estrategia Cache First con fallback a Network y manejos de fallo
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) {
        // Cache encontrado, devuelve rápido y actualiza caché en background
        fetchAndUpdateCache(e.request);
        return cachedResponse;
      }
      // No caché, intenta obtener red
      return fetch(e.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            // Guardar dinámicamente en caché para futuras peticiones
            caches.open(CACHE_NAME).then(cache => {
              cache.put(e.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Si falla fetch y no hay caché respondemos fallback
          if (e.request.destination === 'document') {
            return caches.match(FALLBACK_PAGE);
          }
          // Para otros tipos podemos retornar un recurso genérico o vacío
        });
    })
  );
});

// Función para actualizar caché en background sin bloquear la respuesta
function fetchAndUpdateCache(request) {
  fetch(request).then(networkResponse => {
    if (networkResponse && networkResponse.status === 200) {
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, networkResponse.clone());
      });
    }
  }).catch(() => {
    // Fail silencioso
  });
}
