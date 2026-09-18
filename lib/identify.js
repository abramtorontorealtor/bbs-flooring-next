// Server-only helper: link anonymous browsing (bbs_vid cookie) to a person
// once they submit any form. Never throws — identification must not break
// a submission.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(v) {
  return typeof v === 'string' && UUID_RE.test(v);
}

function parseCookieHeader(header, name) {
  if (!header || typeof header !== 'string') return null;
  const parts = header.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) {
      try {
        return decodeURIComponent(part.slice(idx + 1).trim());
      } catch {
        return part.slice(idx + 1).trim();
      }
    }
  }
  return null;
}

// Digits only; strip a leading '1' when there are 11 digits (NA country code);
// return null when fewer than 10 digits remain (not a usable phone number).
export function normalizePhone(p) {
  if (!p) return null;
  let digits = String(p).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  if (digits.length < 10) return null;
  return digits;
}

// Reads the bbs_vid cookie off a NextRequest (cookies.get), falling back to
// manually parsing a raw `cookie` header, then falling back to a visitor_id
// sent in the JSON body. Returns null unless the value is a valid UUID.
export function getVisitorIdFromRequest(request, body) {
  let candidate = null;

  try {
    candidate = request?.cookies?.get?.('bbs_vid')?.value || null;
  } catch {
    candidate = null;
  }

  if (!candidate) {
    try {
      const cookieHeader =
        (typeof request?.headers?.get === 'function' ? request.headers.get('cookie') : null) ||
        request?.headers?.cookie ||
        null;
      candidate = parseCookieHeader(cookieHeader, 'bbs_vid');
    } catch {
      candidate = null;
    }
  }

  if (!candidate && body?.visitor_id) {
    candidate = body.visitor_id;
  }

  return isValidUuid(candidate) ? candidate : null;
}

// Upserts a (visitor_id, email, phone) link into visitor_identities.
// Swallows and logs all errors — never throws, so a DB/network hiccup here
// can never break the underlying form submission.
export async function identifyVisitor(supabase, { visitorId, email, phone, name, source } = {}) {
  if (!visitorId) return null;

  try {
    const normalizedEmail = email ? String(email).trim().toLowerCase() : null;
    const normalizedPhone = normalizePhone(phone);

    const { data, error } = await supabase
      .from('visitor_identities')
      .upsert(
        {
          visitor_id: visitorId,
          email: normalizedEmail,
          phone: normalizedPhone,
          name: name || null,
          source: source || null,
        },
        { onConflict: 'visitor_id,email,phone', ignoreDuplicates: true }
      )
      .select();

    if (error) {
      console.error('[identifyVisitor] upsert failed:', error.message || error);
      return null;
    }
    return data || null;
  } catch (e) {
    console.error('[identifyVisitor] unexpected error:', e?.message || e);
    return null;
  }
}
