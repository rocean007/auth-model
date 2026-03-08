import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-cbc';

// In production, encryption key is required. In dev, use a default (NOT SECURE)
let key;
if (!ENCRYPTION_KEY) {
  console.warn('⚠️  ENCRYPTION_KEY not set. Using insecure dev key. Set ENCRYPTION_KEY in production!');
  key = crypto
    .createHash('sha256')
    .update('dev-key-change-in-production')
    .digest();
} else {
  key = crypto
    .createHash('sha256')
    .update(ENCRYPTION_KEY)
    .digest();
}

/**
 * Encrypt sensitive data (API keys, tokens, etc.)
 * @param {string} text - plaintext to encrypt
 * @returns {string} encrypted text with IV prepended
 */
export function encrypt(text) {
  if (!text) return null;
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Prepend IV to encrypted text (IV doesn't need to be secret)
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedText - encrypted text with IV prepended
 * @returns {string} plaintext
 */
export function decrypt(encryptedText) {
  if (!encryptedText) return null;
  
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !encrypted) {
      console.error('Invalid encrypted format');
      return null;
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err.message);
    return null;
  }
}
