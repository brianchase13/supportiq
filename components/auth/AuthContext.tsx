'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/supabase/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    async function fetchAndSetUser() {
      const { data, error } = await supabase.auth.getUser();
      let user: User | null = null;
      if (data?.user) {
        // Fetch user profile from 'users' table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (profile && !profileError) {
          user = profile as User;
        }
      }
      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    }
    fetchAndSetUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      let user: User | null = null;
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile && !profileError) {
          user = profile as User;
        }
      }
      setUser(user);
      setLoading(false);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 