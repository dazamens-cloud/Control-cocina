const CACHE_NAME = 'divina-italia-v4'; // Subimos versión
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icons/icon-192.png'
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
      keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k); })
    ))
  );
});

// Estrategia: Cache First, luego Network (para que la app abra instantáneo)
self.addEventListener('fetch', e => {
  // Solo cacheamos peticiones GET (archivos), no los POST de datos
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
