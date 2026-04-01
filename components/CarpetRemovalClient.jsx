'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CarpetRemovalEstimator from '@/components/CarpetRemovalEstimator';
import FinancingBanner from '@/components/FinancingBanner';

const FAQ_ITEMS = [
  {
    q: 'How much does carpet removal cost in Markham and Toronto?',
    a: 'We charge a flat transparent rate of $1.00 per square foot for carpet removal, plus a $75 haul-away and disposal fee.',
  },
  {
    q: 'Do you remove carpet from stairs?',
    a: 'Yes, we remove carpet and tack strips from all types of stairs. Because staircases vary, this requires a custom quote.',
  },
  {
    q: 'Do you prepare the subfloor after removing the carpet?',
    a: 'Yes, our clean slate service ensures all staples, tack strips, and debris are removed so your subfloor is ready for new hardwood, vinyl, or laminate flooring.',
  },
];

const NEXT_STEPS = [
  { label: 'Solid Hardwood', href: '/solid-hardwood' },
  { label: 'Engineered Hardwood', href: '/engineered-hardwood' },
  { label: 'Vinyl Flooring', href: '/vinyl' },
  { label: 'Laminate Flooring', href: '/laminate' },
];

export default function CarpetRemovalClient() {
  const [showStickyBtn, setShowStickyBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBtn(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: 'Carpet Removal' });
    }
  }, []);

  return (
    <>
      {/* Hero */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        <img
          src="https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/professional-carpet-removal-service-markham-toronto.webp"
          alt="Professional carpet removal and subfloor preparation service in Markham and Toronto"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Trust Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['Serving Markham, Toronto & Durham', 'Fully Insured', '24-Hour Turnaround'].map(b => (
              <span key={b} className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-500/30">
                ✓ {b}
              </span>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4">
                The Clean Slate<br />
                <span className="text-amber-400">Carpet Removal</span><br />
                Service.
              </h1>
              <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8">
                We remove the dust, dander, and allergens of the last decade in 24 hours. Get a perfectly prepped subfloor before you install your new flooring.
              </p>

              {/* Pricing Pills */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-black text-amber-400">$1.00</p>
                  <p className="text-xs text-slate-300">per sq ft</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-black text-amber-400">$75</p>
                  <p className="text-xs text-slate-300">haul-away flat fee</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-black text-amber-400">24hr</p>
                  <p className="text-xs text-slate-300">turnaround</p>
                </div>
              </div>

              <ul className="space-y-2">
                {[
                  'Full carpet & underlay rip-out',
                  'All tack strips & staple removal',
                  'Subfloor swept clean & ready',
                  'Optional same-day haul-away',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-slate-200 text-sm">
                    <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <section aria-label="Carpet removal price estimator" id="estimator">
              <CarpetRemovalEstimator />
            </section>
          </div>
        </div>
      </div>

      {/* Process */}
      <div className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-800 text-center mb-3">
            Carpet Removal Experts in Markham &amp; Durham
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
            Our professional crews handle the dirty work so you don&apos;t have to. Every job is completed to a flooring-install-ready standard.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Get Your Estimate', desc: 'Use our calculator above to get a transparent flat-rate price in seconds.' },
              { step: '02', title: 'Lock In Your Date', desc: 'Submit your info to reserve your crew and lock in your $100 floor replacement credit.' },
              { step: '03', title: '24-Hour Removal', desc: 'Our insured crew arrives, removes all carpet, underlay, tack strips, and staples.' },
              { step: '04', title: 'Install-Ready Subfloor', desc: "You're left with a clean, debris-free subfloor ready for your new hardwood, vinyl, or laminate." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-4xl font-black text-amber-400 mb-3">{step}</p>
                <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financing Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FinancingBanner monthlyFrom={41} />
      </div>

      {/* FAQ */}
      <section aria-label="Carpet removal frequently asked questions" className="bg-slate-50 py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-800 text-center mb-3">Frequently Asked Questions</h2>
          <p className="text-slate-500 text-center mb-10">Transparent answers about our carpet removal service.</p>
          <div className="space-y-4">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-2">{q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section aria-label="Shop wholesale flooring after carpet removal" className="bg-white py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-black text-slate-800 mb-2">Once Your Subfloor Is Ready, Explore Our Wholesale Flooring</h2>
          <p className="text-slate-500 mb-8">Your clean slate is the perfect foundation. Shop our premium selection at wholesale prices.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {NEXT_STEPS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="block bg-slate-800 hover:bg-amber-500 text-white font-semibold rounded-xl px-4 py-4 text-sm transition-colors"
              >
                {label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      {showStickyBtn && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 py-3 shadow-xl">
          <a
            href="#estimator"
            className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl text-center text-base transition-colors"
          >
            🔒 Lock In My $100 Credit →
          </a>
        </div>
      )}
    </>
  );
}
