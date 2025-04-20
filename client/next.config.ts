import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Set static export to bypass Vercel's build process issues
  output: 'export',
  // Disable lightningcss to prevent Linux module loading issues
  experimental: {
    useLightningcss: false,
  },
  // Disable built-in CSS optimization features that might use lightningcss
  webpack: (config) => {
    return config;
  },
  // NOTE: Rewrites are disabled in static export mode
  // If you remove 'output: export', uncomment this section
  /*
  async rewrites() {
    // Ensure the backend URL is correctly read from the environment variable
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'; // Default if not set
    return [
      {
        // Proxy requests starting with /api/ to the backend server
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
  */
};

export default nextConfig;
