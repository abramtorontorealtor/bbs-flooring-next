'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';
import RemovalEstimator from '@/components/RemovalEstimator';
import StaticFAQ from '@/components/StaticFAQ';
import SpokeLinks from '@/components/SpokeLinks';
import {
  ServiceProcess,
  GoogleReviews,
  ServiceAreaPills,
  FinalCTA,
  MobileStickyBtn,
} from '@/components/service';
import { CheckIcon } from '@/components/service';
import { PHONE_HREF, PHONE_DISPLAY } from '@/lib/service-constants';
import { PhoneIcon } from '@/components/service';

const FinancingBanner = dynamic(() => import('@/components/FinancingBanner'), { ssr: false });

/**
 * RemovalServiceTemplate — shared layout for all removal service pages.
 * Modeled after /carpet-removal (proven high-converting pattern).
 *
 * @param {object} config — all page-specific data
 */
export default function RemovalServiceTemplate({ config }) {
  const {
    breadcrumbPath,
    heroImage,
    heroAlt,
    badges,
    titleLine1,
    titleLine2,
    subtitle,
    pricingPills,
    checklist,
    estimator,
    processTitle,
    processSubtitle,
    processSteps,
    includedTitle,
    includedItems,
    crossSellTitle,
    crossSellSubtitle,
    crossSellLinks,
    reviews,
    faqItems,
    spokeLinks,
    ctaTitle,
    ctaSubtitle,
    mobileStickyText,
    gaListName,
  } = config;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: gaListName || 'Removal Service' });
    }
  }, [gaListName]);

  return (
    <>
      {/* Hero */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        <img
          src={heroImage}
          alt={heroAlt}
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-14 md:pb-24">
          <Breadcrumbs items={getStaticBreadcrumbs(breadcrumbPath)} variant="dark" />

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-2 mb-6 mt-2">
            {badges.map(b => (
              <span key={b} className="bg-white/10 backdrop-blur-sm text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15">
                {b}
              </span>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4">
                {titleLine1}
                {titleLine2 && (
                  <>
                    <br />
                    <span className="text-amber-400">{titleLine2}</span>
                  </>
                )}
              </h1>
              <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8">
                {subtitle}
              </p>

              {/* Pricing Pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                {pricingPills.map(pill => (
                  <div key={pill.label} className="bg-white/10 backdrop-blur rounded-xl px-4 py-2.5 text-center min-w-[100px]">
                    <p className="text-xl md:text-2xl font-black text-amber-400">{pill.value}</p>
                    <p className="text-[11px] text-slate-300 leading-tight">{pill.label}</p>
                  </div>
                ))}
              </div>

              {/* Checklist */}
              <ul className="space-y-2 mb-8">
                {checklist.map(item => (
                  <li key={item} className="flex items-center gap-2 text-slate-200 text-sm">
                    <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#estimator"
                  className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold text-base px-7 py-3.5 rounded-xl transition-colors"
                >
                  📐 Get Instant Estimate
                </a>
                <a
                  href={PHONE_HREF}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold text-base px-7 py-3.5 rounded-xl border border-white/20 transition-colors"
                >
                  <PhoneIcon className="w-4 h-4" />
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>

            <section aria-label="Removal price estimator" id="estimator">
              <RemovalEstimator {...estimator} />
            </section>
          </div>
        </div>
      </div>

      {/* Process */}
      <ServiceProcess
        title={processTitle}
        subtitle={processSubtitle}
        steps={processSteps}
        bg="bg-white"
      />

      {/* What's Included */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">{includedTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
            {includedItems.map(item => (
              <div key={item} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-200">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-slate-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <FinancingBanner monthlyFrom={41} />
      </div>

      {/* Google Reviews */}
      <GoogleReviews reviews={reviews} />

      {/* Ready for New Floors? Cross-sell */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">{crossSellTitle}</h2>
          <p className="text-slate-500 mb-8 max-w-xl mx-auto">{crossSellSubtitle}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {crossSellLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="block bg-slate-800 hover:bg-amber-500 text-white font-semibold rounded-xl px-4 py-4 text-sm transition-colors"
              >
                {label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <ServiceAreaPills />

      {/* FAQ */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaticFAQ items={faqItems} skipSchema />
        </div>
      </section>

      {/* Spoke Links */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SpokeLinks links={spokeLinks} />
        </div>
      </section>

      {/* Final CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <FinalCTA
          title={ctaTitle}
          subtitle={ctaSubtitle}
          primaryCTA={{ route: 'FreeMeasurement', text: '📏 Book Free Measurement' }}
        />
      </div>

      {/* Mobile Sticky CTA */}
      <MobileStickyBtn text={mobileStickyText || '📐 Get Instant Estimate'} href="#estimator" />
    </>
  );
}
