import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import VerificationTool from '@/components/verification/VerificationTool';
// Removed unused imports: createClient, cookies

/**
 * Verification Page Component (Server Component wrapper).
 * Renders the VerificationTool component within the standard page layout.
 */
export default async function VerifyPage() {
    // Removed unused cookieStore and supabase client creation
    // const cookieStore = await cookies();
    // const _supabase = createClient(cookieStore);

    // Auth state is handled by Header client component now

  return (
    <div className="flex min-h-screen flex-col">
       {/* Background */}
       <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-background dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_0px,#3e8ef115,transparent)] dark:bg-[radial-gradient(circle_800px_at_100%_0px,#ffffff05,transparent)]"></div>
      </div>

      <Header />
      <main className="flex-1 container mx-auto max-w-screen-lg px-4 py-12 md:py-16 lg:py-20">
        <h1 className="text-3xl font-bold mb-8 text-center">Verify Asset Timestamp</h1>
        <VerificationTool />
      </main>
      <Footer />
    </div>
  );
}
