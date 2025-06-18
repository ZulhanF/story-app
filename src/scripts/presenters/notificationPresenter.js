import NotificationUI from '../views/notificationUI.js';
import NotificationModel from '../models/notificationModel.js';

class NotificationPresenter {
  constructor() {
    this.notificationModel = new NotificationModel();
    this.currentSubscription = null;
  }

  async init() {
    await this.checkNotificationSupport();
    this.setupEventListeners();
  }

  async checkNotificationSupport() {
    try {
      const isSupported = this.notificationModel.isNotificationSupported();
      const permission = this.notificationModel.getNotificationPermission();
      
      // Check if user is already subscribed
      let isSubscribed = false;
      if (isSupported && permission === 'granted') {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          this.currentSubscription = subscription;
          isSubscribed = !!subscription;
        } catch (error) {
          console.log('No existing subscription found');
        }
      }

      // Update UI
      NotificationUI.updateStatus(isSupported, permission, isSubscribed);
      
      // Update button states
      const canSubscribe = isSupported && (permission === 'default' || permission === 'granted') && !isSubscribed;
      const canUnsubscribe = isSupported && isSubscribed;
      
      NotificationUI.updateButtons(canSubscribe, canUnsubscribe);

    } catch (error) {
      console.error('Error checking notification support:', error);
      NotificationUI.showMessage('Error checking notification support', 'error');
    }
  }

  setupEventListeners() {
    const subscribeBtn = document.getElementById('subscribe-btn');
    const unsubscribeBtn = document.getElementById('unsubscribe-btn');

    if (subscribeBtn) {
      subscribeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSubscribe();
      });
    }

    if (unsubscribeBtn) {
      unsubscribeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleUnsubscribe();
      });
    }

  }

  async handleSubscribe() {
    try {
      // Show loading state
      const subscribeBtn = document.getElementById('subscribe-btn');
      if (subscribeBtn) {
        subscribeBtn.disabled = true;
        subscribeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
      }

      // Request permission first
      const permissionGranted = await this.notificationModel.requestNotificationPermission();
      
      if (!permissionGranted) {
        NotificationUI.showMessage('Notification permission denied', 'error');
        await this.checkNotificationSupport();
        return;
      }

      // Subscribe to push notifications
      const subscription = await this.notificationModel.subscribeUserToPush();
      
      // Send subscription to server
      const subscriptionData = this.notificationModel.formatSubscriptionForAPI(subscription);
      await this.notificationModel.subscribeToPushNotification(subscriptionData);
      
      this.currentSubscription = subscription;
      
      // Update UI
      NotificationUI.updateStatus(true, 'granted', true);
      NotificationUI.updateButtons(false, true);
      NotificationUI.showMessage('Successfully subscribed to push notifications!', 'success');

    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      NotificationUI.showMessage(`Failed to subscribe: ${error.message}`, 'error');
      await this.checkNotificationSupport();
    } finally {
      // Reset button state
      const subscribeBtn = document.getElementById('subscribe-btn');
      if (subscribeBtn) {
        subscribeBtn.disabled = false;
        subscribeBtn.innerHTML = '<i class="fas fa-bell"></i> Subscribe';
      }
    }
  }

  async handleUnsubscribe() {
    try {
      if (!this.currentSubscription) {
        NotificationUI.showMessage('No active subscription found', 'warning');
        return;
      }

      // Unsubscribe from push notifications
      const endpoint = await this.notificationModel.unsubscribeUserFromPush();
      
      if (endpoint) {
        // Send unsubscribe request to server
        await this.notificationModel.unsubscribeFromPushNotification(endpoint);
      }
      
      this.currentSubscription = null;
      
      // Update UI
      NotificationUI.updateStatus(true, 'granted', false);
      NotificationUI.updateButtons(true, false);
      NotificationUI.showMessage('Successfully unsubscribed from push notifications', 'success');

    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      NotificationUI.showMessage(`Failed to unsubscribe: ${error.message}`, 'error');
      await this.checkNotificationSupport();
    }
  }
}

export default NotificationPresenter; 