// ─────────────────────────────────────────────────────────────────────────────
// SUPPLY GUIDES — "how to use" steps + FAQ content for supply detail pages
// (S3, Sep 12 2026, memory/ACCESSORY-ATTACH-PLAN.md "SUPPLIES ARCHITECTURE").
//
// RULE (Abram's brief, hard constraint): every technique fact here (mix ratio,
// trowel size, open/cure/dry time, coverage range) traces to a manufacturer
// TDS or manufacturer/distributor product page — logged in
// findings/SUPPLIES-TDS-SOURCES.md. Never invent a number. Where no TDS was
// found this session, the entry is generic procedural language only (no
// brand-specific numeric claims) — see CATEGORY_FALLBACK_STEPS.
//
// Coverage/pack-size FACTS shown elsewhere on the page (spec table, calculator)
// always come from the DB (`supplies.coverage_sqft` / `pack_size`), never from
// this file — this file is technique only.
// ─────────────────────────────────────────────────────────────────────────────

// Keyed by `code` (the DB `supplies.code`, matches the route param).
export const SUPPLY_GUIDES = {
  'AR630-04': {
    steps: [
      'Make sure the subfloor is clean, dry, smooth and fully cured — sweep or vacuum any dust, sand, or old adhesive residue before you open the pail.',
      'Spread Henry 630 with a 1/16" × 1/16" × 1/16" square-notch trowel — the notch size the manufacturer specifies for this adhesive.',
      'Henry 630 can be used dry-to-the-touch (pressure-sensitive) or as a wet-set adhesive — let it flash off until it turns from milky-white to clear/tacky if you\u2019re using it pressure-sensitive, or set the vinyl directly into the wet adhesive for a wet-set bond.',
      'Set your vinyl plank into the adhesive and work from one end of the room, pressing each plank down firmly against the trowel ridges.',
      'Roll the whole floor with a 100 lb floor roller once it\u2019s down, working out from the center, to seat every plank fully into the adhesive and eliminate air pockets.',
      'Keep foot traffic light for the first few hours and hold off on furniture until the adhesive has fully cured — check the pail label for the exact cure window on the day you install.',
    ],
  },
  'ARH695-04': {
    steps: [
      'Test the concrete slab for moisture and pH before you start — Henry 695 is rated for high relative humidity, but the slab should still be clean, sound, and free of curing compounds, sealers, paint, or old adhesive residue.',
      'On bare or porous concrete, prime first (Ardex P 4 or P 51 in this catalog) so the adhesive bonds evenly instead of soaking in unevenly.',
      'Spread Henry 695 with the trowel notch size on the pail label — it\u2019s formulated as a solvent-free acrylic polymer adhesive that can be used dry-to-the-touch (pressure-sensitive) or as a wet-set.',
      'For a pressure-sensitive bond, let the adhesive flash off until it\u2019s clear and tacky before setting your vinyl; for wet-set, lay the vinyl directly into the wet adhesive.',
      'Roll the floor with a 100 lb roller once it\u2019s down to fully seat every plank and push out trapped air.',
      'This is the adhesive to reach for over below-grade slabs, radiant-heat concrete, or any subfloor where a standard adhesive\u2019s moisture rating isn\u2019t enough.',
    ],
  },
  'ECO983-15': {
    steps: [
      'Confirm your engineered hardwood is rated for full-spread glue-down installation (check the plank spec) — Mapei Ultrabond ECO 983 is a moisture-control MS-polymer adhesive, not a floating-floor product.',
      'The subfloor must be clean, flat, and structurally sound; concrete subfloors should be tested for moisture first since this adhesive\u2019s moisture-control rating (up to 90% RH) is exactly why it\u2019s used over slabs.',
      'Spread with the trowel notch Mapei specifies for wood flooring (special trowel clips are available for a monolithic moisture-control layer, or a standard notch trowel when moisture isn\u2019t a concern) — always confirm the exact notch on the pail label for your install.',
      'Set the first row of planks into the wet adhesive within the adhesive\u2019s open time, then continue row by row, back-buttering end joints as you go.',
      'Weight or clamp the first few rows if the manufacturer\u2019s instructions call for it while the adhesive grabs.',
      'Keep the room at a stable temperature while it cures and hold off on sanding/finishing or heavy furniture until Mapei\u2019s cure time has passed.',
    ],
  },
  'AR-K-15': {
    steps: [
      'Prime the subfloor first — Ardex recommends Ardex P 51 on absorbent concrete (in this catalog) so the leveler bonds and doesn\u2019t dry too fast at the surface.',
      'Mix Ardex K 15 with water per the bag instructions to a pourable, lump-free consistency using a drill and paddle mixer.',
      'Pour and spread with a gauge rake or trowel — it has about a 10-minute flow time, so work in sections you can pour and spread before it starts to set.',
      'It levels up to about 1/4" per pour and can be tapered to meet existing elevations at the edges of a repair.',
      'The floor is typically walkable in 2–3 hours.',
      'Before installing your new flooring: moisture-insensitive tile and stone can usually go down after about 6 hours, but every other floor covering (vinyl, laminate, engineered/solid wood) needs roughly 16 hours cure time — always confirm on the bag for the batch you bought.',
    ],
  },
  'CLQESL50': {
    steps: [
      'Prime the subfloor first per the primer\u2019s instructions — a compatible primer keeps the leveler from drying too fast and losing its bond.',
      'Mix Custom LevelQuik ES with water to a pourable consistency using a drill and paddle mixer, following the bag\u2019s water ratio.',
      'This is the "Extended Setting" formula, so it gives you more working time than a rapid-set leveler — useful for larger pours or if you\u2019re not working with a pump.',
      'Pour and spread with a gauge rake; it self-levels on its own in minutes and can be poured up to about 1.5" thick in one shot.',
      'Let it cure fully before installing tile, resilient flooring, carpet, or wood over it — follow the bag\u2019s cure schedule for your specific floor covering.',
      'Don\u2019t use it as a standalone wear surface — it\u2019s a prep layer under your new floor, not a finished floor on its own.',
    ],
  },
  'ARP51-04': {
    steps: [
      'Make sure the concrete is clean, dry and free of paint, sealers, curing compounds, or oil before priming.',
      'For standard absorbent concrete, dilute Ardex P 51 1 part primer to 1 part water by volume.',
      'For extremely absorbent or dusty concrete, use the "double-prime" method: dilute 1 part primer to 3 parts water for the first coat, then apply a second coat at 1:1.',
      'Roll or brush it on evenly — coverage runs about 400–600 sq ft per gallon depending on how absorbent the slab is.',
      'You\u2019ll know it\u2019s dry when the milky primer turns clear; drying takes a minimum of about 3 hours and up to 24 hours depending on temperature and airflow.',
      'Only apply your self-leveler, patch compound or adhesive once the primer is fully dry — never pour or spread over wet or tacky primer.',
    ],
  },
  'ARP4-04': {
    steps: [
      'Make sure the subfloor — concrete, plywood, or gypsum — is clean, dry and free of dust, paint, sealers, or old adhesive residue.',
      'Ardex P 4 is a multipurpose primer, so check the bag/pail of the leveler or adhesive you\u2019re about to use for the mix ratio and coverage rate it recommends with this primer — every downstream product\u2019s instructions take priority here.',
      'Roll or brush the primer on in a thin, even coat — don\u2019t puddle it.',
      'Let it dry fully (it turns from milky to clear) before you pour a leveler or spread an adhesive over it.',
      'Priming first is what lets your self-leveling underlayment or adhesive bond evenly instead of soaking unevenly into a porous slab.',
    ],
  },
  'ARSDFWT-10': {
    steps: [
      'Mix one 10 lb bag of Ardex Feather Finish with about 2 1/2 quarts (2.4 L) of water — for smaller batches, use 2 parts powder to 1 part water by volume.',
      'Mix to a smooth, lump-free, pancake-batter consistency with a margin trowel or drill and paddle.',
      'Apply with a trowel to fill gouges, seams, and low spots, feathering the edge to a true zero — that\u2019s where the name comes from.',
      'One 10 lb bag covers roughly 300 sq ft as a thin skim coat, or about 16.7 sq ft at a full 1/4" thickness — use whichever matches how thick your patch needs to be.',
      'It\u2019s self-drying (it doesn\u2019t need to air-cure like a standard patch compound), so you can typically install your new flooring in as fast as 15–20 minutes once it\u2019s dry to the touch.',
      'Sand lightly if needed once dry for a perfectly flat transition before your floor covering goes down.',
    ],
  },
  'AR-GPS': {
    steps: [
      'Clean the subfloor of dust, debris and any loose material before you start.',
      'Mix Ardex GPS with water only, to a smooth, trowelable consistency, following the bag\u2019s ratio.',
      'Trowel it into gouges, low spots, and seams, feathering the edge so it blends into the surrounding subfloor.',
      'Let it dry fully and sand any high spots flat before installing your new flooring.',
      'Use it for smaller patch-and-skim jobs; for a full-room pour to correct a sloped or badly uneven subfloor, use a self-leveling underlayment (Ardex K 15 or Custom LevelQuik ES in this catalog) instead.',
    ],
  },
  Q70115: {
    steps: [
      'Make sure the concrete slab is clean, dry and free of dust before rolling out the film.',
      'Roll the poly film out across the slab, printed side up, running sheets the long way across the room to minimize seams.',
      'Overlap each sheet by at least a few inches at the seams and press the built-in adhesive strip down to bond the sheets together and seal the seam.',
      'Run the film up the wall at the perimeter slightly — your baseboard or shoe moulding will cover the excess once the floor and trim are in.',
      'Lay your new laminate, SPC, or engineered wood floor directly over the sealed film — it\u2019s a Class 1 vapor barrier rated for use under all three.',
      'Don\u2019t staple or nail through the film field — punctures defeat the moisture barrier; keep fasteners to the very edge where trim will cover them.',
    ],
  },
  M30: {
    steps: [
      'Roll the wax/rosin paper out over the plywood subfloor before laying any nail-down solid hardwood.',
      'Overlap each row so the whole subfloor is covered with no gaps — this is what stops squeaks and blocks moisture wicking up from the subfloor.',
      'Staple or tack it down just enough to hold it in place while you work — the flooring nails/staples going into the hardwood above will hold everything down permanently.',
      'Trim it to the wall lines; your baseboard will cover the cut edge.',
      'Install your solid hardwood directly over it, row by row, per your flooring\u2019s standard nail-down installation method.',
    ],
  },
};

