/**
 * 工具函式
 */
const Utils = {
  /**
   * 格式化日期時間
   */
  formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hour}:${min}`;
  },

  /**
   * 格式化日期（不含時間）
   */
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  },

  /**
   * 格式化金額
   */
  formatAmount(num) {
    if (num === null || num === undefined) return '$0';
    return '$' + Number(num).toLocaleString('zh-TW');
  },

  /**
   * 取得訂單狀態標籤
   */
  getOrderStatusBadge(status) {
    const info = CONFIG.ORDER_STATUS[status] || { label: '未知', badge: 'badge-muted' };
    return `<span class="badge ${info.badge}">${info.label}</span>`;
  },

  /**
   * DOM 快捷 - 取得元素
   */
  $(selector) {
    return document.querySelector(selector);
  },

  /**
   * DOM 快捷 - 取得多個元素
   */
  $$(selector) {
    return document.querySelectorAll(selector);
  },

  /**
   * 建立 DOM 元素
   */
  createElement(tag, attrs = {}, children = '') {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') el.className = value;
      else if (key === 'dataset') Object.assign(el.dataset, value);
      else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
      else el.setAttribute(key, value);
    });
    if (typeof children === 'string') el.innerHTML = children;
    else if (children instanceof HTMLElement) el.appendChild(children);
    else if (Array.isArray(children)) children.forEach(c => el.appendChild(c));
    return el;
  },

  /**
   * 簡易 toast 提示
   */
  toast(message, duration = 2500) {
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.8); color: #fff; padding: 10px 20px;
      border-radius: 20px; font-size: 13px; z-index: 9999;
      animation: fadeIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  },

  /**
   * 簡易確認對話框
   */
  confirm(message) {
    return window.confirm(message);
  },

  /**
   * 驗證 Email
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * 驗證手機號碼（台灣）
   */
  isValidPhone(phone) {
    return /^09\d{8}$/.test(phone);
  },

  /**
   * 取得 URL 參數
   */
  getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },

  /**
   * 頁面跳轉
   */
  navigate(url) {
    window.location.href = url;
  },
};
