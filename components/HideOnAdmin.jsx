'use client';
import { usePathname } from 'next/navigation';

/** Wraps server-rendered chrome (footer) so it stays out of /admin/*. Children are still server components. */
export default function HideOnAdmin({ children }) {
  const pathname = usePathname();
  if (pathname === '/admin' || pathname?.startsWith('/admin/')) return null;
  return children;
}
