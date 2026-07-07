import { Suspense } from 'react';
import Link from 'next/link';
import ProductGridServer from '@/components/ProductGridServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { COMMERCIAL_VINYL_FAQS } from '@/data/faqs';
import { getProductsForGrid } from '@/lib/products-server';
import { createPageUrl } from '@/lib/routes';
import Breadcrumbs from '@/components/Breadcrumbs';
import CityLinks from '@/components/CityLinks';

export const revalidate = 300; // 5-minute ISR

const CANONICAL = 'https://bbsflooring.ca/commercial-vinyl-flooring';

export async function generateMetadata() {
  return {
    title: 'Commercial Vinyl Flooring Markham | Loose Lay, Dry Back & Stone-Look Tile from $2.69/sqft',
    description:
      'Commercial-grade NAF vinyl flooring in Markham — AC5 rated, 100% waterproof, FloorScore certified. Loose-lay & glue-down planks plus 18x36 stone-look tile from $2.69/sqft. Contractor pricing + GTA install. Call (647) 428-1111.',
    alternates: { canonical: '/commercial-vinyl-flooring' },
    openGraph: {
      title: 'Commercial Vinyl Flooring Markham | NAF Loose Lay & Dry Back',
      description:
        'AC5-rated, waterproof, FloorScore-certified commercial vinyl. Loose-lay and glue-down planks. Contractor pricing across the GTA.',
      url: CANONICAL,
    },
  };
}

const LINES = [
  {
    title: 'NAF AquaLuuuz 5mm Loose Lay Vinyl',
    price: '3.49',
    install: 'Loose Lay — no adhesive, no click',
    blurb:
      'A 5mm loose-lay plank with a friction-grip backing that lays flat with no glue or click-lock. The contractor favourite for fast installs and easy single-board replacement in retail, office, and rental turnarounds.',
    dims: '5mm × 184mm × 1219mm (7.25" wide) · 19.32 sq.ft/box',
    colours: 'Beijing · Copenhagen · Istanbul · Zurich · Barcelona · New York · Shanghai · Prague',
  },
  {
    title: 'NAF Aqua Commercial 5mm Dry Back Tile (18" × 36")',
    price: '3.49',
    install: 'Glue-Down (pressure-sensitive adhesive)',
    blurb:
      'A large-format 18" × 36" stone-look luxury vinyl tile in realistic marble and concrete visuals. The premium choice for lobbies, reception areas, washrooms, and feature floors that need a designer finish with commercial durability.',
    dims: '5mm × 457mm × 914mm (18" × 36") · 22.5 sq.ft/box',
    colours: 'Cobalt · Graphite · Magnetite · Moonstone · Flint · Ivory · Flintstone',
  },
  {
    title: 'NAF Aqua Commercial 5mm Dry Back Vinyl Plank',
    price: '3.29',
    install: 'Glue-Down (pressure-sensitive adhesive)',
    blurb:
      'A 5mm fiberglass-reinforced dry-back plank for permanent glue-down installation. Maximum dimensional stability for the highest-traffic commercial floors, on, above, or below grade.',
    dims: '5mm × 187mm × 1227mm (7.36" × 48.3") · 19.75 sq.ft/box',
    colours: 'Mars · Pluto · Mercury · Earth · Saturn · Venus',
  },
  {
    title: 'NAF Aqua Commercial 3mm Dry Back Vinyl Plank',
    price: '2.69',
    install: 'Glue-Down (pressure-sensitive adhesive)',
    blurb:
      'A high-yield 3mm dry-back plank with a painted V-groove four-sided micro-bevel. Cost-effective at 34.58 sq.ft per box — the spec-grade choice for large commercial buildouts.',
    dims: '3mm × 187mm × 1227mm (7.36" × 48.3") · 34.58 sq.ft/box',
    colours: 'Landmark · Lego · Ellisdon · Nordstrom · Duca · Aecon · Chevron',
  },
];

