import Image from 'next/image';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';

/**
 * Service page project gallery — 6 images in 2x3/3x2 grid.
 *
 * @param {string}   title       - Section heading
 * @param {string}   subtitle    - Optional subtitle
 * @param {{ url: string, alt_text?: string, alt?: string }[]} images - Gallery images (6 recommended)
 * @param {string}   galleryLink - Link text for "View all" (default: 'View all projects')
 * @param {number}   totalCount  - Number to show in link (e.g. "View all 47 projects")
 * @param {string}   bg          - Background class (default: 'bg-white')
 */
export default function ServiceGallery({ title, subtitle, images, galleryLink, totalCount, bg = 'bg-white' }) {
  return (
    <section className={`py-12 md:py-16 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">{title}</h2>
        {subtitle && (
          <p className="text-slate-500 text-center mb-8 max-w-2xl mx-auto">{subtitle}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden group">
              <Image
                src={img.url}
                alt={img.alt_text || img.alt || `BBS Flooring project ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href={createPageUrl('Gallery')}
            className="text-amber-600 hover:text-amber-700 font-semibold text-sm underline underline-offset-2"
          >
            {galleryLink || `View all${totalCount ? ` ${totalCount}` : ''} projects`} →
          </Link>
        </div>
      </div>
    </section>
  );
}
