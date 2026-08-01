# Design Document

## Introduction

本設計文件描述智慧社區服務平台 DynamoDB 資料庫的架構設計、元件結構、資料模型及部署策略。系統產出三個核心檔案：Node.js 部署腳本（含資料表建立與範例資料植入）、API 查詢服務模組、以及獨立 AWS CLI Shell 腳本。

## Architecture Overview

系統採用模組化分層架構，所有檔案放置於 `ai-community-web/dynamodb/` 目錄：

```
ai-community-web/dynamodb/
├── deploy.js              # Node.js 部署腳本（建表 + 植入資料）
├── seed-data.js           # 範例資料定義模組
├── api-service.js         # API 查詢函式庫
├── create-tables.sh       # AWS CLI 獨立建表腳本
├── table-definitions.js   # 資料表 Schema 定義（共用）
└── package.json           # 專案依賴設定
```

### 架構層次

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (HTML/JS)                   │
└──────────────────────┬──────────────────────────────┘
                       │ import
┌──────────────────────▼──────────────────────────────┐
│              api-service.js                           │
│  (getOrdersByMember, getAssignmentsByFeedback, ...)  │
└──────────────────────┬──────────────────────────────┘
                       │ @aws-sdk/client-dynamodb
┌──────────────────────▼──────────────────────────────┐
│           AWS DynamoDB (us-west-2)                    │
│  10 tables + GSIs, PAY_PER_REQUEST billing           │
└─────────────────────────────────────────────────────┘
```

## Components

### 1. Table Definitions Module (`table-definitions.js`)

集中管理所有 10 張資料表的 Schema 定義，包含 Key Schema、Attribute Definitions 與 GSI 設定。

```javascript
// table-definitions.js
const TABLE_DEFINITIONS = [
  {
    TableName: 'inbr_member',
    KeySchema: [{ AttributeName: 'inbr_account_id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'inbr_account_id', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST'
  },
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
  {
    TableName: 'cms_service_vendor',
    KeySchema: [{ AttributeName: 'vendor_id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'vendor_id', AttributeType: 'N' }],
    BillingMode: 'PAY_PER_REQUEST'
  },
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
```

### 2. Deployment Script (`deploy.js`)

主要部署流程：依序建立 10 張表 → 等待 ACTIVE → 批次植入資料。

```javascript
// deploy.js - 核心流程
const { DynamoDBClient, CreateTableCommand, BatchWriteItemCommand,
        DescribeTableCommand, ResourceInUseException } = require('@aws-sdk/client-dynamodb');
const { TABLE_DEFINITIONS } = require('./table-definitions');
const { SEED_DATA } = require('./seed-data');

const client = new DynamoDBClient({ region: 'us-west-2' });

async function waitForTableActive(tableName) {
  // 輪詢 DescribeTable 直到 TableStatus === 'ACTIVE'
}

async function createAllTables() {
  for (const tableDef of TABLE_DEFINITIONS) {
    try {
      await client.send(new CreateTableCommand(tableDef));
      console.log(`✓ 建立資料表: ${tableDef.TableName}`);
      await waitForTableActive(tableDef.TableName);
    } catch (error) {
      if (error.name === 'ResourceInUseException') {
        console.log(`⊘ 資料表已存在，跳過: ${tableDef.TableName}`);
      } else {
        throw error;
      }
    }
  }
}

async function seedAllTables() {
  for (const [tableName, items] of Object.entries(SEED_DATA)) {
    // BatchWriteItem 每批次最多 25 筆
    const batches = chunkArray(items, 25);
    for (const batch of batches) {
      const params = {
        RequestItems: {
          [tableName]: batch.map(item => ({ PutRequest: { Item: item } }))
        }
      };
      await client.send(new BatchWriteItemCommand(params));
    }
    console.log(`✓ 植入 ${items.length} 筆資料: ${tableName}`);
  }
}

async function main() {
  try {
    await createAllTables();
    await seedAllTables();
    console.log('✓ 部署完成');
  } catch (error) {
    console.error('✗ 部署失敗:', error.message);
    process.exit(1);
  }
}

main();
```

### 3. Seed Data Module (`seed-data.js`)

定義各資料表的範例資料，使用 DynamoDB marshalled 格式。所有記錄使用台灣在地資料，並確保跨表外鍵一致性。

**資料一致性策略：**
- 所有 `inbr_account_id` 值對應 `inbr_member` 表中的既有記錄
- `pms_case_assignment.feedback_no` 對應 `pms_form_feedback` 中的記錄
- `pms_case_reply.assignment_id` 對應 `pms_case_assignment` 中的記錄
- `pms_case_status_log.feedback_no` 對應 `pms_form_feedback` 中的記錄
- `pms_case_review.vendor_id` 對應 `cms_service_vendor` 中的記錄
- `mms_order_record.inbr_account_id` 對應 `inbr_member` 中的記錄

**台灣在地資料規範：**
- 姓名：使用中文姓名（如「王小明」、「李小華」）
- 電話：格式 09xx-xxx-xxx 或 02-xxxx-xxxx
- 地址：台灣真實行政區 + 路名
- 時間戳記：ISO 8601 格式（如 `2026-07-05T18:30:00Z`）

### 4. API Service Module (`api-service.js`)

封裝所有 DynamoDB 查詢操作，每個函式回傳統一結構：

```javascript
// api-service.js - 回傳結構
// 成功: { success: true, data: [...] }
// 失敗: { success: false, error: '錯誤訊息' }

const { DynamoDBClient, QueryCommand, GetItemCommand,
        PutItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({ region: 'us-west-2' });

// 查詢類函式 - 使用 GSI
async function getOrdersByMember(inbrAccountId) {
  // QueryCommand on mms_order_record, IndexName: GSI_inbr_account_id
  // KeyConditionExpression: 'inbr_account_id = :aid'
}

async function getAssignmentsByFeedback(feedbackNo) {
  // QueryCommand on pms_case_assignment, IndexName: GSI_feedback_no
  // KeyConditionExpression: 'feedback_no = :fno'
}

async function getRepliesByAssignment(assignmentId) {
  // QueryCommand on pms_case_reply, IndexName: GSI_assignment_id
  // KeyConditionExpression: 'assignment_id = :aid'
  // ScanIndexForward: true (ascending by reply_time)
}

async function getStatusLogByFeedback(feedbackNo) {
  // QueryCommand on pms_case_status_log, IndexName: GSI_feedback_no
  // KeyConditionExpression: 'feedback_no = :fno'
  // ScanIndexForward: true (ascending by change_time)
}

async function getReviewsByVendor(vendorId) {
  // QueryCommand on pms_case_review, IndexName: GSI_vendor_id
  // KeyConditionExpression: 'vendor_id = :vid'
}

async function getDistrictsByCounty(countyCode) {
  // QueryCommand on sys_district
  // KeyConditionExpression: 'county_code = :cc'
}

async function getFeedbackByMember(inbrAccountId) {
  // QueryCommand on pms_form_feedback, IndexName: GSI_inbr_account_id
  // KeyConditionExpression: 'inbr_account_id = :aid'
}

// 主鍵查詢函式
async function getMemberById(inbrAccountId) {
  // GetItemCommand on inbr_member, Key: { inbr_account_id: { S: id } }
}

async function getVendorById(vendorId) {
  // GetItemCommand on cms_service_vendor, Key: { vendor_id: { N: id } }
}

// 寫入/更新函式
async function createOrder(orderData) {
  // PutItemCommand on mms_order_record
  // marshall(orderData) for DynamoDB format
}

async function updateOrderStatus(recordId, newStatus) {
  // UpdateItemCommand on mms_order_record
  // UpdateExpression: 'SET order_status = :s, upd_time = :t'
}
```

### 5. AWS CLI Shell Script (`create-tables.sh`)

獨立可執行的 bash 腳本，不依賴 Node.js 環境。

```bash
#!/bin/bash
# create-tables.sh - AWS CLI DynamoDB 建表腳本
# 使用方式: chmod +x create-tables.sh && ./create-tables.sh

REGION="us-west-2"

echo "=== 開始建立 DynamoDB 資料表 (Region: $REGION) ==="

# Table 1: inbr_member
aws dynamodb create-table \
  --table-name inbr_member \
  --attribute-definitions AttributeName=inbr_account_id,AttributeType=S \
  --key-schema AttributeName=inbr_account_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION

# ... 其餘 9 張表（含 GSI 定義）
```

## Data Models

### DynamoDB Item Schema（DynamoDB Marshalled 格式）

| Table | PK | SK | GSIs | Key Attributes |
|-------|----|----|------|----------------|
| inbr_member | inbr_account_id (S) | - | - | member_name, phone, email, address |
| pms_vendor_account | account_id (N) | - | GSI_vendor_id (vendor_id:N) | vendor_id, account_no, account_name, role_code |
| cms_service_vendor | vendor_id (N) | - | - | vendor_name, contact_name, contact_phone, rating_avg |
| pms_form_feedback | feedback_no (S) | - | GSI_inbr_account_id (inbr_account_id:S, cre_time:S) | service_id, form_id, status, inbr_account_id |
| pms_case_assignment | assignment_id (N) | - | GSI_feedback_no (feedback_no:S), GSI_vendor_id (vendor_id:N) | feedback_no, vendor_id, assign_time, accept_status |
| pms_case_reply | reply_id (N) | - | GSI_assignment_id (assignment_id:N, reply_time:S) | assignment_id, reply_type, reply_content, reply_time |
| pms_case_status_log | log_id (N) | - | GSI_feedback_no (feedback_no:S, change_time:S) | feedback_no, status_code, status_name, change_time |
| pms_case_review | review_id (N) | - | GSI_vendor_id (vendor_id:N) | feedback_no, vendor_id, rating_score, rating_content |
| mms_order_record | record_id (N) | - | GSI_inbr_account_id (inbr_account_id:S, order_time:S) | order_no, inbr_account_id, order_type, order_status, final_amount |
| sys_district | county_code (S) | code (S) | - | name, name_with_county, zip, sort |

### 跨表參照關係圖

```
inbr_member (inbr_account_id)
  ├── mms_order_record.inbr_account_id
  ├── pms_form_feedback.inbr_account_id
  └── pms_case_review.cre_id

cms_service_vendor (vendor_id)
  ├── pms_case_assignment.vendor_id
  ├── pms_case_review.vendor_id
  └── pms_vendor_account.vendor_id

pms_form_feedback (feedback_no)
  ├── pms_case_assignment.feedback_no
  ├── pms_case_status_log.feedback_no
  └── pms_case_review.feedback_no

pms_case_assignment (assignment_id)
  ├── pms_case_reply.assignment_id
  └── pms_case_status_log.assignment_id
```

## Interfaces

### API Service Module 公開介面

```javascript
/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 操作是否成功
 * @property {Array<Object>} [data] - 成功時的資料陣列
 * @property {string} [error] - 失敗時的錯誤訊息
 */

// Query Functions (GSI)
getOrdersByMember(inbrAccountId: string): Promise<ApiResponse>
getAssignmentsByFeedback(feedbackNo: string): Promise<ApiResponse>
getRepliesByAssignment(assignmentId: number): Promise<ApiResponse>
getStatusLogByFeedback(feedbackNo: string): Promise<ApiResponse>
getReviewsByVendor(vendorId: number): Promise<ApiResponse>
getDistrictsByCounty(countyCode: string): Promise<ApiResponse>
getFeedbackByMember(inbrAccountId: string): Promise<ApiResponse>

// Primary Key Lookup
getMemberById(inbrAccountId: string): Promise<ApiResponse>
getVendorById(vendorId: number): Promise<ApiResponse>

// Write Operations
createOrder(orderData: Object): Promise<ApiResponse>
updateOrderStatus(recordId: number, newStatus: string): Promise<ApiResponse>
```

### Deploy Script CLI 介面

```bash
# 完整部署（建表 + 植入資料）
node deploy.js

# 退出碼：
# 0 = 成功
# 1 = 部署失敗（錯誤訊息輸出至 stderr）
```

## Error Handling

### 部署腳本錯誤處理策略

| 錯誤情境 | 處理方式 |
|----------|---------|
| 資料表已存在 (ResourceInUseException) | 跳過建立，記錄提示訊息，繼續下一張 |
| AWS 連線逾時 | 拋出錯誤，終止流程，非零退出碼 |
| BatchWriteItem 部分失敗 | 重試 UnprocessedItems（最多 3 次） |
| 認證失敗 | 立即終止，輸出錯誤訊息 |

### API Service 錯誤處理策略

| 錯誤情境 | 回傳值 |
|----------|--------|
| 查詢成功但無資料 | `{ success: true, data: [] }` |
| 查詢成功有資料 | `{ success: true, data: [...items] }` |
| DynamoDB 錯誤 | `{ success: false, error: '具體錯誤描述' }` |
| 參數驗證失敗 | `{ success: false, error: '參數錯誤: ...' }` |

### waitForTableActive 重試策略

```javascript
async function waitForTableActive(tableName, maxRetries = 30, delayMs = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await client.send(new DescribeTableCommand({ TableName: tableName }));
    if (response.Table.TableStatus === 'ACTIVE') return;
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  throw new Error(`資料表 ${tableName} 在 ${maxRetries * delayMs / 1000} 秒內未進入 ACTIVE 狀態`);
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Seed Data Format Compliance

*For any* seeded record across all 10 tables, all timestamp fields must be valid ISO 8601 strings, all phone number fields must match Taiwan format patterns (09xx-xxx-xxx or 0x-xxxx-xxxx), and all name fields must contain valid CJK characters.

**Validates: Requirements 3.2, 3.3**

### Property 2: Cross-Table Referential Integrity

*For any* seeded record that contains a foreign key reference (e.g., `pms_case_assignment.feedback_no`, `mms_order_record.inbr_account_id`, `pms_case_reply.assignment_id`), the referenced primary key must exist in the corresponding target table's seed data.

**Validates: Requirements 3.5**

### Property 3: Deployment Script Skip-Existing Resilience

*For any* subset of tables that already exist in the target DynamoDB region, the deployment script shall skip those tables without error and successfully create the remaining tables.

**Validates: Requirements 4.3**

### Property 4: Deployment Script Error Propagation

*For any* AWS error (other than ResourceInUseException) occurring during the deployment process, the script shall output an error message to console and terminate with a non-zero exit code.

**Validates: Requirements 4.7**

### Property 5: GSI Query Filter Correctness

*For any* valid key value passed to a GSI-based query function (getOrdersByMember, getAssignmentsByFeedback, getReviewsByVendor, getDistrictsByCounty, getFeedbackByMember), every item in the returned `data` array must have a matching key field value equal to the queried parameter.

**Validates: Requirements 5.1, 5.2, 5.5, 5.6, 5.7**

### Property 6: Time-Sorted Query Ordering

*For any* valid key value passed to a time-sorted query function (getRepliesByAssignment, getStatusLogByFeedback), the returned `data` array must be sorted in ascending order by its respective time field (reply_time or change_time).

**Validates: Requirements 5.3, 5.4**

### Property 7: Order Creation Round-Trip

*For any* valid order object written via createOrder, subsequently reading that record by its record_id must return an object with all original field values preserved.

**Validates: Requirements 5.10**

### Property 8: Order Status Update Correctness

*For any* existing order record and any valid new status string, calling updateOrderStatus followed by reading the record must show the order_status field equal to the new status value.

**Validates: Requirements 5.11**

### Property 9: API Response Structure Invariant

*For any* call to any API service function (regardless of success or failure), the returned object must contain a `success` boolean field, and either a `data` array (when success is true) or an `error` string (when success is false).

**Validates: Requirements 5.12**
