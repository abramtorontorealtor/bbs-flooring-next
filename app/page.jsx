import { Suspense, lazy } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CategoryCardServer from '@/components/CategoryCardServer';
import { FINANCEIT_LINKS } from '@/lib/financing';
import { recentProjectsShowcase } from '@/data/galleryImages';
import { createPageUrl } from '@/lib/routes';

export const metadata = {
  title: 'Flooring Store Markham, Toronto & Durham | 1,000+ Floors from $1.49/sqft',
  description: '1,000+ hardwood, vinyl, and laminate floors from $1.49/sqft. Free in-home measurements, expert installation. Visit our Markham showroom or call (647) 428-1111.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Premium Flooring in Markham, Toronto & Durham',
    description: 'Premium flooring in Markham, Toronto & Durham. 1,000+ products, expert installation. Free measurements.',
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
function WhatsAppIcon({ className = 'w-6 h-6' }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>;
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

/* Hero quick-nav: thumbnails reuse the category images; routes match CATEGORY_ROUTES. */
const HERO_CATEGORY_NAV = [
  { label: 'Hardwood', href: '/engineered-hardwood', image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/engineered-hardwood.webp' },
  { label: 'Vinyl', href: '/vinyl', image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/vinyl.webp' },
  { label: 'Laminate', href: '/laminate', image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/laminate.webp' },
  { label: 'Waterproof', href: '/waterproof-flooring', image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/waterproof.webp' },
  { label: 'Solid Hardwood', href: '/solid-hardwood', image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/solid-hardwood.webp' },
  { label: '🔥 Clearance', href: '/clearance', image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/clearance.webp', accent: true },
];

const SERVICES = [
  { title: 'Flooring Installation', description: 'Hardwood, vinyl, laminate — expert installation with free in-home measurement.', href: '/installation', icon: '🔨' },
  { title: 'Stair Renovation', description: 'Custom treads, refinishing, iron pickets. Transform your staircase.', href: '/stairs', icon: '🪜' },
  { title: 'Hardwood Refinishing', description: 'Sand, stain, and refinish your existing hardwood to like-new condition.', href: '/hardwood-refinishing', icon: '✨' },
  { title: 'Carpet Removal', description: 'Fast carpet tearout from $1/sqft. We handle disposal and subfloor prep.', href: '/carpet-removal', icon: '🧹' },
];

const STATS = [
  { value: '1,000+', label: 'Products In Stock' },
  { value: '14+', label: 'Years in Markham' },
  { value: '4.7★', label: 'Google Reviews' },
  { value: '0%', label: 'Financing Available' },
];

/* ─── Lazy-load the ONLY client components needed ─── */
const ProductShowcase = lazy(() => import('@/components/ProductShowcase'));
const GoogleReviewsBanner = lazy(() => import('@/components/GoogleReviewsBanner'));
const GeneralFAQSection = lazy(() => import('@/components/GeneralFAQSection'));

export default function HomePage() {
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
      <section className="relative flex items-center md:min-h-[100svh] overflow-hidden">
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
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 w-full pb-24 pt-32 md:py-20 md:pb-20 lg:grid lg:grid-cols-2 lg:gap-10 lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-4 md:mb-6">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-400 text-xs md:text-sm font-medium">4.7★ Google · Since 2012 in Markham</span>
            </div>
            <h1 className="text-[2.25rem] leading-[1.1] sm:text-5xl md:text-6xl font-extrabold text-white md:leading-[1.05] mb-3 md:mb-5 tracking-tight">
              Markham Flooring Store.{' '}
              <span className="text-amber-500">1,000+ Floors. Wholesale Prices.</span>
            </h1>
            <p className="text-base md:text-xl text-slate-300 mb-4 md:mb-6 leading-relaxed max-w-lg">
              Hardwood, vinyl &amp; laminate from $1.49/sqft. Free in-home measurements. Installed by our own crew.
            </p>
            {/* Phone number directly in hero — unmissable */}
            <a
              href="tel:+16474281111"
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-lg md:text-xl font-bold mb-5 md:mb-7 transition-colors"
            >
              <PhoneIcon className="w-5 h-5 md:w-6 md:h-6" />
              (647) 428-1111
            </a>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white px-7 py-3.5 md:px-8 md:py-4 text-base md:text-lg rounded-full w-full sm:w-auto font-bold shadow-lg shadow-amber-600/30 hover:shadow-amber-600/40 hover:-translate-y-0.5 transition-all"
              >
                Shop All Floors <ArrowIcon />
              </Link>
              <Link
                href="/free-measurement"
                className="inline-flex items-center justify-center border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-7 py-3.5 md:px-8 md:py-4 text-base md:text-lg rounded-full font-semibold w-full sm:w-auto hover:-translate-y-0.5 transition-all"
              >
                Get Free In-Home Quote
              </Link>
            </div>

            {/* ═══ HERO CATEGORY QUICK-NAV — surfaces the catalogue in viewport 1 ═══ */}
            {/* Mobile: horizontal scroll strip. Desktop: tidy pill row. Server-rendered, zero client JS. */}
            <div className="mt-6 md:mt-9 lg:max-w-3xl">
              <p className="text-xs md:text-sm font-medium text-slate-300 uppercase tracking-wider mb-2.5 md:mb-3">
                Shop by category
              </p>
              {/* Mobile: horizontal snap-scroll. Desktop (md+): clean full-width row, no scroll. */}
              <div className="flex gap-3 md:gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-1 px-1 snap-x snap-mandatory scrollbar-thin">
                {HERO_CATEGORY_NAV.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className={`group shrink-0 md:shrink md:flex-1 snap-start w-[112px] md:w-auto rounded-2xl overflow-hidden border-2 bg-slate-900/40 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
                      c.accent
                        ? 'border-orange-500 hover:border-orange-400 hover:shadow-orange-500/30'
                        : 'border-amber-500/70 hover:border-amber-400 hover:shadow-amber-500/30'
                    }`}
                  >
                    <span className="relative block w-full h-[72px] md:h-[84px] overflow-hidden">
                      {c.accent ? (
                        <span className="flex items-center justify-center w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 text-2xl">
                          🔥
                        </span>
                      ) : (
                        <Image
                          src={c.image}
                          alt={c.label}
                          fill
                          sizes="130px"
                          quality={80}
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </span>
                    <span className={`block text-center text-sm font-bold py-2 px-1 whitespace-nowrap ${c.accent ? 'text-orange-100 bg-orange-600/90' : 'text-white bg-slate-900/70'}`}>
                      {c.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ HERO RIGHT — Affective trust + one-tap human contact (desktop only) ═══ */}
          {/* Fills the dead right-half on wide screens. NO email form — WhatsApp/phone only. */}
          <div className="hidden lg:block">
            <div className="ml-auto max-w-lg xl:max-w-xl bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-9 xl:p-11">
              <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-3">
                Talk to a real flooring expert —{' '}
                <span className="text-amber-400">not a call centre.</span>
              </h2>
              <p className="text-slate-200 text-lg mb-7 leading-relaxed">
                Send us a photo of your room and we&apos;ll help you pick the right floor — honest advice, wholesale prices, installed by our own crew.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  '4.7★ rated on Google',
                  'Family-owned in Markham since 2012',
                  'Our own install crew — never subcontractors',
                  'Free in-home measurement',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3 text-slate-100">
                    <CheckCircleIcon className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-base xl:text-lg font-medium">{line}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://wa.me/message/CQQRGZKI3U2VH1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white px-6 py-4 xl:py-5 rounded-2xl font-bold text-lg xl:text-xl shadow-lg shadow-green-600/30 hover:-translate-y-0.5 transition-all mb-3.5"
              >
                <WhatsAppIcon className="w-6 h-6 xl:w-7 xl:h-7" />
                Message us on WhatsApp
              </a>
              <a
                href="tel:+16474281111"
                className="flex items-center justify-center gap-2 w-full border-2 border-white/30 bg-white/5 hover:bg-white/15 text-white px-6 py-4 rounded-2xl font-semibold text-lg xl:text-xl transition-all"
              >
                <PhoneIcon className="w-5 h-5 xl:w-6 xl:h-6" />
                (647) 428-1111
              </a>
              <p className="text-center text-sm text-slate-200 mt-5 font-medium">
                One tap. A real person replies — usually within minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CLEARANCE URGENCY STRIP ═══ */}
      <div className="bg-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-3 text-center">
          <span className="text-lg">🔥</span>
          <p className="text-sm font-semibold">
            <span className="font-bold">30 Clearance Lines — Deep Discounts on Premium Flooring.</span>{' '}
            <a href="/clearance" className="underline underline-offset-2 hover:no-underline">Shop Before It’s Gone →</a>
          </p>
        </div>
      </div>

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

      {/* ═══ CATEGORIES — Clean card grid ═══ */}
      <section className="py-12 md:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">Shop by Category</h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">15+ brands, 1,000+ products in stock. Find the perfect floor for every room and budget.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
            {CATEGORIES.map((cat) => (
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

      {/* ═══ FLOOR FINDER CTA — Conversion optimizer ═══ */}
      <section className="py-10 md:py-14 px-4 sm:px-6 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Not Sure Which Floor Is Right?</h2>
            <p className="text-amber-100 text-base md:text-lg">Take our 60-second quiz and get personalized recommendations from 1,000+ products.</p>
          </div>
          <Link
            href="/floor-finder"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-amber-700 font-bold rounded-full text-lg shadow-lg hover:-translate-y-0.5 transition-all whitespace-nowrap"
          >
            Find My Floor <ArrowIcon />
          </Link>
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
                  { text: '1,000+ flooring options in our Markham showroom', strong: 'See it in person' },
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
                  <div className="text-sm text-slate-500">Rated on Google</div>
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

      {/* ═══ SERVICE AREAS & BRANDS — Internal linking for SEO ═══ */}
      <section className="py-12 md:py-20 px-4 sm:px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          {/* Service Areas */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Flooring Installation Across the GTA</h2>
            <p className="text-slate-600 mb-6 max-w-3xl">BBS Flooring serves homeowners across Markham, Toronto, and the Greater Toronto Area with professional flooring installation, stair refinishing, and hardwood refinishing services.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              {[
                { city: 'Markham', slug: 'markham' },
                { city: 'Toronto', slug: 'toronto' },
                { city: 'Scarborough', slug: 'scarborough' },
                { city: 'Richmond Hill', slug: 'richmond-hill' },
                { city: 'Vaughan', slug: 'vaughan' },
                { city: 'Pickering', slug: 'pickering' },
                { city: 'Ajax', slug: 'ajax' },
                { city: 'Whitby', slug: 'whitby' },
                { city: 'Woodbridge', slug: 'woodbridge' },
                { city: 'Newmarket', slug: 'newmarket' },
                { city: 'Aurora', slug: 'aurora' },
                { city: 'Stouffville', slug: 'stouffville' },
                { city: 'Oshawa', slug: 'oshawa' },
                { city: 'Durham Region', slug: 'durham' },
              ].map(area => (
                <Link key={area.slug} href={`/flooring-in/${area.slug}`} className="text-slate-700 hover:text-amber-600 transition-colors font-medium">
                  Flooring in {area.city} →
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Flooring by City */}
          <div className="mb-12">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Popular Flooring by City</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {[
                { label: 'Vinyl Flooring Markham', href: '/vinyl-flooring-markham' },
                { label: 'Hardwood Flooring Toronto', href: '/hardwood-flooring-toronto' },
                { label: 'Engineered Hardwood Markham', href: '/engineered-hardwood-flooring-markham' },
                { label: 'Laminate Flooring Scarborough', href: '/laminate-flooring-scarborough' },
                { label: 'Vinyl Flooring Richmond Hill', href: '/vinyl-flooring-richmond-hill' },
                { label: 'Hardwood Flooring Vaughan', href: '/hardwood-flooring-vaughan' },
                { label: 'Vinyl Flooring Toronto', href: '/vinyl-flooring-toronto' },
                { label: 'Laminate Flooring Markham', href: '/laminate-flooring-markham' },
                { label: 'Engineered Hardwood Toronto', href: '/engineered-hardwood-flooring-toronto' },
                { label: 'Hardwood Flooring Pickering', href: '/hardwood-flooring-pickering' },
                { label: 'Vinyl Flooring Scarborough', href: '/vinyl-flooring-scarborough' },
                { label: 'Laminate Flooring Vaughan', href: '/laminate-flooring-vaughan' },
              ].map(link => (
                <Link key={link.href} href={link.href} className="text-slate-500 hover:text-amber-600 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Brands */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Shop by Brand</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {[
                { label: 'Vidar Flooring', href: '/vidar-flooring' },
                { label: 'NAF Flooring', href: '/naf-flooring' },
                { label: 'Wickham Flooring', href: '/wickham-flooring' },
                { label: 'Appalachian Flooring', href: '/appalachian-flooring' },
                { label: 'Triforest Flooring', href: '/triforest-flooring' },
                { label: 'Woden Flooring', href: '/woden-flooring' },
                { label: 'Simba Flooring', href: '/simba-flooring' },
                { label: 'Canadian Standard Flooring', href: '/canadian-standard-flooring' },
                { label: 'Northernest Flooring', href: '/northernest-flooring' },
                { label: 'Lee Flooring', href: '/lee-flooring' },
              ].map(link => (
                <Link key={link.href} href={link.href} className="text-slate-500 hover:text-amber-600 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

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
