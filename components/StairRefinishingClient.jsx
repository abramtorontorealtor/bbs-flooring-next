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
function StarIcon({ className = 'w-5 h-5' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>;
}

const GOOGLE_RATING = '4.7';
const GOOGLE_REVIEW_COUNT = 41;

const HERO_IMAGE = 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-8.webp';

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
  { step: '03', title: 'Prep & Sand', desc: 'Dustless sanding system captures 99% of dust. Old finish stripped, wood smoothed and prepped.', icon: '🔧' },
  { step: '04', title: 'Stain & Finish', desc: 'Custom stain colour matched to your floors. 2-3 coats of commercial-grade polyurethane.', icon: '🎨' },
  { step: '05', title: 'Final Walkthrough', desc: 'We review every step and riser with you. Not satisfied? We fix it before we leave.', icon: '✅' },
];

const PRICING = [
  { service: 'Stair Recapping (hardwood treads)', price: '$125–$225/step', note: 'Railings, pickets, posts & nosing extra' },
  { service: 'Custom Staining & Refinishing', price: '$80–$150/step', note: 'Includes sanding + 2-3 coats poly' },
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

// Gallery — pick stair-specific images showing refinishing work
const GALLERY_ITEMS = [
  stairsImages[7],  // White risers dark treads
  stairsImages[3],  // Premium refinishing
  stairsImages[0],  // Stair project 1
  stairsImages[17], // Dark stain refinishing
  stairsImages[1],  // Refinishing with flooring
  stairsImages[10], // Walnut stain
];

export default function StairRefinishingClient() {
  const [showStickyBtn, setShowStickyBtn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: 'Stair Refinishing' });
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
          alt="Professional staircase refinishing with dark stain and white risers"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-14 md:pb-24">
          <Breadcrumbs items={getStaticBreadcrumbs('/stair-refinishing')} variant="dark" />

          <div className="flex flex-wrap gap-2 mb-6 mt-2">
            {[
              `⭐ ${GOOGLE_RATING}/5 from ${GOOGLE_REVIEW_COUNT} Reviews`,
              '🛡️ WSIB Insured',
              '🪜 Dedicated Stair Crew',
              '🎨 Custom Stain Matching',
            ].map(badge => (
              <span key={badge} className="bg-white/10 backdrop-blur-sm text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15">
                {badge}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 max-w-4xl">
            Staircase Refinishing<br />
            <span className="text-amber-400">& Renovation</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
            Transform outdated carpet stairs or worn hardwood into stunning focal points. Custom staining, recapping, and full stair renovations across Markham, Toronto & Durham.
          </p>

          {/* Pricing Pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { value: '$125', label: 'per step recapping' },
              { value: '$80', label: 'per step refinish' },
              { value: 'FREE', label: 'in-home assessment' },
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

      {/* ─── Services Overview ─── */}
      <section className="pt-10 pb-12 md:pt-14 md:pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">What We Do</h2>
          <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">
            Whether your stairs need a fresh coat, new treads, or a complete transformation — we handle every type of staircase work.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                emoji: '🎨',
                title: 'Sanding & Refinishing',
                desc: 'Strip old finish, sand smooth, custom stain, and apply 2-3 coats of commercial-grade polyurethane. Restore faded or scratched stairs to like-new.',
              },
              {
                emoji: '🪜',
                title: 'Stair Recapping',
                desc: 'Install new hardwood or vinyl treads and risers over existing structure. Faster and 40-60% cheaper than full replacement — looks identical.',
              },
              {
                emoji: '✂️',
                title: 'Carpet Removal + Hardwood',
                desc: 'Remove old carpet, prep the structure, install new hardwood treads, custom stain, and finish. Complete transformation in 2-3 days.',
              },
              {
                emoji: '🔩',
                title: 'Railings & Spindles',
                desc: 'Modern iron pickets, glass panels, or refreshed wood railings. We coordinate the full staircase look — treads, risers, and railing together.',
              },
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
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Our Refinishing Process</h2>
          <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">Dustless sanding, custom staining, and professional-grade finishes — every step handled with care.</p>

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
              { emoji: '💨', title: 'Dustless Sanding', desc: '99% dust containment system keeps your home clean during the entire refinishing process.' },
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
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Our Staircase Work</h2>
          <p className="text-slate-500 text-center mb-8 max-w-2xl mx-auto">
            Real staircase refinishing and renovation projects by our crew.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {GALLERY_ITEMS.map((img, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                <Image
                  src={img.url}
                  alt={img.alt_text || img.alt || `BBS Flooring staircase project ${i + 1}`}
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

        <SpokeLinks
          title="Explore Related Services"
          links={SPOKE_LINKS}
        />

        {/* ─── Final CTA ─── */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 text-center text-white mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Transform Your Staircase?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Book a free in-home assessment. We&apos;ll inspect your stairs, show you stain samples, and provide a detailed quote.
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
