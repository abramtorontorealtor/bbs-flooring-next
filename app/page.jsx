import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HomeClient from '@/components/HomeClient';

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

/* ─── Arrow icon (inline SVG to avoid client dependency) ─── */
function ArrowIcon() {
  return (
    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/* ─── Feature icons (inline SVGs for server rendering) ─── */
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

const FEATURES = [
  { Icon: TruckIcon, title: 'GTA Delivery', description: 'Fast delivery across the Greater Toronto Area' },
  { Icon: ShieldIcon, title: 'Quality Guaranteed', description: 'Premium products with manufacturer warranties' },
  { Icon: CalendarIcon, title: 'Free Measurements', description: 'Book your free in-home measurement today' },
  { Icon: StarIcon, title: 'Expert Service', description: 'Professional installation by local experts' },
];

export default function HomePage() {
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
            quality={75}
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

      {/* ═══ Features Bar — Server-rendered, immediately visible ═══ */}
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

      {/* ═══ Rest of homepage — client component (product grids, reviews, etc.) ═══ */}
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <HomeClient />
      </Suspense>
    </div>
  );
}
