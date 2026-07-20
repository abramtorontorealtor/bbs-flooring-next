'use client';

import { HelpCircle } from 'lucide-react';

/**
 * AnswerBlock — a direct-answer paragraph placed high on a page so both users and
 * AI/LLM crawlers get an immediate, quotable answer to the page's core question.
 *
 * Pattern mirrors the Realty flagship pages: a short bolded question + a concise,
 * fact-dense answer paragraph. Optimized for AI citation (clean text, no fluff).
 *
 * @param {string}          question - The question this block answers (rendered as the heading).
 * @param {React.ReactNode} children - The answer body (paragraph text / spans).
 */
export default function AnswerBlock({ question, children }) {
  return (
    <section className="bg-amber-50 border-y border-amber-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" aria-hidden="true" />
          <div>
            {question && (
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{question}</h2>
            )}
            <p className="text-slate-700 text-base md:text-lg leading-relaxed">
              {children}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
