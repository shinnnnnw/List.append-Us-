<?php
/**
 * 應用程式設定
 * 資料庫連線由 sql/db_config.php 統一管理
 */
require_once __DIR__ . '/../sql/db_config.php';

// 應用程式設定
define('APP_NAME', 'Aî 智慧社區服務平台');
define('UPLOAD_DIR', __DIR__ . '/../assets/uploads/');
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024); // 5MB
