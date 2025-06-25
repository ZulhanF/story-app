import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

const BASE_URL = 'https://story-api.dicoding.dev/v1';
 
// Do precaching
const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);
// Runtime caching
registerRoute(
  ({ url }) => {
    return url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com';
  },
  new CacheFirst({
    cacheName: 'google-fonts',
  }),
);
registerRoute(
  ({ url }) => {
    return url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome');
  },
  new CacheFirst({
    cacheName: 'fontawesome',
  }),
);
registerRoute(
  ({ url }) => {
    return url.origin === 'https://ui-avatars.com';
  },
  new CacheFirst({
    cacheName: 'avatars-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination !== 'image';
  },
  new NetworkFirst({
    cacheName: 'citycare-api',
  }),
);
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'citycare-api-images',
  }),
);
registerRoute(
  ({ url }) => {
    return url.origin.includes('maptiler');
  },
  new CacheFirst({
    cacheName: 'maptiler-api',
  }),
);
 



// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  let notificationData = {
    title: 'Story App',
    body: 'You have a new notification!',
    icon: '/images/logo.png',
    badge: '/images/logo.png',
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
        icon: '/images/logo.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/logo.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

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

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
});

// Install event
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
}); 