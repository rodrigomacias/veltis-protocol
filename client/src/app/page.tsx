// Mark this page as statically generated for better performance
export const dynamic = 'force-static';

// Removed unused imports: createClient, cookies
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
// import TokenizationSection from '@/components/landing/TokenizationSection'; // Removed
import Footer from '@/components/landing/Footer';
import { UploadCloud, FileSignature, ShieldCheck } from 'lucide-react'; // Import icons for illustrations

// Placeholder components for new sections with text content
const HowItWorksSection = () => (
  <section className="container mx-auto py-16 px-4 text-center">
    <h2 className="text-3xl font-bold mb-12">How Veltis Works</h2> {/* Increased margin */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Step 1 */}
      <div className="p-6 border rounded-lg bg-card flex flex-col items-center"> {/* Center content */}
        <UploadCloud className="w-12 h-12 mb-4 text-primary" /> {/* Icon */}
        <h3 className="text-xl font-semibold mb-2">1. Upload Your Asset</h3>
        <p className="text-muted-foreground">Securely upload your research file, IP disclosure, dataset, or any critical document.</p>
      </div>
      {/* Step 2 */}
      <div className="p-6 border rounded-lg bg-card flex flex-col items-center"> {/* Center content */}
         <FileSignature className="w-12 h-12 mb-4 text-primary" /> {/* Icon */}
        <h3 className="text-xl font-semibold mb-2">2. Mint Your IPNFT</h3>
        <p className="text-muted-foreground">Connect your wallet and mint a unique Non-Fungible Token (IPNFT) representing your asset on the Polygon blockchain.</p>
      </div>
      {/* Step 3 */}
      <div className="p-6 border rounded-lg bg-card flex flex-col items-center"> {/* Center content */}
         <ShieldCheck className="w-12 h-12 mb-4 text-primary" /> {/* Icon */}
        <h3 className="text-xl font-semibold mb-2">3. Manage & Verify</h3>
        <p className="text-muted-foreground">Access your immutable proof-of-existence record anytime. Verify authenticity and manage your IP assets securely.</p>
      </div>
    </div>
  </section>
);

const BenefitsSection = () => (
 <section className="bg-muted/50 dark:bg-muted/20 py-16">
    <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Secure Your Innovation Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-semibold mb-3">Problems Solved</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Proof of Priority:</strong> Eliminate disputes over invention timing with immutable blockchain timestamps.</li>
                    <li><strong>Data Integrity:</strong> Ensure your research data hasn&apos;t been tampered with using cryptographic hashes linked to your IPNFT.</li> {/* Fixed apostrophe */}
                    <li><strong>Simplified Disclosure:</strong> Streamline the process of documenting and proving the existence of IP for patents or partnerships.</li>
                    <li><strong>Lack of Trust:</strong> Build confidence with collaborators, investors, or TTOs by providing verifiable proof of your work.</li>
                    <li><strong>Asset Management:</strong> Centralize and manage your critical R&D documentation securely.</li>
                </ul>
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-3">Benefits & Outcomes</h3>
                 <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Enhanced IP Protection:</strong> Secure early-stage proof before formal patenting.</li>
                    <li><strong>Increased Trust & Transparency:</strong> Provide undeniable proof of your asset&apos;s existence and integrity.</li> {/* Fixed apostrophe */}
                    <li><strong>Streamlined Collaboration:</strong> Share verifiable proof with partners confidently.</li>
                    <li><strong>Improved Due Diligence:</strong> Simplify the verification process for investors or acquirers.</li>
                    <li><strong>Global Accessibility:</strong> Secure and manage your assets from anywhere on the Polygon network.</li>
                </ul>
            </div>
        </div>
    </div>
 </section>
);

/**
 * Veltis Protocol Landing Page (Server Component).
 * Assembles the landing page sections. Header and TokenizationSection are now client components handling auth state.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Background decorative elements - simple gradient for now */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-background dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3e8ef120,transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,#ffffff08,transparent)]"></div>
      </div>

      <Header />
      <main className="flex-1">
        <HeroSection />
        {/* Add New Sections */}
        <HowItWorksSection />
        <BenefitsSection />
        {/* TokenizationSection removed */}
      </main>
      <Footer />
    </div>
  );
}
