'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Phone, X, Search, ExternalLink, Voicemail } from 'lucide-react';
import { tokenizeFacts, telHref, smsHref, formatPhone, cardPhones, smsDraft } from '@/lib/ops/refs';
import { ET } from '@/lib/ops/brief-rules';

/**
 * Ops board helpers: tappable refs in card text, the ref drawer, history search, tap-to-text, money strip.
 * Everything here is read-only against /api/admin/ops/{ref,search,money}.
 */

const fmtWhen = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', { timeZone: ET, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(d);
};
const money = (n) => `$${Number(n || 0).toLocaleString('en-CA', { maximumFractionDigits: 0 })}`;

async function getJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json;
}

const CHIP = 'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none align-baseline active:scale-95 transition';
const LINK = 'underline decoration-dotted underline-offset-2 text-sky-700';

/** Renders card text with tappable refs. `onRef({kind,id,to?,label})` opens the drawer. */
export function Linkified({ text, onRef, onLead }) {
  const parts = useMemo(() => tokenizeFacts(text), [text]);
  return parts.map((p, i) => {
    switch (p.type) {
      case 'comms':
        return <button key={i} type="button" onClick={() => onRef({ kind: 'comms', id: p.id, to: p.to })} className={`${CHIP} border-sky-200 bg-sky-50 text-sky-800`} aria-label={`Open comms ${p.text}`}>💬 {p.to ? `${p.id}–${p.to}` : p.id}</button>;
      case 'emails':
        return <button key={i} type="button" onClick={() => onRef({ kind: 'emails', id: p.id })} className={`${CHIP} border-violet-200 bg-violet-50 text-violet-800`} aria-label={`Open email ${p.id}`}>✉️ {p.id}</button>;
      case 'lead':
        return <button key={i} type="button" onClick={() => onLead?.(p.id)} className={`${CHIP} border-emerald-200 bg-emerald-50 text-emerald-800`} aria-label={`Lead ${p.id}`}>🧲 {p.id}</button>;
      case 'phone':
        return (
          <span key={i} className="whitespace-nowrap">
            <a href={telHref(p.p10)} className={LINK}>{p.text}</a>
            <a href={smsHref(p.p10)} aria-label={`Text ${formatPhone(p.p10)}`} className="ml-0.5 px-1 no-underline">💬</a>
          </span>
        );
      case 'email':
        return <a key={i} href={`mailto:${p.address}`} className={LINK}>{p.text}</a>;
      default:
        return <React.Fragment key={i}>{p.text}</React.Fragment>;
    }
  });
}

/** 💬 Text button for a card — sms:+1…?&body= works on both iOS and Android. */
export function SmsButton({ row, className = '' }) {
  const phones = cardPhones(row);
  if (!phones.length) return null;
  const href = smsHref(phones[0], smsDraft(row));
  return (
    <a href={href} data-testid={`sms-${row.id}`} title={`Text ${formatPhone(phones[0])}`}
      className={`inline-flex items-center gap-1 h-9 lg:h-7 px-3 lg:px-2 rounded-md border border-slate-200 bg-white text-xs text-slate-700 active:bg-slate-100 ${className}`}>
      💬 Text
    </a>
  );
}

