import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPageUrl } from '@/lib/routes';
import { callUrl, smsUrl, whatsappUrl } from '@/lib/contact';

/* ── Static Product Card (Server Component) ──
 * Renders as real HTML in the server response — zero JS, zero hydration.
 * Used by ProductGridServer for initial page load. The interactive version
 * (ProductCard) takes over after client hydration.
 *
 * Intentionally omits: SaveButton, useAuth, sessionStorage, GA click tracking.
 * These are progressive enhancements added by the client grid.
 */

const FAST_PICKUP_BRANDS = ['wickham', 'appalachian', 'northernest', 'sherwood', 'vidar', 'twelve oaks', 'falcon', 'infiniti'];

function getProductBadges(product) {
  const badges = [];
  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  if (product.is_canadian) badges.push({ key: 'canada', label: '🇨🇦 Canadian', className: 'bg-red-600 text-white' });
  const isVinylType = category.includes('vinyl') || name.includes('lvp') || name.includes('spc');
  const isWaterproof = product.is_waterproof || name.includes('waterproof');
  if (isWaterproof && !isVinylType) badges.push({ key: 'waterproof', label: '💧 Waterproof', className: 'bg-blue-600 text-white' });
  // Only show price-related badges when price is visible
  if (!product.hide_price) {
    const hasDiscount = product.sale_price_per_sqft && product.sale_price_per_sqft < product.price_per_sqft;
    if (product.is_clearance) {
      badges.push({ key: 'clearance', label: 'Clearance', className: 'bg-amber-500 text-white' });
    } else if (hasDiscount) {
      const pct = Math.round((1 - product.sale_price_per_sqft / product.price_per_sqft) * 100);
      badges.push({ key: 'deal', label: pct > 0 ? `-${pct}%` : 'Sale', className: 'bg-red-500 text-white' });
    }
  }
  return badges.slice(0, 2);
}

function getImageUrl(url) {
  if (!url) return '/images/product-placeholder.svg';
  return url.split('?')[0];
}

export default function ProductCardStatic({ product, priority = false }) {
  const isOutOfStock = product.in_stock === false;
  const autoBadges = getProductBadges(product);
  const isFastPickup = product.in_stock !== false && FAST_PICKUP_BRANDS.some(b => (product.brand || '').toLowerCase().includes(b));
  const hidePrice = product.hide_price === true;
  const hasSale = !hidePrice && product.sale_price_per_sqft && product.price_per_sqft && product.sale_price_per_sqft < product.price_per_sqft;
  const displayPrice = hasSale ? product.sale_price_per_sqft : product.price_per_sqft;
  const href = createPageUrl(`ProductDetail?slug=${product.slug || product.sku || product.id}`);

  return (
    <div className="h-full">
      <div className={`group h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-slate-100 ${isOutOfStock ? 'opacity-70' : ''}`}>
        {/* Image */}
        <Link href={href} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
            <Image
              src={getImageUrl(product.image_url)}
              alt={product.image_alt_text || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              {...(priority ? { priority: true } : { loading: 'lazy' })}
              width={400}
              height={300}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={75}
            />

            {autoBadges.length > 0 && (
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {autoBadges.map(badge => (
                  <span key={badge.key} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.className}`}>
                    {badge.label}
                  </span>
                ))}
              </div>
            )}

            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
              {isOutOfStock && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-white">Sold Out</span>}
              {product.is_new_arrival && !isOutOfStock && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white">New</span>}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
          </div>
        </Link>

        {/* Content */}
        <div className="p-3 pb-3.5 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide truncate">{product.brand || product.subcategory}</span>
            {isFastPickup && (
              <span className="flex items-center gap-0.5 text-[10px] text-green-700 font-semibold whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Fast Pickup
              </span>
            )}
          </div>

          <Link href={href}>
            <h3 className="font-semibold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-2 text-sm leading-tight mb-1.5 min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>

          <div className="mb-1.5">
            {hidePrice ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-amber-600">Call for Pricing</span>
                <div className="flex gap-1 ml-auto">
                  <a href={callUrl()} aria-label="Call us"
                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.77-.77a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17.2z"/></svg>
                  </a>
                  <a href={smsUrl(product.name)} aria-label="Text us"
                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </a>
                  <a href={whatsappUrl(product.name)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                    className="w-6 h-6 rounded-md bg-[#25D366]/15 hover:bg-[#25D366]/25 flex items-center justify-center transition-colors">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#128C7E]" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </a>
                </div>
              </div>
            ) : product.has_variants && product.starting_price ? (
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-[11px] text-slate-500">From</span>
                <span className="text-lg font-bold text-slate-900">C${product.starting_price.toFixed(2)}</span>
                <span className="text-[11px] text-slate-400">/sqft</span>
                {product.variant_count > 1 && (
                  <span className="text-[10px] text-amber-700 font-medium ml-auto">{product.variant_count} options</span>
                )}
              </div>
            ) : hasSale ? (
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-red-600">C${parseFloat(product.sale_price_per_sqft).toFixed(2)}</span>
                  <span className="text-xs text-slate-400 line-through">C${parseFloat(product.price_per_sqft).toFixed(2)}</span>
                  <span className="text-[11px] text-slate-400">/sqft</span>
                </div>
              </div>
            ) : product.price_per_sqft ? (
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold text-slate-900">C${parseFloat(product.price_per_sqft).toFixed(2)}</span>
                <span className="text-[11px] text-slate-400">/sqft</span>
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-500">Call for Pricing</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mt-auto">
            {product.category && (
              <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                {product.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            )}
            {product.colour && (
              <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                {product.colour}
              </span>
            )}
            {product.thickness && (
              <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                {product.thickness}
              </span>
            )}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isOutOfStock ? (
                <span className="text-[10px] text-green-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />In Stock
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-medium">Out of Stock</span>
              )}
              {!hidePrice && !isOutOfStock && (displayPrice >= 4 || (product.has_variants && product.starting_price >= 4)) && (
                <span className="text-[10px] text-amber-600 font-medium">💳 Financing</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
