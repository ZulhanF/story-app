import LoginPresenter from "../presenters/loginPresenter.js";
import AuthModel from "../models/loginModel.js";

const LoginPage = {
  async render() {
    return `
    <div class="login-container">
      <div class="login-header">
        <h1>Story App</h1>
        <p>Tempat untuk bercerita tentang apapun</p>
      </div>
      <form id="loginForm">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Masukkan Email"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Masukkan password"
            required
          />
        </div>
        <button type="submit" id="loginButton" class="login-btn">
          <span class="button-text">Login</span>
          <span class="loading-spinner" style="display: none;">Loading...</span>
        </button>
        <div class="keterangan">
          <p>Belum punya akun?</p>
          <a href="#/register">Daftar Akun</a>
        </div>
      </form>
      <p id="loginMessage"></p>
    </div>
    `;
  },

  async afterRender() {
    const model = new AuthModel("https://story-api.dicoding.dev/v1");
    const presenter = new LoginPresenter(model, this);

    const form = document.getElementById("loginForm");
    const loginButton = document.getElementById("loginButton");
    const buttonText = loginButton.querySelector(".button-text");
    const loadingSpinner = loginButton.querySelector(".loading-spinner");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email.value;
      const password = form.password.value;

      this._setLoading(true, buttonText, loadingSpinner);

      try {
        await presenter.handleLogin(email, password);
      } finally {
        this._setLoading(false, buttonText, loadingSpinner);
      }
    });
  },

  _setLoading(isLoading, buttonText, loadingSpinner) {
    buttonText.style.display = isLoading ? "none" : "inline";
    loadingSpinner.style.display = isLoading ? "inline" : "none";
  },

  showMessage(message, isSuccess) {
    const messageElement = document.getElementById("loginMessage");
    messageElement.style.color = isSuccess ? "green" : "red";
    messageElement.textContent = message;

    if (isSuccess) {
      setTimeout(() => {
        messageElement.textContent = "";
      }, 3000);
    }
  },

  redirectToHome() {
    window.location.hash = "/home";
  },
};

export default LoginPage;
