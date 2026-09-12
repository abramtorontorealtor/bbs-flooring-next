import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSuppliesCatalog } from '@/lib/suppliesCatalog';
import { getSupplySteps, getSupplyFaq, FLOOR_TYPE_LINKS } from '@/lib/supplyGuides';
import { JsonLd, faqSchema, SHOWROOM_PLACE } from '@/lib/schemas';
import SupplyBuyBox from '@/components/SupplyBuyBox';
import { Package } from 'lucide-react';

export const revalidate = 600;

const CATEGORY_LABELS = {
  underlay: 'Underlay & Acoustic Mats',
  moisture_barrier: 'Moisture Barriers',
  adhesive: 'Adhesives & Primers',
  primer: 'Adhesives & Primers',
  subfloor_prep: 'Subfloor Prep',
  trim: 'Shoe Moulding & Quarter Round',
  baseboard: 'Baseboards',
  floor_vent: 'Floor Vents',
  tools: 'Installer Tools',
  transition: 'Transitions',
};

const CATEGORY_HUB_ANCHOR = {
  underlay: '#underlay',
  moisture_barrier: '#moisture-barriers',
  adhesive: '#adhesives-primers',
  primer: '#adhesives-primers',
  subfloor_prep: '#subfloor-prep',
  trim: '#quarter-round',
  baseboard: '#baseboards',
  floor_vent: '#floor-vents',
  tools: '#installer-tools',
};

// Companion categories: what pairs with what, for "Related supplies" when a
// category doesn't have 4 siblings on its own (e.g. only 1-2 primers).
const COMPANION_CATEGORIES = {
  adhesive: ['primer'],
  subfloor_prep: ['primer'],
  primer: ['adhesive', 'subfloor_prep'],
  moisture_barrier: ['underlay'],
  underlay: ['moisture_barrier'],
};

async function findItem(code) {
  const catalog = await getSuppliesCatalog();
  const item = catalog.items.find((i) => i.code === code);
  return { catalog, item };
}

export async function generateStaticParams() {
  try {
    const catalog = await getSuppliesCatalog();
    if (catalog.source !== 'db') return [];
    return catalog.items.filter((i) => i.code).map((i) => ({ code: i.code }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { code } = await params;
  const { item } = await findItem(code);
  if (!item) {
    return { title: 'Supply Not Found', robots: { index: false, follow: true } };
  }
  const brandBit = item.brand ? `${item.brand} ` : '';
  const priceBit = item.price != null ? ` — $${item.price.toFixed(2)}` : '';
  const title = `${brandBit}${item.label}${priceBit} | Pickup Markham`;
  const coverageBit = item.coverage_sqft
    ? `1 ${item.unit} covers ~${item.coverage_sqft} sq ft. `
    : '';
  const description = `${brandBit}${item.label}${item.pack_size ? ` (${item.pack_size})` : ''}. ${coverageBit}In stock, pick up free at our Markham showroom or add to your flooring order online.`.slice(0, 300);
  return {
    title,
    description,
    alternates: { canonical: `/flooring-accessories/${item.code}` },
    openGraph: {
      title,
      description,
      images: item.image ? [{ url: item.image }] : [],
    },
  };
}

function relatedItems(catalog, item, max = 4) {
  const companions = COMPANION_CATEGORIES[item.category] || [];
  const pool = catalog.items.filter(
    (i) => i.code !== item.code && (i.category === item.category || companions.includes(i.category))
  );
  // Same category first, then companions, de-duplicated, capped.
  const sameCategory = pool.filter((i) => i.category === item.category);
  const companionItems = pool.filter((i) => i.category !== item.category);
  const seen = new Set();
  const out = [];
  for (const i of [...sameCategory, ...companionItems]) {
    if (seen.has(i.code)) continue;
    seen.add(i.code);
    out.push(i);
    if (out.length >= max) break;
  }
  return out;
}

function breadcrumbSchema(item) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bbsflooring.ca/' },
      { '@type': 'ListItem', position: 2, name: 'Flooring Accessories', item: 'https://bbsflooring.ca/flooring-accessories' },
      { '@type': 'ListItem', position: 3, name: item.label, item: `https://bbsflooring.ca/flooring-accessories/${item.code}` },
    ],
  };
}

function productSchema(item) {
  const node = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.pack_size ? `${item.label} (${item.pack_size})` : item.label,
    ...(item.brand ? { brand: { '@type': 'Brand', name: item.brand } } : {}),
    ...(item.image ? { image: item.image } : {}),
    category: CATEGORY_LABELS[item.category] || item.category,
    sku: item.code,
  };
  if (item.price != null) {
    node.offers = {
      '@type': 'Offer',
      price: String(item.price),
      priceCurrency: 'CAD',
      availability: 'https://schema.org/InStock',
      availableAtOrFrom: SHOWROOM_PLACE,
      url: `https://bbsflooring.ca/flooring-accessories/${item.code}`,
      ...(item.upc ? { gtin: item.upc } : {}),
    };
  }
  return node;
}

