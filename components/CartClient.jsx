'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingBag, ArrowRight, Package, AlertCircle, ArrowLeft, Wrench, Zap, Lock, Truck, Phone, Minus, Plus, Tag, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import TransitionPieces from '@/components/TransitionPieces';

export default function CartClient() {
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem('bbs_applied_coupon')); } catch { return null; }
  });
  const [couponError, setCouponError] = useState('');
  const { user } = useAuth();
  const isVerified = user?.is_verified === true;

  useEffect(() => {
    setSessionId(localStorage.getItem('bbs_session_id'));
  }, []);

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart', sessionId],
    queryFn: () => sessionId ? entities.CartItem.filter({ session_id: sessionId }) : [],
    enabled: !!sessionId,
  });

  // Separate products and transitions
  const productItems = cartItems.filter(item => !item.item_type || item.item_type === 'product');
  const transitionItems = cartItems.filter(item => item.item_type === 'transition');
  
  // Get vinyl and laminate products for transition piece section
  const vinylLaminateProducts = productItems.filter(item => {
    const name = (item.product_name || '').toLowerCase();
    return name.includes('vinyl') || name.includes('laminate');
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId) => entities.CartItem.delete(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Item removed from cart');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, newSqft, product }) => {
      const sqftPerBox = product.sqft_per_box || 20;
      const boxesRequired = Math.ceil(newSqft / sqftPerBox);
      const actualSqft = boxesRequired * sqftPerBox;
      const lineTotal = actualSqft * (product.price_per_sqft || 0);

      return entities.CartItem.update(itemId, {
        sqft_needed: newSqft,
        boxes_required: boxesRequired,
        actual_sqft: actualSqft,
        line_total: lineTotal,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      window.dispatchEvent(new Event('cartUpdated'));
    },
  });

  const updateTransitionMutation = useMutation({
    mutationFn: ({ itemId, newQty, pricePerPiece }) => {
      return entities.CartItem.update(itemId, {
        transition_quantity: newQty,
        line_total: newQty * pricePerPiece,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      window.dispatchEvent(new Event('cartUpdated'));
    },
  });

  const pricingLabel = isVerified ? 'Trade Price' : 'Retail Price';

  // Coupon apply handler
  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    // Hardcoded promo codes — move to Supabase table when scaling
    const PROMO_CODES = {
      'WELCOME10': { type: 'percent', value: 10, label: '10% Off' },
      'SAVE50': { type: 'fixed', value: 50, label: '$50 Off' },
    };
    const promo = PROMO_CODES[code];
    if (promo) {
      const coupon = { code, ...promo };
      setAppliedCoupon(coupon);
      setCouponCode('');
      // Persist coupon so Checkout page can read it
      try { localStorage.setItem('bbs_applied_coupon', JSON.stringify(coupon)); } catch {}
      toast.success(`Coupon "${code}" applied! ${promo.label}`);
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
    let discount = 0;
    if (appliedCoupon) {
      discount = appliedCoupon.type === 'percent'
        ? subtotal * (appliedCoupon.value / 100)
        : Math.min(appliedCoupon.value, subtotal);
    }
    const discountedSubtotal = subtotal - discount;
    const taxRate = 0.13; // Ontario HST
    const tax = discountedSubtotal * taxRate;
    const total = discountedSubtotal + tax;
    const totalBoxes = productItems.reduce((sum, item) => sum + (item.boxes_required || 0), 0);
    const totalSqft = productItems.reduce((sum, item) => sum + (item.actual_sqft || 0), 0);

    return { subtotal, discount, tax, total, totalBoxes, totalSqft };
  }, [cartItems, productItems, appliedCoupon]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-100 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!sessionId || cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div>
          <ShoppingBag className="w-24 h-24 text-slate-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Your Cart is Empty</h1>
          <p className="text-slate-600 mb-8">Start shopping to add products to your cart.</p>
          <Link href="/products">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600">
              Browse Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-slate-600 hover:text-amber-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Continue Shopping
      </Link>

      <h1 className="text-4xl font-bold text-slate-800 mb-4">Your Cart</h1>

      {/* Urgency Banner */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-800">
        <Zap className="w-4 h-4 flex-shrink-0 text-amber-600" />
        <span>Items in your cart are <strong>not reserved</strong> — complete your order to secure stock at today&apos;s price.</span>
      </div>

      {/* Trust Bar */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Secure Checkout</span>
        <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> GTA Delivery</span>
        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> <a href="tel:6474281111" className="hover:text-amber-600">(647) 428-1111</a></span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Items */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">Flooring Products</h2>
            {productItems.map((item) => (
              <div key={item.id}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link href={`/products/${item.product_id}`} className="font-semibold text-slate-800 hover:text-amber-600 transition-colors">
                              {item.product_name}
                            </Link>
                            <p className="text-sm text-slate-500 mt-1">SKU: {item.sku}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500 block mb-1">Sq.ft needed</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  const newSqft = Math.max(1, (item.sqft_needed || 0) - (item.sqft_per_box || 20));
                                  updateMutation.mutate({ itemId: item.id, newSqft, product: item });
                                }}
                                disabled={updateMutation.isPending}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <Input
                                type="number"
                                value={item.sqft_needed || ''}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1;
                                  if (val > 0 && val <= 10000) {
                                    updateMutation.mutate({ itemId: item.id, newSqft: val, product: item });
                                  }
                                }}
                                className="h-7 w-16 text-center text-sm px-1"
                                min="1"
                                max="10000"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  const newSqft = (item.sqft_needed || 0) + (item.sqft_per_box || 20);
                                  updateMutation.mutate({ itemId: item.id, newSqft, product: item });
                                }}
                                disabled={updateMutation.isPending}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Boxes required</span>
                            <span className="font-semibold text-amber-600 flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {item.boxes_required}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Actual sq.ft</span>
                            <span className="font-medium">{item.actual_sqft?.toFixed(3)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Line total</span>
                            <span className="font-bold text-lg">C${item.line_total?.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-slate-500">
                          C${item.price_per_sqft?.toFixed(2)}/sq.ft × {item.actual_sqft?.toFixed(3)} sq.ft
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Installation upsell removed — was an exit ramp mid-checkout funnel.
             Moved to order confirmation page instead (post-purchase upsell). */}

          {/* Inline transition pieces for vinyl/laminate products */}
          {vinylLaminateProducts.length > 0 && transitionItems.length === 0 && (
            <div className="space-y-4">
              {vinylLaminateProducts.map((item) => (
                <TransitionPieces
                  key={`trans-${item.id}`}
                  product={item}
                  sessionId={sessionId}
                  onTransitionAdded={() => queryClient.invalidateQueries({ queryKey: ['cart'] })}
                />
              ))}
            </div>
          )}

          {/* Transition Items */}
          {transitionItems.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600" />
                Transition Pieces
              </h2>
              {transitionItems.map((item) => {
                const pricePerPiece = item.transition_quantity > 0 ? item.line_total / item.transition_quantity : 25;
                return (
                <div key={item.id}>
                  <Card className="border-amber-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">{item.product_name}</div>
                          <p className="text-xs text-slate-500 mt-1">Matches: {item.parent_product_name}</p>
                          <div className="mt-3 flex items-center gap-3">
                            <span className="text-sm text-slate-500">Qty:</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  const newQty = Math.max(1, (item.transition_quantity || 1) - 1);
                                  updateTransitionMutation.mutate({ itemId: item.id, newQty, pricePerPiece });
                                }}
                                disabled={updateTransitionMutation.isPending || (item.transition_quantity || 1) <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <Input
                                type="number"
                                value={item.transition_quantity || 1}
                                onChange={(e) => {
                                  const val = Math.max(1, parseInt(e.target.value) || 1);
                                  if (val <= 50) {
                                    updateTransitionMutation.mutate({ itemId: item.id, newQty: val, pricePerPiece });
                                  }
                                }}
                                className="h-7 w-14 text-center text-sm px-1"
                                min="1"
                                max="50"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  const newQty = (item.transition_quantity || 1) + 1;
                                  updateTransitionMutation.mutate({ itemId: item.id, newQty, pricePerPiece });
                                }}
                                disabled={updateTransitionMutation.isPending}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <span className="text-sm text-slate-500">× C${pricePerPiece.toFixed(2)}/piece</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-lg">C${item.line_total?.toFixed(2)}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-32">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Boxes</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Package className="w-4 h-4 text-amber-600" />
                    {totals.totalBoxes}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Coverage</span>
                  <span className="font-semibold">{totals.totalSqft.toFixed(3)} sq.ft</span>
                </div>
              </div>

              <Separator />

              {isVerified && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span><strong>Trade pricing applied</strong> — you&apos;re seeing wholesale rates.</span>
                </div>
              )}

              {/* Coupon Code */}
              <div className="space-y-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{appliedCoupon.code}</span>
                      <span className="text-xs text-green-600">({appliedCoupon.label})</span>
                    </div>
                    <button onClick={() => setAppliedCoupon(null)} className="text-green-500 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Promo code"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        className="text-sm h-9"
                      />
                      <Button variant="outline" size="sm" onClick={handleApplyCoupon} className="h-9 px-4 whitespace-nowrap">
                        Apply
                      </Button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">C${totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">−C${totals.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">HST (13%)</span>
                  <span className="font-medium">C${totals.tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-xl">C${totals.total.toFixed(2)}</span>
              </div>

              <Link href="/checkout" className="block">
                <Button
                  size="lg"
                  className="w-full bg-amber-500 hover:bg-amber-600 py-6 text-lg"
                  onClick={() => {
                    // GA4 begin_checkout event
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'begin_checkout', {
                        currency: 'CAD',
                        value: totals.total,
                        items: cartItems.map(item => ({
                          item_id: item.product_id,
                          item_name: item.product_name,
                          price: item.price_per_sqft,
                          quantity: item.actual_sqft
                        }))
                      });
                    }

                    // Meta Pixel — InitiateCheckout
                    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
                      window.fbq('track', 'InitiateCheckout', { value: totals.total, currency: 'CAD', num_items: cartItems.length });
                    }
                  }}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <div className="space-y-2 mt-4">
                <div className="flex items-start gap-2 text-xs text-slate-500">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Flooring is sold in full boxes only. Prices shown are per square foot.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-500">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Note: We deliver throughout Ontario. If you are outside our main service area (GTA), shipping rates may vary. Please contact us for a custom delivery quote.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
