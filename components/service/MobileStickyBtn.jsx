'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';

/**
 * Mobile sticky CTA bar — appears after scrolling past 600px.
 * Only visible on mobile (md:hidden).
 *
 * @param {string} text  - Button text (e.g. '🪜 Get a Free Stair Quote')
 * @param {string} route - Route key for createPageUrl (default: 'FreeMeasurement')
 * @param {string} href  - Direct href (overrides route if provided)
 */
export default function MobileStickyBtn({ text, route = 'FreeMeasurement', href }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!show) return null;

  const linkHref = href || createPageUrl(route);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3 shadow-xl safe-area-inset-bottom">
      {href ? (
        <a
          href={linkHref}
          className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl text-center text-base transition-colors"
        >
          {text}
        </a>
      ) : (
        <Link
          href={linkHref}
          className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl text-center text-base transition-colors"
        >
          {text}
        </Link>
      )}
    </div>
  );
}
