/**
 * 訂單模組
 * 負責訂單列表、狀態篩選、詳情展示
 */
const Orders = {
  orders: [],
  currentFilter: null,

  /**
   * 初始化訂單列表頁
   */
  async init() {
    if (!Auth.requireAuth()) return;

    this.bindTabs();
    await this.loadOrders();
    this.renderList();
  },

  /**
   * 綁定篩選 Tab
   */
  bindTabs() {
    const tabs = Utils.$$('.order-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.dataset.status || null;
        this.renderList();
      });
    });
  },

  /**
   * 載入訂單資料
   */
  async loadOrders() {
    const result = await API.getOrders();
    if (result && result.success) {
      this.orders = result.data || [];
    }
  },

  /**
   * 渲染訂單列表
   */
  renderList() {
    const container = Utils.$('#order-list');
    if (!container) return;

    let filtered = this.orders;
    if (this.currentFilter) {
      filtered = this.orders.filter(o => o.order_status === this.currentFilter);
    }

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📄</div><p>目前沒有訂單紀錄</p></div>';
      return;
    }

    container.innerHTML = '';
    filtered.forEach(order => {
      const card = Utils.createElement('div', {
        className: 'order-card',
        onClick: () => Utils.navigate(`order-detail.html?id=${order.record_id}`),
      });

      card.innerHTML =
        '<div class="order-card-header">' +
          '<span class="order-no">' + order.order_no + '</span>' +
          Utils.getOrderStatusBadge(order.order_status) +
        '</div>' +
        '<div class="order-card-body">' +
          '<span class="order-service">' + (order.service_name || order.vendor_name || '服務') + '</span>' +
          '<span class="order-amount">' + (order.final_amount > 0 ? Utils.formatAmount(order.final_amount) : '-') + '</span>' +
        '</div>' +
        '<div class="order-card-footer">' +
          '<span class="order-time">' + Utils.formatDateTime(order.order_time) + '</span>' +
          '<button class="order-action-btn">查看詳情 →</button>' +
        '</div>';
      container.appendChild(card);
    });
  },

  /**
   * 初始化訂單詳情頁
   */
  async initDetail() {
    if (!Auth.requireAuth()) return;

    const orderId = Utils.getUrlParam('id');
    if (!orderId) {
      Utils.navigate('orders.html');
      return;
    }

    const result = await API.getOrderDetail(orderId);
    if (result && result.success) {
      this.renderDetail(result.data);
    } else {
      Utils.toast('載入訂單資訊失敗');
    }
  },

  /**
   * 渲染訂單詳情
   */
  renderDetail(order) {
    // 基本資訊
    const infoSection = Utils.$('#order-info');
    if (infoSection) {
      infoSection.innerHTML = `
        <div class="order-info-row">
          <span class="info-label">訂單編號</span>
          <span class="info-value">${order.order_no}</span>
        </div>
        <div class="order-info-row">
          <span class="info-label">訂單狀態</span>
          <span class="info-value">${Utils.getOrderStatusBadge(order.order_status)}</span>
        </div>
        <div class="order-info-row">
          <span class="info-label">服務項目</span>
          <span class="info-value">${order.service_name || '-'}</span>
        </div>
        <div class="order-info-row">
          <span class="info-label">服務商</span>
          <span class="info-value">${order.vendor_name || '-'}</span>
        </div>
        <div class="order-info-row">
          <span class="info-label">訂單類型</span>
          <span class="info-value">${CONFIG.ORDER_TYPE[order.order_type] || '-'}</span>
        </div>
        <div class="order-info-row">
          <span class="info-label">建立時間</span>
          <span class="info-value">${Utils.formatDateTime(order.order_time)}</span>
        </div>
      `;
    }

    // 金額資訊
    const amountSection = Utils.$('#order-amount');
    if (amountSection && order.final_amount > 0) {
      amountSection.innerHTML = `
        <h3 class="section-title">金額明細</h3>
        <div class="order-items">
          <div class="order-item-row">
            <span>原始金額</span>
            <span>${Utils.formatAmount(order.original_amount)}</span>
          </div>
          ${order.discount_amount > 0 ? `
          <div class="order-item-row">
            <span>折扣</span>
            <span>-${Utils.formatAmount(order.discount_amount)}</span>
          </div>` : ''}
          <div class="order-item-row total">
            <span>實付金額</span>
            <span>${Utils.formatAmount(order.final_amount)}</span>
          </div>
          ${order.earn_points > 0 ? `
          <div class="order-item-row">
            <span>獲得點數</span>
            <span style="color:var(--primary)">+${order.earn_points} P</span>
          </div>` : ''}
        </div>
      `;
      amountSection.classList.remove('hidden');
    }

    // 時間軸
    const timelineSection = Utils.$('#order-timeline');
    if (timelineSection && order.timeline) {
      let timelineHtml = '<h3 class="section-title">訂單進度</h3><div class="order-timeline">';
      order.timeline.forEach((item, index) => {
        const isLast = index === order.timeline.length - 1;
        timelineHtml += `
          <div class="timeline-item ${isLast ? 'current' : 'active'}">
            <div class="timeline-status">${item.status}</div>
            <div class="timeline-time">${Utils.formatDateTime(item.time)}</div>
          </div>
        `;
      });
      timelineHtml += '</div>';
      timelineSection.innerHTML = timelineHtml;
    }

    // 備註
    const remarkSection = Utils.$('#order-remark');
    if (remarkSection && order.remark) {
      remarkSection.innerHTML = `
        <h3 class="section-title">備註</h3>
        <div class="card"><p>${order.remark}</p></div>
      `;
      remarkSection.classList.remove('hidden');
    }

    // 操作按鈕
    const actionsSection = Utils.$('#order-actions');
    if (actionsSection) {
      let actionsHtml = '';
      if (['01', '02', '03', '04'].includes(order.order_status)) {
        actionsHtml += `<button class="btn btn-outline btn-block" onclick="Orders.cancelOrder('${order.record_id}')">取消訂單</button>`;
      }
      if (order.order_status === '80') {
        actionsHtml += `<button class="btn btn-primary btn-block" onclick="Utils.navigate('form.html?form_id=${order.service_id}')">再次預約</button>`;
      }
      actionsSection.innerHTML = actionsHtml;
    }
  },

  _cancelInProgress: false,

  /**
   * 取消訂單
   */
  async cancelOrder(orderId) {
    if (!Utils.confirm('確定要取消此訂單嗎？')) return;
    if (this._cancelInProgress) return;

    this._cancelInProgress = true;
    const result = await API.cancelOrder(orderId);
    this._cancelInProgress = false;

    if (result && result.success) {
      Utils.toast('訂單已取消');
      setTimeout(() => Utils.navigate('orders.html'), 1000);
    } else {
      Utils.toast(result?.message || '取消失敗，請稍後再試');
    }
  },
};
