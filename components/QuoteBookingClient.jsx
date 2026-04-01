'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { entities } from '@/lib/base44-compat';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, CheckCircle2, CalendarIcon, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import { validatePhone, validateEmail } from '@/lib/validations';

function formatPostalCode(value) {
  const clean = value.replace(/\s/g, '').toUpperCase();
  if (clean.length <= 3) return clean;
  return clean.slice(0, 3) + ' ' + clean.slice(3, 6);
}

function getNextAvailableDate() {
  let d = addDays(new Date(), 1);
  while (d.getDay() === 0) d = addDays(d, 1);
  return format(d, 'EEEE, MMM d');
}

export default function QuoteBookingClient() {
  const searchParams = useSearchParams();

  // Parse quote data from URL
  const quoteRaw = searchParams.get('quote');
  const quoteData = quoteRaw ? JSON.parse(decodeURIComponent(quoteRaw)) : {};

  const productName = searchParams.get('product') || quoteData.product_name || null;
  const sqft = searchParams.get('sqft') || quoteData.square_footage || null;
  const estimate = searchParams.get('estimate') || quoteData.total || null;

  const [step, setStep] = useState(1);
  const [postalCode, setPostalCode] = useState('');

  const [formData, setFormData] = useState({
    customer_name: quoteData.customer_name || '',
    customer_phone: quoteData.customer_phone || '',
    customer_address: quoteData.customer_address || '',
    customer_email: quoteData.customer_email || '',
    preferred_date: '',
    preferred_time: '',
    notes: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextAvailableDate = useMemo(() => getNextAvailableDate(), []);

  const allTimeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '5:00 PM'
  ];

  const availableTimeSlots = useMemo(() => {
    if (!formData.preferred_date) return allTimeSlots;
    const now = new Date();
    const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return allTimeSlots.filter(timeSlot => {
      const [year, month, day] = formData.preferred_date.split('-').map(Number);
      const slotDate = new Date(year, month - 1, day);
      const [time, period] = timeSlot.split(' ');
      let hour24 = parseInt(time.split(':')[0]);
      const minutes = parseInt(time.split(':')[1]);
      if (period === 'PM' && hour24 !== 12) hour24 += 12;
      if (period === 'AM' && hour24 === 12) hour24 = 0;
      slotDate.setHours(hour24, minutes, 0, 0);
      return slotDate >= minDateTime;
    });
  }, [formData.preferred_date]);

  const [errors, setErrors] = useState({});

  const handleCheckAvailability = () => {
    if (!postalCode || postalCode.replace(/\s/g, '').length < 6) {
      toast.error('Please enter a valid postal code');
      return;
    }
    setStep('checking');
    setTimeout(() => setStep(2), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.customer_name) newErrors.customer_name = 'Full name is required';
    if (!formData.customer_phone) newErrors.customer_phone = 'Phone number is required';
    if (!formData.customer_address) newErrors.customer_address = 'Address is required';
    if (!formData.customer_email) newErrors.customer_email = 'Email is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const missingFields = Object.keys(newErrors).map(key => {
        if (key === 'customer_name') return 'Full Name';
        if (key === 'customer_phone') return 'Phone Number';
        if (key === 'customer_email') return 'Email Address';
        if (key === 'customer_address') return 'Home Address';
        return key;
      }).join(', ');
      toast.error(`Please fill in: ${missingFields}`);
      return;
    }

    if (!validatePhone(formData.customer_phone)) {
      setErrors({ customer_phone: 'Invalid phone format' });
      toast.error('Please enter a valid phone number (XXX-XXX-XXXX or (XXX) XXX-XXXX)');
      return;
    }

    if (!validateEmail(formData.customer_email)) {
      setErrors({ customer_email: 'Invalid email format' });
      toast.error('Please enter a valid email address');
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await entities.Quote.create({
        ...quoteData,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        notes: formData.notes,
        status: 'draft'
      });

      // Send quote emails
      try {
        await fetch('/api/quotes/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quote: {
              ...quoteData,
              customer_name: formData.customer_name,
              customer_email: formData.customer_email,
              customer_phone: formData.customer_phone,
            },
            is_member: !!quoteData.customer_email
          }),
        });
      } catch (emailError) {
        console.error('Quote email failed:', emailError);
      }

      // Send booking confirmation if date selected
      if (formData.preferred_date) {
        try {
          await fetch('/api/booking/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              booking: {
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                customer_phone: formData.customer_phone,
                address: formData.customer_address,
                preferred_date: formData.preferred_date,
                preferred_time: formData.preferred_time,
                service_type: 'free_measurement',
                project_details: `Product: ${quoteData.product_name || 'N/A'}, ${quoteData.square_footage || 0} sq ft, Est: C$${(quoteData.total || 0).toFixed(2)}`
              }
            }),
          });
        } catch (emailError) {
          console.error('Booking confirmation email failed:', emailError);
        }
      }

      // GA4 tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'book_appointment', {
          event_category: 'appointment',
          event_label: 'quote_booking_submission',
          value: 75,
          currency: 'CAD',
          quote_value: quoteData.total
        });
      }
      // Meta Pixel — Schedule event
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'Schedule', { content_name: 'Quote Booking', value: quoteData?.total || 0, currency: 'CAD' });
      }

      setSubmitted(true);
      toast.success('Booking saved! We\'ll contact you soon to confirm.');
    } catch (error) {
      toast.error('Failed to save booking');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h2>
            <p className="text-slate-600 mb-6">
              We&apos;ve received your quote and measurement appointment request. Our team will contact you within 24 hours to confirm your preferred date and time.
            </p>
            <Button onClick={() => window.location.href = '/'} className="bg-amber-500 hover:bg-amber-600">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Book Your Free Measurement</h1>
        <p className="text-lg text-slate-600">Complete your appointment details</p>
      </div>

      {/* Quote context banner */}
      {(productName || sqft || estimate) && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-amber-500 text-lg flex-shrink-0">📋</span>
          <p className="text-sm text-amber-900">
            <span className="font-semibold">You&apos;re booking an estimate for:</span>{' '}
            {productName && <span className="font-bold">{decodeURIComponent(productName)}</span>}
            {sqft && <span> — ~{sqft} sq ft</span>}
            {estimate && <span> — Est. <span className="font-semibold">C${parseFloat(estimate).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>}
          </p>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step === 1 || step === 'checking' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}`}>
          {step === 1 || step === 'checking' ? '1' : <CheckCircle className="w-4 h-4" />}
        </div>
        <span className={`text-sm font-medium ${step === 1 || step === 'checking' ? 'text-slate-800' : 'text-green-600'}`}>Your Location</span>
        <div className="flex-1 h-px bg-slate-200" />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step === 2 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
        <span className={`text-sm font-medium ${step === 2 ? 'text-slate-800' : 'text-slate-400'}`}>Contact & Schedule</span>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Check Availability in Your Area</h2>
          <p className="text-slate-500 text-sm mb-6">Takes 30 seconds. No commitment required.</p>
          <div className="space-y-5">
            <div>
              <Label className="font-semibold">Postal Code *</Label>
              <Input
                className="mt-1 text-base"
                placeholder="L3P 3B2"
                value={postalCode}
                onChange={(e) => setPostalCode(formatPostalCode(e.target.value))}
                maxLength={7}
              />
            </div>
            <Button
              onClick={handleCheckAvailability}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base py-6"
              size="lg"
            >
              Check Availability <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-xs text-slate-400 text-center">No spam. We only contact you to confirm your appointment.</p>
          </div>
        </div>
      )}

      {/* CHECKING STATE */}
      {step === 'checking' && (
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 shadow-lg flex flex-col items-center justify-center min-h-[200px] text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
          <p className="text-lg font-semibold text-slate-700">Checking availability near <span className="text-amber-600">{postalCode}</span>...</p>
          <p className="text-sm text-slate-400 mt-2">This only takes a moment</p>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="bg-white border-2 border-green-400 rounded-2xl p-8 shadow-lg">
          {/* Success banner */}
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 font-semibold text-sm">Success! We have installers near <span className="font-bold">{postalCode}</span>.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className={`font-semibold ${errors.customer_name ? 'text-red-600' : ''}`}>Full Name *</Label>
              <Input
                className={`mt-1 ${errors.customer_name ? 'border-red-500' : ''}`}
                placeholder="Your full name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className={`font-semibold ${errors.customer_phone ? 'text-red-600' : ''}`}>Phone *</Label>
                <Input
                  type="tel"
                  className={`mt-1 ${errors.customer_phone ? 'border-red-500' : ''}`}
                  placeholder="(647) 000-0000"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                />
              </div>
              <div>
                <Label className={`font-semibold ${errors.customer_email ? 'text-red-600' : ''}`}>Email *</Label>
                <Input
                  type="email"
                  className={`mt-1 ${errors.customer_email ? 'border-red-500' : ''}`}
                  placeholder="you@email.com"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label className={`font-semibold ${errors.customer_address ? 'text-red-600' : ''}`}>Street Address *</Label>
              <Input
                className={`mt-1 ${errors.customer_address ? 'border-red-500' : ''}`}
                placeholder="123 Main St"
                value={formData.customer_address}
                onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
              />
            </div>

            {/* Next available slot hint */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span><strong>Next Available Slot:</strong> {nextAvailableDate} — book now before it fills up.</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.preferred_date
                        ? (() => {
                            const [y, m, d] = formData.preferred_date.split('-').map(Number);
                            return format(new Date(y, m - 1, d), 'MMM d, yyyy');
                          })()
                        : 'Select a date...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.preferred_date ? (() => {
                        const [y, m, d] = formData.preferred_date.split('-').map(Number);
                        return new Date(y, m - 1, d);
                      })() : undefined}
                      onSelect={(date) => {
                        if (!date) return;
                        if (date.getDay() === 0) { toast.error('Sundays are not available.'); return; }
                        const y = date.getFullYear();
                        const m = String(date.getMonth() + 1).padStart(2, '0');
                        const d = String(date.getDate()).padStart(2, '0');
                        setFormData({ ...formData, preferred_date: `${y}-${m}-${d}`, preferred_time: '' });
                      }}
                      disabled={(date) => {
                        const now = new Date();
                        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        const maxDate = new Date(todayStart.getTime() + 60 * 24 * 60 * 60 * 1000);
                        return date < todayStart || date.getDay() === 0 || date > maxDate;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="font-semibold">Preferred Time</Label>
                <select
                  value={formData.preferred_time}
                  onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm mt-1"
                  disabled={!formData.preferred_date}
                >
                  <option value="">{!formData.preferred_date ? 'Select date first...' : 'Select a time...'}</option>
                  {availableTimeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <Label className="font-semibold text-slate-600">Notes or Special Requests (Optional)</Label>
              <Textarea
                placeholder="Any other details we should know..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 h-20"
              />
            </div>

            <p className="text-xs text-red-600 font-medium text-center">⚡ Limited spots available this week.</p>

            <Button
              type="submit"
              disabled={isSubmitting || !formData.customer_name || !formData.customer_phone || !formData.customer_address || !formData.customer_email}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...</> : 'Save Quote & Book Appointment'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
