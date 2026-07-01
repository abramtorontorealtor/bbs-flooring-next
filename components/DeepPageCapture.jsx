import Link from 'next/link';

// Deep-page contextual capture block.
// Rendered at the end of blog/guide/deep pages (where ~86% of organic clicks land
// and currently dead-end). Category-aware: sells the reader on browsing the exact
// floor type they just read about, plus one-tap human contact (WhatsApp / phone).
//
// Design rules (Abram, Jul 1 2026):
//  - NO email form. WhatsApp + tap-to-call only.
//  - Every clickable element must LOOK clickable: real buttons with chrome, or
//    underlined/coloured links with hover. No bolded-text-as-link.

const WHATSAPP_URL = 'https://wa.me/message/CQQRGZKI3U2VH1';
const PHONE_DISPLAY = '(647) 428-1111';
const PHONE_HREF = 'tel:6474281111';

// Category config keyed by the blog page's inferProductType() output.
// count = honest floor of live in-stock products (verified 2026-07-01):
//   engineered_hardwood 469, vinyl 230, laminate 109, solid_hardwood 59.
const CATEGORY = {
  vinyl: { label: 'Vinyl', href: '/vinyl', count: '200+', noun: 'vinyl floors' },
  hardwood: { label: 'Engineered Hardwood', href: '/engineered-hardwood', count: '400+', noun: 'engineered hardwood floors' },
  'solid-hardwood': { label: 'Solid Hardwood', href: '/solid-hardwood', count: '50+', noun: 'solid hardwood floors' },
  laminate: { label: 'Laminate', href: '/laminate', count: '100+', noun: 'laminate floors' },
  stair: { label: 'Stairs', href: '/stairs', count: null, noun: 'stair options' },
};

function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PhoneIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ArrowIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function DeepPageCapture({ productType, className = '' }) {
  const cat = CATEGORY[productType] || null;
  const browseNoun = cat ? cat.noun : 'flooring options';
  const browseHref = cat ? cat.href : '/products';
  const browseCount = cat && cat.count ? `${cat.count} ` : '';

  return (
    <section
      aria-label="Talk to BBS Flooring"
      className={`max-w-3xl mx-auto px-4 sm:px-6 mb-16 ${className}`}
    >
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-7 sm:p-9 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Ready to see it in your home?
        </h2>
        <p className="mt-3 text-slate-600 text-base sm:text-lg leading-relaxed">
          Message us a photo of your room and we&apos;ll help you pick the right{' '}
          {cat ? cat.label.toLowerCase() : 'floor'} — real advice from our Markham showroom,
          no call centre, no pressure.
        </p>

        {/* Primary contact actions — obvious buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Message us on WhatsApp
          </a>
          <a
            href={PHONE_HREF}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-800 transition-colors hover:border-amber-400 hover:text-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            <PhoneIcon className="h-5 w-5 text-amber-500" />
            Call {PHONE_DISPLAY}
          </a>
        </div>

        {/* Category browse link — underlined + coloured + hover, clearly a link */}
        <div className="mt-6 border-t border-amber-200 pt-5">
          <Link
            href={browseHref}
            className="group inline-flex items-center gap-1.5 text-base font-semibold text-amber-700 underline underline-offset-4 decoration-amber-300 transition-colors hover:text-amber-900 hover:decoration-amber-500"
          >
            Shop our {browseCount}in-stock {browseNoun}
            <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="mt-2 text-sm text-slate-500">
            4.7★ on Google · Family-owned since 2012 · Our own install crew · Free in-home measurement
          </p>
        </div>
      </div>
    </section>
  );
}
