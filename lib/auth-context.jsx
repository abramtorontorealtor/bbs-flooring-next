'use client';

import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

// ⚡ Supabase is NOT imported at module level — it's dynamically imported
// inside useEffect so it stays OUT of the initial hydration bundle (~50KB saved).
// This reduces TBT because the browser doesn't parse/eval supabase during hydration.

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const supabaseRef = useRef(null);

  useEffect(() => {
    let subscription;

    // Dynamic import — supabase JS loads AFTER hydration, not during
    import('./supabase').then(({ getSupabaseBrowserClient }) => {
      const supabase = getSupabaseBrowserClient();
      supabaseRef.current = supabase;
      if (!supabase) {
        setIsLoadingAuth(false);
        return;
      }

      // Check initial session — unblock UI immediately from JWT, load profile in background
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // Unblock the UI NOW with minimal user data from the JWT
          const su = session.user;
          setUser({
            id: su.id,
            email: su.email,
            full_name: su.user_metadata?.full_name || '',
            role: su.user_metadata?.role || 'member',
            is_verified: !!su.email_confirmed_at,
          });
          setIsAuthenticated(true);
          setIsLoadingAuth(false);

          // Enrich with full profile in background — no blocking
          enrichUserProfile(supabase, su.id);
        } else {
          setIsLoadingAuth(false);
        }
      }).catch(() => {
        setIsLoadingAuth(false);
      });

      // Listen for auth changes
      const { data } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user) {
            const su = session.user;
            setUser({
              id: su.id,
              email: su.email,
              full_name: su.user_metadata?.full_name || '',
              role: su.user_metadata?.role || 'member',
              is_verified: !!su.email_confirmed_at,
            });
            setIsAuthenticated(true);
            setIsLoadingAuth(false);

            // Enrich in background
            enrichUserProfile(supabase, su.id);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoadingAuth(false);
          }
        }
      );
      subscription = data.subscription;
    }).catch(() => {
      setIsLoadingAuth(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Background profile enrichment — never blocks UI
  async function enrichUserProfile(supabase, userId) {
    try {
      const [{ data: profile }, { data: { user: authUser } }] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.auth.getUser(),
      ]);

      const supabaseConfirmed = !!authUser?.email_confirmed_at;
      const profileVerified = profile?.is_verified === true;

      // Background sync — fire and forget
      if (supabaseConfirmed && !profileVerified && profile?.id) {
        supabase
          .from('users')
          .update({ is_verified: true, verified_at: new Date().toISOString() })
          .eq('id', userId)
          .then(() => {})
          .catch(() => {});
      }

      setUser({
        ...profile,
        id: userId,
        email: authUser?.email || profile?.email,
        full_name: profile?.full_name || authUser?.user_metadata?.full_name,
        role: profile?.role || 'member',
        is_verified: profileVerified || supabaseConfirmed,
      });
    } catch (err) {
      // JWT data is already set — profile enrichment failure is non-critical
      console.warn('Profile enrichment failed (non-blocking):', err);
    }
  }

  async function logout() {
    const supabase = supabaseRef.current;
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsAuthenticated(false);
  }

  function navigateToLogin() {
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      logout,
      navigateToLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
