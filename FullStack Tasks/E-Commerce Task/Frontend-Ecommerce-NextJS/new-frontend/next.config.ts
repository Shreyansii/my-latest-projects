import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost"], //  allows images from http://localhost:8000
  },
};

export default nextConfig;
