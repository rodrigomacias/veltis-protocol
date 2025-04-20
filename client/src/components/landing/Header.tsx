'use client'; // Make this a client component

'use client'; // Make this a client component

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
// Removed unused icons: Search, Settings, PlusCircle
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

// TODO: Replace with actual Shadcn Button import if available after adding component
const Button = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)} {...props}>
    {children}
  </button>
);

// Remove HeaderProps interface as isLoggedIn prop is no longer needed
// interface HeaderProps {
//   isLoggedIn: boolean;
// }

const Header: React.FC = () => { // Remove props
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Track initial auth check
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setIsLoadingAuth(false);
    };

    checkAuth(); // Initial check

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, !!session);
      setIsLoggedIn(!!session);
      if (_event === 'SIGNED_OUT') {
        // Optional: Force refresh or redirect if needed after sign out
        router.refresh(); // Refresh server components
      }
    });

    // Cleanup listener on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      // Optionally show an error message to the user
    } else {
      // State change will trigger re-render via onAuthStateChange listener
      // router.push('/'); // Redirect to home after logout
      console.log('Logged out successfully');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center"> {/* Removed justify-between initially */}

        {/* Left side spacer - Adjust as needed or remove if centering logo differently */}
        {/* <div className="flex-1"></div> */}

        {/* Center Logo Removed - Will be added to Hero */}
        {/* <div className="flex justify-center"> ... </div> */}

        {/* Right Nav: Conditional Buttons - Use flex-1 and justify-end */}
        <div className="flex items-center space-x-2">
          {/* Auth Buttons - Render based on client-side state */}
          {isLoadingAuth ? (
            // Show loading indicator
            <div className="h-9 w-32 animate-pulse rounded-md bg-muted"></div>
          ) : isLoggedIn ? (
             <div className="flex items-center gap-2">
                {/* Dashboard Link (No text, maybe icon only or integrated elsewhere?) */}
                <Link href="/dashboard" title="Dashboard">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <LayoutDashboard className="h-4 w-4" />
                    </Button>
                </Link>
                {/* Logout Button */}
                <Button variant="outline" size="icon" className="rounded-full h-9 w-9" onClick={handleLogout} title="Logout">
                    <LogOut className="h-4 w-4" />
                </Button>
                {/* TODO: Add Profile/Settings Dropdown later */}
                {/* <Button variant="outline" size="icon" className="rounded-full h-9 w-9" title="Profile">
                    <User className="h-4 w-4" />
                </Button> */}
             </div>
          ) : (
            <>
              {/* Pre-registry Button/Link */}
               <a href="mailto:info@veltis.io?subject=Veltis%20Protocol%20Interest" target="_blank" rel="noopener noreferrer" title="Register interest via email">
                 <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground h-9 px-3 hidden sm:inline-flex"> {/* Hide on small screens */}
                   Register Interest
                 </Button>
               </a>
               {/* Join Button - Removed */}
              {/* <Button variant="default" className="bg-bio-dark text-white hover:bg-bio-dark/90 h-9 px-4">
                JOIN +
              </Button> */}
              {/* Login Button */}
              <Link href="/login">
                <Button variant="outline" className="rounded-full h-9 px-4">
                  <User className="mr-2 h-4 w-4" /> LOGIN
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// Add Button variants if not using Shadcn Button component yet
Button.defaultProps = { // Removed @ts-ignore
    variant: "default",
    size: "default",
};

export default Header;
