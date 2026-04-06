'use client';

import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import CategoryProductGrid from '@/components/CategoryProductGrid';
import StaticFAQ from '@/components/StaticFAQ';
import { SOLID_HARDWOOD_FAQS } from '@/data/faqs';
import RelatedCategories from '@/components/RelatedCategories';
import SpokeLinks from '@/components/SpokeLinks';
import FinancingBanner from '@/components/FinancingBanner';
import Breadcrumbs from '@/components/Breadcrumbs';
import QuoteContextBanner from '@/components/QuoteContextBanner';

// Server-side filtered via `category` prop — no client-side filter needed

const SPOKE_LINKS = [
  {
    route: 'EngineeredHardwood',
    label: 'Engineered vs Solid Hardwood',
    description: 'Compare engineered hardwood — better for concrete, radiant heat, and condos.',
  },
  {
    route: 'WhiteOakFlooring',
    label: 'White Oak Flooring Collection',
    description: 'The #1 hardwood species in Canadian homes — solid and engineered options.',
  },
  {
    route: 'WickhamFlooring',
    label: 'Wickham Canadian-Made Hardwood',
    description: 'Premium solid hardwood made in Wickham, Quebec since 1997.',
  },
  {
    route: 'HardwoodRefinishing',
    label: 'Hardwood Floor Refinishing',
    description: 'Restore existing hardwood floors to like-new condition — from $5.25/sqft.',
  },
  {
    route: 'Stairs',
    label: 'Hardwood Stair Renovation',
    description: 'Match your new hardwood floors with custom-stained stair treads.',
  },
  {
    route: 'FlooringInstallationCost',
    label: 'Flooring Installation Cost',
    description: 'Transparent GTA pricing guide — no hidden fees.',
  },
];

export default function SolidHardwoodClient() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', url: '/' },
          { label: 'Solid Hardwood', url: '/solid-hardwood' },
        ]}
      />

      <QuoteContextBanner />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
          Solid Hardwood Flooring
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          The gold standard in flooring — ¾" pure hardwood that can be refinished 5+ times and
          lasts a lifetime. In stock at our Markham showroom in oak, maple, hickory, and more.
        </p>
      </div>

      {/* Content Boxes */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {/* Box 1 — Species */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">🌲 Species We Carry</h2>
          <ul className="text-slate-700 text-sm space-y-2">
            <li>
              <strong>Red Oak:</strong> Classic Canadian hardwood. Warm pink undertones, Janka
              1290. Most refinishable species.
            </li>
            <li>
              <strong>White Oak:</strong> Tighter grain, slightly harder (Janka 1360). The modern
              favourite for contemporary homes.
            </li>
            <li>
              <strong>Hard Maple:</strong> Janka 1450. Clean, light appearance — ideal for
              kitchens and high-traffic areas.
            </li>
            <li>
              <strong>Hickory:</strong> The toughest domestic species (Janka 1820). Bold grain
              contrast for a rustic look.
            </li>
          </ul>
        </div>

        {/* Box 2 — Why Solid */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">💎 Why Choose Solid Hardwood?</h2>
          <ul className="text-slate-700 text-sm space-y-2">
            <li>
              <strong>Refinish 5+ times:</strong> Sand and re-stain every 10–15 years. The floor
              gets more character with age.
            </li>
            <li>
              <strong>Highest resale value:</strong> Realtors consistently rank hardwood floors as
              the #1 upgrade buyers seek.
            </li>
            <li>
              <strong>100-year floor:</strong> Properly maintained solid hardwood outlasts the
              building itself.
            </li>
            <li>
              <strong>Authentic feel:</strong> Nothing replicates the warmth and sound of ¾" solid
              hardwood underfoot.
            </li>
          </ul>
        </div>

        {/* Box 3 — Solid vs Engineered */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">⚖️ Solid vs. Engineered — Which is Right?</h2>
          <div className="text-slate-700 text-sm space-y-2">
            <p>
              <strong>Choose Solid if:</strong> Your subfloor is plywood (not concrete), you want
              maximum refinishing potential, and you're on a main or upper floor.
            </p>
            <p>
              <strong>Choose Engineered if:</strong> You have a concrete slab, radiant heat, or
              want a wider plank (over 5"). Engineered handles humidity swings better.
            </p>
            <p>Starting from <strong>$5.69/sqft</strong>. Installation from <strong>$2.25/sqft</strong>.</p>
          </div>
          <Link
            href={createPageUrl('EngineeredHardwood')}
            className="inline-block mt-3 text-amber-700 font-semibold text-sm hover:underline"
          >
            Compare Options →
          </Link>
        </div>
      </div>

      {/* Product Grid */}
      <CategoryProductGrid
        sessionKey="solid-hardwood"
        queryKey="products-solid-hardwood"
        category="solid_hardwood"
      />

      <FinancingBanner monthlyFrom={142} />

      <StaticFAQ
          faqItems={SOLID_HARDWOOD_FAQS}
          title="Frequently Asked Questions About Solid Hardwood Flooring"
          subtitle="Get answers to common questions about solid hardwood flooring in Markham, Toronto, and Durham"
          schemaId="faq-solid-hardwood"
          skipSchema
        />

      <SpokeLinks
        title="Explore Related Flooring Pages"
        links={SPOKE_LINKS}
      />

      <RelatedCategories currentPage="SolidHardwood" />
    </div>
  );
}