/** Bottom sheet on phones, right-hand side panel ≥md. ESC / backdrop / Close / swipe-down (phone) dismiss it. */
export function RefDrawer({ target, onClose }) {
  const { kind, id, to } = target;
  const q = useQuery({
    queryKey: ['ops-ref', kind, id, to || null],
    queryFn: () => getJson(`/api/admin/ops/ref?kind=${kind}&id=${id}${to ? `&to=${to}` : ''}`),
    staleTime: 5 * 60_000,
    retry: false,
  });
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const startY = useRef(null);
  const [dy, setDy] = useState(0);
  const onTouchStart = (e) => { startY.current = e.touches[0].clientY; };
  const onTouchMove = (e) => { if (startY.current != null) setDy(Math.max(0, e.touches[0].clientY - startY.current)); };
  const onTouchEnd = () => { if (dy > 90) onClose(); setDy(0); startY.current = null; };
  const title = kind === 'comms' ? `Comms ${id}${to ? `–${to}` : ''}` : kind === 'emails' ? `Email ${id}` : 'Details';
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title} data-testid="ref-drawer">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[85dvh] md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[28rem] flex flex-col rounded-t-2xl md:rounded-none bg-white shadow-2xl"
        style={dy ? { transform: `translateY(${dy}px)` } : undefined}>
        <div className="md:hidden pt-2 pb-1 touch-none" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-300" />
        </div>
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-slate-100" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <h3 className="text-sm font-semibold text-slate-800 truncate">{title}</h3>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1 h-9 px-3 -mr-2 rounded-md text-sm text-slate-600 active:bg-slate-100"><X className="w-4 h-4" /> Close</button>
        </div>
        <div className="min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 pb-[max(1rem,env(safe-area-inset-bottom))] text-sm break-words [overflow-wrap:anywhere]">
          {q.isLoading && <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />}
          {q.error && <p className="text-red-600 text-sm">{q.error.message === 'Not found' ? 'That record no longer exists.' : q.error.message}</p>}
          {q.data?.events && <CommsList events={q.data.events} to={q.data.to} truncated={q.data.truncated} />}
          {q.data?.email && <EmailView email={q.data.email} />}
        </div>
      </div>
    </div>
  );
}

const TYPE_ICON = { call: Phone, text: MessageSquare, voicemail: Voicemail };

function Who({ name, num }) {
  const p = num && formatPhone(num);
  return <>{name ? <span className="font-medium">{name}</span> : null}{name && p ? ' ' : ''}{p ? <a href={telHref(num)} className={name ? 'text-slate-500 text-xs' : LINK}>{p}</a> : null}</>;
}

function CommsList({ events, to, truncated }) {
  return (
    <ul className="space-y-3">
      {events.map((e) => {
        const Icon = TYPE_ICON[e.type] || Phone;
        const out = e.direction === 'Outbound';
        const other = out ? e.to : e.from;
        return (
          <li key={e.id} className={`rounded-xl border p-3 ${e.missed ? 'border-red-200 bg-red-50/50' : out ? 'border-slate-200 bg-slate-50' : 'border-sky-200 bg-sky-50/50'}`} data-testid={`comms-${e.id}`}>
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1"><Icon className="w-3.5 h-3.5" /> #{e.id} · {e.type}{e.missed ? ' · MISSED' : ''} · {out ? 'Outbound' : 'Inbound'}</span>
              <span className="shrink-0">{fmtWhen(e.when)} ET</span>
            </div>
            <div className="mt-1 text-xs text-slate-600">
              <span className="text-slate-400">From</span> <Who name={e.from_name} num={e.from} /> <span className="text-slate-400">→</span> <Who name={e.to_name} num={e.to} />
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-[13px] text-slate-800">{e.text || (e.missed ? 'Missed call — no message.' : e.type === 'voicemail' ? 'Voicemail — no transcript.' : e.type === 'call' ? 'Call — no transcript.' : '(empty)')}</p>
            {other && (
              <div className="mt-2 flex gap-2">
                <a href={telHref(other)} className="inline-flex items-center h-9 px-3 rounded-md border border-slate-200 bg-white text-xs text-slate-700">📞 Call</a>
                <a href={smsHref(other)} className="inline-flex items-center h-9 px-3 rounded-md border border-slate-200 bg-white text-xs text-slate-700">💬 Text</a>
              </div>
            )}
          </li>
        );
      })}
      {(truncated || to) && <li className="text-[11px] text-slate-400">{truncated ? 'Range capped at 20 events.' : `Showing events up to ${to}.`}</li>}
    </ul>
  );
}

