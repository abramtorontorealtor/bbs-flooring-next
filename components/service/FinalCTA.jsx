import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import { PHONE_HREF, PHONE_DISPLAY } from '@/lib/service-constants';
import { PhoneIcon } from './ServiceIcons';

/**
 * Dark gradient CTA block — used at the bottom of every service page.
 *
 * @param {string}   title         - Heading text (e.g. 'Ready to Transform Your Space?')
 * @param {string}   subtitle      - Paragraph below heading
 * @param {{ text: string, route?: string, href?: string }} primaryCTA
 * @param {boolean}  showPhoneCTA  - Show phone button (default: true)
 */
export default function FinalCTA({ title, subtitle, primaryCTA, showPhoneCTA = true }) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 text-center text-white mt-12">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3">{title}</h2>
      <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">{subtitle}</p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {primaryCTA.route ? (
          <Link
            href={createPageUrl(primaryCTA.route)}
            className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold text-base px-8 py-3.5 rounded-xl transition-colors"
          >
            {primaryCTA.text}
          </Link>
        ) : (
          <a
            href={primaryCTA.href}
            className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold text-base px-8 py-3.5 rounded-xl transition-colors"
          >
            {primaryCTA.text}
          </a>
        )}
        {showPhoneCTA && (
          <a
            href={PHONE_HREF}
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-8 py-3.5 rounded-xl border border-white/20 transition-colors"
          >
            <PhoneIcon className="w-4 h-4" />
            {PHONE_DISPLAY}
          </a>
        )}
      </div>
    </div>
  );
}
