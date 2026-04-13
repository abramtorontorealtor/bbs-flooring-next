'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Calculator, Mail, ArrowRight } from 'lucide-react';
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
    const MIN_TIME_ON_PAGE_MS = 15000;

    const handleMouseLeave = (e) => {
      if (e.clientY <= 5 && Date.now() - pageLoadTime >= MIN_TIME_ON_PAGE_MS) {
        showPopup();
      }
    };

    const mobileTimer = setTimeout(() => {
      if (window.innerWidth < 1024) {
        showPopup();
      }
    }, 45000);

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(mobileTimer);
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
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Calculator className="w-5 h-5" />
                Get My Free Estimate
                <ArrowRight className="w-4 h-4" />
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
                <span>⭐ 5-star rated</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
