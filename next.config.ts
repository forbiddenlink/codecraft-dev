import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Only run this on client-side
    if (!isServer) {
      // Handle dynamic imports for Monaco Editor
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },
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
