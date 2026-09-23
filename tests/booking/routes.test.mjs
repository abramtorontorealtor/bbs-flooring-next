// Route-level tests (A3): handler cores in lib/booking/handlers.js wired to the
// REAL lifecycle + calendar-sync + notify adapter, with fake DB / Google / email.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createBookingLifecycle } from '../../lib/booking/lifecycle.js';
import { createCalendarSync, stableEventId } from '../../lib/booking/calendar-sync.js';
import { createBookingNotifier } from '../../lib/booking/notify.js';
import {
  handleConfirm, handleCustomerAction, handleAdminAction, handleLegacyReschedule,
} from '../../lib/booking/handlers.js';
import { createFakeDb, createFakeGoogle, silentLogger } from './fakes.mjs';

const NOW = new Date('2026-09-23T12:00:00Z');

function fakeEmail({ fail = false } = {}) {
  const sent = [];
  const mk = (name) => async (args) => {
    sent.push({ name, ...args });
    return fail ? { success: false, error: 'Brevo down' } : { success: true };
  };
  return {
    sent,
    sendBookingRequestReceived: mk('requestReceived'),
    sendBookingAdminNotification: mk('adminNotification'),
    sendBookingCustomerConfirmation: mk('customerConfirmation'),
    sendBookingRescheduled: mk('rescheduled'),
    sendBookingCancelled: mk('cancelled'),
  };
}

function setup({ silent = false, admin = true } = {}) {
  const db = createFakeDb();
  const google = createFakeGoogle();
  const email = fakeEmail();
  const telegram = { alerts: [], formatBookingAlert: (b) => `alert:${b.customer_name}`,
    async sendTelegramAlert(m) { this.alerts.push(m); return { success: true }; } };
  const notify = silent ? null : createBookingNotifier({ email, telegram, logger: silentLogger });
  const lifecycle = createBookingLifecycle({
    db, calendar: createCalendarSync(google.adapter), notify, now: () => NOW, logger: silentLogger,
  });
  const identified = [];
  const deps = {
    supabase: {}, lifecycle, logger: silentLogger,
    getClientIP: () => '203.0.113.9',
    checkRateLimit: () => ({ ok: true, remaining: 2, resetAt: Date.now() + 1000 }),
    getVisitorIdFromRequest: () => '11111111-2222-4333-8444-555555555555',
    identifyVisitor: async (_sb, args) => { identified.push(args); return []; },
    findDuplicate: async () => null,
    findBookingByToken: async (token) => [...db.rows.values()].find((r) => r.lookup_token === token) || null,
    requireAdmin: async () => (admin ? { error: null } : { error: { denied: true, status: 403 } }),
  };
  return { db, google, email, telegram, deps, identified };
}

const req = (body) => ({ json: async () => body, headers: { get: () => null } });
const BOOKING = {
  customer_name: 'Karen', customer_email: 'karen@example.com', customer_phone: '416-555-0100',
  preferred_date: '2026-10-05', preferred_time: '1:30 PM', notes: 'Project Type: Basement',
};

async function seedLive(ctx, extra = {}) {
  const r = await ctx.deps.lifecycle.create({ ...BOOKING, lookup_token: 'tok-1', ...extra });
  assert.equal(r.success, true);
  ctx.email.sent.length = 0;
  ctx.telegram.alerts.length = 0;
  return r.booking;
}

// ── confirm ────────────────────────────────────────────────────────────────
test('confirm: happy path → 200, bookingId + calendarSync, emails + Telegram after persist', async () => {
  const ctx = setup();
  const res = await handleConfirm(req({ booking: BOOKING }), ctx.deps);
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(ctx.db.row(res.body.bookingId));
  assert.equal(res.body.calendarSync.status, 'synced');
  assert.equal(res.body.emailSent, true);
  assert.deepEqual(ctx.email.sent.map((e) => e.name).sort(), ['adminNotification', 'requestReceived']);
  assert.equal(ctx.email.sent[0].booking.id, res.body.bookingId, 'emails use the persisted row');
  assert.deepEqual(ctx.telegram.alerts, ['alert:Karen']);
  assert.equal(ctx.identified.length, 1);
});

