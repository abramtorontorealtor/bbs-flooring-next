import { Suspense } from 'react';
import ForgotPasswordClient from '@/components/ForgotPasswordClient';

export const metadata = {
  title: 'Reset Password — BBS Flooring',
  description: 'Reset your BBS Flooring account password.',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ForgotPasswordClient />
    </Suspense>
  );
}
