import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBookingLifecycle } from '../../lib/booking/lifecycle.js';
import { createCalendarSync, stableEventId } from '../../lib/booking/calendar-sync.js';
import { createFakeDb, createFakeGoogle, createFakeNotify, silentLogger } from './fakes.mjs';

const NOW = new Date('2026-09-23T12:00:00Z');

function setup({ notifyThrows = false } = {}) {
  const db = createFakeDb();
  const google = createFakeGoogle();
  const notify = createFakeNotify({ throws: notifyThrows });
  const svc = createBookingLifecycle({
    db, calendar: createCalendarSync(google.adapter), notify, now: () => NOW, logger: silentLogger,
  });
  return { db, google, notify, svc };
}

const REQUEST = {
  customer_name: 'Karen', customer_email: 'karen@example.com', customer_phone: '416-555-0100',
  preferred_date: '2026-10-05', preferred_time: '1:30 PM', service_type: 'free_measurement',
};

test('create: persists pending, creates event under stable id, then notifies', async () => {
  const { db, google, notify, svc } = setup();
  const r = await svc.create(REQUEST);
  assert.equal(r.success, true);
  const row = db.row(r.booking.id);
  assert.equal(row.status, 'pending');
  assert.equal(row.revision, 1);
  assert.equal(row.calendar_event_id, stableEventId(row.id));
  assert.equal(row.calendar_sync_status, 'synced');
  assert.match(google.events.get(row.calendar_event_id).summary, /^⏳ PENDING — /);
  assert.equal(google.events.get(row.calendar_event_id).attendees, undefined);
  assert.deepEqual(notify.sent.map((n) => n.type), ['created']);
  assert.equal(r.calendarSync.status, 'synced');
});

test('create: DB insert failure → success:false, NO calendar call, NO notification', async () => {
  const { db, google, notify, svc } = setup();
  db.failInsert = true;
  const r = await svc.create(REQUEST);
  assert.equal(r.success, false);
  assert.equal(r.code, 'db_error');
  assert.equal(r.httpStatus, 500);
  assert.equal(google.log.length, 0);
  assert.equal(notify.sent.length, 0);
  assert.equal(db.rows.size, 0);
});

test('create: invalid input rejected before any write', async () => {
  const { db, google, notify, svc } = setup();
  assert.equal((await svc.create({ ...REQUEST, customer_email: ' ' })).code, 'invalid_input');
  assert.equal((await svc.create({ ...REQUEST, preferred_date: '2026-02-31' })).code, 'invalid_input');
  assert.equal(db.calls.insert + google.log.length + notify.sent.length, 0);
});

for (const [label, fault] of [
  ['thrown error', 'throw'],
  ['{success:false} return', { success: false, httpStatus: 503, error: 'Service Unavailable' }],
]) {
  test(`create: calendar ${label} → booking persisted, success, calendarSync failed, still notified`, async () => {
    const { db, google, notify, svc } = setup();
    google.faults.insert.push(fault);
    const r = await svc.create(REQUEST);
    assert.equal(r.success, true);
    assert.equal(r.calendarSync.status, 'failed');
    assert.ok(r.calendarSync.error);
    assert.doesNotMatch(r.calendarSync.error, /ya29|SECRET/);
    const row = db.row(r.booking.id);
    assert.equal(row.status, 'pending');
    assert.equal(row.calendar_sync_status, 'failed');
    assert.equal(row.calendar_sync_error, r.calendarSync.error);
    assert.equal(row.calendar_event_id, null);
    assert.deepEqual(notify.sent.map((n) => n.type), ['created']);
  });
}

test('notification failure never fails a persisted booking', async () => {
  const { db, svc } = setup({ notifyThrows: true });
  const r = await svc.create(REQUEST);
  assert.equal(r.success, true);
  assert.equal(r.notifications[0].ok, false);
  assert.ok(db.row(r.booking.id));
});

test('admin confirm: same event, pending prefix dropped, no second event', async () => {
  const { db, google, notify, svc } = setup();
  const { booking } = await svc.create(REQUEST);
  const r = await svc.confirm(booking.id);
  assert.equal(r.success, true);
  const row = db.row(booking.id);
  assert.equal(row.status, 'confirmed');
  assert.equal(row.revision, 2);
  assert.equal(google.events.size, 1);
  assert.equal(google.log.filter((l) => l[0] === 'insert').length, 1);
  const evt = google.events.get(row.calendar_event_id);
  assert.doesNotMatch(evt.summary, /PENDING/);
  assert.deepEqual(notify.sent.map((n) => n.type), ['created', 'confirmed']);
});

