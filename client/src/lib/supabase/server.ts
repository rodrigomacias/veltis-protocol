import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
// import { Database } from '@/types/supabase';

/**
 * Creates a Supabase client for use in Server Components, Route Handlers, and Server Actions.
 *
 * Uses cookies() from next/headers internally to create the cookie store.
 * Retrieves Supabase URL and Anon Key from environment variables.
 * Throws an error if environment variables are missing.
 *
 * @returns {SupabaseClient<any>} An initialized Supabase client instance configured for server-side use.
 * @throws {Error} If SUPABASE_URL or SUPABASE_ANON_KEY are not defined.
 */
export function createClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  // Use createServerClient for server-side components/actions
  // Add <Database> type annotation when types are generated
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
          console.log('Cookie set error (safe to ignore in Server Components):', error);
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
          console.log('Cookie remove error (safe to ignore in Server Components):', error);
        }
      },
    },
  });
}
