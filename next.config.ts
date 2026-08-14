import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Only used when DATABASE_URL points at a non-Neon Postgres (local development).
  serverExternalPackages: ["pg"],
};

export default nextConfig;
