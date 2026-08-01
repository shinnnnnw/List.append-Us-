# Aî 智慧社區服務平台

統一資訊黑客松企業數據工作坊專案 — 以 AI 對話驅動的社區服務媒合平台。

## 專案簡介

Aî 智慧社區服務平台讓住戶透過自然語言對話，輕鬆提出各類社區服務需求（訂位、購物、清潔、修繕、社區服務、藥局），由 AI 助手引導收集資訊後自動媒合廠商處理。

主要功能：
- AI 智慧對話管家（多輪對話、自動辨識需求類型）
- 服務廠商瀏覽與搜尋
- 諮詢單提交與追蹤
- 訂單管理與狀態查看
- 縣市區域選單聯動

## 線上 Demo

🔗 **https://dgkio156x1pmj.cloudfront.net**

## 技術架構

| 層級 | 技術 |
|------|------|
| Frontend | Vanilla JavaScript、HTML5、CSS3 |
| Backend | AWS Lambda (Node.js 20.x) + API Gateway |
| Database | Amazon DynamoDB (14 tables) |
| AI | Amazon Bedrock - Claude Sonnet |
| CDN | Amazon CloudFront + S3 |
| CI/CD | GitHub Actions |

## 快速開始 - 本地開發

本專案前端為純靜態頁面，API 統一呼叫雲端 AWS Lambda（不需要本機後端伺服器）：

```bash
# 方法一：VS Code Live Server
# 安裝 Live Server 擴充套件 → 對 index.html 按右鍵 → Open with Live Server

# 方法二：Python HTTP Server
cd ai-community-web
python -m http.server 8080
# 瀏覽器開啟 http://localhost:8080

# 方法三：Node.js http-server
npx http-server ai-community-web -p 8080
```

> 所有 API 呼叫直接走雲端 Lambda 端點（`CONFIG.API_BASE`），不需要啟動任何本地後端服務。

## 快速開始 - AWS 部署

完整 AWS 部署步驟請參考 👉 [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)

摘要流程：
1. 建立 S3 Bucket + CloudFront Distribution
2. 部署 DynamoDB 資料表（`node dynamodb/deploy.js`）
3. 建立 IAM Role + Lambda Function
4. 設定 API Gateway + 部署 prod Stage
5. 設定 GitHub Actions Secrets 啟用自動部署

## 專案結構

```
ai-community-web/
├── index.html              # 首頁（AI 對話入口）
├── form.html               # 表單填寫頁
├── services.html           # 服務列表頁
├── service-detail.html     # 服務詳情頁
├── orders.html             # 訂單列表頁
├── order-detail.html       # 訂單詳情頁
├── profile.html            # 個人檔案頁
├── css/                    # 樣式檔
│   ├── style.css           # 全域樣式
│   ├── chat.css            # 對話介面樣式
│   ├── form.css            # 表單樣式
│   ├── services.css        # 服務頁樣式
│   ├── orders.css          # 訂單頁樣式
│   └── login.css           # 登入頁樣式
├── js/                     # JavaScript
│   ├── config.js           # 全域設定（API 路徑、狀態碼對照）
│   ├── app.js              # 主程式進入點
│   ├── api.js              # API 呼叫封裝
│   ├── auth.js             # 登入認證邏輯
│   ├── chat.js             # AI 對話模組
│   ├── services.js         # 服務頁邏輯
│   ├── orders.js           # 訂單頁邏輯
│   ├── form-renderer.js    # 動態表單渲染器
│   └── utils.js            # 工具函式
├── lambda/chat/            # Lambda 程式碼
│   └── index.mjs           # API Handler（ESM）
├── dynamodb/               # DynamoDB 部署工具
│   ├── deploy.js           # 建表 + 植入資料
│   ├── fix-data.js         # 修正資料型態
│   ├── seed-data.js        # 範例資料
│   ├── table-definitions.js # 資料表 Schema
│   └── api-service.js      # 查詢服務模組
├── sql/                    # SQL Schema（MySQL 參考用）
├── AWS_DEPLOYMENT.md       # AWS 部署指南
├── ARCHITECTURE.md         # 系統架構文件
└── README.md               # 本文件
```

## API 文件

API 端點詳細說明請參考 [AWS_DEPLOYMENT.md - API 端點說明](./AWS_DEPLOYMENT.md#10-api-端點說明)

快速參考：

| Method | Path | 說明 |
|--------|------|------|
| POST | `/ai/chat` | AI 對話 |
| GET | `/vendors` | 廠商列表 |
| POST | `/feedback` | 提交諮詢單 |
| GET | `/feedback/member` | 會員諮詢紀錄 |
| GET | `/districts` | 行政區列表 |

## 團隊成員

| 姓名 | 角色 |
|------|------|
| — | — |
| — | — |
| — | — |
| — | — |

---

> Team 11 - List.append(Us) | 統一資訊黑客松 2024
