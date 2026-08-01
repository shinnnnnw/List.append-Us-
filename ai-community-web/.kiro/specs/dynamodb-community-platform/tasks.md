# Implementation Plan: DynamoDB Community Platform

## Overview

實作智慧社區服務平台的 DynamoDB 資料庫模組，包含資料表定義、部署腳本（建表 + 範例資料植入）、API 查詢服務函式、以及獨立 AWS CLI 建表 Shell 腳本。所有檔案放置於 `ai-community-web/dynamodb/` 目錄下。

## Tasks

- [x] 1. 建立專案結構與資料表定義模組
  - [x] 1.1 建立 dynamodb 目錄與 package.json
    - 建立 `ai-community-web/dynamodb/` 目錄
    - 建立 `package.json`，設定 name、version、main，並加入 `@aws-sdk/client-dynamodb` 與 `@aws-sdk/util-dynamodb` 依賴
    - _Requirements: 4.1_

  - [x] 1.2 建立 table-definitions.js 資料表 Schema 定義模組
    - 依設計文件定義 10 張資料表的 TableName、KeySchema、AttributeDefinitions、BillingMode
    - 包含所有 8 個 GSI 定義（GSI_inbr_account_id、GSI_feedback_no、GSI_vendor_id、GSI_assignment_id）
    - 匯出 TABLE_DEFINITIONS 陣列供其他模組使用
    - _Requirements: 1.1-1.11, 2.1-2.8_

- [ ] 2. 實作範例資料模組
  - [-] 2.1 建立 seed-data.js 範例資料定義
    - 為 10 張資料表各建立 5-10 筆範例記錄，使用 DynamoDB marshalled 格式
    - 使用台灣在地假資料：中文姓名、台灣電話格式（09xx-xxx-xxx）、台灣地址
    - 所有時間戳記使用 ISO 8601 格式
    - sys_district 包含台北市、新北市、桃園市的行政區資料
    - mms_order_record 包含多種 order_type 與 order_status 組合
    - 確保跨表外鍵一致（feedback_no、inbr_account_id、assignment_id、vendor_id）
    - 匯出 SEED_DATA 物件供 deploy.js 使用
    - _Requirements: 3.1-3.6_

  - [ ]* 2.2 撰寫 Property Test: Seed Data Format Compliance
    - **Property 1: Seed Data Format Compliance**
    - 驗證所有 seed data 的時間戳記為有效 ISO 8601、電話為台灣格式、姓名含 CJK 字元
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 2.3 撰寫 Property Test: Cross-Table Referential Integrity
    - **Property 2: Cross-Table Referential Integrity**
    - 驗證所有外鍵參照（feedback_no、inbr_account_id、assignment_id、vendor_id）在目標表中存在
    - **Validates: Requirements 3.5**

- [ ] 3. 實作 Node.js 部署腳本
  - [~] 3.1 建立 deploy.js 部署腳本主程式
    - 實作 DynamoDBClient 初始化（region: us-west-2）
    - 實作 waitForTableActive 函式（輪詢 DescribeTable，最多重試 30 次，間隔 2 秒）
    - 實作 createAllTables 函式：依序建立 10 張表，ResourceInUseException 時跳過並記錄訊息
    - 實作 seedAllTables 函式：使用 BatchWriteItem 批次寫入（每批次 ≤ 25 筆）
    - 實作 main 函式：先 createAllTables 再 seedAllTables，成功印出完成訊息，失敗印出錯誤並 process.exit(1)
    - _Requirements: 4.1-4.7_

  - [ ]* 3.2 撰寫 Property Test: Deployment Script Skip-Existing Resilience
    - **Property 3: Deployment Script Skip-Existing Resilience**
    - 模擬部分表已存在場景，驗證腳本跳過已存在表並成功建立其餘表
    - **Validates: Requirements 4.3**

  - [ ]* 3.3 撰寫 Property Test: Deployment Script Error Propagation
    - **Property 4: Deployment Script Error Propagation**
    - 模擬非 ResourceInUseException 的 AWS 錯誤，驗證腳本輸出錯誤訊息並以非零退出碼終止
    - **Validates: Requirements 4.7**

- [~] 4. Checkpoint - 確認部署模組完整
  - 確保所有檔案語法正確無誤，確保 table-definitions.js 與 seed-data.js 可正確被 deploy.js 引用，ask the user if questions arise.

