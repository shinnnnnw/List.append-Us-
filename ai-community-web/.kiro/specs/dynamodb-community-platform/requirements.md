# Requirements Document

## Introduction

本文件定義在 AWS DynamoDB (us-west-2) 上建立智慧社區服務平台資料庫的需求。系統包含 10 張 DynamoDB 資料表，對應既有 MySQL 資料庫之核心業務實體（會員、廠商帳號、服務廠商、諮詢單、派案、回覆、狀態歷程、評價、訂單、縣市區域），並提供 Node.js 部署腳本（含範例資料植入）及前端可呼叫之 API 查詢函式。

## Glossary

- **Deployment_Script**: 使用 @aws-sdk/client-dynamodb 的 Node.js 腳本，負責建立資料表與植入範例資料
- **Seed_Data**: 每張資料表 5-10 筆台灣在地假資料，使用 ISO 8601 時間戳記
- **API_Service_Module**: 封裝 DynamoDB CRUD 與查詢操作的 Node.js 函式庫，供前端呼叫
- **Table_Schema**: DynamoDB 資料表定義，包含 Partition Key、Sort Key 及 Global Secondary Indexes
- **PAY_PER_REQUEST**: DynamoDB 計費模式，按實際讀寫次數付費，無須預先佈建容量
- **GSI**: Global Secondary Index，允許以非主鍵欄位進行高效查詢
- **Platform**: Aî 智慧社區服務平台

## Requirements

### Requirement 1: DynamoDB 資料表建立

**User Story:** As a 後端開發者, I want 透過 AWS CLI 指令建立 10 張 DynamoDB 資料表, so that 平台資料可以儲存在 DynamoDB 上供後續服務使用

#### Acceptance Criteria

1. THE Deployment_Script SHALL 在 us-west-2 區域建立名為 inbr_member 的資料表，使用 inbr_account_id (String) 作為 Partition Key
2. THE Deployment_Script SHALL 在 us-west-2 區域建立名為 pms_vendor_account 的資料表，使用 account_id (Number) 作為 Partition Key
3. THE Deployment_Script SHALL 在 us-west-2 區域建立名為 cms_service_vendor 的資料表，使用 vendor_id (Number) 作為 Partition Key
4. THE Deployment_Script SHALL 在 us-west-2 區域建立名為 pms_form_feedback 的資料表，使用 feedback_no (String) 作為 Partition Key
5. THE Deployment_Script SHALL 在 us-west-2 區域建立名為 pms_case_assignment 的資料表，使用 assignment_id (Number) 作為 Partition Key
6. THE Deployment_Script SHALL 在 us-west-2 區域建立名為 pms_case_reply 的資料表，使用 reply_id (Number) 作為 Partition Key
7. THE Deployment_Script SHALL 在 us-west-2 區域建立名為 pms_case_status_log 的資料表，使用 log_id (Number) 作為 Partition Key
8. THE Deployment_Script SHALL 在 us-west-2 區域建立名為 pms_case_review 的資料表，使用 review_id (Number) 作為 Partition Key
9. THE Deployment_Script SHALL 在 us-west-2 區域建立名為 mms_order_record 的資料表，使用 record_id (Number) 作為 Partition Key
10. THE Deployment_Script SHALL 在 us-west-2 區域建立名為 sys_district 的資料表，使用 county_code (String) 作為 Partition Key 並使用 code (String) 作為 Sort Key
11. THE Deployment_Script SHALL 為所有資料表設定 BillingMode 為 PAY_PER_REQUEST

### Requirement 2: Global Secondary Indexes 建立

**User Story:** As a 後端開發者, I want 資料表具備 GSI 以支援常見查詢模式, so that 前端能以非主鍵欄位高效查詢資料

#### Acceptance Criteria

1. THE Deployment_Script SHALL 為 mms_order_record 資料表建立名為 GSI_inbr_account_id 的 GSI，使用 inbr_account_id (String) 作為 Partition Key 並使用 order_time (String) 作為 Sort Key
2. THE Deployment_Script SHALL 為 pms_case_assignment 資料表建立名為 GSI_feedback_no 的 GSI，使用 feedback_no (String) 作為 Partition Key
3. THE Deployment_Script SHALL 為 pms_case_assignment 資料表建立名為 GSI_vendor_id 的 GSI，使用 vendor_id (Number) 作為 Partition Key
4. THE Deployment_Script SHALL 為 pms_case_reply 資料表建立名為 GSI_assignment_id 的 GSI，使用 assignment_id (Number) 作為 Partition Key 並使用 reply_time (String) 作為 Sort Key
5. THE Deployment_Script SHALL 為 pms_case_status_log 資料表建立名為 GSI_feedback_no 的 GSI，使用 feedback_no (String) 作為 Partition Key 並使用 change_time (String) 作為 Sort Key
6. THE Deployment_Script SHALL 為 pms_case_review 資料表建立名為 GSI_vendor_id 的 GSI，使用 vendor_id (Number) 作為 Partition Key
7. THE Deployment_Script SHALL 為 pms_form_feedback 資料表建立名為 GSI_inbr_account_id 的 GSI，使用 inbr_account_id (String) 作為 Partition Key 並使用 cre_time (String) 作為 Sort Key
8. THE Deployment_Script SHALL 為 pms_vendor_account 資料表建立名為 GSI_vendor_id 的 GSI，使用 vendor_id (Number) 作為 Partition Key

