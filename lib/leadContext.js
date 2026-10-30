// lib/leadContext.js — server-only. Builds "everything we already know about this lead" as
// Telegram-HTML lines so the owner's new-lead alert is prepped for the measurement.
//
// BUDGET RULE: buildLeadContext NEVER throws and NEVER blocks longer than `budgetMs`.
// Every section is an independent async fn that catches its own errors (-> []) and writes into
// a shared results object as soon as it resolves. All sections run in parallel and are raced
// against one timer; whatever has resolved by the deadline is included, the rest is dropped.
//
// Pure + dependency-injected: no `@/` imports. `supabase` is a supabase-js (service role) client.

const SHOWROOM = '6061+Highway+7+Markham+ON+L3P+3B2';
const OWN_LINE = '6474281111';
const TZ = 'America/Toronto';
const DAY = 86400000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_EMAIL_RE = /^[^\s,()"'%*\\]+@[^\s,()"'%*\\]+$/;

// ── FSA → GTA city ─────────────────────────────────────────────────────────────────────────
const FSA_GROUPS = {
  Markham: 'L3P L3R L3S L6B L6C L6E L6G', 'Richmond Hill': 'L4B L4C L4E L4S', Thornhill: 'L3T L4J',
  Vaughan: 'L4K L4L L6A L4H', Stouffville: 'L4A', Newmarket: 'L3X L3Y', Aurora: 'L4G', King: 'L7B',
  'North York': 'M6A M6B M6L', 'East York': 'M4B M4C M4G M4H M4J M4K',
  Pickering: 'L1V L1W L1X', Ajax: 'L1S L1T L1Z', Whitby: 'L1M L1N L1P L1R', Oshawa: 'L1G L1H L1J L1K L1L',
  Uxbridge: 'L9P', Mississauga: 'L4T L4V L4W L4X L4Y L4Z',
  Brampton: 'L6P L6R L6S L6T L6V L6W L6X L6Y L6Z L7A', Oakville: 'L6H L6J L6K L6L L6M',
  Burlington: 'L7L L7M L7N L7P L7R L7S L7T', Milton: 'L9T L9E', Caledon: 'L7C L7E L7K',
  'Halton Hills': 'L7G L7J', Georgina: 'L4P L0E', Bradford: 'L3Z',
};
const FSA_EXACT = {};
for (const [city, fsas] of Object.entries(FSA_GROUPS)) for (const f of fsas.split(' ')) FSA_EXACT[f] = city;
const FSA_PREFIX = { M1: 'Scarborough', M2: 'North York', M3: 'North York', M4: 'Toronto', M5: 'Toronto',
  M6: 'Toronto', M7: 'Toronto', M8: 'Etobicoke', M9: 'Etobicoke', L5: 'Mississauga' };

export function fsaToCity(postalOrAddress) {
  const m = String(postalOrAddress ?? '').match(/\b([A-Z]\d[A-Z])\s?\d[A-Z]\d\b/i);
  if (!m) return null;
  const fsa = m[1].toUpperCase();
  return FSA_EXACT[fsa] || FSA_PREFIX[fsa.slice(0, 2)] || null;
}

// ── small helpers ──────────────────────────────────────────────────────────────────────────
export function normalizePhone10(p) {
  let d = String(p ?? '').replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') d = d.slice(1);
  return d.length >= 10 ? d.slice(-10) : null;
}
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cut = (s, n) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
const money = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('en-CA');
const toDate = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(v + 'T12:00:00Z') : new Date(v));
const fmtDate = (v) => { const d = toDate(v); return isNaN(d) ? '' : d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', timeZone: TZ }); };
const ago = (v, now) => { const n = Math.floor((now - toDate(v)) / DAY); return n <= 0 ? 'today' : `${n}d ago`; };
const num = (v) => (v != null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);
const obj = (v) => { if (v && typeof v === 'object') return v; try { const j = JSON.parse(v); return j && typeof j === 'object' ? j : null; } catch { return null; } };
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const header = (emoji, title, extra = '') => `${emoji} <b>${title}</b>${extra}`;

async function rows(builder) {
  const { data, error } = await builder;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}
const orClause = (emailCols, phoneCols, email, last7) => [
  ...(email ? emailCols.map((c) => `${c}.eq.${email}`) : []),
  ...(last7 ? phoneCols.map((c) => `${c}.ilike.%${last7}%`) : []),
].join(',');

// ── sections ───────────────────────────────────────────────────────────────────────────────
async function addressSection({ address, postal_code }) {
  if (!address && !postal_code) return [];
  const dest = encodeURIComponent(`${address || ''} ${postal_code || ''}`.trim());
  const city = fsaToCity(postal_code) || fsaToCity(address);
  const link = `<a href="https://www.google.com/maps/dir/?api=1&amp;origin=${SHOWROOM}&amp;destination=${dest}">Directions from showroom</a>`;
  return [header('🏠', 'Address'), link + (city ? ` · ${esc(city)}` : '')];
}

async function cartSection(sb, { session_id }) {
  if (!session_id) return [];
  const data = await rows(sb.from('cart_items')
    .select('product_name,variant_label,item_type,boxes_required,actual_sqft,quantity,line_total,parent_product_name,created_at')
    .eq('session_id', session_id).order('created_at', { ascending: false }).limit(20));
  if (!data.length) return [];
  const items = data.slice(0, 6).map((r) => {
    const isProduct = !r.item_type || r.item_type === 'product';
    let l = `• ${esc(r.product_name)}`;
    if (isProduct) l += `${r.variant_label ? ` · ${esc(r.variant_label)}` : ''} · ${esc(r.boxes_required ?? '?')} bx / ${esc(r.actual_sqft ?? '?')} sqft`;
    else l += ` ×${esc(r.quantity ?? 1)}`;
    return Number(r.line_total) > 0 ? `${l} · ${money(r.line_total)}` : l;
  });
  const total = data.reduce((s, r) => s + (Number(r.line_total) || 0), 0);
  return [header('🛒', 'Cart right now'), ...items, `Total ${money(total)} (${plural(data.length, 'line', 'lines')})`];
}

const TOOL_EVENTS = new Set(['planner_view', 'planner_room_add', 'planner_add_all', 'planner_install_cta']);
async function journeySection(sb, { visitor_id }, now) {
  if (!visitor_id || !UUID_RE.test(visitor_id)) return [];
  const since = new Date(now().getTime() - 30 * DAY).toISOString();
  const ev = await rows(sb.from('site_events')
    .select('event_type,path,product_slug,product_name,referrer,utm,created_at,meta')
    .eq('visitor_id', visitor_id).gt('created_at', since).order('created_at', { ascending: false }).limit(300));
  if (!ev.length) return [];
  const first = ev[ev.length - 1].created_at; // list is newest-first
  const out = [header('👣', 'Site journey'), `First visit ${fmtDate(first)} (${ago(first, now())})`];
  let source = 'direct';
  for (let i = ev.length - 1; i >= 0; i--) { // oldest first
    const u = obj(ev[i].utm) || {}, ref = String(ev[i].referrer || '').trim();
    if (u.utm_source) { source = [u.utm_source, u.utm_medium, u.utm_campaign].filter(Boolean).join('/'); break; }
    if (ref) {
      let host = ref; try { host = new URL(ref).hostname; } catch { /* keep raw */ }
      if (/bbsflooring\.ca$/i.test(host)) continue; // internal navigation isn't a source
      source = host; break;
    }
  }
  out.push(`Source: ${esc(source)}`);
  const days = new Set(ev.map((e) => toDate(e.created_at).toLocaleDateString('en-CA', { timeZone: TZ })));
  out.push(`Days active: ${days.size}`);
  const viewed = [];
  for (const e of ev) {
    const n = e.event_type === 'pdp_view' && (e.product_name || e.product_slug);
    if (n && !viewed.includes(n) && viewed.length < 5) viewed.push(n);
  }
  if (viewed.length) out.push(`Viewed: ${viewed.map(esc).join(' · ')}`);
  const used = [], add = (t) => { if (!used.includes(t)) used.push(t); }, searches = [];
  for (const e of ev) {
    const p = String(e.path || ''), t = e.event_type;
    if (TOOL_EVENTS.has(t)) add('planner');
    if (p.startsWith('/quote-calculator') || t === 'calculator') add('quote calculator');
    if (p.startsWith('/floor-finder')) add('floor finder');
    if (p.startsWith('/compare')) add('compare');
    if (t === 'doc_download') add('spec sheets');
    if (t === 'search') { const m = obj(e.meta) || {}, q = m.q || m.query; if (q && !searches.includes(q) && searches.length < 2) searches.push(q); }
  }
  for (const q of searches) used.push(`search: "${cut(q, 40)}"`);
  if (used.length) out.push(`Used: ${used.map(esc).join(' · ')}`);
  const carts = ev.filter((e) => e.event_type === 'add_to_cart').length;
  if (carts) out.push(`Add to cart ×${carts}`);
  return out;
}

const HISTORY = [
  { table: 'quotes', one: 'quote', many: 'quotes', emailCols: ['customer_email'], phoneCols: ['customer_phone'],
    cols: 'customer_email,customer_phone,product_name,square_footage,total,status,created_at',
    line: (r) => `Quote ${money(r.total)} · ${esc(r.product_name)} ${esc(r.square_footage ?? '?')} sqft · ${esc(r.status)} · ${fmtDate(r.created_at)}` },
  { table: 'bookings', one: 'booking', many: 'bookings', emailCols: ['customer_email'], phoneCols: ['customer_phone'],
    cols: 'customer_email,customer_phone,preferred_date,service_type,status,product_name,quote_total,created_at',
    line: (r) => `Booking ${fmtDate(r.preferred_date)} · ${esc(String(r.service_type || '').replace(/_/g, ' '))} · ${esc(r.status)}${Number(r.quote_total) > 0 ? ` · ${money(r.quote_total)}` : ''}` },
  { table: 'orders', one: 'order', many: 'orders', emailCols: ['customer_email'], phoneCols: ['customer_phone'],
    cols: 'customer_email,customer_phone,order_number,total,status,payment_status,created_at',
    line: (r) => `Order ${esc(r.order_number)} ${money(r.total)} · ${esc(r.status)}/${esc(r.payment_status)} · ${fmtDate(r.created_at)}` },
  { table: 'contact_leads', one: 'contact', many: 'contacts', emailCols: ['email', 'customer_email'], phoneCols: ['phone', 'customer_phone'],
    cols: 'email,phone,customer_email,customer_phone,source,status,message,created_at',
    line: (r) => `Contact [${esc(r.source || 'web')}] ${fmtDate(r.created_at)}: "${esc(cut(r.message, 90))}"` },
];
async function historySection(sb, { email, phone10 }, now, logger) {
  if (!email && !phone10) return [];
  const last7 = phone10 ? phone10.slice(-7) : null;
  const t0 = now().getTime();
  const per = await Promise.all(HISTORY.map(async (h) => {
    try {
      const data = await rows(sb.from(h.table).select(h.cols)
        .or(orClause(h.emailCols, h.phoneCols, email, last7)).order('created_at', { ascending: false }).limit(25));
      return data.filter((r) => {
        const hit = (email && h.emailCols.some((c) => String(r[c] || '').trim().toLowerCase() === email))
          || (phone10 && h.phoneCols.some((c) => normalizePhone10(r[c]) === phone10));
        const age = t0 - toDate(r.created_at).getTime();
        return hit && !(age < 60000 && age > -5000); // drop the row that IS this submission
      }).map((r) => ({ h, r }));
    } catch (e) { logger?.warn?.(`[leadContext] history ${h.table}: ${e?.message}`); return []; }
  }));
  const all = per.flat();
  if (!all.length) return [];
  const counts = per.map((p, i) => [HISTORY[i], p.length]).filter(([h, n]) => n > 0 || h.table !== 'contact_leads')
    .map(([h, n]) => plural(n, h.one, h.many));
  const lines = all.sort((a, b) => toDate(b.r.created_at) - toDate(a.r.created_at)).slice(0, 7).map(({ h, r }) => h.line(r));
  return [header('📜', 'History', ` (${counts.join(' · ')})`), ...lines];
}

async function commsSection(sb, { phone10 }, now) {
  if (!phone10 || phone10 === OWN_LINE) return [];
  const last7 = phone10.slice(-7), since = new Date(now().getTime() - 180 * DAY).toISOString();
  const data = (await rows(sb.from('comms_events')
    .select('from_number,to_number,direction,event_type,is_missed,is_voicemail,transcription,call_summary,call_ai,event_time')
    .or(`from_number.ilike.%${last7}%,to_number.ilike.%${last7}%`).gt('event_time', since)
    .order('event_time', { ascending: false }).limit(100)))
    .filter((r) => normalizePhone10(r.from_number) === phone10 || normalizePhone10(r.to_number) === phone10);
  if (!data.length) return [];
  // Grasshopper feed: event_type 1 = SMS (transcription = the text body), 200 = call (event_subtype 'Call').
  const isText = (r) => Number(r.event_type) === 1 || (r.event_type == null && !!r.transcription && r.call_ai == null && r.call_summary == null && r.is_missed == null);
  const texts = data.filter(isText), calls = data.filter((r) => !isText(r));
  const missed = calls.filter((r) => r.is_missed === true).length;
  const last = data[0], snip = cut(last.transcription || last.call_summary, 120);
  const out = [header('📞', 'Comms'),
    `${plural(calls.length, 'call', 'calls')} (${missed} missed) · ${plural(texts.length, 'text', 'texts')} · last: ${esc(last.direction || '')} ${fmtDate(last.event_time)}${snip ? ' ' + esc(snip) : ''}`];
  const ai = data.map((r) => obj(r.call_ai)).find(Boolean);
  if (ai && (ai.stage || ai.wants)) out.push(`Last call read: ${[ai.stage && esc(ai.stage), ai.wants && esc(cut(ai.wants, 140))].filter(Boolean).join(' — ')}${num(ai.sqft) ? ` · ${esc(ai.sqft)} sqft` : ''}`);
  return out;
}

// Returns { lines, leadId } — leadId feeds the footer's board-card lookup.
async function spineSection(sb, { email, phone10 }) {
  if (!email && !phone10) return { lines: [], leadId: null };
  const data = await rows(sb.from('lead_spine')
    .select('id,phone10,email,name,qb_customer_name,stage,ball_in_court,intent,next_action,suggested_reply,verdict,verdict_at,last_inbound_at,last_outbound_at')
    .or([phone10 ? `phone10.eq.${phone10}` : '', email ? `email.eq.${email}` : ''].filter(Boolean).join(','))
    .limit(5));
  const s = data.find((r) => phone10 && r.phone10 === phone10) || data[0];
  if (!s) return { lines: [], leadId: null };
  const out = [];
  if (s.qb_customer_name) out.push(`QB customer: ${esc(s.qb_customer_name)}`);
  try {
    // Estimate totals come from qb_estimates_mirror (scripts/qb/qb_ar_sync.py refreshes it after every
    // QB snapshot pull); lead_spine_links only knows the txnId. Falls back to ids when the mirror is empty.
    const links = await rows(sb.from('lead_spine_links').select('source_id,event_at')
      .eq('lead_id', s.id).eq('source_table', 'qb_estimates').order('event_at', { ascending: false }).limit(4));
    if (links.length) {
      let mirror = {};
      try {
        const m = await rows(sb.from('qb_estimates_mirror').select('txn_id,ref,total,is_active,linked_types,txn_date')
          .in('txn_id', links.map((l) => l.source_id)));
        mirror = Object.fromEntries(m.map((r) => [r.txn_id, r]));
      } catch { /* mirror optional */ }
      const label = (l) => {
        const m = mirror[l.source_id];
        if (!m) return `#${esc(l.source_id)} (${fmtDate(l.event_at)})`;
        const lt = Array.isArray(m.linked_types) ? m.linked_types : [];
        const state = lt.includes('Invoice') ? 'invoiced' : (m.is_active === false ? 'closed' : 'no invoice');
        return `#${esc(m.ref || l.source_id)} ${money(m.total)} ${fmtDate(m.txn_date || l.event_at)} (${state})`;
      };
      out.push(`Estimates: ${links.map(label).join(', ')}`);
    }
  } catch { /* links are optional */ }
  const v = obj(s.verdict) || {}, read = [];
  if (s.stage) read.push(esc(s.stage));
  if (s.ball_in_court) read.push(`ball: ${esc(s.ball_in_court)}`);
  if (s.intent) read.push(`intent: ${esc(s.intent)}`);
  if (read.length) out.push(`🧠 Read: ${read.join(' · ')}`);
  if (v.why) out.push(`Why: ${esc(cut(v.why, 160))}`);
  if (v.asked_for) out.push(`Asked for: ${esc(cut(v.asked_for, 160))}`);
  if (num(v.money_est) != null) out.push(`Money est: ${money(v.money_est)}`);
  if (s.suggested_reply) out.push(`Suggested reply: <i>${esc(cut(s.suggested_reply, 220))}</i>`);
  return { lines: out.length ? [header('🧾', 'QuickBooks / lead spine'), ...out] : [], leadId: s.id ?? null };
}

const DEFAULT_FOOTER = ['🔗 <a href="https://bbsflooring.ca/admin/leads">Admin leads</a>'];
async function footerSection(sb, { phone10 }, spineP) {
  const { leadId } = await spineP;
  const parts = [phone10 && `meta->>phone.eq.${phone10}`, leadId != null && `meta->>lead_id.eq.${leadId}`].filter(Boolean);
  if (!parts.length) return DEFAULT_FOOTER;
  const [card] = await rows(sb.from('brief_items').select('id,label,meta').eq('status', 'open')
    .or(parts.join(',')).order('id', { ascending: false }).limit(1));
  return card ? [`🔗 <a href="https://bbsflooring.ca/admin/ops">Board card #${esc(card.id)} · ${esc(cut(card.label, 60))}</a>`] : DEFAULT_FOOTER;
}

// ── public API ─────────────────────────────────────────────────────────────────────────────
export function trimToTelegram(lines, max = 3800) {
  const groups = [[]];
  for (const l of lines || []) { if (l === '') groups.push([]); else groups[groups.length - 1].push(l); }
  const g = groups.filter((x) => x.length);
  const join = () => g.map((x) => x.join('\n')).join('\n\n');
  while (g.length > 1 && join().length > max) g.pop();
  while (g.length === 1 && g[0].length > 1 && join().length > max) g[0].pop();
  return g.flatMap((x, i) => (i ? ['', ...x] : x));
}

export async function buildLeadContext(supabase, ids = {}, { budgetMs = 1200, now = () => new Date(), logger = console } = {}) {
  const empty = { lines: [], html: '', text: '', timedOut: false, sections: [] };
  let timer;
  try {
    const email = String(ids.email || '').trim().toLowerCase();
    const safeEmail = SAFE_EMAIL_RE.test(email) ? email : '';
    const phone10 = normalizePhone10(ids.phone);
    if (!safeEmail && !phone10 && !ids.visitor_id && !ids.session_id) return empty;
    const who = { ...ids, email: safeEmail, phone10 };
    const results = {};
    const run = (name, fn) => Promise.resolve().then(fn).then((l) => { results[name] = l; })
      .catch((e) => { logger?.warn?.(`[leadContext] ${name}: ${e?.message || e}`); });
    const spineP = Promise.resolve().then(() => spineSection(supabase, who)).catch((e) => {
      logger?.warn?.(`[leadContext] spine: ${e?.message || e}`); return { lines: [], leadId: null };
    });
    const tasks = [
      run('address', () => addressSection(who)),
      run('cart', () => cartSection(supabase, who)),
      run('journey', () => journeySection(supabase, who, now)),
      run('history', () => historySection(supabase, who, now, logger)),
      run('comms', () => commsSection(supabase, who, now)),
      run('spine', () => spineP.then((r) => r.lines)),
      run('footer', () => footerSection(supabase, who, spineP)),
    ];
    const deadline = new Promise((res) => { timer = setTimeout(() => res('timeout'), budgetMs); });
    const outcome = await Promise.race([Promise.all(tasks).then(() => 'done'), deadline]);
    clearTimeout(timer);
    const snap = { ...results }; // late resolvers must not mutate what we return
    if (!snap.footer) snap.footer = DEFAULT_FOOTER;
    const sections = ['address', 'cart', 'journey', 'history', 'comms', 'spine', 'footer'].filter((n) => snap[n]?.length);
    const lines = sections.flatMap((n, i) => (i ? ['', ...snap[n]] : snap[n]));
    return { lines, html: lines.join('<br>'), text: lines.join('\n'), timedOut: outcome === 'timeout', sections };
  } catch (e) {
    clearTimeout(timer);
    try { logger?.warn?.(`[leadContext] failed: ${e?.message || e}`); } catch { /* never throw */ }
    return empty;
  }
}
