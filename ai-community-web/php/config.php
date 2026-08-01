<?php
/**
 * 應用程式設定
 * 資料庫連線由 sql/db_config.php 統一管理
 */
require_once __DIR__ . '/env-loader.php';

// 載入專案根目錄的 .env（依你實際放的位置調整路徑）
loadEnv(__DIR__ . '/../.env');

require_once __DIR__ . '/../sql/db_config.php';

// 應用程式設定
define('APP_NAME', 'Aî 智慧社區服務平台');
define('UPLOAD_DIR', __DIR__ . '/../assets/uploads/');
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024); // 5MB

// AWS Bedrock 設定（從 .env 讀取，若 .env 沒設定則給預設值）
define('AWS_REGION', getenv('AWS_REGION') ?: 'us-west-2');
define('BEDROCK_MODEL_ID', getenv('BEDROCK_MODEL_ID') ?: 'anthropic.claude-3-5-sonnet-20241022-v2:0');