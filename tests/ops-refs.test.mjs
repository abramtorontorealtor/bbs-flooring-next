import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenizeFacts, phone10, smsHref, smsDraft, cardPhones } from '@/lib/ops/refs';

test('tokenize comms, range, emails, lead, phone, email', () => {
  const t = tokenizeFacts('Sorted (comms:2589). Drawers (comms:2602-2603). Paid (emails:1735). lead f24d4c29 call 437-778-9049 or 4168243704, a@b.com');
  const by = (k) => t.filter((x) => x.type === k);
  assert.deepEqual(by('comms').map((x) => [x.id, x.to]), [[2589, undefined], [2602, 2603]]);
  assert.equal(by('emails')[0].id, 1735);
  assert.equal(by('lead')[0].id, 'f24d4c29');
  assert.deepEqual(by('phone').map((x) => x.p10), ['4377789049', '4168243704']);
  assert.equal(by('email')[0].address, 'a@b.com');
  assert.equal(t.map((x) => x.text).join(''), 'Sorted (comms:2589). Drawers (comms:2602-2603). Paid (emails:1735). lead f24d4c29 call 437-778-9049 or 4168243704, a@b.com');
});
test('non-phones are left alone', () => {
  for (const s of ['EST 4902', 'INV 101080', 'PO 11744', '$11,260 Est 4883', 'INV 101096 $5,916.23']) assert.ok(tokenizeFacts(s).every((x) => x.type === 'text'), s);
});
test('email beats phone; phone10/sms', () => {
  assert.equal(tokenizeFacts('4165551234@x.com')[0].type, 'email');
  assert.equal(phone10('+1 (416) 824-3704'), '4168243704');
  assert.equal(smsHref('4168243704', 'Hi A'), 'sms:+14168243704?&body=Hi%20A');
});
test('draft + card phones', () => {
  assert.equal(smsDraft({ label: 'John Lim — call', meta: {} }), "Hi John, it's Abram from BBS Flooring — ");
  assert.equal(smsDraft({ label: 'x', meta: { draft: 'Yo\nthere' } }), 'Yo there');
  assert.deepEqual(cardPhones({ label: 'K. Suri', meta: { phone: '6478089142', facts: 'also 437-778-9049' } }), ['6478089142', '4377789049']);
});
