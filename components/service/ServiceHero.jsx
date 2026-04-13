import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';
import { GOOGLE_RATING, GOOGLE_REVIEW_COUNT, PHONE_HREF, PHONE_DISPLAY } from '@/lib/service-constants';
import { PhoneIcon } from './ServiceIcons';

/**
 * Unified dark hero for all service pages.
 *
 * @param {string}   heroImage       - Full CDN URL for background image
 * @param {string}   heroAlt         - Alt text for hero background
 * @param {string}   breadcrumbPath  - Path for getStaticBreadcrumbs (e.g. '/stair-refinishing')
 * @param {string[]} badges          - Array of badge strings (e.g. ['⭐ 4.7/5', '🛡️ WSIB'])
 * @param {string}   titleLine1      - First line of H1
 * @param {string}   titleLine2      - Second line (amber highlight), optional
 * @param {string}   subtitle        - Paragraph below title
 * @param {{ value: string, label: string }[]} pricingPills - Pricing pill data
 * @param {{ text: string, href?: string, route?: string }} primaryCTA - Primary button
 * @param {boolean}  showPhoneCTA    - Show phone CTA (default true)
 */
export default function ServiceHero({
  heroImage,
  heroAlt,
  breadcrumbPath,
  badges,
  titleLine1,
  titleLine2,
  subtitle,
  pricingPills,
  primaryCTA,
  showPhoneCTA = true,
}) {
  // Auto-inject Google rating badge if not already in badges
  const displayBadges = badges || [
    `⭐ ${GOOGLE_RATING}/5 from ${GOOGLE_REVIEW_COUNT} Reviews`,
    '🛡️ WSIB Insured',
  ];

  return (
    <div className="relative bg-slate-900 text-white overflow-hidden">
      <img
        src={heroImage}
        alt={heroAlt}
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-14 md:pb-24">
        <Breadcrumbs items={getStaticBreadcrumbs(breadcrumbPath)} variant="dark" />

        <div className="flex flex-wrap gap-2 mb-6 mt-2">
          {displayBadges.map(badge => (
            <span key={badge} className="bg-white/10 backdrop-blur-sm text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15">
              {badge}
            </span>
          ))}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 max-w-4xl">
          {titleLine1}
          {titleLine2 && (
            <>
              <br />
              <span className="text-amber-400">{titleLine2}</span>
            </>
          )}
        </h1>

        <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
          {subtitle}
        </p>

        {pricingPills && pricingPills.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            {pricingPills.map(pill => (
              <div key={pill.label} className="bg-white/10 backdrop-blur rounded-xl px-4 py-2.5 text-center min-w-[100px]">
                <p className="text-xl md:text-2xl font-black text-amber-400">{pill.value}</p>
                <p className="text-[11px] text-slate-300 leading-tight">{pill.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {primaryCTA.route ? (
            <Link
              href={createPageUrl(primaryCTA.route)}
              className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold text-base px-7 py-3.5 rounded-xl transition-colors"
            >
              {primaryCTA.text}
            </Link>
          ) : (
            <a
              href={primaryCTA.href}
              className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold text-base px-7 py-3.5 rounded-xl transition-colors"
            >
              {primaryCTA.text}
            </a>
          )}
          {showPhoneCTA && (
            <a
              href={PHONE_HREF}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold text-base px-7 py-3.5 rounded-xl border border-white/20 transition-colors"
            >
              <PhoneIcon className="w-4 h-4" />
              {PHONE_DISPLAY}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
