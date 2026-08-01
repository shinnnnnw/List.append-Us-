<?php
/**
 * 簡易 .env 讀取器（無需 Composer）
 * 將 .env 中的 KEY=VALUE 逐行轉為 putenv()，讓 getenv() 讀得到
 */
function loadEnv(string $path): void {
    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);

        // 略過註解與空行
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        // 必須是 KEY=VALUE 格式
        if (strpos($line, '=') === false) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        // 去除前後引號（若有）
        if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
            (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
            $value = substr($value, 1, -1);
        }

        // 只有在尚未設定時才 putenv，避免覆蓋系統既有環境變數
        if (getenv($key) === false) {
            putenv("$key=$value");
        }
    }
}