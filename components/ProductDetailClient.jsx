'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ShoppingCart, ArrowLeft, Calculator, Package, Check, Info, Phone, Truck, Shield, X, Star, Award, Clock, CheckCircle2 } from 'lucide-react';
import VariantSelector from '@/components/VariantSelector';
import SaveButton from '@/components/SaveButton';
import { toast } from 'sonner';
import ProductCard from '@/components/ProductCard';
import FAQSection from '@/components/FAQSection';
import StickyAddToCart from '@/components/StickyAddToCart';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getProductBreadcrumbs } from '@/lib/breadcrumbs';
import { generateProductSchema, generateProductMetaTags } from '@/lib/seo';
import { Analytics } from '@/components/analytics';
import QuoteProductCTA from '@/components/QuoteProductCTA';
import RecentlyViewed, { recordProductView } from '@/components/RecentlyViewed';
import TransitionPieces from '@/components/TransitionPieces';
import SqftCalculator from '@/components/SqftCalculator';
import { useAuth } from '@/lib/auth-context';
import { getMonthlyPayment, FINANCEIT_LINKS } from '@/lib/financing';

export default function ProductDetailClient({ slug, initialProduct = null }) {
  const router = useRouter();
  const { user: currentUser, isLoadingAuth } = useAuth();
  const authResolved = !isLoadingAuth;

  const [sqftNeeded, setSqftNeeded] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedVariantSku, setSelectedVariantSku] = useState(null);
  const [selectedJsonVariant, setSelectedJsonVariant] = useState(null);
  const [buyMode, setBuyMode] = useState('material');
  const [stickyCartVisible, setStickyCartVisible] = useState(false);
  const [variantSort, setVariantSort] = useState({ key: null, asc: true });
  const [pdpSessionId, setPdpSessionId] = useState(null);
  const buyBoxRef = useRef(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const results = await entities.Product.filter({ slug });
      if (results.length > 0) return results;
      const lcResults = await entities.Product.filter({ slug: slug.toLowerCase() });
      if (lcResults.length > 0) return lcResults;
      throw new Error('PRODUCT_NOT_FOUND');
    },
    select: (data) => data[0],
    enabled: !!slug && authResolved,
    retry: 4,
    retryDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt), 5000),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // Use server-fetched product as initial data to avoid loading flash
    ...(initialProduct ? { initialData: [initialProduct], placeholderData: [initialProduct] } : {}),
  });

  // Fetch variants if parent product
  const { data: productVariants = [] } = useQuery({
    queryKey: ['product-variants', product?.sku],
    queryFn: () => entities.Product.filter({ parent_product_id: product.sku }),
    enabled: !!product?.is_parent_product,
  });

  // Parse variants from specifications
  const variants = useMemo(() => {
    if (!product?.specifications) return null;
    try {
      const specs = JSON.parse(product.specifications);
      return specs.variants || null;
    } catch { return null; }
  }, [product?.specifications]);

  useEffect(() => {
    if (variants && !selectedVariant) setSelectedVariant(variants[0]);
  }, [variants, selectedVariant]);

  useEffect(() => {
    setPdpSessionId(localStorage.getItem('bbs_session_id'));
  }, []);

  const isClearance = product?.is_clearance;
  const resolvePrice = (p) => {
    if (!p) return null;
    return p.price_per_sqft;
  };

  const currentPricing = useMemo(() => {
    if (product?.has_variants && selectedJsonVariant) {
      // price_per_sqft is THE selling price. sale_price is the deal price if on_sale.
      const price = selectedJsonVariant.price_per_sqft;
      return {
        price_per_sqft: price,
        sale_price_per_sqft: selectedJsonVariant.on_sale ? selectedJsonVariant.sale_price : null,
        sqft_per_box: selectedJsonVariant.sqft_box,
        dimensions: selectedJsonVariant.dimensions,
        grade: selectedJsonVariant.grade,
        species: product?.species
      };
    }
    if (product?.is_parent_product && selectedVariantSku) {
      const variant = productVariants.find(v => v.sku === selectedVariantSku);
      if (variant) {
        return {
          price_per_sqft: resolvePrice(variant),
          sale_price_per_sqft: variant.sale_price_per_sqft,
          sqft_per_box: variant.sqft_per_box,
          dimensions: variant.dimensions,
          grade: variant.grade,
          species: variant.species
        };
      }
    }
    if (selectedVariant) {
      return {
        price_per_sqft: resolvePrice(selectedVariant),
        sale_price_per_sqft: selectedVariant.sale_price_per_sqft,
        sqft_per_box: selectedVariant.sqft_per_box,
        dimensions: selectedVariant.dimensions,
        grade: selectedVariant.grade,
        species: selectedVariant.species
      };
    }
    return {
      price_per_sqft: resolvePrice(product),
      sale_price_per_sqft: product?.sale_price_per_sqft,
      sqft_per_box: product?.sqft_per_box,
      dimensions: product?.dimensions,
      grade: product?.grade,
      species: product?.species
    };
  }, [selectedJsonVariant, selectedVariant, selectedVariantSku, product, productVariants]);

  const { data: allRelatedProducts = [] } = useQuery({
    queryKey: ['relatedProducts', product?.category],
    queryFn: () => entities.Product.filter({ category: product.category }, { limit: 30, order: '-created_date' }),
    enabled: !!product?.category,
  });

  // Smart related products — scored by species, brand, price proximity
  const relatedProducts = useMemo(() => {
    if (!product || allRelatedProducts.length === 0) return [];
    const candidates = allRelatedProducts.filter(p => p.image_url && p.id !== product.id);
    if (candidates.length === 0) return [];
    const basePrice = product.public_price || product.price_per_sqft || 0;
    const scored = candidates.map(p => {
      let score = 0;
      // Same species = strong match
      if (product.species && p.species && p.species.toLowerCase() === product.species.toLowerCase()) score += 3;
      // Same brand = good match
      if (product.brand && p.brand && p.brand.toLowerCase() === product.brand.toLowerCase()) score += 2;
      // Price within 30% = relevant
      const pPrice = p.public_price || p.price_per_sqft || 0;
      if (basePrice > 0 && pPrice > 0) {
        const diff = Math.abs(pPrice - basePrice) / basePrice;
        if (diff <= 0.15) score += 2;
        else if (diff <= 0.30) score += 1;
      }
      // Same subcategory
      if (product.subcategory && p.subcategory && p.subcategory === product.subcategory) score += 1;
      // Has image and price = quality listing
      if (p.image_url && pPrice > 0) score += 1;
      return { ...p, _score: score };
    });
    scored.sort((a, b) => b._score - a._score);
    return scored.slice(0, 4);
  }, [product, allRelatedProducts]);

  // Record product view for "Recently Viewed"
  useEffect(() => {
    if (product?.id) recordProductView(product);
  }, [product?.id]);

  // Sticky CTA after buy box scrolls out
  useEffect(() => {
    if (!buyBoxRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyCartVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(buyBoxRef.current);
    return () => observer.disconnect();
  }, [product]);

  const calculation = useMemo(() => {
    if (!currentPricing || !sqftNeeded || parseFloat(sqftNeeded) <= 0) return null;
    const sqft = parseFloat(sqftNeeded);
    const sqftPerBox = currentPricing.sqft_per_box || 20;
    const boxesRequired = Math.ceil(sqft / sqftPerBox);
    const actualSqft = boxesRequired * sqftPerBox;
    const pricePerSqft = currentPricing.price_per_sqft;
    const lineTotal = actualSqft * pricePerSqft;
    return { sqftNeeded: sqft, sqftPerBox, boxesRequired, actualSqft, pricePerSqft, lineTotal, extraSqft: actualSqft - sqft };
  }, [currentPricing, sqftNeeded]);

  const breadcrumbItems = useMemo(() => getProductBreadcrumbs(product), [product]);

  // Inject JSON-LD
  useEffect(() => {
    if (!product) return;
    const displayedPrice = resolvePrice(product) || 0;
    Analytics.trackProductView(product.name);
    Analytics.trackViewItem(product, displayedPrice);
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', {
        content_name: product.name, content_category: product.category,
        content_ids: [product.sku || product.id], content_type: 'product',
        value: displayedPrice, currency: 'CAD'
      });
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (product.has_variants && !selectedJsonVariant) {
      toast.error('Please select a variant option');
      return;
    }
    if (product.is_parent_product && !product.has_variants && !selectedVariantSku) {
      toast.error('Please select a width and grade option from the table');
      return;
    }
    if (!calculation) {
      toast.error('Please enter the square footage you need');
      return;
    }
    setIsAddingToCart(true);
    try {
      let sessionId = localStorage.getItem('bbs_session_id');
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('bbs_session_id', sessionId);
      }
      if (product.has_variants && selectedJsonVariant) {
        await entities.CartItem.create({
          session_id: sessionId, product_id: product.id, product_name: product.name,
          variant_label: selectedJsonVariant.label || null, sku: selectedJsonVariant.sku,
          sqft_needed: calculation.sqftNeeded, sqft_per_box: selectedJsonVariant.sqft_box,
          boxes_required: calculation.boxesRequired, actual_sqft: calculation.actualSqft,
          price_per_sqft: selectedJsonVariant.member_price ?? selectedJsonVariant.public_price ?? selectedJsonVariant.price_per_sqft,
          line_total: calculation.lineTotal, image_url: product.image_url,
        });
        window.dispatchEvent(new Event('cartUpdated'));
        setIsAddingToCart(false);
        toast.success('Added to cart!');
        setSqftNeeded('');
        if (window.gtag) window.gtag('event', 'add_to_cart', { currency: 'CAD', value: calculation.lineTotal, items: [{ item_id: product.id, item_name: product.name, price: calculation.pricePerSqft, quantity: calculation.actualSqft }] });
        if (typeof window.fbq === 'function') window.fbq('track', 'AddToCart', { content_name: product.name, content_ids: [product.sku || product.id], content_type: 'product', value: calculation.lineTotal, currency: 'CAD' });
        Analytics.trackAddToCart(product.name, calculation.lineTotal);
        return;
      }
      let productToAdd = product;
      if (product.is_parent_product && selectedVariantSku) {
        productToAdd = productVariants.find(v => v.sku === selectedVariantSku);
        if (!productToAdd) { toast.error('Selected variant not found'); setIsAddingToCart(false); return; }
      }
      await entities.CartItem.create({
        session_id: sessionId, product_id: productToAdd.id,
        product_name: selectedVariant ? `${product.name} (${selectedVariant.dimensions}, ${selectedVariant.grade})` : productToAdd.name,
        sku: productToAdd.sku, sqft_needed: calculation.sqftNeeded, sqft_per_box: calculation.sqftPerBox,
        boxes_required: calculation.boxesRequired, actual_sqft: calculation.actualSqft,
        price_per_sqft: calculation.pricePerSqft, line_total: calculation.lineTotal,
        image_url: productToAdd.image_url,
      });
      window.dispatchEvent(new Event('cartUpdated'));
      setIsAddingToCart(false);
      toast.success('Added to cart!');
      setSqftNeeded('');
      setSelectedVariantSku(null);
      if (window.gtag) window.gtag('event', 'add_to_cart', { currency: 'CAD', value: calculation.lineTotal, items: [{ item_id: productToAdd.id, item_name: productToAdd.name, price: calculation.pricePerSqft, quantity: calculation.actualSqft }] });
      if (typeof window.fbq === 'function') window.fbq('track', 'AddToCart', { content_name: productToAdd.name, content_ids: [productToAdd.sku || productToAdd.id], content_type: 'product', value: calculation.lineTotal, currency: 'CAD' });
      Analytics.trackAddToCart(productToAdd.name, calculation.lineTotal);
    } catch {
      setIsAddingToCart(false);
      toast.error('Failed to add to cart');
    }
  };

  const buildInstallQuoteUrl = () => {
    const params = new URLSearchParams({ product_id: product.id });
    if (sqftNeeded) params.set('sqft', sqftNeeded);
    try {
      const saved = JSON.parse(localStorage.getItem('bbs_quote_project') || '{}');
      if (saved.removal_type && saved.removal_type !== 'none') params.set('removal_type', saved.removal_type);
      if (saved.needs_baseboards) params.set('needs_baseboards', 'true');
      if (saved.needs_shoe_moulding) params.set('needs_shoe_moulding', 'true');
    } catch {}
    return `/quote-calculator?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-100 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-100 rounded w-1/4 animate-pulse" />
            <div className="h-12 bg-slate-100 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-slate-100 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Product not found</h1>
        <p className="text-slate-600 mb-6">This product may have been removed or the link may be incorrect.</p>
        <Link href="/products"><Button className="bg-amber-500 hover:bg-amber-600">Browse All Products</Button></Link>
      </div>
    );
  }

  const hasDiscount = currentPricing.sale_price_per_sqft && currentPricing.sale_price_per_sqft < currentPricing.price_per_sqft;
  const displayPrice = hasDiscount ? currentPricing.sale_price_per_sqft : currentPricing.price_per_sqft;
  const isOutOfStock = product.in_stock === false;

  // Product JSON-LD
  const productSchema = generateProductSchema(product);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      {/* Back Link */}
      <Link
        href={(() => { if (typeof window !== 'undefined') { const referrer = sessionStorage.getItem('product_referrer'); if (referrer) return referrer; } return '/products'; })()}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-amber-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      {breadcrumbItems.length > 0 && <Breadcrumbs items={breadcrumbItems} />}

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="animate-fade-in-up">
          <div className="sticky top-32">
            <div
              className="aspect-square rounded-3xl overflow-hidden bg-slate-50 shadow-lg cursor-zoom-in relative group"
              onClick={() => setIsImageZoomed(true)}
            >
              <Image
                src={product.image_url ? `https://wsrv.nl/?url=${encodeURIComponent(product.image_url.split('?')[0])}&w=1200&q=80&output=webp` : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop'}
                alt={product.image_alt_text || product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                width={1200}
                height={1200}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click to zoom</span>
              </div>
            </div>
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_new_arrival && <Badge className="bg-emerald-500 text-white border-0">New Arrival</Badge>}
              {product.is_on_sale && <Badge className="bg-red-500 text-white border-0">Sale</Badge>}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {product.brand && <div className="text-sm text-slate-500 font-medium">{product.brand}</div>}
          <h1 className="text-4xl font-bold text-slate-800">{product.name}</h1>

          {product.review_count > 0 && (
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-800">{product.review_rating?.toFixed(1)}</span>
              <span className="text-slate-500 text-sm">({product.review_count} reviews)</span>
            </div>
          )}

          {/* Variant Selector — chip-based for variants_json */}
          {product.has_variants && (
            <VariantSelector product={product} onVariantChange={setSelectedJsonVariant} />
          )}

          {/* Legacy Variant Table */}
          {product.is_parent_product && !product.has_variants && productVariants.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Select Variant</label>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      {[
                        { key: 'dimensions', label: 'Dimensions & Pattern' },
                        { key: 'grade', label: 'Grade' },
                        { key: 'price', label: 'Price' },
                      ].map((col) => (
                        <th
                          key={col.key}
                          className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer hover:text-amber-600 transition-colors select-none"
                          onClick={() => setVariantSort(prev => ({ key: col.key, asc: prev.key === col.key ? !prev.asc : true }))}
                        >
                          {col.label}
                          {variantSort.key === col.key && <span className="ml-1">{variantSort.asc ? '↑' : '↓'}</span>}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Select</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[...productVariants].sort((a, b) => {
                      if (!variantSort.key) return 0;
                      const dir = variantSort.asc ? 1 : -1;
                      if (variantSort.key === 'price') return ((a.sale_price_per_sqft || a.price_per_sqft || 0) - (b.sale_price_per_sqft || b.price_per_sqft || 0)) * dir;
                      const av = (variantSort.key === 'dimensions' ? a.dimensions : a.grade) || '';
                      const bv = (variantSort.key === 'dimensions' ? b.dimensions : b.grade) || '';
                      return av.localeCompare(bv) * dir;
                    }).map((variant) => {
                      let patternType = '';
                      if (variant.name?.toLowerCase().includes('herringbone')) patternType = ' Herringbone';
                      else if (variant.name?.toLowerCase().includes('chevron')) patternType = ' Chevron';
                      else if (variant.name?.toLowerCase().includes('click')) patternType = ' Click';
                      return (
                        <tr key={variant.id} className={`hover:bg-slate-50 transition-colors ${selectedVariantSku === variant.sku ? 'bg-amber-50' : ''}`}>
                          <td className="px-4 py-3 text-sm text-slate-700">{variant.dimensions || 'N/A'}{patternType}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{variant.grade || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm font-semibold">
                            {variant.sale_price_per_sqft ? (
                              <><span className="text-red-600">C${variant.sale_price_per_sqft.toFixed(2)}</span><span className="text-slate-400 line-through ml-2 text-xs">C${variant.price_per_sqft.toFixed(2)}</span></>
                            ) : (
                              <span className="text-slate-800">C${variant.price_per_sqft.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button size="sm" variant={selectedVariantSku === variant.sku ? 'default' : 'outline'} onClick={() => setSelectedVariantSku(variant.sku)} className={selectedVariantSku === variant.sku ? 'bg-amber-500 hover:bg-amber-600' : ''}>
                              {selectedVariantSku === variant.sku ? 'Selected' : 'Select'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Non-parent spec-based variants */}
          {!product.is_parent_product && variants && variants.length > 1 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Select Variant</label>
              <div className="grid gap-2">
                {variants.map((variant) => (
                  <button key={variant.id} onClick={() => setSelectedVariant(variant)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedVariant?.id === variant.id ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-slate-800">{variant.dimensions} - {variant.grade}</div>
                      <div className="text-right">
                        {variant.sale_price_per_sqft && variant.sale_price_per_sqft < variant.price_per_sqft ? (
                          <div><div className="text-lg font-bold text-amber-600">C${variant.sale_price_per_sqft.toFixed(2)}</div><div className="text-xs text-slate-400 line-through">C${variant.price_per_sqft.toFixed(2)}</div></div>
                        ) : (
                          <div className="text-lg font-bold text-slate-900">C${variant.price_per_sqft.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">{variant.sqft_per_box} sq.ft/box</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price — hide for variants_json */}
          {!product.has_variants && (
            <div>
              {isOutOfStock ? (
                <Badge className="bg-slate-700 text-white border-0 text-lg px-4 py-2">Out of Stock</Badge>
              ) : product.price_per_sqft ? (
                <div className="flex items-baseline gap-2">
                  {isClearance && product.public_price ? (
                    <>
                      <span className="text-slate-400 line-through text-lg">C${parseFloat(product.public_price).toFixed(2)}</span>
                      <span className="text-4xl font-bold text-red-600">C${parseFloat(product.price_per_sqft).toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-slate-900">C${parseFloat(product.price_per_sqft).toFixed(2)}</span>
                  )}
                  <span className="text-slate-500 text-sm">/sq.ft</span>
                </div>
              ) : (
                <span className="text-slate-500 text-lg">Contact for Price</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <SaveButton product={product} user={currentUser} />
            {currentUser && <span className="text-sm text-slate-500">Save to Profile</span>}
          </div>

          {/* Financing teaser */}
          {!isOutOfStock && (() => {
            const sampleTotal = Math.round((currentPricing.price_per_sqft || 0) * 500 * 1.13);
            const monthly = getMonthlyPayment(sampleTotal);
            if (!monthly) return null;
            return (
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-amber-400 mb-0.5">💳 Financing Available</p>
                  <p className="text-white font-bold text-base leading-tight">~${monthly}<span className="text-slate-400 text-xs font-normal">/mo</span> for a 500 sqft project</p>
                  <p className="text-slate-400 text-xs mt-0.5">OAC · 13.99% · Max amortization</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <a href={FINANCEIT_LINKS.freeProgram} target="_blank" rel="noopener noreferrer" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap text-center">Apply Now →</a>
                  <Link href="/financing" className="text-slate-300 hover:text-white text-xs text-center transition-colors">See all options</Link>
                </div>
              </div>
            );
          })()}

          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-4">
            {product.brand && <div className="p-3 bg-slate-50 rounded-lg"><div className="text-xs text-slate-500 mb-1">Brand</div><div className="font-semibold text-slate-800">{product.brand}</div></div>}
            {currentPricing.species && <div className="p-3 bg-slate-50 rounded-lg"><div className="text-xs text-slate-500 mb-1">Species</div><div className="font-semibold text-slate-800">{currentPricing.species}</div></div>}
            {product.colour && <div className="p-3 bg-slate-50 rounded-lg"><div className="text-xs text-slate-500 mb-1">Colour</div><div className="font-semibold text-slate-800">{product.colour}</div></div>}
            {currentPricing.dimensions && <div className="p-3 bg-slate-50 rounded-lg"><div className="text-xs text-slate-500 mb-1">Dimensions</div><div className="font-semibold text-slate-800">{currentPricing.dimensions}</div></div>}
            {product.finish && <div className="p-3 bg-slate-50 rounded-lg"><div className="text-xs text-slate-500 mb-1">Finish</div><div className="font-semibold text-slate-800">{product.finish}</div></div>}
            {currentPricing.grade && <div className="p-3 bg-slate-50 rounded-lg"><div className="text-xs text-slate-500 mb-1">Grade</div><div className="font-semibold text-slate-800">{currentPricing.grade}</div></div>}
            <div className="p-3 bg-slate-50 rounded-lg"><div className="text-xs text-slate-500 mb-1">Sq.Ft/Box</div><div className="font-semibold text-slate-800">{currentPricing.sqft_per_box?.toFixed(2)}</div></div>
          </div>

          <QuoteProductCTA productId={product.id} productName={product.name} />

          {/* Buy Box */}
          <Card ref={buyBoxRef} className="border-2 border-amber-200 bg-amber-50/50">
            <CardContent className="p-6">
              <div className="flex rounded-lg overflow-hidden border border-amber-300 mb-5">
                <button onClick={() => setBuyMode('material')} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${buyMode === 'material' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 hover:bg-amber-50'}`}>Material Only</button>
                <button onClick={() => setBuyMode('installation')} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${buyMode === 'installation' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 hover:bg-amber-50'}`}>+ Installation</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    <Calculator className="w-4 h-4 inline mr-1.5 text-amber-500" />
                    Calculate your flooring needs
                  </label>
                  <SqftCalculator
                    variants={product?.has_variants ? (() => { try { return JSON.parse(product.variants_json || '[]'); } catch { return []; } })() : []}
                    currentVariant={selectedJsonVariant}
                    onSqftChange={setSqftNeeded}
                    currentSqft={sqftNeeded}
                  />
                </div>
                {calculation && buyMode === 'material' && (
                  <div className="bg-white rounded-xl p-4 space-y-3 animate-fade-in-up">
                    <div className="flex justify-between text-sm"><span className="text-slate-600">Square footage needed:</span><span className="font-medium">{calculation.sqftNeeded.toFixed(2)} sq.ft</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-600">Sq.ft per box:</span><span className="font-medium">{calculation.sqftPerBox.toFixed(2)} sq.ft</span></div>
                    <Separator />
                    <div className="flex justify-between items-center"><div className="flex items-center gap-2"><Package className="w-5 h-5 text-amber-600" /><span className="font-semibold text-slate-800">Boxes Required:</span></div><span className="text-2xl font-bold text-amber-600">{calculation.boxesRequired}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-600">Actual coverage:</span><span className="font-medium">{calculation.actualSqft.toFixed(2)} sq.ft</span></div>
                    {calculation.extraSqft > 0 && (
                      <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 p-2 rounded-lg"><Info className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>You&apos;ll have {calculation.extraSqft.toFixed(2)} sq.ft extra for cuts and waste</span></div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center text-lg"><span className="font-semibold text-slate-800">Total Price:</span><span className="text-2xl font-bold text-slate-900">C${calculation.lineTotal.toFixed(2)}</span></div>
                  </div>
                )}
                {buyMode === 'installation' && sqftNeeded && (
                  <div className="bg-white rounded-xl p-4 text-sm text-slate-600 space-y-1 animate-fade-in-up">
                    <p className="font-medium text-slate-800">Full installation quote includes:</p>
                    <p>✓ Materials ({sqftNeeded} sq.ft)</p><p>✓ Professional installation</p><p>✓ Old floor removal &amp; disposal</p><p>✓ Delivery to your door</p>
                  </div>
                )}
                {isOutOfStock ? (
                  <div className="w-full bg-slate-100 border-2 border-slate-300 text-slate-600 py-6 text-lg rounded-lg text-center font-semibold">Out of Stock - Coming Soon</div>
                ) : buyMode === 'material' ? (
                  <Button size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 text-lg disabled:bg-slate-400" onClick={handleAddToCart} disabled={!calculation || isAddingToCart}>
                    <ShoppingCart className="mr-2 w-5 h-5" />{isAddingToCart ? 'Adding...' : 'Add to Cart'}
                  </Button>
                ) : (
                  <Link href={buildInstallQuoteUrl()} onClick={() => Analytics.trackQuoteSubmit(product.name)}>
                    <Button size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 text-lg"><Calculator className="mr-2 w-5 h-5" />Get Full Installation Quote</Button>
                  </Link>
                )}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100"><Award className="w-5 h-5 text-emerald-600 mx-auto mb-1" /><span className="text-xs text-emerald-800 font-medium block">Authorized Dealer</span></div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100"><Shield className="w-5 h-5 text-blue-600 mx-auto mb-1" /><span className="text-xs text-blue-800 font-medium block">25+ Year Warranty</span></div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100"><Check className="w-5 h-5 text-amber-600 mx-auto mb-1" /><span className="text-xs text-amber-800 font-medium block">GTA Climate Approved</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Quick Question */}
          <a
            href={`https://wa.me/message/CQQRGZKI3U2VH1?text=${encodeURIComponent(`Hi! I have a question about ${product.name} (SKU: ${product.sku || 'N/A'})`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#25D366] hover:bg-[#1fb855] text-white font-semibold rounded-xl transition-colors"
            onClick={() => Analytics.trackEvent('whatsapp_pdp_click', 'engagement', product.name)}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.106 1.519 5.834L.052 23.579a.5.5 0 00.612.612l5.746-1.467A11.948 11.948 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.903 0-3.72-.504-5.32-1.459l-.382-.227-3.951 1.009 1.009-3.951-.227-.382A9.786 9.786 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818S21.818 6.582 21.818 12s-4.4 9.818-9.818 9.818z"/></svg>
            Quick Question? WhatsApp Us
          </a>

          {/* Request Free Sample CTA */}
          <a
            href={`https://wa.me/message/CQQRGZKI3U2VH1?text=${encodeURIComponent(`Hi! I'd like to request a free sample of ${product.name} (SKU: ${product.sku || 'N/A'}). Can you arrange that?`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl transition-colors border-2 border-slate-200 hover:border-amber-300"
            onClick={() => Analytics.trackEvent('request_sample_click', 'engagement', product.name)}
          >
            <Package className="w-5 h-5 text-amber-500" />
            Request Free Sample
          </a>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-xl border border-slate-100"><Truck className="w-6 h-6 text-amber-500 mx-auto mb-2" /><span className="text-xs text-slate-600">GTA Delivery</span></div>
            <div className="text-center p-4 bg-white rounded-xl border border-slate-100"><Shield className="w-6 h-6 text-amber-500 mx-auto mb-2" /><span className="text-xs text-slate-600">Quality Guaranteed</span></div>
            <div className="text-center p-4 bg-white rounded-xl border border-slate-100"><Phone className="w-6 h-6 text-amber-500 mx-auto mb-2" /><span className="text-xs text-slate-600">Expert Support</span></div>
          </div>
        </div>
      </div>

      {/* Specs Accordion */}
      <div className="mt-12">
        <Accordion type="single" collapsible className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm">
          <AccordionItem value="specs" className="border-b border-slate-200">
            <AccordionTrigger className="px-6 py-4 text-xl font-bold text-slate-800 hover:no-underline">Product Specifications</AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.brand && <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"><span className="text-sm font-medium text-slate-600">Brand:</span><span className="text-sm font-semibold text-slate-800">{product.brand}</span></div>}
                {product.species && <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"><span className="text-sm font-medium text-slate-600">Species:</span><span className="text-sm font-semibold text-slate-800">{product.species}</span></div>}
                {product.colour && <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"><span className="text-sm font-medium text-slate-600">Colour:</span><span className="text-sm font-semibold text-slate-800">{product.colour}</span></div>}
                {currentPricing.sqft_per_box && <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"><span className="text-sm font-medium text-slate-600">Sqft/Box:</span><span className="text-sm font-semibold text-slate-800">{currentPricing.sqft_per_box.toFixed(2)}</span></div>}
                {currentPricing.dimensions && <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"><span className="text-sm font-medium text-slate-600">Dimensions:</span><span className="text-sm font-semibold text-slate-800">{currentPricing.dimensions}</span></div>}
                {product.finish && <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"><span className="text-sm font-medium text-slate-600">Finish:</span><span className="text-sm font-semibold text-slate-800">{product.finish}</span></div>}
                {currentPricing.grade && <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"><span className="text-sm font-medium text-slate-600">Grade:</span><span className="text-sm font-semibold text-slate-800">{currentPricing.grade}</span></div>}
              </div>
            </AccordionContent>
          </AccordionItem>
          {product.product_details && (
            <AccordionItem value="product-details" className="border-b border-slate-200">
              <AccordionTrigger className="px-6 py-4 text-xl font-bold text-slate-800 hover:no-underline">Technical Specifications &amp; Downloads</AccordionTrigger>
              <AccordionContent className="px-6 pb-6"><div className="prose prose-slate max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.product_details }} /></AccordionContent>
            </AccordionItem>
          )}
          {product.product_description && (
            <AccordionItem value="product-description" className="border-0">
              <AccordionTrigger className="px-6 py-4 text-xl font-bold text-slate-800 hover:no-underline">Product Description</AccordionTrigger>
              <AccordionContent className="px-6 pb-6"><div className="prose prose-slate max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.product_description }} /></AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>

      {/* See It In Your Home CTA */}
      <div className="mt-16 bg-gradient-to-r from-amber-50 to-slate-50 rounded-2xl border border-amber-200 p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="text-4xl">🏠</div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-slate-800 mb-1">Want to See This Flooring In Person?</h3>
          <p className="text-slate-600">Book a free in-home measurement and we&apos;ll bring samples right to your door. No obligation — just expert advice and a precise quote.</p>
        </div>
        <Link href="/free-measurement"><Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-8 whitespace-nowrap">📏 Book Free Measurement</Button></Link>
      </div>

      {/* Transition Pieces — for vinyl and laminate products */}
      {product && ['vinyl', 'laminate'].includes(product.category?.toLowerCase()) && (
        <div className="mt-12" id="transition-pieces">
          <TransitionPieces
            product={product}
            sessionId={pdpSessionId}
            onTransitionAdded={() => window.dispatchEvent(new Event('cartUpdated'))}
          />
        </div>
      )}

      {/* Complete Your Project */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Complete Your Project</h2>
        <p className="text-slate-600 mb-6">Everything you need for a hassle-free flooring renovation</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/installation" className="group"><div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-amber-300 hover:shadow-md transition-all"><div className="text-3xl mb-3">🔨</div><h3 className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Professional Installation</h3><p className="text-sm text-slate-500 mt-1">Expert installers serving Markham, Toronto &amp; Durham. We move your furniture.</p></div></Link>
          <Link href="/carpet-removal" className="group"><div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-amber-300 hover:shadow-md transition-all"><div className="text-3xl mb-3">🧹</div><h3 className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Carpet Removal &amp; Disposal</h3><p className="text-sm text-slate-500 mt-1">Old floor tear-out, haul-away, and subfloor prep included.</p></div></Link>
          <Link href="/products?category=baseboards" className="group"><div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-amber-300 hover:shadow-md transition-all"><div className="text-3xl mb-3">📐</div><h3 className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Baseboards &amp; Trim</h3><p className="text-sm text-slate-500 mt-1">Finish the look with matching baseboards and shoe moulding.</p></div></Link>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">You Might Also Like</h2>
          <p className="text-slate-600 mb-8">Smart recommendations based on style, price, and quality match</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* Brand Authority */}
      {product.brand && (
        <div className="mt-16 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {product.brand === 'Vidar' ? (
            <><h2 className="text-2xl font-bold text-slate-800 mb-4">Why Markham Homeowners Choose Vidar Wide Plank</h2><p className="text-slate-600 leading-relaxed">Vidar&apos;s UV-cured oil finish and 3mm dry-sawn wear layer offer superior stability for Southern Ontario&apos;s humid summers and dry winters.</p></>
          ) : product.brand === 'Twelve Oaks' ? (
            <><h2 className="text-2xl font-bold text-slate-800 mb-4">The Twelve Oaks Durability Standard</h2><p className="text-slate-600 leading-relaxed">With FloorScore certification and commercial-grade wear layers, Twelve Oaks is the preferred choice for high-traffic GTA homes.</p></>
          ) : (
            <><h2 className="text-2xl font-bold text-slate-800 mb-4">Premium {product.brand} Flooring</h2><p className="text-slate-600 leading-relaxed">Discover why {product.brand} is a trusted name in flooring, handpicked for quality and performance in the Greater Toronto Area.</p></>
          )}
        </div>
      )}

      {product.category && <FAQSection category={product.category} />}

      {/* Recently Viewed */}
      <RecentlyViewed excludeProductId={product.id} limit={4} />

      {/* Zoomed Image Modal */}
      {isImageZoomed && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in" onClick={() => setIsImageZoomed(false)}>
          <Image src={product.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=1200&fit=crop'} alt={product.image_alt_text || product.name} className="max-h-[90vh] object-contain animate-scale-in" style={{ maxWidth: 'min(896px, calc(100vw - 2rem))' }} width={1200} height={1200} />
          <button className="absolute top-4 right-4 text-white text-3xl hover:opacity-70" onClick={() => setIsImageZoomed(false)}>✕</button>
        </div>
      )}

      <StickyAddToCart visible={stickyCartVisible} price={currentPricing?.price_per_sqft} sqftPerBox={currentPricing?.sqft_per_box} sqftNeeded={sqftNeeded} setSqftNeeded={setSqftNeeded} calculation={calculation} variantLabel={selectedJsonVariant?.label || null} isOutOfStock={product.in_stock === false} isAddingToCart={isAddingToCart} onAddToCart={handleAddToCart} />
    </div>
  );
}
