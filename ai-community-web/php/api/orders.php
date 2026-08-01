<?php
/**
 * 訂單列表 API
 * GET             — 回傳當前用戶所有訂單
 * GET ?status=X   — 依狀態篩選
 */
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');

$status = $_GET['status'] ?? null;

// 取得登入用戶：session → query string fallback
$currentUser = $_SESSION['user'] ?? null;
if (!$currentUser) {
    $accountId = $_GET['account_id'] ?? '';
    if ($accountId) {
        $currentUser = ['inbr_account_id' => $accountId];
    }
}

try {
    if (!$currentUser) {
        throw new Exception('未登入，使用模擬資料');
    }

    $sql = 'SELECT o.*, v.vendor_name
            FROM mms_order_record o
            LEFT JOIN pms_vendor v ON o.service_vendor_id = v.vendor_id
            WHERE o.inbr_account_id = :account_id AND o.is_deleted = 0';
    $params = [':account_id' => $currentUser['inbr_account_id']];

    if ($status) {
        $sql .= ' AND o.order_status = :status';
        $params[':status'] = $status;
    }

    $sql .= ' ORDER BY o.order_time DESC';

    $orders = dbFetchAll($sql, $params);

    jsonResponse(true, $orders);

} catch (Exception $e) {
    // 資料庫未建立或未登入時回傳模擬資料
    $mockOrders = [
        [
            'record_id'        => 1,
            'order_no'         => 'ORD20260701001',
            'service_vendor_id'=> 1,
            'service_id'       => 101,
            'vendor_name'      => '美味山海餐廳',
            'order_type'       => '02',
            'order_status'     => '80',
            'order_time'       => '2026-07-01 18:00:00',
            'complete_time'    => '2026-07-05 22:00:00',
            'final_amount'     => 0,
            'earn_points'      => 50,
            'remark'           => '窗邊座位',
        ],
        [
            'record_id'        => 3,
            'order_no'         => 'ORD20260702003',
            'service_vendor_id'=> 2,
            'service_id'       => 102,
            'vendor_name'      => '幸福小舖購物',
            'order_type'       => '05',
            'order_status'     => '80',
            'order_time'       => '2026-07-02 15:00:00',
            'complete_time'    => '2026-07-04 10:00:00',
            'final_amount'     => 1160.00,
            'earn_points'      => 23,
            'remark'           => null,
        ],
        [
            'record_id'        => 5,
            'order_no'         => 'ORD20260704005',
            'service_vendor_id'=> 3,
            'service_id'       => 103,
            'vendor_name'      => '安心家事服務',
            'order_type'       => '01',
            'order_status'     => '80',
            'order_time'       => '2026-07-04 08:00:00',
            'complete_time'    => '2026-07-06 11:00:00',
            'final_amount'     => 1800.00,
            'earn_points'      => 36,
            'remark'           => '固定每週打掃',
        ],
        [
            'record_id'        => 6,
            'order_no'         => 'ORD20260705006',
            'service_vendor_id'=> 4,
            'service_id'       => 104,
            'vendor_name'      => '快修水電行',
            'order_type'       => '01',
            'order_status'     => '12',
            'order_time'       => '2026-07-05 16:00:00',
            'final_amount'     => 0,
            'earn_points'      => 0,
            'remark'           => '水龍頭漏水報價中',
        ],
        [
            'record_id'        => 2,
            'order_no'         => 'ORD20260702002',
            'service_vendor_id'=> 1,
            'service_id'       => 101,
            'vendor_name'      => '美味山海餐廳',
            'order_type'       => '02',
            'order_status'     => '02',
            'order_time'       => '2026-07-02 10:00:00',
            'final_amount'     => 0,
            'earn_points'      => 0,
            'remark'           => null,
        ],
    ];

    // 模擬篩選
    if ($status) {
        $mockOrders = array_values(array_filter($mockOrders, function($o) use ($status) {
            return $o['order_status'] === $status;
        }));
    }

    jsonResponse(true, $mockOrders);
}
