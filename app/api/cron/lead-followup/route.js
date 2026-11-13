import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendAbandonedCheckoutEmail, sendFollowUpEmail } from '@/lib/email';
import { normalizeEmail, unsubscribeUrl } from '@/lib/followup/unsubscribe';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Cron: automated web-lead follow-up (email only). Hourly via vercel.json; sends only 9am–7pm ET.
// Approved by Abram Nov 13 2026 — EMAIL layer only. Never texts, never calls, never commitments.
//
//   • Instant quotes (`quotes`)         → day 1, day 3, day 7 after the quote (3 touches max)
//   • Abandoned checkout (contact_leads) → ~1h, ~48h (2 touches max)
//   • Contact / PDP / estimator leads    → one nudge at ~24h
//
// Stage tracking: every automated send is a `lead_follow_ups` row with sent_by='auto', so the CRM
// shows the history and the count IS the stage (no schema change). contact_leads additionally keep
// the legacy metadata.followup_stage so the pre-existing abandoned-cart logic stays idempotent.
//
// Suppression (any one of these = leave the lead alone):
//   - email in `email_suppressions` (unsubscribed)
//   - lead no longer `new` (won / lost / booked / contacted)
//   - an order exists for the email
//   - a booking exists for the email or phone (they already booked a measure)
//   - Abram has already followed up manually on this lead (lead_follow_ups.sent_by='admin')
//   - the phone has any text/call in `comms_events` since the lead came in (already in conversation)
//   - the same email got an automated send in the last 20h (one touch per day per person)
//   - lead older than MAX_START_AGE with no touches yet (too stale to open a sequence on)

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const BATCH = 25;
const SEND_WINDOW_ET = { start: 9, end: 19 }; // 9:00 ≤ hour < 19:00 America/Toronto
const MAX_START_AGE_MS = 14 * DAY;
const PER_PERSON_GAP_MS = 20 * HOUR;

// Quote sequence: stage N fires when count == N, age ≥ minAge, and ≥ minGap since the previous touch.
const QUOTE_STAGES = [
  { template: 'quote_day1', minAgeMs: 1 * DAY, minGapMs: 0 },
  { template: 'quote_day3', minAgeMs: 3 * DAY, minGapMs: 40 * HOUR },
  { template: 'quote_day7', minAgeMs: 7 * DAY, minGapMs: 72 * HOUR },
];
const ABANDON_FIRST_DELAY_MS = 1 * HOUR;
const ABANDON_SECOND_DELAY_MS = 48 * HOUR;
const CONTACT_NUDGE_DELAY_MS = 24 * HOUR;
const CONTACT_SOURCES = ['pdp_quote_request', 'contact_form', 'carpet-removal-estimator', 'quote-calculator-carpet-removal', 'sample_request_showroom'];

function hourInToronto(d = new Date()) {
  const h = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', hour: 'numeric', hour12: false }).format(d);
  return parseInt(h, 10);
}

function digits10(phone) {
  const d = String(phone || '').replace(/\D/g, '');
  return d.length >= 10 ? d.slice(-10) : null;
}

function firstName(name, email) {
  const n = String(name || '').trim();
  if (n && !n.includes('@')) return n.split(/\s+/)[0];
  return 'there';
}

function money(n) {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? v.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null;
}

function shortProduct(name) {
  // "Hazelnut - 6\" White Oak - Northernest Engineered Hardwood Flooring" → "Hazelnut White Oak"
  // "Cinnamon - Sherwood ... Kensington Maple Solid Hardwood Floor"        → "Cinnamon Maple"
  const raw = String(name || '').trim();
  if (!raw) return null;
  const parts = raw.split(' - ').map(s => s.trim()).filter(Boolean);
  const colour = parts[0];
  const m = raw.match(/\b(white oak|red oak|oak|maple|walnut|hickory|birch|ash|laminate|vinyl|spc|carpet|tile)\b/i);
  const kind = m ? m[1].replace(/\b\w/g, c => c.toUpperCase()).replace(/\bSpc\b/, 'SPC') : null;
  if (parts.length === 1 && !kind) return raw.length > 40 ? raw.slice(0, 40) : raw;
  if (!kind) return colour;
  if (new RegExp(`\\b${kind}\\b`, 'i').test(colour)) return colour;
  return `${colour} ${kind}`;
}

