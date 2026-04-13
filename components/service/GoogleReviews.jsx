import Link from 'next/link';
import { GOOGLE_RATING, GOOGLE_REVIEW_COUNT } from '@/lib/service-constants';
import { StarIcon } from './ServiceIcons';

/**
 * Google Reviews section — rating badge + review cards.
 *
 * @param {string}   title   - Section heading (default: 'What Our Customers Say')
 * @param {{ text: string, name: string }[]} reviews - Array of review objects
 * @param {string}   bg      - Background class (default: 'bg-white')
 */
export default function GoogleReviews({ title = 'What Our Customers Say', reviews, bg = 'bg-white' }) {
  return (
    <section className={`py-12 md:py-16 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 text-center">{title}</h2>

        {/* Rating badge */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex gap-0.5 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-5 h-5" />
            ))}
          </div>
          <span className="text-lg font-semibold text-slate-700">{GOOGLE_RATING}/5 from {GOOGLE_REVIEW_COUNT} Google Reviews</span>
        </div>

        {/* Review cards */}
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {reviews.map(({ text, name }) => (
            <div key={name} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="flex gap-0.5 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-3.5 h-3.5" />
                ))}
              </div>
              <p className="text-sm text-slate-600 italic leading-relaxed mb-3">&ldquo;{text}&rdquo;</p>
              <p className="text-xs font-bold text-slate-700">— {name}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link
            href="https://www.google.com/maps/place/BBS+Flooring/@43.8476,-79.3252,17z"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:text-amber-700 font-semibold text-sm underline underline-offset-2"
          >
            Read all {GOOGLE_REVIEW_COUNT} reviews on Google →
          </Link>
        </div>
      </div>
    </section>
  );
}
