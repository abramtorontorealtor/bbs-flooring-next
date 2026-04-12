'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import CategoryFilterGrid from '@/components/CategoryFilterGrid';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Phone, MapPin, Clock, Star, Shield, Truck, ChevronDown } from 'lucide-react';
import { Analytics } from './analytics';
import dynamic from 'next/dynamic';

const FinancingBanner = dynamic(() => import('@/components/FinancingBanner'), { ssr: false });

const PHONE = '(647) 428-1111';
const ADDRESS = '6061 Highway 7, Unit B, Markham, ON';

const TRUST_BADGES = [
  { icon: Star, label: 'Google 4.7★', sub: '41+ Reviews' },
  { icon: Shield, label: 'Licensed & Insured', sub: 'Since 2012' },
  { icon: Truck, label: 'Free Measurements', sub: 'GTA-wide' },
  { icon: Phone, label: 'Same-Day Quotes', sub: PHONE },
];

export default function AdLandingTemplate({
  h1,
  subtitle,
  content = [],
  faqItems = [],
  productFilter,
  productSessionKey,
  productQueryKey,
  showProducts = true,
  hideBrandFilter = false,
  showMap = false,
  mapEmbed,
  parentPage,
  ctaText = 'Get a Free Quote',
  initialProducts,
  serverGrid,
}) {
  const [openFaq, setOpenFaq] = useState(null);

  // GA4 landing page view
  useEffect(() => {
    Analytics.trackEvent('view_landing_page', 'engagement', h1);
  }, [h1]);

  const handleCtaClick = (location) => {
    Analytics.trackEvent('generate_lead', 'conversion', `${h1}_${location}`);
  };

  // Build breadcrumb items — hierarchy-based (Home > Parent > Current)
  const breadcrumbs = [
    { label: 'Home', url: '/' },
    ...(parentPage ? [{ label: parentPage.label, url: createPageUrl(parentPage.route) }] : []),
    { label: h1 },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 text-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <Breadcrumbs items={breadcrumbs} variant="dark" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-white">
            {h1}
          </h1>
          {subtitle && (
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-3xl">{subtitle}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:+16474281111`}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl text-base transition-colors"
              onClick={() => { Analytics.trackPhoneClick('landing_hero'); handleCtaClick('hero_call'); }}
            >
              <Phone className="w-5 h-5" />
              Call {PHONE}
            </a>
            <Link
              href={createPageUrl('FreeMeasurement')}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl text-base transition-colors"
              onClick={() => handleCtaClick('hero_cta')}
            >
              {ctaText} →
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-amber-50 border-b border-amber-100 py-4 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight">{label}</p>
                <p className="text-xs text-slate-500 leading-tight">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content — info sections */}
      {content.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-2">
          <div className="space-y-8">
            {content.map((section, idx) => (
              <div
                key={idx}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-6"
              >
                {section.heading && (
                  <h2 className="text-xl font-bold text-slate-800 mb-3">{section.heading}</h2>
                )}
                {section.body && (
                  <div
                    className="prose prose-slate prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: section.body }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Grid — full width to match browse/category pages */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {showProducts && productFilter && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Products Available Now</h2>
            <CategoryFilterGrid
              categoryFilter={productFilter}
              sessionKey={productSessionKey || 'landing'}
              queryKey={productQueryKey || 'products-landing'}
              hideBrand={hideBrandFilter}
              initialProducts={initialProducts}
              serverGrid={serverGrid}
            />
          </div>
        )}

        {/* Financing Banner */}
        <FinancingBanner monthlyFrom={68} />

        {/* FAQ Accordion */}
        {faqItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
              {faqItems.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border-b last:border-b-0">
                  <AccordionTrigger className="px-6 py-4 text-left font-semibold text-slate-800 hover:no-underline hover:text-amber-600">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-slate-700 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Map Section */}
        {showMap && mapEmbed && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Find Us in Markham</h2>
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: '400px' }}>
              <div dangerouslySetInnerHTML={{ __html: mapEmbed }} style={{ width: '100%', height: '100%' }} />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{ADDRESS}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <a href="tel:+16474281111" className="text-amber-700 font-semibold hover:underline">{PHONE}</a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Mon–Fri 9am–6pm · Sat 10am–5pm</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to Transform Your Space?</h2>
          <p className="text-slate-300 mb-6">
            Free in-home measurements across the GTA · No obligation · Same-day quotes
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:+16474281111"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 py-3 rounded-xl text-base transition-colors"
              onClick={() => { Analytics.trackPhoneClick('landing_bottom'); handleCtaClick('bottom_call'); }}
            >
              <Phone className="w-5 h-5" />
              {PHONE}
            </a>
            <Link
              href={createPageUrl('FreeMeasurement')}
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3 rounded-xl text-base transition-colors"
              onClick={() => handleCtaClick('bottom_cta')}
            >
              {ctaText}
            </Link>
          </div>
          <p className="text-slate-400 text-sm mt-4">
            📍 {ADDRESS}
          </p>
        </div>
      </div>
    </div>
  );
}
