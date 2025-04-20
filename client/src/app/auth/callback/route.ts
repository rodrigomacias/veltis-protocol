import { createClient } from '@/lib/supabase/server'; // Use server client
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Route Handler for Supabase Auth Callback.
 * Exchanges the authorization code received from Supabase for a user session.
 * Redirects the user to the dashboard or an error page upon completion.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} A response object redirecting the user.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin; // Get the origin for redirection

  if (code) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Auth Callback Error (exchangeCodeForSession):', error.message);
        // Redirect to an error page or login page with an error message
        return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
      }
    } catch (catchError: unknown) { // Type as unknown
        // Check if it's an Error instance before accessing message
        const errorMessage = catchError instanceof Error ? catchError.message : String(catchError);
        console.error('Auth Callback Exception:', errorMessage);
        return NextResponse.redirect(`${origin}/login?error=Server error during authentication`);
    }
  } else {
     console.warn('Auth Callback: No code found in request URL.');
     // Redirect if no code is present (might happen if user visits directly)
     return NextResponse.redirect(`${origin}/login?error=Authentication code missing`);
  }

  // Redirect to the dashboard upon successful session exchange
  // Or redirect to a specific page based on user role, etc.
  console.log('Auth Callback: Successfully exchanged code for session. Redirecting to dashboard.');
  return NextResponse.redirect(`${origin}/dashboard`);
}
