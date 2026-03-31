'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, MapPin, Clock, Mail, ArrowRight, Check, MessageCircle } from 'lucide-react';
import { entities } from '@/lib/base44-compat';

export default function Footer() {
  const [footerEmail, setFooterEmail] = useState('');
  const [footerSubmitting, setFooterSubmitting] = useState(false);
  const [footerSubmitted, setFooterSubmitted] = useState(false);

  const handleFooterSubscribe = async (e) => {
    e.preventDefault();
    if (!footerEmail || footerSubmitting) return;
    setFooterSubmitting(true);
    try {
      await entities.ContactLead.create({
        email: footerEmail,
        lead_status: 'new',
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
    setFooterSubmitting(false);
    setFooterSubmitted(true);
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-6">
              <span className="text-4xl font-black text-amber-500">BBS</span>
              <span className="block text-sm font-semibold tracking-widest text-slate-400">FLOORING</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your local source for premium flooring installation and materials in Markham, Toronto, and Durham. 
              Transforming spaces with stunning floors since day one.
            </p>

            {/* Email Signup */}
            <div className="mt-6">
              {footerSubmitted ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  <span>You're subscribed!</span>
                </div>
              ) : (
                <form onSubmit={handleFooterSubscribe}>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Get Exclusive Deals
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={footerEmail}
                      onChange={(e) => setFooterEmail(e.target.value)}
                      placeholder="Your email"
                      className="flex-1 min-w-0 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={footerSubmitting}
                      className="px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                      aria-label="Subscribe"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">No spam. Unsubscribe anytime.</p>
                </form>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Products</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/solid-hardwood" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                  Solid Hardwood
                </Link>
              </li>
              <li>
                <Link href="/engineered-hardwood" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                  Engineered Hardwood
                </Link>
              </li>
              <li>
                <Link href="/laminate" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                  Laminate
                </Link>
              </li>
              <li>
                <Link href="/vinyl" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                  Vinyl
                </Link>
              </li>
              <li>
                <Link href="/stairs" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                  Stairs
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/installation" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                  Installation Services
                </Link>
              </li>
              <li>
                <Link href="/room-visualizer" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                  Room Visualizer
                </Link>
              </li>
              <li>
                <Link href="/financing" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                  Financing Available
                </Link>
              </li>
              <li>
                <Link href="/quote-calculator" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                  Quote Calculator
                </Link>
              </li>
              <li>
                <Link href="/free-measurement" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                  Free Measurement
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                  Project Gallery
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Service Areas</h3>
            <ul className="space-y-3">
              {['Markham', 'Stouffville', 'Richmond Hill', 'Pickering', 'Ajax', 'Whitby', 'Vaughan', 'Woodbridge', 'Newmarket', 'Aurora', 'Scarborough', 'Oshawa'].map(city => (
                <li key={city}>
                  <Link href={`/flooring-in-${city.toLowerCase().replace(/\s+/g, '-')}`} className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">
                  6061 Highway 7, Unit B,<br />
                  Markham Ontario, Canada L3P 3B2
                </span>
              </li>
              <li>
                <a href="tel:6474281111" className="flex items-center gap-3 text-slate-400 hover:text-amber-500 transition-colors text-sm">
                  <Phone className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  (647) 428-1111
                </a>
              </li>
              <li>
                <a href="https://wa.me/message/CQQRGZKI3U2VH1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-green-500 transition-colors text-sm">
                  <MessageCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  WhatsApp Us
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">
                  Mon - Sat: 10:00 AM - 5:00 PM<br />
                  Sun: Closed
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <Link href="/privacy-policy" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
              Terms of Service
            </Link>
            <Link href="/return-policy" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
              Return Policy
            </Link>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} BBS Flooring. All rights reserved.
            </p>
            <p className="text-slate-400 text-sm">
              Serving Markham, Toronto & Durham Region
            </p>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
