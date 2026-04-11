'use client';

import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingCart } from 'lucide-react';

export default function StickyAddToCart({
  visible,
  price,          // price per sqft
  sqftPerBox,     // for box calculation
  sqftNeeded,     // shared state string from parent
  setSqftNeeded,  // shared setter from parent
  calculation,    // computed calculation object from parent
  variantLabel,
  isOutOfStock,
  isAddingToCart,
  onAddToCart,
}) {
  const inputRef = useRef(null);
  if (!visible || isOutOfStock) return null;

  const hasCalc = calculation && parseFloat(sqftNeeded) > 0;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-amber-200 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
      {/* Variant label strip */}
      {variantLabel && (
        <div className="px-4 pt-2 pb-0">
          <span className="text-xs text-slate-500 truncate">{variantLabel}</span>
        </div>
      )}

      <div className="px-4 py-3 safe-bottom flex items-center gap-3">
        {/* Price badge */}
        <div className="flex-shrink-0 text-center min-w-[52px]">
          {price ? (
            <>
              <div className="text-base font-bold text-slate-900 leading-none">C${price.toFixed(2)}</div>
              <div className="text-[10px] text-slate-500">/sqft</div>
            </>
          ) : (
            <div className="text-xs text-slate-400">Select variant</div>
          )}
        </div>

        <div className="w-px h-8 bg-slate-200 flex-shrink-0" />

        {/* Inline calculator — input always visible so user can finish typing */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                placeholder="Sqft needed"
                value={sqftNeeded}
                onChange={(e) => setSqftNeeded(e.target.value)}
                autoFocus={false}
                onClick={() => inputRef.current?.focus()}
                className="w-full h-11 px-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
                min="1"
              />
            </div>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white h-11 px-5 text-sm font-bold flex-shrink-0 min-w-[72px]"
              onClick={onAddToCart}
              disabled={isAddingToCart || !price || !sqftNeeded}
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              {isAddingToCart ? '…' : 'Add'}
            </Button>
          </div>
          {/* Live calculation summary — appears below input as user types */}
          {hasCalc && (
            <div className="flex items-baseline gap-1.5 flex-wrap px-0.5">
              <span className="text-xs text-slate-500">{calculation.boxesRequired} boxes</span>
              <span className="text-slate-300 text-xs">·</span>
              <span className="text-xs font-bold text-slate-800">C${calculation.lineTotal.toFixed(2)}</span>
              {calculation.extraSqft > 0 && (
                <>
                  <span className="text-slate-300 text-xs">·</span>
                  <span className="text-[10px] text-slate-400">+{calculation.extraSqft.toFixed(1)} sqft extra</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
