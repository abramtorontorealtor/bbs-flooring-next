// R7 remote-write-after-abort + R13 recovery (fix-3). Deferred fakes model Google
// COMMITTING a request after our local AbortSignal / deadline fired.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBookingLifecycle } from '../../lib/booking/lifecycle.js';
import { createCalendarSync, stableEventId } from '../../lib/booking/calendar-sync.js';
import { createFakeDb, createFakeGoogle, silentLogger } from './fakes.mjs';

const REQUEST = { customer_name: 'Karen', customer_email: 'k@example.com', preferred_date: '2026-10-05', preferred_time: '1:30 PM' };
const tick = () => new Promise((r) => setImmediate(r));
async function until(cond) { for (let i = 0; i < 2000 && !cond(); i++) await tick(); assert.ok(cond(), 'never reached'); }
function gate() { let release; const p = new Promise((r) => { release = r; }); return { p, release }; }

function setup({ syncMs = 40 } = {}) {
  const db = createFakeDb();
  const google = createFakeGoogle();
  let clock = Date.parse('2026-09-23T12:00:00Z');
  const svc = createBookingLifecycle({
    db, calendar: createCalendarSync(google.adapter), notify: null,
    now: () => new Date(clock), logger: silentLogger, timeouts: { syncMs, recordMs: 200 },
  });
  return { db, google, svc, advance: (ms) => { clock += ms; } };
}
const green = (s) => s === 'synced' || s === 'absent';

test('R7: restore PATCH committing AFTER the sync deadline aborted, racing a cancel → event stays cancelled, nothing green on uncertainty', async () => {
  const { db, google, svc } = setup();
  const L = 'legacyrst1';
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: L, revision: 2 });
  google.events.set(L, { id: L, status: 'cancelled', etag: '"e1"' });
  const g = gate();
  // Only the RESTORE write is delayed in transit (works for old and new call orders).
  google.hooks.beforePatch = async (_id, { restore }) => { if (restore) await g.p; };
  const r = await svc.retrySync(b.id); // budget fires while the restore is in flight
  assert.equal(r.calendarSync.status, 'failed', 'uncertain restore is not synced');
  assert.equal(db.row(b.id).calendar_sync_status, 'failed', 'durable + actionable');

  const c = await svc.cancel(b.id, '', 'admin'); // 410 → tombstone write moves the etag
  assert.equal(c.calendarSync.status, 'absent');
  g.release(); // Google now processes the stale restore (If-Match old etag)
  for (let i = 0; i < 20; i++) await tick();
  assert.equal(google.events.get(L).status, 'cancelled', 'late restore refused (412)');
  assert.equal(google.liveEvents().length, 0);
});

test('R7: GET without etag → no write at all (never an unconditional PATCH)', async () => {
  const { db, google, svc } = setup({ syncMs: 2000 });
  const L = 'legacynoetag';
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: L });
  google.events.set(L, { id: L, status: 'cancelled' });
  google.faults.get.push({ success: true, httpStatus: 200, event: { id: L, status: 'cancelled' } }); // no etag
  const r = await svc.retrySync(b.id);
  assert.equal(r.calendarSync.status, 'failed');
  assert.match(r.calendarSync.error, /no etag/);
  assert.equal(google.log.filter((l) => l[0] === 'patch').length, 0);
  assert.equal(google.events.get(L).status, 'cancelled');
  google.faults.get.push({ success: true, httpStatus: 200, event: { id: L, status: 'confirmed' } }); // live, no etag
  assert.equal((await svc.retrySync(b.id)).calendarSync.status, 'failed');
  assert.equal(google.log.filter((l) => l[0] === 'patch').length, 0);
});

