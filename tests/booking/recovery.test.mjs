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

test('R7: stable INSERT committing after the deadline, racing a cancel → cancel is NOT green; retry after the window removes it', async () => {
  const { db, google, svc, advance } = setup();
  const g = gate();
  google.faults.insert.push(async () => { await g.p; return null; });
  const c1 = await svc.create(REQUEST); // insert in transit when the budget fires
  const id = c1.booking.id;
  const S = stableEventId(id);
  assert.equal(c1.calendarSync.status, 'failed');

  const c = await svc.cancel(id, '', 'customer'); // DELETE S → 404: create may still land
  assert.equal(c.calendarSync.status, 'failed', 'uncertain removal is never absent');
  assert.match(c.calendarSync.error, /may still be in progress/);
  g.release(); // Google commits the old insert now
  await until(() => google.events.has(S));
  assert.ok(!green(db.row(id).calendar_sync_status), 'DB never says synced while S may be live');

  const r = await svc.retrySync(id); // S exists now → delete 204 → marker cleared
  assert.equal(r.calendarSync.status, 'absent');
  assert.equal(google.liveEvents().length, 0);
  assert.equal(db.row(id).calendar_op_started_at, null);

  // A retry with nothing to find inside the window stays failed; after the window it is absent.
  const b2 = db.seed({ ...REQUEST, status: 'cancelled', calendar_op_started_at: new Date(Date.parse('2026-09-23T12:00:00Z')).toISOString(), calendar_sync_status: 'failed' });
  assert.equal((await svc.retrySync(b2.id)).calendarSync.status, 'failed');
  advance(11 * 60 * 1000);
  assert.equal((await svc.retrySync(b2.id)).calendarSync.status, 'absent');
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
