/**
 * Booking ⇄ Calendar ownership proofs (red-team R15). Server-only.
 *
 * Problem: `bookings_anon_insert` (with_check true) lets anyone insert a row with
 * any id, lookup_token and calendar_event_id. The customer token then drives the
 * server's Google credentials. A matching lookup_token or stable id proves nothing,
 * because the attacker chose both.
 *
 * Trust anchor: an HMAC keyed with BOOKING_OWNERSHIP_SECRET, which only the server knows.
 *   ownership_proof       = HMAC('row|'   + id)            written by lifecycle.create()
 *                           (server-generated id) or by an admin action on the row
 *   calendar_event_proof  = HMAC('event|' + id + '|' + eventId)   written ONLY by the
 *                           explicit admin action `trust_calendar_event`
 *
 * Rules (enforced in lifecycle.syncLatest):
 *  - Derived stable id (bbs+uuid): may be created, moved or deleted when the row is
 *    trusted: a valid ownership_proof, or the actor is admin/server.
 *  - Any other stored id (a legacy Google id, or anything a forged row claims): no
 *    Google call at all without a valid calendar_event_proof, for any actor.
 *  - Unverifiable → sync 'failed' with reason 'unverified_calendar_owner'. Never
 *    synced/absent. The DB change itself still stands.
 * No secret configured → nothing verifies and nothing can be signed (fail closed).
 * Historical rows get NO automatic trust or backfill. See the runbook for the
 * per-row admin reconciliation.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

const MIN_SECRET_LEN = 32;

export function createOwnership({ secret = process.env.BOOKING_OWNERSHIP_SECRET } = {}) {
  const key = typeof secret === 'string' && secret.length >= MIN_SECRET_LEN ? secret : null;
  const mac = (msg) => (key ? 'v1.' + createHmac('sha256', key).update(msg).digest('base64url') : null);
  // Compare BYTE lengths (a same-character-length non-ASCII proof would otherwise make
  // timingSafeEqual throw). Malformed proofs are simply "not valid".
  const same = (a, b) => {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const ba = Buffer.from(a, 'utf8');
    const bb = Buffer.from(b, 'utf8');
    if (ba.length !== bb.length) return false;
    try { return timingSafeEqual(ba, bb); } catch { return false; }
  };
  return {
    configured: !!key,
    signRow: (id) => (id ? mac(`row|${id}`) : null),
    signEvent: (id, eventId) => (id && eventId ? mac(`event|${id}|${eventId}`) : null),
    verifyRow(row) {
      return !!key && !!row?.id && same(row.ownership_proof, mac(`row|${row.id}`));
    },
    verifyEvent(row, eventId) {
      return !!key && !!row?.id && !!eventId && same(row.calendar_event_proof, mac(`event|${row.id}|${eventId}`));
    },
  };
}

export const UNVERIFIED_REASON = 'unverified_calendar_owner';
