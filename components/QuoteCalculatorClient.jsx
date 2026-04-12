'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { entities } from '@/lib/base44-compat';
import { getMonthlyPayment, FINANCEIT_LINKS } from '@/lib/financing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calculator, CheckCircle2, Info, Lock, ArrowRight, ArrowLeft, BookmarkCheck, Footprints } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/lib/routes';
import { useAuth } from '@/lib/auth-context';
import GoogleReviewsBanner from '@/components/GoogleReviewsBanner';
import { Analytics } from '@/components/analytics';
import { validatePhone } from '@/lib/validations';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';

// ─── Constants ───
const CATEGORY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'laminate', label: 'Laminate' },
  { key: 'vinyl', label: 'Vinyl' },
  { key: 'engineered_hardwood', label: 'Engineered Hardwood' },
  { key: 'solid_hardwood', label: 'Solid Hardwood' },
];

const REMOVAL_PRICING = {
  none: { label: 'No Removal Needed', price: 0 },
  carpet: { label: 'Carpet Removal', price: 1.00 },
  vinyl: { label: 'Vinyl/Linoleum Removal', price: 1.50 },
  laminate: { label: 'Laminate Removal', price: 1.50 },
  hardwood: { label: 'Hardwood Removal', price: 1.50 },
  parquet: { label: 'Parquet Removal', price: 1.50 },
  tile: { label: 'Tile Removal', price: 2.50 },
};

const STEPS = [
  { id: 1, label: 'Choose Product' },
  { id: 2, label: 'Room Details' },
  { id: 3, label: 'Add-Ons' },
  { id: 4, label: 'Your Quote' },
];

// ─── Helpers ───
function isHardwood(product) {
  if (!product) return false;
  const cat = product.category?.toLowerCase() || '';
  return cat.includes('hardwood');
}

function isVinylOrLaminate(product) {
  if (!product) return false;
  const cat = product.category?.toLowerCase() || '';
  return cat.includes('vinyl') || cat.includes('laminate');
}

function getDisplayPrice(product) {
  return product.price_per_sqft || product.sale_price_per_sqft || 0;
}

function getQuotePrice(product) {
  return product.price_per_sqft || product.sale_price_per_sqft || 0;
}

function getImageUrl(url) {
  if (!url) return '/images/product-placeholder.svg';
  return url.split('?')[0];
}

function getCategoryRoute(product) {
  if (!product) return null;
  const cat = product.category?.toLowerCase() || '';
  if (cat.includes('solid_hardwood') || cat === 'solid_hardwood') return { label: 'Solid Hardwood', page: 'SolidHardwood' };
  if (cat.includes('engineered_hardwood') || cat === 'engineered_hardwood' || cat.includes('engineered')) return { label: 'Engineered Hardwood', page: 'EngineeredHardwood' };
  if (cat.includes('laminate')) return { label: 'Laminate', page: 'Laminate' };
  if (cat.includes('vinyl')) return { label: 'Vinyl', page: 'Vinyl' };
  return null;
}

function matchesCategory(product, categoryKey) {
  const cat = product.category?.toLowerCase() || '';
  switch (categoryKey) {
    case 'laminate': return cat.includes('laminate');
    case 'vinyl': return cat.includes('vinyl');
    case 'engineered_hardwood': return cat.includes('engineered');
    case 'solid_hardwood': return cat.includes('solid') || (cat.includes('hardwood') && !cat.includes('engineered'));
    default: return true;
  }
}

