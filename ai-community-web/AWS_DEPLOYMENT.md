# AWS 部署指南 - Aî 智慧社區服務平台

## 1. 系統架構

```
                         ┌─────────────────────────────────────────┐
                         │              AWS Cloud (us-west-2)       │
                         │                                         │
  ┌──────┐   HTTPS    ┌──────────┐         ┌────────┐            │
  │ User │───────────→│CloudFront│────────→│   S3   │            │
  └──────┘            │EV7P39... │  OAC    │Bucket  │            │
      │               └──────────┘         └────────┘            │
      │                                                           │
      │   HTTPS    ┌───────────┐  Proxy   ┌────────┐            │
      └───────────→│API Gateway│────────→│ Lambda │            │
                   │adjvx2bs1a │         │  Node  │            │
                   └───────────┘         └────┬───┘            │
                                              │                 │
                                    ┌─────────┼─────────┐      │
                                    │         │         │      │
                               ┌────▼───┐ ┌───▼────┐   │      │
                               │Bedrock │ │DynamoDB│   │      │
                               │Claude  │ │10 Tables│   │      │
                               └────────┘ └────────┘   │      │
                         └─────────────────────────────────────────┘
```

## 2. 前置需求

- **AWS CLI v2** 已安裝並設定 credentials
- **Node.js 20+**（Lambda runtime 為 nodejs20.x）
- **IAM 權限**：S3、CloudFront、DynamoDB、Lambda、API Gateway、Bedrock、CloudWatch Logs
- **GitHub 帳號**（用於 CI/CD 自動部署）

## 3. 重要參數表

| 項目 | 值 |
|------|-----|
| AWS Region | `us-west-2` |
| S3 Bucket | `ai-community-team11` |
| CloudFront Distribution ID | `EV7P39YLQ68TV` |
| CloudFront Domain | `dgkio156x1pmj.cloudfront.net` |
| Lambda Function | `ai-community-api` |
| Lambda Runtime | `nodejs20.x` |
| Lambda Handler | `index.handler` |
| Lambda Timeout | 30 秒 |
| Lambda Memory | 256 MB |
| API Gateway ID | `adjvx2bs1a` |
| API Endpoint | `https://adjvx2bs1a.execute-api.us-west-2.amazonaws.com/prod` |
| Bedrock Model | `us.anthropic.claude-sonnet-4-6` |

## 4. Step 1: S3 + CloudFront

### 建立 S3 Bucket

```bash
aws s3 mb s3://ai-community-team11 --region us-west-2

# 停用公開存取
aws s3api put-public-access-block --bucket ai-community-team11 \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

### 建立 CloudFront OAC

```bash
aws cloudfront create-origin-access-control \
  --origin-access-control-config \
  Name=ai-community-oac,OriginAccessControlOriginType=s3,SigningBehavior=always,SigningProtocol=sigv4
```

### 建立 CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name ai-community-team11.s3.us-west-2.amazonaws.com \
  --default-root-object index.html
```

### 設定 S3 Bucket Policy（允許 CloudFront 存取）

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ai-community-team11/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/EV7P39YLQ68TV"
        }
      }
    }
  ]
}
```

```bash
aws s3api put-bucket-policy --bucket ai-community-team11 --policy file://bucket-policy.json
```

### 上傳靜態檔案

```bash
aws s3 sync ./ai-community-web/ s3://ai-community-team11/ \
  --exclude "*.pdf" --exclude "*.sql" --delete
```

## 5. Step 2: DynamoDB 資料表

在 AWS CloudShell 或本機執行：

```bash
cd ai-community-web/dynamodb

# 安裝相依套件
npm install

# 建立資料表並植入範例資料
node deploy.js

# 修正資料型態（將數字 key 轉為 Number type）
node fix-data.js
```

此腳本會建立以下 10 張資料表（PAY_PER_REQUEST 計費模式）：

| 資料表 | Partition Key | Sort Key | GSI |
|--------|--------------|----------|-----|
| inbr_member | inbr_account_id (S) | — | — |
| pms_vendor_account | account_id (N) | — | GSI_vendor_id |
| cms_service_vendor | vendor_id (N) | — | — |
| pms_form_feedback | feedback_no (S) | — | GSI_inbr_account_id (+ cre_time) |
| pms_case_assignment | assignment_id (N) | — | GSI_feedback_no, GSI_vendor_id |
| pms_case_reply | reply_id (N) | — | GSI_assignment_id (+ reply_time) |
| pms_case_status_log | log_id (N) | — | GSI_feedback_no (+ change_time) |
| pms_case_review | review_id (N) | — | GSI_vendor_id |
| mms_order_record | record_id (N) | — | GSI_inbr_account_id (+ order_time) |
| sys_district | county_code (S) | code (S) | — |

## 6. Step 3: IAM Role

建立 Lambda 執行角色：

```bash
# 建立信任政策
cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role --role-name ai-community-lambda-role \
  --assume-role-policy-document file://trust-policy.json

