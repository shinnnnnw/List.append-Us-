/**
 * seed-data.js
 * DynamoDB 範例資料定義模組
 *
 * 定義智慧社區服務平台 10 張 DynamoDB 資料表的範例資料，
 * 使用 DynamoDB marshalled 格式（{S:""}, {N:""}, {L:[]}, {M:{}} 型別標註）。
 * 所有 PK/FK 欄位為 String 型別，ID 使用 UUID 格式。
 * 確保跨表外鍵參照一致。
 */

// ============================================================
// 共用 ID 定義（確保跨表參照一致性）
// ============================================================

// 5 個會員 UUID（用於 inbr_member, pms_form_feedback, mms_order_record, pms_case_review）
const MEMBER_IDS = [
  'a1b2c3d4-1111-4000-a000-000000000001',
  'a1b2c3d4-2222-4000-a000-000000000002',
  'a1b2c3d4-3333-4000-a000-000000000003',
  'a1b2c3d4-4444-4000-a000-000000000004',
  'a1b2c3d4-5555-4000-a000-000000000005'
];

// 5 個廠商 ID（用於 cms_service_vendor, pms_vendor_account, pms_case_assignment, pms_case_review）
const VENDOR_IDS = [
  'v1000001-aaaa-4000-b000-000000000001',
  'v1000002-bbbb-4000-b000-000000000002',
  'v1000003-cccc-4000-b000-000000000003',
  'v1000004-dddd-4000-b000-000000000004',
  'v1000005-eeee-4000-b000-000000000005'
];

// 5 個諮詢單編號（用於 pms_form_feedback, pms_case_assignment, pms_case_reply, pms_case_status_log）
const FEEDBACK_NOS = [
  'FB20260715001',
  'FB20260715002',
  'FB20260716001',
  'FB20260716002',
  'FB20260717001'
];

// ============================================================
// 1. inbr_member - 會員資料表（5 筆）
// ============================================================
const inbr_member = [
  {
    inbr_account_id: { S: MEMBER_IDS[0] },
    member_name: { S: '王小明' },
    phone: { S: '0912-345-678' },
    email: { S: 'wang.xiaoming@example.com' },
    address: { S: '台北市大安區忠孝東路四段100號' },
    county_code: { S: '01' },
    platform_code: { S: '01' },
    is_enable: { S: '1' },
    point_balance: { N: '1500' },
    cre_time: { S: '2026-01-10T09:00:00+08:00' },
    upd_time: { S: '2026-07-01T14:30:00+08:00' }
  },
  {
    inbr_account_id: { S: MEMBER_IDS[1] },
    member_name: { S: '陳美玲' },
    phone: { S: '0923-456-789' },
    email: { S: 'chen.meiling@example.com' },
    address: { S: '新北市板橋區文化路一段50號' },
    county_code: { S: '02' },
    platform_code: { S: '01' },
    is_enable: { S: '1' },
    point_balance: { N: '800' },
    cre_time: { S: '2026-02-15T10:00:00+08:00' },
    upd_time: { S: '2026-06-20T11:00:00+08:00' }
  },
  {
    inbr_account_id: { S: MEMBER_IDS[2] },
    member_name: { S: '林大偉' },
    phone: { S: '0934-567-890' },
    email: { S: 'lin.dawei@example.com' },
    address: { S: '台中市西屯區台灣大道三段200號' },
    county_code: { S: '08' },
    platform_code: { S: '01' },
    is_enable: { S: '1' },
    point_balance: { N: '2300' },
    cre_time: { S: '2026-03-01T08:30:00+08:00' },
    upd_time: { S: '2026-07-10T16:45:00+08:00' }
  },
  {
    inbr_account_id: { S: MEMBER_IDS[3] },
    member_name: { S: '黃志豪' },
    phone: { S: '0945-678-901' },
    email: { S: 'huang.zhihao@example.com' },
    address: { S: '桃園市中壢區中央西路二段88號' },
    county_code: { S: '04' },
    platform_code: { S: '01' },
    is_enable: { S: '1' },
    point_balance: { N: '450' },
    cre_time: { S: '2026-04-05T13:00:00+08:00' },
    upd_time: { S: '2026-07-05T09:15:00+08:00' }
  },
  {
    inbr_account_id: { S: MEMBER_IDS[4] },
    member_name: { S: '李小芳' },
    phone: { S: '0956-789-012' },
    email: { S: 'li.xiaofang@example.com' },
    address: { S: '高雄市前鎮區中山二路300號' },
    county_code: { S: '15' },
    platform_code: { S: '01' },
    is_enable: { S: '1' },
    point_balance: { N: '3200' },
    cre_time: { S: '2026-05-20T15:30:00+08:00' },
    upd_time: { S: '2026-07-12T10:00:00+08:00' }
  }
];

