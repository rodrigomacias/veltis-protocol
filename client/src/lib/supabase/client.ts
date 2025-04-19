import { createBrowserClient } from '@supabase/ssr';
// import { Database } from '@/types/supabase'; // Assuming types will be generated later - uncomment when types are generated

/**
 * Creates a Supabase client for use in Browser/Client Components.
 *
 * Retrieves Supabase URL and Anon Key from environment variables.
 * Throws an error if environment variables are missing.
 *
 * @returns {SupabaseClient<Database>} An initialized Supabase client instance.
 * @throws {Error} If SUPABASE_URL or SUPABASE_ANON_KEY are not defined.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  // Use createBrowserClient for client-side components
  // Add <Database> type annotation when types are generated
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
