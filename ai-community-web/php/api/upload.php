<?php
/**
 * 圖片上傳 API
 * POST (multipart/form-data) — 處理圖片上傳
 */
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../middleware/auth-check.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, '僅支援 POST 方法', 405);
}

if (empty($_FILES['file'])) {
    jsonResponse(false, null, '未選擇檔案', 400);
}

$file = $_FILES['file'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$maxSize = MAX_UPLOAD_SIZE;

// 驗證檔案類型
if (!in_array($file['type'], $allowedTypes)) {
    jsonResponse(false, null, '不支援的檔案格式，僅支援 JPG、PNG、GIF、WEBP', 400);
}

// 驗證檔案大小
if ($file['size'] > $maxSize) {
    jsonResponse(false, null, '檔案大小超過限制（最大 5MB）', 400);
}

// 驗證是否為真實圖片
$imageInfo = getimagesize($file['tmp_name']);
if ($imageInfo === false) {
    jsonResponse(false, null, '無效的圖片檔案', 400);
}

// 確保上傳目錄存在
$uploadDir = UPLOAD_DIR;
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// 產生唯一檔名
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = date('Ymd') . '_' . bin2hex(random_bytes(16)) . '.' . $ext;
$filepath = $uploadDir . $filename;

// 移動檔案
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    jsonResponse(false, null, '檔案上傳失敗', 500);
}

// 回傳檔案路徑
$publicPath = 'assets/uploads/' . $filename;

jsonResponse(true, [
    'filename' => $filename,
    'path'     => $publicPath,
    'size'     => $file['size'],
    'type'     => $file['type'],
], '上傳成功');
