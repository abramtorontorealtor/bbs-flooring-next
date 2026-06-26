'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function formatPostalCode(value) {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  if (cleaned.length > 3) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return cleaned;
}

// Mirrors the service-area rule used in QuoteBookingClient / FreeMeasurementClient:
// L = GTA/York/Durham, M = Toronto, K = east corridor (Barrie/Durham reach).
function isInServiceArea(postal) {
  const first = (postal || '').trim().toUpperCase()[0];
  return ['L', 'M', 'K'].includes(first);
}

const MEASUREMENT_URL = (productName) =>
  productName ? `/free-measurement?product=${encodeURIComponent(productName)}` : '/free-measurement';

export default function SampleTrapModal({ open, onOpenChange, product }) {
  const productName = product?.name || '';
  const [step, setStep] = useState('postal'); // postal | in-area | out-area | sent
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep('postal'); setPostalCode(''); setError('');
    setName(''); setEmail(''); setPhone(''); setSubmitting(false);
  };

  const handleClose = (next) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleCheck = () => {
    if (!postalCode || postalCode.replace(/\s/g, '').length < 3) {
      setError('Please enter at least the first 3 characters of your postal code.');
      return;
    }
    setError('');
    setStep(isInServiceArea(postalCode) ? 'in-area' : 'out-area');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) { setError('Name and email are required.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          source: 'sample_request_showroom',
          message:
            `SAMPLE / SHOWROOM REQUEST\n` +
            `Product: ${productName || 'N/A'}\n` +
            `Postal code: ${postalCode || 'N/A'} (in service area)\n` +
            `Customer wants to see this floor in person at the Markham showroom or have it brought to a free in-home measurement.`,
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStep('sent');
    } catch {
      setError('Something went wrong. Please call us at (647) 428-1111 or try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 'sent' ? 'Got it — we&apos;ll be in touch' : 'See & feel this floor in person'}
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1 — postal */}
        {step === 'postal' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              We&apos;re a local Markham flooring store — so instead of mailing a sample, we&apos;ll show
              you the <strong>real product</strong> in person. Where are you located?
            </p>
            <div>
              <label className="text-sm font-medium text-slate-700">Postal code</label>
              <Input
                className="mt-1 text-base"
                placeholder="L3P 3B2"
                value={postalCode}
                onChange={(e) => setPostalCode(formatPostalCode(e.target.value))}
                maxLength={7}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-bold" onClick={handleCheck}>
              Continue
            </Button>
          </div>
        )}

        {/* STEP 2a — in area */}
        {step === 'in-area' && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <p className="text-sm text-slate-600">
              You&apos;re in our service area. Two easy ways to see &amp; feel{' '}
              <strong>{productName || 'this floor'}</strong> in person:
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-bold text-slate-900">🏬 Visit our Markham showroom</p>
              <p className="text-sm text-slate-600 mt-1">6061 Highway 7, Unit B, Markham · Mon–Sat 10am–5pm</p>
              <a
                href="https://maps.google.com/?q=6061+Highway+7+Unit+B+Markham+Ontario+L3P+3B2"
                target="_blank" rel="noopener noreferrer"
                className="text-sm text-amber-700 underline font-medium mt-1 inline-block"
              >
                Get directions
              </a>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-bold text-slate-900">📏 Book a free in-home measurement</p>
              <p className="text-sm text-slate-600 mt-1">We&apos;ll bring this sample to your appointment.</p>
              <Link
                href={MEASUREMENT_URL(productName)}
                className="text-sm text-amber-700 underline font-medium mt-1 inline-block"
                onClick={() => handleClose(false)}
              >
                Book my free measurement →
              </Link>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-sm font-semibold text-slate-800 mb-2">Or have us reach out to you:</p>
              <div className="grid gap-2">
                <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input type="tel" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
              <Button type="submit" disabled={submitting} className="w-full h-11 mt-3 bg-slate-900 hover:bg-slate-800 text-white font-bold">
                {submitting ? 'Sending…' : 'Have BBS contact me'}
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2b — out of area */}
        {step === 'out-area' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              We&apos;re a <strong>local Markham installer</strong> serving the Greater Toronto Area.
              You&apos;re welcome to visit our showroom to see and feel this floor, but we don&apos;t
              ship samples or install outside our service area.
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-bold text-slate-900">🏬 Markham showroom</p>
              <p className="text-sm text-slate-600 mt-1">6061 Highway 7, Unit B, Markham · Mon–Sat 10am–5pm</p>
            </div>
            <p className="text-sm text-slate-600">
              Questions? Call or WhatsApp us at{' '}
              <a href="tel:6474281111" className="text-amber-700 underline font-medium">(647) 428-1111</a>.
            </p>
            <Button className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-bold" onClick={() => handleClose(false)}>
              Close
            </Button>
          </div>
        )}

        {/* STEP 3 — sent */}
        {step === 'sent' && (
          <div className="space-y-4 text-center py-2">
            <div className="text-4xl">✅</div>
            <p className="text-sm text-slate-600">
              Thanks, {name.split(' ')[0]}! We&apos;ve got your request for{' '}
              <strong>{productName || 'this floor'}</strong> and will reach out shortly to set up your
              showroom visit or measurement.
            </p>
            <Button className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-bold" onClick={() => handleClose(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
