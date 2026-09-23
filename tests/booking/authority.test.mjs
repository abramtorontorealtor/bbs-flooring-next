// R15 / R16 (red-team BLOCKER + SHOULD-FIX): forged rows cannot drive the server's
// Google credentials; customer endpoints return a safe DTO, validate lookups and throttle.
// Real handler cores + real lifecycle/calendar-sync over in-memory fakes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBookingLifecycle } from '../../lib/booking/lifecycle.js';
import { createCalendarSync, stableEventId } from '../../lib/booking/calendar-sync.js';
import { handleCustomerAction, handleAdminAction, handleConfirm } from '../../lib/booking/handlers.js';
import { handleLookup, handleLookupToken, escapeLike } from '../../lib/booking/customer-lookup.js';
import { createOwnership } from '../../lib/booking/ownership.js';
import { createFakeDb, createFakeGoogle, silentLogger, TEST_OWNERSHIP_SECRET } from './fakes.mjs';

const NOW = new Date('2026-09-23T12:00:00Z');
const TOK = '6f1c2d3e-4a5b-4c6d-8e7f-001122334455';
const VICTIM = 'victimevent1234';

function setup({ limit = Infinity } = {}) {
  const db = createFakeDb();
  const google = createFakeGoogle();
  const lifecycle = createBookingLifecycle({
    db, calendar: createCalendarSync(google.adapter), notify: null, now: () => NOW, logger: silentLogger,
  });
  const hits = new Map();
  const deps = {
    supabase: {}, lifecycle, logger: silentLogger,
    getClientIP: () => '203.0.113.9',
    checkRateLimit: (key) => { const n = (hits.get(key) || 0) + 1; hits.set(key, n); return { ok: n <= limit, remaining: 0, resetAt: Date.now() + 60000 }; },
    findBookingByToken: async (t) => [...db.rows.values()].find((r) => r.lookup_token === t) || null,
    requireAdmin: async () => ({ error: null }),
  };
  return { db, google, deps };
}
const req = (body) => ({ json: async () => body, headers: { get: () => null } });

/** What an anon INSERT can produce: attacker-chosen token + calendar_event_id, no server proof. */
function forge(db, over = {}) {
  return db.seed({
    customer_name: 'Mallory', customer_email: 'm@example.com', preferred_date: '2026-10-05', preferred_time: '1:30 PM',
    status: 'pending', lookup_token: TOK, calendar_event_id: VICTIM,
    ownership_proof: null, calendar_event_proof: null, ...over,
  });
}

test('R15: forged row + customer cancel → DB cancelled, victim event untouched, NO Google call, failed/unverified', async () => {
  const { db, google, deps } = setup();
  google.events.set(VICTIM, { id: VICTIM, status: 'confirmed', summary: 'Real customer' });
  const b = forge(db);
  const res = await handleCustomerAction(req({ token: TOK, action: 'cancel' }), deps);
  assert.equal(res.status, 200);
  assert.equal(db.row(b.id).status, 'cancelled');
  assert.equal(google.log.length, 0, 'server Google credentials never used');
  assert.equal(google.events.get(VICTIM).status, 'confirmed');
  assert.deepEqual(res.body.calendarSync, { status: 'failed' }, 'customer sees status only');
  assert.equal(db.row(b.id).calendar_sync_status, 'failed');
  assert.match(db.row(b.id).calendar_sync_error, /not verified/);
});

test('R15: forged row + customer reschedule → victim event not patched/restored, no Google call', async () => {
  const { db, google, deps } = setup();
  google.events.set(VICTIM, { id: VICTIM, status: 'cancelled', summary: 'Real customer', date: '2026-11-01' });
  forge(db);
  const res = await handleCustomerAction(req({ token: TOK, action: 'reschedule', preferred_date: '2026-10-09', preferred_time: '11:00 AM' }), deps);
  assert.equal(res.status, 200);
  assert.equal(google.log.length, 0);
  assert.deepEqual([google.events.get(VICTIM).status, google.events.get(VICTIM).date], ['cancelled', '2026-11-01']);
});

test('R15: forged row with NO stored id cannot reach an event under its derived stable id', async () => {
  const { db, google, deps } = setup();
  const b = forge(db, { calendar_event_id: null });
  const S = stableEventId(b.id);
  google.events.set(S, { id: S, status: 'confirmed' }); // e.g. a deleted booking's leftover event
  await handleCustomerAction(req({ token: TOK, action: 'cancel' }), deps);
  assert.equal(google.log.length, 0);
  assert.equal(google.events.get(S).status, 'confirmed');
});

test('R15: a proof copied from another row does not verify (bound to the row id); stored event needs its own proof', async () => {
  const { db, google, deps } = setup();
  const own = createOwnership({ secret: TEST_OWNERSHIP_SECRET });
  google.events.set(VICTIM, { id: VICTIM, status: 'confirmed' });
  forge(db, { ownership_proof: own.signRow('some-other-booking-id'), calendar_event_proof: own.signEvent('some-other-booking-id', VICTIM) });
  await handleCustomerAction(req({ token: TOK, action: 'cancel' }), deps);
  assert.equal(google.log.length, 0);
  assert.equal(google.events.get(VICTIM).status, 'confirmed');
});

