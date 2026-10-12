import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { COMMS_SELECT, shapeComms, contactNames } from '@/lib/ops/comms-shape';

/**
 * GET /api/admin/ops/ref?kind=comms|emails&id=NNNN[&to=MMMM]
 *
 * Resolves a `comms:NNNN[-MMMM]` / `emails:NNNN` ref from card facts into the underlying record, so a tap on the
 * Ops board shows the actual text/voicemail/email. Picks fields explicitly — `raw` is never returned.
 */
export const dynamic = 'force-dynamic';

const MAX_RANGE = 20;
const MAX_BODY = 8000;
const INT = /^\d{1,9}$/;

function intParam(v) {
  return typeof v === 'string' && INT.test(v) ? Number(v) : null;
}

export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const sp = new URL(request.url).searchParams;
  const kind = sp.get('kind');
  const id = intParam(sp.get('id'));
  const toRaw = sp.get('to');
  const to = toRaw == null || toRaw === '' ? null : intParam(toRaw);
  if (!['comms', 'emails'].includes(kind)) return NextResponse.json({ error: 'kind must be comms or emails' }, { status: 400 });
  if (!id) return NextResponse.json({ error: 'id must be a positive integer' }, { status: 400 });
  if (toRaw && to == null) return NextResponse.json({ error: 'to must be a positive integer' }, { status: 400 });

  const supabase = getSupabaseAdminClient();

  if (kind === 'comms') {
    const hi = to && to > id ? Math.min(to, id + MAX_RANGE - 1) : id;
    const { data, error: dbErr } = await supabase.from('comms_events').select(COMMS_SELECT)
      .gte('id', id).lte('id', hi).order('id', { ascending: true }).limit(MAX_RANGE);
    if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
    if (!data?.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const names = await contactNames(supabase, data);
    return NextResponse.json({
      kind, id, to: hi > id ? hi : null, truncated: Boolean(to && to > hi),
      events: data.map((r) => shapeComms(r, names)),
    });
  }

  const { data: e, error: dbErr } = await supabase.from('emails')
    .select('id,from_address,from_name,to_addresses,subject,received_at,body_preview,body_text,direction,web_link,attachments')
    .eq('id', id).maybeSingle();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  if (!e) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const full = typeof e.body_text === 'string' ? e.body_text : '';
  return NextResponse.json({
    kind, id,
    email: {
      id: e.id, when: e.received_at, direction: e.direction || null,
      from: e.from_address || null, from_name: e.from_name || null,
      to: Array.isArray(e.to_addresses) ? e.to_addresses : [],
      subject: e.subject || '',
      preview: e.body_preview || '',
      body: full.slice(0, MAX_BODY), body_truncated: full.length > MAX_BODY,
      attachments: (Array.isArray(e.attachments) ? e.attachments : []).map((a) => a?.name).filter(Boolean).slice(0, 20),
      web_link: typeof e.web_link === 'string' && /^https:\/\//.test(e.web_link) ? e.web_link : null,
    },
  });
}
