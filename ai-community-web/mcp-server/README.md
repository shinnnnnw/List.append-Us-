# Aî 智慧社區 MCP Server

將 Aî 智慧社區服務平台的核心 API 包裝為符合 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 標準的工具，供外部 AI Agent（如 Lumine one）透過標準協議呼叫。

## 提供的 MCP Tools

| Tool | 說明 | 對應 API |
|------|------|---------|
| `list_vendors` | 查詢服務廠商列表（支援類型篩選） | GET /vendors |
| `get_vendor_detail` | 查詢單一廠商詳情 | GET /vendors/:id |
| `create_service_request` | 建立服務需求（諮詢單） | POST /feedback |
| `list_orders` | 查詢用戶訂單列表 | GET /orders |
| `get_order_detail` | 查詢單筆訂單詳情 | GET /orders/:id |
| `ai_chat` | AI 管家對話（意圖辨識 + 多輪收集 + 自動建單） | POST /ai/chat |

## 架構

```
外部 AI Agent (Lumine one 等)
    ↕ MCP 協議 (stdio)
MCP Server (本專案)
    ↕ HTTP fetch
API Gateway (https://adjvx2bs1a.execute-api.us-west-2.amazonaws.com/prod)
    ↕
AWS Lambda + DynamoDB (既有後端)
```

MCP Server 本身不持有商業邏輯或資料，只做協議轉換——將 MCP tool call 轉為 HTTP request 打到既有 API Gateway，再將結果包裝為 MCP 回應格式。

## 安裝與啟動

```bash
cd mcp-server
npm install
npm run build
npm start
```

開發模式（不需編譯）：
```bash
npm run dev
```

## MCP Client 設定範例

> 以下路徑為範例，請替換為你本機實際的專案路徑。

### Claude Desktop / Kiro / 其他 MCP Client

```json
{
  "mcpServers": {
    "ai-community": {
      "command": "node",
      "args": ["<你的專案路徑>/mcp-server/dist/index.js"]
    }
  }
}
```

### Windows 環境

```json
{
  "mcpServers": {
    "ai-community": {
      "command": "node",
      "args": ["C:\\path\\to\\mcp-server\\dist\\index.js"]
    }
  }
}
```

## 各 Tool 詳細說明

### list_vendors

查詢平台合作的服務廠商。

**參數：**
- `service_type` (string, optional) — 服務類型代碼：1=清潔, 2=家電, 3=寄件, 6=餐廳, 10=修繕, 11=購物

**回傳範例：**
```json
{
  "success": true,
  "data": {
    "vendors": [
      { "vendor_id": 4, "vendor_name": "饗宴樓", "rating_avg": "4.7" }
    ]
  }
}
```

### get_vendor_detail

查詢單一廠商的完整資訊。

**參數：**
- `vendor_id` (string, required) — 廠商 ID

### create_service_request

為住戶建立服務需求，系統會自動媒合廠商。

**參數：**
- `form_id` (number, required) — 1=訂位, 2=購物, 3=居家服務, 4=寄件
- `account_id` (string, required) — 用戶 ID
- `contact_name` (string, required) — 聯絡人
- `contact_mobile` (string, required) — 手機
- `description` (string, required) — 需求描述

### list_orders

查詢用戶的歷史訂單。

**參數：**
- `account_id` (string, required)
- `status` (string, optional) — 03=已確認, 80=已完成, 90=已取消

### get_order_detail

查詢單筆訂單完整資訊。

**參數：**
- `order_id` (string, required) — 訂單 record_id
- `account_id` (string, required)

### ai_chat

與 AI 管家對話。支援多輪對話、意圖辨識、自動建單。

**參數：**
- `text` (string, required) — 使用者訊息
- `account_id` (string, optional)
- `history` (array, optional) — 對話歷史 `[{role, content}]`

## 技術規格

- Runtime: Node.js >= 20
- Transport: stdio
- MCP SDK: @modelcontextprotocol/server v2
- Schema: Zod v3
- 後端 API: AWS Lambda + API Gateway + DynamoDB
