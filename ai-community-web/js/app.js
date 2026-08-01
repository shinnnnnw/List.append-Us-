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
    var user = Auth.getUser();
    var loginView = Utils.$('#view-login');
    var dashboardView = Utils.$('#view-dashboard');

    if (user) {
      this.showDashboard(user);
      return;
    }

    if (loginView) loginView.classList.add('active');
    if (dashboardView) dashboardView.classList.remove('active');

    // --- 步驟切換 ---
    var stepWelcome = Utils.$('#login-step-welcome');
    var stepForm = Utils.$('#login-step-form');
    var btnGoLoginConsumer = Utils.$('#btn-go-login-consumer');
    var btnGoLoginVendor = Utils.$('#btn-go-login-vendor');
    var btnBack = Utils.$('#btn-back-welcome');

    if (btnGoLoginConsumer) {
      btnGoLoginConsumer.addEventListener('click', function() {
        localStorage.setItem('loginRole', 'consumer');
        stepWelcome.style.display = 'none';
        stepForm.style.display = 'block';
        App.loadUserList();
      });
    }

    if (btnGoLoginVendor) {
      btnGoLoginVendor.addEventListener('click', function() {
        localStorage.setItem('loginRole', 'vendor');
        stepWelcome.style.display = 'none';
        var stepVendor = Utils.$('#login-step-vendor');
        if (stepVendor) stepVendor.style.display = 'block';
      });
    }

    // --- 廠商登入 ---
    var btnVendorLogin = Utils.$('#btn-vendor-login');
    var btnBackVendor = Utils.$('#btn-back-welcome-vendor');

    if (btnVendorLogin) {
      btnVendorLogin.addEventListener('click', function() {
        var username = Utils.$('#vendor-username').value.trim();
        var password = Utils.$('#vendor-password').value.trim();
        var errorEl = Utils.$('#vendor-login-error');

        if (username === 'admin' && password === '1234') {
          if (errorEl) errorEl.style.display = 'none';
          localStorage.setItem('vendorLogin', 'true');
          vendorShowDashboard();
        } else {
          if (errorEl) errorEl.style.display = 'block';
        }
      });
    }

    if (btnBackVendor) {
      btnBackVendor.addEventListener('click', function() {
        var stepVendor = Utils.$('#login-step-vendor');
        if (stepVendor) stepVendor.style.display = 'none';
        stepWelcome.style.display = 'block';
      });
    }

    // Enter 鍵廠商登入
    var vendorPassInput = Utils.$('#vendor-password');
    if (vendorPassInput) {
      vendorPassInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && btnVendorLogin) btnVendorLogin.click();
      });
    }

    if (btnBack) {
      btnBack.addEventListener('click', function() {
        stepForm.style.display = 'none';
        stepWelcome.style.display = 'block';
      });
    }

    // --- 快速登入 ---
    var userSelect = Utils.$('#user-select');
    var btnQuickLogin = Utils.$('#btn-quick-login');
    var loginError = Utils.$('#login-error');

    if (btnQuickLogin) {
      btnQuickLogin.addEventListener('click', async function() {
        var phone = userSelect ? userSelect.value : '';
        if (!phone) {
          App.showLoginError('請選擇一個帳號');
          return;
        }
        await App.doLogin(phone, btnQuickLogin);
      });
    }

    // --- 手動登入 ---
    var phoneInput = Utils.$('#phone-input');
    var passwordInput = Utils.$('#password-input');
    var btnManualLogin = Utils.$('#btn-manual-login');

    if (btnManualLogin) {
      btnManualLogin.addEventListener('click', async function() {
        var phone = phoneInput ? phoneInput.value.trim() : '';
        var password = passwordInput ? passwordInput.value.trim() : '';
        if (!phone) {
          App.showLoginError('請輸入手機號碼');
          return;
        }
        if (!password) {
          App.showLoginError('請輸入密碼');
          return;
        }
        await App.doLogin(phone, btnManualLogin, password);
      });
    }
  },

  /**
   * 執行登入
   */
  async doLogin(phone, btn, password) {
    var originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '登入中...';
    App.hideLoginError();

    var loggedInUser = await Auth.login(phone, password);
    if (loggedInUser) {
      App.showDashboard(loggedInUser);
    } else {
      App.showLoginError('登入失敗，手機號碼或密碼錯誤');
      btn.disabled = false;
      btn.textContent = originalText;
    }
  },

  /**
   * 顯示登入錯誤
   */
  showLoginError(msg) {
    var el = Utils.$('#login-error');
    if (el) {
      el.textContent = msg;
      el.classList.add('show');
    }
  },

  /**
   * 隱藏登入錯誤
   */
  hideLoginError() {
    var el = Utils.$('#login-error');
    if (el) {
      el.textContent = '';
      el.classList.remove('show');
    }
  },

  /**
   * 載入可登入的帳號列表
   */
  async loadUserList() {
    var select = Utils.$('#user-select');
    if (!select) return;
    // 避免重複載入
    if (select.options.length > 1) return;

    var result = await API.getUsers();
    if (result && result.success && result.data) {
      result.data.forEach(function(u) {
        var opt = document.createElement('option');
        opt.value = u.phone;
        opt.textContent = u.name + ' (' + u.phone + ')';
        select.appendChild(opt);
      });
    }
  },

  /**
   * 顯示主控台
   */
  showDashboard(user) {
    // 消費者登入 → 顯示一般主控台
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
          // 點擊方塊 → 自動傳送服務需求到聊天室
          if (typeof Chat !== 'undefined' && Chat.input) {
            Chat.input.value = item.chatMessage || `我需要${item.name}服務`;
            Chat.handleSend();
          }
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
 
