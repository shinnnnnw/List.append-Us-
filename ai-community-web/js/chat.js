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

    // 預設 AI 歡迎訊息
    this.messages = [
      { id: 1, sender: 'ai', text: '你好！我是您的 AI 智慧社區管家。有什麼我能幫您的嗎？不論是餐廳訂位、居家清潔、水電修繕、包裹寄送，或是任何生活問題，直接跟我說就好！' },
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

    // 初始化語音輸入
    this.initVoice();
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
    if (!text) return;

    // 新增使用者訊息到 UI
    this.addMessage('user', text);
    this.input.value = '';

    // 加入對話歷史
    this.conversationHistory.push({ role: 'user', content: text });

    // 顯示打字動畫
    this.showTyping();

    // 呼叫 AI API，帶入完整對話歷史
    const result = await API.chatConversation(text, this.conversationHistory);

    // 移除打字動畫
    this.hideTyping();

    if (result && result.success && result.data) {
      const reply = result.data.reply || result.data;

      // 顯示 AI 回覆
      this.addMessage('ai', reply);

      // 加入對話歷史
      this.conversationHistory.push({ role: 'assistant', content: reply });
    } else {
      const errorMsg = '抱歉，目前系統忙碌中，請稍後再試。';
      this.addMessage('ai', errorMsg);
    }
  },

  /**
   * 新增訊息到 UI
   */
  addMessage(sender, content) {
    this.messages.push({
      id: Date.now(),
      sender,
      text: content,
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
      bubble.textContent = msg.text;
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
