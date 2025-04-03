/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true, // Active la compression Brotli/Gzip
  swcMinify: true, // Active la minification avec SWC
};

export default nextConfig;
