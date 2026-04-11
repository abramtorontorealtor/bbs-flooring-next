'use client';

import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import CategoryFilterGrid from '@/components/CategoryFilterGrid';
import StaticFAQ from '@/components/StaticFAQ';
import { ENGINEERED_HARDWOOD_FAQS } from '@/data/faqs';
import RelatedCategories from '@/components/RelatedCategories';
import SpokeLinks from '@/components/SpokeLinks';
import FinancingBanner from '@/components/FinancingBanner';
import Breadcrumbs from '@/components/Breadcrumbs';
import QuoteContextBanner from '@/components/QuoteContextBanner';

// Server-side filtered via `category` prop — no client-side filter needed

const SPOKE_LINKS = [
  {
    route: 'VidarFlooring',
    label: 'Vidar Engineered Hardwood',
    description: 'Shop Vidar Design Flooring — premium European oak engineered hardwood.',
  },
  {
    route: 'WhiteOakFlooring',
    label: 'White Oak Flooring Collection',
    description: 'Browse all white oak engineered hardwood — the most popular species in 2025.',
  },
  {
    route: 'WickhamFlooring',
    label: 'Wickham Hardwood Flooring',
    description: 'Canadian-made Wickham engineered and solid hardwood — built for our climate.',
  },
  {
    route: 'HardwoodRefinishing',
    label: 'Hardwood Floor Refinishing',
    description: 'Restore your existing hardwood floors with professional sand & stain service.',
  },
  {
    route: 'FlooringInstallationCost',
    label: 'Hardwood Installation Cost Guide',
    description: 'Installation from $2.25/sqft (nail-down) to $4.25/sqft (herringbone) — full breakdown.',
  },
  {
    route: 'ContractorFlooring',
    label: 'Contractor & Trade Pricing',
    description: 'Exclusive member pricing on engineered hardwood for contractors and builders.',
  },
];

export default function EngineeredHardwoodClient({ initialProducts }) {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
      <Breadcrumbs
        items={[
          { label: 'Home', url: '/' },
          { label: 'Engineered Hardwood', url: '/engineered-hardwood' },
        ]}
      />

      <QuoteContextBanner />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
          Engineered Hardwood Flooring
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          Real wood beauty with superior stability — the #1 choice for GTA homeowners. Shop
          100+ engineered hardwood styles from Vidar, Wickham, and more at our Markham showroom.
        </p>
      </div>

      {/* Content Boxes */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {/* Box 1 — White Oak */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">🌳 White Oak — Most Popular Species</h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            White oak is the dominant hardwood species in Canadian new builds and renovations.
            Harder than red oak (Janka 1360), tighter grain, and takes stain beautifully — from
            natural to deep espresso. Available in 5" to 9½" wide-plank options.
          </p>
          <Link
            href={createPageUrl('WhiteOakFlooring')}
            className="inline-block mt-3 text-amber-700 font-semibold text-sm hover:underline"
          >
            Shop White Oak →
          </Link>
        </div>

        {/* Box 2 — Brands */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">🏆 Top Brands In Stock</h2>
          <ul className="text-slate-700 text-sm space-y-2">
            <li>
              <strong>Vidar:</strong> Premium European oak, 35-year warranty, radiant heat
              compatible.
            </li>
            <li>
              <strong>Wickham:</strong> Canadian-made hardwood from Quebec since 1997. Red oak,
              maple, hickory.
            </li>
            <li>
              <strong>Triforest:</strong> Wide-plank European oak at accessible price points.
            </li>
            <li>
              <strong>Northernest:</strong> Select and natural grade Canadian species.
            </li>
          </ul>
          <Link
            href={createPageUrl('VidarFlooring')}
            className="inline-block mt-3 text-amber-700 font-semibold text-sm hover:underline"
          >
            Explore Vidar →
          </Link>
        </div>

        {/* Box 3 — Engineered vs Solid */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">⚖️ Engineered vs. Solid Hardwood</h2>
          <p className="text-slate-700 text-sm leading-relaxed mb-2">
            <strong>Engineered hardwood</strong> is real wood on top, plywood underneath. It
            handles Ontario's humidity swings better than solid, can go over concrete or radiant
            heat, and costs less to install.
          </p>
          <p className="text-slate-700 text-sm leading-relaxed">
            <strong>Solid hardwood</strong> (¾" pure wood) can be refinished 5+ times and has the
            highest resale value — but can't go below grade or over concrete.
          </p>
          <Link
            href={createPageUrl('SolidHardwood')}
            className="inline-block mt-3 text-amber-700 font-semibold text-sm hover:underline"
          >
            Shop Solid Hardwood →
          </Link>
        </div>
      </div>

      {/* Product Grid */}
      <CategoryFilterGrid
        category="engineered_hardwood"
        sessionKey="engineered-hardwood"
        queryKey="products-engineered-hardwood"
        initialProducts={initialProducts}
      />

      <FinancingBanner monthlyFrom={122} />

      <StaticFAQ
          faqItems={ENGINEERED_HARDWOOD_FAQS}
          title="Frequently Asked Questions About Engineered Hardwood Flooring"
          subtitle="Get answers to common questions about engineered hardwood flooring in Markham, Toronto, and Durham"
          schemaId="faq-engineered-hardwood"
          skipSchema
        />

      <SpokeLinks
        title="Explore Related Flooring Pages"
        links={SPOKE_LINKS}
      />

      <RelatedCategories currentPage="EngineeredHardwood" />
    </div>
  );
}
