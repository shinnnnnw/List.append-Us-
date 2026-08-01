/**
 * API 封裝模組
 * 網站部署在 AWS S3 靜態託管，沒有後端可呼叫，
 * 所有方法改為直接讀取 data.js 內的靜態資料並回傳 Promise，
 * 對外回傳格式維持與過去 PHP API 相同的 {success, data, message}。
 */
const API = {
  ok(data, message = null) {
    return Promise.resolve({ success: true, data, message });
  },

  fail(message, data = null) {
    return Promise.resolve({ success: false, data, message });
  },

  // --- 登入 / 登出 / 驗證 ---
  async login(phone, password) {
    // 用 hash 比對手機號碼找使用者（不需解密即可比對）
    const phoneHash = await Crypto.hash(phone);
    const user = DATA.USERS.find(u => u.phone_hash === phoneHash);
    if (!user) {
      return this.fail('找不到此手機號碼的帳號');
    }
    if (password) {
      const expectedPassword = phone.replace(/\D/g, '').slice(-4);
      if (password !== expectedPassword) {
        return this.fail('密碼錯誤（提示：手機號碼後四碼）');
      }
    }
    // 解密個資欄位後回傳
    const decrypted = await Crypto.decryptFields(user, ['name', 'phone', 'email']);
    return this.ok({ ...decrypted });
  },

  logout() {
    return this.ok(null, '已登出');
  },

  checkAuth() {
    const stored = localStorage.getItem('user');
    if (stored) {
      return this.ok(JSON.parse(stored), '已登入');
    }
    return this.fail('未登入');
  },

  // --- Demo 帳號列表 ---
  async getUsers() {
    // 解密姓名和電話供帳號選單顯示
    const users = [];
    for (const u of DATA.USERS) {
      const decrypted = await Crypto.decryptFields(u, ['name', 'phone']);
      users.push({ name: decrypted.name, phone: decrypted.phone });
    }
    return this.ok(users);
  },

  // --- 服務廠商 ---
  getServices() {
    return this.ok({
      vendors: DATA.VENDORS.map(v => ({ ...v })),
      service_type_map: { ...DATA.SERVICE_TYPE_MAP },
    });
  },

  getService(id) {
    const vendor = DATA.VENDORS.find(v => String(v.vendor_id) === String(id));
    if (!vendor) {
      return this.fail('找不到該服務商');
    }
    const areas = vendor.service_areas.map(a => ({
      county_code: a.county_code,
      district_code: a.district_code,
      county_name: (DATA.COUNTIES.find(c => c.code === a.county_code) || {}).name || '',
      district_name: a.district_code ? (DATA.DISTRICTS.find(d => d.code === a.district_code) || {}).name || '' : '',
    }));
    return this.ok({ ...vendor, service_areas: areas });
  },

  // --- 表單 ---
  getForm(formId) {
    const template = DATA.FORMS[formId] || DATA.DEFAULT_FORM;
    return this.ok({
      form: { ...template.form, id: parseInt(formId) },
      groups: [],
      topics: template.topics.map(t => ({ ...t })),
      county_relations: [],
    });
  },

  // --- 圖片上傳（本地端讀成 data URL，無實際後端可存） ---
  upload(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve({ success: true, data: { path: ev.target.result }, message: null });
      reader.onerror = () => resolve({ success: false, data: null, message: '上傳失敗' });
      reader.readAsDataURL(file);
    });
  },

  // --- 送出諮詢單 ---
  submitForm(data) {
    const feedbackNo = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 12) + String(Math.floor(Math.random() * 9999)).padStart(4, '0');
    return this.ok({ feedback_no: feedbackNo }, '表單提交成功');
  },

  // --- 訂單 ---
  getOrders(status) {
    let orders = DATA.ORDERS.map(o => ({ ...o }));
    if (status) {
      orders = orders.filter(o => o.order_status === status);
    }
    return this.ok(orders);
  },

  getOrderDetail(id) {
    const order = DATA.ORDERS.find(o => String(o.record_id) === String(id));
    if (!order) {
      return this.fail('找不到該訂單');
    }
    const timeline = [];
    timeline.push({ status: '建立訂單', time: order.order_time });
    if (order.deposit_time) timeline.push({ status: '支付訂金', time: order.deposit_time });
    if (order.confirm_time) timeline.push({ status: '訂單確認', time: order.confirm_time });
    if (order.service_time) timeline.push({ status: '服務進行', time: order.service_time });
    if (order.complete_time) timeline.push({ status: '訂單完成', time: order.complete_time });
    if (order.cancel_time) timeline.push({ status: '訂單取消', time: order.cancel_time });
    return this.ok({ ...order, timeline });
  },
 
  // --- 縣市行政區 ---
  getCounties() {
    return this.ok(DATA.COUNTIES.map(c => ({ ...c })));
  },

  getDistricts(countyCode) {
    return this.ok(DATA.DISTRICTS.filter(d => d.county_code === countyCode).map(d => ({ ...d })));
  },

  // --- AI 聊天（本地關鍵字比對，無 Bedrock 後端可呼叫） ---
  chatConversation(message, history = []) {
    return this.ok(this._localChatReply(message));
  },

  // --- AI 意圖辨識（舊版，保留相容） ---
  chat(message, history = []) {
    return this.chatConversation(message, history);
  },

  // --- 諮詢單（後台 demo 用） ---
  async getFeedbacks(status) {
    let feedbacks = DATA.FEEDBACKS.map(f => ({ ...f }));
    if (status) {
      feedbacks = feedbacks.filter(f => f.status === status);
    }
    const decrypted = [];
    for (const fb of feedbacks) {
      const d = await Crypto.decryptFields(fb, ['contact_name', 'contact_mobile', 'contact_email', 'contact_address_detail']);
      decrypted.push(d);
    }
    return this.ok(decrypted);
  },

  async getFeedbackDetail(feedbackNo) {
    const fb = DATA.FEEDBACKS.find(f => f.feedback_no === feedbackNo);
    if (!fb) return this.fail('找不到該諮詢單');
    const decrypted = await Crypto.decryptFields(fb, ['contact_name', 'contact_mobile', 'contact_email', 'contact_address_detail']);
    const assignments = DATA.ASSIGNMENTS.filter(a => a.feedback_no === feedbackNo);
    const statusLogs = DATA.STATUS_LOGS.filter(l => l.feedback_no === feedbackNo);
    const assignmentIds = assignments.map(a => a.assignment_id);
    const replies = DATA.REPLIES.filter(r => assignmentIds.includes(r.assignment_id));
    const reviews = DATA.REVIEWS.filter(r => r.feedback_no === feedbackNo);
    return this.ok({ ...decrypted, assignments, statusLogs, replies, reviews });
  },

  // --- 本地關鍵字比對 ---
  _localChatReply(message) {
    const intents = [
      { keywords: ['吃', '餐廳', '訂位', '用餐', '聚餐', '晚餐', '午餐', '早餐', '吃飯'], intent: 'restaurant_booking', form_id: 1, service: '餐廳訂位', service_type: '01', reply: '辨識到您有餐廳訂位需求，以下是可提供服務的廠商：' },
      { keywords: ['買', '購物', '商品', '下單', '購買', '採買', '網購'], intent: 'shopping', form_id: 2, service: '商品購買', service_type: '02', reply: '辨識到您有商品採買需求，以下是可提供服務的廠商：' },
      { keywords: ['清潔', '打掃', '整理', '洗衣機', '冷氣', '大掃除', '家事'], intent: 'cleaning', form_id: 3, service: '社區服務', service_type: '03', reply: '辨識到您有清潔服務需求，以下是可提供服務的廠商：' },
      { keywords: ['修', '壞', '漏水', '水電', '修繕', '維修', '馬桶', '水龍頭', '電燈'], intent: 'repair', form_id: 3, service: '社區服務', service_type: '04', reply: '辨識到您有修繕需求，以下是可提供服務的廠商：' },
      { keywords: ['陪伴', '長者', '老人', '照顧', '看護'], intent: 'elderly_care', form_id: 3, service: '社區服務', service_type: '05', reply: '辨識到您有長者陪伴需求，以下是可提供服務的廠商：' },
      { keywords: ['藥', '領藥', '藥局', '處方'], intent: 'pharmacy', form_id: 3, service: '社區服務', service_type: '06', reply: '辨識到您有藥局代領需求，以下是可提供服務的廠商：' },
      { keywords: ['叫車', '計程車', '接送', '交通'], intent: 'taxi', form_id: 3, service: '社區服務', service_type: '07', reply: '辨識到您有叫車需求，以下是可提供服務的廠商：' },
    ];

    for (const intent of intents) {
      if (intent.keywords.some(k => message.indexOf(k) >= 0)) {
        const vendors = DATA.VENDORS.filter(v => v.service_types.indexOf(intent.service_type) >= 0);
        let reply = intent.reply;
        if (vendors.length > 0) {
          reply += '<ul class="vendor-list">' + vendors.map(v => {
            const ratingText = v.rating_avg ? ' ⭐ ' + v.rating_avg : '';
            return `<li><strong>${v.vendor_name}</strong>${ratingText}</li>`;
          }).join('') + '</ul><p>請點擊下方按鈕填寫需求表單，我們將為您媒合適合的服務商。</p>';
        }
        return { reply, intent: intent.intent, form_id: intent.form_id, service: intent.service, has_form: true, vendors, source: 'local' };
      }
    }

    return {
      reply: '收到您的需求！請問能再具體描述一下嗎？例如：餐廳訂位、清潔服務、水電修繕等，我可以幫您媒合社區服務。',
      intent: 'none',
      form_id: null,
      service: null,
      has_form: false,
      vendors: [],
      source: 'local',
    };
  },
};