import type { NextConfig } from 'next';

/**
 * BACKTRACK is a static site with no server component: no accounts, no learner
 * records, no API. Exporting it keeps first load small and means the whole thing
 * can be served from a CDN, a school's local cache, or a USB stick — which is
 * the point of designing for low connectivity rather than only talking about it.
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
