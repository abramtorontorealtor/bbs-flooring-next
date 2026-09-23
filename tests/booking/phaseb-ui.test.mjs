// B3 picker model + B4 alternate-time + /api/contact core (real handler, fake Supabase) + source guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  BOOKING_COPY, pickerView, reconcileSelection, isCalendarDateDisabled, isoFromCalendarDate,
  firstCandidateDate, formatBookingDate, submitFailure, newIdempotencyKey, PRIMARY_COUNT,
} from '../../lib/booking/picker-model.js';
import { buildAlternateTimeRequest, interpretAlternateResponse, ALTERNATE_SOURCE } from '../../lib/booking/alternate-time.js';
import { handleContact } from '../../lib/contact/contact-handler.js';

const NOW = Date.parse('2026-09-23T16:00:00Z'); // Wed noon ET
const slot = (time, start) => ({ id: time, time, start, end: start });
const R = (slots, extra = {}) => ({ date: '2026-10-05', status: 'ok', reliability: 'complete', slots, ...extra });

test('B3: first 3 earliest in chronological order, See more reveals the rest, fewer when fewer exist', () => {
  const slots = [slot('5:00 PM', '2026-10-05T21:00:00Z'), slot('11:00 AM', '2026-10-05T15:00:00Z'), slot('1:30 PM', '2026-10-05T17:30:00Z'), slot('11:30 AM', '2026-10-05T15:30:00Z')];
  const v = pickerView(R(slots));
  assert.equal(PRIMARY_COUNT, 3);
  assert.deepEqual(v.primary.map((s) => s.time), ['11:00 AM', '11:30 AM', '1:30 PM']);
  assert.deepEqual([v.hasMore, v.more.length, v.total], [true, 0, 4]);
  assert.deepEqual(pickerView(R(slots), { expanded: true }).more.map((s) => s.time), ['5:00 PM']);
  const two = pickerView(R(slots.slice(0, 2)));
  assert.deepEqual([two.primary.length, two.hasMore], [2, false]);
});

test('B3: states — loading / none / closed / unavailable / partial; no scarcity copy anywhere', () => {
  assert.equal(pickerView(null, { loading: true }).state, 'loading');
  assert.equal(pickerView(R([])).state, 'none');
  assert.equal(pickerView(R([], { reason: 'cap_reached' })).state, 'none');
  assert.equal(pickerView({ status: 'closed', slots: [] }).state, 'closed');
  assert.equal(pickerView({ status: 'unavailable', slots: [] }).state, 'unavailable');
  assert.equal(pickerView(null, { error: true }).state, 'unavailable');
  assert.equal(pickerView(R([slot('11:00 AM', '2026-10-05T15:00:00Z')], { reliability: 'partial' })).message, BOOKING_COPY.partial);
  const all = JSON.stringify(BOOKING_COPY);
  assert.doesNotMatch(all, /limited|only \d|remaining|hurry|left|book now|spots|same-week|fully booked/i);
  assert.equal(BOOKING_COPY.submit, 'Request My Free Consultation');
  assert.equal(BOOKING_COPY.success, "Your request is in. We'll confirm your appointment by email.");
});

test('B3: stale selected time is cleared on date change / refresh; kept while still offered', () => {
  const r = R([slot('11:00 AM', '2026-10-05T15:00:00Z')]);
  assert.equal(reconcileSelection('11:00 AM', r, '2026-10-05'), '11:00 AM');
  assert.equal(reconcileSelection('1:30 PM', r, '2026-10-05'), '');
  assert.equal(reconcileSelection('11:00 AM', r, '2026-10-06'), '');
  assert.equal(reconcileSelection('', r, '2026-10-05'), '');
});

test('B3: dates come from calendar components (no locale shift); coarse disabling; ET formatting', () => {
  assert.equal(isoFromCalendarDate(new Date(2026, 9, 5)), '2026-10-05');
  assert.equal(isCalendarDateDisabled(new Date(2026, 8, 23), NOW), true, 'today');
  assert.equal(isCalendarDateDisabled(new Date(2026, 8, 24), NOW), false, 'tomorrow noon+ still has starts');
  assert.equal(isCalendarDateDisabled(new Date(2026, 8, 27), NOW), true, 'Sunday');
  assert.equal(isCalendarDateDisabled(new Date(2026, 11, 30), NOW), true, 'beyond 60-day horizon');
  const lateNow = Date.parse('2026-09-23T22:30:00Z'); // 6:30 PM ET: every Thu start < 24 h away
  assert.equal(isCalendarDateDisabled(new Date(2026, 8, 24), lateNow), true);
  assert.equal(firstCandidateDate(lateNow), '2026-09-25');
  assert.equal(formatBookingDate('2026-11-01'), 'Sunday, November 1, 2026');
  assert.equal(formatBookingDate('bad'), '');
});

