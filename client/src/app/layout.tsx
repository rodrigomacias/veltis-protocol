import type { Metadata } from "next";
// Re-add Red_Hat_Display import
import { Geist, Geist_Mono, Red_Hat_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Re-add Red Hat Display configuration
const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'], // Specify weights if needed
  display: 'swap', // Font display strategy
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add suppressHydrationWarning if needed due to theme/class changes
    <html lang="en" suppressHydrationWarning>
      <body
        // Combine font variables using cn utility
        // Re-add font variables to className
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable,
          geistMono.variable,
          redHatDisplay.variable // Add Red Hat Display variable back
        )}
      >
        {children}
      </body>
    </html>
  );
}
