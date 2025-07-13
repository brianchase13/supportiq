import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'

// Browser client for client-side operations
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server client for server-side operations
export const createServerSupabaseClient = (cookieStore: any) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// Auth helper functions
export const auth = {
  getUser: async () => {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },
  
  signIn: async (email: string, password: string) => {
    const supabase = createClient()
    return await supabase.auth.signInWithPassword({ email, password })
  },
  
  signUp: async (email: string, password: string) => {
    const supabase = createClient()
    return await supabase.auth.signUp({ email, password })
  },
  
  signOut: async () => {
    const supabase = createClient()
    return await supabase.auth.signOut()
  }
}

export type User = {
  id: string
  email?: string
  user_metadata?: any
}