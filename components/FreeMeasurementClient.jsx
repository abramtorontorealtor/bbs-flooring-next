'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BookingCalendar from '@/components/BookingCalendar';
import { CheckCircle, Clock, Phone, Star, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { validatePhone, validateEmail } from '@/lib/validations';

const PROJECT_TYPES = [
  { value: 'hardwood', label: '🪵 Hardwood' },
  { value: 'vinyl', label: '💧 Vinyl' },
  { value: 'laminate', label: '🏠 Laminate' },
  { value: 'stairs', label: '🪜 Stairs' },
];

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

export default function FreeMeasurementClient() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [error, setError] = useState('');

  const [postalCode, setPostalCode] = useState('');
  const [projectType, setProjectType] = useState('');
  const [productsInterested, setProductsInterested] = useState('');

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    preferred_date: '',
    preferred_time: '',
  });

  const formRef = useRef(null);
  const nextAvailableDate = useMemo(() => getNextAvailableDate(), []);
  const searchParams = useSearchParams();

  useEffect(() => {
    const productParam = searchParams?.get('product');
    if (productParam) {
      setProductsInterested(productParam);
    }
  }, [searchParams]);

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
    if (!projectType) {
      setError('Please select a project type');
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
    if (!formData.preferred_date) { setError('Please select a preferred date'); return; }
    if (!formData.preferred_time) { setError('Please select a preferred time'); return; }
    if (!validatePhone(formData.customer_phone)) { setError('Please enter a valid phone number'); return; }
    if (!validateEmail(formData.customer_email)) { setError('Please enter a valid email address'); return; }
    setError('');
    setIsSubmitting(true);

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'book_appointment', {
        event_category: 'appointment',
        event_label: 'free_measurement',
        value: 75,
        currency: 'CAD',
      });
      // Direct Google Ads conversion tracking
      window.gtag('event', 'conversion', {
        send_to: 'AW-700910775/PQ1CCNmSn7ocELeZnM4C',
        value: 75.0,
        currency: 'CAD',
      });
    }
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Schedule', { content_name: 'Free Measurement' });
    }

    try {
      await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking: {
            customer_name: formData.customer_name,
            customer_email: formData.customer_email,
            customer_phone: formData.customer_phone,
            customer_address: formData.customer_address,
            postal_code: postalCode,
            preferred_date: formData.preferred_date,
            preferred_time: formData.preferred_time,
            flooring_type: projectType,
            notes: [projectType && `Project Type: ${projectType}`, productsInterested && `Products interested in: ${productsInterested}`].filter(Boolean).join(' | '),
          },
        }),
      });
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

  if (submitted) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Booking Request Received!</h2>
            <p className="text-slate-600 mb-6">
              Thank you! We&apos;ll review your request and confirm your appointment within a few hours. Check your email for details.
            </p>
            <button
              onClick={() => { setSubmitted(false); setStep(1); setPostalCode(''); setProjectType(''); setProductsInterested(''); setFormData({ customer_name: '', customer_email: '', customer_phone: '', customer_address: '', preferred_date: '', preferred_time: '' }); }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Book Another Measurement
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={formRef}>
      {(step === 1 || step === 2) && (
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step === 1 ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}`}>
            {step === 1 ? '1' : <CheckCircle className="w-4 h-4" />}
          </div>
          <span className={`text-sm font-medium ${step === 1 ? 'text-slate-800' : 'text-green-600'}`}>Location & Service</span>
          <div className="flex-1 h-px bg-slate-200" />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step === 2 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
          <span className={`text-sm font-medium ${step === 2 ? 'text-slate-800' : 'text-slate-400'}`}>Contact & Schedule</span>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">Check Availability in Your Area</h2>
          <p className="text-slate-500 text-sm mb-5">Takes 30 seconds. No commitment required.</p>
          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Postal Code *</Label>
              <Input className="mt-1 text-base" placeholder="L3P 3B2" value={postalCode} onChange={(e) => setPostalCode(formatPostalCode(e.target.value))} maxLength={7} />
            </div>
            <div>
              <Label className="font-semibold">Project Type *</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {PROJECT_TYPES.map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => setProjectType(value)}
                    className={`border-2 rounded-xl py-2.5 px-2 text-sm font-medium transition-all ${projectType === value ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-slate-200 hover:border-amber-300 text-slate-700'}`}>
                    {label}
                  </button>
                ))}
              </div>
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

      {/* Step 2 */}
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
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span><strong>Next Available:</strong> {nextAvailableDate}</span>
            </div>
            <div>
              <Label className="font-semibold">Products You&apos;re Interested In</Label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="e.g. Vidar Macaroon, hardwood for living room"
                value={productsInterested}
                onChange={(e) => setProductsInterested(e.target.value)}
              />
              <p className="text-[11px] text-slate-400 mt-1">Our installer will bring samples of these products to your measurement.</p>
            </div>
            <div>
              <Label className="font-semibold mb-2 block">Preferred Date &amp; Time *</Label>
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
            <p className="text-xs text-red-600 font-medium text-center">⚡ Limited spots available this week.</p>
            <Button type="submit" disabled={isSubmitting || !formData.customer_name || !formData.customer_phone || !formData.customer_email || !formData.customer_address || !formData.preferred_date || !formData.preferred_time}
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
