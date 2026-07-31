<?php
/**
 * 登入/登出 API
 * POST ?action=login  — 模擬 uniopen OAuth 登入
 * POST ?action=logout — 銷毀 session
 * GET  ?action=check  — 檢查登入狀態
 */
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'check':
        handleCheck();
        break;
    default:
        jsonResponse(false, null, '無效的 action 參數', 400);
}

function handleLogin(): void {
    // 取得 POST body（JSON）
    $input = json_decode(file_get_contents('php://input'), true);
    $token = $input['token'] ?? '';

    // 模擬 uniopen OAuth 驗證
    // 實際環境應呼叫 uniopen API 驗證 token
    // 這裡直接模擬成功登入
    $user = [
        'inbr_account_id' => 'c0000000-0000-0000-0000-000000000001',
        'name'            => '王小明',
        'phone'           => '0912345001',
        'email'           => 'wang01@example.com',
        'points'          => 50,
    ];

    // 嘗試從資料庫查詢用戶（若資料庫已建立）
    try {
        $dbUser = dbFetchOne(
            'SELECT inbr_account_id, member_name, member_phone, member_email FROM mms_order_record WHERE inbr_account_id = :id LIMIT 1',
            [':id' => $user['inbr_account_id']]
        );
        // 如果有找到可以覆蓋部分資訊
    } catch (Exception $e) {
        // 資料庫未建立時忽略錯誤，使用模擬資料
    }

    $_SESSION['user'] = $user;

    jsonResponse(true, $user, '登入成功');
}

function handleLogout(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly']
        );
    }
    session_destroy();

    jsonResponse(true, null, '已登出');
}

function handleCheck(): void {
    if (!empty($_SESSION['user'])) {
        jsonResponse(true, $_SESSION['user'], '已登入');
    } else {
        jsonResponse(false, null, '未登入');
    }
}
