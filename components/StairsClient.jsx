'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPageUrl } from '@/lib/routes';
import { CheckCircle, Star, ArrowRight, DollarSign, Shield } from 'lucide-react';
import { stairsImages } from '@/data/galleryImages';
import RelatedCategories from '@/components/RelatedCategories';
import StaticFAQ from '@/components/StaticFAQ';
import { GOOGLE_RATING, GOOGLE_REVIEW_COUNT } from '@/lib/service-constants';
import SpokeLinks from '@/components/SpokeLinks';
import FinancingBanner from '@/components/FinancingBanner';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';
import { STAIRS_FAQS } from '@/data/faqs';

const STAIRS_SPOKE_LINKS = [
  { route: 'StairRefinishing', label: 'Staircase Refinishing & Staining', description: 'Restore your hardwood stairs with professional sanding, staining & finishing' },
  { route: 'CarpetToHardwoodStairs', label: 'Carpet to Hardwood Stairs', description: 'Replace worn carpet with beautiful hardwood treads — pricing & process guide' },
  { route: 'HardwoodRefinishing', label: 'Hardwood Floor Refinishing', description: 'Match your refinished stairs with freshly refinished hardwood floors' },
  { route: 'Installation', label: 'Flooring Installation Services', description: 'Full-service flooring installation from $2.00/sqft — we move your furniture' },
  { route: 'Gallery', label: 'Project Gallery', description: 'Browse completed staircase and flooring projects across the GTA' },
];

