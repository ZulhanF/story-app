// Service Worker for PWA with Offline Support and Push Notifications

const CACHE_NAME = 'story-app-v1';
const OFFLINE_URL = '/offline.html';

// Application Shell files (static resources)
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles/styles.css',
  '/scripts/index.js',
  '/scripts/routes/routes.js',
  '/scripts/views/Homepage.js',
  '/scripts/views/loginUI.js',
  '/scripts/views/registerUI.js',
  '/scripts/views/addStoryUI.js',
  '/scripts/views/bookmarkUI.js',
  '/scripts/views/viewStory.js',
  '/scripts/views/notificationUI.js',
  '/scripts/presenters/loginPresenter.js',
  '/scripts/presenters/registerPresenter.js',
  '/scripts/presenters/addStoryPresenter.js',
  '/scripts/presenters/bookmarkPresenter.js',
  '/scripts/presenters/viewStoryPresenter.js',
  '/scripts/presenters/notificationPresenter.js',
  '/scripts/models/loginModel.js',
  '/scripts/models/storyModel.js',
  '/scripts/models/bookmarkModel.js',
  '/scripts/models/notificationModel.js',
  '/scripts/data/api.js',
  '/scripts/config.js',
  '/scripts/utils/map.js',
  '/public/favicon.png',
  '/public/images/logo.png',
  '/public/images/icons/icon-x144.png',
  '/public/images/icons/maskable-icon-x192.png',
  '/public/images/icons/maskable-icon-x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Install event - Cache application shell
self.addEventListener('install', function(event) {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(APP_SHELL_FILES);
      })
      .then(function() {
        console.log('[ServiceWorker] App shell cached');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.log('[ServiceWorker] Error caching app shell:', error);
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', function(event) {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - Serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  console.log('[ServiceWorker] Fetch', event.request.url);
  
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(function() {
          return caches.open(CACHE_NAME)
            .then(function(cache) {
              return cache.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then(function(response) {
            // Cache valid responses
            if (response && response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(function() {
            // If both cache and network fail, return offline page for navigation
            if (event.request.destination === 'document') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Push Notification event
self.addEventListener('push', function(event) {
  let notificationData = {
    title: 'Story App',
    body: 'You have a new notification!',
    icon: '/public/images/logo.png',
    badge: '/public/images/logo.png',
    data: {
      url: '/'
    }
  };

  // Try to parse the push data
  if (event.data) {
    try {
      const data = event.data.json();
      
      // Use the data from server if available
      if (data.title) {
        notificationData.title = data.title;
      }
      
      if (data.options && data.options.body) {
        notificationData.body = data.options.body;
      }
      
      // Keep other properties if provided
      if (data.icon) notificationData.icon = data.icon;
      if (data.badge) notificationData.badge = data.badge;
      if (data.data) notificationData.data = data.data;
      
    } catch (error) {
      console.log('Could not parse push data, using default');
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    data: notificationData.data,
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/public/images/logo.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/public/images/logo.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
});