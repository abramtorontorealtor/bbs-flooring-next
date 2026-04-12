import { Suspense, lazy } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CategoryCardServer from '@/components/CategoryCardServer';
import { FINANCEIT_LINKS } from '@/lib/financing';
import { recentProjectsShowcase } from '@/data/galleryImages';
import { createPageUrl } from '@/lib/routes';

export const metadata = {
  title: 'Flooring Store Markham, Toronto & Durham | Free Quote',
  description: 'Premium flooring in Markham, Toronto & Durham. Hardwood, vinyl, laminate. 600+ products, expert installation. Free measurements. Call (647) 428-1111!',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Premium Flooring in Markham, Toronto & Durham',
    description: 'Premium flooring in Markham, Toronto & Durham. 600+ products, expert installation. Free measurements.',
    images: [
      {
        url: 'https://cdn.bbsflooring.ca/storage/v1/object/public/Base44/hero-optimized.webp',
        width: 1920,
        height: 1080,
        alt: 'BBS Flooring showroom and installation services in Markham',
      },
    ],
  },
};

/* ─── Inline SVG icons (server-safe, zero bundle cost) ─── */
function ArrowIcon({ className = 'ml-2 w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}
function CheckCircleIcon({ className = 'w-6 h-6' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>;
}
function PhoneIcon({ className = 'w-5 h-5' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.29 2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}

const CATEGORIES = [
  {
    category: 'solid_hardwood',
    title: 'Solid Hardwood',
    image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/solid-hardwood.webp',
    imageAlt: 'Solid Hardwood Flooring - Premium solid wood floors',
    description: 'Premium solid hardwood flooring with timeless beauty and durability.',
    featured: true,
  },
  {
    category: 'engineered_hardwood',
    title: 'Engineered Hardwood',
    image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/engineered-hardwood.webp',
    imageAlt: 'Engineered Hardwood Flooring - Versatile engineered wood',
    description: 'Versatile engineered wood with real hardwood top layer.',
    featured: true,
  },
  {
    category: 'laminate',
    title: 'Laminate',
    image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/laminate.webp',
    imageAlt: 'Laminate Flooring - Durable waterproof laminate',
    description: 'Durable, waterproof laminate flooring at great prices.',
  },
  {
    category: 'vinyl',
    title: 'Vinyl',
    image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/vinyl.webp',
    imageAlt: 'Vinyl Flooring - Luxury vinyl plank and tile',
    description: 'Luxury vinyl plank and tile with waterproof protection.',
  },
  {
    category: 'waterproof',
    title: 'Waterproof Flooring',
    image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/waterproof.webp',
    imageAlt: 'Waterproof flooring - SPC and WPC vinyl for basements and kitchens',
    description: 'SPC and WPC vinyl built for basements, kitchens, and high-moisture areas.',
  },
  {
    category: 'clearance',
    title: 'Clearance Deals',
    image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/clearance.webp',
    imageAlt: 'Clearance flooring deals - discounted hardwood, vinyl, and laminate',
    description: 'Premium flooring at closeout prices. Limited stock — shop now.',
  },
];

const SERVICES = [
  { title: 'Flooring Installation', description: 'Hardwood, vinyl, laminate — expert installation with free in-home measurement.', href: '/installation', icon: '🔨' },
  { title: 'Stair Renovation', description: 'Custom treads, refinishing, iron pickets. Transform your staircase.', href: '/stairs', icon: '🪜' },
  { title: 'Hardwood Refinishing', description: 'Sand, stain, and refinish your existing hardwood to like-new condition.', href: '/hardwood-refinishing', icon: '✨' },
  { title: 'Carpet Removal', description: 'Fast carpet tearout from $1/sqft. We handle disposal and subfloor prep.', href: '/carpet-removal', icon: '🧹' },
];

const STATS = [
  { value: '700+', label: 'Products In Stock' },
  { value: '13+', label: 'Years in Markham' },
  { value: '4.7★', label: 'Google Reviews' },
  { value: '0%', label: 'Financing Available' },
];

/* ─── Lazy-load the ONLY client components needed ─── */
const ProductShowcase = lazy(() => import('@/components/ProductShowcase'));
const GoogleReviewsBanner = lazy(() => import('@/components/GoogleReviewsBanner'));
const GeneralFAQSection = lazy(() => import('@/components/GeneralFAQSection'));

export default function HomePage() {
  const featuredCategories = CATEGORIES.filter(c => c.featured);
  const standardCategories = CATEGORIES.filter(c => !c.featured);

  const galleryImages = recentProjectsShowcase.slice(0, 6);
  const galleryAlts = [
    'Premium flooring installation project by BBS Flooring',
    'Custom hardwood staircase renovation in Toronto home',
    'Modern vinyl plank flooring installation in GTA',
    'Professional staircase flooring project in Markham',
    'Engineered hardwood installation in Durham Region',
    'Luxury vinyl plank flooring in modern kitchen',
  ];

  return (
    <div>
      {/* ═══ HERO — Full-viewport, immersive, mobile-first ═══ */}
      <section className="relative min-h-[520px] h-[100svh] md:h-[100svh] max-h-[1000px] flex items-end md:items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://cdn.bbsflooring.ca/storage/v1/object/public/Base44/hero-optimized.webp"
            alt="Luxury hardwood flooring installation in modern Markham home living room"
            className="w-full h-full object-cover object-[center_40%]"
            width={1920}
            height={1080}
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={75}
          />
          {/* Mobile: heavier bottom gradient so text is always readable. Desktop: side gradient. */}
          <div
            className="absolute inset-0 md:hidden"
            style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.8) 35%, rgba(15,23,42,0.3) 65%, transparent 100%)' }}
          />
          <div
            className="absolute inset-0 hidden md:block"
            style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.7) 40%, rgba(15,23,42,0.3) 70%, transparent 100%)' }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 w-full pb-20 pt-24 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-5 md:mb-8">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-400 text-xs md:text-sm font-medium">Serving Markham, Toronto &amp; Durham</span>
            </div>
            <h1 className="text-[2.5rem] leading-[1.08] sm:text-5xl md:text-7xl lg:text-8xl font-extrabold text-white md:leading-[1.05] mb-5 md:mb-8 tracking-tight">
              Premium Flooring at{' '}
              <span className="text-amber-500">Wholesale Prices</span>
            </h1>
            <p className="text-base md:text-2xl text-slate-300 mb-7 md:mb-10 leading-relaxed max-w-lg">
              Expert installation, huge selection, and 100% satisfaction guaranteed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link
                href="/free-measurement"
                className="inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white px-7 py-3.5 md:px-8 md:py-4 text-base md:text-lg rounded-full w-full sm:w-auto font-bold shadow-lg shadow-amber-600/30 hover:shadow-amber-600/40 hover:-translate-y-0.5 transition-all"
              >
                Get Free In-Home Quote <ArrowIcon />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-7 py-3.5 md:px-8 md:py-4 text-base md:text-lg rounded-full font-semibold w-full sm:w-auto hover:-translate-y-0.5 transition-all"
              >
                Browse All Flooring <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR — Compact on mobile, prominent on desktop ═══ */}
      <section className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-5 md:py-10">
          <div className="grid grid-cols-4 md:gap-8 gap-2">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl md:text-4xl font-extrabold text-amber-500 mb-0.5 md:mb-1">{stat.value}</div>
                <div className="text-[10px] md:text-sm text-slate-400 font-medium uppercase tracking-wider leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CATEGORIES — Featured 2 large + 4 standard grid ═══ */}
      <section className="py-12 md:py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-2 md:mb-4">Shop by Category</h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">Explore our wide selection of premium flooring options</p>
          </div>
          {/* Top row: 2 featured categories — large hero cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 mb-3 md:mb-6">
            {featuredCategories.map((cat) => (
              <CategoryCardServer key={cat.category} {...cat} size="large" />
            ))}
          </div>
          {/* Bottom row: 4 standard categories */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {standardCategories.map((cat) => (
              <CategoryCardServer key={cat.category} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICES — Compact 2x2 on mobile, side image on desktop ═══ */}
      <section className="py-12 md:py-28 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-0 md:text-left">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-2 md:mb-4">Full-Service Flooring Experts</h2>
            <p className="text-base md:text-lg text-slate-600 mb-0 md:mb-8">We don&apos;t just sell floors — we install, refinish, and renovate. One team, start to finish.</p>
          </div>
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-16 items-start">
            {/* Left: Image (desktop only) */}
            <div className="lg:col-span-2 hidden lg:block">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-1.webp"
                  alt="BBS Flooring professional hardwood installation in Markham home"
                  fill
                  sizes="40vw"
                  className="object-cover"
                  loading="lazy"
                  quality={75}
                />
              </div>
            </div>
            {/* Right: Service cards — 2x2 grid on mobile */}
            <div className="lg:col-span-3 grid grid-cols-2 gap-3 md:gap-5">
              {SERVICES.map((service) => (
                <Link key={service.title} href={service.href} className="block bg-white rounded-xl md:rounded-2xl p-4 md:p-7 shadow-sm hover:shadow-xl border border-slate-200 hover:border-amber-300 transition-all group h-full">
                  <div className="text-2xl md:text-4xl mb-2 md:mb-5">{service.icon}</div>
                  <h3 className="text-sm md:text-xl font-bold text-slate-800 mb-1 md:mb-3 group-hover:text-amber-600 transition-colors leading-tight">{service.title}</h3>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-2 md:mb-4 hidden sm:block">{service.description}</p>
                  <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-xs md:text-sm group-hover:gap-2 transition-all">
                    Learn more <ArrowIcon className="w-3 h-3 md:w-4 md:h-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRODUCT SHOWCASE + CLEARANCE — Client (interactive tabs) ═══ */}
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <ProductShowcase />
      </Suspense>

      {/* ═══ WHY CHOOSE US — Stats-driven, not adjective-driven ═══ */}
      <section className="py-14 md:py-28 px-4 sm:px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-8">
                <span className="text-amber-400 text-sm font-medium">Why Homeowners Trust Us</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 md:mb-8">
                Why Choose <span className="text-amber-500">BBS Flooring</span>?
              </h2>
              <ul className="space-y-5">
                {[
                  { text: 'Professional installation by experienced local experts', strong: '100+ five-star installs' },
                  { text: 'Free in-home measurements with clear, honest quotes', strong: 'No surprises' },
                  { text: '700+ flooring options in our Markham showroom', strong: 'See it in person' },
                  { text: 'Transparent pricing — no hidden fees, ever', strong: 'Wholesale direct' },
                  { text: '100% satisfaction guaranteed on every project', strong: 'Our promise' },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <CheckCircleIcon className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white text-base">{item.text}</span>
                      <span className="block text-amber-500/70 text-sm mt-0.5">{item.strong}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link href="/free-measurement" className="inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white rounded-full h-12 px-8 text-base font-bold shadow-lg shadow-amber-600/20 transition-all hover:-translate-y-0.5">
                  Get a Free Quote <ArrowIcon />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-[3/4] md:aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-3.webp"
                  alt="Real BBS Flooring hardwood installation project in Markham home"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  loading="lazy"
                  quality={75}
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 left-2 md:-bottom-6 md:left-8 bg-white rounded-xl md:rounded-2xl shadow-xl px-4 py-3 md:px-6 md:py-4 flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 text-xl font-bold">★</span>
                </div>
                <div>
                  <div className="font-bold text-slate-800">4.7 out of 5</div>
                  <div className="text-sm text-slate-500">Based on 41 Google Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ GOOGLE REVIEWS — Client (carousel) ═══ */}
      <Suspense fallback={<div className="min-h-[200px]" />}>
        <GoogleReviewsBanner variant="carousel" />
      </Suspense>

      {/* ═══ FINANCING — Warm accent section ═══ */}
      <section className="py-16 md:py-20 px-4 sm:px-6 bg-slate-900">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <span className="inline-block bg-amber-500 text-slate-900 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              💳 Financing Available
            </span>
            <h2 className="text-3xl font-bold text-white mb-2">New Floors from $68/Month</h2>
            <p className="text-slate-300 max-w-md">
              Finance your full project — materials, installation, and removal — through our partner Financeit. Instant decision, no prepayment penalties. On approved credit.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href={FINANCEIT_LINKS.freeProgram}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-7 py-3.5 rounded-xl transition-colors text-center whitespace-nowrap"
            >
              Apply in Minutes →
            </a>
            <Link
              href="/financing"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-center border border-white/20 whitespace-nowrap"
            >
              See All Options
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ RECENT PROJECTS — Clean grid, mobile-optimized ═══ */}
      <section className="py-12 md:py-28 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-2 md:mb-4">Our Latest Projects</h2>
            <p className="text-base md:text-lg text-slate-600">See the quality craftsmanship in every installation</p>
          </div>
          {/* Mobile: 2-col grid. Desktop: masonry 3-col */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-5 mb-8 md:mb-10">
            {/* Large spanning left — desktop only span 2 rows */}
            <div className="rounded-xl md:rounded-2xl overflow-hidden group md:row-span-2">
              <Link href="/gallery/heritage-home-renovation-unionville" className="block w-full h-full relative aspect-square md:aspect-auto md:h-full md:min-h-[500px]">
                <Image
                  src={galleryImages[0]?.url || ''}
                  alt={galleryAlts[0]}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  quality={75}
                />
              </Link>
            </div>
            {galleryImages.slice(1, 5).map((img, idx) => (
              <div key={idx} className="rounded-xl md:rounded-2xl overflow-hidden group">
                <Link href="/gallery" className="block w-full h-full relative aspect-square">
                  <Image
                    src={img?.url || ''}
                    alt={galleryAlts[idx + 1] || `BBS Flooring project ${idx + 2}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    quality={75}
                  />
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/gallery" className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-full h-12 px-8 text-base font-semibold transition-colors hover:-translate-y-0.5">
              View Full Gallery <ArrowIcon className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FAQ — Client (accordion) ═══ */}
      <Suspense fallback={<div className="min-h-[100px]" />}>
        <GeneralFAQSection />
      </Suspense>

      {/* ═══ FINAL CTA — Warm amber gradient ═══ */}
      <section className="py-14 md:py-28 px-4 sm:px-6 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-6xl font-bold text-white mb-4 md:mb-6">
            Ready to Transform Your Floors?
          </h2>
          <p className="text-base md:text-xl text-amber-100 mb-7 md:mb-10 max-w-2xl mx-auto">
            Get started today with a free measurement and quote. No obligation, no pressure — just honest advice from local flooring experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <a href="tel:6474281111" className="inline-flex items-center justify-center bg-white text-amber-700 hover:bg-slate-50 px-8 py-4 md:px-10 md:py-5 text-base md:text-lg rounded-full font-bold shadow-lg transition-all hover:-translate-y-0.5">
              <PhoneIcon className="mr-2 w-5 h-5" /> (647) 428-1111
            </a>
            <Link href="/free-measurement" className="inline-flex items-center justify-center border-2 border-white bg-transparent text-white hover:bg-white hover:text-amber-700 px-8 py-4 md:px-10 md:py-5 text-base md:text-lg rounded-full font-bold transition-all hover:-translate-y-0.5">
              Book Free Measurement <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
