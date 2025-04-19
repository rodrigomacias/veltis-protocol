import React from 'react';
import Link from 'next/link'; // Import Link
import { ArrowRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button'; // Assuming Shadcn Button component exists

// TODO: Replace with actual Shadcn Button import if available after adding component
const Button = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)} {...props}>
      {children}
    </button>
  );
// @ts-ignore
Button.defaultProps = { variant: "default", size: "default" };


interface FeatureCardProps {
  title: string;
  description?: string; // Optional description text
  imageUrl?: string; // Optional image URL (placeholder for now)
  imageAlt?: string;
  infoLinkText?: string;
  infoLinkHref?: string;
  ctaText?: string;
  ctaHref?: string;
  tags?: string[];
  className?: string;
  children?: React.ReactNode; // Allow passing custom content
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  imageUrl,
  imageAlt = "Feature image",
  infoLinkText,
  infoLinkHref = "#",
  ctaText = "Start now",
  ctaHref = "#",
  tags,
  className,
  children
}) => {
  return (
    <div className={cn("bio-card flex flex-col md:flex-row gap-6 overflow-hidden", className)}> {/* Use custom class */}
      {/* Content Area */}
      <div className="flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
          {infoLinkText && (
            <Link href={infoLinkHref} className="text-sm text-primary hover:underline flex items-center gap-1 mb-4">
              <Info className="h-4 w-4" /> {infoLinkText}
            </Link>
          )}
          {/* Allow embedding custom children like the file uploader */}
          {children}
        </div>
        {/* CTA Button */}
        <Button variant="outline" className="bio-button group mt-4 self-start"> {/* Use custom class */}
          {ctaText}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Image Area (Optional) */}
      {imageUrl && (
        <div className="md:w-2/5 flex-shrink-0">
          {/* Placeholder for image */}
          <div className="aspect-square w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center">
             <span className="text-muted-foreground text-sm">{imageAlt}</span>
          </div>
        </div>
      )}

      {/* Tags (Optional, could be positioned differently) */}
      {tags && tags.length > 0 && (
        <div className="absolute bottom-4 right-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="bio-pill"> {/* Use custom class */}
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeatureCard;
