import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Turbopack configuration for Next.js 16.1.1
  // Turbopack is the default bundler in Next.js 16+
  turbopack: {},

  // Optimize image loading
  images: {
    unoptimized: true, // Disable Next.js image optimization for faster builds
  },

  // Safe experimental features (avoid deprecated ones)
  experimental: {
    // Add any valid experimental features here if needed
  },
};

export default nextConfig;