export default async function SupplyDetailPage({ params }) {
  const { code } = await params;
  const { catalog, item } = await findItem(code);
  if (!item) notFound();

  const steps = getSupplySteps(item);
  const faqItems = getSupplyFaq(item);
  const works = (item.floor_types || []).map((ft) => FLOOR_TYPE_LINKS[ft]).filter(Boolean);
  const related = relatedItems(catalog, item);
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;
  const hubAnchor = CATEGORY_HUB_ANCHOR[item.category] || '';

  return (
    <>
      <JsonLd data={[productSchema(item), breadcrumbSchema(item), faqItems.length ? faqSchema(faqItems) : null].filter(Boolean)} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-6 flex flex-wrap items-center gap-1" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-600">Home</Link>
          <span>/</span>
          <Link href="/flooring-accessories" className="hover:text-amber-600">Flooring Accessories</Link>
          <span>/</span>
          <Link href={`/flooring-accessories${hubAnchor}`} className="hover:text-amber-600">{categoryLabel}</Link>
          <span>/</span>
          <span className="text-slate-700">{item.label}</span>
        </nav>

        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt={item.label} className="w-full h-full object-cover" fetchPriority="high" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Package className="w-16 h-16" />
                <span className="text-xs font-bold uppercase tracking-wide">{item.code}</span>
              </div>
            )}
          </div>

          <div>
            {item.brand && <div className="text-sm font-semibold text-amber-700 uppercase tracking-wide">{item.brand}</div>}
            <h1 className="mt-1 text-3xl font-bold text-slate-900">{item.label}</h1>
            {item.pack_size && <div className="mt-1 text-sm text-slate-500">{item.pack_size}</div>}

            <div className="mt-4 flex items-baseline gap-2">
              {item.price != null && <span className="text-3xl font-bold text-slate-900">${item.price.toFixed(2)}</span>}
              <span className="text-sm text-slate-500">/ {item.unit}</span>
            </div>

            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
              Pickup at Markham showroom
            </div>

            {item.blurb && <p className="mt-4 text-slate-600 leading-relaxed">{item.blurb}</p>}

            <div className="mt-6">
              <SupplyBuyBox item={item} />
            </div>

            {works.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-slate-800">Works with</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {works.map((w) => (
                    <Link key={w.url} href={w.url} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-amber-400 hover:text-amber-700">
                      {w.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Spec table */}
        <section className="mt-14">
          <h2 className="text-xl font-bold text-slate-900">Specs</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-600 w-1/3">Category</td>
                  <td className="px-4 py-2.5 text-slate-800">{categoryLabel}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-600">Unit sold</td>
                  <td className="px-4 py-2.5 text-slate-800">{item.pack_size || item.unit}</td>
                </tr>
                {item.coverage_sqft && (
                  <tr className="bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-600">Coverage</td>
                    <td className="px-4 py-2.5 text-slate-800">~{item.coverage_sqft} sq ft per {item.unit}</td>
                  </tr>
                )}
                {item.length_ft && (
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-slate-600">Length</td>
                    <td className="px-4 py-2.5 text-slate-800">{item.length_ft} ft per piece</td>
                  </tr>
                )}
                {works.length > 0 && (
                  <tr className="bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-600">Floor types</td>
                    <td className="px-4 py-2.5 text-slate-800">{works.map((w) => w.label).join(', ')}</td>
                  </tr>
                )}
                {item.upc && (
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-slate-600">UPC</td>
                    <td className="px-4 py-2.5 text-slate-800 font-mono text-xs">{item.upc}</td>
                  </tr>
                )}
                <tr className={item.upc ? 'bg-slate-50' : ''}>
                  <td className="px-4 py-2.5 font-medium text-slate-600">Code</td>
                  <td className="px-4 py-2.5 text-slate-800 font-mono text-xs">{item.code}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* How to use */}
        {steps.length > 0 && (
          <section className="mt-14 max-w-3xl">
            <h2 className="text-xl font-bold text-slate-900">How to use {item.label}</h2>
            <ol className="mt-4 space-y-3">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-none flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">{i + 1}</span>
                  <span className="text-slate-700 leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Related supplies */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold text-slate-900">Related supplies</h2>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link
                  key={r.code}
                  href={`/flooring-accessories/${r.code}`}
                  className="rounded-xl border border-slate-200 p-3 hover:border-amber-400 transition-colors"
                >
                  <div className="aspect-square rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden">
                    {r.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image} alt={r.label} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-800 leading-snug line-clamp-2">{r.label}</div>
                  {r.price != null && <div className="mt-1 text-sm font-bold text-slate-900">${r.price.toFixed(2)}</div>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {faqItems.length > 0 && (
          <section className="mt-14 max-w-3xl">
            <h2 className="text-xl font-bold text-slate-900">FAQ</h2>
            <div className="mt-5 space-y-5">
              {faqItems.map((f) => (
                <div key={f.question}>
                  <h3 className="font-semibold text-slate-900">{f.question}</h3>
                  <p className="mt-1 text-slate-600 text-sm leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-14 rounded-2xl border border-slate-200 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">Not sure which product you need?</h2>
          <p className="mt-2 text-slate-600">
            Use our supplies calculator to get a full kit recommendation for your floor type and subfloor, or ask us directly.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/flooring-accessories/calculator" className="rounded-lg bg-amber-600 px-4 py-2 text-white text-sm font-semibold hover:bg-amber-700">Try the supplies calculator</Link>
            <Link href="/contact" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 text-sm font-semibold hover:border-amber-400">Ask about your project</Link>
          </div>
        </section>
      </div>
    </>
  );
}
