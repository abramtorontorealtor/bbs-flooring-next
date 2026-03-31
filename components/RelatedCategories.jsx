'use client';

import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';

const ALL_CATEGORIES = [
  { key: 'SolidHardwood', label: 'Solid Hardwood', desc: 'Timeless real wood flooring' },
  { key: 'EngineeredHardwood', label: 'Engineered Hardwood', desc: 'Real wood with added stability' },
  { key: 'Vinyl', label: 'Vinyl & LVP', desc: 'Waterproof & durable' },
  { key: 'Laminate', label: 'Laminate', desc: 'Stylish & affordable' },
  { key: 'Stairs', label: 'Stair Installation', desc: 'Custom stair renovation' },
];
const SERVICE_LINKS = [
  { key: 'Installation', label: 'Installation Services', desc: 'Professional install from $2.00/sqft' },
  { key: 'FreeMeasurement', label: 'Free Measurement', desc: 'No-obligation in-home quote' },
  { key: 'CarpetRemoval', label: 'Carpet Removal', desc: 'Clean slate from $1.00/sqft' },
];

export default function RelatedCategories({ currentPage }) {
  const otherCategories = ALL_CATEGORIES.filter(c => c.key !== currentPage);
  return (
    <div className="mt-12 pt-10 border-t border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Explore More Flooring</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {otherCategories.map(({ key, label, desc }) => (
          <Link key={key} href={createPageUrl(key)} className="group block bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl p-4 transition-all">
            <h3 className="font-semibold text-slate-800 group-hover:text-amber-700 text-sm mb-1">{label}</h3>
            <p className="text-xs text-slate-500">{desc}</p>
          </Link>
        ))}
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Our Services</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SERVICE_LINKS.map(({ key, label, desc }) => (
          <Link key={key} href={createPageUrl(key)} className="flex items-center gap-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl px-4 py-3 transition-all">
            <div>
              <span className="font-semibold text-amber-800 text-sm">{label}</span>
              <p className="text-xs text-amber-600">{desc}</p>
            </div>
            <span className="ml-auto text-amber-400">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
