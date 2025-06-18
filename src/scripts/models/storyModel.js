class StoryModel {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    return localStorage.getItem("token");
  }

  async fetchStories(token) {
    try {
      const response = await fetch(`${this.baseUrl}/stories`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Gagal mengambil cerita. Status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.listStory)) {
        throw new Error("Data yang diterima bukan array!");
      }

      return data.listStory;
    } catch (error) {
      throw new Error("Error saat mengambil cerita: " + error.message);
    }
  }

  async addStory(formData, token) {
    try {
      const response = await fetch(`${this.baseUrl}/stories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Gagal menambahkan cerita. Status: ${response.status}`
        );
      }

      return result;
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
}

export default StoryModel;
