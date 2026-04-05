import { Suspense } from 'react';
import ResetPasswordClient from '@/components/ResetPasswordClient';

export const metadata = {
  title: 'Reset Password',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordClient />
    </Suspense>
  );
}
