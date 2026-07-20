'use client';

import { useEffect } from 'react';
import StaticFAQ from '@/components/StaticFAQ';
import SpokeLinks from '@/components/SpokeLinks';
import FinancingBanner from '@/components/FinancingBanner';
import AnswerBlock from '@/components/AnswerBlock';
import { stairsImages } from '@/data/galleryImages';
import { CDN_GALLERY } from '@/lib/service-constants';
import {
  ServiceHero,
  ServiceProcess,
  ServiceGallery,
  FinalCTA,
  MobileStickyBtn,
} from '@/components/service';

const HERO_IMAGE = `${CDN_GALLERY}/stair-project-8.webp`;

const PROCESS_STEPS = [
  { step: '01', title: 'Free Assessment', desc: 'We inspect your stairs, check wood condition, and discuss your vision — stain colour, finish, railing options.', icon: '📋' },
  { step: '02', title: 'Detailed Quote', desc: 'Transparent per-step pricing. No surprises — you know exactly what it costs before we start.', icon: '💰' },
  { step: '03', title: 'Prep & Sand', desc: 'HEPA-filtered dust-contained sanding. Work area sealed and isolated. Old finish stripped, wood smoothed and prepped.', icon: '🔧' },
  { step: '04', title: 'Stain & Finish', desc: 'Custom stain colour matched to your floors. 2-3 coats of commercial-grade polyurethane.', icon: '🎨' },
  { step: '05', title: 'Final Walkthrough', desc: 'We review every step and riser with you. Not satisfied? We fix it before we leave.', icon: '✅' },
];

const GALLERY_ITEMS = [stairsImages[7], stairsImages[3], stairsImages[0], stairsImages[17], stairsImages[1], stairsImages[10]];

/**
 * Shared client for city-qualified stair refinishing pages.
 * All city-specific copy is passed via the `data` prop — genuinely unique per city.
 */
export default function StairRefinishingCityClient({ data }) {
  const {
    city,
    breadcrumbPath,
    heroSubtitle,
    answer,
    whyHereTitle,
    whyHereParagraphs = [],
    neighbourhoodsIntro,
    neighbourhoods = [],
    faqItems = [],
    spokeLinks = [],
    schemaId,
  } = data;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: `Stair Refinishing ${city}` });
    }
  }, [city]);

  return (
    <div className="bg-white">
      <ServiceHero
        heroImage={HERO_IMAGE}
        heroAlt={`Professional staircase refinishing in ${city}`}
        breadcrumbPath={breadcrumbPath}
        badges={['⭐ 4.7/5 on Google', '🛡️ WSIB Insured', '🪜 Dedicated Stair Crew', '🎨 Custom Stain Matching']}
        titleLine1="Staircase Refinishing"
        titleLine2={`in ${city}`}
        subtitle={heroSubtitle}
        pricingPills={[
          { value: '$125', label: 'per step refinish' },
          { value: '$185', label: 'per step recapping' },
          { value: 'FREE', label: 'in-home assessment' },
        ]}
        primaryCTA={{ text: 'Get a Free Stair Quote', route: 'FreeMeasurement' }}
      />

      <AnswerBlock question={`Staircase refinishing in ${city} — what does it cost?`}>
        {answer.map((seg, i) => (seg.b ? <strong key={i}>{seg.b}</strong> : seg.t))}
      </AnswerBlock>

      {/* Why in this city */}
      <section className="pt-10 pb-12 md:pt-14 md:pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 text-center">{whyHereTitle}</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            {whyHereParagraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* Refinish vs recap */}
      <section className="py-12 md:py-16 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Refinish or Recap?</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
            If your existing treads are solid hardwood in sound shape, we sand and restain them — the most affordable option at $125/step. If the treads are plywood, MDF, or too worn to save, we recap with brand-new hardwood at $185/step. We tell you which one your stairs need at the free visit.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-white border border-amber-200 rounded-xl p-5">
              <p className="text-amber-600 font-bold text-lg mb-1">Refinish (Sand &amp; Restain)</p>
              <p className="text-sm text-slate-500">Keep the solid-wood treads you have. $125/step — most affordable.</p>
            </div>
            <div className="bg-white border border-amber-200 rounded-xl p-5">
              <p className="text-amber-600 font-bold text-lg mb-1">Recap (New Treads)</p>
              <p className="text-sm text-slate-500">New hardwood over the structure when the treads can&apos;t be saved. $185/step.</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-4">Railings: 9 in 10 customers keep and refinish the existing railing to match — new pickets/posts optional.</p>
        </div>
      </section>

      <ServiceProcess
        title="Our Refinishing Process"
        subtitle={`Dust-contained sanding, custom staining, and professional-grade finishes across ${city}.`}
        steps={PROCESS_STEPS}
      />

      {/* Pricing */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">{city} Refinishing Pricing</h2>
          <p className="text-slate-500 text-center mb-8 max-w-xl mx-auto">Per-step pricing. No hidden fees. A typical 13-step refinish runs about $1,625.</p>
          <div className="space-y-3">
            {[
              { service: 'Stair Tread Refinishing (Sand & Restain)', price: '$125/step', note: 'Existing solid hardwood in good condition' },
              { service: 'New Straight Treads (Recapping)', price: '$185/step', note: 'When treads can\'t be saved — includes labour & material' },
              { service: 'New Pie / Triangle / Bullnose Steps', price: '$225/step', note: 'Specialty step shapes' },
              { service: 'Refinish Railing (sand & restain)', price: '$25/lf', note: '9 in 10 keep & refinish the existing railing' },
              { service: 'New Iron Pickets', price: '$25/piece installed', note: 'Modernise the railing, material included' },
              { service: 'New Posts (3¼")', price: '$150/post', note: 'When posts are replaced rather than refinished' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 hover:border-amber-300 transition-colors">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{item.service}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>
                </div>
                <p className="text-lg font-bold text-amber-600 whitespace-nowrap ml-4">{item.price}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">All prices in CAD. Final quote provided after the free in-home assessment. Includes furniture protection.</p>
        </div>
      </section>

      {/* Neighbourhoods served */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 text-center">Staircase Refinishing Across {city}</h2>
          <p className="text-slate-600 text-center mb-8 max-w-2xl mx-auto leading-relaxed">{neighbourhoodsIntro}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {neighbourhoods.map(n => (
              <span key={n} className="bg-white border border-slate-200 rounded-full px-4 py-1.5 text-sm text-slate-600">{n}</span>
            ))}
          </div>
        </div>
      </section>

      <ServiceGallery
        title="Our Staircase Work"
        subtitle="Real staircase refinishing and renovation projects by our crew."
        images={GALLERY_ITEMS}
        galleryLink="View all 47 staircase projects"
        bg="bg-white"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <FinancingBanner monthlyFrom={65} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pt-10 md:pb-16">
        <StaticFAQ
          faqItems={faqItems}
          title="Frequently Asked Questions"
          subtitle={`Common questions about staircase refinishing in ${city}`}
          schemaId={schemaId}
          skipSchema
        />
        <SpokeLinks title="Explore Related Services" links={spokeLinks} />
        <FinalCTA
          title={`Ready to Refinish Your ${city} Staircase?`}
          subtitle="Book a free in-home assessment. We'll inspect your stairs, show you stain samples, and provide a detailed quote."
          primaryCTA={{ text: 'Get a Free Stair Quote', route: 'FreeMeasurement' }}
        />
      </div>

      <MobileStickyBtn text="🪜 Get a Free Stair Quote" />
    </div>
  );
}
