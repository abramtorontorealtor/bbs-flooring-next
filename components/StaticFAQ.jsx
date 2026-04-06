'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

function generateFAQSchema(faqs) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) };
}

export default function StaticFAQ({ faqItems = [], title, subtitle, schemaId = 'faq-schema', skipSchema = false }) {
  if (!faqItems.length) return null;

  return (
    <div className="mt-16">
      {!skipSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(faqItems)) }} />}
      <div className="max-w-4xl mx-auto">
        {title && <h2 className="text-3xl font-bold text-slate-800 mb-3 text-center">{title}</h2>}
        {subtitle && <p className="text-slate-600 text-center mb-8">{subtitle}</p>}
        <Accordion type="single" collapsible className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          {faqItems.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-b-0">
              <AccordionTrigger className="px-6 py-4 text-left font-semibold text-slate-800 hover:no-underline hover:text-amber-600">{faq.question}</AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-slate-700 leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
