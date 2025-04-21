import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    return config;
  },
  // Use correct static export option - not using 'hybrid' as it's not in the type definition
  // Instead we'll use dynamic route configuration to control rendering
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'veltis.vercel.app', '*.vercel.app'],
    },
  },
  // Add rewrites to proxy API requests to the backend during development
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      // In development, use the local backend
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5001/api/:path*',
        },
      ];
    } else {
      // In production, use the production API (handled by Vercel config)
      return [];
    }
  }
};

export default nextConfig;
