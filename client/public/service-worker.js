// Nombre del caché
const CACHE_NAME = 'microprestamos-cache-v1';

// Lista de recursos que quieres cachear
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Agregar otros assets como CSS, JS, imágenes, etc.
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Si la petición es a nuestra API (comienza con /api/ o /onboarding/), 
  // la dejamos pasar directamente a la red.
  // React Query u otra lógica de cliente se encargará de su caché.
  if (requestUrl.pathname.startsWith('/api/') || requestUrl.pathname.startsWith('/onboarding/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para otros recursos (assets de la app como HTML, CSS, JS, imágenes), usamos la estrategia cache-first.
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Si no está en caché, obtener de la red.
        // Opcionalmente, podríamos añadir la respuesta al caché aquí si quisiéramos
        // cachear nuevos assets estáticos dinámicamente, pero para empezar lo mantenemos simple.
        return fetch(event.request);
      })
  );
});