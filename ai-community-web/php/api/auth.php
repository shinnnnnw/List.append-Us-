<?php
/**
 * 登入/登出 API
 * POST ?action=login  — 使用手機號碼登入（模擬 uniopen OAuth）
 * POST ?action=logout — 銷毀 session
 * GET  ?action=check  — 檢查登入狀態
 * GET  ?action=users  — 取得可登入的帳號列表（Demo 用）
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
    case 'users':
        handleGetUsers();
        break;
    default:
        jsonResponse(false, null, '無效的 action 參數', 400);
}

function handleLogin(): void {
    $input = json_decode(file_get_contents('php://input'), true);
    $phone = trim($input['phone'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($phone)) {
        jsonResponse(false, null, '請輸入手機號碼', 400);
    }

    try {
        // 從 mms_order_record 查詢會員（用手機號碼比對）
        $row = dbFetchOne(
            'SELECT DISTINCT inbr_account_id, CAST(member_name AS CHAR) AS member_name, CAST(member_phone AS CHAR) AS member_phone, CAST(member_email AS CHAR) AS member_email FROM mms_order_record WHERE CAST(member_phone AS CHAR) = ? AND is_deleted = 0 LIMIT 1',
            [$phone]
        );

        if (!$row) {
            jsonResponse(false, null, '找不到此手機號碼的帳號', 401);
        }

        // 密碼驗證（如果有傳密碼）
        // Demo 環境：密碼為手機號碼後四碼
        if (!empty($password)) {
            $expectedPassword = substr($phone, -4);
            if ($password !== $expectedPassword) {
                jsonResponse(false, null, '密碼錯誤（提示：手機號碼後四碼）', 401);
            }
        }

        // 計算該用戶的累積點數
        $pointsRow = dbFetchOne(
            'SELECT COALESCE(SUM(earn_points), 0) AS total_points FROM mms_order_record WHERE inbr_account_id = ? AND point_status = "02" AND is_deleted = 0',
            [$row['inbr_account_id']]
        );

        $user = [
            'inbr_account_id' => $row['inbr_account_id'],
            'name'            => $row['member_name'],
            'phone'           => $row['member_phone'],
            'email'           => $row['member_email'] ?? '',
            'points'          => (int)($pointsRow['total_points'] ?? 0),
        ];

        $_SESSION['user'] = $user;
        jsonResponse(true, $user, '登入成功');

    } catch (Exception $e) {
        jsonResponse(false, null, '登入失敗：' . $e->getMessage(), 500);
    }
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

function handleGetUsers(): void {
    try {
        // 取得所有可登入的帳號（Demo 用）
        // member_name, member_phone 為 blob 型別，需 CAST 為 CHAR
        $rows = dbFetchAll(
            'SELECT DISTINCT inbr_account_id, CAST(member_name AS CHAR) AS member_name, CAST(member_phone AS CHAR) AS member_phone FROM mms_order_record WHERE is_deleted = 0 ORDER BY member_phone'
        );

        $users = [];
        foreach ($rows as $row) {
            $users[] = [
                'name'  => $row['member_name'] ?? '',
                'phone' => $row['member_phone'] ?? '',
            ];
        }

        jsonResponse(true, $users);
    } catch (Exception $e) {
        jsonResponse(false, null, '取得帳號列表失敗: ' . $e->getMessage(), 500);
    }
}
