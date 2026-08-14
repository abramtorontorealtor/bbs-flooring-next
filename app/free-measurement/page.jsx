import { Suspense } from 'react';
import FreeMeasurementClient from '@/components/FreeMeasurementClient';
import { freeMeasurementSchema, faqSchema, JsonLd } from '@/lib/schemas';
import { FREE_MEASUREMENT_FAQS } from '@/data/faqs';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';

export const metadata = {
  title: 'Free In-Home Flooring Measurement Markham & GTA 2026',
  description: 'Book a free, no-obligation in-home flooring measurement in Markham, Toronto & Durham. Accurate quotes for hardwood, vinyl, laminate & tile installation. Call (647) 428-1111.',
  alternates: { canonical: '/free-measurement' },
};

export default function FreeMeasurementPage() {
  return (
    <>
      <JsonLd data={[freeMeasurementSchema(), faqSchema(FREE_MEASUREMENT_FAQS)]} />

      <div className="bg-white">
        {/* SSR Hero */}
        <div className="bg-gradient-to-br from-amber-50 to-slate-50 py-6 md:py-14">
          <div className="max-w-7xl mx-auto px-4">
            <Suspense fallback={null}>
              <Breadcrumbs items={getStaticBreadcrumbs('/free-measurement')} />
            </Suspense>
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs md:text-sm font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-3 md:mb-5">
              ✓ 100% Free &amp; No Obligation
            </div>
            <h1 className="text-2xl md:text-5xl font-bold text-slate-800 mb-2 md:mb-4">
              Book Your FREE In-Home Flooring Measurement
            </h1>
            <p className="text-base md:text-xl text-slate-600 max-w-3xl">
              Serving Markham, Durham &amp; Toronto (GTA) — Professional measurement and no-obligation quote.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs font-medium text-slate-700 md:hidden">
              <span className="flex items-center gap-1">✓ Free</span>
              <span className="flex items-center gap-1">✓ No Obligation</span>
              <span className="flex items-center gap-1">⏰ Same-Week Booking</span>
              <span className="flex items-center gap-1">⭐ 4.7★ on Google</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 md:py-16">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
            {/* Client Island: Interactive booking form */}
            <div className="order-1 lg:order-2">
              <Suspense fallback={
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg min-h-[300px] flex items-center justify-center">
                  <p className="text-slate-500">Loading booking form…</p>
                </div>
              }>
                <FreeMeasurementClient />
              </Suspense>
            </div>

            {/* SSR: Benefits column — Google sees all of this */}
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Why Book With BBS Flooring?</h2>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <span className="text-3xl flex-shrink-0">📋</span>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-1">Accurate Quotes</h3>
                    <p className="text-slate-600 text-sm">We measure your space for a precise, all-in quote—no surprises.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-3xl flex-shrink-0">👥</span>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-1">Expert Advice</h3>
                    <p className="text-slate-600 text-sm">Get recommendations on materials and options that fit your needs and budget.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-3xl flex-shrink-0">✅</span>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-1">No Pressure</h3>
                    <p className="text-slate-600 text-sm">100% free, no obligation—your satisfaction is our priority.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-3xl flex-shrink-0">⏰</span>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-1">Quick &amp; Easy</h3>
                    <p className="text-slate-600 text-sm">Flexible scheduling, including weekend availability across the GTA.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-amber-50 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-800 mb-2">How It Works:</h3>
                <ol className="space-y-1.5 list-decimal list-inside text-slate-700 text-sm">
                  <li>Enter your postal code &amp; project type</li>
                  <li>We confirm availability near you</li>
                  <li>Book your free in-home visit</li>
                  <li>Receive a detailed quote — no obligation</li>
                </ol>
              </div>

              <div className="mt-5 bg-slate-800 text-white rounded-2xl p-5">
                <h3 className="text-lg font-bold mb-2">Prefer to Call?</h3>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-amber-400">📞</span>
                  <a href="tel:6474281111" className="text-xl font-bold hover:text-amber-400 transition-colors">(647) 428-1111</a>
                </div>
                <p className="text-slate-300 text-sm">Available for calls &amp; texts</p>
              </div>
            </div>
          </div>
        </div>

        {/* SSR: FAQ section with native details/summary for crawlers */}
        <div className="mt-16 max-w-3xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold text-slate-800 mb-3 text-center">Frequently Asked Questions About Free Measurements</h2>
          <p className="text-slate-600 text-center mb-8">Everything you need to know about our free in-home measurement service</p>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-200">
            {FREE_MEASUREMENT_FAQS.map((faq, i) => (
              <details key={i} className="group">
                <summary className="px-6 py-4 text-left font-semibold text-slate-800 cursor-pointer hover:text-amber-600 list-none flex items-center justify-between">
                  {faq.question}
                  <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="px-6 pb-4 text-slate-700 leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>

        {/* SSR: Service area content block */}
        <div className="bg-slate-50 py-12">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-3">Free Flooring Measurement Service Areas</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Our free in-home measurement service covers Markham, Toronto, Scarborough, Richmond Hill,
              Vaughan, Pickering, Ajax, Whitby, Newmarket, Aurora, Stouffville, Woodbridge, Oshawa, and
              the entire Durham Region. We bring product samples directly to your home so you can see how
              they look in your space before making a decision. All measurements include a detailed,
              itemized quote with material, installation, and any removal costs — no hidden fees.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
