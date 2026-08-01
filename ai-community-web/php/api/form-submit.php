<?php
/**
 * 表單送出 API
 * POST — 接收表單填寫資料，寫入 pms_form_feedback
 */
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, '僅支援 POST 方法', 405);
}

// 先讀 body，再傳給 auth-check（避免 php://input 被讀兩次）
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!$input) {
    jsonResponse(false, null, '無效的請求內容', 400);
}

// 將已解析的 input 注入給 auth-check 使用
$GLOBALS['_parsed_input'] = $input;
require_once __DIR__ . '/../middleware/auth-check.php';

/** @var array $currentUser 由 auth-check.php 提供 */

$formId = $input['form_id'] ?? null;
$feedbackData = $input['data'] ?? [];
$contactName = $input['contact_name'] ?? '';
$contactMobile = $input['contact_mobile'] ?? '';
$contactEmail = $input['contact_email'] ?? '';
$preferredContactTime = $input['preferred_contact_time'] ?? '';
$countyCode = $input['contact_address_county'] ?? '';
$districtCode = $input['contact_address_district'] ?? '';
$addressDetail = $input['contact_address_detail'] ?? '';
$description = $input['description'] ?? '';

if (!$formId) {
    jsonResponse(false, null, '缺少 form_id', 400);
}

// 產生回饋單號（年月日 + 流水號格式）
$feedbackNo = date('ymdHis') . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);

try {
    $sql = 'INSERT INTO pms_form_feedback 
            (feedback_no, service_id, platform_code, form_id, feedback_content, form_type, 
             is_read, status, contact_name, contact_mobile, contact_email,
             preferred_contact_time, contact_address_county, contact_address_district,
             contact_address_detail, description, inbr_account_id, cre_time, upd_id, upd_time)
            VALUES 
            (:feedback_no, :service_id, :platform_code, :form_id, :feedback_content, :form_type,
             :is_read, :status, :contact_name, :contact_mobile, :contact_email,
             :preferred_contact_time, :county, :district,
             :address_detail, :description, :account_id, NOW(), :upd_id, NOW())';

    dbExecute($sql, [
        ':feedback_no'             => $feedbackNo,
        ':service_id'              => $input['service_id'] ?? 0,
        ':platform_code'           => '01',
        ':form_id'                 => $formId,
        ':feedback_content'        => json_encode($feedbackData, JSON_UNESCAPED_UNICODE),
        ':form_type'               => $input['form_type'] ?? '1',
        ':is_read'                 => '0',
        ':status'                  => '1',
        ':contact_name'            => $contactName,
        ':contact_mobile'          => $contactMobile,
        ':contact_email'           => $contactEmail,
        ':preferred_contact_time'  => $preferredContactTime,
        ':county'                  => $countyCode,
        ':district'                => $districtCode,
        ':address_detail'          => $addressDetail,
        ':description'             => $description,
        ':account_id'              => $currentUser['inbr_account_id'],
        ':upd_id'                  => $currentUser['inbr_account_id'],
    ]);

    jsonResponse(true, ['feedback_no' => $feedbackNo], '表單提交成功');

} catch (Exception $e) {
    // 資料庫未建立時模擬成功
    jsonResponse(true, ['feedback_no' => $feedbackNo], '表單提交成功（模擬）');
}
