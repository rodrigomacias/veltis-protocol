'use client'; // Needs client hooks if we add interactions later

import Link from 'next/link';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

// TODO: Replace with actual Shadcn Button import if available after adding component
const Button = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)} {...props}>
      {children}
    </button>
  );
Button.defaultProps = { variant: "default", size: "default" }; // Removed @ts-ignore


const HeroSection: React.FC = () => {
  return (
    // Section with fixed background image and overlay
    <section
        className="relative flex items-center justify-center h-[80vh] min-h-[500px] text-center text-white px-4" // Adjust height as needed
        style={{
            backgroundImage: `url('/images/43675.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed', // Parallax effect
        }}
    >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60 z-0"></div>

        {/* Content container */}
        <div className="relative z-10 flex flex-col items-center space-y-6">
            {/* Logo Text */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-semibold lowercase tracking-tight font-red-hat"> {/* Ensure font-red-hat is present */}
                veltis
            </h1>

            {/* Taglines */}
            <p className="text-xl font-medium sm:text-2xl md:text-3xl uppercase tracking-wide">
                Tokenize your Intellectual Property on the Blockchain
            </p>
            <p className="text-lg text-gray-300 sm:text-xl">
                Innovation Launchpad for Science and Technology
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                {/* TODO: Link Create Account to signup flow */}
                <Link href="/login">
                    <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
                        Create an Account
                    </Button>
                </Link>
                <Link href="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3 border-white text-white hover:bg-white/10">
                        <User className="mr-2 h-4 w-4" /> Login
                    </Button>
                </Link>
            </div>
        </div>
    </section>
  );
};

export default HeroSection;
