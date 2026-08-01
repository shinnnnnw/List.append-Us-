/**
 * 全域設定
 */

// 環境判斷：本地 localhost/127.0.0.1 用 PHP，雲端用 Lambda
const _isLocal = (
  location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1'
);

const CONFIG = {
  // API base URL：本地用 PHP，雲端用 AWS Lambda
  API_BASE: _isLocal
    ? 'php/api'
    : 'https://adjvx2bs1a.execute-api.us-west-2.amazonaws.com/prod',

  // 是否為本地環境
  IS_LOCAL: _isLocal,
 
  // 服務快捷按鈕定義（對應八大服務分類）
  QUICK_SERVICES: [
    { name: '外送', formId: 1, color: '#4CAF50', icon: '🛵', serviceType: '01', chatMessage: '我想叫外送' },
    { name: '訂位', formId: 1, color: '#FF9800', icon: '🍽️', serviceType: '02', chatMessage: '我想訂餐廳' },
    { name: '清潔', formId: 3, color: '#2196F3', icon: '🧹', serviceType: '03', chatMessage: '我需要清潔服務' },
    { name: '修繕', formId: 3, color: '#FFC107', icon: '🔧', serviceType: '04', chatMessage: '我家需要修繕' },
    { name: '宅配', formId: 4, color: '#795548', icon: '📦', serviceType: '05', chatMessage: '我要寄包裹' },
    { name: '購物', formId: 2, color: '#E91E63', icon: '🛒', serviceType: '06', chatMessage: '我想買東西' },
    { name: '叫車', formId: 3, color: '#00BCD4', icon: '🚕', serviceType: '07', chatMessage: '我需要叫車' },
    { name: '領藥', formId: 3, color: '#FF5722', icon: '💊', serviceType: '08', chatMessage: '我需要代領藥品' },
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
 