import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  async headers() {
    return [
      {
        // Allow the Expo web dev server to call the API
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin',  value: 'http://localhost:8082' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ]
  },
};

export default nextConfig;
