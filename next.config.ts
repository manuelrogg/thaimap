import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limit referrer info sent to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features the app doesn't use
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js App Router requires 'unsafe-inline' for hydration bootstrap script
      "script-src 'self' 'unsafe-inline'",
      // MapLibre applies inline styles on the map canvas
      "style-src 'self' 'unsafe-inline'",
      // Tile images from Carto CDN; data: and blob: used by MapLibre internally
      "img-src 'self' data: blob: *.basemaps.cartocdn.com",
      // MapLibre fetches tiles via fetch() — needs connect-src, not just img-src
      "connect-src 'self' *.basemaps.cartocdn.com",
      // MapLibre spawns a Web Worker via blob: URL
      "worker-src blob:",
      "child-src blob:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
