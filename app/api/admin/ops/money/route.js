import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase';

/**
 * GET /api/admin/ops/money → { in, owe, ar, at }   (each part is null when it cannot be sourced)
 *
 *  in  = money received in the last 7 days.
 *        Source A: public.customer_payments (amount, received_at, match_status, payer_name, customer_name) when it exists.
 *        Source B (fallback): Interac "received" notifications in public.emails (doc_type='etransfer_received', amount).
 *  owe = PREFERRED: public.qb_open_bills (QuickBooks open bills, synced by scripts/qb/qb_ar_sync.py after each QB snapshot pull);
 *        overdue is exact (due_date < today, Toronto). FALLBACK when that table is missing/empty: unpaid supplier invoices
 *        (public.supplier_invoices where paid_on_pdf = false), per vendor, "overdue" = invoice date > 30 days ago (assumed net-30).
 *  ar  = public.qb_open_invoices (QuickBooks invoices with balance > 0, same sync). null when the table is missing/empty.
 *        Both QB tables carry snapshot_at so the UI/API can tell how fresh the numbers are.
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

const torontoToday = (now) => new Date(now).toLocaleDateString('en-CA', { timeZone: 'America/Toronto' }); // YYYY-MM-DD
const dayDiff = (aStr, bStr) => Math.round((Date.parse(aStr) - Date.parse(bStr)) / DAY); // a - b in days (date-only strings)

async function moneyAr(supabase, now) {
  try {
    const { data, error } = await supabase.from('qb_open_invoices')
      .select('customer,ref,balance,due_date,txn_date,snapshot_at').order('balance', { ascending: false }).limit(2000);
    if (error || !Array.isArray(data) || data.length === 0) return null;
    const today = torontoToday(now);
    let total = 0; let overdue = 0; let snapshotAt = null;
    const rows = data.map((r) => {
      const bal = Number(r.balance) || 0;
      const isOverdue = !!r.due_date && r.due_date < today;
      total += bal; if (isOverdue) overdue += 1;
      if (r.snapshot_at && (!snapshotAt || r.snapshot_at > snapshotAt)) snapshotAt = r.snapshot_at;
      const ref = r.due_date || r.txn_date;
      return { customer: r.customer || 'Unknown customer', ref: r.ref || null, balance: round2(bal), due_date: r.due_date || null,
        age_days: ref ? Math.max(0, dayDiff(today, ref)) : null, overdue: isOverdue };
    });
    return { total: round2(total), count: rows.length, overdue, list: rows.slice(0, 8), snapshot_at: snapshotAt, source: 'qb_open_invoices' };
  } catch { return null; }
}

async function moneyOweQb(supabase, now) {
  try {
    const { data, error } = await supabase.from('qb_open_bills')
      .select('ref,vendor,txn_date,due_date,open_amount,po_refs,snapshot_at').order('due_date', { ascending: true }).limit(2000);
    if (error || !Array.isArray(data) || data.length === 0) return null;
    const today = torontoToday(now);
    const byVendor = new Map();
    let total = 0; let overdue = 0; let snapshotAt = null;
    for (const r of data) {
      const amt = Number(r.open_amount) || 0;
      const name = r.vendor || 'Unknown vendor';
      const isOverdue = !!r.due_date && r.due_date < today;
      total += amt; if (isOverdue) overdue += 1;
      if (r.snapshot_at && (!snapshotAt || r.snapshot_at > snapshotAt)) snapshotAt = r.snapshot_at;
      const v = byVendor.get(name) || { vendor: name, total: 0, overdue: 0, invoices: [] };
      v.total += amt; if (isOverdue) v.overdue += 1;
      v.invoices.push({ inv_no: r.ref || null, inv_date: r.txn_date, total: round2(amt), po_ref: (r.po_refs && r.po_refs[0]) || null,
        age_days: r.txn_date ? dayDiff(today, r.txn_date) : null, due_date: r.due_date || null, overdue: isOverdue });
      byVendor.set(name, v);
    }
    const vendors = [...byVendor.values()].map((v) => ({ ...v, total: round2(v.total) })).sort((a, b) => b.total - a.total);
    return { total: round2(total), vendors: vendors.length, overdue, list: vendors, snapshot_at: snapshotAt, source: 'qb_open_bills' };
  } catch { return null; }
}

async function moneyOwe(supabase, now) {
  const qb = await moneyOweQb(supabase, now);
  if (qb) return qb;
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
  const [inn, owe, ar] = await Promise.all([moneyIn(supabase, new Date(now - 7 * DAY).toISOString()), moneyOwe(supabase, now), moneyAr(supabase, now)]);
  return NextResponse.json({ in: inn, owe, ar, at: new Date(now).toISOString() });
}
