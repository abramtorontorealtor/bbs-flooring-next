// R5 (stale notifications) + R6 (duplicate identical transitions): real concurrent lifecycle calls.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBookingLifecycle } from '../../lib/booking/lifecycle.js';
import { createCalendarSync } from '../../lib/booking/calendar-sync.js';
import { createFakeDb, createFakeGoogle, createFakeNotify, silentLogger } from './fakes.mjs';

const REQUEST = { customer_name: 'K', customer_email: 'k@example.com', preferred_date: '2026-10-05', preferred_time: '1:30 PM' };
const tick = () => new Promise((r) => setImmediate(r));
async function until(c) { for (let i = 0; i < 2000 && !c(); i++) await tick(); assert.ok(c()); }
function setup() {
  const db = createFakeDb(); const google = createFakeGoogle(); const notify = createFakeNotify();
  let t = Date.parse('2026-09-23T12:00:00Z');
  const svc = createBookingLifecycle({ db, calendar: createCalendarSync(google.adapter), notify, now: () => new Date(t++), logger: silentLogger });
  return { db, google, notify, svc };
}

test('R6: two concurrent confirms → one confirmation email, revision bumped once', async () => {
  const { db, notify, svc } = setup();
  const { booking } = await svc.create(REQUEST);
  const [a, b] = await Promise.all([svc.confirm(booking.id), svc.confirm(booking.id)]);
  assert.equal(a.success && b.success, true);
  assert.deepEqual(notify.sent.map((n) => n.type), ['created', 'confirmed']);
  assert.equal(db.row(booking.id).revision, 2);
  assert.equal([a, b].filter((r) => r.noop).length, 1);
});

test('R6: identical admin reschedule → no email, no revision bump; a real change still emails', async () => {
  const { db, notify, svc } = setup();
  const { booking } = await svc.create(REQUEST);
  await svc.reschedule(booking.id, { date: '2026-10-09', time: '11:00 AM' }, 'admin');
  const rev = db.row(booking.id).revision;
  const again = await svc.reschedule(booking.id, { date: '2026-10-09', time: '11:00 AM' }, 'admin');
  assert.equal(again.noop, true);
  assert.equal(db.row(booking.id).revision, rev);
  assert.deepEqual(notify.sent.map((n) => n.type), ['created', 'rescheduled']);
  await svc.reschedule(booking.id, { date: '2026-10-09', time: '2:00 PM' }, 'admin');
  assert.equal(notify.sent.length, 3);
});

test('R5: confirm delayed in Google while the customer cancels → no obsolete "confirmed" email, event gone', async () => {
  const { db, google, notify, svc } = setup();
  const { booking } = await svc.create(REQUEST);
  let release; const gate = new Promise((r) => { release = r; });
  google.hooks.beforePatch = async () => { await gate; };
  const confirming = svc.confirm(booking.id);
  await until(() => google.log.some((l) => l[0] === 'patch'));
  google.hooks.beforePatch = null;
  const c = await svc.cancel(booking.id, 'moved', 'customer');
  assert.equal(c.success, true);
  release();
  const r = await confirming;
  assert.equal(r.success, true);
  assert.deepEqual(notify.sent.map((n) => n.type), ['created', 'cancelled'], 'no confirmation after cancellation');
  assert.deepEqual(r.notifications[0], { type: 'confirmed', ok: false, skipped: true, reason: 'superseded' });
  assert.equal(db.row(booking.id).status, 'cancelled');
  assert.equal(google.liveEvents().length, 0);
});

test('R5: reversed reschedules → only the newest date is emailed and on the calendar', async () => {
  const { db, google, notify, svc } = setup();
  const { booking } = await svc.create(REQUEST);
  await svc.confirm(booking.id);
  let release; const gate = new Promise((r) => { release = r; });
  let n = 0;
  google.hooks.beforePatch = async () => { if (n++ === 0) await gate; };
  const first = svc.reschedule(booking.id, { date: '2026-10-10', time: '9:00 AM' }, 'admin');
  await until(() => n === 1);
  await svc.reschedule(booking.id, { date: '2026-10-12', time: '3:00 PM' }, 'admin');
  release();
  await first;
  const res = notify.sent.filter((x) => x.type === 'rescheduled');
  assert.equal(res.length, 1);
  assert.equal(res[0].payload.booking.preferred_date, '2026-10-12');
  const ev = google.events.get(db.row(booking.id).calendar_event_id);
  assert.equal(ev.date, '2026-10-12');
  assert.equal(google.liveEvents().length, 1);
});
