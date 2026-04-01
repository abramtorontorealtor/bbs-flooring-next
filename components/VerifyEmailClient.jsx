'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please check your email link.');
      return;
    }

    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then(async (res) => {
        if (res.success) {
          // Auto-sign-in with magic link token if available
          let didSignIn = false;
          if (res.tokenHash) {
            try {
              const supabase = getSupabaseBrowserClient();
              if (supabase) {
                const { error: otpError } = await supabase.auth.verifyOtp({
                  token_hash: res.tokenHash,
                  type: 'magiclink',
                });
                if (!otpError) didSignIn = true;
              }
            } catch (e) {
              console.warn('[Verify] Auto sign-in failed:', e);
            }
          }
          setSignedIn(didSignIn);
          setStatus('success');
          
          // If signed in and there's a return URL, redirect after a brief delay
          if (didSignIn) {
            const returnUrl = typeof window !== 'undefined' && localStorage.getItem('bbs_return_url');
            if (returnUrl) {
              localStorage.removeItem('bbs_return_url');
              setTimeout(() => { window.location.href = returnUrl; }, 2000);
            }
          }
          // Send welcome email
          if (res.userEmail) {
            fetch('/api/auth/welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: res.userId,
                userEmail: res.userEmail,
                userName: res.userName || '',
              }),
            }).catch(() => {});
          }
        } else {
          const errMsg = res.error || 'Verification failed.';
          setStatus(errMsg.includes('expired') ? 'expired' : 'error');
          setMessage(errMsg);
        }
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'An unexpected error occurred.');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-14 h-14 text-amber-500 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Verifying your email…</h1>
            <p className="text-slate-500">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">You&apos;re verified!</h1>
            {signedIn ? (
              <>
                <p className="text-slate-600 mb-8">
                  Your member account is now active. You&apos;re signed in and ready to shop
                  with exclusive member pricing.
                </p>
                <Link href={createPageUrl('Products')}>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white w-full py-6 text-base">
                    Shop Member Pricing →
                  </Button>
                </Link>
                <Link href="/account" className="block mt-4 text-sm text-slate-500 hover:text-amber-600">
                  Go to My Account
                </Link>
              </>
            ) : (
              <>
                <p className="text-slate-600 mb-8">
                  Your member account is now active. Sign in to access exclusive trade
                  pricing across our full catalogue.
                </p>
                <Link href="/login">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white w-full py-6 text-base">
                    Sign In to Shop Member Pricing
                  </Button>
                </Link>
              </>
            )}
          </>
        )}

        {(status === 'error' || status === 'expired') && (
          <>
            <XCircle className="w-14 h-14 text-red-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              {status === 'expired' ? 'Link Expired' : 'Verification Failed'}
            </h1>
            <p className="text-slate-600 mb-8">
              {message || 'This verification link is invalid or has already been used.'}
            </p>
            <Link href={createPageUrl('AccountDashboard')}>
              <Button variant="outline" className="w-full">
                Go to My Account to Resend
              </Button>
            </Link>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-sm text-slate-400">
          Questions? Call us at{' '}
          <a href="tel:6474281111" className="text-amber-600 font-medium">
            (647) 428-1111
          </a>
        </div>
      </div>
    </div>
  );
}
