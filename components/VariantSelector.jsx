'use client';

import React, { useState, useEffect, useMemo } from 'react';

function displayPattern(pattern) {
  return pattern === 'Standard' ? 'Standard Plank' : pattern;
}

export default function VariantSelector({ product, onVariantChange }) {
  const variants = useMemo(() => {
    try { return JSON.parse(product.variants_json || '[]'); }
    catch { return []; }
  }, [product.variants_json]);

  // All unique patterns (include Standard)
  const patternOptions = useMemo(() =>
    [...new Set(variants.map(v => v.pattern).filter(Boolean))],
    [variants]
  );

  // Default to pattern with most variants
  const defaultPattern = useMemo(() => {
    if (!patternOptions.length) return '';
    const counts = {};
    variants.forEach(v => { if (v.pattern) counts[v.pattern] = (counts[v.pattern] || 0) + 1; });
    return patternOptions.reduce((a, b) => (counts[a] >= counts[b] ? a : b));
  }, [patternOptions, variants]);

  const [selectedPattern, setSelectedPattern] = useState('');
  const [selectedWidth, setSelectedWidth] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  // Init pattern once
  useEffect(() => {
    if (defaultPattern && !selectedPattern) {
      setSelectedPattern(defaultPattern);
    }
  }, [defaultPattern]);

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

  // Reset width/grade when pattern changes
  useEffect(() => {
    setSelectedWidth(widthOptions[0] || '');
  }, [selectedPattern]);

  useEffect(() => {
    setSelectedGrade(gradeOptions[0] || '');
  }, [selectedWidth, selectedPattern]);

  const selectedVariant = useMemo(() => {
    return variants.find(v =>
      (!selectedPattern || v.pattern === selectedPattern) &&
      (!selectedWidth || v.width === selectedWidth) &&
      (!selectedGrade || v.grade === selectedGrade)
    ) || variants[0];
  }, [variants, selectedPattern, selectedWidth, selectedGrade]);

  useEffect(() => {
    if (selectedVariant) onVariantChange(selectedVariant);
  }, [selectedVariant]);

  if (variants.length === 0) return null;

  // Show the lowest available price (member_price is the low price in variants_json)
  const displayPrice = selectedVariant?.member_price ?? selectedVariant?.public_price ?? selectedVariant?.price_per_sqft;

  const originalPrice = selectedVariant?.price_per_sqft;
  const showStrikethrough = selectedVariant?.on_sale && originalPrice && originalPrice > displayPrice;

  const ChipGroup = ({ label, options, selected, onSelect, displayFn }) => (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
              selected === opt
                ? 'border-amber-500 bg-amber-50 text-amber-800'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            {displayFn ? displayFn(opt) : opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 mt-2">
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
          <div className="mt-2 text-sm text-slate-600 space-x-3">
            <span><span className="font-medium">SKU:</span> {selectedVariant.sku}</span>
            {selectedVariant.dimensions && <span>· <span className="font-medium">Dimensions:</span> {selectedVariant.dimensions}</span>}
            {selectedVariant.sqft_box && <span>· <span className="font-medium">Coverage:</span> {selectedVariant.sqft_box} sqft/box</span>}
          </div>
          {!selectedVariant.in_stock && (
            <div className="mt-2 text-sm font-medium text-red-600">
              ⚠ Special Order — Contact us for availability
            </div>
          )}
        </div>
      )}
    </div>
  );
}
