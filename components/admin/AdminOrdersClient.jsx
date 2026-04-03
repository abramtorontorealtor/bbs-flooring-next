'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Package, DollarSign, Clock, CheckCircle, Eye,
  Phone, Mail, MapPin, CreditCard, AlertTriangle, Warehouse, Save,
  ChevronRight, Truck, ArrowRight, Ban, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminOrdersClient() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [pickupAddress, setPickupAddress] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleNote, setScheduleNote] = useState('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => entities.Order.list('-created_date', 200),
  });

  // ─── Mutations ───

  const capturePaymentMutation = useMutation({
    mutationFn: async (orderId) => {
      const res = await fetch('/api/stripe/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Payment captured successfully! Customer notified.');
      setSelectedOrder(null);
    },
    onError: (e) => toast.error('Capture failed: ' + e.message),
  });

  const confirmEtransferMutation = useMutation({
    mutationFn: async (orderId) => {
      const res = await fetch('/api/orders/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('E-Transfer confirmed! Customer notified via email.');
      setSelectedOrder(null);
    },
    onError: (e) => toast.error('Confirm failed: ' + e.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      const res = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success(`Status updated: ${data.oldStatus} → ${data.newStatus}`);
      setSelectedOrder(null);
    },
    onError: (e) => toast.error('Status update failed: ' + e.message),
  });

  const updatePickupAddressMutation = useMutation({
    mutationFn: async ({ orderId, pickupAddress }) => {
      const res = await fetch('/api/orders/pickup-address', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, pickupAddress }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Pickup address saved — visible to customer');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });

  const scheduleDateMutation = useMutation({
    mutationFn: async ({ orderId, scheduledDate, scheduledNote }) => {
      const res = await fetch('/api/orders/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, scheduledDate, scheduledNote }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Date saved. Customer will be notified when you advance the order status.');
    },
    onError: (e) => toast.error('Schedule failed: ' + e.message),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }) => {
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reason }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Order cancelled — customer notified');
      setSelectedOrder(null);
    },
    onError: (e) => toast.error('Cancel failed: ' + e.message),
  });

  // ─── Handlers ───

  const handleCapturePayment = (orderId) => {
    if (confirm('Capture this payment? The customer\'s card will be charged. This cannot be undone.')) {
      capturePaymentMutation.mutate(orderId);
    }
  };

  const handleConfirmEtransfer = (orderId) => {
    if (confirm('Confirm e-Transfer received? This marks the order as paid and emails the customer a confirmation.')) {
      confirmEtransferMutation.mutate(orderId);
    }
  };

  const handleStatusAdvance = (orderId, newStatus) => {
    const labels = {
      processing: 'Mark as "Preparing"? (Silent — no customer email)',
      shipped: selectedOrder?.delivery_preference === 'pickup'
        ? 'Mark as "Ready for Pickup"? Customer will be emailed with pickup instructions.'
        : 'Mark as "Shipped"? Customer will be emailed.',
      delivered: selectedOrder?.delivery_preference === 'pickup'
        ? 'Mark as "Picked Up / Complete"? Customer will receive a thank-you email.'
        : 'Mark as "Delivered"? Customer will receive a thank-you email.',
    };
    if (confirm(labels[newStatus] || `Change status to ${newStatus}?`)) {
      updateStatusMutation.mutate({ orderId, newStatus });
    }
  };

  const handleCancelOrder = (orderId) => {
    const reason = prompt('Cancel reason?\n\n1 = Out of stock\n2 = Customer requested\n3 = Other\n\nEnter 1, 2, or 3:');
    if (!reason) return;
    const reasonMap = { '1': 'out_of_stock', '2': 'customer_request', '3': 'other' };
    const cancelReason = reasonMap[reason.trim()] || 'other';
    if (confirm(`Cancel this order (${cancelReason.replace(/_/g, ' ')})?\n\nThis releases any authorized funds and emails the customer.`)) {
      cancelOrderMutation.mutate({ orderId, reason: cancelReason });
    }
  };

  // ─── Helpers ───

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  const stats = {
    total: orders.length,
    needsAction: orders.filter(o =>
      ['pending_payment', 'pending', 'awaiting_payment'].includes(o.status) ||
      (o.payment_status === 'authorized' && o.status !== 'cancelled')
    ).length,
    paid: orders.filter(o => ['paid', 'confirmed', 'processing', 'shipped', 'delivered'].includes(o.status)).length,
    totalRevenue: orders.filter(o => o.status !== 'cancelled' && o.status !== 'abandoned').reduce((sum, o) => sum + (o.total || 0), 0),
  };

  const getStatusBadge = (status) => {
    const v = {
      awaiting_payment: { label: 'Awaiting Payment', cls: 'bg-orange-100 text-orange-800' },
      abandoned: { label: 'Abandoned', cls: 'bg-slate-100 text-slate-500' },
      pending_payment: { label: 'Pending Payment', cls: 'bg-yellow-100 text-yellow-800' },
      pending: { label: 'Order Received', cls: 'bg-amber-100 text-amber-800' },
      confirmed: { label: 'Confirmed', cls: 'bg-blue-100 text-blue-800' },
      paid: { label: 'Paid', cls: 'bg-green-100 text-green-800' },
      processing: { label: 'Preparing', cls: 'bg-purple-100 text-purple-800' },
      shipped: { label: 'Shipped / Ready', cls: 'bg-indigo-100 text-indigo-800' },
      delivered: { label: 'Complete', cls: 'bg-emerald-100 text-emerald-800' },
      cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-800' },
      quote_requested: { label: 'Quote Requested', cls: 'bg-cyan-100 text-cyan-800' },
      refunded: { label: 'Refunded', cls: 'bg-rose-100 text-rose-800' },
    }[status] || { label: status, cls: 'bg-slate-100 text-slate-600' };
    return <Badge className={`${v.cls} border-0`}>{v.label}</Badge>;
  };

  const getPaymentBadge = (method, status) => {
    if (method === 'credit_card') {
      const label = status === 'authorized' ? 'CC — Authorized' : status === 'captured' ? 'CC — Captured' : `CC — ${status}`;
      return <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">{label}</Badge>;
    }
    if (method === 'quote_request') return <Badge className="bg-cyan-100 text-cyan-800 border-0 text-xs">Quote</Badge>;
    return <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs">E-Transfer</Badge>;
  };

  const openOrder = (order) => {
    setSelectedOrder(order);
    setPickupAddress(order.pickup_address || '');
    setScheduleDate(order.scheduled_date || '');
    setScheduleNote(order.scheduled_note || '');
  };

  // Determine what actions are available for the current order
  const getOrderActions = (order) => {
    if (!order) return [];
    const actions = [];
    const s = order.status;
    const ps = order.payment_status;
    const isCC = order.payment_method === 'credit_card';
    const isEtransfer = order.payment_method === 'etransfer' || order.payment_method !== 'credit_card';
    const isPickup = order.delivery_preference === 'pickup';
    const notCancelled = s !== 'cancelled' && s !== 'refunded';

    // Payment actions
    if (isCC && ps === 'authorized' && notCancelled) {
      actions.push({ key: 'capture', label: '✅ Capture Payment (Charge Card)', variant: 'default', cls: 'bg-green-600 hover:bg-green-700', action: () => handleCapturePayment(order.id) });
    }
    if (isEtransfer && (ps === 'pending' || s === 'pending_payment') && notCancelled) {
      actions.push({ key: 'confirm-et', label: '🏦 Confirm E-Transfer Received', variant: 'default', cls: 'bg-blue-600 hover:bg-blue-700', action: () => handleConfirmEtransfer(order.id) });
    }

    // Status progression actions
    if (['pending', 'confirmed', 'paid'].includes(s)) {
      actions.push({
        key: 'processing',
        label: '📦 Mark as Preparing',
        variant: 'default',
        cls: 'bg-purple-600 hover:bg-purple-700',
        action: () => handleStatusAdvance(order.id, 'processing'),
      });
    }
    if (s === 'processing') {
      const missingParts = [];
      if (isPickup && !order.pickup_address) missingParts.push('pickup address');
      if (!order.scheduled_date) missingParts.push(isPickup ? 'pickup date' : 'delivery date');
      const blocked = missingParts.length > 0;
      actions.push({
        key: 'shipped',
        label: isPickup ? '🏪 Mark Ready for Pickup' : '🚚 Mark as Shipped',
        variant: 'default',
        cls: blocked ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700',
        disabled: blocked,
        disabledReason: blocked ? `Set ${missingParts.join(' + ')} first` : null,
        action: () => {
          if (blocked) {
            toast.error(`Fill in ${missingParts.join(' and ')} before proceeding.`);
            return;
          }
          handleStatusAdvance(order.id, 'shipped');
        },
      });
    }
    if (s === 'shipped') {
      actions.push({
        key: 'delivered',
        label: isPickup ? '✅ Mark as Picked Up' : '✅ Mark as Delivered',
        variant: 'default',
        cls: 'bg-emerald-600 hover:bg-emerald-700',
        action: () => handleStatusAdvance(order.id, 'delivered'),
      });
    }

    // Cancel is always available unless already terminal
    if (notCancelled && s !== 'delivered') {
      actions.push({ key: 'cancel', label: '❌ Cancel Order', variant: 'destructive', cls: '', action: () => handleCancelOrder(order.id) });
    }

    return actions;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Order Management</h1>
        <p className="text-slate-600">Track and manage all customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-5">
          <p className="text-sm text-amber-600">Needs Action</p>
          <p className="text-2xl font-bold text-amber-600">{stats.needsAction}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-500">Active Orders</p>
          <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="text-2xl font-bold text-emerald-600">C${stats.totalRevenue.toFixed(0)}</p>
        </CardContent></Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm font-medium text-slate-600">Filter:</span>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending_payment">Pending Payment</SelectItem>
            <SelectItem value="pending">Order Received</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Preparing</SelectItem>
            <SelectItem value="shipped">Shipped / Ready</SelectItem>
            <SelectItem value="delivered">Complete</SelectItem>
            <SelectItem value="abandoned">Abandoned</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Order List — Mobile-first card layout */}
      <div className="space-y-3">
        {filteredOrders.length === 0 && (
          <Card><CardContent className="p-8 text-center text-slate-500">No orders found.</CardContent></Card>
        )}
        {filteredOrders.map(order => {
          const needsAction = ['pending_payment', 'pending', 'awaiting_payment'].includes(order.status) ||
            (order.payment_status === 'authorized' && order.status !== 'cancelled');

          return (
            <Card
              key={order.id}
              className={`cursor-pointer transition-all hover:shadow-md active:scale-[0.99] ${needsAction ? 'border-amber-300 bg-amber-50/30' : ''} ${order.fraud_flag ? 'border-red-400 bg-red-50/30' : ''}`}
              onClick={() => openOrder(order)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-amber-600 text-sm">{order.order_number}</span>
                      {getStatusBadge(order.status)}
                      {getPaymentBadge(order.payment_method, order.payment_status)}
                      {order.fraud_flag && <Badge className="bg-red-500 text-white border-0 text-xs">⚠️ FRAUD</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span className="font-medium text-slate-800">{order.customer_name}</span>
                      <span>·</span>
                      <span className="font-semibold text-amber-600">C${order.total?.toFixed(2)}</span>
                      <span>·</span>
                      <span>{format(new Date(order.created_date), 'MMM dd')}</span>
                    </div>
                    {order.delivery_preference === 'pickup' && !order.pickup_address && needsAction && (
                      <p className="text-xs text-amber-600 mt-1">⚠️ Pickup address not set</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ─── Order Detail Dialog ─── */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 flex-wrap">
                <span className="text-xl">{selectedOrder.order_number}</span>
                {getStatusBadge(selectedOrder.status)}
                {getPaymentBadge(selectedOrder.payment_method, selectedOrder.payment_status)}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">

              {/* ─── Fraud Warning ─── */}
              {selectedOrder.fraud_flag && (
                <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-red-900 mb-1">🚨 FRAUD FLAG — Address Mismatch</h3>
                      <p className="text-sm text-red-800">Billing address from Stripe doesn't match shipping address. Verify identity before capturing.</p>
                      <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                        <div className="bg-white rounded p-2">
                          <p className="font-semibold text-red-800">Billing (Stripe)</p>
                          <p>{selectedOrder.billing_address || 'N/A'}</p>
                          <p>{selectedOrder.billing_city} {selectedOrder.billing_postal_code} {selectedOrder.billing_country}</p>
                        </div>
                        <div className="bg-white rounded p-2">
                          <p className="font-semibold text-red-800">Shipping (Customer)</p>
                          <p>{selectedOrder.shipping_address || 'N/A'}</p>
                          <p>{selectedOrder.shipping_city} {selectedOrder.shipping_postal_code}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Actions Panel (TOP — most important) ─── */}
              {(() => {
                const actions = getOrderActions(selectedOrder);
                if (actions.length === 0) return null;
                return (
                  <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-amber-800">⚡ Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {actions.map(a => (
                          <div key={a.key} className="flex flex-col">
                            <Button
                              variant={a.variant}
                              onClick={(e) => { e.stopPropagation(); a.action(); }}
                              disabled={a.disabled || capturePaymentMutation.isPending || confirmEtransferMutation.isPending || updateStatusMutation.isPending || cancelOrderMutation.isPending}
                              className={`${a.cls} text-sm`}
                            >
                              {a.label}
                            </Button>
                            {a.disabledReason && <span className="text-xs text-amber-600 mt-1">⚠️ {a.disabledReason}</span>}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* ─── Pickup Address (prominent for pickup orders) ─── */}
              {selectedOrder.delivery_preference === 'pickup' && (
                <Card className="border-amber-200 bg-amber-50/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Warehouse className="w-5 h-5 text-amber-600" />
                      Pickup Address
                      {!selectedOrder.pickup_address && <Badge className="bg-amber-200 text-amber-800 border-0 text-xs ml-2">NOT SET</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        placeholder="e.g. 6061 Highway 7, Unit B, Markham ON L3P 3B2"
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => updatePickupAddressMutation.mutate({ orderId: selectedOrder.id, pickupAddress: pickupAddress.trim() })}
                        disabled={updatePickupAddressMutation.isPending || !pickupAddress.trim()}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                    </div>
                    {selectedOrder.pickup_address && <p className="text-xs text-green-600 mt-2">✅ Visible to customer on their order page</p>}
                    {!selectedOrder.pickup_address && <p className="text-xs text-amber-600 mt-2">Customer sees "Pickup location will be confirmed after payment"</p>}
                  </CardContent>
                </Card>
              )}

              {/* ─── Schedule Delivery/Pickup Date ─── */}
              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'refunded' && selectedOrder.status !== 'delivered' && (
                <Card className="border-blue-200 bg-blue-50/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Truck className="w-5 h-5 text-blue-600" />
                      {selectedOrder.delivery_preference === 'pickup' ? 'Schedule Pickup Date' : 'Schedule Delivery Date'}
                      {selectedOrder.scheduled_date && <Badge className="bg-green-200 text-green-800 border-0 text-xs ml-2">SCHEDULED</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOrder.scheduled_date && (
                      <p className="text-sm text-green-700 mb-3">
                        ✅ Currently scheduled: <strong>{format(new Date(selectedOrder.scheduled_date + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}</strong>
                        {selectedOrder.scheduled_note && <span className="text-slate-500"> — {selectedOrder.scheduled_note}</span>}
                      </p>
                    )}
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="text-xs text-slate-500 mb-1">Date</Label>
                        <Input
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-slate-500 mb-1">Note (optional)</Label>
                        <Input
                          value={scheduleNote}
                          onChange={(e) => setScheduleNote(e.target.value)}
                          placeholder="e.g. Between 9am-12pm"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!scheduleDate) { toast.error('Pick a date'); return; }
                          if (confirm(`Save ${selectedOrder.delivery_preference === 'pickup' ? 'pickup' : 'delivery'} date: ${scheduleDate}? (No email yet — sent when you mark Ready/Shipped)`)) {
                            scheduleDateMutation.mutate({ orderId: selectedOrder.id, scheduledDate: scheduleDate, scheduledNote: scheduleNote.trim() });
                          }
                        }}
                        disabled={scheduleDateMutation.isPending || !scheduleDate}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {scheduleDateMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ─── Customer Info ─── */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Customer</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="font-semibold text-lg">{selectedOrder.customer_name}</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${selectedOrder.customer_phone}`} className="text-blue-600 hover:underline">{selectedOrder.customer_phone}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${selectedOrder.customer_email}`} className="text-blue-600 hover:underline">{selectedOrder.customer_email}</a>
                  </div>
                  {selectedOrder.shipping_address && (
                    <div className="flex items-start gap-2 pt-2 border-t">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p>{selectedOrder.shipping_address}</p>
                        <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_postal_code}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span>{selectedOrder.delivery_preference === 'pickup' ? 'Warehouse Pickup' : selectedOrder.delivery_preference === 'inside' ? 'Inside Delivery' : selectedOrder.delivery_preference === 'custom_freight' ? 'Custom Freight' : 'Garage Delivery'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* ─── Items ─── */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Items</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{item.product_name}</p>
                          <p className="text-xs text-slate-500">
                            {item.sku && `${item.sku} · `}{item.boxes_required} boxes · {Number(item.actual_sqft).toFixed(1)} sqft
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="font-semibold text-sm">C${Number(item.line_total).toFixed(2)}</p>
                          <p className="text-xs text-slate-400">C${Number(item.price_per_sqft).toFixed(2)}/sqft</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-4 pt-3 border-t space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>C${selectedOrder.subtotal?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Tax (13%)</span><span>C${selectedOrder.tax?.toFixed(2)}</span></div>
                    {selectedOrder.delivery_fee > 0 && <div className="flex justify-between"><span className="text-slate-500">Delivery</span><span>C${selectedOrder.delivery_fee.toFixed(2)}</span></div>}
                    {selectedOrder.processing_fee > 0 && <div className="flex justify-between"><span className="text-slate-500">Processing (2.9%)</span><span className="text-amber-600">C${selectedOrder.processing_fee.toFixed(2)}</span></div>}
                    {selectedOrder.discount > 0 && <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="text-green-600">-C${selectedOrder.discount.toFixed(2)}</span></div>}
                    <div className="flex justify-between pt-2 border-t text-base font-bold">
                      <span>Total</span>
                      <span className="text-amber-600">C${selectedOrder.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">Customer Notes</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-slate-700">{selectedOrder.notes}</p></CardContent>
                </Card>
              )}

              {/* Metadata */}
              <div className="text-xs text-slate-400 space-y-1 pt-2 border-t">
                <p>Created: {format(new Date(selectedOrder.created_date), 'MMM dd, yyyy h:mm a')}</p>
                {selectedOrder.stripe_payment_intent_id && <p>Stripe PI: {selectedOrder.stripe_payment_intent_id}</p>}
                {selectedOrder.terms_accepted_at && <p>Terms accepted: {format(new Date(selectedOrder.terms_accepted_at), 'MMM dd, yyyy h:mm a')}</p>}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
