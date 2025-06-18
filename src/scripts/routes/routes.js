import HomePage from '../views/Homepage.js';
import AddStoryPage from '../views/addStoryUI.js';
import LoginPage from '../views/loginUI.js';
import RegisterPage from '../views/registerUI.js';
import NotificationPage from '../views/notificationUI.js';
import NotificationPresenter from '../presenters/notificationPresenter.js';
import AddStoryPresenter from '../presenters/addStoryPresenter.js';
import AuthModel from '../models/loginModel.js';

// Initialize AuthModel
const authModel = new AuthModel('https://story-api.dicoding.dev/v1');

const routes = {
  '/': {
    render: async () => {
      if (authModel.getToken()) {
        window.location.hash = '#/home';
        return '';
      }
      document.body.classList.add('login-page');
      return await LoginPage.render();
    },
    afterRender: async () => {
      if (!authModel.getToken()) {
        await LoginPage.afterRender();
      }
    }
  },

  '/register': {
    render: async () => {
      if (authModel.getToken()) {
        window.location.hash = '#/home';
        return '';
      }
      document.body.classList.add('login-page');
      return await RegisterPage.render();
    },
    afterRender: async () => {
      if (!authModel.getToken()) {
        await RegisterPage.afterRender();
      }
    }
  },

  '/home': {
    render: async () => {
      if (!authModel.getToken()) {
        window.location.hash = '#/';
        return '';
      }
      document.body.classList.remove('login-page');
      return await HomePage.render();
    },
    afterRender: async () => {
      if (authModel.getToken()) {
        await HomePage.afterRender();
      }
    }
  },
  '/add-story': {
    render: async () => {
      if (!authModel.getToken()) {
        window.location.hash = '#/';
        return '';
      }
      document.body.classList.remove('login-page');
      return await AddStoryPage.render();
    },
    afterRender: async () => {
      if (authModel.getToken()) {
        await AddStoryPage.afterRender();
        // Presenter is already initialized in the view
      }
    }
  },
  '/notifications': {
    render: async () => {
      if (!authModel.getToken()) {
        window.location.hash = '#/';
        return '';
      }
      document.body.classList.remove('login-page');
      return await NotificationPage.render();
    },
    afterRender: async () => {
      if (authModel.getToken()) {
        await NotificationPage.afterRender();
        // Initialize notification presenter
        try {
          const presenter = new NotificationPresenter();
          await presenter.init();
        } catch (error) {
          console.error('Error initializing notification presenter:', error);
        }
      }
    }
  }
};

const Router = {
  init() {
    this.loadPage = this.loadPage.bind(this);
    window.addEventListener('hashchange', this.loadPage);

    // Setup logout handler
    this.setupLogoutHandler();
    
    // Initial page load
    this.loadPage();
    this.updateNavbarAuthLinks();
  },

  setupLogoutHandler() {
    const logoutLink = document.getElementById('nav-logout');
    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        authModel.clearLoginData();
        window.location.hash = '#/';
        this.updateNavbarAuthLinks();
      });
    }
  },

  async loadPage() {
    try {
      const path = window.location.hash.slice(1) || '/';
      const page = routes[path];

      if (!page) {
        throw new Error('Page not found');
      }

      const main = document.getElementById('main-content');
      if (!main) {
        throw new Error('Main content element not found');
      }

      // Enhanced View Transition API with custom animations
      if (document.startViewTransition) {
        const transition = document.startViewTransition(async () => {
          main.style.viewTransitionName = 'page';
          await this.renderPage(main, page);
        });

        // Add custom animation classes
        main.classList.add('page-transition');
        await transition.finished;
        main.classList.remove('page-transition');
      } else {
        await this.renderPage(main, page);
      }
    } catch (error) {
      console.error('Error loading page:', error);
      this.showErrorPage();
    }
  },

  async renderPage(main, page) {
    try {
      main.innerHTML = await page.render();
      await page.afterRender();
      this.updateNavbarAuthLinks();
    } catch (error) {
      console.error('Error rendering page:', error);
      this.showErrorPage();
    }
  },

  showErrorPage() {
    const main = document.getElementById('main-content');
    if (main) {
      main.innerHTML = `
        <div class="error-container">
          <h2>Oops! Something went wrong</h2>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
          <button class="btn" onclick="window.location.reload()">Refresh Page</button>
        </div>
      `;
    }
  },

  updateNavbarAuthLinks() {
    const token = authModel.getToken();
    const userName = authModel.getUserName();

    const navLinks = {
      'nav-home': token,
      'nav-login': !token,
      'nav-add': token,
      'nav-notifications': token,
      'nav-register': !token,
      'nav-logout': token,
      'nav-user': token
    };

    // Update visibility of navigation links
    Object.entries(navLinks).forEach(([id, shouldShow]) => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = shouldShow ? 'inline-block' : 'none';
      }
    });

    // Update user name if available
    const userElement = document.getElementById('nav-user');
    if (userElement && userName) {
      userElement.textContent = `Welcome, ${userName}`;
    }
  }
};

export default Router;
