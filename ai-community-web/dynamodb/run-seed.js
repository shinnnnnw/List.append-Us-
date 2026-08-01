/**
 * run-seed.js
 * 更新所有廠商資料（含詳細聯絡資訊）到 DynamoDB
 */
const fs = require('fs');
const path = require('path');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

// 讀取 .env
const envPath = path.resolve(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx > 0) {
    const key = trimmed.substring(0, eqIdx).trim();
    let val = trimmed.substring(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
  }
});

process.env.AWS_ACCESS_KEY_ID = envVars.AWS_ACCESS_KEY_ID || '';
process.env.AWS_SECRET_ACCESS_KEY = envVars.AWS_SECRET_ACCESS_KEY || '';
process.env.AWS_SESSION_TOKEN = envVars.AWS_SESSION_TOKEN || '';
const region = envVars.AWS_REGION || 'us-west-2';

const TABLE = 'cms_service_vendor';
const client = new DynamoDBClient({ region });

const VENDORS = [
  // 非餐廳服務
  { vendor_id:{N:'1'}, name:{S:'潔淨居家清潔'}, service_type:{N:'1'}, description:{S:'專業居家清潔服務，含一般清潔與深度清潔'}, rating_avg:{N:'4.8'}, rating_count:{N:'126'}, contact_name:{S:'李經理'}, contact_phone:{S:'02-2700-1001'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'}}},{M:{county_name:{S:'新北市'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'2'}, name:{S:'全能家電清洗'}, service_type:{N:'2'}, description:{S:'冷氣、洗衣機、冰箱等家電深層清洗'}, rating_avg:{N:'4.6'}, rating_count:{N:'89'}, contact_name:{S:'張師傅'}, contact_phone:{S:'02-2700-1002'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'桃園市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'}}},{M:{county_name:{S:'新北市'}}},{M:{county_name:{S:'桃園市'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'3'}, name:{S:'快速寄件服務'}, service_type:{N:'3'}, description:{S:'到府收件，全台配送，當日到府'}, rating_avg:{N:'4.5'}, rating_count:{N:'203'}, contact_name:{S:'陳專員'}, contact_phone:{S:'0800-123-456'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'台中市'},{S:'高雄市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'}}},{M:{county_name:{S:'新北市'}}},{M:{county_name:{S:'台中市'}}},{M:{county_name:{S:'高雄市'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'5'}, name:{S:'水電王修繕'}, service_type:{N:'10'}, description:{S:'水管、電路、冷氣安裝等修繕服務，24小時緊急到府'}, rating_avg:{N:'4.9'}, rating_count:{N:'178'}, contact_name:{S:'王師傅'}, contact_phone:{S:'02-2700-1005'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'}}},{M:{county_name:{S:'新北市'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'6'}, name:{S:'統一購物商城'}, service_type:{N:'11'}, description:{S:'生活用品、食品、家電線上購物，全台宅配'}, rating_avg:{N:'4.4'}, rating_count:{N:'521'}, contact_name:{S:'客服中心'}, contact_phone:{S:'0800-008-100'}, service_counties:{L:[{S:'全台'}]}, service_areas:{L:[{M:{county_name:{S:'全台配送'}}}]}, is_enable:{S:'1'} },
  // 中式餐廳
  { vendor_id:{N:'4'}, name:{S:'饗宴樓'}, service_type:{N:'6'}, description:{S:'精緻中式料理，提供包廂訂位，適合家庭聚餐與商務宴請'}, rating_avg:{N:'4.7'}, rating_count:{N:'312'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2771-0001'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'信義區'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'10'}, name:{S:'金鼎軒'}, service_type:{N:'6'}, description:{S:'招牌手工小籠包，經典台灣中式餐廳，排隊名店'}, rating_avg:{N:'4.9'}, rating_count:{N:'856'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2321-0010'}, service_counties:{L:[{S:'台北市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'信義區'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'13'}, name:{S:'滴水坊'}, service_type:{N:'6'}, description:{S:'精緻江浙菜與港式點心，適合商務宴客，低調奢華'}, rating_avg:{N:'4.7'}, rating_count:{N:'245'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2395-0013'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'中正區'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'14'}, name:{S:'豐葉台菜館'}, service_type:{N:'6'}, description:{S:'傳統台灣料理，古早味辦桌菜，適合大桌聚餐'}, rating_avg:{N:'4.6'}, rating_count:{N:'378'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2596-0014'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'桃園市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'中山區'}}},{M:{county_name:{S:'新北市'}}}]}, is_enable:{S:'1'} },
  // 日式餐廳
  { vendor_id:{N:'7'}, name:{S:'和風亭'}, service_type:{N:'6'}, description:{S:'正宗日式定食、壽司、刺身，午間套餐優惠，環境雅緻'}, rating_avg:{N:'4.6'}, rating_count:{N:'198'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2751-0007'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'大安區'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'15'}, name:{S:'迴鮮壽司'}, service_type:{N:'6'}, description:{S:'迴轉壽司，平價新鮮，趣味扭蛋抽獎活動'}, rating_avg:{N:'4.4'}, rating_count:{N:'512'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2371-0015'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'桃園市'},{S:'台中市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'中正區'}}},{M:{county_name:{S:'新北市'}}},{M:{county_name:{S:'桃園市'}}},{M:{county_name:{S:'台中市'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'16'}, name:{S:'豚骨拉麵本舖'}, service_type:{N:'6'}, description:{S:'濃郁博多豚骨拉麵，個人座位專注享用'}, rating_avg:{N:'4.5'}, rating_count:{N:'723'}, contact_name:{S:'現場候位'}, contact_phone:{S:'02-2311-0016'}, service_counties:{L:[{S:'台北市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'信義區'}}}]}, is_enable:{S:'1'} },
  // 西式 / 義式
  { vendor_id:{N:'8'}, name:{S:'La Cucina 義式廚房'}, service_type:{N:'6'}, description:{S:'手工義大利麵、窯烤披薩，浪漫約會首選'}, rating_avg:{N:'4.8'}, rating_count:{N:'267'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2700-0008'}, service_counties:{L:[{S:'台北市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'大安區'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'17'}, name:{S:'紳士牛排館'}, service_type:{N:'6'}, description:{S:'頂級乾式熟成牛排，高級商務聚餐首選'}, rating_avg:{N:'4.7'}, rating_count:{N:'189'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2720-0017'}, service_counties:{L:[{S:'台北市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'信義區'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'18'}, name:{S:'美好時光義式餐廳'}, service_type:{N:'6'}, description:{S:'義式燉飯、手作甜點，家庭聚餐友善，兒童遊戲區'}, rating_avg:{N:'4.5'}, rating_count:{N:'134'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2680-0018'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'松山區'}}},{M:{county_name:{S:'新北市'}}}]}, is_enable:{S:'1'} },
  // 韓式
  { vendor_id:{N:'9'}, name:{S:'首爾烤肉屋'}, service_type:{N:'6'}, description:{S:'正宗韓式烤肉、部隊鍋，提供包廂歡唱'}, rating_avg:{N:'4.5'}, rating_count:{N:'142'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2731-0009'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'桃園市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'大安區'}}},{M:{county_name:{S:'新北市'}}},{M:{county_name:{S:'桃園市'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'19'}, name:{S:'海鷗韓食堂'}, service_type:{N:'6'}, description:{S:'道地韓國料理，辣炒年糕、起司排骨、韓式炸雞'}, rating_avg:{N:'4.6'}, rating_count:{N:'287'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2771-0019'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'中山區'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'20'}, name:{S:'楓樹韓式燒肉'}, service_type:{N:'6'}, description:{S:'精品韓式烤肉，厚切牛五花，高級用餐體驗'}, rating_avg:{N:'4.8'}, rating_count:{N:'156'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2700-0020'}, service_counties:{L:[{S:'台北市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'信義區'}}}]}, is_enable:{S:'1'} },
  // 海鮮
  { vendor_id:{N:'11'}, name:{S:'漁人碼頭海鮮'}, service_type:{N:'6'}, description:{S:'新鮮現撈海鮮，蒸煮烤炸多種料理，適合大桌聚餐'}, rating_avg:{N:'4.4'}, rating_count:{N:'95'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2501-0011'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'中山區'}}},{M:{county_name:{S:'新北市'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'21'}, name:{S:'鮮引水產直營店'}, service_type:{N:'6'}, description:{S:'立吞海鮮市場，現選現做，新鮮直送'}, rating_avg:{N:'4.6'}, rating_count:{N:'432'}, contact_name:{S:'現場候位'}, contact_phone:{S:'02-2508-0021'}, service_counties:{L:[{S:'台北市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'中山區'}}}]}, is_enable:{S:'1'} },
  // 泰式
  { vendor_id:{N:'12'}, name:{S:'暹羅食堂'}, service_type:{N:'6'}, description:{S:'道地泰式料理，酸辣開胃，平價大份量'}, rating_avg:{N:'4.3'}, rating_count:{N:'178'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2731-0012'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'台中市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'大安區'}}},{M:{county_name:{S:'新北市'}}},{M:{county_name:{S:'台中市'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'22'}, name:{S:'曼谷花園泰菜'}, service_type:{N:'6'}, description:{S:'精緻泰式料理，環境優雅，適合聚餐約會'}, rating_avg:{N:'4.5'}, rating_count:{N:'203'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2711-0022'}, service_counties:{L:[{S:'台北市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'},district_name:{S:'大安區'}}}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'23'}, name:{S:'泰皇殿'}, service_type:{N:'6'}, description:{S:'泰式連鎖餐廳，口味穩定，多人合菜首選'}, rating_avg:{N:'4.4'}, rating_count:{N:'567'}, contact_name:{S:'訂位專線'}, contact_phone:{S:'02-2700-0023'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'桃園市'},{S:'台中市'},{S:'高雄市'}]}, service_areas:{L:[{M:{county_name:{S:'台北市'}}},{M:{county_name:{S:'新北市'}}},{M:{county_name:{S:'桃園市'}}},{M:{county_name:{S:'台中市'}}},{M:{county_name:{S:'高雄市'}}}]}, is_enable:{S:'1'} },
];

async function main() {
  console.log(`使用 region: ${region}`);
  console.log(`寫入 ${VENDORS.length} 筆廠商資料到 ${TABLE}...\n`);

  let success = 0;
  let fail = 0;

  for (const item of VENDORS) {
    try {
      await client.send(new PutItemCommand({ TableName: TABLE, Item: item }));
      console.log(`  ✓ ${item.vendor_id.N} ${item.name.S}`);
      success++;
    } catch (err) {
      console.error(`  ✗ ${item.vendor_id.N} ${item.name.S} — ${err.message}`);
      fail++;
    }
  }

  console.log(`\n完成！成功 ${success} 筆，失敗 ${fail} 筆`);
}

main();