### Requirement 3: 範例資料植入

**User Story:** As a 後端開發者, I want 每張資料表有 5-10 筆台灣在地假資料, so that 開發與測試階段可以驗證查詢邏輯正確性

#### Acceptance Criteria

1. THE Seed_Data SHALL 為每張資料表包含 5 至 10 筆範例記錄
2. THE Seed_Data SHALL 使用台灣在地假資料（包含台灣姓名、台灣地址、台灣電話格式）
3. THE Seed_Data SHALL 使用 ISO 8601 格式表示所有時間戳記欄位
4. THE Seed_Data SHALL 為 sys_district 資料表包含多個縣市的行政區資料，涵蓋台北市、新北市及桃園市
5. THE Seed_Data SHALL 確保跨資料表的外鍵參照關係一致（例如 pms_case_assignment 中的 feedback_no 對應 pms_form_feedback 中的既有記錄）
6. THE Seed_Data SHALL 為 mms_order_record 包含多種 order_type 與 order_status 組合的範例

### Requirement 4: Node.js 部署腳本

**User Story:** As a 後端開發者, I want 一鍵執行的 Node.js 部署腳本, so that 可以快速在新環境建立完整的 DynamoDB 資料表結構與範例資料

#### Acceptance Criteria

1. THE Deployment_Script SHALL 使用 @aws-sdk/client-dynamodb 套件與 DynamoDB 互動
2. THE Deployment_Script SHALL 在執行時依序建立所有 10 張資料表，並等待每張資料表進入 ACTIVE 狀態後再繼續
3. IF 資料表已經存在, THEN THE Deployment_Script SHALL 跳過該資料表建立並記錄提示訊息
4. THE Deployment_Script SHALL 在所有資料表建立完成後執行範例資料植入
5. THE Deployment_Script SHALL 使用 BatchWriteItem 操作進行範例資料批次寫入
6. THE Deployment_Script SHALL 將 AWS Region 設定為 us-west-2
7. IF 部署過程發生錯誤, THEN THE Deployment_Script SHALL 將錯誤訊息輸出至 console 並以非零退出碼結束

### Requirement 5: API 查詢函式

**User Story:** As a 前端開發者, I want 封裝完善的 API 查詢函式, so that 前端可以直接呼叫這些函式存取 DynamoDB 資料

#### Acceptance Criteria

1. THE API_Service_Module SHALL 提供 getOrdersByMember 函式，透過 GSI_inbr_account_id 查詢指定會員的所有訂單記錄
2. THE API_Service_Module SHALL 提供 getAssignmentsByFeedback 函式，透過 GSI_feedback_no 查詢指定諮詢單的所有派案記錄
3. THE API_Service_Module SHALL 提供 getRepliesByAssignment 函式，透過 GSI_assignment_id 查詢指定派案的所有回覆記錄（依回覆時間排序）
4. THE API_Service_Module SHALL 提供 getStatusLogByFeedback 函式，透過 GSI_feedback_no 查詢指定諮詢單的狀態歷程（依變更時間排序）
5. THE API_Service_Module SHALL 提供 getReviewsByVendor 函式，透過 GSI_vendor_id 查詢指定廠商的所有評價記錄
6. THE API_Service_Module SHALL 提供 getDistrictsByCounty 函式，使用 county_code 作為 Partition Key 查詢指定縣市下所有行政區
7. THE API_Service_Module SHALL 提供 getFeedbackByMember 函式，透過 GSI_inbr_account_id 查詢指定會員的所有諮詢單
8. THE API_Service_Module SHALL 提供 getMemberById 函式，透過主鍵查詢指定會員資料
9. THE API_Service_Module SHALL 提供 getVendorById 函式，透過主鍵查詢指定廠商資料
10. THE API_Service_Module SHALL 提供 createOrder 函式，將新訂單記錄寫入 mms_order_record 資料表
11. THE API_Service_Module SHALL 提供 updateOrderStatus 函式，更新指定訂單的 order_status 欄位
12. WHEN API 函式執行查詢時, THE API_Service_Module SHALL 回傳結構化的 JSON 結果物件，包含 success 布林值與 data 陣列或 error 訊息

### Requirement 6: AWS CLI 建表指令文件

**User Story:** As a DevOps 工程師, I want 獨立的 AWS CLI 建表指令文件, so that 可以在無 Node.js 環境時手動建立資料表

#### Acceptance Criteria

1. THE Deployment_Script SHALL 提供獨立的 Shell 腳本檔案，包含所有 10 張資料表的 aws dynamodb create-table CLI 指令
2. THE Deployment_Script SHALL 在每個 CLI 指令中指定 --region us-west-2 參數
3. THE Deployment_Script SHALL 在每個 CLI 指令中指定 --billing-mode PAY_PER_REQUEST 參數
4. THE Deployment_Script SHALL 在 CLI 指令中包含所有 GSI 定義
