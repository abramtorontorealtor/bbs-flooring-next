'use client';

import Link from 'next/link';

export default function LaminateFlooringGuideClient() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">
            BBS Flooring — Buying Guide 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            The Complete Guide to Laminate Flooring in Canada
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            AC ratings decoded, thickness compared, waterproof options explained, and real Canadian pricing — everything you need to choose the right laminate for your home.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-slate-400">
            <span>✔ 145 options in stock</span>
            <span>✔ 9 brands compared</span>
            <span>✔ From $1.49/sqft</span>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-emerald-50 border-b border-emerald-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">In This Guide</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-800 text-sm font-medium list-decimal list-inside">
            <li><a href="#what-is-laminate" className="hover:underline">What Is Laminate Flooring?</a></li>
            <li><a href="#ac-ratings" className="hover:underline">AC Ratings Explained</a></li>
            <li><a href="#thickness" className="hover:underline">Thickness: 12mm vs 14mm</a></li>
            <li><a href="#waterproof" className="hover:underline">Is Waterproof Laminate Real?</a></li>
            <li><a href="#brand-comparison" className="hover:underline">Brand &amp; Price Comparison</a></li>
            <li><a href="#cost-breakdown" className="hover:underline">Total Cost Breakdown</a></li>
            <li><a href="#laminate-vs-others" className="hover:underline">Laminate vs Vinyl vs Hardwood</a></li>
            <li><a href="#installation" className="hover:underline">Installation: What to Expect</a></li>
            <li><a href="#best-rooms" className="hover:underline">Best Rooms for Laminate</a></li>
            <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
          </ol>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-20">

        {/* Section 1: What Is Laminate */}
        <section id="what-is-laminate">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">What Is Laminate Flooring?</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Laminate is a multi-layer flooring product that mimics the look of hardwood (or stone) using a high-resolution photographic print layer protected by a tough wear coating. Modern laminate has come a long way — with embossed-in-register (EIR) textures and realistic grain, quality laminate is almost indistinguishable from real wood.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Anatomy of a Laminate Plank</h3>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-4 h-4 rounded-full bg-emerald-600 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Wear Layer (Top)</p>
                  <p className="text-slate-600 text-sm">Clear, extremely hard aluminum oxide coating. This is what gives laminate its scratch, stain, and fade resistance. Rated by AC class (AC1–AC5). The wear layer is why laminate resists scratches better than real hardwood.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-4 h-4 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Decorative Layer</p>
                  <p className="text-slate-600 text-sm">High-definition photographic print of real wood grain. Premium products use EIR (Embossed-In-Register) technology — the surface texture aligns with the printed grain so you see AND feel the wood pattern.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-4 h-4 rounded-full bg-emerald-300 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">HDF Core</p>
                  <p className="text-slate-600 text-sm">High-density fiberboard — the structural backbone. At 12mm+ thickness, it provides stability, sound dampening, and feel. Higher density = better dent resistance and locking mechanism strength.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-4 h-4 rounded-full bg-emerald-200 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Backing Layer</p>
                  <p className="text-slate-600 text-sm">Moisture barrier that stabilizes the plank and prevents warping. Premium products (like our NAF 14mm line) include pre-attached IXPE underpad for additional sound absorption and thermal insulation.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: AC Ratings */}
        <section id="ac-ratings">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">AC Ratings Explained</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            The AC (Abrasion Class) rating is the international standard for laminate durability. It measures resistance to abrasion, impact, staining, burns, and edge swelling. Here&apos;s what each rating actually means:
          </p>

          <div className="space-y-4 mb-8">
            <div className="border border-slate-200 rounded-xl p-5 opacity-50">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">AC1–AC2</span>
                <span className="text-slate-400 text-sm">Not carried at BBS</span>
              </div>
              <p className="text-slate-500 text-sm">Light residential — bedroom-only use. Too thin and soft for Canadian homes. We don&apos;t stock these.</p>
            </div>

            <div className="border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">AC3</span>
                <span className="text-slate-500 text-sm">General residential</span>
              </div>
              <p className="text-slate-600 text-sm">Handles normal household traffic in all rooms. Suitable for bedrooms, offices, and guest areas. Entry-level for quality laminate. Typical warranty: 15–20 years.</p>
            </div>

            <div className="border border-emerald-200 rounded-xl p-5 bg-emerald-50/30">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">AC4</span>
                <span className="text-emerald-700 text-sm font-medium">Recommended for most homes</span>
              </div>
              <p className="text-slate-600 text-sm">Heavy residential + light commercial. Resists scratches from pets, kids, furniture movement, and heavy foot traffic. Works in every room of a busy household. This is what we recommend for most GTA homeowners. Typical warranty: 20–25 years.</p>
            </div>

            <div className="border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-slate-700 text-white text-xs font-bold px-3 py-1 rounded-full">AC5</span>
                <span className="text-slate-500 text-sm">Commercial grade</span>
              </div>
              <p className="text-slate-600 text-sm">Heavy commercial traffic — retail stores, offices, restaurants. Overkill for most homes, but ideal for rentals and home businesses where maximum durability justifies the premium. Typical warranty: 25–30 years.</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-900">
            <strong>Pro tip:</strong> AC rating matters more than thickness for scratch resistance. A 12mm AC4 laminate will outperform a 14mm AC3 in a busy hallway. Always check the AC rating first, thickness second.
          </div>
        </section>

        {/* Section 3: Thickness */}
        <section id="thickness">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Thickness: Why It Matters</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            At BBS Flooring, we carry only 12mm+ laminate. Here&apos;s why thickness matters and what each option offers:
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 font-semibold text-slate-700">Thickness</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Sound</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Feel</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Brands at BBS</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Price Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-semibold text-slate-800">12mm</td>
                  <td className="p-3 text-slate-600">Good — requires separate underlay for best results</td>
                  <td className="p-3 text-slate-600">Solid underfoot, hides minor subfloor imperfections</td>
                  <td className="p-3 text-slate-600">Tosca, Simba, Northernest, Triforest, Evergreen, Falcon, Woden, Golden Choice</td>
                  <td className="p-3 text-slate-600 font-medium">$1.49–$3.29/sqft</td>
                </tr>
                <tr className="bg-emerald-50">
                  <td className="p-3 font-semibold text-emerald-800">14mm (12+2mm IXPE)</td>
                  <td className="p-3 text-slate-600">Excellent — pre-attached IXPE underpad absorbs impact sound</td>
                  <td className="p-3 text-slate-600">Premium feel, warm, quiet. No separate underlay needed.</td>
                  <td className="p-3 text-slate-600 font-medium">NAF Flooring</td>
                  <td className="p-3 text-emerald-700 font-medium">$2.39–$3.09/sqft</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-sm text-emerald-900">
            <strong>Why we don&apos;t carry 8mm laminate:</strong> Thin laminate sounds hollow when walked on, telegraphs subfloor imperfections, and has weaker click-lock joints that gap over time. The $0.50–$1.00/sqft savings isn&apos;t worth the compromised feel and shorter lifespan. Quality starts at 12mm.
          </div>
        </section>

        {/* Section 4: Waterproof Options */}
        <section id="waterproof">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Is &ldquo;Waterproof Laminate&rdquo; Real?</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Yes and no. Modern laminate with sealed edges and wax-treated cores can handle <strong>surface spills for 24–72 hours</strong> without damage — a massive improvement over older laminate that swelled at the first drop of water. However, no laminate is truly waterproof like vinyl (SPC/WPC), which is solid plastic through its entire core.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h3 className="font-semibold text-green-800 mb-3">Waterproof Laminate Works For:</h3>
              <ul className="space-y-2 text-sm text-green-900">
                <li>✔ Kitchens (wipe spills within a few hours)</li>
                <li>✔ Living rooms, dining rooms, bedrooms</li>
                <li>✔ Hallways and entryways</li>
                <li>✔ Dry basements with moisture barrier</li>
                <li>✔ Home offices and dens</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-semibold text-red-800 mb-3">Use Vinyl Instead For:</h3>
              <ul className="space-y-2 text-sm text-red-900">
                <li>✘ Bathrooms (standing water, shower splashes)</li>
                <li>✘ Laundry rooms (washing machine leaks)</li>
                <li>✘ Wet basements or flood-prone areas</li>
                <li>✘ Pet washing stations</li>
                <li>✘ Mudrooms with heavy snow/water tracking</li>
              </ul>
            </div>
          </div>

          <p className="text-slate-500 text-sm">
            Need true waterproof performance? See our <Link href="/vinyl-flooring-guide" className="text-blue-600 hover:underline">Vinyl Flooring Guide</Link> — 233 options from $2.19/sqft, 100% waterproof.
          </p>
        </section>

        {/* Section 5: Brand Comparison */}
        <section id="brand-comparison">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Brand &amp; Price Comparison</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            BBS Flooring carries 145 laminate products from 9 brands. Here&apos;s how they compare:
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 font-semibold text-slate-700">Brand</th>
                  <th className="text-center p-3 font-semibold text-slate-700">Options</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Thickness</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Price Range</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Best For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-emerald-50">
                  <td className="p-3 font-semibold text-emerald-800">NAF Flooring</td>
                  <td className="p-3 text-center">32</td>
                  <td className="p-3 text-slate-600">14mm (12+2mm IXPE)</td>
                  <td className="p-3 text-slate-600 font-medium">$2.39–$3.09/sqft</td>
                  <td className="p-3 text-slate-600">Premium feel, no separate underlay needed</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Evergreen</td>
                  <td className="p-3 text-center">16</td>
                  <td className="p-3 text-slate-600">12mm waterproof</td>
                  <td className="p-3 text-slate-600 font-medium">$2.99–$3.29/sqft</td>
                  <td className="p-3 text-slate-600">Best waterproof performance in laminate</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-semibold text-slate-800">Northernest</td>
                  <td className="p-3 text-center">18</td>
                  <td className="p-3 text-slate-600">12mm</td>
                  <td className="p-3 text-slate-600 font-medium">$2.69–$2.89/sqft</td>
                  <td className="p-3 text-slate-600">Reliable mid-range, good colour selection</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Simba</td>
                  <td className="p-3 text-center">18</td>
                  <td className="p-3 text-slate-600">12mm</td>
                  <td className="p-3 text-slate-600 font-medium">$2.69–$2.89/sqft</td>
                  <td className="p-3 text-slate-600">Consistent quality, popular finishes</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-semibold text-slate-800">Triforest</td>
                  <td className="p-3 text-center">16</td>
                  <td className="p-3 text-slate-600">12mm</td>
                  <td className="p-3 text-slate-600 font-medium">$1.79–$2.79/sqft</td>
                  <td className="p-3 text-slate-600">Wide price range, budget-to-mid options</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Falcon</td>
                  <td className="p-3 text-center">12</td>
                  <td className="p-3 text-slate-600">12mm</td>
                  <td className="p-3 text-slate-600 font-medium">$2.39–$2.45/sqft</td>
                  <td className="p-3 text-slate-600">Tight pricing, straightforward selection</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-semibold text-slate-800">Woden</td>
                  <td className="p-3 text-center">6</td>
                  <td className="p-3 text-slate-600">12mm</td>
                  <td className="p-3 text-slate-600 font-medium">$2.59/sqft</td>
                  <td className="p-3 text-slate-600">Curated selection, single price point</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="p-3 font-semibold text-green-800">Tosca Floors</td>
                  <td className="p-3 text-center">21</td>
                  <td className="p-3 text-slate-600">12mm</td>
                  <td className="p-3 text-green-700 font-medium">From $1.49/sqft</td>
                  <td className="p-3 text-slate-600">Lowest price — best for rentals, flips, large areas</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-semibold text-slate-800">Golden Choice</td>
                  <td className="p-3 text-center">6</td>
                  <td className="p-3 text-slate-600">12mm</td>
                  <td className="p-3 text-slate-600 font-medium">$2.99/sqft</td>
                  <td className="p-3 text-slate-600">Niche selection</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 6: Cost Breakdown */}
        <section id="cost-breakdown">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Total Cost Breakdown</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            Laminate is the most budget-friendly hard-surface flooring. Here&apos;s the full cost picture:
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
                  <td className="p-3 font-medium text-slate-800">Material (laminate)</td>
                  <td className="p-3 text-slate-600">$1.49–$3.29/sqft</td>
                  <td className="p-3 text-slate-500">Depends on brand, thickness, and features</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Installation (floating click-lock)</td>
                  <td className="p-3 text-slate-600">$2.00/sqft</td>
                  <td className="p-3 text-slate-500">All-inclusive labour rate</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Underlay (if not pre-attached)</td>
                  <td className="p-3 text-slate-600">$0.30–$0.60/sqft</td>
                  <td className="p-3 text-slate-500">Not needed for NAF 14mm (IXPE pre-attached)</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Old flooring removal</td>
                  <td className="p-3 text-slate-600">$1.00–$1.50/sqft</td>
                  <td className="p-3 text-slate-500">$1.00 carpet, $1.25 vinyl/laminate</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Baseboards &amp; trim</td>
                  <td className="p-3 text-slate-600">$2.50/linear ft</td>
                  <td className="p-3 text-slate-500">Remove &amp; reinstall, or new baseboards</td>
                </tr>
                <tr className="bg-emerald-50">
                  <td className="p-3 font-bold text-slate-900">Waste factor</td>
                  <td className="p-3 text-slate-600 font-semibold">+5–10%</td>
                  <td className="p-3 text-slate-500">5% standard, 10% for diagonal or complex layouts</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-slate-100 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Sample Project: 500 sqft Living Area</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Material (Tosca 12mm @ $1.49/sqft × 525 sqft)</span>
                <span className="font-semibold text-slate-800">$782</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Underlay ($0.40/sqft × 500 sqft)</span>
                <span className="font-semibold text-slate-800">$200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Installation ($2.00/sqft × 500 sqft)</span>
                <span className="font-semibold text-slate-800">$1,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Carpet removal ($1.00/sqft × 500 sqft + $75 disposal)</span>
                <span className="font-semibold text-slate-800">$575</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-3">
                <span className="text-slate-900 font-bold">Total (budget)</span>
                <span className="text-emerald-700 font-bold text-lg">$2,557</span>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm border-t border-slate-300 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Material (NAF 14mm Premium @ $2.79/sqft × 525 sqft)</span>
                <span className="font-semibold text-slate-800">$1,465</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Underlay — pre-attached (no cost)</span>
                <span className="font-semibold text-slate-800">$0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Installation ($2.00/sqft × 500 sqft)</span>
                <span className="font-semibold text-slate-800">$1,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Carpet removal ($1.00/sqft × 500 sqft + $75 disposal)</span>
                <span className="font-semibold text-slate-800">$575</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-3">
                <span className="text-slate-900 font-bold">Total (premium)</span>
                <span className="text-emerald-700 font-bold text-lg">$3,040</span>
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-sm">
            Get an instant estimate with our <Link href="/quote-calculator" className="text-blue-600 hover:underline">Quote Calculator</Link>, or <Link href="/free-measurement" className="text-blue-600 hover:underline">book a free in-home measurement</Link> for precise project pricing.
          </p>
        </section>

        {/* Section 7: Laminate vs Others */}
        <section id="laminate-vs-others">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Laminate vs Vinyl vs Hardwood</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            Choosing between laminate, vinyl, and hardwood? Here&apos;s the honest comparison:
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 font-semibold text-slate-700">Factor</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Laminate</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Vinyl (LVP)</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Solid Hardwood</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium text-slate-800">Price at BBS</td>
                  <td className="p-3 text-emerald-700 font-semibold">$1.49–$3.29/sqft</td>
                  <td className="p-3 text-slate-600">$2.19–$3.59/sqft</td>
                  <td className="p-3 text-slate-600">$5.10–$7.25/sqft</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Waterproof</td>
                  <td className="p-3 text-yellow-600">⚠ Water-resistant</td>
                  <td className="p-3 text-green-600 font-semibold">✔ 100% waterproof</td>
                  <td className="p-3 text-red-600">✘ No</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Scratch resistance</td>
                  <td className="p-3 text-green-600 font-semibold">✔ Excellent (AC4+)</td>
                  <td className="p-3 text-slate-600">Good (depends on mil)</td>
                  <td className="p-3 text-slate-600">Moderate (can be refinished)</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Refinishable</td>
                  <td className="p-3 text-red-600">✘ No</td>
                  <td className="p-3 text-red-600">✘ No</td>
                  <td className="p-3 text-green-600 font-semibold">✔ 5–8 times</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Lifespan</td>
                  <td className="p-3 text-slate-600">15–25 years</td>
                  <td className="p-3 text-slate-600">20–30 years</td>
                  <td className="p-3 text-green-600 font-semibold">75–100+ years</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Basement</td>
                  <td className="p-3 text-yellow-600">⚠ Dry basements only</td>
                  <td className="p-3 text-green-600 font-semibold">✔ Any basement</td>
                  <td className="p-3 text-red-600">✘ No</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Feel underfoot</td>
                  <td className="p-3 text-slate-600">Firm, slightly hollow (12mm helps)</td>
                  <td className="p-3 text-slate-600">Warm, cushioned (IXPE pad)</td>
                  <td className="p-3 text-green-600 font-semibold">Solid, natural warmth</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Resale value</td>
                  <td className="p-3 text-slate-600">Neutral</td>
                  <td className="p-3 text-slate-600">Neutral to positive</td>
                  <td className="p-3 text-green-600 font-semibold">Highest</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Installation</td>
                  <td className="p-3 text-slate-600">$2.00/sqft (floating)</td>
                  <td className="p-3 text-slate-600">$2.00/sqft (floating)</td>
                  <td className="p-3 text-slate-600">$2.25–$3.25/sqft (nail/glue)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-sm text-emerald-900">
            <strong>Our recommendation:</strong> Choose laminate for budget-conscious projects on main floors where waterproofing isn&apos;t critical. Choose vinyl for basements, kitchens, and wet-prone areas. Choose solid hardwood for maximum longevity and resale value. See our full <Link href="/flooring-comparison-guide" className="text-emerald-700 underline">comparison guide</Link>.
          </div>
        </section>

        {/* Section 8: Installation */}
        <section id="installation">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Installation: What to Expect</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            Laminate uses a floating click-lock installation — one of the fastest and cleanest flooring methods. No nails, no glue, no mess.
          </p>

          <div className="space-y-6 mb-8">
            <div className="flex gap-4 items-start">
              <div className="bg-emerald-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">1</div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Old Flooring Removal &amp; Subfloor Prep</h3>
                <p className="text-slate-600 text-sm">Existing carpet, vinyl, or old laminate is removed and disposed of. The subfloor is checked for flatness (within 3/16&quot; over 10 ft) and cleaned. Any high spots are sanded, low spots levelled.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-emerald-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">2</div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Underlay Installation</h3>
                <p className="text-slate-600 text-sm">Foam or cork underlay is rolled out with taped seams. Over concrete, a 6-mil poly moisture barrier goes down first. Products with pre-attached underpad (like NAF 14mm) skip this step entirely.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-emerald-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Click-Lock Installation</h3>
                <p className="text-slate-600 text-sm">Planks click together at an angle — no nails, no glue. The floor &ldquo;floats&rdquo; over the subfloor with expansion gaps at all walls (hidden by baseboards). Installation is fast: an experienced crew does 200–300 sqft per hour.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-emerald-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">4</div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Transitions &amp; Baseboards</h3>
                <p className="text-slate-600 text-sm">T-moulds at doorways, reducers at height changes, and baseboards are installed. The floor is immediately walkable — no drying time, no curing period. Move your furniture back the same day.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-900">
            <strong>DIY-friendly?</strong> Laminate is the most DIY-friendly flooring type. However, professional installation avoids common mistakes (wrong expansion gaps, poor staggering, underlay issues) and comes with warranty protection. At $2.00/sqft, the peace of mind is worth it.
          </div>
        </section>

        {/* Section 9: Best Rooms */}
        <section id="best-rooms">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Best Rooms for Laminate</h2>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 font-semibold text-slate-700">Room</th>
                  <th className="text-center p-3 font-semibold text-slate-700">Laminate?</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium text-slate-800">Living Room</td>
                  <td className="p-3 text-center text-green-600 font-bold">✔ Excellent</td>
                  <td className="p-3 text-slate-600">AC4 laminate handles heavy traffic beautifully. EIR textures look premium.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Bedrooms</td>
                  <td className="p-3 text-center text-green-600 font-bold">✔ Ideal</td>
                  <td className="p-3 text-slate-600">Low traffic, warm feel. Even AC3 is sufficient here.</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Kitchen</td>
                  <td className="p-3 text-center text-yellow-600 font-bold">⚠ Waterproof only</td>
                  <td className="p-3 text-slate-600">Use waterproof laminate (Evergreen, NAF) and clean spills promptly. Or use vinyl.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Hallways</td>
                  <td className="p-3 text-center text-green-600 font-bold">✔ Great</td>
                  <td className="p-3 text-slate-600">High-traffic corridor? Go AC4 or AC5. 12mm+ for longevity.</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Home Office</td>
                  <td className="p-3 text-center text-green-600 font-bold">✔ Ideal</td>
                  <td className="p-3 text-slate-600">Smooth surface for office chairs. Use a chair mat for extra protection.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Basement (dry)</td>
                  <td className="p-3 text-center text-yellow-600 font-bold">⚠ With precautions</td>
                  <td className="p-3 text-slate-600">Moisture barrier mandatory. Choose waterproof laminate. Vinyl is safer if any doubt.</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Bathroom</td>
                  <td className="p-3 text-center text-red-600 font-bold">✘ No</td>
                  <td className="p-3 text-slate-600">Too much water exposure. Use <Link href="/vinyl-flooring-guide" className="text-blue-600 hover:underline">vinyl</Link> instead.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">Rental Property</td>
                  <td className="p-3 text-center text-green-600 font-bold">✔ Top choice</td>
                  <td className="p-3 text-slate-600">Best cost-per-year value. Scratch-resistant. Easy to replace if damaged. Tosca from $1.49/sqft.</td>
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
              { q: 'How much does laminate flooring cost in Toronto?', a: 'At BBS Flooring, laminate material ranges from $1.49–$3.29/sqft. Installation is $2.00/sqft for floating click-lock. A typical 500 sqft project costs $1,745–$2,645 total installed — the most affordable hard-surface option in the GTA.' },
              { q: 'Is laminate flooring waterproof?', a: 'Modern "waterproof" laminate handles surface spills for 24–72 hours. But it\'s not fully waterproof like vinyl — prolonged water exposure can still cause HDF core swelling. For bathrooms and wet areas, use vinyl instead.' },
              { q: 'What AC rating do I need?', a: 'AC4 is the sweet spot for most homes — handles kids, pets, and heavy traffic. AC3 works for bedrooms and low-traffic rooms. AC5 is commercial-grade, ideal for rentals and businesses.' },
              { q: 'Can laminate be refinished?', a: 'No. Laminate\'s surface is a printed image under a wear layer — it can\'t be sanded or restained. When it wears through (15–25 years), replace it. This is why solid hardwood ($5.10+/sqft) commands a premium — it lasts forever.' },
              { q: 'Is 12mm laminate good enough?', a: 'Yes. 12mm is BBS\'s minimum standard — it feels solid, hides subfloor imperfections, and sounds good. 14mm (NAF) is premium with pre-attached underpad. We don\'t carry anything under 12mm.' },
              { q: 'Can laminate go in a basement?', a: 'In dry basements with a moisture barrier, yes. If your basement has any history of water, use vinyl (LVP) — it\'s 100% waterproof. Our installers test moisture during the free measurement.' },
              { q: 'Does laminate need underlay?', a: 'Yes, unless pre-attached (NAF 14mm). Underlay absorbs sound, adds comfort, and provides a moisture barrier. Never double-layer underlay — it weakens click-lock joints.' },
              { q: 'How long does installation take?', a: 'Laminate installs in 1 day for a standard 500 sqft room. Floating click-lock is the fastest flooring method — no drying time, walkable immediately. BBS handles removal, prep, install, and baseboards in one visit.' },
              { q: 'Is laminate good for pets?', a: 'Excellent. AC4+ laminate resists pet claw scratches better than real hardwood. It doesn\'t absorb odours like carpet. Choose textured (EIR) surfaces for better traction.' },
              { q: 'What brands do you carry?', a: 'NAF (32, 14mm premium), Tosca (21, from $1.49), Northernest (18), Simba (18), Triforest (16), Evergreen (16, waterproof), Falcon (12), Woden (6), Golden Choice (6) — 145 total options at our Markham showroom.' },
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
        <section className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to See Laminate in Person?</h2>
          <p className="text-emerald-200 mb-6 max-w-xl mx-auto">
            Feel the difference between 12mm and 14mm. Compare textures. See how modern laminate looks nothing like the cheap stuff from 10 years ago.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/laminate" className="bg-white text-emerald-900 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition">
              Browse 145 Options →
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
