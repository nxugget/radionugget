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

  // Image optimization — reduce Vercel usage
  images: {
    // Only generate WebP (skip AVIF → halves transformations)
    formats: ["image/webp"],
    // Only allow remote optimization for satellite DB images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "db-satnogs.freetls.fastly.net",
        pathname: "/media/**",
      },
    ],
    // Fewer size variants = fewer transformations & cache writes
    deviceSizes: [640, 1080, 1920],
    imageSizes: [96, 256, 384],
    // Cache transformed images for 1 year (images never change)
    minimumCacheTTL: 60 * 60 * 24 * 365,
    // Only allow q75 (single quality = fewer variants)
    qualities: [75],
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
