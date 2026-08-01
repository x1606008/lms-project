import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.RENDER ? "standalone" : undefined,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
