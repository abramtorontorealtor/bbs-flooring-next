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

      // Also get the auth user for email
      const { data: { user: authUser } } = await supabase.auth.getUser();

      setUser({
        ...profile,
        id: userId,
        email: authUser?.email,
        full_name: profile?.full_name || authUser?.user_metadata?.full_name,
        role: profile?.role || 'member',
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
