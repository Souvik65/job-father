import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Forced restart to load new Prisma Client
  allowedDevOrigins: ['10.52.111.223'],
};

export default nextConfig;
