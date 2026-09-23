// Parent finding on R14: send-followup must not report a log-only call as logged when
// the lead_follow_ups insert (or next_follow_up_date update) failed. Real handler core,
// fake Supabase transport; no network.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleSendFollowup } from '../../lib/followup/send-followup.js';
import { buildBookingFollowUpLog } from '../../lib/booking/crm-followup.js';

const silent = { error() {}, warn() {}, log() {} };

function fakeSb({ insertError = null, insertThrows = false, updateError = null, updateRows = 1 } = {}) {
  const calls = [];
  return {
    calls,
    from(table) {
      return {
        insert(row) {
          calls.push(['insert', table, row]);
          if (insertThrows) throw new Error('socket');
          return Promise.resolve({ error: insertError });
        },
        update(body) {
          const q = {
            eq(c, v) { calls.push(['update', table, body, c, v]); return q; },
            select() { return Promise.resolve(updateError ? { data: null, error: updateError } : { data: Array.from({ length: updateRows }, () => ({ id: 'x' })), error: null }); },
          };
          return q;
        },
      };
    },
  };
}

function deps(sb, { emailOk = true, admin = true } = {}) {
  const sent = [];
  return {
    sent,
    requireAdmin: async () => (admin ? { error: null } : { error: { status: 403 } }),
    getSupabase: () => sb,
    sendFollowUpEmail: async (a) => { sent.push(a); return emailOk ? { success: true } : { success: false, reason: 'brevo' }; },
    logger: silent,
  };
}
const req = (body) => ({ json: async () => body });
const lead = { source: 'booking', entityId: 'b-1', email: 'k@example.com' };
const logOnly = (over = {}) => ({ ...buildBookingFollowUpLog(lead, { outcome: 'contacted', nextFollowUpDate: '2026-09-30' }), ...over });

test('log-only booking follow-up: insert + next date ok → 200 logged, no email, bookings gets next_follow_up_date only', async () => {
  const sb = fakeSb();
  const d = deps(sb);
  const r = await handleSendFollowup(req(logOnly()), d);
  assert.equal(r.status, 200);
  assert.deepEqual([r.body.success, r.body.logged, r.body.emailSent, r.body.nextFollowUpSaved], [true, true, false, true]);
  assert.equal(d.sent.length, 0);
  const upd = sb.calls.find((c) => c[0] === 'update');
  assert.deepEqual([upd[1], upd[2]], ['bookings', { next_follow_up_date: '2026-09-30' }]);
  assert.ok(!('status' in upd[2]));
});

for (const [label, opts] of [['insert error', { insertError: { message: 'rls' } }], ['insert throws', { insertThrows: true }]]) {
  test(`log-only: ${label} → 500 success:false logged:false, no date write, no email`, async () => {
    const sb = fakeSb(opts);
    const d = deps(sb);
    const r = await handleSendFollowup(req(logOnly()), d);
    assert.equal(r.status, 500);
    assert.deepEqual([r.body.success, r.body.logged], [false, false]);
    assert.equal(sb.calls.filter((c) => c[0] === 'update').length, 0);
    assert.equal(d.sent.length, 0);
  });
}

test('log-only: next_follow_up_date update fails / row missing → 500, logged:true, nextFollowUpSaved:false', async () => {
  for (const opts of [{ updateError: { message: 'boom' } }, { updateRows: 0 }]) {
    const r = await handleSendFollowup(req(logOnly()), deps(fakeSb(opts)));
    assert.equal(r.status, 500);
    assert.deepEqual([r.body.success, r.body.logged, r.body.nextFollowUpSaved], [false, true, false]);
    assert.match(r.body.error, /no email is sent/);
  }
});

test('email sent but log fails → 200 success (never resend) with logged:false + warning', async () => {
  const sb = fakeSb({ insertError: { message: 'x' }, updateError: { message: 'y' } });
  const d = deps(sb);
  const r = await handleSendFollowup(req({ leadId: 'q1', leadSource: 'quote', to: 'a@b.co', template: 'quote_followup', nextFollowUpDate: '2026-10-01' }), d);
  assert.equal(r.status, 200);
  assert.deepEqual([r.body.success, r.body.emailSent, r.body.logged, r.body.nextFollowUpSaved], [true, true, false, false]);
  assert.match(r.body.warning, /Email sent, but/);
  assert.equal(d.sent.length, 1);
});

test('email failure → 500, nothing logged (unchanged)', async () => {
  const sb = fakeSb();
  const r = await handleSendFollowup(req({ leadId: 'q1', leadSource: 'quote', to: 'a@b.co', template: 't' }), deps(sb, { emailOk: false }));
  assert.equal(r.status, 500);
  assert.match(r.body.error, /Email failed: brevo/);
  assert.equal(sb.calls.length, 0);
});

test('no service client → 503 before any email; admin denied → passthrough; bad input → 400', async () => {
  const d = deps(null);
  const r = await handleSendFollowup(req({ leadId: 'q1', leadSource: 'quote', to: 'a@b.co', template: 't' }), d);
  assert.equal(r.status, 503);
  assert.equal(d.sent.length, 0);
  assert.deepEqual((await handleSendFollowup(req(logOnly()), deps(fakeSb(), { admin: false }))).passthrough, { status: 403 });
  assert.equal((await handleSendFollowup(req({ leadId: 'x' }), deps(fakeSb()))).status, 400);
  assert.equal((await handleSendFollowup(req({ leadId: 'x', leadSource: 'orders', template: 't' }), deps(fakeSb()))).status, 400);
  assert.equal((await handleSendFollowup({ json: async () => { throw new Error('bad'); } }, deps(fakeSb()))).status, 400);
});
