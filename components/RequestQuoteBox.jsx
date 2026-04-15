'use client';

import React, { useState } from 'react';
import { Shield, Truck, Award, Phone, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Analytics } from '@/components/analytics';

export default function RequestQuoteBox({ product, selectedVariant = null }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Please enter your name and email');
      return;
    }

    setSubmitting(true);
    try {
      // Build message with product context
      const lines = [`Product: ${product.name}`];
      if (product.sku) lines.push(`SKU: ${product.sku}`);
      if (selectedVariant) {
        if (selectedVariant.sku) lines.push(`Variant SKU: ${selectedVariant.sku}`);
        const parts = [selectedVariant.pattern, selectedVariant.width, selectedVariant.grade].filter(Boolean);
        if (parts.length) lines.push(`Configuration: ${parts.join(' · ')}`);
      }
      if (form.message.trim()) lines.push(`\nCustomer note: ${form.message.trim()}`);

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          message: lines.join('\n'),
          source: 'pdp_quote_request',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Submission failed');

      setSubmitted(true);

      // Analytics
      if (window.gtag) {
        window.gtag('event', 'generate_lead', {
          currency: 'CAD',
          value: 0,
          event_label: product.name,
          items: [{ item_id: product.sku || product.id, item_name: product.name }],
        });
      }
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', {
          content_name: product.name,
          content_ids: [product.sku || product.id],
          content_type: 'product',
        });
      }
      Analytics.trackEvent?.('quote_request', { product: product.name });
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="border-2 border-emerald-200 rounded-2xl bg-gradient-to-b from-emerald-50/80 to-white p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Quote Request Sent!</h3>
        <p className="text-sm text-slate-600 mb-4">
          We&apos;ll get back to you within 1 business day with pricing for{' '}
          <span className="font-medium text-slate-800">{product.name}</span>.
        </p>
        <p className="text-sm text-slate-600">
          Need it sooner? Call us now:
        </p>
        <a
          href="tel:6474281111"
          className="inline-flex items-center gap-2 mt-2 text-lg font-bold text-amber-600 hover:text-amber-700 transition-colors"
        >
          <Phone className="w-5 h-5" />
          (647) 428-1111
        </a>
      </div>
    );
  }

  return (
    <div className="border-2 border-amber-200 rounded-2xl bg-gradient-to-b from-amber-50/80 to-white p-5 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Phone className="w-5 h-5 text-amber-600" />
          Get Pricing for {product.name}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Available at our Markham showroom or by phone.
        </p>
      </div>

      {/* Selected variant context */}
      {selectedVariant && (
        <div className="bg-white rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Selected: </span>
          {[selectedVariant.pattern, selectedVariant.width, selectedVariant.grade].filter(Boolean).join(' · ')}
          {selectedVariant.sku && <span className="text-slate-400 ml-2">({selectedVariant.sku})</span>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Your Name *"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address *"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number (optional)"
          value={form.phone}
          onChange={handleChange}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        <textarea
          name="message"
          placeholder="Message (optional — e.g., room size, timeline)"
          value={form.message}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
        />

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-12 text-base font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg transition-all"
        >
          {submitting ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Sending...</>
          ) : (
            'Request a Quote'
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-500">Or call us directly:</p>
        <a
          href="tel:6474281111"
          className="inline-flex items-center gap-1.5 text-base font-bold text-amber-600 hover:text-amber-700 transition-colors mt-1"
        >
          <Phone className="w-4 h-4" />
          (647) 428-1111
        </a>
      </div>

      {/* Trust signals */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1 text-[11px] text-slate-500">
          <Shield className="w-3 h-3" />25+ Year Warranty
        </span>
        <span className="flex items-center gap-1 text-[11px] text-slate-500">
          <Truck className="w-3 h-3" />GTA Delivery
        </span>
        <span className="flex items-center gap-1 text-[11px] text-slate-500">
          <Award className="w-3 h-3" />Authorized Dealer
        </span>
      </div>
    </div>
  );
}