// Format comparison — structured for both human scanning and LLM/answer-engine extraction.
const COMPARISON = [
  { format: 'Loose Lay Plank', product: 'AquaLuuuz 5mm', size: '7.25" × 48"', install: 'No adhesive (friction-grip)', best: 'Fast installs, tenant turnovers, phased work', price: '3.49' },
  { format: 'Stone-Look Tile', product: 'Aqua Commercial 5mm Tile', size: '18" × 36"', install: 'Full-spread glue-down', best: 'Lobbies, washrooms, reception, feature floors', price: '3.49' },
  { format: 'Dry Back Plank', product: 'Aqua Commercial 5mm', size: '7.36" × 48.3"', install: 'Full-spread glue-down', best: 'Highest-traffic permanent commercial floors', price: '3.29' },
  { format: 'Dry Back Plank', product: 'Aqua Commercial 3mm', size: '7.36" × 48.3"', install: 'Full-spread glue-down', best: 'Large-area buildouts (34.58 sq.ft/box)', price: '2.69' },
];

const SPOKE_LINKS = [
  { route: 'Vinyl', label: 'All Vinyl Plank Flooring', description: 'Browse our full LVP & SPC vinyl collection — 100+ styles.' },
  { route: 'WaterproofFlooring', label: 'Waterproof Flooring Collection', description: 'Every 100% waterproof option we carry, in one place.' },
  { route: 'FlooringInstallationCost', label: 'Installation Cost Guide', description: 'Glue-down and loose-lay install pricing for the GTA.' },
  { route: 'FreeMeasurement', label: 'Book a Free Measurement', description: 'No-obligation in-home or job-site measurement.' },
];

