/**
 * First-party visitor tracking — cookie ID + event beacon.
 *
 * Contract:
 *   import { track } from '@/lib/track';
 *   track('pdp_view', { product_id, product_slug, product_name, meta: {...} });
 *
 * Never throws. No-op on the server or on /admin/* paths.
 */

const COOKIE_NAME = 'bbs_vid';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const UTM_STORAGE_KEY = 'bbs_utm';
const DEDUPE_WINDOW_MS = 5000;

let dedupeMap = null;

function isAdminPath(path) {
  return typeof path === 'string' && path.startsWith('/admin');
}

function readCookie(name) {
  try {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function writeCookie(name, value, maxAgeSeconds) {
  try {
    const isHttps = typeof location !== 'undefined' && location.protocol === 'https:';
    const parts = [
      `${name}=${encodeURIComponent(value)}`,
      'path=/',
      `max-age=${maxAgeSeconds}`,
      'SameSite=Lax',
    ];
    if (isHttps) parts.push('Secure');
    document.cookie = parts.join('; ');
  } catch {
    // no-op
  }
}

/**
 * Get (or create) the persistent first-party visitor id.
 * Reads/writes the `bbs_vid` cookie. No-op (returns null) on the server.
 */
export function getVisitorId() {
  if (typeof window === 'undefined') return null;
  try {
    let id = readCookie(COOKIE_NAME);
    if (!id) {
      id = crypto.randomUUID();
      writeCookie(COOKIE_NAME, id, COOKIE_MAX_AGE);
    } else {
      // Refresh max-age on every visit so active visitors don't lose their id.
      writeCookie(COOKIE_NAME, id, COOKIE_MAX_AGE);
    }
    return id;
  } catch {
    return null;
  }
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

function readUtmFromUrl() {
  try {
    const params = new URLSearchParams(location.search);
    const utm = {};
    let found = false;
    for (const key of UTM_KEYS) {
      const val = params.get(key);
      if (val) {
        utm[key] = val;
        found = true;
      }
    }
    return found ? utm : null;
  } catch {
    return null;
  }
}

function getUtm() {
  try {
    const fromUrl = readUtmFromUrl();
    if (fromUrl) {
      // First-touch attribution: only store if not already stored.
      if (!sessionStorage.getItem(UTM_STORAGE_KEY)) {
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(fromUrl));
      }
      return fromUrl;
    }
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return {};
  } catch {
    return {};
  }
}

function shouldDedupe(eventType, productSlug, path) {
  try {
    if (!dedupeMap) dedupeMap = new Map();
    const now = Date.now();
    // Opportunistic cleanup so the map doesn't grow unbounded on long sessions.
    for (const [key, ts] of dedupeMap) {
      if (now - ts > DEDUPE_WINDOW_MS) dedupeMap.delete(key);
    }
    const dedupeKey = `${eventType}|${productSlug || ''}|${path || ''}`;
    const lastSeen = dedupeMap.get(dedupeKey);
    if (lastSeen && now - lastSeen < DEDUPE_WINDOW_MS) return true;
    dedupeMap.set(dedupeKey, now);
    return false;
  } catch {
    return false;
  }
}

/**
 * Fire a tracking event to /api/track. Fire-and-forget; never throws.
 * @param {string} eventType - one of the allowed event types (validated server-side too)
 * @param {object} [data] - { product_id, product_slug, product_name, meta }
 */
export function track(eventType, data = {}) {
  if (typeof window === 'undefined') return;
  try {
    const path = location.pathname;
    if (isAdminPath(path)) return;
    if (!eventType) return;

    const { product_id, product_slug, product_name, meta } = data || {};

    if (shouldDedupe(eventType, product_slug, path)) return;

    const payload = {
      visitor_id: getVisitorId(),
      event_type: eventType,
      path,
      product_id: product_id ?? null,
      product_slug: product_slug ?? null,
      product_name: product_name ?? null,
      meta: meta ?? null,
      referrer: (typeof document !== 'undefined' && document.referrer) || null,
      utm: getUtm(),
    };

    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      const ok = navigator.sendBeacon('/api/track', blob);
      if (ok) return;
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // never throw — tracking must never break the app
  }
}
