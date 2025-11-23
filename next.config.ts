import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // If you ever want to deploy as a Docker container or use Vercel/standalone
  // output: 'standalone',  
  // You can add future options here as needed, such as images or experimental flags.
};

export default nextConfig;
