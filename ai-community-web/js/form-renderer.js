/**
 * 動態表單渲染器
 * 根據 pms_form_topic 結構產生對應 HTML 表單欄位
 */
const FormRenderer = {
  formData: null,
  uploadedFiles: {},

  /**
   * 初始化表單頁
   */
  async init() {
    if (!Auth.requireAuth()) return;

    const formId = Utils.getUrlParam('form_id');
    const serviceName = Utils.getUrlParam('service');

    if (!formId) {
      Utils.toast('缺少表單參數');
      return;
    }

    // 更新標題
    const headerTitle = Utils.$('.header-title');
    if (headerTitle) headerTitle.textContent = serviceName || '服務表單';

    // 載入表單結構
    const result = await API.getForm(formId);
    if (result && result.success && result.data) {
      const raw = result.data;
      // API.getForm 回傳格式為 { id, name, groups: [{ topics }] }
      // 將其轉換為 FormRenderer 需要的 { form, topics } 格式
      const allTopics = [];
      if (raw.groups && raw.groups.length > 0) {
        raw.groups.forEach(function(group) {
          (group.topics || []).forEach(function(t) {
            // options 可能是字串陣列，需轉為 { id, option_name } 格式
            if (t.options && Array.isArray(t.options) && t.options.length > 0 && typeof t.options[0] === 'string') {
              t.options = t.options.map(function(opt, idx) {
                return { id: idx + 1, option_name: opt };
              });
            }
            allTopics.push(t);
          });
        });
      } else if (raw.topics) {
        // 已經是扁平 topics 格式（Lambda /forms/:id 回傳）
        raw.topics.forEach(function(t) {
          if (t.options && Array.isArray(t.options) && t.options.length > 0 && typeof t.options[0] === 'string') {
            t.options = t.options.map(function(opt, idx) {
              return { id: idx + 1, option_name: opt };
            });
          }
          allTopics.push(t);
        });
      }
      this.formData = {
        form: { id: raw.id, name: raw.name, intro_content: raw.intro_content || null, notice_content: raw.notice_content || null, terms_content: raw.terms_content || null },
        topics: allTopics,
      };
      this.render();
    } else {
      Utils.toast('載入表單失敗');
    }
  },

  /**
   * 渲染完整表單
   */
  render() {
    const { form, topics } = this.formData;
    const container = Utils.$('#form-body');
    if (!container) return;

    // 表單標題與說明
    const header = Utils.$('#form-header');
    if (header) {
      header.innerHTML = `
        <h2>${form.name || '服務表單'}</h2>
        ${form.intro_content ? `<div class="form-intro">${form.intro_content}</div>` : ''}
      `;
    }

    // 注意事項
    const notice = Utils.$('#form-notice');
    if (notice && form.notice_content) {
      notice.innerHTML = form.notice_content;
      notice.classList.remove('hidden');
    }

    // 渲染題目
    container.innerHTML = '';
    topics.forEach(topic => {
      const fieldEl = this.renderTopic(topic);
      if (fieldEl) container.appendChild(fieldEl);
    });

    // 條款
    const terms = Utils.$('#form-terms');
    if (terms && form.terms_content) {
      terms.innerHTML = `
        <div>${form.terms_content}</div>
        <label class="form-terms-check">
          <input type="checkbox" id="agree-terms" required>
          <span>我已閱讀並同意上述服務條款</span>
        </label>
      `;
      terms.classList.remove('hidden');
    }

    // 送出按鈕
    const submitBtn = Utils.$('#form-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.handleSubmit());
    }

    // 商城購物：收貨方式切換配送欄位（宅配=地址 / 超商=門市選擇 / 門市自取=隱藏）
    this._initDeliveryToggle();
  },

  /**
   * 商城購物：監聽收貨方式切換配送欄位
   */
  _initDeliveryToggle() {
    const formId = Utils.getUrlParam('form_id');
    if (String(formId) !== '11') return; // 只對商城購物表單生效

    // 找到收貨方式的 radio group（選項包含「宅配到府」「超商取貨」「門市自取」）
    const radios = document.querySelectorAll('input[type="radio"][name]');
    let deliveryRadios = [];
    radios.forEach(r => {
      if (r.value === '宅配到府' || r.value === '超商取貨' || r.value === '門市自取') {
        deliveryRadios.push(r);
      }
    });
    if (deliveryRadios.length === 0) return;

    // 找到配送資料欄位（type 8 的 form-field）
    const contactFields = document.querySelectorAll('.form-field[data-type="8"]');
    const deliveryField = contactFields.length > 0 ? contactFields[contactFields.length - 1] : null;
    if (!deliveryField) return;

    // 7-11 門市清單 mock
    const storeOptions = [
      '信義威秀門市 (台北市信義區松壽路12號)',
      '忠孝復興門市 (台北市大安區忠孝東路四段77號)',
      '板橋車站門市 (新北市板橋區站前路5號)',
      '中壢站前門市 (桃園市中壢區中正路89號)',
      '台中火車站門市 (台中市中區建國路172號)',
    ];

    const updateDeliveryUI = () => {
      const selected = deliveryRadios.find(r => r.checked);
      if (!selected) return;

      // 取得地址相關元素
      const districtDiv = deliveryField.querySelector('.district-selects');
      const addressInput = deliveryField.querySelector('[data-field="address"]');
      let storeSelect = deliveryField.querySelector('#store-select');

      if (selected.value === '超商取貨') {
        // 隱藏縣市+地址，顯示門市選單
        if (districtDiv) districtDiv.style.display = 'none';
        if (addressInput) addressInput.style.display = 'none';
        if (!storeSelect) {
          storeSelect = document.createElement('select');
          storeSelect.id = 'store-select';
          storeSelect.className = 'form-select';
          storeSelect.setAttribute('data-field', 'address');
          storeSelect.style.marginTop = '8px';
          storeSelect.innerHTML = '<option value="">選擇 7-11 門市</option>' +
            storeOptions.map(s => `<option value="${s}">${s}</option>`).join('');
          const insertPoint = districtDiv || addressInput;
          if (insertPoint) insertPoint.parentNode.insertBefore(storeSelect, insertPoint);
          else deliveryField.appendChild(storeSelect);
        }
        storeSelect.style.display = '';
      } else if (selected.value === '門市自取') {
        // 隱藏所有地址欄位
        if (districtDiv) districtDiv.style.display = 'none';
        if (addressInput) addressInput.style.display = 'none';
        if (storeSelect) storeSelect.style.display = 'none';
      } else {
        // 宅配：顯示縣市+地址
        if (districtDiv) districtDiv.style.display = '';
        if (addressInput) addressInput.style.display = '';
        if (storeSelect) storeSelect.style.display = 'none';
      }
    };

    deliveryRadios.forEach(r => r.addEventListener('change', updateDeliveryUI));
  },

  /**
   * 依題型渲染單一題目
   */
  renderTopic(topic) {
    const field = document.createElement('div');
    field.className = 'form-field';
    field.dataset.topicId = topic.id;
    field.dataset.type = topic.type;
    field.dataset.required = topic.is_required;

    // 標籤
    const label = `
      <div class="field-label">
        ${topic.title}
        ${topic.is_required === '1' ? '<span class="required">*</span>' : ''}
      </div>
      ${topic.remark ? `<div class="field-remark">${topic.remark}</div>` : ''}
    `;
    field.innerHTML = label;

    // 依據 type 產生不同 input
    switch (topic.type) {
      case '1': // 簡答題
        field.appendChild(this.renderShortAnswer(topic));
        break;
      case '2': // 詳答題
        field.appendChild(this.renderLongAnswer(topic));
        break;
      case '3': // 單選題
        field.appendChild(this.renderRadio(topic));
        break;
      case '4': // 複選題
        field.appendChild(this.renderCheckbox(topic));
        break;
      case '5': // 地區選單
        field.appendChild(this.renderDistrict(topic));
        break;
      case '6': // 上傳照片
        field.appendChild(this.renderUpload(topic));
        break;
      case '7': // 備註說明
        field.appendChild(this.renderRemark(topic));
        break;
      case '8': // 聯絡資料（含地址）
        field.appendChild(this.renderContact(topic, true));
        break;
      case '9': // 日期題
        field.appendChild(this.renderDate(topic));
        break;
      case '10': // 聯絡資料（不含地址）
        field.appendChild(this.renderContact(topic, false));
        break;
      default:
        field.innerHTML += `<p class="field-remark">不支援的題型 (type: ${topic.type})</p>`;
    }

    return field;
  },

  /** 簡答題 */
  renderShortAnswer(topic) {
    const wrapper = document.createElement('div');
    const feature = topic.feature;
    let placeholder = '請輸入';
    let inputType = 'text';

    if (feature && feature.settings) {
      const settings = Array.isArray(feature.settings) ? feature.settings[0] : feature.settings;
      if (settings.placeholder) placeholder = settings.placeholder;
    }
    if (topic.is_number_only === '1') inputType = 'number';

    wrapper.innerHTML = `<input type="${inputType}" class="form-input" data-topic-id="${topic.id}" placeholder="${placeholder}">`;
    return wrapper;
  },

  /** 詳答題 */
  renderLongAnswer(topic) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<textarea class="form-textarea" data-topic-id="${topic.id}" placeholder="請詳細描述..."></textarea>`;
    return wrapper;
  },

  /** 單選題 */
  renderRadio(topic) {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-group';
    (topic.options || []).forEach(opt => {
      wrapper.innerHTML += `
        <div class="option-item">
          <input type="radio" name="topic_${topic.id}" id="opt_${opt.id}" value="${opt.id}" data-topic-id="${topic.id}">
          <label for="opt_${opt.id}">${opt.option_name}</label>
        </div>
      `;
    });
    return wrapper;
  },

  /** 複選題 */
  renderCheckbox(topic) {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-group';
    (topic.options || []).forEach(opt => {
      wrapper.innerHTML += `
        <div class="option-item">
          <input type="checkbox" name="topic_${topic.id}" id="opt_${opt.id}" value="${opt.id}" data-topic-id="${topic.id}">
          <label for="opt_${opt.id}">${opt.option_name}</label>
        </div>
      `;
    });
    return wrapper;
  },

  /** 地區選單 */
  renderDistrict(topic) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="district-selects">
        <select class="form-select" id="county_${topic.id}" data-topic-id="${topic.id}" data-field="county">
          <option value="">選擇縣市</option>
        </select>
        <select class="form-select" id="district_${topic.id}" data-topic-id="${topic.id}" data-field="district">
          <option value="">選擇行政區</option>
        </select>
      </div>
      <input type="text" class="form-input" id="address_${topic.id}" data-topic-id="${topic.id}" data-field="address" placeholder="詳細地址">
    `;

    setTimeout(() => {
      this._initCountyDistrict(`county_${topic.id}`, `district_${topic.id}`);
    }, 0);

    return wrapper;
  },

  /**
   * 共用：初始化縣市 / 行政區聯動下拉
   */
  async _initCountyDistrict(countySelectId, districtSelectId) {
    const countySelect = Utils.$(`#${countySelectId}`);
    const districtSelect = Utils.$(`#${districtSelectId}`);
    if (!countySelect || !districtSelect) return;

    // 載入縣市
    const result = await API.getCounties();
    if (result && result.success) {
      result.data.forEach(c => {
        countySelect.innerHTML += `<option value="${c.code}">${c.name}</option>`;
      });
    }

    // 縣市變更 → 載入行政區
    countySelect.addEventListener('change', async () => {
      districtSelect.innerHTML = '<option value="">選擇行政區</option>';
      if (!countySelect.value) return;
      const res = await API.getDistricts(countySelect.value);
      if (res && res.success) {
        res.data.forEach(d => {
          districtSelect.innerHTML += `<option value="${d.code}">${d.name}</option>`;
        });
      }
    });
  },

  /**
   * 共用：初始化縣市下拉（不含行政區）
   */
  async _initCountyOnly(countySelectId) {
    const countySelect = Utils.$(`#${countySelectId}`);
    if (!countySelect) return;

    const result = await API.getCounties();
    if (result && result.success) {
      result.data.forEach(c => {
        countySelect.innerHTML += `<option value="${c.code}">${c.name}</option>`;
      });
    }
  },

  /** 上傳照片 */
  renderUpload(topic) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="upload-area" id="upload_area_${topic.id}">
        <div class="upload-icon">📷</div>
        <div class="upload-text">點擊或拖曳上傳照片</div>
        <input type="file" accept="image/*" data-topic-id="${topic.id}" style="display:none" id="file_${topic.id}">
      </div>
      <div class="upload-preview" id="preview_${topic.id}"></div>
    `;

    setTimeout(() => {
      const area = Utils.$(`#upload_area_${topic.id}`);
      const fileInput = Utils.$(`#file_${topic.id}`);
      const preview = Utils.$(`#preview_${topic.id}`);

      if (area && fileInput) {
        area.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          // 顯示預覽
          const reader = new FileReader();
          reader.onload = (ev) => {
            preview.innerHTML += `<img src="${ev.target.result}" alt="preview">`;
          };
          reader.readAsDataURL(file);

          // 上傳
          const result = await API.upload(file);
          if (result && result.success) {
            if (!this.uploadedFiles[topic.id]) this.uploadedFiles[topic.id] = [];
            this.uploadedFiles[topic.id].push(result.data.path);
            Utils.toast('上傳成功');
          } else {
            Utils.toast('上傳失敗');
          }
        });
      }
    }, 0);

    return wrapper;
  },

  /** 備註說明（純顯示） */
  renderRemark(topic) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="form-notice">${topic.remark || topic.title}</div>`;
    return wrapper;
  },

  /** 聯絡資料 */
  renderContact(topic, withAddress) {
    const wrapper = document.createElement('div');
    const user = Auth.getUser() || {};
    let html = `
      <button type="button" class="btn-autofill" data-topic-id="${topic.id}" style="margin-bottom:8px;padding:6px 12px;background:#4CAF50;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px">📋 帶入會員資料</button>
      <input type="text" class="form-input" data-topic-id="${topic.id}" data-field="name" placeholder="姓名" style="margin-bottom:8px">
      <input type="tel" class="form-input" data-topic-id="${topic.id}" data-field="phone" placeholder="手機號碼 (09xxxxxxxx)" style="margin-bottom:8px">
      <input type="email" class="form-input" data-topic-id="${topic.id}" data-field="email" placeholder="Email">
    `;
    if (withAddress) {
      html += `
        <div class="district-selects" style="margin-top:8px">
          <select class="form-select" id="contact_county_${topic.id}" data-topic-id="${topic.id}" data-field="county">
            <option value="">選擇縣市</option>
          </select>
        </div>
        <input type="text" class="form-input" data-topic-id="${topic.id}" data-field="address" placeholder="完整地址（含行政區）" style="margin-top:8px">
      `;
    }
    wrapper.innerHTML = html;

    // 帶入會員資料按鈕
    setTimeout(() => {
      const btn = wrapper.querySelector('.btn-autofill');
      if (btn) {
        btn.addEventListener('click', () => {
          const nameInput = wrapper.querySelector('[data-field="name"]');
          const phoneInput = wrapper.querySelector('[data-field="phone"]');
          const emailInput = wrapper.querySelector('[data-field="email"]');
          if (nameInput && user.name) nameInput.value = user.name;
          if (phoneInput && user.phone) phoneInput.value = user.phone;
          if (emailInput && user.email) emailInput.value = user.email;
          Utils.toast('已帶入會員資料');
        });
      }
    }, 0);

    // 有地址欄位才需要載入縣市
    if (withAddress) {
      setTimeout(() => {
        this._initCountyOnly(`contact_county_${topic.id}`);
      }, 0);
    }

    return wrapper;
  },

  /** 日期題 */
  renderDate(topic) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<input type="date" class="form-input" data-topic-id="${topic.id}">`;
    return wrapper;
  },

  /**
   * 處理表單送出
   */
  async handleSubmit() {
    // 檢查條款
    const agreeCheck = Utils.$('#agree-terms');
    if (agreeCheck && !agreeCheck.checked) {
      Utils.toast('請先同意服務條款');
      return;
    }

    // 收集表單資料
    const formId = Utils.getUrlParam('form_id');
    const fields = Utils.$$('.form-field');
    const feedbackData = [];
    let hasError = false;

    fields.forEach(field => {
      const topicId = field.dataset.topicId;
      const type = field.dataset.type;
      const required = field.dataset.required === '1';
      let answer = null;

      switch (type) {
        case '1': // 簡答
        case '9': // 日期
          const input = field.querySelector('.form-input');
          answer = input ? input.value.trim() : '';
          break;
        case '2': // 詳答
          const textarea = field.querySelector('.form-textarea');
          answer = textarea ? textarea.value.trim() : '';
          break;
        case '3': // 單選
          const radio = field.querySelector('input[type="radio"]:checked');
          answer = radio ? radio.value : '';
          break;
        case '4': // 複選
          const checks = field.querySelectorAll('input[type="checkbox"]:checked');
          answer = Array.from(checks).map(c => c.value);
          break;
        case '5': // 地區
          const county = field.querySelector('[data-field="county"]');
          const district = field.querySelector('[data-field="district"]');
          const addr = field.querySelector('[data-field="address"]');
          answer = {
            county: county ? county.value : '',
            district: district ? district.value : '',
            address: addr ? addr.value : '',
          };
          break;
        case '6': // 上傳
          answer = this.uploadedFiles[topicId] || [];
          break;
        case '10': // 聯絡資料
        case '8':
          const name = field.querySelector('[data-field="name"]');
          const phone = field.querySelector('[data-field="phone"]');
          const email = field.querySelector('[data-field="email"]');
          answer = {
            name: name ? name.value.trim() : '',
            phone: phone ? phone.value.trim() : '',
            email: email ? email.value.trim() : '',
          };
          break;
        default:
          answer = '';
      }

      // 必填驗證
      if (required) {
        const isEmpty = !answer || 
          (Array.isArray(answer) && answer.length === 0) ||
          (typeof answer === 'object' && !Array.isArray(answer) && !Object.values(answer).some(v => v));
        if (isEmpty) {
          hasError = true;
          field.classList.add('field-error-highlight');
        } else {
          field.classList.remove('field-error-highlight');
        }
      }

      if (type !== '7') { // 備註說明不需收集
        feedbackData.push({ topicId: parseInt(topicId), type, answer });
      }
    });

    if (hasError) {
      Utils.toast('請填寫所有必填欄位');
      return;
    }

    // 送出
    const submitBtn = Utils.$('#form-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '提交中...';
    }

    const result = await API.submitForm({
      form_id: parseInt(formId),
      service_vendor_id: Utils.getUrlParam('vendor_id') || '',
      service_name: Utils.getUrlParam('service') || '',
      data: feedbackData,
      account_id: (Auth.getUser() || {}).inbr_account_id || '',
      account_name: (Auth.getUser() || {}).name || '',
      // 從 feedbackData 解析聯絡資料，對應 Lambda /feedback API 的欄位
      ...(() => {
        const extra = {};
        feedbackData.forEach(item => {
          // type 8（含地址）或 type 10（不含地址）→ 聯絡資料
          if ((item.type === '8' || item.type === '10') && item.answer) {
            extra.contact_name   = item.answer.name  || '';
            extra.contact_mobile = item.answer.phone || '';
            extra.contact_email  = item.answer.email || '';
          }
          // type 8 含地址
          if (item.type === '8' && item.answer) {
            extra.contact_address_county   = item.answer.county   || '';
            extra.contact_address_district = item.answer.district || '';
            extra.contact_address_detail   = item.answer.address  || '';
          }
          // type 5 獨立地區欄位
          if (item.type === '5' && item.answer) {
            extra.contact_address_county   = item.answer.county   || '';
            extra.contact_address_district = item.answer.district || '';
            extra.contact_address_detail   = item.answer.address  || '';
          }
          // type 2 詳答 → description
          if (item.type === '2' && item.answer) {
            extra.description = item.answer;
          }
        });
        return extra;
      })(),
    });

    if (result && result.success) {
      Utils.toast('表單提交成功！');
      setTimeout(() => Utils.navigate('orders.html'), 1500);
    } else {
      Utils.toast(result?.message || '提交失敗，請稍後再試');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '送出表單';
      }
    }
  },
};
