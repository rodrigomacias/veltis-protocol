import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Veltis Protocol. All rights reserved.
          </p>
          {/* Placeholder Nav */}
          <nav className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
