import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    'Supabase URL or Service Role Key not found in environment variables. Admin client will not be initialized.'
  );
  // Depending on usage, you might throw an error here if the admin client is critical
}

// Initialize Supabase client with service_role key for admin tasks
// Ensure this client is used ONLY in secure backend environments
// and never exposed to the frontend.
export const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          // It's generally recommended to disable auto-refreshing tokens for service roles
          // as they don't expire in the same way user tokens do.
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

if (supabaseAdmin) {
  console.log('[server]: Supabase admin client initialized.');
}
