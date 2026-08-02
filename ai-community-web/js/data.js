/**
 * 靜態展示資料
 * 本專案部署在 AWS S3 靜態網站託管，
 * API 呼叫統一走 AWS Lambda + API Gateway，
 * 此檔案提供本地 Mock 資料備援，內容取自 sql/0731_202607_hackson.sql 的種子資料。
 */
const DATA = {
  COUNTIES: [
    { code: '01', name: '台北市' },
    { code: '02', name: '新北市' },
    { code: '03', name: '桃園市' },
    { code: '04', name: '台中市' },
    { code: '05', name: '台南市' },
    { code: '06', name: '高雄市' },
  ],

  DISTRICTS: [
    { code: '011', county_code: '01', name: '大安區', zip: '106' },
    { code: '012', county_code: '01', name: '信義區', zip: '110' },
    { code: '013', county_code: '01', name: '中山區', zip: '104' },
    { code: '021', county_code: '02', name: '板橋區', zip: '220' },
    { code: '022', county_code: '02', name: '新莊區', zip: '242' },
    { code: '023', county_code: '02', name: '三重區', zip: '241' },
    { code: '031', county_code: '03', name: '桃園區', zip: '330' },
    { code: '032', county_code: '03', name: '中壢區', zip: '320' },
    { code: '041', county_code: '04', name: '西屯區', zip: '407' },
    { code: '042', county_code: '04', name: '北屯區', zip: '406' },
    { code: '051', county_code: '05', name: '東區', zip: '701' },
    { code: '052', county_code: '05', name: '安平區', zip: '708' },
    { code: '061', county_code: '06', name: '苓雅區', zip: '802' },
    { code: '062', county_code: '06', name: '三民區', zip: '807' },
  ],

  SERVICE_TYPE_MAP: {
    '1': '一般居家清潔',
    '2': '家電清洗',
    '3': '包裹寄送',
    '6': '餐廳訂位',
    '9': '美食外送',
    '10': '水電修繕',
    '11': '商城購物',
  },

  VENDORS: [
    { vendor_id: 1, vendor_name: '潔淨居家清潔', vendor_no: 'V001', contact_name: '陳管理', contact_phone: '02-2700-1001', contact_email: 'clean@jiejing.example.com', rating_avg: '4.80', rating_count: 126, service_types: ['1'], service_areas: [{ county_code: '01', district_code: '' }, { county_code: '02', district_code: '' }] },
    { vendor_id: 2, vendor_name: '全能家電清洗', vendor_no: 'V002', contact_name: '林技師', contact_phone: '02-8500-1002', contact_email: 'service@allclean.example.com', rating_avg: '4.60', rating_count: 89, service_types: ['2'], service_areas: [{ county_code: '01', district_code: '' }, { county_code: '02', district_code: '' }, { county_code: '03', district_code: '' }] },
    { vendor_id: 3, vendor_name: '快速寄件服務', vendor_no: 'V003', contact_name: '張專員', contact_phone: '03-300-1003', contact_email: 'ship@fastship.example.com', rating_avg: '4.50', rating_count: 203, service_types: ['3'], service_areas: [{ county_code: '01', district_code: '' }, { county_code: '02', district_code: '' }, { county_code: '04', district_code: '' }, { county_code: '06', district_code: '' }] },
    { vendor_id: 4, vendor_name: '饗食天堂', vendor_no: 'V004', contact_name: '陳主廚', contact_phone: '02-2700-1004', contact_email: 'chef@xiangshi.example.com', rating_avg: '4.70', rating_count: 312, service_types: ['6'], service_areas: [{ county_code: '01', district_code: '' }, { county_code: '02', district_code: '' }] },
    { vendor_id: 5, vendor_name: '水電王修繕', vendor_no: 'V005', contact_name: '李師傅', contact_phone: '03-400-1005', contact_email: 'fix@waterking.example.com', rating_avg: '4.90', rating_count: 178, service_types: ['10'], service_areas: [{ county_code: '01', district_code: '' }, { county_code: '02', district_code: '' }] },
    { vendor_id: 6, vendor_name: '統一購物商城', vendor_no: 'V006', contact_name: '吳經理', contact_phone: '02-2200-1006', contact_email: 'shop@unimall.example.com', rating_avg: '4.40', rating_count: 521, service_types: ['11'], service_areas: [{ county_code: '01', district_code: '' }, { county_code: '02', district_code: '' }, { county_code: '03', district_code: '' }, { county_code: '04', district_code: '' }, { county_code: '05', district_code: '' }, { county_code: '06', district_code: '' }] },
    { vendor_id: 7, vendor_name: '飛速外送', vendor_no: 'V007', contact_name: '劉隊長', contact_phone: '02-3300-1007', contact_email: 'delivery@fast.example.com', rating_avg: '4.30', rating_count: 167, service_types: ['9'], service_areas: [{ county_code: '01', district_code: '' }, { county_code: '02', district_code: '' }] },
    { vendor_id: 8, vendor_name: '鼎泰豐信義店', vendor_no: 'V010', contact_name: '楊店長', contact_phone: '02-2700-1010', contact_email: 'dtf@example.com', rating_avg: '4.90', rating_count: 856, service_types: ['6'], service_areas: [{ county_code: '01', district_code: '' }] },
  ],

  // Demo 登入帳號 — 個資欄位已 AES-256-GCM 加密
  USERS: [
    { inbr_account_id: 'MBR001', name: 'x6vzxRTUj5bCtsUO:4LMpEss6z3D6lXnTBiKo8TVHuMKjtH4PNA==', name_hash: 'acf979cc584e1cf9c18c65bffae9e53cbc18634f90042072cc116bd5b7375bed', phone: 'Z6YAXDztpcjXlmmt:HR/bI7E1LE5l1aC0nOuHa7Ht4AU5HKvU/rDnNQ==', phone_hash: 'b1735deb5dd7819da19693e4e109aa74eb9b7579cc526907b49aa040140a6d43', email: 'qOcT5xnNGaSwAukS:N+GYB6YlX+UZ/RwCOp4XMHn/vEi+/l9H9oUDS+EO5RU6OQ==', email_hash: 'b6f8dfe4fe7aa1880197b0e472affe6a9867a35e8fa84d50b80d7d1cf233f866', points: 50 },
    { inbr_account_id: 'MBR002', name: 'bUAaitzBVv2IcwXI:S4mXQCXLqvY87kyamrR9VUBENa4LZKLC/Q==', name_hash: '34f803962332a8a83f4d9e6db09b8a1ad95bbbbd1e8112c447edfab84b540718', phone: '5P7GzJgjQW/N+phh:rW0D/bYJOfFLQBLIVOdGqFXDKKsGNxgqhtX+aQ==', phone_hash: 'e00818f36bfd92fb092b642254c7ead3bb64c2b57d02c4a86ead1ed1a5d911db', email: '8lgRP9Z8eit4sFNU:/EPLn7P7CFmP6PRa0KSsPgpryYGpfU64L8d0i3gWFa9sNQ==', email_hash: '119f7a6e6e5b320689b77e89820fd1ea2eb60fcc10a5fb5ccf54ed03f2d70cc3', points: 7 },
    { inbr_account_id: 'MBR003', name: 'OxBXeDgFn59d7Zxt:0nMjX5aWpzpSzU8vyhJljsIlIGrIksvRTg==', name_hash: '14745bb450ce9b0e74a29a923618519a48820f00afba2631681898c2dc160486', phone: 'uVHCChpc6i66OtLn:S2CCwQBTdRuKwwSnoZH732TLbzF/MmbMMMq/lQ==', phone_hash: '325a672f35c05d653727f3bdf5d32291e93e279fabde04aae46f762ceb2e58f0', email: 'wgT5g5DR2PH3E/P1:WOzlBu877WfvR8f2DnXHZIMSamN+mzb74Kbb22uigRna', email_hash: '081f71d8760dd187088c2dba3bf2bafadf7aae51ad6be66bca649ca3d3581c1a', points: 59 },
  ],

  // 訂單（示範用，所有 demo 帳號共用同一份清單）
  ORDERS: [
    { record_id: 1, order_no: 'ORD20260701001', service_vendor_id: 1, vendor_name: '美味山海餐廳', service_name: '餐廳訂位', order_type: '02', order_status: '80', order_time: '2026-07-01 18:00:00', confirm_time: '2026-07-01 18:05:00', service_time: '2026-07-05 19:00:00', complete_time: '2026-07-05 22:00:00', original_amount: 0, discount_amount: 0, final_amount: 0, earn_points: 50, remark: '窗邊座位' },
    { record_id: 2, order_no: 'ORD20260702002', service_vendor_id: 1, vendor_name: '美味山海餐廳', service_name: '餐廳訂位', order_type: '02', order_status: '02', order_time: '2026-07-02 10:00:00', original_amount: 0, discount_amount: 0, final_amount: 0, earn_points: 0, remark: null },
    { record_id: 3, order_no: 'ORD20260702003', service_vendor_id: 2, vendor_name: '幸福小舖購物', service_name: '商品購買', order_type: '05', order_status: '80', order_time: '2026-07-02 15:00:00', confirm_time: '2026-07-02 15:10:00', complete_time: '2026-07-04 10:00:00', original_amount: 1200, discount_amount: 100, final_amount: 1160, earn_points: 23, remark: null, order_items: [{ name: '睡袋', quantity: 1, price: 900 }, { name: '爐具', quantity: 1, price: 300 }] },
    { record_id: 4, order_no: 'ORD20260703004', service_vendor_id: 2, vendor_name: '幸福小舖購物', service_name: '商品購買', order_type: '05', order_status: '01', order_time: '2026-07-03 09:30:00', original_amount: 1500, discount_amount: 0, final_amount: 1580, earn_points: 0, remark: null, order_items: [{ name: '生鮮蔬果箱', quantity: 1, price: 1500 }] },
    { record_id: 5, order_no: 'ORD20260704005', service_vendor_id: 3, vendor_name: '安心家事服務', service_name: '家事服務', order_type: '01', order_status: '80', order_time: '2026-07-04 08:00:00', deposit_time: '2026-07-04 08:30:00', confirm_time: '2026-07-04 09:00:00', service_time: '2026-07-06 09:00:00', complete_time: '2026-07-06 11:00:00', original_amount: 1800, discount_amount: 0, final_amount: 1800, earn_points: 36, remark: '固定每週打掃' },
    { record_id: 6, order_no: 'ORD20260705006', service_vendor_id: 4, vendor_name: '快修水電行', service_name: '水電修繕', order_type: '01', order_status: '12', order_time: '2026-07-05 16:00:00', deposit_time: '2026-07-05 16:30:00', original_amount: 0, discount_amount: 0, final_amount: 0, earn_points: 0, remark: '水龍頭漏水報價中' },
    { record_id: 7, order_no: 'ORD20260706007', service_vendor_id: 6, vendor_name: '康健藥局', service_name: '藥局代領', order_type: '04', order_status: '80', order_time: '2026-07-06 11:00:00', confirm_time: '2026-07-06 11:05:00', complete_time: '2026-07-06 11:30:00', original_amount: 350, discount_amount: 0, final_amount: 350, earn_points: 7, remark: null, order_items: [{ name: '血壓藥', quantity: 1, price: 350 }] },
    { record_id: 8, order_no: 'ORD20260707008', service_vendor_id: 7, vendor_name: '順風叫車服務', service_name: '叫車服務', order_type: '04', order_status: '80', order_time: '2026-07-07 20:00:00', confirm_time: '2026-07-07 20:01:00', service_time: '2026-07-07 20:05:00', complete_time: '2026-07-07 20:35:00', original_amount: 280, discount_amount: 0, final_amount: 280, earn_points: 5, remark: null },
  ],

  // 表單（以 service_type 為 key，對應 DynamoDB cms_service_vendor.service_type）
  FORMS: {
    6: {
      form: { id: 6, name: '餐廳訂位需求表單', intro_content: '<p>請留下您的訂位需求，我們將盡快為您安排。</p>', notice_content: null, terms_content: '<p>提交表單即表示您同意我們的服務條款。</p>' },
      topics: [
        { id: 1, type: '8', title: '聯絡資訊', remark: null, is_required: '1', options: [] },
        { id: 2, type: '5', title: '用餐地區', remark: null, is_required: '1', options: [] },
        { id: 3, type: '9', title: '希望訂位日期時間', remark: null, is_required: '1', options: [] },
        { id: 4, type: '1', title: '用餐人數', remark: null, is_required: '1', is_number_only: '1', options: [] },
        { id: 5, type: '3', title: '餐廳類型偏好', remark: null, is_required: '0', options: [{ id: 1, option_name: '中式' }, { id: 2, option_name: '日式' }, { id: 3, option_name: '西式' }, { id: 4, option_name: '韓式' }, { id: 5, option_name: '泰式' }, { id: 6, option_name: '海鮮' }] },
      ],
    },
    11: {
      form: { id: 11, name: '商城購物需求表單', intro_content: '<p>告訴我們您想採買的商品，我們協助媒合合適賣家。</p>', notice_content: null, terms_content: '<p>提交表單即表示您同意我們的服務條款。</p>' },
      topics: [
        { id: 6, type: '8', title: '聯絡資訊', remark: null, is_required: '1', options: [] },
        { id: 7, type: '2', title: '想購買的商品描述', remark: null, is_required: '1', options: [] },
        { id: 8, type: '4', title: '商品類別', remark: null, is_required: '0', options: [{ id: 4, option_name: '生鮮食品' }, { id: 5, option_name: '日用品' }, { id: 6, option_name: '3C家電' }, { id: 7, option_name: '服飾' }] },
        { id: 9, type: '1', title: '預算上限(元)', remark: null, is_required: '0', is_number_only: '1', options: [] },
        { id: 42, type: '6', title: '上傳商品參考照片', remark: '可附上想購買商品的截圖或實拍照，方便賣家了解需求', is_required: '0', options: [] },
      ],
    },
    1: {
      form: { id: 1, name: '居家清潔需求表單', intro_content: '<p>一般居家清潔服務，留下需求由專人為您安排。</p>', notice_content: null, terms_content: '<p>提交表單即表示您同意我們的服務條款。</p>' },
      topics: [
        { id: 10, type: '10', title: '聯絡資訊', remark: null, is_required: '1', options: [] },
        { id: 11, type: '5', title: '服務地區', remark: null, is_required: '1', options: [] },
        { id: 12, type: '3', title: '清潔類型', remark: null, is_required: '1', options: [{ id: 8, option_name: '一般清潔' }, { id: 9, option_name: '深度清潔' }, { id: 10, option_name: '搬遷清潔' }, { id: 11, option_name: '其他' }] },
        { id: 13, type: '1', title: '坪數', remark: '請填寫大約坪數', is_required: '0', is_number_only: '1', options: [] },
        { id: 14, type: '9', title: '希望服務時間', remark: null, is_required: '1', options: [] },
        { id: 15, type: '6', title: '上傳目前環境照片', remark: '拍攝需清潔區域的現況，方便師傅評估', is_required: '0', options: [] },
        { id: 16, type: '2', title: '其他需求說明', remark: '如有特殊注意事項請於此說明', is_required: '0', options: [] },
      ],
    },
    2: {
      form: { id: 2, name: '家電清洗需求表單', intro_content: '<p>冷氣、洗衣機、冰箱等家電深層清洗服務。</p>', notice_content: null, terms_content: '<p>提交表單即表示您同意我們的服務條款。</p>' },
      topics: [
        { id: 16, type: '10', title: '聯絡資訊', remark: null, is_required: '1', options: [] },
        { id: 17, type: '5', title: '服務地區', remark: null, is_required: '1', options: [] },
        { id: 18, type: '4', title: '清洗項目', remark: null, is_required: '1', options: [{ id: 12, option_name: '冷氣清洗' }, { id: 13, option_name: '洗衣機清洗' }, { id: 14, option_name: '冰箱清洗' }, { id: 15, option_name: '抽油煙機清洗' }, { id: 16, option_name: '其他' }] },
        { id: 19, type: '1', title: '數量（台）', remark: null, is_required: '1', is_number_only: '1', options: [] },
        { id: 20, type: '3', title: '希望時段', remark: null, is_required: '1', options: [{ id: 17, option_name: '越快越好（緊急）' }, { id: 18, option_name: '本週內' }, { id: 19, option_name: '彈性配合' }] },
        { id: 21, type: '6', title: '上傳家電照片', remark: '拍攝需清洗的家電外觀，方便評估報價', is_required: '0', options: [] },
        { id: 22, type: '2', title: '其他需求說明', remark: null, is_required: '0', options: [] },
      ],
    },
    3: {
      form: { id: 3, name: '包裹寄送需求表單', intro_content: '<p>到府收件，全台配送，讓寄件更方便。</p>', notice_content: '<ol><li>易碎物品請事先告知</li><li>超過20公斤需另行報價</li></ol>', terms_content: '<p>提交表單即表示您同意我們的服務條款。</p>' },
      topics: [
        { id: 22, type: '10', title: '聯絡資訊', remark: null, is_required: '1', options: [] },
        { id: 23, type: '3', title: '包裹大小', remark: null, is_required: '1', options: [{ id: 20, option_name: '小型（60cm以下）' }, { id: 21, option_name: '中型（60-120cm）' }, { id: 22, option_name: '大型（120cm以上）' }] },
        { id: 24, type: '1', title: '重量（公斤）', remark: null, is_required: '0', is_number_only: '1', options: [] },
        { id: 25, type: '3', title: '收件方式', remark: null, is_required: '1', options: [{ id: 23, option_name: '到府收件' }, { id: 24, option_name: '自行送至門市' }] },
        { id: 26, type: '8', title: '收件地址', remark: '寄件目的地', is_required: '1', options: [] },
        { id: 27, type: '2', title: '寄件備註', remark: '如有易碎物品請註明', is_required: '0', options: [] },
      ],
    },
    9: {
      form: { id: 9, name: '美食外送需求表單', intro_content: '<p>想吃什麼告訴我們，外送到府享美食。</p>', notice_content: null, terms_content: '<p>提交表單即表示您同意我們的服務條款。</p>' },
      topics: [
        { id: 28, type: '10', title: '聯絡資訊', remark: null, is_required: '1', options: [] },
        { id: 29, type: '5', title: '外送地區', remark: null, is_required: '1', options: [] },
        { id: 30, type: '2', title: '想吃的餐點或餐廳', remark: '請描述您想點的餐點內容', is_required: '1', options: [] },
        { id: 31, type: '1', title: '用餐人數', remark: null, is_required: '1', is_number_only: '1', options: [] },
        { id: 32, type: '9', title: '希望送達時間', remark: null, is_required: '1', options: [] },
        { id: 33, type: '1', title: '預算上限(元)', remark: null, is_required: '0', is_number_only: '1', options: [] },
        { id: 34, type: '2', title: '其他備註', remark: '過敏原、忌口等', is_required: '0', options: [] },
      ],
    },
    10: {
      form: { id: 10, name: '水電修繕需求表單', intro_content: '<p>水管、電路、設備維修等問題，留下需求由師傅為您處理。</p>', notice_content: null, terms_content: '<p>提交表單即表示您同意我們的服務條款。</p>' },
      topics: [
        { id: 35, type: '10', title: '聯絡資訊', remark: null, is_required: '1', options: [] },
        { id: 36, type: '5', title: '服務地址', remark: null, is_required: '1', options: [] },
        { id: 37, type: '3', title: '修繕類型', remark: null, is_required: '1', options: [{ id: 25, option_name: '水管漏水' }, { id: 26, option_name: '馬桶堵塞' }, { id: 27, option_name: '電路問題' }, { id: 28, option_name: '熱水器維修' }, { id: 29, option_name: '冷氣安裝' }, { id: 30, option_name: '其他' }] },
        { id: 38, type: '3', title: '急迫程度', remark: null, is_required: '1', options: [{ id: 31, option_name: '緊急（當天）' }, { id: 32, option_name: '本週內' }, { id: 33, option_name: '可彈性安排' }] },
        { id: 39, type: '7', title: '問題描述', remark: '請詳述問題狀況，方便師傅評估', is_required: '1', options: [] },
        { id: 41, type: '6', title: '上傳現場照片', remark: '拍攝損壞部位（如漏水、電線外露等），加速師傅判斷', is_required: '0', options: [] },
        { id: 40, type: '9', title: '希望到府時間', remark: null, is_required: '0', options: [] },
      ],
    },
  },

  // 諮詢單回饋（pms_form_feedback）— 個資欄位已 AES-256-GCM 加密
  FEEDBACKS: [
    { feedback_no: 'FB2607050001', service_id: 101, form_id: 1, form_type: '1', is_read: '1', status: '04', contact_name: 'nk2PB61ynXbMAcuJ:Uye8WtQ2S54z5QNXpCelAw9/DZHTdfBMSg==', contact_name_hash: 'acf979cc584e1cf9c18c65bffae9e53cbc18634f90042072cc116bd5b7375bed', contact_mobile: 'nmD2qHBFeOGwaKhr:CEMR2sup0RmiFsrxUQbYa5giWT4O/sZp3NE=', contact_mobile_hash: 'a7e5f59932cfb16320caf11b09b6eab897adb60f2cf37a62a7bf2a437d718ed9', preferred_contact_time: '3', contact_address_county: '01', contact_address_district: '011', contact_address_detail: 'IwHi5/nC2tRDQ4Kb:wSzTnYNksCoaEoV1snaLhFf8X64+HGi9O3HMpu54+GiPjFy7DA==', contact_address_detail_hash: 'a26abe6db5c3b87546a2c531588478ecfce1bc7d46d40a0fc08c197eae482b74', description: '希望靠窗座位', inbr_account_id: 'c0000000-0000-0000-0000-000000000001', cre_time: '2026-07-05 18:20:00', feedback_content: { topic_2: '01', topic_3: '2026-07-10 19:00', topic_4: '4', topic_5: '中式' } },
    { feedback_no: 'FB2607050002', service_id: 101, form_id: 1, form_type: '1', is_read: '1', status: '01', contact_name: '8yTWQq694hEeM+7v:7yxKtrbBTJEPspFLbwWgBMuV2SIEuZEC2g==', contact_name_hash: '4d0d53d1ce4f1d8079ba4d25a6edab0f3b250f7c1df15a3b2c1d6b054442814b', contact_mobile: 'jjYali84hBEFQZvC:7Fl1/3bnU0mLhqBq5tRKgVcYnYrRXcUOOfM=', contact_mobile_hash: '2885410c7354af6ca0db719a20200a5f25a8eeb3b98eded040a152643da2d15b', preferred_contact_time: '1', contact_address_county: '02', contact_address_district: '021', contact_address_detail: null, contact_address_detail_hash: null, description: null, inbr_account_id: 'c0000000-0000-0000-0000-000000000002', cre_time: '2026-07-06 09:10:00', feedback_content: { topic_2: '02', topic_3: '2026-07-11 12:30', topic_4: '2', topic_5: '日式' } },
    { feedback_no: 'FB2607060003', service_id: 102, form_id: 2, form_type: '1', is_read: '1', status: '03', contact_name: 'FJD851dOAcRue4Ah:f9cfsFbjNhsAQ1umyi0b/jxp3IVWQ36gbw==', contact_name_hash: 'd1c83f14b8bac73ae9f8aaa2a3ed15411fdedce7ac7928b2679f0eb8292aeeb1', contact_mobile: '/eYgFWw97tATddxx:RNPcWMZztYGPGIWArJfrmsuZC2Lz7G8rd54=', contact_mobile_hash: '7ea0206efd85a57714a5dc61865940752feadcac85ea31c7c8d6b9deb9b2ff6a', contact_email: '8V5GI0M/CMkS+lIe:YIZ/XIIWuDJ0SY8xpeQRybYcRbSrO4Lu7o/M2kJNsOM6n6c=', contact_email_hash: 'a3fbc19ef5c7788827c1f3b7fb9efa86ed4664f5c3ef66ef14e8c21581b1303a', preferred_contact_time: '2', contact_address_county: null, contact_address_district: null, contact_address_detail: null, contact_address_detail_hash: null, description: null, inbr_account_id: 'c0000000-0000-0000-0000-000000000003', cre_time: '2026-07-06 14:05:00', feedback_content: { topic_7: '想買露營用的睡袋和爐具', topic_8: ['日用品', '3C家電'], topic_9: '3000' } },
    { feedback_no: 'FB2607060004', service_id: 102, form_id: 2, form_type: '1', is_read: '0', status: '01', contact_name: 'wXUECOr6Z1+i/K3x:ECZHGsxNOEKh3VOpPRELejKv6FZQlTLFGA==', contact_name_hash: '58ac6be07bc86993eeaa79a5a1c562c5ad012f4063d72bd67dcddcf9d4bb196c', contact_mobile: 'Fx8Wgpp4bt6bbxxA:UWajSKmfezcMxbXuReaF7bmM43ogHvUZ8G8=', contact_mobile_hash: '7e0d4e12b9722d912aadc1c3299ba62e024157fc996e9f46e3c28b7845d4b424', preferred_contact_time: '3', contact_address_county: null, contact_address_district: null, contact_address_detail: null, contact_address_detail_hash: null, description: null, inbr_account_id: 'c0000000-0000-0000-0000-000000000004', cre_time: '2026-07-07 10:30:00', feedback_content: { topic_7: '想買生鮮蔬果箱', topic_8: ['生鮮食品'], topic_9: '1500' } },
    { feedback_no: 'FB2607070005', service_id: 103, form_id: 3, form_type: '2', is_read: '1', status: '04', contact_name: 'YODk2Bj6MJs1O+Fq:ZDlwz/wI+ujQxmCHr2u8pV3oo2jAfMmQ2w==', contact_name_hash: '77e88a63087ee2a4e9f51ef09bf88666979aaff632a132da09c31c292d8b78e3', contact_mobile: 'rmz7/ilvefedv5gD:5815ZcgpNCOU6wFuCRnAVv09yK5BFQgSY34=', contact_mobile_hash: '5d4f8e23ddfb90e597905396cc290956beebcb38260bf1d7ec64ea9d64820f18', preferred_contact_time: '1', contact_address_county: '04', contact_address_district: '041', contact_address_detail: 'rsSJcTO7PRucZC9m:iMwzmL+OrCsSZrIXxdkiotBXycb4Dn4qXY4yqAU27zMATBqm', contact_address_detail_hash: '74d98fde419a1bd4c00c662d288d194e5f914c8a14990e4a8fa9799d2d7a37df', description: '家中有長者需特別留意打掃安全', inbr_account_id: 'c0000000-0000-0000-0000-000000000005', cre_time: '2026-07-07 08:45:00', feedback_content: { topic_11: '04', topic_12: '家事清潔', topic_13: '每週固定打掃一次，約2小時', topic_14: '2026-07-15' } },
    { feedback_no: 'FB2607070006', service_id: 103, form_id: 3, form_type: '2', is_read: '1', status: '03', contact_name: 'DgipPbxezoR2HulD:ajWdAbhO2NnZNWo5qqWtHcq0SN++rheT9w==', contact_name_hash: 'dc3ff0ad09b9969029e386437ffdf86aafb4c5a3ec116152b5b56270f25daadc', contact_mobile: '3RawffbCkK7EcbiI:HXKUKuGXJEm4/8RQ/Q7ek1887H0SIkbv6kk=', contact_mobile_hash: 'af8ca5b905c8cc2ac9d03e9a00c822ede0dd97a9554fe11b86c2f7f6e5cd9909', contact_email: 'qIbjeXhj4kdTlty6:QenHwpAm4+8Me5B1xd4dqIGEuO6hbPzV0XDlc6DP4ZVq', contact_email_hash: '87adc4f058f89f50081aaaec9c015cbcd245623cbd3ebca3f17758dcc73b81b4', preferred_contact_time: '2', contact_address_county: '04', contact_address_district: '042', contact_address_detail: null, contact_address_detail_hash: null, description: null, inbr_account_id: 'c0000000-0000-0000-0000-000000000006', cre_time: '2026-07-07 16:20:00', feedback_content: { topic_11: '04', topic_12: '水電修繕', topic_13: '浴室水龍頭漏水', topic_14: '2026-07-12' } },
    { feedback_no: 'FB2607080007', service_id: 101, form_id: 1, form_type: '1', is_read: '1', status: '05', contact_name: 'viSunXxYagVmI9eq:JTLlcHMmaDPa6+IXxSS7IQF16KEXDrvnGQ==', contact_name_hash: '6178b73afbfce21cf58f34cf8633b66cc843e1dfed27f9920c8fe6366c0b5dd1', contact_mobile: '+MFyurnvWHvekhXj:aqsMEJE/5oznYld4V2T4+i3JueBaIERItxU=', contact_mobile_hash: 'd06b9760fcac0f1d111d4f66b3558c1c6d8c49dfa413d9474c02c564ad47dc04', preferred_contact_time: '3', contact_address_county: '01', contact_address_district: '012', contact_address_detail: null, contact_address_detail_hash: null, description: '需要兒童椅', inbr_account_id: 'c0000000-0000-0000-0000-000000000007', cre_time: '2026-07-08 09:00:00', feedback_content: { topic_2: '01', topic_3: '2026-07-12 19:30', topic_4: '6', topic_5: '西式' } },
    { feedback_no: 'FB2607080008', service_id: 102, form_id: 2, form_type: '1', is_read: '0', status: '01', contact_name: 'Y+X7CVGb46LFfdnc:70eUSSAtT50QJDvTewm2CNiBCMbiI+hlpQ==', contact_name_hash: 'c7819ef0e4d2d3ce49bc559ebcc0de222890766a16ceaf79a0033dba55991a87', contact_mobile: 'gJ++lXK1YAhkejeW:TL6JBRVsJ3XIDDivv0VRRCUqkme/Jt6HSCs=', contact_mobile_hash: 'f24b00c12fe5a45e12acd9dadd08392797f68797c9ad17b0fb23daa50665594d', preferred_contact_time: '3', contact_address_county: null, contact_address_district: null, contact_address_detail: null, contact_address_detail_hash: null, description: null, inbr_account_id: 'c0000000-0000-0000-0000-000000000008', cre_time: '2026-07-08 11:15:00', feedback_content: { topic_7: '想買換季衣物', topic_8: ['服飾'], topic_9: '2000' } },
  ],

  // 派案記錄（pms_case_assignment）
  ASSIGNMENTS: [
    { assignment_id: 1, feedback_no: 'FB2607050001', vendor_id: 1, vendor_name: '美味山海餐廳', assign_time: '2026-07-05 18:30:00', assign_type: '01', match_score: 92.50, accept_status: '05', accept_time: '2026-07-05 18:40:00', reject_reason: null, is_primary: '1', remark: null },
    { assignment_id: 2, feedback_no: 'FB2607060003', vendor_id: 2, vendor_name: '幸福小舖購物', assign_time: '2026-07-06 14:10:00', assign_type: '01', match_score: 88.00, accept_status: '04', accept_time: '2026-07-06 14:30:00', reject_reason: null, is_primary: '1', remark: null },
    { assignment_id: 3, feedback_no: 'FB2607070005', vendor_id: 3, vendor_name: '安心家事服務', assign_time: '2026-07-07 09:00:00', assign_type: '02', match_score: null, accept_status: '05', accept_time: '2026-07-07 09:15:00', reject_reason: null, is_primary: '1', remark: null },
    { assignment_id: 4, feedback_no: 'FB2607070006', vendor_id: 4, vendor_name: '快修水電行', assign_time: '2026-07-07 16:30:00', assign_type: '01', match_score: 95.00, accept_status: '04', accept_time: '2026-07-07 16:45:00', reject_reason: null, is_primary: '1', remark: null },
    { assignment_id: 5, feedback_no: 'FB2607080007', vendor_id: 1, vendor_name: '美味山海餐廳', assign_time: '2026-07-08 09:05:00', assign_type: '01', match_score: 90.00, accept_status: '06', accept_time: null, reject_reason: null, is_primary: '1', remark: '顧客因故取消訂位' },
  ],

  // 派案方式對照
  ASSIGN_TYPE_MAP: {
    '01': '系統自動媒合',
    '02': '廠商自行認領',
    '03': '人工指派',
  },

  // 承接狀態對照
  ACCEPT_STATUS_MAP: {
    '01': '待回應',
    '02': '已受理',
    '03': '已婉拒',
    '04': '處理中',
    '05': '已完成',
    '06': '已取消',
  },

  // 案件回覆/聯繫記錄（pms_case_reply）
  REPLIES: [
    { reply_id: 1, assignment_id: 1, reply_type: '02', reply_content: '已透過訊息確認訂位，期待您光臨！', reply_time: '2026-07-05 18:40:00' },
    { reply_id: 2, assignment_id: 2, reply_type: '01', reply_content: '已致電客戶確認商品品項與數量', reply_time: '2026-07-06 14:30:00' },
    { reply_id: 3, assignment_id: 2, reply_type: '03', reply_content: '備貨中，預計7/8出貨', reply_time: '2026-07-07 09:00:00' },
    { reply_id: 4, assignment_id: 3, reply_type: '02', reply_content: '已完成到府打掃，客戶滿意', reply_time: '2026-07-07 11:30:00' },
    { reply_id: 5, assignment_id: 4, reply_type: '01', reply_content: '師傅已電聯，預約7/9上午到府維修', reply_time: '2026-07-07 16:45:00' },
    { reply_id: 6, assignment_id: 5, reply_type: '04', reply_content: '客戶來電表示臨時有事取消訂位', reply_time: '2026-07-08 09:10:00' },
  ],

  // 回覆類型對照
  REPLY_TYPE_MAP: {
    '01': '電話聯繫',
    '02': '訊息回覆',
    '03': '內部備註',
    '04': '狀態變更說明',
  },

  // 案件評價（pms_case_review）
  REVIEWS: [
    { review_id: 1, feedback_no: 'FB2607050001', assignment_id: 1, vendor_id: 1, vendor_name: '美味山海餐廳', rating_score: 5, rating_content: '訂位順利，服務態度很好！', is_anonymous: '0', review_time: '2026-07-05 20:00:00', reviewer_name: '王小明' },
    { review_id: 2, feedback_no: 'FB2607070005', assignment_id: 3, vendor_id: 3, vendor_name: '安心家事服務', rating_score: 4, rating_content: '打掃得很仔細，會再預約', is_anonymous: '0', review_time: '2026-07-07 12:00:00', reviewer_name: '劉阿姨' },
  ],

  // 案件狀態歷程（pms_case_status_log）
  STATUS_LOGS: [
    { log_id: 1, feedback_no: 'FB2607050001', assignment_id: null, status_code: '01', status_name: '待媒合', change_time: '2026-07-05 18:25:00', change_reason: null },
    { log_id: 2, feedback_no: 'FB2607050001', assignment_id: 1, status_code: '02', status_name: '已派案', change_time: '2026-07-05 18:30:00', change_reason: null },
    { log_id: 3, feedback_no: 'FB2607050001', assignment_id: 1, status_code: '04', status_name: '已完成', change_time: '2026-07-05 18:40:00', change_reason: '顧客已到店用餐' },
    { log_id: 4, feedback_no: 'FB2607050002', assignment_id: null, status_code: '01', status_name: '待媒合', change_time: '2026-07-06 09:10:00', change_reason: null },
    { log_id: 5, feedback_no: 'FB2607060003', assignment_id: null, status_code: '01', status_name: '待媒合', change_time: '2026-07-06 14:05:00', change_reason: null },
    { log_id: 6, feedback_no: 'FB2607060003', assignment_id: 2, status_code: '02', status_name: '已派案', change_time: '2026-07-06 14:10:00', change_reason: null },
    { log_id: 7, feedback_no: 'FB2607060003', assignment_id: 2, status_code: '03', status_name: '處理中', change_time: '2026-07-06 14:30:00', change_reason: '備貨中' },
    { log_id: 8, feedback_no: 'FB2607060004', assignment_id: null, status_code: '01', status_name: '待媒合', change_time: '2026-07-07 10:30:00', change_reason: null },
    { log_id: 9, feedback_no: 'FB2607070005', assignment_id: null, status_code: '01', status_name: '待媒合', change_time: '2026-07-07 08:45:00', change_reason: null },
    { log_id: 10, feedback_no: 'FB2607070005', assignment_id: 3, status_code: '02', status_name: '已派案', change_time: '2026-07-07 09:00:00', change_reason: null },
    { log_id: 11, feedback_no: 'FB2607070005', assignment_id: 3, status_code: '04', status_name: '已完成', change_time: '2026-07-07 11:30:00', change_reason: '已完成打掃' },
    { log_id: 12, feedback_no: 'FB2607070006', assignment_id: null, status_code: '01', status_name: '待媒合', change_time: '2026-07-07 16:20:00', change_reason: null },
    { log_id: 13, feedback_no: 'FB2607070006', assignment_id: 4, status_code: '02', status_name: '已派案', change_time: '2026-07-07 16:30:00', change_reason: null },
    { log_id: 14, feedback_no: 'FB2607070006', assignment_id: 4, status_code: '03', status_name: '處理中', change_time: '2026-07-07 16:45:00', change_reason: '已約定維修時間' },
    { log_id: 15, feedback_no: 'FB2607080007', assignment_id: null, status_code: '01', status_name: '待媒合', change_time: '2026-07-08 09:00:00', change_reason: null },
    { log_id: 16, feedback_no: 'FB2607080007', assignment_id: 5, status_code: '02', status_name: '已派案', change_time: '2026-07-08 09:05:00', change_reason: null },
    { log_id: 17, feedback_no: 'FB2607080007', assignment_id: 5, status_code: '05', status_name: '已取消', change_time: '2026-07-08 09:10:00', change_reason: '顧客取消' },
    { log_id: 18, feedback_no: 'FB2607080008', assignment_id: null, status_code: '01', status_name: '待媒合', change_time: '2026-07-08 11:15:00', change_reason: null },
  ],

  // 案件狀態對照
  CASE_STATUS_MAP: {
    '01': '待媒合',
    '02': '已派案',
    '03': '處理中',
    '04': '已完成',
    '05': '已取消',
  },

  // 諮詢單狀態對照（feedback status）
  FEEDBACK_STATUS_MAP: {
    '01': '待處理',
    '02': '已派案',
    '03': '處理中',
    '04': '已完成',
    '05': '已取消',
  },

  // form_id 不在 FORMS 內時使用的通用範本
  DEFAULT_FORM: {
    form: { name: '服務需求表單', intro_content: '<p>請填寫以下資訊，我們將盡快為您安排服務。</p>', notice_content: '<ol><li>服務時間以預約確認為準</li><li>如需取消請提前24小時通知</li></ol>', terms_content: '<p>提交表單即表示您同意我們的服務條款。</p>' },
    topics: [
      { id: 901, type: '10', title: '聯絡資料', remark: '請填寫您的聯絡方式', is_required: '1', options: [] },
      { id: 902, type: '3', title: '方便聯絡時間', remark: null, is_required: '1', options: [{ id: 1, option_name: '上午' }, { id: 2, option_name: '下午' }, { id: 3, option_name: '皆可' }] },
      { id: 903, type: '5', title: '服務地址', remark: null, is_required: '1', options: [] },
      { id: 904, type: '2', title: '其他需求說明', remark: '請描述您的需求細節', is_required: '0', options: [] },
    ],
  },
};
