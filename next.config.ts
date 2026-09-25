import withBundleAnalyzerInit from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'
import { withAxiom } from 'next-axiom'

const withBundleAnalyzer = withBundleAnalyzerInit({ enabled: process.env.ANALYZE === 'true' })

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
