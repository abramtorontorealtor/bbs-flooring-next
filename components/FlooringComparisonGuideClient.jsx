'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function FlooringComparisonGuideClient() {
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
            Hardwood vs Vinyl vs Laminate: Which Flooring Should You Choose?
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
            An honest, data-driven comparison using real pricing from 807+ in-stock products. Room-by-room recommendations for Ontario homeowners.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-stone-400">
            <span>✔ 807+ products compared</span>
            <span>✔ 4 flooring types</span>
            <span>✔ Real Canadian pricing</span>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-amber-50 border-b border-amber-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-stone-700 mb-4">In This Guide</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-700 text-sm font-medium list-decimal list-inside">
            <li><a href="#overview" className="hover:underline">The Three Main Flooring Types</a></li>
            <li><a href="#head-to-head" className="hover:underline">Head-to-Head Comparison Table</a></li>
            <li><a href="#engineered-hardwood" className="hover:underline">Engineered Hardwood Deep Dive</a></li>
            <li><a href="#solid-hardwood" className="hover:underline">Solid Hardwood Deep Dive</a></li>
            <li><a href="#vinyl" className="hover:underline">Vinyl (LVP/SPC) Deep Dive</a></li>
            <li><a href="#laminate" className="hover:underline">Laminate Deep Dive</a></li>
            <li><a href="#best-for-room" className="hover:underline">Best Flooring for Every Room</a></li>
            <li><a href="#cost-comparison" className="hover:underline">Full Cost Comparison</a></li>
            <li><a href="#decision-flowchart" className="hover:underline">5-Question Decision Helper</a></li>
            <li><a href="#top-picks" className="hover:underline">Our Top Pick in Each Category</a></li>
            <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
          </ol>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-20">

        {/* 1. Overview */}
        <section id="overview">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">The Three Main Flooring Types</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            For most Ontario homeowners, the decision comes down to three categories: hardwood (engineered or solid), vinyl (LVP/SPC), and laminate. Each has a fundamentally different construction, a different feel underfoot, and a very different relationship with moisture — which matters enormously in a Canadian climate where basements flood, kitchens steam, and humidity swings 40% between July and January.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ['Hardwood (Engineered + Solid)', '528 options from $2.49/sqft', 'Real wood — either a solid plank or an engineered core topped with a genuine wood veneer. Nothing replicates its warmth, character, or how it lifts a home\u2019s resale value. Engineered handles moisture better; solid is refinishable for generations.', '/engineered-hardwood-flooring'],
              ['Vinyl (LVP/SPC)', '233 options from $2.19/sqft', '100% synthetic, 100% waterproof. Luxury Vinyl Plank is built from multiple PVC layers printed with hyper-realistic wood or stone visuals. The fastest-growing category — handles moisture, pets, and heavy traffic without flinching.', '/vinyl-flooring'],
              ['Laminate', '145 options from $1.49/sqft', 'A high-density fibreboard core with a photographic wood layer sealed under a tough wear surface. Budget-friendly and scratch-resistant, but not waterproof — placement matters. Best for bedrooms, offices, and dry living spaces.', '/laminate-flooring'],
            ].map(([title, price, desc, link]) => (
              <div key={title} className="border border-stone-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-stone-800 mb-1">{title}</h3>
                <p className="text-amber-600 text-sm font-semibold mb-3">{price}</p>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">{desc}</p>
                <Link href={link} className="text-amber-700 hover:text-amber-900 text-sm font-semibold underline">Browse →</Link>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Head-to-Head */}
        <section id="head-to-head">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Head-to-Head Comparison Table</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            Every number below is real — pulled from the BBS Flooring catalogue and installation pricing. Use this as your quick-reference before diving into the individual deep dives.
          </p>
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-left p-4 font-semibold">Engineered Hardwood</th>
                  <th className="text-left p-4 font-semibold">Solid Hardwood</th>
                  <th className="text-left p-4 font-semibold">Vinyl (LVP/SPC)</th>
                  <th className="text-left p-4 font-semibold">Laminate</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Price at BBS', '$2.49–$8.99/sqft', '$5.10–$7.25/sqft', '$2.19–$3.59/sqft', '$1.49–$3.29/sqft'],
                  ['Options at BBS', '348 products', '81 products', '233 products', '145 products'],
                  ['Waterproof', '❌ Moisture-resistant', '❌ No', '✅ 100% waterproof', '⚠️ Water-resistant only'],
                  ['Durability', '25–50 years', '50–100 years', '15–25 years', '10–20 years'],
                  ['Refinishable', '✅ 1–3 times', '✅ 5–7 times', '❌ No', '❌ No'],
                  ['Over concrete', '✅ Glue-down or float', '❌ Not recommended', '✅ Float or glue-down', '✅ Float over underlayment'],
                  ['Radiant heat', '✅ Yes', '❌ Not recommended', '✅ Most products', '✅ Most products'],
                  ['Condo-friendly', '✅ With underlayment', '⚠️ Check building rules', '✅ With underlayment', '✅ With underlayment'],
                  ['Installation cost', '$2.25–$4.25/sqft', '$2.25–$3.25/sqft', '$2.00/sqft', '$2.00/sqft'],
                  ['Pet-friendly', '⚠️ Scratches on soft species', '⚠️ Scratches easily', '✅ Excellent', '✅ Good'],
                  ['Resale value', '★★★★★ Highest', '★★★★★ Highest', '★★★ Good', '★★ Modest'],
                  ['Sound underfoot', '🔊 Warm, natural', '🔊 Solid, premium', '⚠️ Can sound hollow', '⚠️ Can sound hollow'],
                  ['DIY difficulty', 'Moderate (float) / Hard (glue)', 'Hard (nail-down only)', 'Easy (click-lock)', 'Easy (click-lock)'],
                  ['Eco-friendliness', '✅ Real wood veneer', '✅ Solid natural wood', '⚠️ PVC-based', '⚠️ HDF + resin'],
                ].map(([label, eng, solid, vinyl, lam], i) => (
                  <tr key={label} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="p-4 font-medium text-stone-800">{label}</td>
                    <td className="p-4 text-stone-600">{eng}</td>
                    <td className="p-4 text-stone-600">{solid}</td>
                    <td className="p-4 text-stone-600">{vinyl}</td>
                    <td className="p-4 text-stone-600">{lam}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Engineered Hardwood */}
        <section id="engineered-hardwood">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Engineered Hardwood Deep Dive</h2>
          <div className="flex gap-3 mb-4">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">348 OPTIONS</span>
            <span className="text-stone-400 text-sm mt-0.5">$2.49–$8.99/sqft · Avg $5.02/sqft</span>
          </div>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            Engineered hardwood is the most popular flooring category at BBS — and the most popular in Canada, period. It delivers authentic wood look and feel at better dimensional stability than solid hardwood. The construction is a real hardwood veneer (2–6mm thick) bonded to a cross-ply plywood or HDF core. That layered core resists the expansion and contraction that causes solid wood to cup and gap during Ontario&apos;s extreme humidity swings.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            BBS stocks 348 engineered hardwood products from 8 brands: Northernest (71), NAF (63), Canadian Standard (48), Woden (46), Simba (45), Vidar (36), Falcon (25), and Lee (14). Species range from White Oak and Hickory to European Oak, Maple, Walnut, and Birch. Widths span 3¼" to 9½" — with wide plank (7"+) dominating 2026 sales.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            A popular entry point is the{' '}
            <Link href="/products/solen-lee-select-grade-engineered-european-oak-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Solen by Lee</Link>
            {' '}— a 6.5" SELECT grade European Oak at $3.69/sqft with genuine warmth and character. For a wider-plank statement floor, the{' '}
            <Link href="/products/arizona-naf-elegant-collection-7-1-2-oak-engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Arizona by NAF Elegant</Link>
            {' '}(7.5" Oak, $4.69/sqft) is one of our best-selling wide-plank options for open-concept main floors in 2026.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="font-semibold text-green-800 mb-2">✅ Pros</p>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>• Real wood appearance and feel</li>
                <li>• Installs over concrete, radiant heat, in condos</li>
                <li>• Refinishable 1–3 times (thick wear layers)</li>
                <li>• Highest resale value impact</li>
                <li>• More dimensionally stable than solid</li>
                <li>• Wide variety of species, widths, and finishes</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <p className="font-semibold text-red-800 mb-2">❌ Cons</p>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>• Not waterproof — spills must be cleaned quickly</li>
                <li>• Softer species scratch easily (Walnut, Birch)</li>
                <li>• Higher cost than vinyl or laminate</li>
                <li>• Glue-down installation costs more than floating</li>
                <li>• Thin wear layers limit refinishing</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="font-semibold text-stone-800 mb-1">💡 Best for</p>
            <p className="text-stone-600 text-sm">Living rooms, dining rooms, bedrooms, hallways, open-concept main floors. The go-to choice for homeowners who want real wood and plan to stay in their home long-term. <Link href="/engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Browse all 348 options →</Link></p>
          </div>
        </section>

        {/* 4. Solid Hardwood */}
        <section id="solid-hardwood">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Solid Hardwood Deep Dive</h2>
          <div className="flex gap-3 mb-4">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">81 OPTIONS</span>
            <span className="text-stone-400 text-sm mt-0.5">$5.10–$7.25/sqft · Avg $6.05/sqft</span>
          </div>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            Solid hardwood is a single piece of wood from top to bottom — typically ¾" thick. It&apos;s the original, the benchmark, and still the gold standard for homes with wood subfloors. Nothing matches its longevity: a solid hardwood floor can be sanded and refinished 5–7 times over its life, meaning it can literally last a century.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            BBS carries 81 solid hardwood options from 4 Canadian brands: Wickham (29 options, $5.50–$7.25/sqft), Appalachian (18 options, $5.99–$6.39/sqft), Northernest (18 options, $5.10–$6.50/sqft), and Sherwood Forest Products (16 options, $5.99–$6.99/sqft). Species include White Oak, Red Oak, Hard Maple, and Hickory.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            The{' '}
            <Link href="/products/fraser-4-3-4-maple-northernest-solid-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Fraser by Northernest</Link>
            {' '}(4.75" Hard Maple, $5.10/sqft) is our most accessible solid hardwood entry point — a true Canadian Maple that can be sanded and refinished for decades. At the premium end, the{' '}
            <Link href="/products/natural-wickham-solid-maple-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Natural by Wickham</Link>
            {' '}(Solid Maple, $7.25/sqft) is a heritage-grade floor built to last a century.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="font-semibold text-green-800 mb-2">✅ Pros</p>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>• Longest lifespan (50–100+ years)</li>
                <li>• Refinishable 5–7 times</li>
                <li>• Highest resale value</li>
                <li>• Solid, premium feel underfoot</li>
                <li>• ¾" thickness matches existing floors easily</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <p className="font-semibold text-red-800 mb-2">❌ Cons</p>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>• Cannot install over concrete</li>
                <li>• Not suitable for basements or radiant heat</li>
                <li>• Expands/contracts with humidity changes</li>
                <li>• Higher price point ($5.10–$7.25/sqft)</li>
                <li>• Requires nail-down on wood subfloor</li>
                <li>• Limited width options vs engineered</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="font-semibold text-stone-800 mb-1">💡 Best for</p>
            <p className="text-stone-600 text-sm">Traditional homes with wood subfloors, homeowners who want maximum refinishing potential over decades, and anyone who values the authenticity of a single-piece wood floor. <Link href="/solid-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Browse all 81 options →</Link></p>
          </div>
        </section>

        {/* 5. Vinyl */}
        <section id="vinyl">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Vinyl (LVP/SPC) Deep Dive</h2>
          <div className="flex gap-3 mb-4">
            <span className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-full">233 OPTIONS</span>
            <span className="text-stone-400 text-sm mt-0.5">$2.19–$3.59/sqft · Avg $2.75/sqft</span>
          </div>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            Vinyl flooring has undergone a revolution. Today&apos;s luxury vinyl plank (LVP) and stone polymer composite (SPC) products look remarkably like real wood, are 100% waterproof through the core, and handle the abuse of pets, kids, and heavy foot traffic without showing damage. It&apos;s the single most practical flooring type for Canadian families — and at $2.19–$3.59/sqft, it&apos;s more affordable than hardwood.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            BBS stocks 233 vinyl options from 6 brands: NAF (69 options, $2.49–$3.59/sqft), Woden (49, $2.29–$3.19/sqft), Triforest (44, $2.29–$3.19/sqft), Simba (42, $2.29–$3.59/sqft), Falcon (19, $2.19–$2.59/sqft), and Lee (10, $2.29/sqft). Wear layers range from 12mil to 28mil, with click-lock installation standard across all products.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            At the entry level, the{' '}
            <Link href="/products/cliffside-falcon-floor-products-6mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Cliffside by Falcon</Link>
            {' '}(6mm, $2.19/sqft) delivers solid 100% waterproof performance at the lowest price in our catalogue. For premium durability, the{' '}
            <Link href="/products/fulham-naf-aquaplus-platinum-9mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Fulham by NAF AquaPlus Platinum</Link>
            {' '}(9mm, $3.49/sqft) features a thicker rigid SPC core with commercial-grade construction — ideal for basements and high-traffic kitchens.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="font-semibold text-green-800 mb-2">✅ Pros</p>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>• 100% waterproof — basements, kitchens, bathrooms</li>
                <li>• Most affordable installed cost ($4.19/sqft total)</li>
                <li>• Extremely pet and kid friendly</li>
                <li>• Easy DIY click-lock installation</li>
                <li>• Comfortable and warm underfoot</li>
                <li>• No subfloor restrictions — works everywhere</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <p className="font-semibold text-red-800 mb-2">❌ Cons</p>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>• Cannot be refinished — replace when worn</li>
                <li>• Lower resale value perception than hardwood</li>
                <li>• Can sound hollow without quality underlayment</li>
                <li>• PVC-based (environmental concern for some)</li>
                <li>• Shorter lifespan (15–25 years) than hardwood</li>
              </ul>
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-xl p-5">
            <p className="font-semibold text-stone-800 mb-1">💡 Best for</p>
            <p className="text-stone-600 text-sm">Basements, kitchens, bathrooms, laundry rooms, rental properties, pet-owner homes, and anyone on a budget. The practical all-rounder. <Link href="/vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Browse all 233 options →</Link></p>
          </div>
        </section>

        {/* 6. Laminate */}
        <section id="laminate">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Laminate Deep Dive</h2>
          <div className="flex gap-3 mb-4">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">145 OPTIONS</span>
            <span className="text-stone-400 text-sm mt-0.5">$1.49–$3.29/sqft · Avg $2.53/sqft</span>
          </div>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            Laminate is the budget champion. A high-density fibreboard (HDF) core supports a high-resolution photographic layer that mimics wood grain, sealed under a transparent melamine wear layer rated on the AC scale (AC3–AC5). Modern laminate has come a long way from the shiny, plasticky floors of the 2000s — today&apos;s products feature embossed-in-register textures that feel remarkably like real wood.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            BBS carries 145 laminate options from 9 brands: NAF (32), Tosca Floors (21, from $1.49/sqft), Simba (18), Northernest (18), Triforest (16), Evergreen (16), Falcon (12), Woden (6), and Golden Choice (6). AC ratings range from AC3 (residential) to AC5 (heavy commercial). Water-resistant cores are available but laminate is NOT waterproof — standing water will damage the HDF core.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            The{' '}
            <Link href="/products/tosca-laminate-9904" className="text-amber-700 underline hover:text-amber-800">Tosca 9904</Link>
            {' '}($1.49/sqft) is our most affordable laminate and a perennial top-seller for budget renovations. For a step up with added water resistance, the{' '}
            <Link href="/products/beachy-falcon-floors-12mm-waterproof-laminate" className="text-amber-700 underline hover:text-amber-800">Beachy by Falcon Floors</Link>
            {' '}(12mm Waterproof, $2.39/sqft) delivers 72-hour waterproof protection and a satisfyingly thick 12mm profile.
          </p>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-stone-800 mb-3">AC Rating Guide</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                ['AC3', 'Residential', 'Bedrooms, low-traffic rooms'],
                ['AC4', 'Heavy Residential', 'Living rooms, hallways, kitchens'],
                ['AC5', 'Commercial', 'Offices, retail, highest traffic areas'],
              ].map(([rating, level, use]) => (
                <div key={rating} className="text-sm">
                  <p className="font-semibold text-stone-800">{rating} — {level}</p>
                  <p className="text-stone-500">{use}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="font-semibold text-green-800 mb-2">✅ Pros</p>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>• Lowest cost — from $1.49/sqft material</li>
                <li>• Highly scratch-resistant (melamine layer)</li>
                <li>• Easy DIY click-lock installation</li>
                <li>• Fades less than real wood in sunlight</li>
                <li>• Wide range of looks and textures</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <p className="font-semibold text-red-800 mb-2">❌ Cons</p>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>• NOT waterproof — moisture swells the HDF core</li>
                <li>• Cannot be refinished or repaired</li>
                <li>• Lower resale value perception</li>
                <li>• Can sound hollow without thick underlayment</li>
                <li>• Shorter lifespan (10–20 years)</li>
              </ul>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <p className="font-semibold text-stone-800 mb-1">💡 Best for</p>
            <p className="text-stone-600 text-sm">Bedrooms, home offices, dry living areas, rental properties on a tight budget, and anyone who wants the wood look at the lowest possible cost. Keep it away from water. <Link href="/laminate-flooring" className="text-amber-700 underline hover:text-amber-800">Browse all 145 options →</Link></p>
          </div>
        </section>

        {/* 7. Best for Room */}
        <section id="best-for-room">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Best Flooring for Every Room</h2>
          <p className="text-stone-600 text-lg mb-8">Most homes use 2–3 flooring types. Here&apos;s what works best in each space.</p>

          <div className="space-y-4">
            {[
              ['🏠 Living Room', 'Engineered Hardwood', 'The living room is where you see the most flooring and where resale value matters most. White Oak in 7" wide-plank with a matte finish is the 2026 standard. From $2.49/sqft at BBS.'],
              ['🍳 Kitchen', 'Vinyl (LVP/SPC) or Engineered Hardwood', 'Kitchens see water spills, dropped utensils, and heavy foot traffic. Vinyl is the safest bet — 100% waterproof from $2.19/sqft. Engineered hardwood works if you wipe spills quickly.'],
              ['🏚️ Basement', 'Vinyl (LVP/SPC)', 'Below-grade moisture makes vinyl the only worry-free choice. 233 waterproof options from $2.19/sqft. Engineered hardwood is possible in dry basements with moisture barriers. Never use solid hardwood.'],
              ['🛏️ Bedroom', 'Engineered Hardwood or Laminate', 'Low traffic and no moisture — any type works. Hardwood maximizes resale value. Laminate from $1.49/sqft is the budget pick. Both install with underlayment for sound dampening.'],
              ['🚿 Bathroom', 'Vinyl (LVP/SPC) Only', 'The only option from BBS suitable for bathrooms. 100% waterproof, comfortable on bare feet, and won\u2019t warp from shower steam. Never install hardwood or laminate in a bathroom.'],
              ['🚪 Hallway & Entryway', 'Engineered Hardwood (Hickory)', 'High-traffic zones need the hardest species. Hickory (Janka 1820) handles shoes, pets, and kids. Wire-brushed finishes hide wear. From $3.49/sqft at BBS.'],
              ['🏢 Condo', 'Engineered Hardwood (Glue-Down)', 'Most Toronto condos have concrete subfloors and acoustic requirements. Glue-down engineered hardwood eliminates hollow sounds and meets STC/IIC ratings. BBS installs glue-down at $3.25/sqft.'],
            ].map(([room, pick, desc]) => (
              <div key={room} className="bg-stone-50 border border-stone-200 rounded-xl p-6">
                <div className="flex flex-wrap items-baseline gap-3 mb-2">
                  <h3 className="text-lg font-bold text-stone-800">{room}</h3>
                  <span className="text-amber-600 text-sm font-semibold">→ {pick}</span>
                </div>
                <p className="text-stone-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Cost Comparison */}
        <section id="cost-comparison">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Full Cost Comparison (Material + Labour)</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            Real installed costs using BBS Flooring material prices and professional installation rates. No hidden fees — what you see is what you pay.
          </p>

          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="text-left p-4 font-semibold">Flooring Type</th>
                  <th className="text-left p-4 font-semibold">Tier</th>
                  <th className="text-left p-4 font-semibold">Material/sqft</th>
                  <th className="text-left p-4 font-semibold">Labour/sqft</th>
                  <th className="text-left p-4 font-semibold">Total/sqft</th>
                  <th className="text-left p-4 font-semibold">500 sqft Room</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Engineered Hardwood', 'Budget', '$2.49–$3.99', '$2.25', '$4.74–$6.24', '$2,370–$3,120'],
                  ['Engineered Hardwood', 'Mid-Range', '$4.19–$6.19', '$2.25–$3.25', '$6.44–$9.44', '$3,220–$4,720'],
                  ['Engineered Hardwood', 'Premium', '$6.19–$8.99', '$3.25–$4.25', '$9.44–$13.24', '$4,720–$6,620'],
                  ['Solid Hardwood', 'Standard', '$5.10–$6.39', '$2.25', '$7.35–$8.64', '$3,675–$4,320'],
                  ['Solid Hardwood', 'Premium', '$5.99–$7.25', '$2.25–$3.25', '$8.24–$10.50', '$4,120–$5,250'],
                  ['Vinyl (LVP/SPC)', 'Budget', '$2.19–$2.49', '$2.00', '$4.19–$4.49', '$2,095–$2,245'],
                  ['Vinyl (LVP/SPC)', 'Mid-Range', '$2.49–$3.19', '$2.00', '$4.49–$5.19', '$2,245–$2,595'],
                  ['Vinyl (LVP/SPC)', 'Premium', '$3.19–$3.59', '$2.00', '$5.19–$5.59', '$2,595–$2,795'],
                  ['Laminate', 'Budget', '$1.49–$2.39', '$2.00', '$3.49–$4.39', '$1,745–$2,195'],
                  ['Laminate', 'Mid-Range', '$2.39–$2.89', '$2.00', '$4.39–$4.89', '$2,195–$2,445'],
                  ['Laminate', 'Premium', '$2.89–$3.29', '$2.00', '$4.89–$5.29', '$2,445–$2,645'],
                ].map(([type, tier, material, labour, total, room], i) => (
                  <tr key={`${type}-${tier}`} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="p-4 font-medium text-stone-800">{type}</td>
                    <td className="p-4 text-stone-600">{tier}</td>
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
            * Labour: nail-down $2.25/sqft, glue-down $3.25/sqft, herringbone $4.25/sqft, vinyl/laminate $2.00/sqft. Old flooring removal additional ($1.00–$3.00/sqft). Free in-home measurement included with all BBS installations.{' '}
            <Link href="/installation" className="text-amber-700 underline hover:text-amber-800">See full installation services →</Link>
          </p>
        </section>

        {/* 9. Decision Flowchart */}
        <section id="decision-flowchart">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">5-Question Decision Helper</h2>
          <p className="text-stone-600 text-lg mb-8">Answer these five questions and your ideal flooring type will be obvious.</p>

          <div className="space-y-6">
            {[
              ['1. What&apos;s your budget per square foot (material only)?', [
                ['Under $2.50/sqft', '→ Laminate ($1.49–$3.29) or budget vinyl ($2.19–$2.49)'],
                ['$2.50–$5.00/sqft', '→ Vinyl ($2.19–$3.59) or budget engineered hardwood ($2.49–$4.99)'],
                ['$5.00+/sqft', '→ Premium engineered hardwood or solid hardwood'],
              ]],
              ['2. Will the floor be exposed to moisture?', [
                ['Yes (basement, kitchen, bathroom)', '→ Vinyl is the only safe choice'],
                ['Sometimes (kitchen with careful use)', '→ Vinyl or engineered hardwood'],
                ['No (bedroom, living room, office)', '→ Any type works'],
              ]],
              ['3. Are you installing yourself or hiring a pro?', [
                ['DIY', '→ Click-lock vinyl or laminate (easiest install)'],
                ['Professional', '→ Any type — BBS installs all from $2.00/sqft'],
              ]],
              ['4. Do you have pets or young children?', [
                ['Pets (especially dogs)', '→ Vinyl (waterproof + scratch-proof) or Hickory hardwood'],
                ['Young children', '→ Vinyl (soft, waterproof, forgiving) or laminate (budget option)'],
                ['Neither', '→ Any type — consider resale value and aesthetics'],
              ]],
              ['5. Is resale value a priority?', [
                ['Selling within 5 years', '→ Engineered hardwood (biggest ROI)'],
                ['Long-term home', '→ Solid hardwood (lifetime floor) or engineered'],
                ['Rental property', '→ Vinyl (durable, low-cost replacement)'],
              ]],
            ].map(([question, answers]) => (
              <div key={question} className="border border-stone-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-stone-800 mb-3" dangerouslySetInnerHTML={{ __html: question }} />
                <div className="space-y-2">
                  {answers.map(([condition, result]) => (
                    <div key={condition} className="flex gap-3 text-sm">
                      <span className="text-stone-800 font-medium shrink-0">{condition}</span>
                      <span className="text-amber-700">{result}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Picks */}
        <section id="top-picks">
          <h2 className="text-3xl font-bold text-stone-900 mb-4">Our Top Pick in Each Category</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            Can&apos;t decide where to start? These four products represent the best value, quality, and popularity in each flooring category at BBS — with real prices and direct links.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">

            {/* Vinyl top pick */}
            <div className="border border-sky-200 rounded-xl p-6 bg-sky-50">
              <span className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-full">💧 TOP VINYL PICK</span>
              <h3 className="text-lg font-bold text-stone-800 mt-3 mb-1">
                <Link href="/products/fulham-naf-aquaplus-platinum-9mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">
                  Fulham — NAF AquaPlus Platinum 9mm
                </Link>
              </h3>
              <p className="text-amber-600 font-semibold text-sm mb-3">$3.49/sqft · 100% Waterproof</p>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">9mm rigid SPC core, commercial-grade wear layer, 100% waterproof through the entire plank. The premium vinyl pick for basements, kitchens, and pet-owner homes throughout the GTA.</p>
              <Link href="/vinyl-flooring" className="text-sm text-amber-700 underline hover:text-amber-800">Browse all vinyl flooring →</Link>
            </div>

            {/* Laminate top pick */}
            <div className="border border-emerald-200 rounded-xl p-6 bg-emerald-50">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">💰 TOP LAMINATE PICK</span>
              <h3 className="text-lg font-bold text-stone-800 mt-3 mb-1">
                <Link href="/products/beachy-falcon-floors-12mm-waterproof-laminate" className="text-amber-700 underline hover:text-amber-800">
                  Beachy — Falcon Floors 12mm Waterproof
                </Link>
              </h3>
              <p className="text-amber-600 font-semibold text-sm mb-3">$2.39/sqft · 72-Hour Waterproof Protection</p>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">12mm thick with 72-hour waterproof protection. Outstanding value for bedrooms, home offices, and dry living areas — the step-up pick from our budget laminate range.</p>
              <Link href="/laminate-flooring" className="text-sm text-amber-700 underline hover:text-amber-800">Browse all laminate flooring →</Link>
            </div>

            {/* Engineered top pick */}
            <div className="border border-amber-200 rounded-xl p-6 bg-amber-50">
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">🌳 TOP ENGINEERED PICK</span>
              <h3 className="text-lg font-bold text-stone-800 mt-3 mb-1">
                <Link href="/products/arizona-naf-elegant-collection-7-1-2-oak-engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">
                  Arizona — NAF Elegant 7.5&quot; Oak
                </Link>
              </h3>
              <p className="text-amber-600 font-semibold text-sm mb-3">$4.69/sqft · Genuine Wood Veneer</p>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">Wide-plank 7.5&quot; European Oak with a real hardwood veneer. BBS&apos;s most popular engineered hardwood for open-concept main floors — the 2026 standard for Ontario homes.</p>
              <Link href="/engineered-hardwood-flooring" className="text-sm text-amber-700 underline hover:text-amber-800">Browse all engineered hardwood →</Link>
            </div>

            {/* Solid top pick */}
            <div className="border border-stone-300 rounded-xl p-6 bg-stone-50">
              <span className="bg-stone-200 text-stone-800 text-xs font-bold px-3 py-1 rounded-full">🏆 TOP SOLID PICK</span>
              <h3 className="text-lg font-bold text-stone-800 mt-3 mb-1">
                <Link href="/products/fraser-4-3-4-maple-northernest-solid-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">
                  Fraser — Northernest 4.75&quot; Maple
                </Link>
              </h3>
              <p className="text-amber-600 font-semibold text-sm mb-3">$5.10/sqft · Refinishable for 50+ Years</p>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">Our most accessible solid hardwood — Canadian Hard Maple, nail-down installation, refinishable 5–7 times. The floor that can outlast the house.</p>
              <Link href="/solid-hardwood-flooring" className="text-sm text-amber-700 underline hover:text-amber-800">Browse all solid hardwood →</Link>
            </div>

          </div>
          <div className="mt-8 bg-stone-100 border border-stone-200 rounded-xl p-5 text-center">
            <p className="text-stone-700 text-sm">
              Not sure which is right for your space?{' '}
              <Link href="/free-measurement" className="text-amber-700 underline hover:text-amber-800 font-semibold">Book a free in-home measurement</Link>
              {' '}or use our{' '}
              <Link href="/quote-calculator" className="text-amber-700 underline hover:text-amber-800 font-semibold">quote calculator</Link>
              {' '}for an instant cost estimate on any flooring type.
            </p>
          </div>
        </section>

        {/* 10. FAQ */}
        <section id="faq">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-3">
            {[
              ['What is the most durable type of flooring?', 'Solid hardwood is the most durable long-term — it can be refinished 5–7 times and last 50–100 years. For day-to-day scratch and water resistance, vinyl (LVP/SPC) is the toughest. BBS carries 81 solid hardwood options from $5.10/sqft and 233 vinyl options from $2.19/sqft.'],
              ['Is hardwood or vinyl better value for money?', 'Vinyl offers the best upfront value at $2.19–$3.59/sqft material + $2.00/sqft installation. Hardwood costs more upfront but adds more resale value and lasts longer. For a 500 sqft room: vinyl costs $2,095–$2,795 installed vs $2,370–$6,620 for engineered hardwood.'],
              ['What is the cheapest flooring option at BBS?', 'Laminate from Tosca Floors starts at $1.49/sqft. With installation at $2.00/sqft, total cost starts around $3.49/sqft — about $1,745 for a 500 sqft room. Vinyl starts at $2.19/sqft material.'],
              ['Can you mix flooring types in the same house?', 'Absolutely — most GTA homeowners do. Engineered hardwood in living areas, vinyl in basements and kitchens, laminate in bedrooms or rental units. BBS installs transition strips between different flooring types for a clean look.'],
              ['Which flooring is best for pets?', 'Vinyl (LVP/SPC) — 100% waterproof and scratch-resistant. If you prefer real wood, choose Hickory engineered hardwood (Janka 1820) with wire-brushed finish to hide scratches. Avoid laminate with pets — the surface shows scratches more easily.'],
              ['What flooring adds the most home resale value?', 'Hardwood — both engineered and solid. Real estate agents consistently rank it as the #1 flooring upgrade buyers look for. White Oak wide-plank is the most in-demand look in 2026. Vinyl is neutral. Laminate adds the least value.'],
              ['Is vinyl flooring really 100% waterproof?', 'Yes. SPC (stone polymer composite) vinyl is waterproof through the core — surface, core, and backing will not absorb water. This makes it ideal for basements, kitchens, and bathrooms. BBS stocks 233 waterproof vinyl options from $2.19/sqft.'],
              ['How long does each flooring type last?', 'Solid hardwood: 50–100 years (refinishable 5–7 times). Engineered hardwood: 25–50 years (refinishable 1–3 times). Vinyl: 15–25 years. Laminate: 10–20 years. Longevity depends on quality, foot traffic, and maintenance.'],
              ['What flooring is best for a rental property?', 'Vinyl (LVP/SPC) — waterproof, extremely durable, affordable at $2.19–$3.59/sqft, and tenants can\u2019t easily damage it. Laminate ($1.49–$3.29/sqft) is the budget alternative. Avoid expensive hardwood in rentals unless targeting premium tenants.'],
              ['Does BBS carry all four flooring types?', 'Yes. BBS stocks 807+ products: 348 engineered hardwood, 81 solid hardwood, 233 vinyl (LVP/SPC), and 145 laminate from 15 brands. Showroom: 6061 Highway 7, Unit B, Markham. Or browse online at bbsflooring.ca/products.'],
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
          <h2 className="text-3xl font-bold mb-4">Ready to Choose Your Flooring?</h2>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
            BBS Flooring stocks 807+ options across hardwood, vinyl, and laminate — starting at $1.49/sqft. Visit our Markham showroom, get a free quote, or book a free in-home measurement.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors">
              Browse All Products
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
