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
import { INSTALLATION_FAQS } from '@/data/faqs';
import { flooringImages, stairsImages } from '@/data/galleryImages';

/* ── Inline SVG icons — avoids lucide-react in bundle ── */
function PhoneIcon({ className = 'w-5 h-5' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.29 2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function CheckIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>;
}
function StarIcon({ className = 'w-5 h-5' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>;
}

const GOOGLE_RATING = '4.7';
const GOOGLE_REVIEW_COUNT = 41;

const INSTALLATION_SPOKE_LINKS = [
  { route: 'FlooringInstallationCost', label: 'Flooring Installation Cost Guide', description: 'Detailed breakdown of installation costs per sqft for hardwood, vinyl, laminate & tile' },
  { route: 'ContractorFlooring', label: 'Contractor & Trade Program', description: 'Exclusive member pricing for contractors and builders — bulk orders welcome' },
  { route: 'HardwoodRefinishing', label: 'Hardwood Floor Refinishing', description: 'Sand, stain & refinish your existing hardwood floors to like-new condition' },
  { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a no-obligation measurement and get an accurate installation quote' },
  { route: 'CarpetRemoval', label: 'Carpet Removal Service', description: 'Professional carpet removal starting at $1.00/sqft — prep for your new floors' },
  { route: 'Stairs', label: 'Staircase Installation & Renovation', description: 'Hardwood stair treads, refinishing, railing installation & full staircase renovations' },
];

const SERVICES = [
  {
    title: 'Floor Installation',
    desc: 'Hardwood, vinyl, laminate & tile — expert installation with furniture moving included.',
    price: 'From $2.00/sqft',
    href: '#pricing',
    emoji: '🏠',
  },
  {
    title: 'Stair Renovation',
    desc: 'Refinishing, recapping, new treads, railings & full staircase transformations.',
    price: 'From $125/step',
    href: '/stairs',
    emoji: '🪜',
  },
  {
    title: 'Floor Removal',
    desc: 'Carpet, hardwood, vinyl, laminate & tile removal with subfloor prep.',
    price: 'From $1.00/sqft',
    href: '#pricing',
    emoji: '🔨',
  },
  {
    title: 'Hardwood Refinishing',
    desc: 'Sand, stain & refinish your existing hardwood floors to like-new condition.',
    price: 'Custom quote',
    href: '/hardwood-refinishing',
    emoji: '✨',
  },
  {
    title: 'Carpet Removal',
    desc: 'The Clean Slate service — 24hr turnaround, install-ready subfloor guaranteed.',
    price: '$1.00/sqft + $75',
    href: '/carpet-removal',
    emoji: '🧹',
  },
  {
    title: 'Free Measurement',
    desc: 'No-obligation in-home measurement with a detailed, transparent quote.',
    price: 'Free',
    href: '/free-measurement',
    emoji: '📐',
  },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Free Consultation', desc: 'We visit your home, assess the space, and discuss your flooring goals.', icon: '📋' },
  { step: '02', title: 'Detailed Quote', desc: 'Transparent pricing — material, labour, removal, and trim all itemized.', icon: '💰' },
  { step: '03', title: 'Preparation', desc: 'We move furniture, remove old flooring, and prep the subfloor.', icon: '🔧' },
  { step: '04', title: 'Expert Install', desc: 'Our WSIB-insured crew installs with precision and care.', icon: '⚒️' },
  { step: '05', title: 'Clean-Up', desc: 'We leave your home spotless — debris removed, furniture back in place.', icon: '🧽' },
  { step: '06', title: 'Final Walkthrough', desc: 'We review every detail with you to ensure 100% satisfaction.', icon: '✅' },
];

const INSTALL_PRICING = [
  { title: 'Solid / Eng. Hardwood (Nail Down)', price: '$2.25/sqft' },
  { title: 'Engineered Hardwood (Glue-Down)', price: '$3.25/sqft' },
  { title: 'Herringbone (Glue-Down)', price: '$4.25/sqft' },
  { title: 'Laminate Installation', price: '$2.00/sqft' },
  { title: 'Vinyl Installation', price: '$2.00/sqft' },
  { title: 'Tile Installation', price: 'From $10.00/sqft' },
];

const REMOVAL_PRICING = [
  { title: 'Carpet Removal', price: '$1.00/sqft', note: '+ $75 haul-away' },
  { title: 'Hardwood Removal', price: '$1.50/sqft', note: '+ haul-away' },
  { title: 'Vinyl / Laminate Removal', price: '$1.50/sqft', note: '+ haul-away' },
  { title: 'Tile Removal', price: '$3.00/sqft', note: '+ haul-away' },
];

const TRIM_DELIVERY = [
  { title: 'Standard Baseboard Install', price: '$3.61/linear ft' },
  { title: 'Shoe Moulding Install', price: '$1.91/linear ft' },
  { title: 'Garage Delivery', price: '$140 flat rate' },
  { title: 'Inside Delivery', price: '$200 flat rate', note: 'Required for install jobs' },
];

const REVIEWS = [
  { text: 'The installers were efficient, showed up on time, completed the work in the timeline promised and cleaned up afterwards. I highly recommend Abram and his installers and would not hesitate to use them again.', name: 'Cathy F.' },
  { text: 'We had the rooms redone with vinyl from carpet. The end result was perfection and the crew worked so diligently and did a full vacuum and clean up to complete the job. Abram was fantastic to work with.', name: 'Liberty' },
  { text: 'Quick and easy process and they were in and out in less than 4 days! Professional work and amazing quality. Would 100% recommend.', name: 'Sonya P.' },
];

const SERVICE_AREAS = [
  'Markham', 'Scarborough', 'Richmond Hill', 'Vaughan', 'North York',
  'Toronto', 'Mississauga', 'Brampton', 'Ajax', 'Pickering',
  'Whitby', 'Oshawa', 'Newmarket', 'Aurora', 'Stouffville',
];

const HERO_IMAGE = 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-1.webp';

// Gallery showcase — mix of flooring and stairs
const GALLERY_ITEMS = [
  flooringImages[0], flooringImages[5], flooringImages[3],
  stairsImages[0], flooringImages[8], stairsImages[2],
  flooringImages[9], stairsImages[4],
];

export default function InstallationClient() {
  const [activeTab, setActiveTab] = useState('install');
  const [showStickyBtn, setShowStickyBtn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: 'Installation' });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowStickyBtn(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pricingData = activeTab === 'install' ? INSTALL_PRICING
    : activeTab === 'removal' ? REMOVAL_PRICING
    : TRIM_DELIVERY;

  return (
    <div className="bg-white">
      {/* ─── Dark Immersive Hero ─── */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Professional flooring installation by BBS Flooring in Markham"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-14 md:pb-24">
          <Breadcrumbs items={getStaticBreadcrumbs('/installation')} variant="dark" />

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-2 mb-6 mt-2">
            {[
              `⭐ ${GOOGLE_RATING}/5 from ${GOOGLE_REVIEW_COUNT} Google Reviews`,
              '🛡️ WSIB Insured',
              '📏 Free In-Home Measurement',
              '🏗️ 12+ Years Experience',
            ].map(badge => (
              <span key={badge} className="bg-white/10 backdrop-blur-sm text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15">
                {badge}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 max-w-4xl">
            Professional Flooring<br />
            <span className="text-amber-400">Installation Services</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
            From hardwood to vinyl, laminate to tile — BBS Flooring delivers expert installation across Markham, Toronto, Durham & the GTA. Transparent pricing. No hidden fees.
          </p>

          {/* Pricing Pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { value: '$2.00', label: 'vinyl/laminate per sqft' },
              { value: '$2.25', label: 'hardwood per sqft' },
              { value: 'FREE', label: 'in-home measurement' },
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
              Book Free Measurement
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

      {/* ─── Service Menu ─── */}
      <section className="pt-10 pb-12 md:pt-14 md:pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Our Services</h2>
          <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">Everything you need for your flooring project under one roof — from removal to installation to finishing.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map(s => {
              const isExternal = s.href.startsWith('/');
              const Tag = isExternal ? Link : 'a';
              return (
                <Tag
                  key={s.title}
                  href={s.href}
                  className="group block bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-amber-300 rounded-2xl p-6 transition-all"
                >
                  <div className="text-3xl mb-3">{s.emoji}</div>
                  <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-amber-700 transition-colors">{s.title}</h3>
                  <p className="text-sm text-slate-500 mb-3 leading-relaxed">{s.desc}</p>
                  <p className="text-amber-600 font-bold text-sm">{s.price}</p>
                </Tag>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Process Stepper ─── */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">How It Works</h2>
          <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">From first call to final walkthrough — a smooth, professional process every time.</p>

          {/* Desktop: horizontal stepper */}
          <div className="hidden lg:grid grid-cols-6 gap-4">
            {PROCESS_STEPS.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {/* Connector line */}
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="absolute top-6 left-[60%] w-[80%] h-0.5 bg-amber-200" />
                )}
                <div className="relative z-10 w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center text-xl mx-auto mb-3">
                  {s.icon}
                </div>
                <h3 className="font-bold text-sm text-slate-800 mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile/Tablet: vertical stepper */}
          <div className="lg:hidden space-y-6">
            {PROCESS_STEPS.map((s, i) => (
              <div key={s.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center text-lg flex-shrink-0">
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

      {/* ─── WSIB + Insurance Banner ─── */}
      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex-shrink-0 text-4xl">🛡️</div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-2">WSIB Covered · Fully Insured · You&apos;re Protected</h3>
                <p className="text-emerald-100 leading-relaxed">
                  BBS Flooring carries <strong>WSIB workplace safety insurance</strong> and full <strong>commercial liability coverage</strong>.
                  If anything happens during your installation, you&apos;re never liable. Many flooring companies in the GTA don&apos;t carry WSIB —
                  always ask before hiring. We provide proof of coverage on request.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing Section (Tabbed) ─── */}
      <section id="pricing" className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Transparent Pricing</h2>
          <p className="text-slate-500 text-center mb-8 max-w-2xl mx-auto">No hidden fees, no surprises. What you see is what you pay.</p>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {[
              { id: 'install', label: 'Installation' },
              { id: 'removal', label: 'Removal' },
              { id: 'trim', label: 'Trim & Delivery' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Pricing Grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            {pricingData.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-amber-300 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{item.title}</h3>
                  {item.note && <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>}
                </div>
                <p className="text-lg font-bold text-amber-600 whitespace-nowrap ml-4">{item.price}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            All prices in CAD. Final quote provided after free in-home measurement. Furniture moving included with installation.
          </p>
        </div>
      </section>

      {/* ─── Customer Reviews (Moved UP — right after pricing) ─── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">What Our Customers Say</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-amber-400" />
                ))}
              </div>
              <span className="text-lg font-semibold text-slate-700">{GOOGLE_RATING}/5 from {GOOGLE_REVIEW_COUNT} Google Reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {REVIEWS.map(({ text, name }) => (
              <div key={name} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4 italic leading-relaxed">&ldquo;{text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-slate-800">— {name}</p>
                  <p className="text-xs text-slate-400">Google Review</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://g.page/r/CWJpmP-Dl-g4EBM/review"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 hover:text-amber-700 font-semibold text-sm underline underline-offset-2"
            >
              Read all {GOOGLE_REVIEW_COUNT} reviews on Google →
            </a>
          </div>
        </div>
      </section>

      {/* ─── Project Gallery ─── */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Recent Projects</h2>
          <p className="text-slate-500 text-center mb-8 max-w-2xl mx-auto">
            Real installations by our crew across Markham, Toronto & Durham.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GALLERY_ITEMS.map((img, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                <Image
                  src={img.url}
                  alt={img.alt_text || img.alt || `BBS Flooring project ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
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
              View full project gallery →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Service Area ─── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Service Area</h2>
          <p className="text-slate-500 mb-8">Professional flooring installation across the Greater Toronto Area.</p>

          <div className="flex flex-wrap justify-center gap-2">
            {SERVICE_AREAS.map(area => (
              <span key={area} className="bg-slate-100 text-slate-700 text-sm font-medium px-4 py-2 rounded-full border border-slate-200">
                📍 {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Financing Banner ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <FinancingBanner monthlyFrom={95} />
      </div>

      {/* ─── FAQ ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pt-10 md:pb-16">
        <StaticFAQ
          faqItems={INSTALLATION_FAQS}
          title="Frequently Asked Questions"
          subtitle="Answers to the most common installation questions from homeowners in Markham, Toronto & Durham"
          schemaId="faq-installation"
          skipSchema
        />

        {/* ─── Spoke Links ─── */}
        <SpokeLinks
          title="Explore Our Installation & Related Services"
          links={INSTALLATION_SPOKE_LINKS}
        />

        {/* ─── Final CTA ─── */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 text-center text-white mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Transform Your Space?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Book your free in-home measurement and get a detailed, no-obligation quote within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={createPageUrl('FreeMeasurement')}
              className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold text-base px-8 py-3.5 rounded-xl transition-colors"
            >
              Schedule Free Measurement
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
            📐 Book Free Measurement
          </Link>
        </div>
      )}
    </div>
  );
}
