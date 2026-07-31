# Project Structure - Aî 智慧社區服務平台（純網頁版）

## 目錄結構

```
ai-community-web/
├── index.html                      # 首頁：登入 + AI 智慧管家主控台
├── services.html                   # 服務總覽頁：所有生活服務分類展示
├── service-detail.html             # 服務詳情頁：單一服務說明 + 立即預約
├── form.html                       # 動態表單頁：依 form_id 渲染彈性留資表單
├── orders.html                     # 訂單紀錄頁：歷史訂單列表 + 狀態追蹤
├── order-detail.html               # 訂單詳情頁：單筆訂單完整資訊
├── profile.html                    # 個人中心頁：帳號資訊、點數、設定
├── css/
│   ├── style.css                   # 全站共用樣式（RWD、色彩變數、基礎排版）
│   ├── login.css                   # 登入畫面樣式
│   ├── chat.css                    # AI 聊天介面樣式
│   ├── services.css                # 服務列表/詳情樣式
│   ├── form.css                    # 動態表單樣式
│   └── orders.css                  # 訂單相關樣式
├── js/
│   ├── app.js                      # 主程式進入點：路由初始化、全域事件
│   ├── auth.js                     # 認證模組：login/logout、呼叫 PHP API
│   ├── chat.js                     # AI 聊天模組：訊息收發、意圖辨識、表單引導
│   ├── services.js                 # 服務模組：服務列表渲染、分類篩選
│   ├── form-renderer.js            # 動態表單渲染器：根據 pms_form_topic 產生表單欄位
│   ├── orders.js                   # 訂單模組：訂單列表、狀態更新
│   ├── api.js                      # API 封裝：統一 fetch 請求至 php/api/
│   ├── config.js                   # 全域設定：API base URL、服務項目定義
│   └── utils.js                    # 工具函式：日期格式化、驗證、DOM helper
├── php/
│   ├── config.php                  # 資料庫連線設定（host、dbname、user、password）
│   ├── db.php                      # PDO 連線封裝 + 共用查詢 helper
│   ├── api/
│   │   ├── auth.php               # 登入/登出 API（驗證 uniopen token、建立 session）
│   │   ├── services.php           # 服務列表 API（GET 服務商 + 服務項目）
│   │   ├── forms.php              # 表單結構 API（GET form + topics + options）
│   │   ├── form-submit.php        # 表單送出 API（POST feedback 寫入 DB）
│   │   ├── orders.php             # 訂單列表 API（GET 用戶歷史訂單）
│   │   ├── order-detail.php       # 訂單詳情 API（GET 單筆訂單資料）
│   │   ├── districts.php          # 縣市區域 API（GET 縣市 + 行政區聯動資料）
│   │   ├── upload.php             # 圖片上傳 API（處理 multipart/form-data）
│   │   └── chat.php              # AI 聊天 API（接收訊息、回傳意圖辨識結果）
│   └── middleware/
│       └── auth-check.php         # 認證中介層：驗證 session/token 是否有效
├── assets/
│   ├── images/                     # 圖片資源（logo、icon、placeholder）
│   ├── uploads/                    # 使用者上傳檔案存放目錄
│   └── fonts/                      # 自訂字型（選用）
└── sql/
    ├── schema.sql                  # 完整資料庫 DDL（整合所有 table）
    └── seed.sql                    # 初始化範例資料（開發用）
```

## 頁面規劃

### 1. index.html — 首頁（登入 + AI 主控台）
| 區塊 | 說明 |
|------|------|
| `#view-login` | 品牌展示 + uniopen OAuth 一鍵授權登入按鈕 |
| `#view-dashboard` | 登入後主控台：Header（用戶名 + 累積點數）|
| `#service-grid` | 六大生活服務快捷按鈕（外送、訂位、清潔、修繕、宅配、購物）|
| `#chat-container` | AI 智慧管家對話介面 |
| `#chat-input` | 使用者輸入區 + 發送按鈕 |
| `#nav-bar` | 底部導覽列：首頁 / 服務 / 訂單 / 我的 |

### 2. services.html — 服務總覽頁
| 區塊 | 說明 |
|------|------|
| `#service-categories` | 服務商分類 Tab（清潔、寄件、餐廳訂位、商城購物、修繕、美食外送）|
| `#service-list` | 依分類顯示服務卡片（圖片 + 名稱 + 說明 + 立即預約按鈕）|

### 3. service-detail.html — 服務詳情頁
| 區塊 | 說明 |
|------|------|
| `#service-banner` | 服務圖片輪播 |
| `#service-info` | 服務名稱、描述、注意事項 |
| `#service-action` | 「立即預約」按鈕 → 導向 form.html?form_id=X |

