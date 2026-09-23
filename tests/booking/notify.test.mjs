// Notify adapter: type/actor → existing email senders + Telegram (same as pre-A3).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBookingNotifier, customerEmailSent } from '../../lib/booking/notify.js';
import { silentLogger } from './fakes.mjs';

function rig({ throwOn = null, failOn = null } = {}) {
  const calls = [];
  const mk = (name) => async (args) => {
    calls.push([name, args]);
    if (name === throwOn) throw new Error('boom');
    return { success: name !== failOn };
  };
  const email = Object.fromEntries(['sendBookingRequestReceived', 'sendBookingAdminNotification',
    'sendBookingCustomerConfirmation', 'sendBookingRescheduled', 'sendBookingCancelled'].map((n) => [n, mk(n)]));
  const telegram = { formatBookingAlert: (b) => `A:${b.id}`, sendTelegramAlert: mk('telegram') };
  return { calls, notify: createBookingNotifier({ email, telegram, logger: silentLogger }) };
}
const booking = { id: 'b1', customer_email: 'k@example.com' };

test('created → request-received + admin notification + Telegram', async () => {
  const { calls, notify } = rig();
  const r = await notify('created', { booking, actor: 'customer' });
  assert.deepEqual(calls.map((c) => c[0]), ['sendBookingRequestReceived', 'sendBookingAdminNotification', 'telegram']);
  assert.deepEqual(r, { customerEmailSent: true, adminEmailSent: true, telegramSent: true });
});

test('customer vs admin reschedule/cancel recipients', async () => {
  let t = rig();
  await t.notify('rescheduled', { booking, actor: 'customer', oldDate: 'd', oldTime: 't' });
  assert.deepEqual(t.calls.map((c) => c[0]), ['sendBookingRescheduled', 'sendBookingAdminNotification']);
  assert.equal(t.calls[1][1].isReschedule, true);
  t = rig();
  await t.notify('rescheduled', { booking, actor: 'admin' });
  assert.deepEqual(t.calls.map((c) => c[0]), ['sendBookingRescheduled']);
  assert.equal(t.calls[0][1].actor, 'admin');
  t = rig();
  await t.notify('cancelled', { booking, actor: 'admin', reason: 'r' });
  assert.deepEqual(t.calls.map((c) => c[0]), ['sendBookingCancelled']);
  assert.equal(t.calls[0][1].cancelledByCustomer, undefined);
  t = rig();
  await t.notify('confirmed', { booking, actor: 'admin' });
  assert.deepEqual(t.calls.map((c) => c[0]), ['sendBookingCustomerConfirmation']);
});

test('sender failures/throws are reported, never thrown', async () => {
  const { notify } = rig({ throwOn: 'sendBookingAdminNotification', failOn: 'sendBookingRequestReceived' });
  const r = await notify('created', { booking });
  assert.deepEqual(r, { customerEmailSent: false, adminEmailSent: false, telegramSent: true });
  assert.equal(customerEmailSent({ notifications: [{ type: 'created', ok: true, result: r }] }, 'created'), false);
  assert.equal(customerEmailSent({ notifications: [{ type: 'created', ok: true, result: { customerEmailSent: true } }] }, 'created'), true);
  assert.equal(customerEmailSent({ notifications: [] }), false);
});
