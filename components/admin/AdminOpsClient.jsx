'use client';
import React, { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Check, Clock, Pause, RotateCcw, ArrowRightLeft, Plus, Bell, MessageSquare, X, RefreshCw } from 'lucide-react';
import { sectionFor, compareRows, permissions, isOverdue, needsVerification, makBlocked, ET } from '@/lib/ops/brief-rules';

/**
 * /admin/ops — Ops board for Abram + Mak over public.brief_items (the same ledger the Telegram brief reads).
 * Single admin login: the "Working as" switch decides who a click is recorded as. Mak (office admin) gets his own
 * queue plus a "Chase Abram" list — his job there is to remind Abram and ask how, not to close Abram's items.
 */

const VIEW_KEY = 'bbs.ops.actor';
const SECTION_HELP = {
  NOW: 'Overdue, due today, critical, or needs a closure check',
  'SETTLED?': 'Records suggest this is done — confirm or reopen',
  NEXT: 'Open, not yet urgent',
  WAITING: 'Ball is in their court (or snoozed) — auto-returns to NOW on the follow-up date',
  CLOSED: 'Done or dropped in the last 48 h',
};
const ACTION_LABEL = { done: 'Done', confirm: 'Confirm', drop: 'Drop', snooze: 'Snooze', wait: 'Waiting on them', reopen: 'Reopen', reassign: 'Reassign', note: 'Note' };

const fmtET = (value, withTime = true) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ET, weekday: 'short', month: 'short', day: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(d);
};

const who = (a) => (a === 'mak' ? 'Mak' : 'Abram');

// "Working as" persists per browser (single admin login for now). External store => no setState-in-effect, SSR-safe.
const actorStore = {
  subscribe(cb) { window.addEventListener('storage', cb); window.addEventListener('bbs-ops-actor', cb); return () => { window.removeEventListener('storage', cb); window.removeEventListener('bbs-ops-actor', cb); }; },
  get() { try { const v = window.localStorage.getItem(VIEW_KEY); return v === 'mak' ? 'mak' : 'abram'; } catch { return 'abram'; } },
  getServer() { return 'abram'; },
  set(a) { try { window.localStorage.setItem(VIEW_KEY, a); } catch {} window.dispatchEvent(new Event('bbs-ops-actor')); },
};

