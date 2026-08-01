/**
 * AES-256-GCM 加解密工具模組
 * 用於個資欄位的加密儲存與解密顯示
 * 
 * 使用 Web Crypto API，相容所有現代瀏覽器
 */
const Crypto = {
  // Demo 用固定金鑰（32 bytes = 256 bits，Base64 編碼）
  // 實際上線應改從環境變數或後端取得
  KEY_BASE64: 'dGhpc0lzQURlbW9LZXlGb3JIYWNrYXRob24yMDI2ISE=',

  _keyCache: null,

  /**
   * 取得 CryptoKey 物件（快取）
   */
  async getKey() {
    if (this._keyCache) return this._keyCache;

    const keyBytes = this._base64ToBytes(this.KEY_BASE64);
    this._keyCache = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
    return this._keyCache;
  },

  /**
   * 加密字串
   * @param {string} plaintext - 明文
   * @returns {string} 密文（格式：base64(iv):base64(ciphertext)）
   */
  async encrypt(plaintext) {
    if (!plaintext) return null;

    const key = await this.getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
    const encoded = new TextEncoder().encode(plaintext);

    const cipherBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const ivBase64 = this._bytesToBase64(iv);
    const cipherBase64 = this._bytesToBase64(new Uint8Array(cipherBuffer));

    return `${ivBase64}:${cipherBase64}`;
  },

  /**
   * 解密字串
   * @param {string} ciphertext - 密文（格式：base64(iv):base64(ciphertext)）
   * @returns {string|null} 明文，解密失敗回傳 null
   */
  async decrypt(ciphertext) {
    if (!ciphertext) return null;

    try {
      const [ivBase64, dataBase64] = ciphertext.split(':');
      if (!ivBase64 || !dataBase64) return null;

      const key = await this.getKey();
      const iv = this._base64ToBytes(ivBase64);
      const data = this._base64ToBytes(dataBase64);

      const plainBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      return new TextDecoder().decode(plainBuffer);
    } catch (e) {
      console.error('Decrypt error:', e);
      return null;
    }
  },

  /**
   * 產生 SHA-256 hash（用於比對搜尋，不需解密即可確認身份）
   * @param {string} plaintext - 明文
   * @returns {string} hex hash
   */
  async hash(plaintext) {
    if (!plaintext) return null;

    const encoded = new TextEncoder().encode(plaintext);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * 批次解密物件中的指定欄位
   * @param {object} obj - 含密文欄位的物件
   * @param {string[]} fields - 需要解密的欄位名稱陣列
   * @returns {object} 解密後的新物件（不改動原物件）
   */
  async decryptFields(obj, fields) {
    const result = { ...obj };
    for (const field of fields) {
      if (result[field]) {
        result[field] = await this.decrypt(result[field]);
      }
    }
    return result;
  },

  /**
   * 批次加密物件中的指定欄位（產生密文 + hash）
   * @param {object} obj - 含明文欄位的物件
   * @param {string[]} fields - 需要加密的欄位名稱陣列
   * @returns {object} 加密後的新物件，每個 field 變成 field（密文）+ field_hash
   */
  async encryptFields(obj, fields) {
    const result = { ...obj };
    for (const field of fields) {
      if (result[field]) {
        const plaintext = result[field];
        result[field] = await this.encrypt(plaintext);
        result[`${field}_hash`] = await this.hash(plaintext);
      }
    }
    return result;
  },

  // ===== 工具函式 =====

  _base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  },

  _bytesToBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },
};