test('customer reschedule: status pending, SAME event moved, pending title kept', async () => {
  const { db, google, notify, svc } = setup();
  const { booking } = await svc.create(REQUEST);
  await svc.confirm(booking.id);
  const eventId = db.row(booking.id).calendar_event_id;
  const r = await svc.reschedule(booking.id, { date: '2026-10-09', time: '11:00 AM' }, 'customer');
  assert.equal(r.success, true);
  const row = db.row(booking.id);
  assert.equal(row.status, 'pending');
  assert.equal(row.calendar_event_id, eventId);
  assert.equal(google.events.size, 1);
  const evt = google.events.get(eventId);
  assert.equal(evt.date, '2026-10-09');
  assert.equal(evt.time, '11:00 AM');
  assert.match(evt.summary, /^⏳ PENDING — /);
  const n = notify.sent.at(-1);
  assert.deepEqual([n.type, n.actor, n.payload.oldDate, n.status], ['rescheduled', 'customer', '2026-10-05', 'pending']);
});

test('admin reschedule stays confirmed and moves same event', async () => {
  const { db, google, svc } = setup();
  const { booking } = await svc.create(REQUEST);
  await svc.confirm(booking.id);
  await svc.reschedule(booking.id, { date: '2026-10-10', time: '5:00 PM' }, 'admin');
  const row = db.row(booking.id);
  assert.equal(row.status, 'confirmed');
  assert.equal(google.events.size, 1);
  assert.doesNotMatch(google.events.get(row.calendar_event_id).summary, /PENDING/);
});

test('customer reschedule when event is missing → created idempotently under stable id, id persisted', async () => {
  const { db, google, svc } = setup();
  const b = db.seed({ ...REQUEST, calendar_event_id: null });
  const r = await svc.reschedule(b.id, { date: '2026-10-12', time: '12:00 PM' }, 'customer');
  assert.equal(r.calendarSync.status, 'synced');
  assert.equal(db.row(b.id).calendar_event_id, stableEventId(b.id));
  assert.equal(google.liveEvents().length, 1);
});

test('legacy stored event id is preserved and moved (not replaced)', async () => {
  const { db, google, svc } = setup();
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: 'abc123legacy' });
  google.events.set('abc123legacy', { id: 'abc123legacy', status: 'confirmed', date: '2026-10-05' });
  await svc.reschedule(b.id, { date: '2026-10-14', time: '1:00 PM' }, 'customer');
  assert.equal(db.row(b.id).calendar_event_id, 'abc123legacy');
  assert.equal(google.events.get('abc123legacy').date, '2026-10-14');
  assert.equal(google.log.filter((l) => l[0] === 'insert').length, 0);
});

test('reschedule validation: bad date/time, past date (customer), terminal status', async () => {
  const { db, google, notify, svc } = setup();
  const b = db.seed({ ...REQUEST });
  assert.equal((await svc.reschedule(b.id, { date: 'next tuesday' }, 'customer')).code, 'invalid_input');
  assert.equal((await svc.reschedule(b.id, { date: '2026-10-10', time: '25:00 PM' }, 'customer')).code, 'invalid_input');
  assert.equal((await svc.reschedule(b.id, { date: '2026-09-01', time: '1:00 PM' }, 'customer')).code, 'invalid_input');
  const c = db.seed({ ...REQUEST, status: 'cancelled' });
  const r = await svc.reschedule(c.id, { date: '2026-10-10', time: '1:00 PM' }, 'customer');
  assert.deepEqual([r.code, r.httpStatus], ['invalid_state', 409]);
  assert.equal((await svc.reschedule('missing', { date: '2026-10-10' }, 'admin')).code, 'not_found');
  assert.equal(db.calls.update + google.log.length + notify.sent.length, 0);
});

