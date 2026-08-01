/**
 * run-seed.js
 * 讀取專案 .env 設定 AWS credentials，然後寫入餐廳資料到 DynamoDB
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

// 設定 env
process.env.AWS_ACCESS_KEY_ID = envVars.AWS_ACCESS_KEY_ID || '';
process.env.AWS_SECRET_ACCESS_KEY = envVars.AWS_SECRET_ACCESS_KEY || '';
process.env.AWS_SESSION_TOKEN = envVars.AWS_SESSION_TOKEN || '';
const region = envVars.AWS_REGION || 'us-west-2';

const TABLE = 'cms_service_vendor';
const client = new DynamoDBClient({ region });

// vendor_id 用 Number 型別（雲端 DynamoDB 表 PK 為 N）
const RESTAURANTS = [
  // 中式
  { vendor_id:{N:'4'}, name:{S:'饗食天堂'}, service_type:{N:'6'}, description:{S:'精緻中式料理，提供包廂訂位，適合家庭聚餐'}, rating_avg:{N:'4.7'}, rating_count:{N:'312'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'10'}, name:{S:'鼎泰豐信義店'}, service_type:{N:'6'}, description:{S:'世界知名小籠包，經典台灣中式餐廳'}, rating_avg:{N:'4.9'}, rating_count:{N:'856'}, service_counties:{L:[{S:'台北市'}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'13'}, name:{S:'點水樓'}, service_type:{N:'6'}, description:{S:'精緻江浙菜與港式點心，適合商務宴客'}, rating_avg:{N:'4.7'}, rating_count:{N:'245'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'14'}, name:{S:'欣葉台菜'}, service_type:{N:'6'}, description:{S:'傳統台灣料理，古早味辦桌菜，適合大桌聚餐'}, rating_avg:{N:'4.6'}, rating_count:{N:'378'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'桃園市'}]}, is_enable:{S:'1'} },
  // 日式
  { vendor_id:{N:'7'}, name:{S:'和風亭日式料理'}, service_type:{N:'6'}, description:{S:'正宗日式定食、壽司、刺身，午間套餐優惠'}, rating_avg:{N:'4.6'}, rating_count:{N:'198'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'15'}, name:{S:'藏壽司台北站前店'}, service_type:{N:'6'}, description:{S:'迴轉壽司，平價新鮮，扭蛋抽獎樂趣多'}, rating_avg:{N:'4.4'}, rating_count:{N:'512'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'桃園市'},{S:'台中市'}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'16'}, name:{S:'一蘭拉麵台灣本店'}, service_type:{N:'6'}, description:{S:'博多豚骨拉麵，個人座位專注享用'}, rating_avg:{N:'4.5'}, rating_count:{N:'723'}, service_counties:{L:[{S:'台北市'}]}, is_enable:{S:'1'} },
  // 西式 / 義式
  { vendor_id:{N:'8'}, name:{S:'La Pasta 義式餐廳'}, service_type:{N:'6'}, description:{S:'手工義大利麵、窯烤披薩，浪漫約會首選'}, rating_avg:{N:'4.8'}, rating_count:{N:'267'}, service_counties:{L:[{S:'台北市'}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'17'}, name:{S:'Smith & Wollensky 牛排館'}, service_type:{N:'6'}, description:{S:'美式頂級牛排，乾式熟成28天，微風信義'}, rating_avg:{N:'4.7'}, rating_count:{N:'189'}, service_counties:{L:[{S:'台北市'}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'18'}, name:{S:'TUTTO BELLO 美好義式餐廳'}, service_type:{N:'6'}, description:{S:'義式燉飯、手作甜點，家庭聚餐友善'}, rating_avg:{N:'4.5'}, rating_count:{N:'134'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, is_enable:{S:'1'} },
  // 韓式
  { vendor_id:{N:'9'}, name:{S:'韓國歐巴烤肉'}, service_type:{N:'6'}, description:{S:'正宗韓式烤肉、部隊鍋，提供包廂歡唱'}, rating_avg:{N:'4.5'}, rating_count:{N:'142'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'桃園市'}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'19'}, name:{S:'新麻蒲海鷗韓式料理'}, service_type:{N:'6'}, description:{S:'韓國人開的道地韓食，辣炒年糕、起司排骨'}, rating_avg:{N:'4.6'}, rating_count:{N:'287'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'20'}, name:{S:'Maple Tree House 楓樹韓國烤肉'}, service_type:{N:'6'}, description:{S:'首爾米其林一星韓式烤肉，厚切牛五花'}, rating_avg:{N:'4.8'}, rating_count:{N:'156'}, service_counties:{L:[{S:'台北市'}]}, is_enable:{S:'1'} },
  // 海鮮
  { vendor_id:{N:'11'}, name:{S:'漁港海鮮餐廳'}, service_type:{N:'6'}, description:{S:'新鮮現撈海鮮，蒸煮烤炸多種料理，適合大桌聚餐'}, rating_avg:{N:'4.4'}, rating_count:{N:'95'}, service_counties:{L:[{S:'台北市'},{S:'新北市'}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'21'}, name:{S:'上引水產'}, service_type:{N:'6'}, description:{S:'立吞海鮮市場，現選現做，新鮮直送'}, rating_avg:{N:'4.6'}, rating_count:{N:'432'}, service_counties:{L:[{S:'台北市'}]}, is_enable:{S:'1'} },
  // 泰式
  { vendor_id:{N:'12'}, name:{S:'泰味食堂'}, service_type:{N:'6'}, description:{S:'道地泰式料理，酸辣開胃，平價大份量'}, rating_avg:{N:'4.3'}, rating_count:{N:'178'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'台中市'}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'22'}, name:{S:'Nara Thai Cuisine'}, service_type:{N:'6'}, description:{S:'泰國曼谷連鎖，精緻泰式料理，環境優雅'}, rating_avg:{N:'4.5'}, rating_count:{N:'203'}, service_counties:{L:[{S:'台北市'}]}, is_enable:{S:'1'} },
  { vendor_id:{N:'23'}, name:{S:'瓦城泰統'}, service_type:{N:'6'}, description:{S:'台灣最大泰式餐飲集團，口味穩定，多人合菜'}, rating_avg:{N:'4.4'}, rating_count:{N:'567'}, service_counties:{L:[{S:'台北市'},{S:'新北市'},{S:'桃園市'},{S:'台中市'},{S:'高雄市'}]}, is_enable:{S:'1'} },
];

async function main() {
  console.log(`使用 region: ${region}`);
  console.log(`寫入 ${RESTAURANTS.length} 筆餐廳到 ${TABLE}...\n`);

  let success = 0;
  let fail = 0;

  for (const item of RESTAURANTS) {
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
