'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { getSupabaseBrowserClient } from './supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setIsLoadingAuth(false);
      return;
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoadingAuth(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoadingAuth(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserProfile(userId) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    try {
      // Get user profile from users table (includes role, full_name, etc.)
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // Also get the auth user for email + confirmation status
      const { data: { user: authUser } } = await supabase.auth.getUser();

      // Auto-sync: if Supabase Auth confirmed the email but users.is_verified
      // is still false, update it. This bridges Supabase's built-in confirmation
      // with the BBS custom verification system so either link works.
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
      // Still set as authenticated even if profile load fails
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
    const supabase = getSupabaseBrowserClient();
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