function fmtDate(iso) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', month: 'short', day: 'numeric' }).format(new Date(iso));
  } catch { return null; }
}

// ── Suppression helpers ──────────────────────────────────────────────────────

async function loadSuppressions(supabase) {
  const { data } = await supabase.from('email_suppressions').select('email');
  return new Set((data || []).map(r => normalizeEmail(r.email)));
}

async function hasOrdered(supabase, email) {
  if (!email) return false;
  const { count } = await supabase.from('orders').select('id', { count: 'exact', head: true }).ilike('customer_email', email);
  return (count || 0) > 0;
}

let bookingCache = null; // per-run: { emails:Set, phones:Set }
async function hasBooking(supabase, email, phone) {
  if (!bookingCache) {
    const since = new Date(Date.now() - 90 * DAY).toISOString();
    const { data } = await supabase.from('bookings').select('customer_email, customer_phone').gte('created_at', since).limit(1000);
    bookingCache = {
      emails: new Set((data || []).map(b => normalizeEmail(b.customer_email)).filter(Boolean)),
      phones: new Set((data || []).map(b => digits10(b.customer_phone)).filter(Boolean)),
    };
  }
  if (email && bookingCache.emails.has(email)) return true;
  const d = digits10(phone);
  return !!(d && bookingCache.phones.has(d));
}

// Any call/text on this phone since the lead came in = Abram is already talking to them.
async function inConversation(supabase, phone, sinceIso) {
  const d = digits10(phone);
  if (!d) return false;
  const { data } = await supabase.from('comms_events')
    .select('id')
    .gte('event_time', sinceIso)
    .or(`from_number.ilike.%${d},to_number.ilike.%${d}`)
    .limit(1);
  return (data || []).length > 0;
}

async function followupHistory(supabase, leadId) {
  const { data } = await supabase.from('lead_follow_ups')
    .select('sent_by, sent_at, created_at, template')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true });
  const rows = data || [];
  const auto = rows.filter(r => r.sent_by === 'auto');
  const manual = rows.some(r => r.sent_by !== 'auto');
  const last = auto.length ? new Date(auto[auto.length - 1].sent_at || auto[auto.length - 1].created_at).getTime() : null;
  return { autoCount: auto.length, manual, lastAutoAt: last };
}

async function recentAutoToEmail(supabase, email) {
  const since = new Date(Date.now() - PER_PERSON_GAP_MS).toISOString();
  const { count } = await supabase.from('lead_follow_ups').select('id', { count: 'exact', head: true })
    .eq('sent_by', 'auto').ilike('recipient_email', email).gte('created_at', since);
  return (count || 0) > 0;
}

async function logAuto(supabase, { leadId, leadSource, template, subject, email }) {
  const { error } = await supabase.from('lead_follow_ups').insert({
    lead_id: leadId,
    lead_source: leadSource,
    method: 'email',
    template,
    subject,
    body: `Automated follow-up (${template})`,
    recipient_email: email,
    sent_at: new Date().toISOString(),
    sent_by: 'auto',
    notes: 'lead-followup cron',
  });
  if (error) throw new Error(`log insert failed: ${error.message}`);
}

// ── Stage helpers for contact_leads (legacy metadata stage, kept) ────────────

function stageOf(lead) {
  const s = lead?.metadata?.followup_stage;
  return typeof s === 'number' ? s : 0;
}

async function setStage(supabase, lead, stage) {
  const metadata = { ...(lead.metadata || {}), followup_stage: stage, last_followup_at: new Date().toISOString() };
  await supabase.from('contact_leads').update({ metadata }).eq('id', lead.id);
}

