# Requirements Document

## Introduction

修復廠商後台功能，讓合作服務廠商能透過後台登入、查看消費者諮詢單、案件狀態，並進一步聯繫消費者或更新案件狀態。包含修正登入邏輯、實作案件自動分派（媒合），以及前端串接真實 API 取代 mock 資料。

## Glossary

- **Vendor_Account_Table**: DynamoDB 表 `pms_vendor_account`，PK: account_id (N)，儲存廠商帳號資料
- **Vendor_Table**: DynamoDB 表 `cms_service_vendor`，PK: vendor_id (N)，儲存廠商主檔（含 service_type、rating_avg、service_counties）
- **Feedback_Table**: DynamoDB 表 `pms_form_feedback`，PK: feedback_no (S)，儲存消費者諮詢單
- **Assignment_Table**: DynamoDB 表 `pms_case_assignment`，PK: assignment_id (N)，GSI: GSI_vendor_id (vendor_id: N)、GSI_feedback_no (feedback_no: S)
- **AutoAssignVendor**: 自動媒合函式，根據服務類型和地區條件，從 Vendor_Table 篩選合適廠商並寫入 Assignment_Table
- **SERVICE_NAME_TO_TYPE**: 服務名稱文字對應到 cms_service_vendor.service_type 數字的映射表

## Requirements

### Requirement 1: 修正廠商登入

**User Story:** As a 合作廠商, I want 用帳號密碼登入後台, so that 我可以查看指派給我的案件。

#### Acceptance Criteria

1. WHEN a POST request is received at `/admin/login` with body `{ username, password }`, THE Lambda SHALL scan Vendor_Account_Table where `account_no = username`
2. IF no matching account is found, THEN THE Lambda SHALL return HTTP 401 with message "帳號或密碼錯誤"
3. IF the account's `password_hash` field does not equal the provided `password` (明文比對), THEN THE Lambda SHALL return HTTP 401 with message "帳號或密碼錯誤"
4. IF the matching account's `is_enable` field is not `'1'`, THEN THE Lambda SHALL return HTTP 401 with message "此帳號已停用"
5. WHEN all checks pass (account exists, password matches, account enabled), THE Lambda SHALL query Vendor_Table using the account's `vendor_id` to get the shop name, and return HTTP 200 with `{ vendorId, name, shopName }`

#### 測試帳號清單

| account_no | password | vendor_id | 對應廠商 |
|---|---|---|---|
| clean01 | demo1234 | 1 | 潔淨居家清潔 |
| appliance01 | demo1234 | 2 | 全能家電清洗 |
| delivery01 | demo1234 | 3 | 快速寄件服務 |
| restaurant01 | demo1234 | 4 | 饗宴樓 |
| repair01 | demo1234 | 5 | 水電王修繕 |
| shop01 | demo1234 | 6 | 統一購物商城 |
| pharmacy01 | demo1234 | 7 | 康健藥局 |
| taxi01 | demo1234 | 8 | 順風叫車 |

### Requirement 2: 案件自動分派（autoAssignVendor）

**User Story:** As a 系統, I want 消費者建立需求時自動媒合適合的廠商, so that 廠商後台能即時看到新案件。

#### Acceptance Criteria

1. WHEN a feedback is created (via `handleFeedback` or AI chat `[SUBMIT]`), THE Lambda SHALL call `autoAssignVendor(feedbackNo, service, county)` after successfully writing the feedback record
2. THE autoAssignVendor function SHALL convert the `service` text to a `service_type` number using SERVICE_NAME_TO_TYPE mapping:
   - 外送/訂位/餐廳訂位 → 6
   - 清潔/居家清潔 → 1
   - 家電清洗 → 2
   - 修繕/水電修繕 → 10
   - 宅配/包裹寄送/寄件 → 3
   - 購物/商品購買 → 11
   - 叫車/計程車 → 13
   - 領藥/代領藥品 → 12
3. THE autoAssignVendor function SHALL scan Vendor_Table where `service_type = X` AND `is_enable = '1'`
4. IF a `county` parameter is provided and non-empty, THEN THE autoAssignVendor function SHALL further filter vendors whose `service_counties` list contains that county value
5. THE autoAssignVendor function SHALL sort matching vendors by `rating_avg` descending
6. THE autoAssignVendor function SHALL select the top 2-3 vendors (or all if fewer than 3 match) and create one Assignment_Table record for each:
   - `assignment_id`: Date.now() + index offset (確保唯一)
   - `feedback_no`: the feedback_no being assigned
   - `vendor_id`: the vendor's vendor_id (Number)
   - `status`: '01' (待回應)
   - `cre_time`: current ISO timestamp
7. IF no vendors match the service_type, THEN THE autoAssignVendor function SHALL log a warning and return without creating any assignment records (案件留在待媒合狀態，不報錯)
8. THE autoAssignVendor function SHALL NOT block the parent request response — assignment creation failures are logged but do not cause the feedback/order creation to fail

### Requirement 3: handleAdminCases 依廠商篩選

**User Story:** As a 合作廠商, I want 只看到指派給我的案件, so that 我不會看到不相關的案件造成混淆。

#### Acceptance Criteria

1. WHEN a GET request is received at `/admin/cases` with query parameter `vendor_id`, THE Lambda SHALL query Assignment_Table using GSI_vendor_id where `vendor_id = X`
2. FOR EACH assignment record returned, THE Lambda SHALL query Feedback_Table using the `feedback_no` to get the full case details (contact info, description, status, etc.)
3. THE Lambda SHALL return a combined array where each item contains: assignment info (assignment_id, status, vendor_id) merged with feedback info (customerName, customerPhone, service, description, address, createdAt)
4. IF `vendor_id` query parameter is missing, THE Lambda SHALL return all cases from Feedback_Table (backward compatible with current behavior for debugging)
5. THE Lambda SHALL support optional `status` query parameter to further filter cases by assignment status

### Requirement 4: 前端廠商後台串接真實 API

**User Story:** As a 合作廠商, I want 後台顯示即時的真實案件資料, so that 我看到的是最新的消費者需求。

#### Acceptance Criteria

1. WHEN vendorShowDashboard() is called after login, THE frontend SHALL call `GET /admin/cases?vendor_id={vendorId}` using the logged-in vendor's vendorId from localStorage
2. THE frontend SHALL replace the hardcoded `vendorCases` mock array with the API response data
3. WHEN a vendor updates a case status (承接/處理中/完成), THE frontend SHALL call `POST /admin/cases/update` with `{ feedback_no, status }` and refresh the case list on success
4. WHEN a vendor replies to a case, THE frontend SHALL call `POST /admin/cases/reply` with `{ feedback_no, content }` and refresh the case detail on success
5. IF the API call fails, THE frontend SHALL display an error toast and maintain the current UI state

### Requirement 5: 技術限制

**User Story:** As a 開發者, I want 改動範圍明確且可分階段部署, so that 風險可控且可逐步驗證。

#### Acceptance Criteria

1. THE Lambda modifications SHALL be contained within `lambda/chat/index.mjs` (no new Lambda functions)
2. THE frontend modifications SHALL be contained within `index.html` (the vendor backend view and inline JS)
3. THE autoAssignVendor function SHALL be implemented as a standalone async function within index.mjs, callable from multiple locations
4. ALL database operations SHALL use existing DynamoDB tables and GSIs (no schema changes needed)
5. THE implementation SHALL be deployable in phases: Phase 1 (login fix), Phase 2 (auto-assign), Phase 3 (admin cases + frontend)
