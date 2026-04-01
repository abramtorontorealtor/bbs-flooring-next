import Link from 'next/link';

export const metadata = {
  title: '404 — Page Not Found | BBS Flooring',
  description: 'The page you were looking for could not be found. Browse our flooring products, services, or contact us.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const popularLinks = [
    { label: 'All Products', href: '/products', icon: '🏠' },
    { label: 'Vinyl Flooring', href: '/vinyl', icon: '💧' },
    { label: 'Hardwood', href: '/solid-hardwood', icon: '🌳' },
    { label: 'Clearance Sale', href: '/clearance', icon: '🔥' },
    { label: 'Installation', href: '/installation', icon: '🔨' },
    { label: 'Free Measurement', href: '/free-measurement', icon: '📐' },
    { label: 'Quote Calculator', href: '/quote-calculator', icon: '💰' },
    { label: 'Contact Us', href: '/contact', icon: '📞' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <span className="text-7xl font-black text-amber-500">404</span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4">
            Page Not Found
          </h1>
          <p className="text-slate-500 mt-3 text-lg">
            This page doesn&apos;t exist or may have moved. Let&apos;s get you back on track.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {popularLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-2 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md p-4 transition-all group"
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="text-sm font-medium text-slate-700 group-hover:text-amber-600 transition-colors text-center">
                {link.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-xl transition-colors"
          >
            ← Back to Home
          </Link>
          <a
            href="tel:+16474281111"
            className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
          >
            📞 Call (647) 428-1111
          </a>
        </div>

        <p className="text-sm text-slate-400 mt-8">
          Looking for something specific? Try our{' '}
          <Link href="/products" className="text-amber-600 hover:underline">product search</Link>{' '}
          or{' '}
          <Link href="/contact" className="text-amber-600 hover:underline">contact us</Link>.
        </p>
      </div>
    </div>
  );
}
