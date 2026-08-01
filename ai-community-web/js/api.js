/**
 * API 封裝模組
 * 對應 AWS Lambda + API Gateway
 */
const API = {
  async request(endpoint, options = {}) {
    // 去除 endpoint 開頭的 /，統一用相對路徑拼接
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    const url = `${CONFIG.API_BASE}/${cleanEndpoint}`;
    console.log('[API] fetch →', url);  // debug
    const defaultOptions = {
      headers: { 'Content-Type': 'application/json' },
    };
    const mergedOptions = { ...defaultOptions, ...options };
    if (options.headers) {
      mergedOptions.headers = { ...defaultOptions.headers, ...options.headers };
    }
    try {
      const response = await fetch(url, mergedOptions);
      console.log('[API] status', response.status, url);  // debug
      const json = await response.json();
      console.log('[API] result', json);  // debug
      return json;
    } catch (error) {
      console.error(`[API] Error [${url}]:`, error);
      return { success: false, data: null, message: '網路連線錯誤，請稍後再試' };
    }
  },
 
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },
 
  async post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
 
  async put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
 
  // --- 登入 / 登出 / 驗證 ---
  login(phone, password) {
    return this.post('auth.php?action=login', { phone, password });
  },

  logout() {
    return this.post('auth.php?action=logout', {});
  },

  checkAuth() {
    return this.get('auth.php?action=check');
  },

  // --- Demo 帳號列表 ---
  getUsers() {
    return this.get('auth.php?action=users');
  },
 
  // --- 服務廠商 ---
  getServices() {
    return this.get('vendors.php');
  },
 
  getService(id) {
    return this.get(`vendors.php?vendor_id=${id}`);
  },
 
  // --- 表單 ---
  getForm(formId) {
    return this.get(`forms.php?form_id=${formId}`);
  },
 
  // --- 送出諮詢單 ---
  submitForm(data) {
    return this.post('form-submit.php', data);
  },
 
  // --- 訂單 ---
  getOrders(status) {
    const user = Auth.getUser() || {};
    const accountId = user.inbr_account_id || '';
    const statusParam = status ? `&status=${status}` : '';
    return this.get(`orders.php?account_id=${encodeURIComponent(accountId)}${statusParam}`);
  },

  getOrderDetail(id) {
    const user = Auth.getUser() || {};
    const accountId = user.inbr_account_id || '';
    return this.get(`order-detail.php?id=${id}&account_id=${encodeURIComponent(accountId)}`);
  },
 
  // --- 縣市行政區 ---
  getCounties() {
    return this.get('districts.php');
  },

  getDistricts(countyCode) {
    return this.get(`districts.php?county=${countyCode}`);
  },

  // --- AI 聊天（Bedrock Claude） ---
  chatConversation(message, history = []) {
    return this.post('chat.php', { message, history });
  },

  // --- AI 意圖辨識（舊版，保留相容） ---
  chat(message, history = []) {
    return this.post('chat.php', { message, history });
  },
 
  // --- Demo 帳號列表 ---
  getUsers() {
    return Promise.resolve({ success: true, data: [
      { inbr_account_id: 'MBR001', name: '王小明', phone: '0912-345-001' },
      { inbr_account_id: 'MBR002', name: '陳美玲', phone: '0923-456-002' },
      { inbr_account_id: 'MBR003', name: '林大偉', phone: '0934-567-003' },
    ]});
  },
};
 