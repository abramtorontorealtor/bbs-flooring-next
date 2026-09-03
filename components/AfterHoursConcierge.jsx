'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Compass, X } from 'lucide-react';
import useBusinessHours from '@/components/useBusinessHours';

/**
 * Non-blocking after-hours nudge (desktop only) pointing closed-hours traffic
 * at /floor-finder instead of a dead-quiet showroom. Never competes with the
 * sticky CTAs (bottom-right owned by DesktopStickyCTA) — this lives bottom-left
 * and sits one z-layer below them.
 */

const DISMISS_KEY = 'bbs-afterhours-finder-dismissed';
const SHOW_DELAY_MS = 8000;
const WHATSAPP_URL = 'https://wa.me/message/CQQRGZKI3U2VH1';

const HIDDEN_PATHS = [
  '/cart',
  '/checkout',
  '/view-booking',
  '/quote-booking',
  '/quote-calculator',
  '/floor-finder',
  '/carpet-removal',
];

export default function AfterHoursConcierge() {
  const pathname = usePathname();
  const { open, nextOpen } = useBusinessHours();
  const [show, setShow] = useState(false);
  const shownTracked = useRef(false);

  const isProductDetail = /^\/products\/[^/]+/.test(pathname);
  const isHiddenPage = isProductDetail || HIDDEN_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (open !== false || isHiddenPage) {
      setShow(false);
      return;
    }

    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch (_) {
      dismissed = false;
    }
    if (dismissed) return;

    const timer = setTimeout(() => setShow(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [open, isHiddenPage, pathname]);

  useEffect(() => {
    if (show && !shownTracked.current) {
      shownTracked.current = true;
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'afterhours_nudge_shown');
      }
    }
  }, [show]);

  if (!show) return null;

  const track = (target) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'afterhours_nudge_click', { target });
    }
  };

  const dismiss = (target = 'dismiss') => {
    track(target);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch (_) {}
    setShow(false);
  };

  return (
    <div
      className="hidden lg:block fixed bottom-6 left-6 z-40 max-w-sm rounded-2xl bg-white shadow-xl border border-slate-200 p-5"
      role="dialog"
      aria-label="After-hours flooring finder suggestion"
    >
      <button
        type="button"
        onClick={() => dismiss('dismiss')}
        aria-label="Dismiss"
        className="absolute right-3 top-3 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
      >
        <X className="w-4 h-4" />
      </button>

      <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 pr-6">
        Showroom&rsquo;s closed &mdash; back {nextOpen}
      </p>
      <h3 className="mt-1.5 text-base font-bold text-slate-900 pr-6">
        Find your floor now in 60 seconds
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        5 quick questions, 3 real in-stock matches, instant quote.
      </p>

      <Link
        href="/floor-finder"
        onClick={() => track('finder')}
        className="mt-4 flex items-center justify-center gap-2 w-full rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold px-4 py-2.5 text-sm transition-all duration-200"
      >
        <Compass className="w-4 h-4" />
        <span>Find my floor &rarr;</span>
      </Link>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('whatsapp')}
        className="mt-2.5 block text-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
      >
        or ask on WhatsApp
      </a>
    </div>
  );
}
