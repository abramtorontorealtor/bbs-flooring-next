'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import CategoryFilterGrid from '@/components/CategoryFilterGrid';
import { VINYL_FAQS } from '@/data/faqs';
import Breadcrumbs from '@/components/Breadcrumbs';
import QuoteContextBanner from '@/components/QuoteContextBanner';

// Below-fold components — dynamic import to reduce initial JS bundle (TBT improvement)
const StaticFAQ = dynamic(() => import('@/components/StaticFAQ'), { ssr: false });
const RelatedCategories = dynamic(() => import('@/components/RelatedCategories'), { ssr: false });
const SpokeLinks = dynamic(() => import('@/components/SpokeLinks'), { ssr: false });
const FinancingBanner = dynamic(() => import('@/components/FinancingBanner'), { ssr: false });

// Server-side filtered via `category` prop — no client-side filter needed

const SPOKE_LINKS = [
  {
    route: 'BasementFlooring',
    label: 'Best Vinyl Flooring for Basements',
    description: 'Waterproof SPC vinyl is the #1 choice for basement floors — see why.',
  },
  {
    route: 'WaterproofFlooring',
    label: 'Waterproof Flooring Collection',
    description: 'Shop all waterproof vinyl plank and waterproof laminate options.',
  },
  {
    route: 'FlooringClearanceSale',
    label: 'Vinyl Flooring on Sale',
    description: 'Clearance deals on premium vinyl — limited stock, first-quality product.',
  },
  {
    route: 'FlooringInstallationCost',
    label: 'Vinyl Installation Cost Guide',
    description: 'Vinyl installation from $2.00–$2.25/sqft — includes click-lock and glue-down options.',
  },
  {
    route: 'FlooringShowroomMarkham',
    label: 'See Vinyl Samples in Person',
    description: 'Visit our Markham showroom to feel the texture and compare vinyl options.',
  },
];

export default function VinylClient({ initialProducts, serverGrid }) {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
      <Breadcrumbs
        items={[
          { label: 'Home', url: '/' },
          { label: 'Vinyl Flooring', url: '/vinyl' },
        ]}
      />

      <QuoteContextBanner />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
          Luxury Vinyl Plank (LVP) &amp; SPC Flooring
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          100% waterproof, scratch-resistant, and built for real life. Shop 100+ SPC and LVP vinyl
          styles starting from $1.79/sqft at our Markham showroom.
        </p>
      </div>

      {/* Content Boxes */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {/* Box 1 — SPC Technology */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">🛡️ SPC — The Gold Standard</h2>
          <p className="text-slate-700 text-sm leading-relaxed mb-2">
            SPC (Stone Polymer Composite) is the latest generation of luxury vinyl. The rigid
            stone-polymer core is <strong>100% waterproof</strong>, completely flat, and installs
            directly over concrete with no glue required.
          </p>
          <ul className="text-slate-700 text-sm space-y-1">
            <li>✅ 100% waterproof — not just water-resistant</li>
            <li>✅ Rigid core hides subfloor imperfections</li>
            <li>✅ Handles temperature extremes (-20°C to +60°C)</li>
            <li>✅ Built-in underlayment on most styles</li>
          </ul>
        </div>

        {/* Box 2 — Where to Use */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">🏠 Where Vinyl Works Best</h2>
          <ul className="text-slate-700 text-sm space-y-2">
            <li>
              <strong>Basements:</strong> The only sensible choice — 100% waterproof over concrete.
            </li>
            <li>
              <strong>Kitchens:</strong> Spills, splashes, dropped items — vinyl handles it all.
            </li>
            <li>
              <strong>Bathrooms:</strong> Yes, SPC vinyl works in bathrooms (unlike hardwood).
            </li>
            <li>
              <strong>Rental Properties:</strong> Durable, cheap to replace if damaged — landlord
              favourite.
            </li>
            <li>
              <strong>Main Floor:</strong> Families with kids and pets love the scratch resistance.
            </li>
          </ul>
          <Link
            href={createPageUrl('BasementFlooring')}
            className="inline-block mt-3 text-amber-700 font-semibold text-sm hover:underline"
          >
            Basement Flooring Guide →
          </Link>
        </div>

        {/* Box 3 — Value */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">💰 Vinyl Pricing at BBS</h2>
          <div className="text-slate-700 text-sm space-y-2">
            <p>
              <strong>Entry SPC (6mm):</strong> From $1.79/sqft — great for rental units.
            </p>
            <p>
              <strong>Mid-Range (8mm):</strong> $2.49–$3.49/sqft — the most popular price point.
            </p>
            <p>
              <strong>Premium (10–12mm):</strong> $3.49–$5.00/sqft — thicker, quieter underfoot.
            </p>
            <p>
              <strong>Installation:</strong> $2.00–$2.25/sqft including subfloor prep and
              transitions.
            </p>
          </div>
          <Link
            href={createPageUrl('QuoteCalculator')}
            className="inline-block mt-3 text-amber-700 font-semibold text-sm hover:underline"
          >
            Get an Instant Quote →
          </Link>
        </div>
      </div>

      {/* Product Grid */}
      <CategoryFilterGrid
        category="vinyl"
        sessionKey="vinyl"
        queryKey="products-vinyl"
        initialProducts={initialProducts}
        serverGrid={serverGrid}
      />

      <FinancingBanner monthlyFrom={89} />

      <StaticFAQ
          faqItems={VINYL_FAQS}
          title="Frequently Asked Questions About Vinyl Flooring"
          subtitle="Get answers to common questions about luxury vinyl plank flooring in Markham, Toronto, and Durham"
          schemaId="faq-vinyl"
          skipSchema
        />

      <SpokeLinks
        title="Explore Related Flooring Pages"
        links={SPOKE_LINKS}
      />

      <RelatedCategories currentPage="Vinyl" />
    </div>
  );
}
