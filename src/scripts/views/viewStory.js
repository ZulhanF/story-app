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
        <img src="${story.photoUrl}" alt="Gambar dari ${story.name}">
        <div class="story-content">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <small>Diupload pada ${formatDate}</small>
          <small>Lat: ${story.lat}, Lng: ${story.lon}</small>
        </div>
      `;
      this.container.appendChild(storyElement);
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
