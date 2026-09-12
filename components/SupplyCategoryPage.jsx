import Link from 'next/link';
import SuppliesShopClient from '@/components/SuppliesShopClient';
import { JsonLd, faqSchema } from '@/lib/schemas';

// ─────────────────────────────────────────────────────────────────────────────
// SupplyCategoryPage — shared server-rendered template for the 5 supplies
// category landing pages (S3, Sep 12 2026). Each page config lives in
// app/flooring-accessories/<slug>/page.jsx; this component just renders it.
// ─────────────────────────────────────────────────────────────────────────────

function breadcrumbSchema(label, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bbsflooring.ca/' },
      { '@type': 'ListItem', position: 2, name: 'Flooring Accessories', item: 'https://bbsflooring.ca/flooring-accessories' },
      { '@type': 'ListItem', position: 3, name: label, item: `https://bbsflooring.ca${path}` },
    ],
  };
}

export default function SupplyCategoryPage({
  path,
  title,
  intro,
  decisionTable,
  section,
  faqItems,
  guideLinks,
}) {
  return (
    <>
      <JsonLd data={[breadcrumbSchema(title, path), faqItems?.length ? faqSchema(faqItems) : null].filter(Boolean)} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/flooring-accessories" className="hover:text-amber-600">Flooring Accessories</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">{title}</span>
        </nav>

        <header className="max-w-3xl">
          <h1 className="text-4xl font-bold text-slate-900">{title}</h1>
          {intro.map((p, i) => (
            <p key={i} className="mt-3 text-slate-600 leading-relaxed">{p}</p>
          ))}
        </header>

        {decisionTable && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">{decisionTable.title}</h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    {decisionTable.headers.map((h) => (
                      <th key={h} className="px-4 py-2.5 font-semibold text-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {decisionTable.rows.map((row, i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-slate-50/60' : ''}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-3 text-slate-700 align-top">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {section.items.length > 0 && (
          <div className="mt-14">
            <SuppliesShopClient sections={[section]} />
          </div>
        )}

        {guideLinks?.length > 0 && (
          <section className="mt-14 rounded-2xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">How-to guides</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {guideLinks.map((g) => (
                <Link key={g.url} href={g.url} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 text-sm font-semibold hover:border-amber-400">
                  {g.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {faqItems?.length > 0 && (
          <section className="mt-14 max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900">FAQ</h2>
            <div className="mt-6 space-y-6">
              {faqItems.map((f) => (
                <div key={f.question}>
                  <h3 className="font-semibold text-slate-900">{f.question}</h3>
                  <p className="mt-1 text-slate-600 text-sm leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-14 flex flex-wrap gap-3">
          <Link href="/flooring-accessories" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 text-sm font-semibold hover:border-amber-400">All accessories &amp; supplies</Link>
          <Link href="/flooring-accessories/calculator" className="rounded-lg bg-amber-600 px-4 py-2 text-white text-sm font-semibold hover:bg-amber-700">Try the supplies calculator</Link>
        </section>
      </div>
    </>
  );
}
