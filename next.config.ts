import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "higmmlclhiphphnvjzeq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  env: {
    DAILY_API_URL: process.env.DAILY_API_URL,
  },
};

export default nextConfig;
