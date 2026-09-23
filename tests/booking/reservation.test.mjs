// B2: server-side slot enforcement + atomic reservation through the REAL lifecycle/handlers over the
// in-memory reservation model (tests/booking/fakes.mjs). Logic only: Postgres lock/transaction
// behaviour is covered by migrations + phaseB-B2-local-sql-check.mjs (sequential PGlite) and the
// still-open multi-session release check.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBookingLifecycle } from '../../lib/booking/lifecycle.js';
import { createCalendarSync } from '../../lib/booking/calendar-sync.js';
import { createSlotGate, idempotencyKeyHash, reservationSlot } from '../../lib/booking/reservation.js';
import { resolveSchedulePolicy } from '../../lib/booking/schedule-policy.js';
import { createAvailabilityService } from '../../lib/booking/availability.js';
import { handleConfirm, handleCustomerAction, handleAdminAction, handleLegacyReschedule } from '../../lib/booking/handlers.js';
import { createFakeDb, createFakeGoogle, createFakeNotify, silentLogger } from './fakes.mjs';

let NOW = Date.parse('2026-09-23T12:00:00Z');
const T0 = NOW;
const policy = resolveSchedulePolicy({}, {});
const B = (o = {}) => ({ customer_name: 'K', customer_email: 'k@example.com', customer_phone: '416-555-0100', preferred_date: '2026-10-05', preferred_time: '1:00 PM', ...o });

function setup({ withAvailability = true, google: gOpts } = {}) {
  NOW = T0;
  const db = createFakeDb();
  db.now = () => NOW;
  const google = createFakeGoogle();
  const notify = createFakeNotify();
  const availability = withAvailability ? createAvailabilityService({
    policy, now: () => NOW, logger: silentLogger,
    listLiveBookings: async ({ dates }) => [...db.rows.values()].filter((r) => dates.includes(r.preferred_date) && ['pending', 'confirmed'].includes(r.status)),
    listGoogleEvents: gOpts?.events ? async () => ({ ok: true, events: gOpts.events }) : null,
  }) : null;
  const slotGate = createSlotGate({ policy, availability, now: () => NOW, logger: silentLogger });
  const lifecycle = createBookingLifecycle({ db, calendar: createCalendarSync(google.adapter), notify, now: () => new Date(NOW), logger: silentLogger, slotGate });
  const deps = {
    supabase: {}, lifecycle, logger: silentLogger, getClientIP: () => 'ip', checkRateLimit: () => ({ ok: true }),
    getVisitorIdFromRequest: () => null, identifyVisitor: async () => [], requireAdmin: async () => ({ error: null }),
    findBookingByToken: async (t) => [...db.rows.values()].find((r) => r.lookup_token === t) || null,
  };
  return { db, google, notify, lifecycle, deps, advance: (ms) => { NOW += ms; } };
}
const req = (body, key) => ({ json: async () => body, headers: { get: (h) => (h.toLowerCase() === 'idempotency-key' ? key || null : null) } });

test('B2: two simultaneous different-customer requests for one slot → exactly one created, one 409 with refreshed options', async () => {
  const { db, notify, deps } = setup({ withAvailability: false }); // both pass the (absent) pre-check → the lock decides
  const [a, b] = await Promise.all([
    handleConfirm(req({ booking: B() }), deps),
    handleConfirm(req({ booking: B({ customer_email: 'other@example.com', customer_phone: '905-555-0199', preferred_time: '1:30 PM' }) }), deps),
  ]);
  const statuses = [a.status, b.status].sort();
  assert.deepEqual(statuses, [200, 409]);
  const lost = a.status === 409 ? a : b;
  assert.equal(lost.body.code, 'slot_unavailable');
  assert.match(lost.body.error, /just taken/);
  assert.equal(db.rows.size, 1);
  assert.equal(notify.sent.filter((n) => n.type === 'created').length, 1, 'no email for the loser');
});

test('B2: pre-check with fresh availability → 409 carries sanitized options (no PII); taken slot absent', async () => {
  const { deps } = setup();
  await handleConfirm(req({ booking: B() }), deps);
  const r = await handleConfirm(req({ booking: B({ customer_email: 'x@example.com', customer_phone: '', preferred_time: '1:30 PM' }) }), deps);
  assert.equal(r.status, 409);
  const view = r.body.availability;
  assert.equal(view.timeZone, 'America/Toronto');
  assert.ok(!view.slots.some((s) => s.time === '1:30 PM' || s.time === '1:00 PM' || s.time === '12:30 PM'));
  assert.ok(view.slots.some((s) => s.time === '11:00 AM'));
  assert.doesNotMatch(JSON.stringify(r.body), /k@example\.com|416-555|Karen|lookup_token|calendar/);
});