// ============================================================
// 2. pms_vendor_account - 廠商帳號資料表（5 筆）
// ============================================================
const pms_vendor_account = [
  {
    account_id: { S: 'acc-0001-aaaa-4000-c000-000000000001' },
    vendor_id: { S: VENDOR_IDS[0] },
    account_no: { S: 'vendor_admin_01' },
    account_name: { S: '張經理' },
    role_code: { S: '01' },
    is_enable: { S: '1' },
    cre_time: { S: '2026-01-05T09:00:00+08:00' },
    upd_time: { S: '2026-06-01T10:00:00+08:00' }
  },
  {
    account_id: { S: 'acc-0002-bbbb-4000-c000-000000000002' },
    vendor_id: { S: VENDOR_IDS[1] },
    account_no: { S: 'vendor_admin_02' },
    account_name: { S: '劉組長' },
    role_code: { S: '01' },
    is_enable: { S: '1' },
    cre_time: { S: '2026-01-10T10:00:00+08:00' },
    upd_time: { S: '2026-06-15T14:00:00+08:00' }
  },
  {
    account_id: { S: 'acc-0003-cccc-4000-c000-000000000003' },
    vendor_id: { S: VENDOR_IDS[2] },
    account_no: { S: 'vendor_staff_03' },
    account_name: { S: '周師傅' },
    role_code: { S: '02' },
    is_enable: { S: '1' },
    cre_time: { S: '2026-02-01T08:30:00+08:00' },
    upd_time: { S: '2026-07-01T09:00:00+08:00' }
  },
  {
    account_id: { S: 'acc-0004-dddd-4000-c000-000000000004' },
    vendor_id: { S: VENDOR_IDS[3] },
    account_no: { S: 'vendor_admin_04' },
    account_name: { S: '吳主任' },
    role_code: { S: '01' },
    is_enable: { S: '1' },
    cre_time: { S: '2026-02-20T11:00:00+08:00' },
    upd_time: { S: '2026-06-20T16:30:00+08:00' }
  },
  {
    account_id: { S: 'acc-0005-eeee-4000-c000-000000000005' },
    vendor_id: { S: VENDOR_IDS[4] },
    account_no: { S: 'vendor_staff_05' },
    account_name: { S: '許技師' },
    role_code: { S: '02' },
    is_enable: { S: '1' },
    cre_time: { S: '2026-03-10T09:30:00+08:00' },
    upd_time: { S: '2026-07-05T13:00:00+08:00' }
  }
];

