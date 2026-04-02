'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BookingCalendar from '@/components/BookingCalendar';
import { CheckCircle, Clock, ArrowRight, Loader2, MapPin, Phone, Star, CalendarCheck, FileText } from 'lucide-react';
import { validatePhone, validateEmail } from '@/lib/validations';
import { Analytics } from '@/components/analytics';
import GoogleReviewsBanner from '@/components/GoogleReviewsBanner';

function formatPostalCode(value) {
  const clean = value.replace(/\s/g, '').toUpperCase();
  if (clean.length <= 3) return clean;
  return clean.slice(0, 3) + ' ' + clean.slice(3, 6);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date, fmt) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  if (fmt === 'EEEE, MMM d') return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  if (fmt === 'MMM d, yyyy') return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  return date.toLocaleDateString();
}

function getNextAvailableDate() {
  const now = new Date();
  const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  let d = addDays(new Date(), 1);
  while (true) {
    if (d.getDay() === 0) { d = addDays(d, 1); continue; }
    const lastSlot = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 17, 0, 0);
    if (lastSlot >= minDateTime) break;
    d = addDays(d, 1);
  }
  return formatDate(d, 'EEEE, MMM d');
}

export default function QuoteBookingClient() {
  const searchParams = useSearchParams();

  // Parse quote context from URL (passed from quote calculator)
  const quoteRaw = searchParams.get('quote');
  const quoteData = quoteRaw ? (() => { try { return JSON.parse(decodeURIComponent(quoteRaw)); } catch { return {}; } })() : {};

  const productName = searchParams.get('product') || quoteData.product_name || null;
  const sqft = searchParams.get('sqft') || quoteData.square_footage || null;
  const estimate = searchParams.get('estimate') || quoteData.total || null;

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showStickyBar, setShowStickyBar] = useState(false);

  const [postalCode, setPostalCode] = useState('');

  const [formData, setFormData] = useState({
    customer_name: quoteData.customer_name || '',
    customer_email: quoteData.customer_email || '',
    customer_phone: quoteData.customer_phone || '',
    customer_address: '',
    preferred_date: '',
    preferred_time: '',
    notes: '',
  });

  const formRef = useRef(null);
  const nextAvailableDate = useMemo(() => getNextAvailableDate(), []);

  useEffect(() => {
    if (submitted) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    const el = formRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [submitted, step]);

  // Mon-Sat 11am–2pm & 5pm
  const allTimeSlots = ['11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '5:00 PM'];

  const availableTimeSlots = useMemo(() => {
    if (!formData.preferred_date) return allTimeSlots;
    const now = new Date();
    const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return allTimeSlots.filter(timeSlot => {
      const [year, month, day] = formData.preferred_date.split('-').map(Number);
      const slotDate = new Date(year, month - 1, day);
      const [time, period] = timeSlot.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;
      slotDate.setHours(hour24, minutes, 0, 0);
      return slotDate >= minDateTime;
    });
  }, [formData.preferred_date]);

  const handleCheckAvailability = () => {
    if (!postalCode || postalCode.replace(/\s/g, '').length < 6) {
      setError('Please enter a valid postal code');
      return;
    }
    setError('');
    const firstChar = postalCode.trim().toUpperCase()[0];
    if (!['L', 'M', 'K'].includes(firstChar)) {
      setStep('out-of-area');
      return;
    }
    setStep(2);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name) { setError('Full name is required'); return; }
    if (!formData.customer_phone) { setError('Phone number is required'); return; }
    if (!formData.customer_email) { setError('Email is required'); return; }
    if (!formData.customer_address) { setError('Street address is required'); return; }
    if (!validatePhone(formData.customer_phone)) { setError('Please enter a valid phone number'); return; }
    if (!validateEmail(formData.customer_email)) { setError('Please enter a valid email address'); return; }
    setError('');
    setIsSubmitting(true);

    // GA4 — book_appointment event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'book_appointment', {
        event_category: 'appointment',
        event_label: 'quote_booking',
        value: 75,
        currency: 'CAD',
        quote_value: estimate ? parseFloat(estimate) : undefined,
        product_name: productName || undefined,
      });
    }
    // Meta Pixel — Schedule event
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Schedule', {
        content_name: productName || 'Quote Booking',
        value: estimate ? parseFloat(estimate) : 0,
        currency: 'CAD',
      });
    }

    try {
      // 1. Create booking record → shows in admin calendar, sends customer + admin emails
      const bookingPayload = {
        booking: {
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          customer_address: formData.customer_address,
          postal_code: postalCode,
          preferred_date: formData.preferred_date,
          preferred_time: formData.preferred_time,
          flooring_type: productName || 'quote_estimate',
          service_type: 'quote_estimate',
          product_name: productName || undefined,
          quote_total: estimate ? parseFloat(estimate) : undefined,
          square_footage: sqft || undefined,
          notes: [
            productName && `Product: ${productName}`,
            sqft && `${sqft} sq ft`,
            estimate && `Estimate: C$${parseFloat(estimate).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            formData.notes,
          ].filter(Boolean).join(' · '),
        },
      };

      await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });

      // 2. If we have quote data, also persist the quote for the admin quotes panel
      if (quoteData && quoteData.total) {
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
                customer_address: formData.customer_address,
                preferred_date: formData.preferred_date,
                preferred_time: formData.preferred_time,
                notes: formData.notes,
              },
              is_member: !!quoteData.is_member,
            }),
          });
        } catch (quoteErr) {
          console.error('[QuoteBooking] Quote save failed (non-critical):', quoteErr);
        }
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Failed to submit booking. Please try again or call us.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ─── SUCCESS STATE ───
  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-amber-50 to-slate-50">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Booking Request Received!</h2>
            <p className="text-slate-600 mb-2">
              Thank you! We&apos;ll review your request and confirm your appointment within a few hours.
            </p>
            <p className="text-slate-500 text-sm mb-6">Check your email for details and a confirmation link.</p>
            {estimate && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-900">
                <span className="font-semibold">Your quote estimate:</span>{' '}
                <span className="font-bold">C${parseFloat(estimate).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                {productName && <span> for {productName}</span>}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.href = '/quote-calculator'}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
              >
                Calculate Another Quote
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 border border-slate-200 text-slate-700 font-semibold px-5 py-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN LAYOUT ───
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-50 to-slate-50 py-6 md:py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs md:text-sm font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-3 md:mb-5">
            <CalendarCheck className="w-3.5 h-3.5 md:w-4 md:h-4" /> Book Your Free In-Home Estimate
          </div>
          <h1 className="text-2xl md:text-5xl font-bold text-slate-800 mb-2 md:mb-4">
            Book Your Free Measurement
          </h1>
          <p className="text-base md:text-xl text-slate-600 max-w-3xl">
            {productName
              ? `You've calculated your quote — now let's get exact measurements to lock in your price.`
              : `Serving Markham, Durham & Toronto (GTA) — Professional measurement and no-obligation quote.`}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs font-medium text-slate-700 md:hidden">
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-600" /> Free</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-600" /> No Obligation</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-600" /> Same-Week Booking</span>
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> 5-Star Rated</span>
          </div>
        </div>
      </div>

      {/* Quote Context Banner — shows when coming from calculator */}
      {(productName || sqft || estimate) && (
        <div className="max-w-7xl mx-auto px-4 -mb-4 mt-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <FileText className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <span className="font-semibold">Your quote:</span>{' '}
              {productName && <span className="font-bold">{productName}</span>}
              {sqft && <span> — ~{sqft} sq ft</span>}
              {estimate && (
                <span> — Est. <span className="font-semibold">C${parseFloat(estimate).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {/* Form Column */}
          <div className="order-1 lg:order-2" ref={formRef}>
            {(step === 1 || step === 2) && (
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step === 1 ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}`}>
                  {step === 1 ? '1' : <CheckCircle className="w-4 h-4" />}
                </div>
                <span className={`text-sm font-medium ${step === 1 ? 'text-slate-800' : 'text-green-600'}`}>Your Location</span>
                <div className="flex-1 h-px bg-slate-200" />
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step === 2 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                <span className={`text-sm font-medium ${step === 2 ? 'text-slate-800' : 'text-slate-400'}`}>Contact & Schedule</span>
              </div>
            )}

            {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}

            {/* Step 1 — Postal Code */}
            {step === 1 && (
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">Check Availability in Your Area</h2>
                <p className="text-slate-500 text-sm mb-5">Takes 30 seconds. No commitment required.</p>
                <div className="space-y-4">
                  <div>
                    <Label className="font-semibold">Postal Code *</Label>
                    <Input className="mt-1 text-base" placeholder="L3P 3B2" value={postalCode} onChange={(e) => setPostalCode(formatPostalCode(e.target.value))} maxLength={7} />
                  </div>
                  <Button onClick={handleCheckAvailability} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base py-6" size="lg">
                    Check Availability <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <p className="text-xs text-slate-400 text-center">No spam. We only contact you to confirm your appointment.</p>
                </div>
              </div>
            )}

            {/* Out of Area */}
            {step === 'out-of-area' && (
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg text-center">
                <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">We don&apos;t currently serve that area</h3>
                <p className="text-slate-600 mb-4">Our free in-home measurement service covers the Greater Toronto Area.</p>
                <p className="text-slate-600 mb-6">If you&apos;re nearby or willing to visit our showroom, give us a call!</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="tel:6474281111" className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                    <Phone className="w-4 h-4" /> Call (647) 428-1111
                  </a>
                  <button onClick={() => { setStep(1); setPostalCode(''); }} className="border border-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                    Try Another Postal Code
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Contact & Schedule */}
            {step === 2 && (
              <div className="bg-white border-2 border-green-400 rounded-2xl p-6 md:p-8 shadow-lg">
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-800 font-semibold text-sm">We have installers near <span className="font-bold">{postalCode}</span>!</p>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">Book Your Free Measurement</h2>
                <p className="text-slate-500 text-sm mb-5">Spots are limited — secure yours now.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label className="font-semibold">Full Name *</Label>
                    <Input className="mt-1" placeholder="Jane Smith" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-semibold">Phone *</Label>
                      <Input type="tel" className="mt-1" placeholder="(647) 000-0000" value={formData.customer_phone} onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })} />
                    </div>
                    <div>
                      <Label className="font-semibold">Email *</Label>
                      <Input type="email" className="mt-1" placeholder="you@email.com" value={formData.customer_email} onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold">Street Address *</Label>
                    <Input className="mt-1" placeholder="123 Main St" value={formData.customer_address} onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })} />
                  </div>

                  {/* Next available slot hint */}
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span><strong>Next Available:</strong> {nextAvailableDate}</span>
                  </div>

                  {/* Custom Booking Calendar */}
                  <div>
                    <Label className="font-semibold mb-2 block">Preferred Date & Time</Label>
                    <BookingCalendar
                      selected={formData.preferred_date}
                      onSelect={(dateStr) => {
                        setError('');
                        setFormData({ ...formData, preferred_date: dateStr, preferred_time: '' });
                      }}
                      isDateDisabled={(date) => {
                        const now = new Date();
                        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                        const maxDate = new Date(todayStart.getTime() + 60 * 24 * 60 * 60 * 1000);
                        if (date < todayStart) return true;
                        if (date.getDay() === 0) return true;
                        if (date > maxDate) return true;
                        const lastSlotOnDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 0, 0);
                        if (lastSlotOnDate < minDateTime) return true;
                        return false;
                      }}
                    />
                    {formData.preferred_date && (
                      <div className="mt-3">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Select a Time</Label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {availableTimeSlots.map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setFormData({ ...formData, preferred_time: t })}
                              className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                                formData.preferred_time === t
                                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                                  : 'bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-700 border border-slate-200'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <Label className="font-semibold text-slate-600">Notes (Optional)</Label>
                    <textarea
                      placeholder="Any details we should know about your project..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="mt-1 w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <p className="text-xs text-red-600 font-medium text-center">⚡ Limited spots available this week.</p>
                  <Button type="submit" disabled={isSubmitting || !formData.customer_name || !formData.customer_phone || !formData.customer_email || !formData.customer_address}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base py-6 disabled:opacity-50 disabled:cursor-not-allowed" size="lg">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...</> : 'Book Free Measurement'}
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                    <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                    <span className="font-medium">5-Star Rated</span>
                    <span className="text-slate-400">· 100% Free</span>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Benefits Column */}
          <div className="order-2 lg:order-1">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Why Book With BBS Flooring?</h2>
            <div className="space-y-5">
              {[
                { icon: FileText, title: 'Accurate Quotes', desc: 'We measure your space for a precise, all-in quote—no surprises.' },
                { icon: CheckCircle, title: 'No Pressure', desc: '100% free, no obligation—your satisfaction is our priority.' },
                { icon: Clock, title: 'Quick & Easy', desc: 'Flexible scheduling, evening & weekend availability across the GTA.' },
                { icon: CalendarCheck, title: 'Same-Week Availability', desc: 'Most appointments are confirmed within 24 hours.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <Icon className="w-10 h-10 text-amber-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-1">{title}</h3>
                    <p className="text-slate-600 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* What happens next */}
            <div className="mt-8 bg-amber-50 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-slate-800 mb-2">What Happens Next:</h3>
              <ol className="space-y-1.5 list-decimal list-inside text-slate-700 text-sm">
                <li>We confirm your appointment (usually same day)</li>
                <li>Our measurer visits your home — no cost, no pressure</li>
                <li>You receive a detailed, itemized quote by email</li>
                <li>Decide on your timeline — we work around your schedule</li>
              </ol>
            </div>

            <div className="mt-5 bg-slate-800 text-white rounded-2xl p-5">
              <h3 className="text-lg font-bold mb-2">Prefer to Call?</h3>
              <div className="flex items-center gap-3 mb-1">
                <Phone className="w-5 h-5 text-amber-400" />
                <a href="tel:6474281111" className="text-xl font-bold hover:text-amber-400 transition-colors">(647) 428-1111</a>
              </div>
              <p className="text-slate-300 text-sm">Available for calls & texts</p>
            </div>

            <div className="mt-5">
              <GoogleReviewsBanner variant="compact" />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      {showStickyBar && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <Button onClick={scrollToForm} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3">
              Book Free Measurement
            </Button>
            <a href="tel:6474281111" className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 text-white hover:bg-slate-700 flex-shrink-0">
              <Phone className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
