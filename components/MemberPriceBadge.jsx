'use client';

import React from 'react';
import { Lock } from 'lucide-react';

export default function MemberPriceBadge({ product, user, isVerified, compact = false }) {
  const publicPrice = product.public_price || product.price_per_sqft;
  const memberPrice = product.member_price;
  const hasMemberPrice = memberPrice && memberPrice < publicPrice;
  const isClearance = product.is_clearance;

  if (!isClearance) {
    const displayPrice = memberPrice || publicPrice;
    if (compact) {
      return (
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">{displayPrice ? `C$${displayPrice.toFixed(2)}` : 'Contact for Price'}</span>
            {displayPrice && <span className="text-xs text-slate-500">/sq.ft</span>}
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-bold text-slate-900">C${displayPrice?.toFixed(2)}</span>
          <span className="text-slate-600">per sq.ft</span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div>
        {isVerified && hasMemberPrice ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-amber-600">C${memberPrice.toFixed(2)}</span>
              <span className="text-xs text-slate-500">/sq.ft</span>
              {publicPrice && <span className="text-xs text-slate-400 line-through ml-1">C${publicPrice.toFixed(2)}</span>}
            </div>
            <div className="mt-1"><span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Member Deal</span></div>
          </>
        ) : (
          <>
            {publicPrice && <div className="flex items-baseline gap-2"><span className="text-sm text-slate-400 line-through">C${publicPrice.toFixed(2)}/sq.ft</span></div>}
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); localStorage.setItem('bbs_return_url', window.location.pathname + window.location.search); window.location.href = '/login'; }}
              className="mt-1 flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-semibold transition-colors group"
            >
              <Lock className="w-3 h-3" />
              <span className="group-hover:underline">Sign in for clearance price</span>
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isVerified && hasMemberPrice ? (
        <>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl text-slate-400 line-through">C${publicPrice?.toFixed(2)}</span>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">Retail</span>
          </div>
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <div>
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-0.5">Your Member Price</div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-amber-600">C${memberPrice.toFixed(2)}</span>
                <span className="text-sm text-amber-600">per sq.ft</span>
                <span className="text-sm text-amber-700 font-semibold">(Save C${(publicPrice - memberPrice).toFixed(2)}/sq.ft)</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl text-slate-400 line-through">C${publicPrice?.toFixed(2)}</span>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">Retail</span>
          </div>
          <div className="relative rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-3">
            <div className="blur-sm select-none pointer-events-none">
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-0.5">Clearance Price</div>
              <span className="text-3xl font-bold text-amber-600">C$X.XX</span>
              <span className="text-sm text-amber-600 ml-2">per sq.ft</span>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl">
              <Lock className="w-5 h-5 text-amber-700" />
              <button
                onClick={() => { localStorage.setItem('bbs_return_url', window.location.pathname + window.location.search); window.location.href = '/login'; }}
                className="text-sm font-bold text-amber-800 hover:underline text-center leading-tight"
              >
                Free Sign-Up to Unlock<br/>Clearance Pricing
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
