import { Suspense } from 'react';
import AccountDashboardClient from '@/components/AccountDashboardClient';

export const metadata = {
  title: 'My Account',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AccountDashboardClient />
    </Suspense>
  );
}
