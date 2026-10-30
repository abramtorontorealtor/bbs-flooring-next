// lib/leadContext.js — never throws, respects its budget, degrades section by section.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLeadContext, fsaToCity, normalizePhone10, trimToTelegram } from '../lib/leadContext.js';

const NOW = new Date('2026-10-30T15:00:00Z');
const VID = '6f1c2d3e-4a5b-4c6d-8e7f-001122334455';
const silent = { warn() {}, error() {}, log() {} };
const daysAgo = (n) => new Date(NOW.getTime() - n * 86400000).toISOString();

// Chainable, thenable fake. `mode[table]` = 'reject' | 'hang' alters the outcome.
function fakeSupabase(fixtures, mode = {}) {
  const calls = [];
  return {
    calls,
    from(table) {
      const b = { table, ops: [] };
      for (const m of ['select', 'eq', 'or', 'in', 'order', 'limit', 'gt', 'gte', 'lt', 'filter', 'ilike']) {
        b[m] = (...a) => { b.ops.push([m, ...a]); return b; };
      }
      b.then = (resolve, reject) => {
        calls.push(b);
        if (mode[table] === 'hang') return undefined; // never settles
        if (mode[table] === 'reject') return Promise.reject(new Error('boom ' + table)).then(resolve, reject);
        return Promise.resolve({ data: fixtures[table] || [], error: null }).then(resolve, reject);
      };
      return b;
    },
  };
}

const fixtures = {
  cart_items: [
    { product_name: 'Oak <b>&', variant_label: 'Natural', item_type: 'product', boxes_required: 12, actual_sqft: 240.5, line_total: 1234.4, created_at: daysAgo(0) },
    { product_name: 'T-moulding', item_type: 'transition', quantity: 3, line_total: 90, created_at: daysAgo(0) },
  ],
  site_events: [
    { event_type: 'add_to_cart', path: '/p/x', created_at: daysAgo(2), utm: {} },
    { event_type: 'pdp_view', product_name: 'Oak <b>&', path: '/p/x', created_at: daysAgo(3), utm: {} },
    { event_type: 'planner_view', path: '/planner', created_at: daysAgo(3), utm: {} },
    { event_type: 'search', path: '/s', meta: { q: 'vinyl' }, created_at: daysAgo(4), utm: {} },
    { event_type: 'pageview', path: '/', created_at: daysAgo(5), utm: { utm_source: 'google', utm_medium: 'cpc' } },
  ],
  quotes: [{ customer_email: 'a@b.ca', total: 4321, product_name: 'Oak', square_footage: 500, status: 'sent', created_at: daysAgo(10) }],
  bookings: [{ customer_email: 'a@b.ca', preferred_date: '2026-10-12', service_type: 'free_measure', status: 'confirmed', quote_total: 1500, created_at: daysAgo(9) }],
  orders: [{ customer_email: 'a@b.ca', order_number: 'BBS-1', total: 999, status: 'paid', payment_status: 'succeeded', created_at: daysAgo(8) }],
  contact_leads: [{ email: 'a@b.ca', source: 'footer', message: 'Hello <there>', created_at: daysAgo(7) }],
  comms_events: [
    { from_number: '+16474281111', to_number: '+16475551234', direction: 'Outbound', transcription: 'hi there', event_time: daysAgo(1) },
    { from_number: '+16475551234', to_number: '+16474281111', direction: 'Inbound', is_missed: false, call_summary: 'wants 500 sqft', call_ai: { stage: 'quote', wants: 'vinyl plank', sqft: 500 }, event_time: daysAgo(2) },
    { from_number: '+16475551234', to_number: '+16474281111', direction: 'Inbound', is_missed: true, event_time: daysAgo(3) },
  ],
  lead_spine: [{ id: 7, phone10: '6475551234', qb_customer_name: 'Smith & Co', stage: 'quoted', ball_in_court: 'us', intent: 'buy', suggested_reply: 'Call <him>', verdict: { why: 'warm', asked_for: 'price', money_est: 5000 } }],
  lead_spine_links: [{ source_id: '1042', event_at: daysAgo(6) }],
  brief_items: [{ id: 55, label: 'Follow up Smith', meta: {} }],
};
const ids = { email: 'A@B.ca', phone: '+1 (647) 555-1234', session_id: 's1', visitor_id: VID, address: '1 Main St', postal_code: 'L3R 4N6' };

