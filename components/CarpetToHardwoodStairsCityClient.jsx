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

const HERO_IMAGE = `${CDN_GALLERY}/stair-project-4.webp`;

const PROCESS_STEPS = [
  { step: '01', title: 'Carpet Removal', desc: 'We rip out all carpet, underpad, tack strips, and staples. The substructure is cleaned and inspected.', icon: '✂️' },
  { step: '02', title: 'Structure Assessment', desc: 'We check what\'s under the carpet. Solid hardwood treads in good shape can be refinished; plywood or MDF treads are recapped with new hardwood.', icon: '🔍' },
  { step: '03', title: 'New Treads & Risers (if needed)', desc: 'New solid hardwood treads are installed over the existing structure — faster and cheaper than a full rebuild and looks identical.', icon: '🪜' },
  { step: '04', title: 'Custom Staining', desc: 'Choose from dozens of stain colours. We apply test patches on your actual stairs so you approve the exact shade.', icon: '🎨' },
  { step: '05', title: 'Finish & Protect', desc: '2-3 coats of commercial-grade polyurethane. Durable, beautiful hardwood stairs built to last.', icon: '✨' },
];

const GALLERY_ITEMS = [stairsImages[0], stairsImages[7], stairsImages[2], stairsImages[4], stairsImages[11], stairsImages[9]];

/**
 * Shared client for city-qualified carpet-to-hardwood stair pages.
 * All city-specific content comes from the `data` prop — the page copy is genuinely
 * unique per city (intro, why-here, neighbourhoods, FAQs, related links).
 */
export default function CarpetToHardwoodStairsCityClient({ data }) {
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
      window.gtag('event', 'view_item_list', { item_list_name: `Carpet to Hardwood Stairs ${city}` });
    }
  }, [city]);

  return (
    <div className="bg-white">
      <ServiceHero
        heroImage={HERO_IMAGE}
        heroAlt={`Carpet to hardwood stair conversion in ${city}`}
        breadcrumbPath={breadcrumbPath}
        badges={['⭐ 4.7/5 Google Reviews', '🛡️ WSIB Insured', '⏱️ 2-3 Day Turnaround', '🎨 Custom Stain Matching']}
        titleLine1="Carpet to Hardwood Stairs"
        titleLine2={`in ${city}`}
        subtitle={heroSubtitle}
        pricingPills={[
          { value: '$185', label: 'per step (new treads)' },
          { value: '$125', label: 'per step (refinish existing)' },
          { value: '~$2,700', label: 'typical 13-step conversion' },
        ]}
        primaryCTA={{ text: 'Get a Free Stair Quote', route: 'FreeMeasurement' }}
      />

      <AnswerBlock question={`Carpet to hardwood stairs in ${city} — what does it cost?`}>
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

      {/* What's under your carpet */}
      <section className="py-12 md:py-16 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">What&apos;s Under Your Carpet?</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
            Older {city} homes often have solid hardwood treads under that carpet — refinishable at $125/step. Most newer homes have plywood treads, which can&apos;t be refinished and need new hardwood recapping at $185/step. Either way, the structure stays and we build beautiful stairs over it.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-white border border-amber-200 rounded-xl p-5">
              <p className="text-amber-600 font-bold text-lg mb-1">Solid Hardwood Treads</p>
              <p className="text-sm text-slate-500">Sand, stain &amp; finish the existing wood. $125/step — most affordable option.</p>
            </div>
            <div className="bg-white border border-amber-200 rounded-xl p-5">
              <p className="text-amber-600 font-bold text-lg mb-1">Plywood or MDF Treads</p>
              <p className="text-sm text-slate-500">New hardwood treads installed over the structure. $185/step (carpet removal included).</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-4">We assess this during the free in-home visit — no commitment required.</p>
        </div>
      </section>

      <ServiceProcess
        title="The Conversion Process"
        subtitle={`From carpet to stunning hardwood in 2-3 days across ${city}.`}
        steps={PROCESS_STEPS}
      />

      {/* Pricing */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">{city} Conversion Pricing</h2>
          <p className="text-slate-500 text-center mb-8 max-w-xl mx-auto">Honest per-step pricing. The final quote depends on step count, material, and railing work.</p>
          <div className="space-y-3">
            {[
              { service: 'New Straight Treads (Recapping)', price: '$185/step', note: 'New hardwood treads installed over structure' },
              { service: 'New Pie / Triangle / Bullnose Steps', price: '$225/step', note: 'Specialty step shapes' },
              { service: 'Refinish Existing Treads', price: '$125/step', note: 'Only if solid hardwood treads underneath' },
              { service: 'Custom Staining', price: 'Included', note: 'Colour-matched to your existing floors' },
              { service: 'Railing Upgrades (iron spindles)', price: '$25/picket installed', note: 'Modern iron pickets with material included' },
              { service: 'New Nosing', price: '$30/ft', note: 'Stair nose transition to match flooring' },
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
            <h3 className="font-bold text-lg mb-3">📝 Example: Typical 13-Step {city} Staircase</h3>
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
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 text-center">Stair Conversions Across {city}</h2>
          <p className="text-slate-600 text-center mb-8 max-w-2xl mx-auto leading-relaxed">{neighbourhoodsIntro}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {neighbourhoods.map(n => (
              <span key={n} className="bg-white border border-slate-200 rounded-full px-4 py-1.5 text-sm text-slate-600">{n}</span>
            ))}
          </div>
        </div>
      </section>

      <ServiceGallery
        title="Carpet-to-Hardwood Transformations"
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
          subtitle={`Common questions about converting carpet stairs to hardwood in ${city}`}
          schemaId={schemaId}
          skipSchema
        />
        <SpokeLinks title="Explore Related Services" links={spokeLinks} />
        <FinalCTA
          title={`Ready to Ditch the Carpet in ${city}?`}
          subtitle="Book a free in-home assessment. We'll check what's under your carpet, show you material options, and quote the full job."
          primaryCTA={{ text: 'Get a Free Stair Quote', route: 'FreeMeasurement' }}
        />
      </div>

      <MobileStickyBtn text="🪜 Get a Free Stair Quote" />
    </div>
  );
}
