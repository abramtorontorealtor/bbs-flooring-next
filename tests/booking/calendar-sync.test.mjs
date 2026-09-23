import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCalendarSync, stableEventId, sanitizeError } from '../../lib/booking/calendar-sync.js';
import { createFakeGoogle } from './fakes.mjs';

const booking = (over = {}) => ({
  id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301', status: 'pending',
  customer_name: 'Karen', preferred_date: '2026-10-05', preferred_time: '1:30 PM',
  calendar_event_id: null, ...over,
});

test('stableEventId: bbs + hyphen-free uuid, Google base32hex-valid', () => {
  const id = stableEventId('3F2504E0-4F89-11D3-9A0C-0305E82C3301');
  assert.equal(id, 'bbs3f2504e04f8911d39a0c0305e82c3301');
  assert.match(id, /^[a-v0-9]{5,1024}$/);
  assert.equal(stableEventId(null), null);
});

test('sanitizeError strips bearer tokens + emails and truncates', () => {
  const s = sanitizeError('{"error":{"message":"Bearer ya29.abcDEF bad for karen@example.com"}}', 401);
  assert.equal(s, 'HTTP 401: Bearer [redacted] bad for [email]');
  assert.ok(sanitizeError('x'.repeat(1000)).length <= 300);
});

test('thrown error and {success:false} normalise to the same result shape', async () => {
  const g = createFakeGoogle();
  const sync = createCalendarSync(g.adapter);
  g.faults.insert.push('throw');
  const a = await sync.ensureEvent(booking());
  g.faults.insert.push({ success: false, httpStatus: 500, error: 'Backend Error' });
  const b = await sync.ensureEvent(booking());
  for (const r of [a, b]) {
    // throw / 5xx are ambiguous (may commit remotely), flagged as such (R7).
    // touched: the stable id an insert was SENT to (a later cancel must delete it, R7(c)).
    assert.deepEqual(Object.keys(r).sort(), ['ambiguous', 'error', 'eventId', 'ok', 'status', 'touched']);
    assert.equal(r.ambiguous, true);
    assert.equal(r.ok, false);
    assert.equal(r.status, 'failed');
    assert.equal(r.eventId, null);
  }
  assert.doesNotMatch(a.error, /ya29/);
  assert.match(b.error, /HTTP 500/);
});

test('insert 409 → GET existing → PATCH (restores cancelled event), no second event', async () => {
  const g = createFakeGoogle();
  const sync = createCalendarSync(g.adapter);
  const id = stableEventId(booking().id);
  g.events.set(id, { id, status: 'cancelled', summary: 'old', date: '2026-01-01' });
  const r = await sync.ensureEvent(booking());
  assert.equal(r.ok, true);
  assert.equal(r.eventId, id);
  assert.equal(g.events.size, 1);
  assert.equal(g.events.get(id).status, 'confirmed');
  assert.equal(g.events.get(id).date, '2026-10-05');
  assert.deepEqual(g.log.map((l) => l[0]), ['insert', 'get', 'patch']);
});

test('stored legacy id is patched in place; never replaced while it exists', async () => {
  const g = createFakeGoogle();
  const sync = createCalendarSync(g.adapter);
  g.events.set('legacy9xyz', { id: 'legacy9xyz', status: 'confirmed' });
  const r = await sync.ensureEvent(booking({ calendar_event_id: 'legacy9xyz' }));
  assert.equal(r.eventId, 'legacy9xyz');
  // R7: read etag first, then a conditional (If-Match) PATCH.
  assert.deepEqual(g.log.map((l) => l[0]), ['get', 'patch']);
});

test('delete: 2xx/404/410 ok+absent; 500 and throw are failures that keep the id', async () => {
  const g = createFakeGoogle();
  const sync = createCalendarSync(g.adapter);
  const b = booking({ calendar_event_id: 'evt12345' });
  g.events.set('evt12345', { id: 'evt12345', status: 'confirmed' });
  assert.equal((await sync.deleteEvent(b)).status, 'absent'); // 204
  assert.equal((await sync.deleteEvent(b)).ok, true); // 410 now (cancelled)
  g.events.clear();
  assert.equal((await sync.deleteEvent(b)).ok, true); // 404
  g.faults.delete.push({ success: false, httpStatus: 500, error: 'Backend Error' });
  const f = await sync.deleteEvent(b);
  assert.deepEqual([f.ok, f.status, f.eventId], [false, 'failed', 'evt12345']);
  g.faults.delete.push('throw');
  assert.equal((await sync.deleteEvent(b)).ok, false);
});