test('B2/B3: submit failure mapping (409 keeps refreshed options, 400, 503/429 retry) + idempotency key shape', () => {
  const av = R([]);
  assert.deepEqual(submitFailure(409, { code: 'slot_unavailable', error: 'taken', availability: av }), { kind: 'slot_taken', message: 'taken', availability: av });
  assert.equal(submitFailure(400, { code: 'invalid_slot', error: 'x' }).kind, 'invalid_slot');
  assert.equal(submitFailure(503, {}).kind, 'retry');
  assert.equal(submitFailure(429, {}).kind, 'retry');
  assert.equal(submitFailure(500, {}).kind, 'error');
  const k = newIdempotencyKey();
  assert.match(k, /^[A-Za-z0-9_-]{16,128}$/);
  assert.notEqual(k, newIdempotencyKey());
});

test('B4: alternate-time request is a structured contact lead (no booking fields), validated', () => {
  const b = buildAlternateTimeRequest({ name: ' Karen ', phone: '(416) 555-0100', preferences: 'weekday evenings' },
    { postalCode: 'L3R 0A1', projectType: 'vinyl', flooringInterests: ['Laminate'], products: 'Vidar', page: 'free-measurement', triedDate: '2026-10-05' });
  assert.equal(b.ok, true);
  assert.equal(b.body.source, ALTERNATE_SOURCE);
  assert.equal(b.body.name, 'Karen');
  assert.ok(!('email' in b.body));
  assert.match(b.body.message, /^MEASUREMENT: ALTERNATE TIME REQUEST \(no appointment booked\)/);
  assert.match(b.body.message, /Preferred days\/times: weekday evenings/);
  assert.match(b.body.message, /Postal code: L3R 0A1/);
  for (const k of ['preferred_date', 'preferred_time', 'booking', 'status']) assert.ok(!(k in b.body));
  assert.equal(buildAlternateTimeRequest({ name: 'K', phone: '123', preferences: 'x' }).ok, false);
  assert.equal(buildAlternateTimeRequest({ name: 'K', phone: '4165550100', preferences: '' }).ok, false);
  assert.equal(buildAlternateTimeRequest({ name: 'K', phone: '4165550100', email: 'nope', preferences: 'x' }).ok, false);
  assert.equal(buildAlternateTimeRequest({ name: '', phone: '4165550100', preferences: 'x' }).ok, false);
});

test('B4: only a persistence receipt counts as received', () => {
  assert.equal(interpretAlternateResponse(200, { success: true, saved: true }).kind, 'received');
  assert.equal(interpretAlternateResponse(200, { success: true }).kind, 'unconfirmed', 'spam-filtered/legacy answer is not claimed as saved');
  assert.equal(interpretAlternateResponse(500, { success: false }).kind, 'retry');
  assert.equal(interpretAlternateResponse(429, {}).kind, 'retry');
  assert.equal(interpretAlternateResponse(400, { error: 'Name required' }).kind, 'invalid');
});

// ── /api/contact core (real handler) ─────────────────────────────────────
function contactDeps({ insertError = null, identifyThrows = false, spam = false, db = true, limitOk = true } = {}) {
  const calls = { insert: [], mail: [], telegram: 0, identify: 0 };
  const sb = {
    from(t) {
      return {
        insert(row) {
          calls.insert.push([t, row]);
          return { select: () => ({ maybeSingle: async () => (insertError ? { data: null, error: insertError } : { data: { id: 'lead-1' }, error: null }) }) };
        },
      };
    },
  };
  const mailFn = (n) => async (a) => { calls.mail.push([n, a]); return { success: true }; };
  return {
    calls,
    deps: {
      getSupabase: () => (db ? sb : null),
      checkRateLimit: () => ({ ok: limitOk, resetAt: Date.now() + 1000 }),
      getClientIP: () => 'ip',
      detectSpamLead: () => ({ spam, reason: spam ? 'honeypot' : null }),
      getVisitorIdFromRequest: () => null,
      identifyVisitor: async () => { calls.identify++; if (identifyThrows) throw new Error('identity down'); },
      email: { sendContactAdminNotification: mailFn('admin'), sendContactCustomerConfirmation: mailFn('customer'), sendRemovalEstimateCustomerConfirmation: mailFn('rc'), sendRemovalEstimateAdminNotification: mailFn('ra') },
      sendTelegramAlert: async () => { calls.telegram++; },
      formatContactAlert: (x) => JSON.stringify(x),
      logger: { warn() {}, error() {}, log() {} },
    },
  };
}
const creq = (body) => ({ json: async () => body });
const ALT = buildAlternateTimeRequest({ name: 'Karen', phone: '416-555-0100', preferences: 'Sat morning' }, { postalCode: 'L3R 0A1' }).body;

