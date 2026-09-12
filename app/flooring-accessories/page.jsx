import Link from 'next/link';
import SuppliesShopClient from '@/components/SuppliesShopClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getSuppliesCatalog } from '@/lib/suppliesCatalog';

export const revalidate = 3600;

export const metadata = {
  title: 'Flooring Accessories & Installation Supplies — Markham | BBS Flooring',
  description:
    'Underlay, adhesives, primers, subfloor levelling, moisture barriers, floor vents, trim and baseboards to finish your floor. In-stock in Markham, priced per unit, add to your order online.',
  alternates: { canonical: '/flooring-accessories' },
};

// ── Showroom Place — reused on every supply Offer as a pickup-oriented
// availableAtOrFrom (this is a pickup/attach catalog, not a shipped-anywhere
// storefront — S4 will decide standalone fulfilment; S2 keeps schema honest
// about where the stock physically is). ──
const SHOWROOM_PLACE = {
  '@type': 'Place',
  name: 'BBS Flooring Showroom',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '6061 Highway 7, Unit B',
    addressLocality: 'Markham',
    addressRegion: 'ON',
    postalCode: 'L3P 3B2',
    addressCountry: 'CA',
  },
};

const EXAMPLE_SQFT = 500;
const UNIT_PLURAL = { gal: 'gal', pail: 'pails', bag: 'bags', roll: 'rolls', tube: 'tubes', each: 'pieces', kit: 'kits', piece: 'pieces' };
function coverageSentence(item) {
  if (!item.coverage_sqft) return null;
  const needed = Math.ceil(EXAMPLE_SQFT / item.coverage_sqft);
  const word = needed === 1 ? item.unit : (UNIT_PLURAL[item.unit] || `${item.unit}s`);
  return `1 ${item.unit} covers ~${item.coverage_sqft} sqft — a ${EXAMPLE_SQFT} sqft floor needs about ${needed} ${word}.`;
}

// Section definitions: DB `category` → display group. Order = buyer intent
// (underlay/moisture first — highest existing traffic — down to tools).
// 'transition' is intentionally excluded: the live T-Mould/Reducer/Stair
// Nosing box stays PDP-only per the hard constraint in this build's brief.
function buildSections(catalog) {
  const byCategory = catalog.byCategory || {};
  const get = (...cats) => cats.flatMap((c) => byCategory[c] || []);
  return [
    {
      id: 'underlay',
      title: 'Underlay & Acoustic Mats',
      note: 'Sold per full roll. Underlay is mandatory under floating laminate — it soundproofs, cushions, and (on the 3mm black + 5mm airflow) blocks moisture from concrete or below-grade subfloors.',
      items: get('underlay'),
    },
    {
      id: 'moisture-barriers',
      title: 'Moisture Barriers',
      note: 'Poly film and wax paper laid under the floor to stop moisture wicking up from a slab or subfloor before it can warp or mould your new flooring.',
      items: get('moisture_barrier'),
    },
    {
      id: 'adhesives-primers',
      title: 'Adhesives & Primers',
      note: 'Glue-down vinyl and engineered hardwood adhesives, seam sealer, and the primers that make them bond properly to concrete or plywood subfloors.',
      items: get('adhesive', 'primer'),
    },
    {
      id: 'subfloor-prep',
      title: 'Subfloor Prep',
      note: 'Self-levelling underlayment and patch/skimcoat compounds — flatten a subfloor before any floating or glue-down install so the new floor doesn\u2019t telegraph every dip.',
      items: get('subfloor_prep'),
    },
    {
      id: 'quarter-round',
      title: 'Shoe Moulding & Quarter Round',
      note: 'Finishes the floor-to-baseboard gap for a clean edge. Sold per full piece.',
      items: get('trim'),
    },
    {
      id: 'baseboards',
      title: 'Baseboards',
      note: 'Paint-grade MDF, eight profiles. Sold per full 10ft piece.',
      items: get('baseboard'),
    },
    {
      id: 'floor-vents',
      title: 'Floor Vents',
      note: 'Wood and metal floor registers finished to match your new floor — the easiest whole-room add-on there is.',
      items: get('floor_vent'),
    },
    {
      id: 'installer-tools',
      title: 'Installer Tools',
      note: 'Pro-grade tapping blocks, pull bars and install kits for DIY installs.',
      items: get('tools'),
    },
  ];
}

