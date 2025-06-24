// bookmarkModel.js
// Model untuk operasi IndexedDB pada bookmark cerita

const DB_NAME = 'story-app-db';
const DB_VERSION = 1;
const STORE_NAME = 'bookmarks';

class BookmarkModel {
  constructor() {
    this.dbPromise = this.openDB();
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addBookmark(story) {
    try {
      console.log('Adding bookmark:', story); // Debug log
      
      // Ensure story has all required fields
      const bookmarkData = {
        id: story.id,
        name: story.name,
        description: story.description,
        photoUrl: story.photoUrl,
        createdAt: story.createdAt,
        lat: story.lat,
        lon: story.lon
      };
      
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(bookmarkData);
        req.onsuccess = () => {
          console.log('Bookmark added successfully:', bookmarkData.id);
          resolve(true);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  async getAllBookmarks() {
    try {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const bookmarks = req.result;
          console.log('Retrieved bookmarks:', bookmarks); // Debug log
          resolve(bookmarks);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      throw error;
    }
  }

  async deleteBookmark(id) {
    try {
      console.log('Deleting bookmark:', id); // Debug log
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => {
          console.log('Bookmark deleted successfully:', id);
          resolve(true);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
    }
  }

  async getBookmark(id) {
    try {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.error('Error getting bookmark:', error);
      throw error;
    }
  }

  // Method untuk debugging - hapus semua bookmark
  async clearAllBookmarks() {
    try {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => {
          console.log('All bookmarks cleared');
          resolve(true);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
      throw error;
    }
  }
}

export default BookmarkModel; 