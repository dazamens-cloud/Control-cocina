const CACHE_NAME = 'divina-italia-v3';
const ASSETS = [
  '/Control-cocina/',
  '/Control-cocina/index.html',
  '/Control-cocina/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Para peticiones al script de Google (API), siempre red
  if (event.request.url.includes('script.google.com') ||
      event.request.url.includes('api.anthropic.com') ||
      event.request.url.includes('fonts.googleapis.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para el resto, cache first, luego red
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      });
    }).catch(function() {
      return caches.match('/Control-cocina/index.html');
    })
  );
});