export default function StairsClient() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: 'Stairs' });
    }
  }, []);

  const services = [
    'Staircase refinishing & sanding',
    'Hardwood stair tread installation',
    'Vinyl stair caps & stair covers',
    'Wood & glass stair railing installation',
    'Custom indoor handrails',
    'Full staircase renovations',
  ];

  const whyChoose = [
    'Professional stair contractors near you',
    'Beautiful, code-compliant handrail and baluster installs',
    'Durable wood, vinyl, and metal materials',
    'Financing available for stair & flooring packages',
    'Free in-home measurement and estimates',
    'WSIB covered with full business insurance',
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-50 to-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumbs items={getStaticBreadcrumbs('/stairs')} />
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Staircase Renovation & Installation – Markham, Toronto & Durham
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl">
            Transform your staircase with expert craftsmanship - from refinishing to complete renovations, railings, and custom handrails
          </p>
        </div>
      </div>

      {/* Service Hero */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            <div className="max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Professional Stair Recapping & Refinishing
              </h2>
              <p className="text-xl text-slate-200 mb-6 leading-relaxed">
                Replace worn carpet with solid hardwood treads. Custom staining, railing installation, and complete staircase transformations.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={createPageUrl('FreeMeasurement')} className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg px-8 py-3 rounded-xl transition-colors">
                  Book Measurement
                </Link>
                <Link href={createPageUrl('Contact')} className="inline-block border-2 border-white text-white hover:bg-white hover:text-slate-900 font-semibold text-lg px-8 py-3 rounded-xl transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="max-w-4xl mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Transform Your Staircase With Expert Craftsmanship</h2>
          <p className="text-lg text-slate-600 mb-4">
            Looking for professional <strong>stair refinishing</strong>, <strong>wooden stair renovations</strong>, or <strong>handrail installations</strong>? At BBS Flooring, we specialize in complete staircase transformations — from hardwood stair steps and vinyl stair treads to elegant glass and wood railings.
          </p>
          <p className="text-lg text-slate-600">
            Explore real projects completed across <strong>Markham, Toronto, and Durham</strong>. Whether you want to install indoor handrails, replace stair caps, or fully renovate your staircase, our team delivers high-end results with affordable options.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">Popular Staircase Services We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-amber-500 hover:shadow-lg transition-all">
                <CheckCircle className="w-8 h-8 text-amber-600 mb-3" />
                <h3 className="font-bold text-lg text-slate-800">{service}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Staircase Pricing */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Staircase Renovation Pricing</h2>
          <p className="text-lg text-slate-600 mb-8">
            Transparent, all-inclusive pricing for every staircase service. No hidden fees — all prices include labour and materials unless noted.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Stair Treads */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-8 h-8 text-amber-600" />
                <h3 className="text-xl font-bold text-slate-800">Stair Treads</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-700 font-medium">Sand & Restain (Refinish) Treads</span>
                  <span className="text-xl font-bold text-amber-600">$125/step</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-700 font-medium">New Straight Steps</span>
                  <span className="text-xl font-bold text-amber-600">$185/step</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-slate-700 font-medium">New Pie / Triangle / Bullnose Steps</span>
                  <span className="text-xl font-bold text-amber-600">$225/step</span>
                </div>
              </div>
            </div>

            {/* Railings & Pickets */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-8 h-8 text-amber-600" />
                <h3 className="text-xl font-bold text-slate-800">Railings & Pickets</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-700 font-medium">Sand & Restain Rails</span>
                  <span className="text-xl font-bold text-amber-600">$25/ft</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-slate-700 font-medium">New Iron or Wood Pickets</span>
                  <span className="text-xl font-bold text-amber-600">$25/piece</span>
                </div>
                <p className="text-sm text-slate-500 italic">Installed with material included</p>
              </div>
            </div>

            {/* Nosing */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-8 h-8 text-amber-600" />
                <h3 className="text-xl font-bold text-slate-800">Stair Nosing</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-700 font-medium">Sand & Restain Nosing</span>
                  <span className="text-xl font-bold text-amber-600">$25/ft</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-slate-700 font-medium">New Nosing</span>
                  <span className="text-xl font-bold text-amber-600">$30/ft</span>
                </div>
              </div>
            </div>

            {/* Example Project Cost */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">💡 Example: 13-Step Staircase</h3>
              <div className="space-y-3 text-slate-700">
                <div className="flex justify-between">
                  <span>Refinish 13 treads</span>
                  <span className="font-semibold">$1,625</span>
                </div>
                <div className="flex justify-between">
                  <span>Sand & restain rails (~12ft)</span>
                  <span className="font-semibold">$300</span>
                </div>
                <div className="flex justify-between">
                  <span>Nosing refinish (~12ft)</span>
                  <span className="font-semibold">$300</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-amber-300">
                  <span className="font-bold text-lg">Full Refinish Estimate</span>
                  <span className="font-bold text-lg text-amber-700">~$2,225</span>
                </div>
              </div>
              <Link href={createPageUrl('FreeMeasurement')} className="block w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-center py-3 rounded-xl transition-colors">
                Get Your Exact Quote — Free
              </Link>
            </div>
          </div>
        </div>

        {/* WSIB Trust Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-2xl p-6 md:p-8 mb-16">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0">
              <Shield className="w-16 h-16 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">WSIB Covered · Business Insured · You&apos;re Protected</h3>
              <p className="text-slate-600 text-lg">
                All staircase work is performed by our <strong>WSIB-covered</strong> crew with full <strong>commercial liability insurance</strong>.
                You&apos;re never liable if anything happens during your project. Many contractors in the GTA don&apos;t carry WSIB — always ask before hiring.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-amber-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">Why Homeowners Choose BBS Flooring</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {whyChoose.map((reason, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Star className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <span className="text-lg text-slate-700">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Gallery */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Staircase Project Gallery</h2>
          <p className="text-lg text-slate-600 mb-8">
            Browse our completed staircase projects across Markham, Toronto, and Durham. See the quality craftsmanship and attention to detail that goes into every installation.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stairsImages.slice(0, 12).map((image, idx) => (
              <div key={idx} className="aspect-square bg-slate-100 rounded-lg overflow-hidden group cursor-pointer">
                <Image
                  src={image.url}
                  alt={image.alt || image.alt_text || `Staircase renovation project ${idx + 1} by BBS Flooring in Markham`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  width={400}
                  height={400}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/gallery" className="inline-flex items-center gap-2 border-2 border-amber-600 text-amber-700 hover:bg-amber-50 font-semibold px-6 py-3 rounded-xl transition-colors">
              View Full Gallery <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* SEO Content */}
        <div className="prose prose-lg max-w-4xl mb-16">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Expert Stair Installation & Renovation Services</h2>
          <p className="text-slate-600 mb-4">
            Your staircase is more than just a functional element—it&apos;s a focal point of your home&apos;s design. Whether you&apos;re looking to install <strong>hardwood stair treads</strong>, update to modern <strong>vinyl stair caps</strong>, or add elegant <strong>glass and wood railings</strong>, our team brings years of experience to every project.
          </p>
          <p className="text-slate-600 mb-4">
            We work with homeowners throughout the <strong>Greater Toronto Area</strong> to transform tired, outdated staircases into stunning architectural features. From traditional wooden handrails to contemporary metal balusters, we offer solutions for every style and budget.
          </p>
          <p className="text-slate-600">
            Our staircase services include everything from basic <strong>staircase refinishing and sanding</strong> to complete renovations with custom <strong>indoor handrail installations</strong>. All work is completed to code with beautiful, lasting results.
          </p>
        </div>

        {/* Customer Reviews */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">What Our Customers Say</h2>
          <div className="flex items-center gap-2 mb-8">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-slate-700">{GOOGLE_RATING}/5 from {GOOGLE_REVIEW_COUNT} Google Reviews</span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: '"Of all repairs I have done so far, this is the best — redo my whole staircase. Best in professionalism, timely, knowledgeable. All these at the most reasonable cost."', name: 'N.H.', note: 'Staircase Project' },
              { text: '"So happy with my flooring and stairs! Quality workmanship and great customer service! They went above and beyond to accommodate, really shows they want your business."', name: 'Rachel M.', note: 'Flooring & Stairs' },
              { text: '"The flooring done at my business is perfect, the customer service was most appreciated. They really make you feel special. 10/10 would recommend."', name: 'Renaissound', note: 'Commercial Project' },
            ].map(({ text, name, note }) => (
              <div key={name} className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4 italic">{text}</p>
                <p className="font-semibold text-slate-800">— {name}</p>
                <p className="text-sm text-slate-500">Google Review — {note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <a href="https://g.page/r/CWJpmP-Dl-g4EBM/review" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 font-semibold underline">
              Read all {GOOGLE_REVIEW_COUNT} reviews on Google →
            </a>
          </div>
        </div>

        <FinancingBanner monthlyFrom={54} />

        <StaticFAQ
          faqItems={STAIRS_FAQS}
          title="Frequently Asked Questions About Staircase Renovation"
          subtitle="Common questions from homeowners in Markham, Toronto & Durham about stair installation and refinishing"
          schemaId="faq-stairs"
          skipSchema
        />

        <SpokeLinks
          title="Explore Our Staircase & Related Services"
          links={STAIRS_SPOKE_LINKS}
        />

        {/* CTA */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-12 text-center text-white mt-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Staircase?</h2>
          <p className="text-xl mb-8 text-amber-50">
            Book a free in-home measurement and get expert advice on your staircase project
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={createPageUrl('FreeMeasurement')} className="inline-block bg-white text-amber-700 hover:bg-amber-50 font-semibold text-lg px-8 py-3 rounded-xl transition-colors">
              Book Free Measurement
            </Link>
            <a href="tel:6474281111" className="inline-block border-2 border-white text-white hover:bg-white hover:text-amber-700 font-semibold text-lg px-8 py-3 rounded-xl transition-colors">
              Call (647) 428-1111
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <RelatedCategories currentPage="Stairs" />
      </div>
    </div>
  );
}
