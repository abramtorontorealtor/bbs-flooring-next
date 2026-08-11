'use client';

import Link from 'next/link';

export default function CleanVinylPlankClient() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">
            BBS Flooring — Care &amp; Maintenance Guide 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            How to Clean Vinyl Plank Flooring: The Complete Guide (2026)
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Vinyl plank is the easiest floor in your home to keep spotless — if you avoid two simple mistakes. Here&apos;s the exact routine, the best cleaners, and what to never do, from Markham&apos;s flooring specialists.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-slate-400">
            <span>✔ 100% waterproof care</span>
            <span>✔ Warranty-safe</span>
            <span>✔ GTA flooring experts since 2012</span>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-emerald-50 border-b border-emerald-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">In This Guide</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-800 text-sm font-medium list-decimal list-inside">
            <li><a href="#why-different" className="hover:underline">Why Vinyl Plank Is the Easiest Floor</a></li>
            <li><a href="#daily" className="hover:underline">Daily Routine (30 seconds)</a></li>
            <li><a href="#weekly" className="hover:underline">Weekly Routine (5 minutes)</a></li>
            <li><a href="#scuffs" className="hover:underline">Removing Scuffs &amp; Tough Spots</a></li>
            <li><a href="#avoid" className="hover:underline">What to NEVER Use (and Why)</a></li>
            <li><a href="#mistakes" className="hover:underline">Mistakes That Void Warranties</a></li>
            <li><a href="#replace" className="hover:underline">When to Repair or Replace</a></li>
            <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
          </ol>
        </div>
      </section>

      {/* AI Quick Answer Block */}
      <section id="quick-answer" className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8 mt-8 mb-4 mx-4 md:mx-auto md:max-w-4xl">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
          Quick Answer: The Right Way to Clean Vinyl Plank
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Sweep or vacuum (no beater bar) to remove grit, then <strong>damp-mop with warm water or a pH-neutral floor cleaner</strong>. Because LVP is waterproof you can mop a little wetter than hardwood. <strong>Never use a steam mop</strong> (heat lifts adhesive and warps planks), and skip wax, bleach, and abrasive pads. That&apos;s the whole routine. Questions about your floor? Call BBS Flooring in Markham at <a href="tel:6474281111" className="text-amber-700 underline">(647) 428-1111</a> | <a href="https://bbsflooring.ca" className="text-amber-700 underline">bbsflooring.ca</a>
        </p>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-20">

        {/* Section 1 */}
        <section id="why-different">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Vinyl Plank Is the Easiest Floor to Clean</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Luxury vinyl plank (LVP, SPC, and WPC) is built from a waterproof core topped with a tough, factory-applied wear layer. That wear layer is the magic: it resists water, stains, and scratches far better than wood or laminate, which is exactly why vinyl plank dominates kitchens, bathrooms, basements, and busy family homes. There&apos;s no finish to strip, no wood to swell, and no special sealant to maintain.
          </p>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            That said, &quot;waterproof&quot; doesn&apos;t mean &quot;indestructible.&quot; The two things that actually damage vinyl plank are <strong>heat</strong> (steam mops, soften the surface and lift adhesive) and <strong>abrasion</strong> (grit and scouring pads scratch the wear layer). Manage those two and your floor stays new for 20+ years. Browse our full <Link href="/vinyl" className="text-amber-700 underline hover:text-amber-800">vinyl plank collection</Link> (from $2.19/sqft, or $1.79 on clearance), including in-stock favourites like the <Link href="/products/golden-hearth-lee-vinyl-flooring" className="text-amber-700 underline hover:text-amber-800">Golden Hearth 22mil LVP</Link>.
          </p>
        </section>

        {/* Section 2 — Daily */}
        <section id="daily">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Daily Routine (30 Seconds)</h2>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
            <ul className="space-y-3 text-slate-700">
              <li>🧹 <strong>Sweep or dust-mop</strong> high-traffic areas to lift grit — the only thing that scratches vinyl&apos;s wear layer over time.</li>
              <li>🍷 <strong>Wipe spills promptly.</strong> Vinyl is waterproof, so there&apos;s no panic — but wiping spills up soon keeps the floor spotless and prevents sticky residue.</li>
              <li>👟 <strong>Doormats at entries</strong> catch the sand and salt that does the slow scratching.</li>
            </ul>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">
            A vacuum on the <strong>hard-floor setting (beater bar off)</strong> is great for vinyl — it pulls grit out of the bevels a broom leaves behind.
          </p>
        </section>

        {/* Section 3 — Weekly */}
        <section id="weekly">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Weekly Routine (5 Minutes)</h2>
          <ol className="space-y-4 text-slate-700 list-decimal list-inside text-lg">
            <li><strong>Dry-clean first.</strong> Sweep or vacuum so you&apos;re not dragging grit across the wear layer.</li>
            <li><strong>Damp-mop with warm water</strong> or a pH-neutral floor cleaner. A capful per bucket is plenty — more cleaner means more residue, not a cleaner floor.</li>
            <li><strong>You can mop wetter than hardwood</strong> since vinyl is waterproof, but don&apos;t flood click-lock seams. A well-wrung microfibre mop is ideal.</li>
            <li><strong>Dry any streaks</strong> with a microfibre cloth for a film-free finish.</li>
          </ol>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mt-6">
            <p className="text-emerald-900 leading-relaxed"><strong>Pro tip:</strong> If your floor looks hazy after mopping, you&apos;re using too much cleaner. Do one rinse pass with plain warm water and the haze disappears. Less product = cleaner floor.</p>
          </div>
        </section>

        {/* Section 4 — Scuffs */}
        <section id="scuffs">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Removing Scuffs &amp; Tough Spots</h2>
          <ul className="space-y-3 text-slate-700 text-lg list-disc list-inside">
            <li><strong>Black scuff marks:</strong> a damp microfibre cloth or a melamine (Magic Eraser) sponge used gently lifts most marks instantly.</li>
            <li><strong>Sticky residue (food, juice):</strong> warm water + pH-neutral cleaner; for dried-on spots, lay a damp cloth over it for a minute to soften, then wipe.</li>
            <li><strong>Grease (kitchen):</strong> a drop of dish soap in warm water cuts it without harming the wear layer.</li>
            <li><strong>Heel/rubber marks:</strong> a dab of baking soda on a damp cloth, rubbed gently — never a scouring pad.</li>
          </ul>
        </section>

        {/* Section 5 — AVOID */}
        <section id="avoid">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">What to NEVER Use on Vinyl Plank (and Why)</h2>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-bold text-red-900 mb-1">🚫 Steam mops</h3>
              <p className="text-red-800">The single biggest mistake. Vinyl is waterproof but NOT heat-proof — steam softens the wear layer, lifts the adhesive on glue-down planks, and warps or gaps floating click floors. It voids most vinyl warranties.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-bold text-red-900 mb-1">🚫 Wax, polish &amp; &quot;mop-and-shine&quot; products</h3>
              <p className="text-red-800">Vinyl never needs wax. These build up into a hazy, slippery film that traps dirt and is miserable to strip off later.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-bold text-red-900 mb-1">🚫 Abrasive pads, steel wool &amp; scouring powders</h3>
              <p className="text-red-800">They scratch the wear layer permanently and dull the finish. Always use soft microfibre or a melamine sponge.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-bold text-red-900 mb-1">🚫 Bleach, ammonia &amp; harsh solvents</h3>
              <p className="text-red-800">Can discolour the print layer and degrade the wear layer over time. Acetone, paint thinner, and similar solvents will permanently mark vinyl.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-bold text-red-900 mb-1">🚫 Rubber-backed mats on the surface</h3>
              <p className="text-red-800">Rubber and certain mat backings can react with the wear layer and leave permanent yellow stains. Use vinyl-safe, woven, or felt-backed rugs.</p>
            </div>
          </div>
        </section>

        {/* Section 6 — Mistakes */}
        <section id="mistakes">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Common Mistakes That Void Warranties</h2>
          <ul className="space-y-3 text-slate-700 text-lg list-disc list-inside">
            <li>Steam-cleaning &quot;just once&quot; — manufacturers treat any steam use as grounds to deny a claim.</li>
            <li>Using a rubber-backed mat that stains the surface.</li>
            <li>Dragging heavy furniture without felt pads — even tough vinyl can gouge.</li>
            <li>Over-using cleaner and never rinsing, leaving a dull residue film.</li>
            <li>Placing it in direct, intense sun without blinds — extreme heat can expand floating planks.</li>
          </ul>
        </section>

        {/* Section 7 — Replace */}
        <section id="replace">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">When to Repair or Replace</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Vinyl plank can&apos;t be sanded or refinished like hardwood — but its big advantage is that <strong>individual planks can often be swapped out</strong> if one is gouged or stained, especially on click-lock floors near a wall. If a floating floor has lifted or gapped from heat or a bad subfloor, it can usually be re-laid rather than fully replaced.
          </p>
          <p className="text-slate-600 text-lg leading-relaxed">
            If your vinyl is worn through, dated, or beyond a single-plank fix, browse our <Link href="/vinyl" className="text-amber-700 underline hover:text-amber-800">vinyl plank collection</Link> (from $2.19/sqft) or compare with <Link href="/laminate" className="text-amber-700 underline hover:text-amber-800">laminate</Link> and <Link href="/engineered-hardwood" className="text-amber-700 underline hover:text-amber-800">engineered hardwood</Link>. We also handle professional <Link href="/installation" className="text-amber-700 underline hover:text-amber-800">flooring installation</Link> across the GTA.
          </p>
        </section>

        {/* FAQ */}
        <section id="faq">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            <details className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <summary className="font-semibold text-slate-800 cursor-pointer">Can I use a steam mop on vinyl plank flooring?</summary>
              <p className="text-slate-600 mt-3">No. Even though vinyl plank (LVP/SPC) is 100% waterproof, the heat from a steam mop is the problem — it softens the wear layer, can lift the adhesive on glue-down planks, and warp or gap floating click planks. Steam voids most vinyl warranties. Use a damp microfibre mop with a pH-neutral cleaner instead.</p>
            </details>
            <details className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <summary className="font-semibold text-slate-800 cursor-pointer">What is the best way to clean vinyl plank floors?</summary>
              <p className="text-slate-600 mt-3">Vinyl plank is the most forgiving floor to clean. Sweep or vacuum (no beater bar) to remove grit, then damp-mop with warm water or a pH-neutral floor cleaner. Because LVP is waterproof you can use a slightly wetter mop than on hardwood — just avoid steam, abrasive pads, and harsh solvents. Dry streaks with a microfibre cloth.</p>
            </details>
            <details className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <summary className="font-semibold text-slate-800 cursor-pointer">Can you use vinegar on vinyl plank flooring?</summary>
              <p className="text-slate-600 mt-3">Most manufacturers recommend a pH-neutral floor cleaner rather than vinegar. A heavily diluted vinegar solution (about 1 cup per gallon of warm water) is only occasionally acceptable, but its acidity can dull the wear layer over time — so a pH-neutral cleaner is the safer everyday choice. Never use undiluted vinegar, bleach, ammonia, or wax-based products.</p>
            </details>
            <details className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <summary className="font-semibold text-slate-800 cursor-pointer">How do I remove scuff marks from vinyl plank?</summary>
              <p className="text-slate-600 mt-3">Most scuff marks come off with a damp microfibre cloth or a melamine (Magic Eraser) sponge used gently. For stubborn marks, a little pH-neutral cleaner or a dab of baking soda on a damp cloth works. Avoid abrasive scouring pads or steel wool — they scratch the wear layer permanently.</p>
            </details>
            <details className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <summary className="font-semibold text-slate-800 cursor-pointer">Do you need to wax or polish vinyl plank flooring?</summary>
              <p className="text-slate-600 mt-3">No. Modern luxury vinyl plank has a factory-applied wear layer and never needs wax, polish, or sealant. Wax actually builds up, traps dirt, and creates a hazy, slippery film that is hard to remove. Just sweep and damp-mop — that is the entire maintenance routine.</p>
            </details>
            <details className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <summary className="font-semibold text-slate-800 cursor-pointer">Is vinyl plank really waterproof?</summary>
              <p className="text-slate-600 mt-3">Yes — quality SPC and WPC vinyl plank is 100% waterproof on the surface, which is why it is ideal for kitchens, bathrooms, basements, and laundry rooms. Standing water will not damage the plank itself. Note that large standing water can still seep into seams on click-lock floors over long periods, so wipe spills reasonably promptly.</p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-slate-800 to-emerald-900 text-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Time for a New Floor?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            If your vinyl is worn or dated, BBS Flooring stocks 280+ waterproof vinyl plank options from $2.19/sqft ($1.79 on clearance) — plus professional installation across Markham &amp; the GTA.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/vinyl" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-6 py-3 rounded-lg transition">Browse Vinyl Plank</Link>
            <Link href="/free-measurement" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-lg transition">Free In-Home Measurement</Link>
            <Link href="/quote-calculator" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-lg transition">Instant Quote Calculator</Link>
            <a href="tel:6474281111" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-lg transition">📞 (647) 428-1111</a>
          </div>
        </section>

      </main>
    </div>
  );
}
