import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">Manage your BBS Flooring store</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/products"
          className="block p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-amber-300 hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Products</h2>
          <p className="text-slate-600 text-sm">Manage your product catalog — add, edit, delete products.</p>
        </Link>

        <Link
          href="/admin/variants"
          className="block p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-amber-300 hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Variants</h2>
          <p className="text-slate-600 text-sm">Manage product variants, pricing, and stock per variant.</p>
        </Link>

        <Link
          href="/admin/product-enrichment"
          className="block p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-amber-300 hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Product Enrichment</h2>
          <p className="text-slate-600 text-sm">Auto-generate product details and descriptions using AI.</p>
        </Link>
      </div>
    </div>
  );
}
