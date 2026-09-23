// R7 / R8 (red-team BLOCKERS): calendar handle fencing.
// After ANY interleaving of reschedule/retry and cancel, a cancelled booking has
// no live Google event under any known handle (stored legacy id L, derived stable id S).
// Real lifecycle + real calendar-sync over in-memory fakes; deferred promises
// make the interleavings deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBookingLifecycle } from '../../lib/booking/lifecycle.js';
import { createCalendarSync, stableEventId } from '../../lib/booking/calendar-sync.js';
import { createFakeDb, createFakeGoogle, createFakeNotify, silentLogger } from './fakes.mjs';

const NOW = new Date('2026-09-23T12:00:00Z');
const REQUEST = {
  customer_name: 'Karen', customer_email: 'karen@example.com',
  preferred_date: '2026-10-05', preferred_time: '1:30 PM',
};

function setup() {
  const db = createFakeDb();
  const google = createFakeGoogle();
  const notify = createFakeNotify();
  const svc = createBookingLifecycle({
    db, calendar: createCalendarSync(google.adapter), notify, now: () => NOW, logger: silentLogger,
  });
  return { db, google, notify, svc };
}

function gate() {
  let release;
  const p = new Promise((r) => { release = r; });
  return { p, release };
}

const tick = () => new Promise((r) => setImmediate(r));
async function until(cond) {
  for (let i = 0; i < 1000 && !cond(); i++) await tick();
  assert.ok(cond(), 'condition never reached');
}
const ops = (google, op) => google.log.filter((l) => l[0] === op).length;

function assertNothingLive(google, ids) {
  for (const id of ids) {
    const e = google.events.get(id);
    assert.ok(!e || e.status === 'cancelled', `event ${id} must be absent/cancelled, is ${e?.status}`);
  }
  assert.equal(google.liveEvents().length, 0, 'no live event under any handle');
}

// ── R7 ─────────────────────────────────────────────────────────────────────

test('R7 trace: delayed legacy PATCH L racing a customer cancel → L and S both absent, DB cancelled', async () => {
  const { db, google, svc } = setup();
  const L = 'legacy123';
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: L, revision: 1 });
  const S = stableEventId(b.id);
  google.events.set(L, { id: L, status: 'confirmed', date: '2026-10-05' });

  const g = gate();
  google.faults.patch.push(async () => { await g.p; return null; }); // A's PATCH L is slow
  const resched = svc.reschedule(b.id, { date: '2026-10-09', time: '11:00 AM' }, 'admin');
  await until(() => ops(google, 'patch') === 1);

  const c = await svc.cancel(b.id, 'changed my mind', 'customer');
  assert.equal(c.success, true);
  assert.equal(c.calendarSync.status, 'absent');

  g.release(); // the stale PATCH reaches Google only now
  const r = await resched;
  assert.equal(r.success, true);

  const row = db.row(b.id);
  assert.equal(row.status, 'cancelled');
  assertNothingLive(google, [L, S]);
  assert.equal(row.calendar_event_id, L, 'legacy handle kept as tombstone for later retries');
  assert.equal(row.calendar_sync_status, 'synced');
  // The stale PATCH never carried restore:true onto a cancelled booking.
  assert.equal(google.events.get(L).status, 'cancelled');
});

test('R7 (c): restore PATCH that lands after a cross-instance cancel is undone by the post-effect CAS re-read', async () => {
  const { db, google, svc } = setup();
  const L = 'legacy456';
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: L, revision: 2 });
  const S = stableEventId(b.id);
  // Event was removed in Google while the booking is still live → sync must restore it.
  google.events.set(L, { id: L, status: 'cancelled', date: '2026-10-05' });

  const g = gate();
  // GET sees cancelled → recheck says live → conditional restore sent, delayed in transit.
  google.faults.patch.push(async () => { await g.p; return null; });
  const retry = svc.retrySync(b.id);
  await until(() => ops(google, 'patch') === 1);

  const c = await svc.cancel(b.id, '', 'admin'); // other instance: deletes L (410) + S (404)
  assert.equal(c.calendarSync.status, 'absent');

  g.release(); // restore lands → L resurrected in Google
  const r = await retry;
  assert.equal(r.success, true);
  assert.equal(r.calendarSync.status, 'absent', 'retry reconciled to the cancelled state');
  assert.equal(db.row(b.id).status, 'cancelled');
  assertNothingLive(google, [L, S]);
});

test('R7 (c): handles this call touched are deleted even if another writer nulled calendar_event_id', async () => {
  const { db, google, svc } = setup();
  const L = 'legacy789';
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: L, revision: 2 });
  google.events.set(L, { id: L, status: 'cancelled', date: '2026-10-05' });

  const g = gate();
  google.faults.patch.push(async () => { await g.p; return null; });
  const retry = svc.retrySync(b.id);
  await until(() => ops(google, 'patch') === 1);
  // An out-of-band writer (e.g. pre-Phase-A code) cancels AND clears the id.
  db.external(b.id, { status: 'cancelled', calendar_event_id: null });

  g.release();
  await retry;
  assert.equal(db.row(b.id).status, 'cancelled');
  assertNothingLive(google, [L, stableEventId(b.id)]);
  assert.ok(google.log.some(([op, id]) => op === 'delete' && id === L), 'touched L deleted');
});

