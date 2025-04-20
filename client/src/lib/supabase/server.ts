import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { type cookies } from 'next/headers'; // Import the cookies function type
// import { Database } from '@/types/supabase'; // Assuming types will be generated later - uncomment when types are generated

/**
 * Creates a Supabase client for use in Server Components, Route Handlers, and Server Actions.
 *
 * Requires the cookie store from `next/headers` to be passed in.
 * Retrieves Supabase URL and Anon Key from environment variables.
 * Throws an error if environment variables are missing.
 *
 * @param {any} cookieStore - The cookie store obtained from `next/headers`. Using 'any' to bypass type inference issues.
 * @returns {SupabaseClient<Database>} An initialized Supabase client instance configured for server-side use.
 * @throws {Error} If SUPABASE_URL or SUPABASE_ANON_KEY are not defined.
 */
export function createClient(cookieStore: any) { // Changed type to any
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
          } catch (_error) { // Prefix unused variable with underscore
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
        }
      },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (_error) { // Prefix unused variable with underscore
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
        }
      },
    },
  });
}
