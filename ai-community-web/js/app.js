/**
 * 主程式進入點
 * 負責初始化頁面、導覽列、登入狀態檢查
 */
const App = {
  /**
   * 初始化（每個頁面載入時呼叫）
   */
  init() {
    this.initNavBar();
    this.highlightCurrentNav();
  },

  /**
   * 初始化首頁（index.html 專用）
   */
  initIndex() {
    const user = Auth.getUser();
    const loginView = Utils.$('#view-login');
    const dashboardView = Utils.$('#view-dashboard');

    if (user) {
      this.showDashboard(user);
    } else {
      if (loginView) loginView.classList.add('active');
      if (dashboardView) dashboardView.classList.remove('active');
    }

    // 綁定登入按鈕
    const loginBtn = Utils.$('#login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', async () => {
        loginBtn.disabled = true;
        loginBtn.textContent = '登入中...';
        const user = await Auth.login();
        if (user) {
          this.showDashboard(user);
        } else {
          Utils.toast('登入失敗，請稍後再試');
          loginBtn.disabled = false;
          loginBtn.textContent = 'OpenPî / uniopen 一鍵授權登入';
        }
      });
    }
  },

  /**
   * 顯示主控台
   */
  showDashboard(user) {
    const loginView = Utils.$('#view-login');
    const dashboardView = Utils.$('#view-dashboard');

    if (loginView) loginView.classList.remove('active');
    if (dashboardView) dashboardView.classList.add('active');

    // 更新 Header
    const headerTitle = Utils.$('#header-title');
    if (headerTitle) {
      headerTitle.textContent = `嗨，${user.name || '住戶'}！AI 智慧管家在線上`;
    }

    const pointsText = Utils.$('#points-text');
    if (pointsText) {
      pointsText.textContent = `累積點數: ${user.points || 0} P`;
    }

    // 初始化快捷服務
    this.renderServiceGrid();

    // 初始化聊天
    if (typeof Chat !== 'undefined') {
      Chat.init();
    }

    // 顯示 nav bar
    const navBar = Utils.$('.nav-bar');
    if (navBar) navBar.classList.remove('hidden');
  },

  /**
   * 渲染快捷服務按鈕
   */
  renderServiceGrid() {
    const grid = Utils.$('#service-grid');
    if (!grid) return;

    grid.innerHTML = '';
    CONFIG.QUICK_SERVICES.forEach(item => {
      const btn = Utils.createElement('button', {
        className: 'service-btn',
        onClick: () => {
          Utils.navigate(`form.html?form_id=${item.formId}&service=${encodeURIComponent(item.name)}`);
        },
      });
      btn.style.backgroundColor = item.color + '12';
      btn.style.color = item.color;
      btn.style.borderColor = item.color + '30';
      btn.innerHTML = `<span style="font-size:20px">${item.icon}</span><br>${item.name}`;
      grid.appendChild(btn);
    });
  },

  /**
   * 初始化底部導覽列
   */
  initNavBar() {
    const navBar = Utils.$('.nav-bar');
    if (!navBar) return;

    // 如果未登入且在首頁，隱藏 nav
    const currentPage = this.getCurrentPage();
    if (currentPage === 'index.html' && !Auth.isLoggedIn()) {
      navBar.classList.add('hidden');
    }
  },

  /**
   * 高亮當前導覽項目
   */
  highlightCurrentNav() {
    const currentPage = this.getCurrentPage();
    const navItems = Utils.$$('.nav-item');

    navItems.forEach(item => {
      item.classList.remove('active');
      const href = item.getAttribute('href');
      if (href && href.includes(currentPage)) {
        item.classList.add('active');
      }
    });

    // 首頁特殊處理
    if (currentPage === 'index.html') {
      const homeNav = Utils.$('.nav-item[href="index.html"]');
      if (homeNav) homeNav.classList.add('active');
    }
  },

  /**
   * 取得當前頁面檔名
   */
  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename || 'index.html';
  },
};

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
