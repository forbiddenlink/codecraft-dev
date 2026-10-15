import withBundleAnalyzerInit from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'
import { withAxiom } from 'next-axiom'

const withBundleAnalyzer = withBundleAnalyzerInit({ enabled: process.env.ANALYZE === 'true' })

// Report-only until the console is clean on a real session (playground + challenge pages
// included), then rename the header to Content-Security-Policy. 'unsafe-inline' is needed
// for Next's inline bootstrap scripts and the JSON-LD block; 'unsafe-eval' for Monaco and
// the WebContainer runtime. Monaco loads from jsDelivr (see loader.config in the editor).
const cspReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "connect-src 'self' https://cdn.jsdelivr.net https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://api.axiom.co https://*.webcontainer.io https://*.webcontainer-api.io https://stackblitz.com wss:",
  "frame-src 'self' https://*.webcontainer.io https://*.webcontainer-api.io https://stackblitz.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ')

const nextConfig: NextConfig = {
  // PostHog reverse proxy. Content blockers drop requests to us.i.posthog.com outright,
  // which silently deletes the traffic product decisions are made from; a same-origin
  // path keeps it first-party. PostHog's API paths end in a slash, which is why the
  // trailing-slash redirect has to be off or Next rewrites them away first.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/array/:path*',
        destination: 'https://us-assets.i.posthog.com/array/:path*',
      },
      { source: '/ingest/:path*', destination: 'https://us.i.posthog.com/:path*' },
    ]
  },
  poweredByHeader: false,
  // monaco-editor@0.56.0's package.json "exports" map only resolves subpaths of the
  // form "monaco-editor/<name>.js" -> "esm/vs/<name>.js". y-monaco@0.1.6 imports the
  // pre-exports-map deep path "monaco-editor/esm/vs/editor/editor.api.js" directly,
  // which the exports map re-nests to a non-existent "esm/vs/esm/vs/..." path. Alias
  // the broken specifier to the equivalent one the exports map does resolve.
  turbopack: {
    resolveAlias: {
      'monaco-editor/esm/vs/editor/editor.api.js': 'monaco-editor/editor/editor.api.js',
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'monaco-editor/esm/vs/editor/editor.api.js': require.resolve(
        'monaco-editor/editor/editor.api.js'
      ),
    }
    return config
  },
  // Serve Monaco Editor's static files and WebContainer security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
        ],
      },
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
    ]
  },
}

// Sentry configuration - only active when DSN is set
const sentryConfig = {
  // Upload source maps for better error traces
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Disable source map upload in development
  disableSourceMapUpload: process.env.NODE_ENV !== 'production',

  // Hide source maps from client bundles

  // Automatically tree-shake Sentry logger
  disableLogger: true,

  // Tunnel requests to avoid ad blockers (optional)
  // tunnelRoute: "/monitoring",
}

export default withBundleAnalyzer(withAxiom(withSentryConfig(nextConfig, sentryConfig)))
