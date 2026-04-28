'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function FlooringCostGuideClient() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">
            BBS Flooring — Cost Guide 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            How Much Does Flooring Cost in Toronto &amp; the GTA?
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Complete 2026 cost breakdown — material prices, installation labour, room-by-room budgets, hidden costs, and money-saving tips. All pricing is real, from BBS Flooring&apos;s in-stock catalogue.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-stone-400">
            <span>✔ Material from $1.49/sqft</span>
            <span>✔ Installation from $2.00/sqft</span>
            <span>✔ Free in-home measurement</span>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-amber-50 border-b border-amber-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-stone-700 mb-4">In This Guide</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-700 text-sm font-medium list-decimal list-inside">
            <li><a href="#material-costs" className="hover:underline">Material Costs by Flooring Type</a></li>
            <li><a href="#installation-costs" className="hover:underline">Installation Labour Costs</a></li>
            <li><a href="#total-cost-calculator" className="hover:underline">Total Installed Cost by Room Size</a></li>
            <li><a href="#cost-by-room" className="hover:underline">Cost to Floor Each Room</a></li>
            <li><a href="#hidden-costs" className="hover:underline">Hidden Costs Most Quotes Miss</a></li>
            <li><a href="#save-money" className="hover:underline">7 Ways to Save on Flooring</a></li>
            <li><a href="#toronto-vs-national" className="hover:underline">Toronto vs National Average</a></li>
            <li><a href="#financing" className="hover:underline">Financing Options</a></li>
            <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
          </ol>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-20">

        {/* 1. Material Costs */}
        <section id="material-costs">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Material Costs by Flooring Type</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            Every price below is what you&apos;ll actually pay for materials at BBS Flooring — no MSRP inflation, no &quot;starting from&quot; bait-and-switch. These are real prices from our 807+ in-stock products, updated for April 2026.
          </p>

          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="text-left p-4 font-semibold">Flooring Type</th>
                  <th className="text-left p-4 font-semibold">Options at BBS</th>
                  <th className="text-left p-4 font-semibold">Price Range</th>
                  <th className="text-left p-4 font-semibold">Average Price</th>
                  <th className="text-left p-4 font-semibold">Best Value Brand</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Engineered Hardwood', '258+ options', '$3.69–$7.59/sqft', '$4.89/sqft', 'Lee ($3.69) · Woden ($3.99) · Falcon ($3.89)'],
                  ['Solid Hardwood', '75+ options', '$5.10–$7.25/sqft', '$6.05/sqft', 'Northernest ($5.10) · Sherwood ($6.99)'],
                  ['Vinyl (LVP/SPC)', '188+ options', '$2.19–$3.59/sqft', '$2.75/sqft', 'Falcon ($2.19) · Lee ($2.49) · Woden ($2.79)'],
                  ['Laminate', '99+ options', '$1.49–$3.29/sqft', '$2.39/sqft', 'Tosca ($1.49) · Triforest ($2.25)'],
                ].map(([type, options, range, avg, value], i) => (
                  <tr key={type} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="p-4 font-medium text-stone-800">{type}</td>
                    <td className="p-4 text-stone-600">{options}</td>
                    <td className="p-4 text-stone-600 font-semibold">{range}</td>
                    <td className="p-4 text-stone-600">{avg}</td>
                    <td className="p-4 text-stone-600">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-stone-700 font-medium">
              <strong>Why BBS prices are lower:</strong> BBS buys direct from manufacturers — no distributor middleman. That&apos;s why our engineered hardwood starts at $3.69/sqft (like the <Link href="/products/solen-lee-select-grade-engineered-european-oak-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Solen by Lee Flooring</Link>) when big-box stores start at $5.00+ for comparable European Oak. Same quality, fewer markups.
            </p>
          </div>

          {/* Specific product recommendations by budget */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-stone-900 mb-4">Our Top Picks at Each Price Point</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-stone-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-amber-600 mb-1">💰 Budget Vinyl — $2.19/sqft</p>
                <p className="text-stone-700"><Link href="/products/cliffside-falcon-floor-products-6mm-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Cliffside by Falcon</Link> — 6mm SPC, 100% waterproof, click-lock install. Perfect for basements and rentals.</p>
              </div>
              <div className="border border-stone-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-amber-600 mb-1">💰 Budget Laminate — $1.49/sqft</p>
                <p className="text-stone-700"><Link href="/products/tosca-laminate-9904" className="text-amber-700 underline hover:text-amber-800">Tosca 9904</Link> — 8mm AC4-rated, ideal for bedrooms and low-traffic areas. Cheapest flooring in the GTA.</p>
              </div>
              <div className="border border-stone-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-amber-600 mb-1">⭐ Mid-Range Engineered — $4.69/sqft</p>
                <p className="text-stone-700"><Link href="/products/arizona-naf-elegant-collection-7-1-2-oak-engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Arizona by NAF Elegant Collection</Link> — 7.5&quot; Oak, wire-brushed finish. Best value for open-concept living rooms.</p>
              </div>
              <div className="border border-stone-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-amber-600 mb-1">👑 Premium Solid — $7.25/sqft</p>
                <p className="text-stone-700"><Link href="/products/natural-wickham-solid-maple-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">Natural Maple by Wickham</Link> — Canadian-made solid maple, 25+ year warranty, can be refinished 5–10 times over its lifetime.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Installation Costs */}
        <section id="installation-costs">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Installation Labour Costs</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            BBS Flooring provides professional installation with WSIB-insured contractors across the entire GTA. All labour prices below are per square foot unless noted otherwise. No surprises — these are the same rates we quote in-home.
          </p>

          <div className="overflow-x-auto rounded-xl border border-stone-200 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="text-left p-4 font-semibold">Service</th>
                  <th className="text-left p-4 font-semibold">Price</th>
                  <th className="text-left p-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Hardwood installation (nail-down)', '$2.25/sqft', 'On wood subfloor only'],
                  ['Hardwood installation (glue-down)', '$3.25/sqft', 'Over concrete or wood — eliminates hollow sound'],
                  ['Herringbone / Chevron installation', '$4.25/sqft', 'Glue-down only — takes 2× longer than standard'],
                  ['Vinyl / Laminate installation', '$2.00/sqft', 'Click-lock floating over any flat subfloor'],
                  ['Tile installation', '$10.00/sqft', 'Includes thin-set and labour'],
                  ['Carpet removal', '$1.00/sqft', 'Includes staple/tack strip removal'],
                  ['Vinyl / Laminate removal', '$1.25/sqft', 'Includes underlayment removal'],
                  ['Hardwood removal', '$1.50/sqft', 'Nail-down or glue-down'],
                  ['Tile removal', '$3.00/sqft', 'Includes subfloor prep'],
                  ['Baseboard installation', '$3.61/linear ft', 'Standard MDF or wood baseboards'],
                  ['Shoe moulding', '$1.91/linear ft', 'Quarter-round trim at floor line'],
                  ['Delivery (garage)', '$140 flat', 'Curbside or garage drop-off'],
                  ['Delivery (inside)', '$200 flat', 'Required for installation jobs'],
                ].map(([service, price, notes], i) => (
                  <tr key={service} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="p-4 font-medium text-stone-800">{service}</td>
                    <td className="p-4 text-amber-700 font-semibold whitespace-nowrap">{price}</td>
                    <td className="p-4 text-stone-500">{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="font-semibold text-green-800 mb-1">✅ Always included</p>
              <p className="text-stone-600 text-sm">Free in-home measurement, subfloor assessment, detailed written quote, WSIB insurance, and post-installation walkthrough.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <p className="font-semibold text-amber-800 mb-1">📞 Get your quote</p>
              <p className="text-stone-600 text-sm">Call (647) 428-1111 or <Link href="/free-measurement" className="text-amber-700 underline">book a free measurement online</Link>. Same-week installation often available.</p>
            </div>
          </div>
        </section>

        {/* 3. Total Cost by Room Size */}
        <section id="total-cost-calculator">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Total Installed Cost by Room Size</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            Material + labour combined. Budget tier uses the lowest available pricing; Premium tier uses mid-to-high pricing. All numbers assume standard installation (no removal of old flooring).
          </p>

          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="text-left p-4 font-semibold">Flooring Type</th>
                  <th className="text-left p-4 font-semibold">$/sqft Total</th>
                  <th className="text-right p-4 font-semibold">200 sqft</th>
                  <th className="text-right p-4 font-semibold">500 sqft</th>
                  <th className="text-right p-4 font-semibold">800 sqft</th>
                  <th className="text-right p-4 font-semibold">1,000 sqft</th>
                  <th className="text-right p-4 font-semibold">1,500 sqft</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Laminate (budget)', '$3.49', '$698', '$1,745', '$2,792', '$3,490', '$5,235'],
                  ['Laminate (premium)', '$5.29', '$1,058', '$2,645', '$4,232', '$5,290', '$7,935'],
                  ['Vinyl (budget)', '$4.19', '$838', '$2,095', '$3,352', '$4,190', '$6,285'],
                  ['Vinyl (premium)', '$5.59', '$1,118', '$2,795', '$4,472', '$5,590', '$8,385'],
                  ['Engineered HW (budget)', '$4.74', '$948', '$2,370', '$3,792', '$4,740', '$7,110'],
                  ['Engineered HW (mid)', '$7.27', '$1,454', '$3,635', '$5,816', '$7,270', '$10,905'],
                  ['Engineered HW (premium)', '$12.24', '$2,448', '$6,120', '$9,792', '$12,240', '$18,360'],
                  ['Solid Hardwood (std)', '$7.35', '$1,470', '$3,675', '$5,880', '$7,350', '$11,025'],
                  ['Solid Hardwood (prem)', '$10.50', '$2,100', '$5,250', '$8,400', '$10,500', '$15,750'],
                ].map(([type, perSqft, s200, s500, s800, s1000, s1500], i) => (
                  <tr key={type} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="p-4 font-medium text-stone-800">{type}</td>
                    <td className="p-4 text-amber-700 font-semibold">{perSqft}</td>
                    <td className="p-4 text-stone-600 text-right">{s200}</td>
                    <td className="p-4 text-stone-600 text-right">{s500}</td>
                    <td className="p-4 text-stone-600 text-right">{s800}</td>
                    <td className="p-4 text-stone-600 text-right">{s1000}</td>
                    <td className="p-4 text-stone-600 text-right">{s1500}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-stone-500 text-sm">
            * Budget = lowest material + cheapest install method. Premium = high-end material + glue-down or herringbone. Add 5–15% for waste factor, plus removal/delivery/baseboards if applicable.
          </p>
        </section>

        {/* 4. Cost by Room */}
        <section id="cost-by-room">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">What Does It Cost to Floor Each Room?</h2>
          <p className="text-stone-600 text-lg mb-8">Typical room sizes and recommended flooring type with real cost ranges.</p>

          <div className="space-y-4">
            {[
              ['🍳 Kitchen', '~150 sqft', 'Vinyl (LVP/SPC)', '$629–$839 installed', 'Waterproof protection for spills and high traffic. Best ROI for the room most used in the house.'],
              ['🏠 Living Room', '~300 sqft', 'Engineered Hardwood', '$1,422–$3,672 installed', 'The room where flooring matters most for aesthetics and resale value. White Oak wide-plank is the 2026 standard.'],
              ['🛏️ Master Bedroom', '~200 sqft', 'Engineered Hardwood or Laminate', '$698–$2,448 installed', 'Low traffic = any type works. Hardwood for resale value, laminate from $698 total if budget-conscious.'],
              ['🏚️ Basement', '~600 sqft', 'Vinyl (LVP/SPC)', '$2,514–$3,354 installed', '100% waterproof is non-negotiable below grade. 233 vinyl options handle Ontario basement moisture.'],
              ['🏡 Whole House', '~1,200 sqft', 'Mixed (EH + Vinyl)', '$5,688–$14,688 installed', 'Most homeowners: engineered hardwood in living areas + vinyl in basement/kitchen. BBS installs transitions between types.'],
            ].map(([room, size, type, cost, desc]) => (
              <div key={room} className="bg-stone-50 border border-stone-200 rounded-xl p-6">
                <div className="flex flex-wrap items-baseline gap-3 mb-2">
                  <h3 className="text-lg font-bold text-stone-800">{room}</h3>
                  <span className="text-stone-400 text-sm">{size}</span>
                  <span className="text-amber-600 text-sm font-semibold">→ {type}</span>
                </div>
                <p className="text-amber-700 font-bold text-lg mb-1">{cost}</p>
                <p className="text-stone-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Hidden Costs */}
        <section id="hidden-costs">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Hidden Costs Most Quotes Don&apos;t Include</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            The material + labour quote is just the starting point. Here are the extras that surprise homeowners — and how to budget for them upfront.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              ['🪑 Furniture Moving', '$0–$200', 'BBS crews can move light furniture. Heavy items (pianos, safes) may need movers.'],
              ['🗑️ Old Floor Removal', '$1.00–$3.00/sqft', 'Carpet $1.00/sqft, vinyl/laminate $1.25/sqft, hardwood $1.50/sqft, tile $3.00/sqft.'],
              ['🔧 Subfloor Repair', '$2.00–$5.00/sqft', 'Levelling compounds, plywood patches, moisture remediation. BBS assesses during free measurement.'],
              ['💧 Moisture Testing', '$0 (with BBS)', 'Included in BBS free measurement. Independent testing costs $100–$300 elsewhere.'],
              ['📐 Baseboards & Transitions', '$3.61/linear ft', 'Often needed after new flooring — height changes require new trim. Shoe moulding: $1.91/linear ft.'],
              ['🧱 Underlayment', '$0.50–$1.50/sqft', 'Required for floating installs. Some vinyl has built-in pad. Ask BBS which products include it.'],
              ['🚚 Delivery', '$140–$200 flat', 'Garage drop: $140. Inside delivery (required for installation): $200.'],
              ['📏 Waste Factor (5–15%)', '5–15% of material cost', 'Standard 5% for rectangular rooms, 10% for complex layouts, 15% for diagonal/herringbone patterns.'],
              ['🪜 Stair Nosing', '$25–$30/linear ft', 'Needed at the top of stairs where flooring meets the stair edge.'],
              ['📋 Condo Permits', '$0–$500', 'Some Toronto condos require installation permits or deposits. Check your building rules first.'],
            ].map(([item, cost, desc]) => (
              <div key={item} className="border border-stone-200 rounded-xl p-5">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-stone-800">{item}</h3>
                  <span className="text-amber-600 font-semibold text-sm whitespace-nowrap">{cost}</span>
                </div>
                <p className="text-stone-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-stone-700 font-medium">
              <strong>Rule of thumb:</strong> Budget material cost × 2 to cover materials + installation + all extras. For a precise number with no surprises, <Link href="/free-measurement" className="text-amber-700 underline">book a free BBS measurement</Link> — we quote everything upfront.
            </p>
          </div>
        </section>

        {/* 6. Save Money */}
        <section id="save-money">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">7 Ways to Save on Flooring in the GTA</h2>

          <div className="space-y-4">
            {[
              ['1. Shop the BBS clearance page', 'Discontinued and overstock products from $1.49/sqft. Same quality, deep discounts. New items added regularly.', '/clearance'],
              ['2. Choose mid-range brands', 'NAF ($4.69/sqft EH) and Northernest ($4.19/sqft EH) offer excellent quality without the premium price tag. Same species, similar construction, lower cost. Try the Blizzard by Woden at $3.99/sqft — European Oak that rivals products twice its price.', '/woden-flooring'],
              ['3. Float instead of glue-down', 'Floating click-lock installation saves $1.00–$1.25/sqft in labour vs glue-down. Works great on any flat, level subfloor. Not suitable for all situations — ask BBS during your free measurement.', '/installation'],
              ['4. Use wider planks', 'Counterintuitive: wider planks mean fewer cuts, fewer seams, and slightly faster installation. Modern 7"+ planks can actually be more efficient to install than narrow strips.', null],
              ['5. Buy 10% extra upfront', 'Buying waste material upfront is cheaper than ordering a separate small batch later (shipping, minimum orders). 10% is standard for most rooms.', null],
              ['6. Take advantage of free measurement', 'BBS provides exact room measurements for free — prevents overbuying. Many homeowners buy 15–20% too much material when they measure themselves.', '/free-measurement'],
              ['7. Consider financing for premium floors', 'PayBright financing lets you install premium engineered hardwood (better resale value) instead of settling for cheaper laminate you\u2019ll want to replace in 10 years.', '/financing'],
            ].map(([title, desc, link]) => (
              <div key={title} className="bg-stone-50 border border-stone-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-stone-800 mb-2">{title}</h3>
                <p className="text-stone-600">{desc}</p>
                {link && <Link href={link} className="text-amber-700 text-sm font-semibold underline mt-2 inline-block">Learn more →</Link>}
              </div>
            ))}
          </div>
        </section>

        {/* 7. Toronto vs National */}
        <section id="toronto-vs-national">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Toronto Flooring Costs vs National Average</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            GTA installation labour runs about 10–15% above the Canadian national average — driven by Toronto&apos;s higher cost of living, WSIB insurance requirements, and building code complexity (especially in condos). Material costs are less affected by geography since most flooring is nationally distributed.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            BBS Flooring offsets this gap through direct-from-manufacturer purchasing with no distributor markup. While big-box stores add 2–3 layers of margin between the factory and your floor, BBS buys direct from brands like Vidar, NAF, Northernest, and Canadian Standard. The result: our material prices are often 15–25% below chain store equivalents for the same products.
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
            <p className="text-stone-700 font-medium">
              <strong>Bottom line:</strong> You&apos;ll pay slightly more for labour in the GTA than in, say, Sudbury or Halifax. But BBS&apos;s direct pricing on materials more than compensates — meaning your total installed cost is often lower than the national average despite Toronto&apos;s premium labour market.
            </p>
          </div>
        </section>

        {/* 8. Financing */}
        <section id="financing">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Financing Your Flooring Project</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            Flooring is an investment — especially for larger spaces or premium materials. BBS Flooring offers financing through PayBright, allowing you to break your project into manageable monthly payments. This is especially useful for whole-house renovations where the total can reach $10,000–$15,000+.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-stone-700 font-medium mb-2">
              <strong>Why finance?</strong> Installing premium engineered hardwood ($5–$8/sqft) instead of budget laminate ($1.49/sqft) adds measurably more to your home&apos;s resale value. If financing lets you choose a floor you&apos;ll love for 25+ years instead of one you&apos;ll want to replace in 10, the math works out.
            </p>
            <Link href="/financing" className="text-amber-700 font-semibold underline">View financing options →</Link>
          </div>
        </section>

        {/* 9. FAQ */}
        <section id="faq">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-3">
            {[
              ['What is the cheapest type of flooring?', 'Laminate is the cheapest at BBS, starting at $1.49/sqft (Tosca Floors). With installation at $2.00/sqft, total cost starts around $3.49/sqft. Vinyl starts at $2.19/sqft material — the second most affordable option.'],
              ['How much does it cost to floor 1,000 square feet?', 'At BBS Flooring: Laminate $3,490–$5,290 installed. Vinyl $4,190–$5,590 installed. Engineered hardwood $4,740–$12,240 installed. Solid hardwood $7,350–$10,500 installed. These include material + professional installation.'],
              ['Does BBS Flooring offer free estimates?', 'Yes. BBS provides free in-home measurements across the GTA. A technician measures every room, checks subfloor conditions, and provides a detailed quote — no obligation. Book at bbsflooring.ca/free-measurement or call (647) 428-1111.'],
              ['Is hardwood flooring worth the extra cost over vinyl?', 'For primary residences — usually yes. Hardwood adds more resale value and lasts 25–100 years vs 15–25 for vinyl. The cost gap has narrowed: BBS engineered hardwood starts at $2.49/sqft while vinyl starts at $2.19/sqft. For rentals or basements, vinyl wins on practicality.'],
              ['Is installation included in BBS flooring prices?', 'Material and labour are quoted separately for transparency. Material prices are per square foot on the website. Installation starts at $2.00/sqft for vinyl/laminate and $2.25/sqft for hardwood. This lets you compare material costs fairly.'],
              ['How should I budget for a flooring project?', 'Rule of thumb: material cost × 2 covers materials + installation + most extras. For precision, add: material + labour + old floor removal ($1.00–$3.00/sqft) + baseboards ($3.61/linear ft) + delivery ($140–$200) + 10% waste factor. BBS provides free detailed quotes.'],
              ['How much do stairs cost?', 'At BBS: Stair refinishing is $125/step. New straight hardwood treads are $185/step. Specialty stairs (open/curved) are $225/step. Pickets are $25/piece. A typical 13-step straight staircase costs $1,625–$2,405 for new treads.'],
              ['Can I install flooring myself to save money?', 'Click-lock vinyl and laminate are DIY-friendly — saving $2.00/sqft in labour. Hardwood requires professional installation (nail guns, moisture testing, specialized tools). BBS sells material without installation if you prefer DIY.'],
              ['When is the cheapest time to buy flooring?', 'BBS runs clearance sales year-round with discontinued products from $1.49/sqft. The best time for deals is typically late fall and winter when demand is lower. Check bbsflooring.ca/clearance for current markdowns.'],
              ['Does BBS require a deposit?', 'For material purchases, payment is due at order. For installation projects, BBS typically requires a deposit to schedule, with the balance due on completion. Financing through PayBright is available for larger projects.'],
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
          <h2 className="text-3xl font-bold mb-4">Get Your Exact Flooring Cost</h2>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
            Every home is different. Book a free in-home measurement and get a detailed, no-obligation quote with material, labour, and all extras itemized. Or browse 600+ in-stock products online and use our quote calculator.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors">
              Browse Products
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
