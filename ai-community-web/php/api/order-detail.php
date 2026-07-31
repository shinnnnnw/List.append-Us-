<?php
/**
 * 訂單詳情 API
 * GET ?id=X — 回傳單筆訂單完整資訊
 */
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');

// 嘗試取得登入用戶（不強制 401）
$currentUser = $_SESSION['user'] ?? null;

$orderId = $_GET['id'] ?? null;

if (!$orderId) {
    jsonResponse(false, null, '缺少 id 參數', 400);
}

try {
    $order = dbFetchOne(
        'SELECT o.*, v.vendor_name
         FROM mms_order_record o
         LEFT JOIN pms_vendor v ON o.service_vendor_id = v.vendor_id
         WHERE o.record_id = :id AND o.inbr_account_id = :account_id AND o.is_deleted = 0',
        [':id' => $orderId, ':account_id' => $currentUser['inbr_account_id']]
    );

    if (!$order) {
        jsonResponse(false, null, '找不到該訂單', 404);
    }

    // 解析 JSON 欄位
    if (isset($order['order_items']) && $order['order_items']) {
        $order['order_items'] = json_decode($order['order_items'], true);
    }
    if (isset($order['vendor_data']) && $order['vendor_data']) {
        $order['vendor_data'] = json_decode($order['vendor_data'], true);
    }

    // 建立時間軸
    $timeline = [];
    $timeline[] = ['status' => '建立訂單', 'time' => $order['order_time']];
    if ($order['deposit_time']) $timeline[] = ['status' => '支付訂金', 'time' => $order['deposit_time']];
    if ($order['confirm_time']) $timeline[] = ['status' => '訂單確認', 'time' => $order['confirm_time']];
    if ($order['service_time']) $timeline[] = ['status' => '服務進行', 'time' => $order['service_time']];
    if ($order['complete_time']) $timeline[] = ['status' => '訂單完成', 'time' => $order['complete_time']];
    if ($order['cancel_time']) $timeline[] = ['status' => '訂單取消', 'time' => $order['cancel_time']];

    $order['timeline'] = $timeline;

    jsonResponse(true, $order);

} catch (Exception $e) {
    // 模擬資料
    $mockOrder = [
        'record_id'         => (int)$orderId,
        'order_no'          => 'ORD20260701001',
        'vendor_name'       => '清潔',
        'service_name'      => '專業清潔',
        'order_type'        => '01',
        'order_status'      => '80',
        'order_time'        => '2026-07-01 14:30:00',
        'confirm_time'      => '2026-07-01 15:00:00',
        'service_time'      => '2026-07-02 10:00:00',
        'complete_time'     => '2026-07-02 16:00:00',
        'original_amount'   => 3000.00,
        'discount_amount'   => 500.00,
        'final_amount'      => 2500.00,
        'earn_points'       => 25,
        'order_items'       => [
            ['name' => '客廳清潔', 'quantity' => 1, 'price' => 1500],
            ['name' => '廚房清潔', 'quantity' => 1, 'price' => 1500],
        ],
        'remark'            => '請攜帶自有清潔用品',
        'timeline'          => [
            ['status' => '建立訂單', 'time' => '2026-07-01 14:30:00'],
            ['status' => '訂單確認', 'time' => '2026-07-01 15:00:00'],
            ['status' => '服務進行', 'time' => '2026-07-02 10:00:00'],
            ['status' => '訂單完成', 'time' => '2026-07-02 16:00:00'],
        ],
    ];

    jsonResponse(true, $mockOrder);
}
