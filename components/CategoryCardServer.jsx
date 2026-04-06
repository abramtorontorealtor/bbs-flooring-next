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

export default function CategoryCardServer({ category, image, imageAlt, title, description }) {
  const href = CATEGORY_ROUTES[category] || `/products?category=${category}`;
  return (
    <Link href={href}>
      <div className="group relative h-[500px] rounded-3xl overflow-hidden">
        <Image src={image} alt={imageAlt || title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" quality={75} loading="lazy" />
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
  );
}
