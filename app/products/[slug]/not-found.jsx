import Link from 'next/link';

export default function ProductNotFound() {
  const categories = [
    { label: 'All Products', href: '/products', icon: '🏠' },
    { label: 'Vinyl Flooring', href: '/vinyl', icon: '💧' },
    { label: 'Engineered Hardwood', href: '/engineered-hardwood', icon: '🌳' },
    { label: 'Solid Hardwood', href: '/solid-hardwood', icon: '🪵' },
    { label: 'Laminate', href: '/laminate', icon: '📐' },
    { label: 'Clearance Sale', href: '/clearance', icon: '🔥' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <span className="text-6xl">🔍</span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4">
            Product Not Found
          </h1>
          <p className="text-slate-500 mt-3 text-lg">
            This product may have been discontinued or renamed.
            Browse our current collection below.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="flex items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md hover:bg-amber-50 transition-all border border-slate-100"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="font-medium text-slate-700">{cat.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors"
          >
            Browse All Products
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Contact Us
          </Link>
        </div>

        <p className="text-sm text-slate-400 mt-8">
          Looking for something specific?{' '}
          <Link href="/contact" className="text-amber-600 hover:underline">
            Call us at (905) 910-2070
          </Link>{' '}
          — we can help you find it.
        </p>
      </div>
    </div>
  );
}