test('B2: Google busy block close to commit → 409 (known blocks enforced)', async () => {
  const ev = { id: 'x1', status: 'confirmed', start: { dateTime: '2026-10-05T13:00:00-04:00' }, end: { dateTime: '2026-10-05T14:00:00-04:00' }, calendarTimeZone: 'America/Toronto' };
  const { db, deps } = setup({ google: { events: [ev] } });
  const r = await handleConfirm(req({ booking: B() }), deps);
  assert.equal(r.status, 409);
  assert.equal(db.rows.size, 0);
});

test('B2: invalid / out-of-policy slot → 400, nothing written; DB outage → 503 retriable, no fake success', async () => {
  const { db, deps } = setup();
  for (const bad of [B({ preferred_time: '2:00 PM' }), B({ preferred_date: '2026-10-04' }), B({ preferred_date: '2026-09-23' }), B({ preferred_date: 'soon' }), B({ preferred_time: '' })]) {
    const r = await handleConfirm(req({ booking: bad }), deps);
    assert.equal(r.status, 400, JSON.stringify(bad));
    assert.equal(r.body.code, 'invalid_slot');
  }
  assert.equal(db.rows.size, 0);
  db.failReserve = true;
  const down = await handleConfirm(req({ booking: B() }), deps);
  assert.equal(down.status, 503);
  assert.equal(down.headers['Retry-After'], '5');
  assert.equal(down.body.success, false);
  const noAvail = setup();
  noAvail.lifecycle; // availability DB outage → 503 before any write
  const outage = setup();
  outage.deps.lifecycle = createBookingLifecycle({ db: outage.db, calendar: createCalendarSync(outage.google.adapter), notify: null, now: () => new Date(NOW), logger: silentLogger,
    slotGate: createSlotGate({ policy, now: () => NOW, logger: silentLogger, availability: { forDate: async () => ({ status: 'unavailable', slots: [] }) } }) });
  const o = await handleConfirm(req({ booking: B() }), outage.deps);
  assert.equal(o.status, 503);
  assert.equal(outage.db.rows.size, 0);
});

test('B2: idempotency key replays the original for the SAME owner only; no second email/calendar/conversion', async () => {
  const { db, notify, google, deps } = setup();
  const key = 'k'.repeat(24);
  const first = await handleConfirm(req({ booking: B() }, key), deps);
  const gl = google.log.length;
  const again = await handleConfirm(req({ booking: B({ preferred_time: '11:00 AM' }) }, key), deps); // lost response, then a new time
  // The SAVED slot comes back (1:00 PM), never the time this retry submitted (R-B2-REPLAY).
  assert.deepEqual(again.body, { success: true, emailSent: false, bookingId: first.body.bookingId, duplicate: true,
    booking: { preferred_date: '2026-10-05', preferred_time: '1:00 PM', status: 'pending' } });
  assert.equal(google.log.length, gl);
  assert.equal(notify.sent.filter((n) => n.type === 'created').length, 1);
  // Same key under someone else's contact → no match, no disclosure: a normal new booking (or 409).
  const stranger = await handleConfirm(req({ booking: B({ customer_email: 'mallory@example.com', customer_phone: '', preferred_time: '5:00 PM' }) }, key), deps);
  assert.equal(stranger.status, 200);
  assert.notEqual(stranger.body.bookingId, first.body.bookingId);
  assert.ok(!stranger.body.duplicate);
  assert.equal(db.rows.size, 2);
  assert.equal(idempotencyKeyHash(key, { email: 'K@example.com ', phone: '(416) 555-0100' }), idempotencyKeyHash(key, { email: 'k@example.com', phone: '4165550100' }));
  assert.notEqual(idempotencyKeyHash(key, { email: 'k@example.com' }), idempotencyKeyHash(key, { email: 'm@example.com' }));
  assert.equal(idempotencyKeyHash('short', { email: 'k@example.com' }), null);
  assert.equal(idempotencyKeyHash(key, {}), null);
});

