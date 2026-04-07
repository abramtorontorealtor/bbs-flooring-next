'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Phone, Mail, MapPin, Calendar, Clock, Send, Filter, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import BookingCalendar from './BookingCalendar';

export default function AdminBookingsClient() {
  const [viewMode, setViewMode] = useState('calendar');
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    customerName: '',
  });
  const [editingBooking, setEditingBooking] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => entities.Booking.list('-created_date', 500),
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await entities.Booking.update(id, { status });
      // Auto-send email notification on status change
      const booking = bookings.find(b => b.id === id);
      if (booking?.customer_email) {
        await fetch('/api/admin/sendBookingConfirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { ...booking, status }, email_type: 'confirmation' }),
        }).catch(() => {}); // Non-blocking
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setEditingBooking(null);
      toast.success('Booking updated & email sent');
    },
    onError: () => toast.error('Failed to update booking'),
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (booking) => {
      const res = await fetch('/api/admin/sendBookingConfirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: booking, email_type: 'confirmation' }),
      });
      if (!res.ok) throw new Error('Failed to send email');
      return res.json();
    },
    onSuccess: () => toast.success('Confirmation email sent'),
    onError: () => toast.error('Failed to send email'),
  });

  const rescheduleMutation = useMutation({
    mutationFn: async ({ bookingId, newDate }) => {
      const res = await fetch('/api/booking/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, preferred_date: newDate }),
      });
      if (!res.ok) throw new Error('Reschedule failed');
      return res.json();
    },
    onSuccess: (_, { bookingId, newDate }) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking rescheduled');
      // Send reschedule email
      const booking = bookings.find(b => b.id === bookingId);
      if (booking?.customer_email) {
        fetch('/api/admin/sendBookingConfirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { ...booking, preferred_date: newDate }, email_type: 'reschedule' }),
        }).catch(() => {});
      }
    },
    onError: () => toast.error('Failed to reschedule booking'),
  });

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const statusMatch = filters.status === 'all' || booking.status === filters.status;
      const nameMatch =
        !filters.customerName ||
        booking.customer_name?.toLowerCase().includes(filters.customerName.toLowerCase());
      let dateMatch = true;
      if (filters.dateFrom) dateMatch = dateMatch && booking.preferred_date >= filters.dateFrom;
      if (filters.dateTo) dateMatch = dateMatch && booking.preferred_date <= filters.dateTo;
      return statusMatch && nameMatch && dateMatch;
    });
  }, [bookings, filters]);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const handleUpdateStatus = async () => {
    if (!editingBooking || !editStatus) {
      toast.error('Please select a status');
      return;
    }
    updateBookingMutation.mutate({ id: editingBooking.id, status: editStatus });
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading bookings...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Booking Management</h1>
            <p className="text-slate-600">Manage and track all customer bookings</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              onClick={() => setViewMode('calendar')}
              className={viewMode === 'calendar' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> Calendar
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              <List className="w-4 h-4 mr-2" /> Table
            </Button>
          </div>
        </div>

        {viewMode === 'calendar' && (
          <div className="mb-6">
            <BookingCalendar
              bookings={filteredBookings}
              onReschedule={(bookingId, newDate) =>
                rescheduleMutation.mutate({ bookingId, newDate })
              }
            />
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Status</Label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm mt-1"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <Label>Customer Name</Label>
                <Input
                  placeholder="Search customer..."
                  value={filters.customerName}
                  onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table view */}
        {viewMode === 'table' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bookings ({filteredBookings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Contact</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Address</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Appointment</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-500">
                          No bookings found
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="border-b hover:bg-slate-50">
                          <td className="py-4 px-4 font-medium text-slate-800">
                            {booking.customer_name}
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-slate-600">
                                <Phone className="w-4 h-4" />
                                {booking.customer_phone}
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Mail className="w-4 h-4" />
                                {booking.customer_email}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 max-w-xs">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{booking.customer_address || booking.address || '—'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1 text-sm">
                              {booking.preferred_date && (
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(booking.preferred_date).toLocaleDateString()}
                                </div>
                              )}
                              {booking.preferred_time && (
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Clock className="w-4 h-4" />
                                  {booking.preferred_time}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={statusColors[booking.status] || 'bg-gray-100'}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <Dialog
                                open={editingBooking?.id === booking.id}
                                onOpenChange={(open) => !open && setEditingBooking(null)}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingBooking(booking);
                                      setEditStatus(booking.status);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Update Booking Status</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>
                                        Current Status:{' '}
                                        <Badge className={statusColors[booking.status]}>
                                          {booking.status}
                                        </Badge>
                                      </Label>
                                    </div>
                                    <div>
                                      <Label>New Status</Label>
                                      <select
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm mt-1"
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                      </select>
                                    </div>
                                    <Button
                                      onClick={handleUpdateStatus}
                                      disabled={updateBookingMutation.isPending}
                                      className="w-full bg-amber-600 hover:bg-amber-700"
                                    >
                                      {updateBookingMutation.isPending
                                        ? 'Updating...'
                                        : 'Update & Send Email'}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button
                                size="sm"
                                variant="outline"
                                title="Send confirmation email"
                                onClick={() => sendEmailMutation.mutate(booking)}
                                disabled={sendEmailMutation.isPending}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
