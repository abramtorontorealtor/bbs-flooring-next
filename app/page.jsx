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
function TruckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </svg>
  );
}
function CheckCircleIcon({ className = 'w-6 h-6' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>;
}
function PhoneIcon({ className = 'w-5 h-5' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.29 2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}

const FEATURES = [
  { Icon: TruckIcon, title: 'GTA Delivery', description: 'Fast delivery across the Greater Toronto Area' },
  { Icon: ShieldIcon, title: 'Quality Guaranteed', description: 'Premium products with manufacturer warranties' },
  { Icon: CalendarIcon, title: 'Free Measurements', description: 'Book your free in-home measurement today' },
  { Icon: StarIcon, title: 'Expert Service', description: 'Professional installation by local experts' },
];

const CATEGORIES = [
  {
    category: 'solid_hardwood',
    title: 'Solid Hardwood',
    image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/solid-hardwood.webp',
    imageAlt: 'Solid Hardwood Flooring - Premium solid wood floors',
    description: 'Premium solid hardwood flooring with timeless beauty and durability.',
  },
  {
    category: 'engineered_hardwood',
    title: 'Engineered Hardwood',
    image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/engineered-hardwood.webp',
    imageAlt: 'Engineered Hardwood Flooring - Versatile engineered wood',
    description: 'Versatile engineered wood with real hardwood top layer.',
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

/* ─── Lazy-load the ONLY client components needed ─── */
const ProductShowcase = lazy(() => import('@/components/ProductShowcase'));
const GoogleReviewsBanner = lazy(() => import('@/components/GoogleReviewsBanner'));
const GeneralFAQSection = lazy(() => import('@/components/GeneralFAQSection'));

export default function HomePage() {
  const altTexts = [
    'Premium flooring installation project by BBS Flooring',
    'Custom hardwood flooring in Toronto home',
    'Modern vinyl plank flooring installation in GTA',
    'Professional staircase flooring project in Markham',
  ];

  return (
    <div>
      {/* ═══ Hero — Server-rendered for instant LCP ═══ */}
      <section
        className="relative"
        style={{ height: '100svh', minHeight: '600px', maxHeight: '900px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}
      >
        <div className="absolute inset-0">
          <Image
            src="https://cdn.bbsflooring.ca/storage/v1/object/public/Base44/hero-optimized.webp"
            alt="Luxury hardwood flooring installation in modern Markham home living room"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 100vw"
            quality={65}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(15,23,42,0.9), rgba(15,23,42,0.7), transparent)' }}
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 w-full pt-28 md:pt-24 pb-24 md:pb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-400 text-sm font-medium">Serving Markham, Toronto &amp; Durham</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] mb-6 tracking-tight">
              Premium Flooring in Markham at <span className="text-amber-500">Wholesale Prices</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-lg">
              Expert installation, huge selection, and 100% satisfaction guaranteed.
              Visit our showroom or let us bring samples to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/free-measurement"
                className="inline-flex items-center justify-center bg-amber-700 hover:bg-amber-800 text-white px-8 py-4 text-base rounded-full w-full sm:w-auto font-bold shadow-lg shadow-amber-700/40 hover:shadow-amber-700/50 hover:-translate-y-0.5 transition-all"
              >
                Get Free In-Home Quote <ArrowIcon />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-8 py-4 text-base rounded-full font-semibold w-full sm:w-auto hover:-translate-y-0.5 transition-all"
              >
                Browse All Flooring <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Features Bar — Server-rendered ═══ */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <feature.Icon />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">{feature.title}</h2>
                  <p className="text-sm text-slate-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Categories — Server-rendered ═══ */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Shop by Category</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Explore our wide selection of premium flooring options</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <CategoryCardServer key={cat.category} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Services — Server-rendered ═══ */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Full-Service Flooring Experts</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">We don't just sell floors — we install, refinish, and renovate. One team, start to finish.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service) => (
              <Link key={service.title} href={service.href} className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-slate-200 hover:border-amber-300 transition-all group h-full">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">{service.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{service.description}</p>
                <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-sm mt-4 group-hover:gap-2 transition-all">
                  Learn more <ArrowIcon className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Product Showcase + Clearance — Client (interactive tabs) ═══ */}
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <ProductShowcase />
      </Suspense>

      {/* ═══ Why Choose Us — Server-rendered ═══ */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Choose <span className="text-amber-500">BBS Flooring</span>?
              </h2>
              <p className="text-slate-400 text-lg mb-8">
                With years of experience serving Markham, Toronto, and Durham, we help homeowners
                and businesses transform their spaces with stunning floors and expert service.
              </p>
              <ul className="space-y-4">
                {[
                  'Professional installation by experienced local experts',
                  'Free house measurements and clear, honest quotes',
                  'Wide selection of stylish, durable flooring',
                  'Transparent pricing—no hidden fees',
                  'Customer satisfaction guaranteed',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex gap-4">
                <Link href="/free-measurement" className="inline-flex items-center justify-center bg-amber-700 hover:bg-amber-800 text-white rounded-full h-10 px-8 text-sm font-medium shadow transition-colors">
                  Get a Free Quote
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden">
              <Image
                src="https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-1.webp"
                alt="Real BBS Flooring hardwood installation project in Markham home"
                className="rounded-3xl shadow-2xl"
                width={800}
                height={600}
                loading="lazy"
                quality={75}
              />
              <div className="mt-6 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-5 py-3">
                <span className="text-amber-400 font-bold">13+ Years in Markham</span>
                <span className="text-slate-400">·</span>
                <span className="text-amber-400 font-bold">4.7★ · 41 Google Reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Google Reviews — Client (carousel) ═══ */}
      <Suspense fallback={<div className="min-h-[200px]" />}>
        <GoogleReviewsBanner variant="carousel" />
      </Suspense>

      {/* ═══ Financing Trust Block — Server-rendered ═══ */}
      <section className="py-14 px-4 bg-slate-900">
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

      {/* ═══ Recent Projects — Server-rendered ═══ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Our Latest Projects</h2>
            <p className="text-lg text-slate-600">See the quality craftsmanship in every installation</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {recentProjectsShowcase.slice(0, 4).map((image, idx) => {
              const alt = altTexts[idx] || image.alt_text || image.alt || `BBS Flooring project ${idx + 1}`;
              const href = idx === 0 ? '/gallery/heritage-home-renovation-unionville' : '/gallery';
              return (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden group">
                  <Link href={href} className="block w-full h-full cursor-pointer relative">
                    <Image
                      src={image.url}
                      alt={alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      loading="lazy"
                      quality={75}
                    />
                  </Link>
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <Link href="/gallery" className="inline-flex items-center justify-center border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-amber-600 rounded-md text-sm font-medium h-10 px-8 transition-colors">
              View Full Gallery <ArrowIcon className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FAQ — Client (accordion) ═══ */}
      <Suspense fallback={<div className="min-h-[100px]" />}>
        <GeneralFAQSection />
      </Suspense>

      {/* ═══ CTA — Server-rendered ═══ */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Floors?
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            Get started today with a free measurement and quote. No obligation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:6474281111" className="inline-flex items-center justify-center bg-white text-amber-600 hover:bg-slate-100 px-8 py-6 text-lg rounded-full font-medium shadow transition-colors">
              <PhoneIcon className="mr-2 w-5 h-5" /> (647) 428-1111
            </a>
            <Link href="/free-measurement" className="inline-flex items-center justify-center border-2 border-white bg-transparent text-white hover:bg-white hover:text-amber-600 px-8 py-6 text-lg rounded-full font-semibold transition-colors">
              Book Free Measurement
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
