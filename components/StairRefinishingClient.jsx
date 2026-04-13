'use client';

import { useEffect } from 'react';
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

const HERO_IMAGE = `${CDN_GALLERY}/stair-project-8.webp`;

const SPOKE_LINKS = [
  { route: 'CarpetToHardwoodStairs', label: 'Carpet to Hardwood Stairs', description: 'Replace worn carpet with beautiful hardwood treads — pricing & process guide' },
  { route: 'Stairs', label: 'Staircase Installation & Renovation', description: 'Full staircase renovation services including treads, railings, and pickets' },
  { route: 'HardwoodRefinishing', label: 'Hardwood Floor Refinishing', description: 'Match your refinished stairs with freshly refinished hardwood floors' },
  { route: 'Installation', label: 'Flooring Installation Services', description: 'Full-service flooring installation from $2.00/sqft' },
  { route: 'Gallery', label: 'Project Gallery', description: 'Browse completed staircase and flooring projects across the GTA' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Free Assessment', desc: 'We inspect your stairs, check wood condition, and discuss your vision — stain colour, finish, railing options.', icon: '📋' },
  { step: '02', title: 'Detailed Quote', desc: 'Transparent per-step pricing. No surprises — you know exactly what it costs before we start.', icon: '💰' },
  { step: '03', title: 'Prep & Sand', desc: 'HEPA-filtered dust-contained sanding. Work area sealed and isolated. Old finish stripped, wood smoothed and prepped.', icon: '🔧' },
  { step: '04', title: 'Stain & Finish', desc: 'Custom stain colour matched to your floors. 2-3 coats of commercial-grade polyurethane.', icon: '🎨' },
  { step: '05', title: 'Final Walkthrough', desc: 'We review every step and riser with you. Not satisfied? We fix it before we leave.', icon: '✅' },
];

const PRICING = [
  { service: 'Stair Recapping (hardwood treads)', price: '$185–$225/step', note: 'Railings, pickets, posts & nosing extra' },
  { service: 'Custom Staining & Refinishing', price: '$125–$150/step', note: 'Includes sanding + 2-3 coats poly' },
  { service: 'Full Carpet-to-Hardwood Conversion', price: '$200–$400/step', note: 'Demo + new treads + stain + finish' },
  { service: 'Railing & Spindle Replacement', price: '$1,500–$5,000+', note: 'Depends on material (iron, glass, wood)' },
];

const FAQ_ITEMS = [
  { question: 'How long does staircase refinishing take?', answer: 'A typical 13-step staircase takes 2–3 days for recapping, or 3–5 days for a full carpet-to-hardwood conversion. Refinishing only (sanding + staining) takes 1–2 days plus drying time. We\'ll give you an exact timeline during the free quote.' },
  { question: 'Can you match my stair treads to my existing floors?', answer: 'Yes. We custom-stain stair treads to match any existing flooring. If we\'re installing your main floors and stairs together, we guarantee a perfect colour match.' },
  { question: 'Is stair recapping cheaper than replacing the whole staircase?', answer: 'Yes, significantly. Recapping installs new hardwood treads and risers over the existing staircase structure, so there\'s no demolition cost. It\'s typically 40–60% less than a full staircase rebuild and looks identical.' },
  { question: 'Do you remove old carpet from stairs?', answer: 'Yes. Carpet removal, tack strip removal, and nail patching are included in our carpet-to-hardwood conversion service. We handle the full job from demo to final coat.' },
  { question: 'What wood species are available for stair treads?', answer: 'We offer red oak, white oak, maple, hickory, and walnut stair treads. Engineered options are also available for compatibility with radiant heat or specific tread thicknesses. Visit our showroom to see samples.' },
];

// Gallery — stair-specific images showing refinishing work
const GALLERY_ITEMS = [
  stairsImages[7],  // White risers dark treads
  stairsImages[3],  // Premium refinishing
  stairsImages[0],  // Stair project 1
  stairsImages[17], // Dark stain refinishing
  stairsImages[1],  // Refinishing with flooring
  stairsImages[10], // Walnut stain
];

export default function StairRefinishingClient() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: 'Stair Refinishing' });
    }
  }, []);

  return (
    <div className="bg-white">
      {/* ─── Dark Hero ─── */}
      <ServiceHero
        heroImage={HERO_IMAGE}
        heroAlt="Professional staircase refinishing with dark stain and white risers"
        breadcrumbPath="/stair-refinishing"
        badges={[
          '⭐ 4.7/5 from 41 Reviews',
          '🛡️ WSIB Insured',
          '🪜 Dedicated Stair Crew',
          '🎨 Custom Stain Matching',
        ]}
        titleLine1="Staircase Refinishing"
        titleLine2="& Renovation"
        subtitle="Transform outdated carpet stairs or worn hardwood into stunning focal points. Custom staining, recapping, and full stair renovations across Markham, Toronto & Durham."
        pricingPills={[
          { value: '$185', label: 'per step recapping' },
          { value: '$125', label: 'per step refinish' },
          { value: 'FREE', label: 'in-home assessment' },
        ]}
        primaryCTA={{ text: 'Get a Free Stair Quote', route: 'FreeMeasurement' }}
      />

      {/* ─── Services Overview ─── */}
      <section className="pt-10 pb-12 md:pt-14 md:pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">What We Do</h2>
          <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">
            Whether your stairs need a fresh coat, new treads, or a complete transformation — we handle every type of staircase work.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { emoji: '🎨', title: 'Sanding & Refinishing', desc: 'Strip old finish, sand smooth, custom stain, and apply 2-3 coats of commercial-grade polyurethane. Restore faded or scratched stairs to like-new.' },
              { emoji: '🪜', title: 'Stair Recapping', desc: 'Install new hardwood or vinyl treads and risers over existing structure. Faster and 40-60% cheaper than full replacement — looks identical.' },
              { emoji: '✂️', title: 'Carpet Removal + Hardwood', desc: 'Remove old carpet, prep the structure, install new hardwood treads, custom stain, and finish. Complete transformation in 2-3 days.' },
              { emoji: '🔩', title: 'Railings & Spindles', desc: 'Modern iron pickets, glass panels, or refreshed wood railings. We coordinate the full staircase look — treads, risers, and railing together.' },
            ].map(s => (
              <div key={s.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <div className="text-3xl mb-3">{s.emoji}</div>
                <h3 className="font-bold text-lg text-slate-800 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Process Stepper ─── */}
      <ServiceProcess
        title="Our Refinishing Process"
        subtitle="Dust-contained sanding, custom staining, and professional-grade finishes — every step handled with care."
        steps={PROCESS_STEPS}
      />

      {/* ─── Pricing ─── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Transparent Pricing</h2>
          <p className="text-slate-500 text-center mb-8 max-w-xl mx-auto">Per-step pricing. No hidden fees. A typical 13-step staircase runs $2,000–$4,500.</p>

          <div className="space-y-3">
            {PRICING.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 hover:border-amber-300 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{item.service}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>
                </div>
                <p className="text-lg font-bold text-amber-600 whitespace-nowrap ml-4">{item.price}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            All prices in CAD. Final quote provided after free in-home assessment. Includes furniture protection.
          </p>
        </div>
      </section>

      {/* ─── Why BBS ─── */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-8 text-center">Why Choose BBS for Your Staircase</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              { emoji: '🎨', title: 'Perfect Colour Match', desc: 'We match your stairs to your existing floors — same stain, same finish, seamless result.' },
              { emoji: '💨', title: 'Dust-Contained Sanding', desc: 'HEPA-filtered vacuums on every sander plus sealed work areas. Dramatically less dust than traditional sanding.' },
              { emoji: '🏠', title: 'One-Stop Shop', desc: 'Floors + stairs + trim in one project = better pricing and a perfectly coordinated look.' },
              { emoji: '🛡️', title: 'WSIB Insured', desc: 'Full WSIB workplace insurance + commercial liability. You\'re never liable during our work.' },
              { emoji: '⏱️', title: 'Fast Turnaround', desc: 'Most staircases completed in 2-3 days. We respect your home and your schedule.' },
              { emoji: '💰', title: '0% Financing', desc: 'Spread the cost with 0% financing. Combine stairs + floors for the best monthly payment.' },
            ].map(item => (
              <div key={item.title} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-2xl mb-2">{item.emoji}</div>
                <h3 className="font-bold text-sm text-slate-800 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Project Gallery ─── */}
      <ServiceGallery
        title="Our Staircase Work"
        subtitle="Real staircase refinishing and renovation projects by our crew."
        images={GALLERY_ITEMS}
        galleryLink="View all 47 staircase projects"
      />

      {/* ─── Financing ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <FinancingBanner monthlyFrom={65} />
      </div>

      {/* ─── FAQ ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pt-10 md:pb-16">
        <StaticFAQ
          faqItems={FAQ_ITEMS}
          title="Frequently Asked Questions"
          subtitle="Common questions about staircase refinishing and renovation"
          schemaId="faq-stair-refinishing"
          skipSchema
        />

        <SpokeLinks title="Explore Related Services" links={SPOKE_LINKS} />

        {/* ─── Final CTA ─── */}
        <FinalCTA
          title="Ready to Transform Your Staircase?"
          subtitle="Book a free in-home assessment. We'll inspect your stairs, show you stain samples, and provide a detailed quote."
          primaryCTA={{ text: 'Get a Free Stair Quote', route: 'FreeMeasurement' }}
        />
      </div>

      {/* ─── Mobile Sticky CTA ─── */}
      <MobileStickyBtn text="🪜 Get a Free Stair Quote" />
    </div>
  );
}
