# Tech Stack - Aî 智慧社區服務平台（純網頁版）

## 核心技術

| 技術 | 用途 |
|------|------|
| HTML5 | 頁面結構 |
| CSS3 | 樣式與 RWD 響應式設計 |
| Vanilla JavaScript (ES6+) | 前端互動邏輯，零框架依賴 |
| PHP 8.x | 後端 API（XAMPP 內建）|
| MySQL / MariaDB | 資料庫（XAMPP 內建）|

## 部署環境

| 項目 | 選擇 |
|------|------|
| Web Server | Apache（XAMPP 內建）|
| 執行路徑 | `c:\xampp\htdocs\List.append-Us-\ai-community-web\` |
| 資料庫管理 | phpMyAdmin（XAMPP 內建）|

## 前端架構

### 頁面路由
- 多頁應用（MPA），每個功能對應一個 .html 檔案
- 無 SPA 框架，以原生 DOM 操作為主

### CSS 架構
- Mobile-first RWD，max-width 480px 模擬手機 App 體驗
- CSS 變數管理色彩主題
- 每個功能模組獨立 CSS 檔案

### JavaScript 模組
- 使用原生 ES6 模組（或全域命名空間）
- fetch API 與後端通訊
- 模組化分離：auth、chat、services、orders、form-renderer

## 後端架構

### API 設計
- RESTful JSON API
- 統一回傳格式：`{ success, data, message }`
- PHP Session 管理認證狀態

### 資料庫
- MySQL / MariaDB
- PDO 預處理語句防止 SQL Injection
- 敏感欄位 AES-256 GCM 加密 + Hash 儲存
- UUID 作為主要識別碼

## 編碼規範

- HTML：語意化標籤、ARIA 無障礙屬性
- CSS：BEM-like 命名或功能性命名
- JS：camelCase 變數/函式、PascalCase 類別
- PHP：snake_case 變數、PSR-12 風格
- 中文 UI 文字直接寫在 HTML 中
- API 端點統一放置在 `php/api/` 目錄

## 注意事項

- 本專案為黑客松 MVP，部分功能使用 alert() 或 mock data 模擬
- XAMPP 本地開發，無需額外安裝
- 前後端同一伺服器，無 CORS 問題
