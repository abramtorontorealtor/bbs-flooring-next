'use client';

import Link from 'next/link';

const NEIGHBOURHOODS = [
  ['Unionville', 'Heritage homes with original oak that refinishes beautifully.'],
  ['Cornell', 'Newer builds — builder-grade hardwood ready for a richer stain.'],
  ['Cachet', 'Estate homes with large open floors and grand staircases.'],
  ['Cathedraltown', 'Modern builds; wide-plank engineered and solid oak.'],
  ['Markham Village', 'Older character homes with decades-old hardwood worth saving.'],
  ['Berczy Village', 'Family homes where high-traffic areas need a refresh.'],
  ['Wismer', 'Builder oak and maple primed for re-staining.'],
  ['Greensborough', 'Newer subdivisions, often 3/4" oak main floors.'],
  ['Angus Glen', 'Luxury homes with premium and exotic species.'],
  ['Milliken', 'Established homes with aging but solid hardwood.'],
];

export default function HardwoodRefinishingMarkhamClient() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">
            BBS Flooring — Serving Markham Since 2012
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Hardwood Floor Refinishing in Markham
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Bring tired hardwood back to life — dust-contained sanding, custom staining, and a flawless polyurethane finish. From <strong className="text-white">$5.25/sqft</strong>, typically 60–75% cheaper than replacing the floor.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm">
            <a href="tel:6474281111" className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-6 py-3 rounded-lg transition">📞 (647) 428-1111</a>
            <Link href="/free-measurement?service=hardwood-refinishing" className="bg-white/10 hover:bg-white/20 border border-white/30 font-semibold px-6 py-3 rounded-lg transition">Book a Free In-Home Estimate</Link>
          </div>
        </div>
      </section>

      {/* Quick answer */}
      <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8 mt-8 mb-4 mx-4 md:mx-auto md:max-w-4xl">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">Hardwood Refinishing Cost in Markham — At a Glance</h2>
        <p className="text-gray-700 leading-relaxed">
          In Markham, <strong>sand &amp; refinish (natural)</strong> is <strong>$5.25/sqft</strong> and <strong>sand, stain &amp; refinish</strong> is <strong>$6.25/sqft</strong>. A typical 1,000 sqft main floor runs <strong>$5,250–$6,250</strong> — far less than the $12,000+ it would cost to tear out and replace. We use HEPA dust-containment, work room-by-room, and colour-match to the rest of your home. Free in-home assessment: <a href="tel:6474281111" className="text-amber-700 underline">(647) 428-1111</a>.
        </p>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-16">

        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Why Refinish Instead of Replace?</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            Most Markham homes built from the 1990s onward have solid 3/4" oak or maple on the main floor — the kind of hardwood that can be sanded and refinished several times over its life. If your floors are scratched, sun-faded, water-marked around the kitchen, or simply the wrong colour for today&apos;s taste, refinishing restores them to better-than-new for a fraction of replacement cost. You keep the original solid wood (which is usually higher quality than what big-box stores sell today), avoid the mess and cost of demolition, and the job is done in days, not weeks.
          </p>
          <p className="text-stone-600 text-lg leading-relaxed">
            The only time we recommend replacement over refinishing is when the wear layer is too thin to sand again (common on older engineered floors) or there is structural water damage. We tell you honestly which camp your floors fall into during the free assessment — no upsell. If replacement is the smarter call, browse our <Link href="/engineered-hardwood" className="text-amber-700 underline">engineered hardwood</Link> and <Link href="/solid-hardwood" className="text-amber-700 underline">solid hardwood</Link> collections.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">What&apos;s Included</h2>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-6">
            <ul className="space-y-3 text-stone-700 text-lg">
              <li>✔ <strong>HEPA dust-contained sanding</strong> — coarse-to-fine grit progression for a glass-smooth surface.</li>
              <li>✔ <strong>Custom staining</strong> — colour-matched to your existing floors, stairs, or a fresh modern tone.</li>
              <li>✔ <strong>2–3 coats of premium polyurethane</strong> — water-based (clear, fast-dry, low-VOC) or oil-based (warm amber, ultra-durable).</li>
              <li>✔ <strong>Edge &amp; corner detailing</strong> — hand-sanded where machines can&apos;t reach.</li>
              <li>✔ <strong>Gap filling &amp; board repair</strong> — minor squeaks, gaps, and damaged boards addressed.</li>
              <li>✔ <strong>Full clean-up</strong> — we leave your Markham home ready to live in.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Markham Pricing</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-stone-200 rounded-lg overflow-hidden">
              <thead className="bg-stone-100 text-stone-800">
                <tr><th className="p-4">Service</th><th className="p-4">Price</th><th className="p-4">Typical 1,000 sqft</th></tr>
              </thead>
              <tbody className="text-stone-700">
                <tr className="border-t border-stone-200"><td className="p-4">Sand &amp; Refinish (Natural)</td><td className="p-4 font-semibold">$5.25/sqft</td><td className="p-4">~$5,250</td></tr>
                <tr className="border-t border-stone-200 bg-stone-50"><td className="p-4">Sand, Stain &amp; Refinish</td><td className="p-4 font-semibold">$6.25/sqft</td><td className="p-4">~$6,250</td></tr>
                <tr className="border-t border-stone-200"><td className="p-4">Stairs (refinish)</td><td className="p-4 font-semibold">from $125/step</td><td className="p-4">see <Link href="/stair-refinishing-markham" className="text-amber-700 underline">stair refinishing</Link></td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-stone-500 text-sm mt-4">Final price depends on floor condition, species, and access. Every quote is free and in-home.</p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Our Process &amp; Timeline</h2>
          <ol className="space-y-4 text-stone-700 text-lg list-decimal list-inside">
            <li><strong>Free in-home assessment.</strong> We measure, check the wear layer, and give you an exact written price.</li>
            <li><strong>Day 1 — Sanding.</strong> Coarse-to-fine grit with HEPA dust containment.</li>
            <li><strong>Day 2 — Staining</strong> (if applicable). Colour applied and left to cure.</li>
            <li><strong>Days 2–4 — Finishing.</strong> 2–3 polyurethane coats with drying/buffing between each.</li>
            <li><strong>Cure &amp; reset.</strong> Light foot traffic after 24h (water-based), furniture after 72h, rugs after 2 weeks.</li>
          </ol>
          <p className="text-stone-600 text-lg leading-relaxed mt-6">
            A typical 1,000 sqft Markham main floor is a 3–5 day job. We coordinate around your schedule and isolate work areas so the rest of the home stays usable.
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
            Our showroom sits on Highway 7 in the heart of Markham, so we&apos;re minutes from most homes. We also refinish across the wider GTA — see our main <Link href="/hardwood-refinishing" className="text-amber-700 underline">hardwood refinishing service</Link> page, or explore <Link href="/flooring-in/markham" className="text-amber-700 underline">all flooring services in Markham</Link>.
          </p>
        </section>

        {/* FAQ accordion mirrors faqItems exactly (visible == schema) */}
        <section id="faq">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              ['How much does hardwood floor refinishing cost in Markham?', 'Sand & refinish (natural) is $5.25/sqft and sand, stain & refinish is $6.25/sqft. A typical 1,000 sqft Markham main floor runs $5,250–$6,250 — usually 60–75% less than full replacement. Call (647) 428-1111 for a free in-home quote on your specific floors.'],
              ['Do you refinish hardwood floors in all Markham neighbourhoods?', 'Yes. We refinish hardwood across all of Markham including Unionville, Cornell, Cachet, Cathedraltown, Markham Village, Berczy Village, Wismer, Greensborough, Angus Glen, and Milliken. Our showroom is on Highway 7, so we are minutes from most Markham homes.'],
              ['How long does hardwood refinishing take?', 'A typical 1,000 sqft Markham home takes 3–5 days: 1 day sanding, 1 day staining (if applicable), and 1–2 days for polyurethane coats with drying time. Water-based finishes dry faster (2–3 hours between coats) than oil-based (8–12 hours).'],
              ['Can the original 1990s builder hardwood in my Markham home be refinished?', 'Almost always, yes. Solid 3/4" oak from Markham builds in the 1990s and 2000s can typically be sanded and refinished multiple times. We measure the remaining thickness during the free in-home assessment and tell you honestly whether refinishing or replacement is the smarter spend.'],
              ['How dusty is the sanding process?', 'We use HEPA-filtered vacuum attachments connected directly to the sander and seal off the work area, which dramatically reduces airborne dust versus old-school sanding. It is not 100% dust-free, but the rest of your Markham home stays clean.'],
              ['Do you offer free estimates in Markham?', 'Yes — every refinishing quote in Markham is free and in-home. We assess your floors, measure, check the wear layer, and give you an exact written price. Book online or call (647) 428-1111.'],
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
          <h2 className="text-3xl font-bold mb-4">Get Your Markham Floors Looking New Again</h2>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">Free in-home assessment, honest advice, and a written quote with no pressure. Refinishing from $5.25/sqft.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:6474281111" className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-8 py-4 rounded-lg transition">📞 (647) 428-1111</a>
            <Link href="/free-measurement?service=hardwood-refinishing" className="bg-white/10 hover:bg-white/20 border border-white/30 font-semibold px-8 py-4 rounded-lg transition">Book Free Estimate</Link>
          </div>
        </section>

      </main>
    </div>
  );
}
