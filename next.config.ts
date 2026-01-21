import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { 
        protocol: "https", 
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      { 
        protocol: "https", 
        hostname: "*.firebasestorage.app",
        pathname: "/**",
      },
    ],
    // Permitir imágenes sin optimizar si es necesario
    unoptimized: false,
  },
};

export default nextConfig;
