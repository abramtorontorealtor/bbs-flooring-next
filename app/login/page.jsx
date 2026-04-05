import { Suspense } from 'react';
import LoginClient from '@/components/LoginClient';

export const metadata = {
  title: 'Login',
  description: 'Sign in to your BBS Flooring account to access member pricing, saved quotes, and order history.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}
