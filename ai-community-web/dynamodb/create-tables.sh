#!/bin/bash
# create-tables.sh - AWS CLI DynamoDB 建表腳本
# 智慧社區服務平台 - 10 張資料表
#
# 使用方式:
#   chmod +x create-tables.sh
#   ./create-tables.sh
#
# 前提:
#   - 已安裝 AWS CLI
#   - 已設定 AWS credentials (aws configure)
#   - Region: us-west-2

REGION="us-west-2"
echo "=== 開始建立 DynamoDB 資料表 (Region: $REGION) ==="
echo ""

# -------------------------------------------------------
# 1. inbr_member - 會員資料表
# -------------------------------------------------------
echo "[1/10] 建立 inbr_member 資料表..."
aws dynamodb create-table \
  --region $REGION \
  --table-name inbr_member \
  --key-schema \
    AttributeName=inbr_account_id,KeyType=HASH \
  --attribute-definitions \
    AttributeName=inbr_account_id,AttributeType=S \
  --billing-mode PAY_PER_REQUEST
echo "      inbr_member 建立完成"
echo ""

# -------------------------------------------------------
# 2. pms_vendor_account - 廠商帳號資料表
# -------------------------------------------------------
echo "[2/10] 建立 pms_vendor_account 資料表..."
aws dynamodb create-table \
  --region $REGION \
  --table-name pms_vendor_account \
  --key-schema \
    AttributeName=account_id,KeyType=HASH \
  --attribute-definitions \
    AttributeName=account_id,AttributeType=S \
    AttributeName=vendor_id,AttributeType=S \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    '[{"IndexName":"GSI_vendor_id","KeySchema":[{"AttributeName":"vendor_id","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]'
echo "      pms_vendor_account 建立完成"
echo ""

# -------------------------------------------------------
# 3. cms_service_vendor - 服務廠商資料表
# -------------------------------------------------------
echo "[3/10] 建立 cms_service_vendor 資料表..."
aws dynamodb create-table \
  --region $REGION \
  --table-name cms_service_vendor \
  --key-schema \
    AttributeName=vendor_id,KeyType=HASH \
  --attribute-definitions \
    AttributeName=vendor_id,AttributeType=S \
  --billing-mode PAY_PER_REQUEST
echo "      cms_service_vendor 建立完成"
echo ""

# -------------------------------------------------------
# 4. pms_form_feedback - 諮詢單資料表
# -------------------------------------------------------
echo "[4/10] 建立 pms_form_feedback 資料表..."
aws dynamodb create-table \
  --region $REGION \
  --table-name pms_form_feedback \
  --key-schema \
    AttributeName=feedback_no,KeyType=HASH \
  --attribute-definitions \
    AttributeName=feedback_no,AttributeType=S \
    AttributeName=inbr_account_id,AttributeType=S \
    AttributeName=cre_time,AttributeType=S \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    '[{"IndexName":"GSI_inbr_account_id","KeySchema":[{"AttributeName":"inbr_account_id","KeyType":"HASH"},{"AttributeName":"cre_time","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}}]'
echo "      pms_form_feedback 建立完成"
echo ""

# -------------------------------------------------------
# 5. pms_case_assignment - 派案資料表
# -------------------------------------------------------
echo "[5/10] 建立 pms_case_assignment 資料表..."
aws dynamodb create-table \
  --region $REGION \
  --table-name pms_case_assignment \
  --key-schema \
    AttributeName=assignment_id,KeyType=HASH \
  --attribute-definitions \
    AttributeName=assignment_id,AttributeType=S \
    AttributeName=feedback_no,AttributeType=S \
    AttributeName=vendor_id,AttributeType=S \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    '[{"IndexName":"GSI_feedback_no","KeySchema":[{"AttributeName":"feedback_no","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}},{"IndexName":"GSI_vendor_id","KeySchema":[{"AttributeName":"vendor_id","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]'
echo "      pms_case_assignment 建立完成"
echo ""

# -------------------------------------------------------
# 6. pms_case_reply - 回覆資料表
# -------------------------------------------------------
echo "[6/10] 建立 pms_case_reply 資料表..."
aws dynamodb create-table \
  --region $REGION \
  --table-name pms_case_reply \
  --key-schema \
    AttributeName=reply_id,KeyType=HASH \
  --attribute-definitions \
    AttributeName=reply_id,AttributeType=S \
    AttributeName=feedback_no,AttributeType=S \
    AttributeName=cre_time,AttributeType=S \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    '[{"IndexName":"GSI_feedback_no","KeySchema":[{"AttributeName":"feedback_no","KeyType":"HASH"},{"AttributeName":"cre_time","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}}]'
echo "      pms_case_reply 建立完成"
echo ""

# -------------------------------------------------------
# 7. pms_case_status_log - 狀態歷程資料表
# -------------------------------------------------------
echo "[7/10] 建立 pms_case_status_log 資料表..."
aws dynamodb create-table \
  --region $REGION \
  --table-name pms_case_status_log \
  --key-schema \
    AttributeName=log_id,KeyType=HASH \
  --attribute-definitions \
    AttributeName=log_id,AttributeType=S \
    AttributeName=feedback_no,AttributeType=S \
    AttributeName=cre_time,AttributeType=S \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    '[{"IndexName":"GSI_feedback_no","KeySchema":[{"AttributeName":"feedback_no","KeyType":"HASH"},{"AttributeName":"cre_time","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}}]'
echo "      pms_case_status_log 建立完成"
echo ""

# -------------------------------------------------------
# 8. pms_case_review - 評價資料表
# -------------------------------------------------------
echo "[8/10] 建立 pms_case_review 資料表..."
aws dynamodb create-table \
  --region $REGION \
  --table-name pms_case_review \
  --key-schema \
    AttributeName=review_id,KeyType=HASH \
  --attribute-definitions \
    AttributeName=review_id,AttributeType=S \
    AttributeName=vendor_id,AttributeType=S \
    AttributeName=inbr_account_id,AttributeType=S \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    '[{"IndexName":"GSI_vendor_id","KeySchema":[{"AttributeName":"vendor_id","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}},{"IndexName":"GSI_inbr_account_id","KeySchema":[{"AttributeName":"inbr_account_id","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]'
echo "      pms_case_review 建立完成"
echo ""

# -------------------------------------------------------
# 9. mms_order_record - 訂單記錄資料表
# -------------------------------------------------------
echo "[9/10] 建立 mms_order_record 資料表..."
aws dynamodb create-table \
  --region $REGION \
  --table-name mms_order_record \
  --key-schema \
    AttributeName=record_id,KeyType=HASH \
  --attribute-definitions \
    AttributeName=record_id,AttributeType=S \
    AttributeName=inbr_account_id,AttributeType=S \
    AttributeName=cre_time,AttributeType=S \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    '[{"IndexName":"GSI_inbr_account_id","KeySchema":[{"AttributeName":"inbr_account_id","KeyType":"HASH"},{"AttributeName":"cre_time","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}}]'
echo "      mms_order_record 建立完成"
echo ""

# -------------------------------------------------------
# 10. sys_district - 縣市區域資料表
# -------------------------------------------------------
echo "[10/10] 建立 sys_district 資料表..."
aws dynamodb create-table \
  --region $REGION \
  --table-name sys_district \
  --key-schema \
    AttributeName=code,KeyType=HASH \
  --attribute-definitions \
    AttributeName=code,AttributeType=S \
  --billing-mode PAY_PER_REQUEST
echo "      sys_district 建立完成"
echo ""

echo ""
echo "=== 所有資料表建立完成 ==="
echo "請至 AWS Console 確認資料表狀態為 ACTIVE"
