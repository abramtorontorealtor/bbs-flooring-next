import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSuppliesCatalog } from '@/lib/suppliesCatalog';
import { getSupplySteps, getSupplyFaq, FLOOR_TYPE_LINKS } from '@/lib/supplyGuides';
import { JsonLd, faqSchema, SHOWROOM_PLACE } from '@/lib/schemas';
import { RETURN_POLICY } from '@/lib/seo';
import SupplyFamilyBuyBox from '@/components/SupplyFamilyBuyBox';
import { familyUrl, stockInfo } from '@/lib/supplyFamilies';
import { getSupplyFamilyDocuments, documentsToSchema } from '@/lib/productDocuments';
import DocumentsDownloads from '@/components/DocumentsDownloads';
import { Package } from 'lucide-react';

export const revalidate = 600;

const CATEGORY_LABELS = {
  underlay: 'Underlay & Acoustic Mats',
  stair: 'Stair Treads & Posts',
  fasteners: 'Fasteners & Screws',
  repair: 'Repair & Touch-Up',
  cleaner: 'Floor Care & Cleaners',
  protection: 'Surface Protection',
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
  stair: '#stairs',
  fasteners: '#fasteners',
  repair: '#repair',
  cleaner: '#floor-care',
  protection: '#protection',
};

// Companion categories: what pairs with what, for "Related supplies" when a
// category doesn't have 4 siblings on its own (e.g. only 1-2 primers).
const COMPANION_CATEGORIES = {
  adhesive: ['primer'],
  stair: ['transition', 'repair'],
  fasteners: ['tools', 'subfloor_prep'],
  repair: ['cleaner', 'protection'],
  cleaner: ['repair', 'protection'],
  protection: ['cleaner', 'tools'],
  subfloor_prep: ['primer'],
  primer: ['adhesive', 'subfloor_prep'],
  moisture_barrier: ['underlay'],
  underlay: ['moisture_barrier'],
};

// S5: the route param is EITHER a family slug (/flooring-accessories/henry-630)
// OR a member code (/flooring-accessories/AR630-04 — the S3 URLs already
// indexed). A member code renders the same family page with that member
// pre-selected and canonical → the family URL. No redirects (structural-SEO
// gate, SOUL.md): Google's product-variant guidance is rel=canonical to the
// parent, which is exactly this.
async function findFamily(param, searchParams) {
  const catalog = await getSuppliesCatalog();
  const family = catalog.familyBySlug[param] || catalog.familyByCode[param] || null;
  let initialCode = family ? family.primary.code : null;
  if (family && catalog.familyByCode[param] === family) initialCode = param;
  const v = searchParams?.v;
  if (family && typeof v === 'string' && family.items.some((i) => i.code === v)) initialCode = v;
  return { catalog, family, initialCode };
}

export async function generateStaticParams() {
  try {
    const catalog = await getSuppliesCatalog();
    if (catalog.source !== 'db') return [];
    return catalog.families.map((f) => ({ code: f.slug }));
  } catch {
    return [];
  }
}

function familyTitle(family) {
  const brandBit = family.brand && !family.name.startsWith(family.brand) ? `${family.brand} ` : '';
  const priceBit = family.priceLow == null
    ? ''
    : family.isMulti && family.priceLow !== family.priceHigh
      ? ` — from $${family.priceLow.toFixed(2)}`
      : ` — $${family.priceLow.toFixed(2)}`;
  return `${brandBit}${family.name}${priceBit} | Pickup Markham`;
}

export async function generateMetadata({ params }) {
  const { code } = await params;
  const { family } = await findFamily(code);
  if (!family) {
    return { title: 'Supply Not Found', robots: { index: false, follow: true } };
  }
  const title = familyTitle(family);
  const p = family.primary;
  const coverageBit = p.coverage_sqft ? `1 ${p.unit} covers ~${p.coverage_sqft} sq ft. ` : '';
  const optionsBit = family.isMulti ? `${family.items.length} options: ${family.items.map((i) => i.variantLabel || i.pack_size).filter(Boolean).slice(0, 6).join(', ')}. ` : (p.pack_size ? `${p.pack_size}. ` : '');
  const avail = stockInfo(family.bestTier);
  const description = `${family.blurb ? family.blurb + ' ' : ''}${optionsBit}${coverageBit}${avail.label}. Free showroom pickup, or add it to your flooring order online.`.slice(0, 300);
  return {
    title,
    description,
    alternates: { canonical: familyUrl(family) },
    openGraph: {
      title,
      description,
      images: family.image ? [{ url: family.image }] : [],
    },
  };
}

