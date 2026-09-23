// R9 + R20: real request bodies from lib/google-calendar.js (global fetch stubbed, no network).
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  insertCalendarEventWithId, patchCalendarEvent, markCalendarEventCancelled, deleteCalendarEventById, __test,
} from '../../lib/google-calendar.js';

const ENV = { GOOGLE_CALENDAR_CLIENT_ID: 'cid', GOOGLE_CALENDAR_CLIENT_SECRET: 'sec', GOOGLE_CALENDAR_REFRESH_TOKEN: 'rt' };
let saved; let realFetch; let calls;
beforeEach(() => {
  saved = Object.fromEntries(Object.keys(ENV).map((k) => [k, process.env[k]]));
  Object.assign(process.env, ENV);
  realFetch = globalThis.fetch;
  calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    if (u.includes('oauth2')) return new Response(JSON.stringify({ access_token: 'tok' }), { status: 200 });
    calls.push({ url: u, method: init.method, headers: init.headers, body: init.body ? JSON.parse(init.body) : null });
    return new Response(JSON.stringify({ id: 'x', etag: '"2"' }), { status: 200 });
  };
});
afterEach(() => {
  globalThis.fetch = realFetch;
  for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
});

const b = (over) => ({ id: 'b1', status: 'confirmed', customer_name: 'K', customer_email: 'k@example.com', preferred_date: '2026-10-05', ...over });

test('R9: date-only booking → all-day with EXCLUSIVE next-day end (POST and PATCH bodies)', async () => {
  await insertCalendarEventWithId('bbsx', b({ preferred_time: null }));
  await patchCalendarEvent('bbsx', b({ preferred_time: '' }), { ifMatch: '"1"' });
  for (const c of calls) {
    assert.deepEqual(c.body.start, { date: '2026-10-05' });
    assert.deepEqual(c.body.end, { date: '2026-10-06' });
  }
  // month / year rollover
  assert.deepEqual(__test.parseBookingDateTime(b({ preferred_date: '2026-12-31', preferred_time: null })).end, { date: '2027-01-01' });
});

test('R9: 11:30 PM → end 00:30 next day (no hour 24); 12 AM / 12 PM correct; Toronto zone', () => {
  const late = __test.parseBookingDateTime(b({ preferred_time: '11:30 PM' }));
  assert.deepEqual(late.start, { dateTime: '2026-10-05T23:30:00', timeZone: 'America/Toronto' });
  assert.deepEqual(late.end, { dateTime: '2026-10-06T00:30:00', timeZone: 'America/Toronto' });
  assert.equal(__test.parseBookingDateTime(b({ preferred_time: '12:15 AM' })).start.dateTime, '2026-10-05T00:15:00');
  assert.equal(__test.parseBookingDateTime(b({ preferred_time: '12:00 PM' })).end.dateTime, '2026-10-05T13:00:00');
  assert.equal(__test.parseBookingDateTime(b({ preferred_time: '13:00 PM' })).allDay, true);
  assert.equal(__test.parseBookingDateTime(b({ preferred_date: 'soon' })), null);
});

test('R20: every real request uses sendUpdates=none and never adds attendees; conditional PATCH sends If-Match', async () => {
  await insertCalendarEventWithId('bbsx', b({ preferred_time: '1:30 PM' }));
  await patchCalendarEvent('bbsx', b({ preferred_time: '1:30 PM' }), { restore: true, ifMatch: '"7"' });
  await markCalendarEventCancelled('bbsx', { fence: 'nonce-1' });
  await deleteCalendarEventById('bbsx');
  assert.equal(calls.length, 4);
  for (const c of calls) {
    assert.match(c.url, /[?&]sendUpdates=none(&|$)/);
    assert.ok(!c.body || !('attendees' in c.body), 'no attendees');
  }
  assert.equal(calls[1].headers['If-Match'], '"7"');
  assert.equal(calls[1].body.status, 'confirmed');
  assert.equal(calls[0].headers['If-Match'], undefined);
  assert.deepEqual(calls[2].body, { status: 'cancelled', extendedProperties: { private: { bbs_fence: 'nonce-1' } } });
  assert.equal(calls[3].method, 'DELETE');
});

test('harness: GOOGLE_CALENDAR_ID targets a sandbox calendar (URL-encoded); unset → primary', async () => {
  const prev = process.env.GOOGLE_CALENDAR_ID;
  try {
    process.env.GOOGLE_CALENDAR_ID = 'bbs-sandbox_1@group.calendar.google.com';
    await insertCalendarEventWithId('bbsx', b({ preferred_time: '1:30 PM' }));
    await patchCalendarEvent('bbsx', b({ preferred_time: '1:30 PM' }), { ifMatch: '"1"' });
    await markCalendarEventCancelled('bbsx', { fence: 'n' });
    await deleteCalendarEventById('bbsx');
    for (const c of calls) {
      assert.ok(c.url.includes('/calendars/bbs-sandbox_1%40group.calendar.google.com/events'), c.url);
      assert.ok(!c.url.includes('/calendars/primary/'));
    }
    delete process.env.GOOGLE_CALENDAR_ID;
    calls.length = 0;
    await deleteCalendarEventById('bbsx');
    assert.match(calls[0].url, /\/calendars\/primary\/events\/bbsx/);
  } finally {
    if (prev === undefined) delete process.env.GOOGLE_CALENDAR_ID; else process.env.GOOGLE_CALENDAR_ID = prev;
  }
});
