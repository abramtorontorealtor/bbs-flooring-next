'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  CreditCard, MapPin, Package, AlertTriangle, Send, Eye
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [filterSource, setFilterSource] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedLead, setSelectedLead] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [lostReason, setLostReason] = useState('');

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
      return fetch('/api/admin/captureStripePayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      }).then(r => r.json());
    },
    onSuccess: () => { refreshAll(); toast.success('💰 Payment captured!'); setSelectedLead(null); },
    onError: (err) => toast.error('Capture failed: ' + err.message),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      return fetch('/api/admin/cancelStripeOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      }).then(r => r.json());
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

  // ─── BOOKING MUTATIONS ─────────────────────────────────────────────────
  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }) => entities.Booking.update(id, { status }),
    onSuccess: () => { refreshAll(); toast.success('Booking updated'); },
    onError: (err) => toast.error('Update failed: ' + err.message),
  });

  const sendBookingEmailMutation = useMutation({
    mutationFn: (bookingData) => {
      const { __email_type, ...data } = bookingData;
      return fetch('/api/admin/sendBookingConfirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, email_type: __email_type || 'confirmation' }),
      }).then(r => r.json());
    },
    onSuccess: () => toast.success('Confirmation email sent'),
    onError: (err) => toast.error('Email failed: ' + err.message),
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ booking_id, new_date }) =>
      fetch('/api/admin/updateBookingDate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id, new_date }),
      }).then(r => r.json()),
    onSuccess: (_, { booking_id, new_date }) => {
      refreshAll();
      toast.success('Booking rescheduled');
      const booking = bookings.find(b => b.id === booking_id);
      if (booking?.customer_email) {
        sendBookingEmailMutation.mutate({ ...booking, preferred_date: new_date, __email_type: 'reschedule' });
      }
    },
    onError: (err) => toast.error('Reschedule failed: ' + err.message),
  });

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
                    onClick={() => setSelectedLead(lead)}>
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
                          onClick={() => setSelectedLead(lead)}>
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
                              {/* Booking: Send confirmation */}
                              {lead.source === 'booking' && (
                                <Button variant="outline" size="sm" className="h-7 text-xs"
                                  disabled={sendBookingEmailMutation.isPending}
                                  onClick={() => sendBookingEmailMutation.mutate(lead.raw)}>
                                  <Send className="w-3 h-3 mr-1" /> Email
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
                      {lead.name}
                      <Badge className={`${cfg.color} text-xs border`}>{cfg.label}</Badge>
                      {lead.source === 'order' && o.fraud_flag && (
                        <Badge className="bg-red-200 text-red-900 text-xs border border-red-300">🚨 FRAUD FLAG</Badge>
                      )}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">

                    {/* ── FRAUD WARNING (Orders) ──────────────────── */}
                    {lead.source === 'order' && o.fraud_flag && (
                      <Card className="border-2 border-red-500 bg-red-50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                            <div>
                              <p className="font-bold text-red-900 mb-2">ADDRESS MISMATCH — VERIFY BEFORE CAPTURE</p>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-white p-2 rounded">
                                  <p className="font-semibold text-red-900 text-xs">Billing (Stripe):</p>
                                  <p className="text-slate-700">{o.billing_address || 'N/A'}</p>
                                  <p className="text-slate-700">{o.billing_city} {o.billing_postal_code}</p>
                                </div>
                                <div className="bg-white p-2 rounded">
                                  <p className="font-semibold text-red-900 text-xs">Shipping:</p>
                                  <p className="text-slate-700">{o.shipping_address || 'N/A'}</p>
                                  <p className="text-slate-700">{o.shipping_city} {o.shipping_postal_code}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* ── CONTACT BUTTONS ─────────────────────────── */}
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

                    {/* ── INFO CARD ────────────────────────────────── */}
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

                      {/* Order-specific info */}
                      {lead.source === 'order' && (
                        <>
                          <div className="flex justify-between pt-1 border-t">
                            <span className="text-slate-500">Payment</span>
                            <span className="font-medium">
                              {o.payment_method === 'etransfer' ? 'E-Transfer' : 'Credit Card'} — {o.payment_status || 'pending'}
                            </span>
                          </div>
                          {o.shipping_address && (
                            <div className="pt-1 border-t">
                              <span className="text-slate-500">Shipping</span>
                              <p className="mt-1">{o.shipping_address}, {o.shipping_city} {o.shipping_postal_code}</p>
                              {o.delivery_preference && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {o.delivery_preference === 'pickup' ? '📦 Warehouse Pickup' :
                                   o.delivery_preference === 'inside' ? '🏠 Inside House' : '🚗 Garage Delivery'}
                                </p>
                              )}
                            </div>
                          )}
                          {o.items && o.items.length > 0 && (
                            <div className="pt-1 border-t">
                              <span className="text-slate-500">Items</span>
                              <div className="space-y-1 mt-1">
                                {o.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-xs bg-white p-1.5 rounded">
                                    <span>{item.product_name} ({item.actual_sqft} sqft)</span>
                                    <span className="font-semibold">C${item.line_total?.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between font-bold mt-2 pt-1 border-t text-amber-600">
                                <span>Total</span>
                                <span>C${o.total?.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Booking-specific info */}
                      {lead.source === 'booking' && (
                        <>
                          {o.address && (
                            <div className="flex justify-between pt-1 border-t">
                              <span className="text-slate-500">Address</span>
                              <span>{o.address}</span>
                            </div>
                          )}
                          {o.preferred_date && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Appointment</span>
                              <span>{new Date(o.preferred_date).toLocaleDateString()} {o.preferred_time || ''}</span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Quote-specific info */}
                      {lead.source === 'quote' && o.square_footage && (
                        <>
                          <div className="pt-1 border-t grid grid-cols-2 gap-2 text-xs">
                            {o.flooring_cost > 0 && <div className="flex justify-between"><span className="text-slate-500">Flooring</span><span>C${o.flooring_cost?.toFixed(2)}</span></div>}
                            {o.installation_cost > 0 && <div className="flex justify-between"><span className="text-slate-500">Install</span><span>C${o.installation_cost?.toFixed(2)}</span></div>}
                            {o.removal_cost > 0 && <div className="flex justify-between"><span className="text-slate-500">Removal</span><span>C${o.removal_cost?.toFixed(2)}</span></div>}
                            {o.delivery_cost > 0 && <div className="flex justify-between"><span className="text-slate-500">Delivery</span><span>C${o.delivery_cost?.toFixed(2)}</span></div>}
                          </div>
                        </>
                      )}
                    </div>

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
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Booking Actions</Label>
                          <div className="flex gap-2 flex-wrap">
                            <Button variant="outline" size="sm"
                              disabled={sendBookingEmailMutation.isPending}
                              onClick={() => sendBookingEmailMutation.mutate(lead.raw)}>
                              <Send className="w-4 h-4 mr-2" /> Send Confirmation Email
                            </Button>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Label className="text-xs text-slate-500 whitespace-nowrap">Status:</Label>
                            <Select value={o.status || 'pending'} onValueChange={(val) => updateBookingMutation.mutate({ id: lead.entityId, status: val })}>
                              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
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
