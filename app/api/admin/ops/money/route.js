import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase';

/**
 * GET /api/admin/ops/money → { in, owe, ar, at }   (each part is null when it cannot be sourced)
 *
 *  in  = money received in the last 7 days.
 *        Source A: public.customer_payments (amount, received_at, match_status, payer_name, customer_name) when it exists.
 *        Source B (fallback): Interac "received" notifications in public.emails (doc_type='etransfer_received', amount).
 *  owe = unpaid supplier invoices (public.supplier_invoices where paid_on_pdf = false), per vendor.
 *        "Overdue" = invoice date > 30 days ago (assumed net-30; supplier_invoices carries no due date).
 *  ar  = NOT SOURCEABLE from Supabase yet.
 *        TODO(ops-money): QuickBooks A/R lives only in the workspace file data/qb/snapshot.json (invoices[].balance),
 *        which is not reachable on Vercel. Needs a small sync that upserts QB open-invoice balances into a Supabase table
 *        (e.g. public.qb_open_invoices: txn_id, customer, balance, due_date) — then sum(balance) here. Until then
 *        the strip simply omits "A/R". The same sync could replace supplier_invoices for "Owe" with real QB bills
 *        (bills[].openAmount, dueDate) so overdue is exact instead of the net-30 guess.
 */
export const dynamic = 'force-dynamic';

const DAY = 86400000;
const round2 = (n) => Math.round(n * 100) / 100;

async function moneyIn(supabase, sinceIso) {
  // A: customer_payments (may not exist yet — another agent is creating it).
  try {
    const { data, error } = await supabase.from('customer_payments').select('amount,received_at,match_status,payer_name,customer_name')
      .gte('received_at', sinceIso).order('received_at', { ascending: false }).limit(500);
    // Empty table (reflex cron not enabled yet) → fall through to the email notices so the strip is never blank.
    if (!error && Array.isArray(data) && data.length > 0) {
      const total = data.reduce((s, r) => s + (Number(r.amount) || 0), 0);
      return { total: round2(total), count: data.length, source: 'customer_payments', unmatched: data.filter((r) => r.match_status && r.match_status !== 'matched').length };
    }
  } catch { /* table missing → fall through */ }
  // B: Interac deposit notices in emails.
  try {
    const { data, error } = await supabase.from('emails').select('amount,received_at')
      .eq('doc_type', 'etransfer_received').gte('received_at', sinceIso).limit(500);
    if (error) return null;
    const total = (data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
    return { total: round2(total), count: (data || []).length, source: 'emails', unmatched: null };
  } catch { return null; }
}

async function moneyOwe(supabase, now) {
  try {
    const { data, error } = await supabase.from('supplier_invoices')
      .select('id,qb_vendor,vendor_email,inv_no,inv_date,total,po_ref,paid_on_pdf').eq('paid_on_pdf', false).order('inv_date', { ascending: true }).limit(500);
    if (error) return null;
    const byVendor = new Map();
    let total = 0; let overdue = 0;
    for (const r of data || []) {
      const amt = Number(r.total) || 0;
      const name = r.qb_vendor || r.vendor_email || 'Unknown vendor';
      const age = r.inv_date ? Math.floor((now - Date.parse(r.inv_date)) / DAY) : null;
      const isOverdue = age != null && age > 30;
      total += amt; if (isOverdue) overdue += 1;
      const v = byVendor.get(name) || { vendor: name, total: 0, overdue: 0, invoices: [] };
      v.total += amt; if (isOverdue) v.overdue += 1;
      v.invoices.push({ inv_no: r.inv_no, inv_date: r.inv_date, total: amt, po_ref: r.po_ref || null, age_days: age, overdue: isOverdue });
      byVendor.set(name, v);
    }
    const vendors = [...byVendor.values()].map((v) => ({ ...v, total: round2(v.total) })).sort((a, b) => b.total - a.total);
    return { total: round2(total), vendors: vendors.length, overdue, list: vendors, source: 'supplier_invoices' };
  } catch { return null; }
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const supabase = getSupabaseAdminClient();
  const now = Date.now();
  const [inn, owe] = await Promise.all([moneyIn(supabase, new Date(now - 7 * DAY).toISOString()), moneyOwe(supabase, now)]);
  return NextResponse.json({ in: inn, owe, ar: null, at: new Date(now).toISOString() });
}
