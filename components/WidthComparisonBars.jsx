'use client';

import React, { useMemo } from 'react';

/**
 * Visual width comparison — horizontal bars showing relative plank widths.
 * Takes an array of width strings like ["5\"", "6 1/2\"", "7 1/2\"", "9\""]
 * and renders proportional bars so customers can see the difference.
 */

function parseWidthInches(widthStr) {
  if (!widthStr) return 0;
  // Handle formats: "5\"", "5"", "6 1/2\"", "6½\"", "7.5\"", "9"
  const cleaned = widthStr.replace(/[""″]/g, '').trim();
  // Check for fraction: "6 1/2"
  const fractionMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (fractionMatch) {
    return parseInt(fractionMatch[1]) + parseInt(fractionMatch[2]) / parseInt(fractionMatch[3]);
  }
  // Check for ½ symbol
  if (cleaned.includes('½')) {
    const base = parseFloat(cleaned.replace('½', '')) || 0;
    return base + 0.5;
  }
  // Plain number or decimal
  return parseFloat(cleaned) || 0;
}

export default function WidthComparisonBars({ widths, selectedWidth, onSelect }) {
  const parsed = useMemo(() => {
    return widths.map(w => ({
      label: w,
      inches: parseWidthInches(w),
    })).filter(w => w.inches > 0).sort((a, b) => a.inches - b.inches);
  }, [widths]);

  if (parsed.length < 2) return null;

  const maxInches = Math.max(...parsed.map(w => w.inches));

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Width Comparison</label>
      <div className="space-y-1.5">
        {parsed.map(({ label, inches }) => {
          const pct = (inches / maxInches) * 100;
          const isSelected = selectedWidth === label;
          return (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className={`w-full flex items-center gap-3 py-1.5 px-2 rounded-lg transition-all group ${
                isSelected ? 'bg-amber-50' : 'hover:bg-slate-50'
              }`}
            >
              <span className={`text-xs font-medium w-12 text-right shrink-0 ${
                isSelected ? 'text-amber-800' : 'text-slate-600'
              }`}>
                {label}
              </span>
              <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                      : 'bg-gradient-to-r from-slate-200 to-slate-300 group-hover:from-slate-300 group-hover:to-slate-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
                <span className={`absolute inset-y-0 right-2 flex items-center text-[10px] font-semibold ${
                  isSelected ? 'text-amber-700' : 'text-slate-400'
                }`}>
                  {inches}&quot;
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
