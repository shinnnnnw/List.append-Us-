/**
 * seed-data.js
 * DynamoDB 範例資料定義模組
 */
 
const SEED_DATA = {
  inbr_member: [
    { inbr_account_id:{S:'MBR001'}, member_name:{S:'王小明'}, member_phone:{S:'0912-345-001'}, member_email:{S:'wang01@example.com'}, platform_code:{S:'01'}, point_balance:{N:'50'}, home_county:{S:'台北市'}, home_district:{S:'信義區'}, home_address:{S:'信義路五段7號'}, is_enable:{S:'1'}, cre_time:{S:'2025-01-15T08:00:00+08:00'}, last_login_time:{S:'2026-08-01T09:00:00+08:00'} },
    { inbr_account_id:{S:'MBR002'}, member_name:{S:'陳美玲'}, member_phone:{S:'0923-456-002'}, member_email:{S:'chen02@example.com'}, platform_code:{S:'01'}, point_balance:{N:'120'}, home_county:{S:'台北市'}, home_district:{S:'大安區'}, home_address:{S:'忠孝東路四段1號'}, is_enable:{S:'1'}, cre_time:{S:'2025-02-20T09:00:00+08:00'}, last_login_time:{S:'2026-08-01T10:00:00+08:00'} },
    { inbr_account_id:{S:'MBR003'}, member_name:{S:'林大偉'}, member_phone:{S:'0934-567-003'}, member_email:{S:'lin03@example.com'}, platform_code:{S:'01'}, point_balance:{N:'0'}, home_county:{S:'新北市'}, home_district:{S:'板橋區'}, home_address:{S:'文化路一段188號'}, is_enable:{S:'1'}, cre_time:{S:'2025-03-10T10:00:00+08:00'}, last_login_time:{S:'2026-07-30T15:00:00+08:00'} },
    { inbr_account_id:{S:'MBR004'}, member_name:{S:'黃志豪'}, member_phone:{S:'0945-678-004'}, member_email:{S:'huang04@example.com'}, platform_code:{S:'01'}, point_balance:{N:'300'}, home_county:{S:'台中市'}, home_district:{S:'西區'}, home_address:{S:'台灣大道二段689號'}, is_enable:{S:'1'}, cre_time:{S:'2025-04-05T11:00:00+08:00'}, last_login_time:{S:'2026-08-01T08:30:00+08:00'} },
    { inbr_account_id:{S:'MBR005'}, member_name:{S:'李小芳'}, member_phone:{S:'0956-789-005'}, member_email:{S:'li05@example.com'}, platform_code:{S:'01'}, point_balance:{N:'80'}, home_county:{S:'台北市'}, home_district:{S:'中正區'}, home_address:{S:'重慶南路一段122號'}, is_enable:{S:'1'}, cre_time:{S:'2025-05-18T12:00:00+08:00'}, last_login_time:{S:'2026-07-31T20:00:00+08:00'} },
  ],
 
  cms_service_vendor: [
    { vendor_id:{S:'V001'}, name:{S:'潔淨居家清潔'}, service_type:{N:'1'}, description:{S:'專業居家清潔服務，含一般清潔與深度清潔'}, rating_avg:{N:'4.8'}, rating_count:{N:'126'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V002'}, name:{S:'全能家電清洗'}, service_type:{N:'2'}, description:{S:'冷氣、洗衣機、冰箱等家電深層清洗'}, rating_avg:{N:'4.6'}, rating_count:{N:'89'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'桃園市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V003'}, name:{S:'快速寄件服務'}, service_type:{N:'3'}, description:{S:'到府收件，全台配送，當日到府'}, rating_avg:{N:'4.5'}, rating_count:{N:'203'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'台中市'},{S:'高雄市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V005'}, name:{S:'水電王修繕'}, service_type:{N:'10'}, description:{S:'水管、電路、冷氣安裝等修繕服務'}, rating_avg:{N:'4.9'}, rating_count:{N:'178'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V006'}, name:{S:'統一購物商城'}, service_type:{N:'11'}, description:{S:'生活用品、食品、家電線上購物'}, rating_avg:{N:'4.4'}, rating_count:{N:'521'}, service_counties:{L:[{S:'全台'}]}, is_enable:{S:'1'} },
    // ── 中式餐廳 ──
    { vendor_id:{S:'V004'}, name:{S:'饗食天堂'}, service_type:{N:'6'}, description:{S:'精緻中式料理，提供包廂訂位，適合家庭聚餐'}, rating_avg:{N:'4.7'}, rating_count:{N:'312'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V010'}, name:{S:'鼎泰豐信義店'}, service_type:{N:'6'}, description:{S:'世界知名小籠包，經典台灣中式餐廳'}, rating_avg:{N:'4.9'}, rating_count:{N:'856'}, service_counties:{L:[{S:'台北市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V013'}, name:{S:'點水樓'}, service_type:{N:'6'}, description:{S:'精緻江浙菜與港式點心，適合商務宴客'}, rating_avg:{N:'4.7'}, rating_count:{N:'245'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V014'}, name:{S:'欣葉台菜'}, service_type:{N:'6'}, description:{S:'傳統台灣料理，古早味辦桌菜，適合大桌聚餐'}, rating_avg:{N:'4.6'}, rating_count:{N:'378'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'桃園市'}]}, is_enable:{S:'1'} },
    // ── 日式餐廳 ──
    { vendor_id:{S:'V007'}, name:{S:'和風亭日式料理'}, service_type:{N:'6'}, description:{S:'正宗日式定食、壽司、刺身，午間套餐優惠'}, rating_avg:{N:'4.6'}, rating_count:{N:'198'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V015'}, name:{S:'藏壽司台北站前店'}, service_type:{N:'6'}, description:{S:'迴轉壽司，平價新鮮，扭蛋抽獎樂趣多'}, rating_avg:{N:'4.4'}, rating_count:{N:'512'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'桃園市'},{S:'台中市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V016'}, name:{S:'一蘭拉麵台灣本店'}, service_type:{N:'6'}, description:{S:'博多豚骨拉麵，個人座位專注享用'}, rating_avg:{N:'4.5'}, rating_count:{N:'723'}, service_counties:{L:[{S:'台北市'}]}, is_enable:{S:'1'} },
    // ── 西式 / 義式餐廳 ──
    { vendor_id:{S:'V008'}, name:{S:'La Pasta 義式餐廳'}, service_type:{N:'6'}, description:{S:'手工義大利麵、窯烤披薩，浪漫約會首選'}, rating_avg:{N:'4.8'}, rating_count:{N:'267'}, service_counties:{L:[{S:'台北市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V017'}, name:{S:'Smith & Wollensky 牛排館'}, service_type:{N:'6'}, description:{S:'美式頂級牛排，乾式熟成28天，微風信義'}, rating_avg:{N:'4.7'}, rating_count:{N:'189'}, service_counties:{L:[{S:'台北市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V018'}, name:{S:'TUTTO BELLO 美好義式餐廳'}, service_type:{N:'6'}, description:{S:'義式燉飯、手作甜點，家庭聚餐友善'}, rating_avg:{N:'4.5'}, rating_count:{N:'134'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, is_enable:{S:'1'} },
    // ── 韓式餐廳 ──
    { vendor_id:{S:'V009'}, name:{S:'韓國歐巴烤肉'}, service_type:{N:'6'}, description:{S:'正宗韓式烤肉、部隊鍋，提供包廂歡唱'}, rating_avg:{N:'4.5'}, rating_count:{N:'142'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'桃園市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V019'}, name:{S:'新麻蒲海鷗韓式料理'}, service_type:{N:'6'}, description:{S:'韓國人開的道地韓食，辣炒年糕、起司排骨'}, rating_avg:{N:'4.6'}, rating_count:{N:'287'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V020'}, name:{S:'Maple Tree House 楓樹韓國烤肉'}, service_type:{N:'6'}, description:{S:'首爾米其林一星韓式烤肉，厚切牛五花'}, rating_avg:{N:'4.8'}, rating_count:{N:'156'}, service_counties:{L:[{S:'台北市'}]}, is_enable:{S:'1'} },
    // ── 海鮮餐廳 ──
    { vendor_id:{S:'V011'}, name:{S:'漁港海鮮餐廳'}, service_type:{N:'6'}, description:{S:'新鮮現撈海鮮，蒸煮烤炸多種料理，適合大桌聚餐'}, rating_avg:{N:'4.4'}, rating_count:{N:'95'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V021'}, name:{S:'上引水產'}, service_type:{N:'6'}, description:{S:'立吞海鮮市場，現選現做，新鮮直送'}, rating_avg:{N:'4.6'}, rating_count:{N:'432'}, service_counties:{L:[{S:'台北市'}]}, is_enable:{S:'1'} },
    // ── 泰式餐廳 ──
    { vendor_id:{S:'V012'}, name:{S:'泰味食堂'}, service_type:{N:'6'}, description:{S:'道地泰式料理，酸辣開胃，平價大份量'}, rating_avg:{N:'4.3'}, rating_count:{N:'178'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'台中市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V022'}, name:{S:'Nara Thai Cuisine'}, service_type:{N:'6'}, description:{S:'泰國曼谷連鎖，精緻泰式料理，環境優雅'}, rating_avg:{N:'4.5'}, rating_count:{N:'203'}, service_counties:{L:[{S:'台北市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V023'}, name:{S:'瓦城泰統'}, service_type:{N:'6'}, description:{S:'台灣最大泰式餐飲集團，口味穩定，多人合菜'}, rating_avg:{N:'4.4'}, rating_count:{N:'567'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'桃園市'},{S:'台中市'},{S:'高雄市'}]}, is_enable:{S:'1'} },
  ],
 
  pms_vendor_account: [
    { account_id:{S:'VA001'}, vendor_id:{S:'V001'}, account_name:{S:'清潔管理員'}, role_code:{S:'01'}, is_enable:{S:'1'}, cre_time:{S:'2025-01-01T08:00:00+08:00'} },
    { account_id:{S:'VA002'}, vendor_id:{S:'V002'}, account_name:{S:'家電客服'}, role_code:{S:'01'}, is_enable:{S:'1'}, cre_time:{S:'2025-01-01T08:00:00+08:00'} },
    { account_id:{S:'VA003'}, vendor_id:{S:'V003'}, account_name:{S:'寄件專員'}, role_code:{S:'02'}, is_enable:{S:'1'}, cre_time:{S:'2025-01-01T08:00:00+08:00'} },
    { account_id:{S:'VA004'}, vendor_id:{S:'V004'}, account_name:{S:'餐廳訂位'}, role_code:{S:'01'}, is_enable:{S:'1'}, cre_time:{S:'2025-01-01T08:00:00+08:00'} },
    { account_id:{S:'VA005'}, vendor_id:{S:'V005'}, account_name:{S:'水電師傅'}, role_code:{S:'01'}, is_enable:{S:'1'}, cre_time:{S:'2025-01-01T08:00:00+08:00'} },
  ],
 
  pms_form_feedback: [
    { feedback_no:{S:'FB20260801001'}, service_id:{N:'17'}, form_id:{N:'3'}, platform_code:{S:'01'}, inbr_account_id:{S:'MBR001'}, contact_name:{S:'王小明'}, contact_mobile:{S:'0912-345-001'}, contact_email:{S:'wang01@example.com'}, contact_address_county:{S:'台北市'}, contact_address_district:{S:'信義區'}, description:{S:'客廳水管漏水，情況緊急'}, feedback_content:{M:{urgency:{S:'越快越好'},size:{S:'30坪'},detail:{S:'廚房與廁所間管線漏水'}}}, status:{S:'02'}, is_read:{S:'1'}, cre_time:{S:'2026-08-01T08:23:00+08:00'}, upd_time:{S:'2026-08-01T08:30:00+08:00'} },
    { feedback_no:{S:'FB20260801002'}, service_id:{N:'9'}, form_id:{N:'1'}, platform_code:{S:'01'}, inbr_account_id:{S:'MBR002'}, contact_name:{S:'陳美玲'}, contact_mobile:{S:'0923-456-002'}, contact_email:{S:'chen02@example.com'}, contact_address_county:{S:'台北市'}, contact_address_district:{S:'大安區'}, description:{S:'週末晚餐訂位4人'}, feedback_content:{M:{date:{S:'2026-08-08'},pax:{S:'4'},time:{S:'晚餐18:00'},special:{S:'無'}}}, status:{S:'01'}, is_read:{S:'0'}, cre_time:{S:'2026-08-01T09:45:00+08:00'}, upd_time:{S:'2026-08-01T09:45:00+08:00'} },
    { feedback_no:{S:'FB20260731003'}, service_id:{N:'4'}, form_id:{N:'3'}, platform_code:{S:'01'}, inbr_account_id:{S:'MBR003'}, contact_name:{S:'林大偉'}, contact_mobile:{S:'0934-567-003'}, contact_email:{S:'lin03@example.com'}, contact_address_county:{S:'新北市'}, contact_address_district:{S:'板橋區'}, description:{S:'居家清潔服務，約3小時'}, feedback_content:{M:{type:{S:'一般居家清潔'},size:{S:'25坪'},urgency:{S:'本週內'}}}, status:{S:'03'}, is_read:{S:'1'}, cre_time:{S:'2026-07-31T14:10:00+08:00'}, upd_time:{S:'2026-08-01T10:00:00+08:00'} },
    { feedback_no:{S:'FB20260801004'}, service_id:{N:'3'}, form_id:{N:'4'}, platform_code:{S:'01'}, inbr_account_id:{S:'MBR004'}, contact_name:{S:'黃志豪'}, contact_mobile:{S:'0945-678-004'}, contact_email:{S:'huang04@example.com'}, contact_address_county:{S:'台中市'}, contact_address_district:{S:'西區'}, description:{S:'寄送電腦設備，需小心包裝'}, feedback_content:{M:{size:{S:'中型'},weight:{S:'5'},pickup:{S:'到府收件'}}}, status:{S:'01'}, is_read:{S:'0'}, cre_time:{S:'2026-08-01T10:30:00+08:00'}, upd_time:{S:'2026-08-01T10:30:00+08:00'} },
    { feedback_no:{S:'FB20260731005'}, service_id:{N:'2'}, form_id:{N:'3'}, platform_code:{S:'01'}, inbr_account_id:{S:'MBR005'}, contact_name:{S:'李小芳'}, contact_mobile:{S:'0956-789-005'}, contact_email:{S:'li05@example.com'}, contact_address_county:{S:'台北市'}, contact_address_district:{S:'中正區'}, description:{S:'冷氣清洗，2台分離式'}, feedback_content:{M:{type:{S:'家電清洗'},count:{S:'2'},urgency:{S:'彈性配合'}}}, status:{S:'03'}, is_read:{S:'1'}, cre_time:{S:'2026-07-31T16:55:00+08:00'}, upd_time:{S:'2026-08-01T11:00:00+08:00'} },
  ],
 
  pms_case_assignment: [
    { assignment_id:{S:'ASN001'}, feedback_no:{S:'FB20260801001'}, vendor_id:{S:'V005'}, match_score:{N:'95'}, is_primary:{S:'1'}, status:{S:'02'}, reject_reason:{S:''}, cre_time:{S:'2026-08-01T08:25:00+08:00'} },
    { assignment_id:{S:'ASN002'}, feedback_no:{S:'FB20260801002'}, vendor_id:{S:'V004'}, match_score:{N:'88'}, is_primary:{S:'1'}, status:{S:'01'}, reject_reason:{S:''}, cre_time:{S:'2026-08-01T09:46:00+08:00'} },
    { assignment_id:{S:'ASN003'}, feedback_no:{S:'FB20260731003'}, vendor_id:{S:'V001'}, match_score:{N:'92'}, is_primary:{S:'1'}, status:{S:'02'}, reject_reason:{S:''}, cre_time:{S:'2026-07-31T14:15:00+08:00'} },
    { assignment_id:{S:'ASN004'}, feedback_no:{S:'FB20260801004'}, vendor_id:{S:'V003'}, match_score:{N:'85'}, is_primary:{S:'1'}, status:{S:'01'}, reject_reason:{S:''}, cre_time:{S:'2026-08-01T10:31:00+08:00'} },
    { assignment_id:{S:'ASN005'}, feedback_no:{S:'FB20260731005'}, vendor_id:{S:'V002'}, match_score:{N:'90'}, is_primary:{S:'1'}, status:{S:'02'}, reject_reason:{S:''}, cre_time:{S:'2026-07-31T17:00:00+08:00'} },
  ],
 
  pms_case_reply: [
    { reply_id:{S:'RPL001'}, feedback_no:{S:'FB20260801001'}, vendor_id:{S:'V005'}, reply_type:{S:'01'}, content:{S:'已電話聯繫王先生，確認今日下午2點到場處理'}, cre_time:{S:'2026-08-01T09:00:00+08:00'}, cre_id:{S:'VA005'} },
    { reply_id:{S:'RPL002'}, feedback_no:{S:'FB20260731003'}, vendor_id:{S:'V001'}, reply_type:{S:'02'}, content:{S:'您好，已確認8/1上午10點到府服務'}, cre_time:{S:'2026-07-31T15:00:00+08:00'}, cre_id:{S:'VA001'} },
    { reply_id:{S:'RPL003'}, feedback_no:{S:'FB20260731005'}, vendor_id:{S:'V002'}, reply_type:{S:'01'}, content:{S:'電話確認冷氣清洗，安排8/2下午3點'}, cre_time:{S:'2026-07-31T17:30:00+08:00'}, cre_id:{S:'VA002'} },
    { reply_id:{S:'RPL004'}, feedback_no:{S:'FB20260801001'}, vendor_id:{S:'V005'}, reply_type:{S:'03'}, content:{S:'到場評估，需更換管線，費用約3000元，客戶同意'}, cre_time:{S:'2026-08-01T14:30:00+08:00'}, cre_id:{S:'VA005'} },
    { reply_id:{S:'RPL005'}, feedback_no:{S:'FB20260731003'}, vendor_id:{S:'V001'}, reply_type:{S:'02'}, content:{S:'清潔完成，客戶確認驗收'}, cre_time:{S:'2026-08-01T13:00:00+08:00'}, cre_id:{S:'VA001'} },
  ],
 
  pms_case_status_log: [
    { log_id:{S:'LOG001'}, feedback_no:{S:'FB20260801001'}, old_status:{S:'01'}, new_status:{S:'02'}, changed_by:{S:'SYSTEM'}, remark:{S:'AI自動媒合廠商'}, cre_time:{S:'2026-08-01T08:25:00+08:00'} },
    { log_id:{S:'LOG002'}, feedback_no:{S:'FB20260731003'}, old_status:{S:'01'}, new_status:{S:'02'}, changed_by:{S:'SYSTEM'}, remark:{S:'AI自動媒合廠商'}, cre_time:{S:'2026-07-31T14:15:00+08:00'} },
    { log_id:{S:'LOG003'}, feedback_no:{S:'FB20260731003'}, old_status:{S:'02'}, new_status:{S:'03'}, changed_by:{S:'VA001'}, remark:{S:'清潔完成，客戶驗收'}, cre_time:{S:'2026-08-01T13:00:00+08:00'} },
    { log_id:{S:'LOG004'}, feedback_no:{S:'FB20260731005'}, old_status:{S:'01'}, new_status:{S:'02'}, changed_by:{S:'SYSTEM'}, remark:{S:'AI自動媒合廠商'}, cre_time:{S:'2026-07-31T17:00:00+08:00'} },
    { log_id:{S:'LOG005'}, feedback_no:{S:'FB20260731005'}, old_status:{S:'02'}, new_status:{S:'03'}, changed_by:{S:'VA002'}, remark:{S:'冷氣清洗完成'}, cre_time:{S:'2026-08-02T16:00:00+08:00'} },
    { log_id:{S:'LOG006'}, feedback_no:{S:'FB20260801002'}, old_status:{S:'01'}, new_status:{S:'01'}, changed_by:{S:'SYSTEM'}, remark:{S:'等待廠商確認'}, cre_time:{S:'2026-08-01T09:46:00+08:00'} },
  ],
 
  pms_case_review: [
    { review_id:{S:'RVW001'}, feedback_no:{S:'FB20260731003'}, vendor_id:{S:'V001'}, inbr_account_id:{S:'MBR003'}, rating:{N:'5'}, comment:{S:'清潔很徹底，師傅很專業，非常滿意！'}, is_anonymous:{S:'0'}, cre_time:{S:'2026-08-01T14:00:00+08:00'} },
    { review_id:{S:'RVW002'}, feedback_no:{S:'FB20260731005'}, vendor_id:{S:'V002'}, inbr_account_id:{S:'MBR005'}, rating:{N:'4'}, comment:{S:'清洗後冷氣明顯變涼，服務態度不錯'}, is_anonymous:{S:'1'}, cre_time:{S:'2026-08-02T17:00:00+08:00'} },
    { review_id:{S:'RVW003'}, feedback_no:{S:'FB20260801001'}, vendor_id:{S:'V005'}, inbr_account_id:{S:'MBR001'}, rating:{N:'5'}, comment:{S:'緊急水管修繕，師傅快速到場，技術很好'}, is_anonymous:{S:'0'}, cre_time:{S:'2026-08-01T18:00:00+08:00'} },
    { review_id:{S:'RVW004'}, feedback_no:{S:'FB20260801004'}, vendor_id:{S:'V003'}, inbr_account_id:{S:'MBR004'}, rating:{N:'4'}, comment:{S:'準時到府收件，包裝也很安全'}, is_anonymous:{S:'0'}, cre_time:{S:'2026-08-02T10:00:00+08:00'} },
    { review_id:{S:'RVW005'}, feedback_no:{S:'FB20260801002'}, vendor_id:{S:'V004'}, inbr_account_id:{S:'MBR002'}, rating:{N:'5'}, comment:{S:'餐廳環境很好，食物美味，服務周到'}, is_anonymous:{S:'0'}, cre_time:{S:'2026-08-09T21:00:00+08:00'} },
  ],
 
  mms_order_record: [
    { record_id:{S:'ORD001'}, order_no:{S:'ORD20260801001'}, service_vendor_id:{S:'V005'}, service_id:{N:'17'}, inbr_account_id:{S:'MBR001'}, order_type:{S:'01'}, order_status:{S:'80'}, final_amount:{N:'3000'}, order_items:{L:[{M:{name:{S:'水管修繕'},qty:{N:'1'},price:{N:'3000'}}}]}, cre_time:{S:'2026-08-01T14:00:00+08:00'} },
    { record_id:{S:'ORD002'}, order_no:{S:'ORD20260801002'}, service_vendor_id:{S:'V004'}, service_id:{N:'9'}, inbr_account_id:{S:'MBR002'}, order_type:{S:'02'}, order_status:{S:'03'}, final_amount:{N:'0'}, order_items:{L:[{M:{name:{S:'4人晚餐訂位'},qty:{N:'1'},price:{N:'0'}}}]}, cre_time:{S:'2026-08-01T09:46:00+08:00'} },
    { record_id:{S:'ORD003'}, order_no:{S:'ORD20260731003'}, service_vendor_id:{S:'V001'}, service_id:{N:'4'}, inbr_account_id:{S:'MBR003'}, order_type:{S:'01'}, order_status:{S:'80'}, final_amount:{N:'2500'}, order_items:{L:[{M:{name:{S:'居家清潔3小時'},qty:{N:'1'},price:{N:'2500'}}}]}, cre_time:{S:'2026-07-31T14:10:00+08:00'} },
    { record_id:{S:'ORD004'}, order_no:{S:'ORD20260801004'}, service_vendor_id:{S:'V003'}, service_id:{N:'3'}, inbr_account_id:{S:'MBR004'}, order_type:{S:'01'}, order_status:{S:'03'}, final_amount:{N:'180'}, order_items:{L:[{M:{name:{S:'中型包裹寄送'},qty:{N:'1'},price:{N:'180'}}}]}, cre_time:{S:'2026-08-01T10:30:00+08:00'} },
    { record_id:{S:'ORD005'}, order_no:{S:'ORD20260731005'}, service_vendor_id:{S:'V002'}, service_id:{N:'2'}, inbr_account_id:{S:'MBR005'}, order_type:{S:'01'}, order_status:{S:'80'}, final_amount:{N:'1800'}, order_items:{L:[{M:{name:{S:'冷氣清洗x2'},qty:{N:'2'},price:{N:'900'}}}]}, cre_time:{S:'2026-07-31T16:55:00+08:00'} },
    { record_id:{S:'ORD006'}, order_no:{S:'ORD20260801006'}, service_vendor_id:{S:'V006'}, service_id:{N:'16'}, inbr_account_id:{S:'MBR001'}, order_type:{S:'05'}, order_status:{S:'90'}, final_amount:{N:'0'}, order_items:{L:[{M:{name:{S:'商品訂單'},qty:{N:'1'},price:{N:'500'}}}]}, cre_time:{S:'2026-08-01T11:00:00+08:00'} },
  ],
 
  sys_district: [
    { code:{S:'100'}, name:{S:'中正區'}, county_code:{S:'TPE'}, zip:{S:'100'} },
    { code:{S:'106'}, name:{S:'大安區'}, county_code:{S:'TPE'}, zip:{S:'106'} },
    { code:{S:'110'}, name:{S:'信義區'}, county_code:{S:'TPE'}, zip:{S:'110'} },
    { code:{S:'105'}, name:{S:'松山區'}, county_code:{S:'TPE'}, zip:{S:'105'} },
    { code:{S:'220'}, name:{S:'板橋區'}, county_code:{S:'NTP'}, zip:{S:'220'} },
    { code:{S:'231'}, name:{S:'新店區'}, county_code:{S:'NTP'}, zip:{S:'231'} },
    { code:{S:'400'}, name:{S:'中區'}, county_code:{S:'TXG'}, zip:{S:'400'} },
    { code:{S:'403'}, name:{S:'西區'}, county_code:{S:'TXG'}, zip:{S:'403'} },
    { code:{S:'800'}, name:{S:'新興區'}, county_code:{S:'KHH'}, zip:{S:'800'} },
    { code:{S:'330'}, name:{S:'桃園區'}, county_code:{S:'TYC'}, zip:{S:'330'} },
  ],
};
 
module.exports = { SEED_DATA };