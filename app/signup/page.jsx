import { Suspense } from 'react';
import SignupClient from '@/components/SignupClient';

export const metadata = {
  title: 'Create Account',
  description: 'Create a BBS Flooring account to unlock member pricing, save quotes, and track your orders.',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignupClient />
    </Suspense>
  );
}
