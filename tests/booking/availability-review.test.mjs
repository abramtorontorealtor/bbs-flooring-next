// Phase B B1 review regressions (phaseB-B1-review.md R1–R10). Fake Supabase / fetch, no network.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSchedulePolicy, zonedWallTimeToUtcMs, candidateStarts } from '../../lib/booking/schedule-policy.js';
import { computeAvailability, createAvailabilityService, bookingIdFromStableEventId } from '../../lib/booking/availability.js';
import { handleAvailability } from '../../lib/booking/availability-handler.js';
import { createAvailabilitySources } from '../../lib/booking/availability-sources.js';
import { listCalendarBusyEvents } from '../../lib/google-calendar.js';
import { stableEventId } from '../../lib/booking/calendar-sync.js';
import { testOwnership } from './fakes.mjs';

const P = resolveSchedulePolicy({}, {});
const NOW = Date.parse('2026-09-23T12:00:00Z');
const D = '2026-09-26';
const times = (r) => r.slots.map((s) => s.time);
const silent = { error() {}, warn() {}, log() {} };
const U1 = 'a1111111-1111-4111-8111-111111111111';
const U2 = 'b2222222-2222-4222-8222-222222222222';
const TOK_UUID = ['9b2f7c1e', '4d3a', '4b5c', '8e6f', '0a1b2c3d4e5f'].join('-');

/** Minimal PostgREST builder fake: in/eq/order/range/limit/abortSignal/maybeSingle over rows. */
function fakeSupabase(rows, { fail = false, hang = false, nullData = false } = {}) {
  const queries = [];
  const hooks = { beforeQuery: null };
  const from = () => {
    const f = { in: {}, eq: {}, gt: {}, range: null, limit: null, single: false };
    const q = {
      select() { return q; },
      in(c, v) { f.in[c] = v; return q; },
      eq(c, v) { f.eq[c] = v; return q; },
      gt(c, v) { f.gt[c] = v; return q; },
      order() { return q; },
      range(a, b) { f.range = [a, b]; return q; },
      limit(n) { f.limit = n; return q; },
      abortSignal(s) { f.signal = s; return q; },
      maybeSingle() { f.single = true; return q; },
      then(res, rej) {
        queries.push(f);
        if (hooks.beforeQuery) hooks.beforeQuery(f, rows);
        if (hang) return new Promise(() => {}).then(res, rej);
        if (fail) return Promise.resolve({ data: null, error: { message: 'boom SECRET' } }).then(res, rej);
        if (nullData) return Promise.resolve({ data: null, error: null }).then(res, rej);
        let out = rows.filter((r) => Object.entries(f.in).every(([c, v]) => v.includes(r[c]))
          && Object.entries(f.eq).every(([c, v]) => r[c] === v)
          && Object.entries(f.gt).every(([c, v]) => r[c] > v));
        out.sort((a, b) => (a.id < b.id ? -1 : 1));
        if (f.range) out = out.slice(f.range[0], f.range[1] + 1);
        if (f.limit) out = out.slice(0, f.limit);
        return Promise.resolve({ data: f.single ? (out[0] || null) : out, error: null }).then(res, rej);
      },
    };
    return q;
  };
  return { from, queries, hooks };
}

const req = (url) => ({ url, headers: { get: () => null } });
const rl = { getClientIP: () => '203.0.113.9', checkRateLimit: () => ({ ok: true, remaining: 9, resetAt: Date.now() + 1000 }) };

