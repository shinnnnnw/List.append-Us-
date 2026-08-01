---
inclusion: fileMatch
fileMatchPattern: "dynamodb/**"
---

# DynamoDB Module - 開發指引

## 概要

`ai-community-web/dynamodb/` 目錄包含 DynamoDB 資料庫相關的所有模組，負責資料表建立、範例資料植入、以及 API 查詢服務。

## 重要約定

### ID 類型全部使用 String

雖然 `table-definitions.js` 中部分 Attribute 定義為 `N` (Number)，但實際 `seed-data.js` 中所有 ID 欄位都使用 **String (S)** 類型加上有意義的前綴：

| 資料表 | 欄位 | 前綴 | 範例 |
|--------|------|------|------|
| inbr_member | inbr_account_id | MBR | MBR001 |
| cms_service_vendor | vendor_id | V | V001 |
| pms_vendor_account | account_id | VA | VA001 |
| pms_form_feedback | feedback_no | FB+日期 | FB20260801001 |
| pms_case_assignment | assignment_id | ASN | ASN001 |
| pms_case_reply | reply_id | RPL | RPL001 |
| pms_case_status_log | log_id | LOG | LOG001 |
| pms_case_review | review_id | RVW | RVW001 |
| mms_order_record | record_id | ORD | ORD001 |
| sys_district | county_code | 英文縮寫 | TPE, NTP |

### 縣市代碼

| 代碼 | 縣市 |
|------|------|
| TPE | 台北市 |
| NTP | 新北市 |
| TXG | 台中市 |
| KHH | 高雄市 |
| TYC | 桃園市 |

### API Service 回傳格式

所有函式統一回傳：
```javascript
// 成功
{ success: true, data: [...] }

// 失敗
{ success: false, error: '錯誤描述' }
```

### 關鍵設計決策

1. **回覆查詢改用 feedback_no** — `getRepliesByFeedback(feedbackNo)` 取代原本的 `getRepliesByAssignment`，因為業務上更常依諮詢單查回覆
2. **行政區查詢用 Scan** — `getDistrictsByCounty` 使用 `ScanCommand + FilterExpression`（非 Query），因為 sys_district 的 PK 已經是 county_code，但 DynamoDB 的 Query 在此情境下 Scan 更直覺
3. **所有時間使用 +08:00 時區** — ISO 8601 帶台灣時區偏移，如 `2026-08-01T08:00:00+08:00`
4. **deploy.js 支援冪等** — 已存在的資料表會被跳過（ResourceInUseException → 跳過）
5. **BatchWriteItem 重試** — UnprocessedItems 最多重試 3 次，使用指數退避

### 與 MySQL Schema 的對應

本模組的 DynamoDB 資料是從 MySQL `0731_202607_hackson.sql` 簡化而來。主要差異：
- MySQL 使用 AUTO_INCREMENT int，DynamoDB 使用字串前綴 ID
- MySQL 使用 blob 加密敏感資料，DynamoDB 範例資料為明文
- MySQL 回覆關聯透過 assignment_id FK，DynamoDB 直接在 reply 上存 feedback_no + vendor_id
- MySQL 縣市代碼為 2 位數字（'01','02'），DynamoDB 使用英文縮寫（TPE, NTP）

### 前端 API 端點

```
API_BASE: https://adjvx2bs1a.execute-api.us-west-2.amazonaws.com/prod
```

## 檔案參考

- 資料表定義: #[[file:dynamodb/table-definitions.js]]
- 範例資料: #[[file:dynamodb/seed-data.js]]
- API 服務: #[[file:dynamodb/api-service.js]]
- 部署腳本: #[[file:dynamodb/deploy.js]]
- 前端設定: #[[file:js/config.js]]
- MySQL Schema: #[[file:sql/0731_202607_hackson.sql]]
