/**
 * landingPages.js — Content dictionary for all Google Ads landing pages.
 * Each export is a data object consumed by AdLandingTemplate.jsx.
 *
 * To add a new landing page:
 *   1. Add a new export here with all required fields
 *   2. Create a thin page wrapper in src/pages/YourPage.jsx
 *   3. Base44 auto-registers it in pages.config.js
 *   4. Add the route to sitemapXml.ts staticPages array
 */

// ─── HELPERS ──────────────────────────────────────────────
const lc = (s) => (s || '').toLowerCase();
const has = (str, sub) => lc(str).includes(lc(sub));

// ══════════════════════════════════════════════════════════
// PRIORITY 1 — Highest Impact (QS 1-3 keywords)
// ══════════════════════════════════════════════════════════

export const vidarFlooringData = {
  route: 'VidarFlooring',
  title: 'Vidar Flooring Markham | Engineered Hardwood',
  description: 'Shop Vidar engineered hardwood flooring in Markham. European oak, wide plank, waterproof options. In-stock at BBS Flooring. Free measurements. Call (647) 428-1111.',
  h1: 'Vidar Engineered Hardwood Flooring',
  subtitle: 'Premium European oak from Vidar — in stock at our Markham showroom. Expert installation across the GTA.',
  parentPage: { label: 'Engineered Hardwood', route: 'EngineeredHardwood' },
  schemaType: 'product',
  content: [
    {
      heading: 'Why Choose Vidar Flooring?',
      body: `<p>Vidar is one of Canada's most trusted engineered hardwood brands, known for <strong>wide-plank European oak</strong> with real wood wear layers up to 4mm thick. Every Vidar floor is built for Canadian climates — dimensionally stable, compatible with radiant heat, and backed by a 35-year residential warranty.</p>
<p>At BBS Flooring, we carry <strong>the full Vidar collection</strong> in stock at our <a href="/Location?city=Markham">Markham showroom</a>. From wire-brushed natural oak to deep-smoked wide planks, you'll find the perfect match for your home.</p>`
    },
    {
      heading: 'Vidar Collection Highlights',
      body: `<ul>
<li><strong>Wide Plank (7½"–9½"):</strong> Statement floors for open-concept living. Available in oak, hickory, and walnut.</li>
<li><strong>Waterproof Core:</strong> SPC-backed engineered hardwood for basements and kitchens.</li>
<li><strong>Wire-Brushed & Smoked Finishes:</strong> Textured surfaces that hide scratches and add character.</li>
<li><strong>Click-Lock Installation:</strong> Faster install = lower labour cost for you.</li>
</ul>
<p>Not sure which Vidar floor fits your space? <a href="/QuoteCalculator">Use our Quote Calculator</a> for an instant estimate, or visit the showroom to see samples in person.</p>`
    },
    {
      heading: 'Expert Vidar Installation in Markham & the GTA',
      body: `<p>Our installers have years of experience with Vidar's click-lock and glue-down systems. We handle subfloor prep, moisture testing, transitions, and trim — plus <strong>we move your furniture</strong> at no extra charge. Serving <a href="/Location?city=Markham">Markham</a>, <a href="/Location?city=Richmond Hill">Richmond Hill</a>, <a href="/Location?city=Pickering">Pickering</a>, Toronto, and all of Durham Region.</p>`
    },
  ],
  faqItems: [
    { question: 'Is Vidar flooring good quality?', answer: 'Yes. Vidar is a premium Canadian-distributed brand specializing in European oak engineered hardwood. Their floors feature real wood wear layers (2–4mm), 35-year warranties, and are built for Canadian temperature swings. BBS Flooring is an authorized Vidar dealer.' },
    { question: 'How much does Vidar flooring cost per square foot?', answer: 'Vidar engineered hardwood ranges from approximately $4.50 to $9.00 per square foot depending on the collection and plank width. BBS Flooring offers competitive pricing — call (647) 428-1111 or use our online Quote Calculator for an exact price.' },
    { question: 'Can Vidar flooring be installed over radiant heat?', answer: 'Yes. All Vidar engineered hardwood collections are compatible with radiant heating systems. Our installers follow Vidar\'s specifications for moisture barriers and temperature limits.' },
    { question: 'Where can I see Vidar flooring samples in Markham?', answer: 'Visit BBS Flooring at 6061 Highway 7, Unit B, Markham. We carry the full Vidar collection in our showroom. Walk-ins welcome Monday–Saturday.' },
    { question: 'Does BBS Flooring install Vidar flooring?', answer: 'Absolutely. We handle everything: free in-home measurement, subfloor prep, installation, transitions, trim, and furniture moving. We serve Markham, Toronto, Durham Region, and the entire GTA.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'vidar'),
  productSessionKey: 'vidar',
  productQueryKey: 'products-vidar',
};

export const basementFlooringData = {
  route: 'BasementFlooring',
  title: 'Best Basement Flooring Markham | Waterproof Vinyl & SPC',
  description: 'Waterproof basement flooring in Markham. SPC vinyl, luxury vinyl plank. Moisture-resistant, durable. Free measurements. Call (647) 428-1111.',
  h1: 'Waterproof Basement Flooring',
  subtitle: 'Moisture-proof vinyl and SPC flooring built for Canadian basements. In stock at our Markham showroom.',
  parentPage: { label: 'Vinyl', route: 'Vinyl' },
  schemaType: 'product',
  content: [
    {
      heading: 'The Best Flooring for Basements in Markham',
      body: `<p>Basements demand flooring that can handle moisture, temperature swings, and concrete subfloors. At BBS Flooring, we specialize in <strong>waterproof SPC vinyl plank</strong> — the gold standard for below-grade installations in the GTA.</p>
<p>Unlike hardwood or laminate, SPC (Stone Polymer Composite) vinyl is <strong>100% waterproof</strong>, dimensionally stable, and installs directly over concrete with minimal prep. Perfect for basement rec rooms, home offices, and in-law suites.</p>`
    },
    {
      heading: 'Why SPC Vinyl for Your Basement?',
      body: `<ul>
<li><strong>100% Waterproof:</strong> Won't swell, warp, or buckle from moisture or minor flooding.</li>
<li><strong>Rigid Core:</strong> SPC's stone-polymer core hides subfloor imperfections — no need for expensive leveling.</li>
<li><strong>Warm Underfoot:</strong> Built-in pad options add insulation and comfort on cold concrete.</li>
<li><strong>Realistic Wood & Stone Looks:</strong> HD printed textures that look like real hardwood at a fraction of the cost.</li>
<li><strong>Easy Maintenance:</strong> Sweep and mop — no sealing, no refinishing.</li>
</ul>
<p>Browse our <a href="/Vinyl">full vinyl collection</a> or <a href="/QuoteCalculator">get an instant quote</a>.</p>`
    },
    {
      heading: 'Professional Basement Flooring Installation',
      body: `<p>Our team handles the complete job: moisture testing, subfloor prep, underlayment, installation, and trim. We serve <a href="/Location?city=Markham">Markham</a>, <a href="/Location?city=Pickering">Pickering</a>, Toronto, and all of <a href="/Location?city=Ajax">Durham Region</a>. <strong>We even move your furniture</strong> — no extra charge.</p>`
    },
  ],
  faqItems: [
    { question: 'What is the best flooring for a basement in Ontario?', answer: 'SPC (Stone Polymer Composite) vinyl plank is the best choice for Ontario basements. It\'s 100% waterproof, handles temperature swings, and installs directly over concrete. BBS Flooring carries 100+ waterproof vinyl options starting from $2.49/sqft.' },
    { question: 'Can you put vinyl plank flooring in a basement?', answer: 'Yes — vinyl plank is ideal for basements. SPC vinyl is fully waterproof, doesn\'t need a moisture barrier in most cases (though we always test), and floats over concrete without glue. It\'s the most popular basement flooring we install.' },
    { question: 'How much does basement flooring cost in Markham?', answer: 'Waterproof vinyl plank for basements ranges from $1.79–$5.00/sqft for material. Installation adds $2.00–$2.25/sqft depending on prep needed. Call (647) 428-1111 or use our Quote Calculator for your exact cost.' },
    { question: 'Is SPC vinyl better than laminate for basements?', answer: 'Yes. While some laminate claims water resistance, only SPC vinyl is truly 100% waterproof. In a below-grade basement where moisture risk is higher, SPC is the safer long-term choice. It also doesn\'t require as much subfloor prep.' },
    { question: 'Do you install basement flooring in the GTA?', answer: 'Yes. BBS Flooring installs basement flooring across the GTA including Markham, Toronto, Scarborough, Pickering, Ajax, Whitby, Richmond Hill, and Vaughan. Free in-home measurements. Call (647) 428-1111.' },
  ],
  productFilter: (p) => {
    const cat = lc(p.category);
    const name = lc(p.name || '');
    const desc = lc(p.product_description || '');
    const isVinyl = cat === 'vinyl' || cat.includes('vinyl');
    const isWaterproof = has(name, 'waterproof') || has(desc, 'waterproof') || has(name, 'spc') || has(desc, 'spc');
    return isVinyl || isWaterproof;
  },
  productSessionKey: 'basement',
  productQueryKey: 'products-basement',
};

export const flooringInstallationCostData = {
  route: 'FlooringInstallationCost',
  title: 'Flooring Installation Cost Markham & GTA | Price Guide',
  description: 'How much does flooring installation cost in Markham? Hardwood $2.25/sqft, vinyl $2.00-2.25/sqft, laminate $2.00-2.25/sqft. Free quotes. Call (647) 428-1111.',
  h1: 'Flooring Installation Cost Guide',
  subtitle: 'Transparent pricing from a local, family-owned company. No hidden fees — free in-home measurements across the GTA.',
  parentPage: { label: 'Installation', route: 'Installation' },
  schemaType: 'service',
  showProducts: false,
  content: [
    {
      heading: 'How Much Does Flooring Installation Cost in Markham?',
      body: `<p>Pricing depends on the material, room size, and subfloor condition. Here are the typical ranges for professional installation in the GTA (material + labour):</p>
<table class="w-full border-collapse my-4">
<thead><tr class="bg-slate-100"><th class="text-left p-3 border">Flooring Type</th><th class="text-left p-3 border">Material (/sqft)</th><th class="text-left p-3 border">Installation (/sqft)</th><th class="text-left p-3 border">Total (/sqft)</th></tr></thead>
<tbody>
<tr><td class="p-3 border"><strong>Solid Hardwood</strong></td><td class="p-3 border">$5.00–$12.00</td><td class="p-3 border">$2.25</td><td class="p-3 border">$7.25–$14.25</td></tr>
<tr><td class="p-3 border"><strong>Engineered Hardwood</strong></td><td class="p-3 border">$3.00–$7.25</td><td class="p-3 border">$2.25–$4.25</td><td class="p-3 border">$5.25–$11.50</td></tr>
<tr><td class="p-3 border"><strong>Luxury Vinyl (SPC)</strong></td><td class="p-3 border">$1.79–$5.00</td><td class="p-3 border">$2.00–$2.25</td><td class="p-3 border">$3.79–$7.25</td></tr>
<tr><td class="p-3 border"><strong>Laminate</strong></td><td class="p-3 border">$1.79–$5.00</td><td class="p-3 border">$2.00–$2.25</td><td class="p-3 border">$3.79–$7.25</td></tr>
<tr><td class="p-3 border"><strong>Staircase Recapping</strong></td><td class="p-3 border" colspan="3">$125–$225 per step (railings, pickets, posts &amp; nosing extra — needs measurement)</td></tr>
</tbody>
</table>
<p><strong>Want an exact number?</strong> <a href="/QuoteCalculator">Use our free Quote Calculator</a> — enter your room dimensions and material choice, and get an instant estimate.</p>`
    },
    {
      heading: 'What Affects Your Installation Cost?',
      body: `<ul>
<li><strong>Subfloor Condition:</strong> Uneven concrete or damaged plywood may need leveling ($1–$3/sqft extra).</li>
<li><strong>Old Flooring Removal:</strong> Ripping up carpet, tile, or old hardwood adds $1.00–$3.00/sqft.</li>
<li><strong>Room Complexity:</strong> Stairs, closets, and tight hallways take more time than open rectangles.</li>
<li><strong>Material Choice:</strong> Glue-down vs. floating click-lock vs. nail-down — each has different labour requirements.</li>
<li><strong>Furniture Moving:</strong> At BBS Flooring, <strong>we move your furniture for free</strong>.</li>
</ul>`
    },
    {
      heading: 'How to Save on Flooring Installation',
      body: `<p>✅ <strong>Buy material + installation together</strong> — bundled pricing is always cheaper than hiring separately.</p>
<p>✅ <strong>Check our <a href="/Clearance">Clearance section</a></strong> — in-stock overstocks at 30-60% off.</p>
<p>✅ <strong>Ask about contractor pricing</strong> — if you're a contractor or buying for multiple rooms, we offer volume discounts.</p>
<p>✅ <strong>Get a free measurement first</strong> — accurate measurements prevent over-ordering material.</p>`
    },
  ],
  faqItems: [
    { question: 'How much does it cost to install 1,000 sqft of flooring?', answer: 'For 1,000 sqft, expect roughly $3,790–$7,250 for vinyl or laminate, $5,250–$11,500 for engineered hardwood, or $7,250–$14,250 for solid hardwood (material + installation). Use our online Quote Calculator for your exact cost, or call (647) 428-1111.' },
    { question: 'Does BBS Flooring offer free estimates?', answer: 'Yes. We provide free in-home measurements and quotes anywhere in the GTA — Markham, Toronto, Scarborough, Pickering, Ajax, Whitby, Richmond Hill, Vaughan, and surrounding areas. Call (647) 428-1111 to book.' },
    { question: 'Is it cheaper to buy flooring and install yourself?', answer: 'DIY saves on labour but risks costly mistakes — uneven subfloors, expansion gaps, and poor transitions can cause problems within months. Our professional installation includes subfloor prep, moisture testing, trim, and furniture moving. The warranty on both material and labour protects your investment.' },
    { question: 'How long does flooring installation take?', answer: 'A typical 500 sqft room takes 1–2 days for vinyl or laminate, 2–3 days for hardwood. Larger homes (1,000+ sqft) usually take 3–5 days. We\'ll give you an exact timeline during your free measurement appointment.' },
    { question: 'Do you charge extra to move furniture?', answer: 'No. BBS Flooring moves standard household furniture at no extra charge. Heavy items like pianos or pool tables may require specialty movers.' },
  ],
  ctaText: 'Calculate Your Cost',
};

export const flooringShowroomMarkhamData = {
  route: 'FlooringShowroomMarkham',
  title: 'Flooring Store Markham | Showroom | 6061 Hwy 7',
  description: 'Visit BBS Flooring showroom in Markham. 600+ products, hardwood, vinyl, laminate. 6061 Highway 7. Mon-Sat. Free measurements. Call (647) 428-1111.',
  h1: 'BBS Flooring Showroom — Markham',
  subtitle: '600+ flooring products on display. Expert advice, free measurements, and honest pricing since 2012.',
  schemaType: 'showroom',
  showProducts: false,
  showMap: true,
  mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2878.871587606354!2d-79.25622102326802!3d43.85905624535496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d7647895e557%3A0x8956973e89c67623!2sBBS%20Flooring!5e0!3m2!1sen!2sca!4v1708795000000!5m2!1sen!2sca" width="100%" height="100%" style="border:0;" allowFullScreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
  content: [
    {
      heading: 'Your Local Flooring Experts on Highway 7',
      body: `<p>BBS Flooring has been Markham's trusted flooring destination since 2012. Our <strong>5,000 sqft showroom</strong> at 6061 Highway 7 features over 600 products you can see, touch, and take home as samples.</p>
<p><strong>📍 Address:</strong> 6061 Highway 7, Unit B, Markham, ON L3P 3A7<br/>
<strong>📞 Phone:</strong> <a href="tel:+16474281111">(647) 428-1111</a><br/>
<strong>🕐 Hours:</strong> Monday–Friday 9am–6pm | Saturday 10am–5pm | Sunday Closed</p>`
    },
    {
      heading: 'What You\'ll Find In Our Showroom',
      body: `<ul>
<li><strong><a href="/SolidHardwood">Solid Hardwood</a>:</strong> Canadian maple, red oak, white oak — from $5/sqft.</li>
<li><strong><a href="/EngineeredHardwood">Engineered Hardwood</a>:</strong> Vidar, Wickham, Triforest — wide plank European oak.</li>
<li><strong><a href="/Vinyl">Luxury Vinyl (SPC)</a>:</strong> 100% waterproof, perfect for basements and kitchens.</li>
<li><strong><a href="/Laminate">Laminate</a>:</strong> 12mm premium options from $2.39/sqft.</li>
<li><strong><a href="/Stairs">Staircase Samples</a>:</strong> Treads, risers, and railing options for full stair renovations.</li>
</ul>
<p>Walk-ins are always welcome. No appointment needed — but if you'd like one-on-one time with a specialist, <a href="/Contact">book a consultation</a>.</p>`
    },
    {
      heading: 'Serving the Entire GTA',
      body: `<p>While our showroom is in Markham, we install flooring across the Greater Toronto Area: <a href="/Location?city=Markham">Markham</a>, <a href="/Location?city=Richmond Hill">Richmond Hill</a>, <a href="/Location?city=Pickering">Pickering</a>, <a href="/Location?city=Ajax">Ajax</a>, <a href="/Location?city=Whitby">Whitby</a>, <a href="/Location?city=Vaughan">Vaughan</a>, Toronto, Scarborough, and North York. <strong>Free in-home measurements</strong> anywhere in the GTA.</p>`
    },
  ],
  faqItems: [
    { question: 'Where is BBS Flooring located?', answer: '6061 Highway 7, Unit B, Markham, ON L3P 3A7. We\'re on the south side of Highway 7, between McCowan Rd and Markham Rd, near Markville Mall.' },
    { question: 'Do I need an appointment to visit the showroom?', answer: 'No appointment needed — walk-ins are welcome Monday through Saturday. If you\'d like dedicated time with a flooring specialist, you can call (647) 428-1111 to schedule a consultation.' },
    { question: 'Can I take home flooring samples?', answer: 'Yes! We offer free samples of most products so you can see how they look in your home\'s lighting. Just visit the showroom and ask.' },
    { question: 'Do you offer free measurements?', answer: 'Yes. We provide free in-home measurements anywhere in the GTA. Call (647) 428-1111 or book online at our Free Measurement page. Our estimator will measure every room and provide a detailed, no-obligation quote.' },
    { question: 'What areas does BBS Flooring serve?', answer: 'We serve all of the GTA including Markham, Toronto, Scarborough, North York, Richmond Hill, Vaughan, Stouffville, Pickering, Ajax, Whitby, Oshawa, and Durham Region. Our showroom is in Markham and our installers cover the entire area.' },
  ],
  ctaText: 'Book a Free Consultation',
};

export const stairRefinishingData = {
  route: 'StairRefinishing',
  title: 'Staircase Refinishing Markham & GTA | Hardwood Stairs',
  description: 'Professional staircase refinishing in Markham. Hardwood treads, custom staining, carpet-to-hardwood conversion. Free quotes. Call (647) 428-1111.',
  h1: 'Staircase Refinishing & Renovation',
  subtitle: 'Transform outdated carpet stairs into stunning hardwood. Custom staining, recapping, and full stair renovation.',
  parentPage: { label: 'Stairs', route: 'Stairs' },
  schemaType: 'service',
  showProducts: false,
  content: [
    {
      heading: 'Staircase Refinishing Services in Markham',
      body: `<p>Tired of worn carpet, squeaky treads, or dated oak stairs? BBS Flooring specializes in <strong>complete staircase transformations</strong> — from simple refinishing to full carpet-to-hardwood conversions. We've renovated hundreds of staircases across the GTA since 2012.</p>
<p>Our services include:</p>
<ul>
<li><strong>Stair Recapping:</strong> Install new hardwood or vinyl treads over your existing staircase structure — faster and more affordable than full replacement.</li>
<li><strong>Custom Staining:</strong> Match your stairs to your floors with any stain colour. We use professional-grade stains and multiple coats of polyurethane.</li>
<li><strong>Carpet-to-Hardwood Conversion:</strong> Remove old carpet, prep the structure, and install beautiful hardwood treads and risers.</li>
<li><strong>Railing & Spindle Upgrades:</strong> Modern iron spindles, glass panels, or painted wood — we coordinate the full staircase look.</li>
</ul>`
    },
    {
      heading: 'How Much Does Staircase Refinishing Cost?',
      body: `<p>Staircase pricing depends on the number of steps, material, and scope of work:</p>
<ul>
<li><strong>Stair Recapping (hardwood treads):</strong> $125–$225 per step (railings, pickets, posts &amp; nosing extra — needs measurement)</li>
<li><strong>Full Carpet Removal + Hardwood:</strong> $200–$400 per step</li>
<li><strong>Staining/Refinishing Only:</strong> $80–$150 per step</li>
<li><strong>Railing/Spindle Replacement:</strong> $1,500–$5,000+ depending on material</li>
</ul>
<p>A typical 13-step staircase recapping runs $2,000–$4,500 total. <a href="/QuoteCalculator">Use our Quote Calculator</a> or call <a href="tel:+16474281111">(647) 428-1111</a> for a free in-home quote.</p>`
    },
    {
      heading: 'Why Choose BBS for Your Staircase?',
      body: `<p>✅ <strong>We match your floors:</strong> If we installed (or are installing) your main floors, we colour-match the stairs perfectly.</p>
<p>✅ <strong>Dustless sanding:</strong> Our dust containment system keeps your home clean during refinishing.</p>
<p>✅ <strong>One-stop shop:</strong> Floors + stairs + trim in one project = better pricing and a seamless result.</p>
<p>We serve <a href="/Location?city=Markham">Markham</a>, <a href="/Location?city=Pickering">Pickering</a>, <a href="/Location?city=Richmond Hill">Richmond Hill</a>, Toronto, Scarborough, and all of Durham Region.</p>`
    },
  ],
  faqItems: [
    { question: 'How long does staircase refinishing take?', answer: 'A typical 13-step staircase takes 2–3 days for recapping, or 3–5 days for a full carpet-to-hardwood conversion. Refinishing only (sanding + staining) takes 1–2 days plus drying time. We\'ll give you an exact timeline during the free quote.' },
    { question: 'Can you match my stair treads to my existing floors?', answer: 'Yes. We custom-stain stair treads to match any existing flooring. If we\'re installing your main floors and stairs together, we guarantee a perfect colour match.' },
    { question: 'Is stair recapping cheaper than replacing the whole staircase?', answer: 'Yes, significantly. Recapping installs new hardwood treads and risers over the existing staircase structure, so there\'s no demolition cost. It\'s typically 40–60% less than a full staircase rebuild and looks identical.' },
    { question: 'Do you remove old carpet from stairs?', answer: 'Yes. Carpet removal, tack strip removal, and nail patching are included in our carpet-to-hardwood conversion service. We handle the full job from demo to final coat.' },
    { question: 'What wood species are available for stair treads?', answer: 'We offer red oak, white oak, maple, hickory, and walnut stair treads. Engineered options are also available for compatibility with radiant heat or specific tread thicknesses. Visit our showroom to see samples.' },
  ],
  ctaText: 'Get a Stair Quote',
};


// ══════════════════════════════════════════════════════════
// PRIORITY 2 — Medium Impact (QS 3-5, differentiation)
// ══════════════════════════════════════════════════════════

export const whiteOakFlooringData = {
  route: 'WhiteOakFlooring',
  title: 'White Oak Flooring Markham | Engineered & Solid',
  description: 'Shop white oak hardwood flooring in Markham. Engineered and solid options. Wide plank, wire-brushed. Free measurements. Call (647) 428-1111.',
  h1: 'White Oak Hardwood Flooring',
  subtitle: 'The most popular hardwood species in North America — available in engineered and solid options at BBS Flooring.',
  parentPage: { label: 'Engineered Hardwood', route: 'EngineeredHardwood' },
  schemaType: 'product',
  content: [
    {
      heading: 'Why White Oak Is the #1 Hardwood Choice',
      body: `<p>White oak has become the dominant hardwood species in Canadian homes — and for good reason. It's <strong>harder than red oak</strong> (Janka 1360 vs 1290), has a tighter grain that resists moisture, and takes stain beautifully from natural to dark espresso.</p>
<p>At BBS Flooring, we carry white oak from top brands including <a href="/VidarFlooring">Vidar</a>, Wickham, and Triforest — in widths from 3¼" to 9½", and in both <a href="/EngineeredHardwood">engineered</a> and <a href="/SolidHardwood">solid</a> constructions.</p>`
    },
    {
      heading: 'White Oak Options at BBS Flooring',
      body: `<ul>
<li><strong>European White Oak (Engineered):</strong> Wide plank, click-lock or glue-down. Perfect for open-concept living and radiant heat.</li>
<li><strong>Solid White Oak:</strong> ¾" thick, nail-down. Traditional elegance, can be sanded and refinished multiple times.</li>
<li><strong>Wire-Brushed & Smoked:</strong> Textured finishes that add character and hide daily wear.</li>
<li><strong>Unfinished White Oak:</strong> Custom stain on-site for a perfectly matched colour.</li>
</ul>`
    },
  ],
  faqItems: [
    { question: 'Is white oak better than red oak for flooring?', answer: 'White oak is generally preferred for modern homes. It has a tighter, more linear grain, slightly higher hardness (Janka 1360 vs 1290), and better moisture resistance. Red oak has a more pronounced grain pattern and warmer pink undertone — it\'s a matter of aesthetic preference, but white oak is the current market leader.' },
    { question: 'How much does white oak flooring cost?', answer: 'Solid white oak starts around $6/sqft. Engineered white oak ranges from $4.50–$9/sqft depending on plank width and brand. Visit BBS Flooring or call (647) 428-1111 for current pricing.' },
    { question: 'Can white oak flooring be installed in a basement?', answer: 'Engineered white oak can be installed in basements (it handles moisture better than solid). For fully below-grade basements with higher moisture risk, we may recommend SPC vinyl instead. Our installer will assess your specific conditions.' },
  ],
  productFilter: (p) => {
    const text = lc(p.name || '') + ' ' + lc(p.species || '') + ' ' + lc(p.product_description || '');
    return (text.includes('white oak') || text.includes('european oak')) &&
      (lc(p.category || '').includes('hardwood'));
  },
  productSessionKey: 'white-oak',
  productQueryKey: 'products-white-oak',
};

export const wickhamFlooringData = {
  route: 'WickhamFlooring',
  title: 'Wickham Flooring Markham | Hardwood Made in Canada',
  description: 'Shop Wickham hardwood flooring in Markham. Canadian-made, solid & engineered. Red oak, maple, hickory. Free measurements. Call (647) 428-1111.',
  h1: 'Wickham Hardwood Flooring',
  subtitle: 'Canadian-made hardwood from Wickham — solid and engineered collections in stock at BBS Flooring.',
  parentPage: { label: 'Engineered Hardwood', route: 'EngineeredHardwood' },
  schemaType: 'product',
  content: [
    {
      heading: 'Wickham: Canadian Hardwood Since 1997',
      body: `<p>Wickham Hardwood Flooring has been manufacturing premium hardwood floors in Quebec since 1997. Their products are <strong>100% made in Canada</strong> using sustainably sourced North American hardwoods.</p>
<p>At BBS Flooring, we carry a wide selection of Wickham's engineered and solid collections — from classic red oak to contemporary white oak and exotic hickory.</p>`
    },
    {
      heading: 'Wickham Collections at BBS',
      body: `<ul>
<li><strong>Domestic Collection:</strong> Solid ¾" hardwood in maple, red oak, white oak, and hickory.</li>
<li><strong>Engineered Series:</strong> Multi-ply construction for stability. Compatible with radiant heat.</li>
<li><strong>Wide Plank:</strong> Up to 7½" wide for modern, open-concept aesthetics.</li>
<li><strong>Custom Stain Options:</strong> Wickham offers factory-applied custom staining for unique colours.</li>
</ul>
<p><a href="/QuoteCalculator">Get a free quote</a> or visit our <a href="/FlooringShowroomMarkham">Markham showroom</a> to see Wickham samples.</p>`
    },
  ],
  faqItems: [
    { question: 'Is Wickham flooring made in Canada?', answer: 'Yes. Wickham Hardwood Flooring is manufactured in Wickham, Quebec, Canada. They use sustainably sourced North American hardwoods and have been in operation since 1997.' },
    { question: 'How much does Wickham hardwood flooring cost?', answer: 'Wickham hardwood ranges from approximately $5–$10/sqft depending on species, width, and collection. Contact BBS Flooring at (647) 428-1111 for current stock and pricing.' },
    { question: 'Where can I buy Wickham flooring in Markham?', answer: 'BBS Flooring at 6061 Highway 7, Markham carries Wickham hardwood. Visit our showroom to see samples or call (647) 428-1111 to check availability of specific products.' },
  ],
  hideBrandFilter: true,
  productFilter: (p) => has(p.brand, 'wickham'),
  productSessionKey: 'wickham',
  productQueryKey: 'products-wickham',
};

export const carpetToHardwoodStairsData = {
  route: 'CarpetToHardwoodStairs',
  title: 'Carpet to Hardwood Stairs Markham | Conversion Cost',
  description: 'Convert carpet stairs to hardwood in Markham. Professional stair recapping, custom staining. From $150/step. Free quotes. Call (647) 428-1111.',
  h1: 'Carpet to Hardwood Stair Conversion',
  subtitle: 'Remove dated carpet and reveal (or install) beautiful hardwood treads. Professional results, honest pricing.',
  parentPage: { label: 'Stairs', route: 'Stairs' },
  schemaType: 'service',
  showProducts: false,
  content: [
    {
      heading: 'Transform Your Carpet Stairs to Hardwood',
      body: `<p>Carpet on stairs collects dust, stains, and wear faster than any other surface in your home. Converting to hardwood treads instantly modernizes your entryway and <strong>adds resale value</strong>.</p>
<p>BBS Flooring handles the entire conversion: carpet removal, structure inspection, tread and riser installation, staining, and polyurethane finish. Most staircases are completed in <strong>2–3 days</strong>.</p>`
    },
    {
      heading: 'Carpet-to-Hardwood Stair Pricing',
      body: `<ul>
<li><strong>Basic Recapping (over existing structure):</strong> $150–$300/step</li>
<li><strong>Full Conversion (carpet removal + hardwood):</strong> $200–$400/step</li>
<li><strong>Custom Staining:</strong> Included in our conversion packages</li>
<li><strong>Railing Upgrades:</strong> Iron spindles, glass panels available</li>
</ul>
<p>A typical 13-step straight staircase conversion runs <strong>$2,600–$5,200</strong>. <a href="/QuoteCalculator">Get an exact quote</a>.</p>`
    },
  ],
  faqItems: [
    { question: 'How much does it cost to convert carpet stairs to hardwood?', answer: 'A full carpet-to-hardwood conversion costs $200–$400 per step, including carpet removal, new hardwood treads and risers, staining, and finish. A typical 13-step staircase runs $2,600–$5,200 total. Call (647) 428-1111 for a free quote.' },
    { question: 'How long does carpet to hardwood stair conversion take?', answer: 'Most standard 13-step staircases take 2–3 days. This includes carpet removal, prep, installation, staining, and at least one coat of polyurethane. An additional day of drying may be needed before heavy use.' },
    { question: 'Can you match stair treads to my existing hardwood floors?', answer: 'Yes. We custom-stain stair treads to match your existing floors. If you\'re doing floors and stairs together, we guarantee a perfect match since we\'re using the same materials and stain.' },
    { question: 'Do you serve Pickering and Toronto for stair renovations?', answer: 'Yes. BBS Flooring installs stairs across the GTA including Markham, Pickering, Ajax, Toronto, Scarborough, Richmond Hill, Vaughan, and Durham Region.' },
  ],
  ctaText: 'Get a Stair Quote',
};

export const flooringClearanceSaleData = {
  route: 'FlooringClearanceSale',
  title: 'Flooring Clearance Sale Markham | Up to 60% Off',
  description: 'Flooring clearance sale in Markham. Hardwood, vinyl, laminate up to 60% off. In-stock, limited quantities. Visit BBS Flooring or call (647) 428-1111.',
  h1: 'Flooring Clearance Sale',
  subtitle: 'In-stock overruns, discontinued lines, and limited quantities at 30–60% off. First come, first served.',
  schemaType: 'product',
  content: [
    {
      heading: 'Why Buy Clearance Flooring?',
      body: `<p>Our clearance section features <strong>brand-new, first-quality flooring</strong> at deeply discounted prices. These aren't seconds or defects — they're overstock, discontinued colours, or end-of-lot quantities from premium brands.</p>
<p>If your project size matches the available quantity, you get the same product for significantly less. <a href="/Clearance">Browse the full clearance catalog</a>.</p>`
    },
    {
      heading: 'What\'s on Clearance Right Now',
      body: `<p>Clearance inventory changes weekly. Current categories include:</p>
<ul>
<li><strong>Engineered Hardwood:</strong> Select Vidar and Wickham styles — from $3.99/sqft</li>
<li><strong>Luxury Vinyl Plank:</strong> SPC waterproof options — from $1.99/sqft</li>
<li><strong>Laminate:</strong> 12mm premium laminate — from $1.49/sqft</li>
</ul>
<p><strong>Limited quantities.</strong> When it's gone, it's gone. Visit the showroom or call <a href="tel:+16474281111">(647) 428-1111</a> to check current stock.</p>`
    },
  ],
  faqItems: [
    { question: 'Is clearance flooring lower quality?', answer: 'No. Our clearance products are first-quality, brand-new flooring. They\'re discounted because they\'re overstock, discontinued colours, or end-of-lot quantities. Same warranty, same quality — just a better price.' },
    { question: 'Can I get clearance flooring installed?', answer: 'Absolutely. We offer full professional installation for all clearance products. Material + installation bundles give you the best overall price.' },
    { question: 'How often does clearance inventory change?', answer: 'Weekly. New products are added as we receive overstock shipments and clear seasonal inventory. Follow us on social media or call (647) 428-1111 to ask about the latest arrivals.' },
  ],
  productFilter: (p) => {
    return p.is_on_sale === true || has(p.tags, 'clearance') || has(p.tags, 'sale');
  },
  productSessionKey: 'clearance-sale',
  productQueryKey: 'products-clearance-sale',
};

export const waterproofFlooringData = {
  route: 'WaterproofFlooring',
  title: 'Waterproof Flooring Markham | SPC Vinyl & Laminate',
  description: 'Shop waterproof flooring in Markham. SPC vinyl, waterproof laminate. Perfect for kitchens, bathrooms, basements. Free measurements. Call (647) 428-1111.',
  h1: 'Waterproof Flooring',
  subtitle: '100% waterproof SPC vinyl and water-resistant laminate — built for kitchens, bathrooms, and basements.',
  schemaType: 'product',
  content: [
    {
      heading: 'Waterproof Flooring Options at BBS',
      body: `<p>Water damage is the #1 flooring killer. Protect your investment with flooring engineered to handle spills, splashes, and even minor flooding. BBS Flooring carries two waterproof categories:</p>
<ul>
<li><strong><a href="/Vinyl">SPC Luxury Vinyl Plank</a>:</strong> 100% waterproof stone-polymer core. Ideal for basements, kitchens, bathrooms, and laundry rooms. From $2.49/sqft.</li>
<li><strong><a href="/Laminate">Water-Resistant Laminate</a>:</strong> Sealed edges and HDF core with wax treatment. Handles splashes for up to 24 hours. From $2.39/sqft.</li>
</ul>
<p>For fully below-grade basements, we strongly recommend SPC vinyl. For main-floor kitchens and living areas, either option works beautifully.</p>`
    },
    {
      heading: 'Where to Use Waterproof Flooring',
      body: `<p><strong>✅ Basements</strong> — Concrete subfloors with potential moisture? SPC vinyl floats right over it.<br/>
<strong>✅ Kitchens</strong> — Spills, splashes, and heavy traffic. Waterproof flooring handles it all.<br/>
<strong>✅ Bathrooms</strong> — Yes, SPC vinyl works in bathrooms (unlike hardwood or standard laminate).<br/>
<strong>✅ Laundry Rooms</strong> — Protect against washer leaks and standing water.<br/>
<strong>✅ Entryways</strong> — Salt, snow, and wet boots — no problem.</p>`
    },
  ],
  faqItems: [
    { question: 'What is the best waterproof flooring?', answer: 'SPC (Stone Polymer Composite) luxury vinyl plank is the best fully waterproof flooring. Its rigid stone-polymer core is 100% impervious to water, handles temperature swings, and installs over concrete without glue. BBS Flooring carries 100+ SPC options.' },
    { question: 'Is waterproof laminate really waterproof?', answer: 'Water-resistant laminate can handle splashes and spills for up to 24 hours, but it is NOT fully submersible like SPC vinyl. For basements or bathrooms where standing water is possible, we recommend SPC vinyl instead.' },
    { question: 'How much does waterproof flooring cost?', answer: 'SPC vinyl: $2.49–$6.00/sqft. Water-resistant laminate: $2.39–$5.00/sqft. Installation adds $1.25–$3.00/sqft depending on type. Call (647) 428-1111 or use our Quote Calculator for your exact price.' },
  ],
  productFilter: (p) => {
    const text = lc(p.name || '') + ' ' + lc(p.product_description || '') + ' ' + lc(p.tags || '');
    const cat = lc(p.category || '');
    return (text.includes('waterproof') || text.includes('spc') || cat === 'vinyl');
  },
  productSessionKey: 'waterproof',
  productQueryKey: 'products-waterproof',
};


// ══════════════════════════════════════════════════════════
// PRIORITY 1B — High-Impact Pages (Identified Session 2)
// ══════════════════════════════════════════════════════════

export const contractorFlooringData = {
  route: 'ContractorFlooring',
  title: 'Contractor Flooring Markham | Trade Pricing & Bulk Orders',
  description: 'Flooring contractor pricing in Markham. Member trade discounts, bulk orders, project scheduling. Hardwood, vinyl, laminate. Call (647) 428-1111.',
  h1: 'Flooring for Contractors & Trade Professionals',
  subtitle: 'Member pricing, priority scheduling, and dedicated project support — built for GTA contractors who demand quality and reliability.',
  parentPage: { label: 'Installation', route: 'Installation' },
  schemaType: 'service',
  content: [
    {
      heading: 'The BBS Contractor Advantage',
      body: `<p>If you're a general contractor, renovation specialist, or property manager, you need a flooring supplier that works at your speed. BBS Flooring serves <strong>hundreds of trade professionals</strong> across the GTA with a program built for the way you work:</p>
<ul>
<li><strong>Member Trade Pricing:</strong> Exclusive discounts on our full catalog — hardwood, vinyl, laminate, and stair materials. Your margin stays healthy.</li>
<li><strong>Bulk Order Discounts:</strong> Multi-unit projects, condo flips, rental portfolios — volume pricing on large orders.</li>
<li><strong>Priority Scheduling:</strong> Dedicated project coordination so your install dates don't slip.</li>
<li><strong>Direct Material Supply:</strong> Buy material only, or bundle with our professional installation crew.</li>
<li><strong>Fast Pickup:</strong> In-stock products available for same-day or next-day pickup at our <a href="/FlooringShowroomMarkham">Markham warehouse</a>.</li>
</ul>`
    },
    {
      heading: 'Products Our Contractors Trust',
      body: `<p>Our contractor clients rely on these categories for residential and commercial projects:</p>
<ul>
<li><strong><a href="/EngineeredHardwood">Engineered Hardwood</a>:</strong> Vidar, Wickham, Triforest — wide plank European oak, click-lock for fast install.</li>
<li><strong><a href="/Vinyl">SPC Luxury Vinyl</a>:</strong> 100% waterproof, rigid core. The go-to for basement conversions, condo units, and rental-grade durability.</li>
<li><strong><a href="/Laminate">12mm Laminate</a>:</strong> Budget-friendly, fast install. Ideal for rental properties and staging.</li>
<li><strong><a href="/Stairs">Stair Recapping Kits</a>:</strong> Pre-finished treads and risers for efficient stair renovations.</li>
</ul>
<p>Need something specific? We source specialty products and custom orders for trade accounts.</p>`
    },
    {
      heading: 'How to Join the BBS Trade Program',
      body: `<p>Getting started is simple:</p>
<ol>
<li><strong>Call or visit:</strong> Contact us at <a href="tel:+16474281111">(647) 428-1111</a> or visit our <a href="/FlooringShowroomMarkham">Markham showroom</a>.</li>
<li><strong>Register:</strong> Provide your business credentials and we'll set up your member account.</li>
<li><strong>Start saving:</strong> Unlock trade pricing on your first order. No minimum commitment, no annual fees.</li>
</ol>
<p>Already working with another supplier? We'll price-match and beat it. Bring your current quotes — we're confident in our value.</p>`
    },
    {
      heading: 'Why Contractors Choose BBS Over Big Box Stores',
      body: `<p>✅ <strong>Real expertise:</strong> Our team knows flooring — subfloor prep, moisture testing, product compatibility. No minimum-wage advice.</p>
<p>✅ <strong>Reliable supply:</strong> 600+ products in stock at our Markham warehouse. No waiting weeks for back-ordered material.</p>
<p>✅ <strong>Installation crew available:</strong> Need labour? Our experienced installers can handle your project or supplement your team.</p>
<p>✅ <strong>GTA-wide delivery:</strong> <a href="/Location?city=Markham">Markham</a>, Toronto, <a href="/Location?city=Pickering">Pickering</a>, <a href="/Location?city=Richmond Hill">Richmond Hill</a>, <a href="/Location?city=Ajax">Durham Region</a>, and beyond.</p>`
    },
  ],
  faqItems: [
    { question: 'Does BBS Flooring offer contractor pricing?', answer: 'Yes. Our Member Trade Program gives contractors exclusive pricing on our full catalog — hardwood, vinyl, laminate, and stair materials. No annual fees or minimum commitments. Call (647) 428-1111 or visit our showroom to register.' },
    { question: 'Can contractors buy material only without installation?', answer: 'Absolutely. Many of our contractor clients purchase material only for their own crews to install. We also offer installation services if you need additional labour for a project.' },
    { question: 'Do you offer bulk discounts for large projects?', answer: 'Yes. Multi-unit projects, condo developments, and large residential renovations qualify for additional volume discounts on top of member pricing. Contact us with your project details for a custom quote.' },
    { question: 'How quickly can I pick up material?', answer: 'In-stock products are available for same-day pickup at our Markham warehouse during business hours. For large orders, we can have material staged and ready — just call ahead. We also offer GTA-wide delivery.' },
    { question: 'What areas do you supply contractors in?', answer: 'We supply contractors across the entire GTA: Markham, Toronto, Scarborough, North York, Richmond Hill, Vaughan, Stouffville, Pickering, Ajax, Whitby, Oshawa, and all of Durham Region. Delivery available.' },
  ],
  showProducts: false,
  ctaText: 'Get Trade Pricing',
};

export const hardwoodRefinishingData = {
  route: 'HardwoodRefinishing',
  title: 'Hardwood Floor Refinishing Markham & GTA | Sand & Stain',
  description: 'Professional hardwood floor refinishing in Markham. Dustless sanding, custom staining, polyurethane finish. Free quotes. Call (647) 428-1111.',
  h1: 'Hardwood Floor Refinishing',
  subtitle: 'Bring your worn hardwood floors back to life — dustless sanding, custom staining, and professional-grade finishes.',
  parentPage: { label: 'Installation', route: 'Installation' },
  schemaType: 'service',
  showProducts: false,
  content: [
    {
      heading: 'Professional Hardwood Refinishing in Markham & the GTA',
      body: `<p>Scratched, faded, or worn hardwood floors don't need to be replaced — they need to be <strong>refinished</strong>. BBS Flooring's refinishing team restores solid and engineered hardwood floors to like-new condition using professional-grade equipment and finishes.</p>
<p>We handle everything from single-room touch-ups to full-home refinishing projects. Whether it's a 30-year-old red oak floor that needs new life or a recent installation that needs a colour change, we've done it.</p>`
    },
    {
      heading: 'Our Refinishing Process',
      body: `<ol>
<li><strong>Free In-Home Assessment:</strong> We inspect your floors, test the wood thickness, and discuss your goals (natural, dark stain, matte vs. gloss).</li>
<li><strong>Dustless Sanding:</strong> Our dust-containment system captures 99% of sanding dust — keeping your home clean and your family safe.</li>
<li><strong>Stain Application:</strong> Choose from dozens of stain colours. We apply test patches so you approve the exact colour before we proceed.</li>
<li><strong>Polyurethane Finish:</strong> 2–3 coats of commercial-grade oil-based or water-based polyurethane for maximum durability.</li>
<li><strong>Final Inspection:</strong> We walk through the finished floors with you to ensure everything meets your expectations.</li>
</ol>`
    },
    {
      heading: 'Hardwood Refinishing Cost Guide',
      body: `<p>Refinishing is typically <strong>60–75% cheaper than full replacement</strong>:</p>
<ul>
<li><strong>Sand & Refinish (natural):</strong> $5.25/sqft</li>
<li><strong>Sand, Stain & Refinish:</strong> $6.25/sqft</li>
</ul>
<p>A typical 1,000 sqft main floor refinishing runs <strong>$5,250–$6,250</strong> — compared to $7,250–$14,250 for new hardwood installation. <a href="/QuoteCalculator">Get your exact quote</a> or call <a href="tel:+16474281111">(647) 428-1111</a>.</p>`
    },
    {
      heading: 'When to Refinish vs. Replace',
      body: `<p><strong>Refinish if:</strong></p>
<ul>
<li>Surface scratches, dull finish, or minor dents</li>
<li>You want to change the stain colour</li>
<li>The wood is still structurally sound (enough wear layer remaining)</li>
<li>You love the character of your existing floors</li>
</ul>
<p><strong>Replace if:</strong></p>
<ul>
<li>Deep water damage, warping, or buckling</li>
<li>The wood has been sanded too many times (less than 1mm wear layer)</li>
<li>You want a completely different species or plank width</li>
</ul>
<p>Not sure? Our free in-home assessment will tell you exactly what your floors need. We'll always recommend refinishing when it's the right call — it saves you money and preserves your original floors.</p>`
    },
  ],
  faqItems: [
    { question: 'How much does hardwood floor refinishing cost in Markham?', answer: 'Sand & refinish (natural) is $5.25/sqft. Sand, stain & refinish is $6.25/sqft. Call (647) 428-1111 for a free in-home quote tailored to your specific floors.' },
    { question: 'How long does hardwood refinishing take?', answer: 'A typical 1,000 sqft floor takes 3–5 days: 1 day sanding, 1 day staining (if applicable), and 1–2 days for polyurethane coats with drying time between each. Water-based finishes dry faster (2–3 hours between coats) than oil-based (8–12 hours).' },
    { question: 'Is dustless sanding really dustless?', answer: 'Our dust-containment sanding system captures 99% of airborne dust using HEPA-filtered vacuum attachments connected directly to the sander. It\'s not 100% dust-free, but it\'s dramatically cleaner than traditional sanding — no plastic sheeting needed on your furniture.' },
    { question: 'Can engineered hardwood be refinished?', answer: 'It depends on the wear layer thickness. Engineered hardwood with a 2mm+ wear layer can typically be sanded and refinished once. Premium products (like Vidar with 4mm wear layers) can be refinished 2–3 times. We measure your wear layer during the free assessment.' },
    { question: 'Do you refinish hardwood floors in Toronto and Durham?', answer: 'Yes. BBS Flooring refinishes hardwood floors across the GTA including Markham, Toronto, Scarborough, Pickering, Ajax, Whitby, Richmond Hill, Vaughan, and all of Durham Region. Free in-home assessments anywhere in our service area.' },
  ],
  ctaText: 'Book a Free Assessment',
};

export const compareFlooringData = {
  route: 'Compare',
  title: 'Hardwood vs Vinyl vs Laminate Flooring Comparison | Markham',
  description: 'Compare engineered hardwood, solid hardwood, vinyl LVP/SPC, and laminate flooring side by side. Real pricing, pros & cons, and which is best for every room. BBS Flooring Markham.',
  h1: 'Flooring Comparison Guide: Which Floor Is Right for You?',
  subtitle: 'Honest, no-BS comparison from a family-owned flooring company that sells and installs all four types. We\'ll tell you what actually works — not just what has the highest margin.',
  schemaType: 'service',
  showProducts: false,
  content: [
    {
      heading: 'Side-by-Side Pricing Comparison (Material Only)',
      body: `<p>These are <strong>real BBS Flooring prices on running-line products</strong> — always in stock, not discontinued closeouts.</p>
<table class="w-full border-collapse my-4">
<thead><tr class="bg-slate-100"><th class="text-left p-3 border">Feature</th><th class="text-left p-3 border">Laminate</th><th class="text-left p-3 border">Vinyl (LVP/SPC)</th><th class="text-left p-3 border">Engineered Hardwood</th><th class="text-left p-3 border">Solid Hardwood</th></tr></thead>
<tbody>
<tr><td class="p-3 border font-semibold">Starting Price</td><td class="p-3 border text-emerald-700 font-bold">$1.49/sqft</td><td class="p-3 border text-emerald-700 font-bold">$1.79/sqft</td><td class="p-3 border text-emerald-700 font-bold">$2.99/sqft</td><td class="p-3 border">$5.69/sqft</td></tr>
<tr><td class="p-3 border font-semibold">Typical Range</td><td class="p-3 border">$1.49–$2.39</td><td class="p-3 border">$1.79–$3.09</td><td class="p-3 border">$2.99–$5.29</td><td class="p-3 border">$5.69–$6.79</td></tr>
<tr><td class="p-3 border font-semibold">Installation</td><td class="p-3 border">$2.00–$2.25/sqft</td><td class="p-3 border">$2.00–$2.25/sqft</td><td class="p-3 border">$2.25–$4.25/sqft</td><td class="p-3 border">$2.25/sqft</td></tr>
<tr><td class="p-3 border font-semibold">500 sqft All-In</td><td class="p-3 border text-emerald-700 font-bold">From $1,745</td><td class="p-3 border">From $1,895</td><td class="p-3 border">From $2,620</td><td class="p-3 border">From $3,970</td></tr>
<tr><td class="p-3 border font-semibold">Waterproof?</td><td class="p-3 border">Water-resistant</td><td class="p-3 border text-emerald-700 font-bold">Yes — 100%</td><td class="p-3 border">No</td><td class="p-3 border">No</td></tr>
<tr><td class="p-3 border font-semibold">Best For</td><td class="p-3 border">Bedrooms, offices, dry areas</td><td class="p-3 border">Basements, kitchens, bathrooms, rentals</td><td class="p-3 border">Living rooms, dining rooms, main floors</td><td class="p-3 border">Premium homes, long-term investment</td></tr>
<tr><td class="p-3 border font-semibold">Lifespan</td><td class="p-3 border">15–25 years</td><td class="p-3 border">20–30 years</td><td class="p-3 border">25–50 years</td><td class="p-3 border">50–100 years</td></tr>
<tr><td class="p-3 border font-semibold">Can Be Refinished?</td><td class="p-3 border">No</td><td class="p-3 border">No</td><td class="p-3 border">1–3 times</td><td class="p-3 border">5+ times</td></tr>
<tr><td class="p-3 border font-semibold">Radiant Heat?</td><td class="p-3 border">Yes</td><td class="p-3 border">Yes</td><td class="p-3 border text-emerald-700 font-bold">Yes</td><td class="p-3 border">Not recommended</td></tr>
<tr><td class="p-3 border font-semibold">Over Concrete?</td><td class="p-3 border">Yes</td><td class="p-3 border">Yes</td><td class="p-3 border">Yes</td><td class="p-3 border">No</td></tr>
<tr><td class="p-3 border font-semibold">Pet Friendly?</td><td class="p-3 border">Yes</td><td class="p-3 border text-emerald-700 font-bold">Most durable</td><td class="p-3 border">Scratches possible</td><td class="p-3 border">Scratches easily</td></tr>
<tr><td class="p-3 border font-semibold">Resale Value</td><td class="p-3 border">Low–Medium</td><td class="p-3 border">Medium</td><td class="p-3 border text-emerald-700 font-bold">High</td><td class="p-3 border text-emerald-700 font-bold">Highest</td></tr>
</tbody>
</table>
<p>All prices include GST. Installation includes subfloor prep, transitions, and <strong>free furniture moving</strong>. <a href="/QuoteCalculator">Calculate your exact cost →</a></p>`
    },
    {
      heading: 'Engineered Hardwood — Our #1 Recommendation for GTA Homes',
      body: `<p><strong>Starting from $2.99/sqft (Select Grade European Oak)</strong></p>
<p>Engineered hardwood is what we install in 60%+ of our projects. Here's why it's the sweet spot for most GTA homeowners:</p>
<ul>
<li><strong>Real wood beauty</strong> — the top layer is genuine hardwood (White Oak, Red Oak, Maple, Hickory). It looks, feels, and sounds like solid hardwood.</li>
<li><strong>Better stability</strong> — the plywood core resists expansion and contraction from Ontario's humidity swings (dry winters → humid summers). Solid hardwood gaps and cups; engineered stays flat.</li>
<li><strong>Goes anywhere</strong> — over concrete slabs, over radiant heat, in condos, in basements (above-grade). Solid hardwood can't do any of that.</li>
<li><strong>Wide planks available</strong> — 5" to 7¼" widths for a modern, premium look.</li>
<li><strong>Can be refinished</strong> — 1–3 times depending on wear layer thickness.</li>
</ul>
<p>We carry 100+ engineered hardwood styles from Vidar, Wickham, Northernest, and more. <a href="/EngineeredHardwood">Browse our full selection →</a></p>`
    },
    {
      heading: 'Vinyl (LVP/SPC) — Best Value Waterproof Flooring',
      body: `<p><strong>Starting from $1.79/sqft (SPC click-lock vinyl plank)</strong></p>
<p>If moisture is even a possibility — basement, kitchen, bathroom, laundry, or rental property — vinyl is the answer. Our SPC (Stone Polymer Composite) vinyl is the latest generation:</p>
<ul>
<li><strong>100% waterproof</strong> — not water-resistant, waterproof. Leave a puddle on it overnight, no damage.</li>
<li><strong>Extremely durable</strong> — stone polymer core won't dent or indent like older vinyl. Handles pets, kids, dropped tools.</li>
<li><strong>Looks like real wood</strong> — modern LVP has realistic wood-grain textures and embossing. Guests won't know it's vinyl.</li>
<li><strong>Quiet underfoot</strong> — built-in underlayment on most styles. No hollow laminate sound.</li>
<li><strong>Fast click-lock installation</strong> — floating floor, no glue needed. Most rooms done in a day.</li>
</ul>
<p>At $1.79/sqft starting price, this is the best-value waterproof flooring in the GTA. <a href="/Vinyl">See all vinyl options →</a></p>`
    },
    {
      heading: 'Laminate — Maximum Floor for Minimum Budget',
      body: `<p><strong>Starting from $1.49/sqft (12mm, AC4/AC5 rated)</strong></p>
<p>When budget is the priority and the area is dry, laminate delivers the most floor per dollar:</p>
<ul>
<li><strong>Lowest cost hard-surface flooring</strong> — 500 sqft installed from $1,745 total.</li>
<li><strong>12mm thickness</strong> — feels solid and premium underfoot. Thin laminate (7–8mm) feels cheap; ours doesn't.</li>
<li><strong>AC4/AC5 durability</strong> — rated for heavy residential and light commercial traffic.</li>
<li><strong>Water-resistant</strong> — handles splashes and quick cleanups. Not recommended for bathrooms or basements with moisture risk.</li>
<li><strong>Realistic wood looks</strong> — modern laminate printing is incredibly convincing.</li>
</ul>
<p>Best for: bedrooms, living rooms, offices, hallways, and any dry area where you want hardwood looks on a tight budget. <a href="/Laminate">Browse laminate styles →</a></p>`
    },
    {
      heading: 'Solid Hardwood — The Premium Choice',
      body: `<p><strong>Starting from $5.69/sqft (¾" solid Oak)</strong></p>
<p>Solid hardwood is the gold standard — a floor that can literally outlast your house:</p>
<ul>
<li><strong>¾" solid wood throughout</strong> — no layers, no core material. Pure hardwood.</li>
<li><strong>Refinish 5+ times</strong> — sand it down and change the color in 20 years. Solid hardwood gets better with age.</li>
<li><strong>Highest resale value</strong> — real estate agents consistently rank hardwood floors as the #1 upgrade buyers look for.</li>
<li><strong>Species options</strong> — Oak, Maple, Birch, Hickory in multiple widths and finishes.</li>
</ul>
<p><strong>The trade-off:</strong> Solid hardwood can't go over concrete, doesn't work with radiant heat, and is sensitive to moisture. If your home has a concrete subfloor or you want it in a basement, go with engineered instead.</p>
<p><a href="/SolidHardwood">Browse solid hardwood →</a></p>`
    },
    {
      heading: 'Room-by-Room Recommendations',
      body: `<table class="w-full border-collapse my-4">
<thead><tr class="bg-slate-100"><th class="text-left p-3 border">Room</th><th class="text-left p-3 border">Best Choice</th><th class="text-left p-3 border">Why</th></tr></thead>
<tbody>
<tr><td class="p-3 border">Living Room / Dining Room</td><td class="p-3 border font-semibold">Engineered Hardwood</td><td class="p-3 border">Beauty + durability + resale value</td></tr>
<tr><td class="p-3 border">Bedrooms</td><td class="p-3 border font-semibold">Laminate or Engineered</td><td class="p-3 border">Laminate saves budget; engineered adds value</td></tr>
<tr><td class="p-3 border">Kitchen</td><td class="p-3 border font-semibold">Vinyl (SPC)</td><td class="p-3 border">100% waterproof, handles spills and drops</td></tr>
<tr><td class="p-3 border">Bathroom</td><td class="p-3 border font-semibold">Vinyl (SPC)</td><td class="p-3 border">Only waterproof option — no hardwood or laminate</td></tr>
<tr><td class="p-3 border">Basement</td><td class="p-3 border font-semibold">Vinyl (SPC)</td><td class="p-3 border">Waterproof + goes over concrete + handles temp swings</td></tr>
<tr><td class="p-3 border">Rental Property</td><td class="p-3 border font-semibold">Vinyl (SPC)</td><td class="p-3 border">Durable, waterproof, cheap to replace if damaged</td></tr>
<tr><td class="p-3 border">Home Office</td><td class="p-3 border font-semibold">Laminate</td><td class="p-3 border">Budget-friendly, handles rolling chairs</td></tr>
<tr><td class="p-3 border">Stairs</td><td class="p-3 border font-semibold">Engineered or Solid Hardwood</td><td class="p-3 border">Best look + our stair crew specializes in this</td></tr>
<tr><td class="p-3 border">Condo</td><td class="p-3 border font-semibold">Engineered Hardwood</td><td class="p-3 border">Floats over concrete, meets condo sound ratings</td></tr>
<tr><td class="p-3 border">Whole House (budget)</td><td class="p-3 border font-semibold">Vinyl main + Laminate bedrooms</td><td class="p-3 border">~$3.49–$3.79/sqft all-in</td></tr>
<tr><td class="p-3 border">Whole House (premium)</td><td class="p-3 border font-semibold">Engineered Hardwood + Vinyl wet areas</td><td class="p-3 border">~$5.24–$7.50/sqft all-in</td></tr>
</tbody>
</table>
<p>Not sure what you need? <strong>Book a free in-home measurement</strong> — we'll see your rooms, check your subfloor, and recommend the right product for each area. <a href="/FreeMeasurement">Book now →</a></p>`
    },
    {
      heading: 'What About Stairs?',
      body: `<p>Stairs are a completely different installation process than floors. We have a dedicated stair renovation crew that handles:</p>
<ul>
<li><strong>Stair refinishing</strong> (existing hardwood stairs): <strong>$125/step</strong></li>
<li><strong>New straight hardwood steps:</strong> <strong>$185/step</strong></li>
<li><strong>New pie/bullnose/triangle steps:</strong> <strong>$225/step</strong></li>
<li><strong>Railing sand & restain:</strong> <strong>$25/ft</strong></li>
<li><strong>New iron or wood pickets:</strong> <strong>$25/piece</strong> (installed with material)</li>
<li><strong>New nosing:</strong> <strong>$30/ft</strong></li>
</ul>
<p>A typical 13-step straight staircase renovation runs approximately <strong>$2,225</strong>. Vinyl stair caps are also available for a more budget-friendly option.</p>
<p><a href="/Stairs">See our stair renovation work →</a></p>`
    },
  ],
  faqItems: [
    { question: 'What\'s the cheapest flooring I can get installed in the GTA?', answer: 'Laminate flooring at $1.49/sqft material + $2.00/sqft installation = $3.49/sqft all-in. For a 500 sqft room, that\'s approximately $1,745 total including old floor removal and free furniture moving. Call (647) 428-1111 for an exact quote.' },
    { question: 'Is vinyl flooring better than laminate?', answer: 'It depends on the room. Vinyl (LVP/SPC) is 100% waterproof — essential for basements, kitchens, and bathrooms. Laminate is slightly cheaper ($1.49 vs $1.79/sqft starting) and works great in dry rooms like bedrooms and offices. Both are durable and look like real wood. Visit our showroom to compare them side by side.' },
    { question: 'Is engineered hardwood worth it over vinyl?', answer: 'Yes if you value resale value and natural beauty. Engineered hardwood (from $2.99/sqft) is real wood that adds significant home value and can be refinished. Vinyl ($1.79/sqft) is more practical for moisture-prone areas. Many customers use engineered hardwood on main floors and vinyl in the basement and kitchen — best of both worlds.' },
    { question: 'What\'s the best flooring for a basement in Ontario?', answer: 'SPC vinyl plank (from $1.79/sqft). It\'s 100% waterproof, installs directly over concrete, handles temperature fluctuations, and won\'t grow mold. Never install solid hardwood or regular laminate in a basement. We carry 100+ waterproof vinyl styles — come see them at our Markham showroom or call (647) 428-1111.' },
    { question: 'How much does it cost to floor a 1,000 sqft house?', answer: 'With BBS Flooring: Laminate ~$3,490 all-in. Vinyl ~$3,790. Engineered hardwood ~$5,240. Solid hardwood ~$7,940. All prices include professional installation, old floor removal, and furniture moving. Get your exact quote: (647) 428-1111.' },
    { question: 'Can I mix different flooring types in one house?', answer: 'Absolutely — and we recommend it. Most of our whole-house projects use engineered hardwood in the main living areas and vinyl in the kitchen, bathrooms, and basement. We handle the transitions between materials seamlessly. This gives you the best look where it matters and the best protection where you need it.' },
    { question: 'Do you price match other flooring stores?', answer: 'Our prices are already contractor-direct — we\'re the source, not a middleman. If you find the exact same product cheaper elsewhere in the GTA, bring the quote and we\'ll talk. But most customers find we\'re already the lowest once they compare apples to apples.' },
    { question: 'How do I get a quote from BBS Flooring?', answer: 'Three ways: (1) Use our instant online Quote Calculator at shop.bbsflooring.ca/QuoteCalculator, (2) Book a free in-home measurement at shop.bbsflooring.ca/FreeMeasurement, or (3) Call us at (647) 428-1111. We\'ll give you a detailed, no-obligation quote.' },
  ],
  ctaText: 'Get Your Free Quote',
};
