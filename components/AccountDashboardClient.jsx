'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/lib/routes';
import { entities } from '@/lib/base44-compat';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Heart, ShoppingCart, User, Phone, Building2, Mail, RefreshCw, Calculator, ChevronDown, ChevronUp, ExternalLink, Trash2, Package, Truck, MapPin, CreditCard, Ban } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountDashboardClient() {
  const router = useRouter();
  const { user, isAuthenticated, isLoadingAuth, logout } = useAuth();
  const [savedItems, setSavedItems] = useState([]);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [expandedQuote, setExpandedQuote] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;

    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    const load = async () => {
      try {
        // Check for return URL
        const returnUrl = localStorage.getItem('bbs_return_url');
        if (returnUrl) {
          localStorage.removeItem('bbs_return_url');
          window.location.href = returnUrl;
          return;
        }

        // Auto-send verification email if user is not yet verified
        if (!user.is_verified && !user.verification_token) {
          fetch('/api/auth/send-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              userEmail: user.email,
              userName: user.full_name
            }),
          })
          .then(() => setVerificationEmailSent(true))
          .catch(() => {});
        }

        // For verified users, send welcome email if not sent
        if (user.is_verified && !user.welcome_email_sent) {
          fetch('/api/auth/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              userEmail: user.email,
              userName: user.full_name || '',
            }),
          }).catch(() => {});
        }

        const [items, quotes, ordersRes] = await Promise.all([
          entities.SavedItem.filter({ user_email: user.email }, { order: '-created_date', limit: 50 }),
          entities.SavedQuote.filter({ user_email: user.email }, { order: '-created_date', limit: 20 }),
          fetch('/api/orders/mine').then(r => r.ok ? r.json() : { orders: [] }).catch(() => ({ orders: [] })),
        ]);
        setSavedItems(items);
        setSavedQuotes(quotes);
        setOrders(ordersRes.orders || []);

        // Retroactively save any pending quote from localStorage
        const pendingQuote = localStorage.getItem('bbs_pending_quote');
        if (pendingQuote) {
          localStorage.removeItem('bbs_pending_quote');
          const qData = JSON.parse(pendingQuote);
          entities.SavedQuote.create({
            ...qData,
            user_email: user.email,
            status: 'active'
          }).then(newQuote => setSavedQuotes(prev => [newQuote, ...prev])).catch(() => {});
        }
      } catch (err) {
        console.error('AccountDashboard load error:', err);
      }
      setLoading(false);
    };
    load();
  }, [isLoadingAuth, isAuthenticated, user, router]);

  const handleResendVerification = async () => {
    if (!user) return;
    setResending(true);
    try {
      await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: user.full_name
        }),
      });
      setVerificationEmailSent(true);
      toast.success('Verification email sent! Check your inbox to unlock Member Pricing.');
    } catch {
      toast.error('Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleRemoveSaved = async (itemId) => {
    await entities.SavedItem.delete(itemId);
    setSavedItems(prev => prev.filter(i => i.id !== itemId));
    toast.success('Removed from saved items');
  };

  const handleDeleteQuote = async (quoteId) => {
    try {
      await entities.SavedQuote.delete(quoteId);
      setSavedQuotes(prev => prev.filter(q => q.id !== quoteId));
      if (expandedQuote === quoteId) setExpandedQuote(null);
      toast.success('Quote removed');
    } catch {
      toast.error('Failed to remove quote');
    }
  };

  const getCategoryRoute = (productName) => {
    if (!productName) return null;
    const name = productName.toLowerCase();
    if (name.includes('laminate')) return { label: 'Laminate', page: 'Laminate' };
    if (name.includes('vinyl') || name.includes('lvp') || name.includes('spc')) return { label: 'Vinyl', page: 'Vinyl' };
    if (name.includes('engineered')) return { label: 'Engineered Hardwood', page: 'EngineeredHardwood' };
    if (name.includes('hardwood') || name.includes('oak') || name.includes('maple') || name.includes('walnut')) return { label: 'Solid Hardwood', page: 'SolidHardwood' };
    return null;
  };

  const buildReQuoteUrl = (q) => {
    const params = new URLSearchParams({
      product_id: q.product_id || '',
      sqft: q.sqft || '',
      removal_type: q.removal_type || 'none',
      needs_baseboards: q.needs_baseboards ? 'true' : 'false',
      needs_shoe_moulding: q.needs_shoe_moulding ? 'true' : 'false',
    });
    return `${createPageUrl('QuoteCalculator')}?${params.toString()}`;
  };

  if (isLoadingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const isVerified = user?.is_verified === true;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Account</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.full_name || user?.email}</p>
        </div>

        {/* Verification Status Banner */}
        {!isVerified && (
          <div className="mb-6 bg-amber-50 border border-amber-300 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Clock className="w-8 h-8 text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-amber-900">Verify your email to unlock wholesale pricing</h3>
              {verificationEmailSent ? (
                <p className="text-green-700 text-sm mt-1 font-medium">
                  ✅ Verification email sent! Check your inbox to unlock Member Pricing.
                </p>
              ) : (
                <p className="text-amber-700 text-sm mt-1">
                  Check your inbox for the verification link, or resend it below.
                </p>
              )}
            </div>
            <Button
              onClick={handleResendVerification}
              disabled={resending}
              className="bg-amber-500 hover:bg-amber-600 text-white flex-shrink-0"
            >
              {resending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              Resend Email
            </Button>
          </div>
        )}

        {isVerified && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xl shadow-md">
                ⭐
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-800 text-lg">Trade Member</span>
                  <span className="text-xs font-semibold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <p className="text-green-700 text-sm mt-0.5">
                  You save <strong>$0.50/sqft</strong> on every clearance product. Trade pricing is active site-wide.
                </p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 hidden sm:block" />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" /> Profile
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 break-all">{user?.email}</span>
              </div>
              {user?.full_name && (
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{user.full_name}</span>
                </div>
              )}
              {user?.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{user.phone}</span>
                </div>
              )}
              {user?.company_name && (
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{user.company_name}</span>
                </div>
              )}
            </div>
            <div className="pt-2">
              <Badge className={isVerified ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'}>
                {isVerified ? '✅ Verified Member' : '⏳ Pending Verification'}
              </Badge>
            </div>
            {user.role === 'admin' && (
              <Link href="/admin">
                <Button
                  size="sm"
                  className="w-full mt-2 bg-slate-800 hover:bg-slate-900 text-white"
                >
                  🔧 Admin Dashboard
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>

          {/* Saved Items */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-400" /> Saved Products ({savedItems.length})
            </h2>

            {savedItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Heart className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                <p className="font-medium">No saved products yet</p>
                <p className="text-sm mt-1">Click the heart icon on any product to save it here</p>
                <Link href="/products">
                  <Button className="mt-4 bg-amber-500 hover:bg-amber-600 text-white">
                    Browse Products
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-amber-200 transition-colors group">
                    {item.product_image_url && (
                      <img
                        src={item.product_image_url}
                        alt={item.product_name}
                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product_slug || item.product_id}`}
                        className="font-semibold text-slate-800 hover:text-amber-600 transition-colors text-sm line-clamp-2"
                      >
                        {item.product_name}
                      </Link>
                      {item.product_price && (
                        <p className="text-xs text-slate-500 mt-0.5">C${item.product_price.toFixed(2)}/sq.ft</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link href={`/products/${item.product_slug || item.product_id}`}>
                        <Button size="sm" variant="outline" className="text-xs hidden sm:flex">
                          <ShoppingCart className="w-3 h-3 mr-1" /> View
                        </Button>
                      </Link>
                      <button
                        onClick={() => handleRemoveSaved(item.id)}
                        className="text-slate-300 hover:text-red-400 transition-colors"
                      >
                        <Heart className="w-5 h-5 fill-red-400 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Orders */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-amber-500" /> My Orders ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-medium">No orders yet</p>
              <p className="text-sm mt-1">Your order history will appear here after your first purchase</p>
              <Link href="/products">
                <Button className="mt-4 bg-amber-500 hover:bg-amber-600 text-white">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => {
                const statusConfig = {
                  pending_payment: { label: 'Awaiting Payment', color: 'bg-yellow-100 text-yellow-800', icon: Clock, step: 1 },
                  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2, step: 2 },
                  paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CreditCard, step: 2 },
                  processing: { label: 'Preparing', color: 'bg-purple-100 text-purple-800', icon: Package, step: 3 },
                  shipped: { label: order.delivery_preference === 'pickup' ? 'Ready for Pickup' : 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck, step: 4 },
                  delivered: { label: order.delivery_preference === 'pickup' ? 'Picked Up' : 'Delivered', color: 'bg-emerald-100 text-emerald-800', icon: MapPin, step: 5 },
                  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: Ban, step: 0 },
                  quote_requested: { label: 'Quote Requested', color: 'bg-sky-100 text-sky-800', icon: Clock, step: 1 },
                };
                const sc = statusConfig[order.status] || statusConfig.pending_payment;
                const StatusIcon = sc.icon;
                const items = order.items || [];
                const isExpanded = expandedOrder === order.id;
                const isCancelled = order.status === 'cancelled';
                const steps = [
                  { label: 'Received', num: 1 },
                  { label: 'Confirmed', num: 2 },
                  { label: 'Preparing', num: 3 },
                  { label: order.delivery_preference === 'pickup' ? 'Ready' : 'Shipped', num: 4 },
                  { label: order.delivery_preference === 'pickup' ? 'Picked Up' : 'Delivered', num: 5 },
                ];

                return (
                  <div key={order.id} className="border border-slate-100 rounded-xl overflow-hidden hover:border-amber-200 transition-colors">
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isCancelled ? 'bg-red-50' : 'bg-amber-50'}`}>
                        <StatusIcon className={`w-5 h-5 ${isCancelled ? 'text-red-400' : 'text-amber-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800 text-sm">{order.order_number}</span>
                          <Badge className={`${sc.color} border-0 text-xs`}>{sc.label}</Badge>
                          {order.payment_method === 'credit_card' ? (
                            <Badge className="bg-slate-100 text-slate-500 border-0 text-xs">💳 Card</Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-500 border-0 text-xs">🏦 E-Transfer</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {items.length} item{items.length !== 1 ? 's' : ''} · {new Date(order.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-amber-600">C${order.total?.toFixed(2)}</p>
                      </div>
                      <div className="text-slate-400 flex-shrink-0">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-4">
                        {/* Status Timeline */}
                        {!isCancelled && (
                          <div className="flex items-center justify-between gap-1 px-2">
                            {steps.map((step, i) => {
                              const active = sc.step >= step.num;
                              const current = sc.step === step.num;
                              return (
                                <React.Fragment key={step.num}>
                                  <div className="flex flex-col items-center gap-1 min-w-0">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                      current ? 'bg-amber-500 text-white ring-4 ring-amber-100' :
                                      active ? 'bg-emerald-500 text-white' :
                                      'bg-slate-200 text-slate-400'
                                    }`}>
                                      {active && !current ? '✓' : step.num}
                                    </div>
                                    <span className={`text-[10px] leading-tight text-center ${active ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                                      {step.label}
                                    </span>
                                  </div>
                                  {i < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mt-[-14px] ${sc.step > step.num ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        )}

                        {isCancelled && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                            This order was cancelled. If you have questions, please contact us.
                          </div>
                        )}

                        {/* Items */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</h4>
                          {items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm">
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-700 font-medium truncate">{item.product_name || 'Product'}</p>
                                {item.sku && <p className="text-xs text-slate-400">SKU: {item.sku}</p>}
                              </div>
                              <div className="text-right text-xs text-slate-500 flex-shrink-0">
                                <p>{item.boxes_required || '—'} box{(item.boxes_required || 0) !== 1 ? 'es' : ''}</p>
                                <p>{item.actual_sqft ? Number(item.actual_sqft).toFixed(1) : '—'} sqft</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-semibold text-slate-700 text-sm">C${(item.line_total || 0).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Totals */}
                        <div className="space-y-1 border-t border-slate-200 pt-3 text-sm">
                          <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>C${order.subtotal?.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Tax (HST)</span><span>C${order.tax?.toFixed(2)}</span></div>
                          {order.delivery_fee > 0 && <div className="flex justify-between"><span className="text-slate-500">Delivery</span><span>C${order.delivery_fee?.toFixed(2)}</span></div>}
                          {order.processing_fee > 0 && <div className="flex justify-between"><span className="text-slate-500">Processing fee</span><span>C${order.processing_fee?.toFixed(2)}</span></div>}
                          <div className="flex justify-between border-t border-slate-200 pt-2 font-bold"><span>Total</span><span className="text-amber-600">C${order.total?.toFixed(2)}</span></div>
                        </div>

                        {/* Delivery info */}
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          {order.delivery_preference === 'pickup' ? (
                            <>
                              <MapPin className="w-4 h-4" />
                              <span>Pickup at 6061 Highway 7, Unit B, Markham ON L3P 3B2</span>
                            </>
                          ) : (
                            <>
                              <Truck className="w-4 h-4" />
                              <span>Delivery{order.shipping_city ? ` to ${order.shipping_city}` : ''}</span>
                            </>
                          )}
                        </div>

                        {/* Action */}
                        <div className="flex gap-2 pt-1">
                          <a href="tel:+16474281111" className="flex-1">
                            <Button size="sm" variant="outline" className="w-full text-xs gap-1">
                              <Phone className="w-3 h-3" /> Questions? Call Us
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Quotes */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-500" /> My Quotes ({savedQuotes.length})
            </h2>
            <Link href="/quote-calculator">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                + New Quote
              </Button>
            </Link>
          </div>

          {savedQuotes.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Calculator className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-medium">No saved quotes yet</p>
              <p className="text-sm mt-1">Use the Quote Calculator to generate and save a quote</p>
              <Link href="/quote-calculator">
                <Button className="mt-4 bg-amber-500 hover:bg-amber-600 text-white">
                  Get a Quote
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedQuotes.map(q => (
                <div key={q.id} className="border border-slate-100 rounded-xl overflow-hidden hover:border-amber-200 transition-colors">
                  {/* Quote row */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => setExpandedQuote(expandedQuote === q.id ? null : q.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{q.product_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {q.sqft} sq ft • {new Date(q.created_date).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-amber-600">C${q.total_estimate?.toFixed(2)}</p>
                      {q.member_price_total && (
                        <p className="text-xs text-emerald-600">Member: C${q.member_price_total.toFixed(2)}</p>
                      )}
                    </div>
                    <div className="text-slate-400 flex-shrink-0">
                      {expandedQuote === q.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedQuote === q.id && (
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Material</span>
                          <span className="font-medium">C${q.material_cost?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Installation</span>
                          <span className="font-medium">C${q.installation_cost?.toFixed(2)}</span>
                        </div>
                        {q.removal_cost > 0 && (
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-500">Removal ({q.removal_type?.replace(/_/g, ' ')})</span>
                            <span className="font-medium">C${q.removal_cost?.toFixed(2)}</span>
                          </div>
                        )}
                        {q.baseboard_cost > 0 && (
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-500">Baseboards</span>
                            <span className="font-medium">C${q.baseboard_cost?.toFixed(2)}</span>
                          </div>
                        )}
                        {q.shoe_moulding_cost > 0 && (
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-500">Shoe Moulding</span>
                            <span className="font-medium">C${q.shoe_moulding_cost?.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Delivery</span>
                          <span className="font-medium">C${q.delivery_cost?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-2 text-slate-400">
                          <span>HST (13%)</span>
                          <span>C${q.tax?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-2 border-t border-slate-200 pt-2">
                          <span className="font-bold text-slate-800">Total</span>
                          <span className="font-bold text-amber-600">C${q.total_estimate?.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Link href={buildReQuoteUrl(q)} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full text-xs gap-1">
                            <Calculator className="w-3 h-3" /> Re-Quote
                          </Button>
                        </Link>
                        <Link
                          href={`/quote-booking?product=${encodeURIComponent(q.product_name)}&sqft=${q.sqft}&estimate=${q.total_estimate}`}
                          className="flex-1"
                        >
                          <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs gap-1">
                            <ExternalLink className="w-3 h-3" /> Book Estimate
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-red-500 text-xs px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuote(q.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      {/* Browse category button */}
                      {getCategoryRoute(q.product_name) && (
                        <Link href={createPageUrl(getCategoryRoute(q.product_name).page)} className="block">
                          <Button size="sm" variant="outline" className="w-full text-xs gap-1 border-amber-300 text-amber-700 hover:bg-amber-50">
                            Browse {getCategoryRoute(q.product_name).label} Flooring →
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Link href="/products" className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:border-amber-300 transition-colors">
            <ShoppingCart className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <span className="text-sm font-medium text-slate-700">Browse Products</span>
          </Link>
          <Link href="/free-measurement" className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:border-amber-300 transition-colors">
            <Phone className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <span className="text-sm font-medium text-slate-700">Book Measurement</span>
          </Link>
          <Link href="/contact" className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:border-amber-300 transition-colors">
            <Mail className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <span className="text-sm font-medium text-slate-700">Contact Us</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