# 附加權限政策
aws iam attach-role-policy --role-name ai-community-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy --role-name ai-community-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

aws iam attach-role-policy --role-name ai-community-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess
```

## 7. Step 4: Lambda Function

```bash
cd lambda/chat

# 打包程式碼
zip -r function.zip index.mjs

# 建立 Lambda Function
aws lambda create-function \
  --function-name ai-community-api \
  --runtime nodejs20.x \
  --handler index.handler \
  --role arn:aws:iam::ACCOUNT_ID:role/ai-community-lambda-role \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 256 \
  --region us-west-2
```

更新程式碼：

```bash
zip -r function.zip index.mjs
aws lambda update-function-code \
  --function-name ai-community-api \
  --zip-file fileb://function.zip
```

## 8. Step 5: API Gateway

### 建立 REST API

```bash
aws apigateway create-rest-api \
  --name ai-community-api \
  --endpoint-configuration types=REGIONAL \
  --region us-west-2
```

### 建立 {proxy+} 資源與 ANY Method

```bash
# 取得 root resource ID
ROOT_ID=$(aws apigateway get-resources --rest-api-id adjvx2bs1a --query 'items[?path==`/`].id' --output text)

# 建立 {proxy+} resource
aws apigateway create-resource \
  --rest-api-id adjvx2bs1a \
  --parent-id $ROOT_ID \
  --path-part "{proxy+}"

# 建立 ANY method + Lambda 整合
aws apigateway put-method \
  --rest-api-id adjvx2bs1a \
  --resource-id RESOURCE_ID \
  --http-method ANY \
  --authorization-type NONE

aws apigateway put-integration \
  --rest-api-id adjvx2bs1a \
  --resource-id RESOURCE_ID \
  --http-method ANY \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:us-west-2:lambda:path/2015-03-31/functions/arn:aws:lambda:us-west-2:ACCOUNT_ID:function:ai-community-api/invocations"
```

### 啟用 CORS

```bash
aws apigateway put-method \
  --rest-api-id adjvx2bs1a \
  --resource-id RESOURCE_ID \
  --http-method OPTIONS \
  --authorization-type NONE
```

### 部署至 prod Stage

```bash
aws apigateway create-deployment \
  --rest-api-id adjvx2bs1a \
  --stage-name prod
```

## 9. Step 6: GitHub Actions 自動部署

### 設定 Repository Secrets

前往 GitHub → Settings → Secrets and variables → Actions，新增：

| Secret 名稱 | 說明 |
|-------------|------|
| `AWS_ACCESS_KEY_ID` | IAM Access Key |
| `AWS_SECRET_ACCESS_KEY` | IAM Secret Key |
| `AWS_SESSION_TOKEN` | Session Token（若使用臨時憑證） |
| `AWS_DEFAULT_REGION` | `us-west-2` |

### 部署流程

推送 `main` 分支時自動觸發（僅 `ai-community-web/` 路徑變更時）：

1. Sync 檔案至 S3（排除 .pdf 和 .sql）
2. 清除 CloudFront 快取（`/*`）

## 10. API 端點說明

Base URL: `https://adjvx2bs1a.execute-api.us-west-2.amazonaws.com/prod`

| Method | Path | 說明 |
|--------|------|------|
| POST | `/ai/chat` | AI 對話（傳入 text + history） |
| GET | `/vendors` | 取得廠商列表 |
| POST | `/feedback` | 提交諮詢單 |
| GET | `/feedback/member?id={accountId}` | 查詢會員諮詢紀錄 |
| GET | `/districts?county={code}` | 查詢行政區列表 |

### POST /ai/chat 範例

```json
{
  "text": "我想預約明天下午的清潔服務",
  "history": [
    { "role": "user", "content": "你好" },
    { "role": "assistant", "content": "您好！有什麼可以幫您的嗎？" }
  ]
}
```

## 11. Troubleshooting

### CORS 錯誤

確認 Lambda 回應包含正確 CORS Headers：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Methods: POST, OPTIONS
```

同時確認 API Gateway OPTIONS method 已正確設定。

### 502 Bad Gateway

- 檢查 Lambda 執行角色是否有 Bedrock 呼叫權限
- 檢查 CloudWatch Logs 中的錯誤訊息
- 確認 Lambda timeout（30s）是否足夠

### CloudFront 快取未更新

```bash
aws cloudfront create-invalidation \
  --distribution-id EV7P39YLQ68TV \
  --paths "/*"
```

### DynamoDB 型態不符

若查詢結果為空或報錯，確認：
- 數字欄位使用 `N` type（如 vendor_id、record_id）
- 字串欄位使用 `S` type（如 feedback_no、inbr_account_id）
- 執行 `node fix-data.js` 可修正已匯入資料的型態問題
