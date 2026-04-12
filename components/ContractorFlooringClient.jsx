'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { createPageUrl } from '@/lib/routes';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';

const StaticFAQ = dynamic(() => import('@/components/StaticFAQ'), { ssr: false });
const SpokeLinks = dynamic(() => import('@/components/SpokeLinks'), { ssr: false });
const FinancingBanner = dynamic(() => import('@/components/FinancingBanner'), { ssr: false });
const ContractorRegistrationForm = dynamic(() => import('@/components/ContractorRegistrationForm'), { ssr: false });

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
function ArrowRightIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
}

const CDN = 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery';
const HERO_IMAGE = `${CDN}/commercial-project-4.webp`;

const GOOGLE_RATING = '4.7';
const GOOGLE_REVIEW_COUNT = 41;

/* ── Trade Program Benefits ── */
const BENEFITS = [
  {
    emoji: '💰',
    title: 'Member Trade Pricing',
    desc: 'Exclusive contractor rates on our full 600+ product catalog. Your margin stays healthy on every project.',
  },
  {
    emoji: '📦',
    title: 'Bulk Order Discounts',
    desc: 'Multi-unit projects, condo flips, rental portfolios — volume pricing that scales with your business.',
  },
  {
    emoji: '⚡',
    title: 'Same-Day Pickup',
    desc: 'In-stock products ready for same-day or next-day pickup from our Markham warehouse. No waiting.',
  },
  {
    emoji: '📅',
    title: 'Priority Scheduling',
    desc: 'Dedicated project coordination. Your install dates don\'t slip because you\'re first in line.',
  },
  {
    emoji: '🚚',
    title: 'GTA-Wide Delivery',
    desc: 'We deliver across the Greater Toronto Area. Garage drop, inside delivery, job site — we get it there.',
  },
  {
    emoji: '🔧',
    title: 'Material Only or Full Install',
    desc: 'Buy material for your own crew, or bundle with our WSIB-insured professional installers.',
  },
];

/* ── How It Works Steps ── */
const STEPS = [
  { num: '01', title: 'Register', desc: 'Fill out the form below or call us. We\'ll set up your trade account within one business day.' },
  { num: '02', title: 'Get Pricing', desc: 'Unlock exclusive member rates on 600+ products — hardwood, vinyl, laminate, and stair materials.' },
  { num: '03', title: 'Order & Schedule', desc: 'Place orders online, by phone, or in-person. We\'ll coordinate pickup or delivery to your timeline.' },
  { num: '04', title: 'Grow Together', desc: 'Dedicated rep, priority scheduling, and volume discounts that increase as your business scales.' },
];

/* ── Product Categories for Contractors ── */
const PRODUCT_CATEGORIES = [
  {
    title: 'Engineered Hardwood',
    desc: 'Vidar, Wickham, Triforest — wide plank European oak, click-lock for fast install.',
    href: '/engineered-hardwood',
    image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/engineered-hardwood.webp',
  },
  {
    title: 'SPC Luxury Vinyl',
    desc: '100% waterproof, rigid core. The go-to for basements, condos, and rental-grade durability.',
    href: '/vinyl',
    image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/vinyl.webp',
  },
  {
    title: '12mm Laminate',
    desc: 'Budget-friendly, fast install. Ideal for rental properties and staging projects.',
    href: '/laminate',
    image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/laminate.webp',
  },
  {
    title: 'Solid Hardwood',
    desc: 'Premium solid hardwood for high-end residential renovations and custom builds.',
    href: '/solid-hardwood',
    image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/solid-hardwood.webp',
  },
];

/* ── Why BBS Over Big Box ── */
const BIG_BOX_COMPARISON = [
  { bbs: 'Dedicated account rep who knows your projects', bigBox: 'Minimum-wage floor staff, different person every visit' },
  { bbs: '600+ products in stock — same-day pickup', bigBox: '2-4 week backorders on most specialty items' },
  { bbs: 'Trade pricing with no annual fees or minimums', bigBox: 'Same price as every homeowner' },
  { bbs: 'Professional installation crew available', bigBox: 'Subcontracted installers you\'ve never met' },
  { bbs: 'Moisture testing, subfloor assessment, product guidance', bigBox: 'Self-serve — you figure it out' },
  { bbs: 'GTA-wide delivery to your job site', bigBox: 'Customer pickup or slow freight delivery' },
];