test('cancel: acknowledged delete clears stored id', async () => {
  const { db, google, notify, svc } = setup();
  const { booking } = await svc.create(REQUEST);
  const eventId = db.row(booking.id).calendar_event_id;
  const r = await svc.cancel(booking.id, 'moving house', 'customer');
  assert.equal(r.success, true);
  assert.equal(r.calendarSync.status, 'absent');
  const row = db.row(booking.id);
  assert.equal(row.status, 'cancelled');
  assert.equal(row.calendar_event_id, null);
  assert.match(row.notes, /^Customer cancelled: moving house/);
  assert.equal(google.events.get(eventId).status, 'cancelled');
  assert.deepEqual(notify.sent.map((n) => n.type), ['created', 'cancelled']);
});

for (const [label, prep] of [
  ['404 (already gone)', (g, id) => g.events.delete(id)],
  ['410 (already deleted)', (g, id) => { g.events.get(id).status = 'cancelled'; }],
]) {
  test(`cancel: delete ${label} counts as absent → id cleared`, async () => {
    const { db, google, svc } = setup();
    const { booking } = await svc.create(REQUEST);
    prep(google, db.row(booking.id).calendar_event_id);
    const r = await svc.cancel(booking.id, '', 'admin');
    assert.equal(r.calendarSync.status, 'absent');
    assert.equal(db.row(booking.id).calendar_event_id, null);
    assert.equal(db.row(booking.id).calendar_sync_status, 'synced');
  });
}

test('cancel: delete 500 → booking cancelled, id KEPT, sync failed; retrySync later clears it', async () => {
  const { db, google, notify, svc } = setup();
  const { booking } = await svc.create(REQUEST);
  const eventId = db.row(booking.id).calendar_event_id;
  google.faults.delete.push({ success: false, httpStatus: 500, error: 'Backend Error' });
  const r = await svc.cancel(booking.id, 'x', 'admin');
  assert.equal(r.success, true);
  assert.equal(r.calendarSync.status, 'failed');
  assert.equal(db.row(booking.id).status, 'cancelled');
  assert.equal(db.row(booking.id).calendar_event_id, eventId);
  assert.equal(db.row(booking.id).calendar_sync_status, 'failed');
  const sent = notify.sent.length;
  const retry = await svc.retrySync(booking.id);
  assert.equal(retry.calendarSync.status, 'absent');
  assert.equal(db.row(booking.id).calendar_event_id, null);
  assert.equal(google.liveEvents().length, 0);
  assert.equal(notify.sent.length, sent, 'retrySync sends no email');
});

test('timeout-after-create then retry: 409 path adopts the existing event, no duplicate', async () => {
  const { db, google, svc } = setup();
  google.faults.insert.push('timeoutAfterCreate');
  const { booking, calendarSync } = await svc.create(REQUEST);
  assert.equal(calendarSync.status, 'failed');
  assert.equal(db.row(booking.id).calendar_event_id, null);
  assert.equal(google.events.size, 1, 'Google actually created it');
  const r = await svc.retrySync(booking.id);
  assert.equal(r.calendarSync.status, 'synced');
  assert.equal(db.row(booking.id).calendar_event_id, stableEventId(booking.id));
  assert.equal(google.events.size, 1);
  assert.deepEqual(google.log.map((l) => l[0]), ['insert', 'insert', 'get', 'patch']);
});

test('409 on a cancelled Google event while booking is live → restored to confirmed', async () => {
  const { db, google, svc } = setup();
  const b = db.seed({ ...REQUEST, calendar_event_id: null });
  const sid = stableEventId(b.id);
  google.events.set(sid, { id: sid, status: 'cancelled', date: '2026-01-01' });
  const r = await svc.retrySync(b.id);
  assert.equal(r.calendarSync.status, 'synced');
  assert.equal(google.events.get(sid).status, 'confirmed');
  assert.equal(google.events.get(sid).date, '2026-10-05');
});

test('stale reschedule is not re-applied: sync reconciles the LATEST revision', async () => {
  const { db, google, svc } = setup();
  const { booking } = await svc.create(REQUEST);
  let fired = false;
  google.hooks.afterPatch = () => {
    if (fired) return;
    fired = true; // a second reschedule lands while the first one is talking to Google
    db.external(booking.id, { preferred_date: '2026-10-20', preferred_time: '5:00 PM', status: 'pending' });
  };
  const r = await svc.reschedule(booking.id, { date: '2026-10-15', time: '11:30 AM' }, 'customer');
  assert.equal(r.success, true);
  const evt = google.events.get(db.row(booking.id).calendar_event_id);
  assert.equal(evt.date, '2026-10-20', 'calendar ends on the newest DB state');
  assert.equal(evt.time, '5:00 PM');
  assert.equal(db.row(booking.id).preferred_date, '2026-10-20');
  assert.equal(db.row(booking.id).calendar_sync_status, 'synced');
  assert.equal(google.events.size, 1);
});

