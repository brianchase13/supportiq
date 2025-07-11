import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

// Marc Lou's pattern: Simple client-side Supabase
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Default client export (for existing code)
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// For server-side operations with elevated permissions
export const supabaseAdmin = createSupabaseClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-service-key'
);