test('R7: tombstone on an ALREADY-cancelled event carries a fresh fence → etag moves → in-flight restore gets 412', async () => {
  const { db, google, svc } = setup();
  const L = 'legacyfence1';
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: L, revision: 2 });
  google.events.set(L, { id: L, status: 'cancelled', etag: '"e1"', private: { other: 'keep' } });
  const g = gate();
  google.hooks.beforePatch = async (_id, { restore }) => { if (restore) await g.p; };
  await svc.retrySync(b.id); // restore (If-Match "e1") in transit, budget fires
  await svc.cancel(b.id, '', 'admin'); // DELETE → 410; fenced tombstone changes the resource
  const ev = google.events.get(L);
  assert.notEqual(ev.etag, '"e1"', 'etag moved although status was already cancelled');
  assert.equal(ev.private.other, 'keep', 'unrelated private property preserved');
  assert.ok(ev.private.bbs_fence);
  g.release();
  for (let i = 0; i < 20; i++) await tick();
  assert.equal(google.events.get(L).status, 'cancelled');
});

test('R13: sync that keeps conflicting records a durable failure and promises no automatic sync', async () => {
  const { db, google, svc } = setup({ syncMs: 2000 });
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: null });
  // Every successful sync-state write is beaten by another writer → all passes conflict.
  db.hooks.beforeUpdate = (id, patch) => { if (patch.calendar_sync_status === 'synced') db.external(id, { notes: 'x' }); };
  const r = await svc.retrySync(b.id);
  assert.equal(r.calendarSync.status, 'failed');
  assert.doesNotMatch(r.calendarSync.error, /will sync/);
  assert.match(r.calendarSync.error, /retry/i);
  assert.equal(db.row(b.id).calendar_sync_status, 'failed');
});

// ── R7 provider contract: Google does not guarantee id-collision detection at insert time ──
// ("Due to the globally distributed nature of the system, we cannot guarantee that ID
// collisions will be detected at event creation time", events.insert `id` docs.)
// So NO observation proves an uncertain insert can never land: a cancelled booking with an
// outstanding uncertain create stays failed/actionable until an explicit admin resolution.

/** Fake mode where a delayed insert lands DESPITE the id already existing (undetected collision). */
function collidingInsert(google, gate) {
  return async (eventId, booking) => {
    await gate;
    google.events.set(eventId, { id: eventId, status: 'confirmed', etag: '"late"', date: booking.preferred_date });
    return { success: true, httpStatus: 200, eventId };
  };
}

test('R7 contract: delayed insert lands despite reservation → cancel was never green; Retry removes it; resolve then absent', async () => {
  const { db, google, svc } = setup();
  let release; const g = new Promise((r) => { release = r; });
  const id0 = { v: null };
  google.faults.insert.push(async (eventId, booking) => { id0.v = eventId; await collidingInsert(google, g)(eventId, booking); return null; });
  const c1 = await svc.create(REQUEST);
  const id = c1.booking.id;
  assert.equal(c1.calendarSync.status, 'failed');
  const marker = db.row(id).calendar_op_started_at;
  assert.ok(marker);

  const c = await svc.cancel(id, '', 'customer');
  assert.equal(c.calendarSync.status, 'failed', 'reservation alone is not proof');
  assert.equal(c.calendarSync.reason, 'uncertain_calendar_create');
  assert.equal(db.row(id).calendar_sync_status, 'failed');
  assert.equal(db.row(id).calendar_op_started_at, marker, 'marker kept');

  release(); // the original insert lands although the id was reserved
  for (let i = 0; i < 20; i++) await tick();
  assert.equal(google.liveEvents().length, 1, 'modelled undetected collision');
  assert.notEqual(db.row(id).calendar_sync_status, 'synced');

  const r = await svc.retrySync(id); // sweep deletes it, still not green
  assert.equal(r.calendarSync.status, 'failed');
  assert.equal(google.liveEvents().length, 0);

  // explicit reviewed resolution: stale marker value rejected, exact value accepted
  assert.equal((await svc.resolveCalendarUncertainty(id, { marker: 'stale' })).success, false);
  assert.equal((await svc.resolveCalendarUncertainty(id, { marker })).success, true);
  assert.equal((await svc.retrySync(id)).calendarSync.status, 'absent');
});

