'use client';

/**
 * Phase B, B4: inline "Ask for a different time" panel. Reuses contact details already typed in
 * the booking form (prefill only; never writes back) and the project context. No booking row,
 * calendar event or appointment conversion. Logic: lib/booking/alternate-time.js.
 */
import { useEffect, useRef, useState } from 'react';
import { ALTERNATE_COPY, buildAlternateTimeRequest, interpretAlternateResponse } from '@/lib/booking/alternate-time';

export default function AlternateTimePanel({ prefill = {}, context = {}, onClose, idPrefix = 'alt' }) {
  const [f, setF] = useState({ name: prefill.name || '', phone: prefill.phone || '', email: prefill.email || '', preferences: '' });
  const [sending, setSending] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [error, setError] = useState('');
  const headRef = useRef(null);
  useEffect(() => { headRef.current?.focus(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // never submits the surrounding booking form
    if (sending) return; // duplicate-submit guard
    const built = buildAlternateTimeRequest(f, context);
    if (!built.ok) { setError(built.error); return; }
    setError(''); setSending(true);
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(built.body) });
      const body = await res.json().catch(() => null);
      const o = interpretAlternateResponse(res.status, body);
      if (o.kind === 'received') setOutcome(o); else setError(o.message);
    } catch {
      setError(ALTERNATE_COPY.retry); // keep the form filled for retry
    } finally {
      setSending(false);
    }
  };

  if (outcome) {
    return (
      <div role="status" className="mt-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        {outcome.message}
      </div>
    );
  }
  const field = 'w-full mt-1 min-h-[44px] px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400';
  return (
    // This panel sits INSIDE the booking <form>. Enter in one of its inputs would implicitly submit
    // the booking form, so Enter (outside the textarea) sends THIS request instead.
    <div
      className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target?.tagName !== 'TEXTAREA' && e.target?.tagName !== 'BUTTON') { e.preventDefault(); submit(e); }
      }}
    >
      <h3 ref={headRef} tabIndex={-1} className="font-semibold text-slate-800 focus:outline-none">{ALTERNATE_COPY.title}</h3>
      <p className="text-xs text-slate-600 mt-1">{ALTERNATE_COPY.intro}</p>
      <div className="grid gap-2 mt-3">
        <label className="text-sm font-medium" htmlFor={`${idPrefix}-name`}>Name *
          <input id={`${idPrefix}-name`} className={field} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
        </label>
        <label className="text-sm font-medium" htmlFor={`${idPrefix}-phone`}>Phone *
          <input id={`${idPrefix}-phone`} type="tel" className={field} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" />
        </label>
        <label className="text-sm font-medium" htmlFor={`${idPrefix}-email`}>Email (optional)
          <input id={`${idPrefix}-email`} type="email" className={field} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
        </label>
        <label className="text-sm font-medium" htmlFor={`${idPrefix}-prefs`}>{ALTERNATE_COPY.prefsLabel}
          <textarea id={`${idPrefix}-prefs`} rows={2} className={field} placeholder={ALTERNATE_COPY.prefsPlaceholder} value={f.preferences} onChange={(e) => setF({ ...f, preferences: e.target.value })} />
        </label>
      </div>
      {error && <p role="alert" className="text-sm text-red-700 mt-2">{error}</p>}
      <div className="flex flex-wrap gap-2 mt-3">
        <button type="button" onClick={submit} disabled={sending} className="min-h-[44px] px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold disabled:opacity-60">
          {sending ? ALTERNATE_COPY.sending : ALTERNATE_COPY.submit}
        </button>
        <a href="tel:6474281111" className="min-h-[44px] inline-flex items-center px-4 rounded-lg border border-slate-300 text-sm font-semibold">Call (647) 428-1111</a>
        {onClose && <button type="button" onClick={onClose} className="min-h-[44px] px-3 text-sm text-slate-600 underline">Back to times</button>}
      </div>
    </div>
  );
}
