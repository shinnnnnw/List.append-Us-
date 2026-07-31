-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1:3306
-- 產生時間： 2026-07-08 08:57:51
-- 伺服器版本： 8.0.17
-- PHP 版本： 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- 資料庫： `202607_hackson`
--

-- --------------------------------------------------------

--
-- 資料表結構 `mms_order_record`
--

CREATE TABLE `mms_order_record` (
  `record_id` bigint(20) NOT NULL COMMENT '系統內部ID，自動遞增',
  `order_no` varchar(50) NOT NULL COMMENT '訂單/訂位編號，服務商提供的唯一編號',
  `service_vendor_id` int(11) NOT NULL COMMENT '服務提供商ID',
  `service_id` int(11) NOT NULL COMMENT '服務ID',
  `platform_code` varchar(2) NOT NULL COMMENT '平台代號，01:OP APP',
  `inbr_account_id` char(36) NOT NULL COMMENT '會員編號uuid',
  `member_name` blob COMMENT '會員姓名',
  `member_name_hash` varchar(50) DEFAULT NULL COMMENT '會員姓名hash',
  `member_phone` blob COMMENT '會員電話密文',
  `member_phone_hash` varchar(50) DEFAULT NULL COMMENT '會員手機號碼hash',
  `member_email` blob COMMENT '會員Email密文',
  `member_email_hash` varchar(50) DEFAULT NULL COMMENT '會員Email hash',
  `order_type` varchar(2) NOT NULL COMMENT '訂單類型，01:服務訂單, 02:訂位, 03:預約, 04:其他,05:商品訂單,06訂餐',
  `order_status` varchar(2) NOT NULL COMMENT '訂單狀態，依據訂單類型使用：\r\n【01:服務訂單】使用：\r\n11:待訂金支付,12:已支付訂金，待報價,13:已報價，待客戶同意,14:客戶同意報價,15:已驗收，待尾款支付\r\n80:已完成, 90:已取消,98:部分退款,99:已退款\r\n\r\n【 02:訂位】使用：\r\n01:待付款,02:待確認, 03:已確認, 04:進行中,70:已完成(預定時間後3小時), 80:已完成(7天後核銷), 90:已取消, 99:已退款\r\n\r\n【 03:預約, 04:其他,05:商品訂單,06:訂餐】使用：\r\n01:待付款,02:待確認, 03:已確認, 04:進行中, 80:已完成, 90:已取消, 99:已退款',
  `order_time` datetime NOT NULL COMMENT '訂單建立時間',
  `deposit_time` datetime DEFAULT NULL COMMENT '訂金支付時間',
  `confirm_time` datetime DEFAULT NULL COMMENT '確認時間',
  `service_time` datetime DEFAULT NULL COMMENT '服務/使用時間',
  `complete_time` datetime DEFAULT NULL COMMENT '完成時間，用於判斷點數發放時機',
  `cancel_time` datetime DEFAULT NULL COMMENT '取消時間',
  `deposit_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '訂金金額',
  `original_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '原始金額',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '折扣金額',
  `shipping_fee_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '運費金額',
  `final_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '實付金額，作為點數計算基礎',
  `refund_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '退款金額',
  `order_points` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '點數費用(訂單點數使用)',
  `used_points` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '使用點數折抵金額',
  `refund_points` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '退回點數',
  `earn_points` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '應獲得點數，由點數計算引擎填入',
  `point_status` varchar(2) NOT NULL DEFAULT '01' COMMENT '點數發放狀態，01:待發放, 02:已發放, 03:不發放, 04:已取消',
  `point_grant_time` datetime DEFAULT NULL COMMENT '點數發放時間',
  `vendor_data` json DEFAULT NULL COMMENT '服務商特定欄位，JSON格式儲存各服務商的特殊資料',
  `order_items` json DEFAULT NULL COMMENT '訂單項目明細，JSON陣列格式',
  `remark` text COMMENT '備註說明',
  `cancel_reason` text COMMENT '取消原因',
  `refund_reason` text COMMENT '退款原因',
  `source_file` varchar(200) DEFAULT NULL COMMENT '來源檔案名稱，用於追蹤資料來源',
  `import_batch` varchar(50) DEFAULT NULL COMMENT '匯入批次號，格式建議: YYYYMMDD_HHmmss_ServiceID',
  `quote_approved_by` char(36) DEFAULT NULL COMMENT '報價審核者編號',
  `quote_approved_time` datetime DEFAULT NULL COMMENT '報價審核時間',
  `quote_no` varchar(64) DEFAULT NULL COMMENT '報價單no',
  `comment_status` varchar(2) NOT NULL DEFAULT '00' COMMENT '評價狀態，00:無須評價,01:未評價, 02:已評價',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否刪除',
  `cre_id` char(36) NOT NULL COMMENT '新增者編號',
  `cre_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '新增日期時間',
  `upd_id` char(36) NOT NULL COMMENT '異動者編號',
  `upd_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '異動日期時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='訂單/訂位統一紀錄表，接收所有服務商的交易資料';

--
-- 傾印資料表的資料 `mms_order_record`
--

INSERT INTO `mms_order_record` (`record_id`, `order_no`, `service_vendor_id`, `service_id`, `platform_code`, `inbr_account_id`, `member_name`, `member_name_hash`, `member_phone`, `member_phone_hash`, `member_email`, `member_email_hash`, `order_type`, `order_status`, `order_time`, `deposit_time`, `confirm_time`, `service_time`, `complete_time`, `cancel_time`, `deposit_amount`, `original_amount`, `discount_amount`, `shipping_fee_amount`, `final_amount`, `refund_amount`, `order_points`, `used_points`, `refund_points`, `earn_points`, `point_status`, `point_grant_time`, `vendor_data`, `order_items`, `remark`, `cancel_reason`, `refund_reason`, `source_file`, `import_batch`, `quote_approved_by`, `quote_approved_time`, `quote_no`, `comment_status`, `is_deleted`, `cre_id`, `cre_time`, `upd_id`, `upd_time`) VALUES
(1, 'ORD20260701001', 1, 101, '01', 'c0000000-0000-0000-0000-000000000001', 0xe78e8be5b08fe6988e, 'acf979cc584e1cf9c18c65bffae9e53cbc18634f90042072cc', 0x30393132333435303031, 'a7e5f59932cfb16320caf11b09b6eab897adb60f2cf37a62a7', NULL, NULL, '02', '80', '2026-07-01 18:00:00', NULL, '2026-07-01 18:05:00', '2026-07-05 19:00:00', '2026-07-05 22:00:00', NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 50.00, '02', '2026-07-05 22:05:00', '{\"table_size\": 4}', NULL, '窗邊座位', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '02', 0, '00000000-0000-0000-0000-000000000001', '2026-07-01 18:00:00', '00000000-0000-0000-0000-000000000001', '2026-07-05 22:05:00'),
(2, 'ORD20260702002', 1, 101, '01', 'c0000000-0000-0000-0000-000000000007', 0xe894a1e5b08fe5a790, '6178b73afbfce21cf58f34cf8633b66cc843e1dfed27f9920c', 0x30393132333435303037, 'd06b9760fcac0f1d111d4f66b3558c1c6d8c49dfa413d9474c', NULL, NULL, '02', '02', '2026-07-02 10:00:00', NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '00', 0, '00000000-0000-0000-0000-000000000001', '2026-07-02 10:00:00', '00000000-0000-0000-0000-000000000001', '2026-07-02 10:00:00'),
(3, 'ORD20260702003', 2, 102, '01', 'c0000000-0000-0000-0000-000000000003', 0xe5bcb5e7be8ee78eb2, 'd1c83f14b8bac73ae9f8aaa2a3ed15411fdedce7ac7928b267', 0x30393132333435303033, '7ea0206efd85a57714a5dc61865940752feadcac85ea31c7c8', 0x6368616e673033406578616d706c652e636f6d, 'a3fbc19ef5c7788827c1f3b7fb9efa86ed4664f5c3ef66ef14', '05', '80', '2026-07-02 15:00:00', NULL, '2026-07-02 15:10:00', NULL, '2026-07-04 10:00:00', NULL, 0.00, 1200.00, 100.00, 60.00, 1160.00, 0.00, 0.00, 0.00, 0.00, 23.00, '02', '2026-07-04 10:05:00', NULL, '[{\"qty\": 1, \"item\": \"睡袋\", \"price\": 900}, {\"qty\": 1, \"item\": \"爐具\", \"price\": 300}]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '01', 0, '00000000-0000-0000-0000-000000000001', '2026-07-02 15:00:00', '00000000-0000-0000-0000-000000000001', '2026-07-04 10:05:00'),
(4, 'ORD20260703004', 2, 102, '01', 'c0000000-0000-0000-0000-000000000004', 0xe999b3e5bbbae5ae8f, '58ac6be07bc86993eeaa79a5a1c562c5ad012f4063d72bd67d', 0x30393132333435303034, '7e0d4e12b9722d912aadc1c3299ba62e024157fc996e9f46e3', NULL, NULL, '05', '01', '2026-07-03 09:30:00', NULL, NULL, NULL, NULL, NULL, 0.00, 1500.00, 0.00, 80.00, 1580.00, 0.00, 0.00, 0.00, 0.00, 0.00, '01', NULL, NULL, '[{\"qty\": 1, \"item\": \"生鮮蔬果箱\", \"price\": 1500}]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '00', 0, '00000000-0000-0000-0000-000000000001', '2026-07-03 09:30:00', '00000000-0000-0000-0000-000000000001', '2026-07-03 09:30:00'),
(5, 'ORD20260704005', 3, 103, '01', 'c0000000-0000-0000-0000-000000000005', 0xe58a89e998bfe5a7a8, '77e88a63087ee2a4e9f51ef09bf88666979aaff632a132da09', 0x30393132333435303035, '5d4f8e23ddfb90e597905396cc290956beebcb38260bf1d7ec', NULL, NULL, '01', '80', '2026-07-04 08:00:00', '2026-07-04 08:30:00', '2026-07-04 09:00:00', '2026-07-06 09:00:00', '2026-07-06 11:00:00', NULL, 500.00, 1800.00, 0.00, 0.00, 1800.00, 0.00, 0.00, 0.00, 0.00, 36.00, '02', '2026-07-06 11:05:00', NULL, NULL, '固定每週打掃', NULL, NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', '2026-07-04 08:30:00', 'QT20260704001', '02', 0, '00000000-0000-0000-0000-000000000001', '2026-07-04 08:00:00', '00000000-0000-0000-0000-000000000001', '2026-07-06 11:05:00'),
(6, 'ORD20260705006', 4, 104, '01', 'c0000000-0000-0000-0000-000000000006', 0xe8a8b1e58588e7949f, 'dc3ff0ad09b9969029e386437ffdf86aafb4c5a3ec116152b5', 0x30393132333435303036, 'af8ca5b905c8cc2ac9d03e9a00c822ede0dd97a9554fe11b86', 0x6873753036406578616d706c652e636f6d, '87adc4f058f89f50081aaaec9c015cbcd245623cbd3ebca3f1', '01', '12', '2026-07-05 16:00:00', '2026-07-05 16:30:00', NULL, NULL, NULL, NULL, 300.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '01', NULL, NULL, NULL, '水龍頭漏水報價中', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '00', 0, '00000000-0000-0000-0000-000000000001', '2026-07-05 16:00:00', '00000000-0000-0000-0000-000000000001', '2026-07-05 16:30:00'),
(7, 'ORD20260706007', 6, 105, '01', 'c0000000-0000-0000-0000-000000000002', 0xe69d8ee5b08fe88faf, '8b53bf5e589f6f235956e58f1eedd74f15fb00c15841ba90ec', 0x30393132333435303032, '2885410c7354af6ca0db719a20200a5f25a8eeb3b98eded040', NULL, NULL, '04', '80', '2026-07-06 11:00:00', NULL, '2026-07-06 11:05:00', NULL, '2026-07-06 11:30:00', NULL, 0.00, 350.00, 0.00, 0.00, 350.00, 0.00, 0.00, 0.00, 0.00, 7.00, '02', '2026-07-06 11:35:00', NULL, '[{\"qty\": 1, \"item\": \"血壓藥\", \"price\": 350}]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '02', 0, '00000000-0000-0000-0000-000000000001', '2026-07-06 11:00:00', '00000000-0000-0000-0000-000000000001', '2026-07-06 11:35:00'),
(8, 'ORD20260707008', 7, 106, '01', 'c0000000-0000-0000-0000-000000000008', 0xe984ade5908ce5adb8, 'c7819ef0e4d2d3ce49bc559ebcc0de222890766a16ceaf79a0', 0x30393132333435303038, 'f24b00c12fe5a45e12acd9dadd08392797f68797c9ad17b0fb', NULL, NULL, '04', '80', '2026-07-07 20:00:00', NULL, '2026-07-07 20:01:00', '2026-07-07 20:05:00', '2026-07-07 20:35:00', NULL, 0.00, 280.00, 0.00, 0.00, 280.00, 0.00, 0.00, 0.00, 0.00, 5.00, '02', '2026-07-07 20:40:00', '{\"pickup\": \"台北車站\", \"dropoff\": \"高雄左營\"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '00', 0, '00000000-0000-0000-0000-000000000001', '2026-07-07 20:00:00', '00000000-0000-0000-0000-000000000001', '2026-07-07 20:40:00');

-- --------------------------------------------------------

--
-- 資料表結構 `pms_case_assignment`
--

CREATE TABLE `pms_case_assignment` (
  `assignment_id` int(11) NOT NULL COMMENT '派案記錄ID',
  `feedback_no` varchar(16) NOT NULL COMMENT '諮詢單號(對應 pms_form_feedback.feedback_no)',
  `vendor_id` int(11) NOT NULL COMMENT '廠商ID(對應 pms_vendor.vendor_id)',
  `assign_time` datetime NOT NULL COMMENT '派案時間',
  `assign_type` varchar(2) NOT NULL COMMENT '派案方式:01->系統自動媒合,02->廠商自行認領,03->人工指派',
  `match_score` decimal(5,2) DEFAULT NULL COMMENT '媒合分數(推薦排序依據，分數越高越優先)',
  `accept_status` varchar(2) NOT NULL COMMENT '承接狀態:01->待回應,02->已受理,03->已婉拒,04->處理中,05->已完成,06->已取消',
  `accept_time` datetime DEFAULT NULL COMMENT '受理時間',
  `reject_reason` varchar(500) DEFAULT NULL COMMENT '婉拒原因',
  `is_primary` varchar(2) NOT NULL COMMENT '是否為主要承接廠商:0->否(候選/已淘汰)；1->是(目前承接中)',
  `remark` varchar(500) DEFAULT NULL COMMENT '備註',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL COMMENT '異動者編號',
  `cre_id` char(36) NOT NULL COMMENT '新增者編號'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='諮詢單與廠商派案/媒合記錄檔';

--
-- 傾印資料表的資料 `pms_case_assignment`
--

INSERT INTO `pms_case_assignment` (`assignment_id`, `feedback_no`, `vendor_id`, `assign_time`, `assign_type`, `match_score`, `accept_status`, `accept_time`, `reject_reason`, `is_primary`, `remark`, `upd_time`, `cre_time`, `upd_id`, `cre_id`) VALUES
(1, 'FB2607050001', 1, '2026-07-05 18:30:00', '01', 92.50, '05', '2026-07-05 18:40:00', NULL, '1', NULL, '2026-07-05 18:40:00', '2026-07-05 18:30:00', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
(2, 'FB2607060003', 2, '2026-07-06 14:10:00', '01', 88.00, '04', '2026-07-06 14:30:00', NULL, '1', NULL, '2026-07-06 14:30:00', '2026-07-06 14:10:00', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
(3, 'FB2607070005', 3, '2026-07-07 09:00:00', '02', NULL, '05', '2026-07-07 09:15:00', NULL, '1', NULL, '2026-07-07 09:15:00', '2026-07-07 09:00:00', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
(4, 'FB2607070006', 4, '2026-07-07 16:30:00', '01', 95.00, '04', '2026-07-07 16:45:00', NULL, '1', NULL, '2026-07-07 16:45:00', '2026-07-07 16:30:00', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
(5, 'FB2607080007', 1, '2026-07-08 09:05:00', '01', 90.00, '06', NULL, NULL, '1', '顧客因故取消訂位', '2026-07-08 09:10:00', '2026-07-08 09:05:00', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

-- --------------------------------------------------------

--
-- 資料表結構 `pms_case_reply`
--

CREATE TABLE `pms_case_reply` (
  `reply_id` int(11) NOT NULL COMMENT '回覆記錄ID',
  `assignment_id` int(11) NOT NULL COMMENT '派案記錄ID(對應 pms_case_assignment.assignment_id)',
  `reply_type` varchar(2) NOT NULL COMMENT '類型:01->電話聯繫,02->訊息回覆,03->內部備註,04->狀態變更說明',
  `reply_content` text COMMENT '回覆/聯繫內容',
  `reply_time` datetime NOT NULL COMMENT '回覆/聯繫時間',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL COMMENT '異動者編號',
  `cre_id` char(36) NOT NULL COMMENT '新增者編號(對應 pms_vendor_account.account_id)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='廠商案件回覆/聯繫紀錄檔';

--
-- 傾印資料表的資料 `pms_case_reply`
--

INSERT INTO `pms_case_reply` (`reply_id`, `assignment_id`, `reply_type`, `reply_content`, `reply_time`, `upd_time`, `cre_time`, `upd_id`, `cre_id`) VALUES
(1, 1, '02', '已透過訊息確認訂位，期待您光臨！', '2026-07-05 18:40:00', '2026-07-05 18:40:00', '2026-07-05 18:40:00', NULL, '00000000-0000-0000-0000-000000000001'),
(2, 2, '01', '已致電客戶確認商品品項與數量', '2026-07-06 14:30:00', '2026-07-06 14:30:00', '2026-07-06 14:30:00', NULL, '00000000-0000-0000-0000-000000000001'),
(3, 2, '03', '備貨中，預計7/8出貨', '2026-07-07 09:00:00', '2026-07-07 09:00:00', '2026-07-07 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(4, 3, '02', '已完成到府打掃，客戶滿意', '2026-07-07 11:30:00', '2026-07-07 11:30:00', '2026-07-07 11:30:00', NULL, '00000000-0000-0000-0000-000000000001'),
(5, 4, '01', '師傅已電聯，預約7/9上午到府維修', '2026-07-07 16:45:00', '2026-07-07 16:45:00', '2026-07-07 16:45:00', NULL, '00000000-0000-0000-0000-000000000001'),
(6, 5, '04', '客戶來電表示臨時有事取消訂位', '2026-07-08 09:10:00', '2026-07-08 09:10:00', '2026-07-08 09:10:00', NULL, '00000000-0000-0000-0000-000000000001');

-- --------------------------------------------------------

--
-- 資料表結構 `pms_case_review`
--

CREATE TABLE `pms_case_review` (
  `review_id` int(11) NOT NULL COMMENT '評價ID',
  `feedback_no` varchar(16) NOT NULL COMMENT '諮詢單號(對應 pms_form_feedback.feedback_no)',
  `assignment_id` int(11) DEFAULT NULL COMMENT '派案記錄ID(對應 pms_case_assignment.assignment_id)',
  `vendor_id` int(11) NOT NULL COMMENT '廠商ID(對應 pms_vendor.vendor_id)',
  `rating_score` tinyint(4) NOT NULL COMMENT '評分(1~5)',
  `rating_content` varchar(500) DEFAULT NULL COMMENT '評價內容',
  `is_anonymous` varchar(2) NOT NULL DEFAULT '0' COMMENT '是否匿名:0->否；1->是',
  `review_time` datetime NOT NULL COMMENT '評價時間',
  `is_deleted` varchar(2) NOT NULL COMMENT '刪除註記:0->未刪除；1->已刪除',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL COMMENT '異動者編號',
  `cre_id` char(36) NOT NULL COMMENT '新增者編號'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='消費者案件評分/評價檔';

--
-- 傾印資料表的資料 `pms_case_review`
--

INSERT INTO `pms_case_review` (`review_id`, `feedback_no`, `assignment_id`, `vendor_id`, `rating_score`, `rating_content`, `is_anonymous`, `review_time`, `is_deleted`, `upd_time`, `cre_time`, `upd_id`, `cre_id`) VALUES
(1, 'FB2607050001', 1, 1, 5, '訂位順利，服務態度很好！', '0', '2026-07-05 20:00:00', '0', '2026-07-05 20:00:00', '2026-07-05 20:00:00', NULL, 'c0000000-0000-0000-0000-000000000001'),
(2, 'FB2607070005', 3, 3, 4, '打掃得很仔細，會再預約', '0', '2026-07-07 12:00:00', '0', '2026-07-07 12:00:00', '2026-07-07 12:00:00', NULL, 'c0000000-0000-0000-0000-000000000005');

--
-- 觸發器 `pms_case_review`
--
DELIMITER $$
CREATE TRIGGER `trg_pms_case_review_after_insert` AFTER INSERT ON `pms_case_review` FOR EACH ROW BEGIN
	UPDATE pms_vendor v
	SET v.rating_count = v.rating_count + 1,
	    v.rating_avg = (
	        SELECT AVG(r.rating_score)
	        FROM pms_case_review r
	        WHERE r.vendor_id = NEW.vendor_id AND r.is_deleted = '0'
	    )
	WHERE v.vendor_id = NEW.vendor_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- 資料表結構 `pms_case_status_log`
--

CREATE TABLE `pms_case_status_log` (
  `log_id` int(11) NOT NULL COMMENT '記錄ID',
  `feedback_no` varchar(16) NOT NULL COMMENT '諮詢單號(對應 pms_form_feedback.feedback_no)',
  `assignment_id` int(11) DEFAULT NULL COMMENT '派案記錄ID(對應 pms_case_assignment.assignment_id，若為案件層級的狀態變更可為NULL)',
  `status_code` varchar(2) NOT NULL COMMENT '狀態代碼，如:01待媒合,02已派案,03處理中,04已完成,05已取消',
  `status_name` varchar(50) DEFAULT NULL COMMENT '狀態名稱(顯示用文字)',
  `change_time` datetime NOT NULL COMMENT '狀態變更時間',
  `change_reason` varchar(500) DEFAULT NULL COMMENT '變更原因/備註',
  `changed_by` char(36) DEFAULT NULL COMMENT '異動人員編號(系統自動異動則為NULL)',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='案件狀態變更歷程檔';

--
-- 傾印資料表的資料 `pms_case_status_log`
--

INSERT INTO `pms_case_status_log` (`log_id`, `feedback_no`, `assignment_id`, `status_code`, `status_name`, `change_time`, `change_reason`, `changed_by`, `cre_time`) VALUES
(1, 'FB2607050001', NULL, '01', '待媒合', '2026-07-05 18:25:00', NULL, NULL, '2026-07-05 18:25:00'),
(2, 'FB2607050001', 1, '02', '已派案', '2026-07-05 18:30:00', NULL, '00000000-0000-0000-0000-000000000001', '2026-07-05 18:30:00'),
(3, 'FB2607050001', 1, '04', '已完成', '2026-07-05 18:40:00', '顧客已到店用餐', '00000000-0000-0000-0000-000000000001', '2026-07-05 18:40:00'),
(4, 'FB2607050002', NULL, '01', '待媒合', '2026-07-06 09:10:00', NULL, NULL, '2026-07-06 09:10:00'),
(5, 'FB2607060003', NULL, '01', '待媒合', '2026-07-06 14:05:00', NULL, NULL, '2026-07-06 14:05:00'),
(6, 'FB2607060003', 2, '02', '已派案', '2026-07-06 14:10:00', NULL, '00000000-0000-0000-0000-000000000001', '2026-07-06 14:10:00'),
(7, 'FB2607060003', 2, '03', '處理中', '2026-07-06 14:30:00', '備貨中', '00000000-0000-0000-0000-000000000001', '2026-07-06 14:30:00'),
(8, 'FB2607060004', NULL, '01', '待媒合', '2026-07-07 10:30:00', NULL, NULL, '2026-07-07 10:30:00'),
(9, 'FB2607070005', NULL, '01', '待媒合', '2026-07-07 08:45:00', NULL, NULL, '2026-07-07 08:45:00'),
(10, 'FB2607070005', 3, '02', '已派案', '2026-07-07 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', '2026-07-07 09:00:00'),
(11, 'FB2607070005', 3, '04', '已完成', '2026-07-07 11:30:00', '已完成打掃', '00000000-0000-0000-0000-000000000001', '2026-07-07 11:30:00'),
(12, 'FB2607070006', NULL, '01', '待媒合', '2026-07-07 16:20:00', NULL, NULL, '2026-07-07 16:20:00'),
(13, 'FB2607070006', 4, '02', '已派案', '2026-07-07 16:30:00', NULL, '00000000-0000-0000-0000-000000000001', '2026-07-07 16:30:00'),
(14, 'FB2607070006', 4, '03', '處理中', '2026-07-07 16:45:00', '已約定維修時間', '00000000-0000-0000-0000-000000000001', '2026-07-07 16:45:00'),
(15, 'FB2607080007', NULL, '01', '待媒合', '2026-07-08 09:00:00', NULL, NULL, '2026-07-08 09:00:00'),
(16, 'FB2607080007', 5, '02', '已派案', '2026-07-08 09:05:00', NULL, '00000000-0000-0000-0000-000000000001', '2026-07-08 09:05:00'),
(17, 'FB2607080007', 5, '05', '已取消', '2026-07-08 09:10:00', '顧客取消', '00000000-0000-0000-0000-000000000001', '2026-07-08 09:10:00'),
(18, 'FB2607080008', NULL, '01', '待媒合', '2026-07-08 11:15:00', NULL, NULL, '2026-07-08 11:15:00');

-- --------------------------------------------------------

--
-- 資料表結構 `pms_form`
--

CREATE TABLE `pms_form` (
  `id` int(11) NOT NULL COMMENT '流水號',
  `service_vendor_id` int(11) NOT NULL COMMENT '服務提供商ID',
  `type` varchar(2) NOT NULL COMMENT '表單類型(1	C端客戶(無現場評估)2	C端客戶(需評估)3	B端客戶4	轉訂單流程5	客服',
  `sub_type` varchar(2) NOT NULL COMMENT '表單子類型(1	一般表單 2	估價表單)',
  `name` varchar(50) NOT NULL COMMENT '表單名稱',
  `intro_content` text COMMENT '服務介紹頁面內容(html)',
  `notice_content` text COMMENT '注意事項頁面內容(html)',
  `terms_content` text COMMENT '服務條款(html)',
  `review_status` varchar(2) NOT NULL COMMENT '審核狀態:0->未審核；1->已審核',
  `reviewed_id` char(36) DEFAULT NULL COMMENT '審核人員ID',
  `reviewed_time` datetime DEFAULT NULL COMMENT '審核時間',
  `is_enable` varchar(2) NOT NULL COMMENT '是否啟用:0->禁用；1->啟用',
  `is_deleted` varchar(2) NOT NULL COMMENT '刪除註記:0->未刪除；1->已刪除',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL,
  `cre_id` char(36) NOT NULL,
  `feature` json DEFAULT NULL COMMENT '擴充屬性(可以json內容定義不同呈現屬性)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='表單主檔';

--
-- 傾印資料表的資料 `pms_form`
--

INSERT INTO `pms_form` (`id`, `service_vendor_id`, `type`, `sub_type`, `name`, `intro_content`, `notice_content`, `terms_content`, `review_status`, `reviewed_id`, `reviewed_time`, `is_enable`, `is_deleted`, `upd_time`, `cre_time`, `upd_id`, `cre_id`, `feature`) VALUES
(1, 1, '1', '1', '餐廳訂位需求表單', '<p>請留下您的訂位需求，我們將盡快為您安排。</p>', NULL, NULL, '1', '00000000-0000-0000-0000-000000000001', '2026-07-01 09:00:00', '1', '0', '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(2, 2, '1', '1', '商品購買需求表單', '<p>告訴我們您想採買的商品，我們協助媒合合適賣家。</p>', NULL, NULL, '1', '00000000-0000-0000-0000-000000000001', '2026-07-01 09:00:00', '1', '0', '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(3, 5, '2', '2', '社區服務諮詢表單', '<p>家事、水電、長者陪伴等社區服務，留下需求由專人為您評估。</p>', NULL, NULL, '1', '00000000-0000-0000-0000-000000000001', '2026-07-01 09:00:00', '1', '0', '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `pms_form_feedback`
--

CREATE TABLE `pms_form_feedback` (
  `feedback_no` varchar(16) NOT NULL COMMENT '回饋單號',
  `service_id` int(11) NOT NULL COMMENT '服務ID',
  `platform_code` varchar(2) NOT NULL COMMENT '平台代號',
  `form_id` int(11) NOT NULL COMMENT '表單ID',
  `feedback_content` json NOT NULL COMMENT '表單回饋內容',
  `form_type` varchar(2) NOT NULL COMMENT '表單類型',
  `is_read` varchar(2) NOT NULL COMMENT '是否已讀:0->未讀；1->已讀',
  `status` varchar(2) NOT NULL COMMENT '回饋狀態',
  `contact_name` blob COMMENT '聯絡人姓名(aes256 gcm加密)',
  `contact_name_hash` varchar(50) DEFAULT NULL COMMENT '聯絡人姓名hash',
  `contact_mobile` blob COMMENT '聯絡人手機(aes256 gcm加密)',
  `contact_mobile_hash` varchar(50) DEFAULT NULL COMMENT '聯絡人手機hash',
  `contact_landline` blob COMMENT '聯絡人市話(aes256 gcm加密)',
  `contact_landline_hash` varchar(50) DEFAULT NULL COMMENT '聯絡人市話hash',
  `contact_email` blob COMMENT '聯絡人E-mail(aes256 gcm加密)',
  `contact_email_hash` varchar(50) DEFAULT NULL COMMENT '聯絡人E-mail hash',
  `preferred_contact_time` varchar(2) DEFAULT NULL COMMENT '方便聯絡時間(1	上午 2	下午 3	皆可)',
  `contact_address_county` varchar(10) DEFAULT NULL COMMENT '聯絡地址-縣市',
  `contact_address_district` varchar(20) DEFAULT NULL COMMENT '聯絡地址-行政區',
  `contact_address_detail` blob COMMENT '聯絡地址-詳細地址(aes256 gcm加密)',
  `contact_address_detail_hash` varchar(50) DEFAULT NULL COMMENT '聯絡地址-詳細地址hash',
  `description` varchar(1000) DEFAULT NULL COMMENT '備註',
  `inbr_account_id` char(36) NOT NULL COMMENT '會員編號',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL,
  `upd_time` datetime NOT NULL COMMENT '異動日期時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='表單回饋檔';

--
-- 傾印資料表的資料 `pms_form_feedback`
--

INSERT INTO `pms_form_feedback` (`feedback_no`, `service_id`, `platform_code`, `form_id`, `feedback_content`, `form_type`, `is_read`, `status`, `contact_name`, `contact_name_hash`, `contact_mobile`, `contact_mobile_hash`, `contact_landline`, `contact_landline_hash`, `contact_email`, `contact_email_hash`, `preferred_contact_time`, `contact_address_county`, `contact_address_district`, `contact_address_detail`, `contact_address_detail_hash`, `description`, `inbr_account_id`, `cre_time`, `upd_id`, `upd_time`) VALUES
('FB2607050001', 101, '01', 1, '{\"topic_2\": \"01\", \"topic_3\": \"2026-07-10 19:00\", \"topic_4\": \"4\", \"topic_5\": \"中式\"}', '1', '1', '04', 0xe78e8be5b08fe6988e, 'acf979cc584e1cf9c18c65bffae9e53cbc18634f90042072cc', 0x30393132333435303031, 'a7e5f59932cfb16320caf11b09b6eab897adb60f2cf37a62a7', NULL, NULL, 0x77616e673031406578616d706c652e636f6d, 'b6f8dfe4fe7aa1880197b0e472affe6a9867a35e8fa84d50b8', '3', '01', '011', 0xe5a4a7e5ae89e8b7afe4b880e6aeb5313030e8999f, 'a26abe6db5c3b87546a2c531588478ecfce1bc7d46d40a0fc0', '希望靠窗座位', 'c0000000-0000-0000-0000-000000000001', '2026-07-05 18:20:00', '00000000-0000-0000-0000-000000000001', '2026-07-05 18:25:00'),
('FB2607050002', 101, '01', 1, '{\"topic_2\": \"02\", \"topic_3\": \"2026-07-11 12:30\", \"topic_4\": \"2\", \"topic_5\": \"日式\"}', '1', '1', '01', 0xe69d8ee5b08fe88faf, '8b53bf5e589f6f235956e58f1eedd74f15fb00c15841ba90ec', 0x30393132333435303032, '2885410c7354af6ca0db719a20200a5f25a8eeb3b98eded040', NULL, NULL, NULL, NULL, '1', '02', '021', NULL, NULL, NULL, 'c0000000-0000-0000-0000-000000000002', '2026-07-06 09:10:00', NULL, '2026-07-06 09:10:00'),
('FB2607060003', 102, '01', 2, '{\"topic_7\": \"想買露營用的睡袋和爐具\", \"topic_8\": [\"日用品\", \"3C家電\"], \"topic_9\": \"3000\"}', '1', '1', '03', 0xe5bcb5e7be8ee78eb2, 'd1c83f14b8bac73ae9f8aaa2a3ed15411fdedce7ac7928b267', 0x30393132333435303033, '7ea0206efd85a57714a5dc61865940752feadcac85ea31c7c8', NULL, NULL, 0x6368616e673033406578616d706c652e636f6d, 'a3fbc19ef5c7788827c1f3b7fb9efa86ed4664f5c3ef66ef14', '2', NULL, NULL, NULL, NULL, NULL, 'c0000000-0000-0000-0000-000000000003', '2026-07-06 14:05:00', '00000000-0000-0000-0000-000000000001', '2026-07-06 15:00:00'),
('FB2607060004', 102, '01', 2, '{\"topic_7\": \"想買生鮮蔬果箱\", \"topic_8\": [\"生鮮食品\"], \"topic_9\": \"1500\"}', '1', '0', '01', 0xe999b3e5bbbae5ae8f, '58ac6be07bc86993eeaa79a5a1c562c5ad012f4063d72bd67d', 0x30393132333435303034, '7e0d4e12b9722d912aadc1c3299ba62e024157fc996e9f46e3', NULL, NULL, NULL, NULL, '3', NULL, NULL, NULL, NULL, NULL, 'c0000000-0000-0000-0000-000000000004', '2026-07-07 10:30:00', NULL, '2026-07-07 10:30:00'),
('FB2607070005', 103, '01', 3, '{\"topic_11\": \"04\", \"topic_12\": \"家事清潔\", \"topic_13\": \"每週固定打掃一次，約2小時\", \"topic_14\": \"2026-07-15\"}', '2', '1', '04', 0xe58a89e998bfe5a7a8, '77e88a63087ee2a4e9f51ef09bf88666979aaff632a132da09', 0x30393132333435303035, '5d4f8e23ddfb90e597905396cc290956beebcb38260bf1d7ec', NULL, NULL, NULL, NULL, '1', '04', '041', 0xe8a5bfe5b1afe8b7afe4ba8ce6aeb53530e8999f, '74d98fde419a1bd4c00c662d288d194e5f914c8a14990e4a8f', '家中有長者需特別留意打掃安全', 'c0000000-0000-0000-0000-000000000005', '2026-07-07 08:45:00', '00000000-0000-0000-0000-000000000001', '2026-07-08 09:00:00'),
('FB2607070006', 103, '01', 3, '{\"topic_11\": \"04\", \"topic_12\": \"水電修繕\", \"topic_13\": \"浴室水龍頭漏水\", \"topic_14\": \"2026-07-12\"}', '2', '1', '03', 0xe8a8b1e58588e7949f, 'dc3ff0ad09b9969029e386437ffdf86aafb4c5a3ec116152b5', 0x30393132333435303036, 'af8ca5b905c8cc2ac9d03e9a00c822ede0dd97a9554fe11b86', NULL, NULL, 0x6873753036406578616d706c652e636f6d, '87adc4f058f89f50081aaaec9c015cbcd245623cbd3ebca3f1', '2', '04', '042', NULL, NULL, NULL, 'c0000000-0000-0000-0000-000000000006', '2026-07-07 16:20:00', '00000000-0000-0000-0000-000000000001', '2026-07-08 08:00:00'),
('FB2607080007', 101, '01', 1, '{\"topic_2\": \"01\", \"topic_3\": \"2026-07-12 19:30\", \"topic_4\": \"6\", \"topic_5\": \"西式\"}', '1', '1', '05', 0xe894a1e5b08fe5a790, '6178b73afbfce21cf58f34cf8633b66cc843e1dfed27f9920c', 0x30393132333435303037, 'd06b9760fcac0f1d111d4f66b3558c1c6d8c49dfa413d9474c', NULL, NULL, NULL, NULL, '3', '01', '012', NULL, NULL, '需要兒童椅', 'c0000000-0000-0000-0000-000000000007', '2026-07-08 09:00:00', '00000000-0000-0000-0000-000000000001', '2026-07-08 09:10:00'),
('FB2607080008', 102, '01', 2, '{\"topic_7\": \"想買換季衣物\", \"topic_8\": [\"服飾\"], \"topic_9\": \"2000\"}', '1', '0', '01', 0xe984ade5908ce5adb8, 'c7819ef0e4d2d3ce49bc559ebcc0de222890766a16ceaf79a0', 0x30393132333435303038, 'f24b00c12fe5a45e12acd9dadd08392797f68797c9ad17b0fb', NULL, NULL, NULL, NULL, '3', NULL, NULL, NULL, NULL, NULL, 'c0000000-0000-0000-0000-000000000008', '2026-07-08 11:15:00', NULL, '2026-07-08 11:15:00');

-- --------------------------------------------------------

--
-- 資料表結構 `pms_form_group`
--

CREATE TABLE `pms_form_group` (
  `id` int(11) NOT NULL COMMENT '流水號',
  `form_id` int(11) NOT NULL COMMENT '表單ID',
  `name` varchar(50) NOT NULL COMMENT '題組名稱',
  `sort` int(11) NOT NULL COMMENT '排序',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL,
  `cre_id` char(36) NOT NULL,
  `feature` json DEFAULT NULL COMMENT '擴充屬性'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='表單題組主檔';

--
-- 傾印資料表的資料 `pms_form_group`
--

INSERT INTO `pms_form_group` (`id`, `form_id`, `name`, `sort`, `upd_time`, `cre_time`, `upd_id`, `cre_id`, `feature`) VALUES
(1, 1, '基本聯絡資料', 1, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(2, 1, '訂位需求', 2, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(3, 2, '基本聯絡資料', 1, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(4, 2, '商品需求', 2, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(5, 3, '基本聯絡資料', 1, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(6, 3, '服務需求詳情', 2, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `pms_form_topic`
--

CREATE TABLE `pms_form_topic` (
  `id` int(11) NOT NULL COMMENT '流水號',
  `form_id` int(11) NOT NULL COMMENT '表單ID',
  `form_group_id` int(11) NOT NULL COMMENT '表單題組ID',
  `type` varchar(2) NOT NULL COMMENT '題目類別1	簡答題 2	詳答題 3	單選題 4	複選題 5	地區選單 6	上傳照片 7	備註說明 8	聯絡資料 9	日期題 10	聯絡資料(不含地址)',
  `title` varchar(200) NOT NULL COMMENT '題目名稱',
  `remark` varchar(500) DEFAULT NULL COMMENT '題目說明',
  `is_required` varchar(2) NOT NULL COMMENT '必填設定:0->非必填；1->必填',
  `sort` int(11) NOT NULL COMMENT '題目排序',
  `is_number_only` varchar(2) DEFAULT NULL COMMENT '(簡答題使用)只能輸入數字:0->未指定；1->指定數字',
  `minimum_medias_upload` int(11) DEFAULT NULL COMMENT '(照片題)照片最少上傳數',
  `maximum_medias_upload` int(11) DEFAULT NULL COMMENT '(照片題)照片最多上傳數',
  `specified_medias_upload` int(11) DEFAULT NULL COMMENT '(照片題)照片指定上傳數',
  `start_date_offset_days` int(11) DEFAULT NULL COMMENT '可選起日相對D日偏移天數',
  `end_date_offset_days` int(11) DEFAULT NULL COMMENT '可選迄日相對D日偏移天數',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL,
  `cre_id` char(36) NOT NULL,
  `feature` json DEFAULT NULL COMMENT '擴充屬性'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='表單題目主檔';

--
-- 傾印資料表的資料 `pms_form_topic`
--

INSERT INTO `pms_form_topic` (`id`, `form_id`, `form_group_id`, `type`, `title`, `remark`, `is_required`, `sort`, `is_number_only`, `minimum_medias_upload`, `maximum_medias_upload`, `specified_medias_upload`, `start_date_offset_days`, `end_date_offset_days`, `upd_time`, `cre_time`, `upd_id`, `cre_id`, `feature`) VALUES
(1, 1, 1, '8', '聯絡資訊', NULL, '1', 1, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(2, 1, 1, '5', '用餐地區', NULL, '1', 2, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(3, 1, 2, '9', '希望訂位日期時間', NULL, '1', 1, NULL, NULL, NULL, NULL, 0, 30, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(4, 1, 2, '1', '用餐人數', NULL, '1', 2, '1', NULL, NULL, NULL, NULL, NULL, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(5, 1, 2, '3', '餐廳類型偏好', NULL, '0', 3, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(6, 2, 3, '8', '聯絡資訊', NULL, '1', 1, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(7, 2, 4, '2', '想購買的商品描述', NULL, '1', 1, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(8, 2, 4, '4', '商品類別', NULL, '0', 2, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(9, 2, 4, '1', '預算上限(元)', NULL, '0', 3, '1', NULL, NULL, NULL, NULL, NULL, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(10, 3, 5, '10', '聯絡資訊', NULL, '1', 1, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(11, 3, 5, '5', '服務地區', NULL, '1', 2, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(12, 3, 6, '3', '需求類型', NULL, '1', 1, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(13, 3, 6, '7', '需求詳細說明', NULL, '0', 2, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(14, 3, 6, '9', '希望服務時間', NULL, '0', 3, NULL, NULL, NULL, NULL, 0, 14, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `pms_topic_county_district_relation`
--

CREATE TABLE `pms_topic_county_district_relation` (
  `form_id` int(11) NOT NULL COMMENT '表單ID',
  `topic_id` int(11) NOT NULL COMMENT '題目ID',
  `eff_ts_from` datetime NOT NULL COMMENT '適用日期時間起',
  `eff_ts_to` datetime NOT NULL COMMENT '適用日期時間迄',
  `county_code` varchar(2) NOT NULL COMMENT '縣市代碼',
  `district_code` varchar(3) NOT NULL COMMENT '行政區代碼',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL,
  `cre_id` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='題目縣市行政區對應檔';

--
-- 傾印資料表的資料 `pms_topic_county_district_relation`
--

INSERT INTO `pms_topic_county_district_relation` (`form_id`, `topic_id`, `eff_ts_from`, `eff_ts_to`, `county_code`, `district_code`, `upd_time`, `cre_time`, `upd_id`, `cre_id`) VALUES
(1, 2, '2026-01-01 00:00:00', '2099-12-31 23:59:59', '01', '', '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(1, 2, '2026-01-01 00:00:00', '2099-12-31 23:59:59', '02', '', '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(3, 11, '2026-01-01 00:00:00', '2099-12-31 23:59:59', '04', '', '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001');

-- --------------------------------------------------------

--
-- 資料表結構 `pms_topic_media`
--

CREATE TABLE `pms_topic_media` (
  `id` int(11) NOT NULL COMMENT '流水號',
  `form_id` int(11) NOT NULL COMMENT '表單ID',
  `topic_id` int(11) NOT NULL COMMENT '題目ID',
  `img_url` text NOT NULL COMMENT '輔助說明圖片網址',
  `sort` int(11) NOT NULL COMMENT '排序',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL,
  `cre_id` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='表單題目圖片檔';

--
-- 傾印資料表的資料 `pms_topic_media`
--

INSERT INTO `pms_topic_media` (`id`, `form_id`, `topic_id`, `img_url`, `sort`, `upd_time`, `cre_time`, `upd_id`, `cre_id`) VALUES
(1, 3, 12, 'https://example.com/img/home-clean.png', 1, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(2, 3, 12, 'https://example.com/img/repair.png', 2, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001');

-- --------------------------------------------------------

--
-- 資料表結構 `pms_topic_option`
--

CREATE TABLE `pms_topic_option` (
  `id` int(11) NOT NULL COMMENT '流水號',
  `form_id` int(11) NOT NULL COMMENT '表單ID',
  `topic_id` int(11) NOT NULL COMMENT '題目ID',
  `option_name` varchar(200) NOT NULL COMMENT '選項名稱',
  `unit_price` int(11) DEFAULT NULL COMMENT '單價',
  `unit` varchar(30) DEFAULT NULL COMMENT '單位',
  `is_quantity` varchar(2) DEFAULT NULL COMMENT '數量可選:0->不可選；1->可選',
  `min_quantity` int(11) DEFAULT NULL COMMENT '最小可選數量',
  `max_quantity` int(11) DEFAULT NULL COMMENT '最大可選數量',
  `is_quoted_separately` varchar(2) DEFAULT NULL COMMENT '是否為另行報價:0->否；1->是',
  `remark` varchar(500) DEFAULT NULL COMMENT '選項說明',
  `sort` int(11) NOT NULL COMMENT '排序',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL,
  `cre_id` char(36) NOT NULL,
  `feature` json DEFAULT NULL COMMENT '擴充屬性'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='表單選項主檔';

--
-- 傾印資料表的資料 `pms_topic_option`
--

INSERT INTO `pms_topic_option` (`id`, `form_id`, `topic_id`, `option_name`, `unit_price`, `unit`, `is_quantity`, `min_quantity`, `max_quantity`, `is_quoted_separately`, `remark`, `sort`, `upd_time`, `cre_time`, `upd_id`, `cre_id`, `feature`) VALUES
(1, 1, 5, '中式', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(2, 1, 5, '日式', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(3, 1, 5, '西式', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(4, 2, 8, '生鮮食品', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(5, 2, 8, '日用品', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(6, 2, 8, '3C家電', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(7, 2, 8, '服飾', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(8, 3, 12, '家事清潔', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(9, 3, 12, '水電修繕', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(10, 3, 12, '長者陪伴', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(11, 3, 12, '其他', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, '2026-07-01 09:00:00', '2026-07-01 09:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `pms_vendor`
--

CREATE TABLE `pms_vendor` (
  `vendor_id` int(11) NOT NULL COMMENT '廠商ID',
  `vendor_name` varchar(100) NOT NULL COMMENT '廠商名稱',
  `vendor_no` varchar(30) DEFAULT NULL COMMENT '廠商編號(對外顯示用，選填)',
  `contact_name` varchar(50) DEFAULT NULL COMMENT '聯絡窗口姓名',
  `contact_phone` varchar(20) DEFAULT NULL COMMENT '聯絡電話',
  `contact_email` varchar(100) DEFAULT NULL COMMENT '聯絡Email',
  `rating_avg` decimal(3,2) DEFAULT NULL COMMENT '平均評分(1.00~5.00)，由 pms_case_review 彙總',
  `rating_count` int(11) NOT NULL DEFAULT '0' COMMENT '累積評分筆數',
  `is_enable` varchar(2) NOT NULL COMMENT '是否啟用:0->禁用；1->啟用',
  `is_deleted` varchar(2) NOT NULL COMMENT '刪除註記:0->未刪除；1->已刪除',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL COMMENT '異動者編號',
  `cre_id` char(36) NOT NULL COMMENT '新增者編號',
  `feature` json DEFAULT NULL COMMENT '擴充屬性'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='服務廠商主檔';

--
-- 傾印資料表的資料 `pms_vendor`
--

INSERT INTO `pms_vendor` (`vendor_id`, `vendor_name`, `vendor_no`, `contact_name`, `contact_phone`, `contact_email`, `rating_avg`, `rating_count`, `is_enable`, `is_deleted`, `upd_time`, `cre_time`, `upd_id`, `cre_id`, `feature`) VALUES
(1, '美味山海餐廳', 'VD0001', '陳主廚', '02-2700-1001', 'chef@meishan.example.com', 5.00, 1, '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(2, '幸福小舖購物', 'VD0002', '林經理', '02-8500-1002', 'service@happyshop.example.com', NULL, 0, '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(3, '安心家事服務', 'VD0003', '張督導', '03-300-1003', 'support@ansin.example.com', 4.00, 1, '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(4, '快修水電行', 'VD0004', '李師傅', '03-400-1004', 'fix@quickfix.example.com', NULL, 0, '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(5, '敦親社區服務中心', 'VD0005', '黃社工', '04-2200-1005', 'care@dunqin.example.com', NULL, 0, '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(6, '康健藥局', 'VD0006', '吳藥師', '06-200-1006', 'pharmacy@kanghealth.example.com', NULL, 0, '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(7, '順風叫車服務', 'VD0007', '劉隊長', '07-300-1007', 'dispatch@shunfeng.example.com', NULL, 0, '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL),
(8, '歡樂影音娛樂', 'VD0008', '周企劃', '02-2700-1008', 'fun@happyent.example.com', NULL, 0, '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001', NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `pms_vendor_account`
--

CREATE TABLE `pms_vendor_account` (
  `account_id` int(11) NOT NULL COMMENT '帳號ID',
  `vendor_id` int(11) NOT NULL COMMENT '所屬廠商ID(對應 pms_vendor.vendor_id)',
  `account_no` varchar(50) NOT NULL COMMENT '登入帳號',
  `password_hash` varchar(255) NOT NULL COMMENT '密碼雜湊(建議 bcrypt)',
  `account_name` varchar(50) NOT NULL COMMENT '使用者姓名',
  `role_code` varchar(2) NOT NULL COMMENT '權限角色:01->廠商管理者(可管理帳號/廠商資料)；02->一般承辦人員(僅可查看/處理案件)',
  `last_login_time` datetime DEFAULT NULL COMMENT '最後登入時間',
  `is_enable` varchar(2) NOT NULL COMMENT '是否啟用:0->停用；1->啟用',
  `is_deleted` varchar(2) NOT NULL COMMENT '刪除註記:0->未刪除；1->已刪除',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL COMMENT '異動者編號',
  `cre_id` char(36) NOT NULL COMMENT '新增者編號'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='廠商後台帳號檔';

--
-- 傾印資料表的資料 `pms_vendor_account`
--

INSERT INTO `pms_vendor_account` (`account_id`, `vendor_id`, `account_no`, `password_hash`, `account_name`, `role_code`, `last_login_time`, `is_enable`, `is_deleted`, `upd_time`, `cre_time`, `upd_id`, `cre_id`) VALUES
(1, 1, 'vendor01', '$2y$10$demoHashPlaceholder0000000000000000000000000001', '陳主廚', '01', '2026-07-07 09:00:00', '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(2, 2, 'vendor02', '$2y$10$demoHashPlaceholder0000000000000000000000000002', '林經理', '01', '2026-07-07 09:10:00', '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(3, 3, 'vendor03', '$2y$10$demoHashPlaceholder0000000000000000000000000003', '張督導', '01', '2026-07-07 09:20:00', '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(4, 4, 'vendor04', '$2y$10$demoHashPlaceholder0000000000000000000000000004', '李師傅', '01', '2026-07-07 09:30:00', '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(5, 5, 'vendor05', '$2y$10$demoHashPlaceholder0000000000000000000000000005', '黃社工', '01', '2026-07-07 09:40:00', '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(6, 6, 'vendor06', '$2y$10$demoHashPlaceholder0000000000000000000000000006', '吳藥師', '01', '2026-07-07 09:50:00', '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(7, 7, 'vendor07', '$2y$10$demoHashPlaceholder0000000000000000000000000007', '劉隊長', '01', '2026-07-07 10:00:00', '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(8, 8, 'vendor08', '$2y$10$demoHashPlaceholder0000000000000000000000000008', '周企劃', '01', '2026-07-07 10:10:00', '1', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001');

-- --------------------------------------------------------

--
-- 資料表結構 `pms_vendor_service_area`
--

CREATE TABLE `pms_vendor_service_area` (
  `vendor_id` int(11) NOT NULL COMMENT '廠商ID',
  `county_code` varchar(2) NOT NULL COMMENT '縣市代碼(對應 sys_county.code)',
  `district_code` varchar(3) NOT NULL DEFAULT '' COMMENT '行政區代碼(對應 sys_district.code)，空字串代表整個縣市皆可服務',
  `is_deleted` varchar(2) NOT NULL COMMENT '刪除註記:0->未刪除；1->已刪除',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL COMMENT '異動者編號',
  `cre_id` char(36) NOT NULL COMMENT '新增者編號'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='廠商可服務地區對應檔';

--
-- 傾印資料表的資料 `pms_vendor_service_area`
--

INSERT INTO `pms_vendor_service_area` (`vendor_id`, `county_code`, `district_code`, `is_deleted`, `upd_time`, `cre_time`, `upd_id`, `cre_id`) VALUES
(1, '01', '', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(2, '02', '', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(3, '01', '011', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(3, '01', '012', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(4, '03', '', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(5, '04', '', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(6, '05', '', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(7, '06', '', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(8, '01', '', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001');

-- --------------------------------------------------------

--
-- 資料表結構 `pms_vendor_service_time`
--

CREATE TABLE `pms_vendor_service_time` (
  `id` int(11) NOT NULL COMMENT '流水號',
  `vendor_id` int(11) NOT NULL COMMENT '廠商ID',
  `day_of_week` varchar(1) NOT NULL COMMENT '星期別:0->週日,1->週一,...,6->週六；7 可保留代表國定假日',
  `start_time` time NOT NULL COMMENT '可服務起始時間',
  `end_time` time NOT NULL COMMENT '可服務結束時間',
  `is_deleted` varchar(2) NOT NULL COMMENT '刪除註記:0->未刪除；1->已刪除',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL COMMENT '異動者編號',
  `cre_id` char(36) NOT NULL COMMENT '新增者編號'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='廠商可服務時段對應檔';

--
-- 傾印資料表的資料 `pms_vendor_service_time`
--

INSERT INTO `pms_vendor_service_time` (`id`, `vendor_id`, `day_of_week`, `start_time`, `end_time`, `is_deleted`, `upd_time`, `cre_time`, `upd_id`, `cre_id`) VALUES
(1, 1, '1', '11:00:00', '21:00:00', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(2, 1, '6', '11:00:00', '21:00:00', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(3, 2, '1', '09:00:00', '18:00:00', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(4, 2, '6', '09:00:00', '13:00:00', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(5, 3, '1', '08:00:00', '17:00:00', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(6, 4, '1', '09:00:00', '18:00:00', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(7, 4, '6', '09:00:00', '12:00:00', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(8, 5, '1', '09:00:00', '17:00:00', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(9, 6, '1', '09:00:00', '21:00:00', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(10, 7, '0', '00:00:00', '23:59:59', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(11, 8, '6', '10:00:00', '22:00:00', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001');

-- --------------------------------------------------------

--
-- 資料表結構 `pms_vendor_service_type`
--

CREATE TABLE `pms_vendor_service_type` (
  `vendor_id` int(11) NOT NULL COMMENT '廠商ID',
  `service_type` varchar(2) NOT NULL COMMENT '服務類型代碼，如01餐廳訂位,02商品購買,03家事服務,04水電修繕,05社區服務諮詢...',
  `is_deleted` varchar(2) NOT NULL COMMENT '刪除註記:0->未刪除；1->已刪除',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL COMMENT '異動者編號',
  `cre_id` char(36) NOT NULL COMMENT '新增者編號'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='廠商可服務類型對應檔';

--
-- 傾印資料表的資料 `pms_vendor_service_type`
--

INSERT INTO `pms_vendor_service_type` (`vendor_id`, `service_type`, `is_deleted`, `upd_time`, `cre_time`, `upd_id`, `cre_id`) VALUES
(1, '01', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(2, '02', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(3, '03', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(4, '04', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(5, '03', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(5, '05', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(6, '06', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(7, '07', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
(8, '08', '0', '2026-06-28 10:00:00', '2026-06-28 10:00:00', NULL, '00000000-0000-0000-0000-000000000001');

-- --------------------------------------------------------

--
-- 資料表結構 `sys_county`
--

CREATE TABLE `sys_county` (
  `code` varchar(2) NOT NULL COMMENT '縣市代碼',
  `name` varchar(10) NOT NULL COMMENT '縣市名稱',
  `sort` int(11) NOT NULL COMMENT '排序',
  `is_deleted` varchar(2) NOT NULL COMMENT '0->正常；1->刪除',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL,
  `cre_id` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='縣市代碼檔';

--
-- 傾印資料表的資料 `sys_county`
--

INSERT INTO `sys_county` (`code`, `name`, `sort`, `is_deleted`, `upd_time`, `cre_time`, `upd_id`, `cre_id`) VALUES
('01', '台北市', 1, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('02', '新北市', 2, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('03', '桃園市', 3, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('04', '台中市', 4, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('05', '台南市', 5, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('06', '高雄市', 6, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001');

-- --------------------------------------------------------

--
-- 資料表結構 `sys_district`
--

CREATE TABLE `sys_district` (
  `code` varchar(3) NOT NULL COMMENT '行政區代碼',
  `county_code` varchar(2) NOT NULL COMMENT '縣市代碼',
  `name` varchar(20) NOT NULL COMMENT '行政區名稱',
  `name_with_county` varchar(20) NOT NULL COMMENT '行政區名稱和縣市名稱',
  `zip` varchar(6) NOT NULL COMMENT '郵遞區號',
  `sort` int(11) NOT NULL COMMENT '排序',
  `is_deleted` varchar(2) NOT NULL COMMENT '0->正常；1->刪除',
  `upd_time` datetime NOT NULL COMMENT '異動日期時間',
  `cre_time` datetime NOT NULL COMMENT '新增日期時間',
  `upd_id` char(36) DEFAULT NULL,
  `cre_id` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci COMMENT='行政區代碼檔';

--
-- 傾印資料表的資料 `sys_district`
--

INSERT INTO `sys_district` (`code`, `county_code`, `name`, `name_with_county`, `zip`, `sort`, `is_deleted`, `upd_time`, `cre_time`, `upd_id`, `cre_id`) VALUES
('011', '01', '大安區', '台北市大安區', '106', 1, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('012', '01', '信義區', '台北市信義區', '110', 2, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('013', '01', '中山區', '台北市中山區', '104', 3, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('021', '02', '板橋區', '新北市板橋區', '220', 1, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('022', '02', '新莊區', '新北市新莊區', '242', 2, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('023', '02', '三重區', '新北市三重區', '241', 3, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('031', '03', '桃園區', '桃園市桃園區', '330', 1, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('032', '03', '中壢區', '桃園市中壢區', '320', 2, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('041', '04', '西屯區', '台中市西屯區', '407', 1, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('042', '04', '北屯區', '台中市北屯區', '406', 2, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('051', '05', '東區', '台南市東區', '701', 1, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('052', '05', '安平區', '台南市安平區', '708', 2, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('061', '06', '苓雅區', '高雄市苓雅區', '802', 1, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001'),
('062', '06', '三民區', '高雄市三民區', '807', 2, '0', '2026-06-25 09:00:00', '2026-06-25 09:00:00', NULL, '00000000-0000-0000-0000-000000000001');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `mms_order_record`
--
ALTER TABLE `mms_order_record`
  ADD PRIMARY KEY (`record_id`),
  ADD UNIQUE KEY `uk_order_no_service` (`order_no`,`service_id`),
  ADD KEY `idx_order_record_complete_time` (`complete_time`),
  ADD KEY `idx_order_record_import_batch` (`import_batch`),
  ADD KEY `idx_order_record_member` (`inbr_account_id`),
  ADD KEY `idx_order_record_order_no` (`order_no`),
  ADD KEY `idx_order_record_order_no_include1` (`order_no`,`inbr_account_id`),
  ADD KEY `idx_order_record_order_status` (`record_id`,`order_status`),
  ADD KEY `idx_order_record_order_time` (`order_time`),
  ADD KEY `idx_order_record_platform` (`platform_code`),
  ADD KEY `idx_order_record_point_process` (`point_status`,`order_status`,`complete_time`),
  ADD KEY `idx_order_record_service` (`service_id`);

--
-- 資料表索引 `pms_case_assignment`
--
ALTER TABLE `pms_case_assignment`
  ADD PRIMARY KEY (`assignment_id`),
  ADD UNIQUE KEY `uk_case_assignment_feedback_vendor` (`feedback_no`,`vendor_id`),
  ADD KEY `idx_pms_case_assignment_feedback` (`feedback_no`),
  ADD KEY `idx_pms_case_assignment_vendor` (`vendor_id`),
  ADD KEY `idx_pms_case_assignment_status` (`accept_status`);

--
-- 資料表索引 `pms_case_reply`
--
ALTER TABLE `pms_case_reply`
  ADD PRIMARY KEY (`reply_id`),
  ADD KEY `idx_pms_case_reply_assignment` (`assignment_id`);

--
-- 資料表索引 `pms_case_review`
--
ALTER TABLE `pms_case_review`
  ADD PRIMARY KEY (`review_id`),
  ADD UNIQUE KEY `uk_case_review_feedback` (`feedback_no`),
  ADD KEY `idx_pms_case_review_vendor` (`vendor_id`);

--
-- 資料表索引 `pms_case_status_log`
--
ALTER TABLE `pms_case_status_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_pms_case_status_log_feedback` (`feedback_no`,`change_time`),
  ADD KEY `idx_pms_case_status_log_assignment` (`assignment_id`);

--
-- 資料表索引 `pms_form`
--
ALTER TABLE `pms_form`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `pms_form_feedback`
--
ALTER TABLE `pms_form_feedback`
  ADD PRIMARY KEY (`feedback_no`);

--
-- 資料表索引 `pms_form_group`
--
ALTER TABLE `pms_form_group`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `pms_form_topic`
--
ALTER TABLE `pms_form_topic`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `pms_topic_county_district_relation`
--
ALTER TABLE `pms_topic_county_district_relation`
  ADD PRIMARY KEY (`form_id`,`topic_id`,`eff_ts_from`,`county_code`,`district_code`);

--
-- 資料表索引 `pms_topic_media`
--
ALTER TABLE `pms_topic_media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pms_topic_media_form_id` (`form_id`),
  ADD KEY `idx_pms_topic_media_form_topic` (`form_id`,`topic_id`),
  ADD KEY `idx_pms_topic_media_topic_id` (`topic_id`);

--
-- 資料表索引 `pms_topic_option`
--
ALTER TABLE `pms_topic_option`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `pms_vendor`
--
ALTER TABLE `pms_vendor`
  ADD PRIMARY KEY (`vendor_id`);

--
-- 資料表索引 `pms_vendor_account`
--
ALTER TABLE `pms_vendor_account`
  ADD PRIMARY KEY (`account_id`),
  ADD UNIQUE KEY `uk_vendor_account_no` (`account_no`),
  ADD KEY `idx_pms_vendor_account_vendor` (`vendor_id`);

--
-- 資料表索引 `pms_vendor_service_area`
--
ALTER TABLE `pms_vendor_service_area`
  ADD PRIMARY KEY (`vendor_id`,`county_code`,`district_code`);

--
-- 資料表索引 `pms_vendor_service_time`
--
ALTER TABLE `pms_vendor_service_time`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pms_vendor_service_time_vendor` (`vendor_id`);

--
-- 資料表索引 `pms_vendor_service_type`
--
ALTER TABLE `pms_vendor_service_type`
  ADD PRIMARY KEY (`vendor_id`,`service_type`);

--
-- 資料表索引 `sys_county`
--
ALTER TABLE `sys_county`
  ADD PRIMARY KEY (`code`);

--
-- 資料表索引 `sys_district`
--
ALTER TABLE `sys_district`
  ADD PRIMARY KEY (`code`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `mms_order_record`
--
ALTER TABLE `mms_order_record`
  MODIFY `record_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '系統內部ID，自動遞增', AUTO_INCREMENT=9;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `pms_case_assignment`
--
ALTER TABLE `pms_case_assignment`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '派案記錄ID', AUTO_INCREMENT=6;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `pms_case_reply`
--
ALTER TABLE `pms_case_reply`
  MODIFY `reply_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '回覆記錄ID', AUTO_INCREMENT=7;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `pms_case_review`
--
ALTER TABLE `pms_case_review`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '評價ID', AUTO_INCREMENT=3;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `pms_case_status_log`
--
ALTER TABLE `pms_case_status_log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '記錄ID', AUTO_INCREMENT=19;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `pms_form`
--
ALTER TABLE `pms_form`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '流水號', AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `pms_form_group`
--
ALTER TABLE `pms_form_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '流水號', AUTO_INCREMENT=7;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `pms_form_topic`
--
ALTER TABLE `pms_form_topic`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '流水號', AUTO_INCREMENT=15;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `pms_topic_media`
--
ALTER TABLE `pms_topic_media`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '流水號', AUTO_INCREMENT=3;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `pms_topic_option`
--
ALTER TABLE `pms_topic_option`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '流水號', AUTO_INCREMENT=12;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `pms_vendor`
--
ALTER TABLE `pms_vendor`
  MODIFY `vendor_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '廠商ID', AUTO_INCREMENT=9;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `pms_vendor_account`
--
ALTER TABLE `pms_vendor_account`
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '帳號ID', AUTO_INCREMENT=9;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `pms_vendor_service_time`
--
ALTER TABLE `pms_vendor_service_time`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '流水號', AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
