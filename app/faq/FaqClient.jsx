'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';
import { GENERAL_FAQ_SECTIONS } from '@/data/general-faqs';
import {
  ChevronDown,
  ShoppingBag,
  Wrench,
  ShoppingCart,
  Truck,
  MapPin,
  Phone,
  Calculator,
  Calendar,
} from 'lucide-react';

const SECTION_ICONS = {
  'Products & Pricing': ShoppingBag,
  'Installation & Services': Wrench,
  'Shopping & Ordering': ShoppingCart,
  'Delivery & Returns': Truck,
  'Showroom & Contact': MapPin,
};

function FaqAccordionItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-base font-semibold text-slate-800 pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5 text-slate-600 leading-relaxed">{answer}</div>
      </div>
    </div>
  );
}

export default function FaqClient() {
  // Track which FAQ item is open per section (only one at a time per section)
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (sectionIdx, faqIdx) => {
    const key = `${sectionIdx}-${faqIdx}`;
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Breadcrumbs items={getStaticBreadcrumbs('/faq')} />

      {/* Header */}
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Real answers with real numbers — prices, timelines, and everything you
          need to know about buying and installing flooring in the GTA.
        </p>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'Products', value: '1,000+' },
          { label: 'Brands', value: '15' },
          { label: 'Starting Price', value: '$1.49/sqft' },
          { label: 'Google Rating', value: '4.7★' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-slate-200 p-4 text-center"
          >
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* FAQ Sections */}
      <div className="space-y-10">
        {GENERAL_FAQ_SECTIONS.map((section, sectionIdx) => {
          const Icon = SECTION_ICONS[section.title] || ShoppingBag;
          return (
            <div key={section.title}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-3">
                {section.faqs.map((faq, faqIdx) => (
                  <FaqAccordionItem
                    key={faqIdx}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={!!openItems[`${sectionIdx}-${faqIdx}`]}
                    onToggle={() => toggleItem(sectionIdx, faqIdx)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-white text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          Still have questions?
        </h2>
        <p className="text-slate-300 mb-8 max-w-xl mx-auto">
          Our flooring specialists are here to help. Call us, visit the
          showroom, or book a free in-home measurement.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="tel:6474281111"
            className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Phone className="w-5 h-5" />
            (647) 428-1111
          </a>
          <Link
            href="/free-measurement"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors border border-white/20"
          >
            <Calendar className="w-5 h-5" />
            Book Free Measurement
          </Link>
          <Link
            href="/quote-calculator"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors border border-white/20"
          >
            <Calculator className="w-5 h-5" />
            Get Instant Quote
          </Link>
        </div>
      </div>

      {/* Showroom Info */}
      <div className="mt-8 text-center text-sm text-slate-500">
        <p>
          <MapPin className="w-4 h-4 inline-block mr-1" />
          6061 Highway 7, Unit B, Markham, ON L3P 3B2 —{' '}
          <span className="font-medium">Family-owned since 2012</span>
        </p>
      </div>
    </div>
  );
}
