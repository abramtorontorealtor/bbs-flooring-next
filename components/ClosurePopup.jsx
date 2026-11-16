'use client';

import { useEffect, useState } from 'react';

/**
 * One-off temporary closure popup (floating modal — does NOT affect page layout).
 *
 * Notice: showroom closed Thu Nov 19 – Sat Nov 21, 2026 (inventory count & showroom refresh). Phones off; text/WhatsApp/email/online quotes open.
 *
 * Self-expiring: only renders through end of day November 21, 2026 America/Toronto.
 * After that it renders nothing, so a forgotten popup cannot linger.
 * Dismissible per-visitor via sessionStorage (won't nag on every page view).
 *
 * Rendered as a fixed-position overlay, so unlike the old top banner it never
 * reserves space in the document flow and cannot push/break the header layout.
 */

// Show through 2026-11-22 05:00 UTC == 2026-11-22 00:00 ET (end of Nov 21 ET, EST).
const EXPIRES_AT = Date.parse('2026-11-22T05:00:00Z');
const DISMISS_KEY = 'bbs-closure-2026-11-19-21-dismissed';

export default function ClosurePopup() {
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="closure-title"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* card */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close notice"
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>

        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
          <span aria-hidden="true">🕒</span>
        </div>

        <h2 id="closure-title" className="text-lg font-bold text-slate-900">
          Showroom Closed Nov 19–21
        </h2>
        <p className="mt-1 text-sm font-medium text-amber-700">Thursday, Nov&nbsp;19 – Saturday, Nov&nbsp;21</p>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Our showroom is closed Thu Nov&nbsp;19 – Sat Nov&nbsp;21 for our
          annual inventory count &amp; showroom refresh. Back Monday Nov&nbsp;23
          with new samples on the floor.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Phones are off those days — text or WhatsApp{' '}
          <a href="sms:6474281111" className="font-semibold text-slate-900 underline">647-428-1111</a>,
          email{' '}
          <a href="mailto:info@bbsflooring.ca" className="font-semibold text-slate-900 underline">info@bbsflooring.ca</a>,
          or request a quote online. Online orders &amp; quote requests stay open
          and we reply the same day.
        </p>

        <button
          type="button"
          onClick={dismiss}
          className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
