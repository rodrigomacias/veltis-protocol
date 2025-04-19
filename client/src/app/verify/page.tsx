import Header from '@/components/landing/Header'; // Re-use header
import Footer from '@/components/landing/Footer'; // Re-use footer
import VerificationTool from '@/components/verification/VerificationTool';
import { createClient } from '@/lib/supabase/server'; // Needed for header auth state
import { cookies } from 'next/headers';

/**
 * Verification Page Component (Server Component wrapper).
 * Renders the VerificationTool component within the standard page layout.
 */
export default async function VerifyPage() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check initial authentication state for the header
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const isLoggedIn = !!user;

  return (
    <div className="flex min-h-screen flex-col">
       {/* Background */}
       <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-background dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_0px,#3e8ef115,transparent)] dark:bg-[radial-gradient(circle_800px_at_100%_0px,#ffffff05,transparent)]"></div>
      </div>

      <Header isLoggedIn={isLoggedIn} />
      <main className="flex-1 container mx-auto max-w-screen-lg px-4 py-12 md:py-16 lg:py-20">
        <h1 className="text-3xl font-bold mb-8 text-center">Verify Asset Timestamp</h1>
        <VerificationTool />
      </main>
      <Footer />
    </div>
  );
}
