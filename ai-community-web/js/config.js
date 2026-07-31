/**
 * 全域設定
 */
const CONFIG = {
  // API base path（相對路徑，適用 XAMPP）
  API_BASE: 'php/api',

  // 服務快捷按鈕定義（對應 pms_vendor_service_type）
  QUICK_SERVICES: [
    { name: '訂位', formId: 1, color: '#4CAF50', icon: '🍽️', serviceType: '01' },
    { name: '購物', formId: 2, color: '#E91E63', icon: '🛒', serviceType: '02' },
    { name: '清潔', formId: 3, color: '#2196F3', icon: '🧹', serviceType: '03' },
    { name: '修繕', formId: 3, color: '#FFC107', icon: '🔧', serviceType: '04' },
    { name: '社區', formId: 3, color: '#9C27B0', icon: '🏘️', serviceType: '05' },
    { name: '藥局', formId: 3, color: '#FF5722', icon: '💊', serviceType: '06' },
  ],

  // 訂單狀態對照
  ORDER_STATUS: {
    '01': { label: '待付款', badge: 'badge-warning' },
    '02': { label: '待確認', badge: 'badge-warning' },
    '03': { label: '已確認', badge: 'badge-info' },
    '04': { label: '進行中', badge: 'badge-info' },
    '11': { label: '待訂金支付', badge: 'badge-warning' },
    '12': { label: '已支付訂金，待報價', badge: 'badge-warning' },
    '13': { label: '已報價，待同意', badge: 'badge-warning' },
    '14': { label: '客戶同意報價', badge: 'badge-info' },
    '15': { label: '已驗收，待尾款', badge: 'badge-info' },
    '80': { label: '已完成', badge: 'badge-success' },
    '90': { label: '已取消', badge: 'badge-danger' },
    '98': { label: '部分退款', badge: 'badge-muted' },
    '99': { label: '已退款', badge: 'badge-danger' },
  },

  // 訂單類型對照
  ORDER_TYPE: {
    '01': '服務訂單',
    '02': '訂位',
    '03': '預約',
    '04': '其他',
    '05': '商品訂單',
    '06': '訂餐',
  },

  // 聯絡時間對照
  CONTACT_TIME: {
    '1': '上午',
    '2': '下午',
    '3': '皆可',
  },

  // 表單題型對照
  TOPIC_TYPE: {
    '1': '簡答題',
    '2': '詳答題',
    '3': '單選題',
    '4': '複選題',
    '5': '地區選單',
    '6': '上傳照片',
    '7': '備註說明',
    '8': '聯絡資料',
    '9': '日期題',
    '10': '聯絡資料(不含地址)',
  },
};
