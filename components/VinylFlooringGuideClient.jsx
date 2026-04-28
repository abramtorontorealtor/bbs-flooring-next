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
            Everything you need to know about luxury vinyl plank — SPC vs WPC, wear layers, thickness, waterproof performance, costs, and how to choose the right vinyl for every room.
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
            <li><a href="#thickness-guide" className="hover:underline">Thickness Guide: 4mm to 9mm</a></li>
            <li><a href="#how-to-choose" className="hover:underline">How to Choose: 6 Key Factors</a></li>
            <li><a href="#brand-comparison" className="hover:underline">Brand Comparison</a></li>
            <li><a href="#price-tiers" className="hover:underline">Price Tier Breakdown</a></li>
            <li><a href="#editors-picks" className="hover:underline">Editor&apos;s Top Vinyl Picks</a></li>
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

          <p className="text-slate-600 leading-relaxed">
            Not sure if vinyl is right for your space? Our{' '}
            <Link href="/waterproof-flooring" className="text-amber-700 underline hover:text-amber-800">waterproof flooring collection</Link>{' '}
            covers all 233 options, or{' '}
            <Link href="/free-measurement" className="text-amber-700 underline hover:text-amber-800">book a free in-home measurement</Link>{' '}
            and we&apos;ll walk you through your best choices in person.
          </p>
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

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
            <p className="text-blue-800 font-semibold mb-2">📌 Our Recommendation</p>
            <p className="text-blue-700 text-sm">SPC is the dominant choice in 2026 — about 85% of the vinyl flooring we sell at BBS is SPC. Its superior dent resistance and temperature stability make it the safer all-around pick for most Canadian homes. WPC is still a great choice if underfoot comfort is your top priority (bedrooms, playrooms).</p>
          </div>

          <p className="text-slate-600 leading-relaxed">
            A popular SPC entry point is the{' '}
            <Link href="/products/cliffside-falcon-floor-products-6mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Cliffside by Falcon (6mm SPC) at $2.19/sqft</Link>{' '}
            — an ideal budget option for basements and rental properties. For a mid-range 7mm SPC with more colour options, check out{' '}
            <Link href="/products/madagascar-naf-classic-7mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Madagascar by NAF Classic (7mm) at $2.79/sqft</Link>.
          </p>
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

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-slate-700 text-sm">
              <strong>Real example:</strong> The{' '}
              <Link href="/products/fulham-naf-aquaplus-platinum-9mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Fulham NAF AquaPlus Platinum (9mm) at $3.49/sqft</Link>{' '}
              features a 28mil wear layer — premium-grade protection for busy family homes, large dogs, or commercial-adjacent spaces. For most main-floor living areas, a 20mil product like{' '}
              <Link href="/products/walnut-wharf-lee-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Walnut Wharf by Lee (7mm) at $2.49/sqft</Link>{' '}
              is the practical sweet spot.
            </p>
          </div>
        </section>

        {/* Section 4: Thickness Guide (NEW) */}
        <section id="thickness-guide">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Thickness Guide: What 4mm vs 9mm Actually Means</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Total plank thickness (not to be confused with wear layer) affects how the floor feels, how well it hides subfloor imperfections, and how much height it adds. Here&apos;s what each thickness delivers in practice:
          </p>

          <div className="space-y-4 mb-8">
            <div className="border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start">
              <div className="shrink-0">
                <span className="bg-slate-200 text-slate-800 text-lg font-bold px-4 py-2 rounded-lg block text-center">4mm</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">Entry-Level — Budget Rentals &amp; Dry Basements</p>
                <p className="text-slate-600 text-sm leading-relaxed">The thinnest rigid-core vinyl available. Works fine over a perfectly flat concrete or plywood subfloor. Feels noticeably hollow underfoot and telegraphs subfloor irregularities more than thicker options. Best reserved for rental units, storage rooms, or any space where price is the only priority. You&apos;ll notice the difference walking on it.</p>
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start">
              <div className="shrink-0">
                <span className="bg-slate-200 text-slate-800 text-lg font-bold px-4 py-2 rounded-lg block text-center">5mm</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">Light Residential — Bedrooms &amp; Low-Traffic Areas</p>
                <p className="text-slate-600 text-sm leading-relaxed">A step up in feel and subfloor tolerance. Still requires a relatively flat surface but hides minor imperfections better. A reasonable choice for secondary bedrooms and low-traffic areas in homes with tight height clearances (under doors, transitioning to tile, etc.).</p>
              </div>
            </div>
            <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start">
              <div className="shrink-0">
                <span className="bg-blue-600 text-white text-lg font-bold px-4 py-2 rounded-lg block text-center">6mm</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">Standard Residential — The Most Popular Thickness</p>
                <p className="text-slate-600 text-sm leading-relaxed">The dominant thickness for residential vinyl in Canada. Solid underfoot feel, hides typical subfloor variation, and pairs well with attached IXPE underpad. The{' '}
                  <Link href="/products/cliffside-falcon-floor-products-6mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Cliffside Falcon 6mm at $2.19/sqft</Link>{' '}
                  is our best-selling entry product at this thickness. Works in kitchens, living rooms, basements, and bedrooms equally well.</p>
              </div>
            </div>
            <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start">
              <div className="shrink-0">
                <span className="bg-blue-700 text-white text-lg font-bold px-4 py-2 rounded-lg block text-center">7mm</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">Mid-Range Residential — Better Feel, More Subfloor Forgiveness</p>
                <p className="text-slate-600 text-sm leading-relaxed">Noticeably more solid than 6mm. Better thermal insulation and less sound transmission. The extra millimetre makes a real difference if you have older concrete with small dips or uneven areas. Most of our mid-range lineup sits here — like the{' '}
                  <Link href="/products/walnut-wharf-lee-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Walnut Wharf Lee 7mm at $2.49/sqft</Link>{' '}
                  and{' '}
                  <Link href="/products/madagascar-naf-classic-7mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Madagascar NAF Classic 7mm at $2.79/sqft</Link>.
                </p>
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start">
              <div className="shrink-0">
                <span className="bg-slate-700 text-white text-lg font-bold px-4 py-2 rounded-lg block text-center">9mm</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">Premium Residential — Maximum Comfort &amp; Durability</p>
                <p className="text-slate-600 text-sm leading-relaxed">The thickest rigid-core vinyl available at BBS. Feels the closest to real hardwood underfoot — substantial, quiet, and warm. Handles the most pronounced subfloor irregularities and is virtually indistinguishable from wood when walked on. The{' '}
                  <Link href="/products/fulham-naf-aquaplus-platinum-9mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Fulham NAF AquaPlus Platinum 9mm at $3.49/sqft</Link>{' '}
                  is our flagship 9mm product — 28mil wear layer, IXPE underpad included, lifetime residential warranty.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-amber-800 font-semibold mb-2">📐 Height Note</p>
            <p className="text-amber-700 text-sm">Every mm of thickness counts when transitioning to adjacent rooms or fitting under door casings. If you&apos;re replacing existing flooring, match or go thinner than what&apos;s there. If you have tight clearances under doors, stick to 6mm or under. Our installers trim door casings as needed — no extra charge.</p>
          </div>
        </section>

        {/* Section 5: How to Choose */}
        <section id="how-to-choose">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">How to Choose the Right Vinyl: 6 Key Factors</h2>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">1. Wear Layer Thickness</h3>
              <p className="text-slate-600">Minimum 20mil for main living areas. Don&apos;t go below 12mil anywhere. If you have large dogs, go 22mil+.</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">2. Overall Plank Thickness</h3>
              <p className="text-slate-600">Thicker planks (6mm+) feel more substantial underfoot and hide minor subfloor imperfections better. 4mm works on perfectly flat concrete. 7mm+ is ideal for older homes with less-than-perfect subfloors.</p>
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

        {/* Section 6: Brand Comparison */}
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
                <tr className="border-b">
                  <td className="p-3 font-medium"><Link href="/naf-flooring" className="text-amber-700 underline hover:text-amber-800">NAF Flooring</Link></td>
                  <td className="p-3 text-center">69</td>
                  <td className="p-3 text-center">$2.49–$3.59</td>
                  <td className="p-3">Widest selection, premium collections, SPC + herringbone options</td>
                </tr>
                <tr className="border-b bg-slate-50">
                  <td className="p-3 font-medium"><Link href="/woden-flooring" className="text-amber-700 underline hover:text-amber-800">Woden Flooring</Link></td>
                  <td className="p-3 text-center">49</td>
                  <td className="p-3 text-center">$2.29–$3.19</td>
                  <td className="p-3">Mid-range value, consistent quality, good colour range</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Triforest Flooring</td>
                  <td className="p-3 text-center">44</td>
                  <td className="p-3 text-center">$2.29–$3.19</td>
                  <td className="p-3">Strong mid-range, thick planks, commercial-grade options</td>
                </tr>
                <tr className="border-b bg-slate-50">
                  <td className="p-3 font-medium">Simba Flooring</td>
                  <td className="p-3 text-center">42</td>
                  <td className="p-3 text-center">$2.29–$3.59</td>
                  <td className="p-3">Budget-friendly, clearance deals, herringbone available</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium"><Link href="/falcon-flooring" className="text-amber-700 underline hover:text-amber-800">Falcon Flooring</Link></td>
                  <td className="p-3 text-center">19</td>
                  <td className="p-3 text-center">$2.19–$2.59</td>
                  <td className="p-3">Best budget option, reliable basics for rentals and basements</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Lee Flooring</td>
                  <td className="p-3 text-center">10</td>
                  <td className="p-3 text-center">$2.29</td>
                  <td className="p-3">Value-focused, consistent single price point</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-slate-500 text-sm italic mb-4">
            Prices current as of April 2026.{' '}
            <Link href="/vinyl-flooring" className="text-blue-600 hover:underline">Browse all 233 vinyl products →</Link>
          </p>

          <p className="text-slate-600 text-sm">
            Want something different? Check out our full{' '}
            <Link href="/waterproof-flooring" className="text-amber-700 underline hover:text-amber-800">waterproof flooring collection</Link>{' '}
            — it includes vinyl, SPC, and select laminate options all rated for moisture-prone spaces.
          </p>
        </section>

        {/* Section 7: Price Tiers (NEW) */}
        <section id="price-tiers">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Price Tier Breakdown: What You Get at Each Level</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            Here&apos;s exactly what your budget buys you — with real products at BBS Flooring across four price tiers. All prices are material only; add $2.00/sqft for professional{' '}
            <Link href="/installation" className="text-amber-700 underline hover:text-amber-800">installation</Link>.
          </p>

          <div className="space-y-5">
            {/* Budget tier */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-6 py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-lg">Budget Tier</span>
                  <span className="ml-3 text-slate-500 text-sm font-medium">$2.19 – $2.49 / sqft</span>
                </div>
                <span className="bg-slate-500 text-white text-xs font-bold px-3 py-1 rounded-full">ENTRY</span>
              </div>
              <div className="px-6 py-5">
                <p className="text-slate-600 text-sm mb-4">6mm–7mm SPC. 12mil wear layer. Basic print variety. No attached underpad on most. These floors do their job without fuss — ideal for rental units, basements that need covering fast, and secondary rooms where premium aesthetics aren&apos;t the priority.</p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Example Product</p>
                  <p className="text-sm text-slate-700">
                    <Link href="/products/cliffside-falcon-floor-products-6mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800 font-semibold">Cliffside — Falcon Floors 6mm SPC</Link>
                    {' '}— $2.19/sqft · 12mil wear layer · 100% waterproof · Click-lock over concrete
                  </p>
                </div>
              </div>
            </div>

            {/* Mid tier */}
            <div className="border border-blue-200 rounded-xl overflow-hidden">
              <div className="bg-blue-50 px-6 py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-lg">Mid-Range Tier</span>
                  <span className="ml-3 text-slate-500 text-sm font-medium">$2.49 – $2.99 / sqft</span>
                </div>
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
              </div>
              <div className="px-6 py-5">
                <p className="text-slate-600 text-sm mb-4">7mm SPC. 20mil wear layer. More realistic print options. Many products include attached IXPE underpad. This is where most BBS customers land — enough durability for a busy household, without the premium price tag. Great for kitchens, living rooms, and open-concept main floors.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Example Product A</p>
                    <p className="text-sm text-slate-700">
                      <Link href="/products/walnut-wharf-lee-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800 font-semibold">Walnut Wharf — Lee 7mm</Link>
                      {' '}— $2.49/sqft · 20mil · Warm oak tone
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Example Product B</p>
                    <p className="text-sm text-slate-700">
                      <Link href="/products/madagascar-naf-classic-7mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800 font-semibold">Madagascar — NAF Classic 7mm</Link>
                      {' '}— $2.79/sqft · 20mil · Rich natural grain
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upper-mid tier */}
            <div className="border border-amber-200 rounded-xl overflow-hidden">
              <div className="bg-amber-50 px-6 py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-lg">Upper-Mid Tier</span>
                  <span className="ml-3 text-slate-500 text-sm font-medium">$2.79 – $3.19 / sqft</span>
                </div>
                <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</span>
              </div>
              <div className="px-6 py-5">
                <p className="text-slate-600 text-sm mb-4">7mm SPC. 20–22mil wear layer. Wider plank formats. Improved EIR embossing, longer repeat cycles, IXPE underpad included. This tier looks and feels noticeably more premium than mid-range. For show homes, master bedrooms, or open-plan main floors, this is where the value-per-dollar peaks.</p>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Example Product</p>
                  <p className="text-sm text-slate-700">
                    <Link href="/products/h02-seaside-motel-woden-7mm-vinyl-herringbone-flooring" className="text-amber-700 underline hover:text-amber-800 font-semibold">H02 Seaside Motel — Woden Herringbone 7mm</Link>
                    {' '}— $2.79/sqft · 20mil · Statement herringbone pattern
                  </p>
                </div>
              </div>
            </div>

            {/* Premium tier */}
            <div className="border border-emerald-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-50 px-6 py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-lg">Premium Tier</span>
                  <span className="ml-3 text-slate-500 text-sm font-medium">$3.29 – $3.59 / sqft</span>
                </div>
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">BEST PERFORMANCE</span>
              </div>
              <div className="px-6 py-5">
                <p className="text-slate-600 text-sm mb-4">8mm–9mm SPC. 22–28mil wear layer. IXPE underpad included. Lifetime residential warranty. These floors are essentially indistinguishable from engineered hardwood underfoot — and they&apos;re permanently waterproof. Worth every penny in high-traffic areas and forever homes.</p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Example Product</p>
                  <p className="text-sm text-slate-700">
                    <Link href="/products/fulham-naf-aquaplus-platinum-9mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800 font-semibold">Fulham — NAF AquaPlus Platinum 9mm</Link>
                    {' '}— $3.49/sqft · 28mil wear layer · IXPE underpad included · Lifetime warranty
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-slate-700 text-sm">
              <strong>Not sure which tier fits your budget?</strong> Use our{' '}
              <Link href="/quote-calculator" className="text-amber-700 underline hover:text-amber-800">quote calculator</Link>{' '}
              to see total installed cost by room size — or{' '}
              <Link href="/free-measurement" className="text-amber-700 underline hover:text-amber-800">book a free measurement</Link>{' '}
              and we&apos;ll bring samples from each tier to your home.
            </p>
          </div>
        </section>

        {/* Section 8: Editor's Picks (NEW) */}
        <section id="editors-picks">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Editor&apos;s Top Vinyl Picks at BBS</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            These four products are our most-recommended vinyl floors — each selected for a specific type of buyer. All are 100% permanently waterproof, click-lock, and in stock at our Markham location.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Pick 1 */}
            <div className="border-2 border-slate-200 rounded-xl p-6 hover:border-amber-400 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-slate-700 text-white text-xs font-bold px-3 py-1 rounded-full">BEST BUDGET</span>
                <span className="text-amber-700 font-bold text-lg">$2.19/sqft</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">
                <Link href="/products/cliffside-falcon-floor-products-6mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Cliffside — Falcon Floors 6mm</Link>
              </h3>
              <p className="text-slate-500 text-xs font-semibold uppercase mb-3">Falcon Flooring · 6mm SPC · 12mil wear layer</p>
              <p className="text-slate-600 text-sm leading-relaxed">The most affordable SPC vinyl we carry — and it doesn&apos;t feel cheap. Solid click-lock, waterproof core, and a clean, neutral wood look that works in almost any space. Best for rental units, basements, and budget full-home renovations.</p>
              <Link href="/products/cliffside-falcon-floor-products-6mm-vinyl-flooring" className="mt-4 inline-block text-sm font-semibold text-amber-700 underline hover:text-amber-800">View Product →</Link>
            </div>

            {/* Pick 2 */}
            <div className="border-2 border-blue-200 rounded-xl p-6 hover:border-amber-400 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                <span className="text-amber-700 font-bold text-lg">$2.79/sqft</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">
                <Link href="/products/madagascar-naf-classic-7mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Madagascar — NAF Classic 7mm</Link>
              </h3>
              <p className="text-slate-500 text-xs font-semibold uppercase mb-3">NAF Flooring · 7mm SPC · 20mil wear layer</p>
              <p className="text-slate-600 text-sm leading-relaxed">Our best mid-range all-rounder. The NAF Classic 7mm hits the sweet spot of price, durability, and visual quality. 20mil wear layer handles everyday family life and pets. Installs beautifully in kitchens, living rooms, and open-concept main floors.</p>
              <Link href="/products/madagascar-naf-classic-7mm-vinyl-flooring" className="mt-4 inline-block text-sm font-semibold text-amber-700 underline hover:text-amber-800">View Product →</Link>
            </div>

            {/* Pick 3 */}
            <div className="border-2 border-amber-200 rounded-xl p-6 hover:border-amber-400 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">STATEMENT PICK</span>
                <span className="text-amber-700 font-bold text-lg">$2.79/sqft</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">
                <Link href="/products/h02-seaside-motel-woden-7mm-vinyl-herringbone-flooring" className="text-amber-700 underline hover:text-amber-800">H02 Seaside Motel — Woden Herringbone 7mm</Link>
              </h3>
              <p className="text-slate-500 text-xs font-semibold uppercase mb-3">Woden Flooring · 7mm SPC · 20mil wear layer · Herringbone</p>
              <p className="text-slate-600 text-sm leading-relaxed">For buyers who want something beyond the standard plank. Herringbone vinyl delivers a high-end, European aesthetic without the premium price. Popular in entryways, dining rooms, and main floors in newer GTA builds. Same 100% waterproof SPC core as the rest of our lineup.</p>
              <Link href="/products/h02-seaside-motel-woden-7mm-vinyl-herringbone-flooring" className="mt-4 inline-block text-sm font-semibold text-amber-700 underline hover:text-amber-800">View Product →</Link>
            </div>

            {/* Pick 4 */}
            <div className="border-2 border-emerald-200 rounded-xl p-6 hover:border-amber-400 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">BEST PREMIUM</span>
                <span className="text-amber-700 font-bold text-lg">$3.49/sqft</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">
                <Link href="/products/fulham-naf-aquaplus-platinum-9mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Fulham — NAF AquaPlus Platinum 9mm</Link>
              </h3>
              <p className="text-slate-500 text-xs font-semibold uppercase mb-3">NAF Flooring · 9mm SPC · 28mil wear layer · IXPE underpad</p>
              <p className="text-slate-600 text-sm leading-relaxed">The best vinyl floor we stock, full stop. 9mm thickness means a solid, hardwood-like feel. 28mil wear layer provides commercial-grade scratch resistance. Pre-attached IXPE underpad means no separate underlayment needed. Lifetime residential warranty. Choose this if you want vinyl that will outlast the house.</p>
              <Link href="/products/fulham-naf-aquaplus-platinum-9mm-vinyl-flooring" className="mt-4 inline-block text-sm font-semibold text-amber-700 underline hover:text-amber-800">View Product →</Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/vinyl-flooring" className="inline-block bg-slate-800 hover:bg-slate-900 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Browse All 233 Vinyl Products →
            </Link>
          </div>
        </section>

        {/* Section 9: Cost Breakdown */}
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

          <p className="text-slate-600 text-sm">
            Want a precise number before you commit?{' '}
            <Link href="/quote-calculator" className="text-amber-700 underline hover:text-amber-800">Try our quote calculator</Link>{' '}
            for a custom estimate, or{' '}
            <Link href="/free-measurement" className="text-amber-700 underline hover:text-amber-800">book a free in-home measurement</Link>{' '}
            for a firm quote with no obligation.
          </p>
        </section>

        {/* Section 10: Best Rooms */}
        <section id="best-rooms">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Best Rooms for Vinyl Flooring</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <h3 className="font-semibold text-emerald-800 text-lg mb-2">🏠 Basement ★★★★★</h3>
              <p className="text-slate-600 text-sm">The #1 choice. 100% permanently waterproof, handles temperature swings, installs over concrete. SPC with IXPE underpad is the gold standard for Ontario basements.</p>
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
              <p className="text-slate-600 text-sm">100% permanently waterproof means zero stress about washer leaks or drips. Budget SPC works perfectly here — no need for premium wear layers in a utility space.</p>
            </div>
          </div>
        </section>

        {/* Section 11: Installation */}
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

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
            <p className="text-slate-700 font-semibold mb-2">⏱ Timeline</p>
            <p className="text-slate-600 text-sm">From measurement to finished installation typically takes 5–10 business days, depending on material availability. Same-week installation is often available for in-stock products. No acclimatization period needed for vinyl (unlike hardwood, which requires 48–72 hours).</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/installation" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
              View Installation Details
            </Link>
            <Link href="/free-measurement" className="inline-flex items-center gap-2 border border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
              Book Free Measurement
            </Link>
          </div>
        </section>

        {/* Section 12: Vinyl vs Others */}
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

        {/* Section 13: FAQ (NEW) */}
        <section id="faq">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-3">
            {[
              [
                'What is the best vinyl flooring for a kitchen?',
                'SPC vinyl with a 20mil+ wear layer and attached IXPE underpad. The stone polymer composite core is permanently waterproof and handles the hard standing, dropped pots, and temperature changes a kitchen demands. At BBS, the Madagascar NAF Classic 7mm ($2.79/sqft) and the Fulham NAF AquaPlus Platinum 9mm ($3.49/sqft) are top kitchen choices.'
              ],
              [
                'Is SPC vinyl really 100% waterproof?',
                'Yes — permanently waterproof through every layer: wear layer, print layer, and stone polymer composite core. Unlike laminate (which has a wood-fibre HDF core that swells with moisture), SPC vinyl contains no wood fibre. Water can sit on it indefinitely without damage. This makes it ideal for basements, kitchens, bathrooms, and laundry rooms.'
              ],
              [
                'What thickness of vinyl flooring should I buy?',
                '6mm is the most popular choice for main-floor living. 7mm gives noticeably better underfoot feel and hides more subfloor imperfection. 9mm is worth it for premium installs where you want a hardwood-like feel. 4–5mm works for rental units and secondary spaces where budget is the priority. For basements with older concrete, stick to 6mm or thicker.'
              ],
              [
                'What is a wear layer and why does it matter?',
                'The wear layer is the clear protective surface on top of the print layer — measured in mils (thousandths of an inch). It\'s the single most important spec because it determines scratch resistance and longevity. 12mil = rental-grade (10–15 yr), 20mil = residential standard (20–25 yr), 28mil = premium/commercial (25–30+ yr). Never buy below 12mil for any living space.'
              ],
              [
                'How much does vinyl flooring cost installed in the GTA?',
                'At BBS: budget vinyl ($2.19/sqft material) + $2.00/sqft installation = ~$4.19/sqft total. A 500 sqft main floor runs $2,095–$2,795 depending on product tier. Mid-range (7mm, 20mil) comes in around $4.79/sqft all-in. Premium 9mm vinyl with installation is ~$5.49/sqft. Book a free measurement for your exact quote — no obligation.'
              ],
              [
                'Can you install vinyl flooring over existing flooring?',
                'Yes, in many cases. Vinyl can float over existing tile, hardwood, or vinyl as long as the surface is flat, firm, and less than 3/16" variation per 10 feet. Never install over carpet or soft surfaces. Height gain may affect door clearances. Our installers assess this during the free in-home measurement.'
              ],
              [
                'Does vinyl flooring feel hollow underfoot?',
                'Thinner vinyl (4–5mm) can sound hollow, especially over concrete. 6mm+ with attached IXPE underpad feels noticeably more solid. The Fulham NAF 9mm is often described by customers as indistinguishable from real wood underfoot. If hollow sound bothers you, choose 7mm or 9mm with built-in padding.'
              ],
              [
                'Is vinyl flooring good for homes with pets?',
                'Excellent choice. The 100% waterproof core handles accidents without swelling or warping. For households with large or multiple dogs, choose 20mil+ wear layer — a 22–28mil product won\'t show scratch marks from pet nails over years of use. Vinyl also cleans easily, which matters for pet owners.'
              ],
              [
                'Do I need underlayment with vinyl flooring?',
                'Many vinyl products now come with pre-attached IXPE or EVA underpad — check the product specs before buying separate underlayment. If there\'s no attached pad, use a 2mm foam underlayment with a built-in vapour barrier ($0.40–$0.80/sqft). On concrete subfloors especially, a vapour barrier layer protects the click-lock system long-term.'
              ],
              [
                'How long does vinyl flooring installation take?',
                'A 500 sqft room typically takes one day for a two-person crew. A full 1,000 sqft home takes 1–2 days depending on room complexity and transitions. No acclimatization period is needed for vinyl (hardwood requires 48–72 hours). From booking to finished install: typically 5–10 business days. Same-week availability for in-stock products.'
              ],
              [
                'Does BBS Flooring do vinyl flooring installation?',
                'Yes. Professional vinyl and LVP installation across the GTA at $2.00/sqft (all-inclusive — furniture moving, transitions, and trim). Our WSIB-insured installers have done thousands of vinyl installs in Markham, Scarborough, Richmond Hill, Ajax, and surrounding areas. Call (647) 428-1111 or book a free measurement online.'
              ],
            ].map(([q, a]) => (
              <details key={q} className="border border-slate-200 rounded-lg group">
                <summary className="p-4 cursor-pointer font-medium text-slate-800 hover:bg-slate-50 flex justify-between items-center">
                  {q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform ml-4 shrink-0">▼</span>
                </summary>
                <div className="px-4 pb-4 text-slate-600 leading-relaxed text-sm">{a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-slate-800 to-blue-900 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to See Vinyl In Person?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Visit our Markham showroom to touch and compare all 233 vinyl options. Or book a free measurement and we&apos;ll bring samples to your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Link href="/free-measurement" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Book Free Measurement
            </Link>
            <Link href="/vinyl-flooring" className="border-2 border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Browse 233 Vinyl Products
            </Link>
            <Link href="/quote-calculator" className="border-2 border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Get a Quick Quote
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
