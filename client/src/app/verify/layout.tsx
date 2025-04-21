import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Verification layout with authentication protection
 * All routes inside this layout (/verify/*) will be protected and require authentication
 */
export default async function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get a supabase client configured to use cookies
  const supabase = createClient();

  // Get the user's session
  const { data: { session }, error } = await supabase.auth.getSession();

  // Handle errors (optional but recommended)
  if (error) {
    console.error("Error getting session:", error.message);
    // Redirect to login page with error message
    redirect('/login?error=session_error');
  }

  // If no session exists, the user is not logged in, redirect to login page
  if (!session) {
    console.log("No session found, redirecting to login.");
    redirect('/login');
  }

  // If the session exists, continue and render the verification layout
  return <>{children}</>;
}
