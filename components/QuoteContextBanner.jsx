'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createPageUrl } from '@/lib/routes';
import { Calculator, X, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

/**
 * Sticky banner that appears when a user arrives from the Quote Calculator.
 * Reads ?from=calculator&total=X&sqft=Y&product=Z from the URL.
 * Drop this into any category page — it auto-hides if params aren't present.
 */
export default function QuoteContextBanner() {
  const [dismissed, setDismissed] = useState(false);
  const searchParams = useSearchParams();
  const params = searchParams;

  const fromCalculator = params.get('from') === 'calculator';
  const total = params.get('total');
  const sqft = params.get('sqft');
  const productName = params.get('product');

  if (!fromCalculator || !total || dismissed) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 relative">
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-3 flex-1 min-w-0 pr-6">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Calculator className="w-5 h-5 text-amber-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">
            Your estimate: <span className="text-amber-600">C${parseFloat(total).toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span>
            {sqft && <span className="text-slate-500 font-normal"> for {sqft} sq ft</span>}
          </p>
          {productName && (
            <p className="text-xs text-slate-500 truncate">Based on: {productName}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <Link href={createPageUrl('QuoteCalculator')}>
          <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs">
            ✏️ Edit Quote
          </Button>
        </Link>
        <Link href={createPageUrl('FreeMeasurement')}>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
            Book Free Quote <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
