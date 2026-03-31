'use client';

import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import { ArrowRight } from 'lucide-react';

export default function SpokeLinks({ title = 'Related Pages You May Like', links = [] }) {
  if (!links.length) return null;
  return (
    <div className="mt-12 mb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">{title}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map(({ route, label, description }) => (
          <Link key={route} href={createPageUrl(route)} className="group flex items-start gap-3 bg-gradient-to-br from-amber-50 to-slate-50 hover:from-amber-100 hover:to-slate-100 border border-slate-200 hover:border-amber-300 rounded-xl p-5 transition-all">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 group-hover:text-amber-700 mb-1">{label}</h3>
              <p className="text-sm text-slate-600">{description}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  );
}
