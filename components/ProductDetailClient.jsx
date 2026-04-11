'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowLeft, Package, Check, Phone, Truck, Shield, Star, Award, Clock, CheckCircle2, ChevronDown, ChevronUp, Ruler, Wrench, Sparkles } from 'lucide-react';
import VariantSelector from '@/components/VariantSelector';
import SaveButton from '@/components/SaveButton';
import { toast } from 'sonner';
import ProductCard from '@/components/ProductCard';
import FAQSection from '@/components/FAQSection';
import StickyAddToCart from '@/components/StickyAddToCart';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getProductBreadcrumbs } from '@/lib/breadcrumbs';
import { generateProductSchema } from '@/lib/seo';
import { Analytics } from '@/components/analytics';
import RecentlyViewed, { recordProductView } from '@/components/RecentlyViewed';
import TransitionPieces from '@/components/TransitionPieces';
import SqftCalculator from '@/components/SqftCalculator';
import ProductImageGallery from '@/components/ProductImageGallery';
import { useAuth } from '@/lib/auth-context';
import { getMonthlyPayment, FINANCEIT_LINKS } from '@/lib/financing';

/* ── FAST_PICKUP_BRANDS — warehouse-stocked brands with quick turnaround ── */
const FAST_PICKUP_BRANDS = ['wickham', 'appalachian', 'northernest', 'sherwood', 'vidar', 'twelve oaks', 'falcon', 'infiniti'];

