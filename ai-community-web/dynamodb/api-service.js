/**
 * api-service.js
 * DynamoDB API 查詢服務模組
 * 
 * 封裝所有 DynamoDB 查詢與寫入操作，供前端/後端呼叫。
 * 所有函式回傳統一結構: { success: true, data: [...] } 或 { success: false, error: '...' }
 */

const { DynamoDBClient, QueryCommand, GetItemCommand, PutItemCommand, UpdateItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');

const REGION = 'us-west-2';
const client = new DynamoDBClient({ region: REGION });

function successResponse(data) {
  return { success: true, data: Array.isArray(data) ? data : [data] };
}

function errorResponse(message) {
  return { success: false, error: message };
}

// --- GSI Query Functions ---

async function getOrdersByMember(inbrAccountId) {
  try {
    if (!inbrAccountId) return errorResponse('參數錯誤: inbrAccountId 為必填');
    const result = await client.send(new QueryCommand({
      TableName: 'mms_order_record',
      IndexName: 'GSI_inbr_account_id',
      KeyConditionExpression: 'inbr_account_id = :aid',
      ExpressionAttributeValues: { ':aid': { S: inbrAccountId } },
      ScanIndexForward: false
    }));
    return successResponse((result.Items || []).map(item => unmarshall(item)));
  } catch (error) {
    return errorResponse('查詢訂單失敗: ' + error.message);
  }
}

async function getAssignmentsByFeedback(feedbackNo) {
  try {
    if (!feedbackNo) return errorResponse('參數錯誤: feedbackNo 為必填');
    const result = await client.send(new QueryCommand({
      TableName: 'pms_case_assignment',
      IndexName: 'GSI_feedback_no',
      KeyConditionExpression: 'feedback_no = :fno',
      ExpressionAttributeValues: { ':fno': { S: feedbackNo } }
    }));
    return successResponse((result.Items || []).map(item => unmarshall(item)));
  } catch (error) {
    return errorResponse('查詢派案失敗: ' + error.message);
  }
}

async function getRepliesByFeedback(feedbackNo) {
  try {
    if (!feedbackNo) return errorResponse('參數錯誤: feedbackNo 為必填');
    const result = await client.send(new QueryCommand({
      TableName: 'pms_case_reply',
      IndexName: 'GSI_feedback_no',
      KeyConditionExpression: 'feedback_no = :fno',
      ExpressionAttributeValues: { ':fno': { S: feedbackNo } },
      ScanIndexForward: true
    }));
    return successResponse((result.Items || []).map(item => unmarshall(item)));
  } catch (error) {
    return errorResponse('查詢回覆失敗: ' + error.message);
  }
}

async function getStatusLogByFeedback(feedbackNo) {
  try {
    if (!feedbackNo) return errorResponse('參數錯誤: feedbackNo 為必填');
    const result = await client.send(new QueryCommand({
      TableName: 'pms_case_status_log',
      IndexName: 'GSI_feedback_no',
      KeyConditionExpression: 'feedback_no = :fno',
      ExpressionAttributeValues: { ':fno': { S: feedbackNo } },
      ScanIndexForward: true
    }));
    return successResponse((result.Items || []).map(item => unmarshall(item)));
  } catch (error) {
    return errorResponse('查詢狀態歷程失敗: ' + error.message);
  }
}

async function getReviewsByVendor(vendorId) {
  try {
    if (!vendorId) return errorResponse('參數錯誤: vendorId 為必填');
    const result = await client.send(new QueryCommand({
      TableName: 'pms_case_review',
      IndexName: 'GSI_vendor_id',
      KeyConditionExpression: 'vendor_id = :vid',
      ExpressionAttributeValues: { ':vid': { S: vendorId } }
    }));
    return successResponse((result.Items || []).map(item => unmarshall(item)));
  } catch (error) {
    return errorResponse('查詢評價失敗: ' + error.message);
  }
}

async function getDistrictsByCounty(countyCode) {
  try {
    if (!countyCode) return errorResponse('參數錯誤: countyCode 為必填');
    const result = await client.send(new ScanCommand({
      TableName: 'sys_district',
      FilterExpression: 'county_code = :cc',
      ExpressionAttributeValues: { ':cc': { S: countyCode } }
    }));
    const items = (result.Items || []).map(item => unmarshall(item));
    items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    return successResponse(items);
  } catch (error) {
    return errorResponse('查詢行政區失敗: ' + error.message);
  }
}

async function getFeedbackByMember(inbrAccountId) {
  try {
    if (!inbrAccountId) return errorResponse('參數錯誤: inbrAccountId 為必填');
    const result = await client.send(new QueryCommand({
      TableName: 'pms_form_feedback',
      IndexName: 'GSI_inbr_account_id',
      KeyConditionExpression: 'inbr_account_id = :aid',
      ExpressionAttributeValues: { ':aid': { S: inbrAccountId } },
      ScanIndexForward: false
    }));
    return successResponse((result.Items || []).map(item => unmarshall(item)));
  } catch (error) {
    return errorResponse('查詢諮詢單失敗: ' + error.message);
  }
}

// --- Primary Key Lookup Functions ---

async function getMemberById(inbrAccountId) {
  try {
    if (!inbrAccountId) return errorResponse('參數錯誤: inbrAccountId 為必填');
    const result = await client.send(new GetItemCommand({
      TableName: 'inbr_member',
      Key: { inbr_account_id: { S: inbrAccountId } }
    }));
    if (!result.Item) return successResponse([]);
    return successResponse(unmarshall(result.Item));
  } catch (error) {
    return errorResponse('查詢會員失敗: ' + error.message);
  }
}

async function getVendorById(vendorId) {
  try {
    if (!vendorId) return errorResponse('參數錯誤: vendorId 為必填');
    const result = await client.send(new GetItemCommand({
      TableName: 'cms_service_vendor',
      Key: { vendor_id: { S: vendorId } }
    }));
    if (!result.Item) return successResponse([]);
    return successResponse(unmarshall(result.Item));
  } catch (error) {
    return errorResponse('查詢廠商失敗: ' + error.message);
  }
}

// --- Write/Update Functions ---

async function createOrder(orderData) {
  try {
    if (!orderData || !orderData.record_id) {
      return errorResponse('參數錯誤: orderData 必須包含 record_id');
    }
    if (!orderData.cre_time) {
      orderData.cre_time = new Date().toISOString();
    }
    await client.send(new PutItemCommand({
      TableName: 'mms_order_record',
      Item: marshall(orderData, { removeUndefinedValues: true })
    }));
    return successResponse(orderData);
  } catch (error) {
    return errorResponse('建立訂單失敗: ' + error.message);
  }
}

async function updateOrderStatus(recordId, newStatus) {
  try {
    if (!recordId) return errorResponse('參數錯誤: recordId 為必填');
    if (!newStatus) return errorResponse('參數錯誤: newStatus 為必填');
    const now = new Date().toISOString();
    await client.send(new UpdateItemCommand({
      TableName: 'mms_order_record',
      Key: { record_id: { S: recordId } },
      UpdateExpression: 'SET order_status = :s, upd_time = :t',
      ExpressionAttributeValues: {
        ':s': { S: newStatus },
        ':t': { S: now }
      }
    }));
    return successResponse({ record_id: recordId, order_status: newStatus, upd_time: now });
  } catch (error) {
    return errorResponse('更新訂單狀態失敗: ' + error.message);
  }
}

module.exports = {
  getOrdersByMember,
  getAssignmentsByFeedback,
  getRepliesByFeedback,
  getStatusLogByFeedback,
  getReviewsByVendor,
  getDistrictsByCounty,
  getFeedbackByMember,
  getMemberById,
  getVendorById,
  createOrder,
  updateOrderStatus
};
