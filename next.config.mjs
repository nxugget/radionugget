/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true, // Active la compression Brotli/Gzip
  
  // ⚡ Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  productionBrowserSourceMaps: false, // Reduce bundle size
  
  experimental: {
    // Enable optimizations
    optimizePackageImports: [
      "d3",
      "leaflet",
      "react-icons",
      "react-leaflet",
    ],
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Optimize images aggressively
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