test('R7: restore is never sent when the re-read row is already cancelled', async () => {
  const { db, google, svc } = setup();
  const L = 'legacyabc';
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: L, revision: 1 });
  google.events.set(L, { id: L, status: 'cancelled' });
  // GET sees cancelled; before the restore the row is cancelled by someone else
  google.faults.get.push(async () => { db.external(b.id, { status: 'cancelled' }); return null; });
  const r = await svc.retrySync(b.id);
  assert.equal(r.calendarSync.status, 'absent');
  assert.equal(google.log.filter((l) => l[0] === 'patch' && l[2] === 'restore').length, 0, 'no restore PATCH');
  assertNothingLive(google, [L, stableEventId(b.id)]);
});

test('R7: cancel deletes BOTH the stored legacy id and the derived stable id; retry re-checks both', async () => {
  const { db, google, svc } = setup();
  const L = 'legacydef';
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: L });
  const S = stableEventId(b.id);
  google.events.set(L, { id: L, status: 'confirmed' });
  google.events.set(S, { id: S, status: 'confirmed' }); // orphan from an earlier timeout
  const c = await svc.cancel(b.id, '', 'admin');
  assert.equal(c.calendarSync.status, 'absent');
  assert.equal(c.calendarSync.eventId, null);
  assertNothingLive(google, [L, S]);
  // A resurrected tombstone is found again by retry.
  google.events.get(L).status = 'confirmed';
  const r = await svc.retrySync(b.id);
  assert.equal(r.calendarSync.status, 'absent');
  assertNothingLive(google, [L, S]);
});

test('R7: one candidate delete failing → failed, handle kept, retry finishes the job', async () => {
  const { db, google, svc } = setup();
  const L = 'legacyghi';
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: L });
  const S = stableEventId(b.id);
  google.events.set(L, { id: L, status: 'confirmed' });
  google.events.set(S, { id: S, status: 'confirmed' });
  google.faults.delete.push(null, { success: false, httpStatus: 500, error: 'Backend Error' }); // L ok, S fails
  const c = await svc.cancel(b.id, '', 'admin');
  assert.equal(c.calendarSync.status, 'failed');
  assert.equal(db.row(b.id).calendar_sync_status, 'failed');
  assert.equal(db.row(b.id).calendar_event_id, L);
  const r = await svc.retrySync(b.id);
  assert.equal(r.calendarSync.status, 'absent');
  assertNothingLive(google, [L, S]);
});

// ── R8 ─────────────────────────────────────────────────────────────────────

test('R8 trace: stable replacement S created for missing legacy L, id write fails → failed (retryable); cancel deletes S; nothing live', async () => {
  const { db, google, notify, svc } = setup();
  const L = 'legacygone1';
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: L, calendar_sync_status: 'failed' });
  const S = stableEventId(b.id);
  // L no longer exists in Google (404 on PATCH) → sync creates S.
  const realUpdate = db.update.bind(db);
  let failNext = true;
  db.update = async (id, patch, opts) => {
    if (failNext && patch.calendar_event_id === S) {
      failNext = false;
      return { data: null, error: { message: 'connection reset' }, conflict: false };
    }
    return realUpdate(id, patch, opts);
  };
  const r = await svc.retrySync(b.id);
  assert.equal(r.success, true);
  assert.equal(r.calendarSync.status, 'failed', 'not synced: the replacement id was not saved');
  assert.match(r.calendarSync.error, /could not be saved; retry sync/);
  assert.equal(r.calendarSync.eventId, S);
  assert.equal(db.row(b.id).calendar_event_id, L, 'DB still points at L');
  assert.equal(google.events.get(S).status, 'confirmed', 'S really exists');

  const sent = notify.sent.length;
  const c = await svc.cancel(b.id, '', 'admin');
  assert.equal(c.success, true);
  assert.equal(c.calendarSync.status, 'absent');
  assert.equal(db.row(b.id).status, 'cancelled');
  assert.ok(google.log.some(([op, id]) => op === 'delete' && id === S), 'cancellation tried S');
  assert.ok(google.log.some(([op, id]) => op === 'delete' && id === L), 'cancellation tried L');
  assertNothingLive(google, [L, S]);
  assert.equal(notify.sent.length, sent + 1, 'only the cancellation email');
});

test('R8: metadata write failure after a plain successful sync is failed, not synced', async () => {
  const { db, svc } = setup();
  const { booking } = await svc.create(REQUEST);
  const realUpdate = db.update.bind(db);
  db.update = async (id, patch, opts) => (patch.calendar_sync_status === 'synced'
    ? { data: null, error: { message: 'timeout' }, conflict: false }
    : realUpdate(id, patch, opts));
  const r = await svc.retrySync(booking.id);
  assert.equal(r.calendarSync.status, 'failed');
  assert.match(r.calendarSync.error, /sync state not saved; retry sync/);
});

test('R8: retry after the failed id write persists S; cancel then deletes it', async () => {
  const { db, google, svc } = setup();
  const L = 'legacygone2';
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: L });
  const S = stableEventId(b.id);
  const realUpdate = db.update.bind(db);
  let failNext = true;
  db.update = async (id, patch, opts) => {
    if (failNext && patch.calendar_event_id === S) { failNext = false; return { data: null, error: { message: 'x' }, conflict: false }; }
    return realUpdate(id, patch, opts);
  };
  assert.equal((await svc.retrySync(b.id)).calendarSync.status, 'failed');
  const again = await svc.retrySync(b.id); // L gone (404) → insert 409 → adopt S
  assert.equal(again.calendarSync.status, 'synced');
  assert.equal(db.row(b.id).calendar_event_id, S);
  assert.equal(google.liveEvents().length, 1);
  await svc.cancel(b.id, '', 'customer');
  assertNothingLive(google, [L, S]);
  assert.equal(db.row(b.id).calendar_event_id, null, 'stable id is derivable → cleared');
});
