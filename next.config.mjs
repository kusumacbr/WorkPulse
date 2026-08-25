/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent static prerendering of authenticated pages
  experimental: {
    // Allow server actions
  },
  eslint: {
    // Don't fail build on lint warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type checking done separately via tsc
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
