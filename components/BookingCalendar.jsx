'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * World-class booking calendar.
 * Props:
 *   selected: 'YYYY-MM-DD' string or null
 *   onSelect: (dateStr: 'YYYY-MM-DD') => void
 *   isDateDisabled: (date: Date) => boolean
 */
export default function BookingCalendar({ selected, onSelect, isDateDisabled }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const selectedDate = useMemo(() => {
    if (!selected) return null;
    const [y, m, d] = selected.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selected]);

  // Build grid: 6 weeks × 7 days
  const weeks = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startOffset = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // Previous month fill
    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, outside: true, date: new Date(viewYear, viewMonth - 1, prevMonthDays - i) });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, outside: false, date: new Date(viewYear, viewMonth, d) });
    }

    // Next month fill
    const remaining = 42 - cells.length; // always show 6 weeks
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, outside: true, date: new Date(viewYear, viewMonth + 1, d) });
    }

    // Split into weeks
    const w = [];
    for (let i = 0; i < cells.length; i += 7) {
      w.push(cells.slice(i, i + 7));
    }

    // Trim trailing empty-looking weeks (if all outside)
    while (w.length > 5 && w[w.length - 1].every(c => c.outside)) {
      w.pop();
    }

    return w;
  }, [viewMonth, viewYear]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Don't allow navigating before current month
  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  // Don't allow navigating more than 3 months ahead
  const maxMonth = today.getMonth() + 3;
  const maxYear = today.getFullYear() + Math.floor(maxMonth / 12);
  const maxMo = maxMonth % 12;
  const canGoNext = viewYear < maxYear || (viewYear === maxYear && viewMonth < maxMo);

  function isSameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function isToday(date) {
    return isSameDay(date, today);
  }

  function isSelected(date) {
    return isSameDay(date, selectedDate);
  }

  function formatDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <h3 className="text-sm font-semibold text-slate-800 tracking-wide">
          {MONTHS[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={nextMonth}
          disabled={!canGoNext}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-2 pt-2 pb-1">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-semibold py-1 ${
              i === 0 ? 'text-red-400' : 'text-slate-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="px-2 pb-3">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0.5">
            {week.map((cell, ci) => {
              const disabled = cell.outside || (isDateDisabled && isDateDisabled(cell.date));
              const sel = !cell.outside && isSelected(cell.date);
              const tod = !cell.outside && isToday(cell.date);
              const isSunday = cell.date.getDay() === 0;

              return (
                <button
                  key={ci}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (!disabled) onSelect(formatDateStr(cell.date));
                  }}
                  className={`
                    relative w-full aspect-square flex items-center justify-center
                    text-sm rounded-lg transition-all duration-150
                    ${sel
                      ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-200 ring-2 ring-amber-300'
                      : tod
                        ? 'bg-amber-50 text-amber-800 font-semibold ring-1 ring-amber-200'
                        : cell.outside
                          ? 'text-slate-200 cursor-default'
                          : disabled
                            ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                            : isSunday
                              ? 'text-red-300 bg-slate-50 cursor-not-allowed'
                              : 'text-slate-700 hover:bg-amber-50 hover:text-amber-700 cursor-pointer'
                    }
                    ${disabled && !cell.outside ? 'line-through decoration-slate-300' : ''}
                  `}
                  aria-label={cell.date.toDateString()}
                  aria-selected={sel}
                >
                  {cell.day}
                  {tod && !sel && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-3 pb-3 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Selected
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-50 ring-1 ring-amber-200" /> Today
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-50 line-through text-slate-300" /> Unavailable
        </span>
      </div>
    </div>
  );
}
