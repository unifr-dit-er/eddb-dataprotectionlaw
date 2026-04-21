import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/dataprotectionlaw',
  images: { unoptimized: true },
};

export default nextConfig;
