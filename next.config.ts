import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow server-side fetches to ip-api.com (used in network-info API route)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
  // Silence the ip-api http warning (it's intentional for server-side use only)
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
