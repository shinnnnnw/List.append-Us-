/**
 * Aî 智慧社區 API — Lambda Handler (ESM)
 *
 * Routes:
 *   POST   /ai/chat              AI 多輪對話
 *   GET    /auth/users           帳號列表（Demo 快速登入）
 *   POST   /auth/login           登入（手機號碼 + 密碼後四碼）
 *   GET    /auth/check           檢查 session（JWT-less，回傳 localStorage 已儲存的 user）
 *   GET    /vendors              廠商列表（?type=X 篩選）
 *   GET    /vendors/:id          廠商詳情
 *   GET    /forms/:id            表單結構
 *   POST   /feedback             送出諮詢單
 *   GET    /orders               訂單列表（?account_id=MBRxxx）
 *   GET    /orders/:id           訂單詳情（?account_id=MBRxxx）
 *   GET    /districts            縣市列表
 *   GET    /districts?county=X   行政區列表
 */

import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const REGION = 'us-west-2';
const ddb = new DynamoDBClient({ region: REGION });
const bedrock = new BedrockRuntimeClient({ region: REGION });
const MODEL_ID = 'us.anthropic.claude-sonnet-4-20250514-v1:0';

// ─── CORS Helper ────────────────────────────────────────────────────────────

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Account-Id',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

function ok(data, message = '') {
  return response(200, { success: true, data, message });
}

function fail(message, code = 400) {
  return response(code, { success: false, data: null, message });
}

// ─── DynamoDB helpers ────────────────────────────────────────────────────────

async function dbGet(table, key) {
  const result = await ddb.send(new GetItemCommand({
    TableName: table,
    Key: marshall(key),
  }));
  return result.Item ? unmarshall(result.Item) : null;
}

async function dbQuery(table, indexName, keyExpr, exprValues, opts = {}) {
  const result = await ddb.send(new QueryCommand({
    TableName: table,
    IndexName: indexName,
    KeyConditionExpression: keyExpr,
    ExpressionAttributeValues: marshall(exprValues),
    ScanIndexForward: opts.ascending ?? false,
    Limit: opts.limit,
  }));
  return (result.Items || []).map(i => unmarshall(i));
}

async function dbScan(table, filterExpr, exprValues) {
  const result = await ddb.send(new ScanCommand({
    TableName: table,
    FilterExpression: filterExpr,
    ExpressionAttributeValues: marshall(exprValues),
  }));
  return (result.Items || []).map(i => unmarshall(i));
}

async function dbPut(table, item) {
  await ddb.send(new PutItemCommand({
    TableName: table,
    Item: marshall(item, { removeUndefinedValues: true }),
  }));
}

