/**
 * Ops board rules — a faithful JS mirror of scripts/opshub/ledger.py (closure rules)
 * and scripts/opshub/queue_brief.py `section()` / `sort_key()` (bucketing).
 *
 * If you change a rule here, change it in the Python too (and vice-versa). The Telegram
 * brief and the /admin/ops tab must never disagree about what "done" means.
 *
 * Pure functions only — no I/O. Used by app/api/admin/ops/route.js (server) and
 * components/admin/AdminOpsClient.jsx (client) so the UI shows exactly what the server will accept.
 */

export const ACTIVE = ['open', 'waiting', 'pending_verification', 'snoozed'];
export const CLOSED = ['done', 'dropped'];
export const ASSIGNEES = ['abram', 'mak'];
export const SECTIONS = ['NOW', 'SETTLED?', 'NEXT', 'WAITING', 'CLOSED'];
export const ET = 'America/Toronto';

export function isActive(row) {
  return ACTIVE.includes(row.status);
}

/** ledger.needs_verification — critical items need proof or Abram's explicit confirm before "done". */
export function needsVerification(row) {
  return row.priority === 0 || (row.verify_kind || 'manual') !== 'manual';
}

export function hasEvidence(row) {
  return Array.isArray(row.evidence) && row.evidence.length > 0;
}

/**
 * Board staffing rule (not in ledger.py): Mak may close ordinary reply/manual items with a note saying what he did,
 * but money, delivery, stock/schedule and priority-0 items are Abram's to close, drop or defer.
 */
export function makBlocked(row) {
  return row.priority === 0 || !['manual', 'reply'].includes(row.verify_kind || 'manual');
}

