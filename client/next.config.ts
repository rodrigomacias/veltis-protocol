import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable lightningcss to prevent Linux module loading issues
  experimental: {
    useLightningcss: false,
  },
  // Disable built-in CSS optimization features that might use lightningcss
  webpack: (config) => {
    return config;
  },
  // Add rewrites to proxy API requests to the backend during development
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
};

export default nextConfig;
