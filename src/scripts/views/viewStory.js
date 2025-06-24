class StoryView {
  constructor(container, mapId) {
    this.container = container;
    this.mapId = mapId;
    this.map = null;
  }

  renderStories(stories) {
    if (!stories || stories.length === 0) {
      this.container.innerHTML = "<p>Belum ada cerita yang ditampilkan.</p>";
      return;
    }

    this.container.innerHTML = "";
    stories.forEach((story) => {
      const formatDate = new Date(story.createdAt).toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const storyElement = document.createElement("div");
      storyElement.classList.add("story-item");
      storyElement.innerHTML = `
        <div class="story-image-container">
          ${story.photoUrl ? 
            `<img src="${story.photoUrl}" alt="Gambar dari ${story.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : 
            ''
          }
          <div class="story-image-placeholder" style="display: ${story.photoUrl ? 'none' : 'flex'};">
            <i class="fas fa-image"></i>
            <span>Gambar tidak tersedia</span>
          </div>
        </div>
        <div class="story-content">
          <div class="story-header">
            <h3>${story.name}</h3>
          </div>
          <div class="story-description">
            <p>${story.description}</p>
          </div>
          <div class="story-footer">
            <div class="story-meta">
              <small><i class="fas fa-calendar"></i> Diupload pada ${formatDate}</small>
              <small><i class="fas fa-map-marker-alt"></i> Lat: ${story.lat}, Lng: ${story.lon}</small>
            </div>
            <button class="btn btn-primary btn-bookmark-story" data-id="${story.id}">
              <i class="fas fa-bookmark"></i> Simpan Bookmark
            </button>
          </div>
        </div>
      `;
      this.container.appendChild(storyElement);

      // Tambahkan event listener untuk tombol bookmark
      const bookmarkBtn = storyElement.querySelector('.btn-bookmark-story');
      if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', () => {
          if (typeof this.onBookmarkStory === 'function') {
            this.onBookmarkStory(story);
          } else {
            // Fallback: dispatch custom event
            const event = new CustomEvent('bookmark-story', { detail: story });
            this.container.dispatchEvent(event);
          }
        });
      }
    });

    // Initialize map after stories are rendered
    this.initializeMap(stories);
  }

  renderError(errorMessage) {
    this.container.innerHTML = `
      <div class="error-container">
        <h2>Oops! Terjadi Kesalahan</h2>
        <p>${errorMessage}</p>
        <button class="btn" onclick="window.location.reload()">Refresh Halaman</button>
      </div>
    `;
  }

  initializeMap(stories) {
    try {
      const mapContainer = document.getElementById(this.mapId);
      if (!mapContainer) {
        console.warn("Elemen peta tidak ditemukan!");
        return;
      }

      // Clear any existing map
      if (this.map) {
        this.map.remove();
      }

      // Initialize new map
      this.map = L.map(this.mapId).setView([-6.2, 106.8], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(this.map);

      // Add markers for each story
      stories.forEach((story) => {
        if (story.lat && story.lon) {
          const marker = L.marker([story.lat, story.lon]).addTo(this.map);
          marker.bindPopup(`<b>${story.name}</b><br>${story.description}`);
        }
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }
}

export default StoryView;
