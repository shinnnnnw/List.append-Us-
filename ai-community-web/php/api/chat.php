<?php
/**
 * AI 聊天 API
 * POST — 接收使用者訊息，執行意圖辨識，回傳 AI 回覆 + 建議表單
 */
require_once __DIR__ . '/../db.php';
// 聊天不強制登入驗證，允許未登入使用者使用 AI 問答
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, '僅支援 POST 方法', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$message = trim($input['message'] ?? '');

if (!$message) {
    jsonResponse(false, null, '訊息不能為空', 400);
}

// 服務類型代碼對應（對應 pms_vendor_service_type.service_type）
$serviceTypeMap = [
    '01' => '餐廳訂位',
    '02' => '商品購買',
    '03' => '家事服務',
    '04' => '水電修繕',
    '05' => '社區服務諮詢',
    '06' => '藥局',
    '07' => '叫車',
    '08' => '娛樂',
];

// 意圖辨識規則（關鍵字比對）
$intents = [
    [
        'keywords'      => ['吃', '餐廳', '訂位', '用餐', '聚餐', '晚餐', '午餐', '早餐'],
        'intent'        => 'restaurant_booking',
        'reply'         => '辨識到您有餐廳訂位需求，以下是可提供服務的餐廳：',
        'form_id'       => 1,
        'service'       => '餐廳訂位',
        'service_type'  => '01',
    ],
    [
        'keywords'      => ['買', '購物', '商品', '下單', '購買', '採買'],
        'intent'        => 'shopping',
        'reply'         => '辨識到您有商品採買需求，以下是可提供服務的廠商：',
        'form_id'       => 2,
        'service'       => '商品購買',
        'service_type'  => '02',
    ],
    [
        'keywords'      => ['清潔', '打掃', '整理', '洗衣機', '冷氣', '大掃除', '家事'],
        'intent'        => 'cleaning',
        'reply'         => '辨識到您有清潔服務需求，以下是可提供服務的廠商：',
        'form_id'       => 3,
        'service'       => '社區服務',
        'service_type'  => '03',
    ],
    [
        'keywords'      => ['修', '壞', '漏水', '水電', '修繕', '維修', '馬桶', '水龍頭'],
        'intent'        => 'repair',
        'reply'         => '辨識到您有修繕需求，以下是可提供服務的廠商：',
        'form_id'       => 3,
        'service'       => '社區服務',
        'service_type'  => '04',
    ],
    [
        'keywords'      => ['陪伴', '長者', '老人', '照顧', '看護'],
        'intent'        => 'elderly_care',
        'reply'         => '辨識到您有長者陪伴需求，以下是可提供服務的廠商：',
        'form_id'       => 3,
        'service'       => '社區服務',
        'service_type'  => '05',
    ],
    [
        'keywords'      => ['藥', '領藥', '藥局', '處方'],
        'intent'        => 'pharmacy',
        'reply'         => '辨識到您有藥局代領需求，以下是可提供服務的廠商：',
        'form_id'       => 3,
        'service'       => '社區服務',
        'service_type'  => '06',
    ],
    [
        'keywords'      => ['叫車', '計程車', '接送', '交通'],
        'intent'        => 'taxi',
        'reply'         => '辨識到您有叫車需求，以下是可提供服務的廠商：',
        'form_id'       => 3,
        'service'       => '社區服務',
        'service_type'  => '07',
    ],
];

// 比對意圖
$matchedIntent = null;
foreach ($intents as $intent) {
    foreach ($intent['keywords'] as $keyword) {
        if (mb_strpos($message, $keyword) !== false) {
            $matchedIntent = $intent;
            break 2;
        }
    }
}

// 組合回覆
if ($matchedIntent) {
    // 根據 service_type 查詢對應的廠商名單
    $vendors = [];
    if (!empty($matchedIntent['service_type'])) {
        $vendors = dbFetchAll(
            "SELECT v.vendor_id, v.vendor_name, v.rating_avg, v.contact_phone
             FROM pms_vendor v
             INNER JOIN pms_vendor_service_type vst ON v.vendor_id = vst.vendor_id
             WHERE vst.service_type = ?
               AND vst.is_deleted = '0'
               AND v.is_enable = '1'
               AND v.is_deleted = '0'
             ORDER BY v.rating_avg DESC, v.vendor_name ASC",
            [$matchedIntent['service_type']]
        );
    }

    // 組合廠商名稱清單文字
    $vendorListHtml = '';
    if (!empty($vendors)) {
        $vendorListHtml = '<ul class="vendor-list">';
        foreach ($vendors as $vendor) {
            $ratingText = $vendor['rating_avg'] ? "⭐ {$vendor['rating_avg']}" : '';
            $vendorListHtml .= "<li><strong>{$vendor['vendor_name']}</strong> {$ratingText}</li>";
        }
        $vendorListHtml .= '</ul>';
        $vendorListHtml .= '<p>請點擊下方按鈕填寫需求表單，我們會為您媒合合適的服務商。</p>';
    }

    $response = [
        'reply'    => $matchedIntent['reply'] . $vendorListHtml,
        'intent'   => $matchedIntent['intent'],
        'form_id'  => $matchedIntent['form_id'],
        'service'  => $matchedIntent['service'],
        'has_form' => true,
        'vendors'  => $vendors,
    ];
} else {
    $response = [
        'reply'    => '收到您的需求，正在為您媒合社區服務...請問能再具體描述一下您的需求嗎？例如：餐廳訂位、清潔服務、水電修繕等。',
        'intent'   => 'unknown',
        'form_id'  => null,
        'service'  => null,
        'has_form' => false,
        'vendors'  => [],
    ];
}

jsonResponse(true, $response);
