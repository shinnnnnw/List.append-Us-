<?php
/**
 * AI 聊天 API
 * POST — 接收使用者訊息，執行意圖辨識，回傳 AI 回覆 + 建議表單
 */
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../middleware/auth-check.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, '僅支援 POST 方法', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$message = trim($input['message'] ?? '');

if (!$message) {
    jsonResponse(false, null, '訊息不能為空', 400);
}

// 意圖辨識規則（關鍵字比對）
$intents = [
    [
        'keywords'  => ['吃', '餐廳', '訂位', '用餐', '聚餐', '晚餐', '午餐', '早餐'],
        'intent'    => 'restaurant_booking',
        'reply'     => '辨識到您有餐廳訂位需求，已為您產生專屬留資表單，請點擊下方按鈕填寫確認。',
        'form_id'   => 1,
        'service'   => '餐廳訂位',
    ],
    [
        'keywords'  => ['買', '購物', '商品', '下單', '購買', '採買'],
        'intent'    => 'shopping',
        'reply'     => '辨識到您有商品採買需求，已為您產生動態需求表單。',
        'form_id'   => 2,
        'service'   => '商品購買',
    ],
    [
        'keywords'  => ['清潔', '打掃', '整理', '洗衣機', '冷氣', '大掃除', '家事'],
        'intent'    => 'cleaning',
        'reply'     => '辨識到您有清潔服務需求，已為您媒合專業清潔團隊，請填寫需求表單。',
        'form_id'   => 3,
        'service'   => '社區服務',
    ],
    [
        'keywords'  => ['修', '壞', '漏水', '水電', '修繕', '維修', '馬桶', '水龍頭'],
        'intent'    => 'repair',
        'reply'     => '辨識到您有修繕需求，已為您安排專業師傅，請填寫詳細狀況。',
        'form_id'   => 3,
        'service'   => '社區服務',
    ],
    [
        'keywords'  => ['陪伴', '長者', '老人', '照顧', '看護'],
        'intent'    => 'elderly_care',
        'reply'     => '辨識到您有長者陪伴需求，我們的社區服務團隊可以協助，請填寫需求表單。',
        'form_id'   => 3,
        'service'   => '社區服務',
    ],
    [
        'keywords'  => ['藥', '領藥', '藥局', '處方'],
        'intent'    => 'pharmacy',
        'reply'     => '辨識到您有藥局代領需求，請填寫相關資訊。',
        'form_id'   => 3,
        'service'   => '社區服務',
    ],
    [
        'keywords'  => ['叫車', '計程車', '接送', '交通'],
        'intent'    => 'taxi',
        'reply'     => '辨識到您有叫車需求，正在為您媒合附近車輛。',
        'form_id'   => 3,
        'service'   => '社區服務',
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
    $response = [
        'reply'    => $matchedIntent['reply'],
        'intent'   => $matchedIntent['intent'],
        'form_id'  => $matchedIntent['form_id'],
        'service'  => $matchedIntent['service'],
        'has_form' => true,
    ];
} else {
    $response = [
        'reply'    => '收到您的需求，正在為您媒合社區服務...請問能再具體描述一下您的需求嗎？例如：餐廳訂位、清潔服務、水電修繕等。',
        'intent'   => 'unknown',
        'form_id'  => null,
        'service'  => null,
        'has_form' => false,
    ];
}

jsonResponse(true, $response);
