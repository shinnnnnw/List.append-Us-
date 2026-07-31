<?php
/**
 * 資料庫連線設定
 */
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', '202607_hackson');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8');

// 應用程式設定
define('APP_NAME', 'Aî 智慧社區服務平台');
define('UPLOAD_DIR', __DIR__ . '/../assets/uploads/');
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024); // 5MB

// Session 設定
ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);
session_start();
