const NotificationUI = {
  async render() {
    return `
      <div class="notification-container">
        <div class="notification-header">
          <h1><i class="fas fa-bell"></i> Push Notification Settings</h1>
          <p>Kelola notifikasi push untuk mendapatkan update terbaru dari Story App</p>
        </div>

        <div class="notification-content">
          <div class="notification-status-card">
            <div class="status-header">
              <i class="fas fa-info-circle"></i>
              <h3>Status Notifikasi</h3>
            </div>
            <div class="status-content">
              <div class="status-item">
                <span class="status-label">Browser Support:</span>
                <span id="browser-support" class="status-value">Checking...</span>
              </div>
              <div class="status-item">
                <span class="status-label">Permission:</span>
                <span id="permission-status" class="status-value">Checking...</span>
              </div>
              <div class="status-item">
                <span class="status-label">Subscription:</span>
                <span id="subscription-status" class="status-value">Checking...</span>
              </div>
            </div>
          </div>

          <div class="notification-actions">
            <div class="action-card">
              <div class="action-header">
                <i class="fas fa-bell"></i>
                <h3>Subscribe to Notifications</h3>
              </div>
              <p>Dapatkan notifikasi real-time ketika story baru dibuat</p>
              <button id="subscribe-btn" class="btn btn-primary" disabled>
                <i class="fas fa-bell"></i> Subscribe
              </button>
            </div>

            <div class="action-card">
              <div class="action-header">
                <i class="fas fa-bell-slash"></i>
                <h3>Unsubscribe from Notifications</h3>
              </div>
              <p>Berhenti menerima notifikasi push</p>
              <button id="unsubscribe-btn" class="btn btn-secondary" disabled>
                <i class="fas fa-bell-slash"></i> Unsubscribe
              </button>
            </div>
          </div>
        </div>

        <div id="notification-message" class="notification-message" style="display: none;">
          <div class="message-content">
            <span id="message-text"></span>
            <button class="message-close" onclick="this.parentElement.parentElement.style.display='none'">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    // This will be handled by the presenter
  },

  showMessage(message, type = 'info') {
    const messageElement = document.getElementById('notification-message');
    const messageText = document.getElementById('message-text');
    
    if (messageElement && messageText) {
      messageText.textContent = message;
      messageElement.className = `notification-message ${type}`;
      messageElement.style.display = 'block';
      
      // Auto hide after 5 seconds
      setTimeout(() => {
        messageElement.style.display = 'none';
      }, 5000);
    }
  },

  updateStatus(browserSupport, permission, subscription) {
    const browserSupportEl = document.getElementById('browser-support');
    const permissionEl = document.getElementById('permission-status');
    const subscriptionEl = document.getElementById('subscription-status');

    if (browserSupportEl) {
      browserSupportEl.textContent = browserSupport ? 'Supported' : 'Not Supported';
      browserSupportEl.className = `status-value ${browserSupport ? 'success' : 'error'}`;
    }

    if (permissionEl) {
      permissionEl.textContent = permission;
      permissionEl.className = `status-value ${permission === 'granted' ? 'success' : permission === 'denied' ? 'error' : 'warning'}`;
    }

    if (subscriptionEl) {
      subscriptionEl.textContent = subscription ? 'Active' : 'Inactive';
      subscriptionEl.className = `status-value ${subscription ? 'success' : 'warning'}`;
    }
  },

  updateButtons(subscribeEnabled, unsubscribeEnabled) {
    const subscribeBtn = document.getElementById('subscribe-btn');
    const unsubscribeBtn = document.getElementById('unsubscribe-btn');

    if (subscribeBtn) {
      subscribeBtn.disabled = !subscribeEnabled;
      subscribeBtn.className = `btn ${subscribeEnabled ? 'btn-primary' : 'btn-disabled'}`;
    }

    if (unsubscribeBtn) {
      unsubscribeBtn.disabled = !unsubscribeEnabled;
      unsubscribeBtn.className = `btn ${unsubscribeEnabled ? 'btn-secondary' : 'btn-disabled'}`;
    }
  }
};

export default NotificationUI; 