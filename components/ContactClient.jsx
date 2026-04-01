'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Calendar, MessageCircle } from 'lucide-react';
import { createPageUrl } from '@/lib/routes';

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  message: '',
  smsConsent: false,
};

export default function ContactClient() {
  const [formData, setFormData] = useState(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // optional field
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid 10-digit phone number (e.g. 647-428-1111).');
      setLoading(false);
      return;
    }

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
      setFormData(initialFormData);
    } catch (err) {
      setError('Something went wrong. Please try again or call us directly at (647) 428-1111.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Ready to transform your floors? Our team is here to help with a free consultation and quote.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left: Contact Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Send Us a Message</h2>
              <p className="text-slate-500 text-sm mb-6">We typically respond within a few hours during business hours.</p>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-500 mb-4">
                    Thanks for reaching out! We typically respond within 2 business hours.
                  </p>
                  <p className="text-slate-400 text-sm mb-6">
                    Need an answer sooner? Call us directly at{' '}
                    <a href="tel:6474281111" className="text-amber-600 font-medium hover:underline">(647) 428-1111</a>
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="phone">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(647) 555-0100"
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="message">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project — room size, flooring type, timeline..."
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition resize-none"
                    />
                  </div>

                  {/* SMS Consent */}
                  <div className="flex items-start gap-3">
                    <input
                      id="smsConsent"
                      name="smsConsent"
                      type="checkbox"
                      checked={formData.smsConsent}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="smsConsent" className="text-sm text-slate-500 cursor-pointer">
                      I agree to receive SMS updates about my inquiry. Message &amp; data rates may apply. Reply STOP to opt out.
                    </label>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Info Cards + Map */}
          <div className="flex flex-col gap-6">

            {/* Phone */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-start gap-4">
              <div className="bg-amber-100 text-amber-600 rounded-xl p-3 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Phone</h3>
                <a
                  href="tel:+16474281111"
                  className="text-amber-600 hover:text-amber-700 font-medium text-lg transition-colors"
                >
                  (647) 428-1111
                </a>
                <p className="text-slate-500 text-sm mt-1">Call or text anytime during business hours</p>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-start gap-4">
              <div className="bg-amber-100 text-amber-600 rounded-xl p-3 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Showroom</h3>
                <p className="text-slate-700 font-medium">6061 Highway 7, Unit B</p>
                <p className="text-slate-700 font-medium">Markham, Ontario, L3P 3B2</p>
                <a
                  href="https://maps.google.com/?q=6061+Highway+7+Unit+B+Markham+Ontario+L3P+3B2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-700 text-sm mt-1 inline-block transition-colors"
                >
                  Get Directions →
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-start gap-4">
              <div className="bg-amber-100 text-amber-600 rounded-xl p-3 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Store Hours</h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li className="flex justify-between gap-8">
                    <span>Mon – Fri</span>
                    <span className="font-medium">10am – 5pm</span>
                  </li>
                  <li className="flex justify-between gap-8">
                    <span>Saturday</span>
                    <span className="font-medium">10am – 5pm</span>
                  </li>
                  <li className="flex justify-between gap-8">
                    <span>Sunday</span>
                    <span className="font-medium text-amber-600">By Appointment</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <iframe
                title="BBS Flooring Markham Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2876.972!2d-79.262!3d43.876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s6061+Highway+7+Unit+B+Markham+ON!5e0!3m2!1sen!2sca!4v1"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-slate-300 mb-10 text-lg max-w-xl mx-auto">
            Book a free in-home measurement or reach us directly — whatever works best for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Book Measurement */}
            <Link
              href={createPageUrl('booking')}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-7 py-3 rounded-xl transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Book Measurement
            </Link>

            {/* Call Now */}
            <a
              href="tel:+16474281111"
              className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold px-7 py-3 rounded-xl transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/message/CQQRGZKI3U2VH1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-7 py-3 rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