// ============================================================
// 3. cms_service_vendor - 服務廠商資料表（6 筆，涵蓋 service_type 1-6）
// ============================================================
const cms_service_vendor = [
  {
    vendor_id: { S: VENDOR_IDS[0] },
    vendor_name: { S: '潔淨家居清潔有限公司' },
    service_type: { S: '1' },
    contact_name: { S: '張經理' },
    contact_phone: { S: '02-2345-6789' },
    rating_avg: { N: '4.5' },
    rating_count: { N: '128' },
    service_counties: { L: [{ S: '台北市' }, { S: '新北市' }] },
    is_enable: { S: '1' },
    cre_time: { S: '2025-06-01T09:00:00+08:00' },
    upd_time: { S: '2026-07-01T10:00:00+08:00' }
  },
  {
    vendor_id: { S: VENDOR_IDS[1] },
    vendor_name: { S: '家電修繕專家企業社' },
    service_type: { S: '2' },
    contact_name: { S: '劉組長' },
    contact_phone: { S: '03-4567-8901' },
    rating_avg: { N: '4.2' },
    rating_count: { N: '85' },
    service_counties: { L: [{ S: '桃園市' }, { S: '新北市' }] },
    is_enable: { S: '1' },
    cre_time: { S: '2025-08-15T10:00:00+08:00' },
    upd_time: { S: '2026-06-20T14:00:00+08:00' }
  },
  {
    vendor_id: { S: VENDOR_IDS[2] },
    vendor_name: { S: '快遞通物流股份有限公司' },
    service_type: { S: '3' },
    contact_name: { S: '周師傅' },
    contact_phone: { S: '04-2345-6789' },
    rating_avg: { N: '4.8' },
    rating_count: { N: '256' },
    service_counties: { L: [{ S: '台中市' }, { S: '台北市' }, { S: '高雄市' }] },
    is_enable: { S: '1' },
    cre_time: { S: '2025-03-10T08:30:00+08:00' },
    upd_time: { S: '2026-07-10T09:00:00+08:00' }
  },
  {
    vendor_id: { S: VENDOR_IDS[3] },
    vendor_name: { S: '美味訂位平台有限公司' },
    service_type: { S: '4' },
    contact_name: { S: '吳主任' },
    contact_phone: { S: '02-8765-4321' },
    rating_avg: { N: '4.0' },
    rating_count: { N: '64' },
    service_counties: { L: [{ S: '台北市' }, { S: '新北市' }, { S: '桃園市' }] },
    is_enable: { S: '1' },
    cre_time: { S: '2025-09-20T11:00:00+08:00' },
    upd_time: { S: '2026-06-30T16:30:00+08:00' }
  },
  {
    vendor_id: { S: VENDOR_IDS[4] },
    vendor_name: { S: '水電達人工程行' },
    service_type: { S: '6' },
    contact_name: { S: '許技師' },
    contact_phone: { S: '07-3456-7890' },
    rating_avg: { N: '4.6' },
    rating_count: { N: '192' },
    service_counties: { L: [{ S: '高雄市' }, { S: '台中市' }] },
    is_enable: { S: '1' },
    cre_time: { S: '2025-05-01T09:30:00+08:00' },
    upd_time: { S: '2026-07-08T13:00:00+08:00' }
  },
  {
    vendor_id: { S: 'v1000006-ffff-4000-b000-000000000006' },
    vendor_name: { S: '速達外送服務有限公司' },
    service_type: { S: '5' },
    contact_name: { S: '蔡店長' },
    contact_phone: { S: '02-5678-1234' },
    rating_avg: { N: '3.9' },
    rating_count: { N: '310' },
    service_counties: { L: [{ S: '台北市' }, { S: '新北市' }] },
    is_enable: { S: '1' },
    cre_time: { S: '2025-11-01T10:00:00+08:00' },
    upd_time: { S: '2026-07-12T11:00:00+08:00' }
  }
];

