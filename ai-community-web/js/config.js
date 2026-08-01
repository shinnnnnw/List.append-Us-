/**
 * 全域設定
 */
const CONFIG = {
  // API base path（XAMPP 本地 PHP）
  API_BASE: 'php/api',
 
  // 服務快捷按鈕定義
  QUICK_SERVICES: [
    { name: '訂位', formId: 1, color: '#4CAF50', icon: '🍽️', serviceType: '6' },
    { name: '購物', formId: 2, color: '#E91E63', icon: '🛒', serviceType: '11' },
    { name: '清潔', formId: 3, color: '#2196F3', icon: '🧹', serviceType: '1' },
    { name: '修繕', formId: 3, color: '#FFC107', icon: '🔧', serviceType: '10' },
    { name: '家電', formId: 3, color: '#9C27B0', icon: '📺', serviceType: '2' },
    { name: '寄件', formId: 4, color: '#FF5722', icon: '📦', serviceType: '3' },
  ],
 
  // 訂單狀態對照
  ORDER_STATUS: {
    '01': { label: '待媒合', badge: 'badge-warning' },
    '02': { label: '媒合中', badge: 'badge-info' },
    '03': { label: '已確認', badge: 'badge-info' },
    '04': { label: '進行中', badge: 'badge-info' },
    '80': { label: '已完成', badge: 'badge-success' },
    '90': { label: '已取消', badge: 'badge-danger' },
    '99': { label: '已退款', badge: 'badge-danger' },
  },
 
  ORDER_TYPE: {
    '01': '服務訂單',
    '02': '訂位',
    '03': '預約',
    '04': '其他',
    '05': '商品訂單',
    '06': '訂餐',
  },
 
  CONTACT_TIME: {
    '1': '上午',
    '2': '下午',
    '3': '皆可',
  },
 
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
 