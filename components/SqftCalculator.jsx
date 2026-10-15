'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Calculator, Ruler, ChevronDown, ChevronUp } from 'lucide-react';

const WASTE_OPTIONS = [
  { value: 5, label: '5%', desc: 'Simple rectangular room' },
  { value: 10, label: '10%', desc: 'Standard — recommended' },
  { value: 15, label: '15%', desc: 'Complex layout / diagonal install' },
];

// Oct 15 2026 (Abram: "the input bar should be THE primary target — it blends
// in"): the sqft field is now the hero of the buy box — big, bold, amber, with a
// question as its label. The L×W helper is tucked behind a text link instead of
// a competing tab row, so there is exactly one obvious thing to do.
export default function SqftCalculator({ variants = [], currentVariant = null, onSqftChange, currentSqft = '', inputId = 'pdp-sqft' }) {
  const [mode, setMode] = useState('direct'); // 'direct' | 'dimensions'
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [wasteFactor, setWasteFactor] = useState(10);
  const [showComparison, setShowComparison] = useState(false);

  const rawSqft = useMemo(() => {
    if (mode === 'dimensions') {
      const l = parseFloat(length);
      const w = parseFloat(width);
      if (l > 0 && w > 0) return l * w;
      return 0;
    }
    return parseFloat(currentSqft) || 0;
  }, [mode, length, width, currentSqft]);

  const totalSqft = useMemo(() => {
    if (rawSqft <= 0) return 0;
    return Math.ceil(rawSqft * (1 + wasteFactor / 100));
  }, [rawSqft, wasteFactor]);

  // Push sqft to parent when dimensions change
  const prevTotalRef = React.useRef(0);
  React.useEffect(() => {
    if (mode === 'dimensions' && totalSqft > 0 && totalSqft !== prevTotalRef.current) {
      prevTotalRef.current = totalSqft;
      onSqftChange(String(totalSqft));
    }
  }, [totalSqft, mode, onSqftChange]);

  // Comparison across all variants
  const comparison = useMemo(() => {
    if (!totalSqft || variants.length < 2) return null;
    return variants.map(v => {
      const price = v.sale_price ?? v.price_per_sqft;
      const sqftBox = v.sqft_box || 20;
      const boxes = Math.ceil(totalSqft / sqftBox);
      const actualSqft = boxes * sqftBox;
      const total = actualSqft * price;
      return {
        label: [v.width, v.grade, v.pattern !== 'Standard' ? v.pattern : null].filter(Boolean).join(' · '),
        price,
        sqftBox,
        boxes,
        actualSqft,
        total,
        isSelected: currentVariant && v.sku === currentVariant.sku,
        sku: v.sku,
      };
    }).sort((a, b) => a.total - b.total);
  }, [totalSqft, variants, currentVariant]);

  const cheapest = comparison?.[0]?.total;
  const mostExpensive = comparison?.[comparison.length - 1]?.total;

  return (
    <div className="space-y-3">
      {mode === 'dimensions' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-bold text-slate-900">Measure your room</label>
            <button
              type="button"
              onClick={() => setMode('direct')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline"
            >
              I know my sq ft →
            </button>
          </div>
          {/* L × W inputs */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">Length (ft)</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="e.g. 20"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full px-3 py-3 border-2 border-amber-300 bg-white rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                min="1"
                step="0.5"
              />
            </div>
            <span className="text-slate-400 font-bold text-lg pb-2">×</span>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">Width (ft)</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="e.g. 15"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-3 py-3 border-2 border-amber-300 bg-white rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                min="1"
                step="0.5"
              />
            </div>
          </div>

          {/* Waste factor chips */}
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Waste allowance</label>
            <div className="flex gap-2">
              {WASTE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setWasteFactor(opt.value)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${
                    wasteFactor === opt.value
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                  title={opt.desc}
                >
                  {opt.label}
                  {wasteFactor === opt.value && (
                    <span className="block text-[10px] text-amber-600 mt-0.5">{opt.desc}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          {rawSqft > 0 && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 animate-fade-in-up">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Room area:</span>
                <span className="font-medium text-slate-800">{rawSqft.toFixed(1)} sqft</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-slate-600">+ {wasteFactor}% waste:</span>
                <span className="font-semibold text-amber-700">{totalSqft?.toFixed(1)} sqft total</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor={inputId} className="block text-sm font-bold text-slate-900 mb-1.5">
            How many sq ft do you need?
          </label>
          <div className="relative">
            <input
              id={inputId}
              type="number"
              inputMode="decimal"
              placeholder="e.g. 500"
              value={currentSqft}
              onChange={(e) => onSqftChange(e.target.value)}
              className="w-full h-14 pl-4 pr-16 border-2 border-amber-500 bg-white rounded-xl text-2xl font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-semibold shadow-sm focus:outline-none focus:ring-4 focus:ring-amber-200 focus:border-amber-600 transition-shadow"
              min="1"
              step="1"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-700 uppercase tracking-wide">sq ft</span>
          </div>
          <button
            type="button"
            onClick={() => setMode('dimensions')}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-amber-700 hover:underline"
          >
            <Ruler className="w-3.5 h-3.5" />
            Not sure? Enter room length × width
          </button>
        </div>
      )}

      {/* Variant Comparison Table */}
      {comparison && comparison.length > 1 && (
        <div className="mt-2">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
          >
            <Calculator className="w-3.5 h-3.5" />
            Compare all {comparison.length} options for {totalSqft?.toFixed(1)} sqft
            {showComparison ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showComparison && (
            <div className="mt-2 border border-slate-200 rounded-xl overflow-x-auto animate-fade-in-up">
              <table className="w-full text-xs min-w-[340px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-2 sm:px-3 py-2 text-left font-semibold text-slate-600">Option</th>
                    <th className="px-2 sm:px-3 py-2 text-right font-semibold text-slate-600">$/sqft</th>
                    <th className="px-2 sm:px-3 py-2 text-right font-semibold text-slate-600">Boxes</th>
                    <th className="px-2 sm:px-3 py-2 text-right font-semibold text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparison.map((row, i) => (
                    <tr
                      key={row.sku}
                      className={`${row.isSelected ? 'bg-amber-50' : 'hover:bg-slate-50'} transition-colors`}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {row.isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          )}
                          <span className={`${row.isSelected ? 'font-semibold text-amber-800' : 'text-slate-700'}`}>
                            {row.label}
                          </span>
                          {i === 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-semibold">
                              Best value
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-800">
                        C${row.price.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-600">
                        {row.boxes}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`font-bold ${row.isSelected ? 'text-amber-700' : 'text-slate-800'}`}>
                          C${row.total.toFixed(2)}
                        </span>
                        {i > 0 && cheapest && (
                          <span className="block text-[10px] text-slate-400">
                            +C${(row.total - cheapest).toFixed(2)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
