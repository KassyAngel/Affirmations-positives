/* Service Worker for Daily Motivation App */

const CACHE_NAME = 'daily-motivation-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Mise en cache des assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie de cache : Network First, puis Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone la réponse car elle ne peut être utilisée qu'une seule fois
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si le réseau échoue, utiliser le cache
        return caches.match(event.request);
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('[SW] Push reçu:', event);

  let data = {
    title: '🌟 Ta citation du jour',
    body: 'Ta dose de motivation quotidienne t\'attend !',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'daily-quote',
    requireInteraction: false,
    data: {
      url: '/'
    }
  };

  // Si des données sont envoyées avec le push
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      console.error('[SW] Erreur parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      requireInteraction: data.requireInteraction,
      data: data.data,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'open',
          title: 'Voir maintenant'
        },
        {
          action: 'close',
          title: 'Plus tard'
        }
      ]
    })
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification cliquée:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Ouvrir ou focus l'application
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si l'app est déjà ouverte, la focus
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || '/');
      }
    })
  );
});

// Planification des notifications quotidiennes
self.addEventListener('message', (event) => {
  console.log('[SW] Message reçu:', event.data);

  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { time, quote, lang } = event.data;
    scheduleNotification(time, quote, lang);
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fonction pour planifier une notification
async function scheduleNotification(time, quote, lang = 'fr') {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);

  const scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0
  );

  // Si l'heure est déjà passée aujourd'hui, planifier pour demain
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const delay = scheduledTime.getTime() - now.getTime();

  console.log(`[SW] Notification planifiée dans ${Math.round(delay / 1000 / 60)} minutes`);

  // Utiliser setTimeout pour planifier la notification
  setTimeout(() => {
    const title = lang === 'fr' ? '🌟 Ta citation du jour' : '🌟 Your daily quote';
    const body = quote || (lang === 'fr' 
      ? 'Ta dose de motivation quotidienne t\'attend !' 
      : 'Your daily motivation awaits!');

    self.registration.showNotification(title, {
      body,
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: 'daily-quote-scheduled',
      requireInteraction: false,
      data: { url: '/' },
      vibrate: [200, 100, 200]
    });

    // Replanifier pour le lendemain
    scheduleNotification(time, quote, lang);
  }, delay);
}