test('R15: no secret configured → nothing verifies, nothing signs (fail closed)', () => {
  const none = createOwnership({ secret: '' });
  assert.equal(none.configured, false);
  assert.equal(none.signRow('x'), null);
  assert.equal(none.verifyRow({ id: 'x', ownership_proof: null }), false);
  assert.equal(createOwnership({ secret: 'short' }).configured, false);
});

test('R15: legit flow kept — booking created by the server can be cancelled by its customer (event deleted)', async () => {
  const { db, google, deps } = setup();
  const c = await deps.lifecycle.create({ customer_email: 'k@example.com', preferred_date: '2026-10-05', preferred_time: '1:30 PM', lookup_token: TOK });
  assert.ok(db.row(c.booking.id).ownership_proof, 'server signed its own row');
  const res = await handleCustomerAction(req({ token: TOK, action: 'cancel' }), deps);
  assert.equal(res.body.calendarSync.status, 'absent');
  assert.equal(google.liveEvents().length, 0);
});

test('R15: historical legacy row (no proofs) → customer cancel fails closed; admin trust_calendar_event then retry deletes it', async () => {
  const { db, google, deps } = setup();
  google.events.set('oldgoogleid9', { id: 'oldgoogleid9', status: 'confirmed' });
  const b = forge(db, { calendar_event_id: 'oldgoogleid9', status: 'confirmed' });
  await handleCustomerAction(req({ token: TOK, action: 'cancel' }), deps);
  assert.equal(google.log.length, 0);
  // admin: stale/mismatched id → 409, no proof written
  const wrong = await handleAdminAction(req({ bookingId: b.id, action: 'trust_calendar_event', eventId: 'someotherid' }), deps);
  assert.equal(wrong.status, 409);
  const ok = await handleAdminAction(req({ bookingId: b.id, action: 'trust_calendar_event', eventId: 'oldgoogleid9' }), deps);
  assert.equal(ok.status, 200);
  assert.equal(google.log.length, 0, 'trusting makes no Google call');
  const retry = await handleAdminAction(req({ bookingId: b.id, action: 'retry_sync' }), deps);
  assert.equal(retry.body.calendarSync.status, 'absent');
  assert.equal(google.events.get('oldgoogleid9').status, 'cancelled');
});

test('R15: admin action on an unverified legacy handle also fails closed (no PATCH of a possibly foreign event)', async () => {
  const { db, google, deps } = setup();
  google.events.set(VICTIM, { id: VICTIM, status: 'confirmed' });
  const b = forge(db);
  const res = await handleAdminAction(req({ bookingId: b.id, action: 'confirm' }), deps);
  assert.equal(res.status, 200);
  assert.equal(res.body.calendarSync.reason, 'unverified_calendar_owner');
  assert.equal(google.log.length, 0);
});

test('R15: no service-role client → 503 before any read/write (confirm, customer-action, admin-action)', async () => {
  const { db, google, deps } = setup();
  const d = { ...deps, supabase: null, lifecycle: null };
  assert.equal((await handleConfirm(req({ booking: { customer_email: 'a@b.co' } }), d)).status, 503);
  assert.equal((await handleCustomerAction(req({ token: TOK, action: 'cancel' }), d)).status, 503);
  assert.equal((await handleAdminAction(req({ bookingId: 'x', action: 'confirm' }), d)).status, 503);
  assert.equal(db.calls.insert + db.calls.update + google.log.length, 0);
});

// ── R16 ──────────────────────────────────────────────────────────────────

test('R16: customer-action response is a customer-safe DTO (no calendar ids, proofs, notes, sync errors)', async () => {
  const { deps } = setup();
  await deps.lifecycle.create({ customer_email: 'k@example.com', preferred_date: '2026-10-05', preferred_time: '1:30 PM', lookup_token: TOK, notes: 'gate code 1234' });
  const res = await handleCustomerAction(req({ token: TOK, action: 'reschedule', preferred_date: '2026-10-09', preferred_time: '11:00 AM' }), deps);
  assert.equal(res.status, 200);
  for (const k of ['calendar_event_id', 'ownership_proof', 'calendar_event_proof', 'calendar_sync_error', 'calendar_sync_status', 'notes', 'revision', 'visitor_id', 'customer_email', 'customer_phone']) {
    assert.ok(!(k in res.body.booking), `${k} not exposed`);
  }
  assert.deepEqual(Object.keys(res.body.calendarSync), ['status']);
  assert.equal(res.body.booking.preferred_date, '2026-10-09');
});

