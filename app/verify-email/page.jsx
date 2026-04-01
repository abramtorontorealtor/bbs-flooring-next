import { Suspense } from 'react';
import VerifyEmailClient from '@/components/VerifyEmailClient';

export const metadata = {
  title: 'Verifying Email — BBS Flooring',
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-slate-600">Loading...</div></div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
