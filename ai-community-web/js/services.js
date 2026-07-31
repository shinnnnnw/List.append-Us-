/**
 * 服務模組
 * 負責服務列表渲染、分類篩選
 */
const Services = {
  vendors: [],
  services: [],
  currentVendor: null,

  /**
   * 初始化服務總覽頁
   */
  async init() {
    if (!Auth.requireAuth()) return;

    await this.loadData();
    this.renderCategories();
    this.renderList();
  },

  /**
   * 載入服務資料
   */
  async loadData() {
    const result = await API.getServices();
    if (result && result.success) {
      this.vendors = result.data.vendors || [];
      this.services = result.data.services || [];
    }
  },

  /**
   * 渲染分類 Tab
   */
  renderCategories() {
    const container = Utils.$('#service-categories');
    if (!container) return;

    container.innerHTML = '';

    // 「全部」Tab
    const allTab = Utils.createElement('button', {
      className: `category-tab ${!this.currentVendor ? 'active' : ''}`,
      onClick: () => this.filterByVendor(null),
    }, '全部');
    container.appendChild(allTab);

    // 各服務商 Tab
    this.vendors.forEach(vendor => {
      const tab = Utils.createElement('button', {
        className: `category-tab ${this.currentVendor === vendor.id ? 'active' : ''}`,
        onClick: () => this.filterByVendor(vendor.id),
      }, vendor.name);
      container.appendChild(tab);
    });
  },

  /**
   * 依服務商篩選
   */
  filterByVendor(vendorId) {
    this.currentVendor = vendorId;
    this.renderCategories();
    this.renderList();
  },

  /**
   * 渲染服務列表
   */
  renderList() {
    const container = Utils.$('#service-list');
    if (!container) return;

    let filtered = this.services;
    if (this.currentVendor) {
      filtered = this.services.filter(s => s.service_vendor_id === this.currentVendor);
    }

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>目前沒有服務項目</p></div>';
      return;
    }

    container.innerHTML = '';
    filtered.forEach(service => {
      const card = Utils.createElement('div', {
        className: 'service-card',
        onClick: () => Utils.navigate(`service-detail.html?id=${service.id}`),
      });

      const imgUrl = service.img_url || 'assets/images/placeholder.png';
      card.innerHTML = `
        <img class="service-img" src="${imgUrl}" alt="${service.name}" onerror="this.style.display='none'">
        <div class="service-info">
          <div>
            <div class="service-name">${service.name}</div>
            <div class="service-desc">${service.description || ''}</div>
          </div>
          <span class="service-action">查看詳情 →</span>
        </div>
      `;
      container.appendChild(card);
    });
  },

  /**
   * 初始化服務詳情頁
   */
  async initDetail() {
    if (!Auth.requireAuth()) return;

    const serviceId = Utils.getUrlParam('id');
    if (!serviceId) {
      Utils.navigate('services.html');
      return;
    }

    const result = await API.getService(serviceId);
    if (result && result.success) {
      this.renderDetail(result.data);
    } else {
      Utils.toast('載入服務資訊失敗');
    }
  },

  /**
   * 渲染服務詳情
   */
  renderDetail(service) {
    const banner = Utils.$('#service-banner');
    const info = Utils.$('#service-info');
    const actionBtn = Utils.$('#service-action-btn');

    if (banner && service.img_url) {
      banner.src = service.img_url;
    }

    if (info) {
      info.innerHTML = `
        <h1 class="service-detail-title">${service.name}</h1>
        <p class="service-detail-desc">${service.description || ''}</p>
        <div class="card">
          <h3 class="section-title">服務商</h3>
          <p>${service.vendor_name || ''}</p>
        </div>
      `;
    }

    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        Utils.navigate(`form.html?form_id=${service.id}&service=${encodeURIComponent(service.name)}`);
      });
    }

    // 更新 header 標題
    const headerTitle = Utils.$('.header-title');
    if (headerTitle) headerTitle.textContent = service.name;
  },
};
