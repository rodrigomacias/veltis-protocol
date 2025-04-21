import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for use in Server Components, Route Handlers, and Server Actions.
 * 
 * This function works with the latest Next.js App Router patterns and handles cookies properly.
 * 
 * @returns A Supabase client configured for server-side use
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  
  // Use the proper pattern for Next.js 15
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Don't persist the session in localStorage
      autoRefreshToken: false, // Don't auto refresh the token
      detectSessionInUrl: false, // Don't detect the session in URL (handled by callback)
    },
  });
}
