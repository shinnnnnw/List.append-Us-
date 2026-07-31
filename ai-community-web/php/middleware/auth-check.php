<?php
/**
 * 認證中介層：驗證使用者是否已登入
 * 各 API 在需要登入的操作前 require 此檔案
 */
require_once __DIR__ . '/../config.php';

if (empty($_SESSION['user'])) {
    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'data'    => null,
        'message' => '未登入或登入已過期，請重新登入',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 將當前用戶資訊存入變數供 API 使用
$currentUser = $_SESSION['user'];
