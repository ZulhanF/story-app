// BookmarkUI.js
// Halaman Bookmark: Menampilkan, menghapus, dan menyimpan cerita ke IndexedDB

const BookmarkUI = {
  async render() {
    return `
      <section id="bookmark" class="page-enter bookmark-page">
        <h2 class="page-title">Bookmark Cerita</h2>
        <div id="bookmarkContainer"></div>
      </section>
    `;
  },

  async afterRender() {
    console.log('BookmarkUI afterRender called');
    
    // Wait for DOM to be fully ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const container = document.getElementById('bookmarkContainer');
    if (!container) {
      console.error('bookmarkContainer tidak ditemukan!');
      // Try to find it again after a short delay
      await new Promise(resolve => setTimeout(resolve, 200));
      const retryContainer = document.getElementById('bookmarkContainer');
      if (!retryContainer) {
        console.error('bookmarkContainer masih tidak ditemukan setelah retry');
        return;
      }
    }
    
    console.log('bookmarkContainer found, initializing presenter');
    
    try {
      const BookmarkPresenter = (await import('../presenters/bookmarkPresenter.js')).default;
      const presenter = new BookmarkPresenter();
      await presenter.init();
    } catch (error) {
      console.error('Error initializing BookmarkPresenter:', error);
      // Show error message to user
      const container = document.getElementById('bookmarkContainer');
      if (container) {
        container.innerHTML = `
          <div class="error-container">
            <h2><i class="fas fa-exclamation-triangle"></i> Error Loading Bookmarks</h2>
            <p>${error.message}</p>
            <button class="btn btn-primary" onclick="window.location.reload()">
              <i class="fas fa-refresh"></i> Refresh Page
            </button>
          </div>
        `;
      }
    }
  }
};

export default BookmarkUI; 