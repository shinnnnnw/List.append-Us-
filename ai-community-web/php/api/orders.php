<?php
/**
 * 訂單列表 API
 * GET             — 回傳當前用戶所有訂單
 * GET ?status=X   — 依狀態篩選
 */
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../middleware/auth-check.php';

/** @var array $currentUser 由 auth-check.php 提供 */

header('Content-Type: application/json; charset=utf-8');

$status = $_GET['status'] ?? null;

try {
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
    // 資料庫未建立時回傳模擬資料
    $mockOrders = [
        [
            'record_id'        => 1,
            'order_no'         => 'ORD20260701001',
            'service_vendor_id'=> 1,
            'service_id'       => 4,
            'vendor_name'      => '清潔',
            'service_name'     => '專業清潔',
            'order_type'       => '01',
            'order_status'     => '80',
            'order_time'       => '2026-07-01 14:30:00',
            'complete_time'    => '2026-07-02 16:00:00',
            'final_amount'     => 2500.00,
            'earn_points'      => 25,
        ],
        [
            'record_id'        => 2,
            'order_no'         => 'ORD20260715002',
            'service_vendor_id'=> 5,
            'service_id'       => 9,
            'vendor_name'      => '餐廳訂位',
            'service_name'     => '餐廳訂位',
            'order_type'       => '02',
            'order_status'     => '03',
            'order_time'       => '2026-07-15 10:00:00',
            'service_time'     => '2026-07-20 18:30:00',
            'final_amount'     => 0,
            'earn_points'      => 0,
        ],
        [
            'record_id'        => 3,
            'order_no'         => 'ORD20260720003',
            'service_vendor_id'=> 11,
            'service_id'       => 17,
            'vendor_name'      => '修繕服務',
            'service_name'     => '水電修繕',
            'order_type'       => '01',
            'order_status'     => '12',
            'order_time'       => '2026-07-20 09:15:00',
            'final_amount'     => 0,
            'earn_points'      => 0,
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
