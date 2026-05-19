/**
 * City × Product Type landing page data.
 *
 * Each key is the URL slug (e.g. "vinyl-flooring-markham").
 * The dynamic route at app/[cityProduct]/page.jsx uses this to generate
 * static params and rich, unique content for each page.
 *
 * PHASE 1 (May 2026): 6 highest-GSC-impression pages.
 * PHASE 2: Expand to remaining high-value cities.
 * PHASE 3: Long-tail cities + cross-linking audit.
 */

// ── Product type definitions ─────────────────────────────────────────────────

export const PRODUCT_TYPES = {
  vinyl: {
    label: 'Vinyl Flooring',
    shortLabel: 'Vinyl',
    dbCategory: 'vinyl',
    categoryPage: '/vinyl',
    priceFrom: '$1.79',
    icon: 'Layers',
    features: ['100% Waterproof', 'Click-Lock Installation', 'Scratch & Dent Resistant', 'Built-In Underlayment Options'],
    bestFor: ['Basements', 'Kitchens', 'Bathrooms', 'High-Traffic Areas', 'Pet Owners'],
  },
  hardwood: {
    label: 'Hardwood Flooring',
    shortLabel: 'Hardwood',
    dbCategory: 'engineered_hardwood', // Most "hardwood" searches = engineered
    categoryPage: '/engineered-hardwood',
    priceFrom: '$3.69',
    icon: 'Hammer',
    features: ['Real Wood Top Layer', 'Dimensionally Stable', 'Can Be Refinished', 'Wide-Plank Options Available'],
    bestFor: ['Living Rooms', 'Dining Rooms', 'Bedrooms', 'Open-Concept Main Floors', 'Home Value'],
  },
  laminate: {
    label: 'Laminate Flooring',
    shortLabel: 'Laminate',
    dbCategory: 'laminate',
    categoryPage: '/laminate',
    priceFrom: '$1.49',
    icon: 'Layers',
    features: ['AC5 Scratch Resistance', 'Realistic Wood-Look', 'Easy Click Installation', 'Affordable Pricing'],
    bestFor: ['Bedrooms', 'Living Rooms', 'Rental Properties', 'Budget Renovations', 'DIY Projects'],
  },
  'engineered-hardwood': {
    label: 'Engineered Hardwood Flooring',
    shortLabel: 'Engineered Hardwood',
    dbCategory: 'engineered_hardwood',
    categoryPage: '/engineered-hardwood',
    priceFrom: '$3.69',
    icon: 'Hammer',
    features: ['Multi-Layer Construction', 'Works Over Concrete & Radiant Heat', 'Real Hardwood Top Layer', 'Less Seasonal Movement'],
    bestFor: ['Condos', 'Over Concrete Subfloors', 'Radiant Heating', 'Open-Concept Layouts', 'Main Floor Renovations'],
  },
};

// ── City × Product page data ─────────────────────────────────────────────────