const BASE_FAQ_ITEMS = [
  {
    question: 'Do I need underlay for laminate flooring?',
    answer:
      'Yes. Floating laminate almost always needs a separate underlay unless the plank has a pad already attached to the back. Underlay cushions the floor, quiets footsteps, and — on our 3mm black and 5mm airflow pads — adds a moisture barrier. The only common exception is thick 14mm laminate or any board that lists an attached IXPE/pre-attached pad in its specs. If you are in a Markham condo or a basement over concrete, use the 3mm black or 5mm airflow underlay so you meet condo sound requirements and block subfloor moisture.',
  },
  {
    question: 'What underlay is best for a condo?',
    answer:
      'For condos we recommend the 3mm black acoustic underlay. It is rated IIC 72 / STC 73, which comfortably clears most Toronto condo board sound-transmission requirements, and it includes a built-in moisture barrier. It is a small upgrade over standard 2.5mm white foam but it is the one that keeps you onside with the building.',
  },
  {
    question: 'What underlay do I need over concrete or in a basement?',
    answer:
      'Over concrete or below grade, moisture is the enemy. Use the 5mm airflow bubble underlay — its dimpled air-gap design lets the slab breathe and lifts the floor off any surface moisture, while still soundproofing at IIC 72 / STC 73. The 3mm black is the step-down option if height is tight.',
  },
  {
    question: 'Do I need underlay for vinyl plank flooring?',
    answer:
      'Usually not. Most vinyl (SPC/LVP) sold today comes with a pad already attached to the back, and adding a second pad under it (pad-on-pad) can void the warranty and make the floor feel spongy. Only bare vinyl with no attached pad needs a thin underlay. If you are unsure, check the plank spec or ask us and we will tell you exactly what your SKU needs.',
  },
  {
    question: 'How many pieces of quarter round or baseboard do I need?',
    answer:
      'Estimate the perimeter of the room (roughly 4.5 \u00d7 the square root of the floor area gives a safe number for a not-perfectly-square room), then divide by the length of the piece — quarter round and baseboards come in 10ft sticks. Add a little for cuts and corners. Add your floor to the cart first and our buy box will suggest a starting quantity automatically.',
  },
  {
    question: 'Can I buy accessories without buying flooring?',
    answer:
      'Yes. Everything on this page can be added to your cart and ordered on its own — underlay, adhesive, subfloor prep, quarter round, shoe moulding and baseboards. Pick up free at our Markham showroom.',
  },
];

// Supply FAQs — every number below is derived from the live coverage_sqft on
// the `supplies` table (via coverageSentence), never hand-typed, so this stays
// correct if a Prosol re-import changes a pack size or price.
function buildSupplyFaq(catalog) {
  const byKey = catalog.byKey || {};
  const henry630 = byKey['AR630-04'];
  const mapei = byKey['prosol_eco983'];
  const ardexK15 = byKey['AR-K-15'];
  const robertsPoly = byKey['Q70115'];
  const waxPaper = byKey['prosol_wax_paper'];

  const items = [];
  if (henry630) {
    items.push({
      question: 'What adhesive do I need for glue-down vinyl flooring?',
      answer: `Full-spread glue-down vinyl (as opposed to click-lock floating vinyl) needs a dedicated vinyl adhesive — we stock Henry 630 PeachPro for standard subfloors and Henry 695 for high-relative-humidity concrete slabs. ${coverageSentence(henry630)} Always prime a bare or porous concrete subfloor first (Ardex P 4 or P 51) so the adhesive bonds properly instead of the vinyl lifting later.`,
    });
  }
  if (mapei) {
    items.push({
      question: 'Do I need glue for engineered hardwood?',
      answer: `Only if it's a glue-down (full-spread) install rather than a floating or nail-down one — check your plank spec. For glue-down engineered hardwood we stock Mapei Ultrabond ECO 983, a moisture-control MS-polymer adhesive. ${coverageSentence(mapei)}`,
    });
  }
  if (ardexK15) {
    items.push({
      question: 'How do I flatten an uneven subfloor before installing new flooring?',
      answer: `Self-levelling underlayment pours over the existing subfloor and cures flat, so dips don't telegraph through the new floor. We stock Ardex K 15 (best for larger low spots) and Custom LevelQuik ES. ${coverageSentence(ardexK15)} Both need a compatible primer first — ask us which one your subfloor needs.`,
    });
  }
  if (robertsPoly) {
    items.push({
      question: 'What is a moisture barrier and do I need one?',
      answer: `A moisture barrier is a poly film or wax paper layer between your subfloor and the new floor that blocks ground/slab moisture from wicking up and warping the wood or mould your new flooring. It's mandatory under nail-down solid hardwood (we use wax paper) and recommended under laminate/engineered floors sitting on concrete (we use Roberts 6-mil poly). ${coverageSentence(robertsPoly)}`,
    });
  }
  if (waxPaper) {
    items.push({
      question: 'What goes under nail-down solid hardwood flooring?',
      answer: `Rosin/wax paper goes down first, stapled to the subfloor, before every nail-down solid hardwood install — it reduces squeaks and blocks moisture wicking from the subfloor. ${coverageSentence(waxPaper)} It's a required line item on every solid hardwood Install Kit on our product pages.`,
    });
  }
  return items;
}

function breadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bbsflooring.ca/' },
      { '@type': 'ListItem', position: 2, name: 'Flooring Accessories', item: 'https://bbsflooring.ca/flooring-accessories' },
    ],
  };
}

