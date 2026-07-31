<?php
/**
 * 縣市區域 API
 * GET             — 回傳所有縣市
 * GET ?county=X   — 回傳該縣市的行政區
 */
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

$countyCode = $_GET['county'] ?? null;

try {
    if ($countyCode) {
        // 取得指定縣市的行政區
        $districts = dbFetchAll(
            'SELECT code, county_code, name, zip FROM sys_district WHERE county_code = :county AND is_deleted = "0" ORDER BY sort',
            [':county' => $countyCode]
        );
        jsonResponse(true, $districts);
    }

    // 取得所有縣市
    $counties = dbFetchAll(
        'SELECT code, name FROM sys_county WHERE is_deleted = "0" ORDER BY sort'
    );
    jsonResponse(true, $counties);

} catch (Exception $e) {
    // 資料庫未建立時回傳模擬資料
    if ($countyCode) {
        $mockDistricts = [
            '01' => [
                ['code' => '001', 'county_code' => '01', 'name' => '松山區', 'zip' => '105'],
                ['code' => '002', 'county_code' => '01', 'name' => '大同區', 'zip' => '103'],
                ['code' => '003', 'county_code' => '01', 'name' => '中山區', 'zip' => '104'],
                ['code' => '004', 'county_code' => '01', 'name' => '信義區', 'zip' => '110'],
                ['code' => '005', 'county_code' => '01', 'name' => '大安區', 'zip' => '106'],
            ],
            '02' => [
                ['code' => '001', 'county_code' => '02', 'name' => '板橋區', 'zip' => '220'],
                ['code' => '002', 'county_code' => '02', 'name' => '三重區', 'zip' => '241'],
                ['code' => '003', 'county_code' => '02', 'name' => '中和區', 'zip' => '235'],
                ['code' => '004', 'county_code' => '02', 'name' => '永和區', 'zip' => '234'],
                ['code' => '005', 'county_code' => '02', 'name' => '新莊區', 'zip' => '242'],
            ],
        ];
        jsonResponse(true, $mockDistricts[$countyCode] ?? []);
    }

    $mockCounties = [
        ['code' => '01', 'name' => '台北市'],
        ['code' => '02', 'name' => '新北市'],
        ['code' => '03', 'name' => '桃園市'],
        ['code' => '04', 'name' => '台中市'],
        ['code' => '05', 'name' => '台南市'],
        ['code' => '06', 'name' => '高雄市'],
        ['code' => '07', 'name' => '基隆市'],
        ['code' => '08', 'name' => '新竹市'],
        ['code' => '09', 'name' => '新竹縣'],
        ['code' => '10', 'name' => '苗栗縣'],
        ['code' => '11', 'name' => '彰化縣'],
        ['code' => '12', 'name' => '南投縣'],
        ['code' => '13', 'name' => '雲林縣'],
        ['code' => '14', 'name' => '嘉義市'],
        ['code' => '15', 'name' => '嘉義縣'],
        ['code' => '16', 'name' => '屏東縣'],
        ['code' => '17', 'name' => '宜蘭縣'],
        ['code' => '18', 'name' => '花蓮縣'],
        ['code' => '19', 'name' => '台東縣'],
        ['code' => '20', 'name' => '澎湖縣'],
    ];
    jsonResponse(true, $mockCounties);
}