// ============================================================
// 4. pms_form_feedback - 諮詢單資料表（5 筆，每筆對應不同 service type）
// ============================================================
const pms_form_feedback = [
  {
    feedback_no: { S: FEEDBACK_NOS[0] },
    service_id: { N: '1' },
    platform_code: { S: '01' },
    form_id: { N: '9' },
    inbr_account_id: { S: MEMBER_IDS[0] },
    status: { S: '01' },
    is_read: { S: '1' },
    feedback_content: { M: {
      service_type: { S: '清潔服務' },
      area_size: { S: '30坪' },
      preferred_date: { S: '2026-07-20' }
    }},
    contact_address_county: { S: '01' },
    contact_address_district: { S: '007' },
    cre_time: { S: '2026-07-15T10:30:00+08:00' },
    upd_time: { S: '2026-07-15T11:00:00+08:00' }
  },
  {
    feedback_no: { S: FEEDBACK_NOS[1] },
    service_id: { N: '2' },
    platform_code: { S: '01' },
    form_id: { N: '10' },
    inbr_account_id: { S: MEMBER_IDS[1] },
    status: { S: '02' },
    is_read: { S: '1' },
    feedback_content: { M: {
      appliance_type: { S: '冷氣' },
      brand: { S: '大金' },
      issue: { S: '不冷' }
    }},
    contact_address_county: { S: '02' },
    contact_address_district: { S: '013' },
    cre_time: { S: '2026-07-15T14:00:00+08:00' },
    upd_time: { S: '2026-07-16T09:00:00+08:00' }
  },
  {
    feedback_no: { S: FEEDBACK_NOS[2] },
    service_id: { N: '3' },
    platform_code: { S: '01' },
    form_id: { N: '11' },
    inbr_account_id: { S: MEMBER_IDS[2] },
    status: { S: '03' },
    is_read: { S: '0' },
    feedback_content: { M: {
      package_size: { S: '中型' },
      destination: { S: '台北市' },
      weight: { S: '5kg' }
    }},
    contact_address_county: { S: '08' },
    contact_address_district: { S: '100' },
    cre_time: { S: '2026-07-16T08:00:00+08:00' },
    upd_time: { S: '2026-07-16T10:30:00+08:00' }
  },
  {
    feedback_no: { S: FEEDBACK_NOS[3] },
    service_id: { N: '4' },
    platform_code: { S: '01' },
    form_id: { N: '12' },
    inbr_account_id: { S: MEMBER_IDS[3] },
    status: { S: '01' },
    is_read: { S: '0' },
    feedback_content: { M: {
      restaurant_type: { S: '日式料理' },
      people_count: { S: '4' },
      preferred_time: { S: '2026-07-20 18:30' }
    }},
    contact_address_county: { S: '04' },
    contact_address_district: { S: '049' },
    cre_time: { S: '2026-07-16T16:00:00+08:00' },
    upd_time: { S: '2026-07-16T16:00:00+08:00' }
  },
  {
    feedback_no: { S: FEEDBACK_NOS[4] },
    service_id: { N: '6' },
    platform_code: { S: '01' },
    form_id: { N: '13' },
    inbr_account_id: { S: MEMBER_IDS[4] },
    status: { S: '02' },
    is_read: { S: '1' },
    feedback_content: { M: {
      issue_type: { S: '水管不通' },
      location: { S: '浴室' },
      urgency: { S: '一般' }
    }},
    contact_address_county: { S: '15' },
    contact_address_district: { S: '249' },
    cre_time: { S: '2026-07-17T09:00:00+08:00' },
    upd_time: { S: '2026-07-17T11:00:00+08:00' }
  }
];

// ============================================================
// 5. pms_case_assignment - 派案資料表（5 筆）
// ============================================================
const pms_case_assignment = [
  {
    assignment_id: { S: 'asgn-0001-1111-4000-d000-000000000001' },
    feedback_no: { S: FEEDBACK_NOS[0] },
    vendor_id: { S: VENDOR_IDS[0] },
    assign_time: { S: '2026-07-15T11:00:00+08:00' },
    match_score: { N: '92' },
    is_primary: { S: '1' },
    status: { S: '02' },
    cre_time: { S: '2026-07-15T11:00:00+08:00' },
    upd_time: { S: '2026-07-15T14:00:00+08:00' }
  },
  {
    assignment_id: { S: 'asgn-0002-2222-4000-d000-000000000002' },
    feedback_no: { S: FEEDBACK_NOS[1] },
    vendor_id: { S: VENDOR_IDS[1] },
    assign_time: { S: '2026-07-16T09:30:00+08:00' },
    match_score: { N: '85' },
    is_primary: { S: '1' },
    status: { S: '01' },
    cre_time: { S: '2026-07-16T09:30:00+08:00' },
    upd_time: { S: '2026-07-16T09:30:00+08:00' }
  },
  {
    assignment_id: { S: 'asgn-0003-3333-4000-d000-000000000003' },
    feedback_no: { S: FEEDBACK_NOS[2] },
    vendor_id: { S: VENDOR_IDS[2] },
    assign_time: { S: '2026-07-16T10:00:00+08:00' },
    match_score: { N: '78' },
    is_primary: { S: '1' },
    status: { S: '03' },
    cre_time: { S: '2026-07-16T10:00:00+08:00' },
    upd_time: { S: '2026-07-17T08:00:00+08:00' }
  },
  {
    assignment_id: { S: 'asgn-0004-4444-4000-d000-000000000004' },
    feedback_no: { S: FEEDBACK_NOS[3] },
    vendor_id: { S: VENDOR_IDS[3] },
    assign_time: { S: '2026-07-16T16:30:00+08:00' },
    match_score: { N: '65' },
    is_primary: { S: '0' },
    status: { S: '01' },
    cre_time: { S: '2026-07-16T16:30:00+08:00' },
    upd_time: { S: '2026-07-16T16:30:00+08:00' }
  },
  {
    assignment_id: { S: 'asgn-0005-5555-4000-d000-000000000005' },
    feedback_no: { S: FEEDBACK_NOS[4] },
    vendor_id: { S: VENDOR_IDS[4] },
    assign_time: { S: '2026-07-17T10:00:00+08:00' },
    match_score: { N: '95' },
    is_primary: { S: '1' },
    status: { S: '02' },
    cre_time: { S: '2026-07-17T10:00:00+08:00' },
    upd_time: { S: '2026-07-17T14:00:00+08:00' }
  }
];

