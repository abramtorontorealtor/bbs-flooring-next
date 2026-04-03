import Link from 'next/link';
import { getSupabaseAdminClient } from '@/lib/supabase';
import {
  Package, ShoppingCart, Users, FileText, Calendar,
  MessageSquare, Star, BarChart3, Wrench, Search,
} from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard — BBS Flooring',
  robots: { index: false, follow: false },
};

async function getStats() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return {};

  const [products, orders, leads, bookings, quotes, blogPosts, customers] =
    await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('contact_leads').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('quotes').select('id', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
    ]);

  return {
    products: products.count ?? 0,
    orders: orders.count ?? 0,
    leads: leads.count ?? 0,
    bookings: bookings.count ?? 0,
    quotes: quotes.count ?? 0,
    blogPosts: blogPosts.count ?? 0,
    customers: customers.count ?? 0,
  };
}

const NAV_ITEMS = [
  { href: '/admin/crm', label: 'Lead Command Center', desc: 'All leads, orders, quotes, bookings — one view. Full order management built in.', icon: BarChart3, stat: 'leads', color: 'amber' },
  { href: '/admin/bookings', label: 'Bookings', desc: 'Manage measurement bookings and reschedule.', icon: Calendar, stat: 'bookings', color: 'blue' },
  { href: '/admin/quotes', label: 'Quotes', desc: 'View and follow up on customer quotes.', icon: FileText, stat: 'quotes', color: 'purple' },
  { href: '/admin/customers', label: 'Customers', desc: 'Member management, verification status.', icon: Users, stat: 'customers', color: 'indigo' },
  { href: '/admin/products', label: 'Products', desc: 'Manage catalog — add, edit, delete products.', icon: Package, stat: 'products', color: 'orange' },
  { href: '/admin/variants', label: 'Variants', desc: 'Manage product variants, pricing, and stock.', icon: Wrench, stat: null, color: 'slate' },
  { href: '/admin/blog', label: 'Blog', desc: 'Create and edit blog posts.', icon: MessageSquare, stat: 'blogPosts', color: 'rose' },
  { href: '/admin/product-enrichment', label: 'Product Enrichment', desc: 'AI-powered product descriptions and details.', icon: Star, stat: null, color: 'yellow' },
  { href: '/admin/seo', label: 'SEO Optimization', desc: 'Alt text optimization and slug management.', icon: Search, stat: null, color: 'teal' },
];

const COLORS = {
  amber: 'border-amber-300 bg-amber-50 text-amber-700',
  green: 'border-green-300 bg-green-50 text-green-700',
  blue: 'border-blue-300 bg-blue-50 text-blue-700',
  purple: 'border-purple-300 bg-purple-50 text-purple-700',
  indigo: 'border-indigo-300 bg-indigo-50 text-indigo-700',
  orange: 'border-orange-300 bg-orange-50 text-orange-700',
  slate: 'border-slate-300 bg-slate-50 text-slate-700',
  rose: 'border-rose-300 bg-rose-50 text-rose-700',
  yellow: 'border-yellow-300 bg-yellow-50 text-yellow-700',
  teal: 'border-teal-300 bg-teal-50 text-teal-700',
};

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">BBS Flooring — Store Management</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {[
          { label: 'Products', val: stats.products },
          { label: 'Orders', val: stats.orders },
          { label: 'Leads', val: stats.leads },
          { label: 'Bookings', val: stats.bookings },
          { label: 'Quotes', val: stats.quotes },
          { label: 'Blog Posts', val: stats.blogPosts },
          { label: 'Members', val: stats.customers },
        ].map(({ label, val }) => (
          <div key={label} className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <div className="text-2xl font-bold text-slate-800">{val}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {NAV_ITEMS.map(({ href, label, desc, icon: Icon, stat, color }) => (
          <Link
            key={href}
            href={href}
            className="block p-5 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-amber-300 hover:shadow-md transition group"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg border ${COLORS[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-800 group-hover:text-amber-700 transition">{label}</h2>
                  {stat && stats[stat] > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{stats[stat]}</span>
                  )}
                </div>
                <p className="text-slate-500 text-sm mt-0.5">{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