test('confirm: DB insert failure → 5xx success:false, NO emails/Telegram/calendar/identify', async () => {
  const ctx = setup();
  ctx.db.failInsert = true;
  const res = await handleConfirm(req({ booking: BOOKING }), ctx.deps);
  assert.ok(res.status >= 500);
  assert.equal(res.body.success, false);
  assert.equal(res.body.bookingId, undefined);
  assert.equal(ctx.email.sent.length, 0);
  assert.equal(ctx.telegram.alerts.length, 0);
  assert.equal(ctx.google.log.length, 0);
  assert.equal(ctx.identified.length, 0);
  assert.doesNotMatch(JSON.stringify(res.body), /connection reset/, 'raw DB error not leaked');
});

test('confirm: persisted + calendar failure → 200 success, calendarSync failed, still notifies', async () => {
  const ctx = setup();
  ctx.google.faults.insert.push({ success: false, httpStatus: 503, error: 'Backend Error' });
  const res = await handleConfirm(req({ booking: BOOKING }), ctx.deps);
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.bookingId);
  assert.equal(res.body.calendarSync.status, 'failed');
  assert.match(res.body.calendarSync.error, /503/);
  assert.equal(ctx.db.row(res.body.bookingId).calendar_sync_status, 'failed');
  assert.equal(ctx.email.sent.length, 2);
});

test('confirm: identifyVisitor throwing never fails the request', async () => {
  const ctx = setup();
  ctx.deps.identifyVisitor = async () => { throw new Error('visitor_identities down'); };
  const res = await handleConfirm(req({ booking: BOOKING }), ctx.deps);
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});

test('confirm: rate limit and dedupe run before create()', async () => {
  const ctx = setup();
  ctx.deps.checkRateLimit = () => ({ ok: false, remaining: 0, resetAt: Date.now() + 60_000 });
  const limited = await handleConfirm(req({ booking: BOOKING }), ctx.deps);
  assert.equal(limited.status, 429);
  assert.ok(limited.headers['Retry-After']);

  const ctx2 = setup();
  ctx2.deps.findDuplicate = async () => ({ id: 'existing-id' });
  const dup = await handleConfirm(req({ booking: BOOKING }), ctx2.deps);
  assert.deepEqual(dup.body, { success: true, emailSent: false, bookingId: 'existing-id', duplicate: true });
  assert.equal(ctx2.db.calls.insert + ctx2.email.sent.length + ctx2.google.log.length, 0);

  const ctx3 = setup();
  ctx3.deps.findDuplicate = async () => { throw new Error('select failed'); };
  const cont = await handleConfirm(req({ booking: BOOKING }), ctx3.deps);
  assert.equal(cont.status, 200, 'dedupe lookup failure does not block booking');
  assert.equal(ctx3.db.calls.insert, 1);
});

test('confirm: missing email / bad JSON → 400, nothing written', async () => {
  const ctx = setup();
  assert.equal((await handleConfirm(req({ booking: { customer_name: 'x' } }), ctx.deps)).status, 400);
  const bad = { json: async () => { throw new SyntaxError('bad'); }, headers: { get: () => null } };
  assert.equal((await handleConfirm(bad, ctx.deps)).status, 400);
  assert.equal(ctx.db.calls.insert, 0);
});

// ── customer-action ─────────────────────────────────────────────────────────
test('customer reschedule: moves the SAME event, status pending, customer+admin emails with actor', async () => {
  const ctx = setup();
  const b = await seedLive(ctx);
  await ctx.deps.lifecycle.confirm(b.id);
  ctx.email.sent.length = 0;
  const evId = stableEventId(b.id);
  const res = await handleCustomerAction(req({
    token: 'tok-1', action: 'reschedule', preferred_date: '2026-10-09', preferred_time: '11:00 AM',
  }), ctx.deps);
  assert.equal(res.status, 200);
  assert.equal(res.body.booking.status, 'pending');
  assert.equal(res.body.calendarSync.status, 'synced');
  assert.equal(ctx.db.row(b.id).calendar_event_id, evId);
  assert.equal(ctx.google.liveEvents().length, 1, 'no duplicate event');
  assert.equal(ctx.google.events.get(evId).date, '2026-10-09');
  assert.match(ctx.google.events.get(evId).summary, /^⏳ PENDING/);
  assert.deepEqual(ctx.email.sent.map((e) => [e.name, e.actor]).sort(),
    [['adminNotification', 'customer'], ['rescheduled', 'customer']]);
  assert.equal(ctx.email.sent.find((e) => e.name === 'rescheduled').oldDate, '2026-10-05');
});

