'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import { Calculator, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

/**
 * Shows a "Get a quote for this product" CTA on product detail pages.
 * If the user has a saved project from the Quote Calculator (in localStorage),
 * it shows their project context (sqft, last estimate) for a seamless re-quote.
 *
 * Place in components/ folder. Import as:
 * import QuoteProductCTA from '../components/QuoteProductCTA';
 */
export default function QuoteProductCTA({ productId, productName }) {
  const [savedProject, setSavedProject] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bbs_quote_project');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only use if less than 7 days old
        if (parsed.timestamp && Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
          setSavedProject(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Build quote calculator URL with product + saved project details
  const buildQuoteUrl = () => {
    const params = new URLSearchParams({ product_id: productId });
    if (savedProject) {
      if (savedProject.sqft) params.set('sqft', savedProject.sqft);
      if (savedProject.removal_type) params.set('removal_type', savedProject.removal_type);
      if (savedProject.needs_baseboards) params.set('needs_baseboards', 'true');
      if (savedProject.needs_shoe_moulding) params.set('needs_shoe_moulding', 'true');
    }
    return `${createPageUrl('QuoteCalculator')}?${params.toString()}`;
  };

  // Has an active project with a previous estimate
  if (savedProject?.last_total && savedProject?.sqft) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Calculator className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">
              Your project: {savedProject.sqft} sq ft
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Last estimate: C${parseFloat(savedProject.last_total).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
              {savedProject.last_product && savedProject.last_product !== productName && (
                <span> (for {savedProject.last_product})</span>
              )}
            </p>
          </div>
        </div>
        <Link href={buildQuoteUrl()}>
          <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold" size="sm">
            Quote This Product Instead
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  // No saved project — simple CTA
  return (
    <Link href={buildQuoteUrl()}>
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 hover:border-amber-300 transition-colors cursor-pointer group">
        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Calculator className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">Get a full installation quote</p>
          <p className="text-xs text-slate-500">Materials + labour + delivery — instant estimate</p>
        </div>
        <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
      </div>
    </Link>
  );
}
