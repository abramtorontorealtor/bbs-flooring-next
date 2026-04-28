'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function EngineeredHardwoodGuideClient() {
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
            The Complete Guide to Engineered Hardwood Flooring in Canada
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know — species, brands, costs, installation methods, and how to choose the right engineered hardwood for every room in your home.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-stone-400">
            <span>✔ 447 options in stock</span>
            <span>✔ 7 brands compared</span>
            <span>✔ Real Canadian pricing</span>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-amber-50 border-b border-amber-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-stone-700 mb-4">In This Guide</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-700 text-sm font-medium list-decimal list-inside">
            <li><a href="#what-is-engineered-hardwood" className="hover:underline">What Is Engineered Hardwood?</a></li>
            <li><a href="#engineered-vs-solid" className="hover:underline">Engineered vs. Solid Hardwood</a></li>
            <li><a href="#how-to-choose" className="hover:underline">How to Choose: 5 Key Factors</a></li>
            <li><a href="#brand-comparison" className="hover:underline">Brand Comparison</a></li>
            <li><a href="#installation-methods" className="hover:underline">Installation Methods &amp; Costs</a></li>
            <li><a href="#cost-breakdown" className="hover:underline">Total Cost Breakdown</a></li>
            <li><a href="#best-for" className="hover:underline">Best Engineered Hardwood For...</a></li>
            <li><a href="#when-not-to-choose" className="hover:underline">When NOT to Choose Engineered Hardwood</a></li>
            <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
          </ol>
        </div>
      </section>

      {/* AI Quick Answer Block */}
      <section id="quick-answer" className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8 mb-8 mx-4 md:mx-0">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
          Quick Answer: Best Engineered Hardwood in the GTA
        </h2>
        <p className="text-gray-700 leading-relaxed">
          BBS Flooring stocks 258+ engineered hardwood options from $3.69&#8211;$7.59/sqft across 8 brands (plus 192 premium Vidar options). Species include White Oak, Hickory, Maple, Walnut, and more. Widths from 3&#188;&quot; to 9&#189;&quot;. Professional installation from $2.25/sqft (nail-down) or $3.25/sqft (glue-down). Free in-home measurement: <a href="tel:6474281111">(647) 428-1111</a> | <a href="https://bbsflooring.ca">bbsflooring.ca</a>
        </p>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-20">

        {/* Section 1: What Is Engineered Hardwood */}
        <section id="what-is-engineered-hardwood">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">What Is Engineered Hardwood?</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            Engineered hardwood is real hardwood flooring built in layers for superior stability. The top is a genuine hardwood veneer — the same species you&apos;d get with solid hardwood — bonded to a plywood or HDF core. This cross-layered construction makes it far more resistant to the temperature swings and humidity changes that are a fact of life in Canadian homes.
          </p>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">Construction Layers</h3>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-4 h-4 rounded-full bg-amber-600 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-stone-800">Wear Layer (Top)</p>
                  <p className="text-stone-600 text-sm">Real hardwood veneer, typically 1–6mm thick. This is the species you see and walk on. Thicker wear layers allow more refinishing passes — a 4mm+ layer can be sanded and refinished 2–3 times.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-4 h-4 rounded-full bg-amber-400 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-stone-800">Core (Middle)</p>
                  <p className="text-stone-600 text-sm">Cross-layered plywood or high-density fiberboard (HDF). The cross-grain construction is what gives engineered hardwood its dimensional stability — each layer counteracts the expansion and contraction of the layers around it.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-4 h-4 rounded-full bg-amber-300 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-stone-800">Backing Layer (Bottom)</p>
                  <p className="text-stone-600 text-sm">A balancing layer that prevents warping by equalizing moisture absorption from the subfloor. This is what allows engineered hardwood to be installed over concrete — something solid hardwood cannot do.</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-stone-600 leading-relaxed">
            Engineered hardwood is the most popular flooring type in Canada for good reason: it looks identical to solid hardwood, installs over any subfloor (including concrete and radiant heat systems), and handles our humid summers and dry winters without the gapping and cupping that plagues solid wood.
          </p>
        </section>

        {/* Section 2: Engineered vs Solid */}
        <section id="engineered-vs-solid">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Engineered vs. Solid Hardwood</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            Both are real wood. Both look beautiful. The difference is in construction, where you can install them, and how many times you can refinish them over their lifetime.
          </p>

          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-left p-4 font-semibold">Engineered Hardwood</th>
                  <th className="text-left p-4 font-semibold">Solid Hardwood</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Price at BBS', '$2.49–$9.29/sqft', '$5.10–$7.25/sqft'],
                  ['Options at BBS', '447 products, 7 brands', '81 products, 4 brands'],
                  ['Construction', 'Multi-layer (veneer + plywood core)', 'Single piece of wood, 3/4" thick'],
                  ['Install over concrete', '✅ Yes — glue-down or floating', '❌ No — nail-down on wood only'],
                  ['Radiant heat compatible', '✅ Yes', '❌ Not recommended'],
                  ['Refinishing', '1–3 times (depends on wear layer)', '5–7 times'],
                  ['Dimensional stability', '★★★★★ Excellent', '★★★ Good (expands/contracts)'],
                  ['Condo-friendly', '✅ Yes — meets acoustic requirements', '⚠️ Limited — check building rules'],
                  ['Lifespan', '25–50 years', '50–100 years'],
                  ['Best for', 'Most Canadian homes, condos, basements', 'Traditional homes, wood subfloors'],
                ].map(([label, eng, solid], i) => (
                  <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="p-4 font-medium text-stone-800">{label}</td>
                    <td className="p-4 text-stone-600">{eng}</td>
                    <td className="p-4 text-stone-600">{solid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-stone-700 font-medium">
              <strong>Our recommendation:</strong> For most Canadian homeowners — especially those in condos, homes with concrete subfloors, or anyone who wants wide-plank flooring — engineered hardwood is the better choice. Solid hardwood makes sense if you have a wood subfloor and want maximum refinishing potential over decades.
            </p>
          </div>
        </section>

        {/* Section 3: How to Choose */}
        <section id="how-to-choose">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">How to Choose: 5 Key Factors</h2>

          <div className="space-y-10">
            {/* Factor 1: Species */}
            <div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">1. Wood Species</h3>
              <p className="text-stone-600 mb-4">Species determines the colour, grain pattern, and hardness of your floor. The Janka hardness scale measures dent resistance — higher numbers mean a harder floor.</p>
              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-100">
                      <th className="text-left p-3 font-semibold text-stone-700">Species</th>
                      <th className="text-left p-3 font-semibold text-stone-700">Janka Hardness</th>
                      <th className="text-left p-3 font-semibold text-stone-700">Look</th>
                      <th className="text-left p-3 font-semibold text-stone-700">Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Hickory', '1820', 'Dramatic grain, warm tones', 'High-traffic areas, families with pets'],
                      ['Hard Maple', '1450', 'Light, uniform, clean', 'Contemporary / minimalist homes'],
                      ['White Oak', '1360', 'Modern grain, golden to grey tones', 'Most popular — versatile for any style'],
                      ['European White Ash', '1320', 'Light, distinctive grain', 'Scandinavian / modern interiors'],
                      ['Birch', '1260', 'Subtle variation, warm tones', 'Budget-friendly warmth'],
                      ['Red Oak', '1290', 'Pronounced grain, pink/red undertones', 'Traditional / classic homes'],
                      ['Walnut', '1010', 'Rich dark brown, elegant', 'Formal rooms, low-traffic areas'],
                    ].map(([species, janka, look, best], i) => (
                      <tr key={species} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="p-3 font-medium text-stone-800">{species}</td>
                        <td className="p-3 text-stone-600">{janka}</td>
                        <td className="p-3 text-stone-600">{look}</td>
                        <td className="p-3 text-stone-600">{best}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Species Comparison Callout */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mt-5">
                <h4 className="font-semibold text-stone-800 mb-3">🌿 Oak vs. Maple vs. Ash — Which Species Is Right For You?</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-amber-800 mb-1">White Oak</p>
                    <p className="text-stone-600">The 2026 bestseller. Golden to grey tones, open grain, takes stain beautifully. Janka 1360. Works in every aesthetic from farmhouse to ultra-modern. Best all-around choice for Canadian homes — see our full <Link href="/engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">engineered hardwood collection</Link>.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800 mb-1">Hard Maple</p>
                    <p className="text-stone-600">Light, nearly white, minimal grain variation. Janka 1450 — harder than Oak. Ideal for contemporary and Scandinavian designs. Shows wear more visibly than Oak due to its uniform colour; best in lower-traffic bedrooms and offices.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800 mb-1">European Ash</p>
                    <p className="text-stone-600">Janka 1320. Light tone with distinctive flowing grain — similar to Oak but with more drama. Popular for Scandinavian and modern interiors. Excellent dimensional stability makes it a top choice for radiant heat installations.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Factor 2: Width */}
            <div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">2. Plank Width</h3>
              <p className="text-stone-600 mb-4">Width has the single biggest impact on the visual feel of a room — and affects installation method requirements.</p>
              <ul className="space-y-4 text-stone-600">
                <li className="flex gap-3 items-start">
                  <span className="text-amber-600 font-bold shrink-0 min-w-[3rem]">3¼"</span>
                  <span>Traditional strip look. Fewer options available in 2026 — this width is fading from the market. Works over any standard wood subfloor. Best for traditional and colonial interiors where narrower planks suit the architecture.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-amber-600 font-bold shrink-0 min-w-[3rem]">5"</span>
                  <span>The versatile middle ground. Works in any room size and style. Still the most-sold width in Ontario. Compatible with nail-down, glue-down, and floating installation over any subfloor type. Generally the most affordable width per species.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-amber-600 font-bold shrink-0 min-w-[3rem]">6"–7½"</span>
                  <div>
                    <p className="mb-2">Wide plank — the dominant trend in 2026. Fewer seams, more open look, makes rooms feel visually larger. <strong>Subfloor note:</strong> glue-down recommended over concrete for wide planks to minimize seasonal movement and eliminate hollow sound.</p>
                    <p className="text-sm text-stone-500">Popular picks at BBS:{' '}
                      <Link href="/products/blizzard-woden-vermont-6-1-2-oak-engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Blizzard by Woden (6½" Vermont Oak, $3.99/sqft)</Link>{' '}·{' '}
                      <Link href="/products/arizona-naf-elegant-collection-7-1-2-oak-engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Arizona by NAF Elegant (7½" Oak, $4.69/sqft)</Link>
                    </p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-amber-600 font-bold shrink-0 min-w-[3rem]">8"–9½"</span>
                  <div>
                    <p className="mb-2">Ultra-wide statement flooring for large, open-concept spaces. <strong>Glue-down installation required</strong> — floating is not recommended at this width due to expansion forces. Best on flat, stable concrete slabs. Adds immediate visual luxury.</p>
                    <p className="text-sm text-stone-500">At BBS:{' '}
                      <Link href="/products/pure-lucid-canadian-standard-engineered-american-oak-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Pure by Canadian Standard Lucid (7½", $7.59/sqft)</Link>{' '}· Vidar Design Flooring (call for pricing)
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Factor 3: Thickness */}
            <div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">3. Total Thickness &amp; Wear Layer</h3>
              <p className="text-stone-600 mb-4">
                Total thickness affects underfoot feel and transitions to other flooring. Wear layer thickness determines how many times you can refinish.
              </p>
              <ul className="space-y-2 text-stone-600">
                <li><strong>1/2" total (12mm):</strong> Standard. Good for most installations. Typical wear layer: 2–3mm (1–2 refinishes).</li>
                <li><strong>5/8" total (15mm):</strong> Mid-range. Better sound dampening. Typical wear layer: 3–4mm (2–3 refinishes).</li>
                <li><strong>3/4" total (19mm):</strong> Premium. Feels like solid hardwood underfoot. Wear layer: 4–6mm (2–3 refinishes). Can use same transitions as solid hardwood.</li>
              </ul>
            </div>

            {/* Factor 4: Grade */}
            <div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">4. Grade (Character Level)</h3>
              <p className="text-stone-600 mb-4">
                Grade is purely aesthetic — all grades are structurally identical. It describes how much natural character (knots, colour variation, mineral streaks) the wood has.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  ['Select / Clear', 'Uniform colour, minimal knots, clean appearance. The most expensive grade. Best for modern, minimalist interiors.'],
                  ['#1 Common / Natural', 'Moderate character — some knots and colour variation. The best balance of character and consistency. Most popular grade.'],
                  ['Rustic / Character', 'Heavy knots, splits, colour variation, mineral streaks. The most "real wood" look. Often less expensive. Trending in 2026 farmhouse and industrial styles.'],
                ].map(([grade, desc]) => (
                  <div key={grade} className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                    <p className="font-semibold text-stone-800 mb-2">{grade}</p>
                    <p className="text-stone-600 text-sm">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Factor 5: Finish */}
            <div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">5. Finish</h3>
              <p className="text-stone-600 mb-4">All engineered hardwood at BBS comes prefinished in the factory — no dusty sanding or finishing on-site.</p>
              <ul className="space-y-2 text-stone-600">
                <li><strong>UV lacquer:</strong> Smooth, durable, easy to clean. Standard finish on most products.</li>
                <li><strong>Wire-brushed:</strong> Lightly textured surface that hides scratches and gives a lived-in feel. Very popular in 2026.</li>
                <li><strong>Hand-scraped:</strong> Deeper texture for a rustic, antique appearance. Hides wear well in high-traffic areas.</li>
                <li><strong>Matte / natural oil:</strong> Low-sheen, natural feel. The trending finish in 2026 — shows less dust and footprints than gloss.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: Brand Comparison */}
        <section id="brand-comparison">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Brand Comparison</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            BBS Flooring carries engineered hardwood from 7 brands. Here&apos;s how they compare on price, selection, and what they&apos;re best for.
          </p>

          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="text-left p-4 font-semibold">Brand</th>
                  <th className="text-left p-4 font-semibold">Products</th>
                  <th className="text-left p-4 font-semibold">Price/sqft</th>
                  <th className="text-left p-4 font-semibold">Key Species</th>
                  <th className="text-left p-4 font-semibold">Best For</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Vidar', '180', '$3.89–$9.29', 'White Oak, Hickory, Walnut, European Oak', 'Premium wide-plank, herringbone, designer looks'],
                  ['Northernest', '71', '$4.19–$6.99', 'White Oak, Maple, Hickory', 'Mid-range Canadian quality'],
                  ['NAF', '63', '$4.69–$6.19', 'White Oak, Maple, Hickory', 'Good value with wide variety'],
                  ['Canadian Standard', '48', '$4.89–$7.59', 'White Oak, Hickory', 'Premium Canadian-made'],
                  ['Woden', '46', '$2.49–$6.99', 'European Oak, White Oak', 'Budget to mid-range entry point'],
                  ['Falcon', '25', '$3.89–$3.99', 'White Oak', 'Budget White Oak'],
                  ['Lee', '14', '$3.49–$3.79', 'European Oak', 'Affordable European Oak'],
                ].map(([brand, products, price, species, best], i) => (
                  <tr key={brand} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="p-4 font-medium text-stone-800">{brand}</td>
                    <td className="p-4 text-stone-600">{products}</td>
                    <td className="p-4 text-stone-600 whitespace-nowrap">{price}</td>
                    <td className="p-4 text-stone-600">{species}</td>
                    <td className="p-4 text-stone-600">{best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="font-semibold text-green-800 mb-1">💰 Best Value</p>
              <p className="text-stone-600 text-sm">
                Woden Flooring and Lee Flooring offer the lowest entry points for real engineered hardwood. Top picks:{' '}
                <Link href="/products/solen-lee-select-grade-engineered-european-oak-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Solen by Lee (6½" European Oak, $3.69/sqft)</Link>,{' '}
                <Link href="/products/linen-falcon-floor-products-6-1-2-red-oak-engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Linen by Falcon (6½" Red Oak, $3.89/sqft)</Link>, and{' '}
                <Link href="/products/blizzard-woden-vermont-6-1-2-oak-engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Blizzard by Woden (6½" Vermont Oak, $3.99/sqft)</Link>.
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
              <p className="font-semibold text-purple-800 mb-1">👑 Premium Pick</p>
              <p className="text-stone-600 text-sm">Vidar Design Flooring — 180 options including herringbone, Chevron, wide-plank, and exotic species. The designer&apos;s choice.</p>
            </div>
          </div>
        </section>

        {/* Section 5: Installation Methods */}
        <section id="installation-methods">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Installation Methods &amp; Costs</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            Engineered hardwood can be installed three ways. The right method depends on your subfloor and the look you want.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              ['Nail-Down', '$2.25/sqft', 'The traditional method. Nailed or stapled to a wood subfloor. Most secure bond. Required for solid hardwood; works great for engineered too.', 'Wood subfloor'],
              ['Glue-Down', '$3.25/sqft', 'Adhered directly to the subfloor with flooring adhesive. The best method for concrete subfloors and radiant heat systems. Eliminates hollow sounds.', 'Concrete or wood subfloor'],
              ['Floating (Click-Lock)', '$2.00/sqft', 'Planks click together and float over an underlayment. No nails or glue touching the subfloor. Fastest to install. Some acoustic considerations in condos.', 'Any flat, level subfloor'],
            ].map(([method, cost, desc, subfloor]) => (
              <div key={method} className="border border-stone-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-stone-800 mb-1">{method}</h3>
                <p className="text-amber-600 font-semibold text-sm mb-3">{cost} labour</p>
                <p className="text-stone-600 text-sm mb-3">{desc}</p>
                <p className="text-stone-500 text-xs"><strong>Subfloor:</strong> {subfloor}</p>
              </div>
            ))}
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 mb-4">
            <p className="font-semibold text-stone-800 mb-2">Herringbone &amp; Chevron: $4.25/sqft labour</p>
            <p className="text-stone-600 text-sm">Pattern installations require glue-down and take roughly twice as long as standard installations. The result is a stunning geometric floor that elevates any room. Vidar offers dedicated herringbone and Chevron products at BBS.</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="font-semibold text-blue-900 mb-2">🏢 GTA Condo Installer Note</p>
            <p className="text-stone-600 text-sm">
              Most GTA condos have concrete subfloors — <strong>glue-down is the recommended installation method.</strong> It eliminates hollow sound (important for noise bylaws and downstairs neighbours), bonds directly to the slab, and performs better with in-suite radiant heating. Many Toronto condo buildings require <strong>STC 50+ / IIC 50+ acoustic ratings</strong> — BBS can advise on compliant underlayment combinations for your building’s requirements.{' '}
              <Link href="/installation" className="text-amber-700 underline hover:text-amber-800">Learn more about our professional installation service →</Link>
            </p>
          </div>
        </section>

        {/* Section 6: Cost Breakdown */}
        <section id="cost-breakdown">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Total Cost Breakdown (Material + Labour)</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            What will you actually pay? Here are total installed costs based on real BBS pricing, including material and professional installation labour.
          </p>

          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="text-left p-4 font-semibold">Tier</th>
                  <th className="text-left p-4 font-semibold">Material/sqft</th>
                  <th className="text-left p-4 font-semibold">Labour/sqft</th>
                  <th className="text-left p-4 font-semibold">Total/sqft</th>
                  <th className="text-left p-4 font-semibold">500 sqft Room</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Budget', '$2.49–$3.99', '$2.25', '$4.74–$6.24', '$2,370–$3,120', 'Woden, Lee, Falcon'],
                  ['Mid-Range', '$4.19–$6.19', '$2.25–$3.25', '$6.44–$9.44', '$3,220–$4,720', 'NAF, Northernest'],
                  ['Premium', '$6.19–$9.29', '$3.25–$4.25', '$9.44–$13.54', '$4,720–$6,770', 'Vidar, Canadian Standard'],
                ].map(([tier, material, labour, total, room, brands], i) => (
                  <tr key={tier} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="p-4 font-medium text-stone-800">{tier}</td>
                    <td className="p-4 text-stone-600">{material}</td>
                    <td className="p-4 text-stone-600">{labour}</td>
                    <td className="p-4 text-stone-600 font-semibold">{total}</td>
                    <td className="p-4 text-stone-600">{room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-stone-500 text-sm">
            * Labour rates: nail-down $2.25/sqft, glue-down $3.25/sqft, herringbone $4.25/sqft. Removal of existing flooring is additional ($1.00–$3.00/sqft depending on type). Free in-home measurement included with all BBS installations.
          </p>
        </section>

        {/* Section 7: Best For */}
        <section id="best-for">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Best Engineered Hardwood For...</h2>
          <p className="text-stone-600 text-lg mb-8">Direct answers for common questions.</p>

          <div className="space-y-6">
            {[
              ['🏠 Basements', 'Click-lock engineered hardwood over a quality underlayment with vapour barrier. Avoid nail-down (no wood subfloor in basements). Budget picks: Woden from $2.49/sqft, Falcon from $3.89/sqft. For extra moisture protection, consider vinyl (LVP) — 233 waterproof options from $2.19/sqft at BBS.'],
              ['🏢 Condos', 'Glue-down installation over concrete is the standard for Toronto condos. Check your building\'s acoustic requirements — some require specific underlayments or STC/IIC ratings. Engineered hardwood is condo-friendly by design. BBS installs glue-down at $3.25/sqft.'],
              ['♨️ Radiant Heat', 'Engineered hardwood is the only real wood option for radiant heat. Thinner profiles (1/2") conduct heat better than 3/4". Avoid very wide planks (9"+) over radiant — more expansion movement. White Oak handles heat well. Solid hardwood is not recommended over radiant systems.'],
              ['🐾 Pets & Kids', 'Hickory (Janka 1820) is the hardest species — best for scratches and dents. Wire-brushed or hand-scraped finishes hide wear between maintenance. Matte finishes show less scratching than gloss. Avoid softer species like Walnut.'],
              ['💰 Best Value Overall', 'Woden Flooring European Oak from $2.49/sqft or Lee Flooring from $3.49/sqft. Both offer genuine engineered hardwood at prices that compete with luxury vinyl. At $2.49/sqft material + $2.25/sqft labour = real hardwood floors for under $5/sqft installed.'],
              ['✨ Best for Resale Value', 'White Oak in 5"–7½" wide-plank, natural or matte finish. This is what buyers expect in 2026. Vidar and Canadian Standard are the premium choices. Engineered hardwood consistently adds more resale value than laminate or vinyl.'],
            ].map(([title, desc]) => (
              <div key={title} className="bg-stone-50 border border-stone-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-stone-800 mb-2">{title}</h3>
                <p className="text-stone-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 8: When NOT to Choose */}
        <section id="when-not-to-choose">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">When NOT to Choose Engineered Hardwood</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            Engineered hardwood is excellent — but it’s not the right choice for every situation. Here’s when you should consider an alternative before you commit.
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-red-400 bg-red-50 rounded-r-xl p-5">
              <h3 className="font-semibold text-stone-800 mb-2">❌ Basements with Active Moisture or Water History</h3>
              <p className="text-stone-600 text-sm">If your basement has ever flooded, shows efflorescence (white mineral deposits on concrete), or reads above 75% relative humidity on a moisture metre — engineered hardwood is not safe. Wood of any kind will swell, buckle, and delaminate under prolonged moisture exposure. Choose a{' '}
                <Link href="/waterproof-flooring" className="text-amber-700 underline hover:text-amber-800">100% waterproof vinyl (LVP/SPC) floor</Link>{' '}
                instead. BBS stocks 233 waterproof vinyl options from $2.19/sqft.
              </p>
            </div>

            <div className="border-l-4 border-red-400 bg-red-50 rounded-r-xl p-5">
              <h3 className="font-semibold text-stone-800 mb-2">❌ High-Traffic Pet Areas (Large Dogs)</h3>
              <p className="text-stone-600 text-sm">Hickory is the hardest option (Janka 1820), but large dogs with long nails will still scratch and dull any hardwood finish over time. If your dog runs daily circuits through the kitchen or main living area, a rigid-core vinyl floor with a scratch-resistant wear layer is the more practical long-term choice. It handles claws, spills, and muddy paws without reservation. See our{' '}
                <Link href="/vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">vinyl flooring options</Link>{' '}
                for pet-friendly picks.
              </p>
            </div>

            <div className="border-l-4 border-red-400 bg-red-50 rounded-r-xl p-5">
              <h3 className="font-semibold text-stone-800 mb-2">❌ Bathrooms &amp; Laundry Rooms</h3>
              <p className="text-stone-600 text-sm">Engineered hardwood is not suitable for wet rooms. Standing water, shower steam, and persistent high humidity will damage the wood veneer and cause delamination of the core layers. Use porcelain tile, LVP, or SPC flooring in all bathrooms and laundry rooms — no exceptions.</p>
            </div>

            <div className="border-l-4 border-amber-400 bg-amber-50 rounded-r-xl p-5">
              <h3 className="font-semibold text-stone-800 mb-2">⚠️ When Your Budget Is Under $3.50/sqft (Material)</h3>
              <p className="text-stone-600 text-sm">Entry-level engineered hardwood starts at $2.49/sqft, but at that price point wear layers are thin (1–2mm) and refinishing isn’t a realistic option. If you’re on a tight budget and want a durable, long-lasting floor, a quality 12mm laminate (from $2.39/sqft at BBS) may offer better value per dollar. Explore our{' '}
                <Link href="/laminate-flooring" className="text-amber-700 underline hover:text-amber-800">laminate flooring</Link>{' '}
                options as a budget-conscious alternative.
              </p>
            </div>

            <div className="border-l-4 border-amber-400 bg-amber-50 rounded-r-xl p-5">
              <h3 className="font-semibold text-stone-800 mb-2">⚠️ Matching Existing Solid Hardwood in an Older Home</h3>
              <p className="text-stone-600 text-sm">If you’re extending existing solid hardwood floors in an older Toronto home, matching the exact species, width, and finish with engineered hardwood is difficult — and the two materials age differently. In these cases, sourcing matching solid hardwood and having the entire floor refinished together gives you a seamless, unified result.{' '}
                <Link href="/hardwood-refinishing" className="text-amber-700 underline hover:text-amber-800">BBS offers professional hardwood refinishing throughout the GTA →</Link>
              </p>
            </div>
          </div>
        </section>

        {/* Section 9: FAQ */}
        <section id="faq">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-3">
            {[
              ['Can engineered hardwood be refinished?', 'Yes. Engineered hardwood with a wear layer of 2mm or more can be refinished. A 1/2" board with a 2–3mm wear layer typically allows 1–2 refinishes. Premium 3/4" boards with 4–6mm wear layers can be refinished 2–3 times — approaching solid hardwood territory.'],
              ['Is engineered hardwood waterproof?', 'No. Engineered hardwood is more moisture-resistant than solid hardwood due to its plywood core, but it is not waterproof. Spills should be cleaned promptly. For wet areas or flood-prone basements, vinyl (LVP/SPC) flooring is the better choice — BBS carries 233 waterproof vinyl options from $2.19/sqft.'],
              ['How long does engineered hardwood last?', 'With proper care, engineered hardwood lasts 25–50 years. Premium products with thick wear layers and quality finishes can last a lifetime. Key factors: wear layer thickness, species hardness, finish quality, and maintenance habits.'],
              ['Can you install engineered hardwood over concrete?', 'Yes — this is one of its biggest advantages. Use glue-down installation ($3.25/sqft labour at BBS) or a floating click-lock system ($2.00/sqft). Always moisture-test the concrete first. Solid hardwood cannot be installed over concrete.'],
              ['What\'s the best wood species for high-traffic areas?', 'Hickory (Janka hardness 1820) is the hardest common species and most dent-resistant. White Oak (Janka 1360) is a close second and more aesthetically versatile. Avoid Walnut (Janka 1010) in hallways and kitchens.'],
              ['How much does engineered hardwood cost in Toronto?', 'At BBS Flooring, engineered hardwood materials range from $2.49–$9.29/sqft. With professional installation ($2.25–$4.25/sqft labour), total installed cost is $4.74–$13.54/sqft. A 500-square-foot room costs $2,370–$6,770 fully installed. Free in-home measurement included.'],
              ['What width is most popular in 2026?', 'Wide plank (7"–9½") dominates new installations in 2026. The trend is toward fewer seams and a more open, modern look. However, 5" remains the most versatile and best-selling width overall in Ontario.'],
              ['Should I choose engineered or solid hardwood?', 'Choose engineered if: installing over concrete, using radiant heat, in a condo, or you want wide planks at lower cost. Choose solid if: you have a wood subfloor and want maximum refinishing potential (5–7 times over the floor\'s life). BBS carries 447 engineered and 81 solid hardwood options.'],
              ['Does BBS Flooring install engineered hardwood?', 'Yes. BBS provides professional installation with WSIB-insured contractors throughout the Greater Toronto Area. Nail-down: $2.25/sqft, glue-down: $3.25/sqft, herringbone: $4.25/sqft. Same-week installation is often available. Call (647) 428-1111 or book a free in-home measurement online.'],
              ['What\'s the difference between flooring grades?', 'Grade describes appearance, not quality. Select grade: uniform, minimal knots. #1 Common/Natural: moderate character. Rustic/Character: heavy knots and variation. All grades are structurally identical. Rustic grades are often less expensive and trending in 2026 farmhouse aesthetics.'],
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

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-stone-900 to-amber-900 text-white rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Choose Your Engineered Hardwood?</h2>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
            BBS Flooring stocks 447 engineered hardwood options from 7 brands, starting at $2.49/sqft. Visit our Markham showroom, get a free quote, or book a free in-home measurement.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/engineered-hardwood-flooring" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors">
              Browse 447+ Options
            </Link>
            <Link href="/free-measurement" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg px-6 py-3 font-semibold transition-colors">
              Book Free Measurement
            </Link>
            <Link href="/installation" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg px-6 py-3 font-semibold transition-colors">
              Our Installation Service
            </Link>
            <Link href="/hardwood-refinishing" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg px-6 py-3 font-semibold transition-colors">
              Hardwood Refinishing
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
