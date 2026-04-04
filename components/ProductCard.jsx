'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPageUrl } from '@/lib/routes';
import { MapPin } from 'lucide-react';
import SaveButton from './SaveButton';
import { useAuth } from '@/lib/auth-context';

const CANADIAN_BRANDS = ['wickham', 'appalachian', 'northernest', 'sherwood'];

function getProductBadges(product) {
  const badges = [];
  const name = (product.name || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const isCanadian = product.is_canadian || CANADIAN_BRANDS.some(b => brand.includes(b)) || (product.made_in || '').toLowerCase().includes('canada');
  if (isCanadian) badges.push({ key: 'canada', label: '🇨🇦 Canadian Made', className: 'bg-red-600 text-white' });
  const isWaterproof = product.is_waterproof || category.includes('vinyl') || name.includes('lvp') || name.includes('spc') || name.includes('waterproof');
  if (isWaterproof) badges.push({ key: 'waterproof', label: '💧 Waterproof', className: 'bg-blue-600 text-white' });
  const hasDiscount = product.sale_price_per_sqft && product.sale_price_per_sqft < product.price_per_sqft;
  if (hasDiscount) badges.push({ key: 'deal', label: '🔥 Hot Deal', className: 'bg-orange-500 text-white' });
  return badges;
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
    if (!url) return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop';
    return url.split('?')[0];
  };

  return (
    <div ref={ref} className="h-full transform hover:-translate-y-1 transition-transform duration-300">
      <div className={`group h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 ${isOutOfStock ? 'opacity-75' : ''}`}>
        <Link href={createPageUrl(`ProductDetail?slug=${product.slug || product.sku || product.id}`)} onClick={handleClick} className="block">
          <div className="relative aspect-square overflow-hidden bg-slate-50">
            <Image src={getImageUrl(product.image_url)} alt={product.image_alt_text || product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={400} height={400} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" quality={75} />
            {autoBadges.length > 0 && (
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {autoBadges.map(badge => <span key={badge.key} className={`text-xs font-semibold px-2 py-1 rounded-full shadow-sm ${badge.className}`}>{badge.label}</span>)}
              </div>
            )}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
              {isOutOfStock && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-700 text-white">Out of Stock</span>}
              {product.is_new_arrival && !isOutOfStock && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-500 text-white">New Arrival</span>}
              {product.is_clearance && !isOutOfStock && (
                <>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-500 text-white">Clearance</span>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-600 text-white animate-pulse">Limited Stock</span>
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center pointer-events-none">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-slate-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg">View Details</span>
            </div>
          </div>
        </Link>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500 uppercase tracking-wider">{product.brand || product.subcategory}</span>
            {product.category && <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{product.category.replace(/_/g, ' ')}</span>}
          </div>
          <Link href={createPageUrl(`ProductDetail?slug=${product.slug || product.sku || product.id}`)} onClick={handleClick}>
            <h3 className="font-semibold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-3 min-h-[48px] text-sm">{product.name}</h3>
          </Link>
          <div className="mt-2">
            {product.has_variants && product.starting_price ? (
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs text-slate-500 font-medium">From</span>
                <span className="text-lg font-bold text-slate-900 ml-1">C${product.starting_price.toFixed(2)}</span>
                <span className="text-xs text-slate-500">/sqft</span>
              </div>
            ) : (
              <>
                {(() => {
                  if (product.is_clearance && product.public_price) {
                    return (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-slate-400 line-through">C${parseFloat(product.public_price).toFixed(2)}</span>
                          <span className="text-xl font-bold text-red-600">C${parseFloat(product.price_per_sqft).toFixed(2)}</span>
                          <span className="text-xs text-slate-500">/sqft</span>
                        </div>
                      </div>
                    );
                  }
                  if (product.sale_price_per_sqft && product.price_per_sqft && product.sale_price_per_sqft < product.price_per_sqft) {
                    const savings = Math.round((1 - product.sale_price_per_sqft / product.price_per_sqft) * 100);
                    return (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-slate-400 line-through">C${product.price_per_sqft.toFixed(2)}</span>
                          <span className="text-xl font-bold text-red-600">C${product.sale_price_per_sqft.toFixed(2)}</span>
                          <span className="text-xs text-slate-500">/sqft</span>
                        </div>
                        {savings > 0 && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-red-600 bg-red-50">Save {savings}%</span>
                        )}
                      </div>
                    );
                  }
                  if (product.price_per_sqft) {
                    return (
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-xl font-bold text-slate-900">C${parseFloat(product.price_per_sqft).toFixed(2)}</span>
                        <span className="text-xs text-slate-500 ml-0.5">/sqft</span>
                      </div>
                    );
                  }
                  return <span className="text-sm text-slate-500">Contact for Price</span>;
                })()}
              </>
            )}
          </div>
          <Link href={createPageUrl('Financing')} className="block mt-1 text-xs text-slate-400 hover:text-amber-600 transition-colors">💳 Financing available</Link>
          <div className="mt-2 flex items-center gap-1.5">
            {isOutOfStock ? (
              <span className="flex items-center gap-1 text-xs text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />Out of Stock</span>
            ) : isFastPickup ? (
              <span className="flex items-center gap-1 text-xs text-green-700 font-medium"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Fast Pickup</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-green-700 font-medium"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />In Stock</span>
            )}
          </div>
          <div className="flex-grow" />
          {(product.dimensions || product.thickness || product.colour) && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
              {product.dimensions && <div className="flex justify-between items-center text-xs"><span className="text-slate-500">Size:</span><span className="text-slate-700 font-medium truncate ml-2">{product.dimensions}</span></div>}
              {product.thickness && <div className="flex justify-between items-center text-xs"><span className="text-slate-500">Thickness:</span><span className="text-slate-700 font-medium truncate ml-2">{product.thickness}</span></div>}
              {product.colour && <div className="flex justify-between items-center text-xs"><span className="text-slate-500">Colour:</span><span className="text-slate-700 font-medium truncate ml-2">{product.colour}</span></div>}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <Link href={createPageUrl('Contact')} className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-medium transition-colors whitespace-nowrap" onClick={(e) => e.stopPropagation()} title="📍 Available at 6061 Hwy 7, Markham">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              See in Showroom
            </Link>
            <SaveButton product={product} user={user} isSaved={isSaved} />
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
