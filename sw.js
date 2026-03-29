const CACHE_NAME = 'divina-italia-v3';
const ASSETS = [
  '/Control-cocina/',
  '/Control-cocina/index.html',
  '/Control-cocina/style.css',
  '/Control-cocina/script.js',
  '/Control-cocina/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // activa el nuevo SW inmediatamente
});

self.addEventListener('activate', e => {
  // elimina cachés viejas
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // toma control de todas las pestañas abiertas
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
