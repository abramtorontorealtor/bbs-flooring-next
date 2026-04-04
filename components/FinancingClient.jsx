'use client';

import { useState } from 'react';
import { CreditCard, Clock, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { FINANCEIT_LINKS, getMonthlyPayment } from '@/lib/financing';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';

const PROGRAMS = [
  {
    id: 'free', badge: '✅ Always Available', badgeColor: 'bg-emerald-100 text-emerald-700',
    title: 'Low Monthly Payments', subtitle: '13.99% · Up to 20-year amortization',
    description: 'Spread your flooring project over the long term and keep monthly payments as low as possible. No promos, no deadlines — just a straightforward plan you can pay off any time with no penalty.',
    highlight: 'From $135/mo on a $10,000 project',
    icon: <TrendingDown className="w-6 h-6 text-emerald-600" />,
    link: FINANCEIT_LINKS.freeProgram, color: 'border-emerald-200 bg-emerald-50', ctaColor: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    id: 'deferral', badge: '🔥 Limited Time', badgeColor: 'bg-orange-100 text-orange-700',
    title: 'No Payments for 3 Months', subtitle: '0% interest · No payments until July',
    description: 'Get your new floors installed today and make zero payments for 3 full months. Perfect if you want beautiful floors now but prefer to start paying a little later.',
    highlight: 'Floors in this week. First payment in July.',
    icon: <Clock className="w-6 h-6 text-orange-500" />,
    link: FINANCEIT_LINKS.deferral3mo, color: 'border-orange-200 bg-orange-50', ctaColor: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    id: '36mo', badge: '💳 Limited Time', badgeColor: 'bg-blue-100 text-blue-700',
    title: '36-Month Equal Payments', subtitle: '10.99% · 3 years · Fixed equal payments',
    description: 'Equal payments over 36 months at 10.99% — well below typical credit card rates. A clean, predictable plan for customers who want a defined end date.',
    highlight: '$10,000 project = ~$327/mo for 36 months',
    icon: <CreditCard className="w-6 h-6 text-blue-600" />,
    link: FINANCEIT_LINKS.rate36mo, color: 'border-blue-200 bg-blue-50', ctaColor: 'bg-blue-600 hover:bg-blue-700',
  },
];

const FAQS = [
  { q: 'How fast is the approval process?', a: 'Financeit provides instant decisions online. Most customers are approved in minutes. You can apply from home before visiting the showroom.' },
  { q: 'What credit score do I need?', a: 'Financeit works with a range of credit profiles. There are standard, extended, and second-look programs to accommodate more applicants. Applying does not affect your credit score initially.' },
  { q: 'Are there any prepayment penalties?', a: 'No. All Financeit loans are completely open — you can pay off your balance at any time with no penalty.' },
  { q: 'Is this available across Ontario?', a: 'Yes — financing is available across all of Canada except Quebec.' },
  { q: "What's the minimum and maximum loan amount?", a: 'Financing is available from $1,000 to $100,000, covering everything from a single room to a whole-home project.' },
  { q: 'Can I combine financing with installation?', a: 'Absolutely. Your financed amount can include flooring materials, installation labour, removal of existing floors, baseboards, and delivery — your full project total.' },
];

export default function FinancingClient() {
  const [amount, setAmount] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const numericAmount = parseFloat(amount.replace(/,/g, ''));
  const monthly = getMonthlyPayment(numericAmount);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-700 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Breadcrumbs items={getStaticBreadcrumbs('/financing')} />
          <span className="inline-block bg-amber-500 text-slate-900 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">Financing Available</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">New Floors Now.<br />Pay Monthly.</h1>
          <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
            Don&apos;t let budget hold you back. Instant approval, no merchant fees, no prepayment penalties — through our partner Financeit.
          </p>
          <a href={FINANCEIT_LINKS.freeProgram} target="_blank" rel="noopener noreferrer"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 py-4 rounded-xl text-lg transition-colors">
            Apply in Minutes →
          </a>
          <p className="text-xs text-slate-400 mt-3">OAC · No impact to credit score to apply</p>
        </div>
      </section>

      {/* Payment Calculator */}
      <section className="py-14 px-4 bg-white border-b border-slate-100">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Estimate Your Monthly Payment</h2>
          <p className="text-slate-500 text-sm mb-6">Based on low monthly rate financing, maximum amortization. OAC.</p>
          <div className="flex gap-3 items-center justify-center">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input type="number" min="1000" max="100000" placeholder="Enter project amount" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full pl-7 pr-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 focus:border-amber-400 focus:outline-none text-lg" />
            </div>
          </div>
          {monthly && (
            <div className="mt-6 bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 inline-block w-full max-w-xs mx-auto">
              <p className="text-sm text-slate-500 mb-1">Estimated monthly payment</p>
              <p className="text-5xl font-extrabold text-amber-600">${monthly}<span className="text-xl font-semibold text-slate-400">/mo</span></p>
              <p className="text-xs text-slate-400 mt-2">Based on 13.99% at max amortization · OAC</p>
              <a href={FINANCEIT_LINKS.freeProgram} target="_blank" rel="noopener noreferrer"
                className="mt-4 block bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-5 py-2.5 rounded-lg text-sm transition-colors">
                Apply for This Rate →
              </a>
            </div>
          )}
          {amount && !monthly && numericAmount < 1000 && (
            <p className="mt-4 text-sm text-red-500">Minimum financing amount is $1,000.</p>
          )}
        </div>
      </section>

      {/* Program Cards */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-3">Choose Your Program</h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">
            We offer flexible options to match your budget. Not sure which is right for you? Call us and we&apos;ll walk you through it.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {PROGRAMS.map(prog => (
              <div key={prog.id} className={`rounded-2xl border-2 p-6 flex flex-col ${prog.color}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm">{prog.icon}</div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${prog.badgeColor}`}>{prog.badge}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mt-2">{prog.title}</h3>
                <p className="text-xs font-semibold text-slate-500 mb-3">{prog.subtitle}</p>
                <p className="text-sm text-slate-600 flex-1">{prog.description}</p>
                <div className="mt-4 bg-white/70 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700">📊 {prog.highlight}</div>
                <a href={prog.link} target="_blank" rel="noopener noreferrer"
                  className={`mt-4 block text-center text-white font-bold px-4 py-3 rounded-xl transition-colors text-sm ${prog.ctaColor}`}>
                  Apply Now →
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">
            All programs subject to credit approval. Available in Canada excluding Quebec. Powered by{' '}
            <a href="https://www.financeit.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">Financeit</a>.
          </p>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 px-4 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '⚡', title: 'Instant Decision', sub: 'Apply online in minutes' },
            { icon: '🔓', title: 'No Prepayment Penalty', sub: 'Pay off any time, no fees' },
            { icon: '💰', title: 'Up to $100,000', sub: 'Cover your full project' },
            { icon: '🛡️', title: 'Trusted Partner', sub: 'Powered by Financeit' },
          ].map(t => (
            <div key={t.title}>
              <div className="text-3xl mb-2">{t.icon}</div>
              <p className="font-semibold text-slate-800 text-sm">{t.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-slate-800 text-sm pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-3">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-amber-500">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Ready to Get Started?</h2>
          <p className="text-slate-800 mb-6">Apply online in minutes or call us to discuss your project. No obligation, instant decision.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={FINANCEIT_LINKS.freeProgram} target="_blank" rel="noopener noreferrer"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-xl transition-colors">
              Apply Online →
            </a>
            <a href="tel:6474281111" className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-8 py-4 rounded-xl transition-colors">
              📞 Call (647) 428-1111
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
