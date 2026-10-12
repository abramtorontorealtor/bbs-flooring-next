/**
 * Shape comms_events / emails rows for the Ops board without ever shipping `raw` wholesale.
 * SMS text lives in raw.data.body (Grasshopper sms_notification payload); voicemail transcript in `transcription`.
 */
import { phone10 } from '@/lib/ops/refs';

export const COMMS_COLS = 'id,channel,event_type,event_subtype,direction,from_number,to_number,caller_name,extension_name,transcription,is_voicemail,is_missed,event_time';
// Only the text field out of raw — PostgREST JSON path selects keep the rest of the payload server-side.
export const COMMS_SELECT = `${COMMS_COLS},sms_body:raw->data->>body`;

export function commsKind(r) {
  if (r.is_voicemail) return 'voicemail';
  if (Number(r.event_type) === 1) return 'text';
  return 'call';
}

export function shapeComms(r, names = {}) {
  const nameOf = (num) => { const p = phone10(num); return (p && names[p]) || null; };
  return {
    id: r.id,
    when: r.event_time,
    direction: r.direction || null,
    type: commsKind(r),
    from: r.from_number || null,
    from_name: nameOf(r.from_number) || r.caller_name || null,
    to: r.to_number || null,
    to_name: nameOf(r.to_number),
    text: (r.sms_body || r.transcription || '').slice(0, 4000) || null,
    missed: Boolean(r.is_missed),
  };
}

/** phone10 → contact name map for a set of comms rows (comms_contacts.phone is stored as +1XXXXXXXXXX). */
export async function contactNames(supabase, rows) {
  const nums = new Set();
  for (const r of rows) for (const n of [r.from_number, r.to_number]) { const p = phone10(n); if (p) nums.add(p); }
  if (!nums.size) return {};
  const variants = [...nums].flatMap((p) => [`+1${p}`, `1${p}`, p]);
  const { data } = await supabase.from('comms_contacts').select('phone,name').in('phone', variants);
  const out = {};
  for (const c of data || []) { const p = phone10(c.phone); if (p && c.name) out[p] = c.name; }
  return out;
}
