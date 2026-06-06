import { Suspense } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import { stairsImages, flooringImages, commercialImages } from '@/data/galleryImages';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';
import GalleryInteractive from '@/components/GalleryInteractive';

export const metadata = {
  title: 'Flooring Project Gallery | Markham Toronto Durham',
  description: 'Browse our portfolio of flooring and staircase projects across Markham, Toronto, and Durham. See real installations by BBS Flooring.',
  alternates: { canonical: '/gallery' },
};

export default function GalleryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Suspense fallback={null}>
        <Breadcrumbs items={getStaticBreadcrumbs('/gallery')} />
      </Suspense>

      {/* SSR: H1 + intro text — Google sees this */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Our Project Gallery</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Browse our recent flooring and staircase projects across Markham, Toronto, and Durham Region.
          From hardwood stair refinishing to luxury vinyl plank installations, see the quality craftsmanship
          BBS Flooring delivers to homeowners across the GTA.
        </p>
      </div>

      {/* SSR: Category counts for crawlers */}
      <div className="sr-only">
        <h2>Staircase Projects ({stairsImages.length} photos)</h2>
        <h2>Flooring Installations ({flooringImages.length} photos)</h2>
        <h2>Commercial Projects ({commercialImages.length} photos)</h2>
      </div>

      {/* Client island: tab switching + image grid + lightbox */}
      <Suspense fallback={
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stairsImages.slice(0, 8).map((img, idx) => (
            <div key={idx} className="rounded-xl overflow-hidden shadow-sm">
              <img
                src={img.url}
                alt={img.alt_text || img.alt || 'BBS Flooring project'}
                className="w-full aspect-square object-cover"
                loading={idx < 4 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      }>
        <GalleryInteractive />
      </Suspense>

      {/* SSR: Bottom CTA section */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Ready to Start Your Project?</h2>
        <p className="text-slate-600 mb-6 max-w-xl mx-auto">
          Every project in our gallery started with a free in-home measurement. Book yours today
          and see how BBS Flooring can transform your space.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href={createPageUrl('FreeMeasurement')}>
            <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Book Free Measurement
            </button>
          </Link>
          <Link href={createPageUrl('Contact')}>
            <button className="bg-white hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3 rounded-xl border border-slate-200 transition-colors">
              Contact Us
            </button>
          </Link>
        </div>
      </div>

      {/* SSR: SEO content block — services + areas */}
      <div className="mt-16 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-3">Professional Flooring Installation Across the GTA</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          BBS Flooring has been serving Markham, Toronto, Scarborough, Richmond Hill, Vaughan, Pickering,
          Ajax, Whitby, and Durham Region for over 13 years. Our in-house installation team specializes in
          engineered hardwood, solid hardwood, luxury vinyl plank (LVP), laminate flooring, and staircase
          refinishing. Every project in our gallery was completed by our own crew — never subcontractors.
        </p>
      </div>
    </div>
  );
}
