# Implementation Plan: Order Cancel

## Overview

實作訂單取消功能：後端 Lambda 新增 `POST /orders/:id/cancel` 路由與 handler，前端 API 模組新增 `cancelOrder` 方法，前端 orders.js 替換模擬行為為真實 API 呼叫並修正取消按鈕顯示條件。

## Tasks

- [ ] 1. Backend — Lambda cancel route
  - [~] 1.1 Add `UpdateItemCommand` import and `handleCancelOrder` handler to `lambda/chat/index.mjs`
    - Import `UpdateItemCommand` from `@aws-sdk/client-dynamodb`
    - Add route matching: `POST /orders/:id/cancel` (placed before existing `GET /orders/:id`)
    - Implement `handleCancelOrder(orderId, body)` with validation (existence → ownership → status) and `UpdateItemCommand` to set `order_status='90'` + `upd_time`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ] 2. Frontend — API cancel method
  - [~] 2.1 Add `cancelOrder(orderId)` method to `js/api.js`
    - Add method after `createOrder` that POSTs to `/orders/${orderId}/cancel` with `inbr_account_id` from localStorage (default `'MBR001'`)
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. Frontend — Orders UI integration
  - [~] 3.1 Replace mock `cancelOrder` in `js/orders.js` with real API call
    - Add `_cancelInProgress` flag to prevent duplicate submissions
    - Call `API.cancelOrder(orderId)`, handle success (toast + navigate) and failure (error toast)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [~] 3.2 Fix cancel button visibility status array in `js/orders.js`
    - Change `['01', '02', '03', '11', '12', '13']` to `['01', '02', '03', '04']` (Cancellable_Status)
    - _Requirements: 4.1, 4.2_

- [~] 4. Checkpoint — Verify integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 5. Property-based tests
  - [ ]* 5.1 Write property test: non-existent order returns 404
    - **Property 1: Non-existent order returns 404**
    - **Validates: Requirements 1.2**

  - [ ]* 5.2 Write property test: ownership mismatch returns 403
    - **Property 2: Ownership mismatch returns 403**
    - **Validates: Requirements 1.3**

  - [ ]* 5.3 Write property test: non-cancellable status returns 400
    - **Property 3: Non-cancellable status returns 400**
    - **Validates: Requirements 1.4**

  - [ ]* 5.4 Write property test: valid cancellation updates status
    - **Property 4: Valid cancellation updates status and returns success**
    - **Validates: Requirements 1.5, 1.6**

  - [ ]* 5.5 Write property test: cancel button visibility
    - **Property 5: Cancel button visibility follows cancellable status**
    - **Validates: Requirements 4.1, 4.2**

- [~] 6. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- The design uses JavaScript — all implementation in JS/ESM

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.2"] },
    { "id": 2, "tasks": ["3.1"] },
    { "id": 3, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5"] }
  ]
}
```
