// Uses Upstash Redis — free 10k requests/day → upstash.com
// npm install @upstash/redis

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Simple sliding window rate limiter using Upstash Redis REST API
 * @param {string} key - unique key (e.g. "signup:1.2.3.4")
 * @param {number} limit - max requests
 * @param {number} windowSeconds - time window in seconds
 * @returns {boolean} true if rate limited, false if allowed
 */
export async function rateLimit(key, limit = 4, windowSeconds = 3600) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    // If Redis not configured, fail closed (block requests) - security first
    console.warn('Upstash Redis not configured — blocking requests for safety');
    return true;
  }

  try {
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    // Use Redis sorted set to track request timestamps
    const pipeline = [
      ['zremrangebyscore', key, '-inf', windowStart],
      ['zadd', key, now, now.toString()],
      ['zcard', key],
      ['expire', key, windowSeconds],
    ];

    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipeline),
    });

    const data = await res.json();
    const count = data[2]?.result;
    return count > limit;
  } catch (err) {
    console.error('Rate limit error:', err);
    return true; // Fail closed — block if Redis is down (security first)
  }
}
