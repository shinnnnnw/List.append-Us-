/**
 * sync-from-mysql.js
 * MySQL → DynamoDB 同步腳本（在 AWS CloudShell 執行）
 * 使用方式: node sync-from-mysql.js
 */
const { DynamoDBClient, CreateTableCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const client = new DynamoDBClient({ region: 'us-west-2' });

async function createTable(def) {
  try {
    await client.send(new CreateTableCommand(def));
    console.log(`  ✓ 建立: ${def.TableName}`);
    await new Promise(r => setTimeout(r, 5000));
  } catch(e) {
    if (e.name === 'ResourceInUseException') console.log(`  ⊘ 已存在: ${def.TableName}`);
    else throw e;
  }
}

async function putItems(tableName, items) {
  for (const item of items) {
    await client.send(new PutItemCommand({ TableName: tableName, Item: item }));
  }
  console.log(`  ✓ ${tableName}: ${items.length} 筆`);
}

async function step1_createTables() {
  console.log('\n【1】建立缺少的資料表\n');
  const tables = [
    { TableName:'sys_county', KeySchema:[{AttributeName:'code',KeyType:'HASH'}], AttributeDefinitions:[{AttributeName:'code',AttributeType:'S'}], BillingMode:'PAY_PER_REQUEST' },
    { TableName:'pms_form', KeySchema:[{AttributeName:'id',KeyType:'HASH'}], AttributeDefinitions:[{AttributeName:'id',AttributeType:'N'}], BillingMode:'PAY_PER_REQUEST' },
    { TableName:'pms_form_group', KeySchema:[{AttributeName:'id',KeyType:'HASH'}], AttributeDefinitions:[{AttributeName:'id',AttributeType:'N'}], BillingMode:'PAY_PER_REQUEST' },
    { TableName:'pms_form_topic', KeySchema:[{AttributeName:'id',KeyType:'HASH'}], AttributeDefinitions:[{AttributeName:'id',AttributeType:'N'}], BillingMode:'PAY_PER_REQUEST' },
    { TableName:'pms_topic_option', KeySchema:[{AttributeName:'id',KeyType:'HASH'}], AttributeDefinitions:[{AttributeName:'id',AttributeType:'N'}], BillingMode:'PAY_PER_REQUEST' },
    { TableName:'pms_vendor_service_type', KeySchema:[{AttributeName:'vendor_id',KeyType:'HASH'},{AttributeName:'service_type',KeyType:'RANGE'}], AttributeDefinitions:[{AttributeName:'vendor_id',AttributeType:'N'},{AttributeName:'service_type',AttributeType:'S'}], BillingMode:'PAY_PER_REQUEST' },
  ];
  for (const t of tables) await createTable(t);
}


async function step2_seedNewTables() {
  console.log('\n【2】填入新建表資料\n');
  await putItems('sys_county', [
    {code:{S:'01'},name:{S:'台北市'},sort:{N:'1'}},{code:{S:'02'},name:{S:'新北市'},sort:{N:'2'}},
    {code:{S:'03'},name:{S:'桃園市'},sort:{N:'3'}},{code:{S:'04'},name:{S:'台中市'},sort:{N:'4'}},
    {code:{S:'05'},name:{S:'台南市'},sort:{N:'5'}},{code:{S:'06'},name:{S:'高雄市'},sort:{N:'6'}},
  ]);
  await putItems('pms_form', [
    {id:{N:'1'},service_vendor_id:{N:'1'},type:{S:'1'},sub_type:{S:'1'},name:{S:'餐廳訂位需求表單'},is_enable:{S:'1'},is_deleted:{S:'0'},cre_time:{S:'2026-07-01T09:00:00+08:00'}},
    {id:{N:'2'},service_vendor_id:{N:'2'},type:{S:'1'},sub_type:{S:'1'},name:{S:'商品購買需求表單'},is_enable:{S:'1'},is_deleted:{S:'0'},cre_time:{S:'2026-07-01T09:00:00+08:00'}},
    {id:{N:'3'},service_vendor_id:{N:'5'},type:{S:'2'},sub_type:{S:'2'},name:{S:'社區服務諮詢表單'},is_enable:{S:'1'},is_deleted:{S:'0'},cre_time:{S:'2026-07-01T09:00:00+08:00'}},
  ]);
  await putItems('pms_form_group', [
    {id:{N:'1'},form_id:{N:'1'},name:{S:'基本聯絡資料'},sort:{N:'1'}},{id:{N:'2'},form_id:{N:'1'},name:{S:'訂位需求'},sort:{N:'2'}},
    {id:{N:'3'},form_id:{N:'2'},name:{S:'基本聯絡資料'},sort:{N:'1'}},{id:{N:'4'},form_id:{N:'2'},name:{S:'商品需求'},sort:{N:'2'}},
    {id:{N:'5'},form_id:{N:'3'},name:{S:'基本聯絡資料'},sort:{N:'1'}},{id:{N:'6'},form_id:{N:'3'},name:{S:'服務需求詳情'},sort:{N:'2'}},
  ]);
  await putItems('pms_form_topic', [
    {id:{N:'1'},form_id:{N:'1'},form_group_id:{N:'1'},type:{S:'8'},title:{S:'聯絡資訊'},is_required:{S:'1'},sort:{N:'1'}},
    {id:{N:'2'},form_id:{N:'1'},form_group_id:{N:'1'},type:{S:'5'},title:{S:'用餐地區'},is_required:{S:'1'},sort:{N:'2'}},
    {id:{N:'3'},form_id:{N:'1'},form_group_id:{N:'2'},type:{S:'9'},title:{S:'希望訂位日期時間'},is_required:{S:'1'},sort:{N:'1'}},
    {id:{N:'4'},form_id:{N:'1'},form_group_id:{N:'2'},type:{S:'1'},title:{S:'用餐人數'},is_required:{S:'1'},sort:{N:'2'},is_number_only:{S:'1'}},
    {id:{N:'5'},form_id:{N:'1'},form_group_id:{N:'2'},type:{S:'3'},title:{S:'餐廳類型偏好'},is_required:{S:'0'},sort:{N:'3'}},
    {id:{N:'6'},form_id:{N:'2'},form_group_id:{N:'3'},type:{S:'8'},title:{S:'聯絡資訊'},is_required:{S:'1'},sort:{N:'1'}},
    {id:{N:'7'},form_id:{N:'2'},form_group_id:{N:'4'},type:{S:'2'},title:{S:'想購買的商品描述'},is_required:{S:'1'},sort:{N:'1'}},
    {id:{N:'8'},form_id:{N:'2'},form_group_id:{N:'4'},type:{S:'4'},title:{S:'商品類別'},is_required:{S:'0'},sort:{N:'2'}},
    {id:{N:'9'},form_id:{N:'2'},form_group_id:{N:'4'},type:{S:'1'},title:{S:'預算上限(元)'},is_required:{S:'0'},sort:{N:'3'},is_number_only:{S:'1'}},
    {id:{N:'10'},form_id:{N:'3'},form_group_id:{N:'5'},type:{S:'10'},title:{S:'聯絡資訊'},is_required:{S:'1'},sort:{N:'1'}},
    {id:{N:'11'},form_id:{N:'3'},form_group_id:{N:'5'},type:{S:'5'},title:{S:'服務地區'},is_required:{S:'1'},sort:{N:'2'}},
    {id:{N:'12'},form_id:{N:'3'},form_group_id:{N:'6'},type:{S:'3'},title:{S:'需求類型'},is_required:{S:'1'},sort:{N:'1'}},
    {id:{N:'13'},form_id:{N:'3'},form_group_id:{N:'6'},type:{S:'7'},title:{S:'需求詳細說明'},is_required:{S:'0'},sort:{N:'2'}},
    {id:{N:'14'},form_id:{N:'3'},form_group_id:{N:'6'},type:{S:'9'},title:{S:'希望服務時間'},is_required:{S:'0'},sort:{N:'3'}},
  ]);
  await putItems('pms_topic_option', [
    {id:{N:'1'},form_id:{N:'1'},topic_id:{N:'5'},option_name:{S:'中式'},sort:{N:'1'}},
    {id:{N:'2'},form_id:{N:'1'},topic_id:{N:'5'},option_name:{S:'日式'},sort:{N:'2'}},
    {id:{N:'3'},form_id:{N:'1'},topic_id:{N:'5'},option_name:{S:'西式'},sort:{N:'3'}},
    {id:{N:'4'},form_id:{N:'2'},topic_id:{N:'8'},option_name:{S:'生鮮食品'},sort:{N:'1'}},
    {id:{N:'5'},form_id:{N:'2'},topic_id:{N:'8'},option_name:{S:'日用品'},sort:{N:'2'}},
    {id:{N:'6'},form_id:{N:'2'},topic_id:{N:'8'},option_name:{S:'3C家電'},sort:{N:'3'}},
    {id:{N:'7'},form_id:{N:'2'},topic_id:{N:'8'},option_name:{S:'服飾'},sort:{N:'4'}},
    {id:{N:'8'},form_id:{N:'3'},topic_id:{N:'12'},option_name:{S:'家事清潔'},sort:{N:'1'}},
    {id:{N:'9'},form_id:{N:'3'},topic_id:{N:'12'},option_name:{S:'水電修繕'},sort:{N:'2'}},
    {id:{N:'10'},form_id:{N:'3'},topic_id:{N:'12'},option_name:{S:'長者陪伴'},sort:{N:'3'}},
    {id:{N:'11'},form_id:{N:'3'},topic_id:{N:'12'},option_name:{S:'其他'},sort:{N:'4'}},
  ]);
  await putItems('pms_vendor_service_type', [
    {vendor_id:{N:'1'},service_type:{S:'01'}},{vendor_id:{N:'2'},service_type:{S:'02'}},
    {vendor_id:{N:'3'},service_type:{S:'03'}},{vendor_id:{N:'4'},service_type:{S:'04'}},
    {vendor_id:{N:'5'},service_type:{S:'03'}},{vendor_id:{N:'5'},service_type:{S:'05'}},
    {vendor_id:{N:'6'},service_type:{S:'06'}},{vendor_id:{N:'7'},service_type:{S:'07'}},
    {vendor_id:{N:'8'},service_type:{S:'08'}},
  ]);
}


async function step3_supplementData() {
  console.log('\n【3】補充既有表缺少的資料\n');
  await putItems('mms_order_record', [
    {record_id:{S:'ORD007'},order_no:{S:'ORD20260706007'},service_vendor_id:{S:'V007'},service_id:{N:'105'},inbr_account_id:{S:'MBR002'},order_type:{S:'04'},order_status:{S:'80'},final_amount:{N:'350'},order_items:{L:[{M:{name:{S:'血壓藥'},qty:{N:'1'},price:{N:'350'}}}]},cre_time:{S:'2026-07-06T11:00:00+08:00'}},
    {record_id:{S:'ORD008'},order_no:{S:'ORD20260707008'},service_vendor_id:{S:'V008'},service_id:{N:'106'},inbr_account_id:{S:'MBR004'},order_type:{S:'04'},order_status:{S:'80'},final_amount:{N:'280'},order_items:{L:[{M:{name:{S:'社區接送'},qty:{N:'1'},price:{N:'280'}}}]},cre_time:{S:'2026-07-07T20:00:00+08:00'}},
  ]);
  await putItems('pms_form_feedback', [
    {feedback_no:{S:'FB20260705002'},service_id:{N:'9'},form_id:{N:'1'},platform_code:{S:'01'},inbr_account_id:{S:'MBR002'},contact_name:{S:'李小蓉'},contact_mobile:{S:'0912-345-002'},status:{S:'01'},is_read:{S:'1'},description:{S:'日式午餐訂位2人'},feedback_content:{M:{date:{S:'2026-07-11'},pax:{S:'2'}}},cre_time:{S:'2026-07-06T09:10:00+08:00'},upd_time:{S:'2026-07-06T09:10:00+08:00'}},
    {feedback_no:{S:'FB20260707004'},service_id:{N:'11'},form_id:{N:'2'},platform_code:{S:'01'},inbr_account_id:{S:'MBR004'},contact_name:{S:'黃志豪'},contact_mobile:{S:'0945-678-004'},status:{S:'01'},is_read:{S:'0'},description:{S:'想買生鮮蔬果箱'},feedback_content:{M:{item:{S:'生鮮蔬果箱'},budget:{S:'1500'}}},cre_time:{S:'2026-07-07T10:30:00+08:00'},upd_time:{S:'2026-07-07T10:30:00+08:00'}},
    {feedback_no:{S:'FB20260708008'},service_id:{N:'11'},form_id:{N:'2'},platform_code:{S:'01'},inbr_account_id:{S:'MBR005'},contact_name:{S:'鄭同學'},contact_mobile:{S:'0912-345-008'},status:{S:'01'},is_read:{S:'0'},description:{S:'想買換季衣物'},feedback_content:{M:{item:{S:'換季衣物'},budget:{S:'2000'}}},cre_time:{S:'2026-07-08T11:15:00+08:00'},upd_time:{S:'2026-07-08T11:15:00+08:00'}},
  ]);
  await putItems('pms_case_reply', [
    {reply_id:{S:'RPL006'},feedback_no:{S:'FB20260801002'},vendor_id:{S:'V004'},reply_type:{S:'04'},content:{S:'客戶來電表示臨時有事取消訂位'},cre_time:{S:'2026-08-08T09:10:00+08:00'},cre_id:{S:'VA004'}},
  ]);
  await putItems('pms_case_status_log', [
    {log_id:{S:'LOG007'},feedback_no:{S:'FB20260801001'},old_status:{S:'02'},new_status:{S:'03'},changed_by:{S:'VA005'},remark:{S:'師傅已到場'},cre_time:{S:'2026-08-01T14:00:00+08:00'}},
    {log_id:{S:'LOG008'},feedback_no:{S:'FB20260801001'},old_status:{S:'03'},new_status:{S:'04'},changed_by:{S:'VA005'},remark:{S:'修繕完成'},cre_time:{S:'2026-08-01T16:00:00+08:00'}},
    {log_id:{S:'LOG009'},feedback_no:{S:'FB20260705002'},old_status:{S:'00'},new_status:{S:'01'},changed_by:{S:'SYSTEM'},remark:{S:'新諮詢單'},cre_time:{S:'2026-07-06T09:10:00+08:00'}},
    {log_id:{S:'LOG010'},feedback_no:{S:'FB20260801004'},old_status:{S:'00'},new_status:{S:'01'},changed_by:{S:'SYSTEM'},remark:{S:'新諮詢單'},cre_time:{S:'2026-08-01T10:30:00+08:00'}},
    {log_id:{S:'LOG011'},feedback_no:{S:'FB20260801004'},old_status:{S:'01'},new_status:{S:'02'},changed_by:{S:'SYSTEM'},remark:{S:'AI媒合'},cre_time:{S:'2026-08-01T10:31:00+08:00'}},
    {log_id:{S:'LOG012'},feedback_no:{S:'FB20260707004'},old_status:{S:'00'},new_status:{S:'01'},changed_by:{S:'SYSTEM'},remark:{S:'新諮詢單'},cre_time:{S:'2026-07-07T10:30:00+08:00'}},
    {log_id:{S:'LOG013'},feedback_no:{S:'FB20260708008'},old_status:{S:'00'},new_status:{S:'01'},changed_by:{S:'SYSTEM'},remark:{S:'新諮詢單'},cre_time:{S:'2026-07-08T11:15:00+08:00'}},
    {log_id:{S:'LOG014'},feedback_no:{S:'FB20260731003'},old_status:{S:'03'},new_status:{S:'04'},changed_by:{S:'VA001'},remark:{S:'清潔驗收'},cre_time:{S:'2026-08-01T13:30:00+08:00'}},
    {log_id:{S:'LOG015'},feedback_no:{S:'FB20260731005'},old_status:{S:'03'},new_status:{S:'04'},changed_by:{S:'VA002'},remark:{S:'清洗驗收'},cre_time:{S:'2026-08-02T16:30:00+08:00'}},
    {log_id:{S:'LOG016'},feedback_no:{S:'FB20260801002'},old_status:{S:'00'},new_status:{S:'01'},changed_by:{S:'SYSTEM'},remark:{S:'新諮詢單'},cre_time:{S:'2026-08-01T09:45:00+08:00'}},
    {log_id:{S:'LOG017'},feedback_no:{S:'FB20260801002'},old_status:{S:'01'},new_status:{S:'02'},changed_by:{S:'SYSTEM'},remark:{S:'AI媒合'},cre_time:{S:'2026-08-01T09:46:00+08:00'}},
    {log_id:{S:'LOG018'},feedback_no:{S:'FB20260801002'},old_status:{S:'02'},new_status:{S:'05'},changed_by:{S:'VA004'},remark:{S:'客戶取消'},cre_time:{S:'2026-08-08T09:10:00+08:00'}},
  ]);
}

async function main() {
  console.log('════════════════════════════════════');
  console.log('  MySQL → DynamoDB 同步腳本');
  console.log('  Region: us-west-2');
  console.log('════════════════════════════════════');
  await step1_createTables();
  await step2_seedNewTables();
  await step3_supplementData();
  console.log('\n════════════════════════════════════');
  console.log('  ✓ 同步完成！');
  console.log('════════════════════════════════════\n');
}
main().catch(e => { console.error('\n✗ 失敗:', e.message); process.exit(1); });
