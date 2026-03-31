'use client';

import React, { useEffect, useState, useRef, forwardRef } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Truck, Shield, Calendar, Star, CheckCircle } from 'lucide-react';
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
  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['featuredProductsOptimized'],
    queryFn: async () => {
      const newArrivals = await entities.Product.filter({}, { limit: 8, order: '-created_date' });
      return newArrivals.filter(p => p.image_url);
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
  ];

  const features = [
    { icon: Truck, title: 'GTA Delivery', description: 'Fast delivery across the Greater Toronto Area' },
    { icon: Shield, title: 'Quality Guaranteed', description: 'Premium products with manufacturer warranties' },
    { icon: Calendar, title: 'Free Measurements', description: 'Book your free in-home measurement today' },
    { icon: Star, title: 'Expert Service', description: 'Professional installation by local experts' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative" style={{ height: '85vh', minHeight: '600px', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div className="absolute inset-0">
          <img
            src="https://cdn.bbsflooring.ca/storage/v1/object/public/Base44/hero-optimized.webp"
            alt="Luxury hardwood flooring installation in modern Markham home living room"
            className="w-full h-full object-cover"
            width="1920"
            height="1080"
            loading="eager"
            fetchPriority="high"
            decoding="sync"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(15,23,42,0.9), rgba(15,23,42,0.7), transparent)' }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-400 text-sm font-medium">Serving Markham, Toronto & Durham</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] mb-6 tracking-tight">
              Premium Flooring in Markham at <span className="text-amber-500">Wholesale Prices</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-lg">
              Expert installation, huge selection, and 100% satisfaction guaranteed.
              Visit our showroom or let us bring samples to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={createPageUrl('FreeMeasurement')}>
                <Button size="lg" className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-6 text-base rounded-full w-full sm:w-auto font-bold shadow-lg shadow-amber-700/40 hover:shadow-amber-700/50 hover:-translate-y-0.5 transition-all">
                  Get Free In-Home Quote <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href={createPageUrl('QuoteCalculator')}>
                <Button size="lg" className="bg-white text-amber-600 hover:bg-slate-100 px-8 py-6 text-base rounded-full font-semibold w-full sm:w-auto hover:-translate-y-0.5 transition-all">
                  Estimate Your Cost
                </Button>
              </Link>
            </div>
            <Link href={createPageUrl('Products')} className="inline-flex items-center gap-1 text-slate-300 hover:text-amber-400 text-sm mt-5 transition-colors">
              Or browse all flooring <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <AnimDiv key={feature.title} delay={index * 100} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">{feature.title}</h2>
                  <p className="text-sm text-slate-500">{feature.description}</p>
                </div>
              </AnimDiv>
            ))}
          </div>
        </div>
      </section>

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

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <AnimDiv className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-bold text-slate-800 mb-2">New Arrivals</h2>
                <p className="text-slate-600">Check out our latest flooring options</p>
              </div>
              <Link href={createPageUrl('Products') + '?sort=newest'}>
                <Button variant="outline" className="hidden sm:flex">
                  View All Products <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </AnimDiv>

            <div className="grid grid-cols-2 md:hidden gap-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link href={createPageUrl('Products') + '?sort=newest'}>
                <Button variant="outline" size="lg" className="w-full">
                  View All New Arrivals <ArrowRight className="ml-2 w-4 h-4" />
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
              <img
                src="https://wsrv.nl/?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1600607687939-ce8a6c25118c&w=800&h=600&fit=cover&q=70&output=webp"
                alt="Professional hardwood flooring installation by BBS Flooring in Markham home"
                className="rounded-3xl shadow-2xl"
                width="800"
                height="600"
                loading="lazy"
                decoding="async"
              />
              <div className="mt-6 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-5 py-3">
                <span className="text-amber-400 font-bold">Est. 2012</span>
                <span className="text-slate-400">·</span>
                <span className="text-amber-400 font-bold">4.7★ Google Reviews</span>
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
            {recentProjectsShowcase.map((image, idx) => (
              <AnimDiv
                key={idx}
                delay={idx * 100}
                className="aspect-square rounded-lg overflow-hidden group"
              >
                {idx === 0 ? (
                  <Link
                    href={createPageUrl('ProjectDetail?slug=heritage-home-renovation-unionville')}
                    className="block w-full h-full cursor-pointer"
                  >
                    <img
                      src={image.url}
                      alt={idx === 0 ? "Premium flooring installation project by BBS Flooring" : idx === 1 ? "Custom hardwood flooring in Toronto home" : idx === 2 ? "Modern vinyl plank flooring installation in GTA" : idx === 3 ? "Professional staircase flooring project in Markham" : image.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                ) : (
                  <img
                    src={image.url}
                    alt={idx === 0 ? "Premium flooring installation project by BBS Flooring" : idx === 1 ? "Custom hardwood flooring in Toronto home" : idx === 2 ? "Modern vinyl plank flooring installation in GTA" : idx === 3 ? "Professional staircase flooring project in Markham" : image.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </AnimDiv>
            ))}
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
