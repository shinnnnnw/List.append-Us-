/**
 * 認證模組
 * 處理登入、登出、狀態檢查
 */
const Auth = {
  /**
   * 取得當前用戶
   */
  getUser() {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  },

  /**
   * 是否已登入
   */
  isLoggedIn() {
    return !!this.getUser();
  },

  /**
   * 儲存用戶資料
   */
  saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * 清除用戶資料
   */
  clearUser() {
    localStorage.removeItem('user');
  },

  /**
   * 執行登入
   */
  async login() {
    const result = await API.login();
    if (result && result.success) {
      this.saveUser(result.data);
      return result.data;
    }
    return null;
  },

  /**
   * 執行登出
   */
  async logout() {
    await API.logout();
    this.clearUser();
    Utils.navigate('index.html');
  },

  /**
   * 檢查並同步登入狀態（與 server session 同步）
   */
  async checkSession() {
    const result = await API.checkAuth();
    if (result && result.success) {
      this.saveUser(result.data);
      return true;
    }
    this.clearUser();
    return false;
  },

  /**
   * 確保已登入（否則跳轉登入頁）
   */
  requireAuth() {
    if (!this.isLoggedIn()) {
      Utils.navigate('index.html');
      return false;
    }
    return true;
  },
};