function relatedFamilies(catalog, family, max = 4) {
  const companions = COMPANION_CATEGORIES[family.category] || [];
  const pool = catalog.families.filter(
    (f) => f.slug !== family.slug && (f.category === family.category || companions.includes(f.category))
  );
  // Same category first, then companions, capped.
  const sameCategory = pool.filter((f) => f.category === family.category);
  const companionFams = pool.filter((f) => f.category !== family.category);
  return [...sameCategory, ...companionFams].slice(0, max);
}

function breadcrumbSchema(family) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bbsflooring.ca/' },
      { '@type': 'ListItem', position: 2, name: 'Flooring Accessories', item: 'https://bbsflooring.ca/flooring-accessories' },
      { '@type': 'ListItem', position: 3, name: family.name, item: `https://bbsflooring.ca${familyUrl(family)}` },
    ],
  };
}

// S4 GTA delivery tier for supplies-only orders ($140 garage drop). Handling
// time = the member's stock tier window (showroom/gta = 1 day, order-in longer).
function shippingDetails(tier) {
  const [minD, maxD] = stockInfo(tier).handlingDays;
  return {
    '@type': 'OfferShippingDetails',
    shippingRate: { '@type': 'MonetaryAmount', value: 140, currency: 'CAD' },
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'CA', addressRegion: 'ON' },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: { '@type': 'QuantitativeValue', minValue: Math.max(1, minD), maxValue: Math.max(1, maxD), unitCode: 'DAY' },
      // GTA garage-drop delivery once the order is ready (same tier as flooring PDPs).
      transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
    },
  };
}

function memberOffer(family, item) {
  return {
    '@type': 'Offer',
    name: item.variantLabel ? `${family.name} — ${item.variantLabel}` : (item.pack_size ? `${item.label} (${item.pack_size})` : item.label),
    sku: item.code,
    ...(item.upc ? { gtin: item.upc } : {}),
    price: String(item.price),
    priceCurrency: 'CAD',
    availability: stockInfo(item.stockTier).schema,
    availableAtOrFrom: SHOWROOM_PLACE,
    url: `https://bbsflooring.ca${familyUrl(family, item)}`,
    shippingDetails: shippingDetails(item.stockTier),
    hasMerchantReturnPolicy: RETURN_POLICY,
  };
}

// Merchant-listings schema requires `description`; 116/168 live supplies have no
// DB description yet (copy pass pending), so fall back to a factual one-liner
// rather than omit the field. Never mentions the supplier.
function schemaDescription(family) {
  if (family.blurb) return family.blurb;
  const label = (CATEGORY_LABELS[family.category] || family.category || 'installation supply').toLowerCase();
  const brand = family.brand ? ` by ${family.brand}` : '';
  return `${family.name}${brand}: ${label} for flooring installation, sold by BBS Flooring in Markham. Showroom pickup or GTA delivery; pricing and stock shown live.`;
}

// ONE Product node per family. Single-member family = a plain Offer (same as
// S3). Multi-member = AggregateOffer (low/high + count) carrying one nested
// Offer per member with its own sku/gtin/availability/url — Google shows the
// price range on the family result, Merchant Center gets one row per member
// sharing item_group_id = family slug.
function productSchema(family, documents = []) {
  const p = family.primary;
  const priced = family.items.filter((i) => i.price != null);
  const subjectOf = documentsToSchema(documents);
  const node = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: family.name,
    ...(family.brand ? { brand: { '@type': 'Brand', name: family.brand } } : {}),
    ...(family.image ? { image: family.image } : {}),
    description: schemaDescription(family),
    category: CATEGORY_LABELS[family.category] || family.category,
    sku: p.code,
    ...(family.isMulti ? { productGroupID: family.slug } : {}),
    // Docs P3: TDS / SDS / install guide as DigitalDocument nodes on the entity.
    ...(subjectOf.length ? { subjectOf } : {}),
  };
  if (priced.length === 0) return node;
  if (!family.isMulti) {
    node.offers = memberOffer(family, priced[0]);
    return node;
  }
  node.offers = {
    '@type': 'AggregateOffer',
    lowPrice: String(family.priceLow),
    highPrice: String(family.priceHigh),
    priceCurrency: 'CAD',
    offerCount: priced.length,
    availability: stockInfo(family.bestTier).schema,
    url: `https://bbsflooring.ca${familyUrl(family)}`,
    offers: priced.map((i) => memberOffer(family, i)),
  };
  return node;
}

