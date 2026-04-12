'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPageUrl } from '@/lib/routes';
import StaticFAQ from '@/components/StaticFAQ';
import SpokeLinks from '@/components/SpokeLinks';
import FinancingBanner from '@/components/FinancingBanner';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';
import { stairsImages } from '@/data/galleryImages';

/* ── Inline SVG icons ── */
function PhoneIcon({ className = 'w-5 h-5' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.29 2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}

const GOOGLE_RATING = '4.7';
const GOOGLE_REVIEW_COUNT = 41;

const HERO_IMAGE = 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-4.webp';

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

// Gallery — show transformations
const GALLERY_ITEMS = [
  stairsImages[0],  // Full reno
  stairsImages[7],  // White risers dark treads
  stairsImages[2],  // Recapping
  stairsImages[4],  // Vinyl stair treads with hardwood
  stairsImages[11], // Cherry stain
  stairsImages[9],  // Hardwood stair installation
];

export default function CarpetToHardwoodStairsClient() {
  const [showStickyBtn, setShowStickyBtn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: 'Carpet to Hardwood Stairs' });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowStickyBtn(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-white">
      {/* ─── Dark Hero ─── */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Carpet to hardwood stair conversion showing beautiful dark-stained treads"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-14 md:pb-24">
          <Breadcrumbs items={getStaticBreadcrumbs('/carpet-to-hardwood-stairs')} variant="dark" />

          <div className="flex flex-wrap gap-2 mb-6 mt-2">
            {[
              `⭐ ${GOOGLE_RATING}/5 Google Reviews`,
              '🛡️ WSIB Insured',
              '⏱️ 2-3 Day Turnaround',
              '🎨 Custom Stain Matching',
            ].map(badge => (
              <span key={badge} className="bg-white/10 backdrop-blur-sm text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15">
                {badge}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 max-w-4xl">
            Carpet to Hardwood<br />
            <span className="text-amber-400">Stair Conversion</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
            Ditch the dust-trapping carpet and reveal (or install) beautiful hardwood treads. Professional results, honest pricing, 2-3 day turnaround.
          </p>

          {/* Pricing Pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { value: '$200', label: 'per step (full conversion)' },
              { value: '$185', label: 'per step (recapping)' },
              { value: '~$2,600', label: 'typical 13-step staircase' },
            ].map(pill => (
              <div key={pill.label} className="bg-white/10 backdrop-blur rounded-xl px-4 py-2.5 text-center min-w-[100px]">
                <p className="text-xl md:text-2xl font-black text-amber-400">{pill.value}</p>
                <p className="text-[11px] text-slate-300 leading-tight">{pill.label}</p>
              </div>
            ))}
          </div>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={createPageUrl('FreeMeasurement')}
              className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold text-base px-7 py-3.5 rounded-xl transition-colors"
            >
              Get a Free Stair Quote
            </Link>
            <a
              href="tel:6474281111"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold text-base px-7 py-3.5 rounded-xl border border-white/20 transition-colors"
            >
              <PhoneIcon className="w-4 h-4" />
              (647) 428-1111
            </a>
          </div>
        </div>
      </div>

      {/* ─── The Transformation Story ─── */}
      <section className="pt-10 pb-12 md:pt-14 md:pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Why Convert Your Carpet Stairs?</h2>
          <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">
            Carpet on stairs is the first thing guests see — and the first thing to show wear.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                emoji: '🧹',
                title: 'Health & Cleanliness',
                desc: 'Carpet traps dust, pet dander, allergens, and bacteria deep in the fibres. Hardwood stairs are easy to clean and don\'t harbour allergens.',
              },
              {
                emoji: '📈',
                title: 'Instant Resale Value',
                desc: 'Hardwood stairs are a top-5 home upgrade for resale. Buyers notice stairs immediately — they\'re the centrepiece of most entryways.',
              },
              {
                emoji: '🛡️',
                title: 'Durability & Safety',
                desc: 'Carpet wears on high-traffic stair edges within 3-5 years, creating trip hazards. Hardwood treads with proper nosing are safer and last decades.',
              },
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
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">The Conversion Process</h2>
          <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">From carpet to stunning hardwood in 2-3 days. Here&apos;s exactly how it works.</p>

          <div className="space-y-6 max-w-3xl mx-auto">
            {PROCESS_STEPS.map((s, i) => (
              <div key={s.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 bg-amber-500 text-white rounded-full flex items-center justify-center text-lg flex-shrink-0">
                    {s.icon}
                  </div>
                  {i < PROCESS_STEPS.length - 1 && (
                    <div className="w-0.5 flex-1 bg-amber-200 mt-2" />
                  )}
                </div>
                <div className="pb-2">
                  <h3 className="font-bold text-base text-slate-800 mb-0.5">{s.title}</h3>
                  <p className="text-sm text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Carpet-to-Hardwood Transformations</h2>
          <p className="text-slate-500 text-center mb-8 max-w-2xl mx-auto">
            Real projects from our stair crew across Markham, Toronto & Durham.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {GALLERY_ITEMS.map((img, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                <Image
                  src={img.url}
                  alt={img.alt_text || img.alt || `BBS Flooring stair conversion project ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              href={createPageUrl('Gallery')}
              className="text-amber-600 hover:text-amber-700 font-semibold text-sm underline underline-offset-2"
            >
              View all 47 staircase projects →
            </Link>
          </div>
        </div>
      </section>

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

        <SpokeLinks
          title="Explore Related Services"
          links={SPOKE_LINKS}
        />

        {/* ─── Final CTA ─── */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 text-center text-white mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Ditch the Carpet?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Book a free in-home assessment. We&apos;ll check what&apos;s under your carpet, show you material options, and quote the full job.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={createPageUrl('FreeMeasurement')}
              className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold text-base px-8 py-3.5 rounded-xl transition-colors"
            >
              Get a Free Stair Quote
            </Link>
            <a
              href="tel:6474281111"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-8 py-3.5 rounded-xl border border-white/20 transition-colors"
            >
              <PhoneIcon className="w-4 h-4" />
              (647) 428-1111
            </a>
          </div>
        </div>
      </div>

      {/* ─── Mobile Sticky CTA ─── */}
      {showStickyBtn && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3 shadow-xl safe-area-inset-bottom">
          <Link
            href={createPageUrl('FreeMeasurement')}
            className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl text-center text-base transition-colors"
          >
            🪜 Get a Free Stair Quote
          </Link>
        </div>
      )}
    </div>
  );
}
