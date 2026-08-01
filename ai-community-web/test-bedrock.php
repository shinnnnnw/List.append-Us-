<?php
require_once __DIR__ . '/php/config.php';

// --- 除錯用：檢查環境變數是否讀到（不會外洩完整金鑰）---
echo '<h3>環境變數檢查</h3><pre>';
echo 'AWS_ACCESS_KEY_ID: ' . substr(getenv('AWS_ACCESS_KEY_ID') ?: '(空)', 0, 8) . "...\n";
echo 'AWS_SECRET_ACCESS_KEY: ' . (getenv('AWS_SECRET_ACCESS_KEY') ? '(有值，長度' . strlen(getenv('AWS_SECRET_ACCESS_KEY')) . ')' : '(空)') . "\n";
echo 'AWS_SESSION_TOKEN: ' . (getenv('AWS_SESSION_TOKEN') ? '(有值，長度' . strlen(getenv('AWS_SESSION_TOKEN')) . ')' : '(空)') . "\n";
echo 'AWS_REGION: ' . AWS_REGION . "\n";
echo 'BEDROCK_MODEL_ID: ' . BEDROCK_MODEL_ID . "\n";
echo '</pre>';

// --- 檢查 curl 擴充套件 ---
echo '<h3>curl 擴充套件</h3><pre>';
echo extension_loaded('curl') ? 'curl 已啟用' : 'curl 未啟用（這是問題所在）';
echo '</pre>';

/**
 * 除錯版：呼叫 Bedrock InvokeModel API 並印出詳細過程
 */
function callBedrockClaudeDebug($userMessage, $systemPrompt) {
    $accessKey    = getenv('AWS_ACCESS_KEY_ID');
    $secretKey    = getenv('AWS_SECRET_ACCESS_KEY');
    $sessionToken = getenv('AWS_SESSION_TOKEN');
    $region       = AWS_REGION;
    $modelId      = BEDROCK_MODEL_ID;

    $service = 'bedrock';
    $host = 'bedrock-runtime.' . $region . '.amazonaws.com';

    // 單次編碼：實際 HTTP 請求路徑（curl 要打的路徑）
    $modelIdEncodedOnce = rawurlencode($modelId);
    $requestUri = '/model/' . $modelIdEncodedOnce . '/invoke';

    // 雙重編碼：Canonical Request 簽章計算專用路徑（把 % 再編碼成 %25）
    $canonicalUri = '/model/' . str_replace('%', '%25', $modelIdEncodedOnce) . '/invoke';

    $endpoint = 'https://' . $host . $requestUri;

    $bodyArray = array(
        'anthropic_version' => 'bedrock-2023-05-31',
        'max_tokens'        => 500,
        'system'            => $systemPrompt,
        'messages'          => array(
            array('role' => 'user', 'content' => $userMessage),
        ),
    );
    $payload = json_encode($bodyArray, JSON_UNESCAPED_UNICODE);

    $amzDate = gmdate('Ymd\THis\Z');
    $dateStamp = gmdate('Ymd');

    $headersArr = array(
        'content-type' => 'application/json',
        'host'         => $host,
        'x-amz-date'   => $amzDate,
    );
    if ($sessionToken) {
        $headersArr['x-amz-security-token'] = $sessionToken;
    }
    ksort($headersArr);

    $canonicalHeaders = '';
    foreach ($headersArr as $k => $v) {
        $canonicalHeaders = $canonicalHeaders . $k . ':' . $v . "\n";
    }
    $signedHeaders = implode(';', array_keys($headersArr));
    $payloadHash = hash('sha256', $payload);

    // 注意：這裡用 $canonicalUri（雙重編碼版本），不是 $requestUri
    $canonicalRequest = implode("\n", array(
        'POST',
        $canonicalUri,
        '',
        $canonicalHeaders,
        $signedHeaders,
        $payloadHash,
    ));

    $algorithm = 'AWS4-HMAC-SHA256';
    $credentialScope = $dateStamp . '/' . $region . '/' . $service . '/aws4_request';
    $stringToSign = implode("\n", array(
        $algorithm,
        $amzDate,
        $credentialScope,
        hash('sha256', $canonicalRequest),
    ));

    $kSecret = 'AWS4' . $secretKey;
    $kDate = hash_hmac('sha256', $dateStamp, $kSecret, true);
    $kRegion = hash_hmac('sha256', $region, $kDate, true);
    $kService = hash_hmac('sha256', $service, $kRegion, true);
    $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
    $signature = hash_hmac('sha256', $stringToSign, $kSigning);

    $authHeader = $algorithm . ' Credential=' . $accessKey . '/' . $credentialScope . ', SignedHeaders=' . $signedHeaders . ', Signature=' . $signature;

    $headers = array(
        'Content-Type: application/json',
        'X-Amz-Date: ' . $amzDate,
        'Authorization: ' . $authHeader,
    );
    if ($sessionToken) {
        $headers[] = 'X-Amz-Security-Token: ' . $sessionToken;
    }

    // curl 打的是 $endpoint（單次編碼版本的路徑）
    $ch = curl_init($endpoint);
    curl_setopt_array($ch, array(
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
    ));

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    echo '<h3>請求資訊</h3><pre>';
    echo 'Endpoint: ' . htmlspecialchars($endpoint) . "\n";
    echo 'HTTP Code: ' . $httpCode . "\n";
    echo 'cURL Error: ' . ($curlError ? htmlspecialchars($curlError) : '(無)') . "\n";
    echo '</pre>';

    echo '<h3>回應內容</h3><pre>';
    echo htmlspecialchars($response ? $response : '(空)');
    echo '</pre>';
}

$systemPrompt = '你是一個友善的助理，請用一句話回覆。';
callBedrockClaudeDebug('請用一句話自我介紹', $systemPrompt);