export default async function SupplyDetailPage({ params, searchParams }) {
  const { code } = await params;
  const sp = searchParams ? await searchParams : {};
  const { catalog, family, initialCode } = await findFamily(code, sp);
  if (!family) notFound();

  // Technique steps / FAQ are keyed by member code (TDS-traced, lib/supplyGuides).
  // Use the pre-selected member; fall back to the first member that has a guide.
  const item = family.items.find((i) => i.code === initialCode) || family.primary;
  const guideItem = family.items.find((i) => getSupplySteps(i).length > 0) || item;
  const steps = getSupplySteps(guideItem);
  const faqItems = getSupplyFaq(guideItem);
  const works = (family.floor_types || []).map((ft) => FLOOR_TYPE_LINKS[ft]).filter(Boolean);
  const related = relatedFamilies(catalog, family);
  const categoryLabel = CATEGORY_LABELS[family.category] || family.category;
  const hubAnchor = CATEGORY_HUB_ANCHOR[family.category] || '';
  // Manufacturer documents (Docs P3): brand-level ∪ this family's TDS / SDS /
  // install / warranty PDFs, served from /docs/. [] on any failure.
  const documents = await getSupplyFamilyDocuments(family);

  return (
    <>
      <JsonLd data={[productSchema(family, documents), breadcrumbSchema(family), faqItems.length ? faqSchema(faqItems) : null].filter(Boolean)} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-6 flex flex-wrap items-center gap-1" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-600">Home</Link>
          <span>/</span>
          <Link href="/flooring-accessories" className="hover:text-amber-600">Flooring Accessories</Link>
          <span>/</span>
          <Link href={`/flooring-accessories${hubAnchor}`} className="hover:text-amber-600">{categoryLabel}</Link>
          <span>/</span>
          <span className="text-slate-700">{family.name}</span>
        </nav>

        {/* Hero — image, title, picker, price, availability, buy box (client) */}
        <SupplyFamilyBuyBox family={family} initialCode={item.code} works={works} />

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
                {family.isMulti && (
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-slate-600">{family.picker} options</td>
                    <td className="px-4 py-2.5 text-slate-800">{family.items.map((i) => i.variantLabel || i.pack_size || i.code).join(' · ')}</td>
                  </tr>
                )}
                <tr className={family.isMulti ? 'bg-slate-50' : ''}>
                  <td className="px-4 py-2.5 font-medium text-slate-600">Unit sold</td>
                  <td className="px-4 py-2.5 text-slate-800">{item.pack_size || item.unit}{family.isMulti ? ` (${item.variantLabel || item.code})` : ''}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-600">Availability</td>
                  <td className="px-4 py-2.5 text-slate-800">{stockInfo(item.stockTier).label}</td>
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

        {/* Documents & Downloads (Docs P3) — the TDS/SDS installers actually ask for */}
        {documents.length > 0 && (
          <DocumentsDownloads documents={documents} brand={family.brand} subject={family.name} className="mt-14" />
        )}

        {/* How to use */}
        {steps.length > 0 && (
          <section className="mt-14 max-w-3xl">
            <h2 className="text-xl font-bold text-slate-900">How to use {family.name}</h2>
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
                  key={r.slug}
                  href={familyUrl(r)}
                  className="rounded-xl border border-slate-200 p-3 hover:border-amber-400 transition-colors"
                >
                  <div className="aspect-square rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden">
                    {r.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image} alt={r.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-800 leading-snug line-clamp-2">{r.name}</div>
                  {r.priceLow != null && (
                    <div className="mt-1 text-sm font-bold text-slate-900">
                      {r.isMulti && r.priceLow !== r.priceHigh ? `from $${r.priceLow.toFixed(2)}` : `$${r.priceLow.toFixed(2)}`}
                    </div>
                  )}
                  {r.isMulti && <div className="text-[11px] text-slate-500">{r.items.length} options</div>}
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
