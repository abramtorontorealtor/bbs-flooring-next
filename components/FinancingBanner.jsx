'use client';

import Link from 'next/link';
import { FINANCEIT_LINKS } from '@/lib/financing';

/**
 * Slim financing CTA banner for category and service pages.
 * monthlyFrom: lowest example monthly payment for this category (default $68)
 */
export default function FinancingBanner({ monthlyFrom = 68 }) {
  return (
    <div className="my-10 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">
      <div className="flex items-center gap-4">
        <span className="text-3xl">💳</span>
        <div>
          <p className="font-bold text-lg leading-tight">Flexible Financing Available</p>
          <p className="text-slate-300 text-sm mt-0.5">
            From <span className="text-amber-400 font-bold">${monthlyFrom}/month</span> on approved credit · No prepayment penalty · Instant decision
          </p>
        </div>
      </div>
      <div className="flex gap-3 shrink-0">
        <a
          href={FINANCEIT_LINKS.freeProgram}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
        >
          Apply Now →
        </a>
        <Link
          href="/financing"
          className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap border border-white/20"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}