// ── Category fallback — generic, procedurally-correct steps for every code
// without a curated TDS entry above. No brand-specific numbers invented. ──
export const CATEGORY_FALLBACK_STEPS = {
  adhesive: [
    'Make sure the subfloor is clean, dry, flat and free of dust, old adhesive, paint or sealers before you open the pail.',
    'Spread with the trowel notch size printed on the pail or bucket label for your specific flooring type — that\u2019s set by the manufacturer for a reason and shouldn\u2019t be guessed.',
    'Follow the open time and set method (pressure-sensitive vs. wet-set) on the label — setting your flooring too early or too late is the single most common glue-down install mistake.',
    'Roll the finished floor with a floor roller to fully seat it and push out trapped air.',
    'Hold off on heavy furniture and appliances until the adhesive has fully cured per the label\u2019s cure schedule.',
  ],
  primer: [
    'Confirm the substrate (concrete, wood, gypsum) is clean, dry and free of paint, sealers or curing compounds.',
    'Dilute or apply the primer per the ratio on the container — some primers are used neat, others are diluted with water.',
    'Apply in a thin, even coat with a roller or brush, avoiding puddles.',
    'Let it dry fully (most primers turn from milky to clear when ready) before pouring a leveler or spreading adhesive over it.',
    'Never apply your next product over wet or tacky primer — check the dry-time window on the label for the day\u2019s temperature and humidity.',
  ],
  subfloor_prep: [
    'Clean the subfloor of dust and loose debris first.',
    'Prime if the product calls for it — most self-levelers and patch compounds need a compatible primer on concrete.',
    'Mix with water to the consistency the bag specifies, using a drill and paddle mixer for a lump-free batch.',
    'Pour or trowel it on, feathering patch compounds to a true zero edge, or spreading self-levelers with a gauge rake.',
    'Let it cure fully per the bag\u2019s schedule before installing your new floor — cure time varies by floor covering type.',
  ],
  moisture_barrier: [
    'Make sure the subfloor is clean and dry before rolling the barrier out.',
    'Roll it out across the room, overlapping seams and sealing them per the product\u2019s instructions.',
    'Run it slightly up the wall at the perimeter — your baseboard or shoe moulding will hide the excess.',
    'Avoid puncturing the barrier in the field; keep any fasteners to the very edge where trim will cover them.',
    'Install your new flooring directly over the sealed barrier.',
  ],
  underlay: [
    'Roll the underlay out across the room, foam/pad side down, butting each roll edge to the next without overlapping (unless the product specifically calls for an overlap).',
    'Tape the seams if the roll doesn\u2019t already have a built-in adhesive strip.',
    'Trim it to the wall lines — your baseboard or shoe moulding will cover the cut edge.',
    'Install your floating floor directly on top, working from one wall across the room.',
    'Never double up two pads under one floor unless the flooring manufacturer specifically allows it — pad-on-pad can feel spongy and void a flooring warranty.',
  ],
  floor_vent: [
    'Measure your existing floor register opening before ordering — vents are sized to the rough opening, not the visible frame.',
    'Set the vent into the opening with the damper mechanism accessible and facing the direction airflow needs to travel.',
    'Adjust the damper lever to control airflow to the room once it\u2019s in place.',
    'Finish/stain to match your new floor if it\u2019s an unfinished wood vent — do this before final install for the cleanest result.',
  ],
  tools: [
    'Read the tool\u2019s own instructions for grip and safe use before your first cut or tap.',
    'Match the tool to the flooring type on the packaging — a tapping block or pull bar rated for click-lock vinyl/laminate isn\u2019t always the right choice for a different install method.',
    'Keep the tool clean and dry between uses so it doesn\u2019t mark or damage plank edges.',
  ],
};

