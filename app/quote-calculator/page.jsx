import { Suspense } from 'react';
import QuoteCalculatorClient from '@/components/QuoteCalculatorClient';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';
import GoogleReviewsBanner from '@/components/GoogleReviewsBanner';

export const metadata = {
  title: 'Free Flooring Quote Calculator | Instant Pricing',
  description: 'Get an instant flooring quote. Select your product, enter square footage, and see material + installation + removal costs. Free, no obligation. BBS Flooring Markham.',
  alternates: { canonical: '/quote-calculator' },
};

export default function QuoteCalculatorPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <Suspense fallback={null}>
        <Breadcrumbs items={getStaticBreadcrumbs('/quote-calculator')} />
      </Suspense>

      {/* SSR: Header — Google sees H1 + description */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-3">
          <span className="text-2xl">🧮</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">Get Your Custom Installation Quote</h1>
        <p className="text-base text-slate-600 max-w-xl mx-auto">
          Accurate pricing in 60 seconds. Materials, installation, and extras — all included.
          Choose from over 600 flooring products including engineered hardwood, solid hardwood,
          vinyl, and laminate from top brands like Vidar, Wickham, NAF, and more.
        </p>
        <div className="mt-3 inline-block bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-1.5 rounded-full">
          ✅ We beat any written quote by 5%
        </div>
      </div>

      {/* Client Island: The interactive 4-step calculator wizard */}
      <Suspense fallback={
        <div className="border-2 border-slate-200 rounded-xl p-8 text-center min-h-[400px] flex items-center justify-center">
          <p className="text-slate-500">Loading quote calculator…</p>
        </div>
      }>
        <QuoteCalculatorClient />
      </Suspense>

      {/* SSR: Why Choose BBS Installation */}
      <div className="mt-12 bg-slate-900 text-white rounded-xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-6">Why Choose BBS Installation?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex gap-4 items-start">
            <span className="text-2xl">🏅</span>
            <div>
              <h3 className="font-semibold text-white mb-1">Certified Local Installers</h3>
              <p className="text-sm text-slate-400">Vetted, experienced professionals serving Markham and the GTA.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="text-2xl">🛡️</span>
            <div>
              <h3 className="font-semibold text-white mb-1">2-Year Labour Warranty</h3>
              <p className="text-sm text-slate-400">We stand behind our work with a full 2-year labour warranty.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="text-2xl">🚛</span>
            <div>
              <h3 className="font-semibold text-white mb-1">Old Floor Removal Included</h3>
              <p className="text-sm text-slate-400">We handle tear-out, haul-away, and cleanup before we install.</p>
            </div>
          </div>
        </div>
      </div>

      {/* SSR: Google Reviews */}
      <div className="mt-8 max-w-xl mx-auto">
        <Suspense fallback={null}>
          <GoogleReviewsBanner variant="compact" />
        </Suspense>
      </div>

      {/* SSR: Additional SEO content */}
      <div className="mt-12 text-center max-w-2xl mx-auto">
        <h2 className="text-lg font-bold text-slate-800 mb-3">How Our Quote Calculator Works</h2>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          Our free flooring quote calculator gives you an instant, transparent estimate for your entire
          project — including material costs, professional installation, old floor removal, baseboards,
          and delivery. Select from over 600 in-stock products, enter your room&apos;s square footage, and
          get an itemized breakdown in under 60 seconds.
        </p>
        <p className="text-slate-600 text-sm leading-relaxed">
          All quotes include HST and are based on our current in-store pricing. For the most accurate
          estimate, book a <a href="/free-measurement" className="text-amber-600 font-semibold hover:underline">free in-home measurement</a> —
          our installer will measure your space, bring product samples, and provide a final quote on the spot.
          Serving Markham, Toronto, Scarborough, Richmond Hill, Vaughan, Durham, and the entire GTA.
        </p>
      </div>
    </div>
  );
}
