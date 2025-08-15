// public/sw.js - REPLACE YOUR CURRENT sw.js WITH THIS

console.log('🔧 Service Worker script loaded');

// Install event - force immediate activation
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - claim all clients immediately
self.addEventListener('activate', event => {
  console.log('🔧 Service Worker activating...');
  // Take control of all clients immediately
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('✅ Service Worker activated and claimed all clients');
    })
  );
});

// Push event handler
self.addEventListener('push', event => {
  console.log('📨 Push notification received:', event);
  
  let notificationData = {
    title: 'ZeroBite',
    body: 'New notification'
  };
  
  if (event.data) {
    try {
      notificationData = event.data.json();
      console.log('📨 Push notification data:', notificationData);
    } catch (error) {
      console.error('❌ Error parsing push data:', error);
    }
  }
  
  const options = {
    body: notificationData.body || 'New notification from ZeroBite',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'zerobite-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    actions: []
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title || 'ZeroBite', options)
      .then(() => {
        console.log('✅ Notification shown successfully');
      })
      .catch((error) => {
        console.error('❌ Error showing notification:', error);
      })
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('👆 Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        // If a window is already open, focus it
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        return self.clients.openWindow('/');
      })
  );
});

console.log('🔧 Service Worker event listeners registered');