// ── FAQ builders: category-level (safe generic) + specific overrides sourced
// from the Sep 12 demand check (findings/SUPPLIES-DEMAND-2026-09-12.md PAA). ──
export const CATEGORY_FAQ = {
  adhesive: (item) => [
    {
      question: `Do I need a primer before using ${item.brand ? item.brand + ' ' : ''}${item.label}?`,
      answer:
        'On bare or porous concrete, yes — priming first lets the adhesive bond evenly instead of soaking in unevenly. On plywood or an already-sealed subfloor, a primer usually isn\u2019t required. Check our Adhesives & Primers page for the matching primer.',
    },
    {
      question: 'Pressure-sensitive or wet-set — which method should I use?',
      answer:
        'Most modern flooring adhesives, including this one, can be used either way. Pressure-sensitive means you let the glue flash off until it\u2019s tacky/clear before setting the flooring — more forgiving for DIY. Wet-set means you set the flooring directly into the wet adhesive — faster, but less room for repositioning. Follow the open-time window on the pail either way.',
    },
  ],
  primer: () => [
    {
      question: 'Do I always need to prime before pouring a self-leveler?',
      answer:
        'On absorbent concrete, yes — nearly every self-leveling underlayment manufacturer requires a compatible primer first so the leveler doesn\u2019t dry too fast at the surface and lose its bond. Skipping the primer is one of the most common causes of a self-leveler failing to bond.',
    },
  ],
  subfloor_prep: (item) => [
    {
      question: 'How do I know if I need a patch compound or a full self-leveling pour?',
      answer:
        'Small gouges, seams, and low spots (under about 1/4") are a job for a patch/skimcoat compound. A subfloor that\u2019s sloped, or has low spots across a large area, needs a self-leveling underlayment that pours and finds its own level. Ask us if you\u2019re not sure which your floor needs.',
    },
    {
      question: 'How long before I can install flooring over it?',
      answer: `Cure time depends on the product and your new floor covering — check ${item.label}\u2019s bag for the exact window, and always confirm before laying flooring over a fresh pour.`,
    },
  ],
  moisture_barrier: () => [
    {
      question: 'What moisture barrier thickness do I need over concrete?',
      answer:
        '6-mil poly (or thicker) is the standard minimum most independent flooring guides and manufacturers point to for laminate, SPC, and engineered wood over a concrete slab. Thinner film isn\u2019t considered a real vapor barrier.',
    },
    {
      question: 'Do I still need underlay if I use a moisture barrier?',
      answer:
        'Usually yes for laminate — the moisture barrier blocks vapor from the slab, but most laminate still needs a separate underlay for cushioning and sound unless the barrier is combined with a pad (like our 3-in-1 rolls) or the plank has one attached.',
    },
  ],
  underlay: () => [
    {
      question: 'Can I use this underlay under vinyl plank flooring?',
      answer:
        'Only if your vinyl doesn\u2019t already have a pad attached — most vinyl (SPC/LVP) sold today does, and doubling up (pad-on-pad) can feel spongy or void the flooring warranty. Check your plank spec, or ask us and we\u2019ll confirm.',
    },
  ],
  floor_vent: () => [
    {
      question: 'How do I know what size floor vent I need?',
      answer:
        'Measure the rough opening in your subfloor (not the visible grille) — floor vents are sized to fit that opening, most commonly 4"×10" or 4"×12" residential sizes. Our Floor Vents category page has a sizing guide.',
    },
    {
      question: 'Can I get a floor vent that matches my new floor exactly?',
      answer:
        'Wood vents can be stained to match a specific hardwood species and finish before installation, and we stock species-matched options (red oak, white oak, maple). Metal/painted vents are finish-matched by color instead.',
    },
  ],
  tools: () => [
    {
      question: 'Do I really need special tools to install click-lock flooring?',
      answer:
        'A tapping block and pull bar prevent damage to plank edges that a hammer alone will cause, and make tight-fitting rows (especially the last row against a wall) much easier. For a DIY install we always recommend at least a tapping block.',
    },
  ],
};

