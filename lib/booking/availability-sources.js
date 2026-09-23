// Supabase sources for Phase B availability. No Next.js imports, so tests can load it directly.
import { bookingIdFromStableEventId } from './availability.js';
import { stableEventId } from './calendar-sync.js';
import { createOwnership } from './ownership.js';

const LIVE_ROWS_PAGE = 500;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const OWNER_CHUNK = 100;
const OWNER_ROW_LIMIT = 1000;
const MAX_OWNER_IDS = 2000;
const ROW_FIELDS = 'id, status, preferred_date, preferred_time, calendar_event_id, ownership_proof, calendar_event_proof';
const fail = (msg, code) => Object.assign(new Error(msg), { code });

/**
 * Supabase sources for availability (Phase B, B1). Service role only.
 *  listLiveBookings: pending/confirmed rows on the given dates. KEYSET pages on id (id > last), so a
 *    row leaving the live set mid-read cannot shift a later live row out of the window (recheck S3).
 *    A malformed page is an error, never "empty"; > 20 pages → truncated error.
 *  resolveOwnedEventIds: which Google ids a booking row PROVABLY owns (HMAC proofs, recheck B0),
 *    across dates/statuses (B1-R3). Every id is checked in chunks; duplicate claims don't hide ids;
 *    anything incomplete throws, so the service marks 'partial' and keeps the events busy (S2).
 *  findBookingByToken: UUID-validated lookup_token → { id, status } only (B1-R1).
 * Every query takes the caller's AbortSignal (bounded in availability.js / handler, B1-R7).
 */
export function createAvailabilitySources(supabase, { ownership = createOwnership() } = {}) {
  return {
    async listLiveBookings({ dates, signal }) {
      const out = [];
      let last = null;
      for (let page = 0; page < 20; page++) {
        let q = supabase.from('bookings').select(ROW_FIELDS)
          .in('preferred_date', dates).in('status', ['pending', 'confirmed']);
        if (last) q = q.gt('id', last);
        q = q.order('id', { ascending: true }).limit(LIVE_ROWS_PAGE);
        if (signal) q = q.abortSignal(signal);
        const { data, error } = await q;
        if (error) throw fail('bookings read failed', 'db_error');
        if (!Array.isArray(data)) throw fail('bookings read malformed', 'bad_shape');
        out.push(...data);
        if (data.length < LIVE_ROWS_PAGE) return out;
        last = data[data.length - 1]?.id;
        if (!last) throw fail('bookings read malformed', 'bad_shape');
      }
      throw fail('too many live bookings', 'truncated');
    },
    async resolveOwnedEventIds({ eventIds, signal }) {
      const ids = [...new Set((eventIds || []).map(String))];
      if (ids.length > MAX_OWNER_IDS) throw fail('too many ids', 'truncated');
      const owned = new Set();
      const run = async (q) => {
        if (signal) q = q.abortSignal(signal);
        const r = await q;
        if (r.error || !Array.isArray(r.data)) throw fail('ownership read failed', 'db_error');
        return r.data;
      };
      for (let i = 0; i < ids.length; i += OWNER_CHUNK) {
        const chunk = ids.slice(i, i + OWNER_CHUNK);
        const stored = await run(supabase.from('bookings').select(ROW_FIELDS).in('calendar_event_id', chunk).limit(OWNER_ROW_LIMIT));
        if (stored.length >= OWNER_ROW_LIMIT) throw fail('ownership read truncated', 'truncated');
        for (const r of stored) {
          const ev = String(r.calendar_event_id || '');
          const stable = stableEventId(r.id);
          if (!ev) continue;
          if ((ev === stable && ownership.verifyRow(r)) || (ev !== stable && ownership.verifyEvent(r, ev))) owned.add(ev);
        }
        const derived = chunk.map(bookingIdFromStableEventId).filter(Boolean);
        if (derived.length) {
          const rows = await run(supabase.from('bookings').select(ROW_FIELDS).in('id', derived).limit(derived.length));
          for (const r of rows) { const e = stableEventId(r.id); if (e && ownership.verifyRow(r)) owned.add(e); }
        }
      }
      return owned;
    },
    async findBookingByToken(token, { signal } = {}) {
      if (!UUID_RE.test(String(token || '').trim())) return null;
      let q = supabase.from('bookings').select('id, status').eq('lookup_token', String(token).trim());
      if (signal) q = q.abortSignal(signal);
      const { data, error } = await q.maybeSingle();
      if (error) throw Object.assign(new Error('token read failed'), { code: 'db_error' });
      return data || null;
    },
  };
}
