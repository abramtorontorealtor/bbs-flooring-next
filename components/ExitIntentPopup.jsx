'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Calculator, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { entities } from '@/lib/base44-compat';

const STORAGE_KEY = 'bbs_exit_popup_shown';
const SUPPRESSED_PATHS = ['/cart', '/checkout', '/view-booking', '/quote-booking', '/admin'];

export default function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isSuppressed = SUPPRESSED_PATHS.some((p) => pathname.startsWith(p));

  const showPopup = useCallback(() => {
    if (isSuppressed) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    setVisible(true);
    sessionStorage.setItem(STORAGE_KEY, '1');
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'exit_intent_shown', { event_category: 'Engagement' });
    }
  }, [isSuppressed]);

  useEffect(() => {
    if (isSuppressed) return;
    if (typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY)) return;

    const pageLoadTime = Date.now();

    // ── Engagement gates (intelligent timing) ───────────────────────────────
    // Don't bother people who just landed. Only treat a leave as "exit intent"
    // once the visitor has actually engaged with the page.
    const DESKTOP_MIN_TIME_MS = 25000;   // 25s minimum dwell before arming
    const DESKTOP_ENGAGED_TIME_MS = 40000; // OR 40s = engaged regardless of scroll
    const DESKTOP_SCROLL_PX = 400;       // OR scrolled a meaningful amount
    const MOBILE_MIN_TIME_MS = 35000;    // mobile needs real dwell too
    const MOBILE_SCROLL_RATIO = 0.45;    // ...and to have read ~half the page
    const MOBILE_ENGAGED_TIME_MS = 70000; // OR a long dwell with some scroll

    let maxScroll = 0;
    let lastScrollY = window.scrollY || 0;
    let lastDirection = 0; // 1 = down, -1 = up

    const scrollDepthPx = () => maxScroll;
    const scrollRatio = () => {
      const doc = document.documentElement;
      const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
      return Math.min(1, maxScroll / scrollable);
    };

    const onScroll = () => {
      const y = window.scrollY || 0;
      if (y > maxScroll) maxScroll = y;
      lastDirection = y < lastScrollY ? -1 : y > lastScrollY ? 1 : lastDirection;
      lastScrollY = y;
    };

    // Desktop exit-intent: cursor bolts to the top chrome (tabs/address bar),
    // but only after genuine engagement.
    const desktopEngaged = () => {
      const t = Date.now() - pageLoadTime;
      if (t < DESKTOP_MIN_TIME_MS) return false;
      return t >= DESKTOP_ENGAGED_TIME_MS || scrollDepthPx() >= DESKTOP_SCROLL_PX;
    };

    const handleMouseLeave = (e) => {
      if (e.clientY <= 5 && desktopEngaged()) {
        showPopup();
      }
    };

    // Mobile exit signal: a fast flick back to the very top (the classic
    // "I'm done, leaving" gesture) OR a back-navigation attempt — gated behind
    // real engagement so we never interrupt an actively-reading visitor.
    const mobileEngaged = () => {
      const t = Date.now() - pageLoadTime;
      if (t < MOBILE_MIN_TIME_MS) return false;
      if (scrollRatio() >= MOBILE_SCROLL_RATIO) return true;
      return t >= MOBILE_ENGAGED_TIME_MS && scrollDepthPx() > 200;
    };

    const onMobileScroll = () => {
      if (window.innerWidth >= 1024) return;
      // Idle guard: only consider it an exit gesture if they've stopped at the
      // top after scrolling up — not mid-scroll.
      const y = window.scrollY || 0;
      if (lastDirection === -1 && y <= 4 && maxScroll > 600 && mobileEngaged()) {
        showPopup();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onMobileScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onMobileScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isSuppressed, showPopup]);

  const close = () => setVisible(false);

  const goToQuote = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'exit_intent_cta_click', {
        event_category: 'Engagement',
        event_label: 'quote_calculator',
      });
    }
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', 'ExitIntentCTA', { destination: 'QuoteCalculator' });
    }
    close();
    router.push('/quote-calculator');
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);

    try {
      await entities.ContactLead.create({
        email,
        customer_email: email,
        lead_status: 'new',
        status: 'new',
        source: 'exit_intent_popup',
        message: 'Email subscriber (exit-intent popup)',
      });
    } catch (err) {
      console.warn('Email subscribe save failed:', err);
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        event_category: 'Email Capture',
        event_label: 'exit_intent_popup',
        value: 5.0,
        currency: 'CAD',
      });
    }
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', { content_name: 'exit_intent_email', value: 5.0, currency: 'CAD' });
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={close}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="h-1.5 bg-gradient-to-r from-amber-400 to-amber-600" />

        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">You're In!</h3>
              <p className="text-slate-600 text-sm">
                We'll send you exclusive deals and flooring tips. No spam — ever.
              </p>
              <button
                onClick={close}
                className="mt-5 px-6 py-2.5 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-7 h-7 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Before You Go...
                </h2>
                <p className="text-slate-600">
                  Get a <span className="font-semibold text-amber-600">FREE flooring estimate</span> in
                  30 seconds — no commitment, no pressure.
                </p>
              </div>

              <button
                onClick={goToQuote}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mb-2.5"
              >
                <Calculator className="w-5 h-5" />
                Get My Free Estimate
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => { close(); router.push('/floor-finder'); }}
                className="w-full py-3 border-2 border-amber-200 hover:border-amber-400 text-amber-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Not sure? Find My Floor
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {showEmailForm ? (
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {submitting ? 'Saving...' : 'Get Exclusive Deals'}
                  </button>
                  <p className="text-xs text-slate-400 text-center">
                    No spam. Unsubscribe anytime.
                  </p>
                </form>
              ) : (
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="w-full py-3 border-2 border-slate-200 hover:border-amber-400 text-slate-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4 text-slate-400" />
                  Get Exclusive Deals by Email
                </button>
              )}

              <div className="flex items-center justify-center gap-4 mt-5 text-xs text-slate-400">
                <span>🔒 No spam</span>
                <span>💳 Financing from $68/mo</span>
                <span>⭐ 4.7★ on Google</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