test('B4 contact: alternate-time saved → 200 saved:true + id, row in contact_leads with the custom source, admin email + Telegram, no customer mail without email', async () => {
  const { calls, deps } = contactDeps();
  const r = await handleContact(creq(ALT), deps);
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { success: true, saved: true, id: 'lead-1' });
  assert.equal(calls.insert[0][0], 'contact_leads');
  assert.equal(calls.insert[0][1].source, 'measurement_alternate_time');
  assert.equal(calls.insert[0][1].status, 'new');
  assert.deepEqual(calls.mail.map((m) => m[0]), ['admin']);
  assert.equal(calls.telegram, 1);
});

test('B4 contact: identity-link failure after the insert is NOT a failure (no duplicate resubmits)', async () => {
  const { calls, deps } = contactDeps({ identifyThrows: true });
  const r = await handleContact(creq({ ...ALT, email: 'k@example.com' }), deps);
  assert.deepEqual([r.status, r.body.saved], [200, true]);
  assert.deepEqual(calls.mail.map((m) => m[0]), ['admin', 'customer']);
});

test('B4 contact: insert failure → 500 generic (no raw DB text), no alerts; no DB → 503; spam → 200 without receipt; 429; 400', async () => {
  const f = contactDeps({ insertError: { message: 'permission denied for table contact_leads' } });
  const r = await handleContact(creq(ALT), f.deps);
  assert.equal(r.status, 500);
  assert.doesNotMatch(r.body.error, /permission|contact_leads/);
  assert.equal(f.calls.mail.length + f.calls.telegram, 0);
  assert.equal((await handleContact(creq(ALT), contactDeps({ db: false }).deps)).status, 503);
  const s = await handleContact(creq(ALT), contactDeps({ spam: true }).deps);
  assert.deepEqual([s.status, s.body], [200, { success: true }]);
  assert.equal((await handleContact(creq(ALT), contactDeps({ limitOk: false }).deps)).status, 429);
  assert.equal((await handleContact(creq({ name: 'x' }), contactDeps().deps)).status, 400);
  assert.equal((await handleContact({ json: async () => { throw new Error('bad'); } }, contactDeps().deps)).status, 400);
});

// ── Source guards (UI wiring; hydrated behaviour is a preview check) ──────
test('B3/B4 source guards: all three clients use SlotPicker; no preset time lists, scarcity or static next-available claims', () => {
  for (const f of ['FreeMeasurementClient.jsx', 'QuoteBookingClient.jsx', 'ViewBookingClient.jsx']) {
    const src = readFileSync(new URL(`../../components/${f}`, import.meta.url), 'utf8');
    assert.match(src, /<SlotPicker/, f);
    assert.doesNotMatch(src, /allTimeSlots|TIME_SLOTS|Spots are limited|Next Available|Same-Week|getNextAvailableDate/, f);
  }
  for (const f of ['FreeMeasurementClient.jsx', 'QuoteBookingClient.jsx']) {
    const src = readFileSync(new URL(`../../components/${f}`, import.meta.url), 'utf8');
    assert.match(src, /'Idempotency-Key': idemKey/, f);
    assert.match(src, /<AlternateTimePanel/, f);
    assert.match(src, /BOOKING_COPY\.submit\b/, f);
    assert.match(src, /submitFailure\(res\.status, data\)/, f);
  }
  const view = readFileSync(new URL('../../components/ViewBookingClient.jsx', import.meta.url), 'utf8');
  assert.match(view, /token=\{booking\?\.lookup_token/);
  const page = readFileSync(new URL('../../app/free-measurement/page.jsx', import.meta.url), 'utf8');
  assert.match(page, /Free In-Home Flooring Consultation &amp; Measurement/);
  assert.doesNotMatch(page, /Same-Week/);
  const panel = readFileSync(new URL('../../components/booking/AlternateTimePanel.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(panel, /booking\/confirm|trackBookingConversion|gtag|fbq/, 'no booking row / conversion from the fallback');
  assert.match(panel, /if \(sending\) return/);
  const picker = readFileSync(new URL('../../components/booking/SlotPicker.jsx', import.meta.url), 'utf8');
  assert.match(picker, /cache: 'no-store'/);
  assert.match(picker, /type="button"/);
});
