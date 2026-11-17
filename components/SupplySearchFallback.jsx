'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { track } from '@/lib/track';
import { loadSupplyIndex, searchSupplies } from '@/lib/supplySearch';

const UNIT_LABEL = { gal: 'gal', pail: 'pail', bag: 'bag', roll: 'roll', tube: 'tube', each: 'ea', kit: 'kit', piece: 'pc' };

function priceLabel(s) {
  if (s.priceLow == null) return null;
  const from = s.isMulti && s.priceLow !== s.priceHigh;
  return (from ? 'from ' : '') + 'C$' + Number(s.priceLow).toFixed(2);
}

// Shown in the flooring grid's empty state: the toolbar search only filters
// flooring, so an accessory query ("mapesand") would otherwise dead-end.
export default function SupplySearchFallback({ query }) {
  const q = (query || '').trim();
  const [found, setFound] = useState({ q: '', hits: [] });

  useEffect(() => {
    if (q.length < 2) return undefined;
    let cancelled = false;
    loadSupplyIndex().then((rows) => {
      if (!cancelled) setFound({ q, hits: searchSupplies(rows, q, 3) });
    });
    return () => { cancelled = true; };
  }, [q]);

  // Ignore results computed for a previous query.
  const hits = found.q === q ? found.hits : [];
  if (q.length < 2 || hits.length === 0) return null;

  return (
    <div className="max-w-xl mx-auto mb-6 text-left" data-search-group="accessory-fallback">
      <p className="text-sm font-semibold text-slate-700 mb-2">
        Looking for an accessory? We found this in supplies:
      </p>
      <ul className="space-y-2">
        {hits.map((s) => {
          const price = priceLabel(s);
          return (
            <li key={s.id}>
              <Link
                href={'/flooring-accessories/' + encodeURIComponent(s.slug)}
                onClick={() => track('search', { meta: { query: q, kind: 'accessory_fallback', slug: s.slug } })}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 transition-colors group"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 flex items-center justify-center">
                  {s.image_url ? (
                    <Image src={s.image_url.split('?')[0]} alt="" className="w-full h-full object-contain" width={56} height={56} quality={60} unoptimized />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-amber-700">{s.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {s.categoryLabel}{s.isMulti ? ' \u00b7 ' + s.optionCount + ' options' : ''}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  {price ? (
                    <>
                      <span className="text-sm font-bold text-amber-600">{price}</span>
                      {s.unit && !s.isMulti && <span className="block text-xs text-slate-400">{'/' + (UNIT_LABEL[s.unit] || s.unit)}</span>}
                    </>
                  ) : (
                    <span className="text-xs font-medium text-amber-600">Call for Pricing</span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm">
        <Link href="/flooring-accessories" className="text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2">
          Shop all accessories &amp; supplies &rarr;
        </Link>
      </p>
    </div>
  );
}
