import CONFIG from '../config.js';

class NotificationModel {
  constructor() {
    this.BASE_URL = 'https://story-api.dicoding.dev/v1';
    this.VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async subscribeToPushNotification(subscription) {
    const response = await fetch(`${this.BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    const responseJson = await response.json();
    
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    return responseJson;
  }

  async unsubscribeFromPushNotification(endpoint) {
    const response = await fetch(`${this.BASE_URL}/notifications/subscribe`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    });

    const responseJson = await response.json();
    
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    return responseJson;
  }

  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notification permission denied');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    return registration;
  }

  async subscribeUserToPush() {
    const registration = await this.registerServiceWorker();
    
    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      return existingSubscription;
    }
    
    // Create new subscription
    const applicationServerKey = this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    });

    return subscription;
  }

  async unsubscribeUserFromPush() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      return subscription.endpoint;
    }
    
    return null;
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  isNotificationSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  getNotificationPermission() {
    return Notification.permission;
  }

  formatSubscriptionForAPI(subscription) {
    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: this.arrayBufferToBase64(subscription.getKey('auth'))
      }
    };
  }

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

export default NotificationModel; 