// One Product node per supply item — individual Offers (not a single
// AggregateOffer) so each SKU carries its own gtin (from upc, when present)
// and a pickup-oriented availableAtOrFrom, per the S2 brief.
function supplyProductsSchema(sections) {
  const products = [];
  for (const section of sections) {
    for (const item of section.items) {
      if (item.price == null) continue;
      products.push({
        '@type': 'Product',
        name: item.pack_size ? `${item.label} (${item.pack_size})` : item.label,
        ...(item.brand ? { brand: { '@type': 'Brand', name: item.brand } } : {}),
        ...(item.image ? { image: item.image } : {}),
        category: section.title,
        offers: {
          '@type': 'Offer',
          price: String(item.price),
          priceCurrency: 'CAD',
          availability: 'https://schema.org/InStock',
          availableAtOrFrom: SHOWROOM_PLACE,
          ...(item.upc ? { gtin: item.upc } : {}),
        },
      });
    }
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Flooring Accessories & Installation Supplies',
    url: 'https://bbsflooring.ca/flooring-accessories',
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: p })),
  };
}

export default async function FlooringAccessoriesPage() {
  const catalog = await getSuppliesCatalog();
  const sections = buildSections(catalog);
  const faqItems = [...BASE_FAQ_ITEMS, ...buildSupplyFaq(catalog)];

  return (
    <>
      <JsonLd data={[supplyProductsSchema(sections), breadcrumbSchema(), faqSchema(faqItems)]} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">Flooring Accessories</span>
        </nav>

        {/* Hero */}
        <header className="max-w-3xl">
          <h1 className="text-4xl font-bold text-slate-900">Flooring Accessories & Installation Supplies</h1>
          <p className="mt-3 text-lg text-slate-600">
            Everything you need to finish the job — underlay, adhesives, primers, subfloor levelling,
            moisture barriers, floor vents, trim and baseboards. In stock at our Markham showroom,
            priced per unit, and easy to add to your flooring order online.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="#underlay" className="rounded-lg bg-amber-600 px-4 py-2 text-white text-sm font-semibold hover:bg-amber-700">Shop underlay</Link>
            <Link href="#adhesives-primers" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 text-sm font-semibold hover:border-amber-400">Adhesives & primers</Link>
            <Link href="/products" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 text-sm font-semibold hover:border-amber-400">Browse flooring</Link>
            <Link href="/contact" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 text-sm font-semibold hover:border-amber-400">Ask about your project</Link>
          </div>
        </header>

        {/* The underlay story — the AI-citable / GEO block */}
        <section className="mt-12 rounded-2xl bg-slate-50 border border-slate-200 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">Do you need underlay for your floor?</h2>
          <p className="mt-2 text-slate-600 max-w-3xl">
            Underlay is the layer between your subfloor and a floating floor. Get it right and the
            floor is quieter, warmer underfoot, and protected from moisture. Get it wrong and you can
            void a warranty or fail a condo sound inspection. Here is the short version.
          </p>
          <div className="mt-6 grid sm:grid-cols-3 gap-5">
            <div className="rounded-xl bg-white border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900">Laminate</h3>
              <p className="mt-1 text-sm text-slate-600">
                Almost always needs underlay — unless it is thick 14mm or has an attached pad. In a
                condo or over concrete, step up to the 3mm black (moisture barrier + condo-grade
                quiet) or 5mm airflow.
              </p>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900">Vinyl (SPC/LVP)</h3>
              <p className="mt-1 text-sm text-slate-600">
                Usually already has a pad attached — do not add a second one. Glue-down vinyl doesn&apos;t
                take underlay at all — it needs adhesive instead (see Adhesives & Primers below).
              </p>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900">Basement / concrete</h3>
              <p className="mt-1 text-sm text-slate-600">
                Moisture is the risk. The 5mm airflow bubble pad lets the slab breathe and lifts the
                floor off surface moisture, while soundproofing at IIC 72.
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm text-slate-500">
            Still unsure? Tell us your floor and where it is going — <Link href="/contact" className="text-amber-700 underline">we will tell you the exact underlay</Link> your SKU needs, no guessing.
          </p>
        </section>

        {/* The shop grid */}
        <div className="mt-14">
          <SuppliesShopClient sections={sections} />
        </div>

        {/* Cross-links */}
        <section className="mt-14 rounded-2xl border border-slate-200 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Buying flooring too?</h2>
          <p className="mt-2 text-slate-600">
            Add your floor first and the Install Kit on the product page sizes the right underlay,
            adhesive or trim for you automatically — no math required.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/laminate" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 text-sm font-semibold hover:border-amber-400">Laminate flooring</Link>
            <Link href="/vinyl" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 text-sm font-semibold hover:border-amber-400">Vinyl flooring</Link>
            <Link href="/engineered-hardwood" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 text-sm font-semibold hover:border-amber-400">Engineered hardwood</Link>
            <Link href="/installation" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 text-sm font-semibold hover:border-amber-400">Professional installation</Link>
          </div>
        </section>

        {/* FAQ (visible + matches JSON-LD) */}
        <section className="mt-14 max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-900">Flooring accessory & supply FAQ</h2>
          <div className="mt-6 space-y-6">
            {faqItems.map((f) => (
              <div key={f.question}>
                <h3 className="font-semibold text-slate-900">{f.question}</h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
