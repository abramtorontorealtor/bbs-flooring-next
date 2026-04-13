/**
 * Data definitions for removal service pages.
 * Each object is passed as `config` to RemovalServiceTemplate.
 */

const CDN = 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images';

const SHARED_REVIEWS = [
  { text: 'The crew showed up on time, removed our old flooring, and left the subfloor spotless. Highly recommend BBS for any removal work.', name: 'David T.' },
  { text: 'Very professional team. They sealed off the work area, handled all the debris, and were done in a day. Ready for our new vinyl the next morning.', name: 'Sarah M.' },
  { text: 'Fair pricing and honest work. No hidden fees. They even swept up and took all the waste with them. Would use again.', name: 'James K.' },
];

// ── Hardwood Removal ─────────────────────────────────────────────────────────

export const hardwoodRemovalData = {
  breadcrumbPath: '/hardwood-removal',
  heroImage: `${CDN}/gallery/flooring-project-3.webp`,
  heroAlt: 'Professional hardwood floor removal and subfloor preparation in Markham and Toronto',
  badges: ['✓ WSIB Insured', '✓ Serving Markham, Toronto & Durham', '✓ Same-Day Haul-Away'],
  titleLine1: 'Professional',
  titleLine2: 'Hardwood Removal.',
  subtitle: 'Nail-down, glue-down, or engineered — we remove it all and leave your subfloor clean and level, ready for your new floors.',
  pricingPills: [
    { value: '$1.50', label: 'per sq ft' },
    { value: '$75', label: 'haul-away fee' },
    { value: '1-2 days', label: 'typical turnaround' },
  ],
  checklist: [
    'Nail-down & glue-down hardwood removal',
    'All staple & adhesive residue cleanup',
    'Subfloor leveling assessment included',
    'Same-day haul-away available',
  ],
  estimator: {
    ratePerSqft: 1.5,
    haulAwayFee: 75,
    removalType: 'Hardwood Removal',
    source: 'hardwood-removal-estimator',
    creditLabel: '$100 Floor Replacement Credit',
  },
  processTitle: 'How Hardwood Removal Works',
  processSubtitle: 'Our experienced crew handles every step — from the first plank to the final sweep.',
  processSteps: [
    { step: '01', title: 'Free Assessment', desc: 'We assess your hardwood type (nail-down, glue-down, or floating) and provide a transparent flat-rate quote.', icon: '📋' },
    { step: '02', title: 'Area Preparation', desc: 'We seal off the work area to contain dust and protect your home. Furniture moved as needed.', icon: '🛡️' },
    { step: '03', title: 'Hardwood Removal', desc: 'Our insured crew removes all planks, staples, nails, and adhesive residue down to bare subfloor.', icon: '🔨' },
    { step: '04', title: 'Subfloor Cleanup & Assessment', desc: 'Subfloor is swept clean and assessed for levelness. Any issues are flagged before your new flooring goes in.', icon: '✅' },
  ],
  includedTitle: "What's Included",
  includedItems: [
    'All hardwood plank removal',
    'Nail & staple extraction',
    'Glue & adhesive scraping',
    'Subfloor leveling check',
    'Debris bagging & cleanup',
    'Optional haul-away & disposal',
  ],
  crossSellTitle: 'Ready for New Floors?',
  crossSellSubtitle: 'Your clean subfloor is the perfect foundation. Shop our premium selection at wholesale prices.',
  crossSellLinks: [
    { label: 'Engineered Hardwood', href: '/engineered-hardwood' },
    { label: 'Vinyl Flooring', href: '/vinyl' },
    { label: 'Laminate Flooring', href: '/laminate' },
    { label: 'Solid Hardwood', href: '/solid-hardwood' },
  ],
  reviews: SHARED_REVIEWS,
  faqItems: [
    { question: 'How much does hardwood floor removal cost?', answer: 'We charge $1.50 per square foot for hardwood removal, plus a $75 flat fee for haul-away and disposal. This covers nail-down, glue-down, and engineered hardwood.' },
    { question: 'How long does hardwood removal take?', answer: 'Most rooms are completed in 1 day. Larger projects (full homes, multiple floors) typically take 1-2 days. Glue-down hardwood takes longer due to adhesive cleanup.' },
    { question: 'Is glue-down hardwood harder to remove?', answer: 'Yes — glue-down hardwood requires additional adhesive scraping after the planks are removed. Our $1.50/sqft rate includes this extra work. We use professional floor scrapers to leave the subfloor clean.' },
    { question: 'Do you repair the subfloor after removal?', answer: 'Our service includes a subfloor assessment after removal. Minor leveling is included. If significant subfloor repairs are needed (water damage, structural issues), we\'ll provide a separate quote before your new flooring installation.' },
    { question: 'Can I install new flooring the same day?', answer: 'In most cases, yes. Once removal and cleanup are complete, your subfloor is ready for new flooring. If you\'re also booking installation through BBS, we\'ll coordinate the scheduling.' },
  ],
  spokeLinks: [
    { route: 'Installation', label: 'Flooring Installation', description: 'Professional installation starting at $2.00/sqft for vinyl and $2.25/sqft for hardwood' },
    { route: 'CarpetRemoval', label: 'Carpet Removal Service', description: 'Professional carpet removal at $1.00/sqft with 24-hour turnaround' },
    { route: 'FlooringInstallationCost', label: 'Installation Cost Guide', description: 'Complete pricing breakdown for all flooring types and services' },
    { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a no-obligation measurement and get an accurate project quote' },
    { route: 'HardwoodRefinishing', label: 'Hardwood Refinishing', description: 'Refinish your existing floors from $5.25/sqft instead of replacing them' },
  ],
  ctaTitle: 'Ready to Remove Your Old Hardwood?',
  ctaSubtitle: 'Get a transparent, flat-rate quote and a perfectly prepped subfloor. No hidden fees.',
  mobileStickyText: '📐 Get Hardwood Removal Estimate',
  gaListName: 'Hardwood Removal',
};

// ── Tile Removal ─────────────────────────────────────────────────────────────

export const tileRemovalData = {
  breadcrumbPath: '/tile-removal',
  heroImage: `${CDN}/gallery/flooring-project-5.webp`,
  heroAlt: 'Professional tile removal and subfloor preparation in Markham and Toronto',
  badges: ['✓ WSIB Insured', '✓ Dust-Contained Process', '✓ Serving Markham, Toronto & Durham'],
  titleLine1: 'Professional',
  titleLine2: 'Tile Removal.',
  subtitle: 'Ceramic, porcelain, or natural stone — we demolish, scrape the thinset, and prep your subfloor for whatever comes next.',
  pricingPills: [
    { value: '$3.00', label: 'per sq ft' },
    { value: '$75', label: 'haul-away fee' },
    { value: '1-3 days', label: 'typical turnaround' },
  ],
  checklist: [
    'Ceramic, porcelain & natural stone removal',
    'Thinset & mortar grinding and scraping',
    'Subfloor leveling assessment included',
    'Dust-contained process — work area sealed',
  ],
  estimator: {
    ratePerSqft: 3.0,
    haulAwayFee: 75,
    removalType: 'Tile Removal',
    source: 'tile-removal-estimator',
    creditLabel: '$100 Floor Replacement Credit',
  },
  processTitle: 'How Tile Removal Works',
  processSubtitle: 'Tile removal is heavier work. Our WSIB-insured crew uses professional equipment to get it done safely.',
  processSteps: [
    { step: '01', title: 'Site Assessment', desc: 'We inspect the tile type, adhesive method, and subfloor condition to provide an accurate quote and timeline.', icon: '📋' },
    { step: '02', title: 'Containment Setup', desc: 'Tile demolition creates dust. We seal the work area with plastic sheeting and use industrial vacuums to minimize airborne particles.', icon: '🛡️' },
    { step: '03', title: 'Tile Demolition', desc: 'We break and remove all tiles, then grind and scrape all thinset and mortar from the subfloor using floor scrapers and grinders.', icon: '⚒️' },
    { step: '04', title: 'Subfloor Prep & Cleanup', desc: 'The subfloor is assessed for levelness, cleaned of all debris, and prepped for your new flooring installation.', icon: '✅' },
  ],
  includedTitle: "What's Included",
  includedItems: [
    'All tile demolition & removal',
    'Thinset & mortar grinding',
    'Grout line cleanup',
    'Subfloor leveling assessment',
    'Dust containment setup',
    'Debris haul-away & disposal',
  ],
  crossSellTitle: 'Ready for New Floors?',
  crossSellSubtitle: 'Most customers replace tile with waterproof vinyl or hardwood. Browse our selection.',
  crossSellLinks: [
    { label: 'Vinyl Flooring', href: '/vinyl' },
    { label: 'Engineered Hardwood', href: '/engineered-hardwood' },
    { label: 'Laminate Flooring', href: '/laminate' },
    { label: 'Waterproof Flooring', href: '/waterproof-flooring' },
  ],
  reviews: SHARED_REVIEWS,
  faqItems: [
    { question: 'How much does tile removal cost?', answer: 'Tile removal is $3.00 per square foot, plus a $75 flat fee for haul-away and disposal. This is higher than other removal types because tile requires demolition, thinset grinding, and more labour-intensive cleanup.' },
    { question: 'Why is tile removal more expensive than carpet or hardwood?', answer: 'Tile is adhered with thinset or mortar that must be ground off the subfloor after the tiles are broken out. The process requires specialized equipment (floor scrapers, grinders), generates significant dust (requiring containment), and takes longer per square foot.' },
    { question: 'How long does tile removal take?', answer: 'A typical bathroom (50-80 sqft) takes half a day. A kitchen or large area (200-500 sqft) takes 1-2 days. Full-home tile removal can take 2-3 days depending on adhesive type and subfloor condition.' },
    { question: 'Do you remove tile from walls or backsplashes?', answer: 'Our flat-rate pricing covers floor tile removal. Wall tile and backsplash removal requires a custom quote — the process differs due to drywall and substrate considerations. Ask us for a combined quote.' },
    { question: 'Is the subfloor usable after tile removal?', answer: 'Yes. We grind and scrape all thinset and mortar, then assess the subfloor for levelness. Minor leveling is included. If the subfloor has significant damage (common in older homes), we\'ll flag it and provide options before installation.' },
  ],
  spokeLinks: [
    { route: 'Installation', label: 'Flooring Installation', description: 'Professional installation starting at $2.00/sqft for vinyl and $2.25/sqft for hardwood' },
    { route: 'CarpetRemoval', label: 'Carpet Removal Service', description: 'Professional carpet removal at $1.00/sqft with 24-hour turnaround' },
    { route: 'FlooringInstallationCost', label: 'Installation Cost Guide', description: 'Complete pricing breakdown for all flooring types and services' },
    { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a no-obligation measurement and get an accurate project quote' },
    { route: 'Vinyl', label: 'Vinyl Flooring', description: '100% waterproof vinyl — the most popular replacement after tile removal' },
  ],
  ctaTitle: 'Ready to Remove Your Old Tile?',
  ctaSubtitle: 'Get a transparent quote. Our WSIB-insured crew handles the heavy work so you don\'t have to.',
  mobileStickyText: '📐 Get Tile Removal Estimate',
  gaListName: 'Tile Removal',
};

// ── Vinyl & Laminate Removal ─────────────────────────────────────────────────

export const vinylLaminateRemovalData = {
  breadcrumbPath: '/vinyl-laminate-removal',
  heroImage: `${CDN}/gallery/flooring-project-2.webp`,
  heroAlt: 'Professional vinyl and laminate floor removal in Markham and Toronto',
  badges: ['✓ WSIB Insured', '✓ Fast Turnaround', '✓ Serving Markham, Toronto & Durham'],
  titleLine1: 'Professional Vinyl &',
  titleLine2: 'Laminate Removal.',
  subtitle: 'Click-lock or glue-down — we remove old vinyl and laminate flooring, dispose of the underpad, and prep your subfloor for installation.',
  pricingPills: [
    { value: '$1.50', label: 'per sq ft' },
    { value: '$75', label: 'haul-away fee' },
    { value: '1 day', label: 'typical turnaround' },
  ],
  checklist: [
    'Click-lock & glue-down vinyl removal',
    'Laminate plank & underpad removal',
    'Adhesive residue cleanup',
    'Subfloor swept clean & install-ready',
  ],
  estimator: {
    ratePerSqft: 1.5,
    haulAwayFee: 75,
    removalType: 'Vinyl/Laminate Removal',
    source: 'vinyl-laminate-removal-estimator',
    creditLabel: '$100 Floor Replacement Credit',
  },
  processTitle: 'How Vinyl & Laminate Removal Works',
  processSubtitle: 'A straightforward process — most jobs are completed in a single day.',
  processSteps: [
    { step: '01', title: 'Quick Assessment', desc: 'We determine your flooring type (click-lock, glue-down, or peel-and-stick) and confirm the flat-rate price.', icon: '📋' },
    { step: '02', title: 'Flooring Removal', desc: 'We remove all planks or tiles, pull up underpad/underlayment, and extract any transition strips.', icon: '🔧' },
    { step: '03', title: 'Adhesive Cleanup', desc: 'Glue-down vinyl requires adhesive scraping. Click-lock floors come up cleanly. Either way, we clean the subfloor thoroughly.', icon: '🧹' },
    { step: '04', title: 'Install-Ready Subfloor', desc: 'Your subfloor is swept, debris-free, and ready for your new flooring. We haul away all waste if you opt for disposal.', icon: '✅' },
  ],
  includedTitle: "What's Included",
  includedItems: [
    'All vinyl/laminate plank removal',
    'Underpad & underlayment disposal',
    'Adhesive scraping (glue-down)',
    'Transition strip removal',
    'Subfloor sweep & cleanup',
    'Optional haul-away & disposal',
  ],
  crossSellTitle: 'Upgrade to New Floors',
  crossSellSubtitle: 'Out with the old, in with something better. Browse our wholesale selection.',
  crossSellLinks: [
    { label: 'Vinyl Flooring', href: '/vinyl' },
    { label: 'Laminate Flooring', href: '/laminate' },
    { label: 'Engineered Hardwood', href: '/engineered-hardwood' },
    { label: 'Waterproof Flooring', href: '/waterproof-flooring' },
  ],
  reviews: SHARED_REVIEWS,
  faqItems: [
    { question: 'How much does vinyl or laminate removal cost?', answer: 'Both vinyl and laminate removal are $1.50 per square foot, plus a $75 flat fee for haul-away and disposal. Glue-down vinyl is included at the same rate — we handle the extra adhesive cleanup.' },
    { question: 'Is glue-down vinyl harder to remove?', answer: 'Somewhat. Click-lock vinyl and laminate pull up cleanly in minutes. Glue-down vinyl requires additional scraping to remove adhesive residue from the subfloor. Our $1.50/sqft rate covers both methods.' },
    { question: 'How long does vinyl/laminate removal take?', answer: 'Most single-floor removals are completed in one day. Click-lock floors are the fastest — a typical 500 sqft room takes 2-3 hours. Glue-down vinyl takes longer due to adhesive cleanup.' },
    { question: 'Do you remove the underpad too?', answer: 'Yes. Our service includes removal and disposal of all underlayment, underpad, and vapor barriers beneath your vinyl or laminate flooring.' },
    { question: 'Can I reuse my existing underpad?', answer: 'We don\'t recommend it. Underpad compresses over time and loses its cushioning and moisture-barrier properties. New flooring performs best on fresh underlayment. We\'ll dispose of the old material for you.' },
  ],
  spokeLinks: [
    { route: 'Installation', label: 'Flooring Installation', description: 'Professional installation starting at $2.00/sqft for vinyl and $2.25/sqft for hardwood' },
    { route: 'CarpetRemoval', label: 'Carpet Removal Service', description: 'Professional carpet removal at $1.00/sqft with 24-hour turnaround' },
    { route: 'FlooringInstallationCost', label: 'Installation Cost Guide', description: 'Complete pricing breakdown for all flooring types and services' },
    { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a no-obligation measurement and get an accurate project quote' },
    { route: 'Vinyl', label: 'Vinyl Flooring', description: '100% waterproof vinyl — the #1 replacement choice across the GTA' },
  ],
  ctaTitle: 'Ready to Remove Your Old Vinyl or Laminate?',
  ctaSubtitle: 'Fast, clean, affordable. Get your flat-rate quote in seconds.',
  mobileStickyText: '📐 Get Removal Estimate',
  gaListName: 'Vinyl Laminate Removal',
};
