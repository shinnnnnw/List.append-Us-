<?php
/**
 * AI 聊天 API
 * POST — 接收使用者訊息，優先透過 Bedrock Claude 做意圖辨識，
 *         若呼叫失敗則 fallback 回關鍵字比對，回傳 AI 回覆 + 建議表單
 */
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../bedrock.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, '僅支援 POST 方法', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$message = trim($input['message'] ?? '');
$history = $input['history'] ?? [];

if (!$message) {
    jsonResponse(false, null, '訊息不能為空', 400);
}

// 意圖 → form_id 對照
$intentToForm = [
    'restaurant_booking' => ['form_id' => 1, 'service' => '餐廳訂位',   'service_type' => '01'],
    'shopping'           => ['form_id' => 2, 'service' => '商品購買',   'service_type' => '02'],
    'cleaning'           => ['form_id' => 3, 'service' => '社區服務',   'service_type' => '03'],
    'repair'             => ['form_id' => 3, 'service' => '社區服務',   'service_type' => '04'],
    'elderly_care'       => ['form_id' => 3, 'service' => '社區服務',   'service_type' => '05'],
    'pharmacy'           => ['form_id' => 3, 'service' => '社區服務',   'service_type' => '06'],
    'taxi'               => ['form_id' => 3, 'service' => '社區服務',   'service_type' => '07'],
];

/**
 * 依 service_type 查詢對應廠商名單，組成 HTML 清單
 */
function buildVendorListHtml(string $serviceType): array {
    try {
        $vendors = dbFetchAll(
            "SELECT v.vendor_id, v.vendor_name, v.rating_avg, v.contact_phone
             FROM pms_vendor v
             INNER JOIN pms_vendor_service_type vst ON v.vendor_id = vst.vendor_id
             WHERE vst.service_type = ?
               AND vst.is_deleted = '0'
               AND v.is_enable = '1'
               AND v.is_deleted = '0'
             ORDER BY v.rating_avg DESC, v.vendor_name ASC",
            [$serviceType]
        );
    } catch (\Throwable $e) {
        error_log('buildVendorListHtml error: ' . $e->getMessage());
        $vendors = [];
    }

    $html = '';
    if (!empty($vendors)) {
        $html = '<ul class="vendor-list">';
        foreach ($vendors as $vendor) {
            $ratingText = $vendor['rating_avg'] ? ' ⭐ ' . $vendor['rating_avg'] : '';
            $html .= '<li><strong>' . htmlspecialchars($vendor['vendor_name']) . '</strong>' . $ratingText . '</li>';
        }
        $html .= '</ul>';
        $html .= '<p>請點擊下方按鈕填寫需求表單，我們將為您媒合適合的服務商。</p>';
    }

    return [$vendors, $html];
}

/**
 * Fallback：關鍵字比對意圖辨識（Bedrock 不可用時使用）
 */
function fallbackKeywordMatch(string $message): array {
    $intents = [
        ['keywords' => ['吃', '餐廳', '訂位', '用餐', '聚餐', '晚餐', '午餐', '早餐', '吃飯'],
         'intent' => 'restaurant_booking', 'form_id' => 1, 'service' => '餐廳訂位', 'service_type' => '01',
         'reply' => '辨識到您有餐廳訂位需求，以下是可提供服務的餐廳：'],
        ['keywords' => ['買', '購物', '商品', '下單', '購買', '採買', '網購'],
         'intent' => 'shopping', 'form_id' => 2, 'service' => '商品購買', 'service_type' => '02',
         'reply' => '辨識到您有商品採買需求，以下是可提供服務的廠商：'],
        ['keywords' => ['清潔', '打掃', '整理', '洗衣機', '冷氣清洗', '大掃除', '家事'],
         'intent' => 'cleaning', 'form_id' => 3, 'service' => '社區服務', 'service_type' => '03',
         'reply' => '辨識到您有清潔服務需求，以下是可提供服務的廠商：'],
        ['keywords' => ['修', '壞', '漏水', '水電', '修繕', '維修', '馬桶', '水龍頭', '電燈'],
         'intent' => 'repair', 'form_id' => 3, 'service' => '社區服務', 'service_type' => '04',
         'reply' => '辨識到您有修繕需求，以下是可提供服務的廠商：'],
        ['keywords' => ['陪伴', '長者', '老人', '照顧', '看護'],
         'intent' => 'elderly_care', 'form_id' => 3, 'service' => '社區服務', 'service_type' => '05',
         'reply' => '辨識到您有長者陪伴需求，以下是可提供服務的廠商：'],
        ['keywords' => ['藥', '領藥', '藥局', '處方'],
         'intent' => 'pharmacy', 'form_id' => 3, 'service' => '社區服務', 'service_type' => '06',
         'reply' => '辨識到您有藥局代領需求，以下是可提供服務的廠商：'],
        ['keywords' => ['叫車', '計程車', '接送', '交通'],
         'intent' => 'taxi', 'form_id' => 3, 'service' => '社區服務', 'service_type' => '07',
         'reply' => '辨識到您有叫車需求，以下是可提供服務的廠商：'],
    ];

    foreach ($intents as $intent) {
        foreach ($intent['keywords'] as $keyword) {
            if (mb_strpos($message, $keyword) !== false) {
                return $intent;
            }
        }
    }

    return [
        'intent'       => 'none',
        'form_id'      => null,
        'service'      => null,
        'service_type' => null,
        'reply'        => '收到您的需求！請問能再具體描述一下嗎？例如：餐廳訂位、清潔服務、水電修繕等，我可以幫您媒合社區服務。',
    ];
}

