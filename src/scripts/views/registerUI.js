import RegisterPresenter from "../presenters/registerPresenter.js";
import AuthModel from "../models/loginModel.js";

const RegisterPage = {
  async render() {
    return `
    <div class="login-container">
      <div class="login-header">
        <h1>Story App</h1>
        <p>Tempat untuk bercerita tentang apapun</p>
      </div>
      <form id="registerForm">
        <div class="form-group">
          <label for="name">Nama</label>
          <input type="text" id="name" name="name" placeholder="Masukkan Nama" required />
        </div>
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
          <span class="button-text">Register</span>
          <span class="loading-spinner" style="display: none;">Loading...</span>
        </button>
        <div class="keterangan">
          <p>Sudah punya akun?</p>
          <a href="#/">Masuk Akun</a>
        </div>
      </form>
      <p id="registerMessage"></p>
    </div>
  `;
  },

  async afterRender() {
    const model = new AuthModel("https://story-api.dicoding.dev/v1");
    const presenter = new RegisterPresenter(model, this);

    const form = document.getElementById("registerForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;

      presenter.handleRegister(name, email, password);
    });
  },

  showMessage(message, isSuccess) {
    const messageElement = document.getElementById("registerMessage");
    messageElement.style.color = isSuccess ? "green" : "red";
    messageElement.textContent = message;
  },

  redirectToLogin(delay = 1500) {
    setTimeout(() => {
      window.location.hash = "#/";
    }, delay);
  },
};

export default RegisterPage;