test('customer cancel: deletes the event, clears id, cancelledByCustomer emails', async () => {
  const ctx = setup();
  const b = await seedLive(ctx);
  const res = await handleCustomerAction(req({ token: 'tok-1', action: 'cancel', cancel_reason: 'moved' }), ctx.deps);
  assert.equal(res.status, 200);
  assert.equal(res.body.booking.status, 'cancelled');
  assert.equal(ctx.db.row(b.id).calendar_event_id, null);
  assert.equal(ctx.google.liveEvents().length, 0);
  const c = ctx.email.sent.find((e) => e.name === 'cancelled');
  assert.equal(c.cancelledByCustomer, true);
  assert.equal(c.reason, 'moved');
  assert.ok(ctx.email.sent.find((e) => e.name === 'adminNotification' && e.isCancellation));
});

test('customer-action: bad token 404, terminal booking 400 (legacy contract), unknown action 400', async () => {
  const ctx = setup();
  const b = await seedLive(ctx);
  assert.equal((await handleCustomerAction(req({ token: 'nope', action: 'cancel' }), ctx.deps)).status, 404);
  assert.equal((await handleCustomerAction(req({ action: 'cancel' }), ctx.deps)).status, 400);
  assert.equal((await handleCustomerAction(req({ token: 'tok-1', action: 'explode' }), ctx.deps)).status, 400);
  await ctx.deps.lifecycle.cancel(b.id, '', 'admin');
  ctx.email.sent.length = 0;
  const again = await handleCustomerAction(req({ token: 'tok-1', action: 'reschedule', preferred_date: '2026-10-09' }), ctx.deps);
  assert.equal(again.status, 400);
  assert.equal(ctx.email.sent.length, 0);
});

// ── admin-action ────────────────────────────────────────────────────────────
test('admin confirm: drops PENDING prefix on same event, emailSent + calendarSync returned', async () => {
  const ctx = setup();
  const b = await seedLive(ctx);
  const res = await handleAdminAction(req({ bookingId: b.id, action: 'confirm' }), ctx.deps);
  assert.equal(res.status, 200);
  assert.equal(res.body.booking.status, 'confirmed');
  assert.equal(res.body.emailSent, true);
  assert.equal(res.body.calendarSync.status, 'synced');
  assert.doesNotMatch(ctx.google.events.get(stableEventId(b.id)).summary, /PENDING/);
  assert.deepEqual(ctx.email.sent.map((e) => [e.name, e.actor]), [['customerConfirmation', 'admin']]);
});

test('admin reschedule: stays confirmed, customer email only (no admin notification)', async () => {
  const ctx = setup();
  const b = await seedLive(ctx);
  const res = await handleAdminAction(req({ bookingId: b.id, action: 'reschedule', preferred_date: '2026-10-12', preferred_time: '5:00 PM' }), ctx.deps);
  assert.equal(res.body.booking.status, 'confirmed');
  assert.equal(ctx.google.events.get(stableEventId(b.id)).date, '2026-10-12');
  assert.deepEqual(ctx.email.sent.map((e) => [e.name, e.actor]), [['rescheduled', 'admin']]);
});

test('admin cancel ack rule: failed delete keeps event id + surfaces failed; 404 clears it', async () => {
  const ctx = setup();
  const b = await seedLive(ctx);
  const evId = stableEventId(b.id);
  ctx.google.faults.delete.push({ success: false, httpStatus: 500, error: 'Backend Error' });
  const res = await handleAdminAction(req({ bookingId: b.id, action: 'cancel', cancel_reason: 'no-show' }), ctx.deps);
  assert.equal(res.status, 200, 'DB change persisted → success');
  assert.equal(res.body.booking.status, 'cancelled');
  assert.equal(res.body.calendarSync.status, 'failed');
  assert.equal(ctx.db.row(b.id).calendar_event_id, evId, 'id NOT cleared without acknowledged delete');
  assert.deepEqual(ctx.email.sent.map((e) => [e.name, e.cancelledByCustomer]), [['cancelled', undefined]]);
  assert.match(ctx.db.row(b.id).notes, /^Cancelled: no-show/);

  // Retry with Google reporting the event already gone → cleared.
  ctx.google.events.delete(evId);
  const retry = await ctx.deps.lifecycle.retrySync(b.id);
  assert.equal(retry.calendarSync.status, 'absent');
  assert.equal(ctx.db.row(b.id).calendar_event_id, null);
});

