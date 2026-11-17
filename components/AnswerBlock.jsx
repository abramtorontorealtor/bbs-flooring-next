import { HelpCircle } from 'lucide-react';

/**
 * AnswerBlock — a direct-answer block placed high on a page so both users and
 * AI/LLM answer engines get an immediate, self-contained, quotable answer.
 *
 * Server component (no 'use client'): rendered into the initial HTML so crawlers see it.
 * Backwards compatible: existing callers pass the answer as `children`; new callers
 * pass `answer` (string) and optionally `facts` (short string list).
 *
 * @param {string}          question - The buyer's question (rendered as the <h2>).
 * @param {string}          [answer] - 1-3 sentence direct answer (plain text).
 * @param {string[]}        [facts]  - Optional short supporting facts (rendered as a <ul>).
 * @param {string}          [id]     - Optional DOM id (anchor / citation target).
 * @param {boolean}         [compact] - Tighter vertical padding (for above-the-fold use).
 * @param {React.ReactNode} [children] - Legacy: answer body as JSX (used when `answer` is omitted).
 */
export default function AnswerBlock({ question, answer, facts, id, compact = false, children }) {
  const body = answer ?? children;
  const hasFacts = Array.isArray(facts) && facts.length > 0;
  return (
    <section
      id={id}
      aria-label={question || 'Quick answer'}
      className="bg-amber-50 border-y border-amber-100"
    >
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${compact ? 'py-5 md:py-6' : 'py-8 md:py-10'}`}>
        <div className="flex items-start gap-3">
          <HelpCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" aria-hidden="true" />
          <div>
            {question && (
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{question}</h2>
            )}
            <p className="text-slate-700 text-base md:text-lg leading-relaxed">
              {body}
            </p>
            {hasFacts && (
              <ul className="mt-3 space-y-1 text-sm md:text-base text-slate-600 list-disc pl-5">
                {facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
