/**
 * seed-vendor-accounts.js
 * 為 pms_vendor_account 補上測試用的 account_no 和 password_hash
 * 使用方式: node seed-vendor-accounts.js (在 AWS CloudShell 執行)
 */
const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({ region: 'us-west-2' });

const ACCOUNTS = [
  { account_id: 1, vendor_id: 1, account_no: 'clean01', password_hash: 'demo1234', account_name: '清潔管理員' },
  { account_id: 2, vendor_id: 2, account_no: 'appliance01', password_hash: 'demo1234', account_name: '家電客服' },
  { account_id: 3, vendor_id: 3, account_no: 'delivery01', password_hash: 'demo1234', account_name: '寄件專員' },
  { account_id: 4, vendor_id: 4, account_no: 'restaurant01', password_hash: 'demo1234', account_name: '餐廳管理員' },
  { account_id: 5, vendor_id: 5, account_no: 'repair01', password_hash: 'demo1234', account_name: '水電師傅' },
  { account_id: 6, vendor_id: 6, account_no: 'shop01', password_hash: 'demo1234', account_name: '商城客服' },
  { account_id: 7, vendor_id: 7, account_no: 'pharmacy01', password_hash: 'demo1234', account_name: '藥局管理員' },
  { account_id: 8, vendor_id: 8, account_no: 'taxi01', password_hash: 'demo1234', account_name: '叫車調度' },
];

async function main() {
  console.log('=== 寫入廠商測試帳號 ===\n');

  for (const acc of ACCOUNTS) {
    await client.send(new UpdateItemCommand({
      TableName: 'pms_vendor_account',
      Key: marshall({ account_id: acc.account_id }),
      UpdateExpression: 'SET account_no = :ano, password_hash = :pw, account_name = :name, vendor_id = :vid',
      ExpressionAttributeValues: marshall({
        ':ano': acc.account_no,
        ':pw': acc.password_hash,
        ':name': acc.account_name,
        ':vid': acc.vendor_id,
      }),
    }));
    console.log(`  ✓ account_id=${acc.account_id} → ${acc.account_no} / ${acc.password_hash}`);
  }

  console.log('\n✓ 全部完成！共 8 筆');
}

main().catch(e => { console.error('✗', e.message); process.exit(1); });
