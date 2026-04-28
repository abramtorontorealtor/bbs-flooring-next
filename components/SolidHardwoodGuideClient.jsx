'use client';

import Link from 'next/link';

export default function SolidHardwoodGuideClient() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-300 text-sm font-semibold uppercase tracking-widest mb-4">
            BBS Flooring — Buying Guide 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            The Complete Guide to Solid Hardwood Flooring in Canada
          </h1>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto leading-relaxed">
            Species comparison, grade explained, real pricing, and everything you need to choose the right solid hardwood for your home.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-amber-200">
            <span>✔ 81 options in stock</span>
            <span>✔ 4 premium brands</span>
            <span>✔ From $5.10/sqft</span>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-amber-50 border-b border-amber-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">In This Guide</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-800 text-sm font-medium list-decimal list-inside">
            <li><a href="#what-is-solid" className="hover:underline">What Is Solid Hardwood Flooring?</a></li>
            <li><a href="#species" className="hover:underline">Wood Species Compared</a></li>
            <li><a href="#species-deep-dive" className="hover:underline">Species Deep Dive: Maple vs Oak</a></li>
            <li><a href="#grades" className="hover:underline">Grades Explained (AB, ABC, ABCD)</a></li>
            <li><a href="#solid-vs-engineered" className="hover:underline">Solid vs Engineered Hardwood</a></li>
            <li><a href="#brand-comparison" className="hover:underline">Brand &amp; Price Comparison</a></li>
            <li><a href="#cost-breakdown" className="hover:underline">Total Cost Breakdown</a></li>
            <li><a href="#installation" className="hover:underline">Installation: What to Expect</a></li>
            <li><a href="#maintenance" className="hover:underline">Care &amp; Maintenance</a></li>
            <li><a href="#refinishing-lifespan" className="hover:underline">Refinishing Lifespan</a></li>
            <li><a href="#when-not-to" className="hover:underline">When NOT to Choose Solid Hardwood</a></li>
            <li><a href="#where-to-install" className="hover:underline">Where to Install (and Where Not To)</a></li>
            <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
          </ol>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-20">

        {/* Section 1: What Is Solid Hardwood */}
        <section id="what-is-solid">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">What Is Solid Hardwood Flooring?</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Solid hardwood is exactly what it sounds like — a single piece of natural wood, milled to ¾&quot; (19mm) thickness, with a tongue-and-groove profile for tight, gap-free installation. It&apos;s the original premium flooring that has been used in Canadian homes for over a century.
          </p>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Unlike engineered hardwood (which has a thin wood veneer over plywood layers) or laminate/vinyl (which are synthetic), solid hardwood is <strong>real wood all the way through</strong>. This means it can be sanded and refinished 5–8 times over its lifetime — giving you 75–100+ years of use from a single installation.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Solid Hardwood at a Glance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-amber-600 font-bold text-lg">¾&quot;</span>
                <div>
                  <p className="font-semibold text-slate-800">Full Thickness</p>
                  <p className="text-slate-600">Every product at BBS is standard ¾&quot; (19mm) solid throughout.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-600 font-bold text-lg">5–8×</span>
                <div>
                  <p className="font-semibold text-slate-800">Refinishing Cycles</p>
                  <p className="text-slate-600">Sand and restain every 10–15 years to look brand new again.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-600 font-bold text-lg">100+</span>
                <div>
                  <p className="font-semibold text-slate-800">Year Lifespan</p>
                  <p className="text-slate-600">The longest-lasting flooring you can buy. Period.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-600 font-bold text-lg">↑ROI</span>
                <div>
                  <p className="font-semibold text-slate-800">Highest Resale Value</p>
                  <p className="text-slate-600">Real estate agents rank hardwood as the #1 flooring for home value.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Species Comparison */}
        <section id="species">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Wood Species Compared</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            BBS Flooring carries four species of solid hardwood. Each has different hardness, grain character, and colour range. Here&apos;s how they compare:
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 font-semibold text-slate-700">Species</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Janka Hardness</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Grain Character</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Best For</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Price at BBS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-semibold text-slate-800">White Oak</td>
                  <td className="p-3 text-slate-600">1,360 lbf</td>
                  <td className="p-3 text-slate-600">Strong cathedral grain, golden-brown tones. Closed pores resist moisture better than red oak.</td>
                  <td className="p-3 text-slate-600">Living rooms, dining rooms, hallways. The modern standard — works with every design style.</td>
                  <td className="p-3 text-slate-600 font-medium">$5.50–$7.25/sqft</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-semibold text-slate-800">Red Oak</td>
                  <td className="p-3 text-slate-600">1,290 lbf</td>
                  <td className="p-3 text-slate-600">Prominent grain with warm pinkish-red undertones. Open pores absorb stain deeply.</td>
                  <td className="p-3 text-slate-600">Traditional and transitional homes. Canada&apos;s classic hardwood — more affordable than white oak.</td>
                  <td className="p-3 text-slate-600 font-medium">$5.99–$6.99/sqft</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Hard Maple</td>
                  <td className="p-3 text-slate-600">1,450 lbf</td>
                  <td className="p-3 text-slate-600">Fine, uniform grain. Naturally light with creamy-white tones. Hardest domestic species.</td>
                  <td className="p-3 text-slate-600">High-traffic areas, households with kids/pets. Clean, contemporary aesthetic.</td>
                  <td className="p-3 text-slate-600 font-medium">$5.10–$6.50/sqft</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-semibold text-slate-800">Hickory</td>
                  <td className="p-3 text-slate-600">1,820 lbf</td>
                  <td className="p-3 text-slate-600">Wild, dramatic grain with extreme colour variation (cream to dark brown in the same plank).</td>
                  <td className="p-3 text-slate-600">Rustic, farmhouse, and cottage styles. The absolute toughest option for maximum durability.</td>
                  <td className="p-3 text-slate-600 font-medium">$5.50–$6.99/sqft</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-900">
            <strong>What is Janka hardness?</strong> The Janka test measures the force required to embed a steel ball into wood. Higher numbers = harder wood = better scratch and dent resistance. For reference, Douglas fir (softwood) is 660 lbf — all four species we carry are 2× harder or more.
          </div>
        </section>

        {/* Section 2b: Species Deep Dive */}
        <section id="species-deep-dive">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Species Deep Dive: Maple vs Oak vs Red Oak</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            The three most popular species at BBS — Hard Maple, White Oak, and Red Oak — account for the vast majority of solid hardwood sales in the GTA. Here&apos;s what actually separates them in day-to-day life:
          </p>

          <div className="space-y-8">

            {/* Hard Maple */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-amber-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Hard Maple</h3>
                  <span className="text-amber-700 font-semibold text-sm">Janka 1,450 lbf — Hardest domestic species</span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="font-semibold text-slate-700 mb-2">Grain Pattern</p>
                  <p className="text-slate-600">Fine, tight, and uniform — the most subtle grain of any domestic hardwood. Occasional bird&apos;s eye or curly figure in higher grades. Looks clean and contemporary.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-2">Colour Range</p>
                  <p className="text-slate-600">Naturally light — creamy white to pale beige with occasional pinkish tones in the heartwood. Accepts stain well but many homeowners prefer it natural for the bright, airy look.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-2">Ideal Rooms &amp; Styles</p>
                  <p className="text-slate-600">High-traffic hallways, family rooms, and homes with kids or pets. Pairs with Scandinavian, modern, and contemporary interiors. BBS entry point: <Link href="/products/fraser-4-3-4-maple-northernest-solid-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Fraser Northernest Maple — $5.10/sqft</Link>.</p>
                </div>
              </div>
            </div>

            {/* White Oak */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-amber-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">White Oak</h3>
                  <span className="text-amber-700 font-semibold text-sm">Janka 1,360 lbf — The 2026 designer standard</span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="font-semibold text-slate-700 mb-2">Grain Pattern</p>
                  <p className="text-slate-600">Prominent cathedral and straight grain with characteristic medullary rays — the subtle flecks that are the signature of oak. More refined than red oak; the grain feels intentional, not wild.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-2">Colour Range</p>
                  <p className="text-slate-600">Warm golden-brown with grey undertones. Closed pores give a smoother finish. Takes wire-brushed and matte finishes exceptionally well — which is why it dominates designer projects in 2026.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-2">Ideal Rooms &amp; Styles</p>
                  <p className="text-slate-600">Living rooms, open-concept main floors, dining rooms. Works with literally every design style — modern, transitional, traditional, farmhouse. The safest choice if you&apos;re unsure. Browse our <Link href="/solid-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">solid hardwood collection</Link>.</p>
                </div>
              </div>
            </div>

            {/* Red Oak */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-amber-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Red Oak</h3>
                  <span className="text-amber-700 font-semibold text-sm">Janka 1,290 lbf — Canada&apos;s classic hardwood</span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="font-semibold text-slate-700 mb-2">Grain Pattern</p>
                  <p className="text-slate-600">Bold, open grain with prominent rays and a more dramatic figure than white oak. The open pores absorb stain deeply and evenly — red oak takes colour beautifully, making it ideal for custom stain projects.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-2">Colour Range</p>
                  <p className="text-slate-600">Warm pinkish-red to medium brown tones. The pink undertones disappear significantly with darker stains. Natural red oak has a warm, rich glow that works well with traditional finishes like provincial or dark walnut stain.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-2">Ideal Rooms &amp; Styles</p>
                  <p className="text-slate-600">Traditional, colonial, and transitional homes. If you&apos;re matching existing red oak floors elsewhere in the house, this is your species. The most affordable species for staining to a custom colour. See <Link href="/products/natural-sherwood-forest-products-uptown-maple-solid-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Sherwood Uptown options from $6.99/sqft</Link>.</p>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-700">
            <p><strong>Quick decision guide:</strong> Want something light &amp; durable? → Hard Maple. Want something versatile &amp; on-trend? → White Oak. Want to match existing floors or stain to a custom colour? → Red Oak. Still unsure? <Link href="/free-measurement" className="text-amber-700 underline hover:text-amber-800">Book a free in-home consultation</Link> — we&apos;ll bring samples.</p>
          </div>
        </section>

        {/* Section 3: Grades Explained */}
        <section id="grades">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Hardwood Grades Explained</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            Hardwood &ldquo;grades&rdquo; describe the <strong>appearance</strong> of the wood — not the quality or durability. All grades come from the same tree and are equally strong. The difference is how many natural characteristics (knots, mineral streaks, colour variation) are present.
          </p>

          <div className="space-y-6 mb-8">
            <div className="border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">SELECT &amp; BETTER (AB)</span>
                <span className="text-slate-500 text-sm">Cleanest look</span>
              </div>
              <p className="text-slate-600">
                Minimal knots, consistent colour, uniform grain. The &ldquo;formal&rdquo; grade — popular in contemporary and minimalist interiors where you want the wood to have a refined, even appearance. Typically 10–15% more expensive than Select.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">SELECT (ABC)</span>
                <span className="text-slate-500 text-sm">Best balance</span>
              </div>
              <p className="text-slate-600">
                Some natural colour variation and small character marks. The middle ground — natural enough to have warmth and personality, but controlled enough to look intentional. The most versatile grade for any home style.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 border-amber-300 bg-amber-50/30">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">CHARACTER (ABCD)</span>
                <span className="text-amber-700 text-sm font-medium">Most popular in 2026</span>
              </div>
              <p className="text-slate-600">
                Full range of natural features — knots, mineral streaks, sapwood, colour variation. This is the grade trending hardest in 2026 because homeowners want floors that look <strong>real and authentic</strong>, not like a factory showroom. Character grade pairs beautifully with modern, farmhouse, Scandinavian, and transitional design.
              </p>
            </div>
          </div>

          <p className="text-slate-500 text-sm">
            Want a deeper dive? See our <Link href="/grade-guide" className="text-blue-600 hover:underline">Complete Grade Guide</Link> with visual examples.
          </p>
        </section>

        {/* Section 4: Solid vs Engineered */}
        <section id="solid-vs-engineered">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Solid vs Engineered Hardwood</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            This is the #1 question homeowners ask. Both are real wood. Both look identical when installed. The differences are structural:
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 font-semibold text-slate-700">Factor</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Solid Hardwood</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Engineered Hardwood</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium text-slate-800">Construction</td>
                  <td className="p-3 text-slate-600">Single piece of wood, ¾&quot; thick</td>
                  <td className="p-3 text-slate-600">Wood veneer (2–6mm) over plywood/HDF core</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Refinishing</td>
                  <td className="p-3 text-slate-600 font-semibold text-green-700">5–8 times</td>
                  <td className="p-3 text-slate-600">1–3 times (depends on veneer thickness)</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Lifespan</td>
                  <td className="p-3 text-slate-600 font-semibold text-green-700">75–100+ years</td>
                  <td className="p-3 text-slate-600">25–50 years</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Basement install</td>
                  <td className="p-3 text-red-600">❌ Not recommended</td>
                  <td className="p-3 text-green-700 font-semibold">✔ Yes</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Over concrete</td>
                  <td className="p-3 text-red-600">❌ No</td>
                  <td className="p-3 text-green-700 font-semibold">✔ Yes (glue-down)</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Over radiant heat</td>
                  <td className="p-3 text-red-600">❌ Not recommended</td>
                  <td className="p-3 text-green-700 font-semibold">✔ Yes (most products)</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Humidity tolerance</td>
                  <td className="p-3 text-slate-600">Requires controlled humidity (35–55% RH). Expands/contracts seasonally.</td>
                  <td className="p-3 text-slate-600">More stable. Cross-ply layers resist movement.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Resale value</td>
                  <td className="p-3 text-green-700 font-semibold">Highest of any flooring</td>
                  <td className="p-3 text-slate-600">High (perceived as equivalent by most buyers)</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Price at BBS</td>
                  <td className="p-3 text-slate-600 font-medium">$5.10–$7.25/sqft</td>
                  <td className="p-3 text-slate-600 font-medium">$2.49–$9.29/sqft</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Installation</td>
                  <td className="p-3 text-slate-600">Nail-down only (plywood subfloor)</td>
                  <td className="p-3 text-slate-600">Nail, glue, or float</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-900">
            <strong>Our recommendation:</strong> Choose solid hardwood for main floors (living room, dining room, bedrooms) on above-grade levels with plywood subfloors. Choose engineered for basements, condos with concrete subfloors, and over radiant heating systems. See our <Link href="/flooring-comparison-guide" className="text-amber-700 underline">full comparison guide</Link> for a deeper breakdown.
          </div>
        </section>

        {/* Section 5: Brand Comparison */}
        <section id="brand-comparison">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Brand &amp; Price Comparison</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            BBS Flooring carries solid hardwood from four Canadian-market brands. All are ¾&quot; thick, tongue-and-groove, and come pre-finished (no on-site sanding needed).
          </p>

          <div className="space-y-6 mb-8">
            <div className="border border-slate-200 rounded-xl p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    <Link href="/wickham-flooring" className="text-amber-700 underline hover:text-amber-800">Wickham Hardwood Flooring</Link>
                  </h3>
                  <p className="text-slate-500 text-sm">29 options · Made in Quebec</p>
                </div>
                <span className="text-amber-700 font-bold">$5.50–$7.25/sqft</span>
              </div>
              <p className="text-slate-600 text-sm mb-3">
                The premium choice. Wickham is a Quebec manufacturer with 60+ years of experience. Known for thick, durable UV-cured aluminum oxide finishes that resist scratching and wear. Available in white oak, red oak, and hard maple with multiple stain colours and all three grades (AB, ABC, ABCD). The widest selection at BBS.
              </p>
              <p className="text-sm">
                <span className="text-slate-500">Featured product: </span>
                <Link href="/products/natural-wickham-solid-maple-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Natural Wickham Solid Maple — $7.25/sqft</Link>
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Sherwood Forest Products</h3>
                  <p className="text-slate-500 text-sm">16 options · Canadian distributor</p>
                </div>
                <span className="text-amber-700 font-bold">$5.99–$6.99/sqft</span>
              </div>
              <p className="text-slate-600 text-sm mb-3">
                Red oak and white oak options with strong colour selections. Sherwood Forest offers competitive pricing in the mid-premium range with reliable pre-finished products. A solid choice for homeowners who want Canadian-sourced hardwood without the top-tier price tag.
              </p>
              <p className="text-sm">
                <span className="text-slate-500">Featured product: </span>
                <Link href="/products/natural-sherwood-forest-products-uptown-maple-solid-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Natural Sherwood Uptown Maple — $6.99/sqft</Link>
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Appalachian Flooring</h3>
                  <p className="text-slate-500 text-sm">18 options · Made in Quebec</p>
                </div>
                <span className="text-amber-700 font-bold">$5.99–$6.39/sqft</span>
              </div>
              <p className="text-slate-600 text-sm">
                Appalachian (Sunshiny International) specializes in red oak and hard maple. Known for consistent quality and tight pricing — the narrowest price range in our lineup. Excellent for buyers who want a trusted Quebec manufacturer at a predictable price point. Available in maple and red oak with 10+ stain colours.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 border-green-200 bg-green-50/30">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    <Link href="/northernest-flooring" className="text-amber-700 underline hover:text-amber-800">Northernest</Link>
                  </h3>
                  <p className="text-slate-500 text-sm">18 options · Value leader</p>
                </div>
                <span className="text-green-700 font-bold">$5.10–$6.50/sqft</span>
              </div>
              <p className="text-slate-600 text-sm mb-3">
                The most affordable entry point for solid hardwood. Northernest maple starts at just $5.10/sqft — the lowest price for genuine ¾&quot; solid hardwood in the GTA. Available in hard maple and white oak with Select (ABC) and Character (ABCD) grades. Great for large-area projects where budget matters.
              </p>
              <p className="text-sm">
                <span className="text-slate-500">Featured product: </span>
                <Link href="/products/fraser-4-3-4-maple-northernest-solid-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Fraser Northernest 4¾&quot; Maple — $5.10/sqft</Link>
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Cost Breakdown */}
        <section id="cost-breakdown">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Total Cost Breakdown</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            Real numbers from BBS Flooring in Markham. No hidden fees, no &ldquo;call for pricing&rdquo; games.
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 font-semibold text-slate-700">Cost Component</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Range</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium text-slate-800">Material (solid hardwood)</td>
                  <td className="p-3 text-slate-600">$5.10–$7.25/sqft</td>
                  <td className="p-3 text-slate-500">Depends on species, brand, and grade</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Installation (nail-down)</td>
                  <td className="p-3 text-slate-600">$3.50/sqft</td>
                  <td className="p-3 text-slate-500">Standard solid hardwood nail-down rate at BBS</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Old flooring removal</td>
                  <td className="p-3 text-slate-600">$1.00–$1.50/sqft</td>
                  <td className="p-3 text-slate-500">$1.00 carpet, $1.25 vinyl, $1.50 hardwood</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Baseboards &amp; trim</td>
                  <td className="p-3 text-slate-600">$2.50/linear ft</td>
                  <td className="p-3 text-slate-500">Remove &amp; reinstall, or new baseboards</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Stair installation</td>
                  <td className="p-3 text-slate-600">$185–$225/stair</td>
                  <td className="p-3 text-slate-500">Recap (straight $185, specialty $225) — see <Link href="/stairs" className="text-amber-700 underline hover:text-amber-800">stair services</Link></td>
                </tr>
                <tr className="bg-amber-50">
                  <td className="p-3 font-bold text-slate-900">Waste factor</td>
                  <td className="p-3 text-slate-600 font-semibold">+5–10%</td>
                  <td className="p-3 text-slate-500">Always order 5% extra (10% for diagonal layouts)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-slate-100 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Sample Project: 500 sqft Living Area</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Material (<Link href="/products/fraser-4-3-4-maple-northernest-solid-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Northernest Maple Select @ $5.10/sqft</Link> × 525 sqft)</span>
                <span className="font-semibold text-slate-800">$2,678</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Installation — nail-down ($3.50/sqft × 500 sqft)</span>
                <span className="font-semibold text-slate-800">$1,750</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Carpet removal ($1.00/sqft × 500 sqft + $75 disposal)</span>
                <span className="font-semibold text-slate-800">$575</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-3">
                <span className="text-slate-900 font-bold">Total (budget)</span>
                <span className="text-amber-700 font-bold text-lg">$5,003</span>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm border-t border-slate-300 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Material (<Link href="/products/natural-wickham-solid-maple-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Wickham White Oak Character @ $6.75/sqft</Link> × 525 sqft)</span>
                <span className="font-semibold text-slate-800">$3,544</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Installation — nail-down ($3.50/sqft × 500 sqft)</span>
                <span className="font-semibold text-slate-800">$1,750</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Carpet removal ($1.00/sqft × 500 sqft + $75 disposal)</span>
                <span className="font-semibold text-slate-800">$575</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-3">
                <span className="text-slate-900 font-bold">Total (premium)</span>
                <span className="text-amber-700 font-bold text-lg">$5,869</span>
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-sm">
            Use our <Link href="/quote-calculator" className="text-blue-600 hover:underline">Quote Calculator</Link> for an instant estimate based on your exact room size and flooring choice. Or <Link href="/free-measurement" className="text-blue-600 hover:underline">book a free in-home measurement</Link> for the most accurate quote.
          </p>
        </section>

        {/* Section 7: Installation */}
        <section id="installation">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Installation: What to Expect</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            Solid hardwood is installed by nailing (or stapling) each plank through the tongue into a plywood subfloor. This is the most secure method and has been the standard for over a century.
          </p>

          <div className="space-y-6 mb-8">
            <div className="flex gap-4 items-start">
              <div className="bg-amber-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">1</div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Subfloor Preparation</h3>
                <p className="text-slate-600 text-sm">Old flooring is removed, the subfloor is inspected for damage, flatness is checked (within 3/16&quot; over 10 ft), and any repairs are completed. Plywood or OSB subfloor required — solid hardwood cannot go over concrete.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-amber-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">2</div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Acclimation Check</h3>
                <p className="text-slate-600 text-sm">Moisture meter readings on both the wood and the subfloor. The difference must be within 2–4% depending on species. If the wood hasn&apos;t acclimated (3–7 days in your home), we wait. Rushing this step causes cupping and gaps.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-amber-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Nail-Down Installation</h3>
                <p className="text-slate-600 text-sm">Each plank is blind-nailed through the tongue using a pneumatic nailer. This locks the floor to the subfloor with zero movement. Expansion gaps are left at walls (hidden by baseboards). Planks are racked from multiple boxes to randomize grain and colour.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-amber-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">4</div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Transitions &amp; Baseboards</h3>
                <p className="text-slate-600 text-sm">T-moulds at doorways, reducers where floor height changes, and baseboards are installed. We carry coordinating trim for all products. Most projects wrap up same-day after nailing is complete.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-900">
            <strong>Including stairs?</strong> Solid hardwood on stairs is the gold standard — more durable than carpet and far more impressive than vinyl. BBS handles stair recaps from $185/stair (straight) and refinishing from $125/stair. <Link href="/stairs" className="text-amber-700 underline hover:text-amber-800">See our full stair installation service →</Link>
          </div>

          <p className="mt-4 text-slate-500 text-sm">
            Questions about the process? <Link href="/installation" className="text-blue-600 hover:underline">Read our detailed installation guide</Link> or <Link href="/free-measurement" className="text-blue-600 hover:underline">book a free in-home visit</Link> — we&apos;ll walk through the whole project with you.
          </p>
        </section>

        {/* Section 8: Care & Maintenance */}
        <section id="maintenance">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Care &amp; Maintenance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h3 className="font-semibold text-green-800 mb-3">✔ Do</h3>
              <ul className="space-y-2 text-sm text-green-900">
                <li>Sweep or vacuum weekly (hard-floor setting only)</li>
                <li>Damp-mop with Bona or equivalent hardwood cleaner</li>
                <li>Keep humidity between 35–55% year-round</li>
                <li>Use felt pads under all furniture legs</li>
                <li>Place mats at entryways to catch grit</li>
                <li>Wipe spills immediately</li>
                <li>Trim pet nails regularly</li>
                <li>Run a humidifier in Canadian winters</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-semibold text-red-800 mb-3">✘ Don&apos;t</h3>
              <ul className="space-y-2 text-sm text-red-900">
                <li>Never use a steam mop (warps wood instantly)</li>
                <li>Never use vinegar, ammonia, or all-purpose cleaners</li>
                <li>Avoid rubber-backed mats (traps moisture → discolouration)</li>
                <li>Don&apos;t let standing water sit (wipe within minutes)</li>
                <li>Don&apos;t drag furniture — lift and carry</li>
                <li>Avoid direct sunlight without UV window film</li>
                <li>Never use a beater-bar vacuum setting</li>
                <li>Don&apos;t wet-mop — damp only</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 8b: Refinishing Lifespan — NEW */}
        <section id="refinishing-lifespan">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Refinishing Lifespan: The 100-Year Floor</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            The single biggest advantage solid hardwood has over every other flooring type is its <strong>refinishing potential</strong>. Because the boards are ¾&quot; of solid wood, there&apos;s enough material to sand and re-coat the surface 5–10 times over the floor&apos;s lifetime — each time removing scratches, stains, and wear, and leaving a fresh surface that looks brand new.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">How the Math Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
              <div className="bg-white rounded-lg p-4 border border-amber-100">
                <p className="text-3xl font-bold text-amber-700 mb-1">¾&quot;</p>
                <p className="font-semibold text-slate-700">Solid Wood Thickness</p>
                <p className="text-slate-500 text-xs mt-1">~19mm of real wood above the subfloor</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-amber-100">
                <p className="text-3xl font-bold text-amber-700 mb-1">5–10×</p>
                <p className="font-semibold text-slate-700">Refinishing Cycles</p>
                <p className="text-slate-500 text-xs mt-1">Each sand removes only 1–2mm of wood</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-amber-100">
                <p className="text-3xl font-bold text-amber-700 mb-1">100+</p>
                <p className="font-semibold text-slate-700">Year Total Lifespan</p>
                <p className="text-slate-500 text-xs mt-1">If refinished every 10–15 years</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-800 mb-4">When to Refinish</h3>
          <div className="space-y-3 mb-8 text-sm text-slate-600">
            <p className="flex items-start gap-2"><span className="text-amber-600 font-bold shrink-0">→</span> Finish is worn through in high-traffic areas (hallways, entryways, under chairs) — bare wood is visible</p>
            <p className="flex items-start gap-2"><span className="text-amber-600 font-bold shrink-0">→</span> Deep scratches that can&apos;t be buffed out with a maintenance coat</p>
            <p className="flex items-start gap-2"><span className="text-amber-600 font-bold shrink-0">→</span> You want to change the stain colour entirely (e.g., going from golden oak to dark walnut)</p>
            <p className="flex items-start gap-2"><span className="text-amber-600 font-bold shrink-0">→</span> Water damage has caused surface grey staining (if caught before deep penetration)</p>
            <p className="flex items-start gap-2"><span className="text-amber-600 font-bold shrink-0">→</span> The floor has significant UV fade or uneven colouring between rooms</p>
          </div>

          <h3 className="text-lg font-semibold text-slate-800 mb-4">Screen-and-Recoat vs Full Sand</h3>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 font-semibold text-slate-700">Method</th>
                  <th className="text-left p-3 font-semibold text-slate-700">What It Fixes</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Wood Removed</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Can Change Colour?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium text-slate-800">Screen &amp; Recoat</td>
                  <td className="p-3 text-slate-600">Light surface scratches, dull finish, minor wear</td>
                  <td className="p-3 text-slate-600">Minimal (finish layer only)</td>
                  <td className="p-3 text-red-600">No</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Full Sand &amp; Refinish</td>
                  <td className="p-3 text-slate-600">Deep scratches, stains, worn-through finish, colour change</td>
                  <td className="p-3 text-slate-600">1–2mm of wood surface</td>
                  <td className="p-3 text-green-600 font-semibold">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-700">
            <p>BBS provides professional hardwood refinishing in the Markham and GTA area. <Link href="/hardwood-refinishing" className="text-amber-700 underline hover:text-amber-800">See our hardwood refinishing service →</Link> — pricing, process, and before/after examples.</p>
          </div>
        </section>

        {/* Section 8c: When NOT to Choose Solid Hardwood — NEW */}
        <section id="when-not-to">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">When NOT to Choose Solid Hardwood</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Solid hardwood is the best flooring in the world — for the right application. There are four situations where it&apos;s the <em>wrong</em> choice, and using it anyway will cost you:
          </p>

          <div className="space-y-5 mb-8">

            <div className="flex gap-4 items-start border border-red-200 bg-red-50/30 rounded-xl p-5">
              <span className="text-red-600 text-2xl shrink-0">🚫</span>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Below-Grade Installations (Basements)</h3>
                <p className="text-slate-600 text-sm">
                  Below-grade means the floor is at or below ground level. Concrete slabs below grade are constantly releasing moisture vapour upward — even if the basement feels dry. Solid hardwood is sensitive to moisture and will cup, buckle, or warp within months. <strong>Use engineered hardwood or luxury vinyl instead.</strong> BBS carries <Link href="/engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">engineered hardwood from $3.69/sqft</Link> that&apos;s specifically rated for below-grade installs.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start border border-red-200 bg-red-50/30 rounded-xl p-5">
              <span className="text-red-600 text-2xl shrink-0">🚫</span>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Concrete Subfloors (Any Level)</h3>
                <p className="text-slate-600 text-sm">
                  Solid hardwood must be nailed or stapled into a plywood or OSB subfloor. You cannot nail into concrete. Even with a plywood sleeper system, moisture migration from concrete creates too much risk for solid wood. <strong>Engineered hardwood can be glued directly to concrete</strong> — a much safer and more reliable installation. Our <Link href="/engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">engineered hardwood collection</Link> includes glue-down options from $3.89/sqft.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start border border-red-200 bg-red-50/30 rounded-xl p-5">
              <span className="text-red-600 text-2xl shrink-0">🚫</span>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">High-Moisture Areas (Bathrooms, Laundry Rooms)</h3>
                <p className="text-slate-600 text-sm">
                  Bathrooms have standing water, high humidity spikes, and condensation risks that solid hardwood cannot handle. Solid hardwood requires controlled humidity (35–55% RH) to remain stable — bathroom conditions routinely exceed this range. <strong>Waterproof luxury vinyl or porcelain tile is the correct choice</strong> for bathrooms and laundry rooms. No hardwood — solid or engineered — belongs in a bathroom.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start border border-red-200 bg-red-50/30 rounded-xl p-5">
              <span className="text-red-600 text-2xl shrink-0">🚫</span>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Over Radiant Heat (In-Floor Heating Systems)</h3>
                <p className="text-slate-600 text-sm">
                  Radiant heat systems cycle between hot and cool, causing wood to expand and contract repeatedly — at a rate solid hardwood cannot handle without gapping and cracking. The consistent directional heat also dries out the wood faster than ambient humidity control can compensate. <strong>Engineered hardwood is specifically engineered for radiant heat applications</strong> because its cross-ply construction resists seasonal movement. Check the manufacturer spec sheet before installing any hardwood over radiant heat.
                </p>
              </div>
            </div>

          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-900">
            <strong>Not sure if your situation qualifies?</strong> The safest call is to have us assess your subfloor and installation conditions before you purchase. <Link href="/free-measurement" className="text-amber-700 underline hover:text-amber-800">Book a free in-home measurement</Link> — we&apos;ll tell you exactly which flooring type is right for your home.
          </div>
        </section>

        {/* Section 9: Where to Install */}
        <section id="where-to-install">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Where to Install (and Where Not To)</h2>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 font-semibold text-slate-700">Room</th>
                  <th className="text-center p-3 font-semibold text-slate-700">Solid Hardwood?</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Why / Alternative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium text-slate-800">Living Room</td>
                  <td className="p-3 text-center text-green-600 font-bold">✔ Ideal</td>
                  <td className="p-3 text-slate-600">The showcase room. Solid hardwood maximizes resale and visual impact. Browse <Link href="/solid-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">all solid hardwood options →</Link></td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Bedrooms</td>
                  <td className="p-3 text-center text-green-600 font-bold">✔ Excellent</td>
                  <td className="p-3 text-slate-600">Low traffic, warm feel. Maple and oak both work beautifully.</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Hallways</td>
                  <td className="p-3 text-center text-green-600 font-bold">✔ Great</td>
                  <td className="p-3 text-slate-600">High traffic — choose hickory or hard maple for extra hardness.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Kitchen</td>
                  <td className="p-3 text-center text-yellow-600 font-bold">⚠ Possible</td>
                  <td className="p-3 text-slate-600">Works if you clean spills fast. Many GTA homes have hardwood kitchens. Solid hardwood is sensitive to moisture — if worried about water, consider vinyl.</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Dining Room</td>
                  <td className="p-3 text-center text-green-600 font-bold">✔ Ideal</td>
                  <td className="p-3 text-slate-600">Use chair leg pads. Solid hardwood makes dining rooms feel elegant.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Basement</td>
                  <td className="p-3 text-center text-red-600 font-bold">✘ No</td>
                  <td className="p-3 text-slate-600">Below-grade moisture will damage solid wood. Use <Link href="/vinyl-flooring-guide" className="text-blue-600 hover:underline">vinyl</Link> or <Link href="/engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">engineered hardwood</Link>.</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Bathroom</td>
                  <td className="p-3 text-center text-red-600 font-bold">✘ No</td>
                  <td className="p-3 text-slate-600">Too much standing water risk. Solid hardwood requires controlled humidity (35–55% RH) — bathrooms exceed this regularly. Use waterproof vinyl instead.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Stairs</td>
                  <td className="p-3 text-center text-green-600 font-bold">✔ Excellent</td>
                  <td className="p-3 text-slate-600">Hardwood stairs are the gold standard. More durable than carpet, more impressive than vinyl. <Link href="/stairs" className="text-amber-700 underline hover:text-amber-800">See our stair renovation service →</Link></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: 'How much does solid hardwood flooring cost in Toronto?', a: 'At BBS Flooring in Markham, solid hardwood ranges from $5.10–$7.25/sqft for material. Installation adds $3.50/sqft (nail-down). For a typical 500 sqft project, total installed cost is approximately $4,300–$5,875 before flooring removal.' },
              { q: 'What is the difference between solid and engineered hardwood?', a: 'Solid hardwood is a single piece of wood (¾" thick) that can be refinished 5–10 times. Engineered has a wood veneer over plywood — more stable but refinishable only 1–3 times. Solid is the premium choice for main floors; engineered is better for basements and over concrete.' },
              { q: 'How long does solid hardwood flooring last?', a: 'Solid hardwood lasts 75–100+ years with proper maintenance. The ¾" thickness allows 5–10 refinishing cycles over the floor\'s lifetime. Many century-old Toronto homes still have original solid hardwood floors.' },
              { q: 'Can solid hardwood be installed in a basement?', a: 'No. Solid hardwood should never go below grade — moisture from concrete causes cupping, buckling, and warping. Solid hardwood requires controlled humidity (35–55% RH) that below-grade environments cannot provide. Use engineered hardwood (from $3.69/sqft) or vinyl for basements.' },
              { q: 'What is the best wood species for floors?', a: 'White oak (Janka 1360) is the 2026 designer standard — hard, beautiful, versatile. Hard maple (1450) is the toughest domestic species. Red oak is the classic budget choice. Hickory (1820) is for maximum durability.' },
              { q: 'What do hardwood grades mean?', a: 'Grades describe appearance, not quality. Select & Better (AB) = minimal knots, uniform. Select (ABC) = some character marks. Character (ABCD) = full natural variation — the most popular grade in 2026.' },
              { q: 'How do I maintain solid hardwood floors?', a: 'Sweep weekly, damp-mop monthly with hardwood cleaner, keep humidity at 35–55%, use felt pads under furniture. Never steam mop, never use vinegar or all-purpose cleaners, avoid rubber-backed mats.' },
              { q: 'How often does solid hardwood need to be refinished?', a: 'Typically every 10–15 years for heavily used floors, or every 20–25 years for bedrooms and low-traffic areas. A screen-and-recoat (lighter process) can be done every 5–7 years to maintain the finish before a full sand is needed. Solid hardwood\'s ¾" thickness allows 5–10 full refinishing cycles.' },
              { q: 'Does solid hardwood increase home value?', a: 'Yes. Real estate professionals consistently rank hardwood as the #1 flooring for resale value. Solid hardwood commands a premium over engineered, vinyl, and laminate in the GTA market.' },
              { q: 'How long does installation take?', a: 'A standard 500 sqft room takes 2–3 days including subfloor prep. Acclimation (3–7 days before install) is separate. Larger projects scale proportionally. BBS handles everything in one visit — removal, prep, install, baseboards.' },
              { q: 'What brands of solid hardwood do you carry?', a: 'Wickham (29 options, $5.50–$7.25), Appalachian (18, $5.99–$6.39), Northernest (18, $5.10–$6.50), and Sherwood Forest (16, $5.99–$6.99). All are ¾" thick, pre-finished, tongue-and-groove. Visit our Markham showroom.' },
            ].map((faq, i) => (
              <details key={i} className="group border border-slate-200 rounded-xl">
                <summary className="p-5 cursor-pointer font-semibold text-slate-800 group-open:border-b group-open:border-slate-200 list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="p-5 text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-amber-800 to-amber-900 text-white rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to See Solid Hardwood in Person?</h2>
          <p className="text-amber-200 mb-6 max-w-xl mx-auto">
            Samples look different on a screen. Visit our Markham showroom to feel the grain, compare grades, and get a free, no-obligation quote for your project.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/solid-hardwood-flooring" className="bg-white text-amber-900 px-6 py-3 rounded-lg font-semibold hover:bg-amber-50 transition">
              Browse 81 Options →
            </Link>
            <Link href="/free-measurement" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              Free In-Home Measurement
            </Link>
            <a href="tel:6474281111" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              Call (647) 428-1111
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}
