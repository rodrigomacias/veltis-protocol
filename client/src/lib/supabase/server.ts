import { type CookieOptions, createServerClient } from '@supabase/ssr';
// Removed unused import: type cookies
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
// import { Database } from '@/types/supabase';

/**
 * Creates a Supabase client for use in Server Components, Route Handlers, and Server Actions.
 *
 * Requires the cookie store from `next/headers` to be passed in.
 * Retrieves Supabase URL and Anon Key from environment variables.
 * Throws an error if environment variables are missing.
 *
 * @param {ReturnType<typeof cookies>} cookieStore - The cookie store obtained from `next/headers`.
 * @returns {SupabaseClient<any>} An initialized Supabase client instance configured for server-side use.
 * @throws {Error} If SUPABASE_URL or SUPABASE_ANON_KEY are not defined.
 */
// Use the specific type from next/headers
export function createClient(cookieStore: ReadonlyRequestCookies) { // Keep specific type
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
            cookieStore.set({ name, value, ...options })
          } catch { // Removed unused variable
            // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch { // Removed unused variable
            // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
