/**
 * API 封裝模組
 * 統一處理 fetch 請求、錯誤攔截
 */
const API = {
  /**
   * 通用 fetch 封裝
   */
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE}/${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin', // 攜帶 session cookie
    };

    const mergedOptions = { ...defaultOptions, ...options };
    if (options.headers) {
      mergedOptions.headers = { ...defaultOptions.headers, ...options.headers };
    }

    try {
      const response = await fetch(url, mergedOptions);
      const data = await response.json();

      if (response.status === 401) {
        // 未登入，導回登入頁
        Auth.clearUser();
        Utils.navigate('index.html');
        return null;
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return { success: false, data: null, message: '網路連線錯誤，請稍後再試' };
    }
  },

  /**
   * GET 請求
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  /**
   * POST 請求
   */
  async post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /**
   * 上傳檔案（multipart/form-data）
   */
  async upload(file) {
    const url = `${CONFIG.API_BASE}/upload.php`;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('Upload Error:', error);
      return { success: false, data: null, message: '上傳失敗' };
    }
  },

  // --- 具體 API 方法 ---

  /** 登入 */
  login(token = '') {
    return this.post('auth.php?action=login', { token });
  },

  /** 登出 */
  logout() {
    return this.post('auth.php?action=logout');
  },

  /** 檢查登入狀態 */
  checkAuth() {
    return this.get('auth.php?action=check');
  },

  /** 取得服務列表 */
  getServices(vendorId = null) {
    const query = vendorId ? `?vendor_id=${vendorId}` : '';
    return this.get(`services.php${query}`);
  },

  /** 取得單一服務 */
  getService(id) {
    return this.get(`services.php?id=${id}`);
  },

  /** 取得表單結構 */
  getForm(formId) {
    return this.get(`forms.php?form_id=${formId}`);
  },

  /** 送出表單 */
  submitForm(data) {
    return this.post('form-submit.php', data);
  },

  /** 取得訂單列表 */
  getOrders(status = null) {
    const query = status ? `?status=${status}` : '';
    return this.get(`orders.php${query}`);
  },

  /** 取得訂單詳情 */
  getOrderDetail(id) {
    return this.get(`order-detail.php?id=${id}`);
  },

  /** 取得縣市列表 */
  getCounties() {
    return this.get('districts.php');
  },

  /** 取得行政區列表 */
  getDistricts(countyCode) {
    return this.get(`districts.php?county=${countyCode}`);
  },

  /** AI 聊天 */
  chat(message) {
    return this.post('chat.php', { message });
  },
};
