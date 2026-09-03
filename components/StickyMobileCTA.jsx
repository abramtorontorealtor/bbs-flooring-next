'use client';

import React from 'react';
import { Phone, MessageCircle, FileText, Compass } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import useBusinessHours from '@/components/useBusinessHours';

const HIDDEN_PATHS = [
  '/carpet-removal',
  '/cart',
  '/checkout',
  '/view-booking',
  '/quote-booking',
];

// Deep-link the Instant Quote to the right intent based on the page the visitor is on,
// so stairs/removal traffic lands on the matching quote branch (not the flooring gate).
function quoteHrefForPath(pathname) {
  if (/stair/.test(pathname)) return '/quote-calculator?intent=stairs';
  if (/removal/.test(pathname)) return '/quote-calculator?intent=removal';
  return '/quote-calculator';
}

export default function StickyMobileCTA() {
  const pathname = usePathname();
  const { open } = useBusinessHours();

  // Hide on explicit paths + individual product detail pages (they have StickyAddToCart)
  const isProductDetail = /^\/products\/[^/]+/.test(pathname);
  const isHiddenPage = isProductDetail || HIDDEN_PATHS.some((p) => pathname.startsWith(p));

  if (isHiddenPage) return null;

  const quoteHref = quoteHrefForPath(pathname);
  const hours = open ? 'open' : 'closed';

  const trackStickyClick = (button) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'sticky_cta_click', {
        button,
        surface: 'mobile_bar',
        hours,
      });
    }
  };

  const handleCallClick = () => {
    trackStickyClick('call');
  };

  const handleWhatsAppClick = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'click', {
        event_category: 'Contact',
        event_label: 'whatsapp_sticky_cta',
        event_action: 'whatsapp_click',
      });
    }
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Contact', { content_name: 'whatsapp_sticky_cta' });
    }
    trackStickyClick('whatsapp');
  };

  const handleQuoteClick = () => {
    trackStickyClick('quote');
  };

  const handleFinderClick = () => {
    trackStickyClick('finder');
  };

  // While `open` is unresolved (pre-mount, hydration-safe), fall back to the
  // default open-hours UI (Instant Quote).
  const showFinder = open === false;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
      <div className="flex items-stretch divide-x divide-slate-200">
        <a
          href="tel:6474281111"
          onClick={handleCallClick}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-slate-800 active:bg-slate-50 transition-colors"
        >
          <Phone className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold whitespace-nowrap truncate">Call Now</span>
        </a>

        <a
          href="https://wa.me/message/CQQRGZKI3U2VH1"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-slate-800 active:bg-slate-50 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm font-semibold whitespace-nowrap truncate">WhatsApp</span>
        </a>

        {showFinder ? (
          <Link
            href="/floor-finder"
            onClick={handleFinderClick}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-amber-500 text-white active:bg-amber-600 transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span className="text-sm font-bold whitespace-nowrap truncate">Find my floor</span>
          </Link>
        ) : (
          <Link
            href={quoteHref}
            onClick={handleQuoteClick}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-amber-500 text-white active:bg-amber-600 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm font-bold whitespace-nowrap truncate">Instant Quote</span>
          </Link>
        )}
      </div>
    </div>
  );
}
