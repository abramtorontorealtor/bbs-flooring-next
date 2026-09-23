// R3: optional analytics can never undo a persisted booking in the UI.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { trackBookingConversion, ADS_SEND_TO } from '../../lib/booking/conversion.js';

test('R3: all three vendors fire for a new booking (names/values unchanged)', () => {
  const calls = [];
  const win = { gtag: (...a) => calls.push(['gtag', ...a]), fbq: (...a) => calls.push(['fbq', ...a]) };
  const r = trackBookingConversion(win, 'free_measurement');
  assert.deepEqual(r.map((x) => [x.vendor, x.ok]), [['ga4', true], ['ads', true], ['meta', true]]);
  assert.equal(calls[0][2], 'book_appointment');
  assert.deepEqual(calls[1][3], { send_to: ADS_SEND_TO, value: 75.0, currency: 'CAD' });
  assert.deepEqual(calls[2].slice(1), ['track', 'Schedule', { content_name: 'Free Measurement' }]);
});

test('R3: throwing gtag does not stop Meta and never throws; non-callable gtag/fbq skipped', () => {
  const fb = [];
  const win = { gtag: () => { throw new Error('blocked'); }, fbq: (...a) => fb.push(a) };
  let r;
  assert.doesNotThrow(() => { r = trackBookingConversion(win, 'quote_booking', { quoteValue: '1200.50', productName: 'Oak' }); });
  assert.deepEqual(r.map((x) => [x.vendor, x.ok]), [['ga4', false], ['ads', false], ['meta', true]]);
  assert.deepEqual(fb[0][2], { content_name: 'Oak', value: 1200.5, currency: 'CAD' });
  assert.deepEqual(trackBookingConversion({ gtag: true, fbq: 'x' }, 'free_measurement'), []);
  assert.deepEqual(trackBookingConversion(null, 'free_measurement'), []);
  assert.doesNotThrow(() => trackBookingConversion({ fbq: () => { throw new Error('x'); } }, 'free_measurement'));
});

test('R3: both clients commit setSubmitted(true) BEFORE analytics / quote save, no raw vendor calls left', () => {
  for (const f of ['FreeMeasurementClient.jsx', 'QuoteBookingClient.jsx']) {
    const src = readFileSync(new URL(`../../components/${f}`, import.meta.url), 'utf8');
    assert.doesNotMatch(src, /window\.gtag\(|window\.fbq\(/, `${f}: vendor calls only via trackBookingConversion`);
    const sub = src.indexOf('setSubmitted(true)');
    assert.ok(sub > 0 && sub < src.indexOf('trackBookingConversion(window'), `${f}: success before analytics`);
    assert.ok(src.indexOf('if (!outcome.success) throw') < sub, `${f}: success only after persisted check`);
  }
  const q = readFileSync(new URL('../../components/QuoteBookingClient.jsx', import.meta.url), 'utf8');
  assert.ok(q.indexOf('setSubmitted(true)') < q.indexOf("'/api/quotes/send'"), 'quote save cannot undo success');
});
