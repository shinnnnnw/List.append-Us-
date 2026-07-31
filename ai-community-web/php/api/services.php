<?php
/**
 * 服務列表 API
 * GET             — 回傳所有服務廠商（pms_vendor）
 * GET ?id=X       — 回傳單一廠商詳情
 * GET ?type=X     — 依服務類型篩選廠商
 */
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

$id = $_GET['id'] ?? null;
$type = $_GET['type'] ?? null;

try {
    if ($id) {
        // 取得單一廠商詳情
        $vendor = dbFetchOne(
            'SELECT * FROM pms_vendor WHERE vendor_id = :id AND is_deleted = "0"',
            [':id' => $id]
        );
        if (!$vendor) {
            jsonResponse(false, null, '找不到該服務商', 404);
        }

        // 取得該廠商的服務類型
        $serviceTypes = dbFetchAll(
            'SELECT service_type FROM pms_vendor_service_type WHERE vendor_id = :id AND is_deleted = "0"',
            [':id' => $id]
        );
        $vendor['service_types'] = array_column($serviceTypes, 'service_type');

        // 取得該廠商的服務地區
        $areas = dbFetchAll(
            'SELECT vsa.county_code, vsa.district_code, c.name AS county_name, d.name AS district_name
             FROM pms_vendor_service_area vsa
             LEFT JOIN sys_county c ON vsa.county_code = c.code
             LEFT JOIN sys_district d ON vsa.district_code = d.code
             WHERE vsa.vendor_id = :id AND vsa.is_deleted = "0"',
            [':id' => $id]
        );
        $vendor['service_areas'] = $areas;

        jsonResponse(true, $vendor);
    }

    // 取得所有廠商
    $sql = 'SELECT v.* FROM pms_vendor v WHERE v.is_deleted = "0" AND v.is_enable = "1"';
    $params = [];

    if ($type) {
        $sql = 'SELECT DISTINCT v.* FROM pms_vendor v
                INNER JOIN pms_vendor_service_type vst ON v.vendor_id = vst.vendor_id
                WHERE v.is_deleted = "0" AND v.is_enable = "1" AND vst.is_deleted = "0" AND vst.service_type = :type';
        $params[':type'] = $type;
    }

    $sql .= ' ORDER BY v.vendor_id';
    $vendors = dbFetchAll($sql, $params);

    // 服務類型對照
    $serviceTypeMap = [
        '01' => '餐廳訂位',
        '02' => '商品購買',
        '03' => '家事服務',
        '04' => '水電修繕',
        '05' => '社區服務',
        '06' => '藥局代領',
        '07' => '叫車服務',
        '08' => '影音娛樂',
    ];

    jsonResponse(true, [
        'vendors'          => $vendors,
        'service_type_map' => $serviceTypeMap,
    ]);

} catch (Exception $e) {
    // 資料庫未建立時回傳模擬資料
    $mockVendors = [
        ['vendor_id' => 1, 'vendor_name' => '美味山海餐廳', 'vendor_no' => 'VD0001', 'contact_name' => '陳主廚', 'rating_avg' => '5.00', 'rating_count' => 1],
        ['vendor_id' => 2, 'vendor_name' => '幸福小舖購物', 'vendor_no' => 'VD0002', 'contact_name' => '林經理', 'rating_avg' => null, 'rating_count' => 0],
        ['vendor_id' => 3, 'vendor_name' => '安心家事服務', 'vendor_no' => 'VD0003', 'contact_name' => '張督導', 'rating_avg' => '4.00', 'rating_count' => 1],
        ['vendor_id' => 4, 'vendor_name' => '快修水電行',   'vendor_no' => 'VD0004', 'contact_name' => '李師傅', 'rating_avg' => null, 'rating_count' => 0],
        ['vendor_id' => 5, 'vendor_name' => '敦親社區服務中心', 'vendor_no' => 'VD0005', 'contact_name' => '黃社工', 'rating_avg' => null, 'rating_count' => 0],
        ['vendor_id' => 6, 'vendor_name' => '康健藥局',     'vendor_no' => 'VD0006', 'contact_name' => '吳藥師', 'rating_avg' => null, 'rating_count' => 0],
        ['vendor_id' => 7, 'vendor_name' => '順風叫車服務', 'vendor_no' => 'VD0007', 'contact_name' => '劉隊長', 'rating_avg' => null, 'rating_count' => 0],
        ['vendor_id' => 8, 'vendor_name' => '歡樂影音娛樂', 'vendor_no' => 'VD0008', 'contact_name' => '周企劃', 'rating_avg' => null, 'rating_count' => 0],
    ];

    $serviceTypeMap = [
        '01' => '餐廳訂位',
        '02' => '商品購買',
        '03' => '家事服務',
        '04' => '水電修繕',
        '05' => '社區服務',
        '06' => '藥局代領',
        '07' => '叫車服務',
        '08' => '影音娛樂',
    ];

    jsonResponse(true, [
        'vendors'          => $mockVendors,
        'service_type_map' => $serviceTypeMap,
    ]);
}
