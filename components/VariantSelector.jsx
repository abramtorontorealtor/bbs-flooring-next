'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

function displayPattern(pattern) {
  return pattern === 'Standard' ? 'Standard Plank' : pattern;
}

const GRADE_DESCRIPTIONS = {
  'Character (ABCD)': 'Most natural look — knots, colour variation, mineral streaks. Best value.',
  'Select (ABC)': 'Balanced — some character with a cleaner, more uniform appearance.',
  'Select & Better (AB)': 'Premium — minimal knots, consistent colour and grain. Most refined look.',
};

export default function VariantSelector({ product, onVariantChange }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const variants = useMemo(() => {
    try { return JSON.parse(product.variants_json || '[]'); }
    catch { return []; }
  }, [product.variants_json]);

  // All unique patterns
  const patternOptions = useMemo(() =>
    [...new Set(variants.map(v => v.pattern).filter(Boolean))],
    [variants]
  );

  // Default to pattern with most variants (or URL param)
  const defaultPattern = useMemo(() => {
    const urlPattern = searchParams.get('pattern');
    if (urlPattern && patternOptions.includes(urlPattern)) return urlPattern;
    if (!patternOptions.length) return '';
    const counts = {};
    variants.forEach(v => { if (v.pattern) counts[v.pattern] = (counts[v.pattern] || 0) + 1; });
    return patternOptions.reduce((a, b) => (counts[a] >= counts[b] ? a : b));
  }, [patternOptions, variants, searchParams]);

  const [selectedPattern, setSelectedPattern] = useState('');
  const [selectedWidth, setSelectedWidth] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [showGradeTooltip, setShowGradeTooltip] = useState(null);

  // Init from URL params or defaults
  useEffect(() => {
    if (defaultPattern && !selectedPattern) {
      setSelectedPattern(defaultPattern);
    }
  }, [defaultPattern]); // eslint-disable-line react-hooks/exhaustive-deps

  // Width options for currently selected pattern
  const widthOptions = useMemo(() => {
    const filtered = selectedPattern
      ? variants.filter(v => v.pattern === selectedPattern)
      : variants;
    return [...new Set(filtered.map(v => v.width).filter(Boolean))];
  }, [variants, selectedPattern]);

  // Grade options for selected pattern + width
  const gradeOptions = useMemo(() => {
    let filtered = variants;
    if (selectedPattern) filtered = filtered.filter(v => v.pattern === selectedPattern);
    if (selectedWidth) filtered = filtered.filter(v => v.width === selectedWidth);
    return [...new Set(filtered.map(v => v.grade).filter(Boolean))];
  }, [variants, selectedPattern, selectedWidth]);

  // Reset width/grade when pattern changes (but respect URL params on first load)
  useEffect(() => {
    const urlWidth = searchParams.get('width');
    if (urlWidth && widthOptions.includes(urlWidth)) {
      setSelectedWidth(urlWidth);
    } else {
      setSelectedWidth(widthOptions[0] || '');
    }
  }, [selectedPattern]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const urlGrade = searchParams.get('grade');
    if (urlGrade && gradeOptions.includes(urlGrade)) {
      setSelectedGrade(urlGrade);
    } else {
      setSelectedGrade(gradeOptions[0] || '');
    }
  }, [selectedWidth, selectedPattern]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync selections to URL
  const updateUrl = useCallback((pattern, width, grade) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pattern && patternOptions.length > 1) params.set('pattern', pattern);
    else params.delete('pattern');
    if (width && widthOptions.length > 1) params.set('width', width);
    else params.delete('width');
    if (grade && gradeOptions.length > 1) params.set('grade', grade);
    else params.delete('grade');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, pathname, router, patternOptions.length, widthOptions.length, gradeOptions.length]);

  useEffect(() => {
    if (selectedPattern || selectedWidth || selectedGrade) {
      updateUrl(selectedPattern, selectedWidth, selectedGrade);
    }
  }, [selectedPattern, selectedWidth, selectedGrade]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedVariant = useMemo(() => {
    return variants.find(v =>
      (!selectedPattern || v.pattern === selectedPattern) &&
      (!selectedWidth || v.width === selectedWidth) &&
      (!selectedGrade || v.grade === selectedGrade)
    ) || variants[0];
  }, [variants, selectedPattern, selectedWidth, selectedGrade]);

  useEffect(() => {
    if (selectedVariant) onVariantChange(selectedVariant);
  }, [selectedVariant]); // eslint-disable-line react-hooks/exhaustive-deps

  if (variants.length === 0) return null;

  // New pricing model: price_per_sqft is THE price. sale_price is the deal price if it exists.
  const displayPrice = selectedVariant?.sale_price ?? selectedVariant?.price_per_sqft;
  const originalPrice = selectedVariant?.price_per_sqft;
  const showStrikethrough = selectedVariant?.on_sale && originalPrice && originalPrice > displayPrice;

  // Price range across all variants for context
  const allPrices = variants.map(v => v.sale_price ?? v.price_per_sqft).filter(Boolean);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const showRange = maxPrice - minPrice > 0.5;

  const ChipGroup = ({ label, options, selected, onSelect, displayFn, descriptions }) => (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map(opt => (
          <div key={opt} className="relative">
            <button
              onClick={() => onSelect(opt)}
              onMouseEnter={() => descriptions?.[opt] && setShowGradeTooltip(opt)}
              onMouseLeave={() => setShowGradeTooltip(null)}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                selected === opt
                  ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {displayFn ? displayFn(opt) : opt}
            </button>
            {/* Grade tooltip */}
            {descriptions?.[opt] && showGradeTooltip === opt && (
              <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-lg pointer-events-none">
                <div className="font-semibold mb-1">{opt}</div>
                <div className="text-slate-300">{descriptions[opt]}</div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-800 rotate-45" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 mt-2">
      {/* Price range context */}
      {showRange && (
        <p className="text-xs text-slate-500">
          Prices range from <span className="font-semibold text-slate-700">C${minPrice.toFixed(2)}</span> to <span className="font-semibold text-slate-700">C${maxPrice.toFixed(2)}</span>/sqft depending on configuration
        </p>
      )}

      {patternOptions.length > 1 && (
        <ChipGroup
          label="Pattern"
          options={patternOptions}
          selected={selectedPattern}
          onSelect={setSelectedPattern}
          displayFn={displayPattern}
        />
      )}
      {widthOptions.length > 1 && (
        <ChipGroup
          label="Width"
          options={widthOptions}
          selected={selectedWidth}
          onSelect={setSelectedWidth}
        />
      )}
      {gradeOptions.length > 1 && (
        <ChipGroup
          label="Grade"
          options={gradeOptions}
          selected={selectedGrade}
          onSelect={setSelectedGrade}
          descriptions={GRADE_DESCRIPTIONS}
        />
      )}

      {selectedVariant && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              C${displayPrice?.toFixed(2)}
            </span>
            <span className="text-sm text-slate-500">/sqft</span>
            {showStrikethrough && (
              <span className="text-base text-slate-400 line-through">C${originalPrice?.toFixed(2)}</span>
            )}
          </div>
          <div className="mt-2 text-sm text-slate-600 space-y-1">
            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
              <span><span className="font-medium text-slate-700">SKU:</span> {selectedVariant.sku}</span>
              {selectedVariant.dimensions && (
                <span><span className="font-medium text-slate-700">Dimensions:</span> {selectedVariant.dimensions}</span>
              )}
              {selectedVariant.sqft_box && (
                <span><span className="font-medium text-slate-700">Coverage:</span> {selectedVariant.sqft_box} sqft/box</span>
              )}
            </div>
            {selectedVariant.sqft_box && displayPrice && (
              <div className="text-xs text-slate-500 mt-1">
                C${(displayPrice * selectedVariant.sqft_box).toFixed(2)}/box
              </div>
            )}
          </div>
          {!selectedVariant.in_stock && (
            <div className="mt-2 text-sm font-medium text-red-600">
              ⚠ Special Order — Contact us for availability
            </div>
          )}
        </div>
      )}

      {/* Variant count */}
      <p className="text-xs text-slate-400">
        {variants.length} configuration{variants.length !== 1 ? 's' : ''} available
      </p>
    </div>
  );
}
