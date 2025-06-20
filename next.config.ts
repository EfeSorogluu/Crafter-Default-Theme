import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http", // Change to http to match the image source
        hostname: "localhost",
        port: "8000",
        pathname: "/images/**", // Adjust pathname to include /images/
      },
      // If you also have images under /uploads/, you can add another pattern
      {
        protocol: "http", // Or http, depending on your backend setup
        hostname: "localhost",
        port: "8000",
        pathname: "/uploads/**",
      },
      {
        hostname: "api.crafter.net.tr",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;