// ============================================================
// 6. pms_case_reply - 回覆資料表（5 筆）
// ============================================================
const pms_case_reply = [
  {
    reply_id: { S: 'rply-0001-1111-4000-e000-000000000001' },
    feedback_no: { S: FEEDBACK_NOS[0] },
    reply_type: { S: '01' },
    reply_content: { S: '您好，我們已安排清潔人員，預計明日上午抵達。' },
    replier_id: { S: VENDOR_IDS[0] },
    cre_time: { S: '2026-07-15T14:00:00+08:00' }
  },
  {
    reply_id: { S: 'rply-0002-2222-4000-e000-000000000002' },
    feedback_no: { S: FEEDBACK_NOS[1] },
    reply_type: { S: '02' },
    reply_content: { S: '冷氣檢修需現場勘查，請問方便的時段？' },
    replier_id: { S: VENDOR_IDS[1] },
    cre_time: { S: '2026-07-16T10:00:00+08:00' }
  },
  {
    reply_id: { S: 'rply-0003-3333-4000-e000-000000000003' },
    feedback_no: { S: FEEDBACK_NOS[2] },
    reply_type: { S: '01' },
    reply_content: { S: '包裹已收件，預計後天送達台北。' },
    replier_id: { S: VENDOR_IDS[2] },
    cre_time: { S: '2026-07-16T11:30:00+08:00' }
  },
  {
    reply_id: { S: 'rply-0004-4444-4000-e000-000000000004' },
    feedback_no: { S: FEEDBACK_NOS[3] },
    reply_type: { S: '03' },
    reply_content: { S: '訂位已確認，4位，7/20 18:30。' },
    replier_id: { S: VENDOR_IDS[3] },
    cre_time: { S: '2026-07-17T09:00:00+08:00' }
  },
  {
    reply_id: { S: 'rply-0005-5555-4000-e000-000000000005' },
    feedback_no: { S: FEEDBACK_NOS[4] },
    reply_type: { S: '02' },
    reply_content: { S: '水管疏通已完成，總費用為 NT$1,500，感謝您的使用。' },
    replier_id: { S: VENDOR_IDS[4] },
    cre_time: { S: '2026-07-17T16:00:00+08:00' }
  }
];

// ============================================================
// 7. pms_case_status_log - 狀態歷程資料表（6 筆）
// ============================================================
const pms_case_status_log = [
  {
    log_id: { S: 'log-0001-1111-4000-f000-000000000001' },
    feedback_no: { S: FEEDBACK_NOS[0] },
    old_status: { S: '01' },
    new_status: { S: '02' },
    change_reason: { S: '廠商已接案' },
    operator_id: { S: VENDOR_IDS[0] },
    cre_time: { S: '2026-07-15T11:00:00+08:00' }
  },
  {
    log_id: { S: 'log-0002-2222-4000-f000-000000000002' },
    feedback_no: { S: FEEDBACK_NOS[0] },
    old_status: { S: '02' },
    new_status: { S: '03' },
    change_reason: { S: '服務完成' },
    operator_id: { S: VENDOR_IDS[0] },
    cre_time: { S: '2026-07-16T17:00:00+08:00' }
  },
  {
    log_id: { S: 'log-0003-3333-4000-f000-000000000003' },
    feedback_no: { S: FEEDBACK_NOS[1] },
    old_status: { S: '01' },
    new_status: { S: '02' },
    change_reason: { S: '已派案給廠商' },
    operator_id: { S: 'system' },
    cre_time: { S: '2026-07-16T09:30:00+08:00' }
  },
  {
    log_id: { S: 'log-0004-4444-4000-f000-000000000004' },
    feedback_no: { S: FEEDBACK_NOS[2] },
    old_status: { S: '01' },
    new_status: { S: '02' },
    change_reason: { S: '廠商確認收件' },
    operator_id: { S: VENDOR_IDS[2] },
    cre_time: { S: '2026-07-16T10:30:00+08:00' }
  },
  {
    log_id: { S: 'log-0005-5555-4000-f000-000000000005' },
    feedback_no: { S: FEEDBACK_NOS[2] },
    old_status: { S: '02' },
    new_status: { S: '03' },
    change_reason: { S: '配送完成' },
    operator_id: { S: VENDOR_IDS[2] },
    cre_time: { S: '2026-07-18T14:00:00+08:00' }
  },
  {
    log_id: { S: 'log-0006-6666-4000-f000-000000000006' },
    feedback_no: { S: FEEDBACK_NOS[4] },
    old_status: { S: '01' },
    new_status: { S: '02' },
    change_reason: { S: '技師已出發' },
    operator_id: { S: VENDOR_IDS[4] },
    cre_time: { S: '2026-07-17T13:00:00+08:00' }
  }
];

