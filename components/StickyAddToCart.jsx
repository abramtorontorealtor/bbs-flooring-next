'use client';

import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingCart, Phone, MessageSquare } from 'lucide-react';
import { callUrl, smsUrl, whatsappUrl, PHONE_DISPLAY } from '@/lib/contact';

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
  hidePrice = false,
  productName = '',         // pre-populates SMS/WhatsApp message
  selectionSummary = '',    // e.g. "Standard Plank · 7 1/2\" · Character (ABCD)"
  onScrollToQuote = null,   // callback to smooth-scroll to Request Quote box
}) {
  const inputRef = useRef(null);
  if (!visible || isOutOfStock) return null;

  // Hidden-price mode: 3-channel CTA bar (Call / Text / WhatsApp) + optional quote scroll
  if (hidePrice) {
    // Build a label for the message — prefer the full product name with selected variant
    const msgLabel = selectionSummary
      ? `${productName}${selectionSummary ? ` — ${selectionSummary}` : ''}`
      : productName;

    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-amber-200 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
        <div className="px-3 py-2.5 safe-bottom">
          {/* Selected variant summary strip */}
          {selectionSummary && (
            <p className="text-[11px] text-slate-500 text-center truncate mb-1.5 leading-tight">{selectionSummary}</p>
          )}

          {/* Primary row: Request Quote (if available) + channel buttons */}
          <div className="flex gap-2 items-stretch">
            {/* Request a Quote — primary amber CTA (only when quote box exists) */}
            {onScrollToQuote && (
              <button
                onClick={onScrollToQuote}
                className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md"
              >
                Request a Quote ↓
              </button>
            )}

            {/* 📞 Call */}
            <a
              href={callUrl()}
              aria-label={`Call BBS Flooring at ${PHONE_DISPLAY}`}
              className={`flex flex-col items-center justify-center gap-0.5 h-11 rounded-xl transition-colors font-semibold
                ${ onScrollToQuote
                  ? 'px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700'
                  : 'flex-1 bg-slate-800 hover:bg-slate-900 active:bg-black text-white'
                }`}
            >
              <Phone className="w-4 h-4" />
              <span className="text-[10px] leading-none">Call</span>
            </a>

            {/* 💬 Text */}
            <a
              href={smsUrl(msgLabel)}
              aria-label="Text BBS Flooring"
              className={`flex flex-col items-center justify-center gap-0.5 h-11 rounded-xl transition-colors font-semibold
                ${ onScrollToQuote
                  ? 'px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700'
                  : 'flex-1 bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white'
                }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px] leading-none">Text</span>
            </a>

            {/* 🟢 WhatsApp */}
            <a
              href={whatsappUrl(msgLabel)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className={`flex flex-col items-center justify-center gap-0.5 h-11 rounded-xl transition-colors font-semibold
                ${ onScrollToQuote
                  ? 'px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 active:bg-[#25D366]/30 text-[#128C7E]'
                  : 'flex-1 bg-[#25D366] hover:bg-[#22BF5B] active:bg-[#1DA851] text-white'
                }`}
            >
              {/* WhatsApp SVG icon — no external library needed */}
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-[10px] leading-none">WhatsApp</span>
            </a>
          </div>

          {/* Fallback: no quote box — show number below buttons */}
          {!onScrollToQuote && (
            <p className="text-center text-[10px] text-slate-400 mt-1.5">{PHONE_DISPLAY} · Usually replies within 1 hour</p>
          )}
        </div>
      </div>
    );
  }

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
