<?php
/**
 * 表單結構 API
 * GET ?form_id=X — 回傳表單主檔 + 題組 + 題目 + 選項
 */
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

$formId = $_GET['form_id'] ?? null;

if (!$formId) {
    jsonResponse(false, null, '缺少 form_id 參數', 400);
}

try {
    // 取得表單主檔
    $form = dbFetchOne(
        'SELECT * FROM pms_form WHERE id = :id AND is_deleted = "0"',
        [':id' => $formId]
    );

    if (!$form) {
        jsonResponse(false, null, '找不到該表單', 404);
    }

    // 取得題組
    $groups = dbFetchAll(
        'SELECT * FROM pms_form_group WHERE form_id = :form_id ORDER BY sort',
        [':form_id' => $formId]
    );

    // 取得題目
    $topics = dbFetchAll(
        'SELECT * FROM pms_form_topic WHERE form_id = :form_id ORDER BY sort',
        [':form_id' => $formId]
    );

    // 取得選項
    $options = dbFetchAll(
        'SELECT * FROM pms_topic_option WHERE form_id = :form_id ORDER BY topic_id, sort',
        [':form_id' => $formId]
    );

    // 取得題目圖片
    $media = dbFetchAll(
        'SELECT * FROM pms_topic_media WHERE form_id = :form_id ORDER BY topic_id, sort',
        [':form_id' => $formId]
    );

    // 取得地區限制
    $countyRelations = dbFetchAll(
        'SELECT * FROM pms_topic_county_district_relation WHERE form_id = :form_id',
        [':form_id' => $formId]
    );

    // 將選項和圖片依 topic_id 分組
    $optionsByTopic = [];
    foreach ($options as $opt) {
        $optionsByTopic[$opt['topic_id']][] = $opt;
    }

    $mediaByTopic = [];
    foreach ($media as $m) {
        $mediaByTopic[$m['topic_id']][] = $m;
    }

    // 組合題目資料
    foreach ($topics as &$topic) {
        $topic['options'] = $optionsByTopic[$topic['id']] ?? [];
        $topic['media'] = $mediaByTopic[$topic['id']] ?? [];
        if ($topic['feature']) {
            $topic['feature'] = json_decode($topic['feature'], true);
        }
    }
    unset($topic);

    // 組合題組與題目
    foreach ($groups as &$group) {
        $group['topics'] = array_values(array_filter($topics, function($t) use ($group) {
            return $t['form_group_id'] == $group['id'];
        }));
    }
    unset($group);

    jsonResponse(true, [
        'form'             => $form,
        'groups'           => $groups,
        'topics'           => $topics,
        'county_relations' => $countyRelations,
    ]);

} catch (Exception $e) {
    // 資料庫未建立時回傳模擬資料
    $mockForm = [
        'id' => (int)$formId,
        'name' => '服務需求表單',
        'intro_content' => '<p>請填寫以下資訊，我們將盡快為您安排服務。</p>',
        'notice_content' => '<ol><li>服務時間以預約確認為準</li><li>如需取消請提前24小時通知</li></ol>',
        'terms_content' => '<p>提交表單即表示您同意我們的服務條款。</p>',
    ];

    $mockTopics = [
        ['id' => 1, 'form_id' => (int)$formId, 'form_group_id' => 1, 'type' => '10', 'title' => '聯絡資料', 'remark' => '請填寫您的聯絡方式', 'is_required' => '1', 'sort' => 1, 'options' => [], 'media' => [], 'feature' => null],
        ['id' => 2, 'form_id' => (int)$formId, 'form_group_id' => 1, 'type' => '3',  'title' => '方便聯絡時間', 'remark' => null, 'is_required' => '1', 'sort' => 2, 'options' => [
            ['id' => 1, 'topic_id' => 2, 'option_name' => '上午', 'sort' => 1],
            ['id' => 2, 'topic_id' => 2, 'option_name' => '下午', 'sort' => 2],
            ['id' => 3, 'topic_id' => 2, 'option_name' => '皆可', 'sort' => 3],
        ], 'media' => [], 'feature' => null],
        ['id' => 3, 'form_id' => (int)$formId, 'form_group_id' => 1, 'type' => '5',  'title' => '服務地址', 'remark' => null, 'is_required' => '1', 'sort' => 3, 'options' => [], 'media' => [], 'feature' => null],
        ['id' => 4, 'form_id' => (int)$formId, 'form_group_id' => 1, 'type' => '2',  'title' => '其他需求說明', 'remark' => '請描述您的需求細節', 'is_required' => '0', 'sort' => 4, 'options' => [], 'media' => [], 'feature' => null],
    ];

    jsonResponse(true, [
        'form'             => $mockForm,
        'groups'           => [['id' => 1, 'form_id' => (int)$formId, 'name' => '基本資訊', 'sort' => 1]],
        'topics'           => $mockTopics,
        'county_relations' => [],
    ]);
}
