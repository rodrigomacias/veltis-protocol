'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter
import { LayoutDashboard, Settings, User, Wallet, FolderKanban, BarChart3, PlusSquare, LogOut } from 'lucide-react'; // Added LogOut
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client'; // Import supabase client

// TODO: Replace with actual Shadcn Button import if available
const Button = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)} {...props}>
      {children}
    </button>
  );
// @ts-ignore
Button.defaultProps = { variant: "ghost", size: "default" };

// Define a type for navigation items
type NavItem = {
    href: string;
    label: string;
    icon: React.ElementType; // Use ElementType for component icons
};

// Define navigation items with sections using the NavItem type
const mainNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Portfolio', icon: FolderKanban }, // Renamed Overview to Portfolio, points to /dashboard
  { href: '/dashboard/create', label: 'Create IPNFT', icon: PlusSquare }, // Added Create link
  // { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 }, // Placeholder
];

const accountNavItems: NavItem[] = [
  // { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet }, // Placeholder
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  // { href: '/dashboard/history', label: 'History', icon: History }, // Placeholder // Need to import History icon if used
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter(); // Initialize router
  const supabase = createClient(); // Initialize supabase client

  // Logout handler function
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      // Optionally show an error message to the user
    } else {
      // Redirect to home after logout
      router.push('/');
      router.refresh(); // Refresh server components state
      console.log('Logged out successfully from sidebar');
    }
  };

  // Helper function to render nav links, using the NavItem type
  const renderNavLinks = (items: NavItem[]) => {
    return items.map((item) => (
      <Link key={item.href} href={item.href}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-left h-10 px-3",
            pathname === item.href
              ? "bg-muted text-primary hover:bg-muted" // Active style
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground" // Default style
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Button>
      </Link>
    ));
  };


  return (
    <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 border-r border-border/40 bg-background p-4">
      {/* Veltis Logo/Brand */}
      <div className="mb-6 p-4 font-semibold text-xl text-center font-red-hat lowercase">veltis</div>

      {/* Main Navigation */}
      <nav className="flex flex-col space-y-1 flex-grow"> {/* Added flex-grow here */}
        {renderNavLinks(mainNavItems)}

         {/* Account Section - Integrated into main nav scrolling area */}
         <div className="mt-6">
            <h3 className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Account</h3>
            <nav className="flex flex-col space-y-1">
                {renderNavLinks(accountNavItems)}
            </nav>
         </div>
         {/* Removed duplicate Account section */}
      </nav>


      {/* Bottom Section (e.g., Logout, Theme Toggle) - Kept separate */}
      <div className="mt-auto border-t border-border/40 pt-4">
         {/* TODO: Add Light/Dark mode toggle */}
         {/* Logout Button */}
         <Button
            variant="ghost"
            className="w-full justify-start text-left h-10 px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
