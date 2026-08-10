import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendAbandonedCheckoutEmail, sendFollowUpEmail } from '@/lib/email';

// Cron: lead nurturing / recovery follow-ups. Called by Vercel Cron (see vercel.json).
//
// Covers two revenue leaks the audit flagged (I-1 quote follow-up, I-2 abandoned cart):
//   • Abandoned checkout  → recovery email ~1h after the beacon, 2nd touch at ~48h.
//   • Quote / contact lead → single nudge ~24h after capture if still 'new'.
//
// De-dup is tracked in contact_leads.metadata.followup_stage (0 = none sent yet).
// This avoids a schema migration and is idempotent: each stage only advances once.
// Anyone who completes an order (matched by email) is suppressed from further sends.

const HOUR = 60 * 60 * 1000;
const ABANDON_FIRST_DELAY_MS = 1 * HOUR;   // wait ~1h so we don't email people who come right back
const ABANDON_SECOND_DELAY_MS = 48 * HOUR; // 2nd recovery touch
const QUOTE_DELAY_MS = 24 * HOUR;          // nudge un-actioned quote/contact leads after a day
const BATCH = 25;                          // cap sends per run

function stageOf(lead) {
  const s = lead?.metadata?.followup_stage;
  return typeof s === 'number' ? s : 0;
}

async function setStage(supabase, lead, stage) {
  const metadata = { ...(lead.metadata || {}), followup_stage: stage, last_followup_at: new Date().toISOString() };
  await supabase.from('contact_leads').update({ metadata }).eq('id', lead.id);
}

// True if this email already placed an order — suppress any further recovery emails.
async function hasOrdered(supabase, email) {
  if (!email) return false;
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('customer_email', email);
  return (count || 0) > 0;
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const now = Date.now();
  const results = { abandoned_first: 0, abandoned_second: 0, quote_nudge: 0, suppressed: 0, errors: [] };

  try {
    // ── I-2a: Abandoned checkout — first recovery email (~1h after logging) ──
    {
      const cutoff = new Date(now - ABANDON_FIRST_DELAY_MS).toISOString();
      const { data: leads } = await supabase
        .from('contact_leads')
        .select('*')
        .eq('source', 'abandoned_checkout')
        .lte('created_at', cutoff)
        .not('customer_email', 'is', null)
        .order('created_at', { ascending: true })
        .limit(BATCH);

      for (const lead of (leads || [])) {
        if (stageOf(lead) !== 0) continue;
        try {
          if (await hasOrdered(supabase, lead.customer_email)) {
            await setStage(supabase, lead, 99); // completed — don't chase
            results.suppressed++;
            continue;
          }
          await sendAbandonedCheckoutEmail({
            customerName: lead.customer_name,
            customerEmail: lead.customer_email,
            cartItems: [],
            cartValue: lead.metadata?.cart_value || null,
          });
          await setStage(supabase, lead, 1);
          results.abandoned_first++;
        } catch (err) {
          results.errors.push({ id: lead.id, step: 'abandoned_first', error: err.message });
        }
      }
    }

    // ── I-2b: Abandoned checkout — second touch (~48h) ──
    {
      const cutoff = new Date(now - ABANDON_SECOND_DELAY_MS).toISOString();
      const { data: leads } = await supabase
        .from('contact_leads')
        .select('*')
        .eq('source', 'abandoned_checkout')
        .lte('created_at', cutoff)
        .not('customer_email', 'is', null)
        .order('created_at', { ascending: true })
        .limit(BATCH);

      for (const lead of (leads || [])) {
        if (stageOf(lead) !== 1) continue;
        try {
          if (await hasOrdered(supabase, lead.customer_email)) {
            await setStage(supabase, lead, 99);
            results.suppressed++;
            continue;
          }
          await sendFollowUpEmail({
            to: lead.customer_email,
            template: 'abandoned_cart_followup',
            vars: { name: lead.customer_name?.split(' ')[0] || 'there' },
          });
          await setStage(supabase, lead, 2);
          results.abandoned_second++;
        } catch (err) {
          results.errors.push({ id: lead.id, step: 'abandoned_second', error: err.message });
        }
      }
    }

    // ── I-1: Quote / contact lead nudge (~24h) if still un-actioned ──
    {
      const cutoff = new Date(now - QUOTE_DELAY_MS).toISOString();
      const { data: leads } = await supabase
        .from('contact_leads')
        .select('*')
        .in('source', ['pdp_quote_request', 'contact_form'])
        .eq('status', 'new')
        .lte('created_at', cutoff)
        .not('customer_email', 'is', null)
        .order('created_at', { ascending: true })
        .limit(BATCH);

      for (const lead of (leads || [])) {
        if (stageOf(lead) !== 0) continue;
        try {
          const template = lead.source === 'pdp_quote_request' ? 'quote_followup' : 'general_checkin';
          await sendFollowUpEmail({
            to: lead.customer_email,
            template,
            vars: { name: lead.customer_name?.split(' ')[0] || 'there' },
          });
          await setStage(supabase, lead, 1);
          results.quote_nudge++;
        } catch (err) {
          results.errors.push({ id: lead.id, step: 'quote_nudge', error: err.message });
        }
      }
    }

    return NextResponse.json({ ok: true, ...results, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[LeadFollowupCron] Error:', error);
    return NextResponse.json({ error: error.message, ...results }, { status: 500 });
  }
}
