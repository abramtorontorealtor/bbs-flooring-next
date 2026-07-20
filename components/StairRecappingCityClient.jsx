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

const HERO_IMAGE = `${CDN_GALLERY}/stair-project-7.webp`;

const PROCESS_STEPS = [
  { step: '01', title: 'Assess the Structure', desc: 'We inspect your existing staircase frame — stringers, sub-treads, and risers — to confirm it can be recapped without a rebuild. In almost every GTA home, it can.', icon: '🔍' },
  { step: '02', title: 'Remove Old Surface', desc: 'Carpet, old treads, or worn nosing come off. Tack strips, staples, and adhesive are cleaned so the new hardwood sits flush and quiet.', icon: '✂️' },
  { step: '03', title: 'Install New Treads & Risers', desc: 'New solid-hardwood treads and risers are cut, glued, and fastened directly over the existing structure — the core of recapping. No demolition, no structural rebuild.', icon: '🪜' },
  { step: '04', title: 'Custom Staining', desc: 'We colour-match to your floors with test patches on your actual stairs, so you approve the exact shade before we finish.', icon: '🎨' },
  { step: '05', title: 'Finish & Protect', desc: '2–3 coats of commercial-grade polyurethane for a durable, beautiful staircase built to handle daily traffic.', icon: '✨' },
];

const GALLERY_ITEMS = [stairsImages[1], stairsImages[6], stairsImages[3], stairsImages[8], stairsImages[10], stairsImages[5]];

/**
 * Shared client for city-qualified stair recapping pages.
 * All city-specific copy is passed via the `data` prop — genuinely unique per city.
 */
export default function StairRecappingCityClient({ data }) {
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
      window.gtag('event', 'view_item_list', { item_list_name: `Stair Recapping ${city}` });
    }
  }, [city]);

  return (
    <div className="bg-white">
      <ServiceHero
        heroImage={HERO_IMAGE}
        heroAlt={`Stair recapping with new hardwood treads in ${city}`}
        breadcrumbPath={breadcrumbPath}
        badges={['⭐ 4.7/5 Google Reviews', '🛡️ WSIB Insured', '⏱️ 2-3 Day Turnaround', '🎨 Custom Stain Matching']}
        titleLine1="Stair Recapping & Cladding"
        titleLine2={`in ${city}`}
        subtitle={heroSubtitle}
        pricingPills={[
          { value: '$185', label: 'per step (straight)' },
          { value: '$225', label: 'per step (pie/bullnose)' },
          { value: '~$2,700', label: 'typical 13-step recap' },
        ]}
        primaryCTA={{ text: 'Get a Free Stair Quote', route: 'FreeMeasurement' }}
      />

      <AnswerBlock question={`Stair recapping in ${city} — what does it cost?`}>
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

      {/* Recap vs replace */}
      <section className="py-12 md:py-16 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Why Recap Instead of Replace?</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
            Your staircase frame — stringers, sub-treads, and risers — is almost always structurally sound. Only the visible surface is worn, dated, or carpeted. Recapping installs new solid-hardwood treads and risers directly over that structure, so you skip demolition and structural carpentry entirely.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-white border border-amber-200 rounded-xl p-5">
              <p className="text-amber-600 font-bold text-lg mb-1">Recapping</p>
              <p className="text-sm text-slate-500">New hardwood treads &amp; risers over the existing frame. $185/step, done in 2–3 days.</p>
            </div>
            <div className="bg-white border border-amber-200 rounded-xl p-5">
              <p className="text-amber-600 font-bold text-lg mb-1">Full Rebuild</p>
              <p className="text-sm text-slate-500">Demolition + structural carpentry. Weeks of work at multiples of the cost — rarely necessary.</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-4">We confirm your frame can be recapped during the free in-home visit — no commitment required.</p>
        </div>
      </section>

      <ServiceProcess
        title="The Recapping Process"
        subtitle={`From tired staircase to stunning hardwood in 2-3 days across ${city}.`}
        steps={PROCESS_STEPS}
      />

      {/* Pricing */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">{city} Recapping Pricing</h2>
          <p className="text-slate-500 text-center mb-8 max-w-xl mx-auto">Honest per-step pricing. The final quote depends on step count, step shape, and railing scope.</p>
          <div className="space-y-3">
            {[
              { service: 'New Straight Treads (Recapping)', price: '$185/step', note: 'New hardwood treads & risers over existing structure' },
              { service: 'New Pie / Triangle / Bullnose Steps', price: '$225/step', note: 'Specialty step shapes' },
              { service: 'Custom Staining', price: 'Included', note: 'Colour-matched to your existing floors' },
              { service: 'Railing Upgrades (iron spindles)', price: '$25/picket installed', note: 'Modern iron pickets, material included' },
              { service: 'New Nosing', price: '$30/ft', note: 'Stair nose transition to match flooring' },
              { service: 'Refinish Railing (sand & restain)', price: '$25/lf', note: '9 in 10 keep & refinish the existing railing' },
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
          <div className="mt-8 bg-slate-800 text-white rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-3">📝 Example: Typical 13-Step {city} Recap</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-300">13 steps × $185 (new treads)</span><span className="font-semibold">$2,405</span></div>
              <div className="flex justify-between"><span className="text-slate-300">10 lf new nosing × $30</span><span className="font-semibold">$300</span></div>
              <div className="flex justify-between"><span className="text-slate-300">26 iron pickets × $25</span><span className="font-semibold">$650</span></div>
              <div className="flex justify-between border-t border-slate-600 pt-2 mt-2"><span className="font-bold text-amber-400">Total estimate</span><span className="font-bold text-amber-400 text-lg">$3,355</span></div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Actual pricing varies with step shape, material, and railing scope. Free in-home quote provided.</p>
          </div>
        </div>
      </section>

      {/* Neighbourhoods served */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 text-center">Stair Recapping Across {city}</h2>
          <p className="text-slate-600 text-center mb-8 max-w-2xl mx-auto leading-relaxed">{neighbourhoodsIntro}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {neighbourhoods.map(n => (
              <span key={n} className="bg-white border border-slate-200 rounded-full px-4 py-1.5 text-sm text-slate-600">{n}</span>
            ))}
          </div>
        </div>
      </section>

      <ServiceGallery
        title="Stair Recapping Transformations"
        subtitle="Real projects from our stair crew across the GTA."
        images={GALLERY_ITEMS}
        galleryLink="View all 47 staircase projects"
        bg="bg-white"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <FinancingBanner monthlyFrom={55} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pt-10 md:pb-16">
        <StaticFAQ
          faqItems={faqItems}
          title="Frequently Asked Questions"
          subtitle={`Common questions about stair recapping in ${city}`}
          schemaId={schemaId}
          skipSchema
        />
        <SpokeLinks title="Explore Related Services" links={spokeLinks} />
        <FinalCTA
          title={`Ready to Recap Your ${city} Staircase?`}
          subtitle="Book a free in-home assessment. We'll confirm your frame can be recapped, show you material options, and quote the full job."
          primaryCTA={{ text: 'Get a Free Stair Quote', route: 'FreeMeasurement' }}
        />
      </div>

      <MobileStickyBtn text="🪜 Get a Free Stair Quote" />
    </div>
  );
}
