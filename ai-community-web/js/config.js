/**
 * 全域設定
 */
const CONFIG = {
  // API base URL（AWS Lambda + API Gateway）
  API_BASE: 'https://adjvx2bs1a.execute-api.us-west-2.amazonaws.com/prod',

// 服務快捷按鈕定義（對應八大服務分類）
  QUICK_SERVICES: [
    { name: '外送', formId: 1, color: '#2E7D32', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="M16 16V4H1"/><path d="M16 8h4l3 5v3h-3"/></svg>', serviceType: '01', chatMessage: '我想叫外送' },
    { name: '訂位', formId: 1, color: '#E65100', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3z"/><path d="M8 7v10M16 7v10M3 12h18"/></svg>', serviceType: '02', chatMessage: '我想訂餐廳' },
    { name: '清潔', formId: 3, color: '#00838F', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v6M6.93 4.93l4.24 4.24M2 12h6M4.93 17.07l4.24-4.24M12 22v-6M17.07 19.07l-4.24-4.24M22 12h-6M19.07 6.93l-4.24 4.24"/></svg>', serviceType: '03', chatMessage: '我需要清潔服務' },
    { name: '修繕', formId: 3, color: '#BF360C', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>', serviceType: '04', chatMessage: '我家需要修繕' },
    { name: '宅配', formId: 4, color: '#4E342E', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>', serviceType: '05', chatMessage: '我要寄包裹' },
    { name: '購物', formId: 2, color: '#1565C0', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>', serviceType: '06', chatMessage: '我想買東西' },
    { name: '叫車', formId: 3, color: '#006064', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h2m10 0h2M3 9l2-5h14l2 5M3 9v8h18V9M3 9h18"/><circle cx="7" cy="17" r="1"/><circle cx="17" cy="17" r="1"/></svg>', serviceType: '07', chatMessage: '我需要叫車' },
    { name: '領藥', formId: 3, color: '#AD1457', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>', serviceType: '08', chatMessage: '我需要代領藥品' },
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
