'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import StaticFAQ from '@/components/StaticFAQ';
import SpokeLinks from '@/components/SpokeLinks';
import FinancingBanner from '@/components/FinancingBanner';
import { stairsImages } from '@/data/galleryImages';
import { CDN_GALLERY } from '@/lib/service-constants';
import {
  ServiceHero,
  ServiceProcess,
  ServiceGallery,
  FinalCTA,
  MobileStickyBtn,
} from '@/components/service';

/* ── Page Data ── */

const HERO_IMAGE = `${CDN_GALLERY}/stair-project-4.webp`;

const SPOKE_LINKS = [
  { route: 'StairRefinishing', label: 'Staircase Refinishing & Staining', description: 'Already have hardwood stairs? Restore them with professional sanding, staining & finishing' },
  { route: 'Stairs', label: 'Staircase Installation & Renovation', description: 'Full staircase renovation — treads, railings, pickets, and complete transformations' },
  { route: 'CarpetRemoval', label: 'Carpet Removal Service', description: 'Professional carpet removal starting at $1.00/sqft for floors' },
  { route: 'Installation', label: 'Flooring Installation Services', description: 'Full-service flooring installation from $2.00/sqft' },
  { route: 'Gallery', label: 'Project Gallery', description: 'Browse completed staircase and flooring projects across the GTA' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Carpet Removal', desc: 'We rip out all carpet, underpad, tack strips, and staples. The substructure is cleaned and inspected.', icon: '✂️' },
  { step: '02', title: 'Structure Assessment', desc: 'We check every stringer, tread, and riser. About 60% of the time, the wood underneath is salvageable.', icon: '🔍' },
  { step: '03', title: 'New Treads & Risers', desc: 'If the wood underneath isn\'t salvageable, we install new hardwood treads and risers — recapped right over the structure.', icon: '🪜' },
  { step: '04', title: 'Custom Staining', desc: 'Choose from dozens of stain colours. We apply test patches on your actual stairs so you approve the exact shade.', icon: '🎨' },
  { step: '05', title: 'Finish & Protect', desc: '2-3 coats of commercial-grade polyurethane. Your new hardwood stairs are durable, beautiful, and built to last.', icon: '✨' },
];

const FAQ_ITEMS = [
  { question: 'How much does it cost to convert carpet stairs to hardwood?', answer: 'A full carpet-to-hardwood conversion costs $200–$400 per step, including carpet removal, new hardwood treads and risers, staining, and finish. A typical 13-step staircase runs $2,600–$5,200 total. Call (647) 428-1111 for a free quote.' },
  { question: 'How long does carpet to hardwood stair conversion take?', answer: 'Most standard 13-step staircases take 2–3 days. This includes carpet removal, prep, installation, staining, and at least one coat of polyurethane. An additional day of drying may be needed before heavy use.' },
  { question: 'Can you match stair treads to my existing hardwood floors?', answer: 'Yes. We custom-stain stair treads to match your existing floors. If you\'re doing floors and stairs together, we guarantee a perfect match since we\'re using the same materials and stain.' },
  { question: 'What\'s under my carpet stairs?', answer: 'About 60% of the time, there\'s salvageable plywood or hardwood underneath. In either case, we can make your stairs beautiful — either by refinishing the existing wood or recapping with new hardwood treads. We assess this during the free in-home visit.' },
  { question: 'Do you serve Pickering and Toronto for stair renovations?', answer: 'Yes. BBS Flooring installs stairs across the GTA including Markham, Pickering, Ajax, Toronto, Scarborough, Richmond Hill, Vaughan, and Durham Region.' },
  { question: 'Can I get vinyl stair caps instead of hardwood?', answer: 'Yes. Vinyl stair caps are a more budget-friendly option that still looks great. They\'re especially popular when the main floors are vinyl plank — everything matches perfectly. Ask about vinyl stair options during your free assessment.' },
];

const GALLERY_ITEMS = [
  stairsImages[0],
  stairsImages[7],
  stairsImages[2],
  stairsImages[4],
  stairsImages[11],
  stairsImages[9],
];

export default function CarpetToHardwoodStairsClient() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: 'Carpet to Hardwood Stairs' });
    }
  }, []);

  return (
    <div className="bg-white">
      {/* ─── Dark Hero ─── */}
      <ServiceHero
        heroImage={HERO_IMAGE}
        heroAlt="Carpet to hardwood stair conversion showing beautiful dark-stained treads"
        breadcrumbPath="/carpet-to-hardwood-stairs"
        badges={[
          '⭐ 4.7/5 Google Reviews',
          '🛡️ WSIB Insured',
          '⏱️ 2-3 Day Turnaround',
          '🎨 Custom Stain Matching',
        ]}
        titleLine1="Carpet to Hardwood"
        titleLine2="Stair Conversion"
        subtitle="Ditch the dust-trapping carpet and reveal (or install) beautiful hardwood treads. Professional results, honest pricing, 2-3 day turnaround."
        pricingPills={[
          { value: '$200', label: 'per step (full conversion)' },
          { value: '$185', label: 'per step (recapping)' },
          { value: '~$2,600', label: 'typical 13-step staircase' },
        ]}
        primaryCTA={{ text: 'Get a Free Stair Quote', route: 'FreeMeasurement' }}
      />

      {/* ─── Why Convert ─── */}
      <section className="pt-10 pb-12 md:pt-14 md:pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Why Convert Your Carpet Stairs?</h2>
          <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">
            Carpet on stairs is the first thing guests see — and the first thing to show wear.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: '🧹', title: 'Health & Cleanliness', desc: 'Carpet traps dust, pet dander, allergens, and bacteria deep in the fibres. Hardwood stairs are easy to clean and don\'t harbour allergens.' },
              { emoji: '📈', title: 'Instant Resale Value', desc: 'Hardwood stairs are a top-5 home upgrade for resale. Buyers notice stairs immediately — they\'re the centrepiece of most entryways.' },
              { emoji: '🛡️', title: 'Durability & Safety', desc: 'Carpet wears on high-traffic stair edges within 3-5 years, creating trip hazards. Hardwood treads with proper nosing are safer and last decades.' },
            ].map(item => (
              <div key={item.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="font-bold text-lg text-slate-800 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What's Under Your Carpet? ─── */}
      <section className="py-12 md:py-16 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">What&apos;s Under Your Carpet?</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
            About <strong>60% of the time</strong>, there&apos;s usable wood underneath carpet stairs — plywood stringers or even original hardwood treads.
            The other 40% have damaged or low-grade wood that needs recapping.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-white border border-amber-200 rounded-xl p-5">
              <p className="text-amber-600 font-bold text-lg mb-1">60% — Salvageable</p>
              <p className="text-sm text-slate-500">Sand, stain & finish the existing wood. Most affordable option.</p>
            </div>
            <div className="bg-white border border-amber-200 rounded-xl p-5">
              <p className="text-amber-600 font-bold text-lg mb-1">40% — Needs Recapping</p>
              <p className="text-sm text-slate-500">New hardwood treads installed over the structure. Still faster & cheaper than full rebuild.</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-4">We assess this during the free in-home visit — no commitment required.</p>
        </div>
      </section>

      {/* ─── Process Stepper ─── */}
      <ServiceProcess
        title="The Conversion Process"
        subtitle="From carpet to stunning hardwood in 2-3 days. Here's exactly how it works."
        steps={PROCESS_STEPS}
      />

      {/* ─── Pricing ─── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Conversion Pricing</h2>
          <p className="text-slate-500 text-center mb-8 max-w-xl mx-auto">Honest per-step pricing. The final quote depends on step count, material, and railing work.</p>

          <div className="space-y-3">
            {[
              { service: 'Basic Recapping (over existing structure)', price: '$185–$300/step', note: 'New hardwood treads + risers installed over structure' },
              { service: 'Full Conversion (carpet removal + hardwood)', price: '$200–$400/step', note: 'Demo + prep + new treads + stain + finish' },
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

          {/* Example estimate */}
          <div className="mt-8 bg-slate-800 text-white rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-3">📝 Example: Typical 13-Step Staircase</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-300">13 steps × $200 (full conversion)</span><span className="font-semibold">$2,600</span></div>
              <div className="flex justify-between"><span className="text-slate-300">Custom stain (included)</span><span className="font-semibold">$0</span></div>
              <div className="flex justify-between"><span className="text-slate-300">26 iron pickets × $25</span><span className="font-semibold">$650</span></div>
              <div className="flex justify-between border-t border-slate-600 pt-2 mt-2"><span className="font-bold text-amber-400">Total estimate</span><span className="font-bold text-amber-400 text-lg">$3,250</span></div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Actual pricing varies based on step shape (straight vs. pie), material choice, and railing scope. Free in-home quote provided.</p>
          </div>
        </div>
      </section>

      {/* ─── Project Gallery ─── */}
      <ServiceGallery
        title="Carpet-to-Hardwood Transformations"
        subtitle="Real projects from our stair crew across Markham, Toronto & Durham."
        images={GALLERY_ITEMS}
        galleryLink="View all 47 staircase projects"
        bg="bg-slate-50"
      />

      {/* ─── Financing ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <FinancingBanner monthlyFrom={55} />
      </div>

      {/* ─── FAQ ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pt-10 md:pb-16">
        <StaticFAQ
          faqItems={FAQ_ITEMS}
          title="Frequently Asked Questions"
          subtitle="Common questions about converting carpet stairs to hardwood"
          schemaId="faq-carpet-to-hardwood-stairs"
          skipSchema
        />

        <SpokeLinks title="Explore Related Services" links={SPOKE_LINKS} />

        {/* ─── Final CTA ─── */}
        <FinalCTA
          title="Ready to Ditch the Carpet?"
          subtitle="Book a free in-home assessment. We'll check what's under your carpet, show you material options, and quote the full job."
          primaryCTA={{ text: 'Get a Free Stair Quote', route: 'FreeMeasurement' }}
        />
      </div>

      {/* ─── Mobile Sticky CTA ─── */}
      <MobileStickyBtn text="🪜 Get a Free Stair Quote" />
    </div>
  );
}