/** Calendar date (YYYY-MM-DD) in Toronto time — used for "due today or earlier" like the Python `.date()` compare. */
export function etDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('en-CA', { timeZone: ET, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function ts(value) {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
}

/** queue_brief.section — which column an item belongs in, at time `at`. */
export function sectionFor(row, at = new Date()) {
  const meta = row.meta || {};
  const now = at.getTime();
  if (CLOSED.includes(row.status)) return 'CLOSED';
  if (row.status === 'pending_verification' && meta.auto_resolved) return 'SETTLED?';
  if (meta.calendar_urgent && row.status !== 'pending_verification') return 'NOW';
  const snooze = ts(row.snooze_until);
  if (row.status === 'snoozed' && snooze && snooze > now) return 'WAITING';
  if (row.status === 'pending_verification' || row.priority === 0) return 'NOW';
  const followup = ts(row.followup_at);
  if (row.status === 'waiting' && (!followup || followup > now)) return 'WAITING';
  const due = row.due_at ? etDate(row.due_at) : null;
  const today = etDate(at);
  if (row.priority === 1 || (due && due <= today) || (followup && followup <= now)) return 'NOW';
  return 'NEXT';
}

/** queue_brief.sort_key */
export function compareRows(a, b) {
  if (a.priority !== b.priority) return a.priority - b.priority;
  const da = ts(a.due_at) ?? Number.MAX_SAFE_INTEGER;
  const db = ts(b.due_at) ?? Number.MAX_SAFE_INTEGER;
  if (da !== db) return da - db;
  const ra = (a.meta || {}).rank || 0;
  const rb = (b.meta || {}).rank || 0;
  if (ra !== rb) return rb - ra;
  const fa = ts(a.first_seen) ?? 0;
  const fb = ts(b.first_seen) ?? 0;
  if (fa !== fb) return fa - fb;
  return a.id - b.id;
}

export function isOverdue(row, at = new Date()) {
  const due = ts(row.due_at);
  return Boolean(due && due < at.getTime() && !(row.meta || {}).due_is_request);
}

/**
 * Which actions an actor may take on a row. Mirrors ledger.close/confirm/verify/reopen guards, plus the
 * board's staffing rule: Mak (new office admin) cannot close, drop or defer a critical item — he notes/asks instead.
 * Returns { allowed: boolean, reason?: string } per action.
 */
export function permissions(row, actor) {
  const active = isActive(row);
  const critical = makBlocked(row);
  const isAbram = actor === 'abram';
  const deny = (reason) => ({ allowed: false, reason });
  const ok = { allowed: true };
  return {
    done: !active ? deny('Already closed') : critical && !isAbram ? deny('Critical item — Abram confirms') : ok,
    confirm: !active ? deny('Already closed') : critical && !isAbram ? deny('Critical item — Abram confirms') : ok,
    drop: !active ? deny('Already closed') : critical && !isAbram ? deny('Critical item — Abram decides') : ok,
    wait: !active ? deny('Already closed') : ok,
    snooze: !active ? deny('Already closed') : critical && !isAbram ? deny('Critical item — Abram defers') : ok,
    reopen: active ? deny('Still active') : ok,
    reassign: !active ? deny('Closed items are not reassigned') : ok,
    note: ok,
  };
}

/**
 * Validate an action payload the way ledger.py would. Throws Error(message) on a rule violation.
 * Returns a normalized payload { status, fields } describing the DB update (no history — server appends that).
 */
export function planAction(row, action, input, actor, at = new Date()) {
  const note = (input.note || '').trim();
  const until = input.until ? new Date(input.until) : null;
  const perm = permissions(row, actor)[action];
  if (perm && !perm.allowed) throw new Error(perm.reason);
  const nowIso = at.toISOString();
  // Offline confirmations are labelled by who gave them (queue_brief.display prints "Abram-confirmed" / "Mak-confirmed").
  const source = `${actor}_confirmation`;
  const confirmationEvidence = (summary) => [{ ref: source, observed_at: nowIso, summary }];

  switch (action) {
    case 'done': {
      // ledger.close(status='done') would park a needs-verification item in pending_verification when nobody has proof yet.
      // On the board there is no operator to run closure checks, so the person closing it must say what happened —
      // that is ledger.confirm (an offline confirmation, labelled as such, never "Verified").
      if (needsVerification(row) && !note && !(row.verified_at && hasEvidence(row))) {
        throw new Error('Say what actually happened to close this (e.g. "called back, sent pricing Sep 24")');
      }
      const fields = { status: 'done', closed_by: actor, close_note: note || null, closed_at: nowIso, snooze_until: null, signed_off_at: nowIso };
      if (!row.verified_at || !hasEvidence(row)) {
        fields.verification_source = source;
        fields.verified_at = nowIso;
        fields.evidence = confirmationEvidence(note || `${actor === 'mak' ? 'Mak' : 'Abram'} marked this exact task done.`);
      }
      return { status: 'done', fields };
    }
    case 'confirm': {
      if (!note) throw new Error('Offline confirmation needs a note saying what actually happened');
      return {
        status: 'done',
        fields: { status: 'done', closed_at: nowIso, closed_by: actor, close_note: note, evidence: confirmationEvidence(note),
          verified_at: nowIso, signed_off_at: nowIso, verification_source: source, snooze_until: null },
      };
    }
    case 'drop': {
      if (needsVerification(row) && !note) throw new Error('Dropping a tracked obligation needs a reason');
      return { status: 'dropped', fields: { status: 'dropped', closed_by: actor, close_note: note || null, closed_at: nowIso, snooze_until: null } };
    }
    case 'snooze': {
      if (!until || Number.isNaN(until.getTime())) throw new Error('Snooze needs a date/time');
      if (until.getTime() <= at.getTime()) throw new Error('Snooze date must be in the future');
      if (needsVerification(row) && !note) throw new Error('Deferring a tracked obligation needs a reason');
      return { status: 'snoozed', fields: { status: 'snoozed', closed_by: actor, close_note: note || null, closed_at: null, snooze_until: until.toISOString() } };
    }
    case 'wait': {
      if (!until || Number.isNaN(until.getTime()) || !note) throw new Error('Waiting needs a follow-up date and who/what is awaited');
      return { status: 'waiting', fields: { status: 'waiting', closed_by: actor, close_note: note, closed_at: null, snooze_until: null, owner: 'them', followup_at: until.toISOString() } };
    }
    case 'reopen': {
      if (!note) throw new Error('Reopening needs a reason');
      return { status: 'open', fields: { status: 'open', closed_at: null, closed_by: actor, close_note: note, snooze_until: null,
        verified_at: null, signed_off_at: null, verification_source: null, evidence: [] } };
    }
    case 'reassign': {
      const assignee = input.assignee;
      if (!ASSIGNEES.includes(assignee)) throw new Error('Unknown assignee');
      if (assignee === row.assignee) throw new Error(`Already assigned to ${assignee}`);
      return { status: row.status, fields: { assignee, assigned_by: actor, assigned_at: nowIso }, note: note || `Reassigned to ${assignee}` };
    }
    case 'note': {
      if (!note) throw new Error('Note is empty');
      return { status: row.status, fields: {}, note };
    }
    default:
      throw new Error('Unknown action');
  }
}

/** Key for an ad-hoc task — same scheme as ledger.key_for('decision', text=...) (sha256 of trimmed lowercase text, 20 hex chars). */
export async function decisionKey(text) {
  const data = new TextEncoder().encode(text.trim().toLowerCase());
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error('WebCrypto unavailable');
  const digest = await subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `decision:${hex.slice(0, 20)}`;
}