test('R1: real Supabase token resolver releases only the customer\'s own interval', async () => {
  const TOK = '9b2f7c1e-4d3a-4b5c-8e6f-0a1b2c3d4e5f';
  const rows = [{ id: U1, status: 'pending', preferred_date: D, preferred_time: '12:00 PM', lookup_token: TOK }];
  const sb = fakeSupabase(rows);
  const src = createAvailabilitySources(sb);
  const availability = createAvailabilityService({ ...src, now: () => NOW, logger: silent });
  const deps = { ...rl, logger: silent, availability, findBookingByToken: src.findBookingByToken };
  const anon = await handleAvailability(req(`https://x/a?date=${D}`), deps);
  const own = await handleAvailability(req(`https://x/a?date=${D}&token=${TOK}`), deps);
  assert.ok(!times(anon.body).includes('12:00 PM'));
  assert.ok(times(own.body).includes('12:00 PM'));
  // Non-UUID token: no DB query at all.
  const before = sb.queries.length;
  assert.equal(await src.findBookingByToken('not-a-uuid'), null);
  assert.equal(sb.queries.length, before);
});

test('R3: stale own event on another date (failed move) is not phantom occupancy; genuine external stays busy', async () => {
  const rows = [{ id: U1, status: 'pending', preferred_date: '2026-10-02', preferred_time: '1:00 PM', calendar_event_id: 'legacyAbc',
    ownership_proof: testOwnership.signRow(U1), calendar_event_proof: testOwnership.signEvent(U1, 'legacyAbc') }];
  const events = [
    { id: stableEventId(U1), status: 'confirmed', start: { dateTime: '2026-09-26T12:00:00-04:00' }, end: { dateTime: '2026-09-26T13:00:00-04:00' } },
    { id: 'legacyAbc', status: 'confirmed', start: { dateTime: '2026-09-26T17:00:00-04:00' }, end: { dateTime: '2026-09-26T18:00:00-04:00' } },
    // looks like ours by prefix, but no row owns it → genuine busy
    { id: stableEventId(U2), status: 'confirmed', start: { dateTime: '2026-09-26T11:00:00-04:00' }, end: { dateTime: '2026-09-26T11:30:00-04:00' } },
  ];
  const src = createAvailabilitySources(fakeSupabase(rows));
  const svc = createAvailabilityService({ ...src, listGoogleEvents: async () => ({ ok: true, events }), now: () => NOW, logger: silent });
  const r = await svc.forDate(D);
  assert.equal(r.reliability, 'full');
  // Unowned 11:00–11:30 blocks only 11:00 (half-open: 11:30 start touches, doesn't overlap).
  assert.deepEqual(times(r), ['11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '5:00 PM']);
  assert.equal(bookingIdFromStableEventId(stableEventId(U1)), U1);
  // Ownership unresolved → conservative busy + partial.
  const noOwner = createAvailabilityService({ listLiveBookings: src.listLiveBookings, listGoogleEvents: async () => ({ ok: true, events }), now: () => NOW, logger: silent });
  const p = await noOwner.forDate(D);
  assert.equal(p.reliability, 'partial');
  assert.ok(!times(p).includes('12:00 PM'));
});

test('R4: adjacent-day bookings and query window follow duration + buffer across midnight', async () => {
  const long = resolveSchedulePolicy({}, { BOOKING_DURATION_MINUTES: '480', BOOKING_BUFFER_MINUTES: '240' });
  const prev = [{ id: U1, status: 'confirmed', preferred_date: '2026-09-25', preferred_time: '5:00 PM' }]; // ends 01:00 +4h pad = 05:00
  const r = computeAvailability({ date: D, policy: long, nowMs: NOW, bookings: prev });
  assert.ok(times(r).includes('11:00 AM')); // 11:00 − 4h = 07:00 > 01:00 → fine
  const prevLate = [{ id: U1, status: 'confirmed', preferred_date: '2026-09-25', preferred_time: '11:30 PM' }]; // ends 07:30, +4h → 11:30
  assert.ok(!times(computeAvailability({ date: D, policy: long, nowMs: NOW, bookings: prevLate })).includes('11:00 AM'));
  // Service queries ±1 day and a window reaching past midnight.
  const seen = {};
  const svc = createAvailabilityService({
    policy: long, now: () => NOW, logger: silent,
    listLiveBookings: async ({ dates }) => { seen.dates = dates; return []; },
    listGoogleEvents: async ({ timeMin, timeMax }) => { Object.assign(seen, { timeMin, timeMax }); return { ok: true, events: [
      { id: 'x', status: 'confirmed', start: { dateTime: '2026-09-27T00:30:00-04:00' }, end: { dateTime: '2026-09-27T01:00:00-04:00' } },
    ] }; },
    resolveOwnedEventIds: async () => [],
  });
  const s = await svc.forDate(D);
  assert.deepEqual(seen.dates, ['2026-09-25', D, '2026-09-27']);
  assert.ok(Date.parse(seen.timeMax) > Date.parse('2026-09-27T04:00:00Z'));
  assert.ok(!times(s).includes('5:00 PM')); // 17:00–01:00 overlaps next-day 00:30
});

test('R5: offsetless dateTime uses event/calendar zone, not the server zone; unreadable opaque → partial', () => {
  const ev = { id: 'x', status: 'confirmed', start: { dateTime: '2026-09-26T12:00:00', timeZone: 'America/Toronto' }, end: { dateTime: '2026-09-26T13:00:00', timeZone: 'America/Toronto' } };
  const r = computeAvailability({ date: D, policy: P, nowMs: NOW, googleEvents: [ev] });
  assert.deepEqual(times(r), ['11:00 AM', '1:00 PM', '1:30 PM', '5:00 PM']);
  // Calendar zone for all-day: a Vancouver all-day on Sep 25 ends 03:00 ET Sep 26 → no candidate blocked.
  const van = computeAvailability({ date: D, policy: P, nowMs: NOW, googleEvents: [{ id: 'v', status: 'confirmed', calendarTimeZone: 'America/Vancouver', start: { date: '2026-09-25' }, end: { date: '2026-09-26' } }] });
  assert.equal(van.slots.length, 7);
  // Only start.date → treated as a one-day block (not silently dropped).
  assert.deepEqual(computeAvailability({ date: D, policy: P, nowMs: NOW, googleEvents: [{ id: 'o', status: 'confirmed', start: { date: D } }] }).slots, []);
  const bad = computeAvailability({ date: D, policy: P, nowMs: NOW, googleEvents: [{ id: 'b', status: 'confirmed', start: { dateTime: 'soon' }, end: {} }] });
  assert.equal(bad.reliability, 'partial');
});

test('R6: DB reads paginate; malformed/failed → unavailable, never empty', async () => {
  const rows = [];
  for (let i = 0; i < 501; i++) rows.push({ id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`, status: 'pending', preferred_date: '2026-09-25', preferred_time: '11:00 AM' });
  rows.push({ id: 'ffffffff-0000-4000-8000-000000000000', status: 'pending', preferred_date: D, preferred_time: '12:00 PM' });
  const svc = createAvailabilityService({ ...createAvailabilitySources(fakeSupabase(rows)), now: () => NOW, logger: silent });
  assert.ok(!times(await svc.forDate(D)).includes('12:00 PM'));
  for (const opt of [{ nullData: true }, { fail: true }]) {
    const s = createAvailabilityService({ ...createAvailabilitySources(fakeSupabase([], opt)), now: () => NOW, logger: silent });
    const r = await s.forDate(D);
    assert.equal(r.status, 'unavailable');
    assert.deepEqual(r.slots, []);
  }
});

test('R7: hanging DB / token reads are bounded', async () => {
  const hang = createAvailabilitySources(fakeSupabase([], { hang: true }));
  const hangSb = fakeSupabase([], { hang: true });
  const hangSrc = createAvailabilitySources(hangSb);
  const q0 = hangSb.queries.length;
  const svc = createAvailabilityService({ ...hang, dbBudgetMs: 30, now: () => NOW, logger: silent });
  const t0 = Date.now();
  assert.equal((await svc.forDate(D)).status, 'unavailable');
  const ok = createAvailabilityService({ listLiveBookings: async () => [], now: () => NOW, logger: silent });
  const res = await handleAvailability(req(`https://x/a?date=${D}&token=${TOK_UUID}`),
    { ...rl, logger: silent, availability: ok, findBookingByToken: hangSrc.findBookingByToken, tokenLookupMs: 30 });
  assert.equal(res.status, 200);
  // N3: a well-formed UUID really reaches the (hanging) query and its signal is aborted.
  assert.equal(hangSb.queries.length, q0 + 1);
  assert.equal(hangSb.queries.at(-1).signal.aborted, true);
  assert.ok(Date.now() - t0 < 1000);
});

test('R8: blocks from a calendar that answered survive another calendar failing', async () => {
  const svc = createAvailabilityService({
    listLiveBookings: async () => [], resolveOwnedEventIds: async () => [], now: () => NOW, logger: silent,
    listGoogleEvents: async () => ({ ok: false, partial: true, code: 'http_403', events: [
      { id: 'n', status: 'confirmed', start: { dateTime: '2026-09-26T12:00:00-04:00' }, end: { dateTime: '2026-09-26T13:00:00-04:00' } },
    ] }),
  });
  const r = await svc.forDate(D);
  assert.equal(r.reliability, 'partial');
  assert.ok(!times(r).includes('12:00 PM'));
});

const ENV = { GOOGLE_CALENDAR_CLIENT_ID: 'cid', GOOGLE_CALENDAR_CLIENT_SECRET: 'sec', GOOGLE_CALENDAR_REFRESH_TOKEN: 'rt' };
let saved; let realFetch;
beforeEach(() => { saved = Object.fromEntries(Object.keys(ENV).map((k) => [k, process.env[k]])); Object.assign(process.env, ENV); realFetch = globalThis.fetch; });
afterEach(() => { globalThis.fetch = realFetch; for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } });

test('R9: OAuth / provider error text never leaves the adapter; calendar zone + query flags carried', async () => {
  globalThis.fetch = async () => new Response('refresh_token=SYNTHETIC_SECRET_CANARY invalid_grant', { status: 400 });
  const r = await listCalendarBusyEvents('cal@group.calendar.google.com', { timeMin: 'a', timeMax: 'b' });
  assert.deepEqual(r, { ok: false, code: 'oauth_failed' });
  const urls = [];
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.includes('oauth2')) return new Response(JSON.stringify({ access_token: 'tok' }), { status: 200 });
    urls.push(u);
    if (urls.length === 1) return new Response(JSON.stringify({ timeZone: 'America/Toronto', nextPageToken: 'p2', items: [{ id: 'e1', status: 'confirmed', summary: 'PRIVATE', start: { date: D }, end: { date: '2026-09-27' } }] }), { status: 200 });
    return new Response('{"error":"SECRET body"}', { status: 500 });
  };
  const r2 = await listCalendarBusyEvents('cal@group.calendar.google.com', { timeMin: 'a', timeMax: 'b' });
  assert.equal(r2.ok, false);
  assert.equal(r2.code, 'http_500');
  assert.equal(r2.events[0].calendarTimeZone, 'America/Toronto');
  assert.ok(!JSON.stringify(r2).includes('SECRET') && !JSON.stringify(r2).includes('PRIVATE'));
  assert.match(urls[0], /singleEvents=true/);
  assert.match(urls[0], /showDeleted=false/);
  assert.match(urls[0], /cal%40group\.calendar\.google\.com/);
  assert.match(urls[1], /pageToken=p2/);
});