// ============================================================
// 8. pms_case_review - 評價資料表（5 筆）
// ============================================================
const pms_case_review = [
  {
    review_id: { S: 'rev-0001-1111-4000-a100-000000000001' },
    feedback_no: { S: FEEDBACK_NOS[0] },
    vendor_id: { S: VENDOR_IDS[0] },
    inbr_account_id: { S: MEMBER_IDS[0] },
    rating: { N: '5' },
    rating_content: { S: '清潔非常仔細，服務態度很好！' },
    is_anonymous: { S: '0' },
    cre_time: { S: '2026-07-17T10:00:00+08:00' }
  },
  {
    review_id: { S: 'rev-0002-2222-4000-a100-000000000002' },
    feedback_no: { S: FEEDBACK_NOS[1] },
    vendor_id: { S: VENDOR_IDS[1] },
    inbr_account_id: { S: MEMBER_IDS[1] },
    rating: { N: '4' },
    rating_content: { S: '維修速度快，但報價稍高。' },
    is_anonymous: { S: '0' },
    cre_time: { S: '2026-07-18T09:00:00+08:00' }
  },
  {
    review_id: { S: 'rev-0003-3333-4000-a100-000000000003' },
    feedback_no: { S: FEEDBACK_NOS[2] },
    vendor_id: { S: VENDOR_IDS[2] },
    inbr_account_id: { S: MEMBER_IDS[2] },
    rating: { N: '5' },
    rating_content: { S: '寄件方便快速，包裹完好無損。' },
    is_anonymous: { S: '1' },
    cre_time: { S: '2026-07-19T14:30:00+08:00' }
  },
  {
    review_id: { S: 'rev-0004-4444-4000-a100-000000000004' },
    feedback_no: { S: FEEDBACK_NOS[3] },
    vendor_id: { S: VENDOR_IDS[3] },
    inbr_account_id: { S: MEMBER_IDS[3] },
    rating: { N: '3' },
    rating_content: { S: '訂位成功但等候時間較長。' },
    is_anonymous: { S: '1' },
    cre_time: { S: '2026-07-21T20:00:00+08:00' }
  },
  {
    review_id: { S: 'rev-0005-5555-4000-a100-000000000005' },
    feedback_no: { S: FEEDBACK_NOS[4] },
    vendor_id: { S: VENDOR_IDS[4] },
    inbr_account_id: { S: MEMBER_IDS[4] },
    rating: { N: '4' },
    rating_content: { S: '水電師傅很專業，問題順利解決。' },
    is_anonymous: { S: '0' },
    cre_time: { S: '2026-07-18T16:00:00+08:00' }
  }
];

