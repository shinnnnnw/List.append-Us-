# Requirements Document

## Introduction

取消訂單功能，讓住戶可以在訂單尚未完成/取消/退款的情況下取消該筆訂單。後端 Lambda 新增取消路由，前端串接真正的 API 取代目前的模擬行為。

## Glossary

- **Lambda_API**: AWS Lambda 上的 ESM 格式後端 API handler（index.mjs），負責路由與商業邏輯
- **Frontend_Orders**: 前端訂單管理模組（orders.js），負責訂單列表與詳情的 UI 互動
- **Frontend_API**: 前端 API 封裝模組（api.js），負責統一處理 HTTP 請求
- **DynamoDB_Orders_Table**: DynamoDB 中的訂單資料表，record_id 為 Number 型別主鍵
- **Order_Status**: 訂單狀態代碼，01 待媒合、02 媒合中、03 已確認、04 進行中、80 已完成、90 已取消、99 已退款（定義於 js/config.js ORDER_STATUS）
- **Cancellable_Status**: 允許取消的訂單狀態集合，包含 01（待媒合）、02（媒合中）、03（已確認）、04（進行中）

## Requirements

### Requirement 1: Backend Cancel Order Route

**User Story:** As a resident, I want the backend to provide a cancel order endpoint, so that my cancel request is properly processed and persisted.

#### Acceptance Criteria

1. WHEN a POST request is received at `/orders/:id/cancel` with a valid body containing `inbr_account_id`, THE Lambda_API SHALL query DynamoDB_Orders_Table using `record_id` converted to Number type
2. IF the order does not exist in DynamoDB_Orders_Table, THEN THE Lambda_API SHALL return HTTP 404 with message "訂單不存在"
3. IF the order's `inbr_account_id` does not match the request body's `inbr_account_id`, THEN THE Lambda_API SHALL return HTTP 403 with message "無權操作此訂單"
4. IF the order's `order_status` is 80, 90, or 99, THEN THE Lambda_API SHALL return HTTP 400 with message "此訂單狀態無法取消"
5. WHEN the order passes all validation checks, THE Lambda_API SHALL update the order's `order_status` to '90' and `upd_time` to the current ISO timestamp in DynamoDB_Orders_Table
6. WHEN the order is successfully updated, THE Lambda_API SHALL return HTTP 200 with `success: true` and the updated order data
7. THE Lambda_API SHALL import `UpdateItemCommand` from `@aws-sdk/client-dynamodb` to perform the update operation

### Requirement 2: Frontend API Cancel Method

**User Story:** As a developer, I want a dedicated cancel order API method in the frontend, so that the cancel logic is encapsulated and reusable.

#### Acceptance Criteria

1. THE Frontend_API SHALL provide a `cancelOrder(orderId)` method that sends a POST request to `/orders/${orderId}/cancel`
2. WHEN `cancelOrder` is called, THE Frontend_API SHALL include the current user's `inbr_account_id` from localStorage in the request body
3. IF no user is found in localStorage, THEN THE Frontend_API SHALL use 'MBR001' as the default `inbr_account_id`

### Requirement 3: Frontend Cancel Order Integration

**User Story:** As a resident, I want to cancel an order from the order detail page and receive feedback, so that I know the cancellation was successful.

#### Acceptance Criteria

1. WHEN the user confirms the cancel action, THE Frontend_Orders SHALL call `API.cancelOrder(orderId)` with the order's `record_id`
2. WHEN the API returns `success: true`, THE Frontend_Orders SHALL display a success toast message "訂單已取消"
3. WHEN the API returns `success: true`, THE Frontend_Orders SHALL navigate to the orders list page after 1 second
4. IF the API returns `success: false`, THEN THE Frontend_Orders SHALL display an error toast with the API's error message
5. WHEN the cancel request is in progress, THE Frontend_Orders SHALL prevent duplicate submissions

### Requirement 4: Cancel Button Visibility

**User Story:** As a resident, I want the cancel button to only appear on cancellable orders, so that I am not confused by irrelevant actions.

#### Acceptance Criteria

1. WHILE the order's `order_status` is one of Cancellable_Status (01, 02, 03, 04), THE Frontend_Orders SHALL display the "取消訂單" button
2. WHILE the order's `order_status` is 80, 90, or 99, THE Frontend_Orders SHALL hide the "取消訂單" button
