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

  return (
    <Link href={href}>
      <div className={`group relative overflow-hidden rounded-2xl md:rounded-3xl ${isLarge ? 'h-[220px] md:h-[500px]' : 'h-[180px] md:h-[400px]'}`}>
        <Image
          src={image}
          alt={imageAlt || title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          fill
          sizes={isLarge ? '(max-width: 768px) 50vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
          quality={60}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className={`bg-amber-500 text-white rounded-lg inline-block mb-1.5 md:mb-3 font-semibold ${isLarge ? 'px-3 py-1.5 text-sm md:px-5 md:py-2.5 md:text-base' : 'px-2.5 py-1 text-xs md:px-4 md:py-2 md:text-sm'}`}>
            {title}
          </div>
          <p className={`text-white/80 mb-1.5 md:mb-3 max-w-xs hidden md:block ${isLarge ? 'text-base' : 'text-sm'}`}>{description}</p>
          <div className={`flex items-center gap-2 text-white font-medium group-hover:text-amber-400 transition-colors ${isLarge ? 'text-sm md:text-base' : 'text-xs md:text-sm'}`}>
            <span>Shop Now</span>
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
