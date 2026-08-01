/**
 * fix-data.js
 * DynamoDB 資料補齊腳本 — 在 AWS CloudShell 執行
 * 使用方式: node fix-data.js
 */
const { DynamoDBClient, PutItemCommand, CreateTableCommand, ScanCommand, DeleteItemCommand, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: 'us-west-2' });

// ========== 1. 補充廠商與帳號 ==========

async function fixVendors() {
  console.log('\n=== 1. 補充廠商與帳號 ===\n');

  const newVendors = [
    { vendor_id:{S:'V007'}, name:{S:'康健藥局'}, service_type:{N:'12'}, description:{S:'藥品外送、健康諮詢'}, rating_avg:{N:'4.3'}, rating_count:{N:'67'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, is_enable:{S:'1'} },
    { vendor_id:{S:'V008'}, name:{S:'順風叫車'}, service_type:{N:'13'}, description:{S:'社區接送、長者叫車'}, rating_avg:{N:'4.6'}, rating_count:{N:'145'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'桃園市'},{S:'台中市'},{S:'高雄市'}]}, is_enable:{S:'1'} },
  ];

  for (const item of newVendors) {
    await client.send(new PutItemCommand({ TableName: 'cms_service_vendor', Item: item }));
    console.log(`✓ cms_service_vendor: ${item.name.S}`);
  }

  const newAccounts = [
    { account_id:{S:'VA006'}, vendor_id:{S:'V006'}, account_name:{S:'商城客服'}, role_code:{S:'01'}, is_enable:{S:'1'}, cre_time:{S:'2025-01-01T08:00:00+08:00'} },
    { account_id:{S:'VA007'}, vendor_id:{S:'V007'}, account_name:{S:'藥局管理員'}, role_code:{S:'01'}, is_enable:{S:'1'}, cre_time:{S:'2025-01-01T08:00:00+08:00'} },
    { account_id:{S:'VA008'}, vendor_id:{S:'V008'}, account_name:{S:'叫車調度'}, role_code:{S:'01'}, is_enable:{S:'1'}, cre_time:{S:'2025-01-01T08:00:00+08:00'} },
  ];

  for (const item of newAccounts) {
    await client.send(new PutItemCommand({ TableName: 'pms_vendor_account', Item: item }));
    console.log(`✓ pms_vendor_account: ${item.account_name.S}`);
  }
}

// ========== 2. 建立表單系統 ==========

