import { GOOGLE_RATING } from '@/lib/service-constants';
// /flooring-in/markham — city hub content. Edit here; aggregated by data/locationData.js.
const data = {
  "city": "Markham",
  "isFlagship": true,
  "title": "Flooring Store in Markham | Showroom, Installation & Prices | BBS Flooring",
  "description": "BBS Flooring — Markham's local flooring store since 2012. 1,000+ hardwood, vinyl & laminate options from $1.49/sqft. Visit our Highway 7 showroom. Free estimates. (647) 428-1111.",
  "content": "BBS Flooring is Markham's premier flooring specialist, located right on Highway 7 at Unit B, 6061. Since 2012, we've served Markham homeowners — from heritage homes in Unionville and family properties in Cornell to modern condos in Downtown Markham and executive homes in Cachet. Markham's diverse housing stock means we install everything from waterproof luxury vinyl plank (LVP) and luxury vinyl tile (LVT) in finished basements and kitchens to wide-plank engineered hardwood in open-concept main floors. As your local showroom, we carry over 1,000 floors in stock and offer same-week installation for most products. Whether you're in Markham Village, Berczy, Wismer, or Cathedraltown, our installers know the area and deliver precision craftsmanship every time.",
  "landmarks": [
    "Unionville",
    "Downtown Markham",
    "Markville Mall",
    "Cornell",
    "Cachet",
    "Cathedraltown"
  ],
  "services": [
    {
      "name": "Hardwood Installation",
      "slug": "/installation",
      "icon": "Hammer"
    },
    {
      "name": "Vinyl, LVP & LVT Installation",
      "slug": "/installation",
      "icon": "Layers"
    },
    {
      "name": "Stair Refinishing",
      "slug": "/stair-refinishing",
      "icon": "Footprints"
    },
    {
      "name": "Carpet Removal",
      "slug": "/carpet-removal",
      "icon": "Trash2"
    },
    {
      "name": "Hardwood Refinishing",
      "slug": "/hardwood-refinishing",
      "icon": "Paintbrush"
    },
    {
      "name": "Basement Flooring",
      "slug": "/basement-flooring",
      "icon": "Home"
    }
  ],
  "neighbourhoods": [
    {
      "name": "Unionville",
      "slug": "unionville",
      "description": "Unionville's charming heritage homes along Main Street and surrounding residential streets feature original hardwood floors from the early 1900s alongside modern open-concept renovations. Our most popular service here is dustless hardwood refinishing — restoring 80- to 100-year-old oak and maple floors to their original lustre. For newer Unionville properties and additions, wide-plank engineered hardwood in white oak is the top choice, complementing both traditional and transitional interiors.",
      "housingTypes": "Heritage homes, Victorian-era semis, modern detached, luxury custom builds",
      "topProducts": "Solid hardwood refinishing, wide-plank engineered oak, luxury vinyl plank for basements"
    },
    {
      "name": "Cornell",
      "slug": "cornell",
      "description": "Cornell is one of Markham's fastest-growing communities, with thousands of new-build townhomes and detached houses going up over the last decade. These modern homes typically feature open-concept main floors with 9-foot ceilings — perfect for wide-plank engineered hardwood that creates a seamless, spacious feel. Builder-grade laminate upgrades are extremely common here, with homeowners swapping the stock flooring for premium vinyl plank or engineered hardwood within the first few years of ownership.",
      "housingTypes": "New-build townhomes, detached homes (2015+), stacked townhomes",
      "topProducts": "Engineered hardwood (builder-grade upgrade), waterproof LVP for basements, laminate for bedrooms"
    },
    {
      "name": "Cachet",
      "slug": "cachet",
      "description": "Cachet is Markham's premier luxury neighbourhood, home to executive properties on large lots with grand foyers, sweeping staircases, and formal living spaces. Homeowners here demand the finest materials — hand-scraped solid hardwood, custom stair refinishing with intricate baluster work, and premium wide-plank European oak engineered flooring. BBS has completed dozens of full-home installations in Cachet, often replacing entire main floors and staircases in a single project.",
      "housingTypes": "Luxury detached estates (4,000-8,000+ sqft), custom-built executive homes",
      "topProducts": "Premium engineered hardwood (Vidar, NAF), grand staircase refinishing, solid hardwood"
    },
    {
      "name": "Cathedraltown",
      "slug": "cathedraltown",
      "description": "Named after the stunning Cathedral of the Transfiguration, Cathedraltown features mid-to-large detached homes built primarily in the 2000s. These well-maintained family properties are now reaching the age where original flooring needs refreshing — making Cathedraltown one of our busiest areas for carpet-to-hardwood conversions and main-floor upgrades. Engineered hardwood and luxury vinyl plank are the go-to choices here.",
      "housingTypes": "Detached family homes (2000s era), some semi-detached",
      "topProducts": "Engineered hardwood, carpet removal + replacement, LVP for basements and playrooms"
    },
    {
      "name": "Markham Village",
      "slug": "markham-village",
      "description": "Markham Village along Main Street Markham blends historic charm with modern living. Older homes near Robinson Street and the heritage core often have original hardwood that we refinish and restore, while newer infill homes call for contemporary wide-plank flooring. This neighbourhood's walkable, community feel means many homeowners invest in high-quality materials that last — solid hardwood refinishing and premium engineered hardwood are our top sellers here.",
      "housingTypes": "Century homes, post-war bungalows, modern infill, townhomes",
      "topProducts": "Hardwood refinishing, solid hardwood, engineered hardwood, stair recapping"
    },
    {
      "name": "Berczy",
      "slug": "berczy",
      "description": "The Berczy community in north Markham is a well-established family neighbourhood with spacious detached homes built through the 1990s and 2000s. Many Berczy homeowners are now doing full-home flooring upgrades — replacing worn carpet with engineered hardwood on the main floor and luxury vinyl plank in the finished basement. Berczy's two-storey homes also drive strong demand for our stair refinishing service.",
      "housingTypes": "Detached homes (1990s-2000s), some semis and townhomes",
      "topProducts": "Engineered hardwood, LVP for basements, stair refinishing, carpet removal"
    },
    {
      "name": "Wismer",
      "slug": "wismer",
      "description": "Wismer is a family-oriented community in east Markham featuring a mix of detached homes, semis, and townhomes. The neighbourhood is home to many young families, making scratch-resistant and waterproof flooring a top priority. Luxury vinyl plank is the bestseller in Wismer — it handles kids, pets, and spills while looking like real hardwood. For homeowners wanting an upgrade, our mid-range engineered hardwood collections offer the perfect balance of quality and value.",
      "housingTypes": "Detached homes, semi-detached, freehold townhomes",
      "topProducts": "Waterproof LVP, mid-range engineered hardwood, laminate for bedrooms"
    },
    {
      "name": "Downtown Markham",
      "slug": "downtown-markham",
      "description": "Downtown Markham (Markham Centre) is the city's newest urban hub, featuring modern condos, stacked townhomes, and mixed-use developments around the Unionville GO Station. Condo and townhome owners here need flooring that meets building sound-rating requirements — our SPC vinyl plank and engineered hardwood with cork-backed underlayment are specifically selected for multi-unit compliance. We handle condo board paperwork, elevator bookings, and after-hours installation to minimize disruption.",
      "housingTypes": "High-rise condos, stacked townhomes, mid-rise mixed-use",
      "topProducts": "SPC vinyl plank (sound-rated), engineered hardwood with cork underlayment, condo-grade laminate"
    },
    {
      "name": "Greensborough",
      "slug": "greensborough",
      "description": "Greensborough in north Markham is a newer community with family-friendly subdivisions featuring modern open-concept homes. These properties have large main floors and finished basements, making them ideal for our most popular flooring combination: engineered hardwood upstairs, waterproof LVP downstairs. Greensborough's proximity to parks and green spaces means homeowners prioritize durable, easy-to-clean flooring that handles an active lifestyle.",
      "housingTypes": "New detached homes, freehold townhomes, semi-detached",
      "topProducts": "Engineered hardwood + LVP combo, waterproof SPC, laminate"
    },
    {
      "name": "Milliken",
      "slug": "milliken",
      "description": "Milliken in south Markham is one of the GTA's most diverse and established neighbourhoods, featuring a mix of semi-detached homes, bungalows, and older detached properties. Many homes here were built in the 1970s-1990s and are prime candidates for flooring upgrades — replacing worn carpet, dated linoleum, or scratched parquet with modern vinyl plank or engineered hardwood. BBS Flooring is just a 5-minute drive from Milliken, making us the most convenient showroom for the neighbourhood.",
      "housingTypes": "Semi-detached, bungalows, detached homes (1970s-1990s), some townhomes",
      "topProducts": "LVP (replacing carpet/linoleum), affordable engineered hardwood, laminate, stair refinishing"
    }
  ],
  "commercial": {
    "title": "Commercial Flooring on Markham's Highway 7 Corridor",
    "content": "BBS Flooring supplies and installs commercial-grade flooring for Markham's thriving business community along the Highway 7 corridor, Enterprise Boulevard, and Markham's growing tech and professional office parks. We work with property managers, dental and medical clinics, retail stores, restaurants, and office fit-outs — providing durable, high-traffic flooring solutions that meet commercial building codes. Our commercial luxury vinyl tile (LVT) and click-lock SPC products are rated for heavy foot traffic, resist scratches from rolling office chairs, and maintain their appearance for years. We offer after-hours installation to minimize business disruption, and provide contractor-friendly bulk pricing for multi-unit commercial projects.",
    "sectors": [
      {
        "name": "Offices & Tech",
        "description": "Durable LVT and carpet tile for Markham's tech corridor"
      },
      {
        "name": "Medical & Dental",
        "description": "Hygienic, waterproof SPC for clinics and healthcare"
      },
      {
        "name": "Retail & Restaurants",
        "description": "High-traffic commercial vinyl and laminate"
      },
      {
        "name": "Property Management",
        "description": "Bulk pricing for multi-unit turnover flooring"
      }
    ]
  },
  "whyBBS": {
    "title": "Why Markham Homeowners Choose BBS Over Big Box Stores",
    "points": [
      {
        "heading": "See & Feel 700+ Options In Person",
        "detail": "Big box stores carry 30-50 flooring SKUs per location. BBS Flooring stocks over 1,000 products from 15+ premium brands — all available to see, touch, and compare in our Highway 7 showroom. No guessing from a tiny sample chip."
      },
      {
        "heading": "Wholesale Pricing, Retail Service",
        "detail": "We buy directly from manufacturers and pass the savings to you. Our engineered hardwood starts at $3.69/sqft — often 20-40% below what you'd pay at Home Depot or Lowe's for comparable quality. No membership fees, no hidden costs."
      },
      {
        "heading": "Our Own Installation Crews (Not Subcontractors)",
        "detail": "Big box stores send whoever is available — you don't know who's showing up. BBS Flooring uses our own trained installation crews who work exclusively with us. Same quality on every job. Full accountability."
      },
      {
        "heading": "Expert Advice from Flooring Specialists",
        "detail": "Need help choosing between 12mm and 14mm engineered hardwood? Wondering if your concrete subfloor needs a moisture barrier? Our team has installed flooring in Markham homes for over a decade — we know what works and what doesn't."
      },
      {
        "heading": "Markham-Based Since 2012",
        "detail": `We're not a franchise or a chain. BBS Flooring is an independent, family-run business right here on Highway 7 in Markham. Our reputation is built on serving our neighbours since 2012 — backed by ${GOOGLE_RATING}-star Google reviews from real homeowners.`
      }
    ]
  },
  "pricingComparison": {
    "title": "Markham Flooring Prices: BBS vs Competitors",
    "subtitle": "Transparent pricing — no surprises. All prices are per square foot, materials only.",
    "rows": [
      {
        "type": "Luxury Vinyl Plank (LVP)",
        "bbs": "From $1.89",
        "bigBox": "$2.99 – $5.99",
        "specialty": "$3.49 – $6.99"
      },
      {
        "type": "Laminate Flooring",
        "bbs": "From $1.49",
        "bigBox": "$1.99 – $4.49",
        "specialty": "$2.49 – $5.99"
      },
      {
        "type": "Engineered Hardwood",
        "bbs": "From $3.69",
        "bigBox": "$5.99 – $9.99",
        "specialty": "$6.99 – $12.99"
      },
      {
        "type": "Solid Hardwood",
        "bbs": "From $5.10",
        "bigBox": "$6.99 – $11.99",
        "specialty": "$8.99 – $14.99"
      },
      {
        "type": "SPC/Rigid Core Vinyl",
        "bbs": "From $2.29",
        "bigBox": "$3.99 – $6.99",
        "specialty": "$4.49 – $7.99"
      },
      {
        "type": "Waterproof Laminate",
        "bbs": "From $1.99",
        "bigBox": "$3.49 – $5.99",
        "specialty": "$3.99 – $6.99"
      }
    ]
  },
  "faqs": [
    {
      "q": "How much does flooring installation cost in Markham?",
      "a": "At BBS Flooring, vinyl plank starts from $1.89/sqft and engineered hardwood from $3.69/sqft, with professional installation available at competitive rates. Visit our Markham showroom at 6061 Highway 7 for a free in-person quote tailored to your project."
    },
    {
      "q": "Can I visit the BBS Flooring showroom in Markham?",
      "a": "Yes — our Markham flooring store at 6061 Highway 7, Unit B is open Monday to Saturday, 10am–5pm (closed Sundays). We carry over 1,000 flooring options in stock so you can see and feel samples before buying. Call (647) 428-1111 or just walk in — no appointment needed."
    },
    {
      "q": "What's the best flooring for Markham basements?",
      "a": "Waterproof luxury vinyl plank (LVP) is the top choice for Markham basements — it handles moisture, looks like real hardwood, and starts from $1.89/sqft at BBS Flooring. We also carry rigid-core SPC flooring with built-in underlayment for even easier installation."
    },
    {
      "q": "Do you offer free in-home estimates in Markham?",
      "a": "Absolutely. BBS Flooring provides free in-home measurements and estimates throughout Markham. Our team will assess your space, recommend the best flooring for your home, and provide a detailed quote — no obligation. Call (647) 428-1111 to schedule."
    },
    {
      "q": "What flooring is best for Markham homes with pets?",
      "a": "For pet-friendly flooring in Markham, we recommend waterproof luxury vinyl plank (LVP) or scratch-resistant laminate. Both handle paw traffic, resist scratches, and are easy to clean. LVP starts from $1.89/sqft at BBS Flooring — visit our Highway 7 showroom to see samples."
    },
    {
      "q": "Where can I buy LVT flooring in Markham?",
      "a": "Right here — BBS Flooring stocks luxury vinyl tile (LVT) and luxury vinyl plank (LVP) at our Markham showroom, 6061 Highway 7, Unit B. LVT is the tile-shaped version of the same 100% waterproof luxury vinyl: stone and concrete looks in 12x24 and 18x36 formats, plus commercial loose-lay and dry-back LVT for offices, clinics and retail along the Highway 7 corridor. 100+ styles from $1.89/sqft, most in stock for same-week pickup or installation."
    },
    {
      "q": "How long does a full-home flooring installation take in Markham?",
      "a": "A typical Markham home (1,500-2,500 sqft) takes 3-5 days for professional installation, including subfloor preparation, installation, and trim work. BBS Flooring coordinates the entire process from material delivery to final cleanup. Call (647) 428-1111 to schedule."
    },
    {
      "q": "Do you install flooring in Markham condos and townhomes?",
      "a": "Yes — BBS Flooring regularly installs in Markham condos, especially in Downtown Markham and Unionville. We carry sound-rated underlayment and SPC vinyl plank that meets condo board requirements. We handle insurance certificates and elevator bookings. Call (647) 428-1111."
    },
    {
      "q": "Can you match my existing hardwood floors in Markham?",
      "a": "In most cases, yes. Our installers can match species, width, and stain colour to extend your existing hardwood into additional rooms. For older Markham homes with discontinued species, we offer refinishing services to create a uniform look across your entire home."
    },
    {
      "q": "What brands of flooring does BBS carry for Markham customers?",
      "a": "BBS Flooring stocks 15+ premium brands including Vidar, NAF, Appalachian, Triforest, Woden, Simba, Canadian Standard, Lee, and more — over 1,000 products total. Visit our Markham showroom at 6061 Highway 7 to browse the full selection in person."
    },
    {
      "q": "Is BBS Flooring the cheapest flooring store in Markham?",
      "a": "BBS Flooring offers wholesale-direct pricing that's typically 20-40% below big box stores like Home Depot and Lowe's. Our vinyl plank starts at $1.89/sqft and engineered hardwood at $3.69/sqft. We buy directly from manufacturers and pass the savings to Markham homeowners — no membership fees, no hidden markups."
    }
  ],
  "mapEmbed": "<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2878.871587606354!2d-79.25622102326802!3d43.85905624535496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d7647895e557%3A0x8956973e89c67623!2sBBS%20Flooring!5e0!3m2!1sen!2sca!4v1708795000000!5m2!1sen!2sca\" width=\"100%\" height=\"100%\" style=\"border:0;\" allowFullScreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>"
};

export default data;