### 4. form.html — 動態表單頁（核心功能）
| 區塊 | 說明 |
|------|------|
| `#form-header` | 表單標題 + 服務說明（intro_content）|
| `#form-notice` | 注意事項（notice_content）|
| `#form-body` | 依 pms_form_topic 動態渲染欄位 |
| `#form-terms` | 條款同意（terms_content）|
| `#form-submit` | 送出按鈕 → POST 至 php/api/form-submit.php |

**支援的表單題型（對應 pms_form_topic.type）：**
| type | 題型 | 渲染元件 |
|------|------|----------|
| 1 | 簡答題 | `<input type="text">` 含 regex 驗證 |
| 2 | 詳答題 | `<textarea>` |
| 3 | 單選題 | `<input type="radio">` 群組 |
| 4 | 複選題 | `<input type="checkbox">` 群組（支援雙層 subOption）|
| 5 | 地區選單 | 縣市 + 行政區 `<select>` 聯動 + 地址明細 |
| 6 | 圖片上傳 | `<input type="file">` + 預覽，上傳至 php/api/upload.php |
| 7 | 日期選擇 | `<input type="date">` |
| 8 | 時間選擇 | `<input type="time">` |
| 9 | 日期時間 | `<input type="datetime-local">` |
| 10 | 聯絡資料 | 姓名 + 電話 + Email 組合欄位 |

### 5. orders.html — 訂單紀錄頁
| 區塊 | 說明 |
|------|------|
| `#order-tabs` | 狀態篩選 Tab（全部 / 處理中 / 已完成 / 已取消）|
| `#order-list` | 訂單卡片列表（訂單編號、服務名稱、日期、狀態標籤）|

### 6. order-detail.html — 訂單詳情頁
| 區塊 | 說明 |
|------|------|
| `#order-info` | 訂單基本資訊（編號、建立時間、狀態）|
| `#order-service` | 對應服務與表單回填內容 |
| `#order-timeline` | 訂單狀態時間軸 |
| `#order-actions` | 操作按鈕（取消訂單、再次預約）|

### 7. profile.html — 個人中心頁
| 區塊 | 說明 |
|------|------|
| `#user-info` | 帳號資訊（姓名、電話、Email）|
| `#user-points` | 累積點數與點數紀錄 |
| `#user-settings` | 通知設定、登出按鈕 |

## PHP 後端 API 說明

### 資料庫設定層
| 檔案 | 職責 |
|------|------|
| `php/config.php` | MySQL 連線參數（host、port、dbname、charset、user、password）|
| `php/db.php` | PDO 連線建立、預處理語句封裝、錯誤處理 |

### API 端點
| 檔案 | Method | 路徑 | 說明 |
|------|--------|------|------|
| `auth.php` | POST | `/php/api/auth.php?action=login` | 驗證 uniopen 授權、建立 session、回傳用戶資料 |
| `auth.php` | POST | `/php/api/auth.php?action=logout` | 銷毀 session |
| `services.php` | GET | `/php/api/services.php` | 回傳服務商 + 服務項目列表（cms_homepage_service_vendor + cms_homepage_service）|
| `services.php` | GET | `/php/api/services.php?id=X` | 回傳單一服務詳情 |
| `forms.php` | GET | `/php/api/forms.php?form_id=X` | 回傳表單結構（pms_form + topics + options）|
| `form-submit.php` | POST | `/php/api/form-submit.php` | 接收表單填寫資料，寫入 pms_form_feedback |
| `orders.php` | GET | `/php/api/orders.php` | 回傳當前用戶的訂單列表（mms_order_record）|
| `order-detail.php` | GET | `/php/api/order-detail.php?id=X` | 回傳單筆訂單詳情 |
| `districts.php` | GET | `/php/api/districts.php` | 回傳所有縣市；`?county=X` 回傳該縣市行政區 |
| `upload.php` | POST | `/php/api/upload.php` | 處理圖片上傳，存至 assets/uploads/，回傳檔案路徑 |
| `chat.php` | POST | `/php/api/chat.php` | 接收使用者訊息，執行意圖辨識，回傳 AI 回覆 + 建議表單 |

### 認證中介層
| 檔案 | 職責 |
|------|------|
| `php/middleware/auth-check.php` | 各 API 引入用，驗證 session 是否有效，無效回傳 401 |

### API 回傳格式（統一 JSON）
```json
{
  "success": true,
  "data": { ... },
  "message": ""
}
```
錯誤時：
```json
{
  "success": false,
  "data": null,
  "message": "錯誤說明"
}
```

## JavaScript 模組說明

