/**
 * AI 聊天模組
 * 負責訊息收發、意圖辨識回覆、表單引導
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
      { id: 1, sender: 'ai', text: '你好！我是您的 AI 智慧社區管家。今天晚上想吃火鍋，順便叫人來整理家裡嗎？' },
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

    // 呼叫 AI API
    const result = await API.chat(text);

    // 移除打字動畫
    this.hideTyping();

    if (result && result.success) {
      const data = result.data;
      let replyHtml = data.reply;

      // 如果有推薦表單，加入按鈕連結
      if (data.has_form && data.form_id) {
        replyHtml += `<a href="form.html?form_id=${data.form_id}&service=${encodeURIComponent(data.service || '')}" class="form-link">前往填寫表單 →</a>`;
      }

      this.addMessage('ai', replyHtml, true);
    } else {
      this.addMessage('ai', '抱歉，目前系統忙碌中，請稍後再試。');
    }
  },

  /**
   * 新增訊息
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