test('R16: customer-action is rate limited per IP', async () => {
  const { deps } = setup({ limit: 2 });
  await handleCustomerAction(req({ token: TOK, action: 'cancel' }), deps);
  await handleCustomerAction(req({ token: TOK, action: 'cancel' }), deps);
  const r = await handleCustomerAction(req({ token: TOK, action: 'cancel' }), deps);
  assert.equal(r.status, 429);
  assert.ok(r.headers['Retry-After']);
});

/** PostgREST-ish fake with real ILIKE semantics (so unescaped wildcards would match). */
function lookupSb(rows) {
  const queries = [];
  const ilikeRe = (pat) => new RegExp('^' + pat.replace(/\\(.)|([%_])|([^\\%_]+)/g, (m, esc, wc, lit) => {
    if (esc) return esc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (wc) return wc === '%' ? '.*' : '.';
    return lit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }) + '$', 'i');
  return {
    queries,
    from() {
      const st = { filters: [], select: '' };
      const b = {
        select(s) { st.select = s; return b; },
        ilike(c, p) { queries.push(['ilike', c, p]); st.filters.push((r) => ilikeRe(p).test(r[c] || '')); return b; },
        eq(c, v) { queries.push(['eq', c, v]); st.filters.push((r) => r[c] === v); return b; },
        order() { return b; },
        limit() { return Promise.resolve({ data: rows.filter((r) => st.filters.every((f) => f(r))), error: null }); },
        maybeSingle() { return Promise.resolve({ data: rows.find((r) => st.filters.every((f) => f(r))) || null, error: null }); },
      };
      return b;
    },
  };
}
const ROWS = [
  { id: 'b1', lookup_token: TOK, customer_email: 'karen@example.com', customer_phone: '(416) 555-0100', preferred_date: '2026-10-05', status: 'pending', calendar_event_id: 'evt', ownership_proof: 'v1.x', notes: 'secret' },
  { id: 'b2', lookup_token: '7f1c2d3e-4a5b-4c6d-8e7f-001122334455', customer_email: 'other@example.com', customer_phone: '', status: 'pending' },
];
const lk = (sb, over = {}) => ({ supabase: sb, checkRateLimit: () => ({ ok: true }), getClientIP: () => 'ip', logger: silentLogger, ...over });

test('R16: lookup requires a real email and a full phone; blank stored phones never match', async () => {
  const sb = lookupSb(ROWS);
  assert.equal((await handleLookup(req({ email: 'karen@example.com', phone: 'x' }), lk(sb))).status, 400);
  assert.equal((await handleLookup(req({ email: 'karen', phone: '4165550100' }), lk(sb))).status, 400);
  assert.equal(sb.queries.length, 0, 'no query on invalid input');
  assert.equal((await handleLookup(req({ email: 'other@example.com', phone: '0000000000' }), lk(sb))).status, 404);
});

test('R16: wildcard email is matched literally (escaped + exact re-check)', async () => {
  const sb = lookupSb(ROWS);
  const r = await handleLookup(req({ email: '%@example.com', phone: '416-555-0100' }), lk(sb));
  assert.equal(r.status, 404);
  assert.equal(sb.queries[0][2], '\\%@example.com');
  assert.equal(escapeLike('a_b%c\\d'), 'a\\_b\\%c\\\\d');
});

test('R16: lookup match → DTO only (token for self-service, no calendar/proof/notes/contact fields)', async () => {
  const r = await handleLookup(req({ email: 'KAREN@example.com ', phone: '+1 416 555 0100' }), lk(lookupSb(ROWS)));
  assert.equal(r.status, 200);
  assert.equal(r.body.bookings.length, 1);
  const b = r.body.bookings[0];
  assert.equal(b.lookup_token, TOK);
  for (const k of ['calendar_event_id', 'ownership_proof', 'notes', 'customer_email', 'customer_phone']) assert.ok(!(k in b));
});

test('R16: lookup + lookup-token are rate limited, fail closed without service role, token must be a uuid', async () => {
  const deny = () => ({ ok: false, resetAt: Date.now() + 1000 });
  assert.equal((await handleLookup(req({}), lk(lookupSb(ROWS), { checkRateLimit: deny }))).status, 429);
  assert.equal((await handleLookupToken(req({ token: TOK }), lk(lookupSb(ROWS), { checkRateLimit: deny }))).status, 429);
  assert.equal((await handleLookup(req({ email: 'karen@example.com', phone: '4165550100' }), lk(null))).status, 503);
  assert.equal((await handleLookupToken(req({ token: TOK }), lk(null))).status, 503);
  const sb = lookupSb(ROWS);
  assert.equal((await handleLookupToken(req({ token: '%' }), lk(sb))).status, 404);
  assert.equal(sb.queries.length, 0);
  const ok = await handleLookupToken(req({ token: TOK }), lk(sb));
  assert.equal(ok.status, 200);
  assert.ok(!('calendar_event_id' in ok.body.booking) && !('notes' in ok.body.booking));
});
