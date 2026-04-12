'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPageUrl } from '@/lib/routes';
import StaticFAQ from '@/components/StaticFAQ';
import SpokeLinks from '@/components/SpokeLinks';
import FinancingBanner from '@/components/FinancingBanner';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';
import { Analytics } from '@/components/analytics';
import { flooringImages } from '@/data/galleryImages';

/* ── Inline SVG icons ── */
function PhoneIcon({ className = 'w-5 h-5' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.29 2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function CheckIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>;
}

const GOOGLE_RATING = '4.7';
const GOOGLE_REVIEW_COUNT = 41;

const HERO_IMAGE = 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-5.webp';

/* ── Table of Contents ── */
const TOC_ITEMS = [
  { id: 'pricing', label: 'Installation Pricing' },
  { id: 'removal-pricing', label: 'Removal Pricing' },
  { id: 'calculator', label: 'Cost Calculator' },
  { id: 'cost-factors', label: 'What Affects Cost' },
  { id: 'save-money', label: 'How to Save' },
  { id: 'diy-vs-pro', label: 'DIY vs Professional' },
  { id: 'faq', label: 'FAQ' },
];

/* ── Pricing Data ── */
const INSTALL_PRICING = [
  { type: 'Luxury Vinyl (SPC)', material: '$1.79–$5.00', labour: '$2.00–$2.25', total: '$3.79–$7.25', note: 'Click-lock floating install', popular: true },
  { type: 'Laminate', material: '$1.79–$5.00', labour: '$2.00–$2.25', total: '$3.79–$7.25', note: 'Click-lock floating install' },
  { type: 'Engineered Hardwood (Nail-Down)', material: '$3.00–$7.25', labour: '$2.25', total: '$5.25–$9.50', note: 'Over plywood subfloor' },
  { type: 'Engineered Hardwood (Glue-Down)', material: '$3.00–$7.25', labour: '$3.25', total: '$6.25–$10.50', note: 'Over concrete subfloor' },
  { type: 'Engineered Hardwood (Herringbone)', material: '$3.00–$7.25', labour: '$4.25', total: '$7.25–$11.50', note: 'Premium pattern — glue-down' },
  { type: 'Solid Hardwood (Nail-Down)', material: '$5.00–$12.00', labour: '$2.25', total: '$7.25–$14.25', note: 'Over plywood subfloor only' },
  { type: 'Tile', material: 'Varies', labour: 'From $10.00', total: 'From $10.00/sqft+', note: 'Ceramic, porcelain, or natural stone' },
];

const REMOVAL_PRICING = [
  { type: 'Carpet Removal', price: '$1.00/sqft', haul: '+ $75 haul-away', note: '24-hr turnaround available' },
  { type: 'Hardwood Removal', price: '$1.50/sqft', haul: '+ haul-away', note: 'Nail-down & glue-down' },
  { type: 'Vinyl / Laminate Removal', price: '$1.50/sqft', haul: '+ haul-away', note: 'Click-lock & glue-down' },
  { type: 'Tile Removal', price: '$3.00/sqft', haul: '+ haul-away', note: 'Thinset/mortar cleanup included' },
];

const EXTRAS_PRICING = [
  { item: 'Standard Baseboard Install', price: '$3.61/linear ft' },
  { item: 'Shoe Moulding Install', price: '$1.91/linear ft' },
  { item: 'Stair Recapping (New Treads)', price: '$185–$225/step' },
  { item: 'Stair Refinishing', price: '$125/step' },
  { item: 'Garage Delivery', price: '$140 flat' },
  { item: 'Inside Delivery', price: '$200 flat' },
  { item: 'Furniture Moving', price: 'FREE', highlight: true },
  { item: 'In-Home Measurement', price: 'FREE', highlight: true },
];

/* ── Cost Factors ── */
const COST_FACTORS = [
  { icon: '🏗️', title: 'Subfloor Condition', desc: 'Uneven concrete or damaged plywood may need leveling ($1–$3/sqft extra). Our crew assesses during the free measurement.' },
  { icon: '🔨', title: 'Old Floor Removal', desc: 'Ripping up carpet ($1.00/sqft), hardwood ($1.50/sqft), or tile ($3.00/sqft) adds to the total. We handle everything.' },
  { icon: '📐', title: 'Room Complexity', desc: 'Stairs, closets, angled hallways, and tight corners take more time than open rectangles. Simple rooms = lower cost.' },
  { icon: '🪵', title: 'Material & Install Method', desc: 'Floating click-lock (vinyl/laminate) is fastest. Glue-down costs more. Herringbone is premium. Nail-down requires plywood.' },
  { icon: '🏠', title: 'Project Size', desc: 'Larger projects are more cost-efficient per sqft. A 200 sqft room costs more per sqft than a 1,500 sqft main floor.' },
  { icon: '📦', title: 'Delivery & Access', desc: 'Garage delivery $140, inside-house delivery $200. Elevator buildings or walk-ups with tight access may cost more.' },
];

/* ── DIY vs Pro ── */
const DIY_VS_PRO = {
  diy: [
    'Save $2.00–$4.25/sqft on labour',
    'Work on your own schedule',
    'Good for simple floating floor in small rooms',
    'YouTube has tutorials for click-lock vinyl',
  ],
  pro: [
    'Subfloor prep (leveling, moisture testing) included',
    'Proper expansion gaps — prevents buckling',
    'Clean transitions between rooms & materials',
    'Furniture moving included — no heavy lifting',
    'Warranty on both material AND labour',
    'One visit: removal + prep + install + cleanup',
    'WSIB insured — you\'re never liable',
  ],
  risks: [
    'Improper subfloor prep → floor squeaks or buckles within months',
    'Wrong expansion gaps → planks push against walls and warp',
    'Bad transitions → trip hazards and visible gaps between rooms',
    'No warranty → mistakes are 100% your cost to fix',
  ],
};

/* ── Example Projects ── */
const EXAMPLE_PROJECTS = [
  {
    title: '500 sqft Condo — Vinyl',
    items: [
      { label: 'Material (SPC vinyl @ $3.50/sqft)', cost: '$1,750' },
      { label: 'Installation ($2.00/sqft)', cost: '$1,000' },
      { label: 'Carpet removal ($1.00/sqft + $75)', cost: '$575' },
      { label: 'Baseboards (80 LF × $3.61)', cost: '$289' },
    ],
    total: '$3,614',
    note: 'Typical GTA condo. Furniture moving & in-home measurement FREE.',
  },
  {
    title: '1,200 sqft Main Floor — Engineered Hardwood',
    items: [
      { label: 'Material (eng. hardwood @ $5.50/sqft)', cost: '$6,600' },
      { label: 'Installation — nail-down ($2.25/sqft)', cost: '$2,700' },
      { label: 'Old laminate removal ($1.50/sqft)', cost: '$1,800' },
      { label: 'Baseboards (200 LF × $3.61)', cost: '$722' },
      { label: 'Inside delivery', cost: '$200' },
    ],
    total: '$12,022',
    note: 'Typical Markham detached. 0% financing available — ~$200/mo.',
  },
  {
    title: '250 sqft Basement — Waterproof Vinyl',
    items: [
      { label: 'Material (waterproof SPC @ $2.50/sqft)', cost: '$625' },
      { label: 'Installation ($2.00/sqft)', cost: '$500' },
      { label: 'Garage delivery', cost: '$140' },
    ],
    total: '$1,265',
    note: 'Most affordable option. 100% waterproof — ideal for basements.',
  },
];

/* ── Calculator Types ── */
const CALC_TYPES = [
  { label: 'Luxury Vinyl (SPC)', materialLow: 1.79, materialHigh: 5.00, installLow: 2.00, installHigh: 2.25 },
  { label: 'Engineered Hardwood', materialLow: 3.00, materialHigh: 7.25, installLow: 2.25, installHigh: 4.25 },
  { label: 'Solid Hardwood', materialLow: 5.00, materialHigh: 12.00, installLow: 2.25, installHigh: 2.25 },
  { label: 'Laminate', materialLow: 1.79, materialHigh: 5.00, installLow: 2.00, installHigh: 2.25 },
];

const HST_RATE = 0.13;

/* ── FAQ ── */
const FAQ_ITEMS = [
  { question: 'How much does it cost to install 1,000 sqft of flooring?', answer: 'For 1,000 sqft, expect roughly $3,790–$7,250 for vinyl or laminate, $5,250–$9,500 for engineered hardwood (nail-down), or $7,250–$14,250 for solid hardwood. These ranges include material + professional installation. Use our calculator above for your exact room size, or call (647) 428-1111 for a free quote.' },
  { question: 'Does BBS Flooring offer free estimates?', answer: 'Yes. We provide free in-home measurements and quotes anywhere in the GTA — Markham, Toronto, Scarborough, Pickering, Ajax, Whitby, Richmond Hill, Vaughan, and surrounding areas. No obligation. Call (647) 428-1111 to book.' },
  { question: 'Is it cheaper to buy flooring and install yourself?', answer: 'DIY saves $2.00–$4.25/sqft on labour, but risks costly mistakes. Improper subfloor prep, wrong expansion gaps, and bad transitions can cause buckling, squeaking, or water damage within months — and there\'s no warranty. Our professional installation includes subfloor prep, moisture testing, trim, furniture moving, and warranty on both material and labour.' },
  { question: 'How long does flooring installation take?', answer: 'A typical 500 sqft room takes 1–2 days for vinyl or laminate, 2–3 days for hardwood. Larger homes (1,000+ sqft) usually take 3–5 days. This includes old floor removal if needed. We give you an exact timeline during your free measurement appointment.' },
  { question: 'Do you charge extra to move furniture?', answer: 'No. BBS Flooring moves standard household furniture at no extra charge. Heavy items like pianos, pool tables, or gun safes may require specialty movers, but regular beds, dressers, sofas — we handle it all.' },
  { question: 'What\'s included in the installation cost?', answer: 'Professional installation by our WSIB-insured crew, subfloor assessment, moisture testing for concrete, proper expansion gaps, transitions between rooms, furniture moving, and post-install cleanup. Material, delivery, old floor removal, and baseboards are separate line items — all quoted upfront with no hidden fees.' },
  { question: 'How does flooring installation pricing work in the GTA?', answer: 'GTA flooring installation is priced per square foot. Material cost varies by product ($1.79–$12.00/sqft). Labour ranges from $2.00/sqft (vinyl/laminate) to $4.25/sqft (herringbone). Total project cost = material + labour + removal (if needed) + trim + delivery. We itemize everything in your quote so you see exactly what you\'re paying for.' },
  { question: 'Can I supply my own material and have you install it?', answer: 'We prefer to supply and install together — it means we guarantee both the material and the workmanship. If you supply your own material, we\'ll install it but the material warranty is between you and your supplier. Labour warranty still applies.' },
];

const SPOKE_LINKS = [
  { route: 'Installation', label: 'All Installation Services', description: 'Full service list — floors, stairs, removal, refinishing, and free measurement' },
  { route: 'QuoteCalculator', label: 'Quote Calculator', description: 'Detailed project quote with product selection, add-ons, and financing estimate' },
  { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a no-obligation measurement — we come to you with samples and a detailed quote' },
  { route: 'ContractorFlooring', label: 'Contractor & Trade Pricing', description: 'Volume pricing for contractors, builders, and property managers' },
  { route: 'CarpetRemoval', label: 'Carpet Removal Service', description: 'The Clean Slate — carpet removal starting at $1.00/sqft with 24hr turnaround' },
  { route: 'HardwoodRefinishing', label: 'Hardwood Floor Refinishing', description: 'Sand, stain & refinish existing hardwood from $5.25/sqft — 60-75% cheaper than replacement' },
];

const SERVICE_AREAS = [
  'Markham', 'Toronto', 'Scarborough', 'Richmond Hill', 'Vaughan',
  'Pickering', 'Ajax', 'Whitby', 'Oshawa', 'Stouffville',
  'Newmarket', 'Aurora', 'Mississauga', 'Brampton', 'North York',
];

const REVIEWS = [
  { text: 'The installers were efficient, showed up on time, completed the work in the timeline promised and cleaned up afterwards. I highly recommend Abram and his installers.', name: 'Cathy F.' },
  { text: 'We had the rooms redone with vinyl from carpet. The end result was perfection and the crew worked so diligently and did a full vacuum and clean up.', name: 'Liberty' },
  { text: 'Quick and easy process and they were in and out in less than 4 days! Professional work and amazing quality. Would 100% recommend.', name: 'Sonya P.' },
];

const GALLERY_ITEMS = [
  flooringImages[0], flooringImages[5], flooringImages[3],
  flooringImages[8], flooringImages[9], flooringImages[7],
];

export default function FlooringInstallationCostClient() {
  const [showStickyBtn, setShowStickyBtn] = useState(false);

  // Calculator state
  const [calcSqft, setCalcSqft] = useState('');
  const [calcType, setCalcType] = useState(0);
  const [calcRemoval, setCalcRemoval] = useState(false);
  const [calcRemovalType, setCalcRemovalType] = useState('carpet');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: 'Flooring Installation Cost Guide' });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowStickyBtn(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const removalRates = { carpet: 1.00, hardwood: 1.50, vinyl: 1.50, tile: 3.00 };

  const calcEstimate = useMemo(() => {
    const area = parseFloat(calcSqft);
    if (!area || area <= 0) return null;
    const type = CALC_TYPES[calcType];
    const removalCost = calcRemoval ? area * removalRates[calcRemovalType] : 0;
    const totalLow = (type.materialLow + type.installLow) * area + removalCost;
    const totalHigh = (type.materialHigh + type.installHigh) * area + removalCost;
    return {
      low: totalLow,
      high: totalHigh,
      lowTax: totalLow * (1 + HST_RATE),
      highTax: totalHigh * (1 + HST_RATE),
      materialLow: type.materialLow * area,
      materialHigh: type.materialHigh * area,
      labourLow: type.installLow * area,
      labourHigh: type.installHigh * area,
      removalCost,
      sqft: area,
      typeName: type.label,
      monthlyLow: Math.round(totalLow / 24),
      monthlyHigh: Math.round(totalHigh / 24),
    };
  }, [calcSqft, calcType, calcRemoval, calcRemovalType]);

  return (
    <div className="bg-white">
      {/* ─── Dark Hero ─── */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Professional flooring installation in a Markham home — hardwood and vinyl"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-14 md:pb-24">
          <Breadcrumbs items={getStaticBreadcrumbs('/flooring-installation-cost')} variant="dark" />

          <div className="flex flex-wrap gap-2 mb-6 mt-2">
            {[
              `⭐ ${GOOGLE_RATING}/5 from ${GOOGLE_REVIEW_COUNT} Reviews`,
              '🛡️ WSIB Insured',
              '📏 Free In-Home Measurement',
              '🚛 Free Furniture Moving',
            ].map(badge => (
              <span key={badge} className="bg-white/10 backdrop-blur-sm text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15">
                {badge}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 max-w-4xl">
            Flooring Installation<br />
            <span className="text-amber-400">Cost Guide</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
            Transparent pricing from a local, family-owned company. Material + professional installation — no hidden fees, free in-home measurements across the GTA.
          </p>

          {/* Pricing Pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { value: '$2.00', label: 'per sqft vinyl/laminate install' },
              { value: '$2.25', label: 'per sqft hardwood install' },
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
              📏 Book Free Measurement
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

      {/* ─── Table of Contents ─── */}
      <nav className="bg-slate-50 border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-none py-3">
            {TOC_ITEMS.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex-shrink-0 text-xs font-medium text-slate-600 hover:text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ─── Installation Pricing ─── */}
      <section id="pricing" className="pt-10 pb-12 md:pt-14 md:pb-16 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Installation Pricing per Sqft</h2>
          <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">
            Material + professional installation by our WSIB-insured crew. All prices in CAD. Furniture moving included free.
          </p>

          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800 text-white text-sm">
                  <th className="text-left px-5 py-3.5 font-semibold">Flooring Type</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Material (/sqft)</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Labour (/sqft)</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Total (/sqft)</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {INSTALL_PRICING.map((row, i) => (
                  <tr key={i} className={`border-t border-slate-100 ${row.popular ? 'bg-amber-50' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <td className="px-5 py-3.5 font-semibold text-slate-800 text-sm">
                      {row.type}
                      {row.popular && <span className="ml-2 text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">POPULAR</span>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{row.material}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{row.labour}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-amber-700">{row.total}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {INSTALL_PRICING.map((row, i) => (
              <div key={i} className={`rounded-xl border p-4 ${row.popular ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-800 text-sm">{row.type}</h3>
                  {row.popular && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">POPULAR</span>}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Material</p>
                    <p className="text-xs font-semibold text-slate-700">{row.material}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Labour</p>
                    <p className="text-xs font-semibold text-slate-700">{row.labour}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total</p>
                    <p className="text-xs font-bold text-amber-700">{row.total}</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">{row.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Removal Pricing ─── */}
      <section id="removal-pricing" className="py-12 md:py-16 bg-slate-50 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Removal &amp; Extras Pricing</h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">
            Need old flooring removed first? Here&apos;s what it costs. We handle everything.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Removal */}
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-4">🔨 Floor Removal</h3>
              <div className="space-y-2">
                {REMOVAL_PRICING.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{item.type}</p>
                      <p className="text-[11px] text-slate-400">{item.note}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="font-bold text-sm text-amber-600">{item.price}</p>
                      <p className="text-[10px] text-slate-400">{item.haul}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extras */}
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-4">📋 Trim, Stairs &amp; Delivery</h3>
              <div className="space-y-2">
                {EXTRAS_PRICING.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
                    <p className="font-semibold text-sm text-slate-800">{item.item}</p>
                    <p className={`font-bold text-sm ml-3 whitespace-nowrap ${item.highlight ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {item.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Example Projects ─── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Real Project Estimates</h2>
          <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">
            What actual GTA flooring projects cost. Material + labour + removal + extras — all included.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {EXAMPLE_PROJECTS.map((project, i) => (
              <div key={i} className="bg-slate-800 text-white rounded-2xl p-6 flex flex-col">
                <h3 className="font-bold text-base mb-4">{project.title}</h3>
                <div className="space-y-2 flex-1">
                  {project.items.map((item, j) => (
                    <div key={j} className="flex justify-between text-sm">
                      <span className="text-slate-300 leading-tight pr-2">{item.label}</span>
                      <span className="text-amber-400 font-semibold whitespace-nowrap">{item.cost}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-600 mt-4 pt-3 flex justify-between items-center">
                  <span className="font-bold text-white">Total</span>
                  <span className="text-xl font-black text-amber-400">{project.total}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">{project.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Cost Calculator ─── */}
      <section id="calculator" className="py-12 md:py-16 bg-amber-50 scroll-mt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Quick Cost Calculator</h2>
          <p className="text-slate-500 text-center mb-8 max-w-xl mx-auto">
            Enter your room size and flooring type for an instant ballpark estimate.
          </p>

          <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-lg p-6 md:p-8">
            <div className="space-y-5">
              {/* Flooring Type */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">1. Choose Flooring Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {CALC_TYPES.map((type, i) => (
                    <button
                      key={type.label}
                      onClick={() => setCalcType(i)}
                      className={`text-left px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        calcType === i
                          ? 'border-amber-500 bg-amber-50 text-amber-800'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sqft */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">2. Room Size (square feet)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={calcSqft}
                  onChange={(e) => setCalcSqft(e.target.value)}
                  className="w-full text-lg px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
                  min="1"
                  max="50000"
                  onFocus={() => Analytics.trackEvent('cost_guide_calc_focus', 'engagement', 'installation_cost')}
                />
                <p className="text-xs text-slate-400 mt-1">Not sure? Multiply room length × width in feet. We&apos;ll measure for free.</p>
              </div>

              {/* Removal */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">3. Include Old Floor Removal?</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCalcRemoval(false)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      !calcRemoval ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    No removal needed
                  </button>
                  {[
                    { key: 'carpet', label: 'Carpet ($1.00/sqft)' },
                    { key: 'hardwood', label: 'Hardwood ($1.50/sqft)' },
                    { key: 'vinyl', label: 'Vinyl ($1.50/sqft)' },
                    { key: 'tile', label: 'Tile ($3.00/sqft)' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => { setCalcRemoval(true); setCalcRemovalType(opt.key); }}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        calcRemoval && calcRemovalType === opt.key
                          ? 'border-amber-500 bg-amber-50 text-amber-800'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result */}
            {calcEstimate ? (
              <div className="mt-6 bg-slate-800 text-white rounded-2xl p-6 animate-fade-in-up">
                <p className="text-xs text-slate-400 mb-1 text-center">Estimated total for {calcEstimate.sqft.toLocaleString()} sqft of {calcEstimate.typeName}</p>
                <p className="text-3xl md:text-4xl font-black text-center text-amber-400 mb-1">
                  C${Math.round(calcEstimate.low).toLocaleString()} – C${Math.round(calcEstimate.high).toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 text-center mb-4">
                  C${Math.round(calcEstimate.lowTax).toLocaleString()} – C${Math.round(calcEstimate.highTax).toLocaleString()} incl. HST
                </p>

                <div className="grid grid-cols-3 gap-3 text-center text-xs mb-4">
                  <div className="bg-slate-700/50 rounded-lg p-2">
                    <p className="text-slate-400">Material</p>
                    <p className="font-bold text-white">${Math.round(calcEstimate.materialLow).toLocaleString()}–${Math.round(calcEstimate.materialHigh).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2">
                    <p className="text-slate-400">Labour</p>
                    <p className="font-bold text-white">${Math.round(calcEstimate.labourLow).toLocaleString()}–${Math.round(calcEstimate.labourHigh).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2">
                    <p className="text-slate-400">{calcRemoval ? 'Removal' : 'Removal'}</p>
                    <p className="font-bold text-white">{calcEstimate.removalCost > 0 ? `$${Math.round(calcEstimate.removalCost).toLocaleString()}` : '—'}</p>
                  </div>
                </div>

                {calcEstimate.high >= 1000 && (
                  <p className="text-center text-xs text-slate-300 mb-4">
                    💳 With 0% financing: ~C${calcEstimate.monthlyLow}–${calcEstimate.monthlyHigh}/month over 24 months
                  </p>
                )}

                <div className="grid sm:grid-cols-2 gap-2">
                  <Link
                    href="/quote-calculator"
                    onClick={() => Analytics.trackEvent('cost_guide_calc_get_quote', 'conversion', calcEstimate.typeName)}
                    className="block bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-center text-sm transition-colors"
                  >
                    Get Exact Quote →
                  </Link>
                  <Link
                    href={createPageUrl('FreeMeasurement')}
                    className="block bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl text-center text-sm border border-white/20 transition-colors"
                  >
                    📏 Book Free Measurement
                  </Link>
                </div>

                <p className="text-[10px] text-slate-500 text-center mt-3">
                  * Estimate only. Final price depends on subfloor condition, room layout, and product selection.
                </p>
              </div>
            ) : (
              <div className="mt-6 bg-slate-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <p className="text-2xl mb-2">🧮</p>
                <p className="text-slate-500 text-sm">Enter your room size above to see an instant estimate</p>
                <p className="text-slate-400 text-xs mt-1">Material + professional installation included</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Cost Factors ─── */}
      <section id="cost-factors" className="py-12 md:py-16 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">What Affects Your Installation Cost</h2>
          <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">
            Every project is different. These are the biggest factors that move the price up or down.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COST_FACTORS.map((factor, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="text-3xl mb-3">{factor.icon}</div>
                <h3 className="font-bold text-base text-slate-800 mb-2">{factor.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{factor.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How to Save ─── */}
      <section id="save-money" className="py-12 md:py-16 bg-slate-50 scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">How to Save on Flooring Installation</h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">
            Smart ways to get great floors without blowing your budget.
          </p>

          <div className="space-y-4">
            {[
              { tip: 'Buy material + installation together', desc: 'Bundled pricing is always cheaper than sourcing material separately and hiring an installer. We guarantee both material and workmanship.', icon: '📦' },
              { tip: 'Check our Clearance section', desc: 'In-stock overstocks at 30–60% off. Same quality products, fraction of the price. First come, first served.', icon: '🏷️', link: '/clearance' },
              { tip: 'Ask about contractor pricing', desc: 'If you\'re a contractor, builder, or buying for multiple rooms/units, we offer volume discounts on material and labour.', icon: '🏗️', link: '/contractor-flooring' },
              { tip: 'Get a free measurement first', desc: 'Accurate measurements prevent over-ordering material. We measure every room for free — no obligation.', icon: '📏', link: '/free-measurement' },
              { tip: 'Consider vinyl for high-ROI areas', desc: 'Waterproof vinyl at $3.79–$7.25/sqft total is 40–50% cheaper than hardwood, and it\'s perfect for basements, kitchens, and condos.', icon: '💧' },
              { tip: 'Use 0% financing to spread the cost', desc: 'Finance your full project at 0% interest. A $6,000 main floor becomes ~$250/month. No reason to wait.', icon: '💳', link: '/financing' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 mb-1">
                    {item.link ? (
                      <Link href={item.link} className="hover:text-amber-600 transition-colors">{item.tip} →</Link>
                    ) : (
                      item.tip
                    )}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DIY vs Professional ─── */}
      <section id="diy-vs-pro" className="py-12 md:py-16 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">DIY vs. Professional Installation</h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">
            We get it — DIY can save money. But here&apos;s the full picture before you decide.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* DIY */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-slate-800 mb-4">🔧 DIY Installation</h3>
              <ul className="space-y-2">
                {DIY_VS_PRO.diy.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckIcon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-emerald-800 mb-4">✅ Professional Installation</h3>
              <ul className="space-y-2">
                {DIY_VS_PRO.pro.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Risks */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-3xl mx-auto">
            <h3 className="font-bold text-base text-red-800 mb-3">⚠️ Common DIY Mistakes That Cost More to Fix</h3>
            <ul className="space-y-2">
              {DIY_VS_PRO.risks.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-red-500 font-bold mt-0.5 flex-shrink-0">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Reviews ─── */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-amber-500 text-xl">⭐</span>
            <span className="font-bold text-lg text-slate-800">{GOOGLE_RATING}/5</span>
            <span className="text-slate-500 text-sm">from {GOOGLE_REVIEW_COUNT} Google Reviews</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {REVIEWS.map((review, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-sm text-slate-600 leading-relaxed mb-3">&ldquo;{review.text}&rdquo;</p>
                <p className="text-xs font-semibold text-slate-800">— {review.name}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <a
              href="https://g.page/r/CSOcdolefFaJEAI/review"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 hover:text-amber-700 text-xs font-semibold underline underline-offset-2"
            >
              Read all {GOOGLE_REVIEW_COUNT} reviews on Google →
            </a>
          </div>
        </div>
      </section>

      {/* ─── Project Gallery ─── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Our Installation Work</h2>
          <p className="text-slate-500 text-center mb-8 max-w-2xl mx-auto">
            Real flooring installation projects by our crew across the GTA.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {GALLERY_ITEMS.map((img, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                <Image
                  src={img.url}
                  alt={img.alt_text || img.alt || `BBS Flooring installation project ${i + 1}`}
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
              View all projects in our gallery →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Service Area ─── */}
      <section className="py-10 md:py-12 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">Flooring Installation Across the GTA</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xl mx-auto">
            Free in-home measurements and professional installation anywhere in our service area.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SERVICE_AREAS.map(area => (
              <span key={area} className="bg-white border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full">
                📍 {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Financing ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <FinancingBanner monthlyFrom={150} />
      </div>

      {/* ─── FAQ ─── */}
      <div id="faq" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pt-10 md:pb-16 scroll-mt-16">
        <StaticFAQ
          faqItems={FAQ_ITEMS}
          title="Frequently Asked Questions"
          subtitle="Common questions about flooring installation costs in the GTA"
          schemaId="faq-installation-cost"
          skipSchema
        />

        <SpokeLinks
          title="Explore Related Services"
          links={SPOKE_LINKS}
        />

        {/* ─── Final CTA ─── */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 text-center text-white mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Get Your Exact Cost?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Book a free in-home measurement. We&apos;ll measure every room, discuss your flooring goals, and give you a detailed, no-obligation quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={createPageUrl('FreeMeasurement')}
              className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold text-base px-8 py-3.5 rounded-xl transition-colors"
            >
              📏 Book Free Measurement
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
            📏 Book Free Measurement
          </Link>
        </div>
      )}
    </div>
  );
}
