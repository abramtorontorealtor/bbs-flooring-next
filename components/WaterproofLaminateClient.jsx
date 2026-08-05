'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Phone, MapPin, Calendar, ArrowRight, CheckCircle, Thermometer, Droplets, Layers, DollarSign } from 'lucide-react';

const FALCON_COLOURS = [
  { name: 'Toasty', slug: 'toasty-falcon-floors-12mm-waterproof-laminate', price: '2.39' },
  { name: 'Sandy', slug: 'sandy-falcon-floors-12mm-waterproof-laminate', price: '2.39' },
  { name: 'Beachy', slug: 'beachy-falcon-floors-12mm-waterproof-laminate', price: '2.39' },
  { name: 'Rocky', slug: 'rocky-falcon-floors-12mm-waterproof-laminate', price: '2.39' },
  { name: 'Frosty', slug: 'frosty-falcon-floors-12mm-waterproof-laminate', price: '2.39' },
  { name: 'Icey', slug: 'icey-falcon-floors-12mm-waterproof-laminate', price: '2.39' },
  { name: 'Honey Oak', slug: 'honey-oak-falcon-floors-12mm-waterproof-laminate', price: '2.45' },
  { name: 'Urban Oak', slug: 'urban-oak-falcon-floors-12mm-waterproof-laminate', price: '2.45' },
  { name: 'Pecan Oak', slug: 'pecan-oak-falcon-floors-12mm-waterproof-laminate', price: '2.45' },
  { name: 'Silver Oak', slug: 'silver-oak-falcon-floors-12mm-waterproof-laminate', price: '2.45' },
  { name: 'Snow Oak', slug: 'snow-oak-falcon-floors-12mm-waterproof-laminate', price: '2.45' },
  { name: 'Amber Oak', slug: 'amber-oak-falcon-floors-12mm-waterproof-laminate', price: '2.45' },
];