function EmailView({ email }) {
  const [full, setFull] = useState(false);
  return (
    <div className="space-y-2" data-testid={`email-${email.id}`}>
      <div className="text-xs text-slate-500">{fmtWhen(email.when)} ET · {email.direction || 'email'} · #{email.id}</div>
      <h4 className="font-semibold text-slate-800">{email.subject || '(no subject)'}</h4>
      <div className="text-xs text-slate-600"><span className="text-slate-400">From</span> {email.from_name ? `${email.from_name} ` : ''}<a href={`mailto:${email.from}`} className={LINK}>{email.from}</a></div>
      {email.to.length > 0 && <div className="text-xs text-slate-600"><span className="text-slate-400">To</span> {email.to.join(', ')}</div>}
      <p className="whitespace-pre-wrap text-[13px] text-slate-800 rounded-lg bg-slate-50 p-2.5">{full && email.body ? email.body : (email.preview || email.body.slice(0, 400) || '(empty)')}</p>
      {email.body && email.body.length > (email.preview || '').length && (
        <button type="button" onClick={() => setFull((v) => !v)} className="h-9 text-xs text-sky-700 underline">{full ? 'Show less' : `Show full${email.body_truncated ? ' (first 8,000 chars)' : ''}`}</button>
      )}
      {email.attachments.length > 0 && <div className="text-xs text-slate-600">📎 {email.attachments.join(' · ')}</div>}
      {email.web_link && <a href={email.web_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 h-10 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700"><ExternalLink className="w-4 h-4" /> Open in Outlook</a>}
    </div>
  );
}

/** Debounced (300 ms, ≥2 chars) filter box; "Search history ↵" hits /api/admin/ops/search. */
export function SearchBox({ value, onChange, onOpenResult }) {
  const [draft, setDraft] = useState(value);
  const [histQ, setHistQ] = useState('');
  useEffect(() => { const t = setTimeout(() => onChange(draft.trim().length >= 2 ? draft.trim() : ''), 300); return () => clearTimeout(t); }, [draft, onChange]);
  const hist = useQuery({
    queryKey: ['ops-search', histQ],
    queryFn: () => getJson(`/api/admin/ops/search?q=${encodeURIComponent(histQ)}`),
    enabled: histQ.length >= 2,
    staleTime: 60_000,
    retry: false,
  });
  const run = (e) => { e?.preventDefault(); if (draft.trim().length >= 2) setHistQ(draft.trim()); };
  const clear = () => { setDraft(''); setHistQ(''); };
  return (
    <div className="min-w-0" data-testid="ops-search">
      <form onSubmit={run} className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input type="search" value={draft} onChange={(e) => { setDraft(e.target.value); if (histQ) setHistQ(''); }} placeholder="Search cards, people, phones…" aria-label="Search"
            enterKeyHint="search" className="w-full h-11 sm:h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-base sm:text-sm outline-none focus:ring-2 focus:ring-slate-300" />
          {draft && <button type="button" onClick={clear} aria-label="Clear search" className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>}
        </div>
        {value && <button type="submit" className="shrink-0 h-11 sm:h-9 px-3 rounded-lg bg-slate-800 text-white text-xs font-medium">Search history ↵</button>}
      </form>
      {histQ && (
        <div className="mt-2 rounded-xl border border-slate-200 bg-white" data-testid="search-results">
          {hist.isLoading && <p className="p-3 text-xs text-slate-500">Searching texts, calls, emails…</p>}
          {hist.error && <p className="p-3 text-xs text-red-600">{hist.error.message}</p>}
          {hist.data && hist.data.results.length === 0 && <p className="p-3 text-xs text-slate-500">No history matches “{histQ}”.</p>}
          <ul className="divide-y divide-slate-100 max-h-[60dvh] overflow-y-auto">
            {(hist.data?.results || []).map((r) => (
              <li key={`${r.kind}-${r.id}`}>
                <button type="button" onClick={() => onOpenResult(r)} className="w-full text-left px-3 py-2.5 active:bg-slate-50 break-words [overflow-wrap:anywhere]">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-medium text-slate-800 min-w-0">{{ comms: r.type === 'text' ? '💬' : r.type === 'voicemail' ? '📼' : '📞', email: '✉️', contact: '👤', card: '📋' }[r.kind]} {r.who}</span>
                    <span className="text-slate-400 shrink-0">{r.when ? fmtWhen(r.when) : ''}</span>
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-2">{r.snippet}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** 💰 In · Owe · A/R strip. Parts the server could not source are omitted. */
export function MoneyStrip() {
  const [open, setOpen] = useState(false);
  const [openAr, setOpenAr] = useState(false);
  const { data } = useQuery({ queryKey: ['ops-money'], queryFn: () => getJson('/api/admin/ops/money'), refetchInterval: 5 * 60_000, retry: false });
  if (!data || (!data.in && !data.owe && !data.ar)) return null;
  const { in: inn, owe, ar } = data;
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm" data-testid="money-strip">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-slate-700">
        <span>💰</span>
        {inn && <span>In: <b>{money(inn.total)}</b> <span className="text-slate-500">({inn.count} e-transfer{inn.count === 1 ? '' : 's'} 7d)</span></span>}
        {owe && (
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="text-left active:bg-slate-100 rounded px-1 -mx-1 min-h-8">
            Owe: <b>{money(owe.total)}</b> <span className="text-slate-500">({owe.vendors} vendor{owe.vendors === 1 ? '' : 's'}{owe.overdue ? `, ` : ''}{owe.overdue ? <span className="text-red-600 font-medium">{owe.overdue} overdue</span> : null})</span> {open ? '▴' : '▾'}
          </button>
        )}
        {ar && (
          <button type="button" onClick={() => setOpenAr((v) => !v)} aria-expanded={openAr} data-testid="money-ar" className="min-w-0 text-left active:bg-slate-100 rounded px-1 -mx-1 min-h-8 [overflow-wrap:anywhere]">
            A/R: <b>{money(ar.total)}</b> <span className="text-slate-500">({ar.count} inv{ar.overdue ? `, ` : ''}{ar.overdue ? <span className="text-red-600 font-medium">{ar.overdue} overdue</span> : null})</span> {openAr ? '▴' : '▾'}
          </button>
        )}
      </div>
      {open && owe && (
        <ul className="border-t border-slate-100 divide-y divide-slate-100">
          {owe.list.map((v) => (
            <li key={v.vendor} className="px-3 py-1.5 break-words [overflow-wrap:anywhere]">
              <div className="flex justify-between gap-2"><span className="font-medium text-slate-800 min-w-0">{v.vendor}{v.overdue ? <span className="ml-1 text-red-600">· {v.overdue} overdue</span> : null}</span><span className="shrink-0">{money(v.total)}</span></div>
              <div className="text-[11px] text-slate-500">{v.invoices.map((i) => `${i.inv_no || 'inv'} ${money(i.total)}${i.age_days != null ? ` (${i.age_days}d)` : ''}`).join(' · ')}</div>
            </li>
          ))}
        </ul>
      )}
      {openAr && ar && (
        <ul className="border-t border-slate-100 divide-y divide-slate-100" data-testid="money-ar-list">
          {ar.list.map((i, n) => (
            <li key={`${i.ref || 'inv'}-${n}`} className="px-3 py-1.5 break-words [overflow-wrap:anywhere]">
              <div className="flex justify-between gap-2"><span className="font-medium text-slate-800 min-w-0">{i.customer}{i.overdue ? <span className="ml-1 text-red-600">· overdue</span> : null}</span><span className="shrink-0">{money(i.balance)}</span></div>
              <div className="text-[11px] text-slate-500">{i.ref ? `#${i.ref}` : 'inv'}{i.due_date ? ` · due ${i.due_date}` : ''}{i.age_days != null ? ` (${i.age_days}d)` : ''}</div>
            </li>
          ))}
          {ar.count > ar.list.length && <li className="px-3 py-1.5 text-[11px] text-slate-500">+{ar.count - ar.list.length} more · QB as of {ar.snapshot_at ? ar.snapshot_at.slice(0, 10) : '?'}</li>}
        </ul>
      )}
    </div>
  );
}
