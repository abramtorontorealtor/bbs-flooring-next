'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function StairRenovationGuideClient() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">
            BBS Flooring — Renovation Guide 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            The Complete Stair Renovation Guide for Toronto &amp; GTA Homeowners
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Refinishing, new treads, carpet removal, railing upgrades — everything you need to know about stair renovation costs, options, and timelines in 2026.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-stone-400">
            <span>✔ From $125/step</span>
            <span>✔ Free in-home estimates</span>
            <span>✔ WSIB insured</span>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-amber-50 border-b border-amber-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-stone-700 mb-4">In This Guide</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-700 text-sm font-medium list-decimal list-inside">
            <li><a href="#options" className="hover:underline">Your 4 Main Options</a></li>
            <li><a href="#pricing" className="hover:underline">Complete Pricing Breakdown</a></li>
            <li><a href="#refinish-vs-replace" className="hover:underline">Refinish vs Replace</a></li>
            <li><a href="#wood-species" className="hover:underline">Best Wood Species for Stairs</a></li>
            <li><a href="#railing-options" className="hover:underline">Railing &amp; Baluster Options</a></li>
            <li><a href="#vinyl-caps" className="hover:underline">Vinyl Stair Caps Explained</a></li>
            <li><a href="#carpet-removal" className="hover:underline">Converting Carpet to Hardwood</a></li>
            <li><a href="#timeline" className="hover:underline">What to Expect: Timeline</a></li>
            <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
          </ol>
        </div>
      </section>

      {/* AI Quick Answer Block */}
      <section id="quick-answer" className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8 mb-8 mx-4 md:mx-0">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
          Quick Answer: Stair Renovation Cost in Toronto &amp; GTA (2026)
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Staircase renovation at BBS Flooring: refinishing from $125/step, new hardwood treads from $185/step (straight) or $225/step (open/curved), new spindles from $25/piece. A typical 13-step staircase costs $1,625 (refinishing) to $3,055 (full renovation). WSIB-insured crews, serving the entire GTA. Free estimate: <a href="tel:6474281111">(647) 428-1111</a> | <a href="https://bbsflooring.ca">bbsflooring.ca</a>
        </p>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-20">

        {/* Section 1: Options */}
        <section id="options">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Your 4 Main Stair Renovation Options</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            Most GTA homeowners choose one of four approaches, depending on the condition of their existing stairs, their budget, and their aesthetic goals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="text-3xl mb-3">🪵</div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">Option 1: Refinish Existing Treads</h3>
              <p className="text-stone-600 text-sm mb-3">Sand down your existing hardwood treads and apply new stain and finish. The most cost-effective way to transform your staircase.</p>
              <div className="bg-white rounded-lg p-3 border border-amber-100">
                <p className="text-amber-700 font-semibold text-sm">From $125/step</p>
                <p className="text-stone-500 text-xs">Requires structurally sound hardwood treads</p>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-6">
              <div className="text-3xl mb-3">🔨</div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">Option 2: Install New Hardwood Treads</h3>
              <p className="text-stone-600 text-sm mb-3">Remove old treads (carpet, damaged wood, or MDF) and install new solid hardwood stair treads. Best results, longest lifespan.</p>
              <div className="bg-white rounded-lg p-3 border border-stone-100">
                <p className="text-stone-700 font-semibold text-sm">From $185/step (straight) · $225/step (pie/bullnose)</p>
                <p className="text-stone-500 text-xs">Works on any existing staircase structure</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">Option 3: Vinyl Stair Caps (Overlays)</h3>
              <p className="text-stone-600 text-sm mb-3">Waterproof vinyl overlays that fit directly over your existing treads. No demolition needed — fast, budget-friendly, matches your LVP flooring.</p>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-blue-700 font-semibold text-sm">Most budget-friendly option</p>
                <p className="text-stone-500 text-xs">Contact us for vinyl cap pricing</p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <div className="text-3xl mb-3">🏗️</div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">Option 4: Full Staircase Renovation</h3>
              <p className="text-stone-600 text-sm mb-3">New treads + new railings + new balusters/pickets. Complete transformation from dated colonial to modern open-riser or traditional custom design.</p>
              <div className="bg-white rounded-lg p-3 border border-emerald-100">
                <p className="text-emerald-700 font-semibold text-sm">$3,500–$6,000+ for full 13-step renovation</p>
                <p className="text-stone-500 text-xs">Includes treads, rails, pickets, and nosings</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Pricing */}
        <section id="pricing">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Complete Staircase Pricing Breakdown</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            All BBS Flooring stair pricing is per-item with no hidden fees. Here&apos;s the full menu:
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-stone-100">
                  <th className="text-left p-4 font-semibold text-stone-800 border-b-2 border-stone-300">Service</th>
                  <th className="text-center p-4 font-semibold text-stone-800 border-b-2 border-stone-300">Unit</th>
                  <th className="text-center p-4 font-semibold text-amber-700 border-b-2 border-stone-300">BBS Price</th>
                </tr>
              </thead>
              <tbody className="text-stone-600">
                <tr className="border-b bg-amber-50">
                  <td className="p-4 font-semibold text-stone-800">Stair Tread Refinishing (Sand &amp; Restain)</td>
                  <td className="p-4 text-center">per step</td>
                  <td className="p-4 text-center font-bold text-amber-700">$125</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">New Straight Stair Treads (Installed)</td>
                  <td className="p-4 text-center">per step</td>
                  <td className="p-4 text-center font-bold">$185</td>
                </tr>
                <tr className="border-b bg-stone-50">
                  <td className="p-4">New Pie / Triangle / Bullnose Steps</td>
                  <td className="p-4 text-center">per step</td>
                  <td className="p-4 text-center font-bold">$225</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Sand &amp; Restain Rails</td>
                  <td className="p-4 text-center">per linear foot</td>
                  <td className="p-4 text-center font-bold">$25</td>
                </tr>
                <tr className="border-b bg-stone-50">
                  <td className="p-4">New Iron or Wood Pickets (Installed with Material)</td>
                  <td className="p-4 text-center">per piece</td>
                  <td className="p-4 text-center font-bold">$25</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Stair Nosing Refinish (Sand &amp; Restain)</td>
                  <td className="p-4 text-center">per linear foot</td>
                  <td className="p-4 text-center font-bold">$25</td>
                </tr>
                <tr className="border-b bg-stone-50">
                  <td className="p-4">New Stair Nosing (Installed)</td>
                  <td className="p-4 text-center">per linear foot</td>
                  <td className="p-4 text-center font-bold">$30</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">📊 Sample Project Estimates</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-stone-200 pb-3">
                <div>
                  <p className="font-semibold text-stone-800">Refinish 13-step staircase (sand, stain, rails + nosing)</p>
                  <p className="text-stone-500 text-sm">13 steps × $125 + ~8 lf rails × $25 + ~8 lf nosing × $25</p>
                </div>
                <span className="font-bold text-amber-700 shrink-0 ml-4">~$2,025–$2,500</span>
              </div>
              <div className="flex justify-between items-start border-b border-stone-200 pb-3">
                <div>
                  <p className="font-semibold text-stone-800">New treads — 13-step carpet-to-hardwood conversion</p>
                  <p className="text-stone-500 text-sm">13 steps × $185 + carpet removal + nosings</p>
                </div>
                <span className="font-bold text-amber-700 shrink-0 ml-4">~$2,700–$3,200</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-stone-800">Full renovation — new treads + iron pickets + new rail</p>
                  <p className="text-stone-500 text-sm">13 treads × $185 + 39 pickets × $25 + rail materials</p>
                </div>
                <span className="font-bold text-amber-700 shrink-0 ml-4">~$4,500–$6,000</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 text-sm"><span className="font-semibold">Note:</span> Estimates above assume standard-width straight treads. Wider treads, pie steps, and open-riser designs add cost. All pricing includes labour and standard materials — no hidden fees. Carpet removal on stairs is quoted separately.</p>
          </div>
        </section>

        {/* Section 3: Refinish vs Replace */}
        <section id="refinish-vs-replace">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Refinish vs Replace: Which Is Right for You?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-emerald-800 mb-4">✅ Refinish If...</h3>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li className="flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>Your existing treads are solid hardwood (tap-test — they sound solid, not hollow)</li>
                <li className="flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>The treads are structurally sound (no cracks, warping, or rot)</li>
                <li className="flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>Surface damage is cosmetic — scratches, worn finish, light dents</li>
                <li className="flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>The treads are thick enough to sand (at least ¾&quot; before sanding)</li>
                <li className="flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>You want to save 30–40% vs full replacement</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-amber-800 mb-4">🔄 Replace If...</h3>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>Treads are carpet-covered and you don&apos;t know what&apos;s underneath</li>
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>Existing treads are MDF, particleboard, or composite</li>
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>Treads have deep gouges, structural cracks, or are too thin to sand</li>
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>You want a different wood species (e.g., pine stairs → white oak)</li>
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>You want wider treads for a more open, modern look</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="text-blue-800 font-semibold mb-2">💡 Pro Tip: The Carpet Mystery</p>
            <p className="text-blue-700 text-sm">If your stairs are carpeted, you won&apos;t know what&apos;s underneath until the carpet comes off. In our experience across hundreds of Markham and Toronto homes, about 60% of carpeted stairs have acceptable hardwood treads underneath — refinishable at $125/step. The other 40% have MDF or damaged wood that needs replacement. Our free in-home estimate includes peeling back a corner of carpet to check before you commit.</p>
          </div>
        </section>

        {/* Section 4: Wood Species */}
        <section id="wood-species">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Best Wood Species for Stair Treads</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            Stairs take more concentrated traffic and impact than floors. Species choice matters more here than anywhere else in the house.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-stone-100">
                  <th className="text-left p-3 font-semibold text-stone-800 border-b-2 border-stone-300">Species</th>
                  <th className="text-center p-3 font-semibold text-stone-800 border-b-2 border-stone-300">Janka Hardness</th>
                  <th className="text-left p-3 font-semibold text-stone-800 border-b-2 border-stone-300">Stain Options</th>
                  <th className="text-left p-3 font-semibold text-stone-800 border-b-2 border-stone-300">Best For</th>
                </tr>
              </thead>
              <tbody className="text-stone-600">
                <tr className="border-b bg-amber-50"><td className="p-3 font-semibold">White Oak ⭐</td><td className="p-3 text-center">1,360 lbf</td><td className="p-3">All stains, esp. grey/brown tones</td><td className="p-3">Modern homes, open-riser designs, matching current floors</td></tr>
                <tr className="border-b"><td className="p-3 font-semibold">Hickory</td><td className="p-3 text-center">1,820 lbf</td><td className="p-3">Natural/light stains only (strong grain)</td><td className="p-3">Maximum durability, rustic/organic aesthetics</td></tr>
                <tr className="border-b bg-stone-50"><td className="p-3 font-semibold">Hard Maple</td><td className="p-3 text-center">1,450 lbf</td><td className="p-3">Light/blonde, contemporary stains</td><td className="p-3">Scandinavian/modern interiors, light colour palettes</td></tr>
                <tr className="border-b"><td className="p-3 font-semibold">Red Oak</td><td className="p-3 text-center">1,290 lbf</td><td className="p-3">Traditional warm tones, most stains</td><td className="p-3">Budget-conscious, traditional interiors, classic look</td></tr>
                <tr><td className="p-3 font-semibold">Walnut</td><td className="p-3 text-center">1,010 lbf</td><td className="p-3">Natural walnut (rarely stained)</td><td className="p-3">Luxury aesthetics — use only in low-traffic areas</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
            <p className="text-stone-800 font-semibold mb-2">Our Recommendation</p>
            <p className="text-stone-600 text-sm">White oak dominates 2026 GTA renovation projects — it&apos;s hard enough for stair traffic, takes the full range of modern stains (especially the popular grey-brown tones), and matches the majority of current hardwood floor species. If you have red oak floors, we recommend red oak treads for consistency. Hickory is the choice when you have large dogs or extremely heavy traffic.</p>
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-stone-800 font-semibold mb-2">🎯 Match Your Stairs to Your Floors</p>
            <p className="text-stone-600 text-sm">Doing stairs and flooring together? Choose stair treads in the same species as your new floors for a seamless transition. Popular combinations at BBS: <Link href="/products/arizona-naf-elegant-collection-7-1-2-oak-engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">NAF Elegant Oak floors</Link> with matching white oak treads, or <Link href="/products/blizzard-woden-vermont-6-1-2-oak-engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Woden Vermont Oak</Link> paired with custom-stained treads. Browse our full <Link href="/engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">engineered hardwood collection</Link> or <Link href="/solid-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">solid hardwood options</Link> to find your match.</p>
          </div>
        </section>

        {/* Section 5: Railing Options */}
        <section id="railing-options">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Railing &amp; Baluster Options</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            The railing system makes as much visual impact as the treads. Here&apos;s what we offer:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
              <h3 className="font-bold text-stone-800 mb-2">🔩 Iron / Metal Pickets</h3>
              <p className="text-stone-600 text-sm mb-3">The dominant choice in 2026. Thinner profile opens up the staircase visually, zero maintenance (no refinishing ever), available in matte black, brushed nickel, oil-rubbed bronze. Straight, twisted, or basket designs.</p>
              <p className="text-amber-700 font-semibold text-sm">$25/piece installed (includes material)</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
              <h3 className="font-bold text-stone-800 mb-2">🪵 Wood Balusters</h3>
              <p className="text-stone-600 text-sm mb-3">Classic and traditional. Available in square, turned (colonial), and craftsman styles. Painted white is the most common finish. Match or contrast with your tread species. Require refinishing every 10–15 years.</p>
              <p className="text-amber-700 font-semibold text-sm">$25/piece installed (includes material)</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
              <h3 className="font-bold text-stone-800 mb-2">🪟 Glass Panels</h3>
              <p className="text-stone-600 text-sm mb-3">Frameless or framed tempered glass panels create a sleek, ultra-modern look with maximum light flow. Popular in contemporary and luxury renovations. Requires custom fabrication — lead time applies.</p>
              <p className="text-stone-500 text-sm italic">Custom quote required</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
              <h3 className="font-bold text-stone-800 mb-2">🔄 Handrail Refinishing</h3>
              <p className="text-stone-600 text-sm mb-3">If your existing handrail is solid wood in good condition, refinishing (sand, stain, new finish coat) is often the best bang-for-buck upgrade. Takes 1 day, dramatically refreshes the look.</p>
              <p className="text-amber-700 font-semibold text-sm">$25/linear foot</p>
            </div>
          </div>
        </section>

        {/* Section 6: Vinyl Caps */}
        <section id="vinyl-caps">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Vinyl Stair Caps: The Budget-Friendly Option</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            Vinyl stair caps (also called stair covers or overlays) fit directly over your existing treads without any demolition. They&apos;re the fastest and most affordable way to upgrade carpeted or worn stairs — especially when you&apos;re doing a full vinyl plank installation throughout the home.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">💧</div>
              <p className="font-semibold text-blue-800 mb-1">100% Waterproof</p>
              <p className="text-stone-600 text-sm">Same waterproof performance as your LVP floors — ideal for pet households</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">🎨</div>
              <p className="font-semibold text-blue-800 mb-1">Colour-Matched</p>
              <p className="text-stone-600 text-sm">Available in coordinating colours that match your vinyl plank flooring for a seamless look</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">⚡</div>
              <p className="font-semibold text-blue-800 mb-1">Fast Installation</p>
              <p className="text-stone-600 text-sm">No demolition, no subfloor prep — most staircases done in a single day</p>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
            <p className="text-stone-800 font-semibold mb-2">When Vinyl Caps Make Sense</p>
            <ul className="space-y-2 text-stone-600 text-sm">
              <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>You&apos;re installing vinyl plank throughout and want a matching staircase</li>
              <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>Budget is the primary concern and hardwood is not a priority</li>
              <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>You have pets and want a fully waterproof staircase solution</li>
              <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>The existing tread structure is solid but cosmetically worn</li>
              <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>Rental property renovation — maximum durability, minimum cost</li>
            </ul>
            <p className="text-stone-600 text-sm mt-4">Considering vinyl for the whole project? Match your stair caps to your <Link href="/vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">vinyl plank flooring</Link> — options like the <Link href="/products/fulham-naf-aquaplus-platinum-9mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">NAF AquaPlus Platinum</Link> ($3.49/sqft) or budget-friendly <Link href="/products/cliffside-falcon-floor-products-6mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Falcon 6mm</Link> ($2.19/sqft) have coordinating stair cap options.</p>
          </div>
        </section>

        {/* Section 7: Carpet Removal */}
        <section id="carpet-removal">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Converting Carpet Stairs to Hardwood: The Full Process</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            Carpet-to-hardwood stair conversion is one of our most popular projects — and for good reason. The transformation is dramatic, and the result lasts decades instead of years.
          </p>

          <div className="space-y-4 mb-8">
            {[
              { step: '1', title: 'Free In-Home Assessment', desc: 'We peel back a corner of carpet to check what\'s underneath before you commit. About 60% of carpeted stairs in GTA homes have usable hardwood treads — meaning you qualify for refinishing at $125/step instead of new treads at $185/step. We\'ll tell you upfront.' },
              { step: '2', title: 'Carpet & Tack Strip Removal', desc: 'We remove all carpet, padding, tack strips, and staples from every step. This is billed separately from the tread work.' },
              { step: '3', title: 'Subfloor Assessment', desc: 'If existing treads are usable → refinish (sand, stain, finish). If treads are MDF or damaged → install new solid hardwood treads.' },
              { step: '4', title: 'Tread Work (Refinish or Install)', desc: 'Refinishing: 2–3 sand passes, stain, 2–3 finish coats. New treads: cut to width, fasten securely, fill nail holes, finish with matching stain and sealer.' },
              { step: '5', title: 'Risers, Nosings & Transitions', desc: 'New risers (painted white is standard), nosing installation or refinishing, and all transition pieces to connect the staircase to adjacent flooring.' },
              { step: '6', title: 'Optional: Railing Upgrade', desc: 'While we have the staircase open, many clients add new iron pickets or handrail refinishing. Cost-effective to combine with tread work — one visit, one disruption.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">{step}</div>
                <div>
                  <p className="font-semibold text-stone-800">{title}</p>
                  <p className="text-stone-600 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 8: Timeline */}
        <section id="timeline">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">What to Expect: Project Timeline</h2>

          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-stone-100">
                  <th className="text-left p-3 font-semibold text-stone-800 border-b-2 border-stone-300">Project Type</th>
                  <th className="text-center p-3 font-semibold text-stone-800 border-b-2 border-stone-300">Duration</th>
                  <th className="text-left p-3 font-semibold text-stone-800 border-b-2 border-stone-300">Walkable After</th>
                </tr>
              </thead>
              <tbody className="text-stone-600">
                <tr className="border-b"><td className="p-3 font-medium">Refinish only (sand + stain + finish)</td><td className="p-3 text-center">2–3 days</td><td className="p-3">Socks OK after 24 hrs; shoes after 48–72 hrs</td></tr>
                <tr className="border-b bg-stone-50"><td className="p-3 font-medium">New treads (straight staircase)</td><td className="p-3 text-center">1–2 days</td><td className="p-3">Following day with care</td></tr>
                <tr className="border-b"><td className="p-3 font-medium">Vinyl stair caps</td><td className="p-3 text-center">1 day</td><td className="p-3">Same day</td></tr>
                <tr className="border-b bg-stone-50"><td className="p-3 font-medium">Full renovation (treads + rails + pickets)</td><td className="p-3 text-center">3–5 days</td><td className="p-3">2–3 days for tread portions</td></tr>
                <tr><td className="p-3 font-medium">Carpet removal + new treads + rail upgrade</td><td className="p-3 text-center">4–6 days</td><td className="p-3">Day 2–3 for treads; day 4–5 for full use</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="text-blue-800 font-semibold mb-2">📅 Booking &amp; Lead Time</p>
            <p className="text-blue-700 text-sm">From initial contact to project start is typically 7–14 days depending on season. Spring (April–June) is our busiest period — book early for summer timelines. Free in-home estimates are available within 2–3 business days of your call.</p>
          </div>

          {/* Combo savings */}
          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <p className="text-emerald-800 font-semibold mb-2">💰 Save by Combining Projects</p>
            <p className="text-emerald-700 text-sm">Most GTA homeowners who do stairs also do at least one room of flooring. Combining stair renovation with a <Link href="/installation" className="text-amber-700 underline hover:text-amber-800">flooring installation project</Link> saves you a second mobilization fee and often gets you into a faster timeline. Use our <Link href="/quote-calculator" className="text-amber-700 underline hover:text-amber-800">quote calculator</Link> to estimate your combined project cost, or <Link href="/free-measurement" className="text-amber-700 underline hover:text-amber-800">book a free measurement</Link> for an exact quote covering everything.</p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              { q: 'How much does a staircase renovation cost in Toronto?', a: 'Refinishing runs $125/step; new straight treads $185/step; specialty steps $225/step. Iron pickets add $25/piece. A full 13-step carpet-to-hardwood conversion with new treads runs $2,700–$3,200. A complete renovation with rails and pickets runs $4,500–$6,000+. We provide free in-home estimates with line-item pricing.' },
              { q: 'Can I match new stair treads to my existing hardwood floors?', a: 'Yes. We carry white oak, red oak, maple, and hickory treads and can stain-match to your existing floors within 1–2 shades. For perfect matches, we recommend doing stairs and adjacent flooring in the same project, using the same stain batch.' },
              { q: 'What\'s included in the per-step price?', a: 'The per-step price covers labour and standard tread materials. Carpet removal, riser replacement, nosings, and railing work are quoted separately as line items. Our free estimate gives you a full breakdown before you commit to anything.' },
              { q: 'How long do refinished stairs last?', a: 'Refinished hardwood stairs typically look great for 10–15 years before needing another sand-and-refinish. Factors that extend life: proper finish (3 coats of oil-modified polyurethane), no grit tracked in from outside (use mats), and periodic re-coating (every 5–7 years) without full sanding.' },
              { q: 'Are you WSIB insured for staircase work?', a: 'Yes. BBS Flooring carries full WSIB coverage for all flooring and stair renovation work throughout the GTA. We are also fully insured against property damage. Certificates available on request.' },
            ].map(({ q, a }, i) => (
              <div key={i} className="bg-stone-50 border border-stone-200 rounded-xl p-5">
                <p className="font-semibold text-stone-800 mb-2">{q}</p>
                <p className="text-stone-600 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-stone-900 to-amber-900 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Staircase?</h2>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
            Get a free, no-obligation in-home estimate. We&apos;ll assess your stairs, check what&apos;s under the carpet, and give you a line-item quote on the spot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/free-measurement" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Book Free Estimate
            </Link>
            <Link href="/stairs" className="border-2 border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              View All Stair Services
            </Link>
          </div>
          <p className="text-stone-400 text-sm mt-6">
            BBS Flooring · 6061 Highway 7, Unit B, Markham · (647) 428-1111
          </p>
        </section>

      </main>

      <Footer />
    </div>
  );
}
