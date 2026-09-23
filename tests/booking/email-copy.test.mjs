// Pending-aware reschedule email copy (A4, PLAN item 9, decision 9(3)).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bookingRescheduledCopy } from '../../lib/booking/email-copy.js';

const D = 'Monday, October 5, 2026';

test('customer reschedule → requested + pending confirmation, BBS will confirm, no response-time promise', () => {
  const c = bookingRescheduledCopy({ actor: 'customer', newDate: D });
  assert.equal(c.pending, true);
  assert.match(c.intro, /pending confirmation/);
  assert.match(c.intro, /requested/);
  assert.match(c.intro, /will confirm/);
  assert.match(c.subject, /pending confirmation/);
  assert.ok(c.subject.includes(D));
  for (const s of [c.title, c.intro, c.subject]) {
    assert.doesNotMatch(s, /within|hours?\b|minutes?|today|asap|guarantee/i, 'no new response-time promise');
    assert.doesNotMatch(s, /has been rescheduled/i);
  }
});

test('admin (and missing actor) → pre-A4 copy unchanged', () => {
  for (const actor of ['admin', undefined]) {
    const c = bookingRescheduledCopy({ actor, newDate: D });
    assert.equal(c.pending, false);
    assert.equal(c.title, 'Your Measurement Has Been Rescheduled');
    assert.equal(c.intro, 'Your measurement appointment has been rescheduled. Here are the updated details:');
    assert.equal(c.subject, `📅 Measurement Rescheduled — ${D}`);
  }
});

test('lib/email.js sendBookingRescheduled renders the builder with actor', () => {
  const src = readFileSync(new URL('../../lib/email.js', import.meta.url), 'utf8');
  const fn = src.slice(src.indexOf('export async function sendBookingRescheduled'), src.indexOf('export async function sendBookingCancelled'));
  assert.match(fn, /\{ booking, oldDate, oldTime, actor \}/);
  assert.match(fn, /bookingRescheduledCopy\(\{ actor, newDate \}\)/);
  assert.match(fn, /emailWrapper\(copy\.title/);
  assert.match(fn, /subject: copy\.subject/);
  assert.doesNotMatch(fn, /has been rescheduled\. Here are/, 'no hard-coded admin copy left');
});

test('customer success screen shows pending status after reschedule (inventory §4, unchanged)', () => {
  const src = readFileSync(new URL('../../components/ViewBookingClient.jsx', import.meta.url), 'utf8');
  assert.match(src, /pending: \{[^}]*Awaiting Confirmation/);
  // B3: the reschedule success merges the returned customer DTO into the shown booking.
  assert.match(src, /action: 'reschedule'[\s\S]{0,600}setBooking\((?:data\.booking|\(b\) => \(\{ \.\.\.b, \.\.\.data\.booking \}\))\)/);
});
