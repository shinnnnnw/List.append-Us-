<?php
/**
 * 純 PHP 呼叫 Bedrock InvokeModel API（不需要 composer / aws-sdk-php）
 */
function callBedrockClaude(string $userMessage, string $systemPrompt = ''): ?string {
    $accessKey    = getenv('AWS_ACCESS_KEY_ID');
    $secretKey    = getenv('AWS_SECRET_ACCESS_KEY');
    $sessionToken = getenv('AWS_SESSION_TOKEN');
    $region       = AWS_REGION;
    $modelId      = BEDROCK_MODEL_ID;

    $service = 'bedrock';
    $host    = "bedrock-runtime.$region.amazonaws.com";

    // 單次編碼：實際 HTTP 請求路徑（curl 要打的路徑）
    $modelIdEncodedOnce = rawurlencode($modelId);
    $requestUri = '/model/' . $modelIdEncodedOnce . '/invoke';

    // 雙重編碼：Canonical Request 簽章計算專用路徑
    $canonicalUri = '/model/' . str_replace('%', '%25', $modelIdEncodedOnce) . '/invoke';

    $endpoint = "https://$host$requestUri";

    $payload = json_encode([
        'anthropic_version' => 'bedrock-2023-05-31',
        'max_tokens'        => 500,
        'system'            => $systemPrompt,
        'messages'          => [
            ['role' => 'user', 'content' => $userMessage],
        ],
    ], JSON_UNESCAPED_UNICODE);

    // --- AWS Signature V4 ---
    $amzDate   = gmdate('Ymd\THis\Z');
    $dateStamp = gmdate('Ymd');

    $headersArr = [
        'content-type' => 'application/json',
        'host'         => $host,
        'x-amz-date'   => $amzDate,
    ];
    if ($sessionToken) {
        $headersArr['x-amz-security-token'] = $sessionToken;
    }
    ksort($headersArr);

    $canonicalHeaders = '';
    foreach ($headersArr as $k => $v) $canonicalHeaders .= "$k:$v\n";
    $signedHeaders = implode(';', array_keys($headersArr));
    $payloadHash = hash('sha256', $payload);

    $canonicalRequest = implode("\n", [
        'POST', $canonicalUri, '', $canonicalHeaders, $signedHeaders, $payloadHash,
    ]);

    $algorithm = 'AWS4-HMAC-SHA256';
    $credentialScope = "$dateStamp/$region/$service/aws4_request";
    $stringToSign = implode("\n", [
        $algorithm, $amzDate, $credentialScope, hash('sha256', $canonicalRequest),
    ]);

    $kSecret  = 'AWS4' . $secretKey;
    $kDate    = hash_hmac('sha256', $dateStamp, $kSecret, true);
    $kRegion  = hash_hmac('sha256', $region, $kDate, true);
    $kService = hash_hmac('sha256', $service, $kRegion, true);
    $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
    $signature = hash_hmac('sha256', $stringToSign, $kSigning);

    $authHeader = "$algorithm Credential=$accessKey/$credentialScope, SignedHeaders=$signedHeaders, Signature=$signature";

    $headers = [
        'Content-Type: application/json',
        "X-Amz-Date: $amzDate",
        "Authorization: $authHeader",
    ];
    if ($sessionToken) $headers[] = "X-Amz-Security-Token: $sessionToken";

    // --- 送出 cURL 請求 ---
    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
    ]);

    $response  = curl_exec($ch);
    $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        error_log('Bedrock cURL error: ' . $curlError);
        return null;
    }
    if ($httpCode !== 200) {
        error_log("Bedrock API error (HTTP $httpCode): $response");
        return null;
    }

    $data = json_decode($response, true);
    return $data['content'][0]['text'] ?? null;
}