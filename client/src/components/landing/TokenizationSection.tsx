'use client'; // Make this a client component

import React, { useState, useEffect } from 'react'; // Import hooks
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client'; // Import client-side Supabase client
import FeatureCard from './FeatureCard';
import FileUploadComponent from '../upload/FileUploadComponent'; // Import the actual component
// import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// TODO: Replace with actual Shadcn Button import if available after adding component
const Button = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)} {...props}>
      {children}
    </button>
  );
// @ts-ignore
Button.defaultProps = { variant: "default", size: "default" };


// Remove placeholder component definition
// Remove TokenizationSectionProps interface
// interface TokenizationSectionProps {
//   isLoggedIn: boolean;
// }

const TokenizationSection: React.FC = () => { // Remove props
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setIsLoadingAuth(false);
    };

    checkAuth(); // Initial check

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    // Cleanup listener on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <section className="container mx-auto max-w-screen-xl px-4 py-16">
       {/* Mimic the grid layout from the reference image */}
       <div className="grid grid-cols-1 gap-6 md:grid-cols-5">

         {/* Left Card Placeholder (like CRISPR card) */}
         <FeatureCard
            title="Secure Your Discoveries"
            description="Generate immutable, verifiable proof of existence for your research data, IP disclosures, and critical documents using blockchain technology."
            infoLinkText="Learn about IP-NFTs"
            infoLinkHref="/learn-more" // Placeholder link
            ctaText="Explore Features"
            ctaHref="/features" // Placeholder link
            className="md:col-span-3"
            // imageUrl="/placeholder-crispr.png" // Placeholder image path
            imageAlt="Abstract representation of data security"
         />

        {/* Right Card: Conditional Content */}
        <div className="md:col-span-2">
            {isLoadingAuth ? (
                // Optional: Show a loading skeleton/placeholder while checking auth
                <div className="h-full w-full animate-pulse rounded-lg bg-muted p-6">
                    <div className="h-6 w-3/4 rounded bg-muted-foreground/20 mb-4"></div>
                    <div className="h-4 w-full rounded bg-muted-foreground/20 mb-2"></div>
                    <div className="h-4 w-5/6 rounded bg-muted-foreground/20"></div>
                </div>
            ) : isLoggedIn ? (
                // If logged in, show the File Upload component within the card
                 <FeatureCard title="Timestamp Your Asset" className="h-full flex flex-col"> {/* Adjust card layout */}
                    <div className="flex-grow"> {/* Allow upload component to fill space */}
                        <FileUploadComponent />
                    </div>
                 </FeatureCard>
            ) : (
                // If logged out, show a prompt to login/join
                <FeatureCard
                    title="Get Started"
                    description="Join Veltis Protocol today to secure and manage your R&D assets with confidence."
                    ctaText="Join / Login"
                    ctaHref="/login"
                    className="h-full"
                    // imageUrl="/placeholder-join.png" // Placeholder image path
                    imageAlt="Abstract representation of joining"
                />
            )}
         </div>
       </div>
    </section>
  );
};

export default TokenizationSection;