export default function WaterproofLaminateClient() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">
            BBS Flooring — Markham &amp; the GTA
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            72-Hour Waterproof Laminate Flooring
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
            The smart alternative to vinyl: 12mm waterproof laminate that is warmer, quieter, and thicker underfoot &mdash; from <span className="text-amber-300 font-semibold">$2.39/sqft</span>, in stock now.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-stone-300">
            <span>✔ 72-hour waterproof core</span>
            <span>✔ Warm pressed-wood feel</span>
            <span>✔ AC4 commercial-grade</span>
            <span>✔ 12 colours in stock</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <a href="tel:6474281111" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors inline-flex items-center gap-2">
              <Phone className="w-4 h-4" /> (647) 428-1111
            </a>
            <Link href="/free-measurement" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg px-6 py-3 font-semibold transition-colors inline-flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Book Free Measurement
            </Link>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-amber-50 border-b border-amber-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-stone-700 mb-4">In This Guide</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-700 text-sm font-medium list-decimal list-inside">
            <li><a href="#quick-answer" className="hover:underline">Quick Answer: Why Switch to Waterproof Laminate</a></li>
            <li><a href="#why-laminate" className="hover:underline">Why It Beats Vinyl</a></li>
            <li><a href="#thickness" className="hover:underline">The Thickness Story: 12mm → 17mm</a></li>
            <li><a href="#vs-vinyl" className="hover:underline">Waterproof Laminate vs SPC Vinyl</a></li>
            <li><a href="#colours" className="hover:underline">12 Colours In Stock from $2.39</a></li>
            <li><a href="#where" className="hover:underline">Where You Can Install It</a></li>
            <li><a href="#cost" className="hover:underline">Real GTA Pricing &amp; Installation</a></li>
            <li><a href="#related" className="hover:underline">Related Guides &amp; Pages</a></li>
            <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
          </ol>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-16">

        {/* Quick answer */}
        <section id="quick-answer" className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
            Quick Answer: Why Homeowners Are Switching from Vinyl to Waterproof Laminate
          </h2>
          <p className="text-gray-700 leading-relaxed">
            12mm 72-hour waterproof laminate gives you the water protection of vinyl with the warmth and realism of real wood &mdash; at a lower price. It is pressed wood, so it feels warm and quiet underfoot instead of the cold, hard feel of stone-plastic (SPC) vinyl. At BBS Flooring in Markham it starts at just <strong>$2.39/sqft</strong> &mdash; roughly <strong>45% less</strong> than our thickest 11mm vinyl at $4.35/sqft &mdash; and it is thicker. Call <a href="tel:6474281111" className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900">(647) 428-1111</a> or visit <a href="https://bbsflooring.ca" className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900">bbsflooring.ca</a>.
          </p>
        </section>

        {/* Why it beats vinyl — the 3 pillars */}
        <section id="why-laminate">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Why Waterproof Laminate Beats Vinyl</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="border border-stone-200 rounded-xl p-6">
              <Thermometer className="w-8 h-8 text-amber-600 mb-3" />
              <h3 className="font-bold text-stone-800 mb-2">Warmer Underfoot</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Laminate is pressed wood &mdash; a natural insulator that holds warmth. SPC vinyl is a stone-plastic composite that conducts cold from the subfloor. On a winter morning or over a concrete basement, the difference is immediate.
              </p>
            </div>
            <div className="border border-stone-200 rounded-xl p-6">
              <Layers className="w-8 h-8 text-amber-600 mb-3" />
              <h3 className="font-bold text-stone-800 mb-2">Thicker &amp; Quieter</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                At 12mm &mdash; often 14mm with attached pad, and 15&ndash;17mm once we add a premium underlay &mdash; it feels solid and dampens sound. Most vinyl is only 4&ndash;6mm and can feel hollow or clicky.
              </p>
            </div>
            <div className="border border-stone-200 rounded-xl p-6">
              <DollarSign className="w-8 h-8 text-amber-600 mb-3" />
              <h3 className="font-bold text-stone-800 mb-2">Better Value</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                From $2.39/sqft versus $4.35/sqft for our thickest 11mm vinyl. You get a thicker, warmer, more realistic floor for roughly half the price of premium vinyl.
              </p>
            </div>
          </div>
          <div className="mt-6 bg-stone-50 border-l-4 border-amber-500 p-5 rounded-r-lg">
            <p className="text-stone-700 leading-relaxed flex gap-3">
              <Droplets className="w-6 h-6 text-amber-600 shrink-0" />
              <span><strong>And it is genuinely waterproof.</strong> A sealed HDF core and tight locking joints hold out spills and standing water for up to 72 hours &mdash; far longer than any household spill or minor leak takes to clean up. This is not the old water-<em>resistant</em> laminate that swelled at the seams; it is a true waterproof floor.</span>
            </p>
          </div>
        </section>

        {/* Thickness story */}
        <section id="thickness">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">The Thickness Story: How 12mm Becomes 15&ndash;17mm</h2>
          <p className="text-stone-600 leading-relaxed mb-5">
            Thickness is where waterproof laminate really pulls ahead of vinyl. Here is how it stacks up in a real BBS installation:
          </p>
          <div className="space-y-3">
            {[
              ['12mm', 'The core plank — the wear layer plus the sealed HDF board. Already thicker than most vinyl on the market.'],
              ['14mm', 'Many of our 72-hour waterproof laminates ship with a 2mm pad already attached, so the plank itself is 14mm.'],
              ['15–17mm', 'When we add a 3–5mm premium underlay during floating installation, the finished floor is effectively 15–17mm — solid, warm, and quiet.'],
            ].map(([mm, desc]) => (
              <div key={mm} className="flex items-start gap-4 border border-stone-200 rounded-lg p-4">
                <span className="bg-amber-600 text-white font-bold rounded-lg px-3 py-2 text-sm shrink-0 w-24 text-center">{mm}</span>
                <p className="text-stone-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-stone-600 leading-relaxed mt-5">
            Compare that to vinyl: even our <strong>thickest 11mm vinyl (Woden) is $4.35/sqft</strong>, and most vinyl planks are only 4&ndash;6mm. With waterproof laminate you get more floor, more warmth, and more sound-dampening &mdash; for less money.
          </p>
        </section>

        {/* Comparison table */}
        <section id="vs-vinyl">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Waterproof Laminate vs SPC Vinyl</h2>
          <p className="text-stone-600 leading-relaxed mb-5">
            We sell both, and both are excellent waterproof floors &mdash; this is an honest comparison to help you choose the right one for your room.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-stone-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-stone-800 text-white text-left">
                  <th className="p-3 font-semibold"></th>
                  <th className="p-3 font-semibold">12mm Waterproof Laminate</th>
                  <th className="p-3 font-semibold">SPC Vinyl</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {[
                  ['Core material', 'Pressed wood (HDF) — warm', 'Stone-plastic composite — cold'],
                  ['Feel underfoot', 'Warmer, quieter, more like wood', 'Harder, colder, more uniform'],
                  ['Waterproof', '72-hour waterproof core & joints', '100% waterproof core'],
                  ['Typical thickness', '12mm (14mm w/ pad, 15–17mm installed)', '4–6mm (up to 11mm premium)'],
                  ['Wear rating', 'AC4 commercial-grade', 'Wear layer 12–28mil'],
                  ['Starting price (BBS)', '$2.39/sqft', '$1.99/sqft'],
                  ['Thickest option (BBS)', '12mm from $2.39', '11mm at $4.35'],
                  ['Best for', 'Living areas, bedrooms, kitchens, warm feel', 'Wet basements, flood-prone rooms'],
                ].map(([label, lam, vin]) => (
                  <tr key={label} className="odd:bg-white even:bg-stone-50">
                    <td className="p-3 font-semibold text-stone-700">{label}</td>
                    <td className="p-3 text-stone-700">{lam}</td>
                    <td className="p-3 text-stone-600">{vin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-stone-500 text-xs mt-3">
            Bottom line: for most living spaces, 12mm waterproof laminate is the warmer, better-value pick. For basements with a history of standing water or flooding, SPC vinyl is the safer choice. Not sure? We will advise honestly during your free measurement.
          </p>
        </section>

        {/* Colours in stock */}
        <section id="colours">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">12 Colours In Stock — From $2.39/sqft</h2>
          <p className="text-stone-600 leading-relaxed mb-5">
            Our Falcon Flooring 12mm 72-hour waterproof laminate is in stock in Markham across 12 colours, from warm honey oaks to cool greys. Every one is AC4 commercial-grade and 72-hour waterproof.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {FALCON_COLOURS.map((c) => (
              <Link
                key={c.slug}
                href={`/products/${c.slug}`}
                className="group border border-stone-200 rounded-lg p-4 hover:border-amber-400 transition-colors"
              >
                <h3 className="font-semibold text-stone-800 group-hover:text-amber-700 text-sm">{c.name}</h3>
                <p className="text-amber-700 font-bold text-sm mt-1">${c.price}/sqft</p>
                <span className="text-stone-400 text-xs mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/laminate" className="text-amber-700 font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
              Browse all laminate flooring <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Where to install */}
        <section id="where">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Where You Can Install Waterproof Laminate</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Living rooms & bedrooms', 'The warm, quiet, wood-like feel is ideal for the rooms you spend the most time in.'],
              ['Kitchens', '72-hour waterproof protection handles spills, splashes, and the odd dishwasher leak.'],
              ['Hallways & stairs', 'AC4 commercial-grade wear layer stands up to the busiest traffic in the house.'],
              ['Dry-to-moderate basements', 'Great over concrete with the right underlayment and vapour barrier. For flood-prone basements, choose SPC vinyl.'],
              ['Laundry & mudrooms', 'Water, boots, and pets are no problem for a sealed waterproof core.'],
              ['Rental units & offices', 'Durable, easy to clean, and priced right for larger areas.'],
            ].map(([room, note]) => (
              <div key={room} className="flex items-start gap-3 border border-stone-200 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm">{room}</h3>
                  <p className="text-stone-500 text-sm">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cost */}
        <section id="cost">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Real GTA Pricing &amp; Installation</h2>
          <div className="bg-stone-50 rounded-xl p-6 space-y-3 text-stone-700">
            <p className="flex justify-between border-b border-stone-200 pb-2"><span>12mm 72-hour waterproof laminate (material)</span><span className="font-semibold">from $2.39/sqft</span></p>
            <p className="flex justify-between border-b border-stone-200 pb-2"><span>Professional floating installation</span><span className="font-semibold">$2.00/sqft</span></p>
            <p className="flex justify-between border-b border-stone-200 pb-2"><span>Old flooring removal (if needed)</span><span className="font-semibold">$1.00–$1.25/sqft</span></p>
            <p className="flex justify-between border-b border-stone-200 pb-2"><span>Delivery</span><span className="font-semibold">Free pickup · $140 garage · $200 inside</span></p>
            <p className="flex justify-between pt-1"><span className="font-semibold">500 sqft room (material + install)</span><span className="font-bold text-amber-700">≈ $2,195</span></p>
          </div>
          <p className="text-stone-500 text-sm mt-4">
            Prices are per square foot and confirmed at your free in-home measurement. We serve Markham, Richmond Hill, Vaughan, Toronto, Scarborough, and the wider GTA.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <Link href="/quote-calculator" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors">Get a Free Quote</Link>
            <Link href="/free-measurement" className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-lg px-6 py-3 font-semibold transition-colors">Book Free Measurement</Link>
          </div>
        </section>

        {/* Related */}
        <section id="related">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Related Guides &amp; Pages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/laminate" className="group border border-stone-200 rounded-xl p-5 hover:border-amber-400 transition-colors">
              <h3 className="font-bold text-stone-800 group-hover:text-amber-700 mb-2">Shop All Laminate</h3>
              <p className="text-stone-500 text-sm">Browse every laminate floor in stock with live pricing.</p>
            </Link>
            <Link href="/waterproof-flooring" className="group border border-stone-200 rounded-xl p-5 hover:border-amber-400 transition-colors">
              <h3 className="font-bold text-stone-800 group-hover:text-amber-700 mb-2">Waterproof Flooring</h3>
              <p className="text-stone-500 text-sm">Compare all our waterproof options — vinyl and laminate.</p>
            </Link>
            <Link href="/blog/laminate-vs-vinyl-plank-flooring" className="group border border-stone-200 rounded-xl p-5 hover:border-amber-400 transition-colors">
              <h3 className="font-bold text-stone-800 group-hover:text-amber-700 mb-2">Laminate vs Vinyl Plank</h3>
              <p className="text-stone-500 text-sm">The honest, detailed comparison with real GTA pricing.</p>
            </Link>
            <Link href="/blog/12mm-laminate-flooring-review-guide" className="group border border-stone-200 rounded-xl p-5 hover:border-amber-400 transition-colors">
              <h3 className="font-bold text-stone-800 group-hover:text-amber-700 mb-2">12mm Laminate Review</h3>
              <p className="text-stone-500 text-sm">Full buying guide on 12mm waterproof laminate.</p>
            </Link>
            <Link href="/blog/best-waterproof-flooring-canadian-homes" className="group border border-stone-200 rounded-xl p-5 hover:border-amber-400 transition-colors">
              <h3 className="font-bold text-stone-800 group-hover:text-amber-700 mb-2">Best Waterproof Flooring</h3>
              <p className="text-stone-500 text-sm">Which waterproof floor wins for Canadian homes.</p>
            </Link>
            <Link href="/installation" className="group border border-stone-200 rounded-xl p-5 hover:border-amber-400 transition-colors">
              <h3 className="font-bold text-stone-800 group-hover:text-amber-700 mb-2">Installation Services</h3>
              <p className="text-stone-500 text-sm">How BBS installs floating laminate across the GTA.</p>
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              ['Is waterproof laminate really waterproof?', '72-hour waterproof laminate has a sealed HDF core and tight locking joints that keep spills and standing water out for up to 72 hours — plenty of time to clean up any household spill or minor leak with no damage. It is a genuine waterproof floor. BBS carries Falcon 12mm 72-hour waterproof laminate from $2.39/sqft.'],
              ['Waterproof laminate vs SPC vinyl — which is better?', 'Both are waterproof. The difference is feel and price. Vinyl has a stone-plastic core, so it is harder and colder. 12mm waterproof laminate is pressed wood — warmer, quieter, more like real wood — and thicker, yet starts at $2.39/sqft vs $4.35/sqft for our thickest 11mm vinyl. For most living areas, laminate is the warmer, better-value pick.'],
              ['How thick is 12mm waterproof laminate really?', 'The plank is 12mm. Many come with a 2mm pad already attached (14mm), and once we add a 3–5mm premium underlay during installation the finished floor is 15–17mm — a big step up from thin 4–6mm vinyl, at a lower price than premium 11mm vinyl.'],
              ['Why does laminate feel warmer than vinyl?', 'Laminate is pressed wood (HDF), a natural insulator that holds warmth. SPC vinyl is stone-plastic and conducts cold from the subfloor, so it feels cold — especially over concrete and in winter. If warmth underfoot matters, waterproof laminate wins.'],
              ['How much does it cost in the GTA?', 'Falcon 12mm 72-hour waterproof laminate is in stock from $2.39/sqft. Floating installation is $2.00/sqft. A 500 sqft room is roughly $2,195 for material and installation before removal and delivery. Book a free measurement for an exact quote.'],
              ['Can I put it in a kitchen, bathroom, or basement?', 'Yes — kitchens, laundry rooms, powder rooms, and dry-to-moderate basements when installed with the right underlayment over concrete. For basements with a flooding history, we recommend SPC vinyl. We carry both and advise honestly.'],
              ['Is it good for pets and kids?', 'One of the best choices — the AC4 wear layer resists scratches, the surface wipes clean, and the 72-hour waterproof core shrugs off pet accidents and spills. It is also warmer and quieter than vinyl.'],
              ['Does BBS install it across the GTA?', 'Yes — floating installation across Markham, Richmond Hill, Vaughan, Toronto, Scarborough, and the wider GTA at $2.00/sqft. Call (647) 428-1111 or book at bbsflooring.ca/free-measurement.'],
            ].map(([q, a]) => (
              <details key={q} className="border border-stone-200 rounded-lg group">
                <summary className="p-4 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 flex justify-between items-center">
                  {q}
                  <span className="text-stone-400 group-open:rotate-180 transition-transform ml-4 shrink-0">▼</span>
                </summary>
                <div className="px-4 pb-4 text-stone-600 leading-relaxed">{a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-stone-900 to-amber-900 text-white rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">See It, Feel It, in Our Markham Showroom</h2>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
            Come feel the warmth and thickness of 72-hour waterproof laminate for yourself — or book a free in-home measurement and we will bring samples to you. From $2.39/sqft, in stock now.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/laminate" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors">Browse Waterproof Laminate</Link>
            <Link href="/quote-calculator" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg px-6 py-3 font-semibold transition-colors">Get a Free Quote</Link>
            <Link href="/free-measurement" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg px-6 py-3 font-semibold transition-colors">Book Free Measurement</Link>
          </div>
          <p className="mt-6 text-stone-400 text-sm">
            📍 6061 Highway 7, Unit B, Markham · 📞 (647) 428-1111 · Mon–Sat 10am–5pm
          </p>
        </section>

      </main>

      <Footer />
    </div>
  );
}
