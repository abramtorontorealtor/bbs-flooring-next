'use client';

import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import CategoryProductGrid from '@/components/CategoryProductGrid';
import FAQSection from '@/components/FAQSection';
import RelatedCategories from '@/components/RelatedCategories';
import SpokeLinks from '@/components/SpokeLinks';
import FinancingBanner from '@/components/FinancingBanner';
import Breadcrumbs from '@/components/Breadcrumbs';
import QuoteContextBanner from '@/components/QuoteContextBanner';

// Server-side filtered via `category` prop — no client-side filter needed

const SPOKE_LINKS = [
  {
    route: 'BasementFlooring',
    label: 'Basement Flooring',
    description: '100% waterproof SPC vinyl — the best choice for below-grade installations.',
  },
  {
    route: 'WaterproofFlooring',
    label: 'Waterproof Flooring',
    description: 'SPC vinyl and water-resistant laminate for any wet area.',
  },
  {
    route: 'EngineeredHardwood',
    label: 'Engineered Hardwood',
    description: 'Real wood beauty for living rooms and main floors.',
  },
  {
    route: 'Laminate',
    label: 'Laminate Flooring',
    description: 'Budget-friendly hard-surface flooring from $1.49/sqft.',
  },
  {
    route: 'FlooringInstallationCost',
    label: 'Flooring Installation Cost',
    description: 'Transparent GTA pricing — vinyl install from $2.00/sqft.',
  },
  {
    route: 'Clearance',
    label: 'Clearance Flooring',
    description: 'In-stock vinyl at 30–60% off. Limited quantities.',
  },
];

export default function VinylClient() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', url: '/' },
          { label: 'Vinyl Flooring', url: '/vinyl' },
        ]}
      />

      <QuoteContextBanner />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
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
      <CategoryProductGrid
        sessionKey="vinyl"
        queryKey="products-vinyl"
        category="vinyl"
      />

      <FinancingBanner monthlyFrom={89} />

      <FAQSection category="vinyl_flooring" />

      <SpokeLinks
        title="Explore Related Flooring Pages"
        links={SPOKE_LINKS}
      />

      <RelatedCategories currentPage="Vinyl" />
    </div>
  );
}
