import Link from 'next/link';
import { getSuppliesCatalog } from '@/lib/suppliesCatalog';
import { CALCULATOR_KEYS } from '@/lib/supplyCalculator';
import SuppliesCalculatorClient from '@/components/SuppliesCalculatorClient';
import { JsonLd } from '@/lib/schemas';

export const revalidate = 600;

export const metadata = {
  title: 'Flooring Supplies Calculator — Adhesive, Underlay & Primer | BBS Flooring',
  description:
    'Pick your floor type, subfloor, and square footage — get the exact adhesive, underlay, primer or moisture barrier kit and quantity you need. Free tool from BBS Flooring, Markham.',
  alternates: { canonical: '/flooring-accessories/calculator' },
};

function breadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bbsflooring.ca/' },
      { '@type': 'ListItem', position: 2, name: 'Flooring Accessories', item: 'https://bbsflooring.ca/flooring-accessories' },
      { '@type': 'ListItem', position: 3, name: 'Supplies Calculator', item: 'https://bbsflooring.ca/flooring-accessories/calculator' },
    ],
  };
}

export default async function SuppliesCalculatorPage() {
  const catalog = await getSuppliesCatalog();

  return (
    <>
      <JsonLd data={breadcrumbSchema()} />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/flooring-accessories" className="hover:text-amber-600">Flooring Accessories</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">Supplies Calculator</span>
        </nav>

        <header>
          <h1 className="text-3xl font-bold text-slate-900">Flooring Supplies Calculator</h1>
          <p className="mt-2 text-slate-600">
            Tell us your floor type, subfloor, and square footage — we\u2019ll size the exact adhesive, underlay,
            primer, or moisture barrier kit you need, no guessing or over-ordering.
          </p>
        </header>

        <div className="mt-8">
          <SuppliesCalculatorClient catalog={{ byKey: Object.fromEntries(CALCULATOR_KEYS.filter((k) => catalog.byKey[k]).map((k) => [k, catalog.byKey[k]])), source: catalog.source }} />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/flooring-accessories" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 text-sm font-semibold hover:border-amber-400">All accessories &amp; supplies</Link>
          <Link href="/contact" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 text-sm font-semibold hover:border-amber-400">Not sure? Ask us</Link>
        </div>
      </div>
    </>
  );
}
