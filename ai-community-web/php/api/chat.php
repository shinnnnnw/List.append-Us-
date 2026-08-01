<?php
/**
 * AI 聊天 API
 * POST — 接收使用者訊息，透過 OpenAI API 回覆，同時辨識意圖推薦表單
 */
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../openai_config.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, '僅支援 POST 方法', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$message = trim($input['message'] ?? '');
$history = $input['history'] ?? []; // 前端傳入的對話歷史

if (!$message) {
    jsonResponse(false, null, '訊息不能為空', 400);
}

// System prompt：定義 AI 角色 + 意圖辨識規則
$systemPrompt = <<<PROMPT
你是「Aî 智慧社區管家」，一個友善、專業的 AI 助手，服務於社區住戶。

你的職責：
1. 通用聊天：回答住戶的各種問題，提供生活建議、知識解答等。
2. 意圖辨識：當使用者的訊息涉及以下服務需求時，你必須在回覆中自然地提及該服務，並在回覆的 JSON 結構中標記意圖。

可辨識的服務意圖：
- restaurant_booking（關鍵情境：想吃飯、訂位、餐廳、聚餐、用餐）→ form_id: 1, service: "餐廳訂位"
- shopping（關鍵情境：買東西、購物、商品、採買）→ form_id: 2, service: "商品購買"
- cleaning（關鍵情境：清潔、打掃、整理家裡、大掃除）→ form_id: 3, service: "社區服務"
- repair（關鍵情境：修繕、壞掉、漏水、水電維修）→ form_id: 3, service: "社區服務"
- elderly_care（關鍵情境：長者陪伴、老人照顧、看護）→ form_id: 3, service: "社區服務"
- pharmacy（關鍵情境：領藥、藥局、處方）→ form_id: 3, service: "社區服務"
- taxi（關鍵情境：叫車、計程車、接送）→ form_id: 3, service: "社區服務"

回覆格式規則：
- 你必須以 JSON 格式回覆，格式如下：
{
  "reply": "你的自然語言回覆內容",
  "intent": "辨識到的意圖代碼，沒有則填 none",
  "form_id": 對應的表單ID數字或null,
  "service": "服務名稱或null"
}

- reply 欄位要用自然、親切的語氣回答，可以使用繁體中文。
- 如果辨識到服務需求，在 reply 中自然地引導使用者，例如「我可以幫您安排，請填寫需求表單讓我們為您服務」。
- 如果沒有辨識到特定服務意圖，intent 填 "none"，form_id 和 service 填 null，正常聊天即可。
- 只回傳 JSON，不要加任何其他文字或 markdown 標記。
PROMPT;

// 組合對話歷史（限制最近 10 輪避免 token 過多）
$messages = [
    ['role' => 'system', 'content' => $systemPrompt],
];

// 加入前端傳來的歷史訊息（最多保留最近 10 輪 = 20 條）
$historySlice = array_slice($history, -20);
foreach ($historySlice as $msg) {
    $role = ($msg['sender'] === 'user') ? 'user' : 'assistant';
    $messages[] = ['role' => $role, 'content' => $msg['text'] ?? ''];
}

// 加入當前使用者訊息
$messages[] = ['role' => 'user', 'content' => $message];

// 呼叫 OpenAI API
$aiResult = callOpenAI($messages);

if ($aiResult['success']) {
    $aiContent = $aiResult['content'];

    // 嘗試解析 AI 回覆的 JSON
    $parsed = json_decode($aiContent, true);

    if ($parsed && isset($parsed['reply'])) {
        $response = [
            'reply'    => $parsed['reply'],
            'intent'   => $parsed['intent'] ?? 'none',
            'form_id'  => $parsed['form_id'] ?? null,
            'service'  => $parsed['service'] ?? null,
            'has_form' => !empty($parsed['form_id']),
        ];
    } else {
        // AI 沒有回傳正確 JSON 格式，直接用原始內容當回覆
        $response = [
            'reply'    => $aiContent,
            'intent'   => 'none',
            'form_id'  => null,
            'service'  => null,
            'has_form' => false,
        ];
    }

    jsonResponse(true, $response);
} else {
    // OpenAI API 呼叫失敗，fallback 到關鍵字比對
    $response = fallbackKeywordMatch($message);
    jsonResponse(true, $response);
}

/**
 * 呼叫 OpenAI Chat Completions API
 */
function callOpenAI(array $messages): array
{
    $url = 'https://api.openai.com/v1/chat/completions';

    $payload = json_encode([
        'model'       => OPENAI_MODEL,
        'messages'    => $messages,
        'temperature' => 0.7,
        'max_tokens'  => 800,
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . OPENAI_API_KEY,
        ],
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        error_log("OpenAI cURL Error: " . $curlError);
        return ['success' => false, 'content' => null, 'error' => $curlError];
    }

    if ($httpCode !== 200) {
        error_log("OpenAI API Error (HTTP $httpCode): " . $result);
        return ['success' => false, 'content' => null, 'error' => "HTTP $httpCode"];
    }

    $data = json_decode($result, true);
    $content = $data['choices'][0]['message']['content'] ?? null;

    if (!$content) {
        return ['success' => false, 'content' => null, 'error' => 'No content in response'];
    }

    return ['success' => true, 'content' => trim($content), 'error' => null];
}

/**
 * Fallback：關鍵字比對（當 OpenAI API 不可用時）
 */
function fallbackKeywordMatch(string $message): array
{
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

    foreach ($intents as $intent) {
        foreach ($intent['keywords'] as $keyword) {
            if (mb_strpos($message, $keyword) !== false) {
                return [
                    'reply'    => $intent['reply'],
                    'intent'   => $intent['intent'],
                    'form_id'  => $intent['form_id'],
                    'service'  => $intent['service'],
                    'has_form' => true,
                ];
            }
        }
    }

    return [
        'reply'    => '收到您的需求，請問能再具體描述一下嗎？例如：餐廳訂位、清潔服務、水電修繕等。',
        'intent'   => 'unknown',
        'form_id'  => null,
        'service'  => null,
        'has_form' => false,
    ];
}
