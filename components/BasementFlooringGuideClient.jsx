'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function BasementFlooringGuideClient() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">
            BBS Flooring — Buying Guide 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Best Flooring for Basements in Ontario
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Moisture, concrete subfloors, and Ontario&apos;s climate make basements the hardest room to floor. This guide covers what works, what doesn&apos;t, and what it costs — with 233 waterproof options in stock.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-stone-400">
            <span>✔ 233 waterproof options</span>
            <span>✔ From $2.19/sqft</span>
            <span>✔ Ontario-specific advice</span>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-amber-50 border-b border-amber-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-stone-700 mb-4">In This Guide</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-700 text-sm font-medium list-decimal list-inside">
            <li><a href="#basement-challenges" className="hover:underline">Why Basements Need Special Flooring</a></li>
            <li><a href="#best-options" className="hover:underline">The 4 Best Options (Ranked)</a></li>
            <li><a href="#moisture-barriers" className="hover:underline">Moisture Testing &amp; Barriers</a></li>
            <li><a href="#vinyl-deep-dive" className="hover:underline">Vinyl for Basements: Complete Breakdown</a></li>
            <li><a href="#cost-breakdown" className="hover:underline">Basement Flooring Cost Calculator</a></li>
            <li><a href="#installation" className="hover:underline">Installation Over Concrete</a></li>
            <li><a href="#common-mistakes" className="hover:underline">5 Mistakes to Avoid</a></li>
            <li><a href="#ontario-specific" className="hover:underline">Ontario Basement Considerations</a></li>
            <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
          </ol>
        </div>
      </section>

      {/* AI Quick Answer Block */}
      <section id="quick-answer" className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8 mb-8 mx-4 md:mx-0">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
          Quick Answer: Best Basement Flooring in Ontario
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Vinyl/SPC flooring is the best choice for Ontario basements &#8212; 100% waterproof, installs over concrete, handles temperature swings and moisture. BBS Flooring in Markham carries 188 vinyl options from $2.19/sqft with professional installation at $2.00/sqft. Free in-home measurement across the GTA: <a href="tel:6474281111">(647) 428-1111</a> | <a href="https://bbsflooring.ca">bbsflooring.ca</a>
        </p>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-20">

        {/* 1. Basement Challenges */}
        <section id="basement-challenges">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Why Basements Need Special Flooring</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            A basement is not a main floor with lower ceilings. It&apos;s a fundamentally different environment, and the flooring you choose must account for conditions that don&apos;t exist anywhere else in your home. Understanding these challenges is the difference between a basement floor that lasts 20 years and one that warps in 18 months.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {[
              ['💧 Concrete Slab Moisture', 'Every Ontario basement sits on a concrete slab, and concrete is porous. Even in homes with no visible water problems, moisture wicks up through the slab via capillary action. This invisible vapour can reach 5–8 lbs of moisture per 1,000 sqft per 24 hours — enough to destroy any flooring that isn\u2019t designed for it.'],
              ['🌡️ Temperature Swings', 'Ontario basements experience dramatic seasonal temperature changes. Summer humidity can push indoor RH above 60%, while winter heating drops it below 30%. This 30%+ humidity swing causes wood products to expand and contract — a cycle that, without proper construction, leads to gapping, cupping, and buckling.'],
              ['🏔️ Below-Grade Water Table', 'Your basement is below the water table line. Heavy spring rains, snowmelt, and rising water tables create hydrostatic pressure against the foundation. Even with foundation drainage, many GTA basements experience periodic moisture events. A flooring that can\u2019t handle occasional water exposure is a liability.'],
              ['❄️ Cold Concrete', 'Concrete is a thermal sink — it stays cold even when the room is heated. This creates a temperature differential between the subfloor and the air that causes condensation at the surface. Any flooring with organic materials (real wood, HDF core) can absorb this condensation and swell over time.'],
            ].map(([title, desc]) => (
              <div key={title} className="border border-stone-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-stone-800 mb-2">{title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <p className="text-stone-700 font-medium">
              <strong>The bottom line:</strong> Your basement flooring must handle moisture from below (concrete), moisture from the air (humidity), temperature extremes, and the possibility of an actual water event. Not every flooring type can do this.
            </p>
          </div>
        </section>

        {/* 2. Best Options Ranked */}
        <section id="best-options">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">The 4 Best Basement Flooring Options (Ranked)</h2>

          <div className="space-y-6">
            {/* #1 Vinyl */}
            <div className="border-2 border-amber-400 rounded-xl p-6 bg-amber-50/30">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-amber-600 text-white text-sm font-bold px-3 py-1 rounded-full">#1 BEST OVERALL</span>
                <span className="text-stone-400 text-sm">233 options · $2.19–$3.59/sqft</span>
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-3">Vinyl (LVP/SPC)</h3>
              <p className="text-stone-600 leading-relaxed mb-4">
                Vinyl is the gold standard for basement flooring. SPC (stone polymer composite) vinyl is 100% waterproof through every layer — surface, core, and backing. Water can pool on it for days without damage. It installs via click-lock directly over concrete with no adhesive, handles temperature swings without expanding or contracting, and feels warm and comfortable underfoot despite the cold slab below.
              </p>
              <p className="text-stone-600 leading-relaxed mb-4">
                BBS stocks 188+ vinyl options from 6 brands: <Link href="/naf-flooring" className="text-amber-700 underline">NAF</Link>, <Link href="/woden-flooring" className="text-amber-700 underline">Woden</Link>, <Link href="/triforest-flooring" className="text-amber-700 underline">Triforest</Link>, <Link href="/simba-flooring" className="text-amber-700 underline">Simba</Link>, <Link href="/falcon-flooring" className="text-amber-700 underline">Falcon</Link>, and <Link href="/lee-flooring" className="text-amber-700 underline">Lee</Link>. Prices range from $2.19–$3.59/sqft with wear layers from 12mil to 28mil. Our top picks for basements: the <Link href="/products/fulham-naf-aquaplus-platinum-9mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">NAF AquaPlus Platinum Fulham</Link> ($3.49/sqft, 9mm with 20mil wear layer — ideal for family rooms), the budget-friendly <Link href="/products/cliffside-falcon-floor-products-6mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Falcon Cliffside</Link> ($2.19/sqft, 6mm SPC), and for a premium herringbone look, the <Link href="/products/h02-seaside-motel-woden-7mm-vinyl-herringbone-flooring" className="text-amber-700 underline hover:text-amber-800">Woden Seaside Motel Herringbone</Link> ($2.79/sqft).
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-800 text-sm mb-1">✅ Why it&apos;s #1 for basements</p>
                  <ul className="text-stone-600 text-xs space-y-1">
                    <li>• 100% waterproof — handles floods</li>
                    <li>• No expansion/contraction with humidity</li>
                    <li>• Click-lock install over bare concrete</li>
                    <li>• Warm and comfortable vs cold tile</li>
                    <li>• Most affordable installed cost</li>
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-semibold text-red-800 text-sm mb-1">⚠️ Watch out for</p>
                  <ul className="text-stone-600 text-xs space-y-1">
                    <li>• Choose SPC over WPC for basements (denser core)</li>
                    <li>• 20mil+ wear layer for heavy use</li>
                    <li>• Use underlayment with vapour barrier if not built-in</li>
                    <li>• Subfloor must be flat (check for dips/humps)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* #2 Laminate */}
            <div className="border border-stone-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-stone-600 text-white text-sm font-bold px-3 py-1 rounded-full">#2 BUDGET-FRIENDLY</span>
                <span className="text-stone-400 text-sm">145 options · $1.49–$3.29/sqft</span>
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-3">Laminate</h3>
              <p className="text-stone-600 leading-relaxed mb-4">
                Laminate is the cheapest way to floor a basement — starting at $1.49/sqft at BBS. Modern laminate with water-resistant HDF cores (look for &quot;aqua&quot; or &quot;water-resistant&quot; labels) can handle typical basement humidity. But here&apos;s the critical caveat: <strong>laminate is water-resistant, NOT waterproof.</strong> Standing water will swell the HDF core and cause irreversible damage.
              </p>
              <p className="text-stone-600 leading-relaxed mb-4">
                Use laminate in basements only if: (a) the basement is dry with no moisture history, (b) you install a quality moisture barrier underlayment, and (c) you accept the risk that any water event (pipe burst, sump pump failure, spring flooding) will likely destroy the floor. For dry, finished basements used as offices or spare bedrooms, laminate is a solid budget choice.
              </p>
              <p className="text-stone-600 text-sm">
                BBS carries 145 laminate options from 9 brands. For basements, choose AC4+ rated products: <Link href="/naf-flooring" className="text-amber-700 underline">NAF</Link> (32 options), <Link href="/simba-flooring" className="text-amber-700 underline">Simba</Link> (18), <Link href="/northernest-flooring" className="text-amber-700 underline">Northernest</Link> (18), <Link href="/triforest-flooring" className="text-amber-700 underline">Triforest</Link> (16). Budget picks: <Link href="/tosca-flooring" className="text-amber-700 underline">Tosca</Link> from $1.49/sqft.
              </p>
            </div>

            {/* #3 Engineered Hardwood */}
            <div className="border border-stone-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-stone-600 text-white text-sm font-bold px-3 py-1 rounded-full">#3 PREMIUM LOOK</span>
                <span className="text-stone-400 text-sm">348 options · $2.49–$8.99/sqft</span>
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-3">Engineered Hardwood</h3>
              <p className="text-stone-600 leading-relaxed mb-4">
                Engineered hardwood <em>can</em> work in a basement — but only under specific conditions. Its cross-ply plywood core makes it more dimensionally stable than solid hardwood, and it can be installed over concrete via glue-down ($3.25/sqft labour) or click-lock floating installation. The real wood surface gives basements a premium, warm look that vinyl can&apos;t quite replicate.
              </p>
              <p className="text-stone-600 leading-relaxed mb-4">
                <strong>However, engineered hardwood is NOT waterproof.</strong> Any standing water will damage the wood veneer and core. Only use engineered hardwood in basements that are: (a) completely dry with verified low moisture readings, (b) finished and climate-controlled year-round, and (c) protected by a proper moisture barrier between the concrete and the flooring. If your basement has ANY history of water intrusion, choose vinyl.
              </p>
              <p className="text-stone-600 text-sm">
                For dry basements on a budget, the <Link href="/products/blizzard-woden-vermont-6-1-2-oak-engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Woden Vermont Blizzard</Link> ($3.99/sqft) or <Link href="/products/linen-falcon-floor-products-6-1-2-red-oak-engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Falcon Linen Red Oak</Link> ($3.89/sqft) offer real hardwood beauty at accessible prices. Premium options include <Link href="/vidar-flooring" className="text-amber-700 underline">Vidar</Link> (call for pricing) and <Link href="/products/pure-lucid-canadian-standard-engineered-american-oak-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Canadian Standard Lucid Pure</Link> ($7.59/sqft).
              </p>
            </div>

            {/* #4 Solid Hardwood */}
            <div className="border border-red-200 rounded-xl p-6 bg-red-50/30">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">NOT RECOMMENDED</span>
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-3">Solid Hardwood</h3>
              <p className="text-stone-600 leading-relaxed mb-4">
                Solid hardwood should not be installed in basements. Three reasons: (1) It requires nail-down installation on a wood subfloor — basements have concrete. (2) It expands and contracts dramatically with moisture changes — basements have the most volatile moisture in the house. (3) It absorbs water readily and has zero moisture resistance.
              </p>
              <p className="text-stone-600 leading-relaxed">
                If someone insists on solid hardwood in a basement, it requires building a plywood subfloor system over the concrete (adding $3–$5/sqft plus height loss) and running a dehumidifier year-round. Even then, the floor will likely show gapping in winter and cupping in summer. The money is far better spent on premium engineered hardwood or high-end vinyl.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Moisture Barriers */}
        <section id="moisture-barriers">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Moisture Testing &amp; Barriers: The Step Most People Skip</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            The #1 reason basement floors fail is moisture that wasn&apos;t tested for or addressed before installation. This step takes 30 minutes and costs almost nothing — but skipping it can cost you the entire floor.
          </p>

          <div className="space-y-6">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-stone-800 mb-4">Two Tests Every Basement Needs</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-stone-800 mb-2">1. Calcium Chloride Test (ASTM F1869)</p>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    A calcium chloride dish is sealed to the concrete for 60–72 hours. It measures the moisture vapour emission rate (MVER). For flooring installation, the result should be under 3 lbs per 1,000 sqft per 24 hours for most vinyl, and under 5 lbs for laminate. Kits cost $15–$25 at hardware stores.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-stone-800 mb-2">2. Relative Humidity Test (ASTM F2170)</p>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    A probe is inserted into a hole drilled 40% into the slab depth, measuring internal RH. Most flooring manufacturers require under 75% RH for warranty coverage. This test is more accurate than calcium chloride for slabs with applied coatings. Professional testing costs $100–$300.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-stone-800 mb-4">Moisture Barrier Options</h3>
              <div className="space-y-4">
                {[
                  ['6mil Polyethylene Vapour Barrier', '$0.10–$0.25/sqft', 'The minimum standard. Lay over concrete, overlap seams by 6 inches, tape all seams. Provides basic moisture protection for floating installations (vinyl and laminate).'],
                  ['Underlayment with Built-in Vapour Barrier', '$0.50–$1.50/sqft', 'Premium underlayments like DMX One Step or QuietWalk Plus combine cushioning with a moisture barrier. Ideal for floating vinyl installations. Some vinyl products include a built-in pad — check before buying extra.'],
                  ['DRIcore Subfloor Panels', '$3.00–$5.00/sqft', 'Engineered panels with a built-in air gap and moisture barrier. They create a raised subfloor that allows moisture to evaporate beneath the flooring. The gold standard for problem basements. Adds ½" of height.'],
                ].map(([name, cost, desc]) => (
                  <div key={name} className="flex flex-col sm:flex-row gap-4">
                    <div className="sm:w-1/3">
                      <p className="font-semibold text-stone-800">{name}</p>
                      <p className="text-amber-600 text-sm font-semibold">{cost}</p>
                    </div>
                    <p className="text-stone-600 text-sm sm:w-2/3">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="text-stone-700 font-medium">
                <strong>BBS includes moisture testing</strong> as part of every free in-home measurement. Our technician will test your concrete slab and advise on the right barrier for your specific situation — no extra charge.{' '}
                <Link href="/free-measurement" className="text-amber-700 underline">Book your free measurement →</Link>
              </p>
            </div>
          </div>
        </section>

        {/* 4. Vinyl Deep Dive */}
        <section id="vinyl-deep-dive">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Vinyl for Basements: The Complete Breakdown</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            Since vinyl is the recommended #1 choice, here&apos;s everything you need to know about choosing the right vinyl for your basement.
          </p>

          <div className="overflow-x-auto rounded-xl border border-stone-200 mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-left p-4 font-semibold">SPC (Stone Polymer Composite)</th>
                  <th className="text-left p-4 font-semibold">WPC (Wood Polymer Composite)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Core material', 'Limestone + PVC (extremely dense)', 'Wood dust + PVC (slightly softer)'],
                  ['Waterproof', '✅ 100%', '✅ 100%'],
                  ['Dent resistance', '★★★★★ Excellent', '★★★ Good (softer core)'],
                  ['Comfort underfoot', '★★★ Firm', '★★★★★ Softer, warmer'],
                  ['Sound dampening', '★★★ Moderate', '★★★★ Better'],
                  ['Temperature stability', '★★★★★ Minimal expansion', '★★★★ Good'],
                  ['Best for basements?', '✅ Yes — better for concrete', '✅ Yes — if comfort is priority'],
                  ['Price at BBS', '$2.19–$3.59/sqft', '$2.49–$3.59/sqft'],
                ].map(([feature, spc, wpc], i) => (
                  <tr key={feature} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="p-4 font-medium text-stone-800">{feature}</td>
                    <td className="p-4 text-stone-600">{spc}</td>
                    <td className="p-4 text-stone-600">{wpc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-stone-800 mb-4">Wear Layer Guide for Basements</h3>
            <div className="space-y-3">
              {[
                ['12mil', 'Light residential', 'Storage rooms, guest bedrooms — low traffic. Adequate for spaces used occasionally.'],
                ['20mil', 'Standard residential', 'Family rooms, home offices, playrooms — the sweet spot for most basements. Handles furniture and regular foot traffic.'],
                ['28mil', 'Heavy residential / commercial', 'Home gyms, entertainment spaces, rental basements — maximum durability. Worth the small premium if the basement gets heavy use.'],
              ].map(([thickness, rating, desc]) => (
                <div key={thickness} className="flex gap-4 items-start">
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">{thickness}</span>
                  <div>
                    <p className="font-semibold text-stone-800">{rating}</p>
                    <p className="text-stone-600 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="text-left p-4 font-semibold">Brand</th>
                  <th className="text-left p-4 font-semibold">Options</th>
                  <th className="text-left p-4 font-semibold">Price Range</th>
                  <th className="text-left p-4 font-semibold">Best For</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['NAF Flooring', '60+', '$2.79–$3.49', 'Widest selection, AquaPlus series with 20mil+ wear layers'],
                  ['Woden Flooring', '45+', '$2.79–$3.19', 'Herringbone options, great mid-range quality'],
                  ['Triforest Flooring', '40+', '$2.29–$3.19', 'Reliable mid-range, 4.2–7mm options'],
                  ['Simba Flooring', '35+', '$2.59–$3.59', 'Budget to premium range, Venus herringbone'],
                  ['Falcon Flooring', '18+', '$2.19–$2.59', 'Lowest price point — best budget vinyl at BBS'],
                  ['Lee Flooring', '10+', '$2.49', 'Affordable 7mm with 22mil wear layer'],
                ].map(([brand, count, price, best], i) => (
                  <tr key={brand} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="p-4 font-medium text-stone-800">{brand}</td>
                    <td className="p-4 text-stone-600">{count}</td>
                    <td className="p-4 text-stone-600">{price}</td>
                    <td className="p-4 text-stone-600">{best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Cost Breakdown */}
        <section id="cost-breakdown">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Basement Flooring Cost Calculator</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            Typical basement sizes and what you&apos;ll actually pay — material + professional installation by BBS. Add-ons listed separately so you can build an accurate budget.
          </p>

          <div className="overflow-x-auto rounded-xl border border-stone-200 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="text-left p-4 font-semibold">Flooring Type</th>
                  <th className="text-left p-4 font-semibold">$/sqft Total</th>
                  <th className="text-right p-4 font-semibold">400 sqft</th>
                  <th className="text-right p-4 font-semibold">600 sqft</th>
                  <th className="text-right p-4 font-semibold">800 sqft</th>
                  <th className="text-right p-4 font-semibold">1,000 sqft</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Vinyl (budget)', '$4.19', '$1,676', '$2,514', '$3,352', '$4,190'],
                  ['Vinyl (mid-range)', '$4.75', '$1,900', '$2,850', '$3,800', '$4,750'],
                  ['Vinyl (premium)', '$5.59', '$2,236', '$3,354', '$4,472', '$5,590'],
                  ['Laminate (budget)', '$3.49', '$1,396', '$2,094', '$2,792', '$3,490'],
                  ['Laminate (mid-range)', '$4.69', '$1,876', '$2,814', '$3,752', '$4,690'],
                  ['Eng. Hardwood (glue)', '$5.74', '$2,296', '$3,444', '$4,592', '$5,740'],
                  ['Eng. Hardwood (prem)', '$12.24', '$4,896', '$7,344', '$9,792', '$12,240'],
                ].map(([type, perSqft, s400, s600, s800, s1000], i) => (
                  <tr key={type} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="p-4 font-medium text-stone-800">{type}</td>
                    <td className="p-4 text-amber-700 font-semibold">{perSqft}</td>
                    <td className="p-4 text-stone-600 text-right">{s400}</td>
                    <td className="p-4 text-stone-600 text-right">{s600}</td>
                    <td className="p-4 text-stone-600 text-right">{s800}</td>
                    <td className="p-4 text-stone-600 text-right">{s1000}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-6">
            <h3 className="font-semibold text-stone-800 mb-3">Common Add-Ons</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                ['Old carpet removal', '$1.00/sqft'],
                ['Old vinyl/laminate removal', '$1.25/sqft'],
                ['Moisture barrier underlayment', '$0.50–$1.50/sqft'],
                ['DRIcore subfloor panels', '$3.00–$5.00/sqft'],
                ['Baseboards', '$3.61/linear ft'],
                ['Inside delivery', '$200 flat'],
              ].map(([item, cost]) => (
                <div key={item} className="flex justify-between">
                  <span className="text-stone-600">{item}</span>
                  <span className="text-amber-700 font-semibold">{cost}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Installation */}
        <section id="installation">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Installation Over Concrete: What to Know</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            Concrete subfloors are the standard in Ontario basements, and they require different installation approaches than wood subfloors upstairs.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="border border-stone-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-1">Floating (Click-Lock)</h3>
              <p className="text-amber-600 font-semibold text-sm mb-3">$2.00/sqft labour</p>
              <p className="text-stone-600 text-sm leading-relaxed">
                Planks click together and float over an underlayment — nothing is attached to the concrete. This is the standard for vinyl and laminate in basements. Fastest to install, easiest to remove if needed, and accommodates seasonal expansion. Requires a flat, level subfloor (within 3/16&quot; over 10 feet).
              </p>
            </div>
            <div className="border border-stone-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-1">Glue-Down</h3>
              <p className="text-amber-600 font-semibold text-sm mb-3">$3.25/sqft labour</p>
              <p className="text-stone-600 text-sm leading-relaxed">
                Each plank is adhered directly to the concrete with flooring adhesive. Used for engineered hardwood and some premium vinyl. Creates a solid bond with no hollow sound underfoot. The concrete must be clean, dry, smooth, and moisture-tested. More labour-intensive but produces a premium result.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-stone-800">Key Installation Requirements</h3>
            {[
              ['Subfloor Preparation', 'Concrete must be flat (within 3/16" per 10 feet), clean, and free of old adhesive residue. Any dips or humps need levelling compound ($1–$3/sqft). BBS assesses this during the free measurement.'],
              ['Expansion Gaps', 'Leave ¼" to ½" gap around all walls, pipes, and fixed objects. Floating floors expand and contract — without gaps, they buckle. Baseboards and shoe moulding cover the gap.'],
              ['Acclimation', 'Flooring material should sit in the basement for 48–72 hours before installation, allowing it to adjust to the room\u2019s temperature and humidity. Keep boxes flat, not on end.'],
              ['Moisture Barrier', 'Even if moisture tests pass, install a 6mil poly barrier under floating floors. It costs almost nothing and provides insurance against future moisture changes. Glue-down installations use a moisture-blocking adhesive instead.'],
            ].map(([title, desc]) => (
              <div key={title} className="bg-stone-50 border border-stone-200 rounded-xl p-5">
                <p className="font-semibold text-stone-800 mb-1">{title}</p>
                <p className="text-stone-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Common Mistakes */}
        <section id="common-mistakes">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">5 Mistakes to Avoid with Basement Flooring</h2>

          <div className="space-y-4">
            {[
              ['1. Skipping the moisture test', 'This is the most expensive shortcut in flooring. A $15 calcium chloride kit can save you $5,000 in floor replacement. Moisture wicking through concrete is invisible until it\u2019s too late. BBS tests for free during every in-home measurement.'],
              ['2. Installing solid hardwood', 'We see this every year — homeowners spend $6,000+ on solid hardwood in a basement, and within 18 months it\u2019s gapping and cupping. Solid hardwood is designed for wood subfloors above grade. Basements have concrete and moisture. Use engineered hardwood if you want real wood, vinyl if you want peace of mind.'],
              ['3. Forgetting expansion gaps', 'Floating floors (vinyl, laminate, click-lock engineered) need ¼"–½" clearance around every wall and fixed object. Without gaps, the floor has nowhere to expand in summer humidity — it buckles upward, usually in the middle of the room. This is installer error, not product failure.'],
              ['4. Using cheap underlayment (or none)', 'A $0.15/sqft foam pad might save $50 on a 600 sqft basement, but it provides zero moisture protection. Spend $0.50–$1.50/sqft on underlayment with a built-in vapour barrier. Your flooring warranty may depend on it.'],
              ['5. Ignoring drainage issues', 'No flooring can fix a basement that floods. If you have active water intrusion, foundation cracks, or a failing sump pump — fix the water problem first, then floor. Installing over a moisture problem just hides the damage until it\u2019s catastrophic.'],
            ].map(([title, desc]) => (
              <div key={title} className="border border-red-100 bg-red-50/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-stone-800 mb-2">{title}</h3>
                <p className="text-stone-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Ontario Specific */}
        <section id="ontario-specific">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Ontario Basement Considerations</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            Ontario has specific climate and geological conditions that affect basement flooring decisions. Here&apos;s what you need to know if you&apos;re in the GTA.
          </p>

          <div className="space-y-4">
            {[
              ['🌊 High Water Table Areas', 'Parts of Markham, Pickering, Ajax, and low-lying areas of Scarborough sit on clay soils with high water tables. Basements in these areas see more hydrostatic pressure and groundwater seepage. If you\u2019re in one of these zones, vinyl is the only safe choice — and invest in a quality sump pump and battery backup.'],
              ['🌧️ Spring Flooding Season', 'March through May is peak basement moisture season in Ontario. Snowmelt and spring rains saturate the ground, raising the water table and increasing foundation pressure. Never install basement flooring in spring without testing moisture levels first — wait until levels stabilize.'],
              ['☀️ Summer Humidity', 'Ontario summers push indoor humidity above 60% without air conditioning or a dehumidifier. Basement walls and concrete slabs sweat when warm humid air meets cool surfaces. A dehumidifier set to 45–50% RH is essential for any non-vinyl basement flooring.'],
              ['❄️ Winter Dryness', 'Forced-air heating drops indoor RH below 25% in Ontario winters. This dramatic swing (60%+ in summer to sub-25% in winter) causes wood flooring to gap and shrink. Engineered hardwood handles this better than solid, but a humidifier set to 35–40% RH protects the floor investment.'],
              ['📋 Building Code', 'Ontario Building Code requires minimum ceiling heights of 6\u20195\u201d for finished basements. Every inch of flooring thickness matters — choose thinner profiles (vinyl at 4–5mm) if ceiling height is tight. DRIcore adds ½" which may push you below code in low-ceiling basements.'],
              ['💨 Radon Awareness', 'Parts of the GTA have elevated radon levels. If your basement has radon mitigation (sub-slab depressurization), ensure the flooring installation doesn\u2019t seal over radon ports or compromise the mitigation system. Floating floors are generally radon-neutral; glue-down can trap gases.'],
            ].map(([title, desc]) => (
              <div key={title} className="bg-stone-50 border border-stone-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-stone-800 mb-2">{title}</h3>
                <p className="text-stone-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 9. FAQ */}
        <section id="faq">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-3">
            {[
              ['What is the best waterproof flooring for a basement?', 'Vinyl (LVP/SPC) — 100% waterproof through the core. BBS carries 233 waterproof vinyl options from $2.19–$3.59/sqft. SPC vinyl is slightly better for basements than WPC due to its denser, more stable core. Brands like NAF, Woden, and Triforest are top sellers for basements.'],
              ['Can you put hardwood in a basement?', 'Engineered hardwood can work in dry, finished basements with proper moisture testing and barriers. Use glue-down ($3.25/sqft) or floating installation. Never use solid hardwood in a basement — it cannot handle concrete subfloors or basement moisture levels.'],
              ['What is the cheapest basement flooring?', 'Laminate from Tosca Floors at $1.49/sqft + $2.00/sqft installation = $3.49/sqft total. A 600 sqft basement costs about $2,094. But laminate is NOT waterproof — only use in dry basements. Vinyl from $2.19/sqft is $420 more for 600 sqft but gives you 100% waterproof protection.'],
              ['How do you handle moisture in a basement before installing flooring?', 'Step 1: Test moisture (calcium chloride or RH test). Step 2: Install a 6mil polyethylene vapour barrier over the concrete. Step 3: For problem basements, use DRIcore subfloor panels ($3–$5/sqft). Step 4: Run a dehumidifier year-round at 45–50% RH. BBS tests moisture free during in-home measurements.'],
              ['Does BBS Flooring install basement flooring?', 'Yes. BBS provides professional basement flooring installation across the GTA with WSIB-insured contractors. Vinyl/laminate: $2.00/sqft, engineered hardwood glue-down: $3.25/sqft. Includes subfloor assessment and moisture testing. Call (647) 428-1111 or book at bbsflooring.ca/free-measurement.'],
              ['How long does vinyl flooring last in a basement?', 'Quality SPC vinyl lasts 15–25 years in a basement. Products with 20mil+ wear layers last longest. BBS carries vinyl with wear layers from 12mil to 28mil. For a basement that gets regular use, invest in 20mil or higher — the cost difference is small ($0.30–$0.50/sqft) but longevity improves significantly.'],
              ['Can laminate go in a basement?', 'Yes, but only in dry basements with a moisture barrier underlayment. Laminate is water-resistant, not waterproof — standing water will swell the HDF core. Choose AC4+ rated products for durability. If there is any history of moisture or flooding, use vinyl instead. BBS carries 145 laminate options from $1.49/sqft.'],
              ['What about carpet in basements?', 'Not recommended in Ontario. Carpet absorbs moisture, promotes mould growth, and is nearly impossible to dry after a water event. If warmth is the goal, vinyl with built-in underlayment or vinyl + a quality pad provides warmth without the mould risk. Area rugs on top of vinyl give you the soft feel where you want it.'],
              ['Do I need underlayment for basement flooring?', 'For floating vinyl or laminate: yes — use underlayment with a built-in vapour barrier. Some vinyl products have attached padding (check specs before buying separate underlayment). For glue-down engineered hardwood: no underlayment, but use moisture-blocking adhesive. BBS advises on the right setup during your free measurement.'],
              ['How much does it cost to floor a 600 sqft basement?', 'At BBS: Vinyl (budget): $2,514. Vinyl (mid-range): $2,850. Laminate: $2,094–$2,814. Engineered hardwood (glue-down): $3,444–$7,344. Add $600 for old carpet removal, $200 for delivery, and $300–$900 for underlayment if needed. Free measurement and detailed quote available.'],
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
          <h2 className="text-3xl font-bold mb-4">Ready to Floor Your Basement?</h2>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
            BBS Flooring stocks 233 waterproof vinyl options from $2.19/sqft — perfect for Ontario basements. Free moisture testing and in-home measurement included.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/waterproof-flooring" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors">
              Browse Waterproof Vinyl
            </Link>
            <Link href="/quote-calculator" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg px-6 py-3 font-semibold transition-colors">
              Get a Free Quote
            </Link>
            <Link href="/free-measurement" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg px-6 py-3 font-semibold transition-colors">
              Book Free Measurement
            </Link>
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
