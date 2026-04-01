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
    route: 'WaterproofFlooring',
    label: 'Waterproof Laminate & Vinyl Flooring',
    description: 'Shop waterproof laminate and SPC vinyl — ideal for kitchens, basements & bathrooms.',
  },
  {
    route: 'FlooringClearanceSale',
    label: 'Laminate Flooring Clearance Sale',
    description: 'Save big on discontinued and overstocked laminate flooring — limited quantities.',
  },
  {
    route: 'FlooringInstallationCost',
    label: 'Laminate Installation Cost Guide',
    description: 'Laminate installation from $2.00/sqft — full cost breakdown and what to expect.',
  },
  {
    route: 'BasementFlooring',
    label: 'Basement Flooring Options',
    description: 'Best waterproof flooring for basements — vinyl and waterproof laminate compared.',
  },
  {
    route: 'FlooringShowroomMarkham',
    label: 'Visit Our Markham Showroom',
    description: 'See and feel laminate samples in person — 6061 Highway 7, Unit B, Markham.',
  },
];

export default function LaminateClient() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', url: '/' },
          { label: 'Laminate Flooring', url: '/laminate' },
        ]}
      />

      <QuoteContextBanner />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
          Laminate Flooring
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          Maximum floor for minimum budget. Premium 12mm laminate from $1.49/sqft — AC4/AC5 rated
          and water-resistant. The best value hard-surface flooring in the GTA.
        </p>
      </div>

      {/* Content Boxes */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {/* Box 1 — Why 12mm */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">📐 Why 12mm Laminate?</h2>
          <p className="text-slate-700 text-sm leading-relaxed mb-2">
            Thickness matters with laminate. Thin 7–8mm flooring sounds hollow and feels cheap
            underfoot. Our 12mm options feel solid, quiet, and premium — comparable to engineered
            hardwood at a fraction of the cost.
          </p>
          <ul className="text-slate-700 text-sm space-y-1">
            <li>✅ Solid, quiet underfoot (HDF core)</li>
            <li>✅ AC4/AC5 wear rating for heavy traffic</li>
            <li>✅ Water-resistant edges on most styles</li>
            <li>✅ 25-year residential warranty</li>
          </ul>
        </div>

        {/* Box 2 — Best Uses */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">🏠 Where Laminate Excels</h2>
          <ul className="text-slate-700 text-sm space-y-2">
            <li>
              <strong>Bedrooms:</strong> Soft look, warm underfoot, budget-friendly upgrade from
              carpet.
            </li>
            <li>
              <strong>Living Rooms:</strong> Realistic wood looks, handles foot traffic well.
            </li>
            <li>
              <strong>Home Offices:</strong> AC5-rated options handle rolling chairs and desk wear.
            </li>
            <li>
              <strong>Hallways:</strong> Durable surface for high-traffic transition zones.
            </li>
            <li>
              <strong>Whole-House Budget Projects:</strong> 500 sqft installed from $1,745.
            </li>
          </ul>
          <p className="text-slate-500 text-xs mt-3">
            ⚠️ Not recommended for basements with moisture or wet areas (bathrooms). Use SPC vinyl
            instead.
          </p>
        </div>

        {/* Box 3 — Pricing */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">💰 Laminate Pricing at BBS</h2>
          <div className="text-slate-700 text-sm space-y-2">
            <p>
              <strong>Entry 12mm:</strong> From $1.49/sqft — AC4 rated, 20+ colour options.
            </p>
            <p>
              <strong>Mid-Range 12mm:</strong> $1.99–$2.99/sqft — wider planks, premium finishes.
            </p>
            <p>
              <strong>Premium 12mm:</strong> $2.99–$4.99/sqft — embossed in register, AC5
              commercial grade.
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
            Calculate Your Cost →
          </Link>
        </div>
      </div>

      {/* Product Grid */}
      <CategoryProductGrid
        sessionKey="laminate"
        queryKey="products-laminate"
        category="laminate"
      />

      <FinancingBanner monthlyFrom={68} />

      <FAQSection category="laminate_flooring" />

      <SpokeLinks
        title="Explore Related Flooring Pages"
        links={SPOKE_LINKS}
      />

      <RelatedCategories currentPage="Laminate" />
    </div>
  );
}
