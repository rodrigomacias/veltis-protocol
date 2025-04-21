import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    return config;
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