test('B2: customer reschedule into an occupied slot → 409 + options, original booking untouched, no email', async () => {
  const { db, notify, deps } = setup();
  const a = await deps.lifecycle.create({ ...B(), lookup_token: 'tok-a' });
  await deps.lifecycle.create({ ...B({ customer_email: 'b@example.com', customer_phone: '', preferred_time: '5:00 PM' }), lookup_token: 'tok-b' });
  const before = db.row(a.booking.id);
  notify.sent.length = 0;
  const r = await handleCustomerAction(req({ token: 'tok-a', action: 'reschedule', preferred_date: '2026-10-05', preferred_time: '5:00 PM' }), deps);
  assert.equal(r.status, 409);
  assert.ok(Array.isArray(r.body.availability.slots));
  assert.deepEqual(db.row(a.booking.id), before, 'original untouched');
  assert.equal(notify.sent.length, 0);
});

test('B2: reschedule excludes only itself (moving within its own old interval works); another overlap still blocks', async () => {
  const { db, deps } = setup();
  const a = await deps.lifecycle.create({ ...B({ preferred_time: '11:00 AM' }), lookup_token: 'tok-a' });
  const ok = await handleCustomerAction(req({ token: 'tok-a', action: 'reschedule', preferred_date: '2026-10-05', preferred_time: '11:30 AM' }), deps);
  assert.equal(ok.status, 200);
  assert.equal(db.row(a.booking.id).preferred_time, '11:30 AM');
  await deps.lifecycle.create({ ...B({ customer_email: 'b@example.com', customer_phone: '', preferred_time: '1:00 PM' }), lookup_token: 'tok-b' });
  const blocked = await handleCustomerAction(req({ token: 'tok-a', action: 'reschedule', preferred_date: '2026-10-05', preferred_time: '12:30 PM' }), deps);
  assert.equal(blocked.status, 409);
});

test('B2: admin + legacy reschedule go through the reservation; admin off-policy time = logged override, overlap still 409', async () => {
  const { db, deps } = setup();
  const a = await deps.lifecycle.create({ ...B(), lookup_token: 'tok-a' });
  const off = await handleAdminAction(req({ bookingId: a.booking.id, action: 'reschedule', preferred_date: '2026-10-11', preferred_time: '7:15 PM' }), deps); // Sunday evening
  assert.equal(off.status, 200);
  assert.equal(off.body.policyOverride, true);
  const b = await deps.lifecycle.create({ ...B({ customer_email: 'b@example.com', customer_phone: '', preferred_date: '2026-10-06' }), lookup_token: 'tok-b' });
  const clash = await handleAdminAction(req({ bookingId: b.booking.id, action: 'reschedule', preferred_date: '2026-10-11', preferred_time: '7:30 PM' }), deps);
  assert.equal(clash.status, 409);
  assert.equal(db.row(b.booking.id).preferred_date, '2026-10-06', 'original kept');
  const legacy = await handleLegacyReschedule(req({ bookingId: b.booking.id, preferred_date: '2026-10-11', preferred_time: '7:00 PM' }), deps);
  assert.equal(legacy.status, 409);
  assert.equal((await handleLegacyReschedule(req({ bookingId: b.booking.id, preferred_date: '2026-10-07', preferred_time: '11:00 AM' }), deps)).status, 200);
});

test('B2: cancelled bookings free their slot; identical repeated reschedule is a no-op (no reservation call, no email)', async () => {
  const { db, notify, deps } = setup();
  const a = await deps.lifecycle.create({ ...B(), lookup_token: 'tok-a' });
  await deps.lifecycle.cancel(a.booking.id, '', 'customer');
  const n = await handleConfirm(req({ booking: B({ customer_email: 'n@example.com', customer_phone: '' }) }), deps);
  assert.equal(n.status, 200);
  const c = await deps.lifecycle.create({ ...B({ customer_email: 'c@example.com', customer_phone: '', preferred_time: '5:00 PM' }), lookup_token: 'tok-c' });
  await handleCustomerAction(req({ token: 'tok-c', action: 'reschedule', preferred_date: '2026-10-06', preferred_time: '11:00 AM' }), deps);
  const calls = db.reserveCalls; const sent = notify.sent.length;
  const again = await handleCustomerAction(req({ token: 'tok-c', action: 'reschedule', preferred_date: '2026-10-06', preferred_time: '11:00 AM' }), deps);
  assert.equal(again.status, 200);
  assert.equal(db.reserveCalls, calls);
  assert.equal(notify.sent.length, sent);
  assert.ok(c.success);
});

