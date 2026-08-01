<?php
/**
 * 資料庫連線封裝
 * 使用 sql/db_config.php 的 mysqli 連線
 */
require_once __DIR__ . '/../sql/db_config.php';

/**
 * 取得 mysqli 連線實例
 */
function getConn() {
    global $conn;
    return $conn;
}

/**
 * 將 PDO 風格的命名參數 (:name) 轉為 mysqli 的 ? 佔位符
 * 同時回傳按順序排列的值陣列
 */
function convertNamedParams(string $sql, array $params): array {
    if (empty($params)) {
        return [$sql, []];
    }

    // 如果 key 不是以 : 開頭，直接回傳（已經是位置參數）
    $firstKey = array_keys($params)[0];
    if ($firstKey[0] !== ':') {
        return [$sql, array_values($params)];
    }

    $values = [];
    // 依照出現在 SQL 中的順序排列值
    $convertedSql = preg_replace_callback('/:[a-zA-Z_][a-zA-Z0-9_]*/', function($match) use ($params, &$values) {
        $key = $match[0];
        $values[] = $params[$key] ?? null;
        return '?';
    }, $sql);

    return [$convertedSql, $values];
}

/**
 * 執行查詢並回傳所有結果（關聯陣列）
 */
function dbFetchAll(string $sql, array $params = []): array {
    $conn = getConn();

    list($convertedSql, $values) = convertNamedParams($sql, $params);

    $stmt = $conn->prepare($convertedSql);
    if ($stmt === false) {
        throw new Exception('SQL prepare failed: ' . $conn->error . ' | SQL: ' . $convertedSql);
    }

    if (!empty($values)) {
        $types = '';
        foreach ($values as $value) {
            if (is_int($value)) {
                $types .= 'i';
            } elseif (is_float($value)) {
                $types .= 'd';
            } else {
                $types .= 's';
            }
        }
        $stmt->bind_param($types, ...$values);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    $stmt->close();
    return $rows;
}

/**
 * 執行查詢並回傳單筆結果
 */
function dbFetchOne(string $sql, array $params = []): ?array {
    $rows = dbFetchAll($sql, $params);
    return $rows[0] ?? null;
}

/**
 * 執行寫入/更新/刪除並回傳影響行數
 */
function dbExecute(string $sql, array $params = []): int {
    $conn = getConn();

    list($convertedSql, $values) = convertNamedParams($sql, $params);

    $stmt = $conn->prepare($convertedSql);
    if ($stmt === false) {
        throw new Exception('SQL prepare failed: ' . $conn->error . ' | SQL: ' . $convertedSql);
    }

    if (!empty($values)) {
        $types = '';
        foreach ($values as $value) {
            if (is_int($value)) {
                $types .= 'i';
            } elseif (is_float($value)) {
                $types .= 'd';
            } else {
                $types .= 's';
            }
        }
        $stmt->bind_param($types, ...$values);
    }

    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();
    return $affected;
}

/**
 * 取得最後插入的 ID
 */
function dbLastInsertId(): string {
    return (string) getConn()->insert_id;
}

/**
 * 統一 JSON 回應
 */
function jsonResponse(bool $success, $data = null, string $message = '', int $httpCode = 200): void {
    http_response_code($httpCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => $success,
        'data'    => $data,
        'message' => $message,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
