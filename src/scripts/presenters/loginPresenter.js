class LoginPresenter {
    constructor(model, view) {
      this.model = model;
      this.view = view;
    }
  
    async handleLogin(email, password) {
      try {
        if (!email || !password) {
          throw new Error('Email dan password harus diisi');
        }

        if (!this._isValidEmail(email)) {
          throw new Error('Format email tidak valid');
        }

        if (password.length < 6) {
          throw new Error('Password minimal 6 karakter');
        }

        const response = await this.model.login(email, password);
        const { token, userId, name } = response.loginResult;
  
        this.model.saveLoginData({ token, userId, name });
  
        this.view.showMessage('Login berhasil!', true);
        this.view.redirectToHome();
      } catch (error) {
        this.view.showMessage(`Login gagal: ${error.message}`, false);
      }
    }

    _isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  }
  
  export default LoginPresenter;