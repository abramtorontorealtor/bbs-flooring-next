'use client';

import Link from 'next/link';

const NEIGHBOURHOODS = [
  ['Unionville', 'Heritage staircases refinished or recapped to match original wood.'],
  ['Cornell', 'New-build carpeted MDF stairs converted to solid oak.'],
  ['Cachet', 'Grand estate staircases — premium treads and custom railings.'],
  ['Cathedraltown', 'Modern homes wanting wide, clean-line hardwood stairs.'],
  ['Markham Village', 'Character homes with stairs worth refinishing.'],
  ['Berczy Village', 'Family homes upgrading carpeted stairs to hardwood.'],
  ['Wismer', 'Builder-grade stairs recapped to match new floors.'],
  ['Greensborough', 'Carpet-to-hardwood conversions in newer subdivisions.'],
  ['Angus Glen', 'Luxury staircases with iron pickets and exotic species.'],
  ['Milliken', 'Established homes refreshing tired stair treads.'],
];

export default function StairRefinishingMarkhamClient() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">
            BBS Flooring — Serving Markham Since 2012
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Staircase Refinishing in Markham
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Recap carpeted builder stairs in new oak, or sand and restain your existing staircase to match your floors. Recapping from <strong className="text-white">$185/step</strong>, refinishing from <strong className="text-white">$125/step</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm">
            <a href="tel:6474281111" className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-6 py-3 rounded-lg transition">📞 (647) 428-1111</a>
            <Link href="/free-measurement?service=stair-refinishing" className="bg-white/10 hover:bg-white/20 border border-white/30 font-semibold px-6 py-3 rounded-lg transition">Book a Free In-Home Estimate</Link>
          </div>
        </div>
      </section>

      {/* Quick answer */}
      <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8 mt-8 mb-4 mx-4 md:mx-auto md:max-w-4xl">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">Staircase Refinishing Cost in Markham — At a Glance</h2>
        <p className="text-gray-700 leading-relaxed">
          In Markham, <strong>recapping with new hardwood treads</strong> is <strong>$185/step</strong>, <strong>sand &amp; restain refinishing</strong> is <strong>$125/step</strong>, and a <strong>full carpet-to-hardwood conversion</strong> runs about <strong>$200/step</strong>. A typical 13-step staircase is roughly <strong>$1,625–$2,600</strong>. Every tread is colour-matched to your floors. Free in-home assessment: <a href="tel:6474281111" className="text-amber-700 underline">(647) 428-1111</a>.
        </p>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-16">

        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Recapping vs Refinishing vs Conversion</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            The right approach depends on what you have today. <strong>Refinishing</strong> sands your existing hardwood treads and re-stains them — perfect for solid wood stairs that are scratched or dated but structurally sound. <strong>Recapping</strong> installs brand-new hardwood treads and risers over the existing staircase structure, which is the go-to when your treads are MDF, builder-grade, or beyond refinishing. <strong>Carpet-to-hardwood conversion</strong> is the full transformation — we strip the carpet, assess the structure, and finish with new solid treads and risers.
          </p>
          <p className="text-stone-600 text-lg leading-relaxed">
            In Markham&apos;s newer subdivisions — Cornell, Greensborough, Wismer, Cathedraltown — most homes were built with carpeted MDF stairs, so recapping or conversion is the usual route. Older Unionville and Markham Village homes often have solid oak stairs that simply need refinishing. We&apos;ll tell you which makes sense at the free visit. See the full process on our main <Link href="/stair-refinishing" className="text-amber-700 underline">stair refinishing</Link> and <Link href="/carpet-to-hardwood-stairs" className="text-amber-700 underline">carpet-to-hardwood stairs</Link> pages.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Markham Pricing</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-stone-200 rounded-lg overflow-hidden">
              <thead className="bg-stone-100 text-stone-800">
                <tr><th className="p-4">Service</th><th className="p-4">Price</th><th className="p-4">Typical 13-step stair</th></tr>
              </thead>
              <tbody className="text-stone-700">
                <tr className="border-t border-stone-200"><td className="p-4">Refinish (sand &amp; restain)</td><td className="p-4 font-semibold">$125/step</td><td className="p-4">~$1,625</td></tr>
                <tr className="border-t border-stone-200 bg-stone-50"><td className="p-4">Recap (new hardwood treads)</td><td className="p-4 font-semibold">$185/step</td><td className="p-4">~$2,405</td></tr>
                <tr className="border-t border-stone-200"><td className="p-4">Carpet-to-hardwood conversion</td><td className="p-4 font-semibold">$200/step</td><td className="p-4">~$2,600</td></tr>
                <tr className="border-t border-stone-200 bg-stone-50"><td className="p-4">Railing &amp; spindle replacement</td><td className="p-4 font-semibold">custom quote</td><td className="p-4">from ~$1,500</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-stone-500 text-sm mt-4">Final price depends on stair count, species, railing work, and access. Every quote is free and in-home.</p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Our Process &amp; Timeline</h2>
          <ol className="space-y-4 text-stone-700 text-lg list-decimal list-inside">
            <li><strong>Free in-home assessment.</strong> We inspect the staircase, count steps, and recommend refinish, recap, or conversion.</li>
            <li><strong>Demo (if needed).</strong> Carpet, underpad, tack strips, and staples removed; structure checked.</li>
            <li><strong>Tread &amp; riser install or sanding.</strong> New solid treads fitted, or existing wood sanded smooth.</li>
            <li><strong>Custom staining.</strong> Colour-matched to your main floors.</li>
            <li><strong>Finishing.</strong> Durable polyurethane coats with cure time between each.</li>
          </ol>
          <p className="text-stone-600 text-lg leading-relaxed mt-6">
            A typical 13-step Markham staircase takes 2–3 days for recapping, 3–5 days for a full carpet-to-hardwood conversion, or 1–2 days for refinishing only.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Markham Neighbourhoods We Serve</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {NEIGHBOURHOODS.map(([name, note]) => (
              <div key={name} className="bg-white border border-stone-200 rounded-lg p-4">
                <p className="font-semibold text-stone-900">{name}</p>
                <p className="text-stone-600 text-sm">{note}</p>
              </div>
            ))}
          </div>
          <p className="text-stone-600 text-lg leading-relaxed mt-6">
            Our Highway 7 showroom is central to Markham, so site visits are quick. Pairing stairs with new floors? See our <Link href="/hardwood-refinishing-markham" className="text-amber-700 underline">Markham hardwood refinishing</Link> and <Link href="/flooring-in/markham" className="text-amber-700 underline">all flooring in Markham</Link>.
          </p>
        </section>

        {/* FAQ accordion mirrors faqItems exactly */}
        <section id="faq">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              ['How much does staircase refinishing cost in Markham?', 'Recapping with new hardwood treads is $185/step, sand & restain refinishing is $125/step, and a full carpet-to-hardwood conversion runs about $200/step. A typical 13-step Markham staircase is roughly $1,625–$2,600 depending on the option. Call (647) 428-1111 for a free in-home quote.'],
              ['Do you recap carpeted builder stairs in Markham new builds?', 'Yes — this is one of our most common Markham jobs. Many Cornell, Cathedraltown, Greensborough and Wismer homes were built with carpeted MDF stairs. We remove the carpet, install new solid oak treads and risers over the existing structure, and stain them to match your floors.'],
              ['How long does stair refinishing take?', 'A typical 13-step Markham staircase takes 2–3 days for recapping or 3–5 days for a full carpet-to-hardwood conversion. Refinishing only (sanding + staining) takes 1–2 days plus drying time. We give an exact timeline at the free assessment.'],
              ['Can you match my new stairs to my existing Markham floors?', 'Yes. We custom-stain treads to match any existing hardwood. If we are installing your main floors and stairs together, we guarantee a perfect colour match across the whole home.'],
              ['Is recapping cheaper than rebuilding the staircase?', 'Significantly. Recapping installs new hardwood over the existing staircase structure, so there is no demolition — typically 40–60% less than a full rebuild, and it looks identical to a brand-new staircase.'],
              ['Which Markham neighbourhoods do you serve?', 'All of them — Unionville, Cornell, Cachet, Cathedraltown, Markham Village, Berczy Village, Wismer, Greensborough, Angus Glen, Milliken and more. Our Highway 7 showroom is central to Markham, so site visits are quick.'],
            ].map(([q, a]) => (
              <details key={q} className="bg-stone-50 border border-stone-200 rounded-lg p-5">
                <summary className="font-semibold text-stone-900 cursor-pointer">{q}</summary>
                <p className="text-stone-600 mt-3 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-amber-950 to-stone-900 text-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Transform Your Markham Staircase</h2>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">Free in-home assessment and a written quote. Recapping from $185/step, refinishing from $125/step.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:6474281111" className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-8 py-4 rounded-lg transition">📞 (647) 428-1111</a>
            <Link href="/free-measurement?service=stair-refinishing" className="bg-white/10 hover:bg-white/20 border border-white/30 font-semibold px-8 py-4 rounded-lg transition">Book Free Estimate</Link>
          </div>
        </section>

      </main>
    </div>
  );
}
