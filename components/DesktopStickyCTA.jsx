'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FileText } from 'lucide-react';

// Desktop-only persistent conversion cluster (bottom-right).
// Mobile already has StickyMobileCTA (Call / WhatsApp / Instant Quote bar).
// Desktop previously had ONLY the floating WhatsApp bubble + header phone bar —
// no persistent path to the highest-intent action (Instant Quote). This adds an
// "Instant Quote" pill stacked above the WhatsApp bubble so desktop visitors
// (much of homepage + guide traffic) get the same quote + chat access mobile has.
//
// Replaces the standalone WhatsAppButton (that bubble is folded in here so we
// don't render two floating clusters).
//
// Design: subtle, bottom-right, hidden below lg, hidden on flows where a
// floating CTA would fight the page's own primary action (cart/checkout/booking)
// and on PDPs (they have StickyAddToCart / their own buy box).

const HIDDEN_PATHS = ['/cart', '/checkout', '/view-booking', '/quote-booking', '/quote-calculator'];
const WHATSAPP_URL = 'https://wa.me/message/CQQRGZKI3U2VH1';

// Deep-link Instant Quote to the matching intent branch based on the current page,
// so stairs/removal visitors skip the flooring product gate.
function quoteHrefForPath(pathname) {
  if (/stair/.test(pathname)) return '/quote-calculator?intent=stairs';
  if (/removal/.test(pathname)) return '/quote-calculator?intent=removal';
  return '/quote-calculator';
}

export default function DesktopStickyCTA() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  const isProductDetail = /^\/products\/[^/]+/.test(pathname);
  const isHiddenPage = isProductDetail || HIDDEN_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isHiddenPage) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, [isHiddenPage, pathname]);

  if (!visible || isHiddenPage) return null;

  const quoteHref = quoteHrefForPath(pathname);

  const handleQuoteClick = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'click', {
        event_category: 'Contact',
        event_label: 'instant_quote_desktop_sticky',
        event_action: 'quote_click',
      });
    }
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', { content_name: 'instant_quote_desktop_sticky' });
    }
  };

  const handleWhatsAppClick = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'click', {
        event_category: 'Contact',
        event_label: 'whatsapp_desktop_sticky',
        event_action: 'whatsapp_click',
      });
    }
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Contact', { content_name: 'whatsapp_desktop_sticky' });
    }
  };

  return (
    <div className="hidden lg:flex flex-col items-end gap-3 fixed right-6 bottom-6 z-50">
      {/* Instant Quote pill — highest-intent action */}
      <Link
        href={quoteHref}
        onClick={handleQuoteClick}
        aria-label="Get an instant flooring quote"
        className="group flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold px-5 py-3 shadow-lg transition-all duration-200"
      >
        <FileText className="w-5 h-5" />
        <span className="text-sm">Instant Quote</span>
      </Link>

      {/* WhatsApp bubble (folded in from the old WhatsAppButton) */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsAppClick}
        aria-label="Chat on WhatsApp"
        className="relative flex items-center justify-center rounded-full shadow-lg bg-[#25D366] hover:bg-[#20BD5A] active:scale-95 transition-all duration-200 self-end"
        style={{ width: 56, height: 56 }}
      >
        <svg
          className="w-7 h-7 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
