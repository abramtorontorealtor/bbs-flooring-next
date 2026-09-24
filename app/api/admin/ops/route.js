import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { ACTIVE, ASSIGNEES, planAction, decisionKey } from '@/lib/ops/brief-rules';

/**
 * /api/admin/ops — the Ops board (Abram + Mak) over public.brief_items.
 *
 * GET  → { items: [...active + closed in last 48h], at }
 * POST → { action, id?, note?, until?, assignee?, actor, label?, ask?, priority? }
 *        actions: done | confirm | drop | snooze | wait | reopen | reassign | note | add
 *
 * Rules are the shared mirror of scripts/opshub/ledger.py (lib/ops/brief-rules.js); the Telegram brief
 * (waiting_on_me.py) reads the same table, so a click here is visible in the next digest and vice-versa.
 * Every state change appends to `history` exactly like ledger._change so `brief_ctl.py` audit output stays whole.
 *
 * Single admin login for now: `actor` says who is clicking (abram | mak). Server enforces Mak's limits
 * (no closing/dropping/deferring critical items) via permissions(); it is a staffing guard, not a security boundary.
 */

export const dynamic = 'force-dynamic';

const CLOSED_WINDOW_HOURS = 48;

function actorOf(body) {
  const a = String(body?.actor || '').toLowerCase();
  return ASSIGNEES.includes(a) ? a : null;
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const supabase = getSupabaseAdminClient();
  const since = new Date(Date.now() - CLOSED_WINDOW_HOURS * 3600 * 1000).toISOString();
  const { data, error: dbErr } = await supabase
    .from('brief_items')
    .select('*')
    .or(`status.in.(${ACTIVE.join(',')}),closed_at.gt.${since}`)
    .order('id', { ascending: true });
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ items: data || [], at: new Date().toISOString() });
}

export async function POST(request) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const actor = actorOf(body);
  if (!actor) return NextResponse.json({ error: 'actor must be abram or mak' }, { status: 400 });
  const action = String(body.action || '');
  const supabase = getSupabaseAdminClient();
  const at = new Date();

  if (action === 'add') {
    const label = String(body.label || '').trim().slice(0, 160);
    const ask = String(body.ask || '').trim().slice(0, 240);
    const assignee = ASSIGNEES.includes(body.assignee) ? body.assignee : actor;
    const priority = [1, 2, 3].includes(Number(body.priority)) ? Number(body.priority) : 2;
    if (label.length < 4) return NextResponse.json({ error: 'Task needs a label' }, { status: 400 });
    const key = await decisionKey(label);
    const { data: existing } = await supabase.from('brief_items').select('id,status,label').eq('key', key).maybeSingle();
    if (existing) return NextResponse.json({ error: `Already tracked as #${existing.id} (${existing.status})` }, { status: 409 });
    const row = {
      key, kind: 'decision', label, status: 'open', priority,
      owner: 'abram', verify_kind: 'manual',
      completion_rule: `${assignee === 'mak' ? 'Mak' : 'Abram'} confirms this exact task is handled.`,
      assignee, assigned_by: actor, assigned_at: at.toISOString(),
      meta: { ask: ask || null, rank: 30, curated: true, added_via: 'admin_ops', added_by: actor },
      history: [{ at: at.toISOString(), from: null, to: 'open', note: `Added on the Ops board by ${actor}`, by: actor }],
    };
    const { data, error: insErr } = await supabase.from('brief_items').insert(row).select('*').single();
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    return NextResponse.json({ item: data });
  }

  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { data: row, error: readErr } = await supabase.from('brief_items').select('*').eq('id', id).single();
  if (readErr || !row) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  let plan;
  try {
    plan = planAction(row, action, { note: body.note, until: body.until, assignee: body.assignee }, actor, at);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 422 });
  }

  const history = Array.isArray(row.history) ? [...row.history] : [];
  history.push({
    at: at.toISOString(),
    from: row.status,
    to: plan.fields.status || row.status,
    note: plan.note ?? plan.fields.close_note ?? null,
    by: actor,
    verification_source: plan.fields.verification_source ?? null,
    evidence: plan.fields.evidence ?? row.evidence ?? [],
    action,
    admin_user: user?.email || null,
  });
  const updates = { ...plan.fields, history };

  // Optimistic concurrency: refuse if someone (Telegram/CLI) changed the status under us.
  const { data: updated, error: updErr } = await supabase
    .from('brief_items').update(updates).eq('id', id).eq('status', row.status).select('*').maybeSingle();
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
  if (!updated) return NextResponse.json({ error: 'Task changed elsewhere — refresh and retry' }, { status: 409 });
  return NextResponse.json({ item: updated, result: plan.status });
}
