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