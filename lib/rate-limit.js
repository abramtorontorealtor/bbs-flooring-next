/**
 * Simple in-memory rate limiter for API routes.
 * Tracks requests by key (IP or email) within a sliding window.
 * 
 * Note: This resets on cold starts (Vercel serverless). For persistent
 * rate limiting, use Vercel KV or Upstash Redis. This is sufficient
 * for burst protection against bots.
 */

const store = new Map();

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now - entry.resetAt > windowMs * 2) {
      store.delete(key);
    }
  }
}

/**
 * Check rate limit for a given key.
 * @param {string} key - Unique identifier (IP, email, etc.)
 * @param {object} opts
 * @param {number} opts.maxRequests - Max requests in window (default: 5)
 * @param {number} opts.windowMs - Window in ms (default: 15 min)
 * @returns {{ ok: boolean, remaining: number, resetAt: number }}
 */
export function checkRateLimit(key, { maxRequests = 5, windowMs = 15 * 60 * 1000 } = {}) {
  cleanup(windowMs);
  
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);

  if (entry.count > maxRequests) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { ok: true, remaining, resetAt: entry.resetAt };
}

/**
 * Get client IP from request headers (works behind Vercel/Cloudflare proxy).
 */
export function getClientIP(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}