test('admin complete via API: status completed, no calendar call, no email; cancelled → 409', async () => {
  const ctx = setup();
  const b = await seedLive(ctx);
  await ctx.deps.lifecycle.confirm(b.id);
  ctx.email.sent.length = 0;
  const calls = ctx.google.log.length;
  const rev = ctx.db.row(b.id).revision;
  const res = await handleAdminAction(req({ bookingId: b.id, action: 'complete' }), ctx.deps);
  assert.equal(res.status, 200);
  assert.equal(res.body.booking.status, 'completed');
  assert.equal(res.body.calendarSync, null);
  assert.equal(res.body.emailSent, false);
  assert.equal(ctx.db.row(b.id).revision, rev + 1);
  assert.equal(ctx.google.log.length, calls, 'calendar untouched');
  assert.equal(ctx.email.sent.length, 0);

  const c = await seedLive(ctx, { lookup_token: 'tok-2' });
  await ctx.deps.lifecycle.cancel(c.id, '', 'admin');
  assert.equal((await handleAdminAction(req({ bookingId: c.id, action: 'complete' }), ctx.deps)).status, 409);
});

test('admin-action: requireAdmin denial is passed through before any read/write', async () => {
  const ctx = setup({ admin: false });
  const b = await seedLive(setup()); // row in another store; irrelevant
  const before = ctx.db.calls.get;
  const res = await handleAdminAction(req({ bookingId: b.id, action: 'complete' }), ctx.deps);
  assert.deepEqual(res.passthrough, { denied: true, status: 403 });
  assert.equal(ctx.db.calls.get, before);
  assert.equal((await handleLegacyReschedule(req({ bookingId: b.id, preferred_date: '2026-10-09' }), ctx.deps)).passthrough.status, 403);
});

test('admin-action: missing id / unknown action / not found', async () => {
  const ctx = setup();
  assert.equal((await handleAdminAction(req({ action: 'confirm' }), ctx.deps)).status, 400);
  const b = await seedLive(ctx);
  assert.equal((await handleAdminAction(req({ bookingId: b.id, action: 'delete' }), ctx.deps)).status, 400);
  assert.equal((await handleAdminAction(req({ bookingId: b.id, action: 'reschedule' }), ctx.deps)).status, 400);
  assert.equal((await handleAdminAction(req({ bookingId: 'missing', action: 'confirm' }), ctx.deps)).status, 404);
});

// ── legacy /api/booking/reschedule ──────────────────────────────────────────
test('legacy reschedule: routes through lifecycle (event moves, revision bump), no emails, deprecated flag', async () => {
  const ctx = setup({ silent: true });
  const b = await seedLive(ctx);
  const rev = ctx.db.row(b.id).revision;
  const res = await handleLegacyReschedule(req({ bookingId: b.id, preferred_date: '2026-10-20', preferred_time: '12:00 PM' }), ctx.deps);
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.deprecated, true);
  assert.equal(res.body.booking.status, 'confirmed');
  assert.equal(ctx.db.row(b.id).revision, rev + 1);
  assert.equal(ctx.google.events.get(stableEventId(b.id)).date, '2026-10-20');
  assert.equal(ctx.email.sent.length, 0);
  assert.equal((await handleLegacyReschedule(req({ bookingId: b.id }), ctx.deps)).status, 400);
});

// ── send-followup / updated_at interplay (decision 8e) ──────────────────────
test('send-followup writes only next_follow_up_date (no updated_at, no revision) on bookings', () => {
  // Behaviour is also exercised through the real handler in send-followup.test.mjs.
  const src = readFileSync(new URL('../../lib/followup/send-followup.js', import.meta.url), 'utf8');
  const m = src.match(/\.from\(LEAD_TABLES\[leadSource\]\)\s*\.update\(\{([^}]*)\}\)/);
  assert.ok(m, 'send-followup lead update found');
  assert.match(m[1], /next_follow_up_date/);
  assert.doesNotMatch(m[1], /updated_at|revision|status/);
});

