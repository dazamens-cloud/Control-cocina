const CACHE_NAME = 'divina-italia-v2';
const ASSETS = [
  '/Control-cocina/',
  '/Control-cocina/index.html',
  '/Control-cocina/style.css',
  '/Control-cocina/script.js',
  '/Control-cocina/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
