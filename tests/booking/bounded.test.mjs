// R1 (red-team BLOCKER): once the DB write commits, the request ALWAYS returns,
// even if Google / email / Telegram / identifyVisitor never settle.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBookingLifecycle } from '../../lib/booking/lifecycle.js';
import { createFakeDb, createFakeNotify, silentLogger } from './fakes.mjs';

const NOW = new Date('2026-09-23T12:00:00Z');
const never = () => new Promise(() => {});
const REQUEST = {
  customer_name: 'Karen', customer_email: 'karen@example.com',
  preferred_date: '2026-10-05', preferred_time: '1:30 PM',
};

test('R1: never-settling ensureEvent → create() resolves persisted + failed sync, notifications attempted', { timeout: 3000 }, async () => {
  const db = createFakeDb();
  const notify = createFakeNotify();
  const svc = createBookingLifecycle({
    db, calendar: { ensureEvent: never, deleteEvent: never }, notify,
    now: () => NOW, logger: silentLogger, timeouts: { syncMs: 50, notifyMs: 50, recordMs: 50 },
  });
  const r = await svc.create(REQUEST);
  assert.equal(r.success, true);
  assert.ok(db.row(r.booking.id), 'row persisted');
  assert.ok(['failed', 'pending'].includes(r.calendarSync.status));
  assert.match(r.calendarSync.error, /timed out/);
  assert.deepEqual(notify.sent.map((n) => n.type), ['created']);
});

import { createCalendarSync } from '../../lib/booking/calendar-sync.js';
import { createBookingNotifier } from '../../lib/booking/notify.js';
import { handleConfirm } from '../../lib/booking/handlers.js';
import { withDeadline, resolveBookingTimeouts, DEFAULT_BOOKING_TIMEOUTS } from '../../lib/booking/deadline.js';
import { createFakeGoogle } from './fakes.mjs';

const FAST = { syncMs: 60, notifyMs: 60, recordMs: 60, senderMs: 40, identifyMs: 40 };

test('R1: sync timeout is recorded durably (failed + error) on the row', { timeout: 3000 }, async () => {
  const db = createFakeDb();
  const svc = createBookingLifecycle({
    db, calendar: { ensureEvent: never, deleteEvent: never }, notify: null,
    now: () => NOW, logger: silentLogger, timeouts: FAST,
  });
  const r = await svc.create(REQUEST);
  const row = db.row(r.booking.id);
  assert.equal(row.calendar_sync_status, 'failed');
  assert.match(row.calendar_sync_error, /timed out/);
  assert.equal(row.status, 'pending');
});

test('R1: the AbortSignal reaches the Google adapter and aborts it at the deadline', { timeout: 3000 }, async () => {
  const db = createFakeDb();
  const seen = [];
  const hang = (label) => (...args) => new Promise((resolve) => {
    const { signal } = args.at(-1) || {};
    seen.push([label, !!signal]);
    signal?.addEventListener('abort', () => resolve({ success: false, reason: 'aborted', httpStatus: null, error: 'aborted' }));
  });
  const adapter = { insert: hang('insert'), get: hang('get'), patch: hang('patch'), delete: hang('delete') };
  const svc = createBookingLifecycle({
    db, calendar: createCalendarSync(adapter), notify: null, now: () => NOW, logger: silentLogger, timeouts: FAST,
  });
  const r = await svc.create(REQUEST);
  assert.equal(r.success, true);
  assert.deepEqual(seen, [['insert', true]]);
  assert.equal(db.row(r.booking.id).calendar_sync_status, 'failed');
});

test('R1: a Google success that lands AFTER the deadline writes nothing (no late overwrite)', { timeout: 3000 }, async () => {
  const db = createFakeDb();
  let release;
  const late = new Promise((res) => { release = res; });
  const calendar = {
    ensureEvent: async (row) => { await late; return { ok: true, eventId: 'late1', status: 'synced', error: null }; },
    deleteEvent: never,
  };
  const svc = createBookingLifecycle({ db, calendar, notify: null, now: () => NOW, logger: silentLogger, timeouts: FAST });
  const r = await svc.create(REQUEST);
  const updates = db.calls.update;
  release();
  await new Promise((res) => setTimeout(res, 20));
  assert.equal(db.calls.update, updates, 'aborted pass does not write');
  assert.equal(db.row(r.booking.id).calendar_sync_status, 'failed');
});

