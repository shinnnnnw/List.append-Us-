# Implementation Plan: Responsive Chat Layout

## Overview

純 CSS/HTML 修正，讓首頁主控台的 AI 對話區域不需捲動即可看到，並加入響應式斷點支援手機、平板、桌面三種裝置。

## Tasks

- [ ] 1. 修改 HTML 結構，加入 dashboard-services wrapper
  - [~] 1.1 在 `index.html` 的 `.page-content` 內用 `<div class="dashboard-services">` 包裹 section-title 和 service-grid
    - 將 `<h3 class="section-title">` 和 `<div id="service-grid">` 移入新的 `.dashboard-services` 容器
    - 保持 chat-section 不變
    - _Requirements: 3.1, 3.2, 4.1_

- [ ] 2. 修改 style.css 加入響應式斷點和 flex 佈局
  - [~] 2.1 將 `:root` 中的 `--max-width: 480px` 保留作為預設值，新增 media query 覆寫
    - 加入 `@media (min-width: 576px)` 設定 `--max-width: 768px`
    - 加入 `@media (min-width: 1025px)` 設定 `--max-width: 960px`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [~] 2.2 修改 `.page-content` 為 flex column 並限制高度
    - 加入 `display: flex; flex-direction: column; height: calc(100vh - var(--nav-height)); overflow: hidden;`
    - _Requirements: 1.1, 1.2_
  - [~] 2.3 加入桌面斷點下 `.page-content` 切換為 flex row
    - 在 `@media (min-width: 1025px)` 中設定 `flex-direction: row; gap: 20px; align-items: stretch;`
    - _Requirements: 3.1_
  - [~] 2.4 加入 `.dashboard-services` 的響應式樣式
    - 預設 `flex-shrink: 0`
    - 手機 (`max-width: 575px`): `max-height: 30%; overflow-y: auto;`
    - 桌面 (`min-width: 1025px`): `width: 35%; max-height: none; overflow-y: auto;`
    - _Requirements: 3.3, 4.1, 4.2_

- [ ] 3. 修改 chat.css 讓聊天區域填滿剩餘空間
  - [~] 3.1 移除 `.chat-section` 原有的固定 height 計算，改用 flex: 1
    - 設定 `flex: 1; min-height: 200px; overflow: hidden;`
    - 移除原本的 `height: calc(100vh - var(--header-height) - var(--nav-height) - 160px);`
    - _Requirements: 1.1, 1.2, 1.3, 4.3_
  - [~] 3.2 加入桌面斷點下的 chat-section 樣式
    - 在 `@media (min-width: 1025px)` 中確保 chat-section 用 `flex: 1` 填滿右側
    - _Requirements: 3.1, 3.3_

- [ ] 4. 修改 services.css 限制快捷服務格子高度
  - [~] 4.1 為 `.service-grid` 加入手機版高度限制
    - 加入 `max-height: 30vh; overflow-y: auto; flex-shrink: 0;`
    - _Requirements: 4.1, 4.2_
  - [~] 4.2 加入桌面斷點下 service-grid 按鈕改為兩列排列
    - 在 `@media (min-width: 1025px)` 中設定 `.service-btn` 為 `width: calc(50% - 8px)`
    - 移除 max-height 限制
    - _Requirements: 3.1, 3.3_

- [~] 5. Checkpoint - 手動驗證三種裝置尺寸
  - Ensure all tests pass, ask the user if questions arise.
  - 在瀏覽器 DevTools 中以 375px、768px、1280px 寬度檢查版面
  - 確認 AI 對話區域在所有尺寸下不需捲動即可看到

- [ ]* 6. 撰寫 CSS 響應式屬性測試
  - [ ]* 6.1 撰寫 breakpoint max-width 測試
    - **Property 1: Breakpoint max-width mapping**
    - 驗證不同 viewport 寬度下 page-wrapper 的 computed max-width 是否正確
    - **Validates: Requirements 2.1, 2.2, 2.3**
  - [ ]* 6.2 撰寫桌面佈局寬度比例測試
    - **Property 2: Service grid width ratio in desktop layout**
    - 驗證 viewport > 1024px 時 service grid 寬度不超過容器的 35%
    - **Validates: Requirements 3.3**
  - [ ]* 6.3 撰寫手機版高度限制測試
    - **Property 3: Service grid height constraint on mobile**
    - 驗證 viewport < 576px 時 dashboard-services 的 max-height 不超過可用空間的 30%
    - **Validates: Requirements 4.1**

- [~] 7. Final checkpoint - 完整驗證
  - Ensure all tests pass, ask the user if questions arise.
  - 確認所有斷點下版面正確，無 CSS 衝突

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 此修正為純 CSS/HTML 變更，不影響 JavaScript 邏輯
- 測試需要使用瀏覽器自動化工具（如 Playwright）來驗證不同 viewport 下的 computed styles
- 確保修改不影響其他頁面（services.html, orders.html 等）的現有樣式