// ============================================================
// 9. mms_order_record - 訂單記錄資料表（6 筆，多種 order_type 與 order_status）
// ============================================================
const mms_order_record = [
  {
    record_id: { S: 'ord-0001-1111-4000-b100-000000000001' },
    order_no: { S: 'ORD20260715001' },
    inbr_account_id: { S: MEMBER_IDS[0] },
    service_vendor_id: { S: VENDOR_IDS[0] },
    service_id: { N: '1' },
    platform_code: { S: '01' },
    order_type: { S: '01' },
    order_status: { S: '80' },
    order_time: { S: '2026-07-15T10:30:00+08:00' },
    final_amount: { N: '3000' },
    order_items: { L: [
      { M: { item_name: { S: '居家清潔-3房' }, unit_price: { N: '2500' }, quantity: { N: '1' } } },
      { M: { item_name: { S: '廚房加強清潔' }, unit_price: { N: '500' }, quantity: { N: '1' } } }
    ]},
    cre_time: { S: '2026-07-15T10:30:00+08:00' },
    upd_time: { S: '2026-07-16T18:00:00+08:00' }
  },
  {
    record_id: { S: 'ord-0002-2222-4000-b100-000000000002' },
    order_no: { S: 'ORD20260716001' },
    inbr_account_id: { S: MEMBER_IDS[1] },
    service_vendor_id: { S: VENDOR_IDS[1] },
    service_id: { N: '2' },
    platform_code: { S: '01' },
    order_type: { S: '01' },
    order_status: { S: '03' },
    order_time: { S: '2026-07-16T09:00:00+08:00' },
    final_amount: { N: '2800' },
    order_items: { L: [
      { M: { item_name: { S: '冷氣檢修' }, unit_price: { N: '800' }, quantity: { N: '1' } } },
      { M: { item_name: { S: '冷媒填充' }, unit_price: { N: '2000' }, quantity: { N: '1' } } }
    ]},
    cre_time: { S: '2026-07-16T09:00:00+08:00' },
    upd_time: { S: '2026-07-16T09:00:00+08:00' }
  },
  {
    record_id: { S: 'ord-0003-3333-4000-b100-000000000003' },
    order_no: { S: 'ORD20260716002' },
    inbr_account_id: { S: MEMBER_IDS[2] },
    service_vendor_id: { S: VENDOR_IDS[2] },
    service_id: { N: '3' },
    platform_code: { S: '01' },
    order_type: { S: '02' },
    order_status: { S: '80' },
    order_time: { S: '2026-07-16T14:00:00+08:00' },
    final_amount: { N: '350' },
    order_items: { L: [
      { M: { item_name: { S: '中型包裹寄件' }, unit_price: { N: '250' }, quantity: { N: '1' } } },
      { M: { item_name: { S: '包裝服務' }, unit_price: { N: '100' }, quantity: { N: '1' } } }
    ]},
    cre_time: { S: '2026-07-16T14:00:00+08:00' },
    upd_time: { S: '2026-07-18T15:00:00+08:00' }
  },
  {
    record_id: { S: 'ord-0004-4444-4000-b100-000000000004' },
    order_no: { S: 'ORD20260717001' },
    inbr_account_id: { S: MEMBER_IDS[3] },
    service_vendor_id: { S: VENDOR_IDS[3] },
    service_id: { N: '4' },
    platform_code: { S: '01' },
    order_type: { S: '05' },
    order_status: { S: '01' },
    order_time: { S: '2026-07-17T16:00:00+08:00' },
    final_amount: { N: '0' },
    order_items: { L: [
      { M: { item_name: { S: '餐廳訂位-4人' }, unit_price: { N: '0' }, quantity: { N: '1' } } }
    ]},
    cre_time: { S: '2026-07-17T16:00:00+08:00' },
    upd_time: { S: '2026-07-17T16:00:00+08:00' }
  },
  {
    record_id: { S: 'ord-0005-5555-4000-b100-000000000005' },
    order_no: { S: 'ORD20260717002' },
    inbr_account_id: { S: MEMBER_IDS[4] },
    service_vendor_id: { S: VENDOR_IDS[4] },
    service_id: { N: '6' },
    platform_code: { S: '01' },
    order_type: { S: '01' },
    order_status: { S: '90' },
    order_time: { S: '2026-07-17T09:00:00+08:00' },
    final_amount: { N: '1500' },
    order_items: { L: [
      { M: { item_name: { S: '水管疏通' }, unit_price: { N: '1200' }, quantity: { N: '1' } } },
      { M: { item_name: { S: '出勤費' }, unit_price: { N: '300' }, quantity: { N: '1' } } }
    ]},
    cre_time: { S: '2026-07-17T09:00:00+08:00' },
    upd_time: { S: '2026-07-17T18:00:00+08:00' }
  },
  {
    record_id: { S: 'ord-0006-6666-4000-b100-000000000006' },
    order_no: { S: 'ORD20260718001' },
    inbr_account_id: { S: MEMBER_IDS[0] },
    service_vendor_id: { S: VENDOR_IDS[4] },
    service_id: { N: '6' },
    platform_code: { S: '01' },
    order_type: { S: '06' },
    order_status: { S: '80' },
    order_time: { S: '2026-07-18T11:00:00+08:00' },
    final_amount: { N: '4500' },
    order_items: { L: [
      { M: { item_name: { S: '電路檢修' }, unit_price: { N: '2000' }, quantity: { N: '1' } } },
      { M: { item_name: { S: '插座更換' }, unit_price: { N: '1500' }, quantity: { N: '1' } } },
      { M: { item_name: { S: '材料費' }, unit_price: { N: '1000' }, quantity: { N: '1' } } }
    ]},
    cre_time: { S: '2026-07-18T11:00:00+08:00' },
    upd_time: { S: '2026-07-19T17:00:00+08:00' }
  }
];

