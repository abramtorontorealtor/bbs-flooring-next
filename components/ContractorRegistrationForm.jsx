'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Building2, Phone, Loader2 } from 'lucide-react';
import { validatePhone, validateEmail } from '@/lib/validations';
import { toast } from 'sonner';
import { Analytics } from '@/components/analytics';

const TRADE_TYPES = [
  'General Contractor',
  'Flooring Installer',
  'Property Manager',
  'Builder / Developer',
  'Interior Designer',
  'Other',
];

const VOLUME_OPTIONS = [
  { value: '1-5', label: '1–5 projects/month' },
  { value: '5-15', label: '5–15 projects/month' },
  { value: '15+', label: '15+ projects/month' },
];

export default function ContractorRegistrationForm() {
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    email: '',
    trade_type: '',
    monthly_volume: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.contact_name || !form.email || !form.phone) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!validateEmail(form.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!validatePhone(form.phone)) {
      toast.error('Please enter a valid phone number (e.g. 647-428-1111).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contractor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Submission failed');

      Analytics.trackEvent('contractor_registration', 'lead', form.trade_type || 'unknown');
      // GA4 — generate_lead event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'generate_lead', {
          event_category: 'contractor',
          event_label: form.trade_type || 'contractor_registration',
        });
      }
      // Meta Pixel — Lead event
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', { content_name: 'Contractor Registration' });
      }
      setSubmitted(true);
    } catch (err) {
      toast.error('Something went wrong. Please call us at (647) 428-1111.');
      console.error('Contractor form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
          <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Application Received!</h2>
          <p className="text-slate-600 text-lg mb-2">
            Our team will review your contractor application and contact you within 24 business hours.
          </p>
          <p className="text-sm text-slate-500">
            Need immediate assistance? Call us at{' '}
            <a href="tel:6474281111" className="font-semibold text-amber-600 hover:underline">(647) 428-1111</a>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-16" id="contractor-form">
      <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-lg p-8 md:p-10">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-amber-500" />
          <h2 className="text-3xl font-bold text-slate-800">Open a Contractor Account</h2>
        </div>
        <p className="text-slate-600 mb-8 text-lg">
          Volume pricing, priority scheduling, and a dedicated account rep. Fill out the form and we&apos;ll set you up within one business day.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Company Name</Label>
              <Input
                className="mt-1"
                placeholder="Your company name"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              />
            </div>
            <div>
              <Label className="font-semibold">Contact Name *</Label>
              <Input
                className="mt-1"
                placeholder="Your full name"
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Phone *</Label>
              <Input
                type="tel"
                className="mt-1"
                placeholder="(647) 000-0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="font-semibold">Email *</Label>
              <Input
                type="email"
                className="mt-1"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Trade Type</Label>
              <Select value={form.trade_type} onValueChange={(v) => setForm({ ...form, trade_type: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select your trade" /></SelectTrigger>
                <SelectContent>
                  {TRADE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-semibold">Estimated Monthly Volume</Label>
              <Select value={form.monthly_volume} onValueChange={(v) => setForm({ ...form, monthly_volume: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select volume" /></SelectTrigger>
                <SelectContent>
                  {VOLUME_OPTIONS.map((v) => (
                    <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="font-semibold">Additional Notes</Label>
            <Textarea
              className="mt-1"
              rows={3}
              placeholder="Tell us about your typical projects, materials you use, or anything else..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !form.contact_name || !form.email || !form.phone}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 text-lg rounded-xl disabled:opacity-50"
            size="lg"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</>
            ) : (
              <><Phone className="w-5 h-5 mr-2" /> Apply for Contractor Pricing</>
            )}
          </Button>

          <p className="text-xs text-slate-400 text-center">
            No spam. We&apos;ll only contact you about your contractor account. Call{' '}
            <a href="tel:6474281111" className="underline">(647) 428-1111</a> for immediate assistance.
          </p>
        </form>
      </div>
    </section>
  );
}
