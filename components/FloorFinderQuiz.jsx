'use client';

import React, { useState, useCallback } from 'react';
import { ArrowRight, ArrowLeft, Loader, Home, Droplets, Palette, DollarSign, Dog, CheckCircle, Phone, Star, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// ── Quiz Steps ──────────────────────────────────────────────────
const STEPS = [
  {
    id: 'room',
    question: "What room is the flooring for?",
    subtitle: "Different rooms need different flooring characteristics.",
    icon: Home,
    options: [
      { value: 'living_room', label: 'Living Room', emoji: '🛋️', desc: 'High traffic, style matters' },
      { value: 'bedroom', label: 'Bedroom', emoji: '🛏️', desc: 'Comfort and warmth' },
      { value: 'kitchen', label: 'Kitchen', emoji: '🍳', desc: 'Spill-resistant, easy to clean' },
      { value: 'bathroom', label: 'Bathroom', emoji: '🚿', desc: 'Waterproof is a must' },
      { value: 'basement', label: 'Basement', emoji: '🏠', desc: 'Moisture-resistant' },
      { value: 'commercial', label: 'Commercial / Office', emoji: '🏢', desc: 'Heavy-duty, professional look' },
    ],
  },
  {
    id: 'priority',
    question: "What matters most to you?",
    subtitle: "We'll prioritize your top concern.",
    icon: Star,
    options: [
      { value: 'durability', label: 'Durability', emoji: '💪', desc: 'Built to last decades' },
      { value: 'style', label: 'Style & Look', emoji: '✨', desc: 'Beautiful, designer finish' },
      { value: 'budget', label: 'Best Value', emoji: '💰', desc: 'Maximum quality per dollar' },
      { value: 'waterproof', label: 'Waterproof', emoji: '💧', desc: 'Protection from spills & moisture' },
      { value: 'low_maintenance', label: 'Low Maintenance', emoji: '🧹', desc: 'Easy to clean, no fuss' },
    ],
  },
  {
    id: 'budget',
    question: "What's your budget per square foot?",
    subtitle: "This helps us match the right product range.",
    icon: DollarSign,
    options: [
      { value: 'budget', label: '$1 – $3/sqft', emoji: '💵', desc: 'Great options in vinyl & laminate' },
      { value: 'mid', label: '$3 – $5/sqft', emoji: '💵💵', desc: 'Most popular range' },
      { value: 'premium', label: '$5+/sqft', emoji: '💵💵💵', desc: 'Premium hardwood & luxury vinyl' },
      { value: 'unsure', label: "I'm flexible", emoji: '🤷', desc: 'Show me the best options' },
    ],
  },
  {
    id: 'style',
    question: 'What look are you going for?',
    subtitle: 'Pick the style that matches your home.',
    icon: Palette,
    options: [
      { value: 'modern_light', label: 'Modern & Light', emoji: '☀️', desc: 'White oak, blonde, natural tones' },
      { value: 'classic_warm', label: 'Classic & Warm', emoji: '🌅', desc: 'Honey, walnut, golden hues' },
      { value: 'dark_rich', label: 'Dark & Rich', emoji: '🌙', desc: 'Espresso, charcoal, deep browns' },
      { value: 'no_preference', label: 'No Preference', emoji: '🎨', desc: 'Show me everything' },
    ],
  },
  {
    id: 'lifestyle',
    question: 'Do you have pets or young kids?',
    subtitle: 'This affects our scratch & spill resistance recommendations.',
    icon: Dog,
    options: [
      { value: 'pets_kids', label: 'Yes — Pets and/or Kids', emoji: '🐾', desc: 'Need scratch & water protection' },
      { value: 'no', label: 'No', emoji: '✅', desc: 'Standard wear is fine' },
    ],
  },
];

const CATEGORY_LABELS = {
  engineered_hardwood: 'Engineered Hardwood',
  solid_hardwood: 'Solid Hardwood',
  vinyl: 'Vinyl / SPC',
  laminate: 'Laminate',
};

// ── Main Component ──────────────────────────────────────────────
export default function FloorFinderQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  const currentStep = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;
  const isComplete = step >= STEPS.length;

  const selectOption = useCallback(async (value) => {
    const newAnswers = { ...answers, [currentStep.id]: value };
    setAnswers(newAnswers);

    if (step < STEPS.length - 1) {
      // Advance to next question
      setStep(step + 1);
    } else {
      // Final question answered — fetch results
      setStep(STEPS.length); // Show results screen
      setLoading(true);

      // Track quiz completion
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'quiz_complete', {
          event_category: 'Floor Finder',
          event_label: JSON.stringify(newAnswers),
        });
      }
      if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', 'FloorFinderComplete', newAnswers);
      }

      try {
        const res = await fetch('/api/floor-finder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAnswers),
        });
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error('Floor finder error:', err);
        setResults({ products: [], error: true });
      } finally {
        setLoading(false);
      }
    }
  }, [answers, step, currentStep]);

  const goBack = () => {
    if (step > 0 && !isComplete) {
      setStep(step - 1);
    } else if (isComplete) {
      // Go back to last question
      setStep(STEPS.length - 1);
      setResults(null);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setResults(null);
    setEmail('');
    setEmailSubmitted(false);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || emailSubmitting) return;
    setEmailSubmitting(true);

    try {
      const { entities } = await import('@/lib/base44-compat');
      await entities.ContactLead.create({
        email,
        customer_email: email,
        lead_status: 'new',
        status: 'new',
        source: 'floor_finder_quiz',
        message: `Floor Finder quiz lead. Room: ${answers.room}, Priority: ${answers.priority}, Budget: ${answers.budget}, Style: ${answers.style}, Lifestyle: ${answers.lifestyle}`,
      });
    } catch (err) {
      console.warn('Email save failed:', err);
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        event_category: 'Floor Finder',
        event_label: 'quiz_email_capture',
        value: 10.0,
        currency: 'CAD',
      });
    }
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', { content_name: 'floor_finder_quiz', value: 10.0, currency: 'CAD' });
    }

    setEmailSubmitting(false);
    setEmailSubmitted(true);
  };

  // ── Results Screen ──
  if (isComplete) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Your Personalized Recommendations
          </h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Based on your answers, here are the best flooring options for you.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Finding your perfect floors...</p>
          </div>
        ) : results?.products?.length > 0 ? (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
              {results.products.map((product, idx) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingCart className="w-10 h-10" />
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                      {idx === 0 && (
                        <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow">
                          Best Match
                        </span>
                      )}
                      {product.is_on_sale && (
                        <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow">
                          Sale
                        </span>
                      )}
                      {product.is_waterproof && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full shadow flex items-center gap-1">
                          <Droplets className="w-3 h-3" /> Waterproof
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                      {product.brand} · {CATEGORY_LABELS[product.category] || product.category}
                    </p>
                    <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 mb-2 text-sm sm:text-base">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      {product.sale_price_per_sqft ? (
                        <>
                          <span className="text-lg font-bold text-red-600">
                            ${Number(product.sale_price_per_sqft).toFixed(2)}
                          </span>
                          <span className="text-sm text-slate-400 line-through">
                            ${Number(product.price_per_sqft).toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-500">/sqft</span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg font-bold text-slate-900">
                            ${Number(product.price_per_sqft).toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-500">/sqft</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Email Capture CTA */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-center mb-8">
              {emailSubmitted ? (
                <div>
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white mb-1">You&apos;re All Set!</h3>
                  <p className="text-slate-300 text-sm">We&apos;ll be in touch with exclusive deals on your recommended floors.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Want These Deals Sent to You?
                  </h3>
                  <p className="text-slate-300 mb-5 text-sm sm:text-base">
                    Get exclusive pricing and sale alerts on your recommended floors. No spam.
                  </p>
                  <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={emailSubmitting}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {emailSubmitting ? 'Saving...' : 'Send Me Deals'}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Bottom CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:6474281111"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/20"
              >
                <Phone className="w-5 h-5" />
                Call for Expert Advice
              </a>
              <button
                onClick={restart}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-slate-200 hover:border-amber-400 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retake Quiz
              </button>
            </div>
          </>
        ) : (
          /* No results fallback */
          <div className="text-center py-12">
            <p className="text-slate-600 mb-6">
              {results?.error
                ? "Something went wrong. Please try again."
                : "We couldn't find an exact match, but we have 700+ floors to explore!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors"
              >
                Browse All Products
              </Link>
              <button
                onClick={restart}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retake Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Quiz Step Screen ──
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
          <span>Question {step + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Back Button */}
      {step > 0 && (
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      {/* Question */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <currentStep.icon className="w-7 h-7 text-amber-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          {currentStep.question}
        </h2>
        <p className="text-slate-500">{currentStep.subtitle}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentStep.options.map((option) => (
          <button
            key={option.value}
            onClick={() => selectOption(option.value)}
            className={`
              text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200
              hover:border-amber-400 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
              ${answers[currentStep.id] === option.value
                ? 'border-amber-500 bg-amber-50 shadow-md'
                : 'border-slate-200 bg-white'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0 mt-0.5">{option.emoji}</span>
              <div>
                <p className="font-semibold text-slate-900">{option.label}</p>
                <p className="text-sm text-slate-500 mt-0.5">{option.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