/* ── Gallery Images — commercial + flooring projects ── */
const GALLERY_IMAGES = [
  { url: `${CDN}/commercial-project-1.webp`, alt: 'Commercial vinyl flooring installation Markham' },
  { url: `${CDN}/commercial-project-2.webp`, alt: 'Office flooring installation Toronto GTA' },
  { url: `${CDN}/commercial-project-5.webp`, alt: 'Commercial gym flooring installation Markham' },
  { url: `${CDN}/flooring-project-3.webp`, alt: 'Residential flooring project Markham' },
  { url: `${CDN}/flooring-project-6.webp`, alt: 'Hardwood flooring installation GTA' },
  { url: `${CDN}/commercial-project-8.webp`, alt: 'Office building flooring Markham contractor' },
];

/* ── FAQ ── */
const FAQ_ITEMS = [
  { question: 'Does BBS Flooring offer contractor pricing?', answer: 'Yes. Our Member Trade Program gives contractors exclusive pricing on our full catalog — hardwood, vinyl, laminate, and stair materials. No annual fees or minimum commitments. Call (647) 428-1111 or visit our showroom to register.' },
  { question: 'Can contractors buy material only without installation?', answer: 'Absolutely. Many of our contractor clients purchase material only for their own crews to install. We also offer our WSIB-insured installation team if you need additional labour for a project.' },
  { question: 'Do you offer bulk discounts for large projects?', answer: 'Yes. Multi-unit developments, condo projects, and large residential renovations qualify for additional volume discounts on top of member pricing. Contact us with your project details for a custom quote.' },
  { question: 'How quickly can I pick up material?', answer: 'In-stock products are available for same-day pickup at our Markham warehouse during business hours. For large orders, we stage material and have it ready — just call ahead. GTA-wide delivery is also available.' },
  { question: 'What areas do you serve?', answer: 'We supply contractors across the entire GTA: Markham, Toronto, Scarborough, North York, Richmond Hill, Vaughan, Stouffville, Pickering, Ajax, Whitby, Oshawa, and all of Durham Region. Delivery available to any job site.' },
  { question: 'Do you price match other flooring stores?', answer: 'Our prices are already contractor-direct — we\'re the source, not a middleman. If you find the exact same product cheaper elsewhere in the GTA, bring the quote and we\'ll talk. Most contractors find we\'re already the lowest once they compare apples to apples.' },
  { question: 'What brands do you carry?', answer: 'We stock 15+ brands including Vidar, Wickham, NAF, Triforest, Northernest, Woden, Falcon, Canadian Standard, and more. Over 600 products in stock at our Markham warehouse — engineered hardwood, SPC vinyl, laminate, and solid hardwood.' },
  { question: 'Is there a minimum order for contractor pricing?', answer: 'No minimum commitment and no annual fees. Your trade pricing is active from your very first order. Volume discounts kick in on larger projects — the more you buy, the better the rates.' },
];