| 檔案 | 職責 |
|------|------|
| `app.js` | 主程式：檢查登入狀態、初始化底部導覽、頁面載入邏輯 |
| `auth.js` | 登入/登出：呼叫 php/api/auth.php、管理 session 狀態 |
| `chat.js` | AI 聊天核心：呼叫 php/api/chat.php、訊息渲染、自動引導至表單 |
| `services.js` | 服務清單：呼叫 php/api/services.php、分類篩選渲染 |
| `form-renderer.js` | 動態表單引擎：呼叫 php/api/forms.php 取得結構並渲染 HTML 欄位 |
| `orders.js` | 訂單管理：呼叫 php/api/orders.php、狀態篩選、列表渲染 |
| `api.js` | 統一 HTTP 封裝：base URL 設定、fetch wrapper、錯誤攔截 |
| `config.js` | 環境設定：API base path、服務快捷定義、色彩常數 |
| `utils.js` | 工具函式：日期格式化、表單驗證、DOM 操作 helper |

## CSS 架構說明

| 檔案 | 用途 |
|------|------|
| `style.css` | CSS 變數定義、Reset、共用佈局、底部導覽列、RWD breakpoint |
| `login.css` | 登入頁專屬：品牌 logo、卡片、按鈕動畫 |
| `chat.css` | 聊天介面：訊息氣泡、輸入列、捲動容器 |
| `services.css` | 服務列表：卡片 grid、分類 Tab、詳情排版 |
| `form.css` | 動態表單：欄位樣式、驗證提示、上傳預覽 |
| `orders.css` | 訂單列表：狀態標籤色、時間軸、卡片排版 |

## 資料庫結構（MySQL）

### 核心 Table
| Table | 說明 | 對應 SQL |
|-------|------|----------|
| `cms_homepage_service_vendor` | 服務商主檔（清潔、寄件、餐廳訂位...）| 相關主檔設定.json |
| `cms_homepage_service` | 服務項目（洗衣機清洗、冷氣清洗、寄件...）| 相關主檔設定.json |
| `pms_form` | 表單主檔（標題、說明、條款）| 諮詢單相關table.sql |
| `pms_form_topic` | 表單題目（type 決定渲染方式）| 諮詢單相關table.sql |
| `pms_topic_option` | 題目選項（單選/複選的選項內容）| 諮詢單相關table.sql |
| `pms_topic_media` | 題目附件圖片 | 諮詢單相關table.sql |
| `pms_topic_county_district_relation` | 地區選單可選範圍 | 諮詢單相關table.sql |
| `pms_form_feedback` | 表單填寫回饋（用戶提交的資料）| 諮詢單相關table.sql |
| `mms_order_record` | 訂單紀錄 | mms_order_record.sql |
| `county_district` | 縣市行政區對照表 | 縣市區域檔.sql |

## 資料檔案（專案根目錄）

```
hack_game/
├── mms_order_record.sql          # 訂單紀錄表 DDL
├── order_record範例資料.json      # 訂單範例資料
├── order_record範例資料.csv       # 訂單範例資料 (CSV)
├── 相關主檔設定.json              # 服務商 + 服務項目設定
├── 縣市區域檔.sql                 # 縣市/行政區 DDL
├── 縣市區域範例資料.json          # 台灣縣市區域資料（供地區選單使用）
├── 諮詢單相關table.sql            # 表單系統 DDL (pms_form, topic, option, feedback)
├── 諮詢單相關範例資料.json        # 表單系統範例資料
├── README.pdf                     # 專案說明
└── 統一資訊-黑客松企業數據工作坊簡報.pdf
```

## 技術選型

| 項目 | 選擇 |
|------|------|
| 前端 | HTML + CSS + Vanilla JS（零框架依賴）|
| 後端 | PHP 8.x（XAMPP 內建）|
| 資料庫 | MySQL / MariaDB（XAMPP 內建）|
| 部署 | XAMPP（Apache + PHP + MySQL 一站式）|
| RWD | Mobile-first，max-width 480px 模擬手機 App 體驗 |
| 認證 | PHP Session + uniopen OAuth |
| 檔案上傳 | PHP move_uploaded_file → assets/uploads/ |
| API 格式 | RESTful JSON API |
| 前後端溝通 | fetch API → PHP API endpoint |

## 新增功能建議位置

| 需求 | 建議做法 |
|------|----------|
| 新頁面 | 根目錄新增 .html + 對應 css/ 和 js/ 檔案 |
| 新 API | `php/api/` 新增 .php 檔案 |
| 新資料表 | `sql/schema.sql` 新增 DDL，同步更新 db.php |
| 新服務按鈕 | 修改 `js/config.js` 的服務陣列 |
| 新表單題型 | `js/form-renderer.js` 新增 type handler |
| 共用 PHP 函式 | `php/` 下新增 helper 檔案（如 `php/helpers.php`）|
| 第三方函式庫 | 前端：CDN `<script>` 引入；後端：直接 require 或 Composer |
| 環境設定 | 修改 `php/config.php`（後端）或 `js/config.js`（前端）|
