class AuthModel {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Login gagal");
    }

    return result;
  }
  saveLoginData({ token, userId, name }) {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("name", name);
  }
  getToken() {
    return localStorage.getItem("token");
  }

  getUserId() {
    return localStorage.getItem("userId");
  }

  getUserName() {
    return localStorage.getItem("name");
  }

  clearLoginData() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
  }

  async register(name, email, password) {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Registrasi gagal");
    }

    return result;
  }
}

export default AuthModel;