// --- System Prompt ---
$systemPrompt = <<<PROMPT
你是「Aî 智慧社區管家」，一個友善、專業的 AI 助手，服務於社區住戶。

你的職責：
1. 通用聊天：回答住戶的各種問題，提供生活建議、知識解答等。
2. 意圖辨識：判斷使用者訊息是否涉及以下服務需求。

可辨識的服務意圖代碼（intent）：
- restaurant_booking：想吃飯、訂位、餐廳、聚餐、用餐
- shopping：買東西、購物、商品、採買
- cleaning：清潔、打掃、整理家裡、大掃除
- repair：修繕、壞掉、漏水、水電維修
- elderly_care：長者陪伴、老人照顧、看護
- pharmacy：領藥、藥局、處方
- taxi：叫車、計程車、接送
- none：以上皆非，一般聊天

回覆規則：
- 你必須「只」回傳 JSON，不要有任何其他文字、說明或 markdown 標記（不要加 ```json）。
- JSON 格式：{"reply": "你的自然語言回覆內容", "intent": "意圖代碼"}
- reply 欄位請用親切、自然的繁體中文回答。
- 若辨識到服務意圖，reply 中請簡短引導使用者，不需要自己列廠商清單（系統會自動附加）。
- 若沒有辨識到特定服務意圖，intent 填 "none"，正常聊天即可。
PROMPT;

// --- 呼叫 Bedrock ---
$aiReply = null;
$parsed  = null;

try {
    $aiReply = callBedrockClaude($message, $systemPrompt);
} catch (\Throwable $e) {
    error_log('Bedrock 呼叫例外: ' . $e->getMessage());
}

if ($aiReply !== null) {
    $cleanReply = trim($aiReply);
    $cleanReply = preg_replace('/^```json\s*|\s*```$/s', '', $cleanReply);
    $cleanReply = preg_replace('/^```\s*|\s*```$/s', '', $cleanReply);

    $decoded = json_decode($cleanReply, true);
    if (is_array($decoded) && isset($decoded['reply'])) {
        $parsed = $decoded;
    }
}

// --- 組裝回應 ---
if ($parsed && isset($parsed['intent'])) {
    $intentCode = $parsed['intent'];

    if ($intentCode !== 'none' && isset($intentToForm[$intentCode])) {
        $mapping = $intentToForm[$intentCode];
        [$vendors, $vendorListHtml] = buildVendorListHtml($mapping['service_type']);

        jsonResponse(true, [
            'reply'    => $parsed['reply'] . $vendorListHtml,
            'intent'   => $intentCode,
            'form_id'  => $mapping['form_id'],
            'service'  => $mapping['service'],
            'has_form' => true,
            'vendors'  => $vendors,
            'source'   => 'bedrock',
        ]);
    } else {
        jsonResponse(true, [
            'reply'    => $parsed['reply'],
            'intent'   => 'none',
            'form_id'  => null,
            'service'  => null,
            'has_form' => false,
            'vendors'  => [],
            'source'   => 'bedrock',
        ]);
    }
} else {
    // Bedrock 失敗 → fallback 關鍵字比對
    $matched = fallbackKeywordMatch($message);

    if (!empty($matched['service_type'])) {
        [$vendors, $vendorListHtml] = buildVendorListHtml($matched['service_type']);
        jsonResponse(true, [
            'reply'    => $matched['reply'] . $vendorListHtml,
            'intent'   => $matched['intent'],
            'form_id'  => $matched['form_id'],
            'service'  => $matched['service'],
            'has_form' => true,
            'vendors'  => $vendors,
            'source'   => 'fallback',
        ]);
    } else {
        jsonResponse(true, [
            'reply'    => $matched['reply'],
            'intent'   => 'none',
            'form_id'  => null,
            'service'  => null,
            'has_form' => false,
            'vendors'  => [],
            'source'   => 'fallback',
        ]);
    }
}
