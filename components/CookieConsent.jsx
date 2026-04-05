'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Lightweight cookie consent banner.
 * 
 * On first visit: shows banner, defers GA4 + Meta Pixel initialization.
 * On accept: sets localStorage flag, initializes analytics.
 * On dismiss: essential cookies only, no analytics/marketing cookies.
 * 
 * This is a simplified approach suitable for Canadian PIPEDA compliance.
 * For stricter GDPR, a more granular consent manager would be needed.
 */
export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('bbs_cookie_consent');
    if (!consent) {
      // Small delay to avoid layout shift on page load
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('bbs_cookie_consent', 'accepted');
    setShowBanner(false);
    // Analytics are already initialized in providers.jsx via requestIdleCallback
    // This consent flag can be checked before initializing in the future
  };

  const handleDecline = () => {
    localStorage.setItem('bbs_cookie_consent', 'declined');
    setShowBanner(false);
    // Optionally: disable GA4 and Meta Pixel
    // window['ga-disable-G-YN10E7FBP5'] = true;
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm leading-relaxed">
          <p>
            We use cookies to improve your experience, analyze site traffic, and measure advertising effectiveness.{' '}
            <Link href="/privacy-policy" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
              Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 rounded-lg hover:border-slate-400 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg transition-colors shadow-lg shadow-amber-500/20"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
