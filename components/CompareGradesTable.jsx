'use client';

import React, { useMemo } from 'react';
import { Check, X, Star } from 'lucide-react';

const GRADE_DATA = {
  'Character (ABCD)': {
    shortName: 'Character',
    appearance: 'Knots, mineral streaks, colour variation',
    bestFor: 'Living rooms, rustic/modern styles',
    look: 'Natural & varied',
    uniformity: 1,
    value: 3,
    character: 3,
    features: ['Most natural look', 'Widest colour range', 'Best price point', 'Hides wear well'],
  },
  'Select (ABC)': {
    shortName: 'Select',
    appearance: 'Some character, fewer knots, more consistent',
    bestFor: 'Dining rooms, bedrooms, transitional styles',
    look: 'Balanced',
    uniformity: 2,
    value: 2,
    character: 2,
    features: ['Balanced look', 'Moderate knots', 'Versatile style match', 'Mid-range price'],
  },
  'Select & Better (AB)': {
    shortName: 'Select & Better',
    appearance: 'Minimal knots, consistent grain and colour',
    bestFor: 'Formal spaces, modern/minimalist design',
    look: 'Clean & refined',
    uniformity: 3,
    value: 1,
    character: 1,
    features: ['Most refined look', 'Consistent colour', 'Premium finish', 'Designer favourite'],
  },
};

function DotRating({ value, max = 3, color = 'amber' }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < value ? `bg-${color}-400` : 'bg-slate-200'
          }`}
          style={i < value ? { backgroundColor: color === 'amber' ? '#fbbf24' : color === 'emerald' ? '#34d399' : '#94a3b8' } : {}}
        />
      ))}
    </div>
  );
}

export default function CompareGradesTable({ grades, variants, selectedGrade, onSelect }) {
  const gradeInfo = useMemo(() => {
    return grades
      .map(g => {
        const data = GRADE_DATA[g];
        if (!data) return null;
        // Find price range for this grade across current variants
        const gradeVariants = variants.filter(v => v.grade === g);
        const prices = gradeVariants.map(v => v.sale_price ?? v.price_per_sqft).filter(Boolean);
        const minPrice = prices.length ? Math.min(...prices) : null;
        const maxPrice = prices.length ? Math.max(...prices) : null;
        return { grade: g, ...data, minPrice, maxPrice, variantCount: gradeVariants.length };
      })
      .filter(Boolean);
  }, [grades, variants]);

  if (gradeInfo.length < 2) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compare Grades</label>
        <span className="text-[10px] text-slate-400">Tap to select</span>
      </div>

      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gradeInfo.length}, 1fr)` }}>
        {gradeInfo.map(info => {
          const isSelected = selectedGrade === info.grade;
          return (
            <button
              key={info.grade}
              onClick={() => onSelect(info.grade)}
              className={`text-left p-3 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-amber-400 bg-amber-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-bold ${isSelected ? 'text-amber-800' : 'text-slate-800'}`}>
                  {info.shortName}
                </span>
                {isSelected && (
                  <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
              </div>

              {/* Look descriptor */}
              <p className="text-xs text-slate-500 mb-3">{info.appearance}</p>

              {/* Ratings */}
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Character</span>
                  <DotRating value={info.character} color="amber" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Uniformity</span>
                  <DotRating value={info.uniformity} color="amber" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Value</span>
                  <DotRating value={info.value} color="emerald" />
                </div>
              </div>

              {/* Price */}
              {info.minPrice && (
                <div className={`text-sm font-bold mt-auto ${isSelected ? 'text-amber-700' : 'text-slate-800'}`}>
                  {info.minPrice === info.maxPrice
                    ? `C$${info.minPrice.toFixed(2)}/sqft`
                    : `C$${info.minPrice.toFixed(2)}–${info.maxPrice.toFixed(2)}/sqft`
                  }
                </div>
              )}

              {/* Best for */}
              <p className="text-[10px] text-slate-400 mt-2">Best for: {info.bestFor}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
