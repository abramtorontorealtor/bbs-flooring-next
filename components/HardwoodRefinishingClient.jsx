'use client';

import { useEffect } from 'react';
import StaticFAQ from '@/components/StaticFAQ';
import SpokeLinks from '@/components/SpokeLinks';
import FinancingBanner from '@/components/FinancingBanner';
import { flooringImages } from '@/data/galleryImages';
import { CDN_GALLERY } from '@/lib/service-constants';
import {
  ServiceHero,
  ServiceProcess,
  ServiceGallery,
  ServiceAreaPills,
  FinalCTA,
  MobileStickyBtn,
} from '@/components/service';

/* ── Page Data ── */

const HERO_IMAGE = `${CDN_GALLERY}/flooring-project-10.webp`;

const SPOKE_LINKS = [
  { route: 'StairRefinishing', label: 'Stair Refinishing & Renovation', description: 'Match your freshly refinished floors with beautifully restored staircases' },
  { route: 'Installation', label: 'Flooring Installation Services', description: 'New flooring installation from $2.00/sqft — hardwood, vinyl, laminate' },
  { route: 'EngineeredHardwood', label: 'Engineered Hardwood Flooring', description: 'Browse 200+ engineered hardwood styles if replacement is the right call' },
  { route: 'SolidHardwood', label: 'Solid Hardwood Flooring', description: 'Premium solid hardwood starting from $5.69/sqft' },
  { route: 'Gallery', label: 'Project Gallery', description: 'Browse completed flooring and staircase projects across the GTA' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Free In-Home Assessment', desc: 'We inspect your floors, test wood thickness and wear layer, identify damage, and discuss your goals — natural, dark stain, matte, satin, or gloss.', icon: '📋' },
  { step: '02', title: 'Detailed Quote', desc: 'Transparent per-sqft pricing based on your exact floor area, wood condition, and chosen finish. No surprises — you approve before we start.', icon: '💰' },
  { step: '03', title: 'Dust-Contained Sanding', desc: 'HEPA-filtered vacuum attachments on every sander significantly reduce airborne dust. We still seal and isolate the work area for a clean result. Old finish stripped, wood smoothed to an even surface.', icon: '💨' },
  { step: '04', title: 'Stain Application', desc: 'Choose from dozens of stain colours. We apply test patches on your actual floor so you approve the exact shade before we proceed.', icon: '🎨' },
  { step: '05', title: 'Polyurethane Finish', desc: '2–3 coats of commercial-grade oil-based or water-based polyurethane. Each coat sanded between applications for maximum adhesion and durability.', icon: '🛡️' },
  { step: '06', title: 'Final Walkthrough', desc: 'We inspect every square foot with you. Not satisfied? We address it before we leave. Your floors are guaranteed to meet your expectations.', icon: '✅' },
];

const PRICING = [
  { service: 'Sand & Refinish (Natural)', price: '$5.25/sqft', note: 'Sand existing finish, apply 2-3 coats polyurethane' },
  { service: 'Sand, Stain & Refinish', price: '$6.25/sqft', note: 'Includes custom stain colour + 2-3 coats poly' },
];

const REFINISH_VS_REPLACE = {
  refinish: [
    'Surface scratches, scuffs, or dull finish',
    'You want a new stain colour or sheen level',
    'The wood is structurally sound (wear layer > 1mm)',
    'You love the character and patina of your floors',
    'Budget is a priority — refinishing is 60–75% cheaper',
  ],
  replace: [
    'Deep water damage, warping, or buckling',
    'Wood has been sanded too many times (< 1mm wear layer)',
    'You want a different species or plank width entirely',
    'Subfloor damage requires full tear-out',
    'Boards are delaminating (engineered) or cupping severely',
  ],
};

const FAQ_ITEMS = [
  { question: 'How much does hardwood floor refinishing cost in Markham?', answer: 'Sand & refinish (natural) is $5.25/sqft. Sand, stain & refinish is $6.25/sqft. A typical 1,000 sqft main floor runs $5,250–$6,250. Call (647) 428-1111 for a free in-home quote tailored to your specific floors.' },
  { question: 'How long does hardwood refinishing take?', answer: 'A typical 1,000 sqft floor takes 3–5 days: 1 day sanding, 1 day staining (if applicable), and 1–2 days for polyurethane coats with drying time between each. Water-based finishes dry faster (2–3 hours between coats) than oil-based (8–12 hours).' },
  { question: 'How dusty is the sanding process?', answer: 'We use HEPA-filtered vacuum attachments connected directly to the sander, which significantly reduces airborne dust compared to traditional sanding. That said, it\'s not dust-free — we seal off the work area and isolate rooms to keep the rest of your home clean. Expect some fine dust in the immediate work zone, but nothing like old-school sanding.' },
  { question: 'Can engineered hardwood be refinished?', answer: 'It depends on the wear layer thickness. Engineered hardwood with a 2mm+ wear layer can typically be sanded and refinished once. Premium products (like Vidar with 4mm wear layers) can be refinished 2–3 times. We measure your wear layer during the free assessment.' },
  { question: 'Oil-based vs water-based polyurethane — which is better?', answer: 'Oil-based adds a warm amber tone, is more durable, and costs slightly more. Water-based dries clear (no yellowing), dries faster (walk on it the same day), and has lower VOC. Most GTA homeowners choose water-based for lighter wood and oil-based for a classic warm look. We carry both.' },
  { question: 'How soon can I put furniture back after refinishing?', answer: 'Light foot traffic (socks only) is usually safe after 24 hours for water-based finish, or 48 hours for oil-based. Furniture can go back after 72 hours (water-based) or 5–7 days (oil-based). Area rugs should wait 2 weeks. We\'ll give you exact timelines based on your finish choice.' },
  { question: 'Do you refinish hardwood floors in Toronto and Durham?', answer: 'Yes. BBS Flooring refinishes hardwood floors across the GTA including Markham, Toronto, Scarborough, Pickering, Ajax, Whitby, Richmond Hill, Vaughan, and all of Durham Region. Free in-home assessments anywhere in our service area.' },
];

const GALLERY_ITEMS = [
  flooringImages[9],
  flooringImages[0],
  flooringImages[5],
  flooringImages[3],
  flooringImages[8],
  flooringImages[7],
];

export default function HardwoodRefinishingClient() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: 'Hardwood Refinishing' });
    }
  }, []);

  return (
    <div className="bg-white">
      {/* ─── Dark Hero ─── */}
      <ServiceHero
        heroImage={HERO_IMAGE}
        heroAlt="Professional hardwood floor refinishing — glossy finished hardwood in Markham home"
        breadcrumbPath="/hardwood-refinishing"
        badges={[
          '⭐ 4.7/5 from 41 Reviews',
          '🛡️ WSIB Insured',
          '💨 Dust-Contained Sanding',
          '📏 Free In-Home Assessment',
        ]}
        titleLine1="Hardwood Floor"
        titleLine2="Refinishing"
        subtitle="Scratched, faded, or worn hardwood doesn't need replacing — it needs refinishing. Professional dust-contained sanding, custom staining, and commercial-grade finishes across Markham, Toronto & the GTA."
        pricingPills={[
          { value: '$5.25', label: 'per sqft natural' },
          { value: '$6.25', label: 'per sqft with stain' },
          { value: 'FREE', label: 'in-home assessment' },
        ]}
        primaryCTA={{ text: 'Book a Free Assessment', route: 'FreeMeasurement' }}
      />

      {/* ─── The Savings Pitch ─── */}
      <section className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { icon: '💰', stat: '60–75%', label: 'Cheaper Than Replacement', desc: 'A 1,000 sqft refinish runs $5,250–$6,250 vs $7,250–$14,250 for new hardwood.' },
              { icon: '🏠', stat: '3–5 Days', label: 'Typical Timeline', desc: 'Most main floor refinishing projects completed in under a week.' },
              { icon: '🌳', stat: '25+ Years', label: 'Extended Floor Life', desc: 'A properly refinished hardwood floor lasts decades longer.' },
            ].map(item => (
              <div key={item.label}>
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-2xl md:text-3xl font-black text-amber-700">{item.stat}</p>
                <p className="font-bold text-sm text-slate-800 mt-1">{item.label}</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What We Handle ─── */}
      <section className="pt-10 pb-12 md:pt-14 md:pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">What We Refinish</h2>
          <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">
            Single rooms to full homes. Solid or engineered. Old oak or modern white oak. We restore them all.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { emoji: '🪵', title: 'Solid Hardwood', desc: 'Red oak, white oak, maple, hickory, walnut — classic solid floors refinished to perfection. Can be sanded 5+ times over its lifetime.' },
              { emoji: '🏗️', title: 'Engineered Hardwood', desc: 'Premium engineered with 2mm+ wear layers can be refinished 1–3 times. We measure your wear layer before proceeding — no guesswork.' },
              { emoji: '🎨', title: 'Colour Changes', desc: 'Transform light oak to rich walnut, or go from dark to Scandinavian white. Full sand-down + new stain + fresh polyurethane.' },
              { emoji: '💧', title: 'Water Damage Repair', desc: 'Black water stains, cupping, and minor warping. We replace damaged boards, bleach stains, and blend the repair seamlessly.' },
              { emoji: '🐾', title: 'Pet Damage Restoration', desc: 'Deep scratches, urine stains, worn traffic paths. We sand past the damage, treat stains, and apply extra-durable finish coats.' },
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
        subtitle="From assessment to final walkthrough — every step handled with precision and care."
        steps={PROCESS_STEPS}
      />

      {/* ─── Pricing ─── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Transparent Pricing</h2>
          <p className="text-slate-500 text-center mb-8 max-w-xl mx-auto">
            Refinishing is 60–75% cheaper than replacement. Here&apos;s what it costs.
          </p>

          <div className="space-y-3">
            {PRICING.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 hover:border-amber-300 transition-colors">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{item.service}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>
                </div>
                <p className="text-lg font-bold text-amber-600 whitespace-nowrap ml-4">{item.price}</p>
              </div>
            ))}
          </div>

          {/* Example Estimate */}
          <div className="mt-8 bg-slate-800 text-white rounded-2xl p-6 md:p-8">
            <h3 className="font-bold text-lg mb-4">📐 Example: 1,000 sqft Main Floor Refinish</h3>
            <div className="space-y-2 text-sm">
              {[
                { item: 'Sand & stain (custom colour)', calc: '1,000 sqft × $6.25', total: '$6,250' },
                { item: 'Furniture moving (included)', calc: 'Included', total: '$0' },
                { item: 'Floor prep & dust containment', calc: 'Included', total: '$0' },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-slate-700 last:border-0">
                  <span className="text-slate-300">{row.item}</span>
                  <span className="font-semibold text-amber-400">{row.total}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-600">
                <span className="font-bold text-white">Total Estimate</span>
                <span className="text-xl font-black text-amber-400">$6,250</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Compare: new engineered hardwood installation for the same area would run $7,250–$14,250 (material + labour).
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            All prices in CAD including HST. Final quote after free in-home assessment. Includes furniture protection &amp; dust containment.
          </p>
        </div>
      </section>

      {/* ─── Refinish vs Replace ─── */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">When to Refinish vs. Replace</h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">
            Not sure if your floors need refinishing or full replacement? Here&apos;s how to tell.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center text-lg flex-shrink-0">✓</div>
                <h3 className="font-bold text-lg text-emerald-800">Refinish If…</h3>
              </div>
              <ul className="space-y-3">
                {REFINISH_VS_REPLACE.refinish.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-lg flex-shrink-0">✕</div>
                <h3 className="font-bold text-lg text-red-800">Replace If…</h3>
              </div>
              <ul className="space-y-3">
                {REFINISH_VS_REPLACE.replace.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-red-500 font-bold mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Not sure? Our free in-home assessment will tell you exactly what your floors need. We always recommend refinishing when it&apos;s the right call — it saves you money and preserves your original floors.
          </p>
        </div>
      </section>

      {/* ─── Stain & Finish Options ─── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Stain &amp; Finish Options</h2>
          <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">
            Your floors, your look. We carry a full range of stain colours and finish sheens.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-slate-800 mb-4">🎨 Popular Stain Colours</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Natural', color: 'bg-amber-100 text-amber-800' },
                  { name: 'Golden Oak', color: 'bg-amber-200 text-amber-900' },
                  { name: 'Provincial', color: 'bg-amber-300 text-amber-900' },
                  { name: 'Early American', color: 'bg-amber-400 text-amber-950' },
                  { name: 'Special Walnut', color: 'bg-amber-600 text-white' },
                  { name: 'Dark Walnut', color: 'bg-amber-800 text-white' },
                  { name: 'Jacobean', color: 'bg-amber-900 text-white' },
                  { name: 'Ebony', color: 'bg-slate-800 text-white' },
                  { name: 'Classic Grey', color: 'bg-slate-400 text-white' },
                  { name: 'Weathered Oak', color: 'bg-stone-400 text-white' },
                ].map(stain => (
                  <span key={stain.name} className={`${stain.color} text-xs font-semibold px-3 py-1.5 rounded-full`}>
                    {stain.name}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-4">We carry Minwax, Bona, and Rubio Monocoat stains. Test patches applied on your floor before committing.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-slate-800 mb-4">🛡️ Finish Types</h3>
              <div className="space-y-3">
                {[
                  { name: 'Oil-Based Polyurethane', pros: 'Warmest look, most durable, amber glow', dry: '8–12 hrs between coats' },
                  { name: 'Water-Based Polyurethane', pros: 'Crystal clear, low VOC, fast dry', dry: '2–3 hrs between coats' },
                  { name: 'Hardwax Oil (Rubio)', pros: 'Natural matte, easy spot repair', dry: '24 hrs' },
                  { name: 'Satin / Matte / Gloss', pros: 'Choose your sheen — satin is most popular', dry: 'Available in all formulas' },
                ].map(finish => (
                  <div key={finish.name} className="text-sm">
                    <p className="font-semibold text-slate-800">{finish.name}</p>
                    <p className="text-xs text-slate-500">{finish.pros} · {finish.dry}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why BBS ─── */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-8 text-center">Why Choose BBS for Refinishing</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              { emoji: '💨', title: 'Dust-Contained Sanding', desc: 'HEPA-filtered vacuums on every sander plus sealed work areas. Dramatically less dust than traditional sanding.' },
              { emoji: '🎨', title: 'Stain Matching', desc: 'We match your refinished floors to existing trim, stairs, and adjacent rooms — seamless colour throughout.' },
              { emoji: '🛡️', title: 'WSIB Insured', desc: 'Full WSIB workplace insurance + commercial liability. You\'re never liable during our work in your home.' },
              { emoji: '🏠', title: 'Floors + Stairs Together', desc: 'Refinish floors and stairs in one project for the best pricing and a perfectly coordinated look.' },
              { emoji: '📐', title: '12+ Years Experience', desc: 'Over 2,000 refinishing and installation projects completed across the GTA since 2012.' },
              { emoji: '💰', title: '0% Financing Available', desc: 'Spread the cost with 0% financing options. Combine refinishing + new flooring for the best monthly payment.' },
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
        title="Our Flooring Work"
        subtitle="Real hardwood refinishing and installation projects by our crew across the GTA."
        images={GALLERY_ITEMS}
        galleryLink="View all projects in our gallery"
      />

      {/* ─── Service Area ─── */}
      <ServiceAreaPills
        title="Hardwood Refinishing Across the GTA"
        subtitle="Free in-home assessments anywhere in our service area. Same-day quotes available."
        bg="bg-slate-50"
      />

      {/* ─── Financing ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <FinancingBanner monthlyFrom={85} />
      </div>

      {/* ─── FAQ ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pt-10 md:pb-16">
        <StaticFAQ
          faqItems={FAQ_ITEMS}
          title="Frequently Asked Questions"
          subtitle="Common questions about hardwood floor refinishing"
          schemaId="faq-hardwood-refinishing"
          skipSchema
        />

        <SpokeLinks title="Explore Related Services" links={SPOKE_LINKS} />

        {/* ─── Final CTA ─── */}
        <FinalCTA
          title="Ready to Restore Your Hardwood Floors?"
          subtitle="Book a free in-home assessment. We'll inspect your floors, show you stain samples, and provide a detailed quote — no obligation."
          primaryCTA={{ text: 'Book a Free Assessment', route: 'FreeMeasurement' }}
        />
      </div>

      {/* ─── Mobile Sticky CTA ─── */}
      <MobileStickyBtn text="🏠 Book Free Assessment" />
    </div>
  );
}