- [ ] 5. 實作 API 查詢服務模組
  - [~] 5.1 建立 api-service.js - GSI 查詢函式
    - 實作 getOrdersByMember：使用 GSI_inbr_account_id 查詢 mms_order_record
    - 實作 getAssignmentsByFeedback：使用 GSI_feedback_no 查詢 pms_case_assignment
    - 實作 getRepliesByAssignment：使用 GSI_assignment_id 查詢 pms_case_reply（依 reply_time 升序）
    - 實作 getStatusLogByFeedback：使用 GSI_feedback_no 查詢 pms_case_status_log（依 change_time 升序）
    - 實作 getReviewsByVendor：使用 GSI_vendor_id 查詢 pms_case_review
    - 實作 getDistrictsByCounty：使用 county_code 作為 Partition Key 查詢 sys_district
    - 實作 getFeedbackByMember：使用 GSI_inbr_account_id 查詢 pms_form_feedback
    - 所有函式回傳統一結構 `{ success: true, data: [...] }` 或 `{ success: false, error: '...' }`
    - _Requirements: 5.1-5.7, 5.12_

  - [~] 5.2 建立 api-service.js - 主鍵查詢與寫入函式
    - 實作 getMemberById：GetItemCommand 查詢 inbr_member
    - 實作 getVendorById：GetItemCommand 查詢 cms_service_vendor
    - 實作 createOrder：PutItemCommand 寫入 mms_order_record
    - 實作 updateOrderStatus：UpdateItemCommand 更新 order_status 與 upd_time
    - 所有函式回傳統一 ApiResponse 結構
    - _Requirements: 5.8-5.12_

  - [ ]* 5.3 撰寫 Property Test: GSI Query Filter Correctness
    - **Property 5: GSI Query Filter Correctness**
    - 驗證所有 GSI 查詢函式回傳的資料中，key 欄位值皆與查詢參數相符
    - **Validates: Requirements 5.1, 5.2, 5.5, 5.6, 5.7**

  - [ ]* 5.4 撰寫 Property Test: Time-Sorted Query Ordering
    - **Property 6: Time-Sorted Query Ordering**
    - 驗證 getRepliesByAssignment 與 getStatusLogByFeedback 回傳結果依時間升序排列
    - **Validates: Requirements 5.3, 5.4**

  - [ ]* 5.5 撰寫 Property Test: Order Creation Round-Trip
    - **Property 7: Order Creation Round-Trip**
    - 驗證透過 createOrder 寫入後再讀取，所有欄位值一致
    - **Validates: Requirements 5.10**

  - [ ]* 5.6 撰寫 Property Test: Order Status Update Correctness
    - **Property 8: Order Status Update Correctness**
    - 驗證 updateOrderStatus 後讀取 order_status 欄位等於新狀態值
    - **Validates: Requirements 5.11**

  - [ ]* 5.7 撰寫 Property Test: API Response Structure Invariant
    - **Property 9: API Response Structure Invariant**
    - 驗證所有 API 函式回傳物件皆包含 success 布林值，且成功時有 data 陣列、失敗時有 error 字串
    - **Validates: Requirements 5.12**

- [ ] 6. 實作 AWS CLI 建表 Shell 腳本
  - [-] 6.1 建立 create-tables.sh
    - 撰寫完整 bash 腳本，包含 10 張資料表的 `aws dynamodb create-table` 指令
    - 每個指令包含 `--region us-west-2` 與 `--billing-mode PAY_PER_REQUEST`
    - 包含所有 GSI 定義（--global-secondary-indexes）
    - 加入執行權限說明與使用方式註解
    - _Requirements: 6.1-6.4_

- [~] 7. Final Checkpoint - 整體驗證
  - 確保所有檔案語法正確、模組間引用一致，確認 seed-data 跨表外鍵參照正確，ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- All code uses Node.js with @aws-sdk/client-dynamodb
- 所有範例資料使用台灣在地假資料與 ISO 8601 時間戳記
- 部署腳本支援冪等執行（已存在的資料表會被跳過）

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "6.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "5.1"] },
    { "id": 5, "tasks": ["5.2"] },
    { "id": 6, "tasks": ["5.3", "5.4", "5.5", "5.6", "5.7"] }
  ]
}
```
