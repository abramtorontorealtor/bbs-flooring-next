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

      // Check initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          loadUserProfile(supabase, session.user.id);
        } else {
          setIsLoadingAuth(false);
        }
      });

      // Listen for auth changes
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            await loadUserProfile(supabase, session.user.id);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoadingAuth(false);
          }
        }
      );
      subscription = data.subscription;
    });

    return () => subscription?.unsubscribe();
  }, []);

  async function loadUserProfile(supabase, userId) {
    if (!supabase) return;

    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: { user: authUser } } = await supabase.auth.getUser();

      const supabaseConfirmed = !!authUser?.email_confirmed_at;
      const profileVerified = profile?.is_verified === true;

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
        email: authUser?.email,
        full_name: profile?.full_name || authUser?.user_metadata?.full_name,
        role: profile?.role || 'member',
        is_verified: profileVerified || supabaseConfirmed,
      });
      setIsAuthenticated(true);
    } catch (err) {
      console.warn('Failed to load user profile:', err);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser({
        id: userId,
        email: authUser?.email,
        role: 'member',
        is_verified: !!authUser?.email_confirmed_at,
      });
      setIsAuthenticated(true);
    } finally {
      setIsLoadingAuth(false);
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
