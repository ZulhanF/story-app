import StoryModel from "../models/storyModel.js";
import StoryView from "./viewStory.js";
import StoryPresenter from "../presenters/viewStoryPresenter.js";

const HomePage = {
  async render() {
    return `
      <section id="home" class="page-enter">
        <h2 class="page-title">Daftar Cerita</h2>
        <div id="storyContainer"></div>
        <div id="map"></div>
      </section>
    `;
  },

  async afterRender() {
    const section = document.getElementById("home");
    if (section) {
      requestAnimationFrame(() => {
        section.classList.add("page-enter-active");
      });

      setTimeout(() => {
        section.classList.remove("page-enter");
        section.classList.remove("page-enter-active");
      }, 600);
    }

    const container = document.getElementById("storyContainer");
    if (!container) {
      console.error("Elemen #storyContainer tidak ditemukan!");
      return;
    }

    const model = new StoryModel("https://story-api.dicoding.dev/v1");
    const view = new StoryView(container, "map");
    const presenter = new StoryPresenter(model, view);

    await presenter.loadStories();
  },
};

export default HomePage;
