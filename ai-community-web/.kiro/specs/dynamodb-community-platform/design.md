# Design Document

## Introduction

本設計文件描述智慧社區服務平台 DynamoDB 資料庫的架構設計、元件結構、資料模型及部署策略。系統產出三個核心檔案：Node.js 部署腳本（含資料表建立與範例資料植入）、API 查詢服務模組、以及獨立 AWS CLI Shell 腳本。

> ⚠️ **注意：** 實際實作中，所有 ID 欄位（vendor_id, account_id, assignment_id, reply_id, log_id, review_id, record_id）在 seed-data.js 中皆使用 **String (S)** 類型，並採用有意義的字串前綴（如 V001, ASN001, ORD001）。table-definitions.js 中部分仍定義為 Number (N) 類型，部署前需統一。

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
│         Frontend (HTML/JS) - js/config.js            │
│   API_BASE: https://adjvx2bs1a.execute-api.         │
│             us-west-2.amazonaws.com/prod             │
└──────────────────────┬──────────────────────────────┘
                       │ fetch / import
┌──────────────────────▼──────────────────────────────┐
│              api-service.js                           │
│  (getOrdersByMember, getRepliesByFeedback, ...)      │
└──────────────────────┬──────────────────────────────┘
                       │ @aws-sdk/client-dynamodb