// ─── Step Indicator ───
function StepIndicator({ currentStep, steps }) {
  return (
    <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
      {steps.map((step, i) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                isCompleted ? 'bg-green-500 text-white' :
                isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' :
                'bg-slate-200 text-slate-500'
              }`}>
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${
                isActive ? 'text-amber-700' : isCompleted ? 'text-green-600' : 'text-slate-400'
              }`}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                step.id < currentStep ? 'bg-green-400' : 'bg-slate-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Product Selection Card (with image) ───
function SelectedProductCard({ product }) {
  if (!product) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 animate-fade-in-up">
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
        <Image
          src={getImageUrl(product.image_url)}
          alt={product.name}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
        <p className="text-xs text-slate-500">{product.brand} · C${getDisplayPrice(product).toFixed(2)}/sqft</p>
      </div>
      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
    </div>
  );
}

// ─── Main Component ───
export default function QuoteCalculatorClient() {
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get('product_id');
  const resumeToken = searchParams.get('resume');

  const savedProject = (() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('bbs_quote_project');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.timestamp && Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) return parsed;
      }
    } catch {}
    return null;
  })();

  const preselectedSqft = searchParams.get('sqft') || savedProject?.sqft || '';
  const preselectedRemoval = searchParams.get('removal_type') || savedProject?.removal_type || 'none';
  const preselectedBaseboards = searchParams.get('needs_baseboards') === 'true' || savedProject?.needs_baseboards || false;
  const preselectedShoeMoulding = searchParams.get('needs_shoe_moulding') === 'true' || savedProject?.needs_shoe_moulding || false;
  const [resumedQuote, setResumedQuote] = useState(null);

  const [formData, setFormData] = useState({
    square_footage: preselectedSqft,
    product_id: preselectedProductId || '',
    removal_type: preselectedRemoval,
    installation_type: 'house',
    hardwood_install_method: 'naildown',
    needs_baseboards: preselectedBaseboards,
    needs_shoe_moulding: preselectedShoeMoulding,
    delivery_preference: 'delivery',
    includes_stairs: false,
    customer_name: '',
    customer_email: '',
    customer_phone: '',
  });

  const [step, setStep] = useState(1);
  const [quote, setQuote] = useState(null);
  const [quoteState, setQuoteState] = useState('idle'); // idle | locked | unlocked
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const { user: authUser, isLoadingAuth } = useAuth();
  const currentUser = isLoadingAuth ? undefined : (authUser || null);
  const [quoteSavedToAccount, setQuoteSavedToAccount] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const topRef = useRef(null);
  const formRef = useRef(null);

  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['calculator-products'],
    queryFn: async () => {
      const res = await fetch('/api/products/calculator');
      if (!res.ok) throw new Error(`Products API ${res.status}`);
      return await res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });

  const selectedProduct = products.find(p => p.id === formData.product_id);

  // ─── Resume saved quote via magic link ───
  useEffect(() => {
    if (!resumeToken || products.length === 0 || resumedQuote) return;
    fetch(`/api/quotes/resume?token=${encodeURIComponent(resumeToken)}`)
      .then(r => r.json())
      .then(data => {
        if (!data.success || !data.quote) return;
        const q = data.quote;
        setResumedQuote(q);
        const match = products.find(p => p.name === q.product_name);
        setFormData(prev => ({
          ...prev,
          product_id: match?.id || prev.product_id,
          square_footage: q.square_footage?.toString() || prev.square_footage,
          removal_type: q.removal_type || prev.removal_type,
          needs_baseboards: q.needs_baseboards ?? prev.needs_baseboards,
          needs_shoe_moulding: q.needs_shoe_moulding ?? prev.needs_shoe_moulding,
        }));
        // Jump to step 2 if product is loaded
        if (match) setStep(2);
        toast.success('Your saved quote has been loaded!');
      })
      .catch(() => {});
  }, [resumeToken, products, resumedQuote]);

  // ─── Auto-set category when product is preselected ───
  useEffect(() => {
    if (selectedProduct && selectedCategory === 'all') {
      const cat = selectedProduct.category?.toLowerCase() || '';
      if (cat.includes('laminate')) setSelectedCategory('laminate');
      else if (cat.includes('vinyl')) setSelectedCategory('vinyl');
      else if (cat.includes('engineered')) setSelectedCategory('engineered_hardwood');
      else if (cat.includes('solid') || cat.includes('hardwood')) setSelectedCategory('solid_hardwood');
    }
  }, [selectedProduct, selectedCategory]);

  // ─── If product is preselected via URL, jump to step 2 ───
  useEffect(() => {
    if (preselectedProductId && products.length > 0 && products.find(p => p.id === preselectedProductId)) {
      setStep(2);
    }
  }, [preselectedProductId, products]);

  // ─── Product filtering ───
  const filteredProducts = useMemo(() => {
    const base = products.filter(p => !p.name?.toLowerCase().includes('installation') && !p.name?.toLowerCase().includes('removal'));
    if (selectedCategory === 'all') return base;
    return base.filter(p => matchesCategory(p, selectedCategory));
  }, [products, selectedCategory]);

  const groupedProducts = useMemo(() => {
    if (selectedCategory !== 'all') {
      const label = CATEGORY_FILTERS.find(c => c.key === selectedCategory)?.label || 'Products';
      return [[label, filteredProducts]];
    }
    const groups = { 'Laminate': [], 'Vinyl': [], 'Engineered Hardwood': [], 'Solid Hardwood': [], 'Other': [] };
    filteredProducts.forEach(product => {
      const cat = product.category?.toLowerCase() || '';
      if (cat.includes('laminate')) groups['Laminate'].push(product);
      else if (cat.includes('vinyl')) groups['Vinyl'].push(product);
      else if (cat.includes('engineered')) groups['Engineered Hardwood'].push(product);
      else if (cat.includes('solid') || cat.includes('hardwood')) groups['Solid Hardwood'].push(product);
      else groups['Other'].push(product);
    });
    return Object.entries(groups).filter(([, items]) => items.length > 0);
  }, [filteredProducts, selectedCategory]);

  // ─── Install price helper ───
  const getInstallationPrice = (product) => {
    if (isHardwood(product)) {
      if (formData.hardwood_install_method === 'naildown') return 2.25;
      if (formData.hardwood_install_method === 'naildown_herringbone') return 3.25;
      if (formData.hardwood_install_method === 'glue_nail_herringbone') return 4.25;
      return 3.25;
    }
    if (isVinylOrLaminate(product)) return formData.installation_type === 'house' ? 2.00 : 2.25;
    return 2.50;
  };

  // ─── Auto-save for logged-in users ───
  const autoSaveQuote = (quoteData) => {
    if (!currentUser || !selectedProduct) return;
    setQuoteSavedToAccount(false);
    entities.SavedQuote.create({
      user_email: currentUser.email,
      product_id: selectedProduct.id,
      product_slug: selectedProduct.slug || selectedProduct.id,
      product_name: selectedProduct.name,
      sqft: parseFloat(formData.square_footage),
      material_cost: quoteData.flooringCost,
      installation_cost: quoteData.installationCost,
      removal_cost: quoteData.removalCost,
      baseboard_cost: quoteData.baseboardCost,
      shoe_moulding_cost: quoteData.shoeMouldingCost,
      delivery_cost: quoteData.deliveryCost,
      subtotal: quoteData.subtotal,
      tax: quoteData.tax,
      total_estimate: quoteData.total,
      member_price_total: null,
      removal_type: formData.removal_type,
      needs_baseboards: formData.needs_baseboards,
      needs_shoe_moulding: formData.needs_shoe_moulding,
      status: 'active',
    }).then(() => setQuoteSavedToAccount(true)).catch(() => {});
  };

  // ─── Calculate quote & advance to step 4 ───
  const calculateQuote = () => {
    if (!formData.square_footage || !selectedProduct) {
      toast.error('Please select a product and enter square footage');
      return;
    }

    const sqft = parseFloat(formData.square_footage);
    const linearFeet = sqft / 3;
    const pricePerSqft = getQuotePrice(selectedProduct);
    const flooringCost = sqft * pricePerSqft;
    const installationRate = getInstallationPrice(selectedProduct);
    const installationCost = sqft * installationRate;
    const removalRate = REMOVAL_PRICING[formData.removal_type].price;
    const removalCost = sqft * removalRate;
    const baseboardCost = formData.needs_baseboards ? linearFeet * (1.61 + 2.00) : 0;
    const shoeMouldingCost = formData.needs_shoe_moulding ? linearFeet * (0.66 + 1.25) : 0;
    const deliveryCost = 200;
    const subtotal = flooringCost + installationCost + removalCost + baseboardCost + shoeMouldingCost + deliveryCost;
    const tax = subtotal * 0.13;
    const total = subtotal + tax;

    const newQuote = { flooringCost, installationCost, removalCost, baseboardCost, shoeMouldingCost, deliveryCost, linearFeet, subtotal, tax, total, pricePerSqft, isMember: !!currentUser };
    setQuote(newQuote);

    localStorage.setItem('bbs_quote_project', JSON.stringify({
      sqft: formData.square_footage, removal_type: formData.removal_type,
      needs_baseboards: formData.needs_baseboards, needs_shoe_moulding: formData.needs_shoe_moulding,
      installation_type: formData.installation_type, hardwood_install_method: formData.hardwood_install_method,
      last_total: total.toFixed(2), last_product: selectedProduct?.name, timestamp: Date.now(),
    }));

    if (currentUser) {
      setLeadCaptured(true);
      setQuoteState('unlocked');
      autoSaveQuote(newQuote);
    } else {
      setQuoteState('locked');
    }

    setStep(4);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'calculate_quote', { event_category: 'engagement', event_label: selectedProduct?.name || 'unknown', value: newQuote.total, currency: 'CAD' });
    }
  };

  // ─── Save quote (lead capture) ───
  const saveQuote = async () => {
    if (!quote || !formData.customer_name || !formData.customer_phone || !formData.customer_email) {
      toast.error('Please provide your name, phone number, and email address');
      return;
    }
    if (!validatePhone(formData.customer_phone)) {
      toast.error('Please enter a valid phone number (e.g. 647-428-1111)');
      return;
    }

    const quoteData = {
      product_id: selectedProduct.id, product_name: selectedProduct.name,
      square_footage: parseFloat(formData.square_footage), price_per_sqft: quote.pricePerSqft,
      is_member: quote.isMember, removal_type: formData.removal_type, removal_cost: quote.removalCost,
      needs_baseboards: formData.needs_baseboards, baseboard_cost: quote.baseboardCost,
      needs_shoe_moulding: formData.needs_shoe_moulding, shoe_moulding_cost: quote.shoeMouldingCost,
      flooring_cost: quote.flooringCost, installation_cost: quote.installationCost,
      delivery_cost: quote.deliveryCost, subtotal: quote.subtotal, tax: quote.tax, total: quote.total,
      customer_name: formData.customer_name, customer_email: formData.customer_email, customer_phone: formData.customer_phone,
    };

    Analytics.trackQuoteSubmit(selectedProduct?.name || 'unknown', quoteData.total, 'CAD');
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', { content_name: selectedProduct?.name || 'unknown', value: quoteData.total, currency: 'CAD' });
    }

    setLeadCaptured(true);
    setQuoteState('unlocked');
    if (currentUser) autoSaveQuote(quote);

    try {
      await entities.Quote.create({
        customer_name: formData.customer_name, customer_email: formData.customer_email, customer_phone: formData.customer_phone,
        product_name: selectedProduct?.name || 'Unknown', square_footage: parseFloat(formData.square_footage) || 0,
        price_per_sqft: quote.pricePerSqft || 0, is_member: quote.isMember,
        removal_type: formData.removal_type || 'none', needs_baseboards: formData.needs_baseboards,
        needs_shoe_moulding: formData.needs_shoe_moulding, flooring_cost: quote.flooringCost || 0,
        installation_cost: quote.installationCost || 0, removal_cost: quote.removalCost || 0,
        baseboard_cost: quote.baseboardCost || 0, shoe_moulding_cost: quote.shoeMouldingCost || 0,
        delivery_cost: quote.deliveryCost || 0, subtotal: quote.subtotal || 0, tax: quote.tax || 0, total: quote.total || 0,
        lead_status: 'new', status: 'draft',
      });
    } catch (err) { console.error('Failed to save Quote entity:', err); }

    try {
      await fetch('/api/quotes/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote: quoteData, is_member: quoteData.is_member }),
      });
      toast.success('Quote sent! We\'ll follow up within 24 hours. Check your email for details.');
    } catch (error) {
      console.error('Error sending quote emails:', error);
      toast.error('Quote saved, but email failed to send.');
    }
  };

  // ─── Navigation helpers ───
  const goNext = () => {
    if (step === 1 && !selectedProduct) { toast.error('Please select a flooring product'); return; }
    if (step === 2 && !formData.square_footage) { toast.error('Please enter your square footage'); return; }
    if (step === 3) { calculateQuote(); return; }
    setStep(s => Math.min(s + 1, 4));
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };
  const goBack = () => {
    setStep(s => Math.max(s - 1, 1));
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const buildCategoryUrl = (product) => {
    const route = getCategoryRoute(product);
    if (!route || !quote) return null;
    const params = new URLSearchParams({ from: 'calculator', total: quote.total.toFixed(2), sqft: formData.square_footage, product: product.name });
    return createPageUrl(route.page) + '?' + params.toString();
  };

  // ─── Render ───
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12" ref={topRef}>
      <Breadcrumbs items={getStaticBreadcrumbs('/quote-calculator')} />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-3">
          <Calculator className="w-7 h-7 text-amber-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">Get Your Custom Installation Quote</h1>
        <p className="text-base text-slate-600 max-w-xl mx-auto">Accurate pricing in 60 seconds. Materials, installation, and extras — all included.</p>
        <div className="mt-3 inline-block bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-1.5 rounded-full">
          ✅ We beat any written quote by 5%
        </div>
      </div>

      {/* Resumed quote banner */}
      {resumedQuote && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-blue-500 text-lg flex-shrink-0">📋</span>
          <div className="text-sm text-blue-900">
            <span className="font-semibold">Welcome back!</span> Your saved quote for <strong>{resumedQuote.product_name}</strong> ({resumedQuote.square_footage} sq ft) has been loaded.
            {' '}Adjust the details and recalculate, or{' '}
            <a href="/free-measurement" className="font-semibold underline underline-offset-2 hover:text-blue-700">book your free measurement →</a>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <StepIndicator currentStep={step} steps={STEPS} />

      {/* ═══════════ STEP 1: Choose Product ═══════════ */}
      {step === 1 && (
        <Card className="border-2 border-slate-200">
          <CardContent className="p-5 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Choose Your Flooring</h2>
              <p className="text-sm text-slate-500">Select the product you&apos;re interested in. Not sure? Browse our categories first.</p>
            </div>

            {/* Category Filter Pills */}
            <div>
              <Label className="mb-2 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Flooring Type</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_FILTERS.map((cat) => (
                  <button key={cat.key} type="button"
                    onClick={() => {
                      setSelectedCategory(cat.key);
                      if (cat.key !== 'all' && selectedProduct && !matchesCategory(selectedProduct, cat.key)) {
                        setFormData(f => ({ ...f, product_id: '' }));
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat.key
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >{cat.label}</button>
                ))}
              </div>
            </div>

            {/* Product Picker */}
            <div>
              <Label className="mb-1.5 block">Select Flooring Product *</Label>
              <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={productSearchOpen} className="w-full justify-between max-w-full px-3 h-12">
                    <span className="block text-left truncate">
                      {formData.product_id
                        ? products.find(p => p.id === formData.product_id)?.name
                        : productsLoading ? 'Loading products…' : productsError ? 'Error loading products' : 'Search or browse products…'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start" style={{ maxHeight: '60vh' }}>
                  <Command className="flex flex-col max-h-[60vh]">
                    <CommandInput placeholder="Search products…" />
                    <CommandEmpty>{productsLoading ? 'Loading…' : productsError ? 'Failed to load products.' : 'No product found.'}</CommandEmpty>
                    <div className="overflow-auto flex-1">
                      {groupedProducts.map(([groupName, groupProducts]) => (
                        <CommandGroup key={groupName} heading={groupName}>
                          {groupProducts.map(product => (
                            <CommandItem key={product.id} value={product.name}
                              onSelect={() => { setFormData(f => ({ ...f, product_id: product.id })); setProductSearchOpen(false); }}>
                              <Check className={`mr-2 h-4 w-4 ${formData.product_id === product.id ? 'opacity-100' : 'opacity-0'}`} />
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {product.image_url && (
                                  <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-slate-100">
                                    <img src={getImageUrl(product.image_url)} alt="" className="w-full h-full object-cover" loading="lazy" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{product.name}</div>
                                  <div className="text-xs text-slate-500">C${getDisplayPrice(product).toFixed(2)}/sqft{product.brand && ` · ${product.brand}`}</div>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </div>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Selected product preview with image */}
            <SelectedProductCard product={selectedProduct} />

            {/* Next button */}
            <Button onClick={goNext} disabled={!selectedProduct} className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50" size="lg">
              Continue to Room Details <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ═══════════ STEP 2: Room Details ═══════════ */}
      {step === 2 && (
        <Card className="border-2 border-slate-200">
          <CardContent className="p-5 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Room Details</h2>
              <p className="text-sm text-slate-500">Tell us the size and how you&apos;d like it installed.</p>
            </div>

            {/* Selected product reminder */}
            <SelectedProductCard product={selectedProduct} />

            {/* Square Footage */}
            <div>
              <Label className="mb-1.5 block">Square Footage *</Label>
              <Input type="number" placeholder="e.g. 500" className="h-12 text-base"
                value={formData.square_footage} min="1" max="50000"
                onChange={(e) => setFormData(f => ({ ...f, square_footage: e.target.value }))} />
              <p className="text-xs text-slate-400 mt-1.5">Not sure? Multiply room length × width in feet. We&apos;ll measure for free!</p>
            </div>

            {/* Installation Type — Vinyl/Laminate */}
            {selectedProduct && isVinylOrLaminate(selectedProduct) && (
              <div>
                <Label className="mb-1.5 block">Installation Location</Label>
                <Select value={formData.installation_type} onValueChange={(v) => setFormData(f => ({ ...f, installation_type: v }))}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House (C$2.00/sqft)</SelectItem>
                    <SelectItem value="condo">Condo (C$2.25/sqft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Installation Method — Hardwood */}
            {selectedProduct && isHardwood(selectedProduct) && (
              <div>
                <Label className="mb-1.5 block">Installation Method</Label>
                <Select value={formData.hardwood_install_method} onValueChange={(v) => setFormData(f => ({ ...f, hardwood_install_method: v }))}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="naildown">Nail Down (C$2.25/sqft — 6½″ & under)</SelectItem>
                    <SelectItem value="glue_nail">Glue + Nail (C$3.25/sqft)</SelectItem>
                    <SelectItem value="naildown_herringbone">Herringbone — Nail Only (C$3.25/sqft — 6½″ & under)</SelectItem>
                    <SelectItem value="glue_nail_herringbone">Glue + Nail — Herringbone (C$4.25/sqft)</SelectItem>
                  </SelectContent>
                </Select>
                {selectedProduct.name?.toLowerCase().includes('engineered') && (
                  <p className="text-xs text-amber-600 mt-2"><strong>Note:</strong> Nail-down for planks 6½″ and under. Wider planks require Glue + Nail.</p>
                )}
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={goBack} className="flex-1"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
              <Button onClick={goNext} disabled={!formData.square_footage} className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50">
                Continue to Add-Ons <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════ STEP 3: Add-Ons ═══════════ */}
      {step === 3 && (
        <Card className="border-2 border-slate-200">
          <CardContent className="p-5 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Add-Ons & Extras</h2>
              <p className="text-sm text-slate-500">Customize your project — removal, baseboards, and more.</p>
            </div>

            {/* Selected product reminder */}
            <SelectedProductCard product={selectedProduct} />

            {/* Removal Type */}
            <div>
              <Label className="mb-1.5 block">Existing Flooring Removal</Label>
              <Select value={formData.removal_type} onValueChange={(v) => setFormData(f => ({ ...f, removal_type: v }))}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(REMOVAL_PRICING).map(([key, { label, price }]) => (
                    <SelectItem key={key} value={key}>{label}{price > 0 && ` (+C$${price.toFixed(2)}/sqft)`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Baseboards */}
            <div className="flex items-start space-x-3">
              <Checkbox id="baseboards" checked={formData.needs_baseboards}
                onCheckedChange={(checked) => setFormData(f => ({ ...f, needs_baseboards: checked }))} />
              <div className="grid gap-1 leading-none">
                <label htmlFor="baseboards" className="text-sm font-medium cursor-pointer">Add Baseboards</label>
                <p className="text-xs text-slate-500">5&quot; standard baseboard — C$3.61/linear foot (material + install)</p>
                <p className="text-xs text-slate-400 italic">Style upgrades available upon consultation</p>
              </div>
            </div>

            {/* Shoe Moulding */}
            <div className="flex items-start space-x-3">
              <Checkbox id="moulding" checked={formData.needs_shoe_moulding}
                onCheckedChange={(checked) => setFormData(f => ({ ...f, needs_shoe_moulding: checked }))} />
              <div className="grid gap-1 leading-none">
                <label htmlFor="moulding" className="text-sm font-medium cursor-pointer">Add Shoe Moulding</label>
                <p className="text-xs text-slate-500">Standard shoe moulding — C$1.91/linear foot (material + install)</p>
              </div>
            </div>

            {/* Stairs checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox id="stairs" checked={formData.includes_stairs}
                onCheckedChange={(checked) => setFormData(f => ({ ...f, includes_stairs: checked }))} />
              <div className="grid gap-1 leading-none">
                <label htmlFor="stairs" className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-slate-500" /> My project includes stairs
                </label>
                {formData.includes_stairs && (
                  <p className="text-xs text-amber-600 mt-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Stair pricing depends on your specific layout (number of steps, pickets, nosing, and style). We&apos;ll include a detailed stair quote during your <strong>free in-home measurement</strong>.
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-700">
                  <p className="font-medium mb-0.5">Delivery: C$200</p>
                  <p className="text-xs text-slate-600">Materials delivered inside your home 48 hours prior to installation.</p>
                </div>
              </div>
            </div>

            {/* Nav buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={goBack} className="flex-1"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
              <Button onClick={goNext} className="flex-1 bg-amber-500 hover:bg-amber-600">
                {leadCaptured ? '🔄 Recalculate' : 'Get My Free Quote'} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════ STEP 4: Quote Display ═══════════ */}
      {step === 4 && quote && (
        <div className="space-y-6">
          {/* ─── Locked state: lead capture ─── */}
          {quoteState === 'locked' && (
            <Card className="border-2 border-slate-200 overflow-hidden">
              <CardContent className="p-5 md:p-8 space-y-5">
                <div className="flex items-center gap-3 mb-1">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Your Quote is Ready!</h2>
                    <p className="text-sm text-slate-500 truncate">{selectedProduct?.name} · {formData.square_footage} sq ft</p>
                  </div>
                </div>

                {/* Blurred price preview */}
                <div className="relative rounded-lg border border-slate-200 overflow-hidden">
                  <div className="p-4 space-y-3 blur-sm select-none pointer-events-none">
                    <div className="flex justify-between text-sm"><span className="text-slate-600">Flooring Material</span><span className="font-medium">C$████</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-600">Installation</span><span className="font-medium">C$████</span></div>
                    <div className="flex justify-between text-sm font-semibold border-t pt-3"><span>Total (incl. HST)</span><span className="text-amber-600 text-xl">C$██████</span></div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
                    <Lock className="w-7 h-7 text-slate-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-800">Enter your info to unlock</p>
                  </div>
                </div>

                {/* Unlock form */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">We&apos;ll email you the full breakdown:</p>
                  <Input placeholder="Your Name *" value={formData.customer_name} onChange={(e) => setFormData(f => ({ ...f, customer_name: e.target.value }))} />
                  <Input type="tel" placeholder="Phone Number *" value={formData.customer_phone} onChange={(e) => setFormData(f => ({ ...f, customer_phone: e.target.value }))} />
                  <Input type="email" placeholder="Email Address *" value={formData.customer_email} onChange={(e) => setFormData(f => ({ ...f, customer_email: e.target.value }))} />
                  <Button onClick={saveQuote}
                    disabled={!formData.customer_name || !formData.customer_phone || !formData.customer_email}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed" size="lg">
                    <Lock className="w-4 h-4 mr-2" /> Unlock My Quote
                  </Button>
                  <p className="text-xs text-slate-400 text-center">No spam. We&apos;ll only contact you about your quote.</p>
                </div>

                <Button variant="outline" onClick={() => setStep(3)} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Adjust Details
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ─── Unlocked state: full quote ─── */}
          {quoteState === 'unlocked' && (
            <Card className="border-2 border-amber-200 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 p-5 md:px-8 md:py-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-slate-800">Your Estimated Quote</h2>
                    {selectedProduct && (
                      <div className="flex items-center gap-3 mt-2">
                        {selectedProduct.image_url && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-amber-200">
                            <Image src={getImageUrl(selectedProduct.image_url)} alt={selectedProduct.name} width={48} height={48} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-700 truncate">{selectedProduct.name}</p>
                          <p className="text-xs text-slate-500">{formData.square_footage} sq ft · C${quote.pricePerSqft.toFixed(2)}/sqft</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <CardContent className="p-5 md:px-8 md:pb-8 space-y-4">
                {/* Cost breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between gap-2 text-sm"><span className="text-slate-600">Material Cost</span><span className="font-medium">C${quote.flooringCost.toFixed(2)}</span></div>
                  <div className="flex justify-between gap-2 text-sm"><span className="text-slate-600">Installation</span><span className="font-medium">C${quote.installationCost.toFixed(2)}</span></div>
                  {quote.removalCost > 0 && <div className="flex justify-between gap-2 text-sm"><span className="text-slate-600">Flooring Removal</span><span className="font-medium">C${quote.removalCost.toFixed(2)}</span></div>}
                  {quote.baseboardCost > 0 && <div className="flex justify-between gap-2 text-sm"><span className="text-slate-600">Baseboards ({quote.linearFeet.toFixed(0)} lin ft)</span><span className="font-medium">C${quote.baseboardCost.toFixed(2)}</span></div>}
                  {quote.shoeMouldingCost > 0 && <div className="flex justify-between gap-2 text-sm"><span className="text-slate-600">Shoe Moulding ({quote.linearFeet.toFixed(0)} lin ft)</span><span className="font-medium">C${quote.shoeMouldingCost.toFixed(2)}</span></div>}
                  <div className="flex justify-between gap-2 text-sm"><span className="text-slate-600">Delivery</span><span className="font-medium">C${quote.deliveryCost.toFixed(2)}</span></div>
                  <div className="flex justify-between gap-2 text-sm text-slate-500"><span>HST (13%)</span><span>C${quote.tax.toFixed(2)}</span></div>
                </div>

                {/* Total */}
                <div className="border-t-2 border-slate-200 pt-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-base font-bold text-slate-800">Estimated Total</span>
                    <span className="text-2xl font-bold text-amber-600">C${quote.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Stairs note */}
                {formData.includes_stairs && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
                    <Footprints className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Stair pricing</strong> will be included in your in-home measurement quote — every staircase is unique.</span>
                  </div>
                )}

                {/* Financing */}
                {getMonthlyPayment(quote.total) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-0.5">💳 Or finance it</p>
                      <p className="text-2xl font-extrabold text-blue-700">~${getMonthlyPayment(quote.total)}<span className="text-sm font-semibold text-blue-400">/mo</span></p>
                      <p className="text-xs text-blue-400 mt-0.5">OAC · Max amortization · 13.99%</p>
                    </div>
                    <a href={FINANCEIT_LINKS.freeProgram} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap">
                      Apply Now →
                    </a>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Button variant="outline" className="flex-1 border-slate-300" onClick={() => setStep(1)}>✏️ Start Over</Button>
                  <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                    onClick={() => {
                      const quoteData = { product_id: selectedProduct?.id, product_name: selectedProduct?.name,
                        square_footage: parseFloat(formData.square_footage), customer_name: formData.customer_name,
                        customer_email: formData.customer_email, customer_phone: formData.customer_phone, total: quote.total };
                      window.location.href = `${createPageUrl('QuoteBooking')}?quote=${encodeURIComponent(JSON.stringify(quoteData))}`;
                    }}>
                    📅 Book Free Measurement <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {/* Browse category */}
                {getCategoryRoute(selectedProduct) && (
                  <Link href={buildCategoryUrl(selectedProduct)}
                    onClick={() => { if (typeof window !== 'undefined' && window.gtag) { window.gtag('event', 'browse_category', { event_category: 'engagement', event_label: getCategoryRoute(selectedProduct).label, quote_total: quote.total.toFixed(2), square_footage: formData.square_footage }); } }}
                    className="block">
                    <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold" size="lg">
                      Browse {getCategoryRoute(selectedProduct).label} Flooring <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}

                {/* Saved to account */}
                {currentUser && quoteSavedToAccount && (
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm">
                    <BookmarkCheck className="w-4 h-4 flex-shrink-0" />
                    <span>Quote saved to your <Link href="/account" className="font-semibold underline underline-offset-2 hover:text-emerald-900">account</Link>.</span>
                  </div>
                )}

                {/* Guest sign-up */}
                {!currentUser && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-1 text-sm text-slate-600"><span className="font-semibold text-slate-800">Create a free account</span> to save this quote and unlock member pricing.</div>
                    <a href="/verify-email"
                      onClick={(e) => {
                        e.preventDefault();
                        localStorage.setItem('bbs_pending_quote', JSON.stringify({
                          product_id: selectedProduct?.id, product_slug: selectedProduct?.slug || selectedProduct?.id,
                          product_name: selectedProduct?.name, sqft: parseFloat(formData.square_footage),
                          material_cost: quote.flooringCost, installation_cost: quote.installationCost,
                          removal_cost: quote.removalCost, baseboard_cost: quote.baseboardCost,
                          shoe_moulding_cost: quote.shoeMouldingCost, delivery_cost: quote.deliveryCost,
                          subtotal: quote.subtotal, tax: quote.tax, total_estimate: quote.total,
                          removal_type: formData.removal_type, needs_baseboards: formData.needs_baseboards, needs_shoe_moulding: formData.needs_shoe_moulding,
                        }));
                        window.location.href = '/verify-email';
                      }}
                      className="flex-shrink-0 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                      Sign Up Free
                    </a>
                  </div>
                )}

                {/* Email confirmation */}
                {!currentUser && formData.customer_email && (
                  <div className="flex items-center text-xs text-slate-500 pt-1">
                    <span>📧 A copy has been sent to <strong>{formData.customer_email}</strong></span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Adjust Details button (always visible on step 4) */}
          {quoteState === 'unlocked' && (
            <Button variant="outline" onClick={() => setStep(3)} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Adjust Details & Recalculate
            </Button>
          )}
        </div>
      )}

      {/* Why Choose BBS Installation */}
      <div className="mt-12">
        <Card className="bg-slate-900 text-white border-0">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6">Why Choose BBS Installation?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: '🏅', title: 'Certified Local Installers', desc: 'Vetted, experienced professionals serving Markham and the GTA.' },
                { icon: '🛡️', title: '2-Year Labour Warranty', desc: 'We stand behind our work with a full 2-year labour warranty.' },
                { icon: '🚛', title: 'Old Floor Removal Included', desc: 'We handle tear-out, haul-away, and cleanup before we install.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <span className="text-2xl">{item.icon}</span>
                  <div><p className="font-semibold text-white mb-1">{item.title}</p><p className="text-sm text-slate-400">{item.desc}</p></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 max-w-xl mx-auto">
        <GoogleReviewsBanner variant="compact" />
      </div>
    </div>
  );
}