async function api(method, body) {
  const res = await fetch('/api/admin/ops', {
    method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json;
}

/** Local datetime-local string (browser tz) → ISO. Datetime-local has no tz; we treat it as the browser's clock. */
function localToIso(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
function quickUntil(hoursOrDays, unit) {
  const d = new Date();
  if (unit === 'h') d.setHours(d.getHours() + hoursOrDays);
  else { d.setDate(d.getDate() + hoursOrDays); d.setHours(9, 0, 0, 0); }
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminOpsClient() {
  const qc = useQueryClient();
  const actor = useSyncExternalStore(actorStore.subscribe, actorStore.get, actorStore.getServer);
  const switchActor = actorStore.set;
  const [view, setView] = useState('mine'); // mine | all
  const [dialog, setDialog] = useState(null); // { row, action }
  const [adding, setAdding] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin-ops'],
    queryFn: () => api('GET'),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const act = useMutation({
    mutationFn: (payload) => api('POST', { ...payload, actor }),
    onSuccess: (res, payload) => {
      qc.invalidateQueries({ queryKey: ['admin-ops'] });
      const id = res.item?.id;
      if (payload.action === 'add') toast.success(`Added #${id} for ${who(res.item.assignee)}`);
      else toast.success(`#${id} ${ACTION_LABEL[payload.action] || payload.action}${res.item.assignee && payload.action === 'reassign' ? ` → ${who(res.item.assignee)}` : ''}`);
      setDialog(null); setAdding(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const atIso = data?.at;
  const rawItems = data?.items;
  const at = useMemo(() => (atIso ? new Date(atIso) : new Date()), [atIso]);
  const items = useMemo(() => rawItems || [], [rawItems]);

  const grouped = useMemo(() => {
    const scope = view === 'all' ? items : items.filter((r) => r.assignee === actor);
    const g = { NOW: [], 'SETTLED?': [], NEXT: [], WAITING: [], CLOSED: [] };
    for (const r of scope) g[sectionFor(r, at)].push(r);
    for (const k of Object.keys(g)) g[k].sort(compareRows);
    return g;
  }, [items, actor, view, at]);

  // Mak's "chase Abram" list: Abram's NOW items + anything overdue — Mak reminds, asks how, or adds a reminder.
  const chase = useMemo(() => {
    if (actor !== 'mak') return [];
    return items.filter((r) => r.assignee === 'abram' && ['open', 'waiting', 'pending_verification', 'snoozed'].includes(r.status))
      .filter((r) => sectionFor(r, at) === 'NOW' || isOverdue(r, at)).sort(compareRows);
  }, [items, actor, at]);

  const counts = useMemo(() => {
    const active = items.filter((r) => !['done', 'dropped'].includes(r.status));
    return { abram: active.filter((r) => r.assignee === 'abram').length, mak: active.filter((r) => r.assignee === 'mak').length };
  }, [items]);

  const openDialog = useCallback((row, action) => setDialog({ row, action }), []);

  if (error) return <div className="max-w-7xl mx-auto px-4 py-8 text-red-600 text-sm">Could not load the ops board: {error.message}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5" data-testid="ops-board">
      <header className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Ops board</h1>
          <p className="text-xs text-slate-500">{fmtET(at)} ET · same ledger as the Telegram brief · stable #IDs</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm" role="tablist" aria-label="Working as">
            {['abram', 'mak'].map((a) => (
              <button key={a} type="button" role="tab" aria-selected={actor === a} onClick={() => switchActor(a)} data-testid={`actor-${a}`}
                className={`px-3 py-1.5 rounded-md transition ${actor === a ? 'bg-amber-100 text-amber-800 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                {who(a)} <span className="text-xs opacity-70">· {counts[a]}</span>
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm">
            {[['mine', `${who(actor)}'s`], ['all', 'Everyone']].map(([v, label]) => (
              <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v}
                className={`px-3 py-1.5 rounded-md transition ${view === v ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{label}</button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh"><RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /></Button>
          <Button size="sm" onClick={() => setAdding(true)} data-testid="add-task"><Plus className="w-4 h-4 mr-1" /> Add task</Button>
        </div>
      </header>

      {actor === 'mak' && (
        <section className="rounded-xl border border-sky-200 bg-sky-50/60 p-4" data-testid="chase-abram">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-sky-700" />
            <h2 className="text-sm font-semibold text-sky-900">Chase Abram · {chase.length}</h2>
            <span className="text-xs text-sky-800/70">Abram&apos;s urgent items. Remind him, ask how, or log that you asked — don&apos;t close these yourself.</span>
          </div>
          {chase.length === 0 ? <p className="text-xs text-sky-800/70">Nothing urgent on Abram&apos;s plate right now.</p> : (
            <ul className="grid gap-2 md:grid-cols-2">
              {chase.map((r) => (
                <li key={r.id} className="rounded-lg bg-white border border-sky-100 p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 truncate">#{r.id} · {r.label}</div>
                      <div className="text-xs text-slate-600 line-clamp-2">{r.meta?.ask || r.completion_rule}</div>
                      {r.due_at && <div className={`text-xs mt-1 ${isOverdue(r, at) ? 'text-red-600 font-medium' : 'text-slate-500'}`}>{isOverdue(r, at) ? '⏰ OVERDUE — ' : ''}{r.meta?.due_is_request ? 'Target' : 'Due'}: {fmtET(r.due_at, !r.meta?.date_only)}</div>}
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0" onClick={() => openDialog(r, 'note')}><MessageSquare className="w-3.5 h-3.5 mr-1" /> Asked Abram</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {isLoading ? <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" /> : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {['NOW', 'SETTLED?', 'NEXT', 'WAITING'].map((name) => (
            <Column key={name} name={name} rows={grouped[name]} at={at} actor={actor} onAction={openDialog} />
          ))}
        </div>
      )}

      {!isLoading && (
        <details className="rounded-xl border border-slate-200 bg-white" data-testid="closed">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700">Closed (48 h) · {grouped.CLOSED.length}</summary>
          <ul className="divide-y divide-slate-100">
            {grouped.CLOSED.map((r) => (
              <li key={r.id} className="px-4 py-2.5 text-sm flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-medium text-slate-700">#{r.id} · {r.label}</span>
                  <div className="text-xs text-slate-500">{r.status === 'dropped' ? 'Dropped' : r.verification_source === 'abram_confirmation' ? 'Abram-confirmed' : r.verification_source === 'mak_confirmation' ? 'Mak-confirmed' : 'Verified'}{r.close_note ? `: ${r.close_note}` : ''} · {fmtET(r.closed_at)}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => openDialog(r, 'reopen')}><RotateCcw className="w-3.5 h-3.5 mr-1" /> Reopen</Button>
              </li>
            ))}
            {grouped.CLOSED.length === 0 && <li className="px-4 py-3 text-xs text-slate-500">Nothing closed in the last 48 h.</li>}
          </ul>
        </details>
      )}

      {dialog && <ActionDialog dialog={dialog} actor={actor} pending={act.isPending} onClose={() => setDialog(null)} onSubmit={(payload) => act.mutate({ ...payload, id: dialog.row.id, action: dialog.action })} />}
      {adding && <AddDialog actor={actor} pending={act.isPending} onClose={() => setAdding(false)} onSubmit={(payload) => act.mutate({ ...payload, action: 'add' })} />}
    </div>
  );
}

function Column({ name, rows, at, actor, onAction }) {
  const tone = { NOW: 'border-red-200 bg-red-50/40', 'SETTLED?': 'border-emerald-200 bg-emerald-50/40', NEXT: 'border-slate-200 bg-white', WAITING: 'border-amber-200 bg-amber-50/40' }[name];
  return (
    <section className={`rounded-xl border p-3 ${tone}`} data-testid={`col-${name.replace('?', '')}`} aria-label={name}>
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-semibold text-slate-800">{name} · {rows.length}</h2>
      </div>
      <p className="text-[11px] text-slate-500 mb-2">{SECTION_HELP[name]}</p>
      <ul className="space-y-2">
        {rows.map((r) => <ItemCard key={r.id} row={r} at={at} actor={actor} section={name} onAction={onAction} />)}
        {rows.length === 0 && <li className="text-xs text-slate-400 py-2">Empty.</li>}
      </ul>
    </section>
  );
}

function ItemCard({ row, at, actor, section, onAction }) {
  const meta = row.meta || {};
  const perms = permissions(row, actor);
  const critical = makBlocked(row);
  const overdue = isOverdue(row, at);
  const settled = section === 'SETTLED?';
  const pendingCheck = row.status === 'pending_verification' && !meta.auto_resolved;
  const waitingLine = row.status === 'snoozed' ? `Deferred; review ${fmtET(row.snooze_until)}` : row.status === 'waiting' ? `${row.close_note || 'Waiting for their reply'}${row.followup_at ? `; review ${fmtET(row.followup_at)}` : '; follow-up date missing'}` : null;
  const btn = (action, Icon, label, variant = 'outline') => {
    const p = perms[action];
    return (
      <Button key={action} size="sm" variant={variant} disabled={!p.allowed} title={p.allowed ? label : p.reason} onClick={() => onAction(row, action)} className="h-7 px-2 text-xs">
        <Icon className="w-3.5 h-3.5 mr-1" /> {label}
      </Button>
    );
  };
  return (
    <li className="rounded-lg bg-white border border-slate-200 p-3 text-sm shadow-sm" data-testid={`item-${row.id}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium text-slate-800 leading-snug">#{row.id} · {row.label}</div>
        <div className="flex items-center gap-1 shrink-0">
          {critical && <Badge variant="outline" className="text-[10px] border-red-300 text-red-700">critical</Badge>}
          <Badge variant="secondary" className="text-[10px]">{who(row.assignee)}</Badge>
        </div>
      </div>
      <div className="mt-1 text-xs text-slate-600">
        {settled ? <>Looks settled: {row.close_note}</> : pendingCheck ? <><span className="font-medium text-red-700">CHECK TO CLOSE:</span> {row.completion_rule}</> : (meta.ask || row.completion_rule)}
      </div>
      {meta.facts && !settled && <div className="mt-1 text-xs text-slate-500">{meta.facts}</div>}
      {meta.calendar_urgent && Array.isArray(meta.calendar) && meta.calendar.length > 0 && (
        <div className="mt-1 text-xs text-slate-700">📅 {meta.calendar.filter((c) => ['delivery', 'install'].includes(c.kind)).map((c) => `${c.summary} ${fmtET(c.start, false)}`).join('; ')}</div>
      )}
      {row.due_at && <div className={`mt-1 text-xs ${overdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>{overdue ? '⏰ OVERDUE — ' : ''}{meta.due_display || `${meta.due_is_request ? 'Target' : 'Due'}: ${fmtET(row.due_at, !meta.date_only)} ET`}</div>}
      {waitingLine && <div className="mt-1 text-xs text-amber-800">{waitingLine}</div>}
      <div className="mt-2 flex flex-wrap gap-1">
        {settled || pendingCheck ? (
          <>
            {btn('confirm', Check, 'Confirm', 'default')}
            {btn('reopen', RotateCcw, 'Not done')}
          </>
        ) : (
          <>
            {btn('done', Check, 'Done', 'default')}
            {btn('wait', Clock, 'Waiting')}
            {btn('snooze', Pause, 'Snooze')}
            {btn('drop', X, 'Drop', 'ghost')}
          </>
        )}
        {btn('reassign', ArrowRightLeft, row.assignee === 'mak' ? '→ Abram' : '→ Mak', 'ghost')}
        {btn('note', MessageSquare, 'Note', 'ghost')}
      </div>
    </li>
  );
}

function ActionDialog({ dialog, actor, pending, onClose, onSubmit }) {
  const { row, action } = dialog;
  const [note, setNote] = useState('');
  const [until, setUntil] = useState('');
  const tracked = needsVerification(row); // ledger: anything not verify_kind=manual needs proof or a confirmation note
  const preVerified = Boolean(row.verified_at) && Array.isArray(row.evidence) && row.evidence.length > 0;
  const needsUntil = action === 'snooze' || action === 'wait';
  const noteRequired = action === 'confirm' || action === 'wait' || action === 'reopen' || action === 'note'
    || (action === 'done' && tracked && !preVerified) || ((action === 'drop' || action === 'snooze') && tracked);
  const title = {
    done: `Mark #${row.id} done`, confirm: `Confirm #${row.id} — what actually happened?`, drop: `Drop #${row.id}`, snooze: `Snooze #${row.id}`,
    wait: `#${row.id} — waiting on them`, reopen: `Reopen #${row.id}`, reassign: `Reassign #${row.id} to ${row.assignee === 'mak' ? 'Abram' : 'Mak'}`, note: `Note on #${row.id}`,
  }[action];
  const hint = {
    done: tracked && !preVerified ? `Say what actually happened — recorded as ${who(actor)}-confirmed (offline confirmation, not independent verification).` : 'Closes the item. Optional note.',
    confirm: `Recorded as an offline confirmation by ${who(actor)}, not independent verification.`,
    drop: tracked ? 'Why are we dropping a tracked obligation?' : 'Optional reason.',
    snooze: 'Hidden under WAITING until the date; returns to NOW then.',
    wait: 'Who/what are we waiting for, and when to chase. The ball moves to their court.',
    reopen: 'Why is this not actually done?',
    reassign: 'Optional note for the other person.',
    note: actor === 'mak' ? 'e.g. "Asked Abram at 2pm, he\'ll call Neil after 5". Goes into the history the brief reads.' : 'Goes into the item history.',
  }[action];
  const submit = (e) => {
    e.preventDefault();
    if (noteRequired && !note.trim()) return toast.error('A note is required for this action');
    if (needsUntil && !until) return toast.error('Pick a date/time');
    onSubmit({ note: note.trim() || undefined, until: needsUntil ? localToIso(until) : undefined, assignee: action === 'reassign' ? (row.assignee === 'mak' ? 'abram' : 'mak') : undefined });
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="text-base">{title}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <p className="text-xs text-slate-500">{hint}</p>
          <p className="text-sm text-slate-700">{row.label}</p>
          {needsUntil && (
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1">
                {[['+4h', 4, 'h'], ['Tomorrow 9am', 1, 'd'], ['+3 days', 3, 'd'], ['Next week', 7, 'd']].map(([l, n, u]) => (
                  <Button key={l} type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setUntil(quickUntil(n, u))}>{l}</Button>
                ))}
              </div>
              <Input type="datetime-local" value={until} onChange={(e) => setUntil(e.target.value)} required aria-label="Until" />
            </div>
          )}
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder={noteRequired ? 'Required' : 'Optional'} aria-label="Note" />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? 'Saving…' : ACTION_LABEL[action]}</Button>
          </div>
          <p className="text-[11px] text-slate-400">Recorded as {who(actor)}.</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddDialog({ actor, pending, onClose, onSubmit }) {
  const [label, setLabel] = useState('');
  const [ask, setAsk] = useState('');
  const [assignee, setAssignee] = useState(actor === 'mak' ? 'abram' : 'mak');
  const [priority, setPriority] = useState(2);
  const submit = (e) => {
    e.preventDefault();
    if (label.trim().length < 4) return toast.error('Give the task a name');
    onSubmit({ label: label.trim(), ask: ask.trim() || undefined, assignee, priority });
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="text-base">Add a task</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <p className="text-xs text-slate-500">{actor === 'mak' ? 'Reminders for Abram go here — he sees them in his NOW/NEXT and in the Telegram brief.' : 'Hand something to Mak or note a task for yourself.'}</p>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Ask Abram: send Dan the breakdown" maxLength={160} required aria-label="Task" />
          <Textarea value={ask} onChange={(e) => setAsk(e.target.value)} rows={2} placeholder="Next action / context (optional)" maxLength={240} aria-label="Next action" />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-600">For</span>
            {['abram', 'mak'].map((a) => (
              <Button key={a} type="button" size="sm" variant={assignee === a ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => setAssignee(a)} aria-pressed={assignee === a}>{who(a)}</Button>
            ))}
            <span className="text-slate-600 ml-2">Priority</span>
            {[[1, 'Today'], [2, 'Normal'], [3, 'Low']].map(([p, l]) => (
              <Button key={p} type="button" size="sm" variant={priority === p ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => setPriority(p)} aria-pressed={priority === p}>{l}</Button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? 'Adding…' : 'Add'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