export default async function CommercialVinylPage() {
  const [planks, tiles] = await Promise.all([
    getProductsForGrid({ subcategory: 'Commercial Vinyl' }),
    getProductsForGrid({ subcategory: 'Luxury Vinyl Tile (LVT)' }),
  ]);
  // Only NAF Aqua Commercial tiles belong on this commercial page (not all LVT).
  const commercialTiles = tiles.filter((p) => /aqua commercial/i.test(p.name || ''));
  const products = [...planks, ...commercialTiles];
  // Curated, finite collection — show every SKU (default grid caps at 24 and would drop tiles).
  const serverGrid = <ProductGridServer products={products} limit={100} />;
  const count = products.length;

  const prices = products.map((p) => Number(p.sale_price_per_sqft || p.price_per_sqft)).filter((n) => n > 0);
  const lowPrice = prices.length ? Math.min(...prices).toFixed(2) : '2.69';
  const highPrice = prices.length ? Math.max(...prices).toFixed(2) : '3.49';

  return (
    <>
      <JsonLd data={[
        faqSchema(COMMERCIAL_VINYL_FAQS),
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Commercial Vinyl Flooring — Loose Lay & Dry Back',
          description:
            'Commercial-grade NAF vinyl flooring: AC5 rated, 100% waterproof, FloorScore certified. Loose-lay and glue-down planks for high-traffic commercial spaces across the GTA.',
          url: CANONICAL,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'NAF Commercial Vinyl Flooring (Loose Lay & Dry Back)',
          description: `${count} AC5-rated, 100% waterproof, FloorScore-certified commercial vinyl plank options. Loose-lay and glue-down installation. Serving Markham and the Greater Toronto Area.`,
          category: 'Commercial Vinyl Flooring',
          brand: { '@type': 'Brand', name: 'NAF Flooring' },
          additionalProperty: [
            { '@type': 'PropertyValue', name: 'Commercial Wear Rating', value: 'AC5' },
            { '@type': 'PropertyValue', name: 'Acoustic Rating', value: 'IIC 73 / STC 72' },
            { '@type': 'PropertyValue', name: 'Waterproof', value: 'Yes — 100% waterproof' },
            { '@type': 'PropertyValue', name: 'Certification', value: 'FloorScore Certified' },
          ],
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice,
            highPrice,
            offerCount: count || 21,
            availability: 'https://schema.org/InStock',
            url: CANONICAL,
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Commercial Vinyl Flooring Formats',
          description: 'NAF commercial vinyl flooring available at BBS Flooring Markham, by installation format.',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'NAF AquaLuuuz 5mm Loose Lay Vinyl Plank' },
            { '@type': 'ListItem', position: 2, name: 'NAF Aqua Commercial 5mm Dry Back Stone-Look Vinyl Tile (18x36)' },
            { '@type': 'ListItem', position: 3, name: 'NAF Aqua Commercial 5mm Dry Back Vinyl Plank' },
            { '@type': 'ListItem', position: 4, name: 'NAF Aqua Commercial 3mm Dry Back Vinyl Plank' },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bbsflooring.ca/' },
            { '@type': 'ListItem', position: 2, name: 'Vinyl Flooring', item: 'https://bbsflooring.ca/vinyl' },
            { '@type': 'ListItem', position: 3, name: 'Commercial Vinyl Flooring', item: CANONICAL },
          ],
        },
      ]} />

      <div className="max-w-7xl mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
        <Suspense><Breadcrumbs
          items={[
            { label: 'Home', url: '/' },
            { label: 'Vinyl Flooring', url: '/vinyl' },
            { label: 'Commercial Vinyl', url: '/commercial-vinyl-flooring' },
          ]}
        /></Suspense>

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Commercial Vinyl Flooring in Markham — Loose Lay &amp; Dry Back
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Contractor-grade NAF vinyl built for the toughest jobs — <strong>AC5 rated</strong>,
            <strong> 100% waterproof</strong>, and <strong>FloorScore certified</strong>. Loose-lay planks,
            glue-down planks, and 18&Prime;&times;36&Prime; stone-look tiles from <strong>${lowPrice}/sqft</strong>,
            in stock at our Markham showroom and installed across the GTA.
          </p>
        </div>

        {/* ── Citable definition block (optimized for AI answer engines / featured snippets) ── */}
        <div className="mb-10 rounded-2xl bg-slate-50 border border-slate-200 p-6">
          <p className="text-slate-700 leading-relaxed">
            <strong>Commercial vinyl flooring</strong> is heavy-duty luxury vinyl engineered for high-traffic
            business environments — retail stores, offices, restaurants, rental units, clinics, and multi-unit
            buildings. BBS Flooring in Markham stocks the full <strong>NAF commercial vinyl range</strong> in three
            installation formats: <strong>loose-lay planks</strong> (no adhesive, fast to install and replace),
            <strong> glue-down dry-back planks</strong> (permanent, maximum-stability), and large-format
            <strong> 18&Prime;&times;36&Prime; stone-look tiles</strong>. Every option is <strong>AC5 rated</strong>
            (the top commercial wear class), <strong>100% waterproof</strong>, <strong>FloorScore certified</strong>
            for low VOCs, rated for on/above/below grade, and backed by a <strong>15-year residential / 5-year
            light-commercial warranty</strong>. Prices run from <strong>${lowPrice} to ${highPrice}/sqft</strong>
            with contractor and volume pricing available.
          </p>
        </div>

        {/* ── Contractor trust / CTA bar ── */}
        <div className="mb-10 rounded-2xl bg-slate-900 text-white px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🏗️</span>
            <div>
              <p className="font-bold text-lg leading-tight">Contractor &amp; Commercial Pricing</p>
              <p className="text-slate-300 text-sm mt-0.5">Volume pricing, fast availability, professional install across the GTA.</p>
            </div>
          </div>
          <a href="tel:+16474281111" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap">
            Call (647) 428-1111
          </a>
        </div>

        {/* ── The four lines ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {LINES.map((l) => (
            <div key={l.title} className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 mb-1">{l.title}</h2>
              <p className="text-amber-700 font-extrabold text-2xl mb-2">${l.price}<span className="text-sm font-semibold text-slate-500">/sqft</span></p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{l.install}</p>
              <p className="text-slate-700 text-sm leading-relaxed mb-3">{l.blurb}</p>
              <p className="text-slate-500 text-xs mb-2">{l.dims}</p>
              <p className="text-slate-600 text-xs mt-auto"><strong>Colours:</strong> {l.colours}</p>
            </div>
          ))}
        </div>

        {/* ── Format comparison table (human-scannable + LLM-extractable) ── */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-5">Commercial Vinyl Formats Compared</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Format</th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold">Installation</th>
                  <th className="px-4 py-3 font-semibold">Best For</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Price/sqft</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON.map((r) => (
                  <tr key={r.product} className="bg-white hover:bg-amber-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{r.format}</td>
                    <td className="px-4 py-3 text-slate-700">{r.product}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.size}</td>
                    <td className="px-4 py-3 text-slate-600">{r.install}</td>
                    <td className="px-4 py-3 text-slate-600">{r.best}</td>
                    <td className="px-4 py-3 font-bold text-amber-700 whitespace-nowrap">${r.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-2">All formats: NAF · 5mm · AC5 · 20mil wear layer · 100% waterproof · FloorScore certified · 15yr residential / 5yr light-commercial warranty.</p>
        </div>

        {/* ── Product grid ── */}
        <h2 className="text-2xl font-bold text-slate-800 mb-5">Shop All Commercial Vinyl ({count})</h2>
        <div id="shop" className="scroll-mt-24 mb-14">
          <Suspense fallback={serverGrid}>{serverGrid}</Suspense>
        </div>

        {/* ── Why contractors choose it ── */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">🛡️ Built for Commercial Traffic</h2>
            <ul className="text-slate-700 text-sm space-y-1">
              <li>✅ AC5 commercial wear rating — the top durability class</li>
              <li>✅ 20mil (0.5mm) wear layer</li>
              <li>✅ IIC 73 / STC 72 acoustic ratings — quiet underfoot, sound-rated for multi-unit</li>
              <li>✅ FloorScore certified — low VOC, safe for occupied spaces</li>
              <li>✅ Rated on, above &amp; below grade — basements to towers</li>
            </ul>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">⚡ Loose Lay vs. Dry Back</h2>
            <p className="text-slate-700 text-sm leading-relaxed mb-2">
              <strong>Loose lay (AquaLuuuz 5mm):</strong> no adhesive, no click — fast to install, easy to lift
              and replace a single board. Ideal for tenant turnovers and phased work.
            </p>
            <p className="text-slate-700 text-sm leading-relaxed">
              <strong>Dry back (Aqua Commercial 3mm &amp; 5mm):</strong> permanent pressure-sensitive glue-down
              for maximum stability in the highest-traffic spaces. The 3mm yields 34.58 sq.ft/box for cost-efficient
              large-area coverage.
            </p>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-3 text-center">
              Commercial Vinyl Flooring — Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-center mb-8">
              Answers for contractors and commercial clients in Markham, Toronto, and Durham.
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {COMMERCIAL_VINYL_FAQS.map((faq, i) => (
                <details key={i} className="group">
                  <summary className="px-6 py-4 cursor-pointer text-left font-semibold text-slate-800 hover:text-amber-600 list-none flex items-center justify-between">
                    {faq.question}
                    <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <div className="px-6 pb-4 text-slate-700 leading-relaxed">{faq.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* ── Spoke links ── */}
        <div className="mt-14 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Explore Related Flooring Pages</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SPOKE_LINKS.map(({ route, label, description }) => (
              <Link key={route} href={createPageUrl(route)} className="group flex items-start gap-3 bg-gradient-to-br from-amber-50 to-slate-50 hover:from-amber-100 hover:to-slate-100 border border-slate-200 hover:border-amber-300 rounded-xl p-5 transition-all">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 group-hover:text-amber-700 mb-1">{label}</h3>
                  <p className="text-sm text-slate-600">{description}</p>
                </div>
                <span className="text-amber-500 mt-1 flex-shrink-0">→</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-10 border-t border-slate-200">
          <CityLinks category="vinyl" productLabel="Commercial Vinyl Flooring" />
        </div>
      </div>
    </>
  );
}
