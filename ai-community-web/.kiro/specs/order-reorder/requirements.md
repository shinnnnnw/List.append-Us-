# Requirements Document

## Introduction

「再次預約」功能讓已完成訂單的使用者，透過一鍵跳轉至首頁 AI 對話介面，並自動帶入原訂單服務上下文，跳過初始服務詢問步驟，直接進入確認/修改細節階段，最終由 AI 對話既有的 [SUBMIT] 機制完成建單。

## Glossary

- **Order_Detail_Page**: 訂單詳情頁面（order-detail.html），顯示單筆訂單完整資訊與操作按鈕
- **Reorder_Button**: 「再次預約」按鈕，出現於已完成訂單的操作區域
- **AI_Chat**: 首頁（index.html）中的 AI 智慧管家對話介面，負責多輪對話收集需求並建立訂單
- **Reorder_Parameter**: URL 查詢參數 `reorder`，攜帶原訂單編號（record_id）作為值
- **Order_Status_Completed**: 訂單狀態碼 '80'，表示訂單已完成
- **Service_Context_Message**: 根據原訂單服務資訊自動組成的用戶訊息，用於觸發 AI 對話預填上下文

## Requirements

### Requirement 1: 再次預約按鈕顯示條件

**User Story:** As a 住戶（消費者）, I want 只在已完成的訂單看到再次預約按鈕, so that 我不會誤操作未完成的訂單。

#### Acceptance Criteria

1. WHILE Order_Detail_Page 顯示一筆 order_status 為 '80' 的訂單, THE Reorder_Button SHALL 顯示於操作區域中
2. WHILE Order_Detail_Page 顯示一筆 order_status 不為 '80' 的訂單, THE Reorder_Button SHALL 隱藏不顯示
3. THE Reorder_Button SHALL 顯示文字「再次預約」

### Requirement 2: 再次預約按鈕跳轉行為

**User Story:** As a 住戶（消費者）, I want 點擊再次預約後跳轉到首頁 AI 對話, so that 我可以用自然語言快速重新預約相同服務。

#### Acceptance Criteria

1. WHEN 使用者點擊 Reorder_Button, THE Order_Detail_Page SHALL 導向 `index.html?reorder={record_id}`，其中 `{record_id}` 為該筆訂單的 record_id 值
2. THE Order_Detail_Page SHALL 不再跳轉至 `form.html?form_id=X`（移除舊有跳轉邏輯）

### Requirement 3: 首頁偵測 reorder 參數

**User Story:** As a 住戶（消費者）, I want 首頁能自動偵測 reorder 參數並啟動對話, so that 我不需要手動重複輸入服務需求。

#### Acceptance Criteria

1. WHEN 首頁載入且 URL 包含 `reorder` 參數, THE AI_Chat SHALL 呼叫 `GET /orders/{reorder_value}` 取得原訂單資料
2. WHEN 原訂單資料成功取得, THE AI_Chat SHALL 自動組成 Service_Context_Message 並以用戶訊息形式送入對話
3. THE Service_Context_Message SHALL 包含原訂單的 service_name 或 remark 描述，格式為「我想再次預約：{service_name}」
4. WHEN 首頁載入且 URL 不包含 `reorder` 參數, THE AI_Chat SHALL 以正常歡迎訊息流程啟動

### Requirement 4: reorder 參數取得訂單失敗處理

**User Story:** As a 住戶（消費者）, I want 即使原訂單查詢失敗也能正常使用 AI 對話, so that 系統不會因資料錯誤而卡住。

#### Acceptance Criteria

1. IF `GET /orders/{reorder_value}` 回傳錯誤或訂單不存在, THEN THE AI_Chat SHALL 以正常歡迎訊息流程啟動，不顯示錯誤給使用者
2. IF `GET /orders/{reorder_value}` 回傳錯誤或訂單不存在, THEN THE AI_Chat SHALL 於瀏覽器 console 記錄錯誤訊息供除錯使用

### Requirement 5: 技術限制約束

**User Story:** As a 開發者, I want 此功能不新增後端 API, so that 修改範圍最小化且部署風險低。

#### Acceptance Criteria

1. THE Order_Detail_Page SHALL 僅修改前端跳轉邏輯（orders.js），不新增後端 API 端點
2. THE AI_Chat SHALL 僅修改前端參數偵測與訊息送入邏輯（app.js 或 chat.js），不修改 Lambda 函數
3. THE AI_Chat SHALL 使用既有的 `GET /orders/:id` API 取得原訂單資料，該 API 回傳 `{ success, data }` 格式
