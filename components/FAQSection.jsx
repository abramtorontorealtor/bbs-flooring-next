'use client';

import React, { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2 } from 'lucide-react';
import { generateFAQSchema } from '@/lib/seo';

export default function FAQSection({ category, location = "Markham, Toronto, and Durham" }) {
  const [faqs, setFaqs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFAQs = async () => {
      try {
        const res = await fetch(`/api/faqs?category=${encodeURIComponent(category)}&location=${encodeURIComponent(location)}`);
        const data = await res.json();
        if (data.success && data.faqs) {
          setFaqs(data.faqs);
        }
      } catch (error) {
        console.error('Error loading FAQs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFAQs();
  }, [category, location]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!faqs || faqs.length === 0) return null;

  const categoryName = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const faqSchema = generateFAQSchema(faqs);

  return (
    <div className="mt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-800 mb-3 text-center">
          Frequently Asked Questions About {categoryName} Flooring
        </h2>
        <p className="text-slate-600 text-center mb-8">
          Get answers to common questions about {categoryName.toLowerCase()} flooring in {location}
        </p>
        <Accordion type="single" collapsible className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-b-0">
              <AccordionTrigger className="px-6 py-4 text-left font-semibold text-slate-800 hover:no-underline hover:text-amber-600">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-slate-700 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