test('B2: reservationSlot — untimed = whole local day; DST-transition day lengths; unreadable time → null', () => {
  const d = reservationSlot('2026-11-01', null, policy);
  assert.equal(Date.parse(d.end) - Date.parse(d.start), 25 * 3600e3);
  assert.equal(reservationSlot('2026-10-05', '1:00 PM', policy).start, '2026-10-05T17:00:00.000Z');
  assert.equal(reservationSlot('2026-10-05', 'noonish', policy), null);
  assert.equal(reservationSlot('2026-02-31', '1:00 PM', policy), null);
});

// ── R-B2-REPLAY (reviewer, blocking): production-wired retries must replay, not 409/400 ──
test('R-B2-REPLAY: SAME payload + SAME key with real availability → replay of the saved booking (not 409), no side effects', async () => {
  const { db, notify, google, deps } = setup();
  const key = 'r'.repeat(24);
  const first = await handleConfirm(req({ booking: B() }, key), deps);
  assert.equal(first.status, 200);
  assert.deepEqual(first.body.booking, { preferred_date: '2026-10-05', preferred_time: '1:00 PM', status: 'pending' });
  const gl = google.log.length;
  const retry = await handleConfirm(req({ booking: B() }, key), deps);
  assert.equal(retry.status, 200, JSON.stringify(retry.body));
  assert.deepEqual([retry.body.duplicate, retry.body.bookingId, retry.body.emailSent], [true, first.body.bookingId, false]);
  assert.equal(db.rows.size, 1);
  assert.equal(google.log.length, gl);
  assert.equal(notify.sent.filter((n) => n.type === 'created').length, 1);
});

test('R-B2-REPLAY: SAME payload WITHOUT a key (24 h same-contact dedupe) → replay, not 409', async () => {
  const { db, deps } = setup();
  const first = await handleConfirm(req({ booking: B() }), deps);
  const retry = await handleConfirm(req({ booking: B({ customer_email: ' K@EXAMPLE.com' }) }), deps);
  assert.equal(retry.status, 200);
  assert.deepEqual([retry.body.duplicate, retry.body.bookingId], [true, first.body.bookingId]);
  assert.equal(db.rows.size, 1);
});

test('R-B2-REPLAY: retry after the notice boundary passed still replays (no 400); different customer still gets 409', async () => {
  const { db, deps, advance } = setup();
  const key = 'n'.repeat(24);
  const first = await handleConfirm(req({ booking: B({ preferred_date: '2026-09-25', preferred_time: '11:00 AM' }) }, key), deps);
  assert.equal(first.status, 200);
  advance(24 * 3600e3); // now inside the 24 h notice window of that slot
  const retry = await handleConfirm(req({ booking: B({ preferred_date: '2026-09-25', preferred_time: '11:00 AM' }) }, key), deps);
  assert.deepEqual([retry.status, retry.body.duplicate], [200, true]);
  const stranger = await handleConfirm(req({ booking: B({ customer_email: 'z@example.com', customer_phone: '', preferred_date: '2026-10-05' }) }), deps);
  assert.equal(stranger.status, 200);
  const clash = await handleConfirm(req({ booking: B({ customer_email: 'y@example.com', customer_phone: '', preferred_date: '2026-10-05' }) }), deps);
  assert.equal(clash.status, 409);
  assert.equal(db.rows.size, 2);
});

test('R-B2-REPLAY: key expires after 24 h and never replays a CANCELLED booking (new request instead)', async () => {
  const { db, deps, advance } = setup();
  const key = 'e'.repeat(24);
  const first = await handleConfirm(req({ booking: B() }, key), deps);
  await deps.lifecycle.cancel(first.body.bookingId, '', 'customer');
  const again = await handleConfirm(req({ booking: B() }, key), deps);
  assert.equal(again.status, 200);
  assert.ok(!again.body.duplicate, 'cancelled booking is not replayed');
  assert.notEqual(again.body.bookingId, first.body.bookingId);
  advance(25 * 3600e3);
  const late = await handleConfirm(req({ booking: B({ preferred_date: '2026-10-07' }) }, key), deps);
  assert.ok(!late.body.duplicate, 'expired key');
  assert.equal(db.rows.size, 3);
});

test('R-B2-REPLAY: read-only lookup failure falls through to the atomic RPC (which still replays under the lock)', async () => {
  const { db, deps } = setup({ withAvailability: false });
  const key = 'f'.repeat(24);
  const first = await handleConfirm(req({ booking: B() }, key), deps);
  db.findReplay = async () => ({ error: { message: 'down' } });
  const retry = await handleConfirm(req({ booking: B() }, key), deps);
  assert.deepEqual([retry.status, retry.body.bookingId, retry.body.duplicate], [200, first.body.bookingId, true]);
});