┌──────────────────────▼──────────────────────────────┐
│           AWS DynamoDB (us-west-2)                    │
│  10 tables + GSIs, PAY_PER_REQUEST billing           │
└─────────────────────────────────────────────────────┘
```

## Components

### 1. Table Definitions Module (`table-definitions.js`)

集中管理所有 10 張資料表的 Schema 定義。實際程式碼請參考 `dynamodb/table-definitions.js`。

### 2. Deployment Script (`deploy.js`)

主要部署流程：依序建立 10 張表 → 等待 ACTIVE → 批次植入資料。

**核心功能：**
- `waitForTableActive(tableName, maxRetries=30, delayMs=2000)` — 輪詢 DescribeTable
- `createAllTables()` — 依序建立，ResourceInUseException 時跳過
- `seedAllTables()` — BatchWriteItem 批次寫入（每批 ≤ 25 筆），支援 UnprocessedItems 重試（最多 3 次，指數退避）
- `chunkArray(array, size)` — 陣列分割工具

### 3. Seed Data Module (`seed-data.js`)

定義各資料表的範例資料，使用 DynamoDB marshalled 格式。

**ID 命名規則：**

| 資料表 | ID 前綴 | 範例 |
|--------|---------|------|
| inbr_member | MBR | MBR001, MBR002 |
| cms_service_vendor | V | V001, V002 |
| pms_vendor_account | VA | VA001, VA002 |
| pms_form_feedback | FB + 日期 | FB20260801001 |
| pms_case_assignment | ASN | ASN001, ASN002 |
| pms_case_reply | RPL | RPL001, RPL002 |
| pms_case_status_log | LOG | LOG001, LOG002 |
| pms_case_review | RVW | RVW001, RVW002 |
| mms_order_record | ORD | ORD001, ORD002 |
| sys_district | county_code | TPE, NTP, TXG, KHH, TYC |

**資料一致性策略：**
- 所有 `inbr_account_id` 值對應 `inbr_member` 表中的既有記錄（MBR001-MBR005）
- `pms_case_assignment.feedback_no` 對應 `pms_form_feedback` 中的記錄
- `pms_case_reply.feedback_no` 對應 `pms_form_feedback` 中的記錄
- `pms_case_status_log.feedback_no` 對應 `pms_form_feedback` 中的記錄
- `pms_case_review.vendor_id` 對應 `cms_service_vendor` 中的記錄
- `mms_order_record.inbr_account_id` 對應 `inbr_member` 中的記錄
- `mms_order_record.service_vendor_id` 對應 `cms_service_vendor` 中的記錄

**台灣在地資料規範：**
- 姓名：中文姓名（王小明、陳美玲、林大偉、黃志豪、李小芳）
- 電話：格式 09xx-xxx-xxx
- 地址：台灣真實行政區 + 路名
- 時間戳記：ISO 8601 格式含時區偏移（如 `2026-08-01T08:00:00+08:00`）

**廠商資料（6 家）：**

| vendor_id | 名稱 | service_type | 服務範圍 |
|-----------|------|-------------|---------|
| V001 | 潔淨居家清潔 | 1 (清潔) | 台北市、新北市 |
| V002 | 全能家電清洗 | 2 (家電) | 台北市、新北市、桃園市 |
| V003 | 快速寄件服務 | 3 (寄件) | 台北市、新北市、台中市、高雄市 |
| V004 | 饗食餐廳 | 6 (餐廳) | 台北市 |
| V005 | 水電王修繕 | 10 (修繕) | 台北市、新北市 |
| V006 | 統一購物商城 | 11 (購物) | 全台 |

### 4. API Service Module (`api-service.js`)

封裝所有 DynamoDB 查詢操作，每個函式回傳統一結構：

```javascript
// 成功: { success: true, data: [...] }
// 失敗: { success: false, error: '錯誤訊息' }
```

**實際匯出的函式：**

```javascript
module.exports = {
  // GSI 查詢
  getOrdersByMember,         // GSI_inbr_account_id on mms_order_record (降序)
  getAssignmentsByFeedback,  // GSI_feedback_no on pms_case_assignment
  getRepliesByFeedback,      // GSI_feedback_no on pms_case_reply (升序)
  getStatusLogByFeedback,    // GSI_feedback_no on pms_case_status_log (升序)
  getReviewsByVendor,        // GSI_vendor_id on pms_case_review
  getDistrictsByCounty,      // ScanCommand + FilterExpression on sys_district
  getFeedbackByMember,       // GSI_inbr_account_id on pms_form_feedback (降序)

  // 主鍵查詢
  getMemberById,             // GetItemCommand on inbr_member
  getVendorById,             // GetItemCommand on cms_service_vendor

  // 寫入/更新
  createOrder,               // PutItemCommand on mms_order_record
  updateOrderStatus          // UpdateItemCommand on mms_order_record
};
```

> **注意：** 原設計中的 `getRepliesByAssignment` 已改為 `getRepliesByFeedback`，改用 `feedback_no` 作為查詢條件。

### 5. AWS CLI Shell Script (`create-tables.sh`)

獨立可執行的 bash 腳本，不依賴 Node.js 環境。Region: us-west-2。

### 6. Frontend Config (`js/config.js`)

前端全域設定：

```javascript
const CONFIG = {
  API_BASE: 'https://adjvx2bs1a.execute-api.us-west-2.amazonaws.com/prod',
  QUICK_SERVICES: [
    { name: '訂位', formId: 1, serviceType: '6' },
    { name: '購物', formId: 2, serviceType: '11' },
    { name: '清潔', formId: 3, serviceType: '1' },
    { name: '修繕', formId: 3, serviceType: '10' },
    { name: '家電', formId: 3, serviceType: '2' },
    { name: '寄件', formId: 4, serviceType: '3' },
  ],
  ORDER_STATUS: {
    '01': '待媒合', '02': '媒合中', '03': '已確認',
    '04': '進行中', '80': '已完成', '90': '已取消', '99': '已退款'
  },
  ORDER_TYPE: {
    '01': '服務訂單', '02': '訂位', '03': '預約',
    '04': '其他', '05': '商品訂單', '06': '訂餐'
  },
  CONTACT_TIME: { '1': '上午', '2': '下午', '3': '皆可' },
  TOPIC_TYPE: {
    '1': '簡答題', '2': '詳答題', '3': '單選題', '4': '複選題',
    '5': '地區選單', '6': '上傳照片', '7': '備註說明', '8': '聯絡資料',
    '9': '日期題', '10': '聯絡資料(不含地址)'
  }
};
```

## Data Models

### DynamoDB Item Schema（實際 seed-data.js 使用的類型）

| Table | PK | SK | GSIs | Key Attributes |
|-------|----|----|------|----------------|
| inbr_member | inbr_account_id (S) | - | - | member_name, member_phone, member_email, home_county, home_district, home_address, point_balance, platform_code |
| pms_vendor_account | account_id (S) | - | GSI_vendor_id (vendor_id:S) | vendor_id, account_name, role_code, is_enable |
| cms_service_vendor | vendor_id (S) | - | - | name, service_type(N), description, rating_avg(N), rating_count(N), service_counties(L) |
| pms_form_feedback | feedback_no (S) | - | GSI_inbr_account_id (inbr_account_id:S, cre_time:S) | service_id(N), form_id(N), inbr_account_id, contact_name, contact_mobile, feedback_content(M), status |
| pms_case_assignment | assignment_id (S) | - | GSI_feedback_no (feedback_no:S), GSI_vendor_id (vendor_id:S) | feedback_no, vendor_id, match_score(N), is_primary, status |
| pms_case_reply | reply_id (S) | - | GSI_feedback_no (feedback_no:S) | feedback_no, vendor_id, reply_type, content, cre_time, cre_id |
| pms_case_status_log | log_id (S) | - | GSI_feedback_no (feedback_no:S, cre_time:S) | feedback_no, old_status, new_status, changed_by, remark |
| pms_case_review | review_id (S) | - | GSI_vendor_id (vendor_id:S) | feedback_no, vendor_id, inbr_account_id, rating(N), comment, is_anonymous |
| mms_order_record | record_id (S) | - | GSI_inbr_account_id (inbr_account_id:S, cre_time:S) | order_no, service_vendor_id, service_id(N), inbr_account_id, order_type, order_status, final_amount(N), order_items(L) |
| sys_district | county_code (S) | code (S) | - | name, zip |

### 縣市代碼對照表

| county_code | 縣市名稱 |
|-------------|---------|
| TPE | 台北市 |
| NTP | 新北市 |
| TXG | 台中市 |
| KHH | 高雄市 |
| TYC | 桃園市 |

### 跨表參照關係圖

```
inbr_member (inbr_account_id: MBR001-MBR005)
  ├── mms_order_record.inbr_account_id
  ├── pms_form_feedback.inbr_account_id
  └── pms_case_review.inbr_account_id

