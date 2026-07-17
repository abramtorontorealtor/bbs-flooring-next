'use client';

import Link from 'next/link';
import { Phone, MessageCircle, FileText } from 'lucide-react';

// Mid-article contextual CTA.
// Injected roughly halfway through a blog article (at a natural <h2> break) so
// engaged-but-not-finished readers get a conversion path WITHOUT scrolling
// 2,000 words to the bottom DeepPageCapture. Category-aware so the offer matches
// what the reader is actively researching.
//
// Design rules (mirrors DeepPageCapture, Abram Jul 1 2026):
//  - WhatsApp + tap-to-call + Instant Quote. Every element looks clickable.
//  - Visually LIGHTER than the bottom capture (this is a soft mid-read nudge,
//    not the closing ask) so the two don't feel like duplicate blocks.

const WHATSAPP_URL = 'https://wa.me/message/CQQRGZKI3U2VH1';
const PHONE_HREF = 'tel:6474281111';

// Keyed to inferProductType() output. Copy speaks to the reader's live question.
const CATEGORY = {
  vinyl: {
    line: 'Not sure which waterproof vinyl is right for your space?',
    quoteLabel: 'Price my vinyl',
  },
  hardwood: {
    line: 'Want help choosing the right engineered hardwood?',
    quoteLabel: 'Price my hardwood',
  },
  'solid-hardwood': {
    line: 'Deciding on a solid hardwood species and finish?',
    quoteLabel: 'Price my hardwood',
  },
  laminate: {
    line: 'Comparing laminate options for your project?',
    quoteLabel: 'Price my laminate',
  },
  stair: {
    line: 'Planning a staircase renovation?',
    quoteLabel: 'Get my stair quote',
  },
};

const GENERIC = {
  line: 'Have a project in mind? Get real advice from our Markham showroom.',
  quoteLabel: 'Get an instant quote',
};

function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function MidArticleCTA({ productType }) {
  const cat = CATEGORY[productType] || GENERIC;
  const quoteHref = productType === 'stair' ? '/quote-calculator?type=stair' : '/quote-calculator';

  const handleWhatsAppClick = () => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'click', {
        event_category: 'Contact',
        event_label: 'whatsapp_midarticle_cta',
        event_action: 'whatsapp_click',
      });
    }
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Contact', { content_name: 'whatsapp_midarticle_cta' });
    }
  };

  return (
    <aside
      aria-label="Get a quote from BBS Flooring"
      className="not-prose my-10 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6"
    >
      <p className="text-base sm:text-lg font-semibold text-slate-800">
        {cat.line}
      </p>
      <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2.5">
        <Link
          href={quoteHref}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
        >
          <FileText className="h-4 w-4" />
          {cat.quoteLabel}
        </Link>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-green-500 hover:text-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          <MessageCircle className="h-4 w-4 text-green-600" />
          WhatsApp us a photo
        </a>
        <a
          href={PHONE_HREF}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-amber-400 hover:text-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
        >
          <Phone className="h-4 w-4 text-amber-500" />
          Call (647) 428-1111
        </a>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Free in-home measurement · No pressure · Family-owned in Markham since 2012
      </p>
    </aside>
  );
}
