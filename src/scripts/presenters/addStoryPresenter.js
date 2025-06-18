import AddStoryUI from '../views/addStoryUI.js';
import StoryModel from '../models/storyModel.js';

class AddStoryPresenter {
  constructor() {
    // Don't initialize storyModel here, it will be set by the view
    this.storyModel = null;
  }

  async init() {
    // Remove setupEventListeners and setupCamera as they're handled in the view
    // This prevents conflicts with the view's event handling
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    if (!this.storyModel) {
      console.error('StoryModel not initialized');
      this.showMessage('Error: StoryModel not initialized', 'error');
      return;
    }

    const formData = new FormData(event.target);
    const description = formData.get('description');
    const photo = formData.get('photo');
    const lat = formData.get('lat');
    const lon = formData.get('lon');

    try {
      // Show loading state
      const submitButton = event.target.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Story...';
      }

      // Create story
      const result = await this.storyModel.addStory(formData, this.storyModel.getToken());
      
      if (result.error) {
        throw new Error(result.message);
      }
      
      // Show success message
      this.showMessage('Story created successfully!', 'success');
      
      // Trigger notification after story is created
      await this.triggerNotification(description);
      
      // Reset form
      event.target.reset();
      const photoPreview = document.getElementById('photoPreview');
      if (photoPreview) {
        photoPreview.classList.remove('show');
      }

      // Redirect to home after a short delay
      setTimeout(() => {
        window.location.hash = '#/home';
      }, 2000);

    } catch (error) {
      console.error('Error creating story:', error);
      this.showMessage(`Failed to create story: ${error.message}`, 'error');
    } finally {
      // Reset button state
      const submitButton = event.target.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Kirim';
      }
    }
  }

  async handleSubmitWithData(formData, event) {
    if (!this.storyModel) {
      console.error('StoryModel not initialized');
      this.showMessage('Error: StoryModel not initialized', 'error');
      return;
    }

    const description = formData.get('description');
    const photo = formData.get('photo');
    const lat = formData.get('lat');
    const lon = formData.get('lon');

    try {
      // Show loading state
      const submitButton = event.target.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Story...';
      }

      // Create story
      const result = await this.storyModel.addStory(formData, this.storyModel.getToken());
      
      if (result.error) {
        throw new Error(result.message);
      }
      
      // Show success message
      this.showMessage('Story created successfully!', 'success');
      
      // Trigger notification after story is created
      await this.triggerNotification(description);
      
      // Reset form
      event.target.reset();
      const photoPreview = document.getElementById('photoPreview');
      if (photoPreview) {
        photoPreview.classList.remove('show');
      }

      // Redirect to home after a short delay
      setTimeout(() => {
        window.location.hash = '#/home';
      }, 2000);

    } catch (error) {
      console.error('Error creating story:', error);
      this.showMessage(`Failed to create story: ${error.message}`, 'error');
    } finally {
      // Reset button state
      const submitButton = event.target.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Kirim';
      }
    }
  }

  async triggerNotification(description) {
    try {
      // Check if user is subscribed to notifications
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Show notification after story creation
        await registration.showNotification('Story berhasil dibuat', {
          body: `Anda telah membuat story baru dengan deskripsi: ${description}`,
          icon: '/images/logo.png',
          badge: '/images/logo.png',
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
        });
      }
    } catch (error) {
      console.error('Error triggering notification:', error);
    }
  }

  showMessage(message, type = 'info') {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.innerHTML = `
      <div class="message-content">
        <span>${message}</span>
        <button class="message-close" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    // Add styles
    messageElement.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      animation: slideIn 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(messageElement);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageElement.parentElement) {
        messageElement.remove();
      }
    }, 5000);
  }
}

export default AddStoryPresenter;
