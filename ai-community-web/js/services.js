/**
 * 服務模組
 * 負責服務列表渲染、分類篩選
 */
const Services = {
  vendors: [],
  serviceTypeMap: {},
  currentType: null,

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
      this.serviceTypeMap = result.data.service_type_map || {};
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
      className: 'category-tab' + (!this.currentType ? ' active' : ''),
      onClick: function() { Services.filterByType(null); },
    }, '全部');
    container.appendChild(allTab);

    // 依服務類型產生 Tab
    var typeMap = this.serviceTypeMap;
    Object.keys(typeMap).forEach(function(typeCode) {
      var typeName = typeMap[typeCode];
      var tab = Utils.createElement('button', {
        className: 'category-tab' + (Services.currentType === typeCode ? ' active' : ''),
        onClick: function() { Services.filterByType(typeCode); },
      }, typeName);
      container.appendChild(tab);
    });
  },

  /**
   * 依服務類型篩選（未來可用，目前先用全部顯示）
   */
  filterByType(typeCode) {
    this.currentType = typeCode;
    this.renderCategories();
    this.renderList();
  },

  /**
   * 渲染服務列表（以 pms_vendor 作為服務項目）
   */
  renderList() {
    const container = Utils.$('#service-list');
    if (!container) return;

    var filtered = this.vendors;

    // 未來若要依類型篩選，可在此加 filter 邏輯

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>目前沒有服務項目</p></div>';
      return;
    }

    container.innerHTML = '';
    filtered.forEach(function(vendor) {
      var card = Utils.createElement('div', {
        className: 'service-card',
        onClick: function() {
          Utils.navigate('service-detail.html?id=' + vendor.vendor_id);
        },
      });

      var ratingText = vendor.rating_avg ? '★ ' + vendor.rating_avg + ' (' + vendor.rating_count + ')' : '';
      card.innerHTML =
        '<div class="service-info" style="width:100%">' +
          '<div>' +
            '<div class="service-name">' + vendor.vendor_name + '</div>' +
            '<div class="service-desc">' + (vendor.vendor_no || '') + (ratingText ? ' · ' + ratingText : '') + '</div>' +
          '</div>' +
          '<span class="service-action">查看詳情 →</span>' +
        '</div>';
      container.appendChild(card);
    });
  },

  /**
   * 初始化服務詳情頁
   */
  async initDetail() {
    if (!Auth.requireAuth()) return;

    var serviceId = Utils.getUrlParam('id');
    if (!serviceId) {
      Utils.navigate('services.html');
      return;
    }

    var result = await API.getService(serviceId);
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
    var banner = Utils.$('#service-banner');
    var info = Utils.$('#service-info');
    var actionBtn = Utils.$('#service-action-btn');

    if (banner) {
      banner.style.display = 'none'; // 無圖先隱藏
    }

    if (info) {
      var areasHtml = '';
      if (service.service_areas && service.service_areas.length > 0) {
        var areaNames = service.service_areas.map(function(a) {
          return a.county_name + (a.district_name || '');
        });
        areasHtml = '<div class="card"><h3 class="section-title">服務地區</h3><p>' + areaNames.join('、') + '</p></div>';
      }

      info.innerHTML =
        '<h1 class="service-detail-title">' + service.vendor_name + '</h1>' +
        '<p class="service-detail-desc">聯絡人：' + (service.contact_name || '-') + '</p>' +
        '<p class="service-detail-desc">電話：' + (service.contact_phone || '-') + '</p>' +
        (service.rating_avg ? '<p class="service-detail-desc">評分：★ ' + service.rating_avg + ' (' + service.rating_count + ' 則)</p>' : '') +
        areasHtml;
    }

    if (actionBtn) {
      actionBtn.addEventListener('click', function() {
        // 根據廠商的服務類型決定導向哪個表單
        var formId = 3; // 預設社區服務表單
        if (service.service_types) {
          if (service.service_types.indexOf('01') >= 0) formId = 1;
          else if (service.service_types.indexOf('02') >= 0) formId = 2;
        }
        Utils.navigate('form.html?form_id=' + formId + '&service=' + encodeURIComponent(service.vendor_name));
      });
    }

    // 更新 header 標題
    var headerTitle = Utils.$('.header-title');
    if (headerTitle) headerTitle.textContent = service.vendor_name;
  },
};
