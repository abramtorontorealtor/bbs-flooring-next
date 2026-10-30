/**
 * Client-side lead metadata forwarded with every lead form (booking / quote / contact):
 *   session_id      — the cart session (localStorage `bbs_session_id`) so the alert can show
 *                     what's in the cart right now (lib/leadContext.js).
 *   planner_summary — the /planner rooms ("Living 18×14 · 252 sqft · TF1119 · 15 bx; …") when
 *                     the customer built a project (localStorage `bbs_project.summary`),
 *                     plus the planner total. Appended to the notes by the caller.
 * Never throws; returns empty values outside the browser / in private mode.
 */
const PLANNER_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function getLeadMeta() {
  const out = { session_id: null, planner_summary: null };
  if (typeof window === 'undefined') return out;
  try {
    const sid = window.localStorage.getItem('bbs_session_id');
    if (sid && sid.length <= 128) out.session_id = sid;
  } catch { /* ignore */ }
  try {
    const raw = window.localStorage.getItem('bbs_project');
    if (raw) {
      const p = JSON.parse(raw);
      const fresh = !p?.ts || Date.now() - p.ts < PLANNER_MAX_AGE_MS;
      const lines = Array.isArray(p?.summary) ? p.summary.filter((s) => typeof s === 'string' && s.trim()) : [];
      if (fresh && lines.length) {
        const total = Number(p.total) > 0 ? ` · planner total C$${Number(p.total).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '';
        out.planner_summary = `Planner: ${lines.join('; ')}${total}`.slice(0, 900);
      }
    }
  } catch { /* ignore */ }
  return out;
}
