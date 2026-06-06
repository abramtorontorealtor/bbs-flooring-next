import FloorFinderQuiz from '@/components/FloorFinderQuiz';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';
import { Phone, Clock, Shield, Truck } from 'lucide-react';

export const metadata = {
  title: 'Floor Finder Quiz — Find Your Perfect Flooring in 60 Seconds',
  description: 'Answer 5 quick questions and get personalized flooring recommendations from BBS Flooring. 700+ options in vinyl, hardwood, laminate & engineered hardwood. Free estimates in Markham, Toronto & GTA.',
  alternates: {
    canonical: 'https://bbsflooring.ca/floor-finder',
  },
  openGraph: {
    title: 'Floor Finder Quiz — Find Your Perfect Flooring in 60 Seconds',
    description: 'Answer 5 quick questions and get personalized flooring recommendations from 700+ options.',
    url: 'https://bbsflooring.ca/floor-finder',
    type: 'website',
  },
};

export default function FloorFinderPage() {
  return (
    <>
      <Breadcrumbs items={getStaticBreadcrumbs('/floor-finder')} />

      {/* Hero Section — Server Rendered for SEO */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-slate-50 py-10 sm:py-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Find Your Perfect Floor
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Answer 5 quick questions and we&apos;ll recommend the best flooring for your home from our collection of <strong>700+ products</strong>.
            </p>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-slate-500 mb-10">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                Takes 60 seconds
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-500" />
                No commitment
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-500" />
                GTA-wide delivery
              </span>
            </div>
          </div>

          {/* Quiz Component (Client) */}
          <FloorFinderQuiz />
        </div>
      </section>

      {/* Bottom SEO Content — Server Rendered */}
      <section className="bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            How the Floor Finder Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-amber-600">1</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Tell Us About Your Space</h3>
              <p className="text-sm text-slate-500">Room type, lifestyle, and style preferences — 5 quick questions.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-amber-600">2</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Get Matched</h3>
              <p className="text-sm text-slate-500">Our algorithm picks the best products from 700+ options based on your needs.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-amber-600">3</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Shop or Call</h3>
              <p className="text-sm text-slate-500">Browse your matches, get a free quote, or call us at (647) 428-1111.</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <h2>Why Use the BBS Floor Finder?</h2>
            <p>
              Choosing flooring can be overwhelming — with hundreds of options across vinyl, laminate,
              engineered hardwood, and solid hardwood, it&apos;s hard to know where to start. Our Floor
              Finder quiz narrows down the perfect match based on your room, budget, style, and
              lifestyle needs.
            </p>
            <p>
              Whether you need waterproof flooring for a kitchen renovation in Markham, scratch-resistant
              vinyl for a busy family room in Scarborough, or premium engineered hardwood for a
              Vaughan living room, we&apos;ll point you to the best options at wholesale prices.
            </p>
            <h3>Popular Flooring Types</h3>
            <ul>
              <li><strong>Vinyl / SPC Flooring</strong> — Waterproof, scratch-resistant, budget-friendly. From $1.79/sqft. Perfect for kitchens, bathrooms, and basements.</li>
              <li><strong>Laminate Flooring</strong> — Durable, affordable, easy to install. From $1.49/sqft. Great for bedrooms and living rooms.</li>
              <li><strong>Engineered Hardwood</strong> — Real wood beauty with enhanced stability. From $3.19/sqft. Ideal for any room except wet areas.</li>
              <li><strong>Solid Hardwood</strong> — Timeless, refinishable, premium. From $5.10/sqft. Best for living rooms, dining rooms, and bedrooms.</li>
            </ul>
            <h3>Free Measurement & Installation</h3>
            <p>
              Once you find your perfect floor, BBS Flooring offers{' '}
              <a href="/free-measurement">free in-home measurement</a> anywhere in the GTA — Markham,
              Toronto, Scarborough, Richmond Hill, Vaughan, Pickering, and beyond. Our{' '}
              <a href="/installation">professional installation team</a> handles everything from
              subfloor prep to finishing.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <a
              href="tel:6474281111"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/20 text-lg"
            >
              <Phone className="w-5 h-5" />
              Call (647) 428-1111 for Expert Help
            </a>
            <p className="text-sm text-slate-400 mt-3">Mon–Sat 10am–5pm · Free estimates</p>
          </div>
        </div>
      </section>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What is the best flooring for kitchens?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Vinyl (SPC) flooring is the best choice for kitchens because it is 100% waterproof, scratch-resistant, and easy to clean. BBS Flooring offers vinyl starting from $1.79/sqft with professional installation across the GTA.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is the most durable flooring for pets?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'SPC vinyl flooring and high AC-rated laminate are the most scratch-resistant and pet-friendly options. Look for products with a 20mil+ wear layer for maximum pet protection.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is the cheapest flooring option?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Laminate flooring starts from $1.49/sqft at BBS Flooring, making it the most affordable option. Vinyl flooring starts from $1.79/sqft and offers waterproof protection at a budget-friendly price.',
                },
              },
              {
                '@type': 'Question',
                name: 'How do I choose between hardwood and vinyl?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Choose hardwood for premium look, refinishability, and home value. Choose vinyl for waterproof protection, lower cost, scratch resistance, and easier maintenance. Our Floor Finder quiz helps you decide based on your specific room and lifestyle.',
                },
              },
            ],
          }),
        }}
      />
    </>
  );
}
