'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Truck, Store, CheckCircle, AlertCircle, Phone, Loader, Copy, Check, Clock, ShieldCheck, MessageSquare, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { Analytics } from '@/components/analytics';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';

export default function CheckoutClient() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_postal_code: '',
    delivery_preference: 'delivery',
    delivery_location: 'garage',
    payment_method: 'etransfer',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isStripeSuccess, setIsStripeSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [resumeOrder, setResumeOrder] = useState(null);
  const [isResuming, setIsResuming] = useState(false);
  const [confirmedDeliveryPref, setConfirmedDeliveryPref] = useState(null);

  const isCustomZone = formData.shipping_postal_code && !['M', 'L'].includes(formData.shipping_postal_code.toUpperCase()[0]);

  useEffect(() => {
    setSessionId(localStorage.getItem('bbs_session_id'));
    // Load coupon applied in Cart page
    try {
      const saved = localStorage.getItem('bbs_applied_coupon');
      if (saved) setAppliedCoupon(JSON.parse(saved));
    } catch {}
  }, []);

  // ─── Abandoned Cart Tracking ───
  const handleEmailBlur = async () => {
    const email = formData.customer_email?.trim();
    if (!email || !email.includes('@')) return;
    if (!cartItems || cartItems.length === 0) return;

    const dedupKey = 'bbs_abandoned_checkout_tracked';
    if (sessionStorage.getItem(dedupKey)) return;
    sessionStorage.setItem(dedupKey, '1');

    try {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
      await fetch('/api/tracking/abandoned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customer_name || '',
          customerEmail: email,
          customerPhone: formData.customer_phone || '',
          cartItems: cartItems.map(item => ({
            product_name: item.product_name,
            boxes_required: item.boxes_required,
            actual_sqft: item.actual_sqft,
            line_total: item.line_total
          })),
          cartValue: subtotal,
          pageUrl: window.location.href
        }),
      });
    } catch (err) {
      console.warn('Abandoned checkout tracking failed:', err);
    }
  };

  // Copy-to-clipboard helper
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  // Check for Stripe payment success or abandoned order resume on mount
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    const orderNum = searchParams.get('order_number');
    const resumeOrderNum = searchParams.get('resume_order');
    
    if (paymentSuccess === 'true' && orderNum) {
      const decodedOrderNum = decodeURIComponent(orderNum);
      setIsStripeSuccess(true);
      setOrderComplete(true);
      setOrderNumber(decodedOrderNum);
      
      // Fetch order details to get delivery_preference
      fetch(`/api/orders/lookup?order_number=${encodeURIComponent(decodedOrderNum)}`)
        .then(r => r.json())
        .then(data => {
          if (data.order?.delivery_preference) {
            setConfirmedDeliveryPref(data.order.delivery_preference);
          }
        })
        .catch(() => {}); // Non-critical — falls back to formData
      
      // Clear cart
      const sid = localStorage.getItem('bbs_session_id');
      if (sid) {
        entities.CartItem.filter({ session_id: sid }).then(items => {
          if (items.length > 0) {
            const subtotal = items.reduce((sum, item) => sum + (item.line_total || 0), 0);
            const tax = subtotal * 0.13;
            const total = subtotal + tax;
            Analytics.trackPurchase(orderNum, total, tax, items, 'credit_card');
          }
          items.forEach(item => entities.CartItem.delete(item.id));
          window.dispatchEvent(new Event('cartUpdated'));
        });
      }
    } else if (resumeOrderNum) {
      // Customer returned from abandoned Stripe checkout or clicked recovery email
      setResumeOrder(decodeURIComponent(resumeOrderNum));
    }
  }, [searchParams]);

  useEffect(() => {
    if (orderComplete) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Clear coupon after successful order
      try { localStorage.removeItem('bbs_applied_coupon'); } catch {}
    }
  }, [orderComplete]);

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart', sessionId],
    queryFn: () => sessionId ? entities.CartItem.filter({ session_id: sessionId }) : [],
    enabled: !!sessionId,
  });

  const totals = useMemo(() => {
    const rawSubtotal = cartItems.reduce((sum, item) => sum + (item.line_total || 0), 0);

    // Apply coupon discount from Cart page
    let discount = 0;
    if (appliedCoupon) {
      discount = appliedCoupon.type === 'percent'
        ? rawSubtotal * (appliedCoupon.value / 100)
        : Math.min(appliedCoupon.value, rawSubtotal);
    }
    const subtotal = rawSubtotal - discount;

    const taxRate = 0.13;
    const tax = subtotal * taxRate;
    const totalBoxes = cartItems.reduce((sum, item) => sum + (item.boxes_required || 0), 0);
    const totalSqft = cartItems.reduce((sum, item) => sum + (item.actual_sqft || 0), 0);

    let deliveryFee = 0;
    const isCustom = formData.shipping_postal_code && !['M', 'L'].includes(formData.shipping_postal_code.toUpperCase()[0]);
    
    if (!isCustom) {
      if (formData.delivery_preference === 'delivery') {
        deliveryFee = 140;
      } else if (formData.delivery_preference === 'inside') {
        deliveryFee = 200;
      }
    }
    
    const processingFee = formData.payment_method === 'credit_card' ? (subtotal + tax + deliveryFee) * 0.029 : 0;
    const total = subtotal + tax + deliveryFee + processingFee;
    return { subtotal, rawSubtotal, discount, tax, deliveryFee, processingFee, total, totalBoxes, totalSqft };
  }, [cartItems, appliedCoupon, formData.delivery_preference, formData.payment_method, formData.shipping_postal_code]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResumeOrder = async () => {
    if (!resumeOrder) return;
    setIsResuming(true);
    try {
      const res = await fetch('/api/orders/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: resumeOrder }),
      });
      const result = await res.json();
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.error(result.error || 'Unable to resume this order. Please call us or start a new order.');
        setResumeOrder(null);
        setIsResuming(false);
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again or call us.');
      setIsResuming(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingFields = [];
    if (!formData.customer_name) missingFields.push('Name');
    if (!formData.customer_email) missingFields.push('Email');
    if (!formData.customer_phone) missingFields.push('Phone');
    
    if (missingFields.length > 0) {
      toast.error(`Missing required field(s): ${missingFields.join(', ')}`);
      return;
    }

    const missingAddress = [];
    if (formData.delivery_preference !== 'pickup') {
      if (!formData.shipping_address) missingAddress.push('Street Address');
      if (!formData.shipping_city) missingAddress.push('City');
      if (!formData.shipping_postal_code) missingAddress.push('Postal Code');
      
      if (missingAddress.length > 0) {
        toast.error(`Missing address field(s): ${missingAddress.join(', ')}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_postal_code: formData.shipping_postal_code,
        delivery_preference: isCustomZone ? 'custom_freight' : formData.delivery_preference,
        shipping_zone: isCustomZone ? 'custom_zone' : 'safe_zone',
        notes: formData.notes,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          sku: item.sku,
          sqft_needed: item.sqft_needed,
          sqft_per_box: item.sqft_per_box,
          boxes_required: item.boxes_required,
          actual_sqft: item.actual_sqft,
          price_per_sqft: item.price_per_sqft,
          line_total: item.line_total,
        })),
        subtotal: totals.subtotal,
        tax: totals.tax,
        delivery_fee: totals.deliveryFee,
        ...(appliedCoupon ? {
          coupon_code: appliedCoupon.code,
          discount: totals.discount,
        } : {}),
      };

      // Create order via API route
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderData,
          paymentMethod: isCustomZone ? 'quote_request' : formData.payment_method,
          isCustomZone,
          termsAcceptedAt: new Date().toISOString()
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      const { order, orderNumber: createdOrderNumber } = orderResult;

      // If custom zone, show freight quote success page
      if (isCustomZone) {
        setOrderNumber(createdOrderNumber);
        setOrderComplete(true);
        
        for (const item of cartItems) {
          await entities.CartItem.delete(item.id);
        }
        window.dispatchEvent(new Event('cartUpdated'));
        return;
      }

      // If credit card, redirect to Stripe
      if (formData.payment_method === 'credit_card') {
        if (typeof window !== 'undefined' && window.self !== window.top) {
          toast.error('Credit card checkout must be accessed from the full app, not from a preview.');
          setIsSubmitting(false);
          return;
        }

        try {
          const checkoutResponse = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              amount: order.total,
              customerEmail: formData.customer_email,
              customerName: formData.customer_name,
              shippingCity: formData.shipping_city,
              shippingPostalCode: formData.shipping_postal_code,
              orderNumber: createdOrderNumber
            }),
          });

          const checkoutResult = await checkoutResponse.json();

          if (checkoutResult.checkoutUrl) {
            window.location.href = checkoutResult.checkoutUrl;
          } else {
            console.error('Stripe checkout failed:', checkoutResult);
            toast.error(checkoutResult.error || 'Failed to create payment session. Please try again or contact support.');
            setIsSubmitting(false);
          }
        } catch (stripeError) {
          toast.error('Payment error: ' + stripeError.message);
          setIsSubmitting(false);
        }
      } else {
        // E-transfer - show success page
        setOrderNumber(createdOrderNumber);
        setOrderComplete(true);
        
        Analytics.trackPurchase(createdOrderNumber, totals.total, totals.tax, cartItems, 'etransfer');
        
        for (const item of cartItems) {
          await entities.CartItem.delete(item.id);
        }
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process order: ' + error.message);
      setIsSubmitting(false);
    }
  };

  // ─── Resume Abandoned Order UI ───
  if (resumeOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <Clock className="w-12 h-12 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Complete Your Order</h1>
        <p className="text-lg text-slate-600 mb-2">
          Your order <span className="font-semibold text-amber-600">{resumeOrder}</span> is waiting for payment.
        </p>
        <p className="text-slate-500 mb-8">
          Your items are reserved — click below to complete checkout securely via Stripe.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleResumeOrder}
            disabled={isResuming}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg px-8 py-6 rounded-xl"
          >
            {isResuming ? (
              <><Loader className="w-5 h-5 mr-2 animate-spin" /> Redirecting to Payment...</>
            ) : (
              <>Complete Payment →</>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setResumeOrder(null)}
            className="text-slate-600 px-8 py-6 rounded-xl"
          >
            Start a New Order Instead
          </Button>
        </div>

        <p className="text-sm text-slate-400 mt-8">
          Prefer to pay by e-Transfer? <a href="tel:+16474281111" className="text-amber-600 font-semibold hover:underline">Call (647) 428-1111</a>
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Use confirmed delivery preference from DB (Stripe return) or form state
  const effectiveDeliveryPref = confirmedDeliveryPref || formData.delivery_preference;
  const isPickupOrder = effectiveDeliveryPref === 'pickup';

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div>
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            {isStripeSuccess ? 'Thank You for Your Order!' : 'Order Placed Successfully!'}
          </h1>
          <p className="text-xl text-slate-600 mb-2">Your order has been received.</p>
          <p className="text-lg text-amber-600 font-semibold mb-8">Order Number: {orderNumber}</p>
          
          <Card className="text-left mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-800 mb-4">What happens next?</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                {isCustomZone ? (
                  <>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                      <span><strong>Quote request submitted</strong> - We received your long distance freight request.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                      <span><strong>Freight calculation</strong> - Our team is calculating the best freight rate to {formData.shipping_city}.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                      <span><strong>Final invoice email</strong> - We&apos;ll email you the complete quote with freight cost details.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                      <span>Payment will be processed once you approve the freight quote.</span>
                    </li>
                  </>
                ) : isStripeSuccess || formData.payment_method === 'credit_card' ? (
                  <>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                      <span><strong>Payment authorized</strong> - Your card has been authorized but not yet charged.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                      <span><strong>Verifying stock</strong> - We&apos;re checking availability of all items.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                      <span><strong>Confirmation email</strong> - Once stock is confirmed, we&apos;ll capture payment and send you a confirmation email.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                      <span>{isPickupOrder ? "We'll email you the Warehouse Pickup Address and your Pickup #." : "We'll contact you to schedule your delivery date."}</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                      <span><strong>Open your banking app</strong> and start an Interac e-Transfer.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                      <div className="flex-1">
                        <span><strong>Send to:</strong></span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-slate-100 px-3 py-1.5 rounded-lg font-semibold text-slate-800 text-sm">info@bbsflooring.ca</code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('info@bbsflooring.ca', 'email')}
                            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                          >
                            {copiedField === 'email' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedField === 'email' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                      <div className="flex-1">
                        <span><strong>In the memo field, include:</strong></span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg font-bold text-red-700 text-sm">{orderNumber}</code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(orderNumber, 'order')}
                            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                          >
                            {copiedField === 'order' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedField === 'order' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                      <span><strong>We&apos;ll confirm receipt</strong> and {isPickupOrder ? "email you the Warehouse Pickup Address and Pickup #." : "contact you to schedule your delivery date."}</span>
                    </li>
                  </>
                )}

                {/* E-Transfer specific trust & help section */}
                {!isCustomZone && !isStripeSuccess && formData.payment_method !== 'credit_card' && (
                  <>
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 text-sm flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4" />
                        Daily bank limit?
                      </h4>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        Most banks cap e-Transfers at $3,000/day. You can split your payment over multiple days — we&apos;ll hold your stock and confirm each installment.
                      </p>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Your stock is reserved</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-500" /> Confirmation within 1 business day</span>
                      <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-blue-500" /> Check your email for full instructions</span>
                    </div>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Post-purchase installation upsell */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg">Need professional installation?</h3>
                <p className="text-sm text-slate-600 mt-1">
                  We install everything we sell — materials, labour, and old floor removal, all in one quote. 
                  Most jobs completed in 1-2 days.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Link href="/free-measurement">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                      Book Free In-Home Measurement
                    </Button>
                  </Link>
                  <a href="tel:6474281111">
                    <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                      <Phone className="mr-2 w-4 h-4" />
                      Call: 647-428-1111
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button variant="outline" size="lg">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Your cart is empty</h1>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 w-full overflow-x-hidden">
      <Breadcrumbs items={getStaticBreadcrumbs('/checkout')} />

      <h1 className="text-4xl font-bold text-slate-800 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="w-full overflow-x-hidden">
        <div className="grid lg:grid-cols-3 gap-8 w-full">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6 w-full min-w-0">
            {/* Contact Information */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 w-full">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">Full Name *</Label>
                    <Input
                      id="customer_name"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_phone">Phone Number *</Label>
                    <Input
                      id="customer_phone"
                      name="customer_phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      placeholder="647-XXX-XXXX"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="customer_email">Email Address *</Label>
                  <Input
                    id="customer_email"
                    name="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    onBlur={handleEmailBlur}
                    required
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Preference */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Delivery Preference</CardTitle>
              </CardHeader>
              <CardContent className="w-full">
                {isCustomZone ? (
                  <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-900">Long Distance Freight Required</h4>
                        <p className="text-sm text-red-800 mt-2">Your postal code indicates an area outside our standard GTA delivery zone. For this order, we offer:</p>
                        <p className="text-sm font-semibold text-red-900 mt-3">Long Distance Freight (Quote Required)</p>
                        <p className="text-xs text-red-700 mt-1">We will contact you with a custom freight quote based on your location and order details.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <RadioGroup
                    value={formData.delivery_preference}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, delivery_preference: value }))}
                    className="space-y-4"
                  >
                    <div className={`flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.delivery_preference === 'delivery' ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}>
                     <RadioGroupItem value="delivery" id="delivery" />
                     <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                       <div className="flex items-center gap-3">
                         <Truck className="w-5 h-5 text-amber-600" />
                         <div>
                           <span className="font-medium">Delivery to GTA</span>
                           <p className="text-sm text-slate-500">$140 flat rate garage delivery</p>
                         </div>
                       </div>
                     </Label>
                    </div>
                    <div className={`flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.delivery_preference === 'inside' ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}>
                      <RadioGroupItem value="inside" id="inside" />
                      <Label htmlFor="inside" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Truck className="w-5 h-5 text-amber-600" />
                          <div>
                            <span className="font-medium">Inside House Delivery</span>
                            <p className="text-sm text-slate-500">Delivery inside your home • $200</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className={`flex items-start space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.delivery_preference === 'pickup' ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}>
                      <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <Store className="w-5 h-5 text-amber-600 mt-0.5" />
                          <div>
                            <span className="font-medium">Warehouse Pickup</span>
                            <p className="text-sm text-slate-500">Warehouse address will be provided after payment (varies by brand)</p>
                            {formData.payment_method === 'credit_card' && (
                              <div className="bg-amber-100 border border-amber-300 rounded p-2 mt-2 text-xs text-amber-900">
                                <strong>⚠️ Important:</strong> You must bring valid photo ID and the credit card used for this purchase to collect your order.
                              </div>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {(formData.delivery_preference === 'delivery' || formData.delivery_preference === 'inside') && (
              <div className="w-full">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Delivery Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 w-full">
                    <div>
                      <Label htmlFor="shipping_address">Street Address *</Label>
                      <Input
                        id="shipping_address"
                        name="shipping_address"
                        value={formData.shipping_address}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shipping_city">City *</Label>
                        <Input
                          id="shipping_city"
                          name="shipping_city"
                          value={formData.shipping_city}
                          onChange={handleInputChange}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shipping_postal_code">Postal Code *</Label>
                        <Input
                          id="shipping_postal_code"
                          name="shipping_postal_code"
                          value={formData.shipping_postal_code}
                          onChange={handleInputChange}
                          required
                          className="mt-1"
                          placeholder="L3P 3B2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Payment Method */}
            <Card className="overflow-hidden w-full">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 overflow-hidden w-full max-w-full">
                {isCustomZone ? (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
                    <p className="text-sm text-amber-900">
                      <strong>Note:</strong> For long distance freight orders, payment will be processed after we provide you with a final quote. A team member will contact you shortly with the complete freight cost.
                    </p>
                  </div>
                ) : (
                  <RadioGroup
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                    className="space-y-3"
                  >
                    <label 
                      className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-colors overflow-hidden ${formData.payment_method === 'etransfer' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}
                      htmlFor="etransfer"
                    >
                      <RadioGroupItem value="etransfer" id="etransfer" className="mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="font-semibold text-emerald-800">E-Transfer</div>
                        <div className="text-sm text-emerald-700 truncate">Send to: info@bbsflooring.ca</div>
                        <div className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-xs font-bold inline-block mt-2">
                          SAVE 2.9%
                        </div>
                      </div>
                    </label>

                    <label 
                      className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.payment_method === 'credit_card' ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}
                      htmlFor="credit_card"
                    >
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <div className="flex-1">
                        <div className="font-semibold">Credit Card</div>
                        <div className="text-sm text-slate-600">2.9% processing fee applies</div>
                      </div>
                    </label>
                  </RadioGroup>
                )}

                {formData.payment_method === 'etransfer' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm w-full max-w-full overflow-hidden">
                    <p className="font-semibold text-amber-800 mb-3 break-words flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      How E-Transfer Works
                    </p>
                    <ol className="space-y-2.5 text-amber-800 w-full list-none">
                      <li className="flex items-start gap-2.5 break-words w-full">
                        <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">1</span>
                        <span>Place your order — you&apos;ll get a confirmation email with your Order ID</span>
                      </li>
                      <li className="flex items-start gap-2.5 break-words w-full">
                        <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">2</span>
                        <span>Open your banking app and e-Transfer to <strong className="break-all">info@bbsflooring.ca</strong></span>
                      </li>
                      <li className="flex items-start gap-2.5 break-words w-full">
                        <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">3</span>
                        <span>Include your Order ID in the memo — we&apos;ll confirm receipt and arrange {isPickupOrder ? 'pickup' : 'delivery'}</span>
                      </li>
                    </ol>
                    <div className="mt-3 pt-3 border-t border-amber-200 text-xs text-amber-700">
                      <strong>💡 Daily limit?</strong> Split over multiple days — we hold your stock until fully paid.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent className="w-full">
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions or notes for your order..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="w-full min-w-0">
            <Card className="sticky top-32 w-full">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-slate-500">{item.boxes_required} boxes × {item.sqft_per_box} sq.ft</p>
                      </div>
                      <span className="font-medium">C${item.line_total?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

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
                    <span className="font-semibold">{totals.totalSqft} sq.ft</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">C${(totals.discount > 0 ? totals.rawSubtotal : totals.subtotal).toFixed(2)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon ({appliedCoupon?.code})</span>
                      <span className="font-medium">−C${totals.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">HST (13%)</span>
                    <span className="font-medium">C${totals.tax.toFixed(2)}</span>
                  </div>
                  {totals.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Delivery Fee</span>
                      <span className="font-medium">C${totals.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {totals.processingFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Credit Card Processing Fee (2.9%)</span>
                      <span className="font-medium text-amber-600">C${totals.processingFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl">C${totals.total.toFixed(2)}</span>
                </div>

                {formData.payment_method === 'etransfer' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700 text-center">
                    💰 You&apos;re saving C${(totals.subtotal * 0.029).toFixed(2)} by choosing E-Transfer!
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-amber-500"
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-slate-800 mb-2">I accept the Terms of Sale:</p>
                      <ul className="space-y-1 text-slate-600">
                        <li>• Returns are subject to a 25% Manufacturer Restocking Fee.</li>
                        <li>• Customer is responsible for return shipping costs.</li>
                        <li>• I must inspect all boxes upon delivery/pickup and report damages within 24 hours.</li>
                      </ul>
                    </div>
                  </label>
                </div>

                {/* Trust signals above submit */}
                <div className="flex flex-wrap items-center justify-center gap-4 py-3 px-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure Checkout</span>
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-amber-500" /> Questions? <a href="tel:6474281111" className="text-amber-600 font-medium hover:underline">(647) 428-1111</a></span>
                  <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-green-500" /> <a href="https://wa.me/message/CQQRGZKI3U2VH1" target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:underline">WhatsApp Us</a></span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || !termsAccepted}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="mr-2 w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : isCustomZone ? (
                    'Submit Quote Request'
                  ) : formData.payment_method === 'etransfer' ? (
                    'Place Order & Get E-Transfer Instructions'
                  ) : (
                    'Continue to Payment'
                  )}
                </Button>

                <div className="flex items-start gap-2 text-xs text-slate-500">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    {formData.payment_method === 'credit_card' 
                      ? 'You will be directed to secure payment after placing your order.'
                      : 'After placing your order, you\'ll receive e-Transfer instructions via email.'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
