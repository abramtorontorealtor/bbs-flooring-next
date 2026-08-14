import Link from 'next/link';
import AccessoriesShopClient from '@/components/AccessoriesShopClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import {
  UNDERPAD_CATALOG,
  TRIM_CATALOG,
  BASEBOARD_CATALOG,
  ACCESSORY_CATALOG,
} from '@/lib/accessoryCatalog';

export const revalidate = 3600;

export const metadata = {
  title: 'Flooring Accessories — Underlay, Quarter Round & Baseboards | BBS Flooring Markham',
  description:
    'Underlay, quarter round, shoe moulding and baseboards to finish your floor. In-stock in Markham, priced per piece/roll, add to your order online. Free advice on the right underlay for laminate in condos, basements & concrete.',
  alternates: { canonical: '/flooring-accessories' },
};

const FAQ_ITEMS = [
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
      'Estimate the perimeter of the room (roughly 4.5 × the square root of the floor area gives a safe number for a not-perfectly-square room), then divide by the length of the piece — quarter round and baseboards come in 10ft sticks. Add a little for cuts and corners. Add your floor to the cart first and our buy box will suggest a starting quantity automatically.',
  },
  {
    question: 'Can I buy accessories without buying flooring?',
    answer:
      'Yes. Everything on this page can be added to your cart and ordered on its own — underlay, quarter round, shoe moulding and baseboards. Pick up free at our Markham showroom or add delivery at checkout.',
  },
];

function accessoryProductSchema() {
  const prices = Object.values(ACCESSORY_CATALOG).map((a) => a.price);
  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Flooring Accessories — Underlay, Quarter Round & Baseboards',
    description:
      'Flooring underlay (2.5mm white, 3mm black acoustic, 5mm airflow), quarter round, shoe moulding and MDF baseboards to finish a floor installation. In stock at BBS Flooring in Markham, serving the Greater Toronto Area.',
    category: 'Flooring Accessories',
    brand: { '@type': 'Brand', name: 'BBS Flooring' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'CAD',
      lowPrice,
      highPrice,
      offerCount: Object.keys(ACCESSORY_CATALOG).length,
      availability: 'https://schema.org/InStock',
      url: 'https://bbsflooring.ca/flooring-accessories',
    },
  };
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

export default function FlooringAccessoriesPage() {
  return (
    <>
      <JsonLd data={[accessoryProductSchema(), breadcrumbSchema(), faqSchema(FAQ_ITEMS)]} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">Flooring Accessories</span>
        </nav>

        {/* Hero */}
        <header className="max-w-3xl">
          <h1 className="text-4xl font-bold text-slate-900">Flooring Accessories</h1>
          <p className="mt-3 text-lg text-slate-600">
            Everything you need to finish the job — underlay, quarter round, shoe moulding and
            baseboards. In stock at our Markham showroom, priced per piece or roll, and easy to add
            to your flooring order online.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="#underlay" className="rounded-lg bg-amber-600 px-4 py-2 text-white text-sm font-semibold hover:bg-amber-700">Shop underlay</Link>
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
                Usually already has a pad attached — do not add a second one. Only bare vinyl with no
                attached pad needs a thin underlay. Not sure? Ask us your SKU.
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
          <AccessoriesShopClient />
        </div>

        {/* Cross-links */}
        <section className="mt-14 rounded-2xl border border-slate-200 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Buying flooring too?</h2>
          <p className="mt-2 text-slate-600">
            Add your floor first and the underlay quantity is calculated for you right in the product
            buy box — no math required.
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
          <h2 className="text-2xl font-bold text-slate-900">Flooring accessory FAQ</h2>
          <div className="mt-6 space-y-6">
            {FAQ_ITEMS.map((f) => (
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
