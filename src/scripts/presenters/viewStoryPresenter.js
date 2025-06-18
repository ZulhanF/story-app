class StoryPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
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
}

export default StoryPresenter;
