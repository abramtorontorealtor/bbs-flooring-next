'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Analytics } from '@/components/analytics';

const FLOORING_TYPES = [
  { label: 'Solid Hardwood', materialLow: 5.00, materialHigh: 12.00, installLow: 2.25, installHigh: 2.25 },
  { label: 'Engineered Hardwood', materialLow: 3.00, materialHigh: 7.25, installLow: 2.25, installHigh: 4.25 },
  { label: 'Luxury Vinyl (SPC)', materialLow: 1.79, materialHigh: 5.00, installLow: 2.00, installHigh: 2.25 },
  { label: 'Laminate', materialLow: 1.79, materialHigh: 5.00, installLow: 2.00, installHigh: 2.25 },
];

const HST_RATE = 0.13;

export default function InstallCostCalculator() {
  const [sqft, setSqft] = useState('');
  const [selectedType, setSelectedType] = useState(0);
  const [includeRemoval, setIncludeRemoval] = useState(false);

  const estimate = useMemo(() => {
    const area = parseFloat(sqft);
    if (!area || area <= 0) return null;
    const type = FLOORING_TYPES[selectedType];
    const totalLow = (type.materialLow + type.installLow) * area;
    const totalHigh = (type.materialHigh + type.installHigh) * area;
    const removalCost = includeRemoval ? area * 1.00 : 0; // $1/sqft carpet removal
    return {
      low: totalLow + removalCost,
      high: totalHigh + removalCost,
      lowWithTax: (totalLow + removalCost) * (1 + HST_RATE),
      highWithTax: (totalHigh + removalCost) * (1 + HST_RATE),
      removalCost,
      sqft: area,
      type: type.label,
    };
  }, [sqft, selectedType, includeRemoval]);

  return (
    <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-lg p-6 md:p-8 my-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
          <Calculator className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Quick Cost Estimator</h3>
          <p className="text-sm text-slate-500">Get a ballpark for your project in seconds</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Flooring Type</label>
            <div className="grid grid-cols-2 gap-2">
              {FLOORING_TYPES.map((type, i) => (
                <button
                  key={type.label}
                  onClick={() => setSelectedType(i)}
                  className={`text-left px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedType === i
                      ? 'border-amber-500 bg-amber-50 text-amber-800'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Room Size (square feet)</label>
            <Input
              type="number"
              placeholder="e.g. 500"
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
              className="text-lg"
              min="1"
              max="50000"
              onFocus={() => Analytics.trackEvent('install_calc_focus', 'engagement', 'installation_cost')}
            />
            <p className="text-xs text-slate-400 mt-1">Not sure? Multiply room length × width in feet. We'll measure for free!</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeRemoval}
              onChange={(e) => setIncludeRemoval(e.target.checked)}
              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm text-slate-700">Include old floor removal (+$1.00/sqft)</span>
          </label>
        </div>

        {/* Result */}
        <div>
          {estimate ? (
            <div className="bg-slate-50 rounded-xl p-5 space-y-4 animate-fade-in-up">
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-1">Estimated total for {estimate.sqft.toLocaleString()} sqft of {estimate.type}</p>
                <p className="text-3xl font-bold text-slate-800">
                  C${Math.round(estimate.low).toLocaleString()} – C${Math.round(estimate.high).toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  C${Math.round(estimate.lowWithTax).toLocaleString()} – C${Math.round(estimate.highWithTax).toLocaleString()} incl. HST
                </p>
              </div>

              {estimate.removalCost > 0 && (
                <p className="text-xs text-slate-500 text-center">Includes C${Math.round(estimate.removalCost).toLocaleString()} for floor removal</p>
              )}

              <div className="border-t border-slate-200 pt-4 space-y-2">
                <Link href="/quote-calculator" onClick={() => Analytics.trackEvent('install_calc_get_quote', 'conversion', estimate.type)}>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600">
                    Get Exact Quote <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/free-measurement">
                  <Button variant="outline" className="w-full">
                    📏 Book Free Measurement
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-slate-400 text-center">
                * Estimate only. Final price depends on subfloor condition, room layout, and product selection. We&apos;ll give you an exact number with a free in-home visit.
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
              <Calculator className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">Enter your room size to see an instant estimate</p>
              <p className="text-slate-400 text-xs mt-1">Material + professional installation included</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