// ============================================================
// 10. sys_district - 縣市區域資料表（10 筆：台北市3、新北市4、桃園市3）
// ============================================================
const sys_district = [
  // 台北市（county_code: "01"）- 3 筆
  {
    code: { S: '001' },
    county_code: { S: '01' },
    name: { S: '中正區' },
    name_with_county: { S: '台北市中正區' },
    zip: { S: '100' },
    sort: { N: '1' }
  },
  {
    code: { S: '002' },
    county_code: { S: '01' },
    name: { S: '大同區' },
    name_with_county: { S: '台北市大同區' },
    zip: { S: '103' },
    sort: { N: '2' }
  },
  {
    code: { S: '003' },
    county_code: { S: '01' },
    name: { S: '中山區' },
    name_with_county: { S: '台北市中山區' },
    zip: { S: '104' },
    sort: { N: '3' }
  },
  // 新北市（county_code: "02"）- 4 筆
  {
    code: { S: '013' },
    county_code: { S: '02' },
    name: { S: '板橋區' },
    name_with_county: { S: '新北市板橋區' },
    zip: { S: '220' },
    sort: { N: '13' }
  },
  {
    code: { S: '014' },
    county_code: { S: '02' },
    name: { S: '新莊區' },
    name_with_county: { S: '新北市新莊區' },
    zip: { S: '242' },
    sort: { N: '14' }
  },
  {
    code: { S: '015' },
    county_code: { S: '02' },
    name: { S: '泰山區' },
    name_with_county: { S: '新北市泰山區' },
    zip: { S: '243' },
    sort: { N: '15' }
  },
  {
    code: { S: '016' },
    county_code: { S: '02' },
    name: { S: '林口區' },
    name_with_county: { S: '新北市林口區' },
    zip: { S: '244' },
    sort: { N: '16' }
  },
  // 桃園市（county_code: "04"）- 3 筆
  {
    code: { S: '049' },
    county_code: { S: '04' },
    name: { S: '桃園區' },
    name_with_county: { S: '桃園市桃園區' },
    zip: { S: '330' },
    sort: { N: '49' }
  },
  {
    code: { S: '050' },
    county_code: { S: '04' },
    name: { S: '中壢區' },
    name_with_county: { S: '桃園市中壢區' },
    zip: { S: '320' },
    sort: { N: '50' }
  },
  {
    code: { S: '051' },
    county_code: { S: '04' },
    name: { S: '平鎮區' },
    name_with_county: { S: '桃園市平鎮區' },
    zip: { S: '324' },
    sort: { N: '51' }
  }
];

// ============================================================
// 匯出 SEED_DATA（key 為資料表名稱，value 為 marshalled items 陣列）
// ============================================================
const SEED_DATA = {
  inbr_member,
  pms_vendor_account,
  cms_service_vendor,
  pms_form_feedback,
  pms_case_assignment,
  pms_case_reply,
  pms_case_status_log,
  pms_case_review,
  mms_order_record,
  sys_district
};

module.exports = { SEED_DATA };
