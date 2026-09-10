import type { NextConfig } from 'next';

/**
 * Static delivery; study history and note extraction run in the browser.
 * Official Khan players and practice retain their own network requirements.
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
