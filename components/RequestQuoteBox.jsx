'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Truck, Award, Phone, MessageSquare, CheckCircle2, Loader2, Star, MapPin, Ruler, ChevronDown, ChevronUp, Warehouse, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Analytics } from '@/components/analytics';
import { callUrl, smsUrl, whatsappUrl, PHONE_DISPLAY } from '@/lib/contact';

export default function RequestQuoteBox({ product, selectedVariant = null }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);

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

      {/* ── Prefer to message us? — 3-channel row ── */}
      <div>
        <p className="text-xs text-slate-400 text-center mb-2">Or reach us instantly · usually replies within 1 hour</p>
        <div className="grid grid-cols-3 gap-2">
          {/* Call */}
          <a
            href={callUrl()}
            aria-label={`Call BBS Flooring at ${PHONE_DISPLAY}`}
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-colors"
          >
            <Phone className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            <span className="text-[11px] font-semibold">Call</span>
          </a>
          {/* Text */}
          <a
            href={smsUrl(product?.name)}
            aria-label="Text BBS Flooring"
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-colors"
          >
            <MessageSquare className="w-[18px] h-[18px]" />
            <span className="text-[11px] font-semibold">Text</span>
          </a>
          {/* WhatsApp */}
          <a
            href={whatsappUrl(product?.name)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 active:bg-[#25D366]/30 text-[#128C7E] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="text-[11px] font-semibold">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Google Reviews badge */}
      <div className="flex items-center justify-center gap-2 py-2.5 border-t border-slate-100">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <span className="text-xs font-semibold text-slate-700">4.7</span>
        <span className="text-xs text-slate-500">· 41 Google Reviews</span>
      </div>

      {/* Delivery & pickup info — collapsible */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setDeliveryOpen(prev => !prev)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-slate-500" />
            Delivery &amp; Pickup Options
          </span>
          {deliveryOpen
            ? <ChevronUp className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {deliveryOpen && (
          <div className="divide-y divide-slate-100 border-t border-slate-200">
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-xs text-slate-600">
                <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                Warehouse Pickup
              </span>
              <span className="text-xs font-bold text-emerald-600">FREE</span>
            </div>
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-xs text-slate-600">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                Garage Delivery (GTA)
              </span>
              <span className="text-xs font-semibold text-slate-700">$140</span>
            </div>
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-xs text-slate-600">
                <Home className="w-3.5 h-3.5 text-slate-400" />
                Inside House Delivery
              </span>
              <span className="text-xs font-semibold text-slate-700">$200</span>
            </div>
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-xs text-slate-600">
                <Ruler className="w-3.5 h-3.5 text-amber-500" />
                Free In-Home Measurement
              </span>
              <Link href={`/free-measurement${product?.name ? `?product=${encodeURIComponent(product.name)}` : ''}`} className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline">
                Book Now
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* See it in person CTA */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/free-measurement" target="_blank" rel="noopener"
          className="flex flex-col items-center gap-1 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all group"
        >
          <Ruler className="w-5 h-5 text-amber-500 group-hover:text-amber-600" />
          <span className="text-[11px] font-semibold text-slate-700 group-hover:text-amber-700 text-center leading-tight">Free In-Home Measurement</span>
          <span className="text-[10px] text-slate-400 text-center leading-tight">We&apos;ll bring samples</span>
        </Link>
        <a
          href="https://www.google.com/maps/place/BBS+Flooring/@43.8476,-79.3252,17z"
          target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all group"
        >
          <MapPin className="w-5 h-5 text-amber-500 group-hover:text-amber-600" />
          <span className="text-[11px] font-semibold text-slate-700 group-hover:text-amber-700 text-center leading-tight">Visit Our Showroom</span>
          <span className="text-[10px] text-slate-400 text-center leading-tight">6061 Hwy 7, Markham</span>
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
