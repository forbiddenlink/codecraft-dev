import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is now default in Next.js 16
  turbopack: {},
  // Required for Monaco Editor with Turbopack
  transpilePackages: ['@monaco-editor/react'],
  // Serve Monaco Editor's static files
  async headers() {
    return [
      {
        source: '/_next/static/monaco-editor/min/vs/:path*',
        headers: [
          {
            key: 'cache-control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