test('cancel landing mid-sync wins: event deleted, not left live', async () => {
  const { db, google, svc } = setup();
  const { booking } = await svc.create(REQUEST);
  let fired = false;
  google.hooks.afterPatch = () => {
    if (fired) return;
    fired = true;
    db.external(booking.id, { status: 'cancelled' });
  };
  await svc.reschedule(booking.id, { date: '2026-10-15', time: '11:30 AM' }, 'customer');
  assert.equal(google.liveEvents().length, 0);
  assert.equal(db.row(booking.id).calendar_event_id, null);
});

test('retrySync on a cancelled booking never recreates its event and sends no email', async () => {
  const { db, google, notify, svc } = setup();
  const b = db.seed({ ...REQUEST, status: 'cancelled', calendar_event_id: null, calendar_sync_status: 'failed' });
  const r = await svc.retrySync(b.id);
  assert.equal(r.success, true);
  assert.equal(r.calendarSync.status, 'absent');
  assert.equal(google.log.filter((l) => l[0] === 'insert' || l[0] === 'patch').length, 0);
  assert.equal(google.liveEvents().length, 0);
  assert.equal(notify.sent.length, 0);
  assert.deepEqual(r.notifications, []);
});

test('retrySync after calendar outage creates the event without re-sending email', async () => {
  const { db, google, notify, svc } = setup();
  google.faults.insert.push({ success: false, httpStatus: 503, error: 'down' });
  const { booking } = await svc.create(REQUEST);
  assert.equal(notify.sent.length, 1);
  const r = await svc.retrySync(booking.id);
  assert.equal(r.calendarSync.status, 'synced');
  assert.equal(db.row(booking.id).calendar_sync_error, null);
  assert.equal(notify.sent.length, 1);
  assert.equal(db.row(booking.id).revision, 1, 'sync does not bump revision');
});

test('complete: status flip + revision only — no calendar, no notification', async () => {
  const { db, google, notify, svc } = setup();
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: 'evtkeep1', revision: 4 });
  const r = await svc.complete(b.id);
  assert.equal(r.success, true);
  assert.equal(r.calendarSync, null);
  assert.deepEqual(r.notifications, []);
  const row = db.row(b.id);
  assert.equal(row.status, 'completed');
  assert.equal(row.revision, 5);
  assert.equal(row.calendar_event_id, 'evtkeep1');
  assert.equal(google.log.length, 0);
  assert.equal(notify.sent.length, 0);
});

test('optimistic concurrency: one conflict is retried transparently', async () => {
  const { db, svc } = setup();
  const b = db.seed({ ...REQUEST });
  let n = 0;
  db.hooks.beforeUpdate = (id) => { if (n++ === 0) db.external(id, { notes: 'admin note' }); };
  const r = await svc.confirm(b.id);
  assert.equal(r.success, true);
  assert.equal(db.row(b.id).status, 'confirmed');
  assert.equal(db.row(b.id).notes, 'admin note');
});

test('optimistic concurrency: persistent conflict → clear conflict error, no side effects', async () => {
  const { db, google, notify, svc } = setup();
  const b = db.seed({ ...REQUEST });
  db.hooks.beforeUpdate = (id) => db.external(id, { notes: 'racing' });
  const r = await svc.cancel(b.id, 'x', 'customer');
  assert.deepEqual([r.success, r.code, r.httpStatus], [false, 'conflict', 409]);
  assert.match(r.error, /changed at the same time/);
  assert.equal(db.row(b.id).status, 'pending');
  assert.equal(google.log.length, 0);
  assert.equal(notify.sent.length, 0);
});

test('DB update failure on a transition → success:false, no calendar, no notify', async () => {
  const { db, google, notify, svc } = setup();
  const b = db.seed({ ...REQUEST });
  db.update = async () => ({ data: null, error: { message: 'connection refused' }, conflict: false });
  const r = await svc.confirm(b.id);
  assert.deepEqual([r.success, r.code], [false, 'db_error']);
  assert.equal(google.log.length + notify.sent.length, 0);
});
