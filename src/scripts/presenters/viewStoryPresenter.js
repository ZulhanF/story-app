import BookmarkModel from '../models/bookmarkModel.js';

class StoryPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.bookmarkModel = new BookmarkModel();
    // Set up handler for bookmarking
    this.view.onBookmarkStory = this.handleBookmarkStory.bind(this);
  }

  async loadStories() {
    try {
      const token = this.model.getToken();
      if (!token) {
        this.view.renderError("Token tidak ditemukan. Silakan login terlebih dahulu.");
        return;
      }

      const stories = await this.model.fetchStories(token);
      if (!stories || stories.length === 0) {
        this.view.renderStories([]);
        return;
      }

      const validStories = stories.filter(
        (story) => story.lat !== null && story.lon !== null
      );

      this.view.renderStories(validStories);
    } catch (error) {
      console.error("Error loading stories:", error);
      this.view.renderError(
        error.message || "Gagal memuat cerita. Silakan coba lagi."
      );
    }
  }

  async handleBookmarkStory(story) {
    try {
      await this.bookmarkModel.addBookmark(story);
      this.showMessage('Cerita berhasil disimpan ke bookmark!', 'success');
    } catch (error) {
      this.showMessage('Gagal menyimpan bookmark: ' + (error.message || error), 'error');
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
    document.body.appendChild(messageElement);
    setTimeout(() => {
      if (messageElement.parentElement) {
        messageElement.remove();
      }
    }, 5000);
  }
}

export default StoryPresenter;
