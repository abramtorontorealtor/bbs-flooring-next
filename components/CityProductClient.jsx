'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Calculator, Phone, ChevronRight, CheckCircle2, Star, Hammer, Layers, Home, ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductCard from '@/components/ProductCard';

// ── Icon map ─────────────────────────────────────────────────────────────────
const iconMap = { Hammer, Layers, Home };

export default function CityProductClient({ pageData, productType, initialProducts, priceStats, serverGrid, slug }) {
  const {
    city,
    h1,
    heroSubtitle,
    content,
    neighbourhoods,
    faqs,
    relatedPages,
    nearbyPages,
    isInstallationPage,
  } = pageData;

  // Select 8 featured products
  const featuredProducts = useMemo(() => {
    const available = (initialProducts || []).filter(p => p.in_stock !== false);
    return available.slice(0, 8);
  }, [initialProducts]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', url: '/' },
  ];
  if (!isInstallationPage) {
    breadcrumbItems.push({ label: productType.label, url: productType.categoryPage });
  } else {
    breadcrumbItems.push({ label: 'Installation', url: '/installation' });
  }
  breadcrumbItems.push({ label: city });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <Breadcrumbs items={breadcrumbItems} />

      {/* ════ HERO SECTION ════ */}
      <div className="mb-12 md:mb-16">
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-full mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">Serving {city} &amp; Area</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4 md:mb-6">
          {h1}
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mb-6 md:mb-8">
          {heroSubtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <Link href={`/quote-calculator?city=${encodeURIComponent(city)}`}>
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white gap-2 w-full sm:w-auto">
              <Calculator className="w-5 h-5" />
              Get a Free Quote
            </Button>
          </Link>
          <a href="tel:6474281111">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Phone className="w-5 h-5" />
              (647) 428-1111
            </Button>
          </a>
        </div>
      </div>

      {/* ════ TRUST BAR ════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 md:mb-16">
        {[
          { label: 'Products In Stock', value: `${priceStats.count}+` },
          { label: 'Starting From', value: `$${priceStats.lowPrice}/sqft` },
          { label: 'Google Rating', value: '4.7★' },
          { label: 'Serving Since', value: '2012' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{item.value}</div>
            <div className="text-sm text-slate-500">{item.label}</div>
          </div>
        ))}
      </div>

      {/* ════ INTRO CONTENT ════ */}
      <div className="prose prose-lg prose-slate max-w-none mb-12 md:mb-16">
        <p className="text-lg leading-relaxed text-slate-700">{content.intro}</p>
      </div>

      {/* ════ WHY THIS PRODUCT + LOCAL ════ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-10 mb-12 md:mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
          {isInstallationPage
            ? `Why ${city} Homeowners Choose BBS Flooring`
            : `Why ${city} Homeowners Choose ${productType.shortLabel}`
          }
        </h2>
        <div className="prose prose-slate max-w-none mb-8">
          {content.whyVinylHere.split('\n\n').map((para, i) => (
            <p key={i} className="text-slate-600 leading-relaxed mb-4">{para}</p>
          ))}
        </div>

        {/* Features chips (non-install pages) */}
        {!isInstallationPage && productType.features && (
          <div className="flex flex-wrap gap-3 mt-6">
            {productType.features.map((feat, i) => (
              <div key={i} className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                {feat}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════ LOCAL EXPERTISE ════ */}
      <div className="mb-12 md:mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
          {isInstallationPage
            ? `Flooring Installation Across ${city}`
            : `${productType.shortLabel} for Every ${city} Neighbourhood`
          }
        </h2>
        <div className="bg-slate-50 rounded-2xl p-6 md:p-10">
          <div className="prose prose-slate max-w-none">
            {content.localExpertise.split('\n\n').map((para, i) => (
              <div key={i} className="mb-4">
                {para.startsWith('•') || para.startsWith('- ') ? (
                  <div className="text-slate-600 leading-relaxed whitespace-pre-line">{para}</div>
                ) : (
                  <p className="text-slate-600 leading-relaxed">{para}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Neighbourhood tags */}
        {neighbourhoods && neighbourhoods.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Neighbourhoods We Serve in {city}
            </p>
            <div className="flex flex-wrap gap-2">
              {neighbourhoods.map((n, i) => (
                <span key={i} className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full text-sm">
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ════ PRICING SECTION ════ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-10 mb-12 md:mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
          {isInstallationPage
            ? `Flooring Installation Pricing in ${city}`
            : `${productType.shortLabel} Pricing in ${city}`
          }
        </h2>
        <div className="prose prose-slate max-w-none">
          {content.pricingSection.split('\n\n').map((block, i) => {
            // Render markdown-style tables
            if (block.includes('|') && block.includes('---')) {
              const lines = block.split('\n').filter(l => l.trim());
              const headers = lines[0].split('|').filter(c => c.trim()).map(c => c.trim());
              const rows = lines.slice(2).map(l => l.split('|').filter(c => c.trim()).map(c => c.trim()));
              return (
                <div key={i} className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {headers.map((h, j) => (
                          <th key={j} className="text-left py-3 px-4 font-semibold text-slate-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, j) => (
                        <tr key={j} className="border-b border-slate-100">
                          {row.map((cell, k) => (
                            <td key={k} className={`py-3 px-4 ${k === 1 ? 'font-semibold text-amber-600' : 'text-slate-600'}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
            return <p key={i} className="text-slate-600 leading-relaxed mb-4">{block}</p>;
          })}
        </div>

        {/* CTA within pricing */}
        <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Link href={`/quote-calculator?city=${encodeURIComponent(city)}`}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
              <Calculator className="w-4 h-4" />
              Get Your Free Quote
            </Button>
          </Link>
          <span className="text-sm text-slate-500">No obligation — we'll come to your {city} home</span>
        </div>
      </div>

      {/* ════ FEATURED PRODUCTS ════ */}
      <div className="mb-12 md:mb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              {isInstallationPage
                ? `Popular Flooring in ${city}`
                : `${productType.shortLabel} Popular in ${city}`
              }
            </h2>
            <p className="text-slate-500 mt-1">
              From ${priceStats.lowPrice}/sqft — browse our full selection online
            </p>
          </div>
          <Link
            href={isInstallationPage ? '/products' : productType.categoryPage}
            className="hidden md:inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          serverGrid
        )}

        <div className="mt-6 text-center md:hidden">
          <Link href={isInstallationPage ? '/products' : productType.categoryPage}>
            <Button variant="outline" className="gap-2">
              View All {isInstallationPage ? 'Products' : productType.shortLabel} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ════ BEST FOR SECTION (non-install) ════ */}
      {!isInstallationPage && productType.bestFor && (
        <div className="bg-amber-50 rounded-2xl p-6 md:p-10 mb-12 md:mb-16">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Best Rooms for {productType.shortLabel} in {city} Homes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {productType.bestFor.map((room, i) => (
              <div key={i} className="bg-white rounded-xl p-4 text-center border border-amber-200">
                <CheckCircle2 className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-slate-700">{room}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════ FAQ SECTION ════ */}
      {faqs && faqs.length > 0 && (
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            {isInstallationPage
              ? `Flooring Installation FAQ — ${city}`
              : `${productType.shortLabel} FAQ — ${city}`
            }
          </h2>
          <p className="text-slate-500 mb-6">Common questions from {city} homeowners</p>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-slate-800 font-medium hover:text-amber-600">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      )}

      {/* ════ CTA BANNER ════ */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-8 md:p-12 text-center text-white mb-12 md:mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to Transform Your {city} Home?
        </h2>
        <p className="text-lg mb-6 opacity-90">
          {isInstallationPage
            ? `Get a free in-home estimate for professional flooring installation in ${city}`
            : `Get a free quote on ${productType.shortLabel.toLowerCase()} for your ${city} home`
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/quote-calculator?city=${encodeURIComponent(city)}`}>
            <Button size="lg" className="bg-white text-amber-600 hover:bg-slate-50 w-full sm:w-auto">
              Get Your Free Quote
            </Button>
          </Link>
          <a href="tel:6474281111">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
              <Phone className="w-5 h-5 mr-2" />
              (647) 428-1111
            </Button>
          </a>
        </div>
      </div>

      {/* ════ INTERNAL LINKS ════ */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Related pages */}
        {relatedPages && relatedPages.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Related Pages</h3>
            <div className="space-y-2">
              {relatedPages.map((p, i) => (
                <Link
                  key={i}
                  href={p.url}
                  className="flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors py-1"
                >
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Nearby city pages */}
        {nearbyPages && nearbyPages.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Nearby Areas</h3>
            <div className="space-y-2">
              {nearbyPages.map((p, i) => (
                <Link
                  key={i}
                  href={p.url}
                  className="flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors py-1"
                >
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ════ ALL SERVICE AREAS FOOTER ════ */}
      <div className="pt-8 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          All {isInstallationPage ? 'Installation' : productType.shortLabel} Service Areas
        </h3>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          {['markham', 'toronto', 'scarborough', 'vaughan', 'richmond-hill', 'newmarket', 'aurora', 'pickering', 'ajax', 'whitby', 'oshawa', 'stouffville', 'woodbridge', 'durham'].map(c => {
            const cityName = c.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            const productSlug = isInstallationPage ? 'flooring-installation' : `${pageData.productType}-flooring`;
            const linkSlug = `${productSlug}-${c}`;
            const isCurrent = linkSlug === slug;
            return (
              <span key={c}>
                {isCurrent ? (
                  <span className="text-amber-600 font-medium">{cityName}</span>
                ) : (
                  <Link href={`/${linkSlug}`} className="hover:text-amber-600 transition-colors">
                    {cityName}
                  </Link>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
