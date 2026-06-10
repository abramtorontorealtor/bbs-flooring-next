import Link from 'next/link';
import Image from 'next/image';

function ArrowRight({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}

const CATEGORY_ROUTES = {
  solid_hardwood: '/solid-hardwood',
  engineered_hardwood: '/engineered-hardwood',
  laminate: '/laminate',
  vinyl: '/vinyl',
  waterproof: '/waterproof-flooring',
  clearance: '/clearance',
};

export default function CategoryCardServer({ category, image, imageAlt, title, description, size = 'standard' }) {
  const href = CATEGORY_ROUTES[category] || `/products?category=${category}`;
  const isLarge = size === 'large';

  // Large = hero overlay card (kept for any pages that still need it)
  if (isLarge) {
    return (
      <Link href={href}>
        <div className="group relative overflow-hidden rounded-2xl md:rounded-3xl h-[220px] md:h-[500px]">
          <Image
            src={image}
            alt={imageAlt || title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            fill
            sizes="(max-width: 768px) 50vw, 50vw"
            quality={60}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
            <div className="bg-amber-500 text-white rounded-lg inline-block mb-1.5 md:mb-3 font-semibold px-3 py-1.5 text-sm md:px-5 md:py-2.5 md:text-base">
              {title}
            </div>
            <p className="text-white/80 mb-1.5 md:mb-3 max-w-xs hidden md:block text-base">{description}</p>
            <div className="flex items-center gap-2 text-white font-medium group-hover:text-amber-400 transition-colors text-sm md:text-base">
              <span>Shop Now</span>
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Standard = clean card (image top, text below) — matches contractor-flooring style
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={imageAlt || title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
          quality={70}
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1 group-hover:text-amber-600 transition-colors leading-tight">
          {title}
        </h3>
        <p className="text-slate-500 text-xs leading-relaxed hidden md:block">{description}</p>
        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-xs mt-2 group-hover:gap-2 transition-all">
          Shop Now <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