// ── Main ─────────────────────────────────────────────────────────────────────

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get('dry') === '1';

  const now = Date.now();
  const hour = hourInToronto();
  const results = {
    ok: true, dry_run: dryRun, hour_et: hour,
    quote_day1: 0, quote_day3: 0, quote_day7: 0,
    abandoned_first: 0, abandoned_second: 0, contact_nudge: 0,
    suppressed: 0, skipped: [], would_send: [], errors: [],
  };

  if (!dryRun && (hour < SEND_WINDOW_ET.start || hour >= SEND_WINDOW_ET.end)) {
    return NextResponse.json({ ...results, note: 'outside send window', timestamp: new Date().toISOString() });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: 'no supabase' }, { status: 503 });

  bookingCache = null;
  const sentThisRun = new Set();

  // Shared gate: returns a reason string if the lead must be left alone, else null.
  async function suppressReason({ email, phone, createdAt, leadId, suppressions }) {
    if (!email) return 'no_email';
    if (suppressions.has(email)) return 'unsubscribed';
    if (sentThisRun.has(email)) return 'sent_this_run';
    if (await hasOrdered(supabase, email)) return 'ordered';
    if (await hasBooking(supabase, email, phone)) return 'booked';
    if (await inConversation(supabase, phone, createdAt)) return 'in_conversation';
    if (await recentAutoToEmail(supabase, email)) return 'recent_auto';
    return null;
  }

  async function deliver({ leadId, leadSource, template, email, send }) {
    if (dryRun) { results.would_send.push({ leadId, leadSource, template, email }); sentThisRun.add(email); return; }
    const r = await send();
    if (!r?.success) throw new Error(`send failed: ${r?.reason || r?.error || 'unknown'}`);
    await logAuto(supabase, { leadId, leadSource, template, subject: template, email });
    sentThisRun.add(email);
  }

  try {
    const suppressions = await loadSuppressions(supabase);

    // ── 1. Instant quotes: day 1 / day 3 / day 7 ──
    {
      const since = new Date(now - MAX_START_AGE_MS).toISOString();
      const until = new Date(now - QUOTE_STAGES[0].minAgeMs).toISOString();
      const { data: quotes, error } = await supabase
        .from('quotes')
        .select('id, created_at, customer_name, customer_email, customer_phone, product_name, square_footage, total, stair_total, installation_cost, lead_status, resume_token')
        .eq('lead_status', 'new')
        .gte('created_at', since)
        .lte('created_at', until)
        .not('customer_email', 'is', null)
        .order('created_at', { ascending: true })
        .limit(200);
      if (error) throw new Error(`quotes query: ${error.message}`);

      let sends = 0;
      for (const q of (quotes || [])) {
        if (sends >= BATCH) break;
        const email = normalizeEmail(q.customer_email);
        const createdMs = new Date(q.created_at).getTime();
        const age = now - createdMs;
        try {
          const hist = await followupHistory(supabase, q.id);
          if (hist.manual) { results.skipped.push({ id: q.id, reason: 'manual_followup' }); continue; }
          const stage = QUOTE_STAGES[hist.autoCount];
          if (!stage) continue; // sequence complete
          if (age < stage.minAgeMs) continue;
          if (hist.lastAutoAt && (now - hist.lastAutoAt) < stage.minGapMs) continue;

          const reason = await suppressReason({ email, phone: q.customer_phone, createdAt: q.created_at, leadId: q.id, suppressions });
          if (reason) { results.suppressed++; results.skipped.push({ id: q.id, reason }); continue; }

          const isStairs = !q.product_name || /stair/i.test(q.product_name);
          const product = isStairs ? 'Stair Renovation' : q.product_name;
          const vars = {
            name: firstName(q.customer_name, email),
            product,
            product_short: isStairs ? 'stair renovation' : shortProduct(q.product_name),
            sqft: q.square_footage ? Number(q.square_footage).toLocaleString('en-CA') : null,
            quote_total: money(q.total || q.stair_total),
            includes_install: Number(q.installation_cost) > 0 || isStairs,
            quote_date: fmtDate(q.created_at),
            resume_url: q.resume_token && !isStairs ? `https://bbsflooring.ca/quote-calculator?resume=${q.resume_token}` : null,
            unsubscribe_url: unsubscribeUrl(email),
          };
          await deliver({
            leadId: q.id, leadSource: 'quote', template: stage.template, email,
            send: () => sendFollowUpEmail({ to: email, template: stage.template, vars }),
          });
          results[stage.template]++;
          sends++;
        } catch (err) {
          results.errors.push({ id: q.id, step: 'quote', error: err.message });
        }
      }
    }

    // ── 2. Abandoned checkout: ~1h then ~48h ──
    for (const [stageWanted, delay, key] of [[0, ABANDON_FIRST_DELAY_MS, 'abandoned_first'], [1, ABANDON_SECOND_DELAY_MS, 'abandoned_second']]) {
      const cutoff = new Date(now - delay).toISOString();
      const since = new Date(now - MAX_START_AGE_MS).toISOString();
      const { data: leads } = await supabase
        .from('contact_leads')
        .select('*')
        .eq('source', 'abandoned_checkout')
        .gte('created_at', since)
        .lte('created_at', cutoff)
        .not('customer_email', 'is', null)
        .order('created_at', { ascending: true })
        .limit(BATCH);

      for (const lead of (leads || [])) {
        if (stageOf(lead) !== stageWanted) continue;
        const email = normalizeEmail(lead.customer_email);
        try {
          const reason = await suppressReason({ email, phone: lead.customer_phone, createdAt: lead.created_at, leadId: lead.id, suppressions });
          if (reason === 'ordered' || reason === 'unsubscribed') { if (!dryRun) await setStage(supabase, lead, 99); }
          if (reason) { results.suppressed++; results.skipped.push({ id: lead.id, reason }); continue; }

          const template = stageWanted === 0 ? 'abandoned_checkout_recovery' : 'abandoned_cart_followup';
          await deliver({
            leadId: lead.id, leadSource: 'contact', template, email,
            send: () => stageWanted === 0
              ? sendAbandonedCheckoutEmail({ customerName: lead.customer_name, customerEmail: email, cartItems: [], cartValue: lead.metadata?.cart_value || null, unsubscribeUrl: unsubscribeUrl(email) })
              : sendFollowUpEmail({ to: email, template, vars: { name: firstName(lead.customer_name, email), quote_total: money(lead.metadata?.cart_value), unsubscribe_url: unsubscribeUrl(email) } }),
          });
          if (!dryRun) await setStage(supabase, lead, stageWanted + 1);
          results[key]++;
        } catch (err) {
          results.errors.push({ id: lead.id, step: key, error: err.message });
        }
      }
    }

    // ── 3. Contact / PDP / estimator leads: one nudge at ~24h ──
    {
      const cutoff = new Date(now - CONTACT_NUDGE_DELAY_MS).toISOString();
      const since = new Date(now - MAX_START_AGE_MS).toISOString();
      const { data: leads } = await supabase
        .from('contact_leads')
        .select('*')
        .in('source', CONTACT_SOURCES)
        .eq('status', 'new')
        .gte('created_at', since)
        .lte('created_at', cutoff)
        .not('customer_email', 'is', null)
        .order('created_at', { ascending: true })
        .limit(BATCH);

      for (const lead of (leads || [])) {
        if (stageOf(lead) !== 0) continue;
        const email = normalizeEmail(lead.customer_email);
        try {
          const hist = await followupHistory(supabase, lead.id);
          if (hist.manual || hist.autoCount > 0) { if (!dryRun) await setStage(supabase, lead, 1); continue; }
          const reason = await suppressReason({ email, phone: lead.customer_phone, createdAt: lead.created_at, leadId: lead.id, suppressions });
          if (reason) { results.suppressed++; results.skipped.push({ id: lead.id, reason }); continue; }

          const template = lead.source === 'pdp_quote_request' ? 'quote_followup' : 'general_checkin';
          const product = lead.metadata?.product_name || lead.metadata?.product || null;
          await deliver({
            leadId: lead.id, leadSource: 'contact', template, email,
            send: () => sendFollowUpEmail({ to: email, template, vars: { name: firstName(lead.customer_name, email), product, unsubscribe_url: unsubscribeUrl(email) } }),
          });
          if (!dryRun) await setStage(supabase, lead, 1);
          results.contact_nudge++;
        } catch (err) {
          results.errors.push({ id: lead.id, step: 'contact_nudge', error: err.message });
        }
      }
    }

    return NextResponse.json({ ...results, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[LeadFollowupCron] Error:', error);
    return NextResponse.json({ ...results, ok: false, error: error.message }, { status: 500 });
  }
}
