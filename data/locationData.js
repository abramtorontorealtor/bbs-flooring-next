export const locationData = {
  markham: {
    city: "Markham",
    isFlagship: true,
    title: "Flooring Store in Markham | Showroom, Installation & Prices | BBS Flooring",
    description: "BBS Flooring — Markham's local flooring store since 2010. 700+ hardwood, vinyl & laminate options from $1.49/sqft. Visit our Highway 7 showroom. Free estimates. (647) 428-1111.",
    content: "BBS Flooring is Markham's premier flooring specialist, located right on Highway 7 at Unit B, 6061. Since 2010, we've served thousands of Markham homeowners — from heritage homes in Unionville and family properties in Cornell to modern condos in Downtown Markham and executive homes in Cachet. Markham's diverse housing stock means we install everything from waterproof luxury vinyl plank in finished basements to wide-plank engineered hardwood in open-concept main floors. As your local showroom, we carry over 700 floors in stock and offer same-week installation for most products. Whether you're in Markham Village, Berczy, Wismer, or Cathedraltown, our installers know the area and deliver precision craftsmanship every time.",
    landmarks: ["Unionville", "Downtown Markham", "Markville Mall", "Cornell", "Cachet", "Cathedraltown"],
    services: [
      { name: "Hardwood Installation", slug: "/installation", icon: "Hammer" },
      { name: "Vinyl & LVP Installation", slug: "/installation", icon: "Layers" },
      { name: "Stair Refinishing", slug: "/stair-refinishing", icon: "Footprints" },
      { name: "Carpet Removal", slug: "/carpet-removal", icon: "Trash2" },
      { name: "Hardwood Refinishing", slug: "/hardwood-refinishing", icon: "Paintbrush" },
      { name: "Basement Flooring", slug: "/basement-flooring", icon: "Home" },
    ],
    // ── Neighbourhood breakdown (Markham flagship only) ──
    neighbourhoods: [
      {
        name: "Unionville",
        slug: "unionville",
        description: "Unionville's charming heritage homes along Main Street and surrounding residential streets feature original hardwood floors from the early 1900s alongside modern open-concept renovations. Our most popular service here is dustless hardwood refinishing — restoring 80- to 100-year-old oak and maple floors to their original lustre. For newer Unionville properties and additions, wide-plank engineered hardwood in white oak is the top choice, complementing both traditional and transitional interiors.",
        housingTypes: "Heritage homes, Victorian-era semis, modern detached, luxury custom builds",
        topProducts: "Solid hardwood refinishing, wide-plank engineered oak, luxury vinyl plank for basements"
      },
      {
        name: "Cornell",
        slug: "cornell",
        description: "Cornell is one of Markham's fastest-growing communities, with thousands of new-build townhomes and detached houses going up over the last decade. These modern homes typically feature open-concept main floors with 9-foot ceilings — perfect for wide-plank engineered hardwood that creates a seamless, spacious feel. Builder-grade laminate upgrades are extremely common here, with homeowners swapping the stock flooring for premium vinyl plank or engineered hardwood within the first few years of ownership.",
        housingTypes: "New-build townhomes, detached homes (2015+), stacked townhomes",
        topProducts: "Engineered hardwood (builder-grade upgrade), waterproof LVP for basements, laminate for bedrooms"
      },
      {
        name: "Cachet",
        slug: "cachet",
        description: "Cachet is Markham's premier luxury neighbourhood, home to executive properties on large lots with grand foyers, sweeping staircases, and formal living spaces. Homeowners here demand the finest materials — hand-scraped solid hardwood, custom stair refinishing with intricate baluster work, and premium wide-plank European oak engineered flooring. BBS has completed dozens of full-home installations in Cachet, often replacing entire main floors and staircases in a single project.",
        housingTypes: "Luxury detached estates (4,000-8,000+ sqft), custom-built executive homes",
        topProducts: "Premium engineered hardwood (Vidar, Wickham), grand staircase refinishing, solid hardwood"
      },
      {
        name: "Cathedraltown",
        slug: "cathedraltown",
        description: "Named after the stunning Cathedral of the Transfiguration, Cathedraltown features mid-to-large detached homes built primarily in the 2000s. These well-maintained family properties are now reaching the age where original flooring needs refreshing — making Cathedraltown one of our busiest areas for carpet-to-hardwood conversions and main-floor upgrades. Engineered hardwood and luxury vinyl plank are the go-to choices here.",
        housingTypes: "Detached family homes (2000s era), some semi-detached",
        topProducts: "Engineered hardwood, carpet removal + replacement, LVP for basements and playrooms"
      },
      {
        name: "Markham Village",
        slug: "markham-village",
        description: "Markham Village along Main Street Markham blends historic charm with modern living. Older homes near Robinson Street and the heritage core often have original hardwood that we refinish and restore, while newer infill homes call for contemporary wide-plank flooring. This neighbourhood's walkable, community feel means many homeowners invest in high-quality materials that last — solid hardwood refinishing and premium engineered hardwood are our top sellers here.",
        housingTypes: "Century homes, post-war bungalows, modern infill, townhomes",
        topProducts: "Hardwood refinishing, solid hardwood, engineered hardwood, stair recapping"
      },
      {
        name: "Berczy",
        slug: "berczy",
        description: "The Berczy community in north Markham is a well-established family neighbourhood with spacious detached homes built through the 1990s and 2000s. Many Berczy homeowners are now doing full-home flooring upgrades — replacing worn carpet with engineered hardwood on the main floor and luxury vinyl plank in the finished basement. Berczy's two-storey homes also drive strong demand for our stair refinishing service.",
        housingTypes: "Detached homes (1990s-2000s), some semis and townhomes",
        topProducts: "Engineered hardwood, LVP for basements, stair refinishing, carpet removal"
      },
      {
        name: "Wismer",
        slug: "wismer",
        description: "Wismer is a family-oriented community in east Markham featuring a mix of detached homes, semis, and townhomes. The neighbourhood is home to many young families, making scratch-resistant and waterproof flooring a top priority. Luxury vinyl plank is the bestseller in Wismer — it handles kids, pets, and spills while looking like real hardwood. For homeowners wanting an upgrade, our mid-range engineered hardwood collections offer the perfect balance of quality and value.",
        housingTypes: "Detached homes, semi-detached, freehold townhomes",
        topProducts: "Waterproof LVP, mid-range engineered hardwood, laminate for bedrooms"
      },
      {
        name: "Downtown Markham",
        slug: "downtown-markham",
        description: "Downtown Markham (Markham Centre) is the city's newest urban hub, featuring modern condos, stacked townhomes, and mixed-use developments around the Unionville GO Station. Condo and townhome owners here need flooring that meets building sound-rating requirements — our SPC vinyl plank and engineered hardwood with cork-backed underlayment are specifically selected for multi-unit compliance. We handle condo board paperwork, elevator bookings, and after-hours installation to minimize disruption.",
        housingTypes: "High-rise condos, stacked townhomes, mid-rise mixed-use",
        topProducts: "SPC vinyl plank (sound-rated), engineered hardwood with cork underlayment, condo-grade laminate"
      },
      {
        name: "Greensborough",
        slug: "greensborough",
        description: "Greensborough in north Markham is a newer community with family-friendly subdivisions featuring modern open-concept homes. These properties have large main floors and finished basements, making them ideal for our most popular flooring combination: engineered hardwood upstairs, waterproof LVP downstairs. Greensborough's proximity to parks and green spaces means homeowners prioritize durable, easy-to-clean flooring that handles an active lifestyle.",
        housingTypes: "New detached homes, freehold townhomes, semi-detached",
        topProducts: "Engineered hardwood + LVP combo, waterproof SPC, laminate"
      },
      {
        name: "Milliken",
        slug: "milliken",
        description: "Milliken in south Markham is one of the GTA's most diverse and established neighbourhoods, featuring a mix of semi-detached homes, bungalows, and older detached properties. Many homes here were built in the 1970s-1990s and are prime candidates for flooring upgrades — replacing worn carpet, dated linoleum, or scratched parquet with modern vinyl plank or engineered hardwood. BBS Flooring is just a 5-minute drive from Milliken, making us the most convenient showroom for the neighbourhood.",
        housingTypes: "Semi-detached, bungalows, detached homes (1970s-1990s), some townhomes",
        topProducts: "LVP (replacing carpet/linoleum), affordable engineered hardwood, laminate, stair refinishing"
      }
    ],
    // ── Commercial flooring section ──
    commercial: {
      title: "Commercial Flooring on Markham's Highway 7 Corridor",
      content: "BBS Flooring supplies and installs commercial-grade flooring for Markham's thriving business community along the Highway 7 corridor, Enterprise Boulevard, and Markham's growing tech and professional office parks. We work with property managers, dental and medical clinics, retail stores, restaurants, and office fit-outs — providing durable, high-traffic flooring solutions that meet commercial building codes. Our commercial luxury vinyl tile (LVT) and click-lock SPC products are rated for heavy foot traffic, resist scratches from rolling office chairs, and maintain their appearance for years. We offer after-hours installation to minimize business disruption, and provide contractor-friendly bulk pricing for multi-unit commercial projects.",
      sectors: [
        { name: "Offices & Tech", description: "Durable LVT and carpet tile for Markham's tech corridor" },
        { name: "Medical & Dental", description: "Hygienic, waterproof SPC for clinics and healthcare" },
        { name: "Retail & Restaurants", description: "High-traffic commercial vinyl and laminate" },
        { name: "Property Management", description: "Bulk pricing for multi-unit turnover flooring" }
      ]
    },
    // ── BBS vs Big Box comparison ──
    whyBBS: {
      title: "Why Markham Homeowners Choose BBS Over Big Box Stores",
      points: [
        {
          heading: "See & Feel 700+ Options In Person",
          detail: "Big box stores carry 30-50 flooring SKUs per location. BBS Flooring stocks over 700 products from 15+ premium brands — all available to see, touch, and compare in our Highway 7 showroom. No guessing from a tiny sample chip."
        },
        {
          heading: "Wholesale Pricing, Retail Service",
          detail: "We buy directly from manufacturers and pass the savings to you. Our engineered hardwood starts at $3.69/sqft — often 20-40% below what you'd pay at Home Depot or Lowe's for comparable quality. No membership fees, no hidden costs."
        },
        {
          heading: "Our Own Installation Crews (Not Subcontractors)",
          detail: "Big box stores send whoever is available — you don't know who's showing up. BBS Flooring uses our own trained installation crews who work exclusively with us. Same quality on every job. Full accountability."
        },
        {
          heading: "Expert Advice from Flooring Specialists",
          detail: "Need help choosing between 12mm and 14mm engineered hardwood? Wondering if your concrete subfloor needs a moisture barrier? Our team has installed flooring in thousands of Markham homes — we know what works and what doesn't."
        },
        {
          heading: "Markham-Based Since 2010",
          detail: "We're not a franchise or a chain. BBS Flooring is an independent, family-run business right here on Highway 7 in Markham. Our reputation is built on 15 years of serving our neighbours — backed by 41+ five-star Google reviews."
        }
      ]
    },
    // ── Pricing comparison table ──
    pricingComparison: {
      title: "Markham Flooring Prices: BBS vs Competitors",
      subtitle: "Transparent pricing — no surprises. All prices are per square foot, materials only.",
      rows: [
        { type: "Luxury Vinyl Plank (LVP)", bbs: "From $1.49", bigBox: "$2.99 – $5.99", specialty: "$3.49 – $6.99" },
        { type: "Laminate Flooring", bbs: "From $1.49", bigBox: "$1.99 – $4.49", specialty: "$2.49 – $5.99" },
        { type: "Engineered Hardwood", bbs: "From $3.69", bigBox: "$5.99 – $9.99", specialty: "$6.99 – $12.99" },
        { type: "Solid Hardwood", bbs: "From $4.29", bigBox: "$6.99 – $11.99", specialty: "$8.99 – $14.99" },
        { type: "SPC/Rigid Core Vinyl", bbs: "From $2.29", bigBox: "$3.99 – $6.99", specialty: "$4.49 – $7.99" },
        { type: "Waterproof Laminate", bbs: "From $1.99", bigBox: "$3.49 – $5.99", specialty: "$3.99 – $6.99" }
      ]
    },
    // ── Extended FAQs ──
    faqs: [
      { q: "How much does flooring installation cost in Markham?", a: "At BBS Flooring, vinyl plank starts from $1.49/sqft and engineered hardwood from $3.69/sqft, with professional installation available at competitive rates. Visit our Markham showroom at 6061 Highway 7 for a free in-person quote tailored to your project." },
      { q: "Can I visit the BBS Flooring showroom in Markham?", a: "Yes — our showroom at 6061 Highway 7, Unit B is open Monday to Saturday, 10am–5pm, and Sundays by appointment. We carry over 700 flooring options in stock so you can see and feel samples before buying. Call (647) 428-1111 to book a consultation." },
      { q: "What's the best flooring for Markham basements?", a: "Waterproof luxury vinyl plank (LVP) is the top choice for Markham basements — it handles moisture, looks like real hardwood, and starts from $1.49/sqft at BBS Flooring. We also carry rigid-core SPC flooring with built-in underlayment for even easier installation." },
      { q: "Do you offer free in-home estimates in Markham?", a: "Absolutely. BBS Flooring provides free in-home measurements and estimates throughout Markham. Our team will assess your space, recommend the best flooring for your home, and provide a detailed quote — no obligation. Call (647) 428-1111 to schedule." },
      { q: "What flooring is best for Markham homes with pets?", a: "For pet-friendly flooring in Markham, we recommend waterproof luxury vinyl plank (LVP) or scratch-resistant laminate. Both handle paw traffic, resist scratches, and are easy to clean. LVP starts from $1.49/sqft at BBS Flooring — visit our Highway 7 showroom to see samples." },
      { q: "How long does a full-home flooring installation take in Markham?", a: "A typical Markham home (1,500-2,500 sqft) takes 3-5 days for professional installation, including subfloor preparation, installation, and trim work. BBS Flooring coordinates the entire process from material delivery to final cleanup. Call (647) 428-1111 to schedule." },
      { q: "Do you install flooring in Markham condos and townhomes?", a: "Yes — BBS Flooring regularly installs in Markham condos, especially in Downtown Markham and Unionville. We carry sound-rated underlayment and SPC vinyl plank that meets condo board requirements. We handle insurance certificates and elevator bookings. Call (647) 428-1111." },
      { q: "Can you match my existing hardwood floors in Markham?", a: "In most cases, yes. Our installers can match species, width, and stain colour to extend your existing hardwood into additional rooms. For older Markham homes with discontinued species, we offer refinishing services to create a uniform look across your entire home." },
      { q: "What brands of flooring does BBS carry for Markham customers?", a: "BBS Flooring stocks 15+ premium brands including Vidar, NAF, Wickham, Appalachian, Triforest, Woden, Simba, Canadian Standard, Lee, and more — over 700 products total. Visit our Markham showroom at 6061 Highway 7 to browse the full selection in person." },
      { q: "Is BBS Flooring the cheapest flooring store in Markham?", a: "BBS Flooring offers wholesale-direct pricing that's typically 20-40% below big box stores like Home Depot and Lowe's. Our vinyl plank starts at $1.49/sqft and engineered hardwood at $3.69/sqft. We buy directly from manufacturers and pass the savings to Markham homeowners — no membership fees, no hidden markups." }
    ],
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2878.871587606354!2d-79.25622102326802!3d43.85905624535496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d7647895e557%3A0x8956973e89c67623!2sBBS%20Flooring!5e0!3m2!1sen!2sca!4v1708795000000!5m2!1sen!2sca" width="100%" height="100%" style="border:0;" allowFullScreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
  },
  toronto: {
    city: "Toronto",
    title: "Flooring Installation Toronto | Hardwood & Vinyl Experts",
    description: "BBS Flooring serves all of Toronto — hardwood, vinyl & laminate installation from $1.49/sqft. 4.7★ Google. Free estimates. Call (647) 428-1111.",
    content: "BBS Flooring serves homeowners across the entire City of Toronto — from Victorian semis in the Annex and Leslieville to modern condos in North York and family homes in Etobicoke. Toronto's incredible housing diversity demands flooring expertise across every type: engineered hardwood for condo builds with sound-dampening requirements, luxury vinyl plank for high-traffic family homes, and solid hardwood refinishing for century-old Cabbagetown and Riverdale properties. Our Markham showroom is a quick 25-minute drive from Midtown via the DVP, and our installation crews work in Toronto daily. We understand Toronto building requirements, condo board regulations, and the unique challenges of older homes with uneven subfloors.",
    landmarks: ["North York", "Etobicoke", "East York", "Scarborough", "Midtown", "Downtown"],
    services: [
      { name: "Hardwood Installation", slug: "/installation", icon: "Hammer" },
      { name: "Vinyl & LVP Installation", slug: "/installation", icon: "Layers" },
      { name: "Stair Refinishing", slug: "/stair-refinishing", icon: "Footprints" },
      { name: "Carpet Removal", slug: "/carpet-removal", icon: "Trash2" },
      { name: "Hardwood Refinishing", slug: "/hardwood-refinishing", icon: "Paintbrush" },
      { name: "Basement Flooring", slug: "/basement-flooring", icon: "Home" },
    ],
    faqs: [
      { q: "Do you install flooring in downtown Toronto condos?", a: "Yes — BBS Flooring regularly installs in Toronto condos across the city. We're experienced with condo board requirements including insurance certificates, freight elevator bookings, and noise-rated underlayment. Call (647) 428-1111 to discuss your condo project." },
      { q: "What's the best flooring for older Toronto homes?", a: "For Toronto's older homes with character, engineered hardwood is often ideal — it handles the slight subfloor unevenness common in century homes better than solid hardwood, and it's available in classic oak and maple species from $3.69/sqft at BBS Flooring." },
      { q: "How far is the BBS Flooring showroom from Toronto?", a: "Our showroom at 6061 Highway 7 in Markham is about 25 minutes from Midtown Toronto via the DVP, and 15 minutes from Scarborough. We also offer free in-home estimates across all of Toronto — call (647) 428-1111 to book." },
      { q: "Do you offer flooring installation in North York and Etobicoke?", a: "Absolutely. BBS Flooring serves every part of Toronto including North York, Etobicoke, East York, and the downtown core. Our installers are in Toronto daily and can typically schedule within a week. Call (647) 428-1111 for a free estimate." },
    ],
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d184552.6739!2d-79.5428!3d43.7182!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4cb90d7c63ba5%3A0x323555502ab4c477!2sToronto%2C%20ON!5e0!3m2!1sen!2sca!4v1710533100000!5m2!1sen!2sca" width="100%" height="100%" style="border:0;" allowFullScreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
  },
  stouffville: {
    city: "Stouffville",
    title: "Flooring Installation Stouffville | Hardwood & Vinyl From $1.49/sqft",
    description: "BBS Flooring serves Stouffville — hardwood, vinyl & laminate from $1.49/sqft. 15 min from our showroom. Free estimates. Call (647) 428-1111.",
    content: "Transform your Stouffville home with premium flooring from BBS Flooring, just a 15-minute drive from our Highway 7 showroom. Stouffville's spacious family homes — from established properties along Main Street to newer builds in the Bloom and Heritage Hills communities — are perfect for wide-plank engineered hardwood and luxury vinyl plank. Ballantrae's estate homes call for solid hardwood and grand staircase refinishing, while Musselman's Lake cottages benefit from waterproof LVP that handles seasonal moisture. Our installers are in Whitchurch-Stouffville weekly, and we understand the open-concept layouts and large basements common in this area. Whether you're upgrading a heritage property or finishing a brand-new build, BBS delivers showroom-quality results.",
    landmarks: ["Main Street Stouffville", "Ballantrae", "Musselman's Lake", "Heritage Hills", "Bloom"],
    services: [
      { name: "Hardwood Installation", slug: "/installation", icon: "Hammer" },
      { name: "Vinyl & LVP Installation", slug: "/installation", icon: "Layers" },
      { name: "Stair Refinishing", slug: "/stair-refinishing", icon: "Footprints" },
      { name: "Carpet Removal", slug: "/carpet-removal", icon: "Trash2" },
      { name: "Hardwood Refinishing", slug: "/hardwood-refinishing", icon: "Paintbrush" },
      { name: "Basement Flooring", slug: "/basement-flooring", icon: "Home" },
    ],
    faqs: [
      { q: "How much does hardwood flooring cost in Stouffville?", a: "At BBS Flooring, engineered hardwood starts from $3.69/sqft and solid hardwood from $4.29/sqft — both popular choices for Stouffville's spacious homes. We offer free in-home estimates throughout Stouffville. Call (647) 428-1111 to get a quote for your project." },
      { q: "What's the best flooring for new builds in Stouffville?", a: "Engineered hardwood is the top choice for Stouffville's newer builds — it's dimensionally stable over concrete subfloors and looks stunning in open-concept layouts. BBS Flooring carries premium brands like Vidar, NAF, and Wickham starting from $3.69/sqft." },
      { q: "Do you serve Ballantrae and Musselman's Lake?", a: "Yes — BBS Flooring serves all of Whitchurch-Stouffville including Ballantrae, Musselman's Lake, and the surrounding rural areas. Our showroom is just 15 minutes south on Highway 48. Call (647) 428-1111 for a free estimate." },
      { q: "How long does flooring installation take in Stouffville?", a: "Most rooms take 1-2 days for professional installation. A typical Stouffville home (1,500-2,000 sqft) can be completed in 3-5 days. BBS Flooring coordinates everything from subfloor prep to final trim — call (647) 428-1111 to schedule." },
    ],
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d46061.76344583649!2d-79.29427014605174!3d43.96969561085292!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d52ca702672b1d%3A0xe549520775d71837!2sWhitchurch-Stouffville%2C%20ON!5e0!3m2!1sen!2sca!4v1708795100000!5m2!1sen!2sca" width="100%" height="100%" style="border:0;" allowFullScreen="" loading="lazy"></iframe>'
  },
  "richmond-hill": {
    city: "Richmond Hill",
    title: "Flooring Installation Richmond Hill | Hardwood & Vinyl From $3.69/sqft",
    description: "BBS Flooring serves Richmond Hill — engineered hardwood from $3.69/sqft, vinyl from $1.49/sqft. 10 min drive. Free estimates. Call (647) 428-1111.",
    content: "BBS Flooring is Richmond Hill's trusted flooring partner, located just 10 minutes east on Highway 7. From executive homes in Oak Ridges and South Richvale to family properties near Hillcrest Mall and newer developments around Elgin Mills, we deliver premium flooring solutions tailored to Richmond Hill's upscale housing market. Engineered hardwood is our most popular product here — Richmond Hill homeowners love the wide-plank European oak look from brands like Vidar and Wickham. We also specialize in dustless staircase refinishing and custom hardwood installation that adds lasting value to your property. Lake Wilcox area homes with walkout basements are ideal candidates for our waterproof LVP options.",
    landmarks: ["Oak Ridges", "Hillcrest Mall", "Lake Wilcox", "South Richvale", "Elgin Mills"],
    services: [
      { name: "Hardwood Installation", slug: "/installation", icon: "Hammer" },
      { name: "Vinyl & LVP Installation", slug: "/installation", icon: "Layers" },
      { name: "Stair Refinishing", slug: "/stair-refinishing", icon: "Footprints" },
      { name: "Carpet Removal", slug: "/carpet-removal", icon: "Trash2" },
      { name: "Hardwood Refinishing", slug: "/hardwood-refinishing", icon: "Paintbrush" },
      { name: "Basement Flooring", slug: "/basement-flooring", icon: "Home" },
    ],
    faqs: [
      { q: "What's the most popular flooring in Richmond Hill?", a: "Engineered hardwood is by far the most popular choice in Richmond Hill — especially wide-plank European oak in natural or matte finishes. BBS Flooring carries top brands like Vidar, NAF, and Wickham from $3.69/sqft. Visit our showroom just 10 minutes away on Highway 7." },
      { q: "Do you offer stair refinishing in Richmond Hill?", a: "Yes — stair refinishing and recapping is one of our most requested services in Richmond Hill. We can match your new or existing hardwood floors with a dustless refinishing process. Call BBS Flooring at (647) 428-1111 for a free staircase estimate." },
      { q: "How far is BBS Flooring from Richmond Hill?", a: "Our showroom at 6061 Highway 7, Unit B in Markham is just a 10-minute drive east from Richmond Hill along Highway 7. We carry over 700 flooring options in stock — visit us Monday to Saturday, 10am–5pm, or call (647) 428-1111." },
      { q: "Can you install flooring in Oak Ridges and South Richvale?", a: "Absolutely. BBS Flooring serves all of Richmond Hill including Oak Ridges, South Richvale, Jefferson, and the Elgin Mills corridor. We offer free in-home measurements and estimates — call (647) 428-1111 to schedule." },
    ],
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d92193.30396071746!2d-79.51622340277873!3d43.89679627725916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b2a60dfc220b3%3A0x77d12d4d38563a66!2sRichmond%20Hill%2C%20ON!5e0!3m2!1sen!2sca!4v1708795200000!5m2!1sen!2sca" width="100%" height="100%" style="border:0;" allowFullScreen="" loading="lazy"></iframe>'
  },
  pickering: {
    city: "Pickering",
    title: "Flooring Installation Pickering | Hardwood & Vinyl From $1.49/sqft",
    description: "BBS Flooring serves Pickering & Durham — vinyl from $1.49/sqft, hardwood from $3.69/sqft. Free estimates. Call (647) 428-1111.",
    content: "BBS Flooring proudly serves Pickering and the western Durham Region, just a 20-minute drive from our Markham showroom via Highway 401. Pickering's diverse housing — from waterfront properties near the Nautilus and Frenchman's Bay to family homes in Amberlea and Liverpool — demands versatile flooring solutions. Waterproof luxury vinyl plank is extremely popular here, especially for lakeside homes and finished basements prone to humidity. We also install engineered hardwood and laminate across Pickering's newer subdivisions in Seaton and Duffin Heights. Our installation crews are in Durham Region weekly, and we coordinate everything from delivery to final trim.",
    landmarks: ["Pickering Town Centre", "Nautilus", "Rouge Park", "Amberlea", "Frenchman's Bay"],
    services: [
      { name: "Hardwood Installation", slug: "/installation", icon: "Hammer" },
      { name: "Vinyl & LVP Installation", slug: "/installation", icon: "Layers" },
      { name: "Stair Refinishing", slug: "/stair-refinishing", icon: "Footprints" },
      { name: "Carpet Removal", slug: "/carpet-removal", icon: "Trash2" },
      { name: "Hardwood Refinishing", slug: "/hardwood-refinishing", icon: "Paintbrush" },
      { name: "Basement Flooring", slug: "/basement-flooring", icon: "Home" },
    ],
    faqs: [
      { q: "What's the best waterproof flooring for Pickering homes?", a: "Luxury vinyl plank (LVP) and rigid-core SPC flooring are the best waterproof options for Pickering — especially for basements and lakeside properties near Frenchman's Bay. BBS Flooring carries premium waterproof options starting from $1.49/sqft. Call (647) 428-1111 for a free estimate." },
      { q: "Do you deliver flooring to Pickering?", a: "Yes — BBS Flooring delivers to all of Pickering and Durham Region. Warehouse pickup at our Markham showroom is free, and we offer affordable delivery to your door. Call (647) 428-1111 to arrange delivery with your order." },
      { q: "How much does vinyl flooring cost in Pickering?", a: "At BBS Flooring, luxury vinyl plank starts from $1.49/sqft — significantly less than big-box stores. We carry over 200 vinyl flooring options. Visit our Markham showroom (20 minutes via Hwy 401) or call (647) 428-1111 for a free quote." },
      { q: "Do you serve Seaton and Duffin Heights in Pickering?", a: "Absolutely. BBS Flooring serves all Pickering neighbourhoods including Seaton, Duffin Heights, Amberlea, Liverpool, Bay Ridges, and Rouge Park. Our installers are in Durham Region weekly. Call (647) 428-1111 to schedule." },
    ],
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d92376.51658428178!2d-79.16853606626604!3d43.85489815037146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4de1937318041%3A0x5037b28c7231c60!2sPickering%2C%20ON!5e0!3m2!1sen!2sca!4v1708795300000!5m2!1sen!2sca" width="100%" height="100%" style="border:0;" allowFullScreen="" loading="lazy"></iframe>'
  },
  ajax: {
    city: "Ajax",
    title: "Flooring Installation Ajax | Hardwood & Vinyl From $1.49/sqft",
    description: "BBS Flooring serves Ajax — hardwood, vinyl & laminate from $1.49/sqft. Professional installation. Free estimates. Call (647) 428-1111.",
    content: "Looking for reliable flooring installation in Ajax? BBS Flooring delivers quality craftsmanship at wholesale prices, just a 20-minute drive from our Markham showroom. Ajax's family-friendly neighbourhoods — from established areas near the Ajax Waterfront and downtown to newer developments in Salem and Richardson Point — feature the split-level homes and open-concept layouts that our installers excel at. Laminate flooring is a popular choice for Ajax families with kids and pets, offering scratch resistance and easy maintenance from just $1.49/sqft. For main floors, our engineered hardwood collections from NAF, Triforest, and Wickham deliver the upscale look Ajax homeowners want. We handle everything from subfloor leveling to the final trim.",
    landmarks: ["Ajax Waterfront", "RioCan Durham Centre", "Downtown Ajax", "Salem", "Richardson Point"],
    services: [
      { name: "Hardwood Installation", slug: "/installation", icon: "Hammer" },
      { name: "Vinyl & LVP Installation", slug: "/installation", icon: "Layers" },
      { name: "Stair Refinishing", slug: "/stair-refinishing", icon: "Footprints" },
      { name: "Carpet Removal", slug: "/carpet-removal", icon: "Trash2" },
      { name: "Hardwood Refinishing", slug: "/hardwood-refinishing", icon: "Paintbrush" },
      { name: "Basement Flooring", slug: "/basement-flooring", icon: "Home" },
    ],
    faqs: [
      { q: "What's the best flooring for Ajax homes with kids and pets?", a: "Laminate and luxury vinyl plank are the top choices for busy Ajax families — both are scratch-resistant, easy to clean, and start from just $1.49/sqft at BBS Flooring. We carry AC5-rated laminate that handles heavy foot traffic. Call (647) 428-1111 for a free estimate." },
      { q: "How much does flooring installation cost in Ajax?", a: "BBS Flooring offers competitive installation rates across Ajax. Vinyl and laminate start from $1.49/sqft for materials, and engineered hardwood from $3.69/sqft. We provide free in-home estimates with no obligation — call (647) 428-1111 to schedule." },
      { q: "Do you remove old carpet in Ajax before installing new flooring?", a: "Yes — BBS Flooring offers complete carpet removal services in Ajax as part of our flooring installation. We'll strip the old carpet, remove the underpad, and prep your subfloor before installing your new floors. Call (647) 428-1111 for a bundled quote." },
      { q: "Can you install laminate flooring in my Ajax basement?", a: "We recommend waterproof luxury vinyl plank over laminate for basements due to Ajax's moisture conditions. LVP looks identical to hardwood, handles humidity, and starts from $1.49/sqft at BBS Flooring. Call (647) 428-1111 for basement-specific recommendations." },
    ],
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d46152.08375618454!2d-79.06828945484807!3d43.84752495804362!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4dfbd8540c497%3A0x5037b28c7231b40!2sAjax%2C%20ON!5e0!3m2!1sen!2sca!4v1708795400000!5m2!1sen!2sca" width="100%" height="100%" style="border:0;" allowFullScreen="" loading="lazy"></iframe>'
  },
  whitby: {
    city: "Whitby",
    title: "Flooring Installation Whitby | Hardwood & Vinyl From $1.49/sqft",
    description: "BBS Flooring serves Whitby & Brooklin — hardwood, vinyl & laminate from $1.49/sqft. Free in-home estimates. Call (647) 428-1111.",
    content: "BBS Flooring extends our expert services to Whitby and Brooklin, approximately 25 minutes from our Markham showroom via Highway 407. Whitby's growing community features everything from charming century homes near Port Whitby to sprawling new builds in Brooklin — and each requires different flooring expertise. Scratch-resistant vinyl plank is ideal for Whitby's busy family homes, while engineered hardwood adds elegance to Brooklin's newer executive properties. We also specialize in staircase refinishing and recapping, a popular upgrade for Whitby's two-storey homes. Our Durham Region installation crews deliver the same precision and care as if you lived next door to our showroom.",
    landmarks: ["Brooklin", "Port Whitby", "Whitby Centrum", "Thickson Point", "Downtown Whitby"],
    services: [
      { name: "Hardwood Installation", slug: "/installation", icon: "Hammer" },
      { name: "Vinyl & LVP Installation", slug: "/installation", icon: "Layers" },
      { name: "Stair Refinishing", slug: "/stair-refinishing", icon: "Footprints" },
      { name: "Carpet Removal", slug: "/carpet-removal", icon: "Trash2" },
      { name: "Hardwood Refinishing", slug: "/hardwood-refinishing", icon: "Paintbrush" },
      { name: "Basement Flooring", slug: "/basement-flooring", icon: "Home" },
    ],
    faqs: [
      { q: "Do you install flooring in Brooklin, Ontario?", a: "Yes — BBS Flooring serves all of Whitby including Brooklin, Port Whitby, and surrounding areas. Brooklin's newer homes are ideal for our engineered hardwood collections starting from $3.69/sqft. Call (647) 428-1111 for a free in-home estimate." },
      { q: "What flooring brands does BBS carry for Whitby homeowners?", a: "BBS Flooring carries 15+ premium brands including Vidar, NAF, Triforest, Wickham, Appalachian, and more — over 700 flooring options in total. Visit our Markham showroom (25 min via Hwy 407) to see samples in person, or call (647) 428-1111." },
      { q: "Can you refinish hardwood stairs in Whitby?", a: "Absolutely. Stair refinishing and recapping is one of our most popular services in Whitby. We match your existing or new hardwood floors with a dustless refinishing process. Call BBS Flooring at (647) 428-1111 for a free staircase estimate." },
      { q: "How do I choose between vinyl and laminate for my Whitby home?", a: "For Whitby homes, we typically recommend vinyl plank for basements and bathrooms (it's 100% waterproof) and laminate for bedrooms and living areas (it's more affordable). Both start from $1.49/sqft at BBS Flooring. Call (647) 428-1111 for personalized advice." },
    ],
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d92330.15570887327!2d-78.99583485573434!3d43.90565860471239!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d51c4a00445f1b%3A0x280e8e4a1a5b46e0!2sWhitby%2C%20ON!5e0!3m2!1sen!2sca!4v1708795500000!5m2!1sen!2sca" width="100%" height="100%" style="border:0;" allowFullScreen="" loading="lazy"></iframe>'
  },
  vaughan: {
    city: "Vaughan",
    title: "Flooring Installation Vaughan | Hardwood & Luxury Vinyl From $3.69/sqft",
    description: "BBS Flooring serves Vaughan — engineered hardwood from $3.69/sqft, vinyl from $1.49/sqft. Free estimates. Call (647) 428-1111.",
    content: "Serving the vibrant communities of Vaughan — including Maple, Concord, Kleinburg, and Thornhill Woods — BBS Flooring brings high-end flooring options and meticulous installation standards to York Region's fastest-growing city. Vaughan's luxury housing market demands premium materials: wide-plank European oak engineered hardwood, hand-scraped solid hardwood for Kleinburg estates, and designer vinyl plank for modern Concord townhomes. Our Markham showroom is 20 minutes east via Highway 7, and our installers work in Vaughan multiple days per week. From grand staircase transformations in Maple's executive homes to full-home installations in new Vaughan Metropolitan Centre condos, BBS delivers results that match your vision.",
    landmarks: ["Vaughan Mills", "Canada's Wonderland area", "Kleinburg", "Maple", "Concord"],
    services: [
      { name: "Hardwood Installation", slug: "/installation", icon: "Hammer" },
      { name: "Vinyl & LVP Installation", slug: "/installation", icon: "Layers" },
      { name: "Stair Refinishing", slug: "/stair-refinishing", icon: "Footprints" },
      { name: "Carpet Removal", slug: "/carpet-removal", icon: "Trash2" },
      { name: "Hardwood Refinishing", slug: "/hardwood-refinishing", icon: "Paintbrush" },
      { name: "Basement Flooring", slug: "/basement-flooring", icon: "Home" },
    ],
    faqs: [
      { q: "What's the best hardwood flooring for Vaughan's luxury homes?", a: "Wide-plank engineered hardwood in European white oak is the top choice for Vaughan's upscale homes — available in matte, brushed, and wire-brushed finishes. BBS Flooring carries premium brands like Vidar and Wickham starting from $3.69/sqft. Visit our showroom or call (647) 428-1111." },
      { q: "Do you install flooring in Kleinburg and Maple?", a: "Yes — BBS Flooring serves all of Vaughan including Kleinburg, Maple, Concord, Woodbridge, and Thornhill. Our installers are in Vaughan multiple times per week. Call (647) 428-1111 for a free in-home estimate." },
      { q: "Can you do a grand staircase renovation in Vaughan?", a: "Absolutely. Grand staircase refinishing and hardwood recapping is one of our signature services — very popular in Vaughan and Maple's executive homes. We custom-match your stair treads to your main floor for a seamless look. Call (647) 428-1111 for a staircase consultation." },
      { q: "How do I choose engineered vs solid hardwood for my Vaughan home?", a: "For Vaughan homes, engineered hardwood is generally the better choice — it's more dimensionally stable over concrete subfloors and underfloor heating, which are common in newer Vaughan builds. Solid hardwood works best on wood subfloors in established homes. Call BBS Flooring at (647) 428-1111 for expert advice." },
    ],
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d92290.7516886476!2d-79.62002330889278!3d43.83733075252877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b268883243a77%3A0xdd952da9b47e0a81!2sVaughan%2C%20ON!5e0!3m2!1sen!2sca!4v1708795600000!5m2!1sen!2sca" width="100%" height="100%" style="border:0;" allowFullScreen="" loading="lazy"></iframe>'
  },
  woodbridge: {
    city: "Woodbridge",
    title: "Flooring Installation Woodbridge | Hardwood & Stairs From $3.69/sqft",
    description: "BBS Flooring serves Woodbridge — engineered hardwood from $3.69/sqft, stair refinishing, vinyl from $1.49/sqft. Call (647) 428-1111.",
    content: "Enhance your Woodbridge home with premium flooring from BBS Flooring. We understand Woodbridge homeowners' high standards — from the Mediterranean-inspired estates along Hwy 27 to elegant custom builds near Kortright Centre. Woodbridge's signature style demands quality: hand-scraped hardwood, wide-plank oak, and grand staircase renovations that make a statement. Our engineered hardwood collections from Vidar, NAF, and Appalachian are among the most popular choices for Woodbridge's executive homes. We also carry luxury vinyl plank for finished basements and family areas — a practical upgrade that doesn't sacrifice the upscale look Woodbridge is known for. Our showroom is a 20-minute drive east on Highway 7.",
    landmarks: ["Market Lane", "Hwy 7 & Weston", "Kortright Centre", "Pine Valley", "Islington & Hwy 7"],
    services: [
      { name: "Hardwood Installation", slug: "/installation", icon: "Hammer" },
      { name: "Vinyl & LVP Installation", slug: "/installation", icon: "Layers" },
      { name: "Stair Refinishing", slug: "/stair-refinishing", icon: "Footprints" },
      { name: "Carpet Removal", slug: "/carpet-removal", icon: "Trash2" },
      { name: "Hardwood Refinishing", slug: "/hardwood-refinishing", icon: "Paintbrush" },
      { name: "Basement Flooring", slug: "/basement-flooring", icon: "Home" },
    ],
    faqs: [
      { q: "What flooring matches Woodbridge's Mediterranean home style?", a: "Wide-plank engineered hardwood in warm tones — walnut, rustic oak, or hickory — complements Woodbridge's Mediterranean-inspired homes beautifully. BBS Flooring carries hand-scraped and wire-brushed options from $3.69/sqft. Visit our showroom or call (647) 428-1111." },
      { q: "Do you offer free estimates in Woodbridge?", a: "Yes — BBS Flooring provides free in-home measurements and estimates throughout Woodbridge. Our team will measure your space, recommend products suited to your home's style, and provide a detailed no-obligation quote. Call (647) 428-1111 to schedule." },
      { q: "Can you remove tile flooring in Woodbridge before installing hardwood?", a: "Absolutely. BBS Flooring offers complete tile removal and subfloor preparation as part of our installation service. We handle the heavy lifting so your new hardwood or vinyl goes down on a perfectly level surface. Call (647) 428-1111 for a quote." },
      { q: "What warranty do you offer on Woodbridge installations?", a: "BBS Flooring provides warranty coverage on all professional installations, backed by manufacturer warranties on materials. We stand behind our work in Woodbridge and across the GTA. Call (647) 428-1111 to discuss warranty details for your specific project." },
    ],
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d46175.05052981525!2d-79.6288898950567!3d43.79512316462719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b3d3600f6889d%3A0x280145c3639424c0!2sWoodbridge%2C%20Vaughan%2C%20ON!5e0!3m2!1sen!2sca!4v1708795700000!5m2!1sen!2sca" width="100%" height="100%" style="border:0;" allowFullScreen="" loading="lazy"></iframe>'
  },
  newmarket: {
    city: "Newmarket",
    title: "Flooring Installation Newmarket | Laminate & Hardwood From $1.49/sqft",
    description: "BBS Flooring serves Newmarket — laminate from $1.49/sqft, engineered hardwood from $3.69/sqft. Free estimates. Call (647) 428-1111.",
    content: "BBS Flooring is a trusted name in Newmarket for quality flooring upgrades, serving homeowners from the Upper Canada Mall area to historic Main Street South and the growing communities near Mulock Drive. Newmarket's mix of established bungalows, mature two-storey homes, and newer townhome developments means we install across every price point — affordable laminate for rental units and starter homes, luxury vinyl plank for family areas, and premium engineered hardwood for dream renovations. Our Markham showroom is 25 minutes south via Highway 404, and our installers are in Newmarket regularly. Whether you're refreshing a single room or renovating an entire house, BBS delivers showroom-quality results at wholesale prices.",
    landmarks: ["Upper Canada Mall", "Main Street South", "Magna Centre", "Mulock Drive", "Davis Drive corridor"],
    services: [
      { name: "Hardwood Installation", slug: "/installation", icon: "Hammer" },
      { name: "Vinyl & LVP Installation", slug: "/installation", icon: "Layers" },
      { name: "Stair Refinishing", slug: "/stair-refinishing", icon: "Footprints" },
      { name: "Carpet Removal", slug: "/carpet-removal", icon: "Trash2" },
      { name: "Hardwood Refinishing", slug: "/hardwood-refinishing", icon: "Paintbrush" },
      { name: "Basement Flooring", slug: "/basement-flooring", icon: "Home" },
    ],
    faqs: [
      { q: "What's the most affordable flooring option for Newmarket homes?", a: "Laminate and vinyl plank flooring both start from $1.49/sqft at BBS Flooring — far below big-box store prices. Laminate is ideal for bedrooms and living rooms, while vinyl plank works everywhere including basements. Call (647) 428-1111 for a free quote." },
      { q: "Do you install flooring in older Newmarket homes near Main Street?", a: "Yes — BBS Flooring has extensive experience with Newmarket's older homes. We handle uneven subfloors, remove old carpet, and install hardwood or vinyl to give heritage properties a modern update while respecting their character. Call (647) 428-1111." },
      { q: "How far is BBS Flooring from Newmarket?", a: "Our showroom at 6061 Highway 7 in Markham is about 25 minutes south of Newmarket via Highway 404. We carry over 700 flooring options — visit us Monday to Saturday, or call (647) 428-1111 to book a free in-home estimate in Newmarket." },
      { q: "Do you offer flooring for Newmarket townhomes and condos?", a: "Absolutely. BBS Flooring supplies and installs flooring for Newmarket townhomes and condos — including vinyl plank that meets sound-rating requirements. We can advise on condo-board-friendly options from $1.49/sqft. Call (647) 428-1111." },
    ],
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d45999.03080183057!2d-79.49724129532588!3d44.05368415779774!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882ad20d58847c23%3A0x6c6276856002f542!2sNewmarket%2C%20ON!5e0!3m2!1sen!2sca!4v1708795800000!5m2!1sen!2sca" width="100%" height="100%" style="border:0;" allowFullScreen="" loading="lazy"></iframe>'
  },
  aurora: {
    city: "Aurora",
    title: "Flooring Installation Aurora | Hardwood & Vinyl From $1.49/sqft",
    description: "BBS Flooring serves Aurora — hardwood, vinyl & laminate from $1.49/sqft. Professional installation. Free estimates. Call (647) 428-1111.",
    content: "We bring the showroom to you in Aurora with our free in-home measurement service. BBS Flooring serves Aurora homeowners from established properties in Aurora Village and St. Andrew's Valley to executive homes near Bayview Wellington and newer builds along Leslie Street. Aurora's mature, tree-lined neighbourhoods are home to some of York Region's most beautiful properties — and our premium engineered hardwood and solid hardwood collections complement them perfectly. We specialize in seamless room-to-room transitions, custom stair refinishing, and hardwood refinishing that breathes new life into existing floors. Our Markham showroom is just 20 minutes south via Highway 404, with over 700 flooring options to browse in person.",
    landmarks: ["Aurora Village", "St. Andrew's Valley", "Bayview Wellington", "Town Park", "Henderson Drive"],
    services: [
      { name: "Hardwood Installation", slug: "/installation", icon: "Hammer" },
      { name: "Vinyl & LVP Installation", slug: "/installation", icon: "Layers" },
      { name: "Stair Refinishing", slug: "/stair-refinishing", icon: "Footprints" },
      { name: "Carpet Removal", slug: "/carpet-removal", icon: "Trash2" },
      { name: "Hardwood Refinishing", slug: "/hardwood-refinishing", icon: "Paintbrush" },
      { name: "Basement Flooring", slug: "/basement-flooring", icon: "Home" },
    ],
    faqs: [
      { q: "Can you refinish existing hardwood floors in Aurora?", a: "Yes — BBS Flooring offers professional hardwood refinishing in Aurora using a dustless sanding process. We can restore your existing oak, maple, or birch floors to like-new condition, or apply a new stain colour to update the look. Call (647) 428-1111 for a free assessment." },
      { q: "What's the best flooring for Aurora's climate?", a: "Engineered hardwood is ideal for Aurora's seasonal temperature swings — it's more dimensionally stable than solid hardwood, handling Ontario's humid summers and dry winters without gapping or cupping. BBS Flooring carries top brands from $3.69/sqft. Call (647) 428-1111." },
      { q: "Do you offer free in-home estimates in Aurora?", a: "Absolutely. BBS Flooring provides free in-home measurements and no-obligation estimates across all of Aurora. Our team will assess your space and recommend the best flooring for your home and budget. Call (647) 428-1111 to schedule." },
      { q: "How long does a full-home flooring installation take in Aurora?", a: "A typical Aurora home (1,500-2,500 sqft) takes 3-5 days for professional installation including subfloor prep and trim work. BBS Flooring coordinates the entire process from delivery to completion — call (647) 428-1111 to get started." },
    ],
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d46039.26190678663!2d-79.48911224578136!3d44.00030275988165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882ad290076a0841%3A0xc3f62243d630d760!2sAurora%2C%20ON!5e0!3m2!1sen!2sca!4v1708795900000!5m2!1sen!2sca" width="100%" height="100%" style="border:0;" allowFullScreen="" loading="lazy"></iframe>'
  },
  scarborough: {
    city: "Scarborough",
    title: "Flooring Installation Scarborough | Vinyl & Hardwood From $1.49/sqft",
    description: "BBS Flooring serves all of Scarborough — vinyl from $1.49/sqft, engineered hardwood from $3.69/sqft. Free estimates. Call (647) 428-1111.",
    content: "BBS Flooring serves all of Scarborough with premium flooring installation — from the Bluffs to Agincourt, Malvern to West Hill. Just 15 minutes from our Markham showroom, Scarborough is one of our busiest service areas. The neighbourhood's incredible diversity of housing — bungalows, backsplits, semi-detached homes, and high-rise condos — means we install every type of flooring daily. Waterproof luxury vinyl plank is the top seller for Scarborough's finished basements and busy family homes, while engineered hardwood is popular for main-floor renovations in Agincourt and Birch Cliff. We also see high demand for carpet-to-hardwood conversions and stair refinishing in Scarborough's mature two-storey homes. Our crews are in Scarborough almost every day.",
    landmarks: ["Scarborough Town Centre", "Agincourt", "The Bluffs", "Malvern", "West Hill"],
    services: [
      { name: "Hardwood Installation", slug: "/installation", icon: "Hammer" },
      { name: "Vinyl & LVP Installation", slug: "/installation", icon: "Layers" },
      { name: "Stair Refinishing", slug: "/stair-refinishing", icon: "Footprints" },
      { name: "Carpet Removal", slug: "/carpet-removal", icon: "Trash2" },
      { name: "Hardwood Refinishing", slug: "/hardwood-refinishing", icon: "Paintbrush" },
      { name: "Basement Flooring", slug: "/basement-flooring", icon: "Home" },
    ],
    faqs: [
      { q: "How much does flooring cost in Scarborough?", a: "At BBS Flooring, vinyl plank starts from $1.49/sqft, laminate from $1.49/sqft, and engineered hardwood from $3.69/sqft — well below Scarborough big-box stores. We offer free in-home estimates across all of Scarborough. Call (647) 428-1111." },
      { q: "Do you replace carpet with hardwood in Scarborough?", a: "Yes — carpet-to-hardwood conversion is one of our most popular services in Scarborough. We remove the old carpet, prep the subfloor, and install your choice of engineered or solid hardwood. BBS Flooring handles the entire process. Call (647) 428-1111 for a free estimate." },
      { q: "Do you serve Agincourt and Malvern?", a: "Absolutely. BBS Flooring serves every Scarborough neighbourhood including Agincourt, Malvern, West Hill, Birch Cliff, Highland Creek, and the Bluffs. Our showroom is just 15 minutes north in Markham. Call (647) 428-1111." },
      { q: "What's the best flooring for Scarborough basements?", a: "Waterproof luxury vinyl plank (LVP) is the best choice for Scarborough basements — it handles moisture, is warm underfoot, and starts from $1.49/sqft at BBS Flooring. We also carry rigid-core SPC with built-in underlayment for easy installation over concrete." },
    ],
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d92287.0375!2d-79.2318!3d43.7731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4ce80c764d5a3%3A0x3ada418e8ace0c6d!2sScarborough%2C%20Toronto%2C%20ON!5e0!3m2!1sen!2sca!4v1710532800000!5m2!1sen!2sca" width="100%" height="100%" style="border:0;" allowFullScreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
  },
  oshawa: {
    city: "Oshawa",
    title: "Flooring Installation Oshawa | Hardwood & Vinyl From $1.49/sqft",
    description: "BBS Flooring serves Oshawa & Durham — vinyl from $1.49/sqft, hardwood from $3.69/sqft. Professional installation. Call (647) 428-1111.",
    content: "BBS Flooring proudly serves Oshawa and the wider Durham Region with top-quality flooring solutions. Whether you're renovating a family home near Lakeview Park, upgrading a property in north Oshawa, or fitting out a student rental near Durham College, our licensed installers deliver precision craftsmanship at contractor-friendly pricing. Oshawa's affordable housing market makes it a renovation hotspot — and flooring upgrades are the highest-ROI improvement you can make. Laminate and luxury vinyl plank are our most popular products for Oshawa, offering durability and style from just $1.49/sqft. For established homes in central Oshawa and Taunton, our engineered hardwood and stair refinishing services add significant value. Our showroom is 30 minutes west via Highway 401.",
    landmarks: ["Oshawa Centre", "Lakeview Park", "Durham College area", "Taunton", "North Oshawa"],
    services: [
      { name: "Hardwood Installation", slug: "/installation", icon: "Hammer" },
      { name: "Vinyl & LVP Installation", slug: "/installation", icon: "Layers" },
      { name: "Stair Refinishing", slug: "/stair-refinishing", icon: "Footprints" },
      { name: "Carpet Removal", slug: "/carpet-removal", icon: "Trash2" },
      { name: "Hardwood Refinishing", slug: "/hardwood-refinishing", icon: "Paintbrush" },
      { name: "Basement Flooring", slug: "/basement-flooring", icon: "Home" },
    ],
    faqs: [
      { q: "What's the most cost-effective flooring for Oshawa homes?", a: "Luxury vinyl plank and laminate both start from just $1.49/sqft at BBS Flooring — making them ideal for Oshawa's value-conscious homeowners. Both are durable, easy to maintain, and available in realistic wood-look finishes. Call (647) 428-1111 for a free estimate." },
      { q: "Do you install flooring in rental properties in Oshawa?", a: "Yes — BBS Flooring works with Oshawa landlords and property investors. We offer durable, scratch-resistant laminate and vinyl that stands up to tenant wear, starting from $1.49/sqft. Bulk pricing available for multi-unit projects. Call (647) 428-1111." },
      { q: "How far is BBS Flooring from Oshawa?", a: "Our Markham showroom is about 30 minutes west of Oshawa via Highway 401. We carry over 700 flooring options in stock. Can't visit? We offer free in-home estimates throughout Oshawa and Durham Region. Call (647) 428-1111." },
      { q: "Do you offer flooring installation in north Oshawa and Taunton?", a: "Absolutely. BBS Flooring serves all of Oshawa including Taunton, north Oshawa, Lakeview, and the Durham College area. Our installers are in Durham Region weekly. Call (647) 428-1111 to book your free estimate." },
    ],
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d92376.5165!2d-78.8659!3d43.8971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d51b9c2e3b64d9%3A0x5037b28c7231d40!2sOshawa%2C%20ON!5e0!3m2!1sen!2sca!4v1710532900000!5m2!1sen!2sca" width="100%" height="100%" style="border:0;" allowFullScreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
  },
  durham: {
    city: "Durham Region",
    title: "Flooring Services Durham Region | Hardwood & Vinyl From $1.49/sqft",
    description: "BBS Flooring serves all of Durham Region — Pickering to Oshawa. Vinyl from $1.49/sqft. Free estimates. Call (647) 428-1111.",
    content: "BBS Flooring is Durham Region's go-to flooring partner, serving every community from Pickering to Oshawa with premium hardwood, luxury vinyl plank, and laminate installation. Our Markham showroom is just minutes from Durham via Highway 407, and our installers are in the region daily. Durham Region's booming housing market — from new builds in Seaton to renovations in Brooklin and established homes in Whitby — keeps our crews busy year-round. We carry over 700 flooring products from 15+ brands, all at wholesale pricing that Durham homeowners and contractors love. Whether you need a single room of vinyl plank or a full-home hardwood installation, BBS delivers the same quality and attention to detail across every Durham community.",
    landmarks: ["Pickering", "Ajax", "Whitby", "Oshawa", "Courtice", "Brooklin"],
    services: [
      { name: "Hardwood Installation", slug: "/installation", icon: "Hammer" },
      { name: "Vinyl & LVP Installation", slug: "/installation", icon: "Layers" },
      { name: "Stair Refinishing", slug: "/stair-refinishing", icon: "Footprints" },
      { name: "Carpet Removal", slug: "/carpet-removal", icon: "Trash2" },
      { name: "Hardwood Refinishing", slug: "/hardwood-refinishing", icon: "Paintbrush" },
      { name: "Basement Flooring", slug: "/basement-flooring", icon: "Home" },
    ],
    faqs: [
      { q: "Which Durham Region cities does BBS Flooring serve?", a: "BBS Flooring serves all of Durham Region including Pickering, Ajax, Whitby, Oshawa, Courtice, Bowmanville, and Brooklin. Our installers are in Durham daily. Call (647) 428-1111 for a free in-home estimate anywhere in the region." },
      { q: "Do you offer contractor pricing for Durham Region builders?", a: "Yes — BBS Flooring works with Durham Region contractors and builders. We offer wholesale pricing, bulk discounts, and can supply materials for multi-unit developments. Visit our contractor flooring page or call (647) 428-1111 to discuss your project." },
      { q: "What flooring is best for new builds in Durham Region?", a: "Engineered hardwood (from $3.69/sqft) is the top choice for Durham's new builds — it's stable over concrete subfloors and compatible with radiant heating. For basements and secondary areas, waterproof vinyl plank from $1.49/sqft is ideal. Call BBS Flooring at (647) 428-1111." },
      { q: "Can you install flooring in Courtice and Bowmanville?", a: "Absolutely. BBS Flooring serves the entire Durham Region including Courtice and Bowmanville. While our showroom is in Markham (30-35 min via Hwy 401), we offer free in-home estimates and regular installation schedules in eastern Durham. Call (647) 428-1111." },
    ],
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d184632.1234!2d-79.0312!3d43.9089!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d51c1de7e1e71f%3A0x3b0e2e43ed23cf6e!2sDurham%20Region%2C%20ON!5e0!3m2!1sen!2sca!4v1710533000000!5m2!1sen!2sca" width="100%" height="100%" style="border:0;" allowFullScreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
  }
};
