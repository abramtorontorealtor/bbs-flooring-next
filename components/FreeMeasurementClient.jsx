'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SlotPicker from '@/components/booking/SlotPicker';
import AlternateTimePanel from '@/components/booking/AlternateTimePanel';
import { CheckCircle, Phone, Star, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { validatePhone, validateEmail } from '@/lib/validations';
import { GOOGLE_RATING } from '@/lib/service-constants';
import { interpretBookingSubmit, readJsonSafe } from '@/lib/booking/submit-result';
import { trackBookingConversion } from '@/lib/booking/conversion';
import { BOOKING_COPY, submitFailure, newIdempotencyKey, formatBookingDate, savedSlotFromResponse } from '@/lib/booking/picker-model';

const PROJECT_TYPES = [
  { value: 'hardwood', label: '🪵 Hardwood' },
  { value: 'vinyl', label: '💧 Vinyl' },
  { value: 'laminate', label: '🏠 Laminate' },
  { value: 'stairs', label: '🪜 Stairs' },
];

// Multi-select flooring interests (Phase E). These fold into `notes`, which
// already propagates to Telegram + admin email + CRM/DB.
const FLOORING_INTERESTS = [
  { value: 'Engineered Hardwood', label: 'Engineered Hardwood' },
  { value: 'Vinyl / LVP', label: 'Vinyl / LVP' },
  { value: 'Laminate', label: 'Laminate' },
  { value: 'Solid Hardwood', label: 'Solid Hardwood' },
  { value: 'Stairs', label: 'Stairs' },
  { value: 'Not Sure Yet', label: 'Not Sure Yet' },
];

// Map a ?service= slug (passed by Phase D city-service CTAs) to a readable label.
const SERVICE_LABELS = {
  'hardwood-refinishing': 'Hardwood Refinishing',
  'hardwood-refinishing-markham': 'Hardwood Refinishing (Markham)',
  'stair-refinishing': 'Stair Refinishing',
  'stair-refinishing-markham': 'Stair Refinishing (Markham)',
  'carpet-removal': 'Carpet Removal',
  'carpet-removal-markham': 'Carpet Removal (Markham)',
  'installation': 'Flooring Installation',
};

function serviceLabelFromSlug(slug) {
  if (!slug) return '';
  return SERVICE_LABELS[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPostalCode(value) {
  const clean = value.replace(/\s/g, '').toUpperCase();
  if (clean.length <= 3) return clean;
  return clean.slice(0, 3) + ' ' + clean.slice(3, 6);
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
  const [flooringInterests, setFlooringInterests] = useState([]);
  const [serviceInterest, setServiceInterest] = useState('');

  const toggleInterest = (value) => {
    setFlooringInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    preferred_date: '',
    preferred_time: '',
  });

  const formRef = useRef(null);
  // B2/B3: one idempotency key per request (reused across retries/double-clicks), picker override on 409.
  const [idemKey, setIdemKey] = useState(() => newIdempotencyKey());
  const [slotOverride, setSlotOverride] = useState(null);
  const [showAlternate, setShowAlternate] = useState(false);
  const [submittedSlot, setSubmittedSlot] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const productParam = searchParams?.get('product');
    if (productParam) {
      setProductsInterested(productParam);
    }
    // Phase D city-service pages link here with ?service=<slug>. Capture it so the
    // service intent flows into the lead notes (Telegram + email + CRM).
    const serviceParam = searchParams?.get('service');
    if (serviceParam) {
      setServiceInterest(serviceLabelFromSlug(serviceParam));
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

    try {
      const res = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idemKey },
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
            notes: [
              projectType && `Project Type: ${projectType}`,
              serviceInterest && `Service: ${serviceInterest}`,
              flooringInterests.length && `Interested in: ${flooringInterests.join(', ')}`,
              productsInterested && `Products interested in: ${productsInterested}`,
            ].filter(Boolean).join(' | '),
          },
        }),
      });
      // Success ONLY when the server persisted a booking (res.ok && success && bookingId).
      const data = await readJsonSafe(res);
      const outcome = interpretBookingSubmit(res, data);
      if (!outcome.success) {
        // B2: 409 → refreshed options, selected time cleared, contact details kept.
        const f = submitFailure(res.status, data);
        if (f.kind === 'slot_taken') {
          setSlotOverride(f.availability);
          setFormData((d) => ({ ...d, preferred_time: '' }));
        }
        setError(f.message);
        return;
      }

      // R3: commit the saved-booking UI FIRST; analytics are isolated and can never undo it.
      // R-B2-REPLAY: show the SAVED slot from the server (a replay may differ from what was just sent).
      setSubmittedSlot(savedSlotFromResponse(data, formData));
      setSubmitted(true);
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { /* ignore */ }
      // Conversion tracking — ONLY for a newly persisted booking (not a duplicate resubmit).
      if (outcome.fireConversion && typeof window !== 'undefined') trackBookingConversion(window, 'free_measurement');
    } catch {
      setError('We couldn\'t send your request. Please try again or call (647) 428-1111.');
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
            <h2 className="text-2xl font-bold text-slate-800 mb-3">{BOOKING_COPY.success}</h2>
            {submittedSlot && (
              <p className="text-slate-700 mb-2 font-medium">Requested: {formatBookingDate(submittedSlot.date)}{submittedSlot.time ? ` at ${submittedSlot.time} ET` : ''}</p>
            )}
            {submittedSlot?.changed && (
              <p className="text-amber-800 text-sm mb-2">{BOOKING_COPY.alreadyRequested}</p>
            )}
            <p className="text-slate-600 mb-6">Check your email for the details and a link to manage your request.</p>
            <button
              onClick={() => { setIdemKey(newIdempotencyKey()); setSlotOverride(null); setShowAlternate(false); setSubmitted(false); setStep(1); setPostalCode(''); setProjectType(''); setProductsInterested(''); setFlooringInterests([]); setServiceInterest(''); setFormData({ customer_name: '', customer_email: '', customer_phone: '', customer_address: '', preferred_date: '', preferred_time: '' }); }}
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

      {error && step !== 2 && <p role="alert" className="text-red-500 text-sm mb-4 font-medium">{error}</p>}

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
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">Choose your consultation time</h2>
          <p className="text-slate-600 text-sm mb-1">{BOOKING_COPY.support}</p>
          <p className="text-slate-700 text-sm font-semibold mb-5">{BOOKING_COPY.reassurance}</p>
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
            {serviceInterest && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-amber-500" />
                <span><strong>Service requested:</strong> {serviceInterest}</span>
              </div>
            )}
            <div>
              <Label className="font-semibold mb-1.5 block">What are you looking to floor? <span className="font-normal text-slate-400">(select all that apply)</span></Label>
              <div className="grid grid-cols-2 gap-2">
                {FLOORING_INTERESTS.map(({ value, label }) => {
                  const active = flooringInterests.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleInterest(value)}
                      aria-pressed={active}
                      className={`flex items-center gap-2 border-2 rounded-xl py-2 px-3 text-sm font-medium text-left transition-all ${active ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-slate-200 hover:border-amber-300 text-slate-700'}`}
                    >
                      <span className={`flex items-center justify-center w-4 h-4 rounded border ${active ? 'bg-amber-500 border-amber-500' : 'border-slate-300'}`}>
                        {active && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </span>
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Helps us bring the right samples to your measurement.</p>
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
              <SlotPicker
                idPrefix="fm"
                date={formData.preferred_date}
                time={formData.preferred_time}
                override={slotOverride}
                onDateChange={(d) => { setError(''); setSlotOverride(null); setFormData((f) => ({ ...f, preferred_date: d, preferred_time: '' })); }}
                onTimeChange={(t) => { setError(''); setFormData((f) => (f.preferred_time === t ? f : { ...f, preferred_time: t })); }}
                onAlternate={() => setShowAlternate(true)}
              />
              {showAlternate && (
                <AlternateTimePanel
                  idPrefix="fm-alt"
                  prefill={{ name: formData.customer_name, phone: formData.customer_phone, email: formData.customer_email }}
                  context={{ postalCode, projectType, serviceInterest, flooringInterests, products: productsInterested, page: 'free-measurement', triedDate: formData.preferred_date }}
                  onClose={() => setShowAlternate(false)}
                />
              )}
            </div>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

            <Button type="submit" disabled={isSubmitting || !formData.customer_name || !formData.customer_phone || !formData.customer_email || !formData.customer_address || !formData.preferred_date || !formData.preferred_time}
              className="w-full h-auto whitespace-normal bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base py-6 disabled:opacity-50 disabled:cursor-not-allowed" size="lg">
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {BOOKING_COPY.submitting}</> : BOOKING_COPY.submit}
            </Button>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
              <span className="font-medium">{GOOGLE_RATING}★ on Google</span>
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