export const cityProductPages = {

  // ══════════════════════════════════════════════════════════════════════════
  // VINYL FLOORING × MARKHAM
  // GSC: "vinyl flooring markham" — 60 impr, pos 14.3, 1 click
  // ══════════════════════════════════════════════════════════════════════════
  'vinyl-flooring-markham': {
    productType: 'vinyl',
    citySlug: 'markham',
    city: 'Markham',
    title: 'Vinyl Flooring Markham | LVP & SPC from $1.79/sqft — BBS Flooring',
    metaDescription: 'Shop luxury vinyl plank (LVP) flooring in Markham from $1.79/sqft. 100% waterproof, perfect for basements & kitchens. 200+ styles in stock at our Highway 7 showroom. Free estimates — call (647) 428-1111.',
    h1: 'Vinyl Flooring in Markham',
    heroSubtitle: 'Waterproof luxury vinyl plank from $1.79/sqft — over 200 styles in stock at our Markham showroom on Highway 7.',
    content: {
      intro: `Looking for vinyl flooring in Markham? BBS Flooring carries one of the largest selections of luxury vinyl plank (LVP) and SPC waterproof flooring in York Region — over 200 styles in stock at our showroom at 6061 Highway 7, Unit B. Whether you're renovating a basement in Cornell, upgrading a kitchen in Unionville, or refreshing a condo in Downtown Markham, our waterproof vinyl flooring handles it all.`,

      whyVinylHere: `Markham homeowners are increasingly choosing luxury vinyl plank over traditional hardwood — and for good reason. Markham's diverse housing stock, from heritage homes in Markham Village to modern builds in Cathedraltown and Wismer, presents unique challenges that LVP handles exceptionally well. Finished basements in Cachet and Berczy need waterproof flooring that won't buckle from seasonal moisture. Open-concept main floors in Cornell's newer homes need a durable surface that can handle heavy foot traffic from the front door to the kitchen. And condo owners in Downtown Markham need flooring that meets sound-rating requirements without sacrificing style.

Our SPC (Stone Polymer Composite) vinyl planks feature a rigid core that resists dents and impacts, with realistic wood-grain textures that are nearly indistinguishable from real hardwood. Every plank is 100% waterproof — not water-resistant, waterproof. Spills, pet accidents, even minor flooding won't damage your floors.`,

      localExpertise: `As Markham's local flooring showroom since 2010, we've installed vinyl flooring in thousands of homes across the city. Our installers know the specific challenges of Markham properties:

• **Unionville & Markham Village** heritage homes often have uneven subfloors — our click-lock LVP floats over imperfections without glue or nails.
• **Cornell & Wismer** open-concept layouts benefit from our wide-plank vinyl options (up to 9" wide) for a seamless look across large spaces.
• **Cachet & Cathedraltown** executive homes with finished basements are ideal for our premium SPC vinyl with built-in cork underlayment for warmth and sound dampening.
• **Downtown Markham condos** require flooring that meets IIC/STC sound ratings — our vinyl planks with attached underlayment exceed most condo board requirements.`,

      pricingSection: `At BBS Flooring, vinyl plank pricing starts from just $1.79/sqft — well below big-box stores and other Markham flooring retailers. Here's what to expect:

| Product Type | Price Range | Best For |
|---|---|---|
| Budget LVP (6mm) | $1.79 – $2.29/sqft | Basements, rentals, budget renovations |
| Mid-Range SPC (8mm) | $2.29 – $2.99/sqft | Main floors, kitchens, family rooms |
| Premium SPC (9mm+) | $2.99 – $3.59/sqft | Whole-home, executive properties |

All prices include the flooring material. Professional installation is available at competitive rates — we'll quote it during your free in-home estimate. Volume discounts available for projects over 500 sqft.`,
    },
    neighbourhoods: ['Unionville', 'Cornell', 'Cachet', 'Cathedraltown', 'Markham Village', 'Berczy', 'Wismer', 'Downtown Markham', 'Milliken', 'Greensborough'],
    faqs: [
      {
        question: 'How much does vinyl flooring cost in Markham?',
        answer: 'At BBS Flooring in Markham, luxury vinyl plank starts from $1.79/sqft for quality 6mm options and goes up to $3.59/sqft for premium 9mm+ SPC with built-in underlayment. This is significantly less than most Markham flooring stores. Visit our showroom at 6061 Highway 7 for current pricing, or call (647) 428-1111 for a free quote.',
      },
      {
        question: 'What is the best vinyl flooring for Markham basements?',
        answer: 'Rigid-core SPC vinyl plank is the best choice for Markham basements — it\'s 100% waterproof, handles temperature fluctuations, and won\'t swell from moisture. We recommend 8mm+ options with built-in underlayment for basement comfort. BBS Flooring carries over 200 vinyl options, many specifically suited for below-grade installation. Call (647) 428-1111.',
      },
      {
        question: 'Can I see vinyl flooring samples at your Markham showroom?',
        answer: 'Yes — our showroom at 6061 Highway 7, Unit B in Markham has over 200 vinyl flooring samples on display. You can see and feel the textures, compare colours, and take samples home to match your space. We\'re open Monday to Saturday, 10am–5pm. No appointment needed.',
      },
      {
        question: 'Do you install vinyl flooring in Unionville and Cornell?',
        answer: 'Absolutely. BBS Flooring installs vinyl flooring across all Markham neighbourhoods including Unionville, Cornell, Cachet, Cathedraltown, Berczy, Wismer, and Downtown Markham. Our installers are in Markham daily. Call (647) 428-1111 for a free in-home estimate.',
      },
      {
        question: 'Is vinyl flooring good for kitchens in Markham homes?',
        answer: 'Vinyl flooring is one of the best choices for Markham kitchens. SPC vinyl plank is 100% waterproof, handles dropped pots and heavy foot traffic, and looks like real hardwood. It\'s also warmer underfoot than tile. BBS Flooring carries kitchen-rated vinyl from $1.79/sqft. Visit our Highway 7 showroom to compare options.',
      },
      {
        question: 'How long does vinyl flooring installation take in Markham?',
        answer: 'A typical Markham room (200-300 sqft) takes about 1 day for professional vinyl installation. A full home (1,000-1,500 sqft) takes 2-3 days. BBS Flooring handles everything from furniture moving to final trim. Call (647) 428-1111 to schedule — we can usually start within a week.',
      },
    ],
    relatedPages: [
      { label: 'All Vinyl Flooring', url: '/vinyl' },
      { label: 'Flooring in Markham', url: '/flooring-in/markham' },
      { label: 'Basement Flooring Guide', url: '/basement-flooring-guide' },
      { label: 'Vinyl Flooring Guide', url: '/vinyl-flooring-guide' },
      { label: 'Flooring Installation', url: '/installation' },
      { label: 'Free Measurement', url: '/free-measurement' },
    ],
    nearbyPages: [
      { label: 'Vinyl Flooring Scarborough', url: '/vinyl-flooring-scarborough' },
      { label: 'Vinyl Flooring Richmond Hill', url: '/vinyl-flooring-richmond-hill' },
      { label: 'Hardwood Flooring Markham', url: '/hardwood-flooring-markham' },
      { label: 'Laminate Flooring Markham', url: '/laminate-flooring-markham' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HARDWOOD FLOORING × MARKHAM
  // GSC: "hardwood flooring markham" — 142 impr, pos 14.4, 2 clicks
  // ══════════════════════════════════════════════════════════════════════════
  'hardwood-flooring-markham': {
    productType: 'hardwood',
    citySlug: 'markham',
    city: 'Markham',
    title: 'Hardwood Flooring Markham | Engineered & Solid from $3.69/sqft',
    metaDescription: 'Shop hardwood flooring in Markham from $3.69/sqft. Engineered & solid hardwood — oak, maple, hickory. 300+ options in stock at our Highway 7 showroom. Free estimates. Call (647) 428-1111.',
    h1: 'Hardwood Flooring in Markham',
    heroSubtitle: 'Premium engineered and solid hardwood from $3.69/sqft — over 300 styles in stock at our Markham showroom.',
    content: {
      intro: `BBS Flooring is Markham's destination for premium hardwood flooring. With over 300 engineered and solid hardwood options in stock at our showroom on Highway 7, we offer the largest selection in York Region at prices that beat the big-box stores. From wide-plank European white oak to classic Canadian maple, every plank is hand-selected from trusted manufacturers like Vidar, NAF, Wickham, and Appalachian.`,

      whyVinylHere: `Markham homeowners consistently choose hardwood flooring for its timeless beauty and lasting value. Whether you're upgrading a heritage home in Unionville with character-grade oak or installing sleek, modern wide-plank in a Cornell new-build, hardwood transforms your space and adds significant resale value.

Engineered hardwood is the most popular choice in Markham — and for good reason. Its multi-layer construction handles the temperature and humidity swings of Ontario's climate better than solid hardwood, reducing gaps in winter and cupping in summer. For Markham homes with concrete subfloors (common in newer builds across Cathedraltown, Wismer, and Downtown Markham condos), engineered hardwood is the only real-wood option that works safely.

For established Markham homes with wood subfloors — particularly in Unionville, Markham Village, and Cachet — solid hardwood remains a premium choice. Our solid hardwood collection features 3/4" thick planks in oak, maple, and hickory that can be sanded and refinished multiple times over decades.`,

      localExpertise: `We've been installing hardwood floors in Markham since 2010. Our team understands the local housing stock inside and out:

• **Unionville & Markham Village** — Character homes with existing hardwood benefit from our refinishing service, or can be upgraded with wider, modern planks that complement the home's heritage charm.
• **Cornell & Wismer** — Open-concept new builds need wide-plank engineered hardwood (7" to 9" widths) for that seamless, contemporary look. We carry brushed, wire-brushed, and hand-scraped finishes.
• **Cachet & South Markham** — Executive homes with radiant in-floor heating require engineered hardwood rated for radiant systems. Our Vidar and Wickham collections are engineered specifically for this.
• **Downtown Markham condos** — Sound-rated engineered hardwood with underlayment meets condo board requirements while delivering the real-wood look condo owners want.
• **Berczy & Greensborough** — Family homes benefit from our AC5-rated hardwood and durable finish options that handle kids, pets, and daily life.`,

      pricingSection: `BBS Flooring offers hardwood at wholesale-to-public pricing — no middleman markup:

| Product Type | Price Range | Best For |
|---|---|---|
| Engineered Hardwood (12mm) | $3.69 – $4.99/sqft | Main floors, condos, radiant heat |
| Premium Engineered (15mm+) | $4.99 – $6.99/sqft | Executive homes, wide-plank, luxury finishes |
| Solid Hardwood (3/4") | $4.29 – $7.25/sqft | Heritage homes, wood subfloors, long-term value |

Professional installation is available and quoted during your free in-home estimate. We also offer stair matching — custom treads and risers to match your new hardwood floors.`,
    },
    neighbourhoods: ['Unionville', 'Cornell', 'Cachet', 'Cathedraltown', 'Markham Village', 'Berczy', 'Wismer', 'Downtown Markham', 'South Markham', 'Greensborough'],
    faqs: [
      {
        question: 'How much does hardwood flooring cost in Markham?',
        answer: 'At BBS Flooring in Markham, engineered hardwood starts from $3.69/sqft and solid hardwood from $4.29/sqft. Premium wide-plank and hand-scraped options range from $4.99 to $6.99/sqft. These prices beat most Markham competitors because we sell direct — no middleman markup. Visit our showroom at 6061 Highway 7 or call (647) 428-1111.',
      },
      {
        question: 'What is the best hardwood flooring for Markham homes?',
        answer: 'Engineered hardwood is the most popular choice for Markham homes — it handles Ontario\'s seasonal humidity swings and works over both wood and concrete subfloors. For executive homes in Cachet and South Markham, wide-plank European white oak (7-9" widths) in matte or brushed finish is the top seller. Visit BBS Flooring at 6061 Highway 7 to see our full collection.',
      },
      {
        question: 'Can you install hardwood flooring in Markham condos?',
        answer: 'Yes — BBS Flooring regularly installs engineered hardwood in Markham condos, including Downtown Markham towers. We carry sound-rated options that meet IIC/STC requirements and handle all condo board paperwork including insurance certificates. Call (647) 428-1111 to discuss your condo project.',
      },
      {
        question: 'Do you offer hardwood stair matching in Markham?',
        answer: 'Absolutely. We custom-match stair treads and risers to your new hardwood floors for a seamless look throughout your Markham home. Stair refinishing and recapping is one of our most popular services. Call BBS Flooring at (647) 428-1111 for a free staircase estimate.',
      },
      {
        question: 'What brands of hardwood flooring do you carry?',
        answer: 'BBS Flooring carries 15+ premium hardwood brands including Vidar Design Flooring, NAF, Wickham, Appalachian, Triforest, Woden, Canadian Standard, and Northernest. We stock over 300 hardwood options at our Markham showroom. Visit us at 6061 Highway 7, Unit B, or call (647) 428-1111.',
      },
      {
        question: 'Is engineered or solid hardwood better for Markham?',
        answer: 'For most Markham homes, engineered hardwood is the better choice — it\'s more stable in Ontario\'s climate, works over concrete subfloors (common in newer builds), and is compatible with radiant heating. Solid hardwood is ideal for heritage homes in Unionville and Markham Village with existing wood subfloors. BBS Flooring carries both — call (647) 428-1111 for expert advice.',
      },
    ],
    relatedPages: [
      { label: 'All Engineered Hardwood', url: '/engineered-hardwood' },
      { label: 'All Solid Hardwood', url: '/solid-hardwood' },
      { label: 'Flooring in Markham', url: '/flooring-in/markham' },
      { label: 'Engineered Hardwood Guide', url: '/engineered-hardwood-guide' },
      { label: 'Stair Refinishing', url: '/stair-refinishing' },
      { label: 'Free Measurement', url: '/free-measurement' },
    ],
    nearbyPages: [
      { label: 'Hardwood Flooring Scarborough', url: '/hardwood-flooring-scarborough' },
      { label: 'Hardwood Flooring Richmond Hill', url: '/hardwood-flooring-richmond-hill' },
      { label: 'Vinyl Flooring Markham', url: '/vinyl-flooring-markham' },
      { label: 'Laminate Flooring Markham', url: '/laminate-flooring-markham' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LAMINATE FLOORING × MARKHAM
  // GSC: "laminate flooring markham" — 38 impr, pos 12.7
  // ══════════════════════════════════════════════════════════════════════════
  'laminate-flooring-markham': {
    productType: 'laminate',
    citySlug: 'markham',
    city: 'Markham',
    title: 'Laminate Flooring Markham | From $1.49/sqft — BBS Flooring',
    metaDescription: 'Shop laminate flooring in Markham from $1.49/sqft. Scratch-resistant, realistic wood-look. 140+ styles in stock. Visit our Highway 7 showroom or call (647) 428-1111 for a free estimate.',
    h1: 'Laminate Flooring in Markham',
    heroSubtitle: 'Affordable, scratch-resistant laminate from $1.49/sqft — over 140 styles at our Markham showroom.',
    content: {
      intro: `Need affordable, beautiful flooring for your Markham home? BBS Flooring carries over 140 laminate options starting from just $1.49/sqft — the best value in York Region. Today's laminate flooring looks remarkably like real hardwood, with high-definition textures and realistic grain patterns that fool even flooring professionals. Visit our showroom at 6061 Highway 7 to see and feel the difference.`,

      whyVinylHere: `Laminate flooring is one of the smartest choices for Markham homeowners who want a premium wood-look floor without the premium price tag. Modern laminate has come a long way — our AC5-rated options (the highest durability class) resist scratches from pets, kids, and furniture better than most real hardwood.

For Markham families in Cornell, Wismer, and Berczy with young children and pets, laminate is practically indestructible. Its hard, melamine surface resists stains, scratches, and fading from sunlight — and if one plank does get damaged, individual boards can be replaced without touching the rest of the floor.

Markham landlords and investors are also turning to laminate for rental properties across the city. At $1.49/sqft for quality 8mm options, you get a floor that looks great on listing photos, withstands tenant turnover, and costs a fraction of hardwood to replace.`,

      localExpertise: `BBS Flooring has installed laminate in homes across every Markham neighbourhood:

• **Cornell & Wismer** — Large new builds benefit from our wide-plank laminate options that mimic the look of premium engineered hardwood at a third of the price.
• **Milliken & Greensborough** — Budget-conscious renovations get maximum impact with our $1.49/sqft laminate range — AC4 or AC5 rated for durability.
• **Cachet & Cathedraltown** — Even in executive homes, laminate is the smart choice for kids' bedrooms, playrooms, and home offices.
• **Unionville & Markham Village** — Our hand-scraped and distressed laminate patterns complement the character of heritage homes.
• **Downtown Markham condos** — Laminate with built-in underlayment meets sound requirements and installs quickly in occupied units.`,

      pricingSection: `Laminate flooring at BBS is priced to beat the competition:

| Product Type | Price Range | Best For |
|---|---|---|
| Standard Laminate (8mm) | $1.49 – $1.99/sqft | Bedrooms, rentals, budget renovations |
| Premium Laminate (10mm) | $1.99 – $2.49/sqft | Living rooms, main floors, high traffic |
| Water-Resistant Laminate (12mm) | $2.49 – $3.29/sqft | Kitchens, entry areas, near bathrooms |

Note: For truly waterproof applications (basements, bathrooms), we recommend vinyl plank instead. Laminate is water-resistant but not waterproof.`,
    },
    neighbourhoods: ['Cornell', 'Wismer', 'Milliken', 'Greensborough', 'Cachet', 'Cathedraltown', 'Unionville', 'Markham Village', 'Berczy', 'Downtown Markham'],
    faqs: [
      {
        question: 'How much does laminate flooring cost in Markham?',
        answer: 'BBS Flooring in Markham offers laminate starting from just $1.49/sqft — among the lowest prices in the GTA. Premium 10-12mm options range from $1.99 to $3.29/sqft. Visit our showroom at 6061 Highway 7, Unit B, or call (647) 428-1111 for a free quote.',
      },
      {
        question: 'Is laminate flooring durable enough for families in Markham?',
        answer: 'Absolutely. Our AC5-rated laminate (the highest durability class) is more scratch-resistant than most real hardwood. It\'s the top choice for Markham families with kids and pets. BBS Flooring carries 140+ laminate options — visit our Highway 7 showroom to test the durability yourself.',
      },
      {
        question: 'Can laminate flooring go in a Markham basement?',
        answer: 'We recommend luxury vinyl plank (LVP) over laminate for Markham basements. Laminate is water-resistant but not waterproof, and basements are prone to moisture. Our vinyl plank options start from $1.79/sqft and are 100% waterproof. Call BBS Flooring at (647) 428-1111 for basement-specific recommendations.',
      },
      {
        question: 'What is the difference between laminate and vinyl flooring?',
        answer: 'Laminate has a wood-fibre core and is more affordable ($1.49/sqft) but not waterproof. Vinyl has a plastic/stone core and is 100% waterproof ($1.79/sqft). For bedrooms and living rooms, laminate is great. For basements, kitchens, and bathrooms, vinyl is the better choice. BBS Flooring carries both — visit our Markham showroom to compare.',
      },
      {
        question: 'How long does laminate installation take in Markham?',
        answer: 'Laminate is one of the fastest flooring types to install. A typical room takes about half a day, and a full Markham home (1,000-1,500 sqft) can be done in 2-3 days. BBS Flooring handles everything from old floor removal to final trim. Call (647) 428-1111 to schedule.',
      },
    ],
    relatedPages: [
      { label: 'All Laminate Flooring', url: '/laminate' },
      { label: 'Flooring in Markham', url: '/flooring-in/markham' },
      { label: 'Laminate Flooring Guide', url: '/laminate-flooring-guide' },
      { label: 'Flooring Comparison Guide', url: '/flooring-comparison-guide' },
      { label: 'Flooring Installation', url: '/installation' },
      { label: 'Free Measurement', url: '/free-measurement' },
    ],
    nearbyPages: [
      { label: 'Laminate Flooring Scarborough', url: '/laminate-flooring-scarborough' },
      { label: 'Laminate Flooring Richmond Hill', url: '/laminate-flooring-richmond-hill' },
      { label: 'Vinyl Flooring Markham', url: '/vinyl-flooring-markham' },
      { label: 'Hardwood Flooring Markham', url: '/hardwood-flooring-markham' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HARDWOOD FLOORING × SCARBOROUGH
  // GSC: "scarborough flooring" 67 impr, "floor installation scarborough" 104 impr
  // ══════════════════════════════════════════════════════════════════════════
  'hardwood-flooring-scarborough': {
    productType: 'hardwood',
    citySlug: 'scarborough',
    city: 'Scarborough',
    title: 'Hardwood Flooring Scarborough | Engineered & Solid from $3.69/sqft',
    metaDescription: 'Shop hardwood flooring for Scarborough homes from $3.69/sqft. Engineered oak, maple, hickory — 300+ options. Expert installation. Just 15 min from our showroom. Call (647) 428-1111.',
    h1: 'Hardwood Flooring in Scarborough',
    heroSubtitle: 'Premium engineered and solid hardwood from $3.69/sqft — expert installation across Scarborough. Just 15 minutes from our showroom.',
    content: {
      intro: `Looking for hardwood flooring in Scarborough? BBS Flooring serves all of Scarborough — from Agincourt to the Bluffs, Malvern to West Hill — with over 300 hardwood options in stock at our Markham showroom, just 15 minutes north. We carry the GTA's best selection of engineered and solid hardwood from premium brands like Vidar, NAF, Wickham, and Appalachian, all at wholesale-to-public pricing.`,

      whyVinylHere: `Scarborough's incredible housing diversity — bungalows, backsplits, semi-detached homes, and high-rise condos — means there's no one-size-fits-all hardwood solution. That's where our expertise comes in.

Carpet-to-hardwood conversions are our most popular service in Scarborough. Many of the area's 1960s-1980s homes still have original carpeting that's ready for an upgrade. Replacing carpet with engineered hardwood instantly transforms the look and feel of a home, eliminates allergens, and adds significant resale value — especially in Scarborough's competitive real estate market.

For Scarborough's bungalows and backsplits in West Hill and Highland Creek, wide-plank engineered hardwood creates the illusion of more space. For the two-storey homes in Agincourt and Woburn, we match stair treads and risers to your new main-floor hardwood for a seamless top-to-bottom look.`,

      localExpertise: `Our installation crews are in Scarborough almost every day — it's one of our busiest service areas:

• **Agincourt** — Mature two-storey homes benefit from carpet-to-hardwood conversions with matching stair treads. Engineered hardwood in natural or matte oak is the top seller here.
• **The Bluffs & Birch Cliff** — Character homes near the lake need dimensionally stable engineered hardwood that handles lakeside humidity without cupping or gapping.
• **Malvern & Morningside** — Family homes get the most value from our mid-range engineered hardwood ($3.69-$4.99/sqft) in durable, scratch-resistant finishes.
• **West Hill & Highland Creek** — Bungalow renovations pair wide-plank hardwood on the main floor with waterproof vinyl in the finished basement for a cohesive look.
• **Scarborough Town Centre area** — Condo installations with sound-rated engineered hardwood and proper underlayment.`,

      pricingSection: `BBS Flooring brings Markham showroom pricing to Scarborough — no delivery upcharge for the area:

| Product Type | Price Range | Best For |
|---|---|---|
| Engineered Hardwood (12mm) | $3.69 – $4.99/sqft | Main floors, carpet replacements |
| Premium Engineered (15mm+) | $4.99 – $6.99/sqft | Executive homes, wide-plank, luxury finishes |
| Solid Hardwood (3/4") | $4.29 – $7.25/sqft | Bungalows, heritage homes, wood subfloors |

Free delivery to all of Scarborough on qualifying orders. Professional installation quoted during your free in-home estimate.`,
    },
    neighbourhoods: ['Agincourt', 'Birch Cliff', 'The Bluffs', 'Malvern', 'West Hill', 'Highland Creek', 'Woburn', 'Morningside', 'Scarborough Town Centre', 'Guildwood'],
    faqs: [
      {
        question: 'How much does hardwood flooring cost in Scarborough?',
        answer: 'BBS Flooring offers hardwood flooring for Scarborough homes starting from $3.69/sqft for engineered and $4.29/sqft for solid hardwood. We sell at wholesale-to-public pricing — no middleman markup. Our Markham showroom is just 15 minutes from Scarborough via the 401. Call (647) 428-1111 for a free quote.',
      },
      {
        question: 'Do you install hardwood flooring in Agincourt and Malvern?',
        answer: 'Yes — BBS Flooring serves every Scarborough neighbourhood including Agincourt, Malvern, West Hill, Birch Cliff, Highland Creek, Woburn, and the Bluffs. Our installation crews are in Scarborough almost daily. Call (647) 428-1111 for a free in-home estimate.',
      },
      {
        question: 'Can you replace carpet with hardwood in my Scarborough home?',
        answer: 'Absolutely — carpet-to-hardwood conversion is our most popular service in Scarborough. We remove the old carpet, prep the subfloor, and install your choice of engineered or solid hardwood. We also match stair treads to your new floors. Call BBS Flooring at (647) 428-1111.',
      },
      {
        question: 'What hardwood works best for Scarborough bungalows?',
        answer: 'For Scarborough bungalows, wide-plank engineered hardwood (7-9" widths) in light or natural finishes creates the illusion of more space. Oak in matte or wire-brushed finish is the most popular choice. BBS Flooring carries these from $3.69/sqft. Call (647) 428-1111 for a free in-home consultation.',
      },
      {
        question: 'How far is BBS Flooring from Scarborough?',
        answer: 'Our showroom at 6061 Highway 7, Unit B in Markham is just 15 minutes from Scarborough via the 401 or Steeles Avenue. We carry over 300 hardwood options in stock — visit us Monday to Saturday, 10am–5pm, or call (647) 428-1111 for a free in-home estimate anywhere in Scarborough.',
      },
    ],
    relatedPages: [
      { label: 'All Engineered Hardwood', url: '/engineered-hardwood' },
      { label: 'Flooring in Scarborough', url: '/flooring-in/scarborough' },
      { label: 'Carpet Removal', url: '/carpet-removal' },
      { label: 'Stair Refinishing', url: '/stair-refinishing' },
      { label: 'Flooring Installation', url: '/installation' },
      { label: 'Free Measurement', url: '/free-measurement' },
    ],
    nearbyPages: [
      { label: 'Vinyl Flooring Scarborough', url: '/vinyl-flooring-scarborough' },
      { label: 'Hardwood Flooring Markham', url: '/hardwood-flooring-markham' },
      { label: 'Hardwood Flooring Pickering', url: '/hardwood-flooring-pickering' },
      { label: 'Laminate Flooring Scarborough', url: '/laminate-flooring-scarborough' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // VINYL FLOORING × VAUGHAN
  // GSC: "floor installation vaughan" 105 impr, pos 16.7
  // ══════════════════════════════════════════════════════════════════════════
  'vinyl-flooring-vaughan': {
    productType: 'vinyl',
    citySlug: 'vaughan',
    city: 'Vaughan',
    title: 'Vinyl Flooring Vaughan | LVP & SPC from $1.79/sqft — BBS Flooring',
    metaDescription: 'Shop luxury vinyl plank in Vaughan from $1.79/sqft. 100% waterproof LVP & SPC — perfect for Maple, Woodbridge, Kleinburg homes. 200+ styles. Free estimates. Call (647) 428-1111.',
    h1: 'Vinyl Flooring in Vaughan',
    heroSubtitle: 'Waterproof luxury vinyl plank from $1.79/sqft — 200+ styles for Vaughan, Maple, Woodbridge, and Kleinburg homes.',
    content: {
      intro: `BBS Flooring brings premium vinyl flooring to Vaughan homeowners at wholesale pricing. Whether you're renovating a townhome in Concord, finishing a basement in Maple, or upgrading a Kleinburg estate, our luxury vinyl plank (LVP) and SPC options deliver the look of hardwood with the durability Vaughan families need. Our Markham showroom is a 20-minute drive east on Highway 7 with over 200 vinyl options in stock.`,

      whyVinylHere: `Vaughan is one of the fastest-growing cities in the GTA, with a housing market that spans modern VMC condos, Maple family homes, Woodbridge executive properties, and Kleinburg rural estates. Luxury vinyl plank has become Vaughan's fastest-growing flooring choice because it handles every one of these applications:

In Vaughan's newer builds — particularly around the Vaughan Metropolitan Centre and Highway 7 corridor — vinyl plank is the go-to for developers and homeowners alike. It installs fast over concrete subfloors, looks premium in open-concept layouts, and costs a fraction of hardwood.

For Woodbridge and Maple's established homes, vinyl plank is the ideal upgrade from dated carpet or worn laminate. Our premium SPC options (9mm with cork backing) deliver warmth, comfort, and luxury — you'd never guess it's not real hardwood.

Vaughan's finished basements are where vinyl truly shines. The 100% waterproof construction means no worries about spring moisture, sump pump backup, or the humidity that Ontario basements are famous for.`,

      localExpertise: `BBS Flooring installers are in Vaughan multiple days per week — we know the housing stock well:

• **Maple** — Large family homes with finished walkout basements are perfect for our premium SPC vinyl with cork underlayment. We also handle the main floor to basement transition seamlessly.
• **Woodbridge** — Mediterranean-style homes get a modern update with our warm-toned vinyl planks that mimic walnut, hickory, and aged oak.
• **Kleinburg** — Estate properties with mudrooms, laundry rooms, and large kitchens benefit from vinyl's waterproof durability in high-moisture areas.
• **Concord** — Townhome renovations get maximum impact at minimum cost with our $1.79/sqft vinyl range.
• **VMC condos** — Sound-rated vinyl with attached underlayment meets building requirements without compromising on style.`,

      pricingSection: `BBS Flooring delivers Vaughan-area pricing that beats the big chains:

| Product Type | Price Range | Best For |
|---|---|---|
| Budget LVP (6mm) | $1.79 – $2.29/sqft | Basements, rentals, quick renovations |
| Mid-Range SPC (8mm) | $2.29 – $2.99/sqft | Main floors, kitchens, family rooms |
| Premium SPC (9mm+) | $2.99 – $3.59/sqft | Whole-home, luxury finishes, executive homes |

Free delivery to all of Vaughan on qualifying orders. Professional installation is quoted during your free in-home estimate — call (647) 428-1111.`,
    },
    neighbourhoods: ['Maple', 'Woodbridge', 'Kleinburg', 'Concord', 'Thornhill', 'Vaughan Metropolitan Centre', 'Pine Valley', 'Islington & Hwy 7'],
    faqs: [
      {
        question: 'How much does vinyl flooring cost in Vaughan?',
        answer: 'BBS Flooring offers luxury vinyl plank for Vaughan homes starting from $1.79/sqft. Premium SPC options with cork underlayment range from $2.99 to $3.59/sqft. These prices beat Vaughan big-box stores. Our Markham showroom is 20 minutes east on Highway 7. Call (647) 428-1111 for a free quote.',
      },
      {
        question: 'Do you install vinyl flooring in Maple and Woodbridge?',
        answer: 'Yes — BBS Flooring installs vinyl flooring across all of Vaughan including Maple, Woodbridge, Kleinburg, Concord, and the VMC area. Our installation crews are in Vaughan multiple times per week. Call (647) 428-1111 for a free in-home estimate.',
      },
      {
        question: 'What is the best vinyl flooring for Vaughan basements?',
        answer: 'Rigid-core SPC vinyl plank (8mm+) is the best choice for Vaughan basements. It\'s 100% waterproof, handles temperature fluctuations, and won\'t swell from seasonal moisture. BBS Flooring carries options with built-in cork underlayment for extra warmth. Starting from $2.29/sqft. Call (647) 428-1111.',
      },
      {
        question: 'Can you install vinyl flooring in a Vaughan condo?',
        answer: 'Absolutely. BBS Flooring installs vinyl in Vaughan condos including VMC towers. We carry sound-rated options with attached underlayment that meet building IIC/STC requirements. We handle condo board paperwork and insurance certificates. Call (647) 428-1111.',
      },
      {
        question: 'Is vinyl flooring a good choice for Vaughan homes with pets?',
        answer: 'Vinyl flooring is one of the best choices for pet owners in Vaughan. SPC vinyl is scratch-resistant, 100% waterproof (handles accidents), and easy to clean. Our premium options have textured surfaces that provide traction for pets. Starting from $1.79/sqft at BBS Flooring. Call (647) 428-1111.',
      },
    ],
    relatedPages: [
      { label: 'All Vinyl Flooring', url: '/vinyl' },
      { label: 'Flooring in Vaughan', url: '/flooring-in/vaughan' },
      { label: 'Basement Flooring Guide', url: '/basement-flooring-guide' },
      { label: 'Vinyl Flooring Guide', url: '/vinyl-flooring-guide' },
      { label: 'Flooring Installation', url: '/installation' },
      { label: 'Free Measurement', url: '/free-measurement' },
    ],
    nearbyPages: [
      { label: 'Vinyl Flooring Markham', url: '/vinyl-flooring-markham' },
      { label: 'Vinyl Flooring Richmond Hill', url: '/vinyl-flooring-richmond-hill' },
      { label: 'Hardwood Flooring Vaughan', url: '/hardwood-flooring-vaughan' },
      { label: 'Laminate Flooring Vaughan', url: '/laminate-flooring-vaughan' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // FLOORING INSTALLATION × MARKHAM
  // GSC: "floor installation markham" 127 impr + "flooring installation markham" 47 impr
  // ══════════════════════════════════════════════════════════════════════════
  'flooring-installation-markham': {
    productType: 'vinyl', // Shows vinyl as default but page covers all types
    citySlug: 'markham',
    city: 'Markham',
    title: 'Flooring Installation Markham | Professional Install from $1.49/sqft',
    metaDescription: 'Professional flooring installation in Markham — hardwood, vinyl, laminate from $1.49/sqft. Expert installers, free in-home estimates. Visit our Highway 7 showroom. Call (647) 428-1111.',
    h1: 'Professional Flooring Installation in Markham',
    heroSubtitle: 'Expert installation for hardwood, vinyl, and laminate — supply + install packages from $1.49/sqft. Your local Markham flooring company since 2010.',
    isInstallationPage: true, // Flag to show all product types
    content: {
      intro: `BBS Flooring is Markham's trusted name for professional flooring installation. Located right on Highway 7 at 6061, Unit B, we've been installing floors in Markham homes since 2010. From a single bedroom refresh to a full-home renovation, our experienced installation crews deliver precision craftsmanship across all flooring types — vinyl, hardwood, laminate, and more.`,

      whyVinylHere: `What makes BBS different from other Markham flooring installers? We're not just installers — we're a full showroom with over 700 flooring products in stock. That means:

**One-stop shop:** Select your flooring and book installation in the same visit. No waiting for special orders from third parties.

**Expert matching:** Our showroom staff help you choose the right flooring for your specific situation — not just what's cheapest or what a salesperson earns the most commission on.

**Quality control:** Because we sell and install, we stand behind the entire project. No finger-pointing between the store and the installer when something goes wrong.

**Fast turnaround:** With 700+ products in stock, we can typically start installation within a week of your free in-home estimate — not the 4-6 weeks some Markham competitors require for special orders.`,

      localExpertise: `We've installed floors in thousands of Markham homes. Our crews know the local housing stock:

• **Unionville & Markham Village** — Heritage homes with uneven subfloors, lath-and-plaster walls, and original hardwood that needs matching or refinishing.
• **Cornell, Wismer & Cathedraltown** — Open-concept new builds requiring seamless transitions between rooms, proper expansion gaps, and trim work.
• **Cachet & South Markham** — Executive homes with radiant heating systems, custom stair work, and premium finishing requirements.
• **Downtown Markham condos** — Sound-rated installations meeting condo board requirements, efficient scheduling for occupied units.
• **Milliken & Greensborough** — Family homes needing durable, affordable flooring with expert subfloor preparation.

Every installation includes: professional subfloor assessment, old flooring removal (optional), precision installation, trim and transition work, and a final walkthrough to ensure you're 100% satisfied.`,

      pricingSection: `BBS Flooring offers competitive installation rates — supply + install packages that beat the big-box stores:

| Flooring Type | Material From | Best For |
|---|---|---|
| Luxury Vinyl Plank (LVP) | $1.79/sqft | Basements, kitchens, whole-home |
| Laminate | $1.49/sqft | Bedrooms, living rooms, budget renos |
| Engineered Hardwood | $3.69/sqft | Main floors, executive homes |
| Solid Hardwood | $4.29/sqft | Heritage homes, wood subfloors |

Professional installation pricing is quoted during your free in-home estimate, based on your specific project (subfloor condition, furniture moving, old floor removal, trim work). Call (647) 428-1111 to book your free estimate.`,
    },
    neighbourhoods: ['Unionville', 'Cornell', 'Cachet', 'Cathedraltown', 'Markham Village', 'Berczy', 'Wismer', 'Downtown Markham', 'Milliken', 'Greensborough'],
    faqs: [
      {
        question: 'How much does flooring installation cost in Markham?',
        answer: 'BBS Flooring in Markham offers supply + install packages starting from $1.49/sqft for laminate and $1.79/sqft for vinyl. Hardwood installation starts from $3.69/sqft for materials. Installation labour is quoted during your free in-home estimate — it varies based on subfloor condition and project scope. Call (647) 428-1111.',
      },
      {
        question: 'Do you offer free estimates for flooring installation in Markham?',
        answer: 'Yes — BBS Flooring provides free in-home measurements and installation estimates across all of Markham. Our team will assess your subfloor, measure your space, recommend the best flooring, and provide a detailed no-obligation quote. Call (647) 428-1111 to schedule.',
      },
      {
        question: 'How long does flooring installation take in Markham?',
        answer: 'Timing depends on the project: a single room takes 1 day, a full home (1,500 sqft) takes 3-5 days. This includes subfloor prep, installation, and trim work. BBS Flooring handles the entire process from start to finish. We can usually start within a week of your estimate.',
      },
      {
        question: 'Do you remove old flooring before installation?',
        answer: 'Yes — BBS Flooring offers complete old flooring removal including carpet, hardwood, laminate, vinyl, and tile. Removal is quoted as part of your free estimate. We also offer standalone removal services. Call (647) 428-1111.',
      },
      {
        question: 'Can you install flooring over concrete in Markham homes?',
        answer: 'Absolutely. Engineered hardwood and luxury vinyl plank both install beautifully over concrete subfloors — common in Markham basements and newer condo builds. We use proper moisture barriers and underlayment. Solid hardwood is not recommended over concrete. Call BBS Flooring at (647) 428-1111 for advice on your specific project.',
      },
      {
        question: 'What areas of Markham do you serve for flooring installation?',
        answer: 'BBS Flooring serves all of Markham including Unionville, Cornell, Cachet, Cathedraltown, Wismer, Berczy, Markham Village, Downtown Markham, Milliken, Greensborough, and surrounding areas. Our showroom is at 6061 Highway 7, Unit B. Call (647) 428-1111 for a free estimate.',
      },
    ],
    relatedPages: [
      { label: 'All Vinyl Flooring', url: '/vinyl' },
      { label: 'All Engineered Hardwood', url: '/engineered-hardwood' },
      { label: 'All Laminate', url: '/laminate' },
      { label: 'Flooring in Markham', url: '/flooring-in/markham' },
      { label: 'Installation Cost Guide', url: '/flooring-installation-cost' },
      { label: 'Stair Refinishing', url: '/stair-refinishing' },
      { label: 'Free Measurement', url: '/free-measurement' },
    ],
    nearbyPages: [
      { label: 'Flooring Installation Scarborough', url: '/flooring-installation-scarborough' },
      { label: 'Flooring Installation Richmond Hill', url: '/flooring-installation-richmond-hill' },
      { label: 'Vinyl Flooring Markham', url: '/vinyl-flooring-markham' },
      { label: 'Hardwood Flooring Markham', url: '/hardwood-flooring-markham' },
    ],
  },
};

// ── Helper: get all slugs for static generation ──────────────────────────────
export function getAllCityProductSlugs() {
  return Object.keys(cityProductPages);
}

// ── Helper: look up page data by slug ────────────────────────────────────────
export function getCityProductPage(slug) {
  return cityProductPages[slug] || null;
}
