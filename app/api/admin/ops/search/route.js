import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { COMMS_SELECT, shapeComms, contactNames } from '@/lib/ops/comms-shape';
import { phone10, formatPhone } from '@/lib/ops/refs';

/**
 * GET /api/admin/ops/search?q=
 *
 * "Search history" for the Ops board: one box over comms_events, emails, comms_contacts and brief_items, merged
 * newest-first (≤40). Mirrors scripts/opshub/thread.py's identity idea: a name that matches comms_contacts also pulls
 * that person's texts/calls by phone, and a phone-like query matches on digits whatever the punctuation.
 * Result: { results: [{ kind, id, when, who, snippet, card_id? }] } — kind ∈ comms | email | contact | card.
 */
export const dynamic = 'force-dynamic';

const LIMIT = 40;
const PER_SOURCE = 25;

// PostgREST .or() grammar and ILIKE both treat these specially; drop them rather than escape.
const clean = (s) => s.replace(/[%*_\\,()"':;]/g, ' ').replace(/\s+/g, ' ').trim();
const snip = (text, q, n = 140) => {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const i = t.toLowerCase().indexOf(q.toLowerCase());
  const start = i > 40 ? i - 40 : 0;
  return `${start ? '…' : ''}${t.slice(start, start + n)}${start + n < t.length ? '…' : ''}`;
};

export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const raw = (new URL(request.url).searchParams.get('q') || '').trim().slice(0, 80);
  const q = clean(raw);
  if (q.length < 2) return NextResponse.json({ results: [] });
  const digits = raw.replace(/\D/g, '');
  const phoneLike = digits.length >= 4 && /^[\d\s()+.-]+$/.test(raw);
  const supabase = getSupabaseAdminClient();
  const like = `%${q}%`;

  // 1) contacts first — their phones widen the comms search (name → phone link).
  const contactOr = [`name.ilike.${like}`, `phone.ilike.${like}`, ...(phoneLike ? [`phone.ilike.%${digits}%`] : [])].join(',');
  const { data: contacts } = await supabase.from('comms_contacts').select('phone,name,role,notes').or(contactOr).limit(PER_SOURCE);
  const contactPhones = [...new Set((contacts || []).map((c) => phone10(c.phone)).filter(Boolean))].slice(0, 6);

  const commsOr = [
    `caller_name.ilike.${like}`, `transcription.ilike.${like}`, `raw->data->>body.ilike.${like}`,
    ...(phoneLike ? [`from_number.ilike.%${digits}%`, `to_number.ilike.%${digits}%`] : [`from_number.ilike.${like}`, `to_number.ilike.${like}`]),
    ...contactPhones.flatMap((p) => [`from_number.ilike.%${p}`, `to_number.ilike.%${p}`]),
  ].join(',');
  const emailOr = [`from_name.ilike.${like}`, `from_address.ilike.${like}`, `subject.ilike.${like}`, `body_preview.ilike.${like}`].join(',');
  const cardOr = [`label.ilike.${like}`, `meta->>ask.ilike.${like}`, `meta->>facts.ilike.${like}`].join(',');

  const [commsR, emailsR, cardsR] = await Promise.all([
    supabase.from('comms_events').select(COMMS_SELECT).or(commsOr).order('event_time', { ascending: false }).limit(PER_SOURCE),
    supabase.from('emails').select('id,from_name,from_address,subject,received_at,body_preview,direction').or(emailOr).order('received_at', { ascending: false }).limit(PER_SOURCE),
    supabase.from('brief_items').select('id,label,status,meta,last_seen').or(cardOr).order('id', { ascending: false }).limit(PER_SOURCE),
  ]);
  const firstErr = [commsR, emailsR, cardsR].find((r) => r.error)?.error;
  if (firstErr && !commsR.data && !emailsR.data && !cardsR.data) return NextResponse.json({ error: firstErr.message }, { status: 500 });

  const names = await contactNames(supabase, commsR.data || []);
  const out = [];
  for (const r of commsR.data || []) {
    const c = shapeComms(r, names);
    const other = r.direction === 'Outbound' ? { n: c.to_name, p: c.to } : { n: c.from_name, p: c.from };
    const who = `${c.direction === 'Outbound' ? '→' : '←'} ${other.n || (phone10(other.p) ? formatPhone(other.p) : other.p || '?')}`;
    out.push({ kind: 'comms', id: r.id, when: r.event_time, who, snippet: snip(c.text || (c.missed ? 'Missed call' : c.type), q), type: c.type });
  }
  for (const e of emailsR.data || []) {
    out.push({ kind: 'email', id: e.id, when: e.received_at, who: `${e.direction === 'sent' || e.direction === 'Outbound' ? '→' : '←'} ${e.from_name || e.from_address || '?'}`, snippet: snip(`${e.subject || ''} — ${e.body_preview || ''}`, q) });
  }
  for (const c of contacts || []) {
    out.push({ kind: 'contact', id: phone10(c.phone) || c.phone, when: null, who: c.name || formatPhone(c.phone), snippet: [formatPhone(c.phone), c.role, c.notes].filter(Boolean).join(' · ').slice(0, 140), phone: phone10(c.phone) });
  }
  for (const b of cardsR.data || []) {
    out.push({ kind: 'card', id: b.id, card_id: b.id, when: b.last_seen || null, who: `#${b.id} ${b.label}`.slice(0, 90), snippet: snip(b.meta?.ask || b.meta?.facts || '', q), status: b.status });
  }
  // Newest first; undated rows (contacts) sink to the end but still make the cut ahead of nothing.
  out.sort((a, b) => (b.when ? Date.parse(b.when) : -Infinity) - (a.when ? Date.parse(a.when) : -Infinity));
  return NextResponse.json({ results: out.slice(0, LIMIT), q });
}
