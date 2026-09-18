import { getSupabaseAdminClient } from '@/lib/supabase';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

// First-party visitor event beacon. Always returns 204 — never leaks errors
// to the client (this is a fire-and-forget analytics endpoint).

const ALLOWED_EVENT_TYPES = new Set([
  'page_view',
  'pdp_view',
  'calculator',
  'doc_download',
  'add_to_cart',
  'sample_request',
  'search',
  'quote_saved',
  'compare',
  'cta_click',
]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const BOT_UA_RE = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|vercel-screenshot/i;

// Rate limit: ~120 requests/min per IP (burst protection, not precise).
const RATE_LIMIT = { maxRequests: 120, windowMs: 60 * 1000 };

const EMPTY_204 = () => new Response(null, { status: 204 });

function truncate(str, max) {
  if (typeof str !== 'string') return null;
  return str.length > max ? str.slice(0, max) : str;
}

function sanitizeMeta(meta) {
  if (meta == null) return null;
  if (typeof meta !== 'object' || Array.isArray(meta)) return null;
  try {
    const json = JSON.stringify(meta);
    if (Buffer.byteLength(json, 'utf8') > 4096) return null;
    return meta;
  } catch {
    return null;
  }
}

function sanitizeUtm(utm) {
  if (utm == null || typeof utm !== 'object' || Array.isArray(utm)) return null;
  const allowed = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const out = {};
  let hasAny = false;
  for (const key of allowed) {
    const val = utm[key];
    if (typeof val === 'string' && val) {
      out[key] = truncate(val, 200);
      hasAny = true;
    }
  }
  return hasAny ? out : null;
}

async function readJsonBody(request) {
  // sendBeacon Blob bodies (and some browsers' beacon fallback) may arrive
  // as text/plain rather than application/json — parse the raw text either way.
  const raw = await request.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const ip = getClientIP(request);
    const limit = checkRateLimit(`track:${ip}`, RATE_LIMIT);
    if (!limit.ok) return EMPTY_204();

    const userAgent = request.headers.get('user-agent') || '';
    if (BOT_UA_RE.test(userAgent)) return EMPTY_204();

    const body = await readJsonBody(request);
    if (!body) return EMPTY_204();

    const { visitor_id, event_type, path, product_id, product_slug, product_name, meta, referrer, utm } = body;

    if (typeof visitor_id !== 'string' || !UUID_RE.test(visitor_id)) return EMPTY_204();
    if (typeof event_type !== 'string' || !ALLOWED_EVENT_TYPES.has(event_type)) return EMPTY_204();
    if (typeof path === 'string' && path.startsWith('/admin')) return EMPTY_204();

    const row = {
      visitor_id,
      event_type,
      path: truncate(path, 500),
      product_id: product_id ?? null,
      product_slug: truncate(product_slug, 200),
      product_name: truncate(product_name, 200),
      meta: sanitizeMeta(meta),
      referrer: truncate(referrer, 500),
      utm: sanitizeUtm(utm),
      user_agent: truncate(userAgent, 300),
    };

    const supabase = getSupabaseAdminClient();
    await supabase.from('site_events').insert(row);
  } catch {
    // never leak errors from a fire-and-forget analytics endpoint
  }
  return EMPTY_204();
}
