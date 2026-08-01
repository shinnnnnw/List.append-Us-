/**
 * AI 聊天模組
 * 負責訊息收發、串接 OpenAI 對話、表單引導
 */
const Chat = {
  messages: [],
  container: null,
  input: null,

  /**
   * 初始化聊天
   */
  init() {
    this.container = Utils.$('#chat-container');
    this.input = Utils.$('#chat-input');

    if (!this.container || !this.input) return;

    // 預設 AI 歡迎訊息
    this.messages = [
      { id: 1, sender: 'ai', text: '你好！我是您的 AI 智慧社區管家。有任何問題都可以問我，不論是生活瑣事、社區服務，或是想訂位、叫清潔，我都能幫您安排！' },
    ];
    this.render();

    // 綁定發送事件
    const sendBtn = Utils.$('#chat-send-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.handleSend());
    }
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });
  },

  /**
   * 取得對話歷史（供 API 傳送上下文）
   * 排除歡迎訊息，只保留純文字內容
   */
  getHistory() {
    return this.messages
      .filter(msg => msg.id !== 1) // 排除初始歡迎訊息
      .map(msg => ({
        sender: msg.sender === 'ai' ? 'assistant' : 'user',
        text: msg.rawText || msg.text, // 優先使用原始文字（未加 HTML 的版本）
      }));
  },

  /**
   * 處理發送訊息
   */
  async handleSend() {
    const text = this.input.value.trim();
    if (!text) return;

    // 新增使用者訊息
    this.addMessage('user', text);
    this.input.value = '';

    // 顯示打字動畫
    this.showTyping();

    // 呼叫 AI API，帶入對話歷史
    const result = await API.chat(text, this.getHistory());

    // 移除打字動畫
    this.hideTyping();

    if (result && result.success) {
      const data = result.data;
      let replyText = data.reply;
      let replyHtml = data.reply;

      // 如果有推薦表單，加入按鈕連結
      if (data.has_form && data.form_id) {
        replyHtml += `<a href="form.html?form_id=${data.form_id}&service=${encodeURIComponent(data.service || '')}" class="form-link">前往填寫表單 →</a>`;
      }

      this.addMessage('ai', replyHtml, true, replyText);
    } else if (result && result._unauthorized) {
      this.addMessage('ai', '登入已過期，請重新登入後再使用聊天功能。');
    } else {
      this.addMessage('ai', '抱歉，目前系統忙碌中，請稍後再試。');
    }
  },

  /**
   * 新增訊息
   * @param {string} sender - 'user' 或 'ai'
   * @param {string} content - 顯示內容（可能含 HTML）
   * @param {boolean} isHtml - 是否為 HTML 內容
   * @param {string} rawText - 原始純文字（用於傳送歷史給 API）
   */
  addMessage(sender, content, isHtml = false, rawText = null) {
    this.messages.push({
      id: Date.now(),
      sender,
      text: content,
      rawText: rawText || content,
      isHtml,
    });
    this.render();
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
      if (msg.isHtml) {
        bubble.innerHTML = msg.text;
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
