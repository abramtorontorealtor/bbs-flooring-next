'use client';

import React from 'react';
import { Phone, MessageCircle, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const HIDDEN_PATHS = [
  '/carpet-removal',
  '/products/',
  '/cart',
  '/checkout',
  '/view-booking',
  '/quote-booking',
];

export default function StickyMobileCTA() {
  const pathname = usePathname();

  const isHiddenPage = HIDDEN_PATHS.some((p) => pathname.startsWith(p));

  if (isHiddenPage) return null;

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
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
      <div className="flex items-stretch divide-x divide-slate-200">
        <a
          href="tel:6474281111"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-slate-800 active:bg-slate-50 transition-colors"
        >
          <Phone className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold">Call Now</span>
        </a>

        <a
          href="https://wa.me/message/CQQRGZKI3U2VH1"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-slate-800 active:bg-slate-50 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm font-semibold">WhatsApp</span>
        </a>

        <Link
          href="/quote-calculator"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-amber-500 text-white active:bg-amber-600 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm font-bold">Instant Quote</span>
        </Link>
      </div>
    </div>
  );
}