test('R10: nonexistent DST-gap wall times are rejected, never shifted; fall-back ambiguity = earlier', () => {
  assert.equal(zonedWallTimeToUtcMs('2026-03-08', 150), null);
  assert.equal(new Date(zonedWallTimeToUtcMs('2026-11-01', 90)).toISOString(), '2026-11-01T05:30:00.000Z');
  const gap = resolveSchedulePolicy({ candidateTimes: ['2:30 AM', '11:00 AM'], weekdays: [0, 1, 2, 3, 4, 5, 6] }, {});
  const c = candidateStarts('2026-03-08', gap, Date.parse('2026-03-01T12:00:00Z'));
  assert.deepEqual(c.map((x) => x.time), ['11:00 AM']);
});

// ── Recheck (phaseB-B1-recheck.md) regressions ─────────────────────────────
const NOON = { status: 'confirmed', start: { dateTime: '2026-09-26T12:00:00-04:00' }, end: { dateTime: '2026-09-26T13:00:00-04:00' } };

test('B0: an UNSIGNED row claiming an event (stored or stable) never hides genuine busy time; signed rows do', async () => {
  const unsigned = [
    { id: U1, status: 'cancelled', preferred_date: '2026-12-01', preferred_time: '1:00 PM', calendar_event_id: 'realExt1', ownership_proof: null, calendar_event_proof: null },
    { id: U2, status: 'cancelled', preferred_date: '2026-12-01', preferred_time: '1:00 PM', ownership_proof: null, calendar_event_proof: null },
  ];
  const events = [{ id: 'realExt1', ...NOON }, { id: stableEventId(U2), ...NOON }];
  const mk = (rows) => createAvailabilityService({ ...createAvailabilitySources(fakeSupabase(rows), { ownership: testOwnership }),
    ownership: testOwnership, listGoogleEvents: async () => ({ ok: true, events }), now: () => NOW, logger: silent });
  const r = await mk(unsigned).forDate(D);
  assert.ok(!times(r).includes('12:00 PM'));
  // Same claims on the SAME date (local shortcut path) — also unsigned → still busy.
  const local = unsigned.map((x) => ({ ...x, status: 'cancelled', preferred_date: D }));
  assert.ok(!times(computeAvailability({ date: D, policy: P, nowMs: NOW, bookings: local, googleEvents: events, ownership: testOwnership })).includes('12:00 PM'));
  // Signed → recognised as ours → released.
  const signed = [
    { ...unsigned[0], calendar_event_proof: testOwnership.signEvent(U1, 'realExt1') },
    { ...unsigned[1], ownership_proof: testOwnership.signRow(U2) },
  ];
  assert.ok(times(await mk(signed).forDate(D)).includes('12:00 PM'));
  // No secret configured → nothing verifies → busy.
  assert.ok(!times(computeAvailability({ date: D, policy: P, nowMs: NOW, bookings: signed, googleEvents: events, ownership: null })).includes('12:00 PM'));
});

