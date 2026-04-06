'use client';

import React, { useEffect, useState, useRef, forwardRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, CheckCircle } from 'lucide-react';
import CategoryCard from '@/components/CategoryCard';
import { entities } from '@/lib/base44-compat';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/ProductCard';
import { recentProjectsShowcase } from '@/data/galleryImages';
import GeneralFAQSection from '@/components/GeneralFAQSection';
import GoogleReviewsBanner from '@/components/GoogleReviewsBanner';
import { FINANCEIT_LINKS } from '@/lib/financing';

// CSS-only fade-in via IntersectionObserver — avoids framer-motion bundle
function useFadeInView(delay = 0) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1, rootMargin: '50px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, style: { opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms` } };
}

const AnimDiv = forwardRef(function AnimDiv({ delay = 0, className, children, ...htmlProps }, _ref) {
  const { ref, style } = useFadeInView(delay);
  return <div ref={ref} style={style} className={className} {...htmlProps}>{children}</div>;
});

export default function Home() {
  const [showcaseTab, setShowcaseTab] = useState('new');

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['featuredProductsOptimized'],
    queryFn: async () => {
      const res = await fetch('/api/products/grid?limit=8');
      if (!res.ok) return [];
      const data = await res.json();
      return data.filter(p => p.image_url).slice(0, 8);
    },
  });

  // Best sellers — products with highest price (proxy for popular, since no sales data)
  const { data: popularProducts = [] } = useQuery({
    queryKey: ['popularProductsHome'],
    queryFn: async () => {
      const res = await fetch('/api/products/grid?limit=50');
      if (!res.ok) return [];
      const items = await res.json();
      const withImages = items.filter(p => p.image_url && p.price_per_sqft > 0);
      withImages.sort((a, b) => (b.price_per_sqft || 0) - (a.price_per_sqft || 0));
      const seen = {};
      const result = [];
      for (const p of withImages) {
        const cat = p.category || 'other';
        if (!seen[cat]) seen[cat] = 0;
        if (seen[cat] < 3) { result.push(p); seen[cat]++; }
        if (result.length >= 8) break;
      }
      return result;
    },
  });

  // On-sale products
  const { data: saleProducts = [] } = useQuery({
    queryKey: ['saleProductsHome'],
    queryFn: async () => {
      const res = await fetch('/api/products/grid?sale=true&limit=16');
      if (!res.ok) return [];
      const items = await res.json();
      return items.filter(p => p.image_url).slice(0, 8);
    },
  });

  const { data: clearanceProducts = [] } = useQuery({
    queryKey: ['clearanceProductsHome'],
    queryFn: async () => {
      const res = await fetch('/api/products/grid?clearance=true&limit=4');
      if (!res.ok) return [];
      const items = await res.json();
      return items.filter(p => p.image_url);
    },
  });

  const categories = [
    {
      category: 'solid_hardwood',
      title: 'Solid Hardwood',
      image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/solid-hardwood.webp',
      imageAlt: 'Solid Hardwood Flooring - Premium solid wood floors',
      description: 'Premium solid hardwood flooring with timeless beauty and durability.'
    },
    {
      category: 'engineered_hardwood',
      title: 'Engineered Hardwood',
      image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/engineered-hardwood.webp',
      imageAlt: 'Engineered Hardwood Flooring - Versatile engineered wood',
      description: 'Versatile engineered wood with real hardwood top layer.'
    },
    {
      category: 'laminate',
      title: 'Laminate',
      image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/laminate.webp',
      imageAlt: 'Laminate Flooring - Durable waterproof laminate',
      description: 'Durable, waterproof laminate flooring at great prices.'
    },
    {
      category: 'vinyl',
      title: 'Vinyl',
      image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/vinyl.webp',
      imageAlt: 'Vinyl Flooring - Luxury vinyl plank and tile',
      description: 'Luxury vinyl plank and tile with waterproof protection.'
    },
    {
      category: 'waterproof',
      title: 'Waterproof Flooring',
      image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/waterproof.webp',
      imageAlt: 'Waterproof flooring - SPC and WPC vinyl for basements and kitchens',
      description: 'SPC and WPC vinyl built for basements, kitchens, and high-moisture areas.'
    },
    {
      category: 'clearance',
      title: 'Clearance Deals',
      image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/categories/clearance.webp',
      imageAlt: 'Clearance flooring deals - discounted hardwood, vinyl, and laminate',
      description: 'Premium flooring at closeout prices. Limited stock — shop now.'
    },
  ];

  return (
    <div>
      {/* Hero + Features bar are now server-rendered in app/page.jsx for instant LCP */}

      {/* Categories Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimDiv className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore our wide selection of premium flooring options
            </p>
          </AnimDiv>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.category} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <AnimDiv className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Full-Service Flooring Experts
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We don't just sell floors — we install, refinish, and renovate. One team, start to finish.
            </p>
          </AnimDiv>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Flooring Installation',
                description: 'Hardwood, vinyl, laminate — expert installation with free in-home measurement.',
                href: '/installation',
                icon: '🔨',
              },
              {
                title: 'Stair Renovation',
                description: 'Custom treads, refinishing, iron pickets. Transform your staircase.',
                href: '/stairs',
                icon: '🪜',
              },
              {
                title: 'Hardwood Refinishing',
                description: 'Sand, stain, and refinish your existing hardwood to like-new condition.',
                href: '/hardwood-refinishing',
                icon: '✨',
              },
              {
                title: 'Carpet Removal',
                description: 'Fast carpet tearout from $1/sqft. We handle disposal and subfloor prep.',
                href: '/carpet-removal',
                icon: '🧹',
              },
            ].map((service, index) => (
              <AnimDiv key={service.title} delay={index * 100}>
                <Link href={service.href} className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-slate-200 hover:border-amber-300 transition-all group h-full">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">{service.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{service.description}</p>
                  <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-sm mt-4 group-hover:gap-2 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </AnimDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase — Multi-Tab */}
      {featuredProducts.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <AnimDiv className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
              <div>
                <h2 className="text-4xl font-bold text-slate-800 mb-2">Shop Our Flooring</h2>
                <p className="text-slate-600">Handpicked selections from our 700+ product showroom</p>
              </div>
              <Link href={createPageUrl('Products')}>
                <Button variant="outline" className="hidden sm:flex">
                  View All Products <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </AnimDiv>

            {/* Tab Switcher */}
            <div className="flex gap-1 mb-8 bg-slate-100 rounded-xl p-1 w-fit">
              {[
                { key: 'new', label: 'New Arrivals', icon: '✨' },
                { key: 'popular', label: 'Best Sellers', icon: '🔥' },
                { key: 'sale', label: 'On Sale', icon: '💰' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setShowcaseTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showcaseTab === tab.key
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="mr-1.5">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {(() => {
              const tabProducts = showcaseTab === 'popular' ? popularProducts
                : showcaseTab === 'sale' ? saleProducts
                : featuredProducts;
              const emptyMsg = showcaseTab === 'sale' ? 'No sale items right now — check back soon!' : null;
              if (tabProducts.length === 0 && emptyMsg) {
                return <p className="text-slate-500 text-center py-8">{emptyMsg}</p>;
              }
              return (
                <>
                  <div className="grid grid-cols-2 md:hidden gap-4">
                    {tabProducts.slice(0, 4).map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {tabProducts.slice(0, 8).map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              );
            })()}

            <div className="mt-8 text-center md:hidden">
              <Link href={createPageUrl('Products') + (showcaseTab === 'new' ? '?sort=newest' : '')}>
                <Button variant="outline" size="lg" className="w-full">
                  View All Products <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Clearance Deals */}
      {clearanceProducts.length > 0 && (
        <section className="py-20 px-4 bg-red-50">
          <div className="max-w-7xl mx-auto">
            <AnimDiv className="flex justify-between items-end mb-12">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 rounded-full px-4 py-1.5 mb-4">
                  <span className="text-red-700 text-sm font-bold uppercase tracking-wider">Clearance</span>
                </div>
                <h2 className="text-4xl font-bold text-slate-800 mb-2">Clearance Deals</h2>
                <p className="text-slate-600">Premium flooring at closeout prices. When it's gone, it's gone.</p>
              </div>
              <Link href={createPageUrl('Clearance')}>
                <Button variant="outline" className="hidden sm:flex border-red-300 text-red-700 hover:bg-red-100">
                  Shop All Clearance <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </AnimDiv>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {clearanceProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href={createPageUrl('Clearance')}>
                <Button variant="outline" size="lg" className="w-full border-red-300 text-red-700 hover:bg-red-100">
                  Shop All Clearance <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimDiv>
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
                    <CheckCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex gap-4">
                <Link href={createPageUrl('FreeMeasurement')}>
                  <Button size="lg" className="bg-amber-700 hover:bg-amber-800 rounded-full">
                    Get a Free Quote
                  </Button>
                </Link>
              </div>
            </AnimDiv>

            <AnimDiv className="relative overflow-hidden">
              <Image
                src="https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-1.webp"
                alt="Real BBS Flooring hardwood installation project in Markham home"
                className="rounded-3xl shadow-2xl"
                width={800}
                height={600}
                loading="lazy"
                quality={80}
              />
              <div className="mt-6 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-5 py-3">
                <span className="text-amber-400 font-bold">13+ Years in Markham</span>
                <span className="text-slate-400">·</span>
                <span className="text-amber-400 font-bold">4.7★ · 41 Google Reviews</span>
              </div>
            </AnimDiv>
          </div>
        </div>
      </section>

      {/* Google Reviews */}
      <GoogleReviewsBanner variant="carousel" />

      {/* Financing Trust Block */}
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
              href={createPageUrl('Financing')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-center border border-white/20 whitespace-nowrap"
            >
              See All Options
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Projects */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimDiv className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Our Latest Projects
            </h2>
            <p className="text-lg text-slate-600">
              See the quality craftsmanship in every installation
            </p>
          </AnimDiv>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {recentProjectsShowcase.map((image, idx) => {
              const altTexts = [
                'Premium flooring installation project by BBS Flooring',
                'Custom hardwood flooring in Toronto home',
                'Modern vinyl plank flooring installation in GTA',
                'Professional staircase flooring project in Markham',
              ];
              const alt = altTexts[idx] || image.alt_text || image.alt || `BBS Flooring project ${idx + 1}`;
              const href = idx === 0 ? '/gallery/heritage-home-renovation-unionville' : createPageUrl('Gallery');
              return (
                <AnimDiv
                  key={idx}
                  delay={idx * 100}
                  className="aspect-square rounded-lg overflow-hidden group"
                >
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
                </AnimDiv>
              );
            })}
          </div>

          <div className="text-center">
            <Link href={createPageUrl('Gallery')}>
              <Button size="lg" variant="outline">
                View Full Gallery <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <GeneralFAQSection />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="max-w-4xl mx-auto text-center">
          <AnimDiv>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Floors?
            </h2>
            <p className="text-xl text-amber-100 mb-8">
              Get started today with a free measurement and quote. No obligation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:6474281111">
                <Button size="lg" className="bg-white text-amber-600 hover:bg-slate-100 px-8 py-6 text-lg rounded-full">
                  <Phone className="mr-2 w-5 h-5" /> (647) 428-1111
                </Button>
              </a>
              <Link href={createPageUrl('FreeMeasurement')}>
                <Button size="lg" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-amber-600 px-8 py-6 text-lg rounded-full font-semibold">
                  Book Free Measurement
                </Button>
              </Link>
            </div>
          </AnimDiv>
        </div>
      </section>
    </div>
  );
}
