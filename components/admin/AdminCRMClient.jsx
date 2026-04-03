'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Phone, Mail, Clock, DollarSign, Users, TrendingUp, Calendar,
  MessageSquare, ShoppingCart, Calculator, Ruler, Filter,
  ChevronDown, ChevronUp, RefreshCw, StickyNote, X, CheckCircle,
  CreditCard, MapPin, Package, AlertTriangle, Send, Eye,
  Warehouse, Save, Truck, ArrowRight, Ban, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ─── HELPERS ────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString();
}

function isUrgent(dateStr) {
  if (!dateStr) return false;
  return (new Date() - new Date(dateStr)) > 15 * 60 * 1000;
}

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function weekStart() {
  const d = todayStart();
  d.setDate(d.getDate() - d.getDay());
  return d;
}

const SOURCE_ICONS = {
  quote: Calculator,
  booking: Ruler,
  contact: MessageSquare,
  order: ShoppingCart,
};

const STATUS_CONFIG = {
  new:       { color: 'bg-red-100 text-red-800 border-red-200', label: '🔴 New', priority: 0 },
  urgent:    { color: 'bg-red-200 text-red-900 border-red-300 animate-pulse', label: '🚨 URGENT', priority: -1 },
  contacted: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: '🟡 Contacted', priority: 1 },
  quoted:    { color: 'bg-orange-100 text-orange-800 border-orange-200', label: '🟠 Quoted', priority: 2 },
  booked:    { color: 'bg-green-100 text-green-800 border-green-200', label: '🟢 Booked', priority: 3 },
  confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: '📅 Confirmed', priority: 3 },
  order:     { color: 'bg-blue-100 text-blue-800 border-blue-200', label: '🔵 Order', priority: 4 },
  pending_payment: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: '⏳ Pending Payment', priority: 4 },
  paid:      { color: 'bg-green-100 text-green-800 border-green-200', label: '💰 Paid', priority: 5 },
  processing:{ color: 'bg-purple-100 text-purple-800 border-purple-200', label: '⚙️ Processing', priority: 5 },
  shipped:   { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: '🚚 Shipped', priority: 5 },
  delivered: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: '✅ Delivered', priority: 6 },
  completed: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: '✅ Done', priority: 6 },
  lost:      { color: 'bg-slate-100 text-slate-500 border-slate-200', label: '⚫ Lost', priority: 7 },
  cancelled: { color: 'bg-slate-100 text-slate-500 border-slate-200', label: '⚫ Cancelled', priority: 7 },
};

