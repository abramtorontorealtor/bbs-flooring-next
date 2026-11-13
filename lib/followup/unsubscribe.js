import { createHmac, timingSafeEqual } from 'crypto';

// Signed one-click unsubscribe links for automated follow-up emails (CASL s.6(2)(c)).
// Token = HMAC-SHA256(lowercased email) under CRON_SECRET — no DB lookup needed to build a link.

function secret() {
  return process.env.FOLLOWUP_UNSUB_SECRET || process.env.CRON_SECRET || '';
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function unsubscribeToken(email) {
  const s = secret();
  if (!s) return null;
  return createHmac('sha256', s).update(normalizeEmail(email)).digest('hex').slice(0, 32);
}

export function verifyUnsubscribeToken(email, token) {
  const expected = unsubscribeToken(email);
  if (!expected || !token || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(String(token)));
}

export function unsubscribeUrl(email) {
  const token = unsubscribeToken(email);
  if (!token) return null;
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca';
  const params = new URLSearchParams({ e: normalizeEmail(email), t: token });
  return `${site}/api/followup/unsubscribe?${params.toString()}`;
}
