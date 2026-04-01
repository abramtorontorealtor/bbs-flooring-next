'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

function generateFAQSchema(faqs) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) };
}

const GENERAL_FAQS = [
  { question: "Do you offer free measurements?", answer: "Yes! We provide free in-home measurements anywhere in Markham, Toronto, Scarborough, Richmond Hill, and Durham Region. Call (647) 428-1111 to book your appointment." },
  { question: "What brands of flooring do you carry?", answer: "We carry over 600 products from top brands including Vidar Flooring, Triforest, and many more. Visit our showroom at 6061 Highway 7, Markham to see samples." },
  { question: "How much does flooring installation cost?", answer: "Pricing varies by material. Hardwood installation: $2.25/sqft. Vinyl installation: $2.00-2.25/sqft. Laminate installation: $2.00-2.25/sqft. Call (647) 428-1111 for an accurate quote based on your project." },
  { question: "Do you install flooring in Toronto and Durham Region?", answer: "Yes, we serve all GTA including Markham, Toronto, Scarborough, North York, Richmond Hill, Vaughan, Whitby, Oshawa, Ajax, Pickering, and surrounding areas." },
  { question: "Can I visit your showroom without an appointment?", answer: "Absolutely! Walk-ins welcome Mon-Sat 10am-5pm. We're located at 6061 Highway 7, Unit B in Markham. Closed Sundays." },
  { question: "Do you offer financing for flooring projects?", answer: "Contact us at (647) 428-1111 to discuss payment options and financing available for your flooring project." },
  { question: "How long does flooring installation take?", answer: "Most residential projects take 1-3 days depending on square footage. We'll provide a detailed timeline during your free in-home measurement." },
  { question: "Do you remove old flooring?", answer: "Yes, we handle everything including old flooring removal, disposal, subfloor preparation, and new floor installation. Complete full-service flooring." },
  { question: "What's the best flooring for basements?", answer: "Waterproof luxury vinyl plank (LVP) is ideal for basements. It resists moisture, feels warm underfoot, and looks like real hardwood. We have 100+ styles in stock." },
  { question: "How soon can you start my flooring project?", answer: "Most projects can start within 1-2 weeks of your free measurement. Call (647) 428-1111 to check current availability and schedule your consultation." }
];

export default function GeneralFAQSection() {
  return (
    <div className="mt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(GENERAL_FAQS)) }} />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8 text-center">Frequently Asked Questions About Flooring</h2>
        <Accordion type="single" collapsible className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          {GENERAL_FAQS.map((faq, index) => (
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
