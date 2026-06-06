import Link from 'next/link';
import { Suspense } from 'react';
import { createPageUrl } from '@/lib/routes';
import Breadcrumbs from '@/components/Breadcrumbs';
import BrandProductGrid from '@/components/BrandProductGrid';

/**
 * BrandLandingServer — Server-rendered brand landing page.
 * All SEO content (H1, subtitle, content sections, trust badges, FAQs, CTA)
 * renders in the server response. CategoryFilterGrid is the only client island.
 * 
 * Replaces the client-only AdLandingTemplate for Google indexing.
 */

const PHONE = '(647) 428-1111';
const ADDRESS = '6061 Highway 7, Unit B, Markham, ON';

const TRUST_BADGES = [
  { emoji: '⭐', label: 'Google 4.7★', sub: '41+ Reviews' },
  { emoji: '🛡️', label: 'Licensed & Insured', sub: 'Since 2012' },
  { emoji: '🚚', label: 'Free Measurements', sub: 'GTA-wide' },
  { emoji: '📞', label: 'Same-Day Quotes', sub: PHONE },
];

export default function BrandLandingServer({
  h1,
  subtitle,
  content = [],
  faqItems = [],
  brandKey,
  showProducts = true,
  showMap = false,
  mapEmbed,
  parentPage,
  ctaText = 'Get a Free Quote',
  initialProducts,
  serverGrid,
}) {
  // Build breadcrumb items
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
          <Suspense><Breadcrumbs items={breadcrumbs} variant="dark" /></Suspense>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-white">
            {h1}
          </h1>
          {subtitle && (
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-3xl">{subtitle}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+16474281111"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl text-base transition-colors"
            >
              📞 Call {PHONE}
            </a>
            <Link
              href={createPageUrl('FreeMeasurement')}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl text-base transition-colors"
            >
              {ctaText} →
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-amber-50 border-b border-amber-100 py-4 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TRUST_BADGES.map(({ emoji, label, sub }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-sm">
                {emoji}
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
              <div key={idx} className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
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

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {showProducts && brandKey && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Products Available Now</h2>
            <Suspense fallback={serverGrid}>
              <BrandProductGrid
                brandKey={brandKey}
                initialProducts={initialProducts}
                serverGrid={serverGrid}
              />
            </Suspense>
          </div>
        )}

        {/* Financing Banner */}
        <div className="my-10 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="text-3xl">💳</span>
            <div>
              <p className="font-bold text-lg leading-tight">Flexible Financing Available</p>
              <p className="text-slate-300 text-sm mt-0.5">
                From <span className="text-amber-400 font-bold">$68/month</span> on approved credit · No prepayment penalty · Instant decision
              </p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/financing" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap">
              Learn More →
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        {faqItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto divide-y divide-slate-100">
              {faqItems.map((faq, index) => (
                <details key={index} className="group">
                  <summary className="px-6 py-4 cursor-pointer text-left font-semibold text-slate-800 hover:text-amber-600 list-none flex items-center justify-between">
                    {faq.question}
                    <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <div className="px-6 pb-4 text-slate-700 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
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
                <span className="text-amber-600">📍</span>
                <span>{ADDRESS}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-600">📞</span>
                <a href="tel:+16474281111" className="text-amber-700 font-semibold hover:underline">{PHONE}</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-600">🕐</span>
                <span>Mon–Sat 10am–5pm</span>
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
            >
              📞 {PHONE}
            </a>
            <Link
              href={createPageUrl('FreeMeasurement')}
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3 rounded-xl text-base transition-colors"
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
