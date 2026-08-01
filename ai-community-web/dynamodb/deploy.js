// updated
/**
 * deploy.js
 * DynamoDB 部署腳本 - 建立資料表並植入範例資料
 * 
 * 使用方式: node deploy.js
 * 前提: 已設定 AWS credentials，Region: us-west-2
 */

const { DynamoDBClient, CreateTableCommand, BatchWriteItemCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { TABLE_DEFINITIONS } = require('./table-definitions');
const { SEED_DATA } = require('./seed-data');

const REGION = 'us-west-2';
const client = new DynamoDBClient({ region: REGION });

/**
 * 將陣列分割為指定大小的批次
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 等待資料表進入 ACTIVE 狀態
 */
async function waitForTableActive(tableName, maxRetries = 30, delayMs = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await client.send(new DescribeTableCommand({ TableName: tableName }));
    if (response.Table.TableStatus === 'ACTIVE') {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  throw new Error(`資料表 ${tableName} 在 ${maxRetries * delayMs / 1000} 秒內未進入 ACTIVE 狀態`);
}

/**
 * 建立所有資料表
 */
async function createAllTables() {
  for (const tableDef of TABLE_DEFINITIONS) {
    try {
      await client.send(new CreateTableCommand(tableDef));
      console.log(`✓ 建立資料表: ${tableDef.TableName}`);
      await waitForTableActive(tableDef.TableName);
      console.log(`  → ${tableDef.TableName} 已就緒 (ACTIVE)`);
    } catch (error) {
      if (error.name === 'ResourceInUseException') {
        console.log(`⊘ 資料表已存在，跳過: ${tableDef.TableName}`);
      } else {
        throw error;
      }
    }
  }
}

/**
 * 植入所有範例資料
 */
async function seedAllTables() {
  for (const [tableName, items] of Object.entries(SEED_DATA)) {
    const batches = chunkArray(items, 25);
    
    for (const batch of batches) {
      const params = {
        RequestItems: {
          [tableName]: batch.map(item => ({ PutRequest: { Item: item } }))
        }
      };

      let retries = 0;
      let unprocessed = params;

      while (retries < 3) {
        const result = await client.send(new BatchWriteItemCommand(unprocessed));
        
        if (result.UnprocessedItems && Object.keys(result.UnprocessedItems).length > 0) {
          retries++;
          unprocessed = { RequestItems: result.UnprocessedItems };
          const delay = Math.pow(2, retries) * 100;
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }
    
    console.log(`✓ 植入 ${items.length} 筆資料: ${tableName}`);
  }
}

/**
 * 主程式
 */
async function main() {
  try {
    console.log(`=== 開始部署 DynamoDB 資料表 (Region: ${REGION}) ===`);
    console.log('');
    
    await createAllTables();
    
    console.log('');
    console.log('=== 開始植入範例資料 ===');
    console.log('');
    
    await seedAllTables();
    
    console.log('');
    console.log('✓ 部署完成！所有資料表與範例資料已就緒。');
  } catch (error) {
    console.error('✗ 部署失敗:', error.message);
    process.exit(1);
  }
}

main();
