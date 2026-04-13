'use client';

import React, { useState } from 'react';
import { entities } from '@/lib/base44-compat';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      await entities.ContactLead.create({
        email,
        customer_email: email,
        lead_status: 'new',
        status: 'new',
        source: 'newsletter_footer',
        message: 'Email subscriber (footer signup)',
      });
    } catch (err) {
      console.warn('Footer email subscribe failed:', err);
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        event_category: 'Email Capture',
        event_label: 'footer_signup',
        value: 5.0,
        currency: 'CAD',
      });
    }
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', { content_name: 'footer_email', value: 5.0, currency: 'CAD' });
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
        <span>You&apos;re subscribed!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="text-sm font-medium text-slate-300 mb-2 block">
        Get Exclusive Deals
      </label>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="flex-1 min-w-0 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
          aria-label="Subscribe"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
      <p className="text-xs text-slate-500 mt-1.5">No spam. Unsubscribe anytime.</p>
    </form>
  );
}
