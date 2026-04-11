/**
 * brandPages.js — Content for all brand landing pages.
 * Each export is consumed by BrandLandingClient → AdLandingTemplate.
 *
 * Brand data is driven by real product inventory from BBS Flooring's database.
 * Content is original — written for Markham-area homeowners searching for these brands.
 */

const lc = (s) => (s || '').toLowerCase();
const has = (str, sub) => lc(str).includes(lc(sub));

// ══════════════════════════════════════════════════════════
// NAF FLOORING — 164 products (vinyl 69, EH 63, laminate 32)
// ══════════════════════════════════════════════════════════

export const nafFlooringData = {
  route: 'NafFlooring',
  title: 'NAF Flooring Markham | Vinyl, Hardwood & Laminate',
  description: 'Shop NAF Flooring in Markham — 164 products in stock. Vinyl plank, engineered hardwood, and laminate from $2.89/sqft. Free measurements. Call (647) 428-1111.',
  h1: 'NAF Flooring — Vinyl, Hardwood & Laminate',
  subtitle: '164 NAF products in stock at our Markham showroom. From waterproof vinyl to European oak engineered hardwood — one brand covers every room in your home.',
  parentPage: null,
  schemaType: 'product',
  content: [
    {
      heading: 'The Full-Range Flooring Brand',
      body: `<p>NAF is the brand you pick when you want one manufacturer across your entire home. They cover <strong>vinyl plank, engineered hardwood, and laminate</strong> — all built for Canadian climates and all available at BBS Flooring right now.</p>
<p>That matters because it means consistent quality standards floor to floor, and you're not mixing three different manufacturers with three different warranty processes. One brand, one warranty contact, done.</p>`
    },
    {
      heading: 'NAF Vinyl Plank — 69 Options from $2.99/sqft',
      body: `<p>NAF's vinyl lineup ranges from <strong>5mm entry-level planks to 9mm premium SPC with 2mm cork underpad</strong>. Every option is 100% waterproof — basements, kitchens, bathrooms, no restrictions.</p>
<ul>
<li><strong>5mm w/ 1mm pad:</strong> Budget-friendly, ideal for rentals or quick renovations.</li>
<li><strong>6mm–7mm w/ underpad:</strong> The sweet spot — comfortable underfoot, hides minor subfloor imperfections.</li>
<li><strong>8mm–9mm w/ cork:</strong> Premium feel, sound dampening, condo board approved thickness.</li>
</ul>
<p>Prices run <strong>$2.99 to $4.29/sqft</strong> — significantly below what the big box stores charge for comparable thickness.</p>`
    },
    {
      heading: 'NAF Engineered Hardwood — 63 Options from $5.09/sqft',
      body: `<p>Oak, maple, hickory, and exotic walnut — NAF's engineered hardwood collection hits every aesthetic from modern minimalist to rustic farmhouse. Plank widths range from <strong>5" to 7½"</strong> with real wood wear layers.</p>
<p>Engineered construction means these are <strong>radiant heat compatible</strong> and more dimensionally stable than solid hardwood — critical in GTA homes where humidity swings from 20% in January to 80% in August.</p>`
    },
    {
      heading: 'NAF Laminate — 32 Options from $2.89/sqft',
      body: `<p>NAF's 12mm laminate line includes both standard and <strong>waterproof options</strong>. At 12mm thick, these feel substantial underfoot — not the hollow, cheap-sounding laminate you might remember from the early 2000s.</p>
<p>Waterproof laminate is becoming the go-to for homeowners who want the look of hardwood in high-traffic areas without the maintenance anxiety.</p>`
    },
  ],
  faqItems: [
    { question: 'Is NAF Flooring a good brand?', answer: 'NAF is a well-established flooring manufacturer distributed across Canada. They produce vinyl, engineered hardwood, and laminate — all built for Canadian climate conditions. BBS Flooring carries 164 NAF products and has installed thousands of square feet of NAF flooring across the GTA.' },
    { question: 'How much does NAF vinyl flooring cost?', answer: 'NAF vinyl plank at BBS Flooring ranges from $2.99 to $4.29 per square foot depending on thickness and underpad type. The 7mm options with cork underpad are the most popular for homes. Call (647) 428-1111 for current pricing on specific products.' },
    { question: 'Is NAF vinyl flooring waterproof?', answer: 'Yes. All NAF vinyl plank flooring is 100% waterproof with an SPC (Stone Polymer Composite) core. It can be installed in basements, kitchens, bathrooms, and laundry rooms without moisture concerns.' },
    { question: 'Where can I buy NAF Flooring in Markham?', answer: 'BBS Flooring at 6061 Highway 7, Unit B carries 164 NAF products in stock — vinyl, engineered hardwood, and laminate. Walk-ins welcome Monday–Saturday. We also offer free in-home measurements across the GTA.' },
    { question: 'Does NAF engineered hardwood work with radiant heat?', answer: 'Yes. NAF engineered hardwood is compatible with radiant heating systems. The multi-layer construction provides dimensional stability that solid hardwood cannot match over heated subfloors. Our installers follow manufacturer specifications for all radiant heat installations.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'naf'),
  productSessionKey: 'naf',
  productQueryKey: 'products-naf',
};

// ══════════════════════════════════════════════════════════
// NORTHERNEST — 106 products (EH 70, solid 18, laminate 18)
// ══════════════════════════════════════════════════════════

export const northernestFlooringData = {
  route: 'NorthernestFlooring',
  title: 'Northernest Flooring Markham | Hardwood & Laminate',
  description: 'Shop Northernest Flooring in Markham — 106 products in stock. Engineered hardwood, solid hardwood, and European laminate from $3.19/sqft. Call (647) 428-1111.',
  h1: 'Northernest Hardwood & Laminate Flooring',
  subtitle: '106 Northernest products in stock. Engineered and solid hardwood in oak, maple, and hickory — plus 12mm European laminate. All at our Markham showroom.',
  parentPage: null,
  schemaType: 'product',
  content: [
    {
      heading: 'Hardwood-First, Built for Canadian Homes',
      body: `<p>Northernest is a hardwood-focused brand — <strong>70 engineered and 18 solid hardwood options</strong> across white oak, red oak, maple, and hickory. If you're shopping for real wood flooring, they're one of the deepest selections we carry.</p>
<p>What sets Northernest apart is their range of installation systems. They offer both traditional tongue-and-groove (for glue-down and nail-down installs) and <strong>click-lock systems</strong> — which means faster installation and lower labour costs without sacrificing the look or feel of real hardwood.</p>`
    },
    {
      heading: 'Engineered Hardwood — 70 Options from $3.99/sqft',
      body: `<p>The bulk of the Northernest collection is engineered hardwood. <strong>7½" wide-plank European oak</strong> is their flagship, but you'll also find hickory for high-traffic areas, maple for a cleaner aesthetic, and click-system options for DIY-friendly installation.</p>
<p>Prices range from <strong>$3.99 to $7.49/sqft</strong> — the upper end being their premium European oak wide planks with hand-scraped or wire-brushed finishes. The sub-$5 options are genuinely hard to beat for the quality you're getting.</p>`
    },
    {
      heading: 'Solid Hardwood — 18 Options from $5.10/sqft',
      body: `<p>For purists who want ¾" solid hardwood, Northernest offers <strong>red oak, white oak, hickory, and maple</strong>. These are nail-down over plywood subfloor — the classic installation method that's been proven for decades.</p>
<p>Solid hardwood can be sanded and refinished multiple times over its lifetime, making it a genuine buy-it-once investment. It's the right choice for main floors and living areas where you want permanence.</p>`
    },
    {
      heading: '12mm European Laminate — from $3.19/sqft',
      body: `<p>Northernest's laminate line is 12mm European-made — thicker and denser than the typical 8mm options at big box stores. At $3.19/sqft, it's a strong value play for bedrooms, home offices, or rental properties where you want great looks without the hardwood price tag.</p>`
    },
  ],
  faqItems: [
    { question: 'Is Northernest a Canadian flooring brand?', answer: 'Northernest is distributed in Canada and built for Canadian climate conditions. Their engineered hardwood is designed to handle the temperature and humidity swings typical in Ontario homes. BBS Flooring carries 106 Northernest products at our Markham showroom.' },
    { question: 'What species does Northernest hardwood come in?', answer: 'Northernest offers white oak, red oak, European oak, hickory, and maple in both engineered and solid hardwood. Their 7½" wide-plank European oak is the most popular collection. Visit our showroom to see all options in person.' },
    { question: 'How much does Northernest engineered hardwood cost?', answer: 'Northernest engineered hardwood at BBS Flooring ranges from $3.99 to $7.49 per square foot. The price depends on species, plank width, and finish. Call (647) 428-1111 or use our Quote Calculator for an estimate tailored to your project.' },
    { question: 'Does Northernest have click-lock hardwood?', answer: 'Yes. Northernest offers click-lock (click system) options in oak, maple, and hickory. Click-lock engineered hardwood installs faster than traditional glue-down, which reduces labour costs. It is also a viable option for experienced DIYers.' },
    { question: 'Where can I see Northernest flooring samples?', answer: 'BBS Flooring at 6061 Highway 7, Unit B, Markham carries the full Northernest collection. Walk-ins welcome Monday–Saturday. We offer free in-home measurements across the GTA.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'northernest'),
  productSessionKey: 'northernest',
  productQueryKey: 'products-northernest',
};

// ══════════════════════════════════════════════════════════
// WODEN FLOORING — 62 products (vinyl 38, EH 24)
// ══════════════════════════════════════════════════════════

export const wodenFlooringData = {
  route: 'WodenFlooring',
  title: 'Woden Flooring Markham | Vinyl & Engineered Hardwood',
  description: 'Shop Woden Flooring in Markham — 62 products in stock. Vinyl plank and engineered hardwood from $2.59/sqft. Free measurements. Call (647) 428-1111.',
  h1: 'Woden Vinyl & Engineered Hardwood Flooring',
  subtitle: '62 Woden products in stock — from waterproof vinyl at $2.59/sqft to engineered oak hardwood. In stock at our Markham showroom.',
  parentPage: null,
  schemaType: 'product',
  content: [
    {
      heading: 'Two Categories, One Consistent Standard',
      body: `<p>Woden focuses on two product lines: <strong>waterproof vinyl plank and engineered oak hardwood</strong>. They don't try to be everything to everyone — they make vinyl and hardwood, and they make them well.</p>
<p>That focus shows in the product. Their vinyl ranges from <strong>6mm to 11mm thick</strong> — the 11mm option is among the thickest SPC vinyl we carry, with a substantial feel underfoot that rivals engineered hardwood at half the price.</p>`
    },
    {
      heading: 'Woden Vinyl — 38 Options from $2.59/sqft',
      body: `<p>Starting at $2.59/sqft, Woden vinyl is one of the best value propositions in our showroom. The range includes:</p>
<ul>
<li><strong>6mm Vinyl:</strong> Entry-level, great for basements, laundry rooms, and rental units.</li>
<li><strong>7mm Vinyl:</strong> Mid-range with integrated underpad. The go-to for main living areas.</li>
<li><strong>9mm Vinyl:</strong> Premium thickness, excellent sound dampening.</li>
<li><strong>11mm Vinyl:</strong> Their flagship — feels like engineered hardwood, priced like vinyl. Ideal for open-concept homes.</li>
</ul>
<p>All options are 100% waterproof and install with a click-lock system.</p>`
    },
    {
      heading: 'Woden Engineered Hardwood — 24 Options from $2.99/sqft',
      body: `<p>Woden's engineered hardwood is exclusively <strong>oak — white oak and natural oak</strong> in 6½" and 7½" plank widths. Prices start at $2.99/sqft, which is unusually competitive for real wood flooring.</p>
<p>If you want the authenticity of hardwood in your main living spaces and vinyl in the wet areas, Woden lets you stay within one brand and maintain a cohesive look throughout your home.</p>`
    },
  ],
  faqItems: [
    { question: 'Is Woden Flooring good quality?', answer: 'Woden produces solid vinyl plank and engineered hardwood flooring. Their 11mm vinyl is among the thickest SPC options available — substantially more durable than typical 5-6mm vinyl. BBS Flooring carries 62 Woden products and has installed them across the GTA without issues.' },
    { question: 'How much does Woden vinyl flooring cost?', answer: 'Woden vinyl at BBS Flooring starts at $2.59/sqft for 6mm options and goes up to $4.79/sqft for 11mm premium planks. This includes the integrated underpad. Call (647) 428-1111 for current pricing.' },
    { question: 'Does Woden make waterproof flooring?', answer: 'Yes. All Woden vinyl plank flooring is 100% waterproof with SPC cores. They also offer engineered hardwood, which is moisture-resistant but not waterproof — suitable for main floors but not recommended for bathrooms or basements.' },
    { question: 'What is the thickest Woden vinyl available?', answer: 'Woden offers an 11mm vinyl plank — one of the thickest SPC vinyl options on the market. It provides exceptional sound dampening, durability, and a premium feel underfoot. Available at BBS Flooring\'s Markham showroom.' },
    { question: 'Where can I buy Woden Flooring in Markham?', answer: 'BBS Flooring at 6061 Highway 7, Unit B carries 62 Woden products — both vinyl and engineered hardwood. Walk-ins welcome Monday–Saturday. Free in-home measurements available.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'woden'),
  productSessionKey: 'woden',
  productQueryKey: 'products-woden',
};

// ══════════════════════════════════════════════════════════
// FALCON FLOORING — 56 products (EH 25, vinyl 19, laminate 12)
// ══════════════════════════════════════════════════════════

export const falconFlooringData = {
  route: 'FalconFlooring',
  title: 'Falcon Flooring Markham | Affordable Hardwood, Vinyl & Laminate',
  description: 'Shop Falcon Flooring in Markham — 56 products from $2.19/sqft. Engineered hardwood, vinyl, and waterproof laminate. Free measurements. Call (647) 428-1111.',
  h1: 'Falcon Flooring — Hardwood, Vinyl & Laminate',
  subtitle: '56 Falcon products from $2.19/sqft. Real hardwood, waterproof vinyl, and 12mm laminate — quality floors at prices that make renovations actually affordable.',
  parentPage: null,
  schemaType: 'product',
  content: [
    {
      heading: 'Quality Flooring at Honest Prices',
      body: `<p>Falcon is the brand we recommend when the budget matters but you're not willing to compromise on what goes under your feet. Their pricing is among the lowest in our showroom — <strong>vinyl from $2.19/sqft, laminate from $2.69/sqft, engineered hardwood from $3.89/sqft</strong> — without the quality corners you'd expect at these prices.</p>
<p>They cover all three major flooring categories, which makes them ideal for whole-home renovations where you need different flooring types in different rooms but want to keep the total cost manageable.</p>`
    },
    {
      heading: 'Falcon Engineered Hardwood — 25 Options from $3.89/sqft',
      body: `<p>Falcon's engineered hardwood line includes <strong>hickory, maple, and red oak</strong> in 6½" plank widths. At $3.89 to $4.49/sqft, you're getting real wood flooring at prices that compete with premium vinyl.</p>
<p>Hickory is worth a special mention — it's the hardest North American wood species commercially available, making it the smart choice for homes with kids, dogs, or heavy foot traffic.</p>`
    },
    {
      heading: 'Falcon Vinyl — 19 Options from $2.19/sqft',
      body: `<p>Starting at <strong>$2.19/sqft</strong>, Falcon vinyl is the most affordable waterproof option in our showroom. Available in 6mm and 7mm thicknesses, including <strong>condo-approved options with integrated underpad</strong>.</p>
<p>The 7mm condo-approved vinyl is particularly popular — it meets the sound transmission requirements that most condo boards mandate, eliminating the need for separate underlay.</p>`
    },
    {
      heading: 'Falcon Waterproof Laminate — 12 Options from $2.69/sqft',
      body: `<p>Falcon's 12mm waterproof laminate bridges the gap between traditional laminate and vinyl. You get the realistic wood grain and feel of laminate with waterproof protection — at $2.69 to $3.19/sqft, it's hard to argue with the value.</p>`
    },
  ],
  faqItems: [
    { question: 'Is Falcon Flooring affordable?', answer: 'Yes. Falcon is one of the most competitively priced brands at BBS Flooring. Vinyl starts at $2.19/sqft, laminate at $2.69/sqft, and engineered hardwood at $3.89/sqft. Despite the low prices, quality is consistent — we have installed Falcon flooring across the GTA without complaints.' },
    { question: 'Does Falcon make condo-approved flooring?', answer: 'Yes. Falcon offers 7mm vinyl plank with integrated condo-approved underpad (5.5mm + 1.5mm) that meets the sound transmission requirements of most condo boards in the GTA. Check with your property management for specific STC/IIC requirements.' },
    { question: 'What hardwood species does Falcon offer?', answer: 'Falcon engineered hardwood comes in hickory, maple, and red oak — all in 6½" plank widths. Hickory is the hardest of the three and best suited for high-traffic areas. Available at BBS Flooring\'s Markham showroom.' },
    { question: 'Is Falcon laminate waterproof?', answer: 'Falcon offers 12mm waterproof laminate. Unlike traditional laminate which swells when exposed to moisture, waterproof laminate uses a water-resistant core that handles spills and splashes. Suitable for kitchens, entryways, and main living areas.' },
    { question: 'Where can I buy Falcon Flooring near me?', answer: 'BBS Flooring at 6061 Highway 7, Unit B, Markham carries 56 Falcon products in stock. Walk-ins welcome Monday–Saturday. We serve Markham, Toronto, Durham Region, and the entire GTA with free in-home measurements.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'falcon'),
  productSessionKey: 'falcon',
  productQueryKey: 'products-falcon',
};

// ══════════════════════════════════════════════════════════
// CANADIAN STANDARD — 48 products (EH only)
// ══════════════════════════════════════════════════════════

export const canadianStandardFlooringData = {
  route: 'CanadianStandardFlooring',
  title: 'Canadian Standard Flooring Markham | Engineered Hardwood',
  description: 'Shop Canadian Standard engineered hardwood in Markham — 48 products from $4.99/sqft. Oak, hickory, maple, walnut in 6½" and 7½" planks. Call (647) 428-1111.',
  h1: 'Canadian Standard Engineered Hardwood',
  subtitle: '48 engineered hardwood options from $4.99/sqft. Oak, hickory, maple, and walnut in 6½" and 7½" wide planks — all in stock at our Markham showroom.',
  parentPage: { label: 'Engineered Hardwood', route: 'EngineeredHardwood' },
  schemaType: 'product',
  content: [
    {
      heading: 'Pure Hardwood, No Distractions',
      body: `<p>Canadian Standard does one thing: <strong>engineered hardwood</strong>. No vinyl, no laminate — just real wood flooring in the species and widths that GTA homeowners actually want.</p>
<p>That single-category focus means every dollar of their R&D goes into perfecting engineered hardwood construction. The result is a collection of <strong>48 options across five species</strong> with consistent plank quality from box to box.</p>`
    },
    {
      heading: 'Five Species, Two Widths',
      body: `<ul>
<li><strong>White Oak / European Oak:</strong> The modern standard — clean grain, takes stain beautifully, works in any design style.</li>
<li><strong>American Oak:</strong> Warmer tones, slightly more pronounced grain. Classic and versatile.</li>
<li><strong>Hickory:</strong> The durability champion. Dramatic grain variation — every plank is unique.</li>
<li><strong>Maple:</strong> Light, uniform, contemporary. The cleanest look in the lineup.</li>
<li><strong>American Walnut:</strong> Rich chocolate tones, luxury aesthetic. The premium choice.</li>
</ul>
<p>Available in <strong>6½" and 7½" plank widths</strong>. The wider 7½" planks are the more popular choice for open-concept living spaces — fewer seams, more visual impact.</p>`
    },
    {
      heading: 'Pricing: $4.99–$6.99/sqft',
      body: `<p>Canadian Standard sits in the mid-range for engineered hardwood — <strong>above the entry-level brands but below the premium European imports</strong>. At $4.99 to $6.99/sqft, you're getting genuine multi-ply engineered construction with real wood wear layers.</p>
<p>Walnut commands the top of the range. Oak and hickory fall in the middle. If you're working within a budget, the 6½" American oak options offer the best value per square foot.</p>`
    },
  ],
  faqItems: [
    { question: 'Is Canadian Standard engineered hardwood good?', answer: 'Canadian Standard is a dedicated engineered hardwood manufacturer with a focused product line of 48 options across oak, hickory, maple, and walnut. They are well-regarded for consistent quality and are carried by BBS Flooring at our Markham showroom.' },
    { question: 'What species does Canadian Standard offer?', answer: 'Canadian Standard offers white oak, European oak, American oak, American hickory, maple, and American walnut. All are available in engineered hardwood with 6½" or 7½" plank widths.' },
    { question: 'How much does Canadian Standard flooring cost?', answer: 'Canadian Standard engineered hardwood at BBS Flooring ranges from $4.99 to $6.99 per square foot. Oak and hickory are mid-range, while walnut is at the premium end. Call (647) 428-1111 for current pricing on specific products.' },
    { question: 'Can Canadian Standard hardwood be installed over radiant heat?', answer: 'Yes. Engineered hardwood is compatible with radiant heating systems due to its multi-layer construction, which provides dimensional stability. Our installers follow manufacturer specifications for temperature limits and moisture barriers.' },
    { question: 'Where can I see Canadian Standard flooring samples?', answer: 'BBS Flooring at 6061 Highway 7, Unit B, Markham carries the full Canadian Standard collection. Walk-ins welcome Monday–Saturday. Free in-home measurements available across the GTA.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'canadian standard'),
  productSessionKey: 'canadian-standard',
  productQueryKey: 'products-canadian-standard',
};

// ══════════════════════════════════════════════════════════
// TRIFOREST FLOORING — 38 products (vinyl 32, laminate 6)
// ══════════════════════════════════════════════════════════

export const triforestFlooringData = {
  route: 'TriforestFlooring',
  title: 'Triforest Flooring Markham | Vinyl Plank & Laminate',
  description: 'Shop Triforest Flooring in Markham — 38 products from $2.29/sqft. Waterproof vinyl plank and 12mm laminate. Condo approved. Call (647) 428-1111.',
  h1: 'Triforest Vinyl Plank & Laminate Flooring',
  subtitle: '38 Triforest products from $2.29/sqft. Waterproof vinyl in multiple thicknesses plus budget-friendly laminate — smart choices for cost-conscious renovations.',
  parentPage: null,
  schemaType: 'product',
  content: [
    {
      heading: 'Vinyl-Forward, Value-Driven',
      body: `<p>Triforest is primarily a vinyl brand — <strong>32 of their 38 products are waterproof vinyl plank</strong> — with a small laminate collection rounding out the lineup. If you know you want vinyl and you want options, Triforest delivers.</p>
<p>Their vinyl range covers multiple thickness levels, from <strong>ultra-thin 3.2mm glue-down to 5.5mm condo-approved SPC</strong>. This spread means you can find the right product whether you're refinishing a rental basement or upgrading your main floor.</p>`
    },
    {
      heading: 'Triforest Vinyl — 32 Options from $2.79/sqft',
      body: `<ul>
<li><strong>3.2mm + 1mm pad:</strong> Ultra-thin profile for low-clearance installations (basements with low ceilings, over existing floors).</li>
<li><strong>4.5mm + 1.5mm pad:</strong> Mid-range thickness, good balance of comfort and price.</li>
<li><strong>5mm + 1.5mm pad:</strong> Our recommendation for most rooms — substantial feel without premium pricing.</li>
<li><strong>5.5mm + 1.5mm condo pad:</strong> Meets condo board sound transmission requirements.</li>
</ul>
<p>All 32 options are waterproof and click-lock. Prices range from <strong>$2.79 to $3.49/sqft</strong> — one of the tighter price bands in our showroom, which means you're not paying a premium for the thicker options.</p>`
    },
    {
      heading: 'Triforest Laminate — 6 Options at $2.29/sqft',
      body: `<p>Triforest's 12mm laminate rounds out their lineup at $2.29/sqft. It's a straightforward, well-made laminate — no waterproof claims, just solid 12mm construction with realistic wood-grain finishes.</p>
<p>At this price point, it's one of the most affordable laminate options we carry and a strong choice for bedrooms, hallways, and home offices.</p>`
    },
  ],
  faqItems: [
    { question: 'Is Triforest vinyl plank waterproof?', answer: 'Yes. All 32 Triforest vinyl plank options are 100% waterproof with SPC cores. They can be installed in basements, kitchens, bathrooms, and laundry rooms without moisture concerns.' },
    { question: 'Does Triforest have condo-approved vinyl?', answer: 'Yes. Triforest offers 5.5mm + 1.5mm vinyl plank with integrated condo-approved underpad that meets the sound transmission requirements of most GTA condo boards. Verify your building\'s specific STC/IIC requirements with property management.' },
    { question: 'How much does Triforest flooring cost?', answer: 'Triforest vinyl ranges from $2.79 to $3.49/sqft and laminate is $2.29/sqft at BBS Flooring. These are among the most competitive prices in our Markham showroom. Call (647) 428-1111 for current pricing.' },
    { question: 'What thickness of Triforest vinyl is best?', answer: 'For most residential applications, we recommend 5mm + 1.5mm underpad or thicker. The 3.2mm option works for low-clearance situations. If you live in a condo, the 5.5mm condo-approved option is the right choice. Visit our showroom for samples.' },
    { question: 'Where can I buy Triforest Flooring?', answer: 'BBS Flooring at 6061 Highway 7, Unit B, Markham carries 38 Triforest products in stock. Walk-ins welcome Monday–Saturday. Free in-home measurements across the GTA.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'triforest'),
  productSessionKey: 'triforest',
  productQueryKey: 'products-triforest',
};

// ══════════════════════════════════════════════════════════
// SIMBA FLOORING — 27 products (vinyl only)
// ══════════════════════════════════════════════════════════

export const simbaFlooringData = {
  route: 'SimbaFlooring',
  title: 'Simba Flooring Markham | Vinyl, Engineered Hardwood & Laminate',
  description: 'Shop Simba Flooring in Markham — 103 products from $2.29/sqft. SPC vinyl plank, herringbone, engineered hardwood (Oak, Hickory, Birch), and waterproof laminate. Call (647) 428-1111.',
  h1: 'Simba Flooring — Vinyl, Engineered Hardwood & Laminate',
  subtitle: '103 Simba products from $2.29/sqft — vinyl plank, herringbone, engineered hardwood in Oak & Hickory, and waterproof laminate.',
  parentPage: { label: 'Shop', route: 'Shop' },
  schemaType: 'product',
  content: [
    {
      heading: 'A Full Flooring Lineup Under One Brand',
      body: `<p>Simba Flooring covers three product categories: <strong>SPC vinyl plank</strong> (including herringbone), <strong>engineered hardwood</strong>, and <strong>waterproof laminate</strong>. Whether you're doing a basement in vinyl, a main floor in engineered Oak, or a budget renovation with laminate — Simba has a product for it.</p>
<p>BBS Flooring carries the complete Simba lineup in Markham, including exclusive showroom-only options not available online.</p>`
    },
    {
      heading: 'Engineered Hardwood — Oak & Hickory from $3.49/sqft',
      body: `<p>Simba's engineered hardwood collection is the largest part of their lineup — <strong>45 products in Oak, Hickory, Birch, Maple, Sapele, and Black Walnut</strong>. Available in 3/4", 5/8", 3/5", and 1/2" thicknesses, with wire-brushed finishes across most colours.</p>
<ul>
<li>Species: Oak (most common), Hickory, Birch, Maple, Sapele, Black Walnut</li>
<li>Plank widths: 4" standard, 6.5" wide-plank, 9.5" extra-wide</li>
<li>AB grade = the clean, uniform look. Rustic grades available too.</li>
<li>Price range: $3.49–$8.99/sqft depending on species and thickness</li>
</ul>`
    },
    {
      heading: 'SPC Vinyl — 6.5–7mm from $2.29/sqft',
      body: `<p>Simba's vinyl lineup includes standard plank and their signature <strong>herringbone pattern vinyl</strong> — one of the few brands offering herringbone at this price point. All vinyl is 100% waterproof SPC with integrated underpad.</p>
<ul>
<li>Universe & Galaxy collections: 6.5mm SPC, integrated 1.5mm IXPE underpad, 12–20mil wear layer</li>
<li>Venus Herringbone: 7mm, 12mil wear layer, click-lock installation</li>
<li>Galaxy Pressed U-Groove: 8mm premium plank, $3.39/sqft</li>
<li>Planet Tile Visual: realistic tile-look SPC, $2.99/sqft</li>
</ul>`
    },
    {
      heading: 'Waterproof Laminate — Rocky Mountain & Danube from $2.69/sqft',
      body: `<p>Simba's waterproof laminate comes in two collections. <strong>Rocky Mountain</strong> is a premium 14mm plank (60"×9") — one of the thickest laminates on the market. <strong>Danube</strong> offers a range of widths and lengths at a more accessible price point. Both are AC4 rated for heavy residential use.</p>
<ul>
<li>Rocky Mountain: 14mm, 60"×9", AC4 — $2.69/sqft</li>
<li>Danube: 48"×7", 60"×9", 72"×9" options — $2.79–$2.89/sqft</li>
<li>Waterproof core: safe for kitchens and laundry rooms</li>
</ul>`
    },
  ],
  faqItems: [
    { question: 'Does Simba Flooring offer engineered hardwood?', answer: 'Yes. Simba has 45 engineered hardwood products in Oak, Hickory, Birch, Maple, Sapele, and Black Walnut. Available in 3/4", 5/8", 3/5", and 1/2" thicknesses from $3.49/sqft at BBS Flooring in Markham.' },
    { question: 'Does Simba Flooring offer herringbone vinyl?', answer: 'Yes. Simba offers 7mm herringbone vinyl plank (Venus collection) with 1.5mm integrated underpad. Click-lock installation — no specialized herringbone skills required. Available from $3.59/sqft at BBS Flooring.' },
    { question: 'Is Simba vinyl flooring waterproof?', answer: 'Yes. All Simba SPC vinyl is 100% waterproof with Stone Polymer Composite cores. Safe for basements, kitchens, bathrooms, and laundry rooms.' },
    { question: 'What is the thickest Simba laminate?', answer: 'Simba Rocky Mountain is 14mm thick — one of the thickest laminates available. It\'s 60"×9" wide plank, AC4 rated, and waterproof. Available at $2.69/sqft at BBS Flooring Markham.' },
    { question: 'Where can I buy Simba Flooring in Markham?', answer: 'BBS Flooring at 6061 Highway 7, Unit B, Markham carries 103 Simba products across vinyl, engineered hardwood, and laminate. Walk-ins welcome Monday–Saturday 10am–5pm. Call (647) 428-1111.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'simba'),
  productSessionKey: 'simba',
  productQueryKey: 'products-simba',
};

// ══════════════════════════════════════════════════════════
// LEE FLOORING — 24 products (EH 14, vinyl 10)
// ══════════════════════════════════════════════════════════

export const leeFlooringData = {
  route: 'LeeFlooring',
  title: 'Lee Flooring Markham | Engineered Hardwood & Vinyl',
  description: 'Shop Lee Flooring in Markham — 24 products from $2.29/sqft. Engineered oak hardwood and vinyl plank with condo pad. Call (647) 428-1111.',
  h1: 'Lee Engineered Hardwood & Vinyl Flooring',
  subtitle: '24 Lee products from $2.29/sqft. European and American oak engineered hardwood plus 7mm vinyl with condo-approved underpad.',
  parentPage: null,
  schemaType: 'product',
  content: [
    {
      heading: 'A Focused Collection That Gets It Right',
      body: `<p>Lee keeps it simple — <strong>14 engineered hardwood and 10 vinyl options</strong>. No bloated catalog of overlapping products. Every SKU has a clear purpose, which makes the selection process easier for homeowners and contractors alike.</p>
<p>Their engineered hardwood is exclusively oak (European and American), and their vinyl is a single well-spec'd 7mm plank with condo-approved underpad. If you know what you want, Lee gets you there fast.</p>`
    },
    {
      heading: 'Lee Engineered Hardwood — 14 Options from $3.49/sqft',
      body: `<p>Lee's hardwood line focuses on <strong>6½" engineered oak</strong> in both European and American varieties. Prices range from $3.49 to $3.79/sqft — which is genuinely entry-level pricing for real wood flooring.</p>
<p>At under $4/sqft, these compete directly with premium vinyl on price — but you're getting actual hardwood. For homeowners who want real wood and thought it was out of budget, Lee changes the math.</p>`
    },
    {
      heading: 'Lee Vinyl — 10 Options at $2.29/sqft',
      body: `<p>Lee's vinyl is a single product line: <strong>7mm with 2mm condo-approved underpad</strong>. The 2mm pad is thicker than the industry-standard 1.5mm, which translates to better sound dampening and a cushier feel underfoot.</p>
<p>At a flat $2.29/sqft, it's straightforward pricing with no option paralysis. Ten colour choices, one thickness, one price.</p>`
    },
  ],
  faqItems: [
    { question: 'Is Lee Flooring affordable?', answer: 'Yes. Lee engineered hardwood starts at $3.49/sqft — among the lowest prices for real wood flooring at BBS Flooring. Their vinyl is a flat $2.29/sqft. Both represent strong value for budget-conscious renovations.' },
    { question: 'What type of hardwood does Lee offer?', answer: 'Lee offers 6½" engineered European oak and American oak. All options are engineered construction for dimensional stability and radiant heat compatibility.' },
    { question: 'Is Lee vinyl condo approved?', answer: 'Lee offers 7mm vinyl with 2mm condo-approved underpad — thicker than the typical 1.5mm pad. This meets most condo board sound requirements. Verify your specific building\'s STC/IIC requirements with property management.' },
    { question: 'How does Lee compare to other flooring brands?', answer: 'Lee competes on value. Their engineered hardwood is priced below most competitors while offering real oak in 6½" widths. Their vinyl is straightforward — one well-spec\'d product at a flat price. Visit BBS Flooring in Markham to compare Lee with other brands side by side.' },
    { question: 'Where can I buy Lee Flooring in the GTA?', answer: 'BBS Flooring at 6061 Highway 7, Unit B, Markham carries 24 Lee products — engineered hardwood and vinyl. Walk-ins welcome Monday–Saturday. Free in-home measurements across the GTA.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'lee'),
  productSessionKey: 'lee',
  productQueryKey: 'products-lee',
};

// ══════════════════════════════════════════════════════════
// TOSCA FLOORS — 21 products (laminate only)
// ══════════════════════════════════════════════════════════

export const toscaFlooringData = {
  route: 'ToscaFlooring',
  title: 'Tosca Floors Markham | Budget Laminate Flooring',
  description: 'Shop Tosca laminate flooring in Markham — 21 products from $0.99/sqft. The most affordable laminate in our showroom. Call (647) 428-1111.',
  h1: 'Tosca Laminate Flooring',
  subtitle: '21 Tosca laminate products starting under $2/sqft — the most budget-friendly flooring in our showroom. Ideal for rentals, flips, and large-area renovations.',
  parentPage: { label: 'Laminate', route: 'Laminate' },
  schemaType: 'product',
  content: [
    {
      heading: 'Maximum Coverage, Minimum Cost',
      body: `<p>Tosca is the brand for when you need to cover a lot of square footage without breaking the budget. Their laminate tops out under <strong>$2/sqft</strong> — the lowest price point in our entire showroom.</p>
<p>This isn't about cutting corners. Tosca makes straightforward laminate flooring that does what it needs to do: cover your subfloor with a clean, wood-look surface that handles foot traffic. No fancy claims, no premium positioning — just affordable flooring that works.</p>`
    },
    {
      heading: 'Where Tosca Makes Sense',
      body: `<ul>
<li><strong>Rental properties:</strong> Landlords replacing carpet or damaged flooring at minimal cost.</li>
<li><strong>House flips:</strong> Clean, new-looking floors across an entire home for a fraction of hardwood prices.</li>
<li><strong>Large basements:</strong> Covering 500+ sqft without the budget ballooning.</li>
<li><strong>Kids' bedrooms and playrooms:</strong> If it gets damaged, replacement is painless.</li>
<li><strong>Staging:</strong> Fresh floors for selling — looks good in photos, easy to replace after.</li>
</ul>
<p>For homeowners doing a forever-home renovation, we'd typically steer you toward a thicker laminate or vinyl. But for the use cases above, Tosca is the right tool for the job.</p>`
    },
  ],
  faqItems: [
    { question: 'How much does Tosca laminate cost?', answer: 'Tosca laminate at BBS Flooring starts under $1/sqft and tops out under $2/sqft. It is the most affordable flooring option in our Markham showroom. Call (647) 428-1111 for current pricing.' },
    { question: 'Is Tosca laminate good for rental properties?', answer: 'Yes. Tosca laminate is popular with landlords and property managers because it provides a clean, wood-look finish at the lowest possible price point. Easy to install, easy to replace if damaged, and looks good in listing photos.' },
    { question: 'Is Tosca laminate waterproof?', answer: 'Tosca laminate is standard (non-waterproof) laminate. It handles normal foot traffic and light spills if cleaned promptly, but is not recommended for bathrooms, kitchens, or basements where standing water is a risk. For wet areas, consider waterproof vinyl instead.' },
    { question: 'How does Tosca compare to more expensive laminate?', answer: 'Tosca is thinner than 12mm premium laminate and does not have waterproof features. The trade-off is price — under $2/sqft vs. $3-4/sqft for premium brands. For bedrooms, hallways, and low-moisture areas, Tosca performs well. For main living areas or moisture-prone rooms, we recommend stepping up.' },
    { question: 'Where can I buy Tosca laminate?', answer: 'BBS Flooring at 6061 Highway 7, Unit B, Markham carries 21 Tosca laminate products. Walk-ins welcome Monday–Saturday. We offer free in-home measurements across the GTA.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'tosca'),
  productSessionKey: 'tosca',
  productQueryKey: 'products-tosca',
};

// ══════════════════════════════════════════════════════════
// APPALACHIAN FLOORING — 18 products (solid hardwood only)
// ══════════════════════════════════════════════════════════

export const appalachianFlooringData = {
  route: 'AppalachianFlooring',
  title: 'Appalachian Flooring Markham | Solid Hardwood',
  description: 'Shop Appalachian solid hardwood in Markham — 18 products from $5.99/sqft. Solid maple and red oak. Canadian-made. Call (647) 428-1111.',
  h1: 'Appalachian Solid Hardwood Flooring',
  subtitle: '18 solid hardwood options in maple and red oak from $5.99/sqft. Real ¾" Canadian hardwood — sand it, refinish it, pass it down.',
  parentPage: { label: 'Solid Hardwood', route: 'SolidHardwood' },
  schemaType: 'product',
  content: [
    {
      heading: 'The Real Thing — ¾" Solid Hardwood',
      body: `<p>Appalachian makes <strong>solid hardwood flooring</strong>. Not engineered, not veneer — full ¾" thick real wood from top to bottom. This is the flooring you install once and refinish for the next fifty years.</p>
<p>Their collection focuses on two of the most proven North American species: <strong>maple and red oak</strong>. Both are abundant, durable, and take stain beautifully. There's nothing exotic or trendy here — just timeless hardwood that outlasts everything else in your home.</p>`
    },
    {
      heading: 'Maple — Clean, Light, Contemporary',
      body: `<p>Appalachian's solid maple is for homeowners who want a <strong>light, uniform floor</strong>. Maple's tight grain pattern creates a clean, modern look that pairs well with contemporary and Scandinavian-inspired interiors.</p>
<p>Maple is also one of the <strong>harder domestic species</strong> — rated 1,450 on the Janka hardness scale — making it highly resistant to denting from furniture and foot traffic.</p>`
    },
    {
      heading: 'Red Oak — Warm, Classic, Timeless',
      body: `<p>Red oak is the <strong>most installed hardwood species in North America</strong>, and for good reason. Its warm tones, prominent grain, and excellent stain absorption make it the most versatile option for any home style.</p>
<p>Appalachian's solid red oak at $5.99 to $6.89/sqft delivers genuine Canadian hardwood at a price that respects your renovation budget.</p>`
    },
  ],
  faqItems: [
    { question: 'Is Appalachian Flooring Canadian-made?', answer: 'Appalachian is a Canadian flooring manufacturer specializing in solid hardwood. Their maple and red oak are sourced and manufactured in North America. BBS Flooring carries 18 Appalachian products at our Markham showroom.' },
    { question: 'How much does Appalachian solid hardwood cost?', answer: 'Appalachian solid hardwood at BBS Flooring ranges from $5.99 to $6.89 per square foot for both maple and red oak. This is competitive pricing for ¾" solid hardwood. Call (647) 428-1111 for current availability.' },
    { question: 'Can solid hardwood be refinished?', answer: 'Yes. Solid hardwood is ¾" thick and can be sanded and refinished multiple times over its lifetime — typically 5-7 refinishing cycles. This makes it a long-term investment that can last 50+ years with proper maintenance.' },
    { question: 'Is solid hardwood better than engineered?', answer: 'Neither is universally better — they suit different situations. Solid hardwood is ideal for main floors with plywood subfloors where you want lifetime refinishability. Engineered is better over concrete, with radiant heat, or below grade. Our team can recommend the right choice for your specific installation.' },
    { question: 'Where can I buy Appalachian Flooring in Markham?', answer: 'BBS Flooring at 6061 Highway 7, Unit B, Markham carries 18 Appalachian solid hardwood products. Walk-ins welcome Monday–Saturday. Free in-home measurements across the GTA.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'appalachian'),
  productSessionKey: 'appalachian',
  productQueryKey: 'products-appalachian',
};

// ══════════════════════════════════════════════════════════
// EVERGREEN BUILDING MATERIALS — 16 products (laminate only)
// ══════════════════════════════════════════════════════════

export const evergreenFlooringData = {
  route: 'EvergreenFlooring',
  title: 'Evergreen Flooring Markham | 12mm Waterproof Laminate',
  description: 'Shop Evergreen 12mm waterproof laminate in Markham — 16 products from $2.99/sqft. Thick, durable, moisture-resistant. Call (647) 428-1111.',
  h1: 'Evergreen 12mm Waterproof Laminate',
  subtitle: '16 waterproof laminate options from $2.99/sqft. 12mm thick with moisture-resistant cores — the laminate upgrade for kitchens, entryways, and main floors.',
  parentPage: { label: 'Laminate', route: 'Laminate' },
  schemaType: 'product',
  content: [
    {
      heading: 'Laminate, But Make It Waterproof',
      body: `<p>Evergreen's entire lineup is <strong>12mm waterproof laminate</strong>. That combination matters — 12mm gives you the thickness and solidity that cheap laminate lacks, and the waterproof core means you're not panicking when someone spills a glass of water in the kitchen.</p>
<p>Traditional laminate's biggest weakness was moisture. Evergreen eliminates that weakness while keeping the realistic wood-grain looks and click-lock installation that make laminate popular in the first place.</p>`
    },
    {
      heading: 'Why 12mm Matters',
      body: `<ul>
<li><strong>Sound:</strong> Thicker laminate sounds more solid underfoot — less of the hollow echo that gives cheap laminate away.</li>
<li><strong>Feel:</strong> 12mm planks flex less, which means they feel more like real hardwood when you walk on them.</li>
<li><strong>Durability:</strong> Thicker wear layers resist scratching and denting better than 8mm alternatives.</li>
<li><strong>Subfloor tolerance:</strong> 12mm planks bridge minor subfloor imperfections more effectively than thin laminate.</li>
</ul>`
    },
    {
      heading: 'Pricing: $2.99–$3.79/sqft',
      body: `<p>Evergreen waterproof laminate ranges from <strong>$2.99 to $3.79/sqft</strong>. That puts it in the sweet spot between budget laminate (under $2) and premium vinyl ($3-5). You're getting waterproof protection and 12mm thickness at a price that keeps whole-home renovations affordable.</p>
<p>For homeowners who like the idea of laminate but worry about moisture, Evergreen is the answer. For those considering vinyl but preferring the feel of laminate, Evergreen is the compromise that doesn't feel like a compromise.</p>`
    },
  ],
  faqItems: [
    { question: 'Is Evergreen laminate really waterproof?', answer: 'Yes. Evergreen laminate uses a moisture-resistant core that prevents the swelling and warping that traditional laminate suffers when exposed to water. It handles spills, splashes, and everyday moisture. However, it should not be submerged or exposed to standing water for extended periods.' },
    { question: 'How much does Evergreen laminate cost?', answer: 'Evergreen 12mm waterproof laminate at BBS Flooring ranges from $2.99 to $3.79 per square foot. Call (647) 428-1111 for pricing on specific colours and styles.' },
    { question: 'Is 12mm laminate better than 8mm?', answer: '12mm laminate is thicker, more durable, sounds more solid underfoot, and bridges subfloor imperfections better than 8mm. The trade-off is a slightly higher price. For main living areas and high-traffic zones, 12mm is the better investment.' },
    { question: 'Can Evergreen laminate go in kitchens?', answer: 'Yes. Evergreen\'s waterproof core makes it suitable for kitchens and entryways — areas where traditional laminate would be risky. Clean up spills promptly as with any flooring. For bathrooms, we typically recommend vinyl plank instead.' },
    { question: 'Where can I buy Evergreen laminate flooring?', answer: 'BBS Flooring at 6061 Highway 7, Unit B, Markham carries 16 Evergreen waterproof laminate products. Walk-ins welcome Monday–Saturday. Free measurements across the GTA.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'evergreen'),
  productSessionKey: 'evergreen',
  productQueryKey: 'products-evergreen',
};

// ══════════════════════════════════════════════════════════
// SHERWOOD FOREST PRODUCTS — 16 products (solid hardwood only)
// ══════════════════════════════════════════════════════════

export const sherwoodFlooringData = {
  route: 'SherwoodFlooring',
  title: 'Sherwood Forest Products Markham | Solid Hardwood',
  description: 'Shop Sherwood Forest Products solid hardwood in Markham — 16 options from $5.69/sqft. Maple and red oak in 3¼" and 4¼" planks. Call (647) 428-1111.',
  h1: 'Sherwood Forest Products — Solid Hardwood',
  subtitle: '16 solid hardwood options in maple and red oak. Traditional 3¼" and 4¼" plank widths from $5.69/sqft — classic hardwood for classic homes.',
  parentPage: { label: 'Solid Hardwood', route: 'SolidHardwood' },
  schemaType: 'product',
  content: [
    {
      heading: 'Traditional Plank Widths, Proven Species',
      body: `<p>Sherwood Forest Products makes <strong>solid maple and red oak hardwood in 3¼" and 4¼" plank widths</strong>. These are the traditional dimensions that have been the standard in North American homes for decades.</p>
<p>If your home already has existing hardwood in these widths and you're extending it into a new room — or replacing a damaged section — Sherwood's dimensions will match seamlessly. They're also the right choice for homeowners who prefer the classic narrow-plank look over the modern wide-plank trend.</p>`
    },
    {
      heading: 'Two Species, Purpose-Built',
      body: `<p><strong>Maple (3¼" and 4¼"):</strong> Tight, uniform grain. Light natural colour. Janka hardness of 1,450 — harder than oak and more resistant to denting. The practical choice for families with kids and pets.</p>
<p><strong>Red Oak (3¼" and 4¼"):</strong> The most popular hardwood species in North America. Warm tones, visible grain character, and excellent stain absorption. Red oak at 1,290 Janka is plenty durable for residential use and takes on completely different personalities depending on the stain colour.</p>`
    },
    {
      heading: 'Pricing: $5.69–$7.00/sqft',
      body: `<p>Sherwood solid hardwood ranges from $5.69 to $7.00/sqft. The 3¼" planks sit at the lower end of the range, and the 4¼" options trend higher. Both are competitive for ¾" solid hardwood — a product category where prices at other retailers often start at $7+.</p>`
    },
  ],
  faqItems: [
    { question: 'What plank widths does Sherwood Forest Products offer?', answer: 'Sherwood offers 3¼" and 4¼" solid hardwood planks in both maple and red oak. These are traditional North American plank widths that match existing hardwood in many homes.' },
    { question: 'Is Sherwood hardwood real solid wood?', answer: 'Yes. Sherwood Forest Products makes ¾" solid hardwood — real wood from top to bottom, not engineered or veneer. It can be sanded and refinished multiple times over its 50+ year lifespan.' },
    { question: 'How much does Sherwood hardwood cost?', answer: 'Sherwood solid hardwood at BBS Flooring ranges from $5.69 to $7.00 per square foot for maple and red oak. Call (647) 428-1111 for current pricing and availability.' },
    { question: 'Can I match Sherwood hardwood to my existing floors?', answer: 'Sherwood\'s 3¼" and 4¼" widths match the most common existing hardwood dimensions in Ontario homes. If you are extending hardwood into a new room, these dimensions will blend with your current floors once stained and finished. Bring a sample to our showroom for colour matching.' },
    { question: 'Where can I see Sherwood hardwood samples?', answer: 'BBS Flooring at 6061 Highway 7, Unit B, Markham carries 16 Sherwood Forest Products options. Walk-ins welcome Monday–Saturday. Free in-home measurements across the GTA.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'sherwood'),
  productSessionKey: 'sherwood',
  productQueryKey: 'products-sherwood',
};

// ══════════════════════════════════════════════════════════
// GOLDEN CHOICE — 6 products (laminate only)
// ══════════════════════════════════════════════════════════

export const goldenChoiceFlooringData = {
  route: 'GoldenChoiceFlooring',
  title: 'Golden Choice Flooring Markham | 12mm Waterproof Laminate',
  description: 'Shop Golden Choice 12mm waterproof laminate in Markham — 6 curated options at $3.49/sqft. In stock at BBS Flooring. Call (647) 428-1111.',
  h1: 'Golden Choice 12mm Waterproof Laminate',
  subtitle: '6 curated waterproof laminate options at $3.49/sqft. A small, focused collection — every colour handpicked for our showroom.',
  parentPage: { label: 'Laminate', route: 'Laminate' },
  schemaType: 'product',
  content: [
    {
      heading: 'Small Collection, Big Impact',
      body: `<p>Golden Choice takes the opposite approach to most brands — instead of 50 options that overlap, they offer <strong>6 curated waterproof laminate colours at a single price point</strong>. Every option is 12mm thick with a waterproof core.</p>
<p>This works in your favour. Instead of drowning in choices, you pick from six distinct looks that have been selected to cover the most popular aesthetics: light oak, medium walnut, grey wash, and warm chestnut tones.</p>`
    },
    {
      heading: 'One Price: $3.49/sqft',
      body: `<p>No tiers, no option anxiety, no discovering that the colour you like is in the expensive range. Golden Choice is <strong>$3.49/sqft across the board</strong> — 12mm waterproof laminate with click-lock installation.</p>
<p>At this price, you're in the mid-range for laminate and getting waterproof protection plus 12mm thickness. It's a straightforward value proposition.</p>`
    },
  ],
  faqItems: [
    { question: 'Is Golden Choice laminate waterproof?', answer: 'Yes. All Golden Choice laminate is 12mm with a waterproof core. It handles spills, splashes, and everyday moisture. Suitable for kitchens, entryways, and main living areas.' },
    { question: 'How much does Golden Choice laminate cost?', answer: 'Golden Choice laminate is $3.49 per square foot across all 6 colour options at BBS Flooring. One price, no tiers.' },
    { question: 'How many Golden Choice colours are available?', answer: 'BBS Flooring carries 6 Golden Choice laminate colours. The collection is intentionally curated — each colour covers a distinct aesthetic range. Visit our Markham showroom to see all options in person.' },
    { question: 'Where can I buy Golden Choice laminate?', answer: 'BBS Flooring at 6061 Highway 7, Unit B, Markham carries all 6 Golden Choice laminate products. Walk-ins welcome Monday–Saturday.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'golden choice'),
  productSessionKey: 'golden-choice',
  productQueryKey: 'products-golden-choice',
};