test('S1: known busy from a calendar that answered survives another calendar hanging to the outer deadline', async () => {
  const svc = createAvailabilityService({
    listLiveBookings: async () => [], resolveOwnedEventIds: async () => [], now: () => NOW, logger: silent, googleBudgetMs: 40,
    listGoogleEvents: async ({ collect, signal }) => {
      collect([{ id: 'a', ...NOON }]); // calendar A answered
      return new Promise((_, rej) => signal.addEventListener('abort', () => rej(new Error('aborted')))); // B hangs
    },
  });
  const r = await svc.forDate(D);
  assert.equal(r.reliability, 'partial');
  assert.ok(!times(r).includes('12:00 PM'));
});

test('S2: ownership resolved for every id (>500, chunked); duplicate claims do not hide other ids; incomplete → partial', async () => {
  const moved = { id: U1, status: 'pending', preferred_date: '2026-12-01', preferred_time: '1:00 PM', ownership_proof: testOwnership.signRow(U1) };
  const ext = [];
  for (let i = 0; i < 600; i++) ext.push({ id: `ext${i}`, status: 'confirmed', start: { dateTime: '2026-09-26T11:00:00-04:00' }, end: { dateTime: '2026-09-26T11:30:00-04:00' } });
  const events = [...ext, { id: stableEventId(U1), ...NOON }];
  const dupA = { id: 'c3333333-3333-4333-8333-333333333333', status: 'cancelled', preferred_date: '2026-12-01', calendar_event_id: 'ext1' };
  const dupB = { id: 'd4444444-4444-4444-8444-444444444444', status: 'cancelled', preferred_date: '2026-12-01', calendar_event_id: 'ext1' };
  const svc = createAvailabilityService({ ...createAvailabilitySources(fakeSupabase([moved, dupA, dupB]), { ownership: testOwnership }),
    ownership: testOwnership, listGoogleEvents: async () => ({ ok: true, events }), now: () => NOW, logger: silent });
  const r = await svc.forDate(D);
  assert.equal(r.reliability, 'full');
  assert.deepEqual(times(r), ['11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '5:00 PM']);
  const failing = createAvailabilityService({ listLiveBookings: async () => [], resolveOwnedEventIds: async () => null,
    listGoogleEvents: async () => ({ ok: true, events: [{ id: 'z', ...NOON }] }), now: () => NOW, logger: silent });
  const p = await failing.forDate(D);
  assert.equal(p.reliability, 'partial');
  assert.ok(!times(p).includes('12:00 PM'));
});

test('S3: keyset pagination keeps a later live row when an earlier one is cancelled mid-read', async () => {
  const rows = [];
  for (let i = 0; i < 500; i++) rows.push({ id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`, status: 'pending', preferred_date: '2026-09-25', preferred_time: '11:00 AM' });
  rows.push({ id: 'ffffffff-0000-4000-8000-000000000000', status: 'pending', preferred_date: D, preferred_time: '12:00 PM' });
  const sb = fakeSupabase(rows);
  let n = 0;
  sb.hooks.beforeQuery = (f, all) => { if (f.in.status && ++n === 2) all[0].status = 'cancelled'; };
  const svc = createAvailabilityService({ ...createAvailabilitySources(sb), now: () => NOW, logger: silent });
  assert.ok(!times(await svc.forDate(D)).includes('12:00 PM'));
});

test('S4: malformed calendar success is never a verified empty calendar', async () => {
  globalThis.fetch = async (url) => (String(url).includes('oauth2')
    ? new Response(JSON.stringify({ access_token: 'x' }), { status: 200 })
    : new Response('null', { status: 200 }));
  assert.equal((await listCalendarBusyEvents('c', { timeMin: 'a', timeMax: 'b' })).code, 'bad_response');
  globalThis.fetch = async (url) => (String(url).includes('oauth2')
    ? new Response(JSON.stringify({ access_token: 'x' }), { status: 200 })
    : new Response('{}', { status: 200 }));
  assert.deepEqual(await listCalendarBusyEvents('c', { timeMin: 'a', timeMax: 'b' }), { ok: true, events: [] }); // items omitted = legit empty
  const svc = createAvailabilityService({ listLiveBookings: async () => [], listGoogleEvents: async () => ({ ok: true, events: null }), now: () => NOW, logger: silent });
  assert.equal((await svc.forDate(D)).reliability, 'partial');
});

test('N1/N2: policy-only answers are not_checked with a reason; DST-gap rejection says so', async () => {
  let calls = 0;
  const svc = createAvailabilityService({ listLiveBookings: async () => { calls++; throw new Error('x'); }, now: () => NOW, logger: silent });
  const sun = await svc.forDate('2026-09-27');
  assert.deepEqual([sun.status, sun.reliability, sun.reason], ['closed', 'not_checked', 'closed_weekday']);
  const today = await svc.forDate('2026-09-23');
  assert.deepEqual([today.status, today.reliability, today.reason], ['closed', 'not_checked', 'notice']);
  assert.equal(calls, 0);
  const gap = resolveSchedulePolicy({ candidateTimes: ['2:30 AM'], weekdays: [0, 1, 2, 3, 4, 5, 6] }, {});
  const { validateRequestedSlot } = await import('../../lib/booking/schedule-policy.js');
  assert.equal(validateRequestedSlot('2026-03-08', '2:30 AM', gap, Date.parse('2026-03-01T12:00:00Z')).reason, 'nonexistent_time');
});