test('R1: retrySync is bounded too', { timeout: 3000 }, async () => {
  const db = createFakeDb();
  const b = db.seed({ ...REQUEST });
  const svc = createBookingLifecycle({
    db, calendar: { ensureEvent: never, deleteEvent: never }, notify: null, now: () => NOW, logger: silentLogger, timeouts: FAST,
  });
  const r = await svc.retrySync(b.id);
  assert.equal(r.success, true);
  assert.equal(r.calendarSync.status, 'failed');
});

test('R1: never-settling notify → create() still resolves; notification reported timedOut', { timeout: 3000 }, async () => {
  const db = createFakeDb();
  const svc = createBookingLifecycle({
    db, calendar: createCalendarSync(createFakeGoogle().adapter), notify: never,
    now: () => NOW, logger: silentLogger, timeouts: FAST,
  });
  const r = await svc.create(REQUEST);
  assert.equal(r.success, true);
  assert.equal(r.calendarSync.status, 'synced');
  assert.deepEqual([r.notifications[0].ok, r.notifications[0].timedOut], [false, true]);
});

test('R1: notifier bounds each sender; one hung email does not block the others or Telegram', { timeout: 3000 }, async () => {
  const ok = async () => ({ success: true });
  const email = {
    sendBookingRequestReceived: never, sendBookingAdminNotification: ok,
    sendBookingCustomerConfirmation: ok, sendBookingRescheduled: ok, sendBookingCancelled: ok,
  };
  const telegram = { formatBookingAlert: () => 'x', sendTelegramAlert: ok };
  const notify = createBookingNotifier({ email, telegram, logger: silentLogger, timeouts: FAST });
  const r = await notify('created', { booking: { id: 'b' } });
  assert.deepEqual(r, { customerEmailSent: false, adminEmailSent: true, telegramSent: true });
  const t2 = createBookingNotifier({ email: { ...email, sendBookingRequestReceived: ok }, telegram: { ...telegram, sendTelegramAlert: never }, logger: silentLogger, timeouts: FAST });
  assert.deepEqual(await t2('created', { booking: { id: 'b' } }), { customerEmailSent: true, adminEmailSent: true, telegramSent: false });
});

test('R1: confirm route answers 200 with bookingId when identifyVisitor never settles', { timeout: 3000 }, async () => {
  const db = createFakeDb();
  const lifecycle = createBookingLifecycle({
    db, calendar: createCalendarSync(createFakeGoogle().adapter), notify: null, now: () => NOW, logger: silentLogger, timeouts: FAST,
  });
  const deps = {
    supabase: {}, lifecycle, logger: silentLogger, timeouts: FAST,
    getClientIP: () => '203.0.113.9', checkRateLimit: () => ({ ok: true }),
    getVisitorIdFromRequest: () => 'v1', identifyVisitor: never, findDuplicate: async () => null,
  };
  const res = await handleConfirm({ json: async () => ({ booking: REQUEST }), headers: { get: () => null } }, deps);
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(db.row(res.body.bookingId));
});

test('deadline helper: resolves, times out, aborts controller; budgets resolve override > env > default', async () => {
  assert.equal(await withDeadline(async () => 7, 50, 'x'), 7);
  const c = new AbortController();
  await assert.rejects(withDeadline(never, 10, 'hang', { controller: c }), /hang timed out after 10ms/);
  assert.equal(c.signal.aborted, true);
  await assert.rejects(withDeadline(() => { throw new Error('sync boom'); }, 50), /sync boom/);
  assert.deepEqual(resolveBookingTimeouts({}, {}), { ...DEFAULT_BOOKING_TIMEOUTS });
  const t = resolveBookingTimeouts({ syncMs: 5 }, { BOOKING_TIMEOUT_SYNC_MS: '9', BOOKING_TIMEOUT_NOTIFY_MS: '11', BOOKING_TIMEOUT_RECORD_MS: 'junk' });
  assert.deepEqual([t.syncMs, t.notifyMs, t.recordMs], [5, 11, DEFAULT_BOOKING_TIMEOUTS.recordMs]);
  const d = DEFAULT_BOOKING_TIMEOUTS;
  assert.ok(d.syncMs + d.recordMs + d.notifyMs + d.identifyMs < 10000, 'worst case under a 10 s function limit');
});