async function fixForms() {
  console.log('\n=== 2. 建立表單系統 ===\n');

  // 建立 4 張表
  const tables = [
    { TableName: 'pms_form', KeySchema: [{AttributeName:'id',KeyType:'HASH'}], AttributeDefinitions: [{AttributeName:'id',AttributeType:'N'}], BillingMode:'PAY_PER_REQUEST' },
    { TableName: 'pms_form_group', KeySchema: [{AttributeName:'id',KeyType:'HASH'}], AttributeDefinitions: [{AttributeName:'id',AttributeType:'N'}], BillingMode:'PAY_PER_REQUEST' },
    { TableName: 'pms_form_topic', KeySchema: [{AttributeName:'id',KeyType:'HASH'}], AttributeDefinitions: [{AttributeName:'id',AttributeType:'N'}], BillingMode:'PAY_PER_REQUEST' },
    { TableName: 'pms_topic_option', KeySchema: [{AttributeName:'id',KeyType:'HASH'}], AttributeDefinitions: [{AttributeName:'id',AttributeType:'N'}], BillingMode:'PAY_PER_REQUEST' },
  ];

  for (const def of tables) {
    try {
      await client.send(new CreateTableCommand(def));
      console.log(`✓ 建立資料表: ${def.TableName}`);
      await new Promise(r => setTimeout(r, 5000)); // 等待 ACTIVE
    } catch (e) {
      if (e.name === 'ResourceInUseException') {
        console.log(`⊘ 資料表已存在: ${def.TableName}`);
      } else { throw e; }
    }
  }

  // pms_form (3筆)
  const forms = [
    { id:{N:'1'}, service_vendor_id:{N:'1'}, type:{S:'1'}, sub_type:{S:'1'}, name:{S:'餐廳訂位需求表單'}, intro_content:{S:'<p>請留下您的訂位需求，我們將盡快為您安排。</p>'}, is_enable:{S:'1'}, is_deleted:{S:'0'}, cre_time:{S:'2026-07-01T09:00:00+08:00'} },
    { id:{N:'2'}, service_vendor_id:{N:'2'}, type:{S:'1'}, sub_type:{S:'1'}, name:{S:'商品購買需求表單'}, intro_content:{S:'<p>告訴我們您想採買的商品，我們協助媒合合適賣家。</p>'}, is_enable:{S:'1'}, is_deleted:{S:'0'}, cre_time:{S:'2026-07-01T09:00:00+08:00'} },
    { id:{N:'3'}, service_vendor_id:{N:'5'}, type:{S:'2'}, sub_type:{S:'2'}, name:{S:'社區服務諮詢表單'}, intro_content:{S:'<p>家事、水電、長者陪伴等社區服務，留下需求由專人為您評估。</p>'}, is_enable:{S:'1'}, is_deleted:{S:'0'}, cre_time:{S:'2026-07-01T09:00:00+08:00'} },
  ];
  for (const item of forms) {
    await client.send(new PutItemCommand({ TableName: 'pms_form', Item: item }));
  }
  console.log(`✓ pms_form: ${forms.length} 筆`);

  // pms_form_group (6筆)
  const groups = [
    { id:{N:'1'}, form_id:{N:'1'}, name:{S:'基本聯絡資料'}, sort:{N:'1'} },
    { id:{N:'2'}, form_id:{N:'1'}, name:{S:'訂位需求'}, sort:{N:'2'} },
    { id:{N:'3'}, form_id:{N:'2'}, name:{S:'基本聯絡資料'}, sort:{N:'1'} },
    { id:{N:'4'}, form_id:{N:'2'}, name:{S:'商品需求'}, sort:{N:'2'} },
    { id:{N:'5'}, form_id:{N:'3'}, name:{S:'基本聯絡資料'}, sort:{N:'1'} },
    { id:{N:'6'}, form_id:{N:'3'}, name:{S:'服務需求詳情'}, sort:{N:'2'} },
  ];
  for (const item of groups) {
    await client.send(new PutItemCommand({ TableName: 'pms_form_group', Item: item }));
  }
  console.log(`✓ pms_form_group: ${groups.length} 筆`);

  // pms_form_topic (14筆)
  const topics = [
    { id:{N:'1'}, form_id:{N:'1'}, form_group_id:{N:'1'}, type:{S:'8'}, title:{S:'聯絡資訊'}, is_required:{S:'1'}, sort:{N:'1'} },
    { id:{N:'2'}, form_id:{N:'1'}, form_group_id:{N:'1'}, type:{S:'5'}, title:{S:'用餐地區'}, is_required:{S:'1'}, sort:{N:'2'} },
    { id:{N:'3'}, form_id:{N:'1'}, form_group_id:{N:'2'}, type:{S:'9'}, title:{S:'希望訂位日期時間'}, is_required:{S:'1'}, sort:{N:'1'}, start_date_offset_days:{N:'0'}, end_date_offset_days:{N:'30'} },
    { id:{N:'4'}, form_id:{N:'1'}, form_group_id:{N:'2'}, type:{S:'1'}, title:{S:'用餐人數'}, is_required:{S:'1'}, sort:{N:'2'}, is_number_only:{S:'1'} },
    { id:{N:'5'}, form_id:{N:'1'}, form_group_id:{N:'2'}, type:{S:'3'}, title:{S:'餐廳類型偏好'}, is_required:{S:'0'}, sort:{N:'3'} },
    { id:{N:'6'}, form_id:{N:'2'}, form_group_id:{N:'3'}, type:{S:'8'}, title:{S:'聯絡資訊'}, is_required:{S:'1'}, sort:{N:'1'} },
    { id:{N:'7'}, form_id:{N:'2'}, form_group_id:{N:'4'}, type:{S:'2'}, title:{S:'想購買的商品描述'}, is_required:{S:'1'}, sort:{N:'1'} },
    { id:{N:'8'}, form_id:{N:'2'}, form_group_id:{N:'4'}, type:{S:'4'}, title:{S:'商品類別'}, is_required:{S:'0'}, sort:{N:'2'} },
    { id:{N:'9'}, form_id:{N:'2'}, form_group_id:{N:'4'}, type:{S:'1'}, title:{S:'預算上限(元)'}, is_required:{S:'0'}, sort:{N:'3'}, is_number_only:{S:'1'} },
    { id:{N:'10'}, form_id:{N:'3'}, form_group_id:{N:'5'}, type:{S:'10'}, title:{S:'聯絡資訊'}, is_required:{S:'1'}, sort:{N:'1'} },
    { id:{N:'11'}, form_id:{N:'3'}, form_group_id:{N:'5'}, type:{S:'5'}, title:{S:'服務地區'}, is_required:{S:'1'}, sort:{N:'2'} },
    { id:{N:'12'}, form_id:{N:'3'}, form_group_id:{N:'6'}, type:{S:'3'}, title:{S:'需求類型'}, is_required:{S:'1'}, sort:{N:'1'} },
    { id:{N:'13'}, form_id:{N:'3'}, form_group_id:{N:'6'}, type:{S:'7'}, title:{S:'需求詳細說明'}, is_required:{S:'0'}, sort:{N:'2'} },
    { id:{N:'14'}, form_id:{N:'3'}, form_group_id:{N:'6'}, type:{S:'9'}, title:{S:'希望服務時間'}, is_required:{S:'0'}, sort:{N:'3'}, start_date_offset_days:{N:'0'}, end_date_offset_days:{N:'14'} },
  ];
  for (const item of topics) {
    await client.send(new PutItemCommand({ TableName: 'pms_form_topic', Item: item }));
  }
  console.log(`✓ pms_form_topic: ${topics.length} 筆`);

  // pms_topic_option (11筆)
  const options = [
    { id:{N:'1'}, form_id:{N:'1'}, topic_id:{N:'5'}, option_name:{S:'中式'}, sort:{N:'1'} },
    { id:{N:'2'}, form_id:{N:'1'}, topic_id:{N:'5'}, option_name:{S:'日式'}, sort:{N:'2'} },
    { id:{N:'3'}, form_id:{N:'1'}, topic_id:{N:'5'}, option_name:{S:'西式'}, sort:{N:'3'} },
    { id:{N:'4'}, form_id:{N:'2'}, topic_id:{N:'8'}, option_name:{S:'生鮮食品'}, sort:{N:'1'} },
    { id:{N:'5'}, form_id:{N:'2'}, topic_id:{N:'8'}, option_name:{S:'日用品'}, sort:{N:'2'} },
    { id:{N:'6'}, form_id:{N:'2'}, topic_id:{N:'8'}, option_name:{S:'3C家電'}, sort:{N:'3'} },
    { id:{N:'7'}, form_id:{N:'2'}, topic_id:{N:'8'}, option_name:{S:'服飾'}, sort:{N:'4'} },
    { id:{N:'8'}, form_id:{N:'3'}, topic_id:{N:'12'}, option_name:{S:'家事清潔'}, sort:{N:'1'} },
    { id:{N:'9'}, form_id:{N:'3'}, topic_id:{N:'12'}, option_name:{S:'水電修繕'}, sort:{N:'2'} },
    { id:{N:'10'}, form_id:{N:'3'}, topic_id:{N:'12'}, option_name:{S:'長者陪伴'}, sort:{N:'3'} },
    { id:{N:'11'}, form_id:{N:'3'}, topic_id:{N:'12'}, option_name:{S:'其他'}, sort:{N:'4'} },
  ];
  for (const item of options) {
    await client.send(new PutItemCommand({ TableName: 'pms_topic_option', Item: item }));
  }
  console.log(`✓ pms_topic_option: ${options.length} 筆`);
}