test('R7 (parent repro): a later DEFINITE insert failure does not clear an EARLIER uncertain insert', async () => {
  const { db, google, svc } = setup();
  let release; const g = new Promise((r) => { release = r; });
  google.faults.insert.push(async () => { await g; return null; });
  const c1 = await svc.create(REQUEST);
  const id = c1.booking.id;
  google.faults.insert.push({ success: false, httpStatus: 403, error: 'rateLimitExceeded' });
  const r = await svc.retrySync(id);
  assert.equal(r.calendarSync.status, 'failed');
  assert.ok(db.row(id).calendar_op_started_at, 'earlier uncertainty kept');
  const c = await svc.cancel(id, '', 'customer');
  assert.equal(c.calendarSync.status, 'failed');
  assert.notEqual(db.row(id).calendar_sync_status, 'synced');
  release();
  for (let i = 0; i < 20; i++) await tick();
  assert.equal(db.row(id).status, 'cancelled');
  assert.equal(google.liveEvents().length, 0);
  assert.notEqual(db.row(id).calendar_sync_status, 'synced');
});

test('R7: concurrent same-revision retries (one uncertain, one definite) → the definite one cannot clear the other\'s marker', async () => {
  const { db, google, svc } = setup();
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: null, calendar_sync_status: 'failed' });
  let release; const g = new Promise((r) => { release = r; });
  google.faults.insert.push(async () => { await g; return null; }, { success: false, httpStatus: 400, error: 'bad' });
  await Promise.all([svc.retrySync(b.id), svc.retrySync(b.id)]);
  assert.ok(db.row(b.id).calendar_op_started_at, 'uncertainty survives the concurrent definite failure');
  // reverse order: the definite one starts first
  const b2 = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: null, calendar_sync_status: 'failed' });
  google.faults.insert.push({ success: false, httpStatus: 400, error: 'bad' }, async () => { await g; return null; });
  await Promise.all([svc.retrySync(b2.id), svc.retrySync(b2.id)]);
  assert.ok(db.row(b2.id).calendar_op_started_at);
  const c = await svc.cancel(b.id, '', 'admin');
  assert.equal(c.calendarSync.status, 'failed');
  release();
});

test('R7: owner clears its own marker after a definite answer (normal create); timeout-after-create keeps it', async () => {
  const { db, google, svc } = setup({ syncMs: 2000 });
  const ok = await svc.create(REQUEST);
  assert.equal(ok.calendarSync.status, 'synced');
  assert.equal(db.row(ok.booking.id).calendar_op_started_at ?? null, null);
  assert.equal((await svc.cancel(ok.booking.id, '', 'customer')).calendarSync.status, 'absent', 'normal flow still green');

  google.faults.insert.push('timeoutAfterCreate'); // Google created it; we saw a timeout
  const t = await svc.create(REQUEST);
  assert.equal(t.calendarSync.status, 'failed');
  assert.ok(db.row(t.booking.id).calendar_op_started_at);
  const c = await svc.cancel(t.booking.id, '', 'customer');
  assert.equal(c.calendarSync.status, 'failed');
  assert.equal(google.liveEvents().length, 0, 'the committed event was still swept away');
});

test('R7: elapsed time never clears; resolve rejected while a newer attempt re-marked', async () => {
  const { db, svc, advance } = setup({ syncMs: 2000 });
  const b = db.seed({ ...REQUEST, status: 'cancelled', calendar_event_id: null, calendar_sync_status: 'failed',
    calendar_op_started_at: '2026-09-23T11:00:00.000123Z' });
  advance(7 * 24 * 60 * 60 * 1000);
  assert.equal((await svc.retrySync(b.id)).calendarSync.status, 'failed');
  assert.ok(db.row(b.id).calendar_op_started_at);
  db.external(b.id, { calendar_op_started_at: '2026-09-30T11:00:00.000456Z' });
  assert.equal((await svc.resolveCalendarUncertainty(b.id, { marker: '2026-09-23T11:00:00.000123Z' })).success, false);
});
