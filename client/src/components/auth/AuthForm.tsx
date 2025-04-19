'use client'; // This component interacts with browser APIs (Supabase client)

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabase/client'; // Use the client-side utility
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';

/**
 * Renders a Supabase Auth UI component for login/registration.
 *
 * It initializes the Supabase client on the client-side and displays
 * the Auth component. It also listens for authentication state changes
 * to potentially show user information or redirect.
 *
 * @returns {JSX.Element} The authentication form component.
 */
export default function AuthForm() {
  const supabase = createClient(); // Initialize client-side Supabase client
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check initial session state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes (login, logout, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Optional: Add redirect logic here based on event or session status
      // e.g., if (session) router.push('/dashboard');
    });

    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, [supabase]); // Re-run effect if supabase client instance changes (shouldn't normally)

  // If session exists, maybe show user info or a logout button instead
  if (session) {
    return (
      <div>
        <p>Logged in as: {session.user.email}</p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // Show the Supabase Auth UI if no session
  return (
    <div className="w-full max-w-md rounded-lg border p-6 shadow-md">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="dark" // Or "light" or remove for default
        providers={['google', 'github']} // Optional: Add social providers
        redirectTo={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`} // Optional: For OAuth redirects
        showLinks={true} // Show links for password reset, etc.
        view="sign_in" // Can be 'sign_in', 'sign_up', 'forgotten_password', etc.
      />
    </div>
  );
}
