'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/auth';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  role?: string;
  intercom_connected?: boolean;
  subscription_status?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    // Lazy initialization to avoid build-time errors
    if (typeof window !== 'undefined') {
      setSupabase(createClient());
    }
  }, []);

  const createUserProfile = useCallback(async (userId: string) => {
    if (!supabase) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        setError(error.message);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error in createUserProfile:', err);
      setError('Failed to create user profile');
    }
  }, [supabase]);

  const loadUserProfile = useCallback(async (userId: string) => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        // Create profile if it doesn't exist
        if (error.code === 'PGRST116') {
          await createUserProfile(userId);
        } else {
          setError(error.message);
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error in loadUserProfile:', err);
      setError('Failed to load user profile');
    }
  }, [supabase, createUserProfile]);

  useEffect(() => {
    if (!supabase) return;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setError(error.message);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await loadUserProfile(session.user.id);
          }
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err);
        setError('Failed to load user session');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, loadUserProfile]);

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !supabase) {
      setError('No user logged in or Supabase not initialized');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        setError(error.message);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error in updateProfile:', err);
      setError('Failed to update profile');
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        setError(error.message);
      } else {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
    } catch (err) {
      console.error('Error in signOut:', err);
      setError('Failed to sign out');
    }
  };

  const value: UserContextType = {
    user,
    profile,
    session,
    loading,
    error,
    refreshProfile,
    updateProfile,
    signOut
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Hook for components that need user but can handle loading state
export function useUserOptional() {
  const context = useContext(UserContext);
  return context;
}

// Hook for protected routes that require authentication
export function useRequireAuth() {
  const { user, loading } = useUser();
  
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth';
    }
  }, [user, loading]);

  return { user, loading };
} 