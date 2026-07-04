'use client';

import Link from 'next/link';
import { ShieldCheck, RotateCcw, BadgeDollarSign, Phone } from 'lucide-react';

/**
 * TrustStrip — reusable point-of-purchase trust/risk-reversal block.
 *
 * Surfaces the four signals a cold online shopper needs right before they
 * commit money: secure payment (Stripe), a real return window (14-day),
 * price-match risk reversal, and a real human phone number.
 *
 * Two layouts:
 *   variant="compact"  → single row of small trust chips (fits inside a PDP buy box)
 *   variant="full"     → 2×2 card grid with labels + sublabels (checkout / high-intent)
 *
 * Reversible, in-house, no external calls. Facts are canonical (BUSINESS-FACTS.md):
 * phone (647) 428-1111, 14-day in-store returns, Best Price Guarantee (/price-match).
 */
export default function TrustStrip({ variant = 'compact', className = '' }) {
  const items = [
    {
      icon: ShieldCheck,
      color: 'text-emerald-600',
      label: 'Stripe-Secured Checkout',
      sub: '256-bit SSL · we never see your card',
    },
    {
      icon: RotateCcw,
      color: 'text-sky-600',
      label: '14-Day Returns',
      sub: 'Not right? Return in-store within 14 days',
    },
    {
      icon: BadgeDollarSign,
      color: 'text-amber-600',
      label: 'Best Price Guarantee',
      sub: 'Found it cheaper locally? We beat it.',
      href: '/price-match',
    },
    {
      icon: Phone,
      color: 'text-slate-700',
      label: 'Talk to a Real Person',
      sub: '(647) 428-1111 · Mon–Sat 10–5',
      href: 'tel:6474281111',
    },
  ];

  if (variant === 'compact') {
    return (
      <div
        className={`grid grid-cols-2 gap-x-3 gap-y-2 pt-3 border-t border-slate-100 ${className}`}
      >
        {items.map(({ icon: Icon, color, label, href }) => {
          const inner = (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
              {label}
            </span>
          );
          return href ? (
            <Link
              key={label}
              href={href}
              className="hover:text-amber-700 transition-colors"
            >
              {inner}
            </Link>
          ) : (
            <div key={label}>{inner}</div>
          );
        })}
      </div>
    );
  }

  // variant === 'full'
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {items.map(({ icon: Icon, color, label, sub, href }) => {
        const inner = (
          <div className="flex items-start gap-2.5 h-full rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-amber-300">
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${color}`} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{sub}</p>
            </div>
          </div>
        );
        return href ? (
          <Link key={label} href={href} className="block h-full">
            {inner}
          </Link>
        ) : (
          <div key={label} className="h-full">{inner}</div>
        );
      })}
    </div>
  );
}
