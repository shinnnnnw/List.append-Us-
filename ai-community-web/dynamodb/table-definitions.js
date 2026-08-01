// v2
/**
 * table-definitions.js
 * DynamoDB 資料表 Schema 定義模組
 *
 * 定義智慧社區服務平台 10 張 DynamoDB 資料表的 Schema，
 * 包含 KeySchema、AttributeDefinitions、BillingMode 及 GSI 設定。
 *
 * 所有資料表使用 PAY_PER_REQUEST 計費模式。
 * 部署區域為 us-west-2（由部署腳本處理）。
 */

const TABLE_DEFINITIONS = [
  // 1. inbr_member - 會員資料表
  {
    TableName: 'inbr_member',
    KeySchema: [{ AttributeName: 'inbr_account_id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'inbr_account_id', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST'
  },

  // 2. pms_vendor_account - 廠商帳號資料表
  {
    TableName: 'pms_vendor_account',
    KeySchema: [{ AttributeName: 'account_id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'account_id', AttributeType: 'N' },
      { AttributeName: 'vendor_id', AttributeType: 'N' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI_vendor_id',
        KeySchema: [{ AttributeName: 'vendor_id', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' }
      }
    ]
  },

  // 3. cms_service_vendor - 服務廠商資料表
  {
    TableName: 'cms_service_vendor',
    KeySchema: [{ AttributeName: 'vendor_id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'vendor_id', AttributeType: 'N' }],
    BillingMode: 'PAY_PER_REQUEST'
  },

  // 4. pms_form_feedback - 諮詢單資料表
  {
    TableName: 'pms_form_feedback',
    KeySchema: [{ AttributeName: 'feedback_no', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'feedback_no', AttributeType: 'S' },
      { AttributeName: 'inbr_account_id', AttributeType: 'S' },
      { AttributeName: 'cre_time', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI_inbr_account_id',
        KeySchema: [
          { AttributeName: 'inbr_account_id', KeyType: 'HASH' },
          { AttributeName: 'cre_time', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ]
  },

  // 5. pms_case_assignment - 派案資料表
  {
    TableName: 'pms_case_assignment',
    KeySchema: [{ AttributeName: 'assignment_id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'assignment_id', AttributeType: 'N' },
      { AttributeName: 'feedback_no', AttributeType: 'S' },
      { AttributeName: 'vendor_id', AttributeType: 'N' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI_feedback_no',
        KeySchema: [{ AttributeName: 'feedback_no', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' }
      },
      {
        IndexName: 'GSI_vendor_id',
        KeySchema: [{ AttributeName: 'vendor_id', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' }
      }
    ]
  },

  // 6. pms_case_reply - 回覆資料表
  {
    TableName: 'pms_case_reply',
    KeySchema: [{ AttributeName: 'reply_id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'reply_id', AttributeType: 'N' },
      { AttributeName: 'assignment_id', AttributeType: 'N' },
      { AttributeName: 'reply_time', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI_assignment_id',
        KeySchema: [
          { AttributeName: 'assignment_id', KeyType: 'HASH' },
          { AttributeName: 'reply_time', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ]
  },

  // 7. pms_case_status_log - 狀態歷程資料表
  {
    TableName: 'pms_case_status_log',
    KeySchema: [{ AttributeName: 'log_id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'log_id', AttributeType: 'N' },
      { AttributeName: 'feedback_no', AttributeType: 'S' },
      { AttributeName: 'change_time', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI_feedback_no',
        KeySchema: [
          { AttributeName: 'feedback_no', KeyType: 'HASH' },
          { AttributeName: 'change_time', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ]
  },

  // 8. pms_case_review - 評價資料表
  {
    TableName: 'pms_case_review',
    KeySchema: [{ AttributeName: 'review_id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'review_id', AttributeType: 'N' },
      { AttributeName: 'vendor_id', AttributeType: 'N' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI_vendor_id',
        KeySchema: [{ AttributeName: 'vendor_id', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' }
      }
    ]
  },

  // 9. mms_order_record - 訂單記錄資料表
  {
    TableName: 'mms_order_record',
    KeySchema: [{ AttributeName: 'record_id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'record_id', AttributeType: 'N' },
      { AttributeName: 'inbr_account_id', AttributeType: 'S' },
      { AttributeName: 'order_time', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI_inbr_account_id',
        KeySchema: [
          { AttributeName: 'inbr_account_id', KeyType: 'HASH' },
          { AttributeName: 'order_time', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ]
  },

  // 10. sys_district - 縣市區域資料表
  {
    TableName: 'sys_district',
    KeySchema: [
      { AttributeName: 'county_code', KeyType: 'HASH' },
      { AttributeName: 'code', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'county_code', AttributeType: 'S' },
      { AttributeName: 'code', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }
];

module.exports = { TABLE_DEFINITIONS };
