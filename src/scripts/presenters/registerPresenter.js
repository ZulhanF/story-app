class RegisterPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async handleRegister(name, email, password) {
    try {
      await this.model.register(name, email, password);
      this.view.showMessage("Registrasi berhasil! Silakan login.", true);
      this.view.redirectToLogin();
    } catch (error) {
      this.view.showMessage(`Registrasi gagal: ${error.message}`, false);
    }
  }
}

export default RegisterPresenter;