cms_service_vendor (vendor_id: V001-V006)
  ├── pms_case_assignment.vendor_id
  ├── pms_case_reply.vendor_id
  ├── pms_case_review.vendor_id
  ├── pms_vendor_account.vendor_id
  └── mms_order_record.service_vendor_id

pms_form_feedback (feedback_no: FB20260801001...)
  ├── pms_case_assignment.feedback_no
  ├── pms_case_reply.feedback_no
  ├── pms_case_status_log.feedback_no
  └── pms_case_review.feedback_no
```

### 與 MySQL 原始 Schema 的差異

| 面向 | MySQL (0731_202607_hackson.sql) | DynamoDB (seed-data.js) |
|------|-------------------------------|------------------------|
| ID 類型 | bigint / int (AUTO_INCREMENT) | String (有意義前綴) |
| 外鍵 | DB 層面約束 | 應用層面邏輯約束 |
| 加密欄位 | blob + hash | 明文（範例資料用途） |
| 廠商名稱 | vendor_name (pms_vendor) | name (cms_service_vendor) |
| 回覆關聯 | assignment_id FK | feedback_no + vendor_id 直接存放 |
| 時間格式 | datetime | ISO 8601 + timezone offset |
| 縣市代碼 | 2 位數字 ('01','02') | 英文縮寫 (TPE, NTP) |

## Interfaces

### API Service Module 公開介面

```javascript
// GSI Query Functions
getOrdersByMember(inbrAccountId: string): Promise<ApiResponse>
getAssignmentsByFeedback(feedbackNo: string): Promise<ApiResponse>
getRepliesByFeedback(feedbackNo: string): Promise<ApiResponse>
getStatusLogByFeedback(feedbackNo: string): Promise<ApiResponse>
getReviewsByVendor(vendorId: string): Promise<ApiResponse>
getDistrictsByCounty(countyCode: string): Promise<ApiResponse>
getFeedbackByMember(inbrAccountId: string): Promise<ApiResponse>

// Primary Key Lookup
getMemberById(inbrAccountId: string): Promise<ApiResponse>
getVendorById(vendorId: string): Promise<ApiResponse>

// Write Operations
createOrder(orderData: Object): Promise<ApiResponse>
updateOrderStatus(recordId: string, newStatus: string): Promise<ApiResponse>
```

### Deploy Script CLI

```bash
node deploy.js
# 退出碼：0 = 成功, 1 = 失敗
```

## Error Handling

### 部署腳本錯誤處理策略

| 錯誤情境 | 處理方式 |
|----------|---------|
| ResourceInUseException | 跳過建立，記錄提示，繼續 |
| AWS 連線逾時 | 拋出錯誤，process.exit(1) |
| BatchWriteItem 部分失敗 | 重試 UnprocessedItems（3 次，指數退避） |
| 認證失敗 | 立即終止 |

### API Service 錯誤處理策略

| 錯誤情境 | 回傳值 |
|----------|--------|
| 成功但無資料 | `{ success: true, data: [] }` |
| 成功有資料 | `{ success: true, data: [...] }` |
| DynamoDB 錯誤 | `{ success: false, error: '...' }` |
| 參數驗證失敗 | `{ success: false, error: '參數錯誤: xxx 為必填' }` |

## Correctness Properties

### Property 1: Seed Data Format Compliance

*For any* seeded record across all 10 tables, all timestamp fields must be valid ISO 8601 strings, all phone number fields must match Taiwan format patterns (09xx-xxx-xxx or 0x-xxxx-xxxx), and all name fields must contain valid CJK characters.

**Validates: Requirements 3.2, 3.3**

### Property 2: Cross-Table Referential Integrity

*For any* seeded record that contains a foreign key reference (e.g., `pms_case_assignment.feedback_no`, `mms_order_record.inbr_account_id`, `pms_case_reply.feedback_no`), the referenced primary key must exist in the corresponding target table's seed data.

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

*For any* valid key value passed to a time-sorted query function (getRepliesByFeedback, getStatusLogByFeedback), the returned `data` array must be sorted in ascending order by its respective time field (cre_time or change_time).

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
