'use client';

import Link from 'next/link';

const WHATSAPP_URL = 'https://wa.me/message/CQQRGZKI3U2VH1';
const SMS_URL = 'sms:6474281111';
const TEL_URL = 'tel:6474281111';

const faqItems = [
  {
    question: 'Does BBS Flooring really beat competitor prices?',
    answer: 'Yes. If you find the same flooring — same brand and same product — for less at another local flooring business, we will beat that price. Message us on WhatsApp, text, or call (647) 428-1111 with the details. On top of the price, you still get our Markham showroom, professional installation, and financing.',
  },
  {
    question: 'What do I need to claim the Best Price Guarantee?',
    answer: 'Just show us the price. A quote, flyer, ad, or screenshot helps us verify it quickly, but it is not strictly required — even a number you have been quoted gives us a starting point. The faster you get us the details, the faster we can beat it.',
  },
  {
    question: 'Which competitors qualify?',
    answer: 'Any legitimate local flooring business in the GTA or Ontario, on the identical in-stock product (same brand and SKU). We can not match used, clearance, liquidation, going-out-of-business, or marketplace listings (Kijiji, Facebook Marketplace, scratch-and-dent).',
  },
  {
    question: 'Does the price match include installation?',
    answer: 'The Best Price Guarantee covers the product price. Installation, in-home measurement, showroom service, and financing are the extras that make BBS worth choosing — things an online-only or out-of-town seller can not provide.',
  },
  {
    question: 'How do I claim my price match?',
    answer: 'The fastest way is WhatsApp us at (647) 428-1111. You can also text the same number, or call us during showroom hours (Mon–Sat, 10am–5pm). Tell us the product, the competitor, and the price, and we will beat it.',
  },
];

export default function PriceMatchClient() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xl">🛡️</span>
            <span className="text-sm font-semibold uppercase tracking-widest text-amber-300">Best Price Guarantee</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            We&apos;ll Beat Any Local Flooring Price
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Found the same flooring cheaper at another local store? Show us — we&apos;ll beat it.
            Same brand, same product, a better price, plus a real Markham showroom, professional
            installation, and financing the online-only guys can&apos;t touch.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg transition-colors"
            >
              💬 Claim it on WhatsApp
            </a>
            <a
              href={TEL_URL}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-bold px-7 py-3.5 rounded-xl shadow-lg hover:bg-slate-100 transition-colors"
            >
              📞 (647) 428-1111
            </a>
          </div>
          <p className="text-xs text-slate-400 mt-4">WhatsApp · Text · Call — whatever&apos;s easiest for you.</p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">How the Guarantee Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: '1', t: 'Find the same floor for less', d: 'Same brand and product at any legitimate local GTA or Ontario flooring store.' },
            { n: '2', t: 'Show us the price', d: 'Send a quote, ad, or screenshot on WhatsApp, by text, or over the phone. Proof helps us move fast — but a number to beat is enough to start.' },
            { n: '3', t: 'We beat it', d: 'We confirm the product and beat the price — then back it with installation, financing, and a showroom you can actually walk into.' },
          ].map((s) => (
            <div key={s.n} className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">{s.n}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{s.t}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why BBS beats online-only ── */}
      <section className="bg-slate-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">The Price Is Just the Floor</h2>
          <p className="text-center text-slate-600 max-w-2xl mx-auto mb-10">
            Anyone can quote a number. What an online-only or out-of-town reseller can&apos;t give you is everything that makes a flooring project go right.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { i: '🏬', t: 'A real Markham showroom', d: 'See and feel the exact product before you buy — 6061 Highway 7, Unit B, Markham.' },
              { i: '🔨', t: 'Professional installation', d: 'Our own installers across the GTA — not a drop-shipped box left on your porch.' },
              { i: '💳', t: 'Financing available', d: 'Spread the cost with Financeit. Instant approval, no prepayment penalty.' },
              { i: '📏', t: 'Free in-home measurement', d: 'We measure it right so you order the right amount — no costly guesswork.' },
            ].map((b) => (
              <div key={b.t} className="flex items-start gap-4 bg-white rounded-xl border border-slate-200 p-5">
                <span className="text-3xl">{b.i}</span>
                <div>
                  <h3 className="font-bold text-slate-900">{b.t}</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{b.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fine print ── */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-slate-900 mb-5">The Fine Print (kept honest)</h2>
        <ul className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <li className="flex gap-2"><span className="text-amber-500 font-bold shrink-0">•</span><span>The competing product must be the <strong>identical item</strong> — same brand and same SKU — and in stock.</span></li>
          <li className="flex gap-2"><span className="text-amber-500 font-bold shrink-0">•</span><span>The competitor must be a <strong>legitimate local flooring business</strong> in the GTA or Ontario.</span></li>
          <li className="flex gap-2"><span className="text-amber-500 font-bold shrink-0">•</span><span>We can&apos;t match <strong>used, clearance, liquidation, going-out-of-business, or marketplace listings</strong> (Kijiji, Facebook Marketplace, scratch-and-dent).</span></li>
          <li className="flex gap-2"><span className="text-amber-500 font-bold shrink-0">•</span><span>The guarantee covers the <strong>product price</strong>. Installation, measurement, and financing are added value, not part of the match.</span></li>
          <li className="flex gap-2"><span className="text-amber-500 font-bold shrink-0">•</span><span>Proof of the competitor&apos;s price (quote, ad, or screenshot) is <strong>preferred but not required</strong> — it just helps us verify and beat it faster.</span></li>
        </ul>
      </section>

      {/* ── FAQ (mirrors schema) ── */}
      <section className="bg-slate-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">Best Price Guarantee FAQ</h2>
          <div className="space-y-3">
            {faqItems.map((f) => (
              <details key={f.question} className="group bg-white rounded-xl border border-slate-200 p-5">
                <summary className="font-semibold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                  {f.question}
                  <span className="text-amber-500 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-gradient-to-br from-slate-900 to-amber-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Got a Lower Price? Let&apos;s Beat It.</h2>
          <p className="text-slate-300 mb-8">Message us the product and the price — WhatsApp is fastest. We&apos;ll do the rest.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg transition-colors">💬 WhatsApp Us</a>
            <a href={SMS_URL} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-colors">✉️ Text Us</a>
            <a href={TEL_URL} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-bold px-7 py-3.5 rounded-xl hover:bg-slate-100 transition-colors">📞 Call</a>
          </div>
          <p className="text-xs text-slate-400 mt-5">
            Prefer to browse first?{' '}
            <Link href="/products" className="underline hover:text-white">See our flooring</Link> or{' '}
            <Link href="/free-measurement" className="underline hover:text-white">book a free measurement</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