const LOST_REASONS = [
  'Price too high',
  'Went with competitor',
  'Bad timing / not ready',
  'Ghosted / no response',
  'Out of service area',
  'Product unavailable',
  'Other',
];

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function AdminCRMClient() {
  const queryClient = useQueryClient();
  const urlParams = useSearchParams();
  const initialSource = urlParams.get('source') || 'all';
  const [filterSource, setFilterSource] = useState(initialSource);
  const [filterStatus, setFilterStatus] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedLead, setSelectedLead] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupReference, setPickupReference] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleNote, setScheduleNote] = useState('');

  // ─── DATA QUERIES ───────────────────────────────────────────────────────
  const { data: quotes = [], isLoading: loadingQuotes } = useQuery({
    queryKey: ['crm-quotes'],
    queryFn: () => entities.Quote.list('-created_date', 500),
    refetchInterval: 60000,
  });

  const { data: savedQuotes = [], isLoading: loadingSavedQuotes } = useQuery({
    queryKey: ['crm-saved-quotes'],
    queryFn: () => entities.SavedQuote.list('-created_date', 500),
    refetchInterval: 60000,
  });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['crm-bookings'],
    queryFn: () => entities.Booking.list('-created_date', 500),
    refetchInterval: 60000,
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['crm-orders'],
    queryFn: () => entities.Order.list('-created_date', 200),
    refetchInterval: 60000,
  });

  const { data: contactLeads = [], isLoading: loadingContacts } = useQuery({
    queryKey: ['crm-contacts'],
    queryFn: () => entities.ContactLead.list('-created_date', 500),
    refetchInterval: 60000,
  });

  const isLoading = loadingQuotes || loadingSavedQuotes || loadingBookings || loadingOrders || loadingContacts;

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['crm-quotes'] });
    queryClient.invalidateQueries({ queryKey: ['crm-saved-quotes'] });
    queryClient.invalidateQueries({ queryKey: ['crm-bookings'] });
    queryClient.invalidateQueries({ queryKey: ['crm-orders'] });
    queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
    toast.success('Refreshed');
  };

  // ─── ORDER MUTATIONS ───────────────────────────────────────────────────
  const capturePaymentMutation = useMutation({
    mutationFn: async (orderId) => {
      const r = await fetch('/api/stripe/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err.error || 'Capture failed'); }
      return r.json();
    },
    onSuccess: () => { refreshAll(); toast.success('💰 Payment captured!'); setSelectedLead(null); },
    onError: (err) => toast.error('Capture failed: ' + err.message),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const r = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err.error || 'Cancel failed'); }
      return r.json();
    },
    onSuccess: () => { refreshAll(); toast.success('Order cancelled'); setSelectedLead(null); },
    onError: (err) => toast.error('Cancel failed: ' + err.message),
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }) => {
      return await entities.Order.update(orderId, updates);
    },
    onSuccess: () => { refreshAll(); toast.success('Order updated'); },
    onError: (err) => toast.error('Update failed: ' + err.message),
  });

  const confirmEtransferMutation = useMutation({
    mutationFn: async (orderId) => {
      const r = await fetch('/api/orders/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err.error || err.message || 'Failed'); }
      return r.json();
    },
    onSuccess: () => { refreshAll(); toast.success('💰 E-Transfer confirmed — customer emailed!'); },
    onError: (err) => toast.error('Confirm failed: ' + err.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      const r = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus }),
      });
      if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err.error || 'Failed'); }
      return r.json();
    },
    onSuccess: (data) => { refreshAll(); toast.success(`Status: ${data.oldStatus} → ${data.newStatus}${data.newStatus === 'processing' ? '' : ' — customer emailed'}`); },
    onError: (err) => toast.error('Status update failed: ' + err.message),
  });

  const updatePickupAddressMutation = useMutation({
    mutationFn: async ({ orderId, pickupAddress: addr, pickupReference: ref }) => {
      const r = await fetch('/api/orders/pickup-address', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, pickupAddress: addr, pickupReference: ref }),
      });
      if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err.error || 'Failed'); }
      return r.json();
    },
    onSuccess: () => { refreshAll(); toast.success('Pickup details saved ✅'); },
    onError: (err) => toast.error('Save failed: ' + err.message),
  });

  const scheduleDateMutation = useMutation({
    mutationFn: async ({ orderId, scheduledDate, scheduledNote: note }) => {
      const r = await fetch('/api/orders/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, scheduledDate, scheduledNote: note }),
      });
      if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err.error || 'Failed'); }
      return r.json();
    },
    onSuccess: (data) => { refreshAll(); toast.success(data.emailSent ? '📅 Scheduled — customer emailed!' : '📅 Date saved (email failed — follow up manually)'); },
    onError: (err) => toast.error('Schedule failed: ' + err.message),
  });

  // ─── BOOKING MUTATIONS ─────────────────────────────────────────────────
  const [bookingRescheduleDate, setBookingRescheduleDate] = useState('');
  const [bookingRescheduleTime, setBookingRescheduleTime] = useState('');
  const [bookingCancelReason, setBookingCancelReason] = useState('');

  const bookingAdminAction = useMutation({
    mutationFn: async ({ bookingId, action, preferred_date, preferred_time, cancel_reason }) => {
      const res = await fetch('/api/booking/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action, preferred_date, preferred_time, cancel_reason }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || `${action} failed`); }
      return res.json();
    },
    onSuccess: (data, { action }) => {
      refreshAll();
      const actionLabels = { confirm: 'Booking confirmed', reschedule: 'Rescheduled', cancel: 'Cancelled' };
      const label = actionLabels[action] || 'Done';
      if (data.emailSent) {
        toast.success(`✅ ${label} — customer emailed`);
      } else {
        toast.warning(`⚠️ ${label} — but email failed to send. Call the customer.`);
      }
      setSelectedLead(null);
      setBookingRescheduleDate('');
      setBookingRescheduleTime('');
      setBookingCancelReason('');
    },
    onError: (err) => toast.error(err.message),
  });

  // ─── ORDER ACTION HELPERS ────────────────────────────────────────────────
  const handleCapturePayment = (orderId) => {
    if (confirm('Capture this payment? The customer\'s card will be charged. This cannot be undone.')) {
      capturePaymentMutation.mutate(orderId);
    }
  };

  const handleConfirmEtransfer = (orderId) => {
    if (confirm('Confirm e-Transfer received? This marks the order as paid and emails the customer.')) {
      confirmEtransferMutation.mutate(orderId);
    }
  };

  const handleStatusAdvance = (orderId, newStatus, deliveryPref) => {
    const isPickup = deliveryPref === 'pickup';
    const labels = {
      processing: 'Mark as "Preparing"? (Status update only — no customer email)',
      shipped: isPickup ? 'Mark as "Ready for Pickup"? Customer will be emailed.' : 'Mark as "Shipped"? Customer will be emailed.',
      delivered: isPickup ? 'Mark as "Picked Up / Complete"? Customer will get a thank-you.' : 'Mark as "Delivered"? Customer will get a thank-you.',
    };
    if (confirm(labels[newStatus] || `Change status to ${newStatus}?`)) {
      updateStatusMutation.mutate({ orderId, newStatus });
    }
  };

  const handleCancelOrder = (orderId) => {
    const reason = prompt('Cancel reason?\n\n1 = Out of stock\n2 = Customer requested\n3 = Other');
    if (!reason) return;
    const reasonMap = { '1': 'out_of_stock', '2': 'customer_request', '3': 'other' };
    if (confirm('Cancel this order? Customer will be notified.')) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  const getOrderActions = (o) => {
    if (!o) return [];
    const actions = [];
    const s = o.status;
    const ps = o.payment_status;
    const isCC = o.payment_method === 'credit_card';
    const isEt = o.payment_method !== 'credit_card';
    const isPickup = o.delivery_preference === 'pickup';
    const active = s !== 'cancelled' && s !== 'refunded';

    if (isCC && ps === 'authorized' && active) {
      actions.push({ key: 'capture', label: '✅ Capture Payment (Charge Card)', cls: 'bg-green-600 hover:bg-green-700 text-white', action: () => handleCapturePayment(o.id) });
    }
    if (isEt && (ps === 'pending' || s === 'pending_payment') && active) {
      actions.push({ key: 'confirm-et', label: '🏦 Confirm E-Transfer Received', cls: 'bg-blue-600 hover:bg-blue-700 text-white', action: () => handleConfirmEtransfer(o.id) });
    }
    if (['pending', 'confirmed', 'paid'].includes(s)) {
      actions.push({ key: 'processing', label: '📦 Mark as Preparing', cls: 'bg-purple-600 hover:bg-purple-700 text-white', action: () => handleStatusAdvance(o.id, 'processing', o.delivery_preference) });
    }
    if (s === 'processing') {
      actions.push({ key: 'shipped', label: isPickup ? '🏪 Mark Ready for Pickup' : '🚚 Mark as Shipped', cls: 'bg-indigo-600 hover:bg-indigo-700 text-white', action: () => handleStatusAdvance(o.id, 'shipped', o.delivery_preference) });
    }
    if (s === 'shipped') {
      actions.push({ key: 'delivered', label: isPickup ? '✅ Mark as Picked Up' : '✅ Mark as Delivered', cls: 'bg-emerald-600 hover:bg-emerald-700 text-white', action: () => handleStatusAdvance(o.id, 'delivered', o.delivery_preference) });
    }
    if (active && s !== 'delivered') {
      actions.push({ key: 'cancel', label: '❌ Cancel Order', cls: 'bg-red-600 hover:bg-red-700 text-white', action: () => handleCancelOrder(o.id) });
    }
    return actions;
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

  const openOrderLead = (lead) => {
    setSelectedLead(lead);
    const o = lead.raw;
    setPickupAddress(o.pickup_address || '');
    setPickupReference(o.pickup_reference || '');
    setScheduleDate(o.scheduled_date || '');
    setScheduleNote(o.scheduled_note || '');
  };

  // ─── UNIFIED LEAD LIST ──────────────────────────────────────────────────
  const allLeads = useMemo(() => {
    const leads = [];

    quotes.forEach(q => {
      leads.push({
        id: `quote-${q.id}`, entityId: q.id, source: 'quote',
        name: q.customer_name || 'Anonymous',
        phone: q.customer_phone || '', email: q.customer_email || '',
        value: q.total || 0,
        status: q.lead_status || 'new',
        date: q.created_date,
        details: `${q.square_footage || '?'} sq ft — ${q.product_name || 'Unknown product'}`,
        notes: q.notes || '', lost_reason: q.lost_reason || '',
        raw: q,
        entityType: 'Quote',
      });
    });

    bookings.forEach(b => {
      leads.push({
        id: `booking-${b.id}`, entityId: b.id, source: 'booking',
        name: b.customer_name || 'Anonymous',
        phone: b.customer_phone || '', email: b.customer_email || '',
        value: 0,
        status: b.status === 'completed' ? 'completed' : b.status === 'cancelled' ? 'cancelled' : b.status || 'booked',
        date: b.created_date,
        details: `${b.preferred_date ? new Date(b.preferred_date).toLocaleDateString() : 'No date'} ${b.preferred_time || ''} — ${b.address || 'No address'}`,
        notes: b.notes || '', lost_reason: '',
        raw: b,
      });
    });

    orders.forEach(o => {
      leads.push({
        id: `order-${o.id}`, entityId: o.id, source: 'order',
        name: o.customer_name || o.shipping_name || 'Anonymous',
        phone: o.customer_phone || o.shipping_phone || '', email: o.customer_email || '',
        value: o.total || o.amount || 0,
        status: o.status || 'pending_payment',
        date: o.created_date,
        details: `Order #${o.order_number || o.id} — ${o.payment_method === 'etransfer' ? 'E-Transfer' : 'Credit Card'} — ${o.payment_status || 'pending'}`,
        notes: o.notes || '', lost_reason: '',
        raw: o,
      });
    });

    // SavedQuote entries (from QuoteCalculator — the main quote flow)
    // Deduplicate against Quote entities by matching email + product + date window
    const quoteEmails = new Set(quotes.map(q => `${q.customer_email}|${q.product_name}`.toLowerCase()));
    savedQuotes.forEach(sq => {
      const dedupeKey = `${sq.user_email}|${sq.product_name}`.toLowerCase();
      if (quoteEmails.has(dedupeKey)) return;

      leads.push({
        id: `savedquote-${sq.id}`, entityId: sq.id, source: 'quote',
        name: sq.user_email ? sq.user_email.split('@')[0] : 'Anonymous',
        phone: '', email: sq.user_email || '',
        value: sq.total_estimate || 0,
        status: sq.lead_status || 'new',
        date: sq.created_date,
        details: `${sq.sqft || '?'} sq ft — ${sq.product_name || 'Unknown product'}`,
        notes: sq.notes || '', lost_reason: sq.lost_reason || '',
        raw: sq,
        entityType: 'SavedQuote',
      });
    });

    contactLeads.forEach(c => {
      leads.push({
        id: `contact-${c.id}`, entityId: c.id, source: 'contact',
        name: c.name || 'Anonymous',
        phone: c.phone || '', email: c.email || '',
        value: 0,
        status: c.lead_status || 'new',
        date: c.created_date,
        details: c.message ? c.message.substring(0, 100) + (c.message.length > 100 ? '...' : '') : 'Contact form',
        notes: c.notes || '', lost_reason: c.lost_reason || '',
        raw: c,
      });
    });

    leads.forEach(l => {
      if (l.status === 'new' && isUrgent(l.date)) l.displayStatus = 'urgent';
      else l.displayStatus = l.status;
    });

    return leads;
  }, [quotes, savedQuotes, bookings, orders, contactLeads]);

  // ─── FILTERING & SORTING ───────────────────────────────────────────────
  const filteredLeads = useMemo(() => {
    let result = allLeads;
    if (filterSource !== 'all') result = result.filter(l => l.source === filterSource);
    if (filterStatus === 'active') {
      result = result.filter(l => !['lost', 'cancelled', 'completed', 'delivered'].includes(l.status));
    } else if (filterStatus !== 'all') {
      result = result.filter(l => l.status === filterStatus || l.displayStatus === filterStatus);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(term) ||
        l.phone.includes(term) ||
        l.email.toLowerCase().includes(term)
      );
    }
    result = [...result].sort((a, b) => {
      if (sortField === 'date') {
        const diff = new Date(b.date) - new Date(a.date);
        return sortDir === 'desc' ? diff : -diff;
      }
      if (sortField === 'value') return sortDir === 'desc' ? b.value - a.value : a.value - b.value;
      if (sortField === 'status') {
        const pa = STATUS_CONFIG[a.displayStatus]?.priority ?? 99;
        const pb = STATUS_CONFIG[b.displayStatus]?.priority ?? 99;
        return sortDir === 'desc' ? pa - pb : pb - pa;
      }
      return 0;
    });
    return result;
  }, [allLeads, filterSource, filterStatus, searchTerm, sortField, sortDir]);

  // ─── KPIs ───────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const today = todayStart();
    const week = weekStart();
    const todayLeads = allLeads.filter(l => new Date(l.date) >= today);
    const weekLeads = allLeads.filter(l => new Date(l.date) >= week);
    const newLeads = allLeads.filter(l => l.status === 'new');
    const urgentLeads = allLeads.filter(l => l.displayStatus === 'urgent');
    const pendingCapture = allLeads.filter(l => l.source === 'order' && l.raw.payment_status === 'authorized');
    const pendingEtransfer = allLeads.filter(l => l.source === 'order' && l.raw.payment_method === 'etransfer' && l.raw.payment_status === 'pending');
    const pipeline = allLeads
      .filter(l => !['lost', 'cancelled', 'completed', 'delivered'].includes(l.status))
      .reduce((sum, l) => sum + l.value, 0);
    const weekOrders = weekLeads.filter(l => l.source === 'order');
    const weekRevenue = weekOrders.reduce((sum, l) => sum + l.value, 0);
    return { todayLeads, weekLeads, newLeads, urgentLeads, pendingCapture, pendingEtransfer, pipeline, weekOrders, weekRevenue };
  }, [allLeads]);

  // ─── LEAD STATUS UPDATE ────────────────────────────────────────────────
  const updateLeadStatus = async (lead, newStatus, extraFields = {}) => {
    try {
      const updates = { ...extraFields };
      if (lead.source === 'quote' && lead.entityType === 'SavedQuote') {
        updates.lead_status = newStatus;
        await entities.SavedQuote.update(lead.entityId, updates);
      } else if (lead.source === 'quote') {
        updates.lead_status = newStatus;
        await entities.Quote.update(lead.entityId, updates);
      } else if (lead.source === 'contact') {
        updates.lead_status = newStatus;
        await entities.ContactLead.update(lead.entityId, updates);
      } else if (lead.source === 'booking') {
        updates.status = newStatus;
        await entities.Booking.update(lead.entityId, updates);
      }
      refreshAll();
      toast.success(`Lead marked as ${newStatus}`);
      setSelectedLead(null);
    } catch (error) {
      toast.error('Failed to update: ' + error.message);
    }
  };

  const addNote = async (lead, note) => {
    if (!note.trim()) return;
    try {
      const timestamp = new Date().toLocaleString();
      const existingNotes = lead.notes || '';
      const updatedNotes = `[${timestamp}] ${note}\n${existingNotes}`;
      if (lead.source === 'quote' && lead.entityType === 'SavedQuote') {
        await entities.SavedQuote.update(lead.entityId, { notes: updatedNotes });
      } else if (lead.source === 'quote') {
        await entities.Quote.update(lead.entityId, { notes: updatedNotes });
      } else if (lead.source === 'contact') {
        await entities.ContactLead.update(lead.entityId, { notes: updatedNotes });
      }
      refreshAll();
      toast.success('Note added');
      setNoteText('');
    } catch (error) {
      toast.error('Failed to add note: ' + error.message);
    }
  };

  // ─── SORT BUTTON ────────────────────────────────────────────────────────
  const SortButton = ({ field, label }) => (
    <button
      onClick={() => {
        if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        else { setSortField(field); setSortDir('desc'); }
      }}
      className="flex items-center gap-1 font-semibold text-xs uppercase tracking-wider text-slate-600 hover:text-slate-900"
    >
      {label}
      {sortField === field && (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
    </button>
  );

  // ─── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">

        {/* ── HEADER ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Lead Command Center</h1>
            <p className="text-slate-500 text-sm mt-1">Every lead. One view. No excuses.</p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshAll}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* ── KPI BAR ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <Card className={kpis.urgentLeads.length > 0 ? 'border-red-300 bg-red-50' : ''}>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Today</p>
              <p className="text-2xl font-bold text-slate-800">{kpis.todayLeads.length}</p>
              <p className="text-xs text-slate-500">new leads</p>
              {kpis.urgentLeads.length > 0 && (
                <p className="text-xs text-red-600 font-semibold mt-1">🚨 {kpis.urgentLeads.length} untouched &gt;15min!</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Open Leads</p>
              <p className="text-2xl font-bold text-slate-800">{kpis.newLeads.length}</p>
              <p className="text-xs text-slate-500">awaiting contact</p>
            </CardContent>
          </Card>

          <Card className={kpis.pendingCapture.length > 0 ? 'border-amber-300 bg-amber-50' : ''}>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">💳 To Capture</p>
              <p className="text-2xl font-bold text-amber-600">{kpis.pendingCapture.length}</p>
              {kpis.pendingEtransfer.length > 0 && (
                <p className="text-xs text-slate-500">{kpis.pendingEtransfer.length} e-transfer pending</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pipeline</p>
              <p className="text-2xl font-bold text-slate-800">
                ${kpis.pipeline.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-slate-500">active value</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">This Week</p>
              <p className="text-2xl font-bold text-slate-800">{kpis.weekLeads.length}</p>
              <p className="text-xs text-slate-500">
                {kpis.weekOrders.length} orders · ${kpis.weekRevenue.toLocaleString('en-CA', { minimumFractionDigits: 0 })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── FILTERS ─────────────────────────────────────────────── */}
        <Card className="mb-4">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="Search name, phone, email..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="sm:max-w-xs" />
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All Sources" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="quote">📐 Quotes</SelectItem>
                  <SelectItem value="booking">📏 Bookings</SelectItem>
                  <SelectItem value="contact">💬 Contacts</SelectItem>
                  <SelectItem value="order">🛒 Orders</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Active" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">🔴 New</SelectItem>
                  <SelectItem value="contacted">🟡 Contacted</SelectItem>
                  <SelectItem value="booked">🟢 Booked</SelectItem>
                  <SelectItem value="pending_payment">⏳ Pending Payment</SelectItem>
                  <SelectItem value="paid">💰 Paid</SelectItem>
                  <SelectItem value="lost">⚫ Lost</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-slate-500 self-center ml-auto hidden sm:block">
                {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── LEAD TABLE ──────────────────────────────────────────── */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-slate-500">No leads match your filters</CardContent></Card>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filteredLeads.map(lead => {
                const cfg = STATUS_CONFIG[lead.displayStatus] || STATUS_CONFIG.new;
                const SourceIcon = SOURCE_ICONS[lead.source] || MessageSquare;
                const o = lead.raw;
                return (
                  <Card key={lead.id} className="cursor-pointer active:bg-slate-50"
                    onClick={() => lead.source === 'order' ? openOrderLead(lead) : setSelectedLead(lead)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`${cfg.color} text-xs border`}>{cfg.label}</Badge>
                            <SourceIcon className="w-3.5 h-3.5 text-slate-400" />
                            {lead.source === 'order' && o.fraud_flag && (
                              <Badge className="bg-red-200 text-red-900 text-xs border border-red-300">🚨 FRAUD</Badge>
                            )}
                          </div>
                          <p className="font-semibold text-slate-800 mt-1.5 truncate">{lead.name}</p>
                          <p className="text-xs text-slate-500 truncate">{lead.details}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {lead.value > 0 && <p className="font-bold text-amber-600 text-sm">${lead.value.toLocaleString()}</p>}
                          <p className="text-xs text-slate-400">{timeAgo(lead.date)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1.5 rounded-md font-medium">
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                        )}
                        {lead.source === 'order' && o.payment_status === 'authorized' && o.stripe_payment_intent_id && (
                          <button onClick={e => { e.stopPropagation();
                            if (confirm('Capture this payment?')) capturePaymentMutation.mutate(lead.entityId); }}
                            className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-md font-medium">
                            <CreditCard className="w-3.5 h-3.5" /> Capture
                          </button>
                        )}
                        {lead.source === 'order' && o.payment_method === 'etransfer' && o.payment_status === 'pending' && (
                          <button onClick={e => { e.stopPropagation();
                            updateOrderMutation.mutate({ orderId: lead.entityId, updates: { payment_status: 'completed', status: 'paid' }}); }}
                            className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-md font-medium">
                            <DollarSign className="w-3.5 h-3.5" /> E-Transfer Received
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Desktop table */}
            <Card className="hidden sm:block overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-[140px]"><SortButton field="status" label="Status" /></TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead><SortButton field="value" label="Value" /></TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead><SortButton field="date" label="Age" /></TableHead>
                      <TableHead className="w-[240px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map(lead => {
                      const cfg = STATUS_CONFIG[lead.displayStatus] || STATUS_CONFIG.new;
                      const SourceIcon = SOURCE_ICONS[lead.source] || MessageSquare;
                      const o = lead.raw;
                      return (
                        <TableRow key={lead.id}
                          className={`hover:bg-slate-50 cursor-pointer ${lead.source === 'order' && o.fraud_flag ? 'bg-red-50 hover:bg-red-100' : ''}`}
                          onClick={() => lead.source === 'order' ? openOrderLead(lead) : setSelectedLead(lead)}>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge className={`${cfg.color} text-xs border whitespace-nowrap`}>{cfg.label}</Badge>
                              {lead.source === 'order' && o.fraud_flag && (
                                <div className="flex items-center gap-1 text-red-600 text-xs">
                                  <AlertTriangle className="w-3 h-3" /> FRAUD
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold text-slate-800">{lead.name}</p>
                            {lead.notes && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <StickyNote className="w-3 h-3 text-amber-500" />
                                <span className="text-xs text-amber-600 truncate max-w-[120px]">{lead.notes.split('\n')[0]}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {lead.phone && (
                                <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()}
                                  className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 font-medium">
                                  <Phone className="w-3 h-3" /> {lead.phone}
                                </a>
                              )}
                              {lead.email && (
                                <a href={`mailto:${lead.email}`} onClick={e => e.stopPropagation()}
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                                  <Mail className="w-3 h-3" /> {lead.email}
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <SourceIcon className="w-4 h-4 text-slate-400" />
                              <span className="text-sm capitalize">{lead.source}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {lead.value > 0 ? (
                              <span className="font-bold text-amber-600">${lead.value.toLocaleString('en-CA', { minimumFractionDigits: 0 })}</span>
                            ) : <span className="text-slate-300">—</span>}
                          </TableCell>
                          <TableCell>
                            <p className="text-xs text-slate-600 max-w-[200px] truncate">{lead.details}</p>
                          </TableCell>
                          <TableCell>
                            <span className={`text-sm ${lead.displayStatus === 'urgent' ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                              {timeAgo(lead.date)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap" onClick={e => e.stopPropagation()}>
                              {lead.phone && (
                                <a href={`tel:${lead.phone}`}>
                                  <Button variant="outline" size="sm" className="h-7 text-xs">
                                    <Phone className="w-3 h-3 mr-1" /> Call
                                  </Button>
                                </a>
                              )}
                              {/* Quote/Contact: mark contacted */}
                              {(lead.source === 'quote' || lead.source === 'contact') && lead.status === 'new' && (
                                <Button variant="outline" size="sm" className="h-7 text-xs"
                                  onClick={() => updateLeadStatus(lead, 'contacted')}>
                                  <CheckCircle className="w-3 h-3 mr-1" /> Contacted
                                </Button>
                              )}
                              {/* Order: Capture payment */}
                              {lead.source === 'order' && o.payment_method === 'credit_card' && o.payment_status === 'authorized' && o.stripe_payment_intent_id && (
                                <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                  disabled={capturePaymentMutation.isPending}
                                  onClick={() => { if (confirm('Capture this payment? Cannot be undone.')) capturePaymentMutation.mutate(lead.entityId); }}>
                                  <CreditCard className="w-3 h-3 mr-1" /> Capture
                                </Button>
                              )}
                              {/* Order: E-transfer received */}
                              {lead.source === 'order' && o.payment_method === 'etransfer' && o.payment_status === 'pending' && (
                                <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() => updateOrderMutation.mutate({ orderId: lead.entityId, updates: { payment_status: 'completed', status: 'paid' }})}>
                                  <DollarSign className="w-3 h-3 mr-1" /> Paid
                                </Button>
                              )}
                              {/* Order: Cancel */}
                              {lead.source === 'order' && o.status !== 'cancelled' && o.status !== 'delivered' && (
                                <Button variant="outline" size="sm" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                  disabled={cancelOrderMutation.isPending}
                                  onClick={() => { if (confirm('Cancel this order? This will release funds and notify the customer.')) cancelOrderMutation.mutate(lead.entityId); }}>
                                  <X className="w-3 h-3 mr-1" /> Cancel
                                </Button>
                              )}
                              {/* Booking: Confirm (pending only) */}
                              {lead.source === 'booking' && (o.status === 'pending' || o.status === 'new') && (
                                <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                                  disabled={bookingAdminAction.isPending}
                                  onClick={() => bookingAdminAction.mutate({ bookingId: lead.entityId, action: 'confirm' })}>
                                  <CheckCircle className="w-3 h-3 mr-1" /> Confirm
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
        )}

        {/* ── LEAD DETAIL DIALOG ──────────────────────────────────── */}
        <Dialog open={!!selectedLead} onOpenChange={(open) => { if (!open) { setSelectedLead(null); setLostReason(''); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedLead && (() => {
              const lead = selectedLead;
              const cfg = STATUS_CONFIG[lead.displayStatus] || STATUS_CONFIG.new;
              const o = lead.raw;

              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl flex-wrap">
                      {lead.source === 'order' ? (
                        <>
                          <span>{o.order_number}</span>
                          {getStatusBadge(o.status)}
                          {getPaymentBadge(o.payment_method, o.payment_status)}
                          {o.fraud_flag && <Badge className="bg-red-200 text-red-900 text-xs border border-red-300">🚨 FRAUD</Badge>}
                        </>
                      ) : (
                        <>
                          {lead.name}
                          <Badge className={`${cfg.color} text-xs border`}>{cfg.label}</Badge>
                        </>
                      )}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">

                    {/* ── ORDER DETAIL (full AdminOrders-style layout) ── */}
                    {lead.source === 'order' && (() => {
                      const actions = getOrderActions(o);
                      return (
                        <>
                          {/* Fraud Warning */}
                          {o.fraud_flag && (
                            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <h3 className="font-bold text-red-900 mb-1">🚨 FRAUD FLAG — Address Mismatch</h3>
                                  <p className="text-sm text-red-800">Billing address doesn't match shipping. Verify identity before capturing.</p>
                                  <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                                    <div className="bg-white rounded p-2"><p className="font-semibold text-red-800">Billing (Stripe)</p><p>{o.billing_address || 'N/A'}</p><p>{o.billing_city} {o.billing_postal_code} {o.billing_country}</p></div>
                                    <div className="bg-white rounded p-2"><p className="font-semibold text-red-800">Shipping</p><p>{o.shipping_address || 'N/A'}</p><p>{o.shipping_city} {o.shipping_postal_code}</p></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Actions Panel */}
                          {actions.length > 0 && (
                            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-white">
                              <CardHeader className="pb-3"><CardTitle className="text-base text-amber-800">⚡ Actions</CardTitle></CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  {actions.map(a => (
                                    <Button key={a.key} onClick={(e) => { e.stopPropagation(); a.action(); }}
                                      disabled={capturePaymentMutation.isPending || confirmEtransferMutation.isPending || updateStatusMutation.isPending || cancelOrderMutation.isPending}
                                      className={`${a.cls} text-sm`}>
                                      {a.label}
                                    </Button>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Pickup Details */}
                          {o.delivery_preference === 'pickup' && (() => {
                            const isPaid = o.payment_status === 'captured' || o.payment_status === 'completed' || o.payment_status === 'paid';
                            return (
                            <Card className={`border-amber-200 ${isPaid ? 'bg-amber-50/30' : 'bg-slate-50 opacity-75'}`}>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Warehouse className="w-5 h-5 text-amber-600" /> Pickup Details
                                  {!o.pickup_address && <Badge className="bg-amber-200 text-amber-800 border-0 text-xs ml-2">NOT SET</Badge>}
                                  {!isPaid && <Badge className="bg-red-200 text-red-800 border-0 text-xs ml-2">🔒 CAPTURE FIRST</Badge>}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {!isPaid && (
                                  <p className="text-sm text-red-600 font-medium">⚠️ Capture payment before setting pickup details. Warehouse address is not revealed until payment is secured.</p>
                                )}
                                <div>
                                  <Label className="text-xs text-slate-500">Warehouse Address</Label>
                                  <Input value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)}
                                    placeholder="e.g. 123 Warehouse Blvd, Unit 5, Vaughan ON" className="mt-1"
                                    disabled={!isPaid} />
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-500">Pickup Reference # (customer shows this to warehouse)</Label>
                                  <Input value={pickupReference} onChange={(e) => setPickupReference(e.target.value)}
                                    placeholder="e.g. PO-12345 or INV-67890" className="mt-1"
                                    disabled={!isPaid} />
                                </div>
                                <Button size="sm" onClick={() => updatePickupAddressMutation.mutate({ orderId: o.id, pickupAddress: pickupAddress.trim(), pickupReference: pickupReference.trim() })}
                                  disabled={updatePickupAddressMutation.isPending || !pickupAddress.trim() || !isPaid} className="bg-amber-600 hover:bg-amber-700 w-full">
                                  <Save className="w-4 h-4 mr-1" /> Save Pickup Details
                                </Button>
                                {o.pickup_address ? (
                                  <div className="text-xs space-y-1">
                                    <p className="text-green-600">✅ Address visible to customer</p>
                                    {o.pickup_reference && <p className="text-green-600">🔖 Reference: {o.pickup_reference}</p>}
                                  </div>
                                ) : isPaid ? (
                                  <p className="text-xs text-amber-600">Customer sees &quot;We&apos;ll confirm the pickup location shortly&quot;</p>
                                ) : (
                                  <p className="text-xs text-slate-400">Customer sees &quot;Pickup location will be confirmed after payment&quot;</p>
                                )}
                              </CardContent>
                            </Card>
                            );
                          })()}

                          {/* Schedule Date */}
                          {o.status !== 'cancelled' && o.status !== 'refunded' && o.status !== 'delivered' && (
                            <Card className="border-blue-200 bg-blue-50/30">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Truck className="w-5 h-5 text-blue-600" />
                                  {o.delivery_preference === 'pickup' ? 'Schedule Pickup Date' : 'Schedule Delivery Date'}
                                  {o.scheduled_date && <Badge className="bg-green-200 text-green-800 border-0 text-xs ml-2">SCHEDULED</Badge>}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {o.scheduled_date && (
                                  <p className="text-sm text-green-700 mb-3">
                                    ✅ Scheduled: <strong>{format(new Date(o.scheduled_date + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}</strong>
                                    {o.scheduled_note && <span className="text-slate-500"> — {o.scheduled_note}</span>}
                                  </p>
                                )}
                                <div className="flex gap-2 items-end">
                                  <div className="flex-1">
                                    <Label className="text-xs text-slate-500 mb-1">Date</Label>
                                    <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                                      min={new Date().toISOString().split('T')[0]} />
                                  </div>
                                  <div className="flex-1">
                                    <Label className="text-xs text-slate-500 mb-1">Note (optional)</Label>
                                    <Input value={scheduleNote} onChange={(e) => setScheduleNote(e.target.value)} placeholder="e.g. 9am-12pm" />
                                  </div>
                                  <Button size="sm" onClick={() => {
                                    if (!scheduleDate) { toast.error('Pick a date'); return; }
                                    if (confirm(`Schedule ${o.delivery_preference === 'pickup' ? 'pickup' : 'delivery'} for ${scheduleDate}? Customer will be emailed.`)) {
                                      scheduleDateMutation.mutate({ orderId: o.id, scheduledDate: scheduleDate, scheduledNote: scheduleNote.trim() });
                                    }
                                  }} disabled={scheduleDateMutation.isPending || !scheduleDate} className="bg-blue-600 hover:bg-blue-700">
                                    <Mail className="w-4 h-4 mr-1" /> {scheduleDateMutation.isPending ? 'Sending...' : 'Send'}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Customer Info */}
                          <Card>
                            <CardHeader className="pb-3"><CardTitle className="text-base">Customer</CardTitle></CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <p className="font-semibold text-lg">{o.customer_name}</p>
                              {o.customer_phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><a href={`tel:${o.customer_phone}`} className="text-blue-600 hover:underline">{o.customer_phone}</a></div>}
                              {o.customer_email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /><a href={`mailto:${o.customer_email}`} className="text-blue-600 hover:underline">{o.customer_email}</a></div>}
                              {o.shipping_address && (
                                <div className="flex items-start gap-2 pt-2 border-t">
                                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                  <div><p>{o.shipping_address}</p><p>{o.shipping_city}, {o.shipping_postal_code}</p></div>
                                </div>
                              )}
                              <div className="flex items-center gap-2 pt-1">
                                <Package className="w-4 h-4 text-slate-400" />
                                <span>{o.delivery_preference === 'pickup' ? 'Warehouse Pickup' : o.delivery_preference === 'inside' ? 'Inside Delivery' : o.delivery_preference === 'custom_freight' ? 'Custom Freight' : 'Garage Delivery'}</span>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Items + Totals */}
                          {o.items && o.items.length > 0 && (
                            <Card>
                              <CardHeader className="pb-3"><CardTitle className="text-base">Items</CardTitle></CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {o.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{item.product_name}</p>
                                        <p className="text-xs text-slate-500">{item.sku && `${item.sku} · `}{item.boxes_required} boxes · {Number(item.actual_sqft).toFixed(1)} sqft</p>
                                      </div>
                                      <div className="text-right flex-shrink-0 ml-3">
                                        <p className="font-semibold text-sm">C${Number(item.line_total).toFixed(2)}</p>
                                        <p className="text-xs text-slate-400">C${Number(item.price_per_sqft).toFixed(2)}/sqft</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 pt-3 border-t space-y-1 text-sm">
                                  <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>C${o.subtotal?.toFixed(2)}</span></div>
                                  <div className="flex justify-between"><span className="text-slate-500">Tax (13%)</span><span>C${o.tax?.toFixed(2)}</span></div>
                                  {o.delivery_fee > 0 && <div className="flex justify-between"><span className="text-slate-500">Delivery</span><span>C${o.delivery_fee.toFixed(2)}</span></div>}
                                  {o.processing_fee > 0 && <div className="flex justify-between"><span className="text-slate-500">Processing (2.9%)</span><span className="text-amber-600">C${o.processing_fee.toFixed(2)}</span></div>}
                                  {o.discount > 0 && <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="text-green-600">-C${o.discount.toFixed(2)}</span></div>}
                                  <div className="flex justify-between pt-2 border-t text-base font-bold"><span>Total</span><span className="text-amber-600">C${o.total?.toFixed(2)}</span></div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Notes */}
                          {o.notes && (
                            <Card>
                              <CardHeader className="pb-3"><CardTitle className="text-base">Customer Notes</CardTitle></CardHeader>
                              <CardContent><p className="text-sm text-slate-700">{o.notes}</p></CardContent>
                            </Card>
                          )}

                          {/* Metadata */}
                          <div className="text-xs text-slate-400 space-y-1 pt-2 border-t">
                            <p>Created: {format(new Date(o.created_date), 'MMM dd, yyyy h:mm a')}</p>
                            {o.stripe_payment_intent_id && <p>Stripe PI: {o.stripe_payment_intent_id}</p>}
                          </div>
                        </>
                      );
                    })()}

                    {/* ── NON-ORDER: Contact buttons + Info card ────── */}
                    {lead.source !== 'order' && (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`}>
                              <Button className="bg-green-600 hover:bg-green-700 text-white">
                                <Phone className="w-4 h-4 mr-2" /> {lead.phone}
                              </Button>
                            </a>
                          )}
                          {lead.email && (
                            <a href={`mailto:${lead.email}`}>
                              <Button variant="outline"><Mail className="w-4 h-4 mr-2" /> {lead.email}</Button>
                            </a>
                          )}
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Source</span>
                            <span className="font-medium capitalize">{lead.source}</span>
                          </div>
                          {lead.value > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Value</span>
                              <span className="font-bold text-amber-600">${lead.value.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-slate-500">Received</span>
                            <span>{new Date(lead.date).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Age</span>
                            <span className={lead.displayStatus === 'urgent' ? 'text-red-600 font-bold' : ''}>{timeAgo(lead.date)}</span>
                          </div>
                          <div className="pt-1 border-t">
                            <span className="text-slate-500">Details</span>
                            <p className="mt-1">{lead.details}</p>
                          </div>

                          {/* Booking-specific */}
                          {lead.source === 'booking' && (
                            <>
                              {o.address && <div className="flex justify-between pt-1 border-t"><span className="text-slate-500">Address</span><span>{o.address}</span></div>}
                              {o.preferred_date && <div className="flex justify-between"><span className="text-slate-500">Appointment</span><span>{new Date(o.preferred_date).toLocaleDateString()} {o.preferred_time || ''}</span></div>}
                            </>
                          )}

                          {/* Quote-specific */}
                          {lead.source === 'quote' && o.square_footage && (
                            <div className="pt-1 border-t grid grid-cols-2 gap-2 text-xs">
                              {o.flooring_cost > 0 && <div className="flex justify-between"><span className="text-slate-500">Flooring</span><span>C${o.flooring_cost?.toFixed(2)}</span></div>}
                              {o.installation_cost > 0 && <div className="flex justify-between"><span className="text-slate-500">Install</span><span>C${o.installation_cost?.toFixed(2)}</span></div>}
                              {o.removal_cost > 0 && <div className="flex justify-between"><span className="text-slate-500">Removal</span><span>C${o.removal_cost?.toFixed(2)}</span></div>}
                              {o.delivery_cost > 0 && <div className="flex justify-between"><span className="text-slate-500">Delivery</span><span>C${o.delivery_cost?.toFixed(2)}</span></div>}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* ── NOTES ────────────────────────────────────── */}
                    {(lead.source === 'quote' || lead.source === 'contact') && (
                      <div>
                        <Label className="text-sm font-semibold">Notes</Label>
                        {lead.notes && (
                          <pre className="text-xs bg-amber-50 border border-amber-200 rounded p-2 mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">{lead.notes}</pre>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Input placeholder="Add a note..." value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') addNote(lead, noteText); }}
                            className="text-sm" />
                          <Button size="sm" onClick={() => addNote(lead, noteText)} disabled={!noteText.trim()}>Add</Button>
                        </div>
                      </div>
                    )}

                    {/* ── ACTION BUTTONS ───────────────────────────── */}
                    <div className="space-y-3 pt-2 border-t">

                      {/* ORDER ACTIONS */}
                      {lead.source === 'order' && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Order Actions</Label>

                          {/* Capture payment (credit card authorized) */}
                          {o.payment_method === 'credit_card' && o.payment_status === 'authorized' && o.stripe_payment_intent_id && (
                            <div className="flex gap-2">
                              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={capturePaymentMutation.isPending}
                                onClick={() => { if (confirm('Capture this payment? This cannot be undone.')) capturePaymentMutation.mutate(lead.entityId); }}>
                                {capturePaymentMutation.isPending ? '⏳ Capturing...' : '💰 Capture Payment'}
                              </Button>
                              <Button variant="destructive" className="flex-1"
                                disabled={cancelOrderMutation.isPending}
                                onClick={() => { if (confirm('Cancel this order? This will release funds and notify the customer.')) cancelOrderMutation.mutate(lead.entityId); }}>
                                {cancelOrderMutation.isPending ? '⏳ Cancelling...' : '❌ Cancel Order'}
                              </Button>
                            </div>
                          )}

                          {/* Mark e-transfer received */}
                          {o.payment_method === 'etransfer' && o.payment_status === 'pending' && (
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => updateOrderMutation.mutate({ orderId: lead.entityId, updates: { payment_status: 'completed', status: 'paid' }})}>
                              ✅ Mark as Paid (E-Transfer Received)
                            </Button>
                          )}

                          {/* Order status dropdown */}
                          <div className="flex gap-2 items-center">
                            <Label className="text-xs text-slate-500 whitespace-nowrap">Change Status:</Label>
                            <Select value={o.status} onValueChange={(val) => updateOrderMutation.mutate({ orderId: lead.entityId, updates: { status: val }})}>
                              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
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
                          </div>
                        </div>
                      )}

                      {/* BOOKING ACTIONS */}
                      {lead.source === 'booking' && (
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold">Booking Actions</Label>

                          {/* Confirm button — only for pending bookings */}
                          {(o.status === 'pending' || o.status === 'new') && (
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white"
                              disabled={bookingAdminAction.isPending}
                              onClick={() => bookingAdminAction.mutate({ bookingId: lead.entityId, action: 'confirm' })}>
                              {bookingAdminAction.isPending ? '⏳ Confirming...' : '✅ Confirm Booking (sends email)'}
                            </Button>
                          )}

                          {/* Reschedule — available for pending/confirmed */}
                          {!['completed', 'cancelled'].includes(o.status) && (
                            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                              <Label className="text-xs font-semibold text-slate-600">Reschedule</Label>
                              <div className="flex gap-2">
                                <Input type="date" value={bookingRescheduleDate}
                                  onChange={(e) => setBookingRescheduleDate(e.target.value)}
                                  className="h-8 text-sm flex-1"
                                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} />
                                <select value={bookingRescheduleTime}
                                  onChange={(e) => setBookingRescheduleTime(e.target.value)}
                                  className="h-8 rounded-md border border-input bg-background px-2 text-sm">
                                  <option value="">Time...</option>
                                  <option value="11:00 AM">11:00 AM</option>
                                  <option value="11:30 AM">11:30 AM</option>
                                  <option value="12:00 PM">12:00 PM</option>
                                  <option value="12:30 PM">12:30 PM</option>
                                  <option value="1:00 PM">1:00 PM</option>
                                  <option value="1:30 PM">1:30 PM</option>
                                  <option value="5:00 PM">5:00 PM</option>
                                </select>
                              </div>
                              <Button size="sm" variant="outline" className="w-full"
                                disabled={!bookingRescheduleDate || bookingAdminAction.isPending}
                                onClick={() => bookingAdminAction.mutate({
                                  bookingId: lead.entityId,
                                  action: 'reschedule',
                                  preferred_date: bookingRescheduleDate,
                                  preferred_time: bookingRescheduleTime,
                                })}>
                                📅 Reschedule (sends email)
                              </Button>
                            </div>
                          )}

                          {/* Cancel — available for pending/confirmed */}
                          {!['completed', 'cancelled'].includes(o.status) && (
                            <div className="bg-red-50 rounded-lg p-3 space-y-2">
                              <Label className="text-xs font-semibold text-red-600">Cancel Booking</Label>
                              <Input placeholder="Reason (optional)" value={bookingCancelReason}
                                onChange={(e) => setBookingCancelReason(e.target.value)}
                                className="h-8 text-sm" />
                              <Button size="sm" variant="destructive" className="w-full"
                                disabled={bookingAdminAction.isPending}
                                onClick={() => {
                                  if (confirm('Cancel this booking? The customer will be emailed.')) {
                                    bookingAdminAction.mutate({ bookingId: lead.entityId, action: 'cancel', cancel_reason: bookingCancelReason });
                                  }
                                }}>
                                ❌ Cancel Booking (sends email)
                              </Button>
                            </div>
                          )}

                          {/* Mark complete — for confirmed bookings after the visit */}
                          {o.status === 'confirmed' && (
                            <Button size="sm" variant="outline" className="w-full border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                              onClick={() => entities.Booking.update(lead.entityId, { status: 'completed' }).then(() => { refreshAll(); toast.success('Marked complete'); setSelectedLead(null); })}>
                              ✅ Mark as Completed
                            </Button>
                          )}
                        </div>
                      )}

                      {/* QUOTE / CONTACT STATUS ACTIONS */}
                      {(lead.source === 'quote' || lead.source === 'contact') && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Lead Status</Label>
                          <div className="flex flex-wrap gap-2">
                            {lead.status !== 'contacted' && (
                              <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-800 hover:bg-yellow-50"
                                onClick={() => updateLeadStatus(lead, 'contacted')}>🟡 Contacted</Button>
                            )}
                            {lead.status !== 'quoted' && lead.source === 'contact' && (
                              <Button size="sm" variant="outline" className="border-orange-300 text-orange-800 hover:bg-orange-50"
                                onClick={() => updateLeadStatus(lead, 'quoted')}>🟠 Quoted</Button>
                            )}
                            {lead.status !== 'booked' && (
                              <Button size="sm" variant="outline" className="border-green-300 text-green-800 hover:bg-green-50"
                                onClick={() => updateLeadStatus(lead, 'booked')}>🟢 Booked</Button>
                            )}
                            {lead.status !== 'completed' && (
                              <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                                onClick={() => updateLeadStatus(lead, 'completed')}>✅ Completed</Button>
                            )}
                          </div>

                          {/* Lost flow */}
                          {lead.status !== 'lost' && (
                            <div className="mt-2 pt-2 border-t">
                              <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <Label className="text-xs text-slate-500">Mark as Lost</Label>
                                  <Select value={lostReason} onValueChange={setLostReason}>
                                    <SelectTrigger className="h-8 text-sm mt-1"><SelectValue placeholder="Why did we lose this?" /></SelectTrigger>
                                    <SelectContent>
                                      {LOST_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button size="sm" variant="outline" className="border-slate-300 text-slate-600 h-8"
                                  disabled={!lostReason}
                                  onClick={() => { updateLeadStatus(lead, 'lost', { lost_reason: lostReason }); setLostReason(''); }}>
                                  ⚫ Mark Lost
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
