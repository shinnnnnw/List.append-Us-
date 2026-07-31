// 模擬登入狀態，對應原本 context/AuthContext.tsx（無持久化，重新整理頁面會重置）
let currentUser = null;

const services = [
  { name: '外送', formId: '6', color: '#FF5722' },
  { name: '訂位', formId: '1', color: '#4CAF50' },
  { name: '清潔', formId: '3', color: '#2196F3' },
  { name: '修繕', formId: '3', color: '#FFC107' },
  { name: '宅配', formId: '4', color: '#9C27B0' },
  { name: '購物', formId: '2', color: '#E91E63' },
];

let messages = [];

function login() {
  currentUser = {
    inbr_account_id: 'c0000000-0000-0000-0000-000000000001',
    name: '王小明',
    phone: '0912345001',
    email: 'wang01@example.com',
  };

  messages = [
    { id: 1, sender: 'ai', text: '你好！我是您的 AI 智慧社區管家。今天晚上想吃火鍋，順便叫人來整理家裡嗎？' },
  ];

  showDashboard();
}

function showDashboard() {
  document.getElementById('view-login').classList.add('hidden');
  document.getElementById('view-dashboard').classList.remove('hidden');
  document.getElementById('header-title').textContent = `嗨，${currentUser?.name || '住戶'}！AI 智慧管家在線上`;
  renderServiceGrid();
  renderMessages();
}

function renderServiceGrid() {
  const grid = document.getElementById('service-grid');
  grid.innerHTML = '';
  services.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = 'service-button';
    btn.style.backgroundColor = item.color + '15';
    btn.style.color = item.color;
    btn.textContent = item.name;
    btn.addEventListener('click', () => {
      alert(`即將前往 ${item.name} 需求單`);
    });
    grid.appendChild(btn);
  });
}

function renderMessages() {
  const container = document.getElementById('chat-container');
  container.innerHTML = '';
  messages.forEach((msg) => {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${msg.sender === 'user' ? 'user' : 'ai'}`;
    bubble.textContent = msg.text;
    container.appendChild(bubble);
  });
  container.scrollTop = container.scrollHeight;
}

function handleSend() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  messages.push({ id: Date.now(), sender: 'user', text });
  input.value = '';
  renderMessages();

  setTimeout(() => {
    let replyText = '收到您的需求，正在為您媒合社區服務...';
    let targetFormId = '3';

    if (text.includes('吃') || text.includes('訂位') || text.includes('餐廳')) {
      replyText = '辨識到您有餐廳訂位需求，已為您產生專屬留資表單，請點擊下方按鈕填寫確認。';
      targetFormId = '1';
    } else if (text.includes('買') || text.includes('購物')) {
      replyText = '辨識到您有商品採買需求，已為您產生動態需求表單。';
      targetFormId = '2';
    }

    messages.push({ id: Date.now() + 1, sender: 'ai', text: replyText });
    renderMessages();

    alert(`AI 智慧引導：即將為您切換至彈性留資表單 (Form ID: ${targetFormId})`);
  }, 1200);
}

document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('send-btn').addEventListener('click', handleSend);
document.getElementById('chat-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSend();
});
