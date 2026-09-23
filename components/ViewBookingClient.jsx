'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import SlotPicker from '@/components/booking/SlotPicker';
import { submitFailure } from '@/lib/booking/picker-model';
import { MapPin, Calendar as CalendarIcon, Clock, Phone, Mail, AlertCircle, CheckCircle, Search, Loader2, ArrowLeft, X } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';

const STATUS_CONFIG = {
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Awaiting Confirmation', icon: '⏳', message: 'We received your request and will confirm your appointment within a few hours.' },
  confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed', icon: '✅', message: 'Your appointment is confirmed. We\'ll see you soon!' },
  completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed', icon: '✓', message: 'This appointment has been completed. Thank you for choosing BBS Flooring!' },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: '✗', message: 'This appointment has been cancelled.' },
};


function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ViewBookingClient() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');
  const idParam = searchParams.get('id');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(!!tokenParam || !!idParam);
  const [error, setError] = useState('');

  // Lookup form
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupResults, setLookupResults] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Reschedule state
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Cancel state
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch booking by token
  useEffect(() => {
    if (!tokenParam && !idParam) { setLoading(false); return; }
    const fetchBooking = async () => {
      try {
        if (tokenParam) {
          // Use Supabase REST directly via our lookup
          const res = await fetch('/api/booking/lookup-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: tokenParam }),
          });
          const data = await res.json();
          if (data.success && data.booking) {
            setBooking(data.booking);
          } else {
            setError('Booking not found. The link may have expired or been used already.');
          }
        }
      } catch {
        setError('Failed to load booking. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [tokenParam, idParam]);

  const [rescheduleOverride, setRescheduleOverride] = useState(null);

  // Lookup by email + phone
  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupEmail || !lookupPhone) return;
    setLookupLoading(true);
    setError('');
    try {
      const res = await fetch('/api/booking/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lookupEmail, phone: lookupPhone }),
      });
      const data = await res.json();
      if (data.success && data.bookings?.length > 0) {
        setLookupResults(data.bookings);
      } else {
        setError('No bookings found matching that email and phone number.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const selectBookingFromResults = (b) => {
    // Navigate to the token-based view
    window.location.href = `/view-booking?token=${b.lookup_token}`;
  };

  // Reschedule
  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch('/api/booking/customer-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: booking.lookup_token, action: 'reschedule', preferred_date: rescheduleDate, preferred_time: rescheduleTime }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setBooking((b) => ({ ...b, ...data.booking }));
        setShowReschedule(false);
        setRescheduleDate('');
        setRescheduleTime('');
        setRescheduleOverride(null);
      } else {
        // B2: 409 → your original booking is unchanged; pick from the refreshed options.
        const f = submitFailure(res.status, data);
        if (f.kind === 'slot_taken') { setRescheduleOverride(f.availability); setRescheduleTime(''); }
        setError(f.kind === 'slot_taken' ? `${f.message} Your current appointment has not changed.` : (data.error || f.message));
      }
    } catch {
      setError('Failed to reschedule. Please try again or call us.');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel
  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/booking/customer-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: booking.lookup_token, action: 'cancel', cancel_reason: cancelReason }),
      });
      const data = await res.json();
      if (data.success) {
        setBooking(data.booking);
        setShowCancel(false);
        setCancelReason('');
      } else {
        setError(data.error || 'Failed to cancel');
      }
    } catch {
      setError('Failed to cancel. Please try again or call us.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // No token — show lookup form
  if (!booking && !lookupResults) {
    return (
      <div className="min-h-[60vh] bg-slate-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <Breadcrumbs items={getStaticBreadcrumbs('/view-booking')} />
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Find Your Booking</h1>
            <p className="text-slate-600">Enter the email and phone number you used when booking.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">{error}</div>
          )}

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleLookup} className="space-y-4">
                <div>
                  <Label className="font-semibold">Email Address</Label>
                  <Input type="email" placeholder="you@email.com" value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)} className="mt-1" required />
                </div>
                <div>
                  <Label className="font-semibold">Phone Number</Label>
                  <Input type="tel" placeholder="(647) 000-0000" value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)} className="mt-1" required />
                </div>
                <Button type="submit" disabled={lookupLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-5">
                  {lookupLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Looking up...</> : <><Search className="w-4 h-4 mr-2" /> Find My Booking</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">Can&apos;t find your booking?</p>
            <a href="tel:6474281111" className="text-amber-700 font-semibold underline underline-offset-2 hover:text-amber-900">Call (647) 428-1111</a>
          </div>
        </div>
      </div>
    );
  }

  // Lookup results — multiple bookings
  if (lookupResults && !booking) {
    return (
      <div className="min-h-[60vh] bg-slate-50 py-12">
        <div className="max-w-lg mx-auto px-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Your Bookings</h1>
          <div className="space-y-3">
            {lookupResults.map((b) => {
              const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              return (
                <Card key={b.id} className="cursor-pointer hover:border-amber-300 transition-colors" onClick={() => selectBookingFromResults(b)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <Badge className={cfg.color}>{cfg.label}</Badge>
                      <p className="font-semibold text-slate-800 mt-1">{formatDate(b.preferred_date)}</p>
                      <p className="text-sm text-slate-500">{b.preferred_time || 'No time set'} · {b.flooring_type || 'Flooring'}</p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-slate-400 rotate-180" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <button onClick={() => { setLookupResults(null); setError(''); }}
            className="mt-4 text-slate-500 text-sm hover:text-slate-700">← Search again</button>
        </div>
      </div>
    );
  }

  // Booking detail view
  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const canModify = !['completed', 'cancelled'].includes(booking.status);

  return (
    <div className="min-h-[60vh] bg-slate-50 py-8 md:py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Your Booking</h1>
        </div>

        {/* While rescheduling, the error is shown next to the picker instead (one alert, not two). */}
        {error && !showReschedule && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Status Card */}
        <Card className="mb-6 border-2 border-amber-200 bg-amber-50">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-3">{cfg.icon}</div>
            <Badge className={`${cfg.color} text-sm px-3 py-1`}>{cfg.label}</Badge>
            <p className="text-slate-600 mt-3 text-sm max-w-md mx-auto">{cfg.message}</p>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.preferred_date && (
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-slate-500">Date</div>
                  <div className="font-semibold text-slate-800">{formatDate(booking.preferred_date)}</div>
                </div>
              </div>
            )}
            {booking.preferred_time && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-slate-500">Time</div>
                  <div className="font-semibold text-slate-800">{booking.preferred_time}</div>
                </div>
              </div>
            )}
            {(booking.customer_address || booking.address) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-slate-500">Address</div>
                  <div className="font-semibold text-slate-800">{booking.customer_address || booking.address}</div>
                </div>
              </div>
            )}
            {(booking.flooring_type || booking.project_type) && (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-slate-500">Project Type</div>
                  <div className="font-semibold text-slate-800 capitalize">{booking.flooring_type || booking.project_type}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions — only if booking is modifiable */}
        {canModify && !showReschedule && !showCancel && (
          <div className="flex gap-3 mb-6">
            <Button onClick={() => setShowReschedule(true)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-5">
              <CalendarIcon className="w-4 h-4 mr-2" /> Reschedule
            </Button>
            <Button onClick={() => setShowCancel(true)} variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-semibold py-5">
              <X className="w-4 h-4 mr-2" /> Cancel Booking
            </Button>
          </div>
        )}

        {/* Reschedule Form */}
        {showReschedule && (
          <Card className="mb-6 border-2 border-amber-400">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-600" /> Pick a New Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SlotPicker
                idPrefix="rs"
                date={rescheduleDate}
                time={rescheduleTime}
                token={booking?.lookup_token || null}
                override={rescheduleOverride}
                onDateChange={(d) => { setError(''); setRescheduleOverride(null); setRescheduleDate(d); setRescheduleTime(''); }}
                onTimeChange={(t) => { setError(''); setRescheduleTime(t); }}
              />
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <div className="flex gap-3">
                <Button onClick={handleReschedule} disabled={!rescheduleDate || !rescheduleTime || actionLoading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                  {actionLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Rescheduling...</> : 'Confirm New Date'}
                </Button>
                <Button variant="outline" onClick={() => { setShowReschedule(false); setRescheduleDate(''); setRescheduleTime(''); }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cancel Confirmation */}
        {showCancel && (
          <Card className="mb-6 border-2 border-red-300">
            <CardHeader>
              <CardTitle className="text-lg text-red-700">Cancel Your Booking?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 text-sm">Are you sure you want to cancel your measurement appointment? You can always rebook later.</p>
              <div>
                <Label className="text-sm">Reason (optional)</Label>
                <select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm mt-1">
                  <option value="">Select a reason...</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Found another provider">Found another provider</option>
                  <option value="Schedule conflict">Schedule conflict</option>
                  <option value="Not ready yet">Not ready yet</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCancel} disabled={actionLoading} variant="destructive" className="flex-1">
                  {actionLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cancelling...</> : 'Yes, Cancel Booking'}
                </Button>
                <Button variant="outline" onClick={() => { setShowCancel(false); setCancelReason(''); }} className="flex-1">
                  Keep My Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-slate-800 mb-3">Have Questions?</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="tel:6474281111" className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium">
                <Phone className="w-4 h-4" /> Call (647) 428-1111
              </a>
              <a href="mailto:info@bbsflooring.ca" className="flex items-center justify-center gap-2 px-4 py-2 border border-amber-600 text-amber-600 hover:bg-amber-50 rounded-md font-medium">
                <Mail className="w-4 h-4" /> Email us
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
