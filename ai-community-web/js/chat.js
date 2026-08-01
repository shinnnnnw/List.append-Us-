/**
 * AI 聊天模組
 * 多輪對話式 AI 管家，透過自然語言收集需求
 */
const Chat = {
  messages: [],
  conversationHistory: [],
  container: null,
  input: null,
  recognition: null,
  isRecording: false,
  PREFS_KEY: 'ai_user_preferences',

  /**
   * 取得住戶偏好
   */
  getPreferences() {
    try {
      return JSON.parse(localStorage.getItem(this.PREFS_KEY)) || {};
    } catch (e) {
      return {};
    }
  },

  /**
   * 儲存住戶偏好（合併更新到 localStorage + API）
   */
  savePreferences(newPrefs) {
    if (!newPrefs || typeof newPrefs !== 'object') return;
    const current = this.getPreferences();
    const merged = { ...current, ...newPrefs, updatedAt: new Date().toISOString() };
    localStorage.setItem(this.PREFS_KEY, JSON.stringify(merged));

    // 同步寫回 API
    const user = JSON.parse(localStorage.getItem('ai_user') || '{}');
    if (user.inbr_account_id) {
      API.put('/preferences', { account_id: user.inbr_account_id, preferences: merged });
    }
  },

  /**
   * 從 API 載入住戶偏好（啟動時呼叫）
   */
  async loadPreferencesFromAPI() {
    const user = JSON.parse(localStorage.getItem('ai_user') || '{}');
    if (!user.inbr_account_id) return;

    const result = await API.get(`/preferences?account_id=${user.inbr_account_id}`);
    if (result && result.success && result.data && Object.keys(result.data).length > 0) {
      localStorage.setItem(this.PREFS_KEY, JSON.stringify(result.data));
    }
  },

  /**
   * 初始化聊天
   */
  init() {
    this.container = Utils.$('#chat-container');
    this.input = Utils.$('#chat-input');

    if (!this.container || !this.input) return;

    // 清空歷史
    this.conversationHistory = [];
    this.pendingImage = null; // 暫存待送出的圖片 base64

    // 從 API 載入住戶偏好
    this.loadPreferencesFromAPI();

    // 預設 AI 歡迎訊息
    this.messages = [
      { id: 1, sender: 'ai', text: '你好！我是您的 AI 智慧社區管家。有什麼我能幫您的嗎？不論是餐廳訂位、居家清潔、水電修繕、包裹寄送，或是任何生活問題，直接跟我說就好！\n\n💡 小提示：修繕或清潔相關問題，您可以直接拍照上傳，AI 會幫您辨識問題並預估報價喔！' },
    ];
    this.render();

    // 綁定發送事件
    const sendBtn = Utils.$('#chat-send-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.handleSend());
    }
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    // 初始化圖片上傳
    this.initImageUpload();

    // 初始化語音輸入
    this.initVoice();

    // 檢查再次預約參數
    this.checkReorder();
  },

  /**
   * 初始化圖片上傳功能（+ 按鈕選單）
   */
  initImageUpload() {
    const attachBtn = Utils.$('#chat-attach-btn');
    const attachMenu = Utils.$('#chat-attach-menu');
    const cameraInput = Utils.$('#chat-camera-input');
    const galleryInput = Utils.$('#chat-gallery-input');
    const fileInput = Utils.$('#chat-file-input');
    const removeBtn = Utils.$('#chat-image-remove');

    if (attachBtn && attachMenu) {
      // 點擊 + 按鈕切換選單
      attachBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = attachMenu.style.display !== 'none';
        attachMenu.style.display = isVisible ? 'none' : 'flex';
      });

      // 點擊頁面其他地方關閉選單
      document.addEventListener('click', () => {
        attachMenu.style.display = 'none';
      });

      // 選單選項
      attachMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'camera' && cameraInput) cameraInput.click();
        if (action === 'gallery' && galleryInput) galleryInput.click();
        if (action === 'file' && fileInput) fileInput.click();
        attachMenu.style.display = 'none';
      });
    }

    // 統一處理檔案選擇
    const handleFile = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert('檔案大小不能超過 5MB，請重新選擇');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        this.pendingImage = event.target.result;
        this.showImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    };

    if (cameraInput) cameraInput.addEventListener('change', handleFile);
    if (galleryInput) galleryInput.addEventListener('change', handleFile);
    if (fileInput) fileInput.addEventListener('change', handleFile);

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this.clearImagePreview();
      });
    }
  },

  /**
   * 顯示圖片預覽
   */
  showImagePreview(base64) {
    const previewContainer = Utils.$('#chat-image-preview');
    const previewImg = Utils.$('#chat-preview-img');
    if (previewContainer && previewImg) {
      previewImg.src = base64;
      previewContainer.style.display = 'flex';
    }
  },

  /**
   * 清除圖片預覽
   */
  clearImagePreview() {
    const previewContainer = Utils.$('#chat-image-preview');
    const previewImg = Utils.$('#chat-preview-img');
    const imageInput = Utils.$('#chat-image-input');
    if (previewContainer) previewContainer.style.display = 'none';
    if (previewImg) previewImg.src = '';
    if (imageInput) imageInput.value = '';
    this.pendingImage = null;
  },

  /**
   * 偵測 URL reorder 參數，自動送出再次預約訊息
   */
  async checkReorder() {
    const reorderId = Utils.getUrlParam('reorder');
    if (!reorderId) return;

    try {
      const result = await API.getOrderDetail(reorderId);
      if (!result || !result.success || !result.data) {
        console.error('[Reorder] 無法取得原訂單:', reorderId);
        return;
      }

      const order = result.data;
      const serviceName = order.service_name || order.remark || '上次的服務';
      const message = `我想再次預約：${serviceName}`;

      this.input.value = message;
      this.handleSend();

      window.history.replaceState({}, '', 'index.html');
    } catch (e) {
      console.error('[Reorder] Error:', e);
    }
  },

  /**
   * 初始化語音輸入（Web Speech API）
   */
  initVoice() {
    const voiceBtn = Utils.$('#chat-voice-btn');
    if (!voiceBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      voiceBtn.title = '您的瀏覽器不支援語音輸入';
      voiceBtn.disabled = true;
      voiceBtn.classList.add('disabled');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'zh-TW';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;

    this.recognition.onstart = () => {
      this.isRecording = true;
      voiceBtn.classList.add('recording');
      voiceBtn.textContent = '⏹️';
      this.input.placeholder = '正在聆聽...';
    };

    this.recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      this.input.value = transcript;
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      voiceBtn.classList.remove('recording');
      voiceBtn.textContent = '🎙️';
      this.input.placeholder = '跟我說說您的需求...';

      if (this.input.value.trim()) {
        this.handleSend();
      }
    };

    this.recognition.onerror = (event) => {
      this.isRecording = false;
      voiceBtn.classList.remove('recording');
      voiceBtn.textContent = '🎙️';
      this.input.placeholder = '跟我說說您的需求...';

      if (event.error === 'not-allowed') {
        alert('請允許麥克風權限以使用語音輸入功能');
      }
    };

    voiceBtn.addEventListener('click', () => this.toggleVoice());
  },

  /**
   * 切換語音錄製
   */
  toggleVoice() {
    if (this.isRecording) {
      this.recognition.stop();
    } else {
      this.input.value = '';
      this.recognition.start();
    }
  },

  /**
   * 處理發送訊息
   */
  async handleSend() {
    const text = this.input.value.trim();
    const hasImage = !!this.pendingImage;

    if (!text && !hasImage) return;

    // 新增使用者訊息到 UI（含圖片縮圖）
    if (hasImage) {
      this.addImageMessage('user', this.pendingImage, text);
    } else {
      this.addMessage('user', text, false);
    }
    this.input.value = '';

    // 顯示打字動畫
    this.showTyping();

    // 呼叫 AI API，帶入圖片（如果有）
    const imageData = hasImage ? this.pendingImage : null;
    this.clearImagePreview();

    const preferences = this.getPreferences();
    const result = await API.chatConversation(text || '請分析這張照片的問題', this.conversationHistory, imageData, preferences);

    // 把這輪 user 訊息加入歷史
    this.conversationHistory.push({ role: 'user', content: text || '[上傳照片]' });

    // 移除打字動畫
    this.hideTyping();

    if (result && result.success && result.data) {
      const data = result.data;
      const replyText = data.reply || '';

      // 顯示 AI 回覆
      this.addMessage('ai', replyText, false);

      // 收集完成 → PHP 已自動建立訂單，顯示成功卡片
      if (data.status === 'complete' && data.feedback_no) {
        this.addOrderConfirmCard(data.feedback_no, data.intent, data.collected);
      } else if (data.has_form && data.form_id) {
        // fallback：Bedrock 不可用時顯示表單按鈕
        this.addFormButton(data.form_id, data.service);
      }

      // 儲存 AI 回傳的住戶偏好更新
      if (data.preferences) {
        this.savePreferences(data.preferences);
      }

      // 加入對話歷史
      this.conversationHistory.push({ role: 'assistant', content: replyText });
    } else {
      this.addMessage('ai', '抱歉，目前系統忙碌中，請稍後再試。', false);
    }
  },

  /**
   * 新增含圖片的使用者訊息
   */
  addImageMessage(sender, imageSrc, text) {
    this.messages.push({
      id: Date.now(),
      sender,
      text: text || '',
      isHtml: true,
      imageHtml: `<img src="${imageSrc}" class="chat-uploaded-img" alt="上傳的照片">${text ? '<br>' + text : ''}`,
    });
    this.render();
  },

  /**
   * 新增訊息到 UI
   * @param {string}  sender  - 'user' | 'ai'
   * @param {string}  content - 訊息內容（可包含 HTML）
   * @param {boolean} isHtml  - true 時以 innerHTML 渲染，預設 false
   */
  addMessage(sender, content, isHtml = false) {
    this.messages.push({
      id: Date.now(),
      sender,
      text: content,
      isHtml,
    });
    this.render();
  },

  /**
   * 語音朗讀文字（Web Speech API TTS）
   */
  speakText(text) {
    if (!window.speechSynthesis) return;

    // 去除 HTML 標籤和 emoji 圖標
    const plainText = text.replace(/<[^>]*>/g, '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '').trim();
    if (!plainText) return;

    // 取消正在播放的語音
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = 'zh-TW';
    utterance.rate = 1.1;
    utterance.pitch = 1.05;

    // 使用固定語音（初始化時快取）
    if (!this._cachedVoice) {
      const voices = window.speechSynthesis.getVoices();
      this._cachedVoice = voices.find(v => v.lang === 'zh-TW' && v.name.includes('Google')) ||
                          voices.find(v => v.lang === 'zh-TW') ||
                          voices.find(v => v.lang.startsWith('zh')) ||
                          null;
    }
    if (this._cachedVoice) utterance.voice = this._cachedVoice;

    window.speechSynthesis.speak(utterance);
  },

  /**
   * 附加引導表單按鈕（不加入 messages 陣列，獨立插入到對話末尾）
   * @param {number} formId
   * @param {string} serviceName
   */
  addFormButton(formId, serviceName) {
    if (!this.container) return;
    const btn = document.createElement('div');
    btn.className = 'message-form-action';
    btn.innerHTML = `
      <button class="btn-primary form-guide-btn"
              onclick="Utils.navigate('form.html?form_id=${formId}&service=${encodeURIComponent(serviceName || '')}')">
        📋 填寫${serviceName ? ' ' + serviceName : ''}需求表單
      </button>
    `;
    this.container.appendChild(btn);
    this.container.scrollTop = this.container.scrollHeight;
  },

  /**
   * 附加確認送出按鈕（fallback 用，Bedrock 不可用時）
   * @param {number} formId
   * @param {string} serviceName
   */
  addFormButton(formId, serviceName) {
    if (!this.container) return;
    const btn = document.createElement('div');
    btn.className = 'message-form-action';
    btn.setAttribute('role', 'region');
    btn.setAttribute('aria-label', '填寫表單');
    btn.innerHTML = `
      <button class="btn-primary form-guide-btn"
              onclick="Utils.navigate('form.html?form_id=${formId}&service=${encodeURIComponent(serviceName || '')}')">
        📋 填寫${serviceName ? ' ' + serviceName : ''}需求表單
      </button>
    `;
    this.container.appendChild(btn);
    this.container.scrollTop = this.container.scrollHeight;
  },

  /**
   * 顯示建單成功確認卡片（AI 收集完畢，PHP 已自動建單）
   * @param {string} feedbackNo  - 諮詢單號
   * @param {string} intent      - 服務類型代碼
   * @param {Object} collected   - AI 收集到的資料
   */
  addOrderConfirmCard(feedbackNo, intent, collected) {
    if (!this.container) return;

    const intentLabels = {
      restaurant_booking: '餐廳訂位',
      shopping:           '商品購買',
      cleaning:           '居家清潔',
      repair:             '水電修繕',
      appliance:          '家電清洗',
      delivery:           '包裹寄件',
    };
    const serviceLabel = intentLabels[intent] || '服務需求';

    const card = document.createElement('div');
    card.className = 'order-confirm-card';
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', '建單成功');
    card.innerHTML = `
      <div class="confirm-icon" aria-hidden="true">✅</div>
      <div class="confirm-title">${serviceLabel}需求已建立</div>
      <div class="confirm-no">單號：${feedbackNo || '已記錄'}</div>
      <div class="confirm-detail">
        ${collected && collected.name  ? `<span>姓名：${collected.name}</span><br>` : ''}
        ${collected && collected.phone ? `<span>手機：${collected.phone}</span>` : ''}
      </div>
      <p class="confirm-hint">廠商將在 24 小時內與您聯繫確認細節。</p>
      <button class="btn-primary form-guide-btn" onclick="Utils.navigate('orders.html')">
        📋 查看我的訂單
      </button>
    `;
    this.container.appendChild(card);
    this.container.scrollTop = this.container.scrollHeight;
  },

  /**
   * 附加確認送出按鈕（AI 對話收集完資訊並經用戶確認後）
   * @param {number} formId
   * @param {string} serviceName
   */
  addSubmitButton(formId, serviceName) {
    if (!this.container) return;
    const btn = document.createElement('div');
    btn.className = 'message-form-action';
    btn.innerHTML = `
      <button class="btn-primary form-guide-btn"
              onclick="Chat.submitOrder(${formId}, '${(serviceName || '').replace(/'/g, "\\'")}')">
        ✅ 確認送出需求
      </button>
    `;
    this.container.appendChild(btn);
    this.container.scrollTop = this.container.scrollHeight;
  },

  /**
   * 送出訂單（從對話歷史中萃取需求資訊）
   * @param {number} formId
   * @param {string} serviceName
   */
  async submitOrder(formId, serviceName) {
    const user = JSON.parse(localStorage.getItem('ai_user') || '{}');
    const description = this.conversationHistory
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .slice(-3)
      .join('\n');

    const result = await API.submitForm({
      form_id: formId,
      account_id: user.inbr_account_id || '',
      account_name: user.name || '',
      contact_name: user.name || '',
      contact_mobile: user.phone || '',
      description: description,
      data: { source: 'ai_chat', service: serviceName, history: this.conversationHistory.slice(-10) },
    });

    if (result && result.success) {
      this.addMessage('ai', `已為您送出「${serviceName}」的需求！\n我們會盡快為您媒合適合的服務商，您可以在「訂單」頁面追蹤進度。`, true);
      this.conversationHistory.push({ role: 'assistant', content: `需求已送出：${serviceName}` });
    } else {
      this.addMessage('ai', '抱歉，送出時發生問題，請稍後再試。', false);
    }
  },

  /**
   * 渲染所有訊息
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = '';
    this.messages.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = `message-bubble ${msg.sender}`;
      if (msg.imageHtml) {
        bubble.innerHTML = msg.imageHtml;
      } else if (msg.isHtml) {
        bubble.innerHTML = msg.text.replace(/\n/g, '<br>');
      } else {
        bubble.textContent = msg.text;
      }

      // AI 訊息加上語音朗讀按鈕
      if (msg.sender === 'ai') {
        const speakBtn = document.createElement('button');
        speakBtn.className = 'speak-btn';
        speakBtn.title = '朗讀此訊息';
        speakBtn.textContent = '🔊';
        speakBtn.style.cssText = 'background:none;border:none;cursor:pointer;font-size:14px;padding:2px 6px;margin-left:4px;opacity:0.6;vertical-align:middle;';
        speakBtn.addEventListener('click', () => {
          this.speakText(msg.text);
          speakBtn.style.opacity = '1';
          setTimeout(() => { speakBtn.style.opacity = '0.6'; }, 1500);
        });
        bubble.appendChild(speakBtn);
      }

      this.container.appendChild(bubble);
    });

    // 捲動到底部
    this.container.scrollTop = this.container.scrollHeight;
  },

  /**
   * 顯示打字動畫
   */
  showTyping() {
    if (!this.container) return;
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.id = 'typing-indicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    this.container.appendChild(typing);
    this.container.scrollTop = this.container.scrollHeight;
  },

  /**
   * 隱藏打字動畫
   */
  hideTyping() {
    const typing = Utils.$('#typing-indicator');
    if (typing) typing.remove();
  },
};