/* ── Spoke Links ── */
const SPOKE_LINKS = [
  { route: 'Installation', label: 'Professional Installation Services', description: 'Full installation from $2.00/sqft — hardwood, vinyl, laminate, tile' },
  { route: 'FlooringInstallationCost', label: 'Installation Cost Guide', description: 'Detailed cost breakdowns for every flooring type — plan your project budget' },
  { route: 'EngineeredHardwood', label: 'Engineered Hardwood Catalog', description: 'Browse 200+ engineered hardwood products — Vidar, Wickham, Triforest, and more' },
  { route: 'Vinyl', label: 'SPC Luxury Vinyl', description: '100% waterproof vinyl for basements, condos, and high-traffic spaces' },
  { route: 'Stairs', label: 'Stair Installation & Renovation', description: 'Treads, recapping, refinishing — full staircase solutions' },
  { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Complimentary on-site measurement for accurate project quoting' },
];

/* ── Service Area ── */
const SERVICE_AREAS = [
  'Markham', 'Toronto', 'Scarborough', 'North York', 'Richmond Hill',
  'Vaughan', 'Stouffville', 'Pickering', 'Ajax', 'Whitby',
  'Oshawa', 'Durham Region', 'Newmarket', 'Aurora', 'Brampton',
];

export default function ContractorFlooringClient() {
  const breadcrumbs = getStaticBreadcrumbs('/contractor-flooring');
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-slate-900">
        <Image
          src={HERO_IMAGE}
          alt="Commercial flooring project — BBS Flooring contractor program"
          fill
          priority
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-16 md:pt-14 md:pb-24">
          <Breadcrumbs items={breadcrumbs} variant="dark" />

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-3 mt-6 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-3 py-1.5 rounded-full">
              <StarIcon className="w-4 h-4 text-amber-400" /> {GOOGLE_RATING} · {GOOGLE_REVIEW_COUNT} Reviews
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-3 py-1.5 rounded-full">
              🏗️ WSIB Insured
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-3 py-1.5 rounded-full">
              📦 600+ Products In Stock
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-3 py-1.5 rounded-full">
              ⚡ Same-Day Pickup
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-3xl">
            Flooring for Contractors &amp; Trade Professionals
          </h1>
          <p className="mt-4 text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed">
            Member trade pricing, priority scheduling, and a dedicated account rep — built for GTA contractors who demand quality, reliability, and margins that work.
          </p>

          {/* Pricing pills */}
          <div className="flex flex-wrap gap-3 mt-6">
            <span className="bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-sm px-4 py-2 rounded-full">
              💰 No Annual Fees
            </span>
            <span className="bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-sm px-4 py-2 rounded-full">
              📦 No Minimum Orders
            </span>
            <span className="bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-sm px-4 py-2 rounded-full">
              🚚 GTA-Wide Delivery
            </span>
          </div>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <a
              href="#contractor-form"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-8 rounded-xl text-lg transition-colors shadow-lg shadow-amber-500/25"
            >
              Apply for Trade Pricing
            </a>
            <a
              href="tel:6474281111"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold py-3.5 px-8 rounded-xl text-lg transition-colors"
            >
              <PhoneIcon className="w-5 h-5" /> (647) 428-1111
            </a>
          </div>
        </div>
      </section>

      {/* ── BENEFITS GRID ── */}
      <section className="py-14 md:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 text-center mb-3">
            The BBS Contractor Advantage
          </h2>
          <p className="text-slate-600 text-center max-w-2xl mx-auto mb-10 text-lg">
            We built our trade program around what contractors actually need — not what looks good on a brochure.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-amber-300 hover:shadow-lg transition-all">
                <span className="text-3xl mb-3 block">{b.emoji}</span>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{b.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 text-center mb-3">
            How It Works
          </h2>
          <p className="text-slate-600 text-center max-w-xl mx-auto mb-12 text-lg">
            From registration to your first order — we make it simple.
          </p>

          {/* Desktop: Horizontal stepper */}
          <div className="hidden md:grid md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={i} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="absolute top-6 left-[calc(50%+24px)] w-[calc(100%-48px)] h-0.5 bg-amber-200" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-lg shadow-amber-500/25">
                    {s.num}
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{s.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Vertical stepper */}
          <div className="md:hidden space-y-0">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/25">
                    {s.num}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-0.5 flex-1 bg-amber-200 my-2" />}
                </div>
                <div className="pb-8">
                  <h3 className="font-bold text-slate-800 text-base mb-1">{s.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT CATEGORIES ── */}
      <section className="py-14 md:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 text-center mb-3">
            Products Our Contractors Trust
          </h2>
          <p className="text-slate-600 text-center max-w-2xl mx-auto mb-10 text-lg">
            15+ brands, 600+ products in stock. Need something specific? We source specialty products and custom orders for trade accounts.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRODUCT_CATEGORIES.map((cat, i) => (
              <Link
                key={i}
                href={cat.href}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-amber-600 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{cat.desc}</p>
                  <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-sm mt-3 group-hover:gap-2 transition-all">
                    Browse Catalog <ArrowRightIcon className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BBS vs BIG BOX ── */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 text-center mb-3">
            Why Contractors Choose BBS Over Big Box
          </h2>
          <p className="text-slate-600 text-center max-w-xl mx-auto mb-10 text-lg">
            We know what it&apos;s like to be on a tight timeline. Here&apos;s why 100+ GTA contractors trust us.
          </p>

          {/* Desktop: Table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="py-4 px-6 text-left font-bold text-sm uppercase tracking-wider">BBS Flooring</th>
                  <th className="py-4 px-6 text-left font-bold text-sm uppercase tracking-wider">Big Box Stores</th>
                </tr>
              </thead>
              <tbody>
                {BIG_BOX_COMPARISON.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="py-4 px-6 text-sm text-slate-700">
                      <span className="inline-flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mt-0.5"><CheckIcon className="w-3 h-3" /></span>
                        {row.bbs}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-400">{row.bigBox}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden space-y-4">
            {BIG_BOX_COMPARISON.map((row, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start gap-2 mb-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mt-0.5"><CheckIcon className="w-3 h-3" /></span>
                  <p className="text-sm font-medium text-slate-800">{row.bbs}</p>
                </div>
                <p className="text-sm text-slate-400 ml-7">vs. {row.bigBox}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GOOGLE REVIEWS ── */}
      <section className="py-14 md:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-5 py-2.5 mb-6 shadow-sm">
            <span className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-5 h-5 text-amber-400" />
              ))}
            </span>
            <span className="font-bold text-slate-800">{GOOGLE_RATING}/5</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-600">{GOOGLE_REVIEW_COUNT} Google Reviews</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-10">
            Trusted by Homeowners &amp; Contractors Across the GTA
          </h2>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { name: 'Mike R.', text: 'Great experience working with BBS on a multi-unit renovation. Pricing was fair, material was ready on time, and the quality is excellent. Will use again.', rating: 5 },
              { name: 'Sarah L.', text: 'Abram and the team went above and beyond. We needed flooring for a tight-deadline condo flip and they had everything in stock. Highly recommend.', rating: 5 },
              { name: 'David K.', text: 'Been using BBS for my renovation projects for over a year now. Consistent quality, competitive pricing, and they actually answer the phone. Rare in this industry.', rating: 5 },
            ].map((review, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 text-left">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <StarIcon key={j} className="w-4 h-4 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">&quot;{review.text}&quot;</p>
                <p className="font-bold text-slate-800 text-sm">{review.name}</p>
              </div>
            ))}
          </div>

          <a
            href="https://www.google.com/maps/place/BBS+Flooring/@43.8576,-79.2891,17z/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-amber-600 font-semibold mt-6 hover:text-amber-700 transition-colors"
          >
            See all Google reviews <ArrowRightIcon className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ── PROJECT GALLERY ── */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 text-center mb-3">
            Recent Projects
          </h2>
          <p className="text-slate-600 text-center max-w-xl mx-auto mb-10 text-lg">
            Commercial and residential projects completed by our team across the GTA.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {GALLERY_IMAGES.map((img, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors"
            >
              View full project gallery <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SERVICE AREA ── */}
      <section className="py-10 md:py-14 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-6">
            Serving Contractors Across the Greater Toronto Area
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {SERVICE_AREAS.map((area) => (
              <span key={area} className="bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-full">
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINANCING BANNER ── */}
      <FinancingBanner />

      {/* ── REGISTRATION FORM ── */}
      <ContractorRegistrationForm />

      {/* ── FAQ ── */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 text-center mb-10">
            Frequently Asked Questions
          </h2>
          <StaticFAQ items={FAQ_ITEMS} />
        </div>
      </section>

      {/* ── SPOKE LINKS ── */}
      <section className="py-10 md:py-14 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Related Services &amp; Resources</h2>
          <SpokeLinks links={SPOKE_LINKS} />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to Partner With BBS?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            No annual fees, no minimum orders, no hassle. Just great flooring at contractor-direct prices with a team that gets it done.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#contractor-form"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-8 rounded-xl text-lg transition-colors shadow-lg shadow-amber-500/25"
            >
              Apply for Trade Pricing
            </a>
            <a
              href="tel:6474281111"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-3.5 px-8 rounded-xl text-lg transition-colors"
            >
              <PhoneIcon className="w-5 h-5" /> (647) 428-1111
            </a>
          </div>
        </div>
      </section>

      {/* ── MOBILE STICKY CTA ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 ${
          showSticky ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 safe-area-inset-bottom">
          <a
            href="#contractor-form"
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-base transition-colors w-full shadow-lg shadow-amber-500/20"
          >
            🏗️ Apply for Trade Pricing
          </a>
        </div>
      </div>
    </main>
  );
}
