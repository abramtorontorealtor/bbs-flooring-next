'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Package, DollarSign, Clock, CheckCircle, Eye,
  Phone, Mail, MapPin, CreditCard, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminOrdersClient() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => entities.Order.list('-created_date', 200),
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }) => {
      return await entities.Order.update(orderId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Order updated successfully');
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast.error('Failed to update order: ' + error.message);
    },
  });

  const capturePaymentMutation = useMutation({
    mutationFn: async (orderId) => {
      const response = await fetch('/api/stripe/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to capture payment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Payment captured successfully!');
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast.error('Failed to capture payment: ' + error.message);
    },
  });

  const confirmEtransferMutation = useMutation({
    mutationFn: async (orderId) => {
      const response = await fetch('/api/orders/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to confirm payment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('E-Transfer confirmed! Customer notified via email.');
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast.error('Failed to confirm payment: ' + error.message);
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }) => {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reason }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to cancel order');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Order cancelled — customer notified via email');
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast.error('Failed to cancel order: ' + error.message);
    },
  });

  const handleStatusChange = async (orderId, newStatus) => {
    updateOrderMutation.mutate({ orderId, updates: { status: newStatus } });
  };

  const handleCapturePayment = async (orderId) => {
    if (confirm('Are you sure you want to capture this payment? This action cannot be undone.')) {
      capturePaymentMutation.mutate(orderId);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt(
      'Cancel reason?\n\n1 = Out of stock\n2 = Customer requested\n3 = Other\n\nEnter 1, 2, or 3:'
    );
    if (!reason) return; // user hit Cancel
    const reasonMap = { '1': 'out_of_stock', '2': 'customer_request', '3': 'other' };
    const cancelReason = reasonMap[reason.trim()] || 'other';
    if (
      confirm(
        `Cancel this order (${cancelReason.replace(/_/g, ' ')})?\n\nThis will release any authorized funds and email the customer a cancellation notice.`
      )
    ) {
      cancelOrderMutation.mutate({ orderId, reason: cancelReason });
    }
  };

  const filteredOrders =
    filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending_payment').length,
    paid: orders.filter((o) => o.status === 'paid' || o.status === 'confirmed').length,
    totalRevenue: orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0),
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending_payment: { label: 'Pending Payment', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
      confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
      processing: { label: 'Processing', className: 'bg-purple-100 text-purple-800' },
      shipped: { label: 'Shipped', className: 'bg-indigo-100 text-indigo-800' },
      delivered: { label: 'Delivered', className: 'bg-emerald-100 text-emerald-800' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
    };
    const variant = variants[status] || variants.pending_payment;
    return <Badge className={`${variant.className} border-0`}>{variant.label}</Badge>;
  };

  const getPaymentMethodBadge = (method) => {
    if (method === 'credit_card') {
      return <Badge className="bg-blue-100 text-blue-800 border-0">Credit Card</Badge>;
    }
    return <Badge className="bg-emerald-100 text-emerald-800 border-0">E-Transfer</Badge>;
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <Package className="w-10 h-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pending Payment</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Paid Orders</p>
                <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-600">
                  C${stats.totalRevenue.toFixed(0)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Filter by Status:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending_payment">Pending Payment</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className={order.fraud_flag ? 'bg-red-50' : ''}>
                  <TableCell className="text-sm">
                    {format(new Date(order.created_date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="font-semibold text-amber-600">
                    <div>
                      {order.order_number}
                      {order.fraud_flag && (
                        <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          FRAUD FLAG
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-slate-500">{order.customer_phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">C${order.total?.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getPaymentMethodBadge(order.payment_method)}
                      {order.payment_status === 'authorized' && (
                        <Badge className="bg-amber-100 text-amber-800 border-0 block">
                          Authorized
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        {getStatusBadge(order.status)}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending_payment">Pending Payment</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {order.payment_method === 'credit_card' &&
                        order.payment_status === 'authorized' &&
                        order.stripe_payment_intent_id && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleCapturePayment(order.id)}
                            disabled={capturePaymentMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CreditCard className="w-4 h-4 mr-1" />
                            Capture
                          </Button>
                        )}
                      {order.payment_method !== 'credit_card' &&
                        order.payment_status === 'pending' &&
                        order.status !== 'cancelled' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              if (confirm('Confirm e-Transfer received? This will mark the order as paid and email the customer.')) {
                                confirmEtransferMutation.mutate(order.id);
                              }
                            }}
                            disabled={confirmEtransferMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            🏦 {confirmEtransferMutation.isPending ? 'Confirming...' : 'Confirm E-Transfer'}
                          </Button>
                        )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Order Details - {selectedOrder.order_number}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Fraud Warning */}
              {selectedOrder.fraud_flag && (
                <Card className="border-2 border-red-500 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-red-900 mb-2">
                          🚨 POTENTIAL FRAUD - ADDRESS MISMATCH
                        </h3>
                        <p className="text-sm text-red-800 mb-3">
                          The billing address from Stripe does not match the shipping address provided.
                        </p>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="bg-white p-3 rounded">
                            <p className="font-semibold text-red-900 mb-1">
                              Billing Address (Stripe):
                            </p>
                            <p className="text-slate-700">
                              {selectedOrder.billing_address || 'N/A'}
                            </p>
                            <p className="text-slate-700">
                              {selectedOrder.billing_city} {selectedOrder.billing_postal_code}
                            </p>
                            <p className="text-slate-700">{selectedOrder.billing_country}</p>
                          </div>
                          <div className="bg-white p-3 rounded">
                            <p className="font-semibold text-red-900 mb-1">Shipping Address:</p>
                            <p className="text-slate-700">
                              {selectedOrder.shipping_address || 'N/A'}
                            </p>
                            <p className="text-slate-700">
                              {selectedOrder.shipping_city} {selectedOrder.shipping_postal_code}
                            </p>
                          </div>
                        </div>

                        <p className="text-red-900 font-bold mt-3">
                          ⚠️ VERIFY CUSTOMER IDENTITY BEFORE CAPTURING PAYMENT
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{selectedOrder.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <a
                      href={`tel:${selectedOrder.customer_phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedOrder.customer_phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <a
                      href={`mailto:${selectedOrder.customer_email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedOrder.customer_email}
                    </a>
                  </div>
                  {selectedOrder.shipping_address && (
                    <div className="flex items-start gap-2 mt-3">
                      <MapPin className="w-4 h-4 text-slate-500 mt-1" />
                      <div>
                        <p className="font-semibold">Shipping Address:</p>
                        <div>{selectedOrder.shipping_address}</div>
                        <div>
                          {selectedOrder.shipping_city}, {selectedOrder.shipping_postal_code}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedOrder.delivery_preference && (
                    <div className="flex items-center gap-2 mt-2">
                      <Package className="w-4 h-4 text-slate-500" />
                      <span>
                        {selectedOrder.delivery_preference === 'pickup'
                          ? 'Warehouse Pickup'
                          : selectedOrder.delivery_preference === 'inside'
                          ? 'Inside House Delivery'
                          : 'Garage Delivery'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-slate-600">
                            {item.boxes_required} boxes × {item.sqft_per_box} sqft ={' '}
                            {item.actual_sqft} sqft
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">C${item.line_total.toFixed(2)}</div>
                          <div className="text-xs text-slate-500">
                            C${item.price_per_sqft.toFixed(2)}/sqft
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-medium">C${selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax (13%):</span>
                    <span className="font-medium">C${selectedOrder.tax?.toFixed(2)}</span>
                  </div>
                  {selectedOrder.delivery_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Delivery Fee:</span>
                      <span className="font-medium">
                        C${selectedOrder.delivery_fee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedOrder.processing_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Processing Fee (2.9%):</span>
                      <span className="font-medium text-amber-600">
                        C${selectedOrder.processing_fee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-amber-600">C${selectedOrder.total?.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedOrder.payment_method === 'credit_card' &&
                  selectedOrder.payment_status === 'authorized' && (
                    <>
                      <Button
                        onClick={() => handleCapturePayment(selectedOrder.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={capturePaymentMutation.isPending}
                      >
                        {capturePaymentMutation.isPending ? 'Capturing...' : '✅ Capture Payment'}
                      </Button>
                      <Button
                        onClick={() => handleCancelOrder(selectedOrder.id)}
                        variant="destructive"
                        className="flex-1"
                        disabled={cancelOrderMutation.isPending}
                      >
                        {cancelOrderMutation.isPending ? 'Cancelling...' : '❌ Cancel Order'}
                      </Button>
                    </>
                  )}
                {selectedOrder.payment_method !== 'credit_card' &&
                  selectedOrder.payment_status === 'pending' &&
                  selectedOrder.status !== 'cancelled' && (
                    <Button
                      onClick={() => {
                        if (confirm('Confirm e-Transfer received? This will mark the order as paid and email the customer a confirmation.')) {
                          confirmEtransferMutation.mutate(selectedOrder.id);
                        }
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={confirmEtransferMutation.isPending}
                    >
                      {confirmEtransferMutation.isPending ? 'Confirming...' : '🏦 Confirm E-Transfer — Notify Customer'}
                    </Button>
                  )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