// ========== 3. 修正 sys_district 縣市代碼 ==========

async function fixDistricts() {
  console.log('\n=== 3. 修正 sys_district 縣市代碼 ===\n');

  // 先掃描並刪除所有舊資料
  const scanResult = await client.send(new ScanCommand({ TableName: 'sys_district' }));
  if (scanResult.Items && scanResult.Items.length > 0) {
    for (const item of scanResult.Items) {
      await client.send(new DeleteItemCommand({
        TableName: 'sys_district',
        Key: { county_code: item.county_code, code: item.code }
      }));
    }
    console.log(`✓ 刪除舊資料 ${scanResult.Items.length} 筆`);
  }

  // 插入新資料（county_code 統一為 2 位數字）
  const districts = [
    { county_code:{S:'01'}, code:{S:'011'}, name:{S:'大安區'}, name_with_county:{S:'台北市大安區'}, zip:{S:'106'}, sort:{N:'1'} },
    { county_code:{S:'01'}, code:{S:'012'}, name:{S:'信義區'}, name_with_county:{S:'台北市信義區'}, zip:{S:'110'}, sort:{N:'2'} },
    { county_code:{S:'01'}, code:{S:'013'}, name:{S:'中山區'}, name_with_county:{S:'台北市中山區'}, zip:{S:'104'}, sort:{N:'3'} },
    { county_code:{S:'01'}, code:{S:'100'}, name:{S:'中正區'}, name_with_county:{S:'台北市中正區'}, zip:{S:'100'}, sort:{N:'4'} },
    { county_code:{S:'01'}, code:{S:'105'}, name:{S:'松山區'}, name_with_county:{S:'台北市松山區'}, zip:{S:'105'}, sort:{N:'5'} },
    { county_code:{S:'02'}, code:{S:'021'}, name:{S:'板橋區'}, name_with_county:{S:'新北市板橋區'}, zip:{S:'220'}, sort:{N:'1'} },
    { county_code:{S:'02'}, code:{S:'022'}, name:{S:'新莊區'}, name_with_county:{S:'新北市新莊區'}, zip:{S:'242'}, sort:{N:'2'} },
    { county_code:{S:'02'}, code:{S:'023'}, name:{S:'三重區'}, name_with_county:{S:'新北市三重區'}, zip:{S:'241'}, sort:{N:'3'} },
    { county_code:{S:'02'}, code:{S:'231'}, name:{S:'新店區'}, name_with_county:{S:'新北市新店區'}, zip:{S:'231'}, sort:{N:'4'} },
    { county_code:{S:'03'}, code:{S:'031'}, name:{S:'桃園區'}, name_with_county:{S:'桃園市桃園區'}, zip:{S:'330'}, sort:{N:'1'} },
    { county_code:{S:'03'}, code:{S:'032'}, name:{S:'中壢區'}, name_with_county:{S:'桃園市中壢區'}, zip:{S:'320'}, sort:{N:'2'} },
    { county_code:{S:'04'}, code:{S:'041'}, name:{S:'西屯區'}, name_with_county:{S:'台中市西屯區'}, zip:{S:'407'}, sort:{N:'1'} },
    { county_code:{S:'04'}, code:{S:'042'}, name:{S:'北屯區'}, name_with_county:{S:'台中市北屯區'}, zip:{S:'406'}, sort:{N:'2'} },
    { county_code:{S:'04'}, code:{S:'400'}, name:{S:'中區'}, name_with_county:{S:'台中市中區'}, zip:{S:'400'}, sort:{N:'3'} },
    { county_code:{S:'04'}, code:{S:'403'}, name:{S:'西區'}, name_with_county:{S:'台中市西區'}, zip:{S:'403'}, sort:{N:'4'} },
    { county_code:{S:'06'}, code:{S:'061'}, name:{S:'苓雅區'}, name_with_county:{S:'高雄市苓雅區'}, zip:{S:'802'}, sort:{N:'1'} },
    { county_code:{S:'06'}, code:{S:'062'}, name:{S:'三民區'}, name_with_county:{S:'高雄市三民區'}, zip:{S:'807'}, sort:{N:'2'} },
    { county_code:{S:'06'}, code:{S:'800'}, name:{S:'新興區'}, name_with_county:{S:'高雄市新興區'}, zip:{S:'800'}, sort:{N:'3'} },
  ];

  for (const item of districts) {
    await client.send(new PutItemCommand({ TableName: 'sys_district', Item: item }));
  }
  console.log(`✓ sys_district: 插入 ${districts.length} 筆（county_code 已改為數字格式）`);
}

// ========== Main ==========

async function main() {
  try {
    console.log('=== DynamoDB 資料補齊腳本 ===');
    console.log(`Region: us-west-2`);
    console.log(`時間: ${new Date().toISOString()}\n`);

    await fixVendors();
    await fixForms();
    await fixDistricts();

    console.log('\n✓ 所有資料補齊完成！');
  } catch (error) {
    console.error('\n✗ 執行失敗:', error.message);
    process.exit(1);
  }
}

main();
