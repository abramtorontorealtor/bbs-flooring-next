// Client success/conversion gating (FreeMeasurementClient + QuoteBookingClient).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interpretBookingSubmit, readJsonSafe } from '../../lib/booking/submit-result.js';

const ok = { ok: true };
const bad = { ok: false };

test('success + conversion only when res.ok && success && bookingId', () => {
  const r = interpretBookingSubmit(ok, { success: true, bookingId: 'abc', calendarSync: { status: 'failed' } });
  assert.deepEqual([r.success, r.fireConversion, r.bookingId], [true, true, 'abc']);
});

test('legacy failure shape (200, success:true, bookingId:null) is NOT success', () => {
  const r = interpretBookingSubmit(ok, { success: true, emailSent: true, bookingId: null });
  assert.equal(r.success, false);
  assert.equal(r.fireConversion, false);
});

test('non-2xx, success:false, empty/garbled body → failure, no conversion', () => {
  for (const [res, data] of [
    [bad, { success: false, error: 'We could not save your request.' }],
    [bad, { success: true, bookingId: 'x' }],
    [ok, { success: false, bookingId: 'x' }],
    [ok, null],
    [ok, 'oops'],
    [ok, { success: 'true', bookingId: 'x' }],
  ]) {
    const r = interpretBookingSubmit(res, data);
    assert.equal(r.success, false, JSON.stringify(data));
    assert.equal(r.fireConversion, false);
  }
  assert.equal(interpretBookingSubmit(bad, { success: false, error: 'nope' }).error, 'nope');
});

test('duplicate resubmit → success shown, conversion NOT fired again', () => {
  const r = interpretBookingSubmit(ok, { success: true, emailSent: false, bookingId: 'existing', duplicate: true });
  assert.deepEqual([r.success, r.duplicate, r.fireConversion], [true, true, false]);
});

test('readJsonSafe never throws', async () => {
  assert.equal(await readJsonSafe({ json: async () => { throw new SyntaxError('x'); } }), null);
  assert.deepEqual(await readJsonSafe({ json: async () => ({ a: 1 }) }), { a: 1 });
});
