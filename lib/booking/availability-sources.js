// Supabase sources for Phase B availability. No Next.js imports, so tests can load it directly.
import { bookingIdFromStableEventId } from './availability.js';
import { stableEventId } from './calendar-sync.js';

const LIVE_ROWS_PAGE = 500;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Supabase sources for availability (Phase B, B1). Service role only.
 *  listLiveBookings: pending/confirmed rows on the given dates, deterministic pages; a short
 *    or malformed page is an error (B1-R6), never "empty".
 *  resolveOwnedEventIds: which Google ids belong to ANY booking row (stored id, or stable id of
 *    an existing row), across dates/statuses (B1-R3).
 *  findBookingByToken: UUID-validated lookup_token → { id, status } only (B1-R1).
 * Every query takes the caller's AbortSignal (bounded in availability.js / handler, B1-R7).
 */
export function createAvailabilitySources(supabase) {
  return {
    async listLiveBookings({ dates, signal }) {
      const out = [];
      for (let page = 0; page < 20; page++) {
        let q = supabase.from('bookings')
          .select('id, status, preferred_date, preferred_time, calendar_event_id')
          .in('preferred_date', dates).in('status', ['pending', 'confirmed'])
          .order('id', { ascending: true })
          .range(page * LIVE_ROWS_PAGE, page * LIVE_ROWS_PAGE + LIVE_ROWS_PAGE - 1);
        if (signal) q = q.abortSignal(signal);
        const { data, error } = await q;
        if (error) throw Object.assign(new Error('bookings read failed'), { code: 'db_error' });
        if (!Array.isArray(data)) throw Object.assign(new Error('bookings read malformed'), { code: 'bad_shape' });
        out.push(...data);
        if (data.length < LIVE_ROWS_PAGE) return out;
      }
      throw Object.assign(new Error('too many live bookings'), { code: 'truncated' });
    },
    async resolveOwnedEventIds({ eventIds, signal }) {
      const ids = [...new Set(eventIds.map(String))].slice(0, 500);
      const derived = ids.map(bookingIdFromStableEventId).filter(Boolean);
      const owned = new Set();
      let q1 = supabase.from('bookings').select('calendar_event_id').in('calendar_event_id', ids).limit(ids.length);
      if (signal) q1 = q1.abortSignal(signal);
      const r1 = await q1;
      if (r1.error || !Array.isArray(r1.data)) throw Object.assign(new Error('ownership read failed'), { code: 'db_error' });
      for (const r of r1.data) if (r.calendar_event_id) owned.add(String(r.calendar_event_id));
      if (derived.length) {
        let q2 = supabase.from('bookings').select('id').in('id', derived).limit(derived.length);
        if (signal) q2 = q2.abortSignal(signal);
        const r2 = await q2;
        if (r2.error || !Array.isArray(r2.data)) throw Object.assign(new Error('ownership read failed'), { code: 'db_error' });
        for (const r of r2.data) { const e = stableEventId(r.id); if (e) owned.add(e); }
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
