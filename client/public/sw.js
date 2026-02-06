const CACHE_NAME = 'motivation-pwa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Notifications push support
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'Citation du jour disponible !',
    icon: '/favicon.png',
    badge: '/favicon.png'
  };

  event.waitUntil(
    self.registration.showNotification('Motivation Quotidienne', options)
  );
});
