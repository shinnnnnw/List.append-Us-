/**
 * API 封裝模組
 * 統一處理 fetch 請求，對應 AWS Lambda + API Gateway
 * API Base: https://adjvx2bs1a.execute-api.us-west-2.amazonaws.com/prod
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
      const data = await response.json();
      console.log(`[API] status ${response.status}`, url);
      console.log(`[API] result`, data);
      return data;
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

  // 登入（Mock）
  login(phone, password) {
    const users = [
      { inbr_account_id: 'MBR001', name: '王小明', phone: '0912-345-001', email: 'wang01@example.com', point_balance: 50 },
      { inbr_account_id: 'MBR002', name: '陳美玲', phone: '0923-456-002', email: 'chen02@example.com', point_balance: 120 },
      { inbr_account_id: 'MBR003', name: '林大偉', phone: '0934-567-003', email: 'lin03@example.com', point_balance: 0 },
      { inbr_account_id: 'MBR004', name: '黃志豪', phone: '0945-678-004', email: 'huang04@example.com', point_balance: 300 },
      { inbr_account_id: 'MBR005', name: '李小芳', phone: '0956-789-005', email: 'li05@example.com', point_balance: 80 },
      { inbr_account_id: 'MBR006', name: '張美華', phone: '0967-890-006', email: 'chang06@example.com', point_balance: 200 },
      { inbr_account_id: 'MBR007', name: '陳建志', phone: '0978-901-007', email: 'chen07@example.com', point_balance: 150 },
    ];
    const clean = (p) => p.replace(/[-\s]/g, '');
    const u = users.find(x => clean(x.phone) === clean(phone));
    if (u) {
      localStorage.setItem('ai_user', JSON.stringify(u));
      return Promise.resolve({ success: true, data: u });
    }
    return Promise.resolve({ success: false, message: '找不到此帳號' });
  },

  logout() {
    localStorage.removeItem('ai_user');
    return Promise.resolve({ success: true });
  },

  checkAuth() {
    const u = localStorage.getItem('ai_user');
    if (u) return Promise.resolve({ success: true, data: JSON.parse(u) });
    return Promise.resolve({ success: false });
  },

  getUsers() {
    return Promise.resolve({ success: true, data: [
      { inbr_account_id: 'MBR001', name: '王小明', phone: '0912-345-001' },
      { inbr_account_id: 'MBR002', name: '陳美玲', phone: '0923-456-002' },
      { inbr_account_id: 'MBR003', name: '林大偉', phone: '0934-567-003' },
      { inbr_account_id: 'MBR004', name: '黃志豪', phone: '0945-678-004' },
      { inbr_account_id: 'MBR005', name: '李小芳', phone: '0956-789-005' },
      { inbr_account_id: 'MBR006', name: '張美華', phone: '0967-890-006' },
      { inbr_account_id: 'MBR007', name: '陳建志', phone: '0978-901-007' },
    ]});
  },

  // 服務廠商
  getServices(type) {
    const q = type ? `?service_type=${type}` : '';
    return this.get(`/vendors${q}`);
  },

  getService(id) {
    return this.get(`/vendors/${id}`);
  },

  // 表單（Mock，key 為 service_type）
  getForm(formId) {
    const FORMS = {
      6: { id: 6, name: '餐廳訂位', groups: [
        { id: 1, name: '訂位資訊', topics: [
          { id: 1, type: '9', title: '希望訂位日期', is_required: '1' },
          { id: 2, type: '1', title: '用餐人數', is_required: '1', is_number_only: '1' },
          { id: 3, type: '3', title: '用餐時段', is_required: '1', options: ['午餐 11:30','午餐 12:00','晚餐 17:30','晚餐 18:00','晚餐 18:30','晚餐 19:00'] },
          { id: 4, type: '4', title: '特殊需求', is_required: '0', options: ['兒童椅','無障礙座位','包廂','生日蛋糕','素食'] },
          { id: 5, type: '2', title: '備註', is_required: '0' },
        ]},
        { id: 2, name: '聯絡資料', topics: [{ id: 6, type: '10', title: '聯絡資料', is_required: '1' }] },
      ]},
      11: { id: 11, name: '商城購物', groups: [
        { id: 3, name: '商品需求', topics: [
          { id: 7, type: '1', title: '商品名稱或類別', is_required: '1' },
          { id: 8, type: '2', title: '詳細需求', is_required: '1' },
          { id: 9, type: '1', title: '預算上限（元）', is_required: '0', is_number_only: '1' },
          { id: 10, type: '3', title: '收貨方式', is_required: '1', options: ['宅配到府','超商取貨','門市自取'] },
          { id: 38, type: '6', title: '上傳商品參考照片', is_required: '0' },
        ]},
        { id: 4, name: '配送資料', topics: [{ id: 11, type: '8', title: '聯絡與配送資料', is_required: '1' }] },
      ]},
      1: { id: 1, name: '居家清潔', groups: [
        { id: 5, name: '清潔需求', topics: [
          { id: 12, type: '3', title: '清潔類型', is_required: '1', options: ['一般清潔','深度清潔','搬遷清潔','其他'] },
          { id: 13, type: '1', title: '坪數', is_required: '0', is_number_only: '1' },
          { id: 14, type: '3', title: '希望時段', is_required: '1', options: ['越快越好（緊急）','本週內','彈性配合'] },
          { id: 15, type: '6', title: '上傳目前環境照片', is_required: '0' },
          { id: 16, type: '2', title: '需求說明', is_required: '0' },
        ]},
        { id: 6, name: '聯絡地址', topics: [{ id: 17, type: '8', title: '聯絡與服務地址', is_required: '1' }] },
      ]},
      2: { id: 2, name: '家電清洗', groups: [
        { id: 7, name: '清洗需求', topics: [
          { id: 17, type: '4', title: '清洗項目', is_required: '1', options: ['冷氣清洗','洗衣機清洗','冰箱清洗','抽油煙機清洗','其他'] },
          { id: 18, type: '1', title: '數量（台）', is_required: '1', is_number_only: '1' },
          { id: 19, type: '3', title: '希望時段', is_required: '1', options: ['越快越好（緊急）','本週內','彈性配合'] },
          { id: 20, type: '6', title: '上傳家電照片', is_required: '0' },
          { id: 21, type: '2', title: '需求說明', is_required: '0' },
        ]},
        { id: 8, name: '聯絡地址', topics: [{ id: 22, type: '8', title: '聯絡與服務地址', is_required: '1' }] },
      ]},
      3: { id: 3, name: '包裹寄送', groups: [
        { id: 9, name: '寄件資訊', topics: [
          { id: 22, type: '3', title: '包裹大小', is_required: '1', options: ['小型（60cm以下）','中型（60-120cm）','大型（120cm以上）'] },
          { id: 23, type: '1', title: '重量（公斤）', is_required: '0', is_number_only: '1' },
          { id: 24, type: '3', title: '收件方式', is_required: '1', options: ['到府收件','自行送至門市'] },
          { id: 25, type: '2', title: '寄件備註', is_required: '0' },
        ]},
        { id: 10, name: '收件人資料', topics: [{ id: 26, type: '8', title: '收件人聯絡與地址', is_required: '1' }] },
      ]},
      9: { id: 9, name: '美食外送', groups: [
        { id: 11, name: '外送需求', topics: [
          { id: 27, type: '2', title: '想吃的餐點或餐廳', is_required: '1' },
          { id: 28, type: '1', title: '用餐人數', is_required: '1', is_number_only: '1' },
          { id: 29, type: '9', title: '希望送達時間', is_required: '1' },
          { id: 30, type: '1', title: '預算上限（元）', is_required: '0', is_number_only: '1' },
          { id: 31, type: '2', title: '其他備註（過敏原、忌口）', is_required: '0' },
        ]},
        { id: 12, name: '外送地址', topics: [{ id: 32, type: '8', title: '聯絡與外送地址', is_required: '1' }] },
      ]},
      10: { id: 10, name: '水電修繕', groups: [
        { id: 13, name: '修繕需求', topics: [
          { id: 33, type: '3', title: '修繕類型', is_required: '1', options: ['水管漏水','馬桶堵塞','電路問題','熱水器維修','冷氣安裝','其他'] },
          { id: 34, type: '3', title: '急迫程度', is_required: '1', options: ['緊急（當天）','本週內','可彈性安排'] },
          { id: 35, type: '2', title: '問題描述', is_required: '1' },
          { id: 37, type: '6', title: '上傳現場照片', is_required: '0' },
        ]},
        { id: 14, name: '聯絡地址', topics: [{ id: 36, type: '8', title: '聯絡與服務地址', is_required: '1' }] },
      ]},
      8: { id: 8, name: '叫車接送', groups: [
        { id: 15, name: '乘車資訊', topics: [
          { id: 39, type: '9', title: '乘車日期時間', is_required: '1' },
          { id: 40, type: '1', title: '上車地點', is_required: '1' },
          { id: 41, type: '1', title: '目的地', is_required: '1' },
          { id: 42, type: '1', title: '乘車人數', is_required: '1', is_number_only: '1' },
          { id: 43, type: '3', title: '特殊需求', is_required: '0', options: ['輪椅接送','大型行李','寵物同行','無'] },
        ]},
        { id: 16, name: '聯絡資料', topics: [{ id: 44, type: '10', title: '聯絡資料', is_required: '1' }] },
      ]},
    };
    return Promise.resolve({ success: true, data: FORMS[formId] || null });
  },

  // 諮詢單
  submitForm(data) {
    const user = JSON.parse(localStorage.getItem('ai_user') || '{}');
    return this.post('/feedback', { ...data, inbr_account_id: user.inbr_account_id || 'MBR001' });
  },

  // 訂單
  getOrders(status) {
    const user = JSON.parse(localStorage.getItem('ai_user') || '{}');
    const accountId = user.inbr_account_id || 'MBR001';
    const q = status ? `&status=${status}` : '';
    return this.get(`/orders?account_id=${accountId}${q}`);
  },

  getOrderDetail(id) {
    const user = JSON.parse(localStorage.getItem('ai_user') || '{}');
    const accountId = user.inbr_account_id || 'MBR001';
    return this.get(`/orders/${id}?account_id=${accountId}`);
  },

  createOrder(orderData) {
    const user = JSON.parse(localStorage.getItem('ai_user') || '{}');
    return this.post('/orders', { ...orderData, inbr_account_id: user.inbr_account_id || 'MBR001' });
  },

  cancelOrder(orderId) {
    const user = JSON.parse(localStorage.getItem('ai_user') || '{}');
    return this.post(`/orders/${orderId}/cancel`, { inbr_account_id: user.inbr_account_id || 'MBR001' });
  },

  // 縣市行政區
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

  // AI 對話（AWS Lambda Bedrock，支援圖片多模態）
  chatConversation(message, history = [], imageBase64 = null, preferences = null) {
    const user = JSON.parse(localStorage.getItem('ai_user') || '{}');
    const body = {
      text: message,
      history: history,
      account_id: user.inbr_account_id || '',
      account_name: user.name || '',
      account_phone: user.phone || '',
    };
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mediaType = imageBase64.match(/^data:(image\/\w+);base64,/);
      body.image = base64Data;
      body.image_media_type = mediaType ? mediaType[1] : 'image/jpeg';
    }
    if (preferences && Object.keys(preferences).length > 0) {
      body.preferences = preferences;
    }
    return this.post('/ai/chat', body);
  },

  chat(message, history = []) {
    return this.post('/ai/chat', { text: message, history: history });
  },

  // B端廠商
  getVendorCases(vendorId) {
    return this.get(`/admin/cases?vendor_id=${vendorId}`);
  },

  updateCaseStatus(assignmentId, status) {
    return this.post('/admin/cases/update', { feedback_no: assignmentId, status: status });
  },
};