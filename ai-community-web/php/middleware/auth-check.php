<?php
/**
 * 認證中介層：驗證使用者是否已登入
 * 優先使用 PHP Session，fallback 接受 request body 的 account_id（MVP 用）
 */
require_once __DIR__ . '/../config.php';

// 方法一：PHP Session
if (!empty($_SESSION['user'])) {
    $currentUser = $_SESSION['user'];
    return;
}

// 方法二：從 request body 讀取 account_id（前端 localStorage 傳入）
// 優先使用呼叫者已解析的 input（避免 php://input 被讀兩次）
$_rawInput = $GLOBALS['_parsed_input'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
$_bodyData = is_array($_rawInput) ? $_rawInput : [];
$_accountId = $_bodyData['account_id'] ?? '';

// 方法三：從 header 讀取 X-Account-Id
if (empty($_accountId)) {
    $_accountId = $_SERVER['HTTP_X_ACCOUNT_ID'] ?? '';
}

if (!empty($_accountId)) {
    // 用 account_id 組出最小 user 物件
    $currentUser = [
        'inbr_account_id' => $_accountId,
        'name'            => $_bodyData['account_name'] ?? '住戶',
        'phone'           => '',
        'email'           => '',
    ];

    // 嘗試從資料庫補齊用戶資料（有就補，沒有就用上面的預設值）
    try {
        $dbUser = dbFetchOne(
            'SELECT DISTINCT inbr_account_id,
                    CAST(member_name AS CHAR) AS member_name,
                    CAST(member_phone AS CHAR) AS member_phone,
                    CAST(member_email AS CHAR) AS member_email
             FROM mms_order_record
             WHERE inbr_account_id = ? AND is_deleted = 0 LIMIT 1',
            [$_accountId]
        );
        if ($dbUser) {
            $currentUser['name']  = $dbUser['member_name']  ?? $currentUser['name'];
            $currentUser['phone'] = $dbUser['member_phone'] ?? '';
            $currentUser['email'] = $dbUser['member_email'] ?? '';
        }
    } catch (\Throwable $e) {
        // DB 查不到沒關係，用預設值繼續
    }

    // 同步寫入 session 讓後續請求可以直接用
    $_SESSION['user'] = $currentUser;
    return;
}

// 都沒有 → 401
http_response_code(401);
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => false,
    'data'    => null,
    'message' => '未登入或登入已過期，請重新登入',
], JSON_UNESCAPED_UNICODE);
exit;
