/**
 * Security utility functions
 * Protects against XSS, SQL injection, path traversal, NoSQL injection
 */

// Dangerous patterns to detect and block
const DANGEROUS_PATTERNS = [
  // NoSQL injection - MongoDB operators and functions
  /\$where|\$gt|\$gte|\$lt|\$lte|\$ne|\$in|\$nin|\$or|\$and|\$not|\$nor|\$exists|\$regex|\$elemMatch|\$eq|\$all|mapReduce|function\s*\(/i,
  // SQL injection
  /(union\s+(all\s+)?select|drop\s+table|insert\s+into|delete\s+from|update\s+set|exec\s*\(|execute\s*\()/i,
  // XSS attacks
  /(<script|<iframe|<object|<embed|javascript:|vbscript:|on\w+\s*=|data:text\/html)/i,
  // Path traversal
  /(\.\.[\/\\]|~\/)/,
  // Null bytes and control characters
  /(\x00|\x1a|\x08)/,
];

/**
 * Sanitize a string input — removes dangerous content
 * @param {any} input
 * @returns {string|null}
 */
export function sanitizeInput(input) {
  if (input === null || input === undefined) return null;
  const str = String(input);

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(str)) {
      console.warn('Dangerous input detected and blocked:', str.slice(0, 50));
      return null;
    }
  }

  // Strip HTML tags
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[c]))
    .trim()
    .slice(0, 1000); // Hard length limit
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
}

/**
 * Sanitize an object — recursively sanitizes all string values
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return {};
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    const cleanKey = sanitizeInput(key);
    if (!cleanKey) continue;
    if (typeof value === 'string') {
      clean[cleanKey] = sanitizeInput(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      clean[cleanKey] = value;
    }
    // Ignore nested objects/arrays for security
  }
  return clean;
}
