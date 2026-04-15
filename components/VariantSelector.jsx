'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Check, ChevronDown } from 'lucide-react';
import WidthComparisonBars from '@/components/WidthComparisonBars';
import CompareGradesTable from '@/components/CompareGradesTable';

function displayPattern(pattern) {
  return pattern === 'Standard' ? 'Standard Plank' : pattern;
}

const GRADE_DESCRIPTIONS = {
  'Character (ABCD)': 'Most natural look — knots, colour variation, mineral streaks. Best value.',
  'Select (ABC)': 'Balanced — some character with a cleaner, more uniform appearance.',
  'Select & Better (AB)': 'Premium — minimal knots, consistent colour and grain. Most refined look.',
};

export default function VariantSelector({ product, onVariantChange, hidePrice = false, onSelectionSummary = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const variants = useMemo(() => {
    try {
      if (Array.isArray(product.variants_json)) return product.variants_json;
      return JSON.parse(product.variants_json || '[]');
    }
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
  // Mobile stepper: which step is expanded (0=pattern, 1=width, 2=grade)
  const [mobileStep, setMobileStep] = useState(0);

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

  // Report selection summary to parent for sticky bar
  useEffect(() => {
    if (onSelectionSummary) {
      const parts = [];
      if (selectedPattern && patternOptions.length > 1) parts.push(displayPattern(selectedPattern));
      if (selectedWidth) parts.push(selectedWidth);
      if (selectedGrade) parts.push(selectedGrade);
      onSelectionSummary(parts.length > 0 ? parts.join(' · ') : '');
    }
  }, [selectedPattern, selectedWidth, selectedGrade]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pricing display values (derived, not hooks)
  const displayPrice = selectedVariant?.sale_price ?? selectedVariant?.price_per_sqft;
  const originalPrice = selectedVariant?.price_per_sqft;
  const showStrikethrough = selectedVariant?.on_sale && originalPrice && originalPrice > displayPrice;

  // Price range across all variants for context
  const allPrices = variants.map(v => v.sale_price ?? v.price_per_sqft).filter(Boolean);
  const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 0;
  const showRange = maxPrice - minPrice > 0.5;

  // Build the ordered steps for mobile stepper
  const steps = useMemo(() => {
    const s = [];
    if (patternOptions.length > 1) s.push({ key: 'pattern', label: 'Pattern', value: selectedPattern ? displayPattern(selectedPattern) : null });
    if (widthOptions.length > 1) s.push({ key: 'width', label: 'Width', value: selectedWidth || null });
    if (gradeOptions.length > 1) s.push({ key: 'grade', label: 'Grade', value: selectedGrade || null });
    return s;
  }, [patternOptions, widthOptions, gradeOptions, selectedPattern, selectedWidth, selectedGrade]);

  // Auto-advance mobile stepper when a selection is made
  const handleMobileSelect = useCallback((stepKey, value, setter) => {
    setter(value);
    const currentIdx = steps.findIndex(s => s.key === stepKey);
    if (currentIdx < steps.length - 1) {
      setTimeout(() => setMobileStep(currentIdx + 1), 250);
    }
  }, [steps]);

  if (variants.length === 0) return null;

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

  // ── MOBILE STEPPER RENDERING ──
  const renderMobileStepper = () => {
    if (steps.length === 0) return null;

    return (
      <div className="space-y-2">
        {steps.map((step, idx) => {
          const isActive = mobileStep === idx;
          const isCompleted = !!step.value;

          return (
            <div key={step.key} className={`rounded-xl border-2 transition-all overflow-hidden ${
              isActive ? 'border-amber-300 bg-amber-50/50' : isCompleted ? 'border-slate-200 bg-slate-50' : 'border-slate-100 bg-white'
            }`}>
              {/* Step header — always visible, tappable */}
              <button
                onClick={() => setMobileStep(isActive ? -1 : idx)}
                className="w-full flex items-center justify-between px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  {isCompleted && !isActive ? (
                    <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  ) : (
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      isActive ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>{idx + 1}</span>
                  )}
                  <span className={`text-sm font-semibold ${
                    isActive ? 'text-amber-800' : 'text-slate-700'
                  }`}>{step.label}</span>
                  {isCompleted && !isActive && (
                    <span className="text-sm text-slate-600 font-medium ml-1">— {step.value}</span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${
                  isActive ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Step content — only when active */}
              {isActive && (
                <div className="px-3 pb-3">
                  {step.key === 'pattern' && (
                    <div className="flex flex-wrap gap-2">
                      {patternOptions.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleMobileSelect('pattern', opt, setSelectedPattern)}
                          className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                            selectedPattern === opt
                              ? 'border-amber-500 bg-amber-50 text-amber-800'
                              : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >{displayPattern(opt)}</button>
                      ))}
                    </div>
                  )}
                  {step.key === 'width' && (
                    <div className="flex flex-wrap gap-2">
                      {widthOptions.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleMobileSelect('width', opt, setSelectedWidth)}
                          className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                            selectedWidth === opt
                              ? 'border-amber-500 bg-amber-50 text-amber-800'
                              : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >{opt}</button>
                      ))}
                    </div>
                  )}
                  {step.key === 'grade' && (
                    <div className="space-y-1.5">
                      {gradeOptions.map(g => {
                        const data = GRADE_DESCRIPTIONS[g];
                        return (
                          <button
                            key={g}
                            onClick={() => handleMobileSelect('grade', g, setSelectedGrade)}
                            className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-all ${
                              selectedGrade === g
                                ? 'border-amber-500 bg-amber-50'
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <span className={`text-sm font-semibold ${
                              selectedGrade === g ? 'text-amber-800' : 'text-slate-700'
                            }`}>{g}</span>
                            {data && <p className="text-xs text-slate-500 mt-0.5">{data}</p>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ── DESKTOP RENDERING (unchanged) ──
  const renderDesktop = () => (
    <div className="space-y-5">
      {/* Price range context */}
      {!hidePrice && showRange && (
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
        widthOptions.length >= 3 ? (
          <WidthComparisonBars
            widths={widthOptions}
            selectedWidth={selectedWidth}
            onSelect={setSelectedWidth}
          />
        ) : (
          <ChipGroup
            label="Width"
            options={widthOptions}
            selected={selectedWidth}
            onSelect={setSelectedWidth}
          />
        )
      )}
      {gradeOptions.length > 1 && (
        gradeOptions.length >= 2 ? (
          <CompareGradesTable
            grades={gradeOptions}
            variants={variants}
            selectedGrade={selectedGrade}
            onSelect={setSelectedGrade}
            hidePrice={hidePrice}
          />
        ) : (
          <ChipGroup
            label="Grade"
            options={gradeOptions}
            selected={selectedGrade}
            onSelect={setSelectedGrade}
            descriptions={GRADE_DESCRIPTIONS}
          />
        )
      )}
    </div>
  );

  return (
    <div className="mt-2">
      {/* Mobile: compact stepper (hidden on lg+) */}
      <div className="lg:hidden">
        {renderMobileStepper()}
      </div>
      {/* Desktop: full rich UI (hidden below lg) */}
      <div className="hidden lg:block">
        {renderDesktop()}
      </div>

      {/* Selected variant summary — shared between mobile and desktop */}
      {selectedVariant && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4">
          {!hidePrice && (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                C${displayPrice?.toFixed(2)}
              </span>
              <span className="text-sm text-slate-500">/sqft</span>
              {showStrikethrough && (
                <span className="text-base text-slate-400 line-through">C${originalPrice?.toFixed(2)}</span>
              )}
            </div>
          )}
          <div className={`${!hidePrice ? 'mt-2 ' : ''}text-sm text-slate-600 space-y-1`}>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
              <span><span className="font-medium text-slate-700">SKU:</span> {selectedVariant.sku}</span>
              {selectedVariant.dimensions && (
                <span><span className="font-medium text-slate-700">Dimensions:</span> {selectedVariant.dimensions}</span>
              )}
              {selectedVariant.sqft_box && (
                <span><span className="font-medium text-slate-700">Coverage:</span> {selectedVariant.sqft_box} sqft/box</span>
              )}
            </div>
            {!hidePrice && selectedVariant.sqft_box && displayPrice && (
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

      {/* Variant count + grade guide CTA */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-slate-400">
          {variants.length} configuration{variants.length !== 1 ? 's' : ''} available
        </p>
        {gradeOptions.length > 1 && (
          <Link href="/grade-guide" className="text-xs text-amber-700 hover:text-amber-800 font-medium transition-colors underline underline-offset-2">
            Not sure which grade? →
          </Link>
        )}
      </div>
    </div>
  );
}
