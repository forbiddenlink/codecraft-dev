import "./src/env.ts";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { withAxiom } from 'next-axiom';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Turbopack is now default in Next.js 16
  turbopack: {},
  // Required for Monaco Editor with Turbopack
  transpilePackages: ['@monaco-editor/react'],
  // Serve Monaco Editor's static files and WebContainer security headers
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
      // WebContainer security headers for code runner pages
      // Required for SharedArrayBuffer support
      {
        source: '/playground/:path*',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
      {
        source: '/challenge/:path*',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

// Sentry configuration - only active when DSN is set
const sentryConfig = {
  // Upload source maps for better error traces
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Disable source map upload in development
  disableSourceMapUpload: process.env.NODE_ENV !== "production",

  // Hide source maps from client bundles

  // Automatically tree-shake Sentry logger
  disableLogger: true,

  // Tunnel requests to avoid ad blockers (optional)
  // tunnelRoute: "/monitoring",
};

export default withAxiom(withSentryConfig(nextConfig, sentryConfig));
