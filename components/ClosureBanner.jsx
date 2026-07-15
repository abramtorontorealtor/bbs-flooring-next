'use client';

import { useEffect, useState } from 'react';

/**
 * Site-wide temporary closure banner.
 *
 * One-off notice: showroom closed Wed July 15, 2026 due to the Ontario
 * wildfire-smoke air quality warning (Environment Canada, AQHI high/very-high).
 *
 * Self-expiring: only renders through end of day July 15, 2026 America/Toronto.
 * After that it renders nothing, so a forgotten banner cannot linger on the site.
 * Dismissible per-visitor via sessionStorage.
 */

// Show through 2026-07-16 04:00 UTC == 2026-07-16 00:00 ET (end of Jul 15 ET).
const EXPIRES_AT = Date.parse('2026-07-16T04:00:00Z');
const DISMISS_KEY = 'bbs-closure-2026-07-15-dismissed';

export default function ClosureBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (Date.now() >= EXPIRES_AT) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return;
    } catch (_) {
      // sessionStorage unavailable — still show the notice
    }
    setShow(true);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch (_) {}
    setShow(false);
  };

  return (
    <div
      role="alert"
      className="relative bg-red-700 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-2.5 pr-10 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium leading-snug sm:text-base">
          <span aria-hidden="true" className="mr-1.5">⚠️</span>
          <span className="font-semibold">Showroom closed today (Wed, July&nbsp;15)</span>{' '}
          due to the Ontario air quality warning. Online orders &amp; quote
          requests are still open — we&apos;ll respond as soon as we reopen.
          Thanks for your patience &amp; stay safe.
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss closure notice"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/90 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </div>
  );
}
