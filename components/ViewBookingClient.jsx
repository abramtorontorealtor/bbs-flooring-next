'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { entities } from '@/lib/base44-compat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Phone, Mail, AlertCircle } from 'lucide-react';

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100';
};

export default function ViewBookingClient() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const bookings = await entities.Booking.list();
        const found = bookings.find((b) => b.id === bookingId);

        if (found) {
          setBooking(found);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error loading booking:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-slate-600">Loading booking details...</div>
      </div>
    );
  }

  if (notFound || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Not Found</h2>
              <p className="text-slate-600">
                We couldn&apos;t find a booking with this ID. Please check your booking confirmation email for the correct link.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: { icon: '⏳', label: 'Awaiting Confirmation' },
    confirmed: { icon: '✓', label: 'Confirmed' },
    completed: { icon: '✓✓', label: 'Completed' },
    cancelled: { icon: '✗', label: 'Cancelled' },
  };

  const config = statusConfig[booking.status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Your Booking Details</h1>
          <p className="text-slate-600">
            Booking ID:{' '}
            <span className="font-mono text-sm bg-slate-200 px-2 py-1 rounded">{booking.id}</span>
          </p>
        </div>

        <Card className="mb-6 border-2 border-amber-200 bg-amber-50">
          <CardContent className="pt-6 text-center">
            <div className="text-5xl mb-4">{config.icon}</div>
            <Badge className={getStatusColor(booking.status)}>{config.label}</Badge>
            <p className="text-slate-600 mt-3 text-sm">
              {booking.status === 'pending' &&
                'We will contact you within 24 hours to confirm your appointment.'}
              {booking.status === 'confirmed' &&
                'Your appointment has been confirmed. See details below.'}
              {booking.status === 'completed' && 'Thank you for choosing BBS Flooring!'}
              {booking.status === 'cancelled' &&
                'This booking has been cancelled. Please contact us to reschedule.'}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Appointment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-slate-600 mb-1">Service Type</div>
              <div className="font-semibold text-slate-800">
                {booking.service_type === 'free_measurement' && 'Free In-Home Measurement'}
                {booking.service_type === 'consultation' && 'Consultation'}
                {booking.service_type === 'stairs_quote' && 'Stairs Quote'}
              </div>
            </div>

            {booking.preferred_date && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-slate-600 mb-1">Preferred Date</div>
                  <div className="font-semibold text-slate-800">
                    {new Date(booking.preferred_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            )}

            {booking.preferred_time && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-slate-600 mb-1">Preferred Time</div>
                  <div className="font-semibold text-slate-800">{booking.preferred_time}</div>
                </div>
              </div>
            )}

            {booking.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-slate-600 mb-1">Property Address</div>
                  <div className="font-semibold text-slate-800">{booking.address}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.customer_name && (
              <div>
                <div className="text-sm text-slate-600 mb-1">Name</div>
                <div className="font-semibold text-slate-800">{booking.customer_name}</div>
              </div>
            )}

            {booking.customer_phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-slate-600 mb-1">Phone</div>
                  <a
                    href={`tel:${booking.customer_phone}`}
                    className="font-semibold text-amber-600 hover:text-amber-700"
                  >
                    {booking.customer_phone}
                  </a>
                </div>
              </div>
            )}

            {booking.customer_email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-slate-600 mb-1">Email</div>
                  <a
                    href={`mailto:${booking.customer_email}`}
                    className="font-semibold text-amber-600 hover:text-amber-700"
                  >
                    {booking.customer_email}
                  </a>
                </div>
              </div>
            )}

            {booking.project_details && (
              <div>
                <div className="text-sm text-slate-600 mb-1">Project Details</div>
                <div className="text-slate-700 bg-slate-50 p-3 rounded text-sm">
                  {booking.project_details}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-slate-800 mb-3">Have Questions?</h3>
            <p className="text-slate-600 text-sm mb-4">
              Contact BBS Flooring to reschedule, cancel, or ask any questions about your booking.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="tel:6474281111"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium"
              >
                <Phone className="w-4 h-4" /> Call (647) 428-1111
              </a>
              <a
                href="mailto:info@bbsflooring.com"
                className="flex items-center justify-center gap-2 px-4 py-2 border border-amber-600 text-amber-600 hover:bg-amber-50 rounded-md font-medium"
              >
                <Mail className="w-4 h-4" /> Email us
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
