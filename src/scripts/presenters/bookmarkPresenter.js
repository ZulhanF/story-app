// bookmarkPresenter.js
// Presenter untuk halaman bookmark
import BookmarkModel from '../models/bookmarkModel.js';
import BookmarkUI from '../views/bookmarkUI.js';

class BookmarkPresenter {
  constructor() {
    this.model = new BookmarkModel();
    this.container = null;
  }

  async init() {
    console.log('BookmarkPresenter init called');
    
    // Wait a bit for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 50));
    
    this.container = document.getElementById('bookmarkContainer');
    if (!this.container) {
      console.error('Container bookmark tidak ditemukan!');
      // Try again after a short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      this.container = document.getElementById('bookmarkContainer');
      if (!this.container) {
        console.error('Container bookmark masih tidak ditemukan setelah retry!');
        return;
      }
    }
    
    console.log('Container found, loading bookmarks...');
    await this.loadBookmarks();
  }

  async loadBookmarks() {
    try {
      console.log('loadBookmarks called');
      const stories = await this.model.getAllBookmarks();
      console.log('Bookmarks loaded from IndexedDB:', stories.length);
      
      // Filter dan validasi data
      const validStories = stories.filter(story => {
        return story && 
               story.id && 
               story.name && 
               story.description && 
               story.photoUrl;
      });
      
      console.log('Valid bookmarks after filtering:', validStories.length);
      
      // Check if container is still available
      if (!this.container) {
        console.error('Container lost during loadBookmarks');
        this.container = document.getElementById('bookmarkContainer');
        if (!this.container) {
          console.error('Container still not found');
          return;
        }
      }
      
      this.renderBookmarks(validStories);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      this.renderError('Gagal memuat bookmark: ' + error.message);
    }
  }

  renderBookmarks(stories) {
    console.log('renderBookmarks called with:', stories.length, 'stories');
    
    if (!this.container) {
      console.error('Container tidak tersedia untuk render');
      return;
    }
    
    if (!stories || stories.length === 0) {
      console.log('No stories to render, showing empty state');
      this.container.innerHTML = `
        <div class="empty-state">
          <h3><i class="fas fa-bookmark"></i> Belum ada cerita yang disimpan</h3>
          <p>Simpan cerita favorit Anda dari halaman utama untuk melihatnya di sini</p>
          <button class="btn btn-primary" onclick="window.location.hash='#/home'">
            <i class="fas fa-home"></i> Kembali ke Beranda
          </button>
        </div>
      `;
      return;
    }

    console.log(`Rendering ${stories.length} stories`);
    this.container.innerHTML = '';
    
    stories.forEach((story, index) => {
      // Ensure all required fields exist
      const safeStory = {
        id: story.id || 'unknown',
        name: story.name || 'Judul tidak tersedia',
        description: story.description || 'Deskripsi tidak tersedia',
        photoUrl: story.photoUrl || '',
        createdAt: story.createdAt || new Date().toISOString(),
        lat: story.lat || 0,
        lon: story.lon || 0
      };
      
      const formatDate = new Date(safeStory.createdAt).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const storyElement = document.createElement('div');
      storyElement.classList.add('story-item');
      storyElement.innerHTML = `
        <div class="story-image-container">
          ${safeStory.photoUrl ? 
            `<img src="${safeStory.photoUrl}" alt="Gambar dari ${safeStory.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : 
            ''
          }
          <div class="story-image-placeholder" style="display: ${safeStory.photoUrl ? 'none' : 'flex'};">
            <i class="fas fa-image"></i>
            <span>Gambar tidak tersedia</span>
          </div>
        </div>
        <div class="story-content">
          <div class="story-header">
            <h3><i class="fas fa-bookmark"></i> ${safeStory.name}</h3>
          </div>
          <div class="story-description">
            <p>${safeStory.description}</p>
          </div>
          <div class="story-footer">
            <div class="story-meta">
              <small><i class="fas fa-calendar"></i> Diupload pada ${formatDate}</small>
              <small><i class="fas fa-map-marker-alt"></i> Lat: ${safeStory.lat}, Lng: ${safeStory.lon}</small>
            </div>
            <button class="btn btn-danger btn-delete-bookmark" data-id="${safeStory.id}">
              <i class="fas fa-trash"></i> Hapus dari Bookmark
            </button>
          </div>
        </div>
      `;
      
      this.container.appendChild(storyElement);
    });

    console.log('All stories rendered, adding event listeners');

    // Add event listeners for delete buttons
    this.container.querySelectorAll('.btn-delete-bookmark').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('button').dataset.id;
        this.deleteBookmark(id);
      });
    });
    
    console.log('Event listeners added');
  }

  renderError(errorMessage) {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="error-container">
        <h2><i class="fas fa-exclamation-triangle"></i> Oops! Terjadi Kesalahan</h2>
        <p>${errorMessage}</p>
        <button class="btn btn-primary" onclick="window.location.reload()">
          <i class="fas fa-refresh"></i> Refresh Halaman
        </button>
      </div>
    `;
  }

  async deleteBookmark(id) {
    try {
      await this.model.deleteBookmark(id);
      console.log('Bookmark deleted:', id);
      
      // Show success message
      this.showMessage('Bookmark berhasil dihapus!', 'success');
      
      // Reload the list
      await this.loadBookmarks();
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      this.showMessage('Gagal menghapus bookmark: ' + error.message, 'error');
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
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (messageElement.parentElement) {
        messageElement.remove();
      }
    }, 3000);
  }
}

export default BookmarkPresenter; 