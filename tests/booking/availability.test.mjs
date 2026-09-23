// Phase B (B1): scheduling policy + availability core. Pure, no network.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveSchedulePolicy, zonedTimeToUtcMs, localDateOf, candidateStarts, validateRequestedSlot,
  dayInterval, parseTime12,
} from '../../lib/booking/schedule-policy.js';
import {
  computeAvailability, createAvailabilityService, publicAvailabilityView, isSlotOffered,
} from '../../lib/booking/availability.js';
import { handleAvailability } from '../../lib/booking/availability-handler.js';
import { stableEventId } from '../../lib/booking/calendar-sync.js';
import { testOwnership } from './fakes.mjs';

const P = resolveSchedulePolicy({}, {});
const at = (iso) => Date.parse(iso);
const times = (r) => r.slots.map((s) => s.time);
const ALL = ['11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '5:00 PM'];

test('policy: Toronto wall clock → UTC across DST (EDT -4, EST -5)', () => {
  assert.equal(new Date(zonedTimeToUtcMs('2026-10-05', 11 * 60)).toISOString(), '2026-10-05T15:00:00.000Z');
  assert.equal(new Date(zonedTimeToUtcMs('2026-11-02', 11 * 60)).toISOString(), '2026-11-02T16:00:00.000Z');
  // DST ends Sun Nov 1 2026: the local day is 25 h long.
  const d = dayInterval('2026-11-01', P);
  assert.equal((d.end - d.start) / 3600000, 25);
  // Spring forward Sun Mar 8 2026: 23 h.
  const s = dayInterval('2026-03-08', P);
  assert.equal((s.end - s.start) / 3600000, 23);
  // Toronto date at 03:30 UTC is still the previous day.
  assert.equal(localDateOf(at('2026-10-06T03:30:00Z')), '2026-10-05');
});

test('policy: defaults = current site behaviour (7 times, Mon–Sat, 24 h notice, 60-day horizon)', () => {
  const now = at('2026-09-23T12:00:00Z'); // Wed 8 AM ET
  assert.deepEqual(candidateStarts('2026-09-26', P, now).map((c) => c.time), ALL); // Saturday
  assert.deepEqual(candidateStarts('2026-09-27', P, now), []); // Sunday
  assert.deepEqual(candidateStarts('2026-09-23', P, now), []); // today < 24 h
  // Tomorrow: only times ≥ now + 24 h (8 AM ET tomorrow) → all 7.
  assert.equal(candidateStarts('2026-09-24', P, now).length, 7);
  // 1 PM ET now → tomorrow only 1:00 PM onward.
  const now2 = at('2026-09-23T17:00:00Z');
  assert.deepEqual(candidateStarts('2026-09-24', P, now2).map((c) => c.time), ['1:00 PM', '1:30 PM', '5:00 PM']);
  assert.equal(validateRequestedSlot('2026-11-23', '11:00 AM', P, now).reason, 'beyond_horizon');
  assert.equal(validateRequestedSlot('2026-11-21', '11:00 AM', P, now).ok, true);
});

test('policy: server-side slot validation rejects bypasses', () => {
  const now = at('2026-09-23T17:00:00Z');
  assert.equal(validateRequestedSlot('2026-09-24', '11:00 AM', P, now).reason, 'notice');
  assert.equal(validateRequestedSlot('2026-09-24', '2:15 PM', P, now).reason, 'not_offered');
  assert.equal(validateRequestedSlot('2026-09-27', '11:00 AM', P, now).reason, 'closed_weekday');
  assert.equal(validateRequestedSlot('2026-09-22', '11:00 AM', P, now).reason, 'past');
  assert.equal(validateRequestedSlot('2026-02-30', '11:00 AM', P, now).reason, 'invalid_date');
  assert.equal(validateRequestedSlot('2026-09-26', null, P, now).reason, 'missing_time');
  const closed = resolveSchedulePolicy({}, { BOOKING_CLOSED_DATES: '2026-09-26, junk' });
  assert.equal(validateRequestedSlot('2026-09-26', '11:00 AM', closed, now).reason, 'closure');
  assert.equal(parseTime12('12:00 AM'), 0);
  assert.equal(parseTime12('13:00 PM'), null);
});

const NOW = at('2026-09-23T12:00:00Z');
const D = '2026-09-26';

test('availability: live bookings block their full hour (overlapping starts too), cancelled/other dates do not', () => {
  const bookings = [
    { id: 'a1111111-1111-4111-8111-111111111111', status: 'pending', preferred_date: D, preferred_time: '12:00 PM' },
    { id: 'b2222222-2222-4222-8222-222222222222', status: 'cancelled', preferred_date: D, preferred_time: '5:00 PM' },
    { id: 'c3333333-3333-4333-8333-333333333333', status: 'completed', preferred_date: D, preferred_time: '11:00 AM' },
    { id: 'd4444444-4444-4444-8444-444444444444', status: 'confirmed', preferred_date: '2026-09-25', preferred_time: '1:00 PM' },
  ];
  const r = computeAvailability({ date: D, policy: P, nowMs: NOW, bookings });
  // 12:00–1:00 occupied → 11:30 (ends 12:30) and 12:30 (starts inside) are gone; 11:00 ends at 12:00 → free.
  assert.deepEqual(times(r), ['11:00 AM', '1:00 PM', '1:30 PM', '5:00 PM']);
  assert.equal(r.reliability, 'db_only');
});

test('availability: buffer and daily cap are configurable; untimed live booking blocks its whole day (B1-R2)', () => {
  const bookings = [{ id: 'a1111111-1111-4111-8111-111111111111', status: 'confirmed', preferred_date: D, preferred_time: '12:00 PM' }];
  const buf = resolveSchedulePolicy({}, { BOOKING_BUFFER_MINUTES: '30' });
  assert.deepEqual(times(computeAvailability({ date: D, policy: buf, nowMs: NOW, bookings })), ['1:30 PM', '5:00 PM']);
  const cap = resolveSchedulePolicy({}, { BOOKING_DAILY_CAP: '2' });
  const two = [...bookings, { id: 'e5555555-5555-4555-8555-555555555555', status: 'pending', preferred_date: D, preferred_time: null }];
  const r = computeAvailability({ date: D, policy: cap, nowMs: NOW, bookings: two });
  assert.deepEqual(r.slots, []);
  assert.equal(r.reason, 'cap_reached');
  // Untimed/unreadable live booking = whole local day occupied, never free.
  assert.deepEqual(computeAvailability({ date: D, policy: P, nowMs: NOW, bookings: [two[1]] }).slots, []);
  assert.deepEqual(computeAvailability({ date: D, policy: P, nowMs: NOW, bookings: [{ ...two[1], preferred_time: 'around noon' }] }).slots, []);
});

test('availability: Google busy — timed, all-day (exclusive end), transparent/cancelled ignored, own events not double-counted', () => {
  const own = 'a1111111-1111-4111-8111-111111111111';
  const bookings = [
    { id: own, status: 'pending', preferred_date: D, preferred_time: '5:00 PM', ownership_proof: testOwnership.signRow(own) },
    { id: 'f6666666-6666-4666-8666-666666666666', status: 'cancelled', preferred_date: D, preferred_time: '11:00 AM', calendar_event_id: 'legacyevt1',
      calendar_event_proof: testOwnership.signEvent('f6666666-6666-4666-8666-666666666666', 'legacyevt1') },
  ];
  const googleEvents = [
    { id: stableEventId(own), status: 'confirmed', start: { dateTime: '2026-09-26T17:00:00-04:00' }, end: { dateTime: '2026-09-26T18:00:00-04:00' } },
    { id: 'legacyevt1', status: 'confirmed', start: { dateTime: '2026-09-26T13:00:00-04:00' }, end: { dateTime: '2026-09-26T14:00:00-04:00' } },
    { id: 'x1', status: 'confirmed', start: { dateTime: '2026-09-26T11:15:00-04:00' }, end: { dateTime: '2026-09-26T11:45:00-04:00' } },
    { id: 'x2', status: 'confirmed', transparency: 'transparent', start: { dateTime: '2026-09-26T12:00:00-04:00' }, end: { dateTime: '2026-09-26T15:00:00-04:00' } },
    { id: 'x3', status: 'cancelled', start: { dateTime: '2026-09-26T12:00:00-04:00' }, end: { dateTime: '2026-09-26T15:00:00-04:00' } },
    { id: 'x4', status: 'confirmed', start: { date: '2026-09-25' }, end: { date: '2026-09-26' } }, // ends before D
  ];
  const r = computeAvailability({ date: D, policy: P, nowMs: NOW, bookings, googleEvents, ownership: testOwnership });
  // x1 kills 11:00 + 11:30. Own pending booking kills 5:00 via the DB row (once). legacyevt1 is ours (cancelled row) → ignored.
  assert.deepEqual(times(r), ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM']);
  assert.equal(r.reliability, 'full');
  const allDay = computeAvailability({ date: D, policy: P, nowMs: NOW, bookings: [], googleEvents: [{ id: 'y', status: 'confirmed', start: { date: D }, end: { date: '2026-09-27' } }] });
  assert.deepEqual(allDay.slots, []);
});

test('availability: reschedule excludes only the authenticated booking', () => {
  const mine = 'a1111111-1111-4111-8111-111111111111';
  const bookings = [
    { id: mine, status: 'pending', preferred_date: D, preferred_time: '12:00 PM' },
    { id: 'b2222222-2222-4222-8222-222222222222', status: 'confirmed', preferred_date: D, preferred_time: '1:30 PM' },
  ];
  const r = computeAvailability({ date: D, policy: P, nowMs: NOW, bookings, excludeBookingId: mine });
  assert.ok(isSlotOffered(r, '12:00 PM'));
  assert.ok(!isSlotOffered(r, '1:30 PM'));
  assert.ok(!isSlotOffered(r, '1:00 PM')); // 1:00–2:00 overlaps the other booking
});

test('service: DB failure → unavailable (never free); Google failure/timeout → partial, DB-checked only', async () => {
  const dbDown = createAvailabilityService({ listLiveBookings: async () => { throw new Error('db down'); }, now: () => NOW, logger: { error() {}, warn() {} } });
  const u = await dbDown.forDate(D);
  assert.equal(u.status, 'unavailable');
  assert.deepEqual(u.slots, []);

  const hang = createAvailabilityService({
    listLiveBookings: async () => [],
    listGoogleEvents: () => new Promise(() => {}),
    googleBudgetMs: 30, now: () => NOW, logger: { error() {}, warn() {} },
  });
  const p = await hang.forDate(D);
  assert.equal(p.reliability, 'partial');
  assert.equal(p.slots.length, 7);

  const denied = createAvailabilityService({ listLiveBookings: async () => [], listGoogleEvents: async () => ({ ok: false, error: '403' }), now: () => NOW, logger: { warn() {} } });
  assert.equal((await denied.forDate(D)).reliability, 'partial');
});

test('public DTO carries no PII / ids', () => {
  const bookings = [{ id: 'a1111111-1111-4111-8111-111111111111', status: 'pending', preferred_date: D, preferred_time: '12:00 PM', customer_name: 'Karen', lookup_token: 'tok' }];
  const v = JSON.stringify(publicAvailabilityView(computeAvailability({ date: D, policy: P, nowMs: NOW, bookings })));
  assert.ok(!/Karen|tok|a1111111|bbs/.test(v), v);
});

const req = (url) => ({ url, headers: { get: () => null } });
const baseDeps = (over = {}) => ({
  logger: { error() {}, warn() {} },
  getClientIP: () => '203.0.113.9',
  checkRateLimit: () => ({ ok: true, remaining: 10, resetAt: Date.now() + 1000 }),
  ...over,
});

test('handler: no-store, 400 bad date, 429, 503 on DB outage, token resolves to own booking only', async () => {
  const mine = 'a1111111-1111-4111-8111-111111111111';
  const rows = [{ id: mine, status: 'pending', preferred_date: D, preferred_time: '12:00 PM', lookup_token: 'tok-1' }];
  const availability = createAvailabilityService({ listLiveBookings: async () => rows, now: () => NOW });
  const deps = baseDeps({ availability, findBookingByToken: async (t) => rows.find((r) => r.lookup_token === t) || null });

  const ok = await handleAvailability(req(`https://x/api/booking/availability?date=${D}`), deps);
  assert.equal(ok.status, 200);
  assert.match(ok.headers['Cache-Control'], /no-store/);
  assert.ok(!ok.body.slots.some((s) => s.time === '12:00 PM'));

  const own = await handleAvailability(req(`https://x/api/booking/availability?date=${D}&token=tok-1`), deps);
  assert.ok(own.body.slots.some((s) => s.time === '12:00 PM'));
  const wrong = await handleAvailability(req(`https://x/api/booking/availability?date=${D}&token=guess`), deps);
  assert.ok(!wrong.body.slots.some((s) => s.time === '12:00 PM'));
  // Public excludeBookingId is ignored.
  const forged = await handleAvailability(req(`https://x/api/booking/availability?date=${D}&excludeBookingId=${mine}`), deps);
  assert.ok(!forged.body.slots.some((s) => s.time === '12:00 PM'));

  assert.equal((await handleAvailability(req('https://x/api/booking/availability?date=2026-9-1'), deps)).status, 400);
  const limited = await handleAvailability(req(`https://x/api/booking/availability?date=${D}`), baseDeps({ availability, checkRateLimit: () => ({ ok: false, resetAt: Date.now() + 5000 }) }));
  assert.equal(limited.status, 429);
  assert.match(limited.headers['Cache-Control'], /no-store/);
  const down = createAvailabilityService({ listLiveBookings: async () => { throw new Error('x'); }, now: () => NOW, logger: { error() {} } });
  const r503 = await handleAvailability(req(`https://x/api/booking/availability?date=${D}`), baseDeps({ availability: down }));
  assert.equal(r503.status, 503);
  assert.deepEqual(r503.body.slots, []);
  assert.equal((await handleAvailability(req(`https://x/api/booking/availability?date=${D}`), baseDeps())).status, 503);
});
