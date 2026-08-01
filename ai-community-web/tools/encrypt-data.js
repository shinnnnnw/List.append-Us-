/**
 * 工具腳本：產生 data.js 中個資欄位的 AES-256-GCM 密文
 * 使用方式：node tools/encrypt-data.js
 * 
 * 產生的密文格式與前端 crypto.js 一致：base64(iv):base64(ciphertext)
 */
const crypto = require('crypto');

// 與前端 crypto.js 相同的 key（Base64 → 32 bytes）
const KEY_BASE64 = 'dGhpc0lzQURlbW9LZXlGb3JIYWNrYXRob24yMDI2ISE=';
const KEY = Buffer.from(KEY_BASE64, 'base64');

function encrypt(plaintext) {
  if (!plaintext) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // 把 ciphertext + authTag 合在一起（Web Crypto API 的 AES-GCM 也是這樣）
  const combined = Buffer.concat([encrypted, authTag]);
  return `${iv.toString('base64')}:${combined.toString('base64')}`;
}

function hash(plaintext) {
  if (!plaintext) return null;
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

// 要加密的個資資料
const personalData = [
  // FEEDBACKS 的個資
  { id: 'FB2607050001', name: '王小明', phone: '0912345001', email: null, address: '大安路一段100號' },
  { id: 'FB2607050002', name: '李小蘇', phone: '0912345002', email: null, address: null },
  { id: 'FB2607060003', name: '張美玲', phone: '0912345003', email: 'chang03@example.com', address: null },
  { id: 'FB2607060004', name: '陳建宏', phone: '0912345004', email: null, address: null },
  { id: 'FB2607070005', name: '劉阿姨', phone: '0912345005', email: null, address: '西屯路二段50號' },
  { id: 'FB2607070006', name: '許先生', phone: '0912345006', email: 'hsu06@example.com', address: null },
  { id: 'FB2607080007', name: '蔡小姐', phone: '0912345007', email: null, address: null },
  { id: 'FB2607080008', name: '鄭同學', phone: '0912345008', email: null, address: null },
  // USERS
  { id: 'USER_MBR001', name: '王小明', phone: '0912-345-001', email: 'wang01@example.com', address: null },
  { id: 'USER_MBR002', name: '陳美玲', phone: '0923-456-002', email: 'chen02@example.com', address: null },
  { id: 'USER_MBR003', name: '林大偉', phone: '0934-567-003', email: 'lin03@example.com', address: null },
];

console.log('// === 加密結果 ===\n');

personalData.forEach(item => {
  console.log(`// ${item.id}`);
  if (item.name) {
    console.log(`  name: '${encrypt(item.name)}',`);
    console.log(`  name_hash: '${hash(item.name)}',`);
  }
  if (item.phone) {
    console.log(`  phone: '${encrypt(item.phone)}',`);
    console.log(`  phone_hash: '${hash(item.phone)}',`);
  }
  if (item.email) {
    console.log(`  email: '${encrypt(item.email)}',`);
    console.log(`  email_hash: '${hash(item.email)}',`);
  }
  if (item.address) {
    console.log(`  address: '${encrypt(item.address)}',`);
    console.log(`  address_hash: '${hash(item.address)}',`);
  }
  console.log('');
});
