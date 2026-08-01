<?php
/**
 * 聯絡我們 API
 * POST — 接收聯絡表單資料，寫入 contact_inquiry 資料表
 */
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, '僅支援 POST 方法', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$name    = trim($input['name'] ?? '');
$email   = trim($input['email'] ?? '');
$phone   = trim($input['phone'] ?? '');
$address = trim($input['address'] ?? '');
$content = trim($input['content'] ?? '');

// 驗證必填欄位
if (!$name || !$email || !$content) {
    jsonResponse(false, null, '請填寫必填欄位（姓名、信箱、問題內容）', 400);
}

// 驗證 Email 格式
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, null, 'Email 格式不正確', 400);
}

// 寫入資料庫
try {
    dbExecute(
        "INSERT INTO contact_inquiry (name, email, phone, address, content) VALUES (?, ?, ?, ?, ?)",
        [$name, $email, $phone, $address, $content]
    );

    jsonResponse(true, null, '感謝您的來信，我們將盡快回覆您！');
} catch (\Throwable $e) {
    error_log('contact inquiry error: ' . $e->getMessage());
    jsonResponse(false, null, '系統忙碌中，請稍後再試', 500);
}
