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
  },

  /**
   * 初始化圖片上傳功能
   */
  initImageUpload() {
    const imageInput = Utils.$('#chat-image-input');
    const removeBtn = Utils.$('#chat-image-remove');

    if (imageInput) {
      imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 檢查檔案大小（限制 5MB）
        if (file.size > 5 * 1024 * 1024) {
          alert('圖片大小不能超過 5MB，請重新選擇');
          imageInput.value = '';
          return;
        }

        // 轉 base64 並預覽
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          this.pendingImage = base64;
          this.showImagePreview(base64);
        };
        reader.readAsDataURL(file);
      });
    }

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

    const result = await API.chatConversation(text || '請分析這張照片的問題', this.conversationHistory, imageData);

    // 把這輪 user 訊息加入歷史
    this.conversationHistory.push({ role: 'user', content: text || '[上傳照片]' });

    // 移除打字動畫
    this.hideTyping();

    if (result && result.success && result.data) {
      const data = result.data;
      const replyText = data.reply || '';

      // 顯示 AI 回覆（允許 HTML）
      this.addMessage('ai', replyText, true);

      // 根據狀態決定下一步
      if (data.status === 'confirmed' && data.has_form && data.form_id) {
        // AI 收集完資訊且用戶已確認 → 顯示送出按鈕
        this.addSubmitButton(data.form_id, data.service);
      }

      // 加入對話歷史（存純文字）
      const plainReply = replyText.replace(/<[^>]*>/g, '');
      this.conversationHistory.push({ role: 'assistant', content: plainReply });
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
        // 將換行符轉為 <br>，讓 AI 回覆正確換行顯示
        bubble.innerHTML = msg.text.replace(/\n/g, '<br>');
      } else {
        bubble.textContent = msg.text;
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
