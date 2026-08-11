'use client';

import Link from 'next/link';

export default function CleanLaminateClient() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">
            BBS Flooring — Care &amp; Maintenance Guide 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            How to Clean Laminate Flooring: The Complete Guide (2026)
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Laminate is easy to keep beautiful — but one wrong move with water ruins it for good. Here&apos;s the barely-damp method that protects your floor, from Markham&apos;s flooring specialists.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-slate-400">
            <span>✔ Swell-proof routine</span>
            <span>✔ Warranty-safe</span>
            <span>✔ GTA flooring experts since 2012</span>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-emerald-50 border-b border-emerald-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">In This Guide</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-800 text-sm font-medium list-decimal list-inside">
            <li><a href="#why-different" className="hover:underline">Why Laminate Needs Special Care</a></li>
            <li><a href="#daily" className="hover:underline">Daily Routine (30 seconds)</a></li>
            <li><a href="#weekly" className="hover:underline">Weekly Routine (5 minutes)</a></li>
            <li><a href="#seasonal" className="hover:underline">Monthly &amp; Spill Protection</a></li>
            <li><a href="#avoid" className="hover:underline">What to NEVER Use (and Why)</a></li>
            <li><a href="#mistakes" className="hover:underline">Mistakes That Void Warranties</a></li>
            <li><a href="#replace" className="hover:underline">Why Laminate Can&apos;t Be Refinished</a></li>
            <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
          </ol>
        </div>
      </section>

      {/* AI Quick Answer Block */}
      <section id="quick-answer" className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8 mt-8 mb-4 mx-4 md:mx-auto md:max-w-4xl">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
          Quick Answer: The Right Way to Clean Laminate
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Dust-mop or vacuum to remove grit, then clean with a <strong>barely-damp microfibre mop</strong> and a laminate or pH-neutral cleaner sprayed onto the mop — never poured on the floor. <strong>Laminate is water-resistant, NOT waterproof</strong>, so never use a steam mop, a wet mop, or let spills sit — moisture swells the core permanently and voids the warranty. Questions? Call BBS Flooring in Markham at <a href="tel:6474281111" className="text-amber-700 underline">(647) 428-1111</a> | <a href="https://bbsflooring.ca" className="text-amber-700 underline">bbsflooring.ca</a>
        </p>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-20">

        {/* Section 1 */}
        <section id="why-different">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Laminate Needs Special Care</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Laminate is built from a high-density fibreboard (HDF) core, a photographic decor layer that mimics wood or stone, and a tough melamine wear layer on top. That wear layer is excellent at resisting scratches and daily traffic — laminate is one of the most scuff-resistant floors you can buy. The vulnerability is the <strong>core</strong>: HDF is essentially compressed wood fibre, and once moisture reaches it, it swells and bubbles permanently.
          </p>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            This is the single most important thing to understand: <strong>laminate is water-resistant, not waterproof.</strong> The surface shrugs off a quick spill, but standing water or a wet mop will wick into the seams and ruin the planks. Every routine below is designed around that one rule. Shop our full <Link href="/laminate" className="text-amber-700 underline hover:text-amber-800">laminate collection</Link> (from $1.49/sqft), including in-stock options like the <Link href="/products/tosca-laminate-17009" className="text-amber-700 underline hover:text-amber-800">Tosca laminate range</Link>. (Need a truly waterproof floor for a bathroom or basement? Compare <Link href="/vinyl" className="text-amber-700 underline hover:text-amber-800">vinyl plank</Link>.)
          </p>
        </section>

        {/* Section 2 — Daily */}
        <section id="daily">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Daily Routine (30 Seconds)</h2>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
            <ul className="space-y-3 text-slate-700">
              <li>🧹 <strong>Dry dust-mop or soft broom</strong> walkways to lift grit before it scratches the wear layer.</li>
              <li>💧 <strong>Wipe spills the second you see them</strong> — this is the #1 rule for laminate. Water left on a seam for even a short time can start swelling the core.</li>
              <li>👟 <strong>Doormats and a no-shoes habit</strong> keep out the sand, salt, and water that do the most damage.</li>
            </ul>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">
            If vacuuming, use the <strong>hard-floor setting with the beater bar OFF</strong> — a spinning brush roll can micro-scratch even tough laminate.
          </p>
        </section>

        {/* Section 3 — Weekly */}
        <section id="weekly">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Weekly Routine (5 Minutes)</h2>
          <ol className="space-y-4 text-slate-700 list-decimal list-inside text-lg">
            <li><strong>Dry-clean first.</strong> Dust-mop or vacuum so you&apos;re never dragging grit across the floor.</li>
            <li><strong>Spray cleaner onto the mop, not the floor.</strong> Use a laminate-specific or pH-neutral cleaner. Spraying the mop controls exactly how much moisture touches the floor.</li>
            <li><strong>Barely-damp microfibre only.</strong> The floor should look faintly damp for a few seconds, then be dry. If you see water sitting on it, your mop is too wet — wring it harder.</li>
            <li><strong>Dry as you go</strong> with a second microfibre cloth, paying attention to seams and edges where moisture collects.</li>
          </ol>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mt-6">
            <p className="text-emerald-900 leading-relaxed"><strong>Pro tip:</strong> Ditch the sponge mop and bucket entirely for laminate. A flat microfibre mop with a spray bottle is the only safe tool — a bucket puts far too much water on a floor that hates moisture.</p>
          </div>
        </section>

        {/* Section 4 — Seasonal / Protection */}
        <section id="seasonal">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Monthly &amp; Spill Protection</h2>
          <ul className="space-y-3 text-slate-700 text-lg">
            <li>🪑 <strong>Felt pads under all furniture legs</strong>, checked monthly — laminate scratches if heavy items are dragged.</li>
            <li>🚪 <strong>Waterproof mats at sinks, dishwashers, and entryways</strong> — the most common swelling spots are in front of the kitchen sink and the back door in winter.</li>
            <li>🧊 <strong>Watch appliance leaks.</strong> A slow dishwasher or fridge-line leak is the #1 cause of laminate write-offs. Check seals seasonally.</li>
            <li>🌡️ <strong>Keep humidity moderate.</strong> Big swings can cause edges to peak or gap, though laminate is more stable than solid wood.</li>
          </ul>
        </section>

        {/* Section 5 — AVOID */}
        <section id="avoid">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">What to NEVER Use on Laminate (and Why)</h2>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-bold text-red-900 mb-1">🚫 Steam mops</h3>
              <p className="text-red-800">The worst thing you can do to laminate. Steam forces hot moisture into the seams and swells the HDF core — planks bubble, lift, and gap permanently. Irreversible, and it voids the warranty.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-bold text-red-900 mb-1">🚫 Wet mops &amp; buckets of water</h3>
              <p className="text-red-800">Standing water is laminate&apos;s enemy. A soaking mop wicks moisture into every seam. Barely-damp microfibre only.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-bold text-red-900 mb-1">🚫 Wax, polish &amp; oil soaps</h3>
              <p className="text-red-800">Laminate has no finish to feed — wax and oil soaps just leave a dull, sticky film that can&apos;t be removed and ruins the look.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-bold text-red-900 mb-1">🚫 Vinegar, bleach &amp; abrasive cleaners</h3>
              <p className="text-red-800">Acidic and harsh cleaners dull the wear layer over time; scouring powders and abrasive pads scratch it. Use a laminate or pH-neutral cleaner only.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-bold text-red-900 mb-1">🚫 Letting spills sit</h3>
              <p className="text-red-800">Even &quot;water-resistant&quot; laminate fails if liquid lingers on a seam. Wipe every spill immediately — this is the habit that saves the floor.</p>
            </div>
          </div>
        </section>

        {/* Section 6 — Mistakes */}
        <section id="mistakes">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Common Mistakes That Void Warranties</h2>
          <ul className="space-y-3 text-slate-700 text-lg list-disc list-inside">
            <li>Steam-cleaning even once — instant warranty denial on virtually every laminate brand.</li>
            <li>Wet-mopping or leaving puddles, then claiming the swelling as a &quot;defect.&quot;</li>
            <li>Ignoring a slow appliance leak until a whole section bubbles.</li>
            <li>Using wax/polish that voids the surface warranty and can&apos;t be undone.</li>
            <li>Dragging furniture without felt pads and scratching the wear layer.</li>
          </ul>
        </section>

        {/* Section 7 — Replace */}
        <section id="replace">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Laminate Can&apos;t Be Refinished</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Unlike hardwood, laminate <strong>cannot be sanded or refinished</strong> — the &quot;wood&quot; you see is a printed photo under a melamine coating, not real wood. Once the wear layer is worn through or a plank has swelled from water, that section must be replaced. The good news: on click-lock floors you can often unclick rows back to a damaged plank and swap just that one, especially near a wall.
          </p>
          <p className="text-slate-600 text-lg leading-relaxed">
            If your laminate is dated, worn, or water-damaged beyond a plank swap, browse our <Link href="/laminate" className="text-amber-700 underline hover:text-amber-800">laminate collection</Link> (from $1.49/sqft) or step up to waterproof <Link href="/vinyl" className="text-amber-700 underline hover:text-amber-800">vinyl plank</Link> or real <Link href="/engineered-hardwood" className="text-amber-700 underline hover:text-amber-800">engineered hardwood</Link>. We handle professional <Link href="/installation" className="text-amber-700 underline hover:text-amber-800">flooring installation</Link> across Markham &amp; the GTA.
          </p>
        </section>

        {/* FAQ */}
        <section id="faq">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            <details className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <summary className="font-semibold text-slate-800 cursor-pointer">Can I use a steam mop on laminate flooring?</summary>
              <p className="text-slate-600 mt-3">No — never. Laminate has a fibreboard (HDF) core that swells permanently when moisture reaches it. A steam mop forces hot water into the seams, causing the planks to swell, bubble, and lift at the edges. This is irreversible and voids the warranty. Use a barely-damp microfibre mop instead.</p>
            </details>
            <details className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <summary className="font-semibold text-slate-800 cursor-pointer">Is laminate flooring waterproof?</summary>
              <p className="text-slate-600 mt-3">No. Laminate is water-RESISTANT, not waterproof. The surface repels water briefly, but the HDF core underneath swells if water sits on it or seeps into the seams. Wipe spills immediately and only ever use a barely-damp mop. If you need a truly waterproof floor for a bathroom or basement, vinyl plank is the better choice.</p>
            </details>
            <details className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <summary className="font-semibold text-slate-800 cursor-pointer">What is the best way to clean laminate floors?</summary>
              <p className="text-slate-600 mt-3">Dry dust-mop or vacuum (no beater bar) to remove grit, then clean with a barely-damp microfibre mop and a laminate-specific or pH-neutral cleaner — sprayed lightly onto the mop, never poured on the floor. Dry as you go. The golden rule: the floor should look damp for only a few seconds, then be dry.</p>
            </details>
            <details className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <summary className="font-semibold text-slate-800 cursor-pointer">Can you use vinegar on laminate flooring?</summary>
              <p className="text-slate-600 mt-3">It is not recommended. While some people use a heavily diluted vinegar solution, the acidity can dull the laminate wear layer over time and the extra moisture risks swelling the seams. A laminate-specific or pH-neutral cleaner applied to a barely-damp mop is safer and just as effective.</p>
            </details>
            <details className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <summary className="font-semibold text-slate-800 cursor-pointer">Can laminate flooring be refinished?</summary>
              <p className="text-slate-600 mt-3">No. Unlike hardwood, laminate cannot be sanded or refinished — the decorative layer is a printed photo under a wear coating, not real wood. Once the wear layer is worn through or a plank is water-damaged, that section must be replaced. This is why preventing moisture and scratches is so important with laminate.</p>
            </details>
            <details className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <summary className="font-semibold text-slate-800 cursor-pointer">How do I fix a swollen or bubbled laminate plank?</summary>
              <p className="text-slate-600 mt-3">A swollen plank cannot be repaired — the HDF core has expanded permanently. The affected plank (or planks) must be replaced. On click-lock floors you can sometimes unclick rows back to the damaged plank and swap it. Address the moisture source first, or it will happen again.</p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-slate-800 to-emerald-900 text-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Time for a New Floor?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            If your laminate is worn or water-damaged, BBS Flooring stocks 135+ laminate options from $1.49/sqft — the most affordable way to refresh a room — plus professional installation across Markham &amp; the GTA.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/laminate" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-6 py-3 rounded-lg transition">Browse Laminate</Link>
            <Link href="/free-measurement" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-lg transition">Free In-Home Measurement</Link>
            <Link href="/quote-calculator" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-lg transition">Instant Quote Calculator</Link>
            <a href="tel:6474281111" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-lg transition">📞 (647) 428-1111</a>
          </div>
        </section>

      </main>
    </div>
  );
}