export default function ProductDetailClient({ slug, initialProduct = null }) {
  const router = useRouter();
  const { user: currentUser, isLoadingAuth } = useAuth();
  const authResolved = !isLoadingAuth;

  const [sqftNeeded, setSqftNeeded] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedJsonVariant, setSelectedJsonVariant] = useState(null);
  const [buyMode, setBuyMode] = useState('material');
  const [stickyCartVisible, setStickyCartVisible] = useState(false);
  const [variantSort, setVariantSort] = useState({ key: null, asc: true });
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const PLACEHOLDER = '/images/product-placeholder.svg';
  const buyBoxRef = useRef(null);

  /* ── Data fetching ── */
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
    ...(initialProduct ? { initialData: [initialProduct], placeholderData: [initialProduct] } : {}),
  });

  const { data: productVariants = [] } = useQuery({
    queryKey: ['product-variants', product?.id],
    queryFn: () => entities.Product.filter({ parent_product_id: product.id }),
    enabled: !!product?.is_parent_product,
  });

  /* ── Image gallery ── */
  const imageGallery = useMemo(() => {
    const images = [];
    const seen = new Set();
    const add = (url, alt, sku = null) => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      images.push({ url, alt, sku });
    };
    add(product?.image_url, product?.image_alt_text || product?.name);
    if (Array.isArray(product?.additional_images)) {
      product.additional_images.forEach((url, i) => add(url, `${product?.name} - image ${i + 2}`));
    }
    if (product?.is_parent_product && productVariants?.length) {
      for (const v of productVariants) add(v.image_url, v.image_alt_text || v.name, v.sku);
    }
    if (images.length === 0) images.push({ url: PLACEHOLDER, alt: product?.name || '', sku: null });
    return images;
  }, [product, productVariants]);

  // Jump to variant image when selected
  useEffect(() => {
    if (selectedVariantId && productVariants?.length) {
      const v = productVariants.find(p => p.id === selectedVariantId);
      if (v?.image_url) {
        const idx = imageGallery.findIndex(i => i.url === v.image_url);
        if (idx >= 0) setActiveImageIdx(idx);
      }
    }
  }, [selectedVariantId, productVariants, imageGallery]);

  // Parse spec-based variants
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

  /* ── Pricing logic ── */
  const resolvePrice = (p) => p?.price_per_sqft || null;

  const currentPricing = useMemo(() => {
    const base = {
      price_per_sqft: resolvePrice(product),
      sale_price_per_sqft: product?.sale_price_per_sqft,
      sqft_per_box: product?.sqft_per_box,
      dimensions: product?.dimensions,
      grade: product?.grade,
      species: product?.species,
      thickness: product?.thickness,
      colour: product?.colour,
      finish: product?.finish,
      wear_layer: product?.wear_layer,
      ac_rating: product?.ac_rating,
    };
    if (product?.has_variants && selectedJsonVariant) {
      return {
        ...base,
        price_per_sqft: selectedJsonVariant.price_per_sqft,
        sale_price_per_sqft: selectedJsonVariant.on_sale ? selectedJsonVariant.sale_price : null,
        sqft_per_box: selectedJsonVariant.sqft_box,
        dimensions: selectedJsonVariant.dimensions || base.dimensions,
        grade: selectedJsonVariant.grade || base.grade,
        thickness: selectedJsonVariant.thickness || base.thickness,
      };
    }
    if (product?.is_parent_product && selectedVariantId) {
      const variant = productVariants.find(v => v.id === selectedVariantId);
      if (variant) {
        return {
          ...base,
          price_per_sqft: resolvePrice(variant),
          sale_price_per_sqft: variant.sale_price_per_sqft,
          sqft_per_box: variant.sqft_per_box || base.sqft_per_box,
          dimensions: variant.dimensions || base.dimensions,
          grade: variant.grade || base.grade,
          species: variant.species || base.species,
          thickness: variant.thickness || base.thickness,
          colour: variant.colour || base.colour,
          finish: variant.finish || base.finish,
          wear_layer: variant.wear_layer || base.wear_layer,
          ac_rating: variant.ac_rating || base.ac_rating,
        };
      }
    }
    if (selectedVariant) {
      return {
        ...base,
        price_per_sqft: resolvePrice(selectedVariant),
        sale_price_per_sqft: selectedVariant.sale_price_per_sqft,
        sqft_per_box: selectedVariant.sqft_per_box || base.sqft_per_box,
        dimensions: selectedVariant.dimensions || base.dimensions,
        grade: selectedVariant.grade || base.grade,
        species: selectedVariant.species || base.species,
      };
    }
    return base;
  }, [selectedJsonVariant, selectedVariant, selectedVariantId, product, productVariants]);

  /* ── Related products ── */
  const { data: allRelatedProducts = [] } = useQuery({
    queryKey: ['relatedProducts', product?.category],
    queryFn: () => entities.Product.filter({ category: product.category }, { limit: 30, order: '-created_date' }),
    enabled: !!product?.category,
  });

  const relatedProducts = useMemo(() => {
    if (!product || allRelatedProducts.length === 0) return [];
    const candidates = allRelatedProducts.filter(p => p.image_url && p.id !== product.id);
    if (candidates.length === 0) return [];
    const basePrice = product.sale_price_per_sqft || product.price_per_sqft || 0;
    const scored = candidates.map(p => {
      let score = 0;
      if (product.species && p.species && p.species.toLowerCase() === product.species.toLowerCase()) score += 3;
      if (product.brand && p.brand && p.brand.toLowerCase() === product.brand.toLowerCase()) score += 2;
      const pPrice = p.sale_price_per_sqft || p.price_per_sqft || 0;
      if (basePrice > 0 && pPrice > 0) {
        const diff = Math.abs(pPrice - basePrice) / basePrice;
        if (diff <= 0.15) score += 2;
        else if (diff <= 0.30) score += 1;
      }
      if (product.subcategory && p.subcategory && p.subcategory === product.subcategory) score += 1;
      if (p.image_url && pPrice > 0) score += 1;
      return { ...p, _score: score };
    });
    scored.sort((a, b) => b._score - a._score);
    return scored.slice(0, 4);
  }, [product, allRelatedProducts]);

  /* ── Side effects ── */
  useEffect(() => { if (product?.id) recordProductView(product); }, [product?.id]);

  useEffect(() => {
    if (!buyBoxRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyCartVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(buyBoxRef.current);
    return () => observer.disconnect();
  }, [product]);

  /* ── Calculation ── */
  const calculation = useMemo(() => {
    if (!currentPricing || !sqftNeeded || parseFloat(sqftNeeded) <= 0) return null;
    const sqft = parseFloat(sqftNeeded);
    const sqftPerBox = currentPricing.sqft_per_box || 20;
    const boxesRequired = Math.ceil(sqft / sqftPerBox);
    const actualSqft = boxesRequired * sqftPerBox;
    const pricePerSqft = (currentPricing.sale_price_per_sqft && currentPricing.sale_price_per_sqft < currentPricing.price_per_sqft)
      ? currentPricing.sale_price_per_sqft
      : currentPricing.price_per_sqft;
    const lineTotal = actualSqft * pricePerSqft;
    return { sqftNeeded: sqft, sqftPerBox, boxesRequired, actualSqft, pricePerSqft, lineTotal, extraSqft: actualSqft - sqft };
  }, [currentPricing, sqftNeeded]);

  const breadcrumbItems = useMemo(() => getProductBreadcrumbs(product), [product]);

  /* ── Analytics ── */
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

  /* ── Add to cart ── */
  const handleAddToCart = async () => {
    if (product.has_variants && !selectedJsonVariant) {
      toast.error('Please select a variant option');
      return;
    }
    if (product.is_parent_product && !product.has_variants && productVariants.length > 0 && !selectedVariantId) {
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
          price_per_sqft: selectedJsonVariant.on_sale ? selectedJsonVariant.sale_price : selectedJsonVariant.price_per_sqft,
          line_total: calculation.lineTotal, image_url: product.image_url,
        });
      } else {
        let productToAdd = product;
        if (product.is_parent_product && selectedVariantId) {
          productToAdd = productVariants.find(v => v.id === selectedVariantId);
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
      }
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Added to cart!');
      setSqftNeeded('');
      setSelectedVariantId(null);
      const trackProduct = (product.has_variants && selectedJsonVariant) ? product : (product.is_parent_product && selectedVariantId ? productVariants.find(v => v.id === selectedVariantId) || product : product);
      if (window.gtag) window.gtag('event', 'add_to_cart', { currency: 'CAD', value: calculation.lineTotal, items: [{ item_id: trackProduct.id, item_name: trackProduct.name, price: calculation.pricePerSqft, quantity: calculation.actualSqft }] });
      if (typeof window.fbq === 'function') window.fbq('track', 'AddToCart', { content_name: trackProduct.name, content_ids: [trackProduct.sku || trackProduct.id], content_type: 'product', value: calculation.lineTotal, currency: 'CAD' });
      Analytics.trackAddToCart(trackProduct.name, calculation.lineTotal);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
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

  /* ── Derived display values ── */
  const hasDiscount = currentPricing.sale_price_per_sqft && currentPricing.sale_price_per_sqft < currentPricing.price_per_sqft;
  const displayPrice = hasDiscount ? currentPricing.sale_price_per_sqft : currentPricing.price_per_sqft;
  const isOutOfStock = product?.in_stock === false;
  const isFastPickup = product && !isOutOfStock && FAST_PICKUP_BRANDS.some(b => (product.brand || '').toLowerCase().includes(b));

  /* ── Spec items (consolidated, no duplication) ── */
  const specItems = useMemo(() => {
    if (!currentPricing) return [];
    const items = [];
    const isVinyl = ['vinyl', 'vinyl_plank', 'laminate'].includes(product?.category);
    if (currentPricing.species && !isVinyl) items.push({ label: 'Species', value: currentPricing.species });
    if (currentPricing.colour) items.push({ label: 'Colour', value: currentPricing.colour });
    if (currentPricing.dimensions) items.push({ label: 'Dimensions', value: currentPricing.dimensions });
    if (currentPricing.thickness) items.push({ label: 'Thickness', value: currentPricing.thickness });
    if (currentPricing.finish) items.push({ label: 'Finish', value: currentPricing.finish });
    if (currentPricing.grade) items.push({ label: 'Grade', value: currentPricing.grade });
    if (currentPricing.wear_layer) items.push({ label: 'Wear Layer', value: currentPricing.wear_layer });
    if (currentPricing.ac_rating) items.push({ label: 'AC Rating', value: currentPricing.ac_rating });
    if (currentPricing.sqft_per_box) items.push({ label: 'Sqft/Box', value: currentPricing.sqft_per_box.toFixed(2) });
    return items;
  }, [currentPricing, product?.category]);

  const visibleSpecs = showAllSpecs ? specItems : specItems.slice(0, 4);

  /* ── Financing teaser ── */
  const financingTeaser = useMemo(() => {
    if (isOutOfStock || !currentPricing.price_per_sqft) return null;
    const sampleTotal = Math.round((currentPricing.price_per_sqft || 0) * 500 * 1.13);
    const monthly = getMonthlyPayment(sampleTotal);
    return monthly ? `From ~$${monthly}/mo for 500 sqft` : null;
  }, [currentPricing.price_per_sqft, isOutOfStock]);

  /* ── Product description ── */
  const description = product?.product_description || product?.description || '';
  const productDetails = product?.product_details || '';
  const shouldTruncateDesc = description.length > 300;

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-square bg-slate-100 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-5 bg-slate-100 rounded w-1/4 animate-pulse" />
            <div className="h-10 bg-slate-100 rounded w-3/4 animate-pulse" />
            <div className="h-8 bg-slate-100 rounded w-1/3 animate-pulse" />
            <div className="h-48 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
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

  const productSchema = generateProductSchema(product);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 lg:pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      {/* ── Breadcrumbs + Back ── */}
      <div className="pt-4 pb-2">
        {breadcrumbItems.length > 0 && <Breadcrumbs items={breadcrumbItems} />}
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 1: HERO — Image Gallery + Buy Box
          Two-column on desktop, stacked on mobile.
          Gallery is sticky so buy box scrolls alongside.
      ═══════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-[1fr_minmax(380px,480px)] gap-8 lg:gap-12">

        {/* ── Left: Image Gallery ── */}
        <div className="animate-fade-in-up">
          <ProductImageGallery
            images={imageGallery}
            activeIdx={activeImageIdx}
            onActiveIdxChange={setActiveImageIdx}
            badges={[
              product.is_new_arrival && <Badge key="new" className="bg-emerald-500 text-white border-0">New Arrival</Badge>,
              product.is_on_sale && <Badge key="sale" className="bg-red-500 text-white border-0">Sale</Badge>,
              product.is_clearance && <Badge key="clearance" className="bg-orange-500 text-white border-0">Clearance</Badge>,
            ].filter(Boolean)}
          />
        </div>

        {/* ── Right: Product Info + Buy Box ── */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

          {/* Brand */}
          {product.brand && (
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">{product.brand}</p>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-3">{product.name}</h1>

          {/* Reviews (if any) */}
          {product.review_count > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.review_rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-slate-700">{product.review_rating?.toFixed(1)}</span>
              <span className="text-sm text-slate-400">({product.review_count})</span>
            </div>
          )}

          {/* ── Price Block ── */}
          {!product.has_variants && (
            <div className="mb-4">
              {isOutOfStock ? (
                <Badge className="bg-slate-700 text-white border-0 text-base px-3 py-1.5">Out of Stock</Badge>
              ) : product.price_per_sqft ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    {hasDiscount ? (
                      <>
                        <span className="text-3xl font-bold text-red-600">C${parseFloat(displayPrice).toFixed(2)}</span>
                        <span className="text-lg text-slate-400 line-through">C${parseFloat(currentPricing.price_per_sqft).toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-slate-900">C${parseFloat(displayPrice).toFixed(2)}</span>
                    )}
                    <span className="text-sm text-slate-500">/sq.ft</span>
                  </div>
                  {/* Financing teaser — one subtle line */}
                  {financingTeaser && (
                    <Link href="/financing" className="text-xs text-slate-500 hover:text-amber-600 transition-colors mt-1 block">
                      💳 {financingTeaser} · <span className="underline">Financing options</span>
                    </Link>
                  )}
                </div>
              ) : (
                <span className="text-lg text-slate-500">Contact for Price</span>
              )}
            </div>
          )}

          {/* ── Stock + Save row ── */}
          <div className="flex items-center gap-3 mb-5">
            {isOutOfStock ? (
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-400" />Out of Stock
              </span>
            ) : isFastPickup ? (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />Fast Pickup · In Stock
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />In Stock
              </span>
            )}
            <div className="w-px h-4 bg-slate-200" />
            <SaveButton product={product} user={currentUser} />
          </div>

          {/* ── Variant Selector (chip-based for has_variants) ── */}
          {product.has_variants && (
            <div className="mb-5">
              <VariantSelector product={product} onVariantChange={setSelectedJsonVariant} />
            </div>
          )}

          {/* ── Variant Table (parent products without variants_json) ── */}
          {product.is_parent_product && !product.has_variants && productVariants.length > 0 && (
            <div className="mb-5 space-y-3">
              <label className="text-sm font-medium text-slate-700">Select Variant</label>
              {/* Mobile: stacked cards */}
              <div className="md:hidden space-y-2">
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
                  const isSelected = selectedVariantId === variant.id;
                  return (
                    <button key={variant.id} onClick={() => setSelectedVariantId(variant.id)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${isSelected ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="font-semibold text-sm text-slate-800">{variant.dimensions || 'N/A'}{patternType}</div>
                          {variant.grade && <div className="text-xs text-slate-500">{variant.grade}</div>}
                        </div>
                        <div className="text-right ml-3 shrink-0">
                          {variant.sale_price_per_sqft ? (
                            <><div className="text-base font-bold text-red-600">C${variant.sale_price_per_sqft.toFixed(2)}</div><div className="text-xs text-slate-400 line-through">C${variant.price_per_sqft.toFixed(2)}</div></>
                          ) : (
                            <div className="text-base font-bold text-slate-800">C${variant.price_per_sqft.toFixed(2)}</div>
                          )}
                          <div className="text-[10px] text-slate-500">/sqft</div>
                        </div>
                      </div>
                      {isSelected && <div className="mt-1.5 flex items-center gap-1 text-xs text-amber-700 font-semibold"><Check className="w-3.5 h-3.5" /> Selected</div>}
                    </button>
                  );
                })}
              </div>
              {/* Desktop: table */}
              <div className="hidden md:block border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      {[{ key: 'dimensions', label: 'Dimensions' }, { key: 'grade', label: 'Grade' }, { key: 'price', label: 'Price' }].map((col) => (
                        <th key={col.key}
                          className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 cursor-pointer hover:text-amber-600 transition-colors select-none"
                          onClick={() => setVariantSort(prev => ({ key: col.key, asc: prev.key === col.key ? !prev.asc : true }))}>
                          {col.label}{variantSort.key === col.key && <span className="ml-1">{variantSort.asc ? '↑' : '↓'}</span>}
                        </th>
                      ))}
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-600">Select</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
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
                        <tr key={variant.id} className={`hover:bg-slate-50 transition-colors ${selectedVariantId === variant.id ? 'bg-amber-50' : ''}`}>
                          <td className="px-4 py-2.5 text-sm text-slate-700">{variant.dimensions || 'N/A'}{patternType}</td>
                          <td className="px-4 py-2.5 text-sm text-slate-700">{variant.grade || 'N/A'}</td>
                          <td className="px-4 py-2.5 text-sm font-semibold">
                            {variant.sale_price_per_sqft ? (
                              <><span className="text-red-600">C${variant.sale_price_per_sqft.toFixed(2)}</span><span className="text-slate-400 line-through ml-2 text-xs">C${variant.price_per_sqft.toFixed(2)}</span></>
                            ) : (
                              <span className="text-slate-800">C${variant.price_per_sqft.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <Button size="sm" variant={selectedVariantId === variant.id ? 'default' : 'outline'} onClick={() => setSelectedVariantId(variant.id)} className={selectedVariantId === variant.id ? 'bg-amber-500 hover:bg-amber-600 text-xs' : 'text-xs'}>
                              {selectedVariantId === variant.id ? 'Selected' : 'Select'}
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

          {/* ── Non-parent spec-based variants ── */}
          {!product.is_parent_product && variants && variants.length > 1 && (
            <div className="mb-5 space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Variant</label>
              <div className="grid gap-2">
                {variants.map((variant) => (
                  <button key={variant.id} onClick={() => setSelectedVariant(variant)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${selectedVariant?.id === variant.id ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-sm text-slate-800">{variant.dimensions} · {variant.grade}</div>
                      <div className="text-right">
                        {variant.sale_price_per_sqft && variant.sale_price_per_sqft < variant.price_per_sqft ? (
                          <div className="flex items-baseline gap-2"><span className="text-base font-bold text-red-600">C${variant.sale_price_per_sqft.toFixed(2)}</span><span className="text-xs text-slate-400 line-through">C${variant.price_per_sqft.toFixed(2)}</span></div>
                        ) : (
                          <div className="text-base font-bold text-slate-900">C${variant.price_per_sqft.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{variant.sqft_per_box} sqft/box</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Key Specs (compact grid — max 4 visible, expand for more) ── */}
          {specItems.length > 0 && (
            <div className="mb-5">
              <div className="grid grid-cols-2 gap-2">
                {visibleSpecs.map(spec => (
                  <div key={spec.label} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-500 whitespace-nowrap">{spec.label}</span>
                    <span className="text-xs font-semibold text-slate-800 truncate ml-auto">{spec.value}</span>
                  </div>
                ))}
              </div>
              {specItems.length > 4 && (
                <button onClick={() => setShowAllSpecs(!showAllSpecs)}
                  className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-medium mt-2 transition-colors">
                  {showAllSpecs ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> +{specItems.length - 4} more specs</>}
                </button>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════
              BUY BOX — The Conversion Engine
              Clear hierarchy: calculator → total → CTA
          ═══════════════════════════════════════ */}
          <div ref={buyBoxRef} className="border-2 border-amber-200 rounded-2xl bg-gradient-to-b from-amber-50/80 to-white p-5 space-y-4">

            {/* Material / Installation toggle */}
            <div className="flex rounded-lg overflow-hidden border border-amber-300">
              <button onClick={() => setBuyMode('material')}
                className={`flex-1 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${buyMode === 'material' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 hover:bg-amber-50'}`}>
                <Package className="w-3.5 h-3.5" />Material Only
              </button>
              <button onClick={() => setBuyMode('installation')}
                className={`flex-1 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${buyMode === 'installation' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 hover:bg-amber-50'}`}>
                <Wrench className="w-3.5 h-3.5" />+ Installation
              </button>
            </div>

            {buyMode === 'material' ? (
              <div className="space-y-3">
                {/* Calculator */}
                <SqftCalculator
                  variants={product.has_variants ? ((() => { try { const s = JSON.parse(product.specifications); return s.variants || []; } catch { return []; } })()) : []}
                  currentVariant={selectedJsonVariant}
                  onSqftChange={setSqftNeeded}
                  currentSqft={sqftNeeded}
                />

                {/* Live calculation result */}
                {calculation && (
                  <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-1.5 animate-fade-in-up">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{calculation.boxesRequired} boxes × {calculation.sqftPerBox} sqft</span>
                      <span className="text-slate-600">{calculation.actualSqft} sqft</span>
                    </div>
                    {calculation.extraSqft > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Extra coverage</span>
                        <span className="text-slate-400">+{calculation.extraSqft.toFixed(1)} sqft</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-100">
                      <span className="text-sm font-semibold text-slate-800">Total</span>
                      <span className="text-xl font-bold text-slate-900">C${calculation.lineTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Primary CTA: Add to Cart */}
                <Button
                  className={`w-full h-12 text-base font-bold rounded-xl transition-all ${
                    calculation
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || isOutOfStock || !calculation}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isAddingToCart ? 'Adding...' : isOutOfStock ? 'Out of Stock' : calculation ? `Add to Cart · C$${calculation.lineTotal.toFixed(2)}` : 'Enter sqft to add to cart'}
                </Button>
              </div>
            ) : (
              /* Installation mode → route to quote calculator */
              <div className="space-y-3">
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                    <Ruler className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mb-1">Get a full project quote</p>
                  <p className="text-xs text-slate-500">Materials + labour + delivery — instant estimate</p>
                </div>
                <Link href={buildInstallQuoteUrl()} className="block">
                  <Button className="w-full h-12 text-base font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md">
                    Get Installation Quote
                  </Button>
                </Link>
                <Link href="/free-measurement" className="block">
                  <Button variant="outline" className="w-full h-10 text-sm font-semibold rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50">
                    Book Free Measurement
                  </Button>
                </Link>
              </div>
            )}

            {/* Trust signals — compact, single row */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1 text-[11px] text-slate-500"><Shield className="w-3 h-3" />25+ Year Warranty</span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500"><Truck className="w-3 h-3" />GTA Delivery</span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500"><Award className="w-3 h-3" />Authorized Dealer</span>
            </div>
          </div>

          {/* ── Quick Contact (below buy box, not competing with it) ── */}
          <div className="mt-4 flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">Questions? Talk to an expert</p>
              <a href="tel:6474281111" className="text-sm text-amber-600 font-medium hover:underline">(647) 428-1111</a>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 2: BELOW THE FOLD — Description, Specs, Services
          Full-width, stacked sections with visual rhythm.
      ═══════════════════════════════════════════════════ */}

      {/* ── Description + Details ── */}
      {(description || productDetails) && (
        <section className="mt-16 max-w-3xl">
          <h2 className="text-xl font-bold text-slate-900 mb-4">About This Product</h2>
          {description && (
            <div className="relative">
              <div
                className={`prose prose-slate prose-sm max-w-none [&_p]:text-slate-600 [&_p]:leading-relaxed [&_ul]:text-slate-600 [&_li]:text-slate-600 [&_a]:text-amber-600 [&_a:hover]:text-amber-700 ${!descExpanded && shouldTruncateDesc ? 'max-h-[6.5rem] overflow-hidden' : ''}`}
                dangerouslySetInnerHTML={{ __html: description }}
              />
              {shouldTruncateDesc && !descExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
              )}
              {shouldTruncateDesc && (
                <button onClick={() => setDescExpanded(!descExpanded)}
                  className="text-amber-600 hover:text-amber-700 text-sm font-medium mt-2 transition-colors relative z-10">
                  {descExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}
          {productDetails && (
            <div
              className="mt-4 prose prose-slate prose-sm max-w-none [&_p]:text-slate-600 [&_ul]:text-slate-600 [&_li]:text-slate-600 [&_li]:leading-relaxed [&_b]:text-slate-800 [&_strong]:text-slate-800 [&_a]:text-amber-600"
              dangerouslySetInnerHTML={{ __html: productDetails }}
            />
          )}
        </section>
      )}

      {/* ── Full Specifications Table ── */}
      {specItems.length > 0 && (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Specifications</h2>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {specItems.map((spec, i) => (
              <div key={spec.label} className={`flex justify-between items-center px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <span className="text-slate-600">{spec.label}</span>
                <span className="font-medium text-slate-900">{spec.value}</span>
              </div>
            ))}
            {product.brand && (
              <div className={`flex justify-between items-center px-4 py-3 text-sm ${specItems.length % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <span className="text-slate-600">Brand</span>
                <span className="font-medium text-slate-900">{product.brand}</span>
              </div>
            )}
            {product.category && (
              <div className={`flex justify-between items-center px-4 py-3 text-sm ${(specItems.length + 1) % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <span className="text-slate-600">Category</span>
                <span className="font-medium text-slate-900">{product.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Transition Pieces ── */}
      <TransitionPieces product={product} />

      {/* ── Complete Your Project — Compact service cards ── */}
      <section className="mt-16">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Complete Your Project</h2>
        <p className="text-sm text-slate-600 mb-5">Everything you need for a hassle-free flooring renovation</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/installation" className="group flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all">
            <span className="text-2xl">🔨</span>
            <div>
              <h3 className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Professional Installation</h3>
              <p className="text-xs text-slate-500 mt-0.5">Expert installers serving the GTA</p>
            </div>
          </Link>
          <Link href="/carpet-removal" className="group flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all">
            <span className="text-2xl">🧹</span>
            <div>
              <h3 className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Carpet Removal</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tear-out, haul-away & subfloor prep</p>
            </div>
          </Link>
          <Link href="/products?category=baseboards" className="group flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all">
            <span className="text-2xl">📐</span>
            <div>
              <h3 className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Baseboards & Trim</h3>
              <p className="text-xs text-slate-500 mt-0.5">Matching finishing touches</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-slate-900 mb-2">You Might Also Like</h2>
          <p className="text-sm text-slate-600 mb-6">Based on style, price, and quality match</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Brand Authority ── */}
      {product.brand && (
        <section className="mt-16 bg-slate-50 rounded-2xl p-6 sm:p-8">
          {(product.brand.toLowerCase().includes('vidar')) ? (
            <><h2 className="text-xl font-bold text-slate-900 mb-3">Why Markham Homeowners Choose Vidar Wide Plank</h2><p className="text-sm text-slate-600 leading-relaxed">Vidar&apos;s UV-cured oil finish and 3mm dry-sawn wear layer offer superior stability for Southern Ontario&apos;s humid summers and dry winters. As an authorized Vidar dealer, BBS Flooring carries the full collection with expert installation available across the GTA.</p></>
          ) : (product.brand.toLowerCase().includes('twelve oaks')) ? (
            <><h2 className="text-xl font-bold text-slate-900 mb-3">The Twelve Oaks Durability Standard</h2><p className="text-sm text-slate-600 leading-relaxed">With FloorScore certification and commercial-grade wear layers, Twelve Oaks is the preferred choice for high-traffic GTA homes. Visit our Markham showroom to see the full Twelve Oaks collection.</p></>
          ) : (product.brand.toLowerCase().includes('northernest')) ? (
            <><h2 className="text-xl font-bold text-slate-900 mb-3">Northernest — Canadian-Made Quality</h2><p className="text-sm text-slate-600 leading-relaxed">Proudly Canadian-made, Northernest flooring combines European design with domestic manufacturing excellence. Built for Canadian climates and available for fast pickup from our Markham location.</p></>
          ) : (
            <><h2 className="text-xl font-bold text-slate-900 mb-3">Premium {product.brand} Flooring</h2><p className="text-sm text-slate-600 leading-relaxed">Discover why {product.brand} is a trusted name in flooring, handpicked for quality and performance in the Greater Toronto Area.</p></>
          )}
        </section>
      )}

      {/* ── FAQ ── */}
      {product.category && <FAQSection category={product.category} />}

      {/* ── Recently Viewed ── */}
      <RecentlyViewed excludeProductId={product.id} limit={4} />

      {/* ── Sticky Mobile Cart ── */}
      <StickyAddToCart
        visible={stickyCartVisible}
        price={currentPricing?.price_per_sqft}
        sqftPerBox={currentPricing?.sqft_per_box}
        sqftNeeded={sqftNeeded}
        setSqftNeeded={setSqftNeeded}
        calculation={calculation}
        variantLabel={selectedJsonVariant?.label || null}
        isOutOfStock={product.in_stock === false}
        isAddingToCart={isAddingToCart}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