// ─── Router ─────────────────────────────────────────────────────────────────

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return response(200, '');

  const method = event.httpMethod || event.requestContext?.http?.method || 'GET';
  const rawPath = event.path || event.rawPath || '';
  // 去掉 /prod 前綴（API Gateway stage prefix）
  const path = rawPath.replace(/^\/prod/, '');
  const qs = event.queryStringParameters || {};
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (_) {}

  console.log(`[Router] ${method} ${path}`, { qs });

  try {
    // AI 對話
    if (path === '/ai/chat' && method === 'POST')       return handleChat(body);

    // Auth
    if (path === '/auth/users' && method === 'GET')     return handleAuthUsers();
    if (path === '/auth/login' && method === 'POST')    return handleAuthLogin(body);
    if (path === '/auth/check' && method === 'GET')     return ok(null, '請從 localStorage 確認登入狀態');

    // Vendors
    if (path === '/vendors' && method === 'GET')        return handleVendors(qs);
    if (/^\/vendors\/(.+)$/.test(path) && method === 'GET') {
      return handleVendorDetail(path.match(/^\/vendors\/(.+)$/)[1]);
    }

    // Forms
    if (/^\/forms\/(.+)$/.test(path) && method === 'GET') {
      return handleForm(path.match(/^\/forms\/(.+)$/)[1]);
    }

    // Feedback（諮詢單）
    if (path === '/feedback' && method === 'POST')      return handleFeedback(body);

    // Admin（廠商後台）
    if (path === '/admin/cases' && method === 'GET')    return handleAdminCases(qs);
    if (path === '/admin/cases/update' && method === 'POST') return handleAdminUpdateCase(body);
    if (path === '/admin/cases/reply' && method === 'POST')  return handleAdminReply(body);

    // Contact（聯絡我們）
    if (path === '/contact' && method === 'POST')       return handleContact(body);

    // Orders
    if (path === '/orders' && method === 'GET')         return handleOrders(qs);
    if (path === '/orders' && method === 'POST')        return handleCreateOrder(body);
    if (/^\/orders\/(.+)\/cancel$/.test(path) && method === 'POST') {
      return handleCancelOrder(path.match(/^\/orders\/(.+)\/cancel$/)[1], body);
    }
    if (/^\/orders\/(.+)$/.test(path) && method === 'GET') {
      return handleOrderDetail(path.match(/^\/orders\/(.+)$/)[1], qs);
    }

    // Districts
    if (path === '/districts' && method === 'GET')      return handleDistricts(qs);

    // Preferences（住戶偏好）
    if (path === '/preferences' && method === 'GET')    return handleGetPreferences(qs);
    if (path === '/preferences' && method === 'PUT')    return handlePutPreferences(body);

    return fail('找不到路由', 404);
  } catch (err) {
    console.error('[Handler Error]', err);
    return fail('伺服器內部錯誤：' + err.message, 500);
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

async function handleAuthUsers() {
  const items = await dbScan('inbr_member',
    'is_enable = :e',
    { ':e': '1' }
  );
  const users = items.map(m => ({
    name: m.member_name,
    phone: m.member_phone,
  }));
  return ok(users);
}

async function handleAuthLogin(body) {
  const phone = (body.phone || '').trim();
  const password = (body.password || '').trim();

  if (!phone) return fail('請輸入手機號碼');

  const items = await dbScan('inbr_member',
    'member_phone = :p AND is_enable = :e',
    { ':p': phone, ':e': '1' }
  );

  if (!items.length) return fail('找不到此手機號碼的帳號', 401);

  const member = items[0];

  // 密碼驗證：手機號碼去掉非數字後的後四碼
  if (password) {
    const digitsOnly = phone.replace(/\D/g, '');
    const expected = digitsOnly.slice(-4);
    if (password !== expected) return fail('密碼錯誤（提示：手機號碼後四碼）', 401);
  }

  const user = {
    inbr_account_id: member.inbr_account_id,
    name:   member.member_name,
    phone:  member.member_phone,
    email:  member.member_email || '',
    points: Number(member.point_balance) || 0,
  };

  return ok(user, '登入成功');
}

// ─── Vendors ─────────────────────────────────────────────────────────────────

const SERVICE_TYPE_MAP = {
  '1': '家事服務', '2': '家電清洗', '3': '寄件服務',
  '6': '餐廳訂位', '10': '水電修繕', '11': '商品購買',
};

async function handleVendors(qs) {
  let items = await dbScan('cms_service_vendor',
    'is_enable = :e',
    { ':e': '1' }
  );

  if (qs.type) {
    items = items.filter(v =>
      String(v.service_type) === String(qs.type)
    );
  }

  const vendors = items.map(v => ({
    vendor_id:    v.vendor_id,
    vendor_name:  v.name,
    service_type: String(v.service_type),
    description:  v.description,
    rating_avg:   v.rating_avg ? Number(v.rating_avg).toFixed(1) : null,
    rating_count: Number(v.rating_count) || 0,
    service_types: [String(v.service_type)],
  }));

  return ok({
    vendors,
    service_type_map: SERVICE_TYPE_MAP,
  });
}

async function handleVendorDetail(vendorId) {
  const item = await dbGet('cms_service_vendor', { vendor_id: Number(vendorId) });
  if (!item) return fail('找不到該服務商', 404);

  // service_areas 優先用 DynamoDB 裡的結構化資料，fallback 用 service_counties
  let areas = [];
  if (item.service_areas && Array.isArray(item.service_areas)) {
    areas = item.service_areas.map(a => ({
      county_name: a.county_name || '',
      district_name: a.district_name || '',
    }));
  } else if (item.service_counties && Array.isArray(item.service_counties)) {
    areas = item.service_counties.map(c => ({ county_name: c }));
  }

  return ok({
    vendor_id:     item.vendor_id,
    vendor_name:   item.name,
    service_type:  String(item.service_type),
    description:   item.description,
    rating_avg:    item.rating_avg ? Number(item.rating_avg).toFixed(1) : null,
    rating_count:  Number(item.rating_count) || 0,
    contact_name:  item.contact_name || '',
    contact_phone: item.contact_phone || '',
    service_types: [String(item.service_type)],
    service_areas: areas,
  });
}

// ─── Forms（靜態結構，DynamoDB 無表單 schema，回傳固定結構）─────────────────

const STATIC_FORMS = {
  '1': {
    id: 1, name: '餐廳訂位需求表單',
    intro_content: '<p>請留下您的訂位需求，我們將盡快為您安排。</p>',
    notice_content: null, terms_content: null,
  },
  '2': {
    id: 2, name: '商品購買需求表單',
    intro_content: '<p>請描述您的商品需求，我們將為您推薦適合的商品。</p>',
    notice_content: null, terms_content: null,
  },
  '3': {
    id: 3, name: '居家服務需求表單',
    intro_content: '<p>請填寫您的服務需求，我們將安排合適的服務商聯繫您。</p>',
    notice_content: null, terms_content: null,
  },
  '4': {
    id: 4, name: '包裹寄送需求表單',
    intro_content: '<p>請填寫寄件資訊，我們將安排到府收件。</p>',
    notice_content: null, terms_content: null,
  },
};

const STATIC_TOPICS = {
  '1': [
    { id: 1, form_id: 1, type: '8',  title: '聯絡資訊',         is_required: '1', sort: 1, options: [], feature: null },
    { id: 2, form_id: 1, type: '5',  title: '希望用餐地區',     is_required: '1', sort: 2, options: [], feature: null },
    { id: 3, form_id: 1, type: '9',  title: '希望訂位日期',     is_required: '1', sort: 3, options: [], feature: null },
    { id: 4, form_id: 1, type: '1',  title: '用餐人數',         is_required: '1', sort: 4, options: [], feature: null, is_number_only: '1' },
    { id: 5, form_id: 1, type: '3',  title: '餐廳類型偏好',     is_required: '0', sort: 5, options: [
      { id: 1, topic_id: 5, option_name: '中式' }, { id: 2, topic_id: 5, option_name: '日式' },
      { id: 3, topic_id: 5, option_name: '西式' }, { id: 4, topic_id: 5, option_name: '韓式' },
    ], feature: null },
  ],
  '2': [
    { id: 6,  form_id: 2, type: '10', title: '聯絡資訊',         is_required: '1', sort: 1, options: [], feature: null },
    { id: 7,  form_id: 2, type: '2',  title: '商品描述',         is_required: '1', sort: 2, options: [], feature: null },
    { id: 8,  form_id: 2, type: '4',  title: '商品類別',         is_required: '0', sort: 3, options: [
      { id: 5, topic_id: 8, option_name: '生鮮食品' }, { id: 6, topic_id: 8, option_name: '日用品' },
      { id: 7, topic_id: 8, option_name: '3C家電' },   { id: 8, topic_id: 8, option_name: '服飾' },
    ], feature: null },
    { id: 9,  form_id: 2, type: '8',  title: '配送地址',         is_required: '1', sort: 4, options: [], feature: null },
    { id: 10, form_id: 2, type: '1',  title: '預算上限（元）',   is_required: '0', sort: 5, options: [], feature: null, is_number_only: '1' },
  ],
  '3': [
    { id: 11, form_id: 3, type: '10', title: '聯絡資訊',         is_required: '1', sort: 1, options: [], feature: null },
    { id: 12, form_id: 3, type: '3',  title: '需求類型',         is_required: '1', sort: 2, options: [
      { id: 9,  topic_id: 12, option_name: '家事清潔' }, { id: 10, topic_id: 12, option_name: '水電修繕' },
      { id: 11, topic_id: 12, option_name: '家電清洗' }, { id: 12, topic_id: 12, option_name: '其他' },
    ], feature: null },
    { id: 13, form_id: 3, type: '2',  title: '需求詳細說明',     is_required: '1', sort: 3, options: [], feature: null },
    { id: 14, form_id: 3, type: '5',  title: '服務地址',         is_required: '1', sort: 4, options: [], feature: null },
    { id: 15, form_id: 3, type: '9',  title: '希望服務時間',     is_required: '0', sort: 5, options: [], feature: null },
  ],
  '4': [
    { id: 16, form_id: 4, type: '10', title: '寄件人資訊',       is_required: '1', sort: 1, options: [], feature: null },
    { id: 17, form_id: 4, type: '3',  title: '包裹大小',         is_required: '1', sort: 2, options: [
      { id: 13, topic_id: 17, option_name: '小型（鞋盒以下）' },
      { id: 14, topic_id: 17, option_name: '中型' },
      { id: 15, topic_id: 17, option_name: '大型' },
    ], feature: null },
    { id: 18, form_id: 4, type: '1',  title: '重量（公斤）',     is_required: '0', sort: 3, options: [], feature: null, is_number_only: '1' },
    { id: 19, form_id: 4, type: '3',  title: '收件方式',         is_required: '1', sort: 4, options: [
      { id: 16, topic_id: 19, option_name: '到府收件' },
      { id: 17, topic_id: 19, option_name: '自行送至門市' },
    ], feature: null },
    { id: 20, form_id: 4, type: '5',  title: '取件地址',         is_required: '1', sort: 5, options: [], feature: null },
  ],
};

async function handleForm(formId) {
  const form = STATIC_FORMS[formId];
  if (!form) return fail('找不到該表單', 404);
  return ok({
    form,
    groups: [],
    topics: STATIC_TOPICS[formId] || [],
    county_relations: [],
  });
}

// ─── Feedback（諮詢單送出）───────────────────────────────────────────────────

async function handleFeedback(body) {
  const accountId = body.account_id || '';
  const formId    = body.form_id;

  if (!formId)    return fail('缺少 form_id');
  if (!accountId) return fail('未登入，請重新登入', 401);

  const now = new Date().toISOString();
  const feedbackNo = 'FB' + Date.now();

  const item = {
    feedback_no:              feedbackNo,
    form_id:                  formId,
    platform_code:            '01',
    inbr_account_id:          accountId,
    contact_name:             body.contact_name             || body.account_name || '',
    contact_mobile:           body.contact_mobile           || '',
    contact_email:            body.contact_email            || '',
    contact_address_county:   body.contact_address_county   || '',
    contact_address_district: body.contact_address_district || '',
    contact_address_detail:   body.contact_address_detail   || '',
    description:              body.description              || '',
    feedback_content:         body.data ? JSON.stringify(body.data) : '{}',
    status:                   '01',
    is_read:                  '0',
    cre_time:                 now,
    upd_time:                 now,
  };

  await dbPut('pms_form_feedback', item);
  return ok({ feedback_no: feedbackNo }, '表單提交成功');
}

// ─── Contact（聯絡我們）──────────────────────────────────────────────────────

async function handleContact(body) {
  const name    = (body.name || '').trim();
  const email   = (body.email || '').trim();
  const phone   = (body.phone || '').trim();
  const address = (body.address || '').trim();
  const content = (body.content || '').trim();

  if (!name || !email || !content) {
    return fail('請填寫必填欄位（姓名、信箱、問題內容）', 400);
  }

  const now = new Date().toISOString();
  const id = 'CQ' + Date.now();

  await dbPut('contact_inquiry', {
    id,
    name,
    email,
    phone,
    address,
    content,
    created_at: now,
  });

  return ok(null, '感謝您的來信，我們將盡快回覆您！');
}

// ─── Admin（廠商後台）────────────────────────────────────────────────────────

async function handleAdminCases(qs) {
  const status = qs.status || '';
  const items = await dbScan('pms_form_feedback',
    'feedback_no > :empty',
    { ':empty': '' }
  );

  let cases = items.map(item => ({
    id: item.feedback_no,
    customerName: item.contact_name || '',
    customerPhone: item.contact_mobile || '',
    customerEmail: item.contact_email || '',
    service: item.description || '',
    status: item.status || '01',
    createdAt: item.cre_time || '',
    address: [item.contact_address_county, item.contact_address_district, item.contact_address_detail].filter(Boolean).join(''),
    description: item.feedback_content || '',
    replies: item.replies ? (typeof item.replies === 'string' ? JSON.parse(item.replies) : item.replies) : [],
  }));

  if (status) {
    cases = cases.filter(c => c.status === status);
  }

  return ok(cases);
}

async function handleAdminUpdateCase(body) {
  const feedbackNo = body.feedback_no || body.id;
  const newStatus = body.status;

  if (!feedbackNo || !newStatus) return fail('缺少必要欄位', 400);

  const existing = await dbGet('pms_form_feedback', { feedback_no: feedbackNo });
  if (!existing) return fail('找不到該案件', 404);

  existing.status = newStatus;
  existing.upd_time = new Date().toISOString();

  await dbPut('pms_form_feedback', existing);
  return ok(null, '狀態更新成功');
}

async function handleAdminReply(body) {
  const feedbackNo = body.feedback_no || body.id;
  const replyContent = (body.content || '').trim();

  if (!feedbackNo || !replyContent) return fail('缺少必要欄位', 400);

  const existing = await dbGet('pms_form_feedback', { feedback_no: feedbackNo });
  if (!existing) return fail('找不到該案件', 404);

  const replies = existing.replies ? (typeof existing.replies === 'string' ? JSON.parse(existing.replies) : existing.replies) : [];
  replies.push({
    time: new Date().toISOString(),
    content: replyContent,
  });

  existing.replies = JSON.stringify(replies);
  existing.upd_time = new Date().toISOString();

  await dbPut('pms_form_feedback', existing);
  return ok(null, '回覆成功');
}

// ─── Orders ──────────────────────────────────────────────────────────────────

function formatOrder(o) {
  return {
    record_id:    o.record_id,
    order_no:     o.order_no,
    order_type:   o.order_type,
    order_status: o.order_status,
    order_time:   o.cre_time || o.order_time || '',
    vendor_name:  o.vendor_name  || o.service_vendor_id || '',
    service_name: o.service_name || '',
    final_amount: Number(o.final_amount) || 0,
    earn_points:  Number(o.earn_points)  || 0,
    remark:       o.remark || '',
  };
}

async function handleOrders(qs) {
  const accountId = qs.account_id || '';
  if (!accountId) return fail('缺少 account_id', 401);

  const items = await dbQuery(
    'mms_order_record',
    'GSI_inbr_account_id',
    'inbr_account_id = :aid',
    { ':aid': accountId },
    { ascending: false }
  );

  let orders = items.map(formatOrder);
  if (qs.status) orders = orders.filter(o => o.order_status === qs.status);
  return ok(orders);
}

async function handleCreateOrder(body) {
  const requiredFields = ['inbr_account_id', 'service_vendor_id', 'service_id', 'order_type'];
  for (const field of requiredFields) {
    if (!body[field]) return fail(`缺少必填欄位: ${field}`, 400);
  }

  const now = new Date().toISOString();
  const recordId = Date.now(); // 數字型主鍵，用毫秒時間戳確保唯一遞增

  const orderData = {
    record_id: recordId,
    order_no: body.order_no || `ORD${Date.now()}`,
    service_vendor_id: body.service_vendor_id,
    service_id: body.service_id,
    inbr_account_id: body.inbr_account_id,
    order_type: body.order_type,
    order_status: body.order_status || '01',
    final_amount: body.final_amount || 0,
    order_items: body.order_items || [],
    cre_time: now,
    order_time: now, // GSI_inbr_account_id 的 RANGE key，務必寫入
  };

  await dbPut('mms_order_record', orderData);
  return ok(formatOrder(orderData), '訂單建立成功');
}

async function handleOrderDetail(orderId, qs) {
  const accountId = qs.account_id || '';

  // 先用 Scan 找（record_id 是 PK，但 DynamoDB GetItem 需精確 key type）
  const items = await dbScan('mms_order_record',
    'record_id = :rid',
    { ':rid': Number(orderId) }  // record_id 是 N 型別，orderId 從路徑取得是字串，需轉數字才能比對
  );

  if (!items.length) return fail('找不到該訂單', 404);
  const o = items[0];
  if (accountId && o.inbr_account_id !== accountId) return fail('無權限查看此訂單', 403);

  const order = {
    ...formatOrder(o),
    original_amount: Number(o.original_amount) || Number(o.final_amount) || 0,
    discount_amount: Number(o.discount_amount) || 0,
    order_items: typeof o.order_items === 'string'
      ? JSON.parse(o.order_items) : (o.order_items || []),
    timeline: [
      { status: '建立訂單', time: o.cre_time || '' },
      ...(o.confirm_time  ? [{ status: '訂單確認',  time: o.confirm_time  }] : []),
      ...(o.service_time  ? [{ status: '服務進行',  time: o.service_time  }] : []),
      ...(o.complete_time ? [{ status: '訂單完成',  time: o.complete_time }] : []),
      ...(o.cancel_time   ? [{ status: '訂單取消',  time: o.cancel_time   }] : []),
    ],
  };
  return ok(order);
}

// ─── Districts ───────────────────────────────────────────────────────────────

const COUNTIES = [
  { code: 'TPE', name: '台北市' },
  { code: 'NTP', name: '新北市' },
  { code: 'TXG', name: '台中市' },
  { code: 'KHH', name: '高雄市' },
  { code: 'TYC', name: '桃園市' },
];

async function handleDistricts(qs) {
  if (!qs.county) {
    // 回傳縣市列表
    return ok(COUNTIES);
  }

  // 回傳指定縣市的行政區
  const items = await dbScan('sys_district',
    'county_code = :cc',
    { ':cc': qs.county }
  );
  const districts = items
    .sort((a, b) => (a.zip || '').localeCompare(b.zip || ''))
    .map(d => ({ code: d.code, county_code: d.county_code, name: d.name, zip: d.zip }));

  return ok(districts);
}

// ─── Preferences（住戶偏好）────────────────────────────────────────────────────

async function handleGetPreferences(qs) {
  const accountId = qs.account_id || '';
  if (!accountId) return fail('缺少 account_id', 400);

  const item = await dbGet('user_preferences', { inbr_account_id: accountId });
  if (!item) return ok({});

  // 移除 DynamoDB 主鍵，只回傳偏好資料
  const { inbr_account_id, ...prefs } = item;
  return ok(prefs);
}

async function handlePutPreferences(body) {
  const accountId = body.account_id || '';
  if (!accountId) return fail('缺少 account_id', 400);

  const prefs = body.preferences || {};
  if (!Object.keys(prefs).length) return fail('偏好資料為空', 400);

  const item = {
    inbr_account_id: accountId,
    ...prefs,
    updated_at: new Date().toISOString(),
  };

  await dbPut('user_preferences', item);
  return ok(item, '偏好已儲存');
}

// ─── AI Chat ─────────────────────────────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `你是「Aî 智慧社區管家」，一個友善、專業的 AI 助手，服務於社區住戶。

【服務項目】外送、訂位、清潔、修繕、宅配、購物、叫車、領藥。

【核心任務】透過自然對話逐步收集使用者的需求資訊，收集完整後整理成確認單讓使用者確認。

【對話流程】
1. 辨識意圖：使用者提到服務需求時，不要再問「你要什麼服務」，直接開始問該服務的第一個細節問題
2. 逐步詢問：每次只問一個問題，依照以下流程收集資訊：

【外送】
第一則回覆：「好的！我來幫您安排外送🛵 請問有指定的餐廳嗎？還是告訴我想吃什麼類型，我來推薦？」
收集順序：指定餐廳或餐點類型 → 具體餐點內容 → 送達地址 → 聯絡電話 → 希望送達時間 → 付款方式（付現/刷卡/行動支付） → 特殊備註（不要辣等）
注意：若使用者指定餐廳名稱，務必複述確認餐廳全名。

【訂位】
第一則回覆：「沒問題！我幫您安排訂位🍽️ 請問有指定的餐廳嗎？還是想由我為您推薦？」
收集順序：指定餐廳或餐廳類型偏好 → 用餐日期與時段 → 用餐人數 → 訂位人姓名與聯絡電話 → 特殊需求（包廂、兒童椅、無障礙等）
注意：若使用者指定餐廳名稱，務必複述確認。

【清潔】
第一則回覆：「收到！我來安排清潔服務🧹 請問是哪種清潔需求呢？（一般居家清潔、大掃除、冷氣清洗、洗衣機清洗、搬家清潔等）」
收集順序：清潔類型 → 坪數或清潔範圍 → 是否方便提供現場照片（可選，有助於報價） → 希望日期時間 → 服務地址 → 聯絡人姓名與電話

【修繕】
第一則回覆：「了解！我幫您安排修繕師傅🔧 請問是什麼地方需要維修呢？（漏水、電路、馬桶、水龍頭、門窗等）」
收集順序：問題描述 → 是否能提供現場照片或影片（強烈建議，師傅需判斷工具與零件） → 緊急程度（越快越好/可排時間） → 方便的日期時間 → 服務地址 → 聯絡人姓名與電話

【宅配】
第一則回覆：「好的！我來幫您安排寄件📦 請問包裹大概多大呢？（小型信件、中型紙箱、大型物品）」
收集順序：包裹大小與重量 → 物品性質與溫層（常溫/冷藏/冷凍/易碎/液體） → 寄件人資訊（地址、姓名、電話） → 收件人資訊（地址、姓名、電話） → 希望取件時間

【購物】
第一則回覆：「沒問題！我幫您採買🛒 請問想購買什麼商品呢？」
收集順序：商品名稱或描述 → 數量 → 預算範圍 → 配送方式（宅配到府/超商取貨/門市自取） → 收件資訊（若宅配：地址/姓名/電話；若超取：指定超商門市名稱）

【叫車】
第一則回覆：「好的！我來幫您安排叫車🚕 請問您需要哪種車型呢？
1. 一般計程車
2. 多元計程車
3. 寵物專車（可攜帶毛孩）
4. 無障礙專車
5. 大型行李專車（適合攜帶大件行李）
6. 醫療接送專車」
收集順序：車型選擇 → 上車地點 → 目的地 → 乘車時間（現在叫車/預約時間） → 乘車人數 → 聯絡人姓名與電話 → 特殊需求備註
注意：
- 選擇寵物專車時，詢問寵物種類與大小
- 選擇無障礙專車時，詢問是否需要輪椅升降設備
- 選擇大型行李專車時，詢問行李件數與大小
- 選擇醫療接送時，詢問是否需要陪同人員或特殊醫療設備

【領藥】
第一則回覆：「收到！我幫您安排代領藥品💊
提醒您：代領處方藥需提供處方箋照片與相關證明文件喔！
請問是要代領處方藥還是購買一般藥品呢？」
收集順序：處方藥/一般藥品 → 上傳處方箋照片或提供藥品名稱 → 指定藥局（或最近即可） → 送達地址與聯絡電話 → 希望送達時間
注意：處方藥代領務必提醒需準備健保卡、身分證明、委託書等文件。

【通用規則】
1. 用親切自然的繁體中文回覆
2. 每次只問一個問題，不要一次列出所有問題
3. 適時使用換行讓回覆更好閱讀
4. 凡涉及「送達、派單、訂位、到府」的服務，最後一定要確認「聯絡人姓名」與「聯絡電話」
5. 當使用者指定餐廳或店家名稱時，務必複述全名確認
6. 絕對不要主動推薦或提及任何真實存在的品牌、餐廳、店家名稱（如鼎泰豐、瓦城、一蘭等），只需詢問使用者的偏好類型（中式、日式、西式等）或讓使用者自己指定
7. 當資訊收集完整，用以下格式整理確認單：

📋 需求確認單
━━━━━━━━━━
▪ 服務類型：xxx
▪ 詳細內容：xxx
▪ 日期時間：xxx
▪ 地點/地址：xxx
▪ 聯絡人：xxx
▪ 聯絡電話：xxx
▪ 付款方式：xxx（如適用）
▪ 備註：xxx
━━━━━━━━━━
請確認以上資訊是否正確？如需修改請告訴我哪項要改。

然後在回覆最末尾加上（使用者看不到）：
[CONFIRM:服務類型]

8. 使用者確認「沒問題」「確認」「OK」「對」等肯定回覆後，在末尾加上：
[SUBMIT:服務類型]
然後回覆「已為您送出需求！」之後，接著問：
「要把這次的聯絡資訊（地址/電話/付款方式）存為常用資訊嗎？下次就不用再輸入了 😊」

8. 若使用者同意儲存常用資訊（回覆「好」「要」「存」等肯定詞），在回覆末尾加上標記：
[SAVE_PREFS:{"address":"完整地址","phone":"電話號碼","contactName":"聯絡人姓名","paymentMethod":"付款方式"}]
只存使用者在本次對話中實際提供過的欄位，沒提供的不要放進去。地址必須是完整的門牌地址（如：新北市板橋區中山路二段50號3樓），不要包含多餘的文字。

9. 如果使用者說要修改某項，詢問新的內容後重新整理確認單
10. 不涉及服務的閒聊正常聊天，不加任何標記
11. 回覆純文字，不加 markdown 語法（不要用 **粗體** 或 # 標題）
12. 若使用者上傳照片不清晰，請提示重新上傳
13. 領藥服務涉及敏感事項，請加上免責提示`;

async function handleChat(body) {
  const text    = (body.text || '').trim();
  const image   = body.image || null; // base64 encoded image
  const imageMediaType = body.image_media_type || 'image/jpeg';
  const history = (body.history || []).slice(-30);
  const preferences = body.preferences || {};
  const accountId = body.account_id || '';

  // 如果前端沒帶偏好但有 account_id，從 DynamoDB 讀取
  let userPrefs = preferences;
  if (accountId && Object.keys(preferences).length === 0) {
    try {
      const stored = await dbGet('user_preferences', { inbr_account_id: accountId });
      if (stored) {
        const { inbr_account_id, updated_at, ...rest } = stored;
        userPrefs = rest;
      }
    } catch (e) {
      console.error('[Prefs read error]', e);
    }
  }

  if (!text && !image) return fail('訊息不能為空');

  const messages = [];
  for (const msg of history) {
    if (!msg.role || !msg.content) continue;
    messages.push({ role: msg.role, content: msg.content });
  }

  // 組合當前使用者訊息（支援多模態：文字 + 圖片）
  if (image) {
    const userContent = [];
    userContent.push({
      type: 'image',
      source: { type: 'base64', media_type: imageMediaType, data: image },
    });
    userContent.push({
      type: 'text',
      text: text || '請分析這張照片，辨識問題類型、嚴重程度，並預估維修工時與參考報價。',
    });
    messages.push({ role: 'user', content: userContent });
  } else {
    if (!messages.length || messages[messages.length - 1]?.content !== text) {
      messages.push({ role: 'user', content: text });
    }
  }

  // 偵測是否涉及餐廳/訂位，從 DynamoDB 抓餐廳清單注入 prompt
  const bookingKeywords = ['吃', '餐廳', '訂位', '用餐', '聚餐', '晚餐', '午餐', '早餐', '吃飯', '約吃', '推薦'];
  const allText = messages.map(m => typeof m.content === 'string' ? m.content : '').join(' ');
  const isBookingRelated = bookingKeywords.some(kw => allText.includes(kw));

  let vendorPromptAppend = '';
  if (isBookingRelated) {
    try {
      const vendors = await dbScan('cms_service_vendor',
        'service_type = :st AND is_enable = :e',
        { ':st': 6, ':e': '1' }
      );
      if (vendors.length > 0) {
        const vendorList = vendors
          .sort((a, b) => (Number(b.rating_avg) || 0) - (Number(a.rating_avg) || 0))
          .map(v => `- ${v.name}（${v.description}，評分 ${v.rating_avg}）`)
          .join('\n');
        vendorPromptAppend = `\n\n【系統資料：平台合作餐廳清單】\n當使用者問有哪些餐廳可選時，只能從以下清單推薦，不可自行編造餐廳名稱：\n${vendorList}\n\n推薦時依使用者偏好的料理類型篩選，最多列出 3-5 間供選擇。`;
      }
    } catch (vendorErr) {
      console.error('[Vendor fetch error]', vendorErr);
    }
  }

  // 組合住戶偏好提示
  let prefsPrompt = '';
  const accountName = body.account_name || '';
  const accountPhone = body.account_phone || '';

  // 帳號基本資料（登入時的姓名和電話）
  const accountInfo = [];
  if (accountName) accountInfo.push(`帳號姓名：${accountName}`);
  if (accountPhone) accountInfo.push(`帳號電話：${accountPhone}`);

  if (accountInfo.length > 0 || Object.keys(userPrefs).length > 0) {
    const prefsLines = [...accountInfo];
    if (userPrefs.address) prefsLines.push(`常用地址：${userPrefs.address}`);
    if (userPrefs.phone) prefsLines.push(`常用聯絡電話：${userPrefs.phone}`);
    if (userPrefs.contactName) prefsLines.push(`常用聯絡人：${userPrefs.contactName}`);
    if (userPrefs.paymentMethod) prefsLines.push(`慣用付款方式：${userPrefs.paymentMethod}`);
    if (userPrefs.favoriteRestaurants) prefsLines.push(`喜好餐廳：${userPrefs.favoriteRestaurants}`);
    if (userPrefs.dietaryNotes) prefsLines.push(`飲食備註：${userPrefs.dietaryNotes}`);

    prefsPrompt = `\n\n【住戶資料與偏好】
${prefsLines.join('\n')}

使用規則：
- 當需要聯絡人姓名和電話時，主動詢問：「要直接使用您帳號的姓名（${accountName || '未設定'}）和電話（${accountPhone || '未設定'}）嗎？」
- 若住戶有常用地址，詢問：「要送到跟上次一樣的地址嗎？（${userPrefs.address || ''}）」
- 若住戶有慣用付款方式，詢問：「一樣用${userPrefs.paymentMethod || ''}付款嗎？」
- 使用者同意就直接帶入，不同意就重新詢問`;
  }

  // 圖片辨識用的 system prompt 附加
  let systemPrompt = CHAT_SYSTEM_PROMPT + vendorPromptAppend + prefsPrompt;
  if (image) {
    systemPrompt += `\n\n【圖片辨識模式】
使用者上傳了一張現場照片，請你：
1. 辨識照片中的問題類型（如：漏水、牆壁裂縫、管線破損、家電故障、髒污程度等）
2. 評估損壞/髒污嚴重程度（輕微/中等/嚴重）
3. 預估維修或清潔工時（例如：約 1-2 小時）
4. 提供參考報價範圍（例如：約 NT$ 800-1,500）
5. 建議需要的服務類型（修繕/清潔/其他）

用條列方式清楚回覆，然後繼續詢問使用者是否要預約此服務。`;
  }

  try {
    const cmd = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2048,
        temperature: 0.7,
        system: systemPrompt,
        messages,
      }),
    });
    const res  = await bedrock.send(cmd);
    const data = JSON.parse(new TextDecoder().decode(res.body));
    const raw  = data.content?.[0]?.text?.trim() || '';

    // 偵測狀態標記
    const confirmMatch = raw.match(/\[CONFIRM:([^\]]+)\]/);
    const submitMatch  = raw.match(/\[SUBMIT:([^\]]+)\]/);
    const reply = raw
      .replace(/\[CONFIRM:[^\]]+\]/g, '')
      .replace(/\[SUBMIT:[^\]]+\]/g, '')
      .trim();

    const svcMap = {
      '外送': 1, '餐廳外送': 1,
      '訂位': 1, '餐廳訂位': 1,
      '清潔': 3, '居家清潔': 3,
      '修繕': 3, '水電修繕': 3,
      '宅配': 4, '包裹寄送': 4, '寄件': 4,
      '購物': 2, '商品購買': 2,
      '叫車': 3, '計程車': 3,
      '領藥': 3, '代領藥品': 3,
    };

    let formId = null;
    let service = null;
    let status = 'chatting'; // chatting | collecting | complete
    let feedbackNo = null;
    let collected = null;

    if (submitMatch) {
      service = submitMatch[1];
      formId  = svcMap[service] || 3;
      status  = 'complete';

      // 自動建立諮詢單
      feedbackNo = 'FB' + Date.now();
      collected = { service, history_summary: reply };

      const now = new Date().toISOString();

      try {
        await dbPut('pms_form_feedback', {
          feedback_no:     feedbackNo,
          form_id:         formId,
          platform_code:   '01',
          inbr_account_id: accountId,
          contact_name:    body.account_name || '',
          contact_mobile:  body.account_phone || '',
          description:     `AI對話自動建單：${service}`,
          feedback_content: JSON.stringify({ source: 'ai_chat', service, reply }),
          status:          '01',
          is_read:         '0',
          cre_time:        now,
          upd_time:        now,
        });
      } catch (dbErr) {
        console.error('[Auto-submit feedback error]', dbErr);
      }

      // 同時建立訂單紀錄（讓訂單頁面能看到）
      const recordId = Date.now();
      try {
        await dbPut('mms_order_record', {
          record_id:         recordId,
          order_no:          'ORD' + recordId,
          inbr_account_id:   accountId,
          service_vendor_id: '',
          order_type:        '01',
          order_status:      '01',
          service_name:      service,
          final_amount:      0,
          earn_points:       0,
          remark:            `AI對話需求：${service}`,
          feedback_no:       feedbackNo,
          cre_time:          now,
          order_time:        now,
        });
      } catch (dbErr) {
        console.error('[Auto-submit order error]', dbErr);
      }
    } else if (confirmMatch) {
      service = confirmMatch[1];
      formId  = svcMap[service] || 3;
      status  = 'collecting';
    }

    // 偏好儲存由 AI 在訂單確認後主動詢問用戶，不再自動提取
    // AI 會在回覆中加上 [SAVE_PREFS:JSON] 標記表示用戶同意儲存
    const prefsMatch = raw.match(/\[SAVE_PREFS:(.*?)\]/s);
    let extractedPrefs = null;
    if (prefsMatch) {
      try {
        extractedPrefs = JSON.parse(prefsMatch[1]);
        // 寫入 DynamoDB
        if (accountId && extractedPrefs) {
          const merged = { ...userPrefs, ...extractedPrefs };
          await dbPut('user_preferences', {
            inbr_account_id: accountId,
            ...merged,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error('[Prefs save error]', e);
      }
    }

    // 清除標記
    const cleanReply = reply.replace(/\[SAVE_PREFS:.*?\]/s, '').trim();

    return ok({
      reply: cleanReply,
      intent:      (confirmMatch || submitMatch) ? 'service' : 'none',
      status,
      has_form:    false,
      form_id:     formId,
      service,
      feedback_no: feedbackNo,
      collected,
      preferences: extractedPrefs || undefined,
      source:      'bedrock',
    });
  } catch (err) {
    console.error('[Bedrock Error]', err);
    return ok({
      reply: '不好意思，我現在有點忙不過來，可以請您再說一次嗎？',
      intent: 'none', status: 'chatting', has_form: false, form_id: null, service: null, source: 'fallback',
    });
  }
}

// ─── Cancel Order ────────────────────────────────────────────────────────────

const NON_CANCELLABLE_STATUS = ['80', '90', '99'];

async function handleCancelOrder(orderId, body) {
  const accountId = (body.inbr_account_id || '').trim();
  if (!accountId) return fail('缺少 account_id', 400);

  const items = await dbScan('mms_order_record',
    'record_id = :rid',
    { ':rid': Number(orderId) }
  );

  if (!items.length) return fail('訂單不存在', 404);
  const order = items[0];

  if (order.inbr_account_id !== accountId) {
    return fail('無權操作此訂單', 403);
  }

  if (NON_CANCELLABLE_STATUS.includes(order.order_status)) {
    return fail('此訂單狀態無法取消', 400);
  }

  const now = new Date().toISOString();
  await ddb.send(new UpdateItemCommand({
    TableName: 'mms_order_record',
    Key: marshall({ record_id: Number(orderId) }),
    UpdateExpression: 'SET order_status = :s, upd_time = :t',
    ExpressionAttributeValues: marshall({ ':s': '90', ':t': now }),
  }));

  return ok({ record_id: Number(orderId), order_status: '90', upd_time: now }, '訂單已取消');
}