test('concurrent send-followup write: no revision/updated_at bump → no conflict; a bump once → single retry absorbs it', async () => {
  // (a) Field-only write (what send-followup actually does): lifecycle proceeds first try.
  const ctx = setup();
  const b = await seedLive(ctx);
  let fired = false;
  ctx.db.hooks.beforeUpdate = async (id) => {
    if (fired) return;
    fired = true;
    const cur = ctx.db.rows.get(id);
    ctx.db.rows.set(id, { ...cur, next_follow_up_date: '2026-10-01' }); // no revision / updated_at change
  };
  const updatesBefore = ctx.db.calls.update;
  const r1 = await handleAdminAction(req({ bookingId: b.id, action: 'confirm' }), ctx.deps);
  assert.equal(r1.status, 200);
  assert.equal(ctx.db.row(b.id).next_follow_up_date, '2026-10-01', 'follow-up date preserved');
  assert.equal(ctx.db.calls.update - updatesBefore, 2, 'one state write + one sync write, no retry');

  // (b) Worst case: the concurrent write DID bump the guard once → exactly one retry, then success.
  const ctx2 = setup();
  const b2 = await seedLive(ctx2);
  let bumped = false;
  ctx2.db.hooks.beforeUpdate = async (id) => {
    if (bumped) return;
    bumped = true;
    ctx2.db.external(id, { next_follow_up_date: '2026-10-02', updated_at: 'later' });
  };
  const r2 = await handleAdminAction(req({ bookingId: b2.id, action: 'confirm' }), ctx2.deps);
  assert.equal(r2.status, 200);
  assert.equal(ctx2.db.row(b2.id).status, 'confirmed');
  assert.equal(ctx2.db.row(b2.id).next_follow_up_date, '2026-10-02');
  assert.equal(ctx2.email.sent.length, 1, 'notified once despite retry');
});

// ── admin-action retry_sync (A4) ────────────────────────────────────────────
test('admin retry_sync: after a calendar outage, creates the event from current state, sends NO email', async () => {
  const ctx = setup();
  ctx.google.faults.insert.push({ success: false, httpStatus: 503, error: 'Backend Error' });
  const b = await seedLive(ctx);
  assert.equal(ctx.db.row(b.id).calendar_sync_status, 'failed');
  assert.equal(ctx.google.liveEvents().length, 0);

  const res = await handleAdminAction(req({ bookingId: b.id, action: 'retry_sync' }), ctx.deps);
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.action, 'retry_sync');
  assert.equal(res.body.emailSent, false);
  assert.equal(res.body.calendarSync.status, 'synced');
  assert.equal(res.body.calendarSync.eventId, stableEventId(b.id));
  assert.equal(ctx.google.liveEvents().length, 1);
  assert.equal(ctx.db.row(b.id).calendar_sync_status, 'synced');
  assert.equal(ctx.db.row(b.id).revision, b.revision, 'retry does not bump revision');
  assert.equal(ctx.email.sent.length, 0, 'no customer/admin email');
  assert.equal(ctx.telegram.alerts.length, 0, 'no Telegram');
});

test('admin retry_sync: still failing → 200 with calendarSync failed + sanitized error; cancelled booking event never recreated', async () => {
  const ctx = setup();
  const b = await seedLive(ctx);
  ctx.google.faults.patch.push('throw');
  const res = await handleAdminAction(req({ bookingId: b.id, action: 'retry_sync' }), ctx.deps);
  assert.equal(res.status, 200);
  assert.equal(res.body.calendarSync.status, 'failed');
  assert.doesNotMatch(res.body.calendarSync.error, /ya29|SECRET/);
  assert.equal(ctx.email.sent.length, 0);

  await ctx.deps.lifecycle.cancel(b.id, '', 'admin');
  ctx.email.sent.length = 0;
  const inserts = ctx.google.log.filter(([op]) => op === 'insert').length;
  const r2 = await handleAdminAction(req({ bookingId: b.id, action: 'retry_sync' }), ctx.deps);
  assert.equal(r2.status, 200);
  assert.equal(r2.body.calendarSync.status, 'absent');
  assert.equal(ctx.google.log.filter(([op]) => op === 'insert').length, inserts, 'no insert for cancelled');
  assert.equal(ctx.google.liveEvents().length, 0);
  assert.equal(ctx.email.sent.length, 0);
});

test('admin retry_sync: requireAdmin enforced; unknown booking → 404', async () => {
  const denied = setup({ admin: false });
  const b = await seedLive(denied);
  const calls = denied.google.log.length;
  const r = await handleAdminAction(req({ bookingId: b.id, action: 'retry_sync' }), denied.deps);
  assert.deepEqual(r.passthrough, { denied: true, status: 403 });
  assert.equal(denied.google.log.length, calls, 'no calendar call when denied');

  const ctx = setup();
  const nf = await handleAdminAction(req({ bookingId: 'nope', action: 'retry_sync' }), ctx.deps);
  assert.equal(nf.status, 404);
  assert.equal(nf.body.success, false);
});
