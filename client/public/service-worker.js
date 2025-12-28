// Versión del caché - CAMBIAR en cada deploy para forzar actualización
const CACHE_VERSION = 'v2';
const CACHE_NAME = `microprestamos-cache-${CACHE_VERSION}`;

// Lista de recursos estáticos que queremos cachear (NO incluir index.html)
const urlsToCache = [
  '/manifest.json',
  // Los assets con hash de Vite se cachean automáticamente en fetch
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  // Forzar que el nuevo SW tome control inmediatamente
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del service worker
self.addEventListener('activate', (event) => {
  // Tomar control de todos los clientes inmediatamente
  event.waitUntil(
    Promise.all([
      // Limpiar caches viejos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Eliminando cache viejo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control de clientes activos
      self.clients.claim()
    ])
  );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Peticiones a API - siempre red (no cachear)
  if (requestUrl.pathname.startsWith('/api/') || requestUrl.pathname.startsWith('/onboarding/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // HTML y navegación - SIEMPRE red primero (network-first)
  // Esto es CRÍTICO para evitar el problema de pantalla blanca
  if (event.request.mode === 'navigate' ||
      requestUrl.pathname === '/' ||
      requestUrl.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cachear la respuesta fresca
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Solo usar cache si la red falla (offline)
          return caches.match(event.request);
        })
    );
    return;
  }

  // Assets estáticos con hash (JS, CSS, imágenes) - cache-first
  // Los hashes de Vite garantizan que archivos nuevos tienen URLs nuevas
  if (requestUrl.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((networkResponse) => {
            // Cachear el nuevo asset
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          });
        })
    );
    return;
  }

  // Otros recursos - network-first con fallback a cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Escuchar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
