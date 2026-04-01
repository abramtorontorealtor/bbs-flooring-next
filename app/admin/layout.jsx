'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

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

  return <>{children}</>;
}
