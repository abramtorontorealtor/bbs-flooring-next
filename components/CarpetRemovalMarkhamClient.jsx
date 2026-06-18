'use client';

import Link from 'next/link';

const NEIGHBOURHOODS = [
  ['Unionville', 'Carpet pulled from heritage homes, ready for new hardwood.'],
  ['Cornell', 'Builder-carpeted bedrooms and basements cleared fast.'],
  ['Cachet', 'Large estate homes — whole-floor carpet removal.'],
  ['Cathedraltown', 'Newer homes converting carpet to hard surface.'],
  ['Markham Village', 'Older homes with decades-old carpet and underpad.'],
  ['Berczy Village', 'Family homes upgrading to vinyl or laminate.'],
  ['Wismer', 'Quick single-day clears for new-floor installs.'],
  ['Greensborough', 'Basement and bedroom carpet removal.'],
  ['Angus Glen', 'Premium homes prepping for hardwood.'],
  ['Milliken', 'Established homes with install-ready subfloor needs.'],
];

export default function CarpetRemovalMarkhamClient() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">
            BBS Flooring — Serving Markham Since 2012
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Carpet Removal in Markham
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Fast, clean carpet rip-out for <strong className="text-white">$1.00/sqft</strong> + $75 haul-away. Tack strips, staples, and underpad gone — install-ready subfloor guaranteed, 24-hour turnaround.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm">
            <a href="tel:6474281111" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 py-3 rounded-lg transition">📞 (647) 428-1111</a>
            <Link href="/free-measurement?service=carpet-removal" className="bg-white/10 hover:bg-white/20 border border-white/30 font-semibold px-6 py-3 rounded-lg transition">Book a Free Quote</Link>
          </div>
        </div>
      </section>

      {/* Quick answer */}
      <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 md:p-8 mt-8 mb-4 mx-4 md:mx-auto md:max-w-4xl">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">Carpet Removal Cost in Markham — At a Glance</h2>
        <p className="text-gray-700 leading-relaxed">
          In Markham, carpet removal is a flat <strong>$1.00/sqft</strong> plus a <strong>$75 haul-away fee</strong>. A typical 1,000 sqft home is about <strong>$1,075</strong> including disposal. We pull the carpet, underpad, tack strips, and staples, patch nail holes, and leave a clean, <strong>install-ready subfloor</strong> — usually in a single day. Free quote: <a href="tel:6474281111" className="text-emerald-700 underline">(647) 428-1111</a>.
        </p>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-16">

        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">What&apos;s Included</h2>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <ul className="space-y-3 text-slate-700 text-lg">
              <li>✔ <strong>Carpet &amp; underpad removal</strong> — pulled, rolled, and bagged.</li>
              <li>✔ <strong>Tack strip &amp; staple removal</strong> — every fastener pulled, not left behind.</li>
              <li>✔ <strong>Nail-hole patching</strong> — subfloor left smooth and ready.</li>
              <li>✔ <strong>Install-ready guarantee</strong> — the floor is ready for vinyl, laminate, or hardwood.</li>
              <li>✔ <strong>Haul-away &amp; disposal</strong> — old carpet responsibly removed for a flat $75.</li>
              <li>✔ <strong>24-hour turnaround</strong> — most Markham jobs done same-day.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Markham Pricing</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-800">
                <tr><th className="p-4">Item</th><th className="p-4">Price</th></tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-t border-slate-200"><td className="p-4">Carpet removal</td><td className="p-4 font-semibold">$1.00/sqft</td></tr>
                <tr className="border-t border-slate-200 bg-slate-50"><td className="p-4">Haul-away &amp; disposal</td><td className="p-4 font-semibold">$75 flat</td></tr>
                <tr className="border-t border-slate-200"><td className="p-4">Stairs</td><td className="p-4 font-semibold">custom quote</td></tr>
                <tr className="border-t border-slate-200 bg-slate-50"><td className="p-4">Typical 1,000 sqft home</td><td className="p-4 font-semibold">~$1,075</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-500 text-sm mt-4">Stairs vary by structure and require a custom quote. Every estimate is free.</p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Removal + New Floor in One Visit</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Most Markham customers aren&apos;t just removing carpet — they&apos;re upgrading to hard surface. Bundling the carpet removal with your new floor install saves a separate trip charge and gets you a finished room faster. We can quote the demo and the new floor together, and our Highway 7 showroom has 700+ floors in stock to choose from.
          </p>
          <p className="text-slate-600 text-lg leading-relaxed">
            Popular upgrades: <Link href="/vinyl" className="text-emerald-700 underline">waterproof vinyl plank</Link> (great for basements and high-traffic areas), <Link href="/laminate" className="text-emerald-700 underline">laminate</Link> (budget-friendly, from $1.49/sqft), and <Link href="/engineered-hardwood" className="text-emerald-700 underline">engineered hardwood</Link>. Not sure what fits? Book a <Link href="/free-measurement?service=carpet-removal" className="text-emerald-700 underline">free in-home measurement</Link> and we&apos;ll help you choose.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Markham Neighbourhoods We Serve</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {NEIGHBOURHOODS.map(([name, note]) => (
              <div key={name} className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="font-semibold text-slate-900">{name}</p>
                <p className="text-slate-600 text-sm">{note}</p>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-lg leading-relaxed mt-6">
            We serve all of Markham plus the wider GTA and Durham Region. See our main <Link href="/carpet-removal" className="text-emerald-700 underline">carpet removal service</Link> or explore <Link href="/flooring-in/markham" className="text-emerald-700 underline">all flooring in Markham</Link>.
          </p>
        </section>

        {/* FAQ accordion mirrors faqItems exactly */}
        <section id="faq">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              ['How much does carpet removal cost in Markham?', 'Carpet removal is $1.00/sqft plus a $75 haul-away fee. A typical 1,000 sqft Markham home is about $1,075 including disposal. We leave a clean, install-ready subfloor. Call (647) 428-1111 for a free quote.'],
              ['How fast can you remove carpet in Markham?', 'Most Markham carpet-removal jobs are done in a single day, and we offer 24-hour turnaround. Because our showroom is on Highway 7 in Markham, we can often schedule same-week — sometimes next-day for urgent jobs.'],
              ['Do you remove the tack strips and staples too?', 'Yes. Our price includes pulling the carpet, underpad, tack strips, and staples, then patching nail holes so the subfloor is ready for your new flooring. You are not left with a half-finished demo.'],
              ['Can you remove carpet and install new flooring in the same visit?', 'Yes — most Markham customers pair carpet removal with new vinyl, laminate, or hardwood. Bundling the demo with installation saves a trip charge and gets you a finished floor faster. We will quote both together.'],
              ['Do you haul away and dispose of the old carpet?', 'Yes. The $75 haul-away fee covers loading and responsible disposal of the old carpet and underpad — you do not have to deal with the dump or your municipal pickup limits.'],
              ['Which Markham areas do you serve for carpet removal?', 'All of Markham — Unionville, Cornell, Cachet, Cathedraltown, Markham Village, Berczy Village, Wismer, Greensborough, Angus Glen, Milliken and beyond, plus the wider GTA and Durham Region.'],
            ].map(([q, a]) => (
              <details key={q} className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                <summary className="font-semibold text-slate-900 cursor-pointer">{q}</summary>
                <p className="text-slate-600 mt-3 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Book Carpet Removal in Markham</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">Flat $1.00/sqft + $75 haul-away, install-ready subfloor, 24-hour turnaround. Free quote.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:6474281111" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-8 py-4 rounded-lg transition">📞 (647) 428-1111</a>
            <Link href="/free-measurement?service=carpet-removal" className="bg-white/10 hover:bg-white/20 border border-white/30 font-semibold px-8 py-4 rounded-lg transition">Book Free Quote</Link>
          </div>
        </section>

      </main>
    </div>
  );
}