// ── "Works with" — floor_types code → our own category landing page. ──
export const FLOOR_TYPE_LINKS = {
  laminate: { label: 'Laminate Flooring', url: '/laminate' },
  vinyl: { label: 'Vinyl Flooring', url: '/vinyl' },
  engineered_hardwood: { label: 'Engineered Hardwood', url: '/engineered-hardwood' },
  solid_hardwood: { label: 'Solid Hardwood', url: '/solid-hardwood' },
};

export function getSupplySteps(item) {
  const curated = SUPPLY_GUIDES[item.code];
  if (curated?.steps?.length) return curated.steps;
  return CATEGORY_FALLBACK_STEPS[item.category] || CATEGORY_FALLBACK_STEPS.tools;
}

// Merge one or more DB `category` buckets into a single SuppliesShopClient
// section — used by the 5 category landing pages (S3).
export function buildCategorySection(catalog, { id, title, note, categories }) {
  const byCategory = catalog.byCategory || {};
  const items = categories.flatMap((c) => byCategory[c] || []);
  items.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
  return { id, title, note, items };
}

export function getSupplyFaq(item) {
  const builder = CATEGORY_FAQ[item.category];
  const base = builder ? builder(item) : [];
  // Always add one coverage-driven FAQ when we have a real coverage number —
  // computed live from the DB field, never hand-typed.
  const faqs = [...base];
  if (item.coverage_sqft) {
    faqs.push({
      question: `How much ${item.label} do I need?`,
      answer: `Use the calculator on this page — enter your square footage and we\u2019ll size the exact quantity, based on 1 ${item.unit} covering about ${item.coverage_sqft} sq ft.`,
    });
  }
  return faqs;
}