test('happy path: every section, formatting, escaping', async () => {
  const r = await buildLeadContext(fakeSupabase(fixtures), ids, { now: () => NOW, logger: silent });
  assert.deepEqual(r.sections, ['address', 'cart', 'journey', 'history', 'comms', 'spine', 'footer']);
  assert.equal(r.timedOut, false);
  assert.equal(r.html, r.lines.join('<br>'));
  assert.equal(r.text, r.lines.join('\n'));
  const t = r.text;
  assert.match(t, /Directions from showroom<\/a> · Markham/);
  assert.match(t, /Oak &lt;b&gt;&amp; · Natural · 12 bx \/ 240.5 sqft · \$1,234/);
  assert.match(t, /T-moulding ×3 · \$90/);
  assert.match(t, /Total \$1,324 \(2 lines\)/);
  assert.match(t, /First visit Oct 25 \(5d ago\)/);
  assert.match(t, /Source: google\/cpc/);
  assert.match(t, /Days active: 4/);
  assert.match(t, /Viewed: Oak &lt;b&gt;&amp;/);
  assert.match(t, /Used: planner · search: "vinyl"/);
  assert.match(t, /Add to cart ×1/);
  assert.match(t, /History<\/b> \(1 quote · 1 booking · 1 order/);
  assert.match(t, /Quote \$4,321 · Oak 500 sqft · sent · Oct 20/);
  assert.match(t, /Booking Oct 12 · free measure · confirmed · \$1,500/);
  assert.match(t, /Order BBS-1 \$999 · paid\/succeeded/);
  assert.match(t, /Contact \[footer\].*"Hello &lt;there&gt;"/);
  assert.match(t, /2 calls \(1 missed\) · 1 text · last: Outbound/);
  assert.match(t, /Last call read: quote — vinyl plank · 500 sqft/);
  assert.match(t, /QB customer: Smith &amp; Co/);
  assert.match(t, /Estimates: #1042/);
  assert.match(t, /Read: quoted · ball: us · intent: buy/);
  assert.match(t, /Money est: \$5,000/);
  assert.match(t, /Suggested reply: <i>Call &lt;him&gt;<\/i>/);
  assert.match(t, /Board card #55 · Follow up Smith/);
  assert.ok(!/<b>&|Oak <b>/.test(t.replace(/<b>[^<]*<\/b>/g, '')), 'no raw db html leaks');
  assert.ok(r.lines.includes(''), 'blank line between sections');
});

test('own-submission row (created seconds ago) is excluded from history', async () => {
  const fx = { ...fixtures, contact_leads: [{ email: 'a@b.ca', source: 'x', message: 'me', created_at: new Date(NOW.getTime() - 5000).toISOString() }] };
  const r = await buildLeadContext(fakeSupabase(fx), ids, { now: () => NOW, logger: silent });
  assert.ok(!/Contact \[/.test(r.text));
});

test('a rejecting table drops only its section', async () => {
  const r = await buildLeadContext(fakeSupabase(fixtures, { cart_items: 'reject', comms_events: 'reject' }), ids, { now: () => NOW, logger: silent });
  assert.ok(!r.sections.includes('cart') && !r.sections.includes('comms'));
  assert.ok(r.sections.includes('journey') && r.sections.includes('history') && r.sections.includes('footer'));
  assert.equal(r.timedOut, false);
});

test('budget: a hanging table cannot block past budgetMs', async () => {
  const t0 = Date.now();
  const r = await buildLeadContext(fakeSupabase(fixtures, { site_events: 'hang' }), ids, { budgetMs: 50, now: () => NOW, logger: silent });
  assert.ok(Date.now() - t0 < 300, 'returned promptly');
  assert.equal(r.timedOut, true);
  assert.ok(!r.sections.includes('journey'));
  assert.ok(r.sections.includes('cart') && r.sections.includes('address'));
});

test('fsaToCity', () => {
  assert.equal(fsaToCity('L3R 4N6'), 'Markham');
  assert.equal(fsaToCity('M1B 2K3'), 'Scarborough');
  assert.equal(fsaToCity('L5N 1A1'), 'Mississauga');
  assert.equal(fsaToCity('12 King St, Toronto m5v2t6'), 'Toronto');
  assert.equal(fsaToCity('XYZ'), null);
  assert.equal(fsaToCity(null), null);
});

test('normalizePhone10', () => {
  assert.equal(normalizePhone10('+1 (647) 428-1111'), '6474281111');
  assert.equal(normalizePhone10('647-428-1111'), '6474281111');
  assert.equal(normalizePhone10('428-1111'), null);
  assert.equal(normalizePhone10(undefined), null);
});

test('trimToTelegram drops whole trailing sections', () => {
  const lines = ['A', 'a'.repeat(100), '', 'B', 'b'.repeat(100), '', 'C', 'c'.repeat(100)];
  const out = trimToTelegram(lines, 250);
  assert.deepEqual(out, ['A', 'a'.repeat(100), '', 'B', 'b'.repeat(100)]);
  assert.deepEqual(trimToTelegram(lines, 10000), lines);
  assert.notEqual(trimToTelegram(lines, 10000), lines, 'returns a new array');
});

test('no identifiers -> empty, no queries', async () => {
  const sb = fakeSupabase(fixtures);
  const r = await buildLeadContext(sb, { name: 'Only Name', address: 'x' }, { logger: silent });
  assert.deepEqual(r.lines, []);
  assert.equal(r.html, '');
  assert.equal(sb.calls.length, 0);
});

test('never throws on a broken client', async () => {
  const r = await buildLeadContext({ from() { throw new Error('nope'); } }, ids, { now: () => NOW, logger: silent });
  assert.ok(Array.isArray(r.lines));
  const r2 = await buildLeadContext(null, ids, { logger: silent });
  assert.ok(Array.isArray(r2.lines));
});
