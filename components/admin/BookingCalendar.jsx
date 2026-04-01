'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getServiceTypeColor = (serviceType) => {
  const colors = {
    free_measurement: 'border-l-4 border-purple-500',
    consultation: 'border-l-4 border-indigo-500',
    stairs_quote: 'border-l-4 border-orange-500',
  };
  return colors[serviceType] || 'border-l-4 border-gray-500';
};

export default function BookingCalendar({ bookings, onReschedule }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [newDateInput, setNewDateInput] = useState('');

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = [];
    const firstDay = firstDayOfMonth(currentDate);
    const totalDays = daysInMonth(currentDate);

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentDate]);

  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach((booking) => {
      if (booking.preferred_date) {
        if (!map[booking.preferred_date]) {
          map[booking.preferred_date] = [];
        }
        map[booking.preferred_date].push(booking);
      }
    });
    return map;
  }, [bookings]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleBookingClick = (booking) => {
    // Pre-fill the date input with the booking's current date
    setNewDateInput(booking.preferred_date || '');
    setRescheduleBooking(booking);
  };

  const handleDayClick = (dateStr) => {
    // If a booking is already selected, reschedule it to this date
    if (rescheduleBooking) {
      onReschedule(rescheduleBooking.id, dateStr);
      setRescheduleBooking(null);
      setNewDateInput('');
    }
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleBooking || !newDateInput) return;
    onReschedule(rescheduleBooking.id, newDateInput);
    setRescheduleBooking(null);
    setNewDateInput('');
  };

  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <Card className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{monthName}</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6 flex gap-4 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded" />
            <span>Cancelled</span>
          </div>
          {rescheduleBooking && (
            <div className="ml-auto flex items-center gap-2 text-amber-700 font-medium">
              <Calendar className="w-4 h-4" />
              Click a date to reschedule{' '}
              <strong>{rescheduleBooking.customer_name.split(' ')[0]}</strong>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-500 h-6 px-2"
                onClick={() => setRescheduleBooking(null)}
              >
                ✕ Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-slate-600 py-2 text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {monthDays.map((day, idx) => {
            const dateStr = day ? day.toISOString().split('T')[0] : null;
            const dayBookings = dateStr ? bookingsByDate[dateStr] || [] : [];
            const isRescheduleTarget = rescheduleBooking && day;

            return (
              <div
                key={idx}
                onClick={() => dateStr && isRescheduleTarget && handleDayClick(dateStr)}
                className={`min-h-[120px] p-2 rounded-lg border-2 transition-colors ${
                  day
                    ? isRescheduleTarget
                      ? 'bg-amber-50 border-amber-300 cursor-pointer hover:bg-amber-100'
                      : 'bg-slate-50 border-slate-200'
                    : 'bg-gray-100 border-gray-200'
                }`}
              >
                {day && (
                  <div className="text-sm font-semibold text-slate-700 mb-2">
                    {day.getDate()}
                  </div>
                )}

                <div className="space-y-1">
                  {dayBookings.map((booking, bookingIdx) => (
                    <div
                      key={booking.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookingClick(booking);
                      }}
                      className={`p-2 rounded text-xs font-medium cursor-pointer transition-all shadow hover:shadow-md hover:opacity-90 ${getStatusColor(
                        booking.status
                      )} ${getServiceTypeColor(booking.service_type)}`}
                      title={`${booking.customer_name} — click to reschedule`}
                    >
                      <div className="truncate font-semibold">
                        {booking.customer_name.split(' ')[0]}
                      </div>
                      <div className="truncate text-xs opacity-75">
                        {booking.preferred_time || 'TBD'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <Dialog
          open={!!rescheduleBooking}
          onOpenChange={(open) => !open && setRescheduleBooking(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reschedule Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">
                  Customer:{' '}
                  <span className="font-semibold">{rescheduleBooking.customer_name}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Current date:{' '}
                  <span className="font-semibold">
                    {rescheduleBooking.preferred_date || 'Not set'}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDateInput}
                  onChange={(e) => setNewDateInput(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleRescheduleSubmit}
                  disabled={!newDateInput}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  Reschedule
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setRescheduleBooking(null)}
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-slate-500 text-center">
                You can also click any calendar day while this modal is open to set the date.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
