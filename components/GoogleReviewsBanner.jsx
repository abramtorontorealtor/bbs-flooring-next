'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import { GOOGLE_REVIEWS, GOOGLE_REVIEW_STATS } from '@/data/googleReviews';

export default function GoogleReviewsBanner({ variant = 'carousel' }) {
  if (variant === 'compact') return <CompactReviews />;
  return <CarouselReviews />;
}

function GoogleLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function Stars({ rating = 5, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} size={size} />
      ))}
    </div>
  );
}

function Avatar({ name, photoUrl, size = 40 }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  if (photoUrl) {
    return (
      <img src={photoUrl} alt={name} width={size} height={size} className="rounded-full object-cover flex-shrink-0" loading="lazy" referrerPolicy="no-referrer"
        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
      />
    );
  }
  return (
    <div className="rounded-full bg-amber-100 text-amber-700 font-semibold flex items-center justify-center flex-shrink-0" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initials}
    </div>
  );
}

function CarouselReviews() {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const animRef = useRef(null);
  const posRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let lastTime = null;
    const speed = 0.5;
    function tick(time) {
      if (!lastTime) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;
      if (!isPaused) {
        posRef.current += speed * (delta / 16.67);
        const halfWidth = el.scrollWidth / 2;
        if (posRef.current >= halfWidth) posRef.current -= halfWidth;
        el.scrollLeft = posRef.current;
      }
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPaused]);

  const displayReviews = [...GOOGLE_REVIEWS, ...GOOGLE_REVIEWS];

  return (
    <section className="py-16 px-4 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-3">
            <GoogleLogo size={32} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-800">{GOOGLE_REVIEW_STATS.averageRating}</span>
                <Stars rating={Math.round(GOOGLE_REVIEW_STATS.averageRating)} size={20} />
              </div>
              <p className="text-sm text-slate-500">Based on {GOOGLE_REVIEW_STATS.totalReviews} Google Reviews</p>
            </div>
          </div>
          <a href={GOOGLE_REVIEW_STATS.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">See all reviews on Google →</a>
        </div>
        <div ref={scrollRef} className="flex gap-5 overflow-x-hidden" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}>
          {displayReviews.map((review, idx) => (
            <div key={`${review.id}-${idx}`} className="flex-shrink-0 w-[340px] bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={review.name} photoUrl={review.photoUrl} size={40} />
                <div className="hidden" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{review.name}</p>
                  <p className="text-xs text-slate-400">{review.relativeDate}</p>
                </div>
                <div className="ml-auto flex-shrink-0"><GoogleLogo size={16} /></div>
              </div>
              <Stars rating={review.rating} size={14} />
              <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-4">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompactReviews() {
  const [currentIdx, setCurrentIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => { setCurrentIdx(prev => (prev + 1) % GOOGLE_REVIEWS.length); }, 5000);
    return () => clearInterval(timer);
  }, []);
  const review = GOOGLE_REVIEWS[currentIdx];
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <GoogleLogo size={18} />
        <span className="text-sm font-semibold text-slate-700">{GOOGLE_REVIEW_STATS.averageRating} stars</span>
        <Stars rating={Math.round(GOOGLE_REVIEW_STATS.averageRating)} size={14} />
        <span className="text-xs text-slate-400">({GOOGLE_REVIEW_STATS.totalReviews} reviews)</span>
      </div>
      <div className="transition-opacity duration-500">
        <div className="flex items-center gap-2 mb-1.5">
          <Avatar name={review.name} photoUrl={review.photoUrl} size={28} />
          <div className="hidden" />
          <span className="text-sm font-medium text-slate-700">{review.name}</span>
          <Stars rating={review.rating} size={12} />
        </div>
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 italic">"{review.text}"</p>
      </div>
      <div className="flex justify-center gap-1 mt-3">
        {GOOGLE_REVIEWS.slice(0, 8).map((_, i) => (
          <button key={i} onClick={() => setCurrentIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIdx ? 'bg-amber-500' : 'bg-slate-200'}`} aria-label={`Show review ${i + 1}`} />
        ))}
      </div>
      <a href={GOOGLE_REVIEW_STATS.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-xs text-blue-500 hover:underline mt-2">Read all reviews on Google</a>
    </div>
  );
}
