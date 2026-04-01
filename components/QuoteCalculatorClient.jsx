'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { entities } from '@/lib/base44-compat';
import { getMonthlyPayment, FINANCEIT_LINKS } from '@/lib/financing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calculator, CheckCircle2, Info, Lock, ArrowRight, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/lib/routes';
import { useAuth } from '@/lib/auth-context';
import GoogleReviewsBanner from '@/components/GoogleReviewsBanner';
import { Analytics } from '@/components/analytics';
import { validatePhone } from '@/lib/validations';

export default function QuoteCalculatorClient() {
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get('product_id');

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

  const [formData, setFormData] = useState({
    square_footage: preselectedSqft,
    product_id: preselectedProductId || '',
    removal_type: preselectedRemoval,
    installation_type: 'house',
    hardwood_install_method: 'naildown',
    needs_baseboards: preselectedBaseboards,
    needs_shoe_moulding: preselectedShoeMoulding,
    delivery_preference: 'delivery',
    customer_name: '',
    customer_email: '',
    customer_phone: ''
  });

  const [quote, setQuote] = useState(null);
  const [quoteState, setQuoteState] = useState('idle');
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const { user: authUser, isLoadingAuth } = useAuth();
  const currentUser = isLoadingAuth ? undefined : (authUser || null);
  const [quoteSavedToAccount, setQuoteSavedToAccount] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const quoteRef = useRef(null);
  const formRef = useRef(null);

  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['all-products-quote'],
    queryFn: async () => {
      const results = await entities.Product.list({ limit: 1000 });
      if (!results || results.length === 0) {
        console.warn('[QuoteCalc] Product list returned empty — Supabase client may not be initialized');
      }
      return results;
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });

  const selectedProduct = products.find(p => p.id === formData.product_id);

  useEffect(() => {
    if (selectedProduct && selectedCategory === 'all') {
      const cat = selectedProduct.category?.toLowerCase() || '';
      if (cat.includes('laminate')) setSelectedCategory('laminate');
      else if (cat.includes('vinyl')) setSelectedCategory('vinyl');
      else if (cat.includes('engineered')) setSelectedCategory('engineered_hardwood');
      else if (cat.includes('solid') || cat.includes('hardwood')) setSelectedCategory('solid_hardwood');
    }
  }, [selectedProduct]);

  const isHardwood = (product) => {
    if (!product) return false;
    const category = product.category?.toLowerCase() || '';
    const name = product.name?.toLowerCase() || '';
    return category.includes('hardwood') || name.includes('hardwood');
  };

  const isVinylOrLaminate = (product) => {
    if (!product) return false;
    const category = product.category?.toLowerCase() || '';
    return category.includes('vinyl') || category.includes('laminate');
  };

  const getDisplayPrice = (product) => {
    if (currentUser) {
      return product.member_price || product.sale_price_per_sqft || product.price_per_sqft;
    }
    return product.public_price || ((product.sale_price_per_sqft || product.price_per_sqft) + 0.50);
  };

  const getQuotePrice = (product) => {
    if (currentUser) {
      return product.member_price || product.sale_price_per_sqft || product.price_per_sqft;
    }
    return product.public_price || ((product.sale_price_per_sqft || product.price_per_sqft) + 0.50);
  };

  const getCategoryRoute = (product) => {
    if (!product) return null;
    const cat = product.category?.toLowerCase() || '';
    if (cat.includes('solid_hardwood') || cat === 'solid_hardwood')
      return { label: 'Solid Hardwood', page: 'SolidHardwood' };
    if (cat.includes('engineered_hardwood') || cat === 'engineered_hardwood' || cat.includes('engineered'))
      return { label: 'Engineered Hardwood', page: 'EngineeredHardwood' };
    if (cat.includes('laminate'))
      return { label: 'Laminate', page: 'Laminate' };
    if (cat.includes('vinyl'))
      return { label: 'Vinyl', page: 'Vinyl' };
    return null;
  };

  const buildCategoryUrl = (product) => {
    const route = getCategoryRoute(product);
    if (!route || !quote) return null;
    const params = new URLSearchParams({
      from: 'calculator',
      total: quote.total.toFixed(2),
      sqft: formData.square_footage,
      product: product.name
    });
    return createPageUrl(route.page) + '?' + params.toString();
  };

  const categoryFilters = [
    { key: 'all', label: 'All' },
    { key: 'laminate', label: 'Laminate' },
    { key: 'vinyl', label: 'Vinyl' },
    { key: 'engineered_hardwood', label: 'Engineered Hardwood' },
    { key: 'solid_hardwood', label: 'Solid Hardwood' },
  ];

  const getFilteredProducts = () => {
    const base = products.filter(
      p => !p.name?.toLowerCase().includes('installation') && !p.name?.toLowerCase().includes('removal')
    );
    if (selectedCategory === 'all') return base;
    return base.filter(product => {
      const cat = product.category?.toLowerCase() || '';
      switch (selectedCategory) {
        case 'laminate': return cat.includes('laminate');
        case 'vinyl': return cat.includes('vinyl');
        case 'engineered_hardwood': return cat.includes('engineered');
        case 'solid_hardwood': return cat.includes('solid') || (cat.includes('hardwood') && !cat.includes('engineered'));
        default: return true;
      }
    });
  };

  const getGroupedProducts = () => {
    const filtered = getFilteredProducts();
    if (selectedCategory !== 'all') {
      const label = categoryFilters.find(c => c.key === selectedCategory)?.label || 'Products';
      return [[label, filtered]];
    }
    const groups = {
      'Laminate': [],
      'Vinyl': [],
      'Engineered Hardwood': [],
      'Solid Hardwood': [],
      'Other': []
    };
    filtered.forEach(product => {
      const cat = product.category?.toLowerCase() || '';
      if (cat.includes('laminate')) groups['Laminate'].push(product);
      else if (cat.includes('vinyl')) groups['Vinyl'].push(product);
      else if (cat.includes('engineered')) groups['Engineered Hardwood'].push(product);
      else if (cat.includes('solid') || cat.includes('hardwood')) groups['Solid Hardwood'].push(product);
      else groups['Other'].push(product);
    });
    return Object.entries(groups).filter(([, items]) => items.length > 0);
  };

  const removalPricing = {
    none: { label: 'No Removal Needed', price: 0 },
    carpet: { label: 'Carpet Removal', price: 1.00 },
    vinyl: { label: 'Vinyl/Linoleum Removal', price: 1.50 },
    laminate: { label: 'Laminate Removal', price: 1.50 },
    hardwood: { label: 'Hardwood Removal', price: 1.50 },
    parquet: { label: 'Parquet Removal', price: 1.50 },
    tile: { label: 'Tile Removal', price: 2.50 }
  };

  const getInstallationPrice = (product) => {
    if (isHardwood(product)) {
      if (formData.hardwood_install_method === 'naildown') return 2.25;
      if (formData.hardwood_install_method === 'naildown_herringbone') return 3.25;
      if (formData.hardwood_install_method === 'glue_nail_herringbone') return 4.25;
      return 3.25;
    }
    if (isVinylOrLaminate(product)) {
      return formData.installation_type === 'house' ? 2.00 : 2.25;
    }
    return 2.50;
  };

  const autoSaveQuote = (quoteData) => {
    if (!currentUser || !selectedProduct) return;

    const memberTotal = (() => {
      if (selectedProduct?.member_price && selectedProduct.member_price < (selectedProduct.public_price || selectedProduct.price_per_sqft)) {
        const sqft = parseFloat(formData.square_footage);
        const priceDiff = (selectedProduct.public_price || selectedProduct.price_per_sqft) - selectedProduct.member_price;
        return quoteData.total - (sqft * priceDiff * 1.13);
      }
      return null;
    })();

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
      member_price_total: memberTotal,
      removal_type: formData.removal_type,
      needs_baseboards: formData.needs_baseboards,
      needs_shoe_moulding: formData.needs_shoe_moulding,
      status: 'active'
    }).then(() => setQuoteSavedToAccount(true)).catch(() => {});
  };

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

    const removalRate = removalPricing[formData.removal_type].price;
    const removalCost = sqft * removalRate;

    const baseboardCost = formData.needs_baseboards ? linearFeet * (1.61 + 2.00) : 0;
    const shoeMouldingCost = formData.needs_shoe_moulding ? linearFeet * (0.66 + 1.25) : 0;
    const deliveryCost = 200;

    const subtotal = flooringCost + installationCost + removalCost + baseboardCost + shoeMouldingCost + deliveryCost;
    const tax = subtotal * 0.13;
    const total = subtotal + tax;

    const newQuote = {
      flooringCost,
      installationCost,
      removalCost,
      baseboardCost,
      shoeMouldingCost,
      deliveryCost,
      linearFeet,
      subtotal,
      tax,
      total,
      pricePerSqft,
      isMember: !!currentUser,
    };

    setQuote(newQuote);

    localStorage.setItem('bbs_quote_project', JSON.stringify({
      sqft: formData.square_footage,
      removal_type: formData.removal_type,
      needs_baseboards: formData.needs_baseboards,
      needs_shoe_moulding: formData.needs_shoe_moulding,
      installation_type: formData.installation_type,
      hardwood_install_method: formData.hardwood_install_method,
      last_total: total.toFixed(2),
      last_product: selectedProduct?.name,
      timestamp: Date.now()
    }));

    if (currentUser) {
      setLeadCaptured(true);
      setQuoteState('unlocked');
      autoSaveQuote(newQuote);
    } else {
      setQuoteState('locked');
    }

    setTimeout(() => {
      quoteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'calculate_quote', {
        event_category: 'engagement',
        event_label: selectedProduct?.name || 'unknown',
        value: newQuote.total,
        currency: 'CAD'
      });
    }
  };

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
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      square_footage: parseFloat(formData.square_footage),
      price_per_sqft: quote.pricePerSqft,
      is_member: quote.isMember,
      removal_type: formData.removal_type,
      removal_cost: quote.removalCost,
      needs_baseboards: formData.needs_baseboards,
      baseboard_cost: quote.baseboardCost,
      needs_shoe_moulding: formData.needs_shoe_moulding,
      shoe_moulding_cost: quote.shoeMouldingCost,
      flooring_cost: quote.flooringCost,
      installation_cost: quote.installationCost,
      delivery_cost: quote.deliveryCost,
      subtotal: quote.subtotal,
      tax: quote.tax,
      total: quote.total,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone
    };

    Analytics.trackQuoteSubmit(selectedProduct?.name || 'unknown', quoteData.total, 'CAD');

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', { content_name: selectedProduct?.name || 'unknown', value: quoteData.total, currency: 'CAD' });
    }

    setLeadCaptured(true);
    setQuoteState('unlocked');

    setTimeout(() => {
      quoteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    if (currentUser) {
      autoSaveQuote(quote);
    }

    try {
      await entities.Quote.create({
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        product_name: selectedProduct?.name || 'Unknown',
        square_footage: parseFloat(formData.square_footage) || 0,
        price_per_sqft: quote.pricePerSqft || 0,
        is_member: quote.isMember,
        removal_type: formData.removal_type || 'none',
        needs_baseboards: formData.needs_baseboards,
        needs_shoe_moulding: formData.needs_shoe_moulding,
        flooring_cost: quote.flooringCost || 0,
        installation_cost: quote.installationCost || 0,
        removal_cost: quote.removalCost || 0,
        baseboard_cost: quote.baseboardCost || 0,
        shoe_moulding_cost: quote.shoeMouldingCost || 0,
        delivery_cost: quote.deliveryCost || 0,
        subtotal: quote.subtotal || 0,
        tax: quote.tax || 0,
        total: quote.total || 0,
        lead_status: 'new',
        status: 'draft',
      });
    } catch (err) {
      console.error('Failed to save Quote entity:', err);
    }

    try {
      await fetch('/api/quotes/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote: quoteData, is_member: quoteData.is_member })
      });
      toast.success('Quote sent! We\'ll follow up within 24 hours. Check your email for details.');
    } catch (error) {
      console.error('Error sending quote emails:', error);
      toast.error('Quote saved, but email failed to send.');
    }
  };

  const groupedProducts = getGroupedProducts();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <Calculator className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-3">Get Your Custom Installation Quote</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Stop guessing. Get an accurate price including materials, installation, and seasonal discounts instantly.</p>
        <div className="mt-4 inline-block bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-2 rounded-full">
          ✅ We beat any written quote from a competitor by 5%.
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 min-w-0">
        {/* Form Section */}
        <div ref={formRef}>
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Tell us about your flooring project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Category Filter Pills */}
              <div>
                <Label className="mb-2 block">Flooring Type</Label>
                <div className="flex flex-wrap gap-2">
                  {categoryFilters.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.key);
                        if (cat.key !== 'all' && selectedProduct) {
                          const productCat = selectedProduct.category?.toLowerCase() || '';
                          const matches =
                            (cat.key === 'laminate' && productCat.includes('laminate')) ||
                            (cat.key === 'vinyl' && productCat.includes('vinyl')) ||
                            (cat.key === 'engineered_hardwood' && productCat.includes('engineered')) ||
                            (cat.key === 'solid_hardwood' && (productCat.includes('solid') || (productCat.includes('hardwood') && !productCat.includes('engineered'))));
                          if (!matches) {
                            setFormData({ ...formData, product_id: '' });
                          }
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === cat.key
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Selection */}
              <div>
                <Label>Select Flooring Product *</Label>
                <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={productSearchOpen} className="w-full justify-between max-w-full px-3">
                      <span
                        className="block text-left"
                        style={{
                          maxWidth: 'calc(100vw - 100px)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {formData.product_id ? products.find(p => p.id === formData.product_id)?.name : productsLoading ? "Loading products..." : productsError ? "Error loading products" : "Choose a product..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start" style={{ maxHeight: '60vh' }}>
                    <Command className="flex flex-col max-h-[60vh]">
                      <CommandInput placeholder="Search products..." />
                      <CommandEmpty>{productsLoading ? 'Loading products...' : productsError ? 'Failed to load products. Please refresh the page.' : 'No product found.'}</CommandEmpty>
                      <div className="overflow-auto flex-1">
                        {groupedProducts.map(([groupName, groupProducts]) => (
                          <CommandGroup key={groupName} heading={groupName}>
                            {groupProducts.map(product => (
                              <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={() => {
                                  setFormData({ ...formData, product_id: product.id });
                                  setProductSearchOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    formData.product_id === product.id ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-xs text-slate-500">
                                    C${getDisplayPrice(product).toFixed(2)}/sqft
                                    {product.brand && ` • ${product.brand}`}
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

              {/* Square Footage */}
              <div>
                <Label>Square Footage *</Label>
                <Input
                  type="number"
                  placeholder="Enter square footage"
                  value={formData.square_footage}
                  onChange={(e) => setFormData({ ...formData, square_footage: e.target.value })}
                />
              </div>

              {/* Installation Type - for Vinyl/Laminate */}
              {selectedProduct && isVinylOrLaminate(selectedProduct) && (
                <div>
                  <Label>Installation Location</Label>
                  <Select value={formData.installation_type} onValueChange={(value) => setFormData({ ...formData, installation_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House (C$2.00/sqft)</SelectItem>
                      <SelectItem value="condo">Condo (C$2.25/sqft)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Hardwood Installation Method */}
              {selectedProduct && isHardwood(selectedProduct) && (
                <div>
                  <Label>Installation Method</Label>
                  <Select value={formData.hardwood_install_method} onValueChange={(value) => setFormData({ ...formData, hardwood_install_method: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="naildown">Nail Down (C$2.25/sqft — 6½″ & under)</SelectItem>
                      <SelectItem value="glue_nail">Glue + Nail (C$3.25/sqft)</SelectItem>
                      <SelectItem value="naildown_herringbone">Herringbone — Nail Only (C$3.25/sqft — 6½″ & under)</SelectItem>
                      <SelectItem value="glue_nail_herringbone">Glue + Nail — Herringbone (C$4.25/sqft)</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedProduct.name?.toLowerCase().includes('engineered') && (
                    <p className="text-xs text-amber-600 mt-2">
                      <strong>Note:</strong> Nail-down is available for planks 6½″ and under. Wider planks require Glue + Nail.
                    </p>
                  )}
                </div>
              )}

              {/* Removal Type */}
              <div>
                <Label>Existing Flooring Removal</Label>
                <Select value={formData.removal_type} onValueChange={(value) => setFormData({ ...formData, removal_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(removalPricing).map(([key, { label, price }]) => (
                      <SelectItem key={key} value={key}>
                        {label} {price > 0 && `(+C$${price.toFixed(2)}/sqft)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Baseboards */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="baseboards"
                  checked={formData.needs_baseboards}
                  onCheckedChange={(checked) => setFormData({ ...formData, needs_baseboards: checked })}
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="baseboards" className="text-sm font-medium cursor-pointer">
                    Add Baseboards
                  </label>
                  <p className="text-xs text-slate-500">5&quot; standard baseboard - C$3.61/linear foot (material + install)</p>
                  <p className="text-xs text-slate-400 italic">Note: Style upgrades available upon consultation</p>
                </div>
              </div>

              {/* Shoe Moulding */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="moulding"
                  checked={formData.needs_shoe_moulding}
                  onCheckedChange={(checked) => setFormData({ ...formData, needs_shoe_moulding: checked })}
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="moulding" className="text-sm font-medium cursor-pointer">
                    Add Shoe Moulding
                  </label>
                  <p className="text-xs text-slate-500">Standard shoe moulding - C$1.91/linear foot (material + install)</p>
                </div>
              </div>

              {/* Delivery Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-700">
                    <p className="font-medium mb-1">Delivery: C$200</p>
                    <p className="text-xs text-slate-600">All materials for installation must be delivered inside your home 48 hours prior to installation date.</p>
                  </div>
                </div>
              </div>

              <Button onClick={calculateQuote} className="w-full bg-amber-500 hover:bg-amber-600" size="lg">
                {leadCaptured ? '🔄 Recalculate Quote' : 'Get My Free Quote'}
              </Button>
              <p className="text-xs text-slate-500 text-center">No obligation. We&apos;ll review your details and text/email you a formal estimate.</p>
            </CardContent>
          </Card>
        </div>

        {/* Quote Display */}
        <div ref={quoteRef} className="min-w-0 w-full overflow-hidden">
          {quoteState === 'idle' && (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Fill in the details to see your quote</p>
              </CardContent>
            </Card>
          )}

          {quoteState === 'locked' && quote && (
            <Card className="w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Your Quote is Ready!
                </CardTitle>
                <CardDescription className="truncate">{selectedProduct?.name} • {formData.square_footage} sq.ft</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Blurred price preview */}
                <div className="relative rounded-lg border border-slate-200 overflow-hidden">
                  <div className="p-4 space-y-3 blur-sm select-none pointer-events-none">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Flooring Material</span>
                      <span className="font-medium">C$████</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Installation</span>
                      <span className="font-medium">C$████</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold border-t pt-3">
                      <span>Total (incl. HST)</span>
                      <span className="text-amber-600 text-xl">C$██████</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
                    <Lock className="w-7 h-7 text-slate-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-800">Enter your info to unlock</p>
                  </div>
                </div>

                {/* Unlock form */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">We&apos;ll email you the full breakdown:</p>
                  <Input
                    placeholder="Your Name *"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  />
                  <Input
                    type="tel"
                    placeholder="Phone Number *"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  />
                  <Input
                    type="email"
                    placeholder="Email Address *"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  />
                  <Button
                    onClick={saveQuote}
                    disabled={!formData.customer_name || !formData.customer_phone || !formData.customer_email}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Unlock My Quote
                  </Button>
                  <p className="text-xs text-slate-400 text-center">No spam. We&apos;ll only contact you about your quote.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {quoteState === 'unlocked' && quote && (
            <Card className="w-full overflow-hidden border-2 border-amber-200">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Your Estimated Quote
                </CardTitle>
                {selectedProduct && (
                  <div className="mt-1 space-y-0.5">
                    <p className="font-semibold text-slate-700 text-sm">{selectedProduct.name}</p>
                    <p className="text-xs text-slate-500">Coverage: {formData.square_footage} sq ft</p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                {/* Cost breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-slate-600">Material Cost</span>
                    <span className="font-medium">C${quote.flooringCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-slate-600">Installation</span>
                    <span className="font-medium">C${quote.installationCost.toFixed(2)}</span>
                  </div>
                  {quote.removalCost > 0 && (
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="text-slate-600">Flooring Removal</span>
                      <span className="font-medium">C${quote.removalCost.toFixed(2)}</span>
                    </div>
                  )}
                  {quote.baseboardCost > 0 && (
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="text-slate-600">Baseboards ({quote.linearFeet.toFixed(0)} lin ft)</span>
                      <span className="font-medium">C${quote.baseboardCost.toFixed(2)}</span>
                    </div>
                  )}
                  {quote.shoeMouldingCost > 0 && (
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="text-slate-600">Shoe Moulding ({quote.linearFeet.toFixed(0)} lin ft)</span>
                      <span className="font-medium">C${quote.shoeMouldingCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-slate-600">Delivery</span>
                    <span className="font-medium">C${quote.deliveryCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-sm text-slate-500">
                    <span>HST (13%)</span>
                    <span>C${quote.tax.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t-2 border-slate-200 pt-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-base font-bold text-slate-800">Estimated Total</span>
                    <span className="text-2xl font-bold text-amber-600">C${quote.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Financing teaser */}
                {getMonthlyPayment(quote.total) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-0.5">💳 Or finance it</p>
                      <p className="text-2xl font-extrabold text-blue-700">~${getMonthlyPayment(quote.total)}<span className="text-sm font-semibold text-blue-400">/mo</span></p>
                      <p className="text-xs text-blue-400 mt-0.5">OAC · Max amortization · 13.99%</p>
                    </div>
                    <a
                      href={FINANCEIT_LINKS.freeProgram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Apply Now →
                    </a>
                  </div>
                )}

                {/* Member price upsell — only show to guests */}
                {!currentUser && selectedProduct?.member_price && selectedProduct.member_price < (selectedProduct.public_price || selectedProduct.price_per_sqft) && (() => {
                  const sqft = parseFloat(formData.square_footage);
                  const priceDiff = (selectedProduct.public_price || selectedProduct.price_per_sqft) - selectedProduct.member_price;
                  const memberTotal = quote.total - (sqft * priceDiff * 1.13);
                  return (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">💡</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-emerald-800 text-sm">Member Price</span>
                            <span className="font-bold text-emerald-700">C${memberTotal.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-emerald-700 mt-0.5">
                            Save <strong>C${(quote.total - memberTotal).toFixed(2)}</strong> with a BBS Wholesale Membership
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/verify-email"
                        className="block text-center text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                      >
                        Become a Member →
                      </Link>
                    </div>
                  );
                })()}

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-300"
                    onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  >
                    ✏️ Adjust Quote
                  </Button>
                  <Button
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                    onClick={() => {
                      const quoteData = {
                        product_id: selectedProduct?.id,
                        product_name: selectedProduct?.name,
                        square_footage: parseFloat(formData.square_footage),
                        customer_name: formData.customer_name,
                        customer_email: formData.customer_email,
                        customer_phone: formData.customer_phone,
                        total: quote.total,
                      };
                      window.location.href = `${createPageUrl('QuoteBooking')}?quote=${encodeURIComponent(JSON.stringify(quoteData))}`;
                    }}
                  >
                    📅 Book Estimate
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {/* Category browse CTA */}
                {getCategoryRoute(selectedProduct) && (
                  <Link
                    href={buildCategoryUrl(selectedProduct)}
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.gtag) {
                        window.gtag('event', 'browse_category', {
                          event_category: 'engagement',
                          event_label: getCategoryRoute(selectedProduct).label,
                          quote_total: quote.total.toFixed(2),
                          square_footage: formData.square_footage
                        });
                      }
                    }}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold"
                      size="lg"
                    >
                      Browse {getCategoryRoute(selectedProduct).label} Flooring
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}

                {/* Saved to account confirmation (members only) */}
                {currentUser && quoteSavedToAccount && (
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm">
                    <BookmarkCheck className="w-4 h-4 flex-shrink-0" />
                    <span>Quote saved to your <Link href="/account" className="font-semibold underline underline-offset-2 hover:text-emerald-900">account</Link>.</span>
                  </div>
                )}

                {/* Guest: sign-up banner */}
                {!currentUser && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-1 text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">Create a free account</span> to save this quote and unlock member pricing.
                    </div>
                    <a
                      href="/verify-email"
                      onClick={(e) => {
                        e.preventDefault();
                        localStorage.setItem('bbs_pending_quote', JSON.stringify({
                          product_id: selectedProduct?.id,
                          product_slug: selectedProduct?.slug || selectedProduct?.id,
                          product_name: selectedProduct?.name,
                          sqft: parseFloat(formData.square_footage),
                          material_cost: quote.flooringCost,
                          installation_cost: quote.installationCost,
                          removal_cost: quote.removalCost,
                          baseboard_cost: quote.baseboardCost,
                          shoe_moulding_cost: quote.shoeMouldingCost,
                          delivery_cost: quote.deliveryCost,
                          subtotal: quote.subtotal,
                          tax: quote.tax,
                          total_estimate: quote.total,
                          removal_type: formData.removal_type,
                          needs_baseboards: formData.needs_baseboards,
                          needs_shoe_moulding: formData.needs_shoe_moulding,
                        }));
                        window.location.href = '/verify-email';
                      }}
                      className="flex-shrink-0 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      Sign Up Free
                    </a>
                  </div>
                )}

                {/* Email confirmation — only for guests who unlocked via form */}
                {!currentUser && formData.customer_email && (
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>📧 A copy has been sent to <strong>{formData.customer_email}</strong></span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Why Choose BBS Installation */}
      <div className="mt-12">
        <Card className="bg-slate-900 text-white border-0">
          <CardHeader>
            <CardTitle className="text-xl text-white">Why Choose BBS Installation?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: '🏅', title: 'Certified Local Installers', desc: 'Our team are vetted, experienced professionals serving Markham and the GTA.' },
                { icon: '🛡️', title: '2-Year Labour Warranty', desc: 'We stand behind our work. All installations come with a full 2-year labour warranty.' },
                { icon: '🚛', title: 'Old Floor Removal & Disposal Included', desc: 'We handle everything — tear-out, haul-away, and cleanup before we install.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-white mb-1">{item.title}</p>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Google Reviews Trust Signal */}
      <div className="mt-8 max-w-xl mx-auto">
        <GoogleReviewsBanner variant="compact" />
      </div>
    </div>
  );
}
