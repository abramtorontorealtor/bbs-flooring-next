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
  title: 'NAF Flooring Review & Prices Markham | Canadian-Made, 30-Yr Warranty',
  description: 'Is NAF flooring good? Canadian-made, 30-year residential warranty, AC5 laminate, 100% waterproof AquaPlus vinyl. 170+ products from $2.39/sqft at BBS Flooring Markham. Call (647) 428-1111.',
  h1: 'NAF Flooring — Vinyl, Hardwood & Laminate',
  subtitle: 'Canadian-made, backed by a 30-year residential warranty — 170+ NAF products in stock at our Markham showroom. Waterproof AquaPlus vinyl, engineered oak, and AC5-rated laminate. One trusted brand covers every room in your home.',
  parentPage: null,
  schemaType: 'product',
  content: [
    {
      heading: 'Is NAF Flooring Good? Why It\'s Worth It',
      body: `<p>NAF is one of the strongest all-round brands we carry — here's what sets it apart:</p>
<ul>
<li><strong>Canadian-made</strong> — built and quality-controlled for Canadian climates, not imported and hoping for the best.</li>
<li><strong>30-year residential warranty</strong> (5-year light commercial) — serious backing across the lineup.</li>
<li><strong>100% waterproof AquaPlus vinyl</strong> — SPC cores rated for basements, kitchens, and bathrooms with zero moisture worry.</li>
<li><strong>AC5 commercial-grade laminate</strong> — the toughest wear rating available, including the 14mm Waterproof PRO with attached underpad.</li>
<li><strong>One brand, every room</strong> — vinyl, engineered hardwood, and laminate under a single warranty contact instead of juggling three manufacturers.</li>
</ul>
<p>That last point matters more than it sounds: consistent quality standards floor to floor, and one number to call if anything ever goes wrong. All of it in stock at BBS Flooring right now.</p>`
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
      heading: 'NAF Laminate — 42 Options from $2.39/sqft',
      body: `<p>NAF's laminate lineup spans three tiers: <strong>Standard 12mm</strong> ($2.39–$2.59/sqft), <strong>12mm Waterproof</strong> ($2.79–$3.09/sqft), and the all-new <strong><a href="/products/horizon-naf-14mm-waterproof-laminate">14mm Waterproof Laminate PRO</a></strong> ($3.19/sqft) — our thickest, quietest laminate with an attached 2mm EVA underpad and AC5 commercial-grade surface.</p>
<p>The 14mm PRO line comes in 10 colours from whitewashed grey to deep espresso walnut, with Välinge 5G drop-lock installation — no glue, no nails, no separate underlay needed. It's the closest a laminate gets to real hardwood feel at a fraction of the price.</p>
<p>Every NAF laminate is 12mm+ thick. We don't carry thin, hollow-sounding laminate. See the full range at our Markham showroom.</p>`
    },
  ],
  faqItems: [
    { question: 'Is NAF Flooring a good brand?', answer: 'Yes — NAF is one of the better all-round brands available. It\'s Canadian-made, carries a 30-year residential warranty, and spans vinyl, engineered hardwood, and laminate all built for Canadian climate conditions. Its AquaPlus vinyl is 100% waterproof and its laminate is AC5-rated (the toughest wear class). BBS Flooring carries 170+ NAF products and installs them regularly across the GTA.' },
    { question: 'How much does NAF vinyl flooring cost?', answer: 'NAF vinyl plank at BBS Flooring ranges from $2.99 to $4.29 per square foot depending on thickness and underpad type. The 7mm options with cork underpad are the most popular for homes. Call (647) 428-1111 for current pricing on specific products.' },
    { question: 'Is NAF vinyl flooring waterproof?', answer: 'Yes. All NAF vinyl plank flooring is 100% waterproof with an SPC (Stone Polymer Composite) core. It can be installed in basements, kitchens, bathrooms, and laundry rooms without moisture concerns.' },
    { question: 'Where can I buy NAF Flooring in Markham?', answer: 'BBS Flooring at 6061 Highway 7, Unit B carries 170+ NAF products in stock — vinyl, engineered hardwood, and laminate including the new 14mm PRO line. Walk-ins welcome Monday–Saturday. We also offer free in-home measurements across the GTA.' },
    { question: 'Does NAF engineered hardwood work with radiant heat?', answer: 'Yes. NAF engineered hardwood is compatible with radiant heating systems. The multi-layer construction provides dimensional stability that solid hardwood cannot match over heated subfloors. Our installers follow manufacturer specifications for all radiant heat installations.' },
    { question: 'What is NAF 14mm Waterproof Laminate PRO?', answer: 'NAF\'s premium laminate tier — 14mm thick with a built-in 2mm EVA underpad (IIC 72dB), AC5 commercial-grade surface, Välinge 5G drop-lock click, and FloorScore certification. Available in 10 colours at $3.19/sqft. No separate underlay needed. See all 10 colours at BBS Flooring in Markham.' },
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
  title: 'Northernest Flooring Review & Prices | Canadian Hardwood Markham',
  description: 'Is Northernest flooring good? Canadian-built hardwood — one of our deepest real-wood selections in oak, maple & hickory, engineered and solid, from $3.19/sqft. BBS Flooring Markham. Call (647) 428-1111.',
  h1: 'Northernest Hardwood & Laminate Flooring',
  subtitle: 'One of our deepest real-hardwood selections — Canadian-built engineered and solid oak, maple, and hickory from $3.19/sqft, plus 12mm European laminate. All in stock at our Markham showroom.',
  parentPage: null,
  schemaType: 'product',
  content: [
    {
      heading: 'Is Northernest Flooring Good? Why It\'s Worth It',
      body: `<p>For anyone shopping real wood, Northernest is one of the strongest values we carry — here's why:</p>
<ul>
<li><strong>Canadian-built and climate-ready</strong> — engineered for Ontario's humidity and temperature swings.</li>
<li><strong>One of our deepest real-hardwood selections</strong> — 70 engineered and 18 solid options in white oak, red oak, maple, and hickory.</li>
<li><strong>Real 7½" wide-plank European oak</strong> from under $5/sqft — genuinely hard to beat for the quality.</li>
<li><strong>Both installation systems</strong> — traditional tongue-and-groove for glue/nail-down, plus click-lock for faster, lower-cost installs.</li>
<li><strong>Solid ¾" options</strong> that sand and refinish for decades — the buy-it-once floor.</li>
</ul>
<p>What really sets Northernest apart is that range: whether you want a fast-installing click floor or a lifetime nail-down solid, you stay in one trusted brand without sacrificing the look or feel of real hardwood.</p>`
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
    { question: 'Is Northernest flooring good quality?', answer: 'Yes. Northernest is Canadian-built and designed for Ontario\'s climate, and it offers one of the deepest real-hardwood selections we carry — 70 engineered and 18 solid options in oak, maple, and hickory. Highlights include real 7½" wide-plank European oak from under $5/sqft and both tongue-and-groove and click-lock systems. For real wood at this price, it\'s hard to beat. BBS Flooring carries 106 Northernest products in Markham.' },
    { question: 'Is Northernest a Canadian flooring brand?', answer: 'Northernest is built for Canadian climate conditions. Their engineered hardwood is designed to handle the temperature and humidity swings typical in Ontario homes. BBS Flooring carries 106 Northernest products at our Markham showroom.' },
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
  title: 'Woden Flooring Review & Prices Markham | Lifetime Waterproof Warranty',
  description: 'Is Woden flooring good? Lifetime residential waterproof warranty, AC4-rated, up to 4mm wear layer — among the thickest SPC vinyl we carry. From $2.59/sqft at BBS Flooring Markham. Call (647) 428-1111.',
  h1: 'Woden Vinyl & Engineered Hardwood Flooring',
  subtitle: 'Backed by a lifetime residential waterproof warranty — Woden vinyl and engineered oak from $2.59/sqft, in stock at our Markham showroom. Home of one of the thickest, most substantial SPC vinyl planks we carry.',
  parentPage: null,
  schemaType: 'product',
  content: [
    {
      heading: 'Is Woden Flooring Good? Why It\'s Worth It',
      body: `<p>Woden keeps its lineup tight and its quality high — here's what stands out:</p>
<ul>
<li><strong>Lifetime residential waterproof warranty</strong> — one of the strongest warranties on any vinyl we carry.</li>
<li><strong>AC4 commercial wear rating</strong> — built for heavy traffic, kids, and pets.</li>
<li><strong>Up to a 4mm wear layer (28mil)</strong> — dramatically thicker than the typical 12–20mil vinyl, which means far better scratch and dent resistance.</li>
<li><strong>Up to 11mm plank thickness</strong> — among the thickest SPC vinyl on the market, with a solid, quiet, hardwood-like feel underfoot.</li>
<li><strong>Real engineered oak too</strong> — white and natural oak so you can run wood in living areas and vinyl in wet areas, all one brand.</li>
</ul>
<p>They don't try to be everything to everyone — they make vinyl and hardwood, and they make them exceptionally well.</p>`
    },
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
    { question: 'Is Woden Flooring good quality?', answer: 'Yes. Woden is backed by a lifetime residential waterproof warranty, carries an AC4 commercial wear rating, and offers up to a 4mm (28mil) wear layer — far thicker than typical vinyl, so it resists scratches and dents dramatically better. Its 11mm plank is among the thickest SPC options available, with a solid hardwood-like feel underfoot. BBS Flooring carries 62 Woden products and has installed them across the GTA without issues.' },
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
  title: 'Falcon Flooring Review & Prices Markham | Affordable Hardwood & Vinyl',
  description: 'Is Falcon flooring good value? Real hickory hardwood, 100% waterproof vinyl, condo-approved options from $1.79/sqft — the most affordable quality floors at BBS Flooring Markham. Call (647) 428-1111.',
  h1: 'Falcon Flooring — Hardwood, Vinyl & Laminate',
  subtitle: 'The value pick that doesn\'t feel cheap — real hickory hardwood, 100% waterproof vinyl, and 12mm laminate from $1.79/sqft. 56 Falcon products in stock at our Markham showroom.',
  parentPage: null,
  schemaType: 'product',
  content: [
    {
      heading: 'Is Falcon Flooring Good Value? Why It\'s Worth It',
      body: `<p>Falcon is the brand we recommend when the budget matters but you refuse to compromise on what goes under your feet. Here's why it works:</p>
<ul>
<li><strong>Lowest entry prices in our showroom</strong> — vinyl from $1.79/sqft, laminate from $2.69, engineered hardwood from $3.89, without the usual quality corners.</li>
<li><strong>Real hickory hardwood</strong> — the hardest North American species commercially available, so it stands up to kids, dogs, and heavy traffic.</li>
<li><strong>100% waterproof vinyl</strong> — including condo-approved options with integrated underpad that meet most GTA condo board sound rules.</li>
<li><strong>All three categories</strong> — hardwood, vinyl, and 12mm waterproof laminate, perfect for whole-home renos on one budget.</li>
</ul>
<p>Different flooring for different rooms, one affordable brand, total cost kept manageable — that's the Falcon advantage.</p>`
    },
    {
      heading: 'Falcon Engineered Hardwood — 25 Options from $3.89/sqft',
      body: `<p>Falcon's engineered hardwood line includes <strong>hickory, maple, and red oak</strong> in 6½" plank widths. At $3.89 to $4.49/sqft, you're getting real wood flooring at prices that compete with premium vinyl.</p>
<p>Hickory is worth a special mention — it's the hardest North American wood species commercially available, making it the smart choice for homes with kids, dogs, or heavy foot traffic.</p>`
    },
    {
      heading: 'Falcon Vinyl — 19 Options from $1.79/sqft',
      body: `<p>Starting at <strong>$1.79/sqft</strong>, Falcon vinyl is the most affordable waterproof option in our showroom. Available in 6mm and 7mm thicknesses, including <strong>condo-approved options with integrated underpad</strong>.</p>
<p>The 7mm condo-approved vinyl is particularly popular — it meets the sound transmission requirements that most condo boards mandate, eliminating the need for separate underlay.</p>`
    },
    {
      heading: 'Falcon Waterproof Laminate — 12 Options from $2.69/sqft',
      body: `<p>Falcon's 12mm waterproof laminate bridges the gap between traditional laminate and vinyl. You get the realistic wood grain and feel of laminate with waterproof protection — at $2.69 to $3.19/sqft, it's hard to argue with the value.</p>`
    },
  ],
  faqItems: [
    { question: 'Is Falcon flooring good quality for the price?', answer: 'Yes — Falcon is one of the best value brands at BBS Flooring. Despite the lowest entry prices in our showroom (vinyl from $1.79/sqft, laminate $2.69, engineered hardwood $3.89), quality is consistent: its hardwood includes real hickory (the hardest North American species), and its vinyl is 100% waterproof with condo-approved options. We have installed Falcon across the GTA without complaints.' },
    { question: 'Is Falcon Flooring affordable?', answer: 'Yes. Falcon is one of the most competitively priced brands at BBS Flooring. Vinyl starts at $1.79/sqft, laminate at $2.69/sqft, and engineered hardwood at $3.89/sqft. Despite the low prices, quality is consistent — we have installed Falcon flooring across the GTA without complaints.' },
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
  title: 'Triforest Flooring Review & Prices Markham | Waterproof Vinyl In Stock',
  description: 'Is Triforest flooring good? 100% waterproof SPC vinyl, AC4-rated, 25-year warranty, condo-approved underpad, from $2.29/sqft. In stock at BBS Flooring Markham. Call (647) 428-1111.',
  h1: 'Triforest Vinyl Plank & Laminate Flooring',
  subtitle: '100% waterproof SPC vinyl, AC4-rated and backed by a 25-year warranty — Triforest products from $2.29/sqft, in stock at our Markham showroom. Condo-approved options and one of the tightest value price bands we carry.',
  parentPage: null,
  schemaType: 'product',
  content: [
    {
      heading: 'Is Triforest Flooring Good? Why It\'s Worth It',
      body: `<p>Triforest punches well above its price — here's what you're actually getting:</p>
<ul>
<li><strong>100% waterproof SPC core</strong> — every vinyl plank is safe for basements, kitchens, bathrooms, and laundry rooms.</li>
<li><strong>AC4 commercial wear rating</strong> — rated for heavy residential and light commercial traffic, not just bedrooms.</li>
<li><strong>25-year residential warranty</strong> — real backing at a budget price point.</li>
<li><strong>Condo-approved underpad options</strong> — meets the sound-transmission rules most GTA condo boards require, no separate underlay needed.</li>
<li><strong>One of the tightest price bands we carry</strong> — you're not penalized for choosing the thicker, better-feeling plank.</li>
</ul>
<p>If you know you want waterproof vinyl and you want genuine value without cutting corners on durability, Triforest delivers.</p>`
    },
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
    { question: 'Is Triforest flooring good quality?', answer: 'Yes — Triforest is strong value. Its vinyl uses a 100% waterproof SPC core, carries an AC4 commercial wear rating (rated for heavy residential and light commercial traffic), and is backed by a 25-year residential warranty, all at one of the most competitive price points in our showroom. Condo-approved underpad options are available. BBS Flooring carries 38 Triforest products in Markham.' },
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
  title: 'Simba Flooring Review & Prices Markham | Vinyl, Hardwood & Laminate',
  description: 'Is Simba flooring good? 100% waterproof SPC vinyl, AC4-rated, up to 4mm wear layer, plus real engineered oak and herringbone. 100+ products from $2.29/sqft at BBS Flooring Markham. Call (647) 428-1111.',
  h1: 'Simba Flooring — Vinyl, Engineered Hardwood & Laminate',
  subtitle: '100% waterproof SPC vinyl, AC4-rated with up to a 4mm wear layer — plus real engineered oak and on-trend herringbone. 100+ Simba products from $2.29/sqft, in stock at our Markham showroom.',
  parentPage: { label: 'Shop', route: 'Shop' },
  schemaType: 'product',
  content: [
    {
      heading: 'Is Simba Flooring Good? Why It\'s Worth It',
      body: `<p>Simba is one of the most versatile brands we carry, and it doesn't cut corners to get there:</p>
<ul>
<li><strong>100% waterproof SPC vinyl</strong> — safe in every wet area of the home.</li>
<li><strong>AC4 commercial wear rating with up to a 4mm wear layer</strong> — serious durability for high-traffic homes.</li>
<li><strong>Real engineered hardwood</strong> — Oak, Hickory, Birch, Maple, Sapele, and Black Walnut, in widths up to 9.5".</li>
<li><strong>On-trend herringbone</strong> — one of the few brands offering true herringbone at this price, in easy click-lock.</li>
<li><strong>Every category under one brand</strong> — vinyl for the basement, engineered oak for the main floor, laminate for the budget rooms.</li>
</ul>
<p>Whether you're doing a basement in vinyl, a main floor in engineered Oak, or a budget renovation in laminate — Simba has a genuinely good product for it.</p>`
    },
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
    { question: 'Is Simba flooring good quality?', answer: 'Yes. Simba\'s vinyl uses a 100% waterproof SPC core, carries an AC4 commercial wear rating, and offers up to a 4mm wear layer for strong scratch and dent resistance. Beyond vinyl, Simba makes real engineered hardwood in six species and true click-lock herringbone — a rare feature at this price. It\'s one of the most versatile, best-value brands at BBS Flooring in Markham.' },
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
  title: 'Lee Flooring Clearance Markham | Oak from $3.29 · Vinyl from $1.79',
  description: 'Lee Flooring clearance pricing in Markham — real engineered American oak from $3.29/sqft and 7mm vinyl from $1.79/sqft. In-stock running line, reorderable. Call (647) 428-1111.',
  h1: 'Lee Flooring Clearance — Real Oak & 7mm Vinyl',
  subtitle: 'Engineered American oak from $3.29/sqft (reg $3.99) and 7mm vinyl with condo-approved underpad from $1.79/sqft (reg $2.49). First-quality, in stock, and a running line you can reorder anytime — special direct pricing, not a discontinued lot.',
  parentPage: null,
  schemaType: 'product',
  content: [
    {
      heading: 'A Focused Collection That Gets It Right',
      body: `<p>Lee keeps it simple — <strong>11 engineered hardwood and 8 vinyl options</strong> at special direct pricing. No bloated catalog of overlapping products. Every SKU has a clear purpose, which makes the selection process easier for homeowners and contractors alike.</p>
<p>Their engineered hardwood is genuine American oak (plus one American walnut), and their vinyl is a single well-spec'd 7mm plank with condo-approved underpad. It's a current, first-quality running line — you can reorder to patch a repair or finish the next room. If you know what you want, Lee gets you there fast — at direct pricing.</p>`
    },
    {
      heading: 'Lee Engineered Hardwood — 11 Options from $3.29/sqft',
      body: `<p>Lee's hardwood line focuses on <strong>6½" Select &amp; Better engineered American oak</strong>, plus one warm American walnut. Right now, oak is just $3.29/sqft (reg $3.99) — genuinely entry-level pricing for real wood flooring.</p>
<p>At $3.29/sqft, these compete directly with premium vinyl on price — but you're getting actual hardwood. For homeowners who want real wood and thought it was out of budget, Lee changes the math.</p>`
    },
    {
      heading: 'Lee Vinyl — 8 Options at $1.79/sqft',
      body: `<p>Lee's vinyl is a single product line: <strong>7mm with 22mil wear layer and condo-approved underpad</strong>. The thicker pad beats the industry-standard 1.5mm, which translates to better sound dampening and a cushier feel underfoot.</p>
<p>At $1.79/sqft (reg $2.49), it's straightforward pricing with no option paralysis. Eight colour choices, one thickness, one unbeatable price.</p>`
    },
  ],
  faqItems: [
    { question: 'Why is Lee the best flooring value in the GTA right now?', answer: 'Because Lee is a first-quality running line we buy direct, so you get real engineered American oak at vinyl-level pricing: $3.29/sqft (reg $3.99) for genuine 6½" Select & Better oak, plus 7mm vinyl with a condo-approved underpad at just $1.79/sqft (reg $2.49). Both are first-quality, not seconds — the price is low because we buy Lee direct and pass the savings on, not because it is discontinued. For anyone who wants real wood but thought it was out of budget, Lee is the best dollar-for-dollar flooring value at BBS Flooring in Markham.' },
    { question: 'Is Lee Flooring affordable?', answer: 'Yes — and right now it is at a special direct price. Lee engineered American oak is $3.29/sqft (reg $3.99), among the lowest prices for real wood flooring at BBS Flooring, and their 7mm vinyl is $1.79/sqft (reg $2.49). Both represent exceptional value for budget-conscious renovations — and it is a current running line you can reorder anytime.' },
    { question: 'What type of hardwood does Lee offer?', answer: 'Lee offers 6½" Select & Better engineered American oak, plus one warm American walnut. All options are engineered construction for dimensional stability and radiant heat compatibility.' },
    { question: 'Is Lee vinyl condo approved?', answer: 'Lee offers 7mm vinyl with 2mm condo-approved underpad — thicker than the typical 1.5mm pad. This meets most condo board sound requirements. Verify your specific building\'s STC/IIC requirements with property management.' },
    { question: 'How does Lee compare to other flooring brands?', answer: 'Lee competes on value. Their engineered American oak at $3.29/sqft is priced below most competitors while offering real oak in 6½" widths. Their 7mm vinyl at $1.79/sqft is straightforward — one well-spec\'d product at an unbeatable price. Visit BBS Flooring in Markham to compare Lee with other brands side by side.' },
    { question: 'Where can I buy Lee Flooring in the GTA?', answer: 'BBS Flooring at 6061 Highway 7, Unit B, Markham carries 19 Lee products — engineered American oak and 7mm vinyl. Walk-ins welcome Monday–Saturday. Free in-home measurements across the GTA.' },
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

// ══════════════════════════════════════════════════════════
// IMPRESSIVE FLOORING — 137 products (EH 47, vinyl 48, laminate 24, solid 18)
// 🇨🇦 Canadian-made hero: 56 SKUs (38 engineered + 18 solid) White Oak / Red Oak
// ══════════════════════════════════════════════════════════

export const impressiveFlooringData = {
  route: 'ImpressiveFlooring',
  title: 'Impressive Flooring Markham | Canadian-Made Hardwood',
  description: 'Shop Impressive Flooring in Markham — Canadian-made White Oak & Red Oak engineered and solid hardwood from $4.25/sqft, plus vinyl and laminate. 137 products in stock. Call (647) 428-1111.',
  h1: 'Impressive Flooring — Canadian-Made Hardwood in Markham',
  subtitle: '137 Impressive products in stock. Canadian-made White Oak and Red Oak — 38 engineered and 18 solid hardwood options milled in Canada — plus vinyl and laminate. All at our Markham showroom.',
  parentPage: null,
  schemaType: 'product',
  content: [
    {
      heading: 'Canadian-Made White Oak & Red Oak — Milled in Canada',
      body: `<p>Impressive is one of the few brands we carry that's <strong>genuinely Canadian-made</strong>. Their engineered and solid hardwood — <strong>56 White Oak and Red Oak options</strong> — are milled in Canada, built for the humidity and temperature swings of Ontario homes rather than shipped in from overseas and hoping for the best.</p>
<p>If you're specifically looking for <a href="/canadian-made-flooring-gta">Canadian-made flooring in the GTA</a>, this is the collection to start with. Real domestic hardwood, in stock, at prices that undercut most imported wide-plank oak.</p>`
    },
    {
      heading: 'Engineered Hardwood — 47 Options from $4.25/sqft',
      body: `<p>The core of the Impressive line is <strong>Canadian-made engineered White Oak</strong> in 5", 6½", and wider planks. The 5" collection starts at <strong>$4.25/sqft</strong> — an unusually low entry point for domestic engineered oak — and runs up to $7.99 for the premium wide-plank, wire-brushed finishes.</p>
<p>Engineered construction means a real oak wear layer over a dimensionally-stable core, so it handles basements and over-concrete installs that solid hardwood can't. Wire-brushed and UV-cured finishes across most of the range.</p>`
    },
    {
      heading: 'Solid Red Oak — 18 Options at $5.25/sqft',
      body: `<p>For buyers who want classic ¾" <strong>solid Red Oak</strong>, Impressive's Canadian-made solid line is available in <strong>two widths (3¼" and 4¼") and two grades (Select and Select &amp; Better)</strong>, starting at $5.25/sqft. Nail-down over plywood — the proven method that lasts decades and can be sanded and refinished multiple times.</p>
<p>Solid hardwood is the buy-it-once floor. Milled in Canada, it's the right call for main-floor living areas where you want permanence and the option to refinish down the road.</p>`
    },
    {
      heading: 'Vinyl & Laminate — Imported Value from $1.79/sqft',
      body: `<p>Rounding out the range, Impressive also carries <strong>48 vinyl plank options from $1.79/sqft</strong> and <strong>24 laminate options from $2.55/sqft</strong>. These are imported lines — not Canadian-made like the hardwood — but they're strong value plays for basements, rentals, and high-traffic spaces where waterproof SPC vinyl or a durable laminate makes more sense than wood.</p>`
    },
  ],
  faqItems: [
    { question: 'Is Impressive flooring Canadian-made?', answer: 'Impressive\u2019s hardwood is Canadian-made \u2014 their 38 engineered and 18 solid White Oak and Red Oak options are milled in Canada and built for Canadian climate conditions. Their vinyl and laminate lines are imported. BBS Flooring carries 137 Impressive products at our Markham showroom.' },
    { question: 'How much does Impressive Canadian-made hardwood cost?', answer: 'Impressive Canadian-made engineered White Oak starts at $4.25 per square foot and runs to $7.99 for premium wide-plank finishes. Solid Red Oak is $5.25 per square foot in Select and Select & Better grades. Call (647) 428-1111 or use our Quote Calculator for a project estimate.' },
    { question: 'What species does Impressive hardwood come in?', answer: 'Impressive Canadian-made hardwood comes in White Oak (engineered) and Red Oak (solid). The engineered line offers 5", 6.5", and wider planks with wire-brushed and UV-cured finishes; the solid Red Oak comes in 3.25" and 4.25" widths, Select and Select & Better grades.' },
    { question: 'Where can I buy Canadian-made Impressive flooring in the GTA?', answer: 'BBS Flooring at 6061 Highway 7, Unit B, Markham carries the full Impressive collection, including all 56 Canadian-made hardwood options. Walk-ins welcome Monday\u2013Saturday. We offer free in-home measurements across the GTA.' },
    { question: 'Is Impressive engineered hardwood good for basements?', answer: 'Yes. Impressive engineered hardwood uses a dimensionally-stable core that handles the humidity swings and over-concrete installs typical in basements \u2014 conditions solid hardwood can\u2019t. For fully below-grade or moisture-heavy areas, their waterproof vinyl plank is also worth considering.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'impressive'),
  productSessionKey: 'impressive',
  productQueryKey: 'products-impressive',
};

// ══════════════════════════════════════════════════════════
// CANADIAN-MADE FLOORING GTA — AEO/SEO term-owner landing
// Aggregates the Canadian-made lines we carry (Impressive + Northernest + Canadian Standard)
// ══════════════════════════════════════════════════════════

export const canadianMadeFlooringData = {
  route: 'CanadianMadeFlooringGta',
  title: 'Canadian-Made Flooring GTA | Domestic Hardwood in Markham',
  description: 'Looking for Canadian-made flooring in the GTA? BBS Flooring in Markham stocks Canadian-milled White Oak & Red Oak engineered and solid hardwood from $4.25/sqft. Impressive, Northernest & more. Call (647) 428-1111.',
  h1: 'Canadian-Made Flooring in the GTA',
  subtitle: 'Real domestic hardwood, in stock in Markham. Canadian-milled White Oak and Red Oak — engineered and solid — built for Ontario homes, from $4.25/sqft. Free measurements across the GTA.',
  parentPage: null,
  schemaType: 'product',
  content: [
    {
      heading: 'Why Buy Canadian-Made Flooring?',
      body: `<p>Most flooring sold in the GTA is imported — shipped across an ocean, acclimatized to a factory floor thousands of kilometres away, and not necessarily built for Canadian humidity swings. <strong>Canadian-made hardwood is milled here, for homes here.</strong> That means tighter dimensional stability through our dry winters and humid summers, shorter supply chains, and dollars that stay in the domestic economy.</p>
<p>At BBS Flooring in Markham, we carry <strong>Canadian-made White Oak and Red Oak</strong> across engineered and solid lines — real domestic hardwood you can see and stand on in our showroom before you buy.</p>`
    },
    {
      heading: 'Canadian-Made Engineered Hardwood — from $4.25/sqft',
      body: `<p>Our deepest Canadian-made selection is engineered <strong>White Oak</strong> from <a href="/impressive-flooring">Impressive</a> — 38 Canadian-milled options in 5", 6½", and wider planks, starting at just <strong>$4.25/sqft</strong>. Engineered construction pairs a real oak wear layer with a stable core, so it installs over concrete and in basements where solid hardwood can't go.</p>
<p>We also carry Canadian-built engineered hardwood from <a href="/northernest-flooring">Northernest</a> and <a href="/canadian-standard-flooring">Canadian Standard</a> — giving you one of the widest domestic-hardwood selections in the GTA under one roof.</p>`
    },
    {
      heading: 'Canadian-Made Solid Red Oak — $5.25/sqft',
      body: `<p>For classic ¾" <strong>solid Red Oak</strong> milled in Canada, Impressive's solid line comes in two widths (3¼" and 4¼") and two grades (Select and Select &amp; Better) from <strong>$5.25/sqft</strong>. Nail-down solid hardwood is the buy-it-once floor — sandable and refinishable for decades.</p>`
    },
    {
      heading: 'See It in Markham Before You Buy',
      body: `<p>Canadian-made flooring is worth seeing in person — grain, colour, and finish read differently under real light than on a screen. Our Markham showroom at 6061 Highway 7, Unit B carries the full domestic-hardwood range, and we offer <a href="/free-measurement">free in-home measurements</a> across the GTA — Markham, Richmond Hill, Vaughan, Scarborough, <a href="/canadian-made-flooring-toronto">Toronto</a>, and Durham.</p>`
    },
  ],
  faqItems: [
    { question: 'Where can I buy Canadian-made flooring in the GTA?', answer: 'BBS Flooring at 6061 Highway 7, Unit B, Markham stocks Canadian-made hardwood in the GTA \u2014 including Canadian-milled White Oak and Red Oak from Impressive, plus Northernest and Canadian Standard. Engineered options start at $4.25/sqft and solid Red Oak at $5.25/sqft. Call (647) 428-1111 or visit the Markham showroom.' },
    { question: 'What flooring brands are Canadian-made?', answer: 'At BBS Flooring, the Canadian-made hardwood brands are Impressive (Canadian-milled White Oak engineered and Red Oak solid), Northernest, and Canadian Standard. Impressive offers the deepest domestic selection with 56 Canadian-made hardwood options in stock.' },
    { question: 'Is Canadian-made hardwood better for Ontario homes?', answer: 'Canadian-made hardwood is milled for Canadian climate conditions, which typically means better dimensional stability through Ontario\u2019s dry winters and humid summers. Because it isn\u2019t shipped across an ocean and acclimatized in a distant factory, it\u2019s built from the start for the conditions it will actually live in.' },
    { question: 'How much does Canadian-made flooring cost in the GTA?', answer: 'At BBS Flooring, Canadian-made engineered White Oak starts at $4.25 per square foot and Canadian-made solid Red Oak at $5.25 per square foot. Premium wide-plank engineered runs up to $7.99. Prices are for in-stock inventory at our Markham showroom.' },
    { question: 'Do you deliver Canadian-made flooring across the GTA?', answer: 'Yes. BBS Flooring delivers across the GTA \u2014 warehouse pickup is free, garage delivery is $140, and inside-home delivery is $200. We also offer free in-home measurements throughout Markham, Richmond Hill, Vaughan, Scarborough, Toronto, and Durham.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => (p.is_canadian === true) || has(p.made_in, 'canada'),
  productSessionKey: 'canadian-made',
  productQueryKey: 'products-canadian-made',
};

// ══════════════════════════════════════════════════════════
// CANADIAN-MADE FLOORING TORONTO — city-term sibling of the GTA page
// Toronto has real search volume; distinct copy (neighbourhoods, Toronto framing)
// to avoid thin-duplicate risk. Same is_canadian aggregation + schema.
// ══════════════════════════════════════════════════════════

export const canadianMadeFlooringTorontoData = {
  route: 'CanadianMadeFlooringToronto',
  title: 'Canadian-Made Flooring Toronto | Domestic Hardwood Delivered',
  description: 'Buy Canadian-made flooring in Toronto — Canadian-milled White Oak & Red Oak engineered and solid hardwood from $4.25/sqft. In-stock in Markham, free measurements across Toronto. Call (647) 428-1111.',
  h1: 'Canadian-Made Flooring in Toronto',
  subtitle: 'Domestic White Oak and Red Oak — engineered and solid — milled in Canada and built for Toronto homes, from $4.25/sqft. In stock now, with free in-home measurements across the city.',
  parentPage: null,
  schemaType: 'product',
  content: [
    {
      heading: 'Where to Buy Canadian-Made Flooring in Toronto',
      body: `<p>Most flooring on Toronto showroom floors is imported. If you specifically want <strong>Canadian-made hardwood</strong> — milled here, built for our climate — the selection narrows fast. BBS Flooring stocks one of the deepest domestic-hardwood ranges serving Toronto: Canadian-milled <strong>White Oak and Red Oak</strong> across engineered and solid lines, from <a href="/impressive-flooring">Impressive</a>, <a href="/northernest-flooring">Northernest</a>, and <a href="/canadian-standard-flooring">Canadian Standard</a>.</p>
<p>We're a short drive from the city in Markham, and we bring the samples to you — free in-home measurements across <strong>North York, Scarborough, Etobicoke, East York, and downtown Toronto</strong>. See the grain and colour in your own light before you commit.</p>`
    },
    {
      heading: 'Why Canadian-Made Matters for a Toronto Home',
      body: `<p>Toronto's climate is hard on flooring — dry, heated winters and humid summers mean wood expands and contracts all year. <strong>Canadian-made hardwood is milled and acclimatized for exactly these conditions</strong>, so it's more dimensionally stable than product shipped across an ocean and finished in a distant factory. Shorter supply chains, domestic support, and floors built from the start for the home they'll live in.</p>`
    },
    {
      heading: 'Canadian-Made Engineered & Solid — from $4.25/sqft',
      body: `<p>The deepest domestic selection is engineered <strong>White Oak</strong> from Impressive — Canadian-milled, in 5", 6½", and wider planks from <strong>$4.25/sqft</strong>. Engineered construction installs over concrete and in condos and basements where solid hardwood can't go — a big deal for Toronto's condo and older-home mix.</p>
<p>For classic ¾" <strong>solid Red Oak</strong>, milled in Canada, pricing starts at <strong>$5.25/sqft</strong> in Select and Select &amp; Better grades — the buy-it-once floor for main-floor living areas.</p>`
    },
    {
      heading: 'Delivery & Measurement Across Toronto',
      body: `<p>We deliver across Toronto — warehouse pickup is free, garage delivery $140, inside-home $200 — and offer <a href="/free-measurement">free in-home measurements</a> throughout the city and the wider GTA. Prefer to browse first? See the full domestic range at our <a href="/canadian-made-flooring-gta">Canadian-made flooring</a> collection or visit the Markham showroom at 6061 Highway 7, Unit B.</p>`
    },
  ],
  faqItems: [
    { question: 'Where can I buy Canadian-made flooring in Toronto?', answer: 'BBS Flooring stocks Canadian-made hardwood serving Toronto \u2014 Canadian-milled White Oak and Red Oak from Impressive, Northernest, and Canadian Standard \u2014 from our Markham showroom at 6061 Highway 7, Unit B. Engineered starts at $4.25/sqft, solid Red Oak at $5.25/sqft. We deliver across Toronto and offer free in-home measurements throughout North York, Scarborough, Etobicoke, and downtown. Call (647) 428-1111.' },
    { question: 'Is Canadian-made hardwood better for Toronto\u2019s climate?', answer: 'Yes \u2014 Canadian-made hardwood is milled and acclimatized for Canadian conditions, so it handles Toronto\u2019s dry heated winters and humid summers with better dimensional stability than imported product finished in a distant factory. It\u2019s built from the start for the climate it will live in.' },
    { question: 'Do you deliver Canadian-made flooring in Toronto?', answer: 'Yes. BBS Flooring delivers across Toronto \u2014 warehouse pickup is free, garage delivery is $140, and inside-home delivery is $200. We also offer free in-home measurements throughout Toronto and the GTA.' },
    { question: 'What Canadian-made flooring is good for a Toronto condo?', answer: 'For condos, Canadian-made engineered White Oak is the strongest choice \u2014 its dimensionally-stable core installs over concrete subfloors that solid hardwood can\u2019t handle. Impressive\u2019s engineered line starts at $4.25/sqft. For fully below-grade or moisture-heavy spaces, waterproof vinyl is also worth considering.' },
    { question: 'How much does Canadian-made flooring cost in Toronto?', answer: 'At BBS Flooring, Canadian-made engineered White Oak starts at $4.25 per square foot and Canadian-made solid Red Oak at $5.25 per square foot, with premium wide-plank engineered up to $7.99. Prices are for in-stock inventory delivered across Toronto.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => (p.is_canadian === true) || has(p.made_in, 'canada'),
  productSessionKey: 'canadian-made-toronto',
  productQueryKey: 'products-canadian-made-toronto',
};
