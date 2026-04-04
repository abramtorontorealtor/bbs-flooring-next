'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPageUrl } from '@/lib/routes';
import { ArrowRight } from 'lucide-react';

function useFadeInView() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

// Map DB category values to dedicated category page routes
const CATEGORY_ROUTES = {
  solid_hardwood: '/solid-hardwood',
  engineered_hardwood: '/engineered-hardwood',
  laminate: '/laminate',
  vinyl: '/vinyl',
  waterproof: '/waterproof-flooring',
  clearance: '/clearance',
};

export default function CategoryCard({ category, image, imageAlt, title, description }) {
  const { ref, visible } = useFadeInView();
  const href = CATEGORY_ROUTES[category] || `/products?category=${category}`;
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.5s ease-out, transform 0.5s ease-out' }}>
      <Link href={href}>
        <div className="group relative h-[500px] rounded-3xl overflow-hidden">
          <Image src={image} alt={imageAlt || title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" quality={80} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="bg-amber-500 text-white px-4 py-2 rounded-lg inline-block mb-4 font-semibold">{title}</div>
            <p className="text-white/80 text-sm mb-4 max-w-xs">{description}</p>
            <div className="flex items-center gap-2 text-white font-medium group-hover:text-amber-400 transition-colors">
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
