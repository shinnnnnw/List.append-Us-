# Implementation Plan: Vendor Admin

## Overview

修復廠商後台功能，分四個階段實作：Phase 1 修正登入、Phase 2 實作自動媒合、Phase 3 修正案件查詢 API、Phase 4 前端串接真實 API。每個階段獨立可部署、可測試。

## Tasks

- [ ] 1. Phase 1 — 修正廠商登入 (handleAdminLogin)
  - [ ] 1.1 重寫 handleAdminLogin 函式
    - 改查 pms_vendor_account 表（Scan by account_no）
    - 判斷順序：帳號不存在 → 密碼錯誤 → 帳號停用 → 成功
    - 成功時查 cms_service_vendor 取 shopName
    - 回傳 { vendorId, name, shopName }
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 1.2 Phase 1 部署與驗證
    - node --check index.mjs → zip → aws lambda update-function-code
    - 用 curl 測試：clean01/demo1234 登入成功、錯誤帳號回 401、錯誤密碼回 401
    - git diff → 確認 → git commit "fix: handleAdminLogin 改查 pms_vendor_account"

- [ ] 2. Phase 2 — 實作自動媒合 (autoAssignVendor)
  - [ ] 2.1 新增 SERVICE_NAME_TO_TYPE 和 FORM_ID_TO_SERVICE_TYPE 常數
    - SERVICE_NAME_TO_TYPE: 外送→6, 清潔→1, 家電清洗→2, 修繕→10, 宅配→3, 購物→11, 叫車→13, 領藥→12
    - FORM_ID_TO_SERVICE_TYPE: 1→6, 2→11, 3→1, 4→3
    - _Requirements: 2.2_

  - [ ] 2.2 實作 autoAssignVendor(feedbackNo, serviceType, county) 函式
    - Scan cms_service_vendor where service_type=X AND is_enable='1'
    - 若有 county 參數，filter service_counties 含 county
    - 依 rating_avg 降序排序
    - 取前 min(N, 3) 筆建立 pms_case_assignment 記錄
    - 無匹配時 log warning 並 return（不報錯）
    - 內部 try/catch 隔離錯誤，不影響呼叫端
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ] 2.3 在 handleFeedback 呼叫 autoAssignVendor
    - 在 dbPut feedback 之後、return 之前
    - serviceType 用 FORM_ID_TO_SERVICE_TYPE[form_id]
    - county 從 body.contact_address_county 取得
    - 使用 await（非 fire-and-forget）
    - _Requirements: 2.1_

  - [ ] 2.4 在 AI Chat [SUBMIT] 區塊呼叫 autoAssignVendor
    - 在 dbPut feedback 之後、dbPut order 之前
    - serviceType 用 SERVICE_NAME_TO_TYPE[service]
    - county 暫時傳空字串（AI 對話建單時通常沒有明確的地址欄位）
    - 使用 await（非 fire-and-forget）
    - _Requirements: 2.1_

  - [ ] 2.5 Phase 2 部署與驗證
    - node --check → zip → deploy
    - 用消費者帳號在 AI 對話完成一筆建單，然後 CloudShell 查 pms_case_assignment 確認有新 assignment 記錄
    - git diff → 確認 → git commit "feat: 實作 autoAssignVendor 自動媒合邏輯"

- [ ] 3. Phase 3 — 修正案件查詢 API (handleAdminCases)
  - [ ] 3.1 重寫 handleAdminCases(qs) 函式
    - 有 vendor_id 時：Query GSI_vendor_id → 對每筆 Get pms_form_feedback → 合併回傳
    - 無 vendor_id 時：向下相容 Scan 全部 pms_form_feedback
    - 支援 status 篩選
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 3.2 Phase 3 部署與驗證
    - node --check → zip → deploy
    - 用 curl 測試 GET /admin/cases?vendor_id=1，確認回傳 Phase 2 建立的 assignment 對應的案件
    - git diff → 確認 → git commit "feat: handleAdminCases 改用 GSI_vendor_id 查詢"

- [ ] 4. Phase 4 — 前端廠商後台串接真實 API
  - [ ] 4.1 修改 vendorShowDashboard() 改為呼叫 API
    - 移除 hardcoded vendorCases 陣列
    - 改呼叫 GET /admin/cases?vendor_id={vendorId}
    - API 回傳的資料格式對應到現有的渲染邏輯
    - _Requirements: 4.1, 4.2_

  - [ ] 4.2 修改案件操作按鈕串接 API
    - 承接/處理中/完成 → POST /admin/cases/update { feedback_no, status }
    - 廠商回覆 → POST /admin/cases/reply { feedback_no, content }
    - 操作成功後 refresh 案件列表
    - API 失敗顯示 toast
    - _Requirements: 4.3, 4.4, 4.5_

  - [ ] 4.3 Phase 4 部署與驗證
    - git push → GitHub Actions 自動部署前端
    - 用瀏覽器完整測試：消費者建需求 → 廠商登入 → 看到案件 → 更新狀態 → 回覆
    - git diff → 確認 → git commit "feat: 廠商後台串接真實 API"

- [ ] 5. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - 完整 E2E 驗證流程：消費者 AI 對話建單 → 確認自動媒合 → 廠商登入看到案件 → 更新狀態

## Notes

- 每個 Phase 完成後獨立部署、測試、commit，不累積
- Lambda 改動需走 node --check → zip → deploy 流程
- 前端改動 push 後由 GitHub Actions 自動部署
- autoAssignVendor 使用 await（非 fire-and-forget），但內部 error-isolated
- handleCreateOrder 故意不觸發 autoAssignVendor（已確定廠商的訂單不需媒合）

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "2.2"] },
    { "id": 3, "tasks": ["2.3", "2.4"] },
    { "id": 4, "tasks": ["2.5"] },
    { "id": 5, "tasks": ["3.1"] },
    { "id": 6, "tasks": ["3.2"] },
    { "id": 7, "tasks": ["4.1", "4.2"] },
    { "id": 8, "tasks": ["4.3"] }
  ]
}
```
