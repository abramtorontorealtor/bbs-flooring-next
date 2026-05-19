'use client';

import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { MapPin, Calculator, Phone, Hammer, Layers, Footprints, Trash2, Paintbrush, Home, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Breadcrumbs from '@/components/Breadcrumbs';
import { getLocationBreadcrumbs } from '@/lib/breadcrumbs';
import ProductCard from '@/components/ProductCard';
import { locationData } from '@/data/locationData';

const iconMap = {
  Hammer, Layers, Footprints, Trash2, Paintbrush, Home,
};

export default function LocationClient({ citySlug }) {
  const data = locationData[citySlug] || locationData['markham'];

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: data.city });
    }
  }, [data.city]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products-grid-location'],
    queryFn: async () => {
      const res = await fetch('/api/products/grid?limit=500');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const trendingProducts = useMemo(() => {
    const filtered = products.filter(p => p.in_stock !== false);
    return filtered.slice(0, 8);
  }, [products]);

  return (
    <>
      {/* FAQPage JSON-LD Schema */}
      {data.faqs && data.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: data.faqs.map(f => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a }
              }))
            })
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-12">
        <Breadcrumbs items={getLocationBreadcrumbs(data.city)} />

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-full mb-6">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Serving {data.city}</span>
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            Hardwood &amp; Vinyl Flooring Installation in {data.city}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            {data.content}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/quote-calculator?city=${encodeURIComponent(data.city)}`}>
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                <Calculator className="w-5 h-5" />
                Get a Quote in {data.city}
              </Button>
            </Link>
            <a href="tel:6474281111">
              <Button size="lg" variant="outline" className="gap-2">
                <Phone className="w-5 h-5" />
                Call (647) 428-1111
              </Button>
            </a>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">
            Why {data.city} Homeowners Choose BBS Flooring
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Local Expertise in {data.city}</h3>
                  <p className="text-slate-600">We know {data.city} homes. From {data.landmarks && data.landmarks.slice(0, 3).join(', ')} to newer developments, we understand local style and requirements.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <Calculator className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Free In-Home Estimates</h3>
                  <p className="text-slate-600">No-obligation quotes with detailed measurements at your {data.city} home.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Professional Installation</h3>
                  <p className="text-slate-600">Expert installers with years of experience serving {data.city} and the GTA.</p>
                </div>
              </div>
            </div>

            {/* Map Embed */}
            <div className="bg-slate-50 rounded-xl overflow-hidden h-64 md:h-full min-h-[300px] border border-slate-200 relative">
              {data.mapEmbed ? (
                <div dangerouslySetInnerHTML={{__html: data.mapEmbed}} className="w-full h-full" />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Serving all of {data.city}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Services Section */}
        {data.services && data.services.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Flooring Services in {data.city}</h2>
            <p className="text-slate-600 mb-8">Professional flooring services available for {data.city} homeowners</p>
            <div className="grid md:grid-cols-3 gap-6">
              {data.services.map((service, i) => {
                const Icon = iconMap[service.icon] || Hammer;
                return (
                  <Link key={i} href={service.slug} className="group">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-amber-300 hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                        <Icon className="w-6 h-6 text-amber-600" />
                      </div>
                      <h3 className="font-semibold text-slate-800 text-lg mb-2">{service.name}</h3>
                      <p className="text-slate-500 text-sm mb-3">Expert {service.name.toLowerCase()} for {data.city} homes</p>
                      <span className="text-amber-600 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Learn More <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {data.faqs && data.faqs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Frequently Asked Questions About Flooring in {data.city}</h2>
            <p className="text-slate-600 mb-8">Common questions from {data.city} homeowners</p>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
              <Accordion type="single" collapsible className="w-full">
                {data.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-slate-800 font-medium hover:text-amber-600">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        )}

        {/* Trending in City */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Trending in {data.city}</h2>
          <p className="text-slate-600 mb-8">Popular flooring choices for {data.city} homeowners</p>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-2xl aspect-[4/5] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your {data.city} Home?</h2>
          <p className="text-lg mb-8 opacity-90">Get a free quote and see how BBS Flooring can elevate your space</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/quote-calculator?city=${encodeURIComponent(data.city)}`}>
              <Button size="lg" className="bg-white text-amber-600 hover:bg-slate-50">
                Get Your Free Quote
              </Button>
            </Link>
            <a href="tel:6474281111">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Phone className="w-5 h-5 mr-2" />
                (647) 428-1111
              </Button>
            </a>
          </div>
        </div>

        {/* Product Type Links for This City */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Flooring by Type in {data.city}</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 mb-8">
            {[
              { label: `Vinyl Flooring ${data.city}`, slug: `vinyl-flooring-${citySlug}` },
              { label: `Hardwood Flooring ${data.city}`, slug: `hardwood-flooring-${citySlug}` },
              { label: `Laminate Flooring ${data.city}`, slug: `laminate-flooring-${citySlug}` },
              { label: `Engineered Hardwood ${data.city}`, slug: `engineered-hardwood-flooring-${citySlug}` },
            ].map(link => (
              <Link
                key={link.slug}
                href={`/${link.slug}`}
                className="hover:text-amber-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Other Service Areas</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            {Object.keys(locationData).map(key => (
              <Link 
                key={key}
                href={`/flooring-in/${key}`}
                className="hover:text-amber-600 transition-colors"
              >
                Flooring in {locationData[key].city}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
