/**
 * Pure helpers for the Ops board: turn card text into tappable refs, and phones into tel:/sms: links.
 * No I/O, no React — unit-tested in tests/ops-refs.test.mjs.
 *
 * Refs the brief writes into meta.facts / shared_facts / ask:
 *   comms:2589  comms:2602-2603   (public.comms_events ids — Grasshopper calls/texts/voicemails)
 *   emails:1735                   (public.emails ids)
 *   lead f24d4c29                 (first 8 hex of public.contact_leads.id)
 * plus phone numbers (NANP, any punctuation) and email addresses.
 */

// Order matters: at a given position the first alternative wins, so email beats phone (4165551234@x.com) and refs beat both.
const REF_RE = new RegExp([
  String.raw`(?<comms>\bcomms:(?<c1>\d{1,9})(?:\s?[-–]\s?(?<c2>\d{1,9}))?(?!\d))`,
  String.raw`(?<emails>\bemails:(?<e1>\d{1,9})(?!\d))`,
  String.raw`(?<lead>\blead\s+(?<l1>[0-9a-f]{8})\b)`,
  String.raw`(?<email>[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,})`,
  String.raw`(?<phone>(?<!\w)(?:\+?1[\s.-]?)?\(?[2-9]\d{2}\)?[\s.-]?[2-9]\d{2}[\s.-]?\d{4}(?!\d))`,
].join('|'), 'gi');

/** Digits → bare 10-digit NANP number, or null. */
export function phone10(value) {
  let d = String(value ?? '').replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  return d.length === 10 ? d : null;
}

export function formatPhone(p10) {
  const p = phone10(p10);
  return p ? `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}` : String(p10 ?? '');
}

/**
 * Split text into [{ type:'text'|'comms'|'emails'|'lead'|'phone'|'email', text, ...fields }].
 *  comms → { id, to? }   emails → { id }   lead → { id (8 hex) }   phone → { p10 }   email → { address }
 */
export function tokenizeFacts(text) {
  const s = typeof text === 'string' ? text : text == null ? '' : String(text);
  const out = [];
  let last = 0;
  for (const m of s.matchAll(REF_RE)) {
    const g = m.groups;
    let tok = null;
    if (g.comms) {
      const id = Number(g.c1);
      const to = g.c2 ? Number(g.c2) : null;
      tok = { type: 'comms', id, ...(to && to > id ? { to } : {}) };
    } else if (g.emails) tok = { type: 'emails', id: Number(g.e1) };
    else if (g.lead) tok = { type: 'lead', id: g.l1.toLowerCase() };
    else if (g.email) tok = { type: 'email', address: g.email };
    else if (g.phone) {
      const p = phone10(g.phone);
      if (p) tok = { type: 'phone', p10: p };
    }
    if (!tok) continue;
    if (m.index > last) out.push({ type: 'text', text: s.slice(last, m.index) });
    out.push({ ...tok, text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ type: 'text', text: s.slice(last) });
  return out;
}

/** sms: link. `sms:+1XXXXXXXXXX?&body=…` is the one form both iOS and Android accept. */
export function smsHref(p10, body) {
  const p = phone10(p10);
  if (!p) return null;
  return body ? `sms:+1${p}?&body=${encodeURIComponent(body)}` : `sms:+1${p}`;
}

export function telHref(p10) {
  const p = phone10(p10);
  return p ? `tel:+1${p}` : null;
}

/** "K. Suri — apply $2,500…" → "K. Suri" (same idea as AdminOpsClient.labelHead, kept here so it can be tested). */
export function labelHead(label) {
  return String(label || '').split(' — ')[0].replace(/^[^\p{L}\p{N}#]+/u, '').replace(/\(.*?\)/g, ' ').replace(/\s+/g, ' ').trim();
}

/** A usable first name from a card label, or ''. Skips bare phones, initials ("K."), and lowercase junk. */
export function firstName(label) {
  const w = labelHead(label).split(' ')[0] || '';
  return /^[A-Z][A-Za-z'’-]{1,}$/.test(w) ? w : '';
}

/** Every distinct phone on a card, primary first: meta.phone / meta.contact*, then anything in label/ask/facts. */
export function cardPhones(row) {
  const meta = row?.meta || {};
  const seen = [];
  const add = (v) => { const p = phone10(v); if (p && !seen.includes(p)) seen.push(p); };
  for (const k of ['phone', 'contact_phone', 'contact']) if (typeof meta[k] === 'string') for (const t of tokenizeFacts(meta[k])) if (t.type === 'phone') add(t.p10);
  for (const text of [row?.label, meta.ask, meta.facts, meta.shared_facts]) {
    for (const t of tokenizeFacts(text)) if (t.type === 'phone') add(t.p10);
  }
  return seen;
}

/** The 1-line text to prefill: a draft the card already carries, else a neutral opener. */
export function smsDraft(row, senderName = 'Abram') {
  const meta = row?.meta || {};
  for (const k of ['draft', 'next_text', 'sms_draft']) {
    const v = meta[k];
    if (typeof v === 'string' && v.trim()) return v.trim().replace(/\s*\n+\s*/g, ' ');
  }
  const first = firstName(row?.label);
  return `Hi${first ? ` ${first}` : ''}, it's ${senderName} from BBS Flooring — `;
}
