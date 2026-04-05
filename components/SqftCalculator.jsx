'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Calculator, Ruler, Info, ChevronDown, ChevronUp } from 'lucide-react';

const WASTE_OPTIONS = [
  { value: 5, label: '5%', desc: 'Simple rectangular room' },
  { value: 10, label: '10%', desc: 'Standard — recommended' },
  { value: 15, label: '15%', desc: 'Complex layout / diagonal install' },
];

const BULK_SQFT_THRESHOLD = 1000;

export default function SqftCalculator({ variants = [], currentVariant = null, onSqftChange, currentSqft = '', productName = '', productSku = '' }) {
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
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('dimensions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'dimensions'
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-slate-100 text-slate-500 border border-transparent hover:bg-slate-200'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          Room Dimensions
        </button>
        <button
          onClick={() => setMode('direct')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'direct'
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-slate-100 text-slate-500 border border-transparent hover:bg-slate-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          Enter Sqft
        </button>
      </div>

      {mode === 'dimensions' ? (
        <div className="space-y-3">
          {/* L × W inputs */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">Length (ft)</label>
              <input
                type="number"
                placeholder="e.g. 20"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                min="1"
                step="0.5"
              />
            </div>
            <span className="text-slate-400 font-bold text-lg pb-2">×</span>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">Width (ft)</label>
              <input
                type="number"
                placeholder="e.g. 15"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
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
                <span className="font-semibold text-amber-700">{totalSqft} sqft total</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            type="number"
            placeholder="Enter square footage (e.g., 500)"
            value={currentSqft}
            onChange={(e) => onSqftChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            min="1"
            step="1"
          />
        </div>
      )}

      {/* Bulk Pricing CTA */}
      {(() => {
        const effectiveSqft = mode === 'dimensions' ? totalSqft : (parseFloat(currentSqft) || 0);
        if (effectiveSqft < BULK_SQFT_THRESHOLD) return null;
        const waMsg = `Hi! I'm looking for bulk pricing on ${productName}${productSku ? ` (SKU: ${productSku})` : ''} — I need ${Math.round(effectiveSqft)} sqft. What's the best price you can do?`;
        return (
          <a
            href={`https://wa.me/16474281111?text=${encodeURIComponent(waMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors group"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.106 1.519 5.834L.052 23.579a.5.5 0 00.612.612l5.746-1.467A11.948 11.948 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.903 0-3.72-.504-5.32-1.459l-.382-.227-3.951 1.009 1.009-3.951-.227-.382A9.786 9.786 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818S21.818 6.582 21.818 12s-4.4 9.818-9.818 9.818z"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-emerald-800 block">Ordering {Math.round(effectiveSqft).toLocaleString()}+ sqft?</span>
              <span className="text-xs text-emerald-600">Message us for bulk pricing</span>
            </div>
            <svg className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </a>
        );
      })()}

      {/* Variant Comparison Table */}
      {comparison && comparison.length > 1 && (
        <div className="mt-2">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
          >
            <Calculator className="w-3.5 h-3.5" />
            Compare all {comparison.length} options for {totalSqft} sqft
            {showComparison ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showComparison && (
            <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden animate-fade-in-up">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Option</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-600">$/sqft</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-600">Boxes</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-600">Total</th>
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
