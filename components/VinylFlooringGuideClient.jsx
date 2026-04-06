'use client';

import Link from 'next/link';

export default function VinylFlooringGuideClient() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-4">
            BBS Flooring — Buying Guide 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            The Complete Guide to Vinyl Flooring (LVP &amp; SPC) in Canada
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about luxury vinyl plank — SPC vs WPC, wear layers, waterproof performance, costs, and how to choose the right vinyl for every room.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-slate-400">
            <span>✔ 233 options in stock</span>
            <span>✔ 6 brands compared</span>
            <span>✔ Real Canadian pricing</span>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-blue-50 border-b border-blue-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">In This Guide</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-blue-700 text-sm font-medium list-decimal list-inside">
            <li><a href="#what-is-lvp" className="hover:underline">What Is Luxury Vinyl Plank?</a></li>
            <li><a href="#spc-vs-wpc" className="hover:underline">SPC vs WPC: Which Core Is Better?</a></li>
            <li><a href="#wear-layer" className="hover:underline">Wear Layers Explained</a></li>
            <li><a href="#how-to-choose" className="hover:underline">How to Choose: 6 Key Factors</a></li>
            <li><a href="#brand-comparison" className="hover:underline">Brand Comparison</a></li>
            <li><a href="#cost-breakdown" className="hover:underline">Total Cost Breakdown</a></li>
            <li><a href="#best-rooms" className="hover:underline">Best Rooms for Vinyl Flooring</a></li>
            <li><a href="#installation" className="hover:underline">Installation: What to Expect</a></li>
            <li><a href="#vinyl-vs-others" className="hover:underline">Vinyl vs Hardwood vs Laminate</a></li>
            <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
          </ol>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-20">

        {/* Section 1: What Is LVP */}
        <section id="what-is-lvp">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">What Is Luxury Vinyl Plank (LVP)?</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Luxury vinyl plank is a multi-layer engineered flooring that realistically mimics real hardwood while being 100% waterproof, scratch-resistant, and significantly more affordable. It&apos;s the fastest-growing flooring category in North America — and for good reason.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Anatomy of a Vinyl Plank</h3>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-4 h-4 rounded-full bg-blue-600 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">UV Coating (Top)</p>
                  <p className="text-slate-600 text-sm">Invisible ceramic or urethane coating that protects against scratches, scuffs, and UV fading. Premium products have multiple UV-cured coats.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-4 h-4 rounded-full bg-blue-400 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Wear Layer</p>
                  <p className="text-slate-600 text-sm">Clear vinyl layer measured in mils (thousandths of an inch). This is the single most important spec — it determines how long the floor lasts. 12mil = basic, 20mil = standard, 22–28mil = premium/commercial.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-4 h-4 rounded-full bg-blue-300 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Print Layer</p>
                  <p className="text-slate-600 text-sm">High-definition photographic layer that creates the wood-look appearance. Modern printing uses EIR (Embossed-In-Register) technology to align texture with the printed grain — so the grooves you feel match the wood pattern you see.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-4 h-4 rounded-full bg-blue-200 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Rigid Core</p>
                  <p className="text-slate-600 text-sm">SPC (stone-polymer) or WPC (wood-polymer) core that provides structure and click-lock connection. This is what makes modern vinyl &ldquo;rigid core&rdquo; — completely different from the thin, flexible sheet vinyl of the past.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-4 h-4 rounded-full bg-blue-100 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Attached Underpad (IXPE/EVA)</p>
                  <p className="text-slate-600 text-sm">Pre-attached backing that provides sound absorption, thermal insulation, and moisture barrier. Most premium vinyl in 2026 comes with IXPE underpad pre-attached — no separate underlayment needed.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: SPC vs WPC */}
        <section id="spc-vs-wpc">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">SPC vs WPC: Which Core Is Better?</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            The core material is the biggest decision when choosing vinyl plank. Here&apos;s how they compare:
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-4 font-semibold text-slate-800 border-b-2 border-slate-300">Feature</th>
                  <th className="text-left p-4 font-semibold text-blue-700 border-b-2 border-slate-300">SPC (Stone Plastic Composite)</th>
                  <th className="text-left p-4 font-semibold text-emerald-700 border-b-2 border-slate-300">WPC (Wood Plastic Composite)</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b"><td className="p-4 font-medium">Core material</td><td className="p-4">Limestone powder + PVC</td><td className="p-4">Wood flour + PVC</td></tr>
                <tr className="border-b bg-slate-50"><td className="p-4 font-medium">Density</td><td className="p-4">Very high (~2,000 kg/m³)</td><td className="p-4">Medium (~1,400 kg/m³)</td></tr>
                <tr className="border-b"><td className="p-4 font-medium">Dent resistance</td><td className="p-4">Excellent — resists heavy furniture</td><td className="p-4">Good — can dent under extreme weight</td></tr>
                <tr className="border-b bg-slate-50"><td className="p-4 font-medium">Comfort underfoot</td><td className="p-4">Firm (improved with IXPE underpad)</td><td className="p-4">Softer and warmer</td></tr>
                <tr className="border-b"><td className="p-4 font-medium">Sound absorption</td><td className="p-4">Moderate (needs underpad)</td><td className="p-4">Better natural sound dampening</td></tr>
                <tr className="border-b bg-slate-50"><td className="p-4 font-medium">Thickness range</td><td className="p-4">4mm–6.5mm</td><td className="p-4">5.5mm–8mm</td></tr>
                <tr className="border-b"><td className="p-4 font-medium">Temperature stability</td><td className="p-4">Excellent — minimal expansion</td><td className="p-4">Good — slightly more expansion</td></tr>
                <tr className="border-b bg-slate-50"><td className="p-4 font-medium">Price range (BBS)</td><td className="p-4">$2.19–$3.59/sqft</td><td className="p-4">$2.79–$3.59/sqft</td></tr>
                <tr><td className="p-4 font-medium">Best for</td><td className="p-4 font-semibold text-blue-700">Basements, kitchens, high-traffic</td><td className="p-4 font-semibold text-emerald-700">Bedrooms, living rooms, condos</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="text-blue-800 font-semibold mb-2">📌 Our Recommendation</p>
            <p className="text-blue-700 text-sm">SPC is the dominant choice in 2026 — about 85% of the vinyl flooring we sell at BBS is SPC. Its superior dent resistance and temperature stability make it the safer all-around pick for most Canadian homes. WPC is still a great choice if underfoot comfort is your top priority (bedrooms, playrooms).</p>
          </div>
        </section>

        {/* Section 3: Wear Layers */}
        <section id="wear-layer">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Wear Layers Explained: The Most Important Spec</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            The wear layer is the clear protective layer on top of the printed design. It&apos;s measured in mils (1 mil = 0.001 inch or ~0.025mm). This single spec determines how long your vinyl floor will look new.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <div className="text-2xl font-bold text-yellow-700 mb-1">12 mil</div>
              <div className="text-sm font-semibold text-yellow-600 mb-2">Entry-Level Residential</div>
              <p className="text-slate-600 text-sm">Suitable for low-traffic rooms like bedrooms and guest rooms. Expected lifespan: 10–15 years. Adequate for rental properties and budget renovations.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="text-2xl font-bold text-blue-700 mb-1">20 mil</div>
              <div className="text-sm font-semibold text-blue-600 mb-2">Standard Residential</div>
              <p className="text-slate-600 text-sm">The sweet spot for most homes. Handles kitchens, living rooms, and moderate pet traffic. Expected lifespan: 20–25 years. Our most popular category.</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <div className="text-2xl font-bold text-emerald-700 mb-1">22–28 mil</div>
              <div className="text-sm font-semibold text-emerald-600 mb-2">Premium / Commercial</div>
              <p className="text-slate-600 text-sm">Maximum durability for busy households, large dogs, commercial spaces. Expected lifespan: 25–30+ years. Virtually scratch-proof for residential use.</p>
            </div>
          </div>
        </section>

        {/* Section 4: How to Choose */}
        <section id="how-to-choose">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">How to Choose the Right Vinyl: 6 Key Factors</h2>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">1. Wear Layer Thickness</h3>
              <p className="text-slate-600">Minimum 20mil for main living areas. Don&apos;t go below 12mil anywhere. If you have large dogs, go 22mil+.</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">2. Overall Plank Thickness</h3>
              <p className="text-slate-600">Thicker planks (5.5mm+) feel more substantial underfoot and hide minor subfloor imperfections better. Budget options at 4mm work fine on perfectly flat concrete.</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">3. Attached Underpad</h3>
              <p className="text-slate-600">Look for vinyl with pre-attached IXPE underpad — it provides sound dampening, thermal comfort, and moisture barrier in one. Saves $0.50–$0.75/sqft on separate underlayment.</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">4. Plank Dimensions</h3>
              <p className="text-slate-600">Wider, longer planks (7&quot; × 48&quot; or larger) create a more realistic wood look with fewer seams. Standard 6&quot; × 36&quot; planks are economical but look more repetitive.</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">5. Print Variation</h3>
              <p className="text-slate-600">Check how many unique print patterns are in each box. Premium products have 8–12 unique patterns; budget products repeat every 3–4 planks, creating a noticeable &ldquo;repeat&rdquo; effect.</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">6. Click-Lock Quality</h3>
              <p className="text-slate-600">Premium brands use Valinge or Unilin click systems that lock tighter and resist gaps. This matters more in high-traffic areas and rooms with temperature swings.</p>
            </div>
          </div>
        </section>

        {/* Section 5: Brand Comparison */}
        <section id="brand-comparison">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Vinyl Brands at BBS Flooring — Compared</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            We carry 233 vinyl products across 6 brands. Here&apos;s how they stack up:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 font-semibold text-slate-800 border-b-2 border-slate-300">Brand</th>
                  <th className="text-center p-3 font-semibold text-slate-800 border-b-2 border-slate-300">Products</th>
                  <th className="text-center p-3 font-semibold text-slate-800 border-b-2 border-slate-300">Price Range</th>
                  <th className="text-left p-3 font-semibold text-slate-800 border-b-2 border-slate-300">Best For</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b"><td className="p-3 font-medium">NAF Flooring</td><td className="p-3 text-center">69</td><td className="p-3 text-center">$2.49–$3.59</td><td className="p-3">Widest selection, premium collections, SPC + herringbone options</td></tr>
                <tr className="border-b bg-slate-50"><td className="p-3 font-medium">Woden Flooring</td><td className="p-3 text-center">49</td><td className="p-3 text-center">$2.29–$3.19</td><td className="p-3">Mid-range value, consistent quality, good colour range</td></tr>
                <tr className="border-b"><td className="p-3 font-medium">Triforest Flooring</td><td className="p-3 text-center">44</td><td className="p-3 text-center">$2.29–$3.19</td><td className="p-3">Strong mid-range, thick planks, commercial-grade options</td></tr>
                <tr className="border-b bg-slate-50"><td className="p-3 font-medium">Simba Flooring</td><td className="p-3 text-center">42</td><td className="p-3 text-center">$2.29–$3.59</td><td className="p-3">Budget-friendly, clearance deals, herringbone available</td></tr>
                <tr className="border-b"><td className="p-3 font-medium">Falcon Flooring</td><td className="p-3 text-center">19</td><td className="p-3 text-center">$2.19–$2.59</td><td className="p-3">Best budget option, reliable basics for rentals and basements</td></tr>
                <tr><td className="p-3 font-medium">Lee Flooring</td><td className="p-3 text-center">10</td><td className="p-3 text-center">$2.29</td><td className="p-3">Value-focused, consistent single price point</td></tr>
              </tbody>
            </table>
          </div>

          <p className="text-slate-500 text-sm italic">
            Prices current as of April 2026. <Link href="/vinyl" className="text-blue-600 hover:underline">Browse all 233 vinyl products →</Link>
          </p>
        </section>

        {/* Section 6: Cost Breakdown */}
        <section id="cost-breakdown">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Total Cost Breakdown: Vinyl Flooring in the GTA</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Here&apos;s what a complete vinyl flooring project costs at BBS Flooring, broken down by room size:
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 font-semibold text-slate-800 border-b-2 border-slate-300">Room Size</th>
                  <th className="text-center p-3 font-semibold text-slate-800 border-b-2 border-slate-300">Material (Budget)</th>
                  <th className="text-center p-3 font-semibold text-slate-800 border-b-2 border-slate-300">Material (Mid)</th>
                  <th className="text-center p-3 font-semibold text-slate-800 border-b-2 border-slate-300">Material (Premium)</th>
                  <th className="text-center p-3 font-semibold text-slate-800 border-b-2 border-slate-300">Installation</th>
                  <th className="text-center p-3 font-semibold text-blue-700 border-b-2 border-slate-300">Total Range</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b"><td className="p-3 font-medium">Small Room (150 sqft)</td><td className="p-3 text-center">$329</td><td className="p-3 text-center">$413</td><td className="p-3 text-center">$539</td><td className="p-3 text-center">$300</td><td className="p-3 text-center font-semibold text-blue-700">$629–$839</td></tr>
                <tr className="border-b bg-slate-50"><td className="p-3 font-medium">Bedroom (200 sqft)</td><td className="p-3 text-center">$438</td><td className="p-3 text-center">$550</td><td className="p-3 text-center">$718</td><td className="p-3 text-center">$400</td><td className="p-3 text-center font-semibold text-blue-700">$838–$1,118</td></tr>
                <tr className="border-b"><td className="p-3 font-medium">Living Room (350 sqft)</td><td className="p-3 text-center">$767</td><td className="p-3 text-center">$963</td><td className="p-3 text-center">$1,257</td><td className="p-3 text-center">$700</td><td className="p-3 text-center font-semibold text-blue-700">$1,467–$1,957</td></tr>
                <tr className="border-b bg-slate-50"><td className="p-3 font-medium">Main Floor (500 sqft)</td><td className="p-3 text-center">$1,095</td><td className="p-3 text-center">$1,375</td><td className="p-3 text-center">$1,795</td><td className="p-3 text-center">$1,000</td><td className="p-3 text-center font-semibold text-blue-700">$2,095–$2,795</td></tr>
                <tr><td className="p-3 font-medium">Whole Home (1,000 sqft)</td><td className="p-3 text-center">$2,190</td><td className="p-3 text-center">$2,750</td><td className="p-3 text-center">$3,590</td><td className="p-3 text-center">$2,000</td><td className="p-3 text-center font-semibold text-blue-700">$4,190–$5,590</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
            <p className="text-amber-800 font-semibold mb-2">💡 Budget Tip</p>
            <p className="text-amber-700 text-sm">Material costs above include 5% waste factor. Installation at $2.00/sqft is all-inclusive labour — no hidden fees for furniture moving, transitions, or basic prep. Old carpet removal adds $1.00/sqft; old hardwood/laminate removal adds $1.25–$1.50/sqft.</p>
          </div>
        </section>

        {/* Section 7: Best Rooms */}
        <section id="best-rooms">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Best Rooms for Vinyl Flooring</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <h3 className="font-semibold text-emerald-800 text-lg mb-2">🏠 Basement ★★★★★</h3>
              <p className="text-slate-600 text-sm">The #1 choice. 100% waterproof, handles temperature swings, installs over concrete. SPC with IXPE underpad is the gold standard for Ontario basements.</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <h3 className="font-semibold text-emerald-800 text-lg mb-2">🍳 Kitchen ★★★★★</h3>
              <p className="text-slate-600 text-sm">Waterproof + scratch-resistant = ideal for kitchens. Handles dropped pots, spills, and heavy foot traffic. Easier on legs than tile during long cooking sessions.</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <h3 className="font-semibold text-emerald-800 text-lg mb-2">🛁 Bathroom ★★★★★</h3>
              <p className="text-slate-600 text-sm">Vinyl replaces cold tile with a warmer, more comfortable surface — and it&apos;s still fully waterproof. Perfect for half-baths and powder rooms; main bathrooms should use caulked edges.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-semibold text-blue-800 text-lg mb-2">🛋️ Living Room ★★★★</h3>
              <p className="text-slate-600 text-sm">Great for families with kids and pets. Pick a 20mil+ wear layer and wider planks for a high-end look. Some purists prefer real hardwood here — that&apos;s personal preference.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-semibold text-blue-800 text-lg mb-2">🏢 Condo ★★★★</h3>
              <p className="text-slate-600 text-sm">Vinyl with attached IXPE underpad often meets condo sound requirements (STC/IIC ratings). Check your condo board&apos;s flooring rules — some require minimum thicknesses or sound test reports.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-semibold text-blue-800 text-lg mb-2">🏠 Laundry Room ★★★★★</h3>
              <p className="text-slate-600 text-sm">100% waterproof means zero stress about washer leaks or drips. Budget SPC works perfectly here — no need for premium wear layers in a utility space.</p>
            </div>
          </div>
        </section>

        {/* Section 8: Installation */}
        <section id="installation">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Installation: What to Expect</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Vinyl is one of the fastest and easiest flooring types to install. Here&apos;s the typical process with BBS Flooring:
          </p>

          <div className="space-y-4 mb-8">
            {[
              { step: '1', title: 'Free In-Home Measurement', desc: 'We measure every room, assess your subfloor, and provide a no-obligation quote within 24 hours.' },
              { step: '2', title: 'Material Selection', desc: 'Choose your vinyl at our Markham showroom (233 options to see and touch) or from our online catalog.' },
              { step: '3', title: 'Subfloor Preparation', desc: 'Old flooring removal (if needed), levelling compounds for dips/bumps, and moisture testing on concrete.' },
              { step: '4', title: 'Click-Lock Installation', desc: 'Planks click together without glue. A 500 sqft room typically takes 1 day. We handle furniture moving, transitions, and trim.' },
              { step: '5', title: 'Final Walkthrough', desc: 'We inspect every seam, clean up all debris, move furniture back, and review the finished project with you.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">{step}</div>
                <div>
                  <p className="font-semibold text-slate-800">{title}</p>
                  <p className="text-slate-600 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-slate-700 font-semibold mb-2">⏱ Timeline</p>
            <p className="text-slate-600 text-sm">From measurement to finished installation typically takes 5–10 business days, depending on material availability. Same-week installation is often available for in-stock products. No acclimatization period needed for vinyl (unlike hardwood, which requires 48–72 hours).</p>
          </div>
        </section>

        {/* Section 9: Vinyl vs Others */}
        <section id="vinyl-vs-others">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Vinyl vs Hardwood vs Laminate</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Not sure which flooring type is right for you? Here&apos;s a quick comparison:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 font-semibold text-slate-800 border-b-2 border-slate-300">Feature</th>
                  <th className="text-center p-3 font-semibold text-blue-700 border-b-2 border-slate-300">Vinyl (LVP)</th>
                  <th className="text-center p-3 font-semibold text-amber-700 border-b-2 border-slate-300">Engineered Hardwood</th>
                  <th className="text-center p-3 font-semibold text-emerald-700 border-b-2 border-slate-300">Laminate</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b"><td className="p-3 font-medium">Waterproof</td><td className="p-3 text-center">✅ 100%</td><td className="p-3 text-center">❌ Water-resistant</td><td className="p-3 text-center">⚠️ Some models</td></tr>
                <tr className="border-b bg-slate-50"><td className="p-3 font-medium">Refinishable</td><td className="p-3 text-center">❌ No</td><td className="p-3 text-center">✅ 1–3 times</td><td className="p-3 text-center">❌ No</td></tr>
                <tr className="border-b"><td className="p-3 font-medium">Scratch resistance</td><td className="p-3 text-center">Excellent</td><td className="p-3 text-center">Moderate</td><td className="p-3 text-center">Good</td></tr>
                <tr className="border-b bg-slate-50"><td className="p-3 font-medium">Basement safe</td><td className="p-3 text-center">✅ Yes</td><td className="p-3 text-center">⚠️ With moisture test</td><td className="p-3 text-center">❌ Not recommended</td></tr>
                <tr className="border-b"><td className="p-3 font-medium">Lifespan</td><td className="p-3 text-center">20–30 years</td><td className="p-3 text-center">25–50 years</td><td className="p-3 text-center">15–25 years</td></tr>
                <tr className="border-b bg-slate-50"><td className="p-3 font-medium">Material cost (BBS)</td><td className="p-3 text-center">$2.19–$3.59</td><td className="p-3 text-center">$2.49–$9.29</td><td className="p-3 text-center">$1.49–$2.99</td></tr>
                <tr className="border-b"><td className="p-3 font-medium">Installation cost</td><td className="p-3 text-center">$2.00/sqft</td><td className="p-3 text-center">$2.25–$4.25/sqft</td><td className="p-3 text-center">$2.00/sqft</td></tr>
                <tr><td className="p-3 font-medium">Resale value impact</td><td className="p-3 text-center">Good</td><td className="p-3 text-center">Excellent</td><td className="p-3 text-center">Neutral</td></tr>
              </tbody>
            </table>
          </div>

          <p className="text-slate-600">
            Want a detailed comparison? Read our <Link href="/flooring-comparison-guide" className="text-blue-600 hover:underline font-medium">Hardwood vs Vinyl vs Laminate Comparison Guide →</Link>
          </p>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-slate-800 to-blue-900 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to See Vinyl In Person?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Visit our Markham showroom to touch and compare all 233 vinyl options. Or book a free measurement and we&apos;ll bring samples to your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/free-measurement" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Book Free Measurement
            </Link>
            <Link href="/vinyl" className="border-2 border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Browse 233 Vinyl Products
            </Link>
          </div>
          <p className="text-slate-400 text-sm mt-6">
            BBS Flooring · 6061 Highway 7, Unit B, Markham · (647) 428-1111
          </p>
        </section>

      </main>
    </div>
  );
}
