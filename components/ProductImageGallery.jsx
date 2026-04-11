'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn, Expand } from 'lucide-react';

/**
 * World-class product image gallery.
 *
 * Features:
 * - Hover-to-zoom lens on desktop (2× magnification)
 * - Vertical thumbnail rail (desktop) / horizontal strip (mobile)
 * - Fullscreen lightbox with arrow navigation
 * - Keyboard navigation (← → Esc)
 * - Touch swipe support in lightbox
 * - Image counter badge
 * - Smooth transitions & loading states
 * - Pinch-to-zoom in lightbox (native)
 *
 * Props:
 *   images: Array<{ url: string, alt: string }>
 *   badges: Array<React.ReactNode> (optional — sale/new badges)
 */
export default function ProductImageGallery({ images = [], badges = [], activeIdx: controlledIdx, onActiveIdxChange }) {
  const [internalIdx, setInternalIdx] = useState(0);
  const activeIdx = controlledIdx !== undefined ? controlledIdx : internalIdx;
  const setActiveIdx = onActiveIdxChange || setInternalIdx;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isZoomHover, setIsZoomHover] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [touchStart, setTouchStart] = useState(null);
  // Detect touch device to disable hover-zoom (prevents white flash on mobile tap)
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Track image loading state to show shimmer while loading
  // Default to true to prevent white-flash on mobile hydration race condition:
  // If onLoad fires before React hydrates, state update is lost → image stuck at opacity-0.
  // The shimmer overlay handles the loading UX; the image itself should always be visible.
  const [mainLoaded, setMainLoaded] = useState(true);
  // Track errored image URLs to swap in placeholder
  const [erroredUrls, setErroredUrls] = useState(new Set());
  const mainRef = useRef(null);
  const thumbnailRefs = useRef([]);

  const PLACEHOLDER = '/images/product-placeholder.svg';
  const gallery = images.length > 0 ? images : [{ url: PLACEHOLDER, alt: 'Product image' }];
  const rawCurrent = gallery[activeIdx] || gallery[0];
  // If this URL has errored, swap in the placeholder
  const current = erroredUrls.has(rawCurrent.url)
    ? { ...rawCurrent, url: PLACEHOLDER }
    : rawCurrent;

  // Track whether initial mount has happened (to skip shimmer on first render)
  const hasMounted = useRef(false);

  // Reset loading state when active image changes (show shimmer for new image)
  useEffect(() => {
    // Skip the first render — image is already visible via priority loading.
    // Only show shimmer on subsequent image switches (thumbnail clicks, variant changes).
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    setMainLoaded(false);
  }, [activeIdx]);

  // Keep activeIdx in bounds if images change
  useEffect(() => {
    if (activeIdx >= gallery.length) setActiveIdx(0);
  }, [gallery.length, activeIdx]);

  // Scroll active thumbnail into view
  useEffect(() => {
    thumbnailRefs.current[activeIdx]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [activeIdx]);

  // Keyboard nav
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setActiveIdx((i) => (i + 1) % gallery.length);
      if (e.key === 'ArrowLeft') setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, gallery.length]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  const goNext = useCallback(() => setActiveIdx((i) => (i + 1) % gallery.length), [gallery.length]);
  const goPrev = useCallback(() => setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length), [gallery.length]);

  // Hover zoom handler
  const handleMouseMove = useCallback((e) => {
    if (!mainRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  // Touch swipe for lightbox
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goPrev();
      else goNext();
    }
    setTouchStart(null);
  };

  return (
    <>
      <div className="sticky top-32">
        <div className="flex gap-3">
          {/* Vertical thumbnail rail — desktop only */}
          {gallery.length > 1 && (
            <div className="hidden md:flex flex-col gap-2 max-h-[600px] overflow-y-auto scrollbar-thin pr-1">
              {gallery.map((img, idx) => (
                <button
                  key={`thumb-${idx}`}
                  ref={(el) => (thumbnailRefs.current[idx] = el)}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative flex-shrink-0 w-[72px] h-[72px] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    idx === activeIdx
                      ? 'border-amber-500 ring-2 ring-amber-200 shadow-md'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    width={72}
                    height={72}
                    sizes="72px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="flex-1 relative">
            <div
              ref={mainRef}
              className={`aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden bg-slate-50 shadow-lg relative group ${isTouchDevice ? 'cursor-pointer' : 'cursor-crosshair'}`}
              onMouseEnter={() => { if (!isTouchDevice) setIsZoomHover(true); }}
              onMouseLeave={() => { if (!isTouchDevice) setIsZoomHover(false); }}
              onMouseMove={isTouchDevice ? undefined : handleMouseMove}
              onClick={() => setLightboxOpen(true)}
            >
              {/* Loading shimmer — shown while image loads */}
              {!mainLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse z-[1]" />
              )}

              {/* Normal image — always visible (shimmer overlay handles loading UX).
                  Only hide for desktop zoom-hover effect. Never opacity-0 by default
                  to avoid hydration race condition on mobile (M14/M15 in MISTAKES.md). */}
              <Image
                src={current.url}
                alt={current.alt}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isZoomHover ? 'opacity-0' : 'opacity-100'
                }`}
                width={1200}
                height={1200}
                priority={activeIdx === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                onLoad={() => setMainLoaded(true)}
                onError={() => {
                  setErroredUrls((prev) => new Set(prev).add(rawCurrent.url));
                  setMainLoaded(true);
                }}
              />

              {/* Zoom layer — 2× magnification on hover (desktop) */}
              {isZoomHover && (
                <div
                  className="absolute inset-0 hidden md:block"
                  style={{
                    backgroundImage: `url(${current.url})`,
                    backgroundSize: '200%',
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              )}

              {/* Badges (sale, new arrival, etc.) */}
              {badges.length > 0 && (
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {badges}
                </div>
              )}

              {/* Fullscreen button */}
              <button
                className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
                aria-label="View fullscreen"
              >
                <Expand className="w-5 h-5 text-slate-700" />
              </button>

              {/* Image counter */}
              {gallery.length > 1 && (
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full z-10">
                  {activeIdx + 1} / {gallery.length}
                </div>
              )}

              {/* Hover hint — only when NOT zooming */}
              {!isZoomHover && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/40 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4" /> Hover to zoom
                  </div>
                </div>
              )}
            </div>

            {/* Arrow nav on main image — desktop */}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-white transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-white transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </>
            )}

            {/* Horizontal thumbnail strip — mobile only */}
            {gallery.length > 1 && (
              <div className="flex md:hidden gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin">
                {gallery.map((img, idx) => (
                  <button
                    key={`mthumb-${idx}`}
                    onClick={() => setActiveIdx(idx)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === activeIdx
                        ? 'border-amber-500 ring-2 ring-amber-200'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                      width={64}
                      height={64}
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox — rendered via portal to bypass ancestor transforms
          that break position:fixed (e.g. animate-fade-in-up sets transform) */}
      {lightboxOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center animate-fade-in"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 transition-colors z-50"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image counter */}
          {gallery.length > 1 && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium z-50">
              {activeIdx + 1} / {gallery.length}
            </div>
          )}

          {/* Nav arrows */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-colors z-50"
                aria-label="Previous"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-colors z-50"
                aria-label="Next"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          {/* Main lightbox image — use native img to bypass Next.js srcset
              and load the original full-res image for zoom/pinch */}
          <div className="w-full max-h-[80vh] px-2 md:px-12 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.url}
              alt={current.alt}
              className="animate-scale-in select-none max-h-[80vh] w-full object-contain"
              draggable={false}
              style={{ touchAction: 'pinch-zoom' }}
            />
          </div>

          {/* Bottom thumbnail strip in lightbox */}
          {gallery.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full max-w-[90vw] overflow-x-auto">
              {gallery.map((img, idx) => (
                <button
                  key={`lb-${idx}`}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                    idx === activeIdx
                      ? 'border-amber-400 ring-1 ring-amber-300'
                      : 'border-white/20 hover:border-white/50 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    width={48}
                    height={48}
                    sizes="48px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
