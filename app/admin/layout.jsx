'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Loader2, LayoutDashboard, ShoppingCart, BarChart3, Calendar, FileText,
  Users, Package, Wrench, MessageSquare, Star, Search, ArrowLeft } from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/crm', label: 'CRM', icon: BarChart3 },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/quotes', label: 'Quotes', icon: FileText },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/variants', label: 'Variants', icon: Wrench },
  { href: '/admin/blog', label: 'Blog', icon: MessageSquare },
  { href: '/admin/product-enrichment', label: 'Enrichment', icon: Star },
  { href: '/admin/seo', label: 'SEO', icon: Search },
];

export default function AdminLayout({ children }) {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoadingAuth && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isLoadingAuth, isAuthenticated, user, router]);

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-amber-600" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-slate-200 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-amber-600 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? 'bg-amber-50 text-amber-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-100 text-xs text-slate-400">
          Logged in as {user?.email?.split('@')[0] || 'admin'}
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-3 overflow-x-auto">
        <Link href="/" className="shrink-0 text-slate-400 hover:text-amber-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        {NAV.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`whitespace-nowrap px-2.5 py-1.5 rounded-full text-xs font-medium transition ${
                active ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 lg:pt-0 pt-12">
        {children}
      </main>
    </div>
  );
}
