'use client';

/**
 * Phase B, B3: shared date + time picker for FreeMeasurementClient, QuoteBookingClient and
 * ViewBookingClient. Real availability from GET /api/booking/availability (no-store); logic and
 * copy live in lib/booking/picker-model.js (unit-tested). No scarcity copy. Times labelled ET.
 *
 * Props:
 *   date, time                 selected 'YYYY-MM-DD' / '1:30 PM' ('' when none)
 *   onDateChange(date)         parent clears its time; contact details are never touched here
 *   onTimeChange(time)
 *   token                      lookup token when rescheduling (own booking excluded from occupancy)
 *   override                   availability object from a 409 response (refreshed options)
 *   onAlternate()              optional: "Ask for a different time" (B4 panel)
 *   idPrefix                   unique DOM id prefix
 */
import { useEffect, useState } from 'react';
import BookingCalendar from '@/components/BookingCalendar';
import {
  BOOKING_COPY, pickerView, reconcileSelection, isCalendarDateDisabled,
} from '@/lib/booking/picker-model';

export default function SlotPicker({ date, time, onDateChange, onTimeChange, token = null, override = null, onAlternate = null, idPrefix = 'slot' }) {
  // Fetched availability keyed by request; loading/override are DERIVED (no sync setState in effects).
  const [fetched, setFetched] = useState({ key: null, result: null, failed: false });
  const [expanded, setExpanded] = useState(false);
  const [reload, setReload] = useState(0);
  // A 409 override is shown until the user asks to reload; then fresh data wins (a later 409
  // brings a NEW override object, which is shown again).
  const [dismissedOverride, setDismissedOverride] = useState(null);
  const [nowMs] = useState(() => Date.now()); // once per mount (lazy init, not during render)
  const key = date ? `${date}|${token || ''}|${reload}` : null;

  useEffect(() => {
    if (!key) return undefined;
    const ctrl = new AbortController();
    const qs = new URLSearchParams({ date, ...(token ? { token } : {}) });
    fetch(`/api/booking/availability?${qs}`, { cache: 'no-store', signal: ctrl.signal })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!body || (res.status !== 200 && res.status !== 503)) throw new Error('bad');
        setFetched({ key, result: { ...body, date: body.date || date }, failed: false });
      })
      .catch((e) => { if (e?.name !== 'AbortError') setFetched({ key, result: null, failed: true }); });
    return () => ctrl.abort();
  }, [key, date, token]);

  // 409 → the refreshed options the server returned win for that date (parent clears on date change).
  const useOverride = !!(override && override.date === date && override !== dismissedOverride);
  const loading = !!key && !useOverride && fetched.key !== key;
  const result = useOverride ? override : (fetched.key === key ? fetched.result : null);
  const failed = !useOverride && fetched.key === key && fetched.failed;

  // Clear a selected time that is no longer offered (date change, refresh, 409). Parent callback,
  // not local state.
  useEffect(() => {
    if (!time || loading || !result || result.date !== date) return;
    if (reconcileSelection(time, result, date) === '') onTimeChange('');
  }, [result, loading, date, time, onTimeChange]);

  const view = pickerView(result, { expanded, loading, error: failed });

  const slotButton = (s) => (
    <button
      key={s.time}
      type="button"
      onClick={() => onTimeChange(s.time)}
      aria-pressed={time === s.time}
      className={`min-h-[44px] py-2 px-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
        time === s.time
          ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
          : 'bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-800 border border-slate-200'
      }`}
    >
      {s.time} <span className="text-[10px] opacity-75">ET</span>
    </button>
  );

  return (
    <div>
      <p id={`${idPrefix}-label`} className="font-semibold text-sm text-slate-800 mb-2">{BOOKING_COPY.chooseTime} *</p>
      <BookingCalendar
        selected={date}
        onSelect={(d) => { setExpanded(false); onDateChange(d); }}
        isDateDisabled={(d) => isCalendarDateDisabled(d, nowMs)}
      />
      <p className="text-[11px] text-slate-500 mt-2">{BOOKING_COPY.timeZoneNote}</p>
      {date && (
        <div className="mt-3" aria-labelledby={`${idPrefix}-label`}>
          <div role="status" aria-live="polite" className="text-sm text-slate-600">
            {view.message && <p className={view.state === 'unavailable' ? 'text-red-700' : ''}>{view.message}</p>}
          </div>
          {view.state === 'ready' && (
            <>
              <div className="grid grid-cols-3 gap-2 mt-2">{view.primary.map(slotButton)}</div>
              {view.hasMore && (
                <>
                  {expanded && <div className="grid grid-cols-3 gap-2 mt-2">{view.more.map(slotButton)}</div>}
                  <button type="button" onClick={() => setExpanded((x) => !x)} aria-expanded={expanded}
                    className="mt-2 min-h-[44px] text-sm font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2">
                    {expanded ? BOOKING_COPY.seeFewer : BOOKING_COPY.seeMore}
                  </button>
                </>
              )}
            </>
          )}
          {view.state === 'unavailable' && (
            <div className="flex flex-wrap gap-2 mt-2">
              <button type="button" onClick={() => { setDismissedOverride(override); setReload((n) => n + 1); }} className="min-h-[44px] px-4 rounded-lg border border-slate-300 text-sm font-semibold">Try again</button>
              <a href={BOOKING_COPY.phoneHref} className="min-h-[44px] inline-flex items-center px-4 rounded-lg bg-slate-800 text-white text-sm font-semibold">Call {BOOKING_COPY.phone}</a>
            </div>
          )}
          {onAlternate && view.state !== 'loading' && (
            <p className="text-sm text-slate-600 mt-3">
              {BOOKING_COPY.alternate}{' '}
              <button type="button" onClick={onAlternate} className="min-h-[44px] font-semibold text-amber-700 underline underline-offset-2">{BOOKING_COPY.alternateCta}</button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
