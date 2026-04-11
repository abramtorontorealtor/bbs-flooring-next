'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPageUrl } from '@/lib/routes';
import SaveButton from './SaveButton';
import { useAuth } from '@/lib/auth-context';

/* Inline SVGs — avoids importing entire lucide-react */
function MapPinIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>;
}

function getProductBadges(product) {
  const badges = [];
  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const isCanadian = !!product.is_canadian;
  if (isCanadian) badges.push({ key: 'canada', label: '🇨🇦 Canadian', className: 'bg-red-600 text-white' });
  const isVinylType = category.includes('vinyl') || name.includes('lvp') || name.includes('spc');
  const isWaterproof = product.is_waterproof || name.includes('waterproof');
  if (isWaterproof && !isVinylType) badges.push({ key: 'waterproof', label: '💧 Waterproof', className: 'bg-blue-600 text-white' });
  const hasDiscount = product.sale_price_per_sqft && product.sale_price_per_sqft < product.price_per_sqft;
  if (product.is_clearance) {
    badges.push({ key: 'clearance', label: 'Clearance', className: 'bg-amber-500 text-white' });
  } else if (hasDiscount) {
    const pct = Math.round((1 - product.sale_price_per_sqft / product.price_per_sqft) * 100);
    badges.push({ key: 'deal', label: pct > 0 ? `-${pct}%` : 'Sale', className: 'bg-red-500 text-white' });
  }
  return badges.slice(0, 2);
}

const FAST_PICKUP_BRANDS = ['wickham', 'appalachian', 'northernest', 'sherwood', 'vidar', 'twelve oaks', 'falcon', 'infiniti'];

const ProductCard = React.forwardRef(({ product, isSaved, user: userProp }, ref) => {
  const isOutOfStock = product.in_stock === false;
  const autoBadges = getProductBadges(product);
  const { user: authUser } = useAuth();
  const user = userProp !== undefined ? userProp : authUser;
  const isFastPickup = product.in_stock !== false && FAST_PICKUP_BRANDS.some(b => (product.brand || '').toLowerCase().includes(b));

  const handleClick = () => {
    sessionStorage.setItem('products_scroll', window.scrollY.toString());
    sessionStorage.setItem('product_referrer', window.location.pathname + window.location.search);
  };

  const getImageUrl = (url) => {
    if (!url) return '/images/product-placeholder.svg';
    return url.split('?')[0];
  };

  const hasSale = product.sale_price_per_sqft && product.price_per_sqft && product.sale_price_per_sqft < product.price_per_sqft;
  const displayPrice = hasSale ? product.sale_price_per_sqft : product.price_per_sqft;

  return (
    <div ref={ref} className="h-full">
      <div className={`group h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-slate-100 ${isOutOfStock ? 'opacity-70' : ''}`}>
        {/* Image — tight ratio, badges overlaid */}
        <Link href={createPageUrl(`ProductDetail?slug=${product.slug || product.sku || product.id}`)} onClick={handleClick} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
            <Image
              src={getImageUrl(product.image_url)}
              alt={product.image_alt_text || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              width={400}
              height={300}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={75}
            />

            {/* Badges — top left */}
            {autoBadges.length > 0 && (
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {autoBadges.map(badge => (
                  <span key={badge.key} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.className}`}>
                    {badge.label}
                  </span>
                ))}
              </div>
            )}

            {/* Status — top right */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
              {isOutOfStock && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-white">Sold Out</span>}
              {product.is_new_arrival && !isOutOfStock && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white">New</span>}
            </div>

            {/* Save button — overlaid bottom right of image */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 sm:block hidden">
              <SaveButton product={product} user={user} isSaved={isSaved} className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-white" />
            </div>

            {/* Quick view overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
          </div>
        </Link>

        {/* Content — tight, price-first */}
        <div className="p-3 pb-3.5 flex-1 flex flex-col min-h-0">
          {/* Brand + Category row */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide truncate">{product.brand || product.subcategory}</span>
            {isFastPickup && (
              <span className="flex items-center gap-0.5 text-[10px] text-green-700 font-semibold whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Fast Pickup
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link href={createPageUrl(`ProductDetail?slug=${product.slug || product.sku || product.id}`)} onClick={handleClick}>
            <h3 className="font-semibold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-2 text-sm leading-tight mb-1.5 min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>

          {/* Price — elevated, immediately after name */}
          <div className="mb-1.5">
            {product.has_variants && product.starting_price ? (
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

          {/* Spec pills — compact, key info only */}
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

          {/* Footer — stock + financing + save */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isOutOfStock ? (
                <span className="text-[10px] text-green-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />In Stock
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-medium">Out of Stock</span>
              )}
              {!isOutOfStock && (displayPrice >= 4 || (product.has_variants && product.starting_price >= 4)) && (
                <span className="text-[10px] text-amber-600 font-medium">💳 Financing</span>
              )}
            </div>
            <div className="sm:hidden">
              <SaveButton product={product} user={user} isSaved={isSaved} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
