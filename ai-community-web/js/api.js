/**
 * API 封裝模組
 * 對應 AWS Lambda + API Gateway
 */
const API = {
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE}${endpoint}`;
    const defaultOptions = {
      headers: { 'Content-Type': 'application/json' },
    };
    const mergedOptions = { ...defaultOptions, ...options };
    if (options.headers) {
      mergedOptions.headers = { ...defaultOptions.headers, ...options.headers };
    }
    try {
      const response = await fetch(url, mergedOptions);
      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
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
 
  // --- 登入（Mock，前端本地處理） ---
  login(phone, password) {
    // Demo：任何帳號都登入成功
    const mockUser = {
      inbr_account_id: 'MBR001',
      name: '王小明',
      phone: phone,
      email: 'wang01@example.com',
      point_balance: 50,
    };
    localStorage.setItem('ai_user', JSON.stringify(mockUser));
    return Promise.resolve({ success: true, data: mockUser });
  },
 
  logout() {
    localStorage.removeItem('ai_user');
    return Promise.resolve({ success: true });
  },
 
  checkAuth() {
    const user = localStorage.getItem('ai_user');
    if (user) return Promise.resolve({ success: true, data: JSON.parse(user) });
    return Promise.resolve({ success: false, data: null });
  },
 
  // --- 服務廠商 ---
  getServices() {
    return this.get('/vendors');
  },
 
  getService(id) {
    return this.get(`/vendors?vendor_id=${id}`);
  },
 
  // --- 表單（Mock，從前端 FORM_DATA 取） ---
  getForm(formId) {
    const FORMS = {
      1: { id: 1, name: '餐廳訂位', groups: [
        { id: 1, name: '訂位資訊', topics: [
          { id: 3, type: '9', title: '希望訂位日期', is_required: '1' },
          { id: 4, type: '1', title: '用餐人數', is_required: '1', is_number_only: '1' },
          { id: 5, type: '3', title: '餐廳類型', is_required: '0', options: ['中式','日式','西式','韓式'] },
        ]},
        { id: 2, name: '聯絡資料', topics: [
          { id: 1, type: '10', title: '聯絡資訊', is_required: '1' },
        ]},
      ]},
      2: { id: 2, name: '商品購買', groups: [
        { id: 3, name: '商品需求', topics: [
          { id: 7, type: '2', title: '商品描述', is_required: '1' },
          { id: 8, type: '4', title: '商品類別', is_required: '0', options: ['生鮮食品','日用品','3C家電','服飾'] },
          { id: 9, type: '1', title: '預算上限(元)', is_required: '0', is_number_only: '1' },
        ]},
        { id: 4, name: '配送資料', topics: [
          { id: 6, type: '8', title: '聯絡與配送資料', is_required: '1' },
        ]},
      ]},
      3: { id: 3, name: '居家服務', groups: [
        { id: 5, name: '服務需求', topics: [
          { id: 12, type: '3', title: '需求類型', is_required: '1', options: ['家事清潔','水電修繕','長者陪伴','其他'] },
          { id: 13, type: '2', title: '需求詳細說明', is_required: '1' },
          { id: 14, type: '9', title: '希望服務時間', is_required: '0' },
        ]},
        { id: 6, name: '服務地址', topics: [
          { id: 10, type: '8', title: '聯絡與服務地址', is_required: '1' },
        ]},
      ]},
      4: { id: 4, name: '包裹寄送', groups: [
        { id: 7, name: '寄件資訊', topics: [
          { id: 15, type: '3', title: '包裹大小', is_required: '1', options: ['小型(鞋盒以下)','中型','大型'] },
          { id: 16, type: '1', title: '重量(公斤)', is_required: '0', is_number_only: '1' },
          { id: 17, type: '3', title: '收件方式', is_required: '1', options: ['到府收件','自行送至門市'] },
        ]},
        { id: 8, name: '寄件人資料', topics: [
          { id: 18, type: '10', title: '寄件聯絡資料', is_required: '1' },
        ]},
      ]},
    };
    return Promise.resolve({ success: true, data: FORMS[formId] || null });
  },
 
  // --- 送出諮詢單 ---
  submitForm(data) {
    return this.post('/feedback', data);
  },
 
  // --- 訂單 ---
  getOrders() {
    const user = JSON.parse(localStorage.getItem('ai_user') || '{}');
    return this.get(`/feedback/member?member_id=${user.inbr_account_id || 'MBR001'}`);
  },
 
  getOrderDetail(id) {
    return this.get(`/feedback/member?member_id=${id}`);
  },
 
  // --- 縣市行政區 ---
  getCounties() {
    return Promise.resolve({ success: true, data: [
      { code: '01', name: '台北市' },
      { code: '02', name: '新北市' },
      { code: '03', name: '桃園市' },
      { code: '04', name: '台中市' },
      { code: '05', name: '台南市' },
      { code: '06', name: '高雄市' },
    ]});
  },
 
  getDistricts(countyCode) {
    return this.get('/districts');
  },
 
  // --- AI 多輪對話（Bedrock Claude） ---
  chatConversation(text, history = []) {
    return this.post('/ai/chat', { text, history });
  },

  // --- AI 意圖辨識（舊版，保留相容） ---
  chat(message, history = []) {
    return this.post('/chat', { message, history });
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
 