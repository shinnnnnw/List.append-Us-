/**
 * API 封裝模組
 * 本地：php/api/<file>.php  （XAMPP PHP）
 * 雲端：https://...amazonaws.com/prod/<route>  （AWS Lambda）
 */
const API = {
  /**
   * 依環境回傳正確的 endpoint
   * local: prefix=''  → 'auth.php?action=login'
   * cloud: prefix=''  → 'auth/login'
   */
  _ep(local, cloud) {
    return CONFIG.IS_LOCAL ? local : cloud;
  },

  async request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    const url = `${CONFIG.API_BASE}/${cleanEndpoint}`;
    console.log('[API] fetch →', url);
    const defaultOptions = {
      headers: { 'Content-Type': 'application/json' },
    };
    const mergedOptions = { ...defaultOptions, ...options };
    if (options.headers) {
      mergedOptions.headers = { ...defaultOptions.headers, ...options.headers };
    }
    try {
      const response = await fetch(url, mergedOptions);
      console.log('[API] status', response.status, url);
      const json = await response.json();
      console.log('[API] result', json);
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

  // ── 登入 / 登出 / 驗證 ───────────────────────────────────────────────────

  login(phone, password) {
    return this.post(this._ep('auth.php?action=login', 'auth/login'), { phone, password });
  },

  logout() {
    return this.post(this._ep('auth.php?action=logout', 'auth/logout'), {});
  },

  checkAuth() {
    return this.get(this._ep('auth.php?action=check', 'auth/check'));
  },

  getUsers() {
    return this.get(this._ep('auth.php?action=users', 'auth/users'));
  },

  // ── 服務廠商 ─────────────────────────────────────────────────────────────

  getServices(type) {
    const typeParam = type ? `?type=${type}` : '';
    return this.get(this._ep(`services.php${typeParam}`, `vendors${typeParam}`));
  },

  getService(id) {
    return this.get(this._ep(`services.php?id=${id}`, `vendors/${id}`));
  },

  // ── 表單 ─────────────────────────────────────────────────────────────────

  getForm(formId) {
    return this.get(this._ep(`forms.php?form_id=${formId}`, `forms/${formId}`));
  },

  submitForm(data) {
    return this.post(this._ep('form-submit.php', 'feedback'), data);
  },

  // ── 訂單 ─────────────────────────────────────────────────────────────────

  getOrders(status) {
    const user = Auth.getUser() || {};
    const accountId = user.inbr_account_id || '';
    const statusParam = status ? `&status=${status}` : '';
    if (CONFIG.IS_LOCAL) {
      return this.get(`orders.php?account_id=${encodeURIComponent(accountId)}${statusParam}`);
    }
    return this.get(`orders?account_id=${encodeURIComponent(accountId)}${statusParam}`);
  },

  getOrderDetail(id) {
    const user = Auth.getUser() || {};
    const accountId = user.inbr_account_id || '';
    if (CONFIG.IS_LOCAL) {
      return this.get(`order-detail.php?id=${id}&account_id=${encodeURIComponent(accountId)}`);
    }
    return this.get(`orders/${id}?account_id=${encodeURIComponent(accountId)}`);
  },

  // ── 縣市行政區 ───────────────────────────────────────────────────────────

  getCounties() {
    return this.get(this._ep('districts.php', 'districts'));
  },

  getDistricts(countyCode) {
    return this.get(this._ep(`districts.php?county=${countyCode}`, `districts?county=${countyCode}`));
  },

  // ── 圖片上傳 ─────────────────────────────────────────────────────────────

  upload(file) {
    const formData = new FormData();
    formData.append('file', file);
    const endpoint = this._ep('upload.php', 'upload');
    const url = `${CONFIG.API_BASE}/${endpoint}`;
    console.log('[API] fetch →', url);
    return fetch(url, { method: 'POST', body: formData })
      .then(res => res.json())
      .catch(err => {
        console.error('[API] upload error:', err);
        return { success: false, data: null, message: '上傳失敗，請稍後再試' };
      });
  },

  // ── AI 聊天 ───────────────────────────────────────────────────────────────

  chatConversation(message, history = []) {
    if (CONFIG.IS_LOCAL) {
      // 本地：PHP chat.php 接收 { message, history }
      return this.post('chat.php', { message, history });
    }
    // 雲端：Lambda /chat 接收 { message, history }
    return this.post('/chat', { message, history });
  },

  chat(message, history = []) {
    return this.chatConversation(message, history);
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
 